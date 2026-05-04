#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

PORT="${AICM_AIWORKER_API_PORT:-8801}"
AUTH_REQUIRED="${AICM_AIWORKER_AUTH_REQUIRED:-0}"
AUDIT_ENABLED="${AICM_AIWORKER_AUDIT_ENABLED:-1}"
AUDIT_DRY_RUN="${AICM_AIWORKER_AUDIT_DRY_RUN:-1}"
DRY_RUN="${AICM_AIWORKER_DRY_RUN:-1}"

echo "============================================================"
echo "AICM Business AIWorker local API v3 auth/audit"
echo "============================================================"
echo "PORT=${PORT}"
echo "AUTH_REQUIRED=${AUTH_REQUIRED}"
echo "AUDIT_ENABLED=${AUDIT_ENABLED}"
echo "AUDIT_DRY_RUN=${AUDIT_DRY_RUN}"
echo "DRY_RUN=${DRY_RUN}"
echo "API=/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js"
echo "============================================================"

AICM_AIWORKER_API_PORT="${PORT}" \
AICM_AIWORKER_AUTH_REQUIRED="${AUTH_REQUIRED}" \
AICM_AIWORKER_AUDIT_ENABLED="${AUDIT_ENABLED}" \
AICM_AIWORKER_AUDIT_DRY_RUN="${AUDIT_DRY_RUN}" \
AICM_AIWORKER_DRY_RUN="${DRY_RUN}" \
node "/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js"
