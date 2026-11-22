'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function OTPLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') || ''
  const callbackParam = searchParams.get('callbackUrl') || ''
  const passwordLoginHref = callbackParam && callbackParam.startsWith('/') && !callbackParam.startsWith('//')
    ? `/login?callbackUrl=${encodeURIComponent(callbackParam)}`
    : '/login'
  
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState(emailParam)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(0)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to send OTP')
      setMessage('OTP sent to your email!')
      setStep('otp')
      startCountdown()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to verify OTP')
      
      const callbackUrl = searchParams.get('callbackUrl') || '/account'
      router.replace(callbackUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to resend OTP')
      setMessage('New OTP sent!')
      startCountdown()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = () => {
    setCountdown(30)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="text-center mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9b741d]">MORJAL Enterprises</p>
          <h1 className="mt-2 text-3xl font-bold text-[#062653]">Sign in with OTP</h1>
          <p className="mt-2 text-sm text-slate-600">Passwordless login with email verification</p>
        </div>

        {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</p>}

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#073B82] text-white hover:bg-navy">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <Label htmlFor="otp">Enter 6-digit OTP</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mt-1 text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#073B82] text-white hover:bg-navy">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Verify & Sign In'}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || countdown > 0}
                className="text-sm text-[#073B82] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setError('')
                setMessage('')
              }}
              className="w-full text-sm text-slate-600 hover:text-[#073B82]"
            >
              Change email
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-center text-sm text-slate-600">
            Want to use password?{' '}
            <Link href={passwordLoginHref} className="font-semibold text-[#073B82] hover:underline">
              Sign in with password
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function OTPLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9b741d]">MORJAL Enterprises</p>
          <p className="mt-4 text-sm text-slate-600">Loading…</p>
        </div>
      </main>
    }>
      <OTPLoginForm />
    </Suspense>
  )
}
