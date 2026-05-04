# CX22073JW / AIWorkerOS Brain Full Load Lane 03 Report

RUN_TS=20260503_215135
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_215135_brain_full_load_lane_03_backlog_mapping
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=YES
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Meaning
Lane02 backlog source objects are mapped by high-confidence rules only.

## Scope
- Create mapping rule catalog.
- Create mapping proposal view.
- Auto-apply high-confidence mappings.
- Leave medium/low/no-rule objects in remaining backlog.
- Re-run source object and row-level registry ingestion safely.

## Apply output
```
BEGIN
DO
CREATE TABLE
INSERT 0 53
CREATE VIEW
INSERT 0 123
INSERT 0 128
DO
CREATE VIEW
CREATE VIEW
COMMIT
```

## Verify output
```
    section    | active_rule_count | high_rule_count | medium_rule_count
---------------+-------------------+-----------------+-------------------
 01_rule_count |                53 |              48 |                 5
(1 row)

      section       | proposal_action_code | mapping_confidence_code |   rule_code   | brain_domain_code  | object_count
--------------------+----------------------+-------------------------+---------------+--------------------+--------------
 02_proposal_status | no_rule              |                         |               |                    |          392
 02_proposal_status | review_required      | medium                  | rule_material | education_learning |            5
(2 rows)

           section            | source_object_kind |             source_object_name             | proposal_action_code | mapping_confidence_code | rule_code | brain_domain_code
------------------------------+--------------------+--------------------------------------------+----------------------+-------------------------+-----------+-------------------
 03_remaining_backlog_preview | table              | access_activation_request                  | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_activation_request_view_decision    | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_activation_review_decision_batch    | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_activation_review_decision_item     | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_activation_review_export_item       | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_activation_review_export_run        | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_actual_view_registry                | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_app_scope_actual_view_allowlist     | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_app_scope_registry                  | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_current_state_bundle_export_file    | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_current_state_bundle_export_run     | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_db_role_provision_batch             | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_db_role_provision_item              | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_db_role_registry                    | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_domain_master                       | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_domain_rule_registry                | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_final_handoff_export_item           | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_final_handoff_export_run            | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_global_rule_registry                | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_governed_apply_attempt_log          | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_governed_apply_batch                | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_governed_apply_batch_item           | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_governed_apply_execution_item       | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_governed_apply_execution_run        | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_governed_apply_queue                | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_grant_export_item                   | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_grant_export_run                    | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_human_review_action_log             | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_legacy_cutover_gate_blocker         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_legacy_cutover_gate_run             | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_legacy_db_blocker_patch_item        | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_legacy_db_blocker_patch_run         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_legacy_retirement_plan_item         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_legacy_retirement_plan_run          | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_manual_apply_confirmation_log       | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_manual_apply_receipt_batch          | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_manual_apply_receipt_item           | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_post_apply_verification_item        | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_post_apply_verification_run         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_rank_registry                       | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_role_access_bundle_item             | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_role_access_bundle_master           | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_role_actual_view_grant_skeleton     | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_role_master                         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_role_view_family_policy             | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_route_master                        | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_runtime_ready_promotion_batch       | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_runtime_ready_promotion_item        | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_stub_smoke_item                     | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_stub_smoke_run                      | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_stub_view_generation_item           | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_stub_view_generation_run            | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_view_family_actual_view_map         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_view_family_master                  | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | access_view_naming_rule_registry           | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | area_exact_contract_snapshot               | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | area_payload_contract_registry             | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | asset_metadata_localization_area           | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | asset_rights_policy_area                   | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | candidate_area_boundary_rule               | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | candidate_area_registry                    | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | candidate_area_tag                         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | compatibility_profile_master               | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | compatibility_rule                         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | contract_remediation_batch                 | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | contract_remediation_item                  | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | currency_amount_reference                  | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | entity_master                              | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | exact_contract_profile_master              | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | exact_contract_sample_case_registry        | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | exact_contract_sample_run_log              | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | exact_payload_validation_issue_log         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | executive_strategy_knowledge_package       | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | executive_strategy_topic                   | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | exhibition_projection_area                 | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | foundation_domain_master                   | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | foundation_optimization_job                | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | generation_profile_master                  | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | knowledge_chunk                            | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | knowledge_entry                            | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | multilingual_term_dictionary               | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | official_prepare_generation_registry       | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | official_prepare_generation_registry_log   | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | official_prepare_queue_item                | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | official_prepare_queue_item_log            | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | official_prepare_queue_master              | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | phase1_skeleton_apply_batch                | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | phase1_skeleton_apply_item_log             | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | privilege_tier_master                      | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | privileged_policy_profile                  | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | privileged_route_policy_binding            | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | projection_common_column_contract_master   | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | published_knowledge_catalog                | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | published_knowledge_quality_metric         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | publishing_asset_area                      | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | readiness_gate_master                      | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | readiness_gate_result                      | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | readiness_gate_rule_master                 | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | readiness_gate_run                         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | relation_knowledge                         | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | restriction_rule                           | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | review_case_area                           | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | secret_asset                               | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | secret_asset_category_master               | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | secret_route_binding                       | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | secret_target_master                       | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | secret_target_selector_master              | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | source_review_registry                     | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | source_to_cx_fixed_contract_release        | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | source_to_cx_fixed_contract_release_key    | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | source_to_cx_fixed_contract_release_target | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | streaming_category_tree_area               | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | streaming_continue_watching_area           | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | streaming_creator_asset_area               | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | streaming_membership_program_area          | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | streaming_membership_rule_area             | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | streaming_paid_video_offer_area            | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | streaming_progress_resume_area             | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | streaming_publish_setting_area             | no_rule              |                         |           |
 03_remaining_backlog_preview | table              | streaming_revenue_split_area               | no_rule              |                         |           |
(120 rows)

              section              |                              object_code                               |                       source_object_name                        |        brain_domain_code        | source_object_exists_flag | object_registry_count | row_registry_count | registry_source_missing_count
-----------------------------------+------------------------------------------------------------------------+-----------------------------------------------------------------+---------------------------------+---------------------------+-----------------------+--------------------+-------------------------------
 04_ingestion_summary_after_lane03 | lane03_business_support_knowledge_material                             | business_support_knowledge_material                             | business_operation              | t                         |                     1 |                  8 |                             0
 04_ingestion_summary_after_lane03 | lane03_business_support_knowledge_package                              | business_support_knowledge_package                              | business_operation              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_business_support_topic                                          | business_support_topic                                          | business_operation              | t                         |                     1 |                  8 |                             0
 04_ingestion_summary_after_lane03 | lane03_candidate_ledger_source_registry                                | candidate_ledger_source_registry                                | business_operation              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_utility_daily_task_context                             | vw_aiemp_utility_daily_task_context                             | business_operation              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_workforce_app_operation_context                        | vw_aiemp_workforce_app_operation_context                        | business_operation              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_business_support_knowledge_catalog                           | vw_business_support_knowledge_catalog                           | business_operation              | t                         |                     1 |                  8 |                             0
 04_ingestion_summary_after_lane03 | lane03_asset_marketplace_listing_projection_area                       | asset_marketplace_listing_projection_area                       | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_knowledge_article                                               | knowledge_article                                               | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_static_art_asset_area                                           | static_art_asset_area                                           | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_staticart_delivery_closeout_run                                 | staticart_delivery_closeout_run                                 | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_staticart_final_completion_certificate                          | staticart_final_completion_certificate                          | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_staticart_final_handoff_package                                 | staticart_final_handoff_package                                 | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_staticart_final_handoff_package_item                            | staticart_final_handoff_package_item                            | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_staticart_handoff_export_batch                                  | staticart_handoff_export_batch                                  | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_staticart_handoff_export_item                                   | staticart_handoff_export_item                                   | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_staticart_knowledge_pack_run                                    | staticart_knowledge_pack_run                                    | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_staticart_knowledge_pack_run_item                               | staticart_knowledge_pack_run_item                               | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_staticart_knowledge_pack_sample_registry                        | staticart_knowledge_pack_sample_registry                        | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_staticart_resume_pack_run                                       | staticart_resume_pack_run                                       | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_streaming_marketplace_listing_area                              | streaming_marketplace_listing_area                              | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_asset_marketplace_listing_projection_area_latest              | v_asset_marketplace_listing_projection_area_latest              | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_foundation_article_catalog                                    | v_foundation_article_catalog                                    | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_static_art_asset_area_latest                                  | v_static_art_asset_area_latest                                  | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_delivery_closeout_summary                           | v_staticart_delivery_closeout_summary                           | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_delivery_master_status                              | v_staticart_delivery_master_status                              | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_exact_knowledge_transfer_blocks                     | v_staticart_exact_knowledge_transfer_blocks                     | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_exact_knowledge_transfer_fields                     | v_staticart_exact_knowledge_transfer_fields                     | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_exact_knowledge_transfer_rules                      | v_staticart_exact_knowledge_transfer_rules                      | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_final_handoff_package_summary                       | v_staticart_final_handoff_package_summary                       | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_fixed_contract_release_export_payload               | v_staticart_fixed_contract_release_export_payload               | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_fixed_contract_release_export_top_level             | v_staticart_fixed_contract_release_export_top_level             | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_fixed_contract_release_keys                         | v_staticart_fixed_contract_release_keys                         | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_fixed_contract_release_summary                      | v_staticart_fixed_contract_release_summary                      | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_fixed_contract_release_targets                      | v_staticart_fixed_contract_release_targets                      | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_handoff_export_batch_summary                        | v_staticart_handoff_export_batch_summary                        | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_handoff_export_item_summary                         | v_staticart_handoff_export_item_summary                         | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_knowledge_pack_run_item_latest                      | v_staticart_knowledge_pack_run_item_latest                      | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_knowledge_pack_run_latest                           | v_staticart_knowledge_pack_run_latest                           | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_knowledge_pack_sample_registry_summary              | v_staticart_knowledge_pack_sample_registry_summary              | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_minimum_first_send_area_bindings                    | v_staticart_minimum_first_send_area_bindings                    | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_minimum_first_send_contract_coverage                | v_staticart_minimum_first_send_contract_coverage                | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_minimum_first_send_field_bindings                   | v_staticart_minimum_first_send_field_bindings                   | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_staticart_resume_pack_summary                                 | v_staticart_resume_pack_summary                                 | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_streaming_marketplace_listing_area_latest                     | v_streaming_marketplace_listing_area_latest                     | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_game_balance_safe_context                              | vw_aiemp_game_balance_safe_context                              | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_game_commentator_context                               | vw_aiemp_game_commentator_context                               | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_game_match_context                                     | vw_aiemp_game_match_context                                     | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_game_npc_role_context                                  | vw_aiemp_game_npc_role_context                                  | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_game_opponent_context                                  | vw_aiemp_game_opponent_context                                  | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_game_party_member_context                              | vw_aiemp_game_party_member_context                              | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_game_rule_guide                                        | vw_aiemp_game_rule_guide                                        | city_art_game                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | civilization_foundation_history_detail_entry                           | civilization_foundation_history_detail_entry                    | civilization_foundation_history | t                         |                     1 |                  1 |                             0
 04_ingestion_summary_after_lane03 | lane03_civilization_foundation_history_entry                           | civilization_foundation_history_entry                           | civilization_foundation_history | t                         |                     1 |                  1 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_civilization_foundation_history_detail_reference_v1          | vw_civilization_foundation_history_detail_reference_v1          | civilization_foundation_history | t                         |                     1 |                  1 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_civilization_foundation_history_reference_v1                 | vw_civilization_foundation_history_reference_v1                 | civilization_foundation_history | t                         |                     1 |                  1 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_civilization_foundation_history_detail_reference | vw_robot_model_civilization_foundation_history_detail_reference | civilization_foundation_history | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_jurisdiction_region_reference                                   | jurisdiction_region_reference                                   | culture_region                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | foundation_knowledge_material                                          | foundation_knowledge_material                                   | education_learning              | t                         |                     1 |                 18 |                             0
 04_ingestion_summary_after_lane03 | foundation_knowledge_topic                                             | foundation_knowledge_topic                                      | education_learning              | t                         |                     1 |                 12 |                             0
 04_ingestion_summary_after_lane03 | civilization_exam_question_bank                                        | civilization_exam_question_bank                                 | exam_learning                   | t                         |                     1 |                 74 |                             0
 04_ingestion_summary_after_lane03 | lane03_civilization_exam_question_choice                               | civilization_exam_question_choice                               | exam_learning                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_qualification_past_question_content                    | vw_aiemp_qualification_past_question_content                    | exam_learning                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_qualification_past_question_metadata                   | vw_aiemp_qualification_past_question_metadata                   | exam_learning                   | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_civilization_exam_question_reference_v1                      | vw_civilization_exam_question_reference_v1                      | exam_learning                   | t                         |                     1 |                 74 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_civilization_exam_reference_v1                   | vw_robot_model_civilization_exam_reference_v1                   | exam_learning                   | t                         |                     1 |                 74 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_utility_meal_planning_context                          | vw_aiemp_utility_meal_planning_context                          | food_nutrition                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_access_baseline_health_check_item                               | access_baseline_health_check_item                               | health_life_metrics             | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_access_baseline_health_run                                      | access_baseline_health_run                                      | health_life_metrics             | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_access_baseline_health_latest_items                           | v_access_baseline_health_latest_items                           | health_life_metrics             | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_access_baseline_health_latest_summary                         | v_access_baseline_health_latest_summary                         | health_life_metrics             | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | earth_history_detail_entry                                             | earth_history_detail_entry                                      | history_worldview               | t                         |                     1 |                  1 |                             0
 04_ingestion_summary_after_lane03 | lane03_earth_history_knowledge_entry                                   | earth_history_knowledge_entry                                   | history_worldview               | t                         |                     1 |                  1 |                             0
 04_ingestion_summary_after_lane03 | lane03_history_knowledge_entry                                         | history_knowledge_entry                                         | history_worldview               | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_streaming_view_history_area                                     | streaming_view_history_area                                     | history_worldview               | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_streaming_view_history_area_latest                            | v_streaming_view_history_area_latest                            | history_worldview               | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_earth_history_detail_reference_v1                            | vw_earth_history_detail_reference_v1                            | history_worldview               | t                         |                     1 |                  1 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_earth_history_knowledge_reference_v1                         | vw_earth_history_knowledge_reference_v1                         | history_worldview               | t                         |                     1 |                  1 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_history_detail_unified_reference_v1                          | vw_history_detail_unified_reference_v1                          | history_worldview               | t                         |                     1 |                  1 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_history_exam_question_unified_reference_v1                   | vw_history_exam_question_unified_reference_v1                   | history_worldview               | t                         |                     1 |                 74 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_earth_history_detail_reference_v1                | vw_robot_model_earth_history_detail_reference_v1                | history_worldview               | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_history_detail_coverage_v1                       | vw_robot_model_history_detail_coverage_v1                       | history_worldview               | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_history_detail_unified_reference_v1              | vw_robot_model_history_detail_unified_reference_v1              | history_worldview               | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_history_exam_unified_reference_v1                | vw_robot_model_history_exam_unified_reference_v1                | history_worldview               | t                         |                     1 |                 74 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_history_reference_v1                             | vw_robot_model_history_reference_v1                             | history_worldview               | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_role_civilization_history_reference_v1                 | vw_robot_role_civilization_history_reference_v1                 | history_worldview               | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_role_earth_history_reference_v1                        | vw_robot_role_earth_history_reference_v1                        | history_worldview               | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_role_history_reference_bridge_v1                       | vw_robot_role_history_reference_bridge_v1                       | history_worldview               | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_access_legacy_compat_audit_db_item                              | access_legacy_compat_audit_db_item                              | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_access_legacy_compat_audit_file_item                            | access_legacy_compat_audit_file_item                            | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_access_legacy_compat_audit_run                                  | access_legacy_compat_audit_run                                  | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_privileged_access_audit_log                                     | privileged_access_audit_log                                     | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_streaming_connector_audit_area                                  | streaming_connector_audit_area                                  | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_access_legacy_compat_audit_latest_db_items                    | v_access_legacy_compat_audit_latest_db_items                    | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_access_legacy_compat_audit_latest_file_items                  | v_access_legacy_compat_audit_latest_file_items                  | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_access_legacy_compat_audit_latest_summary                     | v_access_legacy_compat_audit_latest_summary                     | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_streaming_connector_audit_area_latest                         | v_streaming_connector_audit_area_latest                         | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_admin_audit_context                                    | vw_aiemp_admin_audit_context                                    | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_admin_control_audit_context                            | vw_aiemp_admin_control_audit_context                            | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_audit_digest                                           | vw_aiemp_audit_digest                                           | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_combat_audit_context                                   | vw_aiemp_combat_audit_context                                   | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_senior_control_audit_context                           | vw_aiemp_senior_control_audit_context                           | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_workforce_audit_context                                | vw_aiemp_workforce_audit_context                                | professional_basic              | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_robot_model_role_reference_binding                              | robot_model_role_reference_binding                              | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_robot_role_knowledge_pack                                       | robot_role_knowledge_pack                                       | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_robot_role_knowledge_registration_run                           | robot_role_knowledge_registration_run                           | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_robot_role_knowledge_topic_binding                              | robot_role_knowledge_topic_binding                              | robot_aiworker                  | t                         |                     1 |                 12 |                             0
 04_ingestion_summary_after_lane03 | lane03_robot_role_series_supplement                                    | robot_role_series_supplement                                    | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_cx_reference_coverage_v1                         | vw_robot_model_cx_reference_coverage_v1                         | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_foundation_material_reference_v1                 | vw_robot_model_foundation_material_reference_v1                 | robot_aiworker                  | t                         |                     1 |                 18 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_full_reference_v1                                | vw_robot_model_full_reference_v1                                | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_full_reference_v2                                | vw_robot_model_full_reference_v2                                | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_full_reference_v3                                | vw_robot_model_full_reference_v3                                | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_model_role_knowledge_reference_v1                      | vw_robot_model_role_knowledge_reference_v1                      | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_personality_reference_v1                               | vw_robot_personality_reference_v1                               | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_public_profile_reference_v1                            | vw_robot_public_profile_reference_v1                            | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_role_foundation_material_reference_v1                  | vw_robot_role_foundation_material_reference_v1                  | robot_aiworker                  | t                         |                     1 |                 18 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_role_foundation_topic_reference_v1                     | vw_robot_role_foundation_topic_reference_v1                     | robot_aiworker                  | t                         |                     1 |                 12 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_role_knowledge_domain_v1                               | vw_robot_role_knowledge_domain_v1                               | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_role_knowledge_pack_v1                                 | vw_robot_role_knowledge_pack_v1                                 | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_role_reference_v1                                      | vw_robot_role_reference_v1                                      | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_role_template_reference_v1                             | vw_robot_role_template_reference_v1                             | robot_aiworker                  | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_seasonal_event_content_link                                     | seasonal_event_content_link                                     | season_calendar                 | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_seasonal_event_master                                           | seasonal_event_master                                           | season_calendar                 | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_v_seasonal_active_today                                         | v_seasonal_active_today                                         | season_calendar                 | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_combat_roe_safety_context                              | vw_aiemp_combat_roe_safety_context                              | security_crisis                 | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_aiemp_privileged_incident_context                            | vw_aiemp_privileged_incident_context                            | security_crisis                 | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | lane03_vw_robot_role_safety_boundary_v1                                | vw_robot_role_safety_boundary_v1                                | security_crisis                 | t                         |                     1 |                  0 |                             0
 04_ingestion_summary_after_lane03 | business_operation_reference                                           | business_operation_reference                                    | business_operation              | f                         |                     0 |                  0 |                             0
 04_ingestion_summary_after_lane03 | city_art_game_reference                                                | city_art_game_reference                                         | city_art_game                   | f                         |                     0 |                  0 |                             0
 04_ingestion_summary_after_lane03 | culture_region_reference                                               | culture_region_reference                                        | culture_region                  | f                         |                     0 |                  0 |                             0
 04_ingestion_summary_after_lane03 | health_life_metrics_reference                                          | health_life_metrics_reference                                   | health_life_metrics             | f                         |                     0 |                  0 |                             0
 04_ingestion_summary_after_lane03 | casual_knowledge_material                                              | casual_knowledge_material                                       | hobby_entertainment             | f                         |                     0 |                  0 |                             0
 04_ingestion_summary_after_lane03 | casual_knowledge_topic                                                 | casual_knowledge_topic                                          | hobby_entertainment             | f                         |                     0 |                  0 |                             0
 04_ingestion_summary_after_lane03 | professional_basic_reference                                           | professional_basic_reference                                    | professional_basic              | f                         |                     0 |                  0 |                             0
 04_ingestion_summary_after_lane03 | aiworker_robot_reference                                               | aiworker_robot_reference                                        | robot_aiworker                  | f                         |                     0 |                  0 |                             0
 04_ingestion_summary_after_lane03 | robot_model_reference                                                  | robot_model_reference                                           | robot_aiworker                  | f                         |                     0 |                  0 |                             0
 04_ingestion_summary_after_lane03 | robot_series_reference                                                 | robot_series_reference                                          | robot_aiworker                  | f                         |                     0 |                  0 |                             0
 04_ingestion_summary_after_lane03 | security_crisis_reference                                              | security_crisis_reference                                       | security_crisis                 | f                         |                     0 |                  0 |                             0
(139 rows)

         section          |        brain_domain_code        | active_unit_count | target_min_unit_count | registry_count | source_object_registry_count | source_row_registry_count | source_missing_count | readable_model_count | full_load_status
--------------------------+---------------------------------+-------------------+-----------------------+----------------+------------------------------+---------------------------+----------------------+----------------------+------------------
 05_coverage_after_lane03 | history_worldview               |                14 |                    50 |            185 |                           17 |                       153 |                    0 |                    8 | partial_loaded
 05_coverage_after_lane03 | civilization_foundation_history |                14 |                    50 |             24 |                            5 |                         4 |                    0 |                    5 | partial_loaded
 05_coverage_after_lane03 | health_life_metrics             |                12 |                    40 |             16 |                            4 |                         0 |                    0 |                    1 | partial_loaded
 05_coverage_after_lane03 | business_operation              |                26 |                    70 |             58 |                            7 |                        24 |                    0 |                   10 | partial_loaded
 05_coverage_after_lane03 | professional_basic              |                20 |                    60 |             36 |                           15 |                         0 |                    0 |                    5 | partial_loaded
 05_coverage_after_lane03 | food_nutrition                  |                 6 |                    30 |              8 |                            1 |                         0 |                    0 |                    3 | partial_loaded
 05_coverage_after_lane03 | season_calendar                 |                 7 |                    30 |             11 |                            3 |                         0 |                    0 |                    3 | partial_loaded
 05_coverage_after_lane03 | culture_region                  |                12 |                    40 |             14 |                            1 |                         0 |                    0 |                    4 | partial_loaded
 05_coverage_after_lane03 | education_learning              |                11 |                    45 |             45 |                            2 |                        30 |                    0 |                    9 | partial_loaded
 05_coverage_after_lane03 | exam_learning                   |                10 |                    35 |            239 |                            6 |                       222 |                    0 |                    3 | partial_loaded
 05_coverage_after_lane03 | hobby_entertainment             |                12 |                    35 |             12 |                            0 |                         0 |                    0 |                    3 | partial_loaded
 05_coverage_after_lane03 | robot_aiworker                  |                27 |                    70 |            108 |                           19 |                        60 |                    0 |                   13 | partial_loaded
 05_coverage_after_lane03 | security_crisis                 |                14 |                    50 |             18 |                            3 |                         0 |                    0 |                    3 | partial_loaded
 05_coverage_after_lane03 | city_art_game                   |                13 |                    45 |             59 |                           45 |                         0 |                    0 |                    2 | partial_loaded
(14 rows)

               check_code               | result |                        note
----------------------------------------+--------+-----------------------------------------------------
 hd_r1c_forbidden_still_zero            | PASS   | HD-R1C forbidden domains remain denied
 hd_r2_business_professional_still_zero | PASS   | HD-R2/R2S/R2G business/professional remains denied
 lane03_remaining_backlog_view_exists   | PASS   | Lane03 remaining backlog view exists
 lane03_status_view_exists              | PASS   | Lane03 mapping status view exists
 proposal_view_exists                   | PASS   | mapping proposal view exists
 registered_source_objects_not_missing  | PASS   | registered source objects point to existing objects
 rule_count_min_40                      | PASS   | mapping rules cover major domain keywords
 rule_table_exists                      | PASS   | mapping rule table exists
 source_object_registry_exists          | PASS   | source object registry rows exist
 source_row_registry_exists             | PASS   | source row registry rows exist
(10 rows)

 section | pass_count | fail_count
---------+------------+------------
 SUMMARY |         10 |          0
(1 row)

```

FINAL_STATUS=BRAIN_FULL_LOAD_LANE_03_PASS_REVIEW_REQUIRED
NEXT=Brain Full Load Lane 04: runtime source-registry material adapter for non-brain_knowledge_unit sources
