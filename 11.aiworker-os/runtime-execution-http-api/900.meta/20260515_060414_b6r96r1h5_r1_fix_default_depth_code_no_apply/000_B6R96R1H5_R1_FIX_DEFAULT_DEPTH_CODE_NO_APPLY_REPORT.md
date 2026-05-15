# B6R96R1H5_R1 Fix Default Depth Code No Apply Report

## Scope
- Fix default_depth_code FK violation in FK-target brain domain seed SQL
- DB write: NO
- SQL apply: NO
- API POST: NO
- delete: NO
- git push: NO

## Source
- SOURCE_SQL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060205_b6r96r1h5_apply_fk_target_brain_domain_seed_go/010_source_fk_target_brain_domain_seed_copy.sql
- FAILED_H5_RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060205_b6r96r1h5_apply_fk_target_brain_domain_seed_go
- FAILED_ERR_COPY=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/001_failed_h5_apply_err_copy.txt

## Generated
- FK_JSONL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/011_depth_fk_discovery_readonly.jsonl
- VALUE_JSONL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/022_depth_value_dump_readonly.jsonl
- CORRECTED_SQL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/040_fk_target_brain_domain_seed_DEPTH_FIXED_NOT_APPLIED.sql
- DECISION_MD=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/050_depth_fix_decision.md
- SATO_REVIEW=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/060_sato_review_depth_fix.md
- REMAINING_BAD=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/070_remaining_generated_default_depth_code.txt

## Counts
- PASS_COUNT=18
- WARN_COUNT=0
- FAIL_COUNT=0

## Final
FINAL_STATUS=PASS_DEFAULT_DEPTH_CODE_FIX_CREATED_NO_APPLY
REPORT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/000_B6R96R1H5_R1_FIX_DEFAULT_DEPTH_CODE_NO_APPLY_REPORT.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply

## Next
- If PASS_DEFAULT_DEPTH_CODE_FIX_CREATED_NO_APPLY: apply corrected SQL only after explicit GO.
