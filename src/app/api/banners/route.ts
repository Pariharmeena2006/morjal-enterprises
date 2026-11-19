import { NextResponse } from 'next/server'
import { getDb } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const banners = await getDb().orm.public.Banner
      .where({ isEnabled: true })
      .orderBy((b) => b.order.asc())
      .all()

    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json([], { status: 500 })
  }
}
