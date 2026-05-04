# CX22073JW / AIWorkerOS Brain Registry Source Alignment Inventory

RUN_TS=20260503_065848
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_065848_brain_registry_source_alignment_inventory
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=NO
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Purpose
- Inspect source_exists=false rows in cx22073jw.vw_brain_data_registry_v1.
- Find actual cx22073jw / aiworker table or view candidates.
- Prepare next source alignment patch.

## Output
```
          section           | total_registry_count | existing_source_count | missing_source_count 
----------------------------+----------------------+-----------------------+----------------------
 01_registry_source_summary |                   14 |                    12 |                    2
(1 row)

           section           |         brain_data_code         | brain_domain_code | source_schema_name |  source_object_name  | source_record_code |   source_title_ja    | depth_code | risk_class_code | granularity_code 
-----------------------------+---------------------------------+-------------------+--------------------+----------------------+--------------------+----------------------+------------+-----------------+------------------
 02_missing_registry_sources | robot_aiworker_model_reference  | robot_aiworker    | aiworker           | robot_model_catalog  |                    | AIWorker機種参照     | standard   | medium          | view
 02_missing_registry_sources | robot_aiworker_series_reference | robot_aiworker    | aiworker           | robot_series_catalog |                    | AIWorkerシリーズ参照 | standard   | medium          | view
(2 rows)

           section            |               brain_data_code                |        brain_domain_code        | source_schema_name |              source_object_name              | source_record_code |        source_title_ja         
------------------------------+----------------------------------------------+---------------------------------+--------------------+----------------------------------------------+--------------------+--------------------------------
 03_existing_registry_sources | civilization_exam_question_bank              | exam_learning                   | cx22073jw          | civilization_exam_question_bank              |                    | Civilization試験問題バンク
 03_existing_registry_sources | civilization_foundation_history_detail_entry | civilization_foundation_history | cx22073jw          | civilization_foundation_history_detail_entry |                    | Civilization基礎史詳細エントリ
 03_existing_registry_sources | earth_history_detail_entry                   | history_worldview               | cx22073jw          | earth_history_detail_entry                   |                    | 地球史詳細エントリ
 03_existing_registry_sources | foundation_knowledge_material                | education_learning              | cx22073jw          | foundation_knowledge_material                |                    | 基礎知識資料
 03_existing_registry_sources | business_operation_reference                 | business_operation              | cx22073jw          | foundation_knowledge_topic                   | business_operation | 業務運用参照
 03_existing_registry_sources | city_art_game_reference                      | city_art_game                   | cx22073jw          | foundation_knowledge_topic                   | city_art_game      | 都市・アート・ゲーム参照
 03_existing_registry_sources | culture_region_light_knowledge               | culture_region                  | cx22073jw          | foundation_knowledge_topic                   | culture_region     | 文化・地域ライト知識
 03_existing_registry_sources | food_smalltalk_knowledge                     | food_nutrition                  | cx22073jw          | foundation_knowledge_topic                   | food               | 食べ物雑談・生活話題
 03_existing_registry_sources | foundation_knowledge_topic                   | education_learning              | cx22073jw          | foundation_knowledge_topic                   |                    | 基礎知識トピック
 03_existing_registry_sources | professional_basic_reference                 | professional_basic              | cx22073jw          | foundation_knowledge_topic                   | professional_basic | 専門基礎参照
 03_existing_registry_sources | season_smalltalk_knowledge                   | season_calendar                 | cx22073jw          | foundation_knowledge_topic                   | season             | 季節・暦雑談
 03_existing_registry_sources | security_crisis_reference_safe               | security_crisis                 | cx22073jw          | foundation_knowledge_topic                   | security_crisis    | 安全・危機管理参照
(12 rows)

            section            | schemaname |               tablename               
-------------------------------+------------+---------------------------------------
 04_aiworker_tables_candidates | aiworker   | beyond_model_quality_profile
 04_aiworker_tables_candidates | aiworker   | beyond_quality_level_catalog
 04_aiworker_tables_candidates | aiworker   | command_authority_role_catalog
 04_aiworker_tables_candidates | aiworker   | conversation_profile
 04_aiworker_tables_candidates | aiworker   | conversation_profile_step
 04_aiworker_tables_candidates | aiworker   | interaction_style_catalog
 04_aiworker_tables_candidates | aiworker   | manufacturer_catalog
 04_aiworker_tables_candidates | aiworker   | megami_model_profile
 04_aiworker_tables_candidates | aiworker   | model_identity_spec
 04_aiworker_tables_candidates | aiworker   | model_public_appearance_profile
 04_aiworker_tables_candidates | aiworker   | model_public_registry
 04_aiworker_tables_candidates | aiworker   | model_runtime_control_override
 04_aiworker_tables_candidates | aiworker   | model_service_assignment
 04_aiworker_tables_candidates | aiworker   | model_style_assignment
 04_aiworker_tables_candidates | aiworker   | payload_schema_catalog
 04_aiworker_tables_candidates | aiworker   | president_focus_area_catalog
 04_aiworker_tables_candidates | aiworker   | president_model_catalog
 04_aiworker_tables_candidates | aiworker   | president_operation_mode_catalog
 04_aiworker_tables_candidates | aiworker   | public_activity_profile
 04_aiworker_tables_candidates | aiworker   | robot_brain_access_tier_catalog
 04_aiworker_tables_candidates | aiworker   | robot_brain_model_domain_policy
 04_aiworker_tables_candidates | aiworker   | robot_brain_model_profile
 04_aiworker_tables_candidates | aiworker   | robot_brain_role_policy
 04_aiworker_tables_candidates | aiworker   | robot_brain_series_profile
 04_aiworker_tables_candidates | aiworker   | robot_capability_axis_catalog
 04_aiworker_tables_candidates | aiworker   | robot_capability_sharing_policy
 04_aiworker_tables_candidates | aiworker   | robot_capability_value_catalog
 04_aiworker_tables_candidates | aiworker   | robot_catalog_cleanup_audit_log
 04_aiworker_tables_candidates | aiworker   | robot_model_capability_profile
 04_aiworker_tables_candidates | aiworker   | robot_model_code_deprecation_map
 04_aiworker_tables_candidates | aiworker   | robot_model_personality_profile
 04_aiworker_tables_candidates | aiworker   | robot_model_public_profile
 04_aiworker_tables_candidates | aiworker   | robot_series_behavior_profile
 04_aiworker_tables_candidates | aiworker   | robot_series_capability_default
 04_aiworker_tables_candidates | aiworker   | runtime_control_axis_catalog
 04_aiworker_tables_candidates | aiworker   | runtime_control_value_catalog
 04_aiworker_tables_candidates | aiworker   | runtime_execution_state_catalog
 04_aiworker_tables_candidates | aiworker   | runtime_prompt_fragment_catalog
 04_aiworker_tables_candidates | aiworker   | series_public_registry
 04_aiworker_tables_candidates | aiworker   | series_runtime_control_default
 04_aiworker_tables_candidates | aiworker   | series_tendency_axis_catalog
 04_aiworker_tables_candidates | aiworker   | series_tendency_profile
 04_aiworker_tables_candidates | aiworker   | series_tendency_value_catalog
 04_aiworker_tables_candidates | aiworker   | service_catalog
 04_aiworker_tables_candidates | aiworker   | smalltalk_profile
 04_aiworker_tables_candidates | aiworker   | smalltalk_topic_catalog
 04_aiworker_tables_candidates | aiworker   | style_feature_axis_catalog
 04_aiworker_tables_candidates | aiworker   | style_feature_profile
 04_aiworker_tables_candidates | aiworker   | style_feature_value_catalog
 04_aiworker_tables_candidates | aiworker   | worker_assignment_fit_profile
 04_aiworker_tables_candidates | aiworker   | worker_growth_profile
 04_aiworker_tables_candidates | aiworker   | worker_manufacturer_extension_catalog
 04_aiworker_tables_candidates | aiworker   | worker_model_capability_profile
 04_aiworker_tables_candidates | aiworker   | worker_model_catalog
 04_aiworker_tables_candidates | aiworker   | worker_model_extension_catalog
 04_aiworker_tables_candidates | aiworker   | worker_privileged_profile
 04_aiworker_tables_candidates | aiworker   | worker_role_class_catalog
 04_aiworker_tables_candidates | aiworker   | worker_series_catalog
 04_aiworker_tables_candidates | aiworker   | worker_series_extension_catalog
 04_aiworker_tables_candidates | aiworker   | worker_series_tendency
(60 rows)

           section            | schemaname |                         viewname                         
------------------------------+------------+----------------------------------------------------------
 05_aiworker_views_candidates | aiworker   | vw_app_aiworker_model_capability_overlay_v1
 05_aiworker_views_candidates | aiworker   | vw_app_aiworker_model_selection_capability_card_v1
 05_aiworker_views_candidates | aiworker   | vw_app_aiworker_model_selection_directory_v1
 05_aiworker_views_candidates | aiworker   | vw_app_aiworker_model_selection_source_for_capability_v1
 05_aiworker_views_candidates | aiworker   | vw_app_aiworker_model_selection_summary_v1
 05_aiworker_views_candidates | aiworker   | vw_app_aiworker_robot_selection_card_v1
 05_aiworker_views_candidates | aiworker   | vw_app_aiworker_runtime_control_profile_v1
 05_aiworker_views_candidates | aiworker   | vw_app_aiworker_series_selection_directory_v1
 05_aiworker_views_candidates | aiworker   | vw_app_robot_capability_profile_directory_v1
 05_aiworker_views_candidates | aiworker   | vw_beyond_series_leader_lineup_v1
 05_aiworker_views_candidates | aiworker   | vw_beyond_series_leader_quality_lineup_v1
 05_aiworker_views_candidates | aiworker   | vw_beyond_series_lineup_v1
 05_aiworker_views_candidates | aiworker   | vw_beyond_series_quality_lineup_v1
 05_aiworker_views_candidates | aiworker   | vw_beyond_series_tendency_v1
 05_aiworker_views_candidates | aiworker   | vw_beyond_series_worker_lineup_v1
 05_aiworker_views_candidates | aiworker   | vw_beyond_series_worker_quality_lineup_v1
 05_aiworker_views_candidates | aiworker   | vw_dialog_profile_catalog
 05_aiworker_views_candidates | aiworker   | vw_dialog_profile_step_catalog
 05_aiworker_views_candidates | aiworker   | vw_dialog_redirect_template_catalog
 05_aiworker_views_candidates | aiworker   | vw_dialog_reference_scope_catalog
 05_aiworker_views_candidates | aiworker   | vw_dialog_rule_catalog
 05_aiworker_views_candidates | aiworker   | vw_interaction_style_catalog
 05_aiworker_views_candidates | aiworker   | vw_lovers_style_feature_profile_v1
 05_aiworker_views_candidates | aiworker   | vw_megami_norn_three_sisters_appearance_profile_v1
 05_aiworker_views_candidates | aiworker   | vw_megami_series_lineup_v1
 05_aiworker_views_candidates | aiworker   | vw_megami_series_tendency_v1
 05_aiworker_views_candidates | aiworker   | vw_model_growth_delta_summary
 05_aiworker_views_candidates | aiworker   | vw_model_public_directory_v1
 05_aiworker_views_candidates | aiworker   | vw_model_public_profile
 05_aiworker_views_candidates | aiworker   | vw_model_style_profile
 05_aiworker_views_candidates | aiworker   | vw_president_catalog_summary_v1
 05_aiworker_views_candidates | aiworker   | vw_president_hd_r5p_catalog_summary_v1
 05_aiworker_views_candidates | aiworker   | vw_robot_brain_compact_context_v1
 05_aiworker_views_candidates | aiworker   | vw_robot_brain_effective_access_v1
 05_aiworker_views_candidates | aiworker   | vw_robot_capability_sharing_policy_public_v1
 05_aiworker_views_candidates | aiworker   | vw_robot_model_capability_public_v1
 05_aiworker_views_candidates | aiworker   | vw_robot_readable_brain_source_registry_v1
 05_aiworker_views_candidates | aiworker   | vw_robot_series_capability_internal_v1
 05_aiworker_views_candidates | aiworker   | vw_robot_series_capability_matrix_public_v1
 05_aiworker_views_candidates | aiworker   | vw_robot_series_capability_public_v1
 05_aiworker_views_candidates | aiworker   | vw_series_public_directory_v1
 05_aiworker_views_candidates | aiworker   | vw_series_public_tendency_detail_v1
 05_aiworker_views_candidates | aiworker   | vw_worker_series_directory
 05_aiworker_views_candidates | aiworker   | vw_worker_series_lineup
 05_aiworker_views_candidates | aiworker   | vw_worker_series_search_directory
 05_aiworker_views_candidates | aiworker   | vw_worker_series_search_lineup
(46 rows)

         section         | schemaname |                  tablename                   
-------------------------+------------+----------------------------------------------
 06_cx_tables_candidates | cx22073jw  | brain_data_depth_catalog
 06_cx_tables_candidates | cx22073jw  | brain_data_domain_catalog
 06_cx_tables_candidates | cx22073jw  | brain_data_granularity_catalog
 06_cx_tables_candidates | cx22073jw  | brain_data_registry
 06_cx_tables_candidates | cx22073jw  | brain_data_risk_class_catalog
 06_cx_tables_candidates | cx22073jw  | brain_data_use_purpose_catalog
 06_cx_tables_candidates | cx22073jw  | business_support_knowledge_material
 06_cx_tables_candidates | cx22073jw  | business_support_knowledge_package
 06_cx_tables_candidates | cx22073jw  | business_support_topic
 06_cx_tables_candidates | cx22073jw  | civilization_exam_question_bank
 06_cx_tables_candidates | cx22073jw  | civilization_exam_question_choice
 06_cx_tables_candidates | cx22073jw  | civilization_foundation_history_detail_entry
 06_cx_tables_candidates | cx22073jw  | civilization_foundation_history_entry
 06_cx_tables_candidates | cx22073jw  | earth_history_detail_entry
 06_cx_tables_candidates | cx22073jw  | earth_history_knowledge_entry
 06_cx_tables_candidates | cx22073jw  | executive_strategy_knowledge_package
 06_cx_tables_candidates | cx22073jw  | executive_strategy_topic
 06_cx_tables_candidates | cx22073jw  | foundation_knowledge_material
 06_cx_tables_candidates | cx22073jw  | foundation_knowledge_topic
 06_cx_tables_candidates | cx22073jw  | history_knowledge_entry
 06_cx_tables_candidates | cx22073jw  | knowledge_article
 06_cx_tables_candidates | cx22073jw  | knowledge_chunk
 06_cx_tables_candidates | cx22073jw  | knowledge_entry
 06_cx_tables_candidates | cx22073jw  | published_knowledge_catalog
 06_cx_tables_candidates | cx22073jw  | published_knowledge_quality_metric
 06_cx_tables_candidates | cx22073jw  | relation_knowledge
 06_cx_tables_candidates | cx22073jw  | robot_role_knowledge_pack
 06_cx_tables_candidates | cx22073jw  | robot_role_knowledge_registration_run
 06_cx_tables_candidates | cx22073jw  | robot_role_knowledge_topic_binding
 06_cx_tables_candidates | cx22073jw  | staticart_knowledge_pack_run
 06_cx_tables_candidates | cx22073jw  | staticart_knowledge_pack_run_item
 06_cx_tables_candidates | cx22073jw  | staticart_knowledge_pack_sample_registry
 06_cx_tables_candidates | cx22073jw  | streaming_view_history_area
 06_cx_tables_candidates | cx22073jw  | system_to_cx_knowledge_transfer_block
 06_cx_tables_candidates | cx22073jw  | system_to_cx_knowledge_transfer_field
 06_cx_tables_candidates | cx22073jw  | system_to_cx_knowledge_transfer_profile
 06_cx_tables_candidates | cx22073jw  | system_to_cx_knowledge_transfer_rule_item
 06_cx_tables_candidates | cx22073jw  | topic_material
 06_cx_tables_candidates | cx22073jw  | topic_reference
(39 rows)

        section         | schemaname |                            viewname                             
------------------------+------------+-----------------------------------------------------------------
 07_cx_views_candidates | cx22073jw  | v_published_knowledge_ready_catalog
 07_cx_views_candidates | cx22073jw  | v_staticart_exact_knowledge_transfer_blocks
 07_cx_views_candidates | cx22073jw  | v_staticart_exact_knowledge_transfer_fields
 07_cx_views_candidates | cx22073jw  | v_staticart_exact_knowledge_transfer_rules
 07_cx_views_candidates | cx22073jw  | v_staticart_knowledge_pack_run_item_latest
 07_cx_views_candidates | cx22073jw  | v_staticart_knowledge_pack_run_latest
 07_cx_views_candidates | cx22073jw  | v_staticart_knowledge_pack_sample_registry_summary
 07_cx_views_candidates | cx22073jw  | v_streaming_view_history_area_latest
 07_cx_views_candidates | cx22073jw  | v_system_to_cx_knowledge_transfer_profile_summary
 07_cx_views_candidates | cx22073jw  | vw_aiemp_qualification_past_question_content
 07_cx_views_candidates | cx22073jw  | vw_aiemp_qualification_past_question_metadata
 07_cx_views_candidates | cx22073jw  | vw_brain_data_registry_v1
 07_cx_views_candidates | cx22073jw  | vw_business_support_knowledge_catalog
 07_cx_views_candidates | cx22073jw  | vw_civilization_exam_question_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_civilization_foundation_history_detail_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_civilization_foundation_history_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_earth_history_detail_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_earth_history_knowledge_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_executive_strategy_knowledge_catalog
 07_cx_views_candidates | cx22073jw  | vw_foundation_knowledge_material_v1
 07_cx_views_candidates | cx22073jw  | vw_history_detail_unified_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_history_exam_question_unified_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_knowledge_directory
 07_cx_views_candidates | cx22073jw  | vw_robot_model_civilization_foundation_history_detail_reference
 07_cx_views_candidates | cx22073jw  | vw_robot_model_earth_history_detail_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_model_history_detail_coverage_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_model_history_detail_unified_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_model_history_exam_unified_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_model_history_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_model_role_knowledge_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_role_civilization_history_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_role_earth_history_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_role_foundation_topic_reference_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_role_history_reference_bridge_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_role_knowledge_domain_v1
 07_cx_views_candidates | cx22073jw  | vw_robot_role_knowledge_pack_v1
 07_cx_views_candidates | cx22073jw  | vw_topic_directory
 07_cx_views_candidates | cx22073jw  | vw_topic_material_catalog
 07_cx_views_candidates | cx22073jw  | vw_topic_material_summary
(39 rows)

            section            |         brain_data_code         | brain_domain_code | missing_schema |    missing_object    | object_type | candidate_schema |               candidate_object               
-------------------------------+---------------------------------+-------------------+----------------+----------------------+-------------+------------------+----------------------------------------------
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | model_identity_spec
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | model_public_appearance_profile
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | model_public_registry
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | model_runtime_control_override
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | model_service_assignment
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | model_style_assignment
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_brain_access_tier_catalog
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_brain_model_domain_policy
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_brain_model_profile
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_brain_role_policy
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_brain_series_profile
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_capability_axis_catalog
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_capability_sharing_policy
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_capability_value_catalog
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_catalog_cleanup_audit_log
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_model_capability_profile
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_model_code_deprecation_map
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_model_personality_profile
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_model_public_profile
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_series_behavior_profile
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | table       | aiworker         | robot_series_capability_default
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | view        | aiworker         | vw_app_aiworker_robot_selection_card_v1
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | view        | aiworker         | vw_app_robot_capability_profile_directory_v1
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | view        | aiworker         | vw_robot_brain_compact_context_v1
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | view        | aiworker         | vw_robot_brain_effective_access_v1
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | view        | aiworker         | vw_robot_capability_sharing_policy_public_v1
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | view        | aiworker         | vw_robot_model_capability_public_v1
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | view        | aiworker         | vw_robot_readable_brain_source_registry_v1
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | view        | aiworker         | vw_robot_series_capability_internal_v1
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | view        | aiworker         | vw_robot_series_capability_matrix_public_v1
 08_name_similarity_candidates | robot_aiworker_model_reference  | robot_aiworker    | aiworker       | robot_model_catalog  | view        | aiworker         | vw_robot_series_capability_public_v1
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_brain_access_tier_catalog
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_brain_model_domain_policy
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_brain_model_profile
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_brain_role_policy
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_brain_series_profile
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_capability_axis_catalog
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_capability_sharing_policy
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_capability_value_catalog
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_catalog_cleanup_audit_log
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_model_capability_profile
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_model_code_deprecation_map
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_model_personality_profile
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_model_public_profile
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_series_behavior_profile
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | robot_series_capability_default
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | series_public_registry
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | series_runtime_control_default
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | series_tendency_axis_catalog
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | series_tendency_profile
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | table       | aiworker         | series_tendency_value_catalog
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | view        | aiworker         | vw_app_aiworker_robot_selection_card_v1
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | view        | aiworker         | vw_app_robot_capability_profile_directory_v1
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | view        | aiworker         | vw_robot_brain_compact_context_v1
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | view        | aiworker         | vw_robot_brain_effective_access_v1
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | view        | aiworker         | vw_robot_capability_sharing_policy_public_v1
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | view        | aiworker         | vw_robot_model_capability_public_v1
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | view        | aiworker         | vw_robot_readable_brain_source_registry_v1
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | view        | aiworker         | vw_robot_series_capability_internal_v1
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | view        | aiworker         | vw_robot_series_capability_matrix_public_v1
 08_name_similarity_candidates | robot_aiworker_series_reference | robot_aiworker    | aiworker       | robot_series_catalog | view        | aiworker         | vw_robot_series_capability_public_v1
(61 rows)

             section              |         brain_data_code         | brain_domain_code | source_schema_name |  source_object_name  |                                                        fix_hint                                                         
----------------------------------+---------------------------------+-------------------+--------------------+----------------------+-------------------------------------------------------------------------------------------------------------------------
 09_missing_source_exact_fix_hint | robot_aiworker_model_reference  | robot_aiworker    | aiworker           | robot_model_catalog  | Likely fix: point to existing aiworker robot/model/catalog view or keep as logical reference if no source table exists.
 09_missing_source_exact_fix_hint | robot_aiworker_series_reference | robot_aiworker    | aiworker           | robot_series_catalog | Likely fix: point to existing aiworker robot/series/model view or keep as logical reference if no source table exists.
(2 rows)

```

FINAL_STATUS=SOURCE_ALIGNMENT_INVENTORY_DONE_REVIEW_REQUIRED
NEXT=Apply source registry alignment patch if missing source objects have clear replacements
