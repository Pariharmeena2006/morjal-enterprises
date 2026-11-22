import { NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const order = await prisma.order.findFirst({
    where: { id: params.id, customerId: session.id },
    include: {
      items: { include: { product: { select: { images: { orderBy: { order: 'asc' }, take: 1 } } } } },
      statusHistory: { orderBy: { createdAt: 'asc' }, select: { id: true, status: true, createdAt: true } },
    },
  })
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  return NextResponse.json(order, { headers: { 'Cache-Control': 'no-store' } })
}
