from pathlib import Path

from fastapi import Cookie, Depends, FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app import auth

STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(title="Kanban API")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


class Credentials(BaseModel):
    username: str
    password: str


@app.post("/api/login")
def login(creds: Credentials, response: Response) -> dict[str, str]:
    if creds.username != auth.USERNAME or creds.password != auth.PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_session(creds.username)
    response.set_cookie(
        auth.SESSION_COOKIE, token, httponly=True, samesite="lax"
    )
    return {"username": creds.username}


@app.post("/api/logout")
def logout(
    response: Response, session: str | None = Cookie(default=None)
) -> dict[str, str]:
    auth.destroy_session(session)
    response.delete_cookie(auth.SESSION_COOKIE)
    return {"status": "ok"}


@app.get("/api/me")
def me(user: str = Depends(auth.current_user)) -> dict[str, str]:
    return {"username": user}


# Serve the built NextJS frontend at /.
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
