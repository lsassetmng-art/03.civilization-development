# B6R95R3Z-R1 E2E Failure Diagnosis Report

RUN_TS=20260509_051647
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051647_b6r95r3z_r1_e2e_failure_diagnosis
PREV_RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke
RUN_CODE=b6r95r3z_taika_aiworkeros_zip_e2e_20260509_051359
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
Diagnose why B6R95R3Z did not confirm zip from the inbound instruction.

## Post response analysis
```
============================================================
POST RESPONSE ANALYSIS
============================================================
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke/072_post_response.json
POST_LOG_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke/071_post_instruction_to_aiworkeros.log
JSON_PARSE=PASS
POST_STATUS_2XX_HINT=NO
AUTH_FAIL=NO
HAS_ZIP_HINT=NO
HAS_SUMMARY_HINT=YES
HAS_GENERATED_ARTIFACTS_HINT=YES
LOOKS_REQUEST_ONLY=NO
IMPORTANT_KEYS_BEGIN
$.result="error"
$.error_code="BAD_REQUEST"
$.message="Idempotency-Key is required"
IMPORTANT_KEYS_END
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
RESPONSE_HEAD_BEGIN
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
RESPONSE_HEAD_END
DIAGNOSIS=POST_STATUS_NOT_2XX
```

## Route context audit
```
============================================================
SERVER ROUTE CONTEXT AUDIT
============================================================
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request
ROUTES_BEGIN
/aiworker/v1/runtime-execution/api-contract
/aiworker/v1/runtime-execution/app-read-payload
/aiworker/v1/runtime-execution/brain-context
/aiworker/v1/runtime-execution/delivery
/aiworker/v1/runtime-execution/endpoint-ready
/aiworker/v1/runtime-execution/persistent-smoke
/aiworker/v1/runtime-execution/pipeline-board
/aiworker/v1/runtime-execution/request
ROUTES_END
------------------------------------------------------------
CONTEXT=selected_route
PATTERN=/aiworker/v1/runtime-execution/request
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
CONTEXT=generated_artifacts
PATTERN=generated_artifacts
FOUND=YES LINE=588
  543:     "",
  544:     "## 7. 次工程",
  545:     nextSteps,
  546:     "",
  547:     "## 8. 安全境界",
  548:     "- external_execution_performed_flag=false",
  549:     "- pg_apply_performed_flag=false",
  550:     "- destructive_action_performed_flag=false",
  551:     "- CX22073JW brain access control is AIWorkerOS-side responsibility",
  552:     ""
  553:   ]);
  554: 
  555:   const generatedArtifacts = [
  556:     {
  557:       kind: "main_deliverable",
  558:       title: outputTitle,
  559:       file_name: "01_main_deliverable.md",
  560:       body_markdown: bodyMarkdown
  561:     },
  562:     {
  563:       kind: "quality_notes",
  564:       title: "品質メモ",
  565:       file_name: "90_quality_notes.md",
  566:       body_markdown: qualityNotes
  567:     },
  568:     {
  569:       kind: "unresolved_issues",
  570:       title: "未解決事項",
  571:       file_name: "91_unresolved_issues.md",
  572:       body_markdown: unresolvedIssues
  573:     },
  574:     {
  575:       kind: "next_steps",
  576:       title: "次工程",
  577:       file_name: "92_next_steps.md",
  578:       body_markdown: nextSteps
  579:     }
  580:   ];
  581:   const outputPayload = {
  582:     contract_version: "B6R95R3B-R3",
  583:     contract_name: "aiworkeros_common_requester_deliverable_contract",
  584:     deliverable_kind: "document",
  585:     body_format: "markdown",
  586:     deliverable_package: deliverablePackage,
  587:     deliverable_link: deliverablePackage.zip_link,
  588:     generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  589:     requester_app_ref: requesterAppRef,
  590:     source_request_ref: sourceRequestRef,
  591:     source_route_code: routeCode,
  592:     app_surface_code: appSurfaceCode,
  593:     robot_context: robotContext,
  594:     generation_basis: generationBasis,
  595:     quality_notes: qualityNotes,
  596:     unresolved_issues: unresolvedIssues,
  597:     next_steps: nextSteps,
  598:     external_execution_performed_flag: false,
  599:     pg_apply_performed_flag: false,
  600:     destructive_action_performed_flag: false
  601:   };
  602: 
  603:   const artifacts = [
  604:     {
  605:       artifact_kind_code: "markdown",
  606:       artifact_title_ja: outputTitle,
  607:       body_format: "markdown",
  608:       deliverable_package: deliverablePackage,
  609:       deliverable_link: deliverablePackage.zip_link,
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  611:       body_markdown: bodyMarkdown,
  612:       summary_text: summaryText,
  613:       quality_notes: qualityNotes,
  614:       unresolved_issues: unresolvedIssues,
  615:       next_steps: nextSteps,
  616:       robot_context: robotContext,
  617:       generation_basis: generationBasis,
  618:       contract_version: "B6R95R3B-R3"
  619:     }
  620:   ];
  621: 
  622:   return {
  623:     outputTitle,
  624:     bodyMarkdown,
  625:     summaryText,
  626:     qualityNotes,
  627:     unresolvedIssues,
  628:     nextSteps,
  629:     robotContext,
  630:     generationBasis,
  631:     deliverablePackage,
  632:     generatedArtifacts,
  633:     outputPayload,
------------------------------------------------------------
CONTEXT=deliverable_package
PATTERN=deliverable_package
FOUND=YES LINE=586
  541:     "## 6. 未解決事項",
  542:     unresolvedIssues,
  543:     "",
  544:     "## 7. 次工程",
  545:     nextSteps,
  546:     "",
  547:     "## 8. 安全境界",
  548:     "- external_execution_performed_flag=false",
  549:     "- pg_apply_performed_flag=false",
  550:     "- destructive_action_performed_flag=false",
  551:     "- CX22073JW brain access control is AIWorkerOS-side responsibility",
  552:     ""
  553:   ]);
  554: 
  555:   const generatedArtifacts = [
  556:     {
  557:       kind: "main_deliverable",
  558:       title: outputTitle,
  559:       file_name: "01_main_deliverable.md",
  560:       body_markdown: bodyMarkdown
  561:     },
  562:     {
  563:       kind: "quality_notes",
  564:       title: "品質メモ",
  565:       file_name: "90_quality_notes.md",
  566:       body_markdown: qualityNotes
  567:     },
  568:     {
  569:       kind: "unresolved_issues",
  570:       title: "未解決事項",
  571:       file_name: "91_unresolved_issues.md",
  572:       body_markdown: unresolvedIssues
  573:     },
  574:     {
  575:       kind: "next_steps",
  576:       title: "次工程",
  577:       file_name: "92_next_steps.md",
  578:       body_markdown: nextSteps
  579:     }
  580:   ];
  581:   const outputPayload = {
  582:     contract_version: "B6R95R3B-R3",
  583:     contract_name: "aiworkeros_common_requester_deliverable_contract",
  584:     deliverable_kind: "document",
  585:     body_format: "markdown",
  586:     deliverable_package: deliverablePackage,
  587:     deliverable_link: deliverablePackage.zip_link,
  588:     generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  589:     requester_app_ref: requesterAppRef,
  590:     source_request_ref: sourceRequestRef,
  591:     source_route_code: routeCode,
  592:     app_surface_code: appSurfaceCode,
  593:     robot_context: robotContext,
  594:     generation_basis: generationBasis,
  595:     quality_notes: qualityNotes,
  596:     unresolved_issues: unresolvedIssues,
  597:     next_steps: nextSteps,
  598:     external_execution_performed_flag: false,
  599:     pg_apply_performed_flag: false,
  600:     destructive_action_performed_flag: false
  601:   };
  602: 
  603:   const artifacts = [
  604:     {
  605:       artifact_kind_code: "markdown",
  606:       artifact_title_ja: outputTitle,
  607:       body_format: "markdown",
  608:       deliverable_package: deliverablePackage,
  609:       deliverable_link: deliverablePackage.zip_link,
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  611:       body_markdown: bodyMarkdown,
  612:       summary_text: summaryText,
  613:       quality_notes: qualityNotes,
  614:       unresolved_issues: unresolvedIssues,
  615:       next_steps: nextSteps,
  616:       robot_context: robotContext,
  617:       generation_basis: generationBasis,
  618:       contract_version: "B6R95R3B-R3"
  619:     }
  620:   ];
  621: 
  622:   return {
  623:     outputTitle,
  624:     bodyMarkdown,
  625:     summaryText,
  626:     qualityNotes,
  627:     unresolvedIssues,
  628:     nextSteps,
  629:     robotContext,
  630:     generationBasis,
  631:     deliverablePackage,
------------------------------------------------------------
CONTEXT=runtime-deliverable-zips
PATTERN=runtime-deliverable-zips
FOUND=YES LINE=854
  809:     central.writeUInt32LE(0x02014b50, 0);
  810:     central.writeUInt16LE(20, 4);
  811:     central.writeUInt16LE(20, 6);
  812:     central.writeUInt16LE(0, 8);
  813:     central.writeUInt16LE(0, 10);
  814:     central.writeUInt16LE(now.dosTime, 12);
  815:     central.writeUInt16LE(now.dosDate, 14);
  816:     central.writeUInt32LE(crc, 16);
  817:     central.writeUInt32LE(dataBuffer.length, 20);
  818:     central.writeUInt32LE(dataBuffer.length, 24);
  819:     central.writeUInt16LE(nameBuffer.length, 28);
  820:     central.writeUInt16LE(0, 30);
  821:     central.writeUInt16LE(0, 32);
  822:     central.writeUInt16LE(0, 34);
  823:     central.writeUInt16LE(0, 36);
  824:     central.writeUInt32LE(0, 38);
  825:     central.writeUInt32LE(offset, 42);
  826:     centralParts.push(central, nameBuffer);
  827: 
  828:     offset += local.length + nameBuffer.length + dataBuffer.length;
  829:   }
  830: 
  831:   const localData = Buffer.concat(localParts);
  832:   const centralDir = Buffer.concat(centralParts);
  833:   const eocd = Buffer.alloc(22);
  834:   eocd.writeUInt32LE(0x06054b50, 0);
  835:   eocd.writeUInt16LE(0, 4);
  836:   eocd.writeUInt16LE(0, 6);
  837:   eocd.writeUInt16LE(entries.length, 8);
  838:   eocd.writeUInt16LE(entries.length, 10);
  839:   eocd.writeUInt32LE(centralDir.length, 12);
  840:   eocd.writeUInt32LE(localData.length, 16);
  841:   eocd.writeUInt16LE(0, 20);
  842: 
  843:   return Buffer.concat([localData, centralDir, eocd]);
  844: }
  845: 
  846: function aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable) {
  847:   const fs = require("fs");
  848:   const path = require("path");
  849: 
  850:   const response = responsePayload && typeof responsePayload === "object" ? responsePayload : {};
  851:   const packageMeta = deliverable?.deliverablePackage || aiwB6R95R3D1BuildZipPackageMeta("requester", "deliverables");
  852:   const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(deliverable);
  853: 
  854:   const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), "runtime-deliverable-zips");
  855:   fs.mkdirSync(zipDir, { recursive: true });
  856: 
  857:   const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip").endsWith(".zip")
  858:     ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
  859:     : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
  860:   const zipPath = path.join(zipDir, fileName);
  861: 
  862:   // AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX
  863:   // Keep the returned zip link aligned with the actual sanitized filename written to disk.
  864:   const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  865:   const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {
  866:     source: "aiworkeros",
  867:     storage_code: "runtime-deliverable-zip",
  868:     file_name: fileName
  869:   });
  870: 
  871:   const summaryText = response.deliverable?.summary_text || deliverable?.summaryText || "";
  872:   const manifest = {
  873:     contract_version: "B6R95R3D-R1",
  874:     contract_name: "aiworkeros_common_requester_multi_artifact_zip_contract",
  875:     package_purpose: "bundle_generated_artifacts_for_single_download",
  876:     request_id: response.request_id || null,
  877:     output_id: response.output_id || null,
  878:     deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
  879:     summary_text: summaryText,
  880:     artifact_count: generatedArtifacts.length,
  881:     generated_artifacts: generatedArtifacts.map((artifact) => ({
  882:       artifact_no: artifact.artifact_no,
  883:       artifact_kind_code: artifact.artifact_kind_code,
  884:       title: artifact.title,
  885:       file_name: artifact.file_name,
  886:       body_format: artifact.body_format
  887:     })),
  888:     deliverable_ref: response.deliverable_ref || null,
  889:     robot_context: response.robot_context || deliverable?.robotContext || null,
  890:     generation_basis: response.generation_basis || deliverable?.generationBasis || null,
  891:     safety: response.safety || null,
  892:     created_at: new Date().toISOString()
  893:   };
  894: 
  895:   const entries = [
  896:     { name: "00_summary.md", content: summaryText },
  897:     ...generatedArtifacts.map((artifact) => ({
  898:       name: artifact.file_name,
  899:       content: artifact.body_markdown
------------------------------------------------------------
CONTEXT=zip_link
PATTERN=zip_link
FOUND=YES LINE=587
  542:     unresolvedIssues,
  543:     "",
  544:     "## 7. 次工程",
  545:     nextSteps,
  546:     "",
  547:     "## 8. 安全境界",
  548:     "- external_execution_performed_flag=false",
  549:     "- pg_apply_performed_flag=false",
  550:     "- destructive_action_performed_flag=false",
  551:     "- CX22073JW brain access control is AIWorkerOS-side responsibility",
  552:     ""
  553:   ]);
  554: 
  555:   const generatedArtifacts = [
  556:     {
  557:       kind: "main_deliverable",
  558:       title: outputTitle,
  559:       file_name: "01_main_deliverable.md",
  560:       body_markdown: bodyMarkdown
  561:     },
  562:     {
  563:       kind: "quality_notes",
  564:       title: "品質メモ",
  565:       file_name: "90_quality_notes.md",
  566:       body_markdown: qualityNotes
  567:     },
  568:     {
  569:       kind: "unresolved_issues",
  570:       title: "未解決事項",
  571:       file_name: "91_unresolved_issues.md",
  572:       body_markdown: unresolvedIssues
  573:     },
  574:     {
  575:       kind: "next_steps",
  576:       title: "次工程",
  577:       file_name: "92_next_steps.md",
  578:       body_markdown: nextSteps
  579:     }
  580:   ];
  581:   const outputPayload = {
  582:     contract_version: "B6R95R3B-R3",
  583:     contract_name: "aiworkeros_common_requester_deliverable_contract",
  584:     deliverable_kind: "document",
  585:     body_format: "markdown",
  586:     deliverable_package: deliverablePackage,
  587:     deliverable_link: deliverablePackage.zip_link,
  588:     generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  589:     requester_app_ref: requesterAppRef,
  590:     source_request_ref: sourceRequestRef,
  591:     source_route_code: routeCode,
  592:     app_surface_code: appSurfaceCode,
  593:     robot_context: robotContext,
  594:     generation_basis: generationBasis,
  595:     quality_notes: qualityNotes,
  596:     unresolved_issues: unresolvedIssues,
  597:     next_steps: nextSteps,
  598:     external_execution_performed_flag: false,
  599:     pg_apply_performed_flag: false,
  600:     destructive_action_performed_flag: false
  601:   };
  602: 
  603:   const artifacts = [
  604:     {
  605:       artifact_kind_code: "markdown",
  606:       artifact_title_ja: outputTitle,
  607:       body_format: "markdown",
  608:       deliverable_package: deliverablePackage,
  609:       deliverable_link: deliverablePackage.zip_link,
  610:       generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  611:       body_markdown: bodyMarkdown,
  612:       summary_text: summaryText,
  613:       quality_notes: qualityNotes,
  614:       unresolved_issues: unresolvedIssues,
  615:       next_steps: nextSteps,
  616:       robot_context: robotContext,
  617:       generation_basis: generationBasis,
  618:       contract_version: "B6R95R3B-R3"
  619:     }
  620:   ];
  621: 
  622:   return {
  623:     outputTitle,
  624:     bodyMarkdown,
  625:     summaryText,
  626:     qualityNotes,
  627:     unresolvedIssues,
  628:     nextSteps,
  629:     robotContext,
  630:     generationBasis,
  631:     deliverablePackage,
  632:     generatedArtifacts,
------------------------------------------------------------
CONTEXT=body_markdown
PATTERN=body_markdown
FOUND=YES LINE=560
  515:     "",
  516:     "## 1. 成果物サマリ",
  517:     summaryText,
  518:     "",
  519:     "## 2. 生成主体",
  520:     `- generation_owner: AIWorkerOS`,
  521:     `- requester_app_ref: ${requesterAppRef}`,
  522:     `- source_request_ref: ${sourceRequestRef || "未指定"}`,
  523:     `- source_route_code: ${routeCode}`,
  524:     `- app_surface_code: ${appSurfaceCode}`,
  525:     "",
  526:     "## 3. 設定ロボット / 性能差の根拠",
  527:     `- model_code: ${modelCode}`,
  528:     `- role_layer_code: ${roleLayerCode}`,
  529:     `- series_code: ${seriesCode}`,
  530:     `- capability_profile_code: ${capabilityProfileCode}`,
  531:     `- task_domain_code: ${taskDomainCode}`,
  532:     `- cx_reference_depth_code: ${cxDepthCode}`,
  533:     `- cx_reference_breadth_code: ${cxBreadthCode}`,
  534:     "",
  535:     "## 4. 成果物本文",
  536:     taskInstruction || "依頼本文が空のため、タスク名と設定ロボット情報を基準に一次成果物を作成しました。",
  537:     "",
  538:     "## 5. 品質メモ",
  539:     qualityNotes,
  540:     "",
  541:     "## 6. 未解決事項",
  542:     unresolvedIssues,
  543:     "",
  544:     "## 7. 次工程",
  545:     nextSteps,
  546:     "",
  547:     "## 8. 安全境界",
  548:     "- external_execution_performed_flag=false",
  549:     "- pg_apply_performed_flag=false",
  550:     "- destructive_action_performed_flag=false",
  551:     "- CX22073JW brain access control is AIWorkerOS-side responsibility",
  552:     ""
  553:   ]);
  554: 
  555:   const generatedArtifacts = [
  556:     {
  557:       kind: "main_deliverable",
  558:       title: outputTitle,
  559:       file_name: "01_main_deliverable.md",
  560:       body_markdown: bodyMarkdown
  561:     },
  562:     {
  563:       kind: "quality_notes",
  564:       title: "品質メモ",
  565:       file_name: "90_quality_notes.md",
  566:       body_markdown: qualityNotes
  567:     },
  568:     {
  569:       kind: "unresolved_issues",
  570:       title: "未解決事項",
  571:       file_name: "91_unresolved_issues.md",
  572:       body_markdown: unresolvedIssues
  573:     },
  574:     {
  575:       kind: "next_steps",
  576:       title: "次工程",
  577:       file_name: "92_next_steps.md",
  578:       body_markdown: nextSteps
  579:     }
  580:   ];
  581:   const outputPayload = {
  582:     contract_version: "B6R95R3B-R3",
  583:     contract_name: "aiworkeros_common_requester_deliverable_contract",
  584:     deliverable_kind: "document",
  585:     body_format: "markdown",
  586:     deliverable_package: deliverablePackage,
  587:     deliverable_link: deliverablePackage.zip_link,
  588:     generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
  589:     requester_app_ref: requesterAppRef,
  590:     source_request_ref: sourceRequestRef,
  591:     source_route_code: routeCode,
  592:     app_surface_code: appSurfaceCode,
  593:     robot_context: robotContext,
  594:     generation_basis: generationBasis,
  595:     quality_notes: qualityNotes,
  596:     unresolved_issues: unresolvedIssues,
  597:     next_steps: nextSteps,
  598:     external_execution_performed_flag: false,
  599:     pg_apply_performed_flag: false,
  600:     destructive_action_performed_flag: false
  601:   };
  602: 
  603:   const artifacts = [
  604:     {
  605:       artifact_kind_code: "markdown",
------------------------------------------------------------
CONTEXT=summary_text
PATTERN=summary_text
FOUND=YES LINE=420
  375:       from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1 p
  376:       left join aiworker.runtime_execution_request rr
  377:         on rr.request_id = p.request_id
  378:       where (nullif(:'request_id','') is null or p.request_id::text = :'request_id')
  379:         and (nullif(:'request_code','') is null or p.request_code = :'request_code')
  380:         and (nullif(:'app_surface_code','') is null or p.app_surface_code = :'app_surface_code')
  381:       order by p.request_created_at desc
  382:       limit :'limit'
  383:     ) t;
  384:   `, {
  385:     request_id: query.get("request_id") || "",
  386:     request_code: query.get("request_code") || "",
  387:     app_surface_code: query.get("app_surface_code") || "",
  388:     limit: normalizeLimit(query.get("limit"))
  389:   });
  390: }
  391: 
  392: function deliveryBoard(query) {
  393:   return psqlJson(`
  394:     select coalesce(jsonb_agg(to_jsonb(t) order by created_at desc), '[]'::jsonb)::text
  395:     from (
  396:       select *
  397:       from aiworker.vw_app_aiworker_runtime_delivery_board_v1
  398:       where (nullif(:'request_id','') is null or request_id::text = :'request_id')
  399:         and (nullif(:'request_code','') is null or request_code = :'request_code')
  400:       order by created_at desc
  401:       limit :'limit'
  402:     ) t;
  403:   `, {
  404:     request_id: query.get("request_id") || "",
  405:     request_code: query.get("request_code") || "",
  406:     limit: normalizeLimit(query.get("limit"))
  407:   });
  408: }
  409: 
  410: 
  411: // AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_START
  412: /*
  413:   B6R95R3B-R3:
  414:   Common requester-facing deliverable contract for AIWorkerOS runtime execution.
  415: 
  416:   Canon:
  417:   - This is not AICM-specific.
  418:   - AICM is one consumer among multiple requester apps / OSs.
  419:   - AIWorkerOS creates the deliverable body and first summary.
  420:   - Requester apps store summary_text plus deliverable_ref / deliverable_link.
  421:   - Robot performance differences are represented through robot_context and generation_basis.
  422: 
  423:   Boundary:
  424:   - No external execution.
  425:   - No PG apply.
  426:   - No destructive action.
  427:   - No AICM-side change in this patch.
  428:   - No CX22073JW access-control change in this patch.
  429: */
  430: function aiwB6R95R3R3Text(value) {
  431:   return String(value ?? "").replace(/\r\n/g, "\n").trim();
  432: }
  433: 
  434: function aiwB6R95R3R3OneLine(value, fallback) {
  435:   const text = aiwB6R95R3R3Text(value || fallback || "");
  436:   return text.replace(/\s+/g, " ").trim();
  437: }
  438: 
  439: function aiwB6R95R3R3Clip(value, maxLen) {
  440:   const text = aiwB6R95R3R3Text(value);
  441:   if (text.length <= maxLen) return text;
  442:   return `${text.slice(0, maxLen)}…`;
  443: }
  444: 
  445: function aiwB6R95R3R3Lines(items) {
  446:   return items.filter((value) => value !== null && value !== undefined && String(value).trim() !== "").join("\n");
  447: }
  448: 
  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
  450:   const requesterAppRef = aiwB6R95R3R3OneLine(payload.source_app_ref, "HTTP_LOCAL");
  451:   const sourceRequestRef = aiwB6R95R3R3OneLine(payload.source_request_ref, "");
  452:   const appSurfaceCode = aiwB6R95R3R3OneLine(payload.app_surface_code, "unknown_app_surface");
  453:   const routeCode = aiwB6R95R3R3OneLine(sourceRouteCode, "unspecified_route");
  454:   const taskTitle = aiwB6R95R3R3OneLine(payload.task_title, "AIWorkerOS成果物");
  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
  456:   const modelCode = aiwB6R95R3R3OneLine(payload.model_code, "unknown_model");
  457:   const roleLayerCode = aiwB6R95R3R3OneLine(payload.role_layer_code || payload.roleLayerCode, "runtime_resolved_by_aiworker");
  458:   const seriesCode = aiwB6R95R3R3OneLine(payload.series_code || payload.seriesCode, "runtime_resolved_by_aiworker");
  459:   const capabilityProfileCode = aiwB6R95R3R3OneLine(payload.capability_profile_code || payload.capabilityProfileCode, "runtime_resolved_by_aiworker");
  460:   const taskDomainCode = aiwB6R95R3R3OneLine(payload.task_domain_code, "unknown_domain");
  461:   const cxDepthCode = aiwB6R95R3R3OneLine(payload.cx_reference_depth_code || payload.cxReferenceDepthCode, "runtime_policy_resolved");
  462:   const cxBreadthCode = aiwB6R95R3R3OneLine(payload.cx_reference_breadth_code || payload.cxReferenceBreadthCode, "runtime_policy_resolved");
  463: 
  464:   const robotContext = {
  465:     model_code: modelCode,
============================================================
SELECTED_ROUTE_LOOKS_REQUEST_CREATE_ONLY=NO
SELECTED_ROUTE_LOOKS_EXECUTE_OR_DELIVERABLE=NO
```

## Current run zip audit
```
============================================================
CURRENT RUN ZIP AUDIT
============================================================
ZIP_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips
PREV_START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke/000_start_marker
PREV_START_MS=1778271239266.7964
PREV_EXISTING_ZIP=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3J_TAIKA_REFORM_DELIVERABLE_TEST_deliverables_1778210507347_9626541a-8462-.zip
RUN_CODE=b6r95r3z_taika_aiworkeros_zip_e2e_20260509_051359
LATEST_ZIPS_BEGIN
mtime=2026-05-08T03:21:48.797Z | size=15582 | after_prev_start=NO | name_matches_run=NO | path=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3J_TAIKA_REFORM_DELIVERABLE_TEST_deliverables_1778210507347_9626541a-8462-.zip
mtime=2026-05-08T03:09:39.012Z | size=7482 | after_prev_start=NO | name_matches_run=NO | path=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3I_ZIP_FINAL_TEST_B6R95R3I_zip_1778209778169_83be4465-4598-41e9-9a76-3c7f7.zip
mtime=2026-05-08T03:02:37.961Z | size=7560 | after_prev_start=NO | name_matches_run=NO | path=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3G_ZIP_LINK_ACTUAL_FILE_TEST_B6R95R3G_zip_1778209356656_467ab070-6351-404e.zip
mtime=2026-05-08T02:58:51.157Z | size=7540 | after_prev_start=NO | name_matches_run=NO | path=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3E_MULTI_ARTIFACT_ZIP_TEST_B6R95R3E_zip_1778209130184_a9d9887b-1449-4d71-8.zip
LATEST_ZIPS_END
CURRENT_RUN_ZIP_COUNT=0
EXACT_RUN_CODE_ZIP_COUNT=0
PREV_EXISTING_ZIP_IS_OLD=YES
DIAGNOSIS=ONLY_OLD_FALLBACK_ZIP_FOUND
```

## Previous zip inspect
```
============================================================
ZIP RESULT INSPECT
============================================================
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_051359_b6r95r3z_aiworkeros_instruction_to_zip_e2e_smoke/072_post_response.json
RUNTIME_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api
FALLBACK_LATEST_ZIP=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3J_TAIKA_REFORM_DELIVERABLE_TEST_deliverables_1778210507347_9626541a-8462-.zip
EXISTING_ZIP=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3J_TAIKA_REFORM_DELIVERABLE_TEST_deliverables_1778210507347_9626541a-8462-.zip
ZIP_SIZE_BYTES=15582
ZIP_MTIME=2026-05-08T03:21:48.797Z
FINAL_STATUS=ZIP_FOUND
```

## Previous zip list
```
EXISTING_ZIP=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3J_TAIKA_REFORM_DELIVERABLE_TEST_deliverables_1778210507347_9626541a-8462-.zip
Archive:  /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3J_TAIKA_REFORM_DELIVERABLE_TEST_deliverables_1778210507347_9626541a-8462-.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
      272  2026-05-08 12:21   00_summary.md
    10802  2026-05-08 12:21   01_main_deliverable.md
      414  2026-05-08 12:21   90_quality_notes.md
      228  2026-05-08 12:21   91_unresolved_issues.md
      209  2026-05-08 12:21   92_next_steps.md
     2967  2026-05-08 12:21   manifest.json
---------                     -------
    14892                     6 files
```

## Next plan
```
# B6R95R3Z-R2 Next Route Plan

## 現在の推定

B6R95R3Z は /aiworker/v1/runtime-execution/request を選択したが、
このrouteは「request作成」までで、成果物生成/zip作成まで実行しない可能性が高い。

## 重要

EXISTING_ZIP が B6R95R3J の古いzipだった場合、
今回のE2E PASSとは扱わない。

## 次に進む条件

### REQUEST_ROUTE_ACCEPTED_BUT_DID_NOT_EXECUTE_ZIP の場合

B6R95R3Z-R2:
- server.jsから実行系routeを特定する
- 候補:
  - workflow-start
  - live-aiworkeros-call
  - execute
  - run
  - worker runtime pipeline
- request create routeではなく、成果物生成まで行くrouteへPOSTする
- または request_id 作成後に execute route をPOSTする二段階テストにする

### POST_STATUS_NOT_2XX の場合

B6R95R3Z-R2:
- response bodyの error_code/message に合わせてpayloadを修正
- まだpatchしない

### 現在runのzipが既にある場合

B6R95R3Z-R2:
- response linkが返らないだけか確認
- zip生成契約のresponse mappingを診断
```

## Secret scan
```
Scan target: previous response/log files only
```
FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R1_POST_STATUS_NOT_2XX
NEXT=B6R95R3Z-R2: 実行route特定後、request作成止まりではなくzip生成まで行くrouteへPOST。
