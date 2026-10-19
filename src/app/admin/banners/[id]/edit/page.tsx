'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function EditBannerPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploadingDesktop, setUploadingDesktop] = useState(false)
  const [uploadingMobile, setUploadingMobile] = useState(false)
  const [desktopImage, setDesktopImage] = useState<{ url: string; alt: string } | null>(null)
  const [mobileImage, setMobileImage] = useState<{ url: string; alt: string } | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buttonText: '',
    buttonUrl: '',
    order: '0',
    isEnabled: true,
  })

  useEffect(() => {
    fetchBanner()
  }, [params.id])

  const fetchBanner = async () => {
    try {
      const response = await fetch(`/api/admin/banners/${params.id}`)
      if (response.ok) {
        const banner = await response.json()
        setFormData({
          title: banner.title || '',
          description: banner.description || '',
          buttonText: banner.buttonText || '',
          buttonUrl: banner.buttonUrl || '',
          order: banner.order?.toString() || '0',
          isEnabled: banner.isEnabled ?? true,
        })
        if (banner.desktopImageUrl) {
          setDesktopImage({ url: banner.desktopImageUrl, alt: banner.title })
        }
        if (banner.mobileImageUrl) {
          setMobileImage({ url: banner.mobileImageUrl, alt: banner.title })
        }
      }
    } catch (error) {
      console.error('Error fetching banner:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'desktop') {
      setUploadingDesktop(true)
    } else {
      setUploadingMobile(true)
    }

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
        if (type === 'desktop') {
          setDesktopImage(imageData)
        } else {
          setMobileImage(imageData)
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploadingDesktop(false)
      setUploadingMobile(false)
    }
  }

  const removeImage = (type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      setDesktopImage(null)
    } else {
      setMobileImage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/banners/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order),
          isEnabled: formData.isEnabled,
          desktopImageUrl: desktopImage?.url,
          mobileImageUrl: mobileImage?.url,
        })
      })

      if (response.ok) {
        router.push('/admin/banners')
      }
    } catch (error) {
      console.error('Error updating banner:', error)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
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
            <Link href="/admin/banners">
              <Button variant="outline" size="icon" className="text-white border-white hover:bg-white hover:text-navy">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit Banner</h1>
              <p className="text-gray-300">MORJAL Enterprises</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Banner Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Banner Information</CardTitle>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      placeholder="e.g., Shop Now"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buttonUrl">Button URL</Label>
                    <Input
                      id="buttonUrl"
                      name="buttonUrl"
                      value={formData.buttonUrl}
                      onChange={handleInputChange}
                      placeholder="e.g., /products"
                    />
                  </div>
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
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="h-4 w-4 accent-[#073B82]"
                  />
                  <span className="text-sm font-medium text-navy">Show this banner on the storefront</span>
                </label>
              </CardContent>
            </Card>

            {/* Desktop Image */}
            <Card>
              <CardHeader>
                <CardTitle>Desktop Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="desktopImage"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleImageUpload(e, 'desktop')}
                    className="hidden"
                    disabled={uploadingDesktop}
                  />
                  <label htmlFor="desktopImage" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      {uploadingDesktop ? 'Uploading...' : 'Click to upload'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </label>
                </div>

                {desktopImage && (
                  <div className="relative group">
                    <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                      <Image
                        src={desktopImage.url}
                        alt={desktopImage.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage('desktop')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile Image */}
            <Card>
              <CardHeader>
                <CardTitle>Mobile Image (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="mobileImage"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleImageUpload(e, 'mobile')}
                    className="hidden"
                    disabled={uploadingMobile}
                  />
                  <label htmlFor="mobileImage" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      {uploadingMobile ? 'Uploading...' : 'Click to upload'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </label>
                </div>

                {mobileImage && (
                  <div className="relative group">
                    <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                      <Image
                        src={mobileImage.url}
                        alt={mobileImage.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage('mobile')}
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
            <Link href="/admin/banners">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Update Banner'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
