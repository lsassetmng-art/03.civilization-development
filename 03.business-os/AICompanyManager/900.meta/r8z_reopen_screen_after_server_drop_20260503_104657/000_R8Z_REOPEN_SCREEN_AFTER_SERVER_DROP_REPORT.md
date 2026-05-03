============================================================
ROADMAP
============================================================
1. server/core syntax確認
2. 8794 到達確認
3. 落ちていれば server 起動
4. context review_wait_items=2 確認
5. Chrome/ブラウザで画面表示
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
1. syntax check
============================================================
PASS: syntax OK

============================================================
2. server reachability
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server
ROOT_HTTP_BEFORE=000
AICM server is down. Starting...
ROOT_HTTP_AFTER=200
PASS: server reachable

============================================================
3. context verify
============================================================
CONTEXT_HTTP=200
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_reopen_20260503_104657
result=ok
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true

============================================================
4. open browser
============================================================
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_reopen_20260503_104657
PASS: opened by termux-open-url

============================================================
DONE
============================================================
FINAL_JUDGEMENT=SERVER_RESTARTED_BROWSER_OPENED
ROOT_HTTP_AFTER=200
CONTEXT_HTTP=200
REVIEW_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_reopen_20260503_104657
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_reopen_screen_after_server_drop_20260503_104657/000_R8Z_REOPEN_SCREEN_AFTER_SERVER_DROP_REPORT.md
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_reopen_screen_after_server_drop_20260503_104657/010_server.log
DB_WRITE=NO
API_POST=NO
PATCH=NO
============================================================
