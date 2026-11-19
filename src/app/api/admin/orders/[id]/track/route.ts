import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { getShiprocketTracking } from '@/lib/shiprocket'

const statusMap: Record<string, string> = {
  'new': 'confirmed',
  'awb assigned': 'packed',
  'picked up': 'shipped',
  'in transit': 'shipped',
  'out for delivery': 'out for delivery',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'return to origin': 'returned',
  'returned': 'returned',
}

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { id: true, shipmentId: true, orderStatus: true },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (!order.shipmentId || order.shipmentId === 'pending') {
      return NextResponse.json({ error: 'A Shiprocket shipment ID is not available yet.' }, { status: 409 })
    }

    const response = await getShiprocketTracking(order.shipmentId)
    if (!response || typeof response !== 'object') {
      return NextResponse.json({ error: 'Shiprocket tracking could not be verified. Check integration settings and try again.' }, { status: 502 })
    }
    const payload = response as { tracking_data?: { shipment_track?: Array<{ current_status?: unknown; awb_code?: unknown; courier_name?: unknown }> } }
    const latest = payload.tracking_data?.shipment_track?.[0]
    if (!latest || typeof latest.current_status !== 'string') {
      return NextResponse.json({ error: 'Shiprocket returned no recognized shipment status.' }, { status: 502 })
    }

    const currentStatus = latest.current_status.trim()
    const mappedStatus = statusMap[currentStatus.toLowerCase()]
    const awb = typeof latest.awb_code === 'string' && latest.awb_code ? latest.awb_code : undefined
    const courier = typeof latest.courier_name === 'string' && latest.courier_name ? latest.courier_name : undefined
    const orderChanged = Boolean(mappedStatus && mappedStatus !== order.orderStatus)
    const updated = await prisma.$transaction(async (tx) => {
      const saved = await tx.order.update({
        where: { id: order.id },
        data: {
          ...(mappedStatus ? { orderStatus: mappedStatus } : {}),
          ...(awb ? { trackingNumber: awb } : {}),
          ...(courier ? { courierName: courier } : {}),
        },
        select: { id: true, orderNumber: true, orderStatus: true, shipmentId: true, trackingNumber: true, courierName: true },
      })
      if (orderChanged && mappedStatus) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: mappedStatus,
            note: `Status confirmed by Shiprocket: ${currentStatus.slice(0, 100)}`,
            changedByAdminId: session.user?.id || null,
          },
        })
      }
      return saved
    })
    return NextResponse.json(updated, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Shiprocket tracking refresh failed')
    return NextResponse.json({ error: 'Unable to refresh shipment tracking right now.' }, { status: 500 })
  }
}