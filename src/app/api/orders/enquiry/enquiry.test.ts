import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  order: { findUnique: vi.fn(), create: vi.fn() },
  product: { findMany: vi.fn() },
  websiteSettings: { findFirst: vi.fn() },
  authRateLimit: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  getWhatsAppNumber: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: mocks.order,
    product: mocks.product,
    websiteSettings: mocks.websiteSettings,
    authRateLimit: mocks.authRateLimit,
  },
}))

vi.mock('@/lib/whatsapp', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/whatsapp')>()
  return { ...original, getWhatsAppNumber: mocks.getWhatsAppNumber }
})

import { POST as createEnquiry } from './route'

const VALID_BODY = {
  fullName: 'Rahul Sharma',
  phone: '9876543210',
  email: '',
  address: '12, MG Road, Kaprain',
  city: 'Bundi',
  state: 'Rajasthan',
  pinCode: '323001',
  landmark: '',
  orderNotes: '',
  paymentMethod: 'cod',
  items: [{ productId: 'prod-1', quantity: 2 }],
}

function product(overrides: Record<string, unknown> = {}) {
  return {
    id: 'prod-1',
    name: 'Electrical Safety Gloves',
    sellingPrice: 500,
    stockQuantity: 20,
    isOutOfStock: false,
    isPublished: true,
    images: [],
    ...overrides,
  }
}

function jsonRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/orders/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
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
  mocks.product.findMany.mockResolvedValue([product()])
  mocks.websiteSettings.findFirst.mockResolvedValue({ freeShippingThreshold: 1000, codEnabled: true })
  mocks.getWhatsAppNumber.mockResolvedValue('919876543210')
  mocks.order.findUnique.mockResolvedValue(null)
  mocks.order.create.mockImplementation(async ({ data }: { data: { orderNumber: string; total: number } }) => ({
    id: 'order-1',
    orderNumber: data.orderNumber,
    total: data.total,
  }))
})

describe('POST /api/orders/enquiry', () => {
  it('creates a guest enquiry with server-side pricing and WhatsApp URL', async () => {
    const res = await createEnquiry(jsonRequest(VALID_BODY))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.orderNumber).toMatch(/^MOR-/)
    expect(data.whatsappUrl).toContain('https://wa.me/919876543210?text=')
    expect(decodeURIComponent(data.whatsappUrl)).toContain('NEW ORDER ENQUIRY')
    expect(decodeURIComponent(data.whatsappUrl)).toContain('Electrical Safety Gloves')
    expect(decodeURIComponent(data.whatsappUrl)).toContain('Quantity: 2')

    const created = mocks.order.create.mock.calls[0][0].data
    expect(created.orderStatus).toBe('enquiry')
    expect(created.paymentStatus).toBe('pending')
    expect(created.customerId).toBeUndefined()
    expect(created.subtotal).toBe(1000)
    expect(created.shippingCharge).toBe(0) // free shipping threshold met
    expect(created.total).toBe(1000)
  })

  it('does not trust client prices', async () => {
    const res = await createEnquiry(jsonRequest({
      ...VALID_BODY,
      items: [{ productId: 'prod-1', quantity: 1, price: 1 }],
    }))
    expect(res.status).toBe(201)
    const created = mocks.order.create.mock.calls[0][0].data
    expect(created.subtotal).toBe(500)
  })

  it('rejects invalid Indian mobile numbers', async () => {
    for (const phone of ['12345', '1234567890', '987654321', 'abcdefghij']) {
      const res = await createEnquiry(jsonRequest({ ...VALID_BODY, phone }))
      expect(res.status).toBe(400)
    }
    expect(mocks.order.create).not.toHaveBeenCalled()
  })

  it('rejects invalid pincode', async () => {
    const res = await createEnquiry(jsonRequest({ ...VALID_BODY, pinCode: '12345' }))
    expect(res.status).toBe(400)
  })

  it('rejects empty cart and invalid quantities', async () => {
    expect((await createEnquiry(jsonRequest({ ...VALID_BODY, items: [] }))).status).toBe(400)
    expect((await createEnquiry(jsonRequest({ ...VALID_BODY, items: [{ productId: 'prod-1', quantity: 0 }] }))).status).toBe(400)
    expect((await createEnquiry(jsonRequest({ ...VALID_BODY, items: [{ productId: 'prod-1', quantity: 11 }] }))).status).toBe(400)
  })

  it('rejects unpublished or out-of-stock products', async () => {
    mocks.product.findMany.mockResolvedValue([product({ isOutOfStock: true })])
    const res = await createEnquiry(jsonRequest(VALID_BODY))
    expect(res.status).toBe(409)
    expect(mocks.order.create).not.toHaveBeenCalled()
  })

  it('deduplicates via Idempotency-Key', async () => {
    mocks.order.findUnique.mockResolvedValue({ id: 'order-1', orderNumber: 'MOR-1', total: 1000 })
    const key = 'a'.repeat(36)
    const res = await createEnquiry(jsonRequest(VALID_BODY, { 'Idempotency-Key': key }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.duplicate).toBe(true)
    expect(mocks.order.create).not.toHaveBeenCalled()
  })

  it('rate limits enquiry spam', async () => {
    mocks.authRateLimit.findUnique.mockResolvedValue({ id: 'rl-1', attempts: 8, windowStartedAt: new Date() })
    mocks.authRateLimit.update.mockResolvedValue({ attempts: 9 })
    const res = await createEnquiry(jsonRequest(VALID_BODY))
    expect(res.status).toBe(429)
  })

  it('still saves the enquiry when WhatsApp is not configured', async () => {
    mocks.getWhatsAppNumber.mockResolvedValue('')
    const res = await createEnquiry(jsonRequest(VALID_BODY))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.whatsappUrl).toBeNull()
    expect(data.whatsappConfigured).toBe(false)
  })
})
