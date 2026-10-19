import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function getBanners() {
  const banners = await prisma.banner.findMany({
    orderBy: { order: 'asc' }
  })
  return JSON.parse(JSON.stringify(banners))
}

async function deleteBanner(id: string) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')
  await prisma.banner.delete({
    where: { id }
  })
}

async function setBannerEnabled(id: string, isEnabled: boolean) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')
  await prisma.banner.update({ where: { id }, data: { isEnabled } })
  revalidatePath('/admin/banners')
  revalidatePath('/')
}

export default async function AdminBannersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/admin/login')
  }

  const banners = await getBanners()

  return (
    <div className="min-h-screen bg-grey-light">
      <div className="bg-navy text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Banner Management</h1>
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
          <h2 className="text-xl font-bold text-navy sm:text-2xl">Homepage Banners ({banners.length})</h2>
          <Link href="/admin/banners/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Banner
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner: any) => (
            <Card key={banner.id}>
              <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                {banner.desktopImageUrl ? (
                  <img
                    src={banner.desktopImageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                {!banner.isEnabled && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">Disabled</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-navy mb-2">{banner.title}</h3>
                {banner.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{banner.description}</p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-gray-500">Order: {banner.order}</span>
                  <div className="flex space-x-2">
                    <form action={async () => {
                      'use server'
                      await setBannerEnabled(banner.id, !banner.isEnabled)
                    }}>
                      <Button variant="outline" size="sm" type="submit">
                        {banner.isEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </form>
                    <Link href={`/admin/banners/${banner.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <form action={async () => {
                      'use server'
                      await deleteBanner(banner.id)
                      redirect('/admin/banners')
                    }}>
                      <Button variant="ghost" size="icon" className="text-red-600" type="submit">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {banners.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No banners found</p>
              <Link href="/admin/banners/new">
                <Button>Add Your First Banner</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
