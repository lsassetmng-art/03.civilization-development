# B6R95R3Z-R29D Existing Model Code Canon Candidate Audit Report

RUN_TS=20260509_092909
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_092909_b6r95r3z_r29d_existing_model_code_canon_candidate_audit

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Files
- SQL_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_092909_b6r95r3z_r29d_existing_model_code_canon_candidate_audit/100_existing_model_code_canon_candidate_audit.sql
- SQL_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_092909_b6r95r3z_r29d_existing_model_code_canon_candidate_audit/110_existing_model_code_canon_candidate_audit.log
- SUMMARY_MD=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_092909_b6r95r3z_r29d_existing_model_code_canon_candidate_audit/120_R29D_MODEL_CODE_CANON_CANDIDATE_SUMMARY.md
- SATO_REVIEW_DOC=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_092909_b6r95r3z_r29d_existing_model_code_canon_candidate_audit/130_R29E_SATO_REVIEW_CHECKLIST.md

## Summary
# B6R95R3Z-R29D Model Code Canon Candidate Summary

## Key finding target
- runtime material view uses public code such as BYD2-003.
- runtime request may use normalized/internal code such as byd2_003_asic_leader3.
- DB側で resolver/canon を整えて、server.jsの決め打ちaliasを禁止する。

## Decision hint
```
91:     section      |                                  recommendation                                   
93: 06_decision_hint | NO_CLEAR_PUBLIC_RUNTIME_MAPPING_COLUMNS_FOUND_ADD_ONLY_RESOLVER_TABLE_RECOMMENDED
```

## Candidate table/column lines
```
15: 02_candidate_table_column_summary | aiworker     | control_policy_package           | package_code, package_name, package_summary, service_code, manufacturer_code, series_code, role_class_code, model_code, status_code, version_no, owner_team, approver_name, priority_no, effective_from, review_due_on, change_note, enabled, created_at, updated_at
16: 02_candidate_table_column_summary | aiworker     | model_identity_spec              | model_code, series_prefix_code, style_no, presentation_gender_code, version_no, enabled, created_at, updated_at
17: 02_candidate_table_column_summary | aiworker     | model_public_registry            | registry_code, manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, model_category_code, public_summary_ja, capability_summary_ja, personality_summary_ja, safety_note_ja, public_traits_jsonb, recommended_usage_jsonb, source_layer_code, public_display_allowed_flag, app_reference_allowed_flag, status_code, sort_order, created_at, updated_at
18: 02_candidate_table_column_summary | aiworker     | model_runtime_control_override   | model_code, model_no, model_name_ja, operation_mode_code, self_review_pass_count, proposal_count_min, proposal_count_max, response_style_code, required_checklist_code, context_scope_code, cx_reference_depth_code, handoff_format_code, allowed_actions_jsonb, forbidden_actions_jsonb, prompt_fragment_codes_jsonb, model_focus_ja, control_note_ja, status_code, sort_order, created_at, updated_at
19: 02_candidate_table_column_summary | aiworker     | model_service_assignment         | model_code, service_code, enabled, notes, created_at, updated_at
20: 02_candidate_table_column_summary | aiworker     | model_style_assignment           | model_code, style_code, is_default, enabled, created_at, updated_at
21: 02_candidate_table_column_summary | aiworker     | president_model_catalog          | president_model_id, president_model_code, president_model_name, president_model_name_ja, manufacturer_code, series_code, model_selector_text, authority_role_code, supported_operation_modes_jsonb, executive_scope_jsonb, management_standard_family_code, default_governance_posture_code, catalog_status_code, runtime_status_code, external_execution_allowed_flag, auto_manager_distribution_allowed_flag, note, created_at, updated_at, model_no, model_code, role_class_code, machine_name, machine_name_ja, product_name, product_name_ja, model_generation_code
22: 02_candidate_table_column_summary | aiworker     | robot_model_capability_profile   | model_capability_id, manufacturer_code, series_code, model_code, model_no, axis_code, value_code, public_label_ja, public_summary_ja, internal_note_ja, public_display_allowed_flag, status_code, sort_order, created_at, updated_at
23: 02_candidate_table_column_summary | aiworker     | robot_model_code_deprecation_map | old_model_code, new_model_code, model_no, reason_ja, deprecation_status_code, physical_delete_allowed_flag, public_hide_old_flag, created_at, updated_at
24: 02_candidate_table_column_summary | aiworker     | worker_model_catalog             | model_code, manufacturer_code, series_code, role_class_code, model_no, machine_name, machine_name_ja, product_name, product_name_ja, model_summary, enabled, sort_order, created_at, updated_at
25: 02_candidate_table_column_summary | aiworker     | worker_model_extension_catalog   | manufacturer_code, series_code, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, capability_summary, max_managed_worker_count, task_complexity_code, single_task_allowed_flag, repetitive_task_allowed_flag, complex_task_allowed_flag, status_code, sort_order, created_at, updated_at
33: 03_model_public_registry | {"model_no": "BYD2-001", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_001_asic_leader1", "model_name": "ASIC Leader1", "sort_order": 3110, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader1", "registry_code": "asic_byd2_001", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "基本進行・形式チェックレベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "1.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "タスク分解、進行確認、形式チェックを行う。", "personality_summary_ja": "", "recommended_usage_jsonb": ["小規模作業", "単純なWorker成果物確認", "形式チェック中心のレビュー"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
34: 03_model_public_registry | {"model_no": "BYD2-002", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_002_asic_leader2", "model_name": "ASIC Leader2", "sort_order": 3120, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader2", "registry_code": "asic_byd2_002", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "品質レビュー・整合性確認レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "2.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "成果物の品質、差し戻し、整合性確認を強化する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["提案書", "調査資料", "要約", "ヘルプデスク回答", "複数Worker成果物の確認"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
35: 03_model_public_registry | {"model_no": "BYD2-003", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_003_asic_leader3", "model_name": "ASIC Leader3", "sort_order": 3130, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader3", "registry_code": "asic_byd2_003", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "統合設計・リスク判断・納品品質統括レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "3.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "複雑案件を構造化し、統合設計、リスク判断、納品品質を統括する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["事業計画", "PG開発方針", "複数分野横断資料", "大きめのプロジェクト", "納品前統合判断"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
48: 03_worker_model_extension_catalog | {"model_no": "BYD2-001", "created_at": "2026-04-25T04:39:43.16418+00:00", "model_code": "byd2_001_asic_leader1", "model_name": "ASIC Leader1", "sort_order": 110, "updated_at": "2026-04-25T04:58:33.541079+00:00", "series_code": "beyond_series", "status_code": "active", "model_name_ja": "ASIC Leader1", "role_layer_code": "LEADER", "manufacturer_code": "asic", "capability_summary": "基本進行・形式チェックレベル", "role_layer_name_ja": "リーダー", "task_complexity_code": "leader_basic_progress_format_level_1", "max_managed_worker_count": null, "single_task_allowed_flag": false, "complex_task_allowed_flag": true, "repetitive_task_allowed_flag": false}
49: 03_worker_model_extension_catalog | {"model_no": "BYD2-002", "created_at": "2026-04-25T04:39:43.16418+00:00", "model_code": "byd2_002_asic_leader2", "model_name": "ASIC Leader2", "sort_order": 120, "updated_at": "2026-04-25T04:58:33.541079+00:00", "series_code": "beyond_series", "status_code": "active", "model_name_ja": "ASIC Leader2", "role_layer_code": "LEADER", "manufacturer_code": "asic", "capability_summary": "品質レビュー・整合性確認レベル", "role_layer_name_ja": "リーダー", "task_complexity_code": "leader_quality_review_consistency_level_2", "max_managed_worker_count": null, "single_task_allowed_flag": false, "complex_task_allowed_flag": true, "repetitive_task_allowed_flag": false}
50: 03_worker_model_extension_catalog | {"model_no": "BYD2-003", "created_at": "2026-04-25T04:39:43.16418+00:00", "model_code": "byd2_003_asic_leader3", "model_name": "ASIC Leader3", "sort_order": 130, "updated_at": "2026-04-25T04:58:33.541079+00:00", "series_code": "beyond_series", "status_code": "active", "model_name_ja": "ASIC Leader3", "role_layer_code": "LEADER", "manufacturer_code": "asic", "capability_summary": "統合設計・リスク判断・納品品質統括レベル", "role_layer_name_ja": "リーダー", "task_complexity_code": "leader_integrated_design_risk_delivery_level_3", "max_managed_worker_count": null, "single_task_allowed_flag": false, "complex_task_allowed_flag": true, "repetitive_task_allowed_flag": false}
60:                section                |            table_name            | has_model_code | has_model_no | has_public_model_code | has_runtime_model_code | has_aiworker_model_code | has_active_flag 
62: 04_existing_canon_suitability_signals | model_public_registry            |              1 |            1 |                     0 |                      0 |                       0 |               0
63: 04_existing_canon_suitability_signals | model_runtime_control_override   |              1 |            1 |                     0 |                      0 |                       0 |               0
64: 04_existing_canon_suitability_signals | president_model_catalog          |              1 |            1 |                     0 |                      0 |                       0 |               0
65: 04_existing_canon_suitability_signals | robot_model_capability_profile   |              1 |            1 |                     0 |                      0 |                       0 |               0
66: 04_existing_canon_suitability_signals | worker_model_catalog             |              1 |            1 |                     0 |                      0 |                       0 |               0
67: 04_existing_canon_suitability_signals | worker_model_extension_catalog   |              1 |            1 |                     0 |                      0 |                       0 |               0
68: 04_existing_canon_suitability_signals | robot_model_code_deprecation_map |              0 |            1 |                     0 |                      0 |                       0 |               0
69: 04_existing_canon_suitability_signals | control_policy_package           |              1 |            0 |                     0 |                      0 |                       0 |               0
70: 04_existing_canon_suitability_signals | model_identity_spec              |              1 |            0 |                     0 |                      0 |                       0 |               0
71: 04_existing_canon_suitability_signals | model_service_assignment         |              1 |            0 |                     0 |                      0 |                       0 |               0
72: 04_existing_canon_suitability_signals | model_style_assignment           |              1 |            0 |                     0 |                      0 |                       0 |               0
78:           section           | model_code | row_count 
83:            section            |  app_surface_code  |      model_code       | row_count 
```

## BYD rows
```
33: 03_model_public_registry | {"model_no": "BYD2-001", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_001_asic_leader1", "model_name": "ASIC Leader1", "sort_order": 3110, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader1", "registry_code": "asic_byd2_001", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "基本進行・形式チェックレベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "1.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "タスク分解、進行確認、形式チェックを行う。", "personality_summary_ja": "", "recommended_usage_jsonb": ["小規模作業", "単純なWorker成果物確認", "形式チェック中心のレビュー"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
34: 03_model_public_registry | {"model_no": "BYD2-002", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_002_asic_leader2", "model_name": "ASIC Leader2", "sort_order": 3120, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader2", "registry_code": "asic_byd2_002", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "品質レビュー・整合性確認レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "2.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "成果物の品質、差し戻し、整合性確認を強化する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["提案書", "調査資料", "要約", "ヘルプデスク回答", "複数Worker成果物の確認"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
35: 03_model_public_registry | {"model_no": "BYD2-003", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_003_asic_leader3", "model_name": "ASIC Leader3", "sort_order": 3130, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader3", "registry_code": "asic_byd2_003", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "統合設計・リスク判断・納品品質統括レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "3.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "複雑案件を構造化し、統合設計、リスク判断、納品品質を統括する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["事業計画", "PG開発方針", "複数分野横断資料", "大きめのプロジェクト", "納品前統合判断"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
48: 03_worker_model_extension_catalog | {"model_no": "BYD2-001", "created_at": "2026-04-25T04:39:43.16418+00:00", "model_code": "byd2_001_asic_leader1", "model_name": "ASIC Leader1", "sort_order": 110, "updated_at": "2026-04-25T04:58:33.541079+00:00", "series_code": "beyond_series", "status_code": "active", "model_name_ja": "ASIC Leader1", "role_layer_code": "LEADER", "manufacturer_code": "asic", "capability_summary": "基本進行・形式チェックレベル", "role_layer_name_ja": "リーダー", "task_complexity_code": "leader_basic_progress_format_level_1", "max_managed_worker_count": null, "single_task_allowed_flag": false, "complex_task_allowed_flag": true, "repetitive_task_allowed_flag": false}
49: 03_worker_model_extension_catalog | {"model_no": "BYD2-002", "created_at": "2026-04-25T04:39:43.16418+00:00", "model_code": "byd2_002_asic_leader2", "model_name": "ASIC Leader2", "sort_order": 120, "updated_at": "2026-04-25T04:58:33.541079+00:00", "series_code": "beyond_series", "status_code": "active", "model_name_ja": "ASIC Leader2", "role_layer_code": "LEADER", "manufacturer_code": "asic", "capability_summary": "品質レビュー・整合性確認レベル", "role_layer_name_ja": "リーダー", "task_complexity_code": "leader_quality_review_consistency_level_2", "max_managed_worker_count": null, "single_task_allowed_flag": false, "complex_task_allowed_flag": true, "repetitive_task_allowed_flag": false}
50: 03_worker_model_extension_catalog | {"model_no": "BYD2-003", "created_at": "2026-04-25T04:39:43.16418+00:00", "model_code": "byd2_003_asic_leader3", "model_name": "ASIC Leader3", "sort_order": 130, "updated_at": "2026-04-25T04:58:33.541079+00:00", "series_code": "beyond_series", "status_code": "active", "model_name_ja": "ASIC Leader3", "role_layer_code": "LEADER", "manufacturer_code": "asic", "capability_summary": "統合設計・リスク判断・納品品質統括レベル", "role_layer_name_ja": "リーダー", "task_complexity_code": "leader_integrated_design_risk_delivery_level_3", "max_managed_worker_count": null, "single_task_allowed_flag": false, "complex_task_allowed_flag": true, "repetitive_task_allowed_flag": false}
80: 05_material_view_byd_values | BYD2-003   |      1070
85: 05_runtime_request_byd_values | ai_company_manager | byd2_003_asic_leader3 |         2
```

## Sato review checklist
# R29E 佐藤レビュー チェックリスト

## レビュー対象

AIWorkerOS / CX22073JW 連携で使う model code の正本整理。

## 問題

- CX runtime material view 側は `BYD2-003` のような公開型番を持つ。
- runtime request 側は `byd2_003_asic_leader3` のような内部実行コードを持つことがある。
- どちらも `model_code` 名で扱われ、意味が混在している。

## レビュー観点

1. 既存の `aiworker.model_public_registry` / `aiworker.model_identity_spec` / `aiworker.worker_model_catalog` 等に、公開型番とruntime codeの対応正本を置けるか。
2. 既存テーブルを使う場合、破壊的UPDATEなしで add-only にできるか。
3. 既存に適切な正本がない場合、新規 `model_code_alias_resolver` 相当を作るべきか。
4. server.js に個別aliasを残さない方針でよいか。
5. runtime material fetch は resolver で公開型番へ解決してから view を読む設計でよいか。

## 禁止

- 既存コード値の破壊的UPDATE
- server.js内の機種別決め打ちalias
- AICompanyManager側での補正

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

FINAL_STATUS=B6R95R3Z_R29D_MODEL_CODE_CANON_CANDIDATE_AUDIT_PASS_REVIEW_REQUIRED
NEXT=R29Eで、既存正本を使うか新規resolverをadd-only作成するかを確定する。
