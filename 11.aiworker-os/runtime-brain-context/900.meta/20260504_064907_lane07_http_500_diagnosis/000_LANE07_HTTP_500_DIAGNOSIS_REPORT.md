# Lane07 HTTP 500 Diagnosis Report

RUN_TS=20260504_064907
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064907_lane07_http_500_diagnosis
DB_WRITE=NO
FILE_PATCH=NO
AICM_TOUCH=NO

## Files
- SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
- BRIDGE_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/brain-context-bridge.js

## Outputs
- SERVER_GREP=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064907_lane07_http_500_diagnosis/010_server_bridge_grep.txt
- BRIDGE_GREP=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064907_lane07_http_500_diagnosis/020_bridge_exports_grep.txt
- DIRECT_LOG=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064907_lane07_http_500_diagnosis/031_direct_bridge_call_test.log
- HTTP_LOG=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064907_lane07_http_500_diagnosis/041_http_500_raw_diagnosis.log
- HTTP_RAW=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064907_lane07_http_500_diagnosis/042_http_raw_output.txt

## Status
FINAL_STATUS=LANE07_HTTP_500_DIAGNOSIS_DONE_REVIEW_REQUIRED
NEXT=Patch exact server/bridge mismatch based on raw 500 body

## Server grep
```
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js

2:const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
317:    if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/brain-context") {
332:      const brainContext = buildRuntimeBrainContext({
344:          use_purpose_code: brainContext.purposeCode,
345:          brain_context: brainContext,
346:          prompt_brain_context: renderPromptBrainContext(brainContext)
```

## Bridge grep
```
BRIDGE_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/brain-context-bridge.js

3:const PROVIDER_VERSION = "lane07-selector-v1";
121:function buildBrainContext(input = {}) {
179:  'providerVersion', ${sqlText(PROVIDER_VERSION)},
218:  lines.push(`provider_version=${context.providerVersion || PROVIDER_VERSION}`);
248:function buildBrainContextPayload(input = {}) {
251:    brain_context: buildBrainContext(input),
255:function createBrainContextPayload(input = {}) {
256:  return buildBrainContextPayload(input);
259:function getBrainContext(input = {}) {
260:  return buildBrainContext(input);
263:function getRuntimeBrainContext(input = {}) {
264:  return buildBrainContext(input);
267:function buildRuntimeBrainContext(input = {}) {
268:  return buildBrainContext(input);
271:function resolveBrainContext(input = {}) {
272:  return buildBrainContext(input);
276:  return buildBrainContext(input);
279:bridge.buildBrainContext = buildBrainContext;
280:bridge.getBrainContext = getBrainContext;
284:bridge.buildBrainContextPayload = buildBrainContextPayload;
290:module.exports = bridge;
```

## Direct bridge call
```
BRIDGE_TYPE function
BRIDGE_KEYS PROVIDER_VERSION,SELECTOR_FUNCTION,buildBrainContext,buildBrainContextPayload,buildRuntimeBrainContext,createBrainContextPayload,getBrainContext,getRuntimeBrainContext,renderPromptContext,resolveBrainContext
PASS default_function_bridge
  type=object
  providerVersion=lane07-selector-v1
  selectorFunction=aiworker.fn_robot_brain_runtime_material_select_v1
  materialCount=80
  srcmatCount=24
  lane05Count=52
  pack05Count=4
PASS buildBrainContext
  type=object
  providerVersion=lane07-selector-v1
  selectorFunction=aiworker.fn_robot_brain_runtime_material_select_v1
  materialCount=80
  srcmatCount=24
  lane05Count=52
  pack05Count=4
PASS getBrainContext
  type=object
  providerVersion=lane07-selector-v1
  selectorFunction=aiworker.fn_robot_brain_runtime_material_select_v1
  materialCount=80
  srcmatCount=24
  lane05Count=52
  pack05Count=4
PASS getRuntimeBrainContext
  type=object
  providerVersion=lane07-selector-v1
  selectorFunction=aiworker.fn_robot_brain_runtime_material_select_v1
  materialCount=80
  srcmatCount=24
  lane05Count=52
  pack05Count=4
PASS buildRuntimeBrainContext
  type=object
  providerVersion=lane07-selector-v1
  selectorFunction=aiworker.fn_robot_brain_runtime_material_select_v1
  materialCount=80
  srcmatCount=24
  lane05Count=52
  pack05Count=4
PASS resolveBrainContext
  type=object
  providerVersion=lane07-selector-v1
  selectorFunction=aiworker.fn_robot_brain_runtime_material_select_v1
  materialCount=80
  srcmatCount=24
  lane05Count=52
  pack05Count=4
PASS buildBrainContextPayload
  type=object
  providerVersion=lane07-selector-v1
  selectorFunction=aiworker.fn_robot_brain_runtime_material_select_v1
  materialCount=80
  srcmatCount=24
  lane05Count=52
  pack05Count=4
PASS createBrainContextPayload
  type=object
  providerVersion=lane07-selector-v1
  selectorFunction=aiworker.fn_robot_brain_runtime_material_select_v1
  materialCount=80
  srcmatCount=24
  lane05Count=52
  pack05Count=4
```

## HTTP raw diagnosis
```
DETECTED_PORT=8787
============================================================
PATH=/aiworker/v1/runtime-execution/endpoint-ready
STATUS=200
BODY_BEGIN
{
  "result": "ok",
  "data": {
    "contract_count": 4,
    "all_auth_required": true,
    "read_endpoint_count": 3,
    "all_pg_apply_blocked": true,
    "write_endpoint_count": 1,
    "latest_contract_updated_at": "2026-04-29T02:26:06.155112+00:00",
    "internal_write_endpoint_count": 1,
    "all_destructive_action_blocked": true,
    "all_external_execution_blocked": true
  }
}
BODY_END
============================================================
PATH=/aiworker/v1/runtime-execution/brain-context?model_code=BYD2-003&use_purpose_code=review&purpose_code=review&domains=history_worldview%2Ccivilization_foundation_history%2Ceducation_learning%2Cexam_learning&limit_per_domain=20&total_limit=80
STATUS=500
BODY_BEGIN
{
  "result": "error",
  "error_code": "INTERNAL_ERROR",
  "message": "renderPromptBrainContext is not a function",
  "safety": {
    "external_execution_performed_flag": false,
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false
  }
}
BODY_END
============================================================
PATH=/aiworker/v1/runtime-execution/brain-context?model_code=HD-R5P&use_purpose_code=executive_planning&purpose_code=executive_planning&domains=business_operation%2Ccivilization_foundation_history%2Crobot_aiworker&limit_per_domain=20&total_limit=80
STATUS=500
BODY_BEGIN
{
  "result": "error",
  "error_code": "INTERNAL_ERROR",
  "message": "renderPromptBrainContext is not a function",
  "safety": {
    "external_execution_performed_flag": false,
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false
  }
}
BODY_END
============================================================
SERVER_OUTPUT_BEGIN
AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:8787
SERVER_OUTPUT_END
```
