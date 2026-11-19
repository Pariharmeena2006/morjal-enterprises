import Link from 'next/link'
import ResendVerificationForm from '@/components/auth/resend-verification-form'

type VerifyPageProps = { searchParams?: { result?: string } }

const messages: Record<string, string> = {
  success: 'Your email is verified. You can now sign in.',
  expired: 'This verification link is invalid or expired. Request a new link below.',
  invalid: 'This verification link is invalid. Request a new link below.',
  error: 'We could not verify this email right now. Try again later.',
}

export default function VerifyEmailPage({ searchParams = {} }: VerifyPageProps) {
  const result = searchParams.result || ''
  return <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 sm:py-16"><div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9b741d]">MORJAL Enterprises</p><h1 className="mt-2 text-3xl font-bold text-[#062653]">Email verification</h1>{messages[result] && <p role={result === 'success' ? 'status' : 'alert'} className={`mt-5 rounded-xl p-3 text-sm ${result === 'success' ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'}`}>{messages[result]}</p>}{result !== 'success' && <div className="mt-6"><p className="mb-4 text-sm text-slate-600">Enter the account email to request another verification link.</p><ResendVerificationForm /></div>}<p className="mt-6 text-sm"><Link href="/login" className="font-semibold text-[#073B82] hover:underline">Go to customer sign in</Link></p></div></main>
}
