# B6R95R3Z-R29E-R1 Robot Master FK Candidate Audit Report

RUN_TS=20260509_112544
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_112544_b6r95r3z_r29e_r1_robot_master_fk_candidate_audit

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Files
- SQL_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_112544_b6r95r3z_r29e_r1_robot_master_fk_candidate_audit/100_robot_master_fk_candidate_audit.sql
- SQL_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_112544_b6r95r3z_r29e_r1_robot_master_fk_candidate_audit/110_robot_master_fk_candidate_audit.log
- SUMMARY_MD=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_112544_b6r95r3z_r29e_r1_robot_master_fk_candidate_audit/120_R29E_R1_ROBOT_MASTER_FK_CANDIDATE_SUMMARY.md
- DESIGN_DOC=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_112544_b6r95r3z_r29e_r1_robot_master_fk_candidate_audit/130_ROBOT_MODEL_IDENTIFIER_CANON_DESIGN.md
- NOT_EXECUTED_SQL=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_112544_b6r95r3z_r29e_r1_robot_master_fk_candidate_audit/200_NOT_EXECUTED_r29f_robot_model_identifier_fk_draft.sql
- SATO_REVIEW_DOC=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_112544_b6r95r3z_r29e_r1_robot_master_fk_candidate_audit/300_R29F_SATO_REVIEW_CHECKLIST.md

## Summary
# B6R95R3Z-R29E-R1 Robot Master FK Candidate Summary

## Policy
- resolverを自由入力にしない。
- canonical_public_model_code はロボットマスタ実テーブルの型番に参照制約をかける。
- viewにはFKを張れないので、参照先は実テーブルに限定する。
- input_model_code はaliasなので、直接マスタFKではなく identifier canon 側で管理する。

## FK target fitness
```
15: 02_candidate_columns | aiworker     | model_identity_spec            | model_code, series_prefix_code, style_no, presentation_gender_code, version_no, enabled, created_at, updated_at
16: 02_candidate_columns | aiworker     | model_public_registry          | registry_code, manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, model_category_code, public_summary_ja, capability_summary_ja, personality_summary_ja, safety_note_ja, public_traits_jsonb, recommended_usage_jsonb, source_layer_code, public_display_allowed_flag, app_reference_allowed_flag, status_code, sort_order, created_at, updated_at
20: 02_candidate_columns | aiworker     | robot_model_capability_profile | model_capability_id, manufacturer_code, series_code, model_code, model_no, axis_code, value_code, public_label_ja, public_summary_ja, internal_note_ja, public_display_allowed_flag, status_code, sort_order, created_at, updated_at
21: 02_candidate_columns | aiworker     | worker_model_catalog           | model_code, manufacturer_code, series_code, role_class_code, model_no, machine_name, machine_name_ja, product_name, product_name_ja, model_summary, enabled, sort_order, created_at, updated_at
30: 03_unique_or_pk | aiworker     | model_identity_spec            | model_identity_spec_pkey                                        | t            | t           | model_code
31: 03_unique_or_pk | aiworker     | model_public_registry          | model_public_registry_pkey                                      | t            | t           | registry_code
32: 03_unique_or_pk | aiworker     | model_public_registry          | model_public_registry_manufacturer_code_series_code_model_c_key | f            | t           | manufacturer_code, series_code, model_code
37: 03_unique_or_pk | aiworker     | robot_model_capability_profile | robot_model_capability_profile_pkey                             | t            | t           | model_capability_id
38: 03_unique_or_pk | aiworker     | robot_model_capability_profile | robot_model_capability_profile_model_code_axis_code_key         | f            | t           | model_code, axis_code
39: 03_unique_or_pk | aiworker     | worker_model_catalog           | worker_model_catalog_pkey                                       | t            | t           | model_code
53: 04_model_public_registry_byd | {"model_no": "BYD2-001", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_001_asic_leader1", "model_name": "ASIC Leader1", "sort_order": 3110, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader1", "registry_code": "asic_byd2_001", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "基本進行・形式チェックレベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "1.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "タスク分解、進行確認、形式チェックを行う。", "personality_summary_ja": "", "recommended_usage_jsonb": ["小規模作業", "単純なWorker成果物確認", "形式チェック中心のレビュー"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
54: 04_model_public_registry_byd | {"model_no": "BYD2-002", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_002_asic_leader2", "model_name": "ASIC Leader2", "sort_order": 3120, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader2", "registry_code": "asic_byd2_002", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "品質レビュー・整合性確認レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "2.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "成果物の品質、差し戻し、整合性確認を強化する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["提案書", "調査資料", "要約", "ヘルプデスク回答", "複数Worker成果物の確認"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
55: 04_model_public_registry_byd | {"model_no": "BYD2-003", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_003_asic_leader3", "model_name": "ASIC Leader3", "sort_order": 3130, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader3", "registry_code": "asic_byd2_003", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "統合設計・リスク判断・納品品質統括レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "3.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "複雑案件を構造化し、統合設計、リスク判断、納品品質を統括する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["事業計画", "PG開発方針", "複数分野横断資料", "大きめのプロジェクト", "納品前統合判断"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
64: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-001", "axis_code": "coordination", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_001_asic_leader1", "sort_order": 311001, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "medium_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "基本進行連携", "internal_note_ja": "Leader1は基本進行。", "manufacturer_code": "asic", "public_summary_ja": "基本的なタスク分解と進行連携に強い。", "model_capability_id": "b3110000-0000-0000-0000-000000000001", "public_display_allowed_flag": true}
65: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-001", "axis_code": "review_depth", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_001_asic_leader1", "sort_order": 311002, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "medium", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "形式チェック", "internal_note_ja": "Leader1は形式チェック中心。", "manufacturer_code": "asic", "public_summary_ja": "形式確認と基本レビューに向く。", "model_capability_id": "b3110000-0000-0000-0000-000000000002", "public_display_allowed_flag": true}
66: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-002", "axis_code": "review_depth", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_002_asic_leader2", "sort_order": 312001, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "very_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "高精度レビュー", "internal_note_ja": "Leader2はレビュー特化。", "manufacturer_code": "asic", "public_summary_ja": "品質レビュー、差し戻し、整合性確認に強い。", "model_capability_id": "b3120000-0000-0000-0000-000000000001", "public_display_allowed_flag": true}
67: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-002", "axis_code": "precision", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_002_asic_leader2", "sort_order": 312002, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "品質確認精度 高", "internal_note_ja": "Leader2は品質確認に強い。", "manufacturer_code": "asic", "public_summary_ja": "成果物の矛盾や不足を見つけやすい。", "model_capability_id": "b3120000-0000-0000-0000-000000000002", "public_display_allowed_flag": true}
68: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-003", "axis_code": "coordination", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_003_asic_leader3", "sort_order": 313001, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "very_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "統合連携 非常に高い", "internal_note_ja": "Leader3は統合設計型。", "manufacturer_code": "asic", "public_summary_ja": "複雑案件で複数成果物を統合しやすい。", "model_capability_id": "b3130000-0000-0000-0000-000000000001", "public_display_allowed_flag": true}
69: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-003", "axis_code": "review_depth", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_003_asic_leader3", "sort_order": 313002, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "very_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "納品品質統括", "internal_note_ja": "Leader3は納品品質統括。", "manufacturer_code": "asic", "public_summary_ja": "納品品質、リスク、整合性を統合判断する。", "model_capability_id": "b3130000-0000-0000-0000-000000000002", "public_display_allowed_flag": true}
70: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-003", "axis_code": "creativity", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_003_asic_leader3", "sort_order": 313003, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "統合設計発想", "internal_note_ja": "Leader3は統合設計の発想力も高い。", "manufacturer_code": "asic", "public_summary_ja": "複雑案件の構造化と代替案提示に強い。", "model_capability_id": "b3130000-0000-0000-0000-000000000003", "public_display_allowed_flag": true}
78: 05_fk_target_fitness | aiworker     | model_identity_spec            |              1 |            0 |                     0 |                      0 |                       0 |               0 | model_code                                                 | POSSIBLE_MODEL_CODE_FK_TARGET
79: 05_fk_target_fitness | aiworker     | model_public_registry          |              1 |            1 |                     0 |                      0 |                       0 |               0 | manufacturer_code, series_code, model_code / registry_code | NOT_FK_READY_OR_NEEDS_REVIEW
80: 05_fk_target_fitness | aiworker     | president_model_catalog        |              1 |            1 |                     0 |                      0 |                       0 |               0 | president_model_code / president_model_id                  | NOT_FK_READY_OR_NEEDS_REVIEW
81: 05_fk_target_fitness | aiworker     | robot_model_capability_profile |              1 |            1 |                     0 |                      0 |                       0 |               0 | model_capability_id / model_code, axis_code                | NOT_FK_READY_OR_NEEDS_REVIEW
82: 05_fk_target_fitness | aiworker     | worker_model_catalog           |              1 |            1 |                     0 |                      0 |                       0 |               0 | model_code                                                 | POSSIBLE_MODEL_CODE_FK_TARGET
83: 05_fk_target_fitness | aiworker     | worker_model_extension_catalog |              1 |            1 |                     0 |                      0 |                       0 |               0 | model_code / model_no                                      | POSSIBLE_MODEL_CODE_FK_TARGET
96: 06_worker_model_catalog_join_byd2003 |           0
101: 06_model_public_registry_join_byd2003 |           1
106: 06_model_identity_spec_join_byd2003 |           0
```

## Unique / PK candidates
```
15: 02_candidate_columns | aiworker     | model_identity_spec            | model_code, series_prefix_code, style_no, presentation_gender_code, version_no, enabled, created_at, updated_at
16: 02_candidate_columns | aiworker     | model_public_registry          | registry_code, manufacturer_code, manufacturer_name, manufacturer_name_ja, series_code, series_name, series_name_ja, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, model_category_code, public_summary_ja, capability_summary_ja, personality_summary_ja, safety_note_ja, public_traits_jsonb, recommended_usage_jsonb, source_layer_code, public_display_allowed_flag, app_reference_allowed_flag, status_code, sort_order, created_at, updated_at
17: 02_candidate_columns | aiworker     | model_service_assignment       | model_code, service_code, enabled, notes, created_at, updated_at
18: 02_candidate_columns | aiworker     | model_style_assignment         | model_code, style_code, is_default, enabled, created_at, updated_at
19: 02_candidate_columns | aiworker     | president_model_catalog        | president_model_id, president_model_code, president_model_name, president_model_name_ja, manufacturer_code, series_code, model_selector_text, authority_role_code, supported_operation_modes_jsonb, executive_scope_jsonb, management_standard_family_code, default_governance_posture_code, catalog_status_code, runtime_status_code, external_execution_allowed_flag, auto_manager_distribution_allowed_flag, note, created_at, updated_at, model_no, model_code, role_class_code, machine_name, machine_name_ja, product_name, product_name_ja, model_generation_code
20: 02_candidate_columns | aiworker     | robot_model_capability_profile | model_capability_id, manufacturer_code, series_code, model_code, model_no, axis_code, value_code, public_label_ja, public_summary_ja, internal_note_ja, public_display_allowed_flag, status_code, sort_order, created_at, updated_at
21: 02_candidate_columns | aiworker     | worker_model_catalog           | model_code, manufacturer_code, series_code, role_class_code, model_no, machine_name, machine_name_ja, product_name, product_name_ja, model_summary, enabled, sort_order, created_at, updated_at
22: 02_candidate_columns | aiworker     | worker_model_extension_catalog | manufacturer_code, series_code, model_code, model_no, model_name, model_name_ja, role_layer_code, role_layer_name_ja, capability_summary, max_managed_worker_count, task_complexity_code, single_task_allowed_flag, repetitive_task_allowed_flag, complex_task_allowed_flag, status_code, sort_order, created_at, updated_at
26:03 UNIQUE / PRIMARY KEY CANDIDATES
28:     section     | table_schema |           table_name           |                           index_name                            | indisprimary | indisunique |               index_columns                
30: 03_unique_or_pk | aiworker     | model_identity_spec            | model_identity_spec_pkey                                        | t            | t           | model_code
31: 03_unique_or_pk | aiworker     | model_public_registry          | model_public_registry_pkey                                      | t            | t           | registry_code
32: 03_unique_or_pk | aiworker     | model_public_registry          | model_public_registry_manufacturer_code_series_code_model_c_key | f            | t           | manufacturer_code, series_code, model_code
33: 03_unique_or_pk | aiworker     | model_service_assignment       | model_service_assignment_pkey                                   | t            | t           | model_code, service_code
34: 03_unique_or_pk | aiworker     | model_style_assignment         | model_style_assignment_pkey                                     | t            | t           | model_code
35: 03_unique_or_pk | aiworker     | president_model_catalog        | president_model_catalog_pkey                                    | t            | t           | president_model_id
36: 03_unique_or_pk | aiworker     | president_model_catalog        | president_model_catalog_president_model_code_key                | f            | t           | president_model_code
37: 03_unique_or_pk | aiworker     | robot_model_capability_profile | robot_model_capability_profile_pkey                             | t            | t           | model_capability_id
38: 03_unique_or_pk | aiworker     | robot_model_capability_profile | robot_model_capability_profile_model_code_axis_code_key         | f            | t           | model_code, axis_code
39: 03_unique_or_pk | aiworker     | worker_model_catalog           | worker_model_catalog_pkey                                       | t            | t           | model_code
40: 03_unique_or_pk | aiworker     | worker_model_extension_catalog | worker_model_extension_catalog_pkey                             | t            | t           | model_code
41: 03_unique_or_pk | aiworker     | worker_model_extension_catalog | worker_model_extension_catalog_model_no_key                     | f            | t           | model_no
53: 04_model_public_registry_byd | {"model_no": "BYD2-001", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_001_asic_leader1", "model_name": "ASIC Leader1", "sort_order": 3110, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader1", "registry_code": "asic_byd2_001", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "基本進行・形式チェックレベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "1.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "タスク分解、進行確認、形式チェックを行う。", "personality_summary_ja": "", "recommended_usage_jsonb": ["小規模作業", "単純なWorker成果物確認", "形式チェック中心のレビュー"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
54: 04_model_public_registry_byd | {"model_no": "BYD2-002", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_002_asic_leader2", "model_name": "ASIC Leader2", "sort_order": 3120, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader2", "registry_code": "asic_byd2_002", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "品質レビュー・整合性確認レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "2.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "成果物の品質、差し戻し、整合性確認を強化する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["提案書", "調査資料", "要約", "ヘルプデスク回答", "複数Worker成果物の確認"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
55: 04_model_public_registry_byd | {"model_no": "BYD2-003", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_003_asic_leader3", "model_name": "ASIC Leader3", "sort_order": 3130, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader3", "registry_code": "asic_byd2_003", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "統合設計・リスク判断・納品品質統括レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "3.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "複雑案件を構造化し、統合設計、リスク判断、納品品質を統括する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["事業計画", "PG開発方針", "複数分野横断資料", "大きめのプロジェクト", "納品前統合判断"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
64: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-001", "axis_code": "coordination", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_001_asic_leader1", "sort_order": 311001, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "medium_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "基本進行連携", "internal_note_ja": "Leader1は基本進行。", "manufacturer_code": "asic", "public_summary_ja": "基本的なタスク分解と進行連携に強い。", "model_capability_id": "b3110000-0000-0000-0000-000000000001", "public_display_allowed_flag": true}
65: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-001", "axis_code": "review_depth", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_001_asic_leader1", "sort_order": 311002, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "medium", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "形式チェック", "internal_note_ja": "Leader1は形式チェック中心。", "manufacturer_code": "asic", "public_summary_ja": "形式確認と基本レビューに向く。", "model_capability_id": "b3110000-0000-0000-0000-000000000002", "public_display_allowed_flag": true}
66: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-002", "axis_code": "review_depth", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_002_asic_leader2", "sort_order": 312001, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "very_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "高精度レビュー", "internal_note_ja": "Leader2はレビュー特化。", "manufacturer_code": "asic", "public_summary_ja": "品質レビュー、差し戻し、整合性確認に強い。", "model_capability_id": "b3120000-0000-0000-0000-000000000001", "public_display_allowed_flag": true}
67: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-002", "axis_code": "precision", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_002_asic_leader2", "sort_order": 312002, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "品質確認精度 高", "internal_note_ja": "Leader2は品質確認に強い。", "manufacturer_code": "asic", "public_summary_ja": "成果物の矛盾や不足を見つけやすい。", "model_capability_id": "b3120000-0000-0000-0000-000000000002", "public_display_allowed_flag": true}
68: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-003", "axis_code": "coordination", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_003_asic_leader3", "sort_order": 313001, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "very_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "統合連携 非常に高い", "internal_note_ja": "Leader3は統合設計型。", "manufacturer_code": "asic", "public_summary_ja": "複雑案件で複数成果物を統合しやすい。", "model_capability_id": "b3130000-0000-0000-0000-000000000001", "public_display_allowed_flag": true}
69: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-003", "axis_code": "review_depth", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_003_asic_leader3", "sort_order": 313002, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "very_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "納品品質統括", "internal_note_ja": "Leader3は納品品質統括。", "manufacturer_code": "asic", "public_summary_ja": "納品品質、リスク、整合性を統合判断する。", "model_capability_id": "b3130000-0000-0000-0000-000000000002", "public_display_allowed_flag": true}
70: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-003", "axis_code": "creativity", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_003_asic_leader3", "sort_order": 313003, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "統合設計発想", "internal_note_ja": "Leader3は統合設計の発想力も高い。", "manufacturer_code": "asic", "public_summary_ja": "複雑案件の構造化と代替案提示に強い。", "model_capability_id": "b3130000-0000-0000-0000-000000000003", "public_display_allowed_flag": true}
76:       section        | table_schema |           table_name           | has_model_code | has_model_no | has_public_model_code | has_runtime_model_code | has_aiworker_model_code | has_active_flag |                       unique_columns                       |          fk_fitness           
78: 05_fk_target_fitness | aiworker     | model_identity_spec            |              1 |            0 |                     0 |                      0 |                       0 |               0 | model_code                                                 | POSSIBLE_MODEL_CODE_FK_TARGET
79: 05_fk_target_fitness | aiworker     | model_public_registry          |              1 |            1 |                     0 |                      0 |                       0 |               0 | manufacturer_code, series_code, model_code / registry_code | NOT_FK_READY_OR_NEEDS_REVIEW
80: 05_fk_target_fitness | aiworker     | president_model_catalog        |              1 |            1 |                     0 |                      0 |                       0 |               0 | president_model_code / president_model_id                  | NOT_FK_READY_OR_NEEDS_REVIEW
81: 05_fk_target_fitness | aiworker     | robot_model_capability_profile |              1 |            1 |                     0 |                      0 |                       0 |               0 | model_capability_id / model_code, axis_code                | NOT_FK_READY_OR_NEEDS_REVIEW
82: 05_fk_target_fitness | aiworker     | worker_model_catalog           |              1 |            1 |                     0 |                      0 |                       0 |               0 | model_code                                                 | POSSIBLE_MODEL_CODE_FK_TARGET
83: 05_fk_target_fitness | aiworker     | worker_model_extension_catalog |              1 |            1 |                     0 |                      0 |                       0 |               0 | model_code / model_no                                      | POSSIBLE_MODEL_CODE_FK_TARGET
89:       section        | model_code | material_rows 
96: 06_worker_model_catalog_join_byd2003 |           0
101: 06_model_public_registry_join_byd2003 |           1
106: 06_model_identity_spec_join_byd2003 |           0
114: 07_decision_hint | Use an FK-backed identifier canon. canonical_public_model_code should reference the chosen robot master real table, not a view. input aliases should reference identifier canon, not free text.
```

## BYD samples
```
53: 04_model_public_registry_byd | {"model_no": "BYD2-001", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_001_asic_leader1", "model_name": "ASIC Leader1", "sort_order": 3110, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader1", "registry_code": "asic_byd2_001", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "基本進行・形式チェックレベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "1.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "タスク分解、進行確認、形式チェックを行う。", "personality_summary_ja": "", "recommended_usage_jsonb": ["小規模作業", "単純なWorker成果物確認", "形式チェック中心のレビュー"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
54: 04_model_public_registry_byd | {"model_no": "BYD2-002", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_002_asic_leader2", "model_name": "ASIC Leader2", "sort_order": 3120, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader2", "registry_code": "asic_byd2_002", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "品質レビュー・整合性確認レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "2.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "成果物の品質、差し戻し、整合性確認を強化する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["提案書", "調査資料", "要約", "ヘルプデスク回答", "複数Worker成果物の確認"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
55: 04_model_public_registry_byd | {"model_no": "BYD2-003", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_003_asic_leader3", "model_name": "ASIC Leader3", "sort_order": 3130, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader3", "registry_code": "asic_byd2_003", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "統合設計・リスク判断・納品品質統括レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "3.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "複雑案件を構造化し、統合設計、リスク判断、納品品質を統括する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["事業計画", "PG開発方針", "複数分野横断資料", "大きめのプロジェクト", "納品前統合判断"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
64: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-001", "axis_code": "coordination", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_001_asic_leader1", "sort_order": 311001, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "medium_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "基本進行連携", "internal_note_ja": "Leader1は基本進行。", "manufacturer_code": "asic", "public_summary_ja": "基本的なタスク分解と進行連携に強い。", "model_capability_id": "b3110000-0000-0000-0000-000000000001", "public_display_allowed_flag": true}
65: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-001", "axis_code": "review_depth", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_001_asic_leader1", "sort_order": 311002, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "medium", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "形式チェック", "internal_note_ja": "Leader1は形式チェック中心。", "manufacturer_code": "asic", "public_summary_ja": "形式確認と基本レビューに向く。", "model_capability_id": "b3110000-0000-0000-0000-000000000002", "public_display_allowed_flag": true}
66: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-002", "axis_code": "review_depth", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_002_asic_leader2", "sort_order": 312001, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "very_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "高精度レビュー", "internal_note_ja": "Leader2はレビュー特化。", "manufacturer_code": "asic", "public_summary_ja": "品質レビュー、差し戻し、整合性確認に強い。", "model_capability_id": "b3120000-0000-0000-0000-000000000001", "public_display_allowed_flag": true}
67: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-002", "axis_code": "precision", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_002_asic_leader2", "sort_order": 312002, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "品質確認精度 高", "internal_note_ja": "Leader2は品質確認に強い。", "manufacturer_code": "asic", "public_summary_ja": "成果物の矛盾や不足を見つけやすい。", "model_capability_id": "b3120000-0000-0000-0000-000000000002", "public_display_allowed_flag": true}
68: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-003", "axis_code": "coordination", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_003_asic_leader3", "sort_order": 313001, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "very_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "統合連携 非常に高い", "internal_note_ja": "Leader3は統合設計型。", "manufacturer_code": "asic", "public_summary_ja": "複雑案件で複数成果物を統合しやすい。", "model_capability_id": "b3130000-0000-0000-0000-000000000001", "public_display_allowed_flag": true}
69: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-003", "axis_code": "review_depth", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_003_asic_leader3", "sort_order": 313002, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "very_high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "納品品質統括", "internal_note_ja": "Leader3は納品品質統括。", "manufacturer_code": "asic", "public_summary_ja": "納品品質、リスク、整合性を統合判断する。", "model_capability_id": "b3130000-0000-0000-0000-000000000002", "public_display_allowed_flag": true}
70: 04_robot_model_capability_profile_byd | {"model_no": "BYD2-003", "axis_code": "creativity", "created_at": "2026-04-28T02:34:31.354446+00:00", "model_code": "byd2_003_asic_leader3", "sort_order": 313003, "updated_at": "2026-04-28T02:34:31.354446+00:00", "value_code": "high", "series_code": "beyond_series", "status_code": "active", "public_label_ja": "統合設計発想", "internal_note_ja": "Leader3は統合設計の発想力も高い。", "manufacturer_code": "asic", "public_summary_ja": "複雑案件の構造化と代替案提示に強い。", "model_capability_id": "b3130000-0000-0000-0000-000000000003", "public_display_allowed_flag": true}
87:06 MATERIAL VS MASTER BYD2-003 JOIN CHECK
91: 06_material_byd_rows | BYD2-003   |          1070
96: 06_worker_model_catalog_join_byd2003 |           0
101: 06_model_public_registry_join_byd2003 |           1
106: 06_model_identity_spec_join_byd2003 |           0
```

## Design
# Robot Model Identifier Canon Design

## 結論

model code resolver は自由入力の対応表にしない。
ロボットマスタに存在する型番だけ canonical として登録できるよう、参照制約をかける。

## 推奨構成

### 1. robot master

既存のロボットマスタ実テーブルをFK先にする。
候補:

- aiworker.worker_model_catalog
- aiworker.model_public_registry
- aiworker.model_identity_spec
- aiworker.robot_model_capability_profile

viewにはFKを張れないため、`vw_...` はFK先にしない。

### 2. robot_model_identifier_canon

公開型番、runtime型番、旧コード、aliasなどを「許可済み識別子」として持つ。

- identifier_code
- identifier_kind_code
- canonical_public_model_code
- canonical_runtime_model_code
- series_code
- active_flag

### 3. model_code_resolver

実際の解決は identifier canon を読む。
server.js は決め打ちaliasを持たず、DBをread-only参照して public model code を得る。

## FK方針

- canonical_public_model_code は、ロボットマスタの public型番列または model_code列へFK
- identifier_code は unique
- resolver入力は identifier_code として管理する
- 存在しない型番は登録不可

## 注意

FK先にする列は unique または primary key が必要。
もし既存ロボットマスタに `BYD2-003` を一意に持つ列がない場合は、先にマスタ側の正規型番列/unique制約を設計する。

## Not executed SQL draft
```sql
-- ============================================================
-- NOT EXECUTED
-- R29F draft: FK-backed robot model identifier canon
-- Requires Sato(DB担当) review.
-- ============================================================

-- IMPORTANT:
-- This is a template draft.
-- Replace __ROBOT_MASTER_TABLE__ and __ROBOT_MASTER_PUBLIC_CODE_COLUMN__
-- after R29E-R1 audit confirms the correct robot master real table and unique column.

-- Example target:
--   __ROBOT_MASTER_TABLE__ = aiworker.worker_model_catalog
--   __ROBOT_MASTER_PUBLIC_CODE_COLUMN__ = model_code
--
-- Do not execute until target is confirmed.

-- BEGIN;

-- CREATE TABLE IF NOT EXISTS aiworker.robot_model_identifier_canon (
--   identifier_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   identifier_code text NOT NULL,
--   identifier_kind_code text NOT NULL,
--   canonical_public_model_code text NOT NULL,
--   canonical_runtime_model_code text,
--   series_code text,
--   model_family_code text,
--   active_flag boolean NOT NULL DEFAULT true,
--   source_basis_ja text NOT NULL DEFAULT '',
--   note_ja text NOT NULL DEFAULT '',
--   created_at timestamptz NOT NULL DEFAULT now(),
--   updated_at timestamptz NOT NULL DEFAULT now(),
--   CONSTRAINT robot_model_identifier_canon_identifier_not_blank CHECK (btrim(identifier_code) <> ''),
--   CONSTRAINT robot_model_identifier_canon_kind_not_blank CHECK (btrim(identifier_kind_code) <> ''),
--   CONSTRAINT robot_model_identifier_canon_public_not_blank CHECK (btrim(canonical_public_model_code) <> ''),
--
--   -- FK target must be a real table with unique/primary key on the target column.
--   CONSTRAINT fk_robot_model_identifier_public_model
--     FOREIGN KEY (canonical_public_model_code)
--     REFERENCES __ROBOT_MASTER_TABLE__ (__ROBOT_MASTER_PUBLIC_CODE_COLUMN__)
-- );

-- CREATE UNIQUE INDEX IF NOT EXISTS ux_robot_model_identifier_canon_identifier_active
-- ON aiworker.robot_model_identifier_canon (identifier_code)
-- WHERE active_flag = true;

-- CREATE INDEX IF NOT EXISTS ix_robot_model_identifier_canon_public
-- ON aiworker.robot_model_identifier_canon (canonical_public_model_code);

-- CREATE INDEX IF NOT EXISTS ix_robot_model_identifier_canon_runtime
-- ON aiworker.robot_model_identifier_canon (canonical_runtime_model_code);

-- CREATE OR REPLACE VIEW aiworker.vw_robot_model_identifier_canon_v1 AS
-- SELECT
--   identifier_code,
--   identifier_kind_code,
--   canonical_public_model_code,
--   canonical_runtime_model_code,
--   series_code,
--   model_family_code,
--   active_flag,
--   source_basis_ja,
--   note_ja,
--   created_at,
--   updated_at
-- FROM aiworker.robot_model_identifier_canon
-- WHERE active_flag = true;

-- INSERT INTO aiworker.robot_model_identifier_canon (
--   identifier_code,
--   identifier_kind_code,
--   canonical_public_model_code,
--   canonical_runtime_model_code,
--   series_code,
--   model_family_code,
--   source_basis_ja,
--   note_ja
-- ) VALUES
-- (
--   'BYD2-003',
--   'public_model_code',
--   'BYD2-003',
--   'byd2_003_asic_leader3',
--   'Beyond',
--   'BYD2',
--   'CX runtime material view uses BYD2-003 as readable material model_code.',
--   'Public model code self identifier.'
-- ),
-- (
--   'byd2_003_asic_leader3',
--   'runtime_model_code',
--   'BYD2-003',
--   'byd2_003_asic_leader3',
--   'Beyond',
--   'BYD2',
--   'Runtime request/control code maps to public model code used by CX runtime material.',
--   'Runtime/internal model identifier.'
-- )
-- ON CONFLICT DO NOTHING;

-- COMMIT;
```

## Sato review
# R29F 佐藤レビュー チェックリスト

## レビュー対象

- ロボットマスタ実テーブル
- 型番列
- unique / primary key
- FK付き `robot_model_identifier_canon` 設計

## 判断すること

1. FK先にするロボットマスタ実テーブルはどれか。
2. FK先の型番列は public model code として正しいか。
3. その列に unique または primary key があるか。
4. なければ、既存テーブルにunique制約を追加すべきか、新規マスタ/identifier canonを作るべきか。
5. `BYD2-003` と `byd2_003_asic_leader3` の対応を seed として入れてよいか。
6. 今後HD/MEGAMI/LoVerSにも同じ設計を広げられるか。

## 禁止

- 既存値の破壊的UPDATE
- DELETE
- server.jsの機種別決め打ちalias
- AICM側での補正
- viewへのFK想定

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

FINAL_STATUS=B6R95R3Z_R29E_R1_ROBOT_MASTER_FK_CANDIDATE_AUDIT_PASS_REVIEW_REQUIRED
NEXT=FK先ロボットマスタ実テーブルと型番列を確定し、R29E-R2で実行可能SQLへ落とす。
