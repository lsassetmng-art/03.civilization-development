#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

PORT="${AICM_AIWORKER_DUPLICATE_GUARD_API_PORT:-8797}"

echo "============================================================"
echo "AICM Business AIWorker duplicate guard API"
echo "============================================================"
echo "PORT=${PORT}"
echo "API=/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-duplicate-guard-api.js"
echo "============================================================"

AICM_AIWORKER_DUPLICATE_GUARD_API_PORT="${PORT}" node "/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-duplicate-guard-api.js"
