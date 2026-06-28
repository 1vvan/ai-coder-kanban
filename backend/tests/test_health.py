from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_index_served():
    res = client.get("/")
    assert res.status_code == 200
    assert "Hello from FastAPI" in res.text
