'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKS = 12;

function getIntensity(date: Date, completedDates: Set<string>): number {
  const dateStr = date.toISOString().split('T')[0];
  if (completedDates.has(dateStr)) return 4;
  return 0;
}

export function WeeklyHeatmap() {
  const { studyDates } = useProgressStore();

  const completedDates = new Set<string>(studyDates);

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (WEEKS * 7 - 1) + ((startDate.getDay() + 6) % 7));

  const cells: { date: Date; intensity: number }[] = [];
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + w * 7 + d);
      cells.push({ date, intensity: getIntensity(date, completedDates) });
    }
  }

  const intensityColors = [
    'bg-muted/30',
    'bg-emerald-100 dark:bg-emerald-900/30',
    'bg-emerald-200 dark:bg-emerald-800/40',
    'bg-emerald-300 dark:bg-emerald-700/50',
    'bg-emerald-500 dark:bg-emerald-500',
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Last {WEEKS} weeks</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Less</span>
          {intensityColors.map((color, i) => (
            <div
              key={i}
              className={cn('w-3 h-3 rounded-sm', color)}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">More</span>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        <div className="flex flex-col gap-1 shrink-0">
          {DAYS.map((day) => (
            <div key={day} className="h-3 text-xs text-muted-foreground flex items-center">
              <span className="text-[10px] w-6">{day}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: WEEKS }).map((_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const cell = cells[weekIdx * 7 + dayIdx];
                if (!cell) return null;
                return (
                  <div
                    key={dayIdx}
                    className={cn(
                      'w-3 h-3 rounded-sm transition-colors',
                      intensityColors[cell.intensity]
                    )}
                    title={cell.date.toISOString().split('T')[0]}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
