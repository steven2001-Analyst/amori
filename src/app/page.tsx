'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Shield, MessageCircle, MapPin, Camera, Zap, ArrowRight } from 'lucide-react'

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [inView, setInView] = useState(false)
  useEffect(() => { setInView(true) }, [])
  return <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>{children}</motion.div>
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Amori" width={32} height={32} className="object-contain" />
            <span className="text-xl font-bold gradient-text-rose">Amori</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">How It Works</a>
            <a href="#stories" className="text-sm text-muted-foreground hover:text-foreground transition">Stories</a>
            <Link href="/premium" className="text-sm text-muted-foreground hover:text-foreground transition">Premium</Link>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm hover:bg-accent transition">Log In</Link>
            <Link href="/register" className="rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-sm text-white hover:from-rose-600 hover:to-pink-600 transition">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 text-center">
          <FadeIn><span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-medium text-rose-600">Find meaningful connections</span></FadeIn>
          <FadeIn delay={0.1}><h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Where Real <span className="gradient-text-rose">Love Stories</span> Begin</h1></FadeIn>
          <FadeIn delay={0.2}><p className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">Amori connects you with people who truly match your vibe. Smart matching, genuine profiles, and a community built for real relationships.</p></FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-3 text-white hover:from-rose-600 hover:to-pink-600 transition">Find Your Match <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-lg border bg-white px-8 py-3 hover:bg-accent transition">Learn More</a>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-16 flex items-center gap-8 text-sm text-muted-foreground">
              <div className="text-center"><div className="text-2xl font-bold text-foreground">50K+</div><div>Active Users</div></div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center"><div className="text-2xl font-bold text-foreground">12K+</div><div>Matches Made</div></div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center"><div className="text-2xl font-bold text-foreground">4.8★</div><div>App Rating</div></div>
            </div>
          </FadeIn>
          <FadeIn delay={0.5}>
            <div className="mt-12 w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl">
              <div className="relative aspect-[16/9]"><Image src="/hero-bg.png" alt="Couples" fill className="object-cover" priority /></div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">Features</span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Everything you need to find <span className="gradient-text-rose">love</span></h2>
            <p className="text-lg text-muted-foreground">Packed with features for genuine connections.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Heart, title: 'Smart Matching', desc: 'Our algorithm learns what you like to show you better matches over time.', color: 'rose' },
              { icon: Shield, title: 'Verified Profiles', desc: 'Every profile is reviewed for authenticity. Photo verification keeps the community safe.', color: 'blue' },
              { icon: MessageCircle, title: 'Real Conversations', desc: 'Start with icebreakers, share moments, and build real connections.', color: 'purple' },
              { icon: MapPin, title: 'Local Discovery', desc: 'Find matches near you. Set your distance preferences and discover people in your area.', color: 'amber' },
              { icon: Camera, title: 'Photo Stories', desc: 'Share your day through photos. Stories let your personality shine beyond your profile.', color: 'emerald' },
              { icon: Zap, title: 'Instant Notifications', desc: 'Never miss a match or message. Get notified instantly when someone likes you.', color: 'orange' },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="rounded-xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className={`mb-4 inline-flex rounded-xl p-3 ${f.color === 'rose' ? 'bg-rose-50 text-rose-600' : f.color === 'blue' ? 'bg-blue-50 text-blue-600' : f.color === 'purple' ? 'bg-purple-50 text-purple-600' : f.color === 'amber' ? 'bg-amber-50 text-amber-600' : f.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}><f.icon className="h-6 w-6" /></div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">How It Works</span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Your journey to <span className="gradient-text-rose">love</span></h2>
            <p className="text-lg text-muted-foreground">Four simple steps to finding your perfect match.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {['Create Your Profile|Sign up, upload photos, and tell the world about yourself.', 'Discover & Swipe|Browse profiles of people near you. Like someone? Swipe right.', 'Match & Connect|When you both like each other, it\'s a match! Start chatting.', 'Build Your Story|Share moments, plan dates, and build something real together.'].map((s, i) => {
              const [title, desc] = s.split('|')
              return (
                <FadeIn key={i} delay={i * 0.15}>
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-xl font-bold text-white shadow-lg">0{i + 1}</div>
                    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">Love Stories</span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Real <span className="gradient-text-rose">stories</span>, real love</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { names: 'Sarah & James', loc: 'New York', text: 'We both swiped right on a Tuesday and have been inseparable ever since. Amori\'s matching algorithm really understands compatibility.' },
              { names: 'Emma & Liam', loc: 'London', text: 'After trying several dating apps, Amori felt different. The profiles felt genuine and the conversations flowed naturally from day one.' },
              { names: 'Mia & Carlos', loc: 'Barcelona', text: 'Amori brought us together when we were both about to give up on dating. Now we\'re planning our wedding. Thank you, Amori!' },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex gap-0.5">{Array(5).fill(0).map((_, j) => <span key={j} className="text-amber-400">★</span>)}</div>
                  <p className="mb-6 text-sm text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-sm font-semibold text-white">{t.names.split(' & ').map((n: string) => n[0]).join('')}</div>
                    <div><div className="text-sm font-semibold">{t.names}</div><div className="text-xs text-muted-foreground">{t.loc}</div></div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 p-12 text-center text-white sm:p-16">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20"><Heart className="h-8 w-8" /></div>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">Your person is out there</h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">Join thousands who have already found their match. Your love story starts with one click.</p>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-rose-600 font-medium hover:bg-white/90 transition">Get Started Free <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2"><Image src="/logo.png" alt="Amori" width={28} height={28} className="object-contain" /><span className="text-lg font-bold gradient-text-rose">Amori</span></Link>
              <p className="mt-3 text-sm text-muted-foreground">Connecting hearts, building relationships.</p>
            </div>
            <div><h4 className="mb-3 text-sm font-semibold">Product</h4><ul className="space-y-2 text-sm text-muted-foreground"><li><Link href="/discover" className="hover:text-foreground">Discover</Link></li><li><Link href="/matches" className="hover:text-foreground">Matches</Link></li><li><Link href="/premium" className="hover:text-foreground">Premium</Link></li></ul></div>
            <div><h4 className="mb-3 text-sm font-semibold">Company</h4><ul className="space-y-2 text-sm text-muted-foreground"><li><a href="#" className="hover:text-foreground">About</a></li><li><a href="#" className="hover:text-foreground">Blog</a></li><li><a href="#" className="hover:text-foreground">Careers</a></li></ul></div>
            <div><h4 className="mb-3 text-sm font-semibold">Legal</h4><ul className="space-y-2 text-sm text-muted-foreground"><li><a href="#" className="hover:text-foreground">Privacy</a></li><li><a href="#" className="hover:text-foreground">Terms</a></li><li><a href="#" className="hover:text-foreground">Safety</a></li></ul></div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">© 2026 Amori. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
