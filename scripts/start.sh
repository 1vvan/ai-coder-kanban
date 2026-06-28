#!/usr/bin/env bash
# Start the app (Mac/Linux). Builds and runs the Docker container.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

docker compose up --build -d
echo "App running at http://localhost:${PORT:-8000}"
