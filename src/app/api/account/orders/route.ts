import { NextRequest, NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const activeStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery']

export async function GET(request: NextRequest) {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const filter = request.nextUrl.searchParams.get('status')
  const statusWhere = filter === 'active'
    ? { orderStatus: { in: activeStatuses } }
    : filter === 'delivered'
      ? { orderStatus: 'delivered' }
      : filter === 'cancelled'
        ? { orderStatus: { in: ['cancelled', 'returned'] } }
        : {}

  const orders = await prisma.order.findMany({
    where: { customerId: session.id, ...statusWhere },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      orderStatus: true,
      trackingNumber: true,
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          product: { select: { images: { orderBy: { order: 'asc' }, take: 1 } } },
        },
      },
    },
  })
  return NextResponse.json(orders, { headers: { 'Cache-Control': 'no-store' } })
}
