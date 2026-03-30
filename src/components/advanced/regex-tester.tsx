'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Copy, Check, RotateCcw, BookOpen, Sparkles, Braces } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RegexPattern {
  name: string;
  pattern: string;
  description: string;
  flags: string;
}

const COMMON_PATTERNS: RegexPattern[] = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: 'Standard email address', flags: 'g' },
  { name: 'URL', pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-.,@?^=%&:/~+#]*', description: 'HTTP/HTTPS URL', flags: 'gi' },
  { name: 'Phone (US)', pattern: '\\(?(\\d{3})\\)?[-.\\s]?(\\d{3})[-.\\s]?(\\d{4})', description: 'US phone number', flags: 'g' },
  { name: 'IPv4', pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', description: 'IPv4 address', flags: 'g' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])', description: 'ISO date format', flags: 'g' },
  { name: 'Hex Color', pattern: '#([0-9a-fA-F]{3}){1,2}\\b', description: 'CSS hex color code', flags: 'gi' },
  { name: 'HTML Tag', pattern: '<(/?)([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>', description: 'HTML opening/closing tag', flags: 'gi' },
  { name: 'Number', pattern: '-?\\d+\\.?\\d*', description: 'Integer or decimal number', flags: 'g' },
  { name: 'Username', pattern: '^[a-zA-Z0-9_-]{3,16}$', description: '3-16 char username', flags: '' },
  { name: 'Strong Password', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', description: 'Min 8 chars, upper+lower+digit+special', flags: '' },
  { name: 'Credit Card', pattern: '\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b', description: '16-digit card number', flags: 'g' },
  { name: 'ZIP Code (US)', pattern: '\\b\\d{5}(-\\d{4})?\\b', description: 'US ZIP code', flags: 'g' },
];

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
  groupNames: string[];
}

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState('');

  const loadPattern = useCallback(() => {
    if (!selectedPattern) return;
    const p = COMMON_PATTERNS.find(pp => pp.name === selectedPattern);
    if (p) {
      setPattern(p.pattern);
      setFlags(p.flags || 'g');
      toast.success(`Loaded ${p.name} pattern`);
    }
  }, [selectedPattern]);

  const isValid = useMemo(() => {
    if (!pattern) return true;
    try { new RegExp(pattern, flags); return true; } catch { return false; }
  }, [pattern, flags]);

  const matches = useMemo((): MatchResult[] => {
    if (!pattern || !testString || !isValid) return [];
    try {
      const regex = new RegExp(pattern, flags);
      const results: MatchResult[] = [];
      let m;
      const safeRegex = new RegExp(pattern, flags);
      if (flags.includes('g')) {
        let safety = 0;
        while ((m = safeRegex.exec(testString)) !== null) {
          results.push({ match: m[0], index: m.index, groups: m.slice(1), groupNames: m.groups ? Object.keys(m.groups) : [] });
          if (m[0].length === 0) safeRegex.lastIndex++;
          if (++safety > 200) break;
        }
      } else {
        m = regex.exec(testString);
        if (m) results.push({ match: m[0], index: m.index, groups: m.slice(1), groupNames: m.groups ? Object.keys(m.groups) : [] });
      }
      return results;
    } catch {
      return [];
    }
  }, [pattern, flags, testString, isValid]);

  const highlightParts = useMemo(() => {
    if (matches.length === 0 || !testString || !isValid) return null;
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
  }, [pattern, flags, testString, matches, isValid]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pattern);
    setCopied(true);
    toast.success('Pattern copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const patternInfo = COMMON_PATTERNS.find(p => p.pattern === pattern);

  return (
    <div className="space-y-4">
      {/* Common Patterns */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5" />Common Patterns
          </Label>
          <Select value={selectedPattern} onValueChange={setSelectedPattern}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Choose a pattern..." /></SelectTrigger>
            <SelectContent>
              {COMMON_PATTERNS.map(p => (
                <SelectItem key={p.name} value={p.name}>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">— {p.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={loadPattern} disabled={!selectedPattern} className="h-9 rounded-xl">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />Load
        </Button>
      </div>

      {/* Pattern Input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Regular Expression</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</span>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className={cn('pl-7 pr-7 font-mono text-sm', !isValid && 'border-red-500')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/{flags}</span>
          </div>
          <Select value={flags} onValueChange={setFlags}>
            <SelectTrigger className="w-28 font-mono text-sm h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="g">g (global)</SelectItem>
              <SelectItem value="gi">gi</SelectItem>
              <SelectItem value="gm">gm</SelectItem>
              <SelectItem value="gim">gim</SelectItem>
              <SelectItem value="i">i</SelectItem>
              <SelectItem value="m">m</SelectItem>
            </SelectContent>
          </Select>
          <Button size="icon" variant="outline" onClick={handleCopy} disabled={!pattern} className="shrink-0">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        {patternInfo && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />{patternInfo.description}
          </p>
        )}
        {!isValid && <p className="text-xs text-red-500">Invalid regular expression syntax</p>}
      </div>

      {/* Test String */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Test String</Label>
        <Textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter test string to match against..."
          className="font-mono text-sm min-h-[100px] resize-none"
        />
      </div>

      {/* Highlighted Results */}
      {testString && highlightText && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />Highlighted Matches
            {matches.length > 0 && <Badge variant="secondary" className="text-[10px] h-4">{matches.length} found</Badge>}
          </Label>
          <div className="p-3 rounded-lg bg-muted/30 font-mono text-sm whitespace-pre-wrap break-all border border-border/50">
            {highlightParts ? highlightParts.map((part, i) => (
              <span key={i} className={part.isMatch ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded px-0.5 font-bold' : ''}>
                {part.text}
              </span>
            )) : <span className="text-muted-foreground">No matches found</span>}
          </div>
        </div>
      )}

      {/* Match Groups */}
      {matches.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Braces className="w-3.5 h-3.5" />Match Details
          </Label>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {matches.map((m, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="secondary" className="h-5 text-[10px] shrink-0">#{i + 1}</Badge>
                  <code className="text-xs font-mono text-amber-600 dark:text-amber-400 break-all">&quot;{m.match}&quot;</code>
                  <span className="text-[10px] text-muted-foreground ml-auto shrink-0">pos {m.index}</span>
                </div>
                {m.groups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-7">
                    {m.groups.map((g, gi) => (
                      <Badge key={gi} variant="outline" className="text-[10px] h-5 font-mono">
                        ${gi + 1}: &quot;{g}&quot;
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
