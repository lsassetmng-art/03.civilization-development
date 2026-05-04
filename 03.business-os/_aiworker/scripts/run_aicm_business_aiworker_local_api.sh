#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# Canonical launcher for AICompanyManager x BusinessOS AIWorker local API.
# Current canonical implementation: API v3 auth/audit.

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

AICM_AIWORKER_API_PORT="${AICM_AIWORKER_API_PORT:-8801}" \
AICM_AIWORKER_AUTH_REQUIRED="${AICM_AIWORKER_AUTH_REQUIRED:-0}" \
AICM_AIWORKER_AUDIT_ENABLED="${AICM_AIWORKER_AUDIT_ENABLED:-1}" \
AICM_AIWORKER_AUDIT_DRY_RUN="${AICM_AIWORKER_AUDIT_DRY_RUN:-1}" \
AICM_AIWORKER_DRY_RUN="${AICM_AIWORKER_DRY_RUN:-1}" \
"/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/scripts/run_aicm_business_aiworker_local_api_v3_auth_audit.sh"
