'use client';

import React, { useState } from 'react';
import StudyLayout, { type Section } from '@/components/layout/study-layout';
import AuthView from '@/components/auth/auth-view';
import DashboardView from '@/components/dashboard/dashboard-view';
import StudyPathView from '@/components/study/study-path-view';
import AIAssistantView from '@/components/ai/ai-assistant-view';
import NotesView from '@/components/notes/notes-view';
import FlashcardsView from '@/components/notes/flashcards-view';
import GamesView from '@/components/games/games-view';
import AchievementsView from '@/components/achievements/achievements-view';
import ToolsView from '@/components/tools/tools-view';
import BooksView from '@/components/books/books-view';
import CommunityView from '@/components/community/community-view';
import DailyChallengeView from '@/components/challenge/daily-challenge-view';
import PracticeView from '@/components/practice/practice-view';
import CertificateView from '@/components/certificate/certificate-view';
import CommunityChatView from '@/components/chat/community-chat-view';
import PaymentSettingsView from '@/components/payment/payment-settings-view';
import PortfolioView from '@/components/portfolio/portfolio-view';
import ResumeBuilderView from '@/components/resume/resume-builder-view';
import CodePlaygroundView from '@/components/playground/code-playground-view';
import SkillAssessmentView from '@/components/assessment/skill-assessment-view';
import DataVizStudioView from '@/components/visualization/data-viz-studio-view';
import NotificationCenterView from '@/components/notifications/notification-center-view';
import PeerReviewView from '@/components/peer-review/peer-review-view';
import WhiteboardView from '@/components/whiteboard/whiteboard-view';
import LeaderboardView from '@/components/leaderboard/leaderboard-view';
import VideoResourcesView from '@/components/resources/video-resources-view';
import ProfileView from '@/components/profile/profile-view';
import SettingsView from '@/components/settings/settings-view';
import OnboardingTour from '@/components/onboarding/onboarding-tour';
import AdminView from '@/components/admin/admin-view';
import AdvancedToolsView from '@/components/advanced/advanced-tools-view';
import SQLPlaygroundView from '@/components/sql-playground/sql-playground-view';
import StreaksView from '@/components/streaks/streaks-view';
import AIResumeAnalyzer from '@/components/resume/ai-resume-analyzer';
import FloatingAIBot from '@/components/ai/floating-ai-bot';
import AITutorView from '@/components/ai/ai-tutor-view';
import LivePracticeView from '@/components/ai/live-practice-view';
import PathRecommenderView from '@/components/ai/path-recommender-view';
import MarketplaceView from '@/components/marketplace/marketplace-view';
import PremiumMembershipView from '@/components/marketplace/premium-membership-view';
import ReferralSystemView from '@/components/marketplace/referral-system-view';
import { useProgressStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, Crown, Zap, ArrowRight, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PaywallOverlay({ featureId, onUpgrade }: { featureId: string; onUpgrade: () => void }) {
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
        {/* Animated lock icon */}
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
            Unlock <span className="font-semibold text-foreground capitalize">{featureId.replace('-', ' ')}</span> and all premium tools
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
            onClick={onUpgrade}
            size="lg"
            className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white shadow-lg shadow-purple-500/25 px-8 h-12 text-base"
          >
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Pro — $9.99/mo
          </Button>
          <Button variant="outline" size="lg" className="h-12" onClick={() => window.history.back()}>
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

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const store = useProgressStore();
  const isLoggedIn = store.isLoggedIn || false;

  if (!isLoggedIn) {
    return <AuthView />;
  }

  const canAccess = store.canAccessFeature(activeSection);
  const isAdmin = store.isAdmin || false;
  const maintenanceMode = store.maintenanceMode || false;

  return (
    <>
      <StudyLayout activeSection={activeSection} onSectionChange={setActiveSection}>
        {/* Maintenance Mode Banner */}
        {maintenanceMode && (
          <div className="bg-amber-500 text-white px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Site is under maintenance. Some features may be unavailable.
          </div>
        )}
        {!canAccess ? (
          <PaywallOverlay 
            featureId={activeSection} 
            onUpgrade={() => setActiveSection('payment')} 
          />
        ) : activeSection === 'admin' && !isAdmin ? (
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
              <Button onClick={() => setActiveSection('dashboard')}>
                Return to Dashboard
              </Button>
            </motion.div>
          </div>
        ) : (
          <>
            {activeSection === 'dashboard' && (
              <DashboardView onNavigate={setActiveSection} />
            )}
            {activeSection === 'study' && <StudyPathView />}
            {activeSection === 'ai-assistant' && <AIAssistantView />}
            {activeSection === 'notes' && <NotesView />}
            {activeSection === 'flashcards' && <FlashcardsView />}
            {activeSection === 'challenge' && <DailyChallengeView />}
            {activeSection === 'practice' && <PracticeView />}
            {activeSection === 'certificate' && <CertificateView />}
            {activeSection === 'books' && <BooksView />}
            {activeSection === 'games' && <GamesView />}
            {activeSection === 'tools' && <ToolsView />}
            {activeSection === 'community' && <CommunityView />}
            {activeSection === 'chat' && <CommunityChatView />}
            {activeSection === 'payment' && <PaymentSettingsView />}
            {activeSection === 'achievements' && <AchievementsView />}
            {activeSection === 'portfolio' && <PortfolioView />}
            {activeSection === 'resources' && <VideoResourcesView />}
            {activeSection === 'resume' && <ResumeBuilderView />}
            {activeSection === 'playground' && <CodePlaygroundView />}
            {activeSection === 'assessment' && <SkillAssessmentView />}
            {activeSection === 'visualization' && <DataVizStudioView />}
            {activeSection === 'notifications' && <NotificationCenterView />}
            {activeSection === 'peer-review' && <PeerReviewView />}
            {activeSection === 'whiteboard' && <WhiteboardView />}
            {activeSection === 'leaderboard' && <LeaderboardView />}
            {activeSection === 'profile' && <ProfileView />}
            {activeSection === 'settings' && <SettingsView />}
            {activeSection === 'admin' && <AdminView />}
            {activeSection === 'advanced-tools' && <AdvancedToolsView />}
            {activeSection === 'sql-playground' && <SQLPlaygroundView />}
            {activeSection === 'streaks' && <StreaksView />}
            {activeSection === 'resume-analyzer' && <AIResumeAnalyzer />}
            {activeSection === 'ai-tutor' && <AITutorView />}
            {activeSection === 'live-practice' && <LivePracticeView />}
            {activeSection === 'path-recommender' && <PathRecommenderView />}
            {activeSection === 'marketplace' && <MarketplaceView />}
            {activeSection === 'premium-membership' && <PremiumMembershipView />}
            {activeSection === 'referral-system' && <ReferralSystemView />}
          </>
        )}
      </StudyLayout>
      {activeSection !== 'ai-assistant' && <FloatingAIBot />}
      <OnboardingTour />
    </>
  );
}
