'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Bell,
  Heart,
  MessageCircle,
  Star,
  Check,
  CheckCheck,
  Trash2,
} from 'lucide-react'

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string | null
  fromUserId: string | null
  read: boolean
  createdAt: string
  user?: { id: string; name: string; avatar: string | null } | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch {
      // silent
    }
  }

  async function markAllAsRead() {
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) =>
          fetch(`/api/notifications/${n.id}`, { method: 'PUT' })
        )
      )
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case 'match': return <Heart className="h-5 w-5 text-rose-500" />
      case 'message': return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'like': return <Star className="h-5 w-5 text-amber-500" />
      default: return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-bold">Notifications</h1>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-rose-500 text-white">{unreadCount} new</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Bell className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">No notifications</h2>
          <p className="mt-2 text-muted-foreground">When someone likes you or sends a message, you&apos;ll see it here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'cursor-pointer border-border/50 transition-colors hover:bg-accent/30',
                !notification.read && 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-800/50'
              )}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate">{notification.title}</h3>
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {notification.body || 'No details'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {notification.user && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={notification.user.avatar || undefined} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-rose-400 to-pink-400 text-white">
                      {notification.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


