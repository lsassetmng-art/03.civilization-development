# B6R95R3Z-R28-R1 Material Fetch Zero Diagnosis Report

RUN_TS=20260509_074341
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_074341_b6r95r3z_r28_r1_material_fetch_zero_diagnosis_format_compat

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Summary
# B6R95R3Z-R28-R1 Material Fetch Zero Diagnosis Summary

## DB execution
```
DB_EXIT=0
```

## Server helper audit
```
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js

456:  const modelCode = aiwB6R95R3R3OneLine(payload.model_code, "unknown_model");
465:    model_code: modelCode,
478:    robot_trait_basis: "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
527:    `- model_code: ${modelCode}`,
638:/* B6R95R3Z_R24_CX_MATERIAL_BODY_GENERATION_PATCH_START */
720:    "model_code",
721:    "robot_model_code",
722:    "selected_robot_model_code",
723:    "runtime_model_code"
805:function aiwB6R95R3Z24FetchCxRuntimeMaterials(payload) {
808:  const termConds = terms
814:    "aiworker.vw_robot_readable_brain_runtime_material_v3",
815:    "aiworker.vw_robot_readable_brain_runtime_material_v2",
816:    "aiworker.vw_robot_readable_brain_runtime_material_v1",
822:      "BEGIN READ ONLY;",
826:      "  WHERE t.model_code = " + aiwB6R95R3Z24SqlLiteral(modelCode),
827:      "    AND (" + termConds + ")",
831:      "COMMIT;",
832:      "/* B6R95R3Z_R26_READONLY_HELPER_REPAIR */"
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
1500:          model_code: modelCode,
```

## DB key lines
```
26: 03_material_view_columns | vw_robot_brain_runtime_material_quality_overlay_v1 | profile_source_type, model_code, series_code, role_code, brain_data_code, brain_domain_code, brain_domain_label_ja, depth_code, data_depth_level, risk_class_code, granularity_code, effective_use_purpose_codes, access_decision_code, source_exists_flag, unit_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, tags, material_source_kind, source_kind_score, full_load_priority, domain_priority_score, risk_base_score, depth_score, canon_status, reference_tier, verification_status, source_basis_codes, source_caution_ja, robot_use_summary_ja, misconception_guard_ja, lightweight_allowed_flag, deep_reference_allowed_flag, verified_canon_priority
27: 03_material_view_columns | vw_robot_readable_brain_runtime_material_v1        | profile_source_type, model_code, series_code, role_code, brain_data_code, brain_domain_code, brain_domain_label_ja, depth_code, data_depth_level, risk_class_code, granularity_code, effective_use_purpose_codes, access_decision_code, source_exists_flag, unit_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, tags
28: 03_material_view_columns | vw_robot_readable_brain_runtime_material_v2        | profile_source_type, model_code, series_code, role_code, brain_data_code, brain_domain_code, brain_domain_label_ja, depth_code, data_depth_level, risk_class_code, granularity_code, effective_use_purpose_codes, access_decision_code, source_exists_flag, unit_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, tags
29: 03_material_view_columns | vw_robot_readable_brain_runtime_material_v3        | profile_source_type, model_code, series_code, role_code, brain_data_code, brain_domain_code, brain_domain_label_ja, depth_code, data_depth_level, risk_class_code, granularity_code, effective_use_purpose_codes, access_decision_code, source_exists_flag, unit_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, tags
35:          section          |                     view_name                      | total_rows | exact_normalized_model_rows | exact_public_model_rows | fuzzy_byd2003_rows 
37: 04_model_code_exact_count | vw_robot_brain_runtime_material_quality_overlay_v1 |       8104 |                           0 |                    1070 |               1070
40:          section          |                  view_name                  | total_rows | exact_normalized_model_rows | exact_public_model_rows | fuzzy_byd2003_rows 
42: 04_model_code_exact_count | vw_robot_readable_brain_runtime_material_v1 |       7242 |                           0 |                     981 |                981
45:          section          |                  view_name                  | total_rows | exact_normalized_model_rows | exact_public_model_rows | fuzzy_byd2003_rows 
47: 04_model_code_exact_count | vw_robot_readable_brain_runtime_material_v2 |       8028 |                           0 |                    1058 |               1058
50:          section          |                  view_name                  | total_rows | exact_normalized_model_rows | exact_public_model_rows | fuzzy_byd2003_rows 
52: 04_model_code_exact_count | vw_robot_readable_brain_runtime_material_v3 |       8104 |                           0 |                    1070 |               1070
58:           section           |                     view_name                      | taika_total_rows | taika_normalized_model_rows | taika_public_model_rows | taika_fuzzy_byd2003_rows 
60: 05_taika_term_count_by_view | vw_robot_brain_runtime_material_quality_overlay_v1 |              537 |                           0 |                      54 |                       54
63:           section           |                  view_name                  | taika_total_rows | taika_normalized_model_rows | taika_public_model_rows | taika_fuzzy_byd2003_rows 
65: 05_taika_term_count_by_view | vw_robot_readable_brain_runtime_material_v1 |               24 |                           0 |                       2 |                        2
68:           section           |                  view_name                  | taika_total_rows | taika_normalized_model_rows | taika_public_model_rows | taika_fuzzy_byd2003_rows 
70: 05_taika_term_count_by_view | vw_robot_readable_brain_runtime_material_v2 |              532 |                           0 |                      53 |                       53
73:           section           |                  view_name                  | taika_total_rows | taika_normalized_model_rows | taika_public_model_rows | taika_fuzzy_byd2003_rows 
75: 05_taika_term_count_by_view | vw_robot_readable_brain_runtime_material_v3 |              537 |                           0 |                      54 |                       54
81:          section           |                     view_name                      |  model_code   | row_count 
83: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | BYD2-003      |        54
84: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R5         |        54
85: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R5P        |        54
86: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | SERIES:MEGAMI |        54
87: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | MG-NORN-001   |        53
88: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R3         |        52
89: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | MG-NORN-002   |        52
90: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | MG-NORN-003   |        52
91: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | SERIES:Beyond |        52
92: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | SERIES:HD     |        51
93: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R2         |         3
94: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R2G        |         3
95: 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R2S        |         3
98:          section           |                  view_name                  |  model_code   | row_count 
100: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | BYD2-003      |         2
101: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R2         |         2
102: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R2G        |         2
103: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R2S        |         2
104: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R5         |         2
105: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R5P        |         2
106: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | MG-NORN-001   |         2
107: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | MG-NORN-002   |         2
108: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | MG-NORN-003   |         2
109: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | SERIES:Beyond |         2
110: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | SERIES:MEGAMI |         2
111: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R3         |         1
112: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | SERIES:HD     |         1
115:          section           |                  view_name                  |  model_code   | row_count 
117: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | BYD2-003      |        53
118: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R5         |        53
119: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R5P        |        53
120: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | MG-NORN-001   |        53
121: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | SERIES:MEGAMI |        53
122: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | MG-NORN-002   |        52
123: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | MG-NORN-003   |        52
124: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | SERIES:Beyond |        52
125: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R3         |        51
126: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | SERIES:HD     |        51
127: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R2         |         3
128: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R2G        |         3
129: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R2S        |         3
132:          section           |                  view_name                  |  model_code   | row_count 
134: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | BYD2-003      |        54
135: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R5         |        54
136: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R5P        |        54
137: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | SERIES:MEGAMI |        54
138: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | MG-NORN-001   |        53
139: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R3         |        52
140: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | MG-NORN-002   |        52
141: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | MG-NORN-003   |        52
142: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | SERIES:Beyond |        52
143: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | SERIES:HD     |        51
144: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R2         |         3
145: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R2G        |         3
146: 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R2S        |         3
154: 07_byd2003_readable_sample_rows | vw_robot_brain_runtime_material_quality_overlay_v1 | {"tags": ["education", "explanation"], "role_code": "Manager", "unit_code": "edu_001_stepwise_explanation", "depth_code": "standard", "model_code": "BYD2-003", "depth_score": 300, "series_code": "Beyond", "canon_status": "legacy_seed", "unit_title_ja": "説明は段階化すると伝わりやすい", "reference_tier": "lightweight", "unit_detail_ja": "いきなり詳細に入らず、相手の現在地を推定し、小さなまとまりで説明する。", "brain_data_code": "edu_001_stepwise_explanation", "risk_base_score": 80, "risk_class_code": "low", "unit_summary_ja": "難しい内容は、前提、要点、例、確認の順で説明すると理解されやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "学習支援、業務説明、レビュー。", "brain_domain_code": "education_learning", "example_prompt_ja": "初心者向けに段階的に説明して。", "source_caution_ja": "", "source_kind_score": 400, "full_load_priority": 50, "safety_boundary_ja": "相手を見下す表現を避ける。", "source_basis_codes": ["generated_draft"], "source_exists_flag": true, "profile_source_type": "model", "verification_status": "not_reviewed", "access_decision_code": "allow_focus_domain", "material_source_kind": "base_material", "robot_use_summary_ja": "", "brain_domain_label_ja": "教育・学習", "domain_priority_score": 1150, "misconception_guard_ja": "", "verified_canon_priority": 1000, "lightweight_allowed_flag": false, "deep_reference_allowed_flag": false, "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
155: 07_byd2003_readable_sample_rows | vw_robot_brain_runtime_material_quality_overlay_v1 | {"tags": ["mistake", "review", "learning"], "role_code": "Manager", "unit_code": "edu_002_mistake_review", "depth_code": "standard", "model_code": "BYD2-003", "depth_score": 300, "series_code": "Beyond", "canon_status": "legacy_seed", "unit_title_ja": "間違いは原因別に見る", "reference_tier": "lightweight", "unit_detail_ja": "責めるより、再発防止の観点で分類する。次に使うチェック項目へ落とす。", "brain_data_code": "edu_002_mistake_review", "risk_base_score": 80, "risk_class_code": "low", "unit_summary_ja": "学習や作業のミスは、知識不足、読み違い、手順抜け、確認不足に分けると改善しやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、作業レビュー、品質改善。", "brain_domain_code": "education_learning", "example_prompt_ja": "間違えた理由を責めずに分析して。", "source_caution_ja": "", "source_kind_score": 400, "full_load_priority": 50, "safety_boundary_ja": "人格評価に使わない。", "source_basis_codes": ["generated_draft"], "source_exists_flag": true, "profile_source_type": "model", "verification_status": "not_reviewed", "access_decision_code": "allow_focus_domain", "material_source_kind": "base_material", "robot_use_summary_ja": "", "brain_domain_label_ja": "教育・学習", "domain_priority_score": 1150, "misconception_guard_ja": "", "verified_canon_priority": 1000, "lightweight_allowed_flag": false, "deep_reference_allowed_flag": false, "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
156: 07_byd2003_readable_sample_rows | vw_robot_brain_runtime_material_quality_overlay_v1 | {"tags": ["memory", "learning", "exam"], "role_code": "Manager", "unit_code": "edu_003_retrieval_practice", "depth_code": "standard", "model_code": "BYD2-003", "depth_score": 300, "series_code": "Beyond", "canon_status": "legacy_seed", "unit_title_ja": "思い出す練習は定着に効く", "reference_tier": "lightweight", "unit_detail_ja": "問題化、穴埋め、説明し直し、翌日の再確認などが使える。", "brain_data_code": "edu_003_retrieval_practice", "risk_base_score": 80, "risk_class_code": "low", "unit_summary_ja": "読むだけでなく、短く思い出す練習を挟むと記憶に残りやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験勉強、資格学習、暗記補助。", "brain_domain_code": "education_learning", "example_prompt_ja": "覚えた内容を思い出す練習に変えて。", "source_caution_ja": "", "source_kind_score": 400, "full_load_priority": 50, "safety_boundary_ja": "過度な詰め込みや不安を煽らない。", "source_basis_codes": ["generated_draft"], "source_exists_flag": true, "profile_source_type": "model", "verification_status": "not_reviewed", "access_decision_code": "allow_focus_domain", "material_source_kind": "base_material", "robot_use_summary_ja": "", "brain_domain_label_ja": "教育・学習", "domain_priority_score": 1150, "misconception_guard_ja": "", "verified_canon_priority": 1000, "lightweight_allowed_flag": false, "deep_reference_allowed_flag": false, "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
157: 07_byd2003_readable_sample_rows | vw_robot_brain_runtime_material_quality_overlay_v1 | {"tags": ["exam", "question_bank"], "role_code": "Manager", "unit_code": "exam_001_question_bank_boundary", "depth_code": "standard", "model_code": "BYD2-003", "depth_score": 300, "series_code": "Beyond", "canon_status": "legacy_seed", "unit_title_ja": "問題データと通常知識は分ける", "reference_tier": "lightweight", "unit_detail_ja": "出題文、選択肢、解説、誤答理由を別々に見て、学習者の理解確認に使う。", "brain_data_code": "exam_001_question_bank_boundary", "risk_base_score": 80, "risk_class_code": "low", "unit_summary_ja": "問題バンクは演習用データであり、通常知識の正本とは分けて扱う。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "資格学習、演習、復習。", "brain_domain_code": "exam_learning", "example_prompt_ja": "問題を解いた後の復習観点を出して。", "source_caution_ja": "", "source_kind_score": 400, "full_load_priority": 51, "safety_boundary_ja": "実試験の不正支援や漏洩利用に使わない。", "source_basis_codes": ["generated_draft"], "source_exists_flag": true, "profile_source_type": "model", "verification_status": "not_reviewed", "access_decision_code": "allow_model_policy", "material_source_kind": "base_material", "robot_use_summary_ja": "", "brain_domain_label_ja": "試験・問題", "domain_priority_score": 1149, "misconception_guard_ja": "", "verified_canon_priority": 1000, "lightweight_allowed_flag": false, "deep_reference_allowed_flag": false, "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
158: 07_byd2003_readable_sample_rows | vw_robot_brain_runtime_material_quality_overlay_v1 | {"tags": ["exam", "distractor", "review"], "role_code": "Manager", "unit_code": "exam_002_distractor_review", "depth_code": "standard", "model_code": "BYD2-003", "depth_score": 300, "series_code": "Beyond", "canon_status": "legacy_seed", "unit_title_ja": "誤答選択肢は理解の穴を映す", "reference_tier": "lightweight", "unit_detail_ja": "なぜその選択肢が魅力的に見えたか、正答との差は何かを説明する。", "brain_data_code": "exam_002_distractor_review", "risk_base_score": 80, "risk_class_code": "low", "unit_summary_ja": "誤答選択肢は単なる間違いではなく、どの概念を混同したかを見つける材料になる。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、弱点分析。", "brain_domain_code": "exam_learning", "example_prompt_ja": "間違えた選択肢から弱点を見つけて。", "source_caution_ja": "", "source_kind_score": 400, "full_load_priority": 51, "safety_boundary_ja": "合格保証や不正な試験対策には使わない。", "source_basis_codes": ["generated_draft"], "source_exists_flag": true, "profile_source_type": "model", "verification_status": "not_reviewed", "access_decision_code": "allow_model_policy", "material_source_kind": "base_material", "robot_use_summary_ja": "", "brain_domain_label_ja": "試験・問題", "domain_priority_score": 1149, "misconception_guard_ja": "", "verified_canon_priority": 1000, "lightweight_allowed_flag": false, "deep_reference_allowed_flag": false, "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
163: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v1 | {"tags": ["education", "explanation"], "role_code": "Manager", "unit_code": "edu_001_stepwise_explanation", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "説明は段階化すると伝わりやすい", "unit_detail_ja": "いきなり詳細に入らず、相手の現在地を推定し、小さなまとまりで説明する。", "brain_data_code": "edu_001_stepwise_explanation", "risk_class_code": "low", "unit_summary_ja": "難しい内容は、前提、要点、例、確認の順で説明すると理解されやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "学習支援、業務説明、レビュー。", "brain_domain_code": "education_learning", "example_prompt_ja": "初心者向けに段階的に説明して。", "safety_boundary_ja": "相手を見下す表現を避ける。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
164: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v1 | {"tags": ["mistake", "review", "learning"], "role_code": "Manager", "unit_code": "edu_002_mistake_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "間違いは原因別に見る", "unit_detail_ja": "責めるより、再発防止の観点で分類する。次に使うチェック項目へ落とす。", "brain_data_code": "edu_002_mistake_review", "risk_class_code": "low", "unit_summary_ja": "学習や作業のミスは、知識不足、読み違い、手順抜け、確認不足に分けると改善しやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、作業レビュー、品質改善。", "brain_domain_code": "education_learning", "example_prompt_ja": "間違えた理由を責めずに分析して。", "safety_boundary_ja": "人格評価に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
165: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v1 | {"tags": ["memory", "learning", "exam"], "role_code": "Manager", "unit_code": "edu_003_retrieval_practice", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "思い出す練習は定着に効く", "unit_detail_ja": "問題化、穴埋め、説明し直し、翌日の再確認などが使える。", "brain_data_code": "edu_003_retrieval_practice", "risk_class_code": "low", "unit_summary_ja": "読むだけでなく、短く思い出す練習を挟むと記憶に残りやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験勉強、資格学習、暗記補助。", "brain_domain_code": "education_learning", "example_prompt_ja": "覚えた内容を思い出す練習に変えて。", "safety_boundary_ja": "過度な詰め込みや不安を煽らない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
166: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v1 | {"tags": ["exam", "question_bank"], "role_code": "Manager", "unit_code": "exam_001_question_bank_boundary", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "問題データと通常知識は分ける", "unit_detail_ja": "出題文、選択肢、解説、誤答理由を別々に見て、学習者の理解確認に使う。", "brain_data_code": "exam_001_question_bank_boundary", "risk_class_code": "low", "unit_summary_ja": "問題バンクは演習用データであり、通常知識の正本とは分けて扱う。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "資格学習、演習、復習。", "brain_domain_code": "exam_learning", "example_prompt_ja": "問題を解いた後の復習観点を出して。", "safety_boundary_ja": "実試験の不正支援や漏洩利用に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
167: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v1 | {"tags": ["exam", "distractor", "review"], "role_code": "Manager", "unit_code": "exam_002_distractor_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "誤答選択肢は理解の穴を映す", "unit_detail_ja": "なぜその選択肢が魅力的に見えたか、正答との差は何かを説明する。", "brain_data_code": "exam_002_distractor_review", "risk_class_code": "low", "unit_summary_ja": "誤答選択肢は単なる間違いではなく、どの概念を混同したかを見つける材料になる。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、弱点分析。", "brain_domain_code": "exam_learning", "example_prompt_ja": "間違えた選択肢から弱点を見つけて。", "safety_boundary_ja": "合格保証や不正な試験対策には使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
172: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v2 | {"tags": ["education", "explanation"], "role_code": "Manager", "unit_code": "edu_001_stepwise_explanation", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "説明は段階化すると伝わりやすい", "unit_detail_ja": "いきなり詳細に入らず、相手の現在地を推定し、小さなまとまりで説明する。", "brain_data_code": "edu_001_stepwise_explanation", "risk_class_code": "low", "unit_summary_ja": "難しい内容は、前提、要点、例、確認の順で説明すると理解されやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "学習支援、業務説明、レビュー。", "brain_domain_code": "education_learning", "example_prompt_ja": "初心者向けに段階的に説明して。", "safety_boundary_ja": "相手を見下す表現を避ける。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
173: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v2 | {"tags": ["mistake", "review", "learning"], "role_code": "Manager", "unit_code": "edu_002_mistake_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "間違いは原因別に見る", "unit_detail_ja": "責めるより、再発防止の観点で分類する。次に使うチェック項目へ落とす。", "brain_data_code": "edu_002_mistake_review", "risk_class_code": "low", "unit_summary_ja": "学習や作業のミスは、知識不足、読み違い、手順抜け、確認不足に分けると改善しやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、作業レビュー、品質改善。", "brain_domain_code": "education_learning", "example_prompt_ja": "間違えた理由を責めずに分析して。", "safety_boundary_ja": "人格評価に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
174: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v2 | {"tags": ["memory", "learning", "exam"], "role_code": "Manager", "unit_code": "edu_003_retrieval_practice", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "思い出す練習は定着に効く", "unit_detail_ja": "問題化、穴埋め、説明し直し、翌日の再確認などが使える。", "brain_data_code": "edu_003_retrieval_practice", "risk_class_code": "low", "unit_summary_ja": "読むだけでなく、短く思い出す練習を挟むと記憶に残りやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験勉強、資格学習、暗記補助。", "brain_domain_code": "education_learning", "example_prompt_ja": "覚えた内容を思い出す練習に変えて。", "safety_boundary_ja": "過度な詰め込みや不安を煽らない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
175: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v2 | {"tags": ["exam", "question_bank"], "role_code": "Manager", "unit_code": "exam_001_question_bank_boundary", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "問題データと通常知識は分ける", "unit_detail_ja": "出題文、選択肢、解説、誤答理由を別々に見て、学習者の理解確認に使う。", "brain_data_code": "exam_001_question_bank_boundary", "risk_class_code": "low", "unit_summary_ja": "問題バンクは演習用データであり、通常知識の正本とは分けて扱う。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "資格学習、演習、復習。", "brain_domain_code": "exam_learning", "example_prompt_ja": "問題を解いた後の復習観点を出して。", "safety_boundary_ja": "実試験の不正支援や漏洩利用に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
176: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v2 | {"tags": ["exam", "distractor", "review"], "role_code": "Manager", "unit_code": "exam_002_distractor_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "誤答選択肢は理解の穴を映す", "unit_detail_ja": "なぜその選択肢が魅力的に見えたか、正答との差は何かを説明する。", "brain_data_code": "exam_002_distractor_review", "risk_class_code": "low", "unit_summary_ja": "誤答選択肢は単なる間違いではなく、どの概念を混同したかを見つける材料になる。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、弱点分析。", "brain_domain_code": "exam_learning", "example_prompt_ja": "間違えた選択肢から弱点を見つけて。", "safety_boundary_ja": "合格保証や不正な試験対策には使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
181: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v3 | {"tags": ["education", "explanation"], "role_code": "Manager", "unit_code": "edu_001_stepwise_explanation", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "説明は段階化すると伝わりやすい", "unit_detail_ja": "いきなり詳細に入らず、相手の現在地を推定し、小さなまとまりで説明する。", "brain_data_code": "edu_001_stepwise_explanation", "risk_class_code": "low", "unit_summary_ja": "難しい内容は、前提、要点、例、確認の順で説明すると理解されやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "学習支援、業務説明、レビュー。", "brain_domain_code": "education_learning", "example_prompt_ja": "初心者向けに段階的に説明して。", "safety_boundary_ja": "相手を見下す表現を避ける。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
182: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v3 | {"tags": ["mistake", "review", "learning"], "role_code": "Manager", "unit_code": "edu_002_mistake_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "間違いは原因別に見る", "unit_detail_ja": "責めるより、再発防止の観点で分類する。次に使うチェック項目へ落とす。", "brain_data_code": "edu_002_mistake_review", "risk_class_code": "low", "unit_summary_ja": "学習や作業のミスは、知識不足、読み違い、手順抜け、確認不足に分けると改善しやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、作業レビュー、品質改善。", "brain_domain_code": "education_learning", "example_prompt_ja": "間違えた理由を責めずに分析して。", "safety_boundary_ja": "人格評価に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
183: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v3 | {"tags": ["memory", "learning", "exam"], "role_code": "Manager", "unit_code": "edu_003_retrieval_practice", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "思い出す練習は定着に効く", "unit_detail_ja": "問題化、穴埋め、説明し直し、翌日の再確認などが使える。", "brain_data_code": "edu_003_retrieval_practice", "risk_class_code": "low", "unit_summary_ja": "読むだけでなく、短く思い出す練習を挟むと記憶に残りやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験勉強、資格学習、暗記補助。", "brain_domain_code": "education_learning", "example_prompt_ja": "覚えた内容を思い出す練習に変えて。", "safety_boundary_ja": "過度な詰め込みや不安を煽らない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
184: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v3 | {"tags": ["exam", "question_bank"], "role_code": "Manager", "unit_code": "exam_001_question_bank_boundary", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "問題データと通常知識は分ける", "unit_detail_ja": "出題文、選択肢、解説、誤答理由を別々に見て、学習者の理解確認に使う。", "brain_data_code": "exam_001_question_bank_boundary", "risk_class_code": "low", "unit_summary_ja": "問題バンクは演習用データであり、通常知識の正本とは分けて扱う。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "資格学習、演習、復習。", "brain_domain_code": "exam_learning", "example_prompt_ja": "問題を解いた後の復習観点を出して。", "safety_boundary_ja": "実試験の不正支援や漏洩利用に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
185: 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v3 | {"tags": ["exam", "distractor", "review"], "role_code": "Manager", "unit_code": "exam_002_distractor_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "誤答選択肢は理解の穴を映す", "unit_detail_ja": "なぜその選択肢が魅力的に見えたか、正答との差は何かを説明する。", "brain_data_code": "exam_002_distractor_review", "risk_class_code": "low", "unit_summary_ja": "誤答選択肢は単なる間違いではなく、どの概念を混同したかを見つける材料になる。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、弱点分析。", "brain_domain_code": "exam_learning", "example_prompt_ja": "間違えた選択肢から弱点を見つけて。", "safety_boundary_ja": "合格保証や不正な試験対策には使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
191:               section                |                     view_name                      | simulated_rows 
193: 08_exact_r24_helper_query_simulation | vw_robot_brain_runtime_material_quality_overlay_v1 |              0
196:               section                |                  view_name                  | simulated_rows 
198: 08_exact_r24_helper_query_simulation | vw_robot_readable_brain_runtime_material_v1 |              0
201:               section                |                  view_name                  | simulated_rows 
203: 08_exact_r24_helper_query_simulation | vw_robot_readable_brain_runtime_material_v2 |              0
206:               section                |                  view_name                  | simulated_rows 
208: 08_exact_r24_helper_query_simulation | vw_robot_readable_brain_runtime_material_v3 |              0
266: 10_diagnosis_hint | If section 05 has taika_total_rows > 0 but taika_normalized_model_rows = 0, patch should map model_code or remove too-strict exact model filter.
267: 10_diagnosis_hint | If section 05 has all zero, runtime views do not expose Taika material; patch should query CX material/source tables or fix view connection.
268: 10_diagnosis_hint | If section 08 has rows but runtime returned cx_material_rows_found=0, Node helper/psql execution/parsing path is failing.
269: 10_diagnosis_hint | If section 07 has rows but section 08 is zero, term search is too narrow.
```

## Auto diagnosis
```
AUTO_DIAGNOSIS=MANUAL_REVIEW_REQUIRED
```

FINAL_STATUS=B6R95R3Z_R28_R1_MATERIAL_FETCH_ZERO_DIAGNOSIS_PASS_REVIEW_REQUIRED

## Full DB log
```
SET
============================================================
01 READONLY GUARD
============================================================
      section      | transaction_read_only | default_transaction_read_only | database_name | db_user  
-------------------+-----------------------+-------------------------------+---------------+----------
 01_readonly_guard | on                    | on                            | postgres      | postgres
(1 row)

============================================================
02 MATERIAL VIEW EXISTENCE
============================================================
          section           | table_schema |                     table_name                     | table_type 
----------------------------+--------------+----------------------------------------------------+------------
 02_material_view_existence | aiworker     | vw_robot_brain_runtime_material_quality_overlay_v1 | VIEW
 02_material_view_existence | aiworker     | vw_robot_readable_brain_runtime_material_v1        | VIEW
 02_material_view_existence | aiworker     | vw_robot_readable_brain_runtime_material_v2        | VIEW
 02_material_view_existence | aiworker     | vw_robot_readable_brain_runtime_material_v3        | VIEW
(4 rows)

============================================================
03 MATERIAL VIEW COLUMNS
============================================================
         section          |                     table_name                     |                                                                                                                                                                                                                                                                                                                                                            columns                                                                                                                                                                                                                                                                                                                                                             
--------------------------+----------------------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 03_material_view_columns | vw_robot_brain_runtime_material_quality_overlay_v1 | profile_source_type, model_code, series_code, role_code, brain_data_code, brain_domain_code, brain_domain_label_ja, depth_code, data_depth_level, risk_class_code, granularity_code, effective_use_purpose_codes, access_decision_code, source_exists_flag, unit_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, tags, material_source_kind, source_kind_score, full_load_priority, domain_priority_score, risk_base_score, depth_score, canon_status, reference_tier, verification_status, source_basis_codes, source_caution_ja, robot_use_summary_ja, misconception_guard_ja, lightweight_allowed_flag, deep_reference_allowed_flag, verified_canon_priority
 03_material_view_columns | vw_robot_readable_brain_runtime_material_v1        | profile_source_type, model_code, series_code, role_code, brain_data_code, brain_domain_code, brain_domain_label_ja, depth_code, data_depth_level, risk_class_code, granularity_code, effective_use_purpose_codes, access_decision_code, source_exists_flag, unit_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, tags
 03_material_view_columns | vw_robot_readable_brain_runtime_material_v2        | profile_source_type, model_code, series_code, role_code, brain_data_code, brain_domain_code, brain_domain_label_ja, depth_code, data_depth_level, risk_class_code, granularity_code, effective_use_purpose_codes, access_decision_code, source_exists_flag, unit_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, tags
 03_material_view_columns | vw_robot_readable_brain_runtime_material_v3        | profile_source_type, model_code, series_code, role_code, brain_data_code, brain_domain_code, brain_domain_label_ja, depth_code, data_depth_level, risk_class_code, granularity_code, effective_use_purpose_codes, access_decision_code, source_exists_flag, unit_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, tags
(4 rows)

============================================================
04 MODEL CODE EXACT COUNT
============================================================
          section          |                     view_name                      | total_rows | exact_normalized_model_rows | exact_public_model_rows | fuzzy_byd2003_rows 
---------------------------+----------------------------------------------------+------------+-----------------------------+-------------------------+--------------------
 04_model_code_exact_count | vw_robot_brain_runtime_material_quality_overlay_v1 |       8104 |                           0 |                    1070 |               1070
(1 row)

          section          |                  view_name                  | total_rows | exact_normalized_model_rows | exact_public_model_rows | fuzzy_byd2003_rows 
---------------------------+---------------------------------------------+------------+-----------------------------+-------------------------+--------------------
 04_model_code_exact_count | vw_robot_readable_brain_runtime_material_v1 |       7242 |                           0 |                     981 |                981
(1 row)

          section          |                  view_name                  | total_rows | exact_normalized_model_rows | exact_public_model_rows | fuzzy_byd2003_rows 
---------------------------+---------------------------------------------+------------+-----------------------------+-------------------------+--------------------
 04_model_code_exact_count | vw_robot_readable_brain_runtime_material_v2 |       8028 |                           0 |                    1058 |               1058
(1 row)

          section          |                  view_name                  | total_rows | exact_normalized_model_rows | exact_public_model_rows | fuzzy_byd2003_rows 
---------------------------+---------------------------------------------+------------+-----------------------------+-------------------------+--------------------
 04_model_code_exact_count | vw_robot_readable_brain_runtime_material_v3 |       8104 |                           0 |                    1070 |               1070
(1 row)

============================================================
05 TAIKA TERM COUNT BY VIEW
============================================================
           section           |                     view_name                      | taika_total_rows | taika_normalized_model_rows | taika_public_model_rows | taika_fuzzy_byd2003_rows 
-----------------------------+----------------------------------------------------+------------------+-----------------------------+-------------------------+--------------------------
 05_taika_term_count_by_view | vw_robot_brain_runtime_material_quality_overlay_v1 |              537 |                           0 |                      54 |                       54
(1 row)

           section           |                  view_name                  | taika_total_rows | taika_normalized_model_rows | taika_public_model_rows | taika_fuzzy_byd2003_rows 
-----------------------------+---------------------------------------------+------------------+-----------------------------+-------------------------+--------------------------
 05_taika_term_count_by_view | vw_robot_readable_brain_runtime_material_v1 |               24 |                           0 |                       2 |                        2
(1 row)

           section           |                  view_name                  | taika_total_rows | taika_normalized_model_rows | taika_public_model_rows | taika_fuzzy_byd2003_rows 
-----------------------------+---------------------------------------------+------------------+-----------------------------+-------------------------+--------------------------
 05_taika_term_count_by_view | vw_robot_readable_brain_runtime_material_v2 |              532 |                           0 |                      53 |                       53
(1 row)

           section           |                  view_name                  | taika_total_rows | taika_normalized_model_rows | taika_public_model_rows | taika_fuzzy_byd2003_rows 
-----------------------------+---------------------------------------------+------------------+-----------------------------+-------------------------+--------------------------
 05_taika_term_count_by_view | vw_robot_readable_brain_runtime_material_v3 |              537 |                           0 |                      54 |                       54
(1 row)

============================================================
06 TAIKA MODEL CODE SAMPLE
============================================================
          section           |                     view_name                      |  model_code   | row_count 
----------------------------+----------------------------------------------------+---------------+-----------
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | BYD2-003      |        54
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R5         |        54
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R5P        |        54
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | SERIES:MEGAMI |        54
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | MG-NORN-001   |        53
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R3         |        52
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | MG-NORN-002   |        52
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | MG-NORN-003   |        52
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | SERIES:Beyond |        52
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | SERIES:HD     |        51
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R2         |         3
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R2G        |         3
 06_taika_model_code_sample | vw_robot_brain_runtime_material_quality_overlay_v1 | HD-R2S        |         3
(13 rows)

          section           |                  view_name                  |  model_code   | row_count 
----------------------------+---------------------------------------------+---------------+-----------
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | BYD2-003      |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R2         |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R2G        |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R2S        |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R5         |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R5P        |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | MG-NORN-001   |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | MG-NORN-002   |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | MG-NORN-003   |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | SERIES:Beyond |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | SERIES:MEGAMI |         2
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | HD-R3         |         1
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v1 | SERIES:HD     |         1
(13 rows)

          section           |                  view_name                  |  model_code   | row_count 
----------------------------+---------------------------------------------+---------------+-----------
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | BYD2-003      |        53
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R5         |        53
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R5P        |        53
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | MG-NORN-001   |        53
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | SERIES:MEGAMI |        53
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | MG-NORN-002   |        52
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | MG-NORN-003   |        52
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | SERIES:Beyond |        52
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R3         |        51
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | SERIES:HD     |        51
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R2         |         3
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R2G        |         3
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v2 | HD-R2S        |         3
(13 rows)

          section           |                  view_name                  |  model_code   | row_count 
----------------------------+---------------------------------------------+---------------+-----------
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | BYD2-003      |        54
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R5         |        54
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R5P        |        54
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | SERIES:MEGAMI |        54
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | MG-NORN-001   |        53
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R3         |        52
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | MG-NORN-002   |        52
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | MG-NORN-003   |        52
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | SERIES:Beyond |        52
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | SERIES:HD     |        51
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R2         |         3
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R2G        |         3
 06_taika_model_code_sample | vw_robot_readable_brain_runtime_material_v3 | HD-R2S        |         3
(13 rows)

============================================================
07 BYD2-003 READABLE SAMPLE ROWS
============================================================
             section             |                     view_name                      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          row_json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
---------------------------------+----------------------------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 07_byd2003_readable_sample_rows | vw_robot_brain_runtime_material_quality_overlay_v1 | {"tags": ["education", "explanation"], "role_code": "Manager", "unit_code": "edu_001_stepwise_explanation", "depth_code": "standard", "model_code": "BYD2-003", "depth_score": 300, "series_code": "Beyond", "canon_status": "legacy_seed", "unit_title_ja": "説明は段階化すると伝わりやすい", "reference_tier": "lightweight", "unit_detail_ja": "いきなり詳細に入らず、相手の現在地を推定し、小さなまとまりで説明する。", "brain_data_code": "edu_001_stepwise_explanation", "risk_base_score": 80, "risk_class_code": "low", "unit_summary_ja": "難しい内容は、前提、要点、例、確認の順で説明すると理解されやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "学習支援、業務説明、レビュー。", "brain_domain_code": "education_learning", "example_prompt_ja": "初心者向けに段階的に説明して。", "source_caution_ja": "", "source_kind_score": 400, "full_load_priority": 50, "safety_boundary_ja": "相手を見下す表現を避ける。", "source_basis_codes": ["generated_draft"], "source_exists_flag": true, "profile_source_type": "model", "verification_status": "not_reviewed", "access_decision_code": "allow_focus_domain", "material_source_kind": "base_material", "robot_use_summary_ja": "", "brain_domain_label_ja": "教育・学習", "domain_priority_score": 1150, "misconception_guard_ja": "", "verified_canon_priority": 1000, "lightweight_allowed_flag": false, "deep_reference_allowed_flag": false, "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_brain_runtime_material_quality_overlay_v1 | {"tags": ["mistake", "review", "learning"], "role_code": "Manager", "unit_code": "edu_002_mistake_review", "depth_code": "standard", "model_code": "BYD2-003", "depth_score": 300, "series_code": "Beyond", "canon_status": "legacy_seed", "unit_title_ja": "間違いは原因別に見る", "reference_tier": "lightweight", "unit_detail_ja": "責めるより、再発防止の観点で分類する。次に使うチェック項目へ落とす。", "brain_data_code": "edu_002_mistake_review", "risk_base_score": 80, "risk_class_code": "low", "unit_summary_ja": "学習や作業のミスは、知識不足、読み違い、手順抜け、確認不足に分けると改善しやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、作業レビュー、品質改善。", "brain_domain_code": "education_learning", "example_prompt_ja": "間違えた理由を責めずに分析して。", "source_caution_ja": "", "source_kind_score": 400, "full_load_priority": 50, "safety_boundary_ja": "人格評価に使わない。", "source_basis_codes": ["generated_draft"], "source_exists_flag": true, "profile_source_type": "model", "verification_status": "not_reviewed", "access_decision_code": "allow_focus_domain", "material_source_kind": "base_material", "robot_use_summary_ja": "", "brain_domain_label_ja": "教育・学習", "domain_priority_score": 1150, "misconception_guard_ja": "", "verified_canon_priority": 1000, "lightweight_allowed_flag": false, "deep_reference_allowed_flag": false, "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_brain_runtime_material_quality_overlay_v1 | {"tags": ["memory", "learning", "exam"], "role_code": "Manager", "unit_code": "edu_003_retrieval_practice", "depth_code": "standard", "model_code": "BYD2-003", "depth_score": 300, "series_code": "Beyond", "canon_status": "legacy_seed", "unit_title_ja": "思い出す練習は定着に効く", "reference_tier": "lightweight", "unit_detail_ja": "問題化、穴埋め、説明し直し、翌日の再確認などが使える。", "brain_data_code": "edu_003_retrieval_practice", "risk_base_score": 80, "risk_class_code": "low", "unit_summary_ja": "読むだけでなく、短く思い出す練習を挟むと記憶に残りやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験勉強、資格学習、暗記補助。", "brain_domain_code": "education_learning", "example_prompt_ja": "覚えた内容を思い出す練習に変えて。", "source_caution_ja": "", "source_kind_score": 400, "full_load_priority": 50, "safety_boundary_ja": "過度な詰め込みや不安を煽らない。", "source_basis_codes": ["generated_draft"], "source_exists_flag": true, "profile_source_type": "model", "verification_status": "not_reviewed", "access_decision_code": "allow_focus_domain", "material_source_kind": "base_material", "robot_use_summary_ja": "", "brain_domain_label_ja": "教育・学習", "domain_priority_score": 1150, "misconception_guard_ja": "", "verified_canon_priority": 1000, "lightweight_allowed_flag": false, "deep_reference_allowed_flag": false, "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_brain_runtime_material_quality_overlay_v1 | {"tags": ["exam", "question_bank"], "role_code": "Manager", "unit_code": "exam_001_question_bank_boundary", "depth_code": "standard", "model_code": "BYD2-003", "depth_score": 300, "series_code": "Beyond", "canon_status": "legacy_seed", "unit_title_ja": "問題データと通常知識は分ける", "reference_tier": "lightweight", "unit_detail_ja": "出題文、選択肢、解説、誤答理由を別々に見て、学習者の理解確認に使う。", "brain_data_code": "exam_001_question_bank_boundary", "risk_base_score": 80, "risk_class_code": "low", "unit_summary_ja": "問題バンクは演習用データであり、通常知識の正本とは分けて扱う。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "資格学習、演習、復習。", "brain_domain_code": "exam_learning", "example_prompt_ja": "問題を解いた後の復習観点を出して。", "source_caution_ja": "", "source_kind_score": 400, "full_load_priority": 51, "safety_boundary_ja": "実試験の不正支援や漏洩利用に使わない。", "source_basis_codes": ["generated_draft"], "source_exists_flag": true, "profile_source_type": "model", "verification_status": "not_reviewed", "access_decision_code": "allow_model_policy", "material_source_kind": "base_material", "robot_use_summary_ja": "", "brain_domain_label_ja": "試験・問題", "domain_priority_score": 1149, "misconception_guard_ja": "", "verified_canon_priority": 1000, "lightweight_allowed_flag": false, "deep_reference_allowed_flag": false, "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
 07_byd2003_readable_sample_rows | vw_robot_brain_runtime_material_quality_overlay_v1 | {"tags": ["exam", "distractor", "review"], "role_code": "Manager", "unit_code": "exam_002_distractor_review", "depth_code": "standard", "model_code": "BYD2-003", "depth_score": 300, "series_code": "Beyond", "canon_status": "legacy_seed", "unit_title_ja": "誤答選択肢は理解の穴を映す", "reference_tier": "lightweight", "unit_detail_ja": "なぜその選択肢が魅力的に見えたか、正答との差は何かを説明する。", "brain_data_code": "exam_002_distractor_review", "risk_base_score": 80, "risk_class_code": "low", "unit_summary_ja": "誤答選択肢は単なる間違いではなく、どの概念を混同したかを見つける材料になる。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、弱点分析。", "brain_domain_code": "exam_learning", "example_prompt_ja": "間違えた選択肢から弱点を見つけて。", "source_caution_ja": "", "source_kind_score": 400, "full_load_priority": 51, "safety_boundary_ja": "合格保証や不正な試験対策には使わない。", "source_basis_codes": ["generated_draft"], "source_exists_flag": true, "profile_source_type": "model", "verification_status": "not_reviewed", "access_decision_code": "allow_model_policy", "material_source_kind": "base_material", "robot_use_summary_ja": "", "brain_domain_label_ja": "試験・問題", "domain_priority_score": 1149, "misconception_guard_ja": "", "verified_canon_priority": 1000, "lightweight_allowed_flag": false, "deep_reference_allowed_flag": false, "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
(5 rows)

             section             |                  view_name                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               row_json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
---------------------------------+---------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v1 | {"tags": ["education", "explanation"], "role_code": "Manager", "unit_code": "edu_001_stepwise_explanation", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "説明は段階化すると伝わりやすい", "unit_detail_ja": "いきなり詳細に入らず、相手の現在地を推定し、小さなまとまりで説明する。", "brain_data_code": "edu_001_stepwise_explanation", "risk_class_code": "low", "unit_summary_ja": "難しい内容は、前提、要点、例、確認の順で説明すると理解されやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "学習支援、業務説明、レビュー。", "brain_domain_code": "education_learning", "example_prompt_ja": "初心者向けに段階的に説明して。", "safety_boundary_ja": "相手を見下す表現を避ける。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v1 | {"tags": ["mistake", "review", "learning"], "role_code": "Manager", "unit_code": "edu_002_mistake_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "間違いは原因別に見る", "unit_detail_ja": "責めるより、再発防止の観点で分類する。次に使うチェック項目へ落とす。", "brain_data_code": "edu_002_mistake_review", "risk_class_code": "low", "unit_summary_ja": "学習や作業のミスは、知識不足、読み違い、手順抜け、確認不足に分けると改善しやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、作業レビュー、品質改善。", "brain_domain_code": "education_learning", "example_prompt_ja": "間違えた理由を責めずに分析して。", "safety_boundary_ja": "人格評価に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v1 | {"tags": ["memory", "learning", "exam"], "role_code": "Manager", "unit_code": "edu_003_retrieval_practice", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "思い出す練習は定着に効く", "unit_detail_ja": "問題化、穴埋め、説明し直し、翌日の再確認などが使える。", "brain_data_code": "edu_003_retrieval_practice", "risk_class_code": "low", "unit_summary_ja": "読むだけでなく、短く思い出す練習を挟むと記憶に残りやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験勉強、資格学習、暗記補助。", "brain_domain_code": "education_learning", "example_prompt_ja": "覚えた内容を思い出す練習に変えて。", "safety_boundary_ja": "過度な詰め込みや不安を煽らない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v1 | {"tags": ["exam", "question_bank"], "role_code": "Manager", "unit_code": "exam_001_question_bank_boundary", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "問題データと通常知識は分ける", "unit_detail_ja": "出題文、選択肢、解説、誤答理由を別々に見て、学習者の理解確認に使う。", "brain_data_code": "exam_001_question_bank_boundary", "risk_class_code": "low", "unit_summary_ja": "問題バンクは演習用データであり、通常知識の正本とは分けて扱う。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "資格学習、演習、復習。", "brain_domain_code": "exam_learning", "example_prompt_ja": "問題を解いた後の復習観点を出して。", "safety_boundary_ja": "実試験の不正支援や漏洩利用に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v1 | {"tags": ["exam", "distractor", "review"], "role_code": "Manager", "unit_code": "exam_002_distractor_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "誤答選択肢は理解の穴を映す", "unit_detail_ja": "なぜその選択肢が魅力的に見えたか、正答との差は何かを説明する。", "brain_data_code": "exam_002_distractor_review", "risk_class_code": "low", "unit_summary_ja": "誤答選択肢は単なる間違いではなく、どの概念を混同したかを見つける材料になる。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、弱点分析。", "brain_domain_code": "exam_learning", "example_prompt_ja": "間違えた選択肢から弱点を見つけて。", "safety_boundary_ja": "合格保証や不正な試験対策には使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
(5 rows)

             section             |                  view_name                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               row_json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
---------------------------------+---------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v2 | {"tags": ["education", "explanation"], "role_code": "Manager", "unit_code": "edu_001_stepwise_explanation", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "説明は段階化すると伝わりやすい", "unit_detail_ja": "いきなり詳細に入らず、相手の現在地を推定し、小さなまとまりで説明する。", "brain_data_code": "edu_001_stepwise_explanation", "risk_class_code": "low", "unit_summary_ja": "難しい内容は、前提、要点、例、確認の順で説明すると理解されやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "学習支援、業務説明、レビュー。", "brain_domain_code": "education_learning", "example_prompt_ja": "初心者向けに段階的に説明して。", "safety_boundary_ja": "相手を見下す表現を避ける。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v2 | {"tags": ["mistake", "review", "learning"], "role_code": "Manager", "unit_code": "edu_002_mistake_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "間違いは原因別に見る", "unit_detail_ja": "責めるより、再発防止の観点で分類する。次に使うチェック項目へ落とす。", "brain_data_code": "edu_002_mistake_review", "risk_class_code": "low", "unit_summary_ja": "学習や作業のミスは、知識不足、読み違い、手順抜け、確認不足に分けると改善しやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、作業レビュー、品質改善。", "brain_domain_code": "education_learning", "example_prompt_ja": "間違えた理由を責めずに分析して。", "safety_boundary_ja": "人格評価に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v2 | {"tags": ["memory", "learning", "exam"], "role_code": "Manager", "unit_code": "edu_003_retrieval_practice", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "思い出す練習は定着に効く", "unit_detail_ja": "問題化、穴埋め、説明し直し、翌日の再確認などが使える。", "brain_data_code": "edu_003_retrieval_practice", "risk_class_code": "low", "unit_summary_ja": "読むだけでなく、短く思い出す練習を挟むと記憶に残りやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験勉強、資格学習、暗記補助。", "brain_domain_code": "education_learning", "example_prompt_ja": "覚えた内容を思い出す練習に変えて。", "safety_boundary_ja": "過度な詰め込みや不安を煽らない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v2 | {"tags": ["exam", "question_bank"], "role_code": "Manager", "unit_code": "exam_001_question_bank_boundary", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "問題データと通常知識は分ける", "unit_detail_ja": "出題文、選択肢、解説、誤答理由を別々に見て、学習者の理解確認に使う。", "brain_data_code": "exam_001_question_bank_boundary", "risk_class_code": "low", "unit_summary_ja": "問題バンクは演習用データであり、通常知識の正本とは分けて扱う。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "資格学習、演習、復習。", "brain_domain_code": "exam_learning", "example_prompt_ja": "問題を解いた後の復習観点を出して。", "safety_boundary_ja": "実試験の不正支援や漏洩利用に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v2 | {"tags": ["exam", "distractor", "review"], "role_code": "Manager", "unit_code": "exam_002_distractor_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "誤答選択肢は理解の穴を映す", "unit_detail_ja": "なぜその選択肢が魅力的に見えたか、正答との差は何かを説明する。", "brain_data_code": "exam_002_distractor_review", "risk_class_code": "low", "unit_summary_ja": "誤答選択肢は単なる間違いではなく、どの概念を混同したかを見つける材料になる。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、弱点分析。", "brain_domain_code": "exam_learning", "example_prompt_ja": "間違えた選択肢から弱点を見つけて。", "safety_boundary_ja": "合格保証や不正な試験対策には使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
(5 rows)

             section             |                  view_name                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               row_json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
---------------------------------+---------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v3 | {"tags": ["education", "explanation"], "role_code": "Manager", "unit_code": "edu_001_stepwise_explanation", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "説明は段階化すると伝わりやすい", "unit_detail_ja": "いきなり詳細に入らず、相手の現在地を推定し、小さなまとまりで説明する。", "brain_data_code": "edu_001_stepwise_explanation", "risk_class_code": "low", "unit_summary_ja": "難しい内容は、前提、要点、例、確認の順で説明すると理解されやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "学習支援、業務説明、レビュー。", "brain_domain_code": "education_learning", "example_prompt_ja": "初心者向けに段階的に説明して。", "safety_boundary_ja": "相手を見下す表現を避ける。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v3 | {"tags": ["mistake", "review", "learning"], "role_code": "Manager", "unit_code": "edu_002_mistake_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "間違いは原因別に見る", "unit_detail_ja": "責めるより、再発防止の観点で分類する。次に使うチェック項目へ落とす。", "brain_data_code": "edu_002_mistake_review", "risk_class_code": "low", "unit_summary_ja": "学習や作業のミスは、知識不足、読み違い、手順抜け、確認不足に分けると改善しやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、作業レビュー、品質改善。", "brain_domain_code": "education_learning", "example_prompt_ja": "間違えた理由を責めずに分析して。", "safety_boundary_ja": "人格評価に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v3 | {"tags": ["memory", "learning", "exam"], "role_code": "Manager", "unit_code": "edu_003_retrieval_practice", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "思い出す練習は定着に効く", "unit_detail_ja": "問題化、穴埋め、説明し直し、翌日の再確認などが使える。", "brain_data_code": "edu_003_retrieval_practice", "risk_class_code": "low", "unit_summary_ja": "読むだけでなく、短く思い出す練習を挟むと記憶に残りやすい。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験勉強、資格学習、暗記補助。", "brain_domain_code": "education_learning", "example_prompt_ja": "覚えた内容を思い出す練習に変えて。", "safety_boundary_ja": "過度な詰め込みや不安を煽らない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_focus_domain", "brain_domain_label_ja": "教育・学習", "effective_use_purpose_codes": ["reference", "review", "business_planning", "executive_planning", "risk_check", "design_reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v3 | {"tags": ["exam", "question_bank"], "role_code": "Manager", "unit_code": "exam_001_question_bank_boundary", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "問題データと通常知識は分ける", "unit_detail_ja": "出題文、選択肢、解説、誤答理由を別々に見て、学習者の理解確認に使う。", "brain_data_code": "exam_001_question_bank_boundary", "risk_class_code": "low", "unit_summary_ja": "問題バンクは演習用データであり、通常知識の正本とは分けて扱う。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "資格学習、演習、復習。", "brain_domain_code": "exam_learning", "example_prompt_ja": "問題を解いた後の復習観点を出して。", "safety_boundary_ja": "実試験の不正支援や漏洩利用に使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
 07_byd2003_readable_sample_rows | vw_robot_readable_brain_runtime_material_v3 | {"tags": ["exam", "distractor", "review"], "role_code": "Manager", "unit_code": "exam_002_distractor_review", "depth_code": "standard", "model_code": "BYD2-003", "series_code": "Beyond", "unit_title_ja": "誤答選択肢は理解の穴を映す", "unit_detail_ja": "なぜその選択肢が魅力的に見えたか、正答との差は何かを説明する。", "brain_data_code": "exam_002_distractor_review", "risk_class_code": "low", "unit_summary_ja": "誤答選択肢は単なる間違いではなく、どの概念を混同したかを見つける材料になる。", "data_depth_level": 30, "granularity_code": "record", "practical_use_ja": "試験復習、弱点分析。", "brain_domain_code": "exam_learning", "example_prompt_ja": "間違えた選択肢から弱点を見つけて。", "safety_boundary_ja": "合格保証や不正な試験対策には使わない。", "source_exists_flag": true, "profile_source_type": "model", "access_decision_code": "allow_model_policy", "brain_domain_label_ja": "試験・問題", "effective_use_purpose_codes": ["review", "education", "exam_practice", "reference"]}
(5 rows)

============================================================
08 EXACT R24 HELPER QUERY SIMULATION
============================================================
               section                |                     view_name                      | simulated_rows 
--------------------------------------+----------------------------------------------------+----------------
 08_exact_r24_helper_query_simulation | vw_robot_brain_runtime_material_quality_overlay_v1 |              0
(1 row)

               section                |                  view_name                  | simulated_rows 
--------------------------------------+---------------------------------------------+----------------
 08_exact_r24_helper_query_simulation | vw_robot_readable_brain_runtime_material_v1 |              0
(1 row)

               section                |                  view_name                  | simulated_rows 
--------------------------------------+---------------------------------------------+----------------
 08_exact_r24_helper_query_simulation | vw_robot_readable_brain_runtime_material_v2 |              0
(1 row)

               section                |                  view_name                  | simulated_rows 
--------------------------------------+---------------------------------------------+----------------
 08_exact_r24_helper_query_simulation | vw_robot_readable_brain_runtime_material_v3 |              0
(1 row)

============================================================
09 CX/AIWORKER MATERIAL TABLE CANDIDATES
============================================================
           section            | schemaname |                  tablename                   
------------------------------+------------+----------------------------------------------
 09_material_table_candidates | aiworker   | beyond_model_quality_profile
 09_material_table_candidates | aiworker   | beyond_quality_level_catalog
 09_material_table_candidates | aiworker   | brain_runtime_selection_policy_catalog
 09_material_table_candidates | aiworker   | brain_runtime_selection_smoke_case_catalog
 09_material_table_candidates | aiworker   | business_support_standard_reference
 09_material_table_candidates | aiworker   | chat_worker_v0_allowed_reference
 09_material_table_candidates | aiworker   | conversation_reference_scope
 09_material_table_candidates | aiworker   | robot_brain_access_tier_catalog
 09_material_table_candidates | aiworker   | robot_brain_model_domain_policy
 09_material_table_candidates | aiworker   | robot_brain_model_profile
 09_material_table_candidates | aiworker   | robot_brain_personality_exception_policy
 09_material_table_candidates | aiworker   | robot_brain_reference_tier_policy
 09_material_table_candidates | aiworker   | robot_brain_role_policy
 09_material_table_candidates | aiworker   | robot_brain_series_profile
 09_material_table_candidates | cx22073jw  | brain_data_depth_catalog
 09_material_table_candidates | cx22073jw  | brain_data_domain_catalog
 09_material_table_candidates | cx22073jw  | brain_data_granularity_catalog
 09_material_table_candidates | cx22073jw  | brain_data_registry
 09_material_table_candidates | cx22073jw  | brain_data_risk_class_catalog
 09_material_table_candidates | cx22073jw  | brain_data_use_purpose_catalog
 09_material_table_candidates | cx22073jw  | brain_detail_axis_catalog
 09_material_table_candidates | cx22073jw  | brain_detail_expansion_unit
 09_material_table_candidates | cx22073jw  | brain_domain_breadth_candidate_catalog
 09_material_table_candidates | cx22073jw  | brain_full_load_fill_axis_catalog
 09_material_table_candidates | cx22073jw  | brain_full_load_lane05_run_snapshot
 09_material_table_candidates | cx22073jw  | brain_full_load_scope_catalog
 09_material_table_candidates | cx22073jw  | brain_knowledge_unit
 09_material_table_candidates | cx22073jw  | brain_reference_quality_metadata
 09_material_table_candidates | cx22073jw  | brain_source_candidate_registry
 09_material_table_candidates | cx22073jw  | brain_source_object_ingestion_catalog
 09_material_table_candidates | cx22073jw  | brain_source_object_mapping_rule_catalog
 09_material_table_candidates | cx22073jw  | business_support_knowledge_material
 09_material_table_candidates | cx22073jw  | civilization_foundation_history_detail_entry
 09_material_table_candidates | cx22073jw  | currency_amount_reference
 09_material_table_candidates | cx22073jw  | earth_history_detail_entry
 09_material_table_candidates | cx22073jw  | executive_strategy_material
 09_material_table_candidates | cx22073jw  | foundation_knowledge_material
 09_material_table_candidates | cx22073jw  | jurisdiction_region_reference
 09_material_table_candidates | cx22073jw  | published_knowledge_quality_metric
 09_material_table_candidates | cx22073jw  | robot_model_role_reference_binding
 09_material_table_candidates | cx22073jw  | topic_material
 09_material_table_candidates | cx22073jw  | topic_reference
 09_material_table_candidates | cx22073jw  | unit_reference
(43 rows)

============================================================
10 R28-R1 DIAGNOSIS HINT
============================================================
      section      |                                                                       hint                                                                       
-------------------+--------------------------------------------------------------------------------------------------------------------------------------------------
 10_diagnosis_hint | If section 05 has taika_total_rows > 0 but taika_normalized_model_rows = 0, patch should map model_code or remove too-strict exact model filter.
 10_diagnosis_hint | If section 05 has all zero, runtime views do not expose Taika material; patch should query CX material/source tables or fix view connection.
 10_diagnosis_hint | If section 08 has rows but runtime returned cx_material_rows_found=0, Node helper/psql execution/parsing path is failing.
 10_diagnosis_hint | If section 07 has rows but section 08 is zero, term search is too narrow.
(4 rows)

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
