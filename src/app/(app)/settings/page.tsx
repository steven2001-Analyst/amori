'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [ageRangeMin, setAgeRangeMin] = useState(18)
  const [ageRangeMax, setAgeRangeMax] = useState(50)
  const [maxDistance, setMaxDistance] = useState(50)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    fetch('/api/auth/session').then(res => { if (res.status === 401) router.push('/login'); return res.json() }).then(data => {
      setProfile(data)
      setName(data.name || '')
      setBio(data.bio || '')
      setAgeRangeMin(data.ageRangeMin || 18)
      setAgeRangeMax(data.ageRangeMax || 50)
      setMaxDistance(data.maxDistance || 50)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, bio, ageRangeMin, ageRangeMax, maxDistance }) })
      if (res.ok) { toast.success('Settings saved!') } else toast.error('Failed to save')
    } catch { toast.error('Something went wrong') } finally { setSaving(false) }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
    router.push('/login')
  }

  if (loading) return <div className="flex min-h-[80vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Profile Settings</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Name</label><input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-1">Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          </div>
        </div>

        {/* Discovery Preferences */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Discovery Preferences</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Age Range: {ageRangeMin} - {ageRangeMax}</label>
              <div className="flex items-center gap-4">
                <input type="range" min={18} max={100} value={ageRangeMin} onChange={e => setAgeRangeMin(parseInt(e.target.value))} className="flex-1" />
                <input type="range" min={18} max={100} value={ageRangeMax} onChange={e => setAgeRangeMax(parseInt(e.target.value))} className="flex-1" />
              </div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Max Distance: {maxDistance} km</label><input type="range" min={5} max={200} value={maxDistance} onChange={e => setMaxDistance(parseInt(e.target.value))} className="w-full" /></div>
          </div>
        </div>

        {/* Privacy */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Privacy</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between"><span className="text-sm">Show online status</span><input type="checkbox" defaultChecked className="rounded" /></label>
            <label className="flex items-center justify-between"><span className="text-sm">Show profile to others</span><input type="checkbox" defaultChecked className="rounded" /></label>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 w-full rounded-lg bg-rose-500 py-2.5 text-sm text-white hover:bg-rose-600 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Settings'}</button>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
          <h2 className="font-semibold text-red-600 mb-4">Danger Zone</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Log Out</button>
            <button onClick={() => toast.info('Account deletion coming soon')} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"><Trash2 className="h-4 w-4" />Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  )
}
