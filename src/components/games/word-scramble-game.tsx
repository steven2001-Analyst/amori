'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shuffle,
  Lightbulb,
  SkipForward,
  Trophy,
  RotateCcw,
  Star,
  Timer,
  Zap,
  PartyPopper,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

interface TermData {
  word: string;
  hint: string;
}

const TERMS: TermData[] = [
  { word: 'DATABASE', hint: 'Organized collection of structured data' },
  { word: 'PIVOT', hint: 'Summarize data by grouping in Excel' },
  { word: 'PYTHON', hint: 'Popular programming language for data science' },
  { word: 'QUERY', hint: 'A request for data from a database' },
  { word: 'CHART', hint: 'Visual representation of data' },
  { word: 'FILTER', hint: 'Narrow down data based on criteria' },
  { word: 'AGGREGATE', hint: 'Combine multiple values into one result' },
  { word: 'REGRESSION', hint: 'Predicting continuous values' },
  { word: 'CLUSTER', hint: 'Group similar data points together' },
  { word: 'METRIC', hint: 'A measurable quantity in analytics' },
  { word: 'INSIGHT', hint: 'Deep understanding from data analysis' },
  { word: 'SCHEMA', hint: 'Structure that describes database organization' },
  { word: 'COLUMN', hint: 'Vertical field in a table or dataset' },
  { word: 'MATRIX', hint: 'Rectangular array of numbers in calculations' },
  { word: 'DAEMON', hint: 'Background process in Spark computing' },
];

const GAME_DURATION = 60;
const CORRECT_POINTS = 10;
const BONUS_POINTS = 5;
const SKIP_PENALTY = 5;

function scrambleWord(word: string): string[] {
  const letters = word.split('');
  // Fisher-Yates shuffle
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  // If scramble resulted in same word, swap first two letters
  if (letters.join('') === word && letters.length > 1) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  return letters;
}

function shuffleTerms(): TermData[] {
  const shuffled = [...TERMS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Celebration particles
function CelebrationParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: -(Math.random() * 150 + 50),
    rotate: Math.random() * 360,
    delay: Math.random() * 0.3,
    color: ['text-emerald-400', 'text-teal-400', 'text-amber-400', 'text-yellow-300'][
      Math.floor(Math.random() * 4)
    ],
    emoji: ['✨', '⭐', '🎉', '🌟'][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={cn('absolute text-lg left-1/2 top-1/2', p.color)}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.5 }}
          animate={{
            x: p.x,
            y: p.y,
            rotate: p.rotate,
            opacity: 0,
            scale: 1.5,
          }}
          transition={{ duration: 0.8, delay: p.delay, ease: 'easeOut' }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

export default function WordScrambleGame() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [termQueue, setTermQueue] = useState<TermData[]>([]);
  const [currentTermIdx, setCurrentTermIdx] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [wordsCorrect, setWordsCorrect] = useState(0);
  const [wordsSkipped, setWordsSkipped] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { wordScrambleHighScore, setWordScrambleHighScore } = useProgressStore();

  const currentTerm = termQueue[currentTermIdx] || null;

  const advanceToNext = useCallback(() => {
    if (currentTermIdx < termQueue.length - 1) {
      const nextIdx = currentTermIdx + 1;
      setCurrentTermIdx(nextIdx);
      setScrambledLetters(scrambleWord(termQueue[nextIdx].word));
      setUserGuess('');
      setHintUsed(false);
      setShowHint(false);
      setShowAnswer(false);
      setFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setGameState('finished');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [currentTermIdx, termQueue]);

  const startGame = useCallback(() => {
    const queue = shuffleTerms();
    setTermQueue(queue);
    setCurrentTermIdx(0);
    setScrambledLetters(scrambleWord(queue[0].word));
    setUserGuess('');
    setScore(0);
    setWordsCorrect(0);
    setWordsSkipped(0);
    setHintUsed(false);
    setShowHint(false);
    setShowAnswer(false);
    setFeedback(null);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleGuess = useCallback(() => {
    if (!currentTerm || feedback) return;
    if (userGuess.trim().toUpperCase() === currentTerm.word.toUpperCase()) {
      const points = hintUsed ? CORRECT_POINTS : CORRECT_POINTS + BONUS_POINTS;
      setScore((prev) => prev + points);
      setWordsCorrect((prev) => prev + 1);
      setFeedback('correct');
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        advanceToNext();
      }, 1200);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 800);
    }
  }, [currentTerm, userGuess, hintUsed, feedback, advanceToNext]);

  const handleSkip = useCallback(() => {
    if (feedback) return;
    setScore((prev) => Math.max(0, prev - SKIP_PENALTY));
    setWordsSkipped((prev) => prev + 1);
    setShowAnswer(true);
    setTimeout(() => advanceToNext(), 2000);
  }, [feedback, advanceToNext]);

  const handleHint = useCallback(() => {
    setHintUsed(true);
    setShowHint(true);
  }, []);

  // Timer with end-game check inside the interval callback
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimeout(() => {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            setGameState('finished');
            setWordScrambleHighScore(score);
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, score, setWordScrambleHighScore]);

  useEffect(() => {
    if (gameState === 'finished' && wordsCorrect > 0) {
      setWordScrambleHighScore(score);
    }
  }, [gameState, score, wordsCorrect, setWordScrambleHighScore]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleGuess();
      }
    },
    [handleGuess]
  );

  const letterColors = [
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-teal-500" />
            Word Scramble
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                timeLeft <= 10 && timeLeft > 0
                  ? 'border-red-400 text-red-500'
                  : 'border-teal-400 text-teal-600 dark:text-teal-400'
              )}
            >
              <Timer className="w-3 h-3 mr-1" />
              {timeLeft}s
            </Badge>
            <Badge
              variant="secondary"
              className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            >
              <Star className="w-3 h-3 mr-1" />
              {score} pts
            </Badge>
            {wordScrambleHighScore > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                Best: {wordScrambleHighScore}
              </Badge>
            )}
          </div>
        </div>
        {gameState === 'playing' && (
          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <motion.div
              className="bg-teal-500 h-1.5 rounded-full"
              animate={{ width: `${((GAME_DURATION - timeLeft) / GAME_DURATION) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
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
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mb-4">
                  <Shuffle className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Word Scramble</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Unscramble data analytics terms! Use hints wisely — bonus points for
                  solving without them.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  +10 correct
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  +5 no hint bonus
                </div>
                <div className="flex items-center gap-1">
                  <SkipForward className="w-3.5 h-3.5 text-red-400" />
                  -5 skip
                </div>
              </div>
              <Button
                onClick={startGame}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Start Scrambling
              </Button>
            </motion.div>
          )}

          {gameState === 'playing' && currentTerm && (
            <motion.div
              key={`word-${currentTermIdx}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              {/* Progress indicator */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Word {currentTermIdx + 1} of {termQueue.length}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500">{wordsCorrect} correct</span>
                  <span className="text-red-400">{wordsSkipped} skipped</span>
                </div>
              </div>

              {/* Scrambled letters */}
              <div className="relative flex items-center justify-center py-6">
                {showCelebration && <CelebrationParticles />}
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                  {scrambledLetters.map((letter, idx) => (
                    <motion.div
                      key={`${currentTermIdx}-${idx}`}
                      initial={{ y: -20, opacity: 0, rotate: -10 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
                      className={cn(
                        'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-md',
                        letterColors[idx % letterColors.length],
                        feedback === 'correct' && 'ring-2 ring-emerald-400 ring-offset-2'
                      )}
                    >
                      {letter}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer..."
                    disabled={feedback === 'correct' || showAnswer}
                    className={cn(
                      'flex-1 h-12 px-4 rounded-xl border-2 bg-transparent text-base font-medium outline-none transition-all',
                      feedback === 'correct'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                        : feedback === 'incorrect'
                          ? 'border-red-400 bg-red-50 dark:bg-red-950/20 animate-shake'
                          : 'border-border focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20'
                    )}
                  />
                  <Button
                    onClick={handleGuess}
                    disabled={!userGuess.trim() || feedback === 'correct' || showAnswer}
                    className="h-12 px-6 bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Feedback message */}
                <AnimatePresence>
                  {feedback === 'correct' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                    >
                      <PartyPopper className="w-4 h-4 inline mr-1" />
                      Correct! +{hintUsed ? CORRECT_POINTS : CORRECT_POINTS + BONUS_POINTS} points
                      {!hintUsed && ' (no hint bonus!)'}
                    </motion.div>
                  )}
                  {feedback === 'incorrect' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-sm font-semibold text-red-500"
                    >
                      Try again! That&apos;s not quite right.
                    </motion.div>
                  )}
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-sm"
                    >
                      <span className="text-muted-foreground">The answer was: </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {currentTerm.word}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHint}
                  disabled={showHint || feedback === 'correct' || showAnswer}
                  className="gap-1.5"
                >
                  <Lightbulb className="w-4 h-4" />
                  {showHint ? 'Hint Used' : 'Hint'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  disabled={feedback === 'correct' || showAnswer}
                  className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip (-5)
                </Button>
              </div>

              {/* Hint */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {currentTerm.hint} — First letter: <strong>{currentTerm.word[0]}</strong>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-teal-500 flex items-center justify-center mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {score >= 100
                    ? '🏆 Word Master!'
                    : score >= 60
                      ? '🌟 Great Job!'
                      : score >= 30
                        ? '👍 Not Bad!'
                        : '💪 Keep Going!'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {score >= 100
                    ? 'You really know your data terms!'
                    : score >= 60
                      ? 'Solid knowledge of analytics terminology!'
                      : 'Practice more and you\'ll master them!'}
                </p>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                <div className="text-center p-4 rounded-xl bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/10">
                  <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {score}
                  </div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-b from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {wordsCorrect}
                  </div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-b from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/10">
                  <SkipForward className="w-5 h-5 mx-auto mb-1 text-red-400" />
                  <div className="text-2xl font-bold text-red-500">
                    {wordsSkipped}
                  </div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>
              </div>

              {wordScrambleHighScore > 0 && (
                <p className="text-sm text-muted-foreground">
                  <Trophy className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                  All-time best: <span className="font-bold">{wordScrambleHighScore}</span> points
                </p>
              )}

              <Button
                onClick={startGame}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700"
              >
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
