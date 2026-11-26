import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : ''
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    const txnid = typeof body.txnid === 'string' ? body.txnid.trim() : ''
    const tokenHash = token && /^[a-zA-Z0-9-]{32,64}$/.test(token) ? createHash('sha256').update(token).digest('hex') : null
    if (!orderNumber || (!tokenHash && !txnid)) {
      return NextResponse.json({ error: 'Order not found or tracking link is invalid.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        OR: [
          ...(tokenHash ? [{ trackingTokenHash: tokenHash }] : []),
          ...(txnid ? [{ razorpayOrderId: txnid }, { phonepeMerchantOrderId: txnid }] : []),
        ],
      },
      select: {
        orderNumber: true,
        orderStatus: true,
        createdAt: true,
        trackingNumber: true,
        courierName: true,
        estimatedDelivery: true,
        customerName: true,
        customerPhone: true,
        address: true,
        city: true,
        state: true,
        pinCode: true,
        landmark: true,
        subtotal: true,
        shippingCharge: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        razorpayOrderId: true,
        items: { select: { productName: true, quantity: true } },
        statusHistory: { orderBy: { createdAt: 'asc' }, select: { status: true, createdAt: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found or tracking link is invalid.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    }

    return NextResponse.json(order, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Order tracking request failed')
    return NextResponse.json({ error: 'Unable to load order tracking right now.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}