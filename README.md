# Personal Finance Dashboard (MVP)

Modern personal finance web app with React + FastAPI, Supabase Auth, and PostgreSQL.

## Tech Stack
- Frontend: React 18 + TypeScript, Vite, Tailwind v4, Redux Toolkit + RTK Query, React Router v6, react-chartjs-2, TanStack Table, React Hook Form + Yup
- Backend: FastAPI, SQLAlchemy, Alembic-ready structure, pytest
- Infrastructure: Docker Compose (Postgres + Backend), Supabase (Auth + optional Postgres), Vercel/Railway ready

## Features (MVP)
- Email/password auth via Supabase; protected routes
- Dashboard: current balance, monthly income/expenses, savings rate; charts (pie/bar/line)
- Transactions: list, filter, create, delete
- Categories & Accounts: create/list (API)
- Budgets: monthly budgets with progress tracking

## Prerequisites
- Node.js 20+
- Python 3.11+
- Docker (optional for DB/backend)
- Supabase project (Auth) with URL and anon key

## Quick Start (Local)

### 1) Frontend
```bash
cd frontend
cp .env.example .env  # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```
Dev server: http://localhost:5173

### 2) Backend (with local Python)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# For local Postgres (Docker) use DATABASE_URL from example; otherwise fallback to SQLite
uvicorn app.main:app --reload
```
API: http://localhost:8000/api

### 3) Database (Docker Postgres)
```bash
# from repo root
docker compose up -d db
```
Update `backend/.env` DATABASE_URL to `postgresql+psycopg2://postgres:postgres@localhost:5432/finance` (already default in example).

### 4) Run backend via Docker (optional)
```bash
# from repo root
cp backend/.env.example backend/.env
docker compose up -d --build backend
```

## Running Tests
```bash
cd backend
source .venv/bin/activate
PYTHONPATH=$(pwd) pytest -q
```

## Production Builds
```bash
# Frontend
cd frontend
npm run build
# Backend (uvicorn)
cd ../backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Deployment

### Frontend (Vercel)
- Import the `frontend` folder as a Vercel project
- Framework: Vite
- Env Vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL=https://YOUR_BACKEND_HOST/api`

### Backend (Railway/Render/Heroku)
- Deploy from the `backend` folder
- Set `DATABASE_URL` (Postgres) and Supabase auth vars (`SUPABASE_JWKS_URL` or `SUPABASE_JWT_SECRET`)
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Database
- Use Railway/Neon/Supabase Postgres and set `DATABASE_URL` accordingly
- For schema migrations, add Alembic later (structure prepared)

## Notes & Next Steps
- Hardening: rate limiting, 2FA UI, device logs, stricter CORS
- Performance: pagination/virtualization, code-splitting
- Features: CSV import/export, OCR receipts, alerts, reports, investments, AI insights

## Repository Layout
- `frontend/` React app (Vite)
- `backend/` FastAPI app
- `docker-compose.yml` Postgres + backend

## License
MIT
