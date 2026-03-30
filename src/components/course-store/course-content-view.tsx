'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, CheckCircle2, Circle, ChevronDown, ChevronRight,
  Clock, Play, Trophy, Lock, GraduationCap, Star, FileText, Video,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Module {
  title: string;
  duration: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
}

interface CourseContent {
  courseId: string;
  courseTitle: string;
  instructor: string;
  description: string;
  gradient: string;
  modules: Module[];
}

const COURSE_CONTENT: Record<string, CourseContent> = {
  'sql-mastery': {
    courseId: 'sql-mastery',
    courseTitle: 'SQL Mastery: From Zero to Hero',
    instructor: 'Sarah Chen',
    description: 'Master SQL from the ground up with real-world examples.',
    gradient: 'from-violet-600 to-purple-600',
    modules: [
      {
        title: 'SQL Basics & Database Fundamentals',
        duration: '8h 30m',
        lessons: [
          {
            id: 'sql-m1-l1', title: 'What is SQL? Introduction & Setup', duration: '25m',
            content: `**What is SQL?**\n\nSQL (Structured Query Language) is the standard language for managing and querying relational databases. It was developed in the 1970s at IBM and has become the most important language for working with data.\n\n**Key Concepts:**\n- A **database** is an organized collection of structured data stored electronically\n- A **table** is a collection of related data organized in rows and columns\n- A **row** (record) represents a single entry in a table\n- A **column** (field) represents an attribute of the data\n\n**SQL Categories:**\n- **DML** (Data Manipulation Language): SELECT, INSERT, UPDATE, DELETE\n- **DDL** (Data Definition Language): CREATE, ALTER, DROP\n- **DCL** (Data Control Language): GRANT, REVOKE\n\n**Why Learn SQL?**\nSQL is the backbone of data analytics. Every data analyst, data scientist, and data engineer needs SQL to extract insights from databases. Companies like Google, Meta, Netflix, and Amazon all rely heavily on SQL for their data operations.`,
          },
          {
            id: 'sql-m1-l2', title: 'Creating Tables & Data Types', duration: '30m',
            content: `**Creating Your First Table**\n\nBefore you can query data, you need to understand how data is stored. The CREATE TABLE statement defines the structure of your data.\n\n\`\`\`sql\nCREATE TABLE employees (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  salary DECIMAL(10,2),\n  department_id INT,\n  hire_date DATE DEFAULT CURRENT_DATE\n);\n\`\`\`\n\n**Common Data Types:**\n- **INT** - Whole numbers (e.g., 42, 1000)\n- **VARCHAR(n)** - Variable-length text up to n characters\n- **DECIMAL(p,s)** - Exact numbers with precision\n- **DATE** - Calendar date (YYYY-MM-DD)\n- **TIMESTAMP** - Date and time\n- **BOOLEAN** - True/False values\n- **TEXT** - Long text content\n\n**Constraints:**\n- **PRIMARY KEY** - Uniquely identifies each row\n- **NOT NULL** - Column cannot be empty\n- **UNIQUE** - All values must be different\n- **DEFAULT** - Sets a default value\n- **FOREIGN KEY** - References another table's primary key\n\nUnderstanding table structure is essential because it determines how you'll query and join data later.`,
          },
          {
            id: 'sql-m1-l3', title: 'INSERT, UPDATE, DELETE Operations', duration: '20m',
            content: `**Modifying Data with DML**\n\nOnce you have tables, you need to add and modify data. These three operations form the foundation of data manipulation.\n\n**INSERT** - Adding new records:\n\`\`\`sql\nINSERT INTO employees (name, email, salary, department_id)\nVALUES ('Alice Johnson', 'alice@company.com', 85000, 3);\n\`\`\`\n\n**UPDATE** - Modifying existing records:\n\`\`\`sql\nUPDATE employees\nSET salary = 90000\nWHERE name = 'Alice Johnson';\n\`\`\`\n\n**DELETE** - Removing records:\n\`\`\`sql\nDELETE FROM employees\nWHERE id = 5;\n\`\`\`\n\n**Important Rules:**\n1. Always use a WHERE clause with UPDATE and DELETE to avoid affecting all rows\n2. You can insert multiple rows at once with a single INSERT statement\n3. Use transactions (BEGIN, COMMIT, ROLLBACK) for safety when making multiple changes\n4. The order of columns in INSERT must match the order in VALUES\n\nThese operations are critical for data engineers who manage ETL pipelines and need to load, transform, and maintain data in databases.`,
          },
        ],
      },
      {
        title: 'SELECT, WHERE & Filtering',
        duration: '6h 45m',
        lessons: [
          {
            id: 'sql-m2-l1', title: 'Basic SELECT Statements', duration: '25m',
            content: `**The SELECT Statement**\n\nSELECT is the most commonly used SQL command. It retrieves data from one or more tables and allows you to specify exactly which columns you want.\n\n\`\`\`sql\n-- Select specific columns\nSELECT name, email, salary\nFROM employees;\n\n-- Select all columns\nSELECT * FROM employees;\n\n-- Select with aliases\nSELECT name AS employee_name, salary AS monthly_pay\nFROM employees;\n\`\`\`\n\n**Key Points:**\n- Use specific column names instead of * for better performance and clarity\n- Aliases (AS) make your results more readable\n- SQL is case-insensitive for keywords but case-sensitive for data values\n- Results are not guaranteed to be in any particular order without ORDER BY\n\n**DISTINCT** eliminates duplicate rows:\n\`\`\`sql\nSELECT DISTINCT department_id\nFROM employees;\n\`\`\`\n\nThe SELECT statement is your starting point for every data query you'll write as a data analyst.`,
          },
          {
            id: 'sql-m2-l2', title: 'WHERE Clause & Comparison Operators', duration: '30m',
            content: `**Filtering Data with WHERE**\n\nThe WHERE clause filters rows based on conditions. Only rows that satisfy the condition are returned.\n\n\`\`\`sql\nSELECT * FROM employees\nWHERE salary > 75000;\n\nSELECT name, department_id\nFROM employees\nWHERE department_id = 3;\n\`\`\`\n\n**Comparison Operators:**\n- **=** Equal to\n- **<>** or **!=** Not equal to\n- **>** Greater than\n- **<** Less than\n- **>=** Greater than or equal\n- **<=** Less than or equal\n- **BETWEEN** Range (inclusive)\n- **IN** Match any value in a list\n- **LIKE** Pattern matching\n- **IS NULL** Check for null values\n\n**Combining Conditions:**\n\`\`\`sql\nSELECT * FROM employees\nWHERE salary > 50000 AND department_id IN (1, 3, 5);\n\nSELECT * FROM employees\nWHERE name LIKE 'J%' OR email LIKE '%@gmail.com';\n\`\`\`\n\n**LIKE Patterns:**\n- **'A%'** - Starts with A\n- **'%son'** - Ends with son\n- **'%an%'** - Contains an anywhere\n- **'_at'** - Three letters ending with at\n\nMastering WHERE is essential for every data analysis task.`,
          },
          {
            id: 'sql-m2-l3', title: 'ORDER BY, LIMIT & Pagination', duration: '20m',
            content: `**Sorting and Limiting Results**\n\n**ORDER BY** sorts your query results:\n\`\`\`sql\n-- Sort by salary descending (highest first)\nSELECT name, salary\nFROM employees\nORDER BY salary DESC;\n\n-- Sort by multiple columns\nSELECT * FROM employees\nORDER BY department_id ASC, salary DESC;\n\`\`\`\n\n**LIMIT** restricts the number of rows returned:\n\`\`\`sql\n-- Top 5 highest paid employees\nSELECT name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5;\n\`\`\`\n\n**Pagination** (OFFSET + LIMIT):\n\`\`\`sql\n-- Page 2 of 10 results per page\nSELECT *\nFROM employees\nORDER BY hire_date DESC\nLIMIT 10 OFFSET 10;\n\`\`\`\n\n**Practical Tips:**\n- Always use ORDER BY with LIMIT for predictable results\n- OFFSET is 0-based (OFFSET 0 is the first page)\n- For large datasets, pagination with OFFSET can be slow — consider keyset pagination\n- When sorting by multiple columns, the first column is the primary sort\n\nThese tools are used daily by data analysts to explore data, create reports, and build dashboards.`,
          },
        ],
      },
      {
        title: 'JOINs, Subqueries & CTEs',
        duration: '9h 15m',
        lessons: [
          {
            id: 'sql-m3-l1', title: 'Understanding JOINs', duration: '35m',
            content: `**Combining Data from Multiple Tables**\n\nJOINs are one of the most powerful features in SQL. They combine rows from two or more tables based on related columns.\n\n\`\`\`sql\nSELECT e.name, d.name AS department, e.salary\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.id;\n\`\`\`\n\n**Types of JOINs:**\n\n**INNER JOIN** - Returns only matching rows from both tables:\nOnly employees who have a matching department will appear.\n\n**LEFT JOIN** - Returns ALL rows from left table + matching from right:\n\`\`\`sql\nSELECT e.name, d.name AS department\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.id;\n\`\`\`\n\n**RIGHT JOIN** - Returns ALL rows from right table + matching from left.\n\n**FULL OUTER JOIN** - Returns all rows when there is a match in either table.\n\n**Real-World Example:**\n\`\`\`sql\nSELECT c.customer_name, o.order_date, SUM(oi.quantity * oi.price) AS total\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nJOIN order_items oi ON o.id = oi.order_id\nGROUP BY c.customer_name, o.order_date\nHAVING total > 1000\nORDER BY total DESC;\n\`\`\`\n\nUnderstanding JOINs is critical because real data is almost always spread across multiple tables.`,
          },
          {
            id: 'sql-m3-l2', title: 'Subqueries', duration: '30m',
            content: `**Queries Within Queries**\n\nA subquery is a query nested inside another query. They allow you to use the result of one query as input for another.\n\n**In WHERE clause:**\n\`\`\`sql\n-- Find employees earning above average\nSELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);\n\`\`\`\n\n**In FROM clause (Derived Table):**\n\`\`\`sql\nSELECT department, avg_salary\nFROM (\n  SELECT d.name AS department, AVG(e.salary) AS avg_salary\n  FROM employees e\n  JOIN departments d ON e.department_id = d.id\n  GROUP BY d.name\n) AS dept_avg\nWHERE avg_salary > 75000;\n\`\`\`\n\n**Correlated Subqueries** reference the outer query:\n\`\`\`sql\nSELECT name, salary, department_id\nFROM employees e\nWHERE salary > (\n  SELECT AVG(salary)\n  FROM employees\n  WHERE department_id = e.department_id\n);\n\`\`\`\n\n**Key Rules:**\n- Subqueries in WHERE must return a single value for =, >, < comparisons\n- Use IN or ANY for subqueries returning multiple values\n- Correlated subqueries run once per outer row (slower but flexible)\n\nSubqueries are powerful but should be used judiciously — CTEs (next lesson) often provide better readability.`,
          },
          {
            id: 'sql-m3-l3', title: 'Common Table Expressions (CTEs)', duration: '25m',
            content: `**CTEs: Named Temporary Result Sets**\n\nA CTE (WITH clause) creates a named temporary result set that you can reference within a query. They make complex queries more readable and maintainable.\n\n\`\`\`sql\nWITH dept_salary AS (\n  SELECT department_id, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY department_id\n),\nhigh_depts AS (\n  SELECT department_id\n  FROM dept_salary\n  WHERE avg_salary > 75000\n)\nSELECT e.name, e.salary, e.department_id\nFROM employees e\nWHERE e.department_id IN (SELECT department_id FROM high_depts)\nORDER BY e.salary DESC;\n\`\`\`\n\n**CTEs vs Subqueries:**\n- CTEs are more readable for complex queries\n- CTEs can be referenced multiple times\n- CTEs support recursion (for hierarchical data)\n\n**Recursive CTEs** for hierarchical data:\n\`\`\`sql\nWITH RECURSIVE org_chart AS (\n  SELECT id, name, manager_id, 1 AS level\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, o.level + 1\n  FROM employees e\n  JOIN org_chart o ON e.manager_id = o.id\n)\nSELECT * FROM org_chart ORDER BY level, name;\n\`\`\`\n\nCTEs are the preferred approach for complex queries in production environments. They're used extensively in data engineering pipelines and reporting.`,
          },
        ],
      },
      {
        title: 'GROUP BY & Aggregate Functions',
        duration: '7h 30m',
        lessons: [
          {
            id: 'sql-m4-l1', title: 'Aggregate Functions', duration: '25m',
            content: `**Summarizing Data**\n\nAggregate functions perform calculations on a set of values and return a single result.\n\n**Common Aggregates:**\n\`\`\`sql\nSELECT \n  COUNT(*) AS total_employees,\n  COUNT(DISTINCT department_id) AS departments,\n  SUM(salary) AS total_payroll,\n  AVG(salary) AS avg_salary,\n  MIN(salary) AS min_salary,\n  MAX(salary) AS max_salary\nFROM employees;\n\`\`\`\n\n**Key Points:**\n- **COUNT(*)** counts all rows including NULLs\n- **COUNT(column)** counts non-NULL values in that column\n- **AVG()** ignores NULL values\n- You can combine aggregates with arithmetic:\n\`\`\`sql\nSELECT \n  AVG(salary) AS avg_salary,\n  MAX(salary) - MIN(salary) AS salary_range\nFROM employees;\n\`\`\`\n\n**NULL Handling:**\n- Most aggregate functions ignore NULL values\n- Use COALESCE to handle NULLs:\n\`\`\`sql\nSELECT AVG(COALESCE(bonus, 0)) AS avg_bonus\nFROM employees;\n\`\`\`\n\nAggregate functions are essential for KPI dashboards, summary reports, and any analysis that requires summarizing large datasets.`,
          },
          {
            id: 'sql-m4-l2', title: 'GROUP BY Essentials', duration: '30m',
            content: `**Grouping and Aggregating**\n\nGROUP BY divides rows into groups based on column values, allowing you to apply aggregate functions to each group separately.\n\n\`\`\`sql\nSELECT department_id, COUNT(*) AS count, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department_id;\n\`\`\`\n\n**Rules:**\n1. Every column in SELECT must either be in GROUP BY or inside an aggregate function\n2. GROUP BY evaluates after WHERE but before HAVING and ORDER BY\n3. You can group by multiple columns\n\`\`\`sql\nSELECT department_id, job_title, COUNT(*) AS count\nFROM employees\nGROUP BY department_id, job_title\nORDER BY count DESC;\n\`\`\`\n\n**HAVING vs WHERE:**\n- WHERE filters individual rows BEFORE grouping\n- HAVING filters groups AFTER aggregation\n\`\`\`sql\nSELECT department_id, COUNT(*) AS emp_count\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 5;\n\`\`\`\n\n**Execution Order:**\nFROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT\n\nGROUP BY is the foundation of every business intelligence report and analytics dashboard.`,
          },
        ],
      },
      {
        title: 'Window Functions & Analytics',
        duration: '7h 30m',
        lessons: [
          {
            id: 'sql-m5-l1', title: 'Introduction to Window Functions', duration: '35m',
            content: `**Advanced Analytics with Window Functions**\n\nWindow functions perform calculations across a set of rows related to the current row, WITHOUT collapsing the result (unlike GROUP BY).\n\n\`\`\`sql\nSELECT name, department_id, salary,\n  ROW_NUMBER() OVER (ORDER BY salary DESC) AS rank,\n  AVG(salary) OVER (PARTITION BY department_id) AS dept_avg\nFROM employees;\n\`\`\`\n\n**Key Window Functions:**\n\n- **ROW_NUMBER()** - Sequential number for each row (1, 2, 3...)\n- **RANK()** - Rank with gaps for ties (1, 2, 2, 4)\n- **DENSE_RANK()** - Rank without gaps (1, 2, 2, 3)\n- **LAG(col, n)** - Value from n rows before\n- **LEAD(col, n)** - Value from n rows after\n- **SUM() OVER()** - Running total\n- **FIRST_VALUE()** - First value in the window\n\n**Frame Clauses:**\n\`\`\`sql\nSELECT date, sales,\n  SUM(sales) OVER (\n    ORDER BY date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total\nFROM daily_sales;\n\`\`\`\n\nWindow functions are considered advanced SQL and are heavily used in data science and analytics for time-series analysis, ranking, and comparative reports.`,
          },
          {
            id: 'sql-m5-l2', title: 'Practical Window Function Examples', duration: '30m',
            content: `**Real-World Window Function Patterns**\n\n**1. Year-over-Year Growth:**\n\`\`\`sql\nSELECT \n  year_month,\n  revenue,\n  LAG(revenue, 12) OVER (ORDER BY year_month) AS prev_year,\n  ROUND(\n    (revenue - LAG(revenue, 12) OVER (ORDER BY year_month)) / \n    LAG(revenue, 12) OVER (ORDER BY year_month) * 100, 2\n  ) AS yoy_growth_pct\nFROM monthly_revenue;\n\`\`\`\n\n**2. Top N per Group:**\n\`\`\`sql\nWITH ranked AS (\n  SELECT name, department_id, salary,\n    ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn\n  FROM employees\n)\nSELECT * FROM ranked WHERE rn <= 3;\n\`\`\`\n\n**3. Running Averages:**\n\`\`\`sql\nSELECT date, amount,\n  AVG(amount) OVER (\n    ORDER BY date\n    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n  ) AS 7_day_avg\nFROM transactions;\n\`\`\`\n\nThese patterns are used daily in analytics teams at companies like Netflix (viewership analytics), Spotify (listening trends), and Amazon (sales forecasting).`,
          },
        ],
      },
      {
        title: 'Query Optimization & Real Projects',
        duration: '5h 00m',
        lessons: [
          {
            id: 'sql-m6-l1', title: 'Query Optimization Fundamentals', duration: '30m',
            content: `**Making Your Queries Fast**\n\nQuery optimization is critical when working with large datasets. A poorly written query can take minutes or hours on millions of rows.\n\n**Indexing:**\nIndexes are data structures that speed up data retrieval at the cost of slower writes.\n\`\`\`sql\nCREATE INDEX idx_emp_dept ON employees(department_id);\nCREATE INDEX idx_emp_name ON employees(name);\n\`\`\`\n\n**Optimization Tips:**\n1. **Use EXISTS instead of IN** for subqueries with large result sets\n2. **Avoid SELECT *** — specify only needed columns\n3. **Use LIMIT** when testing queries on large tables\n4. **Add appropriate indexes** on columns used in WHERE, JOIN, ORDER BY\n5. **Avoid functions on indexed columns** (they defeat the index)\n6. **Use EXPLAIN** to analyze query execution plans\n\`\`\`sql\nEXPLAIN SELECT * FROM employees WHERE department_id = 3;\n\`\`\`\n\n**Common Anti-Patterns:**\n- Using DISTINCT when GROUP BY would suffice\n- Nested subqueries instead of JOINs\n- N+1 query patterns\n- Ignoring NULL handling\n\nQuery optimization skills are highly valued in data engineering roles and can make the difference between a query that runs in seconds vs. hours.`,
          },
          {
            id: 'sql-m6-l2', title: 'Capstone: Building an Analytics Dashboard', duration: '45m',
            content: `**Putting It All Together**\n\nIn this capstone lesson, you'll build a comprehensive analytics query that combines everything you've learned.\n\n**Scenario:** Build a monthly sales performance report for executives.\n\n\`\`\`sql\nWITH monthly_sales AS (\n  SELECT \n    DATE_TRUNC('month', o.order_date) AS month,\n    c.region,\n    SUM(oi.quantity * oi.price) AS revenue,\n    COUNT(DISTINCT o.id) AS order_count,\n    COUNT(DISTINCT c.id) AS customer_count\n  FROM orders o\n  JOIN customers c ON o.customer_id = c.id\n  JOIN order_items oi ON o.id = oi.order_id\n  GROUP BY DATE_TRUNC('month', o.order_date), c.region\n),\nranked_months AS (\n  SELECT *,\n    LAG(revenue) OVER (PARTITION BY region ORDER BY month) AS prev_revenue,\n    RANK() OVER (PARTITION BY month ORDER BY revenue DESC) AS region_rank\n  FROM monthly_sales\n)\nSELECT\n  month, region, revenue, order_count, customer_count,\n  ROUND((revenue - prev_revenue) / NULLIF(prev_revenue, 0) * 100, 1) AS growth_pct,\n  region_rank\nFROM ranked_months\nWHERE month >= DATE_TRUNC('year', CURRENT_DATE)\nORDER BY month DESC, region_rank;\n\`\`\`\n\n**What this query demonstrates:**\n- Multiple JOINs across 3 tables\n- CTEs for code organization\n- Date truncation for grouping\n- Window functions (LAG, RANK) for analytics\n- NULLIF for safe division\n- Complex filtering and ordering\n\nThis pattern is used at every major tech company for executive reporting.`,
          },
        ],
      },
    ],
  },
  'python-ds': {
    courseId: 'python-ds',
    courseTitle: 'Python for Data Science Complete Guide',
    instructor: 'Dr. Michael Torres',
    description: 'Comprehensive Python course for data science.',
    gradient: 'from-blue-600 to-cyan-600',
    modules: [
      {
        title: 'Python Essentials for Data Analysis',
        duration: '9h 00m',
        lessons: [
          {
            id: 'py-m1-l1', title: 'Python Basics & Variables', duration: '25m',
            content: `**Getting Started with Python**\n\nPython is the most popular language for data science due to its simplicity and powerful ecosystem of libraries.\n\n**Variables & Data Types:**\n\`\`\`python\n# Numbers\nage = 25\nsalary = 75000.50\n\n# Strings\nname = "Data Analyst"\n\n# Lists (ordered, mutable)\nskills = ["SQL", "Python", "Excel"]\n\n# Dictionaries (key-value pairs)\nemployee = {"name": "Alice", "salary": 85000, "dept": "Analytics"}\n\n# Tuples (ordered, immutable)\ncoordinates = (40.7, -74.0)\n\n# Sets (unordered, unique values)\nunique_depts = {"Sales", "Marketing", "Engineering"}\n\`\`\`\n\n**Key Python Features:**\n- **Dynamic typing** — no need to declare variable types\n- **Indentation-based** — uses spaces instead of braces\n- **List comprehensions** — concise way to create lists\n\`\`\`python\n# List comprehension\nsalaries = [50000, 60000, 75000, 90000]\nhigh_salaries = [s for s in salaries if s > 60000]\n\`\`\`\n\nPython's readability makes it ideal for data analysis scripts and collaboration in data teams.`,
          },
          {
            id: 'py-m1-l2', title: 'Control Flow & Functions', duration: '30m',
            content: `**Making Decisions and Reusing Code**\n\n**Conditionals:**\n\`\`\`python\nsalary = 85000\n\nif salary >= 100000:\n    level = "Senior"\nelif salary >= 70000:\n    level = "Mid"\nelse:\n    level = "Junior"\n\`\`\`\n\n**Loops:**\n\`\`\`python\n# For loop\nskills = ["SQL", "Python", "Excel"]\nfor skill in skills:\n    print(f"Proficiency: {skill}")\n\n# Dictionary iteration\nemployee = {"name": "Alice", "salary": 85000}\nfor key, value in employee.items():\n    print(f"{key}: {value}")\n\n# While loop\ncount = 0\nwhile count < 5:\n    count += 1\n\`\`\`\n\n**Functions:**\n\`\`\`python\ndef calculate_bonus(salary, performance_rating):\n    """Calculate bonus based on salary and performance."""\n    bonus_rates = {5: 0.20, 4: 0.15, 3: 0.10, 2: 0.05, 1: 0}\n    rate = bonus_rates.get(performance_rating, 0)\n    return salary * rate\n\nbonus = calculate_bonus(85000, 4)\n\`\`\`\n\n**Lambda Functions** (anonymous, one-line):\n\`\`\`python\nmultiply = lambda x, y: x * y\nsalaries_after_tax = list(map(lambda s: s * 0.8, [50000, 75000, 100000]))\n\`\`\``,
          },
        ],
      },
      {
        title: 'Pandas & Data Manipulation',
        duration: '12h 00m',
        lessons: [
          {
            id: 'py-m2-l1', title: 'Introduction to Pandas DataFrames', duration: '30m',
            content: `**Pandas: The Data Analyst's Best Friend**\n\nPandas is Python's primary library for data manipulation. DataFrames are 2D labeled data structures — think of them as programmable Excel spreadsheets.\n\n\`\`\`python\nimport pandas as pd\n\n# Create a DataFrame\ndata = {\n    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],\n    'department': ['Engineering', 'Sales', 'Marketing', 'Engineering'],\n    'salary': [95000, 72000, 68000, 88000]\n}\ndf = pd.DataFrame(data)\n\n# Read from CSV\ndf = pd.read_csv('employees.csv')\n\n# Basic info\nprint(df.shape)       # (rows, columns)\nprint(df.info())       # Data types and non-null counts\nprint(df.describe())   # Statistical summary\n\`\`\`\n\n**Selecting Data:**\n\`\`\`python\n# Single column\nnames = df['name']\n\n# Multiple columns\nsubset = df[['name', 'salary']]\n\n# Filter rows\nhigh_salary = df[df['salary'] > 80000]\n\n# Filter with multiple conditions\nresult = df[(df['salary'] > 70000) & (df['department'] == 'Engineering')]\n\`\`\`\n\nPandas DataFrames are used in virtually every data science workflow for cleaning, transforming, and analyzing data.`,
          },
          {
            id: 'py-m2-l2', title: 'GroupBy, Merge & Aggregation', duration: '35m',
            content: `**Powerful Data Operations**\n\n**GroupBy — SQL's GROUP BY in Python:**\n\`\`\`python\n# Group by department and calculate stats\ndept_stats = df.groupby('department').agg({\n    'salary': ['mean', 'median', 'count', 'min', 'max'],\n    'name': 'count'\n}).round(0)\n\`\`\`\n\n**Merge — SQL's JOIN in Python:**\n\`\`\`python\n# Inner join\nmerged = pd.merge(employees, departments, on='department_id', how='inner')\n\n# Left join\nmerged = pd.merge(employees, departments, on='department_id', how='left')\n\`\`\`\n\n**Sorting and Ranking:**\n\`\`\`python\n# Sort\ndf_sorted = df.sort_values('salary', ascending=False)\n\n# Rank within groups\ndf['salary_rank'] = df.groupby('department')['salary'].rank(ascending=False)\n\`\`\`\n\n**Pivot Tables:**\n\`\`\`python\npivot = df.pivot_table(\n    values='salary',\n    index='department',\n    columns='year',\n    aggfunc='mean'\n)\n\`\`\`\n\nThese operations form the core of every data analysis task. Pandas makes it possible to do in Python what would otherwise require complex SQL queries.`,
          },
          {
            id: 'py-m2-l3', title: 'Data Cleaning with Pandas', duration: '25m',
            content: `**Cleaning Messy Data**\n\nData cleaning typically takes 60-80% of a data analyst's time. Pandas provides powerful tools.\n\n**Handling Missing Values:**\n\`\`\`python\n# Check for missing values\nprint(df.isnull().sum())\n\n# Drop rows with any missing values\ndf_clean = df.dropna()\n\n# Fill missing values\ndf['salary'].fillna(df['salary'].median(), inplace=True)\ndf['department'].fillna('Unknown', inplace=True)\n\`\`\`\n\n**Removing Duplicates:**\n\`\`\`python\nprint(f"Duplicates: {df.duplicated().sum()}")\ndf = df.drop_duplicates()\n\`\`\`\n\n**Type Conversions:**\n\`\`\`python\ndf['salary'] = df['salary'].astype(float)\ndf['date'] = pd.to_datetime(df['date'])\n\`\`\`\n\n**String Operations:**\n\`\`\`python\ndf['name'] = df['name'].str.strip().str.title()\ndf['email'] = df['email'].str.lower()\n\`\`\`\n\n**Outlier Detection:**\n\`\`\`python\n# IQR method\nQ1 = df['salary'].quantile(0.25)\nQ3 = df['salary'].quantile(0.75)\nIQR = Q3 - Q1\ndf = df[(df['salary'] >= Q1 - 1.5*IQR) & (df['salary'] <= Q3 + 1.5*IQR)]\n\`\`\`\n\nClean data is the foundation of reliable analysis. Always clean before analyzing.`,
          },
        ],
      },
      {
        title: 'Data Visualization',
        duration: '10h 00m',
        lessons: [
          {
            id: 'py-m3-l1', title: 'Matplotlib & Seaborn Fundamentals', duration: '30m',
            content: `**Visualizing Data in Python**\n\nData visualization is essential for exploring data and communicating insights.\n\n**Matplotlib** — the foundation:\n\`\`\`python\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Line chart\nplt.figure(figsize=(10, 6))\nplt.plot(months, revenue, marker='o', linewidth=2)\nplt.title('Monthly Revenue Trend')\nplt.xlabel('Month')\nplt.ylabel('Revenue ($)')\nplt.grid(True, alpha=0.3)\nplt.tight_layout()\nplt.show()\n\`\`\`\n\n**Seaborn** — statistical visualizations:\n\`\`\`python\n# Distribution plot\nfig, axes = plt.subplots(1, 2, figsize=(12, 5))\n\n# Histogram\nsns.histplot(data=df, x='salary', bins=20, kde=True, ax=axes[0])\naxes[0].set_title('Salary Distribution')\n\n# Box plot\nsns.boxplot(data=df, x='department', y='salary', ax=axes[1])\naxes[1].set_title('Salary by Department')\n\nplt.tight_layout()\nplt.show()\n\`\`\`\n\n**Choosing the Right Chart:**\n- **Bar chart** — Comparing categories\n- **Line chart** — Trends over time\n- **Scatter plot** — Relationships between variables\n- **Histogram** — Distribution of a single variable\n- **Heatmap** — Correlation matrix\n- **Box plot** — Distribution comparison across groups`,
          },
        ],
      },
      {
        title: 'Statistical Analysis & Testing',
        duration: '9h 00m',
        lessons: [
          {
            id: 'py-m4-l1', title: 'Hypothesis Testing with Python', duration: '30m',
            content: `**Statistical Testing in Practice**\n\n\`\`\`python\nfrom scipy import stats\nimport numpy as np\n\n# Two-sample t-test: Do two departments have different avg salaries?\ndep_a = df[df['department'] == 'Engineering']['salary']\ndep_b = df[df['department'] == 'Sales']['salary']\n\nt_stat, p_value = stats.ttest_ind(dep_a, dep_b)\n\nprint(f"T-statistic: {t_stat:.3f}")\nprint(f"P-value: {p_value:.4f}")\nprint(f"Significant: {'Yes' if p_value < 0.05 else 'No'}")\n\`\`\`\n\n**Chi-Square Test (categorical data):**\n\`\`\`python\n# Test if department and job level are independent\ncontingency = pd.crosstab(df['department'], df['level'])\nchi2, p_value, dof, expected = stats.chi2_contingency(contingency)\n\`\`\`\n\n**Correlation Analysis:**\n\`\`\`python\n# Pearson correlation\nr, p = stats.pearsonr(df['experience_years'], df['salary'])\nprint(f"Correlation: {r:.3f}, P-value: {p:.4f}")\n\`\`\`\n\n**Interpreting Results:**\n- If p < 0.05, the result is statistically significant\n- Always report both the test statistic and p-value\n- Statistical significance ≠ practical significance\n- Consider effect sizes alongside p-values`,
          },
        ],
      },
      {
        title: 'Machine Learning Intro & Capstone',
        duration: '8h 15m',
        lessons: [
          {
            id: 'py-m5-l1', title: 'Introduction to scikit-learn', duration: '35m',
            content: `**Machine Learning for Data Analysts**\n\nScikit-learn is Python's primary ML library. Here's a practical introduction.\n\n\`\`\`python\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report, confusion_matrix\n\n# Prepare data\nX = df[['experience', 'skills_count', 'education_level', 'projects']]\ny = df['hired']  # 0 or 1\n\n# Split data\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n# Train model\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)\n\n# Evaluate\npredictions = model.predict(X_test)\nprint(classification_report(y_test, predictions))\n\n# Feature importance\nimportance = pd.DataFrame({\n    'feature': X.columns,\n    'importance': model.feature_importances_\n}).sort_values('importance', ascending=False)\n\`\`\`\n\n**Key Concepts:**\n- **Supervised learning** requires labeled training data\n- Always split into train/test sets to evaluate generalization\n- Feature engineering is often more important than model selection\n- Start simple (logistic regression) before using complex models\n\nThis gives you the foundation to build predictive models for real business problems.`,
          },
          {
            id: 'py-m5-l2', title: 'Capstone: End-to-End Analysis Project', duration: '45m',
            content: `**Building a Complete Data Science Project**\n\n\`\`\`python\nimport pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report\n\n# 1. LOAD\ndf = pd.read_csv('employee_data.csv')\n\n# 2. EXPLORE\nprint(df.describe())\nprint(df.info())\n\n# 3. CLEAN\ndf['salary'] = df['salary'].fillna(df['salary'].median())\ndf['department'] = df['department'].str.strip()\n\n# 4. ANALYZE\ndept_stats = df.groupby('department')['salary'].agg(['mean', 'count']).sort_values('mean', ascending=False)\n\n# 5. VISUALIZE\nfig, axes = plt.subplots(1, 2, figsize=(14, 5))\nsns.barplot(x=dept_stats.index, y=dept_stats['mean'], ax=axes[0])\nsns.histplot(df['salary'], bins=25, kde=True, ax=axes[1])\nplt.tight_layout()\nplt.savefig('analysis.png', dpi=150)\n\n# 6. MODEL\nX = pd.get_dummies(df[['department', 'experience', 'education']])\ny = (df['salary'] > df['salary'].median()).astype(int)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\nmodel = RandomForestClassifier(n_estimators=100)\nmodel.fit(X_train, y_train)\nprint(classification_report(y_test, model.predict(X_test)))\n\`\`\`\n\nThis workflow — Load, Explore, Clean, Analyze, Visualize, Model — is the standard process used in data teams worldwide.`,
          },
        ],
      },
    ],
  },
  'powerbi-pro': {
    courseId: 'powerbi-pro',
    courseTitle: 'Power BI Pro: Business Intelligence Mastery',
    instructor: 'Lisa Wang',
    description: 'Build stunning dashboards and reports with Power BI.',
    gradient: 'from-amber-500 to-orange-600',
    modules: [
      {
        title: 'Power BI Desktop Fundamentals',
        duration: '7h 00m',
        lessons: [
          {
            id: 'pbi-m1-l1', title: 'Getting Started with Power BI', duration: '25m',
            content: `**Power BI Overview**\n\nPower BI is Microsoft's business intelligence tool that transforms raw data into interactive dashboards and reports.\n\n**Key Components:**\n- **Power BI Desktop** — Free desktop application for building reports\n- **Power BI Service** — Cloud service for publishing and sharing\n- **Power BI Mobile** — Apps for iOS and Android\n- **Power Query** — Data connectivity and transformation (M language)\n- **DAX** — Data Analysis Expressions for calculations\n\n**Workflow:**\n1. Connect to data sources\n2. Transform and model data (Power Query)\n3. Create calculations (DAX)\n4. Build visualizations\n5. Publish to Power BI Service\n\n**Getting Started:**\nDownload Power BI Desktop from microsoft.com. It's free and includes most features needed for report development.\n\nPower BI integrates natively with Azure, SQL Server, Excel, and hundreds of other data sources, making it the preferred BI tool for organizations using the Microsoft ecosystem.`,
          },
          {
            id: 'pbi-m1-l2', title: 'Data Connections & Power Query', duration: '30m',
            content: `**Connecting to Data**\n\nPower Query is Power BI's data transformation engine. It uses the M language under the hood.\n\n**Data Sources:**\n- Excel/CSV files\n- SQL Server, MySQL, PostgreSQL\n- Web APIs and web pages\n- Azure services\n- SharePoint and OneDrive\n\n**Common Transformations:**\n- Remove columns/rows\n- Filter values\n- Split columns\n- Merge queries\n- Pivot/unpivot\n- Change data types\n- Add custom columns\n\n**Example:** Cleaning sales data:\n1. Remove rows with null customer IDs\n2. Trim whitespace from product names\n3. Convert date strings to Date type\n4. Remove duplicate order entries\n5. Add a calculated column for profit margin\n\n**Best Practices:**\n- Use Query Dependencies view to understand data flow\n- Name queries descriptively\n- Disable query refresh during development for speed\n- Test with a subset of data before loading millions of rows\n\nPower Query transformations are recorded as steps, making them reproducible and maintainable.`,
          },
        ],
      },
      {
        title: 'DAX Fundamentals & Calculations',
        duration: '8h 00m',
        lessons: [
          {
            id: 'pbi-m2-l1', title: 'DAX Basics: Calculated Columns vs Measures', duration: '35m',
            content: `**Understanding DAX**\n\nDAX (Data Analysis Expressions) is Power BI's formula language for custom calculations.\n\n**Two Types of DAX:**\n\n**Calculated Columns** — Row-by-row calculation, stored in the table:\n\`\`\`dax\nFull Name = [FirstName] & " " & [LastName]\nProfit Margin = DIVIDE([Revenue] - [Cost], [Revenue])\n\`\`\`\n\n**Measures** — Dynamic aggregations evaluated at query time:\n\`\`\`dax\nTotal Revenue = SUM(Sales[Amount])\nAvg Order Value = DIVIDE([Total Revenue], COUNTROWS(Sales))\n\`\`\`\n\n**Key Difference:**\n- Calculated columns use memory and storage space\n- Measures are computed on-demand and respond to filters\n- **Always prefer measures** unless you need a column for relationships or filtering\n\n**Essential DAX Functions:**\n- **CALCULATE()** — The most important DAX function. Changes filter context.\n\`\`\`dax\nSales 2024 = CALCULATE([Total Revenue], 'Date'[Year] = 2024)\n\`\`\`\n- **FILTER()** — Returns a filtered table\n- **ALL()** — Removes filters from context\n- **RELATED()** — Follows relationships to get data from another table`,
          },
          {
            id: 'pbi-m2-l2', title: 'Time Intelligence with DAX', duration: '30m',
            content: `**Analyzing Trends Over Time**\n\nTime intelligence functions are DAX functions that perform calculations relative to time periods.\n\n**Prerequisites:**\n- You need a proper date table marked as such in your model\n- The date table must have continuous dates\n\n**Common Time Intelligence Functions:**\n\`\`\`dax\n-- Total for same period last year\nSales LY = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR('Date'[Date]))\n\n-- Year-over-Year growth\nYoY Growth % = DIVIDE([Total Revenue] - [Sales LY], [Sales LY])\n\n-- Year-to-date\nYTD Sales = TOTALYTD([Total Revenue], 'Date'[Date])\n\n-- Previous month\nSales PM = CALCULATE([Total Revenue], PREVIOUSMONTH('Date'[Date]))\n\n-- Running total\nRunning Total = \n  CALCULATE(\n    [Total Revenue],\n    FILTER(ALL('Date'), 'Date'[Date] <= MAX('Date'[Date])\n  )\n\`\`\`\n\n**Creating a Date Table:**\n\`\`\`dax\nDateTable = \n  ADDCOLUMNS(\n    CALENDARAUTO(),\n    "Year", YEAR([Date]),\n    "Month", FORMAT([Date], "MMMM"),\n    "MonthNum", MONTH([Date]),\n    "Quarter", "Q" & CEILING(MONTH([Date])/3, 1)\n  )\n\`\`\`\n\nTime intelligence is essential for any business dashboard that tracks performance over time.`,
          },
        ],
      },
      {
        title: 'Data Modeling & Relationships',
        duration: '6h 30m',
        lessons: [
          {
            id: 'pbi-m3-l1', title: 'Star Schema & Relationships', duration: '30m',
            content: `**Building a Solid Data Model**\n\nThe data model is the foundation of every Power BI report. A good model makes building reports easy; a bad model makes everything harder.\n\n**Star Schema:**\nThe recommended pattern for Power BI data models:\n- One **fact table** in the center (transactions, events)\n- Multiple **dimension tables** around it (customers, products, dates)\n- Relationships flow from dimension to fact (1-to-many)\n\n**Example Model:**\n- **FactSales** (order_id, customer_id, product_id, date_id, quantity, revenue)\n- **DimCustomer** (customer_id, name, region, segment)\n- **DimProduct** (product_id, name, category, subcategory)\n- **DimDate** (date_id, date, month, quarter, year)\n\n**Relationship Settings:**\n- **Cardinality**: One-to-many (dimension → fact)\n- **Cross filter direction**: Single (from dimension to fact)\n- **Active/Inactive**: Only one relationship between two tables can be active\n\n**Best Practices:**\n1. Always use a date table for time-based analysis\n2. Keep the model as flat as possible (avoid snowflake)\n3. Hide unnecessary columns after building the model\n4. Use meaningful table and column names\n5. Verify relationships in Model View`,
          },
        ],
      },
      {
        title: 'Advanced Visualizations',
        duration: '7h 30m',
        lessons: [
          {
            id: 'pbi-m4-l1', title: 'Dashboard Design Principles', duration: '30m',
            content: `**Creating Effective Dashboards**\n\nA great dashboard tells a story with data. Here are the key design principles.\n\n**Layout Best Practices:**\n- **Top-left**: Most important KPI (first thing users see)\n- **Top row**: Summary metrics and key indicators\n- **Middle**: Main visualizations (trends, comparisons)\n- **Bottom**: Supporting details and filters\n\n**Visual Selection Guide:**\n- **KPI Cards** → Single key metrics (Total Revenue, Active Users)\n- **Line Charts** → Trends over time\n- **Bar Charts** → Comparing categories\n- **Maps** → Geographic data\n- **Tables/Matrices** → Detailed data view\n- **Scatter Plots** → Correlation between two metrics\n- **Waterfall** → Sequential contribution to a total\n- **Tooltip Charts** → Extra detail on hover\n\n**Color Rules:**\n- Use color consistently (green = good, red = bad)\n- Don't use more than 5-6 colors\n- Consider color blindness (avoid red-green only)\n- Use conditional formatting for emphasis\n\n**Interactivity:**\n- Add slicers for key filters (date, region, product)\n- Use drill-through for detailed analysis\n- Add bookmarks for storytelling\n- Enable cross-filtering between visuals`,
          },
        ],
      },
      {
        title: 'Publishing & Deployment',
        duration: '5h 30m',
        lessons: [
          {
            id: 'pbi-m5-l1', title: 'Publishing to Power BI Service', duration: '25m',
            content: `**Sharing Your Reports**\n\n**Publishing Steps:**\n1. Click "Publish" in Power BI Desktop\n2. Select your Power BI Service workspace\n3. The dataset and report are uploaded\n\n**Workspaces:**\n- **My Workspace** — Personal, don't use for collaboration\n- **App Workspaces** — For teams, create one per project\n- **Publish to App** — Package workspace as an app for consumers\n\n**Access Control:**\n- Add users/groups to workspaces with roles:\n  - **Viewer**: Can view reports\n  - **Contributor**: Can edit and publish\n  - **Admin**: Full control\n- Use **Row-Level Security (RLS)** to restrict data per user\n\n**Row-Level Security:**\n\`\`\`dax\n[Region Filter] = \n  IF(\n    USERPRINCIPALNAME() IN VALUES('Users'[Email]),\n    TRUE(),\n    FALSE()\n  )\n\`\`\`\n\n**Refresh Schedules:**\n- Set up scheduled refresh for imported data\n- Use DirectQuery for real-time (but slower) access\n- Incremental refresh for large datasets\n\n**Best Practices:**\n- Use deployment pipelines for DEV → TEST → PROD\n- Document your data model and DAX measures\n- Set up data alerts for critical KPIs`,
          },
        ],
      },
    ],
  },
  'advanced-excel': {
    courseId: 'advanced-excel',
    courseTitle: 'Advanced Excel & VBA for Analytics',
    instructor: 'Patricia Anderson',
    description: 'Go beyond basic spreadsheets with advanced Excel techniques.',
    gradient: 'from-green-600 to-emerald-600',
    modules: [
      {
        title: 'Advanced Formulas & Functions',
        duration: '7h 00m',
        lessons: [
          {
            id: 'xl-m1-l1', title: 'XLOOKUP, INDEX/MATCH & Dynamic Arrays', duration: '30m',
            content: `**Advanced Lookup Functions**\n\n**XLOOKUP** (Excel 365) — The modern replacement for VLOOKUP:\n\n\`\`\`excel\n=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])\n\n// Example: Find employee salary\n=XLOOKUP(F2, A:A, C:C, "Not Found")\n\n// Example: Find latest sale by date\n=XLOOKUP(MAX(A:A), A:A, B:B)\n\`\`\`\n\n**INDEX/MATCH** — The powerful traditional approach:\n\`\`\`excel\n=INDEX(return_range, MATCH(lookup_value, lookup_range, 0))\n\n// Example: Two-way lookup\n=INDEX(C3:G10, MATCH("Product A", B3:B10, 0), MATCH("Q2", C2:G2, 0))\n\`\`\`\n\n**Dynamic Arrays (Excel 365):**\n\`\`\`excel\n// FILTER: Extract matching rows\n=FILTER(A2:D100, C2:C100 > 50000, "No results")\n\n// SORT: Sort a range\n=SORT(A2:D100, 3, -1)  // Sort by column 3 descending\n\n// UNIQUE: Get unique values\n=UNIQUE(B2:B100)\n\n// SEQUENCE: Generate a series\n=SEQUENCE(10, 1, 1, 1)  // 1 to 10\n\`\`\`\n\n**Pro Tips:**\n- XLOOKUP defaults to exact match (unlike VLOOKUP which defaults to approximate)\n- Dynamic arrays spill results automatically — no Ctrl+Shift+Enter needed\n- Use IFERROR to handle errors gracefully`,
          },
          {
            id: 'xl-m1-l2', title: 'Conditional Calculations & Array Formulas', duration: '25m',
            content: `**SUMIFS, COUNTIFS & Beyond**\n\n**Conditional Aggregation:**\n\`\`\`excel\n// Sum with multiple conditions\n=SUMIFS(D:D, B:B, "Sales", C:C, ">="&DATE(2025,1,1))\n\n// Count with conditions\n=COUNTIFS(B:B, "Engineering", D:D, ">75000")\n\n// Average with conditions\n=AVERAGEIFS(D:D, B:B, "Engineering")\n\n\`\`\`\n\n**LET Function** (Excel 365) — Define variables for complex formulas:\n\`\`\`excel\n=LET(\n    avg_salary, AVERAGE(D:D),\n    threshold, avg_salary * 1.2,\n    COUNTIF(D:D, ">" & threshold)\n)\n\`\`\`\n\n**LAMBDA Function** — Create custom reusable functions:\n\`\`\`excel\n// Define in Name Manager:\n= LAMBDA(price, quantity, discount,\n    IF(quantity >= 10, price * quantity * (1 - discount), price * quantity)\n)\n\n// Use in cells:\n=CalculatePrice(29.99, 15, 0.1)\n\`\`\`\n\n**TEXT Functions for Data Cleaning:**\n\`\`\`excel\n=TRIM(A2)              // Remove extra spaces\n=UPPER(A2)             // Convert to uppercase\n=SUBSTITUTE(A2," ","_") // Replace text\n=TEXT(A2,"$#,##0.00")   // Format as currency\n=LEFT(A2,FIND("@",A2)-1) // Extract email username\n\`\`\``,
          },
        ],
      },
      {
        title: 'Pivot Tables & Data Analysis',
        duration: '5h 30m',
        lessons: [
          {
            id: 'xl-m2-l1', title: 'Mastering Pivot Tables', duration: '30m',
            content: `**Pivot Tables: Excel's Most Powerful Feature**\n\nPivot tables allow you to summarize, analyze, and explore data interactively.\n\n**Creating a Pivot Table:**\n1. Select your data range (Ctrl+T to make it a Table first)\n2. Insert → Pivot Table\n3. Drag fields to Rows, Columns, Values, and Filters\n\n**Key Features:**\n- **Rows** — Categories for grouping\n- **Columns** — Secondary categories (creates matrix)\n- **Values** — What to calculate (SUM, COUNT, AVG, etc.)\n- **Filters** — Overall report filters\n- **Slicers** — Visual filter buttons\n\n**Value Field Settings:**\n- Change calculation type (Sum, Count, Average, Max, Min)\n- Show values as % of total, % of row/column, running total\n- Number formatting\n\n**Calculated Fields:**\n\`\`\`excel\n// Create a calculated field in pivot table\nProfit Margin = 'Revenue' - 'Cost'\n\`\`\`\n\n**Grouping:**\n- Group dates by months, quarters, years\n- Group numbers into custom ranges\n- Group text items manually\n\n**Best Practices:**\n1. Always use Excel Tables as data source\n2. Refresh pivot tables when data changes (Alt+F5)\n3. Use slicers for interactive filtering\n4. Use conditional formatting in pivot tables for emphasis`,
          },
        ],
      },
      {
        title: 'Power Query & Data Transformation',
        duration: '5h 00m',
        lessons: [
          {
            id: 'xl-m3-l1', title: 'Power Query Fundamentals', duration: '25m',
            content: `**Power Query: Excel's ETL Engine**\n\nPower Query (found in Data tab → Get Data) automates data import and transformation.\n\n**Getting Data:**\n- From File → Excel/CSV/JSON/XML\n- From Database → SQL Server, MySQL, etc.\n- From Web → Web page, API\n- From Other Sources → SharePoint, OData, etc.\n\n**Common Transformations:**\n1. Remove top rows (headers to skip)\n2. Remove columns you don't need\n3. Change data types\n4. Split columns by delimiter\n5. Merge columns\n6. Filter rows\n7. Replace values\n8. Pivot/Unpivot columns\n\n**Applied Steps:**\nEvery transformation is recorded as a step. You can:\n- Edit any previous step\n- Delete steps\n- Rename steps for clarity\n- Duplicate a query with modifications\n\n**M Queries (Advanced):**\nPower Query generates M language code. You can view and edit it in Advanced Editor.\n\n**Best Practices:**\n- Clean data at the source in Power Query\n- Don't hardcode values — use parameters instead\n- Create a template query and duplicate for similar data sources\n- Disable background refresh during development`,
          },
        ],
      },
      {
        title: 'Macros & VBA Programming',
        duration: '4h 00m',
        lessons: [
          {
            id: 'xl-m4-l1', title: 'Recording & Writing VBA Macros', duration: '30m',
            content: `**Automating with VBA**\n\nVBA (Visual Basic for Applications) lets you automate repetitive tasks in Excel.\n\n**Recording a Macro:**\n1. Developer tab → Record Macro\n2. Perform your actions\n3. Stop recording\n4. Review the generated code\n\n**Essential VBA Concepts:**\n\`\`\`vba\nSub FormatReport()\n    ' Declare variables\n    Dim ws As Worksheet\n    Dim lastRow As Long\n    \n    Set ws = ThisWorkbook.Sheets("Report")\n    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row\n    \n    ' Format header\n    ws.Range("A1:E1").Font.Bold = True\n    ws.Range("A1:E1").Interior.Color = RGB(0, 122, 204)\n    ws.Range("A1:E1").Font.Color = RGB(255, 255, 255)\n    \n    ' AutoFit columns\n    ws.Columns("A:E").AutoFit\n    \n    ' Add borders\n    ws.Range("A1:E" & lastRow).Borders.LineStyle = xlContinuous\nEnd Sub\n\`\`\`\n\n**Looping Through Data:**\n\`\`\`vba\nFor i = 2 To lastRow\n    If ws.Cells(i, 3).Value > 10000 Then\n        ws.Cells(i, 3).Interior.Color = RGB(198, 239, 206)\n    End If\nNext i\n\`\`\`\n\n**When to Use VBA:**\n- Repetitive formatting tasks\n- Multi-step data processing\n- Custom report generation\n- Automating email from Excel\n- Interacting with other Office apps`,
          },
        ],
      },
      {
        title: 'Dashboard Building',
        duration: '4h 30m',
        lessons: [
          {
            id: 'xl-m5-l1', title: 'Building Professional Dashboards', duration: '35m',
            content: `**Creating Executive Dashboards in Excel**\n\n**Dashboard Structure:**\n1. **Summary Sheet** — KPIs and key metrics at the top\n2. **Data Sheet** — Raw data (hidden from end users)\n3. **Calculations Sheet** — Intermediate calculations (hidden)\n4. **Charts Sheet** — Individual charts for layout\n\n**Key Dashboard Elements:**\n- KPI cards using merged cells + large fonts\n- Sparklines for inline trends\n- Conditional formatting for status indicators\n- Slicers connected to multiple pivot tables\n- Charts: combo charts, bullet charts, gauge-style\n\n**Advanced Techniques:**\n- Camera tool for linked pictures\n- Dynamic chart titles with formulas\n- In-cell charts using REPT function:\n\`\`\`excel\n=REPT("|", A2/1000)\n\`\`\`\n- Dynamic ranges with OFFSET and COUNTA\n\n**Design Principles:**\n- Use a consistent color palette (3-4 colors max)\n- No gridlines on dashboard (View → uncheck Gridlines)\n- Freeze panes so headers stay visible\n- Group sheets and protect workbook structure\n- Use page setup for clean printing\n\n**Final Checklist:**\n- [ ] All KPIs update when data refreshes\n- [ ] Slicers control all pivot tables\n- [ ] Charts have clear titles and labels\n- [ ] Dashboard fits on one screen\n- [ ] Data sheets are hidden and protected`,
          },
        ],
      },
      {
        title: 'Data Analysis Projects',
        duration: '2h 30m',
        lessons: [
          {
            id: 'xl-m6-l1', title: 'Capstone: Sales Performance Analysis', duration: '45m',
            content: `**End-to-End Excel Analysis Project**\n\n**Scenario:** Analyze Q4 2025 sales performance across regions and products.\n\n**Step 1: Data Import**\n- Import sales_data.csv using Power Query\n- Clean column names, convert dates\n- Remove duplicates and handle missing values\n\n**Step 2: Build Calculations**\n- Revenue per product\n- Growth rate vs Q3\n- Average order value\n- Top/bottom performers\n\n**Step 3: Pivot Table Analysis**\n- Sales by region (rows) and month (columns)\n- Product performance ranking\n- Sales rep performance\n- Filter by date range using slicers\n\n**Step 4: Visualizations**\n- Combo chart: Revenue (bars) + Growth % (line)\n- Pie chart: Revenue share by region\n- Bar chart: Top 10 products by revenue\n- Scatter plot: Orders vs Revenue by region\n\n**Step 5: Dashboard Assembly**\n- KPI summary at top (Total Revenue, Growth %, Avg Order)\n- Main chart area\n- Slicers for region and product category\n- Supporting detail tables\n\nThis project combines everything: Power Query for data prep, Pivot Tables for analysis, charts for visualization, and dashboard design for presentation. This is the skill set that employers look for in Excel-heavy analyst roles.`,
          },
        ],
      },
    ],
  },
};

export default function CourseContentView({ courseId, onBack }: { courseId: string; onBack: () => void }) {
  const courseData = COURSE_CONTENT[courseId];
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(`dt-course-progress-${courseId}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dt-course-progress-${courseId}`, JSON.stringify([...completedLessons]));
    }
  }, [completedLessons, courseId]);

  if (!courseData) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Course content not available yet.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">Back to Store</Button>
      </div>
    );
  }

  const totalLessons = courseData.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = courseData.modules.reduce((sum, m) => sum + m.lessons.filter(l => completedLessons.has(l.id)).length, 0);
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const activeLesson = activeLessonId
    ? courseData.modules.flatMap(m => m.lessons).find(l => l.id === activeLessonId) || null
    : null;

  const toggleComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const formatContent = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let idx = 0;

    while (remaining.length > 0) {
      const codeStart = remaining.indexOf('```');
      if (codeStart === -1) {
        parts.push(<span key={idx++}>{formatInlineText(remaining)}</span>);
        break;
      }
      if (codeStart > 0) {
        parts.push(<span key={idx++}>{formatInlineText(remaining.slice(0, codeStart))}</span>);
      }
      const codeEnd = remaining.indexOf('```', codeStart + 3);
      if (codeEnd === -1) {
        parts.push(<span key={idx++}>{formatInlineText(remaining)}</span>);
        break;
      }
      const codeBlock = remaining.slice(codeStart + 3, codeEnd);
      const langMatch = codeBlock.match(/^(\w+)\n/);
      const code = langMatch ? codeBlock.slice(langMatch[0].length) : codeBlock;
      const lang = langMatch ? langMatch[1] : '';

      parts.push(
        <div key={idx++} className="my-4 rounded-lg bg-gray-900 dark:bg-gray-950 overflow-hidden">
          {lang && <div className="px-4 py-1.5 bg-gray-800 text-xs text-gray-400 font-mono">{lang}</div>}
          <pre className="p-4 overflow-x-auto text-sm text-emerald-300 font-mono leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      );
      remaining = remaining.slice(codeEnd + 3);
    }
    return parts;
  };

  const formatInlineText = (text: string) => {
    const result: React.ReactNode[] = [];
    let remaining = text;
    let idx = 0;
    while (remaining.length > 0) {
      const boldStart = remaining.indexOf('**');
      const codeStart = remaining.indexOf('`');
      let nextMarker = -1;
      let markerType: 'bold' | 'code' | null = null;
      if (boldStart !== -1 && (codeStart === -1 || boldStart < codeStart)) { nextMarker = boldStart; markerType = 'bold'; }
      else if (codeStart !== -1) { nextMarker = codeStart; markerType = 'code'; }
      if (nextMarker === -1) { result.push(<span key={idx++}>{remaining}</span>); break; }
      if (nextMarker > 0) result.push(<span key={idx++}>{remaining.slice(0, nextMarker)}</span>);
      if (markerType === 'bold') {
        const end = remaining.indexOf('**', nextMarker + 2);
        if (end === -1) { result.push(<span key={idx++}>{remaining}</span>); break; }
        result.push(<strong key={idx++}>{remaining.slice(nextMarker + 2, end)}</strong>);
        remaining = remaining.slice(end + 2);
      } else {
        const end = remaining.indexOf('`', nextMarker + 1);
        if (end === -1) { result.push(<span key={idx++}>{remaining}</span>); break; }
        result.push(<code key={idx++} className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-mono">{remaining.slice(nextMarker + 1, end)}</code>);
        remaining = remaining.slice(end + 1);
      }
    }
    return result;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Store
          </Button>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${courseData.gradient} flex items-center justify-center`}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{courseData.courseTitle}</h1>
            <p className="text-xs text-muted-foreground">{courseData.instructor}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {completedCount}/{totalLessons} lessons
          </Badge>
          {progressPct === 100 && (
            <Badge className="bg-emerald-500 text-white">Completed! 🎉</Badge>
          )}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Course Progress</span>
          <span className="text-sm font-bold text-emerald-600">{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-2.5" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Modules & Lessons */}
        <div className="lg:col-span-1 space-y-3 max-h-[75vh] overflow-y-auto pr-1">
          {courseData.modules.map((mod, mIdx) => {
            const moduleLessons = mod.lessons.length;
            const moduleCompleted = mod.lessons.filter(l => completedLessons.has(l.id)).length;
            const isExpanded = expandedModule === mod.title;
            const isActive = activeLesson && mod.lessons.some(l => l.id === activeLesson.id);

            return (
              <motion.div key={mod.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: mIdx * 0.05 }}>
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : mod.title)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all',
                    isActive ? 'border-violet-300 bg-violet-50 dark:bg-violet-950/20' : 'border-border/50 hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                        moduleCompleted === moduleLessons ? 'bg-emerald-500 text-white' : 'bg-muted'
                      )}>
                        {moduleCompleted === moduleLessons ? <CheckCircle2 className="w-4 h-4" /> : mIdx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{mod.title}</p>
                        <p className="text-[10px] text-muted-foreground">{moduleCompleted}/{moduleLessons} · {mod.duration}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-3 mt-1 border-l-2 border-muted pl-3 space-y-1"
                    >
                      {mod.lessons.map((lesson) => {
                        const isCompleted = completedLessons.has(lesson.id);
                        const isActiveLesson = activeLessonId === lesson.id;
                        return (
                          <motion.button
                            key={lesson.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={cn(
                              'w-full text-left p-2.5 rounded-lg transition-all flex items-center gap-2',
                              isActiveLesson ? 'bg-violet-100 dark:bg-violet-900/30' : 'hover:bg-muted/50'
                            )}
                          >
                            {isCompleted
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                            }
                            <div className="min-w-0 flex-1">
                              <p className={cn('text-xs font-medium truncate', isActiveLesson && 'text-violet-700 dark:text-violet-300')}>{lesson.title}</p>
                              <p className="text-[10px] text-muted-foreground">{lesson.duration}</p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          {activeLesson ? (
            <motion.div key={activeLesson.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${courseData.gradient} flex items-center justify-center`}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{activeLesson.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{activeLesson.duration}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={completedLessons.has(activeLesson.id) ? 'outline' : 'default'}
                      size="sm"
                      className={cn(
                        completedLessons.has(activeLesson.id) ? 'text-emerald-600 border-emerald-300' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      )}
                      onClick={() => toggleComplete(activeLesson.id)}
                    >
                      {completedLessons.has(activeLesson.id) ? (
                        <><CheckCircle2 className="w-4 h-4 mr-1" /> Completed</>
                      ) : (
                        <><Circle className="w-4 h-4 mr-1" /> Mark Complete</>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                    {formatContent(activeLesson.content)}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                {(() => {
                  const allLessons = courseData.modules.flatMap(m => m.lessons);
                  const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id);
                  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
                  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
                  return (
                    <>
                      {prevLesson ? (
                        <Button variant="outline" size="sm" onClick={() => setActiveLessonId(prevLesson.id)}>
                          <ArrowLeft className="w-4 h-4 mr-1" /> {prevLesson.title.slice(0, 30)}...
                        </Button>
                      ) : <div />}
                      {nextLesson ? (
                        <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white" onClick={() => setActiveLessonId(nextLesson.id)}>
                          {nextLesson.title.slice(0, 30)}... <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => { setActiveLessonId(null); toast.success('Course completed! Congratulations!'); }}>
                          <Trophy className="w-4 h-4 mr-1" /> Finish Course
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${courseData.gradient} flex items-center justify-center shadow-xl mb-6`}>
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Start Learning!</h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Select a lesson from the sidebar to begin. Your progress will be saved automatically.
              </p>
              {courseData.modules[0]?.lessons[0] && (
                <Button
                  className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                  onClick={() => {
                    setExpandedModule(courseData.modules[0].title);
                    setActiveLessonId(courseData.modules[0].lessons[0].id);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" /> Start with Lesson 1
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
