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
