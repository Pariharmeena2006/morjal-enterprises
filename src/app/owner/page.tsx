import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MessageCircle, ShoppingBag } from 'lucide-react'
import Image from 'next/image'

async function getWebsiteSettings() {
  let settings = await prisma.websiteSettings.findFirst()
  if (!settings) {
    settings = await prisma.websiteSettings.create({
      data: {}
    })
  }
  return JSON.parse(JSON.stringify(settings))
}

export default async function OwnerPage() {
  const settings = await getWebsiteSettings()

  return (
    <div className="min-h-screen bg-grey-light">
      {/* Hero Section */}
      <div className="bg-navy text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                {settings.ownerName || 'Owner Name'}
              </h1>
              <p className="text-xl text-gold mb-4">
                {settings.ownerTitle || 'Founder & CEO'}
              </p>
              <p className="text-gray-300 mb-6">
                {settings.ownerBio || 'Meet the visionary behind MORJAL Enterprises. Committed to delivering premium electrical safety products and exceptional customer service.'}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link href="/products">
                  <Button size="lg" className="w-full bg-gold text-white hover:bg-gold-dark sm:w-auto">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Browse Products
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-white hover:text-navy sm:w-auto">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Contact
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              {settings.ownerImageUrl ? (
                <div className="relative h-64 w-64 max-w-full overflow-hidden rounded-full border-4 border-gold sm:h-80 sm:w-80">
                  <Image
                    src={settings.ownerImageUrl}
                    alt={settings.ownerName || 'Owner'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-64 w-64 max-w-full items-center justify-center rounded-full bg-gold sm:h-80 sm:w-80">
                  <span className="text-6xl font-bold text-navy">
                    {(settings.ownerName || 'M')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-navy text-center mb-8">The Story Behind MORJAL Enterprises</h2>
            <div className="prose max-w-none text-gray-700 text-lg">
              <p className="mb-4">
                {settings.ownerStory || `MORJAL Enterprises was founded with a simple yet powerful mission: to provide workplaces across India with premium electrical safety products that protect lives and ensure compliance.

                With years of experience in the electrical safety industry, we understand the critical importance of quality equipment. Every product we offer is carefully selected to meet the highest safety standards and provide reliable protection for workers in various industries.

                Our commitment goes beyond just selling products. We believe in building long-term relationships with our customers, providing expert guidance, and ensuring complete satisfaction with every purchase.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission and Vision */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-navy mb-4">Our Mission</h3>
                <p className="text-gray-700">
                  To be India&apos;s most trusted provider of electrical safety products, ensuring every workplace has access to premium quality equipment that protects workers and promotes safety culture.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-navy mb-4">Our Vision</h3>
                <p className="text-gray-700">
                  To create a safer working environment across all industries by delivering innovative, reliable, and certified electrical safety solutions backed by exceptional customer service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-16 bg-navy text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-navy">Q</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality</h3>
              <p className="text-gray-300">We never compromise on quality. Every product meets stringent safety standards.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-navy">I</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Integrity</h3>
              <p className="text-gray-300">Honest and transparent business practices build trust with our customers.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-navy">S</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Service</h3>
              <p className="text-gray-300">Exceptional customer service is at the heart of everything we do.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">Let&apos;s Work Together</h2>
          <p className="text-navy mb-6 text-lg">
            Whether you need electrical safety products for your workplace or expert guidance, we&apos;re here to help.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-navy text-white hover:bg-navy-light">
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
