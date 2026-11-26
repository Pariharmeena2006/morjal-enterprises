'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import WhatsAppIcon from '@/components/whatsapp-icon'
import { getStorefrontSettings, whatsappChatUrl } from '@/lib/storefront'
import { Check, Copy, MapPin, Package, Truck, Home, Loader2, BadgeCheck, CalendarDays } from 'lucide-react'
import Image from 'next/image'

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
  createdAt?: string
  items: Array<{ productName: string; quantity: number; unitPrice: number; totalPrice: number; imageUrl?: string | null }>
}

const TIMELINE = [
  { key: 'confirmed', label: 'Confirmed', icon: BadgeCheck },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
] as const

const STATUS_ORDER: Record<string, number> = {
  enquiry: 0, pending: 0, confirmed: 1, processing: 1, packed: 2, shipped: 3, out_for_delivery: 3, delivered: 4, cancelled: -1,
}

function timelineStep(orderStatus: string) {
  const idx = STATUS_ORDER[orderStatus] ?? 0
  return TIMELINE.map((step, i) => ({ ...step, state: idx === -1 ? 'cancelled' : i < idx ? 'done' : i === idx ? 'current' : 'todo' }))
}

function OrderSuccessContent() {
  const params = useSearchParams()
  const orderNumber = params.get('order') || ''
  const token = params.get('token') || ''
  const txn = params.get('txn') || ''
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [error, setError] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [copied, setCopied] = useState(false)

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
  const copyOrderId = async () => {
    if (!order) return
    try { await navigator.clipboard.writeText(order.orderNumber); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard unavailable */ }
  }

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
    `Payment Method: ${order.paymentMethod === 'phonepe' ? 'PhonePe Online Payment' : 'COD'}`,
    `Payment Status: ${paid ? 'PAID (verified)' : 'UNPAID / COD pending'}`,
    '', 'Delivery Address:',
    `${order.address}, ${order.city}, ${order.state} – ${order.pinCode}${order.landmark ? `, Landmark: ${order.landmark}` : ''}`,
    '', 'Hello Morjal Enterprises, I have placed this order on your website. Please confirm my order.',
  ].join('\n') : ''

  const steps = order ? timelineStep(order.orderStatus) : []

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        {/* Success hero */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 h-20 w-20">
            <span className="absolute inset-0 animate-ping rounded-full bg-green-400/20 [animation-iteration-count:1] motion-reduce:animate-none" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/30">
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#093875] sm:text-4xl">Order Placed Successfully!</h1>
          <p className="mt-2 text-gray-500">Thank you for shopping with MORJAL Enterprises. We&rsquo;ve received your order.</p>
          {error && <p role="alert" className="mx-auto mt-4 max-w-md rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!order && !error && (
            <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-2 text-[#093875]"><Loader2 className="h-5 w-5 animate-spin" /> Loading order details…</div>
          )}
        </div>

        {order && (
          <>
            {/* Order ID + meta */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Order ID</p>
                <p className="font-mono text-lg font-bold text-[#093875]">{order.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                {order.createdAt && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500"><CalendarDays className="h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                )}
                <button type="button" onClick={copyOrderId} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#093875] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10" aria-label="Copy order ID">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Items + totals */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">Order Items</h2>
                <div className="space-y-3">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-[#F5F7FA]">
                        {i.imageUrl ? <Image src={i.imageUrl} alt={i.productName} fill sizes="48px" className="object-cover" /> : <div className="flex h-full w-full items-center justify-center text-gray-300"><Package className="h-4 w-4" /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#093875]">{i.productName}</p>
                        <p className="text-xs text-gray-500">Qty {i.quantity} × {formatPrice(i.unitPrice)}</p>
                      </div>
                      <span className="text-sm font-bold text-[#093875]">{formatPrice(i.totalPrice)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold text-[#093875]">{formatPrice(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-semibold text-[#093875]">{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span></div>
                  <div className="flex justify-between border-t border-gray-100 pt-2 text-base"><span className="font-bold text-[#093875]">Total</span><span className="font-extrabold text-[#093875]">{formatPrice(order.total)}</span></div>
                </div>
              </div>

              {/* Customer + address + payment */}
              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">Customer & Payment</h2>
                  <p className="text-sm font-semibold text-[#093875]">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.customerPhone}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#093875]/10 px-3 py-1 text-xs font-semibold text-[#093875]">{order.paymentMethod === 'phonepe' ? 'PhonePe Online' : 'Cash on Delivery'}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{paid ? 'PAID ✓' : order.paymentMethod === 'phonepe' ? 'Payment pending' : 'Pay on delivery'}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-gray-400"><MapPin className="h-4 w-4 text-[#D4AF37]" /> Delivery Address</h2>
                  <p className="text-sm text-gray-700">{order.address}</p>
                  <p className="text-sm text-gray-700">{order.city}, {order.state} – {order.pinCode}</p>
                  {order.landmark && <p className="mt-1 text-xs text-gray-400">Landmark: {order.landmark}</p>}
                  <p className="mt-3 rounded-lg bg-[#F5F7FA] px-3 py-2 text-xs font-medium text-[#093875]">Estimated delivery: 5–7 business days</p>
                </div>
              </div>
            </div>

            {/* Tracking timeline */}
            <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-gray-400">Order Tracking</h2>
              <div className="flex items-start justify-between">
                {steps.map((step, i) => (
                  <div key={step.key} className="flex flex-1 flex-col items-center text-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${step.state === 'done' ? 'border-green-500 bg-green-500 text-white' : step.state === 'current' ? 'border-[#093875] bg-[#093875] text-[#D4AF37]' : 'border-gray-200 bg-white text-gray-300'}`}>
                      <step.icon className="h-4.5 w-4.5" />
                    </div>
                    <p className={`mt-2 text-[11px] font-semibold sm:text-xs ${step.state === 'todo' ? 'text-gray-300' : 'text-[#093875]'}`}>{step.label}</p>
                    {i < steps.length - 1 && <span className={`absolute mt-5 h-0.5 w-full ${step.state === 'done' ? 'bg-green-400' : 'bg-gray-200'}`} style={{ left: '50%', transform: 'translateX(20%)', width: '80%' }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <a href={whatsappChatUrl(whatsappNumber, whatsappMessage) || '#'} target="_blank" rel="noreferrer" className="block">
                <Button className="h-12 w-full rounded-xl bg-[#25D366] text-base font-bold text-white shadow-lg shadow-green-500/20 hover:bg-[#1eb856]"><WhatsAppIcon className="mr-2 h-5 w-5" /> Send Order on WhatsApp</Button>
              </a>
              <Link href={`/track-order?order=${encodeURIComponent(order.orderNumber)}${token ? `&token=${encodeURIComponent(token)}` : ''}${txn ? `&txnid=${encodeURIComponent(txn)}` : ''}`}>
                <Button variant="outline" className="h-12 w-full rounded-xl border-[#093875] text-base font-bold text-[#093875] hover:bg-[#093875] hover:text-white">Track Your Order</Button>
              </Link>
              <Link href="/products"><Button variant="outline" className="h-12 w-full rounded-xl border-gray-300 text-base font-bold text-gray-600 hover:border-[#093875] hover:text-[#093875]">Continue Shopping</Button></Link>
            </div>
            <p className="mt-3 text-center text-xs text-gray-400">WhatsApp confirmation is optional — your order is already saved and visible to our team.</p>
          </>
        )}
        {!order && <div className="text-center"><Link href="/products"><Button className="rounded-xl bg-[#093875] px-8 py-3 font-semibold text-white hover:bg-[#0b4a9e]">Continue Shopping</Button></Link></div>}
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] text-[#093875]"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
