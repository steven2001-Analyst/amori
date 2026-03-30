'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Clock, Move } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

const DATA_EMOJIS = ['📊', '📈', '📉', '🗂️', '💾', '🔍', '✅', '🔧', '⚡', '🎯', '💡', '💻', '🧮', '📋'];

interface CardData {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number; cols: string; label: string }> = {
  easy: { pairs: 6, cols: 'grid-cols-3 sm:grid-cols-4', label: 'Easy (4×3)' },
  medium: { pairs: 8, cols: 'grid-cols-4', label: 'Medium (4×4)' },
  hard: { pairs: 12, cols: 'grid-cols-4 sm:grid-cols-6', label: 'Hard (6×4)' },
};

function createCards(difficulty: Difficulty): CardData[] {
  const config = DIFFICULTY_CONFIG[difficulty];
  const selectedEmojis = DATA_EMOJIS.slice(0, config.pairs);
  const cardPairs = [...selectedEmojis, ...selectedEmojis].map((emoji, i) => ({
    id: i,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));

  // Shuffle
  for (let i = cardPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
  }

  return cardPairs;
}

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<CardData[]>(() => createCards('easy'));
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [bestScores, setBestScores] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  });
  const { setMemoryGameCompleted } = useProgressStore();

  const initGame = useCallback(
    (diff?: Difficulty) => {
      const d = diff || difficulty;
      const cardPairs = createCards(d);
      setCards(cardPairs);
      setFlippedCards([]);
      setMoves(0);
      setTime(0);
      setIsPlaying(true);
      setIsComplete(false);
    },
    [difficulty]
  );

  const handleDifficultyChange = useCallback(
    (newDifficulty: Difficulty) => {
      setDifficulty(newDifficulty);
      const cardPairs = createCards(newDifficulty);
      setCards(cardPairs);
      setFlippedCards([]);
      setMoves(0);
      setTime(0);
      setIsPlaying(true);
      setIsComplete(false);
    },
    []
  );

  useEffect(() => {
    if (!isPlaying || isComplete) return;
    const timer = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, isComplete]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      const card1 = cards.find((c) => c.id === first)!;
      const card2 = cards.find((c) => c.id === second)!;

      if (card1.emoji === card2.emoji) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);

          // Check if game is complete
          const allMatched = cards.every((c) => c.isMatched || c.id === first || c.id === second);
          if (allMatched) {
            setIsComplete(true);
            setIsPlaying(false);
            setMemoryGameCompleted(true);
            setBestScores((prev) => {
              const current = prev[difficulty];
              const score = moves + 1;
              if (current === null || score < current) {
                return { ...prev, [difficulty]: score };
              }
              return prev;
            });
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg">Memory Match</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <Button
                key={d}
                variant={difficulty === d ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDifficultyChange(d)}
                className="text-xs"
              >
                {DIFFICULTY_CONFIG[d].label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{moves} moves</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatTime(time)}</span>
          </div>
          {bestScores[difficulty] !== null && (
            <Badge variant="secondary" className="text-xs">
              Best: {bestScores[difficulty]} moves
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => initGame()}
            className="ml-auto"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Game Grid */}
        <div className={cn('grid gap-2 sm:gap-3 max-w-md mx-auto', config.cols)}>
          <AnimatePresence>
            {cards.map((card) => (
              <motion.button
                key={card.id}
                layout
                whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
                whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                onClick={() => handleCardClick(card.id)}
                className={cn(
                  'aspect-square rounded-xl text-2xl sm:text-3xl font-bold transition-all duration-300 relative',
                  card.isMatched
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700'
                    : card.isFlipped
                      ? 'bg-white dark:bg-card border-2 border-emerald-400 shadow-lg'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md cursor-pointer'
                )}
                disabled={card.isFlipped || card.isMatched || isComplete}
              >
                {card.isFlipped || card.isMatched ? (
                  <motion.span
                    initial={{ rotateY: 90, scale: 0 }}
                    animate={{ rotateY: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="block"
                  >
                    {card.emoji}
                  </motion.span>
                ) : (
                  <span className="text-white/50 text-xl">?</span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Complete Message */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20"
            >
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                🎉 Congratulations!
              </p>
              <p className="text-sm text-muted-foreground">
                Completed in {moves} moves and {formatTime(time)}!
              </p>
              <Button
                onClick={() => initGame()}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
              >
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
