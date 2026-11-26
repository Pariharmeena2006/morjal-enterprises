'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice } from '@/lib/utils'
import { Truck, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import WhatsAppIcon from '@/components/whatsapp-icon'
import { readCart, writeCart, type CartItem } from '@/lib/cart'
import { getStorefrontSettings } from '@/lib/storefront'

interface EnquiryResult {
  orderNumber: string
  whatsappUrl: string | null
  whatsappConfigured: boolean
  trackingToken: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    landmark: '',
    orderNotes: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoaded, setCartLoaded] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [enquiry, setEnquiry] = useState<EnquiryResult | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000)
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(false)
  const [whatsappFallbackUrl, setWhatsappFallbackUrl] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
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
      setCheckoutError(error instanceof Error ? error.message : 'Unable to save your order enquiry. Please try again.')
      setLoading(false)
    }
  }

  if (!cartLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-navy"></div>
          <p className="mt-4 text-navy">Loading checkout…</p>
        </div>
      </div>
    )
  }

  if (enquiry) {
    return (
      <div className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-green-100 bg-green-50 p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white">
            <WhatsAppIcon className="h-8 w-8" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-navy">Order enquiry saved</h1>
          <p className="mb-2 text-text">Your enquiry number is <strong>{enquiry.orderNumber}</strong>.</p>
          <p className="mb-6 text-sm text-text">
            {enquiry.whatsappConfigured
              ? 'We opened WhatsApp with your order details. Press Send inside WhatsApp to confirm your enquiry — we will reply with availability, final price and delivery details.'
              : 'Your enquiry is saved. Our team will contact you to confirm your order. WhatsApp ordering is not configured yet.'}
          </p>
          {enquiry.whatsappUrl && (
            <div className="mb-4 space-y-3">
              <a href={enquiry.whatsappUrl} target="_blank" rel="noreferrer">
                <Button className="w-full bg-[#25D366] py-4 text-base font-semibold text-white hover:bg-[#1eb856]">
                  <WhatsAppIcon className="mr-2 h-5 w-5" /> Open WhatsApp again
                </Button>
              </a>
              <p className="text-xs text-gray-500">If WhatsApp did not open, use the button above.</p>
            </div>
          )}
          <Link href={`/track-order?order=${encodeURIComponent(enquiry.orderNumber)}#token=${encodeURIComponent(enquiry.trackingToken)}`}>
            <Button variant="outline" className="mb-4 border-navy text-navy">Track enquiry status</Button>
          </Link>
          <div>
            <Link href="/products"><Button className="bg-navy text-white hover:bg-navy-deep">Continue shopping</Button></Link>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <ShoppingBag className="mx-auto mb-6 h-32 w-32 text-gray-300" />
            <h1 className="mb-3 text-3xl font-bold text-navy">Your cart is empty</h1>
            <p className="mb-8 text-text">Add products to place a WhatsApp order enquiry</p>
            <Link href="/products">
              <Button size="lg" className="rounded-xl bg-navy py-4 text-white hover:bg-navy-deep">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-background-light py-8">
        <div className="container mx-auto px-4">
          <Link href="/cart">
            <Button variant="ghost" className="mb-4 text-navy hover:text-gold">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl lg:text-4xl">Guest Checkout</h1>
          <p className="mt-2 text-text">No login needed — send your order enquiry on WhatsApp</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {checkoutError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{checkoutError}</div>}

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h2 className="mb-5 text-lg font-bold text-navy sm:mb-6 sm:text-xl">Contact Information</h2>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="fullName" className="font-medium text-navy">Full Name *</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required maxLength={150} placeholder="Enter your full name" autoComplete="name" inputMode="text" className="mt-2 rounded-xl border-gray-300 py-3 focus:border-gold focus:ring-gold" />
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <Label htmlFor="phone" className="font-medium text-navy">Mobile Number *</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} required placeholder="10-digit mobile number" pattern="[6-9][0-9]{9}" inputMode="numeric" autoComplete="tel-national" maxLength={10} className="mt-2 rounded-xl border-gray-300 py-3 focus:border-gold focus:ring-gold" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-medium text-navy">Email (Optional)</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" autoComplete="email" className="mt-2 rounded-xl border-gray-300 py-3 focus:border-gold focus:ring-gold" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h2 className="mb-5 text-lg font-bold text-navy sm:mb-6 sm:text-xl">Delivery Address</h2>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="address" className="font-medium text-navy">House/Building/Street Address *</Label>
                    <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required maxLength={500} placeholder="Enter your complete address" rows={3} autoComplete="street-address" className="mt-2 rounded-xl border-gray-300 focus:border-gold focus:ring-gold" />
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <Label htmlFor="city" className="font-medium text-navy">City *</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required maxLength={100} placeholder="City name" autoComplete="address-level2" className="mt-2 rounded-xl border-gray-300 py-3 focus:border-gold focus:ring-gold" />
                    </div>
                    <div>
                      <Label htmlFor="state" className="font-medium text-navy">State *</Label>
                      <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required maxLength={100} placeholder="State name" autoComplete="address-level1" className="mt-2 rounded-xl border-gray-300 py-3 focus:border-gold focus:ring-gold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <Label htmlFor="pinCode" className="font-medium text-navy">PIN Code *</Label>
                      <Input id="pinCode" name="pinCode" value={formData.pinCode} onChange={(e) => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })} required placeholder="6-digit PIN code" pattern="[1-9][0-9]{5}" inputMode="numeric" autoComplete="postal-code" maxLength={6} className="mt-2 rounded-xl border-gray-300 py-3 focus:border-gold focus:ring-gold" />
                    </div>
                    <div>
                      <Label htmlFor="landmark" className="font-medium text-navy">Landmark (Optional)</Label>
                      <Input id="landmark" name="landmark" value={formData.landmark} onChange={handleInputChange} maxLength={200} placeholder="Nearby landmark" className="mt-2 rounded-xl border-gray-300 py-3 focus:border-gold focus:ring-gold" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h2 className="mb-5 text-lg font-bold text-navy sm:mb-6 sm:text-xl">Order Notes (Optional)</h2>
                <Textarea name="orderNotes" value={formData.orderNotes} onChange={handleInputChange} maxLength={1000} placeholder="Any special instructions for your order" rows={3} className="rounded-xl border-gray-300 focus:border-gold focus:ring-gold" />
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h2 className="mb-6 text-xl font-bold text-navy">Payment Preference</h2>
                <div className="space-y-3 sm:space-y-4">
                  <label className={`flex cursor-pointer items-start rounded-xl border-2 p-3 transition-all sm:items-center sm:p-4 ${paymentMethod === 'cod' ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-navy'}`}>
                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-4" />
                    <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy sm:mr-4 sm:h-12 sm:w-12">
                      <Truck className="h-5 w-5 text-gold sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy">Cash on Delivery (COD)</p>
                      <p className="text-sm text-text">Pay when your order is delivered</p>
                    </div>
                  </label>
                  <label className={`flex cursor-pointer items-start rounded-xl border-2 p-3 transition-all sm:items-center sm:p-4 ${paymentMethod === 'phonepe' ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-navy'}`}>
                    <input type="radio" name="paymentMethod" value="phonepe" checked={paymentMethod === 'phonepe'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={!onlinePaymentsEnabled} className="mr-4" />
                    <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy sm:mr-4 sm:h-12 sm:w-12">
                      <span className="text-xs font-bold text-gold">UPI</span>
                    </div>
                    <div>
                      <p className="font-semibold text-navy">PhonePe Online Payment {!onlinePaymentsEnabled && <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">Unavailable</span>}</p>
                      <p className="text-sm text-text">{onlinePaymentsEnabled ? 'UPI, cards & netbanking via PhonePe — secured checkout' : 'Online payments are not configured yet — please use Cash on Delivery'}</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h2 className="mb-5 text-xl font-bold text-navy sm:mb-6 sm:text-2xl">Order Summary</h2>

                <div className="mb-6 max-h-80 space-y-4 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-start justify-between gap-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-medium text-navy">{item.name}</p>
                        <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="h-7 w-7 rounded-md border border-gray-300 text-navy hover:bg-gray-50" aria-label={`Decrease ${item.name} quantity`}>−</button>
                          <span className="w-8 text-center font-semibold text-navy">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="h-7 w-7 rounded-md border border-gray-300 text-navy hover:bg-gray-50" aria-label={`Increase ${item.name} quantity`}>+</button>
                          <button type="button" onClick={() => removeItem(item.productId)} className="ml-1 text-xs font-semibold text-red-600 hover:underline">Remove</button>
                        </div>
                      </div>
                      <span className="shrink-0 font-semibold text-navy">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-text">Subtotal</span>
                    <span className="font-semibold text-navy">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text">Shipping</span>
                    <span className="font-semibold text-navy">
                      {shippingCharge === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shippingCharge)}
                    </span>
                  </div>
                  {subtotal >= freeShippingThreshold && subtotal > 0 && (
                    <p className="text-sm font-medium text-green-600">✓ Free shipping applied!</p>
                  )}
                  <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                    <span className="text-lg font-bold text-navy">Total</span>
                    <span className="text-2xl font-bold text-navy">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full rounded-xl bg-[#25D366] py-4 text-base font-semibold text-white hover:bg-[#1eb856]"
                  disabled={loading}
                >
                  {loading ? 'Saving enquiry…' : (
                    <span className="inline-flex items-center gap-2">
                      <WhatsAppIcon className="h-5 w-5" /> Send Order on WhatsApp
                    </span>
                  )}
                </Button>
                <p className="mt-3 text-center text-xs text-gray-500">
                  Your enquiry is saved first, then WhatsApp opens with the details pre-filled. You confirm by pressing Send in WhatsApp.
                </p>
                {whatsappFallbackUrl && (
                  <a href={whatsappFallbackUrl} target="_blank" rel="noreferrer" className="mt-2 block text-center text-xs font-semibold text-[#128C7E] hover:underline">
                    WhatsApp did not open? Tap here
                  </a>
                )}

                <div className="mt-6 space-y-2 text-xs text-text">
                  <p>By sending this enquiry, you agree to our</p>
                  <Link href="/terms-and-conditions" className="text-navy hover:text-gold">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link href="/privacy-policy" className="text-navy hover:text-gold">Privacy Policy</Link>
                </div>

                <div className="mt-6 rounded-xl bg-background-light p-4">
                  <p className="mb-2 font-semibold text-navy">Estimated Delivery</p>
                  <p className="text-text">5-7 business days</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
