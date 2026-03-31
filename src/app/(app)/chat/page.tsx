'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface MatchItem { matchId: string; user: { id: string; name: string; avatar: string | null; age: number; isOnline: boolean }; lastMessage: string | null; lastMessageTime: string | null }

export default function ChatPage() {
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/matches').then(res => { if (res.status === 401) router.push('/login'); return res.json() }).then(setMatches).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex min-h-[80vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageCircle className="h-16 w-16 text-rose-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
          <p className="text-muted-foreground">Match with someone to start chatting!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => (
            <Link key={m.matchId} href={`/chat/room?matchId=${m.matchId}`} className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:bg-muted/50 transition">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-sm font-semibold text-white">{m.user.name ? m.user.name[0].toUpperCase() : '?'}</div>
                {m.user.isOnline && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline"><h3 className="font-semibold">{m.user.name}, {m.user.age}</h3><span className="text-xs text-muted-foreground">{m.lastMessageTime ? new Date(m.lastMessageTime).toLocaleDateString() : ''}</span></div>
                <p className="text-sm text-muted-foreground truncate">{m.lastMessage || 'Tap to start chatting'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
