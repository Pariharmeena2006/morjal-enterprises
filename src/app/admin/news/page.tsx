'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/admin/news')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch news')
      setNews(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news')
    } finally {
      setLoading(false)
    }
  }

  const deleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return

    try {
      const response = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete news')
      fetchNews()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete news')
    }
  }

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus }),
      })
      if (!response.ok) throw new Error('Failed to update news')
      fetchNews()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update news')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-grey-light flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grey-light">
      <div className="bg-navy text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="icon" className="text-white border-white hover:bg-white hover:text-navy">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">News Management</h1>
              <p className="text-gray-300">MORJAL Enterprises</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-end">
          <Link href="/admin/news/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add News Article
            </Button>
          </Link>
        </div>

        {news.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No news articles yet. Click &quot;Add News Article&quot; to create one.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {news.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(article.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => togglePublished(article.id, article.published)}
                        title={article.published ? 'Unpublish' : 'Publish'}
                      >
                        {article.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Link href={`/admin/news/${article.id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteNews(article.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {article.excerpt && (
                    <p className="text-gray-600 line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    {article.authorName && <span>By: {article.authorName}</span>}
                    {article.published ? (
                      <span className="text-green-600 font-medium">Published</span>
                    ) : (
                      <span className="text-orange-600 font-medium">Draft</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
