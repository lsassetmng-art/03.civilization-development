# AICompanyManager BusinessOS AIWorker Duplicate Guard Report

## Result
- RESULT: FAIL
- PASS_COUNT: 14
- FAIL_COUNT: 1

## Scope
- Role-specific duplicate guard
- President / ExecutiveManager / Manager / Leader: single-slot
- Worker / Helper / Friend / Specialist / Butler / Security: multi-slot
- Guard API
- Save client wrapper
- Manual 重複チェック button
- No existing main JS modification

## DB objects
- business.vw_aicm_robot_role_duplicate_rule
- business.fn_aicm_robot_placement_duplicate_guard
- business.fn_aicm_robot_placement_duplicate_guard_from_payload

## API
- GET /health
- GET /api/v1/business/aiworker/aicm/duplicate-rules
- GET /api/v1/business/aiworker/aicm/duplicate-guard
- POST /api/v1/business/aiworker/aicm/duplicate-guard

## Files
- SQL_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/db/006_business_aiworker_duplicate_guard.sql
- API_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-duplicate-guard-api.js
- RUN_API_SCRIPT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/scripts/run_aicm_business_aiworker_duplicate_guard_api.sh
- GUARD_CLIENT_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-duplicate-guard.js
- TEST_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_duplicate_guard.js
- CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/094_AICM_BUSINESS_AIWORKER_DUPLICATE_GUARD_CANON.md
- INDEX_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html

## Script refs
- GUARD_REL: assets/js/aicm-business-aiworker-duplicate-guard.js
- GUARD_TAG_COUNT: 1

## Logs
- DB_APPLY_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/010_db_apply_stdout.txt
- DB_APPLY_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/011_db_apply_stderr.txt
- API_NODE_CHECK_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/020_api_node_check_stdout.txt
- API_NODE_CHECK_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/021_api_node_check_stderr.txt
- CLIENT_NODE_CHECK_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/022_client_node_check_stdout.txt
- CLIENT_NODE_CHECK_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/023_client_node_check_stderr.txt
- CLIENT_SMOKE_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/030_client_smoke_stdout.txt
- CLIENT_SMOKE_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/031_client_smoke_stderr.txt
- DB_ROLLBACK_GUARD_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/040_db_rollback_guard_stdout.txt
- DB_ROLLBACK_GUARD_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/041_db_rollback_guard_stderr.txt
- API_SERVER_LOG: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/050_duplicate_guard_api.log
- API_HEALTH: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/051_api_health.json
- API_DUPLICATE_RULES: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/052_api_duplicate_rules.json
- API_PRESIDENT_GUARD: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/053_api_president_guard.json
- API_WORKER_GUARD: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/054_api_worker_guard.json
- INDEX_BEFORE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/index.before.html
- INDEX_AFTER: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/index.after.html

## Safety
- Existing main JS touched: no
- index.html change: script append only
- DB smoke: rollback only
- Delete: none
- ERP DATABASE_URL: not used
- Persona DB env: PERSONA_DATABASE_URL
- Reviewer: Sato DB

## Run duplicate guard API
```bash
AICM_AIWORKER_DUPLICATE_GUARD_API_PORT=8797 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/scripts/run_aicm_business_aiworker_duplicate_guard_api.sh"
```

## Next
- Save button double-submit guard
- Production auth/RLS/audit hardening
- API consolidation decision: merge local APIs or keep separate dev APIs
