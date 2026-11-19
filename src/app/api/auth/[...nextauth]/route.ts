import NextAuth from 'next-auth'
import { getAuthOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

let handler: ReturnType<typeof NextAuth> | undefined

function getHandler() {
  if (!handler) handler = NextAuth(getAuthOptions())
  return handler
}

export async function GET(req: Request, ctx: { params: { nextauth: string[] } }) {
  return getHandler()(req as never, ctx)
}

export async function POST(req: Request, ctx: { params: { nextauth: string[] } }) {
  return getHandler()(req as never, ctx)
}
