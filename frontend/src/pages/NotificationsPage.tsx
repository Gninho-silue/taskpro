import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, UserCheck, RefreshCw, Clock, Bell, Users, FolderKanban, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useNotificationStore } from '../store/notificationStore';
import { Button } from '../components/ui/Button';
import type { ApiResponse, PageResponse, NotificationBasicDTO, NotificationType } from '../types';

// ── Icon config per type ───────────────────────────────────────
const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; boxClass: string }> = {
  TASK_COMMENTED:      { icon: <MessageSquare size={15} />, boxClass: 'notif-icon-commented' },
  TASK_ASSIGNED:       { icon: <UserCheck     size={15} />, boxClass: 'notif-icon-assigned'  },
  TASK_STATUS_CHANGED: { icon: <RefreshCw     size={15} />, boxClass: 'notif-icon-status'    },
  TASK_DUE_SOON:       { icon: <Clock         size={15} />, boxClass: 'notif-icon-due-soon'  },
  PROJECT_INVITATION:  { icon: <FolderKanban  size={15} />, boxClass: 'notif-icon-assigned'  },
  TEAM_INVITATION:     { icon: <Users         size={15} />, boxClass: 'notif-icon-assigned'  },
  GENERAL:             { icon: <Bell          size={15} />, boxClass: 'notif-icon-general'   },
};

// ── Data fetching ──────────────────────────────────────────────
function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<NotificationBasicDTO>>>(
        '/notifications?page=0&size=50',
      );
      return res.data.data.content;
    },
    staleTime: 0,
  });
}

// ── Page ───────────────────────────────────────────────────────
export function NotificationsPage() {
  const qc = useQueryClient();
  const setUnreadCount  = useNotificationStore((s) => s.setUnreadCount);
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  const { data: notifications = [], isLoading } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      decrementUnread();
    },
    onError: () => toast.error('Failed to mark as read'),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadCount(0);
    },
    onError: () => toast.error('Failed to mark all as read'),
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      await api.delete('/notifications/clear-all');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadCount(0);
      toast.success('All notifications cleared');
    },
    onError: () => toast.error('Failed to clear notifications'),
  });

  function handleClick(n: NotificationBasicDTO) {
    if (!n.read) markRead.mutate(n.id);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Topbar */}
      <div className="flex items-center justify-between px-8 pt-7 pb-6">
        <div>
          <h1 className="text-[20px] font-extrabold text-text-primary tracking-[-0.3px]">
            Notifications
          </h1>
          <p className="text-[12px] text-text-muted mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={clearAll.isPending}
              onClick={() => clearAll.mutate()}
            >
              <Trash2 size={13} />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="px-8 pb-8 flex flex-col gap-2 max-w-[680px]">
        {isLoading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onClick={() => handleClick(n)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Notification row ───────────────────────────────────────────
function NotificationRow({
  notification: n,
  onClick,
}: {
  notification: NotificationBasicDTO;
  onClick: () => void;
}) {
  const config   = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.GENERAL;
  const timeAgo  = formatDistanceToNow(new Date(n.sentAt), { addSuffix: true });

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative w-full text-left flex items-start gap-3.5 rounded-[10px] border px-4 py-3.5 transition-colors cursor-pointer bg-card',
        n.read
          ? 'border-border hover:border-border-hover'
          : 'border-border-hover hover:border-border-active',
      ].join(' ')}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-accent" />
      )}

      {/* Icon box */}
      <div className={`${config.boxClass} w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0 mt-0.5`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12px] leading-[1.55] pr-4 ${
            n.read ? 'text-text-muted font-normal' : 'text-text-primary font-medium'
          }`}
        >
          {n.message}
        </p>
        <span className="text-[11px] text-text-dim mt-1 block">{timeAgo}</span>
      </div>
    </button>
  );
}

// ── Empty state ────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Bell size={28} className="text-text-dim mb-3" />
      <p className="text-[13px] text-text-muted">No notifications yet.</p>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
function NotificationSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-[66px] rounded-[10px] bg-card border border-border animate-pulse"
        />
      ))}
    </>
  );
}
