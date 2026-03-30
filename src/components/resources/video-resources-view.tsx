'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  BookOpen,
  FileText,
  GraduationCap,
  Play,
  Clock,
  Bookmark,
  BookmarkCheck,
  Filter,
  ExternalLink,
  Search,
  LayoutGrid,
  Globe,
  Sparkles,
  Youtube,
  BookMarked,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useProgressStore } from '@/lib/store';
import { subjects } from '@/lib/study-data';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  title: string;
  creator: string;
  type: 'video' | 'course' | 'article' | 'tutorial' | 'youtube' | 'documentation';
  duration: string;
  url: string;
  subjectId: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isFree: boolean;
  description: string;
}

const resources: Resource[] = [
  // ==================== Introduction to Data Analytics ====================
  {
    id: 'res-intro-1',
    title: 'Data Analysis Full Course',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '6 hours',
    url: 'https://www.youtube.com/watch?v=pEfrdAtAmqk',
    subjectId: 'intro-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'Comprehensive full course covering the entire data analysis workflow from data collection to visualization and storytelling.',
  },
  {
    id: 'res-intro-2',
    title: 'What is Data Analytics? Beginner\'s Guide',
    creator: 'Simplilearn',
    type: 'video',
    duration: '11:23',
    url: 'https://www.youtube.com/watch?v=LvA_B5bIeLs',
    subjectId: 'intro-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'A quick and clear introduction to what data analytics is, why it matters, and the key tools used by data analysts.',
  },
  {
    id: 'res-intro-3',
    title: 'Google Data Analytics Professional Certificate',
    creator: 'Google (Coursera)',
    type: 'course',
    duration: '6 months',
    url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    subjectId: 'intro-data-analytics',
    level: 'Beginner',
    isFree: false,
    description: 'Industry-recognized certificate covering the full data analysis process with hands-on projects using spreadsheets, SQL, and Tableau.',
  },
  {
    id: 'res-intro-4',
    title: 'Introduction to Data Science Specialization',
    creator: 'IBM (Coursera)',
    type: 'course',
    duration: '4 months',
    url: 'https://www.coursera.org/specializations/introduction-data-science',
    subjectId: 'intro-data-analytics',
    level: 'Beginner',
    isFree: false,
    description: 'Learn what data science is, the tools data scientists use, and foundational skills in data analysis and machine learning.',
  },
  {
    id: 'res-intro-5',
    title: 'The Complete Data Analytics Course',
    creator: '365 Careers (Udemy)',
    type: 'course',
    duration: '21 hours',
    url: 'https://www.udemy.com/course/the-complete-data-analytics-course/',
    subjectId: 'intro-data-analytics',
    level: 'Intermediate',
    isFree: false,
    description: 'A complete bootcamp teaching data analysis from scratch with Excel, SQL, Tableau, and real-world case studies.',
  },
  {
    id: 'res-intro-6',
    title: 'Data Analytics for Beginners',
    creator: 'freeCodeCamp (YouTube)',
    type: 'video',
    duration: '5 hours',
    url: 'https://www.youtube.com/watch?v=mvqKjmXGJoA',
    subjectId: 'intro-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'A beginner-friendly full course on data analytics covering data types, cleaning, analysis techniques, and visualization.',
  },
  {
    id: 'res-intro-7',
    title: 'Khan Academy Statistics & Probability',
    creator: 'Khan Academy',
    type: 'tutorial',
    duration: 'Self-paced',
    url: 'https://www.khanacademy.org/math/statistics-probability',
    subjectId: 'intro-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'Free interactive lessons covering foundational statistics and probability concepts essential for any data analyst.',
  },
  {
    id: 'res-intro-8',
    title: 'Alex the Analyst YouTube Channel',
    creator: 'Alex the Analyst',
    type: 'youtube',
    duration: 'Ongoing',
    url: 'https://www.youtube.com/@AlexTheAnalyst',
    subjectId: 'intro-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'One of the most popular data analytics YouTube channels with tutorials on SQL, Python, Tableau, and career advice for aspiring analysts.',
  },

  // ==================== Microsoft Excel ====================
  {
    id: 'res-excel-1',
    title: 'Excel Tutorial for Beginners',
    creator: 'Kevin Stratvert',
    type: 'video',
    duration: '27:21',
    url: 'https://www.youtube.com/watch?v=rwbho0CgEAE',
    subjectId: 'microsoft-excel',
    level: 'Beginner',
    isFree: true,
    description: 'A clear and practical beginner tutorial covering Excel basics including cells, formulas, formatting, and charts.',
  },
  {
    id: 'res-excel-2',
    title: 'Microsoft Excel Tutorial for Beginners - Full Course',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '4 hours',
    url: 'https://www.youtube.com/watch?v=q2BMm3mEJMo',
    subjectId: 'microsoft-excel',
    level: 'Beginner',
    isFree: true,
    description: 'Complete full course on Excel from the basics to intermediate topics including pivot tables, VLOOKUP, and data analysis.',
  },
  {
    id: 'res-excel-3',
    title: 'Excel Skills for Business Specialization',
    creator: 'Macquarie University (Coursera)',
    type: 'course',
    duration: '4 months',
    url: 'https://www.coursera.org/specializations/excel',
    subjectId: 'microsoft-excel',
    level: 'Beginner',
    isFree: false,
    description: 'Professional certificate teaching essential Excel skills for business including formulas, charts, pivot tables, and data management.',
  },
  {
    id: 'res-excel-4',
    title: 'Advanced Excel Tutorial',
    creator: 'Technology with Tim',
    type: 'tutorial',
    duration: '42:18',
    url: 'https://www.youtube.com/watch?v=MwJyuZ7e3TI',
    subjectId: 'microsoft-excel',
    level: 'Intermediate',
    isFree: true,
    description: 'Covers advanced Excel features including complex formulas, array functions, conditional formatting, and macros.',
  },
  {
    id: 'res-excel-5',
    title: 'Excel VLOOKUP, XLOOKUP, INDEX-MATCH Complete Guide',
    creator: 'Leila Gharani',
    type: 'tutorial',
    duration: '18:45',
    url: 'https://www.youtube.com/watch?v=L9oYsOzRJaw',
    subjectId: 'microsoft-excel',
    level: 'Intermediate',
    isFree: true,
    description: 'Master the three most important lookup functions in Excel with practical examples and real-world use cases.',
  },
  {
    id: 'res-excel-6',
    title: 'Chandoo - Learn Excel Online',
    creator: 'Chandoo',
    type: 'tutorial',
    duration: 'Self-paced',
    url: 'https://chandoo.org/',
    subjectId: 'microsoft-excel',
    level: 'Beginner',
    isFree: true,
    description: 'Popular website with thousands of free Excel tips, formulas, charts tutorials, and templates for all skill levels.',
  },
  {
    id: 'res-excel-7',
    title: 'Excel Is Fun YouTube Channel',
    creator: 'Bill Jelen',
    type: 'youtube',
    duration: 'Ongoing',
    url: 'https://www.youtube.com/@excelisfun',
    subjectId: 'microsoft-excel',
    level: 'Beginner',
    isFree: true,
    description: 'The original Excel YouTube channel by Bill "MrExcel" Jelen with thousands of videos covering Excel tips, tricks, and formulas.',
  },
  {
    id: 'res-excel-8',
    title: 'My Online Training Hub Excel',
    creator: 'My Online Training Hub',
    type: 'youtube',
    duration: 'Ongoing',
    url: 'https://www.youtube.com/@MyOnlineTrainingHub',
    subjectId: 'microsoft-excel',
    level: 'Intermediate',
    isFree: true,
    description: 'Excel and Power BI tutorials focused on business intelligence, dashboards, and advanced formulas for data analysis.',
  },

  // ==================== SQL ====================
  {
    id: 'res-sql-1',
    title: 'SQL Tutorial - Full Database Course',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '4 hours',
    url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    subjectId: 'sql',
    level: 'Beginner',
    isFree: true,
    description: 'A comprehensive SQL course covering database concepts, table creation, queries, joins, and subqueries from scratch.',
  },
  {
    id: 'res-sql-2',
    title: 'SQL Crash Course',
    creator: 'Traversy Media',
    type: 'video',
    duration: '1:25:45',
    url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    subjectId: 'sql',
    level: 'Beginner',
    isFree: true,
    description: 'Fast-paced crash course on SQL fundamentals including basic queries, filtering, sorting, and joins.',
  },
  {
    id: 'res-sql-3',
    title: 'SQL for Data Science',
    creator: 'UC Davis (Coursera)',
    type: 'course',
    duration: '4 weeks',
    url: 'https://www.coursera.org/learn/sql-for-data-science',
    subjectId: 'sql',
    level: 'Beginner',
    isFree: false,
    description: 'Learn SQL fundamentals applied to data science including querying, filtering, and using SQL with real-world datasets.',
  },
  {
    id: 'res-sql-4',
    title: 'Advanced SQL: Window Functions for Data Analysis',
    creator: 'Luke Barousse',
    type: 'tutorial',
    duration: '22:30',
    url: 'https://www.youtube.com/watch?v=_i3qGJgcC5o',
    subjectId: 'sql',
    level: 'Advanced',
    isFree: true,
    description: 'Deep dive into SQL window functions like ROW_NUMBER, RANK, LAG, and LEAD with practical data analysis examples.',
  },
  {
    id: 'res-sql-5',
    title: 'Master SQL: MySQL for Data Analytics',
    creator: 'CodeWithMasoud',
    type: 'tutorial',
    duration: '3:15:00',
    url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
    subjectId: 'sql',
    level: 'Intermediate',
    isFree: true,
    description: 'Intermediate MySQL course focusing on data analytics queries including GROUP BY, HAVING, subqueries, and CTEs.',
  },
  {
    id: 'res-sql-6',
    title: 'SQLBolt Interactive Lessons',
    creator: 'SQLBolt',
    type: 'tutorial',
    duration: 'Self-paced',
    url: 'https://sqlbolt.com/',
    subjectId: 'sql',
    level: 'Beginner',
    isFree: true,
    description: 'Interactive step-by-step SQL lessons where you write real queries directly in the browser with instant feedback.',
  },
  {
    id: 'res-sql-7',
    title: 'HackerRank SQL Challenges',
    creator: 'HackerRank',
    type: 'tutorial',
    duration: 'Self-paced',
    url: 'https://www.hackerrank.com/domains/sql',
    subjectId: 'sql',
    level: 'Intermediate',
    isFree: true,
    description: 'Practice SQL with hundreds of coding challenges sorted by difficulty level, from basic SELECT to advanced analytics queries.',
  },
  {
    id: 'res-sql-8',
    title: 'Use The Index, Luke',
    creator: 'Use The Index, Luke',
    type: 'documentation',
    duration: 'Self-paced',
    url: 'https://use-the-index-luke.com/',
    subjectId: 'sql',
    level: 'Advanced',
    isFree: true,
    description: 'Comprehensive guide to SQL indexing, query optimization, and database performance tuning for advanced users.',
  },
  {
    id: 'res-sql-9',
    title: 'PostgreSQL Tutorial',
    creator: 'PostgreSQL Tutorial',
    type: 'tutorial',
    duration: 'Self-paced',
    url: 'https://www.postgresqltutorial.com/',
    subjectId: 'sql',
    level: 'Intermediate',
    isFree: true,
    description: 'Extensive PostgreSQL tutorial covering everything from basic queries to advanced features like JSON, arrays, and full-text search.',
  },

  // ==================== Power BI ====================
  {
    id: 'res-pbi-1',
    title: 'Power BI Tutorial for Beginners',
    creator: 'Kevin Stratvert',
    type: 'video',
    duration: '33:27',
    url: 'https://www.youtube.com/watch?v=elJU03FjVKo',
    subjectId: 'power-bi',
    level: 'Beginner',
    isFree: true,
    description: 'Step-by-step beginner tutorial on how to connect data sources, create visuals, and build your first Power BI dashboard.',
  },
  {
    id: 'res-pbi-2',
    title: 'Microsoft Power BI Full Course',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '4.5 hours',
    url: 'https://www.youtube.com/watch?v=0IArs6c6Q_E',
    subjectId: 'power-bi',
    level: 'Beginner',
    isFree: true,
    description: 'Complete Power BI course covering data import, transformation with Power Query, DAX basics, and dashboard creation.',
  },
  {
    id: 'res-pbi-3',
    title: 'Microsoft Power BI Data Analyst Associate (PL-300)',
    creator: 'Microsoft Learn',
    type: 'course',
    duration: '3 months',
    url: 'https://learn.microsoft.com/en-us/certifications/exams/pl-300',
    subjectId: 'power-bi',
    level: 'Intermediate',
    isFree: true,
    description: 'Official Microsoft learning path for the PL-300 certification covering data preparation, modeling, visualization, and deployment.',
  },
  {
    id: 'res-pbi-4',
    title: 'Power BI DAX Tutorial - DAX Fundamentals',
    creator: 'Curbal',
    type: 'tutorial',
    duration: '1:12:00',
    url: 'https://www.youtube.com/watch?v=HujnbU0hCSk',
    subjectId: 'power-bi',
    level: 'Intermediate',
    isFree: true,
    description: 'Learn DAX fundamentals for Power BI including calculated columns, measures, and common DAX functions for data analysis.',
  },
  {
    id: 'res-pbi-5',
    title: 'Power BI Masterclass: From Beginner to Advanced',
    creator: '365 Careers (Udemy)',
    type: 'course',
    duration: '14 hours',
    url: 'https://www.udemy.com/course/microsoft-power-bi/',
    subjectId: 'power-bi',
    level: 'Intermediate',
    isFree: false,
    description: 'Comprehensive Power BI course covering Power Query, DAX, data modeling, and advanced visualization techniques.',
  },
  {
    id: 'res-pbi-6',
    title: 'Guy in a Cube YouTube Channel',
    creator: 'Guy in a Cube',
    type: 'youtube',
    duration: 'Ongoing',
    url: 'https://www.youtube.com/@guyinacube',
    subjectId: 'power-bi',
    level: 'Intermediate',
    isFree: true,
    description: 'The go-to YouTube channel for Power BI tips, tricks, and deep dives by Microsoft employees Adam Saxton and Patrick LeBlanc.',
  },
  {
    id: 'res-pbi-7',
    title: 'Enterprise DNA YouTube Channel',
    creator: 'Enterprise DNA',
    type: 'youtube',
    duration: 'Ongoing',
    url: 'https://www.youtube.com/@EnterpriseDNATV',
    subjectId: 'power-bi',
    level: 'Intermediate',
    isFree: true,
    description: 'Advanced Power BI tutorials focusing on DAX, data modeling, and enterprise-level reporting techniques by Sam McKay.',
  },
  {
    id: 'res-pbi-8',
    title: 'DAX Guide - Official DAX Reference',
    creator: 'SQLBI',
    type: 'documentation',
    duration: 'Reference',
    url: 'https://dax.guide/',
    subjectId: 'power-bi',
    level: 'Advanced',
    isFree: true,
    description: 'The complete and authoritative DAX function reference with syntax, descriptions, examples, and related functions.',
  },

  // ==================== Python for Data Analytics ====================
  {
    id: 'res-py-1',
    title: 'Python for Data Science Full Course',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '6 hours',
    url: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI',
    subjectId: 'python-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'Complete Python for data science course covering NumPy, Pandas, Matplotlib, and Scikit-learn with hands-on projects.',
  },
  {
    id: 'res-py-2',
    title: 'Python Full Course for Beginners',
    creator: 'Mosh Hamedani',
    type: 'video',
    duration: '6:14:07',
    url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    subjectId: 'python-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'One of the most popular Python beginner courses covering variables, control flow, functions, and object-oriented programming.',
  },
  {
    id: 'res-py-3',
    title: 'Python for Everybody Specialization',
    creator: 'University of Michigan (Coursera)',
    type: 'course',
    duration: '8 months',
    url: 'https://www.coursera.org/specializations/python',
    subjectId: 'python-data-analytics',
    level: 'Beginner',
    isFree: false,
    description: 'Dr. Chuck Severance\'s famous Python course teaching programming fundamentals and web data access for beginners.',
  },
  {
    id: 'res-py-4',
    title: 'Pandas Data Science Tutorial',
    creator: 'Keith Galli',
    type: 'tutorial',
    duration: '1:52:00',
    url: 'https://www.youtube.com/watch?v=PmhvFC1s--c',
    subjectId: 'python-data-analytics',
    level: 'Intermediate',
    isFree: true,
    description: 'Hands-on Pandas tutorial using a real-world dataset to teach data loading, cleaning, manipulation, and analysis.',
  },
  {
    id: 'res-py-5',
    title: 'Machine Learning with Python (Scikit-learn)',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '5 hours',
    url: 'https://www.youtube.com/watch?v=pOnRSYpVaKE',
    subjectId: 'python-data-analytics',
    level: 'Advanced',
    isFree: true,
    description: 'Practical machine learning course using Scikit-learn covering regression, classification, clustering, and model evaluation.',
  },
  {
    id: 'res-py-6',
    title: 'Automate the Boring Stuff with Python',
    creator: 'Al Sweigart',
    type: 'tutorial',
    duration: 'Self-paced',
    url: 'https://automatetheboringstuff.com/',
    subjectId: 'python-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'Free online book teaching practical Python programming for everyday tasks like file handling, web scraping, and data processing.',
  },
  {
    id: 'res-py-7',
    title: 'Real Python Tutorials',
    creator: 'Real Python',
    type: 'tutorial',
    duration: 'Self-paced',
    url: 'https://realpython.com/',
    subjectId: 'python-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'High-quality Python tutorials, articles, and video courses covering everything from basics to advanced data science topics.',
  },
  {
    id: 'res-py-8',
    title: 'Python Data Science Handbook',
    creator: 'Jake VanderPlas (O\'Reilly)',
    type: 'article',
    duration: 'Self-paced',
    url: 'https://jakevdp.github.io/PythonDataScienceHandbook/',
    subjectId: 'python-data-analytics',
    level: 'Intermediate',
    isFree: true,
    description: 'Free online version of the essential reference for data science in Python covering IPython, NumPy, Pandas, Matplotlib, and Scikit-learn.',
  },

  // ==================== Data Warehousing ====================
  {
    id: 'res-dw-1',
    title: 'Data Warehousing Full Course',
    creator: 'edureka!',
    type: 'video',
    duration: '2:23:00',
    url: 'https://www.youtube.com/watch?v=N0A_0jjRrkQ',
    subjectId: 'data-warehousing',
    level: 'Beginner',
    isFree: true,
    description: 'Full course on data warehousing concepts including architecture, schemas (star/snowflake), ETL, and real-world use cases.',
  },
  {
    id: 'res-dw-2',
    title: 'ETL vs ELT: What You Need to Know',
    creator: 'Fivetran',
    type: 'article',
    duration: '8 min read',
    url: 'https://fivetran.com/blog/etl-vs-elt',
    subjectId: 'data-warehousing',
    level: 'Beginner',
    isFree: true,
    description: 'Clear explanation of the differences between ETL and ELT approaches to data integration, with pros and cons for each.',
  },
  {
    id: 'res-dw-3',
    title: 'Snowflake SnowPro Core Certification',
    creator: 'Snowflake University',
    type: 'course',
    duration: '2 months',
    url: 'https://www.snowflake.com/certifications/snowpro-core',
    subjectId: 'data-warehousing',
    level: 'Intermediate',
    isFree: false,
    description: 'Official certification for Snowflake cloud data platform covering architecture, data loading, querying, and security.',
  },
  {
    id: 'res-dw-4',
    title: 'Star Schema vs Snowflake Schema Explained',
    creator: 'QuestDB',
    type: 'article',
    duration: '10 min read',
    url: 'https://questdb.io/blog/star-schema-vs-snowflake-schema/',
    subjectId: 'data-warehousing',
    level: 'Intermediate',
    isFree: true,
    description: 'In-depth comparison of star and snowflake schemas in data warehousing, including examples, trade-offs, and when to use each.',
  },
  {
    id: 'res-dw-5',
    title: 'Data Warehousing Concepts Tutorial',
    creator: 'Guru99',
    type: 'tutorial',
    duration: '1 hour',
    url: 'https://www.guru99.com/data-warehousing-tutorial.html',
    subjectId: 'data-warehousing',
    level: 'Beginner',
    isFree: true,
    description: 'Beginner-friendly tutorial explaining data warehouse fundamentals, architecture, dimensions, facts, and ETL processes.',
  },
  {
    id: 'res-dw-6',
    title: 'Data Engineering Course',
    creator: 'freeCodeCamp (YouTube)',
    type: 'video',
    duration: '7 hours',
    url: 'https://www.youtube.com/watch?v=yjBneoMYVJI',
    subjectId: 'data-warehousing',
    level: 'Intermediate',
    isFree: true,
    description: 'Comprehensive data engineering course covering data pipelines, warehousing, batch vs streaming, and the modern data stack.',
  },
  {
    id: 'res-dw-7',
    title: 'dbt Learn - Analytics Engineering',
    creator: 'dbt Labs',
    type: 'documentation',
    duration: 'Self-paced',
    url: 'https://docs.getdbt.com/learn',
    subjectId: 'data-warehousing',
    level: 'Intermediate',
    isFree: true,
    description: 'Official dbt learning resources for analytics engineering including SQL transformations, testing, documentation, and CI/CD.',
  },

  // ==================== Databricks & Apache Spark ====================
  {
    id: 'res-db-1',
    title: 'Apache Spark Full Course',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '4 hours',
    url: 'https://www.youtube.com/watch?v=jECbMzHPPaA',
    subjectId: 'databricks-spark',
    level: 'Beginner',
    isFree: true,
    description: 'Comprehensive Apache Spark course covering RDDs, DataFrames, Spark SQL, and machine learning with PySpark.',
  },
  {
    id: 'res-db-2',
    title: 'Databricks for Beginners',
    creator: 'Databricks Academy',
    type: 'course',
    duration: '3 weeks',
    url: 'https://academy.databricks.com/',
    subjectId: 'databricks-spark',
    level: 'Beginner',
    isFree: true,
    description: 'Official Databricks learning path introducing the platform, notebooks, Spark SQL, Delta Lake, and collaborative workflows.',
  },
  {
    id: 'res-db-3',
    title: 'Spark SQL Tutorial for Beginners',
    creator: 'Edureka',
    type: 'tutorial',
    duration: '1:48:00',
    url: 'https://www.youtube.com/watch?v=_C8kWso4ne4',
    subjectId: 'databricks-spark',
    level: 'Intermediate',
    isFree: true,
    description: 'Hands-on Spark SQL tutorial covering DataFrames, temp views, SQL queries, and performance optimization in Spark.',
  },
  {
    id: 'res-db-4',
    title: 'Delta Lake Explained',
    creator: 'Databricks',
    type: 'video',
    duration: '15:30',
    url: 'https://www.youtube.com/watch?v=zslPP4eM8Gk',
    subjectId: 'databricks-spark',
    level: 'Intermediate',
    isFree: true,
    description: 'Overview of Delta Lake, the open-source storage layer that brings ACID transactions to Apache Spark and big data workloads.',
  },
  {
    id: 'res-db-5',
    title: 'MLflow Tutorial: A Complete Guide',
    creator: 'freeCodeCamp',
    type: 'tutorial',
    duration: '2:30:00',
    url: 'https://www.youtube.com/watch?v=1lpyjJIDmQ4',
    subjectId: 'databricks-spark',
    level: 'Advanced',
    isFree: true,
    description: 'Learn MLflow for experiment tracking, model registry, model serving, and managing the ML lifecycle in production.',
  },
  {
    id: 'res-db-6',
    title: 'Spark Documentation - Official Reference',
    creator: 'Apache Spark',
    type: 'documentation',
    duration: 'Reference',
    url: 'https://spark.apache.org/docs/latest/',
    subjectId: 'databricks-spark',
    level: 'Beginner',
    isFree: true,
    description: 'The official Apache Spark documentation covering all components: Spark Core, SQL, Streaming, MLlib, and GraphX.',
  },
  {
    id: 'res-db-7',
    title: 'Big Data with Apache Spark',
    creator: 'edX (UC San Diego)',
    type: 'course',
    duration: '5 weeks',
    url: 'https://www.edx.org/learn/big-data/university-of-california-san-diego-big-data-analysis-apache-spark',
    subjectId: 'databricks-spark',
    level: 'Intermediate',
    isFree: true,
    description: 'University course on big data analysis with Apache Spark covering distributed computing, RDDs, and Spark SQL.',
  },

  // ==================== Advanced Modern Topics ====================
  {
    id: 'res-adv-1',
    title: 'Cloud Computing Full Course',
    creator: 'edureka!',
    type: 'video',
    duration: '3:22:00',
    url: 'https://www.youtube.com/watch?v=EN4fEbcFZ_E',
    subjectId: 'advanced-modern-topics',
    level: 'Beginner',
    isFree: true,
    description: 'Comprehensive overview of cloud computing concepts, AWS, Azure, GCP services, and cloud architecture fundamentals.',
  },
  {
    id: 'res-adv-2',
    title: 'Apache Kafka Full Course',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '4 hours',
    url: 'https://www.youtube.com/watch?v=R873BlNVUB4',
    subjectId: 'advanced-modern-topics',
    level: 'Intermediate',
    isFree: true,
    description: 'Learn Apache Kafka from scratch including topics, partitions, producers, consumers, and real-world streaming applications.',
  },
  {
    id: 'res-adv-3',
    title: 'Git and GitHub for Beginners - Crash Course',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '1:08:00',
    url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
    subjectId: 'advanced-modern-topics',
    level: 'Beginner',
    isFree: true,
    description: 'Essential Git and GitHub crash course covering repositories, commits, branches, merging, pull requests, and collaboration.',
  },
  {
    id: 'res-adv-4',
    title: 'Data Storytelling: How to Tell a Story with Data',
    creator: 'Alex the Analyst',
    type: 'video',
    duration: '18:45',
    url: 'https://www.youtube.com/watch?v=bC82TMzJ3aQ',
    subjectId: 'advanced-modern-topics',
    level: 'Intermediate',
    isFree: true,
    description: 'Learn the art of data storytelling including how to structure narratives, choose the right visuals, and communicate insights effectively.',
  },
  {
    id: 'res-adv-5',
    title: 'A/B Testing Tutorial for Data Analysts',
    creator: 'StatQuest with Josh Starmer',
    type: 'video',
    duration: '24:10',
    url: 'https://www.youtube.com/watch?v=Noose64hBpM',
    subjectId: 'advanced-modern-topics',
    level: 'Advanced',
    isFree: true,
    description: 'Josh Starmer breaks down A/B testing concepts including hypothesis testing, p-values, statistical significance, and practical examples.',
  },
  {
    id: 'res-adv-6',
    title: 'Apache Airflow Tutorial for Beginners',
    creator: 'freeCodeCamp',
    type: 'tutorial',
    duration: '3:45:00',
    url: 'https://www.youtube.com/watch?v=JFMBPzeWqX8',
    subjectId: 'advanced-modern-topics',
    level: 'Intermediate',
    isFree: true,
    description: 'Learn Apache Airflow for orchestrating data pipelines including DAGs, operators, task dependencies, and monitoring.',
  },
  {
    id: 'res-adv-7',
    title: 'Using ChatGPT for Data Analysis',
    creator: 'Kevin Stratvert',
    type: 'video',
    duration: '21:30',
    url: 'https://www.youtube.com/watch?v=uzS6T2nOBYc',
    subjectId: 'advanced-modern-topics',
    level: 'Beginner',
    isFree: true,
    description: 'Practical guide on leveraging ChatGPT and AI tools for data analysis tasks including code generation, SQL queries, and data cleaning.',
  },
  {
    id: 'res-adv-8',
    title: 'Machine Learning Course - Stanford CS229',
    creator: 'Andrew Ng (Stanford)',
    type: 'course',
    duration: 'Self-paced',
    url: 'https://cs229.stanford.edu/',
    subjectId: 'advanced-modern-topics',
    level: 'Advanced',
    isFree: true,
    description: 'The legendary Stanford machine learning course by Andrew Ng covering supervised learning, unsupervised learning, and best practices.',
  },
  {
    id: 'res-adv-9',
    title: 'Fast.ai Practical Deep Learning',
    creator: 'Jeremy Howard (Fast.ai)',
    type: 'course',
    duration: '7 weeks',
    url: 'https://www.fast.ai/',
    subjectId: 'advanced-modern-topics',
    level: 'Intermediate',
    isFree: true,
    description: 'Top-down approach to deep learning that starts with practical applications using PyTorch before diving into theory.',
  },
  {
    id: 'res-adv-10',
    title: 'Towards Data Science - Medium Publication',
    creator: 'Medium / Towards Data Science',
    type: 'article',
    duration: 'Ongoing',
    url: 'https://towardsdatascience.com/',
    subjectId: 'advanced-modern-topics',
    level: 'Beginner',
    isFree: true,
    description: 'One of the largest data science communities on Medium with thousands of articles on machine learning, data analysis, and AI.',
  },

  // ==================== Additional Videos & Tools ====================
  // Data Visualization & Storytelling
  {
    id: 'res-viz-1',
    title: 'Data Visualization with Python (Matplotlib & Seaborn)',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '3:45:00',
    url: 'https://www.youtube.com/watch?v=APNlDnA32rg',
    subjectId: 'python-data-analytics',
    level: 'Intermediate',
    isFree: true,
    description: 'Comprehensive tutorial on creating professional data visualizations using Python with Matplotlib, Seaborn, and Plotly libraries.',
  },
  {
    id: 'res-viz-2',
    title: 'Tableau Full Course for Beginners',
    creator: 'Edureka',
    type: 'video',
    duration: '3:00:00',
    url: 'https://www.youtube.com/watch?v=HjJn9K0PHKI',
    subjectId: 'advanced-modern-topics',
    level: 'Beginner',
    isFree: true,
    description: 'Complete Tableau tutorial covering dashboard creation, charts, maps, calculated fields, and real-world analytics projects.',
  },
  {
    id: 'res-viz-3',
    title: 'D3.js Full Course',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '5 hours',
    url: 'https://www.youtube.com/watch?v=TOJnLhB9uQE',
    subjectId: 'advanced-modern-topics',
    level: 'Advanced',
    isFree: true,
    description: 'Learn D3.js for creating interactive data visualizations on the web including bar charts, scatter plots, maps, and force-directed graphs.',
  },

  // Advanced SQL
  {
    id: 'res-sql-adv-1',
    title: 'Advanced SQL: Recursive Queries and CTEs',
    creator: 'Luke Barousse',
    type: 'tutorial',
    duration: '15:20',
    url: 'https://www.youtube.com/watch?v=Fm5A1yT3Els',
    subjectId: 'sql',
    level: 'Advanced',
    isFree: true,
    description: 'Deep dive into Common Table Expressions (CTEs) and recursive queries for solving complex hierarchical data problems in SQL.',
  },
  {
    id: 'res-sql-adv-2',
    title: 'SQL Performance Tuning and Query Optimization',
    creator: 'QuestDB',
    type: 'tutorial',
    duration: '25:00',
    url: 'https://www.youtube.com/watch?v=Jc7TyM6kEN8',
    subjectId: 'sql',
    level: 'Advanced',
    isFree: true,
    description: 'Learn how to optimize slow SQL queries using indexing strategies, execution plans, and query rewriting techniques.',
  },

  // Python Advanced
  {
    id: 'res-py-adv-1',
    title: 'Python OOP Full Course for Data Science',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '4 hours',
    url: 'https://www.youtube.com/watch?v=Ej_02ICOIgs',
    subjectId: 'python-data-analytics',
    level: 'Intermediate',
    isFree: true,
    description: 'Learn object-oriented programming in Python specifically for data science applications including custom classes and design patterns.',
  },
  {
    id: 'res-py-adv-2',
    title: 'Data Cleaning with Python - Real World Dataset',
    creator: 'Keith Galli',
    type: 'tutorial',
    duration: '1:15:00',
    url: 'https://www.youtube.com/watch?v=bJ_6McPZR2k',
    subjectId: 'python-data-analytics',
    level: 'Intermediate',
    isFree: true,
    description: 'Hands-on data cleaning tutorial using Python and Pandas with a messy real-world dataset including handling missing values and outliers.',
  },
  {
    id: 'res-py-adv-3',
    title: 'APIs for Data Science - Working with APIs in Python',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '2 hours',
    url: 'https://www.youtube.com/watch?v=0mCfFnvSjXQ',
    subjectId: 'python-data-analytics',
    level: 'Intermediate',
    isFree: true,
    description: 'Learn how to work with REST APIs in Python for data science including requests library, JSON handling, and real API examples.',
  },

  // Excel Advanced
  {
    id: 'res-excel-adv-1',
    title: 'Power Query in Excel - Complete Tutorial',
    creator: 'Leila Gharani',
    type: 'tutorial',
    duration: '35:00',
    url: 'https://www.youtube.com/watch?v=CNOA2FnO-0g',
    subjectId: 'microsoft-excel',
    level: 'Advanced',
    isFree: true,
    description: 'Master Power Query in Excel for automated data transformation including unpivoting, merging queries, and creating reusable data pipelines.',
  },
  {
    id: 'res-excel-adv-2',
    title: 'Excel Dynamic Arrays: FILTER, SORT, UNIQUE',
    creator: 'ExcelIsFun',
    type: 'tutorial',
    duration: '42:00',
    url: 'https://www.youtube.com/watch?v=9I9ZfKsRjcQ',
    subjectId: 'microsoft-excel',
    level: 'Advanced',
    isFree: true,
    description: 'Deep dive into Excel dynamic array formulas including FILTER, SORT, UNIQUE, SEQUENCE, and how to combine them for powerful data analysis.',
  },

  // Power BI Advanced
  {
    id: 'res-pbi-adv-1',
    title: 'Power Query M Language Tutorial',
    creator: 'Curbal',
    type: 'tutorial',
    duration: '1:30:00',
    url: 'https://www.youtube.com/watch?v=SfMBGYuGKzs',
    subjectId: 'power-bi',
    level: 'Advanced',
    isFree: true,
    description: 'Learn the Power Query M language for custom data transformations that go beyond the graphical interface in Power BI and Excel.',
  },
  {
    id: 'res-pbi-adv-2',
    title: 'Power BI Row Level Security (RLS)',
    creator: 'Guy in a Cube',
    type: 'tutorial',
    duration: '12:30',
    url: 'https://www.youtube.com/watch?v=tRhYbTBX7zk',
    subjectId: 'power-bi',
    level: 'Advanced',
    isFree: true,
    description: 'Implement Row Level Security in Power BI to control data access for different users and roles within your organization.',
  },

  // Data Engineering & Tools
  {
    id: 'res-tool-1',
    title: 'GitHub Copilot for Data Analysts',
    creator: 'Kevin Stratvert',
    type: 'video',
    duration: '16:45',
    url: 'https://www.youtube.com/watch?v=SkoTvPGhf0U',
    subjectId: 'advanced-modern-topics',
    level: 'Beginner',
    isFree: true,
    description: 'Learn how to use GitHub Copilot AI to accelerate your data analysis workflow with code suggestions and automation.',
  },
  {
    id: 'res-tool-2',
    title: 'Notion for Data Analysts - Build a Analytics Wiki',
    creator: 'Alex the Analyst',
    type: 'video',
    duration: '22:00',
    url: 'https://www.youtube.com/watch?v=wLzM4fRYpQc',
    subjectId: 'advanced-modern-topics',
    level: 'Beginner',
    isFree: true,
    description: 'Use Notion to build a personal analytics knowledge base with databases, templates, and documentation for your data projects.',
  },
  {
    id: 'res-tool-3',
    title: 'Jupyter Notebook Full Tutorial',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '3 hours',
    url: 'https://www.youtube.com/watch?v=HW29067qVWQ',
    subjectId: 'python-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'Complete Jupyter Notebook tutorial covering installation, markdown cells, code execution, widgets, and best practices for data science.',
  },
  {
    id: 'res-tool-4',
    title: 'VS Code for Data Science Setup Guide',
    creator: 'Luke Barousse',
    type: 'tutorial',
    duration: '18:00',
    url: 'https://www.youtube.com/watch?v=Ljl9qdJMbk',
    subjectId: 'python-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'Set up Visual Studio Code as your data science IDE with Python, Jupyter, extensions, and debugging configuration.',
  },
  {
    id: 'res-tool-5',
    title: 'Google Sheets for Data Analysis Full Course',
    creator: 'freeCodeCamp',
    type: 'video',
    duration: '4 hours',
    url: 'https://www.youtube.com/watch?v=EoYbJgMNqBo',
    subjectId: 'microsoft-excel',
    level: 'Beginner',
    isFree: true,
    description: 'Comprehensive Google Sheets course for data analysis including functions, pivot tables, charts, QUERY, and IMPORTRANGE.',
  },

  // Career & Interview Prep
  {
    id: 'res-career-1',
    title: 'Data Analyst Interview Questions and Answers',
    creator: 'Alex the Analyst',
    type: 'video',
    duration: '28:00',
    url: 'https://www.youtube.com/watch?v=SabDkKCpWg0',
    subjectId: 'advanced-modern-topics',
    level: 'Intermediate',
    isFree: true,
    description: 'Top data analyst interview questions with detailed answers covering SQL, Python, statistics, and behavioral questions.',
  },
  {
    id: 'res-career-2',
    title: 'How to Build a Data Analyst Portfolio',
    creator: 'Alex the Analyst',
    type: 'video',
    duration: '20:00',
    url: 'https://www.youtube.com/watch?v=pAPnbRiMhKs',
    subjectId: 'advanced-modern-topics',
    level: 'Beginner',
    isFree: true,
    description: 'Step-by-step guide to building a professional data analyst portfolio that stands out to hiring managers with real projects.',
  },
  {
    id: 'res-career-3',
    title: 'Data Analyst Salary Guide 2024',
    creator: 'Luke Barousse',
    type: 'video',
    duration: '15:00',
    url: 'https://www.youtube.com/watch?v=KkLbPQnbPHI',
    subjectId: 'advanced-modern-topics',
    level: 'Beginner',
    isFree: true,
    description: 'Comprehensive data analyst salary breakdown by experience level, location, industry, and skills with negotiation tips.',
  },
  {
    id: 'res-career-4',
    title: 'SQL Interview Questions for Data Analysts',
    creator: 'Luke Barousse',
    type: 'video',
    duration: '45:00',
    url: 'https://www.youtube.com/watch?v=8TIVO-MiMjk',
    subjectId: 'sql',
    level: 'Intermediate',
    isFree: true,
    description: 'Practice SQL interview questions commonly asked in data analyst interviews with step-by-step solutions and explanations.',
  },

  // Statistics & Math
  {
    id: 'res-stat-1',
    title: 'Statistics Fundamentals for Data Science',
    creator: 'StatQuest with Josh Starmer',
    type: 'video',
    duration: '7 hours',
    url: 'https://www.youtube.com/watch?v=xxpc-HPKN28',
    subjectId: 'intro-data-analytics',
    level: 'Beginner',
    isFree: true,
    description: 'Josh Starmer explains statistics concepts from the ground up including distributions, hypothesis testing, p-values, and regression.',
  },
  {
    id: 'res-stat-2',
    title: 'Probability for Data Science',
    creator: 'MIT OpenCourseWare',
    type: 'course',
    duration: 'Self-paced',
    url: 'https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/',
    subjectId: 'intro-data-analytics',
    level: 'Intermediate',
    isFree: true,
    description: 'MIT OpenCourseWare probability and statistics course with full lectures, assignments, and exams for data science students.',
  },
];

const typeConfig: Record<Resource['type'], { label: string; icon: React.ElementType; color: string }> = {
  video: { label: 'Video', icon: Video, color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  course: { label: 'Course', icon: GraduationCap, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  article: { label: 'Article', icon: FileText, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  tutorial: { label: 'Tutorial', icon: BookOpen, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  youtube: { label: 'YouTube', icon: Youtube, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  documentation: { label: 'Docs', icon: BookMarked, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
};

const levelColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

const gradients = [
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-teal-500 to-cyan-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-blue-600',
  'from-pink-500 to-rose-500',
  'from-lime-500 to-emerald-500',
];

const allTypes: Array<Resource['type'] | 'all'> = ['all', 'video', 'course', 'article', 'tutorial', 'youtube', 'documentation'];

export default function VideoResourcesView() {
  const store = useProgressStore();
  const savedResources = store.savedResources || [];
  const toggleSavedResource = store.toggleSavedResource;
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState<Resource['type'] | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<Resource['level'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const filteredResources = useMemo(() => {
    let result = resources;

    if (showSavedOnly) {
      result = result.filter((r) => savedResources.includes(r.id));
    }

    if (selectedSubject !== 'all') {
      result = result.filter((r) => r.subjectId === selectedSubject);
    }

    if (selectedType !== 'all') {
      result = result.filter((r) => r.type === selectedType);
    }

    if (selectedLevel !== 'all') {
      result = result.filter((r) => r.level === selectedLevel);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.creator.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [selectedSubject, selectedType, selectedLevel, searchQuery, savedResources, showSavedOnly]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Video & Resources</h1>
            <p className="text-sm text-muted-foreground">Curated learning materials for every subject</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs px-3 py-1.5">
            <LayoutGrid className="w-3.5 h-3.5 mr-1" />
            {filteredResources.length} of {resources.length} resources
          </Badge>
          <Button
            variant={showSavedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={cn(
              showSavedOnly && 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0'
            )}
          >
            <BookmarkCheck className="w-4 h-4 mr-1.5" />
            Saved ({savedResources.length})
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources by title, creator, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-border/50"
          />
        </div>
      </motion.div>

      {/* Subject Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <Button
            size="sm"
            variant={selectedSubject === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedSubject('all')}
            className={cn(
              'shrink-0 rounded-full',
              selectedSubject === 'all' && 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0'
            )}
          >
            All Subjects
          </Button>
          {subjects.map((subject) => {
            const count = resources.filter((r) => r.subjectId === subject.id).length;
            if (count === 0) return null;
            return (
              <Button
                key={subject.id}
                size="sm"
                variant={selectedSubject === subject.id ? 'default' : 'outline'}
                onClick={() => setSelectedSubject(subject.id)}
                className={cn(
                  'shrink-0 rounded-full text-xs',
                  selectedSubject === subject.id && 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0'
                )}
              >
                {subject.title.split(' ').slice(0, 2).join(' ')} ({count})
              </Button>
            );
          })}
        </div>

        {/* Type & Level Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-medium mr-1">Type:</span>
            {allTypes.map((type) => (
              <Button
                key={type}
                size="sm"
                variant={selectedType === type ? 'default' : 'outline'}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'h-7 text-xs rounded-full px-2.5',
                  selectedType === type && type !== 'all' && typeConfig[type as Resource['type']]?.color + ' border-0',
                  selectedType === type && type === 'all' && 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0'
                )}
              >
                {type === 'all' ? 'All' : typeConfig[type as Resource['type']]?.label}
              </Button>
            ))}
          </div>
          <div className="h-5 w-px bg-border mx-1" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-medium mr-1">Level:</span>
            {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
              <Button
                key={level}
                size="sm"
                variant={selectedLevel === level ? 'default' : 'outline'}
                onClick={() => setSelectedLevel(level)}
                className={cn(
                  'h-7 text-xs rounded-full px-2.5',
                  selectedLevel === level && level !== 'all' && levelColors[level] + ' border-0',
                  selectedLevel === level && level === 'all' && 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0'
                )}
              >
                {level === 'all' ? 'All' : level}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Resources Grid */}
      <AnimatePresence mode="wait">
        {filteredResources.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Globe className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {showSavedOnly
                ? 'You haven\'t saved any resources yet. Bookmark resources to find them here.'
                : 'Try adjusting your search or filters to find what you\'re looking for.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredResources.map((resource, index) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                index={index}
                isSaved={savedResources.includes(resource.id)}
                onToggleSave={toggleSavedResource}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResourceCard({
  resource,
  index,
  isSaved,
  onToggleSave,
}: {
  resource: Resource;
  index: number;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const typeInfo = typeConfig[resource.type];
  const TypeIcon = typeInfo.icon;
  const gradient = gradients[index % gradients.length];
  const subject = subjects.find((s) => s.id === resource.subjectId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 h-full">
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className={cn('relative h-36 bg-gradient-to-br flex items-center justify-center', gradient)}>
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
            </div>
            {resource.type === 'video' || resource.type === 'youtube' ? (
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="w-7 h-7 text-white ml-1" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TypeIcon className="w-7 h-7 text-white" />
              </div>
            )}
            {/* Top badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <Badge className="text-[10px] font-semibold bg-black/30 text-white border-0 backdrop-blur-sm">
                <TypeIcon className="w-3 h-3 mr-1" />
                {typeInfo.label}
              </Badge>
              {resource.isFree && (
                <Badge className="text-[10px] font-semibold bg-emerald-500/80 text-white border-0 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Free
                </Badge>
              )}
            </div>
            {/* Duration */}
            <Badge className="absolute bottom-3 right-3 text-[10px] font-semibold bg-black/30 text-white border-0 backdrop-blur-sm">
              <Clock className="w-3 h-3 mr-1" />
              {resource.duration}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title & Creator */}
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {resource.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">by {resource.creator}</p>
            </div>

            {/* Description */}
            {resource.description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {resource.description}
              </p>
            )}

            {/* Subject & Level */}
            <div className="flex items-center gap-2 flex-wrap">
              {subject && (
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {subject.title.split(' ').slice(0, 2).join(' ')}
                </Badge>
              )}
              <Badge className={cn('text-[10px] font-semibold border', levelColors[resource.level])}>
                {resource.level}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button
                  size="sm"
                  className="w-full h-8 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Open Resource
                </Button>
              </a>
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  'h-8 w-8 p-0 shrink-0',
                  isSaved ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground hover:text-amber-500'
                )}
                onClick={() => onToggleSave(resource.id)}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
