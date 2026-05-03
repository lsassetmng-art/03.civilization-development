# AICompanyManager Phase ARF-ARI
# Server-only PMLW API route fix with existing JSON body reader

generated_at: 2026-04-30 17:14:57 +0900

REVIEW=佐藤(DB担当)対象
SCOPE=SERVER_ONLY_PMLW_API_ROUTE_FIX
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

PASS_COUNT=20
WARN_COUNT=0
FAIL_COUNT=7
FINAL_STATUS=SERVER_ONLY_PMLW_API_ROUTE_FIX_FAILED_REVIEW_REQUIRED

SERVER_PATCH_CODE=1
SERVER_NODE_CHECK_CODE=0
CANDIDATE_NODE_CHECK_CODE=0
SERVER_API_MARKER_COUNT=0
PRESIDENT_ROUTE_COUNT=0
MANAGER_CREATE_ROUTE_COUNT=0
MANAGER_UPDATE_ROUTE_COUNT=0
MANAGER_ARCHIVE_ROUTE_COUNT=0
MANAGER_IMPORT_ROUTE_COUNT=0
CORE_IMPORT_ENDPOINT_COUNT=1
PROHIBITED_POOL_MARKER_COUNT=0
INDEX_SCRIPT_COUNT=1
FORBIDDEN_CORE_COUNT=0

OPEN_URL=http://127.0.0.1:8794/?v=20260430_171452_server_pmlw_api

BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_fix_20260430_171452/aicm-local-ui-api-server.before_arf_ari.mjs
BACKUP_CANDIDATE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_fix_20260430_171452/aicm-clean-v2-api-server.candidate.before_arf_ari.mjs
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_fix_20260430_171452/100_server_pmlw_api_scan.txt
BODY_READER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_fix_20260430_171452/110_body_reader_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_fix_20260430_171452/120_core_csv_existing_scan.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_fix_20260430_171452/040_server.log
CONTEXT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_fix_20260430_171452/060_context.json
ROLLBACK_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_fix_20260430_171452/090_ROLLBACK_NOTE.txt
NEXT_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_fix_20260430_171452/900_NEXT_PLAN.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_only_pmlw_api_route_fix_20260430_171452
