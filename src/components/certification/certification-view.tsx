'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Trophy,
  XCircle,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  BarChart3,
  Target,
  AlertTriangle,
  Award,
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Certification {
  id: string;
  name: string;
  provider: string;
  icon: string;
  color: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  questions: Question[];
}

interface CertScore {
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastDate: number;
}

const CERTIFICATIONS: Certification[] = [
  {
    id: 'pl300',
    name: 'Microsoft Power BI Data Analyst (PL-300)',
    provider: 'Microsoft',
    icon: '\u{1F4CA}',
    color: 'from-blue-500 to-indigo-600',
    difficulty: 'Intermediate',
    duration: 30,
    questions: [
      { id: 1, question: 'Which DAX function is used to evaluate an expression in a modified filter context?', options: ['CALCULATE', 'SUMX', 'FILTER', 'ALL'], correct: 0, explanation: 'CALCULATE is the primary function for modifying filter context in DAX evaluations. It evaluates its first argument in a modified filter context defined by subsequent arguments.' },
      { id: 2, question: 'What is the purpose of Power Query in Power BI?', options: ['Create visualizations', 'Connect, transform, and load data', 'Write DAX measures', 'Design dashboards'], correct: 1, explanation: 'Power Query (M language) is used for data extraction, transformation, and loading (ETL). It connects to data sources, transforms data shapes, and loads it into the data model.' },
      { id: 3, question: 'Which visual in Power BI is best suited for showing the composition of a whole?', options: ['Line chart', 'Scatter plot', 'Pie chart', 'Waterfall chart'], correct: 2, explanation: 'Pie charts are specifically designed to show parts of a whole. Each slice represents a proportion of the total, making it easy to see relative sizes.' },
      { id: 4, question: 'What does the "Remove Other Columns" step do in Power Query?', options: ['Deletes the entire table', 'Keeps only the selected columns', 'Removes duplicate rows', 'Filters null values'], correct: 1, explanation: '"Remove Other Columns" keeps only the columns you have selected and discards all others. This is useful for reducing the data model size.' },
      { id: 5, question: 'In DAX, what does the RELATED() function do?', options: ['Filters a table', 'Returns a related value from another table', 'Creates a new calculated table', 'Removes duplicate values'], correct: 1, explanation: 'RELATED() follows an existing relationship between two tables and retrieves a value from the related table. It requires an active many-to-one relationship.' },
      { id: 6, question: 'Which Power BI feature allows you to organize visuals into separate pages for different audiences?', options: ['Bookmarks', 'Row-level security', 'Tabbed pages', 'Drill-through'], correct: 2, explanation: 'Tabbed pages allow you to create separate report pages. Each page can have its own set of visuals tailored for different audiences or analysis needs.' },
      { id: 7, question: 'What is the purpose of a KPI (Key Performance Indicator) visual in Power BI?', options: ['Display a trend line', 'Show actual value against a target', 'Create a data table', 'Compare two measures side by side'], correct: 1, explanation: 'A KPI visual shows an indicator (icon), the actual value, and a comparison to a target value. It helps quickly assess performance against goals.' },
      { id: 8, question: 'Which DAX function returns a table with all rows from both the left and right tables, including matched and unmatched rows?', options: ['NATURALINNERJOIN', 'CROSSJOIN', 'NATURALLEFTOUTERJOIN', 'GENERATE'], correct: 2, explanation: 'NATURALLEFTOUTERJOIN returns all rows from the left table and matched rows from the right table, with NULLs where no match exists.' },
      { id: 9, question: 'What does incremental refresh help with in Power BI Premium?', options: ['Faster report rendering', 'Reducing data refresh time for large datasets', 'Auto-creating relationships', 'Improving DAX performance'], correct: 1, explanation: 'Incremental refresh allows you to partition and refresh only recent data rather than the entire dataset, significantly reducing refresh times for large models.' },
      { id: 10, question: 'How do you create a hierarchy in Power BI Desktop?', options: ['Use the Modeling tab > Create Hierarchy', 'Right-click a column in the Fields pane', 'Use DAX to define hierarchy', 'Import hierarchy from Excel'], correct: 1, explanation: 'You can create a hierarchy by right-clicking a column in the Fields pane and selecting "New hierarchy". Then drag and drop columns to define levels.' },
      { id: 11, question: 'What is the difference between calculated columns and measures in Power BI?', options: ['They are the same thing', 'Calculated columns are row-by-row, measures are aggregations', 'Measures are slower', 'Calculated columns cannot use DAX'], correct: 1, explanation: 'Calculated columns are evaluated for each row during data load and stored in memory. Measures are calculated on-the-fly at query time based on filter context and aggregations.' },
      { id: 12, question: 'Which file format is used for Power BI Desktop files?', options: ['.pbix', '.pbit', '.pbids', '.xlsx'], correct: 0, explanation: '.pbix is the standard Power BI Desktop file format. .pbit is a template file, and .pbids is a Power BI data source file.' },
      { id: 13, question: 'What is the purpose of bidirectional cross-filtering in Power BI relationships?', options: ['Improves performance', 'Allows filters to flow in both directions', 'Creates duplicate data', 'Enables many-to-many relationships'], correct: 1, explanation: 'Bidirectional cross-filtering allows filter context to flow from the "one" side to the "many" side and vice versa. It should be used cautiously as it can affect performance.' },
      { id: 14, question: 'Which Power BI tool is used to ensure data quality by defining rules for data formatting?', options: ['Dataflows', 'DAX Studio', 'Power Query Editor', 'Deployment Pipeline'], correct: 2, explanation: 'Power Query Editor provides tools for defining data formatting rules, cleaning steps, and transformations to ensure data quality before loading into the model.' },
      { id: 15, question: 'What is the recommended practice for managing row-level security (RLS) in Power BI?', options: ['Create separate reports for each user', 'Use DAX filters with USERNAME() or USERPRINCIPALNAME()', 'Hide rows manually', 'Use Excel filters'], correct: 1, explanation: 'RLS is implemented by creating DAX filter expressions that use USERNAME() or USERPRINCIPALNAME() functions to restrict data access based on the logged-in user.' },
    ],
  },
  {
    id: 'google-da',
    name: 'Google Data Analytics Professional',
    provider: 'Google',
    icon: '\u{1F4C8}',
    color: 'from-emerald-500 to-teal-600',
    difficulty: 'Beginner',
    duration: 30,
    questions: [
      { id: 1, question: 'What is the first step in the data analysis process?', options: ['Data visualization', 'Define the business question', 'Clean the data', 'Build a dashboard'], correct: 1, explanation: 'Every data analysis should start with a clear business question to guide the investigation. This ensures the analysis stays focused and relevant to stakeholders.' },
      { id: 2, question: 'Which tool is commonly used for data cleaning in Google Sheets?', options: ['Pivot tables', 'Remove duplicates and TRIM/SPLIT functions', 'Conditional formatting', 'Charts'], correct: 1, explanation: 'Google Sheets provides Remove Duplicates under Data menu and functions like TRIM (remove extra spaces) and SPLIT (divide text) for effective data cleaning.' },
      { id: 3, question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Question Language', 'Standard Query Logic', 'System Query Language'], correct: 0, explanation: 'SQL stands for Structured Query Language. It is the standard language for managing and manipulating relational databases.' },
      { id: 4, question: 'In the context of spreadsheets, what is a VLOOKUP used for?', options: ['Creating charts', 'Searching for a value in the first column of a range and returning a value from another column', 'Validating data entry', 'Sorting data alphabetically'], correct: 1, explanation: 'VLOOKUP (Vertical Lookup) searches for a value in the first column of a table array and returns a value from the same row in a specified column.' },
      { id: 5, question: 'What type of data analysis focuses on understanding past events?', options: ['Predictive analysis', 'Descriptive analysis', 'Prescriptive analysis', 'Diagnostic analysis'], correct: 1, explanation: 'Descriptive analysis focuses on summarizing historical data to understand what happened. Common techniques include aggregation, statistics, and data visualization.' },
      { id: 6, question: 'Which R function is used to read a CSV file?', options: ['read.csv()', 'import.csv()', 'open.csv()', 'load.csv()'], correct: 0, explanation: 'read.csv() is the standard R function for reading CSV files into a data frame. It automatically detects headers and handles comma-separated values.' },
      { id: 7, question: 'What is the purpose of a scatter plot in data analysis?', options: ['Show data over time', 'Display the relationship between two numerical variables', 'Compare categorical data', 'Show parts of a whole'], correct: 1, explanation: 'Scatter plots display the relationship between two continuous numerical variables. Each point represents an observation, helping identify correlations, clusters, and outliers.' },
      { id: 8, question: 'What is a primary key in a database?', options: ['A password for database access', 'A unique identifier for each record in a table', 'The most important column', 'A type of join operation'], correct: 1, explanation: 'A primary key is a column (or set of columns) that uniquely identifies each record in a database table. It enforces entity integrity and enables relationships.' },
      { id: 9, question: 'Which phase of the data analysis process involves removing outliers and handling missing values?', options: ['Data collection', 'Data cleaning', 'Data modeling', 'Data sharing'], correct: 1, explanation: 'Data cleaning involves identifying and correcting errors, removing outliers, handling missing values, and ensuring data consistency before analysis.' },
      { id: 10, question: 'What is the difference between qualitative and quantitative data?', options: ['Qualitative data is always more accurate', 'Qualitative data is descriptive, quantitative data is numerical', 'Quantitative data is subjective', 'They are the same thing'], correct: 1, explanation: 'Qualitative data is descriptive and categorical (e.g., colors, opinions). Quantitative data is numerical and measurable (e.g., temperature, sales figures).' },
      { id: 11, question: 'What is a confidence interval in statistics?', options: ['The range of all possible values', 'A range that likely contains the true population parameter', 'The probability of an event', 'A measure of data spread'], correct: 1, explanation: 'A confidence interval provides a range of values within which the true population parameter is likely to fall, with a specified level of confidence (e.g., 95%).' },
      { id: 12, question: 'In R, what does the str() function do?', options: ['Stores a string variable', 'Displays the structure of an object', 'Converts data to strings', 'Creates a new data frame'], correct: 1, explanation: 'str() (structure) displays the internal structure of an R object, showing data types, dimensions, and a preview of values. It is essential for understanding data frames.' },
      { id: 13, question: 'What is bias in data analysis?', options: ['A type of chart', 'Systematic error that leads to inaccurate conclusions', 'A database term', 'A Python library'], correct: 1, explanation: 'Bias in data analysis refers to systematic errors that skew results. Types include sampling bias, confirmation bias, and selection bias, all leading to inaccurate conclusions.' },
      { id: 14, question: 'Which chart type is best for showing trends over time?', options: ['Pie chart', 'Bar chart', 'Line chart', 'Scatter plot'], correct: 2, explanation: 'Line charts are ideal for displaying trends over continuous time periods. The connected points make it easy to see upward/downward patterns, seasonality, and changes.' },
      { id: 15, question: 'What is the purpose of documentation in data analysis?', options: ['To make the report look professional', 'To ensure reproducibility and transparency of the analysis', 'To increase file size', 'To hide the methodology'], correct: 1, explanation: 'Documentation ensures that the analysis process is transparent, reproducible, and understandable by others. It includes code comments, methodology notes, and data dictionaries.' },
    ],
  },
  {
    id: 'sql-cert',
    name: 'SQL Certification Exam',
    provider: 'DataTrack Pro',
    icon: '\u{1F5C3}\uFE0F',
    color: 'from-violet-500 to-purple-600',
    difficulty: 'Intermediate',
    duration: 30,
    questions: [
      { id: 1, question: 'Which JOIN type returns all rows from both tables, matching where possible?', options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'], correct: 2, explanation: 'FULL OUTER JOIN returns all rows from both tables, with NULLs where there is no match in either the left or right table.' },
      { id: 2, question: 'What does the GROUP BY clause do in SQL?', options: ['Filters rows based on a condition', 'Groups rows that have the same values in specified columns', 'Sorts the result set', 'Joins multiple tables'], correct: 1, explanation: 'GROUP BY groups rows sharing the same values in specified columns. It is typically used with aggregate functions like COUNT, SUM, AVG to produce summary rows.' },
      { id: 3, question: 'Which SQL function returns the number of rows that match a criterion?', options: ['SUM()', 'COUNT()', 'TOTAL()', 'NUMBER()'], correct: 1, explanation: 'COUNT() returns the number of rows that match the specified criteria. COUNT(*) counts all rows, while COUNT(column) counts non-null values in that column.' },
      { id: 4, question: 'What is the difference between WHERE and HAVING clauses?', options: ['They are identical', 'WHERE filters rows before grouping, HAVING filters groups after grouping', 'WHERE is for DELETE, HAVING is for SELECT', 'WHERE is faster but less accurate'], correct: 1, explanation: 'WHERE filters individual rows before GROUP BY aggregation. HAVING filters the aggregated groups after GROUP BY, allowing conditions on aggregate results.' },
      { id: 5, question: 'Which SQL command is used to remove all rows from a table without logging individual row deletions?', options: ['DELETE FROM table', 'DROP TABLE', 'TRUNCATE TABLE', 'REMOVE TABLE'], correct: 2, explanation: 'TRUNCATE TABLE removes all rows quickly by deallocating data pages. Unlike DELETE, it is minimally logged and cannot be rolled back in some databases.' },
      { id: 6, question: 'What is a subquery in SQL?', options: ['A query within another query', 'A query that runs multiple times', 'A query with no results', 'A backup query'], correct: 0, explanation: 'A subquery (or inner query) is a query nested inside another query. It can be used in SELECT, FROM, or WHERE clauses and returns values used by the outer query.' },
      { id: 7, question: 'Which constraint ensures that a column cannot have NULL values?', options: ['UNIQUE', 'PRIMARY KEY', 'NOT NULL', 'CHECK'], correct: 2, explanation: 'The NOT NULL constraint enforces that a column must always contain a value. Without it, the column can store NULL values representing missing or unknown data.' },
      { id: 8, question: 'What does the COALESCE function do in SQL?', options: ['Combines two strings', 'Returns the first non-null value from a list', 'Counts null values', 'Replaces null with zero'], correct: 1, explanation: 'COALESCE(value1, value2, ...) evaluates the arguments in order and returns the first non-null value. It is commonly used to handle NULL values in queries.' },
      { id: 9, question: 'What is a window function in SQL?', options: ['A function that opens a new database window', 'A function that performs calculations across a set of rows related to the current row', 'A function for sorting results', 'A function for creating views'], correct: 1, explanation: 'Window functions (like ROW_NUMBER, RANK, LEAD, LAG) perform calculations across a set of rows related to the current row without collapsing the result set like GROUP BY.' },
      { id: 10, question: 'Which SQL statement is used to create a new table from the result of a query?', options: ['CREATE TABLE AS SELECT', 'INSERT INTO SELECT', 'SELECT INTO', 'Both A and C'], correct: 3, explanation: 'Both CREATE TABLE AS SELECT (PostgreSQL, Oracle) and SELECT INTO (SQL Server, MySQL) create new tables from query results. The syntax varies by RDBMS.' },
      { id: 11, question: 'What is the difference between CHAR and VARCHAR data types?', options: ['CHAR is for numbers, VARCHAR for text', 'CHAR has fixed length, VARCHAR has variable length', 'VARCHAR is always faster', 'They are the same'], correct: 1, explanation: 'CHAR(n) always stores exactly n characters (padded with spaces). VARCHAR(n) stores up to n characters plus length info, making it more space-efficient for varying-length data.' },
      { id: 12, question: 'Which SQL operator is used for pattern matching with wildcards?', options: ['= ANY', 'LIKE', 'IN', 'BETWEEN'], correct: 1, explanation: 'LIKE with wildcards (% for zero or more characters, _ for single character) is used for pattern matching in string comparisons.' },
      { id: 13, question: 'What does the DISTINCT keyword do?', options: ['Sorts the results', 'Removes duplicate rows from the result set', 'Counts unique values only', 'Selects only odd-numbered rows'], correct: 1, explanation: 'DISTINCT eliminates duplicate rows from the result set, returning only unique values. It applies to all columns in the SELECT list.' },
      { id: 14, question: 'What is a CTE (Common Table Expression)?', options: ['A permanent table', 'A temporary named result set defined using WITH keyword', 'A type of index', 'A database trigger'], correct: 1, explanation: 'A CTE is a temporary named result set created using the WITH keyword. It improves readability for complex queries and supports recursion for hierarchical data.' },
      { id: 15, question: 'Which SQL clause is used to sort the result set?', options: ['GROUP BY', 'FILTER BY', 'ORDER BY', 'SORT BY'], correct: 2, explanation: 'ORDER BY sorts the result set in ascending (ASC, default) or descending (DESC) order. It can sort by one or more columns with different sort directions.' },
    ],
  },
  {
    id: 'aws-da',
    name: 'AWS Certified Data Analytics',
    provider: 'Amazon',
    icon: '\u2601\uFE0F',
    color: 'from-amber-500 to-orange-600',
    difficulty: 'Advanced',
    duration: 30,
    questions: [
      { id: 1, question: 'Which AWS service is used for data warehousing at petabyte scale?', options: ['RDS', 'Redshift', 'DynamoDB', 'Athena'], correct: 1, explanation: 'Amazon Redshift is AWS\'s fast, fully managed petabyte-scale data warehouse service. It uses columnar storage and parallel query execution for high performance.' },
      { id: 2, question: 'What is the primary use case for Amazon Athena?', options: ['Running machine learning models', 'Querying data stored in S3 using standard SQL', 'Building ETL pipelines', 'Streaming data processing'], correct: 1, explanation: 'Amazon Athena is a serverless interactive query service that enables you to analyze data directly in Amazon S3 using standard SQL without loading data into a database.' },
      { id: 3, question: 'Which AWS service provides a fully managed Apache Spark environment?', options: ['EMR', 'Glue', 'Lambda', 'ECS'], correct: 0, explanation: 'Amazon EMR (Elastic MapReduce) provides a managed Hadoop and Apache Spark framework for processing large datasets. It supports Spark, Hive, Presto, and other big data tools.' },
      { id: 4, question: 'What is AWS Glue primarily used for?', options: ['Data visualization', 'ETL (Extract, Transform, Load) and data cataloging', 'Real-time analytics', 'Machine learning'], correct: 1, explanation: 'AWS Glue is a serverless ETL service and data catalog. It automatically discovers and catalogs metadata, generates ETL code, and runs jobs on a Spark platform.' },
      { id: 5, question: 'Which AWS service is best for real-time streaming data processing?', options: ['S3', 'Kinesis Data Streams', 'Redshift', 'Athena'], correct: 1, explanation: 'Amazon Kinesis Data Streams enables real-time processing of streaming data at scale. It can capture gigabytes of data per second from hundreds of thousands of sources.' },
      { id: 6, question: 'What is Amazon QuickSight used for?', options: ['Data storage', 'Business intelligence and data visualization', 'Data migration', 'API management'], correct: 1, explanation: 'Amazon QuickSight is a fast, cloud-powered business intelligence service for building interactive visualizations, performing ad-hoc analysis, and embedding dashboards.' },
      { id: 7, question: 'Which AWS service provides a NoSQL database with single-digit millisecond performance?', options: ['RDS', 'Aurora', 'DynamoDB', 'Redshift'], correct: 2, explanation: 'Amazon DynamoDB is a serverless NoSQL database with consistent, single-digit millisecond performance at any scale. It supports key-value and document data models.' },
      { id: 8, question: 'What is the purpose of AWS Lake Formation?', options: ['Creating relational databases', 'Setting up secure data lakes in days instead of months', 'Building machine learning models', 'Managing server infrastructure'], correct: 1, explanation: 'AWS Lake Formation makes it easy to set up, secure, and manage data lakes in days. It provides fine-grained access control, audit logging, and automated data discovery.' },
      { id: 9, question: 'Which data format is recommended for optimal query performance in Athena?', options: ['CSV', 'JSON', 'Parquet', 'XML'], correct: 2, explanation: 'Apache Parquet is a columnar storage format that provides excellent compression and query performance. It is the recommended format for Athena queries on S3 data.' },
      { id: 10, question: 'What is AWS Glue DataBrew used for?', options: ['Building data pipelines', 'Visual data preparation for analysts without coding', 'Database management', 'Stream processing'], correct: 1, explanation: 'AWS Glue DataBrew is a visual data preparation tool that enables data analysts and data scientists to clean and normalize data without writing code.' },
      { id: 11, question: 'Which service provides orchestration for multi-step ETL workflows in AWS?', options: ['Lambda', 'Step Functions', 'SQS', 'CloudFormation'], correct: 1, explanation: 'AWS Step Functions lets you coordinate multiple AWS services into serverless workflows. It is ideal for orchestrating multi-step ETL processes with built-in error handling.' },
      { id: 12, question: 'What is the benefit of using Amazon S3 as a data lake storage layer?', options: ['It provides the fastest query performance', 'It offers virtually unlimited durability, scalability, and cost-effectiveness', 'It supports ACID transactions', 'It replaces all database needs'], correct: 1, explanation: 'Amazon S3 provides 99.999999999% durability, virtually unlimited storage, tiered pricing, and integrates with nearly all AWS analytics services, making it the ideal data lake foundation.' },
      { id: 13, question: 'Which AWS analytics service is optimized for clickstream analytics and time-series data?', options: ['Redshift', 'Athena', 'Redshift Spectrum', 'OpenSearch Service'], correct: 1, explanation: 'Amazon Athena is well-suited for clickstream and time-series analysis due to its serverless nature, ability to query data directly from S3, and support for complex SQL analytics.' },
      { id: 14, question: 'What is the role of Amazon Kinesis Data Firehose?', options: ['Running SQL queries on streams', 'Delivering streaming data to destinations like S3, Redshift, and OpenSearch', 'Building real-time dashboards', 'Monitoring data quality'], correct: 1, explanation: 'Kinesis Data Firehose automatically captures, transforms, and delivers streaming data to destinations like S3, Redshift, OpenSearch, and Splunk with near real-time latency.' },
      { id: 15, question: 'What does the "Data Catalog" in AWS Glue provide?', options: ['A list of all AWS services', 'A centralized metadata repository for data assets', 'A pricing calculator', 'A security policy manager'], correct: 1, explanation: 'The AWS Glue Data Catalog is a centralized metadata repository that stores table definitions, schema information, and data source connections. It integrates with Athena, Redshift Spectrum, and EMR.' },
    ],
  },
];

function loadCertScores(): Record<string, CertScore> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('datatrack-cert-scores');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCertScores(scores: Record<string, CertScore>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('datatrack-cert-scores', JSON.stringify(scores));
  } catch {
    // silently fail
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-500';
  if (score >= 70) return 'text-amber-500';
  return 'text-red-500';
}

function getGrade(score: number) {
  if (score >= 90) return { label: 'Excellent', emoji: '\u{1F3C6}' };
  if (score >= 70) return { label: 'Pass', emoji: '\u2705' };
  return { label: 'Fail', emoji: '\u274C' };
}

export default function CertificationView() {
  const [view, setView] = useState<'select' | 'exam' | 'review'>('select');
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [certScores, setCertScores] = useState<Record<string, CertScore>>(() => loadCertScores());
  const [scoreRevealed, setScoreRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSubmittedRef = useRef(false);

  const selectedCertRef = useRef<Certification | null>(null);
  const answersRef = useRef<Record<number, number>>({});
  const certScoresRef = useRef<Record<string, CertScore>>({});

  const doSubmit = useCallback(() => {
    const cert = selectedCertRef.current;
    const currentAnswers = answersRef.current;
    if (!cert || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const totalCorrect = cert.questions.reduce(
      (acc, q) => acc + (currentAnswers[q.id] === q.correct ? 1 : 0),
      0
    );
    const scorePercent = Math.round((totalCorrect / cert.questions.length) * 100);

    const prev = certScoresRef.current[cert.id];
    const newScore: CertScore = {
      attempts: (prev?.attempts || 0) + 1,
      bestScore: Math.max(prev?.bestScore || 0, scorePercent),
      lastScore: scorePercent,
      lastDate: Date.now(),
    };
    const updated = { ...certScoresRef.current, [cert.id]: newScore };
    setCertScores(updated);
    certScoresRef.current = updated;
    saveCertScores(updated);
    setScoreRevealed(false);
    setView('review');

    setTimeout(() => setScoreRevealed(true), 100);
  }, []);

  const startExam = useCallback((cert: Certification) => {
    selectedCertRef.current = cert;
    answersRef.current = {};
    certScoresRef.current = loadCertScores();
    hasSubmittedRef.current = false;
    setSelectedCert(cert);
    setCurrentQuestion(0);
    setAnswers({});
    setFlagged(new Set());
    setTimeLeft(cert.duration * 60);
    setExamStarted(true);
    setScoreRevealed(false);
    setView('exam');
  }, []);

  const submitExam = useCallback(() => {
    selectedCertRef.current = selectedCert;
    answersRef.current = answers;
    certScoresRef.current = certScores;
    doSubmit();
  }, [selectedCert, answers, certScores, doSubmit]);

  useEffect(() => {
    if (view === 'exam' && examStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Auto-submit will be handled by the effect below
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (view === 'exam' && examStarted && timeLeft === 0) {
      doSubmit();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [view, examStarted, timeLeft, doSubmit]);

  const toggleFlag = (questionId: number) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  if (!selectedCert || view === 'select') {
    return <CertSelectionScreen certifications={CERTIFICATIONS} certScores={certScores} onStart={startExam} />;
  }

  if (view === 'exam') {
    const cert = selectedCert;
    const question = cert.questions[currentQuestion];
    const totalQuestions = cert.questions.length;
    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / totalQuestions) * 100;
    const isTimeWarning = timeLeft <= 300;

    return (
      <div className="space-y-6">
        {/* Exam Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setExamStarted(false); setView('select'); }}>
              <ArrowLeft className="size-4 mr-1" />
              Back
            </Button>
            <div>
              <h2 className="text-lg font-bold">{cert.icon} {cert.name}</h2>
              <p className="text-sm text-muted-foreground">{cert.provider}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isTimeWarning ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30' : 'border-border bg-muted/50'}`}>
              <Clock className={`size-4 ${isTimeWarning ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
              <span className={`font-mono font-bold text-lg ${isTimeWarning ? 'text-red-500' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{answeredCount} of {totalQuestions} answered</span>
            <span>Question {currentQuestion + 1}/{totalQuestions}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">Q{currentQuestion + 1}</Badge>
                    {flagged.has(question.id) && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                        <Flag className="size-3 mr-1" /> Flagged
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlag(question.id)}
                    className={flagged.has(question.id) ? 'text-amber-500' : 'text-muted-foreground'}
                  >
                    <Flag className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                <h3 className="text-base font-semibold leading-relaxed">
                  {question.question}
                </h3>

                <RadioGroup
                  value={answers[question.id]?.toString() ?? ''}
                  onValueChange={(val) => setAnswers((prev) => ({ ...prev, [question.id]: parseInt(val) }))}
                  className="space-y-3"
                >
                  {question.options.map((option, idx) => (
                    <motion.label
                      key={idx}
                      htmlFor={`q-${question.id}-opt-${idx}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        answers[question.id] === idx
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <RadioGroupItem value={idx.toString()} id={`q-${question.id}-opt-${idx}`} />
                      <span className="text-sm font-medium text-muted-foreground w-6">{String.fromCharCode(65 + idx)}.</span>
                      <span className="text-sm">{option}</span>
                    </motion.label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="size-4 mr-1" /> Previous
          </Button>

          <div className="flex gap-1.5 flex-wrap justify-center max-w-md">
            {cert.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${
                  idx === currentQuestion
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : answers[q.id] !== undefined
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : flagged.has(q.id)
                        ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                        : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion < totalQuestions - 1 ? (
            <Button onClick={() => setCurrentQuestion((prev) => prev + 1)}>
              Next <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submitExam} variant="default" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              Submit Exam
            </Button>
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/10 border border-primary/20" />
            Answered
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800" />
            Flagged
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-muted border border-border" />
            Unanswered
          </div>
        </div>
      </div>
    );
  }

  if (view === 'review' && selectedCert) {
    const cert = selectedCert;
    const totalCorrect = cert.questions.reduce(
      (acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0),
      0
    );
    const scorePercent = Math.round((totalCorrect / cert.questions.length) * 100);
    const passed = scorePercent >= 70;
    const grade = getGrade(scorePercent);
    const scoreInfo = certScores[cert.id];

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => setView('select')}>
          <ArrowLeft className="size-4 mr-1" />
          All Certifications
        </Button>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <Card className="overflow-hidden">
            <div className={`bg-gradient-to-r ${cert.color} p-6 text-white`}>
              <div className="flex flex-col items-center text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={scoreRevealed ? { scale: 1, rotate: [0, -10, 10, 0] } : { scale: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {passed ? (
                    <Trophy className="size-16 text-yellow-300 drop-shadow-lg" />
                  ) : (
                    <XCircle className="size-16 text-white/80 drop-shadow-lg" />
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={scoreRevealed ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="space-y-1"
                >
                  <p className="text-sm font-medium text-white/80">{grade.label}</p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={scoreRevealed ? { opacity: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="text-5xl font-black"
                  >
                    {scorePercent}%
                  </motion.div>
                  <p className="text-sm text-white/70">
                    {totalCorrect} of {cert.questions.length} correct answers
                  </p>
                </motion.div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={scoreRevealed ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8 }}
                  className="text-center p-3 rounded-lg bg-muted/50"
                >
                  <Target className="size-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Attempts</p>
                  <p className="text-lg font-bold">{scoreInfo?.attempts || 1}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={scoreRevealed ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.9 }}
                  className="text-center p-3 rounded-lg bg-muted/50"
                >
                  <Award className="size-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Best Score</p>
                  <p className={`text-lg font-bold ${getScoreColor(scoreInfo?.bestScore || 0)}`}>
                    {scoreInfo?.bestScore || 0}%
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={scoreRevealed ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 1.0 }}
                  className="text-center p-3 rounded-lg bg-muted/50"
                >
                  <BarChart3 className="size-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                  <p className={`text-lg font-bold ${getScoreColor(scoreInfo?.lastScore || 0)}`}>
                    {scoreInfo?.lastScore || 0}%
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={scoreRevealed ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 1.1 }}
                  className="text-center p-3 rounded-lg bg-muted/50"
                >
                  <Clock className="size-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Time Used</p>
                  <p className="text-lg font-bold">
                    {formatTime(cert.duration * 60 - timeLeft)}
                  </p>
                </motion.div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  onClick={() => startExam(cert)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  <RotateCcw className="size-4 mr-2" />
                  Retake Exam
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setView('select')}
                  className="flex-1"
                >
                  Choose Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Question-by-Question Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <h3 className="text-lg font-bold mb-4">Review Answers</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {cert.questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct;
              const wasSkipped = userAnswer === undefined;

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + idx * 0.05 }}
                >
                  <Card className={`overflow-hidden ${!isCorrect && !wasSkipped ? 'border-red-200 dark:border-red-800/50' : isCorrect ? 'border-emerald-200 dark:border-emerald-800/50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 mt-0.5 ${isCorrect ? 'text-emerald-500' : wasSkipped ? 'text-amber-500' : 'text-red-500'}`}>
                          {isCorrect ? (
                            <CheckCircle2 className="size-5" />
                          ) : wasSkipped ? (
                            <AlertTriangle className="size-5" />
                          ) : (
                            <XCircle className="size-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground mr-2">Q{idx + 1}.</span>
                            {q.question}
                          </p>
                          <div className="space-y-1.5">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`text-xs px-2.5 py-1.5 rounded-md flex items-center gap-2 ${
                                  optIdx === q.correct
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                                    : optIdx === userAnswer && !isCorrect
                                      ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                                      : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                <span className="font-medium">{String.fromCharCode(65 + optIdx)}.</span>
                                <span>{opt}</span>
                                {optIdx === q.correct && <CheckCircle2 className="size-3 ml-auto shrink-0" />}
                                {optIdx === userAnswer && !isCorrect && optIdx !== q.correct && (
                                  <XCircle className="size-3 ml-auto shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className={`text-xs p-2.5 rounded-md mt-2 ${
                            isCorrect
                              ? 'bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                              : 'bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30'
                          }`}>
                            <span className="font-semibold">
                              {isCorrect ? 'Correct! ' : wasSkipped ? 'Skipped. ' : 'Incorrect. '}
                            </span>
                            {q.explanation}
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
      </div>
    );
  }

  return null;
}

/* ========= Selection Screen ========= */

function CertSelectionScreen({
  certifications,
  certScores,
  onStart,
}: {
  certifications: Certification[];
  certScores: Record<string, CertScore>;
  onStart: (cert: Certification) => void;
}) {
  const totalAttempts = Object.values(certScores).reduce((sum, s) => sum + (s?.attempts || 0), 0);
  const passedCerts = Object.values(certScores).filter((s) => s && s.bestScore >= 70).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Certification Prep</h2>
        <p className="text-muted-foreground mt-1">
          Practice with realistic exam questions and track your progress across certifications.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Available', value: certifications.length, icon: '\u{1F4DA}' },
          { label: 'Total Attempts', value: totalAttempts, icon: '\u{1F50D}' },
          { label: 'Passed', value: passedCerts, icon: '\u2705' },
          { label: 'Pass Threshold', value: '70%', icon: '\u{1F3AF}' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl border bg-card"
          >
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert, idx) => {
          const score = certScores[cert.id];
          return (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                <div className={`bg-gradient-to-r ${cert.color} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cert.icon}</span>
                      <div className="text-white">
                        <h3 className="font-bold text-sm leading-tight">{cert.name}</h3>
                        <p className="text-white/80 text-xs mt-0.5">{cert.provider}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getDiffBadgeColor(cert.difficulty)}`}>
                      {cert.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="size-3.5" />
                      {cert.questions.length} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {cert.duration} min
                    </span>
                  </div>

                  {score && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Best Score</span>
                        <span className={`font-bold ${getScoreColor(score.bestScore)}`}>
                          {score.bestScore}%
                          {score.bestScore >= 70 && <CheckCircle2 className="inline size-3 ml-1" />}
                        </span>
                      </div>
                      <Progress value={score.bestScore} className="h-1.5" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{score.attempts} attempt{score.attempts > 1 ? 's' : ''}</span>
                        <span>Last: {score.lastScore}%</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto">
                    <Button
                      onClick={() => onStart(cert)}
                      className={`w-full bg-gradient-to-r ${cert.color} hover:opacity-90 text-white`}
                    >
                      {score ? 'Retake Exam' : 'Start Exam'}
                    </Button>
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

function getDiffBadgeColor(difficulty: string): string {
  switch (difficulty) {
    case 'Beginner': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'Intermediate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default: return '';
  }
}
