# AICompanyManager target architecture

## Production files

Recommended production core:

- assets/js/aicm-core-state.js
- assets/js/aicm-core-api.js
- assets/js/aicm-core-render.js
- assets/js/aicm-core-actions.js
- assets/js/aicm-core-main.js

Or, if keeping one-file style for Termux simplicity:

- assets/js/aicm-production-core.js

## Canonical UI state

Only one object owns current state:

window.AICM_APP_STATE = {
  ownerCivilizationId,
  selectedCompanyId,
  selectedDepartmentId,
  selectedSectionId,
  context: {
    companies,
    departments,
    sections,
    placements,
    robotCatalog
  }
}

## Company hierarchy

BusinessOS user scope:
owner_civilization_id

AICompanyManager app hierarchy:
aicm_user_company
  -> aicm_user_company_department
  -> aicm_user_company_section
  -> aicm_user_company_worker_placement

## Data source rule

Production UI reads:
- GET /api/aicm/v2/context?owner_civilization_id=...

Production UI writes only through exact actions:
- POST /api/aicm/v2/company/create
- POST /api/aicm/v2/department/create
- POST /api/aicm/v2/section/create
- later: POST /api/aicm/v2/placement/create

## No fallback rule

No companies[0] fallback except controlled startup when v2 context has companies.

No old localStorage company as source of truth.

No edit-company-select as canonical selector.

## Server rule

Server must never return raw command output or database URL to browser.

All API errors are public-safe messages.

## Debug rule

Debug screens must be separate files:
- aicm-debug-local-storage.html
- aicm-debug-api.html

Production index must not load debug surfaces.
