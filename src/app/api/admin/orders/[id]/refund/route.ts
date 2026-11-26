import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getPhonePeConfig, initiatePhonePeRefund, checkPhonePeRefundStatus } from '@/lib/phonepe'

export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await getPhonePeConfig())) {
    return NextResponse.json({ error: 'PhonePe is not configured.' }, { status: 503 })
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: { id: true, orderNumber: true, total: true, paymentMethod: true, paymentStatus: true, orderStatus: true, phonepeMerchantOrderId: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.paymentMethod !== 'phonepe' || !order.phonepeMerchantOrderId) {
    return NextResponse.json({ error: 'This order has no PhonePe payment to refund.' }, { status: 400 })
  }
  if (order.paymentStatus !== 'paid') {
    return NextResponse.json({ error: 'Only paid orders can be refunded.' }, { status: 400 })
  }

  const origin = process.env.NEXTAUTH_URL || ''
  const merchantRefundId = `RF${order.orderNumber.replace(/\D/g, '')}${randomBytes(3).toString('hex').toUpperCase()}`.slice(0, 40)
  const result = await initiatePhonePeRefund({
    merchantOrderId: order.phonepeMerchantOrderId,
    merchantRefundId,
    amount: order.total,
    callbackUrl: `${origin}/api/payments/phonepe/webhook`,
  })
  if (!result) {
    return NextResponse.json({ error: 'PhonePe refund request failed.' }, { status: 502 })
  }

  // Verify refund completion via the official refund status API before marking refunded
  const refundStatus = await checkPhonePeRefundStatus(merchantRefundId)
  const refundConfirmed = refundStatus?.state === 'COMPLETED' || refundStatus?.code === 'SUCCESS'

  await prisma.$transaction(async (tx) => {
    if (refundConfirmed) {
      await tx.order.update({ where: { id: order.id }, data: { paymentStatus: 'refunded' } })
    }
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: order.orderStatus,
        note: refundConfirmed
          ? `Refund completed via PhonePe (refund ID ${merchantRefundId}).`
          : `Refund initiated via PhonePe (refund ID ${merchantRefundId}); status pending — will confirm via refund status API.`,
      },
    })
  })

  return NextResponse.json({
    success: true,
    refundId: merchantRefundId,
    refunded: refundConfirmed,
    message: refundConfirmed ? 'Refund completed.' : 'Refund initiated; PhonePe is still processing it.',
  })
}
