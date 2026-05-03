# Robot selector source exact diagnosis decision

generated_at: 2026-04-30 07:45:18 +0900

## Current known facts from previous phase

- business.vw_company_robot_selector_options exists
- selector view rows = 0
- business.company_robot_entitlement rows = 0
- business.company_robot_placement rows = 4
- placement/display/assignment views have 4 rows

## Meaning

The UI is not receiving DB-backed selector candidates because the selector source is empty.

The likely reason is:

1. selector view depends on business.company_robot_entitlement
2. business.company_robot_entitlement has no rows
3. existing 4 robot rows are in placement/display side, not entitlement selector side

## What this phase confirms

Review DB_OUT:

/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_selector_source_exact_diag_20260430_074516/020_robot_selector_source_exact_diag.txt

Check:
- selector view definition
- whether selector view reads company_robot_entitlement
- whether placement rows already contain enough robot/model/role data
- whether entitlement rows need to be seeded
- whether UI should use placement display view instead of selector options

## Initial judgment

Do not patch UI mapper yet if selector view is 0.

Root likely belongs to DB seed/source alignment:
- either seed business.company_robot_entitlement
- or redefine selector view to use placement/display source
- or create a dedicated AICompanyManager system robot pool view

佐藤(DB担当) review required before any write/view change.
