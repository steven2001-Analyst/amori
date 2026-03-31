'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Heart, MessageCircle, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'

interface Notification { id: string; type: string; title: string; body: string; fromUserId: string | null; read: boolean; createdAt: string }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/notifications').then(res => { if (res.status === 401) router.push('/login'); return res.json() }).then(setNotifications).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function markRead(id: string) {
    await fetch('/api/notifications?id=' + id, { method: 'PUT' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    await Promise.all(notifications.filter(n => !n.read).map(n => fetch('/api/notifications?id=' + n.id, { method: 'PUT' })))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  function getIcon(type: string) {
    if (type === 'match') return <Heart className="h-5 w-5 text-rose-500" />
    if (type === 'like') return <Heart className="h-5 w-5 text-pink-400" />
    return <MessageCircle className="h-5 w-5 text-blue-500" />
  }

  if (loading) return <div className="flex min-h-[80vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some(n => !n.read) && <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-rose-600 hover:underline"><CheckCheck className="h-4 w-4" />Mark all read</button>}
      </div>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="h-16 w-16 text-rose-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
          <p className="text-muted-foreground">You have no notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)} className={`flex items-start gap-3 rounded-xl border bg-card p-4 cursor-pointer transition ${!n.read ? 'border-rose-200 bg-rose-50/30' : ''}`}>
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{n.title}</h3>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
              {!n.read && <div className="h-2.5 w-2.5 rounded-full bg-rose-500 mt-2 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
