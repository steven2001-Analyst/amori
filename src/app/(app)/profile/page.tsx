'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Save, X, MapPin, Briefcase, Camera } from 'lucide-react'
import { toast } from 'sonner'

const ALL_INTERESTS = ['Travel', 'Music', 'Fitness', 'Cooking', 'Movies', 'Reading', 'Gaming', 'Photography', 'Art', 'Sports', 'Coffee', 'Nature', 'Dancing', 'Tech', 'Fashion', 'Yoga']

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', interests: [] as string[], location: '', occupation: '' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/session').then(res => { if (res.status === 401) router.push('/login'); return res.json() }).then(data => { setProfile(data); setForm({ name: data.name || '', bio: data.bio || '', interests: data.interests || [], location: data.location || '', occupation: data.occupation || '' }) }).catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { const data = await res.json(); setProfile(data); setEditing(false); toast.success('Profile updated!') }
      else { const err = await res.json(); toast.error(err.error) }
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  function toggleInterest(i: string) {
    setForm(f => ({ ...f, interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i] }))
  }

  if (!profile) return <div className="flex min-h-[80vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        {!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-rose-600 hover:underline"><Edit2 className="h-4 w-4" />Edit</button>}
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-br from-rose-500 to-pink-500">
          <div className="absolute -bottom-12 left-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-rose-400 to-pink-400 text-3xl font-bold text-white">{profile.name ? profile.name[0].toUpperCase() : '?'}</div>
          </div>
        </div>
        <div className="pt-16 px-6 pb-6">
          <h2 className="text-2xl font-bold">{profile.name}, {profile.age || '?'}</h2>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>}
            {profile.occupation && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{profile.occupation}</span>}
          </div>

          {editing ? (
            <div className="mt-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="block text-sm font-medium mb-1">Bio</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="block text-sm font-medium mb-1">Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="block text-sm font-medium mb-1">Occupation</label><input value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="block text-sm font-medium mb-2">Interests</label><div className="flex flex-wrap gap-2">{ALL_INTERESTS.map(i => <button key={i} onClick={() => toggleInterest(i)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${form.interests.includes(i) ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{i}</button>)}</div></div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-600 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm hover:bg-accent"><X className="h-4 w-4" />Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {profile.bio && <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>}
              {profile.interests && profile.interests.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{profile.interests.map((i: string) => <span key={i} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">{i}</span>)}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
