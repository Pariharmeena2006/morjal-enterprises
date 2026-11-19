import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getDb } from './prisma'
import service from '../../service.mjs'

/**
 * The admin auth options. Built at request time — never at module scope,
 * because `next build` imports every route module without the runtime
 * environment: the NextAuth secret comes from the service's input.
 */
export function getAuthOptions(): NextAuthOptions {
  return {
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const admin = await getDb().orm.public.Admin.where({ email: credentials.email }).first()

          if (!admin) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
          }
        }
      })
    ],
    session: {
      strategy: 'jwt',
    },
    pages: {
      signIn: '/admin/login',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
        }
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string
        }
        return session
      }
    },
    secret: service.input().nextAuthSecret.expose(),
  }
}
