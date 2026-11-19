'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Maximize2, Star, Trash2, Upload, X } from 'lucide-react'

type ProductImage = { url: string; alt: string; id?: string }

interface ProductImageManagerProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  onUploadingChange?: (uploading: boolean) => void
  maxImages?: number
}

export default function ProductImageManager({ images, onChange, onUploadingChange, maxImages = 5 }: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const optimizeImage = async (file: File): Promise<Blob> => {
    if (typeof createImageBitmap === 'undefined') return file
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob || file), 'image/webp', 0.84))
  }

  const upload = (file: Blob, fileName: string, onProgress: (value: number) => void) => new Promise<{ url?: string; error?: string }>((resolve, reject) => {
    const body = new FormData()
    body.append('file', file, fileName)
    const request = new XMLHttpRequest()
    request.open('POST', '/api/upload')
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () => {
      const result = JSON.parse(request.responseText || '{}')
      if (request.status >= 200 && request.status < 300) resolve(result)
      else resolve({ error: result.error || 'Upload failed' })
    }
    request.onerror = () => reject(new Error('Could not upload this photo.'))
    request.send(body)
  })

  const uploadFiles = async (files: FileList | File[]) => {
    const remaining = maxImages - images.length
    if (remaining <= 0) {
      setError(`You can add up to ${maxImages} photos per product.`)
      return
    }

    const selected = Array.from(files)
    if (!selected.length) return
    if (selected.length > remaining) {
      setError(`Only ${remaining} more photo${remaining === 1 ? '' : 's'} can be added. The first ${remaining} selected will be uploaded.`)
    } else {
      setError('')
    }

    const accepted = selected.slice(0, remaining)
    setUploading(true)
    setProgress(0)
    onUploadingChange?.(true)
    const uploaded: ProductImage[] = []
    const failures: string[] = []

    for (let index = 0; index < accepted.length; index += 1) {
      const file = accepted[index]
      try {
        const optimized = await optimizeImage(file)
        const result = await upload(optimized, optimized.type === 'image/webp' ? `${file.name.replace(/\.[^.]+$/, '')}.webp` : file.name, (value) => {
          setProgress(Math.round(((index + value / 100) / accepted.length) * 100))
        })
        if (!result.url) {
          failures.push(`${file.name}: ${result.error || 'Upload failed'}`)
          continue
        }
        uploaded.push({ url: result.url, alt: file.name })
      } catch {
        failures.push(`${file.name}: Could not upload this photo.`)
      }
    }

    if (uploaded.length) onChange([...images, ...uploaded])
    setError(failures.length ? failures.join(' ') : '')
    setUploading(false)
    onUploadingChange?.(false)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const updateAlt = (index: number, alt: string) => {
    onChange(images.map((image, imageIndex) => imageIndex === index ? { ...image, alt } : image))
  }

  const setCover = (index: number) => {
    onChange([images[index], ...images.filter((_, imageIndex) => imageIndex !== index)])
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, imageIndex) => imageIndex !== index))
    setError('')
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => event.target.files && void uploadFiles(event.target.files)}
        className="hidden"
        disabled={uploading || images.length >= maxImages}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          void uploadFiles(event.dataTransfer.files)
        }}
        disabled={uploading || images.length >= maxImages}
        className="flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-[#f7f9fc] p-6 text-center transition hover:border-navy hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? <LoaderCircle className="mb-3 h-9 w-9 animate-spin text-navy" /> : <Upload className="mb-3 h-9 w-9 text-navy" />}
        <span className="text-sm font-semibold text-navy">{uploading ? 'Uploading photos…' : images.length >= maxImages ? 'Photo limit reached' : 'Choose or drag product photos here'}</span>
        <span className="mt-1 text-xs text-gray-500">JPG, PNG or WebP · up to 4 MB each · resized/compressed for upload · {images.length}/{maxImages} photos</span>
        {uploading && <span className="mt-3 h-2 w-full max-w-sm overflow-hidden rounded-full bg-blue-100"><span className="block h-full rounded-full bg-[#073B82] transition-all" style={{ width: `${progress}%` }} /></span>}
        {uploading && <span className="text-xs font-semibold text-navy">{progress}%</span>}
      </button>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((image, index) => (
            <div key={image.id || `${image.url}-${index}`} className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="group relative aspect-square bg-gray-100">
                <Image src={image.url} alt={image.alt || 'Product photo'} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" />
                {index === 0 && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-1 text-[10px] font-bold text-navy"><Star className="h-3 w-3 fill-current" /> Main photo</span>}
                <button type="button" onClick={() => setPreviewUrl(image.url)} aria-label="Preview image" className="absolute bottom-2 right-2 rounded-full bg-black/70 p-2 text-white opacity-100 transition hover:bg-black sm:opacity-0 sm:group-hover:opacity-100"><Maximize2 className="h-4 w-4" /></button>
              </div>
              <div className="space-y-2 p-2.5">
                <input value={image.alt} onChange={(event) => updateAlt(index, event.target.value)} aria-label={`Photo ${index + 1} description`} placeholder="Photo description" className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-navy" />
                <div className="flex items-center justify-between gap-1">
                  <div className="flex min-w-0 items-center gap-2">
                    {index > 0 && <button type="button" onClick={() => setCover(index)} className="inline-flex items-center gap-1 text-[10px] font-semibold text-navy hover:text-[#A87913]"><ImagePlus className="h-3 w-3" /> Main</button>}
                    <button type="button" disabled={index === 0} onClick={() => onChange(images.map((item, itemIndex) => itemIndex === index - 1 ? images[index] : itemIndex === index ? images[index - 1] : item))} aria-label="Move image up" className="rounded p-1 text-navy hover:bg-blue-50 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button type="button" disabled={index === images.length - 1} onClick={() => onChange(images.map((item, itemIndex) => itemIndex === index + 1 ? images[index] : itemIndex === index ? images[index + 1] : item))} aria-label="Move image down" className="rounded p-1 text-navy hover:bg-blue-50 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                  </div>
                  <button type="button" onClick={() => removeImage(index)} aria-label={`Remove photo ${index + 1}`} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewUrl && <div role="dialog" aria-modal="true" aria-label="Image preview" onClick={() => setPreviewUrl(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"><button type="button" onClick={() => setPreviewUrl(null)} aria-label="Close image preview" className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><X className="h-6 w-6" /></button><div className="relative h-[90vh] w-full max-w-6xl"><Image src={previewUrl} alt="Product image full preview" fill sizes="100vw" className="object-contain" /></div></div>}
    </div>
  )
}
