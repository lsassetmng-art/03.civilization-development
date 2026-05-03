# AICompanyManager Phase ARU-ARX
# Company / Department / Section update APIs and production UI

generated_at: 2026-04-30 19:12:45 +0900

REVIEW=佐藤(DB担当)対象
SCOPE=COMPANY_DEPARTMENT_SECTION_UPDATE_UI_API
MODIFY_DB=NO
MODIFY_SERVER=YES
MODIFY_CLEAN_CORE=YES
MODIFY_INDEX=NO
DB_SCHEMA_WRITE=NOT_EXECUTED
DB_DATA_WRITE=NOT_EXECUTED_BY_SCRIPT
DB_READ=NOT_EXECUTED
API_SAVE=NOT_EXECUTED_BY_SCRIPT
API_POST=NOT_EXECUTED
HTTP_TEST=NOT_EXECUTED
SERVER_RESTART=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED
PYTHON=NOT_USED

MAINTAINABILITY_CHECK=PASS_DESIGN_INTENT
- existing server SQL-array + runPsqlJson(sql) pattern
- existing body reader only
- no new Pool
- no new DB connection helper
- no index script addition
- no bridge / guard / debug
- no DB schema write
- no API POST
- no server restart
- renderShell unchanged

PASS_COUNT=33
WARN_COUNT=0
FAIL_COUNT=1
FINAL_STATUS=COMPANY_DEPARTMENT_SECTION_UPDATE_FAILED_REVIEW_REQUIRED

SERVER_PATCH_CODE=0
SERVER_NODE_CHECK_CODE=0
CANDIDATE_NODE_CHECK_CODE=0
CORE_PATCH_CODE=0
CORE_NODE_CHECK_CODE=0

SERVER_MARKER_COUNT=1
SERVER_COMPANY_ROUTE_COUNT=1
SERVER_DEPARTMENT_ROUTE_COUNT=1
SERVER_SECTION_ROUTE_COUNT=1

CORE_MARKER_COUNT=1
CORE_COMPANY_ENDPOINT_COUNT=1
CORE_DEPARTMENT_ENDPOINT_COUNT=1
CORE_SECTION_ENDPOINT_COUNT=1
CORE_COMPANY_ACTION_COUNT=2
CORE_DEPARTMENT_ACTION_COUNT=2
CORE_SECTION_ACTION_COUNT=2

TARGET_COMPANY_RENDERER=renderCompanyOverview
TARGET_DEPARTMENT_RENDERER=renderDepartmentEditPlaceholder
TARGET_SECTION_RENDERER=renderSectionEditPlaceholder
RENDERSHELL_CHANGED=false

PROHIBITED_POOL_MARKER_COUNT=0
INDEX_SCRIPT_COUNT=1
FORBIDDEN_CORE_COUNT=1

BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_department_section_update_20260430_191243/aicm-local-ui-api-server.before_aru_arx.mjs
BACKUP_CANDIDATE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_department_section_update_20260430_191243/aicm-clean-v2-api-server.candidate.before_aru_arx.mjs
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_department_section_update_20260430_191243/aicm-production-core.before_aru_arx.js
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_department_section_update_20260430_191243/100_server_update_api_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_department_section_update_20260430_191243/110_core_update_ui_scan.txt
RENDER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_department_section_update_20260430_191243/120_render_target_scan.txt
ROLLBACK_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_department_section_update_20260430_191243/090_ROLLBACK_NOTE.txt
NEXT_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_department_section_update_20260430_191243/900_NEXT_PLAN.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_department_section_update_20260430_191243
