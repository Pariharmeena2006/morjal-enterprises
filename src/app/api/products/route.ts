import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(products)
  } catch {
    console.error('Error fetching products')
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
