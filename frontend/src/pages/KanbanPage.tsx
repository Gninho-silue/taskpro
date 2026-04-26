import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Plus, MoreVertical, MessageSquare, Paperclip,
  ArrowRight, Pencil, Trash2, AlertTriangle, X, Settings,
  ChevronLeft,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { StatusBadge, PriorityBadge, PriorityDot, StatusDot } from '../components/ui/Badge';
import { TaskDetailModal } from '../components/TaskDetailModal';
import type {
  ApiResponse, PageResponse,
  ProjectDetailDTO, TaskBasicDTO, TaskStatus, TaskPriority, TaskCreateDTO, UserBasicDTO,
} from '../types';

// ── Constants ──────────────────────────────────────────────────
const INPUT =
  'w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-[13px] text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors';

type KanbanStatus = Extract<TaskStatus, 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'>;

const COLUMNS: { status: KanbanStatus; label: string }[] = [
  { status: 'TODO',        label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'IN_REVIEW',   label: 'In Review' },
  { status: 'DONE',        label: 'Done' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'LOW',    label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH',   label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

// ── Schemas ────────────────────────────────────────────────────
const addTaskSchema = z.object({
  title:          z.string().min(3, 'At least 3 characters').max(100, 'Max 100 characters'),
  description:    z.string().max(2000).optional(),
  priority:       z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate:        z.string().optional(),
  estimatedHours: z.string().optional(),
  assigneeId:     z.string().optional(),
  status:         z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
});

const editTaskSchema = z.object({
  title:          z.string().min(3, 'At least 3 characters').max(100, 'Max 100 characters'),
  description:    z.string().max(2000).optional(),
  priority:       z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate:        z.string().optional(),
  estimatedHours: z.string().optional(),
  assigneeId:     z.string().optional(),
});

type AddTaskForm  = z.infer<typeof addTaskSchema>;
type EditTaskForm = z.infer<typeof editTaskSchema>;

// ── API helpers ────────────────────────────────────────────────
function toIso(d: string | undefined) { return d ? `${d}T00:00:00` : undefined; }
function toDateInput(iso: string | undefined | null) { return iso ? iso.slice(0, 10) : ''; }

function apiError(fallback: string) {
  return (err: unknown) => {
    const msg = (err as { response?: { data?: { message?: string } } })
      ?.response?.data?.message ?? fallback;
    toast.error(msg);
  };
}

// ── Hooks ──────────────────────────────────────────────────────
function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ProjectDetailDTO>>(`/projects/${id}`);
      return res.data.data;
    },
  });
}

function useProjectTasks(id: string) {
  return useQuery({
    queryKey: ['tasks', 'project', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<TaskBasicDTO>>>(
        `/tasks/project/${id}?page=0&size=200`,
      );
      return res.data.data;
    },
  });
}

function useCreateTask(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddTaskForm) => {
      const payload: TaskCreateDTO = {
        title:          data.title,
        description:    data.description || undefined,
        priority:       data.priority,
        status:         data.status,
        dueDate:        toIso(data.dueDate),
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
        assigneeId:     data.assigneeId    ? Number(data.assigneeId)    : undefined,
        projectId,
      };
      const res = await api.post<ApiResponse<TaskBasicDTO>>('/tasks', payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', 'project'] });
      toast.success('Task created');
    },
    onError: apiError('Failed to create task'),
  });
}

function useUpdateTask(taskId: number, projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: EditTaskForm) => {
      await api.patch(`/tasks/${taskId}`, {
        title:          data.title,
        description:    data.description || undefined,
        priority:       data.priority,
        dueDate:        toIso(data.dueDate),
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
        projectId,
      });
      if (data.assigneeId) {
        await api.put(`/tasks/${taskId}/assign?userId=${data.assigneeId}`);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', 'project'] });
      qc.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Task updated');
    },
    onError: apiError('Failed to update task'),
  });
}

function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: TaskStatus }) => {
      await api.put(`/tasks/${taskId}/status?status=${status}`);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', 'project'] }); },
    onError: apiError('Failed to move task'),
  });
}

function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', 'project'] });
      toast.success('Task deleted');
    },
    onError: apiError('Failed to delete task'),
  });
}

// ── Page ───────────────────────────────────────────────────────
export function KanbanPage() {
  const { id = '' } = useParams<{ id: string }>();

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [addStatus, setAddStatus]           = useState<KanbanStatus | null>(null);
  const [editingTask, setEditingTask]       = useState<TaskBasicDTO | null>(null);
  const [deletingTask, setDeletingTask]     = useState<TaskBasicDTO | null>(null);

  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: tasksPage, isLoading: tasksLoading } = useProjectTasks(id);
  const moveStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const tasks = tasksPage?.content ?? [];

  const tasksByStatus = useMemo(() => {
    const groups = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] } as Record<KanbanStatus, TaskBasicDTO[]>;
    for (const t of tasks) {
      if (t.status in groups) (groups as Record<string, TaskBasicDTO[]>)[t.status].push(t);
    }
    return groups;
  }, [tasks]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/projects" className="text-text-dim hover:text-text-primary transition-colors shrink-0">
            <ChevronLeft size={18} />
          </Link>
          <div className="min-w-0">
            {projectLoading ? (
              <div className="h-5 w-40 bg-border rounded animate-pulse" />
            ) : (
              <h1 className="font-extrabold text-[20px] tracking-[-0.4px] text-text-primary truncate">
                {project?.name ?? 'Project'}
              </h1>
            )}
            {project?.dueDate && (
              <p className="text-[12px] text-text-muted mt-0.5">
                Due {format(new Date(project.dueDate), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {project && <StatusBadge status={project.status} />}
          <Button variant="ghost" size="sm">
            <Settings size={14} />
            Settings
          </Button>
          <Button variant="primary" size="sm" onClick={() => setAddStatus('TODO')}>
            <Plus size={14} />
            Add Task
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-3.5 px-8 py-5" style={{ minWidth: 900 }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              tasks={tasksByStatus[col.status]}
              loading={tasksLoading}
              onAdd={() => setAddStatus(col.status)}
              onOpen={(taskId) => setSelectedTaskId(taskId)}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
              onMove={(task, status) =>
                moveStatus.mutate({ taskId: task.id, status })
              }
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedTaskId && (
          <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
        )}
        {addStatus && (
          <AddTaskModal
            projectId={Number(id)}
            defaultStatus={addStatus}
            members={project?.members ?? []}
            onClose={() => setAddStatus(null)}
          />
        )}
        {editingTask && (
          <EditTaskModal
            task={editingTask}
            projectId={Number(id)}
            members={project?.members ?? []}
            onClose={() => setEditingTask(null)}
          />
        )}
        {deletingTask && (
          <DeleteTaskModal
            task={deletingTask}
            isPending={deleteTask.isPending}
            onConfirm={() =>
              deleteTask.mutate(deletingTask.id, { onSuccess: () => setDeletingTask(null) })
            }
            onClose={() => setDeletingTask(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Kanban Column ──────────────────────────────────────────────
function KanbanColumn({
  status, label, tasks, loading, onAdd, onOpen, onEdit, onDelete, onMove,
}: {
  status:  KanbanStatus;
  label:   string;
  tasks:   TaskBasicDTO[];
  loading: boolean;
  onAdd:   () => void;
  onOpen:  (taskId: number) => void;
  onEdit:  (t: TaskBasicDTO) => void;
  onDelete:(t: TaskBasicDTO) => void;
  onMove:  (t: TaskBasicDTO, s: TaskStatus) => void;
}) {
  return (
    <div className="flex flex-col flex-1 min-w-0 min-w-[210px]">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <StatusDot status={status} size={8} />
        <span className="text-[11px] font-bold uppercase text-text-muted tracking-[0.08em] flex-1">
          {label}
        </span>
        <span className="text-[11px] font-semibold bg-border text-text-muted rounded-md px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-card rounded-[10px] border border-border animate-pulse" />
            ))
          : tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
              />
            ))}
      </div>

      {/* Add task button */}
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-text-muted text-[12px] hover:border-accent hover:text-accent transition-colors shrink-0"
      >
        <Plus size={13} />
        Add task
      </button>
    </div>
  );
}

// ── Task Card ──────────────────────────────────────────────────
function TaskCard({
  task, onOpen, onEdit, onDelete, onMove,
}: {
  task:     TaskBasicDTO;
  onOpen:   (taskId: number) => void;
  onEdit:   (t: TaskBasicDTO) => void;
  onDelete: (t: TaskBasicDTO) => void;
  onMove:   (t: TaskBasicDTO, s: TaskStatus) => void;
}) {
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

  const moveTargets = COLUMNS.filter((c) => c.status !== task.status);

  return (
    <div
      className="group bg-card rounded-[10px] border border-border p-3.5 transition-all duration-150 hover:border-border-hover hover:-translate-y-px cursor-pointer"
      onClick={() => onOpen(task.id)}
    >
      {/* Row 1: priority dot + priority badge + kebab */}
      <div className="flex items-center gap-1.5 mb-2">
        <PriorityDot priority={task.priority} size={6} />
        <div className="flex-1" />
        <PriorityBadge priority={task.priority} />

        {/* Kebab */}
        <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label="Task actions"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-0.5 rounded text-text-dim hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <MoreVertical size={13} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="absolute right-0 top-full mt-1 w-44 bg-surface rounded-xl border border-border py-1 z-20 shadow-dropdown"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
              >
                {/* Move to options */}
                {moveTargets.map((col) => (
                  <button
                    key={col.status}
                    type="button"
                    onClick={() => { setMenuOpen(false); onMove(task, col.status); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-text-primary hover:bg-border transition-colors"
                  >
                    <ArrowRight size={12} className="text-accent" />
                    Move to {col.label}
                  </button>
                ))}
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit(task); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-text-primary hover:bg-border transition-colors"
                >
                  <Pencil size={12} className="text-accent" />
                  Edit task
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete(task); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-red hover:bg-red/10 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete task
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title */}
      <p className="text-[12px] font-semibold text-text-primary leading-[1.5] mb-2.5 line-clamp-3">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 text-[10px] text-text-dim">
        <span className="flex items-center gap-1">
          <MessageSquare size={11} />0
        </span>
        <span className="flex items-center gap-1">
          <Paperclip size={11} />0
        </span>
        <div className="flex-1" />
        {task.dueDate && (
          <span>{format(new Date(task.dueDate), 'MMM d')}</span>
        )}
      </div>
    </div>
  );
}

// ── Add Task Modal ─────────────────────────────────────────────
function AddTaskModal({
  projectId, defaultStatus, members, onClose,
}: {
  projectId:     number;
  defaultStatus: KanbanStatus;
  members:       UserBasicDTO[];
  onClose:       () => void;
}) {
  const mutation = useCreateTask(projectId);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddTaskForm>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: { priority: 'MEDIUM', status: defaultStatus },
  });
  useEscClose(onClose);

  const STATUS_OPTIONS: { value: KanbanStatus; label: string }[] = [
    { value: 'TODO',        label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW',   label: 'In Review' },
    { value: 'DONE',        label: 'Done' },
  ];

  return (
    <TaskModal
      title="Add Task"
      onClose={onClose}
      onSubmit={handleSubmit((d) =>
        mutation.mutate(d, { onSuccess: () => { reset(); onClose(); } }),
      )}
      isPending={mutation.isPending}
      submitLabel="Create Task"
    >
      <Field label="Title" required error={errors.title?.message}>
        <input {...register('title')} placeholder="What needs to be done?" className={INPUT} autoFocus />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <textarea {...register('description')} placeholder="Optional details…" rows={2} className={`${INPUT} resize-none`} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Priority" error={errors.priority?.message}>
          <select {...register('priority')} className={INPUT}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Column" error={errors.status?.message}>
          <select {...register('status')} className={INPUT}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Assignee">
          <select {...register('assigneeId')} className={INPUT}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.firstname} {m.lastname}</option>
            ))}
          </select>
        </Field>
        <Field label="Est. Hours">
          <input type="number" min={0} step={0.5} {...register('estimatedHours')} placeholder="0" className={INPUT} />
        </Field>
      </div>
      <Field label="Due Date">
        <input type="date" {...register('dueDate')} className={INPUT} />
      </Field>
    </TaskModal>
  );
}

// ── Edit Task Modal ────────────────────────────────────────────
function EditTaskModal({
  task, projectId, members, onClose,
}: {
  task:      TaskBasicDTO;
  projectId: number;
  members:   UserBasicDTO[];
  onClose:   () => void;
}) {
  const mutation = useUpdateTask(task.id, projectId);
  const { register, handleSubmit, formState: { errors } } = useForm<EditTaskForm>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title:          task.title,
      description:    task.description ?? '',
      priority:       task.priority,
      dueDate:        toDateInput(task.dueDate),
      estimatedHours: task.estimatedHours > 0 ? String(task.estimatedHours) : '',
    },
  });
  useEscClose(onClose);

  return (
    <TaskModal
      title="Edit Task"
      onClose={onClose}
      onSubmit={handleSubmit((d) => mutation.mutate(d, { onSuccess: onClose }))}
      isPending={mutation.isPending}
      submitLabel="Save Changes"
    >
      <Field label="Title" required error={errors.title?.message}>
        <input {...register('title')} className={INPUT} />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <textarea {...register('description')} rows={2} className={`${INPUT} resize-none`} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Priority" error={errors.priority?.message}>
          <select {...register('priority')} className={INPUT}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Due Date">
          <input type="date" {...register('dueDate')} className={INPUT} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Reassign to">
          <select {...register('assigneeId')} className={INPUT}>
            <option value="">— keep current —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.firstname} {m.lastname}</option>
            ))}
          </select>
        </Field>
        <Field label="Est. Hours">
          <input type="number" min={0} step={0.5} {...register('estimatedHours')} placeholder="0" className={INPUT} />
        </Field>
      </div>
    </TaskModal>
  );
}

// ── Delete Task Modal ──────────────────────────────────────────
function DeleteTaskModal({
  task, isPending, onConfirm, onClose,
}: {
  task:      TaskBasicDTO;
  isPending: boolean;
  onConfirm: () => void;
  onClose:   () => void;
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
            <h2 className="text-[14px] font-extrabold text-text-primary mb-1">Delete task?</h2>
            <p className="text-[12px] text-text-muted leading-[1.6]">
              <span className="text-text-primary font-semibold line-clamp-1">{task.title}</span> will
              be permanently deleted.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" size="sm" disabled={isPending} onClick={onConfirm}>
            {isPending ? 'Deleting…' : 'Delete task'}
          </Button>
        </div>
      </motion.div>
    </Overlay>
  );
}

// ── Task Modal shell ───────────────────────────────────────────
function TaskModal({
  title, onClose, onSubmit, isPending, submitLabel, children,
}: {
  title:       string;
  onClose:     () => void;
  onSubmit:    (e: React.FormEvent) => void;
  isPending:   boolean;
  submitLabel: string;
  children:    React.ReactNode;
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

// ── Field ──────────────────────────────────────────────────────
function Field({
  label, required, error, children,
}: {
  label:    string;
  required?: boolean;
  error?:   string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">
        {label}{required && <span className="text-red ml-0.5">*</span>}
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
