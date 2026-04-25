import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Plus, FolderKanban, CheckSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Button } from '../components/ui/Button';
import { StatusBadge, PriorityDot, StatusDot, STATUS_COLORS } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { ApiResponse, PageResponse, TaskBasicDTO, ProjectBasicDTO } from '../types';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function useMyTasks(userId: number | undefined) {
  return useQuery({
    queryKey: ['tasks', 'assignee', userId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<TaskBasicDTO>>>(
        `/tasks/assignee/${userId}?page=0&size=20`,
      );
      return res.data.data;
    },
    enabled: !!userId,
  });
}

function useProjects() {
  return useQuery({
    queryKey: ['projects', 'dashboard'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<ProjectBasicDTO>>>(
        '/projects?page=0&size=6',
      );
      return res.data.data;
    },
  });
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const { data: tasksPage, isLoading: tasksLoading } = useMyTasks(user?.id);
  const { data: projectsPage, isLoading: projectsLoading } = useProjects();

  const tasks = tasksPage?.content ?? [];
  const projects = projectsPage?.content ?? [];

  const activeTasks = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW');
  const highPriority = tasks.filter((t) => t.priority === 'HIGH' || t.priority === 'URGENT');
  const completed = tasks.filter((t) => t.status === 'DONE');
  const totalProjects = projectsPage?.totalElements ?? 0;

  const pendingCount = activeTasks.length;
  const todayStr = format(new Date(), 'EEEE, MMMM d');
  const firstname = user?.firstname ?? '';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1e1e3a] flex-shrink-0">
        <div>
          <h1 className="font-extrabold text-[24px] tracking-[-0.5px]">
            {getGreeting()},{' '}
            <span style={{ color: '#a78bfa' }}>{firstname}</span>{' '}
            <span>👋</span>
          </h1>
          <p className="text-[12px] text-[#6b6b8a] mt-0.5">
            {todayStr}
            {pendingCount > 0 && (
              <> · <span className="text-[#a78bfa]">{pendingCount} task{pendingCount !== 1 ? 's' : ''} pending</span></>
            )}
            {unreadCount > 0 && (
              <> · <span className="text-[#7c3aed]">{unreadCount} notification{unreadCount !== 1 ? 's' : ''}</span></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Search size={14} />
            Search
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={14} />
            New Task
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard
            label="Total Projects"
            value={totalProjects}
            color="#7c3aed"
            icon={<FolderKanban size={16} />}
            loading={projectsLoading}
          />
          <StatCard
            label="Active Tasks"
            value={activeTasks.length}
            color="#7c3aed"
            icon={<CheckSquare size={16} />}
            loading={tasksLoading}
          />
          <StatCard
            label="High Priority"
            value={highPriority.length}
            color="#f59e0b"
            icon={<AlertTriangle size={16} />}
            loading={tasksLoading}
          />
          <StatCard
            label="Completed"
            value={completed.length}
            color="#10b981"
            icon={<CheckCircle size={16} />}
            loading={tasksLoading}
          />
        </div>

        {/* Two column */}
        <div className="grid grid-cols-2 gap-5">
          {/* My Tasks */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase text-[#6b6b8a] tracking-[0.08em]">
                My Tasks
              </span>
              <Link
                to="/tasks"
                className="text-[11px] text-[#7c3aed] hover:text-[#a78bfa] transition-colors"
              >
                View all →
              </Link>
            </div>

            {tasksLoading ? (
              <SkeletonList rows={4} />
            ) : tasks.length === 0 ? (
              <EmptyState message="No tasks assigned to you yet" />
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.slice(0, 6).map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>

          {/* Recent Projects */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase text-[#6b6b8a] tracking-[0.08em]">
                Recent Projects
              </span>
              <Link
                to="/projects"
                className="text-[11px] text-[#7c3aed] hover:text-[#a78bfa] transition-colors"
              >
                View all →
              </Link>
            </div>

            {projectsLoading ? (
              <SkeletonList rows={3} />
            ) : projects.length === 0 ? (
              <EmptyState message="No projects yet" />
            ) : (
              <div className="flex flex-col gap-2">
                {projects.slice(0, 5).map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  color,
  icon,
  loading,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div
      className="rounded-[12px] border border-[#1e1e3a] px-6 py-5 flex flex-col gap-2"
      style={{ background: '#0f0f20' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#6b6b8a]">{label}</span>
        <span style={{ color }} className="opacity-60">
          {icon}
        </span>
      </div>
      {loading ? (
        <div className="h-9 w-16 rounded bg-[#1e1e3a] animate-pulse" />
      ) : (
        <span
          className="font-extrabold leading-none"
          style={{ fontSize: 34, color, letterSpacing: '-1px' }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

/* ── Task Row ───────────────────────────────────────────────── */
function TaskRow({ task }: { task: TaskBasicDTO }) {
  const done = task.status === 'DONE';
  return (
    <div
      className="flex items-center gap-3 rounded-[10px] border border-[#1e1e3a] px-3.5 py-3 cursor-pointer transition-colors hover:border-[#2a2a48]"
      style={{ background: '#0f0f20' }}
    >
      <PriorityDot priority={task.priority} size={7} />
      <span
        className="flex-1 text-[12px] font-medium truncate"
        style={{
          color: done ? '#3b3b5e' : '#e8e8f0',
          textDecoration: done ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </span>
      {task.dueDate && (
        <span className="text-[10px] text-[#3b3b5e] flex-shrink-0">
          {format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}
      <StatusBadge status={task.status} />
    </div>
  );
}

/* ── Project Row ────────────────────────────────────────────── */
function ProjectRow({ project }: { project: ProjectBasicDTO }) {
  const statusColor = STATUS_COLORS[project.status] ?? '#6b6b8a';
  return (
    <Link
      to={`/projects/${project.id}/kanban`}
      className="block rounded-[10px] border border-[#1e1e3a] px-3.5 py-3 transition-all hover:border-[#2a2a48] hover:translate-y-[-1px]"
      style={{ background: '#0f0f20' }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <StatusDot status={project.status} size={7} />
        <span className="flex-1 text-[12px] font-semibold text-[#e8e8f0] truncate">
          {project.name}
        </span>
        <StatusBadge status={project.status} />
      </div>
      <ProgressBar value={0} height={3} />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-[#3b3b5e]" style={{ color: statusColor + 'aa' }}>
          {project.status.replace('_', ' ')}
        </span>
        {project.dueDate && (
          <span className="text-[10px] text-[#3b3b5e]">
            Due {format(new Date(project.dueDate), 'MMM d, yyyy')}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */
function SkeletonList({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-11 rounded-[10px] border border-[#1e1e3a] animate-pulse"
          style={{ background: '#0f0f20' }}
        />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[10px] border border-dashed border-[#1e1e3a] px-4 py-8 text-center">
      <p className="text-[12px] text-[#3b3b5e]">{message}</p>
    </div>
  );
}
