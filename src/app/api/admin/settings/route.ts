import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

const editableFields = [
  'businessName', 'contactPhone', 'contactEmail', 'contactAddress', 'whatsappNumber',
  'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialLinkedIn',
  'ownerName', 'ownerTitle', 'ownerBio', 'ownerImageUrl', 'ownerStory', 'ownerAchievements',
  'announcementMessage', 'shippingPolicy', 'returnPolicy', 'cancellationPolicy',
  'privacyPolicy', 'termsAndConditions', 'refundPolicy', 'shiprocketEmail', 'shiprocketChannelId',
  'homeHeroFirstLine', 'homeHeroSecondLine', 'homeHeroDescription', 'homeFeaturedTitle', 'homeFeaturedDescription',
] as const

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const settings = await prisma.websiteSettings.findFirst()
    if (!settings) return NextResponse.json({})
    const { shiprocketApiKey, ...safeSettings } = settings
    return NextResponse.json({ ...safeSettings, shiprocketApiKeyConfigured: Boolean(shiprocketApiKey) })
  } catch (error) {
    console.error('Error loading settings:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}
    for (const field of editableFields) {
      if (body[field] !== undefined) data[field] = body[field] ? String(body[field]).trim() : null
    }
    if (typeof body.shiprocketEnabled === 'boolean') data.shiprocketEnabled = body.shiprocketEnabled
    if (typeof body.homeFeaturedVisible === 'boolean') data.homeFeaturedVisible = body.homeFeaturedVisible
    if (typeof body.homeVideosVisible === 'boolean') data.homeVideosVisible = body.homeVideosVisible
    if (typeof body.shiprocketApiKey === 'string' && body.shiprocketApiKey.trim()) {
      data.shiprocketApiKey = body.shiprocketApiKey.trim()
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
    const { shiprocketApiKey, ...safeSettings } = settings
    return NextResponse.json({ ...safeSettings, shiprocketApiKeyConfigured: Boolean(shiprocketApiKey) })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
