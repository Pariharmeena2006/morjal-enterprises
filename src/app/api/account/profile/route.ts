import { NextRequest, NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const customer = await prisma.customer.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, phone: true, emailVerifiedAt: true, createdAt: true },
  })
  if (!customer) return NextResponse.json({ error: 'Customer account not found' }, { status: 404 })
  return NextResponse.json(customer, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PATCH(request: NextRequest) {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.replace(/\D/g, '') : ''
    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: 'Enter a valid name.' }, { status: 400 })
    }
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit mobile number.' }, { status: 400 })
    }
    const customer = await prisma.customer.update({
      where: { id: session.id },
      data: { name, phone: phone || null },
      select: { id: true, name: true, email: true, phone: true, emailVerifiedAt: true },
    })
    return NextResponse.json(customer, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Customer profile update failed')
    return NextResponse.json({ error: 'Unable to update your profile.' }, { status: 500 })
  }
}
