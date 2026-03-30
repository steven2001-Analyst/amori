'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Keyboard, Monitor, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Shortcut {
  keys: string[];
  description: string;
  category?: string;
}

const excelShortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'C'], description: 'Copy selected cells', category: 'Edit' },
  { keys: ['Ctrl', 'V'], description: 'Paste copied content', category: 'Edit' },
  { keys: ['Ctrl', 'X'], description: 'Cut selected cells', category: 'Edit' },
  { keys: ['Ctrl', 'Z'], description: 'Undo last action', category: 'Edit' },
  { keys: ['Ctrl', 'Y'], description: 'Redo last undone action', category: 'Edit' },
  { keys: ['Alt', '='], description: 'AutoSum selected cells', category: 'Formula' },
  { keys: ['Ctrl', 'Shift', 'L'], description: 'Toggle filter dropdowns', category: 'Data' },
  { keys: ['F2'], description: 'Edit active cell directly', category: 'Navigation' },
  { keys: ['Ctrl', '1'], description: 'Open Format Cells dialog', category: 'Format' },
  { keys: ['Ctrl', 'Shift', '$'], description: 'Apply currency format', category: 'Format' },
  { keys: ['Ctrl', 'B'], description: 'Toggle bold text', category: 'Format' },
  { keys: ['Ctrl', 'I'], description: 'Toggle italic text', category: 'Format' },
  { keys: ['Ctrl', 'Home'], description: 'Go to cell A1', category: 'Navigation' },
  { keys: ['Ctrl', 'End'], description: 'Go to last used cell', category: 'Navigation' },
  { keys: ['Ctrl', 'T'], description: 'Create / Format as Table', category: 'Data' },
  { keys: ['Ctrl', 'Shift', ';'], description: 'Insert current time', category: 'Insert' },
  { keys: ['Ctrl', ';'], description: 'Insert current date', category: 'Insert' },
  { keys: ['Ctrl', 'Space'], description: 'Select entire column', category: 'Selection' },
  { keys: ['Shift', 'Space'], description: 'Select entire row', category: 'Selection' },
  { keys: ['Alt', 'F1'], description: 'Create chart from selected data', category: 'Charts' },
];

const vscodeShortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'Enter'], description: 'Run current cell', category: 'Execute' },
  { keys: ['Shift', 'Enter'], description: 'Run cell and move to next', category: 'Execute' },
  { keys: ['Ctrl', 'Shift', '-'], description: 'Split cell at cursor', category: 'Edit' },
  { keys: ['Ctrl', 'S'], description: 'Save notebook', category: 'File' },
  { keys: ['A'], description: 'Insert cell above (command mode)', category: 'Cell' },
  { keys: ['B'], description: 'Insert cell below (command mode)', category: 'Cell' },
  { keys: ['D', 'D'], description: 'Delete selected cell (command mode)', category: 'Cell' },
  { keys: ['M'], description: 'Change cell to Markdown (command mode)', category: 'Cell' },
  { keys: ['Y'], description: 'Change cell to Code (command mode)', category: 'Cell' },
  { keys: ['Ctrl', '/'], description: 'Toggle comment', category: 'Edit' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate current line', category: 'Edit' },
  { keys: ['Ctrl', 'Shift', 'P'], description: 'Open command palette', category: 'General' },
];

const powerBIShortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'D'], description: 'Duplicate selected visual', category: 'Edit' },
  { keys: ['Alt', 'Click'], description: 'Select same visual on all pages', category: 'Selection' },
  { keys: ['Ctrl', 'Z'], description: 'Undo last action', category: 'Edit' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo last action', category: 'Edit' },
  { keys: ['Ctrl', 'A'], description: 'Select all visuals on page', category: 'Selection' },
  { keys: ['Ctrl', 'G'], description: 'Group selected visuals', category: 'Arrange' },
  { keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup selected visuals', category: 'Arrange' },
  { keys: ['Esc'], description: 'Exit text editing / deselect', category: 'General' },
  { keys: ['Alt', 'F5'], description: 'Refresh data sources', category: 'Data' },
  { keys: ['Ctrl', 'M'], description: 'Toggle Mark as Date Table', category: 'Model' },
];

const sections = [
  {
    id: 'excel',
    title: 'Microsoft Excel',
    icon: Monitor,
    shortcuts: excelShortcuts,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    id: 'vscode',
    title: 'VS Code / Jupyter',
    icon: Keyboard,
    shortcuts: vscodeShortcuts,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    id: 'powerbi',
    title: 'Power BI Desktop',
    icon: BarChart3,
    shortcuts: powerBIShortcuts,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
];

function KeyBadge({ text, isLast }: { text: string; isLast?: boolean }) {
  return (
    <span className="inline-flex items-center">
      <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md bg-muted border border-border shadow-sm text-xs font-mono font-semibold text-foreground">
        {text}
      </kbd>
      {!isLast && <span className="text-muted-foreground mx-1 text-xs">+</span>}
    </span>
  );
}

export default function KeyboardShortcuts() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const Icon = section.icon;

        // Get unique categories
        const categories = Array.from(new Set(section.shortcuts.map((s) => s.category).filter(Boolean)));
        const filteredShortcuts = activeFilter
          ? section.shortcuts.filter((s) => s.category === activeFilter)
          : section.shortcuts;

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={cn('border', section.borderColor)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', section.bgColor)}>
                      <Icon className={cn('w-4 h-4', section.color)} />
                    </div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      onClick={() => setActiveFilter(null)}
                      className={cn(
                        'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                        activeFilter === null
                          ? cn(section.bgColor, section.color)
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
                        className={cn(
                          'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                          activeFilter === cat
                            ? cn(section.bgColor, section.color)
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                  {filteredShortcuts.map((shortcut, idx) => (
                    <motion.div
                      key={`${section.id}-${idx}`}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {shortcut.keys.map((key, kIdx) => (
                          <KeyBadge
                            key={kIdx}
                            text={key}
                            isLast={kIdx === shortcut.keys.length - 1}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground text-right shrink-0">
                        {shortcut.description}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
