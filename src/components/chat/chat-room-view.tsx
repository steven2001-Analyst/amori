'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { Send, ArrowLeft, Check, CheckCheck, Image as ImageIcon } from 'lucide-react'

interface Message {
  id: string
  senderId: string
  content: string
  type: string
  read: boolean
  createdAt: string
}

interface OtherUser {
  id: string
  name: string
  avatar: string | null
  age: number
  isOnline: boolean
}

export default function ChatRoomPage({ matchId: matchIdProp }: { matchId?: string }) {
  const params = useParams()
  const matchId = matchIdProp || (params.matchId as string)
  const router = useRouter()
  const userId = useAuthStore((s) => s.userId)

  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/room?matchId=${matchId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        if (data.otherUser) setOtherUser(data.otherUser)
      }
    } catch {
      // silent
    }
  }, [matchId])

  useEffect(() => {
    fetchMessages().then(() => setLoading(false))
    pollingRef.current = setInterval(fetchMessages, 3000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [matchId, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!newMessage.trim() || sending) return

    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: userId || '',
      content,
      type: 'text',
      read: false,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      const res = await fetch(`/api/messages/room?matchId=${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        const realMsg = await res.json()
        setMessages((prev) => prev.map((m) => m.id === tempMsg.id ? realMsg : m))
        fetchMessages()
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
        setNewMessage(content)
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
      setNewMessage(content)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-3 border-b p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
              <Skeleton className={cn('h-10 w-48 rounded-2xl', i % 2 === 0 ? 'rounded-bl-sm' : 'rounded-br-sm')} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b p-4">
        <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden" onClick={() => router.push('/chat')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Link href="/chat" className="hidden lg:block">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-400 text-white text-sm">
              {otherUser?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          {otherUser?.isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold">{otherUser?.name}</h2>
          <p className="text-xs text-muted-foreground">
            {otherUser?.isOnline ? 'Online now' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Send className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Start the conversation!</p>
            <p className="text-xs text-muted-foreground">Say something nice to break the ice.</p>
          </div>
        )}

        {messages.map((message) => {
          const isMe = message.senderId === userId
          return (
            <div
              key={message.id}
              className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5',
                  isMe
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                )}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <div className={cn(
                  'mt-1 flex items-center gap-1',
                  isMe ? 'justify-end' : 'justify-start'
                )}>
                  <span className={cn(
                    'text-[10px]',
                    isMe ? 'text-white/70' : 'text-muted-foreground'
                  )}>
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: false })}
                  </span>
                  {isMe && (
                    message.read
                      ? <CheckCheck className="h-3 w-3 text-white/70" />
                      : <Check className="h-3 w-3 text-white/70" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-full"
            disabled={sending}
          />
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shrink-0"
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
