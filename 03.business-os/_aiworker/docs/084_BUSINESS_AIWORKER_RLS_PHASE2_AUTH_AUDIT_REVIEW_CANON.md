# BusinessOS AIWorker RLS Phase2 Auth/Audit Lock-down Review Canon

## Purpose
Prepare RLS Phase2 for API client and audit log protection.

## Phase2 target candidates
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log

## Why separate from Phase1
These tables are used by API auth/audit functions:
- business.fn_aicm_aiworker_api_auth_check
- business.fn_aicm_aiworker_api_audit_write

Both were observed as SECURITY INVOKER in earlier inventory.
If RLS is enabled on these tables without changing execution strategy, API auth/audit may break.

## Review decision required
佐藤(DB担当) must choose one strategy:

### Strategy A: SECURITY DEFINER controlled functions
- Change auth/audit functions to SECURITY DEFINER
- Set search_path explicitly
- Enable RLS on api_client/audit_log
- Lock down public select/update/delete
- Let controlled functions operate as intended

### Strategy B: execution role based policies
- Keep functions SECURITY INVOKER
- Create RLS policies that allow only the API execution role
- Requires final DB role / Supabase auth role design

## Recommended
Strategy A is likely safer for the local Node API design, but must be reviewed carefully.

## Not in Phase2
Do not enable RLS on:
- business.company_robot_entitlement
- business.company_robot_placement

Reason:
- company identity strategy is still separate.
