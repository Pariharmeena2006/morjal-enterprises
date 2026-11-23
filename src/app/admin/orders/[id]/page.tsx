'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ArrowLeft, PackageCheck, Save, Truck } from 'lucide-react'
import WhatsAppIcon from '@/components/whatsapp-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/utils'

interface OrderDetails {
  id: string
  orderNumber: string
  customerName: string
  customerEmail?: string | null
  customerPhone: string
  address: string
  city: string
  state: string
  pinCode: string
  landmark?: string | null
  orderNotes?: string | null
  subtotal: number
  shippingCharge: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  trackingNumber?: string | null
  courierName?: string | null
  shipmentId?: string | null
  shiprocketOrderId?: string | null
  estimatedDelivery?: string | null
  createdAt: string
  items: Array<{ id: string; productName: string; quantity: number; unitPrice: number; totalPrice: number; product: { images: Array<{ url: string; alt: string | null }> } }>
  statusHistory: Array<{ id: string; status: string; note: string | null; createdAt: string }>
}

const orderStatuses = ['enquiry', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery', 'delivered', 'cancelled', 'returned']
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded']

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [form, setForm] = useState({
    orderStatus: 'pending',
    paymentStatus: 'pending',
    trackingNumber: '',
    courierName: '',
    shipmentId: '',
    estimatedDelivery: '',
    statusNote: '',
    confirmCodCollected: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [creatingShipment, setCreatingShipment] = useState(false)
  const [refreshingTracking, setRefreshingTracking] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${params.id}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load order')
        setOrder(data)
        setForm({
          orderStatus: data.orderStatus,
          paymentStatus: data.paymentStatus,
          trackingNumber: data.trackingNumber || '',
          courierName: data.courierName || '',
          shipmentId: data.shipmentId || '',
          estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery).toISOString().slice(0, 10) : '',
          statusNote: '',
          confirmCodCollected: false,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load order')
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [params.id])

  const saveOrder = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, estimatedDelivery: form.estimatedDelivery || null }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to save order')
      setOrder(data)
      setNotice('Order updated successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save order')
    } finally {
      setSaving(false)
    }
  }

  const createShipment = async () => {
    setCreatingShipment(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/shiprocket`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to create the Shiprocket order')
      setOrder((current) => current ? { ...current, ...data } : current)
      setForm((current) => ({ ...current, shipmentId: data.shipmentId || current.shipmentId, trackingNumber: data.trackingNumber || current.trackingNumber, courierName: data.courierName || current.courierName }))
      setNotice('Shiprocket order created. Check its response for AWB and courier assignment.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create the Shiprocket order')
    } finally {
      setCreatingShipment(false)
    }
  }

  const refreshTracking = async () => {
    setRefreshingTracking(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/track`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to refresh tracking.')
      setOrder((current) => current ? { ...current, ...data } : current)
      setForm((current) => ({ ...current, orderStatus: data.orderStatus || current.orderStatus, trackingNumber: data.trackingNumber || current.trackingNumber, courierName: data.courierName || current.courierName }))
      setNotice('Shipment status was refreshed from Shiprocket.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to refresh tracking.')
    } finally {
      setRefreshingTracking(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-background-light p-8 text-center text-navy">Loading order…</div>
  if (error && !order) return <div className="min-h-screen bg-background-light p-8 text-center text-red-700">{error}</div>
  if (!order) return null

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders">
              <Button variant="outline" size="icon" aria-label="Back to orders"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div>
              <p className="text-sm font-medium text-navy/60">Order Management</p>
              <h1 className="text-2xl font-bold text-navy">{order.orderNumber}</h1>
            </div>
          </div>
          <Link href="/admin"><Button variant="outline">Dashboard</Button></Link>
        </div>

        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-green-700">{notice}</div>}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Items ordered</CardTitle></CardHeader>
              <CardContent className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex min-w-0 items-center gap-3"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background-light">{item.product.images[0]?.url && <Image src={item.product.images[0].url} alt={item.product.images[0].alt || item.productName} fill sizes="48px" className="object-cover" />}</div><div><p className="font-semibold text-navy">{item.productName}</p><p className="text-sm text-gray-600">Qty {item.quantity} × {formatPrice(item.unitPrice)}</p></div></div>
                    <p className="font-semibold text-navy">{formatPrice(item.totalPrice)}</p>
                  </div>
                ))}
                <div className="space-y-2 pt-4 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingCharge)}</span></div>
                  <div className="flex justify-between border-t pt-3 text-base font-bold text-navy"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Customer & delivery</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700">
                <p className="font-semibold text-navy">{order.customerName}</p>
                <p>{order.customerPhone}{order.customerEmail ? ` · ${order.customerEmail}` : ''}</p>
                <p>{order.address}{order.landmark ? `, ${order.landmark}` : ''}</p>
                <p>{order.city}, {order.state} {order.pinCode}</p>
                {order.orderNotes && <p className="mt-3 rounded-lg bg-background-light p-3"><strong>Note:</strong> {order.orderNotes}</p>}
                <p className="pt-2 text-gray-500">Placed {new Date(order.createdAt).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Status history</CardTitle></CardHeader>
              <CardContent>
                {order.statusHistory.length ? <ol className="space-y-4">{order.statusHistory.map((event) => <li key={event.id} className="border-l-2 border-gold pl-3"><p className="text-sm font-semibold capitalize text-navy">{event.status}</p>{event.note && <p className="text-xs text-gray-600">{event.note}</p>}<time className="text-xs text-gray-400">{new Date(event.createdAt).toLocaleString('en-IN')}</time></li>)}</ol> : <p className="text-sm text-gray-500">No status updates recorded yet.</p>}
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader><CardTitle className="flex items-center gap-2"><PackageCheck className="h-5 w-5 text-navy" />Fulfilment</CardTitle></CardHeader>
            <CardContent>
              {order.shiprocketOrderId && <p className="mb-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-900">Shiprocket order: {order.shiprocketOrderId}{order.shipmentId ? ` · Shipment ${order.shipmentId}` : ''}{order.shiprocketOrderId === 'pending' ? ' · Needs reconciliation' : ''}</p>}
              <div className="mb-4 flex flex-wrap gap-2">
                {order.customerPhone && (
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/\D/g, '').replace(/^(?!91)(?=\d{10}$)/, '91')}?text=${encodeURIComponent(`Hello ${order.customerName}, regarding your MORJAL Enterprises order enquiry ${order.orderNumber}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1eb856]"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Contact Customer on WhatsApp
                  </a>
                )}
                <Button type="button" variant="outline" className="flex-1" onClick={createShipment} disabled={creatingShipment || Boolean(order.shiprocketOrderId) || !['enquiry', 'confirmed', 'processing', 'packed'].includes(order.orderStatus)}><Truck className="mr-2 h-4 w-4" />{creatingShipment ? 'Contacting Shiprocket…' : order.shiprocketOrderId ? 'Shiprocket request recorded' : 'Create Shiprocket shipment'}</Button>
              </div>
              {order.shipmentId && order.shipmentId !== 'pending' && <Button type="button" variant="outline" className="mb-4 w-full" onClick={refreshTracking} disabled={refreshingTracking}>{refreshingTracking ? 'Refreshing…' : 'Refresh tracking from Shiprocket'}</Button>}
              <form onSubmit={saveOrder} className="space-y-4">
                <div>
                  <Label htmlFor="orderStatus">Order status</Label>
                  <select id="orderStatus" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2" value={form.orderStatus} onChange={(e) => setForm({ ...form, orderStatus: e.target.value })}>
                    {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
                {order.paymentMethod.toLowerCase() === 'cod' && form.paymentStatus === 'paid' && <label className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900"><input type="checkbox" checked={form.confirmCodCollected} onChange={(e) => setForm({ ...form, confirmCodCollected: e.target.checked })} className="mt-0.5 h-4 w-4 accent-[#073B82]" /><span>Confirm cash was actually collected before marking this COD order paid.</span></label>}
                <div><Label htmlFor="statusNote">Status update note (optional)</Label><Input id="statusNote" value={form.statusNote} onChange={(e) => setForm({ ...form, statusNote: e.target.value })} maxLength={300} /></div>
                <div>
                  <Label htmlFor="paymentStatus">Payment status</Label>
                  <select id="paymentStatus" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                    {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Method: {order.paymentMethod}</p>
                </div>
                <div><Label htmlFor="courierName">Courier</Label><Input id="courierName" value={form.courierName} onChange={(e) => setForm({ ...form, courierName: e.target.value })} /></div>
                <div><Label htmlFor="trackingNumber">Tracking number</Label><Input id="trackingNumber" value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} /></div>
                <div><Label htmlFor="shipmentId">Shipment ID</Label><Input id="shipmentId" value={form.shipmentId} onChange={(e) => setForm({ ...form, shipmentId: e.target.value })} /></div>
                <div><Label htmlFor="estimatedDelivery">Estimated delivery</Label><Input id="estimatedDelivery" type="date" value={form.estimatedDelivery} onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={saving || (order.paymentMethod.toLowerCase() === 'cod' && form.paymentStatus === 'paid' && !form.confirmCodCollected)}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save changes'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
