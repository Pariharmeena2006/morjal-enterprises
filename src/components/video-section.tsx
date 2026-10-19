'use client'

import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'

interface Video {
  id: string
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  order: number
  isEnabled: boolean
}

export default function VideoSection() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await fetch('/api/videos', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          setVideos(data)
        }
      } catch (error) {
        console.error('Error loading videos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [])

  if (loading) {
    return (
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#BA8A24]">WATCH & LEARN</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Video Gallery</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (videos.length === 0) {
    return null
  }

  return (
    <section className="py-14 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#BA8A24]">WATCH & LEARN</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Video Gallery</h2>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">Explore our products through videos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl">
              <div className="relative aspect-video bg-gray-900">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy to-[#0b3c7c]">
                    <Play className="h-16 w-16 text-white/80" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => window.open(video.videoUrl, '_blank')}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-navy transition-transform hover:scale-110"
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy mb-2 line-clamp-1">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
