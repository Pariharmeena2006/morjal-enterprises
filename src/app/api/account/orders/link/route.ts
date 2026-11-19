import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : ''
    const token = typeof body.trackingToken === 'string' ? body.trackingToken.trim() : ''
    if (!orderNumber || !/^[a-zA-Z0-9-]{32,64}$/.test(token)) {
      return NextResponse.json({ error: 'Enter the order number and private tracking code from your guest-order confirmation.' }, { status: 400 })
    }
    const customer = await prisma.customer.findUnique({ where: { id: session.user.id }, select: { id: true, phone: true } })
    if (!customer) return NextResponse.json({ error: 'Customer account not found.' }, { status: 404 })
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const order = await prisma.order.findUnique({ where: { orderNumber }, select: { id: true, customerId: true, customerPhone: true, trackingTokenHash: true } })
    if (!order || order.trackingTokenHash !== tokenHash || order.customerPhone !== customer.phone || (order.customerId && order.customerId !== customer.id)) {
      return NextResponse.json({ error: 'Order ownership could not be verified. No changes were made.' }, { status: 404 })
    }
    if (order.customerId === customer.id) return NextResponse.json({ success: true, alreadyLinked: true })
    const linked = await prisma.order.updateMany({ where: { id: order.id, customerId: null, trackingTokenHash: tokenHash, customerPhone: customer.phone }, data: { customerId: customer.id } })
    if (linked.count !== 1) return NextResponse.json({ error: 'This order could not be linked. Verify that it is not already linked to another account.' }, { status: 409 })
    return NextResponse.json({ success: true, alreadyLinked: false })
  } catch {
    console.error('Guest order linking failed')
    return NextResponse.json({ error: 'Unable to link this order right now.' }, { status: 500 })
  }
}
