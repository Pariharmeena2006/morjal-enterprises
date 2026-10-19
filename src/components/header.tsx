'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ShoppingCart, Menu, X } from 'lucide-react'
import { Button } from './ui/button'
import { readCart } from '@/lib/cart'

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

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
            <Image src="/logo.png" alt="MORJAL Enterprises Kota" fill priority sizes="112px" className="object-contain" />
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
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
