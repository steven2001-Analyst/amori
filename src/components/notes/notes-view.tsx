'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Pencil,
  ChevronDown,
  ChevronRight,
  Trash2,
  StickyNote,
  BookOpen,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProgressStore } from '@/lib/store';
import { subjects, type Subject, type Topic } from '@/lib/study-data';
import { cn } from '@/lib/utils';

interface ExpandedState {
  subjectId: string;
  topicId: string | null;
}

function SubjectSection({
  subject,
  expanded,
  onToggle,
  notes,
  onEditTopic,
  searchQuery,
}: {
  subject: Subject;
  expanded: boolean;
  onToggle: () => void;
  notes: Record<string, string>;
  onEditTopic: (topicId: string) => void;
  searchQuery: string;
}) {
  const filteredTopics = useMemo(() => {
    if (!searchQuery) return subject.topics;
    const q = searchQuery.toLowerCase();
    return subject.topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (notes[t.id] && notes[t.id].toLowerCase().includes(q))
    );
  }, [subject.topics, searchQuery, notes]);

  const notesCount = subject.topics.filter((t) => notes[t.id] && notes[t.id].trim().length > 0).length;

  return (
    <motion.div layout className="mb-2">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
          'hover:bg-muted/50 text-left'
        )}
      >
        <div className={cn(
          'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0',
          subject.gradient
        )}>
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{subject.title}</p>
          <p className="text-xs text-muted-foreground">
            {notesCount > 0 ? `${notesCount} note${notesCount > 1 ? 's' : ''} saved` : `${subject.topics.length} topics`}
          </p>
        </div>
        {notesCount > 0 && (
          <Badge variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
            {notesCount}
          </Badge>
        )}
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && filteredTopics.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-11 space-y-1 py-1">
              {filteredTopics.map((topic) => {
                const hasNote = notes[topic.id] && notes[topic.id].trim().length > 0;
                return (
                  <motion.button
                    key={topic.id}
                    whileHover={{ x: 2 }}
                    onClick={() => onEditTopic(topic.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                      'hover:bg-muted/70 group',
                      hasNote && 'bg-emerald-50/50 dark:bg-emerald-950/10'
                    )}
                  >
                    {hasNote ? (
                      <Pencil className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={cn('truncate', hasNote && 'text-foreground font-medium')}>
                      {topic.title}
                    </span>
                    {hasNote && (
                      <span className="ml-auto text-[10px] text-muted-foreground truncate max-w-24 shrink-0">
                        {notes[topic.id].slice(0, 30)}...
                      </span>
                    )}
                  </motion.button>
                );
              })}
              {filteredTopics.length === 0 && searchQuery && (
                <p className="text-xs text-muted-foreground px-3 py-2">No matching topics</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NoteEditor({
  topicId,
  topicTitle,
  subjectTitle,
  content,
  onSave,
  onClear,
  onClose,
}: {
  topicId: string;
  topicTitle: string;
  subjectTitle: string;
  content: string;
  onSave: (topicId: string, content: string) => void;
  onClear: (topicId: string) => void;
  onClose: () => void;
}) {
  const [localContent, setLocalContent] = useState(content);

  const charCount = localContent.length;

  const handleSave = () => {
    onSave(topicId, localContent);
  };

  const handleClear = () => {
    setLocalContent('');
    onClear(topicId);
  };

  // Auto-save on change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSave(topicId, localContent);
    }, 800);
    return () => clearTimeout(timer);
  }, [localContent, onSave, topicId]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <p className="text-sm font-semibold">{topicTitle}</p>
          <p className="text-xs text-muted-foreground">{subjectTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Textarea */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 p-0">
          <textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            placeholder="Start taking notes here... Your notes auto-save as you type."
            className={cn(
              'w-full h-full resize-none border-0 bg-transparent p-4 text-sm leading-relaxed',
              'placeholder:text-muted-foreground focus-visible:outline-none',
              'min-h-[300px]'
            )}
          />
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 shrink-0">
        <span className="text-xs text-muted-foreground">
          {charCount} character{charCount !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
          />
          <span className="text-xs text-emerald-600 dark:text-emerald-400">Auto-saves</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function NotesView() {
  const { notes, setNote } = useProgressStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [editingTopic, setEditingTopic] = useState<{
    topicId: string;
    topicTitle: string;
    subjectTitle: string;
  } | null>(null);

  const totalNotes = Object.values(notes).filter((n) => n && n.trim().length > 0).length;

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  const handleEditTopic = (topicId: string) => {
    for (const subject of subjects) {
      const topic = subject.topics.find((t) => t.id === topicId);
      if (topic) {
        setEditingTopic({
          topicId,
          topicTitle: topic.title,
          subjectTitle: subject.title,
        });
        break;
      }
    }
  };

  if (editingTopic) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto h-full">
        <NoteEditor
          topicId={editingTopic.topicId}
          topicTitle={editingTopic.topicTitle}
          subjectTitle={editingTopic.subjectTitle}
          content={notes[editingTopic.topicId] || ''}
          onSave={(id, content) => setNote(id, content)}
          onClear={(id) => setNote(id, '')}
          onClose={() => setEditingTopic(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <StickyNote className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Study Notes</h2>
            <p className="text-xs text-muted-foreground">
              {totalNotes > 0
                ? `${totalNotes} note${totalNotes > 1 ? 's' : ''} saved across your topics`
                : 'Take notes for each study topic'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes and topics..."
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Subjects List */}
      <div className="flex-1 overflow-y-auto">
        <Card>
          <CardContent className="p-3">
            {subjects.map((subject) => (
              <SubjectSection
                key={subject.id}
                subject={subject}
                expanded={expandedSubjects.has(subject.id)}
                onToggle={() => toggleSubject(subject.id)}
                notes={notes}
                onEditTopic={handleEditTopic}
                searchQuery={searchQuery}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
