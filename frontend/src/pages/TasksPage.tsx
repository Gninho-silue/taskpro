import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { PriorityDot, PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { Button } from '../components/ui/Button';
import type { ApiResponse, PageResponse, TaskBasicDTO, TaskStatus } from '../types';

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
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

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
        <Button variant="primary" size="sm">
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

      {/* Task Detail Modal */}
      <AnimatePresence>
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
