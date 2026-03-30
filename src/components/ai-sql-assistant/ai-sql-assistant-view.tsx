'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Sparkles, Copy, Check, Play, Loader2, ArrowRight,
  Code2, Lightbulb, RefreshCw, Zap, Wand2, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EXAMPLE_QUERIES = [
  'Show me all employees earning more than 90000',
  'List the top 5 departments by total salary',
  'Find all transactions over $500 in the last month',
  'Count employees in each department',
  'Get the average salary by job title',
  'Show products with price greater than 100',
  'List all bank accounts with balance over 10000',
  'Find employees who joined in the last 6 months',
];

const FALLBACK_QUERIES: Record<string, string> = {
  employee: 'SELECT * FROM employees WHERE salary > 90000 ORDER BY salary DESC;',
  salary: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 10;',
  department: 'SELECT d.name, COUNT(e.id) as employee_count, AVG(e.salary) as avg_salary FROM departments d LEFT JOIN employees e ON d.id = e.department_id GROUP BY d.id, d.name ORDER BY employee_count DESC;',
  transaction: "SELECT * FROM transactions WHERE amount > 500 AND date >= DATE('now', '-1 month') ORDER BY amount DESC;",
  product: 'SELECT * FROM products WHERE price > 100 ORDER BY price DESC;',
  bank: 'SELECT * FROM bank_accounts WHERE balance > 10000 ORDER BY balance DESC;',
  count: 'SELECT COUNT(*) as total FROM employees;',
  average: 'SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department;',
  top: 'SELECT * FROM employees ORDER BY salary DESC LIMIT 5;',
  join: 'SELECT e.name, d.name as department, e.salary FROM employees e JOIN departments d ON e.department_id = d.id ORDER BY e.salary DESC;',
};

export default function AISQLAssistantView() {
  const [userInput, setUserInput] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<Array<{ query: string; sql: string }>>([]);

  const generateSQL = useCallback(async (input?: string) => {
    const text = input || userInput.trim();
    if (!text) {
      toast.error('Please describe what you want to query');
      return;
    }

    setIsGenerating(true);
    setGeneratedSQL('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Convert this to SQL: "${text}". Tables available: employees (id, name, email, salary, department_id, hire_date, job_title), departments (id, name, manager), sales (id, employee_id, amount, date, product_id), transactions (id, account_id, amount, type, date, description), bank_accounts (id, account_holder, balance, account_type), products (id, name, price, category, stock), employees_hr (id, name, email, department, position, start_date, salary). Only return the SQL query, nothing else. No markdown, no backticks, no explanation.`,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      let sql = data.reply || '';

      // Clean up markdown code blocks if present
      sql = sql.replace(/```sql\n?/gi, '').replace(/```\n?/g, '').trim();

      if (!sql || !sql.toUpperCase().includes('SELECT')) {
        // Fallback: find matching fallback query
        const lowerText = text.toLowerCase();
        let fallback = 'SELECT * FROM employees LIMIT 10;';
        for (const [keyword, query] of Object.entries(FALLBACK_QUERIES)) {
          if (lowerText.includes(keyword)) {
            fallback = query;
            break;
          }
        }
        sql = fallback;
        toast.info('Using a suggested query based on your description');
      }

      setGeneratedSQL(sql);
      setHistory(prev => [{ query: text, sql }, ...prev.slice(0, 9)]);
    } catch (err: unknown) {
      // Fallback logic
      const lowerText = text.toLowerCase();
      let fallback = 'SELECT * FROM employees LIMIT 10;';
      for (const [keyword, query] of Object.entries(FALLBACK_QUERIES)) {
        if (lowerText.includes(keyword)) {
          fallback = query;
          break;
        }
      }
      setGeneratedSQL(fallback);
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      toast.info(isTimeout ? 'AI timed out. Showing a suggested query based on your description.' : 'AI is unavailable. Showing a suggested query based on your description.');
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
    }

    return () => controller.abort();
  }, [userInput]);

  const handleCopy = () => {
    if (!generatedSQL) return;
    navigator.clipboard.writeText(generatedSQL);
    setCopied(true);
    toast.success('SQL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExampleClick = (example: string) => {
    setUserInput(example);
    generateSQL(example);
  };

  const handleRunInPlayground = () => {
    if (generatedSQL) {
      // Navigate to SQL playground by dispatching a custom event
      const event = new CustomEvent('navigate-to-section', { detail: { section: 'sql-playground' } });
      window.dispatchEvent(event);
      // Also try direct state update
      toast.success('Opening SQL Playground...');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">AI SQL Assistant</h1>
          <p className="text-sm text-muted-foreground">Describe what you need in plain English, get SQL instantly</p>
        </div>
        <Badge className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">AI-Powered</Badge>
      </motion.div>

      {/* Main Input Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold">Describe Your Query</h3>
            </div>
            <Textarea
              placeholder='e.g., "Show me all employees earning more than 90000"'
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="min-h-[80px] resize-none border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  generateSQL();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Press Ctrl+Enter to generate</p>
              <Button
                onClick={() => generateSQL()}
                disabled={isGenerating || !userInput.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate SQL
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated SQL Output */}
      <AnimatePresence>
        {generatedSQL && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/10 dark:to-teal-950/10 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-500" />
                    Generated SQL
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs">
                      {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button size="sm" onClick={handleRunInPlayground} className="text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600">
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      Run in SQL Playground
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-sm font-mono overflow-x-auto leading-relaxed">
                  <code>{generatedSQL}</code>
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Examples */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Quick Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {EXAMPLE_QUERIES.map((example, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleExampleClick(example)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition-all text-left group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-sm">{example}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Query History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-500" />
                  Recent Queries
                </CardTitle>
                {history.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => setHistory([])} className="text-xs text-muted-foreground">
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                    <Database className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No queries generated yet</p>
                  <p className="text-xs text-muted-foreground/70">Try one of the quick examples!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {history.map((item, i) => (
                    <div key={i} className="p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.query}</p>
                      <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 line-clamp-2 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg">
                        {item.sql}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Available Tables Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500" />
              Available Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { name: 'employees', cols: 7 },
                { name: 'departments', cols: 3 },
                { name: 'sales', cols: 5 },
                { name: 'transactions', cols: 6 },
                { name: 'bank_accounts', cols: 4 },
                { name: 'products', cols: 5 },
                { name: 'employees_hr', cols: 6 },
              ].map((table) => (
                <div key={table.name} className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center shrink-0">
                    <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{table.name}</p>
                    <p className="text-[10px] text-muted-foreground">{table.cols} columns</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
