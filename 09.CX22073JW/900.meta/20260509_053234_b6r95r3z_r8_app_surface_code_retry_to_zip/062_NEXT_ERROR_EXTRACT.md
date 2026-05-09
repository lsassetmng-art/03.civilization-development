# B6R95R3Z-R8 Next Error Extract

ERROR_CODE=BAD_REQUEST
MESSAGE=Missing required field: task_domain_code

```
--- hit line 5 ---
    1: ============================================================
    2: POST R8 APP SURFACE
    3: ============================================================
    4: ROUTE=/aiworker/v1/runtime-execution/request
    5: STATUS=400
    6: AUTH_HEADER=Bearer ***MASKED***
    7: IDEMPOTENCY_KEY=***SET***
    8: APP_SURFACE_CODE=cx22073jw_direct_smoke
    9: AUTH_FAIL=NO
--- hit line 8 ---
    4: ROUTE=/aiworker/v1/runtime-execution/request
    5: STATUS=400
    6: AUTH_HEADER=Bearer ***MASKED***
    7: IDEMPOTENCY_KEY=***SET***
    8: APP_SURFACE_CODE=cx22073jw_direct_smoke
    9: AUTH_FAIL=NO
   10: HAS_SUMMARY=NO
   11: HAS_ZIP_HINT=NO
   12: HAS_GENERATED_ARTIFACTS=NO
--- hit line 15 ---
   11: HAS_ZIP_HINT=NO
   12: HAS_GENERATED_ARTIFACTS=NO
   13: HAS_TAIKA_TEXT=NO
   14: LOOKS_REQUEST_ONLY=NO
   15: RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip/042_post_response.json
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "BAD_REQUEST",
--- hit line 19 ---
   15: RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip/042_post_response.json
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "BAD_REQUEST",
   20:   "message": "Missing required field: task_domain_code",
   21:   "safety": {
   22:     "external_execution_performed_flag": false,
   23:     "pg_apply_performed_flag": false,
--- hit line 20 ---
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "BAD_REQUEST",
   20:   "message": "Missing required field: task_domain_code",
   21:   "safety": {
   22:     "external_execution_performed_flag": false,
   23:     "pg_apply_performed_flag": false,
   24:     "destructive_action_performed_flag": false
--- hit line 28 ---
   24:     "destructive_action_performed_flag": false
   25:   }
   26: }
   27: BODY_HEAD_END
   28: DIAGNOSIS=POST_STATUS_NOT_2XX
   29: 
   30: {
   31:   "result": "error",
   32:   "error_code": "BAD_REQUEST",
--- hit line 32 ---
   28: DIAGNOSIS=POST_STATUS_NOT_2XX
   29: 
   30: {
   31:   "result": "error",
   32:   "error_code": "BAD_REQUEST",
   33:   "message": "Missing required field: task_domain_code",
   34:   "safety": {
   35:     "external_execution_performed_flag": false,
   36:     "pg_apply_performed_flag": false,
--- hit line 33 ---
   29: 
   30: {
   31:   "result": "error",
   32:   "error_code": "BAD_REQUEST",
   33:   "message": "Missing required field: task_domain_code",
   34:   "safety": {
   35:     "external_execution_performed_flag": false,
   36:     "pg_apply_performed_flag": false,
   37:     "destructive_action_performed_flag": false
```