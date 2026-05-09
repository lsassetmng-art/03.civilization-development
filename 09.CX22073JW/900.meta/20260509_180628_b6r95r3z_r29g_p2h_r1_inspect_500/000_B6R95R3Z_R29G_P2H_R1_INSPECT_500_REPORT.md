# B6R95R3Z R29G-P2H-R1 INSPECT 500 REPORT

## 1. Final status
FINAL_STATUS=PASS_R29G_P2H_R1_500_INSPECTED

## 2. Scope
TARGET=09.CX22073JW / 11.aiworker-os/runtime-execution-http-api
DB_WRITE=NO
FILE_WRITE=YES
API_POST=NO
PATCH=NO
GIT_PUSH=NO
AICM_TOUCH=NO

## 3. Source
P2H_RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180508_b6r95r3z_r29g_p2h_minimal_exact_contract_post
BODY_COPY=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/020_p2h_500_body_pretty.txt
META_COPY=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/021_p2h_curl_meta.txt
PAYLOAD_COPY=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/022_p2h_payload.json
SERVER_LOG_COPY=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/023_p2h_server_log_tail.txt

## 4. Error
ERROR_MESSAGE=ERROR:  Runtime control profile not found: app_surface_code=cx22073jw_e2e_quality_gate, model_code=byd2_003_asic_leader3

## 5. Evidence
REPORT_PATH=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/000_B6R95R3Z_R29G_P2H_R1_INSPECT_500_REPORT.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500
SUMMARY=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/050_500_root_cause_summary.txt
SERVER_CONTEXT=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/030_createRuntimeRequest_context_after_500.txt
SQL_CONTEXT=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/031_runtime_request_sql_context.txt
DB_SCHEMA_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/040_db_runtime_schema_readonly.log
DB_IDEMPOTENCY_CHECK=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/041_db_idempotency_readonly_check.log
SECRET_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_180628_b6r95r3z_r29g_p2h_r1_inspect_500/090_secret_scan.log

## 6. Result counts
PASS_COUNT=12
WARN_COUNT=1
FAIL_COUNT=0

## 7. Next
- Inspect SUMMARY.
- If DB function/schema mismatch, fix only after exact root cause.
- Do not POST again until 500 cause is identified.
