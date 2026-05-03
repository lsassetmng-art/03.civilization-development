# AICompanyManager UI maintainability problem list

generated_at: 2026-04-30 05:31:57 +0900

Scope: UI only. No DB/API/RLS/delete touched.

## Confirmed maintainability risks

### 1. Current company state is fragmented

Current company appears in multiple places:

- app.companyId
- app.editCompanyId
- company-select
- edit-company-select
- sessionStorage AICM_CURRENT_COMPANY_ID
- sessionStorage AICM_PENDING_COMPANY_ID
- localStorage / app-specific keys
- later patch scripts
- payload builders

This causes selected company drift between dashboard, settings, department, and organization screens.

### 2. Duplicate current company helper functions

currentCompany function count: 20
getCurrentCompanyId function count: 27
setCurrentCompany function count: 28

Multiple definitions make the active execution path hard to reason about.

### 3. First-company fallback is dangerous

Any missing selected company can fall back to:

- data.companies[0]
- state.companies[0]

This explains why the UI jumps to the first company.

### 4. editCompanyId is stale-state risk

AI企業設定 uses editCompanyId, so old edit target can override the dashboard-selected company.

### 5. Active patch/guard layers are too many

active patch/guard-like script count: 10

This increases click interception, hidden DOM, and render conflict risk.

### 6. innerHTML / body rewrite risk exists

root/body innerHTML hit count: 34

Large redraws plus late-loaded patches increase white-screen risk.

## Conclusion

This is not a DB bug.
It is UI state ownership and render architecture debt.
