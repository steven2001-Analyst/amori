'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Trophy,
  Star,
  Target,
  CheckCircle2,
  Circle,
  Zap,
  Sparkles,
  ChevronRight,
  Quote,
  TrendingUp,
  CalendarDays,
  Award,
  Lock,
  Crown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

// ─── Constants ───

const STORAGE_KEY = 'datatrack-streaks';

const MILESTONES = [
  { id: '3-days', label: 'Getting Started', days: 3, icon: '🌱', description: '3-day streak! You\'re building a habit.' },
  { id: '7-days', label: 'Week Warrior', days: 7, icon: '⚡', description: '7-day streak! One full week of consistency.' },
  { id: '14-days', label: 'Two Weeks Strong', days: 14, icon: '🔥', description: '14-day streak! Your dedication is impressive.' },
  { id: '30-days', label: 'Monthly Master', days: 30, icon: '💎', description: '30-day streak! You\'re a learning machine.' },
  { id: '60-days', label: 'Diamond Scholar', days: 60, icon: '🏆', description: '60-day streak! Elite-level consistency.' },
  { id: '90-days', label: 'Season Champion', days: 90, icon: '👑', description: '90-day streak! Three months of dedication.' },
  { id: '180-days', label: 'Half Year Hero', days: 180, icon: '🚀', description: '180-day streak! Six months of non-stop learning.' },
  { id: '365-days', label: 'Legendary', days: 365, icon: '🌟', description: '365-day streak! You are a legend of learning.' },
];

const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Learning is not attained by chance; it must be sought for with ardor.', author: 'Abigail Adams' },
  { text: 'The more that you read, the more things you will know.', author: 'Dr. Seuss' },
  { text: 'Data is the new oil. It\'s valuable, but if unrefined it cannot really be used.', author: 'Clive Humby' },
  { text: 'In God we trust. All others must bring data.', author: 'W. Edwards Deming' },
];

const DAILY_TASKS = [
  { key: 'topicCompleted', label: 'Complete a study topic', xp: 50, icon: '📚' },
  { key: 'practiceCompleted', label: 'Practice for 15+ minutes', xp: 30, icon: '✏️' },
  { key: 'aiToolUsed', label: 'Use an AI tool', xp: 20, icon: '🤖' },
] as const;

const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
const WEEKS = 12;
const XP_PER_LEVEL = 200;

// ─── Data Types ───

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  weeklyActivity: Record<string, number>; // 'YYYY-MM-DD': 0-3 tasks
  totalXP: number;
  level: number;
  dailyTasks: {
    topicCompleted: boolean;
    practiceCompleted: boolean;
    aiToolUsed: boolean;
  };
  dailyTaskDate: string | null;
  unlockedMilestones: string[];
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getDefaultStreakData(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    weeklyActivity: {},
    totalXP: 0,
    level: 1,
    dailyTasks: {
      topicCompleted: false,
      practiceCompleted: false,
      aiToolUsed: false,
    },
    dailyTaskDate: null,
    unlockedMilestones: [],
  };
}

function loadStreakData(): StreakData {
  if (typeof window === 'undefined') return getDefaultStreakData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStreakData();
    const parsed = JSON.parse(raw) as Partial<StreakData>;
    return {
      ...getDefaultStreakData(),
      ...parsed,
      dailyTasks: {
        ...getDefaultStreakData().dailyTasks,
        ...(parsed.dailyTasks || {}),
      },
    };
  } catch {
    return getDefaultStreakData();
  }
}

function saveStreakData(data: StreakData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

// ─── Fire Particle Component ───

function FireParticles({ active }: { active: boolean }) {
  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 60,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1.5,
      size: 4 + Math.random() * 6,
      emoji: ['🔥', '✨', '💥', '⭐'][Math.floor(Math.random() * 4)],
    }));
  }, [active]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -40 - p.x, x: p.x, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              repeatDelay: 0.3,
            }}
            className="absolute text-sm"
            style={{ left: '50%', top: '10%' }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───

export default function StreaksView() {
  const [streakData, setStreakData] = useState<StreakData>(getDefaultStreakData);
  const [mounted, setMounted] = useState(false);

  const store = useProgressStore();
  const storeStreak = store.streak || 0;
  const storeXP = store.xp || 0;
  const storeLevel = store.level || 1;

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadStreakData();
    requestAnimationFrame(() => {
      setStreakData(data);
      setMounted(true);
    });
  }, []);

  // Sync daily tasks date — reset if it's a new day
  useEffect(() => {
    if (!mounted) return;
    const today = getTodayString();
    if (streakData.dailyTaskDate !== today) {
      const yesterday = getYesterdayString();
      const isConsecutive = streakData.lastStudyDate === yesterday;
      let newStreak = streakData.currentStreak;

      if (streakData.lastStudyDate) {
        if (!isConsecutive && streakData.lastStudyDate !== today) {
          newStreak = 0;
        }
      }

      // Check if store has study activity from today to keep streak
      const todayActive = store.lastStudyDate === today || (store.studyDates || []).includes(today);

      const updatedData = {
        ...(loadStreakData()),
        dailyTasks: {
          topicCompleted: false,
          practiceCompleted: false,
          aiToolUsed: false,
        },
        dailyTaskDate: today,
        currentStreak: todayActive ? Math.max(newStreak, storeStreak) : newStreak,
      };
      saveStreakData(updatedData);
      requestAnimationFrame(() => {
        setStreakData(updatedData);
      });
    }
  }, [mounted, streakData.dailyTaskDate, streakData.lastStudyDate, storeStreak, store.lastStudyDate, store.studyDates]);

  // Persist on change
  useEffect(() => {
    if (mounted) {
      saveStreakData(streakData);
    }
  }, [streakData, mounted]);

  // ─── Computed Values ───

  const effectiveStreak = Math.max(streakData.currentStreak, storeStreak);
  const effectiveXP = Math.max(streakData.totalXP, storeXP);
  const effectiveLevel = Math.max(streakData.level, storeLevel);
  const xpForCurrentLevel = (effectiveLevel - 1) * XP_PER_LEVEL;
  const xpInCurrentLevel = effectiveXP - xpForCurrentLevel;
  const xpProgress = Math.min(100, (xpInCurrentLevel / XP_PER_LEVEL) * 100);
  const longestStreak = Math.max(streakData.longestStreak, effectiveStreak);

  // Check completed daily tasks count
  const completedTaskCount = Object.values(streakData.dailyTasks).filter(Boolean).length;

  // Daily quote
  const dailyQuote = useMemo(() => {
    const today = getTodayString();
    const dayOfYear = Math.floor(
      (new Date(today).getTime() - new Date(today.split('-')[0] + '-01-01').getTime()) / 86400000
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  // Check milestone unlocks
  const unlockedMilestones = useMemo(() => {
    return MILESTONES.filter((m) => effectiveStreak >= m.days);
  }, [effectiveStreak]);

  // ─── Handlers ───

  const toggleDailyTask = (taskKey: keyof StreakData['dailyTasks']) => {
      setStreakData((prev) => {
        const wasCompleted = prev.dailyTasks[taskKey];
        const newTasks = { ...prev.dailyTasks, [taskKey]: !wasCompleted };

        let newXP = prev.totalXP;
        let newLevel = prev.level;

        if (!wasCompleted) {
          const task = DAILY_TASKS.find((t) => t.key === taskKey);
          if (task) {
            newXP += task.xp;
            newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
            store.addXp(task.xp);
          }
        } else {
          const task = DAILY_TASKS.find((t) => t.key === taskKey);
          if (task) {
            newXP = Math.max(0, newXP - task.xp);
            newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
          }
        }

        const today = getTodayString();
        const allDone = newTasks.topicCompleted && newTasks.practiceCompleted && newTasks.aiToolUsed;

        // Update weekly activity
        const newActivity = { ...prev.weeklyActivity };
        const newCompletedCount = Object.values(newTasks).filter(Boolean).length;
        newActivity[today] = newCompletedCount;

        // Update streak when all tasks complete
        let newStreak = prev.currentStreak;
        let newLongest = prev.longestStreak;
        let newLastStudyDate = prev.lastStudyDate;
        let newUnlockedMilestones = [...prev.unlockedMilestones];

        if (allDone && !prev.dailyTasks.topicCompleted && !prev.dailyTasks.practiceCompleted && !prev.dailyTasks.aiToolUsed) {
          // This is the moment all 3 tasks become completed
          const yesterday = getYesterdayString();
          if (prev.lastStudyDate === yesterday || prev.lastStudyDate === today) {
            if (prev.lastStudyDate !== today) {
              newStreak = Math.max(newStreak, storeStreak) + 1;
            }
          } else {
            newStreak = 1;
          }
          newLastStudyDate = today;
          newLongest = Math.max(newLongest, newStreak);

          // Check for new milestone unlocks
          MILESTONES.forEach((m) => {
            if (newStreak >= m.days && !newUnlockedMilestones.includes(m.id)) {
              newUnlockedMilestones.push(m.id);
            }
          });
        }

        const updated = {
          ...prev,
          dailyTasks: newTasks,
          totalXP: newXP,
          level: newLevel,
          weeklyActivity: newActivity,
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastStudyDate: newLastStudyDate,
          unlockedMilestones: newUnlockedMilestones,
        };

        if (!wasCompleted) {
          const task = DAILY_TASKS.find((t) => t.key === taskKey);
          if (task) {
            toast.success(`${task.label} — +${task.xp} XP earned!`, {
              icon: task.icon,
            });
          }
        }

        if (allDone && !wasCompleted) {
          toast.success('🎉 All daily tasks complete! Streak maintained!', {
            duration: 4000,
          });
        }

        saveStreakData(updated);
        return updated;
      });
    };

  // ─── Heatmap Data ───

  const heatmapCells = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (WEEKS * 7 - 1) + ((startDate.getDay() + 6) % 7));

    const cells: { date: Date; dateStr: string; intensity: number }[] = [];
    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + w * 7 + d);
        const dateStr = date.toISOString().split('T')[0];

        // Combine streak activity with store studyDates
        let intensity = streakData.weeklyActivity[dateStr] || 0;
        if (intensity === 0 && (store.studyDates || []).includes(dateStr)) {
          intensity = 2; // Treat store study days as medium activity
        }
        if (dateStr > getTodayString()) {
          intensity = -1; // Future date
        }

        cells.push({ date, dateStr, intensity });
      }
    }
    return cells;
  }, [streakData.weeklyActivity, store.studyDates]);

  const heatmapColors: Record<number, string> = {
    '-1': 'bg-transparent',
    '0': 'bg-muted/40 dark:bg-muted/20',
    '1': 'bg-emerald-200 dark:bg-emerald-800/40',
    '2': 'bg-emerald-400 dark:bg-emerald-600/60',
    '3': 'bg-emerald-600 dark:bg-emerald-500',
  };

  // ─── Recent Milestones (newly unlocked) ───

  const recentMilestone = useMemo(() => {
    if (streakData.unlockedMilestones.length === 0) return null;
    const lastId = streakData.unlockedMilestones[streakData.unlockedMilestones.length - 1];
    return MILESTONES.find((m) => m.id === lastId) || null;
  }, [streakData.unlockedMilestones]);

  // ─── Next milestone ───

  const nextMilestone = useMemo(() => {
    return MILESTONES.find((m) => effectiveStreak < m.days) || null;
  }, [effectiveStreak]);

  // ─── Streak animation ───

  const streakIsActive = effectiveStreak > 0;

  if (!mounted) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-muted/50 rounded-2xl" />
          <div className="h-32 bg-muted/50 rounded-2xl" />
          <div className="h-64 bg-muted/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Streaks & Rewards</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Build daily habits, earn XP, and unlock milestone badges
        </p>
      </motion.div>

      {/* ─── Current Streak Display ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 p-6 sm:p-8 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
            </div>

            <div className="relative flex flex-col items-center text-center">
              {/* Fire emoji with particles */}
              <div className="relative mb-4">
                <motion.div
                  animate={
                    streakIsActive
                      ? {
                          scale: [1, 1.15, 1],
                          rotate: [-3, 3, -3],
                        }
                      : { scale: 1 }
                  }
                  transition={
                    streakIsActive
                      ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                      : {}
                  }
                  className="text-7xl sm:text-8xl drop-shadow-2xl"
                >
                  🔥
                </motion.div>
                <FireParticles active={streakIsActive} />
              </div>

              {/* Streak count */}
              <motion.div
                key={effectiveStreak}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="mb-1"
              >
                <span className="text-5xl sm:text-6xl font-black text-white drop-shadow-lg">
                  {effectiveStreak}
                </span>
              </motion.div>
              <p className="text-white/90 text-lg font-medium">
                {effectiveStreak === 1 ? 'day in a row!' : 'days in a row!'}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-4 sm:gap-6 mt-5">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-200" />
                    <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium">
                      Best
                    </span>
                  </div>
                  <span className="text-lg font-bold text-white">{longestStreak}</span>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-200" />
                    <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium">
                      Level
                    </span>
                  </div>
                  <span className="text-lg font-bold text-white">{effectiveLevel}</span>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-200" />
                    <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium">
                      Total XP
                    </span>
                  </div>
                  <span className="text-lg font-bold text-white">{effectiveXP.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ─── Two Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Daily Checklist ─── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Daily Checklist
                </CardTitle>
                <Badge
                  variant={completedTaskCount === 3 ? 'default' : 'outline'}
                  className={
                    completedTaskCount === 3
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : ''
                  }
                >
                  {completedTaskCount}/3
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {DAILY_TASKS.map((task, index) => {
                const isCompleted = streakData.dailyTasks[task.key];
                return (
                  <motion.button
                    key={task.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.08 }}
                    onClick={() => toggleDailyTask(task.key)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left group',
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-muted/30 border-transparent hover:bg-muted/50 hover:border-muted-foreground/10'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300',
                        isCompleted
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                          : 'bg-muted'
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {isCompleted ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="circle"
                            initial={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Circle className="w-5 h-5 text-muted-foreground/40" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium transition-colors',
                          isCompleted ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-foreground'
                        )}
                      >
                        {task.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        +{task.xp} XP
                      </p>
                    </div>

                    <span className="text-lg shrink-0">{task.icon}</span>
                  </motion.button>
                );
              })}

              {/* Completion message */}
              <AnimatePresence>
                {completedTaskCount === 3 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/50 dark:border-emerald-800/30">
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        All tasks complete! Keep your streak alive tomorrow!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── XP Progress ─── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-6"
        >
          {/* Level Progress Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                XP & Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Level badge */}
              <div className="flex items-center gap-4">
                <motion.div
                  key={effectiveLevel}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg',
                    effectiveLevel >= 10
                      ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500'
                      : effectiveLevel >= 5
                        ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500'
                        : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
                  )}
                >
                  <span className="text-2xl font-black text-white">{effectiveLevel}</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">Level {effectiveLevel}</h3>
                    {effectiveLevel >= 10 && (
                      <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                        <Crown className="w-3 h-3 mr-0.5" />Elite
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {xpInCurrentLevel} / {XP_PER_LEVEL} XP to Level {effectiveLevel + 1}
                  </p>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      effectiveLevel >= 10
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                        : effectiveLevel >= 5
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    )}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Level {effectiveLevel}</span>
                  <span>{Math.round(xpProgress)}%</span>
                  <span>Level {effectiveLevel + 1}</span>
                </div>
              </div>

              {/* XP Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {DAILY_TASKS.map((task) => (
                  <div
                    key={task.key}
                    className="text-center p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-base">{task.icon}</span>
                    <p className="text-xs font-semibold text-foreground mt-1">+{task.xp}</p>
                    <p className="text-[10px] text-muted-foreground">XP</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Milestone Preview */}
          {nextMilestone && (
            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-muted/50 flex items-center justify-center text-2xl shadow-sm">
                    {nextMilestone.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Next Milestone</p>
                    <p className="text-sm font-bold">{nextMilestone.label}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (effectiveStreak / nextMilestone.days) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                        {nextMilestone.days - effectiveStreak}d left
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* ─── Weekly Heatmap ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-500" />
                Activity Heatmap
              </CardTitle>
              <span className="text-xs text-muted-foreground">Last {WEEKS} weeks</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] pt-0 shrink-0">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="h-[13px] flex items-center"
                  >
                    <span className="text-[10px] text-muted-foreground w-6 text-right leading-none">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="flex gap-[3px] overflow-x-auto pb-1 flex-1">
                {Array.from({ length: WEEKS }).map((_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const cell = heatmapCells[weekIdx * 7 + dayIdx];
                      if (!cell) return null;

                      const isToday = cell.dateStr === getTodayString();
                      const activityCount = cell.intensity >= 0 ? cell.intensity : 0;

                      return (
                        <TooltipProvider key={dayIdx} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  'w-[13px] h-[13px] rounded-[3px] transition-all duration-200 cursor-default',
                                  heatmapColors[cell.intensity],
                                  isToday && 'ring-1 ring-emerald-500 ring-offset-1 ring-offset-background',
                                  cell.intensity > 0 && 'hover:scale-125'
                                )}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p className="font-medium">{cell.dateStr}</p>
                              <p className="text-muted-foreground">
                                {isToday
                                  ? 'Today'
                                  : cell.dateStr === getYesterdayString()
                                    ? 'Yesterday'
                                    : ''}
                                {activityCount > 0
                                  ? ` — ${activityCount} task${activityCount > 1 ? 's' : ''} completed`
                                  : ' — No activity'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {[0, 1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'w-[13px] h-[13px] rounded-[3px]',
                    heatmapColors[level]
                  )}
                />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>

            {/* Activity Summary */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  {Object.values(streakData.weeklyActivity).filter((v) => v > 0).length + (store.studyDates || []).length} active days
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">
                  {unlockedMilestones.length} milestones earned
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Milestone Badges ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Milestone Badges
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {unlockedMilestones.length} / {MILESTONES.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MILESTONES.map((milestone, index) => {
                const isUnlocked = effectiveStreak >= milestone.days;
                const isNewlyUnlocked = streakData.unlockedMilestones.includes(milestone.id);
                const isNext = nextMilestone?.id === milestone.id;

                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.06 }}
                  >
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 text-center cursor-default',
                              isUnlocked
                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/60 dark:border-amber-800/40 shadow-sm'
                                : isNext
                                  ? 'bg-gradient-to-br from-muted/80 to-muted/40 border-amber-300/50 dark:border-amber-700/30 border-dashed'
                                  : 'bg-muted/20 border-transparent opacity-50 grayscale'
                            )}
                          >
                            {/* New badge indicator */}
                            {isNewlyUnlocked && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md"
                              >
                                <Sparkles className="w-3 h-3 text-white" />
                              </motion.div>
                            )}

                            {/* Next milestone indicator */}
                            {isNext && !isUnlocked && (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-md"
                              >
                                <ChevronRight className="w-3 h-3 text-white" />
                              </motion.div>
                            )}

                            {/* Icon */}
                            <motion.div
                              animate={
                                isUnlocked
                                  ? { y: [0, -3, 0] }
                                  : {}
                              }
                              transition={
                                isUnlocked
                                  ? { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }
                                  : {}
                              }
                              className="text-3xl sm:text-4xl mb-2"
                            >
                              {isUnlocked ? milestone.icon : '🔒'}
                            </motion.div>

                            {/* Label */}
                            <p
                              className={cn(
                                'text-xs font-semibold leading-tight',
                                isUnlocked ? 'text-amber-800 dark:text-amber-300' : 'text-muted-foreground'
                              )}
                            >
                              {milestone.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {milestone.days} days
                            </p>

                            {/* Progress bar for locked milestones */}
                            {!isUnlocked && (
                              <div className="w-full mt-2">
                                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${Math.min(100, (effectiveStreak / milestone.days) * 100)}%`,
                                    }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[200px]">
                          <p className="font-semibold">{milestone.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {milestone.description}
                          </p>
                          {isUnlocked ? (
                            <p className="text-xs text-emerald-500 font-medium mt-1">✓ Unlocked!</p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              {milestone.days - effectiveStreak} days to go
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Motivational Quote ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="shrink-0 mt-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
                  <Quote className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <blockquote className="text-base sm:text-lg font-medium text-violet-900 dark:text-violet-200 leading-relaxed italic">
                  &ldquo;{dailyQuote.text}&rdquo;
                </blockquote>
                <p className="text-sm text-violet-600/70 dark:text-violet-400/70 mt-2 font-medium">
                  — {dailyQuote.author}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Stats Summary ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Current Streak',
              value: effectiveStreak,
              suffix: 'd',
              icon: Flame,
              color: 'text-orange-500',
              bg: 'bg-orange-50 dark:bg-orange-950/20',
            },
            {
              label: 'Longest Streak',
              value: longestStreak,
              suffix: 'd',
              icon: Trophy,
              color: 'text-amber-500',
              bg: 'bg-amber-50 dark:bg-amber-950/20',
            },
            {
              label: 'Total XP',
              value: effectiveXP.toLocaleString(),
              suffix: '',
              icon: Zap,
              color: 'text-violet-500',
              bg: 'bg-violet-50 dark:bg-violet-950/20',
            },
            {
              label: 'Milestones',
              value: `${unlockedMilestones.length}/${MILESTONES.length}`,
              suffix: '',
              icon: Award,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50 dark:bg-emerald-950/20',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', stat.bg)}>
                      <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
                    </div>
                  </div>
                  <p className="text-xl font-bold">{stat.value}{stat.suffix}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
