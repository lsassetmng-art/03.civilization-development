# B6R96R1C Task Profile Existing Structure Decision Report

## Scope
- AIWorkerOS worker task profile placement decision
- PersonaOS persona task profile placement decision
- Existing structure exact dump
- DB write: NO
- SQL apply: NO
- API POST: NO
- delete: NO
- git push: NO

## Inputs
- Prior audit showed aiworker.worker_domain_proficiency, worker_role_proficiency, business_support_task_domain
- Prior audit showed personaos.persona_parameter_state, persona_parameter_value, growth_axis, growth_core_state, memory_state

## Generated
- DUMP_SQL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_064444_b6r96r1c_task_profile_existing_structure_decision/010_key_table_exact_dump.sql
- DUMP_OUT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_064444_b6r96r1c_task_profile_existing_structure_decision/011_key_table_exact_dump.out
- DECISION_MD=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_064444_b6r96r1c_task_profile_existing_structure_decision/020_placement_decision.md
- NEXT_SQL_PROPOSAL=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_064444_b6r96r1c_task_profile_existing_structure_decision/030_next_apply_design_NOT_APPLIED.md

## Main decision draft
- Do not create a large new robot_worker_task_profile table before checking existing worker_domain_proficiency.
- Use aiworker business_support_task_domain / worker_domain_proficiency / worker_role_proficiency if compatible.
- Use personaos parameter/growth/memory tables for PersonaOS; Persona is not a robot.
- Add military/security task domains separately with strict safety boundaries.
- app_common was not found in audit, so do not introduce app_common in this step.

## Counts
- PASS_COUNT=11
- WARN_COUNT=0
- FAIL_COUNT=0

## Final
FINAL_STATUS=PASS_TASK_PROFILE_EXISTING_STRUCTURE_DECISION_NO_APPLY
REPORT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_064444_b6r96r1c_task_profile_existing_structure_decision/000_B6R96R1C_TASK_PROFILE_EXISTING_STRUCTURE_DECISION_REPORT.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_064444_b6r96r1c_task_profile_existing_structure_decision

## Next
- Review DUMP_OUT key table definitions.
- Create B6R96R1D apply design NOT APPLIED using exact columns.
- Apply only after Sato review and explicit GO.
