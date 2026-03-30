'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  Trophy,
  Menu,
  X,
  Sun,
  Moon,
  GraduationCap,
  Wrench,
  Library,
  Users,
  Bot,
  StickyNote,
  Layers,
  Briefcase,
  Video,
  User,
  MessageCircle,
  CreditCard,
  Target,
  Award,
  Zap,
  Shield,
  Code,
  Settings as SettingsIcon,
  Search,
  Bell,
  LogOut,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Info,
  FileText,
  Terminal,
  BarChart3,
  MessageSquarePlus,
  Pen,
  Database,
  Flame,
  ScanSearch,
  Route,
  Brain,
  ShoppingBag,
  Crown,
  Gift,
  Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

export type Section = 'dashboard' | 'study' | 'ai-assistant' | 'ai-tutor' | 'notes' | 'flashcards' | 'challenge' | 'live-practice' | 'practice' | 'certificate' | 'books' | 'games' | 'tools' | 'sql-playground' | 'community' | 'chat' | 'payment' | 'achievements' | 'streaks' | 'portfolio' | 'resources' | 'resume' | 'resume-analyzer' | 'playground' | 'assessment' | 'visualization' | 'notifications' | 'peer-review' | 'whiteboard' | 'leaderboard' | 'profile' | 'settings' | 'admin' | 'advanced-tools' | 'path-recommender' | 'marketplace' | 'premium-membership' | 'referral-system' | 'ai-sql-assistant' | 'challenges' | 'career-advisor' | 'course-store' | 'pro-certifications' | 'mentorship';

interface StudyLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: Section;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  category: 'learn' | 'ai' | 'community' | 'tools' | 'career' | 'admin';
}

const categoryLabels: Record<string, string> = {
  learn: '📚 Learning',
  ai: '🤖 AI & Analytics',
  tools: '🔧 Developer Tools',
  community: '💬 Community',
  career: '🚀 Career & Growth',
  admin: '⚙️ Account',
};

const allNavItems: NavItem[] = [
  // ── Learn (Core) ──
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'learn' },
  { id: 'study', label: 'Study Path', icon: BookOpen, category: 'learn' },
  { id: 'notes', label: 'Notes', icon: StickyNote, category: 'learn' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, category: 'learn' },
  { id: 'books', label: 'Books Library', icon: Library, category: 'learn' },
  { id: 'challenge', label: 'Daily Challenge', icon: Zap, category: 'learn' },
  { id: 'practice', label: 'Practice', icon: Target, category: 'learn' },
  { id: 'certificate', label: 'Certificates', icon: Award, category: 'learn' },
  { id: 'streaks', label: 'Study Streaks', icon: Flame, category: 'learn' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, category: 'learn' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, category: 'learn' },
  { id: 'games', label: 'Games & Break', icon: Gamepad2, category: 'learn' },

  // ── AI & Analytics ──
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, category: 'ai' },
  { id: 'ai-tutor', label: 'AI Tutor', icon: GraduationCap, category: 'ai' },
  { id: 'live-practice', label: 'Live Practice', icon: Brain, category: 'ai' },
  { id: 'ai-sql-assistant', label: 'AI SQL Assistant', icon: Database, category: 'ai' },
  { id: 'path-recommender', label: 'Path Planner', icon: Route, category: 'ai' },
  { id: 'career-advisor', label: 'Career Advisor', icon: Compass, category: 'ai' },

  // ── Developer Tools ──
  { id: 'tools', label: 'Study Tools', icon: Wrench, category: 'tools' },
  { id: 'sql-playground', label: 'SQL Playground', icon: Database, category: 'tools' },
  { id: 'playground', label: 'Code Playground', icon: Terminal, category: 'tools' },
  { id: 'visualization', label: 'Data Viz Studio', icon: BarChart3, category: 'tools' },
  { id: 'advanced-tools', label: 'Advanced Tools', icon: Code, category: 'tools' },
  { id: 'assessment', label: 'Skill Assessment', icon: Target, category: 'tools' },
  { id: 'whiteboard', label: 'Whiteboard', icon: Pen, category: 'tools' },

  // ── Community ──
  { id: 'community', label: 'Community', icon: Users, category: 'community' },
  { id: 'chat', label: 'Chat Room', icon: MessageCircle, category: 'community' },
  { id: 'peer-review', label: 'Peer Review', icon: MessageSquarePlus, category: 'community' },
  { id: 'notifications', label: 'Notifications', icon: Bell, category: 'community' },

  // ── Career & Growth ──
  { id: 'course-store', label: 'Course Store', icon: GraduationCap, category: 'career' },
  { id: 'pro-certifications', label: 'Pro Certifications', icon: Award, category: 'career' },
  { id: 'mentorship', label: 'Mentorship', icon: Users, category: 'career' },
  { id: 'challenges', label: 'Challenge Arena', icon: Trophy, category: 'career' },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase, category: 'career' },
  { id: 'resume', label: 'Resume Builder', icon: FileText, category: 'career' },
  { id: 'resume-analyzer', label: 'Resume Analyzer', icon: ScanSearch, category: 'career' },
  { id: 'resources', label: 'Video & Resources', icon: Video, category: 'career' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, category: 'career' },

  // ── Account & Settings ──
  { id: 'payment', label: 'Payment', icon: CreditCard, category: 'admin' },
  { id: 'premium-membership', label: 'Premium', icon: Crown, category: 'admin' },
  { id: 'referral-system', label: 'Referrals', icon: Gift, category: 'admin' },
  { id: 'profile', label: 'Profile', icon: User, category: 'admin' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, category: 'admin' },
  { id: 'admin', label: 'Admin', icon: Shield, adminOnly: true, category: 'admin' },
];

// ─── Password Strength Meter ───
function getPasswordStrength(password: string) {
  if (!password) return { level: 0, label: '', color: '', width: '0%' };
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const len = password.length;

  if (len < 6) return { level: 1, label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (len < 8) return { level: 2, label: 'Fair', color: 'bg-orange-500', width: '50%' };
  if (len < 10 || (!hasSpecial && !hasNumber)) return { level: 3, label: 'Good', color: 'bg-yellow-500', width: '75%' };
  if (hasLower && hasUpper && hasNumber && hasSpecial) return { level: 4, label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  return { level: 3, label: 'Good', color: 'bg-yellow-500', width: '75%' };
}

// ─── Auth Modal Component ───
function AuthModal({ open, onOpenChange, defaultTab }: { open: boolean; onOpenChange: (open: boolean) => void; defaultTab?: 'login' | 'signup' }) {
  const store = useProgressStore();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab || 'login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupTerms, setSignupTerms] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Reset form on tab change
  useEffect(() => {
    setLoginError('');
    setSignupError('');
  }, [activeTab]);

  const lockRemaining = store.lockExpiry ? Math.max(0, Math.ceil((store.lockExpiry - Date.now()) / 60000)) : 0;

  const handleLogin = async () => {
    setLoginError('');

    if (!loginEmail.trim()) { setLoginError('Please enter your email.'); return; }
    if (!loginEmail.includes('@')) { setLoginError('Please enter a valid email address.'); return; }
    if (!loginPassword) { setLoginError('Please enter your password.'); return; }

    setLoginLoading(true);

    const result = await store.loginUser(loginEmail.trim(), loginPassword);
    if (result.success) {
      store.checkLockStatus();
      toast.success('Welcome back! You are now signed in.');
      setLoginEmail('');
      setLoginPassword('');
      setLoginLoading(false);
      onOpenChange(false);
    } else {
      setLoginError(result.error || 'Invalid credentials.');
      setLoginLoading(false);
    }
  };

  const handleSignup = async () => {
    setSignupError('');

    if (!signupName.trim()) { setSignupError('Please enter your full name.'); return; }
    if (!signupEmail.trim()) { setSignupError('Please enter your email.'); return; }
    if (!signupEmail.includes('@')) { setSignupError('Please enter a valid email address.'); return; }
    if (!signupPassword) { setSignupError('Please enter a password.'); return; }
    if (signupPassword.length < 8) { setSignupError('Password must be at least 8 characters.'); return; }
    if (signupPassword !== signupConfirmPassword) { setSignupError('Passwords do not match.'); return; }
    if (!signupTerms) { setSignupError('Please agree to the Terms of Service.'); return; }

    setSignupLoading(true);
    const result = await store.registerUser(signupName.trim(), signupEmail.trim(), signupPassword);
    if (result.success) {
      toast.success('Account created! You can now sign in.');
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupTerms(false);
      setSignupLoading(false);
      setActiveTab('login');
    } else {
      setSignupError(result.error || 'Registration failed.');
      setSignupLoading(false);
    }
  };

  const strength = getPasswordStrength(signupPassword);

  const handleForgotPassword = () => {
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      toast.error('Please enter your email address first.');
      return;
    }
    toast.success(`Password reset link sent to ${loginEmail}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>Sign in or create an account to continue.</DialogDescription>
        </DialogHeader>

        {/* Gradient header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 px-6 py-6 text-white text-center animate-gradient">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold">Welcome to DataTrack</h2>
            <p className="text-emerald-100 text-sm mt-1">Your Data Analytics Journey</p>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="px-6 py-4">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="rounded-lg">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg">Sign Up</TabsTrigger>
          </TabsList>

          {/* ─── Login Tab ─── */}
          <TabsContent value="login" className="space-y-4 mt-0">
            {/* Lockout message */}
            {store.isLocked && lockRemaining > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50"
              >
                <Lock className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Account Locked</p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70">Try again in {lockRemaining} minute{lockRemaining !== 1 ? 's' : ''}</p>
                </div>
              </motion.div>
            )}

            {/* Error message */}
            {loginError && !store.isLocked && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{loginError}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-email">Email Address</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="steven@datatrack.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
                <Label htmlFor="remember-me" className="text-sm cursor-pointer">Remember me</Label>
              </div>
              <button
                onClick={handleForgotPassword}
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Failed attempts counter */}
            {!store.isLocked && store.failedLoginAttempts > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {5 - store.failedLoginAttempts}/5 attempts remaining
              </p>
            )}

            <Button
              onClick={handleLogin}
              disabled={loginLoading || (store.isLocked && lockRemaining > 0)}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button onClick={() => setActiveTab('signup')} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                Sign Up
              </button>
            </p>
          </TabsContent>

          {/* ─── Signup Tab ─── */}
          <TabsContent value="signup" className="space-y-4 mt-0">
            {signupError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{signupError}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <Input
                id="signup-name"
                placeholder="John Doe"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email Address</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="john@datatrack.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showSignupPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength meter */}
              {signupPassword && (
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: strength.width }}
                      className={cn('h-full rounded-full transition-colors', strength.color)}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className={cn(
                    'text-xs font-medium',
                    strength.level <= 1 && 'text-red-500',
                    strength.level === 2 && 'text-orange-500',
                    strength.level === 3 && 'text-yellow-600 dark:text-yellow-400',
                    strength.level >= 4 && 'text-emerald-500',
                  )}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="signup-confirm"
                  type={showSignupConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                  className={cn(
                    'h-11 pr-10',
                    signupConfirmPassword && signupPassword !== signupConfirmPassword && 'border-red-500 focus-visible:ring-red-500',
                    signupConfirmPassword && signupPassword === signupConfirmPassword && 'border-emerald-500 focus-visible:ring-emerald-500',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {signupConfirmPassword && signupPassword === signupConfirmPassword && (
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
              {signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Passwords do not match
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="signup-terms" checked={signupTerms} onCheckedChange={(v) => setSignupTerms(!!v)} />
              <Label htmlFor="signup-terms" className="text-sm cursor-pointer">
                I agree to the{' '}
                <span className="text-emerald-600 dark:text-emerald-400 hover:underline">Terms of Service</span>
                {' '}and{' '}
                <span className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Policy</span>
              </Label>
            </div>

            <Button
              onClick={handleSignup}
              disabled={signupLoading}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium"
            >
              {signupLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button onClick={() => setActiveTab('login')} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                Sign In
              </button>
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Session Timer Hook ───
function useSessionTimer(isAuthenticated: boolean, lastLoginTime: number | null) {
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const sessionRef = useRef(sessionMinutes);

  useEffect(() => {
    if (!isAuthenticated || !lastLoginTime) {
      sessionRef.current = 0;
      return;
    }

    const calcMinutes = () => Math.floor((Date.now() - lastLoginTime) / 60000);
    sessionRef.current = calcMinutes();
    setSessionMinutes(sessionRef.current);
    useProgressStore.setState({ sessionDuration: sessionRef.current });

    const interval = setInterval(() => {
      const mins = calcMinutes();
      sessionRef.current = mins;
      setSessionMinutes(mins);
      useProgressStore.setState({ sessionDuration: mins });
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastLoginTime]);

  return sessionMinutes;
}

// ─── Last Login Time Formatter ───
function formatLastLogin(timestamp: number | null): string {
  if (!timestamp) return 'Never';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ─── Main Layout Component ───
export default function StudyLayout({ children }: StudyLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeSection = (pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || 'dashboard') as Section;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const store = useProgressStore();
  const isAuthenticated = store.isLoggedIn || false;
  const isAdmin = store.isAdmin || false;
  const profile = store.profile || { name: 'Student', email: '' };
  const disabledFeatures = store.disabledFeatures || [];
  const maintenanceMode = store.maintenanceMode || false;
  const userNotifications = store.notifications || [];
  const unreadNotificationCount = userNotifications.filter((n: { read: boolean }) => !n.read).length;

  // Filter nav items: show admin only when isAdmin is true
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  const sessionMinutes = useSessionTimer(isAuthenticated, store.lastLoginTime);

  // Check lock status periodically
  const isLockedRef = useRef(store.isLocked);
  useEffect(() => {
    isLockedRef.current = store.isLocked;
    if (store.isLocked) {
      const interval = setInterval(() => {
        if (isLockedRef.current) {
          store.checkLockStatus();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [store.isLocked]);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleSectionChange = (section: Section) => {
    // Check if feature is disabled
    if (disabledFeatures.includes(section)) {
      toast.error('This feature is currently disabled by the admin');
      return;
    }
    router.push('/' + section);
    setSidebarOpen(false);
  };

  const openAuthModal = (tab: 'login' | 'signup') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    store.logoutUser();
    toast.success('You have been signed out.');
    router.push('/login');
  };

  const activityStatus = store.isLocked ? 'locked' : isAuthenticated ? 'online' : 'offline';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out',
          'bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white',
          'border-r border-emerald-700/30',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-emerald-700/50">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight gradient-text-emerald">DataTrack</h1>
            <p className="text-xs text-emerald-300/70">Your Analytics Journey</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {(() => {
            // Group nav items by category
            const groupedNav: { category: string; items: NavItem[] }[] = [];
            let currentCategory = '';
            for (const item of navItems) {
              if (item.category !== currentCategory) {
                groupedNav.push({ category: item.category, items: [item] });
                currentCategory = item.category;
              } else {
                groupedNav[groupedNav.length - 1].items.push(item);
              }
            }
            return groupedNav.map((group) => (
              <div key={group.category}>
                <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-emerald-300/50 font-semibold mt-3 first:mt-0">
                  {categoryLabels[group.category] || group.category}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  const isDisabled = disabledFeatures.includes(item.id);
                  return (
                    <TooltipProvider key={item.id} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleSectionChange(item.id)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                              isDisabled && 'opacity-50 cursor-not-allowed',
                              !isDisabled && isActive
                                ? 'bg-white/15 text-white shadow-lg shadow-emerald-900/30'
                                : !isDisabled && 'text-emerald-100/70 hover:text-white hover:bg-white/8'
                            )}
                          >
                            <div
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                                isActive ? 'bg-emerald-400/20' : 'bg-transparent'
                              )}
                            >
                              <Icon
                                className={cn(
                                  'w-4 h-4 transition-colors',
                                  isActive ? 'text-emerald-300' : ''
                                )}
                              />
                            </div>
                            <span className="flex-1 text-left">{item.label}</span>
                            {isDisabled && (
                              <Badge className="h-4 px-1.5 text-[9px] bg-red-400/80 text-white border-0 font-bold">Disabled</Badge>
                            )}
                            {item.adminOnly && isAdmin && (
                              <Badge className="h-4 px-1.5 text-[9px] bg-amber-400 text-amber-900 border-0 font-bold">ADMIN</Badge>
                            )}
                            {isActive && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                              />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="lg:hidden">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ));
          })()}
        </nav>

        {/* Footer with theme toggle */}
        <div className="p-4 border-t border-emerald-700/50">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-emerald-300/60">Theme</span>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-300/70 hover:text-white hover:bg-white/10"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Maintenance Mode Banner */}
        {maintenanceMode && (
          <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4" />
            Site is under maintenance. Some features may be unavailable.
          </div>
        )}

        {/* ─── Enhanced Top Bar ─── */}
        <header className="h-16 border-b border-border/50 flex items-center px-4 lg:px-6 shrink-0 bg-background/60 backdrop-blur-xl gap-4">
          {/* Left: hamburger + section name */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 shrink-0">
            {/* Activity status dot */}
            <div className={cn(
              'w-2 h-2 rounded-full shrink-0',
              activityStatus === 'online' && 'bg-emerald-500 shadow-sm shadow-emerald-500/50',
              activityStatus === 'locked' && 'bg-red-500 shadow-sm shadow-red-500/50',
              activityStatus === 'offline' && 'bg-gray-400',
            )} />
            <h2 className="text-lg font-semibold hidden sm:block">
              {navItems.find((i) => i.id === activeSection)?.label}
            </h2>
          </div>

          {/* Center: search bar */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search topics, books, resources..."
                className="pl-10 h-9 bg-muted/40 border-0 focus-visible:ring-1"
                readOnly
              />
            </div>
          </div>

          {/* Right: auth buttons / user menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {isAuthenticated ? (
              <>
                {/* Session timer */}
                {sessionMinutes > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal">
                          <Clock className="w-3 h-3 text-emerald-500" />
                          Session: {sessionMinutes}m
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        Active for {sessionMinutes} minute{sessionMinutes !== 1 ? 's' : ''}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Notification bell */}
                <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => router.push('/notifications')}>
                  <Bell className="w-4 h-4" />
                  {unreadNotificationCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    >
                      {unreadNotificationCount}
                    </motion.span>
                  )}
                </Button>

                {/* User avatar & name */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => router.push('/profile')}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden">
                          {profile.profilePicture ? (
                            <img src={profile.profilePicture} alt={profile.name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            profile.name ? profile.name.charAt(0).toUpperCase() : 'S'
                          )}
                        </div>
                        <div className="hidden lg:block text-left">
                          <p className="text-sm font-medium leading-tight">{profile.name || 'User'}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">Last login: {formatLastLogin(store.lastLoginTime)}</p>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                      <p className="text-xs text-muted-foreground">Last login: {formatLastLogin(store.lastLoginTime)}</p>
                      {isAdmin && <p className="text-xs text-amber-500 font-medium mt-1">Admin Account</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Logout */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-red-500"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Sign Out</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <>
                {/* Sign In button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAuthModal('login')}
                  className="h-9"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>

                {/* Sign Up button */}
                <Button
                  size="sm"
                  onClick={() => openAuthModal('signup')}
                  className="h-9 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
    </div>
  );
}
