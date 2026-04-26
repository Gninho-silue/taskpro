import type {
  UserBasicDTO, ProjectBasicDTO, ProjectDetailDTO,
  TaskBasicDTO, TaskDetailDTO, NotificationBasicDTO,
  CommentBasicDTO, LabelBasicDTO, TaskAttachmentBasicDTO,
  TaskStatus, ProjectStatus,
} from '../types';

// ── Helpers ────────────────────────────────────────────────────
function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3_600_000).toISOString().slice(0, 19);
}

// ── Users ──────────────────────────────────────────────────────
export const mockUser: UserBasicDTO = {
  id: 1, firstname: 'Alex', lastname: 'Dupont', email: 'alex.dupont@taskpro.dev',
};

const MARIE: UserBasicDTO = { id: 2, firstname: 'Marie',  lastname: 'Chen',   email: 'marie.chen@taskpro.dev' };
const LUCAS: UserBasicDTO = { id: 3, firstname: 'Lucas',  lastname: 'Martin', email: 'lucas.martin@taskpro.dev' };

// ── Projects ───────────────────────────────────────────────────
export let mockProjects: ProjectBasicDTO[] = [
  { id: 1, name: 'E-Commerce Redesign', description: 'Full redesign of the storefront and checkout flow', status: 'IN_PROGRESS', startDate: '2026-03-01T00:00:00', dueDate: '2026-06-30T00:00:00' },
  { id: 2, name: 'Mobile App v2',        description: 'React Native rewrite with offline support',          status: 'PLANNING',     startDate: '2026-04-15T00:00:00', dueDate: '2026-09-01T00:00:00' },
  { id: 3, name: 'API Gateway',          description: 'Migrate to new API gateway with rate limiting',       status: 'IN_PROGRESS', startDate: '2026-02-01T00:00:00', dueDate: '2026-05-15T00:00:00' },
  { id: 4, name: 'Design System',        description: 'Build a shared component library',                    status: 'COMPLETED',    startDate: '2026-01-01T00:00:00', dueDate: '2026-03-31T00:00:00' },
  { id: 5, name: 'Data Pipeline',        description: 'ETL pipeline for analytics platform',                 status: 'ON_HOLD',      startDate: '2026-03-10T00:00:00', dueDate: '2026-07-01T00:00:00' },
  { id: 6, name: 'Security Audit',       description: 'Penetration testing and vulnerability fixes',         status: 'PLANNING',     startDate: '2026-05-01T00:00:00', dueDate: '2026-05-31T00:00:00' },
];

// ── Tasks (basic DTOs) ─────────────────────────────────────────
export let mockTasks: (TaskBasicDTO & { _projectId: number })[] = [
  { id: 1,  title: 'Design login screen mockups',       description: 'Create hi-fi mockups for the authentication flow in Figma, including login, register, and password reset screens.',       status: 'DONE',        priority: 'HIGH',   dueDate: '2026-04-20T00:00:00', estimatedHours: 8,  actualHours: 7,  _projectId: 1 },
  { id: 2,  title: 'Implement product listing page',    description: 'Build the product grid with filters, sorting, and pagination. Integrate with the catalog API.',                            status: 'IN_PROGRESS', priority: 'HIGH',   dueDate: '2026-04-28T00:00:00', estimatedHours: 16, actualHours: 10, _projectId: 1 },
  { id: 3,  title: 'Checkout flow API integration',     description: 'Connect the payment gateway and order management endpoints. Handle success, failure, and webhook callbacks.',              status: 'IN_PROGRESS', priority: 'URGENT', dueDate: '2026-04-26T00:00:00', estimatedHours: 20, actualHours: 12, _projectId: 1 },
  { id: 4,  title: 'Write unit tests for cart service', description: 'Cover edge cases for cart state management including empty cart, max quantity, discount codes, and session expiry.',      status: 'TODO',        priority: 'MEDIUM', dueDate: '2026-05-05T00:00:00', estimatedHours: 10, actualHours: 0,  _projectId: 1 },
  { id: 5,  title: 'Performance audit — Lighthouse',    description: 'Run full Lighthouse audit targeting 90+ scores across performance, accessibility, best practices, and SEO.',              status: 'TODO',        priority: 'LOW',    dueDate: '2026-05-10T00:00:00', estimatedHours: 6,  actualHours: 0,  _projectId: 1 },
  { id: 6,  title: 'Set up CI/CD pipeline',             description: 'Configure GitHub Actions for automated build, test, and deploy workflows. Add branch protection rules.',                  status: 'IN_REVIEW',   priority: 'HIGH',   dueDate: '2026-04-25T00:00:00', estimatedHours: 12, actualHours: 14, _projectId: 1 },
  { id: 7,  title: 'Accessibility audit (WCAG 2.1)',    description: 'Full WCAG 2.1 AA audit and create a prioritised remediation plan for all critical and serious violations.',                status: 'TODO',        priority: 'MEDIUM', dueDate: '2026-05-15T00:00:00', estimatedHours: 8,  actualHours: 0,  _projectId: 1 },
  { id: 8,  title: 'Mobile responsive fixes',           description: 'Fix layout issues on small viewports (320px–375px) identified in the QA report. Focus on nav and checkout pages.',       status: 'IN_REVIEW',   priority: 'HIGH',   dueDate: '2026-04-27T00:00:00', estimatedHours: 6,  actualHours: 5,  _projectId: 1 },
  { id: 9,  title: 'Design system token audit',         description: 'Review all color tokens, spacing scale, and typography definitions against the latest brand guidelines.',                  status: 'TODO',        priority: 'MEDIUM', dueDate: '2026-05-20T00:00:00', estimatedHours: 4,  actualHours: 0,  _projectId: 2 },
  { id: 10, title: 'Rate limiter implementation',       description: 'Implement sliding window rate limiter for the API gateway. Support per-user and per-IP limits with Redis backing.',       status: 'IN_PROGRESS', priority: 'URGENT', dueDate: '2026-05-01T00:00:00', estimatedHours: 12, actualHours: 6,  _projectId: 3 },
];

// ── Task extra detail (assignee, labels, comments, attachments) ─
interface TaskExtra {
  assignee:    UserBasicDTO | null;
  labels:      LabelBasicDTO[];
  comments:    CommentBasicDTO[];
  attachments: TaskAttachmentBasicDTO[];
}

let _nextCommentId = 50;

let mockTaskExtras: Record<number, TaskExtra> = {
  1: {
    assignee: mockUser,
    labels: [{ id: 1, name: 'Design', color: '#7c3aed' }],
    comments: [],
    attachments: [
      { id: 1, fileName: 'auth-mockups-v2.fig', fileType: 'application/figma', fileSize: 2_048_000 },
      { id: 2, fileName: 'flow-diagram.pdf',    fileType: 'application/pdf',   fileSize:   512_000 },
    ],
  },
  2: {
    assignee: MARIE,
    labels: [{ id: 2, name: 'Frontend', color: '#10b981' }],
    comments: [
      { id: 10, content: 'Filter sidebar is ready. Working on the sort dropdown now.',       createdAt: hoursAgo(5),  updatedAt: hoursAgo(5),  user: MARIE  },
      { id: 11, content: 'Pagination component is reusable — I moved it to shared/.',       createdAt: hoursAgo(2),  updatedAt: hoursAgo(2),  user: mockUser },
    ],
    attachments: [],
  },
  3: {
    assignee: mockUser,
    labels: [{ id: 3, name: 'Backend', color: '#f59e0b' }],
    comments: [
      { id: 20, content: 'Stripe webhook handler is done, working on PayPal next.',          createdAt: hoursAgo(8),  updatedAt: hoursAgo(8),  user: mockUser },
      { id: 21, content: 'Make sure to handle idempotency keys for all payment mutations.', createdAt: hoursAgo(6),  updatedAt: hoursAgo(6),  user: LUCAS  },
      { id: 22, content: 'Test card 4242 4242 4242 4242 is working in sandbox.',             createdAt: hoursAgo(3),  updatedAt: hoursAgo(3),  user: MARIE  },
      { id: 23, content: 'Also need to handle the 3DS flow for European cards.',             createdAt: hoursAgo(1),  updatedAt: hoursAgo(1),  user: mockUser },
      { id: 24, content: 'Added retry logic for failed webhook deliveries.',                 createdAt: hoursAgo(0.5), updatedAt: hoursAgo(0.5), user: mockUser },
    ],
    attachments: [{ id: 3, fileName: 'payment-flow.pdf', fileType: 'application/pdf', fileSize: 340_000 }],
  },
  4: {
    assignee: null,
    labels: [{ id: 4, name: 'Testing', color: '#06b6d4' }],
    comments: [
      { id: 30, content: 'Working on the payment endpoint integration. Should be ready for review by EOD.', createdAt: hoursAgo(2),  updatedAt: hoursAgo(2),  user: MARIE  },
      { id: 31, content: 'Heads up — Stripe just released a new API version. We should consider upgrading.', createdAt: hoursAgo(4),  updatedAt: hoursAgo(4),  user: LUCAS  },
    ],
    attachments: [],
  },
  5: {
    assignee: LUCAS,
    labels: [],
    comments: [],
    attachments: [],
  },
  6: {
    assignee: MARIE,
    labels: [{ id: 3, name: 'Backend', color: '#f59e0b' }],
    comments: [
      { id: 40, content: 'Pipeline is green on main. Added caching for node_modules.',       createdAt: hoursAgo(3),  updatedAt: hoursAgo(3),  user: MARIE  },
      { id: 41, content: 'Looks good! Can you also add the Docker build step?',              createdAt: hoursAgo(1),  updatedAt: hoursAgo(1),  user: mockUser },
    ],
    attachments: [
      { id: 4, fileName: 'ci-config.yml', fileType: 'text/yaml', fileSize: 4_200 },
      { id: 5, fileName: 'deploy-docs.md', fileType: 'text/markdown', fileSize: 8_100 },
      { id: 6, fileName: 'pipeline-run-log.txt', fileType: 'text/plain', fileSize: 22_000 },
    ],
  },
  7:  { assignee: null, labels: [{ id: 2, name: 'Frontend', color: '#10b981' }], comments: [], attachments: [] },
  8:  { assignee: mockUser, labels: [{ id: 2, name: 'Frontend', color: '#10b981' }], comments: [
    { id: 45, content: 'Nav bar collapses correctly on 320px now. Checkout still has an overflow.', createdAt: hoursAgo(1), updatedAt: hoursAgo(1), user: mockUser },
  ], attachments: [] },
  9:  { assignee: null, labels: [], comments: [], attachments: [] },
  10: { assignee: LUCAS, labels: [{ id: 3, name: 'Backend', color: '#f59e0b' }], comments: [
    { id: 48, content: 'Redis connection pool configured. Sliding window logic is 80% done.', createdAt: hoursAgo(3), updatedAt: hoursAgo(3), user: LUCAS },
  ], attachments: [] },
};

// ── Notifications ──────────────────────────────────────────────
export let mockNotifications: NotificationBasicDTO[] = [
  { id: 1, message: "Marie Chen commented on 'Checkout flow API integration'",   type: 'TASK_COMMENTED',     read: false, sentAt: hoursAgo(1.5) },
  { id: 2, message: "You've been assigned to 'Mobile responsive fixes'",          type: 'TASK_ASSIGNED',      read: false, sentAt: hoursAgo(2.5) },
  { id: 3, message: "'Set up CI/CD pipeline' is now IN_REVIEW",                   type: 'TASK_STATUS_CHANGED', read: false, sentAt: hoursAgo(8) },
  { id: 4, message: "'Checkout flow API integration' is due tomorrow",             type: 'TASK_DUE_SOON',      read: true,  sentAt: hoursAgo(20) },
  { id: 5, message: 'Lucas Martin joined E-Commerce Redesign',                    type: 'GENERAL',            read: true,  sentAt: hoursAgo(50) },
];

// ── ID counters ────────────────────────────────────────────────
let _nextProjectId = 100;
let _nextTaskId    = 100;

// ── Helpers ────────────────────────────────────────────────────
export function asDTOs(tasks: typeof mockTasks): TaskBasicDTO[] {
  return tasks.map(({ _projectId: _p, ...t }) => t);
}

// ── Project mutations ──────────────────────────────────────────
export function createProject(body: Partial<ProjectBasicDTO>): ProjectBasicDTO {
  const project: ProjectBasicDTO = {
    id:          ++_nextProjectId,
    name:        body.name ?? 'Untitled',
    description: body.description ?? '',
    status:      (body.status as ProjectStatus) ?? 'PLANNING',
    startDate:   body.startDate ?? '',
    dueDate:     body.dueDate ?? '',
  };
  mockProjects = [...mockProjects, project];
  return project;
}

export function updateProject(id: number, body: Partial<ProjectBasicDTO>) {
  mockProjects = mockProjects.map((p) => (p.id === id ? { ...p, ...body } : p));
}

export function updateProjectStatus(id: number, status: ProjectStatus) {
  mockProjects = mockProjects.map((p) => (p.id === id ? { ...p, status } : p));
}

export function deleteProject(id: number) {
  mockProjects = mockProjects.filter((p) => p.id !== id);
  mockTasks    = mockTasks.filter((t) => t._projectId !== id);
}

export function getProjectDetail(id: number): ProjectDetailDTO | null {
  const project = mockProjects.find((p) => p.id === id);
  if (!project) return null;
  const tasks = asDTOs(mockTasks.filter((t) => t._projectId === id));
  return { ...project, owner: mockUser, team: null as never, members: [mockUser, MARIE, LUCAS], tasks, labels: [] };
}

// ── Task mutations ─────────────────────────────────────────────
export function getTaskDetail(id: number): TaskDetailDTO | null {
  const raw = mockTasks.find((t) => t.id === id);
  if (!raw) return null;
  const { _projectId, ...task } = raw;
  const extra = mockTaskExtras[id] ?? { assignee: null, labels: [], comments: [], attachments: [] };
  const project = mockProjects.find((p) => p.id === _projectId);
  return {
    ...task,
    creator:      mockUser,
    assignee:     extra.assignee as UserBasicDTO,
    parentTaskId: null as never,
    project:      project ? [project] : [],
    subtasks:     [],
    labels:       extra.labels,
    comments:     extra.comments,
    attachments:  extra.attachments,
  };
}

export function createTask(body: Partial<TaskBasicDTO> & { projectId?: number }): TaskBasicDTO {
  const id = ++_nextTaskId;
  const task = {
    id,
    title:          body.title ?? 'Untitled',
    description:    body.description ?? '',
    status:         (body.status as TaskStatus) ?? 'TODO',
    priority:       body.priority ?? 'MEDIUM',
    dueDate:        body.dueDate ?? '',
    estimatedHours: body.estimatedHours ?? 0,
    actualHours:    0,
    _projectId:     body.projectId ?? 0,
  } as TaskBasicDTO & { _projectId: number };
  mockTasks = [...mockTasks, task];
  mockTaskExtras[id] = { assignee: null, labels: [], comments: [], attachments: [] };
  const { _projectId: _p, ...dto } = task;
  return dto;
}

export function updateTask(id: number, body: Partial<TaskBasicDTO>) {
  mockTasks = mockTasks.map((t) => (t.id === id ? { ...t, ...body } : t));
}

export function updateTaskStatus(id: number, status: TaskStatus) {
  mockTasks = mockTasks.map((t) => (t.id === id ? { ...t, status } : t));
}

export function deleteTask(id: number) {
  mockTasks = mockTasks.filter((t) => t.id !== id);
  delete mockTaskExtras[id];
}

export function addComment(taskId: number, content: string): CommentBasicDTO {
  const comment: CommentBasicDTO = {
    id:        ++_nextCommentId,
    content,
    createdAt: new Date().toISOString().slice(0, 19),
    updatedAt: new Date().toISOString().slice(0, 19),
    user:      mockUser,
  };
  if (!mockTaskExtras[taskId]) {
    mockTaskExtras[taskId] = { assignee: null, labels: [], comments: [], attachments: [] };
  }
  mockTaskExtras[taskId].comments = [...mockTaskExtras[taskId].comments, comment];
  return comment;
}

// ── Notification mutations ─────────────────────────────────────
export function markNotificationRead(id: number) {
  mockNotifications = mockNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export function markAllRead() {
  mockNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
}

export function deleteNotification(id: number) {
  mockNotifications = mockNotifications.filter((n) => n.id !== id);
}

export function clearAllNotifications() {
  mockNotifications = [];
}
