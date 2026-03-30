'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';
import {
  Pen,
  Eraser,
  Type,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Undo2,
  Trash2,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ───
type Tool = 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'line' | 'arrow';

interface Point {
  x: number;
  y: number;
}

const PRESET_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'White', value: '#FFFFFF' },
];

const STROKE_WIDTHS = [
  { label: 'Thin', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Thick', value: 8 },
];

// ─── Main Component ───
export default function WhiteboardView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<ImageData[]>([]);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<Point>({ x: 0, y: 0 });
  const preDrawImageRef = useRef<ImageData | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [activeColor, setActiveColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [customColor, setCustomColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textInput, setTextInput] = useState<Point | null>(null);
  const [textValue, setTextValue] = useState('');
  const [fontSize, setFontSize] = useState(18);

  const store = useProgressStore();

  // ─── Grid Pattern ───
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#E5E7EB';
    const gap = 20;
    for (let x = gap; x < w; x += gap) {
      for (let y = gap; y < h; y += gap) {
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  // ─── Draw Arrow ───
  const drawArrow = useCallback((
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    lineWidth: number
  ) => {
    const headLen = Math.max(lineWidth * 4, 14);
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }, []);

  // ─── Canvas Setup ───
  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    // Save current drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = w;
    canvas.height = h;

    // Restore drawing
    drawGrid(ctx, w, h);
    if (tempCtx) {
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }, [drawGrid]);

  // ─── Save History ───
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(imageData);
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    }
  }, []);

  // ─── Undo ───
  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0) {
      toast.info('Nothing to undo');
      return;
    }
    const ctx = getCanvasContext();
    if (!ctx) return;
    const lastState = historyRef.current.pop();
    if (lastState) {
      ctx.putImageData(lastState, 0, 0);
    }
    toast.success('Undo successful');
  }, [getCanvasContext]);

  // ─── Clear Canvas ───
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;
    saveToHistory();
    drawGrid(ctx, canvas.width, canvas.height);
    toast.success('Canvas cleared');
  }, [getCanvasContext, drawGrid, saveToHistory]);

  // ─── Save as Image ───
  const handleSaveImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `datatrack-whiteboard-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Image downloaded');
  }, []);

  // ─── Save to Notes ───
  const handleSaveToNotes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    store.setNote('whiteboard-saved', dataUrl);
    toast.success('Whiteboard saved to notes');
  }, [store]);

  // ─── Load from Saved ───
  const handleLoadSaved = useCallback(() => {
    const notes = store.notes || {};
    const saved = notes['whiteboard-saved'];
    if (!saved) {
      toast.error('No saved whiteboard found');
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = getCanvasContext();
      if (!canvas || !ctx) return;
      saveToHistory();
      drawGrid(ctx, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      toast.success('Whiteboard loaded from notes');
    };
    img.src = saved;
  }, [store, getCanvasContext, drawGrid, saveToHistory]);

  // ─── Zoom Controls ───
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 25));
  }, []);

  const handleFitToScreen = useCallback(() => {
    setZoom(100);
  }, []);

  // ─── Get Canvas Coordinates ───
  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scale = zoom / 100;
      return {
        x: (clientX - rect.left) / scale,
        y: (clientY - rect.top) / scale,
      };
    },
    [zoom]
  );

  // ─── Drawing Handlers ───
  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const ctx = getCanvasContext();
      if (!canvas || !ctx) return;

      let point: Point;
      if ('touches' in e) {
        const touch = e.touches[0];
        point = getCanvasPoint(touch.clientX, touch.clientY);
      } else {
        point = getCanvasPoint(e.clientX, e.clientY);
      }

      // Text tool — place input
      if (activeTool === 'text') {
        setTextInput(point);
        setTextValue('');
        setTimeout(() => textInputRef.current?.focus(), 50);
        return;
      }

      isDrawingRef.current = true;
      startPointRef.current = point;
      saveToHistory();

      // Save pre-draw state for shapes
      if (['rectangle', 'circle', 'line', 'arrow'].includes(activeTool)) {
        preDrawImageRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }

      // Configure context
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = strokeWidth * 4;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = strokeWidth;
      }

      if (activeTool === 'pen' || activeTool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
      }
    },
    [activeTool, activeColor, strokeWidth, getCanvasContext, getCanvasPoint, saveToHistory]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      const ctx = getCanvasContext();
      if (!ctx) return;

      let point: Point;
      if ('touches' in e) {
        e.preventDefault();
        const touch = e.touches[0];
        point = getCanvasPoint(touch.clientX, touch.clientY);
      } else {
        point = getCanvasPoint(e.clientX, e.clientY);
      }

      if (activeTool === 'pen' || activeTool === 'eraser') {
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      } else if (preDrawImageRef.current) {
        // Restore pre-draw image for shape preview
        ctx.putImageData(preDrawImageRef.current, 0, 0);
        const start = startPointRef.current;

        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (activeTool === 'rectangle') {
          ctx.beginPath();
          ctx.strokeRect(
            start.x,
            start.y,
            point.x - start.x,
            point.y - start.y
          );
        } else if (activeTool === 'circle') {
          const rx = Math.abs(point.x - start.x) / 2;
          const ry = Math.abs(point.y - start.y) / 2;
          const cx = start.x + (point.x - start.x) / 2;
          const cy = start.y + (point.y - start.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (activeTool === 'line') {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        } else if (activeTool === 'arrow') {
          drawArrow(ctx, start.x, start.y, point.x, point.y, strokeWidth);
        }
      }
    },
    [activeTool, activeColor, strokeWidth, getCanvasContext, getCanvasPoint, drawArrow]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    preDrawImageRef.current = null;
    const ctx = getCanvasContext();
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
    }
  }, [getCanvasContext]);

  // ─── Render Text on Canvas ───
  const commitText = useCallback(() => {
    if (!textInput || !textValue.trim()) {
      setTextInput(null);
      setTextValue('');
      return;
    }
    const ctx = getCanvasContext();
    if (!ctx) return;

    saveToHistory();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = activeColor;
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = 'top';

    // Handle multi-line
    const lines = textValue.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, textInput.x, textInput.y + i * (fontSize * 1.3));
    });

    setTextInput(null);
    setTextValue('');
    toast.success('Text placed on canvas');
  }, [textInput, textValue, fontSize, activeColor, getCanvasContext, saveToHistory]);

  // ─── Templates ───
  const loadTemplate = useCallback(
    (template: string) => {
      const canvas = canvasRef.current;
      const ctx = getCanvasContext();
      if (!canvas || !ctx) return;

      saveToHistory();
      drawGrid(ctx, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (template === 'erd') {
        // ERD Template — 3 entity boxes with relationships
        const entities = [
          { label: 'Users', x: cx - 250, y: cy - 60 },
          { label: 'Orders', x: cx, y: cy - 60 },
          { label: 'Products', x: cx + 250, y: cy - 60 },
        ];
        entities.forEach((e) => {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(e.x - 60, e.y - 30, 120, 60);
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2;
          ctx.strokeRect(e.x - 60, e.y - 30, 120, 60);
          ctx.fillStyle = '#1E40AF';
          ctx.font = 'bold 14px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(e.label, e.x, e.y - 5);
          // Column hint
          ctx.fillStyle = '#9CA3AF';
          ctx.font = '11px Inter, system-ui, sans-serif';
          ctx.fillText('id, name, ...', e.x, e.y + 15);
        });
        // Relationship lines
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(cx - 190, cy);
        ctx.lineTo(cx - 60, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 60, cy);
        ctx.lineTo(cx + 190, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        // Relationship labels
        ctx.fillStyle = '#6B7280';
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillText('1 : N', cx - 125, cy - 12);
        ctx.fillText('N : M', cx + 125, cy - 12);
        // Title
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 16px Inter, system-ui, sans-serif';
        ctx.fillText('Entity-Relationship Diagram', cx, cy - 130);
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText('Double-click to add entities and relationships', cx, cy + 80);
      } else if (template === 'flowchart') {
        // Flowchart Template
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 16px Inter, system-ui, sans-serif';
        ctx.fillText('Flowchart Template', cx, cy - 160);
        // Start oval
        ctx.fillStyle = '#DCFCE7';
        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 100, 60, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#166534';
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.fillText('Start', cx, cy - 100);
        // Process box
        ctx.fillStyle = '#DBEAFE';
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.fillRect(cx - 60, cy - 45, 120, 40);
        ctx.stroke();
        ctx.fillStyle = '#1E40AF';
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.fillText('Process', cx, cy - 25);
        // Decision diamond
        ctx.fillStyle = '#FEF9C3';
        ctx.strokeStyle = '#EAB308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 5);
        ctx.lineTo(cx + 60, cy + 45);
        ctx.lineTo(cx, cy + 85);
        ctx.lineTo(cx - 60, cy + 45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#854D0E';
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.fillText('Decision', cx, cy + 45);
        // Yes/No labels
        ctx.fillStyle = '#22C55E';
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.fillText('Yes', cx + 80, cy + 60);
        ctx.fillStyle = '#EF4444';
        ctx.fillText('No', cx - 80, cy + 60);
        // End oval
        ctx.fillStyle = '#FEE2E2';
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 130, 50, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#991B1B';
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.fillText('End', cx, cy + 130);
        // Arrows
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        // Start → Process
        ctx.beginPath(); ctx.moveTo(cx, cy - 75); ctx.lineTo(cx, cy - 45); ctx.stroke();
        // Process → Decision
        ctx.beginPath(); ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy + 5); ctx.stroke();
        // Decision → End
        ctx.beginPath(); ctx.moveTo(cx, cy + 85); ctx.lineTo(cx, cy + 108); ctx.stroke();
        // Decision → loop (No)
        ctx.beginPath(); ctx.moveTo(cx - 60, cy + 45); ctx.lineTo(cx - 110, cy + 45); ctx.lineTo(cx - 110, cy - 25); ctx.lineTo(cx - 60, cy - 25); ctx.stroke();
        // Hint
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.fillText('Draw your flowchart steps using pen and shape tools', cx, cy + 180);
      } else if (template === 'mindmap') {
        // Mind Map Template
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 16px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Mind Map Template', cx, cy - 160);
        // Central node
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 50);
        grad.addColorStop(0, '#10B981');
        grad.addColorStop(1, '#059669');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Inter, system-ui, sans-serif';
        ctx.fillText('Main Idea', cx, cy);
        // Branch nodes
        const branches = [
          { label: 'Branch 1', angle: -Math.PI / 2, color: '#3B82F6' },
          { label: 'Branch 2', angle: -Math.PI / 6, color: '#A855F7' },
          { label: 'Branch 3', angle: Math.PI / 6, color: '#F97316' },
          { label: 'Branch 4', angle: Math.PI / 2, color: '#EF4444' },
          { label: 'Branch 5', angle: (5 * Math.PI) / 6, color: '#22C55E' },
          { label: 'Branch 6', angle: (-5 * Math.PI) / 6, color: '#EAB308' },
        ];
        branches.forEach((b) => {
          const bx = cx + Math.cos(b.angle) * 160;
          const by = cy + Math.sin(b.angle) * 120;
          // Line
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(b.angle) * 50, cy + Math.sin(b.angle) * 50);
          ctx.lineTo(bx, by);
          ctx.stroke();
          // Node
          ctx.fillStyle = b.color + '22';
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bx, by, 35, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Label
          ctx.fillStyle = '#374151';
          ctx.font = '12px Inter, system-ui, sans-serif';
          ctx.fillText(b.label, bx, by);
        });
        // Hint
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.fillText('Click to add more branches and sub-topics', cx, cy + 170);
      } else {
        // Blank — just grid, already drawn
      }

      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
      toast.success(`Loaded ${template === 'erd' ? 'ERD' : template === 'flowchart' ? 'Flowchart' : template === 'mindmap' ? 'Mind Map' : 'blank'} template`);
    },
    [getCanvasContext, drawGrid, saveToHistory]
  );

  // ─── Init & Resize ───
  useEffect(() => {
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if (textInput && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commitText();
      }
      if (textInput && e.key === 'Escape') {
        setTextInput(null);
        setTextValue('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, textInput, commitText]);

  // ─── Tool Buttons ───
  const tools: { id: Tool; icon: React.ElementType; label: string }[] = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ─── Toolbar ─── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="shrink-0 border-b border-border bg-card shadow-sm"
      >
        {/* Top row: Tools + Colors + Actions */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-2">
          {/* Drawing Tools */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
            <TooltipProvider delayDuration={0}>
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-8 w-8 rounded-lg transition-all',
                          isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        onClick={() => setActiveTool(tool.id)}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{tool.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-border" />

          {/* Color Swatches */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                    activeColor === color.value
                      ? 'border-emerald-500 scale-110 shadow-md'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setActiveColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
            {/* Custom color toggle */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 rounded-lg',
                      showColorPicker && 'bg-emerald-100 dark:bg-emerald-900/40'
                    )}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Palette className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Custom Color</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 py-1"
              >
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setActiveColor(e.target.value);
                  }}
                  className="w-7 h-7 rounded cursor-pointer border-0"
                />
                <Input
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                      setActiveColor(e.target.value);
                    }
                  }}
                  className="h-7 w-24 text-xs"
                  placeholder="#000000"
                />
              </motion.div>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-border" />

          {/* Stroke Width */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Stroke:</span>
            {STROKE_WIDTHS.map((sw) => (
              <Button
                key={sw.value}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 text-xs rounded-lg',
                  strokeWidth === sw.value
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'text-muted-foreground'
                )}
                onClick={() => setStrokeWidth(sw.value)}
              >
                {sw.label}
              </Button>
            ))}
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-border" />

          {/* Font size for text tool */}
          {activeTool === 'text' && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              className="flex items-center gap-1 overflow-hidden"
            >
              <span className="text-xs text-muted-foreground">Size:</span>
              <Select value={String(fontSize)} onValueChange={(v) => setFontSize(Number(v))}>
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="18">18px</SelectItem>
                  <SelectItem value="24">24px</SelectItem>
                  <SelectItem value="32">32px</SelectItem>
                  <SelectItem value="48">48px</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={handleUndo}
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={handleClear}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Clear All</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                    onClick={handleSaveImage}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Save as Image</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                    onClick={handleSaveToNotes}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Save to Notes</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-purple-600"
                    onClick={handleLoadSaved}
                  >
                    <Upload className="w-4 h-4 rotate-180" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Load Saved</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Bottom row: Templates + Zoom */}
        <div className="flex items-center gap-3 px-3 pb-2">
          {/* Templates */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Templates:</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-lg"
              onClick={() => loadTemplate('blank')}
            >
              Blank
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-lg"
              onClick={() => loadTemplate('erd')}
            >
              ERD
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-lg"
              onClick={() => loadTemplate('flowchart')}
            >
              Flowchart
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-lg"
              onClick={() => loadTemplate('mindmap')}
            >
              Mind Map
            </Button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={handleZoomOut}
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="text-xs text-muted-foreground font-mono w-12 text-center">
              {zoom}%
            </span>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={handleZoomIn}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={handleFitToScreen}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fit to Screen</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.div>

      {/* ─── Canvas Area ─── */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            className="shadow-lg border border-border rounded-lg cursor-crosshair bg-white"
            style={{
              width: '100%',
              height: '100%',
              touchAction: 'none',
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Text Input Overlay */}
        {textInput && (
          <div className="absolute z-10" style={{ left: `${(textInput.x * zoom) / 100}px`, top: `${(textInput.y * zoom) / 100}px` }}>
            <Input
              ref={textInputRef}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  commitText();
                }
                if (e.key === 'Escape') {
                  setTextInput(null);
                  setTextValue('');
                }
              }}
              onBlur={commitText}
              placeholder="Type text..."
              className="bg-white/90 backdrop-blur-sm border-emerald-400 focus-visible:ring-emerald-400"
              style={{
                fontSize: `${fontSize * (zoom / 100)}px`,
                minWidth: '120px',
                color: activeColor,
              }}
              autoFocus
            />
          </div>
        )}

        {/* Active tool indicator */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md border border-border">
          {(() => {
            const ToolIcon = tools.find((t) => t.id === activeTool)?.icon || Pen;
            return (
              <>
                <ToolIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium capitalize">{activeTool}</span>
                {activeTool !== 'eraser' && activeTool !== 'text' && (
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: activeColor }}
                  />
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
