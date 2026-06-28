import secrets

from fastapi import Cookie, HTTPException

# Hardcoded MVP credentials.
USERNAME = "user"
PASSWORD = "password"
SESSION_COOKIE = "session"

# In-memory session store: token -> username. Resets on restart (fine for MVP).
_sessions: dict[str, str] = {}


def create_session(username: str) -> str:
    token = secrets.token_urlsafe(32)
    _sessions[token] = username
    return token


def destroy_session(token: str | None) -> None:
    if token:
        _sessions.pop(token, None)


def current_user(session: str | None = Cookie(default=None)) -> str:
    """FastAPI dependency: returns the username or raises 401."""
    username = _sessions.get(session) if session else None
    if username is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return username
