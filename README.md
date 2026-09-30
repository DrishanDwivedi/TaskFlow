# 🚀 TaskFlow - Team Task Management Application

TaskFlow is a clean, responsive, full-stack team task management application built with **React**, **Express.js**, and **PostgreSQL**. 

> [!NOTE]
> This codebase is intentionally kept clean, modular, and dependency-light to serve as a **production-grade application codebase for Cloud, Docker, and DevOps practice** (Terraform, Ansible, Docker Compose, GitHub Actions, AWS EC2).

---

## 🏗️ Architecture & Communication Flow

```mermaid
graph TD
    Client["🌐 Web Browser / Client"]
    Frontend["🎨 Frontend (React + Vite)\n[Port 3000 / Nginx 80]"]
    Backend["⚙️ Backend (Node.js + Express)\n[Port 5000]"]
    Database[("🐘 PostgreSQL DB\n[Port 5432]")]

    Client -->|Loads SPA Assets| Frontend
    Client -->|REST API Requests / HTTP| Backend
    Backend -->|SQL Queries (pg Pool)| Database
```

### How Components Communicate

1. **Frontend to Backend**:
   - The React frontend makes REST API calls using `fetch()` to `VITE_API_BASE_URL` (e.g., `http://localhost:5000/api`).
   - When running inside Docker containers or Nginx, you can configure an Nginx reverse proxy so requests to `/api/*` on the frontend port automatically proxy to `http://backend:5000/api/*`.
   - Authenticated API requests include the header `Authorization: Bearer <jwt_token>`.

2. **Backend to Database**:
   - The Express backend connects to PostgreSQL using the `pg` (node-postgres) connection pool.
   - Database connection parameters are configured via environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.
   - When running in Docker Compose, set `DB_HOST=db` (or whatever container name you give to PostgreSQL in your `docker-compose.yml`).
   - The backend automatically executes `CREATE TABLE IF NOT EXISTS` scripts on startup to initialize the `users` and `tasks` tables if they do not exist.

3. **Backend Health Check**:
   - `GET /health` tests database connectivity and returns a JSON payload with `status`, `uptime`, `timestamp`, and `database` connectivity. This is ideal for container health check commands (`HEALTHCHECK`) and AWS Target Group / ALB health checks.

---

## 📁 Project Structure

```text
taskflow/
├── backend/
├── frontend/
├── .gitignore
└── README.md
```

### ⚙️ Backend (`/backend`)
- `src/index.js` - Server entry point, CORS setup, middleware mounting.
- `src/config/db.js` - PostgreSQL connection pool & auto-table initialization (`users` & `tasks`).
- `src/middleware/auth.js` - JWT authentication middleware.
- `src/routes/health.js` - `GET /health` status endpoint.
- `src/routes/auth.js` - Register, Login, and Profile endpoints (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`).
- `src/routes/tasks.js` - Task CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE /api/tasks`).
- `.env.example` - Template for backend environment variables.

### 🎨 Frontend (`/frontend`)
- `src/App.jsx` - Main React application with auth lifecycle and state management.
- `src/index.css` - Modern CSS design system (Dark mode, glassmorphism, responsive grid).
- `src/api/client.js` - API request wrapper handling JWT token storage and fetch calls.
- `src/components/`
  - `Navbar.jsx` - Application header with user badge & logout action.
  - `AuthModal.jsx` - Modal dialog for User Login and Registration.
  - `Dashboard.jsx` - Metric cards (Total, To Do, In Progress, Completed, High Priority rate).
  - `TaskFilter.jsx` - Search bar, status tabs, and priority filters.
  - `TaskCard.jsx` - Interactive task card with quick status toggle, priority badge, edit & delete actions.
  - `TaskModal.jsx` - Dialog form for creating and editing tasks.
- `.env.example` - Template for frontend environment variables.

---

## 🔑 Environment Variables Reference

### Backend Environment Variables (`backend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port the Express server listens on |
| `DB_HOST` | `localhost` | Database hostname (`db` when inside Docker Compose) |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `taskflow_user` | Database user |
| `DB_PASSWORD` | `taskflow_secure_password` | Database password |
| `DB_NAME` | `taskflow_db` | Database name |
| `JWT_SECRET` | `super_secret_jwt_key_...` | Secret key used for signing JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | Expiration time for JWT tokens |

### Frontend Environment Variables (`frontend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | API Base URL for HTTP requests |

---

## 🔌 API Endpoints Summary

### Authentication

- `POST /api/auth/register` - Create a new user account.
  - Body: `{ "username": "alex", "email": "alex@example.com", "password": "secretpassword" }`
- `POST /api/auth/login` - Authenticate user and receive JWT.
  - Body: `{ "email": "alex@example.com", "password": "secretpassword" }`
- `GET /api/auth/me` - Fetch profile of currently authenticated user.
  - Headers: `Authorization: Bearer <jwt_token>`

### Tasks (All require `Authorization: Bearer <jwt_token>`)

- `GET /api/tasks` - Fetch user's tasks. Optional query params: `status` (`To Do`, `In Progress`, `Completed`), `priority` (`Low`, `Medium`, `High`).
- `POST /api/tasks` - Create a new task.
  - Body: `{ "title": "Setup Docker", "description": "Write multi-stage Dockerfile", "status": "In Progress", "priority": "High", "due_date": "2026-10-01" }`
- `PUT /api/tasks/:id` - Update existing task by ID.
- `DELETE /api/tasks/:id` - Delete task by ID.

### Health Check

- `GET /health` - Service and database status check (Returns `200 OK` when healthy).

---

## 🗄️ Database Schema

### `users` Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `tasks` Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'To Do',
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💡 DevOps Containerization & Deployment Hints

When you write your Dockerfiles and Docker Compose configuration for this application, keep the following best practices in mind:

1. **Frontend Multi-Stage Docker Build**:
   - **Stage 1 (Build)**: Use a lightweight Node image (e.g. `node:20-alpine`), copy `package.json`, run `npm install`, copy source files, and execute `npm run build`.
   - **Stage 2 (Production Serve)**: Copy the generated `dist/` directory into `nginx:alpine` at `/usr/share/nginx/html`.
   - **Nginx Config**: Configure Nginx `try_files $uri $uri/ /index.html;` so React SPA client-side routing works, and optionally proxy `/api/` to `http://backend:5000/api/`.

2. **Backend Production Dockerfile**:
   - Use `node:20-alpine`.
   - Copy `package.json` and install production dependencies (`npm ci --only=production`).
   - Expose port `5000` and start with `node src/index.js`.

3. **Docker Compose (`docker-compose.yml`)**:
   - Define 3 services: `db` (PostgreSQL 15 Alpine), `backend`, and `frontend`.
   - Add a healthcheck for the `db` service (`pg_isready`) so the `backend` waits until PostgreSQL is ready before starting.
   - Use named volumes (e.g. `pgdata`) for persistent database storage.

Happy DevOps building! 🚀
