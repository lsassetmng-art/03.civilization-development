# Brain Full Load Lane 05 Repair Axis Report

RUN_TS=20260504_053026
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_053026_brain_full_load_lane_05_repair_axis_active_flag
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=YES
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Cause
fill_axis INSERT specified active_flag but VALUES rows did not include a boolean expression.

## Fix
Removed active_flag from INSERT target columns and used table default active_flag=true.

## Patch output
```
LATEST_LANE05_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_225854_brain_full_load_lane_05_target_fillup
SOURCE_SQL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_225854_brain_full_load_lane_05_target_fillup/100_apply_brain_full_load_lane_05.sql
SQL_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_053026_brain_full_load_lane_05_repair_axis_active_flag/100_apply_brain_full_load_lane_05_REPAIRED_AXIS.sql
PATCH_OK removed active_flag from fill_axis INSERT target columns
PATCHED_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_053026_brain_full_load_lane_05_repair_axis_active_flag/100_apply_brain_full_load_lane_05_REPAIRED_AXIS.sql

PATCH_MARKER
40:INSERT INTO cx22073jw.brain_full_load_fill_axis_catalog
41-(axis_code, axis_order, axis_title_ja, axis_summary_ja, axis_use_ja)
42-VALUES
```

## Apply output
```
BEGIN
DO
CREATE TABLE
INSERT 0 20
CREATE TABLE
INSERT 0 14
INSERT 0 452
INSERT 0 452
INSERT 0 14
CREATE VIEW
COMMIT
```

## Verify output
```
         section          |        brain_domain_code        | target_min_unit_count | before_active_unit_count | after_active_unit_count | before_deficit_count | after_deficit_count | added_unit_count | target_status
--------------------------+---------------------------------+-----------------------+--------------------------+-------------------------+----------------------+---------------------+------------------+---------------
 01_lane05_latest_summary | business_operation              |                    70 |                       26 |                      70 |                   44 |                   0 |               44 | target_met
 01_lane05_latest_summary | city_art_game                   |                    45 |                       13 |                      45 |                   32 |                   0 |               32 | target_met
 01_lane05_latest_summary | civilization_foundation_history |                    50 |                       14 |                      50 |                   36 |                   0 |               36 | target_met
 01_lane05_latest_summary | culture_region                  |                    40 |                       12 |                      40 |                   28 |                   0 |               28 | target_met
 01_lane05_latest_summary | education_learning              |                    45 |                       11 |                      45 |                   34 |                   0 |               34 | target_met
 01_lane05_latest_summary | exam_learning                   |                    35 |                       10 |                      35 |                   25 |                   0 |               25 | target_met
 01_lane05_latest_summary | food_nutrition                  |                    30 |                        6 |                      30 |                   24 |                   0 |               24 | target_met
 01_lane05_latest_summary | health_life_metrics             |                    40 |                       12 |                      40 |                   28 |                   0 |               28 | target_met
 01_lane05_latest_summary | history_worldview               |                    50 |                       14 |                      50 |                   36 |                   0 |               36 | target_met
 01_lane05_latest_summary | hobby_entertainment             |                    35 |                       12 |                      35 |                   23 |                   0 |               23 | target_met
 01_lane05_latest_summary | professional_basic              |                    60 |                       20 |                      60 |                   40 |                   0 |               40 | target_met
 01_lane05_latest_summary | robot_aiworker                  |                    70 |                       27 |                      70 |                   43 |                   0 |               43 | target_met
 01_lane05_latest_summary | season_calendar                 |                    30 |                        7 |                      30 |                   23 |                   0 |               23 | target_met
 01_lane05_latest_summary | security_crisis                 |                    50 |                       14 |                      50 |                   36 |                   0 |               36 | target_met
(14 rows)

         section          |        brain_domain_code        | active_unit_count | target_min_unit_count | registry_count | source_object_registry_count | source_row_registry_count | source_missing_count | readable_model_count | full_load_status
--------------------------+---------------------------------+-------------------+-----------------------+----------------+------------------------------+---------------------------+----------------------+----------------------+------------------
 02_coverage_after_lane05 | history_worldview               |                50 |                    50 |            221 |                           17 |                       153 |                    0 |                   10 | loaded
 02_coverage_after_lane05 | civilization_foundation_history |                50 |                    50 |             60 |                            5 |                         4 |                    0 |                    5 | loaded
 02_coverage_after_lane05 | health_life_metrics             |                40 |                    40 |             44 |                            4 |                         0 |                    0 |                    1 | loaded
 02_coverage_after_lane05 | business_operation              |                70 |                    70 |            102 |                            7 |                        24 |                    0 |                   10 | loaded
 02_coverage_after_lane05 | professional_basic              |                60 |                    60 |             76 |                           15 |                         0 |                    0 |                    5 | loaded
 02_coverage_after_lane05 | food_nutrition                  |                30 |                    30 |             32 |                            1 |                         0 |                    0 |                    3 | loaded
 02_coverage_after_lane05 | season_calendar                 |                30 |                    30 |             34 |                            3 |                         0 |                    0 |                    3 | loaded
 02_coverage_after_lane05 | culture_region                  |                40 |                    40 |             42 |                            1 |                         0 |                    0 |                    4 | loaded
 02_coverage_after_lane05 | education_learning              |                45 |                    45 |             79 |                            2 |                        30 |                    0 |                    9 | loaded
 02_coverage_after_lane05 | exam_learning                   |                35 |                    35 |            264 |                            6 |                       222 |                    0 |                    3 | loaded
 02_coverage_after_lane05 | hobby_entertainment             |                35 |                    35 |             35 |                            0 |                         0 |                    0 |                    3 | loaded
 02_coverage_after_lane05 | robot_aiworker                  |                70 |                    70 |            151 |                           19 |                        60 |                    0 |                   13 | loaded
 02_coverage_after_lane05 | security_crisis                 |                50 |                    50 |             54 |                            3 |                         0 |                    0 |                    3 | loaded
 02_coverage_after_lane05 | city_art_game                   |                45 |                    45 |             91 |                           45 |                         0 |                    0 |                    2 | loaded
(14 rows)

       section       |        brain_domain_code        | lane05_unit_count | active_lane05_count
---------------------+---------------------------------+-------------------+---------------------
 03_lane05_by_domain | business_operation              |                44 |                  44
 03_lane05_by_domain | city_art_game                   |                32 |                  32
 03_lane05_by_domain | civilization_foundation_history |                36 |                  36
 03_lane05_by_domain | culture_region                  |                28 |                  28
 03_lane05_by_domain | education_learning              |                34 |                  34
 03_lane05_by_domain | exam_learning                   |                25 |                  25
 03_lane05_by_domain | food_nutrition                  |                24 |                  24
 03_lane05_by_domain | health_life_metrics             |                28 |                  28
 03_lane05_by_domain | history_worldview               |                36 |                  36
 03_lane05_by_domain | hobby_entertainment             |                23 |                  23
 03_lane05_by_domain | professional_basic              |                40 |                  40
 03_lane05_by_domain | robot_aiworker                  |                43 |                  43
 03_lane05_by_domain | season_calendar                 |                23 |                  23
 03_lane05_by_domain | security_crisis                 |                36 |                  36
(14 rows)

          section          |  model_code   | role_code  |        brain_domain_code        | readable_lane05_count
---------------------------+---------------+------------+---------------------------------+-----------------------
 04_runtime_lane05_preview | BYD2-003      | Manager    | business_operation              |                    44
 04_runtime_lane05_preview | BYD2-003      | Manager    | civilization_foundation_history |                    36
 04_runtime_lane05_preview | BYD2-003      | Manager    | education_learning              |                    34
 04_runtime_lane05_preview | BYD2-003      | Manager    | exam_learning                   |                    25
 04_runtime_lane05_preview | BYD2-003      | Manager    | history_worldview               |                    36
 04_runtime_lane05_preview | BYD2-003      | Manager    | professional_basic              |                    40
 04_runtime_lane05_preview | BYD2-003      | Manager    | robot_aiworker                  |                    43
 04_runtime_lane05_preview | HD-R1A        | Lover      | culture_region                  |                    10
 04_runtime_lane05_preview | HD-R1A        | Lover      | food_nutrition                  |                    12
 04_runtime_lane05_preview | HD-R1A        | Lover      | hobby_entertainment             |                    12
 04_runtime_lane05_preview | HD-R1A        | Lover      | season_calendar                 |                    12
 04_runtime_lane05_preview | HD-R1C        | Friend     | culture_region                  |                    10
 04_runtime_lane05_preview | HD-R1C        | Friend     | food_nutrition                  |                    12
 04_runtime_lane05_preview | HD-R1C        | Friend     | hobby_entertainment             |                    12
 04_runtime_lane05_preview | HD-R1C        | Friend     | season_calendar                 |                    12
 04_runtime_lane05_preview | HD-R2         | Security   | city_art_game                   |                    32
 04_runtime_lane05_preview | HD-R2         | Security   | robot_aiworker                  |                    32
 04_runtime_lane05_preview | HD-R2         | Security   | security_crisis                 |                    36
 04_runtime_lane05_preview | HD-R2G        | Specialist | robot_aiworker                  |                    32
 04_runtime_lane05_preview | HD-R2G        | Specialist | security_crisis                 |                    36
 04_runtime_lane05_preview | HD-R2S        | Specialist | robot_aiworker                  |                    32
 04_runtime_lane05_preview | HD-R2S        | Specialist | security_crisis                 |                    36
 04_runtime_lane05_preview | HD-R3         | Worker     | business_operation              |                    15
 04_runtime_lane05_preview | HD-R3         | Worker     | education_learning              |                    23
 04_runtime_lane05_preview | HD-R3         | Worker     | exam_learning                   |                    13
 04_runtime_lane05_preview | HD-R3         | Worker     | history_worldview               |                    12
 04_runtime_lane05_preview | HD-R3         | Worker     | robot_aiworker                  |                    11
 04_runtime_lane05_preview | HD-R5         | Manager    | business_operation              |                    30
 04_runtime_lane05_preview | HD-R5         | Manager    | civilization_foundation_history |                    18
 04_runtime_lane05_preview | HD-R5         | Manager    | education_learning              |                    34
 04_runtime_lane05_preview | HD-R5         | Manager    | exam_learning                   |                    25
 04_runtime_lane05_preview | HD-R5         | Manager    | history_worldview               |                    24
 04_runtime_lane05_preview | HD-R5         | Manager    | professional_basic              |                    27
 04_runtime_lane05_preview | HD-R5         | Manager    | robot_aiworker                  |                    22
 04_runtime_lane05_preview | HD-R5P        | President  | business_operation              |                    44
 04_runtime_lane05_preview | HD-R5P        | President  | civilization_foundation_history |                    36
 04_runtime_lane05_preview | HD-R5P        | President  | history_worldview               |                    36
 04_runtime_lane05_preview | HD-R5P        | President  | professional_basic              |                    40
 04_runtime_lane05_preview | HD-R5P        | President  | robot_aiworker                  |                    43
 04_runtime_lane05_preview | MG-NORN-001   | Worker     | business_operation              |                    30
 04_runtime_lane05_preview | MG-NORN-001   | Worker     | civilization_foundation_history |                    18
 04_runtime_lane05_preview | MG-NORN-001   | Worker     | education_learning              |                    34
 04_runtime_lane05_preview | MG-NORN-001   | Worker     | history_worldview               |                    24
 04_runtime_lane05_preview | MG-NORN-001   | Worker     | robot_aiworker                  |                    22
 04_runtime_lane05_preview | MG-NORN-002   | Worker     | business_operation              |                    30
 04_runtime_lane05_preview | MG-NORN-002   | Worker     | culture_region                  |                    28
 04_runtime_lane05_preview | MG-NORN-002   | Worker     | education_learning              |                    34
 04_runtime_lane05_preview | MG-NORN-002   | Worker     | health_life_metrics             |                    28
 04_runtime_lane05_preview | MG-NORN-002   | Worker     | history_worldview               |                    24
 04_runtime_lane05_preview | MG-NORN-002   | Worker     | robot_aiworker                  |                    22
 04_runtime_lane05_preview | MG-NORN-003   | Worker     | business_operation              |                    30
 04_runtime_lane05_preview | MG-NORN-003   | Worker     | city_art_game                   |                    32
 04_runtime_lane05_preview | MG-NORN-003   | Worker     | education_learning              |                    34
 04_runtime_lane05_preview | MG-NORN-003   | Worker     | history_worldview               |                    24
 04_runtime_lane05_preview | MG-NORN-003   | Worker     | professional_basic              |                    27
 04_runtime_lane05_preview | MG-NORN-003   | Worker     | robot_aiworker                  |                    22
 04_runtime_lane05_preview | SERIES:Beyond | Worker     | business_operation              |                    30
 04_runtime_lane05_preview | SERIES:Beyond | Worker     | education_learning              |                    34
 04_runtime_lane05_preview | SERIES:Beyond | Worker     | history_worldview               |                    24
 04_runtime_lane05_preview | SERIES:Beyond | Worker     | professional_basic              |                    27
 04_runtime_lane05_preview | SERIES:Beyond | Worker     | robot_aiworker                  |                    22
 04_runtime_lane05_preview | SERIES:HD     | Worker     | business_operation              |                    15
 04_runtime_lane05_preview | SERIES:HD     | Worker     | education_learning              |                    23
 04_runtime_lane05_preview | SERIES:HD     | Worker     | history_worldview               |                    12
 04_runtime_lane05_preview | SERIES:HD     | Worker     | robot_aiworker                  |                    11
 04_runtime_lane05_preview | SERIES:LoVerS | Lover      | culture_region                  |                    10
 04_runtime_lane05_preview | SERIES:LoVerS | Lover      | food_nutrition                  |                    12
 04_runtime_lane05_preview | SERIES:LoVerS | Lover      | hobby_entertainment             |                    12
 04_runtime_lane05_preview | SERIES:LoVerS | Lover      | season_calendar                 |                    12
 04_runtime_lane05_preview | SERIES:MEGAMI | Worker     | business_operation              |                    30
 04_runtime_lane05_preview | SERIES:MEGAMI | Worker     | civilization_foundation_history |                    18
 04_runtime_lane05_preview | SERIES:MEGAMI | Worker     | education_learning              |                    34
 04_runtime_lane05_preview | SERIES:MEGAMI | Worker     | history_worldview               |                    24
 04_runtime_lane05_preview | SERIES:MEGAMI | Worker     | robot_aiworker                  |                    22
(74 rows)

               check_code               | result |                        note
----------------------------------------+--------+----------------------------------------------------
 all_domains_meet_target                | PASS   | All full-load domains meet target_min_unit_count
 fill_axis_table_exists                 | PASS   | fill axis catalog exists
 hd_r1c_forbidden_still_zero            | PASS   | HD-R1C forbidden domains remain denied
 hd_r2_business_professional_still_zero | PASS   | HD-R2/R2S/R2G business/professional remains denied
 lane05_registry_source_all_exists      | PASS   | Lane05 registry source exists
 lane05_safety_not_empty                | PASS   | Lane05 units have safety boundary
 lane05_summary_view_exists             | PASS   | Lane05 latest summary view exists
 legacy_material_has_lane05             | PASS   | legacy material view includes Lane05 units
 runtime_material_has_lane05            | PASS   | runtime material view includes Lane05 units
(9 rows)

 section | pass_count | fail_count
---------+------------+------------
 SUMMARY |          9 |          0
(1 row)

```

FINAL_STATUS=BRAIN_FULL_LOAD_LANE_05_REPAIR_PASS_REVIEW_REQUIRED
NEXT=Brain Full Load Lane 06: runtime selection tuning / top-N by purpose and domain
