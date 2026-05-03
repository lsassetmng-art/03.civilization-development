# AICompanyManager Phase AOW-AOZ
# Department task ledger v2 production UI/API/DB

generated_at: 2026-04-30 13:51:34 +0900

PASS_COUNT=24
WARN_COUNT=1
FAIL_COUNT=1
FINAL_STATUS=DEPARTMENT_TASK_LEDGER_V2_FAILED_REVIEW_REQUIRED

REVIEW=佐藤(DB担当)対象
SCOPE=PRODUCTION_TASK_LEDGER_V2
MODIFY_DB=ADD_ONLY_TABLE_AND_VIEW
MODIFY_SERVER=YES
MODIFY_CLEAN_CORE=YES
MODIFY_INDEX=NO
DB_WRITE=DDL_ADD_ONLY
DB_DATA_WRITE=NOT_EXECUTED_BY_SCRIPT
DB_READ=READ_ONLY_CONTEXT_CHECK
API_SAVE=NOT_EXECUTED_BY_SCRIPT
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED
PYTHON=NOT_USED

OPEN_URL=http://127.0.0.1:8794/?v=20260430_135127_task_ledger

DDL_SQL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127/010_department_task_ledger_v2_add_only.sql
DDL_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127/011_department_task_ledger_v2_add_only.out
BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127/aicm-local-ui-api-server.before_aow_aoz.mjs
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127/aicm-production-core.before_aow_aoz.js
BACKUP_CANDIDATE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127/aicm-clean-v2-api-server.candidate.before_aow_aoz.mjs
SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127/100_scan.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127/040_server.log
CONTEXT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127/060_context.json
ROLLBACK_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127/090_ROLLBACK_NOTE.txt
NEXT_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127/900_NEXT_PLAN.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/department_task_ledger_v2_20260430_135127

DDL_CODE=0
SERVER_PATCH_CODE=0
SERVER_NODE_CHECK_CODE=0
CORE_PATCH_CODE=0
CORE_NODE_CHECK_CODE=1
FORBIDDEN_COUNT=0
INDEX_SCRIPT_COUNT=1
TASK_ROUTE_COUNT=1
TASK_CONTEXT_COUNT=2
TASK_CORE_COUNT=2
