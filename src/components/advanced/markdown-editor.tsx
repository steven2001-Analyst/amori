'use client';

import React, { useState, useMemo } from 'react';
import { FileType, Copy, Check, RotateCcw, Code, Eye, Heading, Bold, Italic, List, ListOrdered, Quote, Link2, Image, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-lg overflow-x-auto text-xs font-mono my-2"><code>$2</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-emerald-600 dark:text-emerald-400">$1</code>');

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-sm font-semibold mt-3 mb-1 text-muted-foreground">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-sm font-semibold mt-3 mb-1 text-muted-foreground">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-base font-semibold mt-3 mb-1">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2 pb-1 border-b border-border">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold mt-5 mb-3 pb-2 border-b border-border">$1</h1>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-emerald-600 dark:text-emerald-400 underline hover:no-underline">$1</a>');

  // Blockquote
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-emerald-500 pl-4 py-1 my-2 text-muted-foreground italic">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr class="my-4 border-border" />');
  html = html.replace(/^\*\*\*+$/gm, '<hr class="my-4 border-border" />');

  // Unordered list
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>');

  // Ordered list
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  // Clean up <br /> inside pre blocks
  html = html.replace(/<pre class="([^"]*)">([\s\S]*?)<\/pre>/g, (_match, cls, content) => {
    return `<pre class="${cls}">${content.replace(/<br \/>/g, '\n')}</pre>`;
  });

  return html;
}

interface ToolbarAction {
  icon: React.ElementType;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean;
}

const TOOLBAR: ToolbarAction[] = [
  { icon: Heading, label: 'Heading', prefix: '## ', suffix: '', block: true },
  { icon: Bold, label: 'Bold', prefix: '**', suffix: '**' },
  { icon: Italic, label: 'Italic', prefix: '*', suffix: '*' },
  { icon: Minus, label: 'Strikethrough', prefix: '~~', suffix: '~~' },
  { icon: List, label: 'Bullet List', prefix: '- ', suffix: '', block: true },
  { icon: ListOrdered, label: 'Numbered List', prefix: '1. ', suffix: '', block: true },
  { icon: Quote, label: 'Blockquote', prefix: '> ', suffix: '', block: true },
  { icon: Code, label: 'Code Block', prefix: '```\n', suffix: '\n```', block: true },
  { icon: Link2, label: 'Link', prefix: '[', suffix: '](url)' },
  { icon: Image, label: 'Image', prefix: '![alt](', suffix: ')' },
];

export default function MarkdownEditorTool() {
  const [content, setContent] = useState('# Hello World\n\nWelcome to the **Markdown Editor**! This tool supports:\n\n- **Bold** and *italic* text\n- [Links](https://example.com)\n- `Inline code`\n- Code blocks\n- Lists and blockquotes\n\n```python\ndef hello():\n    print("Hello, DataTrack!")\n```\n\n> This is a blockquote\n\n## Features\n\n1. Live preview\n2. Toolbar formatting\n3. Export to HTML\n');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');

  const htmlOutput = useMemo(() => markdownToHtml(content), [content]);

  const wordCount = useMemo(() => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  const charCount = content.length;
  const lineCount = content ? content.split('\n').length : 0;

  const insertFormatting = (action: ToolbarAction) => {
    const textarea = document.getElementById('md-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const before = content.slice(0, start);
    const after = content.slice(end);

    let newContent: string;
    if (action.block && !selected) {
      newContent = before + (before && !before.endsWith('\n') ? '\n' : '') + action.prefix + 'text' + action.suffix + after;
    } else {
      newContent = before + action.prefix + (selected || 'text') + action.suffix + after;
    }
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = action.block
        ? before.length + (before && !before.endsWith('\n') ? 1 : 0) + action.prefix.length
        : start + action.prefix.length;
      const endPos = cursorPos + (selected || 'text').length;
      textarea.setSelectionRange(cursorPos, endPos);
    }, 0);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlOutput);
    setCopied(true);
    toast.success('HTML copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportHtml = () => {
    const fullHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Markdown Export</title>\n  <style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:0 auto;padding:2rem;line-height:1.7;color:#333}pre{background:#f5f5f5;padding:1rem;border-radius:8px;overflow-x:auto}code{font-family:monospace}blockquote{border-left:4px solid #10b981;padding-left:1rem;color:#666;font-style:italic}img{max-width:100%}a{color:#059669}hr{border:none;border-top:1px solid #ddd;margin:2rem 0}</style>\n</head>\n<body>\n${htmlOutput}\n</body>\n</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML file exported');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 rounded-lg bg-muted/30 border border-border/50">
        <TooltipProvider delayDuration={0}>
          {TOOLBAR.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => insertFormatting(action)}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{action.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
        <div className="flex-1" />
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyHtml}
          disabled={!content.trim()}
          className="h-8 text-xs rounded-lg"
        >
          {copied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
          Copy HTML
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportHtml}
          disabled={!content.trim()}
          className="h-8 text-xs rounded-lg"
        >
          <FileType className="w-3 h-3 mr-1" />Export
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/30 w-fit">
        {(['editor', 'split', 'preview'] as const).map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 text-xs rounded-md capitalize',
              activeTab === tab && 'bg-background shadow-sm',
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Editor + Preview */}
      <div className={cn('grid gap-4', activeTab === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
        {(activeTab === 'editor' || activeTab === 'split') && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />Editor
            </Label>
            <Textarea
              id="md-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your markdown here..."
              className="font-mono text-xs min-h-[360px] resize-none"
            />
          </div>
        )}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />Preview
            </Label>
            <div
              className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg border border-border bg-background min-h-[360px] max-h-[460px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: content.trim() ? htmlOutput : '<span class="text-muted-foreground italic">Preview will appear here...</span>' }}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <Badge variant="secondary" className="text-[10px] h-5">{wordCount} words</Badge>
        <Badge variant="secondary" className="text-[10px] h-5">{charCount} chars</Badge>
        <Badge variant="secondary" className="text-[10px] h-5">{lineCount} lines</Badge>
        {content.trim() && (
          <span className="ml-auto text-[10px]">
            ~{Math.max(1, Math.ceil(wordCount / 200))} min read
          </span>
        )}
      </div>
    </div>
  );
}
