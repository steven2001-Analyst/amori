'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Bell, User, Crown, Settings, LogOut, Compass } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/notifications', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
]

const sideItems = [
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/premium', icon: Crown, label: 'Premium' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, name, avatar, logout } = useAuthStore()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/login')
  }, [mounted, isAuthenticated, router])

  const fetchUnreadCount = useCallback(() => {
    if (!isAuthenticated) return
    fetch('/api/notifications?unread=true')
      .then(res => { if (res.ok) return res.json(); return [] })
      .then(data => { if (Array.isArray(data)) setUnreadCount(data.length) })
      .catch(() => {})
  }, [isAuthenticated])

  // Fetch unread count on mount and every 15 seconds
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 15000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  if (!mounted) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /></div>
  if (!isAuthenticated) return null

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-muted/30">
        <div className="flex items-center gap-2 border-b p-6">
          <Image src="/logo.png" alt="Amori" width={28} height={28} className="object-contain" />
          <span className="text-lg font-bold gradient-text-rose">Amori</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {sideItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition relative', pathname === item.href ? 'bg-rose-50 text-rose-600 font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.href === '/notifications' && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3 px-2">
            {avatar ? (
              <img src={avatar} alt={name || ''} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-sm font-semibold text-white">{name ? name[0].toUpperCase() : '?'}</div>
            )}
            <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{name || 'User'}</div></div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition"><LogOut className="h-4 w-4" />Log Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-white py-2 lg:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={cn('flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition relative', pathname === item.href || (item.href === '/matches' && pathname.startsWith('/chat')) ? 'text-rose-600' : 'text-muted-foreground')}>
            <item.icon className="h-5 w-5" />
            {item.label}
            {item.href === '/notifications' && unreadCount > 0 && (
              <span className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}
