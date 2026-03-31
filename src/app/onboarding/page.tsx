'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { Camera, X, ArrowRight, ArrowLeft, Heart, Sparkles } from 'lucide-react'

const INTERESTS = [
  'Music', 'Travel', 'Cooking', 'Photography', 'Reading', 'Fitness',
  'Movies', 'Gaming', 'Art', 'Nature', 'Dancing', 'Coffee',
  'Sports', 'Yoga', 'Writing', 'Fashion', 'Foodie', 'Tech',
  'Pets', 'Hiking', 'Wine', 'Camping', 'Cycling', 'Swimming',
  'Gardening', 'Theater', 'Volunteering', 'Meditation', 'Skiing', 'Surfing',
]

const STEPS = ['About You', 'Your Interests', 'Looking For']

export default function OnboardingPage() {
  const router = useRouter()
  const userId = useAuthStore((s) => s.userId)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    bio: '',
    location: '',
    occupation: '',
    interests: [] as string[],
    lookingFor: '',
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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
      setAvatarPreview(base64)

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, isProfile: true }),
        })
        if (res.ok) {
          const data = await res.json()
          updateProfile({ avatar: data.url })
          toast.success('Photo uploaded!')
        }
      } catch {
        toast.error('Failed to upload photo')
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleComplete() {
    if (loading) return
    setLoading(true)

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
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.name) updateProfile({ name: data.name })
        if (data.avatar) updateProfile({ avatar: data.avatar })
        toast.success('Profile complete! Let\'s find your match!')
        router.push('/discover')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save profile')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function canProceed() {
    if (step === 0) return form.age && form.gender
    if (step === 1) return form.interests.length >= 3
    return true
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-lg flex-col items-center justify-center px-4 py-8">
      {/* Progress */}
      <div className="mb-8 flex w-full max-w-sm items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
              i <= step
                ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white'
                : 'bg-muted text-muted-foreground'
            )}>
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'h-0.5 flex-1 rounded-full transition-colors',
                i < step ? 'bg-rose-500' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>

      <Card className="w-full border-border/50">
        <CardContent className="p-6">
          {/* Step 0: About You */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold">Tell us about yourself</h2>
                <p className="mt-1 text-sm text-muted-foreground">This helps us find better matches for you</p>
              </div>

              {/* Avatar */}
              <div className="flex justify-center">
                <label className="relative cursor-pointer">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950 dark:to-pink-950">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-rose-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg">
                    <Camera className="h-4 w-4" />
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-name">Full Name</Label>
                <Input id="onb-name" placeholder="Your name" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="onb-age">Age</Label>
                  <Input id="onb-age" type="number" min="18" max="100" placeholder="25" value={form.age} onChange={(e) => updateField('age', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onb-gender">Gender</Label>
                  <select
                    id="onb-gender"
                    value={form.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-location">Location</Label>
                <Input id="onb-location" placeholder="New York, NY" value={form.location} onChange={(e) => updateField('location', e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-occupation">Occupation</Label>
                <Input id="onb-occupation" placeholder="Software Engineer" value={form.occupation} onChange={(e) => updateField('occupation', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 1: Interests */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold">Pick your interests</h2>
                <p className="mt-1 text-sm text-muted-foreground">Choose at least 3 (max 10)</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {INTERESTS.map((interest) => {
                  const selected = form.interests.includes(interest)
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-medium transition-all',
                        selected
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {interest}
                    </button>
                  )
                })}
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {form.interests.length}/10 selected
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Looking For */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold">What are you looking for?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Help others understand what you seek</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-looking">Looking for</Label>
                <select
                  id="onb-looking"
                  value={form.lookingFor}
                  onChange={(e) => updateField('lookingFor', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select</option>
                  <option value="Long-term relationship">Long-term relationship</option>
                  <option value="Casual dating">Casual dating</option>
                  <option value="Friendship">Friendship</option>
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-bio">About you</Label>
                <Textarea
                  id="onb-bio"
                  placeholder="Tell people a bit about yourself..."
                  rows={4}
                  value={form.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  maxLength={500}
                />
                <p className="text-right text-xs text-muted-foreground">{form.bio.length}/500</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
              >
                {loading ? 'Saving...' : 'Start Matching!'} <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
