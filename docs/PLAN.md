# Project Plan

Full-stack Project Management MVP: a Kanban board with sign-in and an AI chat sidebar that can edit the board. NextJS frontend (statically built) served by a Python FastAPI backend, SQLite storage, AI via OpenRouter (`openai/gpt-oss-120b`), all packaged in one Docker container. See `CLAUDE.md` for business requirements and technical decisions.

## Key decisions

- **Card editing:** cards are editable (title + description), added in Part 7. The earlier frontend-only MVP was add + delete only.
- **NextJS build:** static export (`output: 'export'`) — pure static assets served by FastAPI; all runtime state goes through the backend API (no Next server).
- **Auth:** server-side httpOnly session cookie. Credentials hardcoded to `user` / `password`; the board is scoped to a single user_id for the MVP, but the schema supports multiple users.
- **AI board updates:** Structured Output returns the **full board** JSON (not a list of operations) — simpler to validate and apply.
- **Chat history:** persisted in the database (survives reloads and sessions).

## How to use this document

- Each part has substeps as checkboxes, the tests required, and acceptance criteria.
- Mark a box `- [x]` when the substep is complete. A part is done only when every substep, every test, and every acceptance criterion passes.
- Legend: `[ ]` not started, `[~]` in progress, `[x]` done.

## Status overview

- [x] Part 1 — Plan
- [x] Part 2 — Scaffolding (Docker + FastAPI + scripts)
- [x] Part 3 — Serve the frontend
- [x] Part 4 — Fake user sign-in
- [x] Part 5 — Database modeling
- [x] Part 6 — Backend Kanban API
- [x] Part 7 — Frontend uses the backend
- [x] Part 8 — AI connectivity
- [x] Part 9 — AI reads board + structured outputs
- [x] Part 10 — AI chat sidebar widget

---

## Part 1 — Plan

Goal: a detailed, approved plan and documentation of the existing frontend.

Substeps:
- [x] Enrich `docs/PLAN.md` with per-part substeps, tests, and acceptance criteria.
- [x] Create `frontend/AGENTS.md` describing the existing frontend code (structure, state model in `lib/useBoard.ts`, components, test setup).
- [x] User reviews and approves the plan.

Tests: none (documentation only).

Acceptance criteria:
- The plan covers all 10 parts with checkable substeps, tests, and acceptance criteria.
- `frontend/AGENTS.md` accurately reflects the current frontend.
- User has explicitly approved the plan.

---

## Part 2 — Scaffolding (Docker + FastAPI + scripts)

Goal: a running Docker container serving a FastAPI "hello world" with one example API call, plus start/stop scripts.

Substeps:
- [x] Create `backend/` FastAPI app using `uv` for dependency management (`pyproject.toml`).
- [x] Add a health/example API route (e.g. `GET /api/health` returning JSON) and serve a static `index.html` at `/`.
- [x] Write a `Dockerfile` (uv-based) and `docker-compose.yml` (or equivalent) exposing the app port.
- [x] Add `scripts/start.*` and `scripts/stop.*` for Mac, Linux, and Windows (build/run and stop the container).
- [x] Load configuration (port, env) from `.env` in the project root.

Tests:
- Backend unit test: `GET /api/health` returns 200 and expected JSON (pytest + httpx/TestClient).
- Smoke test: container builds and `GET /` returns the static HTML; `GET /api/health` returns 200.

Acceptance criteria:
- `scripts/start` builds and runs the container; the app is reachable locally.
- `GET /` serves static HTML; the example API call succeeds.
- `scripts/stop` cleanly stops the container.
- Backend unit tests pass.

---

## Part 3 — Serve the frontend

Goal: the demo Kanban board is statically built and served by FastAPI at `/`.

Substeps:
- [x] Configure NextJS static export of the existing frontend.
- [x] Build the frontend in the Docker image and have FastAPI serve the static output at `/` (with SPA/asset routing).
- [x] Wire the frontend build into `scripts/start` and the Dockerfile.

Tests:
- Frontend unit tests (Vitest) continue to pass (existing `lib/useBoard.test.ts`).
- Integration (Playwright) against the container: board renders at `/`, five columns visible, add/delete card, rename column, drag a card across columns.

Acceptance criteria:
- Visiting `/` on the running container shows the Kanban board.
- All existing add/delete/rename/drag behaviors work in the served build.
- Unit and integration tests pass.

---

## Part 4 — Fake user sign-in

Goal: gate the board behind a login (`user` / `password`) with logout.

Substeps:
- [x] Add backend auth endpoints: `POST /api/login` (validates hardcoded credentials, issues a session token/cookie), `POST /api/logout`, and `GET /api/me`.
- [x] Protect board access so unauthenticated requests are rejected (401 from `GET /api/me`; the SPA gates on it).
- [x] Add a frontend login page and logout control; show login when not authenticated.

Tests:
- Backend unit tests: correct credentials succeed; wrong credentials return 401; logout invalidates the session.
- Integration (Playwright): hitting `/` unauthenticated shows login; valid login reveals the board; logout returns to login.

Acceptance criteria:
- Board is only visible after logging in with `user` / `password`.
- Wrong credentials are rejected with a clear message.
- Logout works and re-gates the board.
- All tests pass.

---

## Part 5 — Database modeling

Goal: an approved SQLite schema (JSON board payload) documented in `docs/`.

Substeps:
- [x] Design schema: `users` (multi-user ready), per-user Kanban board stored as JSON (one board per user for the MVP), and a `chat_messages` table for persisted AI chat history (scoped per user).
- [x] Document the schema and approach in `docs/DATABASE.md` (tables, columns, JSON board shape, chat history shape, how a DB is created if missing).
- [x] User reviews and signs off the schema.

Tests: none (design + documentation). Validation happens in Part 6.

Acceptance criteria:
- `docs/DATABASE.md` describes tables, the JSON board shape, the chat history shape, and the create-if-missing behavior.
- Schema supports multiple users while the MVP uses one board per user.
- User has approved the schema.

---

## Part 6 — Backend Kanban API

Goal: authenticated CRUD over a user's Kanban, persisted in SQLite (created if missing).

Substeps:
- [x] Initialize the SQLite DB on startup if it does not exist (apply schema from Part 5).
- [x] `GET /api/board` returns the signed-in user's board.
- [x] `PUT /api/board` persists the full board (add/delete/move cards, rename columns).
- [x] Enforce auth on all board routes; scope data to the signed-in user.

Tests:
- Backend unit tests (pytest): DB auto-creation; get board for a user; add/delete/move card; rename column; persistence across requests; unauthenticated access rejected; data isolated per user.

Acceptance criteria:
- A fresh environment auto-creates the DB and serves an initial board.
- All board mutations persist and survive a restart.
- Board routes require auth and never leak another user's data.
- Backend unit tests pass.

---

## Part 7 — Frontend uses the backend

Goal: the frontend reads and writes the real board via the API; persistence is end-to-end.

Substeps:
- [x] Replace in-memory board state with API-backed loading and saving (load on mount, persist on mutation).
- [x] Add card editing: edit a card's title and description; persist via the API.
- [x] Handle loading and error states in the UI.
- [x] Keep optimistic UI for drag/add/delete/edit with reconciliation (reload on save failure).

Tests:
- Frontend unit tests updated for the API-backed state layer (mock fetch), including the new edit operation.
- Integration (Playwright) against the container: changes persist across reload and across login/logout; add/delete/move/rename/edit all persist.

Acceptance criteria:
- Reloading the page shows the previously saved board.
- Cards can be edited (title + description) and the edits persist.
- All board operations persist via the backend.
- Loading/error states behave sensibly.
- Unit and integration tests pass.

---

## Part 8 — AI connectivity

Goal: the backend can call the AI via OpenRouter.

Substeps:
- [x] Add an OpenRouter client reading `OPENROUTER_API_KEY` from `.env`, using model `openai/gpt-oss-120b:free` (free tier, with retry on upstream 429).
- [x] Add a diagnostic route (`GET /api/ai/ping`) that asks the AI a trivial question ("what is 2+2").

Tests:
- Connectivity test: the AI call returns a response containing the expected answer ("4"). Skipped gracefully if the key is absent.

Acceptance criteria:
- A live AI call succeeds and returns the expected trivial answer.
- Missing/invalid key fails with a clear, handled error (no crash).

---

## Part 9 — AI reads board + structured outputs

Goal: each AI call includes the board JSON plus the user's question and history; the AI returns Structured Outputs with a user-facing reply and an optional full board.

Substeps:
- [x] Define the Structured Output schema: `{ reply: string, board?: <full board JSON> }` (when `board` is present, it is the complete new board state).
- [x] Build the request to always include the current board JSON, the user message, and persisted conversation history (from the `chat_messages` table).
- [x] Validate the returned full board against the schema; if valid, replace the stored board via the Part 6 persistence layer. Persist the user message and AI reply to chat history.
- [x] Add a chat endpoint (`POST /api/chat`, plus `GET /api/chat` for history).

Tests:
- Backend unit tests: prompt includes board + question + history; a structured response with a full board is validated and replaces the stored board; a reply-only response leaves the board unchanged; malformed/invalid board output is rejected safely; chat messages are persisted.

Acceptance criteria:
- The AI receives the board, question, and history on every call.
- Structured Outputs are validated; a valid full board replaces the stored board, invalid ones are rejected without corrupting the existing board.
- Reply-only responses do not change the board.
- User and AI messages are persisted to chat history.
- Backend unit tests pass.

---

## Part 10 — AI chat sidebar widget

Goal: a polished chat sidebar; when the AI updates the board, the UI refreshes automatically.

Substeps:
- [x] Build a sidebar chat UI (matching the color scheme in `CLAUDE.md`) with message history and input.
- [x] Send messages to `POST /api/chat` and render replies.
- [x] When a response includes a board update, refresh the board view automatically (shared board state via `useBoard.setBoard`).

Tests:
- Frontend unit tests for the chat component (render messages, send, handle update flag).
- Integration (Playwright) against the container: send a message that triggers a board change (e.g. "add a card to To Do"); the reply appears and the board updates without manual refresh.

Acceptance criteria:
- The sidebar supports a full chat conversation.
- AI-driven board changes appear automatically (no manual refresh).
- The sidebar matches the design language of the app.
- Unit and integration tests pass.

---

## Definition of done (whole project)

- [x] All parts checked off; every listed test passes (backend pytest, frontend Vitest, Playwright E2E).
- [x] `scripts/start` brings up the full app (frontend + backend + DB + AI) in Docker; `scripts/stop` tears it down.
- [x] Sign in, manage the Kanban with persistence, and use the AI chat to edit the board end-to-end.
