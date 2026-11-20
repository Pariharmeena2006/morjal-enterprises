import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { consumeAuthRateLimit, requestAddress } from './auth-rate-limit'
import { isCustomerEmailConfigured } from './customer-email'

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
        const email = credentials?.email?.trim()
        const password = credentials?.password
        if (!email || !password) {
          return null
        }

        const accountType = credentials?.accountType === 'customer' ? 'customer' : 'admin'
        const limit = await consumeAuthRateLimit('login', `${requestAddress(request)}:${email.toLowerCase()}`, 10)
        if (!limit.allowed) return null

        if (accountType === 'customer') {
          const customer = await prisma.customer.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
          })
          if (!customer || (isCustomerEmailConfigured() && !customer.emailVerifiedAt)) return null
          if (!(await bcrypt.compare(password, customer.password))) return null
          return { id: customer.id, email: customer.email, name: customer.name, role: 'customer' as const }
        }

        const admin = await prisma.admin.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
        })

        if (!admin) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          admin.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin' as const,
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
