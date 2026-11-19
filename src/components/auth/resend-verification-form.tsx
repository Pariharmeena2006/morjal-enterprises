'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResendVerificationForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true)
    try {
      const response = await fetch('/api/customers/verify-email/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to send verification link.')
      setMessage(data.message)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send verification link.')
    } finally { setLoading(false) }
  }
  return <form onSubmit={submit} className="space-y-3">{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}<div><Label htmlFor="verifyEmail">Email address</Label><Input id="verifyEmail" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1" /></div><Button variant="outline" disabled={loading}>{loading ? 'Sending…' : 'Resend verification email'}</Button></form>
}
