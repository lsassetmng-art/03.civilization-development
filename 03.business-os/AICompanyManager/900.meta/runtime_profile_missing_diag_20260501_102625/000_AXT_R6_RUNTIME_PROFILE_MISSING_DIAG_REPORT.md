# AICompanyManager Phase AXT-R6 runtime profile missing diagnostic

## Result
- FINAL_STATUS=RUNTIME_PROFILE_MISSING_DIAG_DONE_REVIEW_REQUIRED
- DIAGNOSIS=EXACT_RUNTIME_PROFILE_COMBO_MISSING
- TARGET_APP_SURFACE=ai_company_manager_worker_execution
- TARGET_MODEL_CODE=MG-NORN-001
- PASS_COUNT=9
- WARN_COUNT=1
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO
- 佐藤(DB担当)レビュー: read-only diagnostic

## Current interpretation
The AI Execution Workbench reached AIWorkerOS DB function.
The current error means Runtime Control Profile cannot be resolved for:
- app_surface_code=ai_company_manager_worker_execution
- model_code=MG-NORN-001

Do not add data blindly.
First confirm whether:
1. model_code should be MG-NORN-001, or a canonical code like mg_norn_001_urd.
2. app_surface_code should be ai_company_manager_worker_execution, or an existing supported surface.
3. the profile view is missing rows for AICompanyManager surfaces.

## Files
- REGCLASS_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_profile_missing_diag_20260501_102625/010_regclass_check.tsv
- COLUMN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_profile_missing_diag_20260501_102625/020_view_columns.tsv
- RUNTIME_EXACT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_profile_missing_diag_20260501_102625/030_runtime_profile_exact_combo.tsv
- RUNTIME_CANDIDATES_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_profile_missing_diag_20260501_102625/040_runtime_profile_candidates.tsv
- ROBOT_SELECTION_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_profile_missing_diag_20260501_102625/050_robot_selection_card_match.tsv
- VIEWDEF_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_profile_missing_diag_20260501_102625/060_runtime_profile_viewdef.sql
- SERVER_SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_profile_missing_diag_20260501_102625/070_server_worker_runtime_scan.txt
- CORE_SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_profile_missing_diag_20260501_102625/080_core_workbench_model_scan.txt

## Next likely fix
If the exact combo is missing:
- Prefer registering Runtime Control Profiles for ai_company_manager_worker_execution for selectable BusinessOS Worker models.
- If an equivalent profile already exists under another model_code, fix model_code normalization instead.
