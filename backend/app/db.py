import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from app.seed import initial_board

DB_PATH = os.environ.get("DB_PATH", str(Path(__file__).parent / "kanban.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS boards (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL UNIQUE REFERENCES users(id),
  data       TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  role       TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL
);
"""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """Create the schema if missing and ensure the default user has a board."""
    with connect() as conn:
        conn.executescript(SCHEMA)
        ensure_user(conn, "user")


def ensure_user(conn: sqlite3.Connection, username: str) -> int:
    row = conn.execute(
        "SELECT id FROM users WHERE username = ?", (username,)
    ).fetchone()
    if row:
        user_id = row["id"]
    else:
        cur = conn.execute(
            "INSERT INTO users (username, created_at) VALUES (?, ?)",
            (username, _now()),
        )
        user_id = cur.lastrowid

    has_board = conn.execute(
        "SELECT 1 FROM boards WHERE user_id = ?", (user_id,)
    ).fetchone()
    if not has_board:
        conn.execute(
            "INSERT INTO boards (user_id, data, updated_at) VALUES (?, ?, ?)",
            (user_id, json.dumps(initial_board()), _now()),
        )
    return user_id


def get_board(username: str) -> dict:
    with connect() as conn:
        user_id = ensure_user(conn, username)
        row = conn.execute(
            "SELECT data FROM boards WHERE user_id = ?", (user_id,)
        ).fetchone()
        return json.loads(row["data"])


def save_board(username: str, board: dict) -> None:
    with connect() as conn:
        user_id = ensure_user(conn, username)
        conn.execute(
            "UPDATE boards SET data = ?, updated_at = ? WHERE user_id = ?",
            (json.dumps(board), _now(), user_id),
        )
