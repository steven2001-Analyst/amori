'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Code,
  Table2,
  PieChart,
  BarChart3,
  RotateCcw,
  Lightbulb,
  Trophy,
  Shuffle,
  Warehouse,
  Zap,
  Rocket,
  Database,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Exercise {
  id: string;
  question: string;
  type: 'mcq' | 'code' | 'truefalse' | 'shortanswer';
  options?: string[];
  correctAnswer: number | string | boolean;
  explanation: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

interface SubjectExercises {
  subjectId: string;
  subjectName: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  subtopics: string[];
  exercises: Exercise[];
}

// ─── Utility: Fisher-Yates shuffle ───────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Difficulty badge component ──────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: Exercise['difficulty'] }) {
  const config = {
    easy: { label: 'Easy', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    hard: { label: 'Hard', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  };
  const c = config[difficulty];
  return <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', c.className)}>{c.label}</Badge>;
}

// ─── Type label helper ───────────────────────────────────────────────────────

function typeLabel(type: Exercise['type']) {
  switch (type) {
    case 'mcq': return 'Multiple Choice';
    case 'code': return 'Code Input';
    case 'truefalse': return 'True / False';
    case 'shortanswer': return 'Short Answer';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXERCISE DATA — 102 exercises across 8 subjects
// ═══════════════════════════════════════════════════════════════════════════════

const subjectsData: SubjectExercises[] = [
  // ── 1. Introduction to Data Analytics (12 exercises) ──────────────────────
  {
    subjectId: 'intro-data-analytics',
    subjectName: 'Intro to DA',
    icon: BarChart3,
    color: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-500',
    subtopics: ['Analytics Types', 'Data Fundamentals', 'Data Ethics & Tools'],
    exercises: [
      // Analytics Types (4)
      {
        id: 'intro-1', question: 'A company wants to understand why their sales dropped last quarter. Which type of analytics should they use?',
        type: 'mcq', options: ['Descriptive Analytics', 'Diagnostic Analytics', 'Predictive Analytics', 'Prescriptive Analytics'],
        correctAnswer: 1, difficulty: 'easy', topic: 'Analytics Types',
        explanation: 'Diagnostic analytics digs into data to understand WHY something happened. It goes beyond descriptive (what happened) to identify root causes through drill-down, data discovery, and correlation analysis.',
      },
      {
        id: 'intro-2', question: 'A retailer uses historical purchasing data to forecast next month\'s demand for each product category. This is an example of which analytics type?',
        type: 'mcq', options: ['Descriptive Analytics', 'Diagnostic Analytics', 'Predictive Analytics', 'Prescriptive Analytics'],
        correctAnswer: 2, difficulty: 'easy', topic: 'Analytics Types',
        explanation: 'Predictive analytics uses historical data and statistical/machine learning models to forecast future outcomes. Demand forecasting, churn prediction, and risk scoring are classic examples.',
      },
      {
        id: 'intro-3', question: 'Descriptive analytics answers the question "What happened?"',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'easy', topic: 'Analytics Types',
        explanation: 'True. Descriptive analytics summarizes historical data to answer "What happened?" using aggregations, dashboards, and reports. It is the most basic form of analytics.',
      },
      {
        id: 'intro-4', question: 'A logistics company uses an optimization algorithm that recommends the best delivery routes considering traffic, weather, and fuel costs. This is an example of __________ analytics.',
        type: 'shortanswer', correctAnswer: 'prescriptive', difficulty: 'medium', topic: 'Analytics Types',
        hint: 'This is the most advanced type of analytics.',
        explanation: 'Prescriptive analytics not only predicts what will happen but also recommends actions to achieve desired outcomes. It uses optimization and simulation algorithms to suggest the best course of action.',
      },
      // Data Fundamentals (4)
      {
        id: 'intro-5', question: 'Match the tool to its primary use case:\n\n1. Tableau → ?\n2. Alteryx → ?\n3. Apache Spark → ?',
        type: 'mcq', options: [
          '1=Data Viz, 2=Data Prep, 3=Big Data Processing',
          '1=Data Prep, 2=Data Viz, 3=Data Viz',
          '1=Big Data, 2=Data Viz, 3=Data Prep',
          '1=Data Viz, 2=Big Data, 3=Data Prep',
        ],
        correctAnswer: 0, difficulty: 'easy', topic: 'Data Fundamentals',
        explanation: 'Tableau is a leading data visualization tool. Alteryx specializes in data preparation and ETL workflows. Apache Spark is a distributed computing engine for big data processing and analytics at scale.',
      },
      {
        id: 'intro-6', question: 'Which data type would you use for a column storing customer phone numbers?',
        type: 'mcq', options: ['INT', 'VARCHAR / STRING', 'BOOLEAN', 'FLOAT'],
        correctAnswer: 1, difficulty: 'easy', topic: 'Data Fundamentals',
        explanation: 'Phone numbers should be stored as VARCHAR/STRING, not INT. Reasons: they may contain leading zeros, special characters (+, -, parentheses), country codes, and you don\'t perform arithmetic on them.',
      },
      {
        id: 'intro-7', question: 'Structured data is organized in rows and columns (like spreadsheets), while unstructured data includes things like images, emails, and social media posts.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'easy', topic: 'Data Fundamentals',
        explanation: 'True. Structured data has a predefined schema (rows and columns) and is easy to query. Unstructured data has no predefined format and makes up roughly 80% of all data generated today.',
      },
      {
        id: 'intro-8', question: 'In the data analytics lifecycle, which step comes immediately after data collection?',
        type: 'mcq', options: ['Data Visualization', 'Data Cleaning / Preparation', 'Data Modeling', 'Data Sharing'],
        correctAnswer: 1, difficulty: 'medium', topic: 'Data Fundamentals',
        explanation: 'After collecting raw data, the next critical step is data cleaning and preparation. This includes handling missing values, removing duplicates, standardizing formats, and transforming data into an analysis-ready state.',
      },
      // Data Ethics & Tools (4)
      {
        id: 'intro-9', question: 'Which regulation mandates that individuals have the right to access, correct, and delete their personal data held by organizations?',
        type: 'mcq', options: ['HIPAA', 'GDPR', 'SOX', 'PCI DSS'],
        correctAnswer: 1, difficulty: 'medium', topic: 'Data Ethics & Tools',
        explanation: 'GDPR (General Data Protection Regulation) is the European Union\'s data privacy law that gives individuals control over their personal data. HIPAA is healthcare-specific, SOX is financial reporting, and PCI DSS is for payment card security.',
      },
      {
        id: 'intro-10', question: 'Data anonymization and data pseudonymization provide the exact same level of privacy protection.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 1, difficulty: 'medium', topic: 'Data Ethics & Tools',
        explanation: 'False. Anonymization irreversibly removes all identifying information so data can never be linked back to an individual. Pseudonymization replaces identifiers with artificial ones but can potentially be reversed, making it less secure.',
      },
      {
        id: 'intro-11', question: 'What is the primary role of a data analyst in a modern business?',
        type: 'shortanswer', correctAnswer: 'to translate raw data into actionable insights that drive business decisions',
        difficulty: 'easy', topic: 'Data Ethics & Tools',
        hint: 'Think about the bridge between data and business outcomes.',
        explanation: 'A data analyst bridges the gap between raw data and business stakeholders. They collect, clean, analyze, and visualize data to uncover patterns and trends that inform strategic decisions, combining technical skills with business acumen.',
      },
      {
        id: 'intro-12', question: 'Which of the following is NOT a typical responsibility of a data analyst?',
        type: 'mcq', options: ['Creating dashboards and reports', 'Designing database schemas from scratch', 'Identifying trends and patterns in data', 'Cleaning and preprocessing datasets'],
        correctAnswer: 1, difficulty: 'medium', topic: 'Data Ethics & Tools',
        explanation: 'While data analysts work with databases, designing database schemas from scratch is typically the responsibility of a database administrator or data engineer. Data analysts focus on querying, analyzing, and visualizing existing data structures.',
      },
    ],
  },

  // ── 2. Microsoft Excel (14 exercises) ─────────────────────────────────────
  {
    subjectId: 'microsoft-excel',
    subjectName: 'Excel',
    icon: Table2,
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-600',
    subtopics: ['Formulas & Functions', 'Lookup & Reference', 'Data Analysis', 'Pivot Tables'],
    exercises: [
      // Formulas & Functions (5)
      {
        id: 'excel-1', question: 'What will =LEFT("Data Analytics", 4) return?',
        type: 'mcq', options: ['"Analytics"', '"Data"', '"Data A"', '" ata"'],
        correctAnswer: 1, difficulty: 'easy', topic: 'Formulas & Functions',
        explanation: 'LEFT(text, num_chars) extracts the specified number of characters from the left side of a string. LEFT("Data Analytics", 4) returns "Data". RIGHT() extracts from the right, and MID() extracts from any position.',
      },
      {
        id: 'excel-2', question: 'Write a formula to count how many values in range A1:A10 are greater than 100.',
        type: 'code', correctAnswer: '=COUNTIF(A1:A10, ">100")',
        difficulty: 'easy', topic: 'Formulas & Functions',
        hint: 'This uses a counting function with a criteria.',
        explanation: 'COUNTIF(range, criteria) counts cells that meet a condition. The criteria ">100" counts all cells with values greater than 100. For multiple conditions, use COUNTIFS.',
      },
      {
        id: 'excel-3', question: 'What does =IFERROR(VLOOKUP(A1, B:C, 2, FALSE), "Not Found") return when A1 is not found in column B?',
        type: 'mcq', options: ['#N/A', '"Not Found"', '0', 'TRUE'],
        correctAnswer: 1, difficulty: 'easy', topic: 'Formulas & Functions',
        explanation: 'IFERROR catches the #N/A error from VLOOKUP when the lookup value isn\'t found. Instead of displaying the error, it returns the second argument: "Not Found". This is a common pattern for graceful error handling.',
      },
      {
        id: 'excel-4', question: 'The formula =A$1 uses a mixed reference. If copied from B2 to C3, the row reference will NOT change.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'medium', topic: 'Formulas & Functions',
        explanation: 'True. In A$1, the dollar sign ($) before the row number 1 locks the row. When copied, the column letter (A) adjusts but the row (1) stays fixed. This is called a mixed cell reference.',
      },
      {
        id: 'excel-5', question: 'Write an Excel formula using nested IF to assign grades: A if score >= 90, B if >= 80, C if score is in cell A1.',
        type: 'code', correctAnswer: '=IF(A1>=90,"A",IF(A1>=80,"B","C"))',
        difficulty: 'medium', topic: 'Formulas & Functions',
        hint: 'Use IF(condition, true_result, false_result) and nest another IF for the false result.',
        explanation: 'Nested IFs evaluate from left to right. If A1 >= 90, return "A". If not, check if A1 >= 80 — if true, return "B". If neither condition is met, return "C". You can also use IFS(A1>=90,"A",A1>=80,"B",TRUE,"C").',
      },
      // Lookup & Reference (4)
      {
        id: 'excel-6', question: 'Write an Excel formula to look up a product price from a table where column A has product names (A2:A20) and column B has prices (B2:B20). The product name to find is in cell D1.',
        type: 'code', correctAnswer: '=VLOOKUP(D1, A2:B20, 2, FALSE)',
        difficulty: 'medium', topic: 'Lookup & Reference',
        hint: 'Think about VLOOKUP or XLOOKUP functions.',
        explanation: 'VLOOKUP searches for the value in D1 within the first column of A2:B20 (column A). When found, it returns the corresponding value from the 2nd column (column B). FALSE ensures an exact match. You could also use =XLOOKUP(D1, A2:A20, B2:B20).',
      },
      {
        id: 'excel-7', question: 'Which Excel function would you use to find the position of a value within a range?',
        type: 'mcq', options: ['VLOOKUP', 'MATCH', 'INDEX', 'FIND'],
        correctAnswer: 1, difficulty: 'easy', topic: 'Lookup & Reference',
        explanation: 'MATCH(lookup_value, lookup_array, [match_type]) returns the relative position of a value within a range. For example, MATCH("Apple", A1:A10, 0) returns the row number where "Apple" is found. Often combined with INDEX.',
      },
      {
        id: 'excel-8', question: 'Write a formula using INDEX and MATCH to look up the price of a product whose name is in cell D1. Product names are in A2:A20 and prices are in B2:B20.',
        type: 'code', correctAnswer: '=INDEX(B2:B20, MATCH(D1, A2:A20, 0))',
        difficulty: 'hard', topic: 'Lookup & Reference',
        hint: 'MATCH finds the position, INDEX retrieves the value at that position.',
        explanation: 'MATCH(D1, A2:A20, 0) finds the row position of D1 in the product name range. INDEX(B2:B20, position) returns the price at that row position. This INDEX-MATCH combo is more flexible than VLOOKUP — it can look left and handles column insertions better.',
      },
      {
        id: 'excel-9', question: 'XLOOKUP can search to the left of the lookup column without any workaround.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'medium', topic: 'Lookup & Reference',
        explanation: 'True. Unlike VLOOKUP, which can only search the leftmost column and return values to the right, XLOOKUP takes separate lookup_array and return_array arguments, allowing you to search in any direction.',
      },
      // Data Analysis (3)
      {
        id: 'excel-10', question: 'Given: A1:A5 = {10, 25, 30, 45, 50} and B1:B5 = {100, 200, 300, 400, 500}.\n\nWhat does =SUMIF(A1:A5, ">25", B1:B5) return?',
        type: 'mcq', options: ['600', '900', '1200', '1500'],
        correctAnswer: 2, difficulty: 'medium', topic: 'Data Analysis',
        explanation: 'SUMIF evaluates each cell in A1:A5 against the criteria ">25". Values 30, 45, and 50 pass. It sums the corresponding B values: B3(300) + B4(400) + B5(500) = 1200.',
      },
      {
        id: 'excel-11', question: 'What is the primary purpose of data validation in Excel?',
        type: 'mcq', options: [
          'To format cells with colors',
          'To restrict the type of data entered in a cell (e.g., dropdown, date range)',
          'To calculate formulas automatically',
          'To sort data in alphabetical order',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Data Analysis',
        explanation: 'Data validation restricts what users can enter in cells. Options include: whole numbers/decimals within a range, dates within a period, list (dropdown), text length limits, and custom formulas. It prevents data entry errors.',
      },
      {
        id: 'excel-12', question: 'Write an Excel formula to calculate the average of values in B2:B20 that correspond to "East" region in A2:A20.',
        type: 'code', correctAnswer: '=AVERAGEIF(A2:A20, "East", B2:B20)',
        difficulty: 'medium', topic: 'Data Analysis',
        hint: 'This function averages values that meet a condition.',
        explanation: 'AVERAGEIF(criteria_range, criteria, average_range) calculates the average of B2:B20 for rows where A2:A20 equals "East". This is the averaging counterpart to SUMIF and COUNTIF.',
      },
      // Pivot Tables (2)
      {
        id: 'excel-13', question: 'In a Pivot Table, what does dragging a field into the "Values" area typically do?',
        type: 'mcq', options: [
          'It groups data by that field',
          'It applies a filter based on that field',
          'It aggregates the field (SUM, COUNT, etc.) based on row/column groupings',
          'It sorts the pivot table by that field',
        ],
        correctAnswer: 2, difficulty: 'easy', topic: 'Pivot Tables',
        explanation: 'The Values area in a Pivot Table performs aggregations. By default, numeric fields are summed and text fields are counted. You can change the aggregation to AVERAGE, MAX, MIN, COUNT, etc. by clicking the field and selecting "Value Field Settings."',
      },
      {
        id: 'excel-14', question: 'A Pivot Table CANNOT be refreshed when the source data changes — you must recreate it entirely.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 1, difficulty: 'easy', topic: 'Pivot Tables',
        explanation: 'False. Pivot Tables can be refreshed by right-clicking and selecting "Refresh" or using the Data > Refresh All command. They automatically recalculate based on the updated source data range (especially if formatted as an Excel Table).',
      },
    ],
  },

  // ── 3. SQL (18 exercises) ─────────────────────────────────────────────────
  {
    subjectId: 'sql',
    subjectName: 'SQL',
    icon: Database,
    color: 'text-cyan-600',
    gradient: 'from-cyan-500 to-teal-600',
    subtopics: ['Basic Queries', 'Joins & Subqueries', 'Aggregation & Grouping', 'Advanced SQL'],
    exercises: [
      // Basic Queries (5)
      {
        id: 'sql-1', question: 'What does "SELECT DISTINCT department FROM employees" return?',
        type: 'mcq', options: [
          'All employees sorted by department',
          'A list of unique department names without duplicates',
          'The count of employees per department',
          'Only departments with more than one employee',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Basic Queries',
        explanation: 'DISTINCT eliminates duplicate rows from the result set. If 50 employees work in 3 departments, this query returns exactly 3 rows — one for each unique department name.',
      },
      {
        id: 'sql-2', question: 'Write a SQL query to find the highest salary from an "employees" table that has columns: id, name, department, salary.',
        type: 'code', correctAnswer: 'SELECT MAX(salary) FROM employees;',
        difficulty: 'easy', topic: 'Basic Queries',
        hint: 'Use an aggregate function to find the maximum value.',
        explanation: 'MAX() is an aggregate function that returns the highest value in a column. SELECT MAX(salary) FROM employees; returns a single row with the maximum salary value.',
      },
      {
        id: 'sql-3', question: 'Which SQL clause is used to sort the result set in descending order?',
        type: 'mcq', options: ['SORT BY DESC', 'ORDER BY DESC', 'GROUP BY DESC', 'ARRANGE BY DESC'],
        correctAnswer: 1, difficulty: 'easy', topic: 'Basic Queries',
        explanation: 'ORDER BY is the SQL clause used for sorting. Adding DESC sorts in descending order (highest to lowest). ASC is the default and sorts in ascending order. Example: SELECT * FROM employees ORDER BY salary DESC;',
      },
      {
        id: 'sql-4', question: 'The LIKE operator in SQL is case-insensitive in all major database systems (MySQL, PostgreSQL, SQL Server).',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 1, difficulty: 'medium', topic: 'Basic Queries',
        explanation: 'False. LIKE is case-sensitive in PostgreSQL. In MySQL, it depends on the collation (typically case-insensitive). SQL Server is also case-insensitive by default. Always use ILIKE (PostgreSQL) or LOWER() for guaranteed case-insensitive matching.',
      },
      {
        id: 'sql-5', question: 'Write a SQL query to find all employees whose name starts with "J" and who work in the "Sales" department.',
        type: 'code', correctAnswer: "SELECT * FROM employees WHERE name LIKE 'J%' AND department = 'Sales';",
        difficulty: 'easy', topic: 'Basic Queries',
        hint: 'Use LIKE with a wildcard for pattern matching.',
        explanation: 'The % wildcard matches any sequence of characters. LIKE \'J%\' matches any string starting with J. Combined with AND department = \'Sales\', this filters for Sales employees whose names begin with J.',
      },
      // Joins & Subqueries (4)
      {
        id: 'sql-6', question: 'Table "orders": id=1, customer="Alice", amount=150\nTable "customers": name="Alice", city="NYC"\n\nWhat does "SELECT o.id, c.city FROM orders o LEFT JOIN customers c ON o.customer = c.name" return for Alice?',
        type: 'mcq', options: ['1, NYC', '1, NULL', 'Error — columns don\'t match', '1, Alice'],
        correctAnswer: 0, difficulty: 'medium', topic: 'Joins & Subqueries',
        explanation: 'The LEFT JOIN finds a match for Alice in both tables. It returns o.id (1) and c.city (NYC). LEFT JOIN keeps all orders and matches customer info when available.',
      },
      {
        id: 'sql-7', question: 'A FULL OUTER JOIN returns all rows from both tables, matching where possible and filling with NULLs where there is no match.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'easy', topic: 'Joins & Subqueries',
        explanation: 'True. FULL OUTER JOIN combines LEFT and RIGHT joins. It returns all rows from both tables. Where there\'s a match, columns are joined; where there\'s no match, NULLs appear in the columns from the table lacking a corresponding row.',
      },
      {
        id: 'sql-8', question: 'Write a query to list all employees who earn more than the average salary in their department.',
        type: 'code', correctAnswer: 'SELECT name, salary, department FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees WHERE department = e.department);',
        difficulty: 'hard', topic: 'Joins & Subqueries',
        hint: 'Consider a correlated subquery or a window function.',
        explanation: 'This uses a correlated subquery. For each employee, the inner query calculates the average salary of that employee\'s department. The outer query compares the employee\'s salary to their department average. It could also be done with window functions.',
      },
      {
        id: 'sql-9', question: 'What will a CROSS JOIN of table A (3 rows) and table B (4 rows) produce?',
        type: 'mcq', options: ['3 rows', '4 rows', '7 rows', '12 rows'],
        correctAnswer: 3, difficulty: 'medium', topic: 'Joins & Subqueries',
        explanation: 'A CROSS JOIN produces the Cartesian product of both tables. Every row from A is combined with every row from B. So 3 × 4 = 12 rows. It has no ON clause since it matches every row with every other row.',
      },
      // Aggregation & Grouping (5)
      {
        id: 'sql-10', question: 'Write a SQL query to find departments with more than 5 employees from an "employees" table.',
        type: 'code', correctAnswer: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5;',
        difficulty: 'medium', topic: 'Aggregation & Grouping',
        hint: 'You need GROUP BY and HAVING clauses.',
        explanation: 'GROUP BY groups rows by department. COUNT(*) counts employees per department. HAVING filters the grouped results (unlike WHERE which filters individual rows). Only departments with count > 5 are returned.',
      },
      {
        id: 'sql-11', question: 'What is the difference between WHERE and HAVING in SQL?',
        type: 'mcq', options: [
          'WHERE filters rows; HAVING filters groups',
          'HAVING filters rows; WHERE filters groups',
          'They are exactly the same',
          'WHERE is only used with SELECT; HAVING is only used with UPDATE',
        ],
        correctAnswer: 0, difficulty: 'medium', topic: 'Aggregation & Grouping',
        explanation: 'WHERE filters individual rows before grouping. HAVING filters the groups created by GROUP BY. WHERE cannot use aggregate functions; HAVING can. Example: WHERE salary > 50000 filters rows, HAVING COUNT(*) > 5 filters groups.',
      },
      {
        id: 'sql-12', question: 'Which SQL function returns the number of non-NULL values in a column?',
        type: 'mcq', options: ['COUNT(*)', 'COUNT(column_name)', 'SUM(column_name)', 'NULLCOUNT(column_name)'],
        correctAnswer: 1, difficulty: 'easy', topic: 'Aggregation & Grouping',
        explanation: 'COUNT(column_name) counts only non-NULL values in that specific column. COUNT(*) counts all rows regardless of NULL values. This distinction is important when dealing with incomplete data.',
      },
      {
        id: 'sql-13', question: 'Write a query to find the total sales and average order value for each year from an "orders" table with columns: order_date, amount.',
        type: 'code', correctAnswer: 'SELECT YEAR(order_date) as order_year, SUM(amount) as total_sales, AVG(amount) as avg_order FROM orders GROUP BY YEAR(order_date);',
        difficulty: 'medium', topic: 'Aggregation & Grouping',
        hint: 'Use YEAR() to extract the year, then group by it.',
        explanation: 'YEAR(order_date) extracts the year from the date. GROUP BY YEAR(order_date) creates one group per year. SUM(amount) gives total sales and AVG(amount) gives the average order value per year.',
      },
      {
        id: 'sql-14', question: 'You can use aggregate functions in a WHERE clause to filter grouped results.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 1, difficulty: 'medium', topic: 'Aggregation & Grouping',
        explanation: 'False. Aggregate functions cannot be used in WHERE clauses. WHERE operates on individual rows before any grouping. To filter on aggregate results, you must use the HAVING clause, which operates after GROUP BY.',
      },
      // Advanced SQL (4)
      {
        id: 'sql-15', question: 'What does the window function ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) return?',
        type: 'mcq', options: [
          'The highest salary in each department',
          'A sequential rank number for each employee within their department, ordered by salary descending',
          'The total count of employees per department',
          'A running total of salaries within each department',
        ],
        correctAnswer: 1, difficulty: 'hard', topic: 'Advanced SQL',
        explanation: 'ROW_NUMBER() assigns a unique sequential integer to each row within a partition. PARTITION BY department resets the counter for each department. ORDER BY salary DESC ensures the highest-paid employee gets row number 1 in each department.',
      },
      {
        id: 'sql-16', question: 'Write a query using a CTE (Common Table Expression) to find the top 3 highest-paid employees in each department.',
        type: 'code', correctAnswer: 'WITH Ranked AS (SELECT name, department, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rn FROM employees) SELECT * FROM Ranked WHERE rn <= 3;',
        difficulty: 'hard', topic: 'Advanced SQL',
        hint: 'Use a CTE with ROW_NUMBER() and PARTITION BY.',
        explanation: 'The CTE "Ranked" assigns a row number within each department ordered by salary. The outer query filters for rn <= 3, giving the top 3 earners per department. CTEs improve readability over nested subqueries.',
      },
      {
        id: 'sql-17', question: 'A CTE (WITH clause) can be referenced multiple times in the same query.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'medium', topic: 'Advanced SQL',
        explanation: 'True. Unlike subqueries which must be repeated if used multiple times, a CTE is defined once and can be referenced multiple times in the same query. This improves readability and potentially performance (the optimizer may compute it once).',
      },
      {
        id: 'sql-18', question: 'Which of the following is a valid way to create an index on the "email" column of the "users" table?',
        type: 'mcq', options: [
          'CREATE INDEX idx_email ON users(email);',
          'ADD INDEX idx_email ON users FOR email;',
          'SET INDEX users.email = idx_email;',
          'INDEX users.email INTO idx_email;',
        ],
        correctAnswer: 0, difficulty: 'hard', topic: 'Advanced SQL',
        explanation: 'CREATE INDEX is the standard SQL syntax for creating indexes. The basic form is CREATE INDEX index_name ON table_name(column_name). Indexes speed up queries but slow down inserts/updates and consume storage.',
      },
    ],
  },

  // ── 4. Power BI (10 exercises) ────────────────────────────────────────────
  {
    subjectId: 'power-bi',
    subjectName: 'Power BI',
    icon: PieChart,
    color: 'text-yellow-600',
    gradient: 'from-yellow-500 to-orange-500',
    subtopics: ['DAX', 'Data Modeling', 'Visualizations'],
    exercises: [
      // DAX (4)
      {
        id: 'pbi-1', question: 'Which DAX measure correctly calculates Year-to-Date (YTD) total sales?',
        type: 'mcq', options: [
          'YTD Sales = CALCULATE(SUM(Sales[Amount]), DATESYTD(Date[Date]))',
          'YTD Sales = SUM(Sales[Amount]) / COUNTROWS(Sales)',
          'YTD Sales = TOTALYTD(Sales[Amount], Date[Date])',
          'Both A and C are correct',
        ],
        correctAnswer: 3, difficulty: 'medium', topic: 'DAX',
        explanation: 'Both CALCULATE(SUM(Sales[Amount]), DATESYTD(Date[Date])) and TOTALYTD(SUM(Sales[Amount]), Date[Date]) produce the same YTD result. TOTALYTD is a time intelligence shortcut. Option B calculates per-order average. Option C has a syntax error.',
      },
      {
        id: 'pbi-2', question: 'What is the difference between a calculated column and a measure in Power BI?',
        type: 'mcq', options: [
          'They are the same thing',
          'Calculated columns are evaluated once at data load; measures are evaluated at query time based on filter context',
          'Measures are evaluated at load; columns at query time',
          'Calculated columns can only be used in tables; measures can only be used in charts',
        ],
        correctAnswer: 1, difficulty: 'medium', topic: 'DAX',
        explanation: 'Calculated columns are computed once during data refresh and stored in the model, adding a new column to each row. Measures are dynamic calculations evaluated at query time for each cell in a visual, respecting filters, slicers, and groupings.',
      },
      {
        id: 'pbi-3', question: 'Write a DAX measure to calculate the percentage of total sales for the current filter context.',
        type: 'code', correctAnswer: 'Pct of Total = DIVIDE(SUM(Sales[Amount]), CALCULATE(SUM(Sales[Amount]), ALL(Sales)))',
        difficulty: 'hard', topic: 'DAX',
        hint: 'Use DIVIDE and ALL to get the grand total.',
        explanation: 'ALL(Sales) removes all filters from the Sales table, giving the grand total. CALCULATE(SUM(Sales[Amount]), ALL(Sales)) computes the overall total. DIVIDE then gives the percentage. Always use DIVIDE instead of / for safe division handling.',
      },
      {
        id: 'pbi-4', question: 'The CALCULATE function in DAX modifies the filter context of a measure expression.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'easy', topic: 'DAX',
        explanation: 'True. CALCULATE is the most powerful DAX function. It evaluates its first argument (the expression) in a modified filter context defined by the subsequent filter arguments. It can add, remove, or override filters.',
      },
      // Data Modeling (3)
      {
        id: 'pbi-5', question: 'In a star schema, what are the two main types of tables?',
        type: 'mcq', options: [
          'Parent tables and Child tables',
          'Fact tables and Dimension tables',
          'Source tables and Target tables',
          'Master tables and Transaction tables',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Data Modeling',
        explanation: 'A star schema consists of a central fact table (containing measurable business events like sales transactions) surrounded by dimension tables (containing descriptive attributes like product, customer, date). The fact table has foreign keys pointing to dimensions.',
      },
      {
        id: 'pbi-6', question: 'In Power BI data modeling, a "many-to-many" relationship between two tables should be avoided because it creates ambiguous filter propagation.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'medium', topic: 'Data Modeling',
        explanation: 'True. In Power BI, direct many-to-many relationships can lead to ambiguous filter propagation and incorrect results. Best practice is to use a bridging/junction table to split the M:M relationship into two 1:M relationships.',
      },
      {
        id: 'pbi-7', question: 'Which relationship cardinality should you set between a "Sales" fact table and a "Product" dimension table?',
        type: 'mcq', options: ['One-to-One (1:1)', 'Many-to-Many (M:M)', 'Many-to-One (M:1)', 'One-to-Many (1:M)'],
        correctAnswer: 2, difficulty: 'medium', topic: 'Data Modeling',
        explanation: 'The relationship from the Fact (Sales) table to the Dimension (Product) table should be Many-to-One. Many sales records can relate to one product. The filter direction flows from the Dimension (one side) to the Fact (many side) by default.',
      },
      // Visualizations (3)
      {
        id: 'pbi-8', question: 'Which visualization is best for showing sales performance across different product categories?',
        type: 'mcq', options: ['Line Chart', 'Pie Chart', 'Bar/Column Chart', 'Scatter Plot'],
        correctAnswer: 2, difficulty: 'easy', topic: 'Visualizations',
        explanation: 'Bar or column charts are ideal for comparing values across distinct categories. Line charts are for trends over time. Pie charts show composition. Scatter plots show relationships between two numeric variables.',
      },
      {
        id: 'pbi-9', question: 'What is the purpose of a bookmark in Power BI?',
        type: 'mcq', options: [
          'To save favorite reports for quick access',
          'To capture the current state of a report page (filters, selections, visibility) for navigation',
          'To export data to a file format',
          'To create a connection to a data source',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Visualizations',
        explanation: 'Bookmarks capture the configured view of a report page, including filters, slicers, visual states, and visibility. They enable interactive navigation, create storytelling sequences, and allow toggle buttons for different views.',
      },
      {
        id: 'pbi-10', question: 'A drill-through page in Power BI allows a user to click on a data point in one report page to navigate to a detailed page filtered to that specific context.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'easy', topic: 'Visualizations',
        explanation: 'True. Drill-through enables users to right-click (or click) a data point and navigate to a focused page that shows details for that specific item. You configure drill-through by setting field-level filters on the target page.',
      },
    ],
  },

  // ── 5. Python for Data Analytics (18 exercises) ───────────────────────────
  {
    subjectId: 'python-data-analytics',
    subjectName: 'Python',
    icon: Code,
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500',
    subtopics: ['Pandas', 'NumPy & Basics', 'Data Cleaning', 'Visualization', 'Statistics'],
    exercises: [
      // Pandas (6)
      {
        id: 'py-1', question: 'What does df.groupby("city")["sales"].sum() return given:\n\ndf = pd.DataFrame({\n  "city": ["NYC", "LA", "NYC", "LA", "NYC"],\n  "sales": [100, 200, 150, 250, 300]\n})',
        type: 'mcq', options: [
          'NYC: 550, LA: 450',
          'NYC: 100, LA: 200',
          '{NYC: [100, 150, 300], LA: [200, 250]}',
          '550',
        ],
        correctAnswer: 0, difficulty: 'easy', topic: 'Pandas',
        explanation: 'groupby("city") groups rows by city. ["sales"] selects the sales column. .sum() adds sales per group: NYC = 100+150+300 = 550, LA = 200+250 = 450. The result is a Series with city as index.',
      },
      {
        id: 'py-2', question: 'Write Pandas code to filter rows where the "age" column is greater than 30 from DataFrame df.',
        type: 'code', correctAnswer: 'df[df["age"] > 30]',
        difficulty: 'easy', topic: 'Pandas',
        hint: 'Use boolean indexing with square brackets.',
        explanation: 'df["age"] > 30 creates a boolean Series (True/False for each row). Wrapping it in df[...] filters the DataFrame to only rows where the condition is True. This is called boolean indexing in Pandas.',
      },
      {
        id: 'py-3', question: 'Which Pandas method is used to handle missing values by filling them with a specified value?',
        type: 'mcq', options: ['dropna()', 'fillna()', 'replace()', 'isnull()'],
        correctAnswer: 1, difficulty: 'easy', topic: 'Pandas',
        explanation: 'fillna(value) replaces NaN/null values with the specified value. For example, df.fillna(0) replaces all NaN with 0. dropna() removes rows with NaN. isnull() returns a boolean mask. replace() replaces specific values.',
      },
      {
        id: 'py-4', question: 'What is the output of: pd.merge(df1, df2, on="id", how="inner") when df1 has ids [1,2,3] and df2 has ids [2,3,4]?',
        type: 'mcq', options: [
          '3 rows (ids 1, 2, 3)',
          '2 rows (ids 2, 3 only)',
          '4 rows (ids 1, 2, 3, 4)',
          '0 rows',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Pandas',
        explanation: 'INNER JOIN returns only rows where the "id" exists in BOTH DataFrames. The common IDs are 2 and 3, so the result has 2 rows. IDs 1 (only in df1) and 4 (only in df2) are excluded.',
      },
      {
        id: 'py-5', question: 'Write Pandas code to create a new column "total" that is the sum of columns "price" and "tax" in DataFrame df.',
        type: 'code', correctAnswer: 'df["total"] = df["price"] + df["tax"]',
        difficulty: 'easy', topic: 'Pandas',
        hint: 'Use column addition with the assignment operator.',
        explanation: 'In Pandas, you can perform element-wise arithmetic operations on columns directly. df["price"] + df["tax"] creates a new Series with element-wise sums, which is then assigned to a new column "total".',
      },
      {
        id: 'py-6', question: 'What does df.describe() show for a DataFrame with numeric columns?',
        type: 'mcq', options: [
          'Only column data types',
          'Count, mean, std, min, quartiles, and max',
          'First 5 rows of data',
          'Only missing value counts',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Pandas',
        explanation: 'describe() generates descriptive statistics for numeric columns: count (non-null), mean, standard deviation, min, 25th percentile (Q1), median (50%), 75th percentile (Q3), and max. Use df.describe(include="all") for categorical columns too.',
      },
      // NumPy & Basics (4)
      {
        id: 'py-7', question: 'What is the output of: np.array([1, 2, 3]) * np.array([4, 5, 6])?',
        type: 'mcq', options: ['[5, 7, 9]', '[4, 10, 18]', '[1, 2, 3, 4, 5, 6]', 'Error — shapes don\'t match'],
        correctAnswer: 1, difficulty: 'easy', topic: 'NumPy & Basics',
        explanation: 'NumPy performs element-wise multiplication on arrays of the same shape: [1×4, 2×5, 3×6] = [4, 10, 18]. This is one of NumPy\'s key advantages over Python lists — vectorized operations without loops.',
      },
      {
        id: 'py-8', question: 'Write NumPy code to create a 3×3 identity matrix.',
        type: 'code', correctAnswer: 'np.eye(3)',
        difficulty: 'easy', topic: 'NumPy & Basics',
        hint: 'There\'s a specific NumPy function for identity matrices.',
        explanation: 'np.eye(n) creates an n×n identity matrix (1s on the main diagonal, 0s elsewhere). Alternatively, np.identity(3) does the same thing. Identity matrices are fundamental in linear algebra.',
      },
      {
        id: 'py-9', question: 'In Python, a list comprehension like [x**2 for x in range(5)] produces the same result as using a for loop to append squared values to a list.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'easy', topic: 'NumPy & Basics',
        explanation: 'True. [x**2 for x in range(5)] produces [0, 1, 4, 9, 16], which is equivalent to creating an empty list, looping through range(5), squaring each value, and appending. List comprehensions are more concise and typically faster.',
      },
      {
        id: 'py-10', question: 'What does np.arange(0, 10, 2) produce?',
        type: 'mcq', options: ['[0, 2, 4, 6, 8, 10]', '[0, 2, 4, 6, 8]', '[2, 4, 6, 8, 10]', '[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]'],
        correctAnswer: 1, difficulty: 'easy', topic: 'NumPy & Basics',
        explanation: 'np.arange(start, stop, step) creates an array from start (inclusive) to stop (exclusive) with the given step. So np.arange(0, 10, 2) = [0, 2, 4, 6, 8]. The stop value 10 is NOT included.',
      },
      // Data Cleaning (3)
      {
        id: 'py-11', question: 'Write Pandas code to remove all rows that contain any NaN value from DataFrame df.',
        type: 'code', correctAnswer: 'df.dropna()',
        difficulty: 'easy', topic: 'Data Cleaning',
        hint: 'There is a simple one-method call for this.',
        explanation: 'df.dropna() removes all rows containing at least one NaN/missing value. For more control: df.dropna(subset=["column_name"]) removes rows with NaN in a specific column, and df.dropna(thresh=2) keeps rows with at least 2 non-null values.',
      },
      {
        id: 'py-12', question: 'Write Pandas code to convert all values in the "category" column to lowercase.',
        type: 'code', correctAnswer: 'df["category"] = df["category"].str.lower()',
        difficulty: 'medium', topic: 'Data Cleaning',
        hint: 'Use the string accessor .str on the column.',
        explanation: 'The .str accessor provides string manipulation methods for Pandas Series. .str.lower() converts all strings to lowercase. Other useful methods: .str.upper(), .str.strip(), .str.replace(), .str.contains().',
      },
      {
        id: 'py-13', question: 'The df.duplicated() method returns a boolean Series where True indicates a row that is an exact duplicate of a previously seen row.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'medium', topic: 'Data Cleaning',
        explanation: 'True. df.duplicated() marks subsequent duplicates as True while keeping the first occurrence as False. Use df.drop_duplicates() to remove them. The subset parameter lets you check for duplicates based on specific columns only.',
      },
      // Visualization (3)
      {
        id: 'py-14', question: 'Which Python library is best for creating publication-quality static plots with fine-grained control over every element?',
        type: 'mcq', options: ['Seaborn', 'Matplotlib', 'Plotly', 'Bokeh'],
        correctAnswer: 1, difficulty: 'easy', topic: 'Visualization',
        explanation: 'Matplotlib is the foundational plotting library in Python, offering complete control over every plot element (axes, labels, ticks, colors, annotations). Seaborn builds on Matplotlib for statistical plots. Plotly/Bokeh are for interactive visualizations.',
      },
      {
        id: 'py-15', question: 'Write Matplotlib code to create a bar chart showing categories ["A", "B", "C"] with values [10, 25, 15].',
        type: 'code', correctAnswer: 'plt.bar(["A", "B", "C"], [10, 25, 15])',
        difficulty: 'easy', topic: 'Visualization',
        hint: 'Use the bar function with two arguments.',
        explanation: 'plt.bar(x, height) creates a vertical bar chart. The first argument is the category labels, the second is the bar heights. Add plt.xlabel(), plt.ylabel(), plt.title() for labels, and plt.show() to display.',
      },
      {
        id: 'py-16', question: 'Seaborn\'s heatmap function is particularly useful for visualizing a __________.',
        type: 'shortanswer', correctAnswer: 'correlation matrix',
        difficulty: 'medium', topic: 'Visualization',
        hint: 'Think about what shows relationships between multiple numeric variables.',
        explanation: 'Seaborn heatmaps are commonly used to visualize correlation matrices (df.corr()). Each cell\'s color intensity represents the strength of correlation between two variables. This is a key step in exploratory data analysis for understanding feature relationships.',
      },
      // Statistics (2)
      {
        id: 'py-17', question: 'In hypothesis testing, a p-value less than 0.05 typically means you should reject the null hypothesis.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'medium', topic: 'Statistics',
        explanation: 'True. The p-value represents the probability of observing the test results (or more extreme) assuming the null hypothesis is true. A p-value < 0.05 (the significance level) means there\'s strong evidence against the null hypothesis, so we reject it.',
      },
      {
        id: 'py-18', question: 'What is the difference between the mean and the median?',
        type: 'mcq', options: [
          'There is no difference',
          'The mean is the sum divided by count; the median is the middle value when sorted',
          'The mean is the middle value; the median is the most frequent value',
          'The mean is always larger than the median',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Statistics',
        explanation: 'Mean = sum of all values / count. Median = middle value when data is sorted (or average of two middle values for even count). The median is more robust to outliers. For skewed data, mean and median can differ significantly.',
      },
    ],
  },

  // ── 6. Data Warehousing (10 exercises) ────────────────────────────────────
  {
    subjectId: 'data-warehousing',
    subjectName: 'Data Warehousing',
    icon: Warehouse,
    color: 'text-teal-600',
    gradient: 'from-teal-500 to-cyan-600',
    subtopics: ['Concepts & Architecture', 'Dimensional Modeling', 'ETL & Cloud'],
    exercises: [
      // Concepts & Architecture (4)
      {
        id: 'dw-1', question: 'What is the primary purpose of a data warehouse?',
        type: 'mcq', options: [
          'To serve as the primary transactional database for a company',
          'To consolidate data from multiple sources for reporting and analysis',
          'To replace all operational databases',
          'To store only real-time streaming data',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Concepts & Architecture',
        explanation: 'A data warehouse is a centralized repository designed specifically for query, analysis, and reporting. It consolidates data from multiple heterogeneous sources (databases, APIs, flat files) into a single, consistent format optimized for analytics.',
      },
      {
        id: 'dw-2', question: 'Which of the following best describes the difference between a data warehouse and a data mart?',
        type: 'mcq', options: [
          'A data warehouse is smaller and focused; a data mart is enterprise-wide',
          'A data warehouse is enterprise-wide; a data mart is a subset focused on a specific department',
          'They are exactly the same thing',
          'A data warehouse stores real-time data; a data mart stores historical data',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Concepts & Architecture',
        explanation: 'A data warehouse covers the entire organization. A data mart is a subset of the data warehouse focused on a specific business area (e.g., sales, finance, marketing). Data marts provide faster queries for departmental needs.',
      },
      {
        id: 'dw-3', question: 'A data warehouse is optimized for read-heavy analytical queries, while an OLTP database is optimized for write-heavy transactional operations.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'medium', topic: 'Concepts & Architecture',
        explanation: 'True. Data warehouses use denormalized schemas (star/snowflake) optimized for complex read queries across large datasets. OLTP databases use normalized schemas (3NF) optimized for fast inserts, updates, and individual record lookups.',
      },
      {
        id: 'dw-4', question: 'What does ODS stand for in data warehousing?',
        type: 'shortanswer', correctAnswer: 'operational data store',
        difficulty: 'medium', topic: 'Concepts & Architecture',
        hint: 'It\'s a type of data store used for operational reporting.',
        explanation: 'ODS (Operational Data Store) is a complementary data store to the data warehouse. It integrates data from multiple sources for operational reporting. Unlike a data warehouse, an ODS is updated in near real-time and is more current but less optimized for complex analytics.',
      },
      // Dimensional Modeling (3)
      {
        id: 'dw-5', question: 'In a star schema, the central table is called a __________ table.',
        type: 'shortanswer', correctAnswer: 'fact',
        difficulty: 'easy', topic: 'Dimensional Modeling',
        hint: 'It contains measurable, quantitative data about business events.',
        explanation: 'The fact table is the central table in a star schema, containing measurable business metrics (facts) like sales amount, quantity, discount. It has foreign keys pointing to dimension tables. Fact tables are typically long and narrow with many rows but few columns.',
      },
      {
        id: 'dw-6', question: 'What is the key difference between a star schema and a snowflake schema?',
        type: 'mcq', options: [
          'A star schema has no fact table',
          'A snowflake schema normalizes dimension tables into multiple related tables',
          'A snowflake schema has no dimension tables',
          'They use completely different database systems',
        ],
        correctAnswer: 1, difficulty: 'medium', topic: 'Dimensional Modeling',
        explanation: 'In a star schema, dimension tables are denormalized (flat). In a snowflake schema, dimension tables are normalized into multiple related tables, creating a snowflake-like pattern. Star schemas are simpler and faster for queries; snowflake schemas save storage but require more joins.',
      },
      {
        id: 'dw-7', question: 'SCD Type 2 is used when you need to track __________ in dimension data.',
        type: 'shortanswer', correctAnswer: 'historical changes',
        difficulty: 'hard', topic: 'Dimensional Modeling',
        hint: 'Think about tracking what changed over time.',
        explanation: 'SCD Type 2 tracks historical changes by adding new rows with effective date ranges (start_date, end_date, is_current). When a dimension attribute changes, a new row is inserted rather than updating the existing row. This allows you to reconstruct the dimension state at any point in time.',
      },
      // ETL & Cloud (3)
      {
        id: 'dw-8', question: 'What is the main difference between ETL and ELT?',
        type: 'mcq', options: [
          'ETL transforms data before loading; ELT loads raw data first then transforms inside the target system',
          'ETL and ELT are identical processes',
          'ETL is for small data; ELT is for big data only',
          'ETL uses SQL; ELT uses Python',
        ],
        correctAnswer: 0, difficulty: 'medium', topic: 'ETL & Cloud',
        explanation: 'ETL (Extract, Transform, Load) transforms data in a staging area before loading into the warehouse. ELT (Extract, Load, Transform) loads raw data into the target system first, then uses the warehouse\'s compute power to transform. ELT is preferred in modern cloud architectures.',
      },
      {
        id: 'dw-9', question: 'Which cloud data warehouse separates storage and compute, allowing you to scale them independently?',
        type: 'mcq', options: ['Amazon Redshift (classic)', 'Google BigQuery', 'Traditional Oracle DW', 'Microsoft Access'],
        correctAnswer: 1, difficulty: 'hard', topic: 'ETL & Cloud',
        hint: 'This Google Cloud platform decouples storage from compute.',
        explanation: 'Google BigQuery uses a serverless architecture that separates storage and compute. You can independently scale storage capacity and query compute power. BigQuery charges by data stored and bytes processed, making it cost-effective for variable workloads.',
      },
      {
        id: 'dw-10', question: 'Snowflake\'s unique architecture uses a multi-cluster shared data format that separates compute, storage, and services layers.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'hard', topic: 'ETL & Cloud',
        explanation: 'True. Snowflake\'s architecture has three layers: Storage (columnar format on cloud storage), Compute (virtual warehouses that scale independently), and Cloud Services (metadata, query optimization, access control). This enables near-zero maintenance and independent scaling.',
      },
    ],
  },

  // ── 7. Databricks & Apache Spark (10 exercises) ──────────────────────────
  {
    subjectId: 'databricks-spark',
    subjectName: 'Databricks',
    icon: Zap,
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-red-500',
    subtopics: ['Spark Fundamentals', 'Delta Lake', 'MLflow & Workflows'],
    exercises: [
      // Spark Fundamentals (4)
      {
        id: 'dbx-1', question: 'What is the fundamental unit of data in Apache Spark?',
        type: 'mcq', options: ['DataFrame', 'RDD', 'Dataset', 'Partition'],
        correctAnswer: 1, difficulty: 'medium', topic: 'Spark Fundamentals',
        explanation: 'RDD (Resilient Distributed Dataset) is the fundamental data structure in Spark — an immutable, distributed collection of objects. DataFrames and Datasets are built on top of RDDs. RDDs provide fault tolerance through lineage (they remember how they were created).',
      },
      {
        id: 'dbx-2', question: 'Apache Spark processes data in parallel across multiple nodes using a concept called __________.',
        type: 'shortanswer', correctAnswer: 'partitions',
        difficulty: 'medium', topic: 'Spark Fundamentals',
        hint: 'Data is divided into chunks distributed across the cluster.',
        explanation: 'Spark divides data into partitions, which are distributed across cluster nodes. Each partition is processed independently in parallel. The number of partitions affects parallelism: too few = underutilized cluster, too many = scheduling overhead. Default is typically based on input file splits.',
      },
      {
        id: 'dbx-3', question: 'In Spark, a transformation (like filter, select) is immediately executed and returns a result.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 1, difficulty: 'easy', topic: 'Spark Fundamentals',
        explanation: 'False. Spark transformations are lazy — they build up a directed acyclic graph (DAG) of operations but don\'t execute until an action (like count(), collect(), write()) is called. This allows Spark to optimize the execution plan.',
      },
      {
        id: 'dbx-4', question: 'Which of the following is an ACTION in Spark (not a transformation)?',
        type: 'mcq', options: ['filter()', 'select()', 'groupBy()', 'collect()'],
        correctAnswer: 3, difficulty: 'easy', topic: 'Spark Fundamentals',
        explanation: 'Actions trigger actual computation and return results or write data. collect() brings all data to the driver. Other actions: count(), show(), take(), write(), first(). Transformations like filter(), select(), groupBy() are lazy and return new DataFrames.',
      },
      // Delta Lake (3)
      {
        id: 'dbx-5', question: 'What is Delta Lake\'s main advantage over standard Parquet files on cloud storage?',
        type: 'mcq', options: [
          'Delta Lake is faster than Parquet for all operations',
          'Delta Lake adds ACID transactions, time travel, and schema enforcement on top of Parquet',
          'Delta Lake uses a proprietary file format instead of Parquet',
          'Delta Lake does not support cloud storage',
        ],
        correctAnswer: 1, difficulty: 'medium', topic: 'Delta Lake',
        explanation: 'Delta Lake is an open-source storage layer that brings ACID transactions (reliable reads/writes), time travel (query previous versions), schema enforcement (prevent bad data), and MERGE operations to data lake storage. It uses Parquet as its underlying format plus a transaction log.',
      },
      {
        id: 'dbx-6', question: 'Delta Lake time travel allows you to query previous versions of a table by specifying a __________ or a __________.',
        type: 'mcq', options: [
          'Row number, Column name',
          'Version number, Timestamp',
          'File path, Schema name',
          'Partition key, Bucket number',
        ],
        correctAnswer: 1, difficulty: 'medium', topic: 'Delta Lake',
        explanation: 'Delta Lake\'s transaction log (DeltaLog) records every change. You can time travel using VERSION AS OF (a specific version number) or TIMESTAMP AS OF (a specific timestamp). Example: SELECT * FROM table VERSION AS OF 5;',
      },
      {
        id: 'dbx-7', question: 'The VACUUM command in Delta Lake removes old files that are no longer referenced by the Delta table.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'hard', topic: 'Delta Lake',
        explanation: 'True. VACUUM removes data files that are no longer tracked by the Delta transaction log (older than the retention period, default 7 days). It helps reclaim storage. However, running VACUUM may break time travel to versions older than the retention period.',
      },
      // MLflow & Workflows (3)
      {
        id: 'dbx-8', question: 'What is the primary purpose of MLflow in the Databricks ecosystem?',
        type: 'mcq', options: [
          'To create dashboards and visual reports',
          'To manage the end-to-end machine learning lifecycle: experiments, models, and deployment',
          'To ingest streaming data from external sources',
          'To schedule ETL pipelines',
        ],
        correctAnswer: 1, difficulty: 'medium', topic: 'MLflow & Workflows',
        explanation: 'MLflow is an open-source platform for managing the ML lifecycle. It provides: Experiment Tracking (log parameters, metrics), Model Registry (version, stage, deploy models), Projects (package code), and Model Serving (deploy as REST endpoints).',
      },
      {
        id: 'dbx-9', question: 'In Databricks, a Job is a scheduled or on-demand task that runs one or more __________.',
        type: 'shortanswer', correctAnswer: 'notebooks',
        difficulty: 'easy', topic: 'MLflow & Workflows',
        hint: 'These are the interactive documents used in Databricks for development.',
        explanation: 'In Databricks, Jobs run notebooks (or Python/Scala/JAR tasks) on a schedule or on-demand. Jobs can be multi-task workflows with dependencies between tasks. They integrate with notification systems, run monitoring, and CI/CD pipelines.',
      },
      {
        id: 'dbx-10', question: 'Databricks notebooks support collaboration between data engineers, data scientists, and analysts through multi-language support and __________.',
        type: 'shortanswer', correctAnswer: 'comments or real-time collaboration',
        difficulty: 'easy', topic: 'MLflow & Workflows',
        hint: 'Think about how multiple people can work together on the same notebook.',
        explanation: 'Databricks notebooks support Python, Scala, SQL, R in the same notebook. They also feature real-time collaboration (multiple users can edit simultaneously), comments, version history, and markdown cells for documentation. This makes them ideal for cross-functional data teams.',
      },
    ],
  },

  // ── 8. Advanced / Modern Topics (10 exercises) ────────────────────────────
  {
    subjectId: 'advanced-modern-topics',
    subjectName: 'Advanced',
    icon: Rocket,
    color: 'text-rose-600',
    gradient: 'from-rose-500 to-pink-600',
    subtopics: ['Cloud & DevOps', 'Real-Time Analytics', 'AI & Data Engineering'],
    exercises: [
      // Cloud & DevOps (3)
      {
        id: 'adv-1', question: 'In cloud data services, what does "serverless" computing mean?',
        type: 'mcq', options: [
          'There are no physical servers involved',
          'You don\'t manage infrastructure; the cloud provider auto-scales compute based on workload',
          'The service is free of charge',
          'Data is stored only in memory',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Cloud & DevOps',
        explanation: 'Serverless doesn\'t mean no servers — it means you don\'t manage them. The cloud provider automatically provisions, scales, and manages infrastructure. You pay only for what you use (e.g., compute time, data processed). Examples: AWS Lambda, BigQuery, Snowflake serverless.',
      },
      {
        id: 'adv-2', question: 'DataOps applies DevOps principles (CI/CD, automation, monitoring) to data pipelines and analytics workflows.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'medium', topic: 'Cloud & DevOps',
        explanation: 'True. DataOps brings DevOps practices to data management: automated testing for data quality, version control for data pipelines, CI/CD for analytics code, monitoring for pipeline health, and collaboration between data engineers, analysts, and scientists.',
      },
      {
        id: 'adv-3', question: 'Which tool is specifically designed for SQL-based data transformation and is commonly used in modern data stacks?',
        type: 'mcq', options: ['Apache Airflow', 'dbt (data build tool)', 'Apache Kafka', 'MLflow'],
        correctAnswer: 1, difficulty: 'medium', topic: 'Cloud & DevOps',
        explanation: 'dbt (data build tool) enables analysts and engineers to transform data using SQL SELECT statements. It handles dependencies between models, enables version control, testing, and documentation. dbt has become a cornerstone of the modern data stack.',
      },
      // Real-Time Analytics (3)
      {
        id: 'adv-4', question: 'What is the primary function of Apache Kafka in a data architecture?',
        type: 'mcq', options: [
          'Data visualization and dashboarding',
          'Distributed event streaming platform for real-time data pipelines',
          'Batch data processing at scale',
          'Machine learning model training',
        ],
        correctAnswer: 1, difficulty: 'medium', topic: 'Real-Time Analytics',
        explanation: 'Apache Kafka is a distributed event streaming platform that acts as a message broker between producers and consumers. It handles real-time data feeds with high throughput, low latency, and fault tolerance. Common use cases: event sourcing, log aggregation, real-time analytics.',
      },
      {
        id: 'adv-5', question: 'Lambda Architecture combines batch processing and stream processing to handle both historical and real-time data.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'hard', topic: 'Real-Time Analytics',
        explanation: 'True. Lambda Architecture has three layers: Batch Layer (processes all historical data for accurate results), Speed/Stream Layer (processes real-time data for low-latency results), and Serving Layer (merges batch and stream views). Kappa Architecture simplifies this by using only stream processing.',
      },
      {
        id: 'adv-6', question: 'What is the main difference between batch processing and stream processing?',
        type: 'mcq', options: [
          'Batch processing is always more accurate',
          'Batch processes collected data in large chunks over intervals; stream processes data continuously as it arrives',
          'Stream processing uses less memory than batch processing',
          'There is no difference in modern systems',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'Real-Time Analytics',
        explanation: 'Batch processing collects data over a period and processes it all at once (e.g., nightly ETL). Stream processing handles data continuously as it arrives (e.g., real-time fraud detection). Batch offers high throughput and accuracy; stream offers low latency.',
      },
      // AI & Data Engineering (4)
      {
        id: 'adv-7', question: 'What is A/B testing in the context of data analytics?',
        type: 'mcq', options: [
          'Testing two versions of software for bugs',
          'Comparing two or more versions of something (webpage, product, email) to determine which performs better',
          'Running the same analysis twice to verify results',
          'Testing data quality with automated scripts',
        ],
        correctAnswer: 1, difficulty: 'easy', topic: 'AI & Data Engineering',
        explanation: 'A/B testing (split testing) randomly assigns users to different versions (A and B) and measures which performs better on key metrics (click-through rate, conversion, revenue). It\'s the gold standard for data-driven decision making in product development and marketing.',
      },
      {
        id: 'adv-8', question: 'AutoML (Automated Machine Learning) refers to the process of __________.',
        type: 'shortanswer', correctAnswer: 'automating the machine learning pipeline',
        difficulty: 'medium', topic: 'AI & Data Engineering',
        hint: 'Think about automating feature engineering, model selection, and hyperparameter tuning.',
        explanation: 'AutoML automates the end-to-end ML workflow: feature engineering, model selection, hyperparameter tuning, and model evaluation. Tools like Google AutoML, H2O.ai, and Azure AutoML enable non-experts to build ML models while accelerating expert workflows.',
      },
      {
        id: 'adv-9', question: 'Which version control system is the industry standard for data teams to collaborate on code, SQL queries, and pipeline configurations?',
        type: 'mcq', options: ['SVN', 'Mercurial', 'Git', 'CVS'],
        correctAnswer: 2, difficulty: 'easy', topic: 'AI & Data Engineering',
        explanation: 'Git is the dominant version control system. Data teams use Git/GitHub/GitLab to version control SQL queries, Python notebooks, pipeline configurations, and dbt models. Branching enables experimentation, pull requests enable code review, and CI/CD enables automated testing.',
      },
      {
        id: 'adv-10', question: 'Data storytelling combines data visualization, narrative, and context to make analytical findings accessible and actionable for non-technical stakeholders.',
        type: 'truefalse', options: ['True', 'False'], correctAnswer: 0, difficulty: 'easy', topic: 'AI & Data Engineering',
        explanation: 'True. Data storytelling is a critical skill for analysts. It goes beyond charts to include: a clear narrative (what happened and why), relevant context (benchmarks, trends), and actionable insights (what should we do). It bridges the gap between analysis and business decisions.',
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function PracticeView() {
  const store = useProgressStore();
  const practiceScores = store.practiceScores || {};
  const setPracticeScore = store.setPracticeScore;

  const [activeSubject, setActiveSubject] = useState(0);
  const [activeSubtopic, setActiveSubtopic] = useState<string>('All');
  const [exerciseStates, setExerciseStates] = useState<Record<string, { userAnswer: string | number; submitted: boolean; showSolution: boolean }>>({});
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [shuffleKey, setShuffleKey] = useState(0);

  const currentSubject = subjectsData[activeSubject];
  const subjectScore = practiceScores[currentSubject.subjectId] || 0;

  // Filtered & shuffled exercises
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const displayExercises = useMemo(() => {
    const filtered = activeSubtopic === 'All'
      ? currentSubject.exercises
      : currentSubject.exercises.filter((e) => e.topic === activeSubtopic);
    return shuffleArray(filtered);
  }, [activeSubject, activeSubtopic, shuffleKey]);

  const getExerciseState = useCallback(
    (id: string) => exerciseStates[id] || { userAnswer: '', submitted: false, showSolution: false },
    [exerciseStates]
  );

  const updateExerciseState = useCallback(
    (id: string, updates: Partial<{ userAnswer: string | number; submitted: boolean; showSolution: boolean }>) => {
      setExerciseStates((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || { userAnswer: '', submitted: false, showSolution: false }), ...updates },
      }));
    },
    []
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpandedExercises((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isAnswerCorrect = useCallback((exercise: Exercise, id: string) => {
    const state = getExerciseState(id);
    if (!state.submitted) return false;
    if (exercise.type === 'mcq' || exercise.type === 'truefalse') {
      return Number(state.userAnswer) === exercise.correctAnswer;
    }
    return state.userAnswer.toString().trim().toLowerCase() === exercise.correctAnswer.toString().trim().toLowerCase();
  }, [getExerciseState]);

  const checkAnswer = useCallback(
    (exercise: Exercise, id: string) => {
      const state = getExerciseState(id);
      if (state.userAnswer === '') return;
      updateExerciseState(id, { submitted: true });
    },
    [getExerciseState, updateExerciseState]
  );

  const handleCodeSubmit = useCallback(
    (exercise: Exercise, id: string, answer: string) => {
      updateExerciseState(id, { userAnswer: answer });
      updateExerciseState(id, { submitted: true, showSolution: true });
    },
    [updateExerciseState]
  );

  const handleShuffle = useCallback(() => {
    setShuffleKey((k) => k + 1);
  }, []);

  const resetSubject = useCallback(() => {
    const subject = currentSubject;
    setExerciseStates((prev) => {
      const next = { ...prev };
      subject.exercises.forEach((ex) => delete next[ex.id]);
      return next;
    });
    setExpandedExercises((prev) => {
      const next = { ...prev };
      subject.exercises.forEach((ex) => delete next[ex.id]);
      return next;
    });
    setShuffleKey((k) => k + 1);
  }, [currentSubject]);

  const completedCount = currentSubject.exercises.filter((ex) => getExerciseState(ex.id).submitted).length;

  const correctCount = currentSubject.exercises.filter((ex) => isAnswerCorrect(ex, ex.id)).length;

  // Update practice score when completed
  React.useEffect(() => {
    if (completedCount > 0) {
      const pct = Math.round((correctCount / currentSubject.exercises.length) * 100);
      setPracticeScore(currentSubject.subjectId, pct);
    }
  }, [completedCount, correctCount, currentSubject.subjectId, currentSubject.exercises.length, setPracticeScore]);

  const totalExercises = currentSubject.exercises.length;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4 shadow-lg shadow-emerald-500/20"
        >
          <Dumbbell className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold">Practice Exercises</h2>
        <p className="text-muted-foreground mt-1">{totalExercises}+ exercises across 8 subjects</p>
      </div>

      {/* Subject Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {subjectsData.map((subject, index) => {
          const Icon = subject.icon;
          const score = practiceScores[subject.subjectId] || 0;
          const isActive = activeSubject === index;
          return (
            <motion.div key={subject.subjectId} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                onClick={() => {
                  setActiveSubject(index);
                  setActiveSubtopic('All');
                  setShuffleKey((k) => k + 1);
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2',
                  isActive
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md'
                    : 'border-transparent bg-muted/50 hover:bg-muted'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-emerald-600' : 'text-muted-foreground')} />
                <span className={isActive ? 'text-emerald-700' : 'text-muted-foreground'}>{subject.subjectName}</span>
                {score > 0 && (
                  <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30">
                    {score}%
                  </Badge>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar & Controls */}
      <motion.div
        key={`prog-${activeSubject}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = currentSubject.icon;
                return <Icon className={cn('w-5 h-5', currentSubject.color)} />;
              })()}
              <span className="text-sm font-semibold">{currentSubject.subjectName}</span>
              <Badge variant="outline" className="text-xs">{totalExercises} exercises</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShuffle} className="text-xs h-7 gap-1">
                <Shuffle className="w-3 h-3" />
                Shuffle
              </Button>
              {completedCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetSubject} className="text-xs h-7 gap-1">
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
              )}
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full bg-gradient-to-r', currentSubject.gradient)}
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalExercises) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{completedCount}/{totalExercises} completed</span>
            {correctCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-muted-foreground">
                  {correctCount}/{completedCount} correct ({Math.round((correctCount / completedCount) * 100)}% accuracy)
                </span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Subtopic Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubtopic('All')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
            activeSubtopic === 'All'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
              : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
        >
          All ({currentSubject.exercises.length})
        </button>
        {currentSubject.subtopics.map((sub) => {
          const count = currentSubject.exercises.filter((e) => e.topic === sub).length;
          return (
            <button
              key={sub}
              onClick={() => {
                setActiveSubtopic(sub);
                setShuffleKey((k) => k + 1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                activeSubtopic === sub
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {sub} ({count})
            </button>
          );
        })}
      </div>

      {/* Exercises List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`exercises-${activeSubject}-${activeSubtopic}-${shuffleKey}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-3"
        >
          {displayExercises.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground text-sm">No exercises found for this filter.</p>
            </Card>
          ) : (
            displayExercises.map((exercise, index) => {
              const state = getExerciseState(exercise.id);
              const isExpanded = expandedExercises[exercise.id] || false;
              const isCorrect = isAnswerCorrect(exercise, exercise.id);

              return (
                <Card
                  key={exercise.id}
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    state.submitted && isCorrect && 'border-emerald-300 dark:border-emerald-700',
                    state.submitted && !isCorrect && 'border-rose-300 dark:border-rose-700'
                  )}
                >
                  {/* Exercise Header */}
                  <button
                    className="w-full text-left p-4 flex items-start gap-3"
                    onClick={() => toggleExpanded(exercise.id)}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0 mt-0.5',
                        state.submitted
                          ? isCorrect
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {state.submitted ? (isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />) : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{exercise.question.split('\n')[0]}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs">{typeLabel(exercise.type)}</Badge>
                        <DifficultyBadge difficulty={exercise.difficulty} />
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">{exercise.topic}</Badge>
                        {state.submitted && (
                          <Badge variant="secondary" className={cn('text-xs', isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30')}>
                            {isCorrect ? 'Correct' : 'Review'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                          {/* Full Question */}
                          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{exercise.question}</p>

                          {/* Hint */}
                          {exercise.hint && !state.submitted && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-700 dark:text-amber-400">{exercise.hint}</p>
                            </div>
                          )}

                          {/* MCQ Options */}
                          {(exercise.type === 'mcq') && exercise.options && (
                            <div className="space-y-2">
                              {exercise.options.map((option, optIdx) => (
                                <button
                                  key={optIdx}
                                  disabled={state.submitted}
                                  onClick={() => updateExerciseState(exercise.id, { userAnswer: optIdx })}
                                  className={cn(
                                    'w-full text-left p-3 rounded-xl border-2 text-sm transition-all duration-200 flex items-start gap-3',
                                    state.submitted
                                      ? optIdx === exercise.correctAnswer
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                        : Number(state.userAnswer) === optIdx
                                          ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30'
                                          : 'border-border opacity-50'
                                      : Number(state.userAnswer) === optIdx
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                        : 'border-border hover:border-emerald-300 hover:bg-muted/50'
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 mt-0.5',
                                      state.submitted
                                        ? optIdx === exercise.correctAnswer
                                          ? 'bg-emerald-500 text-white'
                                          : 'bg-muted text-muted-foreground'
                                        : Number(state.userAnswer) === optIdx
                                          ? 'bg-emerald-500 text-white'
                                          : 'bg-muted text-muted-foreground'
                                    )}
                                  >
                                    {state.submitted && optIdx === exercise.correctAnswer ? <CheckCircle2 className="w-3 h-3" /> : String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{option}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* True/False Options */}
                          {exercise.type === 'truefalse' && (
                            <div className="flex gap-3">
                              {['True', 'False'].map((label, optIdx) => (
                                <button
                                  key={label}
                                  disabled={state.submitted}
                                  onClick={() => updateExerciseState(exercise.id, { userAnswer: optIdx })}
                                  className={cn(
                                    'flex-1 p-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2',
                                    state.submitted
                                      ? optIdx === exercise.correctAnswer
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700'
                                        : Number(state.userAnswer) === optIdx
                                          ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-700'
                                          : 'border-border opacity-50'
                                      : Number(state.userAnswer) === optIdx
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700'
                                        : 'border-border hover:border-emerald-300 hover:bg-muted/50'
                                  )}
                                >
                                  {optIdx === 0 ? (
                                    state.submitted && optIdx === exercise.correctAnswer ? (
                                      <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                      <CheckCircle2 className="w-5 h-5" />
                                    )
                                  ) : (
                                    <XCircle className="w-5 h-5" />
                                  )}
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Code Input (textarea) */}
                          {exercise.type === 'code' && (
                            <div className="space-y-3">
                              <Textarea
                                value={typeof state.userAnswer === 'string' ? state.userAnswer : ''}
                                onChange={(e) => updateExerciseState(exercise.id, { userAnswer: e.target.value })}
                                placeholder="Type your code answer..."
                                disabled={state.submitted}
                                className="font-mono text-sm min-h-[80px] bg-muted/30"
                              />
                              {state.submitted && (
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">Expected Answer:</p>
                                  <code className="text-xs text-emerald-800 dark:text-emerald-300 font-mono whitespace-pre-line">
                                    {String(exercise.correctAnswer)}
                                  </code>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Short Answer Input */}
                          {exercise.type === 'shortanswer' && (
                            <div className="space-y-3">
                              <Input
                                value={typeof state.userAnswer === 'string' ? state.userAnswer : ''}
                                onChange={(e) => updateExerciseState(exercise.id, { userAnswer: e.target.value })}
                                placeholder="Type your answer..."
                                disabled={state.submitted}
                                className="text-sm bg-muted/30"
                              />
                              {state.submitted && (
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">Expected Answer:</p>
                                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                                    {String(exercise.correctAnswer)}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          {!state.submitted && (
                            <Button
                              onClick={() =>
                                exercise.type === 'code' || exercise.type === 'shortanswer'
                                  ? handleCodeSubmit(exercise, exercise.id, typeof state.userAnswer === 'string' ? state.userAnswer : '')
                                  : checkAnswer(exercise, exercise.id)
                              }
                              disabled={state.userAnswer === '' || (typeof state.userAnswer === 'string' && state.userAnswer.trim() === '')}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              Check Answer
                            </Button>
                          )}

                          {/* Solution */}
                          {state.submitted && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-3"
                            >
                              <div className="p-3 bg-muted/50 rounded-xl">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Explanation</p>
                                <p className="text-sm leading-relaxed text-foreground/80">{exercise.explanation}</p>
                              </div>
                              {!isCorrect && (exercise.type === 'mcq' || exercise.type === 'truefalse') && (
                                <Button variant="outline" size="sm" onClick={() => updateExerciseState(exercise.id, { submitted: false, userAnswer: '' })}>
                                  Try Again
                                </Button>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
