'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import {
  Bell,
  BellOff,
  Check,
  CheckCircle,
  Trash2,
  Settings,
  Flame,
  BookOpen,
  MessageCircle,
  Trophy,
  Zap,
  Clock,
  X,
  Info,
  Award,
  GraduationCap,
  Star,
  AlertTriangle,
  Users,
  Target,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

// ─── Types ───
type NotificationCategory = 'all' | 'achievement' | 'social' | 'system' | 'reminders';

interface NotificationItem {
  id: string;
  type: 'achievement' | 'social' | 'system' | 'reminder' | 'streak' | 'update';
  title: string;
  message: string;
  detail?: string;
  timestamp: number;
  read: boolean;
  icon: string;
  actionUrl?: string;
  actionLabel?: string;
}

// ─── Category config ───
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  achievement: { label: 'Achievements', icon: Trophy, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/30', borderColor: 'border-l-amber-500' },
  streak: { label: 'Achievements', icon: Flame, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-l-orange-500' },
  reminder: { label: 'Reminders', icon: Clock, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', borderColor: 'border-l-emerald-500' },
  social: { label: 'Social', icon: Users, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-l-blue-500' },
  system: { label: 'System', icon: Info, color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-50 dark:bg-slate-950/30', borderColor: 'border-l-slate-500' },
  update: { label: 'System', icon: Zap, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-50 dark:bg-violet-950/30', borderColor: 'border-l-violet-500' },
};

function getCategoryForType(type: string): NotificationCategory {
  if (type === 'achievement' || type === 'streak') return 'achievement';
  if (type === 'social') return 'social';
  if (type === 'reminder') return 'reminders';
  return 'system';
}

// ─── Time helpers ───
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} min ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString();
}

function getDateGroup(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const twoDaysAgo = new Date(today.getTime() - 2 * 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  if (date >= today) return 'Today';
  if (date >= yesterday) return 'Yesterday';
  if (date >= twoDaysAgo) return 'Earlier this week';
  if (date >= weekAgo) return 'This week';
  return 'Previous';
}

// ─── No pre-seeded notifications — all notifications are real user-generated ───
function generateSeedNotifications(): NotificationItem[] {
  return [];
}

// ─── Main Component ───
export default function NotificationCenterView() {
  const store = useProgressStore();
  const notifications = store.notifications || [];
  const addNotification = store.addNotification;
  const markNotificationRead = store.markNotificationRead;
  const clearNotifications = store.clearNotifications;

  const [activeTab, setActiveTab] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    achievements: true,
    studyReminders: true,
    streakAlerts: true,
    community: true,
    system: true,
  });
  const [remindInterval, setRemindInterval] = useState('4');

  // Seed notifications on mount
  const seededRef = React.useRef(false);
  useEffect(() => {
    if (!seededRef.current && notifications.length === 0) {
      seededRef.current = true;
      const seeds = generateSeedNotifications();
      seeds.forEach((n) => {
        addNotification({ type: n.type, title: n.title, message: n.message, read: n.read, icon: n.icon });
      });
    }
  }, []);

  // Filter by category
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'achievement') return notifications.filter((n) => n.type === 'achievement' || n.type === 'streak');
    if (activeTab === 'social') return notifications.filter((n) => n.type === 'social');
    if (activeTab === 'reminders') return notifications.filter((n) => n.type === 'reminder');
    if (activeTab === 'system') return notifications.filter((n) => n.type === 'system' || n.type === 'update');
    return notifications;
  }, [notifications, activeTab]);

  // Group by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {};
    const order = ['Today', 'Yesterday', 'Earlier this week', 'This week', 'Previous'];
    filteredNotifications.forEach((n) => {
      const group = getDateGroup(n.timestamp);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    });
    // Sort within each group by timestamp descending
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.timestamp - a.timestamp);
    });
    return order.filter((g) => groups[g]?.length).map((g) => ({ label: g, items: groups[g] }));
  }, [filteredNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handlers
  const handleMarkAllRead = useCallback(() => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n.id);
    });
    toast.success('All notifications marked as read');
  }, [notifications, markNotificationRead]);

  const handleClearAll = useCallback(() => {
    clearNotifications();
    setShowClearConfirm(false);
    toast.success('All notifications cleared');
  }, [clearNotifications]);

  const handleDeleteNotification = useCallback((id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    useProgressStore.setState({ notifications: updated });
    toast.success('Notification deleted');
  }, [notifications]);

  const handleToggleSetting = useCallback((key: keyof typeof notifSettings) => {
    setNotifSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`${key === 'achievements' ? 'Achievement' : key === 'studyReminders' ? 'Study reminder' : key === 'streakAlerts' ? 'Streak alert' : key === 'community' ? 'Community' : 'System'} notifications ${next[key] ? 'enabled' : 'disabled'}`);
      return next;
    });
  }, []);

  const handleOpenNotification = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
  };

  // Find the seed data for detail view (since store notifications don't have detail field)
  const seedNotifications = useMemo(() => generateSeedNotifications(), []);
  const getNotificationDetail = (notification: NotificationItem) => {
    const seed = seedNotifications.find(s => s.title === notification.title);
    return seed?.detail || seed?.message || notification.message;
  };

  // Get icon component from type
  function getNotificationIcon(type: string) {
    const config = CATEGORY_CONFIG[type] || CATEGORY_CONFIG.system;
    const IconComponent = config.icon;
    return <IconComponent className={cn('w-5 h-5', config.color)} />;
  }

  // ─── Empty State ───
  if (filteredNotifications.length === 0 && notifications.length === 0 && !showSettings) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notification Center</h1>
              <p className="text-sm text-muted-foreground">Stay updated with your progress</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-1.5" />
            Settings
          </Button>
        </div>

        {/* Empty state */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">You&apos;re all caught up! 🎉</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            No notifications to show. Keep learning and achievements will appear here.
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Settings Panel ───
  if (showSettings) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notification Settings</h1>
            <p className="text-sm text-muted-foreground">Manage what you want to be notified about</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Achievement Notifications</p>
                  <p className="text-xs text-muted-foreground">Badges, certificates, milestones</p>
                </div>
              </div>
              <Switch checked={notifSettings.achievements} onCheckedChange={() => handleToggleSetting('achievements')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Study Reminders</p>
                  <p className="text-xs text-muted-foreground">Periodic study prompts</p>
                </div>
              </div>
              <Switch checked={notifSettings.studyReminders} onCheckedChange={() => handleToggleSetting('studyReminders')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Streak Alerts</p>
                  <p className="text-xs text-muted-foreground">Streak milestones and warnings</p>
                </div>
              </div>
              <Switch checked={notifSettings.streakAlerts} onCheckedChange={() => handleToggleSetting('streakAlerts')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Community Updates</p>
                  <p className="text-xs text-muted-foreground">Messages, replies, mentions</p>
                </div>
              </div>
              <Switch checked={notifSettings.community} onCheckedChange={() => handleToggleSetting('community')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                  <Info className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">System Alerts</p>
                  <p className="text-xs text-muted-foreground">Platform updates, maintenance</p>
                </div>
              </div>
              <Switch checked={notifSettings.system} onCheckedChange={() => handleToggleSetting('system')} />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Remind me to study every</p>
                    <p className="text-xs text-muted-foreground">Set your study interval</p>
                  </div>
                </div>
                <Select value={remindInterval} onValueChange={setRemindInterval}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setShowSettings(false)}>
            <X className="w-4 h-4 mr-1.5" />
            Back to Notifications
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main Notification View ───
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notification Center</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <Check className="w-4 h-4 mr-1.5" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(true)}>
            <Trash2 className="w-4 h-4 mr-1.5" />
            Clear All
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="h-9 w-9">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="all" className="text-xs sm:text-sm gap-1.5">
            All
            {unreadCount > 0 && (
              <Badge variant="default" className="h-4 min-w-4 px-1 text-[10px] bg-emerald-600 hover:bg-emerald-700">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="achievement" className="text-xs sm:text-sm gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs sm:text-sm gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs sm:text-sm gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs sm:text-sm gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reminders</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notification List grouped by date */}
      <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {groupedNotifications.map((group) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Date group header */}
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h3>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {group.items.length}
                </Badge>
              </div>

              {/* Notification cards */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {group.items.map((notification, index) => {
                    const config = CATEGORY_CONFIG[notification.type] || CATEGORY_CONFIG.system;
                    const IconComponent = config.icon;
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        layout
                      >
                        <Card
                          className={cn(
                            'relative border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md group',
                            notification.read
                              ? 'bg-card border-l-transparent'
                              : cn(config.bgColor, config.borderColor, 'border-l-[3px]'),
                          )}
                          onClick={() => handleOpenNotification(notification)}
                        >
                          <div className="flex items-start gap-3 p-4">
                            {/* Icon */}
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                              config.bgColor,
                            )}>
                              <IconComponent className={cn('w-5 h-5', config.color)} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className={cn(
                                  'text-sm leading-tight truncate',
                                  notification.read ? 'font-medium text-muted-foreground' : 'font-semibold text-foreground',
                                )}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-[11px] text-muted-foreground/70 mt-1.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(notification.timestamp)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state for filtered tabs */}
        {groupedNotifications.length === 0 && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BellOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">No notifications in this category</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Check back later for updates</p>
          </motion.div>
        )}

        {/* All cleared state */}
        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">All clear! 🎉</h2>
            <p className="text-muted-foreground text-center max-w-sm">
              You&apos;ve read and dismissed all notifications. New ones will appear here automatically.
            </p>
          </motion.div>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all {notifications.length} notification{notifications.length !== 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notification Detail Modal */}
      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                selectedNotification ? (CATEGORY_CONFIG[selectedNotification.type] || CATEGORY_CONFIG.system).bgColor : '',
              )}>
                {selectedNotification && getNotificationIcon(selectedNotification.type)}
              </div>
              <div>
                <span>{selectedNotification?.title}</span>
                {selectedNotification && (
                  <p className="text-xs text-muted-foreground font-normal mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(selectedNotification.timestamp)}
                  </p>
                )}
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">Full details for this notification.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-sm leading-relaxed text-foreground/90">
                {selectedNotification ? getNotificationDetail(selectedNotification) : ''}
              </p>
            </div>
            {selectedNotification?.actionUrl && selectedNotification?.actionLabel && (
              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {selectedNotification.actionLabel}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
