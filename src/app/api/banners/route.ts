import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isEnabled: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json([], { status: 500 })
  }
}
