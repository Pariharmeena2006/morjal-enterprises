import { NextResponse } from 'next/server'
import { getDb } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const newsArticles = await getDb().orm.public.News
      .where({ published: true })
      .orderBy((n) => n.createdAt.desc())
      .all()
    return NextResponse.json(newsArticles)
  } catch (error) {
    console.error('Error loading news:', error)
    return NextResponse.json({ error: 'Failed to load news' }, { status: 500 })
  }
}
