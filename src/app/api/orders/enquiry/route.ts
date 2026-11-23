import { NextRequest, NextResponse } from 'next/server'
import { createHash, createHmac, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { consumeAuthRateLimit, requestAddress } from '@/lib/auth-rate-limit'
import { getWhatsAppNumber, buildWhatsAppUrl } from '@/lib/whatsapp'
import { formatPrice } from '@/lib/utils'

type RequestedItem = { productId?: string; id?: string; quantity?: number }

const PAYMENT_METHODS = ['cod', 'upi', 'prepaid']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Rate limit: 8 enquiries per 15 minutes per IP
    const rate = await consumeAuthRateLimit('order-enquiry', requestAddress(request), 8)
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many order enquiries. Please try again later.' }, { status: 429 })
    }

    const idempotencyKey = request.headers.get('Idempotency-Key')?.trim()
    if (idempotencyKey && /^[a-zA-Z0-9-]{32,64}$/.test(idempotencyKey)) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey },
        select: { id: true, orderNumber: true, total: true },
      })
      if (existing) {
        return NextResponse.json({ id: existing.id, orderNumber: existing.orderNumber, total: existing.total, duplicate: true }, { status: 200 })
      }
    }

    const required = ['fullName', 'phone', 'address', 'city', 'state', 'pinCode']
    if (required.some((field) => typeof body[field] !== 'string' || !body[field].trim())) {
      return NextResponse.json({ error: 'Please complete all required delivery details.' }, { status: 400 })
    }
    if (body.fullName.trim().length > 150 || body.address.trim().length > 500 || body.city.trim().length > 100 || body.state.trim().length > 100 || (typeof body.orderNotes === 'string' && body.orderNotes.length > 1000)) {
      return NextResponse.json({ error: 'One or more order details are too long.' }, { status: 400 })
    }
    if (body.email !== undefined && body.email !== null && body.email !== '' && (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))) {
      return NextResponse.json({ error: 'Enter a valid email address or leave it blank.' }, { status: 400 })
    }
    if (!/^[6-9][0-9]{9}$/.test(body.phone.trim()) || !/^[1-9][0-9]{5}$/.test(body.pinCode.trim())) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number and 6-digit PIN code.' }, { status: 400 })
    }
    const paymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod.trim().toLowerCase() : 'cod'
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Please choose a valid payment preference.' }, { status: 400 })
    }
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }
    if (body.items.some((item: unknown) => !item || typeof item !== 'object')) {
      return NextResponse.json({ error: 'Cart contains an invalid product or quantity.' }, { status: 400 })
    }

    const requestedItems = body.items as RequestedItem[]
    const normalizedItems = requestedItems.map((item) => ({
      productId: String(item.productId || item.id || ''),
      quantity: Number(item.quantity),
    }))
    if (normalizedItems.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10)) {
      return NextResponse.json({ error: 'Cart contains an invalid product or quantity.' }, { status: 400 })
    }
    const normalizedMap = normalizedItems.reduce((items, item) => {
      items.set(item.productId, { productId: item.productId, quantity: (items.get(item.productId)?.quantity || 0) + item.quantity })
      return items
    }, new Map<string, { productId: string; quantity: number }>())
    const normalized = Array.from(normalizedMap.values())
    if (normalized.some((item) => item.quantity > 10)) {
      return NextResponse.json({ error: 'A product quantity cannot exceed 10.' }, { status: 400 })
    }

    const productIds = normalized.map((item) => item.productId)
    const [products, settings] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds }, isPublished: true },
        include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      }),
      prisma.websiteSettings.findFirst(),
    ])
    const productById = new Map(products.map((product) => [product.id, product]))
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more items are no longer available.' }, { status: 409 })
    }

    const pricedItems = normalized.map((requested) => {
      const product = productById.get(requested.productId)!
      if (product.isOutOfStock || product.stockQuantity < requested.quantity) {
        throw new Error(`${product.name} is out of stock. Please update your cart.`)
      }
      return { requested, product }
    })

    const subtotal = pricedItems.reduce((sum, { requested, product }) => sum + product.sellingPrice * requested.quantity, 0)
    const freeShippingThreshold = settings?.freeShippingThreshold ?? 1000
    const shippingCharge = subtotal >= freeShippingThreshold ? 0 : 99
    const total = subtotal + shippingCharge
    const orderNumber = `MOR-${Date.now().toString().slice(-6)}${randomBytes(2).toString('hex').toUpperCase()}`
    const trackingToken = createHmac('sha256', process.env.NEXTAUTH_SECRET || 'enquiry').update(`order-tracking:${orderNumber}:${Date.now()}:${randomBytes(8).toString('hex')}`).digest('hex')

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: body.fullName.trim(),
        customerEmail: body.email?.trim() || null,
        customerPhone: body.phone.trim(),
        address: body.address.trim(),
        city: body.city.trim(),
        state: body.state.trim(),
        pinCode: body.pinCode.trim(),
        landmark: typeof body.landmark === 'string' ? body.landmark.trim().slice(0, 200) || null : null,
        orderNotes: typeof body.orderNotes === 'string' ? body.orderNotes.trim().slice(0, 1000) || null : null,
        subtotal,
        shippingCharge,
        discount: 0,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'enquiry',
        idempotencyKey: idempotencyKey && /^[a-zA-Z0-9-]{32,64}$/.test(idempotencyKey) ? idempotencyKey : null,
        trackingTokenHash: createHash('sha256').update(trackingToken).digest('hex'),
        statusHistory: { create: { status: 'enquiry', note: 'WhatsApp order enquiry received. Awaiting customer confirmation.' } },
        items: {
          create: pricedItems.map(({ requested, product }) => ({
            productId: product.id,
            productName: product.name,
            quantity: requested.quantity,
            unitPrice: product.sellingPrice,
            totalPrice: product.sellingPrice * requested.quantity,
          })),
        },
      },
      select: { id: true, orderNumber: true, total: true },
    })

    // Build the pre-filled WhatsApp enquiry message from the saved order data
    const whatsappNumber = await getWhatsAppNumber()
    const itemLines = pricedItems.map(({ requested, product }, index) =>
      `${index + 1}. ${product.name}\n   Quantity: ${requested.quantity}\n   Price: ${formatPrice(product.sellingPrice * requested.quantity)}`
    ).join('\n')
    const paymentLabel = paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : paymentMethod === 'upi' ? 'UPI' : 'Online payment'
    const message = [
      '🛍️ *NEW ORDER ENQUIRY – MORJAL ENTERPRISES*',
      '',
      `*Order ID:* ${order.orderNumber}`,
      `*Customer Name:* ${body.fullName.trim()}`,
      `*Mobile:* ${body.phone.trim()}`,
      body.email?.trim() ? `*Email:* ${body.email.trim()}` : null,
      '',
      '*Products:*',
      itemLines,
      '',
      `*Subtotal:* ${formatPrice(subtotal)}`,
      `*Shipping:* ${shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}`,
      `*Total:* ${formatPrice(total)}`,
      `*Payment Preference:* ${paymentLabel}`,
      '',
      '*Delivery Address:*',
      `${body.address.trim()}, ${body.city.trim()}, ${body.state.trim()} – ${body.pinCode.trim()}`,
      body.landmark?.trim() ? `Landmark: ${body.landmark.trim()}` : null,
      body.orderNotes?.trim() ? `*Note:* ${body.orderNotes.trim()}` : null,
      '',
      '*Order Type:* Website Enquiry',
      '',
      'Please confirm availability, final price, delivery and payment details.',
    ].filter((line): line is string => line !== null).join('\n')

    const whatsappUrl = whatsappNumber ? buildWhatsAppUrl(whatsappNumber, message) : ''

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      whatsappUrl: whatsappUrl || null,
      whatsappConfigured: Boolean(whatsappNumber),
      trackingToken,
      message: 'Order enquiry saved. Please send it on WhatsApp to confirm.',
    }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save order enquiry.'
    console.error('Error creating order enquiry')
    if (message.includes('stock') || message.includes('available')) {
      return NextResponse.json({ error: message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to save your order enquiry. Please try again.' }, { status: 500 })
  }
}
