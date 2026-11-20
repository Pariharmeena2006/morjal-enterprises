'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from 'next-auth/react'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.password.length < 12) return setError('Password must be at least 12 characters.')
    setLoading(true)
    try {
      const response = await fetch('/api/customers/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to create account.')

      // If email verification is not required, auto-login
      if (!result.verificationRequired) {
        const signInResult = await signIn('credentials', {
          email: form.email,
          password: form.password,
          accountType: 'customer',
          redirect: false,
        })
        if (signInResult?.ok) {
          router.replace('/account')
          router.refresh()
          return
        }
      }

      setMessage(result.message)
      setForm((current) => ({ ...current, password: '', confirmPassword: '' }))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9b741d]">MORJAL Enterprises</p>
        <h1 className="mt-2 text-3xl font-bold text-[#062653]">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">Save your details and keep your order history together.</p>
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <div role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"><p>{message}</p>{message.toLowerCase().includes('verification') && <Link className="mt-2 inline-block font-semibold underline" href="/login">Continue to sign in</Link>}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label htmlFor="name">Full name</Label><Input id="name" autoComplete="name" required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
          <div><Label htmlFor="email">Email address</Label><Input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
          <div><Label htmlFor="phone">Mobile number</Label><Input id="phone" type="tel" autoComplete="tel-national" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="mt-1" placeholder="10-digit mobile number" /></div>
          <div><Label htmlFor="password">Password</Label><div className="relative mt-1"><Input id="password" type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pr-11" /><button type="button" className="absolute inset-y-0 right-0 px-3 text-slate-500" onClick={() => setVisible((value) => !value)} aria-label={visible ? 'Hide passwords' : 'Show passwords'}>{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><p className="mt-1 text-xs text-slate-500">Use at least 12 characters.</p></div>
          <div><Label htmlFor="confirmPassword">Confirm password</Label><Input id="confirmPassword" type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={12} required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="mt-1" /></div>
          <p className="flex gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-900"><ShieldCheck className="h-4 w-4 shrink-0" />Passwords are hashed before storage. Admin accounts use a separate login and role.</p>
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Creating account…' : 'Create account'}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="font-semibold text-[#073B82] hover:underline">Sign in</Link></p>
      </div>
    </main>
  )
}
