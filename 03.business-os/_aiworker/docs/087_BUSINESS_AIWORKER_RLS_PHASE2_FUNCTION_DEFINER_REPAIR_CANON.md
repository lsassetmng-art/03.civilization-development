# BusinessOS AIWorker RLS Phase2 Function Definer Repair Canon

## Purpose
Repair the remaining Phase2 closeout issue by applying SECURITY DEFINER to auth/audit functions using actual database signatures.

## Background
Phase2 closeout showed:
- RLS enabled on API client table
- RLS enabled on audit log table
- no-public policies created
- API smoke passed
- invalid token denial passed
- combined rollback-smoke passed
- no-persist passed

Only remaining issue:
- auth/audit functions were still detected as SECURITY INVOKER or not matched by exact signature verification.

## Repair method
Use pg_proc actual function signatures:
- business.fn_aicm_aiworker_api_auth_check
- business.fn_aicm_aiworker_api_audit_write

Then execute dynamic ALTER FUNCTION:
- SECURITY DEFINER
- SET search_path = business, aiworker, cx22073jw, public, pg_temp

## Safety
If API smoke fails after the repair, revert functions to SECURITY INVOKER and reset search_path.
