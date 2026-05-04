# BusinessOS AIWorker RLS Phase2 Closeout Verify Canon

## Purpose
Close out RLS Phase2 Strategy A.

## Phase2 expected state
- business.aicm_aiworker_api_client has RLS enabled.
- business.aicm_aiworker_api_audit_log has RLS enabled.
- business.fn_aicm_aiworker_api_auth_check is SECURITY DEFINER.
- business.fn_aicm_aiworker_api_audit_write is SECURITY DEFINER.
- Both functions have explicit search_path.

## Policies expected
API client:
- no public SELECT
- no public INSERT
- no public UPDATE
- no public DELETE

Audit log:
- no public SELECT
- no public UPDATE
- no public DELETE

## Excluded tables
Still not RLS-enabled:
- business.company_robot_entitlement
- business.company_robot_placement

## Verification style
Postgres may normalize policy expressions.
Closeout checks semantics, not exact formatting.
