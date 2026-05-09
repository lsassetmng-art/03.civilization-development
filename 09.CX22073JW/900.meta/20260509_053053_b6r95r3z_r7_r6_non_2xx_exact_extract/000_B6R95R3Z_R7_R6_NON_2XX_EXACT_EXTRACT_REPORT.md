# B6R95R3Z-R7 R6 Non-2xx Exact Extract Report

RUN_TS=20260509_053053
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053053_b6r95r3z_r7_r6_non_2xx_exact_extract
PREV_R6_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- HTTP_GET=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Compact extract path
```
/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053053_b6r95r3z_r7_r6_non_2xx_exact_extract/020_R6_NON_2XX_EXACT_EXTRACT.md
```

## Compact extract head
```
# B6R95R3Z-R7 R6 Non-2xx Exact Extract

PREV_R6_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request
HTTP_STATUS=400
ERROR_CODE=BAD_REQUEST
MESSAGE=Missing required field: app_surface_code
AUTO_DIAGNOSIS=AUTH_FAIL

## 次に見る場所
- 1_EXACT_ERROR_LINES
- 2_RESPONSE_JSON_SUMMARY
- 4_SELECTED_ROUTE_HANDLER_CONTEXT
- 6_ROUTE_CANDIDATES


# 1_EXACT_ERROR_LINES

```
--- hit line 2 ---
    1: ============================================================
    2: POST WITH IDEMPOTENCY KEY
    3: ============================================================
    4: ROUTE=/aiworker/v1/runtime-execution/request
    5: STATUS=400
    6: AUTH_HEADER=Bearer ***MASKED***
--- hit line 5 ---
    1: ============================================================
    2: POST WITH IDEMPOTENCY KEY
    3: ============================================================
    4: ROUTE=/aiworker/v1/runtime-execution/request
    5: STATUS=400
    6: AUTH_HEADER=Bearer ***MASKED***
    7: IDEMPOTENCY_KEY=***SET***
    8: AUTH_FAIL=NO
    9: IDEMPOTENCY_FAIL=NO
--- hit line 7 ---
    3: ============================================================
    4: ROUTE=/aiworker/v1/runtime-execution/request
    5: STATUS=400
    6: AUTH_HEADER=Bearer ***MASKED***
    7: IDEMPOTENCY_KEY=***SET***
    8: AUTH_FAIL=NO
    9: IDEMPOTENCY_FAIL=NO
   10: HAS_SUMMARY=NO
   11: HAS_ZIP_HINT=NO
--- hit line 9 ---
    5: STATUS=400
    6: AUTH_HEADER=Bearer ***MASKED***
    7: IDEMPOTENCY_KEY=***SET***
    8: AUTH_FAIL=NO
    9: IDEMPOTENCY_FAIL=NO
   10: HAS_SUMMARY=NO
   11: HAS_ZIP_HINT=NO
   12: HAS_GENERATED_ARTIFACTS=NO
   13: HAS_TAIKA_TEXT=NO
--- hit line 15 ---
   11: HAS_ZIP_HINT=NO
   12: HAS_GENERATED_ARTIFACTS=NO
   13: HAS_TAIKA_TEXT=NO
   14: LOOKS_REQUEST_ONLY=NO
   15: RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip/052_post_response.json
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "BAD_REQUEST",
--- hit line 19 ---
   15: RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip/052_post_response.json
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "BAD_REQUEST",
   20:   "message": "Missing required field: app_surface_code",
   21:   "safety": {
   22:     "external_execution_performed_flag": false,
   23:     "pg_apply_performed_flag": false,
--- hit line 20 ---
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "BAD_REQUEST",
   20:   "message": "Missing required field: app_surface_code",
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
   33:   "message": "Missing required field: app_surface_code",
   34:   "safety": {
   35:     "external_execution_performed_flag": false,
   36:     "pg_apply_performed_flag": false,
--- hit line 33 ---
   29: 
   30: {
   31:   "result": "error",
   32:   "error_code": "BAD_REQUEST",
   33:   "message": "Missing required field: app_surface_code",
   34:   "safety": {
   35:     "external_execution_performed_flag": false,
   36:     "pg_apply_performed_flag": false,
   37:     "destructive_action_performed_flag": false
--- hit line 47 ---
   43: 
   44: SELECTED_ROUTE=/aiworker/v1/runtime-execution/request
   45: 
   46: ## POST key result
   47: STATUS=400
   48: HAS_ZIP_HINT=NO
   49: HAS_GENERATED_ARTIFACTS=NO
   50: LOOKS_REQUEST_ONLY=NO
   51: RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip/052_post_response.json
--- hit line 51 ---
   47: STATUS=400
   48: HAS_ZIP_HINT=NO
   49: HAS_GENERATED_ARTIFACTS=NO
   50: LOOKS_REQUEST_ONLY=NO
   51: RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip/052_post_response.json
   52: DIAGNOSIS=POST_STATUS_NOT_2XX
   53: 
   54: ## Candidate route lines
   55: 414:  Common requester-facing deliverable contract for AIWorkerOS runtime execution.
--- hit line 52 ---
   48: HAS_ZIP_HINT=NO
   49: HAS_GENERATED_ARTIFACTS=NO
   50: LOOKS_REQUEST_ONLY=NO
   51: RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip/052_post_response.json
   52: DIAGNOSIS=POST_STATUS_NOT_2XX
   53: 
   54: ## Candidate route lines
   55: 414:  Common requester-facing deliverable contract for AIWorkerOS runtime execution.
   56: 419:  - AIWorkerOS creates the deliverable body and first summary.
--- hit line 125 ---
  121: 874:    contract_name: "aiworkeros_common_requester_multi_artifact_zip_contract",
  122: 875:    package_purpose: "bundle_generated_artifacts_for_single_download",
  123: 878:    deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
  124: 881:    generated_artifacts: generatedArtifacts.map((artifact) => ({
  125: 888:    deliverable_ref: response.deliverable_ref || null,
  126: 889:    robot_context: response.robot_context || deliverable?.robotContext || null,
  127: 890:    generation_basis: response.generation_basis || deliverable?.generationBasis || null,
  128: 904:  const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  129: 905:  fs.writeFileSync(zipPath, zipBuffer);
--- hit line 126 ---
  122: 875:    package_purpose: "bundle_generated_artifacts_for_single_download",
  123: 878:    deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
  124: 881:    generated_artifacts: generatedArtifacts.map((artifact) => ({
  125: 888:    deliverable_ref: response.deliverable_ref || null,
  126: 889:    robot_context: response.robot_context || deliverable?.robotContext || null,
  127: 890:    generation_basis: response.generation_basis || deliverable?.generationBasis || null,
  128: 904:  const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  129: 905:  fs.writeFileSync(zipPath, zipBuffer);
  130: 906:  const stat = fs.statSync(zipPath);
--- hit line 127 ---
  123: 878:    deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
  124: 881:    generated_artifacts: generatedArtifacts.map((artifact) => ({
  125: 888:    deliverable_ref: response.deliverable_ref || null,
  126: 889:    robot_context: response.robot_context || deliverable?.robotContext || null,
  127: 890:    generation_basis: response.generation_basis || deliverable?.generationBasis || null,
  128: 904:  const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  129: 905:  fs.writeFileSync(zipPath, zipBuffer);
  130: 906:  const stat = fs.statSync(zipPath);
  131: 908:  const zipPublic = {
```



# 2_RESPONSE_JSON_SUMMARY

```
JSON_PARSE=PASS
INTERESTING_FIELDS_BEGIN
$.result=error
$.error_code=BAD_REQUEST
$.message=Missing required field: app_surface_code
INTERESTING_FIELDS_END

RAW_HEAD:
{
  "result": "error",
  "error_code": "BAD_REQUEST",
  "message": "Missing required field: app_surface_code",
  "safety": {
    "external_execution_performed_flag": false,
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false
  }
}
```



# 3_POST_LOG_HEAD

```
============================================================
POST WITH IDEMPOTENCY KEY
============================================================
ROUTE=/aiworker/v1/runtime-execution/request
STATUS=400
AUTH_HEADER=Bearer ***MASKED***
IDEMPOTENCY_KEY=***SET***
AUTH_FAIL=NO
IDEMPOTENCY_FAIL=NO
HAS_SUMMARY=NO
HAS_ZIP_HINT=NO
HAS_GENERATED_ARTIFACTS=NO
HAS_TAIKA_TEXT=NO
LOOKS_REQUEST_ONLY=NO
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip/052_post_response.json
BODY_HEAD_BEGIN
{
  "result": "error",
  "error_code": "BAD_REQUEST",
  "message": "Missing required field: app_surface_code",
  "safety": {
    "external_execution_performed_flag": false,
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false
  }
}
BODY_HEAD_END
DIAGNOSIS=POST_STATUS_NOT_2XX

```


```

## AICM touch check
```
AICM_BASE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053053_b6r95r3z_r7_r6_non_2xx_exact_extract/000_start_marker
```

## Runtime touch check
```
AIWORKER_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os
START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053053_b6r95r3z_r7_r6_non_2xx_exact_extract/000_start_marker
```

## Secret scan
```
Scan compact extract only
```
FINAL_STATUS=B6R95R3Z_R7_R6_NON_2XX_EXACT_EXTRACT_PASS_REVIEW_REQUIRED
NEXT=COMPACT_REPORTの先頭240行を貼って、R8で最小対応を決める。
