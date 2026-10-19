'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function AdminSignOut() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="border-white text-white hover:bg-white hover:text-navy"
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
    >
      Logout
    </Button>
  )
}
