'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useProgressStore } from '@/lib/store';
import StudyLayout from '@/components/layout/study-layout';
import FloatingAIBot from '@/components/ai/floating-ai-bot';
import OnboardingTour from '@/components/onboarding/onboarding-tour';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, Crown, Zap, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const proFeaturePaths = [
  'ai-assistant', 'ai-tutor', 'ai-sql-assistant', 'career-advisor',
  'resume', 'resume-analyzer', 'playground', 'assessment', 'visualization',
  'whiteboard', 'peer-review', 'practice', 'certificate',
  'portfolio', 'resources', 'payment',
  'course-store', 'pro-certifications', 'mentorship', 'live-practice',
  'path-recommender', 'advanced-tools',
];

function PaywallOverlay({ featureId }: { featureId: string }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-[80vh] p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-center max-w-lg space-y-6"
      >
        <motion.div
          animate={{
            boxShadow: ['0 0 0px rgba(168,85,247,0.4)', '0 0 30px rgba(168,85,247,0.2)', '0 0 0px rgba(168,85,247,0.4)'],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center mx-auto shadow-2xl"
        >
          <Crown className="w-12 h-12 text-white" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Pro Feature
          </h2>
          <p className="text-muted-foreground text-lg">
            Unlock <span className="font-semibold text-foreground capitalize">{featureId.replace(/-/g, ' ')}</span> and all premium tools
          </p>
        </div>

        <div className="bg-muted/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-sm text-left">Unlimited AI Assistant access</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm text-left">Advanced tools & code playground</span>
          </div>
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-violet-500 shrink-0" />
            <span className="text-sm text-left">Skill assessments & certificates</span>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="text-sm text-left">Resume builder & whiteboard</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.push('/payment')}
            size="lg"
            className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white shadow-lg shadow-purple-500/25 px-8 h-12 text-base"
          >
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Pro — $9.99/mo
          </Button>
          <Button variant="outline" size="lg" className="h-12" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          7-day free trial included · Cancel anytime · Full access to all features
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const store = useProgressStore();
  const isLoggedIn = store.isLoggedIn || false;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Don't render anything while redirecting
  if (!isLoggedIn) {
    return null;
  }

  // Extract feature from pathname (e.g., /ai-assistant → ai-assistant)
  const featureId = pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || 'dashboard';

  // Check paywall
  const canAccess = store.canAccessFeature(featureId);
  const isAdmin = store.isAdmin || false;
  const isMaintenance = store.maintenanceMode || false;

  // Admin-only route check
  if (featureId === 'admin' && !isAdmin) {
    return (
      <StudyLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to access this area.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </motion.div>
        </div>
      </StudyLayout>
    );
  }

  // Paywall check
  if (!canAccess) {
    return (
      <StudyLayout>
        <PaywallOverlay featureId={featureId} />
      </StudyLayout>
    );
  }

  return (
    <>
      <StudyLayout>
        {isMaintenance && (
          <div className="bg-amber-500 text-white px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            Site is under maintenance. Some features may be unavailable.
          </div>
        )}
        {children}
      </StudyLayout>
      {featureId !== 'ai-assistant' && <FloatingAIBot />}
      <OnboardingTour />
    </>
  );
}
