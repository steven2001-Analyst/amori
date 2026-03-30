'use client';

import React, { useState, useCallback } from 'react';
import { Palette, Copy, Check, RefreshCw, Lock, Unlock, Download, Paintbrush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
  h: number;
  s: number;
  l: number;
  locked: boolean;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function generateHarmoniousPalette(): ColorInfo[] {
  const baseHue = Math.floor(Math.random() * 360);
  const strategies = ['analogous', 'complementary', 'triadic', 'split-complementary', 'tetradic'];
  const strategy = strategies[Math.floor(Math.random() * strategies.length)];

  let hues: number[] = [];
  switch (strategy) {
    case 'analogous':
      hues = [baseHue, baseHue + 30, baseHue + 60, baseHue - 30, baseHue - 60];
      break;
    case 'complementary':
      hues = [baseHue, baseHue + 20, baseHue + 180, baseHue + 200, baseHue - 20];
      break;
    case 'triadic':
      hues = [baseHue, baseHue + 120, baseHue + 240, baseHue + 15, baseHue + 135];
      break;
    case 'split-complementary':
      hues = [baseHue, baseHue + 150, baseHue + 210, baseHue + 30, baseHue + 330];
      break;
    case 'tetradic':
      hues = [baseHue, baseHue + 90, baseHue + 180, baseHue + 270, baseHue + 45];
      break;
  }

  return hues.map((h, i) => {
    const hue = ((h % 360) + 360) % 360;
    const sat = 55 + Math.floor(Math.random() * 30);
    const light = i === 0 ? 45 + Math.floor(Math.random() * 15) : 30 + Math.floor(Math.random() * 45);
    const [r, g, b] = hslToRgb(hue, sat, light);
    return {
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hue}, ${sat}%, ${light}%)`,
      h: hue,
      s: sat,
      l: light,
      locked: false,
    };
  });
}

export default function ColorGeneratorTool() {
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [history, setHistory] = useState<ColorInfo[][]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');

  const generate = useCallback(() => {
    if (palette.length > 0 && !palette.every(c => c.locked)) {
      setHistory(prev => [palette, ...prev.slice(0, 4)]);
    }
    const newPalette = generateHarmoniousPalette();
    setPalette(newPalette);
  }, [palette]);

  const toggleLock = (index: number) => {
    setPalette(prev => prev.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
  };

  const regenerateUnlocked = () => {
    const lockedColors = palette.filter(c => c.locked);
    if (lockedColors.length === 5) {
      toast.info('All colors are locked. Unlock some to regenerate.');
      return;
    }
    const baseHue = Math.floor(Math.random() * 360);
    const newColors: ColorInfo[] = palette.map((c, i) => {
      if (c.locked) return c;
      const hue = (baseHue + i * 40 + Math.floor(Math.random() * 20)) % 360;
      const sat = 55 + Math.floor(Math.random() * 30);
      const light = 30 + Math.floor(Math.random() * 40);
      const [r, g, b] = hslToRgb(hue, sat, light);
      return {
        hex: rgbToHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${hue}, ${sat}%, ${light}%)`,
        h: hue,
        s: sat,
        l: light,
        locked: false,
      };
    });
    setPalette(newColors);
    toast.success('Unlocked colors regenerated');
  };

  const getColorValue = (color: ColorInfo): string => {
    switch (selectedFormat) {
      case 'hex': return color.hex;
      case 'rgb': return color.rgb;
      case 'hsl': return color.hsl;
      default: return color.hex;
    }
  };

  const copyColor = (color: ColorInfo) => {
    const val = getColorValue(color);
    navigator.clipboard.writeText(val);
    setCopied(color.hex);
    toast.success(`Copied ${val}`);
    setTimeout(() => setCopied(null), 1500);
  };

  const exportCss = () => {
    if (palette.length === 0) {
      toast.error('Generate a palette first');
      return;
    }
    const css = `:root {\n${palette.map((c, i) =>
      `  --color-${i + 1}: ${c.hex};\n  --color-${i + 1}-rgb: ${c.rgb};\n  --color-${i + 1}-hsl: ${c.hsl};`
    ).join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    toast.success('CSS variables copied!');
  };

  const getContrastColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={generate} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
          <Palette className="w-4 h-4 mr-2" />Generate
        </Button>
        {palette.length > 0 && (
          <Button onClick={regenerateUnlocked} variant="outline" className="rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />Regenerate Unlocked
          </Button>
        )}
        {palette.length > 0 && (
          <Button onClick={exportCss} variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />Export CSS
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <Label className="text-xs text-muted-foreground">Format:</Label>
          {(['hex', 'rgb', 'hsl'] as const).map(fmt => (
            <Button
              key={fmt}
              variant="ghost"
              size="sm"
              className={cn('h-7 text-xs font-mono rounded-md', selectedFormat === fmt && 'bg-muted shadow-sm')}
              onClick={() => setSelectedFormat(fmt)}
            >
              {fmt.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {palette.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Paintbrush className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-base font-medium">Generate a Color Palette</p>
          <p className="text-sm mt-1">Create harmonious color schemes for your dashboards</p>
        </div>
      )}

      {/* Main Palette */}
      {palette.length > 0 && (
        <div className="space-y-3">
          <div className="flex rounded-xl overflow-hidden shadow-lg border border-border/50 h-40">
            {palette.map((color, i) => {
              const textCol = getContrastColor(color.hex);
              return (
                <button
                  key={i}
                  className="flex-1 relative cursor-pointer transition-all hover:flex-[1.3] group flex flex-col items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyColor(color)}
                >
                  <div className="text-center">
                    <span className="font-mono text-sm font-bold" style={{ color: textCol }}>
                      {getColorValue(color)}
                    </span>
                  </div>
                  {/* Lock button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLock(i); }}
                    className={cn(
                      'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100',
                      color.locked ? 'bg-white/30 text-white' : 'bg-black/20 text-white',
                    )}
                  >
                    {color.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>
                  {/* Copy indicator */}
                  {copied === color.hex && (
                    <Check className="absolute top-2 left-2 w-4 h-4 text-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Color Details */}
          <div className="grid grid-cols-5 gap-2">
            {palette.map((color, i) => (
              <div key={i} className="rounded-lg border border-border/50 p-2.5 space-y-2 bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md shadow-sm border border-border/30 shrink-0" style={{ backgroundColor: color.hex }} />
                  <Badge variant="secondary" className="text-[10px] h-4">{i + 1}</Badge>
                  {color.locked && <Lock className="w-3 h-3 text-muted-foreground ml-auto" />}
                </div>
                <div className="space-y-1 text-[10px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">HEX</span>
                    <span>{color.hex}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">RGB</span>
                    <span className="truncate ml-1">{color.rgb}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">HSL</span>
                    <span className="truncate ml-1">{color.hsl}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Recent Palettes</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((hist, hi) => (
              <button
                key={hi}
                className="w-full flex rounded-lg overflow-hidden shadow-sm border border-border/50 h-10 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setPalette(hist)}
              >
                {hist.map((c, ci) => (
                  <div key={ci} className="flex-1" style={{ backgroundColor: c.hex }} />
                ))}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
