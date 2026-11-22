import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession()
    
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
    console.error('Error fetching product')
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const current = await prisma.product.findUnique({ where: { id: params.id } })
    if (!current) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const sellingPrice = Number(body.sellingPrice)
    const mrp = body.mrp === '' || body.mrp == null ? null : Number(body.mrp)
    const stockQuantity = Number(body.stockQuantity)
    if (!body.name?.trim() || !body.slug?.trim() || !body.category?.trim() || !body.shortDescription?.trim() || !body.description?.trim()) {
      return NextResponse.json({ error: 'Complete all required product fields' }, { status: 400 })
    }
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0 || (mrp !== null && (!Number.isFinite(mrp) || mrp < sellingPrice)) || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return NextResponse.json({ error: 'Price and stock must be valid non-negative numbers' }, { status: 400 })
    }

    if (Array.isArray(body.images) && body.images.some((image: unknown) => !image || typeof image !== 'object' || typeof (image as { url?: unknown }).url !== 'string')) {
      return NextResponse.json({ error: 'Product images must each include a valid URL.' }, { status: 400 })
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
    if (images && (images.length > 5 || images.some((image) => !/^https:\/\//i.test(image.url) && !/^\/uploads\/[a-zA-Z0-9._-]+$/.test(image.url)))) {
      return NextResponse.json({ error: 'A product can have up to 5 photos' }, { status: 400 })
    }
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: params.id },
        data: {
          name: body.name.trim(), slug: body.slug.trim(), sku: typeof body.sku === 'string' && body.sku.trim() ? body.sku.trim() : null,
          shortDescription: body.shortDescription.trim(), description: body.description.trim(),
          brand: body.brand || null, sellingPrice, mrp,
          discountPercent: mrp && mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : null,
          stockQuantity, isOutOfStock: stockQuantity === 0,
          featured: typeof body.featured === 'boolean' ? body.featured : current.featured,
          isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : current.isPublished,
          category: body.category.trim(), features: body.features || null,
          specifications: body.specifications || null, applications: body.applications || null,
          material: body.material || null, dimensions: body.dimensions || null, weight: body.weight || null,
          packageDimensions: body.packageDimensions || null, manufacturer: body.manufacturer || null,
          countryOfOrigin: body.countryOfOrigin || null, certifications: body.certifications || null,
          safetyInstructions: body.safetyInstructions || null, warranty: body.warranty || null,
          shippingInfo: body.shippingInfo || null, faq: body.faq || null, videoUrl: body.videoUrl || null,
        },
      })
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: params.id } })
        if (images.length) await tx.productImage.createMany({ data: images.map((image, index) => ({ ...image, productId: params.id, order: index })) })
      }
      return tx.product.findUniqueOrThrow({ where: { id: updated.id }, include: { images: { orderBy: { order: 'asc' } } } })
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product')
    return NextResponse.json({ error: 'Failed to update product. Check that the URL slug and SKU are unique.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const data: { isPublished?: boolean; featured?: boolean } = {}
    if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished
    if (typeof body.featured === 'boolean') data.featured = body.featured
    if (!Object.keys(data).length) return NextResponse.json({ error: 'No valid product status supplied' }, { status: 400 })
    const product = await prisma.product.update({ where: { id: params.id }, data, select: { id: true, isPublished: true, featured: true } })
    return NextResponse.json(product)
  } catch {
    console.error('Error updating product status')
    return NextResponse.json({ error: 'Failed to update product status' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const orderItemCount = await prisma.orderItem.count({ where: { productId: params.id } })
    if (orderItemCount > 0) {
      await prisma.product.update({ where: { id: params.id }, data: { isPublished: false } })
      return NextResponse.json({ success: true, archived: true })
    }
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, archived: false })
  } catch (error) {
    console.error('Error deleting product')
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
