'use client'

import { Mail, Phone, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AnnouncementBar() {
  const [message, setMessage] = useState('Free shipping on orders above ₹1,000')
  const [phone, setPhone] = useState('9694142555')
  const [secondPhone, setSecondPhone] = useState('8003351113')
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetch('/api/store-settings')
      .then((response) => response.json())
      .then((settings) => {
        setMessage(settings.announcementMessage || `Free shipping on orders above ₹${Number(settings.freeShippingThreshold || 1000).toLocaleString('en-IN')}`)
        setPhone('9694142555')
        setSecondPhone('8003351113')
        setEmail(settings.contactEmail || '')
      })
      .catch(() => undefined)
  }, [])

  return (
    <div className="bg-[#041c42] px-4 text-white">
      <div className="container mx-auto flex flex-col items-center justify-center gap-1 py-1 text-[9px] sm:min-h-8 sm:flex-row sm:justify-between sm:gap-4 sm:py-0 sm:text-[10px]">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-3">
          {phone && <a href={`tel:${phone}`} className="inline-flex items-center gap-1 transition hover:text-gold"><Phone className="h-3 w-3" />{phone}</a>}
          {secondPhone && <a href={`tel:${secondPhone}`} className="inline-flex items-center gap-1 transition hover:text-gold"><Phone className="h-3 w-3" />{secondPhone}</a>}
          {email && <a href={`mailto:${email}`} className="hidden items-center gap-1.5 transition hover:text-gold lg:inline-flex"><Mail className="h-3 w-3" />{email}</a>}
        </div>
        <p className="flex items-center justify-center gap-1.5 text-center font-medium sm:flex-1"><Truck className="h-3 w-3 shrink-0 text-gold" />{message}</p>
        <span className="hidden items-center gap-1.5 font-medium sm:inline-flex"><ShieldCheck className="h-3 w-3 text-gold" />Secure payment</span>
      </div>
    </div>
  )
}
