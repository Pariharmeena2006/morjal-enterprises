'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function NewVideoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [thumbnailImage, setThumbnailImage] = useState<{ url: string; alt: string } | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    order: '0',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingThumbnail(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const imageData = { url: data.url, alt: file.name }
        setThumbnailImage(imageData)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const removeThumbnail = () => {
    setThumbnailImage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order),
          thumbnailUrl: thumbnailImage?.url,
        })
      })

      if (response.ok) {
        router.push('/admin/videos')
      }
    } catch (error) {
      console.error('Error creating video:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-grey-light">
      <div className="bg-navy text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin/videos">
              <Button variant="outline" size="icon" className="text-white border-white hover:bg-white hover:text-navy">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Add New Video</h1>
              <p className="text-gray-300">MORJAL Enterprises</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Video Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="e.g., https://www.youtube.com/embed/VIDEO_ID or https://your-site.com/video.mp4"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use YouTube embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID) or direct video URL
                  </p>
                </div>
                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Image */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Thumbnail Image (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="thumbnailImage"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingThumbnail}
                  />
                  <label htmlFor="thumbnailImage" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      {uploadingThumbnail ? 'Uploading...' : 'Click to upload'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </label>
                </div>

                {thumbnailImage && (
                  <div className="relative group">
                    <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                      <Image
                        src={thumbnailImage.url}
                        alt={thumbnailImage.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <Link href="/admin/videos">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Video'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
