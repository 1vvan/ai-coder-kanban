# Kanban Board

A single-board Kanban app built with Next.js (App Router, client-rendered). One board, five renamable columns, cards with a title and description, drag-and-drop, add, and delete. State is in-memory only (no persistence).

## Requirements

- Node.js 20+

## Setup

```bash
npm install
npx playwright install chromium   # for E2E tests
```

## Develop

```bash
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm start
```

## Test

```bash
npm test           # unit tests (Vitest)
npm run test:e2e   # integration tests (Playwright)
```

## Stack

- Next.js 16, React 19
- Tailwind CSS 4
- dnd-kit (drag and drop)
- Vitest, Playwright
