'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  MessageCircle,
  User,
  Compass,
  Crown,
  LogOut,
  Bell,
  Menu,
  X,
  Settings,
} from 'lucide-react'
import { toast } from 'sonner'

const navItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/matches', label: 'Matches', icon: Heart },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
]

function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { name, avatar, logout } = useAuthStore((s) => ({
    name: s.name,
    avatar: s.avatar,
    logout: s.logout,
  }))
  const [notifCount, setNotifCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/notifications?unread=true')
      .then((r) => r.json())
      .then((data) => setNotifCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {})
  }, [])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
      toast.success('Logged out')
      router.push('/')
    } catch {
      toast.error('Failed to log out')
    }
  }

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-6 w-6">
            <Image src="/logo.png" alt="Amori" fill className="object-contain" />
          </div>
          <span className="font-bold gradient-text-rose">Amori</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/notifications" className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            {notifCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="relative h-6 w-6">
                  <Image src="/logo.png" alt="Amori" fill className="object-contain" />
                </div>
                <span className="font-bold gradient-text-rose">Amori</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-1 flex-col justify-between overflow-y-auto" style={{ height: 'calc(100% - 3.5rem)' }}>
              <div>
                <div className="border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-400 text-white">
                        {name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold">{name}</div>
                      <div className="text-xs text-muted-foreground">Free Plan</div>
                    </div>
                  </div>
                </div>
                {nav}
                <div className="mt-2 space-y-1 px-3">
                  <Link
                    href="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Bell className="h-5 w-5" />
                    Notifications
                    {notifCount > 0 && <Badge className="ml-auto bg-rose-500 text-white text-xs">{notifCount}</Badge>}
                  </Link>
                  <Link
                    href="/premium"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Crown className="h-5 w-5" />
                    Premium
                  </Link>
                </div>
              </div>
              <div className="p-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-sidebar">
        <div className="flex h-14 items-center gap-2 border-b px-5">
          <div className="relative h-7 w-7">
            <Image src="/logo.png" alt="Amori" fill className="object-contain" />
          </div>
          <span className="text-lg font-bold gradient-text-rose">Amori</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {nav}
          <div className="mt-2 space-y-1 px-3">
            <Link
              href="/notifications"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              Notifications
              {notifCount > 0 && <Badge className="ml-auto bg-rose-500 text-white text-xs">{notifCount}</Badge>}
            </Link>
            <Link
              href="/premium"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Crown className="h-5 w-5" />
              Premium
            </Link>
          </div>
        </div>
        <div className="border-t p-3">
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-400 text-white text-sm">
                {name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm font-semibold">{name}</div>
              <div className="text-xs text-muted-foreground">Free Plan</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                isActive ? 'text-rose-500' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-rose-500')} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Only read from localStorage/Zustand AFTER mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Read the store value directly (bypass React render cycle)
    const state = useAuthStore.getState()
    setIsAuthenticated(state.isAuthenticated)
    // Subscribe to future changes
    const unsub = useAuthStore.subscribe((s) => {
      setIsAuthenticated(s.isAuthenticated)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router, mounted])

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="pb-20 pt-14 lg:pb-0 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-4xl p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
