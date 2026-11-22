import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

export interface CustomerUser {
  id: string
  email: string
  name: string
  role: 'customer'
}

const secret = () => {
  const value = process.env.NEXTAUTH_SECRET
  if (!value) throw new Error('NEXTAUTH_SECRET is not configured')
  return value
}

async function sessionFromAuthToken(): Promise<CustomerUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null

  let decoded: Partial<CustomerUser>
  try {
    decoded = verify(token, secret()) as Partial<CustomerUser>
  } catch {
    return null
  }
  if (!decoded?.id || decoded.role !== 'customer') return null

  const customer = await prisma.customer.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true },
  })
  if (!customer) return null

  return { id: customer.id, email: customer.email, name: customer.name, role: 'customer' }
}

export async function getCustomerSession(): Promise<CustomerUser | null> {
  try {
    const tokenSession = await sessionFromAuthToken()
    if (tokenSession) return tokenSession
  } catch {
    // Missing secret or DB error: fall through to next-auth session.
  }

  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role === 'customer') {
      const customer = await prisma.customer.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true },
      })
      if (customer) return { id: customer.id, email: customer.email, name: customer.name, role: 'customer' }
    }
  } catch {
    return null
  }
  return null
}
