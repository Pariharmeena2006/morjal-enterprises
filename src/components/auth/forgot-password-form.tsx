'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const response = await fetch('/api/customers/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send reset email.')
      setMessage(result.message)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return <form onSubmit={submit} className="space-y-4">{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}<div><Label htmlFor="resetEmail">Account email</Label><Input id="resetEmail" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1" /></div><Button className="w-full" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button></form>
}
