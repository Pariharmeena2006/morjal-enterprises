import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const news = await getDb().orm.public.News.first({ id: params.id })
    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 })
    }
    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, slug, excerpt, content, imageUrl, authorName, authorTitle, published } = body

    const news = await getDb().orm.public.News
      .where({ id: params.id })
      .update({
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        authorName,
        authorTitle,
        published,
      })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await getDb().orm.public.News.where({ id: params.id }).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 })
  }
}
