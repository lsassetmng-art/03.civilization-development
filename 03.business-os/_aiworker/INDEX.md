# BusinessOS AIWorker Module INDEX

## Purpose
BusinessOS AIWorker module manages Business-side availability, company entitlements, and placement records for AIWorkerOS robot models.

## Canonical boundary
- AIWorkerOS owns robot model, series, personality, manufacturer, safety boundary, and machine canon.
- BusinessOS owns business robot pool, company entitlement, contract-facing availability, and placement into Business apps such as AICompanyManager.

## Main files
- OVERVIEW.md
- docs/010_BUSINESS_AIWORKER_CANON.md
- db/001_business_aiworker_robot_pool_foundation.sql
- assets/js/business-aiworker-pool-core.js
- tests/node_smoke_business_aiworker_pool_core.js
