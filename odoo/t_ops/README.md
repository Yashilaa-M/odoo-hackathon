# TransitOps - Smart Transport Operations Platform

TransitOps is a full-stack transport management system for fleet lifecycle tracking: vehicles, drivers, dispatch, maintenance, costs, and real-time operational reporting.

---

## Architecture

```text
Web Client (React 18 + Vite + Tailwind + Recharts)
  -> HTTPS via Axios
  -> WebSockets via Socket.IO client

NestJS Backend
  - JWT auth + RBAC
  - Feature controllers and services
  - Socket.IO realtime gateway
  - Prisma ORM

PostgreSQL Database
  - Normalized operational schema
```

---

## Quick Start

1. Build and start the stack:

   ```bash
   docker compose up --build
   ```

2. Open the apps:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

The backend container runs Prisma migrations and reloads a deterministic demo seed on boot.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Fleet Manager | `manager@transitops.com` | `password123` |
| Driver | `driver1@transitops.com` | `password123` |
| Safety Officer | `safety@transitops.com` | `password123` |
| Financial Analyst | `finance@transitops.com` | `password123` |

---

## Core Patterns

### Transactions and state machines

Trip dispatch, trip completion, and maintenance transitions are enforced inside Prisma transactions so vehicle, driver, and trip states change together or roll back together.

### Realtime updates

The backend emits websocket events on state transitions. The frontend listens for those events and invalidates React Query caches to refresh KPIs and tables without polling.

### Session handling

The app uses short-lived access tokens plus an HttpOnly refresh-token cookie. On reload, the frontend restores the session from the refresh cookie instead of persisting the access token in local storage.
