import { NextRequest, NextResponse } from 'next/server'
import { confirmPhonePeOrder } from '@/lib/phonepe-order'

export const dynamic = 'force-dynamic'

/** Browser redirect callback from PhonePe hosted checkout. */
export async function GET(request: NextRequest) {
  const merchantOrderId = request.nextUrl.searchParams.get('morder') || ''
  const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin
  if (!merchantOrderId) {
    return NextResponse.redirect(`${origin}/checkout?payment=failed`)
  }
  const { order, paid } = await confirmPhonePeOrder(merchantOrderId)
  if (paid && order) {
    return NextResponse.redirect(`${origin}/order-success?order=${encodeURIComponent(order.orderNumber)}&txn=${encodeURIComponent(merchantOrderId)}`)
  }
  const orderParam = order ? `&order=${encodeURIComponent(order.orderNumber)}` : ''
  return NextResponse.redirect(`${origin}/checkout?payment=failed${orderParam}`)
}
