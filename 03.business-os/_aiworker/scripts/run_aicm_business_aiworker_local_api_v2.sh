#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

PORT="${AICM_AIWORKER_API_PORT:-8789}"

echo "============================================================"
echo "AICM Business AIWorker local API v2"
echo "============================================================"
echo "PORT=${PORT}"
echo "DRY_RUN=${AICM_AIWORKER_DRY_RUN:-0}"
echo "API=/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v2.js"
echo "============================================================"

AICM_AIWORKER_API_PORT="${PORT}" node "/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v2.js"
