import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const latestCustomerOrders = await prisma.order.findMany({
    distinct: ['customerPhone'],
    take: 500,
    orderBy: { createdAt: 'desc' },
    select: {
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      city: true,
      state: true,
      createdAt: true,
    },
  })
  const aggregates = await prisma.order.groupBy({
    by: ['customerPhone'],
    where: { customerPhone: { in: latestCustomerOrders.map((order) => order.customerPhone) } },
    _count: { _all: true },
    _sum: { total: true },
  })
  const aggregateByPhone = new Map(aggregates.map((item) => [item.customerPhone, item]))
  const customerList = latestCustomerOrders.map((order) => {
    const aggregate = aggregateByPhone.get(order.customerPhone)
    return {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail,
      city: order.city,
      state: order.state,
      orders: aggregate?._count._all || 0,
      spend: aggregate?._sum.total || 0,
      lastOrder: order.createdAt,
    }
  })

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b741d]">Store relationships</p>
        <h1 className="mt-1 text-2xl font-bold text-[#062653] sm:text-3xl">Customers</h1>
        <p className="mt-2 text-sm text-slate-600">Customer summaries are derived from existing orders; no separate customer records are created.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Orders</th><th className="px-5 py-4">Order value</th><th className="px-5 py-4">Last order</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerList.map((customer) => (
                <tr key={customer.phone} className="text-slate-700">
                  <td className="px-5 py-4 font-semibold text-[#062653]">{customer.name}</td>
                  <td className="px-5 py-4"><div>{customer.phone}</div><div className="text-xs text-slate-500">{customer.email || 'No email'}</div></td>
                  <td className="px-5 py-4">{customer.city}, {customer.state}</td>
                  <td className="px-5 py-4">{customer.orders}</td>
                  <td className="px-5 py-4">{formatPrice(customer.spend)}</td>
                  <td className="px-5 py-4">{customer.lastOrder.toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {customerList.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No customers yet. Customers appear after orders are placed.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}