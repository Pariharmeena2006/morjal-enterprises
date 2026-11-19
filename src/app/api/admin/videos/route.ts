import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions())

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const order = Number(body.order ?? 0)

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Video title is required' }, { status: 400 })
    }
    if (!body.videoUrl?.trim()) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }
    if (!Number.isInteger(order) || order < 0) {
      return NextResponse.json({ error: 'Display order must be a non-negative whole number' }, { status: 400 })
    }

    const video = await getDb().orm.public.Video.create({
      title: body.title.trim(),
      description: body.description || null,
      videoUrl: body.videoUrl.trim(),
      thumbnailUrl: body.thumbnailUrl || null,
      order,
      isEnabled: body.isEnabled ?? true,
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions())

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...videoData } = body

    const video = await getDb().orm.public.Video
      .where({ id })
      .update(videoData)

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
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
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    await getDb().orm.public.Video.where({ id }).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(getAuthOptions())

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const videos = await getDb().orm.public.Video
      .orderBy((v) => v.order.asc())
      .all()

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
