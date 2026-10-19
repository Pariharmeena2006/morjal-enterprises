import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Package, DollarSign, Clock, Users, AlertTriangle, Video } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import AdminSignOut from '@/components/admin-signout'

async function getDashboardStats() {
  const [
    totalOrders,
    totalProducts,
    pendingOrders,
    paidOrders,
    codOrders,
    lowStockProducts,
    recentOrders
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.count({ where: { orderStatus: 'pending' } }),
    prisma.order.count({ where: { paymentStatus: 'paid' } }),
    prisma.order.count({ where: { paymentMethod: 'cod' } }),
    prisma.product.count({ where: { stockQuantity: { lte: 5 }, isOutOfStock: false } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    })
  ])

  const totalSales = await prisma.order.aggregate({
    where: { paymentStatus: 'paid' },
    _sum: { total: true }
  })

  return {
    totalOrders,
    totalProducts,
    totalSales: totalSales._sum.total || 0,
    pendingOrders,
    paidOrders,
    codOrders,
    lowStockProducts,
    recentOrders: JSON.parse(JSON.stringify(recentOrders))
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/admin/login')
  }

  const stats = await getDashboardStats()

  return (
    <div className="min-h-screen bg-grey-light">
      {/* Admin Header */}
      <div className="bg-navy text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-300">MORJAL Enterprises</p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-4">
              <span className="max-w-full break-all text-xs sm:text-sm">{session.user?.email}</span>
              <AdminSignOut />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-gray-600">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-gray-600">Active products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalSales.toLocaleString()}</div>
              <p className="text-xs text-gray-600">From paid orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-gray-600">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">COD Orders</CardTitle>
              <Users className="h-4 w-4 text-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.codOrders}</div>
              <p className="text-xs text-gray-600">Cash on delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
              <p className="text-xs text-gray-600">Products with low stock</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5 mb-8">
          <Link href="/admin/products">
            <Button className="w-full h-20 flex flex-col items-center justify-center">
              <Package className="h-6 w-6 mb-2" />
              <span>Products</span>
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button className="w-full h-20 flex flex-col items-center justify-center" variant="outline">
              <ShoppingBag className="h-6 w-6 mb-2" />
              <span>Orders</span>
            </Button>
          </Link>
          <Link href="/admin/banners">
            <Button className="w-full h-20 flex flex-col items-center justify-center" variant="outline">
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Banners</span>
            </Button>
          </Link>
          <Link href="/admin/videos">
            <Button className="w-full h-20 flex flex-col items-center justify-center" variant="outline">
              <Video className="h-6 w-6 mb-2" />
              <span>Videos</span>
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button className="w-full h-20 flex flex-col items-center justify-center" variant="outline">
              <Clock className="h-6 w-6 mb-2" />
              <span>Settings</span>
            </Button>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{order.orderStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
