import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { consumeAuthRateLimit, requestAddress } from '@/lib/auth-rate-limit'
import { sign } from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const otp = typeof body.otp === 'string' ? body.otp.trim() : ''

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[0-9]{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Invalid email or OTP.' }, { status: 400 })
    }

    // Rate limit: 10 verification attempts per 15 minutes per email
    const rate = await consumeAuthRateLimit('otp-verify', `${requestAddress(request)}:${email}`, 10)
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many verification attempts. Please try again later.' }, { status: 429 })
    }

    // Find unverified OTP
    const otpRecord = await prisma.customerLoginOTP.findFirst({
      where: { email, verifiedAt: null }
    })

    if (!otpRecord) {
      return NextResponse.json({ error: 'OTP expired or invalid. Please request a new OTP.' }, { status: 400 })
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await prisma.customerLoginOTP.delete({ where: { id: otpRecord.id } })
      return NextResponse.json({ error: 'OTP expired. Please request a new OTP.' }, { status: 400 })
    }

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
      await prisma.customerLoginOTP.delete({ where: { id: otpRecord.id } })
      return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 400 })
    }

    // Verify OTP hash
    const otpHash = createHash('sha256').update(otp).digest('hex')
    if (otpRecord.otpHash !== otpHash) {
      // Increment attempts
      await prisma.customerLoginOTP.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } }
      })
      const remainingAttempts = 5 - otpRecord.attempts - 1
      return NextResponse.json({ error: `Invalid OTP. ${remainingAttempts} attempts remaining.` }, { status: 400 })
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    })

    if (!customer) {
      // Create new customer without password
      customer = await prisma.customer.create({
        data: { email, name: email.split('@')[0], emailVerifiedAt: new Date() }
      })
    } else {
      // Update email verified timestamp
      await prisma.customer.update({
        where: { id: customer.id },
        data: { emailVerifiedAt: new Date() }
      })
    }

    // Mark OTP as verified (single-use) and link it to the customer
    await prisma.customerLoginOTP.update({
      where: { id: otpRecord.id },
      data: { verifiedAt: new Date(), customerId: customer.id }
    })

    // Create JWT token
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 503 })
    }
    const token = sign(
      { id: customer.id, email: customer.email, role: 'customer' },
      secret,
      { expiresIn: '30d' }
    )

    // Set HttpOnly cookie
    const response = NextResponse.json({ success: true, customer: { id: customer.id, email: customer.email, name: customer.name } }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('[OTP Verify] Error:', error)
    return NextResponse.json({ error: 'Unable to verify OTP. Please try again.' }, { status: 500 })
  }
}
