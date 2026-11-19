'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    try {
      const response = await fetch('/api/customers/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to reset the password.')
      setDone(true)
      setTimeout(() => router.replace('/login'), 1600)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reset the password.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Reset link is missing. Request a new link.</p>
  if (done) return <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">Password updated. Redirecting to sign in…</p>
  return <form onSubmit={submit} className="space-y-4">{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div><Label htmlFor="password">New password</Label><Input id="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1" /></div><div><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-1" /></div><Button className="w-full" disabled={loading}>{loading ? 'Updating…' : 'Set new password'}</Button></form>
}
