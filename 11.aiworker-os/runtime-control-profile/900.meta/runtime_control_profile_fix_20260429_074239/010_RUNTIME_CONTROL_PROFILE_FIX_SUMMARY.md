# AIWORKER RUNTIME CONTROL PROFILE FIX SUMMARY

## Fixed

The previous block failed because model_runtime_control_override did not include:

- operation_mode_code

This block adds operation_mode_code and rebuilds:

- aiworker.vw_app_aiworker_runtime_control_profile_v1
- aiworker.vw_app_aiworker_runtime_control_prompt_fragment_v1

## Main runtime view

- aiworker.vw_app_aiworker_runtime_control_profile_v1

## Safety

Default hard blocks remain:

- external execution: false
- PG apply: false
- destructive action: false

## Report

- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-control-profile/900.meta/runtime_control_profile_fix_20260429_074239/000_runtime_control_profile_fix_report.txt
