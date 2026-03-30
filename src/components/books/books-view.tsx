'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  BookOpen, Eye, Star, BookMarked, BookCheck, BookX, Library, Search, Filter,
  TrendingUp, CheckCircle2, Upload, Trash2, X, FileText, Image, AlertTriangle,
  Plus, BookPlus, FileUp, Loader2, Info, Heart, Grid, List,
  Share2, Sparkles, Clock, MessageSquare, ChevronRight,
  Copy, Check, ArrowUpDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogTitle, VisuallyHidden } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { books, type Book } from '@/lib/books-data';
import { subjects } from '@/lib/study-data';
import { useProgressStore, type UserBook } from '@/lib/store';
import { SecureBookContent } from '@/components/books/book-security';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type BookStatus = 'none' | 'want' | 'reading' | 'completed';
type ViewMode = 'grid' | 'list';
type SortMode = 'az' | 'rating' | 'recent' | 'popular';
type DetailTab = 'overview' | 'chapters' | 'reviews' | 'notes';

const statusConfig: Record<BookStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  none: { label: 'Want to Read', icon: BookX, color: 'text-muted-foreground', bg: 'bg-muted hover:bg-muted/80' },
  want: { label: 'Want to Read', icon: BookMarked, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50' },
  reading: { label: 'Reading', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50' },
  completed: { label: 'Completed', icon: BookCheck, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50' },
};

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

const gradientColors = [
  'from-emerald-400 to-teal-500',
  'from-cyan-400 to-sky-500',
  'from-violet-400 to-purple-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-blue-400 to-indigo-500',
  'from-teal-400 to-cyan-500',
  'from-fuchsia-400 to-pink-600',
  'from-lime-400 to-green-500',
  'from-red-400 to-rose-500',
];

const cycleStatus = (current: BookStatus): BookStatus => {
  if (current === 'none') return 'want';
  if (current === 'want') return 'reading';
  if (current === 'reading') return 'completed';
  return 'none';
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, duration = 800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

/* ─── Star Rating Component ─── */
function StarRating({
  rating,
  onRate,
  size = 'sm',
  interactive = false,
  hoverRating,
  onHover,
  onLeave,
}: {
  rating: number;
  onRate?: (r: number) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  hoverRating?: number;
  onHover?: (r: number) => void;
  onLeave?: () => void;
}) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  const displayRating = hoverRating !== undefined && hoverRating > 0 ? hoverRating : rating;

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={onLeave}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            'transition-all duration-150',
            i < displayRating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted/30 text-muted/40',
            interactive && 'cursor-pointer hover:scale-125'
          )}
          onClick={() => interactive && onRate?.(i + 1)}
          onMouseEnter={() => interactive && onHover?.(i + 1)}
        />
      ))}
      <span className={cn(
        'font-semibold ml-1',
        size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
        'text-muted-foreground'
      )}>
        {rating}.0
      </span>
    </div>
  );
}

/* ─── Upload Book Dialog ─── */
function UploadBookDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState('');
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const addUserBook = useProgressStore((s) => s.addUserBook);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setDescription('');
    setSubject('');
    setDifficulty('Beginner');
    setCoverImage(null);
    setCoverFileName('');
    setPdfFile(null);
    setPdfFileName('');
    setPdfFileSize(0);
    setIsUploading(false);
  };

  const handleCoverSelect = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Cover image must be under 5 MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setCoverImage(e.target?.result as string); setCoverFileName(file.name); };
    reader.readAsDataURL(file);
  };

  const handlePdfSelect = (file: File) => {
    if (file.type !== 'application/pdf') { toast.error('Please select a PDF file'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('PDF must be under 50 MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setPdfFile(e.target?.result as string); setPdfFileName(file.name); setPdfFileSize(file.size); };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, type: 'cover' | 'pdf') => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) { if (type === 'cover') handleCoverSelect(file); else handlePdfSelect(file); }
  };

  const handleUpload = async () => {
    if (!title.trim()) { toast.error('Book title is required'); return; }
    if (!author.trim()) { toast.error('Author name is required'); return; }
    if (!subject) { toast.error('Please select a subject'); return; }
    setIsUploading(true);
    await new Promise((r) => setTimeout(r, 800));
    const subjectData = subjects.find((s) => s.id === subject);
    addUserBook({
      title: title.trim(), author: author.trim(),
      description: description.trim() || `A ${difficulty.toLowerCase()} level resource on ${subjectData?.title || subject}.`,
      subject, difficulty,
      coverColor: gradientColors[Math.floor(Math.random() * gradientColors.length)],
      rating: 4, topics: [subject], coverImage: coverImage || '', pdfData: pdfFile || '',
      fileName: pdfFileName || 'No file', fileSize: pdfFileSize,
      content: { chapters: ['Chapter 1: Introduction'], chapterPreview: ['Preview content.'], keyTakeaways: ['Key takeaway.'], totalPages: 100 },
    });
    toast.success(`"${title.trim()}" uploaded successfully!`);
    resetForm();
    onClose();
  };

  const handleClose = () => { resetForm(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>Upload New Book</DialogTitle>
          <DialogDescription>Add a new book to your library with cover image and PDF.</DialogDescription>
        </VisuallyHidden>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <BookPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Upload New Book</h2>
              <p className="text-sm text-muted-foreground">Add a book to your personal library</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="book-title" className="text-sm font-semibold">Book Title *</Label>
              <Input id="book-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter book title..." className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-author" className="text-sm font-semibold">Author *</Label>
              <Input id="book-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Enter author name..." className="h-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-desc" className="text-sm font-semibold">Description</Label>
            <Textarea id="book-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." className="min-h-[80px] text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Subject *</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select a subject..." /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (<SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as 'Beginner' | 'Intermediate' | 'Advanced')}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2"><Image className="w-4 h-4" /> Cover Image</Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => handleDrop(e, 'cover')}
              className={cn('relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
                dragActive ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : coverImage ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/10' : 'border-border/60 hover:border-amber-300 hover:bg-muted/30'
              )}
              onClick={() => coverInputRef.current?.click()}
            >
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleCoverSelect(e.target.files[0])} />
              {coverImage ? (
                <div className="space-y-3">
                  <div className="w-20 h-28 mx-auto rounded-lg overflow-hidden shadow-lg border border-border/50"><img src={coverImage} alt="Cover" className="w-full h-full object-cover" /></div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{coverFileName}</p>
                  <p className="text-xs text-muted-foreground">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image className="w-10 h-10 mx-auto text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">Drag & drop cover image or click to browse</p>
                  <p className="text-xs text-muted-foreground/70">PNG, JPG up to 5 MB</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> PDF File</Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => handleDrop(e, 'pdf')}
              className={cn('relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
                dragActive ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : pdfFile ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/10' : 'border-border/60 hover:border-amber-300 hover:bg-muted/30'
              )}
              onClick={() => pdfInputRef.current?.click()}
            >
              <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handlePdfSelect(e.target.files[0])} />
              {pdfFile ? (
                <div className="flex items-center gap-4 justify-center">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><FileText className="w-6 h-6 text-red-500" /></div>
                  <div className="text-left"><p className="text-sm font-semibold">{pdfFileName}</p><p className="text-xs text-muted-foreground">{formatFileSize(pdfFileSize)}</p></div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setPdfFile(null); setPdfFileName(''); setPdfFileSize(0); }}><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileUp className="w-10 h-10 mx-auto text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">Drag & drop PDF or click to browse</p>
                  <p className="text-xs text-muted-foreground/70">PDF up to 50 MB</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">Books are stored locally in your browser. For best experience, keep files under 10 MB.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleClose} variant="outline" className="flex-1 h-11 rounded-xl font-medium">Cancel</Button>
            <Button onClick={handleUpload} disabled={isUploading || !title.trim() || !author.trim() || !subject}
              className="flex-1 h-11 rounded-xl font-medium bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-amber-500/20">
              {isUploading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>) : (<><Upload className="w-4 h-4 mr-2" />Upload Book</>)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Delete Confirmation Dialog ─── */
function DeleteBookDialog({ open, onClose, onConfirm, bookTitle }: { open: boolean; onClose: () => void; onConfirm: () => void; bookTitle: string }) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" />Delete Book</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{bookTitle}&quot;</span>? This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="rounded-xl bg-red-500 hover:bg-red-600 text-white"><Trash2 className="w-4 h-4 mr-2" />Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ─── Book Detail Modal ─── */
function BookDetailModal({
  book,
  open,
  onClose,
  onRead,
}: {
  book: Book & { isUserBook?: boolean; coverImage?: string };
  open: boolean;
  onClose: () => void;
  onRead: (book: Book & { isUserBook?: boolean }) => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [notesText, setNotesText] = useState('');
  const [chapterChecks, setChapterChecks] = useState<boolean[]>([]);
  const store = useProgressStore();
  const bookReviews = (store.bookReviews || []).filter((r) => r.bookId === book.id);
  const userRating = (store.bookRatings || {})[book.id] || 0;
  const isFav = (store.bookmarkedBooks || []).includes(book.id);
  const progress = (store.readingProgress || {})[book.id] || 0;
  const bookNotes = (store.bookNotes || {})[book.id] || '';
  const bookStatus = (store.bookStatuses || {})[book.id] || 'none';

  const [prevBookId, setPrevBookId] = useState<string | null>(null);
  if (open && prevBookId !== book.id) {
    setPrevBookId(book.id);
    setActiveTab('overview');
    setNotesText(bookNotes);
    setChapterChecks(book.content.chapters.map(() => false));
  } else if (open && prevBookId === book.id) {
    setNotesText(bookNotes);
  }

  const handleRate = useCallback((r: number) => {
    store.setBookRating(book.id, r);
    toast.success(`Rated "${book.title}" ${r} star${r > 1 ? 's' : ''}`);
  }, [store, book.id, book.title]);

  const handleToggleFav = useCallback(() => {
    store.toggleBookmark(book.id);
    const willFav = !isFav;
    toast.success(willFav ? 'Added to favorites' : 'Removed from favorites');
  }, [store, book.id, isFav]);

  const handleAddReview = () => {
    if (!reviewText.trim()) { toast.error('Please write a review'); return; }
    store.addBookReview(book.id, reviewText.trim(), reviewRating);
    setReviewText('');
    setReviewRating(5);
    toast.success('Review added!');
  };

  const handleSaveNotes = () => {
    store.setBookNotes(book.id, notesText);
    toast.success('Notes saved!');
  };

  const handleShare = () => {
    const text = `Check out "${book.title}" by ${book.author} — rated ${book.rating}/5`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('Book link copied to clipboard!');
    } else {
      toast.success('Share: ' + text);
    }
  };

  const completedChapters = chapterChecks.filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <VisuallyHidden>
          <DialogTitle>{book.title} — Detail View</DialogTitle>
          <DialogDescription>Book details with overview, chapters, reviews, and notes.</DialogDescription>
        </VisuallyHidden>

        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={cn('w-12 h-16 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md', book.coverColor)}>
              {book.coverImage ? (
                <img src={book.coverImage} alt="" className="w-full h-full rounded-lg object-cover" />
              ) : (
                <BookOpen className="w-6 h-6 text-white/80" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-lg truncate">{book.title}</h2>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-lg" onClick={handleToggleFav}>
              <motion.div whileTap={{ scale: 1.3 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Heart className={cn('w-4.5 h-4.5', isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground')} />
              </motion.div>
            </Button>
            <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-lg" onClick={handleShare}>
              <Share2 className="w-4.5 h-4.5 text-muted-foreground" />
            </Button>
            <Button size="sm" className="h-9 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-xs font-medium shadow-md" onClick={() => onRead(book)}>
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Read
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetailTab)} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-3">
            <TabsList className="bg-muted/50 w-full h-10">
              <TabsTrigger value="overview" className="flex-1 text-xs font-medium gap-1.5"><BookOpen className="w-3.5 h-3.5" />Overview</TabsTrigger>
              <TabsTrigger value="chapters" className="flex-1 text-xs font-medium gap-1.5"><List className="w-3.5 h-3.5" />Chapters</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1 text-xs font-medium gap-1.5"><MessageSquare className="w-3.5 h-3.5" />Reviews</TabsTrigger>
              <TabsTrigger value="notes" className="flex-1 text-xs font-medium gap-1.5"><FileText className="w-3.5 h-3.5" />My Notes</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cover */}
                <div className="md:col-span-1">
                  <div className={cn('relative aspect-[3/4] rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl overflow-hidden', book.coverColor)}>
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/30" />
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                          <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white/10" />
                        </div>
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-white" />
                        </div>
                      </>
                    )}
                    {book.isUserBook && (
                      <Badge className="absolute top-3 left-3 text-[10px] font-semibold bg-violet-500 text-white border-0">Uploaded</Badge>
                    )}
                    <Badge className={cn('absolute bottom-3 left-3 text-[10px] font-semibold border', difficultyColors[book.difficulty])}>
                      {book.difficulty}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="md:col-span-2 space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300">{book.title}</h3>
                    <p className="text-base text-muted-foreground mt-1">by {book.author}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Your Rating:</span>
                      <StarRating rating={userRating || book.rating} onRate={handleRate} size="md" interactive hoverRating={hoverRating} onHover={setHoverRating} onLeave={() => setHoverRating(0)} />
                    </div>
                    <Badge variant="outline" className={cn('text-xs border', difficultyColors[book.difficulty])}>{book.difficulty}</Badge>
                    <Badge variant="secondary" className="text-xs">{book.content.totalPages} pages</Badge>
                  </div>

                  {progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reading Progress</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{progress}%</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-sm leading-relaxed text-muted-foreground">{book.description}</p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {book.topics.map((t) => {
                        const sub = subjects.find((s) => s.id === t);
                        return sub ? <Badge key={t} variant="secondary" className="text-xs">{sub.title}</Badge> : null;
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => onRead(book)} className="flex-1 h-11 rounded-xl font-medium bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-amber-500/20">
                      <Eye className="w-4 h-4 mr-2" />Start Reading
                    </Button>
                    <Button variant="outline" onClick={handleToggleFav} className={cn('h-11 px-5 rounded-xl font-medium border', isFav ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' : '')}>
                      <Heart className={cn('w-4 h-4 mr-2', isFav && 'fill-rose-500')} />{isFav ? 'Favorited' : 'Favorite'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Chapters Tab */}
            <TabsContent value="chapters" className="mt-0 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-amber-700 dark:text-amber-300">Chapters</h4>
                <span className="text-sm text-muted-foreground">{completedChapters} / {book.content.chapters.length} completed</span>
              </div>
              {progress > 0 && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              )}
              <div className="space-y-2">
                {book.content.chapters.map((ch, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer',
                      chapterChecks[i]
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-card border-border/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/10'
                    )}
                    onClick={() => {
                      const newChecks = [...chapterChecks];
                      newChecks[i] = !newChecks[i];
                      setChapterChecks(newChecks);
                      const pct = Math.round((newChecks.filter(Boolean).length / newChecks.length) * 100);
                      store.setReadingProgress(book.id, pct);
                    }}
                  >
                    <div className={cn(
                      'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                      chapterChecks[i] ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/30'
                    )}>
                      {chapterChecks[i] && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm font-medium truncate', chapterChecks[i] && 'text-emerald-700 dark:text-emerald-300')}>{ch}</p>
                      <p className="text-xs text-muted-foreground">{book.content.chapterPreview[i]?.slice(0, 80)}...</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-0 space-y-6">
              {/* Add Review */}
              <div className="p-4 rounded-xl border bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-800/30 space-y-3">
                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300">Write a Review</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <StarRating rating={reviewRating} onRate={setReviewRating} size="md" interactive hoverRating={hoverRating} onHover={setHoverRating} onLeave={() => setHoverRating(0)} />
                </div>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  className="min-h-[80px] text-sm"
                />
                <Button onClick={handleAddReview} disabled={!reviewText.trim()}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-lg text-sm shadow-md shadow-amber-500/20">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />Submit Review
                </Button>
              </div>

              {/* Reviews List */}
              {bookReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="font-semibold text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Be the first to review this book!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookReviews.map((review) => (
                    <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {review.user.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold">{review.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span>
                          {review.user === 'You' && (
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                              onClick={() => { store.removeBookReview(review.id); toast.success('Review removed'); }}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-amber-700 dark:text-amber-300">My Reading Notes</h4>
                {notesText && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Auto-saved locally</span>
                )}
              </div>
              <Textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Write your notes, highlights, and insights about this book..."
                className="min-h-[250px] text-sm leading-relaxed"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{notesText.length} characters</span>
                <Button onClick={handleSaveNotes}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-lg text-sm shadow-md shadow-amber-500/20">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />Save Notes
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Component ─── */
export default function BooksView() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('az');
  const [secureReadBook, setSecureReadBook] = useState<(Book & { isUserBook?: boolean }) | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserBook | null>(null);
  const [detailBook, setDetailBook] = useState<(Book & { isUserBook?: boolean; coverImage?: string }) | null>(null);

  const store = useProgressStore();
  const bookStatuses = store.bookStatuses || {};
  const setBookStatus = store.setBookStatus;
  const isProUser = store.isProUser || (() => false);
  const userBooks = store.userBooks || [];
  const removeUserBook = store.removeUserBook;
  const bookRatings = store.bookRatings || {};
  const bookmarkedBooks = store.bookmarkedBooks || [];
  const readingProgress = store.readingProgress || {};

  const allBooks = useMemo(() => {
    return [...books, ...userBooks.map((ub) => ({
      id: ub.id, title: ub.title, author: ub.author, coverColor: ub.coverColor,
      rating: ub.rating, difficulty: ub.difficulty, topics: ub.topics,
      description: ub.description, content: ub.content, isUserBook: true,
      coverImage: ub.coverImage, pdfData: ub.pdfData,
    } as Book & { isUserBook?: boolean; coverImage?: string; pdfData?: string }))];
  }, [userBooks]);

  const featuredBook = useMemo(() => {
    const fiveStar = allBooks.filter((b) => b.rating === 5);
    return fiveStar[Math.floor(Date.now() / 86400000) % fiveStar.length] || allBooks[0];
  }, [allBooks]);

  const filteredBooks = useMemo(() => {
    let result = allBooks;
    if (selectedSubject !== 'all') {
      result = result.filter((book) => book.topics.includes(selectedSubject));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((book) =>
        book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q) || book.description.toLowerCase().includes(q)
      );
    }
    switch (sortMode) {
      case 'az': result = [...result].sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'rating': result = [...result].sort((a, b) => b.rating - a.rating); break;
      case 'popular': result = [...result].sort((a, b) => {
        const aRate = bookRatings[a.id] || 0;
        const bRate = bookRatings[b.id] || 0;
        return bRate - aRate;
      }); break;
      case 'recent': result = [...result].reverse(); break;
    }
    return result;
  }, [selectedSubject, searchQuery, allBooks, sortMode, bookRatings]);

  const stats = useMemo(() => {
    const statuses = Object.values(bookStatuses);
    return {
      total: allBooks.length,
      uploaded: userBooks.length,
      reading: statuses.filter((s) => s === 'reading').length,
      completed: statuses.filter((s) => s === 'completed').length,
      favorites: bookmarkedBooks.length,
    };
  }, [bookStatuses, allBooks.length, userBooks.length, bookmarkedBooks.length]);

  const handleRead = (book: Book & { isUserBook?: boolean }) => { setSecureReadBook(book); };
  const handleDelete = () => {
    if (deleteTarget) {
      removeUserBook(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/5 dark:via-background dark:to-background">
      {/* Decorative background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 49px, currentColor 49px, currentColor 50px),
            repeating-linear-gradient(90deg, transparent, transparent 49px, currentColor 49px, currentColor 50px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 p-6 lg:p-8 text-white"
        >
          {/* Floating book icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[
              { top: '10%', left: '5%', size: 20, delay: 0, duration: 8 },
              { top: '20%', right: '10%', size: 16, delay: 1, duration: 6 },
              { top: '60%', left: '15%', size: 14, delay: 2, duration: 7 },
              { top: '70%', right: '20%', size: 18, delay: 0.5, duration: 9 },
              { top: '30%', left: '50%', size: 12, delay: 3, duration: 5 },
              { top: '80%', left: '60%', size: 16, delay: 1.5, duration: 8 },
            ].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute text-white/10"
                style={{ top: pos.top, left: pos.left, right: pos.right }}
                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: pos.duration, repeat: Infinity, delay: pos.delay, ease: 'easeInOut' }}
              >
                <BookOpen style={{ width: pos.size, height: pos.size }} />
              </motion.div>
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Library className="w-6 h-6 text-amber-200" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Digital Library</h1>
                    <p className="text-amber-200/80 text-sm">Your curated collection for data analytics mastery</p>
                  </div>
                </div>

                {/* Search in hero */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-300/60" />
                  <Input
                    placeholder="Search books, authors, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-amber-300/50 focus:bg-white/15 focus:border-amber-400/40 h-10 rounded-xl"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300/60 hover:text-amber-200">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Featured Book Spotlight */}
              {featuredBook && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="hidden lg:block cursor-pointer group"
                  onClick={() => setDetailBook(featuredBook as Book & { isUserBook?: boolean; coverImage?: string })}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Featured Book</span>
                  </div>
                  <div className="flex gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 group-hover:bg-white/15 transition-colors">
                    <div className={cn('w-16 h-22 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0', featuredBook.coverColor)}>
                      <BookOpen className="w-7 h-7 text-white/80" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-amber-200 transition-colors">{featuredBook.title}</p>
                      <p className="text-xs text-amber-200/60 mt-0.5">{featuredBook.author}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn('w-3 h-3', i < featuredBook.rating ? 'fill-amber-400 text-amber-400' : 'fill-white/20 text-white/20')} />
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-300/40 group-hover:text-amber-300 shrink-0 transition-colors" />
                  </div>
                </motion.div>
              )}

              <Button
                onClick={() => setShowUploadDialog(true)}
                className="shrink-0 h-11 px-5 rounded-xl font-medium bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/20 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />Upload Book
              </Button>
            </div>

            {/* Stats Ribbon */}
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-white/15">
              {[
                { label: 'Books', value: stats.total, icon: BookOpen },
                { label: 'Reading', value: stats.reading, icon: TrendingUp },
                { label: 'Completed', value: stats.completed, icon: CheckCircle2 },
                { label: 'Favorites', value: stats.favorites, icon: Heart },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 text-amber-100/80">
                  <stat.icon className="w-4 h-4 text-amber-300/60" />
                  <span className="text-lg font-bold text-white"><AnimatedCounter target={stat.value} /></span>
                  <span className="text-xs text-amber-200/60">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {!isProUser() && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
              <Eye className="w-4 h-4 shrink-0" />
              <span>Guest access — Preview books. Upgrade to Pro for full content.</span>
            </div>
          </motion.div>
        )}

        {/* View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
        >
          {/* View Toggle */}
          <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border/50">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'grid' ? 'bg-white shadow-sm text-amber-700 dark:text-amber-300' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'list' ? 'bg-white shadow-sm text-amber-700 dark:text-amber-300' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort */}
          <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
            <SelectTrigger className="w-44 h-9 rounded-xl text-xs border-border/50">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="az">A — Z</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          {/* Book count */}
          <span className="text-sm text-muted-foreground">{filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}</span>
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setSelectedSubject('all')}
            className={cn(
              'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border',
              selectedSubject === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-amber-500 shadow-md shadow-amber-500/20'
                : 'border-border/60 text-muted-foreground hover:border-amber-300 hover:text-amber-700 dark:hover:text-amber-300'
            )}
          >
            All ({allBooks.length})
          </button>
          {subjects.map((subject) => {
            const count = allBooks.filter((b) => b.topics.includes(subject.id)).length;
            if (count === 0) return null;
            return (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={cn(
                  'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border',
                  selectedSubject === subject.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-amber-500 shadow-md shadow-amber-500/20'
                    : 'border-border/60 text-muted-foreground hover:border-amber-300 hover:text-amber-700 dark:hover:text-amber-300'
                )}
              >
                {subject.title} ({count})
              </button>
            );
          })}
        </motion.div>

        {/* Book Grid / List */}
        <AnimatePresence mode="wait">
          {filteredBooks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-24 h-24 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center mb-4 border border-amber-200/50 dark:border-amber-800/30">
                <BookOpen className="w-12 h-12 text-amber-300 dark:text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                {searchQuery || selectedSubject !== 'all'
                  ? 'Try adjusting your search or filter.'
                  : 'Your library is empty. Upload your first book!'}
              </p>
              {!searchQuery && selectedSubject === 'all' && (
                <Button onClick={() => setShowUploadDialog(true)}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl shadow-lg shadow-amber-500/20">
                  <Upload className="w-4 h-4 mr-2" />Upload Your First Book
                </Button>
              )}
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredBooks.map((book, index) => (
                <BookGridCard
                  key={book.id}
                  book={book}
                  index={index}
                  status={bookStatuses[book.id] || 'none'}
                  onStatusChange={setBookStatus}
                  onRead={handleRead}
                  onDetail={() => setDetailBook(book as Book & { isUserBook?: boolean; coverImage?: string })}
                  isPro={isProUser()}
                  isUserBook={!!('isUserBook' in book && book.isUserBook)}
                  coverImage={'isUserBook' in book ? book.coverImage : undefined}
                  onDelete={'isUserBook' in book && book.isUserBook ? () => setDeleteTarget(userBooks.find((ub) => ub.id === book.id)!) : undefined}
                  userRating={bookRatings[book.id] || 0}
                  isFav={bookmarkedBooks.includes(book.id)}
                  progress={readingProgress[book.id] || 0}
                  onRate={(r) => { store.setBookRating(book.id, r); toast.success(`Rated ${r} star${r > 1 ? 's' : ''}`); }}
                  onToggleFav={() => { store.toggleBookmark(book.id); }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredBooks.map((book, index) => (
                <BookListItem
                  key={book.id}
                  book={book}
                  index={index}
                  status={bookStatuses[book.id] || 'none'}
                  onStatusChange={setBookStatus}
                  onRead={handleRead}
                  onDetail={() => setDetailBook(book as Book & { isUserBook?: boolean; coverImage?: string })}
                  isPro={isProUser()}
                  isUserBook={!!('isUserBook' in book && book.isUserBook)}
                  coverImage={'isUserBook' in book ? book.coverImage : undefined}
                  onDelete={'isUserBook' in book && book.isUserBook ? () => setDeleteTarget(userBooks.find((ub) => ub.id === book.id)!) : undefined}
                  userRating={bookRatings[book.id] || 0}
                  isFav={bookmarkedBooks.includes(book.id)}
                  progress={readingProgress[book.id] || 0}
                  onRate={(r) => { store.setBookRating(book.id, r); toast.success(`Rated ${r} star${r > 1 ? 's' : ''}`); }}
                  onToggleFav={() => { store.toggleBookmark(book.id); }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section divider */}
        <Separator className="bg-amber-200/50 dark:bg-amber-800/30" />

        {/* Dialogs */}
        <UploadBookDialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} />
        <DeleteBookDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} bookTitle={deleteTarget?.title || ''} />

        {detailBook && (
          <BookDetailModal book={detailBook} open={!!detailBook} onClose={() => setDetailBook(null)} onRead={handleRead} />
        )}

        <Dialog open={!!secureReadBook} onOpenChange={(open) => !open && setSecureReadBook(null)}>
          <DialogContent className="sm:max-w-5xl h-[92vh] p-0 overflow-hidden flex flex-col">
            <VisuallyHidden>
              <DialogTitle>Book Reader — {secureReadBook?.title}</DialogTitle>
              <DialogDescription>Secure book content viewer with protection.</DialogDescription>
            </VisuallyHidden>
            {secureReadBook && (
              <SecureBookContent
                title={secureReadBook.title}
                author={secureReadBook.author}
                bookId={secureReadBook.id}
                chapters={secureReadBook.content.chapters}
                chapterPreview={secureReadBook.content.chapterPreview}
                keyTakeaways={secureReadBook.content.keyTakeaways}
                totalPages={secureReadBook.content.totalPages}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* ─── Book Grid Card ─── */
function BookGridCard({
  book, index, status, onStatusChange, onRead, onDetail, isPro, isUserBook, coverImage, onDelete,
  userRating, isFav, progress, onRate, onToggleFav,
}: {
  book: Book & { isUserBook?: boolean; coverImage?: string };
  index: number;
  status: BookStatus;
  onStatusChange: (id: string, status: BookStatus) => void;
  onRead: (book: Book & { isUserBook?: boolean }) => void;
  onDetail: () => void;
  isPro: boolean;
  isUserBook?: boolean;
  coverImage?: string;
  onDelete?: () => void;
  userRating: number;
  isFav: boolean;
  progress: number;
  onRate: (r: number) => void;
  onToggleFav: () => void;
}) {
  const config = statusConfig[status];
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = userRating || book.rating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className="group"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        whileHover={{ rotateY: -3, scale: 1.02, y: -8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="h-full"
      >
        <Card className="h-full overflow-hidden border-border/50 bg-white dark:bg-amber-950/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer"
          onClick={onDetail}
        >
          <CardContent className="p-0 relative">
            {/* Cover */}
            <div className={cn('relative h-48 bg-gradient-to-br flex items-center justify-center overflow-hidden', book.coverColor)}>
              {coverImage ? (
                <img src={coverImage} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/30" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                    <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white/10" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                </>
              )}

              {/* Badges */}
              <Badge className={cn('absolute top-3 right-3 text-[10px] font-semibold border z-10', difficultyColors[book.difficulty])}>
                {book.difficulty}
              </Badge>
              {isUserBook && (
                <Badge className="absolute top-3 left-3 text-[10px] font-semibold bg-violet-500 text-white border-0 z-10">
                  Uploaded
                </Badge>
              )}

              {/* Favorite heart */}
              <motion.button
                whileTap={{ scale: 1.4 }}
                onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
                className="absolute top-3 right-16 z-10 w-7 h-7 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className={cn('w-3.5 h-3.5', isFav ? 'fill-rose-400 text-rose-400' : 'text-white/80')} />
              </motion.button>

              {/* Hover overlay actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); onRead(book); }}
                  className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <Eye className="w-4.5 h-4.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
                  className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <Heart className={cn('w-4.5 h-4.5', isFav && 'fill-rose-400')} />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2.5">
              <div onClick={(e) => e.stopPropagation()}>
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
              </div>

              {/* Star rating */}
              <div onClick={(e) => e.stopPropagation()}>
                <StarRating
                  rating={displayRating}
                  onRate={onRate}
                  size="sm"
                  interactive
                  hoverRating={hoverRating}
                  onHover={setHoverRating}
                  onLeave={() => setHoverRating(0)}
                />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{book.description}</p>

              {/* Reading progress bar */}
              {progress > 0 && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
              )}

              {/* Subject tags */}
              <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                {book.topics.slice(0, 2).map((topicId) => {
                  const subject = subjects.find((s) => s.id === topicId);
                  return subject ? <Badge key={topicId} variant="secondary" className="text-[10px] font-normal">{subject.title}</Badge> : null;
                })}
                {book.topics.length > 2 && <Badge variant="secondary" className="text-[10px] font-normal">+{book.topics.length - 2}</Badge>}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                {!isUserBook && (
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(book.id, cycleStatus(status))}
                    className={cn('flex-1 rounded-xl text-xs font-medium transition-all duration-200 border', config.bg, config.color, status === 'none' && 'border-border')}
                    variant="ghost"
                  >
                    <config.icon className="w-3.5 h-3.5 mr-1.5" />
                    {config.label}
                  </Button>
                )}
                {isUserBook && (
                  <Button size="sm" onClick={onDelete}
                    className="flex-1 rounded-xl text-xs font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    variant="ghost">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
                  </Button>
                )}
                <Button size="sm" onClick={() => onRead(book)}
                  className={cn('w-9 h-9 p-0 rounded-xl shrink-0',
                    isPro ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-md shadow-amber-500/20'
                      : 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-500/20'
                  )}>
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ─── Book List Item ─── */
function BookListItem({
  book, index, status, onStatusChange, onRead, onDetail, isPro, isUserBook, coverImage, onDelete,
  userRating, isFav, progress, onRate, onToggleFav,
}: {
  book: Book & { isUserBook?: boolean; coverImage?: string };
  index: number;
  status: BookStatus;
  onStatusChange: (id: string, status: BookStatus) => void;
  onRead: (book: Book & { isUserBook?: boolean }) => void;
  onDetail: () => void;
  isPro: boolean;
  isUserBook?: boolean;
  coverImage?: string;
  onDelete?: () => void;
  userRating: number;
  isFav: boolean;
  progress: number;
  onRate: (r: number) => void;
  onToggleFav: () => void;
}) {
  const config = statusConfig[status];
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = userRating || book.rating;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Card
        className="group border-border/50 bg-white dark:bg-amber-950/5 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 cursor-pointer overflow-hidden"
        onClick={onDetail}
      >
        <CardContent className="p-3 flex items-center gap-4">
          {/* Cover thumbnail */}
          <div className={cn('w-16 h-22 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md overflow-hidden', book.coverColor)}>
            {coverImage ? (
              <img src={coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-6 h-6 text-white/80" />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm leading-snug truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">{book.title}</h3>
                <p className="text-xs text-muted-foreground">{book.author}</p>
              </div>
              {isUserBook && (
                <Badge className="shrink-0 text-[9px] font-semibold bg-violet-500 text-white border-0">Uploaded</Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5" onClick={(e) => e.stopPropagation()}>
              <StarRating rating={displayRating} onRate={onRate} size="sm" interactive hoverRating={hoverRating} onHover={setHoverRating} onLeave={() => setHoverRating(0)} />
              <Badge className={cn('text-[9px] font-semibold border', difficultyColors[book.difficulty])}>{book.difficulty}</Badge>
            </div>

            {/* Progress bar */}
            {progress > 0 && (
              <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{progress}%</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={onToggleFav}
              className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
            >
              <Heart className={cn('w-4 h-4', isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground/50')} />
            </motion.button>
            {!isUserBook && (
              <Button size="sm" variant="ghost"
                onClick={() => onStatusChange(book.id, cycleStatus(status))}
                className={cn('h-8 px-2.5 rounded-lg text-[10px] font-medium border', config.bg, config.color, status === 'none' && 'border-border')}>
                <config.icon className="w-3 h-3 mr-1" />{config.label}
              </Button>
            )}
            {isUserBook && (
              <Button size="sm" variant="ghost" onClick={onDelete}
                className="h-8 px-2.5 rounded-lg text-[10px] font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                <Trash2 className="w-3 h-3 mr-1" />Delete
              </Button>
            )}
            <Button size="sm" onClick={() => onRead(book)}
              className={cn('h-8 w-8 p-0 rounded-lg shrink-0',
                isPro ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white' : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
              )}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
