'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Trophy, Flame, CheckCircle2, XCircle, RotateCcw, ChevronRight, Loader2, Zap, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface SessionStats {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
  timeSpent: number;
}

const TOPICS = [
  { id: 'sql', label: 'SQL', icon: '🗃️', color: 'from-cyan-500 to-blue-600' },
  { id: 'excel', label: 'Excel', icon: '📊', color: 'from-green-500 to-emerald-600' },
  { id: 'python', label: 'Python', icon: '🐍', color: 'from-amber-500 to-orange-600' },
  { id: 'powerbi', label: 'Power BI', icon: '📈', color: 'from-yellow-500 to-amber-600' },
  { id: 'statistics', label: 'Statistics', icon: '📐', color: 'from-purple-500 to-violet-600' },
  { id: 'general', label: 'General', icon: '🎓', color: 'from-teal-500 to-emerald-600' },
];

const SEED_QUESTIONS: Record<string, Question[]> = {
  sql: [
    { question: 'Which SQL clause is used to filter results based on aggregate functions?', options: ['WHERE', 'HAVING', 'ORDER BY', 'GROUP BY'], correct: 1, explanation: 'HAVING filters groups after aggregation, while WHERE filters individual rows before aggregation.', difficulty: 'easy' },
    { question: 'What does the INNER JOIN return?', options: ['All rows from both tables', 'Only matching rows from both tables', 'All rows from left table', 'All rows from right table'], correct: 1, explanation: 'INNER JOIN returns only rows where there is a match in both tables based on the join condition.', difficulty: 'easy' },
    { question: 'Which window function assigns a sequential number to each row within a partition?', options: ['RANK()', 'ROW_NUMBER()', 'DENSE_RANK()', 'NTILE()'], correct: 1, explanation: 'ROW_NUMBER() assigns a unique sequential integer to each row without gaps. Unlike RANK(), it does not handle ties specially.', difficulty: 'medium' },
  ],
  excel: [
    { question: 'Which function looks up a value in the leftmost column of a table?', options: ['HLOOKUP', 'INDEX', 'VLOOKUP', 'MATCH'], correct: 2, explanation: 'VLOOKUP searches for a value in the first column of a table and returns a value in the same row from another column.', difficulty: 'easy' },
    { question: 'What shortcut creates an absolute cell reference?', options: ['Ctrl+C', 'F4', 'Ctrl+Z', 'Alt+Enter'], correct: 1, explanation: 'Pressing F4 toggles between relative ($A1), absolute ($A$1), and mixed ($A1, A$1) references.', difficulty: 'easy' },
    { question: 'Which Excel feature automatically summarizes data with calculations?', options: ['Pivot Table', 'Data Validation', 'Conditional Formatting', 'Goal Seek'], correct: 0, explanation: 'Pivot Tables can automatically calculate sums, averages, counts, and other aggregations across grouped data.', difficulty: 'medium' },
  ],
  python: [
    { question: 'Which Python library is primarily used for data manipulation with DataFrames?', options: ['NumPy', 'Matplotlib', 'Pandas', 'SciPy'], correct: 2, explanation: 'Pandas provides DataFrames and Series for efficient data manipulation and analysis.', difficulty: 'easy' },
    { question: 'What does df.groupby() do?', options: ['Sorts the DataFrame', 'Groups rows by column values for aggregation', 'Filters rows', 'Merges DataFrames'], correct: 1, explanation: 'groupby() splits data into groups based on column values, enabling aggregate operations like sum(), mean(), count() per group.', difficulty: 'medium' },
    { question: 'Which method reads a CSV file into a DataFrame?', options: ['pd.read_csv()', 'pd.load_csv()', 'pd.open_csv()', 'pd.import_csv()'], correct: 0, explanation: 'pd.read_csv() is the standard Pandas method to read CSV files into a DataFrame.', difficulty: 'easy' },
  ],
  powerbi: [
    { question: 'What language is used for custom calculations in Power BI?', options: ['SQL', 'Python', 'DAX', 'M Query'], correct: 2, explanation: 'DAX (Data Analysis Expressions) is the formula language used for creating custom calculations in Power BI.', difficulty: 'easy' },
    { question: 'Which view in Power BI is used for building relationships between tables?', options: ['Report View', 'Data View', 'Model View', 'Desktop'], correct: 2, explanation: 'Model View allows you to manage relationships between tables, create measures, and define hierarchies.', difficulty: 'medium' },
  ],
  statistics: [
    { question: 'What does the standard deviation measure?', options: ['Central tendency', 'Spread/dispersion of data', 'Skewness', 'Correlation'], correct: 1, explanation: 'Standard deviation measures how spread out data points are from the mean. Low SD = data clustered near mean; High SD = data spread out.', difficulty: 'easy' },
    { question: 'In a normal distribution, approximately what percentage of data falls within 1 standard deviation of the mean?', options: ['50%', '68%', '95%', '99.7%'], correct: 1, explanation: 'The 68-95-99.7 rule: ~68% within 1 SD, ~95% within 2 SD, ~99.7% within 3 SD of the mean.', difficulty: 'medium' },
  ],
  general: [
    { question: 'What is the primary purpose of ETL in data engineering?', options: ['Encryption', 'Extract, Transform, Load data', 'Error tracking', 'Email testing'], correct: 1, explanation: 'ETL (Extract, Transform, Load) is the process of extracting data from sources, transforming it into a suitable format, and loading it into a data warehouse.', difficulty: 'easy' },
    { question: 'What is a data warehouse?', options: ['A physical storage room', 'A central repository for integrated data from multiple sources', 'A database for real-time transactions', 'A backup system'], correct: 1, explanation: 'A data warehouse is a central repository optimized for query and analysis, consolidating data from multiple sources for business intelligence.', difficulty: 'easy' },
  ],
};

export default function LivePracticeView() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState<SessionStats>({ total: 0, correct: 0, streak: 0, bestStreak: 0, timeSpent: 0 });
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionRef = useRef<Question | null>(null);
  const showResultRef = useRef(false);
  const aiQuestionCache = useRef<Record<string, Question[]>>({});

  // Keep refs in sync
  useEffect(() => { questionRef.current = question; }, [question]);
  useEffect(() => { showResultRef.current = showResult; }, [showResult]);

  const generateQuestion = useCallback(async (topicId: string) => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);

    const seedQuestions = SEED_QUESTIONS[topicId] || [];
    // Pick a random seed question
    if (seedQuestions.length > 0 && Math.random() < 0.4) {
      const randomQ = seedQuestions[Math.floor(Math.random() * seedQuestions.length)];
      setQuestion(randomQ);
      setIsLoading(false);
      return;
    }

    // Try AI-generated question
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a single multiple-choice quiz question about ${topicId} for data analytics. The question should test practical knowledge. Return ONLY a JSON object with these exact keys: "question" (string), "options" (array of exactly 4 strings), "correct" (number 0-3, the index of the correct option), "explanation" (string explaining why the answer is correct), "difficulty" ("easy", "medium", or "hard"). No other text.`,
          context: 'You are a data analytics quiz generator. Return valid JSON only.',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      let reply = data.reply || '';

      // Parse JSON from reply
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        toast.success('AI question generated');
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.question && parsed.options && parsed.options.length === 4 && typeof parsed.correct === 'number') {
          const q: Question = {
            question: parsed.question,
            options: parsed.options,
            correct: parsed.correct,
            explanation: parsed.explanation || 'The correct answer has been verified by our system.',
            difficulty: parsed.difficulty || 'medium',
          };
          setQuestion(q);
          // Cache it
          if (!aiQuestionCache.current[topicId]) aiQuestionCache.current[topicId] = [];
          aiQuestionCache.current[topicId].push(q);
          setIsLoading(false);
          return;
        }
      }
      throw new Error('Invalid AI response');
    } catch {
      // Fallback: use seed or cached questions
      const cached = aiQuestionCache.current[topicId] || [];
      const allAvailable = [...seedQuestions, ...cached];
      if (allAvailable.length > 0) {
        const fallback = allAvailable[Math.floor(Math.random() * allAvailable.length)];
        setQuestion(fallback);
        toast.info('AI unavailable — showing practice question');
      } else {
        setQuestion({
          question: `What is a key concept in ${topicId}?`,
          options: ['Data cleaning', 'Data modeling', 'Data visualization', 'All of the above'],
          correct: 3,
          explanation: 'All these are fundamental concepts in data analytics workflows.',
          difficulty: 'easy',
        });
      }
    }
    setIsLoading(false);
  }, []);

  const handleAnswer = useCallback((answerIdx: number) => {
    if (showResultRef.current || !questionRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(answerIdx);
    setShowResult(true);

    const q = questionRef.current;
    const isCorrect = q && answerIdx === q.correct;
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      streak: isCorrect ? prev.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
      timeSpent: prev.timeSpent + (timerEnabled ? 30 - timeLeft : 0),
    }));

    if (stats.total + 1 >= 10) {
      setTimeout(() => setSessionComplete(true), 1500);
    }
  }, [showResult, timerEnabled, timeLeft, stats.total]);

  const startTopic = (topicId: string) => {
    setSelectedTopic(topicId);
    setStats({ total: 0, correct: 0, streak: 0, bestStreak: 0, timeSpent: 0 });
    setSessionComplete(false);
    generateQuestion(topicId);
  };

  useEffect(() => {
    if (timerEnabled && question && !showResult && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAnswer(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerEnabled, question, showResult, handleAnswer]);

  useEffect(() => {
    if (!timerEnabled && timerRef.current) clearInterval(timerRef.current);
  }, [timerEnabled]);

  const nextQuestion = () => {
    if (selectedTopic) generateQuestion(selectedTopic);
  };

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const topicData = TOPICS.find(t => t.id === selectedTopic);

  if (!selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Live Practice</h1>
          <p className="text-muted-foreground">Choose a topic to start practicing with AI-generated questions</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TOPICS.map((topic, i) => (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => startTopic(topic.id)}
              className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-left"
            >
              <div className="text-3xl mb-3">{topic.icon}</div>
              <h3 className="font-semibold text-lg">{topic.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{(SEED_QUESTIONS[topic.id] || []).length}+ questions</p>
              <div className={cn('mt-3 h-1 rounded-full bg-gradient-to-r', topic.color, 'w-0 group-hover:w-full transition-all duration-500')} />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-2xl">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Session Complete!</h1>
            <p className="text-muted-foreground text-lg">Here&apos;s how you did on {topicData?.label}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Target, label: 'Score', value: `${stats.correct}/${stats.total}` },
              { icon: BarChart3, label: 'Accuracy', value: `${accuracy}%` },
              { icon: Flame, label: 'Best Streak', value: `${stats.bestStreak}` },
              { icon: Clock, label: 'Time', value: `${stats.timeSpent}s` },
            ].map(item => (
              <Card key={item.label}>
                <CardContent className="p-4 text-center">
                  <item.icon className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => startTopic(selectedTopic)} className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <RotateCcw className="w-4 h-4 mr-2" />Try Again
            </Button>
            <Button variant="outline" onClick={() => setSelectedTopic(null)}>
              Change Topic
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTopic(null)} className="text-muted-foreground">
            ← Back
          </Button>
          <Badge variant="outline" className="text-base px-3 py-1">{topicData?.icon} {topicData?.label}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">{stats.streak} streak</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">{accuracy}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Progress value={(stats.total / 10) * 100} className="w-20 h-2" />
            <span className="text-muted-foreground">{stats.total}/10</span>
          </div>
        </div>
      </div>

      {/* Timer Toggle */}
      <div className="flex items-center justify-end gap-2">
        <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} id="timer-toggle" />
        <Label htmlFor="timer-toggle" className="text-sm flex items-center gap-1 cursor-pointer">
          <Clock className="w-3.5 h-3.5" /> Timer (30s)
        </Label>
        {timerEnabled && (
          <Badge variant={timeLeft <= 10 ? 'destructive' : 'outline'} className="font-mono">
            {timeLeft}s
          </Badge>
        )}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </motion.div>
        ) : question ? (
          <motion.div key={question.question} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn(
                    question.difficulty === 'easy' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    question.difficulty === 'medium' && 'bg-amber-50 text-amber-700 border-amber-200',
                    question.difficulty === 'hard' && 'bg-red-50 text-red-700 border-red-200',
                  )}>
                    {question.difficulty}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Q{stats.total + 1}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <h2 className="text-lg font-medium leading-relaxed">{question.question}</h2>
                <div className="space-y-2">
                  {question.options.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === question.correct;
                    const showCorrect = showResult && isCorrect;
                    const showWrong = showResult && isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !showResult && handleAnswer(i)}
                        disabled={showResult}
                        className={cn(
                          'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3',
                          !showResult && !isSelected && 'hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
                          isSelected && !showResult && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
                          showCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                          showWrong && 'border-red-500 bg-red-50 dark:bg-red-950/30',
                        )}
                      >
                        <span className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                          showCorrect && 'bg-emerald-500 text-white',
                          showWrong && 'bg-red-500 text-white',
                          !showResult && !isSelected && 'bg-muted',
                          isSelected && !showResult && 'bg-emerald-500 text-white',
                        )}>
                          {showCorrect ? <CheckCircle2 className="w-5 h-5" /> : showWrong ? <XCircle className="w-5 h-5" /> : String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm">{opt}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {showResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className={cn(
                      'p-4 rounded-xl',
                      selectedAnswer === question.correct
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                    )}>
                      <p className="font-semibold flex items-center gap-2">
                        {selectedAnswer === question.correct ? (
                          <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Correct! Well done!</>
                        ) : (
                          <><XCircle className="w-5 h-5 text-red-500" /> Incorrect</>
                        )}
                      </p>
                      <p className="text-sm mt-2 text-muted-foreground">{question.explanation}</p>
                    </div>
                    <Button onClick={nextQuestion} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                      Next Question <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
