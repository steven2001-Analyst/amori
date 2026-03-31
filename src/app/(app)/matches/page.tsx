'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface MatchItem { matchId: string; user: { id: string; name: string; avatar: string | null; age: number; isOnline: boolean }; lastMessage: string | null; lastMessageTime: string | null }

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/matches').then(res => { if (res.status === 401) router.push('/login'); return res.json() }).then(setMatches).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex min-h-[80vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Matches</h1>
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-300 mb-4"><MessageCircle className="h-8 w-8" /></div>
          <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
          <p className="text-muted-foreground">Keep swiping to find your perfect match!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {matches.map((m) => (
            <Link key={m.matchId} href={`/chat/room?matchId=${m.matchId}`} className="rounded-xl border bg-card p-4 flex items-center gap-4 hover:shadow-md transition">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-lg font-semibold text-white">{m.user.name ? m.user.name[0].toUpperCase() : '?'}</div>
                {m.user.isOnline && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{m.user.name}, {m.user.age}</h3>
                <p className="text-sm text-muted-foreground truncate">{m.lastMessage || 'Start a conversation!'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
