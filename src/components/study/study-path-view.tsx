'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  BookOpen,
  Sparkles,
  BarChart3,
  Table2,
  Database,
  PieChart,
  Code,
  Warehouse,
  Zap,
  Rocket,
  Lock,
  Unlock,
  FlaskConical,
  Server,
  Brain,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { subjects } from '@/lib/study-data';
import { useProgressStore } from '@/lib/store';
import ConfettiEffect from './confetti-effect';

const iconMap: Record<string, React.ElementType> = {
  BarChart3,
  Table2,
  Database,
  PieChart,
  Code,
  Warehouse,
  Zap,
  Rocket,
  FlaskConical,
  Server,
  Brain,
};

export default function StudyPathView() {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [confettiKey, setConfettiKey] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toggleTopic, isTopicCompleted, getSubjectProgress } = useProgressStore();

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  const handleToggleTopic = useCallback(
    (topicId: string, subjectId: string) => {
      const wasCompleted = isTopicCompleted(topicId);
      toggleTopic(topicId);

      if (!wasCompleted) {
        // Check if this completes the subject
        const subject = subjects.find((s) => s.id === subjectId);
        if (subject) {
          const allOtherCompleted = subject.topics.every(
            (t) => t.id === topicId || isTopicCompleted(t.id)
          );
          if (allOtherCompleted) {
            setShowConfetti(true);
            setConfettiKey((k) => k + 1);
            setTimeout(() => setShowConfetti(false), 4000);
          }
        }
      }
    },
    [toggleTopic, isTopicCompleted]
  );

  // Check if previous subject has progress to unlock next
  const isSubjectUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    const prevSubject = subjects[index - 1];
    return getSubjectProgress(prevSubject.id) > 0;
  };

  return (
    <div className="relative">
      {showConfetti && <ConfettiEffect key={confettiKey} />}

      <div className="p-4 lg:p-8 space-y-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Learning Path</h2>
          <p className="text-muted-foreground">
            Complete subjects in order to unlock the next one
          </p>
        </div>

        <div className="space-y-3">
          {subjects.map((subject, subjectIndex) => {
            const Icon = iconMap[subject.icon] || BookOpen;
            const isExpanded = expandedSubjects.has(subject.id);
            const progress = getSubjectProgress(subject.id);
            const completedCount = subject.topics.filter((t) => isTopicCompleted(t.id)).length;
            const isUnlocked = isSubjectUnlocked(subjectIndex);
            const isComplete = progress === 100;

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isUnlocked ? 1 : 0.5, y: 0 }}
                transition={{ delay: subjectIndex * 0.05 }}
              >
                <Card
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isComplete && 'ring-2 ring-emerald-500/50',
                    !isUnlocked && 'opacity-60'
                  )}
                >
                  {/* Subject Header */}
                  <button
                    onClick={() => isUnlocked && toggleSubject(subject.id)}
                    className={cn(
                      'w-full text-left',
                      !isUnlocked && 'cursor-not-allowed'
                    )}
                    disabled={!isUnlocked}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg',
                            subject.gradient,
                            isComplete && 'animate-pulse-glow'
                          )}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              Subject {subjectIndex + 1}
                            </span>
                            {isComplete && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs px-2 py-0">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Complete
                              </Badge>
                            )}
                            {!isUnlocked && (
                              <Badge variant="secondary" className="text-xs px-2 py-0">
                                <Lock className="w-3 h-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base font-semibold truncate">
                            {subject.title}
                          </CardTitle>
                          <div className="flex items-center gap-3 mt-2">
                            <Progress value={progress} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground shrink-0">
                              {completedCount}/{subject.topics.length}
                            </span>
                          </div>
                        </div>
                        {isUnlocked && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          </motion.div>
                        )}
                      </div>
                    </CardHeader>
                  </button>

                  {/* Topics */}
                  <AnimatePresence>
                    {isExpanded && isUnlocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <CardContent className="pt-0 pb-4 px-4 lg:px-6">
                          <div className="border-t border-border pt-4 space-y-1">
                            {subject.topics.map((topic, topicIndex) => {
                              const isCompleted = isTopicCompleted(topic.id);
                              const topicNumber = `${subjectIndex + 1}.${topicIndex + 1}`;

                              return (
                                <motion.div
                                  key={topic.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: topicIndex * 0.03 }}
                                  className={cn(
                                    'flex items-start gap-3 p-3 rounded-lg transition-all duration-200 group',
                                    isCompleted
                                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                                      : 'hover:bg-muted/50'
                                  )}
                                >
                                  <div className="pt-0.5">
                                    <Checkbox
                                      checked={isCompleted}
                                      onCheckedChange={() =>
                                        handleToggleTopic(topic.id, subject.id)
                                      }
                                      className={cn(
                                        'transition-all',
                                        isCompleted && 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500'
                                      )}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                                        {topicNumber}
                                      </span>
                                      <p
                                        className={cn(
                                          'text-sm font-medium transition-all',
                                          isCompleted
                                            ? 'text-emerald-700 dark:text-emerald-400 line-through decoration-emerald-300 dark:decoration-emerald-700'
                                            : ''
                                        )}
                                      >
                                        {topic.title}
                                      </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 ml-0 lg:ml-8">
                                      {topic.description}
                                    </p>
                                  </div>
                                  {isCompleted && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 15,
                                      }}
                                    >
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    </motion.div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
