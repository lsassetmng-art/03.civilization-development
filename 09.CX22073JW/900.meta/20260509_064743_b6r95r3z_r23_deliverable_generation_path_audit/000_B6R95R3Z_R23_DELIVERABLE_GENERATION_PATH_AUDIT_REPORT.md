# B6R95R3Z-R23 Deliverable Generation Path Audit Report

RUN_TS=20260509_064743
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_064743_b6r95r3z_r23_deliverable_generation_path_audit
R20_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_060449_b6r95r3z_r20_clean_instruction_to_zip_retry
R21_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_064228_b6r95r3z_r21_db_response_zip_contract_verify
R22_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_064416_b6r95r3z_r22_deliverable_quality_verify

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- HTTP_GET=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Summary
# B6R95R3Z-R23 Deliverable Generation Path Audit Summary

## Source audit diagnosis
```
HAS_DELIVERABLE_BUILDER=YES
BUILDER_USES_INSTRUCTION_FOR_BODY=YES
BUILDER_USES_BRAIN_CONTEXT_FOR_BODY=NO
REQUEST_ROUTE_FETCHES_OR_INJECTS_BRAIN_CONTEXT=NO
BRAIN_CONTEXT_ENDPOINT_EXISTS=YES
BRIDGE_IS_SELECTOR_V2=YES
DIAGNOSIS=BODY_GENERATION_USES_INSTRUCTION_NOT_CX_MATERIAL
```

## Artifact audit diagnosis
```
MAIN_CHARS=1595
INSTRUCTION_CHARS=175
INSTRUCTION_ECHO_DETECTED=YES
REQUIRED_TERM_MISSING_COUNT=13
REQUIRED_TERM_MISSING=乙巳の変,中大兄皇子,中臣鎌足,蘇我入鹿,645,646,日本書紀,史料批判,段階的,戸籍,班田,租,庸
DIAGNOSIS=CONFIRMED_INSTRUCTION_ECHO_WITH_MISSING_CX_FACTS
```

## R24 patch plan
```
# B6R95R3Z-R24 Minimal Patch Plan

## Target
- AIWorkerOS runtime-execution-http-api/server.js only
- AICM touchなし
- CX DB schema変更なし
- selector v2 / brain-context-bridge.js を新規設計し直さない

## Problem
- R20/R21でinstruction-to-zip契約はPASS
- R22で成果物品質FAIL
- main deliverable body is close to task_instruction_ja echo
- CX source-backed material is not expanded into bodyMarkdown

## Minimal fix direction
1. Keep existing request route and zip contract.
2. Before building deliverable body, call the existing brain context provider/bridge for:
   - model_code
   - purpose_code/use_purpose_code
   - task_domain_code/domain list
   - instruction text
3. Extract top readable materials/chunks from selector v2 response.
4. Build bodyMarkdown from:
   - task title
   - generated summary
   - selected CX material excerpts
   - required sections: overview, timeline, persons, concepts, source_caution, misconception_guard
5. Keep safety flags unchanged.
6. Keep deliverable zip contract unchanged.

## Do not
- Do not patch AICM.
- Do not create new DB tables.
- Do not bypass selector v2.
- Do not use old selector v1 for low-budget/Friend/Lover; v2 with lightweight policy remains canonical.
- Do not push without explicit request.

## R24 verification
- syntax check server.js
- restart server
- POST same R20-style request
- verify zip contract
- verify R22 quality gate passes

## Source audit diagnosis
- BODY_GENERATION_USES_INSTRUCTION_NOT_CX_MATERIAL
```

## Source context key lines
```
20:  190: const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
46:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
52:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
66:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
72:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
89:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
176:  513:   const bodyMarkdown = aiwB6R95R3R3Lines([
198:  513:   const bodyMarkdown = aiwB6R95R3R3Lines([
228:  536:     taskInstruction || "依頼本文が空のため、タスク名と設定ロボット情報を基準に一次成果物を作成しました。",
259:  560:       body_markdown: bodyMarkdown
280:  560:       body_markdown: bodyMarkdown
385:  611:       body_markdown: bodyMarkdown,
410:  611:       body_markdown: bodyMarkdown,
435:  611:       body_markdown: bodyMarkdown,
448:  624:     bodyMarkdown,
457:  611:       body_markdown: bodyMarkdown,
470:  624:     bodyMarkdown,
482:  611:       body_markdown: bodyMarkdown,
495:  624:     bodyMarkdown,
514:  624:     bodyMarkdown,
539:  624:     bodyMarkdown,
561:  624:     bodyMarkdown,
586:  624:     bodyMarkdown,
610:  624:     bodyMarkdown,
655:  722:       body_markdown: deliverable?.bodyMarkdown || ""
680:  722:       body_markdown: deliverable?.bodyMarkdown || ""
696:  722:       body_markdown: deliverable?.bodyMarkdown || ""
1034:  965:   const required = ["app_surface_code", "model_code", "task_domain_code", "task_title", "task_instruction_ja"];
1043:  974:   const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
1051:  965:   const required = ["app_surface_code", "model_code", "task_domain_code", "task_title", "task_instruction_ja"];
1060:  974:   const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
1069:  983:     "    :'task_instruction_ja',",
1077:  974:   const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
1086:  983:     "    :'task_instruction_ja',",
1112: 1068:     task_instruction_ja: payload.task_instruction_ja,
1119: 1075:     output_body_ja: deliverable.bodyMarkdown,
1131: 1068:     task_instruction_ja: payload.task_instruction_ja,
1138: 1075:     output_body_ja: deliverable.bodyMarkdown,
1156: 1068:     task_instruction_ja: payload.task_instruction_ja,
1163: 1075:     output_body_ja: deliverable.bodyMarkdown,
1183: 1075:     output_body_ja: deliverable.bodyMarkdown,
1208: 1075:     output_body_ja: deliverable.bodyMarkdown,
1233: 1075:     output_body_ja: deliverable.bodyMarkdown,
1268: 1156:       const brainContext = buildRuntimeBrainContext({
1280: 1168:           use_purpose_code: brainContext.purposeCode,
1282: 1156:       const brainContext = buildRuntimeBrainContext({
1294: 1168:           use_purpose_code: brainContext.purposeCode,
1295: 1169:           brain_context: brainContext,
1296: 1170:           prompt_brain_context: renderPromptBrainContext(brainContext)
1301: 1175:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
1319: 1168:           use_purpose_code: brainContext.purposeCode,
1320: 1169:           brain_context: brainContext,
1321: 1170:           prompt_brain_context: renderPromptBrainContext(brainContext)
1326: 1175:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
1344: 1168:           use_purpose_code: brainContext.purposeCode,
1345: 1169:           brain_context: brainContext,
1346: 1170:           prompt_brain_context: renderPromptBrainContext(brainContext)
1351: 1175:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
1696:  190: const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
1721:  190: const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
1738:  190: const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
2024:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2030:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2049:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2055:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2074:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2080:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2099:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2105:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2123:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2129:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2148:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2154:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2173:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2179:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2198:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2204:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2223:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2229:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2248:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2254:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2273:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2279:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2298:  449: function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
2304:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2329:  455:   const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
2419:  513:   const bodyMarkdown = aiwB6R95R3R3Lines([
2443:  560:       body_markdown: bodyMarkdown
2467:  560:       body_markdown: bodyMarkdown
2625:  611:       body_markdown: bodyMarkdown,
2650:  611:       body_markdown: bodyMarkdown,
2667:  624:     bodyMarkdown,
2691:  624:     bodyMarkdown,
3439:  722:       body_markdown: deliverable?.bodyMarkdown || ""
3464:  722:       body_markdown: deliverable?.bodyMarkdown || ""
3483:  722:       body_markdown: deliverable?.bodyMarkdown || ""
3508:  722:       body_markdown: deliverable?.bodyMarkdown || ""
3533:  722:       body_markdown: deliverable?.bodyMarkdown || ""
3558:  722:       body_markdown: deliverable?.bodyMarkdown || ""
3576:    3: const PROVIDER_VERSION = "lane10-selector-v2";
3577:    4: const SELECTOR_FUNCTION = "aiworker.fn_robot_brain_runtime_material_select_v2";
3592:    3: const PROVIDER_VERSION = "lane10-selector-v2";
3593:    4: const SELECTOR_FUNCTION = "aiworker.fn_robot_brain_runtime_material_select_v2";
```
FINAL_STATUS=B6R95R3Z_R23_GENERATION_BODY_USES_INSTRUCTION_NOT_CX_MATERIAL_PATCH_REQUIRED_REVIEW_REQUIRED
NEXT=R24でserver.js最小patch案。既存zip契約は触らず、bodyMarkdown生成へCX selector v2 materialを渡す。

## Source audit full log
```
============================================================
SOURCE GENERATION PATH AUDIT
============================================================
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
BRIDGE_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/brain-context-bridge.js
SERVER_BUILD_FUNCTION_CONTEXT_BEGIN
--- hit line 190 ---
  178:     out.items = aiwB6R44gR4ExposeSourceRouteRows(out.items);
  179:   }
  180:   if (out.payload && typeof out.payload === "object") {
  181:     out.payload = aiwB6R44gR4ExposeSourceRoutePayload(out.payload);
  182:   }
  183: 
  184:   return out;
  185: }
  186: // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_SOURCE_ROUTE_HELPER_END
  187: 
  188: 
  189: const http = require("http");
  190: const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
  191: const { URL } = require("url");
  192: const { spawnSync } = require("child_process");
  193: const fs = require("fs");
  194: const path = require("path");
  195: 
  196: const appRoot = __dirname;
  197: const envFile = path.join(appRoot, ".env.local");
  198: 
  199: function loadDotEnv(filePath) {
  200:   if (!fs.existsSync(filePath)) return;
  201:   const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  202:   for (const line of lines) {
--- hit line 449 ---
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
--- hit line 455 ---
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
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
--- hit line 464 ---
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
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
  468:     capability_profile_code: capabilityProfileCode,
  469:     task_domain_code: taskDomainCode
  470:   };
  471: 
  472:   const generationBasis = {
  473:     contract_version: "B6R95R3B-R3",
  474:     generation_owner: "AIWorkerOS",
  475:     requester_app_ref: requesterAppRef,
  476:     source_request_ref: sourceRequestRef,
--- hit line 472 ---
  460:   const taskDomainCode = aiwB6R95R3R3OneLine(payload.task_domain_code, "unknown_domain");
  461:   const cxDepthCode = aiwB6R95R3R3OneLine(payload.cx_reference_depth_code || payload.cxReferenceDepthCode, "runtime_policy_resolved");
  462:   const cxBreadthCode = aiwB6R95R3R3OneLine(payload.cx_reference_breadth_code || payload.cxReferenceBreadthCode, "runtime_policy_resolved");
  463: 
  464:   const robotContext = {
  465:     model_code: modelCode,
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
  468:     capability_profile_code: capabilityProfileCode,
  469:     task_domain_code: taskDomainCode
  470:   };
  471: 
  472:   const generationBasis = {
  473:     contract_version: "B6R95R3B-R3",
  474:     generation_owner: "AIWorkerOS",
  475:     requester_app_ref: requesterAppRef,
  476:     source_request_ref: sourceRequestRef,
  477:     source_route_code: routeCode,
  478:     robot_trait_basis: "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
  479:     cx_depth_basis: cxDepthCode,
  480:     cx_breadth_basis: cxBreadthCode,
  481:     cx_reference_boundary: "CX22073JW is robot brain/reference data. Access-control remains AIWorkerOS-side, not requester-app-side.",
  482:     safety_boundary: "internal_only_no_external_execution_no_pg_apply_no_destructive_action"
  483:   };
  484: 
--- hit line 487 ---
  475:     requester_app_ref: requesterAppRef,
  476:     source_request_ref: sourceRequestRef,
  477:     source_route_code: routeCode,
  478:     robot_trait_basis: "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
  479:     cx_depth_basis: cxDepthCode,
  480:     cx_breadth_basis: cxBreadthCode,
  481:     cx_reference_boundary: "CX22073JW is robot brain/reference data. Access-control remains AIWorkerOS-side, not requester-app-side.",
  482:     safety_boundary: "internal_only_no_external_execution_no_pg_apply_no_destructive_action"
  483:   };
  484: 
  485:   const outputTitle = `${taskTitle} 成果物`;
  486:   const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);
  487:   const summaryText = aiwB6R95R3R3Clip(
  488:     `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
  489:     700
  490:   );
  491: 
  492:   const qualityNotes = aiwB6R95R3R3Lines([
  493:     "AIWorkerOS側で生成した一次成果物です。",
  494:     `設定ロボット: ${modelCode}`,
  495:     `役割レイヤー: ${roleLayerCode}`,
  496:     `タスク領域: ${taskDomainCode}`,
  497:     `CX参照深度: ${cxDepthCode}`,
  498:     `CX参照広さ: ${cxBreadthCode}`,
  499:     "今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。"
--- hit line 513 ---
  501: 
  502:   const unresolvedIssues = aiwB6R95R3R3Lines([
  503:     "この段階では外部実行、PG apply、破壊的操作は行っていません。",
  504:     "追加調査・DB変更・実装反映が必要な場合は、依頼元アプリ側の承認/差し戻し工程で判断してください。"
  505:   ]);
  506: 
  507:   const nextSteps = aiwB6R95R3R3Lines([
  508:     "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。",
  509:     "レビュー画面から成果物本文へ辿れるようにする。",
  510:     "差し戻し時は追加条件をAIWorkerOSへ再依頼する。"
  511:   ]);
  512: 
  513:   const bodyMarkdown = aiwB6R95R3R3Lines([
  514:     `# ${taskTitle}`,
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
--- hit line 517 ---
  505:   ]);
  506: 
  507:   const nextSteps = aiwB6R95R3R3Lines([
  508:     "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。",
  509:     "レビュー画面から成果物本文へ辿れるようにする。",
  510:     "差し戻し時は追加条件をAIWorkerOSへ再依頼する。"
  511:   ]);
  512: 
  513:   const bodyMarkdown = aiwB6R95R3R3Lines([
  514:     `# ${taskTitle}`,
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
--- hit line 536 ---
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
--- hit line 555 ---
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
--- hit line 560 ---
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
--- hit line 588 ---
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
--- hit line 593 ---
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
--- hit line 594 ---
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
--- hit line 610 ---
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
--- hit line 611 ---
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
--- hit line 612 ---
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
--- hit line 616 ---
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
--- hit line 617 ---
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
--- hit line 624 ---
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
  634:     artifacts
  635:   };
  636: }
--- hit line 625 ---
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
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
--- hit line 629 ---
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
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
--- hit line 630 ---
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
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
--- hit line 632 ---
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
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
--- hit line 711 ---
  699:     ? aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}.md`)
  700:     : `${aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}`)}.md`;
  701:   return {
  702:     artifact_no: index + 1,
  703:     artifact_kind_code: kind,
  704:     title,
  705:     file_name: fileName,
  706:     body_markdown: body,
  707:     body_format: "markdown"
  708:   };
  709: }
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
  714:     return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
  715:   }
  716: 
  717:   const artifacts = [
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
--- hit line 712 ---
  700:     : `${aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}`)}.md`;
  701:   return {
  702:     artifact_no: index + 1,
  703:     artifact_kind_code: kind,
  704:     title,
  705:     file_name: fileName,
  706:     body_markdown: body,
  707:     body_format: "markdown"
  708:   };
  709: }
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
  714:     return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
  715:   }
  716: 
  717:   const artifacts = [
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
  724:   ];
--- hit line 722 ---
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
  714:     return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
  715:   }
  716: 
  717:   const artifacts = [
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
  724:   ];
  725: 
  726:   if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
  727:     artifacts.push({
  728:       kind: "quality_notes",
  729:       title: "品質メモ",
  730:       file_name: "90_quality_notes.md",
  731:       body_markdown: deliverable.qualityNotes
  732:     });
  733:   }
  734: 
--- hit line 852 ---
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
--- hit line 871 ---
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
--- hit line 879 ---
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
--- hit line 880 ---
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
--- hit line 881 ---
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
--- hit line 889 ---
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
  900:     })),
  901:     { name: "manifest.json", content: JSON.stringify(manifest, null, 2) }
--- hit line 890 ---
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
  900:     })),
  901:     { name: "manifest.json", content: JSON.stringify(manifest, null, 2) }
  902:   ];
--- hit line 896 ---
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
  900:     })),
  901:     { name: "manifest.json", content: JSON.stringify(manifest, null, 2) }
  902:   ];
  903: 
  904:   const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  905:   fs.writeFileSync(zipPath, zipBuffer);
  906:   const stat = fs.statSync(zipPath);
  907: 
  908:   const zipPublic = {
--- hit line 897 ---
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
  900:     })),
  901:     { name: "manifest.json", content: JSON.stringify(manifest, null, 2) }
  902:   ];
  903: 
  904:   const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  905:   fs.writeFileSync(zipPath, zipBuffer);
  906:   const stat = fs.statSync(zipPath);
  907: 
  908:   const zipPublic = {
  909:     package_kind: "deliverable_zip",
--- hit line 918 ---
  906:   const stat = fs.statSync(zipPath);
  907: 
  908:   const zipPublic = {
  909:     package_kind: "deliverable_zip",
  910:     package_format: "zip",
  911:     mime_type: "application/zip",
  912:     zip_id: packageMeta.zip_id,
  913:     file_name: fileName,
  914:     zip_link: actualZipLink,
  915:     zip_ref: actualZipRef,
  916:     byte_size: stat.size,
  917:     entry_count: entries.length,
  918:     artifact_count: generatedArtifacts.length,
  919:     created_at: manifest.created_at
  920:   };
  921: 
  922:   response.generated_artifacts = generatedArtifacts.map((artifact) => ({
  923:     artifact_no: artifact.artifact_no,
  924:     artifact_kind_code: artifact.artifact_kind_code,
  925:     title: artifact.title,
  926:     file_name: artifact.file_name,
  927:     body_format: artifact.body_format
  928:   }));
  929:   response.deliverable_package = zipPublic;
  930:   response.deliverable_zip_ref = actualZipRef;
--- hit line 922 ---
  910:     package_format: "zip",
  911:     mime_type: "application/zip",
  912:     zip_id: packageMeta.zip_id,
  913:     file_name: fileName,
  914:     zip_link: actualZipLink,
  915:     zip_ref: actualZipRef,
  916:     byte_size: stat.size,
  917:     entry_count: entries.length,
  918:     artifact_count: generatedArtifacts.length,
  919:     created_at: manifest.created_at
  920:   };
  921: 
  922:   response.generated_artifacts = generatedArtifacts.map((artifact) => ({
  923:     artifact_no: artifact.artifact_no,
  924:     artifact_kind_code: artifact.artifact_kind_code,
  925:     title: artifact.title,
  926:     file_name: artifact.file_name,
  927:     body_format: artifact.body_format
  928:   }));
  929:   response.deliverable_package = zipPublic;
  930:   response.deliverable_zip_ref = actualZipRef;
  931:   response.deliverable_link = actualZipLink;
  932: 
  933:   response.requester_delivery_payload = Object.assign({}, response.requester_delivery_payload || {}, {
  934:     summary_text: summaryText,
--- hit line 934 ---
  922:   response.generated_artifacts = generatedArtifacts.map((artifact) => ({
  923:     artifact_no: artifact.artifact_no,
  924:     artifact_kind_code: artifact.artifact_kind_code,
  925:     title: artifact.title,
  926:     file_name: artifact.file_name,
  927:     body_format: artifact.body_format
  928:   }));
  929:   response.deliverable_package = zipPublic;
  930:   response.deliverable_zip_ref = actualZipRef;
  931:   response.deliverable_link = actualZipLink;
  932: 
  933:   response.requester_delivery_payload = Object.assign({}, response.requester_delivery_payload || {}, {
  934:     summary_text: summaryText,
  935:     deliverable_link: actualZipLink,
  936:     deliverable_package: zipPublic,
  937:     deliverable_zip_ref: actualZipRef,
  938:     generated_artifacts: response.generated_artifacts
  939:   });
  940: 
  941:   response.deliverable = Object.assign({}, response.deliverable || {}, {
  942:     deliverable_package: zipPublic,
  943:     zip_link: actualZipLink,
  944:     generated_artifacts: response.generated_artifacts
  945:   });
  946: 
--- hit line 965 ---
  953:   const sourceRouteCode = String(
  954:     payload.source_route_code ||
  955:     payload.sourceRouteCode ||
  956:     payload.source_route ||
  957:     ""
  958:   ).trim();
  959:   if (!idempotencyKey) {
  960:     const e = new Error("Idempotency-Key is required");
  961:     e.httpStatus = 400;
  962:     throw e;
  963:   }
  964: 
  965:   const required = ["app_surface_code", "model_code", "task_domain_code", "task_title", "task_instruction_ja"];
  966:   for (const key of required) {
  967:     if (!payload[key] || String(payload[key]).trim() === "") {
  968:       const e = new Error(`Missing required field: ${key}`);
  969:       e.httpStatus = 400;
  970:       throw e;
  971:     }
  972:   }
  973: 
  974:   const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
  975: 
  976:   const sql = [
  977:     "with created as (",
--- hit line 974 ---
  962:     throw e;
  963:   }
  964: 
  965:   const required = ["app_surface_code", "model_code", "task_domain_code", "task_title", "task_instruction_ja"];
  966:   for (const key of required) {
  967:     if (!payload[key] || String(payload[key]).trim() === "") {
  968:       const e = new Error(`Missing required field: ${key}`);
  969:       e.httpStatus = 400;
  970:       throw e;
  971:     }
  972:   }
  973: 
  974:   const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
  975: 
  976:   const sql = [
  977:     "with created as (",
  978:     "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
  979:     "    :'app_surface_code',",
  980:     "    :'model_code',",
  981:     "    :'task_domain_code',",
  982:     "    :'task_title',",
  983:     "    :'task_instruction_ja',",
  984:     "    :'source_app_ref',",
  985:     "    :'source_request_ref',",
  986:     "    :'requested_by_ref',",
--- hit line 983 ---
  971:     }
  972:   }
  973: 
  974:   const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
  975: 
  976:   const sql = [
  977:     "with created as (",
  978:     "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
  979:     "    :'app_surface_code',",
  980:     "    :'model_code',",
  981:     "    :'task_domain_code',",
  982:     "    :'task_title',",
  983:     "    :'task_instruction_ja',",
  984:     "    :'source_app_ref',",
  985:     "    :'source_request_ref',",
  986:     "    :'requested_by_ref',",
  987:     "    :'idempotency_key',",
  988:     "    :'source_route_code'",
  989:     "  ) as request_id",
  990:     "),",
  991:     "worker_output as (",
  992:     "  select aiworker.fn_runtime_execution_submit_worker_output(",
  993:     "    (select request_id from created),",
  994:     "    :'output_title_ja',",
  995:     "    :'output_body_ja',",
--- hit line 1068 ---
 1056:     "    'external_execution_performed_flag', false,",
 1057:     "    'pg_apply_performed_flag', false,",
 1058:     "    'destructive_action_performed_flag', false",
 1059:     "  )",
 1060:     ")::text;",
 1061:   ].join("\n");
 1062: 
 1063:   const responsePayload = psqlJson(sql, {
 1064:     app_surface_code: payload.app_surface_code,
 1065:     model_code: payload.model_code,
 1066:     task_domain_code: payload.task_domain_code,
 1067:     task_title: payload.task_title,
 1068:     task_instruction_ja: payload.task_instruction_ja,
 1069:     source_app_ref: payload.source_app_ref || "HTTP_LOCAL",
 1070:     source_request_ref: payload.source_request_ref || "",
 1071:     source_route_code: sourceRouteCode,
 1072:     requested_by_ref: payload.requested_by_ref || "human",
 1073:     idempotency_key: idempotencyKey,
 1074:     output_title_ja: deliverable.outputTitle,
 1075:     output_body_ja: deliverable.bodyMarkdown,
 1076:     output_summary_ja: deliverable.summaryText,
 1077:     quality_notes: deliverable.qualityNotes,
 1078:     unresolved_issues: deliverable.unresolvedIssues,
 1079:     next_steps: deliverable.nextSteps,
 1080:     deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
--- hit line 1075 ---
 1063:   const responsePayload = psqlJson(sql, {
 1064:     app_surface_code: payload.app_surface_code,
 1065:     model_code: payload.model_code,
 1066:     task_domain_code: payload.task_domain_code,
 1067:     task_title: payload.task_title,
 1068:     task_instruction_ja: payload.task_instruction_ja,
 1069:     source_app_ref: payload.source_app_ref || "HTTP_LOCAL",
 1070:     source_request_ref: payload.source_request_ref || "",
 1071:     source_route_code: sourceRouteCode,
 1072:     requested_by_ref: payload.requested_by_ref || "human",
 1073:     idempotency_key: idempotencyKey,
 1074:     output_title_ja: deliverable.outputTitle,
 1075:     output_body_ja: deliverable.bodyMarkdown,
 1076:     output_summary_ja: deliverable.summaryText,
 1077:     quality_notes: deliverable.qualityNotes,
 1078:     unresolved_issues: deliverable.unresolvedIssues,
 1079:     next_steps: deliverable.nextSteps,
 1080:     deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
 1081:     deliverable_zip_link: deliverable.deliverablePackage.zip_link,
 1082:     generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),
 1083:     robot_context_jsonb: JSON.stringify(deliverable.robotContext),
 1084:     generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),
 1085:     output_payload_jsonb: JSON.stringify(deliverable.outputPayload),
 1086:     artifacts_jsonb: JSON.stringify(deliverable.artifacts)
 1087:   });
--- hit line 1076 ---
 1064:     app_surface_code: payload.app_surface_code,
 1065:     model_code: payload.model_code,
 1066:     task_domain_code: payload.task_domain_code,
 1067:     task_title: payload.task_title,
 1068:     task_instruction_ja: payload.task_instruction_ja,
 1069:     source_app_ref: payload.source_app_ref || "HTTP_LOCAL",
 1070:     source_request_ref: payload.source_request_ref || "",
 1071:     source_route_code: sourceRouteCode,
 1072:     requested_by_ref: payload.requested_by_ref || "human",
 1073:     idempotency_key: idempotencyKey,
 1074:     output_title_ja: deliverable.outputTitle,
 1075:     output_body_ja: deliverable.bodyMarkdown,
 1076:     output_summary_ja: deliverable.summaryText,
 1077:     quality_notes: deliverable.qualityNotes,
 1078:     unresolved_issues: deliverable.unresolvedIssues,
 1079:     next_steps: deliverable.nextSteps,
 1080:     deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
 1081:     deliverable_zip_link: deliverable.deliverablePackage.zip_link,
 1082:     generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),
 1083:     robot_context_jsonb: JSON.stringify(deliverable.robotContext),
 1084:     generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),
 1085:     output_payload_jsonb: JSON.stringify(deliverable.outputPayload),
 1086:     artifacts_jsonb: JSON.stringify(deliverable.artifacts)
 1087:   });
 1088: 
--- hit line 1082 ---
 1070:     source_request_ref: payload.source_request_ref || "",
 1071:     source_route_code: sourceRouteCode,
 1072:     requested_by_ref: payload.requested_by_ref || "human",
 1073:     idempotency_key: idempotencyKey,
 1074:     output_title_ja: deliverable.outputTitle,
 1075:     output_body_ja: deliverable.bodyMarkdown,
 1076:     output_summary_ja: deliverable.summaryText,
 1077:     quality_notes: deliverable.qualityNotes,
 1078:     unresolved_issues: deliverable.unresolvedIssues,
 1079:     next_steps: deliverable.nextSteps,
 1080:     deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
 1081:     deliverable_zip_link: deliverable.deliverablePackage.zip_link,
 1082:     generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),
 1083:     robot_context_jsonb: JSON.stringify(deliverable.robotContext),
 1084:     generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),
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
--- hit line 1083 ---
 1071:     source_route_code: sourceRouteCode,
 1072:     requested_by_ref: payload.requested_by_ref || "human",
 1073:     idempotency_key: idempotencyKey,
 1074:     output_title_ja: deliverable.outputTitle,
 1075:     output_body_ja: deliverable.bodyMarkdown,
 1076:     output_summary_ja: deliverable.summaryText,
 1077:     quality_notes: deliverable.qualityNotes,
 1078:     unresolved_issues: deliverable.unresolvedIssues,
 1079:     next_steps: deliverable.nextSteps,
 1080:     deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
 1081:     deliverable_zip_link: deliverable.deliverablePackage.zip_link,
 1082:     generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),
 1083:     robot_context_jsonb: JSON.stringify(deliverable.robotContext),
 1084:     generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),
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
--- hit line 1084 ---
 1072:     requested_by_ref: payload.requested_by_ref || "human",
 1073:     idempotency_key: idempotencyKey,
 1074:     output_title_ja: deliverable.outputTitle,
 1075:     output_body_ja: deliverable.bodyMarkdown,
 1076:     output_summary_ja: deliverable.summaryText,
 1077:     quality_notes: deliverable.qualityNotes,
 1078:     unresolved_issues: deliverable.unresolvedIssues,
 1079:     next_steps: deliverable.nextSteps,
 1080:     deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
 1081:     deliverable_zip_link: deliverable.deliverablePackage.zip_link,
 1082:     generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),
 1083:     robot_context_jsonb: JSON.stringify(deliverable.robotContext),
 1084:     generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),
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
--- hit line 1156 ---
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
--- hit line 1168 ---
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
--- hit line 1169 ---
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
--- hit line 1170 ---
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
SERVER_BUILD_FUNCTION_CONTEXT_END
SERVER_REQUEST_ROUTE_CONTEXT_BEGIN
--- hit line 24 ---
   12: */
   13: function aiwB6R44fPlainObject(value) {
   14:   return value && typeof value === "object" && !Array.isArray(value) ? value : {};
   15: }
   16: 
   17: function aiwB6R44fText(value) {
   18:   return value == null ? "" : String(value).trim();
   19: }
   20: 
   21: function aiwB6R44fExtractSourceRouteMetadata(input) {
   22:   const body = aiwB6R44fPlainObject(input);
   23:   const metadata = aiwB6R44fPlainObject(body.metadata_jsonb);
   24:   const appRead = aiwB6R44fPlainObject(body.app_read_payload_jsonb);
   25:   const source = aiwB6R44fPlainObject(appRead.source);
   26: 
   27:   const sourceAppRef = aiwB6R44fText(
   28:     body.source_app_ref ||
   29:     metadata.source_app_ref ||
   30:     source.source_app_ref ||
   31:     body.app_surface_code ||
   32:     "AICompanyManager"
   33:   );
   34: 
   35:   const sourceRouteCode = aiwB6R44fText(
   36:     body.source_route_code ||
--- hit line 85 ---
   73:   const contextRestoreId = aiwB6R44fText(body.context_restore_id || metadata.context_restore_id || source.context_restore_id);
   74: 
   75:   if (returnTargetType) route.return_target_type = returnTargetType;
   76:   if (returnTargetId) route.return_target_id = returnTargetId;
   77:   if (reexecuteTargetType) route.reexecute_target_type = reexecuteTargetType;
   78:   if (reexecuteTargetId) route.reexecute_target_id = reexecuteTargetId;
   79:   if (contextRestoreType) route.context_restore_type = contextRestoreType;
   80:   if (contextRestoreId) route.context_restore_id = contextRestoreId;
   81: 
   82:   return route;
   83: }
   84: 
   85: function aiwB6R44fMergeSourceRouteIntoAppReadPayload(appReadPayload, input) {
   86:   const base = aiwB6R44fPlainObject(appReadPayload);
   87:   const route = aiwB6R44fExtractSourceRouteMetadata(input);
   88:   if (!route.source_route_code) return base;
   89:   return Object.assign({}, base, {
   90:     source: Object.assign({}, aiwB6R44fPlainObject(base.source), route)
   91:   });
   92: }
   93: 
   94: function aiwB6R44fExposeSourceRouteOnRow(row) {
   95:   const out = Object.assign({}, aiwB6R44fPlainObject(row));
   96:   const appRead = aiwB6R44fPlainObject(out.app_read_payload_jsonb);
   97:   const source = aiwB6R44fPlainObject(appRead.source);
--- hit line 86 ---
   74: 
   75:   if (returnTargetType) route.return_target_type = returnTargetType;
   76:   if (returnTargetId) route.return_target_id = returnTargetId;
   77:   if (reexecuteTargetType) route.reexecute_target_type = reexecuteTargetType;
   78:   if (reexecuteTargetId) route.reexecute_target_id = reexecuteTargetId;
   79:   if (contextRestoreType) route.context_restore_type = contextRestoreType;
   80:   if (contextRestoreId) route.context_restore_id = contextRestoreId;
   81: 
   82:   return route;
   83: }
   84: 
   85: function aiwB6R44fMergeSourceRouteIntoAppReadPayload(appReadPayload, input) {
   86:   const base = aiwB6R44fPlainObject(appReadPayload);
   87:   const route = aiwB6R44fExtractSourceRouteMetadata(input);
   88:   if (!route.source_route_code) return base;
   89:   return Object.assign({}, base, {
   90:     source: Object.assign({}, aiwB6R44fPlainObject(base.source), route)
   91:   });
   92: }
   93: 
   94: function aiwB6R44fExposeSourceRouteOnRow(row) {
   95:   const out = Object.assign({}, aiwB6R44fPlainObject(row));
   96:   const appRead = aiwB6R44fPlainObject(out.app_read_payload_jsonb);
   97:   const source = aiwB6R44fPlainObject(appRead.source);
   98:   const route = aiwB6R44fExtractSourceRouteMetadata(Object.assign({}, out, {
--- hit line 96 ---
   84: 
   85: function aiwB6R44fMergeSourceRouteIntoAppReadPayload(appReadPayload, input) {
   86:   const base = aiwB6R44fPlainObject(appReadPayload);
   87:   const route = aiwB6R44fExtractSourceRouteMetadata(input);
   88:   if (!route.source_route_code) return base;
   89:   return Object.assign({}, base, {
   90:     source: Object.assign({}, aiwB6R44fPlainObject(base.source), route)
   91:   });
   92: }
   93: 
   94: function aiwB6R44fExposeSourceRouteOnRow(row) {
   95:   const out = Object.assign({}, aiwB6R44fPlainObject(row));
   96:   const appRead = aiwB6R44fPlainObject(out.app_read_payload_jsonb);
   97:   const source = aiwB6R44fPlainObject(appRead.source);
   98:   const route = aiwB6R44fExtractSourceRouteMetadata(Object.assign({}, out, {
   99:     metadata_jsonb: out.metadata_jsonb,
  100:     app_read_payload_jsonb: aiwB6R44fMergeSourceRouteIntoAppReadPayload(appRead, body || payload || requestBody || input || {}),
  101:     source_app_ref: out.source_app_ref || source.source_app_ref,
  102:     source_route_code: out.source_route_code || source.source_route_code,
  103:     source_screen_code: out.source_screen_code || source.source_screen_code,
  104:     source_entity_type: out.source_entity_type || source.source_entity_type,
  105:     source_entity_id: out.source_entity_id || source.source_entity_id
  106:   }));
  107: 
  108:   if (route.source_app_ref && !out.source_app_ref) out.source_app_ref = route.source_app_ref;
--- hit line 100 ---
   88:   if (!route.source_route_code) return base;
   89:   return Object.assign({}, base, {
   90:     source: Object.assign({}, aiwB6R44fPlainObject(base.source), route)
   91:   });
   92: }
   93: 
   94: function aiwB6R44fExposeSourceRouteOnRow(row) {
   95:   const out = Object.assign({}, aiwB6R44fPlainObject(row));
   96:   const appRead = aiwB6R44fPlainObject(out.app_read_payload_jsonb);
   97:   const source = aiwB6R44fPlainObject(appRead.source);
   98:   const route = aiwB6R44fExtractSourceRouteMetadata(Object.assign({}, out, {
   99:     metadata_jsonb: out.metadata_jsonb,
  100:     app_read_payload_jsonb: aiwB6R44fMergeSourceRouteIntoAppReadPayload(appRead, body || payload || requestBody || input || {}),
  101:     source_app_ref: out.source_app_ref || source.source_app_ref,
  102:     source_route_code: out.source_route_code || source.source_route_code,
  103:     source_screen_code: out.source_screen_code || source.source_screen_code,
  104:     source_entity_type: out.source_entity_type || source.source_entity_type,
  105:     source_entity_id: out.source_entity_id || source.source_entity_id
  106:   }));
  107: 
  108:   if (route.source_app_ref && !out.source_app_ref) out.source_app_ref = route.source_app_ref;
  109:   if (route.source_route_code && !out.source_route_code) out.source_route_code = route.source_route_code;
  110:   if (route.source_screen_code && !out.source_screen_code) out.source_screen_code = route.source_screen_code;
  111:   if (route.source_entity_type && !out.source_entity_type) out.source_entity_type = route.source_entity_type;
  112:   if (route.source_entity_id && !out.source_entity_id) out.source_entity_id = route.source_entity_id;
--- hit line 115 ---
  103:     source_screen_code: out.source_screen_code || source.source_screen_code,
  104:     source_entity_type: out.source_entity_type || source.source_entity_type,
  105:     source_entity_id: out.source_entity_id || source.source_entity_id
  106:   }));
  107: 
  108:   if (route.source_app_ref && !out.source_app_ref) out.source_app_ref = route.source_app_ref;
  109:   if (route.source_route_code && !out.source_route_code) out.source_route_code = route.source_route_code;
  110:   if (route.source_screen_code && !out.source_screen_code) out.source_screen_code = route.source_screen_code;
  111:   if (route.source_entity_type && !out.source_entity_type) out.source_entity_type = route.source_entity_type;
  112:   if (route.source_entity_id && !out.source_entity_id) out.source_entity_id = route.source_entity_id;
  113: 
  114:   if (route.source_route_code) {
  115:     out.app_read_payload_jsonb = aiwB6R44fMergeSourceRouteIntoAppReadPayload(appRead, route);
  116:   }
  117:   return out;
  118: }
  119: 
  120: function aiwB6R44fExposeSourceRouteOnRows(value) {
  121:   if (Array.isArray(value)) return value.map(aiwB6R44fExposeSourceRouteOnRow);
  122:   return value;
  123: }
  124: // AIWORKEROS_V10L_C2G_B6R44F_SOURCE_ROUTE_METADATA_END
  125: 
  126: // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_SOURCE_ROUTE_HELPER_START
  127: /*
--- hit line 140 ---
  128:   B6R44G-R4:
  129:   SendJson boundary wrapper.
  130:   Exposes source route metadata only for runtime-shaped rows.
  131: */
  132: function aiwB6R44gR4PlainObject(value) {
  133:   return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  134: }
  135: 
  136: function aiwB6R44gR4LooksRuntimeRow(row) {
  137:   if (!row || typeof row !== "object" || Array.isArray(row)) return false;
  138:   if (row.request_id || row.runtime_execution_request_id || row.request_code) return true;
  139:   if (row.request_status_code || row.output_status_code || row.delivery_status_code) return true;
  140:   if (row.app_surface_code || row.app_read_payload_jsonb) return true;
  141:   return false;
  142: }
  143: 
  144: function aiwB6R44gR4ExposeSourceRouteRow(row) {
  145:   if (!aiwB6R44gR4LooksRuntimeRow(row)) return row;
  146: 
  147:   const out = aiwB6R44fExposeSourceRouteOnRow(row);
  148:   const appRead = aiwB6R44gR4PlainObject(out.app_read_payload_jsonb);
  149:   const source = aiwB6R44gR4PlainObject(appRead.source);
  150: 
  151:   if (source.source_app_ref && !out.source_app_ref) out.source_app_ref = source.source_app_ref;
  152:   if (source.source_route_code && !out.source_route_code) out.source_route_code = source.source_route_code;
--- hit line 148 ---
  136: function aiwB6R44gR4LooksRuntimeRow(row) {
  137:   if (!row || typeof row !== "object" || Array.isArray(row)) return false;
  138:   if (row.request_id || row.runtime_execution_request_id || row.request_code) return true;
  139:   if (row.request_status_code || row.output_status_code || row.delivery_status_code) return true;
  140:   if (row.app_surface_code || row.app_read_payload_jsonb) return true;
  141:   return false;
  142: }
  143: 
  144: function aiwB6R44gR4ExposeSourceRouteRow(row) {
  145:   if (!aiwB6R44gR4LooksRuntimeRow(row)) return row;
  146: 
  147:   const out = aiwB6R44fExposeSourceRouteOnRow(row);
  148:   const appRead = aiwB6R44gR4PlainObject(out.app_read_payload_jsonb);
  149:   const source = aiwB6R44gR4PlainObject(appRead.source);
  150: 
  151:   if (source.source_app_ref && !out.source_app_ref) out.source_app_ref = source.source_app_ref;
  152:   if (source.source_route_code && !out.source_route_code) out.source_route_code = source.source_route_code;
  153:   if (source.source_screen_code && !out.source_screen_code) out.source_screen_code = source.source_screen_code;
  154:   if (source.source_entity_type && !out.source_entity_type) out.source_entity_type = source.source_entity_type;
  155:   if (source.source_entity_id && !out.source_entity_id) out.source_entity_id = source.source_entity_id;
  156: 
  157:   return out;
  158: }
  159: 
  160: function aiwB6R44gR4ExposeSourceRouteRows(rows) {
--- hit line 165 ---
  153:   if (source.source_screen_code && !out.source_screen_code) out.source_screen_code = source.source_screen_code;
  154:   if (source.source_entity_type && !out.source_entity_type) out.source_entity_type = source.source_entity_type;
  155:   if (source.source_entity_id && !out.source_entity_id) out.source_entity_id = source.source_entity_id;
  156: 
  157:   return out;
  158: }
  159: 
  160: function aiwB6R44gR4ExposeSourceRouteRows(rows) {
  161:   if (!Array.isArray(rows)) return rows;
  162:   return rows.map(aiwB6R44gR4ExposeSourceRouteRow);
  163: }
  164: 
  165: function aiwB6R44gR4ExposeSourceRoutePayload(payload) {
  166:   if (!payload || typeof payload !== "object") return payload;
  167:   if (Array.isArray(payload)) return aiwB6R44gR4ExposeSourceRouteRows(payload);
  168: 
  169:   const out = Object.assign({}, payload);
  170: 
  171:   if (Array.isArray(out.data)) {
  172:     out.data = aiwB6R44gR4ExposeSourceRouteRows(out.data);
  173:   }
  174:   if (Array.isArray(out.rows)) {
  175:     out.rows = aiwB6R44gR4ExposeSourceRouteRows(out.rows);
  176:   }
  177:   if (Array.isArray(out.items)) {
--- hit line 166 ---
  154:   if (source.source_entity_type && !out.source_entity_type) out.source_entity_type = source.source_entity_type;
  155:   if (source.source_entity_id && !out.source_entity_id) out.source_entity_id = source.source_entity_id;
  156: 
  157:   return out;
  158: }
  159: 
  160: function aiwB6R44gR4ExposeSourceRouteRows(rows) {
  161:   if (!Array.isArray(rows)) return rows;
  162:   return rows.map(aiwB6R44gR4ExposeSourceRouteRow);
  163: }
  164: 
  165: function aiwB6R44gR4ExposeSourceRoutePayload(payload) {
  166:   if (!payload || typeof payload !== "object") return payload;
  167:   if (Array.isArray(payload)) return aiwB6R44gR4ExposeSourceRouteRows(payload);
  168: 
  169:   const out = Object.assign({}, payload);
  170: 
  171:   if (Array.isArray(out.data)) {
  172:     out.data = aiwB6R44gR4ExposeSourceRouteRows(out.data);
  173:   }
  174:   if (Array.isArray(out.rows)) {
  175:     out.rows = aiwB6R44gR4ExposeSourceRouteRows(out.rows);
  176:   }
  177:   if (Array.isArray(out.items)) {
  178:     out.items = aiwB6R44gR4ExposeSourceRouteRows(out.items);
--- hit line 167 ---
  155:   if (source.source_entity_id && !out.source_entity_id) out.source_entity_id = source.source_entity_id;
  156: 
  157:   return out;
  158: }
  159: 
  160: function aiwB6R44gR4ExposeSourceRouteRows(rows) {
  161:   if (!Array.isArray(rows)) return rows;
  162:   return rows.map(aiwB6R44gR4ExposeSourceRouteRow);
  163: }
  164: 
  165: function aiwB6R44gR4ExposeSourceRoutePayload(payload) {
  166:   if (!payload || typeof payload !== "object") return payload;
  167:   if (Array.isArray(payload)) return aiwB6R44gR4ExposeSourceRouteRows(payload);
  168: 
  169:   const out = Object.assign({}, payload);
  170: 
  171:   if (Array.isArray(out.data)) {
  172:     out.data = aiwB6R44gR4ExposeSourceRouteRows(out.data);
  173:   }
  174:   if (Array.isArray(out.rows)) {
  175:     out.rows = aiwB6R44gR4ExposeSourceRouteRows(out.rows);
  176:   }
  177:   if (Array.isArray(out.items)) {
  178:     out.items = aiwB6R44gR4ExposeSourceRouteRows(out.items);
  179:   }
--- hit line 169 ---
  157:   return out;
  158: }
  159: 
  160: function aiwB6R44gR4ExposeSourceRouteRows(rows) {
  161:   if (!Array.isArray(rows)) return rows;
  162:   return rows.map(aiwB6R44gR4ExposeSourceRouteRow);
  163: }
  164: 
  165: function aiwB6R44gR4ExposeSourceRoutePayload(payload) {
  166:   if (!payload || typeof payload !== "object") return payload;
  167:   if (Array.isArray(payload)) return aiwB6R44gR4ExposeSourceRouteRows(payload);
  168: 
  169:   const out = Object.assign({}, payload);
  170: 
  171:   if (Array.isArray(out.data)) {
  172:     out.data = aiwB6R44gR4ExposeSourceRouteRows(out.data);
  173:   }
  174:   if (Array.isArray(out.rows)) {
  175:     out.rows = aiwB6R44gR4ExposeSourceRouteRows(out.rows);
  176:   }
  177:   if (Array.isArray(out.items)) {
  178:     out.items = aiwB6R44gR4ExposeSourceRouteRows(out.items);
  179:   }
  180:   if (out.payload && typeof out.payload === "object") {
  181:     out.payload = aiwB6R44gR4ExposeSourceRoutePayload(out.payload);
--- hit line 180 ---
  168: 
  169:   const out = Object.assign({}, payload);
  170: 
  171:   if (Array.isArray(out.data)) {
  172:     out.data = aiwB6R44gR4ExposeSourceRouteRows(out.data);
  173:   }
  174:   if (Array.isArray(out.rows)) {
  175:     out.rows = aiwB6R44gR4ExposeSourceRouteRows(out.rows);
  176:   }
  177:   if (Array.isArray(out.items)) {
  178:     out.items = aiwB6R44gR4ExposeSourceRouteRows(out.items);
  179:   }
  180:   if (out.payload && typeof out.payload === "object") {
  181:     out.payload = aiwB6R44gR4ExposeSourceRoutePayload(out.payload);
  182:   }
  183: 
  184:   return out;
  185: }
  186: // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_SOURCE_ROUTE_HELPER_END
  187: 
  188: 
  189: const http = require("http");
  190: const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
  191: const { URL } = require("url");
  192: const { spawnSync } = require("child_process");
--- hit line 181 ---
  169:   const out = Object.assign({}, payload);
  170: 
  171:   if (Array.isArray(out.data)) {
  172:     out.data = aiwB6R44gR4ExposeSourceRouteRows(out.data);
  173:   }
  174:   if (Array.isArray(out.rows)) {
  175:     out.rows = aiwB6R44gR4ExposeSourceRouteRows(out.rows);
  176:   }
  177:   if (Array.isArray(out.items)) {
  178:     out.items = aiwB6R44gR4ExposeSourceRouteRows(out.items);
  179:   }
  180:   if (out.payload && typeof out.payload === "object") {
  181:     out.payload = aiwB6R44gR4ExposeSourceRoutePayload(out.payload);
  182:   }
  183: 
  184:   return out;
  185: }
  186: // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_SOURCE_ROUTE_HELPER_END
  187: 
  188: 
  189: const http = require("http");
  190: const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
  191: const { URL } = require("url");
  192: const { spawnSync } = require("child_process");
  193: const fs = require("fs");
--- hit line 190 ---
  178:     out.items = aiwB6R44gR4ExposeSourceRouteRows(out.items);
  179:   }
  180:   if (out.payload && typeof out.payload === "object") {
  181:     out.payload = aiwB6R44gR4ExposeSourceRoutePayload(out.payload);
  182:   }
  183: 
  184:   return out;
  185: }
  186: // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_SOURCE_ROUTE_HELPER_END
  187: 
  188: 
  189: const http = require("http");
  190: const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
  191: const { URL } = require("url");
  192: const { spawnSync } = require("child_process");
  193: const fs = require("fs");
  194: const path = require("path");
  195: 
  196: const appRoot = __dirname;
  197: const envFile = path.join(appRoot, ".env.local");
  198: 
  199: function loadDotEnv(filePath) {
  200:   if (!fs.existsSync(filePath)) return;
  201:   const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  202:   for (const line of lines) {
--- hit line 229 ---
  217: const authToken = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN;
  218: if (!authToken) {
  219:   console.error("ERROR: PERSONA_AIWORKEROS_AUTH_TOKEN is required");
  220:   process.exit(1);
  221: }
  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
  223: 
  224: if (!databaseUrl) {
  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
  226:   process.exit(1);
  227: }
  228: 
  229: function sendJson(res, status, payload) {
  230:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_START
  231:   try {
  232:     payload = aiwB6R44gR4ExposeSourceRoutePayload(payload);
  233:   } catch (_b6r44gR4Error) {
  234:     // Keep sendJson stable for non-runtime payloads.
  235:   }
  236:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_END
  237: 
  238:   res.writeHead(status, {
  239:     "Content-Type": "application/json; charset=utf-8",
  240:     "Cache-Control": "no-store"
  241:   });
--- hit line 232 ---
  220:   process.exit(1);
  221: }
  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
  223: 
  224: if (!databaseUrl) {
  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
  226:   process.exit(1);
  227: }
  228: 
  229: function sendJson(res, status, payload) {
  230:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_START
  231:   try {
  232:     payload = aiwB6R44gR4ExposeSourceRoutePayload(payload);
  233:   } catch (_b6r44gR4Error) {
  234:     // Keep sendJson stable for non-runtime payloads.
  235:   }
  236:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_END
  237: 
  238:   res.writeHead(status, {
  239:     "Content-Type": "application/json; charset=utf-8",
  240:     "Cache-Control": "no-store"
  241:   });
  242:   res.end(JSON.stringify(payload, null, 2));
  243: }
  244: 
--- hit line 234 ---
  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
  223: 
  224: if (!databaseUrl) {
  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
  226:   process.exit(1);
  227: }
  228: 
  229: function sendJson(res, status, payload) {
  230:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_START
  231:   try {
  232:     payload = aiwB6R44gR4ExposeSourceRoutePayload(payload);
  233:   } catch (_b6r44gR4Error) {
  234:     // Keep sendJson stable for non-runtime payloads.
  235:   }
  236:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_END
  237: 
  238:   res.writeHead(status, {
  239:     "Content-Type": "application/json; charset=utf-8",
  240:     "Cache-Control": "no-store"
  241:   });
  242:   res.end(JSON.stringify(payload, null, 2));
  243: }
  244: 
  245: function readBody(req) {
  246:   return new Promise((resolve, reject) => {
--- hit line 242 ---
  230:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_START
  231:   try {
  232:     payload = aiwB6R44gR4ExposeSourceRoutePayload(payload);
  233:   } catch (_b6r44gR4Error) {
  234:     // Keep sendJson stable for non-runtime payloads.
  235:   }
  236:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_END
  237: 
  238:   res.writeHead(status, {
  239:     "Content-Type": "application/json; charset=utf-8",
  240:     "Cache-Control": "no-store"
  241:   });
  242:   res.end(JSON.stringify(payload, null, 2));
  243: }
  244: 
  245: function readBody(req) {
  246:   return new Promise((resolve, reject) => {
  247:     let body = "";
  248:     req.on("data", chunk => {
  249:       body += chunk;
  250:       if (body.length > 1024 * 1024) {
  251:         reject(new Error("Request body too large"));
  252:         req.destroy();
  253:       }
  254:     });
--- hit line 370 ---
  358:         and (nullif(:'app_surface_code','') is null or p.app_surface_code = :'app_surface_code')
  359:       order by p.request_created_at desc
  360:       limit :'limit'
  361:     ) t;
  362:   `, {
  363:     request_id: query.get("request_id") || "",
  364:     request_code: query.get("request_code") || "",
  365:     app_surface_code: query.get("app_surface_code") || "",
  366:     limit: normalizeLimit(query.get("limit"))
  367:   });
  368: }
  369: 
  370: function appReadPayload(query) {
  371:   return psqlJson(`
  372:     select coalesce(jsonb_agg(to_jsonb(t) order by request_created_at desc), '[]'::jsonb)::text
  373:     from (
  374:       select p.*, rr.source_route_code
  375:       from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1 p
  376:       left join aiworker.runtime_execution_request rr
  377:         on rr.request_id = p.request_id
  378:       where (nullif(:'request_id','') is null or p.request_id::text = :'request_id')
  379:         and (nullif(:'request_code','') is null or p.request_code = :'request_code')
  380:         and (nullif(:'app_surface_code','') is null or p.app_surface_code = :'app_surface_code')
  381:       order by p.request_created_at desc
  382:       limit :'limit'
--- hit line 375 ---
  363:     request_id: query.get("request_id") || "",
  364:     request_code: query.get("request_code") || "",
  365:     app_surface_code: query.get("app_surface_code") || "",
  366:     limit: normalizeLimit(query.get("limit"))
  367:   });
  368: }
  369: 
  370: function appReadPayload(query) {
  371:   return psqlJson(`
  372:     select coalesce(jsonb_agg(to_jsonb(t) order by request_created_at desc), '[]'::jsonb)::text
  373:     from (
  374:       select p.*, rr.source_route_code
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
--- hit line 411 ---
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
--- hit line 414 ---
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
--- hit line 419 ---
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
--- hit line 420 ---
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
--- hit line 449 ---
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
--- hit line 450 ---
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
--- hit line 451 ---
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
--- hit line 452 ---
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
--- hit line 454 ---
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
  466:     role_layer_code: roleLayerCode,
--- hit line 455 ---
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
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
--- hit line 456 ---
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
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
  468:     capability_profile_code: capabilityProfileCode,
--- hit line 457 ---
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
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
  468:     capability_profile_code: capabilityProfileCode,
  469:     task_domain_code: taskDomainCode
--- hit line 458 ---
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
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
  468:     capability_profile_code: capabilityProfileCode,
  469:     task_domain_code: taskDomainCode
  470:   };
--- hit line 459 ---
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
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
  468:     capability_profile_code: capabilityProfileCode,
  469:     task_domain_code: taskDomainCode
  470:   };
  471: 
--- hit line 460 ---
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
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
  468:     capability_profile_code: capabilityProfileCode,
  469:     task_domain_code: taskDomainCode
  470:   };
  471: 
  472:   const generationBasis = {
--- hit line 461 ---
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
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
  468:     capability_profile_code: capabilityProfileCode,
  469:     task_domain_code: taskDomainCode
  470:   };
  471: 
  472:   const generationBasis = {
  473:     contract_version: "B6R95R3B-R3",
--- hit line 462 ---
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
  466:     role_layer_code: roleLayerCode,
  467:     series_code: seriesCode,
  468:     capability_profile_code: capabilityProfileCode,
  469:     task_domain_code: taskDomainCode
  470:   };
  471: 
  472:   const generationBasis = {
  473:     contract_version: "B6R95R3B-R3",
  474:     generation_owner: "AIWorkerOS",
--- hit line 486 ---
  474:     generation_owner: "AIWorkerOS",
  475:     requester_app_ref: requesterAppRef,
  476:     source_request_ref: sourceRequestRef,
  477:     source_route_code: routeCode,
  478:     robot_trait_basis: "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
  479:     cx_depth_basis: cxDepthCode,
  480:     cx_breadth_basis: cxBreadthCode,
  481:     cx_reference_boundary: "CX22073JW is robot brain/reference data. Access-control remains AIWorkerOS-side, not requester-app-side.",
  482:     safety_boundary: "internal_only_no_external_execution_no_pg_apply_no_destructive_action"
  483:   };
  484: 
  485:   const outputTitle = `${taskTitle} 成果物`;
  486:   const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);
  487:   const summaryText = aiwB6R95R3R3Clip(
  488:     `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
  489:     700
  490:   );
  491: 
  492:   const qualityNotes = aiwB6R95R3R3Lines([
  493:     "AIWorkerOS側で生成した一次成果物です。",
  494:     `設定ロボット: ${modelCode}`,
  495:     `役割レイヤー: ${roleLayerCode}`,
  496:     `タスク領域: ${taskDomainCode}`,
  497:     `CX参照深度: ${cxDepthCode}`,
  498:     `CX参照広さ: ${cxBreadthCode}`,
--- hit line 488 ---
  476:     source_request_ref: sourceRequestRef,
  477:     source_route_code: routeCode,
  478:     robot_trait_basis: "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
  479:     cx_depth_basis: cxDepthCode,
  480:     cx_breadth_basis: cxBreadthCode,
  481:     cx_reference_boundary: "CX22073JW is robot brain/reference data. Access-control remains AIWorkerOS-side, not requester-app-side.",
  482:     safety_boundary: "internal_only_no_external_execution_no_pg_apply_no_destructive_action"
  483:   };
  484: 
  485:   const outputTitle = `${taskTitle} 成果物`;
  486:   const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);
  487:   const summaryText = aiwB6R95R3R3Clip(
  488:     `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
  489:     700
  490:   );
  491: 
  492:   const qualityNotes = aiwB6R95R3R3Lines([
  493:     "AIWorkerOS側で生成した一次成果物です。",
  494:     `設定ロボット: ${modelCode}`,
  495:     `役割レイヤー: ${roleLayerCode}`,
  496:     `タスク領域: ${taskDomainCode}`,
  497:     `CX参照深度: ${cxDepthCode}`,
  498:     `CX参照広さ: ${cxBreadthCode}`,
  499:     "今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。"
  500:   ]);
--- hit line 508 ---
  496:     `タスク領域: ${taskDomainCode}`,
  497:     `CX参照深度: ${cxDepthCode}`,
  498:     `CX参照広さ: ${cxBreadthCode}`,
  499:     "今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。"
  500:   ]);
  501: 
  502:   const unresolvedIssues = aiwB6R95R3R3Lines([
  503:     "この段階では外部実行、PG apply、破壊的操作は行っていません。",
  504:     "追加調査・DB変更・実装反映が必要な場合は、依頼元アプリ側の承認/差し戻し工程で判断してください。"
  505:   ]);
  506: 
  507:   const nextSteps = aiwB6R95R3R3Lines([
  508:     "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。",
  509:     "レビュー画面から成果物本文へ辿れるようにする。",
  510:     "差し戻し時は追加条件をAIWorkerOSへ再依頼する。"
  511:   ]);
  512: 
  513:   const bodyMarkdown = aiwB6R95R3R3Lines([
  514:     `# ${taskTitle}`,
  515:     "",
  516:     "## 1. 成果物サマリ",
  517:     summaryText,
  518:     "",
  519:     "## 2. 生成主体",
  520:     `- generation_owner: AIWorkerOS`,
--- hit line 557 ---
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
--- hit line 559 ---
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
--- hit line 581 ---
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
--- hit line 583 ---
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
--- hit line 584 ---
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
--- hit line 586 ---
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
--- hit line 587 ---
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
--- hit line 608 ---
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
--- hit line 609 ---
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
--- hit line 631 ---
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
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
--- hit line 633 ---
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
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
--- hit line 637 ---
  625:     summaryText,
  626:     qualityNotes,
  627:     unresolvedIssues,
  628:     nextSteps,
  629:     robotContext,
  630:     generationBasis,
  631:     deliverablePackage,
  632:     generatedArtifacts,
  633:     outputPayload,
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
  649:   Boundary:
--- hit line 640 ---
  628:     nextSteps,
  629:     robotContext,
  630:     generationBasis,
  631:     deliverablePackage,
  632:     generatedArtifacts,
  633:     outputPayload,
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
  649:   Boundary:
  650:   - No external execution.
  651:   - No PG apply.
  652:   - No destructive action.
--- hit line 643 ---
  631:     deliverablePackage,
  632:     generatedArtifacts,
  633:     outputPayload,
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
  649:   Boundary:
  650:   - No external execution.
  651:   - No PG apply.
  652:   - No destructive action.
  653:   - No requester-app-specific contract.
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
--- hit line 645 ---
  633:     outputPayload,
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
  649:   Boundary:
  650:   - No external execution.
  651:   - No PG apply.
  652:   - No destructive action.
  653:   - No requester-app-specific contract.
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
--- hit line 646 ---
  634:     artifacts
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
  649:   Boundary:
  650:   - No external execution.
  651:   - No PG apply.
  652:   - No destructive action.
  653:   - No requester-app-specific contract.
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
--- hit line 647 ---
  635:   };
  636: }
  637: // AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
  638: /*
  639:   B6R95R3D-R1:
  640:   Multi-artifact deliverable zip package contract.
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
  649:   Boundary:
  650:   - No external execution.
  651:   - No PG apply.
  652:   - No destructive action.
  653:   - No requester-app-specific contract.
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
--- hit line 656 ---
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
  649:   Boundary:
  650:   - No external execution.
  651:   - No PG apply.
  652:   - No destructive action.
  653:   - No requester-app-specific contract.
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
--- hit line 658 ---
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
  649:   Boundary:
  650:   - No external execution.
  651:   - No PG apply.
  652:   - No destructive action.
  653:   - No requester-app-specific contract.
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
--- hit line 661 ---
  649:   Boundary:
  650:   - No external execution.
  651:   - No PG apply.
  652:   - No destructive action.
  653:   - No requester-app-specific contract.
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
--- hit line 663 ---
  651:   - No PG apply.
  652:   - No destructive action.
  653:   - No requester-app-specific contract.
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
--- hit line 665 ---
  653:   - No requester-app-specific contract.
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
--- hit line 666 ---
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
--- hit line 668 ---
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
--- hit line 669 ---
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
--- hit line 670 ---
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
--- hit line 671 ---
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
--- hit line 672 ---
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
--- hit line 673 ---
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
--- hit line 674 ---
  662:   const crypto = require("crypto");
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
--- hit line 675 ---
  663:   const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  664:   const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  665:   const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
  687:       file_name: fileName
--- hit line 678 ---
  666:   const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
  687:       file_name: fileName
  688:     }
  689:   };
  690: }
--- hit line 679 ---
  667: 
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
  687:       file_name: fileName
  688:     }
  689:   };
  690: }
  691: 
--- hit line 680 ---
  668:   // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
  687:       file_name: fileName
  688:     }
  689:   };
  690: }
  691: 
  692: function aiwB6R95R3D1NormalizeGeneratedArtifact(item, index) {
--- hit line 681 ---
  669:   // The package metadata is saved to DB before the zip file is written.
  670:   // Therefore file_name / zip_link must already use the exact sanitized filename
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
  687:       file_name: fileName
  688:     }
  689:   };
  690: }
  691: 
  692: function aiwB6R95R3D1NormalizeGeneratedArtifact(item, index) {
  693:   const seq = String(index + 1).padStart(2, "0");
--- hit line 683 ---
  671:   // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
  687:       file_name: fileName
  688:     }
  689:   };
  690: }
  691: 
  692: function aiwB6R95R3D1NormalizeGeneratedArtifact(item, index) {
  693:   const seq = String(index + 1).padStart(2, "0");
  694:   const kind = aiwB6R95R3R3OneLine(item?.artifact_kind_code || item?.kind || "document", "document");
  695:   const title = aiwB6R95R3R3OneLine(item?.title || item?.artifact_title_ja || `成果物${seq}`, `成果物${seq}`);
--- hit line 684 ---
  672:   const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
  673:     ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
  687:       file_name: fileName
  688:     }
  689:   };
  690: }
  691: 
  692: function aiwB6R95R3D1NormalizeGeneratedArtifact(item, index) {
  693:   const seq = String(index + 1).padStart(2, "0");
  694:   const kind = aiwB6R95R3R3OneLine(item?.artifact_kind_code || item?.kind || "document", "document");
  695:   const title = aiwB6R95R3R3OneLine(item?.title || item?.artifact_title_ja || `成果物${seq}`, `成果物${seq}`);
  696:   const body = aiwB6R95R3R3Text(item?.body_markdown || item?.body_text || item?.content || "");
--- hit line 686 ---
  674:     : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  675:   const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  676: 
  677:   return {
  678:     package_kind: "deliverable_zip",
  679:     package_format: "zip",
  680:     mime_type: "application/zip",
  681:     zip_id: zipId,
  682:     file_name: fileName,
  683:     zip_link: zipLink,
  684:     zip_ref: {
  685:       source: "aiworkeros",
  686:       storage_code: "runtime-deliverable-zip",
  687:       file_name: fileName
  688:     }
  689:   };
  690: }
  691: 
  692: function aiwB6R95R3D1NormalizeGeneratedArtifact(item, index) {
  693:   const seq = String(index + 1).padStart(2, "0");
  694:   const kind = aiwB6R95R3R3OneLine(item?.artifact_kind_code || item?.kind || "document", "document");
  695:   const title = aiwB6R95R3R3OneLine(item?.title || item?.artifact_title_ja || `成果物${seq}`, `成果物${seq}`);
  696:   const body = aiwB6R95R3R3Text(item?.body_markdown || item?.body_text || item?.content || "");
  697:   const suggestedName = item?.file_name || `${seq}_${aiwB6R95R3D1SafeFilePart(title, `artifact_${seq}`)}.md`;
  698:   const fileName = aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}.md`).endsWith(".md")
--- hit line 711 ---
  699:     ? aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}.md`)
  700:     : `${aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}`)}.md`;
  701:   return {
  702:     artifact_no: index + 1,
  703:     artifact_kind_code: kind,
  704:     title,
  705:     file_name: fileName,
  706:     body_markdown: body,
  707:     body_format: "markdown"
  708:   };
  709: }
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
  714:     return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
  715:   }
  716: 
  717:   const artifacts = [
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
--- hit line 712 ---
  700:     : `${aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}`)}.md`;
  701:   return {
  702:     artifact_no: index + 1,
  703:     artifact_kind_code: kind,
  704:     title,
  705:     file_name: fileName,
  706:     body_markdown: body,
  707:     body_format: "markdown"
  708:   };
  709: }
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
  714:     return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
  715:   }
  716: 
  717:   const artifacts = [
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
  724:   ];
--- hit line 719 ---
  707:     body_format: "markdown"
  708:   };
  709: }
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
  714:     return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
  715:   }
  716: 
  717:   const artifacts = [
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
  724:   ];
  725: 
  726:   if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
  727:     artifacts.push({
  728:       kind: "quality_notes",
  729:       title: "品質メモ",
  730:       file_name: "90_quality_notes.md",
  731:       body_markdown: deliverable.qualityNotes
--- hit line 720 ---
  708:   };
  709: }
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
  714:     return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
  715:   }
  716: 
  717:   const artifacts = [
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
  724:   ];
  725: 
  726:   if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
  727:     artifacts.push({
  728:       kind: "quality_notes",
  729:       title: "品質メモ",
  730:       file_name: "90_quality_notes.md",
  731:       body_markdown: deliverable.qualityNotes
  732:     });
--- hit line 721 ---
  709: }
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
  714:     return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
  715:   }
  716: 
  717:   const artifacts = [
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
  724:   ];
  725: 
  726:   if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
  727:     artifacts.push({
  728:       kind: "quality_notes",
  729:       title: "品質メモ",
  730:       file_name: "90_quality_notes.md",
  731:       body_markdown: deliverable.qualityNotes
  732:     });
  733:   }
--- hit line 722 ---
  710: 
  711: function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  712:   const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  713:   if (provided.length > 0) {
  714:     return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
  715:   }
  716: 
  717:   const artifacts = [
  718:     {
  719:       kind: "main_deliverable",
  720:       title: deliverable?.outputTitle || "主成果物",
  721:       file_name: "01_main_deliverable.md",
  722:       body_markdown: deliverable?.bodyMarkdown || ""
  723:     }
  724:   ];
  725: 
  726:   if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
  727:     artifacts.push({
  728:       kind: "quality_notes",
  729:       title: "品質メモ",
  730:       file_name: "90_quality_notes.md",
  731:       body_markdown: deliverable.qualityNotes
  732:     });
  733:   }
  734: 
SERVER_REQUEST_ROUTE_CONTEXT_END
BRIDGE_SELECTOR_CONTEXT_BEGIN
--- hit line 3 ---
    1: const { execFileSync } = require("node:child_process");
    2: 
    3: const PROVIDER_VERSION = "lane10-selector-v2";
    4: const SELECTOR_FUNCTION = "aiworker.fn_robot_brain_runtime_material_select_v2";
    5: 
    6: function valueOf(input, keys, fallback = undefined) {
    7:   if (!input) return fallback;
    8: 
    9:   if (typeof input.get === "function") {
   10:     for (const key of keys) {
   11:       const value = input.get(key);
   12:       if (value !== null && value !== undefined && String(value).trim() !== "") return value;
   13:     }
   14:   }
   15: 
--- hit line 4 ---
    1: const { execFileSync } = require("node:child_process");
    2: 
    3: const PROVIDER_VERSION = "lane10-selector-v2";
    4: const SELECTOR_FUNCTION = "aiworker.fn_robot_brain_runtime_material_select_v2";
    5: 
    6: function valueOf(input, keys, fallback = undefined) {
    7:   if (!input) return fallback;
    8: 
    9:   if (typeof input.get === "function") {
   10:     for (const key of keys) {
   11:       const value = input.get(key);
   12:       if (value !== null && value !== undefined && String(value).trim() !== "") return value;
   13:     }
   14:   }
   15: 
   16:   if (typeof input === "object") {
--- hit line 52 ---
   40:   }
   41:   return [];
   42: }
   43: 
   44: function sqlTextArrayOrNull(values) {
   45:   const list = normalizeDomainCodes(values);
   46:   if (list.length === 0) return "NULL::text[]";
   47:   return `ARRAY[${list.map(sqlText).join(",")} ]::text[]`;
   48: }
   49: 
   50: function normalizeOptions(input = {}) {
   51:   const modelCode =
   52:     valueOf(input, ["modelCode", "model_code", "model"], process.env.AIWORKER_MODEL_CODE || "HD-R5P");
   53: 
   54:   const purposeCode =
   55:     valueOf(
   56:       input,
   57:       ["purposeCode", "usePurposeCode", "use_purpose_code", "purpose_code", "purpose"],
   58:       process.env.AIWORKER_USE_PURPOSE_CODE || "reference"
   59:     );
   60: 
   61:   const domainCodes = normalizeDomainCodes(
   62:     valueOf(input, ["domainCodes", "domain_codes", "domains", "brain_domains"], process.env.AIWORKER_BRAIN_DOMAINS || "")
   63:   );
   64: 
--- hit line 57 ---
   45:   const list = normalizeDomainCodes(values);
   46:   if (list.length === 0) return "NULL::text[]";
   47:   return `ARRAY[${list.map(sqlText).join(",")} ]::text[]`;
   48: }
   49: 
   50: function normalizeOptions(input = {}) {
   51:   const modelCode =
   52:     valueOf(input, ["modelCode", "model_code", "model"], process.env.AIWORKER_MODEL_CODE || "HD-R5P");
   53: 
   54:   const purposeCode =
   55:     valueOf(
   56:       input,
   57:       ["purposeCode", "usePurposeCode", "use_purpose_code", "purpose_code", "purpose"],
   58:       process.env.AIWORKER_USE_PURPOSE_CODE || "reference"
   59:     );
   60: 
   61:   const domainCodes = normalizeDomainCodes(
   62:     valueOf(input, ["domainCodes", "domain_codes", "domains", "brain_domains"], process.env.AIWORKER_BRAIN_DOMAINS || "")
   63:   );
   64: 
   65:   const limitPerDomain = toInt(
   66:     valueOf(input, ["limitPerDomain", "limit_per_domain"], process.env.AIWORKER_BRAIN_LIMIT_PER_DOMAIN || "20"),
   67:     20,
   68:     1,
   69:     100
--- hit line 58 ---
   46:   if (list.length === 0) return "NULL::text[]";
   47:   return `ARRAY[${list.map(sqlText).join(",")} ]::text[]`;
   48: }
   49: 
   50: function normalizeOptions(input = {}) {
   51:   const modelCode =
   52:     valueOf(input, ["modelCode", "model_code", "model"], process.env.AIWORKER_MODEL_CODE || "HD-R5P");
   53: 
   54:   const purposeCode =
   55:     valueOf(
   56:       input,
   57:       ["purposeCode", "usePurposeCode", "use_purpose_code", "purpose_code", "purpose"],
   58:       process.env.AIWORKER_USE_PURPOSE_CODE || "reference"
   59:     );
   60: 
   61:   const domainCodes = normalizeDomainCodes(
   62:     valueOf(input, ["domainCodes", "domain_codes", "domains", "brain_domains"], process.env.AIWORKER_BRAIN_DOMAINS || "")
   63:   );
   64: 
   65:   const limitPerDomain = toInt(
   66:     valueOf(input, ["limitPerDomain", "limit_per_domain"], process.env.AIWORKER_BRAIN_LIMIT_PER_DOMAIN || "20"),
   67:     20,
   68:     1,
   69:     100
   70:   );
--- hit line 62 ---
   50: function normalizeOptions(input = {}) {
   51:   const modelCode =
   52:     valueOf(input, ["modelCode", "model_code", "model"], process.env.AIWORKER_MODEL_CODE || "HD-R5P");
   53: 
   54:   const purposeCode =
   55:     valueOf(
   56:       input,
   57:       ["purposeCode", "usePurposeCode", "use_purpose_code", "purpose_code", "purpose"],
   58:       process.env.AIWORKER_USE_PURPOSE_CODE || "reference"
   59:     );
   60: 
   61:   const domainCodes = normalizeDomainCodes(
   62:     valueOf(input, ["domainCodes", "domain_codes", "domains", "brain_domains"], process.env.AIWORKER_BRAIN_DOMAINS || "")
   63:   );
   64: 
   65:   const limitPerDomain = toInt(
   66:     valueOf(input, ["limitPerDomain", "limit_per_domain"], process.env.AIWORKER_BRAIN_LIMIT_PER_DOMAIN || "20"),
   67:     20,
   68:     1,
   69:     100
   70:   );
   71: 
   72:   const totalLimit = toInt(
   73:     valueOf(input, ["totalLimit", "total_limit", "materialLimit", "material_limit"], process.env.AIWORKER_BRAIN_TOTAL_LIMIT || "80"),
   74:     80,
--- hit line 73 ---
   61:   const domainCodes = normalizeDomainCodes(
   62:     valueOf(input, ["domainCodes", "domain_codes", "domains", "brain_domains"], process.env.AIWORKER_BRAIN_DOMAINS || "")
   63:   );
   64: 
   65:   const limitPerDomain = toInt(
   66:     valueOf(input, ["limitPerDomain", "limit_per_domain"], process.env.AIWORKER_BRAIN_LIMIT_PER_DOMAIN || "20"),
   67:     20,
   68:     1,
   69:     100
   70:   );
   71: 
   72:   const totalLimit = toInt(
   73:     valueOf(input, ["totalLimit", "total_limit", "materialLimit", "material_limit"], process.env.AIWORKER_BRAIN_TOTAL_LIMIT || "80"),
   74:     80,
   75:     1,
   76:     300
   77:   );
   78: 
   79:   return {
   80:     modelCode: String(modelCode),
   81:     purposeCode: String(purposeCode),
   82:     domainCodes,
   83:     limitPerDomain,
   84:     totalLimit,
   85:   };
--- hit line 139 ---
  127:   FROM ${SELECTOR_FUNCTION}(
  128:     ${sqlText(o.modelCode)},
  129:     ${sqlText(o.purposeCode)},
  130:     ${sqlTextArrayOrNull(o.domainCodes)},
  131:     ${o.limitPerDomain},
  132:     ${o.totalLimit}
  133:   )
  134: ),
  135: domain_rows AS (
  136:   SELECT
  137:     s.brain_domain_code,
  138:     max(s.brain_domain_label_ja) AS brain_domain_label_ja,
  139:     count(*) AS material_count,
  140:     jsonb_agg(
  141:       jsonb_build_object(
  142:         'brainDataCode', s.brain_data_code,
  143:         'unitCode', s.unit_code,
  144:         'unitTitleJa', s.unit_title_ja,
  145:         'unitSummaryJa', s.unit_summary_ja,
  146:         'unitDetailJa', s.unit_detail_ja,
  147:         'practicalUseJa', s.practical_use_ja,
  148:         'examplePromptJa', s.example_prompt_ja,
  149:         'safetyBoundaryJa', s.safety_boundary_ja,
  150:         'materialSourceKind', s.material_source_kind,
  151:         'depthCode', s.depth_code,
--- hit line 150 ---
  138:     max(s.brain_domain_label_ja) AS brain_domain_label_ja,
  139:     count(*) AS material_count,
  140:     jsonb_agg(
  141:       jsonb_build_object(
  142:         'brainDataCode', s.brain_data_code,
  143:         'unitCode', s.unit_code,
  144:         'unitTitleJa', s.unit_title_ja,
  145:         'unitSummaryJa', s.unit_summary_ja,
  146:         'unitDetailJa', s.unit_detail_ja,
  147:         'practicalUseJa', s.practical_use_ja,
  148:         'examplePromptJa', s.example_prompt_ja,
  149:         'safetyBoundaryJa', s.safety_boundary_ja,
  150:         'materialSourceKind', s.material_source_kind,
  151:         'depthCode', s.depth_code,
  152:         'dataDepthLevel', s.data_depth_level,
  153:         'riskClassCode', s.risk_class_code,
  154:         'domainRank', s.domain_rank,
  155:         'overallRank', s.overall_rank,
  156:         'selectionScore', s.selection_score,
  157:         'selectionReasonJa', s.selection_reason_ja,
  158:         'effectiveUsePurposeCodes', COALESCE(to_jsonb(s.effective_use_purpose_codes), '[]'::jsonb),
  159:         'tags', COALESCE(to_jsonb(s.tags), '[]'::jsonb)
  160:       )
  161:       ORDER BY s.overall_rank
  162:     ) AS material_summaries
--- hit line 158 ---
  146:         'unitDetailJa', s.unit_detail_ja,
  147:         'practicalUseJa', s.practical_use_ja,
  148:         'examplePromptJa', s.example_prompt_ja,
  149:         'safetyBoundaryJa', s.safety_boundary_ja,
  150:         'materialSourceKind', s.material_source_kind,
  151:         'depthCode', s.depth_code,
  152:         'dataDepthLevel', s.data_depth_level,
  153:         'riskClassCode', s.risk_class_code,
  154:         'domainRank', s.domain_rank,
  155:         'overallRank', s.overall_rank,
  156:         'selectionScore', s.selection_score,
  157:         'selectionReasonJa', s.selection_reason_ja,
  158:         'effectiveUsePurposeCodes', COALESCE(to_jsonb(s.effective_use_purpose_codes), '[]'::jsonb),
  159:         'tags', COALESCE(to_jsonb(s.tags), '[]'::jsonb)
  160:       )
  161:       ORDER BY s.overall_rank
  162:     ) AS material_summaries
  163:   FROM selected s
  164:   GROUP BY s.brain_domain_code
  165: ),
  166: summary AS (
  167:   SELECT
  168:     count(*)::int AS source_count,
  169:     count(*)::int AS material_count,
  170:     count(DISTINCT brain_domain_code)::int AS domain_count,
--- hit line 162 ---
  150:         'materialSourceKind', s.material_source_kind,
  151:         'depthCode', s.depth_code,
  152:         'dataDepthLevel', s.data_depth_level,
  153:         'riskClassCode', s.risk_class_code,
  154:         'domainRank', s.domain_rank,
  155:         'overallRank', s.overall_rank,
  156:         'selectionScore', s.selection_score,
  157:         'selectionReasonJa', s.selection_reason_ja,
  158:         'effectiveUsePurposeCodes', COALESCE(to_jsonb(s.effective_use_purpose_codes), '[]'::jsonb),
  159:         'tags', COALESCE(to_jsonb(s.tags), '[]'::jsonb)
  160:       )
  161:       ORDER BY s.overall_rank
  162:     ) AS material_summaries
  163:   FROM selected s
  164:   GROUP BY s.brain_domain_code
  165: ),
  166: summary AS (
  167:   SELECT
  168:     count(*)::int AS source_count,
  169:     count(*)::int AS material_count,
  170:     count(DISTINCT brain_domain_code)::int AS domain_count,
  171:     count(*) FILTER (WHERE unit_code LIKE 'srcmat_%')::int AS srcmat_count,
  172:     count(*) FILTER (WHERE unit_code LIKE 'lane05_%')::int AS lane05_count,
  173:     count(*) FILTER (WHERE unit_code LIKE 'pack05_%')::int AS pack05_count,
  174:     count(*) FILTER (WHERE risk_class_code = 'high')::int AS high_risk_count
--- hit line 169 ---
  157:         'selectionReasonJa', s.selection_reason_ja,
  158:         'effectiveUsePurposeCodes', COALESCE(to_jsonb(s.effective_use_purpose_codes), '[]'::jsonb),
  159:         'tags', COALESCE(to_jsonb(s.tags), '[]'::jsonb)
  160:       )
  161:       ORDER BY s.overall_rank
  162:     ) AS material_summaries
  163:   FROM selected s
  164:   GROUP BY s.brain_domain_code
  165: ),
  166: summary AS (
  167:   SELECT
  168:     count(*)::int AS source_count,
  169:     count(*)::int AS material_count,
  170:     count(DISTINCT brain_domain_code)::int AS domain_count,
  171:     count(*) FILTER (WHERE unit_code LIKE 'srcmat_%')::int AS srcmat_count,
  172:     count(*) FILTER (WHERE unit_code LIKE 'lane05_%')::int AS lane05_count,
  173:     count(*) FILTER (WHERE unit_code LIKE 'pack05_%')::int AS pack05_count,
  174:     count(*) FILTER (WHERE risk_class_code = 'high')::int AS high_risk_count
  175:   FROM selected
  176: )
  177: SELECT jsonb_build_object(
  178:   'provider', 'aiworker-brain-context-provider',
  179:   'providerVersion', ${sqlText(PROVIDER_VERSION)},
  180:   'selectorFunction', ${sqlText(SELECTOR_FUNCTION)},
  181:   'selectorMode', 'two_stage_domain_then_overall_rank',
--- hit line 188 ---
  176: )
  177: SELECT jsonb_build_object(
  178:   'provider', 'aiworker-brain-context-provider',
  179:   'providerVersion', ${sqlText(PROVIDER_VERSION)},
  180:   'selectorFunction', ${sqlText(SELECTOR_FUNCTION)},
  181:   'selectorMode', 'two_stage_domain_then_overall_rank',
  182:   'modelCode', ${sqlText(o.modelCode)},
  183:   'purposeCode', ${sqlText(o.purposeCode)},
  184:   'domainFilter', ${sqlText(JSON.stringify(o.domainCodes))}::jsonb,
  185:   'limitPerDomain', ${o.limitPerDomain},
  186:   'totalLimit', ${o.totalLimit},
  187:   'sourceCount', COALESCE(summary.source_count, 0),
  188:   'materialCount', COALESCE(summary.material_count, 0),
  189:   'domainCount', COALESCE(summary.domain_count, 0),
  190:   'srcmatCount', COALESCE(summary.srcmat_count, 0),
  191:   'lane05Count', COALESCE(summary.lane05_count, 0),
  192:   'pack05Count', COALESCE(summary.pack05_count, 0),
  193:   'highRiskCount', COALESCE(summary.high_risk_count, 0),
  194:   'domains', COALESCE((
  195:     SELECT jsonb_agg(
  196:       jsonb_build_object(
  197:         'brainDomainCode', d.brain_domain_code,
  198:         'brainDomainLabelJa', d.brain_domain_label_ja,
  199:         'materialCount', d.material_count,
  200:         'materialSummaries', d.material_summaries
--- hit line 194 ---
  182:   'modelCode', ${sqlText(o.modelCode)},
  183:   'purposeCode', ${sqlText(o.purposeCode)},
  184:   'domainFilter', ${sqlText(JSON.stringify(o.domainCodes))}::jsonb,
  185:   'limitPerDomain', ${o.limitPerDomain},
  186:   'totalLimit', ${o.totalLimit},
  187:   'sourceCount', COALESCE(summary.source_count, 0),
  188:   'materialCount', COALESCE(summary.material_count, 0),
  189:   'domainCount', COALESCE(summary.domain_count, 0),
  190:   'srcmatCount', COALESCE(summary.srcmat_count, 0),
  191:   'lane05Count', COALESCE(summary.lane05_count, 0),
  192:   'pack05Count', COALESCE(summary.pack05_count, 0),
  193:   'highRiskCount', COALESCE(summary.high_risk_count, 0),
  194:   'domains', COALESCE((
  195:     SELECT jsonb_agg(
  196:       jsonb_build_object(
  197:         'brainDomainCode', d.brain_domain_code,
  198:         'brainDomainLabelJa', d.brain_domain_label_ja,
  199:         'materialCount', d.material_count,
  200:         'materialSummaries', d.material_summaries
  201:       )
  202:       ORDER BY d.brain_domain_code
  203:     )
  204:     FROM domain_rows d
  205:   ), '[]'::jsonb),
  206:   'safetyNoteJa', 'CX22073JWの頭脳データはAIWorkerOS selectorで選抜済み。読取は実行権限ではない。'
--- hit line 199 ---
  187:   'sourceCount', COALESCE(summary.source_count, 0),
  188:   'materialCount', COALESCE(summary.material_count, 0),
  189:   'domainCount', COALESCE(summary.domain_count, 0),
  190:   'srcmatCount', COALESCE(summary.srcmat_count, 0),
  191:   'lane05Count', COALESCE(summary.lane05_count, 0),
  192:   'pack05Count', COALESCE(summary.pack05_count, 0),
  193:   'highRiskCount', COALESCE(summary.high_risk_count, 0),
  194:   'domains', COALESCE((
  195:     SELECT jsonb_agg(
  196:       jsonb_build_object(
  197:         'brainDomainCode', d.brain_domain_code,
  198:         'brainDomainLabelJa', d.brain_domain_label_ja,
  199:         'materialCount', d.material_count,
  200:         'materialSummaries', d.material_summaries
  201:       )
  202:       ORDER BY d.brain_domain_code
  203:     )
  204:     FROM domain_rows d
  205:   ), '[]'::jsonb),
  206:   'safetyNoteJa', 'CX22073JWの頭脳データはAIWorkerOS selectorで選抜済み。読取は実行権限ではない。'
  207: )::text
  208: FROM summary;
  209: `;
  210: 
  211:   return runPsqlJson(sql);
--- hit line 200 ---
  188:   'materialCount', COALESCE(summary.material_count, 0),
  189:   'domainCount', COALESCE(summary.domain_count, 0),
  190:   'srcmatCount', COALESCE(summary.srcmat_count, 0),
  191:   'lane05Count', COALESCE(summary.lane05_count, 0),
  192:   'pack05Count', COALESCE(summary.pack05_count, 0),
  193:   'highRiskCount', COALESCE(summary.high_risk_count, 0),
  194:   'domains', COALESCE((
  195:     SELECT jsonb_agg(
  196:       jsonb_build_object(
  197:         'brainDomainCode', d.brain_domain_code,
  198:         'brainDomainLabelJa', d.brain_domain_label_ja,
  199:         'materialCount', d.material_count,
  200:         'materialSummaries', d.material_summaries
  201:       )
  202:       ORDER BY d.brain_domain_code
  203:     )
  204:     FROM domain_rows d
  205:   ), '[]'::jsonb),
  206:   'safetyNoteJa', 'CX22073JWの頭脳データはAIWorkerOS selectorで選抜済み。読取は実行権限ではない。'
  207: )::text
  208: FROM summary;
  209: `;
  210: 
  211:   return runPsqlJson(sql);
  212: }
--- hit line 216 ---
  204:     FROM domain_rows d
  205:   ), '[]'::jsonb),
  206:   'safetyNoteJa', 'CX22073JWの頭脳データはAIWorkerOS selectorで選抜済み。読取は実行権限ではない。'
  207: )::text
  208: FROM summary;
  209: `;
  210: 
  211:   return runPsqlJson(sql);
  212: }
  213: 
  214: function renderPromptContext(context) {
  215:   const lines = [];
  216:   lines.push("[AIWORKER_BRAIN_CONTEXT]");
  217:   lines.push(`provider=${context.provider || "aiworker-brain-context-provider"}`);
  218:   lines.push(`provider_version=${context.providerVersion || PROVIDER_VERSION}`);
  219:   lines.push(`selector_function=${context.selectorFunction || SELECTOR_FUNCTION}`);
  220:   lines.push(`selector_mode=${context.selectorMode || "two_stage_domain_then_overall_rank"}`);
  221:   lines.push(`model_code=${context.modelCode || ""}`);
  222:   lines.push(`purpose_code=${context.purposeCode || ""}`);
  223:   lines.push(`source_count=${context.sourceCount ?? 0}`);
  224:   lines.push(`material_count=${context.materialCount ?? 0}`);
  225:   lines.push(`domain_count=${context.domainCount ?? 0}`);
  226:   lines.push(`srcmat_count=${context.srcmatCount ?? 0}`);
  227:   lines.push(`lane05_count=${context.lane05Count ?? 0}`);
  228:   lines.push(`pack05_count=${context.pack05Count ?? 0}`);
--- hit line 221 ---
  209: `;
  210: 
  211:   return runPsqlJson(sql);
  212: }
  213: 
  214: function renderPromptContext(context) {
  215:   const lines = [];
  216:   lines.push("[AIWORKER_BRAIN_CONTEXT]");
  217:   lines.push(`provider=${context.provider || "aiworker-brain-context-provider"}`);
  218:   lines.push(`provider_version=${context.providerVersion || PROVIDER_VERSION}`);
  219:   lines.push(`selector_function=${context.selectorFunction || SELECTOR_FUNCTION}`);
  220:   lines.push(`selector_mode=${context.selectorMode || "two_stage_domain_then_overall_rank"}`);
  221:   lines.push(`model_code=${context.modelCode || ""}`);
  222:   lines.push(`purpose_code=${context.purposeCode || ""}`);
  223:   lines.push(`source_count=${context.sourceCount ?? 0}`);
  224:   lines.push(`material_count=${context.materialCount ?? 0}`);
  225:   lines.push(`domain_count=${context.domainCount ?? 0}`);
  226:   lines.push(`srcmat_count=${context.srcmatCount ?? 0}`);
  227:   lines.push(`lane05_count=${context.lane05Count ?? 0}`);
  228:   lines.push(`pack05_count=${context.pack05Count ?? 0}`);
  229:   lines.push("rule=読取は実行権限ではない。安全境界と用途制限を超えない。");
  230: 
  231:   for (const domain of context.domains || []) {
  232:     lines.push("");
  233:     lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
--- hit line 222 ---
  210: 
  211:   return runPsqlJson(sql);
  212: }
  213: 
  214: function renderPromptContext(context) {
  215:   const lines = [];
  216:   lines.push("[AIWORKER_BRAIN_CONTEXT]");
  217:   lines.push(`provider=${context.provider || "aiworker-brain-context-provider"}`);
  218:   lines.push(`provider_version=${context.providerVersion || PROVIDER_VERSION}`);
  219:   lines.push(`selector_function=${context.selectorFunction || SELECTOR_FUNCTION}`);
  220:   lines.push(`selector_mode=${context.selectorMode || "two_stage_domain_then_overall_rank"}`);
  221:   lines.push(`model_code=${context.modelCode || ""}`);
  222:   lines.push(`purpose_code=${context.purposeCode || ""}`);
  223:   lines.push(`source_count=${context.sourceCount ?? 0}`);
  224:   lines.push(`material_count=${context.materialCount ?? 0}`);
  225:   lines.push(`domain_count=${context.domainCount ?? 0}`);
  226:   lines.push(`srcmat_count=${context.srcmatCount ?? 0}`);
  227:   lines.push(`lane05_count=${context.lane05Count ?? 0}`);
  228:   lines.push(`pack05_count=${context.pack05Count ?? 0}`);
  229:   lines.push("rule=読取は実行権限ではない。安全境界と用途制限を超えない。");
  230: 
  231:   for (const domain of context.domains || []) {
  232:     lines.push("");
  233:     lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
  234:     for (const material of domain.materialSummaries || []) {
--- hit line 224 ---
  212: }
  213: 
  214: function renderPromptContext(context) {
  215:   const lines = [];
  216:   lines.push("[AIWORKER_BRAIN_CONTEXT]");
  217:   lines.push(`provider=${context.provider || "aiworker-brain-context-provider"}`);
  218:   lines.push(`provider_version=${context.providerVersion || PROVIDER_VERSION}`);
  219:   lines.push(`selector_function=${context.selectorFunction || SELECTOR_FUNCTION}`);
  220:   lines.push(`selector_mode=${context.selectorMode || "two_stage_domain_then_overall_rank"}`);
  221:   lines.push(`model_code=${context.modelCode || ""}`);
  222:   lines.push(`purpose_code=${context.purposeCode || ""}`);
  223:   lines.push(`source_count=${context.sourceCount ?? 0}`);
  224:   lines.push(`material_count=${context.materialCount ?? 0}`);
  225:   lines.push(`domain_count=${context.domainCount ?? 0}`);
  226:   lines.push(`srcmat_count=${context.srcmatCount ?? 0}`);
  227:   lines.push(`lane05_count=${context.lane05Count ?? 0}`);
  228:   lines.push(`pack05_count=${context.pack05Count ?? 0}`);
  229:   lines.push("rule=読取は実行権限ではない。安全境界と用途制限を超えない。");
  230: 
  231:   for (const domain of context.domains || []) {
  232:     lines.push("");
  233:     lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
  234:     for (const material of domain.materialSummaries || []) {
  235:       lines.push(
  236:         `- ${material.unitCode} | source=${material.materialSourceKind || ""} | depth=${material.depthCode || ""} | risk=${material.riskClassCode || ""} | rank=${material.overallRank ?? ""}`
--- hit line 231 ---
  219:   lines.push(`selector_function=${context.selectorFunction || SELECTOR_FUNCTION}`);
  220:   lines.push(`selector_mode=${context.selectorMode || "two_stage_domain_then_overall_rank"}`);
  221:   lines.push(`model_code=${context.modelCode || ""}`);
  222:   lines.push(`purpose_code=${context.purposeCode || ""}`);
  223:   lines.push(`source_count=${context.sourceCount ?? 0}`);
  224:   lines.push(`material_count=${context.materialCount ?? 0}`);
  225:   lines.push(`domain_count=${context.domainCount ?? 0}`);
  226:   lines.push(`srcmat_count=${context.srcmatCount ?? 0}`);
  227:   lines.push(`lane05_count=${context.lane05Count ?? 0}`);
  228:   lines.push(`pack05_count=${context.pack05Count ?? 0}`);
  229:   lines.push("rule=読取は実行権限ではない。安全境界と用途制限を超えない。");
  230: 
  231:   for (const domain of context.domains || []) {
  232:     lines.push("");
  233:     lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
  234:     for (const material of domain.materialSummaries || []) {
  235:       lines.push(
  236:         `- ${material.unitCode} | source=${material.materialSourceKind || ""} | depth=${material.depthCode || ""} | risk=${material.riskClassCode || ""} | rank=${material.overallRank ?? ""}`
  237:       );
  238:       if (material.unitTitleJa) lines.push(`  title=${material.unitTitleJa}`);
  239:       if (material.unitSummaryJa) lines.push(`  summary=${material.unitSummaryJa}`);
  240:       if (material.safetyBoundaryJa) lines.push(`  safety=${material.safetyBoundaryJa}`);
  241:     }
  242:   }
  243: 
--- hit line 234 ---
  222:   lines.push(`purpose_code=${context.purposeCode || ""}`);
  223:   lines.push(`source_count=${context.sourceCount ?? 0}`);
  224:   lines.push(`material_count=${context.materialCount ?? 0}`);
  225:   lines.push(`domain_count=${context.domainCount ?? 0}`);
  226:   lines.push(`srcmat_count=${context.srcmatCount ?? 0}`);
  227:   lines.push(`lane05_count=${context.lane05Count ?? 0}`);
  228:   lines.push(`pack05_count=${context.pack05Count ?? 0}`);
  229:   lines.push("rule=読取は実行権限ではない。安全境界と用途制限を超えない。");
  230: 
  231:   for (const domain of context.domains || []) {
  232:     lines.push("");
  233:     lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
  234:     for (const material of domain.materialSummaries || []) {
  235:       lines.push(
  236:         `- ${material.unitCode} | source=${material.materialSourceKind || ""} | depth=${material.depthCode || ""} | risk=${material.riskClassCode || ""} | rank=${material.overallRank ?? ""}`
  237:       );
  238:       if (material.unitTitleJa) lines.push(`  title=${material.unitTitleJa}`);
  239:       if (material.unitSummaryJa) lines.push(`  summary=${material.unitSummaryJa}`);
  240:       if (material.safetyBoundaryJa) lines.push(`  safety=${material.safetyBoundaryJa}`);
  241:     }
  242:   }
  243: 
  244:   lines.push("[/AIWORKER_BRAIN_CONTEXT]");
  245:   return lines.join("\n");
  246: }
--- hit line 236 ---
  224:   lines.push(`material_count=${context.materialCount ?? 0}`);
  225:   lines.push(`domain_count=${context.domainCount ?? 0}`);
  226:   lines.push(`srcmat_count=${context.srcmatCount ?? 0}`);
  227:   lines.push(`lane05_count=${context.lane05Count ?? 0}`);
  228:   lines.push(`pack05_count=${context.pack05Count ?? 0}`);
  229:   lines.push("rule=読取は実行権限ではない。安全境界と用途制限を超えない。");
  230: 
  231:   for (const domain of context.domains || []) {
  232:     lines.push("");
  233:     lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
  234:     for (const material of domain.materialSummaries || []) {
  235:       lines.push(
  236:         `- ${material.unitCode} | source=${material.materialSourceKind || ""} | depth=${material.depthCode || ""} | risk=${material.riskClassCode || ""} | rank=${material.overallRank ?? ""}`
  237:       );
  238:       if (material.unitTitleJa) lines.push(`  title=${material.unitTitleJa}`);
  239:       if (material.unitSummaryJa) lines.push(`  summary=${material.unitSummaryJa}`);
  240:       if (material.safetyBoundaryJa) lines.push(`  safety=${material.safetyBoundaryJa}`);
  241:     }
  242:   }
  243: 
  244:   lines.push("[/AIWORKER_BRAIN_CONTEXT]");
  245:   return lines.join("\n");
  246: }
  247: 
  248: function buildBrainContextPayload(input = {}) {
--- hit line 238 ---
  226:   lines.push(`srcmat_count=${context.srcmatCount ?? 0}`);
  227:   lines.push(`lane05_count=${context.lane05Count ?? 0}`);
  228:   lines.push(`pack05_count=${context.pack05Count ?? 0}`);
  229:   lines.push("rule=読取は実行権限ではない。安全境界と用途制限を超えない。");
  230: 
  231:   for (const domain of context.domains || []) {
  232:     lines.push("");
  233:     lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
  234:     for (const material of domain.materialSummaries || []) {
  235:       lines.push(
  236:         `- ${material.unitCode} | source=${material.materialSourceKind || ""} | depth=${material.depthCode || ""} | risk=${material.riskClassCode || ""} | rank=${material.overallRank ?? ""}`
  237:       );
  238:       if (material.unitTitleJa) lines.push(`  title=${material.unitTitleJa}`);
  239:       if (material.unitSummaryJa) lines.push(`  summary=${material.unitSummaryJa}`);
  240:       if (material.safetyBoundaryJa) lines.push(`  safety=${material.safetyBoundaryJa}`);
  241:     }
  242:   }
  243: 
  244:   lines.push("[/AIWORKER_BRAIN_CONTEXT]");
  245:   return lines.join("\n");
  246: }
  247: 
  248: function buildBrainContextPayload(input = {}) {
  249:   return {
  250:     ok: true,
--- hit line 239 ---
  227:   lines.push(`lane05_count=${context.lane05Count ?? 0}`);
  228:   lines.push(`pack05_count=${context.pack05Count ?? 0}`);
  229:   lines.push("rule=読取は実行権限ではない。安全境界と用途制限を超えない。");
  230: 
  231:   for (const domain of context.domains || []) {
  232:     lines.push("");
  233:     lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
  234:     for (const material of domain.materialSummaries || []) {
  235:       lines.push(
  236:         `- ${material.unitCode} | source=${material.materialSourceKind || ""} | depth=${material.depthCode || ""} | risk=${material.riskClassCode || ""} | rank=${material.overallRank ?? ""}`
  237:       );
  238:       if (material.unitTitleJa) lines.push(`  title=${material.unitTitleJa}`);
  239:       if (material.unitSummaryJa) lines.push(`  summary=${material.unitSummaryJa}`);
  240:       if (material.safetyBoundaryJa) lines.push(`  safety=${material.safetyBoundaryJa}`);
  241:     }
  242:   }
  243: 
  244:   lines.push("[/AIWORKER_BRAIN_CONTEXT]");
  245:   return lines.join("\n");
  246: }
  247: 
  248: function buildBrainContextPayload(input = {}) {
  249:   return {
  250:     ok: true,
  251:     brain_context: buildBrainContext(input),
--- hit line 240 ---
  228:   lines.push(`pack05_count=${context.pack05Count ?? 0}`);
  229:   lines.push("rule=読取は実行権限ではない。安全境界と用途制限を超えない。");
  230: 
  231:   for (const domain of context.domains || []) {
  232:     lines.push("");
  233:     lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
  234:     for (const material of domain.materialSummaries || []) {
  235:       lines.push(
  236:         `- ${material.unitCode} | source=${material.materialSourceKind || ""} | depth=${material.depthCode || ""} | risk=${material.riskClassCode || ""} | rank=${material.overallRank ?? ""}`
  237:       );
  238:       if (material.unitTitleJa) lines.push(`  title=${material.unitTitleJa}`);
  239:       if (material.unitSummaryJa) lines.push(`  summary=${material.unitSummaryJa}`);
  240:       if (material.safetyBoundaryJa) lines.push(`  safety=${material.safetyBoundaryJa}`);
  241:     }
  242:   }
  243: 
  244:   lines.push("[/AIWORKER_BRAIN_CONTEXT]");
  245:   return lines.join("\n");
  246: }
  247: 
  248: function buildBrainContextPayload(input = {}) {
  249:   return {
  250:     ok: true,
  251:     brain_context: buildBrainContext(input),
  252:   };
--- hit line 244 ---
  232:     lines.push("");
  233:     lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
  234:     for (const material of domain.materialSummaries || []) {
  235:       lines.push(
  236:         `- ${material.unitCode} | source=${material.materialSourceKind || ""} | depth=${material.depthCode || ""} | risk=${material.riskClassCode || ""} | rank=${material.overallRank ?? ""}`
  237:       );
  238:       if (material.unitTitleJa) lines.push(`  title=${material.unitTitleJa}`);
  239:       if (material.unitSummaryJa) lines.push(`  summary=${material.unitSummaryJa}`);
  240:       if (material.safetyBoundaryJa) lines.push(`  safety=${material.safetyBoundaryJa}`);
  241:     }
  242:   }
  243: 
  244:   lines.push("[/AIWORKER_BRAIN_CONTEXT]");
  245:   return lines.join("\n");
  246: }
  247: 
  248: function buildBrainContextPayload(input = {}) {
  249:   return {
  250:     ok: true,
  251:     brain_context: buildBrainContext(input),
  252:   };
  253: }
  254: 
  255: function createBrainContextPayload(input = {}) {
  256:   return buildBrainContextPayload(input);
--- hit line 251 ---
  239:       if (material.unitSummaryJa) lines.push(`  summary=${material.unitSummaryJa}`);
  240:       if (material.safetyBoundaryJa) lines.push(`  safety=${material.safetyBoundaryJa}`);
  241:     }
  242:   }
  243: 
  244:   lines.push("[/AIWORKER_BRAIN_CONTEXT]");
  245:   return lines.join("\n");
  246: }
  247: 
  248: function buildBrainContextPayload(input = {}) {
  249:   return {
  250:     ok: true,
  251:     brain_context: buildBrainContext(input),
  252:   };
  253: }
  254: 
  255: function createBrainContextPayload(input = {}) {
  256:   return buildBrainContextPayload(input);
  257: }
  258: 
  259: function getBrainContext(input = {}) {
  260:   return buildBrainContext(input);
  261: }
  262: 
  263: function getRuntimeBrainContext(input = {}) {
BRIDGE_SELECTOR_CONTEXT_END
HAS_DELIVERABLE_BUILDER=YES
BUILDER_USES_INSTRUCTION_FOR_BODY=YES
BUILDER_USES_BRAIN_CONTEXT_FOR_BODY=NO
REQUEST_ROUTE_FETCHES_OR_INJECTS_BRAIN_CONTEXT=NO
BRAIN_CONTEXT_ENDPOINT_EXISTS=YES
BRIDGE_IS_SELECTOR_V2=YES
BRIDGE_CAN_RETURN_MATERIAL_HINT=YES
DIAGNOSIS=BODY_GENERATION_USES_INSTRUCTION_NOT_CX_MATERIAL
```

## Artifact audit full log
```
============================================================
ARTIFACT ECHO VS MATERIAL AUDIT
============================================================
MAIN_CHARS=1595
INSTRUCTION_CHARS=175
INSTRUCTION_ECHO_DETECTED=YES
REQUIRED_TERM_MISSING_COUNT=13
REQUIRED_TERM_MISSING=乙巳の変,中大兄皇子,中臣鎌足,蘇我入鹿,645,646,日本書紀,史料批判,段階的,戸籍,班田,租,庸
TERM_HITS_BEGIN
乙巳の変=0
中大兄皇子=0
中臣鎌足=0
蘇我入鹿=0
645=0
646=0
日本書紀=0
史料批判=0
段階的=0
戸籍=0
班田=0
租=0
庸=0
調=1
TERM_HITS_END
R22_FAIL_LINES_BEGIN
person_terms_pass=FAIL
system_terms_pass=FAIL
timeline_terms_pass=FAIL
source_caution_terms_pass=FAIL
not_instruction_echo_only=FAIL
likely_source_backed_quality=FAIL
FAIL_COUNT=6
FAIL_ROWS=person_terms_pass,system_terms_pass,timeline_terms_pass,source_caution_terms_pass,not_instruction_echo_only,likely_source_backed_quality
R22_FAIL_LINES_END
MAIN_HEAD_BEGIN
# 大化の改新 詳細資料生成 smoke
## 1. 成果物サマリ
AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smokeの一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。
## 2. 生成主体
- generation_owner: AIWorkerOS
- requester_app_ref: cx22073jw
- source_request_ref: B6R95R3Z_R20_TAIKA_E2E_20260509_060449
- source_route_code: aiworkeros_direct_instruction_to_zip_smoke
- app_surface_code: ai_company_manager
## 3. 設定ロボット / 性能差の根拠
- model_code: byd2_003_asic_leader3
- role_layer_code: runtime_resolved_by_aiworker
- series_code: runtime_resolved_by_aiworker
- capability_profile_code: runtime_resolved_by_aiworker
- task_domain_code: history_worldview
- cx_reference_depth_code: runtime_policy_resolved
- cx_reference_breadth_code: runtime_policy_resolved
## 4. 成果物本文
CX22073JWの大化の改新 source-backed runtime material を参照し、出典注意、誤解防止、時系列、人物、制度、公地公民、改新の詔、律令国家形成への接続を含む詳細資料を作成してください。成果物本文、summary_text、generated_artifacts、納品zipを作成し、zip linkを返してください。
## 5. 品質メモ
AIWorkerOS側で生成した一次成果物です。
設定ロボット: byd2_003_asic_leader3
役割レイヤー: runtime_resolved_by_aiworker
タスク領域: history_worldview
CX参照深度: runtime_policy_resolved
CX参照広さ: runtime_policy_resolved
今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。
## 6. 未解決事項
この段階では外部実行、PG apply、破壊的操作は行っていません。
追加調査・DB変更・実装反映が必要な場合は、依頼元アプリ側の承認/差し戻し工程で判断してください。
## 7. 次工程
依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。
レビュー画面から成果物本文へ辿れるようにする。
差し戻し時は追加条件をAIWorkerOSへ再依頼する。
## 8. 安全境界
- external_execution_performed_flag=false
- pg_apply_performed_flag=false
- destructive_action_performed_flag=false
- CX22073JW brain access control is AIWorkerOS-side responsibility
MAIN_HEAD_END
DIAGNOSIS=CONFIRMED_INSTRUCTION_ECHO_WITH_MISSING_CX_FACTS
```

## AICM touch check
```
AICM_BASE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
```

## Runtime touch check
```
AIWORKER_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os
```

## Secret scan
```
Scan generated files only
```
