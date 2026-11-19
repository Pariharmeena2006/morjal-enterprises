'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  BarChart3,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  UserRound,
  Users,
  X,
} from 'lucide-react'

const links = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Add Product', href: '/admin/products/new', icon: Plus },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Homepage Banners', href: '/admin/banners', icon: Image },
  { label: 'Website Content', href: '/admin/settings', icon: FileText },
  { label: 'News & Achievements', href: '/admin/news', icon: Newspaper },
  { label: 'Website Settings', href: '/admin/settings', icon: Settings },
  { label: 'Admin Profile', href: '/admin/profile', icon: UserRound },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname === '/admin/login') return children

  return (
    <div className="min-h-screen bg-[#f4f7fb] md:flex">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-[#062653] px-4 text-white md:hidden">
        <Link href="/admin" className="font-bold tracking-wide">MORJAL <span className="text-[#d5a944]">ADMIN</span></Link>
        <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close menu' : 'Open menu'} className="rounded-lg p-2 hover:bg-white/10">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <aside className={`${open ? 'block' : 'hidden'} fixed inset-x-0 top-16 z-30 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#062653] text-white md:sticky md:top-0 md:block md:h-screen md:w-64 md:shrink-0`}>
        <div className="hidden border-b border-white/10 px-6 py-6 md:block">
          <Link href="/admin" className="text-lg font-bold tracking-wide">MORJAL <span className="text-[#d5a944]">ADMIN</span></Link>
          <p className="mt-1 text-xs text-blue-100/70">Store management</p>
        </div>
        <nav className="space-y-1 p-3" aria-label="Admin navigation">
          {links.map(({ label, href, icon: Icon }) => {
            const active = href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link key={label} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-white text-[#062653]' : 'text-blue-50 hover:bg-white/10'}`}>
                <Icon className={`h-4 w-4 ${active ? 'text-[#9b741d]' : 'text-[#d5a944]'}`} />
                {label}
              </Link>
            )
          })}
          <button type="button" onClick={() => signOut({ callbackUrl: '/admin/login' })} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-blue-50 transition hover:bg-white/10">
            <LogOut className="h-4 w-4 text-[#d5a944]" /> Logout
          </button>
        </nav>
        <div className="mx-3 mt-4 hidden rounded-xl border border-white/10 p-3 text-xs text-blue-100/70 md:block">
          <BarChart3 className="mb-2 h-4 w-4 text-[#d5a944]" />
          Manage products, orders, and store content.
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}