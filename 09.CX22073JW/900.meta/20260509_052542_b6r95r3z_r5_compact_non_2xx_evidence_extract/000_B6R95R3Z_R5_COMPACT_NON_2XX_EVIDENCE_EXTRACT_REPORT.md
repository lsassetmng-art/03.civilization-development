# B6R95R3Z-R5 Compact Non-2xx Evidence Extract Report

RUN_TS=20260509_052542
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052542_b6r95r3z_r5_compact_non_2xx_evidence_extract
PREV_R3_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry
PREV_R4_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052333_b6r95r3z_r4_post_non_2xx_deep_diagnosis
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- HTTP_GET=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Compact extract
```
/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052542_b6r95r3z_r5_compact_non_2xx_evidence_extract/020_COMPACT_NON_2XX_EVIDENCE_EXTRACT.md
```

## Compact extract head
```
# B6R95R3Z-R5 Compact Non-2xx Evidence Extract

PREV_R3_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry
PREV_R4_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052333_b6r95r3z_r4_post_non_2xx_deep_diagnosis
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request

## 判断用の最重要メモ

このファイルの以下だけをChatGPTへ貼れば、次のR6を作れる。
特に見る場所:
- 1_EXACT_ERROR_LINES
- 2_RESPONSE_JSON_SUMMARY
- 5_SELECTED_ROUTE_HANDLER_CONTEXT
- 7_ROUTE_CANDIDATES


# 1_EXACT_ERROR_LINES

```
--- hit line 5 ---
    2: POST PAYLOAD COMPAT TO AIWORKEROS
    3: ============================================================
    4: ROUTE=/aiworker/v1/runtime-execution/request
    5: STATUS=400
    6: AUTH_FAIL=NO
    7: HAS_SUMMARY=NO
    8: HAS_ZIP_HINT=NO
--- hit line 16 ---
   13: BODY_HEAD_BEGIN
   14: {
   15:   "result": "error",
   16:   "error_code": "BAD_REQUEST",
   17:   "message": "Idempotency-Key is required",
   18:   "safety": {
   19:     "external_execution_performed_flag": false,
--- hit line 17 ---
   14: {
   15:   "result": "error",
   16:   "error_code": "BAD_REQUEST",
   17:   "message": "Idempotency-Key is required",
   18:   "safety": {
   19:     "external_execution_performed_flag": false,
   20:     "pg_apply_performed_flag": false,
--- hit line 25 ---
   22:   }
   23: }
   24: BODY_HEAD_END
   25: DIAGNOSIS=POST_STATUS_NOT_2XX
   26: 
   27: {
   28:   "result": "error",
--- hit line 29 ---
   26: 
   27: {
   28:   "result": "error",
   29:   "error_code": "BAD_REQUEST",
   30:   "message": "Idempotency-Key is required",
   31:   "safety": {
   32:     "external_execution_performed_flag": false,
--- hit line 30 ---
   27: {
   28:   "result": "error",
   29:   "error_code": "BAD_REQUEST",
   30:   "message": "Idempotency-Key is required",
   31:   "safety": {
   32:     "external_execution_performed_flag": false,
   33:     "pg_apply_performed_flag": false,
--- hit line 46 ---
   43: POST_LOG_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/071_post_payload_compat.log
   44: SERVER_LOG_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/030_runtime_server.log
   45: JSON_PARSE=PASS
   46: HTTP_STATUS=400
   47: ERROR_CODE=BAD_REQUEST
   48: MESSAGE=Idempotency-Key is required
   49: AUTH_FAIL_HINT=NO
--- hit line 47 ---
   44: SERVER_LOG_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/030_runtime_server.log
   45: JSON_PARSE=PASS
   46: HTTP_STATUS=400
   47: ERROR_CODE=BAD_REQUEST
   48: MESSAGE=Idempotency-Key is required
   49: AUTH_FAIL_HINT=NO
   50: FORBIDDEN_HINT=NO
--- hit line 48 ---
   45: JSON_PARSE=PASS
   46: HTTP_STATUS=400
   47: ERROR_CODE=BAD_REQUEST
   48: MESSAGE=Idempotency-Key is required
   49: AUTH_FAIL_HINT=NO
   50: FORBIDDEN_HINT=NO
   51: NOT_FOUND_HINT=NO
--- hit line 50 ---
   47: ERROR_CODE=BAD_REQUEST
   48: MESSAGE=Idempotency-Key is required
   49: AUTH_FAIL_HINT=NO
   50: FORBIDDEN_HINT=NO
   51: NOT_FOUND_HINT=NO
   52: BAD_REQUEST_HINT=YES
   53: UNSUPPORTED_HINT=NO
--- hit line 51 ---
   48: MESSAGE=Idempotency-Key is required
   49: AUTH_FAIL_HINT=NO
   50: FORBIDDEN_HINT=NO
   51: NOT_FOUND_HINT=NO
   52: BAD_REQUEST_HINT=YES
   53: UNSUPPORTED_HINT=NO
   54: SERVER_ERROR_HINT=NO
--- hit line 52 ---
   49: AUTH_FAIL_HINT=NO
   50: FORBIDDEN_HINT=NO
   51: NOT_FOUND_HINT=NO
   52: BAD_REQUEST_HINT=YES
   53: UNSUPPORTED_HINT=NO
   54: SERVER_ERROR_HINT=NO
   55: INTERESTING_RESPONSE_FIELDS_BEGIN
--- hit line 54 ---
   51: NOT_FOUND_HINT=NO
   52: BAD_REQUEST_HINT=YES
   53: UNSUPPORTED_HINT=NO
   54: SERVER_ERROR_HINT=NO
   55: INTERESTING_RESPONSE_FIELDS_BEGIN
   56: $.result=error
   57: $.error_code=BAD_REQUEST
--- hit line 57 ---
   54: SERVER_ERROR_HINT=NO
   55: INTERESTING_RESPONSE_FIELDS_BEGIN
   56: $.result=error
   57: $.error_code=BAD_REQUEST
   58: $.message=Idempotency-Key is required
   59: INTERESTING_RESPONSE_FIELDS_END
   60: MISSING_FIELD_CANDIDATES_BEGIN
--- hit line 58 ---
   55: INTERESTING_RESPONSE_FIELDS_BEGIN
   56: $.result=error
   57: $.error_code=BAD_REQUEST
   58: $.message=Idempotency-Key is required
   59: INTERESTING_RESPONSE_FIELDS_END
   60: MISSING_FIELD_CANDIDATES_BEGIN
   61: safety
--- hit line 60 ---
   57: $.error_code=BAD_REQUEST
   58: $.message=Idempotency-Key is required
   59: INTERESTING_RESPONSE_FIELDS_END
   60: MISSING_FIELD_CANDIDATES_BEGIN
   61: safety
   62: MISSING_FIELD_CANDIDATES_END
   63: POST_LOG_EXCERPT_BEGIN
--- hit line 62 ---
   59: INTERESTING_RESPONSE_FIELDS_END
   60: MISSING_FIELD_CANDIDATES_BEGIN
   61: safety
   62: MISSING_FIELD_CANDIDATES_END
   63: POST_LOG_EXCERPT_BEGIN
   64: ============================================================
   65: POST PAYLOAD COMPAT TO AIWORKEROS
--- hit line 68 ---
   65: POST PAYLOAD COMPAT TO AIWORKEROS
   66: ============================================================
   67: ROUTE=/aiworker/v1/runtime-execution/request
   68: STATUS=400
   69: AUTH_FAIL=NO
   70: HAS_SUMMARY=NO
   71: HAS_ZIP_HINT=NO
--- hit line 79 ---
   76: BODY_HEAD_BEGIN
   77: {
   78:   "result": "error",
   79:   "error_code": "BAD_REQUEST",
   80:   "message": "Idempotency-Key is required",
   81:   "safety": {
   82:     "external_execution_performed_flag": false,
--- hit line 80 ---
   77: {
   78:   "result": "error",
   79:   "error_code": "BAD_REQUEST",
   80:   "message": "Idempotency-Key is required",
   81:   "safety": {
   82:     "external_execution_performed_flag": false,
   83:     "pg_apply_performed_flag": false,
--- hit line 88 ---
   85:   }
   86: }
   87: BODY_HEAD_END
   88: DIAGNOSIS=POST_STATUS_NOT_2XX
   89: 
   90: POST_LOG_EXCERPT_END
   91: RESPONSE_BODY_BEGIN
--- hit line 94 ---
   91: RESPONSE_BODY_BEGIN
   92: {
   93:   "result": "error",
   94:   "error_code": "BAD_REQUEST",
   95:   "message": "Idempotency-Key is required",
   96:   "safety": {
   97:     "external_execution_performed_flag": false,
--- hit line 95 ---
   92: {
   93:   "result": "error",
   94:   "error_code": "BAD_REQUEST",
   95:   "message": "Idempotency-Key is required",
   96:   "safety": {
   97:     "external_execution_performed_flag": false,
   98:     "pg_apply_performed_flag": false,
--- hit line 107 ---
  104: AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:8787
  105: 
  106: SERVER_LOG_TAIL_END
  107: DIAGNOSIS=BAD_REQUEST_OR_PAYLOAD_VALIDATION
  108: 
  109: ============================================================
  110: PAYLOAD VS HANDLER COMPARE
--- hit line 113 ---
  110: PAYLOAD VS HANDLER COMPARE
  111: ============================================================
  112: PAYLOAD_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/060_payload_compat.json
  113: HTTP_STATUS=400
  114: ERROR_CODE=BAD_REQUEST
  115: MESSAGE=Idempotency-Key is required
  116: RESPONSE_DIAGNOSIS=POST_STATUS_NOT_2XX
--- hit line 114 ---
```

## AICM touch check
```
AICM_BASE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052542_b6r95r3z_r5_compact_non_2xx_evidence_extract/000_start_marker
```

## Runtime touch check
```
AIWORKER_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os
START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052542_b6r95r3z_r5_compact_non_2xx_evidence_extract/000_start_marker
```

## Secret scan
```
Scan compact extract only
```
FINAL_STATUS=B6R95R3Z_R5_COMPACT_NON_2XX_EVIDENCE_EXTRACT_PASS_REVIEW_REQUIRED
NEXT=COMPACT_REPORTの1_EXACT_ERROR_LINESと2_RESPONSE_JSON_SUMMARYを貼って、R6で最小対応を決める。
