import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { createShiprocketOrder } from '@/lib/shiprocket'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (!['confirmed', 'processing', 'packed'].includes(order.orderStatus)) {
    return NextResponse.json({ error: 'Confirm or begin processing this order before creating a shipment.' }, { status: 409 })
  }
  if (order.paymentMethod.toLowerCase() !== 'cod' && order.paymentStatus !== 'paid') {
    return NextResponse.json({ error: 'Prepaid orders must be verified as paid before shipment creation.' }, { status: 409 })
  }

  const settings = await prisma.websiteSettings.findFirst({
    select: { shiprocketEnabled: true, shiprocketEmail: true, shiprocketApiKey: true },
  })
  if (!settings?.shiprocketEnabled || !settings.shiprocketEmail || !settings.shiprocketApiKey) {
    return NextResponse.json({ error: 'Shiprocket is disabled or its server-side credentials are not configured.' }, { status: 503 })
  }

  const claim = await prisma.order.updateMany({
    where: { id: order.id, shiprocketOrderId: null, shipmentId: null },
    data: { shiprocketOrderId: 'pending' },
  })
  if (claim.count !== 1) {
    return NextResponse.json({ error: 'A Shiprocket request already exists or is being reconciled. Check the Shiprocket dashboard before retrying.' }, { status: 409 })
  }

  const shiprocketResult = await createShiprocketOrder(order)
  if (!shiprocketResult || typeof shiprocketResult !== 'object') {
    // Keep the claim locked: the upstream request may have succeeded even if its response was lost.
    return NextResponse.json({ error: 'Shiprocket did not confirm the response. The request is locked to prevent duplicates; verify the Shiprocket dashboard before retrying.' }, { status: 502 })
  }

  const result = shiprocketResult as Record<string, unknown>
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      shiprocketOrderId: result.order_id == null ? 'pending' : String(result.order_id),
      shipmentId: result.shipment_id == null ? null : String(result.shipment_id),
      trackingNumber: result.awb_code == null ? order.trackingNumber : String(result.awb_code),
      courierName: result.courier_name == null ? order.courierName : String(result.courier_name),
    },
    select: { id: true, orderNumber: true, orderStatus: true, shiprocketOrderId: true, shipmentId: true, trackingNumber: true, courierName: true },
  })
  return NextResponse.json(updated)
}