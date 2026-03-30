'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Lock, CheckCircle2, BookOpen, ChevronLeft, ChevronRight, List, BookMarked } from 'lucide-react';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

/* ─── SecureBookViewer ─── */
interface SecureBookViewerProps {
  bookTitle: string;
  bookId: string;
  children: React.ReactNode;
}

export function SecureBookViewer({ bookTitle, bookId, children }: SecureBookViewerProps) {
  const [isBlurred, setIsBlurred] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [pagesRead, setPagesRead] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const { addSecurityAuditEntry, createBookAccessSession, updateBookPagesRead, invalidateBookSession } = useProgressStore();
  const sessionRef = useRef<string | null>(null);

  // Create access session on mount
  useEffect(() => {
    const token = createBookAccessSession(bookId);
    sessionRef.current = token;
    setTimeout(() => setAccessGranted(true), 300);
    const interval = setInterval(() => {
      setPagesRead(prev => {
        const next = prev + Math.floor(Math.random() * 3) + 1;
        updateBookPagesRead(bookId, next);
        return next;
      });
    }, 8000);
    return () => {
      clearInterval(interval);
      invalidateBookSession(bookId);
    };
  }, [bookId]);

  // Screenshot attempt detection
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setIsBlurred(true);
      addSecurityAuditEntry({ type: 'screenshot_attempt', details: `Tab hidden while viewing: ${bookTitle}` });
    } else {
      setTimeout(() => {
        setIsBlurred(false);
      }, 500);
    }
  }, [bookTitle, addSecurityAuditEntry]);

  // Keyboard shortcut prevention
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      addSecurityAuditEntry({ type: 'keyboard_shortcut', details: `Ctrl+S prevented on: ${bookTitle}` });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      addSecurityAuditEntry({ type: 'print_attempt', details: `Ctrl+P prevented on: ${bookTitle}` });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      if (contentRef.current?.contains(document.activeElement)) {
        const selection = window.getSelection();
        if (selection && contentRef.current?.contains(selection.anchorNode)) {
          e.preventDefault();
          addSecurityAuditEntry({ type: 'copy_attempt', details: `Copy prevented on: ${bookTitle}` });
        }
      }
    }
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      addSecurityAuditEntry({ type: 'screenshot_attempt', details: `PrintScreen prevented on: ${bookTitle}` });
    }
  }, [bookTitle, addSecurityAuditEntry]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (contentRef.current?.contains(e.target as Node)) {
      e.preventDefault();
      addSecurityAuditEntry({ type: 'context_menu', details: `Right-click prevented on: ${bookTitle}` });
    }
  }, [bookTitle, addSecurityAuditEntry]);

  const handleDragStart = useCallback((e: DragEvent) => {
    if (contentRef.current?.contains(e.target as Node)) {
      e.preventDefault();
    }
  }, []);

  const handleCopy = useCallback((e: ClipboardEvent) => {
    if (contentRef.current?.contains(e.target as Node)) {
      e.preventDefault();
      addSecurityAuditEntry({ type: 'copy_attempt', details: `Copy event prevented on: ${bookTitle}` });
    }
  }, [bookTitle, addSecurityAuditEntry]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('copy', handleCopy, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('copy', handleCopy, true);
    };
  }, [handleVisibilityChange, handleKeyDown, handleContextMenu, handleDragStart, handleCopy]);

  return (
    <div className="relative" ref={contentRef}>
      {/* Access Granted Animation */}
      <AnimatePresence>
        {accessGranted && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30"
            >
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <p className="font-bold text-lg">Access Granted</p>
                <p className="text-emerald-100 text-sm">Session token active</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Banner */}
      <div className="sticky top-0 z-50 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium">Protected Content</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 hidden sm:inline">
              — Unauthorized copying or distribution is prohibited
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="w-3 h-3" />
            <span>Pages 1-{Math.min(pagesRead + 10, 50)} of ~350</span>
          </div>
        </div>
      </div>

      {/* Content area with watermark and blur protection */}
      <div
        className={cn(
          'relative select-none print:hidden transition-all duration-500',
          isBlurred && 'blur-xl pointer-events-none'
        )}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
      >
        {/* Watermark overlay */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden z-40"
          aria-hidden="true"
        >
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 120px, rgba(0,0,0,0.02) 120px, rgba(0,0,0,0.02) 121px), repeating-linear-gradient(45deg, transparent, transparent 120px, rgba(0,0,0,0.02) 120px, rgba(0,0,0,0.02) 121px)`,
          }} />
          {Array.from({ length: 12 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <div
                key={`${row}-${col}`}
                className="absolute text-[11px] font-semibold text-gray-300 dark:text-gray-700 whitespace-nowrap"
                style={{
                  top: `${row * 15 - 5}%`,
                  left: `${col * 25 - 10}%`,
                  transform: 'rotate(-35deg)',
                  opacity: 0.35,
                  letterSpacing: '0.05em',
                }}
              >
                Protected Content - DataTrack
              </div>
            ))
          )}
        </div>

        {/* Book content */}
        <div className="relative z-30">
          {children}
        </div>

        {/* Blur overlay when screenshot detected */}
        <AnimatePresence>
          {isBlurred && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <div className="text-center space-y-3 p-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
                </motion.div>
                <p className="font-semibold text-lg">Content Protected</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  This content is protected against unauthorized reproduction.
                  Please return to the tab to continue reading.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visually hidden for screen readers */}
      <VisuallyHidden>
        This is protected book content for {bookTitle}. Protected by DataTrack content security.
      </VisuallyHidden>

      {/* Print protection styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Secure Read Dialog Content with Chapter Navigation ─── */
export function SecureBookContent({
  title,
  author,
  bookId,
  chapters = [],
  chapterPreview = [],
  keyTakeaways = [],
  totalPages = 300,
}: {
  title: string;
  author: string;
  bookId: string;
  chapters?: string[];
  chapterPreview?: string[];
  keyTakeaways?: string[];
  totalPages?: number;
}) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showToc, setShowToc] = useState(true);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Generate rich content for each chapter based on index
  const getChapterContent = (chapterIndex: number) => {
    const chapterTitle = chapters[chapterIndex] || `Chapter ${chapterIndex + 1}`;
    
    // Use the chapterPreview paragraphs mapped to chapters, or generate placeholder
    const paragraphs = chapterPreview.length > 0
      ? chapterPreview.slice(chapterIndex * 1, chapterIndex * 1 + 2)
      : [];

    const chapterTakeaways = keyTakeaways.length > 0
      ? keyTakeaways.slice(chapterIndex * 1, (chapterIndex + 1) * 1)
      : [];

    return {
      paragraphs: paragraphs.length > 0 ? paragraphs : [
        `This section of ${title} covers ${chapterTitle.toLowerCase()}. The material provides an in-depth exploration of the key concepts, methodologies, and practical applications that professionals and students need to master.`,
        `Throughout this section, the author draws on real-world examples and case studies to illustrate complex ideas in an accessible way. Each concept builds upon the previous one, creating a comprehensive understanding that readers can immediately apply in their work.`,
        `By the end of this section, you will have gained practical skills and theoretical knowledge that form the foundation of expertise in this area. The exercises and examples provided are designed to reinforce learning and encourage hands-on practice.`,
      ],
      takeaways: chapterTakeaways.length > 0 ? chapterTakeaways : [
        'Understanding the core principles is essential for practical application',
        'Practice with real-world examples to solidify your knowledge',
        'Connect concepts to your own projects and experiences',
      ],
    };
  };

  const chapterContent = getChapterContent(currentChapter);
  const totalChapters = chapters.length;
  const readingProgress = Math.round(((currentChapter + 1) / totalChapters) * 100);
  const estimatedPages = Math.round((totalPages / totalChapters) * (currentChapter + 1));

  const goToChapter = (index: number) => {
    setCurrentChapter(index);
    setShowToc(false);
    setTimeout(() => {
      contentAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const nextChapter = () => {
    if (currentChapter < totalChapters - 1) {
      goToChapter(currentChapter + 1);
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      goToChapter(currentChapter - 1);
    }
  };

  return (
    <SecureBookViewer bookTitle={title} bookId={bookId}>
      <div className="flex flex-col h-[85vh]">
        {/* Book Header */}
        <div className="shrink-0 px-6 lg:px-10 pt-6 pb-4 border-b border-border/30">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight truncate">{title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">by {author}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant={showToc ? 'default' : 'outline'}
                onClick={() => setShowToc(!showToc)}
                className={cn(
                  'rounded-lg text-xs',
                  showToc && 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                )}
              >
                <List className="w-3.5 h-3.5 mr-1.5" />
                Contents
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${readingProgress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium shrink-0">{readingProgress}%</span>
          </div>

          {/* Chapter navigation breadcrumb */}
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <BookMarked className="w-3 h-3" />
            <span>Chapter {currentChapter + 1} of {totalChapters}</span>
            <span>·</span>
            <span>Page ~{estimatedPages - Math.round(totalPages / totalChapters) + 1}-{estimatedPages}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Table of Contents Sidebar */}
          <AnimatePresence>
            {showToc && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 border-r border-border/30 overflow-hidden"
              >
                <div className="w-[260px] p-4 h-full overflow-y-auto">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    Table of Contents
                  </h3>
                  <div className="space-y-0.5">
                    {chapters.map((chapter, i) => (
                      <button
                        key={i}
                        onClick={() => goToChapter(i)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-xs transition-all',
                          i === currentChapter
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                          <span className="line-clamp-2">{chapter}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Chapter Content */}
          <div ref={contentAreaRef} className="flex-1 overflow-y-auto px-6 lg:px-10 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChapter}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                {/* Chapter Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Chapter {currentChapter + 1}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      ~{Math.round(totalPages / totalChapters)} pages
                    </Badge>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold tracking-tight">
                    {chapters[currentChapter] || `Chapter ${currentChapter + 1}`}
                  </h2>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-amber-400 text-sm">★</span>
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">4.8 avg rating</span>
                  </div>
                </div>

                {/* Chapter Content */}
                <div className="space-y-4">
                  {chapterContent.paragraphs.map((paragraph, i) => (
                    <p key={i} className="text-sm leading-relaxed text-foreground/80">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Key Takeaways */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 space-y-3 mt-6">
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
                    ✨ Key Takeaways — Chapter {currentChapter + 1}
                  </h3>
                  <ul className="space-y-2 text-xs text-emerald-600 dark:text-emerald-400">
                    {chapterContent.takeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chapter Summary Box */}
                <div className="bg-muted/30 border border-border/50 rounded-xl p-5 space-y-2 mt-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    📝 Chapter Summary
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This chapter has covered the essential concepts of {chapters[currentChapter]?.toLowerCase() || 'this topic'}. 
                    The principles discussed here form the building blocks for the more advanced material in subsequent chapters. 
                    Take time to review the key takeaways and consider how these concepts apply to your own work and study.
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 mt-6 border-t border-border/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevChapter}
                    disabled={currentChapter === 0}
                    className="rounded-lg text-xs gap-1.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {chapters.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToChapter(i)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          i === currentChapter
                            ? 'bg-emerald-500 w-6'
                            : i < currentChapter
                              ? 'bg-emerald-300 dark:bg-emerald-700'
                              : 'bg-muted-foreground/20'
                        )}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextChapter}
                    disabled={currentChapter === totalChapters - 1}
                    className="rounded-lg text-xs gap-1.5"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* End of Book Message */}
                {currentChapter === totalChapters - 1 && (
                  <div className="text-center py-8 mt-4 border-t border-border/30">
                    <p className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      End of Book Preview
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      You have reached the end of the available preview chapters.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Full book content available with an active Pro subscription — {totalPages} total pages.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="shrink-0 border-t border-border/30 px-6 lg:px-10 py-3 bg-muted/20">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevChapter}
              disabled={currentChapter === 0}
              className="text-xs gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{chapters[currentChapter - 1] || 'Previous'}</span>
              <span className="sm:hidden">Previous</span>
            </Button>

            <span className="text-xs text-muted-foreground font-medium">
              {chapters[currentChapter] || `Chapter ${currentChapter + 1}`}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextChapter}
              disabled={currentChapter === totalChapters - 1}
              className="text-xs gap-1.5"
            >
              <span className="hidden sm:inline">{chapters[currentChapter + 1] || 'Next'}</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </SecureBookViewer>
  );
}
