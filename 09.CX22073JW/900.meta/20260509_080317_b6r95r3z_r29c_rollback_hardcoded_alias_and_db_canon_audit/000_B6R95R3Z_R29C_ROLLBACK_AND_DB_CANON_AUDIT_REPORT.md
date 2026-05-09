# B6R95R3Z-R29C Rollback and DB Canon Audit Report

RUN_TS=20260509_080317
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_080317_b6r95r3z_r29c_rollback_hardcoded_alias_and_db_canon_audit

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- HTTP_GET=YES
- PATCH=ROLLBACK
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Files
- PRE_ROLLBACK_SERVER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_080317_b6r95r3z_r29c_rollback_hardcoded_alias_and_db_canon_audit/server.js.before_r29c_rollback
- R29B_BACKUP=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_075151_b6r95r3z_r29b_public_model_alias_resolver_patch/server.js.before_b6r95r3z_r29b
- DB_AUDIT_SQL=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_080317_b6r95r3z_r29c_rollback_hardcoded_alias_and_db_canon_audit/100_model_code_canon_readonly_audit.sql
- DB_AUDIT_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_080317_b6r95r3z_r29c_rollback_hardcoded_alias_and_db_canon_audit/110_model_code_canon_readonly_audit.log
- DESIGN_DOC=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_080317_b6r95r3z_r29c_rollback_hardcoded_alias_and_db_canon_audit/120_MODEL_CODE_CANON_DESIGN.md
- NOT_EXECUTED_SQL=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_080317_b6r95r3z_r29c_rollback_hardcoded_alias_and_db_canon_audit/130_NOT_EXECUTED_model_code_canon_mapping_draft.sql

## Rollback log
```
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
R29B_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_075151_b6r95r3z_r29b_public_model_alias_resolver_patch
R29B_BACKUP=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_075151_b6r95r3z_r29b_public_model_alias_resolver_patch/server.js.before_b6r95r3z_r29b
PRE_ROLLBACK_SERVER=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_080317_b6r95r3z_r29c_rollback_hardcoded_alias_and_db_canon_audit/server.js.before_r29c_rollback

ROLLBACK_ACTION=RESTORED_FROM_R29B_BACKUP
ROLLBACK_VERIFY=PASS_MARKER_REMOVED
```

## Node check
```

```

## DB audit key lines
```
15: 02_model_code_column_inventory | aiworker     | beyond_model_quality_profile                                    | model_code
16: 02_model_code_column_inventory | aiworker     | brain_runtime_selection_smoke_case_catalog                      | model_code
17: 02_model_code_column_inventory | aiworker     | control_policy_package                                          | model_code
18: 02_model_code_column_inventory | aiworker     | conversation_profile                                            | model_code
19: 02_model_code_column_inventory | aiworker     | internal_pipeline_acceptance_package                            | president_model_code
20: 02_model_code_column_inventory | aiworker     | internal_pipeline_acceptance_package                            | president_model_no
21: 02_model_code_column_inventory | aiworker     | learning_delta_log                                              | model_code
22: 02_model_code_column_inventory | aiworker     | megami_model_profile                                            | model_code
23: 02_model_code_column_inventory | aiworker     | model_identity_spec                                             | model_code
24: 02_model_code_column_inventory | aiworker     | model_public_appearance_profile                                 | model_code
25: 02_model_code_column_inventory | aiworker     | model_public_appearance_profile                                 | model_no
26: 02_model_code_column_inventory | aiworker     | model_public_registry                                           | model_code
27: 02_model_code_column_inventory | aiworker     | model_public_registry                                           | model_no
28: 02_model_code_column_inventory | aiworker     | model_runtime_control_override                                  | model_code
29: 02_model_code_column_inventory | aiworker     | model_runtime_control_override                                  | model_no
30: 02_model_code_column_inventory | aiworker     | model_service_assignment                                        | model_code
31: 02_model_code_column_inventory | aiworker     | model_style_assignment                                          | model_code
32: 02_model_code_column_inventory | aiworker     | president_capability_gate                                       | president_model_code
33: 02_model_code_column_inventory | aiworker     | president_manager_instruction_bridge                            | president_model_code
34: 02_model_code_column_inventory | aiworker     | president_manager_instruction_bridge                            | president_model_no
35: 02_model_code_column_inventory | aiworker     | president_model_catalog                                         | model_code
36: 02_model_code_column_inventory | aiworker     | president_model_catalog                                         | model_no
37: 02_model_code_column_inventory | aiworker     | president_model_catalog                                         | president_model_code
38: 02_model_code_column_inventory | aiworker     | president_runtime_activation_gate_log                           | president_model_code
39: 02_model_code_column_inventory | aiworker     | president_runtime_control                                       | president_model_code
40: 02_model_code_column_inventory | aiworker     | public_activity_profile                                         | model_code
41: 02_model_code_column_inventory | aiworker     | public_metric                                                   | model_code
42: 02_model_code_column_inventory | aiworker     | robot_brain_model_domain_policy                                 | model_code
43: 02_model_code_column_inventory | aiworker     | robot_brain_model_profile                                       | model_code
44: 02_model_code_column_inventory | aiworker     | robot_brain_personality_exception_policy                        | model_code
45: 02_model_code_column_inventory | aiworker     | robot_brain_reference_tier_policy                               | model_code
46: 02_model_code_column_inventory | aiworker     | robot_breadth_domain_runtime_policy                             | model_code
47: 02_model_code_column_inventory | aiworker     | robot_chatstyle_profile_policy                                  | model_code
48: 02_model_code_column_inventory | aiworker     | robot_model_capability_profile                                  | model_code
49: 02_model_code_column_inventory | aiworker     | robot_model_capability_profile                                  | model_no
50: 02_model_code_column_inventory | aiworker     | robot_model_code_deprecation_map                                | model_no
51: 02_model_code_column_inventory | aiworker     | robot_model_code_deprecation_map                                | new_model_code
52: 02_model_code_column_inventory | aiworker     | robot_model_code_deprecation_map                                | old_model_code
53: 02_model_code_column_inventory | aiworker     | robot_model_personality_profile                                 | aiworker_model_code
54: 02_model_code_column_inventory | aiworker     | robot_model_public_profile                                      | aiworker_model_code
55: 02_model_code_column_inventory | aiworker     | runtime_execution_request                                       | model_code
56: 02_model_code_column_inventory | aiworker     | runtime_execution_request                                       | model_no
57: 02_model_code_column_inventory | aiworker     | smalltalk_profile                                               | model_code
58: 02_model_code_column_inventory | aiworker     | vw_ai_company_beyond_candidate_lineup_v1                        | model_code
59: 02_model_code_column_inventory | aiworker     | vw_ai_company_beyond_candidate_lineup_v1                        | model_no
60: 02_model_code_column_inventory | aiworker     | vw_ai_company_beyond_candidate_quality_lineup_v1                | model_code
61: 02_model_code_column_inventory | aiworker     | vw_ai_company_beyond_candidate_quality_lineup_v1                | model_no
62: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_internal_pipeline_dashboard_v1                  | president_model_code
63: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_internal_pipeline_dashboard_v1                  | president_model_no
64: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_model_capability_overlay_v1                     | model_code
65: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_model_capability_overlay_v1                     | model_no
66: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_model_selection_capability_card_v1              | model_code
67: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_model_selection_capability_card_v1              | model_no
68: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_model_selection_directory_v1                    | model_code
69: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_model_selection_directory_v1                    | model_no
70: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_model_selection_source_for_capability_v1        | model_code
71: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_model_selection_source_for_capability_v1        | model_no
72: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_robot_selection_card_v1                         | model_code
73: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_robot_selection_card_v1                         | model_no
74: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_control_profile_v1                      | model_code
75: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_control_profile_v1                      | model_no
76: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_control_prompt_fragment_v1              | model_code
77: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_control_prompt_fragment_v1              | model_no
78: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_delivery_board_v1                       | model_code
79: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_delivery_board_v1                       | model_no
80: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_execution_app_read_payload_v1           | model_code
81: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_execution_app_read_payload_v1           | model_no
82: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_execution_gate_board_v1                 | model_code
83: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_execution_gate_board_v1                 | model_no
84: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_execution_persistent_smoke_board_v1     | model_code
85: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_execution_persistent_smoke_board_v1     | model_no
86: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_execution_request_board_v1              | model_code
87: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_execution_request_board_v1              | model_no
88: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_full_pipeline_board_v1                  | model_code
89: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_full_pipeline_board_v1                  | model_no
90: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_handoff_packet_board_v1                 | model_code
91: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_handoff_packet_board_v1                 | model_no
92: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_leader_review_board_v1                  | model_code
93: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_leader_review_board_v1                  | model_no
94: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_manager_gate_board_v1                   | model_code
95: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_manager_gate_board_v1                   | model_no
96: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_president_approval_board_v1             | model_code
97: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_president_approval_board_v1             | model_no
98: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_worker_output_board_v1                  | model_code
99: 02_model_code_column_inventory | aiworker     | vw_app_aiworker_runtime_worker_output_board_v1                  | model_no
100: 02_model_code_column_inventory | aiworker     | vw_app_megami_candidate_lineup_v1                               | model_code
101: 02_model_code_column_inventory | aiworker     | vw_app_megami_candidate_lineup_v1                               | model_no
102: 02_model_code_column_inventory | aiworker     | vw_app_megami_norn_three_sisters_lineup_with_body_v1            | model_code
103: 02_model_code_column_inventory | aiworker     | vw_app_megami_norn_three_sisters_lineup_with_body_v1            | model_no
104: 02_model_code_column_inventory | aiworker     | vw_beyond_series_leader_lineup_v1                               | model_code
105: 02_model_code_column_inventory | aiworker     | vw_beyond_series_leader_lineup_v1                               | model_no
106: 02_model_code_column_inventory | aiworker     | vw_beyond_series_leader_quality_lineup_v1                       | model_code
107: 02_model_code_column_inventory | aiworker     | vw_beyond_series_leader_quality_lineup_v1                       | model_no
108: 02_model_code_column_inventory | aiworker     | vw_beyond_series_lineup_v1                                      | model_code
109: 02_model_code_column_inventory | aiworker     | vw_beyond_series_lineup_v1                                      | model_no
110: 02_model_code_column_inventory | aiworker     | vw_beyond_series_quality_lineup_v1                              | model_code
111: 02_model_code_column_inventory | aiworker     | vw_beyond_series_quality_lineup_v1                              | model_no
112: 02_model_code_column_inventory | aiworker     | vw_beyond_series_worker_lineup_v1                               | model_code
113: 02_model_code_column_inventory | aiworker     | vw_beyond_series_worker_lineup_v1                               | model_no
114: 02_model_code_column_inventory | aiworker     | vw_beyond_series_worker_quality_lineup_v1                       | model_code
115: 02_model_code_column_inventory | aiworker     | vw_beyond_series_worker_quality_lineup_v1                       | model_no
116: 02_model_code_column_inventory | aiworker     | vw_brain_runtime_selection_smoke_board_v1                       | model_code
117: 02_model_code_column_inventory | aiworker     | vw_dialog_knowledge_reference                                   | model_code
118: 02_model_code_column_inventory | aiworker     | vw_dialog_knowledge_reference                                   | model_no
119: 02_model_code_column_inventory | aiworker     | vw_dialog_policy_package_directory                              | model_code
120: 02_model_code_column_inventory | aiworker     | vw_dialog_policy_package_directory                              | model_no
121: 02_model_code_column_inventory | aiworker     | vw_dialog_profile_catalog                                       | model_code
122: 02_model_code_column_inventory | aiworker     | vw_dialog_profile_catalog                                       | model_no
123: 02_model_code_column_inventory | aiworker     | vw_dialog_profile_step_catalog                                  | model_code
124: 02_model_code_column_inventory | aiworker     | vw_dialog_profile_step_catalog                                  | model_no
125: 02_model_code_column_inventory | aiworker     | vw_dialog_redirect_template_catalog                             | model_code
126: 02_model_code_column_inventory | aiworker     | vw_dialog_reference_scope_catalog                               | model_code
127: 02_model_code_column_inventory | aiworker     | vw_dialog_reference_scope_catalog                               | model_no
128: 02_model_code_column_inventory | aiworker     | vw_dialog_rule_catalog                                          | model_code
129: 02_model_code_column_inventory | aiworker     | vw_megami_friend_lover_selection_card_v1                        | model_code
130: 02_model_code_column_inventory | aiworker     | vw_megami_friend_lover_selection_card_v1                        | model_no
131: 02_model_code_column_inventory | aiworker     | vw_megami_norn_three_sisters_appearance_profile_v1              | model_code
132: 02_model_code_column_inventory | aiworker     | vw_megami_norn_three_sisters_appearance_profile_v1              | model_no
133: 02_model_code_column_inventory | aiworker     | vw_megami_series_lineup_v1                                      | model_code
134: 02_model_code_column_inventory | aiworker     | vw_megami_series_lineup_v1                                      | model_no
135: 02_model_code_column_inventory | aiworker     | vw_megami_worker_temporal_focus_v1                              | model_code
136: 02_model_code_column_inventory | aiworker     | vw_megami_worker_temporal_focus_v1                              | model_no
137: 02_model_code_column_inventory | aiworker     | vw_model_growth_delta_summary                                   | model_code
138: 02_model_code_column_inventory | aiworker     | vw_model_growth_delta_summary                                   | model_no
139: 02_model_code_column_inventory | aiworker     | vw_model_public_directory_v1                                    | model_code
140: 02_model_code_column_inventory | aiworker     | vw_model_public_directory_v1                                    | model_no
141: 02_model_code_column_inventory | aiworker     | vw_model_public_profile                                         | model_code
142: 02_model_code_column_inventory | aiworker     | vw_model_public_profile                                         | model_no
143: 02_model_code_column_inventory | aiworker     | vw_model_style_profile                                          | model_code
144: 02_model_code_column_inventory | aiworker     | vw_model_style_profile                                          | model_no
145: 02_model_code_column_inventory | aiworker     | vw_president_capability_gate_v1                                 | president_model_code
146: 02_model_code_column_inventory | aiworker     | vw_president_catalog_summary_v1                                 | president_model_code
147: 02_model_code_column_inventory | aiworker     | vw_president_hd_r5p_catalog_summary_v1                          | model_code
148: 02_model_code_column_inventory | aiworker     | vw_president_hd_r5p_catalog_summary_v1                          | model_no
149: 02_model_code_column_inventory | aiworker     | vw_president_hd_r5p_catalog_summary_v1                          | president_model_code
150: 02_model_code_column_inventory | aiworker     | vw_president_manager_instruction_bridge_board_v1                | president_model_code
151: 02_model_code_column_inventory | aiworker     | vw_president_manager_instruction_bridge_board_v1                | president_model_no
152: 02_model_code_column_inventory | aiworker     | vw_president_manager_instruction_candidate_v1                   | president_model_code
153: 02_model_code_column_inventory | aiworker     | vw_president_manager_instruction_candidate_v1                   | president_model_no
154: 02_model_code_column_inventory | aiworker     | vw_president_manager_instruction_waiting_v1                     | president_model_code
155: 02_model_code_column_inventory | aiworker     | vw_president_manager_instruction_waiting_v1                     | president_model_no
156: 02_model_code_column_inventory | aiworker     | vw_president_runtime_gate_v1                                    | president_model_code
157: 02_model_code_column_inventory | aiworker     | vw_president_wlm_internal_pipeline_acceptance_metrics_v1        | president_model_code
158: 02_model_code_column_inventory | aiworker     | vw_president_wlm_internal_pipeline_acceptance_metrics_v1        | president_model_no
159: 02_model_code_column_inventory | aiworker     | vw_president_wlm_internal_pipeline_acceptance_summary_v1        | president_model_code
160: 02_model_code_column_inventory | aiworker     | vw_president_wlm_internal_pipeline_acceptance_summary_v1        | president_model_no
161: 02_model_code_column_inventory | aiworker     | vw_robot_brain_compact_context_v1                               | model_code
162: 02_model_code_column_inventory | aiworker     | vw_robot_brain_effective_access_v1                              | model_code
163: 02_model_code_column_inventory | aiworker     | vw_robot_brain_runtime_material_quality_overlay_v1              | model_code
164: 02_model_code_column_inventory | aiworker     | vw_robot_brain_runtime_material_scoring_base_v1                 | model_code
165: 02_model_code_column_inventory | aiworker     | vw_robot_model_capability_public_v1                             | model_code
166: 02_model_code_column_inventory | aiworker     | vw_robot_model_capability_public_v1                             | model_no
167: 02_model_code_column_inventory | aiworker     | vw_robot_readable_brain_knowledge_material_v1                   | model_code
168: 02_model_code_column_inventory | aiworker     | vw_robot_readable_brain_runtime_material_coverage_v1            | model_code
169: 02_model_code_column_inventory | aiworker     | vw_robot_readable_brain_runtime_material_v1                     | model_code
170: 02_model_code_column_inventory | aiworker     | vw_robot_readable_brain_runtime_material_v2                     | model_code
171: 02_model_code_column_inventory | aiworker     | vw_robot_readable_brain_runtime_material_v3                     | model_code
172: 02_model_code_column_inventory | aiworker     | vw_robot_readable_brain_source_registry_v1                      | model_code
173: 02_model_code_column_inventory | aiworker     | vw_worker_dialog_style_control                                  | model_code
174: 02_model_code_column_inventory | aiworker     | vw_worker_dialog_style_control                                  | model_no
175: 02_model_code_column_inventory | aiworker     | vw_worker_dialog_topic_bias                                     | model_code
176: 02_model_code_column_inventory | aiworker     | vw_worker_dialog_topic_bias                                     | model_no
177: 02_model_code_column_inventory | aiworker     | vw_worker_series_lineup                                         | model_code
178: 02_model_code_column_inventory | aiworker     | vw_worker_series_lineup                                         | model_no
179: 02_model_code_column_inventory | aiworker     | vw_worker_series_search_lineup                                  | model_code
180: 02_model_code_column_inventory | aiworker     | vw_worker_series_search_lineup                                  | model_no
181: 02_model_code_column_inventory | aiworker     | worker_model_capability_profile                                 | model_code
182: 02_model_code_column_inventory | aiworker     | worker_model_catalog                                            | model_code
183: 02_model_code_column_inventory | aiworker     | worker_model_catalog                                            | model_no
184: 02_model_code_column_inventory | aiworker     | worker_model_extension_catalog                                  | model_code
185: 02_model_code_column_inventory | aiworker     | worker_model_extension_catalog                                  | model_no
186: 02_model_code_column_inventory | business     | aicm_user_company_department                                    | manager_aiworker_model_code
187: 02_model_code_column_inventory | business     | aicm_user_company_section                                       | leader_aiworker_model_code
188: 02_model_code_column_inventory | business     | aicm_user_company_worker_placement                              | aiworker_model_code
189: 02_model_code_column_inventory | business     | aicm_worker_work_unit                                           | worker_model_code
190: 02_model_code_column_inventory | business     | company_robot_entitlement                                       | aiworker_model_code
191: 02_model_code_column_inventory | business     | company_robot_placement                                         | aiworker_model_code
192: 02_model_code_column_inventory | business     | robot_pool                                                      | aiworker_model_code
193: 02_model_code_column_inventory | business     | robot_pool_sync_ledger                                          | aiworker_model_code
194: 02_model_code_column_inventory | business     | v_worker_rental_contract_summary                                | aiworker_model_code
195: 02_model_code_column_inventory | business     | vw_ai_company_manager_system_robot_selector_options             | aiworker_model_code
196: 02_model_code_column_inventory | business     | vw_aicm_company_robot_active_assignment_display                 | aiworker_model_code
197: 02_model_code_column_inventory | business     | vw_aicm_company_robot_assignment_display                        | aiworker_model_code
198: 02_model_code_column_inventory | business     | vw_aicm_pmlw_worker_work_unit_display                           | worker_model_code
199: 02_model_code_column_inventory | business     | vw_aicm_screen_robot_route_definition                           | default_model_code
200: 02_model_code_column_inventory | business     | vw_aicm_user_company_worker_placement_display                   | aiworker_model_code
201: 02_model_code_column_inventory | business     | vw_business_robot_pool_status                                   | aiworker_model_code
202: 02_model_code_column_inventory | business     | vw_business_robot_selector_options                              | aiworker_model_code
203: 02_model_code_column_inventory | business     | vw_company_robot_placement_display                              | aiworker_model_code
204: 02_model_code_column_inventory | business     | vw_company_robot_placement_status                               | aiworker_model_code
205: 02_model_code_column_inventory | business     | vw_company_robot_selector_options                               | aiworker_model_code
206: 02_model_code_column_inventory | business     | worker_rental_contract                                          | aiworker_model_code
207: 02_model_code_column_inventory | cx22073jw    | robot_model_role_reference_binding                              | model_code
208: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_civilization_exam_reference_v1                   | model_code
209: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_civilization_foundation_history_detail_reference | model_code
210: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_cx_reference_coverage_v1                         | model_code
211: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_earth_history_detail_reference_v1                | model_code
212: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_foundation_material_reference_v1                 | model_code
213: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_full_reference_v1                                | aiworker_model_code
214: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_full_reference_v2                                | aiworker_model_code
215: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_full_reference_v3                                | model_code
216: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_history_detail_coverage_v1                       | model_code
217: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_history_detail_unified_reference_v1              | model_code
218: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_history_exam_unified_reference_v1                | model_code
219: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_history_reference_v1                             | model_code
220: 02_model_code_column_inventory | cx22073jw    | vw_robot_model_role_knowledge_reference_v1                      | model_code
221: 02_model_code_column_inventory | cx22073jw    | vw_robot_personality_reference_v1                               | aiworker_model_code
222: 02_model_code_column_inventory | cx22073jw    | vw_robot_public_profile_reference_v1                            | aiworker_model_code
230: 03_likely_model_registry_tables | aiworker     | model_identity_spec
231: 03_likely_model_registry_tables | aiworker     | model_public_registry
232: 03_likely_model_registry_tables | aiworker     | model_runtime_control_override
233: 03_likely_model_registry_tables | aiworker     | president_model_catalog
234: 03_likely_model_registry_tables | aiworker     | robot_model_capability_profile
235: 03_likely_model_registry_tables | aiworker     | robot_model_code_deprecation_map
236: 03_likely_model_registry_tables | aiworker     | worker_model_catalog
237: 03_likely_model_registry_tables | aiworker     | worker_model_extension_catalog
249: 04_model_public_registry_sample | {"model_no": "BYD2-001", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_001_asic_leader1", "model_name": "ASIC Leader1", "sort_order": 3110, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader1", "registry_code": "asic_byd2_001", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "基本進行・形式チェックレベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "1.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "タスク分解、進行確認、形式チェックを行う。", "personality_summary_ja": "", "recommended_usage_jsonb": ["小規模作業", "単純なWorker成果物確認", "形式チェック中心のレビュー"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
250: 04_model_public_registry_sample | {"model_no": "BYD2-002", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_002_asic_leader2", "model_name": "ASIC Leader2", "sort_order": 3120, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader2", "registry_code": "asic_byd2_002", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "品質レビュー・整合性確認レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "2.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "成果物の品質、差し戻し、整合性確認を強化する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["提案書", "調査資料", "要約", "ヘルプデスク回答", "複数Worker成果物の確認"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
251: 04_model_public_registry_sample | {"model_no": "BYD2-003", "created_at": "2026-04-28T03:07:08.076126+00:00", "model_code": "byd2_003_asic_leader3", "model_name": "ASIC Leader3", "sort_order": 3130, "updated_at": "2026-04-28T03:07:08.076126+00:00", "series_code": "beyond_series", "series_name": "Beyond Series", "status_code": "active", "model_name_ja": "ASIC Leader3", "registry_code": "asic_byd2_003", "safety_note_ja": "管理機数ではなく、仕事品質レベルで差別化する。", "series_name_ja": "Beyondシリーズ", "role_layer_code": "LEADER", "manufacturer_code": "asic", "manufacturer_name": "ASIC", "public_summary_ja": "統合設計・リスク判断・納品品質統括レベルのBeyondリーダー。", "source_layer_code": "registry_restore_after_hd_r2", "role_layer_name_ja": "リーダー", "model_category_code": "proactive_business_leader", "public_traits_jsonb": {"quality_level": "3.0"}, "manufacturer_name_ja": "ASIC", "capability_summary_ja": "複雑案件を構造化し、統合設計、リスク判断、納品品質を統括する。", "personality_summary_ja": "", "recommended_usage_jsonb": ["事業計画", "PG開発方針", "複数分野横断資料", "大きめのプロジェクト", "納品前統合判断"], "app_reference_allowed_flag": true, "public_display_allowed_flag": true}
261:               section                | model_code | row_count 
263: 05_runtime_material_model_code_shape | BYD2-003   |      1070
269:               section               |  app_surface_code  |      model_code       | row_count 
271: 06_runtime_request_model_code_shape | ai_company_manager | byd2_003_asic_leader3 |         2
279: 07_current_blocker_confirmation | runtime material uses public code BYD2-003, runtime request may use internal normalized code byd2_003_asic_leader3
```

## Design doc
```
# Model Code Canon Design / R29C

## Problem

同じ `model_code` という名前で、少なくとも2種類の意味が混在している。

- `BYD2-003`
  - 公開型番 / public model code
  - CX22073JW runtime material view 側で使われている
- `byd2_003_asic_leader3`
  - runtime / app / internal normalized model code
  - runtime request payload や実行制御側で使われることがある

この状態で `server.js` に個別aliasを書くと、機種が増えるたびに決め打ちが増える。

## Canonical direction

DB側に識別子対応の正本を持つ。

### 推奨カラム意味

- `public_model_code`
  - BYD2-003 / HD-R5P / MG-NORN-001 など
  - カタログ、公開表示、CX参照素材、外部説明に使う

- `runtime_model_code`
  - byd2_003_asic_leader3 など
  - アプリ内部、runtime execution、control profile、正規化キーに使う

- `series_code`
  - Beyond / HD / MEGAMI / LoVerS など

- `model_identifier_kind`
  - public_model_code
  - runtime_model_code
  - legacy_model_code
  - alias

## Recommended implementation

1. 既存テーブルで対応表を持てるか確認
2. 既存に正本候補がなければ、add-onlyで `aiworker.model_code_alias_resolver` のような中立テーブルを追加
3. `server.js` は決め打ちaliasを持たず、DB resolver view/functionを読む
4. CX material fetchは、入力された `model_code` を resolver で public_model_code へ解決してから view を引く

## Do not

- server.js に `byd2_003_asic_leader3 -> BYD2-003` のような個別決め打ちを残さない
- 既存DB値を破壊的にUPDATEしない
- AICompanyManager側で補正しない
```

## Not executed SQL draft
```sql
-- ============================================================
-- NOT EXECUTED
-- Draft only: model code alias resolver
-- Requires Sato(DB担当) review before apply.
-- ============================================================

-- 方針:
-- - 既存正本テーブルで対応できない場合のみ新規追加
-- - server.jsの決め打ちaliasを廃止し、DB-driven resolverへ移行する
-- - これはドラフト。まだ実行しない。

-- CREATE TABLE aiworker.model_code_alias_resolver (
--   alias_code text PRIMARY KEY,
--   canonical_public_model_code text NOT NULL,
--   canonical_runtime_model_code text,
--   alias_kind_code text NOT NULL DEFAULT 'alias',
--   series_code text,
--   model_family_code text,
--   active_flag boolean NOT NULL DEFAULT true,
--   note_ja text NOT NULL DEFAULT '',
--   created_at timestamptz NOT NULL DEFAULT now(),
--   updated_at timestamptz NOT NULL DEFAULT now()
-- );

-- INSERT INTO aiworker.model_code_alias_resolver (
--   alias_code,
--   canonical_public_model_code,
--   canonical_runtime_model_code,
--   alias_kind_code,
--   series_code,
--   model_family_code,
--   note_ja
-- ) VALUES
-- (
--   'byd2_003_asic_leader3',
--   'BYD2-003',
--   'byd2_003_asic_leader3',
--   'runtime_model_code',
--   'Beyond',
--   'BYD2',
--   'Runtime normalized code maps to public model code used by CX runtime material views.'
-- )
-- ON CONFLICT (alias_code) DO UPDATE
-- SET
--   canonical_public_model_code = EXCLUDED.canonical_public_model_code,
--   canonical_runtime_model_code = EXCLUDED.canonical_runtime_model_code,
--   alias_kind_code = EXCLUDED.alias_kind_code,
--   series_code = EXCLUDED.series_code,
--   model_family_code = EXCLUDED.model_family_code,
--   note_ja = EXCLUDED.note_ja,
--   active_flag = true,
--   updated_at = now();

-- CREATE OR REPLACE VIEW aiworker.vw_model_code_alias_resolver_v1 AS
-- SELECT
--   alias_code,
--   canonical_public_model_code,
--   canonical_runtime_model_code,
--   alias_kind_code,
--   series_code,
--   model_family_code,
--   active_flag,
--   note_ja
-- FROM aiworker.model_code_alias_resolver
-- WHERE active_flag = true;
```

## Ready probe
```
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
Date: Fri, 08 May 2026 23:03:23 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{
  "result": "error",
  "error_code": "UNAUTHORIZED",
  "message": "Missing or invalid Authorization bearer token."
}
```

## AICM touch check
```
AICM_BASE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
```

## Runtime touch check
```
AIWORKER_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os
/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
```

## Secret scan
```
Scan generated files only
```

FINAL_STATUS=B6R95R3Z_R29C_ROLLBACK_AND_DB_CANON_AUDIT_PASS_REVIEW_REQUIRED
NEXT=佐藤レビュー後、既存正本テーブルで足りるか判断。足りなければadd-onlyでDB resolverを作成し、server.jsはDB-driven resolverに置換。
