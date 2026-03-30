'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Download, Calendar, CheckCircle2, AlertTriangle, ChevronRight,
  Crown, Sparkles, Building2, Eye, EyeOff, Shield, Receipt, Clock, ArrowRight,
  BarChart3, MapPin, FileText, Gift, Tag, RefreshCw, Copy, Check, X,
  Bell, Zap, BookOpen, Bot, Users, Infinity, Star, ChevronDown, Percent, History, Loader2, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ─── Types & Data ─── */
interface BillingRecord {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
}

const billingHistory: BillingRecord[] = [];

const spendingData: { month: string; amount: number }[] = [];

interface PlanFeature {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  team: string | boolean;
}

const planFeatures: PlanFeature[] = [
  { name: 'Study Path (8 Subjects)', free: true, pro: true, team: true },
  { name: 'Daily Challenges', free: '3/day', pro: 'Unlimited', team: 'Unlimited' },
  { name: 'Practice Exercises', free: 'Basic', pro: 'All', team: 'All + Custom' },
  { name: 'Books Library', free: 'Previews', pro: 'Full Access', team: 'Full Access' },
  { name: 'AI Study Assistant', free: '5 msgs/min', pro: 'Unlimited', team: 'Unlimited' },
  { name: 'Flashcards & Notes', free: '50 cards', pro: 'Unlimited', team: 'Unlimited' },
  { name: 'Certificate Generation', free: false, pro: true, team: true },
  { name: 'Community Chat', free: 'Read-only', pro: 'Full', team: 'Full + Private' },
  { name: 'Advanced Developer Tools', free: false, pro: true, team: true },
  { name: 'Project Portfolio', free: '3 projects', pro: 'Unlimited', team: 'Unlimited' },
  { name: 'Video Resources', free: 'Free only', pro: 'All', team: 'All' },
  { name: 'Payment & Billing', free: false, pro: false, team: true },
  { name: 'Admin Panel Access', free: false, pro: false, team: false },
  { name: 'Priority Support', free: false, pro: 'Email', team: 'Email + Chat' },
  { name: 'Team Management', free: false, pro: false, team: true },
  { name: 'Custom Branding', free: false, pro: false, team: true },
];

const plans = [
  { id: 'free', name: 'Free', price: '$0', period: '/forever', icon: Sparkles, gradient: 'from-emerald-500 to-teal-500' },
  { id: 'pro', name: 'Pro', price: '$9.99', period: '/month', icon: Crown, gradient: 'from-amber-400 to-orange-500', popular: true },
  { id: 'team', name: 'Team', price: '$24.99', period: '/month', icon: Building2, gradient: 'from-rose-400 to-pink-500' },
];

const savedCards: { id: string; type: string; last4: string; expiry: string; default: boolean }[] = [];

const billingAlerts: { id: string; type: string; title: string; message: string; time: string; icon: React.ElementType; color: string }[] = [];

const PROMO_CODES: Record<string, { discount: number; label: string; description: string; maxUses: number; expires?: string; plan?: 'free' | 'pro' | 'team' }> = {
  'WELCOME20': { discount: 20, label: '20% OFF', description: 'Welcome discount for new members', maxUses: 1, plan: 'pro' },
  'STUDENT50': { discount: 50, label: '50% OFF', description: 'Special student discount — limited time!', maxUses: 1, plan: 'pro' },
  'SAVE10': { discount: 10, label: '10% OFF', description: 'Save 10% on any plan', maxUses: 999 },
  'TEAM25': { discount: 25, label: '25% OFF', description: 'Team plan discount', maxUses: 5, plan: 'team' },
  'DATATRACK30': { discount: 30, label: '30% OFF', description: 'Exclusive DataTrack community discount', maxUses: 100 },
  'FREE6MONTHS': { discount: 100, label: '6 Months Free', description: '6 months free trial on annual plan', maxUses: 1, plan: 'pro' },
  'REFER15': { discount: 15, label: '15% OFF', description: 'Referral program discount', maxUses: 10 },
};

/* ─── Feature Cell ─── */
function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) return <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

/* ─── Main Component ─── */
export default function PaymentSettingsView() {
  const { subscriptionPlan, subscriptionStatus, setSubscriptionPlan } = useProgressStore();
  const [currentPlan] = useState(subscriptionPlan || 'pro');
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoHistory, setPromoHistory] = useState<Array<{ code: string; discount: number; appliedAt: string }>>([]);
  const [showPromoHints, setShowPromoHints] = useState(false);
  const [referralCode] = useState('DATATRACK-7X4K');
  const [referralCopied, setReferralCopied] = useState(false);
  const [billingAlertDismissed, setBillingAlertDismissed] = useState<Set<string>>(new Set());
  const [stripeLoading, setStripeLoading] = useState(false);

  const currentPlanData = plans.find((p) => p.id === currentPlan) || plans[0];

  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  const maskCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 16);
    return limited.replace(/(.{4})/g, '$1 ').trim();
  };

  const maskExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    return digits;
  };

  const handleDownloadInvoice = (invoice: BillingRecord) => {
    const receipt = `
╔══════════════════════════════════════════╗
║          DATATRACK PRO - INVOICE         ║
╠══════════════════════════════════════════╣
║ Invoice: ${invoice.id.padEnd(32)}║
║ Date: ${invoice.date.padEnd(35)}║
║ Status: ${invoice.status.toUpperCase().padEnd(31)}║
║                                          ║
║ Plan: ${invoice.plan.padEnd(35)}║
║ Amount: ${invoice.amount.padEnd(33)}║
║                                          ║
║ Card: **** **** **** ****                ║
║                                          ║
║ Thank you for using DataTrack Pro!       ║
╚══════════════════════════════════════════╝`;
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Invoice ${invoice.id} downloaded`);
  };

  const handleUpdatePayment = () => {
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid card number');
      return;
    }
    if (!cardName.trim()) { toast.error('Please enter the cardholder name'); return; }
    if (!cardExpiry.trim() || cardExpiry.length < 5) { toast.error('Please enter a valid expiry date'); return; }
    if (!cardCvv.trim() || cardCvv.length < 3) { toast.error('Please enter a valid CVV'); return; }
    toast.success('Payment method updated successfully');
    setShowUpdatePayment(false);
    setCardNumber(''); setCardName(''); setCardExpiry(''); setCardCvv('');
  };

  const handleCancelSubscription = () => {
    toast.success('Subscription cancelled. You will retain access until the end of your billing period.');
    setShowCancelDialog(false);
  };

  const [processingPayment, setProcessingPayment] = useState(false);

  const handleChangePlan = async (planId: string) => {
    if (planId === currentPlan) { toast.info('You are already on this plan'); return; }
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    // Show processing state
    setProcessingPayment(true);

    // Process payment
    await new Promise(r => setTimeout(r, 800));

    const success = Math.random() > 0.1;

    if (success) {
      // Add payment record and auto-activate
      const store = useProgressStore.getState();
      store.addPaymentRecord({
        plan: planId as 'free' | 'pro' | 'team',
        amount: planId === 'pro' ? 9.99 : planId === 'team' ? 24.99 : 0,
        currency: 'USD',
        status: 'verified',
        method: 'Visa',
        last4: '****',
      });

      setSubscriptionPlan(planId as 'free' | 'pro' | 'team');
      toast.success(`\u{1F389} Payment verified! Upgraded to ${plan?.name} plan. All features unlocked!`);
      setShowChangePlan(false);
    } else {
      toast.error('Payment verification failed. Please try again or use a different payment method.');
    }

    setProcessingPayment(false);
  };

  const handleStripeCheckout = async (planId: string) => {
    if (planId === currentPlan && planId !== 'free') {
      toast.info('You are already on this plan');
      return;
    }
    if (planId === 'free') {
      setSubscriptionPlan('free');
      toast.success('Switched to Free plan');
      setShowChangePlan(false);
      return;
    }

    setStripeLoading(true);

    try {
      const store = useProgressStore.getState();
      const email = store.profile?.email || store.loginEmail || '';

      if (!email) {
        toast.error('Please set your email in Profile settings before subscribing with Stripe.');
        setStripeLoading(false);
        return;
      }

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, email }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.assign(data.url);
      } else {
        toast.error(data.error || 'Failed to create checkout session');
        setStripeLoading(false);
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast.error('Something went wrong. Please try the Subscribe Now button instead.');
      setStripeLoading(false);
    }
  };

  const getDiscountedPrice = () => {
    const planPrices: Record<string, number> = { free: 0, pro: 9.99, team: 24.99 };
    const base = planPrices[currentPlan] || 0;
    if (promoApplied && promoDiscount > 0) {
      return promoDiscount >= 100 ? 0 : parseFloat((base * (1 - promoDiscount / 100)).toFixed(2));
    }
    return base;
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) { toast.error('Please enter a promo code'); return; }

    const promo = PROMO_CODES[code];
    if (!promo) {
      toast.error('Invalid promo code. Please check and try again.');
      return;
    }

    if (promo.plan && promo.plan !== currentPlan) {
      toast.error(`This code is only valid for the ${promo.plan.charAt(0).toUpperCase() + promo.plan.slice(1)} plan.`);
      return;
    }

    if (promo.expires && new Date(promo.expires) < new Date()) {
      toast.error('This promo code has expired.');
      return;
    }

    // Apply the promo
    setPromoApplied(code);
    setPromoDiscount(promo.discount);
    setPromoHistory(prev => [...prev, { code, discount: promo.discount, appliedAt: new Date().toLocaleString() }]);
    setPromoCode('');
    toast.success(`\u{1F389} ${promo.label} applied! ${promo.description}`);
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setPromoDiscount(0);
    toast.info('Promo code removed');
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setReferralCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const dismissAlert = (id: string) => {
    setBillingAlertDismissed(prev => new Set(prev).add(id));
  };

  const visibleAlerts = billingAlerts.filter(a => !billingAlertDismissed.has(a.id));

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Payment & Billing</h1>
          <p className="text-sm text-muted-foreground">Manage your subscription and payment methods</p>
        </div>
      </motion.div>

      {/* Payment Mode Status Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className={cn(
          'flex items-center gap-3 p-4 rounded-xl border',
          'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
        )}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">Payment Mode: Demo</h4>
              <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 font-bold animate-pulse">DEMO MODE</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Stripe keys are not configured. Payments are simulated for demonstration purposes.{' '}
              <button onClick={() => document.getElementById('setup-guide')?.scrollIntoView({ behavior: 'smooth' })} className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                Set up Stripe &rarr;
              </button>
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Sandbox</span>
          </div>
        </div>
      </motion.div>

      {/* Billing Alerts */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {visibleAlerts.map(alert => {
              const Icon = alert.icon;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn('flex items-start gap-3 p-4 rounded-xl border', alert.color)}
                >
                  <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{alert.title}</h4>
                      <Badge variant="secondary" className="text-[10px]">{alert.time}</Badge>
                    </div>
                    <p className="text-xs mt-0.5 opacity-80">{alert.message}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 shrink-0" onClick={() => dismissAlert(alert.id)}>
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Current Plan + Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            <CardContent className="p-6 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center', currentPlanData.gradient)}>
                    <currentPlanData.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge className={cn('text-xs font-medium border-0',
                    currentPlan === 'pro' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : currentPlan === 'team' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  )}>
                    <CheckCircle2 className="w-3 h-3 mr-1" />Active
                  </Badge>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Current Plan</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {promoApplied ? `$${getDiscountedPrice().toFixed(2)}` : currentPlanData.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{currentPlanData.period}</span>
                    {promoApplied && (
                      <Badge className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">
                        {promoDiscount}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Next billing date</p>
                      <p className="font-medium">{nextBillingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Member since</p>
                      <p className="font-medium">October 1, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-muted-foreground text-xs">Billing security</p>
                      <p className="font-medium text-emerald-600 dark:text-emerald-400">256-bit SSL encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Dialog open={showChangePlan} onOpenChange={setShowChangePlan}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 rounded-xl border-border/50"><Sparkles className="w-4 h-4 mr-2" />Change Plan</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Change Your Plan</DialogTitle><DialogDescription>Select the plan that best fits your needs.</DialogDescription></DialogHeader>
                    <div className="space-y-3 py-4">
                      {plans.map((plan) => (
                        <motion.button key={plan.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => handleChangePlan(plan.id)}
                          className={cn('w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                            plan.id === currentPlan ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20' : 'border-border/50 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-muted/30'
                          )}>
                          <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', plan.gradient)}><plan.icon className="w-5 h-5 text-white" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{plan.name}</p>
                              {plan.id === currentPlan && <Badge className="text-[10px] bg-emerald-500 text-white border-0 h-4 px-1.5">Current</Badge>}
                              {'popular' in plan && plan.popular && <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 h-4 px-1.5">Popular</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{plan.price}{plan.period}</p>
                          </div>
                          {plan.id !== currentPlan && (
                              <motion.div whileTap={{ scale: 0.95 }} className="flex flex-col gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleStripeCheckout(plan.id); }}
                                  disabled={stripeLoading || processingPayment}
                                  className="gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white w-full"
                                >
                                  {stripeLoading ? (
                                    <><Loader2 className="w-3 h-3 animate-spin" />Redirecting...</>
                                  ) : (
                                    <><CreditCard className="w-3 h-3" />Subscribe with Stripe</>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => { e.stopPropagation(); handleChangePlan(plan.id); }}
                                  disabled={processingPayment || stripeLoading}
                                  className="gap-1.5 w-full text-xs"
                                >
                                  {processingPayment ? (
                                    <><Loader2 className="w-3 h-3 animate-spin" />Verifying...</>
                                  ) : (
                                    <><CreditCard className="w-3 h-3" />Subscribe Now (Demo)</>
                                  )}
                                </Button>
                              </motion.div>
                            )}
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 pt-1">
                      <Shield className="w-3 h-3" />
                      Secure payment powered by Stripe. Cancel anytime.
                    </p>
                  </DialogContent>
                </Dialog>
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <DialogTrigger asChild><Button variant="outline" className="flex-1 rounded-xl border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700">Cancel</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-rose-500" />Cancel Subscription</DialogTitle><DialogDescription>Are you sure you want to cancel?</DialogDescription></DialogHeader>
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 space-y-2">
                      <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">What happens when you cancel:</p>
                      <ul className="space-y-1.5 text-xs text-rose-600 dark:text-rose-400">
                        <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />You retain access until {nextBillingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</li>
                        <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />Your progress and achievements will be saved</li>
                        <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />You can resubscribe at any time</li>
                      </ul>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Subscription</Button>
                      <Button variant="destructive" onClick={handleCancelSubscription}>Yes, Cancel</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Method Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-4">
          <div className="relative">
            <motion.div initial={{ rotateY: -10 }} animate={{ rotateY: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="aspect-[1.6/1] w-full rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-emerald-900/30">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/90 flex items-center justify-center"><div className="w-5 h-3.5 bg-yellow-600/40 rounded-sm" /></div>
                  <span className="text-white/80 text-sm font-bold tracking-widest">VISA</span>
                </div>
                <div className="flex items-center gap-4 mb-8"><div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-amber-400 border border-yellow-500/30" /></div>
                <div className="font-mono text-white/90 text-lg tracking-[0.25em] mb-6">**** **** **** ****</div>
                <div className="flex items-end justify-between">
                  <div><p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">Card Holder</p><p className="text-white/90 text-sm font-medium tracking-wide">Your Name</p></div>
                  <div><p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">Expires</p><p className="text-white/90 text-sm font-medium">MM/YY</p></div>
                  <div className="flex flex-col items-end gap-1"><div className="w-6 h-6 rounded-full bg-red-500/80" /><div className="w-6 h-6 rounded-full bg-amber-500/60" /></div>
                </div>
              </div>
            </motion.div>
          </div>
          <Dialog open={showUpdatePayment} onOpenChange={setShowUpdatePayment}>
            <DialogTrigger asChild><Button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"><CreditCard className="w-4 h-4 mr-2" />Update Payment Method</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Update Payment Method</DialogTitle><DialogDescription>Enter your new payment details.</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label htmlFor="card-number">Card Number</Label><Input id="card-number" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(maskCardNumber(e.target.value))} className="font-mono" /></div>
                <div className="space-y-2"><Label htmlFor="card-name">Cardholder Name</Label><Input id="card-name" placeholder="Full name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="card-expiry">Expiry Date</Label><Input id="card-expiry" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(maskExpiry(e.target.value))} className="font-mono" /></div>
                  <div className="space-y-2"><Label htmlFor="card-cvv">CVV</Label><div className="relative"><Input id="card-cvv" placeholder="***" type={showCvv ? 'text' : 'password'} value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} className="font-mono pr-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCvv(!showCvv)}>{showCvv ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}</Button>
                  </div></div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowUpdatePayment(false)}>Cancel</Button>
                <Button onClick={handleUpdatePayment} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">Update Payment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      {/* Feature Comparison Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Plan Comparison
              </CardTitle>
              <Dialog open={showComparison} onOpenChange={setShowComparison}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs rounded-lg">
                    View Full Comparison
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Compare All Plans</DialogTitle>
                    <DialogDescription>Find the perfect plan for your data analytics journey.</DialogDescription>
                  </DialogHeader>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium">Feature</th>
                          <th className="text-center p-3 font-medium">
                            <div className="flex flex-col items-center gap-1">
                              <Sparkles className="w-4 h-4 text-emerald-500" />
                              <span>Free</span>
                              <span className="text-xs text-muted-foreground">$0</span>
                            </div>
                          </th>
                          <th className="text-center p-3 font-medium bg-amber-50 dark:bg-amber-950/10 rounded-t-lg">
                            <div className="flex flex-col items-center gap-1">
                              <Crown className="w-4 h-4 text-amber-500" />
                              <span>Pro</span>
                              <span className="text-xs text-muted-foreground">$9.99/mo</span>
                            </div>
                          </th>
                          <th className="text-center p-3 font-medium">
                            <div className="flex flex-col items-center gap-1">
                              <Building2 className="w-4 h-4 text-rose-500" />
                              <span>Team</span>
                              <span className="text-xs text-muted-foreground">$24.99/mo</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {planFeatures.map((feature, i) => (
                          <tr key={i} className={cn(
                            'hover:bg-muted/30 transition-colors',
                            feature.name.includes('Priority') && 'border-t-2 border-t-border'
                          )}>
                            <td className="p-3 text-xs">{feature.name}</td>
                            <td className="p-3 text-center">
                              <FeatureCell value={feature.free} />
                            </td>
                            <td className={cn('p-3 text-center', currentPlan === 'pro' && 'bg-emerald-50/50 dark:bg-emerald-950/5')}>
                              <FeatureCell value={feature.pro} />
                            </td>
                            <td className="p-3 text-center">
                              <FeatureCell value={feature.team} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setShowComparison(false)}>Close</Button>
                    <Button onClick={() => { setShowComparison(false); setShowChangePlan(true); }} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      <Sparkles className="w-4 h-4 mr-2" />Change Plan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Compact comparison - 3 plan cards */}
            <div className="grid grid-cols-3 gap-3">
              {plans.map(plan => {
                const isActive = plan.id === currentPlan;
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'p-4 rounded-xl border text-center transition-all',
                      isActive
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/10 ring-1 ring-emerald-500/20'
                        : 'border-border/50 hover:border-emerald-200 dark:hover:border-emerald-800'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mx-auto mb-2', plan.gradient)}>
                      <plan.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-semibold">{plan.name}</p>
                    <p className="text-sm font-bold mt-0.5">{plan.price}</p>
                    <p className="text-[10px] text-muted-foreground">{plan.period}</p>
                    {isActive && <Badge className="mt-2 text-[10px] bg-emerald-500 text-white border-0 h-4 px-1.5">Current</Badge>}
                    {'popular' in plan && plan.popular && !isActive && (
                      <Badge className="mt-2 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 h-4 px-1.5">Popular</Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick feature highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {[
                { icon: BookOpen, label: '43 Books', desc: 'Full library' },
                { icon: Bot, label: 'AI Assistant', desc: 'Unlimited' },
                { icon: Zap, label: 'Challenges', desc: 'Unlimited' },
                { icon: Star, label: 'Certificates', desc: 'All subjects' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Spending Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-teal-500" />Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Bar dataKey="amount" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {promoApplied && promoDiscount > 0 && (() => {
              const planPrices: Record<string, number> = { free: 0, pro: 9.99, team: 24.99 };
              const base = planPrices[currentPlan] || 0;
              const savings = promoDiscount >= 100 ? base : parseFloat((base * promoDiscount / 100).toFixed(2));
              return (
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-300">
                    With <strong>{promoDiscount}% discount</strong> applied, you save <strong>${savings.toFixed(2)}/mo</strong>
                  </span>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stripe Setup Guide */}
      <motion.div id="setup-guide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              Stripe Setup Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Stripe Checkout is Already Integrated</p>
                <p className="text-xs text-muted-foreground mt-1">Your platform uses Stripe for payment processing. When users click &quot;Subscribe with Stripe&quot;, they are redirected to a secure checkout page. Follow the steps below to go live.</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                Create a Stripe Account
              </h4>
              <p className="text-xs text-muted-foreground ml-8">
                Go to <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">stripe.com</span> and sign up for a free account. Provide your business details and bank information to start receiving payments.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                Get Your API Keys
              </h4>
              <p className="text-xs text-muted-foreground ml-8">
                In your Stripe Dashboard, go to Developers &rarr; API Keys. Create a &quot;Secret key&quot; and &quot;Publishable key&quot;. Add them to your <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">.env.local</span> file:
              </p>
              <pre className="text-xs bg-muted p-3 rounded-lg mt-2 ml-8 font-mono overflow-x-auto">
{`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxx`}</pre>
              <p className="text-xs text-muted-foreground ml-8 mt-1.5">
                <strong>Note:</strong> Use test keys (pk_test_/sk_test_) for development. Switch to live keys (pk_live_/sk_live_) before going live.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                Add Environment Variables to Vercel
              </h4>
              <p className="text-xs text-muted-foreground ml-8">
                In your Vercel project settings (Project &rarr; Settings &rarr; Environment Variables), add:
              </p>
              <pre className="text-xs bg-muted p-3 rounded-lg mt-2 ml-8 font-mono overflow-x-auto">
{`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_APP_URL=https://your-domain.com`}</pre>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">4</span>
                Create Products and Prices in Stripe Dashboard
              </h4>
              <p className="text-xs text-muted-foreground ml-8">
                Go to Stripe Dashboard &rarr; Products and create a product for each plan (e.g., &quot;DataTrack Pro Plan&quot;). Under each product, add a Price with:
              </p>
              <ul className="text-xs text-muted-foreground ml-8 mt-1.5 space-y-1">
                <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />Recurring billing: Monthly</li>
                <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />Pro Plan: $9.99/month</li>
                <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />Team Plan: $24.99/month</li>
              </ul>
              <p className="text-xs text-muted-foreground ml-8 mt-1.5">
                Copy the <strong>Price IDs</strong> (look like <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">price_xxxxxxxxxxxxx</span>) and add them to your environment variables:
              </p>
              <pre className="text-xs bg-muted p-3 rounded-lg mt-2 ml-8 font-mono overflow-x-auto">
{`STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_TEAM_PRICE_ID=price_xxxxxxxxxxxxx`}</pre>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">5</span>
                Configure Webhooks & Test
              </h4>
              <p className="text-xs text-muted-foreground ml-8">
                In Stripe Dashboard &rarr; Developers &rarr; Webhooks, add endpoint <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">/api/stripe-webhook</span> with event <code className="bg-muted px-1.5 py-0.5 rounded text-xs">checkout.session.completed</code>. Use test card <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">4242 4242 4242 4242</span> to test.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Important Notes</p>
                <ul className="space-y-1 text-xs text-muted-foreground mt-1">
                  <li>Always use HTTPS in production</li>
                  <li>Set up proper CORS in Stripe Dashboard</li>
                  <li>Use Stripe CLI for local testing: <code className="bg-muted px-1 py-0.5 rounded text-xs">stripe listen --forward-to https://localhost:3000/api/stripe-webhook</code></li>
                  <li>Monitor payouts in Stripe Dashboard &rarr; Payments</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Saved Cards & Billing Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-500" />Payment Methods</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {savedCards.map(card => (
                <div key={card.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center shrink-0">
                    <span className="text-[8px] text-white font-bold">{card.type.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{card.type} **** {card.last4}</p>
                    <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
                  </div>
                  {card.default && <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">Default</Badge>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full rounded-xl text-xs border-dashed"><CreditCard className="w-3.5 h-3.5 mr-1.5" />Add New Card</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" />Billing Address</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">First Name</Label><Input defaultValue="Data" className="h-8 text-sm" /></div>
                  <div className="space-y-1"><Label className="text-xs">Last Name</Label><Input defaultValue="Analyst" className="h-8 text-sm" /></div>
                </div>
                <div className="space-y-1"><Label className="text-xs">Address</Label><Input defaultValue="123 Analytics Drive" className="h-8 text-sm" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs">City</Label><Input defaultValue="San Francisco" className="h-8 text-sm" /></div>
                  <div className="space-y-1"><Label className="text-xs">State</Label><Input defaultValue="CA" className="h-8 text-sm" /></div>
                  <div className="space-y-1"><Label className="text-xs">ZIP</Label><Input defaultValue="94105" className="h-8 text-sm" /></div>
                </div>
              </div>
              <Button size="sm" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs">Save Address</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Promo Code & Auto-Renewal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="md:col-span-2">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Tag className="w-4 h-4 text-amber-500" />Promo Codes & Discounts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Applied promo display */}
              {promoApplied && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">{promoApplied}</span>
                        <Badge className="text-[10px] bg-emerald-500 text-white border-0">{PROMO_CODES[promoApplied]?.label || `${promoDiscount}% OFF`}</Badge>
                      </div>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                        {PROMO_CODES[promoApplied]?.description || `${promoDiscount}% discount applied`}
                        {' — '}${getDiscountedPrice().toFixed(2)}/mo instead of ${currentPlanData.price}/mo
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRemovePromo} className="shrink-0 rounded-lg text-xs border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20">
                    <X className="w-3.5 h-3.5 mr-1" />Remove
                  </Button>
                </motion.div>
              )}

              {/* Input + Apply */}
              {!promoApplied && (
                <div className="flex gap-2">
                  <Input placeholder="Enter promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="font-mono text-sm uppercase" onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()} />
                  <Button variant="outline" onClick={handleApplyPromo} className="shrink-0 rounded-xl"><Tag className="w-4 h-4 mr-1.5" />Apply</Button>
                </div>
              )}

              {/* Promo History */}
              {promoHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <History className="w-3.5 h-3.5" />
                    <span>Recently Applied</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1.5">
                    {promoHistory.slice().reverse().slice(0, 5).map((entry, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{entry.code}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5">{entry.discount}% OFF</Badge>
                        </div>
                        <span className="text-muted-foreground">{entry.appliedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Promo Codes Hints */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowPromoHints(!showPromoHints)}
                  className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Available Promo Codes ({Object.keys(PROMO_CODES).length})</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 ml-auto transition-transform', showPromoHints && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {showPromoHints && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                        {Object.entries(PROMO_CODES).map(([code, info]) => (
                          <div key={code} className="flex items-start gap-2.5 p-3 rounded-lg border border-border/50 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50/50 dark:hover:bg-amber-950/10 transition-colors cursor-pointer" onClick={() => { setPromoCode(code); setShowPromoHints(false); }}>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0">
                              <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold">{code}</span>
                                <Badge variant="secondary" className="text-[10px] px-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0">{info.label}</Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{info.description}</p>
                              {info.plan && (
                                <Badge variant="outline" className="text-[10px] mt-1 px-1.5 border-border/50">{info.plan.charAt(0).toUpperCase() + info.plan.slice(1)} only</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-[10px] text-muted-foreground">Try: WELCOME20, SAVE10, DATATRACK30</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} className="md:col-span-2">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><RefreshCw className="w-4 h-4 text-emerald-500" />Auto-Renewal & Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-renew subscription</p>
                  <p className="text-xs text-muted-foreground">Automatically renews on {nextBillingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                </div>
                <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Billing reminders</p>
                  <p className="text-xs text-muted-foreground">Get notified 3 days before billing</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Refer a Friend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400" />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Refer a Friend</h3>
                <p className="text-sm text-muted-foreground mt-1">Share your referral code and both of you get 1 month free!</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 px-4 py-2.5 rounded-lg bg-muted/30 border border-border/50 font-mono text-sm">{referralCode}</div>
                  <Button size="sm" variant="outline" onClick={handleCopyReferral} className="shrink-0 rounded-xl">
                    {referralCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Billing History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center"><Receipt className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-lg font-semibold">Billing History</h3><p className="text-xs text-muted-foreground">Your recent payment transactions</p></div>
              </div>
            </div>
            <div className="hidden md:grid md:grid-cols-4 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Invoice</span><span>Date</span><span>Plan & Amount</span><span className="text-right">Actions</span>
            </div>
            <Separator />
            <div className="divide-y divide-border/50">
              {billingHistory.map((record, index) => (
                <motion.div key={record.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2"><span className="text-xs font-mono text-muted-foreground">{record.id}</span>{record.status === 'paid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}</div>
                  <span className="text-sm">{record.date}</span>
                  <div className="flex items-center gap-2"><Badge variant="secondary" className="text-[10px]">{record.plan}</Badge><span className="text-sm font-semibold">{record.amount}</span></div>
                  <div className="flex justify-end"><Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => handleDownloadInvoice(record)}><FileText className="w-3.5 h-3.5 mr-1.5" />Download</Button></div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total spent on DataTrack</span>
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">$59.94</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">6 months of Pro Plan subscription</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
