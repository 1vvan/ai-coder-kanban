# AI Coder Kanban

## Project

A Kanban-style project-management system for a web application.

## Business Requirements

1. MVP application.
2. There will be only one board.
3. The board has 5 fixed columns, with the ability to rename them.
4. Each card has only a title and a detailed description.
5. Interface:
   - (a) Drag-and-drop support.
   - (b) Ability to add a new card to a column.
   - (c) Deletion of existing cards.
6. Very simple functionality: no archiving, search, or filtering.

**Priority:** a stylish, beautiful, professional UI/UX with very simple functionality.

## Technical Details

- A modern Next.js application, client-rendered.
- Created in a `frontend` subdirectory.
- No data persistence — the application does not store any data.
- No user management for the MVP.
- Use popular libraries and keep things as simple as possible, while delivering a beautiful user interface.

## Color Scheme

A clean, modern palette built around a neutral slate canvas with an indigo accent (similar in spirit to tools like Linear and Notion).

- **Primary / Accent:** Indigo — `#6366F1` (hover/active: `#4F46E5`)
- **Background:** Light slate — `#F8FAFC`
- **Surface (columns / cards):** White — `#FFFFFF`
- **Border:** Slate — `#E2E8F0`
- **Text (primary):** Slate-900 — `#0F172A`
- **Text (secondary / muted):** Slate-500 — `#64748B`
- **Success:** Emerald — `#10B981`
- **Danger (delete):** Rose — `#F43F5E`

## Strategy

- Write a plan with success criteria for each phase to be checked off. Include project scaffolding (including `.gitignore`) and rigorous unit testing.
- Execute the plan, ensuring all criteria are met.
- Carry out extensive integration testing with Playwright or similar, fixing defects.
- Only complete when the MVP is finished and tested, with the server running and ready for the user.

## Coding Standards

- Use the latest versions of libraries and idiomatic approaches as of today.
- Keep it simple — NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features; focus on simplicity.
- Be concise. Keep the README minimal. IMPORTANT: no emojis ever.