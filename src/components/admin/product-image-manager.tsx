'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, LoaderCircle, Star, Trash2, Upload } from 'lucide-react'

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
    onUploadingChange?.(true)
    const uploaded: ProductImage[] = []
    const failures: string[] = []

    for (const file of accepted) {
      const body = new FormData()
      body.append('file', file)
      try {
        const response = await fetch('/api/upload', { method: 'POST', body })
        const result = await response.json()
        if (!response.ok || !result.url) {
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
        <span className="mt-1 text-xs text-gray-500">JPG, PNG or WebP · up to 5 MB each · {images.length}/{maxImages} photos</span>
      </button>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((image, index) => (
            <div key={image.id || `${image.url}-${index}`} className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="relative aspect-square bg-gray-100">
                <Image src={image.url} alt={image.alt || 'Product photo'} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" />
                {index === 0 && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-1 text-[10px] font-bold text-navy"><Star className="h-3 w-3 fill-current" /> Main photo</span>}
              </div>
              <div className="space-y-2 p-2.5">
                <input value={image.alt} onChange={(event) => updateAlt(index, event.target.value)} aria-label={`Photo ${index + 1} description`} placeholder="Photo description" className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-navy" />
                <div className="flex items-center justify-between gap-1">
                  {index > 0 ? <button type="button" onClick={() => setCover(index)} className="inline-flex items-center gap-1 text-[10px] font-semibold text-navy hover:text-[#A87913]"><ImagePlus className="h-3 w-3" /> Make main</button> : <span className="text-[10px] text-gray-400">Shown first</span>}
                  <button type="button" onClick={() => removeImage(index)} aria-label={`Remove photo ${index + 1}`} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
