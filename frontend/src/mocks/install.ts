import type { InternalAxiosRequestConfig } from 'axios';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import {
  mockUser, mockProjects, mockTasks, mockNotifications,
  asDTOs,
  createProject, updateProject, updateProjectStatus, deleteProject, getProjectDetail,
  createTask, updateTask, updateTaskStatus, deleteTask, getTaskDetail, addComment, assignTask,
  getTeamList, getTeamDetail, createTeam, deleteTeam,
  markNotificationRead, markAllRead, deleteNotification, clearAllNotifications,
} from './data';
import type { PageResponse, ProjectStatus, TaskStatus } from '../types';

// ── Response helpers ───────────────────────────────────────────
function wrap<T>(data: T) {
  return { code: 200, message: 'OK', timestamp: new Date().toISOString(), data };
}

function page<T>(items: T[]): PageResponse<T> {
  return {
    content: items,
    pageNumber: 0,
    size: items.length,
    totalElements: items.length,
    totalPages: 1,
    first: true,
    last: true,
  };
}



function parseBody(config: InternalAxiosRequestConfig) {
  if (!config.data) return {};
  return typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
}

function respond(config: InternalAxiosRequestConfig, data: unknown) {
  config.adapter = () =>
    Promise.resolve({
      data: wrap(data),
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: {},
    });
}

// ── Route table ────────────────────────────────────────────────
// Routes are tested in order — put more-specific patterns first.
interface Route {
  method: string;
  re:     RegExp;
  handle: (
    m:      RegExpMatchArray,
    config: InternalAxiosRequestConfig,
    params: URLSearchParams,
  ) => unknown;
}

const routes: Route[] = [
  // ── Auth / User ──────────────────────────────────────────────
  {
    method: 'GET', re: /^\/users\/me$/,
    handle: () => mockUser,
  },

  // ── Projects ─────────────────────────────────────────────────
  {
    method: 'GET', re: /^\/projects$/,
    handle: () => page([...mockProjects]),
  },
  {
    method: 'POST', re: /^\/projects$/,
    handle: (_m, config) => createProject(parseBody(config)),
  },
  {
    method: 'GET', re: /^\/projects\/(\d+)$/,
    handle: ([, id]) => getProjectDetail(Number(id)),
  },
  {
    method: 'PATCH', re: /^\/projects\/(\d+)$/,
    handle: ([, id], config) => { updateProject(Number(id), parseBody(config)); return null; },
  },
  {
    method: 'DELETE', re: /^\/projects\/(\d+)$/,
    handle: ([, id]) => { deleteProject(Number(id)); return null; },
  },
  {
    method: 'PUT', re: /^\/projects\/(\d+)\/status$/,
    handle: ([, id], _config, params) => {
      updateProjectStatus(Number(id), params.get('newStatus') as ProjectStatus);
      return null;
    },
  },
  {
    method: 'PUT', re: /^\/projects\/(\d+)\/add-member$/,
    handle: () => null,
  },
  {
    method: 'PUT', re: /^\/projects\/(\d+)\/remove-member$/,
    handle: () => null,
  },

  // ── Teams ─────────────────────────────────────────────────────
  {
    method: 'GET', re: /^\/teams$/,
    handle: () => page(getTeamList()),
  },
  {
    method: 'POST', re: /^\/teams$/,
    handle: (_m, config) => createTeam(parseBody(config)),
  },
  {
    method: 'GET', re: /^\/teams\/(\d+)$/,
    handle: ([, id]) => getTeamDetail(Number(id)),
  },
  {
    method: 'DELETE', re: /^\/teams\/(\d+)$/,
    handle: ([, id]) => { deleteTeam(Number(id)); return null; },
  },

  // ── Tasks ─────────────────────────────────────────────────────
  {
    method: 'GET', re: /^\/tasks\/assignee\/(\d+)$/,
    handle: () => page(asDTOs(mockTasks)),
  },
  {
    method: 'GET', re: /^\/tasks\/project\/(\d+)$/,
    handle: ([, id]) => page(asDTOs(mockTasks.filter((t) => t._projectId === Number(id)))),
  },
  {
    method: 'GET', re: /^\/tasks\/(\d+)$/,
    handle: ([, id]) => getTaskDetail(Number(id)),
  },
  {
    method: 'POST', re: /^\/comments\/tasks\/(\d+)$/,
    handle: ([, id], config) => {
      const body = parseBody(config);
      return addComment(Number(id), body.content ?? '');
    },
  },
  {
    method: 'POST', re: /^\/tasks$/,
    handle: (_m, config) => createTask(parseBody(config)),
  },
  {
    method: 'PATCH', re: /^\/tasks\/(\d+)$/,
    handle: ([, id], config) => { updateTask(Number(id), parseBody(config)); return null; },
  },
  {
    method: 'DELETE', re: /^\/tasks\/(\d+)$/,
    handle: ([, id]) => { deleteTask(Number(id)); return null; },
  },
  {
    method: 'PUT', re: /^\/tasks\/(\d+)\/status$/,
    handle: ([, id], _config, params) => {
      updateTaskStatus(Number(id), params.get('status') as TaskStatus);
      return null;
    },
  },
  {
    method: 'PUT', re: /^\/tasks\/(\d+)\/assign$/,
    handle: ([, id], _config, params) => {
      assignTask(Number(id), Number(params.get('userId')));
      return null;
    },
  },

  // ── Notifications ─────────────────────────────────────────────
  {
    method: 'GET', re: /^\/notifications\/count-unread$/,
    handle: () => mockNotifications.filter((n) => !n.read).length,
  },
  {
    method: 'GET', re: /^\/notifications\/recent$/,
    handle: () => page([...mockNotifications].slice(0, 10)),
  },
  {
    method: 'PUT', re: /^\/notifications\/read-all$/,
    handle: () => { markAllRead(); return null; },
  },
  {
    method: 'DELETE', re: /^\/notifications\/clear-all$/,
    handle: () => { clearAllNotifications(); return null; },
  },
  {
    method: 'GET', re: /^\/notifications$/,
    handle: () => page([...mockNotifications]),
  },
  {
    method: 'PUT', re: /^\/notifications\/(\d+)\/read$/,
    handle: ([, id]) => { markNotificationRead(Number(id)); return null; },
  },
  {
    method: 'DELETE', re: /^\/notifications\/(\d+)$/,
    handle: ([, id]) => { deleteNotification(Number(id)); return null; },
  },
  {
    method: 'GET', re: /^\/notifications\/(\d+)$/,
    handle: ([, id]) => mockNotifications.find((n) => n.id === Number(id)) ?? null,
  },
];

// ── Installer ─────────────────────────────────────────────────
export function installMocks() {
  // Seed auth store so RequireAuth guard passes immediately
  useAuthStore.getState().login('mock-jwt-token', mockUser);

  // Seed notification unread count
  const unread = mockNotifications.filter((n) => !n.read).length;
  useNotificationStore.getState().setUnreadCount(unread);

  // Intercept every axios request on `api`
  api.interceptors.request.use((config) => {
    const raw    = config.url ?? '';
    const path   = raw.split('?')[0];
    const params = new URLSearchParams(raw.split('?')[1] ?? '');
    const method = (config.method ?? 'get').toUpperCase();

    for (const route of routes) {
      if (route.method !== method) continue;
      const m = path.match(route.re);
      if (!m) continue;
      const data = route.handle(m, config, params);
      respond(config, data);
      break;
    }
    return config;
  });

  // eslint-disable-next-line no-console
  console.info('[mock] API mocks active — no backend needed');
}
