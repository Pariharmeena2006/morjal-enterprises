'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage('')
    if (newPassword !== confirm) return setError('New passwords do not match.')
    setLoading(true)
    try {
      const response = await fetch('/api/account/security', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to change password.')
      setCurrentPassword(''); setNewPassword(''); setConfirm(''); setMessage('Password updated. Sign in again on your other devices.')
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to change password.') } finally { setLoading(false) }
  }
  return <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h1 className="text-2xl font-bold text-[#062653]">Security</h1><p className="mt-1 text-sm text-slate-600">Change your password or sign out of this device.</p>{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}<form onSubmit={save} className="mt-5 space-y-4"><div><Label htmlFor="currentPassword">Current password</Label><Input id="currentPassword" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1" /></div><div><Label htmlFor="newPassword">New password</Label><Input id="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1" /></div><div><Label htmlFor="confirmPassword">Confirm new password</Label><Input id="confirmPassword" type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-1" /></div><Button disabled={loading}>{loading ? 'Updating…' : 'Change password'}</Button></form><div className="mt-6 border-t border-slate-100 pt-5"><Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>Log out</Button></div></section>
}
