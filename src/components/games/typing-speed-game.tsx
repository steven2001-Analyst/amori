'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  Timer,
  Trophy,
  RotateCcw,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

const WORDS = [
  'SELECT', 'DataFrame', 'VLOOKUP', 'PivotTable', 'matplotlib',
  'ALTER TABLE', 'GROUP BY', 'import pandas', 'CREATE TABLE',
  'JOIN', 'INSERT INTO', 'Power Query', 'DAX', 'scatter plot',
  'numpy array', 'bar chart', 'ETL pipeline', 'data warehouse',
  'stored procedure', 'window function', 'CTE', 'Delta Lake',
  'dbt model', 'MLflow', 'Kafka', 'Spark SQL', 'A/B test',
  'data mesh', 'schema design', 'regression', 'classification',
  'clustering', 'hypothesis', 'normalization', 'star schema',
  'snowflake schema',
];

const GAME_DURATION = 30;

interface CharState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect';
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TypingSpeedGame() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [wordQueue, setWordQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charStates, setCharStates] = useState<CharState[][]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [incorrectKeystrokes, setIncorrectKeystrokes] = useState(0);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const { typingGameBestWpm, setTypingGameCompleted, setTypingGameBestWpm } = useProgressStore();

  const initGame = useCallback(() => {
    const shuffled = shuffleArray(WORDS);
    const queue = [];
    for (let i = 0; i < 50; i++) {
      queue.push(shuffled[i % shuffled.length]);
    }
    setWordQueue(queue);
    setCharStates(
      queue.map((word) =>
        word.split('').map((char) => ({ char, status: 'pending' as const }))
      )
    );
    setCurrentIndex(0);
    setCursorPos(0);
    setCorrectKeystrokes(0);
    setIncorrectKeystrokes(0);
    setWordsTyped(0);
    setCurrentWpm(0);
    setFinalWpm(0);
    setFinalAccuracy(0);
    setTimeLeft(GAME_DURATION);
  }, []);

  const startGame = useCallback(() => {
    initGame();
    setGameState('playing');
    startTimeRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [initGame]);

  const endGame = useCallback(() => {
    setGameState('finished');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
    const totalKeystrokes = correctKeystrokes + incorrectKeystrokes;
    const accuracy = totalKeystrokes > 0
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
      : 0;
    const wpm = elapsed > 0 ? Math.round((wordsTyped / elapsed) * (accuracy / 100)) : 0;
    setFinalWpm(wpm);
    setFinalAccuracy(accuracy);
    setTypingGameCompleted(true);
    setTypingGameBestWpm(wpm);
  }, [correctKeystrokes, incorrectKeystrokes, wordsTyped, setTypingGameCompleted, setTypingGameBestWpm]);

  // Timer with end-game check inside the interval callback
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer ended — end game from inside the interval callback (not a synchronous setState in effect)
          setTimeout(() => {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            endGame();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, endGame]);

  // Real-time WPM update
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
      const totalKeystrokes = correctKeystrokes + incorrectKeystrokes;
      const accuracy = totalKeystrokes > 0
        ? (correctKeystrokes / totalKeystrokes) * 100
        : 100;
      const wpm = elapsed > 0 ? Math.round((wordsTyped / elapsed) * (accuracy / 100)) : 0;
      setCurrentWpm(wpm);
    }, 500);
    return () => clearInterval(interval);
  }, [gameState, correctKeystrokes, incorrectKeystrokes, wordsTyped]);

  // Handle keystrokes
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (gameState !== 'playing') return;
      e.preventDefault();

      if (e.key === 'Backspace') {
        if (cursorPos > 0) {
          setCursorPos((prev) => prev - 1);
          setCharStates((prev) => {
            const newStates = prev.map((word) => word.map((c) => ({ ...c })));
            const word = newStates[currentIndex];
            if (word[cursorPos - 1]) {
              word[cursorPos - 1].status = 'pending';
            }
            return newStates;
          });
        }
        return;
      }

      if (e.key === ' ') {
        // Move to next word
        if (currentIndex < wordQueue.length - 1) {
          // Check if current word is fully typed
          const wordLen = wordQueue[currentIndex].length;
          if (cursorPos >= wordLen) {
            setWordsTyped((prev) => prev + 1);
          }
          setCurrentIndex((prev) => prev + 1);
          setCursorPos(0);
        }
        return;
      }

      if (e.key.length === 1) {
        const expectedChar = wordQueue[currentIndex]?.[cursorPos];
        if (!expectedChar) return;

        const isCorrect = e.key === expectedChar;

        setCharStates((prev) => {
          const newStates = prev.map((word) => word.map((c) => ({ ...c })));
          newStates[currentIndex][cursorPos].status = isCorrect ? 'correct' : 'incorrect';
          return newStates;
        });

        if (isCorrect) {
          setCorrectKeystrokes((prev) => prev + 1);
        } else {
          setIncorrectKeystrokes((prev) => prev + 1);
        }
        setCursorPos((prev) => prev + 1);

        // Auto-advance to next word if at end
        if (cursorPos + 1 >= wordQueue[currentIndex].length) {
          if (currentIndex < wordQueue.length - 1) {
            setWordsTyped((prev) => prev + 1);
            setCurrentIndex((prev) => prev + 1);
            setCursorPos(0);
          }
        }
      }
    },
    [gameState, currentIndex, cursorPos, wordQueue]
  );

  const renderWord = (wordIdx: number) => {
    const states = charStates[wordIdx];
    if (!states) return null;
    const isCurrent = wordIdx === currentIndex;
    const isPast = wordIdx < currentIndex;

    return (
      <span
        key={wordIdx}
        className={cn(
          'inline-flex mr-3 mb-2 transition-opacity duration-200',
          isPast && 'opacity-40',
          isCurrent && 'opacity-100'
        )}
      >
        {states.map((charState, charIdx) => {
          const isCursorHere = isCurrent && charIdx === cursorPos;
          return (
            <span
              key={charIdx}
              className={cn(
                'relative inline-block text-lg sm:text-xl font-mono leading-relaxed transition-colors duration-100',
                charState.status === 'correct' && 'text-emerald-500 dark:text-emerald-400',
                charState.status === 'incorrect' &&
                  'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-sm',
                charState.status === 'pending' && 'text-muted-foreground'
              )}
            >
              {charState.char === ' ' ? '\u00A0' : charState.char}
              {isCursorHere && (
                <motion.span
                  layoutId="cursor"
                  className="absolute left-0 top-0 w-[2px] h-full bg-emerald-500"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-emerald-500" />
            Typing Speed Test
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                timeLeft <= 5 && timeLeft > 0
                  ? 'border-red-400 text-red-500'
                  : 'border-emerald-400 text-emerald-600 dark:text-emerald-400'
              )}
            >
              <Timer className="w-3 h-3 mr-1" />
              {timeLeft}s
            </Badge>
            <Badge
              variant="secondary"
              className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
            >
              <Zap className="w-3 h-3 mr-1" />
              {gameState === 'playing' ? currentWpm : gameState === 'finished' ? finalWpm : 0} WPM
            </Badge>
            {typingGameBestWpm > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Trophy className="w-3 h-3 mr-1 text-amber-500" />
                Best: {typingGameBestWpm}
              </Badge>
            )}
          </div>
        </div>
        {gameState === 'playing' && (
          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <motion.div
              className="bg-emerald-500 h-1.5 rounded-full"
              animate={{ width: `${((GAME_DURATION - timeLeft) / GAME_DURATION) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Hidden input for capturing keystrokes */}
        <input
          ref={inputRef}
          type="text"
          className="absolute opacity-0 pointer-events-none"
          onKeyDown={handleKeyDown}
          readOnly
        />

        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12 space-y-6"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4">
                  <Keyboard className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Typing Speed Test</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Type data analytics terms as fast and accurately as you can.
                  Press <kbd className="px-2 py-0.5 rounded bg-muted text-xs font-mono">Space</kbd> to advance.
                </p>
              </div>
              <Button
                onClick={startGame}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Typing
              </Button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {currentWpm}
                  </div>
                  <div className="text-xs text-muted-foreground">WPM</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-teal-50 dark:bg-teal-950/20">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {correctKeystrokes + incorrectKeystrokes > 0
                      ? Math.round(
                          (correctKeystrokes / (correctKeystrokes + incorrectKeystrokes)) * 100
                        )
                      : 100}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {wordsTyped}
                  </div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>
              </div>

              {/* Typing Area */}
              <div
                className="min-h-[140px] max-h-[200px] overflow-y-auto p-4 rounded-xl border-2 border-border bg-card cursor-text"
                onClick={() => inputRef.current?.focus()}
              >
                <div className="flex flex-wrap leading-relaxed">
                  {charStates.map((_, idx) => renderWord(idx))}
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Click the text area to focus • <kbd className="px-1 py-0.5 rounded bg-muted text-xs font-mono">Backspace</kbd> to correct • <kbd className="px-1 py-0.5 rounded bg-muted text-xs font-mono">Space</kbd> to skip
              </p>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {finalWpm >= 60
                    ? '⚡ Lightning Fast!'
                    : finalWpm >= 40
                      ? '🔥 Great Typing!'
                      : finalWpm >= 25
                        ? '👍 Good Job!'
                        : '💪 Keep Practicing!'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {finalWpm >= 60
                    ? 'You type like a data professional!'
                    : finalWpm >= 40
                      ? 'Solid speed for data work!'
                      : 'Practice makes perfect!'}
                </p>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                <div className="text-center p-4 rounded-xl bg-gradient-to-b from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {finalWpm}
                  </div>
                  <div className="text-xs text-muted-foreground">WPM</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-b from-teal-50 to-teal-100/50 dark:from-teal-950/30 dark:to-teal-900/10">
                  <Target className="w-5 h-5 mx-auto mb-1 text-teal-500" />
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {finalAccuracy}%
                  </div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/10">
                  <Zap className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {wordsTyped}
                  </div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>
              </div>

              {/* Keystroke Breakdown */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">
                    {correctKeystrokes} correct
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-muted-foreground">
                    {incorrectKeystrokes} incorrect
                  </span>
                </div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
