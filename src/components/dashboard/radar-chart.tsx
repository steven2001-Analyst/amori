'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SubjectData {
  subject: string;
  progress: number;
  fullTitle: string;
  color: string;
  gradient: string;
  icon: string;
}

interface RadarProgressChartProps {
  subjectData: SubjectData[];
}

const COLORS = [
  '#10b981', // emerald
  '#22c55e', // green
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#f59e0b', // amber
  '#14b8a6', // teal
  '#f97316', // orange
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#64748b', // slate
  '#d946ef', // fuchsia
];

const SHORT_LABELS: Record<string, string> = {
  'Introduction to': 'Intro',
  'Data Analytics': 'Analytics',
  'Microsoft Excel': 'Excel',
  'SQL (Structured': 'SQL',
  'Python for Data': 'Python',
  'Data Warehousing': 'Warehouse',
  'Databricks &': 'Databricks',
  'Advanced Modern': 'Advanced',
  'Data Science': 'DS',
  'Data Engineering': 'Data Eng',
  'Machine Learning': 'ML',
  'Power BI': 'Power BI',
};

function shortenLabel(label: string): string {
  for (const [key, short] of Object.entries(SHORT_LABELS)) {
    if (label.startsWith(key)) return short;
  }
  if (label.length > 12) return label.slice(0, 11) + '…';
  return label;
}

export function RadarProgressChart({ subjectData }: RadarProgressChartProps) {
  const data = subjectData.map((s, i) => ({
    subject: shortenLabel(s.subject),
    progress: s.progress,
    fill: COLORS[i % COLORS.length],
    fullName: s.fullTitle,
  }));

  return (
    <div className="h-72 sm:h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fontSize: 10,
              fill: 'hsl(var(--muted-foreground))',
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Progress"
            dataKey="progress"
            stroke="#10b981"
            fill="url(#emeraldGradient)"
            fillOpacity={1}
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: '#10b981',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '10px',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            formatter={(_value: number, name: string, props: { payload: { fullName: string } }) => {
              return [`${props.payload.fullName}: ${props.payload.progress}%`, 'Progress'];
            }}
          />
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
