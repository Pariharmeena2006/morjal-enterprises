import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions())

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const sellingPrice = Number(body.sellingPrice)
    const stockQuantity = Number(body.stockQuantity)
    const images = Array.isArray(body.images)
      ? body.images.map((image: { url?: unknown; alt?: unknown }) => ({
          url: typeof image.url === 'string' ? image.url.trim() : '',
          alt: typeof image.alt === 'string' ? image.alt.trim() : null,
        })).filter((image: { url: string }) => image.url)
      : []
    if (!body.name?.trim() || !body.category?.trim() || !body.shortDescription?.trim() || !body.description?.trim()) {
      return NextResponse.json({ error: 'Complete all required product fields' }, { status: 400 })
    }
    const slug = typeof body.slug === 'string' && body.slug.trim() ? body.slug.trim() : generateSlug(body.name)
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0 || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return NextResponse.json({ error: 'Price and stock must be valid non-negative numbers' }, { status: 400 })
    }
    if (images.length > 5) {
      return NextResponse.json({ error: 'A product can have up to 5 photos' }, { status: 400 })
    }

    const productFields = {
      name: body.name,
      slug,
      sku: body.sku || null,
      shortDescription: body.shortDescription,
      description: body.description,
      brand: body.brand,
      sellingPrice,
      mrp: body.mrp === '' || body.mrp == null ? null : Number(body.mrp),
      stockQuantity,
      isOutOfStock: stockQuantity === 0,
      category: body.category,
      features: body.features,
      specifications: body.specifications,
      applications: body.applications,
      material: body.material,
      dimensions: body.dimensions,
      weight: body.weight,
      packageDimensions: body.packageDimensions,
      manufacturer: body.manufacturer,
      countryOfOrigin: body.countryOfOrigin,
      certifications: body.certifications,
      safetyInstructions: body.safetyInstructions,
      warranty: body.warranty,
      shippingInfo: body.shippingInfo,
      faq: body.faq,
      isPublished: body.isPublished ?? true,
    }

    const product = images.length > 0
      ? await getDb().orm.public.Product.create({
          ...productFields,
          images: (i) => i.create(images.map((image: { url: string; alt: string | null }, index: number) => ({
            url: image.url,
            alt: image.alt,
            order: index,
          }))),
        })
      : await getDb().orm.public.Product.create(productFields)

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions())

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, images, ...productData } = body
    const db = getDb()

    // Delete existing images
    await db.orm.public.ProductImage.where({ productId: id }).deleteAll()

    // Update product with new images
    const product = await db.orm.public.Product.where({ id }).update({
      ...productData,
    })
    if (images && images.length > 0) {
      await db.orm.public.ProductImage.createAll(
        images.map((img: { url: string; alt: string | null }, index: number) => ({
          url: img.url,
          alt: img.alt,
          order: index,
          productId: id,
        }))
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions())

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    await getDb().orm.public.Product.where({ id }).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(getAuthOptions())

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await getDb().orm.public.Product
      .include('images')
      .orderBy((p) => p.createdAt.desc())
      .all()

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
