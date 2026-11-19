import Link from 'next/link'
import ForgotPasswordForm from '@/components/auth/forgot-password-form'

export default function ForgotPasswordPage() {
  return <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 sm:py-16"><div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9b741d]">MORJAL Enterprises</p><h1 className="mt-2 text-3xl font-bold text-[#062653]">Reset password</h1><p className="mb-6 mt-2 text-sm text-slate-600">If email delivery is configured, we’ll send a time-limited reset link.</p><ForgotPasswordForm /><p className="mt-5 text-center text-sm"><Link href="/login" className="font-semibold text-[#073B82] hover:underline">Back to sign in</Link></p></div></main>
}
