# B6R96R1H6_R1 Fix Package Code No Apply Report

## Scope
- Fix package_code FK violation in HD-R2 policy overlay SQL
- DB write: NO
- SQL apply: NO
- API POST: NO
- delete: NO
- git push: NO

## Source
- SOURCE_SQL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_061234_b6r96r1h6_apply_hd_r2_policy_overlay_go/010_source_hd_r2_policy_overlay_copy.sql
- FAILED_H6_RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_061234_b6r96r1h6_apply_hd_r2_policy_overlay_go
- FAILED_ERR_COPY=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_073521_b6r96r1h6_r1_fix_package_code_no_apply/001_failed_h6_apply_err_copy.txt

## Generated
- FK_JSONL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_073521_b6r96r1h6_r1_fix_package_code_no_apply/011_package_fk_discovery_readonly.jsonl
- VALUE_JSONL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_073521_b6r96r1h6_r1_fix_package_code_no_apply/022_package_value_dump_readonly.jsonl
- CORRECTED_SQL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_073521_b6r96r1h6_r1_fix_package_code_no_apply/040_hd_r2_policy_overlay_PACKAGE_FIXED_NOT_APPLIED.sql
- DECISION_MD=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_073521_b6r96r1h6_r1_fix_package_code_no_apply/050_package_code_fix_decision.md
- SATO_REVIEW=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_073521_b6r96r1h6_r1_fix_package_code_no_apply/060_sato_review_package_code_fix.md
- REMAINING_BAD=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_073521_b6r96r1h6_r1_fix_package_code_no_apply/070_remaining_aiworker_runtime_package_code.txt

## Counts
- PASS_COUNT=19
- WARN_COUNT=0
- FAIL_COUNT=0

## Final
FINAL_STATUS=PASS_PACKAGE_CODE_FIX_CREATED_NO_APPLY
REPORT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_073521_b6r96r1h6_r1_fix_package_code_no_apply/000_B6R96R1H6_R1_FIX_PACKAGE_CODE_NO_APPLY_REPORT.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_073521_b6r96r1h6_r1_fix_package_code_no_apply

## Next
- If PASS_PACKAGE_CODE_FIX_CREATED_NO_APPLY: apply corrected SQL only after explicit GO.
