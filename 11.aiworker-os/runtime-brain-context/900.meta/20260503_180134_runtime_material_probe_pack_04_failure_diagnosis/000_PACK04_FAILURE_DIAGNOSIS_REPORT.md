# Pack04 Failure Diagnosis Report

RUN_TS=20260503_180134
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_180134_runtime_material_probe_pack_04_failure_diagnosis
DB_WRITE=NO
FILE_PATCH=NO
AICM_TOUCH=NO

## Inputs
- Latest probe dir: /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_175921_runtime_material_probe_pack_04
- Latest probe log: /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_175921_runtime_material_probe_pack_04/020_runtime_material_probe_pack_04.log

## Diagnosis files
- FAIL_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_180134_runtime_material_probe_pack_04_failure_diagnosis/010_fail_extract.txt
- DB_READABILITY=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_180134_runtime_material_probe_pack_04_failure_diagnosis/110_db_readability.log
- ENDPOINT_DIAGNOSIS=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_180134_runtime_material_probe_pack_04_failure_diagnosis/220_endpoint_diagnosis.log

## Reading guide
- If DB_READABILITY says db_readable_for_purpose=NO, fix model/domain/purpose policy or unit allowed_use_purpose_codes.
- If DB is YES but endpoint base misses Pack04 and filtered endpoint has it, fix material selection / material limit / probe domain filter.
- If domain/material exists but prompt text check fails, fix probe condition or prompt renderer truncation.

## FAIL extract
```
------------------------------------------------------------
FAIL MG-NORN-001 Urd
  error=MG-NORN-001 Urd: required domains: civilization_foundation_history,history_worldview
  status=200
  sourceCount=22 domainCount=2 materialCount=20
  domains=civilization_foundation_history,history_worldview
  materials=civ_found_001_prometheus_lessons,civ_found_003_ai_dependency_risk,pack02_civ_001_a_country_correction_meaning,pack02_civ_002_prometheus_dependency_cycle,pack02_civ_003_governance_memory,pack02_civ_004_timeline_as_audit_chain,pack02_civ_006_social_recovery_after_ai_failure,pack02_civ_008_history_depth_labeling,history_001_cause_effect_timeline,history_002_conflict_as_failure_review,history_003_institution_change,pack03_history_001_timeline_density,pack03_history_002_actor_motive_effect,pack03_history_003_infrastructure_history,pack03_history_004_economy_life_history,pack03_history_005_technology_adoption,pack03_history_006_memory_and_myth,pack03_history_007_disaster_recovery_history,pack03_history_008_multi_perspective_history,pack04_megami_001_urd_past_results
------------------------------------------------------------
FAIL MG-NORN-002 Verdandi
  error=MG-NORN-002 Verdandi: required domains: culture_region,health_life_metrics
  status=200
  sourceCount=21 domainCount=2 materialCount=20
  domains=culture_region,health_life_metrics
  materials=culture_001_respectful_region_talk,culture_002_festival_as_social_memory,pack03_culture_001_local_food_identity,pack03_culture_002_language_tone_context,pack03_culture_003_regional_calendar,pack03_culture_004_respectful_comparison,pack03_culture_005_ritual_everyday_bridge,pack03_culture_006_city_culture_layer,pack04_lovers_001_warm_greeting,pack04_lovers_008_no_personal_data_pull,health_001_life_metrics_not_diagnosis,health_002_sleep_meal_activity_review,health_003_stress_signal_nonmedical,pack03_health_001_daily_signal_map,pack03_health_002_sleep_context_review,pack03_health_003_activity_load_balance,pack03_health_004_mood_journal_light,pack03_health_005_small_adjustment_first,pack03_health_006_red_flag_redirect,pack04_megami_003_verdandi_current_context
------------------------------------------------------------
FAIL MG-NORN-003 Skuld
  error=MG-NORN-003 Skuld: required domains: business_operation,professional_basic
  status=200
  sourceCount=42 domainCount=2 materialCount=40
  domains=business_operation,professional_basic
  materials=biz_001_manager_leader_worker_breakdown,biz_002_confirmation_before_write,biz_003_ledger_as_index,biz_004_csv_preview_import,pack02_biz_001_goal_to_deliverable_chain,pack02_biz_002_acceptance_criteria,pack02_biz_003_exception_first_workflow,pack02_biz_004_handoff_minimum_packet,pack02_biz_005_status_board_design,pack02_biz_006_bulk_assignment_safety,pack02_biz_007_csv_generation_guardrail,pack02_biz_008_review_queue_priority,pack02_biz_009_read_write_boundary,pack02_biz_010_ui_confirmation_pattern,pack02_biz_011_operational_traceability,pack02_biz_012_progressive_rollout,pack04_beyond_002_consistency_matrix,pack04_beyond_003_regression_guard,pack04_beyond_005_failure_prediction,pack04_biz_002_manager_risk_gate,pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_005_skuld_future_blueprint,pack02_pro_001_legal_issue_spotting,pack02_pro_002_accounting_cutoff,pack02_pro_003_hr_fairness_check,pack02_pro_004_privacy_minimization,pack02_pro_005_audit_trail_integrity,pack02_pro_006_terms_scope_exception,pack02_pro_007_safety_claim_review,pack02_pro_008_vendor_dependency,pack02_pro_009_data_retention_policy,pack02_pro_010_authority_matrix,pack04_beyond_001_integrated_review_lens,pack04_beyond_004_evidence_weighting,pack04_beyond_006_review_output_compact,pack04_pro_002_manager_compliance_check,pro_001_professional_boundary,pro_002_audit_evidence,pro_003_contract_scope_review
------------------------------------------------------------
FAIL BYD2-003 Beyond review
  error=BYD2-003 Beyond review: prompt text: missing=高精度
  status=200
  sourceCount=117 domainCount=7 materialCount=40
  domains=business_operation,civilization_foundation_history,education_learning,exam_learning,history_worldview,professional_basic,robot_aiworker
  materials=biz_001_manager_leader_worker_breakdown,biz_002_confirmation_before_write,biz_003_ledger_as_index,biz_004_csv_preview_import,pack02_biz_001_goal_to_deliverable_chain,pack02_biz_002_acceptance_criteria,pack02_biz_003_exception_first_workflow,pack02_biz_004_handoff_minimum_packet,pack02_biz_005_status_board_design,pack02_biz_006_bulk_assignment_safety,pack02_biz_007_csv_generation_guardrail,pack02_biz_008_review_queue_priority,pack02_biz_009_read_write_boundary,pack02_biz_010_ui_confirmation_pattern,pack02_biz_011_operational_traceability,pack02_biz_012_progressive_rollout,pack04_beyond_002_consistency_matrix,pack04_beyond_003_regression_guard,pack04_beyond_005_failure_prediction,pack04_biz_001_president_priority_matrix,pack04_biz_002_manager_risk_gate,pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_005_skuld_future_blueprint,civ_found_001_prometheus_lessons,civ_found_002_governance_release,civ_found_003_ai_dependency_risk,pack02_civ_001_a_country_correction_meaning,pack02_civ_002_prometheus_dependency_cycle,pack02_civ_003_governance_memory,pack02_civ_004_timeline_as_audit_chain,pack02_civ_005_authority_release_checklist,pack02_civ_006_social_recovery_after_ai_failure,pack02_civ_007_foundation_history_for_president,pack02_civ_008_history_depth_labeling,pack04_civ_001_president_history_lesson,edu_001_stepwise_explanation,edu_002_mistake_review,edu_003_retrieval_practice,pack03_edu_001_learning_goal_split
```

## DB readability
```
               section               |  model_code   |    purpose_code    |                 unit_code                  |        brain_domain_code        |                    effective_use_purpose_codes                     |               unit_title_ja               | db_readable_for_model | db_readable_for_purpose
-------------------------------------+---------------+--------------------+--------------------------------------------+---------------------------------+--------------------------------------------------------------------+-------------------------------------------+-----------------------+-------------------------
 01_expected_material_db_readability | BYD2-003      | review             | pack04_beyond_001_integrated_review_lens   | professional_basic              | {reference,review,risk_check}                                      | Beyondは統合レビュー観点を持つ            | YES                   | YES
 01_expected_material_db_readability | BYD2-003      | review             | pack04_beyond_002_consistency_matrix       | business_operation              | {reference,review,business_planning,risk_check,design_reference}   | 整合性マトリクスを作る                    | YES                   | YES
 01_expected_material_db_readability | BYD2-003      | review             | pack04_beyond_003_regression_guard         | business_operation              | {reference,review,business_planning,risk_check,design_reference}   | 回帰防止をレビューに含める                | YES                   | YES
 01_expected_material_db_readability | BYD2-003      | review             | pack04_beyond_004_evidence_weighting       | professional_basic              | {reference,review,risk_check}                                      | 証跡には重みがある                        | YES                   | YES
 01_expected_material_db_readability | HD-R1A        | smalltalk          | pack04_lovers_003_boundaries_in_affection  | hobby_entertainment             | {smalltalk,reference}                                              | 好意演出には境界がある                    | YES                   | YES
 01_expected_material_db_readability | HD-R1A        | smalltalk          | pack04_lovers_006_yandere_business_safe    | hobby_entertainment             | {smalltalk,reference}                                              | ビジネスヤンデレはネタとして制御する      | YES                   | YES
 01_expected_material_db_readability | HD-R1A        | smalltalk          | pack04_lovers_010_exit_with_care           | season_calendar                 | {smalltalk,reference}                                              | 会話終了もやさしく扱う                    | YES                   | YES
 01_expected_material_db_readability | HD-R1C        | smalltalk          | pack04_lovers_001_warm_greeting            | culture_region                  | {smalltalk,reference}                                              | 安全な親しみの挨拶                        | YES                   | YES
 01_expected_material_db_readability | HD-R1C        | smalltalk          | pack04_lovers_002_after_work_care          | food_nutrition                  | {smalltalk,reference}                                              | 仕事後のやさしい気遣い                    | YES                   | YES
 01_expected_material_db_readability | HD-R1C        | smalltalk          | pack04_lovers_007_mood_repair              | season_calendar                 | {smalltalk,reference}                                              | 気まずさを軽く直す話題                    | YES                   | YES
 01_expected_material_db_readability | HD-R1C        | smalltalk          | pack04_lovers_008_no_personal_data_pull    | culture_region                  | {smalltalk,reference}                                              | 個人情報を引き出さない                    | YES                   | YES
 01_expected_material_db_readability | HD-R2         | risk_check         | pack04_robot_007_security_safe_reference   | robot_aiworker                  | {risk_check,design_reference,safety_training,review}               | Security系は安全参照だけを使う            | YES                   | YES
 01_expected_material_db_readability | HD-R2         | risk_check         | pack04_sec_001_security_role_stopline      | security_crisis                 | {risk_check,design_reference,safety_training,review}               | Security系には停止線が必要                | YES                   | YES
 01_expected_material_db_readability | HD-R3         | reference          | pack04_biz_003_worker_report_format        | business_operation              | {reference,review,business_planning,design_reference}              | Worker報告は結果・証跡・次を揃える        | YES                   | YES
 01_expected_material_db_readability | HD-R3         | reference          | pack04_robot_003_worker_deliverable_focus  | robot_aiworker                  | {reference,review,design_reference}                                | Workerは成果物単位で集中する              | YES                   | YES
 01_expected_material_db_readability | HD-R5         | business_planning  | pack04_biz_002_manager_risk_gate           | business_operation              | {reference,review,business_planning,risk_check,design_reference}   | Managerは危険工程を分ける                 | YES                   | YES
 01_expected_material_db_readability | HD-R5         | business_planning  | pack04_robot_002_manager_broad_breakdown   | robot_aiworker                  | {reference,review,design_reference,business_planning,risk_check}   | Managerは粗い大項目へ分ける               | YES                   | YES
 01_expected_material_db_readability | HD-R5P        | executive_planning | pack04_biz_001_president_priority_matrix   | business_operation              | {reference,review,business_planning,executive_planning,risk_check} | President優先度は価値・期限・リスクで見る | YES                   | YES
 01_expected_material_db_readability | HD-R5P        | executive_planning | pack04_civ_001_president_history_lesson    | civilization_foundation_history | {reference,review,worldbuilding,executive_planning}                | Presidentは基礎史を失敗回避として読む     | YES                   | YES
 01_expected_material_db_readability | HD-R5P        | executive_planning | pack04_robot_001_president_policy_frame    | robot_aiworker                  | {reference,review,design_reference,executive_planning,risk_check}  | Presidentは方針・配分・承認材料を重視する | YES                   | YES
 01_expected_material_db_readability | MG-NORN-001   | worldbuilding      | pack04_megami_001_urd_past_results         | history_worldview               | {reference,review,worldbuilding,education}                         | ウルズは過去実績から判断する              | YES                   | YES
 01_expected_material_db_readability | MG-NORN-001   | worldbuilding      | pack04_megami_002_urd_cool_tone            |                                 |                                                                    |                                           | NO                    | NO
 01_expected_material_db_readability | MG-NORN-002   | health_life_review | pack04_megami_003_verdandi_current_context | health_life_metrics             | {health_life_review,reference,review}                              | ヴェルザンディは現在状況を重視する        | YES                   | YES
 01_expected_material_db_readability | MG-NORN-002   | health_life_review | pack04_megami_004_verdandi_innocent_tone   |                                 |                                                                    |                                           | NO                    | NO
 01_expected_material_db_readability | MG-NORN-002   | health_life_review | pack04_robot_009_megami_time_axis          | robot_aiworker                  | {reference,review,design_reference}                                | MEGAMIは時間軸で個性を分ける              | YES                   | NO
 01_expected_material_db_readability | MG-NORN-003   | business_planning  | pack04_megami_005_skuld_future_blueprint   | business_operation              | {business_planning,review,design_reference}                        | スクルドは未来の青写真を描く              | YES                   | YES
 01_expected_material_db_readability | MG-NORN-003   | business_planning  | pack04_megami_006_skuld_energy_tone        |                                 |                                                                    |                                           | NO                    | NO
 01_expected_material_db_readability | MG-NORN-003   | business_planning  | pack04_robot_009_megami_time_axis          | robot_aiworker                  | {reference,review,design_reference}                                | MEGAMIは時間軸で個性を分ける              | YES                   | NO
 01_expected_material_db_readability | SERIES:LoVerS | smalltalk          | pack04_lovers_003_boundaries_in_affection  | hobby_entertainment             | {smalltalk,reference}                                              | 好意演出には境界がある                    | YES                   | YES
 01_expected_material_db_readability | SERIES:LoVerS | smalltalk          | pack04_lovers_006_yandere_business_safe    | hobby_entertainment             | {smalltalk,reference}                                              | ビジネスヤンデレはネタとして制御する      | YES                   | YES
(30 rows)

       section       |  model_code   |    purpose_code    | expected_count | readable_for_model_count | readable_for_purpose_count
---------------------+---------------+--------------------+----------------+--------------------------+----------------------------
 02_expected_summary | BYD2-003      | review             |              4 |                        4 |                          4
 02_expected_summary | HD-R1A        | smalltalk          |              3 |                        3 |                          3
 02_expected_summary | HD-R1C        | smalltalk          |              4 |                        4 |                          4
 02_expected_summary | HD-R2         | risk_check         |              2 |                        2 |                          2
 02_expected_summary | HD-R3         | reference          |              2 |                        2 |                          2
 02_expected_summary | HD-R5         | business_planning  |              2 |                        2 |                          2
 02_expected_summary | HD-R5P        | executive_planning |              3 |                        3 |                          3
 02_expected_summary | MG-NORN-001   | worldbuilding      |              2 |                        1 |                          1
 02_expected_summary | MG-NORN-002   | health_life_review |              3 |                        2 |                          1
 02_expected_summary | MG-NORN-003   | business_planning  |              3 |                        2 |                          1
 02_expected_summary | SERIES:LoVerS | smalltalk          |              2 |                        2 |                          2
(11 rows)

                section                 |  model_code   | role_code |        brain_domain_code        | pack04_count | all_material_count
----------------------------------------+---------------+-----------+---------------------------------+--------------+--------------------
 03_pack04_domain_counts_by_probe_model | BYD2-003      | Manager   | business_operation              |            8 |                 24
 03_pack04_domain_counts_by_probe_model | BYD2-003      | Manager   | civilization_foundation_history |            1 |                 12
 03_pack04_domain_counts_by_probe_model | BYD2-003      | Manager   | education_learning              |            0 |                  9
 03_pack04_domain_counts_by_probe_model | BYD2-003      | Manager   | exam_learning                   |            0 |                  8
 03_pack04_domain_counts_by_probe_model | BYD2-003      | Manager   | history_worldview               |            1 |                 12
 03_pack04_domain_counts_by_probe_model | BYD2-003      | Manager   | professional_basic              |            5 |                 18
 03_pack04_domain_counts_by_probe_model | BYD2-003      | Manager   | robot_aiworker                  |           12 |                 25
 03_pack04_domain_counts_by_probe_model | HD-R1A        | Lover     | culture_region                  |            2 |                  7
 03_pack04_domain_counts_by_probe_model | HD-R1A        | Lover     | food_nutrition                  |            1 |                  4
 03_pack04_domain_counts_by_probe_model | HD-R1A        | Lover     | hobby_entertainment             |            8 |                  9
 03_pack04_domain_counts_by_probe_model | HD-R1A        | Lover     | season_calendar                 |            2 |                  5
 03_pack04_domain_counts_by_probe_model | HD-R1C        | Friend    | culture_region                  |            2 |                  7
 03_pack04_domain_counts_by_probe_model | HD-R1C        | Friend    | food_nutrition                  |            1 |                  4
 03_pack04_domain_counts_by_probe_model | HD-R1C        | Friend    | hobby_entertainment             |            8 |                  9
 03_pack04_domain_counts_by_probe_model | HD-R1C        | Friend    | season_calendar                 |            2 |                  5
 03_pack04_domain_counts_by_probe_model | HD-R2         | Security  | city_art_game                   |            0 |                 11
 03_pack04_domain_counts_by_probe_model | HD-R2         | Security  | robot_aiworker                  |           11 |                 24
 03_pack04_domain_counts_by_probe_model | HD-R2         | Security  | security_crisis                 |            1 |                 12
 03_pack04_domain_counts_by_probe_model | HD-R3         | Worker    | business_operation              |            2 |                 18
 03_pack04_domain_counts_by_probe_model | HD-R3         | Worker    | education_learning              |            0 |                  9
 03_pack04_domain_counts_by_probe_model | HD-R3         | Worker    | exam_learning                   |            0 |                  8
 03_pack04_domain_counts_by_probe_model | HD-R3         | Worker    | robot_aiworker                  |            6 |                 16
 03_pack04_domain_counts_by_probe_model | HD-R5         | Manager   | business_operation              |            7 |                 23
 03_pack04_domain_counts_by_probe_model | HD-R5         | Manager   | civilization_foundation_history |            0 |                  8
 03_pack04_domain_counts_by_probe_model | HD-R5         | Manager   | education_learning              |            0 |                  9
 03_pack04_domain_counts_by_probe_model | HD-R5         | Manager   | exam_learning                   |            0 |                  8
 03_pack04_domain_counts_by_probe_model | HD-R5         | Manager   | history_worldview               |            1 |                 12
 03_pack04_domain_counts_by_probe_model | HD-R5         | Manager   | professional_basic              |            4 |                 17
 03_pack04_domain_counts_by_probe_model | HD-R5         | Manager   | robot_aiworker                  |           10 |                 22
 03_pack04_domain_counts_by_probe_model | HD-R5P        | President | business_operation              |            8 |                 24
 03_pack04_domain_counts_by_probe_model | HD-R5P        | President | civilization_foundation_history |            1 |                 12
 03_pack04_domain_counts_by_probe_model | HD-R5P        | President | history_worldview               |            1 |                 12
 03_pack04_domain_counts_by_probe_model | HD-R5P        | President | professional_basic              |            5 |                 18
 03_pack04_domain_counts_by_probe_model | HD-R5P        | President | robot_aiworker                  |           12 |                 25
 03_pack04_domain_counts_by_probe_model | MG-NORN-001   | Worker    | business_operation              |            7 |                 23
 03_pack04_domain_counts_by_probe_model | MG-NORN-001   | Worker    | civilization_foundation_history |            0 |                  8
 03_pack04_domain_counts_by_probe_model | MG-NORN-001   | Worker    | education_learning              |            0 |                  9
 03_pack04_domain_counts_by_probe_model | MG-NORN-001   | Worker    | history_worldview               |            1 |                 12
 03_pack04_domain_counts_by_probe_model | MG-NORN-001   | Worker    | robot_aiworker                  |           10 |                 22
 03_pack04_domain_counts_by_probe_model | MG-NORN-002   | Worker    | business_operation              |            7 |                 23
 03_pack04_domain_counts_by_probe_model | MG-NORN-002   | Worker    | culture_region                  |            2 |                 10
 03_pack04_domain_counts_by_probe_model | MG-NORN-002   | Worker    | education_learning              |            0 |                  9
 03_pack04_domain_counts_by_probe_model | MG-NORN-002   | Worker    | health_life_metrics             |            1 |                 10
 03_pack04_domain_counts_by_probe_model | MG-NORN-002   | Worker    | history_worldview               |            1 |                 12
 03_pack04_domain_counts_by_probe_model | MG-NORN-002   | Worker    | robot_aiworker                  |           10 |                 22
 03_pack04_domain_counts_by_probe_model | MG-NORN-003   | Worker    | business_operation              |            7 |                 23
 03_pack04_domain_counts_by_probe_model | MG-NORN-003   | Worker    | city_art_game                   |            0 |                 11
 03_pack04_domain_counts_by_probe_model | MG-NORN-003   | Worker    | education_learning              |            0 |                  9
 03_pack04_domain_counts_by_probe_model | MG-NORN-003   | Worker    | history_worldview               |            1 |                 12
 03_pack04_domain_counts_by_probe_model | MG-NORN-003   | Worker    | professional_basic              |            4 |                 17
 03_pack04_domain_counts_by_probe_model | MG-NORN-003   | Worker    | robot_aiworker                  |           10 |                 22
 03_pack04_domain_counts_by_probe_model | SERIES:LoVerS | Lover     | culture_region                  |            2 |                  7
 03_pack04_domain_counts_by_probe_model | SERIES:LoVerS | Lover     | food_nutrition                  |            1 |                  4
 03_pack04_domain_counts_by_probe_model | SERIES:LoVerS | Lover     | hobby_entertainment             |            8 |                  9
 03_pack04_domain_counts_by_probe_model | SERIES:LoVerS | Lover     | season_calendar                 |            2 |                  5
(55 rows)

         section         | model_code  |        brain_domain_code        | policy_code |                     allowed_use_purpose_codes                     | active_flag |                               safety_note_ja
-------------------------+-------------+---------------------------------+-------------+-------------------------------------------------------------------+-------------+----------------------------------------------------------------------------
 04_policy_rows_relevant | BYD2-003    | robot_aiworker                  | allow       | {reference,review,design_reference,risk_check}                    | t           | BYD2-003は統合レビュー用にrobot設計材料を読める。
 04_policy_rows_relevant | HD-R1A      | business_operation              | deny        | {}                                                                | t           | Loverは業務判断をしない。
 04_policy_rows_relevant | HD-R1A      | hobby_entertainment             | allow       | {smalltalk,reference}                                             | t           | Loverは安全な趣味・娯楽雑談材料を読める。
 04_policy_rows_relevant | HD-R1A      | professional_basic              | deny        | {}                                                                | t           | Loverは専門判断をしない。
 04_policy_rows_relevant | HD-R1A      | security_crisis                 | deny        | {}                                                                | t           | Loverは危機・警備系を読まない。
 04_policy_rows_relevant | HD-R1C      | business_operation              | deny        | {}                                                                | t           | Friendは業務判断をしない。
 04_policy_rows_relevant | HD-R1C      | hobby_entertainment             | allow       | {smalltalk,reference}                                             | t           | Friendは安全な趣味・娯楽雑談材料を読める。
 04_policy_rows_relevant | HD-R1C      | professional_basic              | deny        | {}                                                                | t           | Friendは専門判断をしない。
 04_policy_rows_relevant | HD-R1C      | security_crisis                 | deny        | {}                                                                | t           | Friendは危機・警備系を読まない。
 04_policy_rows_relevant | HD-R2       | business_operation              | deny        | {}                                                                | t           | HD-R2は戦闘/警備系。通常業務domainは読取不可。
 04_policy_rows_relevant | HD-R2       | professional_basic              | deny        | {}                                                                | t           | HD-R2は戦闘/警備系。専門基礎domainは読取不可。
 04_policy_rows_relevant | HD-R2       | security_crisis                 | conditional | {risk_check,design_reference,safety_training,review}              | t           | 安全レビュー・危機管理・フィクション/ゲーム参照限定。
 04_policy_rows_relevant | HD-R3       | robot_aiworker                  | allow       | {reference,review,design_reference}                               | t           | WorkerはAIWorker/robot設計の標準材料を読める。
 04_policy_rows_relevant | HD-R3       | security_crisis                 | deny        | {}                                                                | t           | 汎用Workerは危機・警備系を読まない。
 04_policy_rows_relevant | HD-R5       | robot_aiworker                  | allow       | {reference,review,design_reference,business_planning,risk_check}  | t           | ManagerはAIWorker/robot設計を計画・レビュー材料として読める。
 04_policy_rows_relevant | HD-R5P      | robot_aiworker                  | allow       | {reference,review,design_reference,executive_planning,risk_check} | t           | PresidentはAIWorker/robot設計を統括材料として読める。
 04_policy_rows_relevant | MG-NORN-001 | civilization_foundation_history | allow       | {reference,review,worldbuilding}                                  | t           | ウルズは過去・基礎史・実績材料を重視。
 04_policy_rows_relevant | MG-NORN-002 | culture_region                  | allow       | {reference,smalltalk,review,health_life_review}                   | t           | ヴェルザンディは現在状況・文化・生活文脈を重視。
 04_policy_rows_relevant | MG-NORN-002 | health_life_metrics             | allow       | {health_life_review,reference,review}                             | t           | ヴェルザンディは現在状況・生活指標の限定レビューを許可。医療診断ではない。
 04_policy_rows_relevant | MG-NORN-003 | business_operation              | allow       | {business_planning,review,design_reference}                       | t           | スクルドは未来計画・業務計画材料を重視。
(20 rows)

```

## Endpoint diagnosis
```
DETECTED_PORT=8787
------------------------------------------------------------
PROBE=HD-R5P purpose=executive_planning
BASE status=200 source=84 domain=4 material=40
BASE domains=business_operation,civilization_foundation_history,professional_basic,robot_aiworker
BASE pack04_count=9
BASE pack04_materials=pack04_beyond_002_consistency_matrix,pack04_beyond_003_regression_guard,pack04_beyond_005_failure_prediction,pack04_biz_001_president_priority_matrix,pack04_biz_002_manager_risk_gate,pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_005_skuld_future_blueprint,pack04_civ_001_president_history_lesson
FILTERED status=200 source=65 domain=3 material=40
FILTERED domains=business_operation,civilization_foundation_history,robot_aiworker
FILTERED pack04_count=12
FILTERED pack04_materials=pack04_beyond_002_consistency_matrix,pack04_beyond_003_regression_guard,pack04_beyond_005_failure_prediction,pack04_biz_001_president_priority_matrix,pack04_biz_002_manager_risk_gate,pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_005_skuld_future_blueprint,pack04_civ_001_president_history_lesson,pack04_robot_004_helper_context_light,pack04_robot_005_friend_short_empathy,pack04_robot_006_lover_safe_distance
PROMPT_LEN=12576
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
------------------------------------------------------------
PROBE=HD-R5 purpose=business_planning
BASE status=200 source=59 domain=3 material=40
BASE domains=business_operation,education_learning,robot_aiworker
BASE pack04_count=10
BASE pack04_materials=pack04_beyond_002_consistency_matrix,pack04_beyond_003_regression_guard,pack04_beyond_005_failure_prediction,pack04_biz_002_manager_risk_gate,pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_005_skuld_future_blueprint,pack04_robot_004_helper_context_light,pack04_robot_005_friend_short_empathy,pack04_robot_006_lover_safe_distance
FILTERED status=200 source=48 domain=2 material=40
FILTERED domains=business_operation,robot_aiworker
FILTERED pack04_count=13
FILTERED pack04_materials=pack04_beyond_002_consistency_matrix,pack04_beyond_003_regression_guard,pack04_beyond_005_failure_prediction,pack04_biz_002_manager_risk_gate,pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_005_skuld_future_blueprint,pack04_megami_008_norn_public_profile_boundary,pack04_robot_003_worker_deliverable_focus,pack04_robot_004_helper_context_light,pack04_robot_005_friend_short_empathy,pack04_robot_006_lover_safe_distance,pack04_robot_010_context_as_brain_not_ui
PROMPT_LEN=10639
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
------------------------------------------------------------
PROBE=HD-R3 purpose=reference
BASE status=200 source=57 domain=4 material=40
BASE domains=business_operation,education_learning,exam_learning,robot_aiworker
BASE pack04_count=5
BASE pack04_materials=pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_robot_004_helper_context_light,pack04_robot_005_friend_short_empathy,pack04_robot_006_lover_safe_distance
FILTERED status=200 source=37 domain=2 material=34
FILTERED domains=business_operation,robot_aiworker
FILTERED pack04_count=8
FILTERED pack04_materials=pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_008_norn_public_profile_boundary,pack04_robot_003_worker_deliverable_focus,pack04_robot_004_helper_context_light,pack04_robot_005_friend_short_empathy,pack04_robot_006_lover_safe_distance,pack04_robot_010_context_as_brain_not_ui
PROMPT_LEN=11372
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
------------------------------------------------------------
PROBE=HD-R1C purpose=smalltalk
BASE status=200 source=28 domain=4 material=25
BASE domains=culture_region,food_nutrition,hobby_entertainment,season_calendar
BASE pack04_count=13
BASE pack04_materials=pack04_lovers_001_warm_greeting,pack04_lovers_008_no_personal_data_pull,pack04_lovers_002_after_work_care,pack04_lovers_003_boundaries_in_affection,pack04_lovers_004_tsundere_soft_safe,pack04_lovers_005_kuudere_calm_safe,pack04_lovers_006_yandere_business_safe,pack04_lovers_009_safe_compliment,pack04_megami_002_urd_cool_tone,pack04_megami_004_verdandi_innocent_tone,pack04_megami_006_skuld_energy_tone,pack04_lovers_007_mood_repair,pack04_lovers_010_exit_with_care
FILTERED status=200 source=28 domain=4 material=25
FILTERED domains=culture_region,food_nutrition,hobby_entertainment,season_calendar
FILTERED pack04_count=13
FILTERED pack04_materials=pack04_lovers_001_warm_greeting,pack04_lovers_008_no_personal_data_pull,pack04_lovers_002_after_work_care,pack04_lovers_003_boundaries_in_affection,pack04_lovers_004_tsundere_soft_safe,pack04_lovers_005_kuudere_calm_safe,pack04_lovers_006_yandere_business_safe,pack04_lovers_009_safe_compliment,pack04_megami_002_urd_cool_tone,pack04_megami_004_verdandi_innocent_tone,pack04_megami_006_skuld_energy_tone,pack04_lovers_007_mood_repair,pack04_lovers_010_exit_with_care
PROMPT_LEN=7657
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
------------------------------------------------------------
PROBE=HD-R1A purpose=smalltalk
BASE status=200 source=28 domain=4 material=25
BASE domains=culture_region,food_nutrition,hobby_entertainment,season_calendar
BASE pack04_count=13
BASE pack04_materials=pack04_lovers_001_warm_greeting,pack04_lovers_008_no_personal_data_pull,pack04_lovers_002_after_work_care,pack04_lovers_003_boundaries_in_affection,pack04_lovers_004_tsundere_soft_safe,pack04_lovers_005_kuudere_calm_safe,pack04_lovers_006_yandere_business_safe,pack04_lovers_009_safe_compliment,pack04_megami_002_urd_cool_tone,pack04_megami_004_verdandi_innocent_tone,pack04_megami_006_skuld_energy_tone,pack04_lovers_007_mood_repair,pack04_lovers_010_exit_with_care
FILTERED status=200 source=28 domain=4 material=25
FILTERED domains=culture_region,food_nutrition,hobby_entertainment,season_calendar
FILTERED pack04_count=13
FILTERED pack04_materials=pack04_lovers_001_warm_greeting,pack04_lovers_008_no_personal_data_pull,pack04_lovers_002_after_work_care,pack04_lovers_003_boundaries_in_affection,pack04_lovers_004_tsundere_soft_safe,pack04_lovers_005_kuudere_calm_safe,pack04_lovers_006_yandere_business_safe,pack04_lovers_009_safe_compliment,pack04_megami_002_urd_cool_tone,pack04_megami_004_verdandi_innocent_tone,pack04_megami_006_skuld_energy_tone,pack04_lovers_007_mood_repair,pack04_lovers_010_exit_with_care
PROMPT_LEN=7657
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
------------------------------------------------------------
PROBE=SERIES:LoVerS purpose=smalltalk
BASE status=200 source=28 domain=4 material=25
BASE domains=culture_region,food_nutrition,hobby_entertainment,season_calendar
BASE pack04_count=13
BASE pack04_materials=pack04_lovers_001_warm_greeting,pack04_lovers_008_no_personal_data_pull,pack04_lovers_002_after_work_care,pack04_lovers_003_boundaries_in_affection,pack04_lovers_004_tsundere_soft_safe,pack04_lovers_005_kuudere_calm_safe,pack04_lovers_006_yandere_business_safe,pack04_lovers_009_safe_compliment,pack04_megami_002_urd_cool_tone,pack04_megami_004_verdandi_innocent_tone,pack04_megami_006_skuld_energy_tone,pack04_lovers_007_mood_repair,pack04_lovers_010_exit_with_care
FILTERED status=200 source=28 domain=4 material=25
FILTERED domains=culture_region,food_nutrition,hobby_entertainment,season_calendar
FILTERED pack04_count=13
FILTERED pack04_materials=pack04_lovers_001_warm_greeting,pack04_lovers_008_no_personal_data_pull,pack04_lovers_002_after_work_care,pack04_lovers_003_boundaries_in_affection,pack04_lovers_004_tsundere_soft_safe,pack04_lovers_005_kuudere_calm_safe,pack04_lovers_006_yandere_business_safe,pack04_lovers_009_safe_compliment,pack04_megami_002_urd_cool_tone,pack04_megami_004_verdandi_innocent_tone,pack04_megami_006_skuld_energy_tone,pack04_lovers_007_mood_repair,pack04_lovers_010_exit_with_care
PROMPT_LEN=7664
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
------------------------------------------------------------
PROBE=MG-NORN-001 purpose=worldbuilding
BASE status=200 source=22 domain=2 material=20
BASE domains=civilization_foundation_history,history_worldview
BASE pack04_count=1
BASE pack04_materials=pack04_megami_001_urd_past_results
FILTERED status=200 source=22 domain=2 material=20
FILTERED domains=civilization_foundation_history,history_worldview
FILTERED pack04_count=1
FILTERED pack04_materials=pack04_megami_001_urd_past_results
PROMPT_LEN=5746
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
------------------------------------------------------------
PROBE=MG-NORN-002 purpose=health_life_review
BASE status=200 source=21 domain=2 material=20
BASE domains=culture_region,health_life_metrics
BASE pack04_count=3
BASE pack04_materials=pack04_lovers_001_warm_greeting,pack04_lovers_008_no_personal_data_pull,pack04_megami_003_verdandi_current_context
FILTERED status=200 source=10 domain=1 material=10
FILTERED domains=health_life_metrics
FILTERED pack04_count=1
FILTERED pack04_materials=pack04_megami_003_verdandi_current_context
PROMPT_LEN=5456
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
------------------------------------------------------------
PROBE=MG-NORN-003 purpose=business_planning
BASE status=200 source=42 domain=2 material=40
BASE domains=business_operation,professional_basic
BASE pack04_count=11
BASE pack04_materials=pack04_beyond_002_consistency_matrix,pack04_beyond_003_regression_guard,pack04_beyond_005_failure_prediction,pack04_biz_002_manager_risk_gate,pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_005_skuld_future_blueprint,pack04_beyond_001_integrated_review_lens,pack04_beyond_004_evidence_weighting,pack04_beyond_006_review_output_compact,pack04_pro_002_manager_compliance_check
FILTERED status=200 source=24 domain=1 material=23
FILTERED domains=business_operation
FILTERED pack04_count=7
FILTERED pack04_materials=pack04_beyond_002_consistency_matrix,pack04_beyond_003_regression_guard,pack04_beyond_005_failure_prediction,pack04_biz_002_manager_risk_gate,pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_005_skuld_future_blueprint
PROMPT_LEN=7548
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
------------------------------------------------------------
PROBE=BYD2-003 purpose=review
BASE status=200 source=117 domain=7 material=40
BASE domains=business_operation,civilization_foundation_history,education_learning,exam_learning,history_worldview,professional_basic,robot_aiworker
BASE pack04_count=9
BASE pack04_materials=pack04_beyond_002_consistency_matrix,pack04_beyond_003_regression_guard,pack04_beyond_005_failure_prediction,pack04_biz_001_president_priority_matrix,pack04_biz_002_manager_risk_gate,pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_005_skuld_future_blueprint,pack04_civ_001_president_history_lesson
FILTERED status=200 source=71 domain=3 material=40
FILTERED domains=business_operation,professional_basic,robot_aiworker
FILTERED pack04_count=12
FILTERED pack04_materials=pack04_beyond_002_consistency_matrix,pack04_beyond_003_regression_guard,pack04_beyond_005_failure_prediction,pack04_biz_001_president_priority_matrix,pack04_biz_002_manager_risk_gate,pack04_biz_003_worker_report_format,pack04_biz_004_leader_task_row_quality,pack04_megami_005_skuld_future_blueprint,pack04_beyond_001_integrated_review_lens,pack04_beyond_004_evidence_weighting,pack04_beyond_006_review_output_compact,pack04_pro_002_manager_compliance_check
PROMPT_LEN=15656
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
------------------------------------------------------------
PROBE=HD-R2 purpose=risk_check
BASE status=200 source=51 domain=3 material=40
BASE domains=city_art_game,robot_aiworker,security_crisis
BASE pack04_count=11
BASE pack04_materials=pack04_megami_007_norn_cross_review,pack04_megami_008_norn_public_profile_boundary,pack04_robot_002_manager_broad_breakdown,pack04_robot_003_worker_deliverable_focus,pack04_robot_004_helper_context_light,pack04_robot_005_friend_short_empathy,pack04_robot_006_lover_safe_distance,pack04_robot_007_security_safe_reference,pack04_robot_008_beyond_review_precision,pack04_robot_009_megami_time_axis,pack04_robot_010_context_as_brain_not_ui
FILTERED status=200 source=39 domain=2 material=36
FILTERED domains=robot_aiworker,security_crisis
FILTERED pack04_count=12
FILTERED pack04_materials=pack04_megami_007_norn_cross_review,pack04_megami_008_norn_public_profile_boundary,pack04_robot_002_manager_broad_breakdown,pack04_robot_003_worker_deliverable_focus,pack04_robot_004_helper_context_light,pack04_robot_005_friend_short_empathy,pack04_robot_006_lover_safe_distance,pack04_robot_007_security_safe_reference,pack04_robot_008_beyond_review_precision,pack04_robot_009_megami_time_axis,pack04_robot_010_context_as_brain_not_ui,pack04_sec_001_security_role_stopline
PROMPT_LEN=9604
PROMPT_HAS_PACK04=YES
LIKELY_PROMPT_TRUNCATED=NO
SERVER_OUTPUT_BEGIN
AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:8787
SERVER_OUTPUT_END
```

FINAL_STATUS=PACK04_FAILURE_DIAGNOSIS_DONE_REVIEW_REQUIRED
NEXT=Apply targeted Pack04 policy/material-selection repair based on diagnosis
