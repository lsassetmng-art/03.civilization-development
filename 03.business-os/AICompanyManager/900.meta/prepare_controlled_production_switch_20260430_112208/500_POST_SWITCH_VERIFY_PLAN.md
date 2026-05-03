# Post switch verify plan

## Automated checks

1. node --check current server
2. node --check aicm-production-core.js
3. GET /api/aicm/v2/context

Expected:
- result ok
- companies array
- departments array
- sections array
- robot_catalog array

## Manual UI checks

Open:
http://127.0.0.1:8794/?v=<switch_ts>_clean_production

Then:
1. Dashboard loads without white screen.
2. No old local company appears unless it exists in v2.
3. AI企業新規追加 creates v2 company.
4. Dashboard shows created company.
5. 部門追加 creates v2 department under selected company.
6. 課追加 creates v2 section under selected department.
7. Reload keeps data from v2.
8. Error messages do not show DB connection strings.

## Do not test yet

- edit
- delete
- complex review workflow
- old worker placement screens
