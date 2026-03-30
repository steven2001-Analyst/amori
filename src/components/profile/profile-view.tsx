'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Camera,
  X,
  Save,
  User,
  MapPin,
  Briefcase,
  Heart,
  Settings,
  Trash2,
  Crown,
} from 'lucide-react'

const ALL_INTERESTS = [
  'Music', 'Travel', 'Cooking', 'Photography', 'Reading', 'Fitness',
  'Movies', 'Gaming', 'Art', 'Nature', 'Dancing', 'Coffee',
  'Sports', 'Yoga', 'Writing', 'Fashion', 'Foodie', 'Tech',
  'Pets', 'Hiking', 'Wine', 'Camping', 'Cycling', 'Swimming',
  'Gardening', 'Theater', 'Volunteering', 'Meditation', 'Skiing', 'Surfing',
]

export default function ProfileView() {
  const userId = useAuthStore((s) => s.userId)
  const storeName = useAuthStore((s) => s.name)
  const storeAvatar = useAuthStore((s) => s.avatar)
  const updateProfile = useAuthStore((s) => s.updateProfile)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    bio: '',
    location: '',
    occupation: '',
    interests: [] as string[],
    lookingFor: '',
    maxDistance: '50',
    ageRangeMin: '18',
    ageRangeMax: '65',
  })

  const [photos, setPhotos] = useState<{ id: string; url: string; isProfile: boolean }[]>([])
  const [showInterestPicker, setShowInterestPicker] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        setForm({
          name: data.name || '',
          age: data.age?.toString() || '',
          gender: data.gender || '',
          bio: data.bio || '',
          location: data.location || '',
          occupation: data.occupation || '',
          interests: JSON.parse(data.interests || '[]'),
          lookingFor: data.lookingFor || '',
          maxDistance: data.maxDistance?.toString() || '50',
          ageRangeMin: data.ageRangeMin?.toString() || '18',
          ageRangeMax: data.ageRangeMax?.toString() || '65',
        })
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) fetchProfile()
  }, [userId, fetchProfile])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleInterest(interest: string) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 10
        ? [...prev.interests, interest]
        : prev.interests,
    }))
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          age: parseInt(form.age) || 0,
          gender: form.gender,
          bio: form.bio,
          location: form.location,
          occupation: form.occupation,
          interests: form.interests,
          lookingFor: form.lookingFor,
          maxDistance: form.maxDistance,
          ageRangeMin: form.ageRangeMin,
          ageRangeMax: form.ageRangeMax,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        updateProfile({ name: data.name, avatar: data.avatar })
        toast.success('Profile updated!')
        setEditing(false)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, isProfile: false }),
        })
        if (res.ok) {
          const data = await res.json()
          toast.success('Photo uploaded!')
          updateProfile({ avatar: data.url })
        }
      } catch {
        toast.error('Failed to upload')
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Profile</h1>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
            <Settings className="h-4 w-4" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setEditing(false); fetchProfile() }}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {/* Profile header */}
      <Card className="border-border/50 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCAyIDQgNC0yIDQtNCA0LTQtMi00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        </div>
        <div className="relative px-6 pb-6">
          <div className="-mt-16 mb-4 flex flex-col items-center">
            <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
              <AvatarImage src={storeAvatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-400 text-white text-3xl">
                {form.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-3 text-xl font-bold">{form.name}, {form.age || '?'}</h2>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              {form.location && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {form.location}</span>
              )}
              {form.occupation && (
                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {form.occupation}</span>
              )}
            </div>
            {form.lookingFor && (
              <Badge variant="secondary" className="mt-2 bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <Heart className="mr-1 h-3 w-3" /> {form.lookingFor}
              </Badge>
            )}
          </div>

          {form.bio && (
            <p className="text-center text-sm text-muted-foreground">{form.bio}</p>
          )}

          {form.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
              {form.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Edit form */}
      {editing && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photo upload */}
            <div>
              <Label>Photos</Label>
              <div className="mt-2 flex gap-3">
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                {storeAvatar && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl">
                    <img src={storeAvatar} alt="" className="h-full w-full object-cover" />
                    <Badge className="absolute bottom-1 left-1 bg-rose-500 text-white text-[10px] px-1.5">Profile</Badge>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Upload up to 6 photos. Max 5MB each.</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pf-name">Name</Label>
                <Input id="pf-name" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-age">Age</Label>
                <Input id="pf-age" type="number" min="18" max="100" value={form.age} onChange={(e) => updateField('age', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pf-gender">Gender</Label>
                <select id="pf-gender" value={form.gender} onChange={(e) => updateField('gender', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-looking">Looking for</Label>
                <select id="pf-looking" value={form.lookingFor} onChange={(e) => updateField('lookingFor', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select</option>
                  <option value="Long-term relationship">Long-term</option>
                  <option value="Casual dating">Casual</option>
                  <option value="Friendship">Friendship</option>
                  <option value="Not sure yet">Not sure</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pf-location">Location</Label>
                <Input id="pf-location" placeholder="City, State" value={form.location} onChange={(e) => updateField('location', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-occupation">Occupation</Label>
                <Input id="pf-occupation" placeholder="Your job" value={form.occupation} onChange={(e) => updateField('occupation', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf-bio">Bio</Label>
              <Textarea id="pf-bio" placeholder="Tell people about yourself..." rows={3} value={form.bio} onChange={(e) => updateField('bio', e.target.value)} maxLength={500} />
              <p className="text-right text-xs text-muted-foreground">{form.bio.length}/500</p>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Interests</Label>
                <Button variant="ghost" size="sm" onClick={() => setShowInterestPicker(!showInterestPicker)} className="text-xs">
                  {showInterestPicker ? 'Done' : 'Edit'}
                </Button>
              </div>
              {showInterestPicker ? (
                <div className="flex flex-wrap gap-1.5">
                  {ALL_INTERESTS.map((interest) => {
                    const selected = form.interests.includes(interest)
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                          selected
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                        )}
                      >
                        {interest}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {form.interests.length > 0 ? form.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                  )) : <span className="text-xs text-muted-foreground">No interests selected</span>}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{form.interests.length}/10 selected</p>
            </div>

            <Separator />

            {/* Discovery settings */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Discovery Settings</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pf-dist" className="text-xs">Max Distance</Label>
                  <Input id="pf-dist" type="number" min="1" max="200" value={form.maxDistance} onChange={(e) => updateField('maxDistance', e.target.value)} className="text-sm" />
                  <span className="text-xs text-muted-foreground">miles</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-agemin" className="text-xs">Age Min</Label>
                  <Input id="pf-agemin" type="number" min="18" max="100" value={form.ageRangeMin} onChange={(e) => updateField('ageRangeMin', e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-agemax" className="text-xs">Age Max</Label>
                  <Input id="pf-agemax" type="number" min="18" max="100" value={form.ageRangeMax} onChange={(e) => updateField('ageRangeMax', e.target.value)} className="text-sm" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!editing && (
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold gradient-text-rose">~{form.maxDistance}</div>
                <div className="text-xs text-muted-foreground">Max Distance</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text-rose">{form.ageRangeMin}-{form.ageRangeMax}</div>
                <div className="text-xs text-muted-foreground">Age Range</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text-rose">{form.interests.length}</div>
                <div className="text-xs text-muted-foreground">Interests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
