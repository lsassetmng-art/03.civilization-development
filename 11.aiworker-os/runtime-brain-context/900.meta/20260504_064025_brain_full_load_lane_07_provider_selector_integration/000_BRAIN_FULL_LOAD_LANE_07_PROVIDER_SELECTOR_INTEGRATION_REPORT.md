# Brain Full Load Lane 07 Provider Selector Integration Report

RUN_TS=20260504_064025
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064025_brain_full_load_lane_07_provider_selector_integration
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=NO
FILE_PATCH=YES
AICM_TOUCH=NO

## Patched
- PROVIDER=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/src/aiworker-brain-context-provider.mjs

## Backup
- BACKUP_PROVIDER=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064025_brain_full_load_lane_07_provider_selector_integration/aiworker-brain-context-provider.before_lane07.mjs

## Meaning
runtime-brain-context provider now calls:
- aiworker.fn_robot_brain_runtime_material_select_v1

Selector mode:
- two_stage_domain_then_overall_rank
