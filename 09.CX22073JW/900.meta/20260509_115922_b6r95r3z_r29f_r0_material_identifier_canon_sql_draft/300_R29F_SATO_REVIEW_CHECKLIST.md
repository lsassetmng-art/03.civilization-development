# R29F Sato Review Checklist

## Review target
/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_115922_b6r95r3z_r29f_r0_material_identifier_canon_sql_draft/200_NOT_EXECUTED_r29f_material_identifier_canon_and_view.sql

## Current finding
- Old material model_code is not consistently runtime model_code.
- MATCH_PUBLIC_MODEL_NO rows dominate.
- SERIES:* rows are not robot model rows and must not FK to model_public_registry model rows.
- DB-side canon is required. server.js hardcoded alias is forbidden.

## Proposed design
- Create aiworker.robot_series_identifier_canon.
- Create aiworker.robot_material_model_identifier_canon.
- FK model rows by registry_code -> aiworker.model_public_registry(registry_code).
- FK series rows by series_code -> aiworker.robot_series_identifier_canon(series_code).
- Create aiworker.vw_robot_readable_brain_runtime_material_canon_v1.
- Expose model_code as runtime_model_code.
- Preserve old value as legacy_material_model_code.

## Must check before GO
- No unresolved legacy material model_code.
- SERIES:Beyond / SERIES:HD / SERIES:MEGAMI / SERIES:LoVerS map correctly.
- BYD2-003 resolves to byd2_003_asic_leader3.
- New canonical view returns Taika rows for byd2_003_asic_leader3.
- No CASCADE DROP.
- No old view DROP in this phase.
- No AICM touch.
- server.js switch happens only after DB canonical view verification.
