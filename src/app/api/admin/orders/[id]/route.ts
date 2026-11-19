import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/auth'
import { getDb } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded']

async function requireAdmin() {
  return Boolean(await getServerSession(getAuthOptions()))
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const order = await getDb().orm.public.Order.include('items').first({ id: params.id })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data: {
      orderStatus?: string
      paymentStatus?: string
      trackingNumber?: string | null
      courierName?: string | null
      shipmentId?: string | null
      estimatedDelivery?: Date | null
    } = {}

    if (body.orderStatus !== undefined) {
      if (!orderStatuses.includes(body.orderStatus)) {
        return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
      }
      data.orderStatus = body.orderStatus
    }
    if (body.paymentStatus !== undefined) {
      if (!paymentStatuses.includes(body.paymentStatus)) {
        return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
      }
      data.paymentStatus = body.paymentStatus
    }
    for (const field of ['trackingNumber', 'courierName', 'shipmentId'] as const) {
      if (body[field] !== undefined) data[field] = String(body[field]).trim() || null
    }
    if (body.estimatedDelivery !== undefined) {
      const date = body.estimatedDelivery ? new Date(body.estimatedDelivery) : null
      if (date && Number.isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Invalid estimated delivery date' }, { status: 400 })
      }
      data.estimatedDelivery = date
    }
    if (!Object.keys(data).length) {
      return NextResponse.json({ error: 'No valid fields supplied' }, { status: 400 })
    }

    const db = getDb()
    await db.orm.public.Order.where({ id: params.id }).update(data)
    const order = await db.orm.public.Order.include('items').first({ id: params.id })
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
