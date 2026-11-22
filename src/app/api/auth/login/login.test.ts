import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  customer: { findFirst: vi.fn() },
  admin: { findFirst: vi.fn() },
  authRateLimit: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    customer: mocks.customer,
    admin: mocks.admin,
    authRateLimit: mocks.authRateLimit,
  },
}))

import { POST as login } from './route'

const EMAIL = 'customer@example.com'

function jsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret-key'
})

beforeEach(() => {
  vi.clearAllMocks()
  mocks.authRateLimit.findUnique.mockResolvedValue(null)
  mocks.authRateLimit.create.mockResolvedValue({})
  mocks.authRateLimit.update.mockResolvedValue({ attempts: 1 })
})

describe('POST /api/auth/login', () => {
  it('rejects customers without a password (OTP-only accounts)', async () => {
    mocks.customer.findFirst.mockResolvedValue({ id: 'c1', email: EMAIL, name: 'OTP User', password: null })
    const res = await login(jsonRequest({ email: EMAIL, password: 'whatever-password', accountType: 'customer' }))
    expect(res.status).toBe(401)
  })

  it('rejects a wrong password', async () => {
    mocks.customer.findFirst.mockResolvedValue({
      id: 'c1',
      email: EMAIL,
      name: 'Customer',
      password: await bcrypt.hash('correct-password', 10),
    })
    const res = await login(jsonRequest({ email: EMAIL, password: 'wrong-password', accountType: 'customer' }))
    expect(res.status).toBe(401)
    expect(res.cookies.get('auth-token')).toBeUndefined()
  })

  it('logs in a password customer and sets an HttpOnly session cookie', async () => {
    mocks.customer.findFirst.mockResolvedValue({
      id: 'c1',
      email: EMAIL,
      name: 'Customer',
      password: await bcrypt.hash('correct-password', 10),
    })
    const res = await login(jsonRequest({ email: EMAIL, password: 'correct-password', accountType: 'customer' }))
    expect(res.status).toBe(200)
    const cookie = res.cookies.get('auth-token')
    expect(cookie?.httpOnly).toBe(true)
    expect(cookie?.value.split('.')).toHaveLength(3)
  })

  it('logs in an admin without touching customer records', async () => {
    mocks.admin.findFirst.mockResolvedValue({
      id: 'a1',
      email: 'admin@example.com',
      name: 'Admin',
      password: await bcrypt.hash('admin-password', 10),
    })
    const res = await login(jsonRequest({ email: 'admin@example.com', password: 'admin-password', accountType: 'admin' }))
    expect(res.status).toBe(200)
    expect(res.cookies.get('admin-auth-token')?.value.split('.')).toHaveLength(3)
    expect(mocks.customer.findFirst).not.toHaveBeenCalled()
  })

  it('rate limits repeated failures', async () => {
    mocks.authRateLimit.findUnique.mockResolvedValue({
      id: 'rl-1',
      attempts: 10,
      windowStartedAt: new Date(),
    })
    mocks.authRateLimit.update.mockResolvedValue({ attempts: 11 })
    const res = await login(jsonRequest({ email: EMAIL, password: 'x', accountType: 'customer' }))
    expect(res.status).toBe(429)
  })
})
