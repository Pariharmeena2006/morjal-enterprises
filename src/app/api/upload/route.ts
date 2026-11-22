import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getAdminSession } from '@/lib/admin-auth'

export const runtime = 'nodejs'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxSize = 4 * 1024 * 1024

function matchesImageSignature(type: string, bytes: Uint8Array) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (type === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  if (type === 'image/webp') {
    return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
      && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  }
  return false
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed.' }, { status: 400 })
    }
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 4MB limit' }, { status: 400 })
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Persistent image storage is not configured.' }, { status: 503 })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    if (!matchesImageSignature(file.type, bytes)) {
      return NextResponse.json({ error: 'The file contents do not match a supported image format.' }, { status: 400 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100) || 'image'
    const blob = await put(`morjal/${crypto.randomUUID()}-${safeName}`, new Blob([bytes], { type: file.type }), {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Persistent image upload failed')
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
