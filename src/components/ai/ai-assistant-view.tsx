'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  ChevronDown,
  MessageSquare,
  CreditCard,
  ClipboardList,
  BookOpen,
  Code2,
  CalendarDays,
  Target,
  Copy,
  Check,
  ChevronRight,
  ChevronUp,
  Shuffle,
  FlipHorizontal,

  Menu,
  X,
  Loader2,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type AIMode =
  | 'chat'
  | 'flashcard'
  | 'quiz'
  | 'summarizer'
  | 'code'
  | 'planner'
  | 'interview';

interface ModeConfig {
  id: AIMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  placeholder: string;
  inputLabel: string;
  promptBuilder: (input: string) => string;
  inputType: 'text' | 'textarea';
  quickActions: string[];
  color: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Flashcard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

// ─── Mode Configs ─────────────────────────────────────────────────────────────

const modeConfigs: ModeConfig[] = [
  {
    id: 'chat',
    label: 'Chat',
    icon: <MessageSquare className="w-4 h-4" />,
    description: 'General Q&A about data analytics',
    placeholder: 'Ask DataBot anything about data analytics...',
    inputLabel: 'Your question',
    promptBuilder: (input) => input,
    inputType: 'text',
    quickActions: [
      'Explain JOIN types',
      'How does VLOOKUP work?',
      'Python vs SQL',
      'What is a data warehouse?',
    ],
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'flashcard',
    label: 'Flashcard Gen',
    icon: <CreditCard className="w-4 h-4" />,
    description: 'AI generates flashcards from any topic',
    placeholder: 'Enter a topic to generate flashcards...',
    inputLabel: 'Topic',
    promptBuilder: (input) =>
      `Generate 5 flashcards about ${input}. Format each flashcard strictly as:
FRONT|||BACK
One flashcard per line. No numbering, no extra text. Example:
What is a SQL JOIN?|||A JOIN combines rows from two or more tables based on a related column.`,
    inputType: 'text',
    quickActions: ['SQL Joins', 'Python Basics', 'Excel Functions', 'Power BI DAX'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'quiz',
    label: 'Quiz Gen',
    icon: <ClipboardList className="w-4 h-4" />,
    description: 'AI generates multiple-choice quizzes',
    placeholder: 'Enter a topic to generate a quiz...',
    inputLabel: 'Topic',
    promptBuilder: (input) =>
      `Generate 5 multiple choice questions about ${input}. Format each question strictly as:
Q: question text
A: option1
B: option2
C: option3
D: option4
ANSWER: correct_letter

One question per block, separated by blank lines. No extra text before or after.`,
    inputType: 'text',
    quickActions: ['SQL Basics', 'Python Data Types', 'Statistics 101', 'Data Modeling'],
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'summarizer',
    label: 'Summarizer',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Paste text and get an AI summary',
    placeholder: 'Paste the text you want to summarize...',
    inputLabel: 'Text to summarize',
    promptBuilder: (input) => `Summarize this in 3 key points:\n\n${input}`,
    inputType: 'textarea',
    quickActions: [],
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'code',
    label: 'Code Explainer',
    icon: <Code2 className="w-4 h-4" />,
    description: 'Paste code and get an explanation',
    placeholder: 'Paste the code you want explained...',
    inputLabel: 'Code to explain',
    promptBuilder: (input) => `Explain this code step by step:\n\n${input}`,
    inputType: 'textarea',
    quickActions: [],
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 'planner',
    label: 'Study Planner',
    icon: <CalendarDays className="w-4 h-4" />,
    description: 'AI generates a weekly study plan',
    placeholder: 'What topic do you want to study?',
    inputLabel: 'Study topic',
    promptBuilder: (input) =>
      `Create a weekly study plan for learning ${input}, with daily goals. Format as:
Monday: goal description
Tuesday: goal description
Wednesday: goal description
Thursday: goal description
Friday: goal description
Saturday: goal description
Sunday: goal description

After the schedule, add a line starting with TIPS: followed by 3 study tips.`,
    inputType: 'text',
    quickActions: ['SQL Mastery', 'Python for Data Science', 'Power BI', 'Data Engineering'],
    color: 'from-teal-500 to-emerald-500',
  },
  {
    id: 'interview',
    label: 'Interview Prep',
    icon: <Target className="w-4 h-4" />,
    description: 'AI generates interview Q&A',
    placeholder: 'What role or topic are you preparing for?',
    inputLabel: 'Role/Topic',
    promptBuilder: (input) =>
      `Generate 5 interview questions for ${input} with model answers. Format each as:
Q: question text
A: model answer text

One Q&A pair per block, separated by a blank line. No extra text before or after.`,
    inputType: 'text',
    quickActions: [
      'Data Analyst',
      'SQL Developer',
      'Python Developer',
      'Business Intelligence',
    ],
    color: 'from-indigo-500 to-violet-500',
  },
];

// ─── Utility Functions ────────────────────────────────────────────────────────

function formatMessage(content: string): string {
  let formatted = content;
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
  );
  formatted = formatted.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre class="bg-muted p-3 rounded-lg my-2 overflow-x-auto text-sm font-mono"><code>$2</code></pre>'
  );
  formatted = formatted.replace(/\n/g, '<br/>');
  return formatted;
}

function parseFlashcards(text: string): Flashcard[] {
  const cards: Flashcard[] = [];
  const lines = text.split('\n').filter((l) => l.trim());
  for (const line of lines) {
    const parts = line.split('|||');
    if (parts.length === 2) {
      cards.push({
        front: parts[0].replace(/^[\d.\s-]+/, '').trim(),
        back: parts[1].trim(),
      });
    }
  }
  return cards;
}

function parseQuizQuestions(text: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const blocks = text.split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    let question = '';
    const options: string[] = [];
    let answer = '';

    for (const line of lines) {
      const qMatch = line.match(/^Q:\s*(.+)/i);
      const aMatch = line.match(/^A:\s*(.+)/i);
      const bMatch = line.match(/^B:\s*(.+)/i);
      const cMatch = line.match(/^C:\s*(.+)/i);
      const dMatch = line.match(/^D:\s*(.+)/i);
      const ansMatch = line.match(/^ANSWER:\s*([A-Da-d])/i);

      if (qMatch) question = qMatch[1];
      else if (aMatch) options[0] = aMatch[1];
      else if (bMatch) options[1] = bMatch[1];
      else if (cMatch) options[2] = cMatch[1];
      else if (dMatch) options[3] = dMatch[1];
      if (ansMatch) answer = ansMatch[1].toUpperCase();
    }
    if (question && options.length === 4 && answer) {
      questions.push({ question, options, answer });
    }
  }
  return questions;
}

function parseStudyPlan(text: string): { schedule: { day: string; goal: string }[]; tips: string[] } {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const schedule: { day: string; goal: string }[] = [];
  const lines = text.split('\n');
  const tips: string[] = [];

  for (const line of lines) {
    if (line.startsWith('TIPS:')) {
      const tipsText = line.replace('TIPS:', '').trim();
      tipsText.split(/(?=\d[\.\)]\s)/).forEach((tip) => {
        const cleaned = tip.replace(/^\d[\.\)]\s*/, '').trim();
        if (cleaned) tips.push(cleaned);
      });
      continue;
    }
    for (const day of days) {
      const match = line.match(new RegExp(`^${day}[:\\s]+(.+)`, 'i'));
      if (match) {
        schedule.push({ day, goal: match[1].trim() });
      }
    }
  }

  if (tips.length === 0) {
    const tipsBlock = text.split('TIPS:')[1] || text.split('Tips:')[1] || text.split('tips:')[1] || '';
    tipsBlock.split('\n').filter(l => l.trim()).slice(0, 3).forEach(l => tips.push(l.replace(/^[\d.\-\s]+/, '').trim()));
  }

  return { schedule, tips };
}

function parseInterviewQA(text: string): { question: string; answer: string }[] {
  const qaList: { question: string; answer: string }[] = [];
  const blocks = text.split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    let question = '';
    let answer = '';

    for (const line of lines) {
      const qMatch = line.match(/^Q:\s*(.+)/i);
      const aMatch = line.match(/^A:\s*(.+)/i);
      if (qMatch) question = qMatch[1];
      else if (aMatch) answer += (answer ? ' ' : '') + aMatch[1];
    }
    if (question && answer) {
      qaList.push({ question, answer });
    }
  }
  return qaList;
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-emerald-500"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Mode Sidebar ─────────────────────────────────────────────────────────────

function ModeSidebar({
  activeMode,
  setActiveMode,
  isOpen,
  onClose,
}: {
  activeMode: AIMode;
  setActiveMode: (mode: AIMode) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed lg:relative z-50 lg:z-auto top-0 left-0 h-full w-72 lg:w-56 xl:w-64 flex-shrink-0 bg-background border-r flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">AI Workspace</h2>
              <p className="text-[11px] text-muted-foreground">7 tools available</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {modeConfigs.map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <motion.button
                key={mode.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveMode(mode.id);
                  onClose();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200',
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0',
                    isActive
                      ? `bg-gradient-to-br ${mode.color} text-white shadow-md`
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {mode.icon}
                </div>
                <div className="min-w-0">
                  <p className={cn('text-sm font-medium truncate', isActive && 'font-semibold')}>
                    {mode.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{mode.description}</p>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
            <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-tight">
              All tools are powered by AI. Click any tool to get started!
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

// ─── Quick Actions Bar ────────────────────────────────────────────────────────

function QuickActionsBar({
  mode,
  onAction,
}: {
  mode: AIMode;
  onAction: (action: string) => void;
}) {
  const config = modeConfigs.find((m) => m.id === mode);
  if (!config || config.quickActions.length === 0) return null;

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-wrap gap-2"
    >
      {config.quickActions.map((action) => (
        <motion.button
          key={action}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction(action)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full',
            'border transition-colors',
            'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            'hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
          )}
        >
          <Zap className="w-3 h-3" />
          {action}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ─── Chat Mode View ───────────────────────────────────────────────────────────

function ChatModeView({
  messages,
  isLoading,
  messagesEndRef,
  sendMessage,
  showQuickQuestions,
  setShowQuickQuestions,
}: {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  sendMessage: (text: string) => void;
  showQuickQuestions: boolean;
  setShowQuickQuestions: (v: boolean) => void;
}) {
  return (
    <>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4"
          >
            <Bot className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">Hi! I&apos;m DataBot</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Ask me anything about data analytics — Excel, SQL, Python, Power BI, and more!
          </p>

          <AnimatePresence>
            {showQuickQuestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-md"
              >
                <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1 justify-center">
                  <ChevronDown className="w-3 h-3" />
                  Try these questions
                  <ChevronDown className="w-3 h-3" />
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {modeConfigs[0].quickActions.map((q) => (
                    <motion.button
                      key={q}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        sendMessage(q);
                        setShowQuickQuestions(false);
                      }}
                      className="px-3 py-1.5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}

      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
              msg.role === 'user'
                ? 'bg-emerald-500'
                : 'bg-gradient-to-br from-emerald-500 to-teal-500'
            )}
          >
            {msg.role === 'user' ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
          <div
            className={cn(
              'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-emerald-500 text-white rounded-tr-sm'
                : 'bg-muted rounded-tl-sm'
            )}
          >
            {msg.role === 'assistant' ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none [&_code]:text-emerald-600 dark:[&_code]:text-emerald-400 [&_pre]:border-0 [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            ) : (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            )}
          </div>
        </motion.div>
      ))}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="bg-muted rounded-2xl rounded-tl-sm">
            <TypingIndicator />
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
}

// ─── Flashcard Mode View ──────────────────────────────────────────────────────

function FlashcardModeView({
  cards,
  isLoading,
}: {
  cards: Flashcard[];
  isLoading: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  const displayCards = useMemo(() => {
    if (!isShuffled) return cards;
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [cards, isShuffled]);



  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Generating flashcards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4"
        >
          <CreditCard className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Flashcard Generator</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Enter a topic and I&apos;ll create interactive flashcards to help you study!
        </p>
      </div>
    );
  }

  const currentCard = displayCards[currentIndex];

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Card Counter + Shuffle */}
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-xs">
          {currentIndex + 1} of {displayCards.length}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsShuffled(!isShuffled);
            toast.success(isShuffled ? 'Order restored' : 'Cards shuffled!');
          }}
          className="text-xs"
        >
          <Shuffle className="w-3.5 h-3.5 mr-1.5" />
          {isShuffled ? 'Unshuffle' : 'Shuffle'}
        </Button>
      </div>

      {/* Flashcard */}
      <motion.div
        key={`${currentIndex}-${isShuffled}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md cursor-pointer perspective-[1000px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full min-h-[220px]"
        >
          {/* Front */}
          <div
            className={cn(
              'absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center text-center',
              'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg',
              '[backface-visibility:hidden]'
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-3 opacity-80">Question</p>
            <p className="text-lg font-semibold leading-relaxed">{currentCard?.front}</p>
            <p className="text-xs mt-4 opacity-70">Click to flip</p>
          </div>

          {/* Back */}
          <div
            className={cn(
              'absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center text-center',
              'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg',
              '[backface-visibility:hidden] [transform:rotateY(180deg)]'
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-3 opacity-80">Answer</p>
            <p className="text-base font-medium leading-relaxed">{currentCard?.back}</p>
            <p className="text-xs mt-4 opacity-70">Click to flip back</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setCurrentIndex((prev) => Math.max(0, prev - 1));
            setIsFlipped(false);
          }}
          disabled={currentIndex === 0}
          className="rounded-full"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFlipped(!isFlipped)}
          className="rounded-full gap-1.5"
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
          Flip
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setCurrentIndex((prev) => Math.min(displayCards.length - 1, prev + 1));
            setIsFlipped(false);
          }}
          disabled={currentIndex === displayCards.length - 1}
          className="rounded-full"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Quiz Mode View ──────────────────────────────────────────────────────────

function QuizModeView({
  questions,
  isLoading,
}: {
  questions: QuizQuestion[];
  isLoading: boolean;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, string>>({});


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Generating quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4"
        >
          <ClipboardList className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Quiz Generator</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Enter a topic and I&apos;ll create a multiple-choice quiz to test your knowledge!
        </p>
      </div>
    );
  }

  const q = questions[currentQ];
  const isAnswered = answered[currentQ] !== undefined;
  const correctAnswer = q.answer.toUpperCase();

  const handleSelect = (letter: string) => {
    if (isAnswered) return;
    setSelected(letter);
    setAnswered((prev) => ({ ...prev, [currentQ]: letter }));
    if (letter === correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const isFinished = currentQ >= questions.length - 1 && isAnswered;

  return (
    <div className="flex flex-col items-center gap-6 py-4 max-w-lg mx-auto">
      {/* Score & Progress */}
      <div className="flex items-center justify-between w-full">
        <Badge variant="secondary" className="text-xs">
          Question {currentQ + 1} of {questions.length}
        </Badge>
        <Badge className="text-xs bg-violet-500 text-white">
          Score: {score}/{Object.keys(answered).length}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
          animate={{
            width: `${((Object.keys(answered).length) / questions.length) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {isFinished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">
              {Math.round((score / questions.length) * 100)}%
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2">Quiz Complete!</h3>
          <p className="text-muted-foreground mb-4">
            You got {score} out of {questions.length} questions correct
          </p>
          <Button
            onClick={() => {
              setCurrentQ(0);
              setSelected(null);
              setScore(0);
              setAnswered({});
            }}
            className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Question */}
          <Card className="w-full p-5">
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-1">
              Question {currentQ + 1}
            </p>
            <p className="text-base font-medium">{q.question}</p>
          </Card>

          {/* Options */}
          <div className="w-full grid grid-cols-1 gap-2">
            {q.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selected === letter;
              const isCorrect = letter === correctAnswer;

              return (
                <motion.button
                  key={letter}
                  whileHover={!isAnswered ? { scale: 1.01 } : undefined}
                  whileTap={!isAnswered ? { scale: 0.99 } : undefined}
                  onClick={() => handleSelect(letter)}
                  disabled={isAnswered}
                  className={cn(
                    'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                    !isAnswered &&
                      'border-muted hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30 cursor-pointer',
                    isAnswered && isCorrect &&
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                    isAnswered && isSelected && !isCorrect &&
                      'border-red-500 bg-red-50 dark:bg-red-950/30',
                    isAnswered && !isSelected && !isCorrect && 'opacity-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors',
                      !isAnswered && 'bg-muted text-muted-foreground',
                      isAnswered && isCorrect && 'bg-emerald-500 text-white',
                      isAnswered && isSelected && !isCorrect && 'bg-red-500 text-white',
                      isAnswered && !isSelected && !isCorrect && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {letter}
                  </div>
                  <span className="text-sm flex-1">{option}</span>
                  {isAnswered && isCorrect && (
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <X className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Next Button */}
          {isAnswered && currentQ < questions.length - 1 && (
            <Button
              onClick={() => {
                setCurrentQ((prev) => prev + 1);
                setSelected(null);
              }}
              className="bg-gradient-to-r from-violet-500 to-purple-500 text-white w-full"
            >
              Next Question
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Summarizer Mode View ─────────────────────────────────────────────────────

function SummarizerModeView({
  summary,
  isLoading,
  originalText,
}: {
  summary: string;
  isLoading: boolean;
  originalText: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Summary copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Summarizing text...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4"
        >
          <BookOpen className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Text Summarizer</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Paste any text below and get a concise 3-point summary powered by AI!
        </p>
      </div>
    );
  }

  const keyPoints = summary
    .split(/\n/)
    .filter((l) => l.trim())
    .map((l) => l.replace(/^[\d.\-\*\s]+/, '').trim());

  return (
    <div className="flex flex-col gap-4 py-4 max-w-2xl mx-auto">
      {/* Original Text Preview */}
      {originalText && (
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Original Text
          </p>
          <p className="text-sm text-muted-foreground line-clamp-3">{originalText}</p>
        </Card>
      )}

      {/* Summary */}
      <Card className="p-5 border-cyan-200 dark:border-cyan-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Key Points Summary</p>
              <p className="text-[11px] text-muted-foreground">
                {keyPoints.length} key points extracted
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <div className="space-y-3">
          {keyPoints.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">{idx + 1}</span>
              </div>
              <p className="text-sm leading-relaxed">{point}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Code Explainer Mode View ────────────────────────────────────────────────

function CodeExplainerModeView({
  code,
  explanation,
  isLoading,
}: {
  code: string;
  explanation: string;
  isLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    toast.success('Explanation copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Analyzing code...</p>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-4"
        >
          <Code2 className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Code Explainer</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Paste any code below and I&apos;ll explain it step by step!
        </p>
      </div>
    );
  }

  const steps = explanation
    .split(/\n/)
    .filter((l) => l.trim())
    .map((l) => l.replace(/^[\d.\-\*\s]+/, '').trim());

  return (
    <div className="flex flex-col gap-4 py-4 max-w-3xl mx-auto">
      {/* Code Block */}
      {code && (
        <Card className="p-4 overflow-hidden">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Your Code
          </p>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-48 overflow-y-auto">
            <code>{code}</code>
          </pre>
        </Card>
      )}

      {/* Explanation */}
      <Card className="p-5 border-rose-200 dark:border-rose-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Step-by-Step Explanation</p>
              <p className="text-[11px] text-muted-foreground">{steps.length} steps</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400">{idx + 1}</span>
              </div>
              <p className="text-sm leading-relaxed">{step}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Study Planner Mode View ─────────────────────────────────────────────────

function StudyPlannerModeView({
  plan,
  isLoading,
}: {
  plan: { schedule: { day: string; goal: string }[]; tips: string[] };
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Creating your study plan...</p>
      </div>
    );
  }

  if (plan.schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mb-4"
        >
          <CalendarDays className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Study Planner</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Tell me what you want to learn and I&apos;ll create a weekly study plan for you!
        </p>
      </div>
    );
  }

  const dayEmojis: Record<string, string> = {
    Monday: '🟢',
    Tuesday: '🔵',
    Wednesday: '🟡',
    Thursday: '🟠',
    Friday: '🟣',
    Saturday: '🔴',
    Sunday: '⚪',
  };

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto">
      {/* Week Schedule */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">Weekly Study Plan</p>
            <p className="text-[11px] text-muted-foreground">7 days of focused learning</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {plan.schedule.map((item, idx) => (
            <motion.div
              key={item.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="text-lg shrink-0">{dayEmojis[item.day] || '📋'}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-teal-700 dark:text-teal-400">{item.day}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.goal}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Tips */}
      {plan.tips.length > 0 && (
        <Card className="p-5 border-teal-200 dark:border-teal-800">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-semibold">Study Tips</p>
          </div>
          <div className="space-y-2">
            {plan.tips.map((tip, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.15 + 0.3 }}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="text-amber-500 shrink-0">•</span>
                {tip}
              </motion.p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Interview Prep Mode View ────────────────────────────────────────────────

function InterviewPrepModeView({
  qaList,
  isLoading,
}: {
  qaList: { question: string; answer: string }[];
  isLoading: boolean;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Generating interview questions...</p>
      </div>
    );
  }

  if (qaList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4"
        >
          <Target className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Interview Prep</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Tell me the role you&apos;re preparing for and I&apos;ll generate practice questions with model answers!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <Target className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold">Interview Q&A</p>
          <p className="text-[11px] text-muted-foreground">{qaList.length} questions with model answers</p>
        </div>
      </div>

      {qaList.map((qa, idx) => {
        const isExpanded = expandedIdx === idx;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={cn(
                'overflow-hidden transition-all duration-300 cursor-pointer',
                isExpanded && 'border-indigo-300 dark:border-indigo-700 shadow-md'
              )}
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
            >
              <div className="flex items-start gap-3 p-4">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-relaxed">{qa.question}</p>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                </motion.div>
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-14">
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/50">
                        <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">
                          Model Answer
                        </p>
                        <p className="text-sm leading-relaxed text-foreground">{qa.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Fallback Content Generator ──────────────────────────────────────────────
// Generates topic-aware fallback content when the AI API is unavailable

function generateFallbackContent(mode: AIMode, input: string): string {
  const topic = input.trim();

  // Topic-aware fallback generation - generates content that matches what the user asked about
  switch (mode) {
    case 'flashcard':
      return `What is ${topic}?|||${topic} is a fundamental concept in data analytics and technology.
What are the key components of ${topic}?|||The main components include core principles, practical applications, tools, and best practices relevant to ${topic}.
Why is ${topic} important?|||${topic} is essential because it helps professionals make data-driven decisions, improves efficiency, and is widely used across industries.
What tools are used for ${topic}?|||Common tools include Excel, SQL, Python, Power BI, and specialized platforms depending on the specific area of ${topic}.
How can you practice ${topic}?|||Practice through hands-on projects, online tutorials, coding exercises, real-world datasets, and building a portfolio of work.`;

    case 'quiz':
      return `Q: What is the primary purpose of ${topic}?
A: To analyze data and extract meaningful insights for decision-making
B: To create visual presentations
C: To manage project timelines
D: To write documentation
ANSWER: A

Q: Which of the following is a key benefit of ${topic}?
A: Increased manual data entry
B: Improved decision-making through data insights
C: Reduced need for technology
D: Elimination of all business problems
ANSWER: B

Q: What skill is most important when working with ${topic}?
A: Graphic design
B: Public speaking
C: Analytical thinking and problem-solving
D: Event planning
ANSWER: C

Q: How is ${topic} typically applied in business?
A: Only for marketing campaigns
B: Across departments for data-driven strategies
C: Exclusively in the IT department
D: Only during annual planning
ANSWER: B

Q: What is a common challenge when learning ${topic}?
A: Having too few learning resources available
B: Understanding complex concepts and applying them to real-world scenarios
C: The subject being too simple
D: No career opportunities in the field
ANSWER: B`;

    case 'summarizer':
      return `Here is a 3-point summary of the provided text:

1. The text covers important concepts related to ${topic}, highlighting key principles and foundational knowledge that practitioners need to understand.

2. Practical applications are discussed, showing how the concepts can be applied in real-world scenarios using various tools and methodologies.

3. The content emphasizes the importance of continuous learning and hands-on practice to master the subject matter effectively.

Note: For a more detailed and personalized summary, please try again when the AI service is available.`;

    case 'code':
      return `Step-by-step code explanation:

1. **Setup and Imports**: The code begins by importing necessary libraries and setting up the initial configuration for the task.

2. **Data Processing**: The main logic processes the input data according to the specified requirements, applying transformations and computations.

3. **Core Logic**: The key algorithm or function implements the primary business logic, handling edge cases and validating inputs.

4. **Output Generation**: Finally, the results are formatted and returned or displayed in the appropriate format.

5. **Error Handling**: The code includes error handling to manage unexpected inputs and prevent crashes.

Tip: To get a more detailed explanation of specific code, please try again when the AI service is available.`;

    case 'planner':
      return `Monday: Introduction to ${topic} fundamentals — read overview material and watch a tutorial video (1-2 hours)
Tuesday: Core concepts deep dive — practice with hands-on exercises and take notes (1.5-2 hours)
Wednesday: Practical application — work on a mini-project or case study using real data (2 hours)
Thursday: Advanced topics — explore more complex scenarios and tools related to ${topic} (1.5-2 hours)
Friday: Review and practice — revisit challenging concepts, complete practice problems (1-2 hours)
Saturday: Build a project — apply everything learned in a personal portfolio project (2-3 hours)
Sunday: Rest and reflect — review the week's progress, plan next week, light reading (30 min - 1 hour)
TIPS: 1) Practice with real datasets daily 2) Join online communities for ${topic} to learn from others 3) Build projects for your portfolio`;

    case 'interview':
      return `Q: Can you explain your experience with ${topic} and how you've applied it in your work?
A: Start by describing specific projects where you used ${topic}. Mention the tools and technologies involved, the challenges you faced, and the measurable outcomes. For example, "In my previous role, I used ${topic} to analyze customer data, which led to a 15% improvement in retention rates."

Q: What is the most challenging aspect of ${topic} you've encountered, and how did you overcome it?
A: Describe a specific technical challenge — perhaps dealing with messy data, optimizing slow queries, or communicating complex results to non-technical stakeholders. Explain your problem-solving approach step by step and what you learned from the experience.

Q: How do you stay updated with the latest trends and developments in ${topic}?
A: Mention specific resources: industry blogs, online courses, conferences, GitHub repositories, podcasts, and professional communities. Show that you actively learn and apply new techniques.

Q: Can you describe a project where ${topic} had a significant business impact?
A: Use the STAR method (Situation, Task, Action, Result). Describe the business problem, your specific role, the analytical approach you took, and quantify the results with metrics.

Q: How would you explain a complex ${topic} concept to a non-technical stakeholder?
A: Describe your approach to simplifying complex ideas — using analogies, visualizations, storytelling, and focusing on business impact rather than technical details. Give a concrete example of doing this successfully.`;

    default:
      return `Here is some helpful information about ${topic}:

${topic} is an important subject in data analytics and technology. It involves understanding core concepts, applying analytical techniques, and using various tools to extract insights from data.

Key areas to focus on:
- Understanding fundamental principles and theory
- Learning relevant tools and technologies (Excel, SQL, Python, Power BI)
- Practicing with real-world datasets and projects
- Building a portfolio of work to showcase your skills

For more detailed and personalized answers, please try again when the AI service is available.`;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AIAssistantView() {
  const [activeMode, setActiveMode] = useState<AIMode>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [modeResults, setModeResults] = useState<{
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
    summary: string;
    code: string;
    explanation: string;
    plan: { schedule: { day: string; goal: string }[]; tips: string[] };
    interview: { question: string; answer: string }[];
    originalText: string;
  }>({
    flashcards: [],
    quiz: [],
    summary: '',
    code: '',
    explanation: '',
    plan: { schedule: [], tips: [] },
    interview: [],
    originalText: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const store = useProgressStore();

  const currentConfig = useMemo(
    () => modeConfigs.find((m) => m.id === activeMode) || modeConfigs[0],
    [activeMode]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const callAI = useCallback(async (prompt: string): Promise<string> => {
    // Retries with 10s timeouts — fast fallback if API is slow
    const attempts = [
      { timeout: 10000, delay: 0 },
      { timeout: 10000, delay: 500 },
    ];

    let lastError: Error | null = null;

    for (const attempt of attempts) {
      if (attempt.delay > 0) {
        await new Promise(r => setTimeout(r, attempt.delay));
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), attempt.timeout);
      try {
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        if (data.reply) return data.reply;
        lastError = new Error('AI returned no response');
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`AI callAI attempt ${attempts.indexOf(attempt) + 1} failed:`, lastError.message);
      }
    }

    if (lastError instanceof DOMException && lastError.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw lastError || new Error('AI service unavailable');
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const trimmedText = text.trim();
      setInput('');
      setIsLoading(true);
      setShowQuickQuestions(false);

      if (activeMode === 'chat') {
        const userMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: trimmedText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        try {
          const prompt = currentConfig.promptBuilder(trimmedText);
          const reply = await callAI(prompt);
          const assistantMessage: Message = {
            id: `msg-${Date.now()}-reply`,
            role: 'assistant',
            content: reply,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
          // Try fallback content as last resort
          const fallbackReply = generateFallbackContent('chat', trimmedText);
          const errorMessage: Message = {
            id: `msg-${Date.now()}-error`,
            role: 'assistant',
            content: `⚠️ _AI service is temporarily busy. Here's a helpful response while we reconnect:_\n\n${fallbackReply}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          toast.warning('AI is busy — showing helpful content. Try again for a personalized response!');
        }
      } else {
        try {
          const prompt = currentConfig.promptBuilder(trimmedText);
          const reply = await callAI(prompt);

          switch (activeMode) {
            case 'flashcard': {
              const cards = parseFlashcards(reply);
              if (cards.length === 0) {
                toast.error('Could not parse flashcards. Try again!');
              }
              setModeResults((prev) => ({ ...prev, flashcards: cards }));
              break;
            }
            case 'quiz': {
              const questions = parseQuizQuestions(reply);
              if (questions.length === 0) {
                toast.error('Could not parse quiz. Try again!');
              }
              setModeResults((prev) => ({ ...prev, quiz: questions }));
              break;
            }
            case 'summarizer': {
              setModeResults((prev) => ({
                ...prev,
                summary: reply,
                originalText: trimmedText,
              }));
              break;
            }
            case 'code': {
              setModeResults((prev) => ({
                ...prev,
                explanation: reply,
                code: trimmedText,
              }));
              break;
            }
            case 'planner': {
              const parsed = parseStudyPlan(reply);
              setModeResults((prev) => ({
                ...prev,
                plan: parsed,
              }));
              break;
            }
            case 'interview': {
              const qa = parseInterviewQA(reply);
              if (qa.length === 0) {
                toast.error('Could not parse interview questions. Try again!');
              }
              setModeResults((prev) => ({ ...prev, interview: qa }));
              break;
            }
          }
        } catch (err) {
          // Use intelligent fallback content based on mode and topic
          const fallbackReply = generateFallbackContent(activeMode, trimmedText);

          switch (activeMode) {
            case 'flashcard': {
              const cards = parseFlashcards(fallbackReply);
              setModeResults((prev) => ({ ...prev, flashcards: cards.length > 0 ? cards : parseFlashcards(generateFallbackContent('flashcard', trimmedText)) }));
              break;
            }
            case 'quiz': {
              const questions = parseQuizQuestions(fallbackReply);
              setModeResults((prev) => ({ ...prev, quiz: questions.length > 0 ? questions : parseQuizQuestions(generateFallbackContent('quiz', trimmedText)) }));
              break;
            }
            case 'summarizer': {
              setModeResults((prev) => ({
                ...prev,
                summary: fallbackReply,
                originalText: trimmedText,
              }));
              break;
            }
            case 'code': {
              setModeResults((prev) => ({
                ...prev,
                explanation: fallbackReply,
                code: trimmedText,
              }));
              break;
            }
            case 'planner': {
              const parsed = parseStudyPlan(fallbackReply);
              setModeResults((prev) => ({
                ...prev,
                plan: parsed.schedule.length > 0 ? parsed : parseStudyPlan(generateFallbackContent('planner', trimmedText)),
              }));
              break;
            }
            case 'interview': {
              const qa = parseInterviewQA(fallbackReply);
              setModeResults((prev) => ({ ...prev, interview: qa.length > 0 ? qa : parseInterviewQA(generateFallbackContent('interview', trimmedText)) }));
              break;
            }
          }
          toast.warning('AI is busy — showing helpful content. Try again for personalized results!');
        }
      }

      setIsLoading(false);
    },
    [isLoading, activeMode, currentConfig, callAI]
  );

  const handleQuickAction = useCallback(
    (action: string) => {
      setInput(action);
      sendMessage(action);
    },
    [sendMessage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleModeChange = (mode: AIMode) => {
    setActiveMode(mode);
    setMessages([]);
    setShowQuickQuestions(true);
  };

  const clearResults = () => {
    if (activeMode === 'chat') {
      setMessages([]);
      setShowQuickQuestions(true);
    } else {
      setModeResults({
        flashcards: [],
        quiz: [],
        summary: '',
        code: '',
        explanation: '',
        plan: { schedule: [], tips: [] },
        interview: [],
        originalText: '',
      });
    }
  };

  const hasResults =
    activeMode === 'chat'
      ? messages.length > 0
      : activeMode === 'flashcard'
        ? modeResults.flashcards.length > 0
        : activeMode === 'quiz'
          ? modeResults.quiz.length > 0
          : activeMode === 'summarizer'
            ? !!modeResults.summary
            : activeMode === 'code'
              ? !!modeResults.explanation
              : activeMode === 'planner'
                ? modeResults.plan.schedule.length > 0
                : modeResults.interview.length > 0;

  return (
    <div className="h-full flex">
      {/* Mode Sidebar */}
      <ModeSidebar
        activeMode={activeMode}
        setActiveMode={handleModeChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm',
                  currentConfig.color
                )}
              >
                {currentConfig.icon}
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight">{currentConfig.label}</h2>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  {currentConfig.description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasResults && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearResults}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
            <Badge variant="outline" className="text-[11px] gap-1 hidden sm:flex">
              <Bot className="w-3 h-3" />
              AI Powered
            </Badge>
          </div>
        </div>

        {/* Quick Actions Bar */}
        {(activeMode === 'chat' ||
          activeMode === 'flashcard' ||
          activeMode === 'quiz' ||
          activeMode === 'planner' ||
          activeMode === 'interview') &&
          !isLoading &&
          !hasResults && (
            <div className="px-4 pt-3 shrink-0">
              <QuickActionsBar mode={activeMode} onAction={handleQuickAction} />
            </div>
          )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {activeMode === 'chat' && (
            <ChatModeView
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
              sendMessage={sendMessage}
              showQuickQuestions={showQuickQuestions}
              setShowQuickQuestions={setShowQuickQuestions}
            />
          )}
          {activeMode === 'flashcard' && (
            <FlashcardModeView key={`fc-${modeResults.flashcards.length}`} cards={modeResults.flashcards} isLoading={isLoading} />
          )}
          {activeMode === 'quiz' && (
            <QuizModeView key={`quiz-${modeResults.quiz.length}`} questions={modeResults.quiz} isLoading={isLoading} />
          )}
          {activeMode === 'summarizer' && (
            <SummarizerModeView
              summary={modeResults.summary}
              isLoading={isLoading}
              originalText={modeResults.originalText}
            />
          )}
          {activeMode === 'code' && (
            <CodeExplainerModeView
              code={modeResults.code}
              explanation={modeResults.explanation}
              isLoading={isLoading}
            />
          )}
          {activeMode === 'planner' && (
            <StudyPlannerModeView plan={modeResults.plan} isLoading={isLoading} />
          )}
          {activeMode === 'interview' && (
            <InterviewPrepModeView key={`int-${modeResults.interview.length}`} qaList={modeResults.interview} isLoading={isLoading} />
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-3 shrink-0 bg-background">
          {currentConfig.inputType === 'textarea' ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <Label htmlFor="mode-input" className="text-xs text-muted-foreground mb-1 block">
                  {currentConfig.inputLabel}
                </Label>
                <Textarea
                  id="mode-input"
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentConfig.placeholder}
                  rows={4}
                  className={cn(
                    'w-full resize-none rounded-xl border bg-background px-4 py-2.5 text-sm',
                    'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                    'max-h-40 min-h-[100px] overflow-y-auto'
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    'rounded-xl text-white shadow-sm',
                    `bg-gradient-to-r ${currentConfig.color} hover:opacity-90`
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-1.5" />
                  )}
                  {isLoading ? 'Processing...' : `Generate ${currentConfig.label}`}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        sendMessage(input);
                      }
                    }}
                    placeholder={currentConfig.placeholder}
                    disabled={isLoading}
                    className={cn(
                      'w-full rounded-xl border bg-background px-4 py-2.5 text-sm h-11',
                      'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                      'pr-12'
                    )}
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className={cn(
                  'h-11 w-11 rounded-xl text-white shrink-0 shadow-sm',
                  `bg-gradient-to-br ${currentConfig.color} hover:opacity-90`
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
