import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const order = Number(body.order ?? 0)
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Banner title is required' }, { status: 400 })
    }
    if (!Number.isInteger(order) || order < 0) {
      return NextResponse.json({ error: 'Display order must be a non-negative whole number' }, { status: 400 })
    }
    
    const banner = await prisma.banner.create({
      data: {
        title: body.title.trim(),
        description: body.description || null,
        buttonText: body.buttonText || null,
        buttonUrl: body.buttonUrl || null,
        desktopImageUrl: body.desktopImageUrl || null,
        mobileImageUrl: body.mobileImageUrl || null,
        order,
        isEnabled: body.isEnabled ?? true,
      }
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...bannerData } = body

    const banner = await prisma.banner.update({
      where: { id },
      data: bannerData
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Banner ID required' }, { status: 400 })
    }

    await prisma.banner.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}
