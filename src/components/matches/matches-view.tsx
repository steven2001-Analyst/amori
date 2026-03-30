'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, MessageCircle, MapPin } from 'lucide-react'

interface MatchUser {
  id: string
  name: string
  avatar: string | null
  age: number
  isOnline: boolean
}

interface Match {
  id: string
  user: MatchUser
  lastMessage: { id: string; content: string; senderId: string; createdAt: string } | null
  createdAt: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/matches')
      if (res.ok) {
        const data = await res.json()
        setMatches(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-bold">Matches</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Heart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">No matches yet</h2>
        <p className="mt-2 text-muted-foreground">Keep swiping to find your perfect match!</p>
        <Link
          href="/discover"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-6 text-sm font-medium text-white"
        >
          Start Swiping
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Matches</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {matches.map((match) => (
          <Link key={match.id} href={`/chat/room?matchId=${match.id}`}>
            <Card className="group overflow-hidden border-border/50 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="relative aspect-square">
                {match.user.avatar ? (
                  <img
                    src={match.user.avatar}
                    alt={match.user.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950/50 dark:to-pink-950/50">
                    <span className="text-4xl font-bold text-rose-400">
                      {match.user.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {match.user.isOnline && (
                  <div className="absolute right-3 top-3 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <h3 className="font-semibold">{match.user.name}, {match.user.age}</h3>
                  {match.lastMessage && (
                    <p className="mt-0.5 truncate text-xs text-white/80">
                      {match.lastMessage.senderId === match.user.id ? '' : 'You: '}
                      {match.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
