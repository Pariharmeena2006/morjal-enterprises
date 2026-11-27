import { NextRequest, NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { consumeAuthRateLimit, requestAddress } from '@/lib/auth-rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const accountType = body.accountType === 'customer' ? 'customer' : 'admin'

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const rate = await consumeAuthRateLimit('login', `${requestAddress(request)}:${email}`, 10)
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 })
    }

    if (accountType === 'customer') {
      const customer = await prisma.customer.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
      })
      if (!customer || !customer.password) {
        return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 })
      }
      if (!(await bcrypt.compare(password, customer.password))) {
        return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 })
      }
      const secret = process.env.NEXTAUTH_SECRET
      if (!secret) {
        return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 503 })
      }
      const token = sign(
        { id: customer.id, email: customer.email, role: 'customer' },
        secret,
        { expiresIn: '30d' }
      )
      const response = NextResponse.json({ success: true, customer: { id: customer.id, email: customer.email, name: customer.name } }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      })
      return response
    }

    const admin = await prisma.admin.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    })
    if (!admin) {
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 })
    }
    let passwordValid = await bcrypt.compare(password, admin.password)
    // Migrate legacy plaintext passwords to bcrypt on successful login
    if (!passwordValid && !admin.password.startsWith('$2') && admin.password === password) {
      passwordValid = true
      const hashed = await bcrypt.hash(password, 12)
      await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed } }).catch(() => {})
    }
    if (!passwordValid) {
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 })
    }
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 503 })
    }
    const token = sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      secret,
      { expiresIn: '30d' }
    )
    const response = NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email, name: admin.name } }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
    response.cookies.set('admin-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    })
    return response
  } catch (error) {
    console.error('[Login] Error:', error)
    return NextResponse.json({ error: 'Unable to sign in. Please try again.' }, { status: 500 })
  }
}
