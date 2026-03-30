'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Flame,
  Target,
  BookOpen,
  Brain,
  Award,
  Crown,
  Lock,
  CheckCircle2,
  Zap,
  GraduationCap,
  Database,
  Table2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import { subjects, getTotalTopicCount } from '@/lib/study-data';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  checkUnlocked: () => boolean;
  category: string;
}

export default function AchievementsView() {
  const store = useProgressStore();
  const totalCount = getTotalTopicCount();

  const achievements: Achievement[] = useMemo(
    () => [
      {
        id: 'first-step',
        title: 'First Step',
        description: 'Complete your first topic',
        icon: Target,
        color: 'text-emerald-500',
        gradient: 'from-emerald-500 to-teal-500',
        checkUnlocked: () => store.getCompletedCount() >= 1,
        category: 'Progress',
      },
      {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Complete 5 topics',
        icon: Star,
        color: 'text-amber-500',
        gradient: 'from-amber-500 to-orange-500',
        checkUnlocked: () => store.getCompletedCount() >= 5,
        category: 'Progress',
      },
      {
        id: 'quarter-way',
        title: 'Quarter Way',
        description: 'Complete 25% of all topics',
        icon: Zap,
        color: 'text-blue-500',
        gradient: 'from-blue-500 to-cyan-500',
        checkUnlocked: () => store.getOverallProgress() >= 25,
        category: 'Progress',
      },
      {
        id: 'half-way',
        title: 'Half Way',
        description: 'Complete 50% of all topics',
        icon: BookOpen,
        color: 'text-purple-500',
        gradient: 'from-purple-500 to-pink-500',
        checkUnlocked: () => store.getOverallProgress() >= 50,
        category: 'Progress',
      },
      {
        id: 'almost-there',
        title: 'Almost There',
        description: 'Complete 75% of all topics',
        icon: Award,
        color: 'text-rose-500',
        gradient: 'from-rose-500 to-red-500',
        checkUnlocked: () => store.getOverallProgress() >= 75,
        category: 'Progress',
      },
      {
        id: 'full-stack-analyst',
        title: 'Full Stack Analyst',
        description: 'Complete all subjects',
        icon: GraduationCap,
        color: 'text-yellow-500',
        gradient: 'from-yellow-400 to-amber-500',
        checkUnlocked: () => store.getOverallProgress() >= 100,
        category: 'Progress',
      },
      {
        id: 'excel-master',
        title: 'Excel Master',
        description: 'Complete all Excel topics',
        icon: Table2,
        color: 'text-green-500',
        gradient: 'from-green-500 to-emerald-500',
        checkUnlocked: () => store.getSubjectProgress('microsoft-excel') >= 100,
        category: 'Subject Master',
      },
      {
        id: 'sql-wizard',
        title: 'SQL Wizard',
        description: 'Complete all SQL topics',
        icon: Database,
        color: 'text-cyan-500',
        gradient: 'from-cyan-500 to-blue-500',
        checkUnlocked: () => store.getSubjectProgress('sql') >= 100,
        category: 'Subject Master',
      },
      {
        id: 'streak-master',
        title: 'Streak Master',
        description: 'Reach a 7-day study streak',
        icon: Flame,
        color: 'text-orange-500',
        gradient: 'from-orange-500 to-red-500',
        checkUnlocked: () => store.streak >= 7,
        category: 'Streaks',
      },
      {
        id: 'consistency-king',
        title: 'Consistency King',
        description: 'Reach a 30-day study streak',
        icon: Crown,
        color: 'text-amber-600',
        gradient: 'from-amber-600 to-yellow-500',
        checkUnlocked: () => store.streak >= 30,
        category: 'Streaks',
      },
      {
        id: 'quiz-champion',
        title: 'Quiz Champion',
        description: 'Score 100% on the quiz',
        icon: Brain,
        color: 'text-violet-500',
        gradient: 'from-violet-500 to-purple-500',
        checkUnlocked: () => store.quizHighScore >= 15,
        category: 'Games',
      },
      {
        id: 'memory-master',
        title: 'Memory Master',
        description: 'Complete the memory game',
        icon: Zap,
        color: 'text-pink-500',
        gradient: 'from-pink-500 to-rose-500',
        checkUnlocked: () => store.memoryGameCompleted,
        category: 'Games',
      },
    ],
    [store]
  );

  const unlockedCount = achievements.filter((a) => a.checkUnlocked()).length;
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

  const categories = ['Progress', 'Subject Master', 'Streaks', 'Games'];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">Achievements</h2>
        </div>
        <p className="text-muted-foreground">
          Track your milestones and earn badges along your journey
        </p>
      </div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300">
                  {unlockedCount} / {achievements.length} Achievements Unlocked
                </h3>
                <p className="text-sm text-amber-600/70 dark:text-amber-400/60 mt-1">
                  {progressPercent === 100
                    ? '🏆 You are a true data analytics master!'
                    : progressPercent >= 50
                      ? `Great progress! Keep going to unlock all badges!`
                      : `You're just getting started. Complete more topics to earn badges!`}
                </p>
                <div className="mt-3 max-w-xs mx-auto sm:mx-0">
                  <Progress value={progressPercent} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements by Category */}
      {categories.map((category) => {
        const categoryAchievements = achievements.filter((a) => a.category === category);
        return (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryAchievements.map((achievement, index) => {
                const isUnlocked = achievement.checkUnlocked();
                const Icon = achievement.icon;

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={cn(
                        'transition-all duration-300 overflow-hidden',
                        isUnlocked
                          ? 'ring-2 ring-amber-300/50 dark:ring-amber-700/50 card-hover-glow'
                          : 'opacity-60 grayscale'
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                              isUnlocked
                                ? `bg-gradient-to-br ${achievement.gradient} shadow-md`
                                : 'bg-muted'
                            )}
                          >
                            {isUnlocked ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 15,
                                }}
                              >
                                <Icon className="w-6 h-6 text-white" />
                              </motion.div>
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold">{achievement.title}</h4>
                              {isUnlocked && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
