import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPhonePeConfig, initiatePhonePePayment } from '@/lib/phonepe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!(await getPhonePeConfig())) {
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
        paymentMethod: 'phonepe',
        paymentStatus: 'pending',
        trackingTokenHash: createHash('sha256').update(token).digest('hex'),
      },
      select: { id: true, orderNumber: true, total: true, customerName: true, customerPhone: true, phonepeMerchantOrderId: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found or already processed.' }, { status: 404 })
    }
    // If a previous attempt exists, verify it is not already paid before retrying
    if (order.phonepeMerchantOrderId) {
      const { checkPhonePeStatus } = await import('@/lib/phonepe')
      const status = await checkPhonePeStatus(order.phonepeMerchantOrderId)
      if (status?.state === 'COMPLETED' && status.code === 'SUCCESS') {
        return NextResponse.json({ error: 'This order is already paid.' }, { status: 409 })
      }
    }

    const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin
    const merchantOrderId = `MJ${order.orderNumber.replace(/\D/g, '')}${randomBytes(3).toString('hex').toUpperCase()}`.slice(0, 40)
    const result = await initiatePhonePePayment({
      merchantOrderId,
      amount: order.total,
      redirectUrl: `${origin}/api/payments/phonepe/callback?morder=${encodeURIComponent(merchantOrderId)}`,
      mobileNumber: order.customerPhone,
      orderSummary: `MORJAL Order ${order.orderNumber}`,
    })
    if (!result) {
      return NextResponse.json({ error: 'Unable to start online payment. Please try again.' }, { status: 502 })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { phonepeMerchantOrderId: merchantOrderId },
    })
    return NextResponse.json({ paymentUrl: result.paymentUrl, merchantOrderId }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('PhonePe initiation failed')
    return NextResponse.json({ error: 'Unable to start online payment.' }, { status: 500 })
  }
}
