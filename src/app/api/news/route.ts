import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const newsArticles = await prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(newsArticles)
  } catch (error) {
    console.error('Error loading news:', error)
    return NextResponse.json({ error: 'Failed to load news' }, { status: 500 })
  }
}
