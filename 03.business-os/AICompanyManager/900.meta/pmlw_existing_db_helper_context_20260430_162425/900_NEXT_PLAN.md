# Next plan

If FINAL_STATUS is PASS:
1. Open production UI:
   http://127.0.0.1:8794/?v=20260430_162425_pmlw_existing_helper
2. Open 部門別タスク台帳
3. Confirm Manager大項目台帳 appears
4. Empty rows are normal for now

If FINAL_STATUS is FAIL:
1. Read:
   /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/pmlw_existing_db_helper_context_20260430_162425/020_server_db_helper_scan_before.txt
2. Identify the actual existing DB helper name manually
3. Do not add a new Pool
4. Patch using that helper only

After PASS:
- Add President方針 create API
- Add Manager大項目 create/update/archive API
- Connect UI buttons
