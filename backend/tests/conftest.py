import os
import tempfile

import pytest


@pytest.fixture(autouse=True)
def temp_db(monkeypatch):
    """Point each test at a fresh SQLite file."""
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    os.unlink(path)  # let the app create it
    monkeypatch.setenv("DB_PATH", path)

    # Reload db module so DB_PATH is re-read.
    import importlib

    from app import db

    importlib.reload(db)

    yield path

    if os.path.exists(path):
        os.unlink(path)
