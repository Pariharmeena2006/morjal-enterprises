import { NextResponse } from 'next/server'
import { getDb } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await getDb().orm.public.Product
      .where({ isPublished: true })
      .include('images')
      .orderBy((p) => p.createdAt.desc())
      .all()

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json([], { status: 500 })
  }
}

