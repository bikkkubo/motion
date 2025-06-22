# Motion Scheduler

Minimal Motion-like scheduler with Google Calendar sync and time-blocking optimization.

## Stack

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS + React-Big-Calendar
- **Backend**: Supabase (PostgreSQL + RLS)  
- **Solver**: FastAPI + OR-Tools

## Quick Start

### Development
```bash
# Start both frontend and solver services
docker-compose -f docker-compose.dev.yml up --build

# Or run individually:
npm run dev                    # Frontend (localhost:3000)
cd solver && uvicorn main:app --reload  # Solver API (localhost:8000)
```

### Production
```bash
docker-compose up --build
```

## Services

- **Frontend** (`:3000`) - Next.js web app with calendar UI
- **Solver** (`:8000`) - FastAPI optimization service with OR-Tools

## Development Tasks

- 0️⃣ ✅ scaffold repo
- 1️⃣ Supabase schema  
- 2️⃣ Google Calendar OAuth
- 3️⃣ diff-sync webhook
- 4️⃣ OR-Tools microservice
- 5️⃣ wire UI
