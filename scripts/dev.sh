#!/usr/bin/env bash
# Start local development: PostgreSQL + .NET API + Vite web (Docker Compose).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DETACH=""
MEAL_PROFILE=""
ACTION="up"

usage() {
  cat <<'EOF'
Usage: ./scripts/dev.sh [options] [command]

Commands:
  up      Start all dev services (default)
  stop    Stop services (docker compose down)
  logs    Follow service logs
  status  Show running containers

Options:
  -d, --detach   Run in background
  --meal         Also start the Node meal API (port 8787)
  -h, --help     Show this help

URLs after start:
  Web:      http://localhost:5173
  API:      http://localhost:5050
  Postgres: localhost:5432 (personal_trainer / personal_trainer)
  Admin:    admin@personal-trainer.local / ChangeMe123!
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    up|stop|logs|status)
      ACTION="$1"
      shift
      ;;
    -d|--detach)
      DETACH="-d"
      shift
      ;;
    --meal)
      MEAL_PROFILE="--profile meal"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed. Install Docker Desktop or docker-engine first." >&2
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is not running. Start Docker and try again." >&2
    exit 1
  fi
  if ! docker compose version >/dev/null 2>&1; then
    echo "docker compose is not available." >&2
    exit 1
  fi
}

port_in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -tln 2>/dev/null | grep -q ":${port} "
    return
  fi
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
    return
  fi
  return 1
}

compose_stack_running() {
  docker compose ps --status running -q 2>/dev/null | grep -q .
}

docker_owns_port() {
  local port="$1"
  docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null | grep -qE ":${port}->|0\.0\.0\.0:${port}->"
}

free_dev_ports() {
  local port pid cmd

  if compose_stack_running && port_in_use 5050; then
    echo "Dev stack already running (Docker). Attaching / refreshing containers..."
    return 0
  fi

  for port in 5050 5173; do
    if ! port_in_use "$port"; then
      continue
    fi

    if pgrep -f 'PersonalTrainer.Api' >/dev/null 2>&1; then
      echo "Stopping local PersonalTrainer.Api (port $port)..."
      pkill -f 'PersonalTrainer.Api' 2>/dev/null || true
      sleep 1
      if ! port_in_use "$port"; then
        continue
      fi
    fi

    if docker_owns_port "$port"; then
      echo "Port $port is in use by Docker. Run ./scripts/dev.sh stop to restart the stack." >&2
      return 1
    fi

    if command -v ss >/dev/null 2>&1; then
      pid="$(ss -tlnp 2>/dev/null | grep ":${port} " | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1)"
      if [[ -n "${pid:-}" ]]; then
        cmd="$(ps -p "$pid" -o comm= 2>/dev/null || true)"
        echo "Port $port is in use by PID $pid (${cmd:-unknown}). Stop it with: kill $pid" >&2
        return 1
      fi
    fi

    echo "Port $port is already in use. Run ./scripts/dev.sh stop or free the port." >&2
    return 1
  done
}

setup_env() {
  if [[ ! -f .env ]] && [[ -f .env.docker.example ]]; then
    cp .env.docker.example .env
    echo "Created .env from .env.docker.example"
  fi

  if [[ ! -f apps/web/.env ]]; then
    if [[ -f apps/web/.env.example ]]; then
      cp apps/web/.env.example apps/web/.env
    else
      echo "VITE_API_URL=http://localhost:5050" > apps/web/.env
    fi
    echo "Created apps/web/.env"
  fi
}

case "$ACTION" in
  up)
    require_docker
    setup_env
    free_dev_ports
    echo "Starting personal-trainer dev stack..."
    # shellcheck disable=SC2086
    exec docker compose $MEAL_PROFILE up --build $DETACH
    ;;
  stop)
    require_docker
  # shellcheck disable=SC2086
    exec docker compose $MEAL_PROFILE down
    ;;
  logs)
    require_docker
  # shellcheck disable=SC2086
    exec docker compose $MEAL_PROFILE logs -f
    ;;
  status)
    require_docker
  # shellcheck disable=SC2086
    exec docker compose $MEAL_PROFILE ps
    ;;
esac
