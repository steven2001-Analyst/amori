'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Save, X, MapPin, Briefcase, Camera, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store'

const ALL_INTERESTS = ['Travel', 'Music', 'Fitness', 'Cooking', 'Movies', 'Reading', 'Gaming', 'Photography', 'Art', 'Sports', 'Coffee', 'Nature', 'Dancing', 'Tech', 'Fashion', 'Yoga']

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', interests: [] as string[], location: '', occupation: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const updateProfile = useAuthStore(s => s.updateProfile)

  useEffect(() => {
    fetch('/api/auth/session').then(res => { if (res.status === 401) router.push('/login'); return res.json() }).then(data => {
      setProfile(data); setForm({ name: data.name || '', bio: data.bio || '', interests: data.interests || [], location: data.location || '', occupation: data.occupation || '' })
    }).catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { const data = await res.json(); setProfile(data); setEditing(false); toast.success('Profile updated!') }
      else { const err = await res.json(); toast.error(err.error) }
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('isProfile', 'true')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        updateProfile({ avatar: url })
        setProfile((p: any) => ({ ...p, avatar: url }))
        toast.success('Photo uploaded!')
      } else { const err = await res.json(); toast.error(err.error || 'Upload failed') }
    } catch { toast.error('Upload failed') } finally { setUploading(false); e.target.value = '' }
  }

  function toggleInterest(i: string) { setForm(f => ({ ...f, interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i] })) }

  if (!profile) return <div className="mx-auto max-w-2xl px-4 py-8"><h1 className="text-2xl font-bold mb-6">Profile</h1><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div></div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">Profile</h1>{!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-rose-600 hover:underline"><Edit2 className="h-4 w-4" />Edit</button>}</div>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="relative h-48 bg-gradient-to-br from-rose-500 to-pink-600">
          <div className="absolute -bottom-12 left-6 flex items-end gap-3">
            <div className="relative">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-rose-400 to-pink-400 text-3xl font-bold text-white shadow-lg">{profile.name ? profile.name[0].toUpperCase() : '?'}</div>
              )}
              {uploading && <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40"><div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" /></div>}
              {editing && <button onClick={() => fileRef.current?.click()} className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition"><Camera className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>

        <div className="pt-16 px-6 pb-6">
          <h2 className="text-2xl font-bold">{profile.name}, {profile.age || '?'}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
            {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>}
            {profile.occupation && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{profile.occupation}</span>}
          </div>

          {editing ? (
            <div className="mt-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="block text-sm font-medium mb-1">Bio</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} maxLength={300} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /><p className="text-xs text-muted-foreground mt-1">{form.bio.length}/300</p></div>
              <div><label className="block text-sm font-medium mb-1">Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. New York" /></div>
              <div><label className="block text-sm font-medium mb-1">Occupation</label><input value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Software Engineer" /></div>
              <div><label className="block text-sm font-medium mb-2">Interests ({form.interests.length} selected)</label><div className="flex flex-wrap gap-2">{ALL_INTERESTS.map(i => <button key={i} onClick={() => toggleInterest(i)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${form.interests.includes(i) ? 'bg-rose-500 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{i}</button>)}</div></div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-5 py-2.5 text-sm text-white hover:bg-rose-600 transition disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Changes'}</button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 rounded-lg border px-5 py-2.5 text-sm hover:bg-accent transition"><X className="h-4 w-4" />Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {profile.bio && <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>}
              {profile.interests && profile.interests.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{profile.interests.map((i: string) => <span key={i} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">{i}</span>)}</div>}
              {profile.isPremium && <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">⭐ Premium Member</div>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
