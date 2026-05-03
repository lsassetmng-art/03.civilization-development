# AICompanyManager Phase AQP-AQS
# PMLW getContext SQL extension exact anchor fix

generated_at: 2026-04-30 16:28:23 +0900

REVIEW=佐藤(DB担当)対象
SCOPE=SERVER_GETCONTEXT_SQL_EXTENSION_EXACT_ANCHOR_ONLY
MODIFY_SERVER=YES
MODIFY_CLEAN_CORE=NO
MODIFY_INDEX=NO
DB_SCHEMA_WRITE=NOT_EXECUTED
DB_DATA_WRITE=NOT_EXECUTED
DB_READ=READ_ONLY_VIA_EXISTING_CONTEXT_ENDPOINT
API_SAVE=NOT_EXECUTED_BY_SCRIPT
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED
PYTHON=NOT_USED
PROHIBITED=NEW_PG_POOL_OR_NEW_DB_HELPER_FOR_PMLW

MAINTAINABILITY_CHECK=PASS_DESIGN_INTENT
- existing getContext SQL-array pattern only
- no new Pool
- no new DB helper
- no bridge/guard/debug
- index script count remains 1

PASS_COUNT=23
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=PMLW_GETCONTEXT_EXACT_ANCHOR_DONE_REVIEW_REQUIRED

PATCH_CODE=0
SERVER_NODE_CHECK_CODE=0
CANDIDATE_NODE_CHECK_CODE=0
SERVER_PMLW_MARKER_COUNT=1
SERVER_PMLW_MAJOR_COUNT=1
PROHIBITED_POOL_MARKER_COUNT=0
INDEX_SCRIPT_COUNT=1
PMLW_MAJOR_CONTEXT_FIELD_COUNT=1

OPEN_URL=http://127.0.0.1:8794/?v=20260430_162818_pmlw_exact_anchor

SERVER_SCAN_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_getcontext_exact_anchor_20260430_162818/020_server_getcontext_before.txt
SERVER_SCAN_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_getcontext_exact_anchor_20260430_162818/100_server_getcontext_after.txt
BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_getcontext_exact_anchor_20260430_162818/aicm-local-ui-api-server.before_aqp_aqs.mjs
BACKUP_CANDIDATE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_getcontext_exact_anchor_20260430_162818/aicm-clean-v2-api-server.candidate.before_aqp_aqs.mjs
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_getcontext_exact_anchor_20260430_162818/040_server.log
CONTEXT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_getcontext_exact_anchor_20260430_162818/060_context.json
ROLLBACK_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_getcontext_exact_anchor_20260430_162818/090_ROLLBACK_NOTE.txt
NEXT_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_getcontext_exact_anchor_20260430_162818/900_NEXT_PLAN.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_getcontext_exact_anchor_20260430_162818
