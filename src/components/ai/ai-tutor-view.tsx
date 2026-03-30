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
import { toast } from 'sonner';

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

function generateTutorFallback(input: string, simple: boolean): string {
  const lower = input.toLowerCase();

  if (lower.includes('sql') || lower.includes('query') || lower.includes('database') || lower.includes('select')) {
    return simple
      ? "SQL is like a magic language for talking to databases! Imagine you have a huge toy box and you want to find all the red cars. You'd say: 'Hey toy box, **SELECT** all toys WHERE color = red'. That's basically SQL!"
      : "**SQL (Structured Query Language)** is the standard language for interacting with relational databases.\n\n**Key Concepts:**\n- `SELECT` - retrieves columns from a table\n- `WHERE` - filters rows based on conditions\n- `JOIN` - combines rows from two or more tables\n- `GROUP BY` - groups rows with same values\n- `ORDER BY` - sorts the result set\n\n**Example:**\n```sql\nSELECT department, COUNT(*) as employee_count, AVG(salary) as avg_salary\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5\nORDER BY avg_salary DESC;\n```\n\n**Tips:** Always use `WHERE` before `GROUP BY`, and `HAVING` after `GROUP BY` for filtering on aggregates.";
  }
  if (lower.includes('python') || lower.includes('pandas') || lower.includes('dataframe') || lower.includes('numpy')) {
    return simple
      ? "Python is like a super-powered calculator! Imagine you have a magic notebook where you can write instructions and it does the math instantly. `pandas` is like having a super-smart assistant that organizes all your data into neat little tables!"
      : "**Python for Data Science** is the most versatile language for analytics.\n\n**Essential Libraries:**\n- `pandas` - Data manipulation with DataFrames\n- `numpy` - Numerical computing and array operations\n- `matplotlib` / `seaborn` - Data visualization\n- `scikit-learn` - Machine learning\n\n**Common Operations:**\n```python\nimport pandas as pd\n\n# Read data\ndf = pd.read_csv('data.csv')\n\n# Filter rows\nhigh_salary = df[df['salary'] > 90000]\n\n# Group and aggregate\nsummary = df.groupby('department')['salary'].agg(['mean', 'median', 'count'])\n\n# Handle missing values\ndf.fillna(df.mean(), inplace=True)\n```\n\n**Pro tip:** Use `df.info()` and `df.describe()` as your first steps when exploring any new dataset.";
  }
  if (lower.includes('excel') || lower.includes('vlookup') || lower.includes('pivot') || lower.includes('spreadsheet')) {
    return simple
      ? "Excel is like a digital piece of graph paper where each little box can hold numbers, words, or formulas! It's like a calculator that remembers everything. You can use special words like VLOOKUP to find things, like searching for a friend's phone number in a list!"
      : "**Advanced Excel for Analytics** goes far beyond basic spreadsheets.\n\n**Must-Know Functions:**\n- `VLOOKUP` / `XLOOKUP` - Find values in a table\n- `INDEX/MATCH` - More flexible lookup alternative\n- `SUMIFS` / `COUNTIFS` - Conditional aggregation\n- `IFERROR` - Graceful error handling\n\n**Power Query** is Excel's ETL tool for data transformation.\n\n**Pivot Tables** allow you to summarize thousands of rows in seconds.\n\n**Example Dashboard Formula:**\n```excel\n=SUMIFS(Sales[Amount], Sales[Region], A2, Sales[Date], ">="&DATE(2025,1,1))\n```\n\n**Tip:** Use Ctrl+T to convert ranges to Tables for dynamic referencing.";
  }
  if (lower.includes('power bi') || lower.includes('dax') || lower.includes('dashboard') || lower.includes('visualization')) {
    return simple
      ? "Power BI is like making a picture book from your numbers! Instead of boring rows and columns, you get colorful charts and graphs that tell a story. Imagine turning your grocery list into a beautiful pie chart showing what you buy most!"
      : "**Power BI** is Microsoft's leading business intelligence tool.\n\n**Core Components:**\n- **Power Query** - Data extraction and transformation (M language)\n- **DAX** - Data Analysis Expressions for custom calculations\n- **Data Model** - Define relationships between tables\n- **Report View** - Build interactive visualizations\n\n**Essential DAX Measures:**\n```dax\nTotal Sales = SUM(Sales[Amount])\nYoY Growth = DIVIDE([Total Sales] - CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date])), CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date])))\n```\n\n**Best Practices:**\n- Use star schema (one fact table + dimension tables)\n- Mark your date table for time intelligence\n- Use bookmarks for interactive storytelling";
  }
  if (lower.includes('statistic') || lower.includes('mean') || lower.includes('probability') || lower.includes('hypothesis')) {
    return simple
      ? "Statistics is like being a detective with numbers! If you have 10 cookies and 3 are chocolate chip, you can figure out the 'average' or 'mean' cookie type. It helps us make smart guesses about things when we don't know everything!"
      : "**Statistics** is the foundation of data analytics.\n\n**Key Measures:**\n- **Mean** - Average value (sensitive to outliers)\n- **Median** - Middle value (robust to outliers)\n- **Standard Deviation** - Measure of spread/dispersion\n- **Correlation** - Relationship between two variables (-1 to 1)\n\n**Hypothesis Testing Steps:**\n1. State null hypothesis (H₀) and alternative (H₁)\n2. Choose significance level (α = 0.05)\n3. Calculate test statistic\n4. Find p-value\n5. If p < α, reject H₀\n\n**Common Tests:**\n- T-test: Compare means of two groups\n- Chi-square: Test categorical associations\n- ANOVA: Compare means of 3+ groups\n\n**Tip:** Always check assumptions (normality, equal variance) before running tests.";
  }
  if (lower.includes('machine learning') || lower.includes('ml') || lower.includes('model') || lower.includes('predict')) {
    return simple
      ? "Machine learning is like teaching a computer to recognize patterns! If you show a computer 100 pictures of cats and 100 pictures of dogs, it learns the difference. Then when you show it a new picture, it can guess: 'That's a cat!'"
      : "**Machine Learning for Data Analysts**\n\n**Types of ML:**\n- **Supervised Learning** - Labeled data (regression, classification)\n- **Unsupervised Learning** - No labels (clustering, dimensionality reduction)\n\n**Workflow:**\n1. Define the problem\n2. Collect and clean data\n3. Feature engineering\n4. Train/test split (typically 80/20)\n5. Train model\n6. Evaluate metrics\n\n**Key Metrics:**\n- Regression: RMSE, MAE, R²\n- Classification: Accuracy, Precision, Recall, F1-Score\n\n```python\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report\n\nmodel = RandomForestClassifier(n_estimators=100)\nmodel.fit(X_train, y_train)\nprint(classification_report(y_test, model.predict(X_test)))\n```";
  }
  if (lower.includes('career') || lower.includes('job') || lower.includes('resume') || lower.includes('interview')) {
    return simple
      ? "Getting a data job is like going on a quest! You need to collect 'skill badges' (learn SQL, Python, Excel), show your 'treasure' (portfolio projects), and then impress the 'gatekeepers' (interviewers) with your knowledge!"
      : "**Career Guide for Data Analytics**\n\n**In-Demand Skills (2025):**\n1. SQL - Every data role requires it\n2. Python/R - For analysis and automation\n3. Data Visualization - Tableau, Power BI\n4. Statistics & A/B Testing\n5. Cloud Platforms - AWS, GCP\n\n**Top Data Roles:**\n- Data Analyst ($65K-$95K)\n- Data Scientist ($95K-$140K)\n- Data Engineer ($110K-$160K)\n- BI Analyst ($70K-$110K)\n\n**Interview Tips:**\n- Practice SQL on LeetCode/HackerRank\n- Build 2-3 portfolio projects\n- Know your statistics fundamentals\n- Prepare case study frameworks\n\n**Portfolio Ideas:**\n- End-to-end sales dashboard\n- Customer churn analysis\n- A/B test analysis with recommendations";
  }

  return simple
    ? "That's a great question! Let me think about it in a simple way. Data analytics is all about finding patterns and stories hidden in numbers. Every time you organize, sort, or compare information, you're doing data analytics! What specific topic would you like to explore more?"
    : "Great question! Here's a structured approach:\n\n**1. Understand the Problem**\nDefine what you're trying to find out clearly.\n\n**2. Gather Data**\nIdentify your data sources and collect relevant datasets.\n\n**3. Clean & Prepare**\nHandle missing values, remove duplicates, standardize formats.\n\n**4. Analyze**\nApply statistical methods, create visualizations, find patterns.\n\n**5. Communicate**\nPresent findings with clear visualizations and actionable recommendations.\n\nWould you like me to dive deeper into any of these steps, or do you have a specific topic in mind? I can help with **SQL**, **Python**, **Excel**, **Power BI**, **Statistics**, or **Machine Learning**.";
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
          context: systemPrompt,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      let reply = data.reply;

      if (!reply || reply.trim() === '') {
        toast.info('AI is busy — showing educational content');
        reply = generateTutorFallback(content, eli5);
      }

      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: reply,
        topics: getSuggestions(reply),
      };

      setMessages(prev => [...prev, aiMsg]);
      setSuggestedTopics(aiMsg.topics || []);
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      const reply = generateTutorFallback(content, eli5);
      const errMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: isTimeout
          ? `⏱️ The AI is taking too long. Here's what I can tell you:\n\n${reply}`
          : `🤖 AI is temporarily unavailable. Here's what I know:\n\n${reply}`,
        topics: getSuggestions(reply),
      };
      setMessages(prev => [...prev, errMsg]);
      setSuggestedTopics(errMsg.topics || []);
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
