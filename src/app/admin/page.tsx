import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, AlertTriangle, Package, ShoppingBag, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

const statusLabels = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery', 'delivered', 'cancelled', 'returned']

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [totalProducts, publishedProducts, outOfStockProducts, totalOrders, newOrders, pendingOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders, revenue, recentOrders, lowStockProducts, statusCounts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.product.count({ where: { OR: [{ isOutOfStock: true }, { stockQuantity: { lte: 0 } }] } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.order.count({ where: { orderStatus: 'pending' } }),
    prisma.order.count({ where: { orderStatus: { in: ['confirmed', 'processing', 'packed'] } } }),
    prisma.order.count({ where: { orderStatus: { in: ['shipped', 'out for delivery'] } } }),
    prisma.order.count({ where: { orderStatus: 'delivered' } }),
    prisma.order.count({ where: { orderStatus: { in: ['cancelled', 'returned'] } } }),
    prisma.order.aggregate({ where: { paymentStatus: 'paid', orderStatus: { notIn: ['cancelled', 'returned'] } }, _sum: { total: true } }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: 'desc' }, select: { id: true, orderNumber: true, customerName: true, total: true, orderStatus: true, paymentStatus: true, createdAt: true, _count: { select: { items: true } } } }),
    prisma.product.findMany({ where: { isPublished: true, stockQuantity: { lte: 5, gt: 0 } }, take: 8, orderBy: { stockQuantity: 'asc' }, select: { id: true, name: true, slug: true, stockQuantity: true, sku: true } }),
    prisma.order.groupBy({ by: ['orderStatus'], _count: { _all: true } }),
  ])

  const countByStatus = new Map(statusCounts.map((entry) => [entry.orderStatus, entry._count._all]))
  const summary = [
    { label: 'Total products', value: totalProducts, detail: `${publishedProducts} published`, icon: Package, tone: 'blue' },
    { label: 'Out of stock', value: outOfStockProducts, detail: 'Needs restocking', icon: AlertTriangle, tone: 'amber' },
    { label: 'Total orders', value: totalOrders, detail: `${newOrders} in the last 24 hours`, icon: ShoppingBag, tone: 'blue' },
    { label: 'Paid revenue', value: formatPrice(revenue._sum.total || 0), detail: 'Orders marked paid', icon: TrendingUp, tone: 'green' },
  ]

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b741d]">MORJAL Enterprises</p><h1 className="mt-1 text-2xl font-bold text-[#062653] sm:text-3xl">Dashboard</h1><p className="mt-2 text-sm text-slate-600">Welcome, {session.user?.name || 'Admin'}. Here is your store at a glance.</p></div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-xl bg-[#062653] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b3c7c]">Add product <ArrowRight className="h-4 w-4" /></Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Store summary">
        {summary.map(({ label, value, detail, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`rounded-xl p-2 ${tone === 'green' ? 'bg-green-50 text-green-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-[#073B82]'}`}><Icon className="h-5 w-5" /></span></div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-[#062653]">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-[#062653]">Order pipeline</h2><p className="mt-1 text-xs text-slate-500">Live counts by current fulfillment status</p></div><Link href="/admin/orders" className="text-sm font-semibold text-[#073B82] hover:underline">Manage orders</Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
          {statusLabels.map((status) => <div key={status} className="rounded-xl bg-slate-50 p-3"><p className="text-xs capitalize text-slate-500">{status}</p><p className="mt-1 text-xl font-bold text-[#062653]">{countByStatus.get(status) || 0}</p></div>)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-xl border border-blue-100 p-3"><p className="text-xs text-slate-500">New · last 24h</p><p className="mt-1 text-lg font-bold text-[#062653]">{newOrders}</p></div><div className="rounded-xl border border-blue-100 p-3"><p className="text-xs text-slate-500">Pending</p><p className="mt-1 text-lg font-bold text-[#062653]">{pendingOrders}</p></div><div className="rounded-xl border border-blue-100 p-3"><p className="text-xs text-slate-500">Processing group</p><p className="mt-1 text-lg font-bold text-[#062653]">{processingOrders}</p></div><div className="rounded-xl border border-blue-100 p-3"><p className="text-xs text-slate-500">In transit group</p><p className="mt-1 text-lg font-bold text-[#062653]">{shippedOrders}</p></div></div>
        <p className="mt-3 text-xs text-slate-500">Delivered: {deliveredOrders} · Cancelled or returned: {cancelledOrders}</p>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-[#062653]">Recent orders</h2><p className="mt-1 text-xs text-slate-500">Latest customer activity</p></div><Link href="/admin/orders" className="text-sm font-semibold text-[#073B82] hover:underline">View all</Link></div>
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-slate-50"><div><p className="font-semibold text-[#062653]">{order.orderNumber}</p><p className="mt-1 text-xs text-slate-500">{order.customerName} · {order._count.items} item(s) · {order.createdAt.toLocaleDateString('en-IN')}</p></div><div className="text-right"><p className="font-semibold text-[#062653]">{formatPrice(order.total)}</p><p className="mt-1 text-xs capitalize text-slate-500">{order.orderStatus} · {order.paymentStatus}</p></div></Link>)}
            {recentOrders.length === 0 && <p className="px-5 py-12 text-center text-sm text-slate-500">No orders yet.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-100 px-5 py-4"><div><h2 className="font-bold text-[#062653]">Low-stock alerts</h2><p className="mt-1 text-xs text-slate-500">Published items with 1–5 units</p></div><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
          <div className="divide-y divide-slate-100">
            {lowStockProducts.map((product) => <Link key={product.id} href={`/admin/products/${product.id}/edit`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-amber-50/50"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#062653]">{product.name}</p><p className="mt-1 text-xs text-slate-500">{product.sku || product.slug}</p></div><span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{product.stockQuantity} left</span></Link>)}
            {lowStockProducts.length === 0 && <p className="px-5 py-12 text-center text-sm text-slate-500">No low-stock products.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
