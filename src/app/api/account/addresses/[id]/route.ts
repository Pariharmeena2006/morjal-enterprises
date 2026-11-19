import { NextRequest, NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

function normalizeAddress(body: Record<string, unknown>) {
  const fields = ['label', 'fullName', 'phone', 'address', 'city', 'state', 'pinCode'] as const
  const text = Object.fromEntries(fields.map((field) => [field, typeof body[field] === 'string' ? body[field].trim() : ''])) as Record<(typeof fields)[number], string>
  const landmark = typeof body.landmark === 'string' ? body.landmark.trim() : ''
  if (!text.label || text.label.length > 40 || !text.fullName || text.fullName.length > 120 || !/^[0-9]{10}$/.test(text.phone) || !text.address || text.address.length > 500 || !text.city || !text.state || !/^[0-9]{6}$/.test(text.pinCode)) return null
  return { ...text, landmark: landmark || null, isDefault: body.isDefault === true }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const data = normalizeAddress(body)
    if (!data) return NextResponse.json({ error: 'Check the address fields, phone number, and PIN code.' }, { status: 400 })
    const current = await prisma.customerAddress.findFirst({ where: { id: params.id, customerId: session.user.id }, select: { id: true } })
    if (!current) return NextResponse.json({ error: 'Address not found.' }, { status: 404 })
    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) await tx.customerAddress.updateMany({ where: { customerId: session.user.id }, data: { isDefault: false } })
      return tx.customerAddress.update({ where: { id: params.id }, data: { ...data, isDefault: data.isDefault } })
    })
    return NextResponse.json(address)
  } catch {
    console.error('Customer address update failed')
    return NextResponse.json({ error: 'Unable to update this address.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const address = await prisma.customerAddress.findFirst({ where: { id: params.id, customerId: session.user.id }, select: { id: true, isDefault: true } })
    if (!address) return NextResponse.json({ error: 'Address not found.' }, { status: 404 })
    await prisma.$transaction(async (tx) => {
      await tx.customerAddress.delete({ where: { id: address.id } })
      if (address.isDefault) {
        const next = await tx.customerAddress.findFirst({ where: { customerId: session.user.id }, orderBy: { updatedAt: 'desc' }, select: { id: true } })
        if (next) await tx.customerAddress.update({ where: { id: next.id }, data: { isDefault: true } })
      }
    })
    return NextResponse.json({ success: true })
  } catch {
    console.error('Customer address deletion failed')
    return NextResponse.json({ error: 'Unable to delete this address.' }, { status: 500 })
  }
}
