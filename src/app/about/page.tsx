import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BadgeCheck, Headset, ShieldCheck, Truck, Zap } from 'lucide-react'

export default function AboutPage() {
  const values = [
    { title: 'Safety first', description: 'We put dependable protection at the centre of every recommendation.', icon: ShieldCheck },
    { title: 'Quality you can trust', description: 'We carefully select products from trusted manufacturers.', icon: BadgeCheck },
    { title: 'Support that helps', description: 'Get practical guidance to choose the right safety equipment.', icon: Headset },
    { title: 'Reliable delivery', description: 'We work to get essential equipment to workplaces across India.', icon: Truck },
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#041C42] via-[#073B82] to-[#062E67] text-white">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="container relative mx-auto grid items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold sm:text-sm">
              <Zap className="h-4 w-4" /> Safety is our purpose
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Protecting the people who keep India moving.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg sm:leading-8">
              MORJAL Enterprises helps businesses find dependable electrical safety equipment—with thoughtful guidance, trusted quality, and service they can count on.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-semibold text-navy transition hover:bg-[#f8d77f]">
                Explore products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
                Talk to our team
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[26rem] pb-10 lg:max-w-[30rem]">
            <div className="absolute inset-x-0 top-0 aspect-square rounded-full border border-gold/50" />
            <div className="relative mx-3 aspect-square overflow-hidden rounded-full border-4 border-white/10 bg-navy shadow-2xl">
              <Image
                src="/owner/devraj-profile.jpg"
                alt="Founder of MORJAL Enterprises"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center"
              />
            </div>
            <div className="absolute bottom-0 left-4 right-4 rounded-2xl border border-white/15 bg-white p-4 text-navy shadow-xl sm:left-8 sm:right-8 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A87913]">Built on trust</p>
              <p className="mt-1 text-sm font-semibold sm:text-base">A people-first approach to workplace safety.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A87913]">Our story</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-navy sm:text-4xl">Safer work starts with the right equipment.</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-gray-600 sm:text-lg">
            <p>
              MORJAL Enterprises was founded on a simple belief: every worker deserves access to reliable safety equipment. From our home in Kota, Rajasthan, we serve businesses and professionals looking for practical electrical safety solutions.
            </p>
            <p>
              Choosing protective equipment can be a serious responsibility. We bring together a carefully selected range of products and helpful support, so customers can make informed choices for their workplaces.
            </p>
            <p>
              Our promise is straightforward—put safety first, treat every customer with care, and make dependable products easier to access across India.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F8FD] py-14 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A87913]">What guides us</p>
            <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">Our mission &amp; vision</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm sm:p-9">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-gold"><ShieldCheck className="h-6 w-6" /></div>
              <h3 className="text-2xl font-bold text-navy">Our mission</h3>
              <p className="mt-3 leading-7 text-gray-600">To make quality electrical safety products and useful guidance accessible to workplaces, helping people build safer everyday working environments.</p>
            </article>
            <article className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm sm:p-9">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-gold"><Zap className="h-6 w-6" /></div>
              <h3 className="text-2xl font-bold text-navy">Our vision</h3>
              <p className="mt-3 leading-7 text-gray-600">A future where every worker and workplace can depend on the right protection, backed by trusted products and responsive service.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A87913]">The MORJAL difference</p>
            <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">What you can expect from us</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-2xl border border-blue-100 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF7E3] text-navy"><Icon className="h-6 w-6" /></div>
                <h3 className="text-lg font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#073B82] to-[#041C42] py-14 text-white sm:py-16">
        <div className="container mx-auto flex flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Let&apos;s make safety a priority</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Need help finding the right product?</h2>
            <p className="mt-2 text-blue-100">Our team is here to help you choose with confidence.</p>
          </div>
          <Link href="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-semibold text-navy transition hover:bg-[#f8d77f]">
            Contact us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
