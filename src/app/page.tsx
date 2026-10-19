'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  Headphones,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react'
import ProductCard from '@/components/product-card'
import VideoSection from '@/components/video-section'
import { Button } from '@/components/ui/button'

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

interface Banner {
  id: string
  title: string
  description?: string
  buttonText?: string
  buttonUrl?: string
  desktopImageUrl?: string
  mobileImageUrl?: string
  isEnabled: boolean
  order: number
}

const promiseCards = [
  { icon: ShieldCheck, title: 'Safety-focused range', description: 'Purposeful equipment for safer workplaces.' },
  { icon: BadgeCheck, title: 'Carefully selected', description: 'Product details to help you choose confidently.' },
  { icon: Truck, title: 'Delivery across India', description: 'Shop online wherever your work takes you.' },
  { icon: Headphones, title: 'Real support', description: 'We are here for product and order questions.' },
]

const supportHighlights = [
  { icon: Headphones, title: 'Real people, ready to help', description: 'Get friendly support when you have a question.' },
  { icon: BadgeCheck, title: 'Clear answers, no guesswork', description: 'We make the next step simple and straightforward.' },
  { icon: Truck, title: 'Convenient delivery', description: 'We support customers and orders across India.' },
]

const safetySteps = [
  { number: '01', title: 'Pause & assess', description: 'Take a moment to understand the task and the work area.' },
  { number: '02', title: 'Plan your protection', description: 'Choose protection that is suitable for the job at hand.' },
  { number: '03', title: 'Check before starting', description: 'Inspect your equipment and follow your workplace procedures.' },
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      const [productResponse, bannerResponse] = await Promise.allSettled([
        fetch('/api/products', { cache: 'no-store' }),
        fetch('/api/banners', { cache: 'no-store' }),
      ])
      if (!active) return

      if (productResponse.status === 'fulfilled' && productResponse.value.ok) {
        const data = await productResponse.value.json()
        if (active && Array.isArray(data)) setProducts(data)
      }
      if (bannerResponse.status === 'fulfilled' && bannerResponse.value.ok) {
        const data = await bannerResponse.value.json()
        if (active && Array.isArray(data)) {
          setBanners(data.filter((item: Banner) => item.isEnabled).sort((a: Banner, b: Banner) => a.order - b.order))
        }
      }
      if (active) setLoading(false)
    }

    load().catch((error) => {
      console.error('Unable to load homepage content:', error)
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  const heroBanner = banners[0]
  const heroImage = heroBanner?.desktopImageUrl || heroBanner?.mobileImageUrl || '/banner-1.jpeg'

  return (
    <div className="home-page min-h-screen overflow-hidden bg-white">
      <section className="home-hero-wrap px-3 pt-3 sm:px-5 sm:pt-5 lg:px-8 lg:pt-8">
        <div className="home-hero container mx-auto grid overflow-hidden rounded-[1.75rem] lg:min-h-[560px] lg:grid-cols-[1.02fr_0.98fr]">
          <div className="home-hero-copy relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 md:py-16 lg:px-14 lg:py-20">
            <span className="home-hero-kicker"><span className="home-kicker-dot" />MORJAL ENTERPRISES · KOTA, INDIA</span>
            <h1 className="mt-6 max-w-2xl text-[2.65rem] font-bold leading-[1.06] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.8rem]">
              The right safety gear.<br />
              <span className="text-gold">Ready for work.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-blue-100 sm:text-lg">
              Shop electrical safety equipment and workplace essentials selected to help teams work with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products"><Button size="lg" className="h-12 bg-gold px-6 font-semibold text-navy hover:bg-gold/90">Shop all products <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link href="/contact"><Button size="lg" variant="outline" className="h-12 border-white/35 bg-white/5 px-6 text-white hover:bg-white hover:text-navy">Talk to our team</Button></Link>
            </div>
            <div className="mt-9 flex items-center gap-3 border-t border-white/15 pt-6 text-sm text-blue-100">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gold"><BadgeCheck className="h-5 w-5" /></span>
              <span>Product guidance · Easy online ordering · Delivery support</span>
            </div>
            <Link href="/products" className="home-hero-scroll mt-7 hidden w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200/80 lg:flex">
              Explore the collection <ArrowDownRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="home-hero-image relative min-h-[310px] sm:min-h-[390px] lg:min-h-full">
            <Image src={heroImage} alt={heroBanner?.title || 'Electrical safety equipment'} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="home-hero-image-shade" />
            <div className="home-hero-image-caption">
              <span className="home-caption-icon"><Zap className="h-4 w-4" /></span>
              <div><p>{heroBanner?.title || 'Safety starts with the right equipment'}</p><span>{heroBanner?.description || 'Explore workplace safety essentials'}</span></div>
            </div>
            <span className="home-image-index">MORJAL <span /> SAFETY</span>
          </div>
        </div>
      </section>

      <section className="home-promises border-b border-blue-100" aria-label="Why shop with MORJAL">
        <div className="container mx-auto grid grid-cols-2 gap-0 px-4 py-5 md:grid-cols-4 md:py-7">
          {promiseCards.map(({ icon: Icon, title, description }, index) => (
            <div className={`home-promise ${index ? 'home-promise-divided' : ''}`} key={title}>
              <span><Icon className="h-5 w-5" /></span>
              <div><h2>{title}</h2><p>{description}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-category-section relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full border-[50px] border-blue-100/60" />
        <div className="container relative mx-auto grid gap-10 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          <div className="max-w-lg">
            <p className="home-section-label">HERE WHEN YOU NEED US</p>
            <h2 className="mt-3 text-3xl font-bold leading-[1.08] tracking-tight text-navy sm:text-5xl">Good service makes all the difference.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">From your first question to delivery, our team is here to make every step feel simple and supported.</p>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3c7c]">
              Talk to our team <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-8 flex items-center gap-3 border-t border-blue-200 pt-5 text-xs font-medium text-gray-500 sm:text-sm">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#BA8A24]" /> MORJAL Enterprises · Kota, Rajasthan
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_18px_50px_rgba(7,47,100,0.08)] sm:space-y-4 sm:p-6">
            {supportHighlights.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="flex items-center gap-4 rounded-2xl bg-[#f5f8fc] p-4 sm:gap-5 sm:p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-gold"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-navy sm:text-lg">{title}</span>
                  <span className="mt-1 block text-xs leading-5 text-gray-500 sm:text-sm">{description}</span>
                </span>
                <span className="text-xs font-bold tracking-[0.12em] text-gray-300">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-featured-section py-14 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="home-section-label">SHOP THE RANGE</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Popular picks</h2><p className="mt-2 text-sm text-gray-600 sm:text-base">Explore the essentials customers look for.</p></div>
            <Link href="/products"><Button variant="outline" className="w-fit border-navy text-navy hover:bg-navy hover:text-white">See the full shop <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="home-product-skeleton" />)}</div>
          ) : products.length ? (
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {products.slice(0, 4).map((product) => (
                <div className="w-[82%] shrink-0 snap-start sm:w-auto" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="home-featured-empty"><ShieldCheck className="mx-auto h-9 w-9 text-navy/50" /><p>Products will appear here soon.</p><Link href="/contact">Ask us about a product <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div>
          )}
        </div>
      </section>

      <VideoSection />

      <section className="home-about-row py-14 sm:py-16 lg:py-20">
        <div className="container mx-auto grid items-center gap-9 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="home-about-art relative overflow-hidden rounded-[1.75rem]">
            <Image src="/banner-1.jpeg" alt="Electrical testing and safety equipment" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            <div className="home-about-art-tag"><ShieldCheck className="h-4 w-4" /> WORKPLACE SAFETY</div>
          </div>
          <div className="py-2">
            <p className="home-section-label">A SAFER WAY TO SOURCE</p>
            <h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">Reliable essentials, backed by people who care.</h2>
            <p className="mt-4 max-w-xl leading-7 text-gray-600">MORJAL Enterprises is based in Kota, Rajasthan, and serves customers looking for electrical safety products and workplace protection essentials. We make it easier to explore products, get answers, and place an order.</p>
            <div className="mt-6 space-y-3">
              {['Clear product information to support your choice', 'Support for product and order questions', 'Online shopping with delivery across India'].map((point) => <p className="flex items-start gap-3 text-sm font-medium text-navy" key={point}><BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#BA8A24]" />{point}</p>)}
            </div>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/about"><Button className="bg-navy text-white hover:bg-navy-deep">Our story <ArrowRight className="ml-2 h-4 w-4" /></Button></Link><Link href="/contact"><Button variant="outline" className="border-navy text-navy">Contact us</Button></Link></div>
          </div>
        </div>
      </section>

      <section className="px-3 pb-14 sm:px-5 sm:pb-16 lg:px-8 lg:pb-20" aria-labelledby="safety-note-title">
        <div className="relative mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-[1.75rem] bg-navy px-6 py-9 text-white sm:px-10 sm:py-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16 lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border-[1px] border-white/10 sm:h-96 sm:w-96" />
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border border-gold/20 sm:h-72 sm:w-72" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-gold sm:text-xs">
              <Zap className="h-3.5 w-3.5" /> THE MORJAL SAFETY NOTE
            </span>
            <h2 id="safety-note-title" className="mt-5 max-w-lg text-2xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">A safer day starts before the work does.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-blue-100 sm:text-base sm:leading-7">A simple pause before a task can help bring safety into focus. Keep these three reminders in mind.</p>
            <Link href="/faq" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-gold transition hover:text-white">
              Explore our FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative space-y-3 sm:space-y-4">
            {safetySteps.map(({ number, title, description }) => (
              <div key={number} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm sm:gap-5 sm:p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 text-xs font-bold tracking-wide text-gold sm:h-12 sm:w-12 sm:text-sm">{number}</span>
                <div>
                  <h3 className="text-sm font-bold sm:text-base">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-blue-100/75 sm:text-sm sm:leading-6">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-contact-row px-3 pb-5 sm:px-5 sm:pb-8 lg:px-8">
        <div className="container mx-auto flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-navy px-6 py-9 text-white sm:flex-row sm:items-center sm:px-10 md:py-12">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">NEED A HAND?</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Not sure what to choose?</h2><p className="mt-2 text-sm leading-6 text-blue-100 sm:text-base">Reach out with your product or bulk enquiry. We’ll help you find the right place to start.</p></div>
          <Link href="/contact" className="shrink-0"><Button size="lg" className="bg-gold text-navy hover:bg-gold/90">Get in touch <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>
    </div>
  )
}
