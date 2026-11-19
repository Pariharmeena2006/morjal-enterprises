import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, PackageCheck, Truck } from 'lucide-react'
import { getCustomerSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type OrderDetailPageProps = { params: { id: string } }

export default async function CustomerOrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getCustomerSession()
  if (!session) redirect('/login')
  const order = await prisma.order.findFirst({
    where: { id: params.id, customerId: session.user.id },
    include: {
      items: { include: { product: { select: { images: { orderBy: { order: 'asc' }, take: 1 } } } } },
      statusHistory: { orderBy: { createdAt: 'asc' }, select: { id: true, status: true, createdAt: true } },
    },
  })
  if (!order) notFound()
  const statuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery', 'delivered']
  const currentStep = statuses.indexOf(order.orderStatus.toLowerCase())

  return <div><Link href="/account/orders" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#073B82]"><ArrowLeft className="h-4 w-4" /> Back to my orders</Link><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order details</p><h1 className="mt-1 text-3xl font-bold text-[#062653]">{order.orderNumber}</h1><p className="mt-2 text-sm text-slate-500">Placed {order.createdAt.toLocaleString('en-IN')}</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold capitalize text-[#073B82]">{order.orderStatus}</span></div>
    {order.orderStatus !== 'cancelled' && order.orderStatus !== 'returned' && <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-[#062653]">Delivery progress</h2><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{statuses.map((status, index) => <div key={status} className={`rounded-xl p-3 text-center text-xs capitalize ${index <= currentStep ? 'bg-[#073B82] text-white' : 'bg-slate-100 text-slate-500'}`}><PackageCheck className="mx-auto mb-1 h-4 w-4" />{status}</div>)}</div></section>}
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"><div className="space-y-6"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><h2 className="border-b border-slate-100 px-5 py-4 font-bold text-[#062653]">Items</h2>{order.items.map((item) => <div key={item.id} className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 last:border-0"><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">{item.product.images[0]?.url && <Image src={item.product.images[0].url} alt={item.product.images[0].alt || item.productName} fill sizes="64px" className="object-contain p-1" />}</div><div className="min-w-0 flex-1"><p className="font-semibold text-[#062653]">{item.productName}</p><p className="mt-1 text-sm text-slate-500">Qty {item.quantity} × {formatPrice(item.unitPrice)}</p></div><p className="font-semibold text-[#062653]">{formatPrice(item.totalPrice)}</p></div>)}<div className="space-y-2 bg-slate-50 px-5 py-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingCharge)}</span></div>{order.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}<div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-[#062653]"><span>Total</span><span>{formatPrice(order.total)}</span></div></div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-[#062653]">Order timeline</h2><ol className="mt-4 space-y-4">{order.statusHistory.map((event) => <li key={event.id} className="border-l-2 border-[#d5a944] pl-3"><p className="text-sm font-semibold capitalize text-[#062653]">{event.status}</p><time className="text-xs text-slate-500">{event.createdAt.toLocaleString('en-IN')}</time></li>)}</ol></section>
    </div><aside className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-[#062653]">Delivery address</h2><div className="mt-3 space-y-1 text-sm text-slate-600"><p className="font-semibold text-[#062653]">{order.customerName}</p><p>{order.customerPhone}</p>{order.customerEmail && <p>{order.customerEmail}</p>}<p>{order.address}</p>{order.landmark && <p>{order.landmark}</p>}<p>{order.city}, {order.state} {order.pinCode}</p></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-[#062653]">Payment & shipping</h2><div className="mt-3 space-y-2 text-sm text-slate-600"><p>Payment method: <span className="font-medium capitalize">{order.paymentMethod}</span></p><p>Payment status: <span className="font-medium capitalize">{order.paymentStatus}</span></p>{order.courierName && <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#9b741d]" />{order.courierName}</p>}{order.trackingNumber && <p>Tracking number: <span className="font-semibold text-[#062653]">{order.trackingNumber}</span></p>}{order.estimatedDelivery && <p>Estimated delivery: {order.estimatedDelivery.toLocaleDateString('en-IN')}</p>}{!order.trackingNumber && <p className="text-xs text-slate-500">Carrier tracking will appear here when available.</p>}</div></section></aside></div>
  </div>
}
