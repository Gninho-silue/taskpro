import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, FolderKanban, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import type { ApiResponse, PageResponse, TeamDetailDTO } from '../types';

// ── Constants ──────────────────────────────────────────────────
const INPUT =
  'w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-[13px] text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors';

// ── Schema ─────────────────────────────────────────────────────
const teamSchema = z.object({
  name:        z.string().min(3, 'Min 3 characters').max(100),
  description: z.string().max(1000).optional(),
});
type TeamForm = z.infer<typeof teamSchema>;

// ── Data fetching ──────────────────────────────────────────────
function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<TeamDetailDTO>>>('/teams?page=0&size=100');
      return res.data.data.content;
    },
    staleTime: 30_000,
  });
}

// ── Page ───────────────────────────────────────────────────────
export function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams();
  const [showCreate, setShowCreate] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<TeamDetailDTO | null>(null);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Topbar */}
      <div className="flex items-center justify-between px-8 pt-7 pb-6">
        <div>
          <h1 className="text-[20px] font-extrabold text-text-primary tracking-[-0.3px]">
            Teams
          </h1>
          <p className="text-[12px] text-text-muted mt-0.5">
            {teams.length} team{teams.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} />
          New Team
        </Button>
      </div>

      {/* Grid */}
      <div className="px-8 pb-8">
        {isLoading ? (
          <TeamGridSkeleton />
        ) : teams.length === 0 ? (
          <EmptyState onNew={() => setShowCreate(true)} />
        ) : (
          <div className="grid grid-cols-3 gap-3.5">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onDelete={() => setDeletingTeam(team)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateTeamModal onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deletingTeam && (
          <DeleteTeamModal
            team={deletingTeam}
            onClose={() => setDeletingTeam(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Team card ──────────────────────────────────────────────────
function TeamCard({
  team,
  onDelete,
}: {
  team: TeamDetailDTO;
  onDelete: () => void;
}) {
  const initial = team.name.charAt(0).toUpperCase();
  const leaderName = team.leader
    ? `${team.leader.firstname} ${team.leader.lastname}`
    : 'No leader';

  return (
    <motion.div
      className="relative group bg-surface rounded-xl border border-border p-5 flex flex-col gap-4 transition-colors hover:border-border-hover cursor-default"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Delete button — appears on hover */}
      <button
        type="button"
        onClick={onDelete}
        className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red cursor-pointer"
        aria-label="Delete team"
      >
        <Trash2 size={13} />
      </button>

      {/* Icon + name row */}
      <div className="flex items-center gap-3.5">
        <div className="team-icon-box w-10.5 h-10.5 rounded-[10px] flex items-center justify-center shrink-0">
          <span className="text-[18px] font-extrabold text-accent-light">{initial}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-text-primary truncate">{team.name}</p>
          {team.description && (
            <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
              {team.description}
            </p>
          )}
        </div>
      </div>

      {/* Meta counts */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-[11px] text-text-dim">
          <Users size={11} />
          {team.members.length} member{team.members.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-text-dim">
          <FolderKanban size={11} />
          {team.projects.length} project{team.projects.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Leader row */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <Avatar name={leaderName} size={18} />
        <span className="text-[10px] text-text-muted">Led by {leaderName}</span>
      </div>
    </motion.div>
  );
}

// ── Create modal ───────────────────────────────────────────────
function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: TeamForm) => {
      const res = await api.post<ApiResponse<TeamDetailDTO>>('/teams', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created');
      onClose();
    },
    onError: () => toast.error('Failed to create team'),
  });

  return (
    <Overlay onClose={onClose}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-4">
        <ModalHeader title="New Team" onClose={onClose} />

        <div className="flex flex-col gap-3">
          <Field label="Name" error={errors.name?.message}>
            <input {...register('name')} placeholder="e.g. Frontend Guild" className={INPUT} autoFocus />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              placeholder="What does this team work on?"
              rows={3}
              className={`${INPUT} resize-none`}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Overlay>
  );
}

// ── Delete confirm modal ───────────────────────────────────────
function DeleteTeamModal({ team, onClose }: { team: TeamDetailDTO; onClose: () => void }) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/teams/${team.id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team deleted');
      onClose();
    },
    onError: () => toast.error('Failed to delete team'),
  });

  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Delete Team" onClose={onClose} />
      <p className="text-[13px] text-text-muted mt-3 mb-5 leading-[1.6]">
        Are you sure you want to delete <span className="text-text-primary font-semibold">{team.name}</span>?
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </Overlay>
  );
}

// ── Shared modal primitives ────────────────────────────────────
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-120 bg-surface rounded-2xl border border-border p-6 shadow-modal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-extrabold text-text-primary">{title}</h2>
      <button type="button" aria-label="Close" onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
        <X size={16} />
      </button>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red">{error}</p>}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-[13px] text-text-muted mb-4">No teams yet.</p>
      <Button variant="primary" size="sm" onClick={onNew}>
        <Plus size={14} />
        Create your first team
      </Button>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
function TeamGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-40 rounded-xl bg-surface border border-border animate-pulse" />
      ))}
    </div>
  );
}
