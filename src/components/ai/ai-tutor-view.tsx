'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Send, Bot, User, Loader2, Sparkles, Lightbulb, RotateCcw, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  topics?: string[];
}

const QUICK_TOPICS = [
  { label: 'Excel', icon: '📊' },
  { label: 'SQL', icon: '🗃️' },
  { label: 'Python', icon: '🐍' },
  { label: 'Power BI', icon: '📈' },
  { label: 'Statistics', icon: '数学' },
  { label: 'Data Warehousing', icon: '🏗️' },
];

const RELATED_TOPICS_MAP: Record<string, string[]> = {
  sql: ['JOIN Types', 'Window Functions', 'Subqueries', 'Indexing', 'Normalization'],
  excel: ['VLOOKUP', 'Pivot Tables', 'Power Query', 'Macros', 'Conditional Formatting'],
  python: ['Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn', 'Data Cleaning'],
  powerbi: ['DAX', 'Data Modeling', 'Visualizations', 'Power Query', 'Publishing'],
  statistics: ['Descriptive Stats', 'Probability', 'Hypothesis Testing', 'Regression', 'Bayesian'],
};

function formatResponse(text: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    const codeStart = remaining.indexOf('```');
    if (codeStart === -1) {
      parts.push(formatInline(remaining));
      break;
    }

    if (codeStart > 0) {
      parts.push(formatInline(remaining.slice(0, codeStart)));
    }

    const codeEnd = remaining.indexOf('```', codeStart + 3);
    if (codeEnd === -1) {
      parts.push(formatInline(remaining));
      break;
    }

    const codeBlock = remaining.slice(codeStart + 3, codeEnd);
    const langMatch = codeBlock.match(/^(\w+)\n/);
    const code = langMatch ? codeBlock.slice(langMatch[0].length) : codeBlock;
    const lang = langMatch ? langMatch[1] : '';

    parts.push(
      <div key={idx++} className="my-3 rounded-lg bg-gray-900 dark:bg-gray-950 overflow-hidden">
        {lang && (
          <div className="px-4 py-1.5 bg-gray-800 text-xs text-gray-400 font-mono">{lang}</div>
        )}
        <pre className="p-4 overflow-x-auto text-sm text-emerald-300 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    );

    remaining = remaining.slice(codeEnd + 3);
  }

  return parts;
}

function formatInline(text: string): React.ReactNode {
  const result: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    const boldStart = remaining.indexOf('**');
    const codeStart = remaining.indexOf('`');
    let nextMarker = -1;
    let markerType: 'bold' | 'code' | null = null;

    if (boldStart !== -1 && (codeStart === -1 || boldStart < codeStart)) {
      nextMarker = boldStart;
      markerType = 'bold';
    } else if (codeStart !== -1) {
      nextMarker = codeStart;
      markerType = 'code';
    }

    if (nextMarker === -1 || markerType === null) {
      result.push(<span key={idx++}>{remaining}</span>);
      break;
    }

    if (nextMarker > 0) {
      result.push(<span key={idx++}>{remaining.slice(0, nextMarker)}</span>);
    }

    if (markerType === 'bold') {
      const end = remaining.indexOf('**', nextMarker + 2);
      if (end === -1) {
        result.push(<span key={idx++}>{remaining}</span>);
        break;
      }
      result.push(<strong key={idx++}>{remaining.slice(nextMarker + 2, end)}</strong>);
      remaining = remaining.slice(end + 2);
    } else {
      const end = remaining.indexOf('`', nextMarker + 1);
      if (end === -1) {
        result.push(<span key={idx++}>{remaining}</span>);
        break;
      }
      result.push(
        <code key={idx++} className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-mono">
          {remaining.slice(nextMarker + 1, end)}
        </code>
      );
      remaining = remaining.slice(end + 1);
    }
  }

  return result;
}

function getSuggestions(text: string): string[] {
  const lower = text.toLowerCase();
  for (const [key, topics] of Object.entries(RELATED_TOPICS_MAP)) {
    if (lower.includes(key)) return topics.slice(0, 4);
  }
  return ['Getting Started Guide', 'Practice Problems', 'Career Tips', 'Study Plan'];
}

export default function AITutorView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eli5, setEli5] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setSuggestedTopics([]);

    try {
      const conversationMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const systemPrompt = eli5
        ? 'You are a patient, friendly tutor who explains data analytics concepts like I am 5 years old. Use very simple language, fun analogies, and short sentences. Avoid jargon. Make it fun and easy to understand. Keep responses concise.'
        : 'You are an expert data analytics tutor. Provide clear, well-structured answers with code examples when helpful. Use markdown formatting. Be thorough but focused.';

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
          context: systemPrompt,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Sorry, I could not generate a response. Please try again.';

      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: reply,
        topics: getSuggestions(reply),
      };

      setMessages(prev => [...prev, aiMsg]);
      setSuggestedTopics(aiMsg.topics || []);
    } catch {
      const errMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: 'Oops! Something went wrong. Please check your connection and try again.',
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTopicClick = (topic: string) => {
    sendMessage(`Can you explain ${topic}?${eli5 ? ' Explain it simply like I am 5.' : ''}`);
  };

  const clearChat = () => {
    setMessages([]);
    setSuggestedTopics([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Tutor</h1>
            <p className="text-sm text-muted-foreground">Ask anything about data analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={eli5} onCheckedChange={setEli5} id="eli5-toggle" />
            <Label htmlFor="eli5-toggle" className="text-sm flex items-center gap-1.5 cursor-pointer">
              <Baby className="w-3.5 h-3.5" />
              Simple Mode
            </Label>
          </div>
          <Button variant="outline" size="icon" onClick={clearChat} title="Clear Chat">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="bg-muted/30 rounded-2xl border min-h-[400px] max-h-[600px] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full min-h-[350px] text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Hi! I&apos;m your AI Tutor</h2>
              <p className="text-muted-foreground max-w-md">
                {eli5
                  ? "I explain things super simply! Ask me anything about data analytics, Excel, SQL, Python, or more."
                  : "I can help you with data analytics, Excel, SQL, Python, Power BI, statistics, and career advice. Ask me anything!"}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_TOPICS.map(t => (
                <Button key={t.label} variant="outline" size="sm" onClick={() => handleTopicClick(t.label)} className="gap-1.5">
                  <span>{t.icon}</span>
                  {t.label}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-card border'
                )}>
                  {msg.role === 'assistant' ? formatResponse(msg.content) : msg.content}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="bg-card border rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggested Topics */}
      <AnimatePresence>
        {suggestedTopics.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lightbulb className="w-4 h-4" />
              Related Topics
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map(topic => (
                <Badge
                  key={topic}
                  variant="outline"
                  className="cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-300 transition-colors py-1.5 px-3"
                  onClick={() => handleTopicClick(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about data analytics..."
              className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm min-h-[44px] max-h-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-11 w-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
