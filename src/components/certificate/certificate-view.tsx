'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Lock,
  Printer,
  Download,
  CheckCircle2,
  Star,
  Shield,
  Calendar,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import { subjects } from '@/lib/study-data';

function generateCertNumber(subjectId: string): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const hash = subjectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `DT-${dateStr}-${String(hash).padStart(4, '0')}`;
}

function getCompletionDate(subjectId: string, completedTopics: string[]): string {
  const subject = subjects.find((s) => s.id === subjectId);
  if (!subject) return '';
  const topicIds = subject.topics.map((t) => t.id);
  const lastCompleted = topicIds
    .filter((id) => completedTopics.includes(id))
    .sort()
    .pop();
  return lastCompleted
    ? new Date(parseInt(lastCompleted.replace(/\D/g, '').slice(0, 8))).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface CertificateProps {
  subject: (typeof subjects)[0];
  progress: number;
  certNumber: string;
  completionDate: string;
  isUnlocked: boolean;
  onPrint: () => void;
}

function CertificateCard({ subject, progress, certNumber, completionDate, isUnlocked, onPrint }: CertificateProps) {
  const [showModal, setShowModal] = useState(false);

  if (!isUnlocked) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <Card className="overflow-hidden opacity-60">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/60 to-muted/30 z-10 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Complete all topics to unlock</p>
              <div className="mt-3 w-32">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
              </div>
            </div>
          </div>
          <div className={cn('bg-gradient-to-br p-6 h-48 relative', subject.gradient)}>
            <div className="absolute top-3 right-3 opacity-20">
              <Award className="w-16 h-16 text-white" />
            </div>
            <div className="relative z-0">
              <h3 className="text-white font-bold text-lg mb-1">{subject.title}</h3>
              <p className="text-white/70 text-xs">Certificate of Completion</p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className={cn('bg-gradient-to-br p-6 h-48 relative', subject.gradient)}>
            <div className="absolute top-3 right-3 opacity-20">
              <Award className="w-16 h-16 text-white" />
            </div>
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            </div>
            <div className="relative z-0 mt-8">
              <h3 className="text-white font-bold text-lg mb-1">{subject.title}</h3>
              <p className="text-white/70 text-xs">{formatDate(completionDate)}</p>
              <p className="text-white/50 text-xs font-mono mt-1">{certNumber}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Certificate */}
              <div
                id={`cert-${subject.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none print:p-0"
              >
                {/* Decorative Border */}
                <div className="m-3 border-2 border-double border-amber-400 rounded-xl p-8 relative">
                  {/* Corner decorations */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-500" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-500" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-500" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-500" />

                  {/* Certificate Content */}
                  <div className="text-center space-y-4 py-4">
                    {/* Header */}
                    <div className="space-y-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="mx-auto"
                      >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
                        <Star className="w-4 h-4 text-amber-400" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-amber-900 tracking-wide uppercase">
                        Certificate of Completion
                      </h2>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
                        <Star className="w-4 h-4 text-amber-400" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-3 py-4">
                      <p className="text-gray-500 text-sm">This is to certify that</p>
                      <p className="text-3xl font-bold text-gray-800 italic">
                        Data Analyst
                      </p>
                      <p className="text-gray-500 text-sm">has successfully completed the course</p>
                      <div className="py-2">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          {subject.title}
                        </h3>
                      </div>
                      <p className="text-gray-500 text-sm">
                        demonstrating comprehensive knowledge and proficiency in all {subject.topics.length} topics covered.
                      </p>
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs">Date</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">{formatDate(completionDate)}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-200" />
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <Shield className="w-3.5 h-3.5" />
                          <span className="text-xs">Cert ID</span>
                        </div>
                        <p className="text-xs font-mono font-semibold text-gray-700">{certNumber}</p>
                      </div>
                    </div>

                    {/* Seal */}
                    <div className="pt-4 flex justify-center">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          VERIFIED
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onPrint}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Certificate
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  onClick={() => setShowModal(false)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function CertificateView() {
  const store = useProgressStore();
  const completedTopics = store.completedTopics || [];
  const getSubjectProgress = store.getSubjectProgress;
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const subjectCerts = useMemo(() => {
    return subjects.map((subject) => {
      const progress = getSubjectProgress(subject.id);
      const isUnlocked = progress === 100;
      return {
        subject,
        progress,
        isUnlocked,
        certNumber: generateCertNumber(subject.id),
        completionDate: getCompletionDate(subject.id, completedTopics),
      };
    });
  }, [completedTopics, getSubjectProgress]);

  const filteredCerts = useMemo(() => {
    if (filter === 'unlocked') return subjectCerts.filter((c) => c.isUnlocked);
    if (filter === 'locked') return subjectCerts.filter((c) => !c.isUnlocked);
    return subjectCerts;
  }, [subjectCerts, filter]);

  const unlockedCount = subjectCerts.filter((c) => c.isUnlocked).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-4 shadow-lg shadow-amber-500/20"
        >
          <Award className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold">Certificates</h2>
        <p className="text-muted-foreground mt-1">
          Earn certificates by completing all topics in a subject
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">Earned</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{unlockedCount}</p>
            <p className="text-xs text-muted-foreground">of {subjects.length}</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {subjectCerts.filter((c) => c.progress > 0 && c.progress < 100).length}
            </p>
            <p className="text-xs text-muted-foreground">subjects</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-medium text-muted-foreground">Completion</span>
            </div>
            <p className="text-2xl font-bold text-teal-600">
              {Math.round((unlockedCount / subjects.length) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">overall</p>
          </Card>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 justify-center">
        {[
          { key: 'all' as const, label: 'All', count: subjectCerts.length },
          { key: 'unlocked' as const, label: 'Earned', count: unlockedCount },
          { key: 'locked' as const, label: 'Locked', count: subjectCerts.length - unlockedCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              filter === tab.key
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {tab.label}
            <Badge variant="secondary" className="ml-1.5 text-xs">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Certificates Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredCerts.map((cert) => (
            <CertificateCard
              key={cert.subject.id}
              subject={cert.subject}
              progress={cert.progress}
              certNumber={cert.certNumber}
              completionDate={cert.completionDate}
              isUnlocked={cert.isUnlocked}
              onPrint={handlePrint}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredCerts.length === 0 && (
        <div className="text-center py-12">
          <Lock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {filter === 'unlocked'
              ? 'No certificates earned yet. Keep studying!'
              : filter === 'locked'
                ? 'All subjects have been completed!'
                : 'No subjects found.'}
          </p>
        </div>
      )}

      {/* Motivation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-4"
      >
        <p className="text-xs text-muted-foreground">
          🏆 Complete all topics in a subject to earn its certificate
        </p>
      </motion.div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cert-\\*,
          #cert-\\* * {
            visibility: visible;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .fixed,
          nav,
          aside,
          header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
