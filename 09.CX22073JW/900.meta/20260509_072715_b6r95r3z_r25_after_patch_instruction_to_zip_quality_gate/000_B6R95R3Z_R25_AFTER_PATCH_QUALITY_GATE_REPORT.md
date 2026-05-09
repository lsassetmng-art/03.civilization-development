# B6R95R3Z-R25 After Patch Quality Gate Report

RUN_TS=20260509_072715
RUN_CODE=B6R95R3Z_R25_TAIKA_AFTER_PATCH_20260509_072715
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_072715_b6r95r3z_r25_after_patch_instruction_to_zip_quality_gate
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
APP_SURFACE_CODE=ai_company_manager
MODEL_CODE=byd2_003_asic_leader3
TASK_DOMAIN_CODE=history_worldview

## Declaration
- DB_WRITE_DIRECT=NO
- AIWORKEROS_RUNTIME_WRITE=YES
- FILE_WRITE=YES
- API_POST=YES
- HTTP_GET=YES
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Write mode precheck
```
Output format is unaligned.
transaction_read_only=off
default_transaction_read_only=off
pg_is_in_recovery=false
BEGIN
inside_plain_begin_transaction_read_only=off
ROLLBACK
note=No INSERT/UPDATE/DELETE executed by this precheck.
```

## Ready / brain probe
```
============================================================
READY / BRAIN PROBE R25
============================================================
READY_STATUS=401
BRAIN_STATUS=200
BRAIN_HAS_TAIKA=YES
BRAIN_HAS_SELECTOR_V2=YES
BRAIN_BODY_HEAD_BEGIN
{
  "result": "ok",
  "external_execution_performed_flag": false,
  "data": {
    "model_code": "byd2_003_asic_leader3",
    "use_purpose_code": "review",
    "brain_context": {
      "domains": [
        {
          "materialCount": 20,
          "brainDomainCode": "civilization_foundation_history",
          "materialSummaries": [
            {
              "tags": [
                "prometheus",
                "governance",
                "risk"
              ],
              "unitCode": "civ_found_001_prometheus_lessons",
              "depthCode": "advanced",
              "domainRank": 4,
              "overallRank": 21,
              "unitTitleJa": "Prometheus系史料の読み方",
              "unitDetailJa": "出来事を刺激的な破壊史としてではなく、統治設計、依存リスク、安全境界、権限解除の失敗回避として読む。",
              "brainDataCode": "civ_found_001_prometheus_lessons",
              "riskClassCode": "medium",
              "unitSummaryJa": "Prometheus関連史は、AI管理依存、統治解除、破壊、放棄の教訓を読む材料。",
              "dataDepthLevel": 40,
              "practicalUseJa": "President / Manager / Reviewer の方針レビュー。",
              "selectionScore": -40,
              "examplePromptJa": "Prometheus史の教訓を安全設計の観点で整理して。",
              "safetyBoundaryJa": "現実の攻撃・破壊・支配支援に使わない。",
              "selectionReasonJa": null,
              "materialSourceKind": "base_material",
              "effectiveUsePurposeCodes": [
                "reference",
                "review",
                "executive_planning"
              ]
            },
            {
              "tags": [
                "prometheus",
                "governance",
                "risk"
              ],
              "unitCode": "civ_found_001_prometheus_lessons",
              "depthCode": "advanced",
              "domainRank": 5,
              "overallRank": 22,
              "unitTitleJa": "Prometheus系史料の読み方",
              "unitDetailJa": "出来事を刺激的な破壊史としてではなく、統治設計、依存リスク、安全境界、権限解除の失敗回避として読む。",
              "brainDataCode": "civ_found_001_prometheus_lessons",
              "riskClassCode": "medium",
              "unitSummaryJa": "Prometheus関連史は、AI管理依存、統治解除、破壊、放棄の教訓を読む材料。",
              "dataDepthLevel": 40,
              "practicalUseJa": "President / Manager / Reviewer の方針レビュー。",
              "selectionScore": -40,
              "examplePromptJa": "Prometheus史の教訓を安全設計の観点で整理して。",
              "safetyBoundaryJa": "現実の攻撃・破壊・支配支援に使わない。",
              "selectionReasonJa": null,
              "materialSourceKind": "base_material",
              "effectiveUsePurposeCodes": [
                "reference",
                "review",
                "worldbuilding",
                "business_planning"
              ]
            },
            {
              "tags": [
                "prometheus",
                "governance",
                "risk"
              ],
              "unitCode": "civ_found_001_prometheus_lessons",
              "depthCode": "advanced",
              "domainRank": 3,
              "overallRank": 23,
              "unitTitleJa
BRAIN_BODY_HEAD_END
FINAL_STATUS=READY_AND_BRAIN_PROBE_PASS
```

## POST
```
============================================================
POST R25 AFTER R24 PATCH
============================================================
ROUTE=/aiworker/v1/runtime-execution/request
STATUS=500
AUTH_HEADER=Bearer ***MASKED***
IDEMPOTENCY_KEY=***SET***
APP_SURFACE_CODE=ai_company_manager
AUTH_FAIL=NO
HAS_SUMMARY=NO
HAS_ZIP_HINT=NO
HAS_GENERATED_ARTIFACTS=NO
HAS_TAIKA_TEXT=NO
LOOKS_REQUEST_ONLY=YES
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_072715_b6r95r3z_r25_after_patch_instruction_to_zip_quality_gate/042_post_response.json
BODY_HEAD_BEGIN
{
  "result": "error",
  "error_code": "INTERNAL_ERROR",
  "message": "ERROR:  cannot execute INSERT in a read-only transaction\nCONTEXT:  SQL statement \"insert into aiworker.runtime_execution_request (\n    request_code,\n    app_surface_code,\n    app_surface_name_ja,\n    source_app_ref,\n    source_request_ref,\n    model_code,\n    model_no,\n    model_name_ja,\n    series_code,\n    series_name_ja,\n    role_layer_code,\n    role_layer_name_ja,\n    task_domain_code,\n    task_title,\n    task_instruction_ja,\n    requested_by_ref,\n    idempotency_key,\n    request_status_code,\n    operation_mode_code,\n    self_review_pass_count,\n    proposal_count_min,\n    proposal_count_max,\n    response_style_code,\n    required_checklist_code,\n    context_scope_code,\n    cx_reference_depth_code,\n    handoff_format_code,\n    handoff_required_flag,\n    review_required_flag,\n    human_go_required_flag,\n    external_execution_allowed_flag,\n    pg_apply_allowed_flag,\n    destructive_action_allowed_flag,\n    allowed_actions_snapshot_jsonb,\n    forbidden_actions_snapshot_jsonb,\n    prompt_fragment_codes_snapshot_jsonb,\n    runtime_control_snapshot_jsonb\n  )\n  values (\n    v_request_code,\n    v_profile.app_surface_code,\n    v_profile.app_surface_name_ja,\n    coalesce(p_source_app_ref, ''),\n    coalesce(p_source_request_ref, ''),\n    v_profile.model_code,\n    v_profile.model_no,\n    v_profile.model_name_ja,\n    v_profile.series_code,\n    v_profile.series_name_ja,\n    v_profile.role_layer_code,\n    v_profile.role_layer_name_ja,\n    coalesce(nullif(p_task_domain_code, ''), 'general'),\n    p_task_title,\n    p_task_instruction_ja,\n    coalesce(nullif(p_requested_by_ref, ''), 'human'),\n    v_idempotency_key,\n    'REQUESTED_INTERNAL_ONLY',\n    v_profile.operation_mode_code,\n    v_profile.self_review_pass_count,\n    v_profile.proposal_count_min,\n    v_profile.proposal_count_max,\n    v_profile.response_style_code,\n    v_profile.required_checklist_code,\n    v_profile.context_scope_code,\n    v_profile.cx_reference_depth_code,\n    v_profile.handoff_format_code,\n    v_profile.handoff_required_flag,\n    v_profile.review_required_flag,\n    v_profile.human_go_required_flag,\n    v_profile.external_execution_allowed_flag,\n    v_profile.pg_apply_allowed_flag,\n    v_profile.destructive_action_allowed_flag,\n    v_profile.allowed_actions_jsonb,\n    v_profile.forbidden_actions_jsonb,\n    v_profile.prompt_fragment_codes_jsonb,\n    v_profile.runtime_control_jsonb\n  )\n  returning request_id\"\nPL/pgSQL function fn_runtime_execution_create_request(text,text,text,text,text,text,text,text,text) line 36 at SQL statement\nPL/pgSQL function fn_runtime_execution_create_request_with_route_v1(text,text,text,text,text,text,text,text,text,text) line 5 at assignment",
  "safety": {
    "external_execution_performed_flag": false,
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false
  }
}
BODY_HEAD_END
DIAGNOSIS=POST_STATUS_NOT_2XX
```

## DB verify
```
SET
 section | request_id | request_code | app_surface_code | model_code | task_domain_code | request_status_code | source_route_code | created_at | updated_at 
---------+------------+--------------+------------------+------------+------------------+---------------------+-------------------+------------+------------
(0 rows)

 section | row_json 
---------+----------
(0 rows)

 section | row_json 
---------+----------
(0 rows)

```

## Quality summary
```
# B6R95R3Z-R25 Quality Summary

## Extracted zip

```
EXISTING_ZIP=UNKNOWN
main_chars=0
summary_chars=0
```

## Quality checks

```
zip_exists=FAIL
has_summary_file=FAIL
has_main_deliverable_file=FAIL
has_manifest_file=FAIL
main_long_enough=FAIL
summary_long_enough=FAIL
core_terms_pass=FAIL
person_terms_pass=FAIL
system_terms_pass=FAIL
timeline_terms_pass=FAIL
source_caution_terms_pass=FAIL
cx_material_patch_trace_pass=FAIL
not_instruction_echo_only=PASS
PASS_COUNT=1
FAIL_COUNT=12
FAIL_ROWS=zip_exists,has_summary_file,has_main_deliverable_file,has_manifest_file,main_long_enough,summary_long_enough,core_terms_pass,person_terms_pass,system_terms_pass,timeline_terms_pass,source_caution_terms_pass,cx_material_patch_trace_pass
```

## Core term hits

```
大化の改新=0
乙巳の変=0
改新の詔=0
公地公民=0
律令国家=0
中央集権=0
大宝律令=0
```

## Person term hits

```
中大兄皇子=0
中臣鎌足=0
蘇我入鹿=0
蘇我蝦夷=0
皇極天皇=0
孝徳天皇=0
天智天皇=0
藤原鎌足=0
```

## System term hits

```
戸籍=0
計帳=0
班田=0
租=0
庸=0
調=0
国司=0
郡司=0
国郡里=0
```

## Timeline term hits

```
645=0
646=0
663=0
701=0
白村江=0
近江令=0
飛鳥浄御原令=0
```

## Source caution term hits

```
日本書紀=0
史料=0
史料批判=0
後世=0
律令制度=0
一挙=0
段階的=0
断定=0
注意=0
```

## CX patch/material trace hits

```
B6R95R3Z-R24=0
CX22073JW=0
runtime material=0
selector v2=0
CX参照素材=0
cx_material=0
```

## Main deliverable head

```

```

## Summary head

```

```

FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R25_AFTER_PATCH_DELIVERABLE_QUALITY_STILL_WEAK```

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
FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R25_POST_NON_2XX
NEXT=PASSならR26で最終検証/差分確認。pushは明示依頼後のみ。弱い場合はR25 quality summaryのFAIL_ROWS確認。
