'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Search, ShoppingCart, Menu, X, UserRound } from 'lucide-react'
import { Button } from './ui/button'
import { readCart } from '@/lib/cart'

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const { data: session, status } = useSession()
  const customer = session?.user?.role === 'customer'

  useEffect(() => {
    const updateCartCount = () => {
      const count = readCart().reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
    }

    updateCartCount()

    const handleCartUpdate = () => {
      updateCartCount()
    }

    window.addEventListener('cart-updated', handleCartUpdate)
    window.addEventListener('storage', handleCartUpdate)

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      window.removeEventListener('storage', handleCartUpdate)
    }
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/news', label: 'News' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_2px_12px_rgba(4,28,66,0.08)] transition-all duration-300">
      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-[60px] min-w-0 items-center justify-between gap-2 sm:h-16 sm:gap-4">
          {/* Logo */}
          <Link href="/" aria-label="MORJAL Enterprises home" className="relative block h-12 w-24 shrink-0 sm:h-14 sm:w-28">
            <Image src="/logo.png" alt="MORJAL Enterprises, Kaprain, Bundi" fill priority sizes="112px" className="object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden h-full items-center space-x-5 md:flex lg:space-x-9">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex h-full items-center text-xs font-semibold transition-colors lg:text-sm ${pathname === link.href ? 'text-navy after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gold' : 'text-navy/80 hover:text-gold'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search */}
            <Link href="/products#products" aria-label="Search products" className="hidden md:flex h-10 w-10 items-center justify-center text-navy transition-colors hover:text-gold">
              <Search className="h-5 w-5" />
            </Link>

            {customer ? (
              <details className="relative hidden sm:block">
                <summary aria-label="Customer account menu" className="flex h-10 cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-2 text-navy transition-colors hover:text-gold"><UserRound className="h-5 w-5" /><span className="hidden text-xs font-semibold lg:inline">Account</span></summary>
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <Link href="/account" className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-blue-50">My Account</Link>
                  <Link href="/account/orders" className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-blue-50">My Orders</Link>
                  <Link href="/account/addresses" className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-blue-50">Saved Addresses</Link>
                  <Link href="/account/profile" className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-blue-50">Profile</Link>
                  <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="w-full rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-blue-50">Logout</button>
                </div>
              </details>
            ) : status === 'authenticated' ? (
              <Link href="/admin" aria-label="Admin dashboard" className="hidden text-xs font-semibold text-navy hover:text-gold sm:inline">Admin</Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="rounded-lg px-2 py-2 text-xs font-semibold text-navy hover:text-gold sm:block">Login</Link>
                <Link href="/signup" className="rounded-lg bg-[#073B82] px-3 py-2 text-xs font-semibold text-white hover:bg-navy sm:block">Create account</Link>
              </div>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-navy hover:text-gold transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-navy"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-navy hover:text-gold transition-colors py-2 text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {customer ? <>
                <Link href="/account" className="py-2 text-lg font-medium text-navy hover:text-gold" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                <Link href="/account/orders" className="py-2 text-lg font-medium text-navy hover:text-gold" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                <Link href="/account/addresses" className="py-2 text-lg font-medium text-navy hover:text-gold" onClick={() => setIsMenuOpen(false)}>Saved Addresses</Link>
                <button type="button" className="py-2 text-left text-lg font-medium text-navy hover:text-gold" onClick={() => signOut({ callbackUrl: '/' })}>Logout</button>
              </> : status === 'authenticated' ? (
                <Link href="/admin" className="py-2 text-lg font-medium text-navy hover:text-gold" onClick={() => setIsMenuOpen(false)}>Admin dashboard</Link>
              ) : <>
                <Link href="/login" className="py-2 text-lg font-medium text-navy hover:text-gold" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link href="/signup" className="py-2 text-lg font-medium text-navy hover:text-gold" onClick={() => setIsMenuOpen(false)}>Create account</Link>
              </>}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
