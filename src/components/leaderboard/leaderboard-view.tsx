'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import {
  Trophy, Star, Flame, Zap, Target, Crown, Medal,
  TrendingUp, TrendingDown, Minus, Gift, Calendar, BarChart3,
  BookOpen, Brain, MessageCircle, Award, Clock, Lock,
  CheckCircle2, ArrowRight, Sparkles,
} from 'lucide-react';

const XP_PER_LEVEL = 500;

// ─── Achievement Definitions ───────────────────────────────────────
interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'Study' | 'Quiz' | 'Streak' | 'Social' | 'Special';
  check: (store: ReturnType<typeof useProgressStore.getState>) => boolean;
}

const achievementDefs: Achievement[] = [
  {
    id: 'bookworm', name: 'Bookworm', emoji: '\u{1F4DA}',
    description: 'Read 5 books', category: 'Study',
    check: (s) => {
      const statuses = Object.values(s.bookStatuses || {});
      return statuses.filter((b) => b === 'completed').length >= 5;
    },
  },
  {
    id: 'streak-master', name: 'Streak Master', emoji: '\u{1F525}',
    description: '7-day streak', category: 'Streak',
    check: (s) => (s.streak || 0) >= 7,
  },
  {
    id: 'quiz-whiz', name: 'Quiz Whiz', emoji: '\u{1F9E0}',
    description: '100% quiz score', category: 'Quiz',
    check: (s) => (s.quizHighScore || 0) >= 100,
  },
  {
    id: 'social-star', name: 'Social Star', emoji: '\u{1F4AC}',
    description: '10 chat messages', category: 'Social',
    check: (s) => (s.chatMessages || []).length >= 10,
  },
  {
    id: 'speed-demon', name: 'Speed Demon', emoji: '\u26A1',
    description: '60+ WPM typing', category: 'Special',
    check: (s) => (s.typingGameBestWpm || 0) >= 60,
  },
  {
    id: 'completionist', name: 'Completionist', emoji: '\u{1F3C6}',
    description: 'Finish a subject', category: 'Study',
    check: (s) => {
      const subs = s._getSubjectsForCheck?.() || [];
      return subs.some((id: string) => {
        const p = s.getSubjectProgress(id);
        return p === 100;
      });
    },
  },
  {
    id: 'daily-devotee', name: 'Daily Devotee', emoji: '\u{1F3AF}',
    description: 'Complete daily quest 7 days', category: 'Streak',
    check: (s) => (s.completedDailyChallenges || []).length >= 7,
  },
  {
    id: 'rising-star', name: 'Rising Star', emoji: '\u{1F31F}',
    description: 'Reach level 5', category: 'Special',
    check: (s) => (s.level || 1) >= 5,
  },
  {
    id: 'diamond', name: 'Diamond', emoji: '\u{1F48E}',
    description: 'Reach level 10', category: 'Special',
    check: (s) => (s.level || 1) >= 10,
  },
  {
    id: 'data-pro', name: 'Data Pro', emoji: '\u{1F4C8}',
    description: 'Complete 50 topics', category: 'Study',
    check: (s) => (s.completedTopics || []).length >= 50,
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  Study: <BookOpen className="h-4 w-4" />,
  Quiz: <Brain className="h-4 w-4" />,
  Streak: <Flame className="h-4 w-4" />,
  Social: <MessageCircle className="h-4 w-4" />,
  Special: <Sparkles className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  Study: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Quiz: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Streak: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Social: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Special: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

// ─── Helpers ───────────────────────────────────────────────────────
function getLast14Days(): string[] {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getDaysRemainingInWeek(): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
}

// ─── XP Bar Chart Component ────────────────────────────────────────
function XpBarChart({ history }: { history: Array<{ date: string; xp: number }> }) {
  const days = getLast14Days();
  const data = days.map((d) => {
    const entry = history.find((h) => h.date === d);
    return { date: d, xp: entry?.xp || 0 };
  });
  const maxXp = Math.max(...data.map((d) => d.xp), 10);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const barWidth = 100 / 14;
  const chartHeight = 160;

  return (
    <div className="w-full">
      <div className="relative" style={{ height: chartHeight + 30 }}>
        <svg viewBox={`0 0 700 ${chartHeight + 30}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <line
              key={frac}
              x1="30" y1={chartHeight * (1 - frac)} x2="700" y2={chartHeight * (1 - frac)}
              stroke="currentColor" strokeOpacity={0.08} strokeDasharray="4 4"
            />
          ))}
          {/* Bars */}
          {data.map((d, i) => {
            const barH = (d.xp / maxXp) * chartHeight;
            const x = 35 + i * ((700 - 40) / 14);
            const bw = ((700 - 40) / 14) * 0.6;
            const y = chartHeight - barH;
            return (
              <g key={d.date} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                {d.xp > 0 && (
                  <rect
                    x={x} y={y} width={bw} height={barH}
                    fill="url(#barGrad)" rx="4" ry="4"
                    className="transition-all duration-200 cursor-pointer"
                    style={{ opacity: hoveredIdx === i ? 1 : 0.8 }}
                  />
                )}
                {d.xp === 0 && (
                  <rect
                    x={x} y={chartHeight - 2} width={bw} height={2}
                    fill="currentColor" opacity={0.1} rx="1"
                  />
                )}
              </g>
            );
          })}
        </svg>
        {/* Tooltip */}
        <AnimatePresence>
          {hoveredIdx !== null && data[hoveredIdx].xp > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute bg-popover text-popover-foreground border rounded-lg px-3 py-1.5 shadow-lg text-sm font-medium pointer-events-none z-10"
              style={{
                left: `${(hoveredIdx / 14) * 100}%`,
                top: `${((1 - data[hoveredIdx].xp / maxXp) * chartHeight / (chartHeight + 30)) * 100}%`,
                transform: 'translate(-50%, -110%)',
              }}
            >
              +{data[hoveredIdx].xp} XP
              <div className="text-[10px] text-muted-foreground">{formatDay(data[hoveredIdx].date)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Day labels */}
      <div className="flex justify-between mt-1 px-1">
        {data.filter((_, i) => i % 2 === 0).map((d) => (
          <span key={d.date} className="text-[10px] text-muted-foreground">
            {new Date(d.date + 'T12:00:00').getDate()}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Quest Icons ───────────────────────────────────────────────────
function questIcon(type: string) {
  switch (type) {
    case 'study': return <BookOpen className="h-5 w-5 text-emerald-600" />;
    case 'quiz': return <Brain className="h-5 w-5 text-purple-600" />;
    case 'books': return <Star className="h-5 w-5 text-amber-600" />;
    case 'community': return <MessageCircle className="h-5 w-5 text-pink-600" />;
    case 'streak': return <Flame className="h-5 w-5 text-orange-600" />;
    default: return <Target className="h-5 w-5 text-blue-600" />;
  }
}

// ─── Main Component ────────────────────────────────────────────────
export default function LeaderboardView() {
  const store = useProgressStore();
  const xp = store.xp || 0;
  const level = store.level || 1;
  const xpHistory = store.xpHistory || [];
  const dailyQuests = store.dailyQuests || [];
  const leaderboardEntries = store.leaderboardEntries || [];
  const streak = store.streak || 0;
  const completedTopics = store.completedTopics || [];
  const completedDailyChallenges = store.completedDailyChallenges || [];
  const addXp = store.addXp;
  const completeDailyQuest = store.completeDailyQuest;

  // ─── Derived state ────────────────────────────────────────────────
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const xpProgressPercent = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
  const totalQuestXp = dailyQuests.reduce((sum, q) => sum + q.xpReward, 0);
  const completedQuestXp = dailyQuests.filter((q) => q.completed).reduce((sum, q) => sum + q.xpReward, 0);

  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const xpToday = xpHistory.find((h) => h.date === today)?.xp || 0;
  const xpThisWeek = xpHistory
    .filter((h) => h.date >= weekStartStr)
    .reduce((sum, h) => sum + h.xp, 0);

  const daysRemaining = getDaysRemainingInWeek();
  const yourEntry = leaderboardEntries.find((e) => e.name === 'You');
  const yourRank = yourEntry?.rank || leaderboardEntries.length;

  // Achievements derived from store
  const achievements = useMemo(() => {
    const s = store as unknown as ReturnType<typeof useProgressStore.getState>;
    return achievementDefs.map((a) => ({
      ...a,
      unlocked: a.check(s),
    }));
  }, [store]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Leaderboard tab filter
  const [leaderboardFilter, setLeaderboardFilter] = useState<'week' | 'all' | 'friends'>('week');

  const filteredLeaderboard = useMemo(() => {
    let entries = [...leaderboardEntries];
    if (leaderboardFilter === 'friends') {
      entries = entries.filter((e) => ['You', 'Sarah Kim', 'Mike Johnson'].includes(e.name));
    }
    return entries.sort((a, b) => b.xp - a.xp);
  }, [leaderboardEntries, leaderboardFilter]);

  const getTrend = (idx: number): 'up' | 'down' | 'same' => {
    if (idx === 0) return 'up';
    const prev = filteredLeaderboard[idx - 1];
    const curr = filteredLeaderboard[idx];
    if (!prev || !curr) return 'same';
    if (curr.xp > prev.xp * 0.9) return 'up';
    return idx % 3 === 0 ? 'down' : 'same';
  };

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleCompleteQuest = (id: string) => {
    const quest = dailyQuests.find((q) => q.id === id);
    if (!quest || quest.completed) return;
    completeDailyQuest(id);
    toast.success(`Quest completed! +${quest.xpReward} XP`, {
      description: quest.title,
    });
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center shadow-lg">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leaderboard & Gamification</h1>
          <p className="text-muted-foreground text-sm">Track your progress, compete, and earn rewards</p>
        </div>
      </motion.div>

      {/* Weekly Competition Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-amber-300/50 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5" />
          <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shrink-0">
                <span className="text-lg">{'\u{1F3C6}'}</span>
              </div>
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-100">Weekly Challenge</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Top earner gets <span className="font-bold text-amber-800 dark:text-amber-200">500 XP bonus!</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">#{yourRank}</p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider">Your Rank</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{daysRemaining}</p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider">Days Left</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs sm:text-sm">Achievements</TabsTrigger>
          <TabsTrigger value="quests" className="text-xs sm:text-sm">Quests</TabsTrigger>
        </TabsList>

        {/* ═══ OVERVIEW TAB ═══════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* XP & Level Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 md:p-8 text-white relative">
                <div className="absolute top-4 right-4 opacity-20">
                  <Star className="h-24 w-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="h-5 w-5 text-amber-300" />
                    <span className="text-emerald-100 font-semibold text-sm uppercase tracking-wider">Level {level}</span>
                  </div>
                  <motion.div
                    key={xp}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-5xl md:text-6xl font-extrabold tracking-tight"
                  >
                    {xp.toLocaleString()} <span className="text-2xl md:text-3xl font-medium text-emerald-200">XP</span>
                  </motion.div>
                  <p className="text-emerald-200 text-sm mt-2">
                    {xpInCurrentLevel} / {XP_PER_LEVEL} XP to Level {level + 1}
                  </p>
                  <div className="mt-3 h-3 bg-emerald-900/40 rounded-full overflow-hidden max-w-md">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgressPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
              <CardContent className="p-4 md:p-6">
                {/* XP Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Today</p>
                      <p className="font-bold text-lg">{xpToday} XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">This Week</p>
                      <p className="font-bold text-lg">{xpThisWeek} XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                      <Flame className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Streak</p>
                      <p className="font-bold text-lg">{streak} days</p>
                    </div>
                  </div>
                </div>

                {/* XP Breakdown Bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>XP Breakdown</span>
                    <span>{xpToday} today / {xpThisWeek} this week</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden flex">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-l-full"
                      style={{ width: `${xp > 0 ? Math.min((xpToday / xp) * 100, 100) : 0}%` }}
                      title={`Today: ${xpToday} XP`}
                    />
                    <motion.div
                      className="h-full bg-blue-500"
                      style={{ width: `${xp > 0 ? Math.min(((xpThisWeek - xpToday) / xp) * 100, 100) : 0}%` }}
                      title={`Rest of week: ${Math.max(xpThisWeek - xpToday, 0)} XP`}
                    />
                    <motion.div
                      className="h-full bg-gray-300 dark:bg-gray-600 rounded-r-full flex-1"
                      title="Remaining XP"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" /> Today
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-blue-500" /> This Week
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* XP History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-base">XP History</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">Last 14 days</Badge>
                </div>
                <CardDescription>Your daily XP earnings over the past two weeks</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <XpBarChart history={xpHistory} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Topics Done', value: completedTopics.length, icon: <BookOpen className="h-4 w-4" />, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40' },
              { label: 'Challenges', value: completedDailyChallenges.length, icon: <Target className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' },
              { label: 'Quests Done', value: dailyQuests.filter((q) => q.completed).length, icon: <Gift className="h-4 w-4" />, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40' },
              { label: 'Achievements', value: unlockedCount, icon: <Award className="h-4 w-4" />, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', stat.color)}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ═══ LEADERBOARD TAB ════════════════════════════════════════ */}
        <TabsContent value="leaderboard" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-base">Rankings</CardTitle>
                  </div>
                  <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                    {[
                      { key: 'week' as const, label: 'This Week' },
                      { key: 'all' as const, label: 'All Time' },
                      { key: 'friends' as const, label: 'Friends' },
                    ].map((tab) => (
                      <Button
                        key={tab.key}
                        size="sm"
                        variant={leaderboardFilter === tab.key ? 'default' : 'ghost'}
                        className={cn(
                          'h-7 text-xs px-3',
                          leaderboardFilter === tab.key && 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
                        )}
                        onClick={() => setLeaderboardFilter(tab.key)}
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="px-4 py-3 font-medium w-16">Rank</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium text-center">Level</th>
                        <th className="px-4 py-3 font-medium text-right">XP</th>
                        <th className="px-4 py-3 font-medium text-center">Streak</th>
                        <th className="px-4 py-3 font-medium text-center w-16">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredLeaderboard.map((entry, idx) => {
                          const isYou = entry.name === 'You';
                          const trend = getTrend(idx);
                          const rankBadge = entry.rank === 1
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : entry.rank === 2
                              ? 'bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300'
                              : entry.rank === 3
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
                                : '';

                          return (
                            <motion.tr
                              key={entry.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={cn(
                                'border-b last:border-0 transition-colors',
                                isYou && 'bg-emerald-50/80 dark:bg-emerald-950/30 border-l-[3px] border-l-emerald-500',
                                !isYou && 'hover:bg-muted/50',
                              )}
                            >
                              <td className="px-4 py-3">
                                {entry.rank <= 3 ? (
                                  <div className={cn('h-7 w-7 rounded-full flex items-center justify-center font-bold text-sm', rankBadge)}>
                                    {entry.rank === 1 && <Crown className="h-4 w-4 text-amber-500" />}
                                    {entry.rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                                    {entry.rank === 3 && <Medal className="h-4 w-4 text-orange-500" />}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground font-medium ml-2">{entry.rank}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className={cn('font-semibold', isYou && 'text-emerald-700 dark:text-emerald-400')}>
                                    {entry.name}
                                  </span>
                                  {isYou && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                                      You
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge variant="outline" className="font-mono text-xs">
                                  Lv.{entry.level}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right font-bold tabular-nums">
                                {entry.xp.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
                                  <Flame className="h-3.5 w-3.5" />
                                  <span className="font-medium">{entry.streak}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-600 mx-auto" />}
                                {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />}
                                {trend === 'same' && <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══ ACHIEVEMENTS TAB ══════════════════════════════════════ */}
        <TabsContent value="achievements" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold">Achievements</h2>
              </div>
              <Badge variant="outline" className="text-sm">
                {unlockedCount}/{achievements.length} unlocked
              </Badge>
            </div>
            <Progress value={(unlockedCount / achievements.length) * 100} className="h-2 mb-6" />

            {/* Category Groups */}
            {['Study', 'Quiz', 'Streak', 'Social', 'Special'].map((category) => {
              const catAchievements = achievements.filter((a) => a.category === category);
              if (catAchievements.length === 0) return null;
              return (
                <div key={category} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center', categoryColors[category])}>
                      {categoryIcons[category]}
                    </div>
                    <h3 className="font-semibold text-sm">{category}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {catAchievements.filter((a) => a.unlocked).length}/{catAchievements.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    <AnimatePresence>
                      {catAchievements.map((ach, idx) => (
                        <motion.div
                          key={ach.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card
                            className={cn(
                              'p-3 text-center transition-all duration-200 hover:shadow-md cursor-default',
                              ach.unlocked
                                ? 'bg-gradient-to-b from-white to-muted/30 dark:from-muted/50 dark:to-muted/20 border-primary/20'
                                : 'opacity-60 grayscale hover:opacity-80',
                            )}
                          >
                            <div className="text-3xl mb-1.5">
                              {ach.unlocked ? ach.emoji : <Lock className="h-7 w-7 text-muted-foreground mx-auto" />}
                            </div>
                            <p className={cn(
                              'text-xs font-semibold leading-tight',
                              ach.unlocked ? 'text-foreground' : 'text-muted-foreground',
                              !ach.unlocked && 'line-through decoration-muted-foreground/40',
                            )}>
                              {ach.unlocked ? ach.name : '???'}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                              {ach.description}
                            </p>
                            {ach.unlocked && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-1.5"
                              >
                                <Badge className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border-0">
                                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Unlocked
                                </Badge>
                              </motion.div>
                            )}
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </TabsContent>

        {/* ═══ QUESTS TAB ════════════════════════════════════════════ */}
        <TabsContent value="quests" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Quest Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-base">Daily Quests</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {dailyQuests.filter((q) => q.completed).length}/{dailyQuests.length} completed
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      <Zap className="h-3 w-3 mr-0.5" />
                      {completedQuestXp}/{totalQuestXp} XP
                    </Badge>
                  </div>
                </div>
                <CardDescription>Complete daily quests to earn bonus XP rewards</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Progress
                  value={dailyQuests.length > 0 ? (dailyQuests.filter((q) => q.completed).length / dailyQuests.length) * 100 : 0}
                  className="h-2 mb-4"
                />
                <div className="space-y-3">
                  <AnimatePresence>
                    {dailyQuests.map((quest, idx) => (
                      <motion.div
                        key={quest.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                      >
                        <Card
                          className={cn(
                            'p-4 transition-all duration-200',
                            quest.completed
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30'
                              : 'hover:shadow-md hover:border-primary/30',
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                              quest.completed ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-muted',
                            )}>
                              {quest.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              ) : (
                                questIcon(quest.type)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className={cn(
                                  'font-semibold text-sm',
                                  quest.completed && 'line-through text-muted-foreground',
                                )}>
                                  {quest.title}
                                </h4>
                                {quest.completed && (
                                  <Badge className="text-[10px] px-1.5 py-0 bg-emerald-600 text-white border-0">
                                    Claimed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{quest.description}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 whitespace-nowrap">
                                +{quest.xpReward} XP
                              </Badge>
                              {!quest.completed && (
                                <Button
                                  size="sm"
                                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                  onClick={() => handleCompleteQuest(quest.id)}
                                >
                                  Complete
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Quest Tips */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Pro Tips</h4>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                        Complete all daily quests for maximum XP earnings
                      </li>
                      <li className="flex items-center gap-1.5">
                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                        Maintain your streak for the Streak Keeper bonus quest
                      </li>
                      <li className="flex items-center gap-1.5">
                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                        Quests reset every day at midnight — don&apos;t miss out!
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
