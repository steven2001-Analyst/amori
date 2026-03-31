'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { Heart, X, MapPin, ChevronRight, MoreVertical, Flag } from 'lucide-react'
import { toast } from 'sonner'

interface Profile { id: string; name: string; avatar: string | null; age: number; bio: string; interests: string[]; location: string; occupation: string; photos: Array<{ url: string; isProfile: boolean }> }

const SWIPE_THRESHOLD = 120

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(false)
  const [matchPopup, setMatchPopup] = useState<{ name: string } | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [exitX, setExitX] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  useEffect(() => {
    fetch('/api/users/discover')
      .then(res => { if (res.status === 401) router.push('/login'); return res.json() })
      .then(data => setProfiles(data))
      .catch(() => toast.error('Failed to load profiles'))
      .finally(() => setLoading(false))
  }, [])

  // Reset photo index when top card changes
  useEffect(() => { setPhotoIndex(0) }, [profiles.length])

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSwipe = useCallback(async (targetId: string, type: 'liked' | 'passed') => {
    if (swiping) return
    setSwiping(true)
    try {
      const res = await fetch('/api/users/swipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: targetId, type }) })
      const data = await res.json()
      if (data.isMutual) { setMatchPopup({ name: profiles[0]?.name || 'Someone' }) }
      setExitX(type === 'liked' ? 600 : -600)
      setTimeout(() => {
        setProfiles(prev => prev.filter(p => p.id !== targetId))
        setExitX(null)
        x.set(0)
      }, 300)
    } catch { toast.error('Swipe failed') } finally { setSwiping(false) }
  }, [swiping, profiles, x])

  async function handleReport(profileId: string) {
    const res = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportedId: profileId, reason: 'Inappropriate profile content' }) })
    if (res.ok) { toast.success('Report submitted'); setOpenMenu(null) } else toast.error('Failed to report')
  }

  function handleDragEnd() {
    const currentX = x.get()
    if (Math.abs(currentX) > SWIPE_THRESHOLD) {
      if (currentX > 0 && profiles.length > 0) handleSwipe(profiles[0].id, 'liked')
      else if (currentX < 0 && profiles.length > 0) handleSwipe(profiles[0].id, 'passed')
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 })
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft' && profiles.length > 0) handleSwipe(profiles[0].id, 'passed')
    if (e.key === 'ArrowRight' && profiles.length > 0) handleSwipe(profiles[0].id, 'liked')
  }

  function cyclePhoto(dir: 1 | -1) {
    const top = profiles[0]
    if (!top) return
    const photoCount = top.photos?.length || 1
    setPhotoIndex(prev => {
      const next = prev + dir
      if (next < 0) return photoCount - 1
      if (next >= photoCount) return 0
      return next
    })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Discover</h1>
        <div className="flex flex-col items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div>
      </div>
    )
  }

  const topProfile = profiles[0]
  const topPhotos = topProfile?.photos || []
  const currentPhotoUrl = topPhotos.length > 0
    ? topPhotos[photoIndex % topPhotos.length]?.url
    : topProfile?.avatar || '/logo.png'

  return (
    <div className="mx-auto max-w-lg px-4 py-6" tabIndex={0} onKeyDown={handleKey}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Discover</h1>
        <span className="text-sm text-muted-foreground">Drag or ← → to swipe</span>
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
            const isTop = reverseIndex === 0
            return (
              <motion.div
                key={profile.id}
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg bg-card cursor-grab active:cursor-grabbing"
                style={{ zIndex: profiles.length - reverseIndex, x: isTop ? x : 0, rotate: isTop ? rotate : 0 }}
                animate={
                  !isTop
                    ? { scale: 1 - reverseIndex * 0.04, y: reverseIndex * 8, opacity: 0.8 - reverseIndex * 0.2 }
                    : exitX !== null
                      ? { x: exitX, opacity: 0, rotate: exitX > 0 ? 30 : -30 }
                      : {}
                }
                transition={exitX !== null ? { duration: 0.3 } : { type: 'spring', stiffness: 300, damping: 25 }}
                drag={isTop ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                onDragEnd={isTop ? handleDragEnd : undefined}
                whileTap={isTop ? { cursor: 'grabbing' } : undefined}
              >
                <div className="relative h-full w-full">
                  <img
                    src={isTop ? currentPhotoUrl : (profile.photos?.find(p => p.isProfile)?.url || profile.avatar || '/logo.png')}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Swipe overlays - only on top card */}
                  {isTop && (
                    <>
                      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: likeOpacity }}>
                        <div className="rounded-xl border-4 border-green-500 bg-green-500/20 px-8 py-4 rotate-12"><Heart className="h-20 w-20 text-green-500" /></div>
                      </motion.div>
                      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: nopeOpacity }}>
                        <div className="rounded-xl border-4 border-red-500 bg-red-500/20 px-8 py-4 -rotate-12"><X className="h-20 w-20 text-red-500" /></div>
                      </motion.div>
                    </>
                  )}

                  {/* Photo dots indicator */}
                  {isTop && topPhotos.length > 1 && (
                    <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {topPhotos.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setPhotoIndex(i) }}
                          className={`h-2 rounded-full transition-all ${i === photoIndex % topPhotos.length ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Report menu */}
                  {isTop && (
                    <div className="absolute top-4 right-4 z-10" ref={menuRef}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === profile.id ? null : profile.id) }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === profile.id && (
                        <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border bg-white py-1 shadow-lg">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReport(profile.id) }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Flag className="h-4 w-4" />Report User
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-2 mb-1"><h2 className="text-2xl font-bold">{profile.name}</h2><span className="text-xl font-light">{profile.age}</span></div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80 mb-2">
                      {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>}
                      {profile.occupation && <span>{profile.occupation}</span>}
                    </div>
                    {profile.bio && <p className="text-sm text-white/90 line-clamp-2 mb-2">{profile.bio}</p>}
                    {profile.interests.length > 0 && <div className="flex flex-wrap gap-1.5">{profile.interests.slice(0, 5).map(i => <span key={i} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs backdrop-blur-sm">{i}</span>)}</div>}
                  </div>

                  {/* Photo nav arrows (mobile) */}
                  {isTop && topPhotos.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); cyclePhoto(-1) }} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition opacity-0 hover:opacity-100 focus:opacity-100" style={{ opacity: photoIndex > 0 ? 0.7 : 0 }}>
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); cyclePhoto(1) }} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition" style={{ opacity: photoIndex < topPhotos.length - 1 ? 0.7 : 0 }}>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Match popup */}
      <AnimatePresence>
        {matchPopup && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setMatchPopup(null)}>
            <motion.div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm mx-4" initial={{ y: 50 }} animate={{ y: 0 }}>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500"><Heart className="h-10 w-10 text-white" /></div>
              <h2 className="text-2xl font-bold mb-2">It&apos;s a Match!</h2>
              <p className="text-muted-foreground mb-6">You and {matchPopup.name} liked each other</p>
              <button onClick={() => { setMatchPopup(null); router.push('/chat') }} className="rounded-lg bg-rose-500 px-6 py-2.5 text-sm text-white hover:bg-rose-600 transition">Send a Message</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-6 mt-6">
        <button onClick={() => profiles.length > 0 && handleSwipe(profiles[0].id, 'passed')} disabled={swiping || profiles.length === 0} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 shadow-lg hover:border-red-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"><X className="h-7 w-7" /></button>
        <button onClick={() => profiles.length > 0 && handleSwipe(profiles[0].id, 'liked')} disabled={swiping || profiles.length === 0} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-300 bg-white text-rose-500 shadow-lg hover:border-rose-500 hover:text-rose-600 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"><Heart className="h-7 w-7 fill-rose-500" /></button>
      </div>
    </div>
  )
}
