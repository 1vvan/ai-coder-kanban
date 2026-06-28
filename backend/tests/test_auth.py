from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_login_success_sets_cookie():
    res = client.post(
        "/api/login", json={"username": "user", "password": "password"}
    )
    assert res.status_code == 200
    assert res.json() == {"username": "user"}
    assert "session" in res.cookies


def test_login_wrong_credentials():
    res = client.post(
        "/api/login", json={"username": "user", "password": "wrong"}
    )
    assert res.status_code == 401


def test_me_requires_auth():
    fresh = TestClient(app)
    assert fresh.get("/api/me").status_code == 401


def test_me_after_login():
    c = TestClient(app)
    c.post("/api/login", json={"username": "user", "password": "password"})
    res = c.get("/api/me")
    assert res.status_code == 200
    assert res.json() == {"username": "user"}


def test_logout_invalidates_session():
    c = TestClient(app)
    c.post("/api/login", json={"username": "user", "password": "password"})
    assert c.get("/api/me").status_code == 200
    c.post("/api/logout")
    assert c.get("/api/me").status_code == 401
