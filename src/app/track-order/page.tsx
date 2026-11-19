'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, PackageCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type TrackingResult = {
  orderNumber: string
  orderStatus: string
  createdAt: string
  trackingNumber: string | null
  courierName: string | null
  estimatedDelivery: string | null
  items: Array<{ productName: string; quantity: number }>
  statusHistory: Array<{ status: string; createdAt: string }>
}

const journey = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery', 'delivered']

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [token, setToken] = useState('')
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadTracking = useCallback(async (number = orderNumber, trackingToken = token) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: number, token: trackingToken }),
        cache: 'no-store',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to find that order.')
      setResult(data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to find that order.')
    } finally {
      setLoading(false)
    }
  }, [orderNumber, token])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const number = params.get('order') || ''
    const privateToken = new URLSearchParams(window.location.hash.slice(1)).get('token') || ''
    if (!number || !privateToken) return
    setOrderNumber(number)
    setToken(privateToken)
    void loadTracking(number, privateToken)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }, [loadTracking])

  const currentStep = result ? journey.indexOf(result.orderStatus.toLowerCase()) : -1

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#073B82]"><ArrowLeft className="h-4 w-4" /> Back to MORJAL</Link>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start gap-4"><span className="rounded-2xl bg-blue-50 p-3 text-[#073B82]"><Truck className="h-6 w-6" /></span><div><h1 className="text-2xl font-bold text-[#062653]">Track your order</h1><p className="mt-1 text-sm text-slate-600">Use the private link from your order confirmation to view delivery progress.</p></div></div>
          <form onSubmit={(event) => { event.preventDefault(); void loadTracking() }} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div><Label htmlFor="orderNumber">Order number</Label><Input id="orderNumber" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} required className="mt-1" /></div>
            <div><Label htmlFor="trackingToken">Private tracking code</Label><Input id="trackingToken" value={token} onChange={(event) => setToken(event.target.value)} required className="mt-1" autoComplete="off" /></div>
            <Button type="submit" disabled={loading}>{loading ? 'Checking…' : 'Track order'}</Button>
          </form>
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </section>

        {result && <section className="mt-6 space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order</p><h2 className="mt-1 text-xl font-bold text-[#062653]">{result.orderNumber}</h2></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold capitalize text-[#073B82]">{result.orderStatus}</span></div>
          <p className="text-sm text-slate-500">Placed {new Date(result.createdAt).toLocaleString('en-IN')}</p>
          {result.orderStatus !== 'cancelled' && result.orderStatus !== 'returned' && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{journey.map((step, index) => <div key={step} className={`rounded-xl p-3 text-center text-xs capitalize ${index <= currentStep ? 'bg-[#073B82] text-white' : 'bg-slate-100 text-slate-500'}`}><PackageCheck className="mx-auto mb-1 h-4 w-4" />{step}</div>)}</div>}
          {result.orderStatus === 'cancelled' || result.orderStatus === 'returned' ? <p className="rounded-xl bg-amber-50 p-3 text-sm capitalize text-amber-800">Order status: {result.orderStatus}</p> : null}
          {(result.trackingNumber || result.courierName || result.estimatedDelivery) && <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><p className="font-semibold text-[#062653]">Shipment details</p>{result.courierName && <p className="mt-2">Courier: {result.courierName}</p>}{result.trackingNumber && <p>Tracking / AWB: {result.trackingNumber}</p>}{result.estimatedDelivery && <p>Estimated delivery: {new Date(result.estimatedDelivery).toLocaleDateString('en-IN')}</p>}</div>}
          <div><h3 className="font-semibold text-[#062653]">Items</h3><ul className="mt-2 space-y-2 text-sm text-slate-700">{result.items.map((item, index) => <li key={`${item.productName}-${index}`} className="flex justify-between gap-4"><span>{item.productName}</span><span>Qty {item.quantity}</span></li>)}</ul></div>
          <div><h3 className="font-semibold text-[#062653]">Order updates</h3><ol className="mt-3 space-y-3">{result.statusHistory.map((event, index) => <li key={`${event.status}-${event.createdAt}-${index}`} className="border-l-2 border-[#d5a944] pl-3"><p className="text-sm font-semibold capitalize text-[#062653]">{event.status}</p><time className="text-xs text-slate-400">{new Date(event.createdAt).toLocaleString('en-IN')}</time></li>)}</ol></div>
        </section>}
      </div>
    </main>
  )
}