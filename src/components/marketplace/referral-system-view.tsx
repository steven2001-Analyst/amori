'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, CheckCircle2, Share2, ExternalLink, Users, MousePointerClick, UserPlus, DollarSign, Trophy, Clock, AlertTriangle, ChevronRight, Twitter, Linkedin, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

const MILESTONES = [
  { referrals: 5, reward: 10, label: '5 referrals', icon: '🎁' },
  { referrals: 10, reward: 25, label: '10 referrals', icon: '🎊' },
  { referrals: 25, reward: 50, label: '25 referrals', icon: '🏆' },
  { referrals: 50, reward: 100, label: '50 referrals', icon: '👑' },
];

const LEADERBOARD = [
  { name: 'Alex Chen', referrals: 47, earnings: 235, avatar: 'AC' },
  { name: 'Sarah Kim', referrals: 38, earnings: 190, avatar: 'SK' },
  { name: 'David Lee', referrals: 31, earnings: 155, avatar: 'DL' },
  { name: 'Priya Patel', referrals: 24, earnings: 120, avatar: 'PP' },
  { name: 'Mike Johnson', referrals: 18, earnings: 90, avatar: 'MJ' },
  { name: 'You', referrals: 0, earnings: 0, avatar: 'Y', isUser: true },
];

const STEPS = [
  { num: '1', title: 'Share Your Link', desc: 'Copy your unique referral link and share it with friends, colleagues, or on social media.' },
  { num: '2', title: 'They Sign Up', desc: 'When someone signs up using your link, they get a 7-day free trial of Gold membership.' },
  { num: '3', title: 'You Earn $5', desc: 'When your referral subscribes to any paid plan, you earn $5 credited to your account.' },
];

export default function ReferralSystemView() {
  const store = useProgressStore();
  const referralCode = store.referralCode || 'DT-DEFAULT';
  const referralStats = store.referralStats || { clicks: 0, signups: 0, conversions: 0, earnings: 0 };
  const addReferralClick = store.addReferralClick;

  const [copied, setCopied] = useState(false);
  const [showTc, setShowTc] = useState(false);

  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${referralCode}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      addReferralClick();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const totalReferrals = referralStats.conversions;
  const currentMilestone = MILESTONES.filter(m => m.referrals <= totalReferrals).pop();
  const nextMilestone = MILESTONES.find(m => m.referrals > totalReferrals);
  const progressToNext = nextMilestone ? (totalReferrals / nextMilestone.referrals) * 100 : 100;

  const shareOnTwitter = () => {
    const text = `I'm learning data analytics on DataTrack Pro! Use my referral link to get a 7-day free trial: ${referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareOnEmail = () => {
    window.open(`mailto:?subject=Join DataTrack Pro&body=${encodeURIComponent(`Hey! I've been using DataTrack Pro to learn data analytics and it's amazing. Sign up with my referral link for a 7-day free trial: ${referralLink}`)}`, '_blank');
  };

  const avatarColors = ['from-emerald-400 to-teal-500', 'from-blue-400 to-indigo-500', 'from-purple-400 to-violet-500', 'from-pink-400 to-rose-500', 'from-amber-400 to-orange-500', 'from-cyan-400 to-teal-500'];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Refer & Earn</h1>
          <p className="text-sm text-muted-foreground">Earn $5 for every friend who subscribes</p>
        </div>
      </motion.div>

      {/* Referral Code & Link */}
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100">Your Referral Code</p>
              <p className="text-2xl font-bold font-mono tracking-wider">{referralCode}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-100">Earnings</p>
              <p className="text-2xl font-bold">${referralStats.earnings.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 font-mono text-sm truncate">
              {referralLink}
            </div>
            <Button
              onClick={handleCopy}
              variant="secondary"
              className="bg-white text-emerald-700 hover:bg-white/90 shrink-0"
            >
              {copied ? <><CheckCircle2 className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: MousePointerClick, label: 'Total Clicks', value: referralStats.clicks, color: 'text-blue-500' },
          { icon: UserPlus, label: 'Signups', value: referralStats.signups, color: 'text-emerald-500' },
          { icon: CheckCircle2, label: 'Conversions', value: referralStats.conversions, color: 'text-amber-500' },
          { icon: DollarSign, label: 'Earned', value: `$${referralStats.earnings.toFixed(2)}`, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <stat.icon className={cn('w-6 h-6 mx-auto mb-2', stat.color)} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Milestone Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Referral Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentMilestone && (
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <Star className="w-3 h-3 mr-1" />Earned ${currentMilestone.reward} at {currentMilestone.label}!
              </Badge>
            </div>
          )}
          {nextMilestone && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Next: <strong>{nextMilestone.label}</strong> → ${nextMilestone.reward} reward</span>
                <span className="text-muted-foreground">{totalReferrals}/{nextMilestone.referrals}</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MILESTONES.map(m => {
              const isUnlocked = totalReferrals >= m.referrals;
              return (
                <div key={m.label} className={cn(
                  'p-3 rounded-xl border text-center transition-all',
                  isUnlocked ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-muted/30',
                )}>
                  <span className="text-2xl">{m.icon}</span>
                  <p className="text-xs font-medium mt-1">{m.label}</p>
                  <p className={cn('text-xs font-bold', isUnlocked ? 'text-emerald-600' : 'text-muted-foreground')}>${m.reward}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto text-white font-bold text-xl shadow-lg">
                    {step.num}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Share on Social */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Share2 className="w-5 h-5" /> Share on Social Media</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={shareOnTwitter} className="gap-2">
              <Twitter className="w-4 h-4" /> Twitter
            </Button>
            <Button variant="outline" onClick={shareOnLinkedIn} className="gap-2">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </Button>
            <Button variant="outline" onClick={shareOnEmail} className="gap-2">
              <Mail className="w-4 h-4" /> Email
            </Button>
            <Button variant="outline" onClick={() => window.open(referralLink, '_blank')} className="gap-2">
              <ExternalLink className="w-4 h-4" /> Open Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Top Referrers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LEADERBOARD.map((user, i) => (
            <motion.div
              key={user.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-colors',
                user.isUser ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'hover:bg-muted/50',
              )}
            >
              <span className="text-lg font-bold w-8 text-center text-muted-foreground">{i + 1}</span>
              <div className={cn(
                'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shrink-0',
                avatarColors[i % avatarColors.length],
              )}>
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium truncate', user.isUser && 'text-emerald-700')}>{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.referrals} referrals</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">${user.earnings}</p>
                <p className="text-[10px] text-muted-foreground">earned</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Terms */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <button className="w-full flex items-center justify-between text-sm font-medium" onClick={() => setShowTc(!showTc)}>
            <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Terms & Conditions</span>
            {showTc ? <ChevronRight className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {showTc && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-3 text-xs text-muted-foreground space-y-2">
                  <p>• Referral earnings are credited when the referred user subscribes to a paid plan after a 7-day free trial period.</p>
                  <p>• Minimum account age of 30 days required to participate in the referral program.</p>
                  <p>• Referral codes are non-transferable and unique to each user.</p>
                  <p>• Earnings are paid out monthly via your preferred payment method when the balance exceeds $25.</p>
                  <p>• DataTrack Pro reserves the right to modify the referral program terms at any time.</p>
                  <p>• Fraudulent referrals (self-referrals, duplicate accounts, etc.) will result in disqualification.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
