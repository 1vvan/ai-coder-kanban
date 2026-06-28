import os

import pytest

from app import ai


@pytest.mark.skipif(
    not os.environ.get("OPENROUTER_API_KEY"),
    reason="OPENROUTER_API_KEY not set",
)
def test_ai_connectivity():
    answer = ai.chat(
        [{"role": "user", "content": "What is 2+2? Reply with just the number."}]
    )
    assert "4" in answer


def test_missing_key_raises(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    with pytest.raises(ai.AIError):
        ai.chat([{"role": "user", "content": "hi"}])


@pytest.mark.skipif(
    not os.environ.get("OPENROUTER_API_KEY"),
    reason="OPENROUTER_API_KEY not set",
)
def test_ai_structured_returns_json():
    result = ai.chat_structured(
        [
            {
                "role": "user",
                "content": 'Reply as JSON: {"reply": "hi"}. Nothing else.',
            }
        ]
    )
    assert isinstance(result, dict)
    assert "reply" in result
