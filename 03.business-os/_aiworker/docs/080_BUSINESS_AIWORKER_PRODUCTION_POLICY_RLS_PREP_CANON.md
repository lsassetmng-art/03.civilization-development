# BusinessOS AIWorker Production Policy / RLS Prep Canon

## Purpose
Prepare production policy and RLS hardening for AICompanyManager x BusinessOS AIWorker.

## Important
This prep does not enable RLS and does not apply policies.

## Canonical target tables
BusinessOS / business schema:
- business.robot_placement_role_catalog
- business.robot_pool
- business.company_robot_entitlement
- business.company_robot_placement
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log

AIWorkerOS / aiworker schema:
- aiworker.robot_series_behavior_profile
- aiworker.robot_model_personality_profile
- aiworker.robot_model_public_profile

CX22073JW / cx22073jw schema:
- reference views only
- no production write authority

## Hardening principles
- API client table must not expose token hashes to ordinary app users.
- Audit log should be insert-only from controlled API path.
- Placement writes must go through controlled functions/API.
- CX22073JW reference views are read-only.
- Robot role/personality/public profile reference data must not decide placement authority.
- RLS application requires DB reviewer approval.
