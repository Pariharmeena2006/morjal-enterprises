import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  getCustomerSession: vi.fn(),
  order: { findMany: vi.fn(), findFirst: vi.fn() },
}))

vi.mock('@/lib/customer-auth', () => ({
  getCustomerSession: mocks.getCustomerSession,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { order: mocks.order },
}))

import { GET as listOrders } from './route'
import { GET as getOrder } from './[id]/route'

const SESSION = { id: 'cust-1', email: 'customer@example.com', name: 'Customer', role: 'customer' as const }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/account/orders', () => {
  it('returns 401 without a customer session', async () => {
    mocks.getCustomerSession.mockResolvedValue(null)
    const res = await listOrders(new NextRequest('http://localhost/api/account/orders'))
    expect(res.status).toBe(401)
    expect(mocks.order.findMany).not.toHaveBeenCalled()
  })

  it('returns only orders belonging to the authenticated customer', async () => {
    mocks.getCustomerSession.mockResolvedValue(SESSION)
    mocks.order.findMany.mockResolvedValue([])
    const res = await listOrders(new NextRequest('http://localhost/api/account/orders'))
    expect(res.status).toBe(200)
    expect(mocks.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ customerId: 'cust-1' }) })
    )
  })
})

describe('GET /api/account/orders/[id]', () => {
  const params = { params: { id: 'order-1' } }

  it('returns 401 without a customer session', async () => {
    mocks.getCustomerSession.mockResolvedValue(null)
    const res = await getOrder(new Request('http://localhost/api/account/orders/order-1'), params)
    expect(res.status).toBe(401)
    expect(mocks.order.findFirst).not.toHaveBeenCalled()
  })

  it('scopes the lookup to the authenticated customer', async () => {
    mocks.getCustomerSession.mockResolvedValue(SESSION)
    mocks.order.findFirst.mockResolvedValue(null)
    const res = await getOrder(new Request('http://localhost/api/account/orders/order-1'), params)
    expect(res.status).toBe(404)
    expect(mocks.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'order-1', customerId: 'cust-1' } })
    )
  })

  it('returns the order when it belongs to the customer', async () => {
    mocks.getCustomerSession.mockResolvedValue(SESSION)
    mocks.order.findFirst.mockResolvedValue({ id: 'order-1', orderNumber: 'MJ123' })
    const res = await getOrder(new Request('http://localhost/api/account/orders/order-1'), params)
    expect(res.status).toBe(200)
    expect((await res.json()).orderNumber).toBe('MJ123')
  })
})
