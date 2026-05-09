# B6R95R3Z-R29A Inspect Actual R24 Helper Report

RUN_TS=20260509_074913
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_074913_b6r95r3z_r29a_inspect_actual_r24_helper
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Files
- R24_BLOCK=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_074913_b6r95r3z_r29a_inspect_actual_r24_helper/010_actual_r24_helper_block.txt
- MODELKEYS_BLOCK=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_074913_b6r95r3z_r29a_inspect_actual_r24_helper/020_actual_modelkeys_context.txt
- HELPER_LINES=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_074913_b6r95r3z_r29a_inspect_actual_r24_helper/030_helper_line_hits.txt
- FAILED_R29_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_074913_b6r95r3z_r29a_inspect_actual_r24_helper/040_previous_r29_failed_patch_log.txt

## Actual modelKeys context
```
444-
445-function aiwB6R95R3R3Lines(items) {
446-  return items.filter((value) => value !== null && value !== undefined && String(value).trim() !== "").join("\n");
447-}
448-
449-function aiwB6R95R3R3BuildRequesterFacingDeliverableBaseB6R95R3Z24(payload, sourceRouteCode) {
450-  const requesterAppRef = aiwB6R95R3R3OneLine(payload.source_app_ref, "HTTP_LOCAL");
451-  const sourceRequestRef = aiwB6R95R3R3OneLine(payload.source_request_ref, "");
452-  const appSurfaceCode = aiwB6R95R3R3OneLine(payload.app_surface_code, "unknown_app_surface");
453-  const routeCode = aiwB6R95R3R3OneLine(sourceRouteCode, "unspecified_route");
454-  const taskTitle = aiwB6R95R3R3OneLine(payload.task_title, "AIWorkerOS成果物");
455-  const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
456:  const modelCode = aiwB6R95R3R3OneLine(payload.model_code, "unknown_model");
457-  const roleLayerCode = aiwB6R95R3R3OneLine(payload.role_layer_code || payload.roleLayerCode, "runtime_resolved_by_aiworker");
458-  const seriesCode = aiwB6R95R3R3OneLine(payload.series_code || payload.seriesCode, "runtime_resolved_by_aiworker");
459-  const capabilityProfileCode = aiwB6R95R3R3OneLine(payload.capability_profile_code || payload.capabilityProfileCode, "runtime_resolved_by_aiworker");
460-  const taskDomainCode = aiwB6R95R3R3OneLine(payload.task_domain_code, "unknown_domain");
461-  const cxDepthCode = aiwB6R95R3R3OneLine(payload.cx_reference_depth_code || payload.cxReferenceDepthCode, "runtime_policy_resolved");
462-  const cxBreadthCode = aiwB6R95R3R3OneLine(payload.cx_reference_breadth_code || payload.cxReferenceBreadthCode, "runtime_policy_resolved");
463-
464-  const robotContext = {
465:    model_code: modelCode,
466-    role_layer_code: roleLayerCode,
467-    series_code: seriesCode,
468-    capability_profile_code: capabilityProfileCode,
469-    task_domain_code: taskDomainCode
470-  };
471-
472-  const generationBasis = {
473-    contract_version: "B6R95R3B-R3",
474-    generation_owner: "AIWorkerOS",
475-    requester_app_ref: requesterAppRef,
476-    source_request_ref: sourceRequestRef,
477-    source_route_code: routeCode,
478:    robot_trait_basis: "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
479-    cx_depth_basis: cxDepthCode,
480-    cx_breadth_basis: cxBreadthCode,
481-    cx_reference_boundary: "CX22073JW is robot brain/reference data. Access-control remains AIWorkerOS-side, not requester-app-side.",
482-    safety_boundary: "internal_only_no_external_execution_no_pg_apply_no_destructive_action"
483-  };
484-
485-  const outputTitle = `${taskTitle} 成果物`;
486-  const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);
487-  const summaryText = aiwB6R95R3R3Clip(
488-    `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
489-    700
490-  );
491-
492-  const qualityNotes = aiwB6R95R3R3Lines([
493-    "AIWorkerOS側で生成した一次成果物です。",
494-    `設定ロボット: ${modelCode}`,
495-    `役割レイヤー: ${roleLayerCode}`,
496-    `タスク領域: ${taskDomainCode}`,
497-    `CX参照深度: ${cxDepthCode}`,
498-    `CX参照広さ: ${cxBreadthCode}`,
499-    "今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。"
500-  ]);
501-
502-  const unresolvedIssues = aiwB6R95R3R3Lines([
503-    "この段階では外部実行、PG apply、破壊的操作は行っていません。",
--
515-    "",
516-    "## 1. 成果物サマリ",
517-    summaryText,
518-    "",
519-    "## 2. 生成主体",
520-    `- generation_owner: AIWorkerOS`,
521-    `- requester_app_ref: ${requesterAppRef}`,
522-    `- source_request_ref: ${sourceRequestRef || "未指定"}`,
523-    `- source_route_code: ${routeCode}`,
524-    `- app_surface_code: ${appSurfaceCode}`,
525-    "",
526-    "## 3. 設定ロボット / 性能差の根拠",
527:    `- model_code: ${modelCode}`,
528-    `- role_layer_code: ${roleLayerCode}`,
529-    `- series_code: ${seriesCode}`,
530-    `- capability_profile_code: ${capabilityProfileCode}`,
531-    `- task_domain_code: ${taskDomainCode}`,
532-    `- cx_reference_depth_code: ${cxDepthCode}`,
533-    `- cx_reference_breadth_code: ${cxBreadthCode}`,
534-    "",
535-    "## 4. 成果物本文",
536-    taskInstruction || "依頼本文が空のため、タスク名と設定ロボット情報を基準に一次成果物を作成しました。",
537-    "",
538-    "## 5. 品質メモ",
539-    qualityNotes,
540-    "",
541-    "## 6. 未解決事項",
542-    unresolvedIssues,
543-    "",
544-    "## 7. 次工程",
545-    nextSteps,
546-    "",
547-    "## 8. 安全境界",
548-    "- external_execution_performed_flag=false",
549-    "- pg_apply_performed_flag=false",
550-    "- destructive_action_performed_flag=false",
551-    "- CX22073JW brain access control is AIWorkerOS-side responsibility",
552-    ""
--
708-    const nested = payload && payload[nestedKey];
709-    if (nested && typeof nested === "object") {
710-      for (const key of keys) {
711-        if (typeof nested[key] === "string" && nested[key].trim()) return nested[key].trim();
712-      }
713-    }
714-  }
715-  return "";
716-}
717-
718-function aiwB6R95R3Z24ModelCode(payload) {
719-  return aiwB6R95R3Z24PayloadText(payload, [
720:    "model_code",
721:    "robot_model_code",
722:    "selected_robot_model_code",
723:    "runtime_model_code"
724-  ]) || "byd2_003_asic_leader3";
725-}
726-
727-function aiwB6R95R3Z24Instruction(payload) {
728-  return aiwB6R95R3Z24PayloadText(payload, [
729-    "task_instruction_ja",
730-    "instruction_ja",
731-    "user_instruction_ja",
732-    "task_instruction",
733-    "instruction",
734-    "user_instruction"
735-  ]);
736-}
737-
738-function aiwB6R95R3Z24TaskTitle(payload) {
739-  return aiwB6R95R3Z24PayloadText(payload, [
740-    "task_title_ja",
741-    "task_title",
742-    "title"
743-  ]) || "AIWorkerOS 成果物";
744-}
745-
746-function aiwB6R95R3Z24SearchTerms(payload) {
747-  const text = [
748-    aiwB6R95R3Z24TaskTitle(payload),
--
793-      env: Object.assign({}, process.env, { PGOPTIONS: "" })
794-    });
795-
796-    const text = String(out || "").trim();
797-    if (!text) return [];
798-    const parsed = JSON.parse(text);
799-    return Array.isArray(parsed) ? parsed : [];
800-  } catch {
801-    return [];
802-  }
803-}
804-
805:function aiwB6R95R3Z24FetchCxRuntimeMaterials(payload) {
806:  const modelCode = aiwB6R95R3Z24ModelCode(payload);
807-  const terms = aiwB6R95R3Z24SearchTerms(payload);
808-  const termConds = terms
809-    .slice(0, 10)
810-    .map((term) => "to_jsonb(t)::text ILIKE " + aiwB6R95R3Z24SqlLiteral("%" + term + "%"))
811-    .join(" OR ");
812-
813-  const views = [
814-    "aiworker.vw_robot_readable_brain_runtime_material_v3",
815-    "aiworker.vw_robot_readable_brain_runtime_material_v2",
816-    "aiworker.vw_robot_readable_brain_runtime_material_v1",
817-    "aiworker.vw_robot_brain_runtime_material_quality_overlay_v1"
818-  ];
819-
820-  for (const view of views) {
821-    const sql = [
822-      "BEGIN READ ONLY;",
823-      "WITH picked AS (",
824-      "  SELECT to_jsonb(t) AS row_json",
825-      "  FROM " + view + " t",
826:      "  WHERE t.model_code = " + aiwB6R95R3Z24SqlLiteral(modelCode),
827-      "    AND (" + termConds + ")",
828-      "  LIMIT 24",
829-      ")",
830-      "SELECT COALESCE(jsonb_agg(row_json), '[]'::jsonb)::text FROM picked;",
831-      "COMMIT;",
832-      "/* B6R95R3Z_R26_READONLY_HELPER_REPAIR */"
833-    ].join("\n");
834-
835-    const rows = aiwB6R95R3Z24RunPsqlJson(sql);
836-    if (rows.length) return rows;
837-  }
838-
839-  return [];
840-}
841-
842-function aiwB6R95R3Z24MaterialTitle(row, index) {
843-  return aiwB6R95R3Z24PickFirstText(row, [
844-    "unit_title_ja",
845-    "title_ja",
846-    "material_title_ja",
847-    "topic_label_ja",
848-    "brain_data_title_ja",
849-    "brain_data_code",
850-    "unit_code",
851-    "detail_axis_code"
--
863-    "reference_text_ja",
864-    "robot_use_summary_ja",
865-    "description_ja",
866-    "source_caution_ja",
867-    "misconception_guard_ja"
868-  ]);
869-
870-  return body || aiwB6R95R3Z24CollectTextDeep(row, 3500);
871-}
872-
873-function aiwB6R95R3Z24BuildMaterialMarkdown(payload, rows) {
874-  const title = aiwB6R95R3Z24TaskTitle(payload);
875:  const modelCode = aiwB6R95R3Z24ModelCode(payload);
876-  const instruction = aiwB6R95R3Z24Instruction(payload);
877-
878-  const blocks = [];
879-  blocks.push("# " + title);
880-  blocks.push("");
881-  blocks.push("## 1. 成果物サマリ");
882-  blocks.push("AIWorkerOSがCX22073JWのruntime materialを参照し、依頼内容に対応する詳細資料として再構成した成果物です。");
883-  blocks.push("");
884-  blocks.push("## 2. 生成主体");
885-  blocks.push("- generation_owner: AIWorkerOS");
886:  blocks.push("- model_code: " + modelCode);
887-  blocks.push("- cx_reference_source: CX22073JW runtime material / selector v2 readable brain material");
888-  blocks.push("- safety_boundary: internal_only_no_external_execution_no_pg_apply_no_destructive_action");
889-  blocks.push("");
890-  blocks.push("## 3. 依頼要旨");
891-  blocks.push(instruction || "依頼文なし");
892-  blocks.push("");
893-  blocks.push("## 4. CX参照素材からの展開本文");
894-
895-  rows.slice(0, 16).forEach((row, index) => {
896-    const title = aiwB6R95R3Z24MaterialTitle(row, index);
897-    const body = aiwB6R95R3Z24MaterialBody(row).trim();
898-
899-    blocks.push("");
900-    blocks.push("### 4." + String(index + 1) + " " + title);
901-    blocks.push(body ? body.slice(0, 2600) : "本文なし");
902-  });
903-
904-  blocks.push("");
905-  blocks.push("## 5. 出典・史料注意");
906-  blocks.push("CX側materialに source_basis / source_caution / verification_status が含まれる場合は、それを優先して扱います。歴史資料では、一次史料・標準学習整理・研究上の注意点を分け、断定しすぎない説明にします。");
907-  blocks.push("");
908-  blocks.push("## 6. 誤解防止");
909-  blocks.push("制度や事件を単発で完成したものとして扱わず、時系列・後続制度・史料上の注意と接続して説明します。");
910-  blocks.push("");
911-  blocks.push("## 7. 次工程");
--
1286-  const sourceRouteCode = String(
1287-    payload.source_route_code ||
1288-    payload.sourceRouteCode ||
1289-    payload.source_route ||
1290-    ""
1291-  ).trim();
1292-  if (!idempotencyKey) {
1293-    const e = new Error("Idempotency-Key is required");
```

## Helper line hits
```
456:  const modelCode = aiwB6R95R3R3OneLine(payload.model_code, "unknown_model");
465:    model_code: modelCode,
478:    robot_trait_basis: "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
488:    `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
494:    `設定ロボット: ${modelCode}`,
527:    `- model_code: ${modelCode}`,
638:/* B6R95R3Z_R24_CX_MATERIAL_BODY_GENERATION_PATCH_START */
720:    "model_code",
721:    "robot_model_code",
722:    "selected_robot_model_code",
723:    "runtime_model_code"
805:function aiwB6R95R3Z24FetchCxRuntimeMaterials(payload) {
806:  const modelCode = aiwB6R95R3Z24ModelCode(payload);
826:      "  WHERE t.model_code = " + aiwB6R95R3Z24SqlLiteral(modelCode),
832:      "/* B6R95R3Z_R26_READONLY_HELPER_REPAIR */"
875:  const modelCode = aiwB6R95R3Z24ModelCode(payload);
886:  blocks.push("- model_code: " + modelCode);
925:  const rows = aiwB6R95R3Z24FetchCxRuntimeMaterials(payload);
930:      cx_material_rows_found: 0,
931:      cx_material_body_enhanced: false
956:    cx_material_rows_found: rows.length,
957:    cx_material_body_enhanced: true,
968:/* B6R95R3Z_R24_CX_MATERIAL_BODY_GENERATION_PATCH_END */
1298:  const required = ["app_surface_code", "model_code", "task_domain_code", "task_title", "task_instruction_ja"];
1313:    "    :'model_code',",
1398:    model_code: payload.model_code,
1475:      const modelCode = url.searchParams.get("model_code") || url.searchParams.get("modelCode") || "";
1490:        modelCode,
1500:          model_code: modelCode,
```

## Previous R29 failed patch log
```
file:///data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_074811_b6r95r3z_r29_public_model_code_alias_patch/100_patch_r29_public_model_code_alias.mjs:50
  throw new Error("MODEL_KEYS_TARGET_NOT_FOUND");
        ^

Error: MODEL_KEYS_TARGET_NOT_FOUND
    at file:///data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_074811_b6r95r3z_r29_public_model_code_alias_patch/100_patch_r29_public_model_code_alias.mjs:50:9
    at ModuleJob.run (node:internal/modules/esm/module_job:430:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:661:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.14.1
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

FINAL_STATUS=B6R95R3Z_R29A_INSPECT_ACTUAL_R24_HELPER_PASS_REVIEW_REQUIRED
NEXT=R29B: actual modelKeys shapeに合わせて public_model_code / requested_public_model_code を優先する最小patch。
