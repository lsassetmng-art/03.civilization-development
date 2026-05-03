# AICompanyManager UI company-state keep/stop plan

generated_at: 2026-04-30 05:35:09 +0900

## Rule

Do not fix current-company drift by adding more JS.

The UI must have one owner:

- phase-de-dh-workflow-final-local-ui.js
- app.selectedCompanyId
- app.selectedCompanyContext

## Keep candidates

Keep only scripts that are not trying to own current company state.

Usually keep:

- phase-de-dh-workflow-final-local-ui.js
- robot pool / robot reference display scripts if they do not alter company selection
- payload preview scripts if read-only

## Stop candidates

Stop or archive scripts that do any of these:

- override company-select
- create selected company panels
- hydrate AI企業設定 screen
- hide/show company cards
- intercept AI企業設定 / 会社変更 click
- use MutationObserver for company display
- rewrite root/body HTML
- treat edit-company-select as canonical

## Reason

Active patch/guard layers are currently part of the bug. They create:

- click interception
- old company value resurrection
- display:none conflicts
- white screen risk
- unclear execution order

## Next action

Before fixing currentCompany/renderSettings, reduce active company-state ownership to one place.
