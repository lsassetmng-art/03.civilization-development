# Brain Full Load Lane 02 Viewfix Compatible Report

RUN_TS=20260503_211103
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_211103_brain_full_load_lane_02_viewfix_compatible
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=YES
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Cause
CREATE OR REPLACE VIEW cannot change existing column names by position.

## Fix
Keep existing vw_brain_full_load_coverage_v1 column order.
Append source_object_registry_count and source_row_registry_count at the end.

## Patch output
```
LATEST_SAFE_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_204024_brain_full_load_lane_02_safe_rerun_dedup
SOURCE_SQL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_204024_brain_full_load_lane_02_safe_rerun_dedup/100_apply_brain_full_load_lane_02_SAFE_DEDUP.sql
SQL_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_211103_brain_full_load_lane_02_viewfix_compatible/100_apply_brain_full_load_lane_02_VIEWFIX_COMPATIBLE.sql
PATCH_OK coverage view compatible column order
PATCHED_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_211103_brain_full_load_lane_02_viewfix_compatible/100_apply_brain_full_load_lane_02_VIEWFIX_COMPATIBLE.sql

PATCH_MARKERS
371:    count(*) FILTER (WHERE brain_data_code LIKE 'srcobj:%') AS source_object_registry_count,
411:  COALESCE(r.source_object_registry_count, 0) AS source_object_registry_count,
372:    count(*) FILTER (WHERE brain_data_code LIKE 'srcrow:%') AS source_row_registry_count,
412:  COALESCE(r.source_row_registry_count, 0) AS source_row_registry_count
```

## Apply output
```
BEGIN
CREATE VIEW
CREATE TABLE
INSERT 0 16
CREATE VIEW
CREATE VIEW
INSERT 0 5
DO
CREATE VIEW
CREATE VIEW
COMMIT
```

## Verify output
```
      section       | cx_object_count | external_source_candidate_count
--------------------+-----------------+---------------------------------
 01_inventory_count |             541 |                             525
(1 row)

       section        |                 object_code                  |              source_object_name              |        brain_domain_code        | source_object_exists_flag | object_registry_count | row_registry_count | registry_source_exists_count | registry_source_missing_count
----------------------+----------------------------------------------+----------------------------------------------+---------------------------------+---------------------------+-----------------------+--------------------+------------------------------+-------------------------------
 02_ingestion_summary | civilization_foundation_history_detail_entry | civilization_foundation_history_detail_entry | civilization_foundation_history | t                         |                     1 |                  1 |                            2 |                             0
 02_ingestion_summary | foundation_knowledge_material                | foundation_knowledge_material                | education_learning              | t                         |                     1 |                 18 |                           19 |                             0
 02_ingestion_summary | foundation_knowledge_topic                   | foundation_knowledge_topic                   | education_learning              | t                         |                     1 |                 12 |                           13 |                             0
 02_ingestion_summary | civilization_exam_question_bank              | civilization_exam_question_bank              | exam_learning                   | t                         |                     1 |                 74 |                           75 |                             0
 02_ingestion_summary | earth_history_detail_entry                   | earth_history_detail_entry                   | history_worldview               | t                         |                     1 |                  1 |                            2 |                             0
 02_ingestion_summary | business_operation_reference                 | business_operation_reference                 | business_operation              | f                         |                     0 |                  0 |                            0 |                             0
 02_ingestion_summary | city_art_game_reference                      | city_art_game_reference                      | city_art_game                   | f                         |                     0 |                  0 |                            0 |                             0
 02_ingestion_summary | culture_region_reference                     | culture_region_reference                     | culture_region                  | f                         |                     0 |                  0 |                            0 |                             0
 02_ingestion_summary | health_life_metrics_reference                | health_life_metrics_reference                | health_life_metrics             | f                         |                     0 |                  0 |                            0 |                             0
 02_ingestion_summary | casual_knowledge_material                    | casual_knowledge_material                    | hobby_entertainment             | f                         |                     0 |                  0 |                            0 |                             0
 02_ingestion_summary | casual_knowledge_topic                       | casual_knowledge_topic                       | hobby_entertainment             | f                         |                     0 |                  0 |                            0 |                             0
 02_ingestion_summary | professional_basic_reference                 | professional_basic_reference                 | professional_basic              | f                         |                     0 |                  0 |                            0 |                             0
 02_ingestion_summary | aiworker_robot_reference                     | aiworker_robot_reference                     | robot_aiworker                  | f                         |                     0 |                  0 |                            0 |                             0
 02_ingestion_summary | robot_model_reference                        | robot_model_reference                        | robot_aiworker                  | f                         |                     0 |                  0 |                            0 |                             0
 02_ingestion_summary | robot_series_reference                       | robot_series_reference                       | robot_aiworker                  | f                         |                     0 |                  0 |                            0 |                             0
 02_ingestion_summary | security_crisis_reference                    | security_crisis_reference                    | security_crisis                 | f                         |                     0 |                  0 |                            0 |                             0
(16 rows)

      section       | source_object_kind |            source_object_name             | estimated_row_count |    backlog_status
--------------------+--------------------+-------------------------------------------+---------------------+----------------------
 03_backlog_preview | table              | access_activation_request                 |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_activation_request_view_decision   |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_activation_review_decision_batch   |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_activation_review_decision_item    |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_activation_review_export_item      |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_activation_review_export_run       |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_actual_view_registry               |                  79 | needs_domain_mapping
 03_backlog_preview | table              | access_app_scope_actual_view_allowlist    |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_app_scope_registry                 |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_baseline_health_check_item         |                  60 | needs_domain_mapping
 03_backlog_preview | table              | access_baseline_health_run                |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_current_state_bundle_export_file   |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_current_state_bundle_export_run    |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_db_role_provision_batch            |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_db_role_provision_item             |                  70 | needs_domain_mapping
 03_backlog_preview | table              | access_db_role_registry                   |                  70 | needs_domain_mapping
 03_backlog_preview | table              | access_domain_master                      |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_domain_rule_registry               |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_final_handoff_export_item          |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_final_handoff_export_run           |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_global_rule_registry               |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_governed_apply_attempt_log         |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_governed_apply_batch               |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_governed_apply_batch_item          |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_governed_apply_execution_item      |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_governed_apply_execution_run       |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_governed_apply_queue               |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_grant_export_item                  |                 262 | needs_domain_mapping
 03_backlog_preview | table              | access_grant_export_run                   |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_human_review_action_log            |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_legacy_compat_audit_db_item        |                  53 | needs_domain_mapping
 03_backlog_preview | table              | access_legacy_compat_audit_file_item      |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_legacy_compat_audit_run            |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_legacy_cutover_gate_blocker        |                  98 | needs_domain_mapping
 03_backlog_preview | table              | access_legacy_cutover_gate_run            |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_legacy_db_blocker_patch_item       |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_legacy_db_blocker_patch_run        |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_legacy_retirement_plan_item        |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_legacy_retirement_plan_run         |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_manual_apply_confirmation_log      |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_manual_apply_receipt_batch         |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_manual_apply_receipt_item          |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_post_apply_verification_item       |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_post_apply_verification_run        |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_rank_registry                      |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_role_access_bundle_item            |                 262 | needs_domain_mapping
 03_backlog_preview | table              | access_role_access_bundle_master          |                  70 | needs_domain_mapping
 03_backlog_preview | table              | access_role_actual_view_grant_skeleton    |                 262 | needs_domain_mapping
 03_backlog_preview | table              | access_role_master                        |                  76 | needs_domain_mapping
 03_backlog_preview | table              | access_role_view_family_policy            |                 285 | needs_domain_mapping
 03_backlog_preview | table              | access_route_master                       |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_runtime_ready_promotion_batch      |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_runtime_ready_promotion_item       |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_stub_smoke_item                    |                  79 | needs_domain_mapping
 03_backlog_preview | table              | access_stub_smoke_run                     |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_stub_view_generation_item          |                  79 | needs_domain_mapping
 03_backlog_preview | table              | access_stub_view_generation_run           |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | access_view_family_actual_view_map        |                  79 | needs_domain_mapping
 03_backlog_preview | table              | access_view_family_master                 |                  75 | needs_domain_mapping
 03_backlog_preview | table              | access_view_naming_rule_registry          |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | area_exact_contract_snapshot              |                  19 | needs_domain_mapping
 03_backlog_preview | table              | area_payload_contract_registry            |                  39 | needs_domain_mapping
 03_backlog_preview | table              | asset_marketplace_listing_projection_area |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | asset_metadata_localization_area          |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | asset_rights_policy_area                  |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | business_support_knowledge_material       |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | business_support_knowledge_package        |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | business_support_topic                    |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | candidate_area_boundary_rule              |                  31 | needs_domain_mapping
 03_backlog_preview | table              | candidate_area_registry                   |                  49 | needs_domain_mapping
 03_backlog_preview | table              | candidate_area_tag                        |                 294 | needs_domain_mapping
 03_backlog_preview | table              | candidate_ledger_source_registry          |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | civilization_exam_question_choice         |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | civilization_foundation_history_entry     |                  48 | needs_domain_mapping
 03_backlog_preview | table              | compatibility_profile_master              |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | compatibility_rule                        |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | contract_remediation_batch                |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | contract_remediation_item                 |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | currency_amount_reference                 |                  -1 | needs_domain_mapping
 03_backlog_preview | table              | earth_history_knowledge_entry             |                 159 | needs_domain_mapping
(80 rows)

         section          |        brain_domain_code        | active_unit_count | target_min_unit_count | registry_count | source_object_registry_count | source_row_registry_count | source_missing_count | readable_model_count | full_load_status
--------------------------+---------------------------------+-------------------+-----------------------+----------------+------------------------------+---------------------------+----------------------+----------------------+------------------
 04_coverage_after_lane02 | history_worldview               |                14 |                    50 |             17 |                            1 |                         1 |                    0 |                    8 | partial_loaded
 04_coverage_after_lane02 | civilization_foundation_history |                14 |                    50 |             17 |                            1 |                         1 |                    0 |                    5 | partial_loaded
 04_coverage_after_lane02 | health_life_metrics             |                12 |                    40 |             12 |                            0 |                         0 |                    0 |                    1 | partial_loaded
 04_coverage_after_lane02 | business_operation              |                26 |                    70 |             27 |                            0 |                         0 |                    0 |                   10 | partial_loaded
 04_coverage_after_lane02 | professional_basic              |                20 |                    60 |             21 |                            0 |                         0 |                    0 |                    5 | partial_loaded
 04_coverage_after_lane02 | food_nutrition                  |                 6 |                    30 |              7 |                            0 |                         0 |                    0 |                    3 | partial_loaded
 04_coverage_after_lane02 | season_calendar                 |                 7 |                    30 |              8 |                            0 |                         0 |                    0 |                    3 | partial_loaded
 04_coverage_after_lane02 | culture_region                  |                12 |                    40 |             13 |                            0 |                         0 |                    0 |                    4 | partial_loaded
 04_coverage_after_lane02 | education_learning              |                11 |                    45 |             45 |                            2 |                        30 |                    0 |                    9 | partial_loaded
 04_coverage_after_lane02 | exam_learning                   |                10 |                    35 |             86 |                            1 |                        74 |                    0 |                    3 | partial_loaded
 04_coverage_after_lane02 | hobby_entertainment             |                12 |                    35 |             12 |                            0 |                         0 |                    0 |                    3 | partial_loaded
 04_coverage_after_lane02 | robot_aiworker                  |                27 |                    70 |             29 |                            0 |                         0 |                    0 |                   13 | partial_loaded
 04_coverage_after_lane02 | security_crisis                 |                14 |                    50 |             15 |                            0 |                         0 |                    0 |                    3 | partial_loaded
 04_coverage_after_lane02 | city_art_game                   |                13 |                    45 |             14 |                            0 |                         0 |                    0 |                    2 | partial_loaded
(14 rows)

               check_code               | result |                          note
----------------------------------------+--------+---------------------------------------------------------
 catalog_min_12                         | PASS   | catalog has known source object mappings
 catalog_table_exists                   | PASS   | source object ingestion catalog table exists
 existing_source_object_registered      | PASS   | at least one existing source object was registered
 hd_r1c_forbidden_still_zero            | PASS   | HD-R1C forbidden domains remain denied
 hd_r2_business_professional_still_zero | PASS   | HD-R2/R2S/R2G business/professional remains denied
 inventory_view_exists                  | PASS   | source inventory view exists
 registered_source_objects_not_missing  | PASS   | registered source object rows point to existing objects
 row_level_ingestion_has_rows           | PASS   | row-level ingestion registered at least one row
 summary_view_exists                    | PASS   | source ingestion summary view exists
(9 rows)

 section | pass_count | fail_count
---------+------------+------------
 SUMMARY |          9 |          0
(1 row)

```

FINAL_STATUS=BRAIN_FULL_LOAD_LANE_02_VIEWFIX_PASS_REVIEW_REQUIRED
NEXT=Brain Full Load Lane 03: backlog source-object domain mapping and source-column expansion
