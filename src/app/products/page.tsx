'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, Headphones, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Truck } from 'lucide-react'
import ProductCard from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string
  sellingPrice: number
  mrp?: number | null
  stockQuantity: number
  isOutOfStock: boolean
  category: string
  images: Array<{ url: string; alt?: string | null }>
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get('category')
    if (requestedCategory) setCategory(requestedCategory)
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadProducts = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const response = await fetch('/api/products', { cache: 'no-store' })
        if (!response.ok) throw new Error('We could not load products right now.')
        const data: unknown = await response.json()
        if (!Array.isArray(data)) throw new Error('The product list could not be read.')
        if (!cancelled) setProducts((data as Product[]).slice(0, 5))
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Something went wrong while loading products.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadProducts()
    return () => { cancelled = true }
  }, [retryKey])

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [products],
  )

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    const result = products.filter((product) => {
      const matchesQuery = !query || `${product.name} ${product.shortDescription} ${product.category}`.toLocaleLowerCase().includes(query)
      const matchesCategory = category === 'all' || product.category === category
      return matchesQuery && matchesCategory
    })

    if (sortBy === 'price-low') result.sort((a, b) => a.sellingPrice - b.sellingPrice)
    if (sortBy === 'price-high') result.sort((a, b) => b.sellingPrice - a.sellingPrice)
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [products, searchQuery, category, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setCategory('all')
    setSortBy('recommended')
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative isolate min-h-[300px] overflow-hidden bg-[#041c42] text-white sm:min-h-[350px] lg:min-h-[390px]">
        <Image src="/banner-1.jpeg" alt="Electrical safety testing equipment" fill priority sizes="100vw" className="z-0 object-cover object-center" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#031a3d] via-[#031a3d]/90 to-[#031a3d]/15" />
        <div className="container relative z-20 mx-auto flex min-h-[300px] items-center px-4 py-10 sm:min-h-[350px] lg:min-h-[390px]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[0.2em] text-gold sm:text-xs"><span className="h-px w-8 bg-gold" /> INDUSTRIAL SAFETY EQUIPMENT</span>
            <h1 className="mt-4 text-3xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">Reliable protection<br /><span className="text-gold">for a safer tomorrow.</span></h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">Explore dependable safety essentials selected to support your people and workplace.</p>
            <a href="#products" className="mt-6 inline-flex items-center gap-3 rounded-full bg-gold px-5 py-3 text-xs font-bold text-navy transition hover:bg-white sm:text-sm">Explore our products <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-5 right-6 z-20 hidden items-center gap-2 rounded-full border border-white/20 bg-[#031a3d]/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur sm:flex"><ShieldCheck className="h-4 w-4 text-gold" /> Protection you can trust</div>
      </section>

      <section className="border-b border-blue-100 bg-white py-4" aria-label="Product filters">
        <div className="container mx-auto min-w-0 px-4">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search products</span>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products by name, details, or category…"
                className="h-11 rounded-lg border-gray-200 pl-12 focus:border-gold focus:ring-gold"
              />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-gray-500">
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              <span className="sr-only">Filter by category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-full min-w-32 bg-transparent text-sm font-medium text-navy outline-none">
                <option value="all">All categories</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="flex h-11 items-center rounded-lg border border-gray-200 bg-white px-3">
              <span className="sr-only">Sort products</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-full min-w-40 bg-transparent text-sm font-medium text-navy outline-none">
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section id="products" className="scroll-mt-28 bg-[#fbfcfe] py-8 sm:py-10 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A87913] sm:text-xs">PREMIUM QUALITY</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-navy sm:text-3xl">Featured safety products</h2>
              <p className="mt-1 max-w-xl text-xs leading-5 text-gray-600 sm:text-sm">Explore our handpicked collection of safety essentials trusted by professionals across industries.</p>
            </div>
            {!loading && !loadError && <p className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-navy shadow-sm sm:inline-flex"><BadgeCheck className="h-4 w-4 text-[#A87913]" /> High quality <span className="text-gray-300">•</span> Durable <span className="text-gray-300">•</span> Trusted</p>}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6" aria-label="Loading products" aria-live="polite">
              {[1, 2, 3, 4, 5].map((item) => <div key={item} className={`animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white ${item < 4 ? 'md:col-span-2' : 'md:col-span-3'}`}><div className="aspect-[2/1] bg-gray-100" /><div className="space-y-3 p-4"><div className="h-4 w-3/4 rounded bg-gray-100" /><div className="h-3 w-full rounded bg-gray-100" /><div className="h-10 rounded bg-gray-100" /></div></div>)}
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
              <p role="alert" className="font-medium text-red-800">{loadError}</p>
              <Button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-5 bg-navy text-white hover:bg-navy-deep">Try again</Button>
            </div>
          ) : visibleProducts.length ? (
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:grid-cols-6 md:gap-5">
              {visibleProducts.map((product, index) => {
                const remainder = visibleProducts.length % 3
                const isFinalRow = index >= visibleProducts.length - remainder && remainder > 0
                const span = isFinalRow ? (remainder === 1 ? 'md:col-span-6' : 'md:col-span-3') : 'md:col-span-2'
                return <div key={product.id} className={span}><ProductCard compact product={product} /></div>
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-background-light px-6 py-14 text-center">
              <Search className="mx-auto h-10 w-10 text-navy/40" />
              <h3 className="mt-4 text-xl font-bold text-navy">No matching products</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">Try another search or category, or clear filters to see the full collection.</p>
              <Button type="button" variant="outline" onClick={clearFilters} className="mt-5 border-navy text-navy hover:bg-navy hover:text-white"><RotateCcw className="mr-2 h-4 w-4" />Clear filters</Button>
            </div>
          )}
        </div>
      </section>

      <section className="px-3 py-5 sm:px-5 sm:py-8 lg:px-8">
        <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-2xl bg-navy text-white md:min-h-44 md:grid-cols-[1fr_0.8fr]">
          <div className="relative z-10 flex flex-col items-start justify-center px-5 py-7 sm:px-8 md:px-10">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-gold">NEED HELP?</p>
            <h2 className="mt-1 text-xl font-bold sm:text-2xl">We’re here to assist you.</h2>
            <p className="mt-2 max-w-lg text-xs leading-5 text-blue-100 sm:text-sm">Have a question about our products? Our team is ready to help you choose what works for your needs.</p>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-bold text-navy transition hover:bg-white">Contact our team <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="relative hidden min-h-44 md:block">
            <Image src="/banner-1.jpeg" alt="Electrical safety equipment" fill sizes="40vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/30 to-transparent" />
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-[#f1f5fa] py-5 sm:py-6">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 text-xs font-semibold text-navy sm:grid-cols-4 sm:gap-6 sm:text-sm">
          <span className="inline-flex items-center justify-center gap-2"><ShieldCheck className="h-5 w-5 shrink-0 text-[#A87913]" />Secure ordering</span>
          <span className="inline-flex items-center justify-center gap-2"><Truck className="h-5 w-5 shrink-0 text-[#A87913]" />Reliable delivery</span>
          <span className="inline-flex items-center justify-center gap-2"><BadgeCheck className="h-5 w-5 shrink-0 text-[#A87913]" />Genuine products</span>
          <span className="inline-flex items-center justify-center gap-2"><Headphones className="h-5 w-5 shrink-0 text-[#A87913]" />Dedicated support</span>
        </div>
      </section>
    </div>
  )
}
