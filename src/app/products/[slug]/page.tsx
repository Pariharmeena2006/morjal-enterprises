'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, MessageCircle, Minus, Plus, ArrowLeft } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { addProductToCart } from '@/lib/cart'

interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  sellingPrice: number
  mrp?: number
  stockQuantity: number
  isOutOfStock: boolean
  category: string
  brand?: string
  sku?: string
  images: Array<{ url: string; alt?: string }>
  features?: string
  specifications?: string
  applications?: string
  material?: string
  dimensions?: string
  weight?: string
  safetyInstructions?: string
  warranty?: string
  faq?: string
  shippingInfo?: string
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [cartNotice, setCartNotice] = useState('')

  useEffect(() => {
    fetchProduct()
  }, [params.slug])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
        // Fetch related products
        const relatedRes = await fetch(`/api/products?category=${data.category}`)
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json()
          setRelatedProducts(relatedData.filter((p: Product) => p.id !== data.id && p.category === data.category).slice(0, 4))
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const discount = product?.mrp && product.mrp > product.sellingPrice
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
    : 0

  const addToCart = () => {
    if (!product || product.isOutOfStock || product.stockQuantity < 1) return 'unavailable'
    const result = addProductToCart(product, quantity)
    setCartNotice(result === 'added' ? 'Added to your cart.' : result === 'limit' ? 'Maximum available quantity is already in your cart.' : 'This product is out of stock.')
    window.setTimeout(() => setCartNotice(''), 2500)
    return result
  }

  const buyNow = () => {
    const result = addToCart()
    if (result === 'added' || result === 'limit') window.location.href = '/checkout'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <nav className="py-4 bg-background-light">
        <div className="container mx-auto px-4">
          <div className="flex min-w-0 items-center text-xs text-text sm:text-sm">
            <Link href="/" className="shrink-0 text-navy transition-colors hover:text-gold">Home</Link>
            <span className="mx-2 shrink-0 text-gray-400">/</span>
            <Link href="/products" className="shrink-0 text-navy transition-colors hover:text-gold">Products</Link>
            <span className="mx-2 shrink-0 text-gray-400">/</span>
            <span className="truncate text-gray-600">{product.name}</span>
          </div>
        </div>
      </nav>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="container mx-auto min-w-0 px-4 py-5 sm:py-8"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link href="/products">
            <Button variant="ghost" className="text-navy hover:text-gold">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </motion.div>

        <div className="mb-10 grid min-w-0 grid-cols-1 gap-6 sm:mb-16 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <motion.div variants={itemVariants}>
            <div className="bg-background-light rounded-2xl overflow-hidden mb-4">
              {product.images[selectedImage] ? (
                <div className="relative h-[min(78vw,390px)] min-h-64 sm:h-96 lg:h-[500px]">
                  <Image
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt || product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-[min(78vw,390px)] min-h-64 items-center justify-center bg-gradient-to-br from-navy to-navy-deep sm:h-96 lg:h-[500px]">
                  <p className="text-white">No Image Available</p>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {product.images.map((image: any, index: number) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`bg-background-light rounded-xl overflow-hidden cursor-pointer transition-all ${
                      selectedImage === index ? 'ring-2 ring-gold' : 'hover:ring-2 hover:ring-navy'
                    }`}
                  >
                    <div className="relative h-16 sm:h-20">
                      <Image
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div variants={itemVariants}>
            <h1 className="mb-3 text-2xl font-bold text-navy [overflow-wrap:anywhere] sm:text-3xl lg:text-4xl">{product.name}</h1>
            {product.brand && (
              <p className="text-text mb-2">Brand: {product.brand}</p>
            )}
            {product.sku && (
              <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
            )}

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-navy sm:text-4xl">
                {formatPrice(product.sellingPrice)}
              </span>
              {product.mrp && product.mrp > product.sellingPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through ml-3">
                    {formatPrice(product.mrp)}
                  </span>
                  {discount > 0 && (
                    <span className="ml-3 bg-green-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                      {discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Stock Status */}
            <p className="mb-6">
              {product.isOutOfStock ? (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              ) : product.stockQuantity <= 5 ? (
                <span className="text-orange-600 font-semibold">Only {product.stockQuantity} left in stock</span>
              ) : (
                <span className="text-green-600 font-semibold">In Stock ({product.stockQuantity} available)</span>
              )}
            </p>

            {/* Short Description */}
            <p className="text-text mb-8 text-lg">{product.shortDescription}</p>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-8">
              <span className="font-semibold text-navy">Quantity:</span>
                <div className="flex items-center rounded-xl border border-gray-300">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(10, product.stockQuantity, parseInt(e.target.value) || 1)))}
                  min="1"
                  max={product.stockQuantity}
                  className="w-16 text-center border-x border-gray-300 focus:outline-none py-3"
                />
                <button 
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  disabled={quantity >= product.stockQuantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button
                size="lg"
                onClick={addToCart}
                className="flex-1 bg-gold text-navy hover:bg-gold/90 py-4 rounded-xl font-semibold"
                disabled={product.isOutOfStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                onClick={buyNow}
                className="flex-1 bg-navy text-white hover:bg-navy-deep py-4 rounded-xl font-semibold"
                disabled={product.isOutOfStock}
              >
                Buy Now
              </Button>
            </div>
            {cartNotice && <p role="status" className="mb-4 text-sm font-medium text-green-700">{cartNotice}</p>}

            {/* WhatsApp Enquiry */}
            <a href={`https://wa.me/?text=${encodeURIComponent(`Hello, I am interested in ${product.name} (/products/${product.slug})`)}`} target="_blank" rel="noreferrer" className="block">
            <Button type="button" variant="outline" className="w-full text-green-600 border-green-600 hover:bg-green-50 py-4 rounded-xl">
              <MessageCircle className="h-5 w-5 mr-2" />
              Enquire on WhatsApp
            </Button>
            </a>

            {/* Shipping Info */}
            {product.shippingInfo && (
              <div className="mt-6 bg-background-light p-6 rounded-2xl">
                <h3 className="font-semibold text-navy mb-2">Shipping Information</h3>
                <p className="text-sm text-text">{product.shippingInfo}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Product Details */}
        <motion.div 
          variants={itemVariants}
          className="mb-10 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:mb-16 sm:p-8"
        >
          <h2 className="text-2xl font-bold text-navy mb-6">Product Description</h2>
          <div className="prose max-w-none text-text">
            <p>{product.description}</p>
          </div>

          {product.features && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-navy mb-3">Features</h3>
              <p className="text-text whitespace-pre-line">{product.features}</p>
            </div>
          )}

          {product.specifications && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-navy mb-3">Specifications</h3>
              <p className="text-text whitespace-pre-line">{product.specifications}</p>
            </div>
          )}

          {product.applications && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-navy mb-3">Applications</h3>
              <p className="text-text whitespace-pre-line">{product.applications}</p>
            </div>
          )}

          {product.material && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-navy mb-3">Material</h3>
              <p className="text-text">{product.material}</p>
            </div>
          )}

          {product.dimensions && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-navy mb-3">Dimensions</h3>
              <p className="text-text">{product.dimensions}</p>
            </div>
          )}

          {product.weight && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-navy mb-3">Weight</h3>
              <p className="text-text">{product.weight}</p>
            </div>
          )}

          {product.safetyInstructions && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-navy mb-3">Safety Instructions</h3>
              <p className="text-text whitespace-pre-line">{product.safetyInstructions}</p>
            </div>
          )}

          {product.warranty && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-navy mb-3">Warranty</h3>
              <p className="text-text">{product.warranty}</p>
            </div>
          )}

          {product.faq && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-navy mb-3">Frequently Asked Questions</h3>
              <p className="text-text whitespace-pre-line">{product.faq}</p>
            </div>
          )}
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-navy mb-6">Related Products</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.slug}`}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-100">
                    <div className="relative h-48 bg-background-light">
                      {relatedProduct.images[0] ? (
                        <Image
                          src={relatedProduct.images[0].url}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-navy line-clamp-2 mb-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-navy">
                        {formatPrice(relatedProduct.sellingPrice)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
