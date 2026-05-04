# CX22073JW / AIWorkerOS Brain Registry Seed Repair Report

RUN_TS=20260503_064318
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_064318_brain_registry_seed_repair_business_professional
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=YES
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Cause
- Previous smoke failed because business_operation / professional_basic registry rows were missing.
- HD-R1C was not actually allowed to read them; deny candidate rows did not exist.

## Repair
- Add business_operation_reference to cx22073jw.brain_data_registry.
- Add professional_basic_reference to cx22073jw.brain_data_registry.
- Re-check AIWorker effective access.


## Apply output
```
BEGIN
INSERT 0 2
COMMIT
```

## Verify output
```
                  check_code                  | result |                                       note                                        
----------------------------------------------+--------+-----------------------------------------------------------------------------------
 compact_context_has_business_for_manager     | PASS   | Compact context includes business_operation for manager/president/reviewer models
 compact_context_has_professional_for_manager | PASS   | Compact context includes professional_basic for manager/reviewer models
 cx_registry_has_business_operation           | PASS   | CX registry has business_operation brain data row
 cx_registry_has_professional_basic           | PASS   | CX registry has professional_basic brain data row
 hd_r1c_denies_business                       | PASS   | HD-R1C must not read business_operation
 hd_r1c_denies_professional                   | PASS   | HD-R1C must not read professional_basic
 hd_r1c_denies_security                       | PASS   | HD-R1C must not read security_crisis
 hd_r2_reads_security_safely                  | PASS   | HD-R2/R2S/R2G can read security_crisis only for safe purposes
 hd_r5_reads_professional                     | PASS   | HD-R5 can read professional_basic
 hd_r5p_reads_business                        | PASS   | HD-R5P can read business_operation
(10 rows)

 section | pass_count | fail_count 
---------+------------+------------
 SUMMARY |         10 |          0
(1 row)

 model_code | role_code | brain_domain_code  | can_read_flag | access_decision_code |                             effective_use_purpose_codes                             
------------+-----------+--------------------+---------------+----------------------+-------------------------------------------------------------------------------------
 BYD2-003   | Manager   | business_operation | t             | allow_role_policy    | {reference,review,business_planning,risk_check,design_reference}
 BYD2-003   | Manager   | professional_basic | t             | allow_role_policy    | {reference,review,risk_check}
 BYD2-003   | Manager   | security_crisis    | f             | deny_no_allow_policy | {reference,review,business_planning,executive_planning,risk_check,design_reference}
 HD-R1C     | Friend    | business_operation | f             | deny_depth           | {}
 HD-R1C     | Friend    | professional_basic | f             | deny_depth           | {}
 HD-R1C     | Friend    | security_crisis    | f             | deny_depth           | {}
 HD-R5      | Manager   | business_operation | t             | allow_role_policy    | {reference,review,business_planning,risk_check,design_reference}
 HD-R5      | Manager   | professional_basic | t             | allow_role_policy    | {reference,review,risk_check}
 HD-R5      | Manager   | security_crisis    | f             | deny_depth           | {reference,review,business_planning,risk_check,design_reference}
 HD-R5P     | President | business_operation | t             | allow_role_policy    | {reference,review,business_planning,executive_planning,risk_check}
 HD-R5P     | President | professional_basic | t             | allow_role_policy    | {reference,review,risk_check,executive_planning}
 HD-R5P     | President | security_crisis    | f             | deny_no_allow_policy | {reference,review,business_planning,executive_planning,risk_check}
(12 rows)

  model_code   | role_code  | brain_domain_code  | readable_source_count | existing_source_count |                                            safety_boundary_preview                                             
---------------+------------+--------------------+-----------------------+-----------------------+----------------------------------------------------------------------------------------------------------------
 BYD2-003      | Manager    | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
 BYD2-003      | Manager    | professional_basic |                     1 |                     1 | 法務・会計・人事などの専門基礎説明・レビュー補助に使う。確定判断は専門家または該当OS/ERPの業務正本で行う。
 HD-R2G        | Specialist | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
 HD-R2S        | Specialist | professional_basic |                     1 |                     1 | 法務・会計・人事などの専門基礎説明・レビュー補助に使う。確定判断は専門家または該当OS/ERPの業務正本で行う。
 HD-R3         | Worker     | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
 HD-R5         | Manager    | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
 HD-R5         | Manager    | professional_basic |                     1 |                     1 | 法務・会計・人事などの専門基礎説明・レビュー補助に使う。確定判断は専門家または該当OS/ERPの業務正本で行う。
 HD-R5P        | President  | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
 HD-R5P        | President  | professional_basic |                     1 |                     1 | 法務・会計・人事などの専門基礎説明・レビュー補助に使う。確定判断は専門家または該当OS/ERPの業務正本で行う。
 MG-NORN-001   | Worker     | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
 MG-NORN-002   | Worker     | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
 MG-NORN-003   | Worker     | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
 MG-NORN-003   | Worker     | professional_basic |                     1 |                     1 | 法務・会計・人事などの専門基礎説明・レビュー補助に使う。確定判断は専門家または該当OS/ERPの業務正本で行う。
 SERIES:Beyond | Worker     | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
 SERIES:Beyond | Worker     | professional_basic |                     1 |                     1 | 法務・会計・人事などの専門基礎説明・レビュー補助に使う。確定判断は専門家または該当OS/ERPの業務正本で行う。
 SERIES:HD     | Worker     | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
 SERIES:MEGAMI | Worker     | business_operation |                     1 |                     1 | 業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。
(17 rows)

```

FINAL_STATUS=SEED_REPAIR_PASS_REVIEW_REQUIRED
NEXT=AIWorker runtime prompt/context builder compact context connection
