'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Sparkles, Briefcase, TrendingUp, GraduationCap, Target,
  Loader2, MapPin, DollarSign, BarChart3, ArrowRight, CheckCircle2,
  ChevronDown, Code2, Database, Brain, LineChart, Lightbulb, Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SKILLS_LIST = [
  'SQL', 'Python', 'Excel', 'Tableau', 'Power BI', 'R', 'Statistics',
  'Machine Learning', 'Data Visualization', 'ETL', 'Cloud (AWS/GCP)', 'Spark',
  'JavaScript', ' dbt', 'Looker', 'SPSS', 'SAS', 'NoSQL', 'Git', 'Docker',
];

const EXPERIENCE_LEVELS = ['Student / Beginner', '1-2 years', '3-5 years', '5-10 years', '10+ years'];

const CAREER_INTERESTS = [
  'Data Analysis', 'Data Science', 'Business Intelligence', 'Data Engineering',
  'Machine Learning Engineering', 'Analytics Management', 'Data Architecture',
  'Quantitative Analysis', 'Product Analytics', 'Marketing Analytics',
];

interface CareerRecommendation {
  title: string;
  averageSalary: string;
  growth: string;
  outlook: 'Excellent' | 'Good' | 'Moderate';
  requiredSkills: string[];
  description: string;
  nextSteps: string[];
  matchScore: number;
}

const FALLBACK_RECOMMENDATIONS: CareerRecommendation[] = [
  {
    title: 'Data Analyst',
    averageSalary: '$65,000 - $95,000',
    growth: '25% by 2030',
    outlook: 'Excellent',
    requiredSkills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics'],
    description: 'Transform raw data into actionable insights to help businesses make informed decisions.',
    nextSteps: ['Master SQL joins and window functions', 'Build a portfolio with 3+ analysis projects', 'Get certified in Tableau or Power BI', 'Practice with real-world datasets'],
    matchScore: 95,
  },
  {
    title: 'Data Scientist',
    averageSalary: '$95,000 - $145,000',
    growth: '36% by 2030',
    outlook: 'Excellent',
    requiredSkills: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Deep Learning'],
    description: 'Use advanced analytics and ML techniques to solve complex business problems and predict outcomes.',
    nextSteps: ['Learn pandas, scikit-learn, and TensorFlow', 'Study statistics and probability', 'Participate in Kaggle competitions', 'Build ML models for real problems'],
    matchScore: 85,
  },
  {
    title: 'BI Developer',
    averageSalary: '$75,000 - $115,000',
    growth: '20% by 2030',
    outlook: 'Good',
    requiredSkills: ['Power BI', 'Tableau', 'SQL', 'ETL', 'DAX'],
    description: 'Design and develop business intelligence solutions, dashboards, and reporting systems.',
    nextSteps: ['Master Power BI DAX and M', 'Learn data warehousing concepts', 'Build interactive dashboards', 'Study dimensional modeling'],
    matchScore: 80,
  },
  {
    title: 'Data Engineer',
    averageSalary: '$100,000 - $155,000',
    growth: '30% by 2030',
    outlook: 'Excellent',
    requiredSkills: ['Python', 'SQL', 'Spark', 'Cloud (AWS/GCP)', 'ETL', 'Airflow'],
    description: 'Build and maintain the infrastructure that enables data generation, storage, and analysis at scale.',
    nextSteps: ['Learn Apache Spark and Kafka', 'Get cloud certified (AWS/GCP/Azure)', 'Master ETL/ELT pipelines', 'Practice with dbt'],
    matchScore: 75,
  },
  {
    title: 'ML Engineer',
    averageSalary: '$120,000 - $180,000',
    growth: '40% by 2030',
    outlook: 'Excellent',
    requiredSkills: ['Python', 'Machine Learning', 'Docker', 'Cloud (AWS/GCP)', 'MLOps', 'Deep Learning'],
    description: 'Design and deploy machine learning models into production systems at scale.',
    nextSteps: ['Master MLOps tools (MLflow, Kubeflow)', 'Learn containerization and orchestration', 'Build end-to-end ML pipelines', 'Study system design for ML'],
    matchScore: 65,
  },
  {
    title: 'Analytics Manager',
    averageSalary: '$110,000 - $160,000',
    growth: '15% by 2030',
    outlook: 'Good',
    requiredSkills: ['Data Analysis', 'Leadership', 'SQL', 'Communication', 'Strategic Thinking'],
    description: 'Lead analytics teams and drive data-informed decision-making across the organization.',
    nextSteps: ['Develop leadership and communication skills', 'Build cross-functional experience', 'Learn stakeholder management', 'Understand business strategy deeply'],
    matchScore: 60,
  },
];

const OUTLOOK_COLORS = {
  Excellent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const CAREER_ICONS: Record<string, React.ElementType> = {
  'Data Analyst': BarChart3,
  'Data Scientist': Brain,
  'BI Developer': LineChart,
  'Data Engineer': Database,
  'ML Engineer': Code2,
  'Analytics Manager': Users,
};

export default function CareerAdvisorView() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [careerInterests, setCareerInterests] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [skillGap, setSkillGap] = useState<{ have: string[]; need: string[] }>({ have: [], need: [] });
  const [hasResults, setHasResults] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [showInterestPicker, setShowInterestPicker] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setCareerInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const getRecommendations = useCallback(async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }
    if (!experienceLevel) {
      toast.error('Please select your experience level');
      return;
    }
    if (careerInterests.length === 0) {
      toast.error('Please select at least one career interest');
      return;
    }

    setIsGenerating(true);
    setHasResults(false);

    const controller = new AbortController();

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `You are a career advisor for data professionals. Based on this profile:
- Skills: ${selectedSkills.join(', ')}
- Experience: ${experienceLevel}
- Interests: ${careerInterests.join(', ')}

Recommend 3-5 career paths. For each, provide: title, average salary range, growth outlook (Excellent/Good/Moderate), required skills, brief description, and 3-4 actionable next steps. Format each recommendation EXACTLY like this:
---
TITLE: [job title]
SALARY: [range]
GROWTH: [percentage by 2030]
OUTLOOK: [Excellent/Good/Moderate]
SKILLS: [comma separated list]
DESCRIPTION: [2-3 sentences]
STEP1: [first next step]
STEP2: [second next step]
STEP3: [third next step]
STEP4: [fourth next step]
---

Also provide a skill gap analysis. Format:
GAP_HAVE: [skills they already have that are relevant]
GAP_NEED: [skills they need to develop]

Only output the structured data, nothing else.`,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const text = data.message || '';

      // Parse the AI response
      const parsed = parseAIResponse(text);

      if (parsed.recommendations.length > 0) {
        setRecommendations(parsed.recommendations);
        setSkillGap(parsed.skillGap);
      } else {
        // Use fallback
        applyFallback();
      }
    } catch {
      applyFallback();
    } finally {
      setIsGenerating(false);
      setHasResults(true);
    }

    function applyFallback() {
      // Filter and score fallback recommendations based on user's skills
      const scored = FALLBACK_RECOMMENDATIONS.map(rec => {
        const matchedSkills = rec.requiredSkills.filter(s =>
          selectedSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
        );
        const interestMatch = careerInterests.some(ci =>
          rec.title.toLowerCase().includes(ci.toLowerCase().split(' ')[0]) ||
          ci.toLowerCase().includes(rec.title.toLowerCase().split(' ')[0])
        );
        const score = Math.min(99, matchedSkills.length * 20 + (interestMatch ? 30 : 0) + Math.floor(Math.random() * 10));
        return { ...rec, matchScore: score };
      }).sort((a, b) => b.matchScore - a.matchScore);

      setRecommendations(scored.slice(0, 5));

      const allNeeded = scored.flatMap(r => r.requiredSkills);
      const uniqueNeeded = [...new Set(allNeeded)].filter(s =>
        !selectedSkills.some(us => us.toLowerCase() === s.toLowerCase())
      );
      setSkillGap({ have: selectedSkills, need: uniqueNeeded });
    }

    return () => controller.abort();
  }, [selectedSkills, experienceLevel, careerInterests]);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">AI Career Advisor</h1>
          <p className="text-sm text-muted-foreground">Get personalized career path recommendations</p>
        </div>
        <Badge className="ml-auto bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">AI-Powered</Badge>
      </motion.div>

      {/* Input Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/10 dark:to-purple-950/10 overflow-hidden">
          <CardContent className="p-6 space-y-6">
            {/* Skills Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-500" />
                  <h3 className="font-semibold">Your Skills</h3>
                  <Badge variant="secondary" className="text-[10px]">{selectedSkills.length} selected</Badge>
                </div>
                <button onClick={() => setShowSkillPicker(!showSkillPicker)} className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                  {showSkillPicker ? 'Hide' : 'Browse all'}
                  <ChevronDown className={cn('w-3 h-3 transition-transform', showSkillPicker && 'rotate-180')} />
                </button>
              </div>

              {/* Selected skills badges */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map(skill => (
                    <Badge key={skill} className="cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors pr-1" onClick={() => toggleSkill(skill)}>
                      {skill}
                      <span className="ml-1.5 w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-800 flex items-center justify-center text-[10px]">&times;</span>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Skill picker grid */}
              <AnimatePresence>
                {showSkillPicker && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 rounded-xl bg-muted/30 border border-border/30">
                      {SKILLS_LIST.map(skill => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                            selectedSkills.includes(skill)
                              ? 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700'
                              : 'bg-background border-border/50 hover:border-violet-200 dark:hover:border-violet-800'
                          )}
                        >
                          {selectedSkills.includes(skill) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                          {skill}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-500" />
                <h3 className="font-semibold">Experience Level</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setExperienceLevel(level)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                      experienceLevel === level
                        ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                        : 'bg-background border-border/50 hover:border-violet-200 dark:hover:border-violet-800'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Career Interests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-violet-500" />
                  <h3 className="font-semibold">Career Interests</h3>
                  <Badge variant="secondary" className="text-[10px]">{careerInterests.length} selected</Badge>
                </div>
                <button onClick={() => setShowInterestPicker(!showInterestPicker)} className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                  {showInterestPicker ? 'Hide' : 'Browse all'}
                  <ChevronDown className={cn('w-3 h-3 transition-transform', showInterestPicker && 'rotate-180')} />
                </button>
              </div>

              {careerInterests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {careerInterests.map(interest => (
                    <Badge key={interest} className="cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors pr-1" onClick={() => toggleInterest(interest)}>
                      {interest}
                      <span className="ml-1.5 w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-800 flex items-center justify-center text-[10px]">&times;</span>
                    </Badge>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {showInterestPicker && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                      {CAREER_INTERESTS.map(interest => (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                            careerInterests.includes(interest)
                              ? 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700'
                              : 'bg-background border-border/50 hover:border-violet-200 dark:hover:border-violet-800'
                          )}
                        >
                          {careerInterests.includes(interest) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                          {interest}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Button */}
            <Button
              onClick={getRecommendations}
              disabled={isGenerating || selectedSkills.length === 0 || !experienceLevel || careerInterests.length === 0}
              size="lg"
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing your profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {hasResults && recommendations.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Skill Gap Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-violet-200 dark:border-violet-800 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-violet-500" />
                    Skill Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Skills You Have ({skillGap.have.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {skillGap.have.map(skill => (
                        <Badge key={skill} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" />{skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Skills to Develop ({skillGap.need.length})</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {skillGap.need.map(skill => (
                        <Badge key={skill} variant="outline" className="text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-800">
                          <ArrowRight className="w-3 h-3 mr-1" />{skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Career Recommendations */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-violet-500" />
                Recommended Career Paths
              </h3>
              {recommendations.map((rec, i) => {
                const Icon = CAREER_ICONS[rec.title] || Briefcase;
                return (
                  <motion.div key={rec.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                    <Card className="border-border/50 bg-card/50 hover:border-violet-200 dark:hover:border-violet-800 transition-colors overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center shrink-0">
                            <Icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-lg font-bold">{rec.title}</h4>
                              <Badge className={cn('text-[10px]', OUTLOOK_COLORS[rec.outlook])}>
                                {rec.outlook} Outlook
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">{rec.matchScore}% match</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <DollarSign className="w-4 h-4" />{rec.averageSalary}
                              </span>
                              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <TrendingUp className="w-4 h-4" />{rec.growth}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{rec.description}</p>

                            {/* Required Skills */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {rec.requiredSkills.map(skill => {
                                const has = selectedSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                                return (
                                  <Badge key={skill} variant="outline" className={cn(
                                    'text-[10px]',
                                    has && 'border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                                  )}>
                                    {has && <CheckCircle2 className="w-3 h-3 mr-0.5" />}
                                    {skill}
                                  </Badge>
                                );
                              })}
                            </div>

                            {/* Next Steps */}
                            <div className="mt-4 space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">Next Steps</p>
                              {rec.nextSteps.map((step, si) => (
                                <div key={si} className="flex items-start gap-2 text-sm">
                                  <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{si + 1}</span>
                                  <span className="text-muted-foreground">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to parse AI response
function parseAIResponse(text: string): { recommendations: CareerRecommendation[]; skillGap: { have: string[]; need: string[] } } {
  const recs: CareerRecommendation[] = [];

  // Split by the "---" delimiter
  const blocks = text.split('---').filter(b => b.trim());

  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    let title = '', salary = '', growth = '', outlook = 'Good' as const;
    let skills: string[] = [], description = '', nextSteps: string[] = [];

    for (const line of lines) {
      if (line.startsWith('TITLE:')) title = line.replace('TITLE:', '').trim();
      else if (line.startsWith('SALARY:')) salary = line.replace('SALARY:', '').trim();
      else if (line.startsWith('GROWTH:')) growth = line.replace('GROWTH:', '').trim();
      else if (line.startsWith('OUTLOOK:')) outlook = (line.replace('OUTLOOK:', '').trim() as 'Excellent' | 'Good' | 'Moderate') || 'Good';
      else if (line.startsWith('SKILLS:')) skills = line.replace('SKILLS:', '').trim().split(',').map(s => s.trim()).filter(Boolean);
      else if (line.startsWith('DESCRIPTION:')) description = line.replace('DESCRIPTION:', '').trim();
      else if (line.startsWith('STEP')) nextSteps.push(line.replace(/^STEP\d+:/, '').trim());
    }

    if (title) {
      recs.push({
        title, averageSalary: salary || '$60,000 - $100,000', growth: growth || '20% by 2030',
        outlook, requiredSkills: skills.length > 0 ? skills : ['Data Analysis', 'SQL'],
        description: description || 'A rewarding career path in data.',
        nextSteps: nextSteps.length > 0 ? nextSteps : ['Build your portfolio', 'Network with professionals', 'Keep learning'],
        matchScore: 70 + Math.floor(Math.random() * 25),
      });
    }
  }

  let gapHave: string[] = [];
  let gapNeed: string[] = [];

  const gapMatch = text.match(/GAP_HAVE:\s*(.+)/i);
  const needMatch = text.match(/GAP_NEED:\s*(.+)/i);
  if (gapMatch) gapHave = gapMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  if (needMatch) gapNeed = needMatch[1].split(',').map(s => s.trim()).filter(Boolean);

  return { recommendations: recs, skillGap: { have: gapHave, need: gapNeed } };
}
