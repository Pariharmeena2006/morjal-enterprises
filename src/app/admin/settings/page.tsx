'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Store, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type SettingsForm = {
  businessName: string
  contactPhone: string
  contactEmail: string
  contactAddress: string
  whatsappNumber: string
  freeShippingThreshold: string
  codEnabled: boolean
  announcementMessage: string
  ownerName: string
  socialFacebook: string
  socialInstagram: string
  socialTwitter: string
  socialLinkedIn: string
  ownerTitle: string
  ownerBio: string
  ownerStory: string
}

const emptyForm: SettingsForm = {
  businessName: 'MORJAL Enterprises', contactPhone: '9694142555', contactEmail: '', contactAddress: '',
  whatsappNumber: '8003351113', freeShippingThreshold: '1000', codEnabled: true, announcementMessage: '',
  ownerName: '', ownerTitle: '', ownerBio: '', ownerStory: '',
  socialFacebook: '', socialInstagram: '', socialTwitter: '', socialLinkedIn: '',
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load settings')
        setForm({
          businessName: data.businessName || 'MORJAL Enterprises',
          contactPhone: '9694142555', contactEmail: data.contactEmail || '',
          contactAddress: data.contactAddress || '', whatsappNumber: '8003351113',
          freeShippingThreshold: String(data.freeShippingThreshold ?? 1000),
          codEnabled: data.codEnabled ?? true, announcementMessage: data.announcementMessage || '',
          ownerName: data.ownerName || '', ownerTitle: data.ownerTitle || '',
          ownerBio: data.ownerBio || '', ownerStory: data.ownerStory || '',
          socialFacebook: data.socialFacebook || '', socialInstagram: data.socialInstagram || '',
          socialTwitter: data.socialTwitter || '', socialLinkedIn: data.socialLinkedIn || '',
        })
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const update = (field: keyof SettingsForm, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }))

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, freeShippingThreshold: Number(form.freeShippingThreshold) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to save settings')
      setNotice('Store settings saved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin"><Button variant="outline" size="icon" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div><p className="text-sm font-medium text-navy/60">Admin</p><h1 className="text-2xl font-bold text-navy">Store settings</h1></div>
        </div>
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-green-700">{notice}</div>}
        {loading ? <p className="py-12 text-center text-navy">Loading settings…</p> : (
          <form onSubmit={save} className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />Store & contact</CardTitle></CardHeader>
              <CardContent className="grid min-w-0 gap-4 sm:grid-cols-2">
                <div><Label htmlFor="businessName">Business name</Label><Input id="businessName" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} required /></div>
                <div><Label htmlFor="contactPhone">Phone number 1</Label><Input id="contactPhone" type="tel" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} /></div>
                <div><Label htmlFor="whatsappNumber">Phone number 2 / WhatsApp</Label><Input id="whatsappNumber" type="tel" value={form.whatsappNumber} onChange={(e) => update('whatsappNumber', e.target.value)} /></div>
                <div><Label htmlFor="contactEmail">Email</Label><Input id="contactEmail" type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} /></div>
                <div><Label htmlFor="whatsappNumber">WhatsApp number</Label><Input id="whatsappNumber" value={form.whatsappNumber} onChange={(e) => update('whatsappNumber', e.target.value)} /></div>
                <div className="md:col-span-2"><Label htmlFor="contactAddress">Business address</Label><Textarea id="contactAddress" value={form.contactAddress} onChange={(e) => update('contactAddress', e.target.value)} rows={2} /></div>
                <div><Label htmlFor="freeShippingThreshold">Free shipping threshold (₹)</Label><Input id="freeShippingThreshold" type="number" min="0" step="1" value={form.freeShippingThreshold} onChange={(e) => update('freeShippingThreshold', e.target.value)} required /></div>
                <div className="flex items-center gap-3 pt-6"><input id="codEnabled" type="checkbox" checked={form.codEnabled} onChange={(e) => update('codEnabled', e.target.checked)} className="h-4 w-4 accent-[#073B82]" /><Label htmlFor="codEnabled">Enable Cash on Delivery</Label></div>
                <div className="md:col-span-2"><Label htmlFor="announcementMessage">Announcement bar message</Label><Input id="announcementMessage" value={form.announcementMessage} onChange={(e) => update('announcementMessage', e.target.value)} placeholder="Optional message shown above the site header" /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" />Owner profile</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div><Label htmlFor="ownerName">Name</Label><Input id="ownerName" value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} /></div>
                <div><Label htmlFor="ownerTitle">Title</Label><Input id="ownerTitle" value={form.ownerTitle} onChange={(e) => update('ownerTitle', e.target.value)} /></div>
                <div className="md:col-span-2"><Label htmlFor="ownerBio">Short bio</Label><Textarea id="ownerBio" value={form.ownerBio} onChange={(e) => update('ownerBio', e.target.value)} rows={3} /></div>
                <div className="md:col-span-2"><Label htmlFor="ownerStory">Company story</Label><Textarea id="ownerStory" value={form.ownerStory} onChange={(e) => update('ownerStory', e.target.value)} rows={5} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Social profiles</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div><Label htmlFor="socialFacebook">Facebook URL</Label><Input id="socialFacebook" type="url" value={form.socialFacebook} onChange={(e) => update('socialFacebook', e.target.value)} /></div>
                <div><Label htmlFor="socialInstagram">Instagram URL</Label><Input id="socialInstagram" type="url" value={form.socialInstagram} onChange={(e) => update('socialInstagram', e.target.value)} /></div>
                <div><Label htmlFor="socialTwitter">X / Twitter URL</Label><Input id="socialTwitter" type="url" value={form.socialTwitter} onChange={(e) => update('socialTwitter', e.target.value)} /></div>
                <div><Label htmlFor="socialLinkedIn">LinkedIn URL</Label><Input id="socialLinkedIn" type="url" value={form.socialLinkedIn} onChange={(e) => update('socialLinkedIn', e.target.value)} /></div>
              </CardContent>
            </Card>
            <div className="flex justify-end"><Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save settings'}</Button></div>
          </form>
        )}
      </div>
    </div>
  )
}
