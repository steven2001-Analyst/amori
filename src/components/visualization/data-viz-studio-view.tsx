'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Upload,
  Database,
  Palette,
  Grid3x3,
  Copy,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Table2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Printer,
  ArrowUpDown,
  CheckCircle2,
  AreaChart,
  CircleDot,
  Flame,
  Sigma,
  GitCompareArrows,
  Filter,
  Calculator,
  Info,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'donut' | 'hbar' | 'radar' | 'heatmap';
type ColorTheme = 'emerald' | 'ocean' | 'sunset' | 'purple' | 'rose' | 'slate';
type AggregationType = 'none' | 'sum' | 'avg' | 'count' | 'min' | 'max';
type SortDirection = 'asc' | 'desc' | null;

interface DataRow {
  [key: string]: string;
}

interface TooltipData {
  x: number;
  y: number;
  label: string;
  value: string;
  series?: string;
}

// ─── Color Palettes ──────────────────────────────────────────────────────────

const COLOR_PALETTES: Record<ColorTheme, string[]> = {
  emerald: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#047857', '#a7f3d0', '#065f46', '#d1fae5'],
  ocean: ['#0ea5e9', '#0284c7', '#38bdf8', '#7dd3fc', '#0369a1', '#bae6fd', '#075985', '#e0f2fe'],
  sunset: ['#f59e0b', '#d97706', '#fbbf24', '#fcd34d', '#b45309', '#fde68a', '#92400e', '#fef3c7'],
  purple: ['#8b5cf6', '#7c3aed', '#a78bfa', '#c4b5fd', '#6d28d9', '#ddd6fe', '#5b21b6', '#ede9fe'],
  rose: ['#f43f5e', '#e11d48', '#fb7185', '#fda4af', '#be123c', '#fecdd3', '#9f1239', '#ffe4e6'],
  slate: ['#64748b', '#475569', '#94a3b8', '#cbd5e1', '#334155', '#e2e8f0', '#1e293b', '#f1f5f9'],
};

const THEME_LABELS: Record<ColorTheme, string> = {
  emerald: 'Emerald',
  ocean: 'Ocean',
  sunset: 'Sunset',
  purple: 'Purple',
  rose: 'Rose',
  slate: 'Slate',
};

// ─── Sample Datasets ─────────────────────────────────────────────────────────

const SAMPLE_DATASETS: Record<string, { headers: string[]; rows: string[][] }> = {
  'Sales Data': {
    headers: ['Month', 'North', 'South', 'East', 'West'],
    rows: [
      ['Jan', '42000', '38000', '35000', '31000'],
      ['Feb', '45000', '41000', '37000', '33000'],
      ['Mar', '48000', '44000', '39000', '36000'],
      ['Apr', '51000', '47000', '42000', '38000'],
      ['May', '49000', '45000', '41000', '37000'],
      ['Jun', '53000', '49000', '44000', '40000'],
      ['Jul', '56000', '52000', '46000', '42000'],
      ['Aug', '54000', '50000', '45000', '41000'],
      ['Sep', '50000', '46000', '41000', '37000'],
      ['Oct', '52000', '48000', '43000', '39000'],
      ['Nov', '58000', '54000', '48000', '44000'],
      ['Dec', '62000', '58000', '52000', '47000'],
    ],
  },
  'Student Grades': {
    headers: ['Student', 'Math', 'Science', 'English', 'History', 'Art'],
    rows: [
      ['Alice', '92', '88', '95', '78', '91'],
      ['Bob', '85', '91', '82', '88', '76'],
      ['Charlie', '78', '74', '89', '92', '85'],
      ['Diana', '95', '97', '91', '85', '94'],
      ['Eve', '88', '82', '76', '90', '88'],
      ['Frank', '72', '85', '88', '74', '82'],
      ['Grace', '91', '93', '94', '87', '90'],
      ['Henry', '84', '79', '83', '91', '77'],
      ['Ivy', '97', '95', '90', '93', '96'],
      ['Jack', '76', '88', '85', '80', '73'],
      ['Karen', '89', '86', '92', '84', '87'],
      ['Leo', '82', '90', '87', '76', '89'],
    ],
  },
  'Website Analytics': {
    headers: ['Day', 'Visitors', 'PageViews', 'BounceRate', 'AvgDuration'],
    rows: [
      ['Mon', '2450', '8200', '42.3', '3:24'],
      ['Tue', '2680', '9100', '38.7', '3:45'],
      ['Wed', '2920', '9800', '35.2', '4:02'],
      ['Thu', '2750', '8900', '40.1', '3:38'],
      ['Fri', '3100', '10500', '33.8', '4:15'],
      ['Sat', '1800', '5400', '52.1', '2:48'],
      ['Sun', '1650', '4900', '55.3', '2:32'],
      ['Mon', '2580', '8700', '41.0', '3:30'],
      ['Tue', '2840', '9500', '37.5', '3:52'],
      ['Wed', '3050', '10200', '34.8', '4:08'],
      ['Thu', '2800', '9200', '39.2', '3:42'],
      ['Fri', '3250', '11000', '32.5', '4:22'],
      ['Sat', '1950', '5800', '50.3', '2:55'],
      ['Sun', '1700', '5100', '53.8', '2:40'],
    ],
  },
  'Data Science Projects': {
    headers: ['Project', 'Data Cleaning', 'EDA', 'Modeling', 'Deployment', 'Documentation'],
    rows: [
      ['Customer Churn', '85', '92', '88', '76', '70'],
      ['Fraud Detection', '90', '95', '93', '82', '78'],
      ['Recommendation Engine', '78', '85', '91', '88', '75'],
      ['Sentiment Analysis', '72', '88', '86', '80', '82'],
      ['Price Optimization', '82', '90', '87', '74', '68'],
      ['Demand Forecasting', '88', '94', '92', '85', '80'],
      ['Image Classification', '95', '89', '96', '90', '84'],
      ['NLP Chatbot', '80', '83', '90', '87', '88'],
    ],
  },
  'Market Research': {
    headers: ['Category', 'Q1 Revenue', 'Q2 Revenue', 'Q3 Revenue', 'Q4 Revenue', 'Growth Rate'],
    rows: [
      ['Electronics', '245000', '268000', '312000', '389000', '14.2'],
      ['Clothing', '186000', '195000', '178000', '254000', '8.6'],
      ['Food & Beverage', '312000', '328000', '345000', '398000', '6.8'],
      ['Home & Garden', '145000', '162000', '198000', '175000', '10.3'],
      ['Sports & Outdoors', '98000', '115000', '142000', '128000', '15.7'],
      ['Health & Beauty', '167000', '178000', '192000', '223000', '9.4'],
      ['Books & Media', '54000', '58000', '52000', '71000', '7.2'],
      ['Automotive', '203000', '218000', '235000', '256000', '6.1'],
      ['Toys & Games', '78000', '85000', '125000', '156000', '25.8'],
      ['Office Supplies', '123000', '128000', '131000', '145000', '4.3'],
    ],
  },
  'Stock Prices': {
    headers: ['Day', 'Open', 'High', 'Low', 'Close', 'Volume'],
    rows: [
      ['Day 1', '150.25', '153.80', '149.50', '152.40', '4520000'],
      ['Day 2', '152.40', '155.10', '151.80', '154.60', '4890000'],
      ['Day 3', '154.60', '156.20', '153.10', '153.80', '4230000'],
      ['Day 4', '153.80', '158.50', '153.20', '157.90', '5670000'],
      ['Day 5', '157.90', '160.10', '156.50', '159.30', '6120000'],
      ['Day 6', '159.30', '161.00', '157.80', '158.50', '5340000'],
      ['Day 7', '158.50', '162.30', '158.00', '161.80', '5780000'],
      ['Day 8', '161.80', '163.50', '160.20', '162.10', '4980000'],
      ['Day 9', '162.10', '164.80', '161.50', '164.20', '5450000'],
      ['Day 10', '164.20', '166.00', '163.00', '165.50', '6010000'],
      ['Day 11', '165.50', '167.20', '164.80', '166.30', '5230000'],
      ['Day 12', '166.30', '168.90', '165.50', '168.40', '5890000'],
      ['Day 13', '168.40', '170.10', '167.20', '167.50', '4780000'],
      ['Day 14', '167.50', '171.50', '167.00', '170.80', '6540000'],
      ['Day 15', '170.80', '173.20', '169.50', '172.40', '6320000'],
      ['Day 16', '172.40', '174.00', '171.00', '171.50', '5120000'],
      ['Day 17', '171.50', '175.80', '171.00', '175.20', '6780000'],
      ['Day 18', '175.20', '176.50', '173.80', '174.80', '5450000'],
      ['Day 19', '174.80', '178.20', '174.00', '177.60', '6980000'],
      ['Day 20', '177.60', '179.00', '176.00', '176.50', '5670000'],
      ['Day 21', '176.50', '180.50', '175.80', '179.80', '7120000'],
      ['Day 22', '179.80', '182.00', '178.50', '181.30', '6450000'],
      ['Day 23', '181.30', '183.50', '180.00', '180.80', '5780000'],
      ['Day 24', '180.80', '184.20', '180.00', '183.50', '6890000'],
      ['Day 25', '183.50', '185.00', '182.00', '184.20', '6230000'],
      ['Day 26', '184.20', '186.80', '183.50', '185.90', '7010000'],
      ['Day 27', '185.90', '187.20', '184.00', '184.50', '5560000'],
      ['Day 28', '184.50', '188.00', '184.00', '187.30', '7340000'],
      ['Day 29', '187.30', '189.50', '186.00', '188.80', '6780000'],
      ['Day 30', '188.80', '191.00', '187.50', '190.20', '7560000'],
    ],
  },
};

// ─── CSV Parser ──────────────────────────────────────────────────────────────

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows = lines.slice(1).map((line) =>
    line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''))
  );
  return { headers, rows };
}

function rowsToData(headers: string[], rows: string[][]): DataRow[] {
  return rows.map((row) => {
    const obj: DataRow = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] || '';
    });
    return obj;
  });
}

// ─── Chart Type Config ───────────────────────────────────────────────────────

const CHART_TYPES: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: 'bar', label: 'Bar', icon: <BarChart3 className="size-5" /> },
  { type: 'hbar', label: 'H-Bar', icon: <BarChart3 className="size-5 rotate-90" /> },
  { type: 'line', label: 'Line', icon: <LineChart className="size-5" /> },
  { type: 'area', label: 'Area', icon: <AreaChart className="size-5" /> },
  { type: 'pie', label: 'Pie', icon: <PieChart className="size-5" /> },
  { type: 'donut', label: 'Donut', icon: <CircleDot className="size-5" /> },
  { type: 'scatter', label: 'Scatter', icon: <ScatterChart className="size-5" /> },
  { type: 'radar', label: 'Radar', icon: <Flame className="size-5" /> },
  { type: 'heatmap', label: 'Heat', icon: <Grid3x3 className="size-5" /> },
];

const AGGREGATION_LABELS: Record<AggregationType, string> = {
  none: 'None',
  sum: 'Sum',
  avg: 'Average',
  count: 'Count',
  min: 'Min',
  max: 'Max',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function DataVizStudioView() {
  // ── Primary Dataset State ──
  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawText, setRawText] = useState('');

  // ── Comparison Dataset State ──
  const [compData, setCompData] = useState<DataRow[]>([]);
  const [compHeaders, setCompHeaders] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // ── Chart Config ──
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xColumn, setXColumn] = useState('');
  const [yColumns, setYColumns] = useState<string[]>([]);
  const [chartTitle, setChartTitle] = useState('My Chart');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('emerald');
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [aggregation, setAggregation] = useState<AggregationType>('none');

  // ── Filter State ──
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');

  // ── Table State ──
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('upload');

  // ── Tooltip State ──
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // ── Refs ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const compFileInputRef = useRef<HTMLInputElement>(null);

  const ROWS_PER_PAGE = 15;
  const hasData = data.length > 0 && headers.length > 0;
  const palette = COLOR_PALETTES[colorTheme];
  const yColumn = yColumns[0] || '';

  // ── Filtered Data ──
  const filteredData = useMemo(() => {
    let result = data;
    if (filterColumn && filterValue) {
      result = result.filter((row) =>
        String(row[filterColumn]).toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return result;
  }, [data, filterColumn, filterValue]);

  // ── Aggregated Data ──
  const processedData = useMemo(() => {
    if (!hasData || !xColumn || yColumns.length === 0) return filteredData;

    if (aggregation === 'none') return filteredData;

    // Group by xColumn
    const groups: Record<string, DataRow[]> = {};
    filteredData.forEach((row) => {
      const key = row[xColumn] || 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    const aggRows: DataRow[] = [];
    Object.entries(groups).forEach(([key, rows]) => {
      const aggRow: DataRow = { [xColumn]: key };
      yColumns.forEach((yc) => {
        const values = rows.map((r) => parseFloat(r[yc]) || 0);
        switch (aggregation) {
          case 'sum':
            aggRow[yc] = String(values.reduce((a, b) => a + b, 0));
            break;
          case 'avg':
            aggRow[yc] = String(values.reduce((a, b) => a + b, 0) / values.length);
            break;
          case 'count':
            aggRow[yc] = String(rows.length);
            break;
          case 'min':
            aggRow[yc] = String(Math.min(...values));
            break;
          case 'max':
            aggRow[yc] = String(Math.max(...values));
            break;
        }
      });
      aggRows.push(aggRow);
    });
    return aggRows;
  }, [hasData, filteredData, xColumn, yColumns, aggregation]);

  // ── Analytics Summary ──
  const analytics = useMemo(() => {
    if (!yColumn || processedData.length === 0) return null;
    const values = processedData
      .map((r) => parseFloat(r[yColumn]))
      .filter((v) => !isNaN(v));
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const count = values.length;
    const mean = sum / count;
    const sorted = [...values].sort((a, b) => a - b);
    const median =
      count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];
    const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / count;
    const stdDev = Math.sqrt(variance);
    const min = sorted[0];
    const max = sorted[count - 1];

    // Trend detection (simple linear regression direction)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (values.length >= 3) {
      const n = values.length;
      const xMean = (n - 1) / 2;
      const yMean = mean;
      let num = 0;
      let den = 0;
      for (let i = 0; i < n; i++) {
        num += (i - xMean) * (values[i] - yMean);
        den += (i - xMean) ** 2;
      }
      const slope = den > 0 ? num / den : 0;
      const threshold = mean * 0.02;
      if (slope > threshold) trend = 'up';
      else if (slope < -threshold) trend = 'down';
    }

    return { mean, median, stdDev, min, max, sum, count, trend };
  }, [processedData, yColumn]);

  // ── Multi-series chart data ──
  const multiSeriesData = useMemo(() => {
    if (!hasData || !xColumn || yColumns.length === 0) return [];
    return processedData.map((row) => {
      const point: Record<string, string | number> = { x: row[xColumn] };
      yColumns.forEach((yc) => {
        point[yc] = parseFloat(row[yc]) || 0;
      });
      return point;
    });
  }, [hasData, processedData, xColumn, yColumns]);

  // ── Single series chart data (backward compat) ──
  const chartData = useMemo(() => {
    if (!hasData || !xColumn || !yColumn) return [];
    return processedData.map((row) => ({
      x: row[xColumn],
      y: parseFloat(row[yColumn]) || 0,
    }));
  }, [hasData, processedData, xColumn, yColumn]);

  // ── Load Data ──
  const loadData = useCallback((headersVal: string[], rows: string[][]) => {
    setHeaders(headersVal);
    setData(rowsToData(headersVal, rows));
    setXColumn(headersVal[0]);
    const numericCols = headersVal.filter((_, i) =>
      rows.some((r) => !isNaN(parseFloat(r[i])))
    );
    setYColumns(numericCols.length > 0 ? [numericCols[0]] : [headersVal[1] || '']);
    setChartTitle('My Chart');
    setSortColumn(null);
    setSortDirection(null);
    setCurrentPage(1);
    setFilterColumn('');
    setFilterValue('');
    toast.success(`Loaded ${rows.length} rows with ${headersVal.length} columns`);
  }, []);

  const loadComparisonData = useCallback((headersVal: string[], rows: string[][]) => {
    setCompHeaders(headersVal);
    setCompData(rowsToData(headersVal, rows));
    setShowComparison(true);
    toast.success(`Comparison dataset loaded: ${rows.length} rows`);
  }, []);

  const loadSample = useCallback(
    (name: string) => {
      const dataset = SAMPLE_DATASETS[name];
      if (dataset) {
        loadData(dataset.headers, dataset.rows);
        setActiveTab('upload');
      }
    },
    [loadData]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setRawText(text);
        const { headers: h, rows } = parseCSV(text);
        if (h.length > 0 && rows.length > 0) {
          loadData(h, rows);
        } else {
          toast.error('Could not parse CSV. Ensure first row is headers.');
        }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [loadData]
  );

  const handleCompFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const { headers: h, rows } = parseCSV(text);
        if (h.length > 0 && rows.length > 0) {
          loadComparisonData(h, rows);
        } else {
          toast.error('Could not parse comparison CSV.');
        }
      };
      reader.readAsText(file);
      if (compFileInputRef.current) compFileInputRef.current.value = '';
    },
    [loadComparisonData]
  );

  const handlePasteSubmit = useCallback(() => {
    const { headers: h, rows } = parseCSV(rawText);
    if (h.length > 0 && rows.length > 0) {
      loadData(h, rows);
    } else {
      toast.error('Could not parse data. Use CSV format with headers in first row.');
    }
  }, [rawText, loadData]);

  // ── Sorting ──
  const handleSort = useCallback(
    (col: string) => {
      if (sortColumn === col) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
      } else {
        setSortColumn(col);
        setSortDirection('asc');
      }
      setCurrentPage(1);
    },
    [sortColumn]
  );

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = parseFloat(a[sortColumn]) || a[sortColumn];
      const bVal = parseFloat(b[sortColumn]) || b[sortColumn];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / ROWS_PER_PAGE));
  const paginatedData = sortedData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  // ── Export Functions ──
  const handleCopyData = useCallback(() => {
    if (!hasData) return;
    const csv = [headers.join(','), ...data.map((row) => headers.map((h) => row[h]).join(','))].join('\n');
    navigator.clipboard.writeText(csv);
    toast.success('Chart data copied to clipboard');
  }, [hasData, headers, data]);

  const handleDownloadSVG = useCallback(() => {
    if (!chartRef.current) return;
    const svgEl = chartRef.current.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chartTitle.replace(/[^a-z0-9]/gi, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded successfully');
  }, [chartTitle]);

  const handleDownloadCSV = useCallback(() => {
    if (!hasData) return;
    const csv = [headers.join(','), ...data.map((row) => headers.map((h) => row[h]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chartTitle.replace(/[^a-z0-9]/gi, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded successfully');
  }, [hasData, headers, data, chartTitle]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Toggle Y column selection ──
  const toggleYColumn = useCallback((col: string) => {
    setYColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  }, []);

  // ── Chart Dimensions ──
  const CHART_W = 800;
  const CHART_H = 480;
  const PAD = { top: 50, right: 40, bottom: 70, left: 70 };
  const plotW = CHART_W - PAD.left - PAD.right;
  const plotH = CHART_H - PAD.top - PAD.bottom;

  // ── Helper: format number ──
  const fmt = (n: number) => {
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n % 1 === 0 ? n.toLocaleString() : n.toFixed(1);
  };

  // ── Tooltip handler ──
  const handleHover = useCallback((e: React.MouseEvent, label: string, value: string, series?: string) => {
    const rect = (e.currentTarget as SVGElement).closest('.chart-wrapper')?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        label,
        value,
        series,
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // ── SVG Chart Renderers ──

  const renderGridAndAxes = (maxVal: number, minVal: number = 0) => {
    const range = maxVal - minVal || 1;
    return (
      <g>
        {showGrid &&
          [0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = PAD.top + plotH * (1 - frac);
            const val = minVal + range * frac;
            return (
              <g key={frac}>
                <line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                <text x={PAD.left - 10} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize="11">{fmt(val)}</text>
              </g>
            );
          })}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="#d1d5db" strokeWidth="1.5" />
        <line x1={PAD.left} y1={PAD.top + plotH} x2={CHART_W - PAD.right} y2={PAD.top + plotH} stroke="#d1d5db" strokeWidth="1.5" />
      </g>
    );
  };

  const renderXLabels = (labels: string[], positions: number[]) => {
    return labels.map((lbl, i) => {
      const px = positions[i];
      if (px === undefined) return null;
      return (
        <text
          key={i}
          x={px}
          y={PAD.top + plotH + 20}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
          transform={`rotate(-30, ${px}, ${PAD.top + plotH + 20})`}
        >
          {String(lbl).length > 12 ? String(lbl).slice(0, 11) + '...' : lbl}
        </text>
      );
    });
  };

  // ── Bar Chart (multi-series) ──
  const renderBarChart = () => {
    if (multiSeriesData.length === 0) return null;
    const allVals = multiSeriesData.flatMap((d) => yColumns.map((yc) => d[yc] as number));
    const maxVal = Math.max(...allVals, 1);
    const numSeries = yColumns.length;
    const numGroups = multiSeriesData.length;
    const groupWidth = plotW / numGroups;
    const barWidth = Math.max(4, Math.min(36, (groupWidth - 8) / numSeries - 2));

    return (
      <g>
        {renderGridAndAxes(maxVal)}
        {multiSeriesData.map((d, gi) => {
          const gx = PAD.left + gi * groupWidth;
          return yColumns.map((yc, si) => {
            const val = d[yc] as number;
            const barH = (val / maxVal) * plotH;
            const bx = gx + (groupWidth - barWidth * numSeries) / 2 + si * barWidth;
            const by = PAD.top + plotH - barH;
            const color = palette[si % palette.length];
            return (
              <g key={`${gi}-${si}`}>
                <rect
                  x={bx} y={by} width={barWidth} height={barH}
                  fill={color} rx="3" ry="3" opacity="0.9"
                  onMouseEnter={(e) => handleHover(e, String(d.x), fmt(val), yc)}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer transition-opacity hover:opacity-100"
                />
              </g>
            );
          });
        })}
        {renderXLabels(multiSeriesData.map((d) => String(d.x)), multiSeriesData.map((_, i) => PAD.left + i * groupWidth + groupWidth / 2))}
        <text x={CHART_W / 2} y={CHART_H - 8} textAnchor="middle" className="fill-muted-foreground" fontSize="12" fontWeight="600">{xColumn}</text>
        <text x={16} y={CHART_H / 2} textAnchor="middle" className="fill-muted-foreground" fontSize="12" fontWeight="600" transform={`rotate(-90, 16, ${CHART_H / 2})`}>{yColumns.length === 1 ? yColumn : 'Values'}</text>
        {showLegend && numSeries > 1 && renderLegend(yColumns)}
      </g>
    );
  };

  // ── Horizontal Bar Chart ──
  const renderHBarChart = () => {
    if (multiSeriesData.length === 0) return null;
    const allVals = multiSeriesData.flatMap((d) => yColumns.map((yc) => d[yc] as number));
    const maxVal = Math.max(...allVals, 1);
    const numSeries = yColumns.length;
    const numGroups = multiSeriesData.length;
    const groupHeight = plotH / numGroups;
    const barHeight = Math.max(4, Math.min(30, (groupHeight - 6) / numSeries - 2));

    return (
      <g>
        {/* Y-axis labels (horizontal bar = x-axis labels on left) */}
        {multiSeriesData.map((d, i) => {
          const gy = PAD.top + i * groupHeight + groupHeight / 2;
          return (
            <text key={i} x={PAD.left - 10} y={gy + 4} textAnchor="end" className="fill-muted-foreground" fontSize="10">
              {String(d.x).length > 14 ? String(d.x).slice(0, 13) + '..' : d.x}
            </text>
          );
        })}
        {/* Grid lines */}
        {showGrid &&
          [0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const x = PAD.left + plotW * frac;
            return (
              <g key={frac}>
                <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + plotH} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                <text x={x} y={PAD.top + plotH + 18} textAnchor="middle" className="fill-muted-foreground" fontSize="10">{fmt(maxVal * frac)}</text>
              </g>
            );
          })}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="#d1d5db" strokeWidth="1.5" />
        <line x1={PAD.left} y1={PAD.top + plotH} x2={CHART_W - PAD.right} y2={PAD.top + plotH} stroke="#d1d5db" strokeWidth="1.5" />
        {multiSeriesData.map((d, gi) => {
          const gy = PAD.top + gi * groupHeight;
          return yColumns.map((yc, si) => {
            const val = d[yc] as number;
            const bw = (val / maxVal) * plotW;
            const bx = PAD.left;
            const by = gy + (groupHeight - barHeight * numSeries) / 2 + si * barHeight;
            const color = palette[si % palette.length];
            return (
              <g key={`${gi}-${si}`}>
                <rect
                  x={bx} y={by} width={bw} height={barHeight}
                  fill={color} rx="3" ry="3" opacity="0.9"
                  onMouseEnter={(e) => handleHover(e, String(d.x), fmt(val), yc)}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer"
                />
              </g>
            );
          });
        })}
        {showLegend && numSeries > 1 && renderLegend(yColumns)}
      </g>
    );
  };

  // ── Line Chart (multi-series) ──
  const renderLineChart = () => {
    if (multiSeriesData.length === 0) return null;
    const allVals = multiSeriesData.flatMap((d) => yColumns.map((yc) => d[yc] as number));
    const maxVal = Math.max(...allVals, 1);
    const minVal = Math.min(...allVals, 0);
    const range = maxVal - minVal || 1;
    const stepX = plotW / (multiSeriesData.length - 1 || 1);

    return (
      <g>
        {showGrid &&
          [0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = PAD.top + plotH * (1 - frac);
            const val = minVal + range * frac;
            return (
              <g key={frac}>
                <line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                <text x={PAD.left - 10} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize="11">{fmt(val)}</text>
              </g>
            );
          })}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="#d1d5db" strokeWidth="1.5" />
        <line x1={PAD.left} y1={PAD.top + plotH} x2={CHART_W - PAD.right} y2={PAD.top + plotH} stroke="#d1d5db" strokeWidth="1.5" />
        {yColumns.map((yc, si) => {
          const color = palette[si % palette.length];
          const points = multiSeriesData.map((d, i) => ({
            px: PAD.left + i * stepX,
            py: PAD.top + plotH - (((d[yc] as number) - minVal) / range) * plotH,
            val: d[yc] as number,
            label: String(d.x),
          }));
          const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px} ${p.py}`).join(' ');
          return (
            <g key={yc}>
              <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.px} cy={p.py} r="5" fill="white" stroke={color} strokeWidth="2.5"
                    onMouseEnter={(e) => handleHover(e, p.label, fmt(p.val), yc)}
                    onMouseLeave={handleMouseLeave}
                    className="cursor-pointer"
                  />
                </g>
              ))}
            </g>
          );
        })}
        {renderXLabels(multiSeriesData.map((d) => String(d.x)), multiSeriesData.map((_, i) => PAD.left + i * stepX))}
        <text x={CHART_W / 2} y={CHART_H - 8} textAnchor="middle" className="fill-muted-foreground" fontSize="12" fontWeight="600">{xColumn}</text>
        <text x={16} y={CHART_H / 2} textAnchor="middle" className="fill-muted-foreground" fontSize="12" fontWeight="600" transform={`rotate(-90, 16, ${CHART_H / 2})`}>{yColumns.length === 1 ? yColumn : 'Values'}</text>
        {showLegend && yColumns.length > 1 && renderLegend(yColumns)}
      </g>
    );
  };

  // ── Area Chart (multi-series) ──
  const renderAreaChart = () => {
    if (multiSeriesData.length === 0) return null;
    const allVals = multiSeriesData.flatMap((d) => yColumns.map((yc) => d[yc] as number));
    const maxVal = Math.max(...allVals, 1);
    const minVal = Math.min(...allVals, 0);
    const range = maxVal - minVal || 1;
    const stepX = plotW / (multiSeriesData.length - 1 || 1);

    return (
      <g>
        {showGrid &&
          [0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = PAD.top + plotH * (1 - frac);
            const val = minVal + range * frac;
            return (
              <g key={frac}>
                <line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                <text x={PAD.left - 10} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize="11">{fmt(val)}</text>
              </g>
            );
          })}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="#d1d5db" strokeWidth="1.5" />
        <line x1={PAD.left} y1={PAD.top + plotH} x2={CHART_W - PAD.right} y2={PAD.top + plotH} stroke="#d1d5db" strokeWidth="1.5" />
        <defs>
          {yColumns.map((yc, si) => (
            <linearGradient key={`areaGrad-${si}`} id={`areaGrad-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette[si % palette.length]} stopOpacity={yColumns.length === 1 ? 0.4 : 0.25} />
              <stop offset="100%" stopColor={palette[si % palette.length]} stopOpacity={0.03} />
            </linearGradient>
          ))}
        </defs>
        {/* Render series in reverse order so first series is on top */}
        {[...yColumns].reverse().map((yc, revSi) => {
          const si = yColumns.length - 1 - revSi;
          const color = palette[si % palette.length];
          const points = multiSeriesData.map((d, i) => ({
            px: PAD.left + i * stepX,
            py: PAD.top + plotH - (((d[yc] as number) - minVal) / range) * plotH,
            val: d[yc] as number,
            label: String(d.x),
          }));
          const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px} ${p.py}`).join(' ');
          const areaPath = `${linePath} L ${points[points.length - 1].px} ${PAD.top + plotH} L ${points[0].px} ${PAD.top + plotH} Z`;
          return (
            <g key={yc}>
              <path d={areaPath} fill={`url(#areaGrad-${si})`} />
              <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <circle
                  key={i} cx={p.px} cy={p.py} r="4" fill="white" stroke={color} strokeWidth="2"
                  onMouseEnter={(e) => handleHover(e, p.label, fmt(p.val), yc)}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer"
                />
              ))}
            </g>
          );
        })}
        {renderXLabels(multiSeriesData.map((d) => String(d.x)), multiSeriesData.map((_, i) => PAD.left + i * stepX))}
        <text x={CHART_W / 2} y={CHART_H - 8} textAnchor="middle" className="fill-muted-foreground" fontSize="12" fontWeight="600">{xColumn}</text>
        <text x={16} y={CHART_H / 2} textAnchor="middle" className="fill-muted-foreground" fontSize="12" fontWeight="600" transform={`rotate(-90, 16, ${CHART_H / 2})`}>{yColumns.length === 1 ? yColumn : 'Values'}</text>
        {showLegend && yColumns.length > 1 && renderLegend(yColumns)}
      </g>
    );
  };

  // ── Pie Chart ──
  const renderPieChart = () => {
    if (chartData.length === 0) return null;
    const total = chartData.reduce((sum, d) => sum + d.y, 0) || 1;
    const cx = CHART_W / 2;
    const cy = CHART_H / 2 - 10;
    const radius = Math.min(plotW, plotH) / 2 - 50;

    let currentAngle = -Math.PI / 2;
    const slices = chartData.map((d, i) => {
      const fraction = d.y / total;
      const angle = fraction * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const midAngle = startAngle + angle / 2;
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const labelR = radius * 1.22;
      const labelX = cx + labelR * Math.cos(midAngle);
      const labelY = cy + labelR * Math.sin(midAngle);
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      currentAngle = endAngle;
      return { path, labelX, labelY, label: d.x, value: d.y, percent: (fraction * 100).toFixed(1), color: palette[i % palette.length] };
    });

    const legendLabels = slices.map((s) => s.label);

    return (
      <g>
        {slices.map((s, i) => (
          <g key={i}>
            <path
              d={s.path} fill={s.color} stroke="white" strokeWidth="2" opacity="0.9"
              onMouseEnter={(e) => handleHover(e, s.label, `${fmt(s.value)} (${s.percent}%)`)}
              onMouseLeave={handleMouseLeave}
              className="cursor-pointer"
            />
            {slices.length <= 8 && (
              <>
                <text x={s.labelX} y={s.labelY - 5} textAnchor="middle" className="fill-foreground" fontSize="10" fontWeight="600">
                  {String(s.label).length > 10 ? String(s.label).slice(0, 9) + '..' : s.label}
                </text>
                <text x={s.labelX} y={s.labelY + 8} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
                  {s.percent}%
                </text>
              </>
            )}
          </g>
        ))}
        {/* Pie legend */}
        {showLegend && renderPieLegend(legendLabels, slices)}
      </g>
    );
  };

  // ── Donut Chart ──
  const renderDonutChart = () => {
    if (chartData.length === 0) return null;
    const total = chartData.reduce((sum, d) => sum + d.y, 0) || 1;
    const cx = CHART_W / 2;
    const cy = CHART_H / 2 - 10;
    const outerR = Math.min(plotW, plotH) / 2 - 50;
    const innerR = outerR * 0.55;

    let currentAngle = -Math.PI / 2;
    const slices = chartData.map((d, i) => {
      const fraction = d.y / total;
      const angle = fraction * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const midAngle = startAngle + angle / 2;
      const largeArc = angle > Math.PI ? 1 : 0;
      const ox1 = cx + outerR * Math.cos(startAngle);
      const oy1 = cy + outerR * Math.sin(startAngle);
      const ox2 = cx + outerR * Math.cos(endAngle);
      const oy2 = cy + outerR * Math.sin(endAngle);
      const ix1 = cx + innerR * Math.cos(endAngle);
      const iy1 = cy + innerR * Math.sin(endAngle);
      const ix2 = cx + innerR * Math.cos(startAngle);
      const iy2 = cy + innerR * Math.sin(startAngle);
      const path = `M ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
      const labelR = outerR * 1.2;
      const labelX = cx + labelR * Math.cos(midAngle);
      const labelY = cy + labelR * Math.sin(midAngle);
      currentAngle = endAngle;
      return { path, labelX, labelY, label: d.x, value: d.y, percent: (fraction * 100).toFixed(1), color: palette[i % palette.length] };
    });

    const legendLabels = slices.map((s) => s.label);

    return (
      <g>
        {slices.map((s, i) => (
          <g key={i}>
            <path
              d={s.path} fill={s.color} stroke="white" strokeWidth="2" opacity="0.9"
              onMouseEnter={(e) => handleHover(e, s.label, `${fmt(s.value)} (${s.percent}%)`)}
              onMouseLeave={handleMouseLeave}
              className="cursor-pointer"
            />
            {slices.length <= 8 && (
              <>
                <text x={s.labelX} y={s.labelY - 5} textAnchor="middle" className="fill-foreground" fontSize="10" fontWeight="600">
                  {String(s.label).length > 10 ? String(s.label).slice(0, 9) + '..' : s.label}
                </text>
                <text x={s.labelX} y={s.labelY + 8} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
                  {s.percent}%
                </text>
              </>
            )}
          </g>
        ))}
        {/* Center label */}
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-foreground" fontSize="20" fontWeight="700">{fmt(total)}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-muted-foreground" fontSize="11">Total</text>
        {/* Donut legend */}
        {showLegend && renderPieLegend(legendLabels, slices)}
      </g>
    );
  };

  // ── Scatter Plot ──
  const renderScatterPlot = () => {
    if (chartData.length === 0) return null;
    const maxVal = Math.max(...chartData.map((d) => d.y), 1);
    const minVal = Math.min(...chartData.map((d) => d.y), 0);
    const range = maxVal - minVal || 1;
    const stepX = plotW / (chartData.length - 1 || 1);

    return (
      <g>
        {renderGridAndAxes(maxVal, minVal)}
        {chartData.map((d, i) => {
          const cx = PAD.left + i * stepX;
          const cy = PAD.top + plotH - ((d.y - minVal) / range) * plotH;
          const color = palette[i % palette.length];
          return (
            <g key={i}>
              <circle
                cx={cx} cy={cy} r="7" fill={color} opacity="0.8" stroke="white" strokeWidth="2"
                onMouseEnter={(e) => handleHover(e, d.x, fmt(d.y))}
                onMouseLeave={handleMouseLeave}
                className="cursor-pointer"
              />
            </g>
          );
        })}
        {renderXLabels(chartData.map((d) => d.x), chartData.map((_, i) => PAD.left + i * stepX))}
        <text x={CHART_W / 2} y={CHART_H - 8} textAnchor="middle" className="fill-muted-foreground" fontSize="12" fontWeight="600">{xColumn}</text>
        <text x={16} y={CHART_H / 2} textAnchor="middle" className="fill-muted-foreground" fontSize="12" fontWeight="600" transform={`rotate(-90, 16, ${CHART_H / 2})`}>{yColumn}</text>
      </g>
    );
  };

  // ── Radar / Spider Chart (multi-series) ──
  const renderRadarChart = () => {
    if (multiSeriesData.length === 0 || multiSeriesData.length < 3) return null;
    const cx = CHART_W / 2;
    const cy = CHART_H / 2;
    const radius = Math.min(plotW, plotH) / 2 - 50;
    const allVals = multiSeriesData.flatMap((d) => yColumns.map((yc) => d[yc] as number));
    const maxVal = Math.max(...allVals, 1);
    const n = multiSeriesData.length;
    const angleStep = (2 * Math.PI) / n;

    // Draw concentric polygon grid
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const gridPaths = gridLevels.map((level) => {
      const pts = multiSeriesData.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const r = radius * level;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      });
      return pts.join(' ');
    });

    return (
      <g>
        {/* Grid polygons */}
        {gridPaths.map((pts, i) => (
          <polygon key={i} points={pts} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {/* Axis lines and labels */}
        {multiSeriesData.map((d, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const ex = cx + radius * Math.cos(angle);
          const ey = cy + radius * Math.sin(angle);
          const lx = cx + (radius + 22) * Math.cos(angle);
          const ly = cy + (radius + 22) * Math.sin(angle);
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#d1d5db" strokeWidth="1" />
              <text x={lx} y={ly + 4} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
                {String(d.x).length > 10 ? String(d.x).slice(0, 9) + '..' : String(d.x)}
              </text>
            </g>
          );
        })}
        {/* Data polygons (one per Y column) */}
        {yColumns.map((yc, si) => {
          const color = palette[si % palette.length];
          const dataPts = multiSeriesData.map((d, i) => {
            const val = ((d[yc] as number) / maxVal) * radius;
            const angle = -Math.PI / 2 + i * angleStep;
            return `${cx + val * Math.cos(angle)},${cy + val * Math.sin(angle)}`;
          });
          return (
            <g key={yc}>
              <polygon
                points={dataPts.join(' ')}
                fill={color} fillOpacity="0.2"
                stroke={color} strokeWidth="2"
              />
              {multiSeriesData.map((d, i) => {
                const val = ((d[yc] as number) / maxVal) * radius;
                const angle = -Math.PI / 2 + i * angleStep;
                const px = cx + val * Math.cos(angle);
                const py = cy + val * Math.sin(angle);
                return (
                  <circle
                    key={i} cx={px} cy={py} r="4" fill="white" stroke={color} strokeWidth="2"
                    onMouseEnter={(e) => handleHover(e, String(d.x), fmt(d[yc] as number), yc)}
                    onMouseLeave={handleMouseLeave}
                    className="cursor-pointer"
                  />
                );
              })}
            </g>
          );
        })}
        {showLegend && yColumns.length > 1 && renderLegend(yColumns)}
      </g>
    );
  };

  // ── Legend helper (for line, bar, area charts) ──
  const renderLegend = (labels: string[]) => {
    const lw = labels.length * 90;
    const startX = (CHART_W - lw) / 2;
    return (
      <g>
        {labels.map((lbl, i) => (
          <g key={lbl} transform={`translate(${startX + i * 90}, ${CHART_H - 20})`}>
            <rect x="0" y="-8" width="12" height="12" rx="3" fill={palette[i % palette.length]} />
            <text x="16" y="2" className="fill-muted-foreground" fontSize="11">
              {lbl.length > 10 ? lbl.slice(0, 9) + '..' : lbl}
            </text>
          </g>
        ))}
      </g>
    );
  };

  // ── Pie/Donut legend helper (below chart with wrap) ──
  const renderPieLegend = (labels: string[], slices: { color: string; percent: string }[]) => {
    if (labels.length === 0) return null;
    const itemsPerRow = Math.min(labels.length, 4);
    const colW = 180;
    const startX = (CHART_W - itemsPerRow * colW) / 2;
    const startY = CHART_H - 15;
    const rows = Math.ceil(labels.length / itemsPerRow);
    return (
      <g>
        {labels.map((lbl, i) => {
          const row = Math.floor(i / itemsPerRow);
          const col = i % itemsPerRow;
          const x = startX + col * colW;
          const y = startY - (rows - 1 - row) * 16;
          return (
            <g key={lbl} transform={`translate(${x}, ${y})`}>
              <rect x="0" y="-8" width="10" height="10" rx="2" fill={slices[i]?.color || palette[i % palette.length]} />
              <text x="14" y="1" className="fill-muted-foreground" fontSize="10">
                {lbl.length > 12 ? lbl.slice(0, 11) + '..' : lbl} ({slices[i]?.percent || '0'}%)
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  // ── Render Chart ──
  const renderChart = () => {
    switch (chartType) {
      case 'bar': return renderBarChart();
      case 'hbar': return renderHBarChart();
      case 'line': return renderLineChart();
      case 'area': return renderAreaChart();
      case 'pie': return renderPieChart();
      case 'donut': return renderDonutChart();
      case 'scatter': return renderScatterPlot();
      case 'radar': return renderRadarChart();
      case 'heatmap': return null; // rendered separately as HTML table
      default: return null;
    }
  };

  // ── Heatmap Table ──
  const renderHeatmapTable = () => {
    if (!hasData || !xColumn || yColumns.length === 0) return null;
    const numericCols = yColumns;
    const allVals = processedData.flatMap((r) => numericCols.map((c) => parseFloat(r[c]) || 0));
    const minV = Math.min(...allVals);
    const maxV = Math.max(...allVals);
    const range = maxV - minV || 1;

    const getHeatColor = (val: number) => {
      const t = (val - minV) / range;
      const p = palette[0];
      // Convert hex to rgb for opacity blend
      const r = parseInt(p.slice(1, 3), 16);
      const g = parseInt(p.slice(3, 5), 16);
      const b = parseInt(p.slice(5, 7), 16);
      const a = Math.max(0.08, t * 0.9);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground border-b">{xColumn}</th>
              {numericCols.map((c) => (
                <th key={c} className="px-3 py-2 text-right font-medium text-muted-foreground border-b">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.slice(0, 30).map((row, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 font-medium border-b border-muted/50">{row[xColumn]}</td>
                {numericCols.map((c) => {
                  const v = parseFloat(row[c]) || 0;
                  return (
                    <td
                      key={c}
                      className="px-3 py-2 text-right font-mono border-b border-muted/50 transition-colors"
                      style={{ backgroundColor: getHeatColor(v) }}
                    >
                      {fmt(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Numeric columns helper ──
  const numericColumns = useMemo(() => {
    return headers.filter((h) => data.some((r) => !isNaN(parseFloat(r[h]))));
  }, [headers, data]);

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <TrendingUp className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Data Viz Studio</h1>
            <p className="text-sm text-muted-foreground">Professional chart builder with analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasData && (
            <>
              <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                <Database className="size-3" /> {data.length} rows
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-teal-50 text-teal-700 border-teal-200">
                <Table2 className="size-3" /> {headers.length} cols
              </Badge>
              {yColumns.length > 1 && (
                <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                  <Sigma className="size-3" /> {yColumns.length} series
                </Badge>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* ── Data Input Section ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Database className="size-4 text-emerald-500" />
                Data Input
              </CardTitle>
              {hasData && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={showComparison ? 'default' : 'outline'}
                    size="sm"
                    className={cn('gap-1.5', showComparison && 'bg-teal-600 hover:bg-teal-700')}
                    onClick={() => setShowComparison(!showComparison)}
                  >
                    <GitCompareArrows className="size-3.5" /> Compare
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="upload" className="gap-1.5">
                  <Upload className="size-3.5" /> Upload CSV
                </TabsTrigger>
                <TabsTrigger value="paste" className="gap-1.5">
                  <FileSpreadsheet className="size-3.5" /> Paste Data
                </TabsTrigger>
                <TabsTrigger value="sample" className="gap-1.5">
                  <Database className="size-3.5" /> Sample Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-8">
                    <Upload className="size-10 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">Primary Dataset</p>
                    <p className="text-xs text-muted-foreground/70">First row should be headers</p>
                    <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                      <Upload className="size-4" /> Choose File
                    </Button>
                  </div>
                  {showComparison && (
                    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/30 p-8">
                      <GitCompareArrows className="size-10 text-teal-400" />
                      <p className="text-sm font-medium text-muted-foreground">Comparison Dataset</p>
                      <p className="text-xs text-muted-foreground/70">Load a second dataset to compare</p>
                      <input ref={compFileInputRef} type="file" accept=".csv" onChange={handleCompFileUpload} className="hidden" id="csv-comp-upload" />
                      <Button variant="outline" size="sm" onClick={() => compFileInputRef.current?.click()} className="gap-2 border-teal-300 text-teal-700 hover:bg-teal-50">
                        <Upload className="size-4" /> Choose File
                      </Button>
                      {compData.length > 0 && (
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700">{compData.length} rows loaded</Badge>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="paste" className="mt-4">
                <div className="space-y-3">
                  <Textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Month,Sales,Profit&#10;Jan,42000,12000&#10;Feb,45000,13500&#10;..."
                    className="min-h-[140px] font-mono text-sm"
                  />
                  <Button onClick={handlePasteSubmit} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="size-4" /> Load Data
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="sample" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(SAMPLE_DATASETS).map(([name, ds]) => {
                    const descriptions: Record<string, string> = {
                      'Sales Data': 'Monthly sales by region for trend analysis',
                      'Student Grades': 'Multi-subject academic performance scores',
                      'Website Analytics': 'Daily traffic and engagement metrics',
                      'Stock Prices': '30-day OHLCV trading data',
                      'Data Science Projects': 'ML project scores across lifecycle stages',
                      'Market Research': 'Quarterly revenue by product category',
                    };
                    const icons: Record<string, string> = {
                      'Sales Data': '📈',
                      'Student Grades': '🎓',
                      'Website Analytics': '🌐',
                      'Stock Prices': '📊',
                      'Data Science Projects': '🧠',
                      'Market Research': '🏦',
                    };
                    return (
                      <Button
                        key={name}
                        variant="outline"
                        className="h-auto flex-col items-start gap-1 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50/50"
                        onClick={() => loadSample(name)}
                      >
                        <span className="text-lg">{icons[name] || '📊'}</span>
                        <span className="font-medium">{name}</span>
                        <span className="text-[11px] text-muted-foreground leading-tight">{descriptions[name]}</span>
                        <span className="text-xs text-muted-foreground/70 mt-0.5">
                          {ds.rows.length} rows × {ds.headers.length} cols
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            {hasData && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium text-emerald-800">
                    {data.length} rows loaded with columns: {headers.join(', ')}
                    {filterColumn && filterValue && ` (filtered: ${filteredData.length} matching)`}
                  </span>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Main Builder + Chart + Analytics Layout ── */}
      <AnimatePresence>
        {hasData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6 xl:grid-cols-[300px_1fr_280px] lg:grid-cols-[280px_1fr]"
          >
            {/* ── Left: Chart Builder Controls ── */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Palette className="size-4 text-emerald-500" />
                  Chart Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Chart Type */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chart Type</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CHART_TYPES.map((ct) => (
                      <button
                        key={ct.type}
                        onClick={() => setChartType(ct.type)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition-all border',
                          chartType === ct.type
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                            : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:border-muted-foreground/20'
                        )}
                      >
                        {ct.icon}
                        <span className="text-[10px] leading-tight">{ct.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* X Column */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">X-Axis</label>
                  <Select value={xColumn} onValueChange={setXColumn}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Y Columns (multi-select) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Y-Axis Columns ({yColumns.length})
                  </label>
                  <div className="max-h-32 overflow-y-auto rounded-lg border p-2 space-y-1">
                    {numericColumns.map((h) => (
                      <button
                        key={h}
                        onClick={() => toggleYColumn(h)}
                        className={cn(
                          'w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-all text-left',
                          yColumns.includes(h)
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent'
                        )}
                      >
                        <div className={cn(
                          'size-3.5 rounded border-2 flex items-center justify-center shrink-0',
                          yColumns.includes(h) ? 'border-emerald-600 bg-emerald-600' : 'border-muted-foreground/30'
                        )}>
                          {yColumns.includes(h) && <span className="text-white text-[8px] font-bold">&#10003;</span>}
                        </div>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart Title */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</label>
                  <Input
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="Enter chart title"
                    className="h-9"
                  />
                </div>

                {/* Aggregation */}
                {(chartType === 'bar' || chartType === 'line' || chartType === 'area' || chartType === 'hbar') && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                      <Sigma className="size-3" /> Aggregation
                    </label>
                    <Select value={aggregation} onValueChange={(v) => setAggregation(v as AggregationType)}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(AGGREGATION_LABELS) as AggregationType[]).map((a) => (
                          <SelectItem key={a} value={a}>{AGGREGATION_LABELS[a]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Color Theme */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(COLOR_PALETTES) as ColorTheme[]).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setColorTheme(theme)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-lg p-2 transition-all border',
                          colorTheme === theme
                            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                            : 'border-transparent bg-muted/50 hover:bg-muted'
                        )}
                      >
                        <div className="flex gap-0.5">
                          {COLOR_PALETTES[theme].slice(0, 4).map((c, i) => (
                            <div key={i} className="size-3 rounded-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">{THEME_LABELS[theme]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium flex items-center gap-1.5">
                      <Grid3x3 className="size-3" /> Grid
                    </label>
                    <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium flex items-center gap-1.5">
                      <BarChart3 className="size-3" /> Legend
                    </label>
                    <Switch checked={showLegend} onCheckedChange={setShowLegend} />
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="space-y-2 pt-2 border-t">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Export</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadSVG}>
                      <Download className="size-3" /> SVG
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadCSV}>
                      <FileSpreadsheet className="size-3" /> CSV
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleCopyData}>
                      <Copy className="size-3" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handlePrint}>
                      <Printer className="size-3" /> Print
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Center: Chart Display ── */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{chartTitle}</CardTitle>
                    <div className="flex items-center gap-2">
                      {aggregation !== 'none' && (
                        <Badge variant="outline" className="gap-1 text-xs border-amber-300 text-amber-700 bg-amber-50">
                          <Sigma className="size-3" /> {AGGREGATION_LABELS[aggregation]}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="gap-1">
                        <Download className="size-3" />
                        {CHART_TYPES.find((c) => c.type === chartType)?.label || 'Chart'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {chartType === 'heatmap' ? (
                    renderHeatmapTable()
                  ) : (
                    <div ref={chartRef} className="chart-wrapper relative w-full overflow-hidden rounded-xl bg-white border">
                      <svg
                        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                        className="w-full h-auto"
                        preserveAspectRatio="xMidYMid meet"
                        role="img"
                        aria-label={`${chartTitle} - ${chartType} chart`}
                      >
                        {/* Chart title in SVG */}
                        <text x={CHART_W / 2} y={28} textAnchor="middle" className="fill-foreground" fontSize="16" fontWeight="700">{chartTitle}</text>
                        {renderChart()}
                      </svg>
                      {/* Tooltip Overlay */}
                      <AnimatePresence>
                        {tooltip && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.1 }}
                            className="absolute z-50 pointer-events-none rounded-lg bg-gray-900/90 text-white px-3 py-2 shadow-lg text-xs max-w-[200px]"
                            style={{
                              left: tooltip.x + 12,
                              top: tooltip.y - 10,
                            }}
                          >
                            <div className="font-semibold text-white/90">{tooltip.label}</div>
                            {tooltip.series && <div className="text-emerald-300 text-[10px] mt-0.5">{tooltip.series}</div>}
                            <div className="text-white mt-0.5 text-sm font-bold">{tooltip.value}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Quick Stats Row */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5">
                      <span className="text-[10px] text-muted-foreground uppercase">Points</span>
                      <span className="text-sm font-semibold">{chartData.length}</span>
                    </div>
                    {chartData.length > 0 && (
                      <>
                        <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5">
                          <span className="text-[10px] text-muted-foreground uppercase">Min</span>
                          <span className="text-sm font-semibold">{fmt(Math.min(...chartData.map((d) => d.y)))}</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5">
                          <span className="text-[10px] text-muted-foreground uppercase">Max</span>
                          <span className="text-sm font-semibold">{fmt(Math.max(...chartData.map((d) => d.y)))}</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5">
                          <span className="text-[10px] text-muted-foreground uppercase">Avg</span>
                          <span className="text-sm font-semibold">{fmt(chartData.reduce((a, d) => a + d.y, 0) / chartData.length)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ── Data Table ── */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Table2 className="size-4 text-emerald-500" />
                      Data Table
                    </CardTitle>
                    {/* Filter controls */}
                    <div className="flex items-center gap-2">
                      <Filter className="size-3.5 text-muted-foreground shrink-0" />
                      <Select value={filterColumn} onValueChange={(v) => { setFilterColumn(v); setFilterValue(''); }}>
                        <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Column..." /></SelectTrigger>
                        <SelectContent>
                          {headers.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filterColumn && (
                        <Input
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          placeholder="Filter value..."
                          className="h-8 w-[150px] text-xs"
                        />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground w-10">#</th>
                          {headers.map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap"
                              onClick={() => handleSort(h)}
                            >
                              <div className="flex items-center gap-1">
                                {h}
                                {sortColumn === h && (
                                  sortDirection === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                                )}
                                {sortColumn !== h && <ArrowUpDown className="size-3 opacity-30" />}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((row, i) => (
                          <tr key={i} className="border-b border-muted/50 hover:bg-muted/30 transition-colors">
                            <td className="px-3 py-1.5 text-xs text-muted-foreground">{(currentPage - 1) * ROWS_PER_PAGE + i + 1}</td>
                            {headers.map((h) => (
                              <td key={h} className="px-3 py-1.5 text-xs whitespace-nowrap">
                                {row[h]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, sortedData.length)} of {sortedData.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage <= 1} onClick={() => setCurrentPage(1)}>
                        <ChevronLeft className="size-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                        <ChevronLeft className="size-3" />
                      </Button>
                      <span className="text-xs font-medium px-2">
                        {currentPage} / {totalPages}
                      </span>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                        <ChevronRight className="size-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}>
                        <ChevronRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Right: Analytics Panel ── */}
            <div className="hidden xl:block space-y-4">
              {/* Analytics Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calculator className="size-4 text-emerald-500" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics ? (
                    <>
                      {/* Trend indicator */}
                      <div className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold',
                        analytics.trend === 'up' && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                        analytics.trend === 'down' && 'bg-rose-50 text-rose-700 border border-rose-200',
                        analytics.trend === 'stable' && 'bg-gray-50 text-gray-700 border border-gray-200',
                      )}>
                        {analytics.trend === 'up' && <TrendingUp className="size-4" />}
                        {analytics.trend === 'down' && <TrendingDown className="size-4" />}
                        {analytics.trend === 'stable' && <Minus className="size-4" />}
                        {analytics.trend === 'up' ? 'Upward Trend' : analytics.trend === 'down' ? 'Downward Trend' : 'Stable Trend'}
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Count', value: analytics.count, icon: <Sigma className="size-3" /> },
                          { label: 'Sum', value: fmt(analytics.sum), icon: <Sigma className="size-3" /> },
                          { label: 'Mean', value: fmt(analytics.mean), icon: <Info className="size-3" /> },
                          { label: 'Median', value: fmt(analytics.median), icon: <Info className="size-3" /> },
                          { label: 'Std Dev', value: fmt(analytics.stdDev), icon: <Info className="size-3" /> },
                          { label: 'Min', value: fmt(analytics.min), icon: <Info className="size-3" /> },
                          { label: 'Max', value: fmt(analytics.max), icon: <Info className="size-3" /> },
                          { label: 'Range', value: fmt(analytics.max - analytics.min), icon: <Info className="size-3" /> },
                        ].map((stat) => (
                          <div key={stat.label} className="rounded-lg bg-muted/50 px-3 py-2">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-medium">
                              {stat.icon} {stat.label}
                            </div>
                            <div className="text-sm font-bold mt-0.5">{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Distribution bar */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="text-[10px] uppercase font-semibold text-muted-foreground">Distribution of {yColumn}</div>
                        {(() => {
                          if (!analytics) return null;
                          const vals = processedData.map((r) => parseFloat(r[yColumn]) || 0).filter((v) => !isNaN(v));
                          const buckets = 5;
                          const min = analytics.min;
                          const max = analytics.max;
                          const range = max - min || 1;
                          const step = range / buckets;
                          const counts = new Array(buckets).fill(0);
                          vals.forEach((v) => {
                            const idx = Math.min(Math.floor((v - min) / step), buckets - 1);
                            counts[idx]++;
                          });
                          const maxCount = Math.max(...counts, 1);
                          return (
                            <div className="space-y-1">
                              {counts.map((c, i) => {
                                const pct = (c / maxCount) * 100;
                                return (
                                  <div key={i} className="flex items-center gap-2">
                                    <span className="text-[9px] text-muted-foreground w-14 text-right shrink-0">{fmt(min + i * step)}</span>
                                    <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.05 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: palette[i % palette.length] }}
                                      />
                                    </div>
                                    <span className="text-[9px] text-muted-foreground w-5 shrink-0">{c}</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Top 5 values */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="text-[10px] uppercase font-semibold text-muted-foreground">Top 5 by {yColumn}</div>
                        {[...processedData]
                          .sort((a, b) => (parseFloat(b[yColumn]) || 0) - (parseFloat(a[yColumn]) || 0))
                          .slice(0, 5)
                          .map((row, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="font-medium truncate max-w-[120px]">{row[xColumn]}</span>
                              <span className="font-bold text-emerald-600">{fmt(parseFloat(row[yColumn]) || 0)}</span>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      <Calculator className="size-8 mx-auto mb-2 opacity-30" />
                      <p>Select a Y-axis column to see analytics</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comparison Panel */}
              {showComparison && compData.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <GitCompareArrows className="size-4 text-teal-500" />
                      Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Dataset 1: <span className="font-semibold text-foreground">{data.length} rows</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dataset 2: <span className="font-semibold text-foreground">{compData.length} rows</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Columns 1: <span className="font-semibold text-foreground">{headers.join(', ')}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Columns 2: <span className="font-semibold text-foreground">{compHeaders.join(', ')}</span>
                      </div>
                      {(() => {
                        // Quick stat comparison for matching columns
                        const commonCols = headers.filter((h) => compHeaders.includes(h));
                        if (commonCols.length === 0) return <p className="text-xs text-amber-600 mt-2">No common columns for comparison</p>;
                        return (
                          <div className="mt-3 space-y-2 pt-2 border-t">
                            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Common Columns</div>
                            {commonCols.slice(0, 4).map((col) => {
                              const vals1 = data.map((r) => parseFloat(r[col]) || 0).filter((v) => !isNaN(v));
                              const vals2 = compData.map((r) => parseFloat(r[col]) || 0).filter((v) => !isNaN(v));
                              const avg1 = vals1.length ? vals1.reduce((a, b) => a + b, 0) / vals1.length : 0;
                              const avg2 = vals2.length ? vals2.reduce((a, b) => a + b, 0) / vals2.length : 0;
                              const diff = avg1 - avg2;
                              return (
                                <div key={col} className="flex items-center justify-between text-xs rounded-lg bg-muted/50 px-2 py-1.5">
                                  <span className="font-medium">{col}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{fmt(avg1)}</span>
                                    <span className={diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                      {diff >= 0 ? '+' : ''}{fmt(diff)}
                                    </span>
                                    <span className="text-muted-foreground">{fmt(avg2)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
