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
  111: ============================================================
  112: PAYLOAD_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/060_payload_compat.json
  113: HTTP_STATUS=400
  114: ERROR_CODE=BAD_REQUEST
  115: MESSAGE=Idempotency-Key is required
  116: RESPONSE_DIAGNOSIS=POST_STATUS_NOT_2XX
  117: SELECTED_ROUTE_LOOKS_CREATE_ONLY=NO
--- hit line 115 ---
  112: PAYLOAD_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052036_b6r95r3z_r3_payload_compat_retry/060_payload_compat.json
  113: HTTP_STATUS=400
  114: ERROR_CODE=BAD_REQUEST
  115: MESSAGE=Idempotency-Key is required
  116: RESPONSE_DIAGNOSIS=POST_STATUS_NOT_2XX
  117: SELECTED_ROUTE_LOOKS_CREATE_ONLY=NO
  118: SELECTED_ROUTE_LOOKS_ZIP_EXECUTION=NO
--- hit line 116 ---
  113: HTTP_STATUS=400
  114: ERROR_CODE=BAD_REQUEST
  115: MESSAGE=Idempotency-Key is required
  116: RESPONSE_DIAGNOSIS=POST_STATUS_NOT_2XX
  117: SELECTED_ROUTE_LOOKS_CREATE_ONLY=NO
  118: SELECTED_ROUTE_LOOKS_ZIP_EXECUTION=NO
  119: PAYLOAD_TOP_KEYS_BEGIN
--- hit line 124 ---
  121: body
  122: brain_domain_codes
  123: create_zip_flag
  124: deliverable_zip_required_flag
  125: domain_codes
  126: domains
  127: dry_run
--- hit line 175 ---
  172: use_purpose_code
  173: user_instruction
  174: user_instruction_ja
  175: zip_required_flag
  176: PAYLOAD_TOP_KEYS_END
  177: HANDLER_BODY_KEY_HINTS_BEGIN
  178: HANDLER_BODY_KEY_HINTS_END
--- hit line 179 ---
  176: PAYLOAD_TOP_KEYS_END
  177: HANDLER_BODY_KEY_HINTS_BEGIN
  178: HANDLER_BODY_KEY_HINTS_END
  179: MISSING_FIELD_CANDIDATES_BEGIN
  180: safety
  181: MISSING_FIELD_CANDIDATES_END
  182: MISSING_FROM_TOP_PAYLOAD_BEGIN
--- hit line 181 ---
  178: HANDLER_BODY_KEY_HINTS_END
  179: MISSING_FIELD_CANDIDATES_BEGIN
  180: safety
  181: MISSING_FIELD_CANDIDATES_END
  182: MISSING_FROM_TOP_PAYLOAD_BEGIN
  183: MISSING_FROM_TOP_PAYLOAD_END
  184: MISSING_FROM_NESTED_PAYLOAD_BEGIN
--- hit line 182 ---
  179: MISSING_FIELD_CANDIDATES_BEGIN
  180: safety
  181: MISSING_FIELD_CANDIDATES_END
  182: MISSING_FROM_TOP_PAYLOAD_BEGIN
  183: MISSING_FROM_TOP_PAYLOAD_END
  184: MISSING_FROM_NESTED_PAYLOAD_BEGIN
  185: MISSING_FROM_NESTED_PAYLOAD_END
--- hit line 183 ---
  180: safety
  181: MISSING_FIELD_CANDIDATES_END
  182: MISSING_FROM_TOP_PAYLOAD_BEGIN
  183: MISSING_FROM_TOP_PAYLOAD_END
  184: MISSING_FROM_NESTED_PAYLOAD_BEGIN
  185: MISSING_FROM_NESTED_PAYLOAD_END
  186: NEXT_RECOMMENDATION=SELECTED_ROUTE_NOT_ZIP_EXECUTION_ROUTE
--- hit line 184 ---
  181: MISSING_FIELD_CANDIDATES_END
  182: MISSING_FROM_TOP_PAYLOAD_BEGIN
  183: MISSING_FROM_TOP_PAYLOAD_END
  184: MISSING_FROM_NESTED_PAYLOAD_BEGIN
  185: MISSING_FROM_NESTED_PAYLOAD_END
  186: NEXT_RECOMMENDATION=SELECTED_ROUTE_NOT_ZIP_EXECUTION_ROUTE
  187: 
--- hit line 185 ---
  182: MISSING_FROM_TOP_PAYLOAD_BEGIN
  183: MISSING_FROM_TOP_PAYLOAD_END
  184: MISSING_FROM_NESTED_PAYLOAD_BEGIN
  185: MISSING_FROM_NESTED_PAYLOAD_END
  186: NEXT_RECOMMENDATION=SELECTED_ROUTE_NOT_ZIP_EXECUTION_ROUTE
  187: 
```



# 2_RESPONSE_JSON_SUMMARY

```
JSON_PARSE=PASS
INTERESTING_FIELDS:
$.result=error
$.error_code=BAD_REQUEST
$.message=Idempotency-Key is required

RAW_HEAD:
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
```



# 3_POST_LOG_HEAD

```
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

```



# 4_PAYLOAD_SUMMARY

```
PAYLOAD_JSON_PARSE=PASS
TOP_KEYS=auto_execute,body,brain_domain_codes,create_zip_flag,deliverable_zip_required_flag,domain_codes,domains,dry_run,execute_now,execution_id,external_request_id,generate_zip_flag,input_json,instruction,instruction_ja,language_code,limit_per_domain,model_code,output_format,output_language,payload,prompt,prompt_ja,purpose_code,request,request_code,request_id,request_payload,request_source_code,requested_output_format,requested_outputs,requester_app_code,requester_route_code,return_summary_flag,return_zip_link_flag,robot_code,robot_model_code,run_now,runtime_request,runtime_request_id,safety,selected_robot_model_code,source_app_code,source_route_code,task_instruction,task_instruction_ja,task_purpose_code,task_title,task_title_ja,test_metadata,title,total_limit,use_purpose_code,user_instruction,user_instruction_ja,zip_required_flag
request_id=B6R95R3Z_R3_TAIKA_PAYLOAD_COMPAT_20260509_052036
model_code=BYD2-003
task_instruction_ja=CX22073JWの大化の改新 source-backed runtime material を参照し、出典注意、誤解防止、時系列、人物、制度、公地公民、改新の詔、律令国家形成への接続を含む詳細資料を作成してください。成果物本文、summary_text、generated_artifacts、納品zipを作成し、zip linkを返してください。
input_json_keys=auto_execute,brain_domain_codes,create_zip_flag,deliverable_zip_required_flag,domain_codes,domains,dry_run,execute_now,execution_id,external_request_id,generate_zip_flag,instruction,instruction_ja,language_code,limit_per_domain,model_code,output_format,output_language,prompt,prompt_ja,purpose_code,request_code,request_id,request_source_code,requested_output_format,requested_outputs,requester_app_code,requester_route_code,return_summary_flag,return_zip_link_flag,robot_code,robot_model_code,run_now,runtime_request_id,safety,selected_robot_model_code,source_app_code,source_route_code,task_instruction,task_instruction_ja,task_purpose_code,task_title,task_title_ja,test_metadata,title,total_limit,use_purpose_code,user_instruction,user_instruction_ja,zip_required_flag
request_payload_keys=auto_execute,brain_domain_codes,create_zip_flag,deliverable_zip_required_flag,domain_codes,domains,dry_run,execute_now,execution_id,external_request_id,generate_zip_flag,instruction,instruction_ja,language_code,limit_per_domain,model_code,output_format,output_language,prompt,prompt_ja,purpose_code,request_code,request_id,request_source_code,requested_output_format,requested_outputs,requester_app_code,requester_route_code,return_summary_flag,return_zip_link_flag,robot_code,robot_model_code,run_now,runtime_request_id,safety,selected_robot_model_code,source_app_code,source_route_code,task_instruction,task_instruction_ja,task_purpose_code,task_title,task_title_ja,test_metadata,title,total_limit,use_purpose_code,user_instruction,user_instruction_ja,zip_required_flag
```



# 5_SELECTED_ROUTE_HANDLER_CONTEXT

```
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request
HIT_COUNT=1
--- route hit line 1175 ---
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
```



# 6_R4_COMPARE_LOG_HEAD

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



# 7_ROUTE_CANDIDATES

```
--- hit line 411 ---
  410: 
  411: // AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_START
  412: /*
--- hit line 414 ---
  413:   B6R95R3B-R3:
  414:   Common requester-facing deliverable contract for AIWorkerOS runtime execution.
  415: 
--- hit line 419 ---
  418:   - AICM is one consumer among multiple requester apps / OSs.
  419:   - AIWorkerOS creates the deliverable body and first summary.
  420:   - Requester apps store summary_text plus deliverable_ref / deliverable_link.
--- hit line 420 ---
  419:   - AIWorkerOS creates the deliverable body and first summary.
  420:   - Requester apps store summary_text plus deliverable_ref / deliverable_link.
  421:   - Robot performance differences are represented through robot_context and generation_basis.
--- hit line 449 ---
  448: 
  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
  450:   const requesterAppRef = aiwB6R95R3R3OneLine(payload.source_app_ref, "HTTP_LOCAL");
--- hit line 486 ---
  485:   const outputTitle = `${taskTitle} 成果物`;
  486:   const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);
  487:   const summaryText = aiwB6R95R3R3Clip(
--- hit line 488 ---
  487:   const summaryText = aiwB6R95R3R3Clip(
  488:     `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
  489:     700
--- hit line 508 ---
  507:   const nextSteps = aiwB6R95R3R3Lines([
  508:     "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。",
  509:     "レビュー画面から成果物本文へ辿れるようにする。",
--- hit line 557 ---
  556:     {
  557:       kind: "main_deliverable",
  558:       title: outputTitle,
--- hit line 559 ---
  558:       title: outputTitle,
  559:       file_name: "01_main_deliverable.md",
  560:       body_markdown: bodyMarkdown
--- hit line 560 ---
  559:       file_name: "01_main_deliverable.md",
  560:       body_markdown: bodyMarkdown
  561:     },
--- hit line 566 ---
  565:       file_name: "90_quality_notes.md",
  566:       body_markdown: qualityNotes
  567:     },
--- hit line 572 ---
  571:       file_name: "91_unresolved_issues.md",
  572:       body_markdown: unresolvedIssues
  573:     },
--- hit line 578 ---
  577:       file_name: "92_next_steps.md",
  578:       body_markdown: nextSteps
  579:     }
--- hit line 583 ---
  582:     contract_version: "B6R95R3B-R3",
  583:     contract_name: "aiworkeros_common_requester_deliverable_contract",
  584:     deliverable_kind: "document",
--- hit line 584 ---
  583:     contract_name: "aiworkeros_common_requester_deliverable_contract",
  584:     deliverable_kind: "document",
  585:     body_format: "markdown",
--- hit line 586 ---
  585:     body_format: "markdown",
  586:     deliverable_package: deliverablePackage,
  587:     deliverable_link: deliverablePackage.zip_link,
--- hit line 587 ---
  586:     deliverable_package: deliverablePackage,
  587:     deliverable_link: deliverablePackage.zip_link,
  588:     generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
--- hit line 588 ---
  587:     deliverable_link: deliverablePackage.zip_link,
  588:     generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  589:     requester_app_ref: requesterAppRef,
--- hit line 608 ---
  607:       body_format: "markdown",
  608:       deliverable_package: deliverablePackage,
  609:       deliverable_link: deliverablePackage.zip_link,
--- hit line 609 ---
  608:       deliverable_package: deliverablePackage,
  609:       deliverable_link: deliverablePackage.zip_link,
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
--- hit line 610 ---
  609:       deliverable_link: deliverablePackage.zip_link,
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  611:       body_markdown: bodyMarkdown,
--- hit line 611 ---
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  611:       body_markdown: bodyMarkdown,
  612:       summary_text: summaryText,
--- hit line 612 ---
  611:       body_markdown: bodyMarkdown,
  612:       summary_text: summaryText,
  613:       quality_notes: qualityNotes,
--- hit line 631 ---
  630:     generationBasis,
  631:     deliverablePackage,
  632:     generatedArtifacts,
--- hit line 637 ---
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
--- hit line 640 ---
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
--- hit line 643 ---
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
--- hit line 644 ---
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
--- hit line 645 ---
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
--- hit line 646 ---
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
--- hit line 647 ---
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
--- hit line 656 ---
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
--- hit line 658 ---
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
--- hit line 661 ---
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
--- hit line 663 ---
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
--- hit line 665 ---
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
--- hit line 666 ---
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
--- hit line 668 ---
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
--- hit line 669 ---
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
--- hit line 670 ---
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
--- hit line 671 ---
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
--- hit line 672 ---
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
--- hit line 673 ---
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
--- hit line 674 ---
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
--- hit line 675 ---
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
--- hit line 678 ---
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
--- hit line 679 ---
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
--- hit line 680 ---
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
--- hit line 681 ---
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
--- hit line 683 ---
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
--- hit line 684 ---
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
--- hit line 686 ---
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
  687:       file_name: fileName
--- hit line 696 ---
  695:   const title = aiwB6R95R3R3OneLine(item?.title || item?.artifact_title_ja || `成果物${seq}`, `成果物${seq}`);
  696:   const body = aiwB6R95R3R3Text(item?.body_markdown || item?.body_text || item?.content || "");
  697:   const suggestedName = item?.file_name || `${seq}_${aiwB6R95R3D1SafeFilePart(title, `artifact_${seq}`)}.md`;
--- hit line 706 ---
  705:     file_name: fileName,
  706:     body_markdown: body,
  707:     body_format: "markdown"
--- hit line 711 ---
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
--- hit line 712 ---
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
--- hit line 719 ---
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
--- hit line 720 ---
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
--- hit line 721 ---
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
--- hit line 722 ---
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
--- hit line 726 ---
  725: 
  726:   if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
  727:     artifacts.push({
--- hit line 731 ---
  730:       file_name: "90_quality_notes.md",
  731:       body_markdown: deliverable.qualityNotes
  732:     });
--- hit line 735 ---
  734: 
  735:   if (aiwB6R95R3R3Text(deliverable?.unresolvedIssues)) {
  736:     artifacts.push({
--- hit line 740 ---
  739:       file_name: "91_unresolved_issues.md",
  740:       body_markdown: deliverable.unresolvedIssues
  741:     });
--- hit line 744 ---
  743: 
  744:   if (aiwB6R95R3R3Text(deliverable?.nextSteps)) {
  745:     artifacts.push({
--- hit line 749 ---
  748:       file_name: "92_next_steps.md",
  749:       body_markdown: deliverable.nextSteps
  750:     });
--- hit line 756 ---
  755: 
  756: function aiwB6R95R3D1ZipCrc32(buffer) {
  757:   let table = aiwB6R95R3D1ZipCrc32._table;
--- hit line 757 ---
  756: function aiwB6R95R3D1ZipCrc32(buffer) {
  757:   let table = aiwB6R95R3D1ZipCrc32._table;
  758:   if (!table) {
--- hit line 767 ---
  766:     }
  767:     aiwB6R95R3D1ZipCrc32._table = table;
  768:   }
--- hit line 776 ---
  775: 
  776: function aiwB6R95R3D1ZipDosDateTime(date) {
  777:   const year = Math.max(1980, date.getFullYear());
--- hit line 783 ---
  782: 
  783: function aiwB6R95R3D1ZipStored(entries) {
  784:   const localParts = [];
--- hit line 787 ---
  786:   let offset = 0;
  787:   const now = aiwB6R95R3D1ZipDosDateTime(new Date());
  788: 
--- hit line 792 ---
  791:     const dataBuffer = Buffer.from(String(entry.content ?? ""), "utf8");
  792:     const crc = aiwB6R95R3D1ZipCrc32(dataBuffer);
  793: 
--- hit line 846 ---
  845: 
  846: function aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable) {
  847:   const fs = require("fs");
--- hit line 851 ---
  850:   const response = responsePayload && typeof responsePayload === "object" ? responsePayload : {};
  851:   const packageMeta = deliverable?.deliverablePackage || aiwB6R95R3D1BuildZipPackageMeta("requester", "deliverables");
  852:   const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(deliverable);
--- hit line 852 ---
  851:   const packageMeta = deliverable?.deliverablePackage || aiwB6R95R3D1BuildZipPackageMeta("requester", "deliverables");
  852:   const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(deliverable);
  853: 
--- hit line 854 ---
  853: 
  854:   const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), "runtime-deliverable-zips");
  855:   fs.mkdirSync(zipDir, { recursive: true });
--- hit line 855 ---
  854:   const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), "runtime-deliverable-zips");
  855:   fs.mkdirSync(zipDir, { recursive: true });
  856: 
--- hit line 857 ---
  856: 
  857:   const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip").endsWith(".zip")
  858:     ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
--- hit line 858 ---
  857:   const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip").endsWith(".zip")
  858:     ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
  859:     : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
--- hit line 859 ---
  858:     ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
  859:     : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
  860:   const zipPath = path.join(zipDir, fileName);
--- hit line 860 ---
  859:     : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
  860:   const zipPath = path.join(zipDir, fileName);
  861: 
--- hit line 862 ---
  861: 
  862:   // AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX
  863:   // Keep the returned zip link aligned with the actual sanitized filename written to disk.
--- hit line 863 ---
  862:   // AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX
  863:   // Keep the returned zip link aligned with the actual sanitized filename written to disk.
  864:   const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
--- hit line 864 ---
  863:   // Keep the returned zip link aligned with the actual sanitized filename written to disk.
  864:   const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  865:   const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {
--- hit line 865 ---
  864:   const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  865:   const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {
  866:     source: "aiworkeros",
--- hit line 867 ---
  866:     source: "aiworkeros",
  867:     storage_code: "runtime-deliverable-zip",
  868:     file_name: fileName
--- hit line 871 ---
  870: 
  871:   const summaryText = response.deliverable?.summary_text || deliverable?.summaryText || "";
  872:   const manifest = {
--- hit line 874 ---
  873:     contract_version: "B6R95R3D-R1",
  874:     contract_name: "aiworkeros_common_requester_multi_artifact_zip_contract",
  875:     package_purpose: "bundle_generated_artifacts_for_single_download",
--- hit line 875 ---
  874:     contract_name: "aiworkeros_common_requester_multi_artifact_zip_contract",
  875:     package_purpose: "bundle_generated_artifacts_for_single_download",
  876:     request_id: response.request_id || null,
--- hit line 878 ---
  877:     output_id: response.output_id || null,
  878:     deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
  879:     summary_text: summaryText,
--- hit line 879 ---
  878:     deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
  879:     summary_text: summaryText,
  880:     artifact_count: generatedArtifacts.length,
--- hit line 881 ---
  880:     artifact_count: generatedArtifacts.length,
  881:     generated_artifacts: generatedArtifacts.map((artifact) => ({
  882:       artifact_no: artifact.artifact_no,
--- hit line 888 ---
  887:     })),
  888:     deliverable_ref: response.deliverable_ref || null,
  889:     robot_context: response.robot_context || deliverable?.robotContext || null,
--- hit line 889 ---
  888:     deliverable_ref: response.deliverable_ref || null,
  889:     robot_context: response.robot_context || deliverable?.robotContext || null,
  890:     generation_basis: response.generation_basis || deliverable?.generationBasis || null,
--- hit line 890 ---
  889:     robot_context: response.robot_context || deliverable?.robotContext || null,
  890:     generation_basis: response.generation_basis || deliverable?.generationBasis || null,
  891:     safety: response.safety || null,
--- hit line 899 ---
  898:       name: artifact.file_name,
  899:       content: artifact.body_markdown
  900:     })),
--- hit line 904 ---
  903: 
  904:   const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  905:   fs.writeFileSync(zipPath, zipBuffer);
--- hit line 905 ---
  904:   const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  905:   fs.writeFileSync(zipPath, zipBuffer);
  906:   const stat = fs.statSync(zipPath);
--- hit line 906 ---
  905:   fs.writeFileSync(zipPath, zipBuffer);
  906:   const stat = fs.statSync(zipPath);
  907: 
--- hit line 908 ---
  907: 
  908:   const zipPublic = {
  909:     package_kind: "deliverable_zip",
--- hit line 909 ---
  908:   const zipPublic = {
  909:     package_kind: "deliverable_zip",
  910:     package_format: "zip",
--- hit line 910 ---
  909:     package_kind: "deliverable_zip",
  910:     package_format: "zip",
  911:     mime_type: "application/zip",
--- hit line 911 ---
  910:     package_format: "zip",
  911:     mime_type: "application/zip",
  912:     zip_id: packageMeta.zip_id,
--- hit line 912 ---
  911:     mime_type: "application/zip",
  912:     zip_id: packageMeta.zip_id,
  913:     file_name: fileName,
--- hit line 914 ---
  913:     file_name: fileName,
  914:     zip_link: actualZipLink,
  915:     zip_ref: actualZipRef,
--- hit line 915 ---
  914:     zip_link: actualZipLink,
  915:     zip_ref: actualZipRef,
  916:     byte_size: stat.size,
--- hit line 922 ---
  921: 
  922:   response.generated_artifacts = generatedArtifacts.map((artifact) => ({
  923:     artifact_no: artifact.artifact_no,
--- hit line 929 ---
  928:   }));
  929:   response.deliverable_package = zipPublic;
  930:   response.deliverable_zip_ref = actualZipRef;
--- hit line 930 ---
  929:   response.deliverable_package = zipPublic;
  930:   response.deliverable_zip_ref = actualZipRef;
  931:   response.deliverable_link = actualZipLink;
--- hit line 931 ---
  930:   response.deliverable_zip_ref = actualZipRef;
  931:   response.deliverable_link = actualZipLink;
  932: 
--- hit line 934 ---
  933:   response.requester_delivery_payload = Object.assign({}, response.requester_delivery_payload || {}, {
  934:     summary_text: summaryText,
  935:     deliverable_link: actualZipLink,
--- hit line 935 ---
  934:     summary_text: summaryText,
  935:     deliverable_link: actualZipLink,
  936:     deliverable_package: zipPublic,
--- hit line 936 ---
  935:     deliverable_link: actualZipLink,
  936:     deliverable_package: zipPublic,
  937:     deliverable_zip_ref: actualZipRef,
--- hit line 937 ---
  936:     deliverable_package: zipPublic,
  937:     deliverable_zip_ref: actualZipRef,
  938:     generated_artifacts: response.generated_artifacts
--- hit line 938 ---
  937:     deliverable_zip_ref: actualZipRef,
  938:     generated_artifacts: response.generated_artifacts
  939:   });
--- hit line 941 ---
  940: 
  941:   response.deliverable = Object.assign({}, response.deliverable || {}, {
  942:     deliverable_package: zipPublic,
--- hit line 942 ---
  941:   response.deliverable = Object.assign({}, response.deliverable || {}, {
  942:     deliverable_package: zipPublic,
  943:     zip_link: actualZipLink,
--- hit line 943 ---
  942:     deliverable_package: zipPublic,
  943:     zip_link: actualZipLink,
  944:     generated_artifacts: response.generated_artifacts
--- hit line 944 ---
  943:     zip_link: actualZipLink,
  944:     generated_artifacts: response.generated_artifacts
  945:   });
--- hit line 949 ---
  948: }
  949: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_END
  950: // AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_END
--- hit line 950 ---
  949: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_END
  950: // AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_END
  951: function createRuntimeRequest(payload, idempotencyKeyFromHeader) {
--- hit line 974 ---
  973: 
  974:   const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
  975: 
--- hit line 1018 ---
 1017:     "  'robot_context', :'robot_context_jsonb'::jsonb,",
 1018:     "  'generation_basis', :'generation_basis_jsonb'::jsonb,",    "  'deliverable', jsonb_build_object(",
 1019:     "    'package_kind', 'deliverable_zip',",
--- hit line 1019 ---
 1018:     "  'generation_basis', :'generation_basis_jsonb'::jsonb,",    "  'deliverable', jsonb_build_object(",
 1019:     "    'package_kind', 'deliverable_zip',",
 1020:     "    'deliverable_kind', 'document',",
```



# 8_SERVER_LOG_TAIL

```
AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:8787

```



# 9_R4_ANALYZE_HEAD

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



# 10_R4_HANDLER_HEAD

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
