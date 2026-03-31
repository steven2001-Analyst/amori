'use client'
import { Check, Crown } from 'lucide-react'
import { toast } from 'sonner'

export default function PremiumPage() {
  const features = [
    { text: 'Unlimited swipes', pro: true },
    { text: 'See who likes you', pro: true },
    { text: 'Advanced filters', pro: true },
    { text: 'Profile boost', pro: true },
    { text: 'Super likes', pro: true },
    { text: 'Incognito mode', pro: true },
    { text: '10 swipes per day', pro: false },
    { text: 'Basic matching', pro: false },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500"><Crown className="h-8 w-8 text-white" /></div>
        <h1 className="text-3xl font-bold mb-2">Upgrade to <span className="gradient-text-rose">Amori Premium</span></h1>
        <p className="text-muted-foreground">Get unlimited access to all features and find your match faster.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-8">
          <h2 className="text-xl font-bold mb-2">Free</h2>
          <p className="text-3xl font-bold mb-6">$0<span className="text-sm text-muted-foreground font-normal">/month</span></p>
          <ul className="space-y-3">
            {features.filter(f => !f.pro).map(f => <li key={f.text} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" />{f.text}</li>)}
            {features.filter(f => f.pro).map(f => <li key={f.text} className="flex items-center gap-2 text-sm text-muted-foreground"><span className="h-4 w-4 rounded border" />{f.text}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-rose-500 bg-card p-8 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-3 py-0.5 text-xs font-medium text-white">Popular</span>
          <h2 className="text-xl font-bold mb-2">Premium</h2>
          <p className="text-3xl font-bold mb-6 gradient-text-rose">$9.99<span className="text-sm text-muted-foreground font-normal text-foreground">/month</span></p>
          <ul className="space-y-3">
            {features.map(f => <li key={f.text} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-rose-500" />{f.text}</li>)}
          </ul>
          <button onClick={() => toast.info('Coming soon!')} className="mt-6 w-full rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-sm text-white hover:from-rose-600 hover:to-pink-600 transition">Upgrade Now</button>
        </div>
      </div>
    </div>
  )
}
