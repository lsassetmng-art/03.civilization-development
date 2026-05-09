# B6R95R3Z-R10 Next Error Extract

ERROR_CODE=INTERNAL_ERROR
MESSAGE=ERROR:  Runtime control profile not found: app_surface_code=cx22073jw_direct_smoke, model_code=BYD2-003
CONTEXT:  PL/pgSQL function fn_runtime_execution_create_request(text,text,text,text,text,text,text,text,text) line 31 at RAISE
PL/pgSQL function fn_runtime_execution_create_request_with_route_v1(text,text,text,text,text,text,text,text,text,text) line 5 at assignment

```
--- hit line 5 ---
    1: ============================================================
    2: POST R10 TASK DOMAIN
    3: ============================================================
    4: ROUTE=/aiworker/v1/runtime-execution/request
    5: STATUS=500
    6: AUTH_HEADER=Bearer ***MASKED***
    7: IDEMPOTENCY_KEY=***SET***
    8: APP_SURFACE_CODE=cx22073jw_direct_smoke
    9: AUTH_FAIL=NO
--- hit line 19 ---
   15: RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053508_b6r95r3z_r10_task_domain_code_retry_to_zip/042_post_response.json
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "INTERNAL_ERROR",
   20:   "message": "ERROR:  Runtime control profile not found: app_surface_code=cx22073jw_direct_smoke, model_code=BYD2-003\nCONTEXT:  PL/pgSQL function fn_runtime_execution_create_request(text,text,text,text,text,text,text,text,text) line 31 at RAISE\nPL/pgSQL function fn_runtime_execution_create_request_with_route_v1(text,text,text,text,text,text,text,text,text,text) line 5 at assignment",
   21:   "safety": {
   22:     "external_execution_performed_flag": false,
   23:     "pg_apply_performed_flag": false,
--- hit line 20 ---
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "INTERNAL_ERROR",
   20:   "message": "ERROR:  Runtime control profile not found: app_surface_code=cx22073jw_direct_smoke, model_code=BYD2-003\nCONTEXT:  PL/pgSQL function fn_runtime_execution_create_request(text,text,text,text,text,text,text,text,text) line 31 at RAISE\nPL/pgSQL function fn_runtime_execution_create_request_with_route_v1(text,text,text,text,text,text,text,text,text,text) line 5 at assignment",
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
   32:   "error_code": "INTERNAL_ERROR",
--- hit line 32 ---
   28: DIAGNOSIS=POST_STATUS_NOT_2XX
   29: 
   30: {
   31:   "result": "error",
   32:   "error_code": "INTERNAL_ERROR",
   33:   "message": "ERROR:  Runtime control profile not found: app_surface_code=cx22073jw_direct_smoke, model_code=BYD2-003\nCONTEXT:  PL/pgSQL function fn_runtime_execution_create_request(text,text,text,text,text,text,text,text,text) line 31 at RAISE\nPL/pgSQL function fn_runtime_execution_create_request_with_route_v1(text,text,text,text,text,text,text,text,text,text) line 5 at assignment",
   34:   "safety": {
   35:     "external_execution_performed_flag": false,
   36:     "pg_apply_performed_flag": false,
--- hit line 33 ---
   29: 
   30: {
   31:   "result": "error",
   32:   "error_code": "INTERNAL_ERROR",
   33:   "message": "ERROR:  Runtime control profile not found: app_surface_code=cx22073jw_direct_smoke, model_code=BYD2-003\nCONTEXT:  PL/pgSQL function fn_runtime_execution_create_request(text,text,text,text,text,text,text,text,text) line 31 at RAISE\nPL/pgSQL function fn_runtime_execution_create_request_with_route_v1(text,text,text,text,text,text,text,text,text,text) line 5 at assignment",
   34:   "safety": {
   35:     "external_execution_performed_flag": false,
   36:     "pg_apply_performed_flag": false,
   37:     "destructive_action_performed_flag": false
```