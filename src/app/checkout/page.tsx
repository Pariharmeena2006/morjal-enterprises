'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice } from '@/lib/utils'
import { CreditCard, Truck, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { readCart, type CartItem } from '@/lib/cart'

export default function CheckoutPage() {
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
  const [checkoutError, setCheckoutError] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000)
  const [codEnabled, setCodEnabled] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    setCartItems(readCart())
    fetch('/api/store-settings')
      .then((response) => response.json())
      .then((settings) => {
        setFreeShippingThreshold(Number(settings.freeShippingThreshold) || 1000)
        setCodEnabled(settings.codEnabled !== false)
      })
      .catch(() => undefined)
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCharge = subtotal > 0 ? (subtotal >= freeShippingThreshold ? 0 : 99) : 0
  const total = subtotal + shippingCharge

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setCheckoutError('')
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, paymentMethod, items: cartItems }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to place your order')
      setOrderNumber(data.orderNumber)
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cart-updated'))
      setCartItems([])
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to place your order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  }

  if (orderNumber) {
    return (
      <div className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-green-100 bg-green-50 p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-3xl text-white">✓</div>
          <h1 className="mb-3 text-3xl font-bold text-navy">Order placed successfully</h1>
          <p className="mb-2 text-text">Your order number is <strong>{orderNumber}</strong>.</p>
          <p className="mb-6 text-text">We’ll contact you to confirm delivery details. Payment is due on delivery.</p>
          <Link href="/products"><Button className="bg-navy text-white hover:bg-navy-deep">Continue shopping</Button></Link>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-md mx-auto text-center"
          >
            <motion.div variants={itemVariants}>
              <ShoppingBag className="h-32 w-32 mx-auto text-gray-300 mb-6" />
              <h1 className="text-3xl font-bold text-navy mb-3">Your cart is empty</h1>
              <p className="text-text mb-8">Add products to checkout</p>
              <Link href="/products">
                <Button size="lg" className="bg-navy text-white hover:bg-navy-deep py-4 rounded-xl">
                  Browse Products
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-background-light py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
          >
            <Link href="/cart">
              <Button variant="ghost" className="text-navy hover:text-gold mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-navy sm:text-3xl lg:text-4xl">Checkout</h1>
            <p className="text-text mt-2">Complete your order</p>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="container mx-auto px-4 py-8"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              {checkoutError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{checkoutError}</div>}
              {/* Contact Information */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h2 className="mb-5 text-lg font-bold text-navy sm:mb-6 sm:text-xl">Contact Information</h2>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="fullName" className="text-navy font-medium">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-navy font-medium">Mobile Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-navy font-medium">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h2 className="mb-5 text-lg font-bold text-navy sm:mb-6 sm:text-xl">Shipping Address</h2>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="address" className="text-navy font-medium">House/Building/Street Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your complete address"
                      rows={3}
                      className="mt-2 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="city" className="text-navy font-medium">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="City name"
                        className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-navy font-medium">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="State name"
                        className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="pinCode" className="text-navy font-medium">PIN Code *</Label>
                      <Input
                        id="pinCode"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        required
                        placeholder="6-digit PIN code"
                        pattern="[0-9]{6}"
                        className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="landmark" className="text-navy font-medium">Landmark (Optional)</Label>
                      <Input
                        id="landmark"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        placeholder="Nearby landmark"
                        className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h2 className="mb-5 text-lg font-bold text-navy sm:mb-6 sm:text-xl">Order Notes (Optional)</h2>
                <Textarea
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for your order"
                  rows={3}
                  className="rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                />
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h2 className="text-xl font-bold text-navy mb-6">Payment Method</h2>
                <div className="space-y-3 sm:space-y-4">
                  <label className="flex cursor-not-allowed items-start rounded-xl border-2 border-gray-200 p-3 opacity-60 sm:items-center sm:p-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      disabled
                      className="mr-4"
                    />
                    <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy sm:mr-4 sm:h-12 sm:w-12">
                      <CreditCard className="h-5 w-5 text-gold sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy">Online Payment</p>
                      <p className="text-sm text-text">Coming soon — online payments are not enabled yet.</p>
                    </div>
                  </label>

                  <label className={`flex items-start p-3 border-2 rounded-xl transition-all sm:items-center sm:p-4 ${codEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${
                    paymentMethod === 'cod' ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-navy'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={!codEnabled}
                      className="mr-4"
                    />
                    <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy sm:mr-4 sm:h-12 sm:w-12">
                      <Truck className="h-5 w-5 text-gold sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy">Cash on Delivery (COD)</p>
                      <p className="text-sm text-text">{codEnabled ? 'Pay when your order is delivered' : 'Cash on Delivery is currently unavailable.'}</p>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h2 className="mb-5 text-xl font-bold text-navy sm:mb-6 sm:text-2xl">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="min-w-0 flex-1 break-words pr-2 text-text">{item.name} x {item.quantity}</span>
                      <span className="shrink-0 font-semibold text-navy">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text">Subtotal</span>
                    <span className="font-semibold text-navy">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text">Shipping</span>
                    <span className="font-semibold text-navy">
                      {shippingCharge === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(shippingCharge)
                      )}
                    </span>
                  </div>
                  {subtotal >= freeShippingThreshold && (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Free shipping applied!
                    </p>
                  )}
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <span className="font-bold text-navy text-lg">Total</span>
                    <span className="font-bold text-navy text-2xl">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-navy text-white hover:bg-navy-deep py-4 rounded-xl font-semibold mt-6"
                  disabled={loading || !codEnabled}
                >
                  {loading ? 'Processing...' : codEnabled ? `Place Order - ${formatPrice(total)}` : 'Ordering unavailable'}
                </Button>

                <div className="text-xs text-text space-y-2 mt-6">
                  <p>By placing this order, you agree to our</p>
                  <Link href="/terms-and-conditions" className="text-navy hover:text-gold">
                    Terms & Conditions
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy-policy" className="text-navy hover:text-gold">
                    Privacy Policy
                  </Link>
                </div>

                <div className="bg-background-light p-4 rounded-xl mt-6">
                  <p className="font-semibold text-navy mb-2">Estimated Delivery</p>
                  <p className="text-text">5-7 business days</p>
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
