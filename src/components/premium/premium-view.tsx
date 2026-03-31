'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Crown,
  Heart,
  Sparkles,
  Infinity,
  Eye,
  Filter,
  Zap,
  Shield,
  ArrowRight,
  Check,
} from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      { text: '25 swipes per day', included: true },
      { text: 'Basic matching', included: true },
      { text: 'Text messaging', included: true },
      { text: 'Unlimited swipes', included: false },
      { text: 'See who liked you', included: false },
      { text: 'Advanced filters', included: false },
      { text: 'Profile boost', included: false },
    ],
    cta: 'Current Plan',
    highlighted: false,
    disabled: true,
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    description: 'Everything you need for more matches',
    features: [
      { text: 'Unlimited swipes', included: true },
      { text: 'Smart matching', included: true },
      { text: 'All message types', included: true },
      { text: 'See who liked you', included: true },
      { text: 'Advanced filters', included: true },
      { text: '1 profile boost/month', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Upgrade to Premium',
    highlighted: true,
    disabled: false,
  },
  {
    name: 'Platinum',
    price: '$19.99',
    period: '/month',
    description: 'The ultimate dating experience',
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'Unlimited boosts', included: true },
      { text: 'See who viewed you', included: true },
      { text: 'Incognito mode', included: true },
      { text: 'Travel mode', included: true },
      { text: 'Priority listing', included: true },
      { text: '24/7 priority support', included: true },
    ],
    cta: 'Go Platinum',
    highlighted: false,
    disabled: false,
  },
]

const perks = [
  { icon: Infinity, title: 'Unlimited Swipes', description: 'Never worry about daily limits again. Swipe as much as you want.' },
  { icon: Eye, title: 'See Who Liked You', description: 'Know who already showed interest before you swipe.' },
  { icon: Filter, title: 'Advanced Filters', description: 'Filter by height, education, lifestyle, and more.' },
  { icon: Zap, title: 'Profile Boost', description: 'Get your profile seen by more people for 30 minutes.' },
  { icon: Shield, title: 'Incognito Mode', description: 'Browse profiles without being seen.' },
  { icon: Sparkles, title: 'Smart Picks', description: 'AI-powered daily picks based on your preferences.' },
]

export default function PremiumPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/50">
          <Crown className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">Find love faster with <span className="gradient-text-rose">Premium</span></h1>
        <p className="mt-2 text-muted-foreground">Upgrade your experience and get more matches</p>
      </div>

      {/* Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'relative overflow-hidden transition-all',
              plan.highlighted
                ? 'border-rose-200 shadow-lg shadow-rose-100/50 dark:border-rose-800 dark:shadow-rose-950/50 scale-[1.02]'
                : 'border-border/50'
            )}
          >
            {plan.highlighted && (
              <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
            )}
            <CardContent className="p-6">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-2">
                    <Check className={cn('h-4 w-4 shrink-0', feature.included ? 'text-green-500' : 'text-muted-foreground/30')} />
                    <span className={cn('text-sm', !feature.included && 'text-muted-foreground/50')}>{feature.text}</span>
                  </div>
                ))}
              </div>

              <Button
                className={cn(
                  'mt-6 w-full',
                  plan.highlighted
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600'
                    : plan.disabled
                    ? ''
                    : 'bg-background border hover:bg-accent',
                  plan.disabled && 'opacity-50 cursor-default'
                )}
                disabled={plan.disabled}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Perks */}
      <div>
        <h2 className="mb-6 text-center text-xl font-bold">Why go Premium?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {perks.map((perk) => (
            <Card key={perk.title} className="border-border/50">
              <CardContent className="p-5">
                <div className="mb-3 inline-flex rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <perk.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{perk.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{perk.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-muted-foreground">Questions? Check our FAQ or contact support.</p>
        <Link href="/discover">
          <Button variant="outline" className="mt-4">
            Back to Discover <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
