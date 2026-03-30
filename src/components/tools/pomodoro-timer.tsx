'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Volume2, Minus, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Phase = 'focus' | 'shortBreak' | 'longBreak';

const PHASE_CONFIG = {
  focus: { label: 'Focus', defaultMinutes: 25, color: 'text-emerald-500', ringColor: '#10b981', bgColor: 'bg-emerald-500/10' },
  shortBreak: { label: 'Short Break', defaultMinutes: 5, color: 'text-sky-500', ringColor: '#0ea5e9', bgColor: 'bg-sky-500/10' },
  longBreak: { label: 'Long Break', defaultMinutes: 15, color: 'text-amber-500', ringColor: '#f59e0b', bgColor: 'bg-amber-500/10' },
};

export default function PomodoroTimer() {
  const [phase, setPhase] = useState<Phase>('focus');
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showDing, setShowDing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDuration = useCallback((p: Phase) => {
    switch (p) {
      case 'focus': return focusDuration;
      case 'shortBreak': return shortBreakDuration;
      case 'longBreak': return longBreakDuration;
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowDing(true);
            setTimeout(() => setShowDing(false), 2000);

            if (phase === 'focus') {
              const newCount = completedPomodoros + 1;
              setCompletedPomodoros(newCount);
              const nextPhase = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
              setPhase(nextPhase);
              return getDuration(nextPhase) * 60;
            } else {
              setPhase('focus');
              return focusDuration * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase, completedPomodoros, focusDuration, getDuration]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(getDuration(phase) * 60);
  };

  const switchPhase = (newPhase: Phase) => {
    setIsRunning(false);
    setPhase(newPhase);
    setTimeRemaining(getDuration(newPhase) * 60);
  };

  const updateDuration = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, min: number, max: number) => {
    const clamped = Math.max(min, Math.min(max, value));
    setter(clamped);
    if (setter === setFocusDuration && phase === 'focus') {
      setTimeRemaining(clamped * 60);
      setIsRunning(false);
    }
    if (setter === setShortBreakDuration && phase === 'shortBreak') {
      setTimeRemaining(clamped * 60);
      setIsRunning(false);
    }
    if (setter === setLongBreakDuration && phase === 'longBreak') {
      setTimeRemaining(clamped * 60);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = getDuration(phase) * 60;
  const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;
  const config = PHASE_CONFIG[phase];

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Ding notification */}
      <AnimatePresence>
        {showDing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className={cn(
              'px-8 py-6 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-4',
              'bg-white/90 dark:bg-gray-900/90 border border-border'
            )}>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: 2, duration: 0.3 }}
              >
                <Volume2 className={cn('w-8 h-8', config.color)} />
              </motion.div>
              <span className="text-3xl font-bold">🔔 Ding!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase tabs */}
      <div className="flex justify-center">
        <div className="inline-flex gap-1 p-1 rounded-xl bg-muted/50">
          {(Object.keys(PHASE_CONFIG) as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => switchPhase(p)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                phase === p
                  ? cn('bg-background shadow-sm', PHASE_CONFIG[p].color)
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {PHASE_CONFIG[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Timer circle */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            {/* Progress ring */}
            <motion.circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke={config.ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{
                filter: `drop-shadow(0 0 8px ${config.ringColor}40)`,
              }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={timeRemaining}
              className={cn('text-5xl font-bold tabular-nums tracking-tight', config.color)}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
            >
              {formatTime(timeRemaining)}
            </motion.span>
            <span className="text-sm text-muted-foreground mt-1">{config.label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="h-12 w-12 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={handleStartPause}
          className={cn(
            'h-14 w-14 rounded-full text-white shadow-lg transition-all duration-300',
            `hover:shadow-xl hover:scale-105`,
            phase === 'focus' && 'bg-emerald-500 hover:bg-emerald-600',
            phase === 'shortBreak' && 'bg-sky-500 hover:bg-sky-600',
            phase === 'longBreak' && 'bg-amber-500 hover:bg-amber-600'
          )}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="h-12 w-12 rounded-full"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Session counter */}
      <div className="flex justify-center">
        <div className={cn('px-6 py-3 rounded-xl', config.bgColor)}>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-3 h-3 rounded-full transition-all duration-300',
                    i < completedPomodoros % 4 || (completedPomodoros > 0 && completedPomodoros % 4 === 0 && i < 4)
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                      : 'bg-muted-foreground/20'
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              <span className={config.color}>{completedPomodoros}</span> completed
            </span>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Timer Settings</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <DurationSetting
                  label="Focus Duration"
                  value={focusDuration}
                  onChange={(v) => updateDuration(setFocusDuration, v, 1, 60)}
                  unit="min"
                  color="text-emerald-500"
                />
                <DurationSetting
                  label="Short Break"
                  value={shortBreakDuration}
                  onChange={(v) => updateDuration(setShortBreakDuration, v, 1, 30)}
                  unit="min"
                  color="text-sky-500"
                />
                <DurationSetting
                  label="Long Break"
                  value={longBreakDuration}
                  onChange={(v) => updateDuration(setLongBreakDuration, v, 1, 45)}
                  unit="min"
                  color="text-amber-500"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DurationSetting({
  label,
  value,
  onChange,
  unit,
  color,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(value - 1)}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className={cn('text-lg font-bold tabular-nums w-12 text-center', color)}>
          {value}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(value + 1)}
        >
          <Plus className="w-3 h-3" />
        </Button>
        <span className="text-xs text-muted-foreground ml-1">{unit}</span>
      </div>
    </div>
  );
}
