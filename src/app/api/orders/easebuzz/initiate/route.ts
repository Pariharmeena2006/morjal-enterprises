import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { easebuzzConfig, initiateEasebuzzPayment } from '@/lib/easebuzz'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!easebuzzConfig()) {
      return NextResponse.json({ error: 'Online payments are not configured.' }, { status: 503 })
    }
    const body = await request.json()
    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : ''
    const token = typeof body.trackingToken === 'string' ? body.trackingToken.trim() : ''
    if (!orderNumber || !/^[a-zA-Z0-9-]{32,64}$/.test(token)) {
      return NextResponse.json({ error: 'Invalid order request.' }, { status: 400 })
    }
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        paymentMethod: 'easebuzz',
        paymentStatus: 'pending',
        trackingTokenHash: createHash('sha256').update(token).digest('hex'),
      },
      select: { id: true, orderNumber: true, total: true, customerName: true, customerEmail: true, customerPhone: true, razorpayOrderId: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found or already processed.' }, { status: 404 })
    }
    if (order.razorpayOrderId) {
      return NextResponse.json({ error: 'Payment already initiated for this order.' }, { status: 409 })
    }

    const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin
    const txnid = `MJ${order.orderNumber.replace(/\D/g, '')}${randomBytes(3).toString('hex').toUpperCase()}`.slice(0, 40)
    const result = await initiateEasebuzzPayment({
      txnid,
      amount: order.total,
      productinfo: `MORJAL Order ${order.orderNumber}`,
      firstname: order.customerName,
      email: order.customerEmail || 'guest@morjalenterprises.in',
      phone: order.customerPhone,
      surl: `${origin}/api/orders/easebuzz/callback`,
      furl: `${origin}/checkout?payment=failed&order=${encodeURIComponent(order.orderNumber)}`,
      udf: { udf1: order.orderNumber },
    })
    if (!result) {
      return NextResponse.json({ error: 'Unable to start online payment. Please try again.' }, { status: 502 })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: txnid },
    })
    return NextResponse.json({ paymentUrl: result.paymentUrl, txnid }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Easebuzz initiation failed')
    return NextResponse.json({ error: 'Unable to start online payment.' }, { status: 500 })
  }
}
