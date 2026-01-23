# AL TAMIMI College System

Fullstack MVP for hackathon: replace paper journals, provide admin control + analytics, and look great for judges.

## Tech

- Frontend: React (Vite) + Tailwind + Recharts + Lucide
- Backend: Node.js (Express) + JWT auth + RBAC
- DB: PostgreSQL (Docker)
- Export: PDF (pdfkit) + Excel (exceljs)

## Quick start (Windows)

### 1) Start database

```powershell
docker compose up -d db
```

### 2) Backend

```powershell
cd backend
copy .env.example .env
npm install
npm run db:init
npm run dev
```

Backend runs on `http://localhost:4000`.

### 3) Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Demo users

After `npm run db:init`:

- Admin: `admin@altamimi.local` / `Admin123!`
- Teacher: `teacher@altamimi.local` / `Teacher123!`
- Student: `student@altamimi.local` / `Student123!`
