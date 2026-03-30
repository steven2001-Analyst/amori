'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RotateCcw, Clock, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

type GameState = 'idle' | 'waiting' | 'ready' | 'clicked' | 'too-soon' | 'results';
type ColorRating = { label: string; color: string; bg: string };

function getRating(ms: number): ColorRating {
  if (ms < 200) return { label: 'Incredible!', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' };
  if (ms < 300) return { label: 'Great!', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500' };
  if (ms < 400) return { label: 'Good', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' };
  if (ms < 500) return { label: 'Average', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500' };
  return { label: 'Keep Practicing!', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500' };
}

export default function ReactionTimeGame() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [times, setTimes] = useState<number[]>([]);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [targetTime, setTargetTime] = useState<number>(0);
  const [round, setRound] = useState(0);
  const totalRounds = 10;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const { reactionTimeBest, setReactionTimeBest } = useProgressStore();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startRound = useCallback(() => {
    setGameState('waiting');
    setLastTime(null);
    const delay = Math.random() * 4000 + 1000; // 1-5 seconds
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState('ready');
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'idle' || gameState === 'too-soon') {
      startRound();
      return;
    }
    if (gameState === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('too-soon');
      return;
    }
    if (gameState === 'ready') {
      const reactionTime = Math.round(performance.now() - startTimeRef.current);
      setLastTime(reactionTime);
      setTimes((prev) => [...prev, reactionTime]);
      if (bestTime === null || reactionTime < bestTime) {
        setBestTime(reactionTime);
      }
      setReactionTimeBest(reactionTime);
      setTargetTime((prev) => prev + 1);

      if (targetTime + 1 >= totalRounds) {
        setGameState('results');
      } else {
        setGameState('clicked');
        setRound((r) => r + 1);
      }
      return;
    }
    if (gameState === 'clicked') {
      startRound();
      return;
    }
  }, [gameState, bestTime, targetTime, setReactionTimeBest, startRound]);

  const resetGame = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setGameState('idle');
    setTimes([]);
    setLastTime(null);
    setBestTime(null);
    setRound(0);
    setTargetTime(0);
  }, []);

  const averageTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const overallBest = bestTime ?? reactionTimeBest;
  const maxTime = Math.max(...times, 600);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Reaction Time
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Round {Math.min(targetTime + 1, totalRounds)}/{totalRounds}
            </Badge>
            {overallBest !== null && (
              <Badge variant="secondary" className="text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                Best: {overallBest}ms
              </Badge>
            )}
            {(gameState !== 'idle') && (
              <Button variant="outline" size="sm" onClick={resetGame} className="text-xs">
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {/* Main Game Area */}
          {gameState !== 'results' ? (
            <motion.div
              key={gameState}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button
                onClick={handleClick}
                className={cn(
                  'w-full rounded-2xl p-10 sm:p-14 text-center transition-all duration-150 select-none',
                  gameState === 'idle' && 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 cursor-pointer',
                  gameState === 'waiting' && 'bg-gradient-to-br from-rose-500 to-red-600 cursor-wait',
                  gameState === 'ready' && 'bg-gradient-to-br from-emerald-400 to-green-500 cursor-pointer',
                  gameState === 'clicked' && 'bg-gradient-to-br from-amber-400 to-orange-500 cursor-pointer',
                  gameState === 'too-soon' && 'bg-gradient-to-br from-orange-500 to-red-500 cursor-pointer',
                )}
              >
                <AnimatePresence mode="wait">
                  {gameState === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                      <Target className="w-12 h-12 text-white/90 mx-auto" />
                      <p className="text-xl font-bold text-white">Click to Start</p>
                      <p className="text-sm text-white/70">Test your reaction speed in {totalRounds} rounds</p>
                    </motion.div>
                  )}
                  {gameState === 'waiting' && (
                    <motion.div key="waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      <Clock className="w-12 h-12 text-white/90 mx-auto animate-pulse" />
                      <p className="text-xl font-bold text-white">Wait for green...</p>
                      <p className="text-sm text-white/70">Don&apos;t click yet!</p>
                    </motion.div>
                  )}
                  {gameState === 'ready' && (
                    <motion.div key="ready" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                        <Zap className="w-12 h-12 text-white mx-auto" />
                      </motion.div>
                      <p className="text-xl font-bold text-white">Click NOW!</p>
                    </motion.div>
                  )}
                  {gameState === 'clicked' && lastTime !== null && (
                    <motion.div key="clicked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                      <p className="text-4xl font-bold text-white">{lastTime}ms</p>
                      <p className={cn('text-lg font-semibold', getRating(lastTime).color)}>
                        {getRating(lastTime).label}
                      </p>
                      <p className="text-sm text-white/70">Click to continue</p>
                    </motion.div>
                  )}
                  {gameState === 'too-soon' && (
                    <motion.div key="too-soon" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                      <p className="text-xl font-bold text-white">Too Soon! 😬</p>
                      <p className="text-sm text-white/70">Click to try again</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Mini history bar */}
              {times.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Recent attempts:</p>
                  <div className="flex items-end gap-1 h-16">
                    {times.map((t, i) => {
                      const height = Math.max((t / maxTime) * 100, 10);
                      const rating = getRating(t);
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.05 }}
                          className={cn('flex-1 rounded-t-sm min-h-[4px]', rating.bg)}
                          title={`${t}ms`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* Results Screen */
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <div>
                <h3 className="text-2xl font-bold">
                  {averageTime < 250 ? '⚡ Lightning Fast!' : averageTime < 350 ? '🎉 Great Reflexes!' : '💪 Keep Practicing!'}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {getRating(averageTime).label}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{bestTime}ms</p>
                    <p className="text-xs text-muted-foreground">Best</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{averageTime}ms</p>
                    <p className="text-xs text-muted-foreground">Average</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold">{times.length}</p>
                    <p className="text-xs text-muted-foreground">Attempts</p>
                  </CardContent>
                </Card>
              </div>

              {/* All attempts bar chart */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">All attempts:</p>
                <div className="flex items-end gap-1 h-20 bg-muted/30 rounded-lg p-2">
                  {times.map((t, i) => {
                    const height = Math.max((t / maxTime) * 100, 8);
                    const rating = getRating(t);
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.05 + 0.3 }}
                        className={cn('flex-1 rounded-t-sm min-h-[4px]', rating.bg)}
                        title={`${t}ms - ${getRating(t).label}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Faster</span>
                  <span>Slower</span>
                </div>
              </div>

              <Button onClick={resetGame} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
