import { NextResponse } from 'next/server'
import { getDb } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getDb().orm.public.WebsiteSettings
      .select(
        'businessName', 'contactPhone', 'contactEmail', 'contactAddress',
        'whatsappNumber', 'freeShippingThreshold', 'codEnabled', 'announcementMessage',
        'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialLinkedIn',
      )
      .first()
    return NextResponse.json(settings || { businessName: 'MORJAL Enterprises', freeShippingThreshold: 1000, codEnabled: true })
  } catch (error) {
    console.error('Error loading storefront settings:', error)
    return NextResponse.json({ businessName: 'MORJAL Enterprises', freeShippingThreshold: 1000, codEnabled: true })
  }
}
