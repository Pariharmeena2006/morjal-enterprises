import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

async function getProducts() {
  const products = await prisma.product.findMany({
    include: { images: true },
    orderBy: { createdAt: 'desc' }
  })
  return JSON.parse(JSON.stringify(products))
}

async function deleteProduct(id: string) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')
  await prisma.product.delete({
    where: { id }
  })
}

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/admin/login')
  }

  const products = await getProducts()

  return (
    <div className="min-h-screen bg-grey-light">
      {/* Admin Header */}
      <div className="bg-navy text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Product Management</h1>
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
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-navy sm:text-2xl">All Products ({products.length})</h2>
          <Link href="/admin/products/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                        Product
                      </th>
                      <th className="hidden px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell sm:px-6">
                        Category
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                        Price
                      </th>
                      <th className="hidden px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:table-cell sm:px-6">
                        Stock
                      </th>
                      <th className="hidden px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell sm:px-6">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product: any) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 sm:px-6">
                          <div className="flex items-center">
                            {product.images[0] && (
                              <div className="relative h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12">
                                <img
                                  className="h-10 w-10 rounded object-cover sm:h-12 sm:w-12"
                                  src={product.images[0].url}
                                  alt=""
                                />
                              </div>
                            )}
                            <div className="ml-2 min-w-0 sm:ml-4">
                              <div className="max-w-36 truncate text-xs font-medium text-navy sm:max-w-none sm:text-sm">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.sku || 'No SKU'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-3 py-4 whitespace-nowrap text-sm text-gray-900 sm:table-cell sm:px-6">
                          {product.category}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-900 sm:px-6 sm:text-sm">
                          ₹{product.sellingPrice.toLocaleString()}
                        </td>
                        <td className="hidden px-3 py-4 whitespace-nowrap text-sm text-gray-900 md:table-cell sm:px-6">
                          {product.stockQuantity}
                        </td>
                        <td className="hidden px-3 py-4 whitespace-nowrap sm:table-cell sm:px-6">
                          {product.isPublished ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Draft
                            </span>
                          )}
                          {product.isOutOfStock && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium sm:px-6">
                          <div className="flex space-x-2">
                            <Link href={`/products/${product.slug}`} target="_blank">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <form action={async () => {
                              'use server'
                              await deleteProduct(product.id)
                              redirect('/admin/products')
                            }}>
                              <Button variant="ghost" size="icon" className="text-red-600" type="submit">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No products found</p>
                <Link href="/admin/products/new">
                  <Button>Add Your First Product</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
