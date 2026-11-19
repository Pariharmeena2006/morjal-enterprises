import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || ''
  if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.redirect(new URL('/verify-email?result=invalid', request.url))
  const tokenHash = createHash('sha256').update(token).digest('hex')

  try {
    const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } })
    if (!record || record.expiresAt <= new Date()) {
      if (record) await prisma.emailVerificationToken.delete({ where: { id: record.id } })
      return NextResponse.redirect(new URL('/verify-email?result=expired', request.url))
    }
    await prisma.$transaction([
      prisma.customer.update({ where: { id: record.customerId }, data: { emailVerifiedAt: new Date() } }),
      prisma.emailVerificationToken.delete({ where: { id: record.id } }),
      prisma.emailVerificationToken.deleteMany({ where: { customerId: record.customerId } }),
    ])
    return NextResponse.redirect(new URL('/verify-email?result=success', request.url))
  } catch {
    console.error('Customer email verification failed')
    return NextResponse.redirect(new URL('/verify-email?result=error', request.url))
  }
}
