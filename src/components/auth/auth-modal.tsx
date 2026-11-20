'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from 'next-auth/react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
  defaultMode?: 'login' | 'signup'
  redirectTo?: string
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultMode = 'login', redirectTo }: AuthModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (session?.user?.role === 'customer') {
      onAuthSuccess()
      onClose()
    }
  }, [session, onAuthSuccess, onClose])

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
      setError('')
    }
  }, [isOpen, defaultMode])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        accountType: 'customer',
        redirect: false,
      })

      if (!result?.ok || result.error) {
        setError('Email or password is incorrect.')
        return
      }

      onAuthSuccess()
      onClose()
      if (redirectTo) {
        router.replace(redirectTo)
        router.refresh()
      }
    } catch {
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (signupForm.password.length < 12) {
      setError('Password must be at least 12 characters.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          phone: signupForm.phone,
          password: signupForm.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Unable to create account.')
      }

      // If email verification is not required, auto-login
      if (!result.verificationRequired) {
        const signInResult = await signIn('credentials', {
          email: signupForm.email,
          password: signupForm.password,
          accountType: 'customer',
          redirect: false,
        })

        if (signInResult?.ok) {
          onAuthSuccess()
          onClose()
          if (redirectTo) {
            router.replace(redirectTo)
            router.refresh()
          }
          return
        }
      }

      // If verification required, show message and switch to login
      setError(result.message)
      setMode('login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9b741d]">MORJAL Enterprises</p>
          <h2 className="mt-2 text-2xl font-bold text-[#062653]">
            {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {mode === 'login' ? 'Sign in to complete your purchase.' : 'Save your details and keep your order history together.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="login-password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pr-11"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 text-slate-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  router.push('/forgot-password')
                }}
                className="text-sm font-semibold text-[#073B82] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="signup-name">Full name</Label>
              <Input
                id="signup-name"
                autoComplete="name"
                required
                maxLength={120}
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="signup-email">Email address</Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="signup-phone">Mobile number</Label>
              <Input
                id="signup-phone"
                type="tel"
                autoComplete="tel-national"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                required
                value={signupForm.phone}
                onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="mt-1"
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  required
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  className="pr-11"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 text-slate-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Use at least 12 characters.</p>
            </div>
            <div>
              <Label htmlFor="signup-confirm">Confirm password</Label>
              <Input
                id="signup-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={12}
                required
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-600">
          {mode === 'login' ? (
            <>
              New to MORJAL?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError('')
                }}
                className="font-semibold text-[#073B82] hover:underline"
              >
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
                className="font-semibold text-[#073B82] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
