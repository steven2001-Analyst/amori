'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const PHASE_DURATIONS: Record<BreathingPhase, number> = {
  idle: 0,
  inhale: 4,
  hold: 4,
  exhale: 4,
};

const PHASE_MESSAGES: Record<BreathingPhase, string> = {
  idle: 'Press play to begin',
  inhale: 'Breathe In...',
  hold: 'Hold...',
  exhale: 'Breathe Out...',
};

export default function BreathingExercise() {
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExercise = useCallback(() => {
    setIsActive(true);
    setPhase('inhale');
    setTimer(4);
  }, []);

  const stopExercise = useCallback(() => {
    setIsActive(false);
    setPhase('idle');
    setTimer(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const resetExercise = useCallback(() => {
    stopExercise();
    setSessions(0);
    setTotalSeconds(0);
  }, [stopExercise]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Move to next phase
          setPhase((currentPhase) => {
            if (currentPhase === 'inhale') return 'hold';
            if (currentPhase === 'hold') return 'exhale';
            if (currentPhase === 'exhale') {
              // Completed one cycle
              setSessions((s) => s + 1);
              return 'inhale';
            }
            return 'idle';
          });
          return 4;
        }
        return prev - 1;
      });
      setTotalSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const circleScale = phase === 'idle'
    ? 1
    : phase === 'inhale'
      ? 1.5
      : phase === 'hold'
        ? 1.5
        : 1;

  const circleOpacity = phase === 'idle' ? 0.4 : phase === 'exhale' ? 0.5 : 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wind className="w-5 h-5 text-sky-500" />
            Breathing Exercise
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sessions: {sessions}</span>
            <span>•</span>
            <span>{formatTime(totalSeconds)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-8 py-8">
          {/* Breathing Circle */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                scale: circleScale * 1.2,
                opacity: circleOpacity * 0.3,
              }}
              transition={{ duration: PHASE_DURATIONS[phase], ease: 'easeInOut' }}
              style={{
                background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
              }}
            />

            {/* Main circle */}
            <motion.div
              className="w-32 h-32 rounded-full flex items-center justify-center relative"
              animate={{
                scale: circleScale,
                opacity: circleOpacity,
              }}
              transition={{ duration: PHASE_DURATIONS[phase], ease: 'easeInOut' }}
              style={{
                background: phase === 'inhale'
                  ? 'linear-gradient(135deg, #06b6d4, #14b8a6)'
                  : phase === 'hold'
                    ? 'linear-gradient(135deg, #0891b2, #0d9488)'
                    : phase === 'exhale'
                      ? 'linear-gradient(135deg, #67e8f9, #5eead4)'
                      : 'linear-gradient(135deg, #a5f3fc, #99f6e4)',
              }}
            >
              {/* Timer display */}
              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={phase}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <div className="text-3xl font-bold text-white">
                      {phase === 'idle' ? '🧘' : timer}
                    </div>
                    <p className="text-xs text-white/80 mt-1">
                      {PHASE_MESSAGES[phase]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Ring decorations */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-sky-200/30 dark:border-sky-700/30"
                animate={{
                  scale: [1, circleScale + i * 0.15, 1],
                  opacity: [0.2, 0.1, 0.2],
                }}
                transition={{
                  duration: PHASE_DURATIONS[phase] * 2,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
                style={{
                  width: `${160 + i * 40}px`,
                  height: `${160 + i * 40}px`,
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {!isActive ? (
              <Button
                onClick={startExercise}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={stopExercise}
                variant="outline"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            <Button variant="outline" onClick={resetExercise}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Tips */}
          <div className="text-center text-sm text-muted-foreground max-w-sm">
            <p className="mb-1">4-4-4 Breathing Pattern</p>
            <p>Breathe in for 4 seconds, hold for 4 seconds, and breathe out for 4 seconds.</p>
            {sessions > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-sky-600 dark:text-sky-400 font-medium"
              >
                {sessions} {sessions === 1 ? 'cycle' : 'cycles'} completed. You&apos;re doing great! ✨
              </motion.p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
