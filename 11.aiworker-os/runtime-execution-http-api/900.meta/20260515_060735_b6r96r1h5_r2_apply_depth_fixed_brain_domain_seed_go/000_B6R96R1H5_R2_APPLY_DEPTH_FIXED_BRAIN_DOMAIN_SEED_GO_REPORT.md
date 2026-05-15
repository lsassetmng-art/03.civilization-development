# B6R96R1H5_R2 Apply Depth Fixed Brain Domain Seed GO Report

## Scope
- Apply depth-fixed FK-target brain domain seed for six HD-R2 safe domains
- DB write: YES
- SQL apply: YES
- API POST: NO
- delete: NO
- git push: NO

## Source
- SOURCE_SQL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/040_fk_target_brain_domain_seed_DEPTH_FIXED_NOT_APPLIED.sql
- SOURCE_DECISION=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/050_depth_fix_decision.md
- SOURCE_SATO=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060414_b6r96r1h5_r1_fix_default_depth_code_no_apply/060_sato_review_depth_fix.md

## Target domains
- security_crisis_response
- fictional_combat_design
- game_tactical_balance
- defense_planning_non_harmful
- threat_modeling_safe
- combat_lore_reference

## Evidence
- SOURCE_SQL_COPY=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go/010_source_depth_fixed_brain_domain_seed_copy.sql
- PRECHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go/021_precheck_fk_target_readonly.out
- APPLY_OUT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go/031_apply.out
- APPLY_ERR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go/031_apply.err
- VERIFY_SQL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go/041_verify_readonly.sql
- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go/042_verify_readonly.out
- BOOL_JSON=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go/050_verify_bool.json
- OVERLAY_SQL_COPY=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go/014_overlay_sql_for_next_step_copy_NOT_APPLIED.sql
- SECRET_HITS=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go/999_secret_scan_hits.txt

## Counts
- PASS_COUNT=30
- WARN_COUNT=0
- FAIL_COUNT=0

## Final
FINAL_STATUS=PASS_APPLIED_DEPTH_FIXED_BRAIN_DOMAIN_SEED_B6R96R1H5_R2
REPORT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go/000_B6R96R1H5_R2_APPLY_DEPTH_FIXED_BRAIN_DOMAIN_SEED_GO_REPORT.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260515_060735_b6r96r1h5_r2_apply_depth_fixed_brain_domain_seed_go

## Next
- B6R96R1H6: retry HD-R2 policy overlay apply.
- git push only if explicitly requested.
