# B6R95R3Z-R2 POST Non-2xx Exact Diagnosis Report

RUN_TS=20260509_051856
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051856_b6r95r3z_r2_post_non_2xx_exact_diagnosis
PREV_Z_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke
PREV_R1_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051647_b6r95r3z_r1_e2e_failure_diagnosis
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
Extract exact reason why AIWorkerOS POST returned non-2xx.

## Non-2xx response analysis
```
============================================================
POST NON-2XX RESPONSE ANALYSIS
============================================================
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke/072_post_response.json
POST_LOG_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke/071_post_instruction_to_aiworkeros.log
SERVER_LOG_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke/030_runtime_server.log
JSON_PARSE=PASS
POST_STATUS=400
AUTH_FAIL=YES
ROUTE_NOT_FOUND_HINT=NO
VALIDATION_FAIL_HINT=YES
METHOD_FAIL_HINT=NO
SERVER_ERROR_HINT=NO
ERROR_CANDIDATES_BEGIN
$.result=error
$.error_code=BAD_REQUEST
$.message=Idempotency-Key is required
ERROR_CANDIDATES_END
MISSING_OR_INVALID_FIELD_HINTS_BEGIN
safety
safety
MISSING_OR_INVALID_FIELD_HINTS_END
POST_LOG_HEAD_BEGIN
============================================================
POST INSTRUCTION TO AIWORKEROS
============================================================
ROUTE=/aiworker/v1/runtime-execution/request
STATUS=400
AUTH_FAIL=NO
HAS_SUMMARY=NO
HAS_ZIP_HINT=NO
HAS_GENERATED_ARTIFACTS=NO
HAS_TAIKA_TEXT=NO
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke/072_post_response.json
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
FINAL_STATUS=POST_STATUS_NOT_2XX

POST_LOG_HEAD_END
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
DIAGNOSIS=AUTH_FAIL
```

## Server route contract
```
============================================================
SERVER ROUTE CONTRACT EXTRACT
============================================================
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request
SELECTED_ROUTE_HIT_COUNT=1
------------------------------------------------------------
BLOCK=selected_route_1
FOUND=YES LINE=1175
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
------------------------------------------------------------
PATTERN=runtime-execution/request
HIT_COUNT=1
LINE=1175:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
------------------------------------------------------------
PATTERN=runtime-execution/execute
HIT_COUNT=0
------------------------------------------------------------
PATTERN=runtime-execution/run
HIT_COUNT=0
------------------------------------------------------------
PATTERN=workflow-start
HIT_COUNT=0
------------------------------------------------------------
PATTERN=live-aiworkeros-call
HIT_COUNT=0
------------------------------------------------------------
PATTERN=generated_artifacts
HIT_COUNT=10
LINE=588:     generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
LINE=610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
LINE=875:     package_purpose: "bundle_generated_artifacts_for_single_download",
LINE=881:     generated_artifacts: generatedArtifacts.map((artifact) => ({
LINE=922:   response.generated_artifacts = generatedArtifacts.map((artifact) => ({
LINE=938:     generated_artifacts: response.generated_artifacts
LINE=944:     generated_artifacts: response.generated_artifacts
LINE=1024:     "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
------------------------------------------------------------
PATTERN=deliverable_package
HIT_COUNT=8
LINE=586:     deliverable_package: deliverablePackage,
LINE=608:       deliverable_package: deliverablePackage,
LINE=929:   response.deliverable_package = zipPublic;
LINE=936:     deliverable_package: zipPublic,
LINE=942:     deliverable_package: zipPublic,
LINE=1023:     "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
LINE=1047:     "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
LINE=1080:     deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
------------------------------------------------------------
PATTERN=deliverable_link
HIT_COUNT=7
LINE=420:   - Requester apps store summary_text plus deliverable_ref / deliverable_link.
LINE=587:     deliverable_link: deliverablePackage.zip_link,
LINE=609:       deliverable_link: deliverablePackage.zip_link,
LINE=931:   response.deliverable_link = actualZipLink;
LINE=935:     deliverable_link: actualZipLink,
LINE=1039:     "  'deliverable_link', :'deliverable_zip_link',",    "  'requester_delivery_payload', jsonb_build_object(",
LINE=1046:     "    'deliverable_link', :'deliverable_zip_link',",
------------------------------------------------------------
PATTERN=runtime-deliverable-zips
HIT_COUNT=1
LINE=854:   const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), "runtime-deliverable-zips");
------------------------------------------------------------
PATTERN=zip_link
HIT_COUNT=10
LINE=587:     deliverable_link: deliverablePackage.zip_link,
LINE=609:       deliverable_link: deliverablePackage.zip_link,
LINE=670:   // Therefore file_name / zip_link must already use the exact sanitized filename
LINE=683:     zip_link: zipLink,
LINE=914:     zip_link: actualZipLink,
LINE=943:     zip_link: actualZipLink,
LINE=1031:     "    'zip_link', :'deliverable_zip_link'",
LINE=1039:     "  'deliverable_link', :'deliverable_zip_link',",    "  'requester_delivery_payload', jsonb_build_object(",
------------------------------------------------------------
PATTERN=body_markdown
HIT_COUNT=13
LINE=560:       body_markdown: bodyMarkdown
LINE=566:       body_markdown: qualityNotes
LINE=572:       body_markdown: unresolvedIssues
LINE=578:       body_markdown: nextSteps
LINE=611:       body_markdown: bodyMarkdown,
LINE=696:   const body = aiwB6R95R3R3Text(item?.body_markdown || item?.body_text || item?.content || "");
LINE=706:     body_markdown: body,
LINE=722:       body_markdown: deliverable?.bodyMarkdown || ""
------------------------------------------------------------
PATTERN=summary_text
HIT_COUNT=11
LINE=420:   - Requester apps store summary_text plus deliverable_ref / deliverable_link.
LINE=488:     `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
LINE=508:     "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。",
LINE=612:       summary_text: summaryText,
LINE=644:   - AIWorkerOS creates summary_text.
LINE=646:   - Requester apps display summary_text and link to the zip.
LINE=871:   const summaryText = response.deliverable?.summary_text || deliverable?.summaryText || "";
LINE=879:     summary_text: summaryText,
------------------------------------------------------------
PATTERN=readJsonBody
HIT_COUNT=0
------------------------------------------------------------
PATTERN=parseJsonBody
HIT_COUNT=0
------------------------------------------------------------
PATTERN=request_id
HIT_COUNT=16
LINE=57:     body.request_id ||
LINE=58:     body.runtime_execution_request_id
LINE=138:   if (row.request_id || row.runtime_execution_request_id || row.request_code) return true;
LINE=355:         on rr.request_id = p.request_id
LINE=356:       where (nullif(:'request_id','') is null or p.request_id::text = :'request_id')
LINE=363:     request_id: query.get("request_id") || "",
LINE=377:         on rr.request_id = p.request_id
LINE=378:       where (nullif(:'request_id','') is null or p.request_id::text = :'request_id')
------------------------------------------------------------
PATTERN=task_instruction_ja
HIT_COUNT=4
LINE=455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
LINE=965:   const required = ["app_surface_code", "model_code", "task_domain_code", "task_title", "task_instruction_ja"];
LINE=983:     "    :'task_instruction_ja',",
LINE=1068:     task_instruction_ja: payload.task_instruction_ja,
------------------------------------------------------------
PATTERN=instruction_ja
HIT_COUNT=4
LINE=455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
LINE=965:   const required = ["app_surface_code", "model_code", "task_domain_code", "task_title", "task_instruction_ja"];
LINE=983:     "    :'task_instruction_ja',",
LINE=1068:     task_instruction_ja: payload.task_instruction_ja,
------------------------------------------------------------
PATTERN=model_code
HIT_COUNT=9
LINE=456:   const modelCode = aiwB6R95R3R3OneLine(payload.model_code, "unknown_model");
LINE=465:     model_code: modelCode,
LINE=478:     robot_trait_basis: "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
LINE=527:     `- model_code: ${modelCode}`,
LINE=965:   const required = ["app_surface_code", "model_code", "task_domain_code", "task_title", "task_instruction_ja"];
LINE=980:     "    :'model_code',",
LINE=1065:     model_code: payload.model_code,
LINE=1142:       const modelCode = url.searchParams.get("model_code") || url.searchParams.get("modelCode") || "";
============================================================
ROUTE_BODY_KEY_HINTS_BEGIN
ROUTE_BODY_KEY_HINTS_END
SELECTED_ROUTE_LOOKS_CREATE_ONLY=YES
SELECTED_ROUTE_LOOKS_EXECUTION_OR_ZIP=NO
```

## Payload contract audit
```
============================================================
PAYLOAD CONTRACT AUDIT
============================================================
PAYLOAD_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke/060_aiworkeros_instruction_payload.json
JSON_PARSE=PASS
PAYLOAD_KEYS_BEGIN
brain_domain_codes=["history_worldview","civilization_foundation_history","education_learning","exam_learning"]
deliverable_zip_required_flag=true
domains=["history_worldview","civilization_foundation_history","education_learning","exam_learning"]
external_request_id=b6r95r3z_taika_aiworkeros_zip_e2e_20260509_051359
instruction_ja=CX22073JWの大化の改新 source-backed runtime material を参照し、出典注意・誤解防止・時系列・人物・制度・律令国家形成への接続を含む詳細資料を作成してください。成果物本文、成果物サマリ、納品zipを作成してください。
limit_per_domain=20
model_code=BYD2-003
output_format=markdown_zip
output_language=ja
purpose_code=review
request_id=b6r95r3z_taika_aiworkeros_zip_e2e_20260509_051359
requested_outputs=["body_markdown","summary_text","generated_artifacts","deliverable_package","deliverable_link","zip_link"]
requester_app_code=cx22073jw
requester_route_code=direct_aiworkeros_e2e_smoke
return_summary_flag=true
return_zip_link_flag=true
robot_code=BYD2-003
robot_model_code=BYD2-003
runtime_request_id=b6r95r3z_taika_aiworkeros_zip_e2e_20260509_051359
safety={"external_execution_allowed":false,"pg_apply_allowed":false,"destructive_action_allowed":false}
source_app_code=cx22073jw_smoke
source_route_code=aiworkeros_direct_instruction_to_zip_smoke
task_instruction_ja=CX22073JWの大化の改新 source-backed runtime material を参照し、出典注意・誤解防止・時系列・人物・制度・律令国家形成への接続を含む詳細資料を作成してください。成果物本文、成果物サマリ、納品zipを作成してください。
task_title_ja=大化の改新 詳細資料生成 smoke
test_metadata={"run_code":"b6r95r3z_taika_aiworkeros_zip_e2e_20260509_051359","phase_code":"B6R95R3Z","purpose":"AIWorkerOS inbound instruction to zip E2E smoke","aicm_touch_expected":false}
total_limit=80
use_purpose_code=review
user_instruction_ja=大化の改新を詳細資料として生成。summary_textと納品zipまで返却。
zip_required_flag=true
PAYLOAD_KEYS_END
ROUTE_KEY_HINTS_BEGIN
ROUTE_KEY_HINTS_END
ROUTE_KEYS_MISSING_FROM_PAYLOAD_BEGIN
ROUTE_KEYS_MISSING_FROM_PAYLOAD_END
COMMON_REQUIREMENT_STATUS_BEGIN
model_code=PRESENT
task_instruction_ja=PRESENT
instruction_ja=PRESENT
use_purpose_code=PRESENT
purpose_code=PRESENT
COMMON_REQUIREMENT_STATUS_END
POST_STATUS=400
RESPONSE_DIAGNOSIS=AUTH_FAIL
NEXT_RECOMMENDATION=R3_PAYLOAD_COMPAT_RETRY
```

## Next plan
```
# B6R95R3Z-R3 Plan

## R2の目的

POST non-2xx の正体を確定する。

## 分岐

### PAYLOAD_VALIDATION_FAILED
R3では既存routeの期待payloadに合わせて再POSTする。
payload互換候補:
- request_id
- model_code
- purpose_code / use_purpose_code
- task_instruction_ja / instruction_ja
- input_json / request_payload / payload
- requester metadata
- zip_required_flag / return_zip_link_flag

### ROUTE_NOT_FOUND_OR_WRONG_ROUTE
R3では /aiworker/v1/runtime-execution/request を使わず、server.js上の実行routeを使う。
候補:
- workflow-start
- live-aiworkeros-call
- execute
- run

### REQUEST_CREATE_ONLY
R3では二段階:
1. request作成
2. returned request_id を execute/run route に渡す

### SERVER_INTERNAL_ERROR
R3では server log の stack/error_code をもとに最小修正またはpayload修正。
patchが必要な場合は、その前に別途確認。

## 禁止

- まだpatchしない
- まだgit pushしない
- AICMに触らない
```

## AICM touch check
```
AICM_BASE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051856_b6r95r3z_r2_post_non_2xx_exact_diagnosis/000_start_marker
```

## Runtime touch check
```
AIWORKER_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os
START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051856_b6r95r3z_r2_post_non_2xx_exact_diagnosis/000_start_marker
```

## Secret scan
```
Scan generated diagnosis files only
```
FINAL_STATUS=B6R95R3Z_R2_PAYLOAD_COMPAT_RETRY_REQUIRED_REVIEW_REQUIRED
NEXT=B6R95R3Z-R3: R2診断に従い、payload互換再POSTまたは実行routeへPOST。
