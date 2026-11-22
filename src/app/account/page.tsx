import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, PackageCheck, ShoppingBag, Truck, UserRound } from 'lucide-react'
import { getCustomerSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'
const activeStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery']

export default async function AccountDashboardPage() {
  const session = await getCustomerSession()
  if (!session) redirect('/login-otp')
  const [customer, totalOrders, activeOrders, deliveredOrders, recentOrders, addressCount] = await Promise.all([
    prisma.customer.findUnique({ where: { id: session.id }, select: { name: true, email: true, phone: true, emailVerifiedAt: true } }),
    prisma.order.count({ where: { customerId: session.id } }),
    prisma.order.count({ where: { customerId: session.id, orderStatus: { in: activeStatuses } } }),
    prisma.order.count({ where: { customerId: session.id, orderStatus: 'delivered' } }),
    prisma.order.findMany({ where: { customerId: session.id }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, orderNumber: true, createdAt: true, total: true, orderStatus: true, paymentStatus: true } }),
    prisma.customerAddress.count({ where: { customerId: session.id } }),
  ])

  return <div><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold text-[#062653]">Hello, {customer?.name || 'there'}</h1><p className="mt-2 text-sm text-slate-600">Your account, saved delivery details, and order history.</p></div><Link href="/account/orders" className="inline-flex items-center gap-2 rounded-xl bg-[#062653] px-4 py-2.5 text-sm font-semibold text-white">My orders <ArrowRight className="h-4 w-4" /></Link></div>
    {!customer?.emailVerifiedAt && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Email verification is not configured for this deployment. Keep access to your account email secure; account sign-in is currently enabled without email verification.</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Total orders', value: totalOrders, icon: ShoppingBag }, { label: 'Active orders', value: activeOrders, icon: Truck }, { label: 'Delivered', value: deliveredOrders, icon: PackageCheck }, { label: 'Saved addresses', value: addressCount, icon: UserRound }].map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-[#9b741d]" /><p className="mt-4 text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold text-[#062653]">{value}</p></article>)}</div>
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-[#062653]">Recent orders</h2><p className="mt-1 text-xs text-slate-500">Your latest purchases</p></div><Link href="/account/orders" className="text-sm font-semibold text-[#073B82]">View all</Link></div>{recentOrders.length ? <div className="divide-y divide-slate-100">{recentOrders.map((order) => <Link key={order.id} href={`/account/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"><div><p className="font-semibold text-[#062653]">{order.orderNumber}</p><p className="mt-1 text-xs text-slate-500">{order.createdAt.toLocaleDateString('en-IN')} · <span className="capitalize">{order.orderStatus}</span></p></div><div className="text-right"><p className="font-semibold text-[#062653]">{formatPrice(order.total)}</p><p className="text-xs capitalize text-slate-500">Payment {order.paymentStatus}</p></div></Link>)}</div> : <p className="px-5 py-12 text-center text-sm text-slate-500">No orders yet. <Link href="/products" className="font-semibold text-[#073B82]">Shop products</Link></p>}</section>
  </div>
}
