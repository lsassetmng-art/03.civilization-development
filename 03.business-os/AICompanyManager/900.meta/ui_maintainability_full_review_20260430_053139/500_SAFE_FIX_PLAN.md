# AICompanyManager safe fix plan

## Phase 1: No-code freeze

- Stop adding external sync/hydrator/overlay scripts.
- Keep current working UI state.
- Only inspect and patch one active generator at a time.

## Phase 2: Localize current company state

Patch only phase-de-dh-workflow-final-local-ui.js, but do not use broad regex replacement.

Manual/local patch targets:

1. currentCompany(data)
   - Use app.selectedCompanyId/app.companyId.
   - Return null or explicit no-company state if missing.
   - Avoid silent companies[0] fallback except startup.

2. renderDashboard(data, company)
   - company-select selected value = app.selectedCompanyId.
   - AI企業を表示 action sets selectedCompanyId.

3. bind()
   - Before data-screen=settings, copy company-select value to app.selectedCompanyId.
   - Do not alter unrelated buttons.

4. renderSettings(data, company)
   - editing = findCompany(data, app.selectedCompanyId) || company.
   - Do not prefer stale app.editCompanyId.
   - edit-company-select can display selected company but is not canonical.

5. handleAction switch-company
   - app.selectedCompanyId = val("company-select")
   - app.companyId = app.selectedCompanyId
   - app.editCompanyId = ""
   - render()

## Phase 3: Verify

- Dashboard company selection changes company overview.
- AI企業設定 shows same company.
- Department/organization lists match selected company.
- No white screen.
- No DB writes.

## Phase 4: Cleanup

- Archive disabled failed patch scripts.
- Remove duplicate company selector patches from index.
- Create one UI state module later if app grows.
