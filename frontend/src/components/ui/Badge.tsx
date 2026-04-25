import { cn } from '../../lib/cn';
import type { TaskStatus, TaskPriority, ProjectStatus } from '../../types';

const STATUS_COLORS: Record<ProjectStatus | TaskStatus, string> = {
  PLANNING: '#6b6b8a',
  IN_PROGRESS: '#7c3aed',
  ON_HOLD: '#f59e0b',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
  TODO: '#6b6b8a',
  IN_REVIEW: '#06b6d4',
  DONE: '#10b981',
  ARCHIVED: '#3b3b5e',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: '#6b6b8a',
  MEDIUM: '#06b6d4',
  HIGH: '#f59e0b',
  URGENT: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  TODO: 'Todo',
  DONE: 'Done',
  ARCHIVED: 'Archived',
  PLANNING: 'Planning',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export function Badge({ label, color = '#6b6b8a', className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-[6px] px-2 py-0.5 text-[10px] font-semibold', className)}
      style={{ background: `${color}22`, color }}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus | TaskStatus }) {
  const color = STATUS_COLORS[status] ?? '#6b6b8a';
  return <Badge label={STATUS_LABELS[status] ?? status} color={color} />;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const color = PRIORITY_COLORS[priority] ?? '#6b6b8a';
  return <Badge label={priority} color={color} />;
}

export function PriorityDot({ priority, size = 7 }: { priority: TaskPriority; size?: number }) {
  const color = PRIORITY_COLORS[priority] ?? '#6b6b8a';
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: size, height: size, background: color }}
    />
  );
}

export function StatusDot({ status, size = 8 }: { status: ProjectStatus | TaskStatus; size?: number }) {
  const color = STATUS_COLORS[status] ?? '#6b6b8a';
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: size, height: size, background: color }}
    />
  );
}

export { STATUS_COLORS, PRIORITY_COLORS };
