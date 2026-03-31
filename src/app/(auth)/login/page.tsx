'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Login failed'); return }
      login({ userId: data.user.id, email: data.user.email, name: data.user.name, avatar: data.user.avatar, token: data.token })
      toast.success('Welcome back, ' + data.user.name + '!')
      if (!data.user.onboarded) router.push('/onboarding'); else router.push('/discover')
    } catch { toast.error('Something went wrong') } finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-500 to-pink-600 items-center justify-center p-12">
        <div className="text-center text-white">
          <Image src="/logo.png" alt="Amori" width={80} height={80} className="mx-auto mb-6 object-contain" />
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Match</h1>
          <p className="text-lg text-white/80">Join thousands of people who have found love on Amori.</p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center"><Image src="/logo.png" alt="Amori" width={48} height={48} className="mx-auto mb-4 object-contain" /><h1 className="text-2xl font-bold gradient-text-rose">Amori</h1></div>
          <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to continue your love story</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1.5">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="you@example.com" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" /></div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-sm font-medium text-white hover:from-rose-600 hover:to-pink-600 transition disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">Don&apos;t have an account? <Link href="/register" className="text-rose-600 font-medium hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  )
}
