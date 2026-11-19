import { NextResponse } from 'next/server'
import { getDb } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const videos = await getDb().orm.public.Video
      .where({ isEnabled: true })
      .orderBy((v) => v.order.asc())
      .all()

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json([], { status: 500 })
  }
}
