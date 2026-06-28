from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Cookie, Depends, FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app import ai, auth, chat as chat_mod, db

STATIC_DIR = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="Kanban API", lifespan=lifespan)


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


class Card(BaseModel):
    id: str
    columnId: str
    title: str
    description: str = ""


class Column(BaseModel):
    id: str
    title: str


class Board(BaseModel):
    columns: list[Column]
    cards: list[Card]


@app.get("/api/board")
def read_board(user: str = Depends(auth.current_user)) -> dict:
    return db.get_board(user)


@app.put("/api/board")
def write_board(board: Board, user: str = Depends(auth.current_user)) -> dict:
    data = board.model_dump()
    db.save_board(user, data)
    return data


@app.get("/api/ai/ping")
def ai_ping(user: str = Depends(auth.current_user)) -> dict[str, str]:
    """Diagnostic: confirm AI connectivity with a trivial question."""
    try:
        answer = ai.chat(
            [{"role": "user", "content": "What is 2+2? Reply with just the number."}]
        )
    except ai.AIError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return {"answer": answer}


class ChatMessage(BaseModel):
    message: str


@app.get("/api/chat")
def chat_history(user: str = Depends(auth.current_user)) -> list[dict]:
    return db.get_messages(user)


@app.post("/api/chat")
def chat(msg: ChatMessage, user: str = Depends(auth.current_user)) -> dict:
    try:
        return chat_mod.handle_chat(user, msg.message)
    except ai.AIError as e:
        raise HTTPException(status_code=503, detail=str(e))


# Serve the built NextJS frontend at /.
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
