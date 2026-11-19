import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getCustomerSession } from '@/lib/customer-auth'
import { consumeAuthRateLimit, requestAddress } from '@/lib/auth-rate-limit'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const rate = await consumeAuthRateLimit('change-password', `${requestAddress(request)}:${session.user.id}`, 5)
    if (!rate.allowed) return NextResponse.json({ error: 'Too many password changes. Try again later.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } })
    const body = await request.json()
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
    if (newPassword.length < 12 || newPassword.length > 128 || !currentPassword) {
      return NextResponse.json({ error: 'Enter your current password and a new password with at least 12 characters.' }, { status: 400 })
    }
    const customer = await prisma.customer.findUnique({ where: { id: session.user.id }, select: { password: true } })
    if (!customer || !(await bcrypt.compare(currentPassword, customer.password))) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
    }
    await prisma.customer.update({ where: { id: session.user.id }, data: { password: await bcrypt.hash(newPassword, 12) } })
    return NextResponse.json({ success: true })
  } catch {
    console.error('Customer password change failed')
    return NextResponse.json({ error: 'Unable to change your password right now.' }, { status: 500 })
  }
}
