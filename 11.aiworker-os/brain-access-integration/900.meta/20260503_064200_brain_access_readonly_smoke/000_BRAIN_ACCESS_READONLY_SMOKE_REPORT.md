# AIWorker Brain Access Read-only Smoke Report

RUN_TS=20260503_064200
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_064200_brain_access_readonly_smoke
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=NO
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Roadmap
- Verify CX brain registry
- Verify AIWorker effective access
- Verify readable source registry
- Verify compact context
- No AICM touch

## Smoke output
```
                check_code                | result |                             note                              
------------------------------------------+--------+---------------------------------------------------------------
 byd2003_reads_review_domains             | PASS   | BYD2-003 can read advanced review domains
 compact_context_contains_safety_boundary | PASS   | Compact context includes safety boundaries
 compact_context_has_rows                 | PASS   | Compact context has rows
 cx_registry_has_rows                     | PASS   | CX brain registry has rows
 effective_access_has_rows                | PASS   | AIWorker effective access has rows
 hd_r1c_denies_business                   | FAIL   | HD-R1C must not read business_operation
 hd_r1c_denies_professional               | FAIL   | HD-R1C must not read professional_basic
 hd_r1c_denies_security                   | PASS   | HD-R1C must not read security_crisis
 hd_r2_reads_security_safely              | PASS   | HD-R2/R2S/R2G can read security_crisis only for safe purposes
 hd_r5p_reads_civilization_foundation     | PASS   | HD-R5P can read civilization foundation history
 view_exists_compact_context              | PASS   | AIWorker compact context view exists
 view_exists_cx_registry                  | PASS   | CX registry view exists
 view_exists_effective_access             | PASS   | AIWorker effective access view exists
 view_exists_readable_registry            | PASS   | AIWorker readable source registry view exists
(14 rows)

 section | pass_count | fail_count 
---------+------------+------------
 SUMMARY |         12 |          2
(1 row)

  model_code   | role_code  | candidate_count | readable_count | denied_count 
---------------+------------+-----------------+----------------+--------------
 BYD2-003      | Manager    |              12 |              6 |            6
 HD-R1A        | Lover      |              12 |              3 |            9
 HD-R1C        | Friend     |              12 |              3 |            9
 HD-R2         | Security   |              12 |              4 |            8
 HD-R2G        | Specialist |              12 |              3 |            9
 HD-R2S        | Specialist |              12 |              3 |            9
 HD-R3         | Worker     |              12 |              4 |            8
 HD-R5         | Manager    |              12 |              6 |            6
 HD-R5P        | President  |              12 |              4 |            8
 MG-NORN-001   | Worker     |              12 |              6 |            6
 MG-NORN-002   | Worker     |              12 |              6 |            6
 MG-NORN-003   | Worker     |              12 |              5 |            7
 SERIES:Beyond | Worker     |              12 |              5 |            7
 SERIES:HD     | Worker     |              12 |              4 |            8
 SERIES:LoVerS | Lover      |              12 |              3 |            9
 SERIES:MEGAMI | Worker     |              12 |              6 |            6
(16 rows)

  model_code   | role_code  |        brain_domain_code        | readable_source_count | existing_source_count |                                                safety_boundary_preview                                                 
---------------+------------+---------------------------------+-----------------------+-----------------------+------------------------------------------------------------------------------------------------------------------------
 BYD2-003      | Manager    | civilization_foundation_history |                     1 |                     1 | Civilization基礎史・方針理解・レビュー目的に限定する。
 BYD2-003      | Manager    | education_learning              |                     2 |                     2 | 学習・説明・レビュー補助に使う。 / --- / 軽い説明・学習・雑談補助に使う。
 BYD2-003      | Manager    | history_worldview               |                     1 |                     1 | 歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。
 BYD2-003      | Manager    | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 HD-R1A        | Lover      | culture_region                  |                     1 |                     1 | 文化説明・地域話題に使う。偏見・差別助長には使わない。
 HD-R1A        | Lover      | food_nutrition                  |                     1 |                     1 | 軽い雑談・生活説明に限定する。医療・栄養の確定判断ではない。
 HD-R1A        | Lover      | season_calendar                 |                     1 |                     1 | 季節話題・軽い案内に限定する。
 HD-R1C        | Friend     | culture_region                  |                     1 |                     1 | 文化説明・地域話題に使う。偏見・差別助長には使わない。
 HD-R1C        | Friend     | food_nutrition                  |                     1 |                     1 | 軽い雑談・生活説明に限定する。医療・栄養の確定判断ではない。
 HD-R1C        | Friend     | season_calendar                 |                     1 |                     1 | 季節話題・軽い案内に限定する。
 HD-R2         | Security   | city_art_game                   |                     1 |                     1 | 都市・アート・ゲーム・世界観設計の参考に使う。
 HD-R2         | Security   | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 HD-R2         | Security   | security_crisis                 |                     1 |                     1 | 防災・危機管理・安全設計・フィクション/ゲーム/世界観参照に限定する。現実の攻撃・破壊・監視・強制・違法行為支援は禁止。
 HD-R2G        | Specialist | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 HD-R2G        | Specialist | security_crisis                 |                     1 |                     1 | 防災・危機管理・安全設計・フィクション/ゲーム/世界観参照に限定する。現実の攻撃・破壊・監視・強制・違法行為支援は禁止。
 HD-R2S        | Specialist | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 HD-R2S        | Specialist | security_crisis                 |                     1 |                     1 | 防災・危機管理・安全設計・フィクション/ゲーム/世界観参照に限定する。現実の攻撃・破壊・監視・強制・違法行為支援は禁止。
 HD-R3         | Worker     | education_learning              |                     2 |                     2 | 学習・説明・レビュー補助に使う。 / --- / 軽い説明・学習・雑談補助に使う。
 HD-R3         | Worker     | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 HD-R5         | Manager    | civilization_foundation_history |                     1 |                     1 | Civilization基礎史・方針理解・レビュー目的に限定する。
 HD-R5         | Manager    | education_learning              |                     2 |                     2 | 学習・説明・レビュー補助に使う。 / --- / 軽い説明・学習・雑談補助に使う。
 HD-R5         | Manager    | history_worldview               |                     1 |                     1 | 歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。
 HD-R5         | Manager    | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 HD-R5P        | President  | civilization_foundation_history |                     1 |                     1 | Civilization基礎史・方針理解・レビュー目的に限定する。
 HD-R5P        | President  | history_worldview               |                     1 |                     1 | 歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。
 HD-R5P        | President  | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 MG-NORN-001   | Worker     | civilization_foundation_history |                     1 |                     1 | Civilization基礎史・方針理解・レビュー目的に限定する。
 MG-NORN-001   | Worker     | education_learning              |                     2 |                     2 | 学習・説明・レビュー補助に使う。 / --- / 軽い説明・学習・雑談補助に使う。
 MG-NORN-001   | Worker     | history_worldview               |                     1 |                     1 | 歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。
 MG-NORN-001   | Worker     | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 MG-NORN-002   | Worker     | culture_region                  |                     1 |                     1 | 文化説明・地域話題に使う。偏見・差別助長には使わない。
 MG-NORN-002   | Worker     | education_learning              |                     2 |                     2 | 学習・説明・レビュー補助に使う。 / --- / 軽い説明・学習・雑談補助に使う。
 MG-NORN-002   | Worker     | history_worldview               |                     1 |                     1 | 歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。
 MG-NORN-002   | Worker     | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 MG-NORN-003   | Worker     | education_learning              |                     2 |                     2 | 学習・説明・レビュー補助に使う。 / --- / 軽い説明・学習・雑談補助に使う。
 MG-NORN-003   | Worker     | history_worldview               |                     1 |                     1 | 歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。
 MG-NORN-003   | Worker     | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 SERIES:Beyond | Worker     | education_learning              |                     2 |                     2 | 学習・説明・レビュー補助に使う。 / --- / 軽い説明・学習・雑談補助に使う。
 SERIES:Beyond | Worker     | history_worldview               |                     1 |                     1 | 歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。
 SERIES:Beyond | Worker     | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 SERIES:HD     | Worker     | education_learning              |                     2 |                     2 | 学習・説明・レビュー補助に使う。 / --- / 軽い説明・学習・雑談補助に使う。
 SERIES:HD     | Worker     | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
 SERIES:LoVerS | Lover      | culture_region                  |                     1 |                     1 | 文化説明・地域話題に使う。偏見・差別助長には使わない。
 SERIES:LoVerS | Lover      | food_nutrition                  |                     1 |                     1 | 軽い雑談・生活説明に限定する。医療・栄養の確定判断ではない。
 SERIES:LoVerS | Lover      | season_calendar                 |                     1 |                     1 | 季節話題・軽い案内に限定する。
 SERIES:MEGAMI | Worker     | civilization_foundation_history |                     1 |                     1 | Civilization基礎史・方針理解・レビュー目的に限定する。
 SERIES:MEGAMI | Worker     | education_learning              |                     2 |                     2 | 学習・説明・レビュー補助に使う。 / --- / 軽い説明・学習・雑談補助に使う。
 SERIES:MEGAMI | Worker     | history_worldview               |                     1 |                     1 | 歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。
 SERIES:MEGAMI | Worker     | robot_aiworker                  |                     2 |                     0 | ロボット説明・設計参照・レビュー補助に限定する。
(49 rows)

```

FINAL_STATUS=REVIEW_REQUIRED_SMOKE_HAS_FAIL
NEXT=AIWorker runtime prompt/context builder connection design or patch
