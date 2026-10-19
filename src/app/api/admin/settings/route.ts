import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const editableFields = [
  'businessName', 'contactPhone', 'contactEmail', 'contactAddress', 'whatsappNumber',
  'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialLinkedIn',
  'ownerName', 'ownerTitle', 'ownerBio', 'ownerImageUrl', 'ownerStory',
  'announcementMessage', 'shippingPolicy', 'returnPolicy', 'cancellationPolicy',
  'privacyPolicy', 'termsAndConditions', 'refundPolicy',
] as const

export async function GET() {
  if (!(await getServerSession(authOptions))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const settings = await prisma.websiteSettings.findFirst()
    return NextResponse.json(settings || {})
  } catch (error) {
    console.error('Error loading settings:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!(await getServerSession(authOptions))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}
    for (const field of editableFields) {
      if (body[field] !== undefined) data[field] = body[field] ? String(body[field]).trim() : null
    }
    if (body.freeShippingThreshold !== undefined) {
      const threshold = Number(body.freeShippingThreshold)
      if (!Number.isFinite(threshold) || threshold < 0) {
        return NextResponse.json({ error: 'Free shipping threshold must be a non-negative number' }, { status: 400 })
      }
      data.freeShippingThreshold = threshold
    }
    if (body.codEnabled !== undefined) data.codEnabled = Boolean(body.codEnabled)

    const existing = await prisma.websiteSettings.findFirst()
    const settings = existing
      ? await prisma.websiteSettings.update({ where: { id: existing.id }, data })
      : await prisma.websiteSettings.create({ data })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
