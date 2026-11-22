import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCustomerSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import LinkGuestOrderForm from '@/components/account/link-guest-order-form'

export const dynamic = 'force-dynamic'
const filters = [
  { key: 'all', label: 'All orders' },
  { key: 'active', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

type OrdersPageProps = { searchParams?: { status?: string } }

export default async function CustomerOrdersPage({ searchParams = {} }: OrdersPageProps) {
  const session = await getCustomerSession()
  if (!session) redirect('/login')
  const status = filters.some((filter) => filter.key === searchParams.status) ? searchParams.status! : 'all'
  const active = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery']
  const where = status === 'active' ? { customerId: session.id, orderStatus: { in: active } }
    : status === 'delivered' ? { customerId: session.id, orderStatus: 'delivered' }
      : status === 'cancelled' ? { customerId: session.id, orderStatus: { in: ['cancelled', 'returned'] } }
        : { customerId: session.id }
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: { select: { images: { orderBy: { order: 'asc' }, take: 1 } } } } } },
  })

  return <div><div className="mb-6"><h1 className="text-3xl font-bold text-[#062653]">My orders</h1><p className="mt-2 text-sm text-slate-600">Your account-linked purchases are saved in PostgreSQL and available whenever you sign in.</p></div><LinkGuestOrderForm /><nav aria-label="Filter orders" className="my-5 flex flex-wrap gap-2">{filters.map((filter) => <Link key={filter.key} href={filter.key === 'all' ? '/account/orders' : `/account/orders?status=${filter.key}`} className={`rounded-full border px-4 py-2 text-sm font-semibold ${status === filter.key ? 'border-[#073B82] bg-[#073B82] text-white' : 'border-slate-200 bg-white text-[#073B82]'}`}>{filter.label}</Link>)}</nav>
    <div className="space-y-4">{orders.map((order) => <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><p className="font-bold text-[#062653]">{order.orderNumber}</p><p className="mt-1 text-xs text-slate-500">{order.createdAt.toLocaleDateString('en-IN')} · {order.paymentMethod} · payment {order.paymentStatus}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold capitalize text-[#073B82]">{order.orderStatus}</span></div><div className="divide-y divide-slate-100">{order.items.map((item) => <div key={item.id} className="flex items-center gap-3 px-5 py-3"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">{item.product.images[0]?.url && <Image src={item.product.images[0].url} alt={item.product.images[0].alt || item.productName} fill sizes="56px" className="object-contain p-1" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#062653]">{item.productName}</p><p className="text-xs text-slate-500">Qty {item.quantity} × {formatPrice(item.unitPrice)}</p></div><p className="text-sm font-semibold text-[#062653]">{formatPrice(item.totalPrice)}</p></div>)}</div><div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-5 py-4"><p className="font-bold text-[#062653]">Total {formatPrice(order.total)}</p><div className="flex gap-2"><Link href={`/account/orders/${order.id}`} className="rounded-lg border border-[#073B82] px-3 py-2 text-sm font-semibold text-[#073B82]">View order</Link><Link href={`/account/orders/${order.id}`} className="rounded-lg bg-[#073B82] px-3 py-2 text-sm font-semibold text-white">Track order</Link></div></div></article>)}{orders.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">No orders in this filter. <Link href="/products" className="font-semibold text-[#073B82]">Browse the shop</Link>.</div>}</div>
  </div>
}
