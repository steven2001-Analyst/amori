'use client';

import React, { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import { subjects, getAllTopics } from '@/lib/study-data';
import { Button } from '@/components/ui/button';
import {
  Download,
  FileSpreadsheet,
  Printer,
  Copy,
  CheckCircle2,
  Share2,
  FileText,
  BarChart3,
} from 'lucide-react';

// ─── Types ───
interface DashboardExportProps {
  className?: string;
}

interface SubjectProgressRow {
  subject: string;
  completed: number;
  total: number;
  percentage: number;
  lastActivity: string;
  status: string;
}

// ─── Helpers ───
function getStatusLabel(pct: number): string {
  if (pct === 100) return 'Completed';
  if (pct >= 75) return 'Almost Done';
  if (pct >= 50) return 'In Progress';
  if (pct >= 25) return 'Started';
  if (pct > 0) return 'Just Started';
  return 'Not Started';
}

function getStatusEmoji(pct: number): string {
  if (pct === 100) return '🎉';
  if (pct >= 75) return '🔥';
  if (pct >= 50) return '📚';
  if (pct >= 25) return '📖';
  if (pct > 0) return '🌱';
  return '⬜';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTodayStr(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Main Component ───
export default function DashboardExport({ className }: DashboardExportProps) {
  const store = useProgressStore();
  const completedTopics = store.completedTopics || [];
  const streak = store.streak || 0;
  const studyDates = store.studyDates || [];
  const profile = store.profile || { name: 'Student', email: '' };

  // Build progress data for all subjects
  const progressData = useMemo<SubjectProgressRow[]>(() => {
    return subjects.map((subject) => {
      const completed = subject.topics.filter((t) => completedTopics.includes(t.id)).length;
      const total = subject.topics.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Determine last activity date from completed topics
      const subjectTopicIds = new Set(subject.topics.map((t) => t.id));
      const completedInSubject = completedTopics.filter((tid) => subjectTopicIds.has(tid));
      let lastActivity = 'N/A';
      if (studyDates.length > 0 && completedInSubject.length > 0) {
        lastActivity = studyDates[studyDates.length - 1] || 'N/A';
      }

      return {
        subject: subject.title,
        completed,
        total,
        percentage,
        lastActivity,
        status: getStatusLabel(percentage),
      };
    });
  }, [completedTopics, studyDates]);

  const overallProgress = useMemo(() => {
    const total = getAllTopics().length;
    return total > 0 ? Math.round((completedTopics.length / total) * 100) : 0;
  }, [completedTopics]);

  const totalStudyDays = studyDates.length;
  const completedSubjects = progressData.filter((s) => s.percentage === 100).length;
  const inProgressSubjects = progressData.filter((s) => s.percentage > 0 && s.percentage < 100).length;

  // ─── Export as CSV ───
  const exportCSV = useCallback(() => {
    try {
      const headers = ['Subject', 'Completed Topics', 'Total Topics', 'Completion %', 'Last Activity', 'Status'];
      const rows = progressData.map((row) => [
        row.subject,
        String(row.completed),
        String(row.total),
        `${row.percentage}%`,
        row.lastActivity,
        row.status,
      ]);

      // Add summary rows
      rows.push([]);
      rows.push(['--- SUMMARY ---', '', '', '', '', '']);
      rows.push(['Overall Progress', `${overallProgress}%`, '', '', '', '']);
      rows.push(['Total Topics Completed', String(completedTopics.length), String(getAllTopics().length), '', '', '']);
      rows.push(['Active Streak', `${streak} days`, '', '', '', '']);
      rows.push(['Total Study Days', String(totalStudyDays), '', '', '', '']);
      rows.push(['Subjects Completed', String(completedSubjects), String(subjects.length), '', '', '']);
      rows.push(['Subjects In Progress', String(inProgressSubjects), '', '', '', '']);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => {
            // Escape cells with commas
            if (cell.includes(',') || cell.includes('"')) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          }).join(',')
        ),
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `datatrack-progress-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV exported successfully!');
    } catch {
      toast.error('Failed to export CSV. Please try again.');
    }
  }, [progressData, overallProgress, completedTopics, streak, totalStudyDays, completedSubjects, inProgressSubjects]);

  // ─── Print Summary ───
  const exportPrint = useCallback(() => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups for this site.');
        return;
      }

      const subjectsHtml = progressData
        .map(
          (row) => `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${row.subject}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb; text-align: center;">${row.completed} / ${row.total}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${row.percentage}%; background: ${row.percentage === 100 ? '#10b981' : row.percentage >= 50 ? '#f59e0b' : '#ef4444'}; border-radius: 4px;"></div>
              </div>
              <span style="font-weight: 600; min-width: 40px; text-align: right;">${row.percentage}%</span>
            </div>
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb; text-align: center;">${row.lastActivity}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <span style="padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600;
              background: ${row.percentage === 100 ? '#d1fae5; color: #065f46' : row.percentage >= 50 ? '#fef3c7; color: #92400e' : row.percentage > 0 ? '#e0e7ff; color: #3730a3' : '#f3f4f6; color: #6b7280'};">
              ${getStatusEmoji(row.percentage)} ${row.status}
            </span>
          </td>
        </tr>
      `
        )
        .join('');

      printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DataTrack Pro - Progress Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.5; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 30px; }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #10b981; }
    .header h1 { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #10b981, #14b8a6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px; }
    .header p { color: #6b7280; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-card .value { font-size: 24px; font-weight: 800; color: #10b981; }
    .stat-card .label { font-size: 12px; color: #6b7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    thead th { padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb; }
    thead th:nth-child(n+2) { text-align: center; }
    .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
    @media print {
      .container { padding: 20px; }
      .stats-grid { grid-template-columns: repeat(4, 1fr); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DataTrack Pro</h1>
      <p>Learning Progress Report — ${getTodayStr()}</p>
      <p style="margin-top: 4px;">Student: ${profile.name} ${profile.email ? `(${profile.email})` : ''}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="value">${overallProgress}%</div>
        <div class="label">Overall Progress</div>
      </div>
      <div class="stat-card">
        <div class="value">${streak}</div>
        <div class="label">Day Streak</div>
      </div>
      <div class="stat-card">
        <div class="value">${completedSubjects}</div>
        <div class="label">Subjects Done</div>
      </div>
      <div class="stat-card">
        <div class="value">${totalStudyDays}</div>
        <div class="label">Study Days</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Subject</th>
          <th>Progress</th>
          <th>Completion</th>
          <th>Last Activity</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${subjectsHtml}
      </tbody>
    </table>

    <div class="footer">
      <p>Generated by DataTrack Pro — Your Data Analytics Journey</p>
    </div>
  </div>
</body>
</html>`);

      printWindow.document.close();
      printWindow.focus();

      // Wait for content to render, then print
      setTimeout(() => {
        printWindow.print();
      }, 500);

      toast.success('Print preview opened!');
    } catch {
      toast.error('Failed to generate print preview. Please try again.');
    }
  }, [progressData, overallProgress, streak, completedSubjects, totalStudyDays, profile]);

  // ─── Copy Summary to Clipboard ───
  const copySummary = useCallback(async () => {
    try {
      const topSubjects = progressData
        .filter((s) => s.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      const subjectLines = topSubjects
        .map((s) => `  ${getStatusEmoji(s.percentage)} ${s.subject}: ${s.percentage}% (${s.completed}/${s.total} topics)`)
        .join('\n');

      const summaryText = [
        `📊 DataTrack Pro — Learning Progress Report`,
        `📅 ${getTodayStr()}`,
        ``,
        `🎯 Overall Progress: ${overallProgress}% (${completedTopics.length}/${getAllTopics().length} topics)`,
        `🔥 Active Streak: ${streak} days`,
        `📚 Subjects Completed: ${completedSubjects}/${subjects.length}`,
        `🗓️ Total Study Days: ${totalStudyDays}`,
        ``,
        `Top Subjects:`,
        subjectLines,
        ``,
        `${inProgressSubjects > 0 ? `📈 ${inProgressSubjects} subject${inProgressSubjects > 1 ? 's' : ''} currently in progress` : '🏆 All subjects completed!'}`,
        ``,
        `Powered by DataTrack Pro 🚀`,
      ].join('\n');

      await navigator.clipboard.writeText(summaryText);
      toast.success('Progress summary copied to clipboard!');
    } catch {
      toast.error('Failed to copy. Please check clipboard permissions.');
    }
  }, [progressData, overallProgress, completedTopics, streak, completedSubjects, totalStudyDays, inProgressSubjects]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={exportCSV}
        className="gap-1.5 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Export CSV</span>
        <span className="sm:hidden">CSV</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={exportPrint}
        className="gap-1.5 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
      >
        <Printer className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Print Report</span>
        <span className="sm:hidden">Print</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={copySummary}
        className="gap-1.5 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Copy Summary</span>
        <span className="sm:hidden">Copy</span>
      </Button>
    </div>
  );
}
