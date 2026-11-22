import { createHash, randomInt } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { consumeAuthRateLimit, requestAddress } from '@/lib/auth-rate-limit'
import { isCustomerEmailConfigured, sendCustomerOTPEmail } from '@/lib/customer-email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!isCustomerEmailConfigured()) {
      return NextResponse.json({ error: 'Email delivery is not configured. Please contact support.' }, { status: 503 })
    }

    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    // Rate limit: 5 OTP requests per 15 minutes per email
    const rate = await consumeAuthRateLimit('otp-send', `${requestAddress(request)}:${email}`, 5)
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many OTP requests. Please try again later.' }, { status: 429 })
    }

    // Generate 6-digit OTP
    const otp = randomInt(0, 1_000_000).toString().padStart(6, '0')
    const otpHash = createHash('sha256').update(otp).digest('hex')
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Clean up expired OTPs for this email
    await prisma.customerLoginOTP.deleteMany({
      where: { email, expiresAt: { lt: new Date() } }
    })

    // Create or update OTP record
    const existingOTP = await prisma.customerLoginOTP.findFirst({
      where: { email, verifiedAt: null }
    })

    if (existingOTP) {
      // Update existing OTP
      await prisma.customerLoginOTP.update({
        where: { id: existingOTP.id },
        data: { otpHash, attempts: 0, expiresAt }
      })
    } else {
      // Create new OTP
      await prisma.customerLoginOTP.create({
        data: { email, otpHash, expiresAt }
      })
    }

    // Send OTP email
    const sent = await sendCustomerOTPEmail(email, otp)

    if (!sent) {
      return NextResponse.json({ error: 'Failed to send OTP email. Please try again.' }, { status: 503 })
    }

    return NextResponse.json({ message: 'OTP sent to your email.' }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[OTP Send] Error:', error)
    return NextResponse.json({ error: 'Unable to send OTP. Please try again.' }, { status: 500 })
  }
}
