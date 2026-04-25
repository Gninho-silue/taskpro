# TaskPro — Frontend Development Guide

## Tech Stack

**Runtime**: React 19 + TypeScript 5.9, Vite 8  
**Styling**: TailwindCSS v4 (`@tailwindcss/vite` plugin — no `tailwind.config.js` needed)  
**State**: Zustand 5 (global), TanStack React Query 5 (server state)  
**Forms**: React Hook Form 7 + Zod 4  
**HTTP**: Axios  
**WebSocket**: `@stomp/stompjs` + `sockjs-client`  
**Routing**: React Router DOM v7  
**UI**: Lucide React (icons), Framer Motion (animation), React Hot Toast (toasts)  
**Utils**: `clsx` + `tailwind-merge`, `date-fns`

---

## Dev Commands

```bash
cd frontend
npm run dev       # starts on http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # eslint
npm run preview   # preview production build
```

---

## Backend Connection

- **Base URL**: `http://localhost:8081/api/v1`
- **Backend port**: 8081 (Spring Boot, configured in `application-dev.yml`)
- **CORS allowed origins**: `http://localhost:5173`, `http://localhost:3000`
- **Auth header**: `Authorization: Bearer <jwt_token>`
- **Token expiry**: 24 hours — no refresh endpoint, redirect to login on 401

### Axios Setup (recommended)

```ts
const api = axios.create({ baseURL: 'http://localhost:8081/api/v1' });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Standard Response Envelope

Every response is wrapped:

```ts
interface ApiResponse<T> {
  code: number;
  message: string;
  timestamp: string;
  data: T;
}
```

Extract `response.data.data` for the actual payload.

### Pagination

List endpoints return:

```ts
interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
```

Default query params: `page=0&size=10` (0-indexed).

---

## Authentication

### Register → `POST /auth/register`

```ts
interface RegisterRequest {
  firstname: string;       // required, not blank
  lastname: string;        // required, not blank
  email: string;           // required, valid email, unique
  password: string;        // required — see password rules below
  dateOfBirth?: string;    // ISO date "YYYY-MM-DD", optional
}
// 201 response: { email, message }
```

After registration, user receives an email to verify their account. **Login is blocked until verified.**

### Verify Email → `GET /auth/activate-account?token=<token>`

No auth needed. Token is sent by email and is valid for **24 hours**.

### Login → `POST /auth/login`

```ts
interface LoginRequest {
  email: string;
  password: string;
}
// 200 response: { token: string }  (tokenType: "Bearer")
```

Store the token in Zustand + localStorage.

### Password Reset

1. `POST /auth/request-password-reset?email=<email>` — sends reset link
2. `POST /auth/reset-password?token=<token>&newPassword=<password>` — applies new password

---

## Password Rules (client-side validation must match)

- 8–128 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character: `!@#$%^&*()_+-=[]{}|;':\",./<>?`
- No spaces
- No repeated characters (e.g., `aaa`, `111`)
- No sequential characters (e.g., `abc`, `123`)
- Not a common password (password, admin, qwerty, etc.)

---

## API Endpoints Reference

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | Required | Current user (UserBasicDTO) |
| GET | `/users/{id}` | Required | User detail |
| GET | `/users/by-email?email=` | Required | Find user by email |
| GET | `/users/search?query=` | Required | Search users |
| PUT | `/users/{id}` | Required | Update user profile |
| PATCH | `/users/{id}/language?language=` | Required | Change preferred language |
| PATCH | `/users/{id}/disable?disabled=` | ADMIN | Disable account |
| PATCH | `/users/{id}/lock?locked=` | ADMIN | Lock account |
| PATCH | `/users/{id}/role?newRole=` | ADMIN | Change role |

```ts
interface UserBasicDTO { id: number; firstname: string; lastname: string; email: string; }
interface UserDetailDTO extends UserBasicDTO {
  projects: ProjectBasicDTO[];
  teams: TeamBasicDTO[];
  assignedTasks: TaskBasicDTO[];
}
interface UserCreateDTO {
  email: string; firstname: string; lastname: string;
  dateOfBirth: string; password: string;
  preferredLanguage?: string; profileImage?: string;
}
```

### Projects

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/projects` | Required | Create project (201) |
| GET | `/projects` | Required | All projects (paginated) |
| GET | `/projects/{id}` | Required | Project detail |
| GET | `/projects/owner/{user-id}` | Required | Projects by owner (paginated) |
| GET | `/projects/team/{team-id}` | Required | Projects by team (paginated) |
| GET | `/projects/{project-id}/labels` | Required | Project labels |
| PATCH | `/projects/{id}` | Required | Update project |
| DELETE | `/projects/{id}` | Required | Delete project |
| PUT | `/projects/{project-id}/assign-team/{team-id}` | Required | Assign team (201) |
| PUT | `/projects/{project-id}/add-member?userId=` | Required | Add member |
| PUT | `/projects/{project-id}/remove-member?userId=` | Required | Remove member |
| PUT | `/projects/{project-id}/status?newStatus=` | Required | Change status |

```ts
type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

interface ProjectBasicDTO {
  id: number; name: string; description: string;
  status: ProjectStatus; startDate: string; dueDate: string;
}
interface ProjectDetailDTO extends ProjectBasicDTO {
  owner: UserBasicDTO; team: TeamBasicDTO;
  members: UserBasicDTO[]; tasks: TaskBasicDTO[]; labels: LabelBasicDTO[];
}
interface ProjectCreateDTO {
  name: string;           // required, 3-100 chars
  description?: string;   // max 1000 chars
  startDate?: string;     // ISO datetime
  dueDate?: string;       // ISO datetime
  teamId?: number;
}
```

### Tasks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/tasks` | Required | Create task (201) |
| GET | `/tasks/{id}` | Required | Task detail |
| GET | `/tasks/assignee/{user-id}` | Required | Tasks by assignee (paginated) |
| GET | `/tasks/project/{project-id}` | Required | Tasks by project (paginated) |
| GET | `/tasks/{id}/subtasks` | Required | Subtasks (paginated) |
| PATCH | `/tasks/{id}` | Required | Update task |
| DELETE | `/tasks/{id}` | Required | Delete task |
| PUT | `/tasks/{id}/assign?userId=` | Required | Assign user |
| PUT | `/tasks/{id}/status?status=` | Required | Change status |

```ts
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'ARCHIVED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TaskBasicDTO {
  id: number; title: string; description: string;
  status: TaskStatus; priority: TaskPriority;
  dueDate: string; estimatedHours: number; actualHours: number;
}
interface TaskDetailDTO extends TaskBasicDTO {
  creator: UserBasicDTO; assignee: UserBasicDTO;
  parentTaskId: number; project: ProjectBasicDTO[];
  subtasks: TaskBasicDTO[]; labels: LabelBasicDTO[];
  comments: CommentBasicDTO[]; attachments: TaskAttachmentBasicDTO[];
}
interface TaskCreateDTO {
  title: string;           // required, 3-100 chars
  description?: string;    // max 2000 chars
  status?: TaskStatus;     // default: TODO
  priority?: TaskPriority; // default: MEDIUM
  dueDate?: string;        // ISO datetime
  estimatedHours?: number;
  parentTaskId?: number;   // for subtasks
  assigneeId?: number;
  projectId: number;       // required
  labelIds?: number[];
}
```

### Teams

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/teams` | Required | Create team (201) |
| GET | `/teams` | Required | All teams (paginated) |
| GET | `/teams/{id}` | Required | Team detail |
| PUT | `/teams/{id}` | Required | Update team |
| DELETE | `/teams/{id}` | Required | Delete team |
| PUT | `/teams/{id}/leader?leaderId=` | Required | Change leader |
| POST | `/teams/{team-id}/add-member/{user-id}` | Required | Add member |
| POST | `/teams/{team-id}/remove-member/{user-id}` | Required | Remove member |
| POST | `/teams/{team-id}/projects/{project-id}` | Required | Link project |

```ts
interface TeamBasicDTO { id: number; name: string; description: string; }
interface TeamDetailDTO extends TeamBasicDTO {
  leader: UserBasicDTO; members: UserBasicDTO[]; projects: ProjectBasicDTO[];
}
interface TeamCreateDTO {
  name: string;           // required, 3-100 chars
  description?: string;   // max 1000 chars
  leaderId: number;       // required
  memberIds?: number[];
}
```

### Comments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/comments/tasks/{task-id}` | Required | Add comment (201) |
| POST | `/comments/{comment-id}/reply` | Required | Reply to comment (201) |
| GET | `/comments/{id}` | Required | Comment detail |
| GET | `/comments/tasks/{task-id}` | Required | Task comments |
| GET | `/comments/{comment-id}/replies` | Required | Comment replies |
| PUT | `/comments/{id}` | Required | Edit comment |
| DELETE | `/comments/{id}` | Required | Delete comment |

```ts
interface CommentBasicDTO {
  id: number; content: string;
  createdAt: string; updatedAt: string; user: UserBasicDTO;
}
interface CommentDetailDTO extends CommentBasicDTO {
  taskId: number; parentCommentId: number; replies: CommentBasicDTO[];
}
interface CommentCreateDTO {
  content: string;           // required, 2-2000 chars
  taskId: number;            // required
  parentCommentId?: number;  // for replies
}
```

### Labels

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/labels` | Required | Create label (201) |
| GET | `/labels/{id}` | Required | Get label |
| GET | `/labels/project/{project-id}` | Required | Labels by project |
| PUT | `/labels/{id}` | Required | Update label |
| DELETE | `/labels/{id}` | Required | Delete label |
| POST | `/labels/{label-id}/tasks/{task-id}` | Required | Attach label to task |
| DELETE | `/labels/{label-id}/tasks/{task-id}` | Required | Remove label from task |

```ts
interface LabelBasicDTO { id: number; name: string; color: string; }
interface LabelCreateDTO {
  name: string;     // required, 2-50 chars
  color: string;    // required, hex or color name
  projectId: number;
}
```

### Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Required | All notifications (paginated, `onlyUnread=false`) |
| GET | `/notifications/{id}` | Required | Notification detail |
| GET | `/notifications/recent?since=` | Required | Recent notifications since datetime |
| GET | `/notifications/count-unread` | Required | Unread count (Long in data) |
| PUT | `/notifications/{id}/read` | Required | Mark as read |
| PUT | `/notifications/read-all` | Required | Mark all as read |
| POST | `/notifications` | Required | Create notification (201) |
| DELETE | `/notifications/{id}` | Required | Delete notification |
| DELETE | `/notifications/clear-all` | Required | Clear all notifications |

```ts
type NotificationType =
  | 'TASK_ASSIGNED' | 'TASK_COMMENTED' | 'TASK_STATUS_CHANGED'
  | 'TASK_DUE_SOON' | 'PROJECT_INVITATION' | 'TEAM_INVITATION' | 'GENERAL';

interface NotificationBasicDTO {
  id: number; message: string; type: NotificationType;
  read: boolean; sentAt: string;
}
interface NotificationDetailDTO extends NotificationBasicDTO {
  user: UserBasicDTO; relatedTask: TaskBasicDTO; relatedProject: ProjectBasicDTO;
}
interface NotificationCreateDTO {
  message: string;              // required
  type?: NotificationType;      // default: GENERAL
  recipientUserId: number;      // required
  relatedTaskId?: number;
  relatedProjectId?: number;
}
```

### Attachments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/attachments/tasks/{taskId}` | Required | Upload file (`multipart/form-data`, field: `file`) |
| GET | `/attachments/{id}` | Required | Attachment metadata |
| GET | `/attachments/tasks/{task-id}` | Required | Task attachments |
| DELETE | `/attachments/{id}` | Required | Delete attachment (204) |
| GET | `/attachments/{id}/download` | Required | Download file |

```ts
interface TaskAttachmentBasicDTO {
  id: number; fileName: string; fileType: string; fileSize: number;
}
```

Max upload size: **50 MB**.

---

## WebSocket (Real-time Notifications)

Backend uses STOMP over SockJS.

```ts
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8081/api/v1/ws'),
  connectHeaders: { Authorization: `Bearer ${token}` },
  onConnect: () => {
    client.subscribe('/topic/notifications', (message) => {
      const notification = JSON.parse(message.body);
      // NotificationWSDTO shape:
      // { id, message, sentAt, type, userId, taskId, projectId, taskTitle, projectName }
    });
  },
});
client.activate();
```

Send to server: `/app/notification` (broadcasts to all `/topic/notifications` subscribers).

---

## Error Handling

### Business Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| 300 | 400 | Current password is incorrect |
| 301 | 400 | New password does not match |
| 302 | 403 | Account is locked |
| 303 | 403 | Account is disabled |
| 304 | 401 | Invalid login credentials |
| 305 | 400 | Email already in use |
| 306 | 404 | Email not found |
| 307 | 401 | Account not verified / Token invalid or expired |
| 404 | 404 | Resource not found |

### Validation Errors (400)

When `@Valid` fails, the response `data` field contains an object of field errors:

```ts
// response.data.data shape on validation errors:
{ fieldName: "error message", anotherField: "error message" }
```

---

## Roles & Permissions

| Role | Notes |
|------|-------|
| `USER` | Default role, standard access |
| `TEAM_LEADER` | Can manage team resources |
| `ADMIN` | Can disable/lock accounts and change roles |

Admin-only endpoints: `PATCH /users/{id}/disable`, `PATCH /users/{id}/lock`, `PATCH /users/{id}/role`.

---

## Suggested Zustand Store Shape

```ts
// Auth store
interface AuthStore {
  token: string | null;
  user: UserBasicDTO | null;
  login: (token: string, user: UserBasicDTO) => void;
  logout: () => void;
}
```

Persist `token` to localStorage. On app load, verify token by calling `GET /users/me`.

---

## Routing Conventions

Public routes: `/login`, `/register`, `/activate-account`, `/forgot-password`, `/reset-password`  
Protected routes: everything else — redirect to `/login` if no valid token.

---

## Date Handling

The backend uses `LocalDateTime` serialized as ISO 8601: `"2026-04-24T10:30:00"`.  
Use `date-fns` for formatting/parsing. For `dateOfBirth`, format is `"YYYY-MM-DD"` (`LocalDate`).

---

## Key Development Notes

- **No token refresh** — on 401, always redirect to login
- **Email verification** — show a "check your email" screen after registration; login will fail with code 307 until verified
- **Pagination is 0-indexed** — first page is `page=0`
- **Project uniqueness** — project names must be unique (show error on duplicate)
- **Task `projectId` is required** — always pass when creating a task
- **Subtasks** — created by setting `parentTaskId` on `TaskCreateDTO`
- **File upload** — use `multipart/form-data`, field name must be `file`
- **CORS** — only `localhost:5173` and `localhost:3000` are allowed; don't change the dev port
