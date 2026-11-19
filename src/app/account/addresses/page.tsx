'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Address = { id: string; label: string; fullName: string; phone: string; address: string; city: string; state: string; pinCode: string; landmark: string | null; isDefault: boolean }
type AddressForm = { label: string; fullName: string; phone: string; address: string; city: string; state: string; pinCode: string; landmark: string; isDefault: boolean }
const empty: AddressForm = { label: 'Home', fullName: '', phone: '', address: '', city: '', state: '', pinCode: '', landmark: '', isDefault: false }

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState<AddressForm>(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/account/addresses', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to load addresses.')
      setAddresses(data)
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load addresses.') } finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  const edit = (address: Address) => {
    setEditing(address.id)
    setForm({ label: address.label, fullName: address.fullName, phone: address.phone, address: address.address, city: address.city, state: address.state, pinCode: address.pinCode, landmark: address.landmark || '', isDefault: address.isDefault })
    setError(''); setMessage('')
  }
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const response = await fetch(editing ? `/api/account/addresses/${editing}` : '/api/account/addresses', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save address.')
      setForm(empty); setEditing(null); setMessage('Address saved.'); await load()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save address.') } finally { setSaving(false) }
  }
  const remove = async (address: Address) => {
    if (!window.confirm(`Remove the ${address.label} address?`)) return
    setError(''); setMessage('')
    try {
      const response = await fetch(`/api/account/addresses/${address.id}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to remove address.')
      await load()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to remove address.') }
  }

  return <div><div className="mb-6 flex items-end justify-between gap-3"><div><h1 className="text-3xl font-bold text-[#062653]">Saved addresses</h1><p className="mt-2 text-sm text-slate-600">Manage delivery addresses for faster checkout.</p></div><Button type="button" variant="outline" onClick={() => { setEditing(null); setForm(empty) }}>Add address</Button></div>{error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">{!loading && <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-[#062653]">{editing ? 'Edit address' : 'Add address'}</h2><div><Label htmlFor="addressLabel">Label</Label><Input id="addressLabel" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required className="mt-1" /></div><div><Label htmlFor="addressName">Full name</Label><Input id="addressName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required className="mt-1" /></div><div><Label htmlFor="addressPhone">Mobile</Label><Input id="addressPhone" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} required className="mt-1" /></div><div><Label htmlFor="addressLine">Address</Label><Input id="addressLine" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required className="mt-1" /></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="addressCity">City</Label><Input id="addressCity" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="mt-1" /></div><div><Label htmlFor="addressState">State</Label><Input id="addressState" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required className="mt-1" /></div></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="addressPin">PIN code</Label><Input id="addressPin" inputMode="numeric" maxLength={6} value={form.pinCode} onChange={(e) => setForm({ ...form, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })} required className="mt-1" /></div><div><Label htmlFor="addressLandmark">Landmark</Label><Input id="addressLandmark" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="mt-1" /></div></div><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />Make this my default address</label><div className="flex gap-2"><Button disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add address'}</Button>{editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm(empty) }}>Cancel</Button>}</div></form>}
      <div className="space-y-3">{loading ? <p className="text-sm text-slate-500">Loading addresses…</p> : addresses.map((address) => <article key={address.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="font-bold text-[#062653]">{address.label}</h2>{address.isDefault && <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700">Default</span>}</div><p className="mt-2 text-sm font-medium text-slate-700">{address.fullName} · {address.phone}</p><p className="mt-1 text-sm text-slate-600">{address.address}{address.landmark ? `, ${address.landmark}` : ''}<br />{address.city}, {address.state} {address.pinCode}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => edit(address)}>Edit</Button><Button size="sm" variant="outline" onClick={() => void remove(address)} className="text-red-600">Remove</Button></div></div></article>)}{!loading && addresses.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">No saved addresses yet. Add one to speed up checkout.</div>}</div>
    </div>
  </div>
}
