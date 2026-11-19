import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (pathname.startsWith('/api/admin/') || pathname === '/api/upload') {
    if (token?.role === 'admin') return NextResponse.next()
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (pathname.startsWith('/api/account/')) {
    if (token?.role === 'customer') return NextResponse.next()
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (token?.role === 'admin') return NextResponse.next()
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/account' || pathname.startsWith('/account/')) {
    if (token?.role === 'customer') return NextResponse.next()
    if (token?.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/api/admin/:path*', '/api/account/:path*', '/api/upload'],
}