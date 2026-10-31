import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createShiprocketOrder } from '@/lib/shiprocket'

type RequestedItem = { productId?: string; id?: string; quantity?: number }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const required = ['fullName', 'phone', 'address', 'city', 'state', 'pinCode']
    if (required.some((field) => typeof body[field] !== 'string' || !body[field].trim())) {
      return NextResponse.json({ error: 'Please complete all required delivery details.' }, { status: 400 })
    }
    if (!/^[0-9]{10}$/.test(body.phone) || !/^[0-9]{6}$/.test(body.pinCode)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit phone number and 6-digit PIN code.' }, { status: 400 })
    }
    if (body.paymentMethod !== 'cod') {
      return NextResponse.json({ error: 'Online payments are not available yet. Please select Cash on Delivery.' }, { status: 400 })
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
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

    const settings = await prisma.websiteSettings.findFirst()
    if (settings?.codEnabled === false) {
      return NextResponse.json({ error: 'Cash on Delivery is currently unavailable. Please contact us to place an order.' }, { status: 400 })
    }
    const productIds = Array.from(new Set(normalized.map((item) => item.productId)))
    const orderNumber = `MJ${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`

    const result = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isPublished: true },
        include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      })
      const productById = new Map(products.map((product) => [product.id, product]))
      if (products.length !== productIds.length) throw new Error('One or more items are no longer available.')

      const items = normalized.map((requested) => {
        const product = productById.get(requested.productId)
        if (!product) throw new Error('One or more items are no longer available.')
        if (product.stockQuantity < requested.quantity || product.isOutOfStock) {
          throw new Error(`${product.name} does not have enough stock. Please update your cart.`)
        }
        return { requested, product }
      })

      for (const { requested, product } of items) {
        const changed = await tx.product.updateMany({
          where: { id: product.id, stockQuantity: { gte: requested.quantity }, isPublished: true },
          data: { stockQuantity: { decrement: requested.quantity } },
        })
        if (changed.count !== 1) throw new Error(`${product.name} stock changed. Please try again.`)
      }
      for (const { product } of items) {
        const updated = await tx.product.findUnique({ where: { id: product.id }, select: { stockQuantity: true } })
        if (updated) await tx.product.update({ where: { id: product.id }, data: { isOutOfStock: updated.stockQuantity === 0 } })
      }

      const subtotal = items.reduce((sum, { requested, product }) => sum + product.sellingPrice * requested.quantity, 0)
      const freeShippingThreshold = settings?.freeShippingThreshold ?? 1000
      const shippingCharge = subtotal >= freeShippingThreshold ? 0 : 99
      return tx.order.create({
        data: {
          orderNumber,
          customerName: body.fullName.trim(), customerEmail: body.email?.trim() || null,
          customerPhone: body.phone.trim(), address: body.address.trim(), city: body.city.trim(),
          state: body.state.trim(), pinCode: body.pinCode.trim(), landmark: body.landmark?.trim() || null,
          orderNotes: body.orderNotes?.trim() || null, subtotal, shippingCharge, discount: 0,
          total: subtotal + shippingCharge, paymentMethod: 'cod', paymentStatus: 'pending', orderStatus: 'pending',
          items: {
            create: items.map(({ requested, product }) => ({
              productId: product.id, productName: product.name, quantity: requested.quantity,
              unitPrice: product.sellingPrice, totalPrice: product.sellingPrice * requested.quantity,
            })),
          },
        },
        select: { id: true, orderNumber: true, total: true },
      })
    })

    // Create order in Shiprocket if enabled
    const orderWithItems = await prisma.order.findUnique({
      where: { id: result.id },
      include: { items: true },
    })

    if (orderWithItems) {
      createShiprocketOrder(orderWithItems).catch((error) => {
        console.error('Failed to create Shiprocket order:', error)
      })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to place order.'
    console.error('Error creating order:', error)
    if (message.includes('stock') || message.includes('available')) {
      return NextResponse.json({ error: message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to place order. Please try again.' }, { status: 500 })
  }
}
