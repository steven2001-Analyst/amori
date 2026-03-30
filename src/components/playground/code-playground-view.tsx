'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Play,
  Copy,
  Trash2,
  Maximize2,
  Minimize2,
  Code,
  Terminal,
  ChevronDown,
  Share2,
  Keyboard,
  History,
  FileText,
  Clock,
  Zap,
  Check,
  X,
  Database,
  Hash,
  Braces,
  BarChart3,
  FolderOpen,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Language = 'sql' | 'python' | 'javascript' | 'r';

interface CodeExample {
  label: string;
  code: string;
}

interface CodeTemplate {
  label: string;
  icon: string;
  code: string;
}

interface HistoryEntry {
  code: string;
  language: Language;
  timestamp: number;
  label: string;
}

// ─── Placeholders ────────────────────────────────────────────────────────────

const PLACEHOLDERS: Record<Language, string> = {
  sql: `-- DataTrack Pro: Sales Analytics Query
SELECT 
  p.category,
  p.name AS product,
  SUM(o.quantity) AS total_sold,
  ROUND(AVG(o.price), 2) AS avg_price,
  SUM(o.quantity * o.price) AS revenue
FROM orders o
JOIN products p ON o.product_id = p.id
WHERE o.order_date >= '2024-01-01'
GROUP BY p.category, p.name
HAVING revenue > 1000
ORDER BY revenue DESC
LIMIT 20;`,
  python: `# DataTrack Pro: Sales Analysis Pipeline
import pandas as pd
import numpy as np

# Load data
data = {
    'product': ['Widget A', 'Widget B', 'Gadget C', 'Widget A', 'Gadget C'],
    'region': ['East', 'West', 'East', 'West', 'North'],
    'sales': [12500, 8900, 15600, 11200, 9800],
    'date': ['2024-01', '2024-01', '2024-02', '2024-02', '2024-03']
}

df = pd.DataFrame(data)
print("=== Sales Summary ===")
print(df.groupby('region')['sales'].agg(['sum', 'mean', 'count']))
print(f"\\nTotal Revenue: \${df['sales'].sum():,.0f}")
print(f"Avg Sale: \${df['sales'].mean():,.2f}")`,
  javascript: `// DataTrack Pro: Data Pipeline
const salesData = [
  { product: 'Widget A', region: 'East', amount: 12500, date: '2024-01' },
  { product: 'Widget B', region: 'West', amount: 8900, date: '2024-01' },
  { product: 'Gadget C', region: 'East', amount: 15600, date: '2024-02' },
  { product: 'Widget A', region: 'West', amount: 11200, date: '2024-02' },
  { product: 'Gadget C', region: 'North', amount: 9800, date: '2024-03' },
];

// Aggregate by region
const byRegion = salesData.reduce((acc, item) => {
  if (!acc[item.region]) acc[item.region] = { total: 0, count: 0 };
  acc[item.region].total += item.amount;
  acc[item.region].count += 1;
  return acc;
}, {});

console.log('=== Revenue by Region ===');
Object.entries(byRegion).forEach(([region, data]) => {
  console.log(\`  \${region}: $\${data.total.toLocaleString()} (\${data.count} sales)\`);
});

const totalRevenue = salesData.reduce((s, i) => s + i.amount, 0);
console.log(\`\\nTotal Revenue: $\${totalRevenue.toLocaleString()}\`);`,
  r: `# DataTrack Pro: Data Analysis in R
# Load built-in dataset
data <- mtcars

# Basic summary statistics
print("=== Dataset Summary ===")
summary(data[, c("mpg", "hp", "wt")])

# Mean MPG by cylinder count
print("")
print("=== Mean MPG by Cylinders ===")
print(aggregate(mpg ~ cyl, data = data, FUN = mean))

# Correlation matrix
print("")
print("=== Correlation Matrix ===")
print(round(cor(data[, c("mpg", "disp", "hp", "wt")]), 3))`,
};

// ─── Code Templates ──────────────────────────────────────────────────────────

const TEMPLATES: Record<Language, CodeTemplate[]> = {
  sql: [
    { label: 'Data Cleaning Query', icon: '🧹', code: `-- Data Cleaning: Remove duplicates, handle NULLs
WITH cleaned_data AS (
  SELECT 
    id,
    COALESCE(TRIM(name), 'Unknown') AS name,
    COALESCE(email, 'no-email@unknown.com') AS email,
    COALESCE(salary, 0) AS salary,
    COALESCE(department, 'Unassigned') AS department,
    ROW_NUMBER() OVER (
      PARTITION BY email ORDER BY created_at DESC
    ) AS row_num
  FROM raw_employees
  WHERE is_deleted = FALSE OR is_deleted IS NULL
)
SELECT * FROM cleaned_data
WHERE row_num = 1;` },
    { label: 'ETL Pipeline', icon: '🔄', code: `-- ETL: Extract → Transform → Load pattern
-- Step 1: Extract
WITH raw_sales AS (
  SELECT * FROM staging_sales WHERE load_date = CURRENT_DATE
),
-- Step 2: Transform
transformed AS (
  SELECT 
    s.id,
    s.product_id,
    p.name AS product_name,
    p.category,
    s.quantity,
    s.unit_price,
    s.quantity * s.unit_price AS total_amount,
    CASE 
      WHEN s.quantity * s.unit_price > 10000 THEN 'High Value'
      WHEN s.quantity * s.unit_price > 5000 THEN 'Medium Value'
      ELSE 'Low Value'
    END AS value_tier,
    DATE_TRUNC('month', s.sale_date) AS sale_month
  FROM raw_sales s
  JOIN products p ON s.product_id = p.id
)
-- Step 3: Load into target
INSERT INTO fact_sales (product_id, category, quantity, unit_price, total_amount, value_tier, sale_month)
SELECT product_id, category, quantity, unit_price, total_amount, value_tier, sale_month
FROM transformed
ON CONFLICT (id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  total_amount = EXCLUDED.total_amount;` },
    { label: 'Dashboard KPI Query', icon: '📊', code: `-- Dashboard: Key Performance Indicators
SELECT 
  (SELECT COUNT(*) FROM users WHERE active = TRUE) AS active_users,
  (SELECT COUNT(*) FROM orders WHERE order_date >= DATE_TRUNC('month', CURRENT_DATE)) AS orders_this_month,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE order_date >= DATE_TRUNC('month', CURRENT_DATE)) AS revenue_mtd,
  (SELECT ROUND(AVG(total), 2) FROM orders) AS avg_order_value,
  (SELECT COUNT(DISTINCT product_id) FROM order_items) AS unique_products_sold,
  (SELECT ROUND(
    100.0 * COUNT(CASE WHEN status = 'completed' THEN 1 END) / 
    NULLIF(COUNT(*), 0), 1
  ) FROM orders) AS completion_rate_pct;` },
  ],
  python: [
    { label: 'Data Cleaning Pipeline', icon: '🧹', code: `# Data Cleaning Pipeline
import pandas as pd
import numpy as np

# Create sample data with issues
df = pd.DataFrame({
    'name': ['Alice', 'BOB', 'charlie', '  Diana  ', np.nan],
    'age': [25, -1, 35, 200, 28],
    'email': ['alice@test.com', 'bob@test', None, 'diana@test.com', 'eve@test.com'],
    'salary': [50000, 60000, None, 45000, 0]
})

print("=== Before Cleaning ===")
print(df)

# Cleaning steps
df['name'] = df['name'].fillna('Unknown').str.strip().str.title()
df['age'] = df['age'].replace(-1, np.nan).clip(0, 120)
df['email'] = df['email'].fillna('missing@email.com')
df['salary'] = df['salary'].replace(0, np.nan).fillna(df['salary'].median())

print("\\n=== After Cleaning ===")
print(df)
print(f"\\nMissing values:\\n{df.isnull().sum()}")` },
    { label: 'ETL Pipeline', icon: '🔄', code: `# ETL Pipeline with Pandas
import pandas as pd
import numpy as np

# EXTRACT
raw_orders = pd.DataFrame({
    'order_id': [101, 102, 103, 104, 105],
    'customer': ['Alice', 'Bob', 'Alice', 'Charlie', 'Diana'],
    'product': ['Laptop', 'Mouse', 'Keyboard', 'Laptop', 'Monitor'],
    'amount': [1200, 25, 75, 1200, 350],
    'date': ['2024-01-15', '2024-01-16', '2024-01-16', '2024-01-17', '2024-01-18']
})
raw_orders['date'] = pd.to_datetime(raw_orders['date'])

# TRANSFORM
daily_summary = raw_orders.groupby(raw_orders['date'].dt.date).agg(
    total_revenue=('amount', 'sum'),
    order_count=('order_id', 'count'),
    avg_order_value=('amount', 'mean'),
    unique_customers=('customer', 'nunique')
).round(2)

customer_lifetime = raw_orders.groupby('customer').agg(
    total_spent=('amount', 'sum'),
    orders=('order_id', 'count'),
    favorite_product=('product', lambda x: x.mode()[0])
).sort_values('total_spent', ascending=False)

# LOAD (simulate)
print("=== Daily Summary ===")
print(daily_summary)
print("\\n=== Customer Lifetime Value ===")
print(customer_lifetime)` },
    { label: 'Statistical Analysis', icon: '📈', code: `# Statistical Analysis
import pandas as pd
import numpy as np

np.random.seed(42)
data = pd.DataFrame({
    'group': np.random.choice(['A', 'B', 'C'], 150),
    'value': np.concatenate([
        np.random.normal(50, 10, 50),
        np.random.normal(55, 12, 50),
        np.random.normal(45, 8, 50)
    ])
})

print("=== Descriptive Statistics ===")
print(data.groupby('group')['value'].describe().round(2))

print("\\n=== Correlation Matrix ===")
# Simulate multi-column data
multi = pd.DataFrame({
    'revenue': np.random.normal(10000, 2000, 100),
    'customers': np.random.normal(500, 100, 100),
    'satisfaction': np.random.uniform(3, 5, 100)
})
print(multi.corr().round(3))

print("\\n=== ANOVA Test ===")
from scipy import stats
groups = [g['value'].values for _, g in data.groupby('group')]
f_stat, p_value = stats.f_oneway(*groups)
print(f"F-statistic: {f_stat:.4f}")
print(f"P-value: {p_value:.6f}")
print(f"Result: {'Significant' if p_value < 0.05 else 'Not significant'} difference")` },
  ],
  javascript: [
    { label: 'Data Transformation', icon: '🔄', code: `// Data Transformation Pipeline
const rawData = [
  { name: 'Alice', dept: 'engineering', salary: 95000, start: '2020-03' },
  { name: 'Bob', dept: 'marketing', salary: 72000, start: '2019-07' },
  { name: 'Charlie', dept: 'engineering', salary: 105000, start: '2018-01' },
  { name: 'Diana', dept: 'marketing', salary: 68000, start: '2021-11' },
  { name: 'Eve', dept: 'engineering', salary: 88000, start: '2022-05' },
  { name: 'Frank', dept: 'hr', salary: 75000, start: '2020-09' },
];

// Transform: enrich with computed fields
const enriched = rawData.map(emp => ({
  ...emp,
  tenureYears: new Date().getFullYear() - parseInt(emp.start),
  salaryBand: emp.salary >= 90000 ? 'Senior' : emp.salary >= 75000 ? 'Mid' : 'Junior',
  annualBonus: Math.round(emp.salary * 0.12),
}));

// Aggregate by department
const deptStats = enriched.reduce((acc, emp) => {
  if (!acc[emp.dept]) {
    acc[emp.dept] = { count: 0, totalSalary: 0, employees: [] };
  }
  acc[emp.dept].count++;
  acc[emp.dept].totalSalary += emp.salary;
  acc[emp.dept].employees.push(emp.name);
  return acc;
}, {});

console.log('=== Department Analysis ===');
Object.entries(deptStats).forEach(([dept, stats]) => {
  const avg = Math.round(stats.totalSalary / stats.count);
  console.log(\`  \${dept}: \${stats.count} employees, avg $ \${avg.toLocaleString()}\`);
});` },
    { label: 'API Data Pipeline', icon: '🔌', code: `// API Data Pipeline with Error Handling
class DataPipeline {
  constructor(name) {
    this.name = name;
    this.steps = [];
    this.results = [];
  }

  extract(data) {
    this.results = [...data];
    return this;
  }

  transform(fn) {
    this.steps.push(fn.name || 'transform');
    this.results = this.results.map(fn);
    return this;
  }

  filter(fn) {
    this.steps.push('filter');
    this.results = this.results.filter(fn);
    return this;
  }

  aggregate(key, reducer) {
    this.steps.push('aggregate');
    const groups = {};
    this.results.forEach(item => {
      const k = item[key];
      if (!groups[k]) groups[k] = [];
      groups[k].push(item);
    });
    this.results = Object.entries(groups).map(([k, items]) => reducer(k, items));
    return this;
  }

  collect() {
    console.log(\`Pipeline "\${this.name}" [Steps: \${this.steps.join(' → ')}]\`);
    console.log(\`  Output: \${this.results.length} records\\n\`);
    return this.results;
  }
}

// Usage
const pipeline = new DataPipeline('Sales Analytics');
const output = pipeline
  .extract([
    { item: 'Laptop', qty: 5, price: 999 },
    { item: 'Mouse', qty: 20, price: 25 },
    { item: 'Keyboard', qty: 12, price: 75 },
    { item: 'Monitor', qty: 3, price: 350 },
    { item: 'Laptop', qty: 8, price: 999 },
  ])
  .transform(r => ({ ...r, revenue: r.qty * r.price }))
  .filter(r => r.revenue > 100)
  .aggregate('item', (key, items) => ({
    item: key,
    totalRevenue: items.reduce((s, i) => s + i.revenue, 0),
    totalQty: items.reduce((s, i) => s + i.qty, 0),
  }))
  .collect();` },
    { label: 'Chart.js Config Generator', icon: '📊', code: `// Chart.js Configuration Generator
function createBarChartConfig(data, options = {}) {
  const colors = ['#10b981', '#14b8a6', '#06b6d4', '#0891b2', '#0e7490'];
  
  return {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: options.datasetLabel || 'Dataset',
        data: data.map(d => d.value),
        backgroundColor: data.map((_, i) => colors[i % colors.length]),
        borderColor: colors.map(c => c),
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: options.title || 'Chart' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  };
}

// Sales dashboard chart configs
const monthlySales = [
  { label: 'Jan', value: 12400 },
  { label: 'Feb', value: 15800 },
  { label: 'Mar', value: 14200 },
  { label: 'Apr', value: 18900 },
  { label: 'May', value: 22100 },
];

const barConfig = createBarChartConfig(monthlySales, {
  title: 'Monthly Sales Revenue',
  datasetLabel: 'Revenue ($)'
});

console.log('=== Bar Chart Config ===');
console.log(JSON.stringify(barConfig, null, 2));
console.log('\\nReady to use with: new Chart(ctx, config)');` },
  ],
  r: [
    { label: 'Data Import & Clean', icon: '📥', code: `# Data Import & Cleaning in R
# Read CSV (simulated)
data <- read.csv("sales_data.csv", stringsAsFactors = FALSE)

# Inspect structure
print("=== Data Structure ===")
str(data)

# Check dimensions
print("")
print(paste("Dimensions:", nrow(data), "rows x", ncol(data), "columns"))

# Clean: Remove duplicates
data <- unique(data)

# Clean: Handle missing values
data$revenue[is.na(data$revenue)] <- mean(data$revenue, na.rm = TRUE)
data$region[is.na(data$region)] <- "Unknown"

# Clean: Trim whitespace from strings
data$customer <- trimws(data$customer)

print("")
print("=== After Cleaning ===")
print(paste("Rows after dedup:", nrow(data)))
print(paste("Missing values:", sum(is.na(data))))` },
    { label: 'Dplyr Operations', icon: '🔧', code: `# Dplyr Data Manipulation
library(dplyr)

# Create sample data
orders <- data.frame(
  id = 1:8,
  customer = c("Alice", "Bob", "Alice", "Charlie", "Bob", "Diana", "Alice", "Eve"),
  product = c("Laptop", "Mouse", "Keyboard", "Laptop", "Monitor", "Mouse", "Laptop", "Keyboard"),
  amount = c(1200, 25, 75, 1200, 350, 25, 1100, 80)
)

# Chained dplyr operations
result <- orders %>%
  group_by(customer) %>%
  summarise(
    total_spent = sum(amount),
    num_orders = n(),
    avg_order = round(mean(amount), 2),
    favorite_product = product[which.max(amount)]
  ) %>%
  arrange(desc(total_spent)) %>%
  mutate(tier = case_when(
    total_spent >= 2000 ~ "VIP",
    total_spent >= 500 ~ "Regular",
    TRUE ~ "New"
  ))

print("=== Customer Analysis ===")
print(result)` },
    { label: 'Linear Regression', icon: '📐', code: `# Linear Regression Analysis
# Using built-in mtcars dataset

data <- mtcars

# Fit linear regression model
model <- lm(mpg ~ wt + hp + cyl, data = data)

# Model summary
print("=== Regression Summary ===")
print(summary(model))

# Key coefficients
print("")
print("=== Coefficients ===")
coefs <- coef(model)
for (name in names(coefs)) {
  cat(sprintf("  %s: %.4f\\n", name, coefs[name]))
}

# Predictions
print("")
print("=== Predictions ===")
predicted <- predict(model, newdata = head(data, 5))
actual <- head(data$mpg, 5)
comparison <- data.frame(Actual = actual, Predicted = round(predicted, 2), Residual = round(actual - predicted, 2))
print(comparison)

# R-squared
print("")
cat(sprintf("R-squared: %.4f\\n", summary(model)$r.squared))` },
  ],
};

// ─── Examples ────────────────────────────────────────────────────────────────

const EXAMPLES: Record<Language, CodeExample[]> = {
  sql: [
    {
      label: 'Basic SELECT',
      code: `SELECT id, name, email
FROM users
WHERE active = true
ORDER BY created_at DESC
LIMIT 10;`,
    },
    {
      label: 'JOIN Query',
      code: `SELECT c.name AS customer, p.title, p.price, o.quantity
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id
WHERE o.order_date >= '2024-01-01'
ORDER BY o.order_date DESC;`,
    },
    {
      label: 'GROUP BY Analytics',
      code: `SELECT department,
  COUNT(*) AS employee_count,
  ROUND(AVG(salary), 2) AS avg_salary,
  MAX(salary) AS max_salary,
  MIN(salary) AS min_salary
FROM employees
GROUP BY department
HAVING COUNT(*) > 5
ORDER BY avg_salary DESC;`,
    },
    {
      label: 'Subquery',
      code: `SELECT name, salary, department
FROM employees
WHERE salary > (
  SELECT AVG(salary)
  FROM employees
)
AND department IN (
  SELECT department
  FROM departments
  WHERE location = 'New York'
)
ORDER BY salary DESC;`,
    },
    {
      label: 'Window Functions',
      code: `SELECT 
  employee_id,
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
  SUM(salary) OVER (PARTITION BY department) AS dept_total,
  salary - AVG(salary) OVER (PARTITION BY department) AS diff_from_avg,
  LAG(salary) OVER (PARTITION BY department ORDER BY hire_date) AS prev_salary
FROM employees
ORDER BY department, dept_rank;`,
    },
    {
      label: 'CTE with Analytics',
      code: `WITH monthly_sales AS (
  SELECT 
    DATE_TRUNC('month', order_date) AS month,
    product_category,
    SUM(quantity) AS units_sold,
    SUM(amount) AS revenue
  FROM orders
  WHERE order_date >= '2024-01-01'
  GROUP BY 1, 2
),
ranked AS (
  SELECT *,
    RANK() OVER (PARTITION BY month ORDER BY revenue DESC) AS category_rank,
    SUM(revenue) OVER (PARTITION BY month) AS month_total
  FROM monthly_sales
)
SELECT 
  month,
  product_category,
  revenue,
  ROUND(100.0 * revenue / month_total, 1) AS pct_of_month,
  category_rank
FROM ranked
WHERE category_rank <= 3
ORDER BY month, category_rank;`,
    },
    {
      label: 'Date Functions',
      code: `SELECT 
  order_id,
  customer_name,
  order_date,
  EXTRACT(YEAR FROM order_date) AS order_year,
  EXTRACT(MONTH FROM order_date) AS order_month,
  EXTRACT(DOW FROM order_date) AS day_of_week,
  AGE(CURRENT_DATE, order_date) AS days_since_order,
  DATE_TRUNC('quarter', order_date) AS quarter,
  order_date + INTERVAL '30 days' AS estimated_delivery
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY order_date DESC;`,
    },
    {
      label: 'Pivot Query',
      code: `SELECT 
  region,
  SUM(CASE WHEN product_category = 'Electronics' THEN revenue ELSE 0 END) AS electronics,
  SUM(CASE WHEN product_category = 'Clothing' THEN revenue ELSE 0 END) AS clothing,
  SUM(CASE WHEN product_category = 'Food' THEN revenue ELSE 0 END) AS food,
  SUM(CASE WHEN product_category = 'Books' THEN revenue ELSE 0 END) AS books,
  SUM(revenue) AS total_revenue
FROM sales
WHERE sale_date >= '2024-01-01'
GROUP BY region
ORDER BY total_revenue DESC;`,
    },
    {
      label: 'NULL Handling',
      code: `SELECT 
  id,
  COALESCE(name, 'N/A') AS name,
  COALESCE(email, 'no-email') AS email,
  COALESCE(phone, '000-000-0000') AS phone,
  COALESCE(salary, 0) AS salary,
  NULLIF(salary, 0) AS salary_or_null,
  CASE 
    WHEN middle_name IS NULL THEN 'No middle name'
    ELSE middle_name
  END AS middle_name_status,
  COUNT(middle_name) AS has_middle_name
FROM users
GROUP BY id, name, email, phone, salary, middle_name
ORDER BY id;`,
    },
    {
      label: 'Aggregate Analytics',
      code: `-- Sales Performance Dashboard
SELECT 
  'Total Revenue' AS metric,
  TO_CHAR(SUM(amount), '$999,999.99') AS value
FROM orders
UNION ALL
SELECT 
  'Avg Order Value',
  TO_CHAR(AVG(amount), '$999,999.99')
FROM orders
UNION ALL
SELECT 
  'Orders Today',
  COUNT(*)::TEXT
FROM orders
WHERE order_date = CURRENT_DATE
UNION ALL
SELECT 
  'YoY Growth',
  TO_CHAR(
    100.0 * (
      SUM(CASE WHEN order_date >= '2024-01-01' THEN amount ELSE 0 END) -
      SUM(CASE WHEN order_date >= '2023-01-01' AND order_date < '2024-01-01' THEN amount ELSE 0 END)
    ) / NULLIF(SUM(CASE WHEN order_date >= '2023-01-01' AND order_date < '2024-01-01' THEN amount ELSE 0 END), 0),
    '999.9%'
  )
FROM orders;`,
    },
  ],
  python: [
    {
      label: 'Data Analysis',
      code: `import pandas as pd
import numpy as np

# Load and analyze data
data = {
    'product': ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B'],
    'sales': [100, 150, 200, 120, 180, 220, 110, 160],
    'region': ['East', 'West', 'East', 'West', 'East', 'West', 'East', 'West']
}

df = pd.DataFrame(data)
print("=== Sales Summary ===")
print(df.groupby('product')['sales'].agg(['mean', 'sum', 'count']))
print(f"\\nTotal sales: {df['sales'].sum()}")
print(f"Average: {df['sales'].mean():.2f}")`,
    },
    {
      label: 'List Comprehension',
      code: `# List comprehension examples
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Basic comprehension
squares = [x ** 2 for x in numbers]
print(f"Squares: {squares}")

# With condition
evens = [x for x in numbers if x % 2 == 0]
print(f"Evens: {evens}")

# Nested comprehension
matrix = [[i * 3 + j for j in range(3)] for i in range(3)]
print(f"Matrix: {matrix}")

# Dict comprehension
word_lengths = {w: len(w) for w in ['hello', 'world', 'python']}
print(f"Word lengths: {word_lengths}")`,
    },
    {
      label: 'Dataframe Operations',
      code: `import pandas as pd

# Create sample dataframe
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],
    'age': [25, 30, 35, 28],
    'score': [85.5, 92.0, 78.5, 95.0],
    'passed': [True, True, False, True]
})

print("=== Original DataFrame ===")
print(df)
print(f"\\nShape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print(f"\\n=== Statistics ===")
print(df.describe())
print(f"\\n=== Filtered (age > 28) ===")
print(df[df['age'] > 28][['name', 'score']])`,
    },
    {
      label: 'API Call Simulation',
      code: `import json

# Simulated API response
api_response = {
    "status": 200,
    "data": {
        "users": [
            {"id": 1, "name": "Alice", "role": "admin"},
            {"id": 2, "name": "Bob", "role": "editor"},
            {"id": 3, "name": "Charlie", "role": "viewer"}
        ],
        "total": 3,
        "page": 1
    }
}

# Parse and display
data = api_response['data']
print(f"Status: {api_response['status']}")
print(f"Total users: {data['total']}")
print("\\n--- Users ---")
for user in data['users']:
    print(f"  [{user['role'].upper()}] {user['name']} (ID: {user['id']})")`,
    },
    {
      label: 'Data Cleaning',
      code: `import pandas as pd
import numpy as np

# Dirty data
df = pd.DataFrame({
    'name': ['Alice', '  bob  ', None, 'Diana', 'EVE'],
    'age': [25, -5, 300, 28, None],
    'email': ['alice@test.com', 'invalid', None, 'diana@test.com', 'eve@test.com'],
    'salary': [50000, 0, None, 45000, 0]
})

print("=== Raw Data ===")
print(df)
print(f"Missing: {df.isnull().sum().sum()}")

# Clean
df['name'] = df['name'].fillna('Unknown').str.strip().str.title()
df['age'] = df['age'].clip(0, 120)
df['email'] = df['email'].fillna('missing@email.com')
df['salary'] = df['salary'].replace(0, np.nan).fillna(df['salary'].median())

print("\\n=== Cleaned ===")
print(df)
print(f"Dtypes:\\n{df.dtypes}")`,
    },
    {
      label: 'Statistical Analysis',
      code: `import numpy as np
from scipy import stats

np.random.seed(42)
group_a = np.random.normal(100, 15, 50)
group_b = np.random.normal(105, 12, 50)

print("=== Group Statistics ===")
print(f"Group A: mean={group_a.mean():.2f}, std={group_a.std():.2f}")
print(f"Group B: mean={group_b.mean():.2f}, std={group_b.std():.2f}")

# T-test
t_stat, p_value = stats.ttest_ind(group_a, group_b)
print(f"\\n=== T-Test ===")
print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.6f}")
print(f"Significant: {'Yes' if p_value < 0.05 else 'No'} (α=0.05)")

# Normality test
stat, p = stats.shapiro(group_a)
print(f"\\nShapiro-Wilk (Group A): p={p:.4f}")`,
    },
    {
      label: 'Data Merge & Join',
      code: `import pandas as pd

# Two datasets
orders = pd.DataFrame({
    'order_id': [1, 2, 3, 4, 5],
    'customer_id': [101, 102, 101, 103, 102],
    'product': ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Webcam'],
    'amount': [1200, 25, 75, 350, 80]
})

customers = pd.DataFrame({
    'customer_id': [101, 102, 103, 104],
    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],
    'city': ['NYC', 'LA', 'Chicago', 'Boston']
})

# Inner join
merged = orders.merge(customers, on='customer_id', how='inner')
print("=== Inner Join ===")
print(merged)

# Aggregate after join
summary = merged.groupby('name')['amount'].agg(['sum', 'count', 'mean']).round(2)
print("\\n=== Customer Summary ===")
print(summary)` },
    {
      label: 'Data Visualization',
      code: `import matplotlib.pyplot as plt
import numpy as np

# Sample data
categories = ['Q1', 'Q2', 'Q3', 'Q4']
revenue = [45000, 52000, 48000, 61000]
costs = [32000, 35000, 33000, 38000]

# Create figure
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Bar chart
axes[0].bar(categories, revenue, color='#10b981', label='Revenue')
axes[0].bar(categories, costs, color='#ef4444', alpha=0.7, label='Costs')
axes[0].set_title('Revenue vs Costs')
axes[0].legend()

# Line chart
axes[1].plot(categories, revenue, 'o-', color='#10b981', linewidth=2, label='Revenue')
axes[1].plot(categories, costs, 's--', color='#ef4444', linewidth=2, label='Costs')
axes[1].fill_between(categories, costs, revenue, alpha=0.1, color='#10b981')
axes[1].set_title('Trend Analysis')
axes[1].legend()

plt.tight_layout()
print("Chart generated: 12x5 figure with 2 subplots")
print("  - Left: Grouped bar chart (Revenue vs Costs)")
print("  - Right: Line chart with area fill")`,
    },
    {
      label: 'Regex Data Cleaning',
      code: `import re
import pandas as pd

# Dirty text data
raw_data = [
    'Name: Student A  |  Age: 28  |  Email: student@datatrack.com',
    'Name: Jane Smith|Age:28|Email:jane@email.com',
    'Name: Bob Johnson | Age: 45 | Phone: 555-1234',
    'Name: Alice | Age: 29 | Email: alice@test.org | Phone: 555-5678',
    'INVALID ENTRY - NO NAME FIELD',
]

print("=== Raw Data ===")
for i, line in enumerate(raw_data):
    print(f"  [{i}] {line}")

# Extract with regex
records = []
pattern = r'Name:\s*([^|]+)\s*\|\s*Age:\s*(\d+)'

for i, line in enumerate(raw_data):
    match = re.search(pattern, line)
    if match:
        records.append({
            'index': i,
            'name': match.group(1).strip(),
            'age': int(match.group(2))
        })

df = pd.DataFrame(records)
print("\\n=== Extracted Records ===")
print(df)` },
    {
      label: 'Pivot Tables',
      code: `import pandas as pd
import numpy as np

# Sales data
data = pd.DataFrame({
    'region': ['East'] * 4 + ['West'] * 4 + ['North'] * 4,
    'product': ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C'],
    'quarter': ['Q1', 'Q1', 'Q1', 'Q2', 'Q2', 'Q2', 'Q1', 'Q1', 'Q1', 'Q2', 'Q2', 'Q2'],
    'revenue': [100, 200, 150, 120, 220, 180, 90, 180, 130, 110, 200, 160]
})

# Pivot table
pivot = pd.pivot_table(
    data,
    values='revenue',
    index='region',
    columns='quarter',
    aggfunc='sum',
    fill_value=0,
    margins=True,
    margins_name='Total'
)

print("=== Pivot Table ===")
print(pivot)

# Cross-tabulation
print("\\n=== Cross Tabulation ===")
cross = pd.crosstab(data['region'], data['product'], values=data['revenue'], aggfunc='mean').round(0)
print(cross)`,
    },
  ],
  javascript: [
    {
      label: 'Array Methods',
      code: `const products = [
  { name: 'Laptop', price: 999, inStock: true },
  { name: 'Phone', price: 699, inStock: false },
  { name: 'Tablet', price: 499, inStock: true },
  { name: 'Watch', price: 299, inStock: true },
  { name: 'Headphones', price: 149, inStock: false },
];

const available = products.filter(p => p.inStock);
console.log('Available:', available.map(p => p.name).join(', '));

const total = available.reduce((sum, p) => sum + p.price, 0);
console.log('Total value: $' + total);

const formatted = products
  .map(p => p.name + ': ' + (p.inStock ? '$' + p.price : 'SOLD OUT'));
formatted.forEach(item => console.log('  ' + item));`,
    },
    {
      label: 'Object Destructuring',
      code: `const user = {
  name: 'Alice Johnson',
  email: 'alice@example.com',
  address: {
    city: 'San Francisco',
    state: 'CA',
    zip: '94102'
  },
  roles: ['admin', 'editor'],
  settings: { theme: 'dark', notifications: true }
};

const { name, email, address: { city, state } } = user;
console.log('User:', name);
console.log('Email:', email);
console.log('Location:', city + ', ' + state);

const { roles, ...userInfo } = user;
console.log('Roles:', roles.join(', '));
console.log('Settings:', JSON.stringify(userInfo.settings));

function greet({ name, address: { city } }) {
  return 'Hello ' + name + ' from ' + city + '!';
}
console.log(greet(user));`,
    },
    {
      label: 'Async/Await',
      code: `function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUser(id) {
  console.log('Fetching user ' + id + '...');
  await delay(500);
  const users = {
    1: { name: 'Alice', posts: 12 },
    2: { name: 'Bob', posts: 8 }
  };
  return users[id] || null;
}

async function main() {
  try {
    console.log('=== Sequential Fetch ===');
    const user1 = await fetchUser(1);
    console.log('User 1:', JSON.stringify(user1));

    const user2 = await fetchUser(2);
    console.log('User 2:', JSON.stringify(user2));

    console.log('\\n=== Parallel Fetch ===');
    const [u1, u2] = await Promise.all([fetchUser(1), fetchUser(2)]);
    console.log('Both:', JSON.stringify([u1, u2]));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();`,
    },
    {
      label: 'JSON Parse',
      code: `const apiResponse = \`{
  "status": "success",
  "timestamp": "2024-03-15T10:30:00Z",
  "results": [
    { "id": 1, "title": "Data Analytics", "score": 95 },
    { "id": 2, "title": "SQL Mastery", "score": 88 },
    { "id": 3, "title": "Python Basics", "score": 92 }
  ],
  "meta": { "total": 3, "page": 1, "per_page": 10 }
}\`;

const data = JSON.parse(apiResponse);
console.log('Status:', data.status);
console.log('Results count:', data.results.length);

const summary = data.results.map(item => ({
  title: item.title,
  grade: item.score >= 90 ? 'A' : item.score >= 80 ? 'B' : 'C'
}));

console.log('\\nGrades:');
summary.forEach(s => console.log('  ' + s.title + ': ' + s.grade));

console.log('\\nMeta:', JSON.stringify(data.meta));`,
    },
    {
      label: 'Data Transformation',
      code: `const rawData = [
  { name: 'Alice', dept: 'engineering', salary: 95000, start: '2020-03' },
  { name: 'Bob', dept: 'marketing', salary: 72000, start: '2019-07' },
  { name: 'Charlie', dept: 'engineering', salary: 105000, start: '2018-01' },
  { name: 'Diana', dept: 'marketing', salary: 68000, start: '2021-11' },
  { name: 'Eve', dept: 'engineering', salary: 88000, start: '2022-05' },
  { name: 'Frank', dept: 'hr', salary: 75000, start: '2020-09' },
];

const enriched = rawData.map(emp => ({
  ...emp,
  tenureYears: new Date().getFullYear() - parseInt(emp.start),
  salaryBand: emp.salary >= 90000 ? 'Senior' : emp.salary >= 75000 ? 'Mid' : 'Junior',
  annualBonus: Math.round(emp.salary * 0.12),
}));

const deptStats = enriched.reduce((acc, emp) => {
  if (!acc[emp.dept]) acc[emp.dept] = { count: 0, totalSalary: 0 };
  acc[emp.dept].count++;
  acc[emp.dept].totalSalary += emp.salary;
  return acc;
}, {});

console.log('=== Department Analysis ===');
Object.entries(deptStats).forEach(([dept, stats]) => {
  const avg = Math.round(stats.totalSalary / stats.count);
  console.log(\`  \${dept}: \${stats.count} employees, avg $ \${avg.toLocaleString()}\`);
});`,
    },
    {
      label: 'API Data Pipeline',
      code: `class DataPipeline {
  constructor(name) { this.name = name; this.steps = []; this.results = []; }

  extract(data) { this.results = [...data]; return this; }

  transform(fn) { this.steps.push('transform'); this.results = this.results.map(fn); return this; }

  filter(fn) { this.steps.push('filter'); this.results = this.results.filter(fn); return this; }

  aggregate(key, reducer) {
    this.steps.push('aggregate');
    const groups = {};
    this.results.forEach(item => {
      const k = item[key];
      if (!groups[k]) groups[k] = [];
      groups[k].push(item);
    });
    this.results = Object.entries(groups).map(([k, items]) => reducer(k, items));
    return this;
  }

  collect() {
    console.log(\`Pipeline "\${this.name}" [\${this.steps.join(' → ')}]\`);
    console.log(\`  Output: \${this.results.length} records\\n\`);
    return this.results;
  }
}

const pipeline = new DataPipeline('Sales Analytics');
pipeline
  .extract([
    { item: 'Laptop', qty: 5, price: 999 },
    { item: 'Mouse', qty: 20, price: 25 },
    { item: 'Keyboard', qty: 12, price: 75 },
    { item: 'Monitor', qty: 3, price: 350 },
    { item: 'Laptop', qty: 8, price: 999 },
  ])
  .transform(r => ({ ...r, revenue: r.qty * r.price }))
  .filter(r => r.revenue > 100)
  .aggregate('item', (key, items) => ({
    item: key,
    totalRevenue: items.reduce((s, i) => s + i.revenue, 0),
    totalQty: items.reduce((s, i) => s + i.qty, 0),
  }))
  .collect();`,
    },
    {
      label: 'Chart.js Config',
      code: `function createBarChartConfig(data, options = {}) {
  const colors = ['#10b981', '#14b8a6', '#06b6d4', '#0891b2', '#0e7490'];
  return {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: options.datasetLabel || 'Dataset',
        data: data.map(d => d.value),
        backgroundColor: data.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: options.title || 'Chart' }
      },
      scales: { y: { beginAtZero: true } }
    }
  };
}

const monthlySales = [
  { label: 'Jan', value: 12400 },
  { label: 'Feb', value: 15800 },
  { label: 'Mar', value: 14200 },
  { label: 'Apr', value: 18900 },
  { label: 'May', value: 22100 },
];

const barConfig = createBarChartConfig(monthlySales, {
  title: 'Monthly Sales Revenue',
  datasetLabel: 'Revenue ($)'
});

console.log('=== Bar Chart Config ===');
console.log(JSON.stringify(barConfig, null, 2));`,
    },
    {
      label: 'Map/Reduce Patterns',
      code: `// Map/Reduce data processing patterns
const transactions = [
  { id: 1, type: 'credit', amount: 100, category: 'salary' },
  { id: 2, type: 'debit', amount: 45, category: 'food' },
  { id: 3, type: 'debit', amount: 120, category: 'rent' },
  { id: 4, type: 'credit', amount: 50, category: 'freelance' },
  { id: 5, type: 'debit', amount: 30, category: 'transport' },
  { id: 6, type: 'debit', amount: 15, category: 'food' },
  { id: 7, type: 'credit', amount: 200, category: 'bonus' },
];

// Pattern 1: Group and sum
const byCategory = transactions.reduce((acc, t) => {
  const key = t.type === 'credit' ? 'income' : t.category;
  if (!acc[key]) acc[key] = 0;
  acc[key] += t.amount * (t.type === 'credit' ? 1 : -1);
  return acc;
}, {});

console.log('=== Net by Category ===');
Object.entries(byCategory).forEach(([k, v]) => console.log(\`  \${k}: $\${v}\`));

// Pattern 2: Running total
const running = transactions.reduce((acc, t) => {
  const balance = acc.length === 0 ? 0 : acc[acc.length - 1].balance;
  const change = t.type === 'credit' ? t.amount : -t.amount;
  acc.push({ ...t, change, balance: balance + change });
  return acc;
}, []);

console.log('\\n=== Running Balance ===');
running.forEach(r => console.log(\`  #\${r.id} \${r.type.padEnd(7)} $\${String(r.change).padStart(4)} → $\${r.balance}\`));`,
    },
    {
      label: 'D3.js Data Binding',
      code: `// D3.js Data Binding Pattern
function generateD3Config(data) {
  const width = 600;
  const height = 400;
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 60) / data.length;

  return {
    svg: {
      width,
      height,
      viewBox: \`0 0 \${width} \${height}\`
    },
    scales: {
      x: { domain: data.map(d => d.label), range: [40, width - 20] },
      y: { domain: [0, maxValue * 1.1], range: [height - 40, 20] }
    },
    bars: data.map((d, i) => ({
      x: 40 + i * barWidth + 4,
      y: height - 40 - (d.value / maxValue) * (height - 60),
      width: barWidth - 8,
      height: (d.value / maxValue) * (height - 60),
      fill: \`hsl(\${160 + i * 15}, 70%, 45%)\`,
      label: d.label,
      value: d.value
    })),
    axes: {
      xLabel: 'Category',
      yLabel: 'Value',
      gridLines: 5
    }
  };
}

const dataset = [
  { label: 'Analytics', value: 85 },
  { label: 'SQL', value: 92 },
  { label: 'Python', value: 78 },
  { label: 'Visualization', value: 88 },
  { label: 'Statistics', value: 71 },
];

const config = generateD3Config(dataset);
console.log('=== D3.js Config ===');
console.log(JSON.stringify(config, null, 2));`,
    },
    {
      label: 'Fetch API Pattern',
      code: `// Data Fetching Pattern with Error Handling
async function fetchDashboardData() {
  const endpoints = [
    { key: 'users', url: '/api/users' },
    { key: 'orders', url: '/api/orders' },
    { key: 'products', url: '/api/products' },
  ];

  // Simulated responses
  const mockData = {
    users: { total: 0, active: 0, newToday: 0 },
    orders: { total: 5634, pending: 45, revenue: 284500 },
    products: { total: 328, inStock: 291, outOfStock: 37 },
  };

  console.log('=== Dashboard Data ===');
  console.log('Fetching from ' + endpoints.length + ' endpoints...');

  // Simulate async
  for (const ep of endpoints) {
    const data = mockData[ep.key];
    console.log(\`  [\${ep.key}] \${JSON.stringify(data)}\`);
  }

  // Derived metrics
  const conversionRate = (45 / 892 * 100).toFixed(1);
  const avgOrderValue = Math.round(284500 / (5634 - 45));
  console.log(\`\\n=== Derived Metrics ===\`);
  console.log(\`  Conversion Rate: \${conversionRate}%\`);
  console.log(\`  Avg Order Value: $\${avgOrderValue}\`);
  console.log(\`  Stock Rate: \${(291/328*100).toFixed(1)}%\`);
}

fetchDashboardData();`,
    },
  ],
  r: [
    {
      label: 'Data Import',
      code: `# Data Import in R
# Read CSV file
data <- read.csv("sales_data.csv", header = TRUE)

# Inspect the data
print("=== Data Overview ===")
head(data, 5)

print("")
print("=== Structure ===")
str(data)

print("")
print("=== Dimensions ===")
print(paste("Rows:", nrow(data), "Cols:", ncol(data)))

print("")
print("=== Column Names ===")
print(colnames(data))`,
    },
    {
      label: 'Summary Statistics',
      code: `# Summary Statistics
data <- data.frame(
  mpg = c(21.0, 21.0, 22.8, 21.4, 18.7, 18.1, 14.3, 24.4, 22.8, 19.2),
  hp = c(110, 110, 93, 110, 175, 105, 245, 62, 95, 123),
  wt = c(2.62, 2.88, 2.32, 3.21, 3.44, 3.46, 3.57, 3.19, 3.15, 3.44),
  cyl = c(6, 6, 4, 6, 8, 6, 8, 4, 4, 6)
)

print("=== Full Summary ===")
summary(data)

print("")
print("=== Mean by Cylinders ===")
print(aggregate(mpg ~ cyl, data = data, FUN = mean))

print("")
print("=== Standard Deviation ===")
print(sapply(data[, c("mpg", "hp", "wt")], sd))`,
    },
    {
      label: 'GGPlot Theme',
      code: `# GGPlot2 Visualization Setup
library(ggplot2)

# Custom theme for DataTrack
theme_datatrack <- theme_minimal() +
  theme(
    plot.title = element_text(size = 16, face = "bold", color = "#1e293b"),
    plot.subtitle = element_text(size = 11, color = "#64748b"),
    axis.title = element_text(size = 12, face = "bold"),
    axis.text = element_text(size = 10),
    panel.grid.minor = element_blank(),
    panel.border = element_rect(color = "#e2e8f0", fill = NA),
    legend.position = "top",
    legend.title = element_blank()
  )

# Sample plot
p <- ggplot(mtcars, aes(x = wt, y = mpg, color = factor(cyl))) +
  geom_point(size = 3, alpha = 0.8) +
  geom_smooth(method = "lm", se = TRUE) +
  labs(
    title = "Weight vs MPG by Cylinders",
    subtitle = "Analysis of 32 automobile models",
    x = "Weight (1000 lbs)",
    y = "Miles per Gallon",
    color = "Cylinders"
  ) +
  scale_color_manual(values = c("#10b981", "#f59e0b", "#ef4444")) +
  theme_datatrack

print(p)
print("Chart saved: wt_vs_mpg.png (800x500)")`,
    },
    {
      label: 'Linear Regression',
      code: `# Linear Regression Analysis
data <- mtcars

# Fit model
model <- lm(mpg ~ wt + hp + cyl, data = data)

print("=== Model Summary ===")
print(summary(model))

# Coefficients
print("")
print("=== Key Coefficients ===")
coefs <- coef(model)
cat(sprintf("  Intercept: %.3f\\n", coefs[1]))
cat(sprintf("  Weight:    %.3f (per 1000 lbs)\\n", coefs[2]))
cat(sprintf("  HP:        %.3f\\n", coefs[3]))

# Predictions
print("")
print("=== Sample Predictions ===")
predicted <- predict(model, newdata = head(mtcars, 5))
comparison <- data.frame(
  Actual = head(mtcars$mpg, 5),
  Predicted = round(predicted, 2)
)
comparison$Error <- round(comparison$Actual - comparison$Predicted, 2)
print(comparison)

cat(sprintf("\\nR-squared: %.4f\\n", summary(model)$r.squared))
cat(sprintf("Adj R-squared: %.4f\\n", summary(model)$adj.r.squared))`,
    },
    {
      label: 'Data Cleaning',
      code: `# Data Cleaning in R
# Create dirty data
df <- data.frame(
  name = c("Alice", "  bob  ", NA, "Diana", NA),
  age = c(25, -5, 300, 28, NA),
  salary = c(50000, 0, NA, 45000, 0)
)

print("=== Raw Data ===")
print(df)
print(paste("NAs:", sum(is.na(df))))

# Clean names
df$name <- trimws(df$name)
df$name[is.na(df$name)] <- "Unknown"

# Fix ages
df$age[df$age < 0] <- NA
df$age[df$age > 120] <- NA
df$age[is.na(df$age)] <- round(mean(df$age, na.rm = TRUE))

# Fix salary
df$salary[df$salary == 0] <- NA
df$salary[is.na(df$salary)] <- median(df$salary, na.rm = TRUE)

print("")
print("=== Cleaned Data ===")
print(df)
print(paste("NAs remaining:", sum(is.na(df))))`,
    },
    {
      label: 'Dplyr Operations',
      code: `# Dplyr Data Manipulation
library(dplyr)

orders <- data.frame(
  id = 1:8,
  customer = c("Alice", "Bob", "Alice", "Charlie", "Bob", "Diana", "Alice", "Eve"),
  product = c("Laptop", "Mouse", "Keyboard", "Laptop", "Monitor", "Mouse", "Laptop", "Keyboard"),
  amount = c(1200, 25, 75, 1200, 350, 25, 1100, 80)
)

result <- orders %>%
  group_by(customer) %>%
  summarise(
    total_spent = sum(amount),
    num_orders = n(),
    avg_order = round(mean(amount), 2),
    favorite = product[which.max(amount)]
  ) %>%
  arrange(desc(total_spent)) %>%
  mutate(
    tier = case_when(
      total_spent >= 2000 ~ "VIP",
      total_spent >= 500 ~ "Regular",
      TRUE ~ "New"
    )
  )

print("=== Customer Segmentation ===")
print(result)`,
    },
    {
      label: 'Data Visualization',
      code: `# Data Visualization in R
library(ggplot2)

# Monthly sales data
sales <- data.frame(
  month = factor(c("Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"),
                  levels = c("Jan", "Feb", "Mar", "Apr", "May", "Jun",
                             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")),
  revenue = c(45, 52, 48, 61, 55, 72, 68, 75, 82, 79, 88, 95),
  costs = c(32, 35, 33, 38, 36, 42, 40, 44, 48, 45, 50, 52)
)

# Profit calculation
sales$profit <- sales$revenue - sales$costs

# Plot
p <- ggplot(sales, aes(x = month, group = 1)) +
  geom_line(aes(y = revenue, color = "Revenue"), size = 1.2) +
  geom_line(aes(y = costs, color = "Costs"), size = 1.2) +
  geom_ribbon(aes(ymin = costs, ymax = revenue), alpha = 0.15, fill = "#10b981") +
  scale_color_manual(values = c("Revenue" = "#10b981", "Costs" = "#ef4444")) +
  labs(title = "Monthly Revenue vs Costs", y = "Amount ($K)") +
  theme_minimal()

print(p)
print("Saved: monthly_comparison.png")`,
    },
    {
      label: 'Hypothesis Testing',
      code: `# Hypothesis Testing in R
set.seed(42)
group_a <- rnorm(50, mean = 100, sd = 15)
group_b <- rnorm(50, mean = 108, sd = 12)

print("=== Group Statistics ===")
cat(sprintf("Group A: mean=%.2f, sd=%.2f\\n", mean(group_a), sd(group_a)))
cat(sprintf("Group B: mean=%.2f, sd=%.2f\\n", mean(group_b), sd(group_b)))

# T-test
t_result <- t.test(group_a, group_b)
print("")
print("=== Independent T-Test ===")
print(t_result)

# Mann-Whitney U test (non-parametric)
wilcox_result <- wilcox.test(group_a, group_b)
print("")
print("=== Mann-Whitney U Test ===")
print(wilcox_result)

# Effect size
pooled_sd <- sqrt((sd(group_a)^2 + sd(group_b)^2) / 2)
cohens_d <- (mean(group_b) - mean(group_a)) / pooled_sd
print("")
cat(sprintf("Cohen's d: %.3f\\n", cohens_d))
cat(sprintf("Effect size: %s\\n",
  ifelse(abs(cohens_d) >= 0.8, "Large",
    ifelse(abs(cohens_d) >= 0.5, "Medium", "Small"))))`,
    },
    {
      label: 'Time Series',
      code: `# Time Series Analysis
set.seed(42)
months <- 36
dates <- seq(as.Date("2022-01-01"), by = "month", length.out = months)

# Generate time series data
trend <- seq(100, 200, length.out = months)
seasonal <- 20 * sin(2 * pi * (1:months) / 12)
noise <- rnorm(months, 0, 10)
sales_ts <- ts(trend + seasonal + noise, frequency = 12, start = c(2022, 1))

# Decompose
print("=== Time Series Decomposition ===")
decomp <- decompose(sales_ts)
print(decomp)

# Moving average
ma3 <- stats::filter(sales_ts, rep(1/3, 3), sides = 2)
print("")
print("=== 3-Month Moving Average (last 6) ===")
print(round(tail(ma3, 6), 1))

# Summary
print("")
print("=== Summary Statistics ===")
print(summary(sales_ts))

cat(sprintf("\\nTrend: %.1f units/month\\n", (trend[length(trend)] - trend[1]) / months))`,
    },
    {
      label: 'Correlation & PCA',
      code: `# Correlation & PCA Analysis
set.seed(42)

# Multi-dimensional dataset
data <- data.frame(
  revenue = rnorm(100, 50000, 10000),
  customers = rnorm(100, 500, 100),
  satisfaction = runif(100, 3, 5),
  support_tickets = rnorm(100, 50, 15),
  nps_score = rnorm(100, 42, 12)
)

# Correlation matrix
print("=== Correlation Matrix ===")
cor_matrix <- cor(data)
print(round(cor_matrix, 3))

# PCA
print("")
print("=== Principal Component Analysis ===")
pca <- prcomp(data, scale. = TRUE)
print(summary(pca))

# Variance explained
print("")
print("=== Variance Explained ===")
var_explained <- pca$sdev^2 / sum(pca$sdev^2)
for (i in seq_along(var_explained)) {
  cat(sprintf("  PC%d: %.1f%%\\n", i, var_explained[i] * 100))
}

cat(sprintf("\\nFirst 2 PCs explain: %.1f%%\\n",
  sum(var_explained[1:2]) * 100))`,
    },
  ],
};

// ─── SQL Simulator (Enhanced) ────────────────────────────────────────────────

function simulateSQL(code: string): string[] {
  const lines: string[] = [];
  const upper = code.toUpperCase().trim();

  lines.push('── SQL Execution ──────────────────────────────');
  lines.push(`▸ ${code.split('\n')[0].trim()}`);
  lines.push('');

  if (upper.includes('SELECT') || upper.includes('WITH')) {
    const hasJoin = upper.includes('JOIN');
    const hasGroupBy = upper.includes('GROUP BY');
    const hasWindow = upper.includes('OVER (') || upper.includes('WINDOW');
    const hasCTE = upper.includes('WITH');
    const hasPivot = upper.includes('CASE WHEN') && hasGroupBy;
    const hasUnion = upper.includes('UNION ALL');
    const hasNull = upper.includes('COALESCE') || upper.includes('NULLIF');
    const limitMatch = upper.match(/LIMIT\s+(\d+)/i);
    const hasHaving = upper.includes('HAVING');
    const limit = limitMatch ? parseInt(limitMatch[1]) : 5;

    if (hasCTE && !hasPivot) {
      lines.push('┌──────────┬──────────────────┬────────┬───────────┬────────────┐');
      lines.push('│ month    │ product_category │ revenue │ pct_month │ cat_rank   │');
      lines.push('├──────────┼──────────────────┼────────┼───────────┼────────────┤');
      lines.push('│ 2024-01  │ Electronics      │ 45000  │     42.5  │         1  │');
      lines.push('│ 2024-01  │ Clothing         │ 28000  │     26.4  │         2  │');
      lines.push('│ 2024-01  │ Food             │ 18000  │     17.0  │         3  │');
      lines.push('│ 2024-02  │ Electronics      │ 52000  │     45.6  │         1  │');
      lines.push('│ 2024-02  │ Clothing         │ 31000  │     27.2  │         2  │');
      lines.push('└──────────┴──────────────────┴────────┴───────────┴────────────┘');
      lines.push('');
      lines.push(`(${6} rows returned in 0.047s)`);
    } else if (hasWindow) {
      lines.push('┌────────────┬──────────┬────────────┬───────┬───────────┬────────────┐');
      lines.push('│ name       │ dept     │ salary     │ rank  │ dept_total │ diff_avg   │');
      lines.push('├────────────┼──────────┼────────────┼───────┼───────────┼────────────┤');
      lines.push('│ Charlie    │ Eng      │ 105000.00  │    1  │  288000   │  +9000.00  │');
      lines.push('│ Alice      │ Eng      │  95000.00  │    2  │  288000   │  -11000.00 │');
      lines.push('│ Eve        │ Eng      │  88000.00  │    3  │  288000   │  -18000.00 │');
      lines.push('│ Bob        │ Mktg     │  72000.00  │    1  │  140000   │   +2000.00 │');
      lines.push('│ Diana      │ Mktg     │  68000.00  │    2  │  140000   │  - 2000.00 │');
      lines.push('│ Frank      │ HR       │  75000.00  │    1  │   75000   │      0.00  │');
      lines.push('└────────────┴──────────┴────────────┴───────┴───────────┴────────────┘');
      lines.push('');
      lines.push(`(${6} rows returned in 0.062s)`);
    } else if (hasUnion) {
      lines.push('┌───────────────────┬─────────────────┐');
      lines.push('│ metric            │ value           │');
      lines.push('├───────────────────┼─────────────────┤');
      lines.push('│ Total Revenue     │ $  1,247,500.00 │');
      lines.push('│ Avg Order Value   │ $      156.25   │');
      lines.push('│ Orders Today      │            23   │');
      lines.push('│ YoY Growth        │       18.4%     │');
      lines.push('└───────────────────┴─────────────────┘');
      lines.push('');
      lines.push(`(${4} rows returned in 0.023s)`);
    } else if (hasPivot) {
      lines.push('┌────────┬─────────────┬──────────┬────────┬────────┬──────────────┐');
      lines.push('│ region │ electronics │ clothing │ food   │ books  │ total_revenue│');
      lines.push('├────────┼─────────────┼──────────┼────────┼────────┼──────────────┤');
      lines.push('│ East   │    145000   │   89000  │  67000 │  34000 │     335000   │');
      lines.push('│ West   │    128000   │   72000  │  54000 │  28000 │     282000   │');
      lines.push('│ North  │     95000   │   61000  │  43000 │  22000 │     221000   │');
      lines.push('│ South  │     82000   │   48000  │  38000 │  19000 │     187000   │');
      lines.push('└────────┴─────────────┴──────────┴────────┴────────┴──────────────┘');
      lines.push('');
      lines.push(`(${4} rows returned in 0.051s)`);
    } else if (hasNull) {
      lines.push('┌────┬───────────┬────────────────────┬────────────────┬────────┬───────────────────┐');
      lines.push('│ id │ name      │ email              │ phone          │ salary │ middle_name_status │');
      lines.push('├────┼───────────┼────────────────────┼────────────────┼────────┼───────────────────┤');
      lines.push('│  1 │ John      │ john@email.com     │ 555-0101       │  75000 │ Has middle name    │');
      lines.push('│  2 │ Jane      │ jane@email.com     │ 555-0202       │  82000 │ No middle name     │');
      lines.push('│  3 │ Bob       │ N/A                │ N/A            │      0 │ Has middle name    │');
      lines.push('│  4 │ Alice     │ alice@test.org     │ 555-0404       │  95000 │ No middle name     │');
      lines.push('└────┴───────────┴────────────────────┴────────────────┴────────┴───────────────────┘');
      lines.push('');
      lines.push(`(${4} rows returned in 0.033s)`);
    } else if (hasGroupBy) {
      lines.push('┌─────────────┬─────────┬───────────┬───────────┐');
      lines.push('│ department  │ count   │ avg_sal   │ max_sal   │');
      lines.push('├─────────────┼─────────┼───────────┼───────────┤');
      lines.push('│ Engineering │      24 │  95000.00 │ 145000.00 │');
      lines.push('│ Marketing   │      18 │  72000.00 │  98000.00 │');
      lines.push('│ Sales       │      15 │  65000.00 │  89000.00 │');
      lines.push('│ HR          │       8 │  68000.00 │  82000.00 │');
      lines.push('│ Finance     │       6 │  78000.00 │  92000.00 │');
      lines.push('└─────────────┴─────────┴───────────┴───────────┘');
      lines.push('');
      lines.push(`(${hasHaving ? 5 : 5} rows returned in 0.038s)`);
    } else if (hasJoin) {
      lines.push('┌────┬────────────┬──────────────┬────────┬──────────┐');
      lines.push('│ ID │ customer   │ title        │ price  │ quantity │');
      lines.push('├────┼────────────┼──────────────┼────────┼──────────┤');
      lines.push('│  1 │ Alice      │ Laptop       │ 999.00 │        2 │');
      lines.push('│  2 │ Bob        │ Mouse        │  25.00 │        5 │');
      lines.push('│  3 │ Charlie    │ Keyboard     │  75.00 │        3 │');
      lines.push('│  4 │ Diana      │ Monitor      │ 350.00 │        1 │');
      lines.push('│  5 │ Alice      │ Laptop       │ 999.00 │        1 │');
      lines.push('└────┴────────────┴──────────────┴────────┴──────────┘');
      lines.push('');
      lines.push(`(${5} rows returned in 0.041s)`);
    } else {
      const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
      const emails = ['alice@ex.com', 'bob@ex.com', 'charlie@ex.com', 'diana@ex.com', 'eve@ex.com', 'frank@ex.com'];
      const count = Math.min(limit, names.length);
      lines.push('┌────┬──────────────┬──────────────────────┬─────────┐');
      lines.push('│ ID │ name         │ email                │ active  │');
      lines.push('├────┼──────────────┼──────────────────────┼─────────┤');
      for (let i = 0; i < count; i++) {
        const id = String(i + 1).padStart(2);
        lines.push(`│ ${id} │ ${names[i].padEnd(12)} │ ${emails[i].padEnd(20)} │ true    │`);
      }
      lines.push('└────┴──────────────┴──────────────────────┴─────────┘');
      lines.push('');
      lines.push(`(${count} rows returned in 0.018s)`);
    }
  } else if (upper.includes('INSERT') || upper.includes('UPDATE') || upper.includes('DELETE')) {
    const affected = Math.floor(Math.random() * 20) + 1;
    lines.push(`✓ Query executed successfully.`);
    lines.push(`  ${affected} rows affected (${(Math.random() * 0.05 + 0.005).toFixed(3)}s)`);
  } else {
    lines.push('✓ Statement executed successfully.');
    lines.push('  0 rows affected (0.005s)');
  }

  return lines;
}

// ─── Python Simulator (Enhanced) ────────────────────────────────────────────

function simulatePython(code: string): string[] {
  const lines: string[] = [];
  lines.push('── Python Execution (Simulated) ────────────────');
  lines.push('');

  const codeLines = code.split('\n');
  for (const line of codeLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      if (trimmed.startsWith('#')) {
        lines.push(`  # ${trimmed.slice(1).trim()}`);
      }
      continue;
    }

    if (trimmed.startsWith('import ')) {
      const mod = trimmed.replace('import ', '').split(' as ')[0].split(',')[0].trim();
      lines.push(`  ✓ Module '${mod}' loaded`);
    } else if (trimmed.startsWith('from ')) {
      const mod = trimmed.match(/from\s+(\w+)/)?.[1] || '';
      const fn = trimmed.match(/import\s+(\w+)/)?.[1] || '';
      lines.push(`  ✓ Imported ${fn} from '${mod}'`);
    } else if (trimmed.startsWith('print(')) {
      const match = trimmed.match(/print\((.*)\)/s);
      if (match) {
        let content = match[1]
          .replace(/f"/g, '"')
          .replace(/f'/g, "'")
          .replace(/\\n/g, '\n');
        const cleanContent = content.replace(/^['"f\s]+/, '').replace(/['"]+$/, '').trim();
        if (cleanContent.includes('===')) {
          lines.push('');
          lines.push('  ' + '═'.repeat(40));
          lines.push('  ' + cleanContent.replace(/===/g, '').trim());
          lines.push('  ' + '═'.repeat(40));
        } else if (cleanContent.includes('---')) {
          lines.push('  ' + cleanContent.replace(/-/g, ' ').trim());
          lines.push('  ' + '─'.repeat(30));
        } else {
          lines.push('  ' + cleanContent || '(empty print)');
        }
      }
    } else if (trimmed.includes('pd.DataFrame')) {
      lines.push('      name      age  score  passed');
      lines.push('  0  Alice      25   85.5     True');
      lines.push('  1  Bob        30   92.0     True');
      lines.push('  2  Charlie    35   78.5    False');
      lines.push('  3  Diana      28   95.0     True');
    } else if (trimmed.includes('.describe()')) {
      lines.push('             age       score');
      lines.push('  count   4.000000    4.000000');
      lines.push('  mean   29.500000   87.750000');
      lines.push('  std     4.358899    7.275795');
      lines.push('  min    25.000000   78.500000');
      lines.push('  25%    27.000000   82.500000');
      lines.push('  50%    29.000000   88.750000');
      lines.push('  75%    31.750000   92.250000');
      lines.push('  max    35.000000   95.000000');
    } else if (trimmed.includes('.head(')) {
      lines.push('     product  sales region');
      lines.push('  0       A    100   East');
      lines.push('  1       B    150   West');
      lines.push('  2       C    200   East');
    } else if (trimmed.includes('.groupby')) {
      lines.push('           mean    sum  count');
      lines.push('  product');
      lines.push('  A       110.0    330      3');
      lines.push('  B       163.3    490      3');
      lines.push('  C       210.0    420      2');
    } else if (trimmed.includes('.shape')) {
      lines.push('  (8, 4)');
    } else if (trimmed.includes('.columns')) {
      lines.push("  ['product', 'sales', 'region', 'date']");
    } else if (trimmed.includes('ttest_ind') || trimmed.includes('t_test')) {
      lines.push('  t-statistic: -2.1345');
      lines.push('  p-value: 0.034851');
      lines.push('  Significant: Yes (α=0.05)');
    } else if (trimmed.includes('shapiro')) {
      lines.push('  Shapiro-Wilk (Group A): p=0.4521');
    } else if (trimmed.includes('.merge(') || trimmed.includes('.join(')) {
      lines.push('     order_id  customer_id   product  amount     name     city');
      lines.push('  0         1          101    Laptop    1200    Alice     NYC');
      lines.push('  1         2          102     Mouse      25      Bob      LA');
      lines.push('  2         3          101  Keyboard      75    Alice     NYC');
      lines.push('  3         4          103   Monitor     350  Charlie  Chicago');
      lines.push('  4         5          102    Webcam      80      Bob      LA');
    } else if (trimmed.includes('read_csv')) {
      lines.push('  [DataFrame loaded: 150 rows × 6 columns]');
    } else if (trimmed.includes('isnull')) {
      lines.push('  name       1');
      lines.push('  age        2');
      lines.push('  email      1');
      lines.push('  salary     2');
      lines.push('  dtype: int64');
    } else if (trimmed.includes('pivot_table') || trimmed.includes('crosstab')) {
      lines.push('  product    A      B      C    Total');
      lines.push('  region');
      lines.push('  East     330    490    420     1240');
      lines.push('  West     110    160    200      470');
      lines.push('  Total    440    650    620     1710');
    } else if (trimmed.includes('plt.tight_layout') || trimmed.includes('plt.show') || trimmed.includes('fig,')) {
      lines.push('  ✓ Chart rendered: figure with 2 subplots (12x5)');
    } else if (trimmed.includes('re.search') || trimmed.includes('re.find')) {
      lines.push('     index        name  age');
      lines.push('  0      0  Student A    28');
      lines.push('  1      1  Jane Smith  28');
      lines.push('  2      3  Alice       29');
    } else if (trimmed.includes('.fillna') || trimmed.includes('.replace') || trimmed.includes('.clip') || trimmed.includes('.str.')) {
      lines.push('  ✓ Cleaning applied successfully');
    } else {
      lines.push(`  → ${trimmed}`);
    }
  }

  lines.push('');
  lines.push(`  [Process completed in ${(Math.random() * 0.2 + 0.05).toFixed(3)}s]`);

  return lines;
}

// ─── R Simulator ─────────────────────────────────────────────────────────────

function simulateR(code: string): string[] {
  const lines: string[] = [];
  lines.push('── R Execution (Simulated) ───────────────────');
  lines.push('');

  const codeLines = code.split('\n');
  for (const line of codeLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      if (trimmed.startsWith('#')) {
        lines.push(`  # ${trimmed.slice(1).trim()}`);
      }
      continue;
    }

    if (trimmed.startsWith('library(')) {
      const mod = trimmed.match(/library\((\w+)\)/)?.[1] || '';
      lines.push(`  ✓ Package '${mod}' loaded`);
    } else if (trimmed.startsWith('data <- read.csv') || trimmed.startsWith('data <- data.frame')) {
      lines.push('  ✓ Data loaded');
    } else if (trimmed.includes('head(')) {
      const isMtcars = code.includes('mtcars');
      if (isMtcars) {
        lines.push('                    mpg cyl disp  hp drat    wt');
        lines.push('  Mazda RX4       21.0   6  160 110 3.90 2.620');
        lines.push('  Mazda RX4 Wag   21.0   6  160 110 3.90 2.875');
        lines.push('  Datsun 710      22.8   4  108  93 3.85 2.320');
        lines.push('  Hornet 4 Drive  21.4   6  258 110 3.08 3.215');
        lines.push('  Hornet Sportab  18.7   8  360 175 3.15 3.440');
      } else {
        lines.push('    id customer   product amount');
        lines.push('  1  1    Alice    Laptop   1200');
        lines.push('  2  2      Bob     Mouse     25');
        lines.push('  3  3    Alice Keyboard     75');
        lines.push('  4  4  Charlie   Laptop   1200');
        lines.push('  5  5      Bob  Monitor    350');
      }
    } else if (trimmed.includes('str(')) {
      lines.push("  'data.frame':  32 obs. of  11 variables:");
      lines.push('   $ mpg : num  21 21 22.8 21.4 18.7 ...');
      lines.push('   $ cyl : num  6 6 4 6 8 6 8 4 4 6');
      lines.push('   $ disp: num  160 160 108 258 360 ...');
      lines.push('   $ hp  : num  110 110 93 110 175 ...');
      lines.push('   $ wt  : num  2.62 2.88 2.32 3.21 3.44 ...');
    } else if (trimmed.includes('nrow(') || trimmed.includes('ncol(') || trimmed.includes('Dimensions')) {
      lines.push('  [1] "Dimensions: 32 rows x 11 columns"');
    } else if (trimmed.includes('colnames(')) {
      lines.push("  [1] \"mpg\"  \"cyl\"  \"disp\" \"hp\" \"drat\" \"wt\" \"qsec\" \"vs\" \"am\" \"gear\" \"carb\"");
    } else if (trimmed.includes('summary(')) {
      lines.push('       mpg             hp             wt            cyl');
      lines.push('  Min.   :10.40   Min.   : 52.0   Min.   :1.513   Min.   :4.000');
      lines.push('  1st Qu.:15.43   1st Qu.: 96.5   1st Qu.:2.581   1st Qu.:4.000');
      lines.push('  Median :19.20   Median :123.0   Median :3.325   Median :6.000');
      lines.push('  Mean   :20.09   Mean   :146.7   Mean   :3.217   Mean   :6.188');
      lines.push('  3rd Qu.:22.80   3rd Qu.:180.0   3rd Qu.:3.610   3rd Qu.:8.000');
      lines.push('  Max.   :33.90   Max.   :335.0   Max.   :5.424   Max.   :8.000');
    } else if (trimmed.includes('aggregate(')) {
      lines.push('    cyl     mpg');
      lines.push('  1    4 26.66364');
      lines.push('  2    6 19.74286');
      lines.push('  3    8 15.10000');
    } else if (trimmed.includes('sapply') && trimmed.includes('sd')) {
      lines.push('       mpg        hp        wt');
      lines.push('  6.026948 68.562868 0.9784574');
    } else if (trimmed.includes('lm(')) {
      lines.push('  ✓ Linear model fitted');
      lines.push('');
      lines.push('  Coefficients:');
      lines.push('               Estimate Std. Error t value Pr(>|t|)');
      lines.push('  (Intercept)  34.96055    2.16454  16.151  < 2e-16');
      lines.push('  wt           -3.35082    1.16413  -2.878  0.00743');
      lines.push('  hp           -0.03473    0.00999  -3.477  0.00155');
      lines.push('  cyl          -1.43483    0.49674  -2.889  0.00724');
    } else if (trimmed.includes('coef(')) {
      lines.push('  (Intercept)           wt           hp          cyl');
      lines.push('   34.960554   -3.350825   -0.034734   -1.434835');
    } else if (trimmed.includes('summary(model)') || trimmed.includes('summary(lm') || (trimmed.includes('print(') && code.includes('lm('))) {
      if (trimmed.includes('summary(') && code.includes('lm(')) {
        lines.push('');
        lines.push('  Call: lm(formula = mpg ~ wt + hp + cyl, data = data)');
        lines.push('');
        lines.push('  Residuals:');
        lines.push('      Min       1Q   Median       3Q      Max');
        lines.push('  -3.9689  -1.4770  -0.3057   1.4398   5.0734');
        lines.push('');
        lines.push('  Coefficients:');
        lines.push('               Estimate Std. Error t value Pr(>|t|)');
        lines.push('  (Intercept)  34.96055    2.16454  16.151  < 2e-16 ***');
        lines.push('  wt           -3.35082    1.16413  -2.878  0.00743 **');
        lines.push('  hp           -0.03473    0.00999  -3.477  0.00155 **');
        lines.push('  cyl          -1.43483    0.49674  -2.889  0.00724 **');
        lines.push('  ---');
        lines.push('  Signif. codes:  0 \'***\' 0.001 \'**\' 0.01 \'*\' 0.05 \'.\' 0.1 \' \' 1');
        lines.push('');
        lines.push('  Multiple R-squared:  0.7828,  Adjusted R-squared:  0.7605');
      }
    } else if (trimmed.includes('predict(')) {
      lines.push('  Actual Predicted Residual');
      lines.push('1   21.0     22.12     -1.12');
      lines.push('2   21.0     21.47     -0.47');
      lines.push('3   22.8     25.15     -2.35');
      lines.push('4   21.4     20.78      0.62');
      lines.push('5   18.7     17.85      0.85');
    } else if (trimmed.includes('r.squared') || trimmed.includes('R-squared')) {
      lines.push('  R-squared: 0.7828');
      lines.push('  Adj R-squared: 0.7605');
    } else if (trimmed.includes('sprintf') && trimmed.includes('d')) {
      const coefMatch = trimmed.match(/coefs\["(.+?)"\]/);
      if (coefMatch) {
        lines.push(`  ${coefMatch[1]}: ${(Math.random() * 10 - 5).toFixed(4)}`);
      }
    } else if (trimmed.includes('cat(sprintf') && trimmed.includes('R-squared')) {
      lines.push('  R-squared: 0.7828');
    } else if (trimmed.includes('cat(sprintf') && trimmed.includes('Cohen')) {
      lines.push("  Cohen's d: 0.543");
      lines.push('  Effect size: Medium');
    } else if (trimmed.includes('t.test(')) {
      lines.push('');
      lines.push('  Welch Two Sample t-test');
      lines.push('');
      lines.push('  data:  group_a and group_b');
      lines.push('  t = -2.1345, df = 94.521, p-value = 0.03548');
      lines.push('  alternative hypothesis: true difference in means is not equal to 0');
      lines.push('  95 percent confidence interval:');
      lines.push('   -12.456 -0.544');
      lines.push('  sample estimates:');
      lines.push('  mean of x  mean of y');
      lines.push('    99.82     106.32');
    } else if (trimmed.includes('wilcox.test(')) {
      lines.push('');
      lines.push('  Wilcoxon rank sum test with continuity correction');
      lines.push('');
      lines.push('  data:  group_a and group_b');
      lines.push('  W = 923, p-value = 0.04123');
    } else if (trimmed.includes('decompose(')) {
      lines.push('  $time');
      lines.push('  [1] "Jan 2022" "Feb 2022" ...');
      lines.push('  $type');
      lines.push('  [1] "additive"');
      lines.push('  $seasonal');
      lines.push('       Jan    Feb    Mar    Apr    May    Jun');
      lines.push('   -12.4  -5.8   8.3   18.6   15.2   3.1');
      lines.push('  $trend');
      lines.push('       Jan    Feb    Mar    Apr    May    Jun');
      lines.push('   100.2  102.8  105.4  108.1  110.7  113.3');
    } else if (trimmed.includes('cor(')) {
      lines.push('              revenue customers satisfaction support_tickets');
      lines.push('  revenue        1.000     0.452        0.387          0.215');
      lines.push('  customers      0.452     1.000        0.623          0.478');
      lines.push('  satisfaction   0.387     0.623        1.000          0.512');
      lines.push('  support_tickets 0.215   0.478        0.512          1.000');
      lines.push('  nps_score      0.391     0.534        0.891          0.498');
    } else if (trimmed.includes('prcomp(')) {
      lines.push('  Importance of components:');
      lines.push('                           PC1    PC2    PC3    PC4    PC5');
      lines.push('  Standard deviation     1.421  0.987  0.834  0.712  0.543');
      lines.push('  Proportion of Variance 0.404  0.195  0.139  0.101  0.059');
      lines.push('  Cumulative Proportion  0.404  0.599  0.738  0.839  0.898');
    } else if (trimmed.includes('ggplot') || trimmed.includes('geom_') || trimmed.includes('labs(') || trimmed.includes('scale_color') || trimmed.includes('theme_')) {
      // Silent for ggplot layer commands
    } else if (trimmed.includes('print(p)') || trimmed.includes('print(') && code.includes('ggplot')) {
      lines.push('  ✓ Chart rendered: 800x500 px');
      lines.push('  Saved: plot_output.png');
    } else if (trimmed.includes('trimws') || trimmed.includes('is.na') || trimmed.includes('round(') || trimmed.includes('median(') || trimmed.includes('mean(')) {
      lines.push('  ✓ Transformation applied');
    } else if (trimmed.includes('%>%') || trimmed.includes('group_by') || trimmed.includes('summarise') || trimmed.includes('arrange') || trimmed.includes('mutate(') || trimmed.includes('case_when')) {
      // Dplyr chain — handled at print
    } else if (trimmed.includes('print(')) {
      const printMatch = trimmed.match(/print\((.+)\)/);
      if (printMatch) {
        const varName = printMatch[1].trim();
        if (varName.includes('result') || code.includes('dplyr')) {
          lines.push('     customer total_spent num_orders avg_order favorite  tier');
          lines.push('  1    Alice        2375          3    791.67   Laptop     VIP');
          lines.push('  2    Charlie      1200          1   1200.00   Laptop  Regular');
          lines.push('  3      Bob         400          2    200.00   Monitor    New');
          lines.push('  4    Diana         500          1    500.00   Laptop  Regular');
          lines.push('  5      Eve         375          1    375.00 Keyboard    New');
        } else if (varName.includes('comparison') || varName.includes('predicted')) {
          lines.push('  Actual Predicted Error');
          lines.push('1   21.0     22.12 -1.12');
          lines.push('2   21.0     21.47 -0.47');
          lines.push('3   22.8     25.15 -2.35');
          lines.push('4   21.4     20.78  0.62');
          lines.push('5   18.7     17.85  0.85');
        } else {
          lines.push(`  ${varName}`);
        }
      }
    } else if (trimmed.includes('set.seed(')) {
      lines.push('  ✓ Random seed set');
    } else if (trimmed.includes('rnorm(') || trimmed.includes('runif(') || trimmed.includes('c(')) {
      lines.push(`  → ${trimmed}`);
    } else if (trimmed.includes('cat(')) {
      const catContent = trimmed.match(/cat\(sprintf\("(.+?)"/);
      if (catContent) {
        const fmt = catContent[1];
        if (fmt.includes('d') && fmt.includes('s')) {
          lines.push('  Group A: mean=100.12, sd=14.89');
          lines.push('  Group B: mean=106.32, sd=12.15');
        } else if (fmt.includes('f')) {
          lines.push("  Cohen's d: 0.543");
          lines.push('  Effect size: Medium');
        } else if (fmt.includes('R-squared')) {
          lines.push('  R-squared: 0.7828');
        }
      } else {
        const simpleCat = trimmed.match(/cat\("(.+?)"\)/);
        if (simpleCat) {
          lines.push(`  ${simpleCat[1]}\\n`);
        }
      }
    } else if (trimmed.includes('pooled_sd')) {
      lines.push('  → Calculating pooled standard deviation');
    } else if (trimmed.includes('var_explained')) {
      lines.push('  PC1: 40.4%');
      lines.push('  PC2: 19.5%');
      lines.push('  PC3: 13.9%');
      lines.push('  PC4: 10.1%');
      lines.push('  PC5:  5.9%');
      lines.push('');
      lines.push('  First 2 PCs explain: 59.9%');
    } else if (trimmed.includes('ma3') || trimmed.includes('filter(') && code.includes('ts(')) {
      lines.push('      Jan    Feb    Mar    Apr    May    Jun');
      lines.push('  [31] 95.2  98.7  104.3 109.8 112.5 115.1');
    } else if (trimmed.includes('trend:')) {
      lines.push('  Trend: 2.8 units/month');
    } else if (trimmed.includes('unique(')) {
      lines.push('  Rows after dedup: 142');
    } else if (trimmed.includes('print(paste(')) {
      lines.push('  [1] "Rows: 150 Cols: 8"');
    } else if (trimmed.includes('is.na(df)')) {
      lines.push('  [1] 3');
    } else if (trimmed.includes('sum(is.na(')) {
      lines.push('  [1] 3');
    } else {
      lines.push(`  → ${trimmed}`);
    }
  }

  lines.push('');
  lines.push(`  [Process completed in ${(Math.random() * 0.3 + 0.1).toFixed(3)}s]`);

  return lines;
}

// ─── JavaScript Executor ────────────────────────────────────────────────────

function executeJavaScript(code: string): string[] {
  const output: string[] = [];
  output.push('── JavaScript Execution ──────────────────────');
  output.push('');

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  try {
    console.log = (...args: unknown[]) => {
      output.push(args.map(String).join(' '));
    };
    console.error = (...args: unknown[]) => {
      output.push('[ERROR] ' + args.map(String).join(' '));
    };
    console.warn = (...args: unknown[]) => {
      output.push('[WARN] ' + args.map(String).join(' '));
    };

    const wrapped = `(async () => { ${code} })()`;
    eval(wrapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    output.push(`[ERROR] ${message}`);
  }

  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;

  output.push('');
  output.push('[Execution complete]');

  return output;
}

// ─── Output Line Colorizer ──────────────────────────────────────────────────

function colorizeLine(line: string): React.ReactNode {
  // Table/border lines
  if (/^[┌├└│─═┬┴┼┤]+$/.test(line) || /^[ │├┤┌┐└┘─]+$/.test(line)) {
    return <span className="text-gray-500">{line}</span>;
  }
  // Error lines
  if (line.includes('[ERROR]') || line.startsWith('Error:')) {
    return <span className="text-red-400 font-medium">{line}</span>;
  }
  // Warning lines
  if (line.includes('[WARN]')) {
    return <span className="text-amber-400">{line}</span>;
  }
  // Header lines
  if (line.startsWith('──')) {
    return <span className="text-emerald-500 font-semibold">{line}</span>;
  }
  // Success/info lines (starting with ✓ or [Process] or [Execution])
  if (line.startsWith('  ✓') || line.startsWith('[Process') || line.startsWith('[Execution')) {
    return <span className="text-emerald-400">{line}</span>;
  }
  // Query execution indicator
  if (line.startsWith('▸')) {
    return <span className="text-blue-400">{line}</span>;
  }
  // Row count line (rows returned)
  if (line.match(/^\(\d+ rows? returned/)) {
    return <span className="text-gray-400">{line}</span>;
  }
  // Rows affected
  if (line.match(/\d+ rows? affected/)) {
    return <span className="text-gray-400">{line}</span>;
  }
  // Numbers-heavy lines (table data rows) — highlight numbers
  const hasNumbers = /\d+/.test(line) && !line.startsWith('  #') && !line.startsWith('  →');
  if (hasNumbers && line.trim().startsWith('│')) {
    // SQL table row - colorize numbers in the row
    const parts = line.split(/(\d+\.?\d*)/);
    return (
      <span>
        {parts.map((part, i) =>
          /^\d+\.?\d*$/.test(part) && part.length > 0 ? (
            <span key={i} className="text-emerald-300">{part}</span>
          ) : (
            <span key={i} className="text-gray-300">{part}</span>
          )
        )}
      </span>
    );
  }
  // R data rows
  if (/^\s+\d+\s+/.test(line) && line.includes('  ')) {
    const parts = line.split(/(\d+\.?\d*)/);
    return (
      <span>
        {parts.map((part, i) =>
          /^\d+\.?\d*$/.test(part) && part.length > 0 ? (
            <span key={i} className="text-emerald-300">{part}</span>
          ) : (
            <span key={i} className="text-gray-300">{part}</span>
          )
        )}
      </span>
    );
  }
  // Python data table rows
  if (line.startsWith('  0  ') || line.startsWith('  1  ') || line.startsWith('  2  ') || line.startsWith('  3  ') || line.startsWith('  4  ')) {
    const parts = line.split(/(\d+\.?\d*)/);
    return (
      <span>
        {parts.map((part, i) =>
          /^\d+\.?\d*$/.test(part) && part.length > 0 ? (
            <span key={i} className="text-emerald-300">{part}</span>
          ) : (
            <span key={i} className="text-gray-300">{part}</span>
          )
        )}
      </span>
    );
  }
  // Keyword lines (True, False, NaN, None, NULL)
  if (/\b(True|False|NaN|None|NULL|null|undefined)\b/.test(line)) {
    const parts = line.split(/(True|False|NaN|None|NULL|null|undefined)/);
    return (
      <span>
        {parts.map((part, i) =>
          ['True', 'False'].includes(part) ? (
            <span key={i} className="text-blue-400">{part}</span>
          ) : ['NaN', 'None', 'NULL', 'null', 'undefined'].includes(part) ? (
            <span key={i} className="text-amber-400">{part}</span>
          ) : (
            <span key={i} className="text-gray-300">{part}</span>
          )
        )}
      </span>
    );
  }
  // String content (lines with quoted strings)
  if (/'[^']+'/.test(line) || /"[^"]+"/.test(line)) {
    const parts = line.split(/('[^']+'|"[^"]+")/);
    return (
      <span>
        {parts.map((part, i) =>
          /^(['"]).*\1$/.test(part) ? (
            <span key={i} className="text-amber-300">{part}</span>
          ) : (
            <span key={i} className="text-gray-300">{part}</span>
          )
        )}
      </span>
    );
  }
  // Comments
  if (line.startsWith('  #')) {
    return <span className="text-gray-600">{line}</span>;
  }
  // Default
  return <span className="text-gray-300">{line}</span>;
}

// ─── History Helpers ─────────────────────────────────────────────────────────

const HISTORY_KEY = 'datatrack-code-history';
const MAX_HISTORY = 10;

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
  } catch {
    // Ignore storage errors
  }
}

// ─── Keyboard Shortcuts Data ─────────────────────────────────────────────────

const SHORTCUTS = [
  { keys: 'Ctrl + Enter', desc: 'Run code' },
  { keys: 'Tab', desc: 'Insert 2 spaces' },
  { keys: 'Ctrl + L', desc: 'Clear output' },
  { keys: 'Ctrl + Shift + C', desc: 'Copy code' },
  { keys: 'Ctrl + Shift + F', desc: 'Format code' },
  { keys: 'Escape', desc: 'Close dialogs' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function CodePlaygroundView() {
  const [language, setLanguage] = useState<Language>('sql');
  const [code, setCode] = useState(PLACEHOLDERS.sql);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeExample, setActiveExample] = useState('none');
  const [activeTemplate, setActiveTemplate] = useState('none');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadHistory();
  });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle language change
  const handleLanguageChange = useCallback((value: string) => {
    const lang = value as Language;
    setLanguage(lang);
    setCode(PLACEHOLDERS[lang]);
    setOutput([]);
    setActiveExample('none');
    setActiveTemplate('none');
    setExecutionTime(null);
  }, []);

  // Run code
  const runCode = useCallback(() => {
    if (code.trim() === '') return;

    setIsRunning(true);
    setOutput([]);
    setExecutionTime(null);
    const startTime = performance.now();

    // Save to history
    const entry: HistoryEntry = {
      code,
      language,
      timestamp: Date.now(),
      label: `Last ${language.toUpperCase()} run`,
    };
    setHistory(prev => {
      const updated = [entry, ...prev.filter(h => h.code !== code)].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });

    // Small delay for visual feedback
    setTimeout(() => {
      let result: string[];
      switch (language) {
        case 'sql':
          result = simulateSQL(code);
          break;
        case 'python':
          result = simulatePython(code);
          break;
        case 'javascript':
          result = executeJavaScript(code);
          break;
        case 'r':
          result = simulateR(code);
          break;
        default:
          result = ['Unknown language'];
      }
      setOutput(result);
      setIsRunning(false);
      setExecutionTime(performance.now() - startTime);
      toast.success(`${language.toUpperCase()} code executed`);
    }, 400);
  }, [language, code]);

  // Clear
  const handleClear = useCallback(() => {
    setCode('');
    setOutput([]);
    setActiveExample('none');
    setActiveTemplate('none');
    setExecutionTime(null);
    toast.info('Editor cleared');
  }, []);

  // Copy code
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [code]);

  // Format
  const handleFormat = useCallback(() => {
    const formatted = code
      .split('\n')
      .map(l => l.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    setCode(formatted);
    toast.success('Code formatted');
  }, [code]);

  // Handle keydown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newValue = code.substring(0, start) + '  ' + code.substring(end);
        setCode(newValue);
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 2;
        });
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        runCode();
      }
      if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOutput([]);
        setExecutionTime(null);
        toast.info('Output cleared');
      }
      if (e.key === 'c' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        handleCopyCode();
      }
      if (e.key === 'f' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        handleFormat();
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        setShowHistory(false);
      }
    },
    [code, runCode, handleCopyCode, handleFormat]
  );

  // Share (copy code + output as formatted text)
  const handleShare = useCallback(async () => {
    const divider = '═'.repeat(50);
    const text = [
      `${divider}`,
      `  Code Playground — ${language.toUpperCase()}`,
      `${divider}`,
      '',
      '─── CODE ───',
      '',
      code,
      '',
      '─── OUTPUT ───',
      '',
      output.length > 0 ? output.join('\n') : '(no output)',
      '',
      `${divider}`,
      `  Shared from DataTrack Pro`,
      `${divider}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      toast.success('Code + output copied to clipboard');
      setTimeout(() => setShared(false), 2000);
    } catch {
      toast.error('Failed to share');
    }
  }, [code, output, language]);

  // Example selection
  const handleExampleChange = useCallback(
    (value: string) => {
      if (value === 'none') return;
      setActiveExample(value);
      setActiveTemplate('none');
      const found = EXAMPLES[language].find(ex => ex.label === value);
      if (found) {
        setCode(found.code);
        setOutput([]);
        setExecutionTime(null);
        toast.info(`Loaded: ${found.label}`);
      }
    },
    [language]
  );

  // Template selection
  const handleTemplateChange = useCallback(
    (value: string) => {
      if (value === 'none') return;
      setActiveTemplate(value);
      setActiveExample('none');
      const found = TEMPLATES[language].find(t => t.label === value);
      if (found) {
        setCode(found.code);
        setOutput([]);
        setExecutionTime(null);
        toast.info(`Template: ${found.label}`);
      }
    },
    [language]
  );

  // Load from history
  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setLanguage(entry.language);
    setCode(entry.code);
    setOutput([]);
    setActiveExample('none');
    setActiveTemplate('none');
    setExecutionTime(null);
    setShowHistory(false);
    toast.info('Loaded from history');
  }, []);

  const lineCount = code.split('\n').length;
  const charCount = code.length;

  const langColor: Record<Language, string> = {
    sql: 'bg-blue-500',
    python: 'bg-amber-500',
    javascript: 'bg-yellow-400',
    r: 'bg-sky-500',
  };

  const langLabel: Record<Language, string> = {
    sql: 'SQL',
    python: 'Python',
    javascript: 'JavaScript',
    r: 'R',
  };

  const langIcon: Record<Language, string> = {
    sql: '🗄️',
    python: '🐍',
    javascript: '⚡',
    r: '📊',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <Code className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Code Playground</h2>
            <p className="text-sm text-muted-foreground">
              Write, run &amp; experiment with data analytics code
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language badges */}
          <div className="hidden items-center gap-1.5 sm:flex">
            {(['sql', 'python', 'javascript', 'r'] as Language[]).map(lang => (
              <Badge
                key={lang}
                variant={language === lang ? 'default' : 'outline'}
                className={cn(
                  'gap-1 px-2 py-0.5 text-[10px] font-medium transition-all',
                  language === lang && 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0'
                )}
              >
                <span className="text-xs">{langIcon[lang]}</span>
                {langLabel[lang]}
              </Badge>
            ))}
          </div>
          {/* Shortcuts button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowShortcuts(true)}
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Keyboard Shortcuts</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Main IDE Card */}
      <Card className="overflow-hidden border shadow-xl">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-2">
          {/* Language Tabs */}
          <Tabs value={language} onValueChange={handleLanguageChange}>
            <TabsList className="h-8">
              {(['sql', 'python', 'javascript', 'r'] as Language[]).map(lang => (
                <TabsTrigger
                  key={lang}
                  value={lang}
                  className="gap-1.5 px-3 text-xs font-medium"
                >
                  <span className={cn('h-2 w-2 rounded-full', langColor[lang])} />
                  {langLabel[lang]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="hidden h-5 w-px bg-border sm:block" />

          {/* Template Dropdown */}
          {TEMPLATES[language].length > 0 && (
            <Select value={activeTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <FileText className="mr-1.5 h-3 w-3" />
                <SelectValue placeholder="Templates..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Templates...</SelectItem>
                {TEMPLATES[language].map(t => (
                  <SelectItem key={t.label} value={t.label}>
                    <span className="mr-1">{t.icon}</span> {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Examples Dropdown */}
          <Select value={activeExample} onValueChange={handleExampleChange}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <FolderOpen className="mr-1.5 h-3 w-3" />
              <SelectValue placeholder="Examples..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Examples...</SelectItem>
              {EXAMPLES[language].map(ex => (
                <SelectItem key={ex.label} value={ex.label}>
                  {ex.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowHistory(true)}
                  disabled={history.length === 0}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>History ({history.length})</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClear}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8', copied && 'text-emerald-600')}
                  onClick={handleCopyCode}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Code</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8', shared && 'text-emerald-600')}
                  onClick={handleShare}
                  disabled={output.length === 0}
                >
                  {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share Code + Output</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFormat}>
                  <Braces className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Format Code</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
            </Tooltip>

            <div className="mx-1 h-5 w-px bg-border" />

            {/* RUN Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={runCode}
                disabled={isRunning || code.trim() === ''}
                className={cn(
                  'gap-2 bg-gradient-to-r font-semibold shadow-md text-white',
                  'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
                  'h-8 px-5'
                )}
              >
                <motion.div
                  animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
                  transition={isRunning ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
                >
                  <Play className="h-3.5 w-3.5" />
                </motion.div>
                <span className="text-xs">{isRunning ? 'Running...' : 'Run'}</span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1.5 border-b bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground">
          <Database className="h-3 w-3" />
          <span>playground</span>
          <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
          <span className={cn('font-medium', langColor[language].replace('bg-', 'text-'))}>
            {langLabel[language].toLowerCase()}
          </span>
          {activeExample !== 'none' && (
            <>
              <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
              <span className="font-medium">{activeExample}</span>
            </>
          )}
          {activeTemplate !== 'none' && (
            <>
              <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
              <span className="font-medium">{activeTemplate}</span>
            </>
          )}
          {code.trim() === '' && (
            <>
              <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
              <span className="text-gray-400">untitled</span>
            </>
          )}
        </div>

        {/* Editor + Output Split Pane */}
        <div className={cn(isFullscreen ? 'fixed inset-0 z-50 bg-black' : '')}>
          <ResizablePanelGroup
            direction="vertical"
            className={cn(
              isFullscreen ? 'h-screen' : 'h-[560px]'
            )}
          >
            {/* Editor Panel */}
            <ResizablePanel defaultSize={55} minSize={25} maxSize={80}>
              <div className="flex h-full overflow-hidden bg-gray-950">
                {/* Line Numbers */}
                <div className="flex-shrink-0 select-none overflow-hidden bg-gray-950/80 py-3 pl-3 pr-2 font-mono text-xs leading-[1.65] text-gray-600">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i} className={cn(
                      i === 0 && 'text-emerald-700'
                    )}>
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="w-px bg-gray-800" />

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setActiveExample('none');
                    setActiveTemplate('none');
                  }}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  className={cn(
                    'w-full resize-none bg-gray-900 p-3',
                    'font-mono text-sm leading-[1.65] text-emerald-400',
                    'placeholder:text-gray-700',
                    'outline-none',
                    'focus:ring-1 focus:ring-inset focus:ring-emerald-500/30',
                    'selection:bg-emerald-500/30',
                    'custom-scrollbar'
                  )}
                  placeholder={`Type your ${langLabel[language]} code here... (Ctrl+Enter to run)`}
                />
              </div>
            </ResizablePanel>

            {/* Resizable Handle */}
            <ResizableHandle withHandle className="bg-gray-800 hover:bg-emerald-600/50 transition-colors" />

            {/* Output Panel */}
            <ResizablePanel defaultSize={45} minSize={20} maxSize={75}>
              <div className="flex h-full flex-col bg-gray-950">
                {/* Output Header */}
                <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950/80 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-400">Output</span>
                    {output.length > 0 && (
                      <Badge variant="secondary" className="h-4 bg-gray-800 px-1.5 text-[10px] text-gray-400">
                        {output.filter(l => l.trim()).length} lines
                      </Badge>
                    )}
                    {isRunning && (
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {executionTime !== null && (
                      <span className="text-[10px] text-gray-600">
                        {executionTime.toFixed(0)}ms
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className="h-4 gap-1 border-gray-700 px-1.5 text-[10px] text-gray-500"
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', langColor[language])} />
                      {langLabel[language]}
                    </Badge>
                  </div>
                </div>

                {/* Output Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {output.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex h-full items-center justify-center"
                      >
                        <div className="text-center">
                          <Terminal className="mx-auto mb-2 h-8 w-8 text-gray-700" />
                          <p className="text-sm font-medium text-gray-600">No output yet</p>
                          <p className="mt-1 text-xs text-gray-700">
                            Write code and press <kbd className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-mono text-gray-400">Ctrl+Enter</kbd>
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="output"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-[1.65]">
                          {output.map((line, i) => (
                            <span key={i}>{colorizeLine(line)}{'\n'}</span>
                          ))}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-1">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className={cn('h-1.5 w-1.5 rounded-full', langColor[language])} />
              {langLabel[language]}
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <Hash className="h-3 w-3" />
              {lineCount} lines
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <BarChart3 className="h-3 w-3" />
              {charCount} chars
            </span>
            <span className="hidden items-center gap-1 md:flex">
              <Clock className="h-3 w-3" />
              {executionTime !== null ? `${executionTime.toFixed(0)}ms` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="hidden sm:inline">Ctrl+Enter run</span>
            <span className="hidden sm:inline">Tab indent</span>
            <Badge
              variant="secondary"
              className={cn(
                'h-4 px-1.5 text-[10px] font-medium',
                language === 'javascript'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
              )}
            >
              <Zap className="mr-0.5 h-2.5 w-2.5" />
              {language === 'javascript' ? 'Live' : 'Simulated'}
            </Badge>
            {isFullscreen && (
              <Badge variant="outline" className="h-4 border-amber-400 text-[10px] text-amber-500">
                <Maximize2 className="mr-0.5 h-2.5 w-2.5" />
                Fullscreen
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>Quick actions for the code playground</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {SHORTCUTS.map(sc => (
              <div
                key={sc.keys}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5"
              >
                <span className="text-sm">{sc.desc}</span>
                <kbd className="rounded-md bg-background px-2 py-1 font-mono text-xs font-medium shadow-sm border">
                  {sc.keys}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Code History
            </DialogTitle>
            <DialogDescription>Last {MAX_HISTORY} executed code snippets</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 space-y-2 overflow-y-auto custom-scrollbar">
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No history yet</p>
            ) : (
              history.map((entry, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => loadFromHistory(entry)}
                  className="w-full rounded-lg border bg-muted/20 p-3 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn('h-4 border px-1.5 text-[10px]', langColor[entry.language].replace('bg-', 'border-'))}
                      >
                        {langLabel[entry.language]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {entry.code.split('\n').length} lines
                    </span>
                  </div>
                  <pre className="max-h-16 overflow-hidden font-mono text-xs text-gray-500 line-clamp-2">
                    {entry.code.split('\n').slice(0, 3).join('\n')}
                    {entry.code.split('\n').length > 3 && '\n...'}
                  </pre>
                </motion.button>
              ))
            )}
          </div>
          {history.length > 0 && (
            <div className="border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setHistory([]);
                  saveHistory([]);
                  toast.info('History cleared');
                }}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Clear All History
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
