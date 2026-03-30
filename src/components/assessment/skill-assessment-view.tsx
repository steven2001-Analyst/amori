'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Brain, Target, Trophy, TrendingUp, BookOpen,
  CheckCircle, XCircle, Download, ChevronRight, Star,
  Clock, Award, RotateCcw, FileCheck, Eye, ArrowLeft,
  Timer, BarChart3,
} from 'lucide-react';
import { useProgressStore } from '@/lib/store';

// ── Types ────────────────────────────────────────────────────────────────────

type MainTab = 'assessment' | 'certification';
type Phase = 'assessment' | 'results' | 'roadmap';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface RoadmapWeek {
  week: number;
  focus: string;
  goals: string[];
  resources: string[];
}

interface CertQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface CertExam {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  gradient: string;
  questions: CertQuestion[];
  totalMinutes: number;
}

// ── Certification Exam Data ─────────────────────────────────────────────────

const CERT_EXAMS: CertExam[] = [
  {
    id: 'pl-300',
    title: 'PL-300: Microsoft Power BI',
    subtitle: '15 questions · Power BI, DAX, Power Query, Data Modeling',
    icon: '📊',
    color: 'text-yellow-600',
    gradient: 'from-yellow-500 to-amber-600',
    totalMinutes: 30,
    questions: [
      { question: 'Which Power BI tool is used to shape and transform raw data before loading it into the model?', options: ['Power Pivot', 'Power Query Editor', 'DAX Studio', 'Report Builder'], correct: 1, explanation: 'Power Query Editor (also known as Get Data) is the ETL tool in Power BI used to connect, transform, and load data.' },
      { question: 'What does DAX stand for?', options: ['Data Analysis Expressions', 'Data Aggregation and X-Ref', 'Dynamic Analytics XML', 'Data Architecture eXtensions'], correct: 0, explanation: 'DAX stands for Data Analysis Expressions, a formula language used in Power BI, SSAS, and Power Pivot.' },
      { question: 'Which DAX function returns the total sales from the beginning of time up to the current filter context?', options: ['TOTALYTD', 'CALCULATE', 'DATESYTD', 'SUM'], correct: 2, explanation: 'DATESYTD returns a set of dates from the beginning of the year up to the current filter context. Combined with CALCULATE, it computes YTD totals.' },
      { question: 'In Power BI data modeling, what is the recommended maximum number of direct relationships from a fact table?', options: ['1', '2', '3', 'Unlimited'], correct: 0, explanation: 'Best practice recommends a star schema where each fact table has direct relationships only to dimension tables, not to other fact tables.' },
      { question: 'Which visual in Power BI is best for showing the relationship between two numeric variables?', options: ['Pie chart', 'Scatter plot', 'Funnel chart', 'Tree map'], correct: 1, explanation: 'A scatter plot is ideal for showing correlation and relationships between two numeric measures.' },
      { question: 'What is the purpose of the CALCULATE function in DAX?', options: ['To create calculated tables', 'To modify filter context for an expression', 'To join two tables', 'To define a variable'], correct: 1, explanation: 'CALCULATE evaluates an expression in a modified filter context. It is one of the most powerful and commonly used DAX functions.' },
      { question: 'In Power BI Service, which workspace role can share dashboards with the entire organization?', options: ['Viewer', 'Contributor', 'Member', 'Admin'], correct: 2, explanation: 'Members and above can publish and share reports/dashboards with the broader organization in Power BI Service.' },
      { question: 'What does the "Selected" table function do in Power Query?', options: ['Creates a new column', 'Keeps only selected columns', 'Removes duplicates', 'Filters rows'], correct: 1, explanation: 'The "Selected" or "Choose Columns" step in Power Query keeps only the columns you select, removing all others from the table.' },
      { question: 'Which DAX function creates a dynamic table of unique values from a column?', options: ['DISTINCT', 'VALUES', 'UNIQUE', 'ALLNOBLANKROW'], correct: 1, explanation: 'VALUES returns a one-column table containing the distinct values from the specified column or table, including the blank row if it exists.' },
      { question: 'What is a "measure" in Power BI?', options: ['A static column in a table', 'A dynamic calculation evaluated at query time', 'A visual filter', 'A data source connection'], correct: 1, explanation: 'A measure is a DAX formula created for aggregating data dynamically based on filter context. It is evaluated at query time.' },
      { question: 'In data modeling, what is a "snowflake schema"?', options: ['A schema with only fact tables', 'A star schema with normalized dimensions', 'A flat table structure', 'A schema with no relationships'], correct: 1, explanation: 'A snowflake schema is an extension of the star schema where dimension tables are normalized into additional related tables.' },
      { question: 'Which Power Query transformation removes top N rows from a table?', options: ['Remove Top Rows', 'Keep Top Rows', 'Filter Rows', 'Skip Rows'], correct: 0, explanation: 'The "Remove Top Rows" transformation removes the specified number of rows from the top of the table.' },
      { question: 'What is incremental refresh in Power BI?', options: ['Refreshing only changed data', 'Refreshing all data every time', 'A DAX optimization technique', 'A visual animation effect'], correct: 0, explanation: 'Incremental refresh allows you to partition and refresh only the data that has changed rather than the entire dataset, saving time and resources.' },
      { question: 'Which DAX function counts the number of blank values in a column?', options: ['COUNTBLANK', 'ISBLANK', 'BLANKCOUNT', 'COUNTNULL'], correct: 0, explanation: 'COUNTBLANK counts the number of blank (empty) cells in a column.' },
      { question: 'What is row-level security (RLS) in Power BI?', options: ['Encrypting data at the row level', 'Restricting data access per user based on filters', 'Locking rows from being edited', 'A data validation rule'], correct: 1, explanation: 'RLS allows you to restrict data access for specific users. You define roles with DAX filters, and members see only the data permitted by their role.' },
    ],
  },
  {
    id: 'google-data-analytics',
    title: 'Google Data Analytics',
    subtitle: '15 questions · Data Analysis, SQL, Spreadsheets, R Basics',
    icon: '🔍',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-600',
    totalMinutes: 30,
    questions: [
      { question: 'What is the first step in the data analysis process?', options: ['Data visualization', 'Ask questions and define the problem', 'Build a dashboard', 'Clean the data'], correct: 1, explanation: 'The data analysis process begins with asking questions and defining the problem to understand what data you need and what you want to discover.' },
      { question: 'In spreadsheets, which function removes leading and trailing spaces from text?', options: ['TRIM', 'CLEAN', 'SUBSTITUTE', 'REPLACE'], correct: 0, explanation: 'The TRIM function removes extra spaces from text, leaving only single spaces between words and no leading/trailing spaces.' },
      { question: 'What SQL clause is used to filter rows based on aggregate values?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correct: 1, explanation: 'HAVING is used to filter results after GROUP BY aggregation, whereas WHERE filters rows before aggregation.' },
      { question: 'In R, which function is used to read a CSV file into a data frame?', options: ['read.csv()', 'import.csv()', 'load.csv()', 'open.csv()'], correct: 0, explanation: 'read.csv() is the base R function to read CSV files. readr::read_csv() is the tidyverse alternative.' },
      { question: 'What type of data visualization is best for showing the distribution of a single continuous variable?', options: ['Bar chart', 'Histogram', 'Pie chart', 'Line chart'], correct: 1, explanation: 'A histogram divides continuous data into bins and shows the frequency distribution, making it ideal for understanding data spread.' },
      { question: 'What is the difference between INNER JOIN and LEFT JOIN in SQL?', options: ['No difference', 'INNER JOIN returns only matching rows, LEFT JOIN returns all rows from the left table', 'LEFT JOIN is faster', 'INNER JOIN returns duplicates'], correct: 1, explanation: 'INNER JOIN returns only rows that match in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right (NULL for non-matches).' },
      { question: 'In the data analysis framework, what does "Data" refer to?', options: ['The final report', 'The raw and processed information collected', 'The tools used', 'The team members'], correct: 1, explanation: 'In the analysis framework, "Data" refers to the information collected — both raw and processed — that will be analyzed to answer questions.' },
      { question: 'Which R package is part of the tidyverse for data visualization?', options: ['ggplot2', 'plotly', 'lattice', 'base graphics'], correct: 0, explanation: 'ggplot2 is the tidyverse data visualization package based on the grammar of graphics, created by Hadley Wickham.' },
      { question: 'What is a primary key in a database?', options: ['A key used to encrypt data', 'A unique identifier for each row in a table', 'A foreign key reference', 'An index for faster queries'], correct: 1, explanation: 'A primary key is a column (or set of columns) that uniquely identifies each row in a table. It must contain unique values and cannot be NULL.' },
      { question: 'In spreadsheets, what does VLOOKUP do?', options: ['Validates data entry', 'Searches for a value in the first column and returns a value from another column', 'Creates a pivot table', 'Sorts data alphabetically'], correct: 1, explanation: 'VLOOKUP searches for a value in the first column of a range and returns a corresponding value from a specified column in the same row.' },
      { question: 'What is a "confidence interval" in statistics?', options: ['The range within which the population parameter is likely to fall', 'The exact value of the parameter', 'The error rate of the sample', 'The standard deviation'], correct: 0, explanation: 'A confidence interval provides a range of values that likely contains the true population parameter at a specified confidence level (e.g., 95%).' },
      { question: 'Which SQL aggregate function counts the number of rows?', options: ['SUM', 'COUNT', 'AVG', 'MAX'], correct: 1, explanation: 'COUNT returns the number of rows or non-NULL values in a column. COUNT(*) counts all rows including NULLs.' },
      { question: 'What is the purpose of data validation in spreadsheets?', options: ['To encrypt the data', 'To restrict what type of data can be entered in a cell', 'To create formulas', 'To format the spreadsheet'], correct: 1, explanation: 'Data validation rules restrict what values can be entered into a cell — such as dropdown lists, date ranges, or number limits.' },
      { question: 'In R, what does the %>% operator do?', options: ['Divides two numbers', 'Pipes the result of the left expression as the first argument to the right expression', 'Modulo operation', 'Logical AND'], correct: 1, explanation: 'The %>% (pipe) operator from the magrittr package passes the result of the left-hand expression as the first argument to the right-hand expression.' },
      { question: 'What is the difference between correlation and causation?', options: ['They are the same thing', 'Correlation shows a relationship; causation means one variable directly causes a change in another', 'Causation is weaker than correlation', 'Correlation always implies causation'], correct: 1, explanation: 'Correlation measures the strength of a relationship between two variables. Causation means one variable directly influences another. Correlation does not imply causation.' },
    ],
  },
  {
    id: 'general-data-analyst',
    title: 'General Data Analyst',
    subtitle: '15 questions · Excel, SQL, Python, Statistics',
    icon: '📈',
    color: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-600',
    totalMinutes: 30,
    questions: [
      { question: 'In Excel, which function finds the position of a value within a range?', options: ['VLOOKUP', 'MATCH', 'INDEX', 'FIND'], correct: 1, explanation: 'MATCH returns the relative position of a value within a range. It is often combined with INDEX for flexible lookups.' },
      { question: 'What is the normal distribution also known as?', options: ['Exponential distribution', 'Bell curve / Gaussian distribution', 'Uniform distribution', 'Poisson distribution'], correct: 1, explanation: 'The normal distribution is commonly called the bell curve or Gaussian distribution. It is symmetric with 68% of data within 1 standard deviation of the mean.' },
      { question: 'In SQL, what does the DISTINCT keyword do?', options: ['Deletes duplicate rows from a table', 'Returns only unique values in the result set', 'Sorts results uniquely', 'Joins unique tables'], correct: 1, explanation: 'DISTINCT eliminates duplicate rows from the result set, returning only unique values for the specified columns.' },
      { question: 'In Python pandas, which method returns the first 5 rows of a DataFrame?', options: ['.start()', '.first()', '.head()', '.top()'], correct: 2, explanation: '.head() returns the first n rows of a DataFrame (default 5). .tail() returns the last n rows.' },
      { question: 'What is the median of the dataset: 3, 7, 8, 12, 15?', options: ['7', '8', '9', '12'], correct: 1, explanation: 'The median is the middle value in an ordered dataset. For [3, 7, 8, 12, 15], the middle value is 8.' },
      { question: 'In Excel, what does the IFERROR function do?', options: ['Checks if a formula has syntax errors', 'Returns an alternative value if a formula results in an error', 'Displays error messages', 'Fixes broken formulas'], correct: 1, explanation: 'IFERROR checks if a formula results in an error (like #N/A, #VALUE!, #REF!) and returns a specified alternative value instead of the error.' },
      { question: 'What is a "foreign key" in a relational database?', options: ['The primary key of the same table', 'A column that references the primary key of another table', 'A backup key', 'An encryption key'], correct: 1, explanation: 'A foreign key is a column in one table that references the primary key of another table, establishing a relationship between the two tables.' },
      { question: 'In Python, which library is primarily used for statistical modeling?', options: ['NumPy', 'statsmodels', 'matplotlib', 'scikit-learn'], correct: 1, explanation: 'statsmodels is a Python library for statistical modeling, hypothesis testing, and exploratory data analysis.' },
      { question: 'What does "p-value" represent in hypothesis testing?', options: ['The probability that the null hypothesis is true', 'The probability of observing the test results assuming the null hypothesis is true', 'The power of the test', 'The confidence level'], correct: 1, explanation: 'The p-value is the probability of obtaining test results at least as extreme as the observed results, assuming the null hypothesis is true.' },
      { question: 'In SQL, which clause is used to sort the result set?', options: ['GROUP BY', 'ORDER BY', 'SORT BY', 'ARRANGE BY'], correct: 1, explanation: 'ORDER BY sorts the result set in ascending (ASC, default) or descending (DESC) order based on one or more columns.' },
      { question: 'What is the difference between a bar chart and a histogram?', options: ['No difference', 'Bar charts display categorical data; histograms display continuous data distributions', 'Histograms are always vertical', 'Bar charts show distributions'], correct: 1, explanation: 'Bar charts are used for categorical/comparison data with gaps between bars. Histograms show the distribution of continuous data with no gaps between bins.' },
      { question: 'In Excel, what is a PivotTable used for?', options: ['Creating charts only', 'Summarizing and analyzing large datasets interactively', 'Writing macros', 'Importing external data'], correct: 1, explanation: 'A PivotTable is an interactive tool that summarizes large datasets by grouping, aggregating, and filtering data dynamically.' },
      { question: 'What is the standard deviation a measure of?', options: ['The average of a dataset', 'The spread or dispersion of data around the mean', 'The most frequent value', 'The total range'], correct: 1, explanation: 'Standard deviation measures how spread out the data points are from the mean. A low standard deviation means data is clustered near the mean.' },
      { question: 'In Python pandas, how do you handle missing values in a DataFrame?', options: ['ignore() and skip()', 'fillna() and dropna()', 'fix() and clean()', 'replace() and solve()'], correct: 1, explanation: 'fillna() fills missing values with a specified value or method. dropna() removes rows or columns containing missing values.' },
      { question: 'What is "A/B testing" in data analytics?', options: ['Testing two versions of a variable to determine which performs better', 'Testing all variables at once', 'Testing a single hypothesis', 'A type of regression analysis'], correct: 0, explanation: 'A/B testing compares two versions (A and B) of a variable (e.g., webpage, email) to determine which one performs better based on measurable outcomes.' },
    ],
  },
];

// ── AI Assessment Constants ─────────────────────────────────────────────────

const ASSESSMENT_SUBJECTS = [
  'SQL', 'Python', 'Excel', 'Power BI',
  'Statistics', 'Data Modeling', 'DAX', 'Tableau',
] as const;

const SUBJECT_TO_STORE: Record<string, string> = {
  SQL: 'sql',
  Python: 'python-data-analytics',
  Excel: 'microsoft-excel',
  'Power BI': 'power-bi',
  Statistics: 'data-science-fundamentals',
  'Data Modeling': 'data-warehousing',
  DAX: 'power-bi',
  Tableau: 'advanced-modern-topics',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseQuestions(raw: string): Question[] {
  const questions: Question[] = [];
  const blocks = raw.split(/Q\d+\s*:/i).filter(Boolean);
  for (const block of blocks) {
    const lines = block.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;
    const questionText = lines[0].replace(/^[.:]\s*/, '');
    const options: string[] = [];
    let correctIdx = 0;
    let answerLine = '';
    for (const line of lines.slice(1)) {
      const match = line.match(/^([A-D])[).]\s*(.+)/);
      if (match) {
        options.push(match[2].trim());
      }
      if (/ANSWER/i.test(line)) {
        answerLine = line.replace(/.*ANSWER\s*:?\s*/i, '').trim().toUpperCase();
      }
    }
    if (options.length >= 2) {
      if (answerLine === 'A') correctIdx = 0;
      else if (answerLine === 'B') correctIdx = 1;
      else if (answerLine === 'C') correctIdx = 2;
      else if (answerLine === 'D') correctIdx = 3;
      questions.push({ question: questionText, options, correct: correctIdx });
    }
  }
  return questions;
}

function parseRoadmap(raw: string): RoadmapWeek[] {
  const weeks: RoadmapWeek[] = [];
  const blocks = raw.split(/Week\s+(\d+)/i).filter(Boolean);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    const weekNum = i + 1;
    if (weekNum > 4) break;
    const focusMatch = block.match(/Focus\s*:\s*(.+?)(?:\n|Goals)/is);
    const goalsMatch = block.match(/Goals\s*:\s*(.+?)(?:\n|Resources)/is);
    const resMatch = block.match(/Resources\s*:\s*(.+?)$/is);
    weeks.push({
      week: weekNum,
      focus: focusMatch?.[1]?.trim().replace(/[-*]\s*/g, '').split('\n')[0] || `Week ${weekNum} Focus`,
      goals: goalsMatch?.[1]?.split(/[-*]\s*/).map((g) => g.trim()).filter(Boolean) || [],
      resources: resMatch?.[1]?.split(/[-*]\s*/).map((r) => r.trim()).filter(Boolean) || [],
    });
  }
  return weeks;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── SVG Radar Chart Component ────────────────────────────────────────────────

function SkillRadarChart({ skillLevels }: { skillLevels: Record<string, number> }) {
  const labels = Object.keys(skillLevels);
  const values = Object.values(skillLevels);
  const n = labels.length;
  if (n < 3) return null;
  const cx = 150, cy = 150, R = 110;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const toPoint = (idx: number, radius: number) => {
    const a = startAngle + idx * angleStep;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  const gridRings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto">
      {gridRings.map((scale, i) => {
        const pts = Array.from({ length: n }, (_, idx) => {
          const p = toPoint(idx, R * scale);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-emerald-200 dark:text-emerald-900"
          />
        );
      })}
      {Array.from({ length: n }, (_, idx) => {
        const p = toPoint(idx, R);
        return (
          <line
            key={idx}
            x1={cx} y1={cy} x2={p.x} y2={p.y}
            className="stroke-emerald-200 dark:stroke-emerald-900"
            strokeWidth={0.5}
          />
        );
      })}
      <polygon
        points={values.map((v, idx) => {
          const p = toPoint(idx, R * (Math.min(v, 100) / 100));
          return `${p.x},${p.y}`;
        }).join(' ')}
        fill="rgba(16, 185, 129, 0.25)"
        stroke="#10b981"
        strokeWidth={2}
      />
      {labels.map((label, idx) => {
        const p = toPoint(idx, R * (Math.min(values[idx], 100) / 100));
        const lp = toPoint(idx, R + 18);
        return (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r={4} fill="#10b981" stroke="#fff" strokeWidth={2} />
            <text
              x={lp.x} y={lp.y}
              textAnchor="middle" dominantBaseline="middle"
              className="fill-foreground text-[10px] font-medium"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Circular Progress Ring ───────────────────────────────────────────────────

function ScoreRing({ percentage }: { percentage: number }) {
  const radius = 70;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={180} height={180} className="-rotate-90">
        <circle cx={90} cy={90} r={radius} strokeWidth={stroke}
          className="stroke-emerald-100 dark:stroke-emerald-950" fill="none" />
        <motion.circle
          cx={90} cy={90} r={radius} strokeWidth={stroke}
          fill="none" stroke="#10b981" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-emerald-600">{Math.round(percentage)}%</span>
        <span className="text-xs text-muted-foreground">Overall Score</span>
      </div>
    </div>
  );
}

// ── Certification Practice Component ─────────────────────────────────────────

function CertificationPractice() {
  const store = useProgressStore();
  const completedCertExams = store.completedCertExams || [];
  const addCertExamResult = store.addCertExamResult;

  const [selectedExam, setSelectedExam] = useState<CertExam | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examActive, setExamActive] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQIdx, setReviewQIdx] = useState(0);
  const handleSubmitExam = useCallback(() => {
    if (!selectedExam) return;
    setExamActive(false);
    setExamSubmitted(true);

    const score = answers.reduce((acc, ans, i) => acc + (ans === selectedExam.questions[i].correct ? 1 : 0), 0);
    const passed = (score / selectedExam.questions.length) * 100 >= 70;

    addCertExamResult({
      examId: selectedExam.id,
      score,
      total: selectedExam.questions.length,
      passed,
      answers: [...answers],
    });

    if (passed) {
      toast.success(`🎉 Congratulations! You passed with ${score}/${selectedExam.questions.length}!`);
    } else {
      toast.error(`You scored ${score}/${selectedExam.questions.length}. You need 70% to pass.`);
    }
  }, [selectedExam, answers, addCertExamResult]);

  // Timer countdown with auto-submit
  useEffect(() => {
    if (!examActive || examSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examActive, examSubmitted]);

  // Watch for timer hitting zero to trigger submit
  const prevTimeLeftRef = React.useRef(timeLeft);
  React.useEffect(() => {
    if (prevTimeLeftRef.current > 0 && timeLeft === 0 && examActive && !examSubmitted) {
      handleSubmitExam();
    }
    prevTimeLeftRef.current = timeLeft;
  });

  const startExam = useCallback((exam: CertExam) => {
    setSelectedExam(exam);
    setAnswers(new Array(exam.questions.length).fill(-1));
    setCurrentQ(0);
    setTimeLeft(exam.totalMinutes * 60);
    setExamActive(true);
    setExamSubmitted(false);
    setReviewMode(false);
    setReviewQIdx(0);
  }, []);

  const handleSelectAnswer = useCallback((idx: number) => {
    if (!selectedExam || examSubmitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = idx;
      return next;
    });
  }, [selectedExam, examSubmitted, currentQ]);

  const exitExam = useCallback(() => {
    setSelectedExam(null);
    setAnswers([]);
    setCurrentQ(0);
    setTimeLeft(0);
    setExamActive(false);
    setExamSubmitted(false);
    setReviewMode(false);
  }, []);

  if (selectedExam) {
    const score = answers.reduce((acc, ans, i) => acc + (ans === selectedExam.questions[i].correct ? 1 : 0), 0);
    const scorePercent = Math.round((score / selectedExam.questions.length) * 100);
    const passed = scorePercent >= 70;

    // Review mode
    if (reviewMode) {
      const q = selectedExam.questions[reviewQIdx];
      const userAnswer = answers[reviewQIdx];
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Button variant="outline" size="sm" onClick={() => setReviewMode(false)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Results
            </Button>
            <span className="text-sm text-muted-foreground">
              Reviewing: Question {reviewQIdx + 1} of {selectedExam.questions.length}
            </span>
          </div>

          <Progress value={((reviewQIdx + 1) / selectedExam.questions.length) * 100} className="h-2" />

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-base font-semibold">{q.question}</h3>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                      idx === q.correct && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                      idx !== q.correct && userAnswer === idx && 'border-red-500 bg-red-50 dark:bg-red-950/30',
                      idx !== q.correct && userAnswer !== idx && 'border-muted opacity-60',
                    )}
                  >
                    <span className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                      idx === q.correct && 'bg-emerald-500 text-white',
                      idx !== q.correct && userAnswer === idx && 'bg-red-500 text-white',
                      idx !== q.correct && userAnswer !== idx && 'bg-muted text-muted-foreground',
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 text-sm">{opt}</span>
                    {idx === q.correct && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                    {idx !== q.correct && userAnswer === idx && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border text-sm">
                <p className="font-semibold text-emerald-600 mb-1">Explanation:</p>
                <p className="text-muted-foreground">{q.explanation}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setReviewQIdx(Math.max(0, reviewQIdx - 1))}
              disabled={reviewQIdx === 0}
              className="flex-1"
            >
              Previous
            </Button>
            <Button
              onClick={() => setReviewQIdx(Math.min(selectedExam.questions.length - 1, reviewQIdx + 1))}
              disabled={reviewQIdx === selectedExam.questions.length - 1}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Next
            </Button>
          </div>
        </motion.div>
      );
    }

    // Exam completed - Results
    if (examSubmitted) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className={cn(
            'border-2',
            passed
              ? 'border-emerald-300 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20'
              : 'border-red-300 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20',
          )}>
            <CardContent className="py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4',
                  passed
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    : 'bg-gradient-to-br from-red-500 to-orange-500',
                )}
              >
                {passed ? (
                  <Trophy className="w-10 h-10 text-white" />
                ) : (
                  <XCircle className="w-10 h-10 text-white" />
                )}
              </motion.div>
              <h3 className="text-2xl font-bold mb-1">
                {passed ? 'Passed! 🎉' : 'Not Quite There'}
              </h3>
              <p className="text-muted-foreground mb-4">{selectedExam.title}</p>
              <div className="flex items-center justify-center gap-8 mb-6">
                <div>
                  <p className="text-4xl font-bold">{score}/{selectedExam.questions.length}</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">{scorePercent}%</p>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-muted-foreground">70%</p>
                  <p className="text-sm text-muted-foreground">Pass Mark</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedExam.questions.map((q, i) => {
                  const isCorrect = answers[i] === q.correct;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-colors',
                        isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white',
                      )}
                      onClick={() => { setReviewMode(true); setReviewQIdx(i); }}
                      title={`Question ${i + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                onClick={() => { setReviewMode(true); setReviewQIdx(0); }}
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
              >
                <Eye className="w-5 h-5 mr-2" />
                Review Answers
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                onClick={() => startExam(selectedExam)}
                size="lg"
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Retake Exam
              </Button>
            </motion.div>
            <Button variant="outline" onClick={exitExam} className="shrink-0">
              All Exams
            </Button>
          </div>
        </motion.div>
      );
    }

    // Active exam
    const q = selectedExam.questions[currentQ];
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Timer bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedExam.icon}</span>
            <span className="font-semibold text-sm">{selectedExam.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-xs">
              {currentQ + 1}/{selectedExam.questions.length}
            </Badge>
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold',
              timeLeft < 60 ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
            )}>
              <Timer className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <Progress value={((currentQ + 1) / selectedExam.questions.length) * 100} className="h-2" />

        {/* Question navigator */}
        <div className="flex gap-1.5 flex-wrap">
          {selectedExam.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                i === currentQ && 'bg-emerald-600 text-white shadow-md',
                i !== currentQ && answers[i] !== -1 && 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
                i !== currentQ && answers[i] === -1 && 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0 mt-0.5">Q{currentQ + 1}</Badge>
              <h3 className="text-base font-semibold leading-relaxed">{q.question}</h3>
            </div>
            <div className="space-y-2">
              {q.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectAnswer(idx)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer',
                    answers[currentQ] === idx
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-muted hover:border-emerald-300',
                  )}
                >
                  <span className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors',
                    answers[currentQ] === idx
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground',
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 text-sm">{opt}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="flex-1"
          >
            Previous
          </Button>
          {currentQ < selectedExam.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitExam}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
            >
              <FileCheck className="w-4 h-4 mr-1" />
              Submit Exam
            </Button>
          )}
        </div>

        {/* Warning: unanswered questions */}
        {answers.filter((a) => a === -1).length > 0 && currentQ === selectedExam.questions.length - 1 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
            ⚠️ {answers.filter((a) => a === -1).length} question(s) unanswered. You can still navigate back.
          </p>
        )}
      </motion.div>
    );
  }

  // Exam selection
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-600">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Certification Practice Exams</h3>
              <p className="text-sm text-muted-foreground">Test your knowledge with timed practice exams. Score 70% or higher to pass.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CERT_EXAMS.map((exam) => {
          const attempts = completedCertExams.filter((e) => e.examId === exam.id);
          const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => Math.round((a.score / a.total) * 100))) : null;
          const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

          return (
            <motion.div
              key={exam.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className={cn('p-3 rounded-xl bg-gradient-to-br mb-3', exam.gradient)}>
                    <span className="text-2xl">{exam.icon}</span>
                  </div>
                  <CardTitle className="text-base">{exam.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{exam.subtitle}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Timer className="w-3.5 h-3.5" />
                      <span>{exam.totalMinutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{exam.questions.length} questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>70% pass mark</span>
                    </div>
                    {attempts.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
                        </Badge>
                        {bestScore !== null && (
                          <Badge className={cn(
                            'text-xs',
                            bestScore >= 70
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                          )}>
                            Best: {bestScore}%
                          </Badge>
                        )}
                      </div>
                    )}
                    {lastAttempt && (
                      <div className="text-xs text-muted-foreground">
                        Last: {lastAttempt.passed ? (
                          <span className="text-emerald-600">Passed ✓</span>
                        ) : (
                          <span className="text-red-500">Failed ✗</span>
                        )} ({Math.round((lastAttempt.score / lastAttempt.total) * 100)}%)
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => startExam(exam)}
                    className={cn(
                      'w-full text-white font-semibold',
                      `bg-gradient-to-r ${exam.gradient}`,
                    )}
                  >
                    <Brain className="w-4 h-4 mr-1.5" />
                    Start Exam
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Exam History */}
      {completedCertExams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-emerald-600" />
              Exam History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {completedCertExams
                .slice()
                .reverse()
                .map((exam, i) => {
                  const examData = CERT_EXAMS.find((e) => e.id === exam.examId);
                  const pct = Math.round((exam.score / exam.total) * 100);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-lg">{examData?.icon || '📝'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{examData?.title || exam.examId}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(exam.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={cn(
                        'text-xs font-bold',
                        exam.passed
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                      )}>
                        {exam.passed ? 'PASSED' : 'FAILED'} · {pct}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {exam.score}/{exam.total}
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SkillAssessmentView() {
  const store = useProgressStore();
  const completedTopics = store.completedTopics || [];
  const getSubjectProgress = store.getSubjectProgress;

  const [mainTab, setMainTab] = useState<MainTab>('assessment');
  const [phase, setPhase] = useState<Phase>('assessment');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([]);
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set());
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);

  // ── Skill levels from store + assessment ─────────────────────────────────

  const skillLevels = useMemo(() => {
    const levels: Record<string, number> = {};
    const assessmentBoost = phase === 'assessment' ? 0 : (score / 3) * 20;
    for (const subject of ASSESSMENT_SUBJECTS) {
      const storeId = SUBJECT_TO_STORE[subject];
      const baseProgress = storeId ? getSubjectProgress(storeId) : 0;
      const isSelected = selectedSubjects.includes(subject);
      if (isSelected && phase !== 'assessment') {
        levels[subject] = Math.min(100, baseProgress + assessmentBoost);
      } else {
        levels[subject] = baseProgress;
      }
    }
    return levels;
  }, [completedTopics, phase, score, selectedSubjects, getSubjectProgress]);

  const overallScore = useMemo(() => {
    if (phase === 'assessment') return 0;
    const vals = Object.values(skillLevels);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [skillLevels, phase]);

  const strengths = useMemo(() =>
    Object.entries(skillLevels)
      .filter(([, v]) => v >= 60)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k),
    [skillLevels],
  );

  const weaknesses = useMemo(() =>
    Object.entries(skillLevels)
      .filter(([, v]) => v < 40)
      .sort((a, b) => a[1] - b[1])
      .map(([k]) => k),
    [skillLevels],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const toggleSubject = useCallback((subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );
  }, []);

  const startAssessment = useCallback(async () => {
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate 3 multiple-choice assessment questions for ${selectedSubjects.join(', ')} at ${difficulty} level. Format: Q1: question A) opt1 B) opt2 C) opt3 D) opt4 ANSWER: correct`,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        const parsed = parseQuestions(data.reply);
        if (parsed.length >= 1) {
          setQuestions(parsed.slice(0, 3));
          setCurrentQ(0);
          setScore(0);
          setSelectedAnswer(null);
          setShowResult(false);
          toast.success('Assessment started!');
          return;
        }
      }
      toast.error('Could not parse questions. Please try again.');
    } catch {
      toast.error('Failed to generate questions');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubjects, difficulty]);

  const handleAnswer = useCallback((idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === questions[currentQ]?.correct) {
      setScore((s) => s + 1);
      toast.success('Correct! 🎉');
    } else {
      toast.error('Not quite right');
    }
  }, [selectedAnswer, questions, currentQ]);

  const nextQuestion = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setPhase('results');
    }
  }, [currentQ, questions.length]);

  const generateRoadmap = useCallback(async () => {
    setIsRoadmapLoading(true);
    try {
      const scoreStr = Object.entries(skillLevels)
        .map(([k, v]) => `${k}: ${Math.round(v)}%`)
        .join(', ');
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Based on assessment results: ${scoreStr}, create a 4-week learning roadmap with weekly focus areas and milestones. Format: Week N: Focus: [topic], Goals: [list], Resources: [list]`,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        const weeks = parseRoadmap(data.reply);
        if (weeks.length > 0) {
          setRoadmap(weeks);
          setPhase('roadmap');
          toast.success('Learning roadmap generated!');
          return;
        }
      }
      toast.error('Could not parse roadmap. Please try again.');
    } catch {
      toast.error('Failed to generate roadmap');
    } finally {
      setIsRoadmapLoading(false);
    }
  }, [skillLevels]);

  const downloadRoadmap = useCallback(() => {
    const text = roadmap.map((w) => {
      let out = `═══ Week ${w.week}: ${w.focus} ═══\n`;
      out += `\nGoals:\n${w.goals.map((g) => `  ✦ ${g}`).join('\n')}\n`;
      out += `\nResources:\n${w.resources.map((r) => `  📚 ${r}`).join('\n')}\n`;
      out += w.completedWeeks !== undefined ? `\nStatus: ✅ Completed\n` : '';
      return out;
    }).join('\n──────────────────────────────\n');

    const blob = new Blob([
      `DataTrack Pro — AI Learning Roadmap\n` +
      `Generated: ${new Date().toLocaleDateString()}\n\n` +
      `Score: ${Math.round(overallScore)}%\n\n` +
      text,
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datatrack-learning-roadmap.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Roadmap downloaded!');
  }, [roadmap, overallScore]);

  const toggleWeekComplete = useCallback((week: number) => {
    setCompletedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else {
        next.add(week);
        toast.success(`Week ${week} marked as complete! 🎉`);
      }
      return next;
    });
  }, []);

  const resetAssessment = useCallback(() => {
    setPhase('assessment');
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setRoadmap([]);
    setCompletedWeeks(new Set());
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Skill Assessment & Certification</h2>
            <p className="text-sm text-muted-foreground">Evaluate your skills or practice for certification exams</p>
          </div>
        </div>
      </motion.div>

      {/* Main Tab Switcher */}
      <div className="flex gap-2">
        {([
          { id: 'assessment' as MainTab, label: 'AI Assessment', icon: Brain },
          { id: 'certification' as MainTab, label: 'Certification Practice', icon: Award },
        ]).map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMainTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2',
                mainTab === tab.id
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-muted hover:border-emerald-300 text-muted-foreground',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Certification Practice Tab */}
      {mainTab === 'certification' && (
        <AnimatePresence mode="wait">
          <CertificationPractice key="cert" />
        </AnimatePresence>
      )}

      {/* AI Assessment Tab */}
      {mainTab === 'assessment' && (
        <>
          {/* Phase Steps Indicator */}
          <div className="flex items-center gap-2">
            {(['assessment', 'results', 'roadmap'] as const).map((p, i) => (
              <React.Fragment key={p}>
                {i > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <Badge
                  variant={phase === p ? 'default' : 'outline'}
                  className={cn(
                    'capitalize transition-all',
                    phase === p && 'bg-emerald-600 hover:bg-emerald-700',
                  )}
                >
                  {p}
                </Badge>
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ═══ PHASE 1: ASSESSMENT ═══ */}
            {phase === 'assessment' && (
              <motion.div
                key="assessment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Subject Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="w-5 h-5 text-emerald-600" />
                      Choose Subjects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {ASSESSMENT_SUBJECTS.map((subject) => {
                        const storeId = SUBJECT_TO_STORE[subject];
                        const progress = storeId ? getSubjectProgress(storeId) : 0;
                        return (
                          <motion.label
                            key={subject}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={cn(
                              'relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                              selectedSubjects.includes(subject)
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                : 'border-muted hover:border-emerald-300',
                            )}
                          >
                            <Checkbox
                              checked={selectedSubjects.includes(subject)}
                              onCheckedChange={() => toggleSubject(subject)}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">{subject}</span>
                              <span className="text-xs text-muted-foreground">{progress}% done</span>
                            </div>
                            {progress > 0 && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            )}
                          </motion.label>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Difficulty Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Select Difficulty
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Beginner', 'Intermediate', 'Advanced'] as const).map((d) => (
                        <motion.button
                          key={d}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setDifficulty(d)}
                          className={cn(
                            'p-4 rounded-xl border-2 text-center transition-all',
                            difficulty === d
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                              : 'border-muted hover:border-emerald-300',
                          )}
                        >
                          <Star className={cn(
                            'w-5 h-5 mx-auto mb-2',
                            difficulty === d ? 'text-emerald-600' : 'text-muted-foreground',
                          )} />
                          <span className="text-sm font-semibold block">{d}</span>
                          <span className="text-xs text-muted-foreground block mt-1">
                            {d === 'Beginner' ? 'Fundamentals' : d === 'Intermediate' ? 'Applied skills' : 'Expert level'}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Start Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={startAssessment}
                    disabled={isLoading || selectedSubjects.length === 0}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-6 text-base"
                  >
                    {isLoading ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Start Assessment ({selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''})
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Questions */}
                {questions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-emerald-200 dark:border-emerald-900">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Question {currentQ + 1} of {questions.length}
                          </span>
                          <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                            <Trophy className="w-4 h-4" /> {score} pts
                          </span>
                        </div>
                        <Progress value={((currentQ + 1) / questions.length) * 100} className="h-2" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <h3 className="text-lg font-semibold leading-relaxed">
                          {questions[currentQ]?.question}
                        </h3>
                        <div className="space-y-3">
                          {questions[currentQ]?.options.map((opt, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={!showResult ? { scale: 1.01, x: 4 } : {}}
                              whileTap={!showResult ? { scale: 0.99 } : {}}
                              onClick={() => handleAnswer(idx)}
                              disabled={showResult}
                              className={cn(
                                'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                                !showResult && 'hover:border-emerald-400 cursor-pointer',
                                showResult && idx === questions[currentQ].correct &&
                                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                                showResult && selectedAnswer === idx && idx !== questions[currentQ].correct &&
                                  'border-red-500 bg-red-50 dark:bg-red-950/30',
                                showResult && idx !== selectedAnswer && idx !== questions[currentQ].correct &&
                                  'border-muted opacity-60',
                              )}
                            >
                              <span className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                                !showResult && 'bg-muted text-muted-foreground',
                                showResult && idx === questions[currentQ].correct && 'bg-emerald-500 text-white',
                                showResult && selectedAnswer === idx && idx !== questions[currentQ].correct && 'bg-red-500 text-white',
                              )}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="flex-1 text-sm">{opt}</span>
                              {showResult && idx === questions[currentQ].correct && (
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                              )}
                              {showResult && selectedAnswer === idx && idx !== questions[currentQ].correct && (
                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                              )}
                            </motion.button>
                          ))}
                        </div>
                        {showResult && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Button
                              onClick={nextQuestion}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {currentQ < questions.length - 1 ? 'Next Question' : 'View Results'}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ═══ PHASE 2: RESULTS ═══ */}
            {phase === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Score + Radar Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-emerald-600" />
                        Skill Radar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SkillRadarChart skillLevels={skillLevels} />
                      <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {Object.entries(skillLevels).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-1 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-muted-foreground">{k}:</span>
                            <span className="font-semibold">{Math.round(v)}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Trophy className="w-5 h-5 text-emerald-600" />
                          Overall Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center py-6">
                        <ScoreRing percentage={overallScore} />
                        <p className="mt-4 text-sm text-muted-foreground">
                          Assessment: {score}/{questions.length} correct &middot; {Math.round((score / questions.length) * 100)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                          Strengths & Weaknesses
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {strengths.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Strengths</p>
                            <div className="flex flex-wrap gap-2">
                              {strengths.map((s) => (
                                <Badge key={s} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200">
                                  <CheckCircle className="w-3 h-3 mr-1" /> {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {weaknesses.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Areas to Improve</p>
                            <div className="flex flex-wrap gap-2">
                              {weaknesses.map((w) => (
                                <Badge key={w} variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300">
                                  <XCircle className="w-3 h-3 mr-1" /> {w}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {strengths.length === 0 && weaknesses.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            Keep studying to reveal your strengths and areas for improvement!
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      onClick={generateRoadmap}
                      disabled={isRoadmapLoading}
                      size="lg"
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                    >
                      {isRoadmapLoading ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <BookOpen className="w-5 h-5 mr-2" />
                          Generate AI Learning Roadmap
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <Button variant="outline" onClick={resetAssessment} className="shrink-0">
                    Retake Assessment
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ═══ PHASE 3: ROADMAP ═══ */}
            {phase === 'roadmap' && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Summary */}
                <Card className="border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-emerald-600">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Your Personalized Learning Roadmap</h3>
                        <p className="text-sm text-muted-foreground">
                          {completedWeeks.size}/4 weeks completed &middot; Keep going!
                        </p>
                      </div>
                    </div>
                    <Progress value={(completedWeeks.size / 4) * 100} className="h-3" />
                  </CardContent>
                </Card>

                {/* Timeline */}
                <div className="relative space-y-6">
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-emerald-200 dark:bg-emerald-900 hidden sm:block" />

                  {roadmap.map((week, i) => {
                    const isComplete = completedWeeks.has(week.week);
                    return (
                      <motion.div
                        key={week.week}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="relative"
                      >
                        <div className={cn(
                          'absolute left-4 w-5 h-5 rounded-full border-4 border-white dark:border-background z-10 hidden sm:block',
                          isComplete ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                        )} />

                        <Card className={cn(
                          'sm:ml-14 transition-all',
                          isComplete && 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20',
                        )}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm">
                                  W{week.week}
                                </span>
                                <div>
                                  <CardTitle className="text-base">{week.focus}</CardTitle>
                                  <p className="text-xs text-muted-foreground">Week {week.week}</p>
                                </div>
                              </div>
                              <Button
                                variant={isComplete ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleWeekComplete(week.week)}
                                className={cn(
                                  isComplete && 'bg-emerald-600 hover:bg-emerald-700',
                                )}
                              >
                                {isComplete ? (
                                  <><CheckCircle className="w-4 h-4 mr-1" /> Done</>
                                ) : (
                                  'Mark Complete'
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wider">Goals</p>
                              <ul className="space-y-1">
                                {week.goals.map((goal, gi) => (
                                  <li key={gi} className="flex items-start gap-2 text-sm">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span>{goal}</span>
                                  </li>
                                ))}
                                {week.goals.length === 0 && (
                                  <li className="text-sm text-muted-foreground italic">No goals specified</li>
                                )}
                              </ul>
                            </div>
                            {week.resources.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-teal-600 mb-2 uppercase tracking-wider">Resources</p>
                                <div className="flex flex-wrap gap-2">
                                  {week.resources.map((res, ri) => (
                                    <Badge key={ri} variant="secondary" className="text-xs">
                                      📚 {res}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {isComplete && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="pt-2 border-t border-emerald-200 dark:border-emerald-800"
                              >
                                <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                  <Trophy className="w-3 h-3" /> Week {week.week} completed!
                                </p>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      onClick={downloadRoadmap}
                      size="lg"
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Roadmap
                    </Button>
                  </motion.div>
                  <Button variant="outline" onClick={resetAssessment} className="shrink-0">
                    Retake Assessment
                  </Button>
                </div>

                {/* All Complete Celebration */}
                {completedWeeks.size === 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4">
                      <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      You&apos;ve completed your entire 4-week learning roadmap. Keep up the amazing work on your data analytics journey!
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
