import { createHash } from 'crypto'

const ENV = process.env.EASEBUZZ_ENV === 'production' ? 'prod' : 'test'
const BASE_URL = ENV === 'prod' ? 'https://pay.easebuzz.in' : 'https://testpay.easebuzz.in'

export function easebuzzConfig() {
  const key = process.env.EASEBUZZ_KEY
  const salt = process.env.EASEBUZZ_SALT
  return key && salt ? { key, salt, baseUrl: BASE_URL, env: ENV } : null
}

function sha512(value: string) {
  return createHash('sha512').update(value).digest('hex')
}

export function easebuzzRequestHash(params: {
  key: string; txnid: string; amount: string; productinfo: string
  firstname: string; email: string; udf: string[]; salt: string
}) {
  const { key, txnid, amount, productinfo, firstname, email, udf, salt } = params
  return sha512([key, txnid, amount, productinfo, firstname, email, ...udf, salt].join('|'))
}

/** Easebuzz response/callback hash: SALT|status|udf10..udf1|email|firstname|productinfo|amount|txnid|key|SALT */
export function easebuzzResponseHash(fields: Record<string, string>, salt: string, key: string) {
  const udf = Array.from({ length: 10 }, (_, i) => fields[`udf${i + 1}`] || '')
  return sha512([
    salt, fields.status || '', ...udf.reverse(), fields.email || '',
    fields.firstname || '', fields.productinfo || '', fields.amount || '',
    fields.txnid || '', key, salt,
  ].join('|'))
}

export async function initiateEasebuzzPayment(input: {
  txnid: string; amount: number; productinfo: string
  firstname: string; email: string; phone: string
  surl: string; furl: string; udf?: Record<string, string>
}) {
  const config = easebuzzConfig()
  if (!config) return null
  const udf = Array.from({ length: 10 }, (_, i) => input.udf?.[`udf${i + 1}`] || '')
  const amount = input.amount.toFixed(2)
  const params: Record<string, string> = {
    key: config.key, txnid: input.txnid, amount, productinfo: input.productinfo.slice(0, 255),
    firstname: input.firstname.slice(0, 100), email: input.email || 'guest@morjalenterprises.in',
    phone: input.phone, surl: input.surl, furl: input.furl,
    ...Object.fromEntries(udf.map((v, i) => [`udf${i + 1}`, v])),
  }
  params.hash = easebuzzRequestHash({ ...params, udf, salt: config.salt } as never)
  const body = new URLSearchParams(params)
  const response = await fetch(`${config.baseUrl}/payment/initiateLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await response.json().catch(() => ({}))
  const url = data.payment_url || data.redirect_url || data.url || ''
  return url ? { paymentUrl: url, txnid: input.txnid } : null
}

/** Authoritative status check via Easebuzz transaction API. Returns true only on confirmed success. */
export async function verifyEasebuzzTransaction(txnid: string, amount: number) {
  const config = easebuzzConfig()
  if (!config) return false
  try {
    const command = 'check_payment_status'
    const hash = sha512(`${command}|${txnid}|${config.key}|${config.salt}`)
    const body = new URLSearchParams({ key: config.key, command, var1: txnid, var2: config.salt, hash })
    const response = await fetch(`${config.baseUrl}/payment/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const data = await response.json().catch(() => ({}))
    const status = String(data.status || data.txn_status || '').toLowerCase()
    const paidAmount = Number(data.amount || data.net_amount_debit || 0)
    return status === 'success' && Math.abs(paidAmount - amount) < 0.01
  } catch {
    return false
  }
}
