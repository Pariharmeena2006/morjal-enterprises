import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const sellingPrice = Number(body.sellingPrice)
    const mrp = body.mrp === '' || body.mrp == null ? null : Number(body.mrp)
    const stockQuantity = Number(body.stockQuantity)
    const rawImages: unknown[] = Array.isArray(body.images) ? body.images : []
    if (rawImages.some((image) => !image || typeof image !== 'object' || typeof (image as { url?: unknown }).url !== 'string')) {
      return NextResponse.json({ error: 'Product images must each include a valid URL.' }, { status: 400 })
    }
    const images = rawImages.map((value) => {
      const image = value as { url: string; alt?: unknown }
      return {
          url: typeof image.url === 'string' ? image.url.trim() : '',
          alt: typeof image.alt === 'string' ? image.alt.trim() : null,
      }
    }).filter((image) => image.url)
    if (typeof body.name !== 'string' || !body.name.trim() || typeof body.category !== 'string' || !body.category.trim() || typeof body.shortDescription !== 'string' || !body.shortDescription.trim() || typeof body.description !== 'string' || !body.description.trim()) {
      return NextResponse.json({ error: 'Complete all required product fields' }, { status: 400 })
    }
    const slug = typeof body.slug === 'string' && body.slug.trim() ? generateSlug(body.slug.trim()) : generateSlug(body.name)
    if (!slug || !Number.isFinite(sellingPrice) || sellingPrice < 0 || (mrp !== null && (!Number.isFinite(mrp) || mrp < sellingPrice)) || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return NextResponse.json({ error: 'Price and stock must be valid non-negative numbers' }, { status: 400 })
    }
    if (images.length > 5 || images.some((image: { url: string }) => !/^https:\/\//i.test(image.url))) {
      return NextResponse.json({ error: 'A product can have up to 5 photos' }, { status: 400 })
    }
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        sku: typeof body.sku === 'string' && body.sku.trim() ? body.sku.trim() : null,
        shortDescription: body.shortDescription,
        description: body.description,
        brand: body.brand,
        sellingPrice,
        mrp,
        discountPercent: mrp && mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : null,
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
        featured: body.featured === true,
        isPublished: body.isPublished === true,
        images: images.length > 0 ? {
          create: images.map((image: { url: string; alt: string | null }, index: number) => ({
            url: image.url,
            alt: image.alt,
            order: index,
          }))
        } : undefined,
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product')
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    const current = await prisma.product.findUnique({ where: { id }, select: { id: true } })
    if (!current) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ error: 'Use the product-specific endpoint to update this product.' }, { status: 405 })
  } catch (error) {
    console.error('Error validating product update')
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } })
    if (orderItemCount > 0) {
      await prisma.product.update({ where: { id }, data: { isPublished: false } })
      return NextResponse.json({ success: true, archived: true })
    }
    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product')
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
