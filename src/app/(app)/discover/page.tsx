'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface Profile { id: string; name: string; avatar: string | null; age: number; bio: string; interests: string[]; location: string; occupation: string; photos: Array<{ url: string; isProfile: boolean }> }

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(false)
  const [matchPopup, setMatchPopup] = useState<{ name: string } | null>(null)
  const router = useRouter()

  useEffect(() => { fetchProfiles() }, [])

  async function fetchProfiles() {
    try {
      const res = await fetch('/api/users/discover')
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setProfiles(data)
    } catch { toast.error('Failed to load profiles') } finally { setLoading(false) }
  }

  const handleSwipe = useCallback(async (targetId: string, type: 'liked' | 'passed') => {
    if (swiping) return
    setSwiping(true)
    try {
      const res = await fetch('/api/users/swipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: targetId, type }) })
      const data = await res.json()
      if (data.isMutual) { setMatchPopup({ name: profiles[0]?.name || 'Someone' }) }
      setProfiles((prev) => prev.filter((p) => p.id !== targetId))
    } catch { toast.error('Swipe failed') } finally { setSwiping(false) }
  }, [swiping, profiles])

  if (loading) return <div className="flex min-h-[80vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div>

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Discover</h1>
      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-rose-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No more profiles</h2>
          <p className="text-muted-foreground">Check back later for new people!</p>
        </div>
      ) : (
        <div className="relative">
          <AnimatePresence mode="wait">
            {profiles.map((profile, index) => {
              const isTop = index === 0
              const photoUrl = profile.photos?.find(p => p.isProfile)?.url || profile.avatar || '/logo.png'
              return isTop ? (
                <motion.div key={profile.id} initial={{ opacity: 1 }} exit={{ x: 200, opacity: 0 }} transition={{ duration: 0.3 }} className="relative rounded-2xl overflow-hidden shadow-lg bg-card" style={{ height: '70vh' }}>
                  <div className="relative h-full">
                    <img src={photoUrl} alt={profile.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h2 className="text-3xl font-bold">{profile.name}, {profile.age}</h2>
                      {profile.location && <p className="flex items-center gap-1 text-sm text-white/80 mt-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</p>}
                      {profile.occupation && <p className="text-sm text-white/80 mt-0.5">{profile.occupation}</p>}
                      {profile.bio && <p className="text-sm text-white/90 mt-2 line-clamp-2">{profile.bio}</p>}
                      {profile.interests.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{profile.interests.slice(0, 5).map((i) => <span key={i} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs">{i}</span>)}</div>}
                    </div>
                  </div>
                </motion.div>
              ) : index < 2 ? (
                <div key={profile.id} className="absolute inset-0 rounded-2xl overflow-hidden shadow bg-card" style={{ transform: `scale(${1 - index * 0.05}) translateY(${index * 8}px)`, zIndex: -index }}>
                  <img src={profile.photos?.find(p => p.isProfile)?.url || profile.avatar || '/logo.png'} alt="" className="h-full w-full object-cover opacity-80" />
                </div>
              ) : null
            })}
          </AnimatePresence>
          <div className="flex items-center justify-center gap-6 mt-6">
            <button onClick={() => handleSwipe(profiles[0].id, 'passed')} disabled={swiping} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-500 shadow-lg hover:border-red-500 hover:text-red-500 hover:scale-110 transition disabled:opacity-50"><X className="h-8 w-8" /></button>
            <button onClick={() => handleSwipe(profiles[0].id, 'liked')} disabled={swiping} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-300 bg-white text-rose-500 shadow-lg hover:border-rose-500 hover:text-rose-600 hover:scale-110 transition disabled:opacity-50"><Heart className="h-8 w-8 fill-rose-500" /></button>
          </div>
        </div>
      )}

      {matchPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setMatchPopup(null)}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 p-12 text-center text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <Heart className="mx-auto mb-4 h-16 w-16 fill-white animate-bounce" />
            <h2 className="text-3xl font-bold mb-2">It&apos;s a Match!</h2>
            <p className="text-lg text-white/80 mb-6">You and {matchPopup.name} liked each other!</p>
            <button onClick={() => { setMatchPopup(null); router.push('/matches') }} className="rounded-lg bg-white px-6 py-2.5 text-rose-600 font-medium">Send a Message</button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
