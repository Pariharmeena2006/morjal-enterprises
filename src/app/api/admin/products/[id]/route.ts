import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { order: 'asc' } } }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const current = await prisma.product.findUnique({ where: { id: params.id } })
    if (!current) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const sellingPrice = Number(body.sellingPrice)
    const stockQuantity = Number(body.stockQuantity)
    if (!body.name?.trim() || !body.slug?.trim() || !body.category?.trim() || !body.shortDescription?.trim() || !body.description?.trim()) {
      return NextResponse.json({ error: 'Complete all required product fields' }, { status: 400 })
    }
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0 || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return NextResponse.json({ error: 'Price and stock must be valid non-negative numbers' }, { status: 400 })
    }

    const images: { url: string; alt: string | null; order: number }[] | undefined = Array.isArray(body.images)
      ? body.images.map((image: { url?: unknown; alt?: unknown }, index: number) => ({
          url: typeof image.url === 'string' ? image.url.trim() : '',
          alt: typeof image.alt === 'string' && image.alt.trim() ? image.alt.trim() : null,
          order: index,
        })).filter((image: { url: string }) => image.url)
      : undefined
    if (Array.isArray(body.images) && !images?.length) {
      return NextResponse.json({ error: 'Product must have at least one photo' }, { status: 400 })
    }
    if (images && images.length > 5) {
      return NextResponse.json({ error: 'A product can have up to 5 photos' }, { status: 400 })
    }
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name.trim(), slug: body.slug.trim(), sku: body.sku || null,
        shortDescription: body.shortDescription.trim(), description: body.description.trim(),
        brand: body.brand || null, sellingPrice,
        mrp: body.mrp === '' || body.mrp == null ? null : Number(body.mrp),
        stockQuantity, isOutOfStock: stockQuantity === 0,
        isPublished: body.isPublished ?? current.isPublished,
        category: body.category.trim(), features: body.features || null,
        specifications: body.specifications || null, applications: body.applications || null,
        material: body.material || null, dimensions: body.dimensions || null, weight: body.weight || null,
        packageDimensions: body.packageDimensions || null, manufacturer: body.manufacturer || null,
        countryOfOrigin: body.countryOfOrigin || null, certifications: body.certifications || null,
        safetyInstructions: body.safetyInstructions || null, warranty: body.warranty || null,
        shippingInfo: body.shippingInfo || null, faq: body.faq || null,
        ...(images ? { images: { deleteMany: {}, create: images } } : {}),
      },
      include: { images: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product. Check that the URL slug and SKU are unique.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
