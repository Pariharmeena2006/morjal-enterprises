import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getAdminSession() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'admin' ? session : null
}
