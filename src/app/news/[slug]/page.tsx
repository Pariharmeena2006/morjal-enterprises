import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, Newspaper, UserRound } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = await getDb().orm.public.News
    .where({ slug: params.slug, published: true })
    .first()

  if (!article) notFound()

  const date = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(article.createdAt)

  return (
    <main className="min-h-screen bg-[#F5F8FD]">
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Link href="/news" className="mb-7 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-navy transition hover:text-[#A87913]">
          <ArrowLeft className="h-4 w-4" /> Back to news
        </Link>

        <article className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_70px_-40px_rgba(4,28,66,0.5)]">
          {article.imageUrl ? (
            <div className="relative aspect-[16/8] w-full bg-navy">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/6] items-center justify-center bg-gradient-to-br from-[#073B82] to-[#041C42] text-white/70">
              <Newspaper className="h-16 w-16" strokeWidth={1.2} />
            </div>
          )}

          <div className="mx-auto max-w-3xl px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#FFF7E3] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#8A6413]">
              <Newspaper className="h-3.5 w-3.5" /> MORJAL news
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl lg:text-5xl">{article.title}</h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-gray-100 pb-6 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-navy" />{date}</span>
              {article.authorName && (
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-navy" />
                  <span className="font-medium text-navy">{article.authorName}</span>
                  {article.authorTitle && <span>· {article.authorTitle}</span>}
                </span>
              )}
            </div>

            {article.excerpt && (
              <p className="mt-7 border-l-4 border-gold bg-[#FFF9E9] px-5 py-4 text-base font-medium leading-7 text-gray-700 sm:text-lg">
                {article.excerpt}
              </p>
            )}

            <div className="mt-8 whitespace-pre-line text-base leading-8 text-gray-700 sm:text-lg sm:leading-9">
              {article.content}
            </div>
          </div>
        </article>

        <div className="mt-8 flex justify-center">
          <Link href="/news" className="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-semibold text-white transition hover:bg-[#062E67]">
            <ArrowLeft className="h-4 w-4" /> More news and updates <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
