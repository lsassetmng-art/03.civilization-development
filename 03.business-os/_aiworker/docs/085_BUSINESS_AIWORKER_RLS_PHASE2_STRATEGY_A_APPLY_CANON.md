# BusinessOS AIWorker RLS Phase2 Strategy A Apply Canon

## Purpose
Apply Phase2 auth/audit lock-down using Strategy A.

## Strategy A
Use controlled SECURITY DEFINER functions for auth/audit:
- business.fn_aicm_aiworker_api_auth_check
- business.fn_aicm_aiworker_api_audit_write

Then enable RLS on:
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log

## Policy model
API client:
- no public SELECT
- no public INSERT
- no public UPDATE
- no public DELETE

Audit log:
- no public SELECT
- no public UPDATE
- no public DELETE
- no public INSERT policy is created in this phase because writes should go through SECURITY DEFINER audit function.

## Excluded
Do not apply RLS yet to:
- business.company_robot_entitlement
- business.company_robot_placement

Reason:
- company identity strategy is still separate.

## Safety
If smoke fails, run generated revert SQL:
- disable RLS on api client/audit log
- drop Phase2 policies
- restore auth/audit functions to SECURITY INVOKER
