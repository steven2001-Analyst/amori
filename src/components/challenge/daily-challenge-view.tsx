'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Calendar,
  Flame,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  Trophy,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

interface Challenge {
  question: string;
  type: 'mcq' | 'truefalse' | 'code';
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const challenges: Challenge[] = [
  // SQL Challenges
  {
    question: 'What will the following SQL query return?\n\nSELECT COUNT(*) FROM employees WHERE department = \'Sales\';',
    type: 'mcq',
    options: [
      'All employees in the Sales department',
      'The number of employees in the Sales department',
      'The total salary of Sales employees',
      'A list of Sales department IDs',
    ],
    correctAnswer: 1,
    explanation: 'COUNT(*) is an aggregate function that counts all rows matching the WHERE condition. It returns a single number representing the count of employees in the Sales department, not the actual rows.',
    category: 'SQL',
    difficulty: 'easy',
  },
  {
    question: 'Which JOIN type returns ALL rows from both tables, matching where possible and NULL where not?',
    type: 'mcq',
    options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'],
    correctAnswer: 2,
    explanation: 'FULL OUTER JOIN returns all rows from both the left and right tables. When there\'s a match, rows are combined; when there isn\'t, NULLs fill in for the missing side. This is different from INNER JOIN (only matches) or LEFT/RIGHT JOIN (one-sided).',
    category: 'SQL',
    difficulty: 'medium',
  },
  {
    question: 'What is wrong with this SQL query?\n\nSELECT name, salary\nFROM employees\nWHERE salary > AVG(salary);',
    type: 'mcq',
    options: [
      'Nothing, it works correctly',
      'Cannot use aggregate functions in WHERE — use HAVING instead',
      'The WHERE clause should use GROUP BY',
      'Cannot compare salary to an aggregate function — use a subquery',
    ],
    correctAnswer: 3,
    explanation: 'Aggregate functions like AVG() cannot be used directly in a WHERE clause. You need to use a subquery: SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees); Alternatively, HAVING is used with GROUP BY, not for filtering individual rows.',
    category: 'SQL',
    difficulty: 'hard',
  },
  {
    question: 'TRUE or FALSE: A LEFT JOIN always returns at least as many rows as an INNER JOIN on the same tables.',
    type: 'truefalse',
    correctAnswer: 'true',
    explanation: 'TRUE. A LEFT JOIN returns all rows from the left table plus matched rows from the right. Since it includes everything an INNER JOIN would match (plus unmatched left rows), it always returns at least as many rows.',
    category: 'SQL',
    difficulty: 'medium',
  },
  {
    question: 'What does the RANK() window function do when two rows have the same value?',
    type: 'mcq',
    options: [
      'Assigns different ranks randomly',
      'Assigns the same rank, then skips the next rank number',
      'Assigns the same rank without skipping',
      'Throws an error for ties',
    ],
    correctAnswer: 1,
    explanation: 'RANK() assigns the same rank to tied values, then skips the next rank. For example, if two rows tie for rank 1, the next row gets rank 3. DENSE_RANK() is the alternative that doesn\'t skip (next would be rank 2), and ROW_NUMBER() assigns unique sequential numbers regardless of ties.',
    category: 'SQL',
    difficulty: 'medium',
  },
  // Excel Challenges
  {
    question: 'What does the formula =VLOOKUP("Apple", A1:C10, 3, FALSE) do?',
    type: 'mcq',
    options: [
      'Looks up "Apple" in row 3 of column C',
      'Finds "Apple" in the first column of A1:C10 and returns the value from column 3',
      'Counts occurrences of "Apple" in range A1:C10',
      'Returns "Apple" if it appears in column 3',
    ],
    correctAnswer: 1,
    explanation: 'VLOOKUP searches for "Apple" in the first column of the range A1:C10. When found, it returns the value from the 3rd column of that same row. FALSE means it requires an exact match. Note: XLOOKUP is the modern alternative.',
    category: 'Excel',
    difficulty: 'easy',
  },
  {
    question: 'Given: A1:A5 = {10, 25, 30, 45, 50} and B1:B5 = {100, 200, 300, 400, 500}.\n\nWhat does =SUMIF(A1:A5, ">25", B1:B5) return?',
    type: 'mcq',
    options: ['600', '900', '1200', '1500'],
    correctAnswer: 2,
    explanation: 'SUMIF checks each value in A1:A5 against ">25". Values 30, 45, and 50 pass (>25). It then sums the corresponding values from B1:B5: B3(300) + B4(400) + B5(500) = 1200.',
    category: 'Excel',
    difficulty: 'medium',
  },
  {
    question: 'TRUE or FALSE: In Excel, =INDEX(A1:C10, 5, 3) returns the value in the 5th row and 3rd column of the range A1:C10.',
    type: 'truefalse',
    correctAnswer: 'true',
    explanation: 'TRUE. INDEX(range, row_num, col_num) returns the value at the intersection of the specified row and column within the given range. INDEX(A1:C10, 5, 3) returns the value in cell C5 (the 5th row, 3rd column of the range).',
    category: 'Excel',
    difficulty: 'easy',
  },
  {
    question: 'Which Excel function would you use to combine values from A1 ("John") and B1 ("Doe") with a space between them?',
    type: 'mcq',
    options: [
      '=CONCATENATE(A1, " ", B1) or =A1 & " " & B1',
      '=JOIN(A1, " ", B1)',
      '=MERGE(A1, B1, " ")',
      '=COMBINE(A1, B1, separator=" ")',
    ],
    correctAnswer: 0,
    explanation: 'Both CONCATENATE(A1, " ", B1) and the concatenation operator & ("A1" & " " & "B1") work. Modern Excel also supports CONCAT and TEXTJOIN. There is no JOIN, MERGE, or COMBINE function in Excel.',
    category: 'Excel',
    difficulty: 'easy',
  },
  {
    question: 'What does the XLOOKUP function have that VLOOKUP does not?',
    type: 'mcq',
    options: [
      'Only works with numbers',
      'Can search left-to-right or right-to-left and has a built-in default value',
      'Requires an exact match only',
      'Cannot work with arrays',
    ],
    correctAnswer: 1,
    explanation: 'XLOOKUP can search in any direction (not limited to leftmost column like VLOOKUP), has a built-in [if_not_found] parameter for default values, can return arrays, and supports match modes (exact, wildcard, approximate). It\'s the recommended replacement for VLOOKUP.',
    category: 'Excel',
    difficulty: 'medium',
  },
  // Python/Pandas Challenges
  {
    question: 'What does the following Pandas code output?\n\nimport pandas as pd\ndf = pd.DataFrame({"A": [1, 2, 3], "B": [4, 5, 6]})\nprint(df["A"].sum())',
    type: 'mcq',
    options: ['[1, 2, 3]', '6', '12', 'Error'],
    correctAnswer: 1,
    explanation: 'df["A"] selects column "A" as a Series: [1, 2, 3]. The .sum() method adds all values: 1 + 2 + 3 = 6. This is a basic Pandas aggregation operation.',
    category: 'Python',
    difficulty: 'easy',
  },
  {
    question: 'Which Python library is primarily used for creating interactive visualizations in Jupyter notebooks?',
    type: 'mcq',
    options: ['NumPy', 'Pandas', 'Plotly', 'SciPy'],
    correctAnswer: 2,
    explanation: 'Plotly is the go-to library for interactive visualizations in Python/Jupyter. While Matplotlib creates static plots, Plotly produces hover-enabled, zoomable charts. Seaborn is also popular but primarily for statistical static plots.',
    category: 'Python',
    difficulty: 'easy',
  },
  {
    question: 'What does df.groupby("city")["sales"].sum() return?',
    type: 'mcq',
    options: [
      'A DataFrame with all original columns grouped by city',
      'A Series with city as index and total sales per city',
      'The total sales across all cities',
      'An error — you cannot chain groupby with column selection',
    ],
    correctAnswer: 1,
    explanation: 'df.groupby("city") groups rows by unique city values. ["sales"] selects the sales column, and .sum() computes the total for each group. The result is a Series where the index is city names and values are the sum of sales for each city.',
    category: 'Python',
    difficulty: 'medium',
  },
  {
    question: 'TRUE or FALSE: df.dropna() removes rows with ANY missing values by default.',
    type: 'truefalse',
    correctAnswer: 'true',
    explanation: 'TRUE. By default, df.dropna() removes any row that contains at least one NaN/None value. You can control this with the "how" parameter: how="all" only drops rows where ALL values are NaN, and the "subset" parameter lets you check specific columns.',
    category: 'Python',
    difficulty: 'easy',
  },
  {
    question: 'What is the output of: pd.merge(df1, df2, how="left", on="id") when df1 has 5 rows and df2 has 3 rows, with all 3 IDs in df2 matching df1?',
    type: 'mcq',
    options: [
      '3 rows (matching only)',
      '5 rows (all from df1, with NaN for unmatched)',
      '8 rows (cartesian product)',
      'Error — columns don\'t match',
    ],
    correctAnswer: 1,
    explanation: 'A LEFT JOIN (how="left") keeps ALL rows from the left table (df1 with 5 rows). Matching rows from df2 are joined; for the 2 rows in df1 with no match in df2, NULL/NaN values fill the df2 columns. Result: 5 rows.',
    category: 'Python',
    difficulty: 'hard',
  },
  // Power BI Challenges
  {
    question: 'Which DAX measure calculates Year-to-Date (YTD) sales?',
    type: 'mcq',
    options: [
      'CALCULATE(SUM(Sales[Amount]), SAMEPERIODLASTYEAR(Dates[Date]))',
      'CALCULATE(SUM(Sales[Amount]), DATESYTD(Dates[Date]))',
      'SUM(Sales[Amount]) / COUNTROWS(Dates)',
      'TOTALYTD(SUM(Sales[Amount]), Dates[Date]) — either B or D',
    ],
    correctAnswer: 3,
    explanation: 'Both CALCULATE(SUM(Sales[Amount]), DATESYTD(Dates[Date])) and TOTALYTD(SUM(Sales[Amount]), Dates[Date]) calculate YTD sales. TOTALYTD is a shorthand. Option A calculates same period last year. Option C calculates daily average.',
    category: 'Power BI',
    difficulty: 'medium',
  },
  {
    question: 'Which visualization type is best for showing the composition of a whole across categories?',
    type: 'mcq',
    options: ['Line Chart', 'Pie Chart or Donut Chart', 'Scatter Plot', 'Waterfall Chart'],
    correctAnswer: 1,
    explanation: 'Pie charts and donut charts are ideal for showing parts of a whole. Each slice represents a category\'s proportion. For comparing parts across multiple categories or over time, stacked bar/column charts or treemaps are better alternatives.',
    category: 'Power BI',
    difficulty: 'easy',
  },
  {
    question: 'TRUE or FALSE: In Power BI, calculated columns are computed at query time while measures are computed at query time for each cell in a visual.',
    type: 'truefalse',
    correctAnswer: 'true',
    explanation: 'TRUE, but with an important distinction: Calculated columns are evaluated once during data load and stored in the model. Measures are evaluated on-the-fly at query time, recalculating for every cell/context in a visual (like filters, slicers, rows, columns).',
    category: 'Power BI',
    difficulty: 'hard',
  },
  // Data Warehousing Challenges
  {
    question: 'Which schema type has a central fact table surrounded by denormalized dimension tables?',
    type: 'mcq',
    options: ['Snowflake Schema', 'Star Schema', 'Galaxy Schema', 'Flat Schema'],
    correctAnswer: 1,
    explanation: 'The Star Schema features a central fact table (containing measures) connected to denormalized dimension tables (containing descriptive attributes), forming a star shape. Snowflake Schema normalizes dimensions into multiple tables. Galaxy Schema has multiple fact tables.',
    category: 'Data Warehousing',
    difficulty: 'easy',
  },
  {
    question: 'What is SCD Type 2 used for?',
    type: 'mcq',
    options: [
      'Overwriting old values with new ones',
      'Tracking historical changes by adding new rows with effective dates',
      'Storing only the current version',
      'Deleting records that have changed',
    ],
    correctAnswer: 1,
    explanation: 'SCD Type 2 preserves full history by adding a new row for each change, with effective start/end dates and version flags. SCD Type 1 overwrites (no history). SCD Type 3 adds a "previous value" column (limited history). Type 2 is the most common for tracking changes in data warehouses.',
    category: 'Data Warehousing',
    difficulty: 'medium',
  },
  {
    question: 'What is the primary difference between ETL and ELT?',
    type: 'mcq',
    options: [
      'ETL loads data first, ELT transforms first',
      'ETL transforms before loading; ELT loads raw data then transforms in the target',
      'They are the same thing with different names',
      'ELT is older and deprecated',
    ],
    correctAnswer: 1,
    explanation: 'ETL (Extract, Transform, Load) transforms data before loading into the target system using a separate ETL engine. ELT (Extract, Load, Transform) loads raw data into the target first, then transforms it using the target system\'s processing power (e.g., using SQL in Snowflake or BigQuery). ELT is preferred for cloud data warehouses.',
    category: 'Data Warehousing',
    difficulty: 'medium',
  },
  // General/Data Challenges
  {
    question: 'Which data type is most appropriate for storing monetary values in a database?',
    type: 'mcq',
    options: ['FLOAT', 'DECIMAL/NUMERIC', 'VARCHAR', 'INT'],
    correctAnswer: 1,
    explanation: 'DECIMAL (or NUMERIC) is the correct choice for monetary values. FLOAT/DOUBLE can introduce rounding errors due to floating-point precision issues. VARCHAR would be inefficient and lose numeric operations. INT can\'t store decimal portions of currency.',
    category: 'General',
    difficulty: 'easy',
  },
  {
    question: 'TRUE or FALSE: A Pareto chart combines a bar chart with a line graph to show individual values in descending order and their cumulative total.',
    type: 'truefalse',
    correctAnswer: 'true',
    explanation: 'TRUE. A Pareto chart (based on the 80/20 rule) displays bars in descending order of frequency/value, with a line showing the running cumulative percentage. It helps identify the "vital few" factors that contribute most to an effect.',
    category: 'General',
    difficulty: 'easy',
  },
  {
    question: 'What is the main purpose of data normalization in database design?',
    type: 'mcq',
    options: [
      'To make queries run slower but more accurately',
      'To reduce data redundancy and improve data integrity',
      'To encrypt sensitive information',
      'To compress the database to save disk space',
    ],
    correctAnswer: 1,
    explanation: 'Normalization organizes data to minimize redundancy (duplicate data) and dependency, which improves data integrity and consistency. It involves dividing tables and establishing relationships. The main normal forms are 1NF (atomic values), 2NF (no partial dependencies), and 3NF (no transitive dependencies).',
    category: 'General',
    difficulty: 'medium',
  },
  {
    question: 'Which chart type is best for showing trends over time?',
    type: 'mcq',
    options: ['Pie Chart', 'Bar Chart', 'Line Chart', 'Scatter Plot'],
    correctAnswer: 2,
    explanation: 'Line charts are ideal for displaying trends over continuous time periods. The x-axis represents time and the y-axis the metric. Points connected by lines make it easy to see upward/downward trends, seasonality, and patterns. Bar charts work better for comparing categories at a single point in time.',
    category: 'General',
    difficulty: 'easy',
  },
  {
    question: 'In a dataset, what does it mean if the mean is significantly higher than the median?',
    type: 'mcq',
    options: [
      'The data is perfectly symmetric',
      'The data is right-skewed (positively skewed) with outliers on the high end',
      'The data is left-skewed (negatively skewed)',
      'The mean and median are always equal',
    ],
    correctAnswer: 1,
    explanation: 'When the mean > median, the data is right-skewed (positively skewed). This happens when there are extreme high-value outliers pulling the mean upward. For example, income data is typically right-skewed — a few very high earners pull the average above the median.',
    category: 'General',
    difficulty: 'medium',
  },
  {
    question: 'What is the difference between a data lake and a data warehouse?',
    type: 'mcq',
    options: [
      'They are the same thing',
      'A data lake stores raw/unstructured data; a data warehouse stores processed/structured data',
      'A data warehouse is cheaper than a data lake',
      'A data lake only works with SQL',
    ],
    correctAnswer: 1,
    explanation: 'A data lake stores all data types (structured, semi-structured, unstructured) in its raw form (schema-on-read). A data warehouse stores structured, processed data optimized for queries (schema-on-write). Data lakes offer flexibility for data scientists; warehouses offer reliability for BI reporting.',
    category: 'Data Warehousing',
    difficulty: 'medium',
  },
  {
    question: 'What does the Python code df.describe() return for a numeric DataFrame?',
    type: 'mcq',
    options: [
      'Column names and data types',
      'Count, mean, std, min, max, and quartile statistics for each numeric column',
      'The first 5 rows of the DataFrame',
      'A summary of missing values per column',
    ],
    correctAnswer: 1,
    explanation: 'df.describe() generates descriptive statistics: count, mean, standard deviation, minimum, 25th percentile (Q1), median (50%), 75th percentile (Q3), and maximum for each numeric column. For object/categorical columns (with include="all"), it shows count, unique, top, and freq.',
    category: 'Python',
    difficulty: 'easy',
  },
  {
    question: 'TRUE or FALSE: A confetti/confidence interval of 95% means there is a 95% probability the true population parameter falls within the interval.',
    type: 'truefalse',
    correctAnswer: 'true',
    explanation: 'TRUE. A 95% confidence interval means that if we were to take many samples and compute the interval each time, approximately 95% of those intervals would contain the true population parameter. It gives us a range of plausible values for the unknown parameter.',
    category: 'General',
    difficulty: 'hard',
  },
];

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort().reverse();
  const today = getDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  if (sorted[0] !== today && sorted[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = new Date(sorted[i]);
    const next = new Date(sorted[i + 1]);
    const diffDays = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const difficultyConfig = {
  easy: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'Easy' },
  medium: { color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Medium' },
  hard: { color: 'text-rose-600 bg-rose-50 border-rose-200', label: 'Hard' },
};

const categoryColors: Record<string, string> = {
  SQL: 'from-cyan-500 to-teal-500',
  Excel: 'from-green-500 to-emerald-600',
  Python: 'from-amber-500 to-orange-500',
  'Power BI': 'from-yellow-500 to-orange-500',
  'Data Warehousing': 'from-teal-500 to-cyan-600',
  General: 'from-emerald-500 to-teal-500',
};

export default function DailyChallengeView() {
  const store = useProgressStore();
  const completedDailyChallenges = Array.isArray(store.completedDailyChallenges) ? store.completedDailyChallenges : [];
  const addDailyChallenge = store.addDailyChallenge;
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const today = new Date();
  const todayStr = getDateString(today);
  const dayOfYear = getDayOfYear(today);
  const todaysChallenge = challenges[dayOfYear % challenges.length];
  const isCompletedToday = completedDailyChallenges.includes(todayStr);
  const challengeStreak = calculateStreak(completedDailyChallenges);
  const isCorrect = selectedAnswer === todaysChallenge.correctAnswer;

  const calendarDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { day: number; dateStr: string; completed: boolean; isToday: boolean }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        dateStr,
        completed: completedDailyChallenges.includes(dateStr),
        isToday: dateStr === todayStr,
      });
    }
    return { firstDay, days, monthName: today.toLocaleDateString('default', { month: 'long', year: 'numeric' }) };
  }, [completedDailyChallenges, todayStr, today]);

  const handleAnswer = useCallback(
    (answer: number | string) => {
      if (showResult) return;
      setSelectedAnswer(answer);
    },
    [showResult, setSelectedAnswer]
  );

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (selectedAnswer === todaysChallenge.correctAnswer && !isCompletedToday) {
      addDailyChallenge(todayStr);
    }
  }, [selectedAnswer, todaysChallenge.correctAnswer, isCompletedToday, addDailyChallenge, todayStr, setShowResult]);

  const handleReset = useCallback(() => {
    setSelectedAnswer(null);
    setShowResult(false);
  }, [setSelectedAnswer, setShowResult]);

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index
        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
        : 'border-border hover:border-emerald-300 hover:bg-muted/50';
    }
    if (index === todaysChallenge.correctAnswer) {
      return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30';
    }
    if (selectedAnswer === index && index !== todaysChallenge.correctAnswer) {
      return 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 ring-2 ring-rose-500/30';
    }
    return 'border-border opacity-50';
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-4 shadow-lg shadow-amber-500/20"
        >
          <Zap className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold">Daily Challenge</h2>
        <p className="text-muted-foreground mt-1">
          {today.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-muted-foreground">Streak</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{challengeStreak}</p>
            <p className="text-xs text-muted-foreground">day{challengeStreak !== 1 ? 's' : ''}</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{completedDailyChallenges.length}</p>
            <p className="text-xs text-muted-foreground">completed</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="text-center p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCalendar(!showCalendar)}>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Calendar className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-medium text-muted-foreground">This Month</span>
            </div>
            <p className="text-2xl font-bold text-teal-600">{calendarDays.days.filter(d => d.completed).length}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </Card>
        </motion.div>
      </div>

      {/* Calendar Toggle */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4">
              <div className="text-center mb-3">
                <h3 className="text-sm font-semibold">{calendarDays.monthName}</h3>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
                {Array.from({ length: calendarDays.firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {calendarDays.days.map((d) => (
                  <motion.div
                    key={d.dateStr}
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      'w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors',
                      d.isToday && 'ring-2 ring-emerald-500',
                      d.completed
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm'
                        : d.isToday
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700'
                          : 'bg-muted/50 text-muted-foreground'
                    )}
                  >
                    {d.completed ? <CheckCircle2 className="w-3 h-3" /> : d.day}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="overflow-hidden">
          {/* Challenge Header */}
          <div className={cn('bg-gradient-to-r p-4', categoryColors[todaysChallenge.category] || 'from-emerald-500 to-teal-500')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white/80" />
                <span className="text-sm font-semibold text-white/90">{todaysChallenge.category}</span>
              </div>
              <Badge variant="outline" className={cn('text-xs border-white/30 bg-white/10 text-white', difficultyConfig[todaysChallenge.difficulty].label === todaysChallenge.difficulty && '')}>
                {difficultyConfig[todaysChallenge.difficulty].label}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6 space-y-5">
            {/* Question */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Challenge #{dayOfYear}</p>
              <p className="text-base leading-relaxed whitespace-pre-line font-medium">
                {todaysChallenge.question}
              </p>
            </div>

            {/* MCQ Options */}
            {todaysChallenge.type === 'mcq' && todaysChallenge.options && (
              <div className="space-y-2.5">
                {todaysChallenge.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={!showResult ? { scale: 1.01 } : {}}
                    whileTap={!showResult ? { scale: 0.99 } : {}}
                    disabled={showResult}
                    onClick={() => handleAnswer(index)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 flex items-start gap-3',
                      getOptionStyle(index)
                    )}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5',
                        selectedAnswer === index
                          ? 'bg-emerald-500 text-white'
                          : showResult && index === todaysChallenge.correctAnswer
                            ? 'bg-emerald-500 text-white'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {showResult && index === todaysChallenge.correctAnswer ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : showResult && selectedAnswer === index && index !== todaysChallenge.correctAnswer ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </span>
                    <span className="text-sm leading-relaxed">{option}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* True/False Options */}
            {todaysChallenge.type === 'truefalse' && (
              <div className="grid grid-cols-2 gap-3">
                {(['true', 'false'] as const).map((val) => (
                  <motion.button
                    key={val}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    disabled={showResult}
                    onClick={() => handleAnswer(val)}
                    className={cn(
                      'p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 font-semibold',
                      selectedAnswer === val
                        ? showResult && val === todaysChallenge.correctAnswer
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30 text-emerald-700'
                          : showResult
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 ring-2 ring-rose-500/30 text-rose-700'
                            : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 text-emerald-700'
                        : showResult && val === todaysChallenge.correctAnswer
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30 text-emerald-700'
                          : 'border-border hover:border-emerald-300 hover:bg-muted/50'
                    )}
                  >
                    {val === 'true' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    {val === 'true' ? 'True' : 'False'}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Code type */}
            {todaysChallenge.type === 'code' && (
              <div>
                <textarea
                  disabled={showResult}
                  value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full h-24 p-3 rounded-xl border-2 border-border bg-muted/30 text-sm font-mono focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                />
              </div>
            )}

            {/* Action Buttons */}
            {!showResult ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                size="lg"
              >
                Submit Answer
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Result Banner */}
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'p-4 rounded-xl flex items-center gap-3',
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200'
                    )}
                  >
                    {isCorrect ? (
                      <>
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                        >
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-emerald-700">Correct! Well done! 🎉</p>
                          <p className="text-xs text-emerald-600/70">You earned today&apos;s challenge point</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <XCircle className="w-6 h-6 text-rose-600" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-rose-700">Not quite right</p>
                          <p className="text-xs text-rose-600/70">Keep learning and try tomorrow&apos;s challenge!</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Explanation */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-muted/50 rounded-xl p-4 space-y-2"
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explanation</p>
                  <p className="text-sm leading-relaxed text-foreground/80">{todaysChallenge.explanation}</p>
                </motion.div>

                {/* Come Back Message */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {isCompletedToday ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Come back tomorrow for a new challenge!
                      </span>
                    ) : (
                      <Button variant="outline" onClick={handleReset} size="sm">
                        Try Again
                      </Button>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Fun fact / motivation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-4"
      >
        <p className="text-xs text-muted-foreground">
          💡 Consistent daily practice is the key to mastering data analytics
        </p>
      </motion.div>
    </div>
  );
}
