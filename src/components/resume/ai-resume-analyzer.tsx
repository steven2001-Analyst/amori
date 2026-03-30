'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import { subjects } from '@/lib/study-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  BarChart3,
  Award,
  RefreshCw,
  FileText,
  ChevronRight,
  Zap,
  Shield,
  Lightbulb,
  Trophy,
} from 'lucide-react';

// ─── Types ───
interface ResumeScores {
  content: number;
  structure: number;
  skillsMatch: number;
  impact: number;
  overall: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  competitiveRank: string;
}

type AnalysisStatus = 'idle' | 'analyzing' | 'done' | 'fallback';

// ─── Constants ───
const ACTION_VERBS = [
  'achieved', 'analyzed', 'built', 'collaborated', 'created', 'decreased',
  'delivered', 'designed', 'developed', 'drove', 'executed', 'generated',
  'implemented', 'improved', 'increased', 'launched', 'led', 'managed',
  'optimized', 'orchestrated', 'performed', 'pioneered', 'reduced',
  'resolved', 'scaled', 'simplified', 'streamlined', 'transformed',
  'trained', 'utilized',
];

const SKILLS_KEYWORDS = [
  'sql', 'python', 'r', 'excel', 'power bi', 'tableau', 'pandas', 'numpy',
  'matplotlib', 'seaborn', 'spark', 'hadoop', 'etl', 'data warehouse',
  'data mining', 'machine learning', 'deep learning', 'statistics',
  'regression', 'classification', 'clustering', 'a/b testing', 'hypothesis',
  'visualization', 'dashboard', 'reporting', 'bi', 'analytics',
  'databricks', 'snowflake', 'bigquery', 'azure', 'aws', 'gcp',
  'looker', 'google analytics', 'sas', 'spss', 'vba', 'dax',
  'power query', 'data modeling', 'data pipeline', 'airflow', 'dbt',
  'git', 'jupyter', 'scikit-learn', 'tensorflow', 'pytorch',
  'natural language processing', 'nlp', 'computer vision', 'kafka',
  'api', 'rest', 'json', 'data governance', 'data quality',
];

const SECTION_HEADERS = [
  'experience', 'education', 'skills', 'summary', 'objective',
  'projects', 'certifications', 'awards', 'publications',
  'professional experience', 'work experience', 'academic',
  'languages', 'volunteer', 'leadership', 'technical skills',
  'core competencies', 'professional summary', 'qualifications',
  'research', 'achievements', 'references', 'contact',
];

const METRIC_PATTERNS = [
  /\d+%/, /\$[\d,.]+/, /\d+\s*(million|billion|thousand|k|m|b)/i,
  /increased.*by/i, /decreased.*by/i, /reduced.*by/i, /improved.*by/i,
  /grew.*by/i, /saved.*\$/i, /generated.*\$/i, /managed.*\d+/i,
  /led.*team.*of/i, /drove.*\d+/i, /delivered.*\d+/i, /scaled.*to/i,
  /achieved.*\d+/i, /revenue.*\d+/i, /cost.*saving/i, /roi/i,
  /time.*saving/i, /efficiency.*\d+/i,
];

// ─── Fallback Scoring Engine ───
function calculateFallbackScores(text: string): ResumeScores {
  const lower = text.toLowerCase();
  const lines = text.split('\n').filter((l) => l.trim());
  const words = lower.split(/\s+/);

  // Content Quality (0-100)
  let contentScore = 0;
  const verbMatches = ACTION_VERBS.filter((v) => lower.includes(v));
  contentScore += Math.min(40, verbMatches.length * 5); // Up to 40 for action verbs
  if (words.length > 100) contentScore += 20;
  else if (words.length > 50) contentScore += 12;
  else if (words.length > 20) contentScore += 6;
  if (lower.includes('summary') || lower.includes('objective')) contentScore += 15;
  const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim().length > 5).length;
  if (sentenceCount > 20) contentScore += 25;
  else if (sentenceCount > 10) contentScore += 18;
  else if (sentenceCount > 5) contentScore += 10;
  else contentScore += 4;
  contentScore = Math.min(100, contentScore);

  // Structure (0-100)
  let structureScore = 0;
  const headerMatches = SECTION_HEADERS.filter((h) => lower.includes(h));
  structureScore += Math.min(50, headerMatches.length * 8);
  if (lines.length > 15) structureScore += 20;
  else if (lines.length > 8) structureScore += 12;
  else structureScore += 5;
  const hasBullets = lines.some((l) => /^[•\-–—●◆★]\s/.test(l.trim()) || /^\s*[•\-–—●◆★]/.test(l));
  if (hasBullets) structureScore += 15;
  const hasConsistentSections = headerMatches.length >= 3;
  if (hasConsistentSections) structureScore += 15;
  structureScore = Math.min(100, structureScore);

  // Skills Match (0-100)
  let skillsScore = 0;
  const skillMatches = SKILLS_KEYWORDS.filter((s) => lower.includes(s));
  skillsScore += Math.min(70, skillMatches.length * 6);
  if (skillMatches.length >= 8) skillsScore += 30;
  else if (skillMatches.length >= 5) skillsScore += 20;
  else if (skillMatches.length >= 3) skillsScore += 10;
  else skillsScore += 3;
  skillsScore = Math.min(100, skillsScore);

  // Impact (0-100)
  let impactScore = 0;
  const metricMatches = METRIC_PATTERNS.filter((p) => p.test(text));
  impactScore += Math.min(50, metricMatches.length * 10);
  if (metricMatches.length >= 4) impactScore += 25;
  else if (metricMatches.length >= 2) impactScore += 15;
  else impactScore += 5;
  const hasNumbers = (text.match(/\d+/g) || []).length;
  if (hasNumbers > 10) impactScore += 25;
  else if (hasNumbers > 5) impactScore += 15;
  else impactScore += 5;
  impactScore = Math.min(100, impactScore);

  const overall = Math.round(contentScore * 0.3 + structureScore * 0.2 + skillsScore * 0.25 + impactScore * 0.25);

  // Generate strengths
  const strengths: string[] = [];
  if (verbMatches.length >= 4) strengths.push(`Strong use of action verbs (${verbMatches.length} found)`);
  if (skillMatches.length >= 5) strengths.push(`Solid technical skills coverage (${skillMatches.length} skills)`);
  if (metricMatches.length >= 2) strengths.push('Measurable achievements with quantified results');
  if (headerMatches.length >= 3) strengths.push('Well-organized with clear section structure');
  if (words.length > 100) strengths.push('Substantial content depth');
  if (hasBullets) strengths.push('Uses bullet points for readability');
  if (strengths.length === 0) strengths.push('Resume structure detected');

  // Generate weaknesses
  const weaknesses: string[] = [];
  if (verbMatches.length < 3) weaknesses.push('Add more strong action verbs (e.g., "Led", "Developed", "Increased")');
  if (skillMatches.length < 4) weaknesses.push('Include more data analytics-specific skills');
  if (metricMatches.length < 2) weaknesses.push('Quantify achievements with numbers, percentages, or dollar amounts');
  if (headerMatches.length < 3) weaknesses.push('Add standard resume sections (Experience, Education, Skills)');
  if (words.length < 50) weaknesses.push('Expand content - resume appears too brief');
  if (!lower.includes('summary') && !lower.includes('objective')) weaknesses.push('Add a professional summary at the top');
  if (weaknesses.length === 0) weaknesses.push('Consider adding volunteer experience or certifications');

  // Generate suggestions
  const suggestions: string[] = [];
  if (metricMatches.length < 3) suggestions.push('Transform vague statements into metrics: "Improved efficiency" → "Improved efficiency by 35%, saving 20 hours weekly"');
  if (skillMatches.length < 6) suggestions.push('Add trending skills like Power BI, Python, SQL, Databricks, or dbt');
  if (!lower.includes('power bi') && !lower.includes('tableau')) suggestions.push('Include visualization tools (Power BI, Tableau) to strengthen data analytics profile');
  suggestions.push('Tailor each bullet point to start with a strong action verb');
  if (verbMatches.length < 5) suggestions.push('Replace weak verbs like "helped" or "worked on" with "spearheaded", "orchestrated", or "optimized"');
  if (words.length < 100) suggestions.push('Expand descriptions of projects and achievements to demonstrate depth of experience');

  // Competitive ranking
  let competitiveRank: string;
  if (overall >= 85) competitiveRank = 'Top 10% — Exceptional';
  else if (overall >= 70) competitiveRank = 'Top 25% — Strong Candidate';
  else if (overall >= 55) competitiveRank = 'Top 50% — Competitive';
  else if (overall >= 40) competitiveRank = 'Top 75% — Average';
  else competitiveRank = 'Needs Improvement';

  return {
    content: contentScore,
    structure: structureScore,
    skillsMatch: skillsScore,
    impact: impactScore,
    overall,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    suggestions: suggestions.slice(0, 5),
    competitiveRank,
  };
}

// ─── Parse AI Response ───
function parseAIResponse(reply: string): ResumeScores | null {
  try {
    const getNum = (regex: RegExp): number => {
      const match = reply.match(regex);
      return match ? Math.max(0, Math.min(100, parseInt(match[1], 10) || 0)) : 0;
    };
    const getList = (regex: RegExp): string[] => {
      const match = reply.match(regex);
      if (!match) return [];
      return match[1]
        .split(/,\s*/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    };

    const content = getNum(/CONTENT_SCORE:\s*(\d+)/i);
    const structure = getNum(/STRUCTURE_SCORE:\s*(\d+)/i);
    const skillsMatch = getNum(/SKILLS_SCORE:\s*(\d+)/i);
    const impact = getNum(/IMPACT_SCORE:\s*(\d+)/i);
    const overall = getNum(/OVERALL_SCORE:\s*(\d+)/i);

    if (overall === 0 && content === 0 && structure === 0) return null;

    const strengths = getList(/STRENGTHS:\s*([\s\S]+?)(?=\n[A-Z_]+:|$)/);
    const weaknesses = getList(/WEAKNESSES:\s*([\s\S]+?)(?=\n[A-Z_]+:|$)/);
    const suggestions = getList(/SUGGESTIONS:\s*([\s\S]+?)(?=\n[A-Z_]+:|$)/);

    let competitiveRank: string;
    if (overall >= 85) competitiveRank = 'Top 10% — Exceptional';
    else if (overall >= 70) competitiveRank = 'Top 25% — Strong Candidate';
    else if (overall >= 55) competitiveRank = 'Top 50% — Competitive';
    else if (overall >= 40) competitiveRank = 'Top 75% — Average';
    else competitiveRank = 'Needs Improvement';

    return {
      content,
      structure,
      skillsMatch,
      impact,
      overall: overall || Math.round((content + structure + skillsMatch + impact) / 4),
      strengths: strengths.length > 0 ? strengths : ['Solid resume foundation'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['Minor improvements possible'],
      suggestions: suggestions.length > 0 ? suggestions : ['Continue refining your resume'],
      competitiveRank,
    };
  } catch {
    return null;
  }
}

// ─── Animated Score Gauge ───
function ScoreGauge({ score, size = 160 }: { score: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const scoreColor = score >= 70
    ? 'text-emerald-500'
    : score >= 40
      ? 'text-amber-500'
      : 'text-red-500';

  const strokeColor = score >= 70
    ? '#10b981'
    : score >= 40
      ? '#f59e0b'
      : '#ef4444';

  const glowColor = score >= 70
    ? 'rgba(16, 185, 129, 0.3)'
    : score >= 40
      ? 'rgba(245, 158, 11, 0.3)'
      : 'rgba(239, 68, 68, 0.3)';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn('text-3xl font-bold tabular-nums', scoreColor)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-muted-foreground font-medium mt-0.5">out of 100</span>
      </div>
    </div>
  );
}

// ─── Category Bar ───
function CategoryBar({
  label,
  score,
  icon: Icon,
  color,
}: {
  label: string;
  score: number;
  icon: React.ElementType;
  color: string;
}) {
  const barColor = score >= 70
    ? 'bg-emerald-500'
    : score >= 40
      ? 'bg-amber-500'
      : 'bg-red-400';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', color)}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={cn(
          'text-sm font-bold tabular-nums',
          score >= 70 ? 'text-emerald-600 dark:text-emerald-400'
            : score >= 40 ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-500'
        )}>
          {score}/100
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function AIResumeAnalyzer() {
  const store = useProgressStore();
  const completedTopics = store.completedTopics || [];
  const completedCertificates = store.completedCertificates || [];
  const profile = store.profile || { name: 'Student' };

  const [resumeText, setResumeText] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [scores, setScores] = useState<ResumeScores | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  // Build resume text from store data
  const resumeFromStore = useMemo(() => {
    const certNames = completedCertificates
      .map((cid) => subjects.find((s) => s.id === cid)?.title)
      .filter(Boolean) as string[];

    const topicNames = completedTopics
      .map((tid) => {
        for (const subject of subjects) {
          const topic = subject.topics.find((t) => t.id === tid);
          if (topic) return `${topic.title} (${subject.title})`;
        }
        return null;
      })
      .filter(Boolean) as string[];

    if (certNames.length === 0 && topicNames.length === 0) return '';

    let text = `${profile.name || 'Student'}\n\n`;
    if (certNames.length > 0) {
      text += `CERTIFICATIONS\n${certNames.map((c) => `• ${c}`).join('\n')}\n\n`;
    }
    if (topicNames.length > 0) {
      text += `COMPLETED COURSES & SKILLS\n${topicNames.map((t) => `• ${t}`).join('\n')}\n\n`;
    }
    text += `COMPLETED TOPICS: ${completedTopics.length}\n`;
    return text;
  }, [completedTopics, completedCertificates, profile.name]);

  // ─── Analyze Resume ───
  const analyzeResume = useCallback(async () => {
    const textToAnalyze = resumeText.trim() || resumeFromStore.trim();
    if (!textToAnalyze) {
      toast.error('Please paste your resume text or complete some courses first.');
      return;
    }

    setStatus('analyzing');
    setUsedFallback(false);

    const prompt = `Analyze this resume and score it on a scale of 0-100 for each category:
1. Content Quality (action verbs, quantifiable achievements)
2. Structure (clear sections, logical flow)
3. Skills Match (data analytics skills: SQL, Python, Excel, Power BI, etc.)
4. Impact (measurable results, business outcomes)

Resume:
${textToAnalyze}

Respond in this format:
CONTENT_SCORE: 0-100
STRUCTURE_SCORE: 0-100
SKILLS_SCORE: 0-100
IMPACT_SCORE: 0-100
OVERALL_SCORE: 0-100
STRENGTHS: 3 comma-separated strengths
WEAKNESSES: 3 comma-separated areas for improvement
SUGGESTIONS: 3 comma-separated actionable suggestions`;

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: 'resume-analyzer' }),
      });
      const data = await res.json();

      if (data.reply) {
        const parsed = parseAIResponse(data.reply);
        if (parsed) {
          setScores(parsed);
          setStatus('done');
          toast.success('Resume analyzed successfully!');
          return;
        }
      }

      // AI response couldn't be parsed — use fallback
      throw new Error('Could not parse AI response');
    } catch {
      // Fallback to keyword-based scoring
      const fallbackScores = calculateFallbackScores(textToAnalyze);
      setScores(fallbackScores);
      setUsedFallback(true);
      setStatus('fallback');
      toast.success('Resume scored using keyword analysis!');
    }
  }, [resumeText, resumeFromStore]);

  const resetAnalyzer = useCallback(() => {
    setStatus('idle');
    setScores(null);
    setUsedFallback(false);
  }, []);

  const handleLoadFromStore = useCallback(() => {
    if (resumeFromStore) {
      setResumeText(resumeFromStore);
      toast.success('Loaded learning progress as resume text!');
    } else {
      toast.error('No learning progress found. Start studying to build your resume!');
    }
  }, [resumeFromStore]);

  // ─── Render ───
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Resume Analyzer</h2>
            <p className="text-xs text-muted-foreground">Get instant AI-powered resume feedback</p>
          </div>
        </div>
        {status !== 'idle' && (
          <Button variant="outline" size="sm" onClick={resetAnalyzer} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Input Section */}
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Paste Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Paste your resume text here, or click 'Load from Progress' to use your DataTrack learning data..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[200px] text-sm resize-y"
                />
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadFromStore}
                      className="gap-1.5 text-xs"
                      disabled={!resumeFromStore}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Load from Progress
                    </Button>
                    {resumeFromStore && (
                      <span className="text-[10px] text-muted-foreground">
                        {completedTopics.length} topics, {completedCertificates.length} certs available
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={analyzeResume}
                    disabled={(!resumeText.trim() && !resumeFromStore.trim())}
                    className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    <Brain className="w-4 h-4" />
                    Analyze Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {status === 'analyzing' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="relative mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-4 border-muted border-t-emerald-500"
              />
              <Brain className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="font-semibold text-base mb-1">Analyzing Your Resume</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AI is evaluating content, structure, skills, and impact...
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              This may take a few seconds
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {(status === 'done' || status === 'fallback') && scores && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Fallback Notice */}
            {usedFallback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs text-amber-700 dark:text-amber-400">
                  AI scoring is temporarily unavailable. Results are based on keyword analysis.
                </span>
              </motion.div>
            )}

            {/* Overall Score + Competitive Rank */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">Overall Score</h3>
                  <ScoreGauge score={scores.overall} size={170} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 text-center"
                  >
                    <Badge
                      className={cn(
                        'px-3 py-1 text-xs font-semibold',
                        scores.overall >= 70
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : scores.overall >= 40
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      )}
                    >
                      {scores.competitiveRank}
                    </Badge>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Category Scores */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-2">
                  <CategoryBar
                    label="Content Quality"
                    score={scores.content}
                    icon={FileText}
                    color="bg-emerald-500"
                  />
                  <CategoryBar
                    label="Structure"
                    score={scores.structure}
                    icon={Target}
                    color="bg-teal-500"
                  />
                  <CategoryBar
                    label="Skills Match"
                    score={scores.skillsMatch}
                    icon={Zap}
                    color="bg-cyan-500"
                  />
                  <CategoryBar
                    label="Impact"
                    score={scores.impact}
                    icon={TrendingUp}
                    color="bg-amber-500"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strengths */}
              <Card className="border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/30 dark:bg-emerald-950/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {scores.strengths.map((strength, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card className="border-amber-200/50 dark:border-amber-800/30 bg-amber-50/30 dark:bg-amber-950/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {scores.weaknesses.map((weakness, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Suggestions */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5 text-white" />
                  </div>
                  Actionable Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {scores.suggestions.map((suggestion, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 + i * 0.1 }}
                      className={cn(
                        'p-3 rounded-xl border transition-all duration-200',
                        'bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20',
                        'border-emerald-200/40 dark:border-emerald-800/30',
                        'hover:border-emerald-300 dark:hover:border-emerald-700',
                        'hover:shadow-sm'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                          <ChevronRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-xs leading-relaxed">{suggestion}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitive Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <Card className="border-border/50 bg-gradient-to-r from-emerald-50/50 via-teal-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Competitive Analysis</h3>
                        <p className="text-xs text-muted-foreground">How you compare to typical applicants</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-lg font-bold',
                        scores.overall >= 70
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : scores.overall >= 40
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-500'
                      )}>
                        {scores.competitiveRank}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] text-muted-foreground font-medium">Your Score</span>
                      <span className="text-[10px] text-muted-foreground font-medium ml-auto">Top Performers</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          scores.overall >= 70
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                            : scores.overall >= 40
                              ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                              : 'bg-gradient-to-r from-red-300 to-red-500'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${scores.overall}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                      />
                      {/* Average line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground/20"
                        style={{ left: '65%' }}
                        title="Average applicant: 65%"
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] text-muted-foreground">0</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Re-analyze button */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={analyzeResume}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Re-analyze Resume
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State (before analysis) */}
      {status === 'idle' && !scores && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {[
            {
              icon: FileText,
              label: 'Content Quality',
              desc: 'Action verbs, achievements, depth',
              color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
            },
            {
              icon: Target,
              label: 'Structure',
              desc: 'Clear sections, logical flow',
              color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
            },
            {
              icon: Zap,
              label: 'Skills Match',
              desc: 'Data analytics skills presence',
              color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
            },
            {
              icon: TrendingUp,
              label: 'Impact',
              desc: 'Measurable results, business value',
              color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
            },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.label}
                whileHover={{ y: -2, scale: 1.02 }}
                className="p-4 rounded-xl border border-border/50 bg-card hover:shadow-md transition-shadow"
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', cat.color)}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-sm font-semibold mb-1">{cat.label}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{cat.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
