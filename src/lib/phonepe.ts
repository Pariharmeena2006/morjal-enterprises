import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'

/**
 * PhonePe Payment Gateway — V2 Standard Checkout (OAuth).
 * Sandbox:  https://api-preprod.phonepe.com/apis/pg-sandbox
 * Prod auth: https://api.phonepe.com/apis/identity-manager
 * Prod APIs: https://api.phonepe.com/apis/pg
 * No salt key / X-VERIFY — V2 uses OAuth Bearer tokens only.
 */

export interface PhonePeConfig {
  merchantId: string
  clientId: string
  clientSecret: string
  clientVersion: string
  env: 'sandbox' | 'production'
  authBaseUrl: string
  apiBaseUrl: string
}

const SANDBOX_BASE = 'https://api-preprod.phonepe.com/apis/pg-sandbox'
const PROD_AUTH_BASE = 'https://api.phonepe.com/apis/identity-manager'
const PROD_API_BASE = 'https://api.phonepe.com/apis/pg'

let tokenCache: { token: string; expiresAt: number } | null = null

/** Resolves V2 credentials: env vars take precedence, then WebsiteSettings. */
export async function getPhonePeConfig(): Promise<PhonePeConfig | null> {
  const envMerchantId = process.env.PHONEPE_MERCHANT_ID
  const settings = await prisma.websiteSettings.findFirst({
    select: {
      phonepeEnabled: true, phonepeEnv: true, phonepeMerchantId: true,
      phonepeClientId: true, phonepeClientSecret: true,
    },
  }).catch(() => null)

  const merchantId = envMerchantId || settings?.phonepeMerchantId || ''
  const clientId = process.env.PHONEPE_CLIENT_ID || settings?.phonepeClientId || ''
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET || settings?.phonepeClientSecret || ''
  const env = (process.env.PHONEPE_ENV || settings?.phonepeEnv || 'sandbox') === 'production' ? 'production' : 'sandbox'

  if (!merchantId || !clientId || !clientSecret) return null
  // Online payments stay disabled until credentials are configured AND enabled in admin
  if (!envMerchantId && !(settings?.phonepeEnabled)) return null

  return {
    merchantId, clientId, clientSecret,
    clientVersion: process.env.PHONEPE_CLIENT_VERSION || '1',
    env,
    authBaseUrl: env === 'production' ? PROD_AUTH_BASE : SANDBOX_BASE,
    apiBaseUrl: env === 'production' ? PROD_API_BASE : SANDBOX_BASE,
  }
}

async function getAccessToken(config: PhonePeConfig): Promise<string | null> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_version: config.clientVersion,
    client_secret: config.clientSecret,
    grant_type: 'client_credentials',
  })
  try {
    const response = await fetch(`${config.authBaseUrl}/v1/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const data = await response.json()
    if (!data.access_token) return null
    // expires_at is epoch seconds per official docs; expires_in may be seconds or null
    const expiresAtSec = Number(data.expires_at || 0)
    const expiresInSec = Number(data.expires_in || 0)
    const expiresAtMs = expiresAtSec > 1e9 ? expiresAtSec * 1000
      : expiresInSec > 0 ? Date.now() + expiresInSec * 1000
      : Date.now() + 3600_000
    tokenCache = { token: data.access_token, expiresAt: expiresAtMs }
    return data.access_token
  } catch {
    return null
  }
}

function authHeaders(config: PhonePeConfig, token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `O-Bearer ${token}`,
    'X-MERCHANT-ID': config.merchantId,
  }
}

export interface PhonePeInitiateResult {
  paymentUrl: string
  merchantOrderId: string
}

/** V2 Create Payment: POST /checkout/v2/pay — returns hosted checkout URL. */
export async function initiatePhonePePayment(input: {
  merchantOrderId: string
  amount: number
  redirectUrl: string
  mobileNumber: string
  orderSummary: string
}): Promise<PhonePeInitiateResult | null> {
  const config = await getPhonePeConfig()
  if (!config) return null
  const token = await getAccessToken(config)
  if (!token) return null

  const payload = {
    merchantOrderId: input.merchantOrderId.slice(0, 63),
    amount: Math.round(input.amount * 100), // integer paise
    expireAfter: 1800,
    paymentFlow: {
      type: 'PG_CHECKOUT',
      message: input.orderSummary.slice(0, 200),
      merchantUrls: { redirectUrl: input.redirectUrl },
    },
    metaInfo: { udf1: input.orderSummary.slice(0, 256) },
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/checkout/v2/pay`, {
      method: 'POST',
      headers: authHeaders(config, token),
      body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => ({}))
    const url =
      data?.data?.instrumentResponse?.redirectInfo?.url ||
      data?.data?.redirectInfo?.url ||
      data?.data?.redirectUrl ||
      data?.redirectUrl ||
      data?.data?.checkoutPageUrl ||
      data?.data?.paymentUrl || ''
    if (url) return { paymentUrl: url, merchantOrderId: input.merchantOrderId }
    return null
  } catch {
    return null
  }
}

export interface PhonePeStatus {
  state: string
  code: string
  merchantOrderId: string
  transactionId: string
  amountPaise: number
}

/** V2 Order Status: GET /checkout/v2/order/{merchantOrderId}/status */
export async function checkPhonePeStatus(merchantOrderId: string): Promise<PhonePeStatus | null> {
  const config = await getPhonePeConfig()
  if (!config) return null
  const token = await getAccessToken(config)
  if (!token) return null

  try {
    const response = await fetch(
      `${config.apiBaseUrl}/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false`,
      { method: 'GET', headers: authHeaders(config, token) },
    )
    const data = await response.json().catch(() => ({}))
    const d = data?.data || data || {}
    const payment = Array.isArray(d.paymentDetails) ? d.paymentDetails[0] : d.paymentDetails || {}
    return {
      state: String(d.state || '').toUpperCase(),
      code: String(d.code || payment.code || '').toUpperCase(),
      merchantOrderId: String(d.merchantOrderId || merchantOrderId),
      transactionId: String(payment.transactionId || d.transactionId || ''),
      amountPaise: Number(payment.amount ?? d.amount ?? 0),
    }
  } catch {
    return null
  }
}

/** V2 Refund: POST /payments/v2/refund */
export async function initiatePhonePeRefund(input: {
  merchantOrderId: string
  merchantRefundId: string
  amount: number
  callbackUrl: string
}): Promise<{ refundId: string; state: string } | null> {
  const config = await getPhonePeConfig()
  if (!config) return null
  const token = await getAccessToken(config)
  if (!token) return null

  const payload = {
    merchantOrderId: input.merchantOrderId,
    merchantRefundId: input.merchantRefundId.slice(0, 63),
    amount: Math.round(input.amount * 100),
    callbackUrl: input.callbackUrl,
  }
  try {
    const response = await fetch(`${config.apiBaseUrl}/payments/v2/refund`, {
      method: 'POST',
      headers: authHeaders(config, token),
      body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => ({}))
    const state = String(data?.data?.state || data?.data?.refundState || data?.code || '').toUpperCase()
    if (state === 'PENDING' || state === 'SUCCESS' || state === 'COMPLETED' || data?.success === true) {
      return { refundId: input.merchantRefundId, state }
    }
    return null
  } catch {
    return null
  }
}

/** V2 Refund Status: GET /payments/v2/refund/{merchantRefundId}/status */
export async function checkPhonePeRefundStatus(merchantRefundId: string): Promise<{ state: string; code: string } | null> {
  const config = await getPhonePeConfig()
  if (!config) return null
  const token = await getAccessToken(config)
  if (!token) return null
  try {
    const response = await fetch(
      `${config.apiBaseUrl}/payments/v2/refund/${encodeURIComponent(merchantRefundId)}/status`,
      { method: 'GET', headers: authHeaders(config, token) },
    )
    const data = await response.json().catch(() => ({}))
    const d = data?.data || data || {}
    return { state: String(d.state || '').toUpperCase(), code: String(d.code || '').toUpperCase() }
  } catch {
    return null
  }
}

/**
 * V2 webhook auth (SHA method): PhonePe sends
 *   Authorization: <hex SHA256 of "username:password">
 * where username/password are the values configured in the merchant dashboard.
 * We recompute SHA256(PHONEPE_WEBHOOK_USERNAME:PHONEPE_WEBHOOK_PASSWORD) and
 * compare. Missing credentials or header → reject.
 */
export function verifyPhonePeWebhook(authorization: string | null | undefined) {
  const username = process.env.PHONEPE_WEBHOOK_USERNAME
  const password = process.env.PHONEPE_WEBHOOK_PASSWORD
  if (!username || !password) return false
  if (!authorization) return false
  const expected = createHash('sha256').update(`${username}:${password}`).digest('hex')
  const provided = authorization.trim().replace(/^Bearer\s+/i, '')
  if (provided.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}
