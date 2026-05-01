# TaskPro

A full-stack project management application with a Spring Boot backend and a React frontend.

## Tech Stack

### Backend
- **Java 21** + **Spring Boot 3.4** (REST API, WebSocket/STOMP)
- **Spring Security** — stateless JWT authentication
- **PostgreSQL** — primary database via Hibernate / Spring Data JPA
- **Docker** — containerised backend, database, and mail server

### Frontend
- **React 19** + **TypeScript 5** + **Vite 8**
- **TailwindCSS v4** — utility-first styling (no config file needed)
- **Zustand 5** — global auth + notification state
- **TanStack React Query 5** — server state & caching
- **React Hook Form 7** + **Zod 4** — form validation
- **Framer Motion** — page and modal animations
- **Axios** — HTTP client with JWT interceptor

---

## Project Structure

```
taskpro/
├── backend/          # Spring Boot application
│   ├── src/
│   └── Dockerfile
├── frontend/         # React + Vite SPA
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── store/
│       └── types/
└── docker-compose.yml
```

---

## Running the App

### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### 1. Start the backend (PostgreSQL + mail server + Spring Boot)

```bash
docker compose up -d --build backend
```

The first startup automatically seeds demo accounts and sample data (idempotent — safe to restart).

Watch logs:
```bash
docker logs -f taskpro-backend
```

| Service | URL |
|---------|-----|
| API | http://localhost:8081/api/v1 |
| Mail UI (MailDev) | http://localhost:1080 |

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**.

---

## Demo Accounts

All accounts are pre-verified — no email confirmation required.

| Email | Password | Role |
|-------|----------|------|
| alex.dupont@taskpro.dev | Dev@12345! | Admin |
| marie.chen@taskpro.dev | Dev@12345! | Team Leader |
| lucas.martin@taskpro.dev | Dev@12345! | User |

---

## Features

| Area | Status |
|------|--------|
| JWT authentication (login / register / email verification / password reset) | ✅ |
| Dashboard with stats, recent tasks, recent projects | ✅ |
| Projects list (CRUD, status transitions) | ✅ |
| Kanban board per project (drag-free column layout, task cards) | ✅ |
| Task detail modal (comments, progress, assignee, labels) | ✅ |
| My Tasks page with filter tabs (All / To Do / In Progress / In Review / Done) | ✅ |
| New Task modal with project picker and assignee | ✅ |
| Teams page (CRUD, member/project counts, leader display) | ✅ |
| Notifications page (type icons, mark read, clear all) | ✅ |
| Real-time notifications via WebSocket (STOMP) | ✅ |
| Collapsible sidebar with unread badge | ✅ |

---

## API Overview

Base URL: `http://localhost:8081/api/v1`

All responses use a standard envelope:

```json
{
  "code": 200,
  "message": "OK",
  "timestamp": "2026-05-01T14:00:00",
  "data": { ... }
}
```

Paginated list endpoints return:

```json
{
  "content": [...],
  "pageNumber": 0,
  "size": 10,
  "totalElements": 42,
  "totalPages": 5
}
```

Key endpoint groups: `/auth`, `/users`, `/projects`, `/tasks`, `/teams`, `/notifications`, `/comments`, `/labels`, `/attachments`.

---

## Development Notes

- **Mock mode** — set `VITE_USE_MOCKS=true` in `frontend/.env.development` to run the frontend with in-memory mock data (no backend needed).
- **Real backend mode** — set `VITE_USE_MOCKS=false` (default). Clear browser localStorage on first switch to remove any stale mock token.
- **Seed data** — `DataLoader` seeds on first startup and skips on subsequent runs. To re-seed, drop and recreate the database volume: `docker compose down -v && docker compose up -d --build backend`.
- **File uploads** — max 50 MB, stored in `/app/uploads` inside the container (mounted as a Docker volume).
- **Token expiry** — 24 hours; no refresh endpoint. The app redirects to `/login` on any 401.
