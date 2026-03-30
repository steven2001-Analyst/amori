'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import {
  X,
  Heart,
  Star,
  MapPin,
  Briefcase,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

interface ProfilePhoto {
  id: string
  url: string
  order: number
  isProfile: boolean
}

interface UserProfile {
  id: string
  name: string
  avatar: string | null
  age: number
  gender: string
  bio: string
  interests: string[]
  location: string
  occupation: string
  lookingFor: string
  photos: ProfilePhoto[]
}

interface SwipeCardProps {
  profile: UserProfile
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

function SwipeCard({ profile, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-25, 25])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])
  const scale = useTransform(x, [-300, 0, 300], [0.95, 1, 0.95])

  const allPhotos = profile.photos.length > 0
    ? [...profile.photos].sort((a, b) => a.order - b.order).map((p) => p.url)
    : profile.avatar
    ? [profile.avatar]
    : []

  const [photoIndex, setPhotoIndex] = useState(0)

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const threshold = 120
    if (info.offset.x > threshold) {
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      onSwipe('left')
    }
  }

  if (!isTop) {
    return (
      <div className="absolute inset-0">
        <Card className="h-full w-full overflow-hidden rounded-2xl border-border/50 bg-card">
          {allPhotos.length > 0 ? (
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
              <img src={allPhotos[0]} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="flex aspect-[3/4] w-full max-w-sm mx-auto items-center justify-center bg-muted">
              <div className="text-6xl font-bold text-muted-foreground/30">{profile.name.charAt(0)}</div>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, scale }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Like/Nope indicators */}
      <motion.div
        className="pointer-events-none absolute left-6 top-8 z-20 rotate-[-15deg] rounded-xl border-4 border-green-500 bg-green-500/20 px-4 py-2"
        style={{ opacity: likeOpacity }}
      >
        <span className="text-2xl font-bold text-green-500">LIKE</span>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-6 top-8 z-20 rotate-[15deg] rounded-xl border-4 border-red-500 bg-red-500/20 px-4 py-2"
        style={{ opacity: nopeOpacity }}
      >
        <span className="text-2xl font-bold text-red-500">NOPE</span>
      </motion.div>

      <Card className="h-full w-full overflow-hidden rounded-2xl border-border/50 bg-card shadow-xl">
        {allPhotos.length > 0 ? (
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
            <img
              src={allPhotos[photoIndex] || allPhotos[0]}
              alt={profile.name}
              className="h-full w-full object-cover"
              draggable={false}
            />

            {/* Photo navigation */}
            {allPhotos.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(Math.max(0, photoIndex - 1)) }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(Math.min(allPhotos.length - 1, photoIndex + 1)) }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1">
                  {allPhotos.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full transition-colors',
                        i === photoIndex ? 'bg-white' : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Profile info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {profile.name}, {profile.age}
                  </h3>
                  {profile.location && (
                    <div className="mt-1 flex items-center gap-1 text-sm text-white/80">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.location}
                    </div>
                  )}
                  {profile.occupation && (
                    <div className="mt-0.5 flex items-center gap-1 text-sm text-white/80">
                      <Briefcase className="h-3.5 w-3.5" />
                      {profile.occupation}
                    </div>
                  )}
                </div>
              </div>

              {profile.bio && (
                <p className="mt-2 line-clamp-2 text-sm text-white/90">{profile.bio}</p>
              )}

              {profile.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.interests.slice(0, 5).map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-white/20 text-white text-xs backdrop-blur-sm border-0">
                      {interest}
                    </Badge>
                  ))}
                  {profile.interests.length > 5 && (
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs backdrop-blur-sm border-0">
                      +{profile.interests.length - 5}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex aspect-[3/4] w-full max-w-sm mx-auto flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 p-6">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-4xl font-bold text-white">
              {profile.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-foreground">{profile.name}, {profile.age}</h3>
            {profile.location && (
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </p>
            )}
            {profile.bio && <p className="mt-3 text-center text-sm text-muted-foreground">{profile.bio}</p>}
            {profile.interests.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                {profile.interests.slice(0, 5).map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const userId = useAuthStore((s) => s.userId)

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users/discover')
      if (res.ok) {
        const data = await res.json()
        setProfiles(data)
        setCurrentIndex(0)
      }
    } catch {
      toast.error('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) fetchProfiles()
  }, [userId, fetchProfiles])

  async function handleSwipe(direction: 'left' | 'right') {
    if (swiping || currentIndex >= profiles.length) return
    setSwiping(true)

    const target = profiles[currentIndex]
    const type = direction === 'right' ? 'liked' : 'passed'

    try {
      const res = await fetch('/api/users/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: target.id, type }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.isMutual) {
          toast.success(`It's a match with ${target.name}!`, {
            action: {
              label: 'Say hi',
              onClick: () => window.location.href = `/chat/${data.matchId || ''}`,
            },
          })
        }
        setCurrentIndex((prev) => prev + 1)
      }
    } catch {
      toast.error('Failed to swipe')
    } finally {
      setSwiping(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Skeleton className="h-8 w-48 rounded-lg mb-4" />
        <Skeleton className="aspect-[3/4] w-full max-w-sm rounded-2xl" />
      </div>
    )
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Heart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">No more profiles</h2>
        <p className="mt-2 text-muted-foreground">Check back later for new people!</p>
        <Button onClick={fetchProfiles} variant="outline" className="mt-6 gap-2">
          <RotateCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>
    )
  }

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 3)

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center gap-3 self-start">
        <h1 className="text-xl font-bold">Discover</h1>
        <Badge variant="secondary" className="text-xs">
          <Sparkles className="mr-1 h-3 w-3" />
          {profiles.length - currentIndex} remaining
        </Badge>
      </div>

      {/* Card stack */}
      <div className="relative aspect-[3/4] w-full max-w-sm">
        <AnimatePresence>
          {visibleProfiles.map((profile, index) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex items-center gap-4">
        <Button
          size="lg"
          variant="outline"
          className="h-14 w-14 rounded-full border-red-200 p-0 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/50"
          onClick={() => handleSwipe('left')}
          disabled={swiping}
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>
        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 p-0 text-white shadow-lg shadow-rose-200/50 hover:from-rose-600 hover:to-pink-600 dark:shadow-rose-900/50"
          onClick={() => handleSwipe('right')}
          disabled={swiping}
        >
          <Heart className="h-7 w-7" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 w-14 rounded-full border-blue-200 p-0 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/50"
          disabled={swiping}
        >
          <Star className="h-6 w-6 text-blue-500" />
        </Button>
      </div>
    </div>
  )
}
