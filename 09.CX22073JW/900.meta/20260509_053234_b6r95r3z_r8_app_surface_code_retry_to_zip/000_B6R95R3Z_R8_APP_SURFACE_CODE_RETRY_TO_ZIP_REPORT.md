# B6R95R3Z-R8 App Surface Code Retry To Zip Report

RUN_TS=20260509_053234
RUN_CODE=B6R95R3Z_R8_TAIKA_APP_SURFACE_20260509_053234
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip
PREV_R6_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip
PREV_R7_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053053_b6r95r3z_r7_r6_non_2xx_exact_extract
SELECTED_ROUTE=/aiworker/v1/runtime-execution/request
APP_SURFACE_CODE=cx22073jw_direct_smoke

## Declaration
- DB_WRITE_DIRECT=NO
- AIWORKEROS_RUNTIME_WRITE=YES
- FILE_WRITE=YES
- API_POST=YES
- HTTP_GET=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO
- AUTH_TOKEN=MASKED
- IDEMPOTENCY_KEY=SET_MASKED

## Bridge audit
```
BRIDGE_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/brain-context-bridge.js
3:const PROVIDER_VERSION = "lane10-selector-v2";
4:const SELECTOR_FUNCTION = "aiworker.fn_robot_brain_runtime_material_select_v2";
127:  FROM ${SELECTOR_FUNCTION}(
179:  'providerVersion', ${sqlText(PROVIDER_VERSION)},
180:  'selectorFunction', ${sqlText(SELECTOR_FUNCTION)},
218:  lines.push(`provider_version=${context.providerVersion || PROVIDER_VERSION}`);
219:  lines.push(`selector_function=${context.selectorFunction || SELECTOR_FUNCTION}`);
288:bridge.PROVIDER_VERSION = PROVIDER_VERSION;
289:bridge.SELECTOR_FUNCTION = SELECTOR_FUNCTION;
```

## Payload generation
```
============================================================
MAKE R8 PAYLOAD APP SURFACE
============================================================
PREV_PAYLOAD=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip/041_payload_r6.json
OUT_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip/031_payload_r8_app_surface.json
RUN_CODE=B6R95R3Z_R8_TAIKA_APP_SURFACE_20260509_053234
APP_SURFACE_CODE=cx22073jw_direct_smoke
PAYLOAD_TOP_KEYS_BEGIN
app_surface_code,auto_execute,body,brain_domain_codes,create_zip_flag,deliverable_zip_required_flag,domain_codes,domains,dry_run,execute_now,execution_id,external_request_id,generate_zip_flag,idempotencyKey,idempotency_key,input_json,instruction,instruction_ja,language_code,limit_per_domain,model_code,output_format,output_language,payload,prompt,prompt_ja,purpose_code,request,request_code,request_id,request_payload,request_source_code,request_surface_code,requested_output_format,requested_outputs,requester_app_code,requester_route_code,return_summary_flag,return_zip_link_flag,robot_code,robot_model_code,run_now,runtime_request,runtime_request_id,safety,selected_robot_model_code,source_app_code,source_route_code,surface_code,task_instruction,task_instruction_ja,task_purpose_code,task_title,task_title_ja,test_metadata,title,total_limit,use_purpose_code,user_instruction,user_instruction_ja,zip_required_flag
PAYLOAD_TOP_KEYS_END
FINAL_STATUS=R8_PAYLOAD_CREATED
```

## POST output
```
============================================================
POST R8 APP SURFACE
============================================================
ROUTE=/aiworker/v1/runtime-execution/request
STATUS=400
AUTH_HEADER=Bearer ***MASKED***
IDEMPOTENCY_KEY=***SET***
APP_SURFACE_CODE=cx22073jw_direct_smoke
AUTH_FAIL=NO
HAS_SUMMARY=NO
HAS_ZIP_HINT=NO
HAS_GENERATED_ARTIFACTS=NO
HAS_TAIKA_TEXT=NO
LOOKS_REQUEST_ONLY=NO
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip/042_post_response.json
BODY_HEAD_BEGIN
{
  "result": "error",
  "error_code": "BAD_REQUEST",
  "message": "Missing required field: task_domain_code",
  "safety": {
    "external_execution_performed_flag": false,
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false
  }
}
BODY_HEAD_END
DIAGNOSIS=POST_STATUS_NOT_2XX
```

## ZIP inspect
```
============================================================
ZIP RESPONSE INSPECT
============================================================
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip/042_post_response.json
ZIP_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips
RUN_CODE=B6R95R3Z_R8_TAIKA_APP_SURFACE_20260509_053234
ZIP_HINTS_BEGIN
ZIP_HINTS_END
LATEST_ZIPS_BEGIN
mtime=2026-05-08T03:21:48.797Z | size=15582 | after_start=NO | name_matches_run=NO | path=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3J_TAIKA_REFORM_DELIVERABLE_TEST_deliverables_1778210507347_9626541a-8462-.zip
mtime=2026-05-08T03:09:39.012Z | size=7482 | after_start=NO | name_matches_run=NO | path=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3I_ZIP_FINAL_TEST_B6R95R3I_zip_1778209778169_83be4465-4598-41e9-9a76-3c7f7.zip
mtime=2026-05-08T03:02:37.961Z | size=7560 | after_start=NO | name_matches_run=NO | path=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3G_ZIP_LINK_ACTUAL_FILE_TEST_B6R95R3G_zip_1778209356656_467ab070-6351-404e.zip
mtime=2026-05-08T02:58:51.157Z | size=7540 | after_start=NO | name_matches_run=NO | path=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/B6R95R3E_MULTI_ARTIFACT_ZIP_TEST_B6R95R3E_zip_1778209130184_a9d9887b-1449-4d71-8.zip
LATEST_ZIPS_END
RESPONSE_HAS_ZIP_HINT=NO
CURRENT_ZIP_CONFIRMED=NO
DIAGNOSIS=NO_CURRENT_ZIP_CONFIRMED
```

## ZIP list
```
ZIP_NOT_AVAILABLE_FOR_LIST
```

## Next error extract
```
# B6R95R3Z-R8 Next Error Extract

ERROR_CODE=BAD_REQUEST
MESSAGE=Missing required field: task_domain_code

```
--- hit line 5 ---
    1: ============================================================
    2: POST R8 APP SURFACE
    3: ============================================================
    4: ROUTE=/aiworker/v1/runtime-execution/request
    5: STATUS=400
    6: AUTH_HEADER=Bearer ***MASKED***
    7: IDEMPOTENCY_KEY=***SET***
    8: APP_SURFACE_CODE=cx22073jw_direct_smoke
    9: AUTH_FAIL=NO
--- hit line 8 ---
    4: ROUTE=/aiworker/v1/runtime-execution/request
    5: STATUS=400
    6: AUTH_HEADER=Bearer ***MASKED***
    7: IDEMPOTENCY_KEY=***SET***
    8: APP_SURFACE_CODE=cx22073jw_direct_smoke
    9: AUTH_FAIL=NO
   10: HAS_SUMMARY=NO
   11: HAS_ZIP_HINT=NO
   12: HAS_GENERATED_ARTIFACTS=NO
--- hit line 15 ---
   11: HAS_ZIP_HINT=NO
   12: HAS_GENERATED_ARTIFACTS=NO
   13: HAS_TAIKA_TEXT=NO
   14: LOOKS_REQUEST_ONLY=NO
   15: RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip/042_post_response.json
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "BAD_REQUEST",
--- hit line 19 ---
   15: RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip/042_post_response.json
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "BAD_REQUEST",
   20:   "message": "Missing required field: task_domain_code",
   21:   "safety": {
   22:     "external_execution_performed_flag": false,
   23:     "pg_apply_performed_flag": false,
--- hit line 20 ---
   16: BODY_HEAD_BEGIN
   17: {
   18:   "result": "error",
   19:   "error_code": "BAD_REQUEST",
   20:   "message": "Missing required field: task_domain_code",
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
   33:   "message": "Missing required field: task_domain_code",
   34:   "safety": {
   35:     "external_execution_performed_flag": false,
   36:     "pg_apply_performed_flag": false,
--- hit line 33 ---
   29: 
   30: {
   31:   "result": "error",
   32:   "error_code": "BAD_REQUEST",
   33:   "message": "Missing required field: task_domain_code",
   34:   "safety": {
   35:     "external_execution_performed_flag": false,
   36:     "pg_apply_performed_flag": false,
   37:     "destructive_action_performed_flag": false
``````

## Execute route candidates
```
# Execute route candidates if request route only

SELECTED_ROUTE=/aiworker/v1/runtime-execution/request

## POST key result
STATUS=400
HAS_ZIP_HINT=NO
HAS_GENERATED_ARTIFACTS=NO
LOOKS_REQUEST_ONLY=NO
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip/042_post_response.json
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
1033:    "  'deliverable_ref', jsonb_build_object(",
1039:    "  'deliverable_link', :'deliverable_zip_link',",    "  'requester_delivery_payload', jsonb_build_object(",
1041:    "    'deliverable_title', :'output_title_ja',",
1042:    "    'package_kind', 'deliverable_zip',",
1043:    "    'deliverable_kind', 'document',",
1045:    "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
1046:    "    'deliverable_link', :'deliverable_zip_link',",
1047:    "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
1048:    "    'deliverable_ref', jsonb_build_object(",
1074:    output_title_ja: deliverable.outputTitle,
1075:    output_body_ja: deliverable.bodyMarkdown,
1076:    output_summary_ja: deliverable.summaryText,
1077:    quality_notes: deliverable.qualityNotes,
1078:    unresolved_issues: deliverable.unresolvedIssues,
1079:    next_steps: deliverable.nextSteps,
1080:    deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
1081:    deliverable_zip_link: deliverable.deliverablePackage.zip_link,
1082:    generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),
1083:    robot_context_jsonb: JSON.stringify(deliverable.robotContext),
1084:    generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),
1085:    output_payload_jsonb: JSON.stringify(deliverable.outputPayload),
1086:    artifacts_jsonb: JSON.stringify(deliverable.artifacts)
1089:  return aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable);
```

## Server log tail
```
AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:8787
```

## AICM touch check
```
AICM_BASE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip/000_start_marker
```

## Runtime touch check
```
AIWORKER_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os
START_MARKER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_053234_b6r95r3z_r8_app_surface_code_retry_to_zip/000_start_marker
```

## Secret scan
```
Scan generated files only; token and idempotency key values must not appear.
```
FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R8_APP_SURFACE_POST_STILL_NON_2XX
NEXT=non-2xxならERROR_EXTRACT_MDを確認。request作成止まりならexecute/run route二段階。zip確認済みならpush準備。
