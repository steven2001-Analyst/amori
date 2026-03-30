'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Brain, HelpCircle, Wind, Type, TextCursorInput, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import MemoryGame from './memory-game';
import QuizGame from './quiz-game';
import BreathingExercise from './breathing-exercise';
import TypingSpeedGame from './typing-speed-game';
import WordScrambleGame from './word-scramble-game';
import ReactionTimeGame from './reaction-time-game';

type GameTab = 'memory' | 'quiz' | 'typing' | 'scramble' | 'reaction' | 'breathing';

const games = [
  { id: 'memory' as GameTab, title: 'Memory Match', description: 'Test your memory with data analytics icons', icon: Brain, color: 'from-purple-500 to-pink-500' },
  { id: 'quiz' as GameTab, title: 'Quick Quiz', description: 'Challenge your knowledge with fun questions', icon: HelpCircle, color: 'from-emerald-500 to-teal-500' },
  { id: 'typing' as GameTab, title: 'Typing Speed', description: 'Type data terms as fast as you can', icon: Type, color: 'from-amber-500 to-orange-500' },
  { id: 'scramble' as GameTab, title: 'Word Scramble', description: 'Unscramble data analytics terms', icon: TextCursorInput, color: 'from-teal-500 to-cyan-500' },
  { id: 'reaction' as GameTab, title: 'Reaction Time', description: 'Test your reflexes with a speed challenge', icon: Zap, color: 'from-rose-500 to-red-500' },
  { id: 'breathing' as GameTab, title: 'Breathing Exercise', description: 'Take a break and relax your mind', icon: Wind, color: 'from-sky-500 to-cyan-500' },
];

export default function GamesView() {
  const [activeGame, setActiveGame] = useState<GameTab>('memory');

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold">Games & Break</h2>
        </div>
        <p className="text-muted-foreground">
          Take a break from studying with these fun activities
        </p>
      </div>

      {/* Game Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {games.map((game) => {
          const Icon = game.icon;
          const isActive = activeGame === game.id;
          return (
            <motion.div key={game.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-300 overflow-hidden',
                  isActive
                    ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'hover:shadow-md'
                )}
                onClick={() => setActiveGame(game.id)}
              >
                <CardContent className={cn('p-3', isActive && 'bg-muted/30')}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
                        game.color
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-tight">{game.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Game Content */}
      <motion.div
        key={activeGame}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeGame === 'memory' && <MemoryGame />}
        {activeGame === 'quiz' && <QuizGame />}
        {activeGame === 'typing' && <TypingSpeedGame />}
        {activeGame === 'scramble' && <WordScrambleGame />}
        {activeGame === 'reaction' && <ReactionTimeGame />}
        {activeGame === 'breathing' && <BreathingExercise />}
      </motion.div>
    </div>
  );
}
