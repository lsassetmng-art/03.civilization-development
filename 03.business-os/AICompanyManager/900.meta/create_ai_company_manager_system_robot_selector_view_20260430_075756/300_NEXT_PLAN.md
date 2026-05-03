# Next plan: Phase ALL-ALO

## Current result

Created view:

business.vw_ai_company_manager_system_robot_selector_options

## Next

1. Add/read local UI API endpoint:
   - /api/aicm/ai-company-manager/system-robot-selector-options
2. Endpoint reads:
   - business.vw_ai_company_manager_system_robot_selector_options
3. Patch:
   - assets/js/aicm-businessos-db-robot-pool-wire.js
4. UI should show:
   - BusinessOS DB robot_pool: 接続済
   - President > 0
   - Manager > 0
   - Leader > 0
   - Worker > 0

## Do not do yet

- API save
- placement update
- RLS apply
- delete
- entitlement seed
