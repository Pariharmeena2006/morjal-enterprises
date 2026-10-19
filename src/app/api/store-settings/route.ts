import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.websiteSettings.findFirst({
      select: {
        businessName: true, contactPhone: true, contactEmail: true, contactAddress: true,
        whatsappNumber: true, freeShippingThreshold: true, codEnabled: true, announcementMessage: true,
        socialFacebook: true, socialInstagram: true, socialTwitter: true, socialLinkedIn: true,
      },
    })
    return NextResponse.json(settings || { businessName: 'MORJAL Enterprises', freeShippingThreshold: 1000, codEnabled: true })
  } catch (error) {
    console.error('Error loading storefront settings:', error)
    return NextResponse.json({ businessName: 'MORJAL Enterprises', freeShippingThreshold: 1000, codEnabled: true })
  }
}
