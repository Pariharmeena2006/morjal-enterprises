'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice } from '@/lib/utils'
import { Truck, ArrowLeft, ShoppingBag, CreditCard, Banknote, ChevronDown, ShieldCheck, Package, MapPin, Lock, Loader2, Minus, Plus, X, Check } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { readCart, writeCart, type CartItem } from '@/lib/cart'
import { getStorefrontSettings } from '@/lib/storefront'

const inputCls = 'mt-1.5 rounded-xl border-gray-200 bg-[#F5F7FA] py-3 transition-colors focus:border-[#093875] focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/40'

export default function CheckoutPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', address: '', city: '', state: '', pinCode: '', landmark: '', orderNotes: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoaded, setCartLoaded] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000)
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    setCartItems(readCart())
    setCartLoaded(true)
    getStorefrontSettings().then((settings) => {
      setFreeShippingThreshold(Number(settings.freeShippingThreshold) || 1000)
      setOnlinePaymentsEnabled(Boolean((settings as { onlinePaymentsEnabled?: boolean }).onlinePaymentsEnabled))
    })
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCharge = subtotal > 0 ? (subtotal >= freeShippingThreshold ? 0 : 99) : 0
  const total = subtotal + shippingCharge

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((current) => {
      const next = current
        .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(10, item.stock, quantity)) } : item))
        .filter((item) => item.quantity > 0)
      writeCart(next)
      return next
    })
  }

  const removeItem = (productId: string) => {
    setCartItems((current) => {
      const next = current.filter((item) => item.productId !== productId)
      writeCart(next)
      return next
    })
  }

  const scrollToFirstInvalid = () => {
    requestAnimationFrame(() => {
      const invalid = formRef.current?.querySelector<HTMLElement>(':invalid')
      invalid?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      invalid?.focus({ preventScroll: true })
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!formRef.current?.checkValidity()) { scrollToFirstInvalid(); return }
    setLoading(true)
    setCheckoutError('')
    try {
      const requestKey = idempotencyKey || window.crypto.randomUUID()
      if (!idempotencyKey) setIdempotencyKey(requestKey)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestKey },
        body: JSON.stringify({ ...formData, paymentMethod, items: cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity })) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to place your order')
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cart-updated'))
      if (paymentMethod === 'phonepe') {
        const payRes = await fetch('/api/payments/phonepe/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber: data.orderNumber, trackingToken: data.trackingToken }),
        })
        const payData = await payRes.json()
        if (!payRes.ok || !payData.paymentUrl) throw new Error(payData.error || 'Unable to start online payment')
        window.location.href = payData.paymentUrl
        return
      }
      window.location.href = `/order-success?order=${encodeURIComponent(data.orderNumber)}&token=${encodeURIComponent(data.trackingToken)}`
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to place your order. Please try again.')
      setLoading(false)
    }
  }

  const itemList = (
    <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
      {cartItems.map((item) => (
        <div key={item.productId} className="flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#F5F7FA]">
            {item.image ? (
              <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300"><Package className="h-5 w-5" /></div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#093875]">{item.name}</p>
            <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-[#093875] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10" aria-label={`Decrease ${item.name} quantity`}><Minus className="h-3.5 w-3.5" /></button>
              <span className="w-7 text-center text-sm font-bold text-[#093875]">{item.quantity}</span>
              <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-[#093875] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10" aria-label={`Increase ${item.name} quantity`}><Plus className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => removeItem(item.productId)} className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${item.name}`}><X className="h-4 w-4" /></button>
            </div>
          </div>
          <span className="shrink-0 text-sm font-bold text-[#093875]">{formatPrice(item.price * item.quantity)}</span>
        </div>
      ))}
    </div>
  )

  const totalsBlock = (
    <div className="space-y-2.5 border-t border-gray-100 pt-4 text-sm">
      <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold text-[#093875]">{formatPrice(subtotal)}</span></div>
      <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-semibold text-[#093875]">{shippingCharge === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shippingCharge)}</span></div>
      {subtotal >= freeShippingThreshold && subtotal > 0 && <p className="text-xs font-semibold text-green-600">✓ Free shipping applied</p>}
      <div className="flex items-baseline justify-between border-t border-gray-100 pt-3">
        <span className="text-base font-bold text-[#093875]">Total Payable</span>
        <span className="text-2xl font-extrabold text-[#093875]">{formatPrice(total)}</span>
      </div>
    </div>
  )

  const submitButton = (
    <Button
      type="submit"
      size="lg"
      className="h-13 w-full rounded-xl bg-[#093875] py-4 text-base font-bold text-white shadow-lg shadow-[#093875]/20 transition hover:bg-[#0b4a9e] disabled:opacity-60"
      disabled={loading || (paymentMethod === 'phonepe' && !onlinePaymentsEnabled)}
    >
      {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Processing…</span>
        : paymentMethod === 'phonepe' ? 'Proceed to Payment' : `Confirm Order — ${formatPrice(total)}`}
    </Button>
  )

  if (!cartLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#093875]" />
          <p className="mt-4 font-medium text-[#093875]">Loading checkout…</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-xl">
          <ShoppingBag className="mx-auto mb-5 h-16 w-16 text-gray-200" />
          <h1 className="mb-2 text-2xl font-bold text-[#093875]">Your cart is empty</h1>
          <p className="mb-6 text-gray-500">Add products to place your order</p>
          <Link href="/products"><Button size="lg" className="w-full rounded-xl bg-[#093875] py-4 font-semibold text-white hover:bg-[#0b4a9e]">Browse Products</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28 lg:pb-12">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <Link href="/cart" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-[#093875]">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#093875] sm:text-3xl">Secure Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">No login needed — place your order in under a minute</p>
          {/* Progress */}
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 rounded-full bg-[#093875] px-3 py-1.5 text-white"><MapPin className="h-3.5 w-3.5" /> Address</span>
            <span className="h-px flex-1 bg-gray-200" />
            <span className="flex items-center gap-1.5 rounded-full bg-[#093875] px-3 py-1.5 text-white"><CreditCard className="h-3.5 w-3.5" /> Payment</span>
            <span className="h-px flex-1 bg-gray-200" />
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-gray-500"><Check className="h-3.5 w-3.5" /> Confirmation</span>
          </div>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Left column */}
          <div className="space-y-5 lg:col-span-3">
            {checkoutError && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{checkoutError}</div>
            )}

            {/* Contact */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#093875] sm:text-lg"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-sm text-[#8a6d1a]">1</span> Contact Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name *</Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required maxLength={150} placeholder="Enter your full name" autoComplete="name" className={inputCls} />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Mobile Number *</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} required placeholder="10-digit mobile number" pattern="[6-9][0-9]{9}" inputMode="numeric" autoComplete="tel-national" maxLength={10} className={inputCls} />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email <span className="font-normal text-gray-400">(optional)</span></Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" autoComplete="email" className={inputCls} />
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#093875] sm:text-lg"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-sm text-[#8a6d1a]">2</span> Delivery Address</h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700">House / Building / Street Address *</Label>
                  <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required maxLength={500} placeholder="Enter your complete address" rows={3} autoComplete="street-address" className={`${inputCls} resize-none`} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City *</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required maxLength={100} placeholder="City name" autoComplete="address-level2" className={inputCls} />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-semibold text-gray-700">State *</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required maxLength={100} placeholder="State name" autoComplete="address-level1" className={inputCls} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="pinCode" className="text-sm font-semibold text-gray-700">PIN Code *</Label>
                    <Input id="pinCode" name="pinCode" value={formData.pinCode} onChange={(e) => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })} required placeholder="6-digit PIN code" pattern="[1-9][0-9]{5}" inputMode="numeric" autoComplete="postal-code" maxLength={6} className={inputCls} />
                  </div>
                  <div>
                    <Label htmlFor="landmark" className="text-sm font-semibold text-gray-700">Landmark <span className="font-normal text-gray-400">(optional)</span></Label>
                    <Input id="landmark" name="landmark" value={formData.landmark} onChange={handleInputChange} maxLength={200} placeholder="Nearby landmark" className={inputCls} />
                  </div>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[#093875] sm:text-lg"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-sm text-[#8a6d1a]">3</span> Order Notes <span className="text-xs font-normal text-gray-400">(optional)</span></h2>
              <Textarea name="orderNotes" value={formData.orderNotes} onChange={handleInputChange} maxLength={1000} placeholder="Any special instructions for your order" rows={2} className={`${inputCls} resize-none`} />
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#093875] sm:text-lg"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-sm text-[#8a6d1a]">4</span> Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all ${paymentMethod === 'cod' ? 'border-[#093875] bg-[#093875]/5 shadow-sm' : 'border-gray-200 hover:border-[#093875]/40'}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${paymentMethod === 'cod' ? 'bg-[#093875] text-[#D4AF37]' : 'bg-[#F5F7FA] text-gray-400'}`}><Banknote className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#093875]">Cash on Delivery</span>
                    <span className="block text-xs text-gray-500">Pay when your order arrives</span>
                  </span>
                  {paymentMethod === 'cod' && <Check className="absolute right-3 top-3 h-4 w-4 text-[#093875]" />}
                </label>
                <label className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all ${paymentMethod === 'phonepe' ? 'border-[#093875] bg-[#093875]/5 shadow-sm' : 'border-gray-200 hover:border-[#093875]/40'} ${!onlinePaymentsEnabled ? 'cursor-not-allowed opacity-60' : ''}`}>
                  <input type="radio" name="paymentMethod" value="phonepe" checked={paymentMethod === 'phonepe'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={!onlinePaymentsEnabled} className="sr-only" />
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${paymentMethod === 'phonepe' ? 'bg-[#093875] text-[#D4AF37]' : 'bg-[#F5F7FA] text-gray-400'}`}><CreditCard className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#093875]">PhonePe Online {!onlinePaymentsEnabled && <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">Unavailable</span>}</span>
                    <span className="block text-xs text-gray-500">{onlinePaymentsEnabled ? 'UPI, cards & netbanking' : 'Not configured — use COD'}</span>
                  </span>
                  {paymentMethod === 'phonepe' && <Check className="absolute right-3 top-3 h-4 w-4 text-[#093875]" />}
                </label>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400"><Lock className="h-3.5 w-3.5" /> Payments are processed securely. Your order is saved before any payment begins.</p>
            </section>
          </div>

          {/* Right column — order summary */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#093875] sm:text-lg"><Package className="h-5 w-5 text-[#D4AF37]" /> Order Summary</h2>

              {/* Mobile collapsible toggle */}
              <button type="button" onClick={() => setSummaryOpen(!summaryOpen)} className="mb-3 flex w-full items-center justify-between rounded-xl bg-[#F5F7FA] px-4 py-2.5 text-sm font-semibold text-[#093875] lg:hidden" aria-expanded={summaryOpen}>
                {cartItems.length} item{cartItems.length > 1 ? 's' : ''} — {formatPrice(total)}
                <ChevronDown className={`h-4 w-4 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={summaryOpen ? 'block' : 'hidden lg:block'}>{itemList}</div>
              <div className={summaryOpen ? 'block' : 'hidden lg:block'}>{totalsBlock}</div>

              <div className="mt-4 hidden lg:block">{submitButton}</div>
              <p className="mt-3 hidden text-center text-xs text-gray-400 lg:block">
                {paymentMethod === 'phonepe' ? 'Redirected to PhonePe\'s secure checkout.' : 'Pay by cash when your order is delivered.'}
              </p>
              <div className="mt-4 hidden rounded-xl bg-[#F5F7FA] p-3 text-xs text-gray-500 lg:block">
                <p className="mb-1 flex items-center gap-1.5 font-semibold text-[#093875]"><Truck className="h-3.5 w-3.5 text-[#D4AF37]" /> Estimated delivery: 5–7 business days</p>
                <p>By placing this order you agree to our <Link href="/terms-and-conditions" className="font-medium text-[#093875] hover:text-[#D4AF37]">Terms</Link> & <Link href="/privacy-policy" className="font-medium text-[#093875] hover:text-[#D4AF37]">Privacy Policy</Link>.</p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_20px_rgba(9,56,117,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Total payable</p>
            <p className="truncate text-lg font-extrabold text-[#093875]">{formatPrice(total)}</p>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (!formRef.current?.reportValidity()) { scrollToFirstInvalid(); return }
              formRef.current?.requestSubmit()
            }}
            className="h-12 flex-1 rounded-xl bg-[#093875] text-base font-bold text-white hover:bg-[#0b4a9e]"
            disabled={loading || (paymentMethod === 'phonepe' && !onlinePaymentsEnabled)}
          >
            {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : paymentMethod === 'phonepe' ? 'Proceed to Payment' : 'Confirm Order'}
          </Button>
        </div>
      </div>
    </div>
  )
}
