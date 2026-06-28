# Backend

FastAPI app (managed with `uv`). Serves a static site at `/` and a JSON API under `/api`.

## Run locally

```bash
uv sync
uv run uvicorn app.main:app --reload
```

- `GET /` static site
- `GET /api/health` returns `{"status": "ok"}`

## Test

```bash
uv run pytest
```

## Docker

Run from the project root via `scripts/start.sh` (Mac/Linux) or `scripts/start.bat` (Windows). Stop with the matching `stop` script.
