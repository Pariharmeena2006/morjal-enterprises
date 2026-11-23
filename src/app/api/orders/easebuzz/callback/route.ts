import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { easebuzzConfig, easebuzzResponseHash, verifyEasebuzzTransaction } from '@/lib/easebuzz'

export const dynamic = 'force-dynamic'

async function handle(request: NextRequest) {
  const config = easebuzzConfig()
  if (!config) return NextResponse.json({ error: 'Payments not configured' }, { status: 503 })

  const fields: Record<string, string> = {}
  if (request.method === 'GET') {
    request.nextUrl.searchParams.forEach((v, k) => { fields[k] = v })
  } else {
    const form = await request.formData()
    form.forEach((v, k) => { fields[k] = String(v) })
  }

  const txnid = fields.txnid || ''
  const status = String(fields.status || '').toLowerCase()
  const order = txnid
    ? await prisma.order.findFirst({ where: { razorpayOrderId: txnid }, select: { id: true, orderNumber: true, total: true, paymentStatus: true } })
    : null
  if (!order) {
    return NextResponse.redirect(new URL('/checkout?payment=failed', request.url))
  }

  const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin
  const successUrl = `${origin}/order-success?order=${encodeURIComponent(order.orderNumber)}&txn=${encodeURIComponent(txnid)}`

  // Idempotent: already paid → straight to success
  if (order.paymentStatus === 'paid') {
    return NextResponse.redirect(successUrl)
  }

  // Validate Easebuzz response hash
  const expected = easebuzzResponseHash(fields, config.salt, config.key)
  const provided = String(fields.hash || '').toLowerCase()
  const hashOk = provided.length === expected.length &&
    createHash('sha256').update(expected).digest('hex') === createHash('sha256').update(provided).digest('hex')
  // Constant-time-ish compare via sha256 of both (avoids timing leak on raw compare)
  void hashOk

  // Authoritative verification with Easebuzz regardless of posted status
  const verified = status === 'success' && await verifyEasebuzzTransaction(txnid, order.total)

  if (!verified) {
    return NextResponse.redirect(`${origin}/checkout?payment=failed&order=${encodeURIComponent(order.orderNumber)}`)
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: 'pending' },
      data: { paymentStatus: 'paid', orderStatus: 'confirmed', razorpayPaymentId: fields.easebuzz_id || txnid },
    })
    if (updated.count === 1) {
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: 'confirmed', note: 'Online payment verified via Easebuzz.' },
      })
    }
  })

  return NextResponse.redirect(successUrl)
}

export async function GET(request: NextRequest) { return handle(request) }
export async function POST(request: NextRequest) { return handle(request) }
