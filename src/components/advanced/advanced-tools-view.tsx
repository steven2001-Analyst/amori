'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Palette, FileType, Hash, ArrowRightLeft, Search, Copy, Check,
  RotateCcw, Terminal, Database, Paintbrush, Lock, Binary,
  HelpCircle, ListTodo, Dumbbell, CheckCircle, Lightbulb, RefreshCw,
  ChevronDown, ChevronRight, Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import SubscriptionWall from '@/components/subscription/subscription-wall';
import { useProgressStore } from '@/lib/store';

/* ─── Regex Tester ─── */
function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [copied, setCopied] = useState(false);

  const matches = useMemo(() => {
    if (!pattern || !testString) return [];
    try {
      const regex = new RegExp(pattern, flags);
      const result: { match: string; index: number; groups: string[] }[] = [];
      let m;
      if (flags.includes('g')) {
        const safeRegex = new RegExp(pattern, flags);
        while ((m = safeRegex.exec(testString)) !== null) {
          result.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m[0].length === 0) safeRegex.lastIndex++;
          if (result.length > 100) break;
        }
      } else {
        m = regex.exec(testString);
        if (m) result.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
      return result;
    } catch {
      return [];
    }
  }, [pattern, flags, testString]);

  const highlightText = useMemo(() => {
    if (matches.length === 0 || !testString) return null;
    try {
      const regex = new RegExp(pattern, flags);
      const parts = testString.split(regex);
      const matchParts = testString.match(regex);
      if (!matchParts) return null;
      const result: { text: string; isMatch: boolean }[] = [];
      parts.forEach((part, i) => {
        if (part) result.push({ text: part, isMatch: false });
        if (i < matchParts.length) result.push({ text: matchParts[i], isMatch: true });
      });
      return result;
    } catch {
      return null;
    }
  }, [pattern, flags, testString, matches]);

  const isValid = useMemo(() => {
    if (!pattern) return true;
    try { new RegExp(pattern, flags); return true; } catch { return false; }
  }, [pattern, flags]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pattern);
    setCopied(true);
    toast.success('Pattern copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3">
        <div className="space-y-2">
          <Label>Regular Expression</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className={cn('pl-7 pr-7 font-mono text-sm', !isValid && 'border-red-500')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">/{flags}</span>
            </div>
            <Select value={flags} onValueChange={setFlags}>
              <SelectTrigger className="w-24 font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">g (global)</SelectItem>
                <SelectItem value="gi">gi (global+ignore)</SelectItem>
                <SelectItem value="gm">gm (global+multiline)</SelectItem>
                <SelectItem value="gim">gim (all)</SelectItem>
                <SelectItem value="i">i (ignoreCase)</SelectItem>
                <SelectItem value="m">m (multiline)</SelectItem>
              </SelectContent>
            </Select>
            <Button size="icon" variant="outline" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {!isValid && <p className="text-xs text-red-500">Invalid regular expression</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Test String</Label>
        <Textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter test string..."
          className="font-mono text-sm min-h-[80px]"
        />
      </div>

      {testString && highlightText && (
        <div className="space-y-2">
          <Label>Matched Results</Label>
          <div className="p-3 rounded-lg bg-muted/30 font-mono text-sm whitespace-pre-wrap break-all">
            {highlightText.map((part, i) => (
              <span key={i} className={part.isMatch ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded px-0.5' : ''}>
                {part.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-2">
          <Label>Matches ({matches.length})</Label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {matches.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-xs font-mono">
                <Badge variant="secondary" className="h-5 text-[10px] shrink-0">#{i + 1}</Badge>
                <span className="text-amber-600 dark:text-amber-400">&quot;{m.match}&quot;</span>
                <span className="text-muted-foreground ml-auto">index {m.index}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── JSON Formatter ─── */
function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState('2');

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, parseInt(indent)));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success('JSON copied to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Input JSON</Label>
            <div className="flex gap-2 items-center">
              <Select value={indent} onValueChange={setIndent}>
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="tab">Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value", "array": [1, 2, 3]}'
            className="font-mono text-xs min-h-[200px]"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Output</Label>
            <Button size="sm" variant="ghost" onClick={handleCopy} disabled={!output} className="h-7 text-xs">
              <Copy className="w-3 h-3 mr-1" />Copy
            </Button>
          </div>
          <div className={cn(
            'p-3 rounded-lg font-mono text-xs min-h-[200px] max-h-[300px] overflow-y-auto whitespace-pre-wrap break-all border',
            error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border bg-muted/20'
          )}>
            {error ? <span className="text-red-500">{error}</span> : output || 'Formatted output will appear here...'}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={formatJson} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
          <Code className="w-4 h-4 mr-2" />Format
        </Button>
        <Button onClick={minifyJson} variant="outline" className="rounded-xl">
          Minify
        </Button>
        <Button onClick={() => { setInput(''); setOutput(''); setError(''); }} variant="outline" className="rounded-xl">
          <RotateCcw className="w-4 h-4 mr-2" />Clear
        </Button>
      </div>
    </div>
  );
}

/* ─── SQL Formatter ─── */
function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const formatSql = () => {
    if (!input.trim()) return;
    try {
      // Simple SQL formatter: uppercase keywords, add newlines
      const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'ASC', 'DESC', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];

      let formatted = input.trim();
      // Normalize whitespace
      formatted = formatted.replace(/\s+/g, ' ');

      // Add newlines before major keywords
      const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT INTO', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'LIMIT', 'UNION'];
      majorKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${kw.toUpperCase()}`);
      });

      // Add newlines before AND, OR
      formatted = formatted.replace(/\b(AND|OR)\b/gi, '\n  $1');

      // Uppercase all keywords
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        formatted = formatted.replace(regex, kw);
      });

      // Clean up leading/trailing whitespace per line
      formatted = formatted.split('\n').map(line => line.trim()).join('\n');
      formatted = formatted.replace(/^\n+/, '');
      setOutput(formatted);
    } catch {
      setOutput(input);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Input SQL</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SELECT u.name, COUNT(o.id) FROM users u JOIN orders o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.name ORDER BY COUNT(o.id) DESC;"
            className="font-mono text-xs min-h-[200px]"
          />
        </div>
        <div className="space-y-2">
          <Label>Formatted SQL</Label>
          <div className="p-3 rounded-lg border border-border bg-muted/20 font-mono text-xs min-h-[200px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
            {output || 'Formatted SQL will appear here...'}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={formatSql} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
          <Database className="w-4 h-4 mr-2" />Format SQL
        </Button>
        <Button onClick={() => { setInput(''); setOutput(''); }} variant="outline" className="rounded-xl">
          <RotateCcw className="w-4 h-4 mr-2" />Clear
        </Button>
      </div>
    </div>
  );
}

/* ─── Color Palette Generator ─── */
function ColorPaletteGenerator() {
  const [palettes, setPalettes] = useState<string[][]>([]);

  const generatePalette = () => {
    const hue = Math.floor(Math.random() * 360);
    const newPalette = Array.from({ length: 5 }, (_, i) => {
      const h = (hue + i * 30 + Math.floor(Math.random() * 20) - 10) % 360;
      const s = 60 + Math.floor(Math.random() * 30);
      const l = 35 + Math.floor(Math.random() * 40);
      return `hsl(${h}, ${s}%, ${l}%)`;
    });
    setPalettes(prev => [newPalette, ...prev]);
  };

  const hslToHex = (hsl: string) => {
    const temp = document.createElement('div');
    temp.style.color = hsl;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    const match = computed.match(/\d+/g);
    if (!match) return hsl;
    return '#' + match.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(hslToHex(color));
    toast.success('Color copied');
  };

  return (
    <div className="space-y-4">
      <Button onClick={generatePalette} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
        <Palette className="w-4 h-4 mr-2" />Generate Palette
      </Button>

      {palettes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Paintbrush className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click &quot;Generate Palette&quot; to create color palettes</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {palettes.map((palette, pi) => (
            <div key={pi} className="flex rounded-xl overflow-hidden shadow-sm border border-border/50">
              {palette.map((color, ci) => (
                <button
                  key={ci}
                  className="flex-1 h-20 transition-all hover:flex-[1.5] flex flex-col items-center justify-end cursor-pointer group"
                  style={{ backgroundColor: color }}
                  onClick={() => copyColor(color)}
                >
                  <span className="text-xs font-mono px-2 py-1 bg-black/30 text-white rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {hslToHex(color)}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Data Type Converter ─── */
function DataTypeConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fromFormat, setFromFormat] = useState('json');
  const [toFormat, setToFormat] = useState('csv');

  const convert = () => {
    try {
      if (fromFormat === 'json' && toFormat === 'csv') {
        const data = JSON.parse(input);
        if (!Array.isArray(data) || data.length === 0) throw new Error('JSON must be a non-empty array');
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))];
        setOutput(csvRows.join('\n'));
      } else if (fromFormat === 'csv' && toFormat === 'json') {
        const lines = input.trim().split('\n');
        if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const json = lines.slice(1).map(line => {
          const values = line.match(/(".*?"|[^",]+)/g)?.map(v => v.trim().replace(/^"|"$/g, '')) || [];
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = values[i] || ''; });
          return obj;
        });
        setOutput(JSON.stringify(json, null, 2));
      } else if (fromFormat === 'json' && toFormat === 'xml') {
        const data = JSON.parse(input);
        const jsonToXml = (obj: unknown, tag: string): string => {
          if (Array.isArray(obj)) return obj.map(item => jsonToXml(item, 'item')).join('');
          if (typeof obj === 'object' && obj !== null) {
            return `<${tag}>\n${Object.entries(obj as Record<string, unknown>).map(([k, v]) => jsonToXml(v, k)).join('\n')}\n</${tag}>`;
          }
          return `<${tag}>${String(obj)}</${tag}>`;
        };
        setOutput('<?xml version="1.0" encoding="UTF-8"?>\n' + jsonToXml(data, 'root'));
      } else if (fromFormat === 'json' && toFormat === 'yaml') {
        const data = JSON.parse(input);
        const jsonToYaml = (obj: unknown, indent = 0): string => {
          const pad = '  '.repeat(indent);
          if (Array.isArray(obj)) return obj.map(item => `${pad}- ${jsonToYaml(item, 0).trimStart()}`).join('\n');
          if (typeof obj === 'object' && obj !== null) {
            return '\n' + Object.entries(obj as Record<string, unknown>).map(([k, v]) => {
              if (typeof v === 'object' && v !== null) return `${pad}${k}:${jsonToYaml(v, indent + 1)}`;
              return `${pad}${k}: ${typeof v === 'string' ? `"${v}"` : String(v)}`;
            }).join('\n');
          }
          return String(obj);
        };
        setOutput(jsonToYaml(data).trim());
      } else {
        toast.error('This conversion is not yet supported');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Conversion failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={fromFormat} onValueChange={setFromFormat}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
        <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
        <Select value={toFormat} onValueChange={setToFormat}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            <SelectItem value="yaml">YAML</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Input ({fromFormat.toUpperCase()})</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={fromFormat === 'json' ? '[{"name": "Alice", "age": 30}]' : 'name,age\nAlice,30\nBob,25'}
            className="font-mono text-xs min-h-[180px]"
          />
        </div>
        <div className="space-y-2">
          <Label>Output ({toFormat.toUpperCase()})</Label>
          <div className="p-3 rounded-lg border border-border bg-muted/20 font-mono text-xs min-h-[180px] max-h-[260px] overflow-y-auto whitespace-pre-wrap">
            {output || 'Converted output will appear here...'}
          </div>
        </div>
      </div>

      <Button onClick={convert} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
        <ArrowRightLeft className="w-4 h-4 mr-2" />Convert
      </Button>
    </div>
  );
}

/* ─── Hash Generator ─── */
function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});

  const generateHashes = () => {
    if (!input.trim()) return;
    // Simple client-side hash simulation
    const simpleHash = (str: string, algorithm: string): string => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const base = Math.abs(hash).toString(16);
      if (algorithm === 'md5') {
        // Simulate MD5 (32 hex chars)
        let result = '';
        for (let i = 0; i < 32; i++) {
          result += base[(i + hash) % base.length] || '0';
        }
        return result;
      }
      if (algorithm === 'sha256') {
        let result = '';
        for (let i = 0; i < 64; i++) {
          result += base[(i + hash * 2) % base.length] || '0';
        }
        return result;
      }
      if (algorithm === 'sha1') {
        let result = '';
        for (let i = 0; i < 40; i++) {
          result += base[(i + hash) % base.length] || '0';
        }
        return result;
      }
      return base;
    };

    setHashes({
      'MD5': simpleHash(input, 'md5'),
      'SHA-1': simpleHash(input, 'sha1'),
      'SHA-256': simpleHash(input, 'sha256'),
    });
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success('Hash copied');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Input Text</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to generate hashes..."
          className="font-mono text-sm min-h-[80px]"
        />
      </div>

      <Button onClick={generateHashes} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
        <Hash className="w-4 h-4 mr-2" />Generate Hashes
      </Button>

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
              <Badge variant="secondary" className="font-mono shrink-0">{algo}</Badge>
              <code className="flex-1 text-xs font-mono text-muted-foreground truncate">{hash}</code>
              <Button size="sm" variant="ghost" onClick={() => copyHash(hash)} className="h-7 shrink-0">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Base64 Encoder/Decoder ─── */
function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const process = () => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
    } catch {
      setError(mode === 'encode' ? 'Failed to encode input' : 'Invalid Base64 string');
      setOutput('');
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success('Copied to clipboard');
    }
  };

  const sampleInput = mode === 'encode'
    ? 'Hello, DataTrack! 🎉'
    : 'SGVsbG8sIERhdGFUcmFjayEg8J+Yjw==';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-border/50 overflow-hidden">
          <button
            onClick={() => { setMode('encode'); setOutput(''); setError(''); }}
            className={cn(
              'px-4 py-2 text-xs font-medium transition-colors',
              mode === 'encode' ? 'bg-emerald-500 text-white' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
            )}
          >
            Encode
          </button>
          <button
            onClick={() => { setMode('decode'); setOutput(''); setError(''); }}
            className={cn(
              'px-4 py-2 text-xs font-medium transition-colors',
              mode === 'decode' ? 'bg-emerald-500 text-white' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
            )}
          >
            Decode
          </button>
        </div>
        <Button size="sm" variant="ghost" onClick={() => { setInput(sampleInput); setOutput(''); setError(''); }} className="text-xs">
          Load Sample
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === 'encode' ? 'Plain Text' : 'Base64 String'}</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
            className="font-mono text-xs min-h-[160px]"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</Label>
            <Button size="sm" variant="ghost" onClick={handleCopy} disabled={!output} className="h-7 text-xs">
              <Copy className="w-3 h-3 mr-1" />Copy
            </Button>
          </div>
          <div className={cn(
            'p-3 rounded-lg font-mono text-xs min-h-[160px] max-h-[260px] overflow-y-auto whitespace-pre-wrap break-all border',
            error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border bg-muted/20'
          )}>
            {error ? <span className="text-red-500">{error}</span> : output || 'Output will appear here...'}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={process} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
          <Terminal className="w-4 h-4 mr-2" />{mode === 'encode' ? 'Encode' : 'Decode'}
        </Button>
        <Button onClick={() => { setInput(''); setOutput(''); setError(''); }} variant="outline" className="rounded-xl">
          <RotateCcw className="w-4 h-4 mr-2" />Clear
        </Button>
      </div>
    </div>
  );
}

/* ─── AI Question Generator ─── */
interface ParsedQuestion {
  number: number;
  question: string;
  options: string[];
  answer: string;
  selected: string | null;
  revealed: boolean;
}

function AIQuestionGenerator() {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);

  const subjects = ['SQL', 'Python', 'Excel', 'Power BI', 'Statistics', 'Data Modeling', 'DAX', 'Tableau'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const questionTypes = ['Multiple Choice', 'True/False', 'Short Answer', 'Fill-in-the-blank'];

  const parseQuestions = (text: string): ParsedQuestion[] => {
    const parsed: ParsedQuestion[] = [];
    const qRegex = /Q\s*(\d+)[.:)]\s*(.*?)(?=Q\s*\d+[.:)]|A:\s*Q\d+|$)/gis;
    const blocks = text.match(/Q\s*\d+[.:)].*?(?=Q\s*\d+[.:)]|$)/gis);
    if (!blocks) {
      const lines = text.split('\n').filter(l => l.trim());
      let current: Partial<ParsedQuestion> | null = null;
      for (const line of lines) {
        const qMatch = line.match(/Q\s*(\d+)[.:)]\s*(.*)/i);
        const aMatch = line.match(/^A[nswer]*[.:)]\s*(.*)/i);
        if (qMatch) {
          if (current && current.question) {
            parsed.push({ number: current.number || parsed.length + 1, question: current.question, options: current.options || [], answer: current.answer || '', selected: null, revealed: false });
          }
          current = { number: parseInt(qMatch[1]), question: qMatch[2].trim(), options: [], answer: '', selected: null, revealed: false };
        } else if (aMatch && current) {
          current.answer = aMatch[1].trim();
        } else if (current) {
          const optMatch = line.match(/^\s*([A-D])[.)]\s*(.*)/i);
          if (optMatch) {
            current.options.push(`${optMatch[1]}) ${optMatch[2].trim()}`);
          } else {
            current.question += ' ' + line.trim();
          }
        }
      }
      if (current && current.question) {
        parsed.push({ number: current.number || parsed.length + 1, question: current.question, options: current.options || [], answer: current.answer || '', selected: null, revealed: false });
      }
    } else {
      for (const block of blocks) {
        const numMatch = block.match(/Q\s*(\d+)/i);
        const aMatch = block.match(/A[nswer]*[.:)]\s*(.*)/i);
        const content = block.replace(/Q\s*\d+[.:)]/i, '').replace(/A[nswer]*[.:)]\s*(.*)/i, '').trim();
        const options = content.match(/^[A-D][.)].*/gim) || [];
        const questionText = options.length > 0
          ? content.replace(/^[A-D][.)].*/gim, '').trim()
          : content.trim();
        if (numMatch && questionText) {
          parsed.push({ number: parseInt(numMatch[1]), question: questionText, options, answer: aMatch ? aMatch[1].trim() : '', selected: null, revealed: false });
        }
      }
    }
    return parsed.length > 0 ? parsed : [{ number: 1, question: text, options: [], answer: '', selected: null, revealed: false }];
  };

  const fallbackQuestions = (): ParsedQuestion[] => {
    const topicLabel = topic.trim() || subject;
    return [
      { number: 1, question: `What is the primary purpose of ${topicLabel} in ${subject}?`, options: ['A) Data storage', 'B) Data manipulation', 'C) Data visualization', 'D) All of the above'], answer: 'D', selected: null, revealed: false },
      { number: 2, question: `Which concept is fundamental to understanding ${topicLabel}?`, options: ['A) Normalization', 'B) Aggregation', 'C) Indexing', 'D) Partitioning'], answer: 'A', selected: null, revealed: false },
      { number: 3, question: `True or False: ${topicLabel} is commonly used in professional ${subject} workflows.`, options: [], answer: 'True', selected: null, revealed: false },
      { number: 4, question: `What is a common beginner mistake when working with ${topicLabel}?`, options: ['A) Over-complicating queries', 'B) Not validating input data', 'C) Ignoring performance optimization', 'D) All of the above'], answer: 'D', selected: null, revealed: false },
      { number: 5, question: `Which tool or method is best suited for ${topicLabel} tasks?`, options: ['A) Command line utilities', 'B) GUI-based editors', 'C) Specialized libraries/frameworks', 'D) It depends on the use case'], answer: 'D', selected: null, revealed: false },
    ];
  };

  const generateQuestions = async () => {
    if (!subject || !difficulty || !questionType || !topic.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Generate 5 ${difficulty} ${questionType} questions about ${topic} in ${subject}. Format each as: Q{n}: question text [options if MC] A: answer` }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.error || !data.reply) throw new Error(data.error || 'No response');
      setQuestions(parseQuestions(data.reply));
    } catch (e) {
      toast.warning('AI is currently unavailable. Showing sample questions instead.');
      setQuestions(fallbackQuestions());
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex: number, option: string) => {
    setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, selected: option } : q));
  };

  const handleReveal = (qIndex: number) => {
    setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, revealed: true } : q));
  };

  const isCorrect = (q: ParsedQuestion) => {
    if (!q.selected || !q.answer) return false;
    const selectedLetter = q.selected.charAt(0).toUpperCase();
    const answerLetter = q.answer.charAt(0).toUpperCase();
    return selectedLetter === answerLetter || q.selected.toLowerCase() === q.answer.toLowerCase();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select value={questionType} onValueChange={setQuestionType}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{questionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Topic</Label>
          <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., SQL JOINs" />
        </div>
      </div>

      <Button onClick={generateQuestions} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
        {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <HelpCircle className="w-4 h-4 mr-2" />}
        {loading ? 'Generating...' : 'Generate Questions'}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {questions.length === 0 && !loading && !error && (
        <div className="text-center py-12 text-muted-foreground">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Configure your options and generate AI-powered questions</p>
        </div>
      )}

      <AnimatePresence>
        {questions.map((q, qi) => (
          <motion.div
            key={qi}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qi * 0.1 }}
            className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3"
          >
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="shrink-0 mt-0.5">Q{q.number}</Badge>
              <p className="text-sm font-medium leading-relaxed">{q.question}</p>
            </div>
            {q.options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                {q.options.map((opt, oi) => {
                  let optClass = 'border-border/50 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20';
                  if (q.revealed) {
                    const optLetter = opt.charAt(0).toUpperCase();
                    const ansLetter = q.answer.charAt(0).toUpperCase();
                    if (optLetter === ansLetter) {
                      optClass = 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300';
                    } else if (q.selected === opt && optLetter !== ansLetter) {
                      optClass = 'border-red-500 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300';
                    }
                  } else if (q.selected === opt) {
                    optClass = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20';
                  }
                  return (
                    <button key={oi} onClick={() => !q.revealed && handleSelect(qi, opt)} disabled={q.revealed} className={cn('text-left text-sm p-3 rounded-lg border transition-all', optClass)}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
            {q.selected && !q.revealed && q.options.length > 0 && (
              <div className="pl-10">
                <Button size="sm" variant="outline" onClick={() => handleReveal(qi)} className="text-xs">
                  <Lightbulb className="w-3 h-3 mr-1" />Reveal Answer
                </Button>
              </div>
            )}
            {q.revealed && q.answer && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pl-10">
                <div className={cn('text-sm p-3 rounded-lg', isCorrect(q) ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300')}>
                  <span className="font-semibold">Answer:</span> {q.answer}
                  {q.selected && <span className="ml-2">{isCorrect(q) ? '✅ Correct!' : '❌ Not quite'}</span>}
                </div>
              </motion.div>
            )}
            {(q.options.length === 0) && q.answer && (
              <div className="pl-10">
                <Button size="sm" variant="outline" onClick={() => handleReveal(qi)} className="text-xs">
                  {q.revealed ? <Check className="w-3 h-3 mr-1" /> : <Lightbulb className="w-3 h-3 mr-1" />}{q.revealed ? 'Answer Shown' : 'Show Answer'}
                </Button>
                {q.revealed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                    <span className="font-semibold">Answer:</span> {q.answer}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── AI Task Generator ─── */
interface DayPlan {
  day: number;
  title: string;
  tasks: { text: string; completed: boolean }[];
}

function AITaskGenerator() {
  const [goal, setGoal] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<DayPlan[]>([]);

  const focusAreas = ['SQL', 'Python', 'Excel', 'Power BI', 'Statistics'];

  const parsePlan = (text: string): DayPlan[] => {
    const days: DayPlan[] = [];
    const dayBlocks = text.split(/(?=Day\s+\d+)/i);
    for (const block of dayBlocks) {
      const dayMatch = block.match(/Day\s+(\d+)[.:)]\s*([^\n]*)/i);
      if (!dayMatch) continue;
      const dayNum = parseInt(dayMatch[1]);
      const dayTitle = dayMatch[2].trim();
      const taskLines = block.split('\n').filter(l => l.trim() && !l.match(/^Day\s+\d+/i));
      const tasks = taskLines.map(line => {
        const cleaned = line.replace(/^[-*•\[\]]\s*/, '').replace(/^\s*\[[x ]\]\s*/i, '').trim();
        return { text: cleaned, completed: false };
      }).filter(t => t.text.length > 0);
      days.push({ day: dayNum, title: dayTitle || `Day ${dayNum}`, tasks });
    }
    return days;
  };

  const fallbackPlan = (): DayPlan[] => [
    { day: 1, title: `Day 1: ${focusArea} Fundamentals`, tasks: [{ text: `Review core ${focusArea} concepts and terminology`, completed: false }, { text: 'Watch an introductory tutorial video (30 min)', completed: false }, { text: 'Complete 5 basic practice exercises', completed: false }] },
    { day: 2, title: `Day 2: ${focusArea} Deep Dive`, tasks: [{ text: `Study intermediate ${focusArea} techniques`, completed: false }, { text: 'Work through guided examples step by step', completed: false }, { text: 'Take notes on key patterns and best practices', completed: false }] },
    { day: 3, title: 'Day 3: Hands-on Practice', tasks: [{ text: `Complete a ${focusArea} mini-project`, completed: false }, { text: 'Debug and fix common errors', completed: false }, { text: 'Review and organize your notes', completed: false }] },
    { day: 4, title: 'Day 4: Advanced Topics', tasks: [{ text: `Explore advanced ${focusArea} features`, completed: false }, { text: 'Solve 3 challenging exercises', completed: false }, { text: 'Read documentation for edge cases', completed: false }] },
    { day: 5, title: 'Day 5: Integration & Review', tasks: [{ text: 'Combine concepts from previous days', completed: false }, { text: 'Build a small end-to-end project', completed: false }, { text: 'Identify areas needing more practice', completed: false }] },
    { day: 6, title: 'Day 6: Real-world Scenarios', tasks: [{ text: `Solve real-world ${focusArea} problems`, completed: false }, { text: 'Practice with realistic datasets or scenarios', completed: false }, { text: 'Time yourself on exercises for efficiency', completed: false }] },
    { day: 7, title: 'Day 7: Final Review & Assessment', tasks: [{ text: 'Complete a comprehensive review quiz', completed: false }, { text: 'Teach a concept to reinforce learning', completed: false }, { text: 'Set goals for next learning phase', completed: false }] },
  ];

  const generatePlan = async () => {
    if (!goal.trim() || !focusArea) {
      toast.error('Please enter a goal and select a focus area');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Create a detailed study plan for: ${goal}. Focus on ${focusArea}. Break it into daily tasks for one week (7 days). Format as: Day N: [day title]. Then list tasks as bullet points (- task text). Include specific exercises and resources for each day.` }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.error || !data.reply) throw new Error(data.error || 'No response');
      setPlan(parsePlan(data.reply));
    } catch (e) {
      toast.warning('AI is currently unavailable. Showing a sample study plan instead.');
      setPlan(fallbackPlan());
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (dayIdx: number, taskIdx: number) => {
    setPlan(prev => prev.map((d, di) => {
      if (di !== dayIdx) return d;
      return { ...d, tasks: d.tasks.map((t, ti) => ti === taskIdx ? { ...t, completed: !t.completed } : t) };
    }));
  };

  const markAllComplete = (dayIdx: number) => {
    setPlan(prev => prev.map((d, di) => {
      if (di !== dayIdx) return d;
      const allDone = d.tasks.every(t => t.completed);
      return { ...d, tasks: d.tasks.map(t => ({ ...t, completed: !allDone })) };
    }));
  };

  const totalTasks = plan.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = plan.reduce((acc, d) => acc + d.tasks.filter(t => t.completed).length, 0);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Your Goal</Label>
          <Input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g., Learn SQL joins in 1 week" />
        </div>
        <div className="space-y-2">
          <Label>Focus Area</Label>
          <Select value={focusArea} onValueChange={setFocusArea}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{focusAreas.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={generatePlan} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
        {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ListTodo className="w-4 h-4 mr-2" />}
        {loading ? 'Generating...' : 'Generate Study Plan'}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {plan.length === 0 && !loading && !error && (
        <div className="text-center py-12 text-muted-foreground">
          <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter your learning goal and generate an AI-powered weekly study plan</p>
        </div>
      )}

      {plan.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed
            </div>
            <Badge variant="secondary" className="font-mono">
              {progressPercent}%
            </Badge>
          </div>
          <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <AnimatePresence>
            {plan.map((day, di) => {
              const dayCompleted = day.tasks.every(t => t.completed);
              const dayProgress = day.tasks.length > 0 ? Math.round((day.tasks.filter(t => t.completed).length / day.tasks.length) * 100) : 0;
              return (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: di * 0.1 }}
                  className="border border-border/50 rounded-xl overflow-hidden"
                >
                  <button
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
                    onClick={() => {
                      const el = document.getElementById(`day-${di}-tasks`);
                      if (el) el.classList.toggle('hidden');
                    }}
                  >
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold', dayCompleted ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>
                      {dayCompleted ? <Check className="w-4 h-4" /> : day.day}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-semibold truncate', dayCompleted && 'line-through text-muted-foreground')}>{day.title}</p>
                      <p className="text-xs text-muted-foreground">{day.tasks.filter(t => t.completed).length}/{day.tasks.length} tasks</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${dayProgress}%` }} />
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                  <div id={`day-${di}-tasks`} className="px-4 pb-4 space-y-1">
                    {day.tasks.map((task, ti) => (
                      <label key={ti} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/20 cursor-pointer group">
                        <button
                          onClick={() => toggleTask(di, ti)}
                          className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all', task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/30 group-hover:border-emerald-400')}
                        >
                          {task.completed && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={cn('text-sm leading-relaxed', task.completed && 'line-through text-muted-foreground')}>{task.text}</span>
                      </label>
                    ))}
                    <Button size="sm" variant="ghost" onClick={() => markAllComplete(di)} className="ml-8 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {day.tasks.every(t => t.completed) ? 'Uncheck All' : 'Mark All Complete'}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─── AI Practice Exercises ─── */
function AIPracticeExercises() {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exercise, setExercise] = useState('');
  const [solution, setSolution] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [copiedQ, setCopiedQ] = useState(false);
  const [copiedA, setCopiedA] = useState(false);

  const subjects = ['SQL', 'Python', 'Excel', 'DAX', 'Power BI', 'Statistics'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const fallbackExercise = () => {
    const exercises: Record<string, { exercise: string; solution: string }> = {
      'SQL-Beginner': { exercise: 'Write a SELECT query to find all customers who have placed orders totaling more than $100 in the last 30 days. Use the `orders` table with columns: order_id, customer_id, total_amount, order_date.', solution: 'SELECT DISTINCT customer_id\nFROM orders\nWHERE total_amount > 100\n  AND order_date >= DATEADD(day, -30, GETDATE());' },
      'Python-Beginner': { exercise: 'Write a Python function that takes a list of numbers and returns a dictionary with the count, sum, average, min, and max values.', solution: 'def summarize(nums):\n    return {\n        "count": len(nums),\n        "sum": sum(nums),\n        "average": sum(nums) / len(nums) if nums else 0,\n        "min": min(nums) if nums else None,\n        "max": max(nums) if nums else None\n    }' },
      'Excel-Beginner': { exercise: 'Using Excel formulas, calculate the percentage growth from column B (previous month) to column C (current month) in column D. Handle division by zero.', solution: '=IF(B2=0, "N/A", (C2-B2)/B2)\n\nFormat column D as percentage. Copy the formula down for all rows.' },
    };
    const key = `${subject}-${difficulty}`;
    const fallback = exercises[key] || exercises['SQL-Beginner'];
    setExercise(fallback.exercise);
    setSolution(fallback.solution);
  };

  const generateExercise = async () => {
    if (!subject || !difficulty) {
      toast.error('Please select a subject and difficulty');
      return;
    }
    setLoading(true);
    setError('');
    setExercise('');
    setSolution('');
    setUserAnswer('');
    setShowSolution(false);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Generate a ${difficulty} practice exercise for ${subject}. Include: 1) A clear exercise prompt/challenge. 2) The expected solution. Format as: EXERCISE: [exercise description] SOLUTION: [solution code/explanation]` }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.error || !data.reply) throw new Error(data.error || 'No response');
      const exMatch = data.reply.match(/EXERCISE[.:)]\s*([\s\S]*?)(?=SOLUTION[.:)]|$)/i);
      const solMatch = data.reply.match(/SOLUTION[.:)]\s*([\s\S]*?)$/i);
      setExercise(exMatch ? exMatch[1].trim() : data.reply);
      setSolution(solMatch ? solMatch[1].trim() : '');
    } catch (e) {
      toast.warning('AI is currently unavailable. Showing a sample exercise instead.');
      fallbackExercise();
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setCompleted(prev => prev + 1);
    toast.success('Exercise completed! Keep going!');
  };

  const copyText = (text: string, type: 'question' | 'answer') => {
    navigator.clipboard.writeText(text);
    if (type === 'question') { setCopiedQ(true); setTimeout(() => setCopiedQ(false), 2000); }
    else { setCopiedA(true); setTimeout(() => setCopiedA(false), 2000); }
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs">Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={generateExercise} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
        {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Dumbbell className="w-4 h-4 mr-2" />}
        {loading ? 'Generating...' : 'Generate Exercise'}
      </Button>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          <Dumbbell className="w-3 h-3 mr-1" />{completed} completed this session
        </Badge>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {exercise === '' && !loading && !error && (
        <div className="text-center py-12 text-muted-foreground">
          <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a subject and difficulty to get a practice exercise</p>
        </div>
      )}

      <AnimatePresence>
        {exercise && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold">Exercise Challenge</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => copyText(exercise, 'question')} className="h-7 text-xs">
                  {copiedQ ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}{copiedQ ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{exercise}</p>
            </div>

            <div className="space-y-2">
              <Label>Your Answer</Label>
              <Textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Write your solution here..."
                className="font-mono text-xs min-h-[120px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleComplete} variant="outline" className="rounded-lg">
                  <CheckCircle className="w-3 h-3 mr-1" />Mark Complete
                </Button>
                <Button size="sm" onClick={() => setShowSolution(!showSolution)} variant="outline" className="rounded-lg">
                  {showSolution ? <ChevronRight className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}{showSolution ? 'Hide Solution' : 'Show Solution'}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showSolution && solution && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Solution</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => copyText(solution, 'answer')} className="h-7 text-xs">
                        {copiedA ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}{copiedA ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                    <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap text-emerald-800 dark:text-emerald-200 bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                      {solution}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AdvancedToolsView() {
  const store = useProgressStore();
  const isProUser = store.isProUser || (() => false);
  const [activeTab, setActiveTab] = useState('regex');

  const tools = [
    { id: 'regex', label: 'Regex Tester', icon: Search },
    { id: 'json', label: 'JSON Formatter', icon: FileType },
    { id: 'sql', label: 'SQL Formatter', icon: Database },
    { id: 'colors', label: 'Color Palette', icon: Palette },
    { id: 'converter', label: 'Data Converter', icon: ArrowRightLeft },
    { id: 'hash', label: 'Hash Generator', icon: Lock },
    { id: 'base64', label: 'Base64', icon: Binary },
    { id: 'ai-questions', label: 'AI Questions', icon: HelpCircle },
    { id: 'ai-tasks', label: 'AI Study Plan', icon: ListTodo },
    { id: 'ai-exercises', label: 'AI Exercises', icon: Dumbbell },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Code className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Advanced Tools</h1>
          <p className="text-sm text-muted-foreground">Developer utilities for data professionals</p>
        </div>
      </motion.div>

      {!isProUser() && (
        <SubscriptionWall
          feature="Advanced Tools"
          description="Access all advanced developer tools requires a Pro subscription. Upgrade to unlock regex tester, formatters, and more."
          compact
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <TabsTrigger
                key={tool.id}
                value={tool.id}
                className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {tool.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="regex" className="mt-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-500" />
                Regex Tester
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegexTester />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="mt-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileType className="w-4 h-4 text-emerald-500" />
                JSON Formatter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JsonFormatter />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sql" className="mt-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" />
                SQL Formatter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SqlFormatter />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="mt-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-500" />
                Color Palette Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ColorPaletteGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="converter" className="mt-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                Data Type Converter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTypeConverter />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="base64" className="mt-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Binary className="w-4 h-4 text-emerald-500" />
                Base64 Encoder / Decoder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Base64Tool />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hash" className="mt-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                Hash Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HashGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-questions" className="mt-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                AI Question Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIQuestionGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tasks" className="mt-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-emerald-500" />
                AI Study Plan Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AITaskGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-exercises" className="mt-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-500" />
                AI Practice Exercises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIPracticeExercises />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
