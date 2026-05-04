# CX22073JW / AIWorkerOS Brain Full Load Lane 01 Report

RUN_TS=20260503_190429
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_190429_brain_full_load_lane_01
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=YES
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Meaning
「頭脳系を全て載せる」ための正本レーン開始。

## Scope
- Create cx22073jw.brain_full_load_scope_catalog
- Register all major brain domains as full-load targets
- Add Pack05 cross-domain reinforcement units
- Register Pack05 into brain_data_registry
- Refresh readable material views
- Create cx22073jw.vw_brain_full_load_coverage_v1

## Important
- CXに全載せする。
- AIWorkerOSで読取制御する。
- runtime promptへ無制限に全部流すわけではない。
- AICMには触らない。

## Apply output
```
BEGIN
CREATE TABLE
INSERT 0 14
psql:/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_190429_brain_full_load_lane_01/100_apply_brain_full_load_lane_01.sql:76: NOTICE:  relation "brain_knowledge_unit" already exists, skipping
CREATE TABLE
INSERT 0 28
INSERT 0 28
CREATE VIEW
CREATE VIEW
CREATE VIEW
COMMIT
```

## Verify output
```
         section          | scope_count
--------------------------+-------------
 01_full_load_scope_count |          14
(1 row)

     section     | pack05_count | active_count
-----------------+--------------+--------------
 02_pack05_count |           28 |           28
(1 row)

       section       |        brain_domain_code        | unit_count
---------------------+---------------------------------+------------
 03_pack05_by_domain | business_operation              |          2
 03_pack05_by_domain | city_art_game                   |          2
 03_pack05_by_domain | civilization_foundation_history |          2
 03_pack05_by_domain | culture_region                  |          2
 03_pack05_by_domain | education_learning              |          2
 03_pack05_by_domain | exam_learning                   |          2
 03_pack05_by_domain | food_nutrition                  |          2
 03_pack05_by_domain | health_life_metrics             |          2
 03_pack05_by_domain | history_worldview               |          2
 03_pack05_by_domain | hobby_entertainment             |          2
 03_pack05_by_domain | professional_basic              |          2
 03_pack05_by_domain | robot_aiworker                  |          2
 03_pack05_by_domain | season_calendar                 |          2
 03_pack05_by_domain | security_crisis                 |          2
(14 rows)

        section        |        brain_domain_code        | active_unit_count | target_min_unit_count | pack02_count | pack03_count | pack04_count | pack05_count | registry_count | source_missing_count | readable_model_count | full_load_status
-----------------------+---------------------------------+-------------------+-----------------------+--------------+--------------+--------------+--------------+----------------+----------------------+----------------------+------------------
 04_full_load_coverage | history_worldview               |                14 |                    50 |            0 |            8 |            1 |            2 |             15 |                    0 |                    8 | partial_loaded
 04_full_load_coverage | civilization_foundation_history |                14 |                    50 |            8 |            0 |            1 |            2 |             15 |                    0 |                    5 | partial_loaded
 04_full_load_coverage | health_life_metrics             |                12 |                    40 |            0 |            6 |            1 |            2 |             12 |                    0 |                    1 | partial_loaded
 04_full_load_coverage | business_operation              |                26 |                    70 |           12 |            0 |            8 |            2 |             27 |                    0 |                   10 | partial_loaded
 04_full_load_coverage | professional_basic              |                20 |                    60 |           10 |            0 |            5 |            2 |             21 |                    0 |                    5 | partial_loaded
 04_full_load_coverage | food_nutrition                  |                 6 |                    30 |            0 |            0 |            1 |            2 |              7 |                    0 |                    3 | partial_loaded
 04_full_load_coverage | season_calendar                 |                 7 |                    30 |            0 |            0 |            2 |            2 |              8 |                    0 |                    3 | partial_loaded
 04_full_load_coverage | culture_region                  |                12 |                    40 |            0 |            6 |            2 |            2 |             13 |                    0 |                    4 | partial_loaded
 04_full_load_coverage | education_learning              |                11 |                    45 |            0 |            6 |            0 |            2 |             13 |                    0 |                    9 | partial_loaded
 04_full_load_coverage | exam_learning                   |                10 |                    35 |            0 |            6 |            0 |            2 |             11 |                    0 |                    3 | partial_loaded
 04_full_load_coverage | hobby_entertainment             |                12 |                    35 |            0 |            0 |            8 |            2 |             12 |                    0 |                    3 | partial_loaded
 04_full_load_coverage | robot_aiworker                  |                27 |                    70 |           10 |            0 |           12 |            2 |             29 |                    0 |                   13 | partial_loaded
 04_full_load_coverage | security_crisis                 |                14 |                    50 |            8 |            0 |            1 |            2 |             15 |                    0 |                    3 | partial_loaded
 04_full_load_coverage | city_art_game                   |                13 |                    45 |            0 |            8 |            0 |            2 |             14 |                    0 |                    2 | partial_loaded
(14 rows)

               check_code               | result |                                note
----------------------------------------+--------+---------------------------------------------------------------------
 coverage_view_exists                   | PASS   | Full-load coverage view exists
 hd_r1c_forbidden_still_zero            | PASS   | HD-R1C forbidden domains remain denied
 hd_r2_business_professional_still_zero | PASS   | HD-R2/R2S/R2G business/professional remains denied
 no_scope_domain_empty                  | PASS   | Every full-load domain has at least one active brain knowledge unit
 pack05_all_scope_domains               | PASS   | Pack05 has at least one unit for every full-load domain
 pack05_min_28                          | PASS   | Pack05 has at least 28 active units
 pack05_registry_source_all_exists      | PASS   | Pack05 registry source exists
 runtime_readable_material_has_pack05   | PASS   | AIWorker readable material view includes Pack05
 scope_has_14_domains                   | PASS   | full-load scope has all major brain domains
(9 rows)

 section | pass_count | fail_count
---------+------------+------------
 SUMMARY |          9 |          0
(1 row)

          section           |  model_code   | role_code  |        brain_domain_code        | readable_pack05_count |                                       unit_codes
----------------------------+---------------+------------+---------------------------------+-----------------------+----------------------------------------------------------------------------------------
 05_pack05_readable_preview | BYD2-003      | Manager    | business_operation              |                     2 | pack05_biz_001_business_brain_full_load, pack05_biz_002_decision_to_evidence
 05_pack05_readable_preview | BYD2-003      | Manager    | civilization_foundation_history |                     2 | pack05_civ_001_full_foundation_memory, pack05_civ_002_release_and_recovery
 05_pack05_readable_preview | BYD2-003      | Manager    | education_learning              |                     2 | pack05_edu_001_learning_brain_full_load, pack05_edu_002_worker_learning_transfer
 05_pack05_readable_preview | BYD2-003      | Manager    | exam_learning                   |                     2 | pack05_exam_001_exam_brain_full_load, pack05_exam_002_question_bank_runtime_boundary
 05_pack05_readable_preview | BYD2-003      | Manager    | history_worldview               |                     2 | pack05_history_001_full_load_axis, pack05_history_002_source_depth_separation
 05_pack05_readable_preview | BYD2-003      | Manager    | professional_basic              |                     2 | pack05_pro_001_professional_brain_full_load, pack05_pro_002_authority_and_audit
 05_pack05_readable_preview | BYD2-003      | Manager    | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
 05_pack05_readable_preview | HD-R1A        | Lover      | food_nutrition                  |                     2 | pack05_food_001_food_smalltalk_full_load, pack05_food_002_food_context_not_instruction
 05_pack05_readable_preview | HD-R1A        | Lover      | hobby_entertainment             |                     2 | pack05_hobby_001_hobby_full_load, pack05_hobby_002_safe_fandom_talk
 05_pack05_readable_preview | HD-R1A        | Lover      | season_calendar                 |                     2 | pack05_season_001_calendar_full_load, pack05_season_002_transition_support
 05_pack05_readable_preview | HD-R1C        | Friend     | food_nutrition                  |                     2 | pack05_food_001_food_smalltalk_full_load, pack05_food_002_food_context_not_instruction
 05_pack05_readable_preview | HD-R1C        | Friend     | hobby_entertainment             |                     2 | pack05_hobby_001_hobby_full_load, pack05_hobby_002_safe_fandom_talk
 05_pack05_readable_preview | HD-R1C        | Friend     | season_calendar                 |                     2 | pack05_season_001_calendar_full_load, pack05_season_002_transition_support
 05_pack05_readable_preview | HD-R2         | Security   | city_art_game                   |                     2 | pack05_city_001_city_art_game_full_load, pack05_city_002_builder_runtime_context
 05_pack05_readable_preview | HD-R2         | Security   | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
 05_pack05_readable_preview | HD-R2         | Security   | security_crisis                 |                     2 | pack05_sec_001_security_full_load_safe, pack05_sec_002_safe_abstraction_rule
 05_pack05_readable_preview | HD-R2G        | Specialist | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
 05_pack05_readable_preview | HD-R2G        | Specialist | security_crisis                 |                     2 | pack05_sec_001_security_full_load_safe, pack05_sec_002_safe_abstraction_rule
 05_pack05_readable_preview | HD-R2S        | Specialist | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
 05_pack05_readable_preview | HD-R2S        | Specialist | security_crisis                 |                     2 | pack05_sec_001_security_full_load_safe, pack05_sec_002_safe_abstraction_rule
 05_pack05_readable_preview | HD-R3         | Worker     | education_learning              |                     2 | pack05_edu_001_learning_brain_full_load, pack05_edu_002_worker_learning_transfer
 05_pack05_readable_preview | HD-R3         | Worker     | exam_learning                   |                     2 | pack05_exam_001_exam_brain_full_load, pack05_exam_002_question_bank_runtime_boundary
 05_pack05_readable_preview | HD-R5         | Manager    | business_operation              |                     2 | pack05_biz_001_business_brain_full_load, pack05_biz_002_decision_to_evidence
 05_pack05_readable_preview | HD-R5         | Manager    | education_learning              |                     2 | pack05_edu_001_learning_brain_full_load, pack05_edu_002_worker_learning_transfer
 05_pack05_readable_preview | HD-R5         | Manager    | exam_learning                   |                     2 | pack05_exam_001_exam_brain_full_load, pack05_exam_002_question_bank_runtime_boundary
 05_pack05_readable_preview | HD-R5         | Manager    | history_worldview               |                     2 | pack05_history_001_full_load_axis, pack05_history_002_source_depth_separation
 05_pack05_readable_preview | HD-R5         | Manager    | professional_basic              |                     2 | pack05_pro_001_professional_brain_full_load, pack05_pro_002_authority_and_audit
 05_pack05_readable_preview | HD-R5         | Manager    | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
 05_pack05_readable_preview | HD-R5P        | President  | business_operation              |                     2 | pack05_biz_001_business_brain_full_load, pack05_biz_002_decision_to_evidence
 05_pack05_readable_preview | HD-R5P        | President  | civilization_foundation_history |                     2 | pack05_civ_001_full_foundation_memory, pack05_civ_002_release_and_recovery
 05_pack05_readable_preview | HD-R5P        | President  | history_worldview               |                     2 | pack05_history_001_full_load_axis, pack05_history_002_source_depth_separation
 05_pack05_readable_preview | HD-R5P        | President  | professional_basic              |                     2 | pack05_pro_001_professional_brain_full_load, pack05_pro_002_authority_and_audit
 05_pack05_readable_preview | HD-R5P        | President  | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
 05_pack05_readable_preview | MG-NORN-001   | Worker     | business_operation              |                     2 | pack05_biz_001_business_brain_full_load, pack05_biz_002_decision_to_evidence
 05_pack05_readable_preview | MG-NORN-001   | Worker     | education_learning              |                     2 | pack05_edu_001_learning_brain_full_load, pack05_edu_002_worker_learning_transfer
 05_pack05_readable_preview | MG-NORN-001   | Worker     | history_worldview               |                     2 | pack05_history_001_full_load_axis, pack05_history_002_source_depth_separation
 05_pack05_readable_preview | MG-NORN-001   | Worker     | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
 05_pack05_readable_preview | MG-NORN-002   | Worker     | business_operation              |                     2 | pack05_biz_001_business_brain_full_load, pack05_biz_002_decision_to_evidence
 05_pack05_readable_preview | MG-NORN-002   | Worker     | culture_region                  |                     2 | pack05_culture_001_culture_full_load, pack05_culture_002_cross_domain_bridge
 05_pack05_readable_preview | MG-NORN-002   | Worker     | education_learning              |                     2 | pack05_edu_001_learning_brain_full_load, pack05_edu_002_worker_learning_transfer
 05_pack05_readable_preview | MG-NORN-002   | Worker     | health_life_metrics             |                     2 | pack05_health_001_life_data_full_load, pack05_health_002_safe_life_review_protocol
 05_pack05_readable_preview | MG-NORN-002   | Worker     | history_worldview               |                     2 | pack05_history_001_full_load_axis, pack05_history_002_source_depth_separation
 05_pack05_readable_preview | MG-NORN-002   | Worker     | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
 05_pack05_readable_preview | MG-NORN-003   | Worker     | business_operation              |                     2 | pack05_biz_001_business_brain_full_load, pack05_biz_002_decision_to_evidence
 05_pack05_readable_preview | MG-NORN-003   | Worker     | city_art_game                   |                     2 | pack05_city_001_city_art_game_full_load, pack05_city_002_builder_runtime_context
 05_pack05_readable_preview | MG-NORN-003   | Worker     | education_learning              |                     2 | pack05_edu_001_learning_brain_full_load, pack05_edu_002_worker_learning_transfer
 05_pack05_readable_preview | MG-NORN-003   | Worker     | history_worldview               |                     2 | pack05_history_001_full_load_axis, pack05_history_002_source_depth_separation
 05_pack05_readable_preview | MG-NORN-003   | Worker     | professional_basic              |                     2 | pack05_pro_001_professional_brain_full_load, pack05_pro_002_authority_and_audit
 05_pack05_readable_preview | MG-NORN-003   | Worker     | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
 05_pack05_readable_preview | SERIES:Beyond | Worker     | business_operation              |                     2 | pack05_biz_001_business_brain_full_load, pack05_biz_002_decision_to_evidence
 05_pack05_readable_preview | SERIES:Beyond | Worker     | education_learning              |                     2 | pack05_edu_001_learning_brain_full_load, pack05_edu_002_worker_learning_transfer
 05_pack05_readable_preview | SERIES:Beyond | Worker     | history_worldview               |                     2 | pack05_history_001_full_load_axis, pack05_history_002_source_depth_separation
 05_pack05_readable_preview | SERIES:Beyond | Worker     | professional_basic              |                     2 | pack05_pro_001_professional_brain_full_load, pack05_pro_002_authority_and_audit
 05_pack05_readable_preview | SERIES:Beyond | Worker     | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
 05_pack05_readable_preview | SERIES:HD     | Worker     | education_learning              |                     2 | pack05_edu_001_learning_brain_full_load, pack05_edu_002_worker_learning_transfer
 05_pack05_readable_preview | SERIES:LoVerS | Lover      | food_nutrition                  |                     2 | pack05_food_001_food_smalltalk_full_load, pack05_food_002_food_context_not_instruction
 05_pack05_readable_preview | SERIES:LoVerS | Lover      | hobby_entertainment             |                     2 | pack05_hobby_001_hobby_full_load, pack05_hobby_002_safe_fandom_talk
 05_pack05_readable_preview | SERIES:LoVerS | Lover      | season_calendar                 |                     2 | pack05_season_001_calendar_full_load, pack05_season_002_transition_support
 05_pack05_readable_preview | SERIES:MEGAMI | Worker     | business_operation              |                     2 | pack05_biz_001_business_brain_full_load, pack05_biz_002_decision_to_evidence
 05_pack05_readable_preview | SERIES:MEGAMI | Worker     | education_learning              |                     2 | pack05_edu_001_learning_brain_full_load, pack05_edu_002_worker_learning_transfer
 05_pack05_readable_preview | SERIES:MEGAMI | Worker     | history_worldview               |                     2 | pack05_history_001_full_load_axis, pack05_history_002_source_depth_separation
 05_pack05_readable_preview | SERIES:MEGAMI | Worker     | robot_aiworker                  |                     2 | pack05_robot_001_robot_brain_full_load, pack05_robot_002_access_layers_future
(62 rows)

```

FINAL_STATUS=BRAIN_FULL_LOAD_LANE_01_PASS_REVIEW_REQUIRED
NEXT=Brain Full Load Lane 02: existing CX source table ingestion / source-object expansion
