import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { consumeAuthRateLimit, requestAddress } from '@/lib/auth-rate-limit'
import { isCustomerEmailConfigured, sendCustomerEmail } from '@/lib/customer-email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!isCustomerEmailConfigured()) {
      return NextResponse.json({ error: 'Password reset email is unavailable because email delivery is not configured. Contact the store administrator.' }, { status: 503 })
    }
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })

    const rate = await consumeAuthRateLimit('forgot-password', `${requestAddress(request)}:${email}`, 5)
    if (!rate.allowed) return NextResponse.json({ error: 'Too many reset attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } })

    const customer = await prisma.customer.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, select: { id: true, email: true } })
    if (customer) {
      await prisma.passwordResetToken.deleteMany({ where: { customerId: customer.id } })
      const token = randomBytes(32).toString('hex')
      await prisma.passwordResetToken.create({
        data: { customerId: customer.id, tokenHash: createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
      })
      const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin
      const sent = await sendCustomerEmail(customer.email, 'Reset your MORJAL password', 'A password reset was requested for your MORJAL account. This link expires in 30 minutes.', `${origin}/reset-password?token=${token}`)
      if (!sent) return NextResponse.json({ error: 'Password reset email could not be delivered. Try again later.' }, { status: 503 })
    }

    return NextResponse.json({ message: 'If an account exists for that email, a password reset link has been sent.' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Customer password reset request failed')
    return NextResponse.json({ error: 'Unable to process the password reset request right now.' }, { status: 500 })
  }
}
