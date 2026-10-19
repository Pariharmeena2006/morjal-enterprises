import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const banner = await prisma.banner.findUnique({
      where: { id: params.id }
    })

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Banner title is required' }, { status: 400 })
    }
    const order = Number(body.order ?? 0)
    if (!Number.isInteger(order) || order < 0) {
      return NextResponse.json({ error: 'Display order must be a non-negative whole number' }, { status: 400 })
    }

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title: body.title.trim(), description: body.description || null,
        buttonText: body.buttonText || null, buttonUrl: body.buttonUrl || null,
        desktopImageUrl: body.desktopImageUrl || null, mobileImageUrl: body.mobileImageUrl || null,
        order, ...(typeof body.isEnabled === 'boolean' ? { isEnabled: body.isEnabled } : {}),
      },
    })
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
  }
}
