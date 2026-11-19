import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { consumeAuthRateLimit, requestAddress } from '@/lib/auth-rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = typeof body.token === 'string' ? body.token : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (!/^[a-f0-9]{64}$/.test(token) || password.length < 12 || password.length > 128) {
      return NextResponse.json({ error: 'Use a valid reset link and a password of at least 12 characters.' }, { status: 400 })
    }
    const rate = await consumeAuthRateLimit('reset-password', requestAddress(request), 10)
    if (!rate.allowed) return NextResponse.json({ error: 'Too many reset attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } })

    const tokenHash = createHash('sha256').update(token).digest('hex')
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })
    if (!record || record.expiresAt <= new Date()) {
      if (record) await prisma.passwordResetToken.delete({ where: { id: record.id } })
      return NextResponse.json({ error: 'This password reset link is invalid or expired. Request a new one.' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.customer.update({ where: { id: record.customerId }, data: { password: await bcrypt.hash(password, 12) } }),
      prisma.passwordResetToken.deleteMany({ where: { customerId: record.customerId } }),
    ])
    return NextResponse.json({ success: true })
  } catch {
    console.error('Customer password reset failed')
    return NextResponse.json({ error: 'Unable to reset the password right now.' }, { status: 500 })
  }
}
