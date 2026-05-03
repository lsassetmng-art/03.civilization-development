#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager"
AICM_SERVER="${APP_ROOT}/server/aicm-local-ui-api-server.mjs"
AICM_META="${APP_ROOT}/900.meta"

AIWORKER_RUNTIME_ROOT="/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api"
AIWORKER_SERVER="${AIWORKER_RUNTIME_ROOT}/server.js"
AIWORKER_ENV="${AIWORKER_RUNTIME_ROOT}/.env.local"
AIWORKER_RUNTIME_DIR="${AIWORKER_RUNTIME_ROOT}/runtime"
AIWORKER_LOG="${AIWORKER_RUNTIME_DIR}/server.log"
AIWORKER_PID_FILE="${AIWORKER_RUNTIME_DIR}/server.pid"

AICM_PORT="${AICM_PORT:-8794}"
PERSONA_AIWORKEROS_PORT="${PERSONA_AIWORKEROS_PORT:-8787}"
PERSONA_AIWORKEROS_BASE_URL="${PERSONA_AIWORKEROS_BASE_URL:-http://127.0.0.1:${PERSONA_AIWORKEROS_PORT}}"
PERSONA_AIWORKEROS_AUTH_TOKEN="${PERSONA_AIWORKEROS_AUTH_TOKEN:-local-aiworkeros-smoke-token}"

AICM_STACK_RESTART="${AICM_STACK_RESTART:-NO}"

mkdir -p "${AIWORKER_RUNTIME_DIR}" "${AICM_META}"

if [ -f "${AIWORKER_ENV}" ]; then
  set -a
  . "${AIWORKER_ENV}"
  set +a
fi

export PERSONA_AIWORKEROS_PORT="${PERSONA_AIWORKEROS_PORT:-8787}"
export PERSONA_AIWORKEROS_BASE_URL="${PERSONA_AIWORKEROS_BASE_URL:-http://127.0.0.1:${PERSONA_AIWORKEROS_PORT}}"
export PERSONA_AIWORKEROS_AUTH_TOKEN="${PERSONA_AIWORKEROS_AUTH_TOKEN:-local-aiworkeros-smoke-token}"

mask_value() {
  v="${1:-}"
  if [ -z "$v" ]; then
    echo "(empty)"
  else
    printf '%s...[MASKED]\n' "$(printf '%s' "$v" | cut -c1-10)"
  fi
}

stop_matching() {
  pattern="$1"
  pids="$(pgrep -f "$pattern" || true)"
  if [ -n "$pids" ]; then
    for pid in $pids; do
      if [ "$pid" != "$$" ]; then
        kill "$pid" 2>/dev/null || true
      fi
    done
  fi
}

start_aiworker() {
  if [ "${AICM_STACK_RESTART}" = "YES" ]; then
    stop_matching "${AIWORKER_SERVER}"
    sleep 1
  fi

  if pgrep -f "${AIWORKER_SERVER}" >/dev/null 2>&1; then
    echo "AIWorkerOS runtime already running"
    return
  fi

  (
    cd "${AIWORKER_RUNTIME_ROOT}"
    nohup env \
      PERSONA_AIWORKEROS_PORT="${PERSONA_AIWORKEROS_PORT}" \
      PERSONA_AIWORKEROS_BASE_URL="${PERSONA_AIWORKEROS_BASE_URL}" \
      PERSONA_AIWORKEROS_AUTH_TOKEN="${PERSONA_AIWORKEROS_AUTH_TOKEN}" \
      node "${AIWORKER_SERVER}" > "${AIWORKER_LOG}" 2>&1 &
    echo $! > "${AIWORKER_PID_FILE}"
  )

  sleep 2
  echo "AIWorkerOS runtime started"
}

start_aicm() {
  if [ "${AICM_STACK_RESTART}" = "YES" ]; then
    stop_matching "${AICM_SERVER}"
    sleep 1
  fi

  if pgrep -f "${AICM_SERVER}" >/dev/null 2>&1; then
    echo "AICompanyManager server already running"
    return
  fi

  run_ts="$(date +%Y%m%d_%H%M%S)"
  run_dir="${AICM_META}/stack_launcher_${run_ts}"
  mkdir -p "${run_dir}"

  (
    cd "${APP_ROOT}"
    nohup env \
      PORT="${AICM_PORT}" \
      AICM_LOCAL_UI_API_PORT="${AICM_PORT}" \
      PERSONA_AIWORKEROS_BASE_URL="${PERSONA_AIWORKEROS_BASE_URL}" \
      PERSONA_AIWORKEROS_AUTH_TOKEN="${PERSONA_AIWORKEROS_AUTH_TOKEN}" \
      node "${AICM_SERVER}" > "${run_dir}/aicm_server.log" 2>&1 &
    echo $! > "${run_dir}/aicm_server.pid"
  )

  sleep 2
  echo "AICompanyManager server started"
}

cat <<INFO
============================================================
AICompanyManager stack launcher
============================================================
APP_ROOT=${APP_ROOT}
AIWORKER_RUNTIME_ROOT=${AIWORKER_RUNTIME_ROOT}
AICM_PORT=${AICM_PORT}
PERSONA_AIWORKEROS_BASE_URL=${PERSONA_AIWORKEROS_BASE_URL}
PERSONA_AIWORKEROS_AUTH_TOKEN=$(mask_value "${PERSONA_AIWORKEROS_AUTH_TOKEN}")
AICM_STACK_RESTART=${AICM_STACK_RESTART}
============================================================
INFO

start_aiworker
start_aicm

cat <<INFO
============================================================
Stack status
============================================================
AIWorkerOS:
$(pgrep -af "${AIWORKER_SERVER}" || true)

AICompanyManager:
$(pgrep -af "${AICM_SERVER}" || true)

Open:
http://127.0.0.1:${AICM_PORT}/
============================================================
INFO
