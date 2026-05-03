# AICompanyManager R8Z-A leader auto decomposition route + rollback smoke

## Scope
- server route implementation: YES
- core integration: NO
- api post execution: NO
- db write: ROLLBACK_ONLY
- persistent db write: NO
- physical delete: NO
- Sato DB review: REQUIRED

## Target
Implement server-side route and function for automatic Leader decomposition using existing PMLW tables.

Route:
- POST /api/aicm/v2/leader-auto-decomposition/run

Tables:
- business.aicm_manager_major_work_item
- business.aicm_leader_middle_work_item
- business.aicm_leader_deliverable_requirement
- business.aicm_worker_work_unit

This step does not call the new API route.
Rollback smoke uses direct psql BEGIN/ROLLBACK only.
