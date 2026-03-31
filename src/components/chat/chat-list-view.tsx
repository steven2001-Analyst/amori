'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ChatPreview {
  id: string
  user: { id: string; name: string; avatar: string | null; age: number; isOnline: boolean }
  lastMessage: { id: string; content: string; senderId: string; createdAt: string } | null
  createdAt: string
}

export default function ChatListPage() {
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch('/api/matches')
      if (res.ok) {
        const data = await res.json()
        setChats(data.filter((c: ChatPreview) => c.lastMessage))
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-bold">Messages</h1>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <MessageCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">No messages yet</h2>
        <p className="mt-2 text-muted-foreground">Match with someone and start a conversation!</p>
        <Link
          href="/discover"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-6 text-sm font-medium text-white"
        >
          Discover People
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Messages</h1>
      <div className="space-y-2">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/room?matchId=${chat.id}`}>
            <Card className="flex items-center gap-3 border-border/50 p-3 transition-colors hover:bg-accent/50">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.user.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-400 text-white">
                    {chat.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {chat.user.isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{chat.user.name}</h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })}
                    </span>
                  )}
                </div>
                {chat.lastMessage && (
                  <p className="truncate text-sm text-muted-foreground">
                    {chat.lastMessage.senderId === chat.user.id ? '' : 'You: '}
                    {chat.lastMessage.content}
                  </p>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
