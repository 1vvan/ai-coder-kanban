import json

from pydantic import ValidationError

from app import ai, db

SYSTEM_PROMPT = """You are an assistant embedded in a Kanban board app.
You receive the current board as JSON and the user's message.

Always respond as JSON with this shape:
{
  "reply": "<a short message to the user>",
  "board": <the complete updated board, or omit if no change>
}

The board shape is:
{ "columns": [{"id": str, "title": str}],
  "cards": [{"id": str, "columnId": str, "title": str, "description": str}] }

Rules:
- Only include "board" when the user asks to change the board.
- When you include "board", return the ENTIRE board (all columns and cards),
  not just the change. Keep column ids stable.
- Give new cards a unique id.
- Keep "reply" concise."""


def build_messages(board: dict, history: list[dict], message: str) -> list[dict]:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append(
        {
            "role": "user",
            "content": f"Current board:\n{json.dumps(board)}\n\nUser: {message}",
        }
    )
    return messages


def validate_board(board: dict) -> dict | None:
    """Return the validated board dict, or None if it does not match."""
    # Imported here to avoid a circular import with main's models.
    from app.main import Board

    try:
        return Board(**board).model_dump()
    except (ValidationError, TypeError):
        return None


def handle_chat(username: str, message: str, chat_fn=ai.chat_structured) -> dict:
    """Run one chat turn. Returns {reply, board} where board is the current
    (possibly updated) board. Persists messages and any valid board update."""
    board = db.get_board(username)
    history = db.get_messages(username)

    result = chat_fn(build_messages(board, history, message))
    reply = result.get("reply", "")

    new_board = result.get("board")
    if new_board is not None:
        validated = validate_board(new_board)
        if validated is not None:
            db.save_board(username, validated)
            board = validated

    db.add_message(username, "user", message)
    db.add_message(username, "assistant", reply)

    return {"reply": reply, "board": board}
