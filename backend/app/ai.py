import json
import os
import time

from openai import OpenAI, RateLimitError

MODEL = "openai/gpt-oss-120b:free"
BASE_URL = "https://openrouter.ai/api/v1"


class AIError(Exception):
    pass


def _client() -> OpenAI:
    key = os.environ.get("OPENROUTER_API_KEY")
    if not key:
        raise AIError("OPENROUTER_API_KEY is not set")
    return OpenAI(api_key=key, base_url=BASE_URL)


def _create(messages: list[dict], retries: int, **kwargs):
    """Call the API, retrying on upstream rate limits.

    Free-tier models on OpenRouter often return HTTP 200 with an error body
    ({"error": {"code": 429}}) instead of a real 429, leaving `choices` empty.
    Treat any empty-choices response as a retryable rate limit.
    """
    client = _client()
    delay = 2.0
    for attempt in range(retries):
        try:
            res = client.chat.completions.create(
                model=MODEL, messages=messages, **kwargs
            )
        except RateLimitError:
            res = None
        if res is not None and getattr(res, "choices", None):
            return res
        if attempt == retries - 1:
            raise AIError("AI provider is rate-limited, try again shortly")
        time.sleep(delay)
        delay *= 2
    raise AIError("AI request failed")


def chat(messages: list[dict], retries: int = 4) -> str:
    res = _create(messages, retries)
    return res.choices[0].message.content or ""


def chat_structured(messages: list[dict], retries: int = 4) -> dict:
    """Return the model's structured response: {reply, board?}.

    `board`, when present, is the complete new board state.
    """
    res = _create(
        messages,
        retries,
        response_format={"type": "json_object"},
    )
    content = res.choices[0].message.content or "{}"
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        raise AIError("AI returned invalid JSON")
