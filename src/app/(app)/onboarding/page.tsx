'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const INTERESTS = ['Travel', 'Music', 'Fitness', 'Cooking', 'Movies', 'Reading', 'Gaming', 'Photography', 'Art', 'Sports', 'Coffee', 'Nature', 'Dancing', 'Tech', 'Fashion', 'Yoga']

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/session').then(res => res.json()).then(data => {
      if (data.onboarded) router.push('/discover')
      if (data.gender) setGender(data.gender)
      if (data.age) setAge(String(data.age))
      if (data.interests?.length) setInterests(data.interests)
      if (data.bio) setBio(data.bio)
      if (data.age && data.gender && data.interests?.length) setStep(3)
    }).catch(() => {})
  }, [])

  function toggleInterest(i: string) { setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]) }

  async function handleFinish() {
    setLoading(true)
    try {
      const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gender, age: parseInt(age), interests, bio }) })
      if (res.ok) { toast.success('Profile complete!'); router.push('/discover') } else { toast.error('Failed to save') }
    } catch { toast.error('Something went wrong') } finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 rounded-full bg-rose-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all" style={{ width: (step / 3 * 100) + '%' }} /></div>
          <p className="text-sm text-muted-foreground mt-2 text-center">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">About you</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1.5">I am</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map(g => <button key={g} onClick={() => setGender(g.toLowerCase())} className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${gender === g.toLowerCase() ? 'border-rose-500 bg-rose-50 text-rose-600' : 'hover:bg-muted'}`}>{g}</button>)}
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1.5">Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} min={18} max={100} className="w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your age" /></div>
              <button onClick={() => { if (gender && age) setStep(2); else toast.error('Please fill in all fields') }} className="w-full rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-sm text-white">Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Your interests</h2>
            <p className="text-sm text-muted-foreground mb-6">Select at least 3 interests</p>
            <div className="flex flex-wrap gap-2 mb-6">{INTERESTS.map(i => <button key={i} onClick={() => toggleInterest(i)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${interests.includes(i) ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{i}</button>)}</div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-lg border py-2.5 text-sm hover:bg-accent">Back</button>
              <button onClick={() => { if (interests.length >= 3) setStep(3); else toast.error('Select at least 3 interests') }} className="flex-1 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-sm text-white">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1.5">Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="What makes you unique?" className="w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 rounded-lg border py-2.5 text-sm hover:bg-accent">Back</button>
                <button onClick={handleFinish} disabled={loading} className="flex-1 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-sm text-white disabled:opacity-50">{loading ? 'Saving...' : 'Complete Profile'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
