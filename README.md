# Loyalty Portal POC

Minimal proof-of-concept for a loyalty program partner portal.

## Architecture

- **Backend**: Strapi v5 + SQLite (local) / PostgreSQL (production)
- **Frontend**: Next.js 15 + TailwindCSS + shadcn/UI + React Query + React Hook Form + Yup

## Entities

1. **Organization** — partner organization with manager and members
2. **Mission** — set of quizzes that can be assigned to any user
3. **MissionUser** — link between mission and user assignment

### 1. Backend (Strapi)

```bash
cd backend
npm install
npm run develop
```

On first run, Strapi will open the admin panel at http://localhost:1337/admin — create your first admin user there.

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3000

### 3. Run with Docker Compose

From the project root:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit backend/.env and set APP_KEYS, JWT_SECRET, etc.

docker compose up --build
```

- Backend: http://localhost:1337 (admin: http://localhost:1337/admin)
- Frontend: http://localhost:3000

Set `NEXT_PUBLIC_API_URL=http://localhost:1337` in `frontend/.env.local` or when building so the browser can reach the API. For Docker, the default in `docker-compose.yml` is already `http://localhost:1337`.