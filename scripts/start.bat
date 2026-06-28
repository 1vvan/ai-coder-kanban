@echo off
REM Start the app (Windows). Builds and runs the Docker container.
cd /d "%~dp0.."

if not exist .env (
  copy .env.example .env
  echo Created .env from .env.example
)

docker compose up --build -d
echo App running at http://localhost:8000
