'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Plus, Trash2, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import { subjects } from '@/lib/study-data';

const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const SUBJECT_COLORS: Record<string, string> = {};
subjects.forEach((s, i) => {
  const colors = [
    'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30',
    'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
    'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
    'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
    'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
    'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30',
    'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  ];
  SUBJECT_COLORS[s.id] = colors[i % colors.length];
});

function getWeekDays(baseDate: Date) {
  const dayOfWeek = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((dayOfWeek + 6) % 7));

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }
  return days;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

export default function StudyPlanner() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || '');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);

  const { studyPlan, addStudyPlanItem, removeStudyPlanItem, clearStudyPlan } = useProgressStore();

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  const weekTotal = useMemo(() => {
    let total = 0;
    weekDays.forEach((day) => {
      const key = formatDateKey(day);
      const items = studyPlan[key] || [];
      total += items.reduce((sum, item) => sum + item.duration, 0);
    });
    return total;
  }, [weekDays, studyPlan]);

  const weekItemCount = useMemo(() => {
    let count = 0;
    weekDays.forEach((day) => {
      const key = formatDateKey(day);
      count += (studyPlan[key] || []).length;
    });
    return count;
  }, [weekDays, studyPlan]);

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handleToday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const handleAddSession = () => {
    if (!selectedDate || !selectedSubject) return;
    addStudyPlanItem(selectedDate, selectedSubject, selectedDuration);
    setDialogOpen(false);
    setSelectedDate(null);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(formatDateKey(date));
    setSelectedSubject(subjects[0]?.id || '');
    setSelectedDuration(60);
    setDialogOpen(true);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Week total */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">
              <span className="text-emerald-600 dark:text-emerald-400">{formatDuration(weekTotal)}</span>
              <span className="text-muted-foreground"> this week</span>
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={clearStudyPlan}
            disabled={weekItemCount === 0}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dateKey = formatDateKey(day);
          const items = studyPlan[dateKey] || [];
          const dayTotal = items.reduce((sum, item) => sum + item.duration, 0);
          const today = isToday(day);

          return (
            <motion.div
              key={dateKey}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 min-h-[140px] flex flex-col',
                  today && 'ring-2 ring-emerald-500 shadow-sm',
                  items.length > 0 && 'border-dashed'
                )}
                onClick={() => handleDayClick(day)}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn(
                        'text-xs font-medium',
                        today ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                      )}>
                        {formatDayLabel(day)}
                      </p>
                      <p className={cn(
                        'text-sm font-semibold',
                        today && 'text-emerald-600 dark:text-emerald-400'
                      )}>
                        {formatDateLabel(day)}
                      </p>
                    </div>
                    {dayTotal > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {formatDuration(dayTotal)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex-1 flex flex-col gap-1.5">
                  {items.length === 0 ? (
                    <button
                      className="w-full h-full min-h-[60px] flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 text-muted-foreground/40 hover:text-muted-foreground hover:border-muted-foreground/40 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDayClick(day);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1 flex-1 overflow-y-auto max-h-24 custom-scrollbar">
                      {items.map((item, idx) => {
                        const subject = subjects.find((s) => s.id === item.subjectId);
                        const colorClass = SUBJECT_COLORS[item.subjectId] || 'bg-muted text-muted-foreground';
                        return (
                          <div
                            key={idx}
                            className={cn(
                              'flex items-center justify-between rounded-md px-2 py-1 text-[11px] font-medium border group',
                              colorClass
                            )}
                          >
                            <span className="truncate">{subject?.title || 'Unknown'}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeStudyPlanItem(dateKey, idx);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      <button
                        className="w-full py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDayClick(day);
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Add session dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Study Session</DialogTitle>
            <DialogDescription className="sr-only">Select subject and duration for your study session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="text-sm font-medium">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Subject</p>
              <div className="grid grid-cols-2 gap-2">
                {subjects.map((subject) => {
                  const isSelected = selectedSubject === subject.id;
                  return (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id)}
                      className={cn(
                        'p-2 rounded-lg text-left text-xs font-medium transition-all border',
                        isSelected
                          ? cn(SUBJECT_COLORS[subject.id], 'ring-1 ring-current/30')
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {subject.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Duration</p>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedDuration(opt.value)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition-all border',
                      selectedDuration === opt.value
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                        : 'border-border hover:bg-muted'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAddSession}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
