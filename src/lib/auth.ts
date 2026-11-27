import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { consumeAuthRateLimit, requestAddress } from './auth-rate-limit'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        accountType: { label: 'Account type', type: 'text' },
      },
      async authorize(credentials, request) {
        // TEMP DIAGNOSTIC — remove after admin login issue is resolved
        const diag = (stage: string, detail = '') =>
          console.log(`[ADMIN_AUTH] ${stage}${detail ? ` — ${detail}` : ''}`)
        try {
          diag('Login request received')
          const email = credentials?.email?.trim()
          const password = credentials?.password
          if (!email || !password) {
            diag('Credentials validated — missing fields')
            return null
          }
          diag('Credentials validated')

          const accountType = credentials?.accountType === 'customer' ? 'customer' : 'admin'
          const limit = await consumeAuthRateLimit('login', `${requestAddress(request)}:${email.toLowerCase()}`, 10)
          if (!limit.allowed) {
            diag('Rate limit blocked')
            return null
          }
          diag('Rate limit allowed')

          if (accountType === 'customer') {
            const customer = await prisma.customer.findFirst({
              where: { email: { equals: email, mode: 'insensitive' } },
            })
            if (!customer || !customer.password) return null
            if (!(await bcrypt.compare(password, customer.password))) return null
            diag('Authorization success (customer)')
            return { id: customer.id, email: customer.email, name: customer.name, role: 'customer' as const }
          }

          const admin = await prisma.admin.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
          })

          if (!admin) {
            diag('Admin record not found')
            return null
          }
          diag('Admin record found')

          // Legacy plaintext passwords (e.g. set via Prisma Studio) are migrated
          // to bcrypt on the next successful login.
          let storedPassword = admin.password
          let isPasswordValid = await bcrypt.compare(password, storedPassword)
          diag(`Bcrypt match ${isPasswordValid}`)
          if (!isPasswordValid && !storedPassword.startsWith('$2')) {
            isPasswordValid = storedPassword === password
            if (isPasswordValid) {
              const hashed = await bcrypt.hash(password, 12)
              await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed } })
                .catch(() => {})
            }
          }

          if (!isPasswordValid) {
            diag('Password hash invalid')
            return null
          }
          diag('Authorization success (admin)')

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'admin' as const,
          }
        } catch (error) {
          const category = error instanceof Error ? error.name : 'UnknownError'
          diag('Exception', category)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'admin' | 'customer'
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
