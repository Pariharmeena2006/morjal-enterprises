'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit, Eye, EyeOff, Star, Trash2 } from 'lucide-react'

export default function ProductActions({ id, slug, isPublished, featured }: { id: string; slug: string; isPublished: boolean; featured: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const update = async (field: 'isPublished' | 'featured', value: boolean) => {
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (!response.ok) throw new Error('Unable to update product status.')
      router.refresh()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to update product status.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Delete this product? If it has order history, it will be unpublished and archived instead.')) return
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Unable to delete product.')
      const result = await response.json()
      window.alert(result.archived ? 'Product had order history, so it was safely unpublished instead.' : 'Product deleted.')
      router.refresh()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to delete product.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button type="button" title={isPublished ? 'Unpublish' : 'Publish'} disabled={busy} onClick={() => update('isPublished', !isPublished)} className="rounded-lg p-2 text-[#073B82] hover:bg-blue-50 disabled:opacity-50">{isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
      <button type="button" title={featured ? 'Remove featured status' : 'Feature product'} disabled={busy} onClick={() => update('featured', !featured)} className={`rounded-lg p-2 hover:bg-amber-50 disabled:opacity-50 ${featured ? 'text-amber-600' : 'text-slate-400'}`}><Star className={`h-4 w-4 ${featured ? 'fill-current' : ''}`} /></button>
      <Link href={`/admin/products/${id}/edit`} title="Edit product" className="rounded-lg p-2 text-[#073B82] hover:bg-blue-50"><Edit className="h-4 w-4" /></Link>
      <Link href={`/products/${slug}`} target="_blank" title="View product" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Eye className="h-4 w-4" /></Link>
      <Button type="button" title="Delete product" variant="ghost" size="icon" disabled={busy} onClick={remove} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
    </div>
  )
}