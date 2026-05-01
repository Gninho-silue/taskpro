import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Avatar } from './ui/Avatar';
import { PriorityBadge, StatusBadge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';
import type { ApiResponse, TaskDetailDTO, CommentBasicDTO } from '../types';

// ── Data fetching ──────────────────────────────────────────────
function useTaskDetail(taskId: number) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TaskDetailDTO>>(`/tasks/${taskId}`);
      return res.data.data;
    },
    staleTime: 0,
  });
}

function usePostComment(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post<ApiResponse<CommentBasicDTO>>(
        `/comments/tasks/${taskId}`,
        { content, taskId },
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', taskId] }),
    onError: () => toast.error('Failed to post comment'),
  });
}

// ── Modal ──────────────────────────────────────────────────────
interface Props {
  taskId:  number;
  onClose: () => void;
}

export function TaskDetailModal({ taskId, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: task, isLoading } = useTaskDetail(taskId);
  const postComment = usePostComment(taskId);
  const [commentText, setCommentText] = useState('');

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const progress =
    task && task.estimatedHours > 0
      ? Math.min(100, Math.round((task.actualHours / task.estimatedHours) * 100))
      : 0;

  function handlePost() {
    const content = commentText.trim();
    if (!content) return;
    postComment.mutate(content, {
      onSuccess: () => setCommentText(''),
    });
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Panel */}
      <motion.div
        className="relative w-full max-w-[680px] max-h-[90vh] bg-surface rounded-2xl border border-border overflow-y-auto shadow-modal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading || !task ? (
          <ModalSkeleton onClose={onClose} />
        ) : (
          <>
            {/* ── Header ── */}
            <div className="px-6 pt-[22px] pb-[18px] border-b border-border">
              {/* Badge row */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <PriorityBadge priority={task.priority} />
                <StatusBadge   status={task.status} />
                {(task.labels ?? []).map((l) => (
                  <span
                    key={l.id}
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: `${l.color}22`, color: l.color }}
                  >
                    {l.name}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h2
                className="text-[17px] font-extrabold text-text-primary pr-8"
                style={{ letterSpacing: '-0.3px' }}
              >
                {task.title}
              </h2>

              {/* Close button */}
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute top-5 right-5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="px-6 py-5 flex flex-col gap-5">
              {/* Description */}
              {task.description && (
                <p className="text-[13px] text-text-muted leading-[1.7]">
                  {task.description}
                </p>
              )}

              {/* Meta grid — 3 cols */}
              <div className="grid grid-cols-3 gap-3.5">
                <MetaBox label="Assignee">
                  {task.assignee
                    ? `${task.assignee.firstname} ${task.assignee.lastname}`
                    : 'Unassigned'}
                </MetaBox>
                <MetaBox label="Due Date">
                  {task.dueDate
                    ? format(new Date(task.dueDate), 'yyyy-MM-dd')
                    : '—'}
                </MetaBox>
                <MetaBox label="Est. Hours">
                  {task.actualHours}h / {task.estimatedHours}h
                </MetaBox>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">
                    Progress
                  </span>
                  <span className="text-[11px] font-semibold text-text-muted">{progress}%</span>
                </div>
                <ProgressBar value={progress} height={6} />
              </div>

              {/* Comments */}
              <div>
                <p className="text-[11px] font-bold uppercase text-text-muted tracking-[0.08em] mb-3">
                  Comments ({(task.comments ?? []).length})
                </p>

                {(task.comments ?? []).length > 0 && (
                  <div className="flex flex-col gap-3 mb-4">
                    {(task.comments ?? []).map((c) => (
                      <CommentRow key={c.id} comment={c} />
                    ))}
                  </div>
                )}

                {/* Add comment */}
                <div className="flex items-start gap-3">
                  <Avatar
                    name={user ? `${user.firstname} ${user.lastname}` : 'U'}
                    size={28}
                    className="shrink-0 mt-0.5"
                  />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="bg-card rounded-[9px] border border-border focus-within:border-accent transition-colors">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment…"
                        rows={commentText ? 3 : 1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost();
                        }}
                        className="w-full bg-transparent px-3.5 py-2.5 text-[12px] text-text-primary placeholder-text-muted outline-none resize-none"
                      />
                    </div>
                    <AnimatePresence>
                      {commentText.trim() && (
                        <motion.div
                          className="flex justify-end"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.12 }}
                        >
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={postComment.isPending}
                            onClick={handlePost}
                          >
                            <Send size={12} />
                            {postComment.isPending ? 'Posting…' : 'Post comment'}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Comment row ────────────────────────────────────────────────
function CommentRow({ comment }: { comment: CommentBasicDTO }) {
  const name = `${comment.user.firstname} ${comment.user.lastname}`;
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

  return (
    <div className="flex items-start gap-3">
      <Avatar name={name} size={28} className="shrink-0 mt-0.5" />
      <div className="flex-1 bg-card rounded-[9px] border border-border px-3.5 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-text-primary">{name}</span>
          <span className="text-[10px] text-text-muted">{timeAgo}</span>
        </div>
        <p className="text-[12px] text-text-muted leading-[1.6]">{comment.content}</p>
      </div>
    </div>
  );
}

// ── Meta box ───────────────────────────────────────────────────
function MetaBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-[9px] border border-border px-3.5 py-3">
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-1.5">
        {label}
      </p>
      <p className="text-[12px] font-semibold text-text-primary">{children}</p>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
function ModalSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="px-6 pt-[22px] pb-[18px] border-b border-border">
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-16 bg-border rounded-md animate-pulse" />
          <div className="h-5 w-20 bg-border rounded-md animate-pulse" />
        </div>
        <div className="h-6 w-3/4 bg-border rounded animate-pulse" />
        <button type="button" aria-label="Close" onClick={onClose} className="absolute top-5 right-5 text-text-muted">
          <X size={18} />
        </button>
      </div>
      <div className="px-6 py-5 flex flex-col gap-5">
        <div className="space-y-2">
          <div className="h-3.5 bg-border rounded animate-pulse" />
          <div className="h-3.5 w-5/6 bg-border rounded animate-pulse" />
          <div className="h-3.5 w-4/6 bg-border rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-3.5">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 bg-border rounded-[9px] animate-pulse" />)}
        </div>
        <div className="h-10 bg-border rounded animate-pulse" />
      </div>
    </>
  );
}
