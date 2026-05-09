# B6R95R3Z-R25A POST Non-2xx Exact Error

R25_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_072715_b6r95r3z_r25_after_patch_instruction_to_zip_quality_gate
R24_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_070250_b6r95r3z_r24_patch_cx_material_body_generation

## 1. POST key lines
```
5:STATUS=500
9:AUTH_FAIL=NO
10:HAS_SUMMARY=NO
11:HAS_ZIP_HINT=NO
12:HAS_GENERATED_ARTIFACTS=NO
13:HAS_TAIKA_TEXT=NO
14:LOOKS_REQUEST_ONLY=YES
16:BODY_HEAD_BEGIN
19:  "error_code": "INTERNAL_ERROR",
20:  "message": "ERROR:  cannot execute INSERT in a read-only transaction\nCONTEXT:  SQL statement \"insert into aiworker.runtime_execution_request (\n    request_code,\n    app_surface_code,\n    app_surface_name_ja,\n    source_app_ref,\n    source_request_ref,\n    model_code,\n    model_no,\n    model_name_ja,\n    series_code,\n    series_name_ja,\n    role_layer_code,\n    role_layer_name_ja,\n    task_domain_code,\n    task_title,\n    task_instruction_ja,\n    requested_by_ref,\n    idempotency_key,\n    request_status_code,\n    operation_mode_code,\n    self_review_pass_count,\n    proposal_count_min,\n    proposal_count_max,\n    response_style_code,\n    required_checklist_code,\n    context_scope_code,\n    cx_reference_depth_code,\n    handoff_format_code,\n    handoff_required_flag,\n    review_required_flag,\n    human_go_required_flag,\n    external_execution_allowed_flag,\n    pg_apply_allowed_flag,\n    destructive_action_allowed_flag,\n    allowed_actions_snapshot_jsonb,\n    forbidden_actions_snapshot_jsonb,\n    prompt_fragment_codes_snapshot_jsonb,\n    runtime_control_snapshot_jsonb\n  )\n  values (\n    v_request_code,\n    v_profile.app_surface_code,\n    v_profile.app_surface_name_ja,\n    coalesce(p_source_app_ref, ''),\n    coalesce(p_source_request_ref, ''),\n    v_profile.model_code,\n    v_profile.model_no,\n    v_profile.model_name_ja,\n    v_profile.series_code,\n    v_profile.series_name_ja,\n    v_profile.role_layer_code,\n    v_profile.role_layer_name_ja,\n    coalesce(nullif(p_task_domain_code, ''), 'general'),\n    p_task_title,\n    p_task_instruction_ja,\n    coalesce(nullif(p_requested_by_ref, ''), 'human'),\n    v_idempotency_key,\n    'REQUESTED_INTERNAL_ONLY',\n    v_profile.operation_mode_code,\n    v_profile.self_review_pass_count,\n    v_profile.proposal_count_min,\n    v_profile.proposal_count_max,\n    v_profile.response_style_code,\n    v_profile.required_checklist_code,\n    v_profile.context_scope_code,\n    v_profile.cx_reference_depth_code,\n    v_profile.handoff_format_code,\n    v_profile.handoff_required_flag,\n    v_profile.review_required_flag,\n    v_profile.human_go_required_flag,\n    v_profile.external_execution_allowed_flag,\n    v_profile.pg_apply_allowed_flag,\n    v_profile.destructive_action_allowed_flag,\n    v_profile.allowed_actions_jsonb,\n    v_profile.forbidden_actions_jsonb,\n    v_profile.prompt_fragment_codes_jsonb,\n    v_profile.runtime_control_jsonb\n  )\n  returning request_id\"\nPL/pgSQL function fn_runtime_execution_create_request(text,text,text,text,text,text,text,text,text) line 36 at SQL statement\nPL/pgSQL function fn_runtime_execution_create_request_with_route_v1(text,text,text,text,text,text,text,text,text,text) line 5 at assignment",
27:BODY_HEAD_END
28:DIAGNOSIS=POST_STATUS_NOT_2XX
```

## 2. POST response
```
{
  "result": "error",
  "error_code": "INTERNAL_ERROR",
  "message": "ERROR:  cannot execute INSERT in a read-only transaction\nCONTEXT:  SQL statement \"insert into aiworker.runtime_execution_request (\n    request_code,\n    app_surface_code,\n    app_surface_name_ja,\n    source_app_ref,\n    source_request_ref,\n    model_code,\n    model_no,\n    model_name_ja,\n    series_code,\n    series_name_ja,\n    role_layer_code,\n    role_layer_name_ja,\n    task_domain_code,\n    task_title,\n    task_instruction_ja,\n    requested_by_ref,\n    idempotency_key,\n    request_status_code,\n    operation_mode_code,\n    self_review_pass_count,\n    proposal_count_min,\n    proposal_count_max,\n    response_style_code,\n    required_checklist_code,\n    context_scope_code,\n    cx_reference_depth_code,\n    handoff_format_code,\n    handoff_required_flag,\n    review_required_flag,\n    human_go_required_flag,\n    external_execution_allowed_flag,\n    pg_apply_allowed_flag,\n    destructive_action_allowed_flag,\n    allowed_actions_snapshot_jsonb,\n    forbidden_actions_snapshot_jsonb,\n    prompt_fragment_codes_snapshot_jsonb,\n    runtime_control_snapshot_jsonb\n  )\n  values (\n    v_request_code,\n    v_profile.app_surface_code,\n    v_profile.app_surface_name_ja,\n    coalesce(p_source_app_ref, ''),\n    coalesce(p_source_request_ref, ''),\n    v_profile.model_code,\n    v_profile.model_no,\n    v_profile.model_name_ja,\n    v_profile.series_code,\n    v_profile.series_name_ja,\n    v_profile.role_layer_code,\n    v_profile.role_layer_name_ja,\n    coalesce(nullif(p_task_domain_code, ''), 'general'),\n    p_task_title,\n    p_task_instruction_ja,\n    coalesce(nullif(p_requested_by_ref, ''), 'human'),\n    v_idempotency_key,\n    'REQUESTED_INTERNAL_ONLY',\n    v_profile.operation_mode_code,\n    v_profile.self_review_pass_count,\n    v_profile.proposal_count_min,\n    v_profile.proposal_count_max,\n    v_profile.response_style_code,\n    v_profile.required_checklist_code,\n    v_profile.context_scope_code,\n    v_profile.cx_reference_depth_code,\n    v_profile.handoff_format_code,\n    v_profile.handoff_required_flag,\n    v_profile.review_required_flag,\n    v_profile.human_go_required_flag,\n    v_profile.external_execution_allowed_flag,\n    v_profile.pg_apply_allowed_flag,\n    v_profile.destructive_action_allowed_flag,\n    v_profile.allowed_actions_jsonb,\n    v_profile.forbidden_actions_jsonb,\n    v_profile.prompt_fragment_codes_jsonb,\n    v_profile.runtime_control_jsonb\n  )\n  returning request_id\"\nPL/pgSQL function fn_runtime_execution_create_request(text,text,text,text,text,text,text,text,text) line 36 at SQL statement\nPL/pgSQL function fn_runtime_execution_create_request_with_route_v1(text,text,text,text,text,text,text,text,text,text) line 5 at assignment",
  "safety": {
    "external_execution_performed_flag": false,
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false
  }
}```

## 3. DB verify key lines
```
2: section | request_id | request_code | app_surface_code | model_code | task_domain_code | request_status_code | source_route_code | created_at | updated_at 
6: section | row_json 
10: section | row_json 
```

## 4. R25 quality summary if created
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

## 5. Runtime server log tail after R24 patch
```
AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:8787
```

## 6. Diagnosis hint
- POST reached server but failed internally.
- Likely R24 helper failed while calling/parsing psql material rows.

FINAL_STATUS=B6R95R3Z_R25A_NON_2XX_ERROR_EXTRACT_CREATED
