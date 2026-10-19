'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { readCart, writeCart, type CartItem } from '@/lib/cart'

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000)

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      setCartItems(readCart())
    }
    
    loadCart()
    fetch('/api/store-settings')
      .then((response) => response.json())
      .then((settings) => setFreeShippingThreshold(Number(settings.freeShippingThreshold) || 1000))
      .catch(() => undefined)

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart()
    }
    
    window.addEventListener('cart-updated', handleCartUpdate)
    window.addEventListener('storage', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      window.removeEventListener('storage', handleCartUpdate)
    }
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCharge = subtotal > 0 ? (subtotal >= freeShippingThreshold ? 0 : 99) : 0
  const total = subtotal + shippingCharge

  const updateQuantity = (id: string, newQuantity: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === id)
    if (newQuantity < 1 || newQuantity > Math.min(10, item?.stock || 10)) return
    
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedItems)
    writeCart(updatedItems)
  }

  const removeItem = (id: string) => {
    const updatedItems = cartItems.filter(item => item.id !== id)
    setCartItems(updatedItems)
    writeCart(updatedItems)
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
              <h1 className="text-3xl font-bold text-navy mb-3">Your Cart is Empty</h1>
              <p className="text-text mb-8">Add some products to get started</p>
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
            <Link href="/products">
              <Button variant="ghost" className="text-navy hover:text-gold mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-navy sm:text-3xl lg:text-4xl">Shopping Cart</h1>
            <p className="text-text mt-2">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                      <div className="relative h-48 w-full flex-shrink-0 rounded-xl bg-background-light sm:h-32 sm:w-32">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="font-semibold text-navy text-lg hover:text-gold transition-colors mb-2">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="mb-4 text-xl font-bold text-navy sm:text-2xl">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        <div className="flex items-center border border-gray-300 rounded-xl">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-16 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm text-text">
                          {item.stock} available
                        </span>
                      </div>
                    </div>

                    {/* Remove Button and Total */}
                    <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between gap-4">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 p-2 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <p className="font-bold text-navy text-xl">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
              <h2 className="mb-5 text-xl font-bold text-navy sm:mb-6 sm:text-2xl">Order Summary</h2>

              <div className="space-y-4 mb-6">
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

              <Link href="/checkout" className="block">
                <Button size="lg" className="w-full bg-navy text-white hover:bg-navy-deep py-4 rounded-xl font-semibold mb-4">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" className="w-full border-2 border-navy text-navy hover:bg-navy hover:text-white py-4 rounded-xl font-semibold">
                  Continue Shopping
                </Button>
              </Link>

              <div className="mt-6 text-sm text-text space-y-2">
                <p>Prices include all taxes</p>
                <p>Cash on Delivery available at checkout</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
