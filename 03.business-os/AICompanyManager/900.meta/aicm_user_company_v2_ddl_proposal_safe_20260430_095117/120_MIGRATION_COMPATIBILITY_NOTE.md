# Migration compatibility note

## Current state

The current UI has localStorage companies such as:
- Ai System Integrated Corporation
- Helios Dinamix
- ウルフ

The current DB table business.aicm_company contains smoke/test rows.

## Compatibility rule

For now, the UI local company state remains the working source.

The proposed v2 DB tables are future canonical persistence tables.

## Later migration direction

1. Add v2 tables.
2. Add dashboard company list read endpoint.
3. Migrate localStorage company data into aicm_user_company hierarchy.
4. Dashboard AI企業を表示 reads selected user company context once.
5. Other screens reuse selectedCompanyContext.
6. Save API is enabled only after explicit approval.

## Robot catalog rule

Robot candidate catalog is not company-owned.

Current source:
business.vw_ai_company_manager_system_robot_selector_options

Future clearer source name:
business.vw_ai_company_manager_system_robot_catalog_options
