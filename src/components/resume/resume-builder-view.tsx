'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import { subjects } from '@/lib/study-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Plus,
  X,
  Sparkles,
  Download,
  LayoutTemplate,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  GraduationCap,
  Briefcase,
  Award,
  FolderGit2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  Printer,
  Save,
  Upload,
  Target,
  ArrowUp,
  ArrowDown,
  Languages,
  BookOpen,
  Heart,
  Layers,
  Lightbulb,
  Shield,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Wand2,
} from 'lucide-react';

// ─── Types ───
interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  year: string;
  gpa: string;
}

interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  dates: string;
  bullets: string[];
}

interface LanguageEntry {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Intermediate' | 'Basic';
}

interface PublicationEntry {
  id: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
}

interface VolunteerEntry {
  id: string;
  org: string;
  role: string;
  dates: string;
  description: string;
}

interface CustomSection {
  id: string;
  title: string;
  content: string;
}

type TemplateType = 'modern' | 'classic' | 'creative';

type SectionId =
  | 'personal'
  | 'summary'
  | 'skills'
  | 'education'
  | 'experience'
  | 'certifications'
  | 'languages'
  | 'publications'
  | 'volunteer'
  | 'custom';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  website: string;
  summary: string;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  certifications: string[];
  languages: LanguageEntry[];
  publications: PublicationEntry[];
  volunteer: VolunteerEntry[];
  customSections: CustomSection[];
}

const defaultResume: ResumeData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  portfolio: '',
  website: '',
  summary: '',
  skills: [],
  education: [],
  experience: [],
  certifications: [],
  languages: [],
  publications: [],
  volunteer: [],
  customSections: [],
};

// ─── Section Order ───
const defaultSectionOrder: SectionId[] = [
  'personal',
  'summary',
  'skills',
  'experience',
  'education',
  'certifications',
  'languages',
  'publications',
  'volunteer',
  'custom',
];

// ─── Score Calculation ───
function calculateResumeScore(data: ResumeData): number {
  let score = 0;
  const maxScore = 100;
  const weights = [
    { filled: !!data.name, w: 8 },
    { filled: !!data.email, w: 6 },
    { filled: !!data.phone, w: 4 },
    { filled: !!data.location, w: 4 },
    { filled: !!data.linkedin, w: 3 },
    { filled: !!data.summary, w: 15 },
    { filled: data.skills.length >= 3, w: 12 },
    { filled: data.experience.length >= 1, w: 15 },
    { filled: data.education.length >= 1, w: 10 },
    { filled: data.certifications.length >= 1, w: 5 },
    { filled: data.languages.length >= 1, w: 4 },
    { filled: data.volunteer.length >= 1, w: 4 },
    { filled: data.publications.length >= 1, w: 3 },
    { filled: data.experience.some((e) => e.bullets.filter((b) => b.trim()).length >= 2), w: 7 },
  ];
  for (const item of weights) {
    if (item.filled) score += item.w;
  }
  return Math.min(score, maxScore);
}

// ─── ATS Tips ───
function getATSTips(data: ResumeData): { tip: string; type: 'good' | 'warn' | 'bad' }[] {
  const tips: { tip: string; type: 'good' | 'warn' | 'bad' }[] = [];

  if (data.name && data.email && data.phone) {
    tips.push({ tip: 'Contact information is complete — ATS systems can parse your details easily.', type: 'good' });
  } else {
    tips.push({ tip: 'Missing contact fields may cause ATS parsing failures. Fill in name, email, and phone.', type: 'bad' });
  }

  if (data.summary && data.summary.length > 50) {
    tips.push({ tip: 'Professional summary is substantial — good for ATS keyword matching.', type: 'good' });
  } else if (!data.summary) {
    tips.push({ tip: 'Add a professional summary (50+ words) to improve keyword density for ATS.', type: 'bad' });
  } else {
    tips.push({ tip: 'Expand your summary to 50+ words with relevant keywords for better ATS matching.', type: 'warn' });
  }

  if (data.skills.length >= 6) {
    tips.push({ tip: `Strong skills section with ${data.skills.length} skills — excellent for ATS keyword scanning.`, type: 'good' });
  } else if (data.skills.length > 0) {
    tips.push({ tip: `Only ${data.skills.length} skills listed. Add 6-10 skills to improve ATS keyword density.`, type: 'warn' });
  } else {
    tips.push({ tip: 'No skills listed — this is a critical ATS section. Add relevant technical and soft skills.', type: 'bad' });
  }

  const totalBullets = data.experience.reduce((sum, e) => sum + e.bullets.filter((b) => b.trim()).length, 0);
  if (totalBullets >= 8) {
    tips.push({ tip: `Experience section has ${totalBullets} bullet points — good detail level for ATS.`, type: 'good' });
  } else if (data.experience.length > 0) {
    tips.push({ tip: 'Use action verbs and quantified achievements in bullet points (e.g., "Increased sales by 25%").', type: 'warn' });
  }

  if (data.education.length > 0) {
    tips.push({ tip: 'Education section present — ensures ATS compatibility with degree requirements.', type: 'good' });
  } else {
    tips.push({ tip: 'Add education to pass ATS degree filtering for most positions.', type: 'bad' });
  }

  const hasQuantified = data.experience.some((e) =>
    e.bullets.some((b) => /\d+[%|$|,]|increased|decreased|reduced|improved/i.test(b))
  );
  if (hasQuantified) {
    tips.push({ tip: 'Metrics detected in bullet points — quantified results boost ATS scoring.', type: 'good' });
  } else if (data.experience.length > 0) {
    tips.push({ tip: 'Add quantified achievements (numbers, percentages, dollar amounts) to strengthen impact.', type: 'warn' });
  }

  tips.push({ tip: 'Use standard section headers like "Experience", "Education", "Skills" for ATS parsing.', type: 'good' });
  tips.push({ tip: 'Avoid tables, graphics, and columns in your final PDF — ATS scanners prefer simple layouts.', type: 'good' });

  return tips;
}

// ─── Main Component ───
export default function ResumeBuilderView() {
  const store = useProgressStore();
  const profile = store.profile || { name: 'Steven', email: '' };
  const completedCertificates = store.completedCertificates || [];
  const projects = store.projects || [];

  const [resume, setResume] = useState<ResumeData>({
    ...defaultResume,
    name: profile.name || '',
    email: profile.email || '',
  });
  const [template, setTemplate] = useState<TemplateType>('modern');
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFullLoading, setAiFullLoading] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [activeFormSection, setActiveFormSection] = useState<string | null>('personal');
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>([...defaultSectionOrder]);
  const [aiJobTitle, setAiJobTitle] = useState('');
  const [showAiFullDialog, setShowAiFullDialog] = useState(false);
  const [atsTips, setAtsTips] = useState<{ tip: string; type: 'good' | 'warn' | 'bad' }[]>([]);
  const [atsTipsShown, setAtsTipsShown] = useState(false);

  const certificatesList = completedCertificates
    .map((cid) => subjects.find((s) => s.id === cid))
    .filter(Boolean);

  const resumeScore = useMemo(() => calculateResumeScore(resume), [resume]);

  const scoreColor = resumeScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : resumeScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500';

  // ─── Helpers ───
  const updateResume = useCallback((updates: Partial<ResumeData>) => {
    setResume((prev) => ({ ...prev, ...updates }));
  }, []);

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (trimmed && !resume.skills.includes(trimmed)) {
      updateResume({ skills: [...resume.skills, trimmed] });
      setSkillInput('');
    }
  }, [skillInput, resume.skills, updateResume]);

  const removeSkill = useCallback(
    (skill: string) => {
      updateResume({ skills: resume.skills.filter((s) => s !== skill) });
    },
    [resume.skills, updateResume]
  );

  const addCertification = useCallback(() => {
    const trimmed = certInput.trim();
    if (trimmed && !resume.certifications.includes(trimmed)) {
      updateResume({ certifications: [...resume.certifications, trimmed] });
      setCertInput('');
    }
  }, [certInput, resume.certifications, updateResume]);

  const removeCertification = useCallback(
    (cert: string) => {
      updateResume({ certifications: resume.certifications.filter((c) => c !== cert) });
    },
    [resume.certifications, updateResume]
  );

  // Education helpers
  const addEducation = useCallback(() => {
    const entry: EducationEntry = { id: `edu-${Date.now()}`, school: '', degree: '', year: '', gpa: '' };
    updateResume({ education: [...resume.education, entry] });
  }, [resume.education, updateResume]);

  const updateEducation = useCallback(
    (id: string, field: keyof EducationEntry, value: string) => {
      updateResume({ education: resume.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)) });
    },
    [resume.education, updateResume]
  );

  const removeEducation = useCallback(
    (id: string) => {
      updateResume({ education: resume.education.filter((e) => e.id !== id) });
    },
    [resume.education, updateResume]
  );

  // Experience helpers
  const addExperience = useCallback(() => {
    const entry: ExperienceEntry = { id: `exp-${Date.now()}`, company: '', role: '', dates: '', bullets: [''] };
    updateResume({ experience: [...resume.experience, entry] });
  }, [resume.experience, updateResume]);

  const updateExperience = useCallback(
    (id: string, field: keyof ExperienceEntry, value: string | string[]) => {
      updateResume({ experience: resume.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)) });
    },
    [resume.experience, updateResume]
  );

  const updateBullet = useCallback(
    (expId: string, bulletIdx: number, value: string) => {
      updateResume({
        experience: resume.experience.map((e) =>
          e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => (i === bulletIdx ? value : b)) } : e
        ),
      });
    },
    [resume.experience, updateResume]
  );

  const addBullet = useCallback(
    (expId: string) => {
      updateResume({
        experience: resume.experience.map((e) => (e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e)),
      });
    },
    [resume.experience, updateResume]
  );

  const removeBullet = useCallback(
    (expId: string, bulletIdx: number) => {
      updateResume({
        experience: resume.experience.map((e) =>
          e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIdx) } : e
        ),
      });
    },
    [resume.experience, updateResume]
  );

  const removeExperience = useCallback(
    (id: string) => {
      updateResume({ experience: resume.experience.filter((e) => e.id !== id) });
    },
    [resume.experience, updateResume]
  );

  // Language helpers
  const addLanguage = useCallback(() => {
    const entry: LanguageEntry = { id: `lang-${Date.now()}`, language: '', proficiency: 'Intermediate' };
    updateResume({ languages: [...resume.languages, entry] });
  }, [resume.languages, updateResume]);

  const updateLanguage = useCallback(
    (id: string, field: keyof LanguageEntry, value: string) => {
      updateResume({ languages: resume.languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)) });
    },
    [resume.languages, updateResume]
  );

  const removeLanguage = useCallback(
    (id: string) => {
      updateResume({ languages: resume.languages.filter((l) => l.id !== id) });
    },
    [resume.languages, updateResume]
  );

  // Publication helpers
  const addPublication = useCallback(() => {
    const entry: PublicationEntry = { id: `pub-${Date.now()}`, title: '', publisher: '', year: '', url: '' };
    updateResume({ publications: [...resume.publications, entry] });
  }, [resume.publications, updateResume]);

  const updatePublication = useCallback(
    (id: string, field: keyof PublicationEntry, value: string) => {
      updateResume({ publications: resume.publications.map((p) => (p.id === id ? { ...p, [field]: value } : p)) });
    },
    [resume.publications, updateResume]
  );

  const removePublication = useCallback(
    (id: string) => {
      updateResume({ publications: resume.publications.filter((p) => p.id !== id) });
    },
    [resume.publications, updateResume]
  );

  // Volunteer helpers
  const addVolunteer = useCallback(() => {
    const entry: VolunteerEntry = { id: `vol-${Date.now()}`, org: '', role: '', dates: '', description: '' };
    updateResume({ volunteer: [...resume.volunteer, entry] });
  }, [resume.volunteer, updateResume]);

  const updateVolunteer = useCallback(
    (id: string, field: keyof VolunteerEntry, value: string) => {
      updateResume({ volunteer: resume.volunteer.map((v) => (v.id === id ? { ...v, [field]: value } : v)) });
    },
    [resume.volunteer, updateResume]
  );

  const removeVolunteer = useCallback(
    (id: string) => {
      updateResume({ volunteer: resume.volunteer.filter((v) => v.id !== id) });
    },
    [resume.volunteer, updateResume]
  );

  // Custom section helpers
  const addCustomSection = useCallback(() => {
    const entry: CustomSection = { id: `custom-${Date.now()}`, title: 'Custom Section', content: '' };
    updateResume({ customSections: [...resume.customSections, entry] });
  }, [resume.customSections, updateResume]);

  const updateCustomSection = useCallback(
    (id: string, field: keyof CustomSection, value: string) => {
      updateResume({ customSections: resume.customSections.map((s) => (s.id === id ? { ...s, [field]: value } : s)) });
    },
    [resume.customSections, updateResume]
  );

  const removeCustomSection = useCallback(
    (id: string) => {
      updateResume({ customSections: resume.customSections.filter((s) => s.id !== id) });
    },
    [resume.customSections, updateResume]
  );

  // Section reorder
  const moveSection = useCallback((idx: number, dir: 'up' | 'down') => {
    setSectionOrder((prev) => {
      const next = [...prev];
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  // ─── AI Enhancement ───
  const handleAIEnhance = useCallback(
    async (section: string) => {
      setAiLoading(true);
      try {
        let message = '';
        if (section === 'summary') {
          const current = resume.summary ? `Here is the current summary to improve:\n"${resume.summary}"\n\nPlease rewrite and improve it.` : '';
          message = `Generate a professional resume summary for ${resume.name || 'a professional'} with skills: ${resume.skills.length > 0 ? resume.skills.join(', ') : 'data analytics, SQL, Python'}. Make it 3-4 sentences with quantifiable metrics and keywords. ${current}`;
        } else if (section === 'skills') {
          message = `Suggest 8 relevant technical skills for a data analyst professional${resume.skills.length > 0 ? ` who already knows: ${resume.skills.join(', ')}` : ''}. Return ONLY the skills as a comma-separated list, nothing else. Include both technical and soft skills.`;
        } else if (section === 'bullets') {
          const role = resume.experience.length > 0 ? resume.experience[0].role : 'Data Analyst';
          const company = resume.experience.length > 0 ? resume.experience[0].company : 'a tech company';
          message = `Write 4 achievement-oriented bullet points for a ${role} at ${company}. Use action verbs, include quantifiable results (%, $, numbers), and highlight data analytics impact. Return ONLY bullet points, one per line, no numbers, no extra text.`;
        } else if (section === 'education') {
          message = `Suggest realistic education entries for a data analytics professional. Return 1 entry in this exact format:\nSCHOOL|DEGREE|YEAR|GPA\nExample: MIT|Master of Science in Data Science|2020-2022|3.9/4.0`;
        } else if (section === 'volunteer') {
          message = `Suggest 1 volunteer experience for a data analytics professional resume. Return in this exact format:\nORGANIZATION|ROLE|DATES|DESCRIPTION\nExample: Data.org|Data Analytics Volunteer|2023-Present|Helped nonprofits analyze their data to make better decisions.`;
        }

        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, context: 'resume-builder' }),
        });
        const data = await res.json();
        if (!res.ok || !data.reply) throw new Error(data.error || 'AI request failed');
        const reply = data.reply || '';

        if (section === 'summary') {
          updateResume({ summary: reply });
          toast.success('Summary enhanced by AI!');
        } else if (section === 'skills') {
          const newSkills = reply
            .split(/[,\n]/)
            .map((s: string) => s.trim().replace(/^[-•]\s*/, ''))
            .filter((s: string) => s && !resume.skills.includes(s));
          updateResume({ skills: [...resume.skills, ...newSkills.slice(0, 8)] });
          toast.success('Skills suggested by AI!');
        } else if (section === 'bullets') {
          const bullets = reply.split('\n').map((b: string) => b.trim().replace(/^[-•\d.)\s]+/, '')).filter((b: string) => b);
          if (resume.experience.length > 0) {
            updateExperience(resume.experience[0].id, 'bullets', bullets.slice(0, 4));
          }
          toast.success('Achievement bullets generated!');
        } else if (section === 'education' && reply.includes('|')) {
          const parts = reply.split('\n')[0].split('|');
          if (parts.length >= 4) {
            addEducation();
            setTimeout(() => {
              const newEdu = { id: `edu-parse-${Date.now()}`, school: parts[0].trim(), degree: parts[1].trim(), year: parts[2].trim(), gpa: parts[3].trim() };
              updateResume({ education: [...resume.education, newEdu] });
            }, 100);
            toast.success('Education entry generated!');
          }
        } else if (section === 'volunteer' && reply.includes('|')) {
          const parts = reply.split('\n')[0].split('|');
          if (parts.length >= 4) {
            const newVol: VolunteerEntry = { id: `vol-${Date.now()}`, org: parts[0].trim(), role: parts[1].trim(), dates: parts[2].trim(), description: parts[3].trim() };
            updateResume({ volunteer: [...resume.volunteer, newVol] });
            toast.success('Volunteer entry generated!');
          }
        }
      } catch {
        toast.error('AI enhancement failed. Please try again.');
      } finally {
        setAiLoading(false);
      }
    },
    [resume, updateResume, updateExperience, addEducation]
  );

  // ─── AI Full Resume ───
  const handleAIFullResume = useCallback(async () => {
    const title = aiJobTitle.trim();
    if (!title) {
      toast.error('Please enter a target job title.');
      return;
    }
    setAiFullLoading(true);
    try {
      const message = `Generate a complete professional resume for a "${title}" position. Return it as a JSON object with EXACTLY these fields:
{
  "name": "${resume.name || 'Professional Candidate'}",
  "summary": "3-4 sentence professional summary with keywords and metrics",
  "skills": ["skill1", "skill2", ...at least 8 skills],
  "experience": [{"company": "Company Name", "role": "Job Title", "dates": "Jan 2021 - Present", "bullets": ["achievement1 with numbers", "achievement2", ...3-4 bullets]}],
  "education": [{"school": "University Name", "degree": "Degree", "year": "2018-2022", "gpa": "3.8/4.0"}],
  "languages": [{"language": "Language", "proficiency": "Fluent"}],
  "volunteer": [{"org": "Organization", "role": "Role", "dates": "2023", "description": "Brief description"}]
}
Return ONLY valid JSON, no markdown, no code blocks.`;

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context: 'resume-builder-full' }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error || 'AI request failed');

      let parsed: Record<string, unknown>;
      try {
        const cleaned = data.reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        toast.error('Could not parse AI response. Try again.');
        return;
      }

      const updates: Partial<ResumeData> = {};
      if (typeof parsed.name === 'string') updates.name = parsed.name;
      if (typeof parsed.summary === 'string') updates.summary = parsed.summary;
      if (Array.isArray(parsed.skills)) {
        updates.skills = parsed.skills.filter((s: unknown) => typeof s === 'string').slice(0, 12);
      }
      if (Array.isArray(parsed.experience)) {
        updates.experience = parsed.experience
          .slice(0, 3)
          .map((e: Record<string, unknown>, i: number) => ({
            id: `exp-full-${Date.now()}-${i}`,
            company: String(e.company || ''),
            role: String(e.role || ''),
            dates: String(e.dates || ''),
            bullets: Array.isArray(e.bullets) ? e.bullets.map((b: unknown) => String(b)).slice(0, 4) : [''],
          }));
      }
      if (Array.isArray(parsed.education)) {
        updates.education = parsed.education
          .slice(0, 2)
          .map((e: Record<string, unknown>, i: number) => ({
            id: `edu-full-${Date.now()}-${i}`,
            school: String(e.school || ''),
            degree: String(e.degree || ''),
            year: String(e.year || ''),
            gpa: String(e.gpa || ''),
          }));
      }
      if (Array.isArray(parsed.languages)) {
        updates.languages = parsed.languages.map((l: Record<string, unknown>, i: number) => ({
          id: `lang-full-${Date.now()}-${i}`,
          language: String(l.language || ''),
          proficiency: ['Native', 'Fluent', 'Intermediate', 'Basic'].includes(String(l.proficiency))
            ? (l.proficiency as LanguageEntry['proficiency'])
            : 'Intermediate',
        }));
      }
      if (Array.isArray(parsed.volunteer)) {
        updates.volunteer = parsed.volunteer
          .slice(0, 2)
          .map((v: Record<string, unknown>, i: number) => ({
            id: `vol-full-${Date.now()}-${i}`,
            org: String(v.org || ''),
            role: String(v.role || ''),
            dates: String(v.dates || ''),
            description: String(v.description || ''),
          }));
      }

      updateResume(updates);
      setShowAiFullDialog(false);
      setAiJobTitle('');
      toast.success('Full resume generated by AI!');
    } catch {
      toast.error('AI full resume generation failed. Please try again.');
    } finally {
      setAiFullLoading(false);
    }
  }, [aiJobTitle, resume.name, updateResume]);

  // ─── ATS Tips ───
  const handleAnalyzeATS = useCallback(() => {
    setAtsLoading(true);
    setTimeout(() => {
      setAtsTips(getATSTips(resume));
      setAtsTipsShown(true);
      setAtsLoading(false);
    }, 800);
  }, [resume]);

  // ─── Export / Import ───
  const handleSave = useCallback(() => {
    try {
      localStorage.setItem('datatrack-resume', JSON.stringify(resume));
      localStorage.setItem('datatrack-resume-sections', JSON.stringify(sectionOrder));
      toast.success('Resume saved to browser storage!');
    } catch {
      toast.error('Failed to save. Storage may be full.');
    }
  }, [resume, sectionOrder]);

  const handleLoad = useCallback(() => {
    try {
      const saved = localStorage.getItem('datatrack-resume');
      const savedSections = localStorage.getItem('datatrack-resume-sections');
      if (saved) {
        const parsed = JSON.parse(saved) as ResumeData;
        setResume(parsed);
        if (savedSections) setSectionOrder(JSON.parse(savedSections) as SectionId[]);
        toast.success('Resume loaded from browser storage!');
      } else {
        toast.error('No saved resume found.');
      }
    } catch {
      toast.error('Failed to load saved resume.');
    }
  }, []);

  const handleExport = useCallback(() => {
    window.print();
    toast.success('Print dialog opened!');
  }, []);

  // ─── Form Sections Config ───
  const formSections = useMemo(
    () => [
      { id: 'personal' as const, label: 'Personal Info', icon: Mail, aiBtn: false },
      { id: 'summary' as const, label: 'Professional Summary', icon: FileText, aiBtn: true, aiSection: 'summary', aiLabel: 'AI Improve' },
      { id: 'skills' as const, label: 'Skills', icon: Sparkles, aiBtn: true, aiSection: 'skills', aiLabel: 'AI Suggest' },
      { id: 'experience' as const, label: 'Experience', icon: Briefcase, aiBtn: true, aiSection: 'bullets', aiLabel: 'AI Bullets' },
      { id: 'education' as const, label: 'Education', icon: GraduationCap, aiBtn: true, aiSection: 'education', aiLabel: 'AI Generate' },
      { id: 'certifications' as const, label: 'Certifications', icon: Award, aiBtn: false },
      { id: 'languages' as const, label: 'Languages', icon: Languages, aiBtn: false },
      { id: 'publications' as const, label: 'Publications & Research', icon: BookOpen, aiBtn: false },
      { id: 'volunteer' as const, label: 'Volunteer Work', icon: Heart, aiBtn: true, aiSection: 'volunteer', aiLabel: 'AI Generate' },
      { id: 'custom' as const, label: 'Custom Sections', icon: Layers, aiBtn: false },
    ],
    []
  );

  const toggleSection = (id: string) => {
    setActiveFormSection(activeFormSection === id ? null : id);
  };

  const templates: { id: TemplateType; label: string; desc: string }[] = [
    { id: 'modern', label: 'Modern', desc: 'Gradient header' },
    { id: 'classic', label: 'Classic', desc: 'Traditional layout' },
    { id: 'creative', label: 'Creative', desc: 'Sidebar layout' },
  ];

  return (
    <div className="h-full">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #resume-preview, #resume-preview * { visibility: visible; }
          #resume-preview {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            background: white !important;
            color: #000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-hide { display: none !important; }
          #resume-preview * { color: #000 !important; }
          #resume-preview .text-emerald-600, #resume-preview .text-emerald-700 { color: #047857 !important; }
        }
      `}</style>

      {/* AI Full Resume Dialog Overlay */}
      <AnimatePresence>
        {showAiFullDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAiFullDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border rounded-2xl shadow-2xl p-6 mx-4 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Full Resume Generator</h3>
                  <p className="text-xs text-muted-foreground">Generate all sections from a job title</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Target Job Title</Label>
                  <Input
                    placeholder="e.g., Senior Data Analyst"
                    value={aiJobTitle}
                    onChange={(e) => setAiJobTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAIFullResume()}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  This will fill: Summary, Skills, Experience, Education, Languages, and Volunteer sections with AI-generated content.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setShowAiFullDialog(false)} variant="outline" size="sm" className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAIFullResume}
                    disabled={aiFullLoading || !aiJobTitle.trim()}
                    size="sm"
                    className="flex-1 gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    {aiFullLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    Generate Resume
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 md:p-6 space-y-4 print-hide">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Resume Builder
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                AI-powered professional resume creator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Resume Score Badge */}
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-1.5">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span className={cn('text-lg font-bold tabular-nums', scoreColor)}>{resumeScore}</span>
              <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
            </div>
            {/* Template Selector */}
            <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    template === t.id
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LayoutTemplate className="w-3 h-3 inline mr-1" />
                  {t.label}
                </button>
              ))}
            </div>
            {/* AI Full Resume */}
            <Button
              onClick={() => setShowAiFullDialog(true)}
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Wand2 className="w-3.5 h-3.5" />
              AI Full Resume
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm" className="gap-1.5">
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>

        {/* Score Bar & Actions Row */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Progress value={resumeScore} className="h-2 flex-1" />
            <span className={cn('text-xs font-bold tabular-nums w-8 text-right', scoreColor)}>{resumeScore}%</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="px-3 py-1 text-xs">
              <GraduationCap className="w-3 h-3 mr-1" />
              {certificatesList.length} Certificates
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-xs">
              <FolderGit2 className="w-3 h-3 mr-1" />
              {projects.length} Projects
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <div className="flex-1" />
            <Button onClick={handleSave} variant="outline" size="sm" className="gap-1.5 text-xs">
              <Save className="w-3 h-3" /> Save
            </Button>
            <Button onClick={handleLoad} variant="outline" size="sm" className="gap-1.5 text-xs">
              <Upload className="w-3 h-3" /> Load
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100%-180px)] print-hide">
        {/* Mobile Toggle */}
        <div className="flex lg:hidden px-4 pb-2">
          <Button
            variant={showPreviewMobile ? 'outline' : 'default'}
            size="sm"
            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
            className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            {showPreviewMobile ? (
              <><FileText className="w-4 h-4" /> Edit Resume</>
            ) : (
              <><FileText className="w-4 h-4" /> Preview Resume</>
            )}
          </Button>
        </div>

        {/* Form Panel */}
        <div className={cn('w-full lg:w-[55%] overflow-y-auto border-r border-border/50', showPreviewMobile && 'hidden lg:block')}>
          <div className="p-4 md:p-6 space-y-2">
            {sectionOrder.map((sectionId, idx) => {
              const section = formSections.find((s) => s.id === sectionId);
              if (!section) return null;
              const Icon = section.icon;
              const isOpen = activeFormSection === section.id;

              return (
                <Card key={section.id} className="overflow-hidden border-border/50">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="font-semibold text-sm">{section.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Reorder buttons */}
                      <div className="flex flex-col mr-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, 'up'); }}
                          disabled={idx === 0}
                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, 'down'); }}
                          disabled={idx === sectionOrder.length - 1}
                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="pt-0 pb-4 px-4 space-y-3">

                          {/* ── Personal Info ── */}
                          {section.id === 'personal' && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Full Name</Label>
                                  <Input placeholder="Your name" value={resume.name} onChange={(e) => updateResume({ name: e.target.value })} className="h-9" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Email</Label>
                                  <div className="relative">
                                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input placeholder="john@example.com" value={resume.email} onChange={(e) => updateResume({ email: e.target.value })} className="h-9 pl-8" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Phone</Label>
                                  <div className="relative">
                                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input placeholder="+1 (555) 000-0000" value={resume.phone} onChange={(e) => updateResume({ phone: e.target.value })} className="h-9 pl-8" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Location</Label>
                                  <div className="relative">
                                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input placeholder="New York, NY" value={resume.location} onChange={(e) => updateResume({ location: e.target.value })} className="h-9 pl-8" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">LinkedIn</Label>
                                  <div className="relative">
                                    <Linkedin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input placeholder="linkedin.com/in/johndoe" value={resume.linkedin} onChange={(e) => updateResume({ linkedin: e.target.value })} className="h-9 pl-8" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Portfolio URL</Label>
                                  <div className="relative">
                                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input placeholder="johndoe.com" value={resume.portfolio} onChange={(e) => updateResume({ portfolio: e.target.value })} className="h-9 pl-8" />
                                  </div>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                  <Label className="text-xs">Website</Label>
                                  <div className="relative">
                                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input placeholder="yourwebsite.com" value={resume.website} onChange={(e) => updateResume({ website: e.target.value })} className="h-9 pl-8" />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {/* ── Professional Summary ── */}
                          {section.id === 'summary' && (
                            <>
                              <Textarea placeholder="Write a brief professional summary highlighting your experience, skills, and career goals..." value={resume.summary} onChange={(e) => updateResume({ summary: e.target.value })} rows={5} className="resize-none text-sm" />
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">{resume.summary.length} characters</span>
                                <Button size="sm" variant="outline" onClick={() => handleAIEnhance('summary')} disabled={aiLoading} className="gap-1.5 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400">
                                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                  AI Improve Summary
                                </Button>
                              </div>
                            </>
                          )}

                          {/* ── Skills ── */}
                          {section.id === 'skills' && (
                            <>
                              <div className="flex gap-2">
                                <Input placeholder="Type a skill and press Enter" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} className="h-9 text-sm" />
                                <Button size="sm" variant="outline" onClick={addSkill} className="shrink-0"><Plus className="w-3.5 h-3.5" /></Button>
                              </div>
                              {resume.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {resume.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="px-2.5 py-1 text-xs gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                      {skill}
                                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">{resume.skills.length} skills</span>
                                <Button size="sm" variant="outline" onClick={() => handleAIEnhance('skills')} disabled={aiLoading} className="gap-1.5 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400">
                                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                  AI Suggest Skills
                                </Button>
                              </div>
                            </>
                          )}

                          {/* ── Education ── */}
                          {section.id === 'education' && (
                            <>
                              {resume.education.map((edu, idx) => (
                                <div key={edu.id} className="space-y-2 p-3 bg-muted/30 rounded-xl">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">Education #{idx + 1}</span>
                                    <button onClick={() => removeEducation(edu.id)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1"><Label className="text-[11px]">School</Label><Input placeholder="University Name" value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} className="h-8 text-xs" /></div>
                                    <div className="space-y-1"><Label className="text-[11px]">Degree</Label><Input placeholder="B.S. Computer Science" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} className="h-8 text-xs" /></div>
                                    <div className="space-y-1"><Label className="text-[11px]">Year</Label><Input placeholder="2020 - 2024" value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} className="h-8 text-xs" /></div>
                                    <div className="space-y-1"><Label className="text-[11px]">GPA</Label><Input placeholder="3.8/4.0" value={edu.gpa} onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)} className="h-8 text-xs" /></div>
                                  </div>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={addEducation} className="flex-1 gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> Add Education</Button>
                                <Button size="sm" variant="outline" onClick={() => handleAIEnhance('education')} disabled={aiLoading} className="gap-1.5 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400">
                                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                  AI Generate
                                </Button>
                              </div>
                            </>
                          )}

                          {/* ── Experience ── */}
                          {section.id === 'experience' && (
                            <>
                              {resume.experience.map((exp, idx) => (
                                <div key={exp.id} className="space-y-2 p-3 bg-muted/30 rounded-xl">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">Experience #{idx + 1}</span>
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="ghost" onClick={() => handleAIEnhance('bullets')} disabled={aiLoading} className="h-6 px-2 text-[10px] gap-1">
                                        {aiLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5 text-emerald-500" />}
                                        AI Bullets
                                      </Button>
                                      <button onClick={() => removeExperience(exp.id)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1"><Label className="text-[11px]">Company</Label><Input placeholder="Google" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} className="h-8 text-xs" /></div>
                                    <div className="space-y-1"><Label className="text-[11px]">Role</Label><Input placeholder="Data Analyst" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} className="h-8 text-xs" /></div>
                                  </div>
                                  <div className="space-y-1"><Label className="text-[11px]">Dates</Label><Input placeholder="Jan 2022 - Present" value={exp.dates} onChange={(e) => updateExperience(exp.id, 'dates', e.target.value)} className="h-8 text-xs" /></div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[11px]">Achievement Bullet Points</Label>
                                    {exp.bullets.map((bullet, bi) => (
                                      <div key={bi} className="flex gap-1.5">
                                        <Input placeholder={`Achievement #${bi + 1}`} value={bullet} onChange={(e) => updateBullet(exp.id, bi, e.target.value)} className="h-8 text-xs" />
                                        {exp.bullets.length > 1 && (
                                          <button onClick={() => removeBullet(exp.id, bi)} className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors mt-1"><X className="w-3.5 h-3.5" /></button>
                                        )}
                                      </div>
                                    ))}
                                    <button onClick={() => addBullet(exp.id)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                                      <Plus className="w-3 h-3" /> Add bullet point
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <Button size="sm" variant="outline" onClick={addExperience} className="w-full gap-1.5 text-xs">
                                <Plus className="w-3.5 h-3.5" /> Add Experience
                              </Button>
                            </>
                          )}

                          {/* ── Certifications ── */}
                          {section.id === 'certifications' && (
                            <>
                              {certificatesList.length > 0 && (
                                <div className="space-y-2 mb-3">
                                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Auto-populated from DataTrack</p>
                                  {certificatesList.map((cert) => (
                                    <div key={cert!.id} className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                                      <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <div>
                                        <p className="text-xs font-medium">{cert!.title}</p>
                                        <p className="text-[10px] text-muted-foreground">DataTrack Certificate</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="space-y-2">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Manual Entry</p>
                                <div className="flex gap-2">
                                  <Input placeholder="e.g., AWS Certified Solutions Architect" value={certInput} onChange={(e) => setCertInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCertification(); } }} className="h-9 text-xs" />
                                  <Button size="sm" variant="outline" onClick={addCertification} className="shrink-0"><Plus className="w-3.5 h-3.5" /></Button>
                                </div>
                                {resume.certifications.length > 0 && (
                                  <div className="space-y-1">
                                    {resume.certifications.map((cert) => (
                                      <div key={cert} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <Award className="w-3.5 h-3.5 text-amber-500" />
                                          <span className="text-xs">{cert}</span>
                                        </div>
                                        <button onClick={() => removeCertification(cert)} className="text-muted-foreground hover:text-red-500"><X className="w-3 h-3" /></button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                          {/* ── Languages ── */}
                          {section.id === 'languages' && (
                            <>
                              {resume.languages.map((lang, idx) => (
                                <div key={lang.id} className="space-y-2 p-3 bg-muted/30 rounded-xl">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">Language #{idx + 1}</span>
                                    <button onClick={() => removeLanguage(lang.id)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1"><Label className="text-[11px]">Language</Label><Input placeholder="Spanish" value={lang.language} onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)} className="h-8 text-xs" /></div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">Proficiency</Label>
                                      <select value={lang.proficiency} onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)} className="h-8 text-xs w-full rounded-md border border-input bg-background px-2">
                                        <option value="Native">Native</option>
                                        <option value="Fluent">Fluent</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Basic">Basic</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <Button size="sm" variant="outline" onClick={addLanguage} className="w-full gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> Add Language</Button>
                            </>
                          )}

                          {/* ── Publications ── */}
                          {section.id === 'publications' && (
                            <>
                              {resume.publications.map((pub, idx) => (
                                <div key={pub.id} className="space-y-2 p-3 bg-muted/30 rounded-xl">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">Publication #{idx + 1}</span>
                                    <button onClick={() => removePublication(pub.id)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1"><Label className="text-[11px]">Title</Label><Input placeholder="Paper Title" value={pub.title} onChange={(e) => updatePublication(pub.id, 'title', e.target.value)} className="h-8 text-xs" /></div>
                                    <div className="space-y-1"><Label className="text-[11px]">Publisher / Journal</Label><Input placeholder="IEEE, Springer, etc." value={pub.publisher} onChange={(e) => updatePublication(pub.id, 'publisher', e.target.value)} className="h-8 text-xs" /></div>
                                    <div className="space-y-1"><Label className="text-[11px]">Year</Label><Input placeholder="2024" value={pub.year} onChange={(e) => updatePublication(pub.id, 'year', e.target.value)} className="h-8 text-xs" /></div>
                                    <div className="space-y-1"><Label className="text-[11px]">URL</Label><Input placeholder="https://..." value={pub.url} onChange={(e) => updatePublication(pub.id, 'url', e.target.value)} className="h-8 text-xs" /></div>
                                  </div>
                                </div>
                              ))}
                              <Button size="sm" variant="outline" onClick={addPublication} className="w-full gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> Add Publication</Button>
                              {resume.publications.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-2">Add research papers, articles, or publications.</p>
                              )}
                            </>
                          )}

                          {/* ── Volunteer Work ── */}
                          {section.id === 'volunteer' && (
                            <>
                              {resume.volunteer.map((vol, idx) => (
                                <div key={vol.id} className="space-y-2 p-3 bg-muted/30 rounded-xl">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">Volunteer #{idx + 1}</span>
                                    <button onClick={() => removeVolunteer(vol.id)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1"><Label className="text-[11px]">Organization</Label><Input placeholder="Red Cross" value={vol.org} onChange={(e) => updateVolunteer(vol.id, 'org', e.target.value)} className="h-8 text-xs" /></div>
                                    <div className="space-y-1"><Label className="text-[11px]">Role</Label><Input placeholder="Data Analyst Volunteer" value={vol.role} onChange={(e) => updateVolunteer(vol.id, 'role', e.target.value)} className="h-8 text-xs" /></div>
                                    <div className="space-y-1"><Label className="text-[11px]">Dates</Label><Input placeholder="2023 - Present" value={vol.dates} onChange={(e) => updateVolunteer(vol.id, 'dates', e.target.value)} className="h-8 text-xs" /></div>
                                  </div>
                                  <div className="space-y-1"><Label className="text-[11px]">Description</Label><Textarea placeholder="Brief description of your volunteer work..." value={vol.description} onChange={(e) => updateVolunteer(vol.id, 'description', e.target.value)} className="h-16 text-xs resize-none" /></div>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={addVolunteer} className="flex-1 gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> Add Volunteer</Button>
                                <Button size="sm" variant="outline" onClick={() => handleAIEnhance('volunteer')} disabled={aiLoading} className="gap-1.5 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400">
                                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                  AI Generate
                                </Button>
                              </div>
                            </>
                          )}

                          {/* ── Custom Sections ── */}
                          {section.id === 'custom' && (
                            <>
                              {resume.customSections.map((cs, idx) => (
                                <div key={cs.id} className="space-y-2 p-3 bg-muted/30 rounded-xl">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">Custom Section #{idx + 1}</span>
                                    <button onClick={() => removeCustomSection(cs.id)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                  <div className="space-y-1"><Label className="text-[11px]">Section Title</Label><Input placeholder="e.g., Professional Development" value={cs.title} onChange={(e) => updateCustomSection(cs.id, 'title', e.target.value)} className="h-8 text-xs" /></div>
                                  <div className="space-y-1"><Label className="text-[11px]">Content</Label><Textarea placeholder="Add your content here..." value={cs.content} onChange={(e) => updateCustomSection(cs.id, 'content', e.target.value)} className="h-20 text-xs resize-none" /></div>
                                </div>
                              ))}
                              <Button size="sm" variant="outline" onClick={addCustomSection} className="w-full gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> Add Custom Section</Button>
                            </>
                          )}

                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Preview Panel */}
        <div className={cn('w-full lg:w-[45%] overflow-y-auto bg-muted/30', !showPreviewMobile && 'hidden lg:block')}>
          <div className="p-4 md:p-6">
            {/* Sticky Preview Header */}
            <div className="sticky top-0 z-10 bg-muted/30 pb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</span>
              <Button size="sm" onClick={handleExport} className="gap-1.5 h-7 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                <Download className="w-3 h-3" /> Download PDF
              </Button>
            </div>
            <div id="resume-preview">
              <ResumePreview
                resume={resume}
                template={template}
                certificates={certificatesList.map((c) => c!.title)}
                manualCerts={resume.certifications}
                projectsList={projects}
                sectionOrder={sectionOrder}
              />
            </div>

            {/* ATS Optimization Section */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-semibold">ATS Optimization</h3>
                </div>
                <Button size="sm" variant="outline" onClick={handleAnalyzeATS} disabled={atsLoading} className="gap-1.5 text-xs">
                  {atsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
                  Analyze
                </Button>
              </div>
              {atsTipsShown && (
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    {atsTips.map((tip, i) => (
                      <div key={i} className={cn(
                        'flex items-start gap-2 p-2.5 rounded-lg text-xs',
                        tip.type === 'good' && 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30',
                        tip.type === 'warn' && 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30',
                        tip.type === 'bad' && 'bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30'
                      )}>
                        {tip.type === 'good' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                        {tip.type === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />}
                        {tip.type === 'bad' && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                        <span className={cn(
                          tip.type === 'good' && 'text-emerald-700 dark:text-emerald-400',
                          tip.type === 'warn' && 'text-amber-700 dark:text-amber-400',
                          tip.type === 'bad' && 'text-red-700 dark:text-red-400'
                        )}>{tip.tip}</span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Resume Preview Component ───
function ResumePreview({
  resume,
  template,
  certificates,
  manualCerts,
  projectsList,
  sectionOrder,
}: {
  resume: ResumeData;
  template: TemplateType;
  certificates: string[];
  manualCerts: string[];
  projectsList: { name: string; description: string; tools: string[]; link: string }[];
  sectionOrder: SectionId[];
}) {
  if (template === 'modern') return <ModernTemplate resume={resume} certificates={certificates} manualCerts={manualCerts} projectsList={projectsList} sectionOrder={sectionOrder} />;
  if (template === 'classic') return <ClassicTemplate resume={resume} certificates={certificates} manualCerts={manualCerts} projectsList={projectsList} sectionOrder={sectionOrder} />;
  return <CreativeTemplate resume={resume} certificates={certificates} manualCerts={manualCerts} projectsList={projectsList} sectionOrder={sectionOrder} />;
}

// Helper to render ordered sections
function OrderedSections({
  sectionOrder,
  resume,
  certificates,
  manualCerts,
  projectsList,
  renderSection,
}: {
  sectionOrder: SectionId[];
  resume: ResumeData;
  certificates: string[];
  manualCerts: string[];
  projectsList: { name: string; description: string; tools: string[]; link: string }[];
  renderSection: (id: SectionId) => React.ReactNode;
}) {
  return (
    <>
      {sectionOrder.map((id) => renderSection(id))}
    </>
  );
}

// ─── Modern Template ───
function ModernTemplate({
  resume,
  certificates,
  manualCerts,
  projectsList,
  sectionOrder,
}: {
  resume: ResumeData;
  certificates: string[];
  manualCerts: string[];
  projectsList: { name: string; description: string; tools: string[]; link: string }[];
  sectionOrder: SectionId[];
}) {
  const allCerts = [...certificates.map((c) => c + ' — DataTrack Pro'), ...manualCerts];

  return (
    <div className="bg-white text-zinc-800 shadow-xl rounded-xl overflow-hidden" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-8 py-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">{resume.name || 'Your Name'}</h1>
          {(resume.email || resume.phone || resume.location || resume.linkedin || resume.portfolio || resume.website) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-sm text-emerald-100">
              {resume.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{resume.email}</span>}
              {resume.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{resume.phone}</span>}
              {resume.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{resume.location}</span>}
              {resume.linkedin && <span className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" />{resume.linkedin}</span>}
              {resume.portfolio && <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{resume.portfolio}</span>}
              {resume.website && <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{resume.website}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="px-8 py-6 space-y-6">
        <OrderedSections sectionOrder={sectionOrder} resume={resume} certificates={allCerts} manualCerts={[]} projectsList={projectsList} renderSection={(id) => {
          switch (id) {
            case 'summary':
              return resume.summary ? (
                <div key={id}>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-2 pb-1 border-b border-emerald-100">Professional Summary</h2>
                  <p className="text-xs leading-[1.7] text-zinc-600">{resume.summary}</p>
                </div>
              ) : null;
            case 'skills':
              return resume.skills.length > 0 ? (
                <div key={id}>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3 pb-1 border-b border-emerald-100">Skills</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.skills.map((s) => (
                      <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-medium border border-emerald-100">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null;
            case 'experience':
              return resume.experience.length > 0 ? (
                <div key={id}>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3 pb-1 border-b border-emerald-100">Experience</h2>
                  {resume.experience.map((exp) => (
                    <div key={exp.id} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-sm text-zinc-800">{exp.role || 'Role'}</h3>
                          <p className="text-xs text-emerald-600 font-medium">{exp.company}</p>
                        </div>
                        <span className="text-[11px] text-zinc-400 whitespace-nowrap ml-3 bg-zinc-50 px-2 py-0.5 rounded">{exp.dates}</span>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {exp.bullets.filter((b) => b.trim()).map((b, i) => (
                          <li key={i} className="text-xs leading-[1.6] text-zinc-600 flex gap-2">
                            <span className="text-emerald-500 mt-1 shrink-0">▸</span><span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null;
            case 'education':
              return resume.education.length > 0 ? (
                <div key={id}>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3 pb-1 border-b border-emerald-100">Education</h2>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="mb-3 last:mb-0 flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-sm text-zinc-800">{edu.degree || 'Degree'}</h3>
                        <p className="text-xs text-zinc-500">{edu.school}</p>
                      </div>
                      <div className="text-right text-[11px] text-zinc-400 whitespace-nowrap ml-3">
                        {edu.year}{edu.gpa && <span className="ml-2 bg-zinc-50 px-1.5 py-0.5 rounded">GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null;
            case 'certifications':
              return allCerts.length > 0 ? (
                <div key={id}>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-2 pb-1 border-b border-emerald-100">Certifications</h2>
                  {allCerts.map((c) => (
                    <p key={c} className="text-xs flex items-center gap-1.5 mb-1"><Award className="w-3 h-3 text-emerald-500 shrink-0" />{c}</p>
                  ))}
                </div>
              ) : null;
            case 'languages':
              return resume.languages.length > 0 ? (
                <div key={id}>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3 pb-1 border-b border-emerald-100">Languages</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {resume.languages.map((l) => (
                      <div key={l.id} className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-700">{l.language}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${{ Native: 100, Fluent: 80, Intermediate: 60, Basic: 35 }[l.proficiency]}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-400 w-16 text-right">{l.proficiency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            case 'publications':
              return resume.publications.length > 0 ? (
                <div key={id}>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-2 pb-1 border-b border-emerald-100">Publications</h2>
                  {resume.publications.map((p) => (
                    <div key={p.id} className="mb-2 last:mb-0">
                      <p className="text-xs font-medium text-zinc-800">{p.title}</p>
                      <p className="text-[11px] text-zinc-500">{p.publisher}{p.year && ` — ${p.year}`}</p>
                    </div>
                  ))}
                </div>
              ) : null;
            case 'volunteer':
              return resume.volunteer.length > 0 ? (
                <div key={id}>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3 pb-1 border-b border-emerald-100">Volunteer Experience</h2>
                  {resume.volunteer.map((v) => (
                    <div key={v.id} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-xs text-zinc-800">{v.role}</h3>
                          <p className="text-[11px] text-emerald-600">{v.org}</p>
                        </div>
                        <span className="text-[10px] text-zinc-400 whitespace-nowrap ml-3">{v.dates}</span>
                      </div>
                      {v.description && <p className="text-[11px] text-zinc-500 mt-1">{v.description}</p>}
                    </div>
                  ))}
                </div>
              ) : null;
            case 'custom':
              return resume.customSections.length > 0 ? (
                <div key={id}>
                  {resume.customSections.map((cs) => (
                    <div key={cs.id} className="mb-4 last:mb-0">
                      <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-2 pb-1 border-b border-emerald-100">{cs.title}</h2>
                      <p className="text-xs leading-[1.6] text-zinc-600 whitespace-pre-line">{cs.content}</p>
                    </div>
                  ))}
                </div>
              ) : null;
            default:
              return null;
          }
        }} />
      </div>
    </div>
  );
}

// ─── Classic Template ───
function ClassicTemplate({
  resume,
  certificates,
  manualCerts,
  projectsList,
  sectionOrder,
}: {
  resume: ResumeData;
  certificates: string[];
  manualCerts: string[];
  projectsList: { name: string; description: string; tools: string[]; link: string }[];
  sectionOrder: SectionId[];
}) {
  const allCerts = [...certificates.map((c) => c + ' — DataTrack Pro'), ...manualCerts];

  return (
    <div className="bg-white text-zinc-900 shadow-xl rounded-xl overflow-hidden p-8" style={{ fontFamily: '"Georgia", "Times New Roman", serif' }}>
      {/* Header */}
      <div className="text-center border-b-[3px] border-zinc-800 pb-4 mb-6">
        <h1 className="text-[28px] font-bold tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>{resume.name || 'Your Name'}</h1>
        <div className="w-16 h-0.5 bg-zinc-800 mx-auto mt-2 mb-3" />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-600">
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span>• {resume.phone}</span>}
          {resume.location && <span>• {resume.location}</span>}
          {resume.linkedin && <span>• {resume.linkedin}</span>}
          {resume.portfolio && <span>• {resume.portfolio}</span>}
          {resume.website && <span>• {resume.website}</span>}
        </div>
      </div>
      <div className="space-y-5">
        <OrderedSections sectionOrder={sectionOrder} resume={resume} certificates={allCerts} manualCerts={[]} projectsList={projectsList} renderSection={(id) => {
          switch (id) {
            case 'summary':
              return resume.summary ? (
                <div key={id}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] border-b border-zinc-300 pb-1 mb-2" style={{ fontFamily: 'inherit' }}>Professional Summary</h2>
                  <p className="text-xs leading-[1.8] text-zinc-700" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}>{resume.summary}</p>
                </div>
              ) : null;
            case 'skills':
              return resume.skills.length > 0 ? (
                <div key={id}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] border-b border-zinc-300 pb-1 mb-2" style={{ fontFamily: 'inherit' }}>Technical Skills</h2>
                  <p className="text-xs leading-relaxed text-zinc-700" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}>{resume.skills.join('  •  ')}</p>
                </div>
              ) : null;
            case 'experience':
              return resume.experience.length > 0 ? (
                <div key={id}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] border-b border-zinc-300 pb-1 mb-3" style={{ fontFamily: 'inherit' }}>Professional Experience</h2>
                  {resume.experience.map((exp) => (
                    <div key={exp.id} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-sm" style={{ fontFamily: 'inherit' }}>{exp.role || 'Role'}</h3>
                        <span className="text-[11px] italic text-zinc-500" style={{ fontFamily: '"Inter", sans-serif' }}>{exp.dates}</span>
                      </div>
                      <p className="text-xs text-zinc-600 italic mb-1" style={{ fontFamily: '"Inter", sans-serif' }}>{exp.company}</p>
                      <ul className="space-y-0.5" style={{ fontFamily: '"Inter", sans-serif' }}>
                        {exp.bullets.filter((b) => b.trim()).map((b, i) => (
                          <li key={i} className="text-xs leading-[1.7] text-zinc-700 list-disc list-inside ml-1">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null;
            case 'education':
              return resume.education.length > 0 ? (
                <div key={id}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] border-b border-zinc-300 pb-1 mb-2" style={{ fontFamily: 'inherit' }}>Education</h2>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="mb-2 last:mb-0 flex justify-between items-baseline">
                      <div>
                        <h3 className="font-bold text-sm" style={{ fontFamily: 'inherit' }}>{edu.degree || 'Degree'}</h3>
                        <p className="text-xs text-zinc-500 italic" style={{ fontFamily: '"Inter", sans-serif' }}>{edu.school}</p>
                      </div>
                      <span className="text-[11px] text-zinc-500" style={{ fontFamily: '"Inter", sans-serif' }}>{edu.year}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</span>
                    </div>
                  ))}
                </div>
              ) : null;
            case 'certifications':
              return allCerts.length > 0 ? (
                <div key={id}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] border-b border-zinc-300 pb-1 mb-2" style={{ fontFamily: 'inherit' }}>Certifications</h2>
                  {allCerts.map((c) => (
                    <p key={c} className="text-xs mb-1 list-disc list-inside ml-1" style={{ fontFamily: '"Inter", sans-serif' }}>{c}</p>
                  ))}
                </div>
              ) : null;
            case 'languages':
              return resume.languages.length > 0 ? (
                <div key={id}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] border-b border-zinc-300 pb-1 mb-2" style={{ fontFamily: 'inherit' }}>Languages</h2>
                  <p className="text-xs" style={{ fontFamily: '"Inter", sans-serif' }}>{resume.languages.map((l) => `${l.language} (${l.proficiency})`).join(' • ')}</p>
                </div>
              ) : null;
            case 'publications':
              return resume.publications.length > 0 ? (
                <div key={id}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] border-b border-zinc-300 pb-1 mb-2" style={{ fontFamily: 'inherit' }}>Publications</h2>
                  {resume.publications.map((p) => (
                    <p key={p.id} className="text-xs mb-1 list-disc list-inside ml-1" style={{ fontFamily: '"Inter", sans-serif' }}>
                      <span className="font-semibold">{p.title}</span> — {p.publisher}{p.year && `, ${p.year}`}
                    </p>
                  ))}
                </div>
              ) : null;
            case 'volunteer':
              return resume.volunteer.length > 0 ? (
                <div key={id}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] border-b border-zinc-300 pb-1 mb-2" style={{ fontFamily: 'inherit' }}>Volunteer Experience</h2>
                  {resume.volunteer.map((v) => (
                    <div key={v.id} className="mb-2 last:mb-0">
                      <p className="text-xs font-semibold" style={{ fontFamily: '"Inter", sans-serif' }}>{v.role} — {v.org} <span className="italic text-zinc-500">({v.dates})</span></p>
                      {v.description && <p className="text-xs text-zinc-600 ml-4" style={{ fontFamily: '"Inter", sans-serif' }}>{v.description}</p>}
                    </div>
                  ))}
                </div>
              ) : null;
            case 'custom':
              return resume.customSections.length > 0 ? (
                <div key={id}>
                  {resume.customSections.map((cs) => (
                    <div key={cs.id} className="mb-4 last:mb-0">
                      <h2 className="text-xs font-bold uppercase tracking-[0.15em] border-b border-zinc-300 pb-1 mb-2" style={{ fontFamily: 'inherit' }}>{cs.title}</h2>
                      <p className="text-xs leading-[1.7] text-zinc-700 whitespace-pre-line" style={{ fontFamily: '"Inter", sans-serif' }}>{cs.content}</p>
                    </div>
                  ))}
                </div>
              ) : null;
            default:
              return null;
          }
        }} />
      </div>
    </div>
  );
}

// ─── Creative Template ───
function CreativeTemplate({
  resume,
  certificates,
  manualCerts,
  projectsList,
  sectionOrder,
}: {
  resume: ResumeData;
  certificates: string[];
  manualCerts: string[];
  projectsList: { name: string; description: string; tools: string[]; link: string }[];
  sectionOrder: SectionId[];
}) {
  const allCerts = [...certificates.map((c) => c + ' — DataTrack Pro'), ...manualCerts];

  return (
    <div className="bg-white text-zinc-800 shadow-xl rounded-xl overflow-hidden flex flex-col md:flex-row" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div className="w-full md:w-[38%] bg-gradient-to-b from-zinc-900 to-zinc-800 text-white p-6 space-y-6">
        {/* Name & Title */}
        <div>
          <h1 className="text-xl font-bold leading-tight">{resume.name || 'Your Name'}</h1>
          {resume.summary && (
            <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed line-clamp-3">{resume.summary}</p>
          )}
          <div className="w-10 h-0.5 bg-emerald-500 mt-3" />
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Contact</h2>
          <div className="space-y-2 text-xs">
            {resume.email && <p className="flex items-center gap-2"><Mail className="w-3 h-3 text-emerald-400" />{resume.email}</p>}
            {resume.phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3 text-emerald-400" />{resume.phone}</p>}
            {resume.location && <p className="flex items-center gap-2"><MapPin className="w-3 h-3 text-emerald-400" />{resume.location}</p>}
            {resume.linkedin && <p className="flex items-center gap-2"><Linkedin className="w-3 h-3 text-emerald-400" />{resume.linkedin}</p>}
            {resume.portfolio && <p className="flex items-center gap-2"><Globe className="w-3 h-3 text-emerald-400" />{resume.portfolio}</p>}
            {resume.website && <p className="flex items-center gap-2"><Globe className="w-3 h-3 text-emerald-400" />{resume.website}</p>}
          </div>
        </div>

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-white/10 rounded-full text-[11px] border border-white/10">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {resume.languages.length > 0 && (
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Languages</h2>
            {resume.languages.map((l) => (
              <div key={l.id} className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs">{l.language}</span>
                  <span className="text-[10px] text-zinc-500">{l.proficiency}</span>
                </div>
                <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${{ Native: 100, Fluent: 80, Intermediate: 60, Basic: 35 }[l.proficiency]}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Education</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-3 last:mb-0">
                <p className="text-xs font-semibold">{edu.degree || 'Degree'}</p>
                <p className="text-[11px] text-zinc-400">{edu.school}</p>
                <p className="text-[10px] text-zinc-500">{edu.year}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {allCerts.length > 0 && (
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Certifications</h2>
            {allCerts.map((c) => (
              <div key={c} className="flex items-center gap-1.5 mb-1.5">
                <Award className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-zinc-300">{c}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full md:w-[62%] p-6 space-y-6">
        {/* Experience */}
        {resume.experience.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-emerald-500" />Experience
            </h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-4 last:mb-0 pl-4 border-l-2 border-emerald-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-800">{exp.role || 'Role'}</h3>
                    <p className="text-xs text-emerald-600 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap bg-zinc-50 px-2 py-0.5 rounded">{exp.dates}</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {exp.bullets.filter((b) => b.trim()).map((b, i) => (
                    <li key={i} className="text-xs leading-[1.6] text-zinc-500 flex gap-2">
                      <span className="text-emerald-400 mt-0.5 shrink-0">▸</span><span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Publications */}
        {resume.publications.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-emerald-500" />Publications
            </h2>
            {resume.publications.map((p) => (
              <div key={p.id} className="mb-2 last:mb-0 pl-4 border-l-2 border-emerald-200">
                <p className="text-xs font-semibold text-zinc-800">{p.title}</p>
                <p className="text-[11px] text-zinc-500">{p.publisher}{p.year && ` — ${p.year}`}</p>
              </div>
            ))}
          </div>
        )}

        {/* Volunteer */}
        {resume.volunteer.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-emerald-500" />Volunteer
            </h2>
            {resume.volunteer.map((v) => (
              <div key={v.id} className="mb-3 last:mb-0 pl-4 border-l-2 border-emerald-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xs text-zinc-800">{v.role}</h3>
                    <p className="text-[11px] text-emerald-600">{v.org}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">{v.dates}</span>
                </div>
                {v.description && <p className="text-[11px] text-zinc-500 mt-1">{v.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projectsList.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-emerald-500" />Projects
            </h2>
            {projectsList.map((p) => (
              <div key={p.name} className="mb-3 last:mb-0 pl-4 border-l-2 border-emerald-200">
                <h3 className="font-semibold text-xs text-zinc-800">{p.name}</h3>
                {p.description && <p className="text-[11px] text-zinc-500 mt-0.5">{p.description}</p>}
                {p.tools.length > 0 && <p className="text-[10px] text-emerald-600 mt-1">{p.tools.join(' · ')}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Custom Sections */}
        {resume.customSections.length > 0 && (
          <div>
            {resume.customSections.map((cs) => (
              <div key={cs.id} className="mb-4 last:mb-0">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-2 flex items-center gap-2">
                  <span className="w-5 h-0.5 bg-emerald-500" />{cs.title}
                </h2>
                <p className="text-xs leading-[1.6] text-zinc-500 whitespace-pre-line">{cs.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
