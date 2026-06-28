from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(title="Kanban API")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Serve the static site at /. In Part 3 this becomes the built NextJS export.
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
