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



# 4_SELECTED_ROUTE_HANDLER_CONTEXT

```
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request
HIT_COUNT=1
--- route hit line 1175 ---
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
```



# 5_PAYLOAD_SUMMARY

```
PAYLOAD_JSON_PARSE=PASS
TOP_KEYS=auto_execute,body,brain_domain_codes,create_zip_flag,deliverable_zip_required_flag,domain_codes,domains,dry_run,execute_now,execution_id,external_request_id,generate_zip_flag,idempotencyKey,idempotency_key,input_json,instruction,instruction_ja,language_code,limit_per_domain,model_code,output_format,output_language,payload,prompt,prompt_ja,purpose_code,request,request_code,request_id,request_payload,request_source_code,requested_output_format,requested_outputs,requester_app_code,requester_route_code,return_summary_flag,return_zip_link_flag,robot_code,robot_model_code,run_now,runtime_request,runtime_request_id,safety,selected_robot_model_code,source_app_code,source_route_code,task_instruction,task_instruction_ja,task_purpose_code,task_title,task_title_ja,test_metadata,title,total_limit,use_purpose_code,user_instruction,user_instruction_ja,zip_required_flag
request_id=B6R95R3Z_R6_TAIKA_IDEMPOTENCY_20260509_052932
runtime_request_id=B6R95R3Z_R6_TAIKA_IDEMPOTENCY_20260509_052932
idempotency_key=***SET***
idempotencyKey=***SET***
model_code=BYD2-003
task_instruction_ja=CX22073JWの大化の改新 source-backed runtime material を参照し、出典注意、誤解防止、時系列、人物、制度、公地公民、改新の詔、律令国家形成への接続を含む詳細資料を作成してください。成果物本文、summary_text、generated_artifacts、納品zipを作成し、zip linkを返してください。
```



# 6_ROUTE_CANDIDATES

```
--- hit line 411 ---
  409: 
  410: 
  411: // AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_START
  412: /*
  413:   B6R95R3B-R3:
--- hit line 414 ---
  412: /*
  413:   B6R95R3B-R3:
  414:   Common requester-facing deliverable contract for AIWorkerOS runtime execution.
  415: 
  416:   Canon:
--- hit line 419 ---
  417:   - This is not AICM-specific.
  418:   - AICM is one consumer among multiple requester apps / OSs.
  419:   - AIWorkerOS creates the deliverable body and first summary.
  420:   - Requester apps store summary_text plus deliverable_ref / deliverable_link.
  421:   - Robot performance differences are represented through robot_context and generation_basis.
--- hit line 420 ---
  418:   - AICM is one consumer among multiple requester apps / OSs.
  419:   - AIWorkerOS creates the deliverable body and first summary.
  420:   - Requester apps store summary_text plus deliverable_ref / deliverable_link.
  421:   - Robot performance differences are represented through robot_context and generation_basis.
  422: 
--- hit line 449 ---
  447: }
  448: 
  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
  450:   const requesterAppRef = aiwB6R95R3R3OneLine(payload.source_app_ref, "HTTP_LOCAL");
  451:   const sourceRequestRef = aiwB6R95R3R3OneLine(payload.source_request_ref, "");
--- hit line 486 ---
  484: 
  485:   const outputTitle = `${taskTitle} 成果物`;
  486:   const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);
  487:   const summaryText = aiwB6R95R3R3Clip(
  488:     `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
--- hit line 488 ---
  486:   const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);
  487:   const summaryText = aiwB6R95R3R3Clip(
  488:     `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
  489:     700
  490:   );
--- hit line 508 ---
  506: 
  507:   const nextSteps = aiwB6R95R3R3Lines([
  508:     "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。",
  509:     "レビュー画面から成果物本文へ辿れるようにする。",
  510:     "差し戻し時は追加条件をAIWorkerOSへ再依頼する。"
--- hit line 557 ---
  555:   const generatedArtifacts = [
  556:     {
  557:       kind: "main_deliverable",
  558:       title: outputTitle,
  559:       file_name: "01_main_deliverable.md",
--- hit line 559 ---
  557:       kind: "main_deliverable",
  558:       title: outputTitle,
  559:       file_name: "01_main_deliverable.md",
  560:       body_markdown: bodyMarkdown
  561:     },
--- hit line 560 ---
  558:       title: outputTitle,
  559:       file_name: "01_main_deliverable.md",
  560:       body_markdown: bodyMarkdown
  561:     },
  562:     {
--- hit line 566 ---
  564:       title: "品質メモ",
  565:       file_name: "90_quality_notes.md",
  566:       body_markdown: qualityNotes
  567:     },
  568:     {
--- hit line 572 ---
  570:       title: "未解決事項",
  571:       file_name: "91_unresolved_issues.md",
  572:       body_markdown: unresolvedIssues
  573:     },
  574:     {
--- hit line 578 ---
  576:       title: "次工程",
  577:       file_name: "92_next_steps.md",
  578:       body_markdown: nextSteps
  579:     }
  580:   ];
--- hit line 583 ---
  581:   const outputPayload = {
  582:     contract_version: "B6R95R3B-R3",
  583:     contract_name: "aiworkeros_common_requester_deliverable_contract",
  584:     deliverable_kind: "document",
  585:     body_format: "markdown",
--- hit line 584 ---
  582:     contract_version: "B6R95R3B-R3",
  583:     contract_name: "aiworkeros_common_requester_deliverable_contract",
  584:     deliverable_kind: "document",
  585:     body_format: "markdown",
  586:     deliverable_package: deliverablePackage,
--- hit line 586 ---
  584:     deliverable_kind: "document",
  585:     body_format: "markdown",
  586:     deliverable_package: deliverablePackage,
  587:     deliverable_link: deliverablePackage.zip_link,
  588:     generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
--- hit line 587 ---
  585:     body_format: "markdown",
  586:     deliverable_package: deliverablePackage,
  587:     deliverable_link: deliverablePackage.zip_link,
  588:     generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  589:     requester_app_ref: requesterAppRef,
--- hit line 588 ---
  586:     deliverable_package: deliverablePackage,
  587:     deliverable_link: deliverablePackage.zip_link,
  588:     generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  589:     requester_app_ref: requesterAppRef,
  590:     source_request_ref: sourceRequestRef,
--- hit line 608 ---
  606:       artifact_title_ja: outputTitle,
  607:       body_format: "markdown",
  608:       deliverable_package: deliverablePackage,
  609:       deliverable_link: deliverablePackage.zip_link,
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
--- hit line 609 ---
  607:       body_format: "markdown",
  608:       deliverable_package: deliverablePackage,
  609:       deliverable_link: deliverablePackage.zip_link,
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  611:       body_markdown: bodyMarkdown,
--- hit line 610 ---
  608:       deliverable_package: deliverablePackage,
  609:       deliverable_link: deliverablePackage.zip_link,
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  611:       body_markdown: bodyMarkdown,
  612:       summary_text: summaryText,
--- hit line 611 ---
  609:       deliverable_link: deliverablePackage.zip_link,
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  611:       body_markdown: bodyMarkdown,
  612:       summary_text: summaryText,
  613:       quality_notes: qualityNotes,
--- hit line 612 ---
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  611:       body_markdown: bodyMarkdown,
  612:       summary_text: summaryText,
  613:       quality_notes: qualityNotes,
  614:       unresolved_issues: unresolvedIssues,
--- hit line 631 ---
  629:     robotContext,
  630:     generationBasis,
  631:     deliverablePackage,
  632:     generatedArtifacts,
  633:     outputPayload,
--- hit line 637 ---
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
--- hit line 640 ---
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
--- hit line 643 ---
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
--- hit line 644 ---
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
--- hit line 645 ---
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
--- hit line 646 ---
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
--- hit line 647 ---
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
  649:   Boundary:
--- hit line 656 ---
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
--- hit line 658 ---
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
--- hit line 661 ---
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
--- hit line 663 ---
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
--- hit line 665 ---
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
--- hit line 666 ---
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
--- hit line 668 ---
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
--- hit line 669 ---
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
--- hit line 670 ---
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
--- hit line 671 ---
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
--- hit line 672 ---
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
--- hit line 673 ---
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
--- hit line 674 ---
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
--- hit line 675 ---
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
--- hit line 678 ---
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
--- hit line 679 ---
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
--- hit line 680 ---
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
--- hit line 681 ---
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
--- hit line 683 ---
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
--- hit line 684 ---
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
--- hit line 686 ---
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
  687:       file_name: fileName
  688:     }
--- hit line 696 ---
  694:   const kind = aiwB6R95R3R3OneLine(item?.artifact_kind_code || item?.kind || "document", "document");
  695:   const title = aiwB6R95R3R3OneLine(item?.title || item?.artifact_title_ja || `成果物${seq}`, `成果物${seq}`);
  696:   const body = aiwB6R95R3R3Text(item?.body_markdown || item?.body_text || item?.content || "");
  697:   const suggestedName = item?.file_name || `${seq}_${aiwB6R95R3D1SafeFilePart(title, `artifact_${seq}`)}.md`;
  698:   const fileName = aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}.md`).endsWith(".md")
--- hit line 706 ---
  704:     title,
  705:     file_name: fileName,
  706:     body_markdown: body,
  707:     body_format: "markdown"
  708:   };
--- hit line 711 ---
  709: }
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
--- hit line 712 ---
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
  714:     return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
--- hit line 719 ---
  717:   const artifacts = [
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
--- hit line 720 ---
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
--- hit line 721 ---
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
--- hit line 722 ---
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
  724:   ];
--- hit line 726 ---
  724:   ];
  725: 
  726:   if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
  727:     artifacts.push({
  728:       kind: "quality_notes",
--- hit line 731 ---
  729:       title: "品質メモ",
  730:       file_name: "90_quality_notes.md",
  731:       body_markdown: deliverable.qualityNotes
  732:     });
  733:   }
--- hit line 735 ---
  733:   }
  734: 
  735:   if (aiwB6R95R3R3Text(deliverable?.unresolvedIssues)) {
  736:     artifacts.push({
  737:       kind: "unresolved_issues",
--- hit line 740 ---
  738:       title: "未解決事項",
  739:       file_name: "91_unresolved_issues.md",
  740:       body_markdown: deliverable.unresolvedIssues
  741:     });
  742:   }
--- hit line 744 ---
  742:   }
  743: 
  744:   if (aiwB6R95R3R3Text(deliverable?.nextSteps)) {
  745:     artifacts.push({
  746:       kind: "next_steps",
--- hit line 749 ---
  747:       title: "次工程",
  748:       file_name: "92_next_steps.md",
  749:       body_markdown: deliverable.nextSteps
  750:     });
  751:   }
--- hit line 756 ---
  754: }
  755: 
  756: function aiwB6R95R3D1ZipCrc32(buffer) {
  757:   let table = aiwB6R95R3D1ZipCrc32._table;
  758:   if (!table) {
--- hit line 757 ---
  755: 
  756: function aiwB6R95R3D1ZipCrc32(buffer) {
  757:   let table = aiwB6R95R3D1ZipCrc32._table;
  758:   if (!table) {
  759:     table = new Uint32Array(256);
--- hit line 767 ---
  765:       table[i] = c >>> 0;
  766:     }
  767:     aiwB6R95R3D1ZipCrc32._table = table;
  768:   }
  769:   let crc = 0xffffffff;
--- hit line 776 ---
  774: }
  775: 
  776: function aiwB6R95R3D1ZipDosDateTime(date) {
  777:   const year = Math.max(1980, date.getFullYear());
  778:   const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
--- hit line 783 ---
  781: }
  782: 
  783: function aiwB6R95R3D1ZipStored(entries) {
  784:   const localParts = [];
  785:   const centralParts = [];
--- hit line 787 ---
  785:   const centralParts = [];
  786:   let offset = 0;
  787:   const now = aiwB6R95R3D1ZipDosDateTime(new Date());
  788: 
  789:   for (const entry of entries) {
--- hit line 792 ---
  790:     const nameBuffer = Buffer.from(entry.name, "utf8");
  791:     const dataBuffer = Buffer.from(String(entry.content ?? ""), "utf8");
  792:     const crc = aiwB6R95R3D1ZipCrc32(dataBuffer);
  793: 
  794:     const local = Buffer.alloc(30);
--- hit line 846 ---
  844: }
  845: 
  846: function aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable) {
  847:   const fs = require("fs");
  848:   const path = require("path");
--- hit line 851 ---
  849: 
  850:   const response = responsePayload && typeof responsePayload === "object" ? responsePayload : {};
  851:   const packageMeta = deliverable?.deliverablePackage || aiwB6R95R3D1BuildZipPackageMeta("requester", "deliverables");
  852:   const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(deliverable);
  853: 
--- hit line 852 ---
  850:   const response = responsePayload && typeof responsePayload === "object" ? responsePayload : {};
  851:   const packageMeta = deliverable?.deliverablePackage || aiwB6R95R3D1BuildZipPackageMeta("requester", "deliverables");
  852:   const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(deliverable);
  853: 
  854:   const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), "runtime-deliverable-zips");
--- hit line 854 ---
  852:   const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(deliverable);
  853: 
  854:   const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), "runtime-deliverable-zips");
  855:   fs.mkdirSync(zipDir, { recursive: true });
  856: 
--- hit line 855 ---
  853: 
  854:   const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), "runtime-deliverable-zips");
  855:   fs.mkdirSync(zipDir, { recursive: true });
  856: 
  857:   const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip").endsWith(".zip")
--- hit line 857 ---
  855:   fs.mkdirSync(zipDir, { recursive: true });
  856: 
  857:   const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip").endsWith(".zip")
  858:     ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
  859:     : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
--- hit line 858 ---
  856: 
  857:   const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip").endsWith(".zip")
  858:     ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
  859:     : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
  860:   const zipPath = path.join(zipDir, fileName);
--- hit line 859 ---
  857:   const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip").endsWith(".zip")
  858:     ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
  859:     : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
  860:   const zipPath = path.join(zipDir, fileName);
  861: 
--- hit line 860 ---
  858:     ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
  859:     : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
  860:   const zipPath = path.join(zipDir, fileName);
  861: 
  862:   // AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX
--- hit line 862 ---
  860:   const zipPath = path.join(zipDir, fileName);
  861: 
  862:   // AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX
  863:   // Keep the returned zip link aligned with the actual sanitized filename written to disk.
  864:   const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
--- hit line 863 ---
  861: 
  862:   // AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX
  863:   // Keep the returned zip link aligned with the actual sanitized filename written to disk.
  864:   const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  865:   const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {
--- hit line 864 ---
  862:   // AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX
  863:   // Keep the returned zip link aligned with the actual sanitized filename written to disk.
  864:   const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  865:   const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {
  866:     source: "aiworkeros",
--- hit line 865 ---
  863:   // Keep the returned zip link aligned with the actual sanitized filename written to disk.
  864:   const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  865:   const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {
  866:     source: "aiworkeros",
  867:     storage_code: "runtime-deliverable-zip",
--- hit line 867 ---
  865:   const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {
  866:     source: "aiworkeros",
  867:     storage_code: "runtime-deliverable-zip",
  868:     file_name: fileName
  869:   });
--- hit line 871 ---
  869:   });
  870: 
  871:   const summaryText = response.deliverable?.summary_text || deliverable?.summaryText || "";
  872:   const manifest = {
  873:     contract_version: "B6R95R3D-R1",
--- hit line 874 ---
  872:   const manifest = {
  873:     contract_version: "B6R95R3D-R1",
  874:     contract_name: "aiworkeros_common_requester_multi_artifact_zip_contract",
  875:     package_purpose: "bundle_generated_artifacts_for_single_download",
  876:     request_id: response.request_id || null,
--- hit line 875 ---
  873:     contract_version: "B6R95R3D-R1",
  874:     contract_name: "aiworkeros_common_requester_multi_artifact_zip_contract",
  875:     package_purpose: "bundle_generated_artifacts_for_single_download",
  876:     request_id: response.request_id || null,
  877:     output_id: response.output_id || null,
--- hit line 878 ---
  876:     request_id: response.request_id || null,
  877:     output_id: response.output_id || null,
  878:     deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
  879:     summary_text: summaryText,
  880:     artifact_count: generatedArtifacts.length,
--- hit line 879 ---
  877:     output_id: response.output_id || null,
  878:     deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
  879:     summary_text: summaryText,
  880:     artifact_count: generatedArtifacts.length,
  881:     generated_artifacts: generatedArtifacts.map((artifact) => ({
--- hit line 881 ---
  879:     summary_text: summaryText,
  880:     artifact_count: generatedArtifacts.length,
  881:     generated_artifacts: generatedArtifacts.map((artifact) => ({
  882:       artifact_no: artifact.artifact_no,
  883:       artifact_kind_code: artifact.artifact_kind_code,
--- hit line 888 ---
  886:       body_format: artifact.body_format
  887:     })),
  888:     deliverable_ref: response.deliverable_ref || null,
  889:     robot_context: response.robot_context || deliverable?.robotContext || null,
  890:     generation_basis: response.generation_basis || deliverable?.generationBasis || null,
--- hit line 889 ---
  887:     })),
  888:     deliverable_ref: response.deliverable_ref || null,
  889:     robot_context: response.robot_context || deliverable?.robotContext || null,
  890:     generation_basis: response.generation_basis || deliverable?.generationBasis || null,
  891:     safety: response.safety || null,
--- hit line 890 ---
  888:     deliverable_ref: response.deliverable_ref || null,
  889:     robot_context: response.robot_context || deliverable?.robotContext || null,
  890:     generation_basis: response.generation_basis || deliverable?.generationBasis || null,
  891:     safety: response.safety || null,
  892:     created_at: new Date().toISOString()
--- hit line 899 ---
  897:     ...generatedArtifacts.map((artifact) => ({
  898:       name: artifact.file_name,
  899:       content: artifact.body_markdown
  900:     })),
  901:     { name: "manifest.json", content: JSON.stringify(manifest, null, 2) }
--- hit line 904 ---
  902:   ];
  903: 
  904:   const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  905:   fs.writeFileSync(zipPath, zipBuffer);
  906:   const stat = fs.statSync(zipPath);
--- hit line 905 ---
  903: 
  904:   const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  905:   fs.writeFileSync(zipPath, zipBuffer);
  906:   const stat = fs.statSync(zipPath);
  907: 
--- hit line 906 ---
  904:   const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  905:   fs.writeFileSync(zipPath, zipBuffer);
  906:   const stat = fs.statSync(zipPath);
  907: 
  908:   const zipPublic = {
--- hit line 908 ---
  906:   const stat = fs.statSync(zipPath);
  907: 
  908:   const zipPublic = {
  909:     package_kind: "deliverable_zip",
  910:     package_format: "zip",
--- hit line 909 ---
  907: 
  908:   const zipPublic = {
  909:     package_kind: "deliverable_zip",
  910:     package_format: "zip",
  911:     mime_type: "application/zip",
--- hit line 910 ---
  908:   const zipPublic = {
  909:     package_kind: "deliverable_zip",
  910:     package_format: "zip",
  911:     mime_type: "application/zip",
  912:     zip_id: packageMeta.zip_id,
--- hit line 911 ---
  909:     package_kind: "deliverable_zip",
  910:     package_format: "zip",
  911:     mime_type: "application/zip",
  912:     zip_id: packageMeta.zip_id,
  913:     file_name: fileName,
--- hit line 912 ---
  910:     package_format: "zip",
  911:     mime_type: "application/zip",
  912:     zip_id: packageMeta.zip_id,
  913:     file_name: fileName,
  914:     zip_link: actualZipLink,
--- hit line 914 ---
  912:     zip_id: packageMeta.zip_id,
  913:     file_name: fileName,
  914:     zip_link: actualZipLink,
  915:     zip_ref: actualZipRef,
  916:     byte_size: stat.size,
--- hit line 915 ---
  913:     file_name: fileName,
  914:     zip_link: actualZipLink,
  915:     zip_ref: actualZipRef,
  916:     byte_size: stat.size,
  917:     entry_count: entries.length,
--- hit line 922 ---
  920:   };
  921: 
  922:   response.generated_artifacts = generatedArtifacts.map((artifact) => ({
  923:     artifact_no: artifact.artifact_no,
  924:     artifact_kind_code: artifact.artifact_kind_code,
--- hit line 929 ---
  927:     body_format: artifact.body_format
  928:   }));
  929:   response.deliverable_package = zipPublic;
  930:   response.deliverable_zip_ref = actualZipRef;
  931:   response.deliverable_link = actualZipLink;
--- hit line 930 ---
  928:   }));
  929:   response.deliverable_package = zipPublic;
  930:   response.deliverable_zip_ref = actualZipRef;
  931:   response.deliverable_link = actualZipLink;
  932: 
--- hit line 931 ---
  929:   response.deliverable_package = zipPublic;
  930:   response.deliverable_zip_ref = actualZipRef;
  931:   response.deliverable_link = actualZipLink;
  932: 
  933:   response.requester_delivery_payload = Object.assign({}, response.requester_delivery_payload || {}, {
--- hit line 934 ---
  932: 
  933:   response.requester_delivery_payload = Object.assign({}, response.requester_delivery_payload || {}, {
  934:     summary_text: summaryText,
  935:     deliverable_link: actualZipLink,
  936:     deliverable_package: zipPublic,
--- hit line 935 ---
  933:   response.requester_delivery_payload = Object.assign({}, response.requester_delivery_payload || {}, {
  934:     summary_text: summaryText,
  935:     deliverable_link: actualZipLink,
  936:     deliverable_package: zipPublic,
  937:     deliverable_zip_ref: actualZipRef,
--- hit line 936 ---
  934:     summary_text: summaryText,
  935:     deliverable_link: actualZipLink,
  936:     deliverable_package: zipPublic,
  937:     deliverable_zip_ref: actualZipRef,
  938:     generated_artifacts: response.generated_artifacts
--- hit line 937 ---
  935:     deliverable_link: actualZipLink,
  936:     deliverable_package: zipPublic,
  937:     deliverable_zip_ref: actualZipRef,
  938:     generated_artifacts: response.generated_artifacts
  939:   });
--- hit line 938 ---
  936:     deliverable_package: zipPublic,
  937:     deliverable_zip_ref: actualZipRef,
  938:     generated_artifacts: response.generated_artifacts
  939:   });
  940: 
--- hit line 941 ---
  939:   });
  940: 
  941:   response.deliverable = Object.assign({}, response.deliverable || {}, {
  942:     deliverable_package: zipPublic,
  943:     zip_link: actualZipLink,
--- hit line 942 ---
  940: 
  941:   response.deliverable = Object.assign({}, response.deliverable || {}, {
  942:     deliverable_package: zipPublic,
  943:     zip_link: actualZipLink,
  944:     generated_artifacts: response.generated_artifacts
--- hit line 943 ---
  941:   response.deliverable = Object.assign({}, response.deliverable || {}, {
  942:     deliverable_package: zipPublic,
  943:     zip_link: actualZipLink,
  944:     generated_artifacts: response.generated_artifacts
  945:   });
--- hit line 944 ---
  942:     deliverable_package: zipPublic,
  943:     zip_link: actualZipLink,
  944:     generated_artifacts: response.generated_artifacts
  945:   });
  946: 
--- hit line 949 ---
  947:   return response;
  948: }
  949: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_END
  950: // AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_END
  951: function createRuntimeRequest(payload, idempotencyKeyFromHeader) {
--- hit line 950 ---
  948: }
  949: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_END
  950: // AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_END
  951: function createRuntimeRequest(payload, idempotencyKeyFromHeader) {
  952:   const idempotencyKey = payload.idempotency_key || idempotencyKeyFromHeader || "";
--- hit line 951 ---
  949: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_END
  950: // AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_END
  951: function createRuntimeRequest(payload, idempotencyKeyFromHeader) {
  952:   const idempotencyKey = payload.idempotency_key || idempotencyKeyFromHeader || "";
  953:   const sourceRouteCode = String(
--- hit line 952 ---
  950: // AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_END
  951: function createRuntimeRequest(payload, idempotencyKeyFromHeader) {
  952:   const idempotencyKey = payload.idempotency_key || idempotencyKeyFromHeader || "";
  953:   const sourceRouteCode = String(
  954:     payload.source_route_code ||
--- hit line 959 ---
  957:     ""
  958:   ).trim();
  959:   if (!idempotencyKey) {
  960:     const e = new Error("Idempotency-Key is required");
  961:     e.httpStatus = 400;
--- hit line 960 ---
  958:   ).trim();
  959:   if (!idempotencyKey) {
  960:     const e = new Error("Idempotency-Key is required");
  961:     e.httpStatus = 400;
  962:     throw e;
--- hit line 974 ---
  972:   }
  973: 
  974:   const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
  975: 
  976:   const sql = [
--- hit line 987 ---
  985:     "    :'source_request_ref',",
  986:     "    :'requested_by_ref',",
  987:     "    :'idempotency_key',",
  988:     "    :'source_route_code'",
  989:     "  ) as request_id",
--- hit line 1012 ---
 1010:     "  'request_id', (select request_id from created),",
 1011:     "  'output_id', (select output_id from worker_output),",
 1012:     "  'idempotency_key', :'idempotency_key',",
 1013:     "  'requester_app_ref', :'source_app_ref',",
 1014:     "  'source_request_ref', :'source_request_ref',",
--- hit line 1018 ---
 1016:     "  'payload', coalesce((select app_read_payload_jsonb from board limit 1), '{}'::jsonb),",
 1017:     "  'robot_context', :'robot_context_jsonb'::jsonb,",
 1018:     "  'generation_basis', :'generation_basis_jsonb'::jsonb,",    "  'deliverable', jsonb_build_object(",
 1019:     "    'package_kind', 'deliverable_zip',",
 1020:     "    'deliverable_kind', 'document',",
--- hit line 1019 ---
 1017:     "  'robot_context', :'robot_context_jsonb'::jsonb,",
 1018:     "  'generation_basis', :'generation_basis_jsonb'::jsonb,",    "  'deliverable', jsonb_build_object(",
 1019:     "    'package_kind', 'deliverable_zip',",
 1020:     "    'deliverable_kind', 'document',",
 1021:     "    'title', :'output_title_ja',",
--- hit line 1020 ---
 1018:     "  'generation_basis', :'generation_basis_jsonb'::jsonb,",    "  'deliverable', jsonb_build_object(",
 1019:     "    'package_kind', 'deliverable_zip',",
 1020:     "    'deliverable_kind', 'document',",
 1021:     "    'title', :'output_title_ja',",
 1022:     "    'body_format', 'markdown',",
--- hit line 1023 ---
 1021:     "    'title', :'output_title_ja',",
 1022:     "    'body_format', 'markdown',",
 1023:     "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
 1024:     "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
 1025:     "    'body_markdown', :'output_body_ja',",
--- hit line 1024 ---
 1022:     "    'body_format', 'markdown',",
 1023:     "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
 1024:     "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
 1025:     "    'body_markdown', :'output_body_ja',",
 1026:     "    'summary_text', :'output_summary_ja',",
--- hit line 1025 ---
 1023:     "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
 1024:     "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
 1025:     "    'body_markdown', :'output_body_ja',",
 1026:     "    'summary_text', :'output_summary_ja',",
 1027:     "    'quality_notes', :'quality_notes',",
--- hit line 1026 ---
 1024:     "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
 1025:     "    'body_markdown', :'output_body_ja',",
 1026:     "    'summary_text', :'output_summary_ja',",
 1027:     "    'quality_notes', :'quality_notes',",
 1028:     "    'unresolved_issues', :'unresolved_issues',",
--- hit line 1031 ---
 1029:     "    'next_steps', :'next_steps',",
 1030:     "    'output_id', (select output_id from worker_output),",
 1031:     "    'zip_link', :'deliverable_zip_link'",
 1032:     "  ),",
 1033:     "  'deliverable_ref', jsonb_build_object(",
--- hit line 1033 ---
 1031:     "    'zip_link', :'deliverable_zip_link'",
 1032:     "  ),",
 1033:     "  'deliverable_ref', jsonb_build_object(",
 1034:     "    'source', 'aiworkeros',",
 1035:     "    'schema', 'aiworker',",
--- hit line 1039 ---
 1037:     "    'id', (select output_id from worker_output)::text",
 1038:     "  ),",
 1039:     "  'deliverable_link', :'deliverable_zip_link',",    "  'requester_delivery_payload', jsonb_build_object(",
 1040:     "    'summary_text', :'output_summary_ja',",
 1041:     "    'deliverable_title', :'output_title_ja',",
--- hit line 1040 ---
 1038:     "  ),",
 1039:     "  'deliverable_link', :'deliverable_zip_link',",    "  'requester_delivery_payload', jsonb_build_object(",
 1040:     "    'summary_text', :'output_summary_ja',",
 1041:     "    'deliverable_title', :'output_title_ja',",
 1042:     "    'package_kind', 'deliverable_zip',",
--- hit line 1041 ---
 1039:     "  'deliverable_link', :'deliverable_zip_link',",    "  'requester_delivery_payload', jsonb_build_object(",
 1040:     "    'summary_text', :'output_summary_ja',",
 1041:     "    'deliverable_title', :'output_title_ja',",
 1042:     "    'package_kind', 'deliverable_zip',",
 1043:     "    'deliverable_kind', 'document',",
--- hit line 1042 ---
 1040:     "    'summary_text', :'output_summary_ja',",
 1041:     "    'deliverable_title', :'output_title_ja',",
 1042:     "    'package_kind', 'deliverable_zip',",
 1043:     "    'deliverable_kind', 'document',",
 1044:     "    'body_format', 'markdown',",
--- hit line 1043 ---
 1041:     "    'deliverable_title', :'output_title_ja',",
 1042:     "    'package_kind', 'deliverable_zip',",
 1043:     "    'deliverable_kind', 'document',",
 1044:     "    'body_format', 'markdown',",
 1045:     "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
--- hit line 1045 ---
 1043:     "    'deliverable_kind', 'document',",
 1044:     "    'body_format', 'markdown',",
 1045:     "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
 1046:     "    'deliverable_link', :'deliverable_zip_link',",
 1047:     "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
--- hit line 1046 ---
 1044:     "    'body_format', 'markdown',",
 1045:     "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
 1046:     "    'deliverable_link', :'deliverable_zip_link',",
 1047:     "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
 1048:     "    'deliverable_ref', jsonb_build_object(",
--- hit line 1047 ---
 1045:     "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
 1046:     "    'deliverable_link', :'deliverable_zip_link',",
 1047:     "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
 1048:     "    'deliverable_ref', jsonb_build_object(",
 1049:     "      'source', 'aiworkeros',",
--- hit line 1048 ---
 1046:     "    'deliverable_link', :'deliverable_zip_link',",
 1047:     "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
 1048:     "    'deliverable_ref', jsonb_build_object(",
 1049:     "      'source', 'aiworkeros',",
 1050:     "      'schema', 'aiworker',",
--- hit line 1073 ---
 1071:     source_route_code: sourceRouteCode,
 1072:     requested_by_ref: payload.requested_by_ref || "human",
 1073:     idempotency_key: idempotencyKey,
 1074:     output_title_ja: deliverable.outputTitle,
 1075:     output_body_ja: deliverable.bodyMarkdown,
--- hit line 1074 ---
 1072:     requested_by_ref: payload.requested_by_ref || "human",
 1073:     idempotency_key: idempotencyKey,
 1074:     output_title_ja: deliverable.outputTitle,
 1075:     output_body_ja: deliverable.bodyMarkdown,
 1076:     output_summary_ja: deliverable.summaryText,
--- hit line 1075 ---
 1073:     idempotency_key: idempotencyKey,
 1074:     output_title_ja: deliverable.outputTitle,
 1075:     output_body_ja: deliverable.bodyMarkdown,
 1076:     output_summary_ja: deliverable.summaryText,
 1077:     quality_notes: deliverable.qualityNotes,
```



# 7_EXECUTE_ROUTE_DOC

```
# Execute route candidates if request route only

SELECTED_ROUTE=/aiworker/v1/runtime-execution/request

## POST key result
STATUS=400
HAS_ZIP_HINT=NO
HAS_GENERATED_ARTIFACTS=NO
LOOKS_REQUEST_ONLY=NO
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip/052_post_response.json
DIAGNOSIS=POST_STATUS_NOT_2XX

## Candidate route lines
414:  Common requester-facing deliverable contract for AIWorkerOS runtime execution.
419:  - AIWorkerOS creates the deliverable body and first summary.
420:  - Requester apps store summary_text plus deliverable_ref / deliverable_link.
486:  const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);
488:    `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
508:    "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。",
557:      kind: "main_deliverable",
559:      file_name: "01_main_deliverable.md",
583:    contract_name: "aiworkeros_common_requester_deliverable_contract",
584:    deliverable_kind: "document",
586:    deliverable_package: deliverablePackage,
587:    deliverable_link: deliverablePackage.zip_link,
588:    generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
608:      deliverable_package: deliverablePackage,
609:      deliverable_link: deliverablePackage.zip_link,
610:      generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
631:    deliverablePackage,
640:  Multi-artifact deliverable zip package contract.
643:  - AIWorkerOS creates one or more deliverable artifacts from the instruction.
645:  - AIWorkerOS bundles generated artifacts into one deliverable zip.
646:  - Requester apps display summary_text and link to the zip.
647:  - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
656:  const raw = String(value || fallback || "deliverable").trim();
658:  return safe || String(fallback || "deliverable");
663:  const zipId = `${Date.now()}_${crypto.randomUUID()}`;
665:  const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
666:  const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
669:  // The package metadata is saved to DB before the zip file is written.
670:  // Therefore file_name / zip_link must already use the exact sanitized filename
672:  const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
673:    ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
674:    : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
675:  const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
678:    package_kind: "deliverable_zip",
679:    package_format: "zip",
680:    mime_type: "application/zip",
681:    zip_id: zipId,
683:    zip_link: zipLink,
684:    zip_ref: {
686:      storage_code: "runtime-deliverable-zip",
711:function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
712:  const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
719:      kind: "main_deliverable",
720:      title: deliverable?.outputTitle || "主成果物",
721:      file_name: "01_main_deliverable.md",
722:      body_markdown: deliverable?.bodyMarkdown || ""
726:  if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
731:      body_markdown: deliverable.qualityNotes
735:  if (aiwB6R95R3R3Text(deliverable?.unresolvedIssues)) {
740:      body_markdown: deliverable.unresolvedIssues
744:  if (aiwB6R95R3R3Text(deliverable?.nextSteps)) {
749:      body_markdown: deliverable.nextSteps
846:function aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable) {
851:  const packageMeta = deliverable?.deliverablePackage || aiwB6R95R3D1BuildZipPackageMeta("requester", "deliverables");
852:  const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(deliverable);
854:  const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), "runtime-deliverable-zips");
855:  fs.mkdirSync(zipDir, { recursive: true });
857:  const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip").endsWith(".zip")
858:    ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
859:    : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
860:  const zipPath = path.join(zipDir, fileName);
863:  // Keep the returned zip link aligned with the actual sanitized filename written to disk.
864:  const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
865:  const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {
867:    storage_code: "runtime-deliverable-zip",
871:  const summaryText = response.deliverable?.summary_text || deliverable?.summaryText || "";
874:    contract_name: "aiworkeros_common_requester_multi_artifact_zip_contract",
875:    package_purpose: "bundle_generated_artifacts_for_single_download",
878:    deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
881:    generated_artifacts: generatedArtifacts.map((artifact) => ({
888:    deliverable_ref: response.deliverable_ref || null,
889:    robot_context: response.robot_context || deliverable?.robotContext || null,
890:    generation_basis: response.generation_basis || deliverable?.generationBasis || null,
904:  const zipBuffer = aiwB6R95R3D1ZipStored(entries);
905:  fs.writeFileSync(zipPath, zipBuffer);
906:  const stat = fs.statSync(zipPath);
908:  const zipPublic = {
909:    package_kind: "deliverable_zip",
910:    package_format: "zip",
911:    mime_type: "application/zip",
912:    zip_id: packageMeta.zip_id,
914:    zip_link: actualZipLink,
915:    zip_ref: actualZipRef,
922:  response.generated_artifacts = generatedArtifacts.map((artifact) => ({
929:  response.deliverable_package = zipPublic;
930:  response.deliverable_zip_ref = actualZipRef;
931:  response.deliverable_link = actualZipLink;
935:    deliverable_link: actualZipLink,
936:    deliverable_package: zipPublic,
937:    deliverable_zip_ref: actualZipRef,
938:    generated_artifacts: response.generated_artifacts
941:  response.deliverable = Object.assign({}, response.deliverable || {}, {
942:    deliverable_package: zipPublic,
943:    zip_link: actualZipLink,
944:    generated_artifacts: response.generated_artifacts
974:  const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
1018:    "  'generation_basis', :'generation_basis_jsonb'::jsonb,",    "  'deliverable', jsonb_build_object(",
1019:    "    'package_kind', 'deliverable_zip',",
1020:    "    'deliverable_kind', 'document',",
1023:    "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
1024:    "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
1031:    "    'zip_link', :'deliverable_zip_link'",
1033:    "  'deliv
```



# 8_SERVER_LOG_TAIL

```
AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:8787

```
