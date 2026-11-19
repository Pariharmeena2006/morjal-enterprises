'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CustomerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [callbackUrl, setCallbackUrl] = useState('/account')

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('callbackUrl')
    if (requested?.startsWith('/') && !requested.startsWith('//')) setCallbackUrl(requested)
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signIn('credentials', { email, password, accountType: 'customer', redirect: false })
      if (!result?.ok || result.error) {
        setError('Email or password is incorrect. If email verification is enabled, verify your address first.')
        return
      }
      router.replace(callbackUrl)
      router.refresh()
    } catch {
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9b741d]">MORJAL Enterprises</p>
        <h1 className="mt-2 text-3xl font-bold text-[#062653]">Customer sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to see your saved addresses and orders.</p>
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
          <div><Label htmlFor="password">Password</Label><div className="relative mt-1"><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pr-11" /><button type="button" className="absolute inset-y-0 right-0 px-3 text-slate-500" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          <div className="text-right"><Link href="/forgot-password" className="text-sm font-semibold text-[#073B82] hover:underline">Forgot password?</Link></div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing in…' : 'Sign in'}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">New to MORJAL? <Link href="/signup" className="font-semibold text-[#073B82] hover:underline">Create account</Link></p>
      </div>
    </main>
  )
}
