import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit, Trash2, Play } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function getVideos() {
  const videos = await prisma.video.findMany({
    orderBy: { order: 'asc' }
  })
  return JSON.parse(JSON.stringify(videos))
}

async function deleteVideo(id: string) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')
  await prisma.video.delete({
    where: { id }
  })
}

async function setVideoEnabled(id: string, isEnabled: boolean) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')
  await prisma.video.update({ where: { id }, data: { isEnabled } })
  revalidatePath('/admin/videos')
  revalidatePath('/')
}

export default async function AdminVideosPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/admin/login')
  }

  const videos = await getVideos()

  return (
    <div className="min-h-screen bg-grey-light">
      <div className="bg-navy text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Video Management</h1>
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
          <h2 className="text-xl font-bold text-navy sm:text-2xl">Homepage Videos ({videos.length})</h2>
          <Link href="/admin/videos/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Video
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: any) => (
            <Card key={video.id}>
              <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Play className="h-12 w-12" />
                  </div>
                )}
                {!video.isEnabled && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">Disabled</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-navy mb-2">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-gray-500">Order: {video.order}</span>
                  <div className="flex space-x-2">
                    <form action={async () => {
                      'use server'
                      await setVideoEnabled(video.id, !video.isEnabled)
                    }}>
                      <Button variant="outline" size="sm" type="submit">
                        {video.isEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </form>
                    <Link href={`/admin/videos/${video.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <form action={async () => {
                      'use server'
                      await deleteVideo(video.id)
                      redirect('/admin/videos')
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

        {videos.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No videos found</p>
              <Link href="/admin/videos/new">
                <Button>Add Your First Video</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
