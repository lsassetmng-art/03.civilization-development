# Post switch manual verify plan

Open:
http://127.0.0.1:8794/?v=20260430_112432_clean_production

Expected:
- Production index loads only assets/js/aicm-production-core.js
- No old 36-script stack
- Dashboard loads without white screen
- No old localStorage company appears unless it exists in v2
- API response uses api_identifier AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1

Manual UI test:
1. Open URL above
2. AI企業新規追加
3. Create a v2 company
4. Return dashboard
5. Select the created company
6. 部門追加
7. Create a department
8. 課追加
9. Create a section
10. Reload page
11. Confirm company -> department -> section remains

Do not test yet:
- edit
- delete
- old workflow/review screens
