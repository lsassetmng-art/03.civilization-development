# BusinessOS AIWorker RLS Phase1 Apply Canon

## Purpose
Apply the first safe RLS hardening phase for AICompanyManager x BusinessOS AIWorker.

## Applied tables
Read/catalog/reference only:
- business.robot_placement_role_catalog
- business.robot_pool
- aiworker.robot_series_behavior_profile
- aiworker.robot_model_personality_profile
- aiworker.robot_model_public_profile

## Not applied in Phase1
- business.company_robot_entitlement
- business.company_robot_placement
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log

## Reason
company_robot_entitlement and company_robot_placement require final company identity strategy.
api_client and audit_log require separate auth/audit function review because current functions are SECURITY INVOKER.

## Policy model
Active rows are readable:
- status_code = 'active'

No write policies are created in Phase1.

## Safety
- No delete.
- No data update.
- RLS DDL only.
- Company write tables excluded.
