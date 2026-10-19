'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import AnnouncementBar from '@/components/announcement-bar'
import Header from '@/components/header'
import Footer from '@/components/footer'

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute) {
    return <main>{children}</main>
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
