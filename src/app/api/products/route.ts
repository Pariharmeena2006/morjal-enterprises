import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      include: { 
        images: true 
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json([], { status: 500 })
  }
}
