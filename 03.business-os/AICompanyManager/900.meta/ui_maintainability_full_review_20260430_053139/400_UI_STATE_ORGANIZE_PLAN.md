# AICompanyManager UI state organize plan

## Canonical rule

Current company must have only one canonical owner in UI:

- app.selectedCompanyId
- app.selectedCompanyContext

## Responsibility split

### Dashboard

- The only place where the user selects company.
- The only place allowed to trigger company-context read.
- After selection, it sets:
  - app.selectedCompanyId
  - app.selectedCompanyContext
  - app.companyId only as compatibility alias
  - app.editCompanyId only when entering settings/edit mode

### AI企業設定

- Does not read DB.
- Does not infer from DOM.
- Does not fall back to first company.
- Renders from app.selectedCompanyContext.company.

### Department / Organization screens

- Do not read DB.
- Use app.selectedCompanyContext.departments / organizations.

### Payload builders

- Use app.selectedCompanyId.
- Do not read company-select directly except dashboard switch action.

## Things to remove or neutralize later

- edit-company-select as canonical selector.
- load-company-edit as required flow.
- first company fallback in normal navigation.
- broad DOM sync/overlay scripts.
- duplicate getCurrentCompanyId implementations.
