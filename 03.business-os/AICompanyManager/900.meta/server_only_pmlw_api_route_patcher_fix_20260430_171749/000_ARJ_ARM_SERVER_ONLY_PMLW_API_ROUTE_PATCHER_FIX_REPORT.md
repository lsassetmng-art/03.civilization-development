# AICompanyManager Phase ARJ-ARM
# Server-only PMLW API route patcher syntax fix

generated_at: 2026-04-30 17:17:55 +0900

REVIEW=佐藤(DB担当)対象
SCOPE=SERVER_ONLY_PMLW_API_ROUTE_PATCHER_FIX
MODIFY_SERVER=YES
MODIFY_CLEAN_CORE=NO
MODIFY_INDEX=NO
DB_SCHEMA_WRITE=NOT_EXECUTED
DB_DATA_WRITE=NOT_EXECUTED_BY_SCRIPT
DB_READ=READ_ONLY_CONTEXT_CHECK
API_SAVE=NOT_EXECUTED_BY_SCRIPT
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED
PYTHON=NOT_USED

MAINTAINABILITY_CHECK=PASS_DESIGN_INTENT
- existing server SQL-array + runPsqlJson(sql) pattern only
- existing JSON body reader only
- no new Pool
- no new DB connection helper
- no index script addition
- no core patch
- no DB schema write
- no script POST execution

PASS_COUNT=27
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=SERVER_ONLY_PMLW_API_ROUTE_PATCHER_FIX_DONE_REVIEW_REQUIRED

SERVER_PATCH_CODE=0
SERVER_NODE_CHECK_CODE=0
CANDIDATE_NODE_CHECK_CODE=0
SERVER_API_MARKER_COUNT=1
PRESIDENT_ROUTE_COUNT=1
MANAGER_CREATE_ROUTE_COUNT=1
MANAGER_UPDATE_ROUTE_COUNT=1
MANAGER_ARCHIVE_ROUTE_COUNT=1
MANAGER_IMPORT_ROUTE_COUNT=1
CORE_IMPORT_ENDPOINT_COUNT=1
PROHIBITED_POOL_MARKER_COUNT=0
INDEX_SCRIPT_COUNT=1
FORBIDDEN_CORE_COUNT=0

OPEN_URL=http://127.0.0.1:8794/?v=20260430_171749_server_pmlw_api_fixed

BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_patcher_fix_20260430_171749/aicm-local-ui-api-server.before_arj_arm.mjs
BACKUP_CANDIDATE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_patcher_fix_20260430_171749/aicm-clean-v2-api-server.candidate.before_arj_arm.mjs
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_patcher_fix_20260430_171749/100_server_pmlw_api_scan.txt
BODY_READER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_patcher_fix_20260430_171749/110_body_reader_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_patcher_fix_20260430_171749/120_core_csv_existing_scan.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_patcher_fix_20260430_171749/040_server.log
CONTEXT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_patcher_fix_20260430_171749/060_context.json
ROLLBACK_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_patcher_fix_20260430_171749/090_ROLLBACK_NOTE.txt
NEXT_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_patcher_fix_20260430_171749/900_NEXT_PLAN.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_patcher_fix_20260430_171749
