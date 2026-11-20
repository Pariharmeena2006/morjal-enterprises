import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { consumeAuthRateLimit, requestAddress } from '@/lib/auth-rate-limit'
import { isCustomerEmailConfigured, sendCustomerEmail } from '@/lib/customer-email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const phone = typeof body.phone === 'string' ? body.phone.replace(/\D/g, '') : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[0-9]{10}$/.test(phone) || password.length < 12 || password.length > 128) {
      return NextResponse.json({ error: 'Enter a valid name, email, 10-digit mobile number, and password with at least 12 characters.' }, { status: 400 })
    }

    const rate = await consumeAuthRateLimit('register', `${requestAddress(request)}:${email}`, 5)
    if (!rate.allowed) return NextResponse.json({ error: 'Too many registration attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } })

    const existing = await prisma.customer.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, select: { id: true } })
    if (existing) return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 409 })

    const customer = await prisma.customer.create({
      data: { name, email, phone, password: await bcrypt.hash(password, 12), emailVerifiedAt: new Date() },
      select: { id: true },
    })

    // Auto-verify email for now until email provider is configured
    let verificationEmailSent = false
    if (isCustomerEmailConfigured()) {
      const token = randomBytes(32).toString('hex')
      await prisma.emailVerificationToken.create({
        data: {
          customerId: customer.id,
          tokenHash: createHash('sha256').update(token).digest('hex'),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
      const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin
      verificationEmailSent = await sendCustomerEmail(email, 'Verify your MORJAL account', 'Please verify your email address to activate customer account sign-in.', `${origin}/verify-email?token=${token}`)
    }

    return NextResponse.json({
      success: true,
      verificationRequired: false,
      verificationEmailSent,
      message: 'Account created successfully! You can now sign in.',
    }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Customer registration failed')
    return NextResponse.json({ error: 'Unable to create your account right now.' }, { status: 500 })
  }
}
