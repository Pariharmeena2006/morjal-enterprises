import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { confirmPhonePeOrder } from '@/lib/phonepe-order'
import { getPhonePeConfig, verifyPhonePeWebhook, checkPhonePeRefundStatus } from '@/lib/phonepe'

export const dynamic = 'force-dynamic'

const SUPPORTED_EVENTS = new Set([
  'checkout.order.completed',
  'checkout.order.failed',
  'pg.refund.completed',
  'pg.refund.failed',
])

async function handleRefundEvent(payload: Record<string, unknown>) {
  const merchantOrderId = String(payload.merchantOrderId || '')
  const merchantRefundId = String(payload.merchantRefundId || '')
  const event = String(payload.event || '')
  if (!merchantOrderId || !merchantRefundId) return

  const order = await prisma.order.findFirst({
    where: { phonepeMerchantOrderId: merchantOrderId, paymentMethod: 'phonepe' },
    select: { id: true, paymentStatus: true },
  })
  if (!order) return

  // Authoritative check via official refund status API — never trust the webhook body
  const refundStatus = await checkPhonePeRefundStatus(merchantRefundId)
  const refundDone = refundStatus?.state === 'COMPLETED' || refundStatus?.code === 'SUCCESS'
  const refundFailed = refundStatus?.state === 'FAILED' || event === 'pg.refund.failed'

  if (event === 'pg.refund.completed' && refundDone && order.paymentStatus === 'paid') {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: 'paid' },
        data: { paymentStatus: 'refunded' },
      })
      if (updated.count === 1) {
        await tx.orderStatusHistory.create({
          data: { orderId: order.id, status: 'refunded', note: `Refund confirmed via PhonePe webhook (refund ${merchantRefundId}).` },
        })
      }
    })
  } else if ((event === 'pg.refund.failed' || refundFailed) && order.paymentStatus === 'refunded') {
    // Refund failed after we marked refunded — restore paid state
    await prisma.order.updateMany({ where: { id: order.id, paymentStatus: 'refunded' }, data: { paymentStatus: 'paid' } })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await getPhonePeConfig())) {
      return NextResponse.json({ success: false }, { status: 503 })
    }

    // Official V2 SHA auth: Authorization = SHA256(username:password)
    if (!verifyPhonePeWebhook(request.headers.get('authorization'))) {
      return NextResponse.json({ success: false, error: 'Invalid webhook authorization' }, { status: 401 })
    }

    const rawBody = await request.text()
    const body = JSON.parse(rawBody || '{}')
    const event = String(body?.event || '')
    if (!SUPPORTED_EVENTS.has(event)) {
      return NextResponse.json({ success: true, ignored: event || 'unknown' })
    }

    // V2 payload: { event, type, payload: { merchantOrderId, merchantRefundId, state, ... } }
    const payload = (body?.payload && typeof body.payload === 'object' ? body.payload : body) as Record<string, unknown>

    if (event.startsWith('checkout.order.')) {
      const merchantOrderId = String(payload.merchantOrderId || payload.orderId || '')
      if (merchantOrderId) await confirmPhonePeOrder(merchantOrderId)
    } else if (event.startsWith('pg.refund.')) {
      await handleRefundEvent({ ...payload, event })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
