'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { Save, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetch('/api/admin/profile', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load admin profile.')
        setName(data.name || '')
        setEmail(data.email || '')
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load admin profile.'))
      .finally(() => setLoading(false))
  }, [])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, currentPassword, newPassword }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to update profile.')
      setName(data.name)
      setEmail(data.email)
      setCurrentPassword('')
      setNewPassword('')
      setNotice('Profile saved. Sign in again to refresh your current session identity.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8"><div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b741d]">Account security</p><h1 className="mt-1 text-2xl font-bold text-[#062653] sm:text-3xl">Admin profile</h1></div>{error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice && <p role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</p>}<form onSubmit={save} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div><Label htmlFor="adminName">Name</Label><Input id="adminName" value={name} onChange={(event) => setName(event.target.value)} required disabled={loading} className="mt-1" /></div><div><Label htmlFor="adminEmail">Email</Label><Input id="adminEmail" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} className="mt-1" /></div><div className="border-t border-slate-100 pt-5"><h2 className="font-semibold text-[#062653]">Change password</h2><p className="mt-1 text-xs text-slate-500">Leave both password fields blank to keep your current password.</p></div><div><Label htmlFor="currentPassword">Current password</Label><Input id="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1" /></div><div><Label htmlFor="newPassword">New password</Label><Input id="newPassword" type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1" /></div><div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-900"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><p>Password is stored as a bcrypt hash. After saving a new password, sign out and log in again.</p></div><div className="flex flex-wrap justify-end gap-3"><Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: '/admin/login' })}>Sign out</Button><Button type="submit" disabled={saving || loading}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save profile'}</Button></div></form></div>
}