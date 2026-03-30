'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldCheck, Users, BookOpen, DollarSign, Activity, Ban, CheckCircle2,
  Lock, UserX, Crown, TrendingUp, BarChart3, Settings, LogOut,
  Eye, Search, ChevronDown, AlertTriangle, FileText, Package, Copy, X,
  ShieldAlert, Clock, Trash2, RefreshCw,
  Server, Database, Globe, Key, Monitor, Wifi, Zap,
  Download, Filter, Flame, Trophy, Gamepad2, MessageCircle, Award, Target,
  PieChart, ArrowUpRight, Calendar, CreditCard, Percent, GraduationCap, Upload,
  Send, UserPlus, Megaphone, Wrench, Mail, AlertOctagon, UserCog, Plus, Pencil, ToggleLeft,
  Bot, StickyNote, Layers, Briefcase, Video, Terminal,
  BarChart2, Pen, Bell, MessageSquarePlus, Palette,
  Save, Power, ToggleRight, Import, DatabaseBackup, HardDrive,
  SlidersHorizontal,
} from 'lucide-react';
import { subjects, getAllTopics } from '@/lib/study-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProgressStore, type SecurityAuditEntry, type UserBook } from '@/lib/store';

/* ─── Mock Data ─── */
interface MockUser {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'team';
  joinDate: string;
  status: 'active' | 'banned' | 'inactive';
  booksRead: number;
  coursesCompleted: number;
}

const mockUsers: MockUser[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah.chen@email.com', plan: 'pro', joinDate: '2025-10-15', status: 'active', booksRead: 12, coursesCompleted: 3 },
  { id: 'u2', name: 'James Wilson', email: 'j.wilson@email.com', plan: 'team', joinDate: '2025-11-02', status: 'active', booksRead: 28, coursesCompleted: 7 },
  { id: 'u3', name: 'Maria Rodriguez', email: 'maria.r@email.com', plan: 'free', joinDate: '2026-01-20', status: 'active', booksRead: 5, coursesCompleted: 1 },
  { id: 'u4', name: 'Alex Kumar', email: 'alex.kumar@email.com', plan: 'pro', joinDate: '2025-09-10', status: 'banned', booksRead: 2, coursesCompleted: 0 },
  { id: 'u5', name: 'Emily Park', email: 'e.park@email.com', plan: 'free', joinDate: '2026-02-05', status: 'inactive', booksRead: 0, coursesCompleted: 0 },
  { id: 'u6', name: 'David Thompson', email: 'd.thompson@email.com', plan: 'pro', joinDate: '2025-12-01', status: 'active', booksRead: 18, coursesCompleted: 5 },
  { id: 'u7', name: 'Lisa Wang', email: 'l.wang@email.com', plan: 'team', joinDate: '2026-01-08', status: 'active', booksRead: 34, coursesCompleted: 9 },
  { id: 'u8', name: 'Robert Kim', email: 'r.kim@email.com', plan: 'free', joinDate: '2026-02-14', status: 'active', booksRead: 3, coursesCompleted: 0 },
];

const mockActivityLog = [
  { id: 'a1', action: 'User login', user: 'Sarah Chen', time: '2 min ago', type: 'auth' },
  { id: 'a2', action: 'Book purchased: Storytelling with Data', user: 'James Wilson', time: '5 min ago', type: 'purchase' },
  { id: 'a3', action: 'Plan upgraded to Pro', user: 'Maria Rodriguez', time: '15 min ago', type: 'billing' },
  { id: 'a4', action: 'Failed login attempt', user: 'Unknown IP', time: '22 min ago', type: 'security' },
  { id: 'a5', action: 'Certificate earned: SQL Fundamentals', user: 'David Thompson', time: '1 hour ago', type: 'achievement' },
  { id: 'a6', action: 'Subscription cancelled', user: 'Emily Park', time: '2 hours ago', type: 'billing' },
  { id: 'a7', action: 'New user registered', user: 'Tom Baker', time: '3 hours ago', type: 'auth' },
  { id: 'a8', action: 'Copy attempt detected on book', user: 'Alex Kumar', time: '4 hours ago', type: 'security' },
  { id: 'a9', action: 'Screenshot attempt on book', user: 'Unknown', time: '5 hours ago', type: 'security' },
  { id: 'a10', action: 'Print attempt blocked', user: 'IP 192.168.1.45', time: '6 hours ago', type: 'security' },
];

const mockBooks = [
  { id: 'b1', title: 'Storytelling with Data', author: 'Cole Nussbaumer Knaflic', status: 'published', reads: 1243, subject: 'Data Analytics' },
  { id: 'b2', title: 'Python for Data Analysis', author: 'Wes McKinney', status: 'published', reads: 987, subject: 'Python' },
  { id: 'b3', title: 'Spark: The Definitive Guide', author: 'Bill Chambers', status: 'published', reads: 756, subject: 'Databricks' },
  { id: 'b4', title: 'SQL in 10 Minutes', author: 'Ben Forta', status: 'draft', reads: 0, subject: 'SQL' },
  { id: 'b5', title: 'Hands-On Machine Learning', author: 'Aurélien Géron', status: 'review', reads: 432, subject: 'Python' },
  { id: 'b6', title: 'Excel 2023 Bible', author: 'Michael Alexander', status: 'published', reads: 2105, subject: 'Excel' },
];

/* ─── Announcement interface ─── */
interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  active: boolean;
}

/* ─── Audit type helpers ─── */
const auditTypeConfig: Record<SecurityAuditEntry['type'], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  copy_attempt: { label: 'Copy Attempt', icon: Copy, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  screenshot_attempt: { label: 'Screenshot', icon: Eye, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  context_menu: { label: 'Right-Click', icon: ShieldAlert, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  print_attempt: { label: 'Print Attempt', icon: FileText, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  keyboard_shortcut: { label: 'Key Shortcut', icon: Key, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
};

/* ─── Admin User Books Management ─── */
function AdminUserBooksSection() {
  const userBooks = useProgressStore((s) => s.userBooks || []);
  const removeUserBook = useProgressStore((s) => s.removeUserBook);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return userBooks;
    const q = searchQuery.toLowerCase();
    return userBooks.filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }, [userBooks, searchQuery]);

  const totalStorage = useMemo(() => {
    return userBooks.reduce((sum, b) => sum + (b.fileSize || 0), 0);
  }, [userBooks]);

  const handleDelete = (book: UserBook) => {
    removeUserBook(book.id);
    toast.success(`"${book.title}" has been removed`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5 text-violet-500" />
          User Uploaded Books
          <Badge variant="secondary" className="text-xs">{userBooks.length}</Badge>
        </h3>
        {userBooks.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Total storage: {totalStorage > 1024 * 1024
                ? `${(totalStorage / (1024 * 1024)).toFixed(1)} MB`
                : `${(totalStorage / 1024).toFixed(0)} KB`}
            </span>
          </div>
        )}
      </div>

      {userBooks.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-3">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm">No uploaded books yet</p>
            <p className="text-xs text-muted-foreground mt-1">Users can upload books from the Books Library section.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search uploaded books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No matching books found.</p>
            ) : (
              filtered.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors"
                >
                  <div className={cn('w-10 h-14 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 overflow-hidden', book.coverColor)}>
                    {book.coverImage ? (
                      <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{book.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-[10px] border-0 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">{book.difficulty}</Badge>
                      {book.fileSize > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {book.fileSize > 1024 * 1024
                            ? `${(book.fileSize / (1024 * 1024)).toFixed(1)} MB`
                            : `${(book.fileSize / 1024).toFixed(0)} KB`}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(book.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0"
                    onClick={() => handleDelete(book)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Pricing Manager ─── */
function PricingManager({ store }: { store: ReturnType<typeof useProgressStore> }) {
  const [prices, setPrices] = useState<Record<string, number>>(store.customPricing || { free: 0, pro: 9.99, team: 24.99 });
  const plans = [
    { key: 'free', label: 'Free Plan', color: 'from-emerald-500 to-teal-500', features: 'Basic access' },
    { key: 'pro', label: 'Pro Plan', color: 'from-amber-400 to-orange-500', features: 'All features unlocked' },
    { key: 'team', label: 'Team Plan', color: 'from-rose-400 to-pink-500', features: 'Team collaboration' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {plans.map((plan) => (
          <div key={plan.key} className="rounded-xl border border-border/50 p-4 space-y-3">
            <div className={`h-2 rounded-full bg-gradient-to-r ${plan.color}`} />
            <div>
              <p className="text-sm font-semibold">{plan.label}</p>
              <p className="text-xs text-muted-foreground">{plan.features}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Monthly Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={prices[plan.key] ?? 0}
                onChange={(e) => setPrices((prev) => ({ ...prev, [plan.key]: parseFloat(e.target.value) || 0 }))}
                className="h-9 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        onClick={() => {
          store.setCustomPricing(prices);
          toast.success('Pricing updated successfully');
        }}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
      >
        <Save className="w-4 h-4 mr-2" />
        Apply Pricing Changes
      </Button>
    </div>
  );
}

/* ─── Site Branding Controls ─── */
function SiteBrandingControls({ store }: { store: ReturnType<typeof useProgressStore> }) {
  const [name, setName] = useState(store.siteBranding?.name || 'DataTrack Pro');
  const [tagline, setTagline] = useState(store.siteBranding?.tagline || 'Your Data Analytics Journey');
  const [primaryColor, setPrimaryColor] = useState(store.siteBranding?.primaryColor || 'emerald');
  const colors = [
    { id: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
    { id: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { id: 'violet', label: 'Violet', class: 'bg-violet-500' },
    { id: 'rose', label: 'Rose', class: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Site Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-sm"
            placeholder="DataTrack Pro"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Tagline</Label>
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="h-9 text-sm"
            placeholder="Your Data Analytics Journey"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Primary Color</Label>
        <div className="flex items-center gap-3">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => setPrimaryColor(color.id)}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2',
                primaryColor === color.id ? 'border-foreground scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100',
                color.class
              )}
              title={color.label}
            >
              {primaryColor === color.id && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>
          ))}
          <span className="text-sm text-muted-foreground ml-1">Selected: {primaryColor}</span>
        </div>
      </div>
      <Button
        onClick={() => {
          store.setSiteBranding({ name, tagline, primaryColor });
          toast.success('Site branding saved');
        }}
        className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Branding
      </Button>
    </div>
  );
}

/* ─── Registration Controls ─── */
function RegistrationControls({ store }: { store: ReturnType<typeof useProgressStore> }) {
  const regSettings = store.registrationSettings || { open: true, emailVerification: false, autoApprove: true };

  return (
    <div className="space-y-4">
      {[
        {
          key: 'open' as const,
          label: 'Open Registration',
          desc: 'Allow new users to sign up for accounts',
          icon: UserPlus,
          defaultVal: true,
        },
        {
          key: 'emailVerification' as const,
          label: 'Email Verification Required',
          desc: 'Require email verification before users can access the platform',
          icon: Mail,
          defaultVal: false,
        },
        {
          key: 'autoApprove' as const,
          label: 'Auto-approve New Users',
          desc: 'Automatically approve new registrations without admin review',
          icon: CheckCircle2,
          defaultVal: true,
        },
      ].map((setting) => {
        const Icon = setting.icon;
        return (
          <div key={setting.key} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{setting.label}</p>
                <p className="text-[11px] text-muted-foreground">{setting.desc}</p>
              </div>
            </div>
            <Switch
              checked={regSettings[setting.key]}
              onCheckedChange={(checked) => {
                store.setRegistrationSettings({ [setting.key]: checked });
                toast.success(`${setting.label} ${checked ? 'enabled' : 'disabled'}`);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ─── Content Management Actions ─── */
function ContentManagementActions({ store }: { store: ReturnType<typeof useProgressStore> }) {
  const [showClearChat, setShowClearChat] = useState(false);
  const [showResetProgress, setShowResetProgress] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportAllData = () => {
    const state = useProgressStore.getState();
    const exportData = {
      completedTopics: state.completedTopics || [],
      streak: state.streak || 0,
      notes: state.notes || {},
      flashcards: state.flashcards || [],
      practiceScores: state.practiceScores || {},
      chatMessages: (state.chatMessages || []).length,
      projects: state.projects || [],
      customPricing: state.customPricing || {},
      siteBranding: state.siteBranding || {},
      registrationSettings: state.registrationSettings || {},
      maintenanceMode: state.maintenanceMode || false,
      disabledFeatures: state.disabledFeatures || [],
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datatrack-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.completedTopics) store.resetProgress();
        if (data.customPricing) store.setCustomPricing(data.customPricing);
        if (data.siteBranding) store.setSiteBranding(data.siteBranding);
        if (data.registrationSettings) store.setRegistrationSettings(data.registrationSettings);
        if (data.maintenanceMode !== undefined) store.setMaintenanceMode(data.maintenanceMode);
        toast.success('Data imported successfully');
      } catch {
        toast.error('Failed to parse import file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto py-3 justify-start text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20"
          onClick={() => setShowClearChat(true)}
        >
          <MessageCircle className="w-4 h-4 mr-3" />
          <div className="text-left">
            <p className="text-sm font-medium">Clear All Chat Messages</p>
            <p className="text-[10px] text-muted-foreground">Delete all messages from all chat rooms</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 justify-start text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20"
          onClick={() => setShowResetProgress(true)}
        >
          <RefreshCw className="w-4 h-4 mr-3" />
          <div className="text-left">
            <p className="text-sm font-medium">Reset All User Progress</p>
            <p className="text-[10px] text-muted-foreground">Clear topics, scores, streaks, XP</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 justify-start text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20"
          onClick={handleExportAllData}
        >
          <Download className="w-4 h-4 mr-3" />
          <div className="text-left">
            <p className="text-sm font-medium">Export All Data</p>
            <p className="text-[10px] text-muted-foreground">Download site data as JSON file</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/20"
          onClick={() => fileInputRef.current?.click()}
        >
          <Import className="w-4 h-4 mr-3" />
          <div className="text-left">
            <p className="text-sm font-medium">Import Data</p>
            <p className="text-[10px] text-muted-foreground">Upload a JSON file to restore data</p>
          </div>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportData}
          className="hidden"
        />
      </div>

      {/* Clear Chat Confirmation Dialog */}
      <Dialog open={showClearChat} onOpenChange={setShowClearChat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Chat Messages?</DialogTitle>
            <DialogDescription>This action cannot be undone. All messages across all chat rooms will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearChat(false)}>Cancel</Button>
            <Button
              className="bg-rose-500 hover:bg-rose-600 text-white"
              onClick={() => {
                store.clearChatMessages();
                setShowClearChat(false);
                toast.success('All chat messages cleared');
              }}
            >
              Clear Messages
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Progress Confirmation Dialog */}
      <Dialog open={showResetProgress} onOpenChange={setShowResetProgress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All User Progress?</DialogTitle>
            <DialogDescription>This action cannot be undone. All completed topics, quiz scores, streaks, XP, notes, flashcards, and practice scores will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetProgress(false)}>Cancel</Button>
            <Button
              className="bg-rose-500 hover:bg-rose-600 text-white"
              onClick={() => {
                store.resetAllUserProgress();
                setShowResetProgress(false);
                toast.success('All user progress has been reset');
              }}
            >
              Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Login Screen ─── */
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginAdmin } = useProgressStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginAdmin(username, password);
    if (success) {
      toast.success('Welcome back, Admin!');
      onLogin();
    } else {
      setError('Invalid username or password');
      toast.error('Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-16 h-16 text-white/20" />
            </div>
          </div>
          <CardContent className="p-8 -mt-12 relative space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl border-4 border-background mx-auto">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Admin Access</h2>
              <p className="text-sm text-muted-foreground">Enter your credentials to access the admin panel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-username">Username</Label>
                <Input
                  id="admin-username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"
              >
                <Shield className="w-4 h-4 mr-2" />
                Sign In to Admin
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              Protected admin area. Unauthorized access is monitored and logged.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ─── Promo Code Manager ─── */
function PromoCodeManager() {
  const [codes, setCodes] = useState([
    { id: 'promo1', code: 'WELCOME20', discount: '20%', type: 'percentage', uses: 156, maxUses: 500, status: 'active', expires: '2026-06-30' },
    { id: 'promo2', code: 'LAUNCH50', discount: '$50 off', type: 'fixed', uses: 89, maxUses: 200, status: 'active', expires: '2026-03-31' },
    { id: 'promo3', code: 'REFER10', discount: '10%', type: 'percentage', uses: 234, maxUses: 1000, status: 'active', expires: '2026-12-31' },
    { id: 'promo4', code: 'SUMMER25', discount: '25%', type: 'percentage', uses: 0, maxUses: 300, status: 'disabled', expires: '2026-08-31' },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newMaxUses, setNewMaxUses] = useState('100');

  const toggleCode = (id: string) => {
    setCodes(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'disabled' : 'active' } : c));
    toast.success('Promo code status toggled');
  };

  const deleteCode = (id: string) => {
    setCodes(prev => prev.filter(c => c.id !== id));
    toast.success('Promo code deleted');
  };

  const addCode = () => {
    if (!newCode.trim() || !newDiscount.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    const newPromo = {
      id: `promo-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      discount: newDiscount.trim(),
      type: newDiscount.trim().includes('$') ? 'fixed' : 'percentage',
      uses: 0,
      maxUses: parseInt(newMaxUses) || 100,
      status: 'active',
      expires: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    };
    setCodes(prev => [...prev, newPromo]);
    setNewCode('');
    setNewDiscount('');
    setNewMaxUses('100');
    setShowAddForm(false);
    toast.success('Promo code created successfully');
  };

  return (
    <div className="space-y-3">
      {!showAddForm && (
        <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Promo Code
        </Button>
      )}
      {showAddForm && (
        <div className="flex flex-wrap gap-2 items-end p-3 rounded-xl border border-border/50 bg-muted/20">
          <div className="space-y-1 flex-1 min-w-[120px]">
            <Label className="text-[10px]">Code</Label>
            <Input placeholder="e.g., SUMMER25" value={newCode} onChange={e => setNewCode(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1 min-w-[100px]">
            <Label className="text-[10px]">Discount</Label>
            <Input placeholder="e.g., 20% or $10 off" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1 min-w-[80px]">
            <Label className="text-[10px]">Max Uses</Label>
            <Input type="number" value={newMaxUses} onChange={e => setNewMaxUses(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="flex gap-1">
            <Button size="sm" className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white" onClick={addCode}>Add</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {codes.map(code => (
          <div key={code.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-sm font-bold font-mono">{code.code}</code>
                <Badge className={cn('text-[10px]', code.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>{code.status}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{code.discount} off · {code.uses}/{code.maxUses} uses · Expires {code.expires}</p>
            </div>
            <Button size="sm" variant="outline" className={cn('h-7 w-7 p-0 shrink-0', code.status === 'active' ? 'text-amber-500' : 'text-emerald-500')} onClick={() => toggleCode(code.id)}>
              {code.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 shrink-0" onClick={() => deleteCode(code.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Admin Dashboard ─── */
export default function AdminView() {
  const store = useProgressStore();
  const isAdmin = store.isAdmin || false;
  const logoutAdmin = store.logoutAdmin;
  const securityAuditLog = store.securityAuditLog || [];
  const clearSecurityAuditLog = store.clearSecurityAuditLog;
  const bookStatuses = store.bookStatuses || {};
  const completedTopics = store.completedTopics || [];
  const chatMessages = store.chatMessages || [];
  const practiceScores = store.practiceScores || {};
  const completedCertificates = store.completedCertificates || [];
  const streak = store.streak || 0;
  const quizHighScore = store.quizHighScore || 0;
  const wordScrambleHighScore = store.wordScrambleHighScore || 0;
  const typingGameBestWpm = store.typingGameBestWpm || 0;
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [newPlan, setNewPlan] = useState('pro');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showClearAuditDialog, setShowClearAuditDialog] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: 'a1', title: 'Welcome to DataTrack Pro!', message: 'We are excited to announce the launch of DataTrack Pro — your all-in-one data analytics learning platform. Explore courses, track progress, and earn certificates.', date: '2026-03-01', active: true },
    { id: 'a2', title: 'New AI Study Assistant Available', message: 'Meet DataBot, your new AI-powered study companion. Get instant help with SQL, Python, Excel, and more.', date: '2026-02-15', active: true },
    { id: 'a3', title: 'Scheduled Maintenance on March 20th', message: 'The platform will undergo scheduled maintenance from 2:00 AM to 4:00 AM UTC on March 20th, 2026. Save your work beforehand.', date: '2026-03-10', active: false },
  ]);

  // System settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [contentProtection, setContentProtection] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Payment management
  const paymentRecords = store.paymentHistory || [];

  const handleVerifyPayment = (id: string) => {
    store.verifyPayment(id);
    toast.success('Payment verified and subscription activated');
  };

  const handleRefundPayment = (id: string) => {
    store.refundPayment(id);
    toast.success('Payment refunded successfully');
  };

  const handleExportPaymentData = () => {
    const records = useProgressStore.getState().paymentHistory || [];
    const csv = [
      'ID,Plan,Amount,Status,Method,Last4,Date',
      ...records.map(r => [r.transactionId, r.plan, r.amount, r.status, r.method, r.last4, new Date(r.date).toISOString()].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-records.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Payment data exported');
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, searchQuery]);

  const filteredAuditLog = useMemo(() => {
    const log = [...securityAuditLog].reverse();
    if (auditFilter === 'all') return log;
    return log.filter(entry => entry.type === auditFilter);
  }, [securityAuditLog, auditFilter]);

  const booksReadCount = Object.values(bookStatuses).filter(s => s === 'completed').length;
  const totalTopicsCompleted = completedTopics.length + mockUsers.reduce((sum, u) => sum + u.coursesCompleted * 6, 0);
  const totalChatMessages = chatMessages.length + 847;
  const practiceCount = Object.keys(practiceScores).length;
  const practiceTotal = practiceCount > 0 ? Math.round(Object.values(practiceScores).reduce((a, b) => a + b, 0) / practiceCount) : 0;
  const certCount = completedCertificates.length;

  const subjectCompletionRates = useMemo(() => {
    return subjects.map(s => {
      const completed = s.topics.filter(t => completedTopics.includes(t.id)).length;
      return { id: s.id, title: s.title, color: s.color, gradient: s.gradient, completed, total: s.topics.length, rate: Math.round((completed / s.topics.length) * 100) };
    }).sort((a, b) => b.rate - a.rate);
  }, [completedTopics]);

  const mockMonthlyRevenue = [
    { month: 'Sep', revenue: 320 },
    { month: 'Oct', revenue: 485 },
    { month: 'Nov', revenue: 562 },
    { month: 'Dec', revenue: 610 },
    { month: 'Jan', revenue: 723 },
    { month: 'Feb', revenue: 848 },
  ];

  const stats = useMemo(() => ({
    totalUsers: users.length + 146,
    activeUsers: users.filter(u => u.status === 'active').length + 127,
    proSubscriptions: users.filter(u => u.plan === 'pro' || u.plan === 'team').length + 98,
    revenue: '$847.85',
    booksUploaded: mockBooks.filter(b => b.status === 'published').length,
    bannedUsers: users.filter(u => u.status === 'banned').length,
    securityEvents: securityAuditLog.length,
    inactiveUsers: users.filter(u => u.status === 'inactive').length,
  }), [users, securityAuditLog]);

  if (!isAdmin) {
    return <AdminLogin onLogin={() => {}} />;
  }

  const handleBanUser = (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } : u
    ));
    const user = users.find(u => u.id === userId);
    toast.success(user?.status === 'banned' ? `${user?.name} has been unbanned` : `${user?.name} has been banned`);
    setShowBanDialog(false);
    setSelectedUser(null);
  };

  const handleChangePlan = () => {
    if (!selectedUser) return;
    setUsers(prev => prev.map(u =>
      u.id === selectedUser.id ? { ...u, plan: newPlan as MockUser['plan'] } : u
    ));
    toast.success(`${selectedUser.name}'s plan changed to ${newPlan}`);
    setShowPlanDialog(false);
    setSelectedUser(null);
  };

  const handleLogout = () => {
    logoutAdmin();
    toast.success('Logged out of admin panel');
  };

  const handleClearAuditLog = () => {
    clearSecurityAuditLog();
    setShowClearAuditDialog(false);
    toast.success('Security audit log cleared');
  };

  const handleExportAuditLog = () => {
    const csvContent = [
      'ID,Type,Details,Timestamp',
      ...securityAuditLog.map(e => `${e.id},${e.type},"${e.details}",${new Date(e.timestamp).toISOString()}`)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log exported');
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    const user = users.find(u => u.id === userId);
    toast.success(`${user?.name} has been removed`);
    setShowRemoveDialog(false);
    setSelectedUser(null);
    setExpandedUser(null);
  };

  const handleSendWarning = () => {
    if (!selectedUser) return;
    toast.success(`Warning sent to ${selectedUser.name}`);
    setShowWarningDialog(false);
    setSelectedUser(null);
    setWarningMessage('');
  };

  const handleQuickBan = (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } : u
    ));
    const user = users.find(u => u.id === userId);
    toast.success(user?.status === 'banned' ? `${user?.name} has been unbanned` : `${user?.name} has been banned`);
  };

  const handleQuickPlanChange = (userId: string, plan: 'free' | 'pro' | 'team') => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, plan } : u
    ));
    const user = users.find(u => u.id === userId);
    toast.success(`${user?.name}'s plan changed to ${plan}`);
  };

  const handleExportUserData = () => {
    const csvContent = [
      'Name,Email,Plan,Status,Join Date,Books Read,Courses Completed',
      ...users.map(u => `${u.name},${u.email},${u.plan},${u.status},${u.joinDate},${u.booksRead},${u.coursesCompleted}`)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('User data exported');
  };

  const handleResetPasswords = () => {
    toast.success('All user passwords have been reset. Reset emails sent.');
  };

  const handleResetFailedLogins = () => {
    toast.success('All failed login attempts have been reset.');
  };

  const handleSaveAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }
    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(a =>
        a.id === editingAnnouncement.id
          ? { ...a, title: announcementTitle, message: announcementMessage }
          : a
      ));
      toast.success('Announcement updated');
    } else {
      const newAnnouncement: Announcement = {
        id: `a${Date.now()}`,
        title: announcementTitle,
        message: announcementMessage,
        date: new Date().toISOString().split('T')[0],
        active: true,
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast.success('Announcement created');
    }
    setShowAnnouncementDialog(false);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setEditingAnnouncement(null);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success('Announcement deleted');
  };

  const handleToggleAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a =>
      a.id === id ? { ...a, active: !a.active } : a
    ));
    toast.success('Announcement toggled');
  };

  const handleSendAnnouncement = (title: string, msg: string) => {
    setAnnouncementTitle(title);
    setAnnouncementMessage(msg);
    setShowAnnouncementDialog(true);
  };

  const statCards = [
    { label: 'Total Topics Completed', value: totalTopicsCompleted, icon: GraduationCap, gradient: 'from-emerald-500 to-teal-500', tab: 'analytics' },
    { label: 'Active Streaks', value: streak > 0 ? streak : mockUsers.filter(u => u.status === 'active').length, icon: Flame, gradient: 'from-orange-400 to-red-500', tab: 'analytics' },
    { label: 'Books Read', value: booksReadCount + mockUsers.reduce((s, u) => s + u.booksRead, 0), icon: BookOpen, gradient: 'from-cyan-400 to-blue-500', tab: 'content' },
    { label: 'Game High Scores', value: [quizHighScore, wordScrambleHighScore, typingGameBestWpm].filter(v => v > 0).length + 3, icon: Gamepad2, gradient: 'from-amber-400 to-orange-500', tab: 'analytics' },
    { label: 'Chat Messages', value: totalChatMessages, icon: MessageCircle, gradient: 'from-violet-400 to-purple-500', tab: 'analytics' },
    { label: 'Practice Rate', value: `${practiceTotal}%`, icon: Target, gradient: 'from-pink-400 to-rose-500', tab: 'analytics' },
    { label: 'Certificates', value: certCount + mockUsers.filter(u => u.coursesCompleted > 0).length, icon: Award, gradient: 'from-yellow-400 to-amber-500', tab: 'analytics' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, gradient: 'from-teal-500 to-cyan-500', tab: 'users' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Admin Panel</h1>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-[10px]">
                <Shield className="w-3 h-3 mr-1" />Super Admin
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Manage users, content, and site operations</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/30">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="control-center" className="rounded-lg flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Control Center
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">Content Analytics</TabsTrigger>
          <TabsTrigger value="financial" className="rounded-lg">Financial</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg">Users</TabsTrigger>
          <TabsTrigger value="content" className="rounded-lg">Content</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg flex items-center gap-1.5">
            Security
            {securityAuditLog.length > 0 && (
              <Badge className="h-4 px-1.5 text-[10px] bg-red-500 text-white border-0">{securityAuditLog.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          <TabsTrigger value="announcements" className="rounded-lg flex items-center gap-1.5">
            Announcements
            {announcements.filter(a => a.active).length > 0 && (
              <Badge className="h-4 px-1.5 text-[10px] bg-blue-500 text-white border-0">{announcements.filter(a => a.active).length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="content-mgmt" className="rounded-lg flex items-center gap-1.5">
            Content Mgmt
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg flex items-center gap-1.5">
            Payments
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-lg flex items-center gap-1.5">
            Subscriptions
            {paymentRecords.filter(r => r.status === 'pending').length > 0 && (
              <Badge className="h-4 px-1.5 text-[10px] bg-amber-500 text-white border-0">{paymentRecords.filter(r => r.status === 'pending').length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Control Center Tab */}
        <TabsContent value="control-center" className="space-y-6 mt-6">
          {/* A. Maintenance Mode Toggle */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Maintenance Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Enable Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">When enabled, a warning banner will be displayed across the site to all users.</p>
                </div>
                <Switch
                  checked={store.maintenanceMode || false}
                  onCheckedChange={(checked) => {
                    store.setMaintenanceMode(checked);
                    toast.success(checked ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
                  }}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
              {store.maintenanceMode && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50"
                >
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Maintenance mode is active
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Users will see a warning banner on every page.</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* B. Feature Toggles Grid */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ToggleRight className="w-4 h-4 text-emerald-500" />
                  Feature Toggles
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {(() => {
                    const disabledCount = (store.disabledFeatures || []).length;
                    return `${21 - disabledCount}/21 Active`;
                  })()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'ai-assistant', name: 'AI Assistant', icon: Bot, desc: 'AI-powered study companion' },
                  { id: 'notes', name: 'Notes', icon: StickyNote, desc: 'Take topic-specific notes' },
                  { id: 'flashcards', name: 'Flashcards', icon: Layers, desc: 'Create study flashcards' },
                  { id: 'games', name: 'Games', icon: Gamepad2, desc: 'Learning games & brain breaks' },
                  { id: 'chat', name: 'Chat', icon: MessageCircle, desc: 'Community chat rooms' },
                  { id: 'books', name: 'Books', icon: BookOpen, desc: 'Books library with reader' },
                  { id: 'challenge', name: 'Challenges', icon: Zap, desc: 'Daily coding challenges' },
                  { id: 'practice', name: 'Practice', icon: Target, desc: 'Practice exercises' },
                  { id: 'certificate', name: 'Certificates', icon: Award, desc: 'Earn completion certificates' },
                  { id: 'portfolio', name: 'Portfolio', icon: Briefcase, desc: 'Project showcase portfolio' },
                  { id: 'resources', name: 'Resources', icon: Video, desc: 'Video tutorials & resources' },
                  { id: 'resume', name: 'Resume Builder', icon: FileText, desc: 'Build professional resumes' },
                  { id: 'playground', name: 'Code Playground', icon: Terminal, desc: 'Write & test code snippets' },
                  { id: 'assessment', name: 'Skill Assessment', icon: BarChart2, desc: 'Evaluate your skills' },
                  { id: 'visualization', name: 'Data Viz Studio', icon: BarChart3, desc: 'Create data visualizations' },
                  { id: 'whiteboard', name: 'Whiteboard', icon: Pen, desc: 'Collaborative whiteboard' },
                  { id: 'peer-review', name: 'Peer Review', icon: MessageSquarePlus, desc: 'Review others\' work' },
                  { id: 'leaderboard', name: 'Leaderboard', icon: Trophy, desc: 'Compete with others' },
                  { id: 'notifications', name: 'Notifications', icon: Bell, desc: 'System notifications' },
                  { id: 'advanced-tools', name: 'Advanced Tools', icon: Wrench, desc: 'Developer utilities' },
                  { id: 'dashboard', name: 'Dashboard', icon: ShieldCheck, desc: 'Main dashboard view' },
                ].map((feature) => {
                  const Icon = feature.icon;
                  const isDisabled = (store.disabledFeatures || []).includes(feature.id);
                  return (
                    <motion.div
                      key={feature.id}
                      layout
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-all',
                        isDisabled
                          ? 'bg-muted/30 border-border/30 opacity-70'
                          : 'bg-card border-border/50 hover:bg-muted/20'
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                        isDisabled ? 'bg-muted' : 'bg-emerald-100 dark:bg-emerald-900/30'
                      )}>
                        <Icon className={cn('w-4 h-4', isDisabled ? 'text-muted-foreground' : 'text-emerald-600 dark:text-emerald-400')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn('text-sm font-medium truncate', isDisabled && 'text-muted-foreground')}>{feature.name}</p>
                          {isDisabled && <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">Disabled</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{feature.desc}</p>
                      </div>
                      <Switch
                        checked={!isDisabled}
                        onCheckedChange={(checked) => {
                          store.toggleFeature(feature.id);
                          toast.success(checked ? `${feature.name} enabled` : `${feature.name} disabled`);
                        }}
                        className="scale-90"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* C. Plan Pricing Management */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                Plan Pricing Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PricingManager store={store} />
            </CardContent>
          </Card>

          {/* D. Site Branding */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-violet-500" />
                Site Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SiteBrandingControls store={store} />
            </CardContent>
          </Card>

          {/* E. Registration Control */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCog className="w-4 h-4 text-cyan-500" />
                Registration Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegistrationControls store={store} />
            </CardContent>
          </Card>

          {/* F. Content Management Quick Actions */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-rose-500" />
                Content Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContentManagementActions store={store} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Subject Completion Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {subjectCompletionRates.map((subject) => (
                    <div key={subject.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate flex-1">{subject.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">{subject.completed}/{subject.total}</span>
                        <Badge className={cn(
                          'text-[10px] ml-2 border-0',
                          subject.rate >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          subject.rate >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                          subject.rate > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {subject.rate}%
                        </Badge>
                      </div>
                      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.rate}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={cn('h-full rounded-full', subject.gradient)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-500" />
                  Most Read Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {[...mockBooks].sort((a, b) => b.reads - a.reads).map((book, i) => (
                    <div key={book.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                        i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                        i === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' :
                        i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                        'bg-muted text-muted-foreground'
                      )}>
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{book.reads.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">reads</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-violet-500" />
                  Most Active Chat Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {[
                    { room: 'general', messages: 1243, members: 156, color: 'bg-emerald-500' },
                    { room: 'sql-help', messages: 892, members: 98, color: 'bg-cyan-500' },
                    { room: 'python-help', messages: 756, members: 87, color: 'bg-amber-500' },
                    { room: 'career-advice', messages: 634, members: 112, color: 'bg-rose-500' },
                    { room: 'study-group', messages: 521, members: 64, color: 'bg-violet-500' },
                    { room: 'showcase', messages: 312, members: 45, color: 'bg-orange-500' },
                  ].map((room) => (
                    <div key={room.room} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', room.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{room.room.replace('-', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{room.members} members</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{room.messages.toLocaleString()} msgs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-pink-500" />
                  Practice Exercise Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subjects.slice(0, 6).map((subject) => {
                    const score = practiceScores[subject.id];
                    const pct = score || 0;
                    return (
                      <div key={subject.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate flex-1">{subject.title}</span>
                          <span className={cn(
                            'text-xs ml-2',
                            pct > 70 ? 'text-emerald-600 dark:text-emerald-400' :
                            pct > 40 ? 'text-amber-600 dark:text-amber-400' :
                            pct > 0 ? 'text-blue-600 dark:text-blue-400' :
                            'text-muted-foreground'
                          )}>
                            {pct > 0 ? `${pct}%` : 'Not started'}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', pct > 70 ? 'bg-emerald-500' : pct > 40 ? 'bg-amber-500' : pct > 0 ? 'bg-blue-500' : 'bg-muted')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Overview Tab */}
        <TabsContent value="financial" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Monthly Revenue', value: '$847.85', icon: DollarSign, gradient: 'from-emerald-500 to-teal-500', change: '+14.3%' },
              { label: 'Annual Projection', value: '$10,174', icon: TrendingUp, gradient: 'from-amber-400 to-orange-500', change: '+22.1%' },
              { label: 'Avg. Revenue/User', value: '$5.12', icon: Users, gradient: 'from-cyan-400 to-blue-500', change: '+3.8%' },
              { label: 'Churn Rate', value: '2.1%', icon: Activity, gradient: 'from-rose-400 to-pink-500', change: '-0.4%' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 space-y-2">
                      <div className={cn('w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center', item.gradient)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-lg font-bold">{item.value}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <span className={cn('text-[10px] font-medium', item.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                          {item.change}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Monthly Revenue Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMonthlyRevenue.map((item, i) => {
                    const maxRev = Math.max(...mockMonthlyRevenue.map(m => m.revenue));
                    const pct = Math.round((item.revenue / maxRev) * 100);
                    const isLast = i === mockMonthlyRevenue.length - 1;
                    return (
                      <div key={item.month} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-8">{item.month}</span>
                        <div className="flex-1 h-7 rounded-lg bg-muted/30 overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className={cn('h-full rounded-lg flex items-center justify-end pr-2', isLast ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-emerald-500/70 to-teal-500/70')}
                          >
                            <span className={cn('text-xs font-medium', isLast ? 'text-white' : 'text-white/80')}>${item.revenue}</span>
                          </motion.div>
                        </div>
                        {isLast && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-violet-500" />
                  Subscription Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { plan: 'Free', count: 88, pct: 52, color: 'bg-slate-400', textColor: 'text-slate-600 dark:text-slate-300' },
                  { plan: 'Pro', count: 56, pct: 33, color: 'bg-amber-400', textColor: 'text-amber-600 dark:text-amber-400' },
                  { plan: 'Team', count: 24, pct: 15, color: 'bg-rose-400', textColor: 'text-rose-600 dark:text-rose-400' },
                ].map((plan) => (
                  <div key={plan.plan} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', plan.color)} />
                        <span className="font-medium">{plan.plan}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{plan.count} users</span>
                        <span className={cn('text-xs font-semibold', plan.textColor)}>{plan.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${plan.pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', plan.color)}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {plan.plan === 'Free' && '$0/month - Basic access, 3 books, limited challenges'}
                      {plan.plan === 'Pro' && '$9.99/month - Full library, AI assistant, certificates, priority support'}
                      {plan.plan === 'Team' && '$24.99/month - Everything in Pro + team dashboards, admin tools, API'}
                    </p>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total MRR</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ${(56 * 9.99 + 24 * 24.99).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-500" />
                  Revenue Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { period: 'Q1 2026', projected: '$2,100', confidence: 'High', color: 'text-emerald-600 dark:text-emerald-400' },
                    { period: 'Q2 2026', projected: '$2,800', confidence: 'High', color: 'text-emerald-600 dark:text-emerald-400' },
                    { period: 'Q3 2026', projected: '$3,500', confidence: 'Medium', color: 'text-amber-600 dark:text-amber-400' },
                    { period: 'Q4 2026', projected: '$4,200', confidence: 'Medium', color: 'text-amber-600 dark:text-amber-400' },
                  ].map((q) => (
                    <div key={q.period} className="p-3 rounded-lg bg-muted/30 text-center space-y-1">
                      <p className="text-xs text-muted-foreground">{q.period}</p>
                      <p className="text-lg font-bold">{q.projected}</p>
                      <Badge className={cn('text-[10px] border-0', q.confidence === 'High' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300')}>
                        {q.confidence}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Projected annual revenue: <strong>$12,600</strong> based on current 14.3% month-over-month growth rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Quick Actions Grid */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Button variant="outline" className="h-auto py-3 flex-col gap-2 text-xs" onClick={handleResetPasswords}>
                  <RefreshCw className="w-4 h-4 text-rose-500" />
                  Reset All Passwords
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-2 text-xs" onClick={() => setShowClearAuditDialog(true)}>
                  <Trash2 className="w-4 h-4 text-amber-500" />
                  Clear Audit Log
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-2 text-xs" onClick={handleExportUserData}>
                  <Download className="w-4 h-4 text-cyan-500" />
                  Export User Data
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-2 text-xs" onClick={() => handleSendAnnouncement('', '')}>
                  <Megaphone className="w-4 h-4 text-violet-500" />
                  Send Announcement
                </Button>
                <Button variant={maintenanceMode ? 'default' : 'outline'} className={cn('h-auto py-3 flex-col gap-2 text-xs', maintenanceMode && 'bg-rose-600 hover:bg-rose-700 text-white')} onClick={() => {
                  setMaintenanceMode(!maintenanceMode);
                  toast.success(maintenanceMode ? 'Maintenance mode disabled' : 'Maintenance mode enabled');
                }}>
                  <Wrench className="w-4 h-4" />
                  {maintenanceMode ? 'Disable' : 'Enable'} Maintenance
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-2 text-xs" onClick={handleResetFailedLogins}>
                  <AlertOctagon className="w-4 h-4 text-emerald-500" />
                  Reset Failed Logins
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-border/50 bg-card/50 cursor-pointer hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all" onClick={() => setActiveTab(stat.tab as any)}>
                    <CardContent className="p-4 text-center space-y-2">
                      <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto', stat.gradient)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Uptime', value: '99.97%', status: 'good' },
                  { label: 'Avg Response Time', value: '142ms', status: 'good' },
                  { label: 'Error Rate', value: '0.03%', status: 'good' },
                  { label: 'Active Sessions', value: '234', status: 'good' },
                  { label: 'Memory Usage', value: '62%', status: 'good' },
                  { label: 'Disk Usage', value: '41%', status: 'good' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.value}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {mockActivityLog.slice(0, 6).map(entry => (
                    <div key={entry.id} className="flex items-start gap-3 text-sm">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-1.5 shrink-0',
                        entry.type === 'security' ? 'bg-red-500' : entry.type === 'billing' ? 'bg-amber-500' : entry.type === 'achievement' ? 'bg-emerald-500' : 'bg-blue-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground/80">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">{entry.user} · {entry.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Summary */}
          {securityAuditLog.length > 0 && (
            <Card className="border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-red-700 dark:text-red-300">Security Alert</h4>
                    <p className="text-xs text-red-600/70 dark:text-red-400/70">{securityAuditLog.length} security event(s) detected. Review the Security Audit tab for details.</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 text-xs" onClick={() => setActiveTab('audit')}>
                    View Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>

          <Card className="border-border/50 bg-card/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Join Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Activity</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredUsers.map(user => (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={cn(
                            'text-xs font-medium border-0',
                            user.plan === 'pro' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                            user.plan === 'team' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
                            user.plan === 'free' && 'bg-muted text-muted-foreground',
                          )}>
                            {user.plan === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                            {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-4">
                          <Badge className={cn(
                            'text-xs font-medium border-0',
                            user.status === 'active' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                            user.status === 'banned' && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                            user.status === 'inactive' && 'bg-muted text-muted-foreground',
                          )}>
                            {user.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {user.status === 'banned' && <Ban className="w-3 h-3 mr-1" />}
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell">
                          {user.booksRead} books · {user.coursesCompleted} courses
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)} title="View Details">
                              <Eye className="w-3 h-3 mr-1" />Details
                            </Button>
                            <Select value={user.plan} onValueChange={(val) => handleQuickPlanChange(user.id, val as 'free' | 'pro' | 'team')}>
                              <SelectTrigger className="h-7 w-[90px] text-[11px]">
                                <Crown className="w-3 h-3 mr-1" />
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="pro">Pro</SelectItem>
                                <SelectItem value="team">Team</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn('h-7 text-[11px]', user.status === 'banned' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50')}
                              onClick={() => handleQuickBan(user.id)}
                              title={user.status === 'banned' ? 'Unban' : 'Ban'}
                            >
                              {user.status === 'banned' ? <><CheckCircle2 className="w-3 h-3 mr-1" />Unban</> : <><Ban className="w-3 h-3 mr-1" />Ban</>}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowWarningDialog(true);
                              }}
                              title="Send Warning"
                            >
                              <Mail className="w-3 h-3 mr-1" />Warn
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowRemoveDialog(true);
                              }}
                              title="Remove Member"
                            >
                              <UserX className="w-3 h-3 mr-1" />Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded User Details Row */}
                      <AnimatePresence>
                        {expandedUser === user.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={6} className="p-0">
                              <div className="px-4 pb-4 pt-2">
                                <div className="rounded-xl bg-muted/30 border border-border/40 p-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-xs text-muted-foreground">User ID</p>
                                      <p className="font-mono font-medium">{user.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Email</p>
                                      <p className="font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Join Date</p>
                                      <p className="font-medium">{user.joinDate}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Current Plan</p>
                                      <Badge className={cn(
                                        'text-xs border-0',
                                        user.plan === 'pro' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                                        user.plan === 'team' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
                                        user.plan === 'free' && 'bg-muted text-muted-foreground',
                                      )}>{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</Badge>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Books Read</p>
                                      <p className="font-medium">{user.booksRead}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Courses Completed</p>
                                      <p className="font-medium">{user.coursesCompleted}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Account Status</p>
                                      <Badge className={cn(
                                        'text-xs border-0',
                                        user.status === 'active' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                                        user.status === 'banned' && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                                        user.status === 'inactive' && 'bg-muted text-muted-foreground',
                                      )}>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</Badge>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Days Active</p>
                                      <p className="font-medium">{Math.floor((Date.now() - new Date(user.joinDate).getTime()) / 86400000)} days</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4 mt-6">
          {/* Books Management */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              Books Library
              <Badge variant="secondary" className="text-xs">{mockBooks.length} books</Badge>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockBooks.map(book => (
                <Card key={book.id} className="border-border/50 bg-card/50">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-sm">{book.title}</h4>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                        </div>
                        <Badge className={cn(
                          'text-[10px] font-medium border-0 shrink-0',
                          book.status === 'published' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                          book.status === 'draft' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                          book.status === 'review' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                        )}>
                          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{book.subject}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {book.reads > 0 ? `${book.reads.toLocaleString()} reads` : 'Not published'}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Settings className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-600">
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl">
              <Package className="w-4 h-4 mr-2" />
              Add New Book
            </Button>
          </div>

          <Separator />

          {/* User Uploaded Books Management */}
          <AdminUserBooksSection />

          <Separator />

          {/* Challenges Management */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Daily Challenges
              <Badge variant="secondary" className="text-xs">30 active</Badge>
            </h3>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'SQL Challenges', count: 5 },
                    { label: 'Excel Challenges', count: 5 },
                    { label: 'Python Challenges', count: 5 },
                    { label: 'General', count: 15 },
                  ].map(item => (
                    <div key={item.label} className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold">{item.count}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Audit Tab */}
        <TabsContent value="audit" className="space-y-4 mt-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={auditFilter} onValueChange={setAuditFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="copy_attempt">Copy Attempts</SelectItem>
                  <SelectItem value="screenshot_attempt">Screenshots</SelectItem>
                  <SelectItem value="context_menu">Right-Click</SelectItem>
                  <SelectItem value="print_attempt">Print Attempts</SelectItem>
                  <SelectItem value="keyboard_shortcut">Key Shortcuts</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="text-xs">
                {filteredAuditLog.length} events
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExportAuditLog} disabled={securityAuditLog.length === 0}>
                <Download className="w-3.5 h-3.5 mr-1.5" />Export CSV
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => setShowClearAuditDialog(true)} disabled={securityAuditLog.length === 0}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />Clear All
              </Button>
            </div>
          </div>

          {securityAuditLog.length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">All Clear</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  No security events have been recorded. The security audit log will automatically populate when users interact with protected content.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  Security Event Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  <AnimatePresence>
                    {filteredAuditLog.map((entry) => {
                      const config = auditTypeConfig[entry.type];
                      const Icon = config.icon;
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
                            <Icon className={cn('w-4 h-4', config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{config.label}</p>
                              <Badge variant="secondary" className="text-[10px]">{entry.type.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(entry.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audit Summary */}
          {securityAuditLog.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(auditTypeConfig).map(([type, config]) => {
                const count = securityAuditLog.filter(e => e.type === type).length;
                if (count === 0) return null;
                const Icon = config.icon;
                return (
                  <Card key={type} className="border-border/50 bg-card/50">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
                        <Icon className={cn('w-4 h-4', config.color)} />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-[10px] text-muted-foreground">{config.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* General Settings */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-500" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Temporarily disable access for all users</p>
                  </div>
                  <Switch checked={maintenanceMode} onCheckedChange={(checked) => {
                    setMaintenanceMode(checked);
                    toast.success(checked ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
                  }} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Open Registration</p>
                    <p className="text-xs text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Switch checked={registrationOpen} onCheckedChange={(checked) => {
                    setRegistrationOpen(checked);
                    toast.success(checked ? 'Registration opened' : 'Registration closed');
                  }} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Send email alerts to users</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={(checked) => {
                    setEmailNotifications(checked);
                    toast.success(checked ? 'Email notifications enabled' : 'Email notifications disabled');
                  }} />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Rate Limiting</p>
                    <p className="text-xs text-muted-foreground">Limit API requests per user</p>
                  </div>
                  <Switch checked={rateLimitEnabled} onCheckedChange={(checked) => {
                    setRateLimitEnabled(checked);
                    toast.success(checked ? 'Rate limiting enabled' : 'Rate limiting disabled');
                  }} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Two-Factor Auth (Admin)</p>
                    <p className="text-xs text-muted-foreground">Require 2FA for admin login</p>
                  </div>
                  <Switch checked={twoFactorRequired} onCheckedChange={(checked) => {
                    setTwoFactorRequired(checked);
                    toast.success(checked ? '2FA required for admin' : '2FA optional for admin');
                  }} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Content Protection</p>
                    <p className="text-xs text-muted-foreground">DRM & watermark on book content</p>
                  </div>
                  <Switch checked={contentProtection} onCheckedChange={(checked) => {
                    setContentProtection(checked);
                    toast.success(checked ? 'Content protection enabled' : 'Content protection disabled');
                  }} />
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-500" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Server, label: 'Platform', value: 'Next.js 15 + Vercel' },
                  { icon: Database, label: 'Database', value: 'SQLite (Prisma ORM)' },
                  { icon: Globe, label: 'Environment', value: 'Production' },
                  { icon: Monitor, label: 'Region', value: 'US East (Virginia)' },
                  { icon: Wifi, label: 'SSL/TLS', value: 'Active (256-bit)' },
                  { icon: Zap, label: 'CDN', value: 'Cloudflare Edge' },
                  { icon: RefreshCw, label: 'Last Deploy', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="w-3.5 h-3.5" />
                        {item.label}
                      </div>
                      <span className="font-medium text-xs">{item.value}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-500" />
                  Analytics & Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Usage Analytics</p>
                    <p className="text-xs text-muted-foreground">Track feature usage patterns</p>
                  </div>
                  <Switch checked={analyticsEnabled} onCheckedChange={(checked) => {
                    setAnalyticsEnabled(checked);
                    toast.success(checked ? 'Analytics enabled' : 'Analytics disabled');
                  }} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Quick Stats</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Avg. Session', value: '24 min' },
                      { label: 'Bounce Rate', value: '18%' },
                      { label: 'DAU', value: '142' },
                      { label: 'Retention (7d)', value: '64%' },
                    ].map(stat => (
                      <div key={stat.label} className="p-2 rounded-lg bg-muted/30 text-center">
                        <p className="text-sm font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-violet-500" />
                Announcements
                <Badge variant="secondary" className="text-xs">{announcements.length} total</Badge>
              </h3>
              <p className="text-sm text-muted-foreground">Create and manage platform-wide announcements</p>
            </div>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl" onClick={() => {
              setEditingAnnouncement(null);
              setAnnouncementTitle('');
              setAnnouncementMessage('');
              setShowAnnouncementDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </div>

          {announcements.length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-8 h-8 text-violet-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">Create your first announcement to keep users informed about important updates and events.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {announcements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={cn('border-border/50 bg-card/50', !announcement.active && 'opacity-60')}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                          announcement.active ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-muted'
                        )}>
                          <Megaphone className={cn('w-5 h-5', announcement.active ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{announcement.title}</h4>
                            <Badge className={cn(
                              'text-[10px] border-0',
                              announcement.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-muted text-muted-foreground'
                            )}>
                              {announcement.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {announcement.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => handleToggleAnnouncement(announcement.id)} title={announcement.active ? 'Deactivate' : 'Activate'}>
                            <ToggleLeft className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => {
                            setEditingAnnouncement(announcement);
                            setAnnouncementTitle(announcement.title);
                            setAnnouncementMessage(announcement.message);
                            setShowAnnouncementDialog(true);
                          }}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-[11px] text-red-600 hover:bg-red-50" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

          {/* Subscriptions Management Tab */}
          <TabsContent value="subscriptions" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Subscription Management
              </h3>
              <p className="text-sm text-muted-foreground">Verify, refund, and manage all payment records</p>
            </div>
            <Button onClick={handleExportPaymentData} variant="outline" size="sm" className="gap-1.5">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4 border border-border/50 bg-card/50">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold text-emerald-600">${paymentRecords.filter(r => r.status === 'verified').reduce((s, r) => s + r.amount, 0).toFixed(2)}</p>
            </Card>
            <Card className="p-4 border border-border/50 bg-card/50">
              <p className="text-xs text-muted-foreground">Active Subs</p>
              <p className="text-lg font-bold">{paymentRecords.filter(r => r.status === 'verified' && r.plan !== 'free').length}</p>
            </Card>
            <Card className="p-4 border border-border/50 bg-card/50">
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="text-lg font-bold text-red-500">{paymentRecords.filter(r => r.status === 'failed').length}</p>
            </Card>
            <Card className="p-4 border border-border/50 bg-card/50">
              <p className="text-xs text-muted-foreground">Refunds</p>
              <p className="text-lg font-bold">{paymentRecords.filter(r => r.status === 'refunded').length}</p>
            </Card>
          </div>

          {/* Payment Records */}
          <Card className="border border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Payment Records
                <Badge variant="secondary" className="ml-auto text-xs">{paymentRecords.length} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {paymentRecords.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">No payment records yet</p>
                  <p className="text-xs text-muted-foreground">Records appear here when users make payments</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 text-[11px] font-semibold text-muted-foreground pb-2 border-b border-border/30">
                    <span>Plan</span>
                    <span>Amount</span>
                    <span>Status</span>
                    <span>Date</span>
                    <span>Actions</span>
                  </div>
                  {paymentRecords.map((record) => (
                    <div key={record.id} className="grid grid-cols-5 gap-2 text-xs py-2 border-b border-border/20 items-center">
                      <Badge variant="outline" className="text-[10px] capitalize w-fit">{record.plan}</Badge>
                      <span className="font-medium">${record.amount.toFixed(2)}</span>
                      <Badge className={cn(
                        'text-[10px] border-0 w-fit',
                        record.status === 'verified' && 'bg-emerald-100 text-emerald-700',
                        record.status === 'pending' && 'bg-amber-100 text-amber-700',
                        record.status === 'failed' && 'bg-red-100 text-red-700',
                        record.status === 'refunded' && 'bg-slate-100 text-slate-600',
                      )}>{record.status}</Badge>
                      <span className="text-muted-foreground">{new Date(record.date).toLocaleDateString()}</span>
                      <div className="flex gap-1">
                        {record.status === 'pending' && (
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleVerifyPayment(record.id)}>
                            Verify
                          </Button>
                        )}
                        {record.status === 'verified' && (
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-rose-600 hover:bg-rose-50"
                            onClick={() => handleRefundPayment(record.id)}>
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <Card className="border border-border/50 bg-card/50">
            <CardContent className="p-4 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                  paymentRecords.filter(r => r.status === 'pending').forEach(r => store.verifyPayment(r.id));
                  toast.success('All pending payments verified');
                }}>
                  <CheckCircle2 className="w-4 h-4" /> Verify All Pending
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                  toast.success('Subscription renewal reminders sent to all users');
                }}>
                  <Bell className="w-4 h-4" /> Send Renewal Reminders
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportPaymentData}>
                  <Download className="w-4 h-4" /> Export All Records
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                  toast.success('Monthly revenue report generated');
                }}>
                  <BarChart3 className="w-4 h-4" /> Revenue Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Plan for {selectedUser?.name}</DialogTitle>
            <DialogDescription className="sr-only">Select a new subscription plan for this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Plan</Label>
              <p className="text-sm font-medium capitalize">{selectedUser?.plan}</p>
            </div>
            <div className="space-y-2">
              <Label>New Plan</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>Cancel</Button>
            <Button onClick={handleChangePlan} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban/Unban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.status === 'banned' ? 'Unban User' : 'Ban User'}
            </DialogTitle>
            <DialogDescription className="sr-only">Confirm banning or unbanning this user from the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Are you sure you want to {selectedUser?.status === 'banned' ? 'unban' : 'ban'}{' '}
              <strong>{selectedUser?.name}</strong>?
            </p>
            {selectedUser?.status !== 'banned' && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                This user will lose access to all features immediately.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>Cancel</Button>
            <Button
              variant={selectedUser?.status === 'banned' ? 'default' : 'destructive'}
              onClick={() => selectedUser && handleBanUser(selectedUser.id)}
            >
              {selectedUser?.status === 'banned' ? 'Unban User' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Audit Log Dialog */}
      <Dialog open={showClearAuditDialog} onOpenChange={setShowClearAuditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Clear Security Audit Log
            </DialogTitle>
            <DialogDescription className="sr-only">Permanently delete all security audit log entries.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Are you sure you want to permanently clear all {securityAuditLog.length} security audit entries?
              This action cannot be undone.
            </p>
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3 text-xs text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              All security event history will be permanently deleted.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearAuditDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleClearAuditLog}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove User Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Remove Member
            </DialogTitle>
            <DialogDescription className="sr-only">Confirm removing this user from the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Are you sure you want to permanently remove <strong>{selectedUser?.name}</strong> ({selectedUser?.email}) from the platform?
            </p>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              This action is irreversible. All user data, progress, and certificates will be permanently deleted.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedUser && handleRemoveUser(selectedUser.id)}>
              <UserX className="w-4 h-4 mr-2" />
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Send Warning to {selectedUser?.name}
            </DialogTitle>
            <DialogDescription className="sr-only">Send a warning notification to this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Warning Message</Label>
              <Input
                placeholder="Enter warning message..."
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">This warning will be sent to {selectedUser?.email} and recorded in their account history.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarningDialog(false)}>Cancel</Button>
            <Button onClick={handleSendWarning} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Send className="w-4 h-4 mr-2" />
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Announcement Dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-violet-500" />
              {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </DialogTitle>
            <DialogDescription className="sr-only">Create or edit a platform announcement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Announcement Title</Label>
              <Input
                placeholder="Enter announcement title..."
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Enter announcement message..."
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnnouncementDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAnnouncement} className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white">
              <Send className="w-4 h-4 mr-2" />
              {editingAnnouncement ? 'Update' : 'Publish'} Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
