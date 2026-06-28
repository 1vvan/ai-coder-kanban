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


def chat(messages: list[dict], retries: int = 4) -> str:
    """Send a chat completion request. Retries on upstream rate limits
    (free-tier models are frequently 429)."""
    client = _client()
    delay = 2.0
    for attempt in range(retries):
        try:
            res = client.chat.completions.create(
                model=MODEL, messages=messages
            )
            return res.choices[0].message.content or ""
        except RateLimitError:
            if attempt == retries - 1:
                raise AIError("AI provider is rate-limited, try again shortly")
            time.sleep(delay)
            delay *= 2
    raise AIError("AI request failed")
