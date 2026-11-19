'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LinkGuestOrderForm() {
  const [orderNumber, setOrderNumber] = useState('')
  const [trackingToken, setTrackingToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true)
    try {
      const response = await fetch('/api/account/orders/link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNumber, trackingToken }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to link order.')
      setMessage(result.alreadyLinked ? 'This order is already in your account.' : 'Verified order linked to your account.')
      setTrackingToken('')
      window.location.reload()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to link order.')
    } finally { setLoading(false) }
  }
  return <details className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><summary className="cursor-pointer font-semibold text-[#062653]">Link a guest order to this account</summary><p className="mt-2 text-sm text-slate-600">Ownership is verified using the private tracking code and the mobile number on your account. Email match alone is not enough.</p><form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2"><div><Label htmlFor="guestOrderNumber">Order number</Label><Input id="guestOrderNumber" required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} className="mt-1" /></div><div><Label htmlFor="guestTrackingCode">Private tracking code</Label><Input id="guestTrackingCode" required value={trackingToken} onChange={(event) => setTrackingToken(event.target.value)} className="mt-1" autoComplete="off" /></div>{error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}{message && <p role="status" className="text-sm text-green-700 sm:col-span-2">{message}</p>}<Button disabled={loading} className="sm:col-span-2">{loading ? 'Verifying…' : 'Verify and link order'}</Button></form></details>
}
