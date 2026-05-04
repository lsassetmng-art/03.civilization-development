# BusinessOS AIWorker RLS Phase1 Apply Review Canon

## Purpose
Prepare the first safe RLS apply phase for AICompanyManager x BusinessOS AIWorker.

## Phase1 policy
Phase1 should avoid company-scoped write tables until company identity strategy is fixed.

## Phase1 candidates
Safe/read-oriented candidates:
- business.robot_placement_role_catalog
- business.robot_pool
- aiworker.robot_series_behavior_profile
- aiworker.robot_model_personality_profile
- aiworker.robot_model_public_profile

Lock-down candidates:
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log

## Not Phase1
Do not apply RLS yet to:
- business.company_robot_entitlement
- business.company_robot_placement

Reason:
- These require final company identity / ownership strategy.
- Premature RLS may break grant/place/update/deactivate functions and local API smoke.

## Critical note
All DB write functions are currently SECURITY INVOKER.
If RLS is enabled on write tables later, functions may be affected unless:
- API uses a privileged controlled DB role, or
- functions are reviewed and changed to SECURITY DEFINER safely, or
- policies explicitly allow the intended role/company scope.

## Review owner
佐藤(DB担当) must review before actual apply.
