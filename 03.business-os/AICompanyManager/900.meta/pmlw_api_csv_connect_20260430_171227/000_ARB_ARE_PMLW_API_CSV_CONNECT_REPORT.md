# AICompanyManager Phase ARB-ARE
# President policy API + Manager major API + CSV import connect

generated_at: 2026-04-30 17:12:29 +0900

REVIEW=佐藤(DB担当)対象
SCOPE=PMLW_API_AND_CSV_CONNECT
MODIFY_SERVER=YES
MODIFY_CLEAN_CORE=YES
MODIFY_INDEX=NO
DB_SCHEMA_WRITE=NOT_EXECUTED
DB_DATA_WRITE=NOT_EXECUTED_BY_SCRIPT
DB_READ=READ_ONLY_CONTEXT_CHECK
API_SAVE=NOT_EXECUTED_BY_SCRIPT
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED
PYTHON=NOT_USED
PROHIBITED=NEW_PG_POOL_OR_NEW_DB_HELPER

MAINTAINABILITY_CHECK=PASS_DESIGN_INTENT
- existing server SQL-array + runPsqlJson(sql) pattern
- existing clean core only
- no new Pool
- no new DB connection helper
- no index script addition
- no bridge / guard / debug
- no DB schema write
- no POST save during verification

PASS_COUNT=17
WARN_COUNT=1
FAIL_COUNT=12
FINAL_STATUS=PMLW_API_CSV_CONNECT_FAILED_REVIEW_REQUIRED

SERVER_PATCH_CODE=1
SERVER_NODE_CHECK_CODE=0
CANDIDATE_NODE_CHECK_CODE=0
CORE_PATCH_CODE=0
CORE_NODE_CHECK_CODE=0

SERVER_API_MARKER_COUNT=0
PRESIDENT_ROUTE_COUNT=0
MANAGER_CREATE_ROUTE_COUNT=0
MANAGER_UPDATE_ROUTE_COUNT=0
MANAGER_ARCHIVE_ROUTE_COUNT=0
MANAGER_IMPORT_ROUTE_COUNT=0
CORE_CSV_MARKER_COUNT=1
CORE_IMPORT_ENDPOINT_COUNT=1
PROHIBITED_POOL_MARKER_COUNT=0
INDEX_SCRIPT_COUNT=1
FORBIDDEN_CORE_COUNT=0

OPEN_URL=http://127.0.0.1:8794/?v=20260430_171227_pmlw_api_csv

BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_api_csv_connect_20260430_171227/aicm-local-ui-api-server.before_arb_are.mjs
BACKUP_CANDIDATE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_api_csv_connect_20260430_171227/aicm-clean-v2-api-server.candidate.before_arb_are.mjs
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_api_csv_connect_20260430_171227/aicm-production-core.before_arb_are.js
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_api_csv_connect_20260430_171227/100_server_pmlw_api_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_api_csv_connect_20260430_171227/110_core_pmlw_csv_scan.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_api_csv_connect_20260430_171227/040_server.log
CONTEXT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_api_csv_connect_20260430_171227/060_context.json
ROLLBACK_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_api_csv_connect_20260430_171227/090_ROLLBACK_NOTE.txt
NEXT_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_api_csv_connect_20260430_171227/900_NEXT_PLAN.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_api_csv_connect_20260430_171227
