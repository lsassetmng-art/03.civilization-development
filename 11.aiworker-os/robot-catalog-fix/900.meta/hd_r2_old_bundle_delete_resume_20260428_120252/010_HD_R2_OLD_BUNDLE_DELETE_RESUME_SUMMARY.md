# HD-R2 OLD BUNDLE DELETE RESUME SUMMARY

## Completed

Resumed physical delete without temp-table verification.

Deleted old bundles from active catalog storage:

- hd_r2_butler
- hd_r2_fighter

Retained canonical bundle:

- hd_r2_battler
- HD-R2 / Battler / 戦闘員

## Fixed previous error

Previous error:

- tmp_hd_r2_old_ref_before did not exist after COMMIT

Cause:

- temporary table was created with ON COMMIT DROP

This resume block uses persistent audit log rows and direct verification queries.

## DB

Updated or checked:

- aiworker.worker_model_catalog
- aiworker.model_public_registry
- aiworker.model_service_assignment and other model_code reference tables, if present
- aiworker.robot_catalog_cleanup_audit_log
- aiworker.robot_model_code_deprecation_map, if present

## Design append

- /data/data/com.termux/files/home/01.civilization-system/11.aiworker-os/030.model/030_AIWORKER_HD_R2_OLD_BUNDLE_PHYSICAL_DELETE_APPEND.md
- /data/data/com.termux/files/home/01.civilization-system/11.aiworker-os/060.integration/060_AIWORKER_HD_R2_OLD_BUNDLE_PHYSICAL_DELETE_REFERENCE_SURFACE_APPEND.md
- /data/data/com.termux/files/home/01.civilization-system/11.aiworker-os/080.policy/080_AIWORKER_HD_R2_OLD_BUNDLE_PHYSICAL_DELETE_POLICY_APPEND.md

## Report

- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/robot-catalog-fix/900.meta/hd_r2_old_bundle_delete_resume_20260428_120252/000_hd_r2_old_bundle_delete_resume_report.txt
