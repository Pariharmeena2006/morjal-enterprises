import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || 'https://morjalenterprises.in'
  const staticRoutes = [
    '', '/products', '/about', '/contact', '/faq', '/news',
    '/cancellation-policy', '/privacy-policy', '/refund-policy',
    '/return-policy', '/shipping-policy', '/terms-and-conditions',
  ].map((path) => ({ url: `${base}${path}`, changeFrequency: 'weekly' as const, priority: path === '' ? 1 : 0.7 }))

  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    })
    const productRoutes = products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    return [...staticRoutes, ...productRoutes]
  } catch {
    return staticRoutes
  }
}
