import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function verifyCustomerToken(token: string, secret: string) {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
    if (!encodedHeader || !encodedPayload || !encodedSignature) return false

    const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedHeader)))
    if (header.alg !== 'HS256') return false

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    )
    if (!valid) return false

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload)))
    if (payload.role !== 'customer' || typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) return false
    return true
  } catch {
    return false
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  const isHttps = request.nextUrl.protocol === 'https:'
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, secureCookie: isHttps })
  // TEMP DIAGNOSTIC — remove after admin login issue is resolved
  console.log(`[ADMIN_AUTH] Middleware ${pathname} — token role:`, token?.role ?? 'none')
  if (pathname.startsWith('/api/admin/') || pathname === '/api/upload') {
    if (token?.role === 'admin') return NextResponse.next()
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isCustomerArea = pathname.startsWith('/api/account/') || pathname === '/account' || pathname.startsWith('/account/')
  if (isCustomerArea) {
    if (token?.role === 'customer') return NextResponse.next()
    const authToken = request.cookies.get('auth-token')?.value
    const secret = process.env.NEXTAUTH_SECRET
    if (authToken && secret && (await verifyCustomerToken(authToken, secret))) {
      return NextResponse.next()
    }
    if (pathname.startsWith('/api/account/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (token?.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    const loginUrl = new URL('/login-otp', request.url)
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (token?.role === 'admin') return NextResponse.next()
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/api/admin/:path*', '/api/account/:path*', '/api/upload'],
}
