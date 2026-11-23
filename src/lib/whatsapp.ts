import { prisma } from '@/lib/prisma'

export function normalizeWhatsAppNumber(value: string | null | undefined) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  // Indian numbers: 10 digits → prefix 91; already-prefixed 12 digits → keep
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return digits
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`
  return digits
}

export function buildWhatsAppUrl(number: string, message: string) {
  const normalized = normalizeWhatsAppNumber(number)
  if (!normalized) return ''
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function normalizeCustomerPhone(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.length === 10 ? `91${digits}` : digits
}

/**
 * Resolves the business WhatsApp number. Priority:
 * 1. WHATSAPP_NUMBER env var (server-side override)
 * 2. WebsiteSettings.whatsappNumber (admin-configurable)
 */
export async function getWhatsAppNumber() {
  const envNumber = process.env.WHATSAPP_NUMBER
  if (envNumber) return normalizeWhatsAppNumber(envNumber)
  try {
    const settings = await prisma.websiteSettings.findFirst({ select: { whatsappNumber: true } })
    return normalizeWhatsAppNumber(settings?.whatsappNumber)
  } catch {
    return ''
  }
}
