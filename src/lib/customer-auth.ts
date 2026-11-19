import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getCustomerSession() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'customer' ? session : null
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'admin' ? session : null
}
