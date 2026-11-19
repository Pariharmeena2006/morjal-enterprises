import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Package } from 'lucide-react'
import ProductActions from '@/components/admin/product-actions'

export const dynamic = 'force-dynamic'

type ProductsPageProps = { searchParams?: { q?: string; status?: string } }

export default async function AdminProductsPage({ searchParams = {} }: ProductsPageProps) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const query = searchParams.q?.trim() || ''
  const status = searchParams.status || 'all'
  const where = {
    AND: [
    ...(query ? [{ OR: [
      { name: { contains: query, mode: 'insensitive' as const } },
      { slug: { contains: query, mode: 'insensitive' as const } },
      { sku: { contains: query, mode: 'insensitive' as const } },
    ] }] : []),
    ...(status === 'published' ? [{ isPublished: true }] : []),
    ...(status === 'unpublished' ? [{ isPublished: false }] : []),
    ...(status === 'out-of-stock' ? [{ OR: [{ isOutOfStock: true }, { stockQuantity: { lte: 0 } }] }] : []),
    ],
  }
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({ where, include: { images: { orderBy: { order: 'asc' }, take: 1 } }, orderBy: { updatedAt: 'desc' } }),
    prisma.product.count(),
  ])

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b741d]">Catalog</p><h1 className="mt-1 text-2xl font-bold text-[#062653] sm:text-3xl">Products</h1><p className="mt-2 text-sm text-slate-600">{products.length} shown · {totalCount} total products</p></div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-xl bg-[#062653] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b3c7c]"><Plus className="h-4 w-4" /> Add product</Link>
      </div>

      <form className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_auto]">
        <label className="relative"><span className="sr-only">Search products</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input name="q" defaultValue={query} placeholder="Search name, slug, or SKU" className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[#073B82]" /></label>
        <label><span className="sr-only">Filter product status</span><select name="status" defaultValue={status} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="all">All statuses</option><option value="published">Published</option><option value="unpublished">Unpublished</option><option value="out-of-stock">Out of stock</option></select></label>
        <button className="h-10 rounded-lg bg-[#073B82] px-5 text-sm font-semibold text-white hover:bg-[#062653]">Filter</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-4">Product</th><th className="px-4 py-4">SKU</th><th className="px-4 py-4">Price</th><th className="px-4 py-4">Stock</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="text-slate-700 hover:bg-slate-50/70">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">{product.images[0]?.url ? <Image src={product.images[0].url} alt={product.images[0].alt || product.name} fill sizes="48px" className="object-contain object-center p-1" /> : <Package className="m-auto h-5 w-5 text-slate-400" />}</div><div className="min-w-0"><p className="max-w-xs truncate font-semibold text-[#062653]">{product.name}</p><p className="mt-1 text-xs text-slate-500">{product.category}{product.featured ? ' · Featured' : ''}</p></div></div></td>
                  <td className="px-4 py-3">{product.sku || '—'}</td>
                  <td className="px-4 py-3"><div className="font-semibold text-[#062653]">₹{product.sellingPrice.toLocaleString('en-IN')}</div>{product.mrp && product.mrp > product.sellingPrice && <div className="text-xs text-slate-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</div>}</td>
                  <td className="px-4 py-3"><span className={product.stockQuantity <= 5 ? 'font-semibold text-amber-700' : 'text-slate-700'}>{product.stockQuantity}</span>{product.stockQuantity <= 0 && <span className="ml-2 text-xs text-red-600">Out</span>}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.isPublished ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{product.isPublished ? 'Published' : 'Unpublished'}</span></td>
                  <td className="px-4 py-3"><ProductActions id={product.id} slug={product.slug} isPublished={product.isPublished} featured={product.featured} /></td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center text-slate-500">No products match this filter. Add a product or clear the search.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
