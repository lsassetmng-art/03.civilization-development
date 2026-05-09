# Runtime Control Profile Audit Summary

## Current blocker

```
Runtime control profile not found:
app_surface_code=cx22073jw_direct_smoke
model_code=BYD2-003
```

## Read-only audit hints

### Candidate app_surface_code/model_code pairs

```
7:     section     | missing_app_surface_code | missing_model_code |           error_reason            
9: 01_target_error | cx22073jw_direct_smoke   | BYD2-003           | Runtime control profile not found
14: 02_functions | aiworker    | fn_runtime_execution_create_request               | p_app_surface_code text, p_model_code text, p_task_domain_code text, p_task_title text, p_task_instruction_ja text, p_source_app_ref text, p_source_request_ref text, p_requested_by_ref text, p_idempotency_key text
15: 02_functions | aiworker    | fn_runtime_execution_create_request_with_route_v1 | p_app_surface_code text, p_model_code text, p_task_domain_code text, p_task_title text, p_task_instruction_ja text, p_source_app_ref text, p_source_request_ref text, p_requested_by_ref text, p_idempotency_key text, p_source_route_code text
16: 02_functions | aiworker    | fn_runtime_execution_mark_delivery_ready          | p_request_id uuid, p_delivery_title_ja text, p_delivery_summary_ja text, p_human_go_confirmed_flag boolean, p_delivery_payload_jsonb jsonb
17: 02_functions | aiworker    | fn_runtime_execution_record_transition            | p_request_id uuid, p_to_status_code text, p_transition_type_code text, p_transition_summary_ja text, p_transition_detail_jsonb jsonb
18: 02_functions | aiworker    | fn_runtime_execution_start_request                | p_request_id uuid
19: 02_functions | aiworker    | fn_runtime_execution_submit_leader_review         | p_request_id uuid, p_review_result_code text, p_review_summary_ja text, p_review_detail_jsonb jsonb
20: 02_functions | aiworker    | fn_runtime_execution_submit_manager_gate          | p_request_id uuid, p_gate_result_code text, p_gate_summary_ja text, p_gate_detail_jsonb jsonb
21: 02_functions | aiworker    | fn_runtime_execution_submit_president_approval    | p_request_id uuid, p_approval_result_code text, p_approval_summary_ja text, p_approval_detail_jsonb jsonb
22: 02_functions | aiworker    | fn_runtime_execution_submit_worker_output         | p_request_id uuid, p_output_title_ja text, p_output_body_ja text, p_output_summary_ja text, p_output_payload_jsonb jsonb, p_artifacts_jsonb jsonb
27: 03_tables_with_profile_surface_model_columns | aiworker     | app_read_surface_contract                                       | app_surface_code
28: 03_tables_with_profile_surface_model_columns | aiworker     | app_runtime_control_policy                                      | app_surface_code, app_surface_name_ja
29: 03_tables_with_profile_surface_model_columns | aiworker     | beyond_model_quality_profile                                    | model_code
30: 03_tables_with_profile_surface_model_columns | aiworker     | brain_runtime_selection_smoke_case_catalog                      | model_code
31: 03_tables_with_profile_surface_model_columns | aiworker     | business_support_role_domain_capability                         | task_domain_code
32: 03_tables_with_profile_surface_model_columns | aiworker     | business_support_standard_reference                             | applies_to_task_domain_code
33: 03_tables_with_profile_surface_model_columns | aiworker     | business_support_task_domain                                    | task_domain_id, task_domain_code, task_domain_name, task_domain_name_ja
34: 03_tables_with_profile_surface_model_columns | aiworker     | control_policy_package                                          | model_code
35: 03_tables_with_profile_surface_model_columns | aiworker     | conversation_profile                                            | model_code
36: 03_tables_with_profile_surface_model_columns | aiworker     | internal_pipeline_acceptance_package                            | president_model_code
37: 03_tables_with_profile_surface_model_columns | aiworker     | leader_mock_review                                              | task_domain_code
38: 03_tables_with_profile_surface_model_columns | aiworker     | learning_delta_log                                              | model_code
39: 03_tables_with_profile_surface_model_columns | aiworker     | manager_instruction_plan                                        | task_domain_code
40: 03_tables_with_profile_surface_model_columns | aiworker     | manager_instruction_task                                        | task_domain_code
41: 03_tables_with_profile_surface_model_columns | aiworker     | manager_mock_final_gate                                         | task_domain_code
42: 03_tables_with_profile_surface_model_columns | aiworker     | manager_work_instruction                                        | task_domain_code
43: 03_tables_with_profile_surface_model_columns | aiworker     | megami_model_profile                                            | model_code
44: 03_tables_with_profile_surface_model_columns | aiworker     | model_identity_spec                                             | model_code
45: 03_tables_with_profile_surface_model_columns | aiworker     | model_public_appearance_profile                                 | model_code
46: 03_tables_with_profile_surface_model_columns | aiworker     | model_public_registry                                           | model_code
47: 03_tables_with_profile_surface_model_columns | aiworker     | model_runtime_control_override                                  | model_code
48: 03_tables_with_profile_surface_model_columns | aiworker     | model_service_assignment                                        | model_code
49: 03_tables_with_profile_surface_model_columns | aiworker     | model_style_assignment                                          | model_code
50: 03_tables_with_profile_surface_model_columns | aiworker     | president_capability_gate                                       | president_model_code
51: 03_tables_with_profile_surface_model_columns | aiworker     | president_manager_instruction_bridge                            | president_model_code
52: 03_tables_with_profile_surface_model_columns | aiworker     | president_model_catalog                                         | president_model_code, model_code
53: 03_tables_with_profile_surface_model_columns | aiworker     | president_runtime_activation_gate_log                           | president_model_code
54: 03_tables_with_profile_surface_model_columns | aiworker     | president_runtime_control                                       | president_model_code
55: 03_tables_with_profile_surface_model_columns | aiworker     | public_activity_profile                                         | model_code
56: 03_tables_with_profile_surface_model_columns | aiworker     | public_metric                                                   | model_code
57: 03_tables_with_profile_surface_model_columns | aiworker     | robot_brain_model_domain_policy                                 | model_code
58: 03_tables_with_profile_surface_model_columns | aiworker     | robot_brain_model_profile                                       | model_code
59: 03_tables_with_profile_surface_model_columns | aiworker     | robot_brain_personality_exception_policy                        | model_code
60: 03_tables_with_profile_surface_model_columns | aiworker     | robot_brain_reference_tier_policy                               | model_code
61: 03_tables_with_profile_surface_model_columns | aiworker     | robot_breadth_domain_runtime_policy                             | model_code
62: 03_tables_with_profile_surface_model_columns | aiworker     | robot_chatstyle_profile_policy                                  | model_code
63: 03_tables_with_profile_surface_model_columns | aiworker     | robot_model_capability_profile                                  | model_code
64: 03_tables_with_profile_surface_model_columns | aiworker     | robot_model_code_deprecation_map                                | old_model_code, new_model_code
65: 03_tables_with_profile_surface_model_columns | aiworker     | robot_model_personality_profile                                 | aiworker_model_code
66: 03_tables_with_profile_surface_model_columns | aiworker     | robot_model_public_profile                                      | aiworker_model_code
67: 03_tables_with_profile_surface_model_columns | aiworker     | runtime_execution_app_api_contract                              | api_surface_code
68: 03_tables_with_profile_surface_model_columns | aiworker     | runtime_execution_request                                       | app_surface_code, app_surface_name_ja, model_code, task_domain_code
69: 03_tables_with_profile_surface_model_columns | aiworker     | smalltalk_profile                                               | model_code
70: 03_tables_with_profile_surface_model_columns | aiworker     | vw_ai_company_beyond_candidate_lineup_v1                        | model_code
71: 03_tables_with_profile_surface_model_columns | aiworker     | vw_ai_company_beyond_candidate_quality_lineup_v1                | model_code
72: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_internal_pipeline_dashboard_v1                  | president_model_code
73: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_internal_pipeline_plan_detail_v1                | task_domain_code
74: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_model_capability_overlay_v1                     | model_code
75: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_model_selection_capability_card_v1              | model_code
76: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_model_selection_directory_v1                    | model_code
77: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_model_selection_source_for_capability_v1        | model_code
78: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_read_surface_contract_v1                        | app_surface_code
79: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_robot_selection_card_v1                         | model_code
80: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_control_profile_v1                      | app_surface_code, app_surface_name_ja, model_code
81: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_control_prompt_fragment_v1              | app_surface_code, model_code
82: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_delivery_board_v1                       | app_surface_code, model_code, task_domain_code
83: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_execution_api_contract_v1               | api_surface_code
84: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_execution_app_read_payload_v1           | app_surface_code, app_surface_name_ja, model_code, task_domain_code
85: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_execution_gate_board_v1                 | app_surface_code, model_code, task_domain_code
86: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_execution_persistent_smoke_board_v1     | app_surface_code, app_surface_name_ja, model_code, task_domain_code
87: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_execution_request_board_v1              | app_surface_code, app_surface_name_ja, model_code, task_domain_code
88: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_full_pipeline_board_v1                  | app_surface_code, app_surface_name_ja, model_code, task_domain_code
89: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_handoff_packet_board_v1                 | app_surface_code, model_code, task_domain_code
90: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_leader_review_board_v1                  | app_surface_code, model_code, task_domain_code
91: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_manager_gate_board_v1                   | app_surface_code, model_code, task_domain_code
92: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_president_approval_board_v1             | app_surface_code, model_code, task_domain_code
93: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_worker_output_board_v1                  | app_surface_code, model_code, task_domain_code
94: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_megami_candidate_lineup_v1                               | model_code
95: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_megami_norn_three_sisters_lineup_with_body_v1            | model_code
96: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_leader_lineup_v1                               | model_code
97: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_leader_quality_lineup_v1                       | model_code
98: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_lineup_v1                                      | model_code
99: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_quality_lineup_v1                              | model_code
100: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_worker_lineup_v1                               | model_code
101: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_worker_quality_lineup_v1                       | model_code
102: 03_tables_with_profile_surface_model_columns | aiworker     | vw_brain_runtime_selection_smoke_board_v1                       | model_code
103: 03_tables_with_profile_surface_model_columns | aiworker     | vw_core_registration_domain_capability_v1                       | task_domain_code, task_domain_name_ja
104: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_knowledge_reference                                   | model_code
105: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_policy_package_directory                              | model_code
106: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_profile_catalog                                       | model_code
107: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_profile_step_catalog                                  | model_code
108: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_redirect_template_catalog                             | model_code
109: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_reference_scope_catalog                               | model_code
110: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_rule_catalog                                          | model_code
111: 03_tables_with_profile_surface_model_columns | aiworker     | vw_leader_mock_review_board_v1                                  | task_domain_code
112: 03_tables_with_profile_surface_model_columns | aiworker     | vw_manager_instruction_acceptance_board_v1                      | task_domain_code
113: 03_tables_with_profile_surface_model_columns | aiworker     | vw_manager_instruction_assignment_board_v1                      | task_domain_code
114: 03_tables_with_profile_surface_model_columns | aiworker     | vw_manager_instruction_plan_board_v1                            | task_domain_code
115: 03_tables_with_profile_surface_model_columns | aiworker     | vw_manager_mock_final_gate_board_v1                             | task_domain_code
116: 03_tables_with_profile_surface_model_columns | aiworker     | vw_megami_friend_lover_selection_card_v1                        | model_code
117: 03_tables_with_profile_surface_model_columns | aiworker     | vw_megami_norn_three_sisters_appearance_profile_v1              | model_code
118: 03_tables_with_profile_surface_model_columns | aiworker     | vw_megami_series_lineup_v1                                      | model_code
119: 03_tables_with_profile_surface_model_columns | aiworker     | vw_megami_worker_temporal_focus_v1                              | model_code
120: 03_tables_with_profile_surface_model_columns | aiworker     | vw_model_growth_delta_summary                                   | model_code
121: 03_tables_with_profile_surface_model_columns | aiworker     | vw_model_public_directory_v1                                    | model_code
122: 03_tables_with_profile_surface_model_columns | aiworker     | vw_model_public_profile                                         | model_code
123: 03_tables_with_profile_surface_model_columns | aiworker     | vw_model_style_profile                                          | model_code
124: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_capability_gate_v1                                 | president_model_code
125: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_catalog_summary_v1                                 | president_model_code
126: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_hd_r5p_catalog_summary_v1                          | president_model_code, model_code
127: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_manager_instruction_bridge_board_v1                | president_model_code, task_domain_code
128: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_manager_instruction_candidate_v1                   | president_model_code, task_domain_code
129: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_manager_instruction_waiting_v1                     | president_model_code, task_domain_code
130: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_runtime_gate_v1                                    | president_model_code
131: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_wlm_internal_pipeline_acceptance_metrics_v1        | president_model_code
132: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_wlm_internal_pipeline_acceptance_summary_v1        | president_model_code
133: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_brain_compact_context_v1                               | model_code
134: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_brain_effective_access_v1                              | model_code
135: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_brain_runtime_material_quality_overlay_v1              | model_code
136: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_brain_runtime_material_scoring_base_v1                 | model_code
137: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_model_capability_public_v1                             | model_code
138: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_knowledge_material_v1                   | model_code
139: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_runtime_material_coverage_v1            | model_code
140: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_runtime_material_v1                     | model_code
141: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_runtime_material_v2                     | model_code
142: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_runtime_material_v3                     | model_code
143: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_source_registry_v1                      | model_code
144: 03_tables_with_profile_surface_model_columns | aiworker     | vw_wlm_execution_pipeline_board_v1                              | task_domain_code
145: 03_tables_with_profile_surface_model_columns | aiworker     | vw_worker_dialog_style_control                                  | model_code
146: 03_tables_with_profile_surface_model_columns | aiworker     | vw_worker_dialog_topic_bias                                     | model_code
147: 03_tables_with_profile_surface_model_columns | aiworker     | vw_worker_mock_output_board_v1                                  | task_domain_code
148: 03_tables_with_profile_surface_model_columns | aiworker     | vw_worker_series_lineup                                         | model_code
149: 03_tables_with_profile_surface_model_columns | aiworker     | vw_worker_series_search_lineup                                  | model_code
150: 03_tables_with_profile_surface_model_columns | aiworker     | worker_mock_output                                              | task_domain_code
151: 03_tables_with_profile_surface_model_columns | aiworker     | worker_model_capability_profile                                 | model_code
152: 03_tables_with_profile_surface_model_columns | aiworker     | worker_model_catalog                                            | model_code
153: 03_tables_with_profile_surface_model_columns | aiworker     | worker_model_extension_catalog                                  | model_code
154: 03_tables_with_profile_surface_model_columns | business     | aicm_user_company_department                                    | manager_aiworker_model_code
155: 03_tables_with_profile_surface_model_columns | business     | aicm_user_company_section                                       | leader_aiworker_model_code
156: 03_tables_with_profile_surface_model_columns | business     | aicm_user_company_worker_placement                              | aiworker_model_code
157: 03_tables_with_profile_surface_model_columns | business     | aicm_worker_work_unit                                           | worker_model_code
158: 03_tables_with_profile_surface_model_columns | business     | company_robot_entitlement                                       | aiworker_model_code
159: 03_tables_with_profile_surface_model_columns | business     | company_robot_placement                                         | aiworker_model_code
160: 03_tables_with_profile_surface_model_columns | business     | robot_pool                                                      | aiworker_model_code
161: 03_tables_with_profile_surface_model_columns | business     | robot_pool_sync_ledger                                          | aiworker_model_code
162: 03_tables_with_profile_surface_model_columns | business     | v_worker_rental_contract_summary                                | aiworker_model_code
163: 03_tables_with_profile_surface_model_columns | business     | vw_ai_company_manager_system_robot_selector_options             | aiworker_model_code
164: 03_tables_with_profile_surface_model_columns | business     | vw_aicm_company_robot_active_assignment_display                 | aiworker_model_code
165: 03_tables_with_profile_surface_model_columns | business     | vw_aicm_company_robot_assignment_display                        | aiworker_model_code
166: 03_tables_with_profile_surface_model_columns | business     | vw_aicm_pmlw_worker_work_unit_display                           | worker_model_code
167: 03_tables_with_profile_surface_model_columns | business     | vw_aicm_screen_robot_route_definition                           | default_model_code
168: 03_tables_with_profile_surface_model_columns | business     | vw_aicm_user_company_worker_placement_display                   | aiworker_model_code
169: 03_tables_with_profile_surface_model_columns | business     | vw_business_robot_pool_status                                   | aiworker_model_code
170: 03_tables_with_profile_surface_model_columns | business     | vw_business_robot_selector_options                              | aiworker_model_code
171: 03_tables_with_profile_surface_model_columns | business     | vw_company_robot_placement_display                              | aiworker_model_code
172: 03_tables_with_profile_surface_model_columns | business     | vw_company_robot_placement_status                               | aiworker_model_code
173: 03_tables_with_profile_surface_model_columns | business     | vw_company_robot_selector_options                               | aiworker_model_code
174: 03_tables_with_profile_surface_model_columns | business     | worker_rental_contract                                          | aiworker_model_code
175: 03_tables_with_profile_surface_model_columns | cx22073jw    | robot_model_role_reference_binding                              | model_code
176: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_civilization_exam_reference_v1                   | model_code
177: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_civilization_foundation_history_detail_reference | model_code
178: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_cx_reference_coverage_v1                         | model_code
179: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_earth_history_detail_reference_v1                | model_code
180: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_foundation_material_reference_v1                 | model_code
181: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_full_reference_v1                                | aiworker_model_code
182: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_full_reference_v2                                | aiworker_model_code
183: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_full_reference_v3                                | model_code
184: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_history_detail_coverage_v1                       | model_code
185: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_history_detail_unified_reference_v1              | model_code
186: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_history_exam_unified_reference_v1                | model_code
187: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_history_reference_v1                             | model_code
188: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_role_knowledge_reference_v1                      | model_code
189: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_personality_reference_v1                               | aiworker_model_code
190: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_public_profile_reference_v1                            | aiworker_model_code
195: 04_candidate_tables_exact_app_surface_and_model | aiworker     | runtime_execution_request
196: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_control_profile_v1
197: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_control_prompt_fragment_v1
198: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_delivery_board_v1
199: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_execution_app_read_payload_v1
200: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_execution_gate_board_v1
201: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_execution_persistent_smoke_board_v1
202: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_execution_request_board_v1
203: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_full_pipeline_board_v1
204: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_handoff_packet_board_v1
205: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_leader_review_board_v1
206: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_manager_gate_board_v1
207: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_president_approval_board_v1
208: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_worker_output_board_v1
214:        section         |             table_name             |    app_surface_code    |       model_code       | row_count 
216: 05_profile_pair_sample | aiworker.runtime_execution_request | ai_company_manager     | byd1_003_asic_workers3 |        40
217: 05_profile_pair_sample | aiworker.runtime_execution_request | ai_company_manager     | hd_r3_worker           |         2
218: 05_profile_pair_sample | aiworker.runtime_execution_request | ai_company_manager     | mg_norn_001_urd        |         6
219: 05_profile_pair_sample | aiworker.runtime_execution_request | pg_development_support | byd1_003_asic_workers3 |         2
222:        section         |                     table_name                      |  app_surface_code  |       model_code       | row_count 
224: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd1_001_asic_workers1 |         1
225: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd1_002_asic_workers2 |         1
226: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd1_003_asic_workers3 |         1
227: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd2_001_asic_leader1  |         1
228: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd2_002_asic_leader2  |         1
229: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd2_003_asic_leader3  |         1
230: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r1_helper           |         1
231: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r1a_lover           |         1
232: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r1c_friend          |         1
233: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r2_battler          |         1
234: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r2g_general         |         1
235: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r2s_sniper          |         1
236: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r2t0_origin         |         1
237: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r3_worker           |         1
238: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r4_leader           |         1
239: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r5_manager          |         1
240: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r5p_president       |         1
241: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_01            |         1
242: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_02            |         1
243: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_03            |         1
244: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_04            |         1
245: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_05            |         1
246: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_06            |         1
247: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_07            |         1
248: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_08            |         1
```

### BYD2-003 candidate rows

```
7:     section     | missing_app_surface_code | missing_model_code |           error_reason            
9: 01_target_error | cx22073jw_direct_smoke   | BYD2-003           | Runtime control profile not found
14: 02_functions | aiworker    | fn_runtime_execution_create_request               | p_app_surface_code text, p_model_code text, p_task_domain_code text, p_task_title text, p_task_instruction_ja text, p_source_app_ref text, p_source_request_ref text, p_requested_by_ref text, p_idempotency_key text
15: 02_functions | aiworker    | fn_runtime_execution_create_request_with_route_v1 | p_app_surface_code text, p_model_code text, p_task_domain_code text, p_task_title text, p_task_instruction_ja text, p_source_app_ref text, p_source_request_ref text, p_requested_by_ref text, p_idempotency_key text, p_source_route_code text
27: 03_tables_with_profile_surface_model_columns | aiworker     | app_read_surface_contract                                       | app_surface_code
28: 03_tables_with_profile_surface_model_columns | aiworker     | app_runtime_control_policy                                      | app_surface_code, app_surface_name_ja
29: 03_tables_with_profile_surface_model_columns | aiworker     | beyond_model_quality_profile                                    | model_code
30: 03_tables_with_profile_surface_model_columns | aiworker     | brain_runtime_selection_smoke_case_catalog                      | model_code
31: 03_tables_with_profile_surface_model_columns | aiworker     | business_support_role_domain_capability                         | task_domain_code
32: 03_tables_with_profile_surface_model_columns | aiworker     | business_support_standard_reference                             | applies_to_task_domain_code
33: 03_tables_with_profile_surface_model_columns | aiworker     | business_support_task_domain                                    | task_domain_id, task_domain_code, task_domain_name, task_domain_name_ja
34: 03_tables_with_profile_surface_model_columns | aiworker     | control_policy_package                                          | model_code
35: 03_tables_with_profile_surface_model_columns | aiworker     | conversation_profile                                            | model_code
36: 03_tables_with_profile_surface_model_columns | aiworker     | internal_pipeline_acceptance_package                            | president_model_code
37: 03_tables_with_profile_surface_model_columns | aiworker     | leader_mock_review                                              | task_domain_code
38: 03_tables_with_profile_surface_model_columns | aiworker     | learning_delta_log                                              | model_code
39: 03_tables_with_profile_surface_model_columns | aiworker     | manager_instruction_plan                                        | task_domain_code
40: 03_tables_with_profile_surface_model_columns | aiworker     | manager_instruction_task                                        | task_domain_code
41: 03_tables_with_profile_surface_model_columns | aiworker     | manager_mock_final_gate                                         | task_domain_code
42: 03_tables_with_profile_surface_model_columns | aiworker     | manager_work_instruction                                        | task_domain_code
43: 03_tables_with_profile_surface_model_columns | aiworker     | megami_model_profile                                            | model_code
44: 03_tables_with_profile_surface_model_columns | aiworker     | model_identity_spec                                             | model_code
45: 03_tables_with_profile_surface_model_columns | aiworker     | model_public_appearance_profile                                 | model_code
46: 03_tables_with_profile_surface_model_columns | aiworker     | model_public_registry                                           | model_code
47: 03_tables_with_profile_surface_model_columns | aiworker     | model_runtime_control_override                                  | model_code
48: 03_tables_with_profile_surface_model_columns | aiworker     | model_service_assignment                                        | model_code
49: 03_tables_with_profile_surface_model_columns | aiworker     | model_style_assignment                                          | model_code
50: 03_tables_with_profile_surface_model_columns | aiworker     | president_capability_gate                                       | president_model_code
51: 03_tables_with_profile_surface_model_columns | aiworker     | president_manager_instruction_bridge                            | president_model_code
52: 03_tables_with_profile_surface_model_columns | aiworker     | president_model_catalog                                         | president_model_code, model_code
53: 03_tables_with_profile_surface_model_columns | aiworker     | president_runtime_activation_gate_log                           | president_model_code
54: 03_tables_with_profile_surface_model_columns | aiworker     | president_runtime_control                                       | president_model_code
55: 03_tables_with_profile_surface_model_columns | aiworker     | public_activity_profile                                         | model_code
56: 03_tables_with_profile_surface_model_columns | aiworker     | public_metric                                                   | model_code
57: 03_tables_with_profile_surface_model_columns | aiworker     | robot_brain_model_domain_policy                                 | model_code
58: 03_tables_with_profile_surface_model_columns | aiworker     | robot_brain_model_profile                                       | model_code
59: 03_tables_with_profile_surface_model_columns | aiworker     | robot_brain_personality_exception_policy                        | model_code
60: 03_tables_with_profile_surface_model_columns | aiworker     | robot_brain_reference_tier_policy                               | model_code
61: 03_tables_with_profile_surface_model_columns | aiworker     | robot_breadth_domain_runtime_policy                             | model_code
62: 03_tables_with_profile_surface_model_columns | aiworker     | robot_chatstyle_profile_policy                                  | model_code
63: 03_tables_with_profile_surface_model_columns | aiworker     | robot_model_capability_profile                                  | model_code
64: 03_tables_with_profile_surface_model_columns | aiworker     | robot_model_code_deprecation_map                                | old_model_code, new_model_code
65: 03_tables_with_profile_surface_model_columns | aiworker     | robot_model_personality_profile                                 | aiworker_model_code
66: 03_tables_with_profile_surface_model_columns | aiworker     | robot_model_public_profile                                      | aiworker_model_code
67: 03_tables_with_profile_surface_model_columns | aiworker     | runtime_execution_app_api_contract                              | api_surface_code
68: 03_tables_with_profile_surface_model_columns | aiworker     | runtime_execution_request                                       | app_surface_code, app_surface_name_ja, model_code, task_domain_code
69: 03_tables_with_profile_surface_model_columns | aiworker     | smalltalk_profile                                               | model_code
70: 03_tables_with_profile_surface_model_columns | aiworker     | vw_ai_company_beyond_candidate_lineup_v1                        | model_code
71: 03_tables_with_profile_surface_model_columns | aiworker     | vw_ai_company_beyond_candidate_quality_lineup_v1                | model_code
72: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_internal_pipeline_dashboard_v1                  | president_model_code
73: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_internal_pipeline_plan_detail_v1                | task_domain_code
74: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_model_capability_overlay_v1                     | model_code
75: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_model_selection_capability_card_v1              | model_code
76: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_model_selection_directory_v1                    | model_code
77: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_model_selection_source_for_capability_v1        | model_code
78: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_read_surface_contract_v1                        | app_surface_code
79: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_robot_selection_card_v1                         | model_code
80: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_control_profile_v1                      | app_surface_code, app_surface_name_ja, model_code
81: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_control_prompt_fragment_v1              | app_surface_code, model_code
82: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_delivery_board_v1                       | app_surface_code, model_code, task_domain_code
83: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_execution_api_contract_v1               | api_surface_code
84: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_execution_app_read_payload_v1           | app_surface_code, app_surface_name_ja, model_code, task_domain_code
85: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_execution_gate_board_v1                 | app_surface_code, model_code, task_domain_code
86: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_execution_persistent_smoke_board_v1     | app_surface_code, app_surface_name_ja, model_code, task_domain_code
87: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_execution_request_board_v1              | app_surface_code, app_surface_name_ja, model_code, task_domain_code
88: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_full_pipeline_board_v1                  | app_surface_code, app_surface_name_ja, model_code, task_domain_code
89: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_handoff_packet_board_v1                 | app_surface_code, model_code, task_domain_code
90: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_leader_review_board_v1                  | app_surface_code, model_code, task_domain_code
91: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_manager_gate_board_v1                   | app_surface_code, model_code, task_domain_code
92: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_president_approval_board_v1             | app_surface_code, model_code, task_domain_code
93: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_aiworker_runtime_worker_output_board_v1                  | app_surface_code, model_code, task_domain_code
94: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_megami_candidate_lineup_v1                               | model_code
95: 03_tables_with_profile_surface_model_columns | aiworker     | vw_app_megami_norn_three_sisters_lineup_with_body_v1            | model_code
96: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_leader_lineup_v1                               | model_code
97: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_leader_quality_lineup_v1                       | model_code
98: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_lineup_v1                                      | model_code
99: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_quality_lineup_v1                              | model_code
100: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_worker_lineup_v1                               | model_code
101: 03_tables_with_profile_surface_model_columns | aiworker     | vw_beyond_series_worker_quality_lineup_v1                       | model_code
102: 03_tables_with_profile_surface_model_columns | aiworker     | vw_brain_runtime_selection_smoke_board_v1                       | model_code
103: 03_tables_with_profile_surface_model_columns | aiworker     | vw_core_registration_domain_capability_v1                       | task_domain_code, task_domain_name_ja
104: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_knowledge_reference                                   | model_code
105: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_policy_package_directory                              | model_code
106: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_profile_catalog                                       | model_code
107: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_profile_step_catalog                                  | model_code
108: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_redirect_template_catalog                             | model_code
109: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_reference_scope_catalog                               | model_code
110: 03_tables_with_profile_surface_model_columns | aiworker     | vw_dialog_rule_catalog                                          | model_code
111: 03_tables_with_profile_surface_model_columns | aiworker     | vw_leader_mock_review_board_v1                                  | task_domain_code
112: 03_tables_with_profile_surface_model_columns | aiworker     | vw_manager_instruction_acceptance_board_v1                      | task_domain_code
113: 03_tables_with_profile_surface_model_columns | aiworker     | vw_manager_instruction_assignment_board_v1                      | task_domain_code
114: 03_tables_with_profile_surface_model_columns | aiworker     | vw_manager_instruction_plan_board_v1                            | task_domain_code
115: 03_tables_with_profile_surface_model_columns | aiworker     | vw_manager_mock_final_gate_board_v1                             | task_domain_code
116: 03_tables_with_profile_surface_model_columns | aiworker     | vw_megami_friend_lover_selection_card_v1                        | model_code
117: 03_tables_with_profile_surface_model_columns | aiworker     | vw_megami_norn_three_sisters_appearance_profile_v1              | model_code
118: 03_tables_with_profile_surface_model_columns | aiworker     | vw_megami_series_lineup_v1                                      | model_code
119: 03_tables_with_profile_surface_model_columns | aiworker     | vw_megami_worker_temporal_focus_v1                              | model_code
120: 03_tables_with_profile_surface_model_columns | aiworker     | vw_model_growth_delta_summary                                   | model_code
121: 03_tables_with_profile_surface_model_columns | aiworker     | vw_model_public_directory_v1                                    | model_code
122: 03_tables_with_profile_surface_model_columns | aiworker     | vw_model_public_profile                                         | model_code
123: 03_tables_with_profile_surface_model_columns | aiworker     | vw_model_style_profile                                          | model_code
124: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_capability_gate_v1                                 | president_model_code
125: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_catalog_summary_v1                                 | president_model_code
126: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_hd_r5p_catalog_summary_v1                          | president_model_code, model_code
127: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_manager_instruction_bridge_board_v1                | president_model_code, task_domain_code
128: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_manager_instruction_candidate_v1                   | president_model_code, task_domain_code
129: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_manager_instruction_waiting_v1                     | president_model_code, task_domain_code
130: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_runtime_gate_v1                                    | president_model_code
131: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_wlm_internal_pipeline_acceptance_metrics_v1        | president_model_code
132: 03_tables_with_profile_surface_model_columns | aiworker     | vw_president_wlm_internal_pipeline_acceptance_summary_v1        | president_model_code
133: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_brain_compact_context_v1                               | model_code
134: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_brain_effective_access_v1                              | model_code
135: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_brain_runtime_material_quality_overlay_v1              | model_code
136: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_brain_runtime_material_scoring_base_v1                 | model_code
137: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_model_capability_public_v1                             | model_code
138: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_knowledge_material_v1                   | model_code
139: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_runtime_material_coverage_v1            | model_code
140: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_runtime_material_v1                     | model_code
141: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_runtime_material_v2                     | model_code
142: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_runtime_material_v3                     | model_code
143: 03_tables_with_profile_surface_model_columns | aiworker     | vw_robot_readable_brain_source_registry_v1                      | model_code
144: 03_tables_with_profile_surface_model_columns | aiworker     | vw_wlm_execution_pipeline_board_v1                              | task_domain_code
145: 03_tables_with_profile_surface_model_columns | aiworker     | vw_worker_dialog_style_control                                  | model_code
146: 03_tables_with_profile_surface_model_columns | aiworker     | vw_worker_dialog_topic_bias                                     | model_code
147: 03_tables_with_profile_surface_model_columns | aiworker     | vw_worker_mock_output_board_v1                                  | task_domain_code
148: 03_tables_with_profile_surface_model_columns | aiworker     | vw_worker_series_lineup                                         | model_code
149: 03_tables_with_profile_surface_model_columns | aiworker     | vw_worker_series_search_lineup                                  | model_code
150: 03_tables_with_profile_surface_model_columns | aiworker     | worker_mock_output                                              | task_domain_code
151: 03_tables_with_profile_surface_model_columns | aiworker     | worker_model_capability_profile                                 | model_code
152: 03_tables_with_profile_surface_model_columns | aiworker     | worker_model_catalog                                            | model_code
153: 03_tables_with_profile_surface_model_columns | aiworker     | worker_model_extension_catalog                                  | model_code
154: 03_tables_with_profile_surface_model_columns | business     | aicm_user_company_department                                    | manager_aiworker_model_code
155: 03_tables_with_profile_surface_model_columns | business     | aicm_user_company_section                                       | leader_aiworker_model_code
156: 03_tables_with_profile_surface_model_columns | business     | aicm_user_company_worker_placement                              | aiworker_model_code
157: 03_tables_with_profile_surface_model_columns | business     | aicm_worker_work_unit                                           | worker_model_code
158: 03_tables_with_profile_surface_model_columns | business     | company_robot_entitlement                                       | aiworker_model_code
159: 03_tables_with_profile_surface_model_columns | business     | company_robot_placement                                         | aiworker_model_code
160: 03_tables_with_profile_surface_model_columns | business     | robot_pool                                                      | aiworker_model_code
161: 03_tables_with_profile_surface_model_columns | business     | robot_pool_sync_ledger                                          | aiworker_model_code
162: 03_tables_with_profile_surface_model_columns | business     | v_worker_rental_contract_summary                                | aiworker_model_code
163: 03_tables_with_profile_surface_model_columns | business     | vw_ai_company_manager_system_robot_selector_options             | aiworker_model_code
164: 03_tables_with_profile_surface_model_columns | business     | vw_aicm_company_robot_active_assignment_display                 | aiworker_model_code
165: 03_tables_with_profile_surface_model_columns | business     | vw_aicm_company_robot_assignment_display                        | aiworker_model_code
166: 03_tables_with_profile_surface_model_columns | business     | vw_aicm_pmlw_worker_work_unit_display                           | worker_model_code
167: 03_tables_with_profile_surface_model_columns | business     | vw_aicm_screen_robot_route_definition                           | default_model_code
168: 03_tables_with_profile_surface_model_columns | business     | vw_aicm_user_company_worker_placement_display                   | aiworker_model_code
169: 03_tables_with_profile_surface_model_columns | business     | vw_business_robot_pool_status                                   | aiworker_model_code
170: 03_tables_with_profile_surface_model_columns | business     | vw_business_robot_selector_options                              | aiworker_model_code
171: 03_tables_with_profile_surface_model_columns | business     | vw_company_robot_placement_display                              | aiworker_model_code
172: 03_tables_with_profile_surface_model_columns | business     | vw_company_robot_placement_status                               | aiworker_model_code
173: 03_tables_with_profile_surface_model_columns | business     | vw_company_robot_selector_options                               | aiworker_model_code
174: 03_tables_with_profile_surface_model_columns | business     | worker_rental_contract                                          | aiworker_model_code
175: 03_tables_with_profile_surface_model_columns | cx22073jw    | robot_model_role_reference_binding                              | model_code
176: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_civilization_exam_reference_v1                   | model_code
177: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_civilization_foundation_history_detail_reference | model_code
178: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_cx_reference_coverage_v1                         | model_code
179: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_earth_history_detail_reference_v1                | model_code
180: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_foundation_material_reference_v1                 | model_code
181: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_full_reference_v1                                | aiworker_model_code
182: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_full_reference_v2                                | aiworker_model_code
183: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_full_reference_v3                                | model_code
184: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_history_detail_coverage_v1                       | model_code
185: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_history_detail_unified_reference_v1              | model_code
186: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_history_exam_unified_reference_v1                | model_code
187: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_history_reference_v1                             | model_code
188: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_model_role_knowledge_reference_v1                      | model_code
189: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_personality_reference_v1                               | aiworker_model_code
190: 03_tables_with_profile_surface_model_columns | cx22073jw    | vw_robot_public_profile_reference_v1                            | aiworker_model_code
196: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_control_profile_v1
197: 04_candidate_tables_exact_app_surface_and_model | aiworker     | vw_app_aiworker_runtime_control_prompt_fragment_v1
214:        section         |             table_name             |    app_surface_code    |       model_code       | row_count 
216: 05_profile_pair_sample | aiworker.runtime_execution_request | ai_company_manager     | byd1_003_asic_workers3 |        40
217: 05_profile_pair_sample | aiworker.runtime_execution_request | ai_company_manager     | hd_r3_worker           |         2
218: 05_profile_pair_sample | aiworker.runtime_execution_request | ai_company_manager     | mg_norn_001_urd        |         6
219: 05_profile_pair_sample | aiworker.runtime_execution_request | pg_development_support | byd1_003_asic_workers3 |         2
222:        section         |                     table_name                      |  app_surface_code  |       model_code       | row_count 
224: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd1_001_asic_workers1 |         1
225: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd1_002_asic_workers2 |         1
226: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd1_003_asic_workers3 |         1
227: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd2_001_asic_leader1  |         1
228: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd2_002_asic_leader2  |         1
229: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | byd2_003_asic_leader3  |         1
230: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r1_helper           |         1
231: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r1a_lover           |         1
232: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r1c_friend          |         1
233: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r2_battler          |         1
234: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r2g_general         |         1
235: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r2s_sniper          |         1
236: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r2t0_origin         |         1
237: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r3_worker           |         1
238: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r4_leader           |         1
239: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r5_manager          |         1
240: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | hd_r5p_president       |         1
241: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_01            |         1
242: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_02            |         1
243: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_03            |         1
244: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_04            |         1
245: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_05            |         1
246: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_06            |         1
247: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_07            |         1
248: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_08            |         1
249: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_09            |         1
250: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_10            |         1
251: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_11            |         1
252: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_f_12            |         1
253: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_01            |         1
254: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_02            |         1
255: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_03            |         1
256: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_04            |         1
257: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_05            |         1
258: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_06            |         1
259: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_07            |         1
260: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_08            |         1
261: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_09            |         1
262: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_10            |         1
263: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_11            |         1
264: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | lovers_m_12            |         1
265: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | mg_norn_001_urd        |         1
266: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | mg_norn_002_verdandi   |         1
267: 05_profile_pair_sample | aiworker.vw_app_aiworker_runtime_control_profile_v1 | ai_company_manager | mg_norn_003_skuld      |         1
```

## Next

- If an existing app_surface_code for BYD2-003 exists, R13 should retry POST using that existing app_surface_code.
- If no profile exists for BYD2-003, stop and prepare Sato DB review for additive control profile registration.
- Do not create runtime control profile automatically in this step.
