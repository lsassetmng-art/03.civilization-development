#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

AICM_SERVER="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
AIWORKER_SERVER="/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js"

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

echo "Stopping AICompanyManager stack..."
stop_matching "${AICM_SERVER}"
stop_matching "${AIWORKER_SERVER}"
sleep 1

echo "Remaining:"
pgrep -af "${AICM_SERVER}|${AIWORKER_SERVER}" || true
echo "DONE"
