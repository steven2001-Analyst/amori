'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface MatchItem { matchId: string; user: { id: string; name: string; avatar: string | null; age: number; isOnline: boolean }; lastMessage: string | null; lastMessageTime: string | null }

function timeAgo(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  if (diff < 60000) return 'now'
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h'
  if (diff < 604800000) return Math.floor(diff / 86400000) + 'd'
  return new Date(dateStr).toLocaleDateString()
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/matches').then(res => { if (res.status === 401) router.push('/login'); return res.json() }).then(setMatches).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-8"><h1 className="text-2xl font-bold mb-6">Matches</h1><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div></div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Matches</h1>
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center mb-4"><MessageCircle className="h-10 w-10 text-rose-300" /></div>
          <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
          <p className="text-muted-foreground mb-6">Keep swiping to find your perfect match!</p>
          <Link href="/discover" className="text-rose-600 hover:underline font-medium">Go to Discover →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map(m => (
            <Link key={m.matchId} href={`/chat/room?matchId=${m.matchId}`} className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:shadow-md hover:border-rose-100 transition-all group">
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-lg font-bold text-white shadow-md">{m.user.name ? m.user.name[0].toUpperCase() : '?'}</div>
                {m.user.isOnline && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline"><h3 className="font-semibold text-[15px]">{m.user.name}, {m.user.age}</h3><span className="text-xs text-muted-foreground">{m.lastMessageTime ? timeAgo(m.lastMessageTime) : ''}</span></div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{m.lastMessage || <span className="text-rose-400">Tap to start chatting</span>}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition shrink-0"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50"><Heart className="h-5 w-5 text-rose-500" /></div></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
