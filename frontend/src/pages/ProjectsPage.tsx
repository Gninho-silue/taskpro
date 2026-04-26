import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Search, Plus, Folder, Users, CheckSquare, X,
  MoreVertical, Pencil, Trash2, AlertTriangle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { ApiResponse, PageResponse, ProjectBasicDTO, ProjectStatus, ProjectCreateDTO } from '../types';

const ACCENT_LINE: Record<ProjectStatus, string> = {
  PLANNING:    'accent-line-planning',
  IN_PROGRESS: 'accent-line-in-progress',
  ON_HOLD:     'accent-line-on-hold',
  COMPLETED:   'accent-line-completed',
  CANCELLED:   'accent-line-cancelled',
};

// ── Shared input class ─────────────────────────────────────────
const INPUT =
  'w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-[13px] text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors';

// ── Schemas ────────────────────────────────────────────────────
const projectSchema = z.object({
  name: z.string().min(3, 'At least 3 characters').max(100, 'Max 100 characters'),
  description: z.string().max(1000, 'Max 1000 characters').optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
});

const editProjectSchema = projectSchema.extend({
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
});

type ProjectForm = z.infer<typeof projectSchema>;
type EditProjectForm = z.infer<typeof editProjectSchema>;

// ── API helpers ────────────────────────────────────────────────
function toIso(dateStr: string | undefined) {
  return dateStr ? `${dateStr}T00:00:00` : undefined;
}

function toDateInput(isoStr: string | undefined | null) {
  if (!isoStr) return '';
  return isoStr.slice(0, 10);
}

function apiError(fallback: string) {
  return (err: unknown) => {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
    toast.error(msg);
  };
}

// ── Hooks ──────────────────────────────────────────────────────
function useProjects() {
  return useQuery({
    queryKey: ['projects', 'list'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<ProjectBasicDTO>>>(
        '/projects?page=0&size=50',
      );
      return res.data.data;
    },
  });
}

function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProjectForm) => {
      const payload: ProjectCreateDTO = {
        name: data.name,
        description: data.description || undefined,
        startDate: toIso(data.startDate),
        dueDate: toIso(data.dueDate),
      };
      const res = await api.post<ApiResponse<ProjectBasicDTO>>('/projects', payload);
      return res.data.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project created'); },
    onError: apiError('Failed to create project'),
  });
}

function useUpdateProject(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: EditProjectForm) => {
      const payload: ProjectCreateDTO = {
        name: data.name,
        description: data.description || undefined,
        startDate: toIso(data.startDate),
        dueDate: toIso(data.dueDate),
      };
      await api.patch(`/projects/${id}`, payload);
      if (data.status) {
        await api.put(`/projects/${id}/status?newStatus=${data.status}`);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project updated'); },
    onError: apiError('Failed to update project'),
  });
}

function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/projects/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project deleted'); },
    onError: apiError('Failed to delete project'),
  });
}

// ── Page ───────────────────────────────────────────────────────
export function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProjectBasicDTO | null>(null);
  const [deleting, setDeleting] = useState<ProjectBasicDTO | null>(null);

  const { data: projectsPage, isLoading } = useProjects();
  const deleteMutation = useDeleteProject();

  const projects = projectsPage?.content ?? [];
  const inProgress = projects.filter((p) => p.status === 'IN_PROGRESS');

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q),
    );
  }, [projects, search]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0">
        <div>
          <h1 className="font-extrabold text-[20px] tracking-[-0.4px] text-text-primary">
            Projects
          </h1>
          <p className="text-[12px] text-text-muted mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {inProgress.length > 0 && (
              <> · <span className="text-accent">{inProgress.length} in progress</span></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-[180px] bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
            />
          </div>
          <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} />
            New Project
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isLoading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState search={search} onNew={() => setCreating(true)} />
        ) : (
          <div className="grid grid-cols-3 gap-3.5">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => setEditing(project)}
                onDelete={() => setDeleting(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {creating && <CreateModal onClose={() => setCreating(false)} />}
        {editing && <EditModal project={editing} onClose={() => setEditing(null)} />}
        {deleting && (
          <DeleteModal
            project={deleting}
            isPending={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
            onClose={() => setDeleting(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Project Card ───────────────────────────────────────────────
function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectBasicDTO;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [menuOpen]);

  return (
    <div
      className="relative group bg-card rounded-xl border border-border overflow-hidden transition-all duration-200 hover:border-border-hover hover:-translate-y-0.5 cursor-pointer"
      onClick={() => navigate(`/projects/${project.id}/kanban`)}
    >
      {/* Accent top line */}
      <div className={`h-[3px] w-full ${ACCENT_LINE[project.status] ?? 'accent-line-planning'}`} />

      <div className="px-[22px] py-[18px] flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-1 text-[13px] font-bold text-text-primary truncate min-w-0">
            {project.name}
          </span>
          <StatusBadge status={project.status} />

          {/* Kebab menu */}
          <div ref={menuRef} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Project actions"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 rounded-md text-text-dim hover:text-text-primary hover:bg-border transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreVertical size={14} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-1 w-36 bg-surface rounded-xl border border-border py-1 z-20 shadow-dropdown"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                >
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onEdit(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-text-primary hover:bg-border transition-colors"
                  >
                    <Pencil size={13} className="text-accent" />
                    Edit project
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-red hover:bg-red/10 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete project
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description — line-clamp-2 replaces the -webkit-box inline style */}
        <p className="text-[11px] text-text-muted leading-[1.6] line-clamp-2">
          {project.description || 'No description provided.'}
        </p>

        {/* Progress */}
        <ProgressBar value={0} height={4} />

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-text-dim">
            <span className="flex items-center gap-1"><CheckSquare size={11} />— tasks</span>
            <span className="flex items-center gap-1"><Users size={11} />— members</span>
          </div>
          {project.dueDate && (
            <span className="text-[11px] text-text-dim">
              Due {format(new Date(project.dueDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create Modal ───────────────────────────────────────────────
function CreateModal({ onClose }: { onClose: () => void }) {
  const mutation = useCreateProject();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
  });
  useEscClose(onClose);

  return (
    <ProjectModal
      title="New Project"
      onClose={onClose}
      onSubmit={handleSubmit((d) => mutation.mutate(d, { onSuccess: () => { reset(); onClose(); } }))}
      isPending={mutation.isPending}
      submitLabel="Create Project"
    >
      <Field label="Project Name" required error={errors.name?.message}>
        <input {...register('name')} placeholder="e.g. Marketing Website" className={INPUT} />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <textarea {...register('description')} placeholder="What is this project about?" rows={3} className={`${INPUT} resize-none`} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start Date">
          <input type="date" {...register('startDate')} className={INPUT} />
        </Field>
        <Field label="Due Date">
          <input type="date" {...register('dueDate')} className={INPUT} />
        </Field>
      </div>
    </ProjectModal>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────
const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function EditModal({ project, onClose }: { project: ProjectBasicDTO; onClose: () => void }) {
  const mutation = useUpdateProject(project.id);
  const { register, handleSubmit, formState: { errors } } = useForm<EditProjectForm>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? '',
      startDate: toDateInput(project.startDate),
      dueDate: toDateInput(project.dueDate),
      status: project.status,
    },
  });
  useEscClose(onClose);

  return (
    <ProjectModal
      title="Edit Project"
      onClose={onClose}
      onSubmit={handleSubmit((d) => mutation.mutate(d, { onSuccess: onClose }))}
      isPending={mutation.isPending}
      submitLabel="Save Changes"
    >
      <Field label="Project Name" required error={errors.name?.message}>
        <input {...register('name')} className={INPUT} />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <textarea {...register('description')} rows={3} className={`${INPUT} resize-none`} />
      </Field>
      <Field label="Status" error={errors.status?.message}>
        <select {...register('status')} className={INPUT}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start Date">
          <input type="date" {...register('startDate')} className={INPUT} />
        </Field>
        <Field label="Due Date">
          <input type="date" {...register('dueDate')} className={INPUT} />
        </Field>
      </div>
    </ProjectModal>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────
function DeleteModal({
  project,
  isPending,
  onConfirm,
  onClose,
}: {
  project: ProjectBasicDTO;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEscClose(onClose);

  return (
    <Overlay onClose={onClose}>
      <motion.div
        className="w-full max-w-100 bg-surface rounded-2xl border border-border p-6 shadow-modal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-[10px] bg-red/[.13] flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red" />
          </div>
          <div>
            <h2 className="text-[14px] font-extrabold text-text-primary mb-1">Delete project?</h2>
            <p className="text-[12px] text-text-muted leading-[1.6]">
              <span className="text-text-primary font-semibold">{project.name}</span> and all its
              tasks will be permanently deleted. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" size="sm" disabled={isPending} onClick={onConfirm}>
            {isPending ? 'Deleting…' : 'Delete project'}
          </Button>
        </div>
      </motion.div>
    </Overlay>
  );
}

// ── Shared modal shell ─────────────────────────────────────────
function ProjectModal({
  title,
  onClose,
  onSubmit,
  isPending,
  submitLabel,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  submitLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Overlay onClose={onClose}>
      <motion.div
        className="w-full max-w-120 bg-surface rounded-2xl border border-border p-6 shadow-modal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[14px] font-extrabold text-text-primary">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {children}
          <div className="flex items-center justify-end gap-2 mt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isPending}>
              {isPending ? `${submitLabel.split(' ')[0]}ing…` : submitLabel}
            </Button>
          </div>
        </form>
      </motion.div>
    </Overlay>
  );
}

// ── Overlay ────────────────────────────────────────────────────
function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center px-4 bg-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">
        {label}
        {required && <span className="text-red ml-0.5">*</span>}
      </label>
      {children}
      {error && <span className="text-[11px] text-red">{error}</span>}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────
function useEscClose(onClose: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-3.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-44 bg-card rounded-xl border border-border animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ search, onNew }: { search: string; onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Folder size={40} className="text-text-dim mb-4" />
      <p className="text-[13px] text-text-muted mb-1">
        {search ? `No projects matching "${search}"` : 'No projects yet'}
      </p>
      {!search && (
        <button
          type="button"
          onClick={onNew}
          className="mt-3 text-[12px] text-accent hover:text-accent-light transition-colors cursor-pointer"
        >
          Create your first project →
        </button>
      )}
    </div>
  );
}
