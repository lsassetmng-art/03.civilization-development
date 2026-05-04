# CX22073JW / AIWorkerOS Brain Full Load Lane 06 Report

RUN_TS=20260504_053517
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_053517_brain_full_load_lane_06_runtime_selection_tuning
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=YES
FILE_PATCH=NO
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Meaning
Runtime material selection tuning entry created.

## Scope
- Create scoring base view.
- Create selection function:
  aiworker.fn_robot_brain_runtime_material_select_v1
- Create smoke case catalog and smoke board.
- Validate domain limit / total limit / forbidden boundaries / Lane05 and srcmat inclusion.

## Next
Lane07 can patch runtime provider to call this selector function.

## Apply output
```
BEGIN
DO
CREATE TABLE
INSERT 0 7
CREATE VIEW
CREATE FUNCTION
COMMENT
CREATE TABLE
INSERT 0 8
CREATE VIEW
COMMIT
```

## Verify output
```
       section       |         policy_code          | policy_order |   policy_title_ja
---------------------+------------------------------+--------------+----------------------
 01_selection_policy | purpose_match_first          |           10 | purpose一致優先
 01_selection_policy | domain_filter_respected      |           20 | domain filter尊重
 01_selection_policy | high_risk_safe_purpose_only  |           30 | 高リスク安全用途限定
 01_selection_policy | domain_top_n                 |           40 | domain別上限
 01_selection_policy | total_top_n                  |           50 | 全体上限
 01_selection_policy | lane_and_srcmat_kept         |           60 | lane/srcmat保持
 01_selection_policy | forbidden_boundary_preserved |           70 | 禁止境界維持
(7 rows)

            section            | model_code |        brain_domain_code        |                 unit_code                  | material_source_kind | selection_score | domain_rank | overall_rank |                    title_preview
-------------------------------+------------+---------------------------------+--------------------------------------------+----------------------+-----------------+-------------+--------------+------------------------------------------------------
 02_selection_function_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_002 | lane05_fillup        |          122589 |           1 |            1 | Civilization基礎史 / 全載せ補強 / 正本境界
 02_selection_function_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_004 | lane05_fillup        |          122589 |           2 |            2 | Civilization基礎史 / 全載せ補強 / 読取深度
 02_selection_function_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_006 | lane05_fillup        |          122589 |           3 |            3 | Civilization基礎史 / 全載せ補強 / 実務適用
 02_selection_function_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_008 | lane05_fillup        |          122589 |           4 |            4 | Civilization基礎史 / 全載せ補強 / 失敗パターン
 02_selection_function_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_010 | lane05_fillup        |          122589 |           5 |            5 | Civilization基礎史 / 全載せ補強 / runtime要約
 02_selection_function_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_012 | lane05_fillup        |          122589 |           6 |            6 | Civilization基礎史 / 全載せ補強 / prompt context連携
 02_selection_function_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_014 | lane05_fillup        |          122589 |           7 |            7 | Civilization基礎史 / 全載せ補強 / model/series差
 02_selection_function_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_016 | lane05_fillup        |          122589 |           8 |            8 | Civilization基礎史 / 全載せ補強 / UI非表示境界
 02_selection_function_preview | HD-R5P     | business_operation              | lane05_business_operation_003              | lane05_fillup        |          122570 |           1 |           19 | 業務運用 / 全載せ補強 / 利用目的
 02_selection_function_preview | HD-R5P     | business_operation              | lane05_business_operation_006              | lane05_fillup        |          122570 |           2 |           20 | 業務運用 / 全載せ補強 / 実務適用
 02_selection_function_preview | HD-R5P     | business_operation              | lane05_business_operation_009              | lane05_fillup        |          122570 |           3 |           21 | 業務運用 / 全載せ補強 / 例外処理
 02_selection_function_preview | HD-R5P     | business_operation              | lane05_business_operation_012              | lane05_fillup        |          122570 |           4 |           22 | 業務運用 / 全載せ補強 / prompt context連携
 02_selection_function_preview | HD-R5P     | business_operation              | lane05_business_operation_015              | lane05_fillup        |          122570 |           5 |           23 | 業務運用 / 全載せ補強 / 証跡/監査
 02_selection_function_preview | HD-R5P     | business_operation              | lane05_business_operation_018              | lane05_fillup        |          122570 |           6 |           24 | 業務運用 / 全載せ補強 / 教育/説明化
(14 rows)

    section     |   smoke_case_code    | model_code  |  use_purpose_code  | selected_count | min_result_count | max_domain_rank | limit_per_domain | max_overall_rank | total_limit | forbidden_hit_count | smoke_result_code | selected_source_kinds
----------------+----------------------+-------------+--------------------+----------------+------------------+-----------------+------------------+------------------+-------------+---------------------+-------------------+-----------------------
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
(1 row)

         section          | srcmat_selected_count
--------------------------+-----------------------
 05_srcmat_selected_count |                     0
(1 row)

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
(1 row)

```

FINAL_STATUS=REVIEW_REQUIRED_BRAIN_FULL_LOAD_LANE_06_HAS_FAIL
NEXT=Brain Full Load Lane 07: patch runtime provider to use selector function
