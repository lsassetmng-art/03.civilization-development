# Brain Full Load Lane 06 Definitive Two-stage Rank Repair Report

RUN_TS=20260504_062651
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_062651_brain_full_load_lane_06_definitive_two_stage_rank_repair
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=YES
FILE_PATCH=NO
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Root cause
overall_rank was computed before domain_rank filtering.
A single domain could occupy total_limit, then domain filtering removed most rows, leaving too few selected materials.

## Repair
- Compute domain_rank first.
- Apply domain limit.
- Recompute final overall_rank after domain-limited set.
- Protect top source_registry/srcmat, lane05, and pack05 per domain.

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
            section            | material_source_kind | selected_count | min_overall_rank | max_overall_rank
-------------------------------+----------------------+----------------+------------------+------------------
 01_byd2003_review_source_kind | source_registry      |             24 |                1 |               80
 01_byd2003_review_source_kind | lane05_fillup        |             52 |                9 |               69
 01_byd2003_review_source_kind | pack05_full_load     |              4 |               17 |               20
(3 rows)

             section             | material_source_kind |        brain_domain_code        | selected_count | min_overall_rank | max_overall_rank
---------------------------------+----------------------+---------------------------------+----------------+------------------+------------------
 02_hd_r5p_executive_source_kind | source_registry      | business_operation              |              2 |                3 |                4
 02_hd_r5p_executive_source_kind | lane05_fillup        | business_operation              |             17 |                9 |               60
 02_hd_r5p_executive_source_kind | pack05_full_load     | business_operation              |              1 |               14 |               14
 02_hd_r5p_executive_source_kind | source_registry      | civilization_foundation_history |              2 |                1 |                2
 02_hd_r5p_executive_source_kind | lane05_fillup        | civilization_foundation_history |             17 |                7 |               30
 02_hd_r5p_executive_source_kind | pack05_full_load     | civilization_foundation_history |              1 |               13 |               13
 02_hd_r5p_executive_source_kind | source_registry      | robot_aiworker                  |              2 |                5 |                6
 02_hd_r5p_executive_source_kind | lane05_fillup        | robot_aiworker                  |             17 |               11 |               57
 02_hd_r5p_executive_source_kind | pack05_full_load     | robot_aiworker                  |              1 |               15 |               15
(9 rows)

    section     |   smoke_case_code    | model_code  |  use_purpose_code  | selected_count | min_result_count | max_domain_rank | limit_per_domain | max_overall_rank | total_limit | forbidden_hit_count | smoke_result_code |              selected_source_kinds
----------------+----------------------+-------------+--------------------+----------------+------------------+-----------------+------------------+------------------+-------------+---------------------+-------------------+--------------------------------------------------
 03_smoke_board | byd2003_review       | BYD2-003    | review             |             56 |               10 |               8 |                8 |               56 |          56 |                   0 | PASS              | {lane05_fillup,pack05_full_load,source_registry}
 03_smoke_board | hd_r1c_smalltalk     | HD-R1C      | smalltalk          |             40 |                4 |              10 |               10 |               40 |          40 |                   0 | PASS              | {lane05_fillup,pack05_full_load,source_registry}
 03_smoke_board | hd_r2_risk           | HD-R2       | risk_check         |             30 |                4 |              10 |               10 |               30 |          35 |                   0 | PASS              | {lane05_fillup,pack05_full_load,source_registry}
 03_smoke_board | hd_r3_worker_exam    | HD-R3       | exam_practice      |             20 |                4 |              10 |               10 |               20 |          30 |                   0 | PASS              | {lane05_fillup,pack05_full_load,source_registry}
 03_smoke_board | hd_r5_manager        | HD-R5       | business_planning  |             36 |                6 |              12 |               12 |               36 |          36 |                   0 | PASS              | {lane05_fillup,pack05_full_load,source_registry}
 03_smoke_board | hd_r5p_executive     | HD-R5P      | executive_planning |             36 |                6 |              12 |               12 |               36 |          36 |                   0 | PASS              | {lane05_fillup,pack05_full_load,source_registry}
 03_smoke_board | mg_norn_002_health   | MG-NORN-002 | health_life_review |             30 |                4 |              10 |               10 |               30 |          35 |                   0 | PASS              | {lane05_fillup,pack05_full_load,source_registry}
 03_smoke_board | mg_norn_003_business | MG-NORN-003 | business_planning  |             30 |                4 |              10 |               10 |               30 |          35 |                   0 | PASS              | {lane05_fillup,pack05_full_load,source_registry}
(8 rows)

            section             |        brain_domain_code        | material_source_kind | selected_count | min_domain_rank | max_domain_rank | min_overall_rank | max_overall_rank
--------------------------------+---------------------------------+----------------------+----------------+-----------------+-----------------+------------------+------------------
 04_domain_distribution_byd2003 | civilization_foundation_history | lane05_fillup        |              5 |               3 |               8 |               11 |               26
 04_domain_distribution_byd2003 | civilization_foundation_history | pack05_full_load     |              1 |               5 |               5 |               17 |               17
 04_domain_distribution_byd2003 | civilization_foundation_history | source_registry      |              2 |               1 |               2 |                3 |                4
 04_domain_distribution_byd2003 | education_learning              | lane05_fillup        |              5 |               3 |               8 |               13 |               29
 04_domain_distribution_byd2003 | education_learning              | pack05_full_load     |              1 |               5 |               5 |               19 |               19
 04_domain_distribution_byd2003 | education_learning              | source_registry      |              2 |               1 |               2 |                5 |                6
 04_domain_distribution_byd2003 | exam_learning                   | lane05_fillup        |              5 |               3 |               8 |               15 |               32
 04_domain_distribution_byd2003 | exam_learning                   | pack05_full_load     |              1 |               5 |               5 |               20 |               20
 04_domain_distribution_byd2003 | exam_learning                   | source_registry      |              2 |               1 |               2 |                7 |                8
 04_domain_distribution_byd2003 | history_worldview               | lane05_fillup        |              5 |               3 |               8 |                9 |               23
 04_domain_distribution_byd2003 | history_worldview               | pack05_full_load     |              1 |               5 |               5 |               18 |               18
 04_domain_distribution_byd2003 | history_worldview               | source_registry      |              2 |               1 |               2 |                1 |                2
(12 rows)

      section      | model_code |        brain_domain_code        |                                  unit_code                                   | material_source_kind | selection_score | domain_rank | overall_rank |                          title_preview
-------------------+------------+---------------------------------+------------------------------------------------------------------------------+----------------------+-----------------+-------------+--------------+-----------------------------------------------------------------
 05_srcmat_preview | BYD2-003   | history_worldview               | srcmat_earth_history_detail_entry                                            | source_registry      |          122880 |           1 |            1 | 地球史詳細エントリ
 05_srcmat_preview | BYD2-003   | history_worldview               | srcmat_srcobj_earth_history_detail_entry                                     | source_registry      |          122880 |           2 |            2 | CX source object: earth_history_detail_entry
 05_srcmat_preview | BYD2-003   | civilization_foundation_history | srcmat_civilization_foundation_history_detail_entry                          | source_registry      |          122879 |           1 |            3 | Civilization基礎史詳細エントリ
 05_srcmat_preview | BYD2-003   | civilization_foundation_history | srcmat_srcobj_civilization_foundation_history_detail_entry                   | source_registry      |          122879 |           2 |            4 | CX source object: civilization_foundation_history_detail_entry
 05_srcmat_preview | BYD2-003   | education_learning              | srcmat_foundation_knowledge_material                                         | source_registry      |          122770 |           1 |            5 | 基礎知識資料
 05_srcmat_preview | BYD2-003   | education_learning              | srcmat_srcobj_foundation_knowledge_material                                  | source_registry      |          122770 |           2 |            6 | CX source object: foundation_knowledge_material
 05_srcmat_preview | BYD2-003   | exam_learning                   | srcmat_civilization_exam_question_bank                                       | source_registry      |          122769 |           1 |            7 | Civilization試験問題バンク
 05_srcmat_preview | BYD2-003   | exam_learning                   | srcmat_srcobj_civilization_exam_question_bank                                | source_registry      |          122769 |           2 |            8 | CX source object: civilization_exam_question_bank
 05_srcmat_preview | BYD2-003   | history_worldview               | srcmat_srcobj_lane03_earth_history_knowledge_entry                           | source_registry      |          122880 |          16 |           46 | CX source object: earth_history_knowledge_entry
 05_srcmat_preview | BYD2-003   | history_worldview               | srcmat_srcobj_lane03_history_knowledge_entry                                 | source_registry      |          122880 |          17 |           47 | CX source object: history_knowledge_entry
 05_srcmat_preview | BYD2-003   | history_worldview               | srcmat_srcobj_lane03_streaming_view_history_area                             | source_registry      |          122880 |          18 |           48 | CX source object: streaming_view_history_area
 05_srcmat_preview | BYD2-003   | history_worldview               | srcmat_srcobj_lane03_v_streaming_view_history_area_latest                    | source_registry      |          122880 |          19 |           49 | CX source object: v_streaming_view_history_area_latest
 05_srcmat_preview | BYD2-003   | history_worldview               | srcmat_srcobj_lane03_vw_earth_history_detail_reference_v1                    | source_registry      |          122880 |          20 |           50 | CX source object: vw_earth_history_detail_reference_v1
 05_srcmat_preview | BYD2-003   | education_learning              | srcmat_srcobj_foundation_knowledge_topic                                     | source_registry      |          122770 |          15 |           70 | CX source object: foundation_knowledge_topic
 05_srcmat_preview | BYD2-003   | education_learning              | srcmat_srcrow_foundation_knowledge_material_0535260481d98629ae87501e81795f4d | source_registry      |          122770 |          16 |           71 | 体温・脈拍・血圧などの一般参照
 05_srcmat_preview | BYD2-003   | education_learning              | srcmat_srcrow_foundation_knowledge_material_1161ba18e3762cdaad5006ed309a777e | source_registry      |          122770 |          17 |           72 | 歴史時代区分の基本
 05_srcmat_preview | BYD2-003   | education_learning              | srcmat_srcrow_foundation_knowledge_material_2ae5d2ed22af8fa8d3ab5943918b196a | source_registry      |          122770 |          18 |           73 | 睡眠時間の一般参照
 05_srcmat_preview | BYD2-003   | education_learning              | srcmat_srcrow_foundation_knowledge_material_4fc7f49ca8de68d5a460ee36a2c902bb | source_registry      |          122770 |          19 |           74 | 食事・栄養参照の基本
 05_srcmat_preview | BYD2-003   | education_learning              | srcmat_srcrow_foundation_knowledge_material_537d1213ff4d71d238d3ba5d03b8e149 | source_registry      |          122770 |          20 |           75 | 業務・会社運営参照の基本
 05_srcmat_preview | BYD2-003   | exam_learning                   | srcmat_srcobj_lane03_civilization_exam_question_choice                       | source_registry      |          122769 |          16 |           76 | CX source object: civilization_exam_question_choice
 05_srcmat_preview | BYD2-003   | exam_learning                   | srcmat_srcobj_lane03_vw_aiemp_qualification_past_question_content            | source_registry      |          122769 |          17 |           77 | CX source object: vw_aiemp_qualification_past_question_content
 05_srcmat_preview | BYD2-003   | exam_learning                   | srcmat_srcobj_lane03_vw_aiemp_qualification_past_question_metadata           | source_registry      |          122769 |          18 |           78 | CX source object: vw_aiemp_qualification_past_question_metadata
 05_srcmat_preview | BYD2-003   | exam_learning                   | srcmat_srcobj_lane03_vw_civilization_exam_question_reference_v1              | source_registry      |          122769 |          19 |           79 | CX source object: vw_civilization_exam_question_reference_v1
 05_srcmat_preview | BYD2-003   | exam_learning                   | srcmat_srcobj_lane03_vw_robot_model_civilization_exam_reference_v1           | source_registry      |          122769 |          20 |           80 | CX source object: vw_robot_model_civilization_exam_reference_v1
(24 rows)

      section      | model_code |        brain_domain_code        |                 unit_code                  | material_source_kind | selection_score | domain_rank | overall_rank |                     title_preview
-------------------+------------+---------------------------------+--------------------------------------------+----------------------+-----------------+-------------+--------------+-------------------------------------------------------
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_002 | lane05_fillup        |          123039 |           3 |            7 | Civilization基礎史 / 全載せ補強 / 正本境界
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_004 | lane05_fillup        |          123039 |           4 |            8 | Civilization基礎史 / 全載せ補強 / 読取深度
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_003              | lane05_fillup        |          123020 |           3 |            9 | 業務運用 / 全載せ補強 / 利用目的
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_006              | lane05_fillup        |          123020 |           4 |           10 | 業務運用 / 全載せ補強 / 実務適用
 06_lane05_preview | HD-R5P     | robot_aiworker                  | lane05_robot_aiworker_003                  | lane05_fillup        |          122980 |           3 |           11 | ロボット・AIWorker / 全載せ補強 / 利用目的
 06_lane05_preview | HD-R5P     | robot_aiworker                  | lane05_robot_aiworker_007                  | lane05_fillup        |          122980 |           4 |           12 | ロボット・AIWorker / 全載せ補強 / レビュー観点
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_006 | lane05_fillup        |          123039 |           6 |           16 | Civilization基礎史 / 全載せ補強 / 実務適用
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_008 | lane05_fillup        |          123039 |           7 |           17 | Civilization基礎史 / 全載せ補強 / 失敗パターン
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_010 | lane05_fillup        |          123039 |           8 |           18 | Civilization基礎史 / 全載せ補強 / runtime要約
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_012 | lane05_fillup        |          123039 |           9 |           19 | Civilization基礎史 / 全載せ補強 / prompt context連携
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_014 | lane05_fillup        |          123039 |          10 |           20 | Civilization基礎史 / 全載せ補強 / model/series差
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_016 | lane05_fillup        |          123039 |          11 |           21 | Civilization基礎史 / 全載せ補強 / UI非表示境界
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_018 | lane05_fillup        |          123039 |          12 |           22 | Civilization基礎史 / 全載せ補強 / 教育/説明化
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_020 | lane05_fillup        |          123039 |          13 |           23 | Civilization基礎史 / 全載せ補強 / 将来拡張
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_022 | lane05_fillup        |          123039 |          14 |           24 | Civilization基礎史 / 全載せ補強 / 正本境界
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_024 | lane05_fillup        |          123039 |          15 |           25 | Civilization基礎史 / 全載せ補強 / 読取深度
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_026 | lane05_fillup        |          123039 |          16 |           26 | Civilization基礎史 / 全載せ補強 / 実務適用
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_028 | lane05_fillup        |          123039 |          17 |           27 | Civilization基礎史 / 全載せ補強 / 失敗パターン
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_030 | lane05_fillup        |          123039 |          18 |           28 | Civilization基礎史 / 全載せ補強 / runtime要約
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_032 | lane05_fillup        |          123039 |          19 |           29 | Civilization基礎史 / 全載せ補強 / prompt context連携
 06_lane05_preview | HD-R5P     | civilization_foundation_history | lane05_civilization_foundation_history_034 | lane05_fillup        |          123039 |          20 |           30 | Civilization基礎史 / 全載せ補強 / model/series差
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_009              | lane05_fillup        |          123020 |           6 |           31 | 業務運用 / 全載せ補強 / 例外処理
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_012              | lane05_fillup        |          123020 |           7 |           32 | 業務運用 / 全載せ補強 / prompt context連携
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_015              | lane05_fillup        |          123020 |           8 |           33 | 業務運用 / 全載せ補強 / 証跡/監査
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_018              | lane05_fillup        |          123020 |           9 |           34 | 業務運用 / 全載せ補強 / 教育/説明化
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_021              | lane05_fillup        |          123020 |          10 |           35 | 業務運用 / 全載せ補強 / 基本概念
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_024              | lane05_fillup        |          123020 |          11 |           36 | 業務運用 / 全載せ補強 / 読取深度
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_027              | lane05_fillup        |          123020 |          12 |           37 | 業務運用 / 全載せ補強 / レビュー観点
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_030              | lane05_fillup        |          123020 |          13 |           38 | 業務運用 / 全載せ補強 / runtime要約
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_033              | lane05_fillup        |          123020 |          14 |           39 | 業務運用 / 全載せ補強 / role差
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_036              | lane05_fillup        |          123020 |          15 |           40 | 業務運用 / 全載せ補強 / UI非表示境界
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_039              | lane05_fillup        |          123020 |          16 |           41 | 業務運用 / 全載せ補強 / 世界観/設計参照
 06_lane05_preview | HD-R5P     | business_operation              | lane05_business_operation_042              | lane05_fillup        |          123020 |          17 |           42 | 業務運用 / 全載せ補強 / 正本境界
 06_lane05_preview | HD-R5P     | robot_aiworker                  | lane05_robot_aiworker_011                  | lane05_fillup        |          122980 |           6 |           43 | ロボット・AIWorker / 全載せ補強 / source registry連携
 06_lane05_preview | HD-R5P     | robot_aiworker                  | lane05_robot_aiworker_015                  | lane05_fillup        |          122980 |           7 |           44 | ロボット・AIWorker / 全載せ補強 / 証跡/監査
 06_lane05_preview | HD-R5P     | robot_aiworker                  | lane05_robot_aiworker_019                  | lane05_fillup        |          122980 |           8 |           45 | ロボット・AIWorker / 全載せ補強 / 世界観/設計参照
 06_lane05_preview | HD-R5P     | robot_aiworker                  | lane05_robot_aiworker_023                  | lane05_fillup        |          122980 |           9 |           46 | ロボット・AIWorker / 全載せ補強 / 利用目的
 06_lane05_preview | HD-R5P     | robot_aiworker                  | lane05_robot_aiworker_027                  | lane05_fillup        |          122980 |          10 |           47 | ロボット・AIWorker / 全載せ補強 / レビュー観点
 06_lane05_preview | HD-R5P     | robot_aiworker                  | lane05_robot_aiworker_031                  | lane05_fillup        |          122980 |          11 |           48 | ロボット・AIWorker / 全載せ補強 / source registry連携
 06_lane05_preview | HD-R5P     | robot_aiworker                  | lane05_robot_aiworker_035                  | lane05_fillup        |          122980 |          12 |           49 | ロボット・AIWorker / 全載せ補強 / 証跡/監査
(40 rows)

               check_code               | result |                               note
----------------------------------------+--------+-------------------------------------------------------------------
 all_smoke_cases_pass                   | PASS   | all runtime selection smoke cases pass
 byd2003_review_min_count               | PASS   | BYD2-003 review selection has at least 10 materials
 byd2003_review_multi_domain            | PASS   | two-stage rank prevents one domain from occupying all total slots
 domain_limit_enforced                  | PASS   | domain rank limit is enforced
 hd_r1c_forbidden_still_zero            | PASS   | HD-R1C forbidden domains remain denied through selector
 hd_r2_business_professional_still_zero | PASS   | HD-R2 business/professional remains denied through selector
 overall_limit_enforced                 | PASS   | overall rank limit is enforced
 selection_function_exists              | PASS   | selection function exists
 selection_has_lane05                   | PASS   | selection still includes Lane05 fill-up materials
 selection_has_srcmat                   | PASS   | selection can include source-registry materials
(10 rows)

 section | pass_count | fail_count
---------+------------+------------
 SUMMARY |         10 |          0
(1 row)

```

FINAL_STATUS=BRAIN_FULL_LOAD_LANE_06_DEFINITIVE_REPAIR_PASS_REVIEW_REQUIRED
NEXT=Brain Full Load Lane 07: patch runtime provider to use selector function
