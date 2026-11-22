import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCustomerSession } from '@/lib/customer-auth'

const links = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'My orders' },
  { href: '/account/addresses', label: 'Saved addresses' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/security', label: 'Security' },
]

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getCustomerSession()
  if (!session) redirect('/login-otp')
  return <div className="min-h-screen bg-[#f4f7fb]"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b741d]">MORJAL customer account</p><p className="mt-1 text-slate-600">Signed in as {session.email}</p></div><nav aria-label="Customer account navigation" className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">{links.map((link) => <Link key={link.href} href={link.href} className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-[#073B82] transition hover:bg-blue-50">{link.label}</Link>)}</nav>{children}</div></div>
}
