# AICompanyManager selected company canon fix plan

generated_at: 2026-04-30 05:38:07 +0900

## Target

Active generator:

/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js

## Canon

app.selectedCompanyId
app.selectedCompanyContext

## Safe implementation sequence

### Step 1

Add selectedCompanyId only inside the active generator.

No external JS.

### Step 2

Dashboard switch-company action:

app.selectedCompanyId = val("company-select")
app.companyId = app.selectedCompanyId
app.editCompanyId = ""
render()

### Step 3

currentCompany(data):

use app.selectedCompanyId
then app.companyId
then startup-only first company fallback

### Step 4

renderSettings(data, company):

editing = findCompany(data, app.selectedCompanyId) || company

Do not prefer stale app.editCompanyId.

### Step 5

AI企業設定 button transition:

Before app.screen = "settings":

app.selectedCompanyId = val("company-select") || app.selectedCompanyId
app.companyId = app.selectedCompanyId
app.editCompanyId = app.selectedCompanyId

### Step 6

Verify:

- Dashboard selected company = company overview
- AI企業設定 company fields = same selected company
- Department list = selected company departments
- Organization list = selected company organizations
- No white screen

## Important

Do not patch with broad regex.
Do not add late-loaded hydrator/context/panel scripts.
Do not touch DB.
