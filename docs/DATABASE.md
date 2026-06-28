# Database

SQLite, accessed with Python's built-in `sqlite3` (no ORM). The database file is created automatically on first startup if it does not exist; the schema is applied and a default user with a seeded board is created.

## Storage approach

- The board is stored as a single JSON blob (`boards.data`), matching the frontend `BoardState` shape (`lib/types.ts`) and the full-board JSON the AI returns (Part 9). No separate column/card tables.
- The schema supports multiple users, but the MVP uses one user (`user`) with one board.
- Chat history is persisted so it survives reloads and restarts (used in Parts 9–10).

## Schema

```sql
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE boards (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL UNIQUE REFERENCES users(id),
  data       TEXT NOT NULL,           -- JSON: { columns: [...], cards: [...] }
  updated_at TEXT NOT NULL
);

CREATE TABLE chat_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  role       TEXT NOT NULL,           -- 'user' | 'assistant'
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

`boards.user_id` is UNIQUE — one board per user for the MVP.

## Board JSON shape

The `data` column holds the same structure the frontend already uses:

```json
{
  "columns": [{ "id": "backlog", "title": "Backlog" }],
  "cards": [
    {
      "id": "c1",
      "columnId": "backlog",
      "title": "Research competitors",
      "description": "Survey similar tools and note key features."
    }
  ]
}
```

## Initialization

On startup the backend:
1. Creates the database file and tables if missing.
2. Ensures the default user `user` exists.
3. If that user has no board, inserts a seeded board (the current 5 columns plus sample cards from the frontend seed).

The database file path is configurable via an env var (e.g. `DB_PATH`), defaulting to a local file under the backend.
