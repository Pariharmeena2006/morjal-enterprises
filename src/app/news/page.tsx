'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, Newspaper, RefreshCw, UserRound } from 'lucide-react'

type NewsArticle = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string | null
  authorName: string | null
  createdAt: string
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function ArticleImage({ article, featured = false }: { article: NewsArticle; featured?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#073B82] to-[#041C42] ${featured ? 'aspect-[16/10]' : 'aspect-[16/10]'}`}>
      {article.imageUrl ? (
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes={featured ? '(max-width: 1024px) 100vw, 58vw' : '(max-width: 768px) 100vw, 33vw'}
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/70">
          <Newspaper className={featured ? 'h-16 w-16' : 'h-12 w-12'} strokeWidth={1.2} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#041C42]/40 via-transparent to-transparent" />
    </div>
  )
}

function ArticleMeta({ article, featured = false }: { article: NewsArticle; featured?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs ${featured ? 'text-white/75' : 'text-gray-500'}`}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(article.createdAt)}
      </span>
      {article.authorName && (
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="h-3.5 w-3.5" />
          {article.authorName}
        </span>
      )}
    </div>
  )
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadArticles = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/news')
      if (!response.ok) throw new Error('News could not be loaded right now.')
      const data: unknown = await response.json()
      if (!Array.isArray(data)) throw new Error('News could not be loaded right now.')
      setArticles(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'News could not be loaded right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadArticles()
  }, [])

  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  return (
    <main className="min-h-screen bg-[#F5F8FD]">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#041C42] via-[#073B82] to-[#062E67] text-white">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="container relative mx-auto px-4 py-14 sm:py-20 lg:py-24">
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold sm:text-sm">
            <Newspaper className="h-4 w-4" /> MORJAL journal
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            News, stories &amp; updates
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg sm:leading-8">
            The latest from MORJAL Enterprises—company updates, product news, and stories about making workplaces safer.
          </p>
          <div className="mt-8 h-1 w-20 rounded-full bg-gold" />
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#A87913]">From our newsroom</p>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Latest updates</h2>
          </div>
          {!loading && !error && articles.length > 0 && (
            <p className="text-sm text-gray-500">{articles.length} {articles.length === 1 ? 'article' : 'articles'}</p>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {[0, 1].map((item) => <div key={item} className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />)}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-3xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
            <p className="font-semibold text-navy">{error}</p>
            <button onClick={() => void loadArticles()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#062E67]">
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-blue-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F8FD] text-navy"><Newspaper className="h-8 w-8" /></div>
            <h3 className="mt-5 text-xl font-bold text-navy">No updates just yet</h3>
            <p className="mt-2 text-gray-500">We&apos;re working on our next story. Please check back soon.</p>
          </div>
        ) : (
          <>
            {featuredArticle && (
              <Link href={`/news/${featuredArticle.slug}`} className="group mb-7 grid overflow-hidden rounded-3xl bg-white shadow-[0_16px_50px_-32px_rgba(4,28,66,0.5)] transition hover:shadow-xl lg:grid-cols-[1.15fr_0.85fr]">
                <ArticleImage article={featuredArticle} featured />
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <span className="mb-4 w-fit rounded-full bg-[#FFF7E3] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8A6413]">Featured story</span>
                  <ArticleMeta article={featuredArticle} />
                  <h3 className="mt-4 text-2xl font-bold leading-snug text-navy transition group-hover:text-[#A87913] sm:text-3xl">
                    {featuredArticle.title}
                  </h3>
                  {featuredArticle.excerpt && <p className="mt-4 line-clamp-4 leading-7 text-gray-600">{featuredArticle.excerpt}</p>}
                  <span className="mt-7 inline-flex items-center gap-2 font-semibold text-navy">
                    Read the story <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )}

            {otherArticles.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherArticles.map((article) => (
                  <Link key={article.id} href={`/news/${article.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-blue-50 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <ArticleImage article={article} />
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <ArticleMeta article={article} />
                      <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-navy transition group-hover:text-[#A87913]">{article.title}</h3>
                      {article.excerpt && <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-gray-600">{article.excerpt}</p>}
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                        Read more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
