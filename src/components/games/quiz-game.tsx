'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RotateCcw, Trophy, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

interface Question {
  question: string;
  options: string[];
  correct: number;
  topic: string;
}

const questions: Question[] = [
  {
    question: 'Which type of analytics answers the question "What happened?"',
    options: ['Predictive', 'Descriptive', 'Prescriptive', 'Diagnostic'],
    correct: 1,
    topic: 'Data Analytics',
  },
  {
    question: 'Which SQL clause is used to filter rows?',
    options: ['GROUP BY', 'ORDER BY', 'WHERE', 'HAVING'],
    correct: 2,
    topic: 'SQL',
  },
  {
    question: 'What does VLOOKUP stand for?',
    options: ['Variable Lookup', 'Vertical Lookup', 'View Lookup', 'Value Lookup'],
    correct: 1,
    topic: 'Excel',
  },
  {
    question: 'Which Python library is best for data manipulation with DataFrames?',
    options: ['NumPy', 'Matplotlib', 'Pandas', 'Scikit-learn'],
    correct: 2,
    topic: 'Python',
  },
  {
    question: 'What is the shortcut for the SUM function in Excel?',
    options: ['Ctrl+S', 'Alt+=', 'Ctrl+Shift+S', 'F5'],
    correct: 1,
    topic: 'Excel',
  },
  {
    question: 'Which JOIN returns all rows from both tables?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
    correct: 3,
    topic: 'SQL',
  },
  {
    question: 'In Power BI, what language is used for calculated columns and measures?',
    options: ['M', 'SQL', 'DAX', 'Python'],
    correct: 2,
    topic: 'Power BI',
  },
  {
    question: 'What is the purpose of a primary key in a database?',
    options: [
      'Store passwords',
      'Uniquely identify each record',
      'Encrypt data',
      'Speed up queries',
    ],
    correct: 1,
    topic: 'SQL',
  },
  {
    question: 'Which schema has one fact table connected to multiple dimension tables?',
    options: ['Snowflake Schema', 'Star Schema', 'Galaxy Schema', 'Flat Schema'],
    correct: 1,
    topic: 'Data Warehousing',
  },
  {
    question: 'What does ETL stand for?',
    options: [
      'Extract, Transform, Load',
      'Evaluate, Test, Launch',
      'Enter, Track, Log',
      'Export, Transfer, Link',
    ],
    correct: 0,
    topic: 'Data Warehousing',
  },
  {
    question: 'Which function in SQL is used to count rows?',
    options: ['SUM()', 'COUNT()', 'TOTAL()', 'NUMBER()'],
    correct: 1,
    topic: 'SQL',
  },
  {
    question: 'What is Apache Spark primarily used for?',
    options: [
      'Database management',
      'Distributed data processing',
      'Web development',
      'Data visualization',
    ],
    correct: 1,
    topic: 'Spark',
  },
  {
    question: 'In Python, which library is used for statistical hypothesis testing?',
    options: ['Pandas', 'Scipy', 'Matplotlib', 'NumPy'],
    correct: 1,
    topic: 'Python',
  },
  {
    question: 'What does SCD stand for in data warehousing?',
    options: [
      'Structured Data Collection',
      'Slowly Changing Dimension',
      'System Configuration Data',
      'Standard Column Definition',
    ],
    correct: 1,
    topic: 'Data Warehousing',
  },
  {
    question: 'Which tool is used for version control?',
    options: ['Docker', 'Git', 'Jenkins', 'Airflow'],
    correct: 1,
    topic: 'Advanced Topics',
  },
];

export default function QuizGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const { quizHighScore, setQuizHighScore } = useProgressStore();

  const handleAnswer = useCallback(
    (answerIndex: number) => {
      if (selectedAnswer !== null) return;
      setSelectedAnswer(answerIndex);
      setShowResult(true);
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQuestion] = answerIndex;
        return next;
      });

      if (answerIndex === questions[currentQuestion].correct) {
        setScore((s) => s + 1);
      }
    },
    [currentQuestion, selectedAnswer]
  );

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      setQuizHighScore(score);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsComplete(false);
    setAnswers(new Array(questions.length).fill(null));
  };

  const question = questions[currentQuestion];
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            Quick Quiz
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {currentQuestion + 1} / {questions.length}
            </Badge>
            <Badge variant={score > 0 ? 'default' : 'secondary'} className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Score: {score}
            </Badge>
            {quizHighScore > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                Best: {quizHighScore}
              </Badge>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-1.5 mt-2">
          <motion.div
            className="bg-emerald-500 h-1.5 rounded-full"
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Badge variant="secondary" className="text-xs">{question.topic}</Badge>
              <h3 className="text-base font-semibold leading-relaxed">{question.question}</h3>

              <div className="space-y-2">
                {question.options.map((option, idx) => {
                  const isCorrect = idx === question.correct;
                  const isSelected = idx === selectedAnswer;
                  let classes = 'border-border hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20';

                  if (showResult) {
                    if (isCorrect) {
                      classes = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30';
                    } else if (isSelected && !isCorrect) {
                      classes = 'border-red-400 bg-red-50 dark:bg-red-900/20';
                    } else {
                      classes = 'border-border opacity-60';
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!showResult ? { scale: 1.01 } : {}}
                      whileTap={!showResult ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswer(idx)}
                      disabled={showResult}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3',
                        classes
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold',
                          showResult && isCorrect
                            ? 'bg-emerald-500 text-white'
                            : showResult && isSelected && !isCorrect
                              ? 'bg-red-400 text-white'
                              : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {showResult && isCorrect ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : showResult && isSelected && !isCorrect ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </div>
                      <span className="text-sm font-medium">{option}</span>
                    </motion.button>
                  );
                })}
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <Button onClick={nextQuestion} className="bg-emerald-600 hover:bg-emerald-700">
                    {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold">
                {percentage === 100
                  ? '🏆 Perfect Score!'
                  : percentage >= 70
                    ? '🎉 Great Job!'
                    : '💪 Keep Practicing!'}
              </h3>
              <p className="text-lg text-muted-foreground">
                You scored <span className="font-bold text-emerald-600 dark:text-emerald-400">{score}</span> out of{' '}
                {questions.length} ({percentage}%)
              </p>

              {/* Answer review */}
              <div className="max-h-64 overflow-y-auto space-y-2 mt-4 text-left">
                {questions.map((q, idx) => {
                  const userAnswer = answers[idx];
                  const isCorrect = userAnswer === q.correct;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg text-sm',
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                      )}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className="truncate">{q.question}</span>
                    </div>
                  );
                })}
              </div>

              <Button onClick={resetQuiz} className="bg-emerald-600 hover:bg-emerald-700">
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
