'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import {
  MessageSquarePlus,
  ThumbsUp,
  Star,
  Award,
  Filter,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  Code,
  Eye,
  User,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = 'SQL' | 'Python' | 'Excel' | 'Power BI' | 'Statistics' | 'Data Engineering' | 'General' | 'Career Advice';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type SortBy = 'newest' | 'active' | 'unanswered';

interface ExpertUser {
  name: string;
  expertise: string;
  avatarColor: string;
  isExpert: boolean;
}

interface Answer {
  id: string;
  author: ExpertUser;
  text: string;
  upvotes: number;
  isBest: boolean;
  createdAt: number;
}

interface Question {
  id: string;
  author: ExpertUser;
  title: string;
  category: Category;
  difficulty: Difficulty;
  description: string;
  codeSnippet: string;
  isAnonymous: boolean;
  answers: Answer[];
  upvotes: number;
  createdAt: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ['SQL', 'Python', 'Excel', 'Power BI', 'Statistics', 'Data Engineering', 'General', 'Career Advice'];
const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  Advanced: 'bg-rose-100 text-rose-700 border-rose-200',
};

const CATEGORY_ICONS: Record<Category, string> = {
  SQL: '🗃️',
  Python: '🐍',
  Excel: '📊',
  'Power BI': '📈',
  Statistics: '📐',
  'Data Engineering': '⚙️',
  General: '💡',
  'Career Advice': '🎯',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const EXPERTS: Record<string, ExpertUser> = {
  sarah_kim: { name: 'Sarah Kim', expertise: 'SQL Expert', avatarColor: '#10b981', isExpert: true },
  alex_chen: { name: 'Alex Chen', expertise: 'Python Pro', avatarColor: '#3b82f6', isExpert: true },
  priya_patel: { name: 'Priya Patel', expertise: 'Excel Wizard', avatarColor: '#8b5cf6', isExpert: true },
  david_lee: { name: 'David Lee', expertise: 'Power BI Specialist', avatarColor: '#f59e0b', isExpert: true },
  mike_johnson: { name: 'Mike Johnson', expertise: 'Data Engineering Pro', avatarColor: '#ef4444', isExpert: true },
  emma_wilson: { name: 'Emma Wilson', expertise: 'Statistics Guru', avatarColor: '#ec4899', isExpert: true },
  jordan_taylor: { name: 'Jordan Taylor', expertise: 'Career Mentor', avatarColor: '#06b6d4', isExpert: true },
  lisa_wang: { name: 'Lisa Wang', expertise: 'General Analyst', avatarColor: '#84cc16', isExpert: false },
};

const NOW = Date.now();

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    author: { ...EXPERTS.lisa_wang, isAnonymous: false },
    title: 'How to use window functions to calculate running totals in SQL?',
    category: 'SQL',
    difficulty: 'Intermediate',
    description:
      'I\'m working on a sales report and need to calculate a running total of revenue by month. I\'ve tried using SUM() with GROUP BY but that gives me the total per month, not a cumulative total.\n\nI know I need to use window functions but I\'m not sure about the exact syntax. Can someone explain the difference between ROWS BETWEEN and RANGE BETWEEN clauses?',
    codeSnippet: `-- What I have so far:\nSELECT \n  order_month,\n  SUM(revenue) as monthly_revenue\nFROM sales\nGROUP BY order_month\nORDER BY order_month;\n\n-- I need a running total column too`,
    isAnonymous: false,
    upvotes: 24,
    createdAt: NOW - 2 * 60 * 60 * 1000,
    answers: [
      {
        id: 'a1-1',
        author: EXPERTS.sarah_kim,
        text: 'Great question! You need to use the `SUM() OVER()` window function with an `ORDER BY` clause. Here\'s the key difference:\n\n- **ROWS BETWEEN** counts physical rows\n- **RANGE BETWEEN** counts logical values (so duplicate values get the same result)\n\nFor running totals, `ROWS UNBOUNDED PRECEDING` is usually what you want.',
        upvotes: 18,
        isBest: true,
        createdAt: NOW - 1.5 * 60 * 60 * 1000,
      },
      {
        id: 'a1-2',
        author: EXPERTS.alex_chen,
        text: 'Adding to Sarah\'s answer — here\'s the exact query you need:\n\n```sql\nSELECT \n  order_month,\n  SUM(revenue) as monthly_revenue,\n  SUM(SUM(revenue)) OVER (\n    ORDER BY order_month\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) as running_total\nFROM sales\nGROUP BY order_month\nORDER BY order_month;\n```\n\nThe trick is nesting `SUM(SUM(revenue))` — the inner SUM is aggregated, the outer SUM is the window function.',
        upvotes: 14,
        isBest: false,
        createdAt: NOW - 1 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 'q2',
    author: { ...EXPERTS.jordan_taylor, isAnonymous: false },
    title: 'Best approach to pivot wide tables in Python pandas?',
    category: 'Python',
    difficulty: 'Intermediate',
    description:
      'I have a long-format dataset with sales data that I need to pivot into a wide format for a report. The data has columns: date, product, region, and revenue.\n\nI want the final table to have dates as rows and product-region combinations as columns. Should I use pandas.pivot(), pandas.pivot_table(), or pandas.melt()? What are the trade-offs?',
    codeSnippet: `import pandas as pd\n\n# Sample data\ndf = pd.DataFrame({\n    'date': ['2025-01', '2025-01', '2025-02', '2025-02'],\n    'product': ['Widget', 'Gadget', 'Widget', 'Gadget'],\n    'region': ['North', 'North', 'South', 'South'],\n    'revenue': [100, 200, 150, 250]\n})\n\n# Need: dates x (product-region) matrix`,
    isAnonymous: false,
    upvotes: 31,
    createdAt: NOW - 5 * 60 * 60 * 1000,
    answers: [
      {
        id: 'a2-1',
        author: EXPERTS.alex_chen,
        text: "For this use case, `pivot_table()` is the most robust choice because it handles duplicate index-column combinations with aggregation.\n\n```python\nwide = df.pivot_table(\n    index='date',\n    columns=['product', 'region'],\n    values='revenue',\n    aggfunc='sum',\n    fill_value=0\n)\n```\n\nKey differences:\n- `pivot()`: Simple reshaping, fails on duplicates\n- `pivot_table()`: Handles duplicates with aggregation (like Excel pivot tables)\n- `melt()`: Does the opposite — wide to long format",
        upvotes: 22,
        isBest: true,
        createdAt: NOW - 4 * 60 * 60 * 1000,
      },
      {
        id: 'a2-2',
        author: EXPERTS.priya_patel,
        text: "I\'d also recommend using `crosstab()` if you just need counts or simple aggregations — it\'s a shortcut for `pivot_table()`.\n\n```python\npd.crosstab(df['date'], [df['product'], df['region']], values=df['revenue'], aggfunc='sum')\n```\n\nBut Alex is right, `pivot_table()` is more flexible for complex scenarios.",
        upvotes: 9,
        isBest: false,
        createdAt: NOW - 3.5 * 60 * 60 * 1000,
      },
      {
        id: 'a2-3',
        author: EXPERTS.mike_johnson,
        text: 'For very large datasets, consider using `pd.pivot_table()` with `dtype` parameter or switching to polars — it\'s significantly faster for pivot operations on big data.',
        upvotes: 6,
        isBest: false,
        createdAt: NOW - 3 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 'q3',
    author: { ...EXPERTS.lisa_wang, isAnonymous: true },
    title: 'Power BI DAX: Calculating year-over-year growth with sameperiodlastyear',
    category: 'Power BI',
    difficulty: 'Advanced',
    description:
      'I\'m trying to calculate YoY revenue growth in a Power BI dashboard but my SAMEPERIODLASTYEAR function is returning BLANK. My date table is marked as a date table and I have a relationship between the fact table and date table.\n\nI think the issue might be with my fiscal calendar. Our fiscal year starts in July, not January. How do I handle this correctly?',
    codeSnippet: `-- My measure (returns BLANK):\nYoY Growth = \nVAR CurrentRevenue = SUM(Sales[Revenue])\nVAR PrevRevenue = CALCULATE(\n    SUM(Sales[Revenue]),\n    SAMEPERIODLASTYEAR('Date'[Date])\n)\nRETURN\nDIVIDE(CurrentRevenue - PrevRevenue, PrevRevenue)`,
    isAnonymous: true,
    upvotes: 19,
    createdAt: NOW - 8 * 60 * 60 * 1000,
    answers: [
      {
        id: 'a3-1',
        author: EXPERTS.david_lee,
        text: "SAMEPERIODLASTYEAR only works with standard calendar years. For fiscal calendars starting in July, you need DATEADD instead:\n\n```dax\nYoY Growth = \nVAR CurrentRevenue = SUM(Sales[Revenue])\nVAR PrevRevenue = CALCULATE(\n    SUM(Sales[Revenue]),\n    DATEADD('Date'[Date], -1, YEAR)\n)\nRETURN\nDIVIDE(CurrentRevenue - PrevRevenue, PrevRevenue)\n```\n\nAlso make sure your date table covers all dates in your data range with no gaps, and verify the relationship is active (single direction from date to fact).",
        upvotes: 15,
        isBest: true,
        createdAt: NOW - 7 * 60 * 60 * 1000,
      },
      {
        id: 'a3-2',
        author: EXPERTS.sarah_kim,
        text: 'Another thing to check — make sure you don\'t have any filters on the report/page level that might be affecting the date context. I\'ve seen this happen when there\'s a slicer on the page that restricts the date range.',
        upvotes: 7,
        isBest: false,
        createdAt: NOW - 6 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 'q4',
    author: EXPERTS.lisa_wang,
    title: 'Excel INDEX-MATCH vs XLOOKUP — which should I learn first?',
    category: 'Excel',
    difficulty: 'Beginner',
    description:
      'I\'m just starting to learn advanced Excel formulas. I\'ve heard that INDEX-MATCH is the gold standard, but I also see people recommending XLOOKUP as a modern replacement.\n\nShould I invest time learning INDEX-MATCH first, or jump straight to XLOOKUP? My workplace uses Microsoft 365 so XLOOKUP is available. Will learning the older approach still help me understand concepts better?',
    codeSnippet: '',
    isAnonymous: false,
    upvotes: 42,
    createdAt: NOW - 12 * 60 * 60 * 1000,
    answers: [
      {
        id: 'a4-1',
        author: EXPERTS.priya_patel,
        text: 'Since you have Microsoft 365, I\'d recommend learning XLOOKUP first — it\'s simpler, more intuitive, and can do everything INDEX-MATCH can do in a single function.\n\n```excel\n=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])\n```\n\nLearn INDEX-MATCH later when you need to understand older workbooks or need maximum flexibility (like two-way lookups without XLOOKUP).',
        upvotes: 28,
        isBest: true,
        createdAt: NOW - 11 * 60 * 60 * 1000,
      },
      {
        id: 'a4-2',
        author: EXPERTS.jordan_taylor,
        text: 'I actually disagree slightly — learn both! INDEX-MATCH teaches you how arrays work conceptually, which is foundational for understanding array formulas, FILTER, SORT, and other dynamic arrays. XLOOKUP is great for quick wins, but INDEX-MATCH gives you deeper Excel knowledge.',
        upvotes: 16,
        isBest: false,
        createdAt: NOW - 10 * 60 * 60 * 1000,
      },
      {
        id: 'a4-3',
        author: EXPERTS.david_lee,
        text: 'Start with VLOOKUP → upgrade to XLOOKUP → then learn INDEX-MATCH. That progression builds understanding naturally and you\'ll appreciate each step more.',
        upvotes: 11,
        isBest: false,
        createdAt: NOW - 9 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 'q5',
    author: { ...EXPERTS.jordan_taylor, isAnonymous: false },
    title: 'Understanding p-values and confidence intervals for A/B test results',
    category: 'Statistics',
    difficulty: 'Intermediate',
    description:
      'I ran an A/B test on our website\'s checkout page. Variant B had a 3.2% conversion rate vs Variant A\'s 2.8%. The p-value is 0.04 and the 95% confidence interval for the difference is [0.1%, 0.7%].\n\nMy manager says this is "statistically significant" and we should ship it. But the difference seems small. How should I interpret these results? Is practical significance different from statistical significance?',
    codeSnippet: `# Test results:\n# Variant A: n=12,500, conversions=350 (2.8%)\n# Variant B: n=12,500, conversions=400 (3.2%)\n# p-value: 0.04\n# 95% CI for difference: [0.1%, 0.7%]\n# Relative lift: +14.3%`,
    isAnonymous: false,
    upvotes: 37,
    createdAt: NOW - 24 * 60 * 60 * 1000,
    answers: [
      {
        id: 'a5-1',
        author: EXPERTS.emma_wilson,
        text: 'This is a great example of the difference between statistical and practical significance!\n\n**Statistical significance** (p < 0.05) just means: "We\'re confident the difference isn\'t due to random chance."\n\n**Practical significance** asks: "Does this difference actually matter for our business?"\n\nWith a CI of [0.1%, 0.7%], the true effect could be as small as 0.1 percentage points. Consider:\n- Sample size: At 12,500 per variant, even tiny effects become "significant"\n- Business impact: Is a 0.1% conversion lift worth the engineering cost?\n- Minimum Detectable Effect: What was your MDE when you designed the test?\n\nMy recommendation: Report the effect size with CI to stakeholders, not just "significant/not significant."',
        upvotes: 31,
        isBest: true,
        createdAt: NOW - 22 * 60 * 60 * 1000,
      },
      {
        id: 'a5-2',
        author: EXPERTS.sarah_kim,
        text: 'Also consider the False Discovery Rate if you\'re running multiple tests simultaneously. With many A/B tests, some will be significant by chance. Consider Bonferroni correction or the Benjamini-Hochberg procedure.',
        upvotes: 12,
        isBest: false,
        createdAt: NOW - 20 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 'q6',
    author: { ...EXPERTS.lisa_wang, isAnonymous: false },
    title: 'ETL vs ELT: When should I use which pattern in data engineering?',
    category: 'Data Engineering',
    difficulty: 'Beginner',
    description:
      'I\'m designing a data pipeline for our company. We currently use a traditional ETL approach with SSIS, but I keep hearing about ELT being the modern approach, especially with cloud data warehouses.\n\nCan someone explain the key differences and when each pattern is appropriate? We\'re using Snowflake as our data warehouse. Should we migrate to ELT?',
    codeSnippet: '',
    isAnonymous: false,
    upvotes: 28,
    createdAt: NOW - 36 * 60 * 60 * 1000,
    answers: [
      {
        id: 'a6-1',
        author: EXPERTS.mike_johnson,
        text: 'Since you\'re on Snowflake, **ELT is definitely the way to go**. Snowflake\'s compute power makes transforming data in-place much more efficient.\n\n**ETL (Extract-Transform-Load):**\n- Transform data before loading to warehouse\n- Good when: target system has limited compute, data needs heavy cleansing\n- Tools: SSIS, Informatica, Talend\n\n**ELT (Extract-Load-Transform):**\n- Load raw data first, transform using warehouse compute\n- Good when: cloud warehouse (Snowflake, BigQuery, Redshift), you want raw data available\n- Tools: dbt, Snowflake tasks, stored procedures\n\nMigration tip: Start by loading raw data alongside your existing ETL, then gradually replace transformations with dbt models.',
        upvotes: 20,
        isBest: true,
        createdAt: NOW - 34 * 60 * 60 * 1000,
      },
      {
        id: 'a6-2',
        author: EXPERTS.alex_chen,
        text: 'I\'d add that ELT also gives you better data lineage and reproducibility. With dbt, your transformations are version-controlled SQL — much easier to debug and maintain than SSIS packages.\n\nOne caveat: if you have strict PII requirements, you might need to do some pre-load masking (partial ETL).',
        upvotes: 13,
        isBest: false,
        createdAt: NOW - 32 * 60 * 60 * 1000,
      },
      {
        id: 'a6-3',
        author: EXPERTS.jordan_taylor,
        text: 'From a career perspective, learning ELT/dbt is one of the highest-ROI skills right now. Almost every modern data team uses it. The dbt certification is also well-regarded.',
        upvotes: 8,
        isBest: false,
        createdAt: NOW - 30 * 60 * 60 * 1000,
      },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PeerReviewView() {
  const store = useProgressStore();
  const userName = store.profile?.name || 'You';

  // State
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [showPostForm, setShowPostForm] = useState(false);

  // Post form state
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<Category>('General');
  const [postDifficulty, setPostDifficulty] = useState<Difficulty>('Beginner');
  const [postDescription, setPostDescription] = useState('');
  const [postCode, setPostCode] = useState('');
  const [postAnonymous, setPostAnonymous] = useState(false);

  // Answer form state
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});

  // Code preview state
  const [expandedCode, setExpandedCode] = useState<Record<string, boolean>>({});

  // ─── Computed ─────────────────────────────────────────────────────────────

  const filteredQuestions = useMemo(() => {
    let result = filterCategory === 'all'
      ? [...questions]
      : questions.filter((q) => q.category === filterCategory);

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'active':
        result.sort((a, b) => b.answers.length - a.answers.length);
        break;
      case 'unanswered':
        result = result.filter((q) => q.answers.length === 0);
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return result;
  }, [questions, sortBy, filterCategory]);

  const totalQuestions = questions.length;
  const totalAnswers = questions.reduce((sum, q) => sum + q.answers.length, 0);
  const yourContributions = questions.filter(
    (q) => !q.isAnonymous && q.author.name === userName
  ).length;

  const topContributors = useMemo(() => {
    const counts: Record<string, { user: ExpertUser; answers: number; upvotes: number }> = {};
    for (const q of questions) {
      const a = q.author;
      const key = a.name;
      if (!counts[key]) counts[key] = { user: a, answers: 0, upvotes: 0 };
      counts[key].upvotes += q.upvotes;
    }
    for (const q of questions) {
      for (const ans of q.answers) {
        const key = ans.author.name;
        if (!counts[key]) counts[key] = { user: ans.author, answers: 0, upvotes: 0 };
        counts[key].answers += 1;
        counts[key].upvotes += ans.upvotes;
      }
    }
    return Object.values(counts)
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 5);
  }, [questions]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handlePostQuestion = () => {
    if (!postTitle.trim()) {
      toast.error('Please enter a title for your question.');
      return;
    }
    if (!postDescription.trim()) {
      toast.error('Please provide a description.');
      return;
    }

    const newQ: Question = {
      id: `q-${Date.now()}`,
      author: {
        name: postAnonymous ? 'Anonymous' : userName,
        expertise: '',
        avatarColor: '#10b981',
        isExpert: false,
      },
      title: postTitle.trim(),
      category: postCategory,
      difficulty: postDifficulty,
      description: postDescription.trim(),
      codeSnippet: postCode.trim(),
      isAnonymous: postAnonymous,
      answers: [],
      upvotes: 0,
      createdAt: Date.now(),
    };

    setQuestions((prev) => [newQ, ...prev]);
    setPostTitle('');
    setPostDescription('');
    setPostCode('');
    setPostAnonymous(false);
    setShowPostForm(false);
    toast.success('Question posted successfully!');
  };

  const handleUpvoteQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q))
    );
  };

  const handleUpvoteAnswer = (qId: string, aId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === aId ? { ...a, upvotes: a.upvotes + 1 } : a
              ),
            }
          : q
      )
    );
  };

  const handleMarkBest = (qId: string, aId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              answers: q.answers.map((a) => ({
                ...a,
                isBest: a.id === aId,
              })),
            }
          : q
      )
    );
    toast.success('Answer marked as best!');
  };

  const handlePostAnswer = (qId: string) => {
    const text = answerTexts[qId]?.trim();
    if (!text) {
      toast.error('Please write an answer before submitting.');
      return;
    }

    const newAnswer = {
      id: `a-${Date.now()}`,
      author: {
        name: userName,
        expertise: '',
        avatarColor: '#10b981',
        isExpert: false,
      },
      text,
      upvotes: 0,
      isBest: false,
      createdAt: Date.now(),
    };

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, answers: [...q.answers, newAnswer] } : q
      )
    );
    setAnswerTexts((prev) => ({ ...prev, [qId]: '' }));
    toast.success('Answer posted!');
  };

  const toggleCodePreview = (id: string) => {
    setExpandedCode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── Sub-components ───────────────────────────────────────────────────────

  const ExpertBadge = ({ user, showName }: { user: ExpertUser; showName?: boolean }) => (
    <div className="flex items-center gap-1.5">
      {showName !== false && (
        <span className="font-semibold text-sm text-gray-800">{user.name}</span>
      )}
      {user.isExpert && (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 gap-0.5">
          <Award className="size-3" />
          {user.expertise}
        </Badge>
      )}
    </div>
  );

  const QuestionCard = ({ question }: { question: Question }) => {
    const isExpanded = expandedId === question.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
      >
        <Card
          className={cn(
            'border overflow-hidden transition-shadow hover:shadow-md',
            isExpanded ? 'border-emerald-300 shadow-lg' : 'border-gray-200'
          )}
        >
          {/* Header */}
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="size-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: question.author.avatarColor }}
                    >
                      <User className="size-3.5" />
                    </div>
                    <ExpertBadge user={question.author} />
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(question.createdAt)}</span>
                </div>
                <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_ICONS[question.category]} {question.category}
                  </Badge>
                  <Badge className={cn('text-xs', DIFFICULTY_COLORS[question.difficulty])}>
                    {question.difficulty}
                  </Badge>
                </div>
                <CardTitle
                  className="text-base font-bold cursor-pointer hover:text-emerald-600 transition-colors leading-snug"
                  onClick={() => setExpandedId(isExpanded ? null : question.id)}
                >
                  {question.title}
                </CardTitle>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquarePlus className="size-3.5" />
                    {question.answers.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="size-3.5" />
                    {question.upvotes}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs p-1 h-7"
                  onClick={() => setExpandedId(isExpanded ? null : question.id)}
                >
                  {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  {isExpanded ? 'Collapse' : 'Expand'}
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Collapsed preview */}
          {!isExpanded && (
            <CardContent className="pt-0 pb-4">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{question.description}</p>
              {question.codeSnippet && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer" onClick={() => setExpandedId(question.id)}>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Code className="size-3.5" />
                    <span>Code snippet</span>
                  </div>
                  <pre className="text-xs text-gray-600 font-mono line-clamp-2 overflow-hidden">
                    {question.codeSnippet}
                  </pre>
                </div>
              )}
            </CardContent>
          )}

          {/* Expanded detail */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100">
                  <CardContent className="pt-4 space-y-5">
                    {/* Upvote + Full description */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600"
                          onClick={() => handleUpvoteQuestion(question.id)}
                        >
                          <ThumbsUp className="size-4" />
                        </Button>
                        <span className="text-sm font-bold text-emerald-600">{question.upvotes}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {question.description}
                        </p>
                      </div>
                    </div>

                    {/* Code snippet */}
                    {question.codeSnippet && (
                      <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Code className="size-3.5" />
                            <span>Code</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-gray-400 hover:text-white p-0"
                            onClick={() => toggleCodePreview(question.id)}
                          >
                            {expandedCode[question.id] ? (
                              <ChevronUp className="size-3.5" />
                            ) : (
                              <ChevronDown className="size-3.5" />
                            )}
                          </Button>
                        </div>
                        <pre
                          className={cn(
                            'p-4 text-sm text-emerald-300 font-mono overflow-x-auto transition-all duration-300',
                            !expandedCode[question.id] && 'max-h-48'
                          )}
                        >
                          {question.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* Answers section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <MessageSquarePlus className="size-4" />
                          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
                        </h3>
                      </div>

                      {/* Answer list */}
                      {question.answers.map((answer, idx) => (
                        <motion.div
                          key={answer.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card
                            className={cn(
                              'border',
                              answer.isBest
                                ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                                : 'border-gray-200'
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      'h-8 w-8 p-0',
                                      answer.isBest
                                        ? 'bg-emerald-100 border-emerald-300 text-emerald-600'
                                        : 'hover:bg-emerald-50 hover:border-emerald-300'
                                    )}
                                    onClick={() => handleUpvoteAnswer(question.id, answer.id)}
                                  >
                                    <ThumbsUp className="size-3.5" />
                                  </Button>
                                  <span className="text-xs font-bold text-gray-600">{answer.upvotes}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="size-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                        style={{ backgroundColor: answer.author.avatarColor }}
                                      >
                                        <User className="size-3" />
                                      </div>
                                      <ExpertBadge user={answer.author} />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {timeAgo(answer.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {answer.text}
                                  </p>
                                  {/* Best answer badge */}
                                  {answer.isBest && (
                                    <Badge className="mt-3 bg-emerald-500 text-white border-emerald-600 text-xs gap-1">
                                      <Star className="size-3" />
                                      Best Answer
                                    </Badge>
                                  )}
                                  {/* Mark as best button */}
                                  {!answer.isBest && !question.isAnonymous && question.author.name === userName && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 h-7"
                                      onClick={() => handleMarkBest(question.id, answer.id)}
                                    >
                                      <Star className="size-3 mr-1" />
                                      Mark as Best Answer
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}

                      {/* Write answer */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <Textarea
                          placeholder="Write your answer..."
                          className="min-h-[80px] resize-y text-sm"
                          value={answerTexts[question.id] || ''}
                          onChange={(e) =>
                            setAnswerTexts((prev) => ({ ...prev, [question.id]: e.target.value }))
                          }
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handlePostAnswer(question.id)}
                          >
                            <MessageSquarePlus className="size-4 mr-1.5" />
                            Submit Answer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquarePlus className="size-7 text-emerald-600" />
            Peer Review & Mentorship
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions, share knowledge, and learn from the community
          </p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setShowPostForm(!showPostForm)}
        >
          <MessageSquarePlus className="size-4 mr-2" />
          Ask a Question
        </Button>
      </div>

      {/* Post form */}
      <AnimatePresence>
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border-emerald-200 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquarePlus className="size-5 text-emerald-600" />
                  Post a Question
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Question title..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select value={postCategory} onValueChange={(v) => setPostCategory(v as Category)}>
                    <SelectTrigger className="text-sm w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_ICONS[cat]} {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    {DIFFICULTIES.map((d) => (
                      <Badge
                        key={d}
                        className={cn(
                          'cursor-pointer text-xs transition-all select-none',
                          postDifficulty === d
                            ? DIFFICULTY_COLORS[d] + ' ring-2 ring-offset-1 ring-emerald-400'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:opacity-80'
                        )}
                        onClick={() => setPostDifficulty(d)}
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="Describe your question in detail... (markdown-like formatting supported)"
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  className="min-h-[100px] resize-y text-sm"
                />
                <Textarea
                  placeholder="Paste code here (optional)..."
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  className="min-h-[60px] resize-y text-sm font-mono bg-gray-50"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="anonymous-check"
                      checked={postAnonymous}
                      onCheckedChange={(checked) => setPostAnonymous(checked === true)}
                    />
                    <label
                      htmlFor="anonymous-check"
                      className="text-xs text-muted-foreground cursor-pointer select-none"
                    >
                      Post anonymously
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPostForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={handlePostQuestion}
                    >
                      Post Question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Sort & filter bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as Category | 'all')}>
                <SelectTrigger className="text-xs w-[160px] h-8">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {([
                { key: 'newest', label: 'Newest', icon: Clock },
                { key: 'active', label: 'Most Active', icon: TrendingUp },
                { key: 'unanswered', label: 'Unanswered', icon: Eye },
              ] as const).map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'text-xs h-7 px-2.5 rounded-md transition-colors',
                    sortBy === key
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'text-muted-foreground hover:text-gray-700'
                  )}
                  onClick={() => setSortBy(key)}
                >
                  <Icon className="size-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-4 max-h-[calc(100vh-340px)] overflow-y-auto pr-1 scrollbar-thin">
            <AnimatePresence mode="popLayout">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => <QuestionCard key={q.id} question={q} />)
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <MessageSquarePlus className="size-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    {sortBy === 'unanswered'
                      ? 'No unanswered questions found'
                      : 'No questions found for this category'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-4">
          {/* Stats card */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-600" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Total Questions', value: totalQuestions, icon: MessageSquarePlus, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Total Answers', value: totalAnswers, icon: ThumbsUp, color: 'text-blue-600 bg-blue-50' },
                { label: 'Your Contributions', value: yourContributions, icon: User, color: 'text-purple-600 bg-purple-50' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('size-7 rounded-lg flex items-center justify-center', color)}>
                      <Icon className="size-3.5" />
                    </div>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <span className="text-sm font-bold">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top contributors card */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="size-4 text-amber-500" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {topContributors.map((contributor, idx) => (
                <div key={contributor.user.name} className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'text-xs font-bold w-5 text-center',
                      idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-muted-foreground'
                    )}
                  >
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div
                    className="size-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: contributor.user.avatarColor }}
                  >
                    {contributor.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold truncate">{contributor.user.name}</span>
                      {contributor.user.isExpert && (
                        <Award className="size-3 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {contributor.answers} answers · {contributor.upvotes} upvotes
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick tips card */}
          <Card className="border-gray-200 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                <Star className="size-4" />
                Tips for Great Questions
              </h3>
              <ul className="space-y-1.5 text-xs text-emerald-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  Include a clear, descriptive title
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  Provide context and what you&apos;ve tried
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  Paste relevant code snippets
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  Set the correct difficulty level
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  Mark the best answer to help others
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
