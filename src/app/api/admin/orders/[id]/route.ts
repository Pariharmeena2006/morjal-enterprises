import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const orderStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery', 'delivered', 'cancelled', 'returned']
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
      include: {
        items: { include: { product: { select: { images: { orderBy: { order: 'asc' }, take: 1 } } } } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}
    const current = await prisma.order.findUnique({
      where: { id: params.id },
      select: { id: true, orderStatus: true, paymentMethod: true, paymentStatus: true },
    })
    if (!current) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

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
      if (body.paymentStatus === 'paid' && current.paymentMethod.toLowerCase() === 'cod' && body.confirmCodCollected !== true) {
        return NextResponse.json({ error: 'Confirm that COD payment was collected before marking this order paid.' }, { status: 400 })
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

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: params.id },
        data,
      })
      if (body.orderStatus !== undefined && body.orderStatus !== current.orderStatus) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: params.id,
            status: String(body.orderStatus),
            note: typeof body.statusNote === 'string' ? body.statusNote.trim().slice(0, 300) || null : null,
            changedByAdminId: session.user?.id || null,
          },
        })
      }
      return tx.order.findUniqueOrThrow({
        where: { id: updated.id },
        include: {
          items: { include: { product: { select: { images: { orderBy: { order: 'asc' }, take: 1 } } } } },
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      })
    })
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order')
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
