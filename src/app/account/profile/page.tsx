'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AccountProfilePage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', emailVerifiedAt: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => {
    fetch('/api/account/profile', { cache: 'no-store' }).then(async (response) => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to load profile.')
      setForm({ name: data.name || '', phone: data.phone || '', email: data.email || '', emailVerifiedAt: data.emailVerifiedAt || '' })
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load profile.')).finally(() => setLoading(false))
  }, [])
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const response = await fetch('/api/account/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, phone: form.phone }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to save profile.')
      setForm((current) => ({ ...current, name: data.name, phone: data.phone }))
      setMessage('Profile saved successfully.')
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save profile.') } finally { setSaving(false) }
  }
  return <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h1 className="text-2xl font-bold text-[#062653]">Profile</h1><p className="mt-1 text-sm text-slate-600">Update your name and mobile number. Email changes are disabled to protect account ownership.</p>{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}<form onSubmit={save} className="mt-5 space-y-4"><div><Label htmlFor="profileName">Full name</Label><Input id="profileName" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required disabled={loading} className="mt-1" /></div><div><Label htmlFor="profilePhone">Mobile number</Label><Input id="profilePhone" type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })} required disabled={loading} className="mt-1" /></div><div><Label htmlFor="profileEmail">Email</Label><Input id="profileEmail" type="email" value={form.email} disabled className="mt-1 bg-slate-50" /><p className="mt-1 text-xs text-slate-500">Email changes require a separate verification flow and are not enabled.</p></div><Button disabled={loading || saving}>{saving ? 'Saving…' : 'Save profile'}</Button></form></section>
}
