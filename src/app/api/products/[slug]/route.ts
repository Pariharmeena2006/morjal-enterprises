import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: params.slug, isPublished: true },
      include: { images: { orderBy: { order: 'asc' } } },
    })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
