'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Zap, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('error')) {
      setError('Sign-in could not be completed. Please check your credentials and try again.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (!result?.ok || result.error) {
        setError('Invalid email or password. Please try again.')
        return
      }

      router.replace('/admin')
      router.refresh()
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      {/* Left branding panel — desktop only */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#123E78] to-[#0B1F3A] p-12 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white/10 ring-1 ring-[#D4AF37]/40">
            <Image src="/logo.png" alt="MORJAL Enterprises" fill className="object-contain p-1" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-wide text-white">MORJAL</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#D4AF37]">Enterprises</p>
          </div>
        </Link>

        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/5 px-4 py-1.5 text-xs font-semibold text-[#D4AF37]">
            <ShieldCheck className="h-4 w-4" /> Electrical Safety Solutions
          </div>
          <h2 className="max-w-md text-4xl font-extrabold leading-tight text-white">
            Powering safety.<br />
            <span className="text-[#D4AF37]">Protecting workplaces.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
            Authorized administrator access for MORJAL Enterprises — manage orders, products, shipping and store settings securely.
          </p>
          <div className="mt-8 flex items-center gap-6 text-white/50">
            <span className="flex items-center gap-1.5 text-xs"><Zap className="h-4 w-4 text-[#D4AF37]" /> Quality Assured</span>
            <span className="flex items-center gap-1.5 text-xs"><ShieldCheck className="h-4 w-4 text-[#D4AF37]" /> Secure Portal</span>
          </div>
        </div>

        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} MORJAL Enterprises. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-gray-200">
              <Image src="/logo.png" alt="MORJAL Enterprises" fill className="object-contain p-1" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#0B1F3A]">MORJAL</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Enterprises</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-[#0B1F3A]/5 sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1F3A] sm:text-3xl">Welcome Back</h1>
              <p className="mt-1.5 text-sm text-gray-500">Sign in to the Secure Admin Portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 bg-[#F5F7FA] pl-11 transition-colors focus:border-[#123E78] focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/30"
                    placeholder="admin@morjal.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 bg-[#F5F7FA] pl-11 pr-12 transition-colors focus:border-[#123E78] focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/30"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#123E78]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0B1F3A] to-[#123E78] text-base font-bold text-white shadow-lg shadow-[#0B1F3A]/20 transition hover:from-[#123E78] hover:to-[#0B1F3A] disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</span>
                ) : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
              Protected area — authorized personnel only
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-[#123E78]">
              <ArrowLeft className="h-4 w-4" /> Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
