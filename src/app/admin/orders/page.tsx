import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye, Package } from 'lucide-react'

async function getOrders() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  })
  return JSON.parse(JSON.stringify(orders))
}

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/admin/login')
  }

  const orders = await getOrders()

  return (
    <div className="min-h-screen bg-grey-light">
      <div className="bg-navy text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Order Management</h1>
              <p className="text-gray-300">MORJAL Enterprises</p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-navy">
                  Dashboard
                </Button>
              </Link>
              <span className="max-w-full break-all text-xs sm:text-sm">{session.user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="mb-4 text-xl font-bold text-navy sm:mb-6 sm:text-2xl">All Orders ({orders.length})</h2>

        <Card>
          <CardContent className="p-0">
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                        Order Number
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                        Customer
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                        Total
                      </th>
                      <th className="hidden px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:table-cell sm:px-6">
                        Payment
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                        Status
                      </th>
                      <th className="hidden px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:table-cell sm:px-6">
                        Date
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-nowrap text-xs font-medium text-navy sm:px-6 sm:text-sm">
                          {order.orderNumber}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-900 sm:px-6 sm:text-sm">
                          <div>{order.customerName}</div>
                          <div className="text-xs text-gray-500">{order.customerPhone}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-900 sm:px-6 sm:text-sm">
                          ₹{order.total.toLocaleString()}
                        </td>
                        <td className="hidden px-3 py-4 whitespace-nowrap text-xs text-gray-900 md:table-cell sm:px-6 sm:text-sm">
                          <div>{order.paymentMethod}</div>
                          <div className="text-xs text-gray-500">{order.paymentStatus}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="hidden px-3 py-4 whitespace-nowrap text-xs text-gray-500 lg:table-cell sm:px-6 sm:text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium sm:px-6">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
