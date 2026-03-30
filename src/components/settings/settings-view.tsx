'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  User, Mail, FileText, Clock, Globe, BookOpen, Target, Bell,
  Moon, Sun, Monitor, Type, Minimize2, Eye, EyeOff, Shield,
  MailCheck, Clock3, Trophy, MessageSquare, CreditCard, Crown,
  AlertTriangle, Trash2, Download, ChevronRight, Palette,
  Volume2, VolumeX, Smartphone, CheckCircle2, Sparkles, Save,
  Lock, ShieldCheck, LogIn, LogOut, UserPlus, History,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
];

// Helper: password strength
function getPwdStrength(password: string) {
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

// Helper: detect browser name
function getBrowserName() {
  if (typeof navigator === 'undefined') return 'Browser';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Browser';
}

// Helper: detect OS name
function getOSName() {
  if (typeof navigator === 'undefined') return 'OS';
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'OS';
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function SettingsView() {
  const store = useProgressStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [profileName, setProfileName] = useState(store.profile.name || 'Steven');
  const [profileEmail, setProfileEmail] = useState(store.profile.email || 'stevensaleh100@outlook.com');
  const [profileBio, setProfileBio] = useState(store.profile.bio || '');
  const [profileTimezone, setProfileTimezone] = useState('America/New_York');

  const [dailyGoal, setDailyGoal] = useState(store.profile.dailyHours || 2);
  const [targetDate, setTargetDate] = useState(store.profile.targetDate || '');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [studyReminders, setStudyReminders] = useState(true);

  const [fontSize, setFontSize] = useState('medium');
  const [compactMode, setCompactMode] = useState(false);

  const [showProfile, setShowProfile] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [achievementNotifs, setAchievementNotifs] = useState(true);
  const [communityNotifs, setCommunityNotifs] = useState(true);

  const [saved, setSaved] = useState(false);

  // Security state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const pwdStrength = useMemo(() => getPwdStrength(newPwd), [newPwd]);

  const loginHistoryList = useMemo(() => {
    const history = store.loginHistory || [];
    return history.slice(0, 5);
  }, [store.loginHistory]);

  const handleChangePassword = () => {
    if (!currentPwd) { toast.error('Please enter your current password.'); return; }
    if (!newPwd) { toast.error('Please enter a new password.'); return; }
    if (newPwd.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    if (newPwd !== confirmNewPwd) { toast.error('New passwords do not match.'); return; }
    // Simulate password change
    toast.success('Password updated successfully!');
    setCurrentPwd('');
    setNewPwd('');
    setConfirmNewPwd('');
  };

  const handleLockAccount = () => {
    store.lockAccount(30);
    toast.success('Account locked for 30 minutes. You will need to wait or contact support.');
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    store.updateProfile({
      name: profileName,
      email: profileEmail,
      bio: profileBio,
      dailyHours: dailyGoal,
      targetDate,
    });
    setSaved(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      profile: store.profile,
      completedTopics: store.completedTopics,
      streak: store.streak,
      studyDates: store.studyDates,
      quizHighScore: store.quizHighScore,
      bookStatuses: store.bookStatuses,
      flashcards: store.flashcards,
      notes: store.notes,
      completedCertificates: store.completedCertificates,
      practiceScores: store.practiceScores,
      completedDailyChallenges: store.completedDailyChallenges,
      projects: store.projects,
      chatMessages: store.chatMessages,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datatrack-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleResetProgress = () => {
    store.resetProgress();
    toast.success('All progress has been reset');
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account, preferences, and privacy</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

        {/* ─── Profile Settings ─── */}
        <motion.div variants={item}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Profile Settings
              </CardTitle>
              <CardDescription>Your personal information and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {profileName ? profileName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="font-semibold">{profileName}</h3>
                  <p className="text-sm text-muted-foreground">{profileEmail}</p>
                  <Badge className="mt-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-[10px]">
                    <Crown className="w-3 h-3 mr-1" />Pro Member
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-name">Full Name</Label>
                  <Input
                    id="settings-name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">Email Address</Label>
                  <Input
                    id="settings-email"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="Your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-bio">Bio</Label>
                <Textarea
                  id="settings-bio"
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-20 resize-none"
                  maxLength={280}
                />
                <p className="text-xs text-muted-foreground text-right">{profileBio.length}/280</p>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={profileTimezone} onValueChange={setProfileTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Study Preferences ─── */}
        <motion.div variants={item}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Study Preferences
              </CardTitle>
              <CardDescription>Configure your study goals and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Daily Study Hours Goal</Label>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{dailyGoal}h</span>
                </div>
                <Slider
                  value={[dailyGoal]}
                  onValueChange={(v) => setDailyGoal(v[0])}
                  min={1}
                  max={8}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1h</span>
                  <span>4h</span>
                  <span>8h</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="settings-target">Target Completion Date</Label>
                <Input
                  id="settings-target"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Preferred Difficulty Level</Label>
                <RadioGroup value={difficulty} onValueChange={setDifficulty} className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'beginner', label: 'Beginner', desc: 'Fundamentals first', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
                    { value: 'intermediate', label: 'Intermediate', desc: 'Balanced approach', color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' },
                    { value: 'advanced', label: 'Advanced', desc: 'Challenge me', color: 'border-rose-500 bg-rose-50 dark:bg-rose-950/20' },
                  ].map((opt) => (
                    <label key={opt.value} className={cn(
                      'flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all',
                      difficulty === opt.value ? opt.color : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    )}>
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Study Reminders</p>
                  <p className="text-xs text-muted-foreground">Get notified to study every day</p>
                </div>
                <Switch checked={studyReminders} onCheckedChange={setStudyReminders} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Appearance Settings ─── */}
        <motion.div variants={item}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-violet-500" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize how DataTrack looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {mounted && [
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isActive = theme === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          isActive
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                            : 'border-transparent bg-muted/30 hover:bg-muted/50'
                        )}
                      >
                        <Icon className={cn('w-5 h-5', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')} />
                        <span className={cn('text-xs font-medium', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>{opt.label}</span>
                        {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Font Size</Label>
                <RadioGroup value={fontSize} onValueChange={setFontSize} className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'small', label: 'Small', sample: 'Aa' },
                    { value: 'medium', label: 'Medium', sample: 'Aa' },
                    { value: 'large', label: 'Large', sample: 'Aa' },
                  ].map((opt) => (
                    <label key={opt.value} className={cn(
                      'flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all',
                      fontSize === opt.value
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                        : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    )}>
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      <span className={cn(
                        'font-medium',
                        opt.value === 'small' && 'text-xs',
                        opt.value === 'medium' && 'text-sm',
                        opt.value === 'large' && 'text-base',
                      )}>{opt.sample}</span>
                      <span className={cn(
                        'text-xs',
                        fontSize === opt.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                      )}>{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Compact Mode</p>
                  <p className="text-xs text-muted-foreground">Reduce spacing and padding</p>
                </div>
                <Switch checked={compactMode} onCheckedChange={setCompactMode} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Privacy Settings ─── */}
        <motion.div variants={item}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-500" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control who can see your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Show Profile to Others</p>
                  <p className="text-xs text-muted-foreground">Other users can view your profile</p>
                </div>
                <Switch checked={showProfile} onCheckedChange={setShowProfile} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Show Activity to Others</p>
                  <p className="text-xs text-muted-foreground">Display your progress and achievements</p>
                </div>
                <Switch checked={showActivity} onCheckedChange={setShowActivity} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Data Collection</p>
                  <p className="text-xs text-muted-foreground">Help us improve by sharing usage data</p>
                </div>
                <Switch checked={dataCollection} onCheckedChange={setDataCollection} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Security Settings ─── */}
        <motion.div variants={item}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and login preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Password Change */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Change Password
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-xs text-muted-foreground">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPwd ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-xs text-muted-foreground">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPwd ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password strength meter */}
                    {newPwd && (
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: pwdStrength.width }} className={cn('h-full rounded-full', pwdStrength.color)} transition={{ duration: 0.3 }} />
                        </div>
                        <p className={cn('text-[10px] font-medium',
                          pwdStrength.level <= 1 && 'text-red-500',
                          pwdStrength.level === 2 && 'text-orange-500',
                          pwdStrength.level === 3 && 'text-yellow-600 dark:text-yellow-400',
                          pwdStrength.level >= 4 && 'text-emerald-500',
                        )}>{pwdStrength.label}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password" className="text-xs text-muted-foreground">Confirm New Password</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmNewPwd}
                      onChange={(e) => setConfirmNewPwd(e.target.value)}
                    />
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleChangePassword}>
                  Update Password
                </Button>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={store.twoFactorEnabled || false}
                  onCheckedChange={(v) => {
                    store.setTwoFactorEnabled(v);
                    toast.success(v ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled');
                  }}
                />
              </div>

              <Separator />

              {/* Active Sessions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  Active Sessions
                </h4>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {typeof navigator !== 'undefined' ? getBrowserName() : 'Browser'} on {typeof navigator !== 'undefined' ? getOSName() : 'OS'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {store.lastLoginTime ? `Active since ${new Date(store.lastLoginTime).toLocaleString()}` : 'No active session'}
                          {store.sessionDuration > 0 && ` · ${store.sessionDuration}m`}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-[10px]">
                      Current
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Login History */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  Login History
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {loginHistoryList.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No login history yet</p>
                  ) : (
                    loginHistoryList.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            entry.action === 'login' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                            entry.action === 'register' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            'bg-gray-100 dark:bg-gray-900/30',
                          )}>
                            {entry.action === 'login' ? <LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> :
                             entry.action === 'register' ? <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> :
                             <LogOut className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{entry.email}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {entry.action === 'login' ? 'Login' : entry.action === 'register' ? 'Registration' : 'Logout'} · {new Date(entry.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] capitalize">
                          {entry.action}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              {/* Require Password for Book Access */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-500" />
                    Require Password for Book Access
                  </p>
                  <p className="text-xs text-muted-foreground">Ask for password when opening protected books</p>
                </div>
                <Switch
                  checked={store.requirePasswordForBooks || false}
                  onCheckedChange={(v) => {
                    store.setRequirePasswordForBooks(v);
                    toast.success(v ? 'Book access protection enabled' : 'Book access protection disabled');
                  }}
                />
              </div>

              <Separator />

              {/* Lock Account */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Lock Account</p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Temporarily lock your account for 30 minutes</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40"
                  onClick={handleLockAccount}
                >
                  <Lock className="w-4 h-4 mr-1.5" />
                  Lock
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Notification Settings ─── */}
        <motion.div variants={item}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-500" />
                Notification Settings
              </CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <MailCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Daily Reminder Time</p>
                    <p className="text-xs text-muted-foreground">When to send study reminders</p>
                  </div>
                </div>
                <Input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-32"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Achievement Notifications</p>
                    <p className="text-xs text-muted-foreground">Celebrate milestones & badges</p>
                  </div>
                </div>
                <Switch checked={achievementNotifs} onCheckedChange={setAchievementNotifs} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Community Messages</p>
                    <p className="text-xs text-muted-foreground">Chat replies and mentions</p>
                  </div>
                </div>
                <Switch checked={communityNotifs} onCheckedChange={setCommunityNotifs} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Subscription Management ─── */}
        <motion.div variants={item}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                Subscription Management
              </CardTitle>
              <CardDescription>Manage your plan and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Pro Plan</h4>
                    <p className="text-xs text-muted-foreground">$9.99/month - Renews Mar 15, 2026</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Payment Method</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">VISA</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">**** **** **** 9873</p>
                      <p className="text-xs text-muted-foreground">Expires 12/2027</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Billing Address</Label>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-medium">Steven Saleh</p>
                    <p className="text-xs text-muted-foreground">stevensaleh100@outlook.com</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Danger Zone ─── */}
        <motion.div variants={item}>
          <Card className="border-red-200 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions that affect your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-800/50 bg-white/50 dark:bg-red-950/10">
                <div>
                  <p className="text-sm font-medium">Export Your Data</p>
                  <p className="text-xs text-muted-foreground">Download all your progress and settings</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-800/50 bg-white/50 dark:bg-red-950/10">
                    <div>
                      <p className="text-sm font-medium">Reset All Progress</p>
                      <p className="text-xs text-muted-foreground">Clear all topics, scores, and streaks</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Progress?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your completed topics, quiz scores, streaks, flashcards, notes, certificates, and practice scores. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleResetProgress}>
                      Yes, Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-red-300 dark:border-red-700/50 bg-red-50/50 dark:bg-red-950/20">
                    <div>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</p>
                      <p className="text-xs text-muted-foreground">Permanently remove your account and all data</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account, all progress data, flashcards, notes, certificates, and personal information. This action is irreversible and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => toast.error('Contact support to delete your account')}>
                      Yes, Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={item} className="flex justify-end gap-2 pb-8">
          <Button variant="outline" onClick={() => toast.info('Changes discarded')}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className={cn(
              'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20',
              saved && 'from-green-500 to-green-600'
            )}
          >
            <Save className="w-4 h-4 mr-2" />
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
