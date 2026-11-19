import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/auth'
import { getDb } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const editableFields = [
  'businessName', 'contactPhone', 'contactEmail', 'contactAddress', 'whatsappNumber',
  'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialLinkedIn',
  'ownerName', 'ownerTitle', 'ownerBio', 'ownerImageUrl', 'ownerStory', 'ownerAchievements',
  'announcementMessage', 'shippingPolicy', 'returnPolicy', 'cancellationPolicy',
  'privacyPolicy', 'termsAndConditions', 'refundPolicy',
] as const

export async function GET() {
  if (!(await getServerSession(getAuthOptions()))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const settings = await getDb().orm.public.WebsiteSettings.first()
    return NextResponse.json(settings || {})
  } catch (error) {
    console.error('Error loading settings:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!(await getServerSession(getAuthOptions()))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const data: {
      businessName?: string
      contactPhone?: string | null
      contactEmail?: string | null
      contactAddress?: string | null
      whatsappNumber?: string | null
      socialFacebook?: string | null
      socialInstagram?: string | null
      socialTwitter?: string | null
      socialLinkedIn?: string | null
      ownerName?: string | null
      ownerTitle?: string | null
      ownerBio?: string | null
      ownerImageUrl?: string | null
      ownerStory?: string | null
      ownerAchievements?: string | null
      announcementMessage?: string | null
      shippingPolicy?: string | null
      returnPolicy?: string | null
      cancellationPolicy?: string | null
      privacyPolicy?: string | null
      termsAndConditions?: string | null
      refundPolicy?: string | null
      freeShippingThreshold?: number | null
      codEnabled?: boolean
    } = {}
    for (const field of editableFields) {
      if (body[field] === undefined) continue
      if (field === 'businessName') {
        // businessName is NOT NULL: keep the stored name when the form sends an empty one.
        if (body[field]) data.businessName = String(body[field]).trim()
      } else {
        data[field] = body[field] ? String(body[field]).trim() : null
      }
    }
    if (body.freeShippingThreshold !== undefined) {
      const threshold = Number(body.freeShippingThreshold)
      if (!Number.isFinite(threshold) || threshold < 0) {
        return NextResponse.json({ error: 'Free shipping threshold must be a non-negative number' }, { status: 400 })
      }
      data.freeShippingThreshold = threshold
    }
    if (body.codEnabled !== undefined) data.codEnabled = Boolean(body.codEnabled)

    const db = getDb()
    const existing = await db.orm.public.WebsiteSettings.first()
    const settings = existing
      ? await db.orm.public.WebsiteSettings.where({ id: existing.id }).update(data)
      : await db.orm.public.WebsiteSettings.create(data)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
