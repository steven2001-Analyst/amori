'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FormulaItem {
  title: string;
  syntax: string;
  description: string;
  tags?: string[];
}

const excelFormulas: FormulaItem[] = [
  {
    title: 'VLOOKUP',
    syntax: '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
    description: 'Search for a value in the first column and return a value from another column.',
    tags: ['Lookup', 'Essential'],
  },
  {
    title: 'XLOOKUP',
    syntax: '=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])',
    description: 'Modern replacement for VLOOKUP. Search and return from any direction.',
    tags: ['Lookup', 'Modern'],
  },
  {
    title: 'INDEX-MATCH',
    syntax: '=INDEX(return_range, MATCH(lookup_value, lookup_range, 0))',
    description: 'Powerful two-function combo. More flexible than VLOOKUP for complex lookups.',
    tags: ['Lookup', 'Advanced'],
  },
  {
    title: 'SUMIFS',
    syntax: '=SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    description: 'Sum values that meet multiple criteria.',
    tags: ['Aggregate', 'Conditional'],
  },
  {
    title: 'COUNTIFS',
    syntax: '=COUNTIFS(criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    description: 'Count cells that meet multiple criteria.',
    tags: ['Aggregate', 'Conditional'],
  },
  {
    title: 'AVERAGEIFS',
    syntax: '=AVERAGEIFS(average_range, criteria_range1, criteria1, ...)',
    description: 'Average values that meet multiple criteria.',
    tags: ['Aggregate', 'Conditional'],
  },
  {
    title: 'IF',
    syntax: '=IF(logical_test, value_if_true, value_if_false)',
    description: 'Return one value if condition is true, another if false.',
    tags: ['Logical'],
  },
  {
    title: 'IFS',
    syntax: '=IFS(condition1, value1, condition2, value2, ..., TRUE, default)',
    description: 'Check multiple conditions sequentially. Cleaner than nested IFs.',
    tags: ['Logical', 'Modern'],
  },
  {
    title: 'SWITCH',
    syntax: '=SWITCH(expression, value1, result1, [value2, result2], ..., [default])',
    description: 'Match expression against a list of values and return the corresponding result.',
    tags: ['Logical'],
  },
  {
    title: 'LET',
    syntax: '=LET(name1, value1, name2, value2, ..., calculation)',
    description: 'Define named variables within a formula for cleaner complex formulas.',
    tags: ['Modern', 'Helper'],
  },
  {
    title: 'UNIQUE',
    syntax: '=UNIQUE(array, [by_col], [exactly_once])',
    description: 'Return unique values from a range or array.',
    tags: ['Dynamic Array', 'Modern'],
  },
  {
    title: 'FILTER',
    syntax: '=FILTER(array, include, [if_empty])',
    description: 'Filter a range based on criteria you define.',
    tags: ['Dynamic Array', 'Modern'],
  },
];

const sqlFormulas: FormulaItem[] = [
  {
    title: 'SELECT with WHERE',
    syntax: `SELECT column1, column2\nFROM table_name\nWHERE condition\nORDER BY column1 ASC;`,
    description: 'Basic query to retrieve specific columns with filtering and sorting.',
    tags: ['Basic'],
  },
  {
    title: 'GROUP BY & HAVING',
    syntax: `SELECT column, AGG_FUNC(column2)\nFROM table_name\nWHERE condition\nGROUP BY column\nHAVING agg_condition;`,
    description: 'Group rows and apply aggregate conditions. HAVING filters groups.',
    tags: ['Aggregate'],
  },
  {
    title: 'INNER JOIN',
    syntax: `SELECT a.col1, b.col2\nFROM table_a a\nINNER JOIN table_b b\n  ON a.id = b.a_id;`,
    description: 'Return only matching rows from both tables.',
    tags: ['Join'],
  },
  {
    title: 'LEFT JOIN',
    syntax: `SELECT a.col1, b.col2\nFROM table_a a\nLEFT JOIN table_b b\n  ON a.id = b.a_id;`,
    description: 'All rows from left table, matching rows from right. NULL if no match.',
    tags: ['Join'],
  },
  {
    title: 'FULL OUTER JOIN',
    syntax: `SELECT a.col1, b.col2\nFROM table_a a\nFULL OUTER JOIN table_b b\n  ON a.id = b.a_id;`,
    description: 'Return all rows when there is a match in either table.',
    tags: ['Join'],
  },
  {
    title: 'ROW_NUMBER',
    syntax: `SELECT col1, col2,\n  ROW_NUMBER() OVER (\n    PARTITION BY col1\n    ORDER BY col2 DESC\n  ) as rn\nFROM table_name;`,
    description: 'Assign unique sequential numbers to rows within a partition.',
    tags: ['Window Function'],
  },
  {
    title: 'RANK / DENSE_RANK',
    syntax: `SELECT col1, score,\n  RANK() OVER (ORDER BY score DESC),\n  DENSE_RANK() OVER (ORDER BY score DESC)\nFROM scores;`,
    description: 'RANK: gaps on ties. DENSE_RANK: no gaps.',
    tags: ['Window Function'],
  },
  {
    title: 'LAG / LEAD',
    syntax: `SELECT date, revenue,\n  LAG(revenue, 1) OVER (ORDER BY date) as prev,\n  LEAD(revenue, 1) OVER (ORDER BY date) as next\nFROM sales;`,
    description: 'Access data from previous (LAG) or next (LEAD) row.',
    tags: ['Window Function'],
  },
  {
    title: 'CTE (Common Table Expression)',
    syntax: `WITH cte_name AS (\n  SELECT col1, col2\n  FROM table_name\n  WHERE condition\n)\nSELECT * FROM cte_name\nWHERE col1 > 100;`,
    description: 'Define a temporary result set for use within a SELECT/INSERT/UPDATE.',
    tags: ['CTE'],
  },
  {
    title: 'Subquery',
    syntax: `SELECT * FROM products\nWHERE price > (\n  SELECT AVG(price)\n  FROM products\n);`,
    description: 'A query nested inside another query. Can be in WHERE, FROM, or SELECT.',
    tags: ['Subquery'],
  },
];

const pythonFormulas: FormulaItem[] = [
  {
    title: 'Pandas: Read CSV',
    syntax: `import pandas as pd\n\ndf = pd.read_csv('data.csv')\ndf.head()  # First 5 rows\ndf.info()  # Data types & non-null`,
    description: 'Load a CSV file into a DataFrame and explore its structure.',
    tags: ['Pandas', 'IO'],
  },
  {
    title: 'Pandas: GroupBy',
    syntax: `df.groupby('category')['sales'].agg(\n    ['mean', 'sum', 'count']\n).reset_index()`,
    description: 'Group data by category and compute aggregate statistics.',
    tags: ['Pandas', 'Aggregate'],
  },
  {
    title: 'Pandas: Merge',
    syntax: `result = pd.merge(\n    df1, df2,\n    on='key_column',\n    how='left'  # inner, outer, right\n)`,
    description: 'Join two DataFrames similar to SQL JOINs.',
    tags: ['Pandas', 'Join'],
  },
  {
    title: 'Pandas: Pivot Table',
    syntax: `pd.pivot_table(\n    df,\n    values='sales',\n    index='region',\n    columns='year',\n    aggfunc='sum',\n    fill_value=0\n)`,
    description: 'Create spreadsheet-style pivot tables from data.',
    tags: ['Pandas', 'Reshape'],
  },
  {
    title: 'Pandas: Filter',
    syntax: `# Boolean indexing\nfiltered = df[df['price'] > 100]\n\n# Query method\nfiltered = df.query('price > 100 & category == "A"')`,
    description: 'Filter rows using conditions or the query method.',
    tags: ['Pandas', 'Filter'],
  },
  {
    title: 'NumPy: Array Creation',
    syntax: `import numpy as np\n\narr = np.array([1, 2, 3, 4])\nzeros = np.zeros((3, 4))\nones = np.ones((2, 3))\nrange_arr = np.arange(0, 10, 2)`,
    description: 'Create arrays from lists, zeros, ones, or ranges.',
    tags: ['NumPy'],
  },
  {
    title: 'NumPy: Operations',
    syntax: `arr = np.array([[1, 2], [3, 4]])\narr.sum(axis=0)   # Column sums\narr.mean()        # Mean of all\narr.T            # Transpose\narr.reshape(4, 1)`,
    description: 'Common array operations: sum, mean, transpose, reshape.',
    tags: ['NumPy'],
  },
  {
    title: 'Matplotlib: Basic Plot',
    syntax: `import matplotlib.pyplot as plt\n\nplt.figure(figsize=(10, 6))\nplt.plot(x, y, 'b-', label='Line')\nplt.xlabel('X Axis')\nplt.ylabel('Y Axis')\nplt.title('Chart Title')\nplt.legend()\nplt.show()`,
    description: 'Create a basic line plot with labels, title, and legend.',
    tags: ['Matplotlib'],
  },
  {
    title: 'Scikit-learn: Model Pattern',
    syntax: `from sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\n\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\nmodel = RandomForestClassifier()\nmodel.fit(X_train, y_train)\nscore = model.score(X_test, y_test)`,
    description: 'The standard pattern: split data, create model, fit, evaluate.',
    tags: ['Scikit-learn', 'ML'],
  },
];

const daxFormulas: FormulaItem[] = [
  {
    title: 'CALCULATE',
    syntax: `CALCULATE(\n  [Total Sales],\n  FILTER('Sales', 'Sales'[Year] = 2024)\n)`,
    description: 'Evaluate an expression in a modified filter context.',
    tags: ['Core', 'Essential'],
  },
  {
    title: 'FILTER',
    syntax: `FILTER(\n  'Table',\n  'Table'[Column] > 100\n)`,
    description: 'Return a table that represents a subset of another table or expression.',
    tags: ['Core'],
  },
  {
    title: 'ALL',
    syntax: `CALCULATE(\n  [Total Sales],\n  ALL('Sales')  -- Remove all filters\n)\n\nALL('Sales'[Category]) -- Remove filter on one column`,
    description: 'Remove filters from a table or column. Essential for percentages & totals.',
    tags: ['Core', 'Filter'],
  },
  {
    title: 'SAMEPERIODLASTYEAR',
    syntax: `CALCULATE(\n  [Total Sales],\n  SAMEPERIODLASTYEAR('Date'[Date])\n)`,
    description: 'Returns a set of dates from the previous year for comparison.',
    tags: ['Time Intelligence'],
  },
  {
    title: 'DATESYTD',
    syntax: `CALCULATE(\n  [Total Sales],\n  DATESYTD('Date'[Date])\n)`,
    description: 'Returns a set of dates from the start of the year to the current date.',
    tags: ['Time Intelligence'],
  },
  {
    title: 'DATEADD / PREVIOUSDAY',
    syntax: `-- Shift by N periods\nDATEADD('Date'[Date], -1, MONTH)\n\n-- Previous day\nPREVIOUSDAY('Date'[Date])`,
    description: 'Shift the date context by a specified interval.',
    tags: ['Time Intelligence'],
  },
  {
    title: 'Total Sales Measure',
    syntax: `Total Sales =\n  SUMX(\n    'Sales',\n    'Sales'[Quantity] * 'Sales'[Unit Price]\n  )`,
    description: 'Calculate total sales by iterating rows and multiplying quantity × price.',
    tags: ['Pattern'],
  },
  {
    title: 'YTD vs LYTD',
    syntax: `Sales YTD =\n  CALCULATE(\n    [Total Sales],\n    DATESYTD('Date'[Date])\n  )\n\nSales LYTD =\n  CALCULATE(\n    [Total Sales],\n    SAMEPERIODLASTYEAR(\n      DATESYTD('Date'[Date])\n    )\n  )`,
    description: 'Compare year-to-date sales with the same period last year.',
    tags: ['Pattern', 'Time Intelligence'],
  },
  {
    title: 'Running Total',
    syntax: `Running Total =\n  CALCULATE(\n    [Total Sales],\n    FILTER(\n      ALL('Date'),\n      'Date'[Date] <= MAX('Date'[Date])\n    )\n  )`,
    description: 'Calculate a running/cumulative total across dates.',
    tags: ['Pattern', 'Cumulative'],
  },
];

const tabConfig = [
  { id: 'excel', label: 'Excel', formulas: excelFormulas, color: 'text-green-500', bgAccent: 'border-green-500/20' },
  { id: 'sql', label: 'SQL', formulas: sqlFormulas, color: 'text-cyan-500', bgAccent: 'border-cyan-500/20' },
  { id: 'python', label: 'Python', formulas: pythonFormulas, color: 'text-amber-500', bgAccent: 'border-amber-500/20' },
  { id: 'dax', label: 'DAX', formulas: daxFormulas, color: 'text-orange-500', bgAccent: 'border-orange-500/20' },
];

export default function CheatSheet() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (syntax: string, id: string) => {
    navigator.clipboard.writeText(syntax).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="excel" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          {tabConfig.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn('text-xs sm:text-sm py-2 data-[state=active]:shadow-sm')}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            <div className="space-y-3">
              {tab.formulas.map((formula, idx) => {
                const formulaId = `${tab.id}-${idx}`;
                return (
                  <motion.div
                    key={formulaId}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card className={cn('overflow-hidden border', tab.bgAccent)}>
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold">{formula.title}</CardTitle>
                          <div className="flex items-center gap-1.5">
                            {formula.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formula.description}</p>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 pt-0">
                        <div className="relative group">
                          <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-3 overflow-x-auto">
                            <pre className="text-xs sm:text-sm font-mono text-gray-100 whitespace-pre leading-relaxed">
                              <code>{formula.syntax}</code>
                            </pre>
                          </div>
                          <button
                            onClick={() => handleCopy(formula.syntax, formulaId)}
                            className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedId === formulaId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
