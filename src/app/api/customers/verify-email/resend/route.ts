import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { consumeAuthRateLimit, requestAddress } from '@/lib/auth-rate-limit'
import { isCustomerEmailConfigured, sendCustomerEmail } from '@/lib/customer-email'

export async function POST(request: NextRequest) {
  try {
    if (!isCustomerEmailConfigured()) return NextResponse.json({ error: 'Email verification is not configured. The account can sign in without verification for now.' }, { status: 503 })
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    const rate = await consumeAuthRateLimit('verify-email', `${requestAddress(request)}:${email}`, 4)
    if (!rate.allowed) return NextResponse.json({ error: 'Too many verification requests. Try again later.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } })
    const customer = await prisma.customer.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, select: { id: true, email: true, emailVerifiedAt: true } })
    if (customer && !customer.emailVerifiedAt) {
      await prisma.emailVerificationToken.deleteMany({ where: { customerId: customer.id } })
      const token = randomBytes(32).toString('hex')
      await prisma.emailVerificationToken.create({ data: { customerId: customer.id, tokenHash: createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
      const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin
      if (!(await sendCustomerEmail(customer.email, 'Verify your MORJAL account', 'Please verify your email address to activate customer account sign-in.', `${origin}/verify-email?token=${token}`))) {
        return NextResponse.json({ error: 'Verification email could not be delivered. Try again later.' }, { status: 503 })
      }
    }
    return NextResponse.json({ message: 'If this address has an unverified MORJAL account, a verification link has been sent.' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Verification email resend failed')
    return NextResponse.json({ error: 'Unable to send a verification link right now.' }, { status: 500 })
  }
}
