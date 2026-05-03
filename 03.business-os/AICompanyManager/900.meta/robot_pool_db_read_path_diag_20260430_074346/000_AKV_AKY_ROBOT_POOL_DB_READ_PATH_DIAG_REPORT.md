# AICompanyManager Phase AKV-AKY
# Robot pool DB read path diagnostic

generated_at: 2026-04-30 07:43:51 +0900

PASS_COUNT=12
WARN_COUNT=0
FAIL_COUNT=0
FINAL_STATUS=ROBOT_POOL_DB_READ_PATH_DIAG_DONE_REVIEW_REQUIRED

SCOPE=READ_ONLY_DIAGNOSIS
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=NOT_EXECUTED
DB_READ=READ_ONLY
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

Findings:
- ENDPOINT_TOTAL_COUNT=36
- ENDPOINT_OK_COUNT=31
- DB_SELECTOR_EXISTS=1
- DB_SELECTOR_COUNT_LINE= business.vw_company_robot_selector_options |          0

Files:
INDEX_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/100_index_robot_pool_scan.txt
JS_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/110_robot_pool_js_scan.txt
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/120_server_robot_pool_scan.txt
ENDPOINTS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/130_candidate_robot_pool_endpoints.txt
CURL_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/140_endpoint_curl_summary.txt
DB_SQL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/010_robot_pool_readonly_check.sql
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/020_robot_pool_readonly_check.txt
CAUSE_RANKING=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/200_ROOT_CAUSE_RANKING.md
NEXT_PATCH_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/300_NEXT_PATCH_PLAN.md
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346
