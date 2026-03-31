'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  Sparkles,
  Shield,
  MessageCircle,
  Star,
  ArrowRight,
  Menu,
  X,
  MapPin,
  Zap,
  Camera,
} from 'lucide-react'

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image src="/logo.png" alt="Amori" fill className="object-contain" />
          </div>
          <span className="text-xl font-bold gradient-text-rose">Amori</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">How It Works</a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Stories</a>
          <Link href="/premium" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Premium</Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="ghost" className="text-sm">Log In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 text-sm">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="h-9 w-9">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <div className="space-y-1 px-4 py-4">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">How It Works</a>
            <a href="#testimonials" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">Stories</a>
            <Link href="/premium" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">Premium</Link>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full text-sm">Log In</Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 text-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}

function HeroSection() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const y = useTransform(scrollY, [0, 300], [0, 60])

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-orange-950/30" />
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-800/20" />
      <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl dark:bg-pink-800/20" />
      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/30 blur-3xl dark:bg-orange-800/20" />

      <motion.div style={{ opacity, y }} className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge variant="secondary" className="mb-6 gap-1.5 border-rose-200 bg-rose-50 px-4 py-1.5 text-rose-600 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
            <Sparkles className="h-3.5 w-3.5" />
            Find meaningful connections
          </Badge>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Where Real{' '}
          <span className="gradient-text-rose">Love Stories</span>{' '}
          Begin
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Amori connects you with people who truly match your vibe. Smart matching, genuine profiles, and a community built for real relationships.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col gap-4 sm:flex-row">
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-rose-500 to-pink-500 px-8 text-white hover:from-rose-600 hover:to-pink-600 h-12 text-base">
              Find Your Match <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">Learn More</Button>
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-16 flex items-center gap-8 text-sm text-muted-foreground">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">50K+</div>
            <div>Active Users</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">12K+</div>
            <div>Matches Made</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">4.8★</div>
            <div>App Rating</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="mt-12 w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl">
          <div className="relative aspect-[16/9]">
            <Image src="/hero-bg.png" alt="Couples enjoying life together" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

const features = [
  { icon: Heart, title: 'Smart Matching', description: 'Our algorithm learns what you like to show you better matches over time.', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' },
  { icon: Shield, title: 'Verified Profiles', description: 'Every profile is reviewed for authenticity. Photo verification keeps the community safe.', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
  { icon: MessageCircle, title: 'Real Conversations', description: 'Start with icebreakers, share moments, and build real connections.', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400' },
  { icon: MapPin, title: 'Local Discovery', description: 'Find matches near you. Set your distance preferences and discover people in your area.', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  { icon: Camera, title: 'Photo Stories', description: 'Share your day through photos. Stories let your personality shine beyond your profile.', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { icon: Zap, title: 'Instant Notifications', description: 'Never miss a match or message. Get notified instantly when someone likes you.', color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400' },
]

function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">Features</Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to find <span className="gradient-text-rose">love</span>
          </h2>
          <p className="text-lg text-muted-foreground">Amori is packed with features designed to help you build genuine connections.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Card className="group h-full border-border/50 transition-all duration-300 hover:-translate-y-1 hover:border-rose-200/50 hover:shadow-lg hover:shadow-rose-100/50 dark:hover:border-rose-800/50 dark:hover:shadow-rose-950/50">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex rounded-xl p-3 ${f.color}`}><f.icon className="h-6 w-6" /></div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const steps = [
  { step: '01', title: 'Create Your Profile', description: "Sign up, upload your best photos, and tell the world about yourself. Be authentic." },
  { step: '02', title: 'Discover & Swipe', description: "Browse through curated profiles of people near you. Like someone? Swipe right." },
  { step: '03', title: 'Match & Connect', description: "When you both like each other, it's a match! Start chatting and see where it goes." },
  { step: '04', title: 'Build Your Story', description: "Share moments, plan dates, and build something real together." },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">How It Works</Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Your journey to <span className="gradient-text-rose">love</span>
          </h2>
          <p className="text-lg text-muted-foreground">Four simple steps to finding your perfect match.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-xl font-bold text-white shadow-lg shadow-rose-200/50 dark:shadow-rose-900/50">{s.step}</div>
              <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const testimonials = [
  { name: 'Sarah & James', location: 'New York', text: "We both swiped right on a Tuesday and have been inseparable ever since. Amori's matching algorithm really understands compatibility.", initials: 'SJ' },
  { name: 'Emma & Liam', location: 'London', text: "After trying several dating apps, Amori felt different. The profiles felt genuine and the conversations flowed naturally from day one.", initials: 'EL' },
  { name: 'Mia & Carlos', location: 'Barcelona', text: "Amori brought us together when we were both about to give up on dating. Now we're planning our wedding. Thank you, Amori!", initials: 'MC' },
]

function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">Love Stories</Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Real <span className="gradient-text-rose">stories</span>, real love
          </h2>
          <p className="text-lg text-muted-foreground">Hear from couples who found their match on Amori.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Card className="h-full border-border/50">
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => (<Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />))}</div>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-sm font-semibold text-white">{t.initials}</div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 p-12 text-center text-white sm:p-16 md:p-20">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Heart className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">Your person is out there</h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">Join thousands of people who have already found their match on Amori. Your love story starts with one click.</p>
          <Link href="/register">
            <Button size="lg" className="bg-white px-8 text-rose-600 hover:bg-white/90 h-12 text-base shadow-lg">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-7 w-7"><Image src="/logo.png" alt="Amori" fill className="object-contain" /></div>
              <span className="text-lg font-bold gradient-text-rose">Amori</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">Connecting hearts, building relationships. Find your perfect match today.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/discover" className="hover:text-foreground transition-colors">Discover</Link></li>
              <li><Link href="/matches" className="hover:text-foreground transition-colors">Matches</Link></li>
              <li><Link href="/premium" className="hover:text-foreground transition-colors">Premium</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Safety</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Amori. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingView() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
