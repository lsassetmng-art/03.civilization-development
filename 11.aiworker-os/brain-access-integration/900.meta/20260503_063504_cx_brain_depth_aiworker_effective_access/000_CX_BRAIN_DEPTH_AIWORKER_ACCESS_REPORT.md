# CX22073JW / AIWorkerOS Brain Data Depth Registry + Effective Access Report

RUN_TS=20260503_063504
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_063504_cx_brain_depth_aiworker_effective_access
DB_ENV=PERSONA_DATABASE_URL
ERP_DATABASE_URL=NOT_USED
AICM_TOUCH=NO
DB_WRITE=YES
REVIEWER=佐藤(DB担当)

## Roadmap
- CX brain depth/domain/purpose/risk/granularity/registry
- CX registry view
- AIWorker model/series/role/domain policy
- AIWorker effective access/readable registry/compact context views
- AICM no-touch

## Files
- SQL_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_063504_cx_brain_depth_aiworker_effective_access/100_apply_cx_brain_depth_aiworker_access.sql
- VERIFY_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_063504_cx_brain_depth_aiworker_effective_access/200_verify_cx_brain_depth_aiworker_access.sql
- APPLY_LOG=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_063504_cx_brain_depth_aiworker_effective_access/110_apply.log
- VERIFY_LOG=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_063504_cx_brain_depth_aiworker_effective_access/210_verify.log

## Apply result
```
BEGIN
psql:/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_063504_cx_brain_depth_aiworker_effective_access/100_apply_cx_brain_depth_aiworker_access.sql:5: NOTICE:  schema "cx22073jw" already exists, skipping
CREATE SCHEMA
psql:/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_063504_cx_brain_depth_aiworker_effective_access/100_apply_cx_brain_depth_aiworker_access.sql:6: NOTICE:  schema "aiworker" already exists, skipping
CREATE SCHEMA
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
INSERT 0 6
INSERT 0 4
INSERT 0 5
INSERT 0 12
INSERT 0 14
INSERT 0 12
CREATE VIEW
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
INSERT 0 6
INSERT 0 4
INSERT 0 12
INSERT 0 29
INSERT 0 10
CREATE VIEW
CREATE VIEW
CREATE VIEW
COMMIT
```

## Verify result
```
       check_name       | value 
------------------------+-------
 cx_depth_catalog_count | 6
(1 row)

       check_name        | value 
-------------------------+-------
 cx_domain_catalog_count | 14
(1 row)

    check_name     | value 
-------------------+-------
 cx_registry_count | 12
(1 row)

            check_name             | value 
-----------------------------------+-------
 cx_registry_existing_source_count | 10
(1 row)

  model_code   | role_code  | total_brain_candidates | readable_count | denied_count 
---------------+------------+------------------------+----------------+--------------
 BYD2-003      | Manager    |                     12 |              6 |            6
 HD-R1A        | Lover      |                     12 |              3 |            9
 HD-R1C        | Friend     |                     12 |              3 |            9
 HD-R2         | Security   |                     12 |              4 |            8
 HD-R2G        | Specialist |                     12 |              3 |            9
 HD-R2S        | Specialist |                     12 |              3 |            9
 HD-R3         | Worker     |                     12 |              4 |            8
 HD-R5         | Manager    |                     12 |              6 |            6
 HD-R5P        | President  |                     12 |              4 |            8
 MG-NORN-001   | Worker     |                     12 |              6 |            6
 MG-NORN-002   | Worker     |                     12 |              6 |            6
 MG-NORN-003   | Worker     |                     12 |              5 |            7
 SERIES:Beyond | Worker     |                     12 |              5 |            7
 SERIES:HD     | Worker     |                     12 |              4 |            8
 SERIES:LoVerS | Lover      |                     12 |              3 |            9
 SERIES:MEGAMI | Worker     |                     12 |              6 |            6
(16 rows)

  model_code   | role_code  |        brain_domain_code        | readable_source_count | existing_source_count 
---------------+------------+---------------------------------+-----------------------+-----------------------
 BYD2-003      | Manager    | civilization_foundation_history |                     1 |                     1
 BYD2-003      | Manager    | education_learning              |                     2 |                     2
 BYD2-003      | Manager    | history_worldview               |                     1 |                     1
 BYD2-003      | Manager    | robot_aiworker                  |                     2 |                     0
 HD-R1A        | Lover      | culture_region                  |                     1 |                     1
 HD-R1A        | Lover      | food_nutrition                  |                     1 |                     1
 HD-R1A        | Lover      | season_calendar                 |                     1 |                     1
 HD-R1C        | Friend     | culture_region                  |                     1 |                     1
 HD-R1C        | Friend     | food_nutrition                  |                     1 |                     1
 HD-R1C        | Friend     | season_calendar                 |                     1 |                     1
 HD-R2         | Security   | city_art_game                   |                     1 |                     1
 HD-R2         | Security   | robot_aiworker                  |                     2 |                     0
 HD-R2         | Security   | security_crisis                 |                     1 |                     1
 HD-R2G        | Specialist | robot_aiworker                  |                     2 |                     0
 HD-R2G        | Specialist | security_crisis                 |                     1 |                     1
 HD-R2S        | Specialist | robot_aiworker                  |                     2 |                     0
 HD-R2S        | Specialist | security_crisis                 |                     1 |                     1
 HD-R3         | Worker     | education_learning              |                     2 |                     2
 HD-R3         | Worker     | robot_aiworker                  |                     2 |                     0
 HD-R5         | Manager    | civilization_foundation_history |                     1 |                     1
 HD-R5         | Manager    | education_learning              |                     2 |                     2
 HD-R5         | Manager    | history_worldview               |                     1 |                     1
 HD-R5         | Manager    | robot_aiworker                  |                     2 |                     0
 HD-R5P        | President  | civilization_foundation_history |                     1 |                     1
 HD-R5P        | President  | history_worldview               |                     1 |                     1
 HD-R5P        | President  | robot_aiworker                  |                     2 |                     0
 MG-NORN-001   | Worker     | civilization_foundation_history |                     1 |                     1
 MG-NORN-001   | Worker     | education_learning              |                     2 |                     2
 MG-NORN-001   | Worker     | history_worldview               |                     1 |                     1
 MG-NORN-001   | Worker     | robot_aiworker                  |                     2 |                     0
 MG-NORN-002   | Worker     | culture_region                  |                     1 |                     1
 MG-NORN-002   | Worker     | education_learning              |                     2 |                     2
 MG-NORN-002   | Worker     | history_worldview               |                     1 |                     1
 MG-NORN-002   | Worker     | robot_aiworker                  |                     2 |                     0
 MG-NORN-003   | Worker     | education_learning              |                     2 |                     2
 MG-NORN-003   | Worker     | history_worldview               |                     1 |                     1
 MG-NORN-003   | Worker     | robot_aiworker                  |                     2 |                     0
 SERIES:Beyond | Worker     | education_learning              |                     2 |                     2
 SERIES:Beyond | Worker     | history_worldview               |                     1 |                     1
 SERIES:Beyond | Worker     | robot_aiworker                  |                     2 |                     0
 SERIES:HD     | Worker     | education_learning              |                     2 |                     2
 SERIES:HD     | Worker     | robot_aiworker                  |                     2 |                     0
 SERIES:LoVerS | Lover      | culture_region                  |                     1 |                     1
 SERIES:LoVerS | Lover      | food_nutrition                  |                     1 |                     1
 SERIES:LoVerS | Lover      | season_calendar                 |                     1 |                     1
 SERIES:MEGAMI | Worker     | civilization_foundation_history |                     1 |                     1
 SERIES:MEGAMI | Worker     | education_learning              |                     2 |                     2
 SERIES:MEGAMI | Worker     | history_worldview               |                     1 |                     1
 SERIES:MEGAMI | Worker     | robot_aiworker                  |                     2 |                     0
(49 rows)

```

## Final
FINAL_STATUS=REVIEW_REQUIRED_DB_WRITE_EXECUTED
AICM_TOUCH=NO
NEXT=AIWorker runtime/prompt builder compact context connection smoke
