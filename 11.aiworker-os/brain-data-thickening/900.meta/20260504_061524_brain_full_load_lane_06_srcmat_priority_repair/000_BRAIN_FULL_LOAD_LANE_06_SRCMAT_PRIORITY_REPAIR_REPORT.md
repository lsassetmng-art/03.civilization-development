# Brain Full Load Lane 06 srcmat Priority Repair Report

RUN_TS=20260504_061524
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_061524_brain_full_load_lane_06_srcmat_priority_repair
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=YES
FILE_PATCH=NO
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Cause
Lane05 fill-up materials dominated runtime selection and pushed source-registry srcmat_ materials outside total_limit.

## Repair
- Increase source_registry/srcmat score above lane05_fillup.
- Keep lane05_fillup selected.
- Keep forbidden domain boundaries.

## Apply output
```
BEGIN
DO
INSERT 0 1
CREATE VIEW
CREATE FUNCTION
COMMENT
COMMIT
```

## Verify output
```
          section          | srcmat_selected_count
---------------------------+-----------------------
 01_srcmat_selection_count |                    20
(1 row)

          section          | lane05_selected_count
---------------------------+-----------------------
 02_lane05_selection_count |                     0
(1 row)

               section                | material_source_kind | selected_count
--------------------------------------+----------------------+----------------
 03_source_kind_counts_byd2003_review | source_registry      |             20
(1 row)

    section     |   smoke_case_code    | model_code  |  use_purpose_code  | selected_count | min_result_count | max_domain_rank | limit_per_domain | max_overall_rank | total_limit | forbidden_hit_count | smoke_result_code |      selected_source_kinds
----------------+----------------------+-------------+--------------------+----------------+------------------+-----------------+------------------+------------------+-------------+---------------------+-------------------+---------------------------------
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
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_earth_history_detail_entry                                            | source_registry      |          123240 |           2 |            2 | CX source object: earth_history_detail_entry
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_earth_history_knowledge_entry                                  | source_registry      |          123240 |           3 |            3 | CX source object: earth_history_knowledge_entry
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_history_knowledge_entry                                        | source_registry      |          123240 |           4 |            4 | CX source object: history_knowledge_entry
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_streaming_view_history_area                                    | source_registry      |          123240 |           5 |            5 | CX source object: streaming_view_history_area
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_v_streaming_view_history_area_latest                           | source_registry      |          123240 |           6 |            6 | CX source object: v_streaming_view_history_area_latest
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_earth_history_detail_reference_v1                           | source_registry      |          123240 |           7 |            7 | CX source object: vw_earth_history_detail_reference_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_earth_history_knowledge_reference_v1                        | source_registry      |          123240 |           8 |            8 | CX source object: vw_earth_history_knowledge_reference_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_history_detail_unified_reference_v1                         | source_registry      |          123240 |           9 |            9 | CX source object: vw_history_detail_unified_reference_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_history_exam_question_unified_reference_v1                  | source_registry      |          123240 |          10 |           10 | CX source object: vw_history_exam_question_unified_reference_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_model_earth_history_detail_reference_v1               | source_registry      |          123240 |          11 |           11 | CX source object: vw_robot_model_earth_history_detail_reference_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_model_history_detail_coverage_v1                      | source_registry      |          123240 |          12 |           12 | CX source object: vw_robot_model_history_detail_coverage_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_model_history_detail_unified_reference_v1             | source_registry      |          123240 |          13 |           13 | CX source object: vw_robot_model_history_detail_unified_reference_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_model_history_exam_unified_reference_v1               | source_registry      |          123240 |          14 |           14 | CX source object: vw_robot_model_history_exam_unified_reference_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_model_history_reference_v1                            | source_registry      |          123240 |          15 |           15 | CX source object: vw_robot_model_history_reference_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_role_civilization_history_reference_v1                | source_registry      |          123240 |          16 |           16 | CX source object: vw_robot_role_civilization_history_reference_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_role_earth_history_reference_v1                       | source_registry      |          123240 |          17 |           17 | CX source object: vw_robot_role_earth_history_reference_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcobj_lane03_vw_robot_role_history_reference_bridge_v1                      | source_registry      |          123240 |          18 |           18 | CX source object: vw_robot_role_history_reference_bridge_v1
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcrow_earth_history_detail_entry_e9d10df0af4728b1089c655e1a1be8e8           | source_registry      |          123240 |          19 |           19 | 律令制
 05_selection_preview_srcmat | BYD2-003   | history_worldview | srcmat_srcrow_lane03_earth_history_knowledge_entry_af464b5e93a5d2a0dc2138280d87e86b | source_registry      |          123240 |          20 |           20 | 各国史の基本フレーム
(20 rows)

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
(1 row)

```

FINAL_STATUS=REVIEW_REQUIRED_BRAIN_FULL_LOAD_LANE_06_SRCMAT_REPAIR_HAS_FAIL
NEXT=Brain Full Load Lane 07: patch runtime provider to use selector function
