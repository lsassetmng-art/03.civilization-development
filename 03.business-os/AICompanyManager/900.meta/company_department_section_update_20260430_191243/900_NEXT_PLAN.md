# Next plan

Testing was intentionally deferred.

When ready:
1. Restart server:
   cd "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager"
   nohup node "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs" > "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_department_section_update_20260430_191243/040_server_later_test.log" 2>&1 &

2. Open production UI:
   http://127.0.0.1:8794/?v=20260430_191243_org_update

3. Manual UI test:
   - 企業変更: selected company can be updated
   - 部門変更: choose department, update, save
   - 課変更: choose section, update, save

4. API endpoints now present:
   - /api/aicm/v2/company/update
   - /api/aicm/v2/department/update
   - /api/aicm/v2/section/update
