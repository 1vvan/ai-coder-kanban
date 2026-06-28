# AI Coder Kanban

A single-board Kanban app with sign-in and an AI chat assistant that can edit the board. NextJS frontend (static export) served by a FastAPI backend, SQLite storage, AI via OpenRouter, all in one Docker container.

## Requirements

- Docker
- An `OPENROUTER_API_KEY` (for the AI features)

## Setup

Copy the env example and add your key:

```bash
cp .env.example .env
# edit .env and set OPENROUTER_API_KEY
```

## Run

```bash
./scripts/start.sh    # Mac/Linux
scripts\start.bat     # Windows
```

Open http://localhost:8000 and sign in with `user` / `password`.

Stop:

```bash
./scripts/stop.sh     # Mac/Linux
scripts\stop.bat      # Windows
```

## Tests

Backend (from `backend/`, needs [uv](https://docs.astral.sh/uv/)):

```bash
uv run pytest
```

Frontend (from `frontend/`):

```bash
npm test                          # unit (Vitest)
BASE_URL=http://localhost:8000 npm run test:e2e   # integration (Playwright, app must be running)
```

## Stack

- Frontend: NextJS 16, React 19, Tailwind CSS 4, dnd-kit
- Backend: FastAPI, SQLite (built-in sqlite3), uv
- AI: OpenRouter (`openai/gpt-oss-120b:free`)
- Packaging: Docker

See `docs/PLAN.md` for the build plan and `docs/DATABASE.md` for the schema.
