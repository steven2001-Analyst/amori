'use client';

import React, { useState, useMemo } from 'react';
import { Database, Copy, Check, RotateCcw, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
  'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'GROUP BY',
  'ORDER BY', 'HAVING', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'AS', 'IN', 'NOT', 'NULL', 'IS',
  'LIKE', 'BETWEEN', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'DISTINCT', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'ASC', 'DESC', 'COUNT',
  'SUM', 'AVG', 'MIN', 'MAX', 'INT', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE',
  'TIMESTAMP', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'CONSTRAINT',
  'DEFAULT', 'AUTO_INCREMENT', 'IF', 'ELSE IF', 'BEGIN', 'COMMIT', 'ROLLBACK',
  'TRUNCATE', 'INDEX', 'VIEW', 'TRIGGER', 'PROCEDURE', 'FUNCTION',
];

const MAJOR_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
  'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'GROUP BY', 'ORDER BY', 'HAVING',
  'INSERT INTO', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'LIMIT',
  'UNION', 'VALUES',
];

const SQL_SNIPPETS = [
  { name: 'Basic SELECT', sql: 'SELECT column1, column2 FROM table_name WHERE condition = value ORDER BY column1 ASC LIMIT 10;' },
  { name: 'JOIN Query', sql: 'SELECT u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE o.total > 100 ORDER BY o.total DESC;' },
  { name: 'GROUP BY', sql: 'SELECT department, COUNT(*) as emp_count, AVG(salary) as avg_salary FROM employees GROUP BY department HAVING COUNT(*) > 5 ORDER BY avg_salary DESC;' },
  { name: 'Subquery', sql: 'SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY salary DESC;' },
  { name: 'CASE WHEN', sql: 'SELECT name, salary, CASE WHEN salary >= 100000 THEN \'Senior\' WHEN salary >= 60000 THEN \'Mid\' ELSE \'Junior\' END as level FROM employees ORDER BY salary DESC;' },
  { name: 'Create Table', sql: 'CREATE TABLE products (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(255) NOT NULL,\n  price DECIMAL(10, 2) DEFAULT 0.00,\n  stock INT DEFAULT 0,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);' },
  { name: 'Window Function', sql: 'SELECT name, department, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank FROM employees;' },
  { name: 'CTE', sql: 'WITH department_totals AS (\n  SELECT department, SUM(salary) as total FROM employees GROUP BY department\n)\nSELECT * FROM department_totals WHERE total > 500000 ORDER BY total DESC;' },
];

function formatSql(input: string): string {
  let formatted = input.trim();
  formatted = formatted.replace(/\s+/g, ' ');

  const sortedMajor = [...MAJOR_KEYWORDS].sort((a, b) => b.length - a.length);
  sortedMajor.forEach(kw => {
    const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${kw.toUpperCase()}`);
  });

  formatted = formatted.replace(/\b(AND|OR)\b/gi, '\n  $1');

  const sortedAll = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);
  sortedAll.forEach(kw => {
    const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    formatted = formatted.replace(regex, kw);
  });

  formatted = formatted.split('\n').map(line => line.trim()).join('\n');
  formatted = formatted.replace(/^\n+/, '');
  return formatted;
}

function highlightSql(sql: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const sorted = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(\\b(?:${sorted.join('|')})\\b)`, 'gi');
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(sql)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`} className="text-foreground">
          {sql.slice(lastIndex, match.index)}
        </span>
      );
    }
    parts.push(
      <span key={`k-${match.index}`} className="text-emerald-600 dark:text-emerald-400 font-semibold">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < sql.length) {
    parts.push(
      <span key={`t-${lastIndex}`} className="text-foreground">
        {sql.slice(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? parts : [<span key="all">{sql}</span>];
}

export default function SqlFormatterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [snippetIdx, setSnippetIdx] = useState('');

  const handleFormat = () => {
    if (!input.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }
    setOutput(formatSql(input));
    toast.success('SQL formatted successfully');
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const loadSnippet = () => {
    if (!snippetIdx) return;
    const snippet = SQL_SNIPPETS[parseInt(snippetIdx)];
    if (snippet) {
      setInput(snippet.sql);
      setOutput('');
    }
  };

  const lineCount = useMemo(() => (output ? output.split('\n').length : 0), [output]);
  const keywordCount = useMemo(() => {
    if (!output) return 0;
    const set = new Set();
    SQL_KEYWORDS.forEach(kw => {
      if (new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'i').test(output)) {
        set.add(kw);
      }
    });
    return set.size;
  }, [output]);

  return (
    <div className="space-y-4">
      {/* Snippet Selector */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />SQL Snippets
          </Label>
          <Select value={snippetIdx} onValueChange={setSnippetIdx}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Load a template..." />
            </SelectTrigger>
            <SelectContent>
              {SQL_SNIPPETS.map((s, i) => (
                <SelectItem key={i} value={String(i)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={loadSnippet} disabled={!snippetIdx} className="h-9 rounded-xl">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />Load
        </Button>
      </div>

      {/* Input/Output Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Input SQL</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or type your SQL query here..."
            className="font-mono text-xs min-h-[240px] resize-none"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Formatted Output</Label>
            <div className="flex items-center gap-2">
              {lineCount > 0 && (
                <div className="flex gap-1.5">
                  <Badge variant="secondary" className="text-[10px] h-5">{lineCount} lines</Badge>
                  <Badge variant="secondary" className="text-[10px] h-5">{keywordCount} keywords</Badge>
                </div>
              )}
              <Button size="sm" variant="ghost" onClick={handleCopy} disabled={!output} className="h-7 text-xs">
                {copied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
          <div className={cn(
            'p-3 rounded-lg border border-border bg-muted/20 font-mono text-xs min-h-[240px] max-h-[360px] overflow-y-auto whitespace-pre-wrap',
          )}>
            {output ? (
              highlightSql(output)
            ) : (
              <span className="text-muted-foreground italic">Formatted SQL will appear here...</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleFormat} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
          <Database className="w-4 h-4 mr-2" />Format SQL
        </Button>
        <Button onClick={handleClear} variant="outline" className="rounded-xl">
          <RotateCcw className="w-4 h-4 mr-2" />Clear
        </Button>
      </div>
    </div>
  );
}
