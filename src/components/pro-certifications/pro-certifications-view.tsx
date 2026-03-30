'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Clock, FileQuestion, Target, ChevronRight, CheckCircle2,
  XCircle, Download, Shield, Loader2, ArrowLeft, AlertTriangle,
  Trophy, ExternalLink, RotateCcw, BarChart3, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useProgressStore } from '@/lib/store';

// ─── Types ───
interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

interface Certification {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  fee: number;
  duration: number;
  questions: number;
  passingScore: number;
  topics: string[];
  gradient: string;
  iconBg: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
}

// ─── Certification Data ───
const certifications: Certification[] = [
  {
    id: 'data-analyst',
    title: 'DataTrack Certified Data Analyst',
    shortTitle: 'Data Analyst',
    description: 'Comprehensive exam covering data analysis fundamentals, SQL, Excel, statistics, and data visualization. Validates your ability to transform raw data into actionable business insights.',
    fee: 29.99,
    duration: 60,
    questions: 50,
    passingScore: 70,
    topics: ['SQL Queries & Optimization', 'Statistical Analysis', 'Data Visualization', 'Excel Advanced', 'Data Cleaning & Preparation', 'Business Intelligence'],
    gradient: 'from-emerald-600 to-teal-600',
    iconBg: 'bg-emerald-500/20',
    difficulty: 'Intermediate',
  },
  {
    id: 'sql-expert',
    title: 'DataTrack Certified SQL Expert',
    shortTitle: 'SQL Expert',
    description: 'Advanced SQL certification testing complex queries, window functions, CTEs, query optimization, database design, and real-world problem-solving with SQL.',
    fee: 29.99,
    duration: 60,
    questions: 50,
    passingScore: 70,
    topics: ['Complex Joins & Subqueries', 'Window Functions', 'CTEs & Recursive Queries', 'Query Optimization', 'Database Design', 'Stored Procedures'],
    gradient: 'from-amber-500 to-yellow-600',
    iconBg: 'bg-amber-500/20',
    difficulty: 'Advanced',
  },
  {
    id: 'python-dev',
    title: 'DataTrack Certified Python Developer',
    shortTitle: 'Python Developer',
    description: 'Validates proficiency in Python for data science including pandas, NumPy, data structures, algorithms, and building data pipelines.',
    fee: 29.99,
    duration: 60,
    questions: 50,
    passingScore: 70,
    topics: ['Python Fundamentals', 'Pandas & DataFrames', 'NumPy & Arrays', 'Data Visualization', 'File I/O & APIs', 'Object-Oriented Programming'],
    gradient: 'from-blue-600 to-indigo-600',
    iconBg: 'bg-blue-500/20',
    difficulty: 'Intermediate',
  },
  {
    id: 'bi-professional',
    title: 'DataTrack Certified BI Professional',
    shortTitle: 'BI Professional',
    description: 'Professional certification in Business Intelligence covering dashboard design, data modeling, DAX, and enterprise-level BI solutions.',
    fee: 29.99,
    duration: 60,
    questions: 50,
    passingScore: 70,
    topics: ['Dashboard Design Principles', 'DAX & Calculations', 'Data Modeling', 'ETL Processes', 'Power BI / Tableau', 'Enterprise BI Architecture'],
    gradient: 'from-violet-600 to-purple-600',
    iconBg: 'bg-violet-500/20',
    difficulty: 'Expert',
  },
];

// ─── Question Bank ───
const questionBanks: Record<string, ExamQuestion[]> = {
  'data-analyst': [
    { id: 1, question: 'Which SQL clause is used to filter aggregated results?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correct: 1 },
    { id: 2, question: 'What does the standard deviation measure in a dataset?', options: ['Central tendency', 'Spread/dispersion', 'Correlation', 'Skewness'], correct: 1 },
    { id: 3, question: 'Which chart type is best for showing proportions of a whole?', options: ['Bar chart', 'Line chart', 'Pie chart', 'Scatter plot'], correct: 2 },
    { id: 4, question: 'In Excel, which function finds the position of a value in a range?', options: ['VLOOKUP', 'INDEX', 'MATCH', 'FIND'], correct: 2 },
    { id: 5, question: 'What is the median of the dataset: [2, 5, 7, 8, 12]?', options: ['5', '7', '6.8', '8'], correct: 1 },
    { id: 6, question: 'Which JOIN returns only matching rows from both tables?', options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL OUTER JOIN'], correct: 2 },
    { id: 7, question: 'What does a p-value less than 0.05 indicate?', options: ['Result is not significant', 'Result is statistically significant', 'Data is normally distributed', 'Sample size is too small'], correct: 1 },
    { id: 8, question: 'Which data type is best for storing TRUE/FALSE values?', options: ['VARCHAR', 'INT', 'BOOLEAN', 'TEXT'], correct: 2 },
    { id: 9, question: 'What is the purpose of data normalization?', options: ['Increase data size', 'Reduce redundancy', 'Encrypt data', 'Backup data'], correct: 1 },
    { id: 10, question: 'Which measure of central tendency is most affected by outliers?', options: ['Median', 'Mode', 'Mean', 'Midrange'], correct: 2 },
    { id: 11, question: 'In a pivot table, what are rows and columns called?', options: ['Fields and Items', 'Dimensions and Measures', 'Categories and Values', 'Groups and Totals'], correct: 1 },
    { id: 12, question: 'What type of relationship exists when one record can relate to many others?', options: ['One-to-one', 'One-to-many', 'Many-to-many', 'Self-referencing'], correct: 1 },
    { id: 13, question: 'Which statistical test compares means of two groups?', options: ['Chi-square', 'ANOVA', 'T-test', 'Regression'], correct: 2 },
    { id: 14, question: 'What is a KPI in business intelligence?', options: ['Key Performance Indicator', 'Knowledge Processing Interface', 'Key Project Index', 'Kernel Parameter Input'], correct: 0 },
    { id: 15, question: 'Which function in SQL removes duplicates from results?', options: ['UNIQUE', 'DISTINCT', 'DIFFERENT', 'REMOVE DUPLICATES'], correct: 1 },
    { id: 16, question: 'What does ETL stand for?', options: ['Extract, Transform, Load', 'Evaluate, Test, Launch', 'Enter, Transfer, Log', 'Export, Translate, Loop'], correct: 0 },
    { id: 17, question: 'Which chart is best for showing trends over time?', options: ['Pie chart', 'Scatter plot', 'Line chart', 'Histogram'], correct: 2 },
    { id: 18, question: 'What is the formula for calculating variance?', options: ['Sum / Count', 'Sum of squared deviations / N', 'Max - Min', 'Standard deviation * 2'], correct: 1 },
    { id: 19, question: 'In data warehousing, what is a fact table?', options: ['Stores dimension attributes', 'Stores business measurements', 'Stores metadata', 'Stores user logs'], correct: 1 },
    { id: 20, question: 'Which correlation coefficient indicates a strong positive relationship?', options: ['-0.8', '0.0', '0.8', '-1.0'], correct: 2 },
    { id: 21, question: 'What is the primary key in a database?', options: ['Any column', 'A unique identifier for each row', 'The first column', 'A foreign key reference'], correct: 1 },
    { id: 22, question: 'Which Excel shortcut opens the Go To dialog?', options: ['Ctrl+G', 'Ctrl+F', 'Ctrl+H', 'Ctrl+O'], correct: 0 },
    { id: 23, question: 'What is the difference between COUNT(*) and COUNT(column)?', options: ['No difference', 'COUNT(*) counts all rows, COUNT(column) counts non-null', 'COUNT(column) is faster', 'COUNT(*) only counts unique values'], correct: 1 },
    { id: 24, question: 'Which type of data requires categorical encoding?', options: ['Numeric', 'Text/categorical', 'Date/time', 'Boolean'], correct: 1 },
    { id: 25, question: 'What does a box plot display?', options: ['Only the mean', 'Five-number summary', 'Only outliers', 'Only the median'], correct: 1 },
    { id: 26, question: 'Which SQL keyword is used to sort results?', options: ['SORT BY', 'ORDER BY', 'GROUP BY', 'ARRANGE BY'], correct: 1 },
    { id: 27, question: 'What is data skewness?', options: ['Missing data', 'Asymmetry in distribution', 'Data size', 'Processing speed'], correct: 1 },
    { id: 28, question: 'In a relational database, what enforces referential integrity?', options: ['Primary key', 'Foreign key', 'Index', 'Trigger'], correct: 1 },
    { id: 29, question: 'What is the mode of [3, 3, 5, 7, 7, 7, 9]?', options: ['3', '5', '7', '9'], correct: 2 },
    { id: 30, question: 'Which visualization is ideal for comparing categories?', options: ['Line chart', 'Bar chart', 'Scatter plot', 'Area chart'], correct: 1 },
    { id: 31, question: 'What does R-squared (R²) represent in regression?', options: ['Error rate', 'Variance explained', 'Sample size', 'P-value'], correct: 1 },
    { id: 32, question: 'Which SQL function returns the number of rows?', options: ['SUM()', 'COUNT()', 'TOTAL()', 'LENGTH()'], correct: 1 },
    { id: 33, question: 'What is an outlier in data analysis?', options: ['A duplicate value', 'A data point significantly different from others', 'A missing value', 'The average value'], correct: 1 },
    { id: 34, question: 'Which JOIN returns all rows from the left table and matching from right?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'], correct: 1 },
    { id: 35, question: 'What is the interquartile range (IQR)?', options: ['Q1 - Q3', 'Q3 - Q1', 'Max - Min', 'Median ± MAD'], correct: 1 },
    { id: 36, question: 'Which aggregate function calculates the average?', options: ['SUM', 'MEDIAN', 'AVG', 'COUNT'], correct: 2 },
    { id: 37, question: 'What is a data mart?', options: ['A small data warehouse', 'A type of chart', 'A backup system', 'A programming language'], correct: 0 },
    { id: 38, question: 'Which test checks if data follows a normal distribution?', options: ['T-test', 'Chi-square test', 'Shapiro-Wilk test', 'ANOVA'], correct: 2 },
    { id: 39, question: 'What is the purpose of a scatter plot matrix?', options: ['Show one relationship', 'Show all pairwise relationships', 'Show time series', 'Show geographic data'], correct: 1 },
    { id: 40, question: 'In SQL, what does NULL represent?', options: ['Zero', 'Empty string', 'Unknown/missing value', 'False'], correct: 2 },
    { id: 41, question: 'What is the 80/20 rule in Pareto analysis?', options: ['80% tests, 20% code', '80% effects from 20% causes', '80% data, 20% analysis', '80% errors, 20% features'], correct: 1 },
    { id: 42, question: 'Which chart type shows distribution of a single variable?', options: ['Bar chart', 'Histogram', 'Scatter plot', 'Pie chart'], correct: 1 },
    { id: 43, question: 'What is a confusion matrix used for?', options: ['Sorting data', 'Evaluating classification models', 'Data cleaning', 'Feature selection'], correct: 1 },
    { id: 44, question: 'Which SQL clause groups rows with same values?', options: ['ORDER BY', 'HAVING', 'GROUP BY', 'PARTITION BY'], correct: 2 },
    { id: 45, question: 'What is a percentile?', options: ['A percentage', 'A value below which a percentage falls', 'An average', 'A median only'], correct: 1 },
    { id: 46, question: 'What does BI stand for in data analytics?', options: ['Basic Information', 'Business Intelligence', 'Binary Input', 'Batch Interface'], correct: 1 },
    { id: 47, question: 'Which function concatenates strings in SQL?', options: ['COMBINE()', 'JOIN()', 'CONCAT()', 'MERGE()'], correct: 2 },
    { id: 48, question: 'What is sampling bias?', options: ['Random error', 'Systematic error from non-random sampling', 'Data entry error', 'Calculation error'], correct: 1 },
    { id: 49, question: 'Which visualization shows parts of a whole over time?', options: ['Stacked bar chart', 'Pie chart', 'Scatter plot', 'Box plot'], correct: 0 },
    { id: 50, question: 'What is the coefficient of variation?', options: ['Mean / Median', 'Standard deviation / Mean', 'Variance / Max', 'Range / IQR'], correct: 1 },
  ],
  'sql-expert': [
    { id: 1, question: 'Which window function assigns a unique rank to each row?', options: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'NTILE()'], correct: 0 },
    { id: 2, question: 'What is the difference between RANK() and DENSE_RANK()?', options: ['No difference', 'DENSE_RANK() has no gaps in ranking', 'RANK() is faster', 'DENSE_RANK() counts duplicates differently'], correct: 1 },
    { id: 3, question: 'What does the OVER() clause define in window functions?', options: ['The WHERE clause', 'The window/frame for the function', 'The GROUP BY clause', 'The ORDER BY clause'], correct: 1 },
    { id: 4, question: 'Which type of JOIN can produce a Cartesian product?', options: ['INNER JOIN', 'CROSS JOIN', 'LEFT JOIN', 'SELF JOIN'], correct: 1 },
    { id: 5, question: 'What is a recursive CTE used for?', options: ['Simple selects', 'Hierarchical or tree-structured data', 'Only updates', 'Creating temp tables'], correct: 1 },
    { id: 6, question: 'Which index type is best for range queries?', options: ['Hash index', 'B-tree index', 'Bitmap index', 'Unique index'], correct: 1 },
    { id: 7, question: 'What does the EXISTS operator check?', options: ['Table existence', 'Whether a subquery returns any rows', 'Column existence', 'Index existence'], correct: 1 },
    { id: 8, question: 'Which command removes all rows without logging?', options: ['DELETE FROM', 'DROP TABLE', 'TRUNCATE TABLE', 'REMOVE ALL'], correct: 2 },
    { id: 9, question: 'What is query optimization?', options: ['Making queries shorter', 'Finding the most efficient execution plan', 'Adding more indexes', 'Using views instead of tables'], correct: 1 },
    { id: 10, question: 'Which normal form eliminates transitive dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: 2 },
    { id: 11, question: 'What is a covering index?', options: ['An index on all columns', 'An index that includes all columns needed by a query', 'A primary key index', 'A unique index'], correct: 1 },
    { id: 12, question: 'Which clause sets the frame for window functions?', options: ['OVER()', 'PARTITION BY', 'ROWS BETWEEN', 'GROUP BY'], correct: 2 },
    { id: 13, question: 'What does NTILE(4) do?', options: ['Returns top 4 rows', 'Divides rows into 4 buckets', 'Multiplies by 4', 'Returns 4 columns'], correct: 1 },
    { id: 14, question: 'Which SQL statement is used to create a stored procedure?', options: ['CREATE FUNCTION', 'CREATE PROCEDURE', 'CREATE TRIGGER', 'CREATE VIEW'], correct: 1 },
    { id: 15, question: 'What is a materialized view?', options: ['A regular view', 'A view with stored/pre-computed results', 'A temporary table', 'An indexed table'], correct: 1 },
    { id: 16, question: 'Which operator combines results from two queries removing duplicates?', options: ['UNION ALL', 'UNION', 'INTERSECT', 'EXCEPT'], correct: 1 },
    { id: 17, question: 'What is denormalization?', options: ['The same as normalization', 'Intentionally adding redundancy for performance', 'Removing data', 'Encrypting data'], correct: 1 },
    { id: 18, question: 'Which isolation level prevents dirty reads?', options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'All of the above except READ UNCOMMITTED'], correct: 3 },
    { id: 19, question: 'What does LAG() function do?', options: ['Gets next row value', 'Gets previous row value', 'Counts rows', 'Sums values'], correct: 1 },
    { id: 20, question: 'Which keyword creates a temporary table in SQL?', options: ['CREATE TABLE temp', 'CREATE TEMPORARY TABLE', 'CREATE TEMP TABLE', 'All of the above work in some databases'], correct: 3 },
    { id: 21, question: 'What is a deadlock in databases?', options: ['A slow query', 'Two processes blocking each other', 'A crashed server', 'A missing index'], correct: 1 },
    { id: 22, question: 'Which function returns the first non-null value?', options: ['NULLIF()', 'COALESCE()', 'ISNULL()', 'IFNULL()'], correct: 1 },
    { id: 23, question: 'What is the purpose of an execution plan?', options: ['To schedule jobs', 'To show how the database will execute a query', 'To create tables', 'To backup data'], correct: 1 },
    { id: 24, question: 'Which type of subquery can reference columns from the outer query?', options: ['Simple subquery', 'Correlated subquery', 'Scalar subquery', 'Table subquery'], correct: 1 },
    { id: 25, question: 'What does the PARTITION BY clause do in window functions?', options: ['Orders rows', 'Divides rows into groups', 'Filters rows', 'Joins tables'], correct: 1 },
    { id: 26, question: 'Which constraint ensures a column value is unique across the table?', options: ['NOT NULL', 'PRIMARY KEY', 'UNIQUE', 'CHECK'], correct: 2 },
    { id: 27, question: 'What is query parameterization?', options: ['Making queries shorter', 'Using parameters to prevent SQL injection', 'Caching results', 'Indexing'], correct: 1 },
    { id: 28, question: 'Which JOIN returns all rows when there is no match?', options: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'SELF JOIN'], correct: 1 },
    { id: 29, question: 'What does the CASE statement do in SQL?', options: ['Creates a loop', 'Conditional logic in queries', 'Creates a table', 'Deletes data'], correct: 1 },
    { id: 30, question: 'What is a bitmap index best used for?', options: ['High cardinality columns', 'Low cardinality columns', 'Primary keys', 'Foreign keys'], correct: 1 },
    { id: 31, question: 'Which function calculates a running total?', options: ['SUM() with GROUP BY', 'SUM() with OVER()', 'TOTAL()', 'CUMSUM()'], correct: 1 },
    { id: 32, question: 'What is the N+1 query problem?', options: ['Too many columns', 'Executing one query per item in a loop', 'Using N joins', 'Nesting queries too deep'], correct: 1 },
    { id: 33, question: 'Which command grants permissions in SQL?', options: ['ALLOW', 'PERMIT', 'GRANT', 'AUTHORIZE'], correct: 2 },
    { id: 34, question: 'What does FIRST_VALUE() return?', options: ['The first column', 'The first value in an ordered window frame', 'The minimum value', 'The first row'], correct: 1 },
    { id: 35, question: 'What is a surrogate key?', options: ['A foreign key', 'An artificially generated unique identifier', 'A primary key from another table', 'A composite key'], correct: 1 },
    { id: 36, question: 'Which clause filters groups after aggregation?', options: ['WHERE', 'HAVING', 'FILTER', 'POST-WHERE'], correct: 1 },
    { id: 37, question: 'What is database sharding?', options: ['Deleting old data', 'Distributing data across multiple servers', 'Creating backups', 'Normalizing data'], correct: 1 },
    { id: 38, question: 'Which SQL command changes table structure?', options: ['MODIFY TABLE', 'ALTER TABLE', 'UPDATE TABLE', 'CHANGE TABLE'], correct: 1 },
    { id: 39, question: 'What does the LEAD() function do?', options: ['Gets previous row value', 'Gets next row value', 'Gets last value', 'Gets first value'], correct: 1 },
    { id: 40, question: 'What is a clustered index?', options: ['An index on multiple columns', 'An index that determines physical order of data', 'A unique index', 'A bitmap index'], correct: 1 },
    { id: 41, question: 'Which operator returns rows in both queries?', options: ['UNION', 'INTERSECT', 'EXCEPT', 'JOIN'], correct: 1 },
    { id: 42, question: 'What is a transaction in SQL?', options: ['A single query', 'A logical unit of work', 'A table', 'A connection'], correct: 1 },
    { id: 43, question: 'What does ACID stand for in databases?', options: ['Advanced, Complex, Integrated, Distributed', 'Atomicity, Consistency, Isolation, Durability', 'Automated, Controlled, Isolated, Distributed', 'Asynchronous, Concurrent, Independent, Dynamic'], correct: 1 },
    { id: 44, question: 'Which window function calculates percent rank?', options: ['PERCENT_RANK()', 'RANK()', 'PERCENT()', 'QUARTILE()'], correct: 0 },
    { id: 45, question: 'What is a foreign key constraint?', options: ['Ensures uniqueness', 'Links data between two tables', 'Prevents null values', 'Encrypts data'], correct: 1 },
    { id: 46, question: 'What does EXPLAIN do in SQL?', options: ['Creates documentation', 'Shows the execution plan', 'Describes a table', 'Runs a query'], correct: 1 },
    { id: 47, question: 'Which data type stores large text data?', options: ['VARCHAR', 'TEXT/CLOB', 'CHAR', 'BLOB'], correct: 1 },
    { id: 48, question: 'What is a self-join?', options: ['A join with a temporary table', 'A table joined with itself', 'An automatic join', 'A recursive join'], correct: 1 },
    { id: 49, question: 'What does the CUBE extension in GROUP BY do?', options: ['Creates 3D data', 'Generates all possible group combinations', 'Filters data', 'Sorts data'], correct: 1 },
    { id: 50, question: 'What is database connection pooling?', options: ['Storing query results', 'Reusing database connections for performance', 'Load balancing', 'Caching tables'], correct: 1 },
  ],
  'python-dev': [
    { id: 1, question: 'Which Python library is primarily used for data manipulation?', options: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'], correct: 1 },
    { id: 2, question: 'What is a DataFrame in pandas?', options: ['A 1D array', 'A 2D labeled data structure', 'A dictionary', 'A list'], correct: 1 },
    { id: 3, question: 'Which method reads a CSV file in pandas?', options: ['pd.load_csv()', 'pd.read_csv()', 'pd.open_csv()', 'pd.import_csv()'], correct: 1 },
    { id: 4, question: 'What does the .head() method return?', options: ['The last rows', 'The first n rows', 'Column names', 'Data types'], correct: 1 },
    { id: 5, question: 'Which NumPy function creates an array of zeros?', options: ['np.zero()', 'np.zeros()', 'np.null()', 'np.empty()'], correct: 1 },
    { id: 6, question: 'What is a lambda function in Python?', options: ['A loop', 'An anonymous function', 'A class method', 'A decorator'], correct: 1 },
    { id: 7, question: 'Which method handles missing values in pandas?', options: ['.dropna()', '.fillna()', 'Both A and B', '.remove_null()'], correct: 2 },
    { id: 8, question: 'What is the shape attribute of a NumPy array?', options: ['Data type', 'Dimensions as tuple', 'Total elements', 'Memory size'], correct: 1 },
    { id: 9, question: 'Which method groups data in pandas?', options: ['.filter()', '.groupby()', '.categorize()', '.segment()'], correct: 1 },
    { id: 10, question: 'What does .merge() do in pandas?', options: ['Sorts data', 'Joins DataFrames', 'Filters rows', 'Creates columns'], correct: 1 },
    { id: 11, question: 'What is a list comprehension?', options: ['A nested loop', 'A concise way to create lists', 'A method call', 'A class definition'], correct: 1 },
    { id: 12, question: 'Which function plots a histogram in matplotlib?', options: ['plot()', 'hist()', 'bar()', 'scatter()'], correct: 1 },
    { id: 13, question: 'What does .describe() return in pandas?', options: ['Column names', 'Summary statistics', 'Data types', 'First rows'], correct: 1 },
    { id: 14, question: 'What is the difference between .loc and .iloc?', options: ['No difference', '.loc is label-based, .iloc is position-based', '.iloc is faster', '.loc only works with rows'], correct: 1 },
    { id: 15, question: 'Which method applies a function to each element?', options: ['.apply()', '.map()', '.transform()', 'All can work depending on context'], correct: 3 },
    { id: 16, question: 'What is pip in Python?', options: ['A framework', 'Package installer', 'A compiler', 'A debugger'], correct: 1 },
    { id: 17, question: 'Which data structure is immutable in Python?', options: ['List', 'Dictionary', 'Tuple', 'Set'], correct: 2 },
    { id: 18, question: 'What does np.mean() calculate?', options: ['Median', 'Average/mean', 'Mode', 'Standard deviation'], correct: 1 },
    { id: 19, question: 'Which method creates a pivot table in pandas?', options: ['.pivot_table()', '.cross_tab()', '.pivot()', '.summary()'], correct: 0 },
    { id: 20, question: 'What is a decorator in Python?', options: ['A UI component', 'A function that modifies another function', 'A data structure', 'A comment style'], correct: 1 },
    { id: 21, question: 'Which keyword handles exceptions in Python?', options: ['catch', 'except', 'handle', 'error'], correct: 1 },
    { id: 22, question: 'What does .value_counts() do?', options: ['Counts columns', 'Counts unique values', 'Counts nulls', 'Counts rows'], correct: 1 },
    { id: 23, question: 'What is a virtual environment in Python?', options: ['A VM', 'Isolated Python environment for packages', 'A Docker container', 'A cloud service'], correct: 1 },
    { id: 24, question: 'Which method converts data types in pandas?', options: ['.cast()', '.convert()', '.astype()', '.type()'], correct: 2 },
    { id: 25, question: 'What does the .info() method show?', options: ['Statistics', 'Data types and non-null counts', 'Plot', 'Sample data'], correct: 1 },
    { id: 26, question: 'Which module is used for JSON in Python?', options: ['xml', 'json', 'csv', 'data'], correct: 1 },
    { id: 27, question: 'What is the difference between shallow and deep copy?', options: ['No difference', 'Deep copy copies nested objects', 'Shallow copy is faster always', 'Deep copy is the default'], correct: 1 },
    { id: 28, question: 'Which pandas method handles duplicates?', options: ['.unique()', '.drop_duplicates()', '.remove_dupes()', '.distinct()'], correct: 1 },
    { id: 29, question: 'What does NumPy broadcasting do?', options: ['Sends data over network', 'Allows operations on arrays of different shapes', 'Compresses arrays', 'Converts types'], correct: 1 },
    { id: 30, question: 'What is __init__ in Python?', options: ['A variable', 'Constructor method', 'A destructor', 'A main function'], correct: 1 },
    { id: 31, question: 'Which function reads JSON in pandas?', options: ['pd.read_json()', 'pd.load_json()', 'pd.open_json()', 'pd.import_json()'], correct: 0 },
    { id: 32, question: 'What is a generator in Python?', options: ['A random number creator', 'A function using yield', 'A class constructor', 'A file reader'], correct: 1 },
    { id: 33, question: 'Which method concatenates DataFrames?', options: ['.merge()', '.join()', '.concat()', '.append()'], correct: 2 },
    { id: 34, question: 'What does .corr() calculate?', options: ['Covariance', 'Correlation matrix', 'Regression', 'Variance'], correct: 1 },
    { id: 35, question: 'What is the GIL in Python?', options: ['Global Interface Library', 'Global Interpreter Lock', 'General Input Language', 'Graphical Interface Layer'], correct: 1 },
    { id: 36, question: 'Which method resamples time series data?', options: ['.sample()', '.resample()', '.aggregate()', '.window()'], correct: 1 },
    { id: 37, question: 'What does *args do in a function?', options: ['Multiplies args', 'Passes variable positional arguments', 'Unpacks dict', 'Defines constants'], correct: 1 },
    { id: 38, question: 'Which plotting library creates interactive charts?', options: ['Matplotlib', 'Plotly', 'PIL', 'OpenCV'], correct: 1 },
    { id: 39, question: 'What is the .idxmax() method?', options: ['Maximum value', 'Index of maximum value', 'Maximum index', 'Sort by max'], correct: 1 },
    { id: 40, question: 'What does the with statement do?', options: ['Creates a loop', 'Context management for resource handling', 'Defines a class', 'Imports modules'], correct: 1 },
    { id: 41, question: 'Which method creates a datetime object?', options: ['datetime.now()', 'datetime.create()', 'datetime.new()', 'datetime.get()'], correct: 0 },
    { id: 42, question: 'What is pickling in Python?', options: ['Sorting', 'Serializing objects to bytes', 'Compressing files', 'Parsing data'], correct: 1 },
    { id: 43, question: 'Which pandas method handles time zones?', options: ['.tz_convert()', '.timezone()', '.utc()', '.offset()'], correct: 0 },
    { id: 44, question: 'What does **kwargs do?', options: ['Keyword arguments unpacking', 'Power operation', 'Dictionary unpacking into function args', 'Key-value iteration'], correct: 2 },
    { id: 45, question: 'Which method checks for null values?', options: ['.isnull()', '.has_null()', '.check_null()', '.null_exists()'], correct: 0 },
    { id: 46, question: 'What is type hinting in Python?', options: ['Type conversion', 'Optional type annotations', 'Type checking', 'Type casting'], correct: 1 },
    { id: 47, question: 'Which function creates a scatter plot in matplotlib?', options: ['scatter()', 'plot(x,y)', 'bar()', 'hist()'], correct: 0 },
    { id: 48, question: 'What does .duplicated() return?', options: ['Unique values', 'Boolean series indicating duplicates', 'Count of duplicates', 'List of duplicates'], correct: 1 },
    { id: 49, question: 'What is the difference between == and is?', options: ['No difference', '== checks value, is checks identity', 'is is faster', '== is for strings only'], correct: 1 },
    { id: 50, question: 'Which method exports a DataFrame to CSV?', options: ['.save_csv()', '.to_csv()', '.export_csv()', '.write_csv()'], correct: 1 },
  ],
  'bi-professional': [
    { id: 1, question: 'What is the purpose of a data model in BI?', options: ['Visual design', 'Define relationships between data entities', 'Create charts', 'Write reports'], correct: 1 },
    { id: 2, question: 'Which DAX function calculates running totals?', options: ['SUM()', 'TOTALYTD()', 'CALCULATE()', 'RunningSum()'], correct: 1 },
    { id: 3, question: 'What is a star schema?', options: ['A chart type', 'Central fact table with dimension tables', 'A database brand', 'A query type'], correct: 1 },
    { id: 4, question: 'Which type of chart is best for KPI dashboards?', options: ['Pie chart', 'Gauge/card visualization', 'Scatter plot', 'Box plot'], correct: 1 },
    { id: 5, question: 'What does ETL stand for?', options: ['Extract, Transform, Load', 'Evaluate, Test, Launch', 'Enter, Transfer, Log', 'Export, Translate, Loop'], correct: 0 },
    { id: 6, question: 'Which DAX function filters context?', options: ['FILTER()', 'CALCULATE()', 'WHERE()', 'SELECT()'], correct: 1 },
    { id: 7, question: 'What is a snowflake schema?', options: ['Unique schema', 'Normalized star schema with sub-dimensions', 'Large fact table', 'Simple flat table'], correct: 1 },
    { id: 8, question: 'Which BI tool is owned by Microsoft?', options: ['Tableau', 'Power BI', 'QlikView', 'Looker'], correct: 1 },
    { id: 9, question: 'What is a measure in Power BI?', options: ['A column', 'A calculation using DAX', 'A filter', 'A table'], correct: 1 },
    { id: 10, question: 'Which relationship type connects fact and dimension tables?', options: ['One-to-one', 'One-to-many', 'Many-to-many', 'Self-referencing'], correct: 1 },
    { id: 11, question: 'What is data granularity?', options: ['Data quality', 'Level of detail in data', 'Data size', 'Data speed'], correct: 1 },
    { id: 12, question: 'Which DAX function counts distinct values?', options: ['COUNT()', 'COUNTROWS()', 'DISTINCTCOUNT()', 'UNIQUE()'], correct: 2 },
    { id: 13, question: 'What is a dashboard in BI?', options: ['A single chart', 'Interactive collection of visualizations', 'A data table', 'A report document'], correct: 1 },
    { id: 14, question: 'Which type of join is most common in data models?', options: ['Many-to-many', 'One-to-many', 'One-to-one', 'Cross join'], correct: 1 },
    { id: 15, question: 'What does SCD stand for?', options: ['Slow Changing Dimension', 'System Control Data', 'Standard Chart Design', 'Structured Column Data'], correct: 0 },
    { id: 16, question: 'Which Power BI view is for building relationships?', options: ['Report view', 'Data view', 'Model view', 'Desktop view'], correct: 2 },
    { id: 17, question: 'What is a calculated column?', options: ['A column from source', 'A column computed row-by-row using DAX', 'A measure', 'An index column'], correct: 1 },
    { id: 18, question: 'What is incremental refresh?', options: ['Refreshing everything', 'Loading only changed data', 'Scheduling refreshes', 'Manual refresh'], correct: 1 },
    { id: 19, question: 'Which DAX function returns a table?', options: ['SUM()', 'FILTER()', 'RETURN()', 'VALUES()'], correct: 3 },
    { id: 20, question: 'What is drill-through in BI?', options: ['Data extraction', 'Navigate from summary to detail', 'Data cleaning', 'Data loading'], correct: 1 },
    { id: 21, question: 'What is RLS in Power BI?', options: ['Report Level Security', 'Row-Level Security', 'Role Level System', 'Resource Level Service'], correct: 1 },
    { id: 22, question: 'Which DAX function evaluates an expression in a modified context?', options: ['EVALUATE()', 'CALCULATE()', 'COMPUTE()', 'ASSESS()'], correct: 1 },
    { id: 23, question: 'What is a data mart?', options: ['A small market', 'A focused data warehouse subset', 'A data cleaning tool', 'A BI chart'], correct: 1 },
    { id: 24, question: 'Which visualization shows hierarchy?', options: ['Bar chart', 'Tree map', 'Line chart', 'Gauge'], correct: 1 },
    { id: 25, question: 'What is a KPI in BI?', options: ['Key Product Index', 'Key Performance Indicator', 'Knowledge Process Input', 'Key Profit Insight'], correct: 1 },
    { id: 26, question: 'Which DAX function handles time intelligence?', options: ['DATEADD()', 'TOTALYTD()', 'SAMEPERIODLASTYEAR()', 'All of the above'], correct: 3 },
    { id: 27, question: 'What is the purpose of Power Query?', options: ['Write DAX', 'Data extraction and transformation', 'Create visuals', 'Publish reports'], correct: 1 },
    { id: 28, question: 'What is a factless fact table?', options: ['Empty table', 'Table recording events/relationships without measures', 'Table with only text', 'Temporary table'], correct: 1 },
    { id: 29, question: 'Which DAX function creates blank values?', options: ['NULL', 'BLANK()', 'EMPTY()', 'NA()'], correct: 1 },
    { id: 30, question: 'What is data lineage in BI?', options: ['Data history', 'Tracking data origin and transformations', 'Data backup', 'Data versioning'], correct: 1 },
    { id: 31, question: 'What is a semantic model in Power BI?', options: ['A text model', 'The data model with business logic', 'A chart template', 'A color scheme'], correct: 1 },
    { id: 32, question: 'Which type of chart compares categories over time?', options: ['Scatter plot', 'Line chart', 'Pie chart', 'Gauge'], correct: 1 },
    { id: 33, question: 'What is the RELATED() function in DAX?', options: ['Sorts data', 'Fetches value from related table', 'Creates relationships', 'Filters data'], correct: 1 },
    { id: 34, question: 'What is self-service BI?', options: ['Manual reporting', 'Business users creating their own reports', 'Automated BI', 'Free BI tools'], correct: 1 },
    { id: 35, question: 'Which Power BI feature creates reusable calculations?', options: ['Quick measures', 'Calculated tables', 'Both', 'Neither'], correct: 2 },
    { id: 36, question: 'What is a degenerate dimension?', options: ['Bad dimension', 'A dimension stored in the fact table', 'A missing dimension', 'A small dimension'], correct: 1 },
    { id: 37, question: 'Which DAX function iterates over a table?', options: ['FOR EACH', 'SUMX()', 'LOOP()', 'WHILE()'], correct: 1 },
    { id: 38, question: 'What is data governance?', options: ['Database administration', 'Policies and standards for data management', 'Data encryption', 'Data backup'], correct: 1 },
    { id: 39, question: 'Which visualization is best for geographical data?', options: ['Pie chart', 'Map/Filled map', 'Bar chart', 'Line chart'], correct: 1 },
    { id: 40, question: 'What is a conformed dimension?', options: ['Standard dimension used across multiple fact tables', 'A single-use dimension', 'A generated dimension', 'A hidden dimension'], correct: 0 },
    { id: 41, question: 'What does CROSSFILTER do in DAX?', options: ['Creates a cross join', 'Modifies filter direction in relationships', 'Cross-filters columns', 'Removes filters'], correct: 1 },
    { id: 42, question: 'What is a waterfall chart best used for?', options: ['Time series', 'Showing incremental changes', 'Comparison', 'Distribution'], correct: 1 },
    { id: 43, question: 'What is the difference between a measure and calculated column?', options: ['No difference', 'Measures aggregate, calculated columns compute row-by-row', 'Measures are faster', 'Columns are deprecated'], correct: 1 },
    { id: 44, question: 'Which BI concept involves pre-aggregating data?', options: ['Normalization', 'Aggregations/cubes', 'Indexing', 'Partitioning'], correct: 1 },
    { id: 45, question: 'What is a data catalog?', options: ['A shopping catalog', 'An organized inventory of data assets', 'A database schema', 'A BI report list'], correct: 1 },
    { id: 46, question: 'What does USERELATIONSHIP() do?', options: ['Creates relationship', 'Specifies active relationship for calculation', 'Deletes relationship', 'Validates relationship'], correct: 1 },
    { id: 47, question: 'Which report type provides printed output?', options: ['Dashboard', 'Paginated report', 'Scorecard', 'Storyboard'], correct: 1 },
    { id: 48, question: 'What is a junk dimension?', options: ['Unnecessary dimension', 'Consolidates multiple low-cardinality flags/attributes', 'A test dimension', 'A deleted dimension'], correct: 1 },
    { id: 49, question: 'Which DAX function returns the first date in a period?', options: ['STARTOFMONTH()', 'FIRSTDATE()', 'BEGINNING()', 'DATEFIRST()'], correct: 1 },
    { id: 50, question: 'What is embedded analytics?', options: ['Analytics on mobile', 'Integrating analytics within other applications', 'Server-side analytics', 'Offline analytics'], correct: 1 },
  ],
};

export default function ProCertificationsView() {
  const store = useProgressStore();
  const completedExams = store.completedCertExams || [];

  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [examState, setExamState] = useState<'idle' | 'active' | 'reviewing' | 'purchasing' | 'done'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCert, setShowCert] = useState<{ certId: string; score: number; date: string } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getExamAttempts = (certId: string) => completedExams.filter((e) => e.examId === certId).length;
  const getBestResult = (certId: string) => {
    const results = completedExams.filter((e) => e.examId === certId && e.passed);
    if (results.length === 0) return null;
    return results.reduce((best, cur) => cur.score > best.score ? cur : best);
  };
  const hasPassed = (certId: string) => !!getBestResult(certId);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getScore = () => {
    if (!selectedCert) return 0;
    const questions = questionBanks[selectedCert.id] || [];
    return answers.reduce((acc, ans, idx) => acc + (ans === questions[idx]?.correct ? 1 : 0), 0);
  };

  const getScorePercent = () => {
    if (!selectedCert) return 0;
    return Math.round((getScore() / selectedCert.questions) * 100);
  };

  const submitExam = () => {
    if (!selectedCert) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const questions = questionBanks[selectedCert.id] || [];
    const score = getScore();
    const passed = (score / selectedCert.questions) * 100 >= selectedCert.passingScore;
    store.addCertExamResult({
      examId: selectedCert.id,
      score,
      total: selectedCert.questions,
      passed,
      answers: [...answers],
    });
    setExamState(passed ? 'done' : 'reviewing');
    if (passed) {
      toast.success(`Congratulations! You passed the ${selectedCert.shortTitle} certification!`);
    } else {
      toast.error(`You scored ${score}/${selectedCert.questions}. You need 70% to pass.`);
    }
  };

  const startExam = (cert: Certification) => {
    if (getExamAttempts(cert.id) >= 3) {
      toast.error('Maximum 3 attempts reached for this certification.');
      return;
    }
    setSelectedCert(cert);
    setExamState('active');
    setCurrentQuestion(0);
    setAnswers(new Array(cert.questions).fill(-1));
    setTimeLeft(cert.duration * 60);
  };

  useEffect(() => {
    if (examState === 'active' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [examState, timeLeft]);

  const generateCertId = (cert: Certification) => `DT-${cert.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const generateVerifyCode = () => Math.random().toString(36).slice(2, 10).toUpperCase();

  // Exam Active View
  if (examState === 'active' && selectedCert) {
    const questions = questionBanks[selectedCert.id] || [];
    const q = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedCert.questions) * 100;

    return (
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setExamState('idle'); setSelectedCert(null); }}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Exit
            </Button>
            <div>
              <h2 className="font-semibold">{selectedCert.shortTitle} Exam</h2>
              <p className="text-xs text-muted-foreground">Question {currentQuestion + 1} of {selectedCert.questions}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold ${timeLeft < 300 ? 'bg-red-100 dark:bg-red-950/30 text-red-600 animate-pulse' : 'bg-muted'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedCert.iconBg} flex items-center justify-center shrink-0`}>
                  <span className="text-sm font-bold">{currentQuestion + 1}</span>
                </div>
                <h3 className="text-lg font-medium leading-relaxed">{q?.question}</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {q?.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = idx;
                    setAnswers(newAnswers);
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    answers[currentQuestion] === idx
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'border-border hover:border-emerald-300 hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    answers[currentQuestion] === idx
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm">{option}</span>
                </motion.button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((p) => p - 1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(selectedCert.questions, 20) }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center transition-all ${
                  i === currentQuestion
                    ? 'bg-emerald-500 text-white scale-110'
                    : answers[i] >= 0
                    ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </button>
            ))}
            {selectedCert.questions > 20 && <span className="text-xs text-muted-foreground px-2">...</span>}
          </div>
          {currentQuestion === selectedCert.questions - 1 ? (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={submitExam}>
              <CheckCircle2 className="w-4 h-4 mr-1" /> Submit Exam
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestion((p) => p + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Exam Results View
  if ((examState === 'done' || examState === 'reviewing') && selectedCert) {
    const score = getScore();
    const percent = getScorePercent();
    const passed = percent >= selectedCert.passingScore;

    return (
      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${passed ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/25' : 'bg-gradient-to-br from-red-400 to-rose-500'}`}>
            {passed ? <Trophy className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{passed ? 'Congratulations!' : 'Keep Trying!'}</h2>
            <p className="text-muted-foreground mt-1">
              {passed
                ? `You passed the ${selectedCert.shortTitle} certification!`
                : `You scored ${percent}% — you need ${selectedCert.passingScore}% to pass.`
              }
            </p>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-emerald-600">{score}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-600">{percent}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">{getExamAttempts(selectedCert.id)}</p>
                  <p className="text-xs text-muted-foreground">Attempts</p>
                </div>
              </div>
              <Progress value={percent} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className={`font-semibold ${passed ? 'text-emerald-600' : 'text-red-500'}`}>Passing: {selectedCert.passingScore}%</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-center">
            {passed && (
              <Button
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                onClick={() => setShowCert({ certId: selectedCert.id, score: percent, date: new Date().toLocaleDateString() })}
              >
                <Download className="w-4 h-4 mr-2" /> Download Certificate
              </Button>
            )}
            {!passed && getExamAttempts(selectedCert.id) < 3 && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => startExam(selectedCert)}>
                <RotateCcw className="w-4 h-4 mr-2" /> Try Again ({3 - getExamAttempts(selectedCert.id)} left)
              </Button>
            )}
            <Button variant="outline" onClick={() => { setExamState('idle'); setSelectedCert(null); }}>
              Back to Certifications
            </Button>
          </div>
        </motion.div>

        {/* Certificate View */}
        <Dialog open={!!showCert} onOpenChange={() => setShowCert(null)}>
          <DialogContent className="sm:max-w-3xl">
            {showCert && selectedCert && (
              <div className="space-y-4">
                {/* Certificate Document */}
                <div className="relative bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-amber-950/20 dark:via-background dark:to-yellow-950/10 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-8 text-center">
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>

                  <div className="py-4">
                    <p className="text-xs font-semibold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-2">DataTrack Pro</p>
                    <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-1">Certificate of Achievement</h3>
                    <div className="w-24 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">This certifies that</p>
                    <p className="text-xl font-bold mb-2">{store.profile?.name || 'Student'}</p>
                    <p className="text-sm text-muted-foreground mb-4">has successfully passed the examination for</p>
                    <p className="text-lg font-semibold text-amber-700 dark:text-amber-300">{selectedCert.title}</p>
                    <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
                      <div>
                        <p className="font-semibold text-foreground">Score: {showCert.score}%</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Date: {showCert.date}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                      <p className="text-[10px] text-muted-foreground">
                        Cert ID: {generateCertId(selectedCert)} · Verify: {generateVerifyCode()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setShowCert(null)}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main Certifications View
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Award className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Pro Certifications</h1>
          <p className="text-muted-foreground text-sm">Validate your expertise with industry-recognized certifications</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Award, label: 'Available Certs', value: certifications.length.toString(), color: 'text-amber-500' },
          { icon: Trophy, label: 'Passed', value: certifications.filter((c) => hasPassed(c.id)).length.toString(), color: 'text-emerald-500' },
          { icon: BarChart3, label: 'Exams Taken', value: completedExams.length.toString(), color: 'text-blue-500' },
          { icon: Target, label: 'Pass Rate', value: completedExams.length > 0 ? `${Math.round((completedExams.filter((e) => e.passed).length / completedExams.length) * 100)}%` : '—', color: 'text-violet-500' },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 bg-muted/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Certification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert, index) => {
          const attempts = getExamAttempts(cert.id);
          const best = getBestResult(cert.id);
          const passed = hasPassed(cert.id);

          return (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
                <div className={`h-3 bg-gradient-to-r ${cert.gradient}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px]">{cert.difficulty}</Badge>
                        {passed && <Badge className="bg-emerald-500 text-white text-[10px]"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Passed</Badge>}
                      </div>
                      <h3 className="font-bold text-base mb-1">{cert.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{cert.description}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl ${cert.iconBg} flex items-center justify-center shrink-0`}>
                      <Award className="w-7 h-7" style={{ color: 'inherit' }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold">${cert.fee}</p>
                      <p className="text-[10px] text-muted-foreground">Exam Fee</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{cert.duration}m</p>
                      <p className="text-[10px] text-muted-foreground">Duration</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{cert.questions}</p>
                      <p className="text-[10px] text-muted-foreground">Questions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{cert.passingScore}%</p>
                      <p className="text-[10px] text-muted-foreground">Pass Score</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Topics Covered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cert.topics.slice(0, 4).map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-[10px] py-0">{topic}</Badge>
                      ))}
                      {cert.topics.length > 4 && (
                        <Badge variant="secondary" className="text-[10px] py-0">+{cert.topics.length - 4} more</Badge>
                      )}
                    </div>
                  </div>

                  {attempts > 0 && !passed && (
                    <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {attempts}/3 attempts used · {3 - attempts} remaining
                        {best && ` · Best: ${Math.round((best.score / best.total) * 100)}%`}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    {passed ? (
                      <Button
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                        onClick={() => setShowCert({ certId: cert.id, score: Math.round((best!.score / best!.total) * 100), date: best!.date })}
                      >
                        <Download className="w-4 h-4 mr-2" /> View Certificate
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        onClick={() => startExam(cert)}
                        disabled={attempts >= 3}
                      >
                        {attempts >= 3 ? (
                          <><XCircle className="w-4 h-4 mr-2" /> Max Attempts Reached</>
                        ) : (
                          <><Star className="w-4 h-4 mr-2" /> Start Exam (${cert.fee})</>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
