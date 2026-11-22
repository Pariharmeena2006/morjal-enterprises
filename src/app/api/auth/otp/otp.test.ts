import { createHash } from 'crypto'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  customerLoginOTP: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  customer: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  authRateLimit: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  sendOTP: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    customerLoginOTP: mocks.customerLoginOTP,
    customer: mocks.customer,
    authRateLimit: mocks.authRateLimit,
  },
}))

vi.mock('@/lib/customer-email', () => ({
  isCustomerEmailConfigured: () => true,
  sendCustomerOTPEmail: mocks.sendOTP,
  sendCustomerEmail: vi.fn(async () => true),
}))

import { POST as sendOTP } from './send/route'
import { POST as verifyOTP } from './verify/route'
import { POST as resendOTP } from './resend/route'
import { POST as logout } from './logout/route'

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')
const EMAIL = 'customer@example.com'

function jsonRequest(path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function otpRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'otp-1',
    customerId: null,
    email: EMAIL,
    otpHash: sha256('123456'),
    attempts: 0,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    verifiedAt: null,
    createdAt: new Date(Date.now() - 60 * 1000),
    ...overrides,
  }
}

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret-key'
})

beforeEach(() => {
  vi.clearAllMocks()
  mocks.authRateLimit.findUnique.mockResolvedValue(null)
  mocks.authRateLimit.create.mockResolvedValue({})
  mocks.authRateLimit.update.mockResolvedValue({ attempts: 1 })
  mocks.sendOTP.mockResolvedValue(true)
  mocks.customerLoginOTP.deleteMany.mockResolvedValue({ count: 0 })
  mocks.customerLoginOTP.update.mockResolvedValue({})
  mocks.customerLoginOTP.delete.mockResolvedValue({})
  mocks.customer.update.mockResolvedValue({})
})

describe('POST /api/auth/otp/send', () => {
  it('rejects invalid email', async () => {
    const res = await sendOTP(jsonRequest('/api/auth/otp/send', { email: 'not-an-email' }))
    expect(res.status).toBe(400)
    expect(mocks.customerLoginOTP.create).not.toHaveBeenCalled()
  })

  it('stores only a hashed OTP and emails the plaintext code', async () => {
    mocks.customerLoginOTP.findFirst.mockResolvedValue(null)
    mocks.customerLoginOTP.create.mockResolvedValue({})

    const res = await sendOTP(jsonRequest('/api/auth/otp/send', { email: EMAIL }))
    expect(res.status).toBe(200)

    const created = mocks.customerLoginOTP.create.mock.calls[0][0].data
    expect(created.email).toBe(EMAIL)
    expect(created.otpHash).toMatch(/^[0-9a-f]{64}$/)
    expect(created.expiresAt.getTime()).toBeGreaterThan(Date.now() + 4 * 60 * 1000)

    expect(mocks.sendOTP).toHaveBeenCalledTimes(1)
    const [to, otp] = mocks.sendOTP.mock.calls[0]
    expect(to).toBe(EMAIL)
    expect(otp).toMatch(/^[0-9]{6}$/)
    expect(created.otpHash).toBe(sha256(otp))
  })

  it('rate limits repeated OTP requests', async () => {
    mocks.authRateLimit.findUnique.mockResolvedValue({
      id: 'rl-1',
      attempts: 5,
      windowStartedAt: new Date(),
    })
    mocks.authRateLimit.update.mockResolvedValue({ attempts: 6 })

    const res = await sendOTP(jsonRequest('/api/auth/otp/send', { email: EMAIL }))
    expect(res.status).toBe(429)
    expect(mocks.sendOTP).not.toHaveBeenCalled()
  })
})

describe('POST /api/auth/otp/verify', () => {
  it('creates a customer on first successful verification and sets a session cookie', async () => {
    mocks.customerLoginOTP.findFirst.mockResolvedValue(otpRecord())
    mocks.customer.findFirst.mockResolvedValue(null)
    mocks.customer.create.mockResolvedValue({ id: 'cust-1', email: EMAIL, name: 'customer' })

    const res = await verifyOTP(jsonRequest('/api/auth/otp/verify', { email: EMAIL, otp: '123456' }))
    expect(res.status).toBe(200)

    expect(mocks.customer.create).toHaveBeenCalledTimes(1)
    expect(mocks.customer.create.mock.calls[0][0].data.password).toBeUndefined()

    const otpUpdate = mocks.customerLoginOTP.update.mock.calls[0][0].data
    expect(otpUpdate.verifiedAt).toBeInstanceOf(Date)
    expect(otpUpdate.customerId).toBe('cust-1')

    const cookie = res.cookies.get('auth-token')
    expect(cookie?.value.split('.')).toHaveLength(3)
    const payload = JSON.parse(Buffer.from(cookie!.value.split('.')[1], 'base64url').toString())
    expect(payload).toMatchObject({ id: 'cust-1', email: EMAIL, role: 'customer' })
  })

  it('logs in an existing customer on repeat verification without creating a new one', async () => {
    mocks.customerLoginOTP.findFirst.mockResolvedValue(otpRecord())
    mocks.customer.findFirst.mockResolvedValue({ id: 'cust-9', email: EMAIL, name: 'Existing' })

    const res = await verifyOTP(jsonRequest('/api/auth/otp/verify', { email: EMAIL, otp: '123456' }))
    expect(res.status).toBe(200)
    expect(mocks.customer.create).not.toHaveBeenCalled()
    expect(mocks.customer.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'cust-9' } })
    )
    const payload = JSON.parse(Buffer.from(res.cookies.get('auth-token')!.value.split('.')[1], 'base64url').toString())
    expect(payload.id).toBe('cust-9')
  })

  it('rejects an expired OTP and deletes it', async () => {
    mocks.customerLoginOTP.findFirst.mockResolvedValue(
      otpRecord({ expiresAt: new Date(Date.now() - 1000) })
    )
    const res = await verifyOTP(jsonRequest('/api/auth/otp/verify', { email: EMAIL, otp: '123456' }))
    expect(res.status).toBe(400)
    expect(mocks.customerLoginOTP.delete).toHaveBeenCalledWith({ where: { id: 'otp-1' } })
    expect(mocks.customer.create).not.toHaveBeenCalled()
  })

  it('locks out after 5 failed attempts', async () => {
    mocks.customerLoginOTP.findFirst.mockResolvedValue(otpRecord({ attempts: 5 }))
    const res = await verifyOTP(jsonRequest('/api/auth/otp/verify', { email: EMAIL, otp: '123456' }))
    expect(res.status).toBe(400)
    expect(mocks.customerLoginOTP.delete).toHaveBeenCalled()
  })

  it('increments attempts on a wrong OTP', async () => {
    mocks.customerLoginOTP.findFirst.mockResolvedValue(otpRecord())
    const res = await verifyOTP(jsonRequest('/api/auth/otp/verify', { email: EMAIL, otp: '999999' }))
    expect(res.status).toBe(400)
    expect(mocks.customerLoginOTP.update).toHaveBeenCalledWith({
      where: { id: 'otp-1' },
      data: { attempts: { increment: 1 } },
    })
    expect(mocks.customer.findFirst).not.toHaveBeenCalled()
  })

  it('prevents replay: a verified OTP cannot be used again', async () => {
    // First verify succeeds
    mocks.customerLoginOTP.findFirst.mockResolvedValueOnce(otpRecord())
    mocks.customer.findFirst.mockResolvedValue({ id: 'cust-9', email: EMAIL, name: 'Existing' })
    const first = await verifyOTP(jsonRequest('/api/auth/otp/verify', { email: EMAIL, otp: '123456' }))
    expect(first.status).toBe(200)

    // Second verify: no unverified OTP remains
    mocks.customerLoginOTP.findFirst.mockResolvedValueOnce(null)
    const second = await verifyOTP(jsonRequest('/api/auth/otp/verify', { email: EMAIL, otp: '123456' }))
    expect(second.status).toBe(400)
    expect(mocks.customer.create).not.toHaveBeenCalled()
  })

  it('rate limits verification attempts', async () => {
    mocks.authRateLimit.findUnique.mockResolvedValue({
      id: 'rl-2',
      attempts: 10,
      windowStartedAt: new Date(),
    })
    mocks.authRateLimit.update.mockResolvedValue({ attempts: 11 })
    const res = await verifyOTP(jsonRequest('/api/auth/otp/verify', { email: EMAIL, otp: '123456' }))
    expect(res.status).toBe(429)
    expect(mocks.customerLoginOTP.findFirst).not.toHaveBeenCalled()
  })

  it('rejects malformed input', async () => {
    const res = await verifyOTP(jsonRequest('/api/auth/otp/verify', { email: EMAIL, otp: '12ab' }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/otp/resend', () => {
  it('issues a fresh OTP after the cooldown', async () => {
    mocks.customerLoginOTP.findFirst.mockResolvedValue(otpRecord())
    const res = await resendOTP(jsonRequest('/api/auth/otp/resend', { email: EMAIL }))
    expect(res.status).toBe(200)
    const update = mocks.customerLoginOTP.update.mock.calls[0][0].data
    expect(update.attempts).toBe(0)
    expect(mocks.sendOTP).toHaveBeenCalledTimes(1)
  })

  it('enforces the 30 second resend cooldown', async () => {
    mocks.customerLoginOTP.findFirst.mockResolvedValue(
      otpRecord({ createdAt: new Date() })
    )
    const res = await resendOTP(jsonRequest('/api/auth/otp/resend', { email: EMAIL }))
    expect(res.status).toBe(429)
    expect(mocks.sendOTP).not.toHaveBeenCalled()
  })

  it('fails when there is no active OTP', async () => {
    mocks.customerLoginOTP.findFirst.mockResolvedValue(null)
    const res = await resendOTP(jsonRequest('/api/auth/otp/resend', { email: EMAIL }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/otp/logout', () => {
  it('clears the session cookie', async () => {
    const res = await logout()
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie')).toContain('auth-token=')
  })
})
