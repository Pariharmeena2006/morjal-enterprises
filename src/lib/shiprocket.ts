import { prisma } from '@/lib/prisma'

interface ShiprocketOrderItem {
  name: string
  sku: string
  units: number
  selling_price: number
  discount: number
  tax: number
  hsn: number
}

interface ShiprocketOrderData {
  order_id: string
  order_date: string
  pickup_location: string
  channel_id: string
  comment: string
  billing_customer_name: string
  billing_last_name: string
  billing_address: string
  billing_address_2: string
  billing_city: string
  billing_pincode: string
  billing_state: string
  billing_country: string
  billing_email: string
  billing_phone: string
  shipping_is_billing: boolean
  shipping_customer_name: string
  shipping_last_name: string
  shipping_address: string
  shipping_address_2: string
  shipping_city: string
  shipping_pincode: string
  shipping_state: string
  shipping_country: string
  shipping_email: string
  shipping_phone: string
  order_items: ShiprocketOrderItem[]
  payment_method: string
  shipping_charges: number
  giftwrap_charges: number
  transaction_charges: number
  total_discount: number
  sub_total: number
  length: number
  breadth: number
  height: number
  weight: number
}

export async function createShiprocketOrder(orderData: any) {
  try {
    const settings = await prisma.websiteSettings.findFirst()
    
    if (!settings?.shiprocketEnabled || !settings.shiprocketEmail || !settings.shiprocketApiKey) {
      console.log('Shiprocket not configured')
      return null
    }

    // Get auth token
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: settings.shiprocketEmail,
        password: settings.shiprocketApiKey,
      }),
    })

    if (!authResponse.ok) {
      console.error('Shiprocket auth failed')
      return null
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Prepare order items
    const orderItems = orderData.items.map((item: any) => ({
      name: item.productName,
      sku: item.productId,
      units: item.quantity,
      selling_price: item.unitPrice,
      discount: 0,
      tax: 0,
      hsn: 0,
    }))

    // Prepare order data for Shiprocket
    const shiprocketOrder: ShiprocketOrderData = {
      order_id: orderData.orderNumber,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary',
      channel_id: settings.shiprocketChannelId || '',
      comment: orderData.orderNotes || '',
      billing_customer_name: orderData.customerName.split(' ')[0] || orderData.customerName,
      billing_last_name: orderData.customerName.split(' ').slice(1).join(' ') || '',
      billing_address: orderData.address,
      billing_address_2: orderData.landmark || '',
      billing_city: orderData.city,
      billing_pincode: orderData.pinCode,
      billing_state: orderData.state,
      billing_country: 'India',
      billing_email: orderData.customerEmail || '',
      billing_phone: orderData.customerPhone,
      shipping_is_billing: true,
      shipping_customer_name: orderData.customerName.split(' ')[0] || orderData.customerName,
      shipping_last_name: orderData.customerName.split(' ').slice(1).join(' ') || '',
      shipping_address: orderData.address,
      shipping_address_2: orderData.landmark || '',
      shipping_city: orderData.city,
      shipping_pincode: orderData.pinCode,
      shipping_state: orderData.state,
      shipping_country: 'India',
      shipping_email: orderData.customerEmail || '',
      shipping_phone: orderData.customerPhone,
      order_items: orderItems,
      payment_method: orderData.paymentMethod === 'cod' ? 'cod' : 'prepaid',
      shipping_charges: orderData.shippingCharge,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: orderData.discount,
      sub_total: orderData.subtotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    }

    // Create order in Shiprocket
    const orderResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(shiprocketOrder),
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({}))
      console.error('Shiprocket order creation failed:', errorData)
      return null
    }

    const shiprocketData = await orderResponse.json()
    return shiprocketData
  } catch (error) {
    console.error('Shiprocket API error:', error)
    return null
  }
}

export async function getShiprocketTracking(orderId: string) {
  try {
    const settings = await prisma.websiteSettings.findFirst()
    
    if (!settings?.shiprocketEnabled || !settings.shiprocketEmail || !settings.shiprocketApiKey) {
      return null
    }

    // Get auth token
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: settings.shiprocketEmail,
        password: settings.shiprocketApiKey,
      }),
    })

    if (!authResponse.ok) {
      return null
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Get tracking data
    const trackingResponse = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!trackingResponse.ok) {
      return null
    }

    return await trackingResponse.json()
  } catch (error) {
    console.error('Shiprocket tracking error:', error)
    return null
  }
}
