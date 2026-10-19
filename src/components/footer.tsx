'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Facebook, Instagram, Twitter, Linkedin, ArrowUp, MapPin, Phone, Mail } from 'lucide-react'

type StoreDetails = {
  contactPhone?: string | null
  whatsappNumber?: string | null
  contactEmail?: string | null
  contactAddress?: string | null
  socialFacebook?: string | null
  socialInstagram?: string | null
  socialTwitter?: string | null
  socialLinkedIn?: string | null
}

export default function Footer() {
  const [details, setDetails] = useState<StoreDetails>({})

  useEffect(() => {
    fetch('/api/store-settings')
      .then((response) => response.json())
      .then(setDetails)
      .catch(() => undefined)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-navy-deep text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid min-w-0 grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
          {/* Column 1: MORJAL Enterprises */}
          <div>
            <div className="relative mb-4 h-20 w-36 overflow-hidden rounded-lg bg-white sm:h-24 sm:w-44">
              <Image src="/logo.png" alt="MORJAL Enterprises Kota" fill sizes="176px" className="object-contain" />
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Based in Kota, Rajasthan, Morjal Enterprises is a trusted provider of premium electrical safety equipment for industrial and workplace protection.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gold">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping-policy" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gold">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-gold flex-shrink-0" />
                <span>{details.contactAddress || 'Kota, Rajasthan, India'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                <a href="tel:9694142555" className="break-all">9694142555</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-gold" />
                <a href="tel:8003351113" className="break-all">8003351113</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                {details.contactEmail ? <a href={`mailto:${details.contactEmail}`}>{details.contactEmail}</a> : <span>Contact details to be updated</span>}
              </li>
            </ul>

            {/* Social Media Icons */}
            <div className="flex space-x-3 mt-4">
              {details.socialFacebook && <a href={details.socialFacebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-gray-300 hover:text-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>}
              {details.socialInstagram && <a href={details.socialInstagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-gray-300 hover:text-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>}
              {details.socialTwitter && <a href={details.socialTwitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-gray-300 hover:text-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </a>}
              {details.socialLinkedIn && <a href={details.socialLinkedIn} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-gray-300 hover:text-gold transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} MORJAL Enterprises. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 text-gold hover:text-white transition-colors text-sm"
            >
              <span>Back to Top</span>
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
