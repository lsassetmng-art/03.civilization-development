# Company Identity / Entitlement-Placement RLS Review Report

## Result
- RESULT: PASS
- PASS_COUNT: 20
- WARN_COUNT: 2
- FAIL_COUNT: 0

## Completed
- Generated company identity / entitlement-placement RLS review canon.
- Generated review-only SQL draft.
- Inventoried entitlement / placement table shape.
- Confirmed current RLS state.
- Inventoried company-scoped functions.
- Sampled current company data shape.
- Inventoried API company_id usage.
- Verified current write rollback chain still works.
- Confirmed review SQL is rollback-only.

## Key finding
business.company_robot_entitlement and business.company_robot_placement are still intentionally RLS-disabled.

This remains correct until trusted company identity propagation is implemented.

## WARN meaning
WARN on app.current_company_id / set_config means API has not yet implemented DB session company context.
That is expected at this stage.

## Recommended next phase
Implement company context foundation before applying RLS:
1. Add API/client context contract.
2. Add controlled DB helper or session variable convention:
   - app.current_company_id
   - app.current_api_client_id
3. Patch write functions or API SQL execution to set context.
4. Add rollback smoke proving context works.
5. Only then apply entitlement/placement RLS.

## Files
- REVIEW_SQL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/db/025_company_identity_entitlement_placement_rls_REVIEW_DO_NOT_RUN_YET.sql
- CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/docs/089_COMPANY_IDENTITY_ENTITLEMENT_PLACEMENT_RLS_REVIEW_CANON.md
- AICM_CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/119_AICM_COMPANY_IDENTITY_ENTITLEMENT_PLACEMENT_RLS_REVIEW_CANON.md
- REPORT_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053431_aicm_company_identity_entitlement_placement_rls_review/000_COMPANY_IDENTITY_ENTITLEMENT_PLACEMENT_RLS_REVIEW_REPORT.md

## Logs
- LATEST_EVIDENCE_DIRS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053431_aicm_company_identity_entitlement_placement_rls_review/000_latest_evidence_dirs.txt
- TABLE_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053431_aicm_company_identity_entitlement_placement_rls_review/010_entitlement_placement_table_inventory.txt
- FUNCTION_INVENTORY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053431_aicm_company_identity_entitlement_placement_rls_review/020_company_scoped_function_inventory.txt
- DATA_SHAPE_SAMPLE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053431_aicm_company_identity_entitlement_placement_rls_review/030_company_data_shape_sample.txt
- API_COMPANY_ID_USAGE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053431_aicm_company_identity_entitlement_placement_rls_review/040_api_company_id_usage_inventory.txt
- WRITE_ROLLBACK_SMOKE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053431_aicm_company_identity_entitlement_placement_rls_review/050_current_write_rollback_smoke.txt
- REVIEW_SQL_STATIC_CHECK: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053431_aicm_company_identity_entitlement_placement_rls_review/060_review_sql_static_check.txt

## Safety
- DB: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used
- RLS apply: none
- Policy apply: none
- Function change: none
- API/UI change: none
- Persistent write: none
- Delete: none
