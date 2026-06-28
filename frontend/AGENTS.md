# Frontend (NextJS)

The frontend is a client-rendered Kanban board built with NextJS 16 (App Router), React 19, Tailwind CSS 4, and dnd-kit. It is currently a standalone, frontend-only demo: all board state lives in memory and resets on reload. There is no backend, auth, or persistence yet — those arrive in later parts of `docs/PLAN.md`.

## Layout

```
app/
  layout.tsx        Root layout, fonts, metadata
  page.tsx          Home page: header + <Board/>
  globals.css       Tailwind import + color tokens (see CLAUDE.md palette)
components/
  Board.tsx         DndContext owner; lays out columns; drag overlay
  Column.tsx        Droppable column; inline-editable title; card list; add-card
  Card.tsx          Sortable card (title + description, delete button)
  CardView.tsx      Static card used inside the drag overlay
  AddCardForm.tsx   Inline form to add a card (title + optional description)
lib/
  types.ts          Column, Card, BoardState types
  seed.ts           createInitialState(): 5 columns + sample cards
  useBoard.ts       Pure mutations + useBoard() hook
  useBoard.test.ts  Vitest unit tests for the mutations
e2e/
  board.spec.ts     Playwright integration tests
```

## State model

State is `BoardState = { columns: Column[]; cards: Card[] }`. Cards reference their column by `columnId` (a flat card list, not nested per column). `cardsForColumn(state, columnId)` filters the list for rendering.

`lib/useBoard.ts` exports the logic as **pure functions** so it is unit-testable without React:

- `addCard(state, columnId, title, description)`
- `deleteCard(state, cardId)`
- `renameColumn(state, columnId, title)`
- `moveCard(state, activeId, overId)` — `overId` is either a card (drop before it) or a column id (append)
- `cardsForColumn(state, columnId)`

The `useBoard()` hook wraps these with `useState` + `useCallback` and returns `{ state, addCard, deleteCard, renameColumn, moveCard }`.

## Drag and drop

dnd-kit. `Board` owns the `DndContext` (with a stable `id="board"` to avoid SSR hydration mismatches in the aria ids). Columns are droppables (`useDroppable`); cards are sortables (`useSortable`) inside a per-column `SortableContext`. A `DragOverlay` renders `CardView` while dragging. Drops resolve through `moveCard`.

## Styling

Tailwind 4 with CSS variables defined in `app/globals.css` (indigo accent, slate canvas/border, success/danger). Use the existing tokens (`bg-surface`, `text-muted`, `bg-accent`, etc.) rather than hardcoding colors. No emojis.

## Commands

```bash
npm run dev        # dev server on http://localhost:3000
npm run build      # production build
npm run lint       # eslint
npm test           # unit tests (Vitest)
npm run test:e2e   # integration tests (Playwright)
```

## Notes for later parts

- This demo is not yet wired for Docker or static export; `next.config.ts` is currently default (Part 3 adds `output: 'export'`).
- Board state will move from in-memory to the backend API (Part 7); the pure mutations in `useBoard.ts` are the integration point.
- Card editing is not implemented yet (add + delete only); it is added in Part 7.
