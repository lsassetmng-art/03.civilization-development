# Next plan

## If selector view uses company_robot_entitlement

Then fix direction is DB-side:

A. Seed company_robot_entitlement from existing company_robot_placement / robot pool source
or
B. Redesign selector view to derive AICM system candidates from placement/display view

Do not fix this by adding local dummy President候補ロボット.

## If placement rows are the real source

Then UI/API should read:

business.vw_company_robot_placement_display
or
business.vw_aicm_company_robot_active_assignment_display

and map roles:
- President
- Manager
- Leader
- Worker

## If neither has enough role/model info

Need DB seed / view extension under 佐藤(DB担当) review.

## Next recommended phase

Phase ALD-ALG:
- DB read-only: derive candidate selector rows from existing placement/display views
- produce exact INSERT/VIEW proposal only
- DB_WRITE remains stopped until approval
