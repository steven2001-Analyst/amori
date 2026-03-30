'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Timer, FileText, Keyboard, CalendarDays, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import PomodoroTimer from './pomodoro-timer';
import CheatSheet from './cheat-sheet';
import KeyboardShortcuts from './keyboard-shortcuts';
import StudyPlanner from './study-planner';

type ToolTab = 'pomodoro' | 'cheatsheet' | 'shortcuts' | 'planner';

const tools = [
  { id: 'pomodoro' as ToolTab, title: 'Pomodoro Timer', description: 'Stay focused with timed study sessions', icon: Timer, color: 'from-emerald-500 to-teal-500' },
  { id: 'cheatsheet' as ToolTab, title: 'Formula Cheat Sheet', description: 'Quick reference for Excel, SQL, Python & DAX', icon: FileText, color: 'from-amber-500 to-orange-500' },
  { id: 'shortcuts' as ToolTab, title: 'Keyboard Shortcuts', description: 'Speed up your workflow with key combos', icon: Keyboard, color: 'from-sky-500 to-cyan-500' },
  { id: 'planner' as ToolTab, title: 'Study Planner', description: 'Plan and organize your weekly study schedule', icon: CalendarDays, color: 'from-rose-500 to-pink-500' },
];

export default function ToolsView() {
  const [activeTool, setActiveTool] = useState<ToolTab>('pomodoro');

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wrench className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold">Study Tools</h2>
        </div>
        <p className="text-muted-foreground">
          Boost your productivity with these essential study utilities
        </p>
      </div>

      {/* Tool Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <motion.div key={tool.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-300 overflow-hidden',
                  isActive
                    ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'hover:shadow-md'
                )}
                onClick={() => setActiveTool(tool.id)}
              >
                <CardContent className={cn('p-4', isActive && 'bg-muted/30')}>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
                        tool.color
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tool.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{tool.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tool Content */}
      <motion.div
        key={activeTool}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTool === 'pomodoro' && <PomodoroTimer />}
        {activeTool === 'cheatsheet' && <CheatSheet />}
        {activeTool === 'shortcuts' && <KeyboardShortcuts />}
        {activeTool === 'planner' && <StudyPlanner />}
      </motion.div>
    </div>
  );
}
