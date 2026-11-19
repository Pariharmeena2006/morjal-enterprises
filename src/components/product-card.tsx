'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, MessageCircle, ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { addProductToCart } from '@/lib/cart'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  compact?: boolean
  product: {
    id: string
    name: string
    slug: string
    shortDescription: string
    sellingPrice: number
    mrp?: number | null
    stockQuantity: number
    isOutOfStock: boolean
    images: Array<{ url: string; alt?: string | null }>
  }
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const [feedback, setFeedback] = useState('')
  const [imageFailed, setImageFailed] = useState(false)
  const mainImage = product.images?.[0]
  const outOfStock = product.isOutOfStock || product.stockQuantity < 1
  const enquiryMessage = `Hello, I am interested in ${product.name}. Please share more details. Product: /products/${product.slug}`
  const whatsappUrl = `https://wa.me/919694142555?text=${encodeURIComponent(enquiryMessage)}`
  const discount = product.mrp && product.mrp > product.sellingPrice
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
    : 0

  const addToCart = () => {
    const result = addProductToCart(product)
    setFeedback(result === 'added' ? 'Added to cart' : result === 'limit' ? 'Stock limit reached' : 'Out of stock')
    window.setTimeout(() => setFeedback(''), 2200)
  }

  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-xl ${compact ? '' : 'rounded-2xl shadow-sm'}`}>
      <Link href={`/products/${product.slug}`} className={`group relative block overflow-hidden bg-white ${compact ? 'aspect-[3/2]' : 'aspect-[4/3]'}`} aria-label={`View ${product.name}`}>
        {mainImage && !imageFailed ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
            className="object-contain object-center p-2 sm:p-3"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy to-navy-deep text-gold">
            <ShoppingCart className="h-10 w-10 opacity-70" />
          </div>
        )}
        {discount > 0 && <span className="absolute left-2.5 top-2.5 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">{discount}% OFF</span>}
        {outOfStock && <span className="absolute inset-x-0 bottom-0 bg-black/70 px-2.5 py-1.5 text-center text-xs font-semibold text-white">Out of stock</span>}
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'}`}>
        <Link href={`/products/${product.slug}`} className="font-semibold leading-snug text-navy transition-colors hover:text-blue-700">
          <h2 className={`line-clamp-2 ${compact ? 'min-h-4 text-xs' : 'min-h-8 text-sm sm:text-base'}`}>{product.name}</h2>
        </Link>
        <p className={`mt-1 line-clamp-2 text-gray-600 ${compact ? 'min-h-6 text-[10px] leading-3 sm:line-clamp-1' : 'mt-1.5 min-h-8 text-xs leading-4 sm:text-sm sm:leading-5'}`}>{product.shortDescription}</p>

        <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${compact ? 'mt-1.5' : 'mt-2.5'}`}>
          <span className={`font-bold text-navy ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>{formatPrice(product.sellingPrice)}</span>
          {product.mrp && product.mrp > product.sellingPrice && <span className={`text-gray-500 line-through ${compact ? 'text-[9px]' : 'text-[10px] sm:text-xs'}`}>{formatPrice(product.mrp)}</span>}
        </div>
        <p className={`mt-1 text-[9px] font-medium ${outOfStock ? 'text-red-600' : product.stockQuantity <= 5 ? 'text-orange-600' : 'text-green-700'} sm:text-[10px]`}>
          {outOfStock ? 'Currently unavailable' : product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left` : 'In stock'}
        </p>

        <div className={`mt-auto grid grid-cols-2 gap-1.5 ${compact ? 'pt-2' : 'grid-cols-[1fr_auto] pt-2.5'}`}>
          <Button type="button" onClick={addToCart} disabled={outOfStock} className={`min-h-8 bg-navy text-white hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50 ${compact ? 'px-1.5 text-[9px] sm:text-[10px]' : 'min-h-9 text-[10px] sm:text-xs'}`}>
            {feedback === 'Added to cart' ? <Check className="mr-1.5 h-3 w-3" /> : <ShoppingCart className="mr-1.5 h-3 w-3" />}
            {feedback || 'Add to cart'}
          </Button>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label={`Enquire about ${product.name} on WhatsApp`} className={`inline-flex min-w-0 items-center justify-center rounded-md border border-green-600 font-medium text-green-700 transition hover:bg-green-600 hover:text-white ${compact ? 'min-h-8 px-1.5 text-[9px] sm:text-[10px]' : 'min-h-9 px-2 text-[10px] sm:text-xs'}`}>
            <MessageCircle className="mr-1 h-3 w-3 shrink-0" />{compact ? 'WhatsApp' : 'Enquire'}
          </a>
        </div>
      </div>
    </article>
  )
}
