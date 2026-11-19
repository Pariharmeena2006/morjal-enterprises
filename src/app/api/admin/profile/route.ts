import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await prisma.admin.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true } })
  if (!admin) return NextResponse.json({ error: 'Admin account not found' }, { status: 404 })
  return NextResponse.json(admin, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid name and email address.' }, { status: 400 })
    }
    if (newPassword && (newPassword.length < 12 || !currentPassword)) {
      return NextResponse.json({ error: 'Password changes require the current password and a new password of at least 12 characters.' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { id: session.user.id } })
    if (!admin) return NextResponse.json({ error: 'Admin account not found' }, { status: 404 })
    if (newPassword && !(await bcrypt.compare(currentPassword, admin.password))) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
    }

    const updated = await prisma.admin.update({
      where: { id: admin.id },
      data: {
        name,
        email,
        ...(newPassword ? { password: await bcrypt.hash(newPassword, 12) } : {}),
      },
      select: { id: true, name: true, email: true },
    })
    return NextResponse.json(updated, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Admin profile update failed')
    return NextResponse.json({ error: 'Unable to update admin profile. Check that the email is not already in use.' }, { status: 500 })
  }
}