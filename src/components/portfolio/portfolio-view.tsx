'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Briefcase,
  Clock,
  CheckCircle2,
  Star,
  FolderKanban,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProgressStore, type Project } from '@/lib/store';
import { cn } from '@/lib/utils';

const TOOLS_LIST = [
  'Excel', 'SQL', 'Python', 'Power BI', 'Tableau', 'R',
  'Databricks', 'Spark', 'Snowflake', 'BigQuery', 'Azure',
  'AWS', 'Looker', 'Alteryx', 'SAS', 'Google Analytics',
  'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-learn',
];

const toolColors: Record<string, string> = {
  Excel: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  SQL: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  Python: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'Power BI': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  Tableau: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  R: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  Databricks: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  Spark: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
  Snowflake: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  BigQuery: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Azure: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  AWS: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  Looker: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  Alteryx: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  SAS: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-800',
  'Google Analytics': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Pandas: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  NumPy: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  Matplotlib: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  Seaborn: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  'Scikit-learn': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
};

const statusConfig: Record<Project['status'], { label: string; color: string; icon: React.ElementType }> = {
  'in-progress': { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800', icon: Clock },
  'completed': { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
  'showcase': { label: 'Showcase', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800', icon: Star },
};

interface ProjectFormData {
  name: string;
  description: string;
  tools: string[];
  status: Project['status'];
  link: string;
  date: string;
}

const emptyForm: ProjectFormData = {
  name: '',
  description: '',
  tools: [],
  status: 'in-progress',
  link: '',
  date: new Date().toISOString().split('T')[0],
};

export default function PortfolioView() {
  const { projects, addProject, updateProject, removeProject } = useProgressStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormData>(emptyForm);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (project: Project) => {
    setForm({
      name: project.name,
      description: project.description,
      tools: project.tools,
      status: project.status,
      link: project.link,
      date: project.date,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateProject(editingId, form);
    } else {
      addProject(form);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      removeProject(deleteId);
      setDeleteId(null);
    }
  };

  const toggleTool = (tool: string) => {
    setForm((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }));
  };

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'In Progress', value: projects.filter((p) => p.status === 'in-progress').length, icon: Clock, gradient: 'from-amber-400 to-orange-400' },
    { label: 'Completed', value: projects.filter((p) => p.status === 'completed').length, icon: CheckCircle2, gradient: 'from-teal-400 to-cyan-400' },
    { label: 'Showcase', value: projects.filter((p) => p.status === 'showcase').length, icon: Star, gradient: 'from-violet-400 to-purple-400' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Project Portfolio</h1>
            <p className="text-sm text-muted-foreground">Track and showcase your data analytics projects</p>
          </div>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Project
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', stat.gradient)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Projects Grid or Empty State */}
      <AnimatePresence mode="wait">
        {projects.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center mb-6">
              <FolderOpen className="w-12 h-12 text-emerald-500/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Start building your portfolio by adding your first data analytics project. Showcase your skills and track your progress!
            </p>
            <Button
              onClick={handleOpenAdd}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Project
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onEdit={handleOpenEdit}
                onDelete={setDeleteId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription className="sr-only">{editingId ? 'Edit your project details.' : 'Add a new project to your portfolio.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="e.g., Sales Dashboard Analysis"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">Description</Label>
              <Textarea
                id="project-desc"
                placeholder="Briefly describe your project..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Tools Multi-Select */}
            <div className="space-y-2">
              <Label>Tools Used</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                >
                  <span className="text-muted-foreground">
                    {form.tools.length > 0 ? `${form.tools.length} tools selected` : 'Select tools...'}
                  </span>
                </Button>
                <AnimatePresence>
                  {toolsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-50 mt-1 w-full border border-border rounded-lg bg-popover shadow-lg max-h-48 overflow-y-auto p-2"
                    >
                      {TOOLS_LIST.map((tool) => (
                        <button
                          key={tool}
                          onClick={() => toggleTool(tool)}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2',
                            form.tools.includes(tool)
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            form.tools.includes(tool) ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                          )} />
                          {tool}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {form.tools.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tools.map((tool) => (
                    <Badge
                      key={tool}
                      variant="secondary"
                      className="cursor-pointer gap-1"
                      onClick={() => toggleTool(tool)}
                    >
                      {tool}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {(['in-progress', 'completed', 'showcase'] as const).map((status) => {
                  const config = statusConfig[status];
                  const Icon = config.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => setForm((prev) => ({ ...prev, status }))}
                      className={cn(
                        'flex-1 flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all',
                        form.status === status
                          ? config.color + ' ring-2 ring-emerald-500/30'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-link">Link (optional)</Label>
              <Input
                id="project-link"
                placeholder="https://github.com/your-project"
                value={form.link}
                onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-date">Date Started</Label>
              <Input
                id="project-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              {editingId ? 'Update Project' : 'Add Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The project will be permanently removed from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  onEdit,
  onDelete,
}: {
  project: Project;
  index: number;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}) {
  const config = statusConfig[project.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 h-full">
        <CardContent className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {project.name}
              </h3>
              {project.date && (
                <p className="text-xs text-muted-foreground mt-1">
                  Started {new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
            <Badge className={cn('text-[10px] font-semibold shrink-0', config.color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {project.description}
            </p>
          )}

          {/* Tools */}
          {project.tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tools.map((tool) => (
                <Badge
                  key={tool}
                  variant="secondary"
                  className={cn('text-[10px] font-medium border', toolColors[tool] || 'bg-muted text-muted-foreground')}
                >
                  {tool}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-emerald-600"
              onClick={() => onEdit(project)}
            >
              <Pencil className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-red-600"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-muted-foreground hover:text-teal-600"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Open
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
