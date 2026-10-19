'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ShoppingCart } from 'lucide-react'
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
  const mainImage = product.images?.[0]
  const outOfStock = product.isOutOfStock || product.stockQuantity < 1
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
      <Link href={`/products/${product.slug}`} className={`group relative block overflow-hidden bg-background-light ${compact ? 'aspect-[2/1]' : 'aspect-[4/3]'}`} aria-label={`View ${product.name}`}>
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy to-navy-deep text-gold">
            <ShoppingCart className="h-12 w-12 opacity-70" />
          </div>
        )}
        {discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">{discount}% OFF</span>}
        {outOfStock && <span className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-center text-sm font-semibold text-white">Out of stock</span>}
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? 'p-3 sm:p-3.5' : 'p-4 sm:p-5'}`}>
        <Link href={`/products/${product.slug}`} className="font-semibold leading-snug text-navy transition-colors hover:text-blue-700">
          <h2 className={`line-clamp-2 ${compact ? 'min-h-5 text-sm' : 'min-h-11'}`}>{product.name}</h2>
        </Link>
        <p className={`mt-1 line-clamp-2 text-gray-600 ${compact ? 'min-h-8 text-[11px] leading-4 sm:line-clamp-1' : 'mt-2 min-h-10 text-sm leading-5'}`}>{product.shortDescription}</p>

        <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${compact ? 'mt-2' : 'mt-4'}`}>
          <span className={`font-bold text-navy ${compact ? 'text-base' : 'text-xl'}`}>{formatPrice(product.sellingPrice)}</span>
          {product.mrp && product.mrp > product.sellingPrice && <span className={`text-gray-500 line-through ${compact ? 'text-[10px]' : 'text-sm'}`}>{formatPrice(product.mrp)}</span>}
        </div>
        <p className={`mt-1 text-[10px] font-medium ${outOfStock ? 'text-red-600' : product.stockQuantity <= 5 ? 'text-orange-600' : 'text-green-700'}`}>
          {outOfStock ? 'Currently unavailable' : product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left` : 'In stock'}
        </p>

        <div className={`mt-auto grid grid-cols-2 gap-2 ${compact ? 'pt-3' : 'grid-cols-[1fr_auto] pt-4'}`}>
          <Button type="button" onClick={addToCart} disabled={outOfStock} className={`min-h-9 bg-navy text-white hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50 ${compact ? 'px-2 text-[10px] sm:text-xs' : 'min-h-11'}`}>
            {feedback === 'Added to cart' ? <Check className="mr-2 h-4 w-4" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            {feedback || 'Add to cart'}
          </Button>
          <Link href={`/products/${product.slug}`} aria-label={`View details for ${product.name}`} className="min-w-0">
            <Button type="button" variant="outline" className={`min-h-9 w-full border-[#BA8A24] text-navy hover:bg-navy hover:text-white ${compact ? 'px-2 text-[10px] sm:text-xs' : 'min-h-11 px-3'}`}>{compact ? 'View details' : 'Details'}</Button>
          </Link>
        </div>
      </div>
    </article>
  )
}
