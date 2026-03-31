'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, MoreVertical, Flag } from 'lucide-react'
import { subscribeToMessages } from '@/lib/realtime'
import { toast } from 'sonner'

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
  const [showMenu, setShowMenu] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(() => {
    if (!matchId) return
    fetch('/api/messages/room?matchId=' + matchId)
      .then(res => res.json())
      .then(data => { if (data.messages) setMessages(data.messages); if (data.otherUser) setOtherUser(data.otherUser) })
      .catch(() => {})
  }, [matchId])

  useEffect(() => { fetchMessages(); const interval = setInterval(fetchMessages, 5000); return () => clearInterval(interval) }, [fetchMessages])

  // Realtime subscription
  useEffect(() => {
    if (!matchId) return
    const myId = JSON.parse(localStorage.getItem('amori-auth') || '{}')?.state?.userId
    const unsubscribe = subscribeToMessages(matchId, (msg: Msg) => {
      if (msg.senderId !== myId) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }
    })
    return unsubscribe
  }, [matchId])

  // Close menu on outside click
  useEffect(() => { function handleClick(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false) } document.addEventListener('mousedown', handleClick); return () => document.removeEventListener('mousedown', handleClick) }, [])

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

  function handleKeyDown(e: React.KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as unknown as React.FormEvent) } }

  const myId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('amori-auth') || '{}')?.state?.userId : null

  async function handleReport() {
    if (!otherUser) return
    const res = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportedId: otherUser.id, reason: 'Inappropriate behavior in chat' }) })
    if (res.ok) { toast.success('Report submitted'); setShowMenu(false) } else toast.error('Failed to report')
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3 bg-white">
        <button onClick={() => router.push('/chat')} className="lg:hidden text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></button>
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-sm font-semibold text-white">{otherUser?.name ? otherUser.name[0].toUpperCase() : '?'}</div>
          {otherUser?.isOnline && <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />}
        </div>
        <div className="flex-1 min-w-0"><h2 className="font-semibold truncate">{otherUser?.name || 'Loading...'}</h2><p className="text-xs text-muted-foreground">{otherUser?.isOnline ? '● Online' : 'Offline'}</p></div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-muted"><MoreVertical className="h-5 w-5 text-muted-foreground" /></button>
          {showMenu && <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border bg-white py-1 shadow-lg">
            <button onClick={handleReport} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Flag className="h-4 w-4" />Report User</button>
          </div>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Start the conversation! Say something nice.</div>}
        {messages.map((msg) => {
          const isMine = msg.senderId === myId
          const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          return <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMine ? 'bg-rose-500 text-white rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              <p className={`mt-1 text-[10px] ${isMine ? 'text-white/50' : 'text-muted-foreground'}`}>{time}</p>
            </div>
          </div>
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t px-4 py-3 flex gap-2 bg-white">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." className="flex-1 rounded-full border border-input bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button type="submit" disabled={sending || !input.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 transition disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  )
}
