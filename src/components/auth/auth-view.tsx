'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  Brain,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  X,
  Github,
  Quote,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import { toast } from 'sonner';

const floatingBooks = [
  { icon: BookOpen, x: '10%', y: '20%', delay: 0, duration: 6, size: 32, color: 'text-emerald-300/40' },
  { icon: BarChart3, x: '75%', y: '15%', delay: 1.5, duration: 8, size: 28, color: 'text-teal-300/30' },
  { icon: Brain, x: '20%', y: '70%', delay: 3, duration: 7, size: 36, color: 'text-emerald-200/25' },
  { icon: BookOpen, x: '80%', y: '65%', delay: 0.8, duration: 9, size: 24, color: 'text-teal-200/35' },
];

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  checks: { label: string; met: boolean }[];
} {
  const checks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special character (!@#$...)', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];

  const metCount = checks.filter((c) => c.met).length;

  if (metCount === 0) return { score: 0, label: '', color: '', checks };
  if (metCount <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', checks };
  if (metCount <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', checks };
  if (metCount <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500', checks };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500', checks };
}

export default function AuthView() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  const { loginUser, registerUser } = useProgressStore();

  const passwordStrength = useMemo(() => getPasswordStrength(regPassword), [regPassword]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 250));

    const result = loginUser(loginEmail, loginPassword);

    if (result.success) {
      setIsLoading(false);
      toast.success('Welcome back!', { description: 'You have been logged in successfully.' });
    } else {
      setLoginError(result.error || 'Login failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 250));

    const result = registerUser(regName, regEmail, regPassword);

    if (result.success) {
      setIsLoading(false);
      toast.success('Account created!', { description: 'You can now log in with your credentials.' });
      setActiveTab('login');
      setLoginEmail(regEmail);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
    } else {
      setRegError(result.error || 'Registration failed.');
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info('Coming soon!', { description: `${provider} login will be available soon.` });
  };

  const handleForgotPassword = () => {
    toast.success('Check your email', { description: 'Password reset instructions have been sent.' });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-950">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden">
        {/* Floating book icons */}
        {floatingBooks.map((book, index) => {
          const Icon = book.icon;
          return (
            <motion.div
              key={index}
              className={cn('absolute', book.color)}
              style={{ left: book.x, top: book.y }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -3, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: book.duration,
                delay: book.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Icon size={book.size} />
            </motion.div>
          );
        })}

        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-700/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-emerald-600/10 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 xl:p-20 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Logo */}
            <motion.div
              className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8 mx-auto shadow-2xl"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <GraduationCap className="w-10 h-10 text-emerald-300" />
            </motion.div>

            <motion.h1
              className="text-4xl xl:text-5xl font-bold mb-4 tracking-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              DataTrack{' '}
              <span className="text-emerald-300">Pro</span>
            </motion.h1>

            <motion.p
              className="text-lg xl:text-xl text-emerald-100/80 mb-12 max-w-md mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              Your Data Science &amp; Engineering Journey
            </motion.p>

            {/* Feature highlights */}
            <motion.div
              className="space-y-4 text-left max-w-sm mx-auto mb-12"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {[
                { text: 'Track progress across 8 data subjects', icon: BarChart3 },
                { text: 'Interactive quizzes and daily challenges', icon: Brain },
                { text: 'AI-powered study assistant', icon: Sparkles },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="text-emerald-100/90 text-sm">{feature.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Testimonial */}
            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-sm mx-auto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <Quote className="w-6 h-6 text-emerald-400/60 mb-3" />
              <p className="text-sm text-emerald-100/80 italic leading-relaxed">
                &ldquo;DataTrack Pro transformed my learning journey. The structured path and interactive tools made mastering data analytics feel achievable.&rdquo;
              </p>
              <p className="text-xs text-emerald-300/60 mt-3 font-medium">— Community Member</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-12 xl:px-20 bg-white dark:bg-gray-950">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              DataTrack <span className="text-emerald-600">Pro</span>
            </h1>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'register'); setLoginError(''); setRegError(''); }}>
            <TabsList className="w-full grid grid-cols-2 mb-8 h-12 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
              <TabsTrigger
                value="login"
                className={cn(
                  'rounded-lg text-sm font-semibold transition-all duration-200',
                  activeTab === 'login'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className={cn(
                  'rounded-lg text-sm font-semibold transition-all duration-200',
                  activeTab === 'register'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {/* LOGIN FORM */}
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <TabsContent value="login" className="mt-0">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Sign in to continue your learning journey</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 h-12 text-base rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:ring-emerald-500/20"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 text-base rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:ring-emerald-500/20"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(v) => setRememberMe(v === true)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <Label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                        Remember me for 30 days
                      </Label>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2"
                        >
                          <X className="w-4 h-4 shrink-0" />
                          {loginError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-emerald-600/25 transition-all duration-200 disabled:opacity-70"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <span className="flex items-center gap-2">
                          Sign In
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">or continue with</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin('Google')}
                      className="h-11 rounded-xl border-gray-200 dark:border-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin('GitHub')}
                      className="h-11 rounded-xl border-gray-200 dark:border-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      GitHub
                    </Button>
                  </div>
                </TabsContent>
              </motion.div>

              {/* REGISTER FORM */}
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <TabsContent value="register" className="mt-0">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Start your data analytics journey today</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="reg-name"
                          type="text"
                          placeholder="John Doe"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="pl-10 h-12 text-base rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:ring-emerald-500/20"
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="your@email.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="pl-10 h-12 text-base rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:ring-emerald-500/20"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 text-base rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:ring-emerald-500/20"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      {regPassword.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 mt-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 flex gap-1">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={cn(
                                    'h-1.5 flex-1 rounded-full transition-colors duration-300',
                                    passwordStrength.score >= level ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-800'
                                  )}
                                />
                              ))}
                            </div>
                            {passwordStrength.label && (
                              <span
                                className={cn(
                                  'text-xs font-semibold',
                                  passwordStrength.score <= 1 ? 'text-red-500' :
                                  passwordStrength.score <= 2 ? 'text-amber-500' :
                                  passwordStrength.score <= 3 ? 'text-yellow-500' :
                                  'text-emerald-500'
                                )}
                              >
                                {passwordStrength.label}
                              </span>
                            )}
                          </div>

                          {/* Requirements checklist */}
                          <div className="grid grid-cols-2 gap-1">
                            {passwordStrength.checks.map((check) => (
                              <div key={check.label} className="flex items-center gap-1.5">
                                {check.met ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                                )}
                                <span
                                  className={cn(
                                    'text-xs',
                                    check.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                                  )}
                                >
                                  {check.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="reg-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className={cn(
                            'pl-10 pr-10 h-12 text-base rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:ring-emerald-500/20',
                            regConfirmPassword && regConfirmPassword !== regPassword && 'border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/20'
                          )}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {regConfirmPassword && regConfirmPassword !== regPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {regError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2"
                        >
                          <X className="w-4 h-4 shrink-0" />
                          {regError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-emerald-600/25 transition-all duration-200 disabled:opacity-70"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <span className="flex items-center gap-2">
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">or sign up with</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin('Google')}
                      className="h-11 rounded-xl border-gray-200 dark:border-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin('GitHub')}
                      className="h-11 rounded-xl border-gray-200 dark:border-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      GitHub
                    </Button>
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>

          {/* Footer */}
          <motion.p
            className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            By continuing, you agree to our{' '}
            <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">Privacy Policy</span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
