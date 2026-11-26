import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await prisma.websiteSettings.findFirst({
      select: {
        businessName: true, contactPhone: true, contactEmail: true, contactAddress: true,
        whatsappNumber: true, freeShippingThreshold: true, codEnabled: true, announcementMessage: true,
        socialFacebook: true, socialInstagram: true, socialTwitter: true, socialLinkedIn: true,
        homeHeroFirstLine: true, homeHeroSecondLine: true, homeHeroDescription: true,
        homeFeaturedTitle: true, homeFeaturedDescription: true, homeFeaturedVisible: true, homeVideosVisible: true,
        phonepeEnabled: true, phonepeMerchantId: true, phonepeClientId: true, phonepeClientSecret: true, phonepeEnv: true,
      },
    })
    if (!settings) return NextResponse.json({ businessName: 'MORJAL Enterprises', freeShippingThreshold: 1000, codEnabled: true, onlinePaymentsEnabled: false })
    const { phonepeClientSecret, phonepeMerchantId, phonepeClientId, phonepeEnabled, ...safe } = settings as Record<string, unknown> & { phonepeEnabled?: boolean; phonepeMerchantId?: string | null; phonepeClientId?: string | null; phonepeClientSecret?: string | null }
    const onlinePaymentsEnabled = Boolean(
      (phonepeEnabled && phonepeMerchantId && phonepeClientId && phonepeClientSecret) ||
      (process.env.PHONEPE_MERCHANT_ID && process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET)
    )
    return NextResponse.json({ ...safe, onlinePaymentsEnabled })
  } catch (error) {
    console.error('Error loading storefront settings:', error)
    return NextResponse.json({ error: 'Failed to load storefront settings' }, { status: 500 })
  }
}
