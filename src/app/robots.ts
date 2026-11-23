import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL || 'https://morjalenterprises.in'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/account', '/checkout', '/cart', '/track-order'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
