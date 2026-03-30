'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Clock, Star, Zap, Target, Play, RotateCcw,
  CheckCircle2, XCircle, ArrowRight, ChevronRight,
  Flame, Medal, Award, BarChart3, Brain, Code2, BookOpen, TrendingUp, Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  timeLimit: number;
  maxScore: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'SQL Basics',
    description: 'Write a basic SELECT query to retrieve data',
    difficulty: 'Easy',
    topic: 'SQL',
    timeLimit: 60,
    maxScore: 100,
    question: 'Which SQL clause is used to filter results based on a condition?',
    options: ['ORDER BY', 'WHERE', 'GROUP BY', 'HAVING'],
    correctAnswer: 1,
    explanation: 'The WHERE clause is used to filter records based on a specified condition.',
  },
  {
    id: 2,
    title: 'Excel VLOOKUP',
    description: 'Understand how VLOOKUP works in Excel',
    difficulty: 'Easy',
    topic: 'Excel',
    timeLimit: 45,
    maxScore: 100,
    question: 'In VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup]), what does col_index_num specify?',
    options: ['The row number to return', 'The column number to return', 'The total columns', 'The range lookup method'],
    correctAnswer: 1,
    explanation: 'col_index_num specifies the column number in the table from which to retrieve the value.',
  },
  {
    id: 3,
    title: 'Python Lists',
    description: 'Test your Python list comprehension knowledge',
    difficulty: 'Medium',
    topic: 'Python',
    timeLimit: 60,
    maxScore: 100,
    question: 'What does [x**2 for x in range(5)] produce in Python?',
    options: ['[0, 1, 4, 9, 16]', '[1, 4, 9, 16, 25]', '[0, 1, 2, 3, 4]', '[2, 4, 6, 8, 10]'],
    correctAnswer: 0,
    explanation: 'range(5) generates 0-4, and x**2 squares each value: [0, 1, 4, 9, 16].',
  },
  {
    id: 4,
    title: 'Data Visualization',
    description: 'Choose the right chart for your data',
    difficulty: 'Easy',
    topic: 'Data Viz',
    timeLimit: 45,
    maxScore: 100,
    question: 'Which chart type is best for showing parts of a whole?',
    options: ['Line chart', 'Pie chart', 'Scatter plot', 'Bar chart'],
    correctAnswer: 1,
    explanation: 'Pie charts are ideal for showing proportional relationships and parts of a whole.',
  },
  {
    id: 5,
    title: 'SQL Joins',
    description: 'Understand different types of SQL joins',
    difficulty: 'Medium',
    topic: 'SQL',
    timeLimit: 60,
    maxScore: 100,
    question: 'Which JOIN returns all records from both tables, matching where possible?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
    correctAnswer: 3,
    explanation: 'FULL OUTER JOIN returns all records from both tables, with NULLs where there is no match.',
  },
  {
    id: 6,
    title: 'Pandas DataFrame',
    description: 'Test your Pandas DataFrame manipulation skills',
    difficulty: 'Medium',
    topic: 'Python',
    timeLimit: 60,
    maxScore: 100,
    question: 'Which Pandas method is used to remove rows with missing values?',
    options: ['dropna()', 'fillna()', 'isna()', 'notna()'],
    correctAnswer: 0,
    explanation: 'dropna() removes rows (or columns) containing missing values from a DataFrame.',
  },
  {
    id: 7,
    title: 'Statistical Analysis',
    description: 'Understanding key statistical concepts',
    difficulty: 'Hard',
    topic: 'Statistics',
    timeLimit: 90,
    maxScore: 100,
    question: 'If the standard deviation of a dataset is 0, what does this indicate?',
    options: ['The data is normally distributed', 'All values are identical', 'The mean is 0', 'The dataset is empty'],
    correctAnswer: 1,
    explanation: 'A standard deviation of 0 means there is no variation - all values in the dataset are exactly the same.',
  },
  {
    id: 8,
    title: 'Power BI DAX',
    description: 'Test your DAX formula knowledge',
    difficulty: 'Hard',
    topic: 'BI Tools',
    timeLimit: 90,
    maxScore: 100,
    question: 'Which DAX function calculates a running total?',
    options: ['SUM()', 'CALCULATE()', 'TOTALYTD()', 'TOTAL()'],
    correctAnswer: 1,
    explanation: 'CALCULATE() with appropriate filters is commonly used to calculate running totals in DAX.',
  },
  {
    id: 9,
    title: 'Data Cleaning',
    description: 'Best practices for handling messy data',
    difficulty: 'Medium',
    topic: 'Data Prep',
    timeLimit: 60,
    maxScore: 100,
    question: 'What is the best approach when dealing with outliers in your dataset?',
    options: ['Always remove them', 'Always keep them', 'Investigate and handle case by case', 'Replace with the mean'],
    correctAnswer: 2,
    explanation: 'Outliers should be investigated first - they may be errors or valid data points. Handle each case individually.',
  },
  {
    id: 10,
    title: 'A/B Testing',
    description: 'Understand the fundamentals of A/B testing',
    difficulty: 'Hard',
    topic: 'Analytics',
    timeLimit: 90,
    maxScore: 100,
    question: 'What is the minimum typically recommended sample size per variant for reliable A/B test results?',
    options: ['10 users', '100 users', '1,000+ users', '10,000+ users'],
    correctAnswer: 2,
    explanation: 'While the exact number depends on effect size and statistical power, 1,000+ users per variant is a common minimum for reliable results.',
  },
];

const DIFFICULTY_COLORS = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const TOPIC_ICONS: Record<string, React.ElementType> = {
  SQL: Code2,
  Excel: BarChart3,
  Python: Brain,
  'Data Viz': TrendingUp,
  Statistics: BarChart3,
  'BI Tools': Lightbulb,
  'Data Prep': BookOpen,
  Analytics: Target,
};

type GameState = 'idle' | 'playing' | 'review' | 'results';

export default function ChallengesView() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Array<{ challengeId: number; selected: number; correct: number; timeBonus: number }>>([]);
  const [totalTimeBonus, setTotalTimeBonus] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentChallenge = CHALLENGES[currentIndex];
  const progress = ((currentIndex) / CHALLENGES.length) * 100;

  const startChallenge = useCallback(() => {
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setTotalTimeBonus(0);
    setTimeLeft(CHALLENGES[0].timeLimit);
  }, []);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer(answerIndex);

    const challenge = CHALLENGES[currentIndex];
    const isCorrect = answerIndex === challenge.correctAnswer;
    const timeUsed = challenge.timeLimit - timeLeft;
    const timeBonus = isCorrect ? Math.max(0, Math.round((1 - timeUsed / challenge.timeLimit) * 25)) : 0;

    const baseScore = isCorrect ? challenge.maxScore : 0;
    const questionScore = baseScore + timeBonus;

    setScore(prev => prev + questionScore);
    setTotalTimeBonus(prev => prev + timeBonus);
    setAnswers(prev => [...prev, {
      challengeId: challenge.id,
      selected: answerIndex,
      correct: challenge.correctAnswer,
      timeBonus,
    }]);

    // Show review after short delay
    setTimeout(() => {
      setGameState('review');
    }, 300);
  }, [selectedAnswer, currentIndex, timeLeft]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - auto submit with no answer
            handleAnswer(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, handleAnswer]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= CHALLENGES.length) {
      setGameState('results');
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setTimeLeft(CHALLENGES[currentIndex + 1].timeLimit);
    setGameState('playing');
  }, [currentIndex]);

  const resetGame = () => {
    setGameState('idle');
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setTotalTimeBonus(0);
  };

  const correctCount = answers.filter(a => a.selected === a.correct).length;
  const maxPossibleScore = CHALLENGES.reduce((sum, c) => sum + c.maxScore, 0);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Challenge Arena</h1>
          <p className="text-sm text-muted-foreground">Test your data skills with timed challenges</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Idle State - Challenge List */}
        {gameState === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Start Card */}
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
              <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                      <Flame className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">Ready to Compete?</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {CHALLENGES.length} challenges across SQL, Excel, Python, Data Viz, and more. Answer quickly for time bonuses!
                      </p>
                    </div>
                    <Button size="lg" onClick={startChallenge} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 shrink-0">
                      <Play className="w-5 h-5 mr-2" />
                      Start Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Challenge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CHALLENGES.map((challenge, i) => {
                const TopicIcon = TOPIC_ICONS[challenge.topic] || Code2;
                return (
                  <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-border/50 bg-card/50 hover:border-orange-200 dark:hover:border-orange-800 transition-colors h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shrink-0">
                            <TopicIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm">{challenge.title}</h3>
                              <Badge className={cn('text-[10px]', DIFFICULTY_COLORS[challenge.difficulty])}>
                                {challenge.difficulty}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{challenge.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{challenge.timeLimit}s</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{challenge.maxScore} pts</span>
                              <Badge variant="outline" className="text-[10px] px-1.5">{challenge.topic}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && currentChallenge && (
          <motion.div key={`playing-${currentIndex}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            {/* Timer & Progress */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Question {currentIndex + 1}/{CHALLENGES.length}</Badge>
                    <Badge className={cn('text-[10px]', DIFFICULTY_COLORS[currentChallenge.difficulty])}>
                      {currentChallenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{currentChallenge.topic}</Badge>
                  </div>
                  <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold',
                    timeLeft <= 10 ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                  )}>
                    <Clock className="w-4 h-4" />
                    {timeLeft}s
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Question Card */}
            <Card className="border-orange-200 dark:border-orange-800 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">{currentChallenge.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentChallenge.options.map((option, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                      selectedAnswer === null && 'hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/10 cursor-pointer',
                      selectedAnswer === i && 'border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-950/20',
                      selectedAnswer !== null && selectedAnswer !== i && 'opacity-60',
                    )}
                  >
                    <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm">{option}</span>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Review State */}
        {gameState === 'review' && currentChallenge && (
          <motion.div key={`review-${currentIndex}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <Card className={cn('border-2', answers[answers.length - 1]?.selected === currentChallenge.correctAnswer ? 'border-emerald-300 dark:border-emerald-700' : 'border-rose-300 dark:border-rose-700')}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {answers[answers.length - 1]?.selected === currentChallenge.correctAnswer ? (
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">
                      {answers[answers.length - 1]?.selected === currentChallenge.correctAnswer ? 'Correct!' : 'Incorrect'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {answers[answers.length - 1]?.selected === currentChallenge.correctAnswer && answers[answers.length - 1] ? `+${currentChallenge.maxScore + answers[answers.length - 1].timeBonus} points (+${answers[answers.length - 1].timeBonus} time bonus)` : `The correct answer was: ${currentChallenge.options[currentChallenge.correctAnswer]}`}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 space-y-1">
                  <p className="text-sm font-medium">Explanation:</p>
                  <p className="text-sm text-muted-foreground">{currentChallenge.explanation}</p>
                </div>
                <Button onClick={nextQuestion} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                  {currentIndex + 1 >= CHALLENGES.length ? (
                    <><Award className="w-4 h-4 mr-2" />View Results</>
                  ) : (
                    <><ArrowRight className="w-4 h-4 mr-2" />Next Challenge</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results State */}
        {gameState === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/10 dark:to-amber-950/10 overflow-hidden">
              <CardContent className="p-8 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/30"
                >
                  <Trophy className="w-12 h-12 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold">Challenge Complete!</h2>
                  <p className="text-muted-foreground mt-1">Here&apos;s how you performed</p>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="p-4 rounded-xl bg-white dark:bg-card border border-border/50">
                    <p className="text-2xl font-bold text-orange-600">{score}</p>
                    <p className="text-xs text-muted-foreground">Total Score</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-card border border-border/50">
                    <p className="text-2xl font-bold text-emerald-600">{correctCount}/{CHALLENGES.length}</p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-card border border-border/50">
                    <p className="text-2xl font-bold text-teal-600">+{totalTimeBonus}</p>
                    <p className="text-xs text-muted-foreground">Time Bonus</p>
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="max-w-sm mx-auto space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>{maxPossibleScore + CHALLENGES.length * 25} (max with bonuses)</span>
                  </div>
                  <Progress value={(score / (maxPossibleScore + CHALLENGES.length * 25)) * 100} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {score >= 900 ? 'Outstanding! You\'re a data champion!' : score >= 700 ? 'Great job! Solid performance!' : score >= 500 ? 'Good effort! Keep practicing!' : 'Keep learning, you\'ll improve!'}
                  </p>
                </div>

                {/* Summary */}
                <div className="max-w-md mx-auto space-y-2 text-left">
                  <h4 className="font-semibold text-sm">Answer Summary</h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {CHALLENGES.map((challenge, i) => {
                      const answer = answers[i];
                      const isCorrect = answer?.selected === challenge.correctAnswer;
                      return (
                        <div key={challenge.id} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-card border border-border/30 text-xs">
                          {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                          <span className="flex-1 truncate">{challenge.title}</span>
                          <Badge className={cn('text-[10px]', DIFFICULTY_COLORS[challenge.difficulty])}>{challenge.difficulty}</Badge>
                          {isCorrect && answer && <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{challenge.maxScore + answer.timeBonus}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={resetGame}>
                    <RotateCcw className="w-4 h-4 mr-2" />Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
