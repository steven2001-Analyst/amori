'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'

interface Msg { id: string; matchId: string; senderId: string; content: string; createdAt: string }
interface OtherUser { id: string; name: string; avatar: string | null; age: number; isOnline: boolean }

export default function ChatRoomPage() {
  const params = useSearchParams()
  const matchId = params.get('matchId')
  const router = useRouter()
  const [messages, setMessages] = useState<Msg[]>([])
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!matchId) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [matchId])

  function fetchMessages() {
    fetch('/api/messages/room?matchId=' + matchId).then(res => res.json()).then(data => {
      if (data.messages) setMessages(data.messages)
      if (data.otherUser) setOtherUser(data.otherUser)
    }).catch(() => {})
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages/room?matchId=' + matchId, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: input.trim() }) })
      if (res.ok) { setInput(''); fetchMessages() }
    } catch {} finally { setSending(false) }
  }

  const myId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('amori-auth') || '{}')?.state?.userId : null

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <button onClick={() => router.push('/chat')} className="lg:hidden"><ArrowLeft className="h-5 w-5" /></button>
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-sm font-semibold text-white">{otherUser?.name ? otherUser.name[0].toUpperCase() : '?'}</div>
          {otherUser?.isOnline && <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />}
        </div>
        <div><h2 className="font-semibold">{otherUser?.name || 'Loading...'}</h2><p className="text-xs text-muted-foreground">{otherUser?.isOnline ? 'Online' : 'Offline'}</p></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === myId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMine ? 'bg-rose-500 text-white' : 'bg-muted'}`}>
                <p>{msg.content}</p>
                <p className={`mt-1 text-xs ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t px-4 py-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button type="submit" disabled={sending || !input.trim()} className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 transition disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  )
}
