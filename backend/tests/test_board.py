from fastapi.testclient import TestClient

from app.main import app


def login(client: TestClient) -> None:
    client.post(
        "/api/login", json={"username": "user", "password": "password"}
    )


def test_board_requires_auth():
    with TestClient(app) as client:
        assert client.get("/api/board").status_code == 401
        assert client.put("/api/board", json={}).status_code == 401


def test_get_board_returns_seeded_board():
    with TestClient(app) as client:
        login(client)
        res = client.get("/api/board")
        assert res.status_code == 200
        board = res.json()
        assert len(board["columns"]) == 5
        assert len(board["cards"]) > 0


def test_put_board_persists():
    with TestClient(app) as client:
        login(client)
        board = client.get("/api/board").json()
        board["cards"].append(
            {
                "id": "new1",
                "columnId": "todo",
                "title": "Added",
                "description": "via API",
            }
        )
        assert client.put("/api/board", json=board).status_code == 200

        reloaded = client.get("/api/board").json()
        assert any(c["id"] == "new1" for c in reloaded["cards"])


def test_board_persists_across_app_restart(temp_db):
    # First "process": save a change.
    with TestClient(app) as client:
        login(client)
        board = client.get("/api/board").json()
        board["columns"][0]["title"] = "Renamed"
        client.put("/api/board", json=board)

    # Second "process": same DB file, fresh client.
    with TestClient(app) as client:
        login(client)
        board = client.get("/api/board").json()
        assert board["columns"][0]["title"] == "Renamed"


def test_invalid_board_rejected():
    with TestClient(app) as client:
        login(client)
        # Missing required card fields.
        bad = {"columns": [], "cards": [{"id": "x"}]}
        assert client.put("/api/board", json=bad).status_code == 422


def test_board_data_isolated_per_user():
    from app import db

    db.init_db()
    db.save_board("user", {"columns": [], "cards": []})
    # A different user gets their own seeded board, unaffected by "user".
    other = db.get_board("alice")
    assert len(other["columns"]) == 5
    assert db.get_board("user") == {"columns": [], "cards": []}
