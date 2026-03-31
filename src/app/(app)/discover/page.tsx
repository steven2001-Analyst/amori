'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, MapPin, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface Profile { id: string; name: string; avatar: string | null; age: number; bio: string; interests: string[]; location: string; occupation: string; photos: Array<{ url: string; isProfile: boolean }> }

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(false)
  const [matchPopup, setMatchPopup] = useState<{ name: string } | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/users/discover')
      .then(res => { if (res.status === 401) router.push('/login'); return res.json() })
      .then(data => setProfiles(data))
      .catch(() => toast.error('Failed to load profiles'))
      .finally(() => setLoading(false))
  }, [])

  const handleSwipe = useCallback(async (targetId: string, type: 'liked' | 'passed') => {
    if (swiping) return
    setSwiping(true)
    try {
      const res = await fetch('/api/users/swipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: targetId, type }) })
      const data = await res.json()
      if (data.isMutual) { setMatchPopup({ name: profiles[currentIndex]?.name || 'Someone' }) }
      setProfiles(prev => prev.filter(p => p.id !== targetId))
      setCurrentIndex(prev => Math.max(0, prev - 1))
    } catch { toast.error('Swipe failed') } finally { setSwiping(false) }
  }, [swiping, profiles, currentIndex])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft' && profiles.length > 0) handleSwipe(profiles[0].id, 'passed')
    if (e.key === 'ArrowRight' && profiles.length > 0) handleSwipe(profiles[0].id, 'liked')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Discover</h1>
        <div className="flex flex-col items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6" tabIndex={0} onKeyDown={handleKey}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Discover</h1>
        <span className="text-sm text-muted-foreground">Use ← → to swipe</span>
      </div>

      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center mb-4"><Heart className="h-10 w-10 text-rose-300" /></div>
          <h2 className="text-xl font-semibold mb-2">No more profiles</h2>
          <p className="text-muted-foreground mb-6">Check back later for new people in your area!</p>
          <button onClick={() => router.push('/matches')} className="flex items-center gap-2 text-rose-600 hover:underline"><span>View your matches</span><ChevronRight className="h-4 w-4" /></button>
        </div>
      ) : (
        <div className="relative" style={{ height: '65vh', minHeight: 480 }}>
          {profiles.slice(0, 3).reverse().map((profile, reverseIndex) => {
            const displayIndex = profiles.length - 1 - reverseIndex
            const isTop = reverseIndex === 0
            const photoUrl = profile.photos?.find(p => p.isProfile)?.url || profile.avatar || '/logo.png'
            return (
              <motion.div
                key={profile.id}
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg bg-card"
                style={{ zIndex: profiles.length - reverseIndex }}
                animate={isTop ? {} : { scale: 1 - reverseIndex * 0.04, y: reverseIndex * 8, opacity: 0.8 - reverseIndex * 0.2 }}
              >
                <div className="relative h-full w-full">
                  <img src={photoUrl} alt={profile.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-2 mb-1"><h2 className="text-2xl font-bold">{profile.name}</h2><span className="text-xl font-light">{profile.age}</span></div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80 mb-2">
                      {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>}
                      {profile.occupation && <span>{profile.occupation}</span>}
                    </div>
                    {profile.bio && <p className="text-sm text-white/90 line-clamp-2 mb-2">{profile.bio}</p>}
                    {profile.interests.length > 0 && <div className="flex flex-wrap gap-1.5">{profile.interests.slice(0, 5).map(i => <span key={i} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs backdrop-blur-sm">{i}</span>)}</div>}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-6">
        <button onClick={() => profiles.length > 0 && handleSwipe(profiles[0].id, 'passed')} disabled={swiping || profiles.length === 0} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 shadow-lg hover:border-red-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"><X className="h-7 w-7" /></button>
        <button onClick={() => profiles.length > 0 && handleSwipe(profiles[0].id, 'liked')} disabled={swiping || profiles.length === 0} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-300 bg-white text-rose-500 shadow-lg hover:border-rose-500 hover:text-rose-600 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"><Heart className="h-7 w-7 fill-rose-500" /></button>
      </div>
    </div>
  )
}
