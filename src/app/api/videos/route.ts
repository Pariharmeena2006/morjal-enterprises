import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      where: { isEnabled: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json([], { status: 500 })
  }
}
