'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Layers,
  RotateCcw,
  BookOpen,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProgressStore } from '@/lib/store';
import { subjects } from '@/lib/study-data';
import { cn } from '@/lib/utils';

function FlipCard({
  front,
  back,
  isFlipped,
  onFlip,
}: {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div className="perspective-[1000px] w-full h-64 sm:h-72" onClick={onFlip}>
      <motion.div
        className="w-full h-full relative cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 flex flex-col items-center justify-center text-white shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0 text-xs">
            QUESTION
          </Badge>
          <p className="text-lg sm:text-xl font-semibold text-center leading-relaxed">
            {front}
          </p>
          <p className="text-xs text-white/60 mt-4">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 flex flex-col items-center justify-center text-white shadow-lg"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0 text-xs">
            ANSWER
          </Badge>
          <p className="text-lg sm:text-xl font-semibold text-center leading-relaxed">
            {back}
          </p>
          <p className="text-xs text-white/60 mt-4">Click to see question</p>
        </div>
      </motion.div>
    </div>
  );
}

function AddFlashcardForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const { addFlashcard } = useProgressStore();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const topics = useMemo(() => {
    const subject = subjects.find((s) => s.id === selectedSubject);
    return subject?.topics || [];
  }, [selectedSubject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !front.trim() || !back.trim()) return;
    addFlashcard({
      topicId: selectedTopic,
      front: front.trim(),
      back: back.trim(),
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">New Flashcard</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={selectedSubject} onValueChange={(val) => { setSelectedSubject(val); setSelectedTopic(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Front (Question)
              </label>
              <Textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Enter the question or concept..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Back (Answer)
              </label>
              <Textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Enter the answer or explanation..."
                rows={3}
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={!selectedTopic || !front.trim() || !back.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Flashcard
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function FlashcardsView() {
  const { flashcards, removeFlashcard } = useProgressStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  const filteredCards = useMemo(() => {
    if (filterSubject === 'all') return flashcards;
    const subject = subjects.find((s) => s.id === filterSubject);
    if (!subject) return flashcards;
    const topicIds = new Set(subject.topics.map((t) => t.id));
    return flashcards.filter((c) => topicIds.has(c.topicId));
  }, [flashcards, filterSubject]);

  const currentCard = filteredCards[currentIndex] || null;
  const totalCards = filteredCards.length;

  const goToNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(totalCards, 1));
  }, [totalCards]);

  const goToPrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + Math.max(totalCards, 1)) % Math.max(totalCards, 1));
  }, [totalCards]);

  const shuffleCards = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex(0);
  }, []);

  // Reset index when filter changes
  React.useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filterSubject]);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Flashcards</h2>
            <p className="text-xs text-muted-foreground">
              {totalCards > 0
                ? `${totalCards} card${totalCards > 1 ? 's' : ''} in deck`
                : 'Create flashcards to study'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              New Card
            </>
          )}
        </Button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6 shrink-0"
          >
            <AddFlashcardForm onClose={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      {totalCards > 0 && (
        <div className="mb-4 shrink-0">
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Flashcard Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {currentCard ? (
          <>
            {/* Card Counter */}
            <div className="mb-4 flex items-center gap-3 shrink-0">
              <Badge variant="outline" className="text-sm font-medium">
                {currentIndex + 1} of {totalCards}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={shuffleCards}
                className="text-muted-foreground"
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Shuffle
              </Button>
            </div>

            {/* Card */}
            <div className="w-full max-w-lg mb-6">
              <FlipCard
                front={currentCard.front}
                back={currentCard.back}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
              />
            </div>

            {/* Topic Label */}
            {(() => {
              for (const subject of subjects) {
                const topic = subject.topics.find((t) => t.id === currentCard.topicId);
                if (topic) {
                  return (
                    <p className="text-xs text-muted-foreground mb-4 shrink-0">
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      {subject.title} &middot; {topic.title}
                    </p>
                  );
                }
              }
              return null;
            })()}

            {/* Navigation */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrev}
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFlipped(false)}
                className="text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="h-10 w-10 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Delete Button */}
            <div className="mt-4 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removeFlashcard(currentCard.id);
                  setIsFlipped(false);
                  if (currentIndex >= filteredCards.length - 1 && currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1);
                  }
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Card
              </Button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filterSubject === 'all' ? 'No flashcards yet' : 'No flashcards in this subject'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Create your first flashcard to start studying. Flashcards are a great way to memorize key concepts.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Card
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
