# B6R95R3Z-R4 POST Non-2xx Deep Diagnosis Report

RUN_TS=20260509_052333
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052333_b6r95r3z_r4_post_non_2xx_deep_diagnosis
PREV_R3_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- HTTP_GET=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Scope
Deeply diagnose R3 POST non-2xx before retrying or patching.

## R3 non-2xx analysis
```
============================================================
R3 POST NON-2XX DEEP ANALYSIS
============================================================
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/072_post_response.json
POST_LOG_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/071_post_payload_compat.log
SERVER_LOG_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/030_runtime_server.log
JSON_PARSE=PASS
HTTP_STATUS=400
ERROR_CODE=BAD_REQUEST
MESSAGE=Idempotency-Key is required
AUTH_FAIL_HINT=NO
FORBIDDEN_HINT=NO
NOT_FOUND_HINT=NO
BAD_REQUEST_HINT=YES
UNSUPPORTED_HINT=NO
SERVER_ERROR_HINT=NO
INTERESTING_RESPONSE_FIELDS_BEGIN
$.result=error
$.error_code=BAD_REQUEST
$.message=Idempotency-Key is required
INTERESTING_RESPONSE_FIELDS_END
MISSING_FIELD_CANDIDATES_BEGIN
safety
MISSING_FIELD_CANDIDATES_END
POST_LOG_EXCERPT_BEGIN
============================================================
POST PAYLOAD COMPAT TO AIWORKEROS
============================================================
ROUTE=/aiworker/v1/runtime-execution/request
STATUS=400
AUTH_FAIL=NO
HAS_SUMMARY=NO
HAS_ZIP_HINT=NO
HAS_GENERATED_ARTIFACTS=NO
HAS_TAIKA_TEXT=NO
LOOKS_REQUEST_ONLY=NO
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/072_post_response.json
BODY_HEAD_BEGIN
{
  "result": "error",
  "error_code": "BAD_REQUEST",
  "message": "Idempotency-Key is required",
  "safety": {
    "external_execution_performed_flag": false,
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false
  }
}
BODY_HEAD_END
DIAGNOSIS=POST_STATUS_NOT_2XX

POST_LOG_EXCERPT_END
RESPONSE_BODY_BEGIN
{
  "result": "error",
  "error_code": "BAD_REQUEST",
  "message": "Idempotency-Key is required",
  "safety": {
    "external_execution_performed_flag": false,
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false
  }
}
RESPONSE_BODY_END
SERVER_LOG_TAIL_BEGIN
AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:8787

SERVER_LOG_TAIL_END
DIAGNOSIS=BAD_REQUEST_OR_PAYLOAD_VALIDATION
```

## Handler / contract extract
```
============================================================
HANDLER AND CONTRACT EXTRACT
============================================================
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request
ROUTE_HIT_COUNT=1
------------------------------------------------------------
ROUTE_BLOCK_1_BEGIN line=1085-1216
 1085:     output_payload_jsonb: JSON.stringify(deliverable.outputPayload),
 1086:     artifacts_jsonb: JSON.stringify(deliverable.artifacts)
 1087:   });
 1088: 
 1089:   return aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable);
 1090: }
 1091: 
 1092: const server = http.createServer(async (req, res) => {
 1093:   const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
 1094: 
 1095:   try {
 1096:     if (req.method === "GET" && url.pathname === "/health") {
 1097:       return sendJson(res, 200, {
 1098:         ok: true,
 1099:         service: "aiworker-runtime-execution-http-api",
 1100:         db: "PERSONA_DATABASE_URL",
 1101:         external_execution: false,
 1102:         pg_apply: false,
 1103:         destructive_action: false
 1104:       });
 1105:     }
 1106: 
 1107:     if (!requireAuth(req)) {
 1108:       return sendJson(res, 401, {
 1109:         result: "error",
 1110:         error_code: "UNAUTHORIZED",
 1111:         message: "Missing or invalid Authorization bearer token."
 1112:       });
 1113:     }
 1114: 
 1115:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/endpoint-ready") {
 1116:       return sendJson(res, 200, { result: "ok", data: endpointReady() });
 1117:     }
 1118: 
 1119:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/api-contract") {
 1120:       return sendJson(res, 200, { result: "ok", data: apiContracts() });
 1121:     }
 1122: 
 1123:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/persistent-smoke") {
 1124:       return sendJson(res, 200, { result: "ok", data: persistentSmoke() });
 1125:     }
 1126: 
 1127:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/pipeline-board") {
 1128:       return sendJson(res, 200, { result: "ok", data: pipelineBoard(url.searchParams) });
 1129:     }
 1130: 
 1131:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/app-read-payload") {
 1132:       return sendJson(res, 200, { result: "ok", data: appReadPayload(url.searchParams) });
 1133:     }
 1134: 
 1135:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/delivery") {
 1136:       return sendJson(res, 200, { result: "ok", data: deliveryBoard(url.searchParams) });
 1137:     }
 1138: 
 1139: 
 1140:     // BRAIN_CONTEXT_BRIDGE_ROUTE_V1
 1141:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/brain-context") {
 1142:       const modelCode = url.searchParams.get("model_code") || url.searchParams.get("modelCode") || "";
 1143:       const usePurposeCode =
 1144:         url.searchParams.get("use_purpose_code") ||
 1145:         url.searchParams.get("purpose_code") ||
 1146:         url.searchParams.get("task_domain_code") ||
 1147:         "reference";
 1148:       const domainsRaw = url.searchParams.get("domains") || "";
 1149:       const domainCodes = domainsRaw
 1150:         ? domainsRaw.split(",").map((value) => value.trim()).filter(Boolean)
 1151:         : [];
 1152:       const includeMissingSources =
 1153:         url.searchParams.get("include_missing_sources") === "true" ||
 1154:         url.searchParams.get("includeMissingSources") === "true";
 1155: 
 1156:       const brainContext = buildRuntimeBrainContext({
 1157:         modelCode,
 1158:         usePurposeCode,
 1159:         domainCodes,
 1160:         includeMissingSources
 1161:       });
 1162: 
 1163:       return sendJson(res, 200, {
 1164:         result: "ok",
 1165:         external_execution_performed_flag: false,
 1166:         data: {
 1167:           model_code: modelCode,
 1168:           use_purpose_code: brainContext.purposeCode,
 1169:           brain_context: brainContext,
 1170:           prompt_brain_context: renderPromptBrainContext(brainContext)
 1171:         }
 1172:       });
 1173:     }
 1174: 
 1175:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
 1176:       const bodyText = await readBody(req);
 1177:       let payload;
 1178:       try {
 1179:         payload = bodyText ? JSON.parse(bodyText) : {};
 1180:       } catch (e) {
 1181:         return sendJson(res, 400, {
 1182:           result: "error",
 1183:           error_code: "INVALID_JSON",
 1184:           message: "Request body must be valid JSON."
 1185:         });
 1186:       }
 1187: 
 1188:       const idempotencyKey = req.headers["idempotency-key"] || "";
 1189:       const result = createRuntimeRequest(payload, idempotencyKey);
 1190:       return sendJson(res, 201, result);
 1191:     }
 1192: 
 1193:     return sendJson(res, 404, {
 1194:       result: "error",
 1195:       error_code: "NOT_FOUND",
 1196:       path: url.pathname
 1197:     });
 1198:   } catch (err) {
 1199:     const status = err.httpStatus || 500;
 1200:     return sendJson(res, status, {
 1201:       result: "error",
 1202:       error_code: status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR",
 1203:       message: err.message,
 1204:       safety: {
 1205:         external_execution_performed_flag: false,
 1206:         pg_apply_performed_flag: false,
 1207:         destructive_action_performed_flag: false
 1208:       }
 1209:     });
 1210:   }
 1211: });
 1212: 
 1213: server.listen(port, "127.0.0.1", () => {
 1214:   console.log(`AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:${port}`);
 1215: });
 1216: 
ROUTE_BLOCK_1_END
ALL_RELEVANT_ROUTES_BEGIN
/aiworker/v1/runtime-execution/api-contract
/aiworker/v1/runtime-execution/app-read-payload
/aiworker/v1/runtime-execution/brain-context
/aiworker/v1/runtime-execution/delivery
/aiworker/v1/runtime-execution/endpoint-ready
/aiworker/v1/runtime-execution/persistent-smoke
/aiworker/v1/runtime-execution/pipeline-board
/aiworker/v1/runtime-execution/request
ALL_RELEVANT_ROUTES_END
BODY_KEY_HINTS_BEGIN
BODY_KEY_HINTS_END
SELECTED_ROUTE_HAS_POST_GATE=YES
SELECTED_ROUTE_LOOKS_CREATE_ONLY=NO
SELECTED_ROUTE_LOOKS_ZIP_EXECUTION=NO
EXECUTE_OR_ZIP_ROUTE_CANDIDATES_BEGIN
/aiworker/v1/runtime-execution/api-contract
/aiworker/v1/runtime-execution/app-read-payload
/aiworker/v1/runtime-execution/brain-context
/aiworker/v1/runtime-execution/delivery
/aiworker/v1/runtime-execution/endpoint-ready
/aiworker/v1/runtime-execution/persistent-smoke
/aiworker/v1/runtime-execution/pipeline-board
/aiworker/v1/runtime-execution/request
EXECUTE_OR_ZIP_ROUTE_CANDIDATES_END
```

## Payload compare
```
============================================================
PAYLOAD VS HANDLER COMPARE
============================================================
PAYLOAD_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/060_payload_compat.json
HTTP_STATUS=400
ERROR_CODE=BAD_REQUEST
MESSAGE=Idempotency-Key is required
RESPONSE_DIAGNOSIS=POST_STATUS_NOT_2XX
SELECTED_ROUTE_LOOKS_CREATE_ONLY=NO
SELECTED_ROUTE_LOOKS_ZIP_EXECUTION=NO
PAYLOAD_TOP_KEYS_BEGIN
auto_execute
body
brain_domain_codes
create_zip_flag
deliverable_zip_required_flag
domain_codes
domains
dry_run
execute_now
execution_id
external_request_id
generate_zip_flag
input_json
instruction
instruction_ja
language_code
limit_per_domain
model_code
output_format
output_language
payload
prompt
prompt_ja
purpose_code
request
request_code
request_id
request_payload
request_source_code
requested_output_format
requested_outputs
requester_app_code
requester_route_code
return_summary_flag
return_zip_link_flag
robot_code
robot_model_code
run_now
runtime_request
runtime_request_id
safety
selected_robot_model_code
source_app_code
source_route_code
task_instruction
task_instruction_ja
task_purpose_code
task_title
task_title_ja
test_metadata
title
total_limit
use_purpose_code
user_instruction
user_instruction_ja
zip_required_flag
PAYLOAD_TOP_KEYS_END
HANDLER_BODY_KEY_HINTS_BEGIN
HANDLER_BODY_KEY_HINTS_END
MISSING_FIELD_CANDIDATES_BEGIN
safety
MISSING_FIELD_CANDIDATES_END
MISSING_FROM_TOP_PAYLOAD_BEGIN
MISSING_FROM_TOP_PAYLOAD_END
MISSING_FROM_NESTED_PAYLOAD_BEGIN
MISSING_FROM_NESTED_PAYLOAD_END
NEXT_RECOMMENDATION=SELECTED_ROUTE_NOT_ZIP_EXECUTION_ROUTE
```

## Next plan
```
# B6R95R3Z-R5 Exact Next Plan

## R4で見ること

- R3 POSTの HTTP_STATUS
- ERROR_CODE
- MESSAGE
- selected route handler が request作成専用か
- handler上の要求body key
- payloadに不足しているkey
- execute/run/zip route候補

## 分岐

### NEXT_RECOMMENDATION=PAYLOAD_MISSING_FIELDS
R5:
- 不足fieldだけを追加した最小payloadで再POST
- routeは同じ /aiworker/v1/runtime-execution/request

### NEXT_RECOMMENDATION=REQUEST_CREATE_ONLY_USE_EXECUTE_ROUTE
R5:
- request作成routeではなく execute/run/workflow route を使う
- もしくは request作成 -> returned request_id -> execute の二段階にする

### NEXT_RECOMMENDATION=USE_DIFFERENT_ROUTE
R5:
- /aiworker/v1/runtime-execution/request は違う
- route候補から live-aiworkeros-call / workflow-start / execute / run を選ぶ

### NEXT_RECOMMENDATION=SERVER_LOG_ERROR_DIAGNOSIS
R5:
- server log stack/error line を基に最小修正案を出す
- patchが必要なら明示確認を分ける

## 禁止

- R4ではPOSTしない
- R4ではpatchしない
- R4ではDB writeしない
- AICMに触らない
```

## AICM touch check
```
AICM_BASE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052333_b6r95r3z_r4_post_non_2xx_deep_diagnosis/000_start_marker
```

## Runtime touch check
```
AIWORKER_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os
START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052333_b6r95r3z_r4_post_non_2xx_deep_diagnosis/000_start_marker
```

## Secret scan
```
Scan generated diagnosis files only
```
FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R4_DIAGNOSIS_DONE_NEXT_UNKNOWN
NEXT=B6R95R3Z-R5: R4のNEXT_RECOMMENDATIONに従って、最小payload再POSTまたはexecute route二段階テスト。
