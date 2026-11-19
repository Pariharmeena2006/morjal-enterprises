import { NextRequest, NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function normalizeAddress(body: Record<string, unknown>) {
  const values = ['label', 'fullName', 'phone', 'address', 'city', 'state', 'pinCode'] as const
  const text = Object.fromEntries(values.map((field) => [field, typeof body[field] === 'string' ? body[field].trim() : ''])) as Record<(typeof values)[number], string>
  const landmark = typeof body.landmark === 'string' ? body.landmark.trim() : ''
  if (!text.label || text.label.length > 40 || !text.fullName || text.fullName.length > 120 || !/^[0-9]{10}$/.test(text.phone) || !text.address || text.address.length > 500 || !text.city || !text.state || !/^[0-9]{6}$/.test(text.pinCode)) return null
  return { ...text, landmark: landmark || null, isDefault: body.isDefault === true }
}

export async function GET() {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const addresses = await prisma.customerAddress.findMany({ where: { customerId: session.user.id }, orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] })
  return NextResponse.json(addresses, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const data = normalizeAddress(body)
    if (!data) return NextResponse.json({ error: 'Check the address fields, phone number, and PIN code.' }, { status: 400 })
    const count = await prisma.customerAddress.count({ where: { customerId: session.user.id } })
    if (count >= 20) return NextResponse.json({ error: 'You can save up to 20 addresses.' }, { status: 400 })
    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault || count === 0) await tx.customerAddress.updateMany({ where: { customerId: session.user.id }, data: { isDefault: false } })
      return tx.customerAddress.create({ data: { ...data, isDefault: data.isDefault || count === 0, customerId: session.user.id } })
    })
    return NextResponse.json(address, { status: 201 })
  } catch {
    console.error('Customer address creation failed')
    return NextResponse.json({ error: 'Unable to save this address.' }, { status: 500 })
  }
}
