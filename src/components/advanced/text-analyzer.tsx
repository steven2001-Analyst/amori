'use client';

import React, { useState, useMemo } from 'react';
import { FileText, Copy, Check, RotateCcw, CaseSensitive, Type, AlignLeft, BarChart3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}

function analyzeText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: 0,
      speakingTime: 0,
      avgWordLength: 0,
      avgSentenceLength: 0,
      longestWord: '',
      frequentWords: [] as WordFrequency[],
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length || (trimmed.length > 0 ? 1 : 0);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const speakingTime = Math.max(1, Math.ceil(wordCount / 130));

  const avgWordLength = wordCount > 0
    ? (words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z0-9]/g, '').length, 0) / wordCount).toFixed(1)
    : '0';

  const avgSentenceLength = sentenceCount > 0
    ? (wordCount / sentenceCount).toFixed(1)
    : '0';

  const cleanWords = words.map(w => w.toLowerCase().replace(/[^a-z0-9'-]/g, '')).filter(Boolean);

  const longestWord = cleanWords.reduce((longest, w) => w.length > longest.length ? w : longest, '');

  const freqMap = new Map<string, number>();
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'if', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'only', 'same', 'than', 'too', 'very', 'just', 'about']);
  cleanWords.forEach(w => {
    if (w.length < 2 || stopWords.has(w)) return;
    freqMap.set(w, (freqMap.get(w) || 0) + 1);
  });

  const frequentWords: WordFrequency[] = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({
      word,
      count,
      percentage: Number(((count / Math.max(cleanWords.length, 1)) * 100).toFixed(1)),
    }));

  return {
    characters,
    charactersNoSpaces,
    words: wordCount,
    sentences: sentenceCount,
    paragraphs: paragraphCount,
    readingTime,
    speakingTime,
    avgWordLength,
    avgSentenceLength,
    longestWord,
    frequentWords,
  };
}

function toUpperCase(text: string): string { return text.toUpperCase(); }
function toLowerCase(text: string): string { return text.toLowerCase(); }
function toTitleCase(text: string): string {
  return text.replace(/\b\w/g, c => c.toUpperCase()).replace(/\s+/g, ' ').trim();
}
function toSentenceCase(text: string): string {
  return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
}
function removeExtraSpaces(text: string): string {
  return text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').replace(/^\s+|\s+$/gm, '').trim();
}

export default function TextAnalyzerTool() {
  const [text, setText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => analyzeText(text), [text]);

  const handleCaseChange = (fn: (t: string) => string) => {
    const result = fn(text);
    setProcessedText(result);
    setText(result);
    toast.success('Text converted');
  };

  const handleRemoveSpaces = () => {
    const result = removeExtraSpaces(text);
    setProcessedText(result);
    setText(result);
    toast.success('Extra spaces removed');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
    setProcessedText('');
  };

  const statCards = [
    { label: 'Words', value: stats.words, icon: Type },
    { label: 'Characters', value: stats.characters, icon: FileText },
    { label: 'No Spaces', value: stats.charactersNoSpaces, icon: AlignLeft },
    { label: 'Sentences', value: stats.sentences, icon: AlignLeft },
    { label: 'Paragraphs', value: stats.paragraphs, icon: AlignLeft },
    { label: 'Reading', value: `${stats.readingTime} min`, icon: BarChart3 },
    { label: 'Speaking', value: `${stats.speakingTime} min`, icon: BarChart3 },
    { label: 'Avg Word', value: stats.avgWordLength, icon: Type },
  ];

  return (
    <div className="space-y-4">
      {/* Text Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Enter Your Text</Label>
          <div className="flex gap-1">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleClear} disabled={!text} className="h-7 text-xs">
                    <Trash2 className="w-3 h-3 mr-1" />Clear
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear all text</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="sm" onClick={() => handleCopy(text)} disabled={!text} className="h-7 text-xs">
              {copied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
              Copy
            </Button>
          </div>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here to analyze..."
          className="text-sm min-h-[180px] resize-none"
        />
      </div>

      {/* Stats Grid */}
      {text.trim() && (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/20 border border-border/50">
                  <Icon className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Additional Stats */}
          <div className="flex flex-wrap gap-3 text-xs">
            {stats.longestWord && (
              <Badge variant="secondary" className="text-[10px] h-5">
                Longest word: <span className="font-mono font-bold">{stats.longestWord}</span> ({stats.longestWord.length})
              </Badge>
            )}
            <Badge variant="secondary" className="text-[10px] h-5">
              Avg sentence: <span className="font-bold">{stats.avgSentenceLength}</span> words
            </Badge>
          </div>
        </>
      )}

      {/* Case Converter Buttons */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <CaseSensitive className="w-3.5 h-3.5" />Case Converter
        </Label>
        <div className="flex flex-wrap gap-2">
          <TooltipProvider delayDuration={0}>
            {[
              { label: 'UPPER', fn: toUpperCase },
              { label: 'lower', fn: toLowerCase },
              { label: 'Title Case', fn: toTitleCase },
              { label: 'Sentence case', fn: toSentenceCase },
            ].map(({ label, fn }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCaseChange(fn)}
                    disabled={!text}
                    className="h-8 text-xs rounded-lg"
                  >
                    {label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Convert to {label}</TooltipContent>
              </Tooltip>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSpaces}
                  disabled={!text}
                  className="h-8 text-xs rounded-lg"
                >
                  Remove Extra Spaces
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove duplicate spaces and blank lines</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Processed Output */}
      {processedText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Processed Result</Label>
            <Button size="sm" variant="ghost" onClick={() => handleCopy(processedText)} className="h-7 text-xs">
              <Copy className="w-3 h-3 mr-1" />Copy
            </Button>
          </div>
          <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-sm max-h-[160px] overflow-y-auto whitespace-pre-wrap">
            {processedText}
          </div>
        </div>
      )}

      {/* Word Frequency */}
      {stats.frequentWords.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Most Frequent Words (excluding stop words)</Label>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {stats.frequentWords.map((item, i) => (
              <div key={item.word} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20">
                <span className="w-5 text-[10px] text-muted-foreground text-right shrink-0">{i + 1}</span>
                <span className="font-mono text-sm font-medium flex-1">{item.word}</span>
                <div className="w-24 h-2 rounded-full bg-muted overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${Math.min(100, item.percentage * 3)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right shrink-0">{item.count}</span>
                <span className="text-[10px] text-muted-foreground w-10 text-right shrink-0">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
