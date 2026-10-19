'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import ProductImageManager from '@/components/admin/product-image-manager'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)
  const [images, setImages] = useState<{ url: string; alt: string }[]>([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    shortDescription: '',
    description: '',
    brand: '',
    sellingPrice: '',
    mrp: '',
    stockQuantity: '',
    category: '',
    features: '',
    specifications: '',
    applications: '',
    material: '',
    dimensions: '',
    weight: '',
    packageDimensions: '',
    manufacturer: '',
    countryOfOrigin: '',
    certifications: '',
    safetyInstructions: '',
    warranty: '',
    shippingInfo: '',
    faq: '',
    isPublished: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'slug') setSlugEdited(true)
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' && !slugEdited ? { slug: value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') } : {}),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sellingPrice: parseFloat(formData.sellingPrice),
          mrp: formData.mrp ? parseFloat(formData.mrp) : null,
          stockQuantity: parseInt(formData.stockQuantity),
          images,
        })
      })

      if (response.ok) {
        router.push('/admin/products')
      } else {
        const result = await response.json().catch(() => ({}))
        setError(result.error || 'Product could not be saved. Please check the details and try again.')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Could not connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-grey-light">
      <div className="bg-navy text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin/products">
              <Button variant="outline" size="icon" className="text-white border-white hover:bg-white hover:text-navy">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Add New Product</h1>
              <p className="text-gray-300">MORJAL Enterprises</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Basic Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="product-name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sku">SKU (Product Code)</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Safety Gloves, Insulated Tools"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProductImageManager images={images} onChange={setImages} onUploadingChange={setUploading} maxImages={5} />
              </CardContent>
            </Card>

            {/* Pricing and Stock */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing and Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                  <Input
                    id="sellingPrice"
                    name="sellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mrp">MRP (₹)</Label>
                  <Input
                    id="mrp"
                    name="mrp"
                    type="number"
                    step="0.01"
                    value={formData.mrp}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 accent-[#073B82]"
                  />
                  <span className="text-sm font-medium text-navy">Publish this product in the shop</span>
                </label>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="features">Features</Label>
                  <Textarea
                    id="features"
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="One feature per line"
                  />
                </div>
                <div>
                  <Label htmlFor="specifications">Specifications</Label>
                  <Textarea
                    id="specifications"
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="applications">Applications</Label>
                  <Textarea
                    id="applications"
                    name="applications"
                    value={formData.applications}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Physical Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    placeholder="e.g., 10cm x 5cm x 2cm"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="e.g., 500g"
                  />
                </div>
                <div>
                  <Label htmlFor="packageDimensions">Package Dimensions</Label>
                  <Input
                    id="packageDimensions"
                    name="packageDimensions"
                    value={formData.packageDimensions}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Manufacturer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Manufacturer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                  <Input
                    id="countryOfOrigin"
                    name="countryOfOrigin"
                    value={formData.countryOfOrigin}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Safety and Warranty */}
            <Card>
              <CardHeader>
                <CardTitle>Safety and Warranty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="safetyInstructions">Safety Instructions</Label>
                  <Textarea
                    id="safetyInstructions"
                    name="safetyInstructions"
                    value={formData.safetyInstructions}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="warranty">Warranty Information</Label>
                  <Textarea
                    id="warranty"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="shippingInfo">Shipping Information</Label>
                  <Textarea
                    id="shippingInfo"
                    name="shippingInfo"
                    value={formData.shippingInfo}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="faq">FAQ</Label>
                  <Textarea
                    id="faq"
                    name="faq"
                    value={formData.faq}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {error && <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <Link href="/admin/products">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading || uploading}>
              <Save className="h-4 w-4 mr-2" />
              {uploading ? 'Wait for photo upload…' : loading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
