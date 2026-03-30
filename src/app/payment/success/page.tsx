'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Crown, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProgressStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    plan: string;
    amount: number;
    expiresAt: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No session ID found. Please try again.');
      return;
    }

    async function verifyPayment() {
      try {
        const params = new URLSearchParams();
        params.set('session_id', sessionId);

        // Pass through demo/plan/amount params if present
        const demo = searchParams.get('demo');
        const plan = searchParams.get('plan');
        const amount = searchParams.get('amount');
        if (demo) params.set('demo', demo);
        if (plan) params.set('plan', plan);
        if (amount) params.set('amount', amount);

        const response = await fetch(`/api/verify-payment?${params.toString()}`);
        const data = await response.json();

        if (data.verified && data.subscription) {
          // Activate subscription in Zustand store
          const store = useProgressStore.getState();
          const subPlan = data.subscription.plan as 'pro' | 'team';

          store.addPaymentRecord({
            plan: subPlan,
            amount: data.subscription.amount || (subPlan === 'pro' ? 9.99 : 24.99),
            currency: data.subscription.currency || 'USD',
            status: 'verified',
            method: 'Stripe',
            last4: '****',
          });

          store.setSubscriptionPlan(subPlan);

          if (data.subscription.expiresAt) {
            store.setSubscriptionExpiry(data.subscription.expiresAt);
          }

          store.setSubscriptionStatus('active');

          setSubscriptionInfo({
            plan: subPlan,
            amount: data.subscription.amount || (subPlan === 'pro' ? 9.99 : 24.99),
            expiresAt: data.subscription.expiresAt,
          });

          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Payment verification failed. Please contact support.');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred during verification.');
      }
    }

    verifyPayment();
  }, [sessionId, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-background dark:to-teal-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            {/* Animated Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={status === 'success' ? { scale: 1 } : { scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
              className="mx-auto"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={status === 'success' ? { scale: 1 } : { scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 12, delay: 0.5 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} />
                </motion.div>
              </div>
            </motion.div>

            {/* Loading State */}
            {status === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center mx-auto">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Verifying Payment...</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please wait while we confirm your subscription
                  </p>
                </div>
              </motion.div>
            )}

            {/* Success State */}
            {status === 'success' && subscriptionInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Subscription Activated
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Welcome to {subscriptionInfo.plan === 'pro' ? 'Pro' : 'Team'}!
                  </h2>
                  <p className="text-muted-foreground">
                    Your payment has been verified and all premium features are now unlocked.
                  </p>
                </div>

                {/* Plan Details */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="bg-muted/50 rounded-xl p-4 space-y-3 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-sm capitalize">{subscriptionInfo.plan}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-semibold text-sm">${subscriptionInfo.amount.toFixed(2)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Active</span>
                  </div>
                  {subscriptionInfo.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Renews</span>
                      <span className="text-sm font-medium">
                        {new Date(subscriptionInfo.expiresAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </motion.div>

                <Button
                  onClick={() => router.push('/')}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground">
                  Secure payment processed via Stripe
                </p>
              </motion.div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400">
                    Verification Failed
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {errorMessage}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="flex-1 rounded-xl"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={() => router.push('/')}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Floating particles decoration */}
        {status === 'success' && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.5],
                  y: [0, -30 - Math.random() * 40],
                  x: [0, (Math.random() - 0.5) * 60],
                }}
                transition={{
                  duration: 2,
                  delay: 0.8 + i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 1 + i * 0.1,
                }}
                className="absolute w-2 h-2 rounded-full bg-emerald-400"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-background dark:to-teal-950 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
