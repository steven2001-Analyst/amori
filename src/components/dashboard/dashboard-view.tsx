'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Flame,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/lib/store';
import { subjects } from '@/lib/study-data';
import { getRandomQuote } from '@/lib/motivational-quotes';
import { SubjectProgressRing } from './progress-ring';
import { RadarProgressChart } from './radar-chart';
import { WeeklyHeatmap } from './weekly-heatmap';
import DashboardExport from './dashboard-export';
import type { Section } from '../layout/study-layout';

interface DashboardViewProps {
  onNavigate: (section: Section) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function AnimatedNumber({ value, duration = 1 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = (duration * 1000) / end;
    const timer = setInterval(() => {
      start += 1;
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime > 0 ? incrementTime : 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{display}</>;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const {
    getOverallProgress,
    getSubjectProgress,
    getCompletedCount,
    getTotalCount,
    streak,
  } = useProgressStore();

  const overallProgress = getOverallProgress();
  const completedCount = getCompletedCount();
  const totalCount = getTotalCount();
  const quote = useMemo(() => getRandomQuote(), []);

  const estimatedHours = Math.round(completedCount * 2.5);

  // Find first incomplete subject
  const firstIncomplete = subjects.find((s) => {
    const progress = getSubjectProgress(s.id);
    return progress < 100;
  });

  const subjectData = useMemo(
    () =>
      subjects.map((s) => ({
        subject: s.title.split(' ').slice(0, 2).join(' '),
        progress: getSubjectProgress(s.id),
        fullTitle: s.title,
        color: s.color,
        gradient: s.gradient,
        icon: s.icon,
      })),
    [getSubjectProgress]
  );

  const stats = [
    {
      label: 'Topics Completed',
      value: completedCount,
      total: totalCount,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Study Hours',
      value: estimatedHours,
      suffix: 'h',
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'Current Streak',
      value: streak,
      suffix: 'd',
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: 'Completion Rate',
      value: overallProgress,
      suffix: '%',
      icon: TrendingUp,
      color: 'text-teal-500',
      bg: 'bg-teal-50 dark:bg-teal-950/30',
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* Export bar */}
      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
        <DashboardExport />
      </motion.div>
      {/* Hero Banner */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 lg:p-10 text-white animate-gradient"
      >
        {/* Floating decorations */}
        <div className="absolute top-4 right-8 w-20 h-20 bg-white/10 rounded-full animate-float" />
        <div className="absolute bottom-4 right-24 w-12 h-12 bg-white/10 rounded-full animate-float-slow hidden sm:block" />
        <div className="absolute top-8 right-40 w-8 h-8 bg-white/10 rounded-full animate-float-slower hidden lg:block" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span className="text-sm font-medium text-emerald-100">Daily Inspiration</span>
            </div>
            <blockquote className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-white/95">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <p className="mt-2 text-sm text-emerald-200/80">— {quote.author}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <SubjectProgressRing progress={overallProgress} size={120} />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="card-3d shadow-3d hover:shadow-3d-hover transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      <AnimatedNumber value={stat.value} />
                      {stat.suffix && <span className="text-lg text-muted-foreground">{stat.suffix}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Streak Banner */}
      {streak > 0 && (
        <motion.div
          variants={item}
          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-800/30"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Flame className="w-8 h-8 text-orange-500" />
          </motion.div>
          <div className="flex-1">
            <p className="font-semibold text-orange-700 dark:text-orange-400">
              {streak} Day Streak! 🔥
            </p>
            <p className="text-sm text-orange-600/70 dark:text-orange-500/60">
              {streak < 7
                ? 'Keep going! Build your streak to earn the Streak Master badge.'
                : streak < 30
                  ? `Amazing! You're on fire! Just ${30 - streak} more days for Consistency King.`
                  : 'Legendary! You are the Consistency King! 👑'}
            </p>
          </div>
          <div className="text-3xl font-bold text-orange-500">{streak}</div>
        </motion.div>
      )}

      {/* Continue Learning Button */}
      {firstIncomplete && (
        <motion.div variants={item}>
          <Button
            onClick={() => onNavigate('study')}
            className="w-full min-h-14 py-4 text-sm sm:text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300"
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span className="truncate mx-2">
              Continue: {firstIncomplete.title}
            </span>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </Button>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div variants={item}>
          <Card className="card-hover-glow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Skill Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarProgressChart subjectData={subjectData} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Heatmap */}
        <motion.div variants={item}>
          <Card className="card-hover-glow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Study Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyHeatmap />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subject Progress Cards */}
      <motion.div variants={item}>
        <h3 className="text-lg font-semibold mb-4">Subject Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectData.map((subject, index) => (
            <motion.div
              key={subject.fullTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
            >
              <Card className="card-hover-glow cursor-pointer group" onClick={() => onNavigate('study')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${subject.gradient} flex items-center justify-center`}
                    >
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{subject.fullTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {subject.progress}% complete
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <Progress
                    value={subject.progress}
                    className="h-2"
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
