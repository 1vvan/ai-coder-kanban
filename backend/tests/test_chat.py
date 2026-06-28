import json

from app import chat as chat_mod
from app import db


def setup_user():
    db.init_db()
    return "user"


def test_build_messages_includes_board_question_and_history():
    board = {"columns": [], "cards": []}
    history = [{"role": "user", "content": "earlier"}]
    messages = chat_mod.build_messages(board, history, "hello")

    assert messages[0]["role"] == "system"
    assert {"role": "user", "content": "earlier"} in messages
    last = messages[-1]
    assert "hello" in last["content"]
    assert json.dumps(board) in last["content"]


def test_reply_only_leaves_board_unchanged():
    user = setup_user()
    before = db.get_board(user)

    def fake(_messages):
        return {"reply": "just chatting"}

    result = chat_mod.handle_chat(user, "hi", chat_fn=fake)
    assert result["reply"] == "just chatting"
    assert result["board"] == before
    assert db.get_board(user) == before


def test_valid_board_update_replaces_board():
    user = setup_user()
    new_board = {
        "columns": [{"id": "todo", "title": "To Do"}],
        "cards": [
            {
                "id": "x1",
                "columnId": "todo",
                "title": "From AI",
                "description": "added",
            }
        ],
    }

    def fake(_messages):
        return {"reply": "done", "board": new_board}

    result = chat_mod.handle_chat(user, "add a card", chat_fn=fake)
    assert result["board"]["cards"][0]["title"] == "From AI"
    assert db.get_board(user) == new_board


def test_invalid_board_rejected_keeps_existing():
    user = setup_user()
    before = db.get_board(user)

    def fake(_messages):
        # Cards missing required fields.
        return {"reply": "oops", "board": {"columns": [], "cards": [{"id": "z"}]}}

    result = chat_mod.handle_chat(user, "break it", chat_fn=fake)
    assert result["board"] == before
    assert db.get_board(user) == before


def test_messages_persisted():
    user = setup_user()

    def fake(_messages):
        return {"reply": "hello there"}

    chat_mod.handle_chat(user, "hi", chat_fn=fake)
    history = db.get_messages(user)
    assert history[-2] == {"role": "user", "content": "hi"}
    assert history[-1] == {"role": "assistant", "content": "hello there"}
