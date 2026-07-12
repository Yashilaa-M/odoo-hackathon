# TransitOps — Smart Transport Operations Platform

TransitOps is a full-stack transport management system designed to coordinate fleet lifecycle tracking: vehicle logs, driver safety compliance, automated dispatch, maintenance scheduling, and real-time operational reports.

---

## Architecture Diagram

```
       +---------------------------------------------+
       |                  Web Client                 |
       |  (React 18 + Vite + Tailwind + Recharts)    |
       +-------+-----------------------------^-------+
               | HTTPS                       | WebSockets
               | (Axios + interceptors)      | (Socket.IO client)
               v                             |
       +-------+-----------------------------+-------+
       |                NestJS Backend               |
       |  - Guards (JWT & RBAC Middleware)           |
       |  - Controllers (Feature-bound endpoints)    |
       |  - Services (Transactional Business Rules)   |
       |  - Realtime Gateway (Socket.IO Server)      |
       +--------------------+------------------------+
                            | Prisma ORM
                            v
       +--------------------+------------------------+
       |             PostgreSQL Database             |
       |         (3NF normalized schema)             |
       +---------------------------------------------+
```

---

## Quick Start

The entire stack is containerized and can be launched with a single command:

1. Clone or copy this repository.
2. Build and start the services:
   ```bash
   docker compose up --build
   ```
3. Once fully booted, open your browser:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)

*The backend container will automatically run database migrations and load the realistic seed data on its first boot.*

---

## Demo Credentials (RBAC Roles)

Every role represents a specific set of mutating and reading permissions in the application:

| Role | Email | Password | Primary Permissions |
|---|---|---|---|
| **Fleet Manager** | `manager@transitops.com` | `password123` | Read: All | Write: Vehicles, Maintenance, Trips (override) |
| **Driver** | `driver1@transitops.com` | `password123` | Read: Vehicles (read), Drivers (read) | Write: Trips (create/dispatch/complete) |
| **Safety Officer** | `safety@transitops.com` | `password123` | Read: Vehicles, Drivers, Trips | Write: Driver compliance (safety score) |
| **Financial Analyst** | `finance@transitops.com` | `password123` | Read: Reports, Costs, ROI | Write: Expenses, Fuel logs |

---

## Core Technical Patterns

### 1. Database-Level Integity & Transactions
All status state-machine rules are executed within database `$transaction` blocks. If any sub-query fails (for example, attempting to dispatch a driver whose license expired in the middle of a transaction or double-booking a vehicle), the transaction is immediately rolled back:

- **Trips dispatch transition**: Set vehicle and driver status to `ON_TRIP` and trip state to `DISPATCHED` atomically.
- **Trips completion transition**: Restores vehicle/driver to `AVAILABLE`, increments odometer based on actual distance, and logs a corresponding operational fuel expense entry.
- **Maintenance log opening**: Sets vehicle to `IN_SHOP` in real time, preventing scheduling.

### 2. Real-Time Telemetry
WebSocket events are emitted on every state transition. When a vehicle goes into the shop or a driver finishes a delivery, a event is broadcast. The React frontend listens to these channels and invalidates the relevant TanStack Query cache indexes, triggering background refetches to keep the dashboard KPIs and tables updated without requiring polling.

### 3. Axios Token Refresh
Session tokens are split into:
- Short-lived JWT Access Token passed in the `Authorization: Bearer` header.
- HttpOnly Cookie containing the Refresh Token.

If an access token expires (returning 401), the Axios response interceptor holds active requests, makes a refresh request to obtain a new token, updates the Zustand store, and replays all blocked requests seamlessly. If the session has completely expired, it logs the user out.
