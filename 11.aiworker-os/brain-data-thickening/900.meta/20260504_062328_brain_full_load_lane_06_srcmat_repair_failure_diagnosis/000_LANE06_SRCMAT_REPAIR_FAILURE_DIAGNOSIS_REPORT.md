# Lane06 srcmat Repair Failure Diagnosis Report

RUN_TS=20260504_062328
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_062328_brain_full_load_lane_06_srcmat_repair_failure_diagnosis
DB_WRITE=NO
FILE_PATCH=NO
AICM_TOUCH=NO

## Source
- LATEST_REPAIR_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_061524_brain_full_load_lane_06_srcmat_priority_repair
- VERIFY_LOG_SOURCE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_061524_brain_full_load_lane_06_srcmat_priority_repair/210_verify.log

## Outputs
- FAIL_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_062328_brain_full_load_lane_06_srcmat_repair_failure_diagnosis/010_fail_extract.txt
- SQL_LOG=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_062328_brain_full_load_lane_06_srcmat_repair_failure_diagnosis/110_lane06_srcmat_repair_failure_diagnosis.log

## Fail extract
```
LATEST_REPAIR_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_061524_brain_full_load_lane_06_srcmat_priority_repair
VERIFY_LOG_SOURCE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_061524_brain_full_load_lane_06_srcmat_priority_repair/210_verify.log

18: 04_smoke_board | byd2003_review       | BYD2-003    | review             |              8 |               10 |               8 |                8 |                8 |          56 |                   0 | FAIL_TOO_FEW      | {source_registry}
54: all_smoke_cases_pass                   | FAIL   | all runtime selection smoke cases pass
60: selection_has_lane05                   | FAIL   | selection still includes Lane05 fill-up materials

---- check area ----
               check_code               | result |                            note
----------------------------------------+--------+-------------------------------------------------------------
 all_smoke_cases_pass                   | FAIL   | all runtime selection smoke cases pass
 domain_limit_enforced                  | PASS   | domain rank limit is enforced
 hd_r1c_forbidden_still_zero            | PASS   | HD-R1C forbidden domains remain denied through selector
 hd_r2_business_professional_still_zero | PASS   | HD-R2 business/professional remains denied through selector
 scoring_base_view_exists               | PASS   | scoring base view exists
 selection_function_exists              | PASS   | selection function exists
 selection_has_lane05                   | FAIL   | selection still includes Lane05 fill-up materials
 selection_has_srcmat                   | PASS   | selection can include source-registry materials
(8 rows)

 section | pass_count | fail_count
---------+------------+------------
 SUMMARY |          6 |          2

---- smoke board ----
 04_smoke_board | byd2003_review       | BYD2-003    | review             |              8 |               10 |               8 |                8 |                8 |          56 |                   0 | FAIL_TOO_FEW      | {source_registry}
 04_smoke_board | hd_r1c_smalltalk     | HD-R1C      | smalltalk          |             30 |                4 |              10 |               10 |               40 |          40 |                   0 | PASS              | {lane05_fillup,source_registry}
 04_smoke_board | hd_r2_risk           | HD-R2       | risk_check         |             14 |                4 |              10 |               10 |               14 |          35 |                   0 | PASS              | {source_registry}
 04_smoke_board | hd_r3_worker_exam    | HD-R3       | exam_practice      |             10 |                4 |              10 |               10 |               10 |          30 |                   0 | PASS              | {source_registry}
 04_smoke_board | hd_r5_manager        | HD-R5       | business_planning  |             15 |                6 |              12 |               12 |               36 |          36 |                   0 | PASS              | {source_registry}
 04_smoke_board | hd_r5p_executive     | HD-R5P      | executive_planning |             22 |                6 |              12 |               12 |               22 |          36 |                   0 | PASS              | {source_registry}
 04_smoke_board | mg_norn_002_health   | MG-NORN-002 | health_life_review |             15 |                4 |              10 |               10 |               15 |          35 |                   0 | PASS              | {source_registry}
 04_smoke_board | mg_norn_003_business | MG-NORN-003 | business_planning  |             13 |                4 |              10 |               10 |               35 |          35 |                   0 | PASS              | {source_registry}
(8 rows)

           section           | model_code | brain_domain_code |                                      unit_code                                      | material_source_kind | selection_score | domain_rank | overall_rank |                            title_preview
-----------------------------+------------+-------------------+-------------------------------------------------------------------------------------+----------------------+-----------------+-------------+--------------+----------------------------------------------------------------------
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_earth_history_detail_entry                                                   | source_registry      |          123240 |           1 |            1 | 地球史詳細エントリ

---- source kind counts ----
 03_source_kind_counts_byd2003_review | source_registry      |             20
(1 row)

    section     |   smoke_case_code    | model_code  |  use_purpose_code  | selected_count | min_result_count | max_domain_rank | limit_per_domain | max_overall_rank | total_limit | forbidden_hit_count | smoke_result_code |      selected_source_kinds
----------------+----------------------+-------------+--------------------+----------------+------------------+-----------------+------------------+------------------+-------------+---------------------+-------------------+---------------------------------
 04_smoke_board | byd2003_review       | BYD2-003    | review             |              8 |               10 |               8 |                8 |                8 |          56 |                   0 | FAIL_TOO_FEW      | {source_registry}
```

## SQL diagnosis
```
           section           |      check_code      | result |                       note
-----------------------------+----------------------+--------+---------------------------------------------------
 01_failed_checks_recomputed | all_smoke_cases_pass | FAIL   | all runtime selection smoke cases pass
 01_failed_checks_recomputed | selection_has_lane05 | FAIL   | selection still includes Lane05 fill-up materials
(2 rows)

        section        | smoke_case_code | model_code | use_purpose_code | selected_count | min_result_count | max_domain_rank | limit_per_domain | max_overall_rank | total_limit | forbidden_hit_count | smoke_result_code | selected_source_kinds
-----------------------+-----------------+------------+------------------+----------------+------------------+-----------------+------------------+------------------+-------------+---------------------+-------------------+-----------------------
 02_smoke_board_failed | byd2003_review  | BYD2-003   | review           |              8 |               10 |               8 |                8 |                8 |          56 |                   0 | FAIL_TOO_FEW      | {source_registry}
(1 row)

      section       |   smoke_case_code    | model_code  |  use_purpose_code  | selected_count | min_result_count | max_domain_rank | limit_per_domain | max_overall_rank | total_limit | forbidden_hit_count | smoke_result_code |      selected_source_kinds
--------------------+----------------------+-------------+--------------------+----------------+------------------+-----------------+------------------+------------------+-------------+---------------------+-------------------+---------------------------------
 03_smoke_board_all | byd2003_review       | BYD2-003    | review             |              8 |               10 |               8 |                8 |                8 |          56 |                   0 | FAIL_TOO_FEW      | {source_registry}
 03_smoke_board_all | hd_r1c_smalltalk     | HD-R1C      | smalltalk          |             30 |                4 |              10 |               10 |               40 |          40 |                   0 | PASS              | {lane05_fillup,source_registry}
 03_smoke_board_all | hd_r2_risk           | HD-R2       | risk_check         |             14 |                4 |              10 |               10 |               14 |          35 |                   0 | PASS              | {source_registry}
 03_smoke_board_all | hd_r3_worker_exam    | HD-R3       | exam_practice      |             10 |                4 |              10 |               10 |               10 |          30 |                   0 | PASS              | {source_registry}
 03_smoke_board_all | hd_r5_manager        | HD-R5       | business_planning  |             15 |                6 |              12 |               12 |               36 |          36 |                   0 | PASS              | {source_registry}
 03_smoke_board_all | hd_r5p_executive     | HD-R5P      | executive_planning |             22 |                6 |              12 |               12 |               22 |          36 |                   0 | PASS              | {source_registry}
 03_smoke_board_all | mg_norn_002_health   | MG-NORN-002 | health_life_review |             15 |                4 |              10 |               10 |               15 |          35 |                   0 | PASS              | {source_registry}
 03_smoke_board_all | mg_norn_003_business | MG-NORN-003 | business_planning  |             13 |                4 |              10 |               10 |               35 |          35 |                   0 | PASS              | {source_registry}
(8 rows)

            section            | material_source_kind | selected_count | min_overall_rank | max_overall_rank
-------------------------------+----------------------+----------------+------------------+------------------
 04_byd2003_review_source_kind | source_registry      |             20 |                1 |               20
(1 row)

             section             | material_source_kind |        brain_domain_code        | selected_count | min_overall_rank | max_overall_rank
---------------------------------+----------------------+---------------------------------+----------------+------------------+------------------
 05_hd_r5p_executive_source_kind | source_registry      | business_operation              |             20 |               11 |               30
 05_hd_r5p_executive_source_kind | source_registry      | civilization_foundation_history |             10 |                1 |               10
 05_hd_r5p_executive_source_kind | source_registry      | robot_aiworker                  |             20 |               43 |               62
(3 rows)

                    section                     | model_code |        brain_domain_code        | available_srcmat_count
------------------------------------------------+------------+---------------------------------+------------------------
 06_available_srcmat_by_byd2003_before_selector | BYD2-003   | civilization_foundation_history |                     10
 06_available_srcmat_by_byd2003_before_selector | BYD2-003   | education_learning              |                     34
 06_available_srcmat_by_byd2003_before_selector | BYD2-003   | exam_learning                   |                    229
 06_available_srcmat_by_byd2003_before_selector | BYD2-003   | history_worldview               |                    171
(4 rows)

                    section                    | model_code |        brain_domain_code        | available_lane05_count
-----------------------------------------------+------------+---------------------------------+------------------------
 07_available_lane05_by_hd_r5p_before_selector | HD-R5P     | business_operation              |                     44
 07_available_lane05_by_hd_r5p_before_selector | HD-R5P     | civilization_foundation_history |                     36
 07_available_lane05_by_hd_r5p_before_selector | HD-R5P     | robot_aiworker                  |                     43
(3 rows)

           section            | model_code | brain_domain_code |                                      unit_code                                      | material_source_kind | selection_score | domain_rank | overall_rank |                            title_preview
------------------------------+------------+-------------------+-------------------------------------------------------------------------------------+----------------------+-----------------+-------------+--------------+----------------------------------------------------------------------
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_earth_history_detail_entry                                                   | source_registry      |          123240 |           1 |            1 | 地球史詳細エントリ
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_earth_history_detail_entry                                            | source_registry      |          123240 |           2 |            2 | CX source object: earth_history_detail_entry
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_earth_history_knowledge_entry                                  | source_registry      |          123240 |           3 |            3 | CX source object: earth_history_knowledge_entry
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_history_knowledge_entry                                        | source_registry      |          123240 |           4 |            4 | CX source object: history_knowledge_entry
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_streaming_view_history_area                                    | source_registry      |          123240 |           5 |            5 | CX source object: streaming_view_history_area
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_v_streaming_view_history_area_latest                           | source_registry      |          123240 |           6 |            6 | CX source object: v_streaming_view_history_area_latest
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_earth_history_detail_reference_v1                           | source_registry      |          123240 |           7 |            7 | CX source object: vw_earth_history_detail_reference_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_earth_history_knowledge_reference_v1                        | source_registry      |          123240 |           8 |            8 | CX source object: vw_earth_history_knowledge_reference_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_history_detail_unified_reference_v1                         | source_registry      |          123240 |           9 |            9 | CX source object: vw_history_detail_unified_reference_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_history_exam_question_unified_reference_v1                  | source_registry      |          123240 |          10 |           10 | CX source object: vw_history_exam_question_unified_reference_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_model_earth_history_detail_reference_v1               | source_registry      |          123240 |          11 |           11 | CX source object: vw_robot_model_earth_history_detail_reference_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_model_history_detail_coverage_v1                      | source_registry      |          123240 |          12 |           12 | CX source object: vw_robot_model_history_detail_coverage_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_model_history_detail_unified_reference_v1             | source_registry      |          123240 |          13 |           13 | CX source object: vw_robot_model_history_detail_unified_reference_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_model_history_exam_unified_reference_v1               | source_registry      |          123240 |          14 |           14 | CX source object: vw_robot_model_history_exam_unified_reference_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_model_history_reference_v1                            | source_registry      |          123240 |          15 |           15 | CX source object: vw_robot_model_history_reference_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_role_civilization_history_reference_v1                | source_registry      |          123240 |          16 |           16 | CX source object: vw_robot_role_civilization_history_reference_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_role_earth_history_reference_v1                       | source_registry      |          123240 |          17 |           17 | CX source object: vw_robot_role_earth_history_reference_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_role_history_reference_bridge_v1                      | source_registry      |          123240 |          18 |           18 | CX source object: vw_robot_role_history_reference_bridge_v1
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcrow_earth_history_detail_entry_e9d10df0af4728b1089c655e1a1be8e8           | source_registry      |          123240 |          19 |           19 | 律令制
 08_selection_preview_byd2003 | BYD2-003   | history_worldview | srcmat_srcrow_lane03_earth_history_knowledge_entry_af464b5e93a5d2a0dc2138280d87e86b | source_registry      |          123240 |          20 |           20 | 各国史の基本フレーム
(20 rows)

           section           | model_code |        brain_domain_code        |                                                  unit_code                                                   | material_source_kind | selection_score | domain_rank | overall_rank |                                   title_preview
-----------------------------+------------+---------------------------------+--------------------------------------------------------------------------------------------------------------+----------------------+-----------------+-------------+--------------+-----------------------------------------------------------------------------------
 09_selection_preview_hd_r5p | HD-R5P     | civilization_foundation_history | srcmat_civilization_foundation_history_detail_entry                                                          | source_registry      |          123239 |           1 |            1 | Civilization基礎史詳細エントリ
 09_selection_preview_hd_r5p | HD-R5P     | civilization_foundation_history | srcmat_srcobj_civilization_foundation_history_detail_entry                                                   | source_registry      |          123239 |           2 |            2 | CX source object: civilization_foundation_history_detail_entry
 09_selection_preview_hd_r5p | HD-R5P     | civilization_foundation_history | srcmat_srcobj_lane03_civilization_foundation_history_entry                                                   | source_registry      |          123239 |           3 |            3 | CX source object: civilization_foundation_history_entry
 09_selection_preview_hd_r5p | HD-R5P     | civilization_foundation_history | srcmat_srcobj_lane03_vw_civilization_foundation_history_detail_reference_v1                                  | source_registry      |          123239 |           4 |            4 | CX source object: vw_civilization_foundation_history_detail_reference_v1
 09_selection_preview_hd_r5p | HD-R5P     | civilization_foundation_history | srcmat_srcobj_lane03_vw_civilization_foundation_history_reference_v1                                         | source_registry      |          123239 |           5 |            5 | CX source object: vw_civilization_foundation_history_reference_v1
 09_selection_preview_hd_r5p | HD-R5P     | civilization_foundation_history | srcmat_srcobj_lane03_vw_robot_model_civilization_foundation_history_detail_reference                         | source_registry      |          123239 |           6 |            6 | CX source object: vw_robot_model_civilization_foundation_history_detail_reference
 09_selection_preview_hd_r5p | HD-R5P     | civilization_foundation_history | srcmat_srcrow_civilization_foundation_history_detail_entry_cfde0988544f7d62a05f25bfa40a5b78                  | source_registry      |          123239 |           7 |            7 | Year 10: 複数地域事件索引
 09_selection_preview_hd_r5p | HD-R5P     | civilization_foundation_history | srcmat_srcrow_lane03_civilization_foundation_history_entry_ca6908c15c38a9c5b904fb0c9fe5af65                  | source_registry      |          123239 |           8 |            8 | Civilizationのシステム構造
 09_selection_preview_hd_r5p | HD-R5P     | civilization_foundation_history | srcmat_srcrow_lane03_vw_civilization_foundation_history_detail_reference_v1_add55380218b5cb99d67c473ff557723 | source_registry      |          123239 |           9 |            9 | Year 10: 複数地域事件索引
 09_selection_preview_hd_r5p | HD-R5P     | civilization_foundation_history | srcmat_srcrow_lane03_vw_civilization_foundation_history_reference_v1_e033ddb24575ceffb82212c792b86ac3        | source_registry      |          123239 |          10 |           10 | Civilizationのシステム構造
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_business_operation_reference                                                                          | source_registry      |          123120 |           1 |           11 | 業務運用参照
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcobj_lane03_business_support_knowledge_material                                                     | source_registry      |          123120 |           2 |           12 | CX source object: business_support_knowledge_material
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcobj_lane03_business_support_knowledge_package                                                      | source_registry      |          123120 |           3 |           13 | CX source object: business_support_knowledge_package
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcobj_lane03_business_support_topic                                                                  | source_registry      |          123120 |           4 |           14 | CX source object: business_support_topic
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcobj_lane03_candidate_ledger_source_registry                                                        | source_registry      |          123120 |           5 |           15 | CX source object: candidate_ledger_source_registry
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcobj_lane03_vw_aiemp_utility_daily_task_context                                                     | source_registry      |          123120 |           6 |           16 | CX source object: vw_aiemp_utility_daily_task_context
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcobj_lane03_vw_aiemp_workforce_app_operation_context                                                | source_registry      |          123120 |           7 |           17 | CX source object: vw_aiemp_workforce_app_operation_context
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcobj_lane03_vw_business_support_knowledge_catalog                                                   | source_registry      |          123120 |           8 |           18 | CX source object: vw_business_support_knowledge_catalog
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_knowledge_material_15b0e1546323d07e0db4df33b5a759bf                    | source_registry      |          123120 |           9 |           19 | business_support_knowledge_material: helpdesk_triage
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_knowledge_material_4d7a986e3bc71bbc215247ea9d94d7d5                    | source_registry      |          123120 |          10 |           20 | business_support_knowledge_material: proposal_value_structure
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_knowledge_material_7defbcf51517560e54bb99fbf1148dbd                    | source_registry      |          123120 |          11 |           21 | business_support_knowledge_material: research_material_structure
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_knowledge_material_9a307ceb656a51aa30c3926a5131b404                    | source_registry      |          123120 |          12 |           22 | business_support_knowledge_material: pg_dev_controlled_apply
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_knowledge_material_b327614277d08ec57ea5ff6b76091981                    | source_registry      |          123120 |          13 |           23 | business_support_knowledge_material: planning_document_structure
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_knowledge_material_cbae357ecc1bb57d0651fcf5a7f9f5e9                    | source_registry      |          123120 |          14 |           24 | business_support_knowledge_material: manager_pm_standard_basis
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_knowledge_material_dc343c5ad91577679a47e40c4e758f8c                    | source_registry      |          123120 |          15 |           25 | business_support_knowledge_material: wlm_basic_split
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_knowledge_material_f0436b9017adae2fa73b9eac22183ecd                    | source_registry      |          123120 |          16 |           26 | business_support_knowledge_material: summary_preserve_basis
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_topic_3b61fcee24221bdb4d43d0bb40fae322                                 | source_registry      |          123120 |          17 |           27 | business_support_topic: proposal_business
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_topic_6e80e5d820dc67aee8bc4991e126b46e                                 | source_registry      |          123120 |          18 |           28 | business_support_topic: summarization
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_topic_85571d25a6c1d819632ffd89534549c0                                 | source_registry      |          123120 |          19 |           29 | business_support_topic: research_document
 09_selection_preview_hd_r5p | HD-R5P     | business_operation              | srcmat_srcrow_lane03_business_support_topic_9b66d81bd72f24b12600975a04dc9cba                                 | source_registry      |          123120 |          20 |           30 | business_support_topic: project_management
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_robot_aiworker_model_reference                                                                        | source_registry      |          123080 |           1 |           43 | AIWorker機種参照
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_robot_aiworker_series_reference                                                                       | source_registry      |          123080 |           2 |           44 | AIWorkerシリーズ参照
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_robot_model_role_reference_binding                                                      | source_registry      |          123080 |           3 |           45 | CX source object: robot_model_role_reference_binding
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_robot_role_knowledge_pack                                                               | source_registry      |          123080 |           4 |           46 | CX source object: robot_role_knowledge_pack
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_robot_role_knowledge_registration_run                                                   | source_registry      |          123080 |           5 |           47 | CX source object: robot_role_knowledge_registration_run
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_robot_role_knowledge_topic_binding                                                      | source_registry      |          123080 |           6 |           48 | CX source object: robot_role_knowledge_topic_binding
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_robot_role_series_supplement                                                            | source_registry      |          123080 |           7 |           49 | CX source object: robot_role_series_supplement
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_model_cx_reference_coverage_v1                                                 | source_registry      |          123080 |           8 |           50 | CX source object: vw_robot_model_cx_reference_coverage_v1
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_model_foundation_material_reference_v1                                         | source_registry      |          123080 |           9 |           51 | CX source object: vw_robot_model_foundation_material_reference_v1
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_model_full_reference_v1                                                        | source_registry      |          123080 |          10 |           52 | CX source object: vw_robot_model_full_reference_v1
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_model_full_reference_v2                                                        | source_registry      |          123080 |          11 |           53 | CX source object: vw_robot_model_full_reference_v2
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_model_full_reference_v3                                                        | source_registry      |          123080 |          12 |           54 | CX source object: vw_robot_model_full_reference_v3
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_model_role_knowledge_reference_v1                                              | source_registry      |          123080 |          13 |           55 | CX source object: vw_robot_model_role_knowledge_reference_v1
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_personality_reference_v1                                                       | source_registry      |          123080 |          14 |           56 | CX source object: vw_robot_personality_reference_v1
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_public_profile_reference_v1                                                    | source_registry      |          123080 |          15 |           57 | CX source object: vw_robot_public_profile_reference_v1
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_role_foundation_material_reference_v1                                          | source_registry      |          123080 |          16 |           58 | CX source object: vw_robot_role_foundation_material_reference_v1
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_role_foundation_topic_reference_v1                                             | source_registry      |          123080 |          17 |           59 | CX source object: vw_robot_role_foundation_topic_reference_v1
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_role_knowledge_domain_v1                                                       | source_registry      |          123080 |          18 |           60 | CX source object: vw_robot_role_knowledge_domain_v1
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_role_knowledge_pack_v1                                                         | source_registry      |          123080 |          19 |           61 | CX source object: vw_robot_role_knowledge_pack_v1
 09_selection_preview_hd_r5p | HD-R5P     | robot_aiworker                  | srcmat_srcobj_lane03_vw_robot_role_reference_v1                                                              | source_registry      |          123080 |          20 |           62 | CX source object: vw_robot_role_reference_v1
(50 rows)

```

FINAL_STATUS=LANE06_SRCMAT_REPAIR_FAILURE_DIAGNOSIS_DONE_REVIEW_REQUIRED
NEXT=Lane06 selector balance repair
