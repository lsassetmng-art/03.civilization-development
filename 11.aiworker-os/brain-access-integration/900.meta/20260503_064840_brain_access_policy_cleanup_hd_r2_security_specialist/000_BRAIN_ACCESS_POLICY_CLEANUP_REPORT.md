# CX22073JW / AIWorkerOS Brain Access Policy Cleanup Report

RUN_TS=20260503_064840
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-access-integration/900.meta/20260503_064840_brain_access_policy_cleanup_hd_r2_security_specialist
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=YES
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Cleanup
- HD-R2 / HD-R2S / HD-R2G business_operation = deny
- HD-R2 / HD-R2S / HD-R2G professional_basic = deny
- focus_domain_codesからbusiness/professionalを除外
- security_crisisはsafe purpose限定で維持


## Apply output
```
BEGIN
INSERT 0 6
UPDATE 3
COMMIT
```

## Verify output
```
                    check_code                    | result |                                   note                                    
--------------------------------------------------+--------+---------------------------------------------------------------------------
 friend_lover_forbidden_domain_zero               | PASS   | Friend/Lover must not read business/professional/security domains
 hd_r2_family_business_professional_explicit_deny | PASS   | HD-R2/R2S/R2G business/professional rows must be deny_model_policy
 hd_r2_family_focus_domain_clean                  | PASS   | HD-R2/R2S/R2G focus_domain_codes should not include business/professional
 hd_r2_family_no_business_professional_read       | PASS   | HD-R2/R2S/R2G must not read business_operation/professional_basic
 hd_r2_family_security_still_readable_safely      | PASS   | HD-R2/R2S/R2G should still read security_crisis for safe purposes
 high_risk_readable_has_safe_purpose              | PASS   | High-risk readable brain data must be limited to safe purposes
(6 rows)

 section | pass_count | fail_count 
---------+------------+------------
 SUMMARY |          6 |          0
(1 row)

 model_code | role_code  |               focus_domain_codes               
------------+------------+------------------------------------------------
 HD-R2      | Security   | {city_art_game,robot_aiworker,security_crisis}
 HD-R2G     | Specialist | {robot_aiworker,security_crisis}
 HD-R2S     | Specialist | {robot_aiworker,security_crisis}
(3 rows)

 model_code | role_code  | brain_domain_code  | can_read_flag | access_decision_code |             effective_use_purpose_codes              
------------+------------+--------------------+---------------+----------------------+------------------------------------------------------
 HD-R2      | Security   | business_operation | f             | deny_model_policy    | {}
 HD-R2      | Security   | professional_basic | f             | deny_model_policy    | {}
 HD-R2      | Security   | security_crisis    | t             | allow_model_policy   | {risk_check,design_reference,safety_training,review}
 HD-R2G     | Specialist | business_operation | f             | deny_model_policy    | {}
 HD-R2G     | Specialist | professional_basic | f             | deny_model_policy    | {}
 HD-R2G     | Specialist | security_crisis    | t             | allow_model_policy   | {risk_check,design_reference,safety_training,review}
 HD-R2S     | Specialist | business_operation | f             | deny_model_policy    | {}
 HD-R2S     | Specialist | professional_basic | f             | deny_model_policy    | {}
 HD-R2S     | Specialist | security_crisis    | t             | allow_model_policy   | {risk_check,design_reference,safety_training,review}
(9 rows)

        section        | missing_source_count 
-----------------------+----------------------
 SOURCE_MISSING_REVIEW |                    2
(1 row)

         brain_data_code         | brain_domain_code | source_schema_name |  source_object_name  | source_record_code |   source_title_ja    
---------------------------------+-------------------+--------------------+----------------------+--------------------+----------------------
 robot_aiworker_model_reference  | robot_aiworker    | aiworker           | robot_model_catalog  |                    | AIWorker機種参照
 robot_aiworker_series_reference | robot_aiworker    | aiworker           | robot_series_catalog |                    | AIWorkerシリーズ参照
(2 rows)

```

FINAL_STATUS=POLICY_CLEANUP_PASS_SOURCE_REVIEW_REQUIRED
NEXT=Source registry alignment or runtime compact context connection
