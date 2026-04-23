# DataPulse — Dynamic Dashboard

A full-stack analytics dashboard built with **Spring Boot 3** (backend) and **React / Vite** (frontend), deployed on Render.

---

## Tech Stack

| Layer      | Technology                                 |
|------------|--------------------------------------------|
| Frontend   | React 19, Vite, Recharts, Axios            |
| Backend    | Spring Boot 3.2, Spring Security, JWT      |
| Database   | PostgreSQL (Flyway migrations)             |
| Deploy     | Render (Docker backend + Static frontend)  |

---

## Local Setup

### Prerequisites
- Java 17+
- Node.js 20+
- PostgreSQL 14+ (running locally, DB name: `dashboard_db`)
- Maven 3.9+

### 1 — Clone

```bash
git clone https://github.com/ganeshgagare/Dynamic-Dashboard.git
cd Dynamic-Dashboard
```

### 2 — Backend

```bash
cd backend
# Optional: copy and edit the properties (or rely on the defaults below)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Default local environment variables (override via `.env` or system env):

| Variable         | Default                         | Purpose                      |
|------------------|---------------------------------|------------------------------|
| `DB_HOST`        | `127.0.0.1`                     | PostgreSQL host              |
| `DB_PORT`        | `5432`                          | PostgreSQL port              |
| `DB_NAME`        | `dashboard_db`                  | Database name                |
| `DB_USER`        | `postgres`                      | DB username                  |
| `DB_PASSWORD`    | `Ganesh@2003`                   | DB password                  |
| `JWT_SECRET`     | *(default, change in prod!)*    | HS256 signing key (min 32 ch)|
| `PORT`           | `8081`                          | Server port                  |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173`   | Allowed frontend origin      |
| `DS_ALLOWED_HOSTS`     | `localhost,127.0.0.1`     | Datasource test host whitelist|

> **Note:** Pass `-Dspring-boot.run.profiles=dev` to seed 30 sample tasks on first run.

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev   # → http://localhost:5173
```

Set `VITE_API_URL` in a `.env.local` file if your backend runs on a different port:

```
VITE_API_URL=http://localhost:8081
```

---

## Authentication

- `POST /api/auth/register` — creates a new account (role always `Viewer`)
- `POST /api/auth/login`    — returns a signed JWT valid for 24 h
- All other `/api/**` routes require an `Authorization: Bearer <token>` header
- The `POST /api/datasource/test` endpoint additionally requires the `Admin` role

---

## Running Tests

```bash
# Backend
cd backend && mvn test

# Frontend lint + build
cd frontend && npm run lint && npm run build
```

---

## Deployment (Render)

See [`render.yaml`](render.yaml).

1. Create a **PostgreSQL** database manually on Render (free tier).
2. Set the following environment variables on the backend service:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `JWT_SECRET` — use a strong random secret (min 32 characters)
   - `CORS_ALLOWED_ORIGINS` — your frontend URL (e.g. `https://datapulse-frontend.onrender.com`)
3. Push to `main`; Render auto-deploys via `render.yaml`.

---

## Project Structure

```
Dynamic-Dashboard/
├── backend/                  # Spring Boot API
│   ├── src/main/java/com/dashboard/
│   │   ├── config/           # SecurityConfig, DataSeeder (dev only)
│   │   ├── controller/       # AuthController, DashboardController, DataSourceController
│   │   ├── dto/              # LoginRequest, RegisterRequest, ApiErrorResponse
│   │   ├── exception/        # GlobalExceptionHandler
│   │   ├── model/            # Task, User
│   │   ├── repository/       # JPA repositories
│   │   ├── security/         # JwtUtil, JwtFilter
│   │   └── service/          # AuthService, TaskService
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/     # Flyway SQL scripts
└── frontend/                 # React / Vite SPA
    └── src/
        ├── api.js            # Shared Axios instance (JWT interceptor)
        ├── constants.js      # Shared STATUSES / CATEGORIES
        ├── components/       # Cards, Charts, DataTable, Sidebar
        └── pages/            # Dashboard, Analytics, Tasks, Reports, Settings, Help
```
