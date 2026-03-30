'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Check, Download, RotateCcw, FileJson, FileText, Code, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Format = 'json' | 'csv' | 'xml' | 'yaml' | 'toml';

const FORMAT_ICONS: Record<Format, React.ElementType> = {
  json: FileJson,
  csv: FileText,
  xml: Code,
  yaml: File,
  toml: FileText,
};

function jsonToCsv(data: unknown): string {
  const arr = JSON.parse(JSON.stringify(data));
  if (!Array.isArray(arr) || arr.length === 0) throw new Error('JSON must be a non-empty array of objects');
  const headers = Object.keys(arr[0]);
  const csvRows = [headers.join(','), ...arr.map((row: Record<string, unknown>) =>
    headers.map(h => {
      const val = String(row[h] ?? '');
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(',')
  )];
  return csvRows.join('\n');
}

function csvToJson(csv: string): string {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV needs header row + data rows');
  const headers = parseCsvLine(lines[0]);
  const json = lines.slice(1).filter(l => l.trim()).map(line => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
  return JSON.stringify(json, null, 2);
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
}

function jsonToXml(obj: unknown, tag: string, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (Array.isArray(obj)) {
    return obj.map(item => jsonToXml(item, 'item', indent)).join('\n');
  }
  if (typeof obj === 'object' && obj !== null) {
    const entries = Object.entries(obj as Record<string, unknown>);
    return entries.map(([k, v]) => {
      if (Array.isArray(v)) return `${pad}<${k}>\n${jsonToXml(v, k, indent + 1)}\n${pad}</${k}>`;
      if (typeof v === 'object' && v !== null) return `${pad}<${k}>\n${jsonToXml(v, k, indent + 1)}\n${pad}</${k}>`;
      return `${pad}<${k}>${escapeXml(String(v))}</${k}>`;
    }).join('\n');
  }
  return `${pad}<${tag}>${escapeXml(String(obj))}</${tag}>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function jsonToYaml(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') return obj.includes(':') || obj.includes('#') || obj.includes('\n') ? `"${obj.replace(/"/g, '\\"')}"` : obj;
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const entries = Object.entries(item as Record<string, unknown>);
        return `${pad}- ${entries[0][0]}: ${jsonToYaml(entries[0][1], 0).trimStart()}\n${entries.slice(1).map(([k, v]) => `${pad}  ${k}: ${jsonToYaml(v, 0).trimStart()}`).join('\n')}`;
      }
      return `${pad}- ${jsonToYaml(item, 0).trimStart()}`;
    }).join('\n');
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    return entries.map(([k, v]) => {
      if (typeof v === 'object' && v !== null) return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
      return `${pad}${k}: ${jsonToYaml(v, 0).trimStart()}`;
    }).join('\n');
  }
  return String(obj);
}

function jsonToToml(obj: unknown, indent = 0): string {
  const lines: string[] = [];
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error('TOML root must be an object');
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      lines.push(`${key} = [`);
      value.forEach(item => {
        if (typeof item === 'string') lines.push(`  "${item}",`);
        else if (typeof item === 'number') lines.push(`  ${item},`);
        else if (typeof item === 'boolean') lines.push(`  ${item},`);
        else lines.push(`  ${JSON.stringify(item)},`);
      });
      lines.push(']');
    } else if (typeof value === 'object' && value !== null) {
      lines.push('');
      lines.push(`[${key}]`);
      for (const [sk, sv] of Object.entries(value as Record<string, unknown>)) {
        if (typeof sv === 'string') lines.push(`${sk} = "${sv}"`);
        else if (typeof sv === 'number') lines.push(`${sk} = ${sv}`);
        else if (typeof sv === 'boolean') lines.push(`${sk} = ${sv}`);
        else lines.push(`${sk} = ${JSON.stringify(sv)}`);
      }
    } else if (typeof value === 'string') {
      lines.push(`${key} = "${value}"`);
    } else if (typeof value === 'number') {
      lines.push(`${key} = ${value}`);
    } else if (typeof value === 'boolean') {
      lines.push(`${key} = ${value}`);
    }
  }
  return lines.join('\n');
}

export default function DataConverterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [fromFormat, setFromFormat] = useState<Format>('json');
  const [toFormat, setToFormat] = useState<Format>('csv');
  const [copied, setCopied] = useState(false);

  const formats: Format[] = ['json', 'csv', 'xml', 'yaml', 'toml'];

  const convert = () => {
    setError('');
    setOutput('');
    if (!input.trim()) {
      toast.error('Please enter input data');
      return;
    }
    try {
      if (fromFormat === 'json') {
        const parsed = JSON.parse(input);
        if (toFormat === 'csv') setOutput(jsonToCsv(parsed));
        else if (toFormat === 'xml') setOutput('<?xml version="1.0" encoding="UTF-8"?>\n<root>\n' + jsonToXml(parsed, 'root', 1) + '\n</root>');
        else if (toFormat === 'yaml') setOutput(jsonToYaml(parsed).trim());
        else if (toFormat === 'toml') setOutput(jsonToToml(parsed));
      } else if (fromFormat === 'csv') {
        if (toFormat === 'json') setOutput(csvToJson(input));
        else { toast.error('Conversion not supported yet'); return; }
      } else if (fromFormat === 'yaml') {
        toast.error('YAML parsing not yet supported as input. Try JSON or CSV.');
        return;
      } else if (fromFormat === 'xml') {
        toast.error('XML parsing not yet supported as input. Try JSON or CSV.');
        return;
      } else if (fromFormat === 'toml') {
        toast.error('TOML parsing not yet supported as input. Try JSON or CSV.');
        return;
      }
      toast.success(`Converted ${fromFormat.toUpperCase()} → ${toFormat.toUpperCase()}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Conversion failed';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const ext = toFormat === 'csv' ? 'csv' : toFormat === 'xml' ? 'xml' : toFormat === 'yaml' ? 'yaml' : toFormat === 'toml' ? 'toml' : 'json';
    const mime = toFormat === 'json' ? 'application/json' : toFormat === 'csv' ? 'text/csv' : toFormat === 'xml' ? 'application/xml' : 'text/plain';
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const handleSwap = () => {
    setFromFormat(toFormat);
    setToFormat(fromFormat);
    setInput(output);
    setOutput('');
    setError('');
  };

  const placeholders: Record<Format, string> = {
    json: '[\n  {"name": "Alice", "age": 30, "city": "NYC"},\n  {"name": "Bob", "age": 25, "city": "LA"}\n]',
    csv: 'name,age,city\nAlice,30,NYC\nBob,25,LA\nCharlie,35,Chicago',
    xml: '<root>\n  <person>\n    <name>Alice</name>\n    <age>30</age>\n  </person>\n</root>',
    yaml: 'name: Alice\nage: 30\ncity: NYC',
    toml: '[user]\nname = "Alice"\nage = 30\ncity = "NYC"',
  };

  return (
    <div className="space-y-4">
      {/* Format Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Select value={fromFormat} onValueChange={(v) => { setFromFormat(v as Format); setError(''); }}>
            <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {formats.map(f => (
                <SelectItem key={f} value={f} className="uppercase">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSwap} className="mt-4 rounded-lg" title="Swap formats">
          <ArrowRightLeft className="w-4 h-4" />
        </Button>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Select value={toFormat} onValueChange={(v) => { setToFormat(v as Format); setError(''); }}>
            <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {formats.map(f => (
                <SelectItem key={f} value={f} className="uppercase">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Input/Output Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              {(() => { const Icon = FORMAT_ICONS[fromFormat]; return <Icon className="w-3.5 h-3.5" />; })()}
              Input ({fromFormat.toUpperCase()})
            </Label>
          </div>
          <Textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            placeholder={placeholders[fromFormat]}
            className="font-mono text-xs min-h-[240px] resize-none"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              {(() => { const Icon = FORMAT_ICONS[toFormat]; return <Icon className="w-3.5 h-3.5" />; })()}
              Output ({toFormat.toUpperCase()})
            </Label>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={handleCopy} disabled={!output} className="h-7 text-xs">
                {copied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                Copy
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDownload} disabled={!output} className="h-7 text-xs">
                <Download className="w-3 h-3 mr-1" />Save
              </Button>
            </div>
          </div>
          <div className={cn(
            'p-3 rounded-lg font-mono text-xs min-h-[240px] max-h-[340px] overflow-y-auto whitespace-pre-wrap border',
            error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border bg-muted/20',
          )}>
            {error ? (
              <span className="text-red-500 flex items-center gap-1"><Badge variant="destructive" className="text-[10px] h-4">Error</Badge> {error}</span>
            ) : output ? (
              output
            ) : (
              <span className="text-muted-foreground italic">Converted output will appear here...</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={convert} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
          <ArrowRightLeft className="w-4 h-4 mr-2" />Convert
        </Button>
        <Button onClick={() => { setInput(''); setOutput(''); setError(''); }} variant="outline" className="rounded-xl">
          <RotateCcw className="w-4 h-4 mr-2" />Clear
        </Button>
      </div>
    </div>
  );
}
