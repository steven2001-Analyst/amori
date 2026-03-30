'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Flame,
  BookOpen,
  CheckCircle2,
  Save,
  Bell,
  BellOff,
  RotateCcw,
  Target,
  Sun,
  Moon,
  Sparkles,
  Crown,
  Shield,
  Camera,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useProgressStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export default function ProfileView() {
  const store = useProgressStore();
  const profile = store.profile || { name: '', email: '', bio: '', targetDate: '', dailyHours: 2, joinedDate: '' };
  const updateProfile = store.updateProfile;
  const streak = store.streak || 0;
  const completedTopics = store.completedTopics || [];
  const studyDates = store.studyDates || [];
  const resetProgress = store.resetProgress;
  const subscriptionPlan = store.subscriptionPlan || 'free';
  const subscriptionStatus = store.subscriptionStatus || 'none';
  const userRole = store.userRole || 'guest';
  const isProUser = store.isProUser || (() => false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);
  const [targetDate, setTargetDate] = useState(profile.targetDate);
  const [dailyHours, setDailyHours] = useState(profile.dailyHours);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    studyReminders: true,
    streakAlerts: true,
    weeklyReport: false,
    communityUpdates: true,
  });

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(profile.profilePicture);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPicturePreview, setShowPicturePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, GIF, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setProfilePicture(dataUrl);
      store.setProfilePicture(dataUrl);
      setIsUploading(false);
      toast.success('Profile picture updated!');
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error('Failed to read the image file.');
    };
    reader.readAsDataURL(file);
  }, [store]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [processImageFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  }, [processImageFile]);

  const removeProfilePicture = useCallback(() => {
    setProfilePicture(undefined);
    store.setProfilePicture(null);
    toast.success('Profile picture removed.');
  }, [store]);

  const initials = useMemo(() => {
    const n = name.trim() || 'DT';
    return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }, [name]);

  const avatarContent = useMemo(() => {
    if (profilePicture) {
      return (
        <img
          src={profilePicture}
          alt={name || 'Profile'}
          className="w-full h-full object-cover rounded-[inherit]"
        />
      );
    }
    return <span>{initials}</span>;
  }, [profilePicture, initials, name]);

  const stats = useMemo(() => ({
    joinedDate: profile.joinedDate,
    topicsCompleted: completedTopics.length,
    currentStreak: streak,
    totalSessions: studyDates.length,
  }), [profile.joinedDate, completedTopics.length, streak, studyDates.length]);

  const handleSave = () => {
    updateProfile({ name, email, bio, targetDate, dailyHours });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const daysUntilTarget = useMemo(() => {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [targetDate]);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Profile & Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }} />
            </div>
          </div>
          <CardContent className="p-6 -mt-12 relative">
            {/* Avatar with profile picture upload */}
            <div className="relative group">
              <div className={cn(
                'w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600',
                'flex items-center justify-center shadow-xl border-4 border-background',
                'text-white text-2xl font-bold overflow-hidden',
                !profilePicture && 'cursor-pointer',
              )}
                onClick={() => !profilePicture && fileInputRef.current?.click()}
              >
                {avatarContent}
              </div>
              {/* Camera overlay button */}
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'absolute inset-0 rounded-2xl flex items-center justify-center transition-all duration-200',
                  'bg-black/0 group-hover:bg-black/40',
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  {isUploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
                      {profilePicture ? (
                        <Camera className="w-5 h-5 text-white" />
                      ) : (
                        <Upload className="w-5 h-5 text-white" />
                      )}
                    </div>
                  )}
                </div>
              </motion.button>
              {/* Remove button */}
              {profilePicture && (
                <motion.button
                  type="button"
                  onClick={removeProfilePicture}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              )}
              {/* Click to view preview */}
              {profilePicture && (
                <motion.button
                  type="button"
                  onClick={() => setShowPicturePreview(true)}
                  className="absolute -bottom-2 -left-2 w-7 h-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/></svg>
                </motion.button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Drag-and-drop zone (visible area around avatar) */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'mt-4 p-6 border-2 border-dashed rounded-xl text-center transition-all duration-200',
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                  : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700',
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                  isDragOver ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'
                )}>
                  <Upload className={cn('w-5 h-5', isDragOver ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400')} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isDragOver ? 'Drop your image here!' : 'Drag & drop your profile picture'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      browse files
                    </button>
                    {' '}— JPG, PNG, GIF, WebP (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Display Name
                  </Label>
                  <Input
                    id="profile-name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-bio" className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bio
                </Label>
                <Textarea
                  id="profile-bio"
                  placeholder="Tell us about yourself and your learning goals..."
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-target" className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Target Completion Date
                  </Label>
                  <Input
                    id="profile-target"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                  {daysUntilTarget !== null && targetDate && (
                    <p className="text-xs text-muted-foreground">
                      {daysUntilTarget > 0
                        ? `${daysUntilTarget} days remaining`
                        : 'Target date reached!'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Preferred Daily Study Hours: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dailyHours}h</span>
                  </Label>
                  <Slider
                    value={[dailyHours]}
                    onValueChange={([v]) => setDailyHours(v)}
                    min={0.5}
                    max={8}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5h</span>
                    <span>4h</span>
                    <span>8h</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: 'Member Since', value: stats.joinedDate ? new Date(stats.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A', icon: Calendar, gradient: 'from-violet-500 to-purple-500' },
          { label: 'Topics Completed', value: stats.topicsCompleted, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
          { label: 'Current Streak', value: `${stats.currentStreak}d`, icon: Flame, gradient: 'from-orange-400 to-amber-500' },
          { label: 'Study Sessions', value: stats.totalSessions, icon: BookOpen, gradient: 'from-cyan-500 to-teal-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', stat.gradient)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Subscription Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="font-semibold text-sm capitalize mt-1">{subscriptionPlan}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className={cn('font-semibold text-sm mt-1',
                  subscriptionStatus === 'active' ? 'text-emerald-600 dark:text-emerald-400'
                    : subscriptionStatus === 'expired' ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
                )}>
                  {subscriptionStatus === 'none' ? 'Free' : subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="font-semibold text-sm capitalize mt-1">{userRole}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">{isProUser() ? 'Pro Access Active' : 'Free Plan'}</p>
                  <p className="text-xs text-muted-foreground">{isProUser() ? 'Full access to all features' : 'Upgrade to unlock premium features'}</p>
                </div>
              </div>
              <Badge className={cn('text-xs font-medium border-0',
                isProUser()
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-muted text-muted-foreground'
              )}>
                {isProUser() ? 'Active' : 'Limited'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {mounted && (theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-violet-500" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                ))}
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                </div>
              </div>
              {mounted && (
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              )}
            </div>

            <Separator />

            {/* Notification Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Notifications</p>
                <Badge variant="secondary" className="text-[10px]">UI only</Badge>
              </div>
              {[
                { key: 'studyReminders' as const, label: 'Study Reminders', desc: 'Daily reminders to keep your streak' },
                { key: 'streakAlerts' as const, label: 'Streak Alerts', desc: 'Get notified before losing your streak' },
                { key: 'weeklyReport' as const, label: 'Weekly Progress Report', desc: 'Summary of your weekly achievements' },
                { key: 'communityUpdates' as const, label: 'Community Updates', desc: 'New posts and replies in community' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between pl-6">
                  <div>
                    <p className="text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Checkbox
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [item.key]: !!checked }))
                    }
                  />
                </div>
              ))}
            </div>

            <Separator />

            {/* Reset Progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Reset All Progress</p>
                  <p className="text-xs text-muted-foreground">This will clear all your learning progress, streak, and scores</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your progress, streak data, quiz scores, completed topics, projects, and saved resources. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={resetProgress}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Yes, reset everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSave}
          className={cn(
            'min-w-[140px] transition-all duration-300',
            saved
              ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20'
          )}
        >
          <Save className="w-4 h-4 mr-2" />
          {saved ? 'Saved!' : 'Save Profile'}
        </Button>
      </motion.div>

      {/* Profile Picture Preview Modal */}
      <AnimatePresence>
        {showPicturePreview && profilePicture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowPicturePreview(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPicturePreview(false)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={profilePicture}
                alt={name || 'Profile'}
                className="w-full rounded-2xl shadow-2xl"
              />
              <p className="text-center text-white/60 text-sm mt-4">{name || 'Profile Picture'}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
