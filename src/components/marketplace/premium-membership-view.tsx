'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, CheckCircle2, X, Star, Sparkles, Zap, Shield, Users, MessageCircle, Award, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

const TIERS = [
  {
    id: 'silver' as const,
    name: 'Silver',
    price: 4.99,
    color: 'from-gray-400 to-gray-500',
    bgLight: 'bg-gray-50',
    textColor: 'text-gray-700',
    icon: '🥈',
    features: [
      { text: 'Full AI Tutor access', included: true },
      { text: '50 practice questions/month', included: true },
      { text: 'Community posting', included: true },
      { text: 'Basic progress tracking', included: true },
      { text: 'Unlimited practice questions', included: false },
      { text: 'Priority support', included: false },
      { text: 'Certificate generation', included: false },
      { text: 'Advanced analytics tools', included: false },
      { text: '1-on-1 mentoring simulation', included: false },
      { text: 'Custom learning paths', included: false },
      { text: 'Early access to new features', included: false },
      { text: 'Certificate verification', included: false },
    ],
  },
  {
    id: 'gold' as const,
    name: 'Gold',
    price: 9.99,
    color: 'from-amber-400 to-yellow-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: '🥇',
    popular: true,
    features: [
      { text: 'Full AI Tutor access', included: true },
      { text: 'Unlimited practice questions', included: true },
      { text: 'Community posting', included: true },
      { text: 'Advanced progress tracking', included: true },
      { text: 'Priority support', included: true },
      { text: 'Certificate generation', included: true },
      { text: 'Advanced analytics tools', included: true },
      { text: '1-on-1 mentoring simulation', included: false },
      { text: 'Custom learning paths', included: false },
      { text: 'Early access to new features', included: false },
      { text: 'Certificate verification', included: false },
    ],
  },
  {
    id: 'platinum' as const,
    name: 'Platinum',
    price: 19.99,
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-700',
    icon: '💎',
    features: [
      { text: 'Full AI Tutor access', included: true },
      { text: 'Unlimited practice questions', included: true },
      { text: 'Community posting', included: true },
      { text: 'Advanced progress tracking', included: true },
      { text: 'Priority support', included: true },
      { text: 'Certificate generation', included: true },
      { text: 'Advanced analytics tools', included: true },
      { text: '1-on-1 mentoring simulation', included: true },
      { text: 'Custom learning paths', included: true },
      { text: 'Early access to new features', included: true },
      { text: 'Certificate verification', included: true },
    ],
  },
];

const TESTIMONIALS = [
  { name: 'Alex M.', role: 'Data Analyst at Google', text: 'The Gold plan completely transformed my learning experience. The AI tutor alone is worth 10x the price!', rating: 5 },
  { name: 'Sarah K.', role: 'BI Developer at Microsoft', text: 'Platinum mentoring simulation helped me prepare for real interviews. Landed my dream job in 3 months!', rating: 5 },
  { name: 'James T.', role: 'Data Scientist at Netflix', text: 'Started with Silver, upgraded to Gold after a week. The unlimited practice and certificates are game-changers.', rating: 4 },
];

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription at any time. You will continue to have access until the end of your current billing period.' },
  { q: 'Is there a free trial?', a: 'Yes, all plans come with a 7-day free trial. No credit card required to start.' },
  { q: 'Can I switch plans?', a: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and Apple Pay through our secure payment processor.' },
  { q: 'Are there any hidden fees?', a: 'No hidden fees whatsoever. The price you see is the price you pay. All features listed are included.' },
];

export default function PremiumMembershipView() {
  const store = useProgressStore();
  const currentTier = store.premiumTier || 'free';
  const setPremiumTier = store.setPremiumTier;

  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async (tierId: string) => {
    setIsProcessing(true);
    // Simulate checkout
    await new Promise(r => setTimeout(r, 1500));
    setPremiumTier(tierId as 'free' | 'silver' | 'gold' | 'platinum');
    setSelectedTier(null);
    setIsProcessing(false);
  };

  const currentTierData = TIERS.find(t => t.id === currentTier);

  const featureRows = [
    'AI Tutor access',
    'Practice questions/month',
    'Community posting',
    'Priority support',
    'Certificate generation',
    'Advanced analytics tools',
    'Mentoring simulation',
    'Custom learning paths',
    'Early access',
    'Certificate verification',
  ];

  const getFeatureValue = (tierId: string, feature: string) => {
    const tier = TIERS.find(t => t.id === tierId);
    if (!tier) return { text: '—', included: false };
    const feat = tier.features.find(f => f.text.toLowerCase().includes(feature.toLowerCase().split('/')[0]));
    if (!feat) return { text: '—', included: false };
    if (feat.included) return { text: '✓', included: true };
    return { text: '✗', included: false };
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto shadow-lg">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Unlock Premium</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Supercharge your learning with exclusive features, unlimited access, and personalized support.
          </p>
        </div>
        {currentTier !== 'free' && currentTierData && (
          <Badge className={cn('px-4 py-1 text-sm', currentTierData.bgLight, currentTierData.textColor)}>
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            Currently on {currentTierData.name} Plan — ${currentTierData.price}/mo
          </Badge>
        )}
      </motion.div>

      {/* Progress bar */}
      {currentTier === 'free' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">What you&apos;d unlock</span>
                <span className="text-sm text-muted-foreground">Start from $4.99/mo</span>
              </div>
              <Progress value={15} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Free</span>
                <span>Gold</span>
                <span>Platinum</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier, i) => {
          const isActive = currentTier === tier.id;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'relative rounded-2xl border-2 overflow-hidden transition-shadow',
                tier.popular ? 'border-amber-400 shadow-lg shadow-amber-100/50 dark:shadow-amber-900/20' : isActive ? 'border-emerald-400' : 'border-transparent hover:border-muted',
              )}
            >
              {tier.popular && (
                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-center text-xs font-bold py-1.5">
                  <Sparkles className="w-3 h-3 inline mr-1" /> MOST POPULAR
                </div>
              )}
              <Card className="border-0 shadow-none">
                <CardHeader className={cn('pb-2', tier.popular && 'pt-8')}>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{tier.icon}</span>
                    {isActive && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {tier.features.map(f => (
                      <div key={f.text} className="flex items-center gap-2 text-sm">
                        {f.included ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={cn(!f.included && 'text-muted-foreground/50')}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => isActive ? null : setSelectedTier(tier.id)}
                    className={cn(
                      'w-full',
                      isActive
                        ? 'bg-muted text-muted-foreground'
                        : cn('bg-gradient-to-r', tier.color, 'text-white hover:opacity-90')
                    )}
                    disabled={isActive || isProcessing}
                  >
                    {isProcessing && selectedTier === tier.id ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                    ) : isActive ? (
                      'Current Plan'
                    ) : (
                      <><Zap className="w-4 h-4 mr-2" />Subscribe Now</>
                    )}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground">7-day free trial · Cancel anytime</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="text-center space-y-3">
        <Button variant="outline" onClick={() => setShowComparison(!showComparison)}>
          {showComparison ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
          {showComparison ? 'Hide' : 'Show'} Full Feature Comparison
        </Button>
        <AnimatePresence>
          {showComparison && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <Card>
                <CardContent className="p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-3 pr-4 font-medium">Feature</th>
                        <th className="text-center py-3 px-3 font-medium">Silver</th>
                        <th className="text-center py-3 px-3 font-medium bg-amber-50 dark:bg-amber-950/20 rounded-t-lg">Gold</th>
                        <th className="text-center py-3 px-3 font-medium">Platinum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featureRows.map((feature, i) => (
                        <tr key={feature} className={cn(i % 2 === 0 && 'bg-muted/30')}>
                          <td className="py-2.5 pr-4 text-left">{feature}</td>
                          {['silver', 'gold', 'platinum'].map(tid => {
                            const val = getFeatureValue(tid, feature);
                            return (
                              <td key={tid} className="text-center py-2.5 px-3">
                                {val.included ? (
                                  <span className="text-emerald-500 font-bold">{val.text}</span>
                                ) : (
                                  <span className="text-muted-foreground/40">{val.text}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Testimonials */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center">Loved by Learners</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={cn('w-3.5 h-3.5', j < t.rating ? 'text-amber-500 fill-amber-500' : 'text-muted')} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-2">
          {FAQS.map((faq, i) => (
            <Card key={i}>
              <button
                className="w-full p-4 text-left flex items-center justify-between"
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <span className="font-medium text-sm">{faq.q}</span>
                {expandedFaq === i ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
              </button>
              <AnimatePresence>
                {expandedFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </div>

      {/* Subscribe Dialog */}
      {selectedTier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTier(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="bg-background rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">Subscribe to {TIERS.find(t => t.id === selectedTier)?.name} — ${TIERS.find(t => t.id === selectedTier)?.price}/mo</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-muted/50">
              <p>🔒 Payment is secure and encrypted</p>
              <p>✅ 7-day free trial included</p>
              <p>💳 Cancel anytime from settings</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedTier(null)} className="flex-1">Cancel</Button>
              <Button
                onClick={() => handleSubscribe(selectedTier)}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Crown className="w-4 h-4 mr-2" />Confirm</>}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
