# ============================================================
# AI OPERATION DESK EDGE RUNTIME README
# ============================================================

status: implementation-stub
app: AIOperationDesk
owner: Boss
prepared_by: Zero

entrypoint:
- 020.backend/edge/index.ts

current_runtime_modes:
- mock
- db_psql

env_candidates:
- AIOD_PORT
- AIOD_DATA_MODE
- PERSONA_DATABASE_URL

rules:
- mock is default
- db_psql is read-only gateway mode for current phase
- writes remain stub routed
- db_psql mode requires psql to be installed and available in PATH
- db_psql mode requires Deno allow-run permission

notes:
- current db-backed mode covers read routes only
- write routes remain stub until next phase
