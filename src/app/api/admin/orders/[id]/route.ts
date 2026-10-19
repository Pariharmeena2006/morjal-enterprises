import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded']

async function requireAdmin() {
  return Boolean(await getServerSession(authOptions))
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    })
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
    const data: Record<string, unknown> = {}

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

    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: { items: true },
    })
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
