# Brain Full Load Lane 06 Failure Diagnosis Report

RUN_TS=20260504_061307
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_061307_brain_full_load_lane_06_failure_diagnosis
DB_WRITE=NO
FILE_PATCH=NO
AICM_TOUCH=NO

## Source
- LATEST_LANE06_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_053517_brain_full_load_lane_06_runtime_selection_tuning
- VERIFY_LOG_SOURCE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_053517_brain_full_load_lane_06_runtime_selection_tuning/210_verify.log

## Outputs
- FAIL_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_061307_brain_full_load_lane_06_failure_diagnosis/010_lane06_fail_extract.txt
- SQL_LOG=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_061307_brain_full_load_lane_06_failure_diagnosis/110_lane06_failure_diagnosis.log

## FAIL extract
```
LATEST_LANE06_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_053517_brain_full_load_lane_06_runtime_selection_tuning
VERIFY_LOG_SOURCE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_053517_brain_full_load_lane_06_runtime_selection_tuning/210_verify.log

61: selection_has_srcmat                   | FAIL   | selection can include source-registry materials

---- smoke board area ----
 03_smoke_board | byd2003_review       | BYD2-003    | review             |             32 |               10 |               8 |                8 |               52 |          56 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board | hd_r1c_smalltalk     | HD-R1C      | smalltalk          |             36 |                4 |              10 |               10 |               40 |          40 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board | hd_r2_risk           | HD-R2       | risk_check         |             27 |                4 |              10 |               10 |               35 |          35 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board | hd_r3_worker_exam    | HD-R3       | exam_practice      |             10 |                4 |              10 |               10 |               10 |          30 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board | hd_r5_manager        | HD-R5       | business_planning  |             33 |                6 |              12 |               12 |               36 |          36 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board | hd_r5p_executive     | HD-R5P      | executive_planning |             28 |                6 |              12 |               12 |               36 |          36 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board | mg_norn_002_health   | MG-NORN-002 | health_life_review |             29 |                4 |              10 |               10 |               30 |          35 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board | mg_norn_003_business | MG-NORN-003 | business_planning  |             20 |                4 |              10 |               10 |               25 |          35 |                   0 | PASS              | {lane05_fillup}
(8 rows)

         section          | lane05_selected_count
--------------------------+-----------------------
 04_lane05_selected_count |                    57

---- check area ----
               check_code               | result |                            note
----------------------------------------+--------+-------------------------------------------------------------
 all_smoke_cases_pass                   | PASS   | all runtime selection smoke cases pass
 domain_limit_enforced                  | PASS   | domain rank limit is enforced
 hd_r1c_forbidden_still_zero            | PASS   | HD-R1C forbidden domains remain denied through selector
 hd_r2_business_professional_still_zero | PASS   | HD-R2 business/professional remains denied through selector
 scoring_base_view_exists               | PASS   | scoring base view exists
 selection_function_exists              | PASS   | selection function exists
 selection_has_lane05                   | PASS   | selection can include Lane05 fill-up materials
 selection_has_srcmat                   | FAIL   | selection can include source-registry materials
 selection_policy_table_exists          | PASS   | selection policy table exists
 smoke_board_exists                     | PASS   | selection smoke board exists
(10 rows)

 section | pass_count | fail_count
---------+------------+------------
 SUMMARY |          9 |          1
```

## SQL diagnosis
```
     section      |      check_code      | result |                      note
------------------+----------------------+--------+-------------------------------------------------
 01_failed_checks | selection_has_srcmat | FAIL   | selection can include source-registry materials
(1 row)

 section | smoke_case_code | model_code | use_purpose_code | selected_count | min_result_count | max_domain_rank | limit_per_domain | max_overall_rank | total_limit | forbidden_hit_count | smoke_result_code | selected_domains | selected_source_kinds
---------+-----------------+------------+------------------+----------------+------------------+-----------------+------------------+------------------+-------------+---------------------+-------------------+------------------+-----------------------
(0 rows)

      section       |   smoke_case_code    | model_code  |  use_purpose_code  | selected_count | min_result_count | max_domain_rank | limit_per_domain | max_overall_rank | total_limit | forbidden_hit_count | smoke_result_code | selected_source_kinds
--------------------+----------------------+-------------+--------------------+----------------+------------------+-----------------+------------------+------------------+-------------+---------------------+-------------------+-----------------------
 03_smoke_board_all | byd2003_review       | BYD2-003    | review             |             32 |               10 |               8 |                8 |               52 |          56 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board_all | hd_r1c_smalltalk     | HD-R1C      | smalltalk          |             36 |                4 |              10 |               10 |               40 |          40 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board_all | hd_r2_risk           | HD-R2       | risk_check         |             27 |                4 |              10 |               10 |               35 |          35 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board_all | hd_r3_worker_exam    | HD-R3       | exam_practice      |             10 |                4 |              10 |               10 |               10 |          30 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board_all | hd_r5_manager        | HD-R5       | business_planning  |             33 |                6 |              12 |               12 |               36 |          36 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board_all | hd_r5p_executive     | HD-R5P      | executive_planning |             28 |                6 |              12 |               12 |               36 |          36 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board_all | mg_norn_002_health   | MG-NORN-002 | health_life_review |             29 |                4 |              10 |               10 |               30 |          35 |                   0 | PASS              | {lane05_fillup}
 03_smoke_board_all | mg_norn_003_business | MG-NORN-003 | business_planning  |             20 |                4 |              10 |               10 |               25 |          35 |                   0 | PASS              | {lane05_fillup}
(8 rows)

               section                | material_source_kind | selected_count
--------------------------------------+----------------------+----------------
 04_source_kind_counts_byd2003_review | lane05_fillup        |             55
 04_source_kind_counts_byd2003_review | pack05_full_load     |              2
(2 rows)

         section         | material_source_kind |        brain_domain_code        | selected_count
-------------------------+----------------------+---------------------------------+----------------
 05_lane05_counts_hd_r5p | lane05_fillup        | business_operation              |             19
 05_lane05_counts_hd_r5p | pack04_robot_diff    | business_operation              |              1
 05_lane05_counts_hd_r5p | lane05_fillup        | civilization_foundation_history |             18
 05_lane05_counts_hd_r5p | pack05_full_load     | civilization_foundation_history |              2
 05_lane05_counts_hd_r5p | lane05_fillup        | robot_aiworker                  |             20
(5 rows)

          section          |  brain_domain_code  | selected_count
---------------------------+---------------------+----------------
 06_forbidden_probe_hd_r1c | culture_region      |             17
 06_forbidden_probe_hd_r1c | food_nutrition      |             20
 06_forbidden_probe_hd_r1c | hobby_entertainment |             20
 06_forbidden_probe_hd_r1c | season_calendar     |             20
(4 rows)

         section          | brain_domain_code | selected_count
--------------------------+-------------------+----------------
 07_forbidden_probe_hd_r2 | city_art_game     |             17
 07_forbidden_probe_hd_r2 | robot_aiworker    |             20
 07_forbidden_probe_hd_r2 | security_crisis   |             20
(3 rows)

               section               | model_code |        brain_domain_code        |                 unit_code                  | material_source_kind | selection_score | domain_rank | overall_rank |                    title_preview
-------------------------------------+------------+---------------------------------+--------------------------------------------+----------------------+-----------------+-------------+--------------+------------------------------------------------------
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_003               | lane05_fillup        |          122590 |           1 |            1 | 歴史・世界観 / 全載せ補強 / 利用目的
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_006               | lane05_fillup        |          122590 |           2 |            2 | 歴史・世界観 / 全載せ補強 / 実務適用
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_009               | lane05_fillup        |          122590 |           3 |            3 | 歴史・世界観 / 全載せ補強 / 例外処理
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_012               | lane05_fillup        |          122590 |           4 |            4 | 歴史・世界観 / 全載せ補強 / prompt context連携
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_015               | lane05_fillup        |          122590 |           5 |            5 | 歴史・世界観 / 全載せ補強 / 証跡/監査
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_018               | lane05_fillup        |          122590 |           6 |            6 | 歴史・世界観 / 全載せ補強 / 教育/説明化
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_021               | lane05_fillup        |          122590 |           7 |            7 | 歴史・世界観 / 全載せ補強 / 基本概念
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_024               | lane05_fillup        |          122590 |           8 |            8 | 歴史・世界観 / 全載せ補強 / 読取深度
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_027               | lane05_fillup        |          122590 |           9 |            9 | 歴史・世界観 / 全載せ補強 / レビュー観点
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_030               | lane05_fillup        |          122590 |          10 |           10 | 歴史・世界観 / 全載せ補強 / runtime要約
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_033               | lane05_fillup        |          122590 |          11 |           11 | 歴史・世界観 / 全載せ補強 / role差
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_036               | lane05_fillup        |          122590 |          12 |           12 | 歴史・世界観 / 全載せ補強 / UI非表示境界
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_002 | lane05_fillup        |          122589 |           1 |           13 | Civilization基礎史 / 全載せ補強 / 正本境界
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_004 | lane05_fillup        |          122589 |           2 |           14 | Civilization基礎史 / 全載せ補強 / 読取深度
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_006 | lane05_fillup        |          122589 |           3 |           15 | Civilization基礎史 / 全載せ補強 / 実務適用
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_008 | lane05_fillup        |          122589 |           4 |           16 | Civilization基礎史 / 全載せ補強 / 失敗パターン
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_010 | lane05_fillup        |          122589 |           5 |           17 | Civilization基礎史 / 全載せ補強 / runtime要約
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_012 | lane05_fillup        |          122589 |           6 |           18 | Civilization基礎史 / 全載せ補強 / prompt context連携
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_014 | lane05_fillup        |          122589 |           7 |           19 | Civilization基礎史 / 全載せ補強 / model/series差
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_016 | lane05_fillup        |          122589 |           8 |           20 | Civilization基礎史 / 全載せ補強 / UI非表示境界
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_018 | lane05_fillup        |          122589 |           9 |           21 | Civilization基礎史 / 全載せ補強 / 教育/説明化
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_020 | lane05_fillup        |          122589 |          10 |           22 | Civilization基礎史 / 全載せ補強 / 将来拡張
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_022 | lane05_fillup        |          122589 |          11 |           23 | Civilization基礎史 / 全載せ補強 / 正本境界
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_024 | lane05_fillup        |          122589 |          12 |           24 | Civilization基礎史 / 全載せ補強 / 読取深度
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_026 | lane05_fillup        |          122589 |          13 |           25 | Civilization基礎史 / 全載せ補強 / 実務適用
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_028 | lane05_fillup        |          122589 |          14 |           26 | Civilization基礎史 / 全載せ補強 / 失敗パターン
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_030 | lane05_fillup        |          122589 |          15 |           27 | Civilization基礎史 / 全載せ補強 / runtime要約
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_032 | lane05_fillup        |          122589 |          16 |           28 | Civilization基礎史 / 全載せ補強 / prompt context連携
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_034 | lane05_fillup        |          122589 |          17 |           29 | Civilization基礎史 / 全載せ補強 / model/series差
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | lane05_civilization_foundation_history_036 | lane05_fillup        |          122589 |          18 |           30 | Civilization基礎史 / 全載せ補強 / UI非表示境界
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | pack05_civ_001_full_foundation_memory      | pack05_full_load     |          122459 |          19 |           31 | 基礎史は文明の長期記憶
 08_selection_preview_failed_related | BYD2-003   | civilization_foundation_history | pack05_civ_002_release_and_recovery        | pack05_full_load     |          122459 |          20 |           32 | 解除と復旧を基礎史に含める
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_002               | lane05_fillup        |          122390 |          13 |           34 | 歴史・世界観 / 全載せ補強 / 正本境界
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_005               | lane05_fillup        |          122390 |          14 |           35 | 歴史・世界観 / 全載せ補強 / 安全境界
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_008               | lane05_fillup        |          122390 |          15 |           36 | 歴史・世界観 / 全載せ補強 / 失敗パターン
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_011               | lane05_fillup        |          122390 |          16 |           37 | 歴史・世界観 / 全載せ補強 / source registry連携
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_014               | lane05_fillup        |          122390 |          17 |           38 | 歴史・世界観 / 全載せ補強 / model/series差
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_017               | lane05_fillup        |          122390 |          18 |           39 | 歴史・世界観 / 全載せ補強 / 外部実行分離
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_020               | lane05_fillup        |          122390 |          19 |           40 | 歴史・世界観 / 全載せ補強 / 将来拡張
 08_selection_preview_failed_related | BYD2-003   | history_worldview               | lane05_history_worldview_023               | lane05_fillup        |          122390 |          20 |           41 | 歴史・世界観 / 全載せ補強 / 利用目的
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_003              | lane05_fillup        |          122380 |           1 |           64 | 教育・学習 / 全載せ補強 / 利用目的
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_006              | lane05_fillup        |          122380 |           2 |           65 | 教育・学習 / 全載せ補強 / 実務適用
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_009              | lane05_fillup        |          122380 |           3 |           66 | 教育・学習 / 全載せ補強 / 例外処理
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_012              | lane05_fillup        |          122380 |           4 |           67 | 教育・学習 / 全載せ補強 / prompt context連携
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_015              | lane05_fillup        |          122380 |           5 |           68 | 教育・学習 / 全載せ補強 / 証跡/監査
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_018              | lane05_fillup        |          122380 |           6 |           69 | 教育・学習 / 全載せ補強 / 教育/説明化
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_021              | lane05_fillup        |          122380 |           7 |           70 | 教育・学習 / 全載せ補強 / 基本概念
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_024              | lane05_fillup        |          122380 |           8 |           71 | 教育・学習 / 全載せ補強 / 読取深度
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_027              | lane05_fillup        |          122380 |           9 |           72 | 教育・学習 / 全載せ補強 / レビュー観点
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_030              | lane05_fillup        |          122380 |          10 |           73 | 教育・学習 / 全載せ補強 / runtime要約
 08_selection_preview_failed_related | BYD2-003   | education_learning              | lane05_education_learning_033              | lane05_fillup        |          122380 |          11 |           74 | 教育・学習 / 全載せ補強 / role差
 08_selection_preview_failed_related | BYD2-003   | exam_learning                   | lane05_exam_learning_002                   | lane05_fillup        |          122379 |           1 |           75 | 試験・問題 / 全載せ補強 / 正本境界
 08_selection_preview_failed_related | BYD2-003   | exam_learning                   | lane05_exam_learning_004                   | lane05_fillup        |          122379 |           2 |           76 | 試験・問題 / 全載せ補強 / 読取深度
 08_selection_preview_failed_related | BYD2-003   | exam_learning                   | lane05_exam_learning_006                   | lane05_fillup        |          122379 |           3 |           77 | 試験・問題 / 全載せ補強 / 実務適用
 08_selection_preview_failed_related | BYD2-003   | exam_learning                   | lane05_exam_learning_008                   | lane05_fillup        |          122379 |           4 |           78 | 試験・問題 / 全載せ補強 / 失敗パターン
 08_selection_preview_failed_related | BYD2-003   | exam_learning                   | lane05_exam_learning_010                   | lane05_fillup        |          122379 |           5 |           79 | 試験・問題 / 全載せ補強 / runtime要約
 08_selection_preview_failed_related | BYD2-003   | exam_learning                   | lane05_exam_learning_012                   | lane05_fillup        |          122379 |           6 |           80 | 試験・問題 / 全載せ補強 / prompt context連携
(57 rows)

```

FINAL_STATUS=BRAIN_FULL_LOAD_LANE_06_FAILURE_DIAGNOSIS_DONE_REVIEW_REQUIRED
NEXT=Lane06 targeted repair based on failed check
