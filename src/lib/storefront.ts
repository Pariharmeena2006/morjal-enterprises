"use client"

interface StorefrontSettings {
  whatsappNumber?: string | null
  businessName?: string | null
  contactPhone?: string | null
  freeShippingThreshold?: number | null
  codEnabled?: boolean
}

export const DEFAULT_WHATSAPP_NUMBER = '919694142555'

let cached: Promise<StorefrontSettings> | null = null

/** Fetches public store settings once per page load and caches the promise. */
export function getStorefrontSettings(): Promise<StorefrontSettings> {
  if (!cached) {
    cached = fetch('/api/store-settings')
      .then((response) => (response.ok ? response.json() : {}))
      .then((settings: StorefrontSettings) => ({ ...settings, whatsappNumber: settings.whatsappNumber || DEFAULT_WHATSAPP_NUMBER }))
      .catch(() => ({}))
  }
  return cached
}

export function normalizeWhatsAppClient(value: string | null | undefined) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return digits
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`
  return digits
}

export function whatsappChatUrl(number: string, message = '') {
  const normalized = normalizeWhatsAppClient(number)
  if (!normalized) return ''
  return `https://wa.me/${normalized}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
