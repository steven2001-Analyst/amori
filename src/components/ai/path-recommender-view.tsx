'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Target, CheckCircle2, Clock, BookOpen, ChevronRight, Loader2, Sparkles, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useProgressStore } from '@/lib/store';

interface Milestone {
  id: string;
  title: string;
  description: string;
  phase: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  completed: boolean;
  resources: string[];
}

interface LearningPlan {
  id: string;
  goal: string;
  createdAt: string;
  milestones: Milestone[];
  totalDuration: string;
}

const SAMPLE_GOALS = [
  'Get a data analyst job in 6 months',
  'Master SQL and Python for data science',
  'Learn Power BI and get certified',
  'Transition to data engineering',
  'Become a senior data analyst',
  'Learn machine learning basics',
];

function parsePlanResponse(text: string): { milestones: Milestone[]; totalDuration: string } {
  const milestones: Milestone[] = [];
  const phases = ['beginner', 'intermediate', 'advanced'];
  let currentPhase = 0;
  let totalWeeks = 0;

  const lines = text.split('\n').filter(l => l.trim());
  let phaseMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {};

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('beginner') || lower.includes('phase 1') || lower.includes('foundation')) phaseMap.current = 'beginner';
    else if (lower.includes('intermediate') || lower.includes('phase 2') || lower.includes('core')) phaseMap.current = 'intermediate';
    else if (lower.includes('advanced') || lower.includes('phase 3') || lower.includes('mastery')) phaseMap.current = 'advanced';
    else if (lower.includes('week') || lower.includes('month')) {
      const weekMatch = lower.match(/(\d+)\s*week/);
      if (weekMatch) totalWeeks += parseInt(weekMatch[1]);
    }
  }

  const itemMatches = text.match(/(?:^|\n)\s*(?:\d+[\.\)]\s*)?(\*\*[^*]+\*\*)/g) || [];
  for (let i = 0; i < Math.min(itemMatches.length, 12); i++) {
    const title = itemMatches[i].replace(/[\d\.\)\*\s]+/g, '').replace(/\*\*/g, '').trim();
    if (title.length < 3) continue;

    const phase = i < 4 ? 'beginner' : i < 8 ? 'intermediate' : 'advanced';
    const duration = phase === 'beginner' ? `${1 + Math.floor(Math.random() * 2)} weeks` : `${2 + Math.floor(Math.random() * 3)} weeks`;

    milestones.push({
      id: `ms-${Date.now()}-${i}`,
      title,
      description: '',
      phase,
      duration,
      completed: false,
      resources: [],
    });
  }

  if (milestones.length === 0) {
    const defaultTitles = [
      'Data Fundamentals', 'Excel Basics', 'SQL Foundations', 'Data Visualization Basics',
      'Advanced Excel', 'SQL Joins & Subqueries', 'Python for Data Analysis', 'Statistics Essentials',
      'Power BI Dashboard Design', 'Data Modeling', 'Advanced Analytics', 'Portfolio & Case Studies',
    ];
    for (let i = 0; i < 12; i++) {
      const phase = i < 4 ? 'beginner' : i < 8 ? 'intermediate' : 'advanced';
      milestones.push({
        id: `ms-${Date.now()}-${i}`,
        title: defaultTitles[i],
        description: `Complete ${defaultTitles[i].toLowerCase()} module`,
        phase,
        duration: `${1 + Math.floor(Math.random() * 3)} weeks`,
        completed: false,
        resources: [],
      });
    }
  }

  return {
    milestones,
    totalDuration: totalWeeks > 0 ? `${totalWeeks} weeks` : '24 weeks',
  };
}

export default function PathRecommenderView() {
  const [goal, setGoal] = useState('');
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [activePlan, setActivePlan] = useState<LearningPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const store = useProgressStore();
  const savedPlans = (store as unknown as Record<string, LearningPlan[]>).savedLearningPlans || [];

  const generatePlan = async () => {
    if (!goal.trim()) return;
    setIsGenerating(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Create a detailed, structured learning path for this goal: "${goal}".

Return a numbered list with 8-12 milestones, organized in 3 phases:
- **Phase 1: Beginner/Foundation** (weeks 1-8)
- **Phase 2: Intermediate/Core** (weeks 9-16)  
- **Phase 3: Advanced/Mastery** (weeks 17-24)

For each milestone, use bold title like: **1. Learn Data Fundamentals** and include a brief description. Include total estimated weeks.`,
          context: 'You create learning paths. Be specific and practical with real tools and skills.',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      let reply = data.reply || '';

      if (!reply || reply.trim() === '') {
        throw new Error('Empty reply');
      }

      const { milestones, totalDuration } = parsePlanResponse(reply);
      toast.success('Learning path generated');

      const newPlan: LearningPlan = {
        id: `plan-${Date.now()}`,
        goal: goal.trim(),
        createdAt: new Date().toISOString(),
        milestones,
        totalDuration,
      };

      setPlans(prev => [...prev, newPlan]);
      setActivePlan(newPlan);
      setGoal('');
    } catch {
      // Create a default plan on error
      toast.info('AI unavailable — showing default learning path');
      const newPlan: LearningPlan = {
        id: `plan-${Date.now()}`,
        goal: goal.trim(),
        createdAt: new Date().toISOString(),
        milestones: parsePlanResponse('').milestones,
        totalDuration: '24 weeks',
      };
      setPlans(prev => [...prev, newPlan]);
      setActivePlan(newPlan);
      setGoal('');
    }
    setIsGenerating(false);
  };

  const toggleMilestone = (planId: string, msId: string) => {
    setPlans(prev => prev.map(p => p.id === planId ? {
      ...p,
      milestones: p.milestones.map(m => m.id === msId ? { ...m, completed: !m.completed } : m),
    } : p));
    if (activePlan?.id === planId) {
      setActivePlan(prev => prev ? {
        ...prev,
        milestones: prev.milestones.map(m => m.id === msId ? { ...m, completed: !m.completed } : m),
      } : null);
    }
  };

  const deletePlan = (planId: string) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    if (activePlan?.id === planId) setActivePlan(null);
  };

  const getPhaseProgress = (plan: LearningPlan, phase: string) => {
    const milestones = plan.milestones.filter(m => m.phase === phase);
    if (milestones.length === 0) return 0;
    return Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100);
  };

  const getTotalProgress = (plan: LearningPlan) => {
    if (plan.milestones.length === 0) return 0;
    return Math.round((plan.milestones.filter(m => m.completed).length / plan.milestones.length) * 100);
  };

  const phaseColors = {
    beginner: 'from-emerald-500 to-green-600',
    intermediate: 'from-blue-500 to-indigo-600',
    advanced: 'from-purple-500 to-violet-600',
  };

  const phaseLabels = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Route className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Learning Path Planner</h1>
          <p className="text-sm text-muted-foreground">Get a personalized learning path from AI</p>
        </div>
      </motion.div>

      {/* Goal Input */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-2">
            <Input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generatePlan()}
              placeholder="Enter your learning goal (e.g., 'Get a data analyst job in 6 months')"
              className="flex-1 h-11"
              disabled={isGenerating}
            />
            <Button
              onClick={generatePlan}
              disabled={!goal.trim() || isGenerating}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-11 px-6"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" />Generate</>}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_GOALS.map(g => (
              <Badge key={g} variant="outline" className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors py-1" onClick={() => setGoal(g)}>
                {g}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      {plans.length > 0 && !activePlan && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Save className="w-5 h-5 text-emerald-500" />
            Your Learning Plans ({plans.length})
          </h2>
          <div className="space-y-3">
            {plans.map((plan, i) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActivePlan(plan)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{plan.goal}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <Progress value={getTotalProgress(plan)} className="w-32 h-2" />
                        <span className="text-sm text-muted-foreground">{getTotalProgress(plan)}%</span>
                        <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />{plan.totalDuration}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); deletePlan(plan.id); }} className="text-muted-foreground hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Active Plan */}
      {activePlan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setActivePlan(null)}>
              ← All Plans
            </Button>
            <div className="text-right">
              <p className="font-semibold">{activePlan.goal}</p>
              <p className="text-sm text-muted-foreground">{activePlan.totalDuration} total</p>
            </div>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-bold text-emerald-600">{getTotalProgress(activePlan)}%</span>
              </div>
              <Progress value={getTotalProgress(activePlan)} className="h-3" />
            </CardContent>
          </Card>

          {/* Phases */}
          {(['beginner', 'intermediate', 'advanced'] as const).map((phase, phaseIdx) => {
            const milestones = activePlan.milestones.filter(m => m.phase === phase);
            if (milestones.length === 0) return null;

            return (
              <motion.div key={phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: phaseIdx * 0.1 }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full bg-gradient-to-r', phaseColors[phase])} />
                    <h3 className="font-semibold text-lg">{phaseLabels[phase]}</h3>
                    <Badge variant="outline">{milestones.length} milestones</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{getPhaseProgress(activePlan, phase)}%</span>
                </div>
                <div className="space-y-2">
                  {milestones.map((ms, i) => (
                    <motion.div
                      key={ms.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className={cn('transition-all', ms.completed && 'opacity-60')}>
                        <CardContent className="p-3 flex items-center gap-3">
                          <button
                            onClick={() => toggleMilestone(activePlan.id, ms.id)}
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all',
                              ms.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-muted hover:border-emerald-300'
                            )}
                          >
                            {ms.completed && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-medium', ms.completed && 'line-through')}>{ms.title}</p>
                            <p className="text-xs text-muted-foreground">{ms.duration}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <BookOpen className="w-3 h-3 mr-0.5" />
                            {ms.phase}
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Empty State */}
      {plans.length === 0 && !isGenerating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto">
            <Target className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No Learning Plans Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter your learning goal above and let AI create a personalized roadmap just for you.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
