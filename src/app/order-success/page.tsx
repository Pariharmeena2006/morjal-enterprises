'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import WhatsAppIcon from '@/components/whatsapp-icon'
import { getStorefrontSettings, whatsappChatUrl } from '@/lib/storefront'

interface OrderDetails {
  orderNumber: string
  orderStatus: string
  customerName: string
  customerPhone: string
  address: string
  city: string
  state: string
  pinCode: string
  landmark?: string | null
  subtotal: number
  shippingCharge: number
  total: number
  paymentMethod: string
  paymentStatus: string
  items: Array<{ productName: string; quantity: number; unitPrice: number; totalPrice: number }>
}

function OrderSuccessContent() {
  const params = useSearchParams()
  const orderNumber = params.get('order') || ''
  const token = params.get('token') || ''
  const txn = params.get('txn') || ''
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [error, setError] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
    getStorefrontSettings().then((s) => setWhatsappNumber(s.whatsappNumber || ''))
    if (!orderNumber) { setError('Missing order reference.'); return }
    fetch('/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, token, txnid: txn }),
    })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'Unable to load order')
        setOrder(data)
      })
      .catch((e) => setError(e.message))
  }, [orderNumber, token, txn])

  const paid = order?.paymentStatus === 'paid'
  const whatsappMessage = order ? [
    '🛍️ *NEW ORDER — MORJAL ENTERPRISES*', '',
    `Order ID: ${order.orderNumber}`,
    `Customer Name: ${order.customerName}`,
    `Mobile Number: ${order.customerPhone}`,
    '', 'Products:',
    ...order.items.map((i) => `• ${i.productName} — Qty ${i.quantity} — ${formatPrice(i.totalPrice)}`),
    '', `Subtotal: ${formatPrice(order.subtotal)}`,
    `Shipping Charges: ${order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}`,
    `Total Amount: ${formatPrice(order.total)}`,
    `Payment Method: ${order.paymentMethod === 'easebuzz' ? 'Easebuzz Online Payment' : 'COD'}`,
    `Payment Status: ${paid ? 'PAID (verified)' : 'UNPAID / COD pending'}`,
    '', 'Delivery Address:',
    `${order.address}, ${order.city}, ${order.state} – ${order.pinCode}${order.landmark ? `, Landmark: ${order.landmark}` : ''}`,
    '', 'Hello Morjal Enterprises, I have placed this order on your website. Please confirm my order.',
  ].join('\n') : ''

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-green-100 bg-green-50 p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-3xl text-white">✓</div>
        <h1 className="mb-2 text-3xl font-bold text-navy">Order placed successfully</h1>
        {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!order && !error && <p className="text-text">Loading order details…</p>}
        {order && (
          <div className="mb-6 rounded-xl bg-white p-4 text-left text-sm text-text">
            <p><strong>Order ID:</strong> {order.orderNumber}</p>
            <p><strong>Name:</strong> {order.customerName}</p>
            <p><strong>Mobile:</strong> {order.customerPhone}</p>
            <div className="my-2 border-t border-gray-100 pt-2">
              {order.items.map((i, idx) => (
                <p key={idx}>• {i.productName} — Qty {i.quantity} — {formatPrice(i.totalPrice)}</p>
              ))}
            </div>
            <p><strong>Subtotal:</strong> {formatPrice(order.subtotal)}</p>
            <p><strong>Shipping:</strong> {order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</p>
            <p className="text-base font-bold text-navy"><strong>Total:</strong> {formatPrice(order.total)}</p>
            <p><strong>Payment:</strong> {order.paymentMethod === 'easebuzz' ? 'Easebuzz Online' : 'Cash on Delivery'} — {paid ? 'PAID ✓' : 'Pending (pay on delivery)'}</p>
            <p className="mt-2 text-xs text-gray-500">{order.address}, {order.city}, {order.state} – {order.pinCode}</p>
          </div>
        )}
        {order && (
          <div className="space-y-3">
            <a href={whatsappChatUrl(whatsappNumber, whatsappMessage) || '#'} target="_blank" rel="noreferrer" className="block">
              <Button className="w-full bg-[#25D366] py-4 text-base font-semibold text-white hover:bg-[#1eb856]">
                <WhatsAppIcon className="mr-2 h-5 w-5" /> Send Order on WhatsApp
              </Button>
            </a>
            <p className="text-xs text-gray-500">Optional — your order is already confirmed. Press Send inside WhatsApp to notify us.</p>
            <Link href="/products"><Button className="w-full bg-navy text-white hover:bg-navy-deep">Continue Shopping</Button></Link>
          </div>
        )}
        {!order && <Link href="/products"><Button className="bg-navy text-white">Continue Shopping</Button></Link>}
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-navy">Loading…</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
