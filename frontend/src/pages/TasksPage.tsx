import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { PriorityDot, PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { Button } from '../components/ui/Button';
import type { ApiResponse, PageResponse, TaskBasicDTO, TaskStatus, ProjectBasicDTO } from '../types';

const INPUT =
  'w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-[13px] text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors';

const newTaskSchema = z.object({
  projectId: z.string().min(1, 'Select a project'),
  title:     z.string().min(3, 'At least 3 characters').max(100),
  priority:  z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate:   z.string().optional(),
});
type NewTaskForm = z.infer<typeof newTaskSchema>;

// ── Types ──────────────────────────────────────────────────────
type FilterTab = 'ALL' | TaskStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL',         label: 'All'        },
  { key: 'TODO',        label: 'To Do'       },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW',   label: 'In Review'   },
  { key: 'DONE',        label: 'Done'        },
];

// ── Data fetching ──────────────────────────────────────────────
function useProjects() {
  return useQuery({
    queryKey: ['projects', 'list'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<ProjectBasicDTO>>>('/projects?page=0&size=100');
      return res.data.data.content;
    },
    staleTime: 60_000,
  });
}

function useMyTasks(userId: number) {
  return useQuery({
    queryKey: ['tasks', 'assignee', userId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<TaskBasicDTO>>>(
        `/tasks/assignee/${userId}?page=0&size=100`,
      );
      return res.data.data.content;
    },
    enabled: userId > 0,
    staleTime: 30_000,
  });
}

// ── Page ───────────────────────────────────────────────────────
export function TasksPage() {
  const user = useAuthStore((s) => s.user);
  const { data: tasks = [], isLoading } = useMyTasks(user?.id ?? 0);
  const [activeTab, setActiveTab]       = useState<FilterTab>('ALL');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showNewTask, setShowNewTask]   = useState(false);

  const filtered =
    activeTab === 'ALL' ? tasks : tasks.filter((t) => t.status === activeTab);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
      {/* Topbar */}
      <div className="flex items-center justify-between px-8 pt-7 pb-5 shrink-0">
        <div>
          <h1 className="text-[20px] font-extrabold text-text-primary tracking-[-0.3px]">
            My Tasks
          </h1>
          <p className="text-[12px] text-text-muted mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowNewTask(true)}>
          <Plus size={14} />
          New Task
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="px-8 flex items-center gap-1.5 shrink-0">
        {TABS.map((tab) => {
          const count =
            tab.key === 'ALL'
              ? tasks.length
              : tasks.filter((t) => t.status === tab.key).length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                isActive ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-[10px] font-bold rounded-full px-1.5 py-px leading-none ${
                    isActive ? 'tab-badge-active' : 'tab-badge-inactive'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-8 mt-3 h-px bg-border shrink-0" />

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        {isLoading ? (
          <TaskListSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onClick={() => setSelectedTaskId(task.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showNewTask && (
          <NewTaskModal
            userId={user?.id ?? 0}
            onClose={() => setShowNewTask(false)}
          />
        )}
        {selectedTaskId !== null && (
          <TaskDetailModal
            key={selectedTaskId}
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Task row ───────────────────────────────────────────────────
function TaskRow({ task, onClick }: { task: TaskBasicDTO; onClick: () => void }) {
  const isDone = task.status === 'DONE' || task.status === 'ARCHIVED';
  const isOverdue =
    !isDone && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3.5 rounded-[10px] px-4.5 py-3.5 bg-card border border-border transition-colors hover:border-border-hover cursor-pointer"
    >
      {/* Priority dot */}
      <PriorityDot priority={task.priority} size={8} />

      {/* Title */}
      <span
        className={[
          'flex-1 text-[13px] font-semibold truncate min-w-0',
          isDone ? 'line-through text-text-dim' : 'text-text-primary',
        ].join(' ')}
      >
        {task.title}
      </span>

      {/* Due date */}
      {task.dueDate && (
        <span
          className={`text-[11px] font-medium shrink-0 mr-1 ${
            isOverdue ? 'text-red' : 'text-text-muted'
          }`}
        >
          {format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        <PriorityBadge priority={task.priority} />
        <StatusBadge   status={task.status} />
      </div>
    </button>
  );
}

// ── Empty state ────────────────────────────────────────────────
function EmptyState({ tab }: { tab: FilterTab }) {
  const msg =
    tab === 'ALL'
      ? 'No tasks assigned to you yet.'
      : `No "${tab.replace(/_/g, ' ').toLowerCase()}" tasks found.`;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[13px] text-text-muted">{msg}</p>
    </div>
  );
}

// ── New Task Modal ─────────────────────────────────────────────
function NewTaskModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: projects = [] } = useProjects();

  const { register, handleSubmit, formState: { errors } } = useForm<NewTaskForm>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: { priority: 'MEDIUM' },
  });

  const mutation = useMutation({
    mutationFn: async (data: NewTaskForm) => {
      const res = await api.post<ApiResponse<TaskBasicDTO>>('/tasks', {
        title:      data.title,
        priority:   data.priority,
        dueDate:    data.dueDate ? `${data.dueDate}T00:00:00` : undefined,
        projectId:  Number(data.projectId),
        assigneeId: userId,
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', 'assignee', userId] });
      toast.success('Task created');
      onClose();
    },
    onError: () => toast.error('Failed to create task'),
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-[480px] bg-surface rounded-2xl border border-border p-6 shadow-modal"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[14px] font-extrabold text-text-primary">New Task</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">
              Project <span className="text-red">*</span>
            </label>
            <select {...register('projectId')} className={INPUT}>
              <option value="">— Select a project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.projectId && <p className="text-[11px] text-red">{errors.projectId.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">
              Title <span className="text-red">*</span>
            </label>
            <input {...register('title')} placeholder="What needs to be done?" className={INPUT} autoFocus />
            {errors.title && <p className="text-[11px] text-red">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">Priority</label>
              <select {...register('priority')} className={INPUT}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">Due Date</label>
              <input type="date" {...register('dueDate')} className={INPUT} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create Task'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
function TaskListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-13 rounded-[10px] bg-card border border-border animate-pulse"
        />
      ))}
    </div>
  );
}
