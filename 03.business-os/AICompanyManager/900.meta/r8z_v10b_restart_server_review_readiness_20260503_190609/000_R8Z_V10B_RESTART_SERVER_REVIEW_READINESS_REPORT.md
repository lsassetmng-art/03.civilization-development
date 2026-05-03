============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 前回V10Aで ROOT_HTTP=000 / CONTEXT_HTTP=000
- ただし DB/view 上はレビュー待ち2件あり
- つまりまずサーバー復旧が先

今回:
1. core/server syntax確認
2. 8794使用プロセスを停止
3. AICM server再起動
4. root / served core / context API を確認
5. DB/view 2件をSELECT onlyで再確認
6. contextでもreview_wait_items=2なら画面を開く

禁止:
- DB write
- API POST
- PATCH

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10b_restart_server_review_readiness_20260503_190609
DB_READ=YES
DB_WRITE=NO
API_GET=YES
API_POST=NO
PATCH=NO
SUCCESS_BROWSER_OPEN=YES

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. stop old server process
============================================================
KILL_BY_LSOF=NONE

============================================================
4. start server
============================================================
SERVER_PID=25972
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10b_restart_server_review_readiness_20260503_190609/010_server.log
---- server log head ----
AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794

============================================================
5. HTTP verify
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=a77bdc410d97023f3b4c16d2c8ea736336f8fda09582f2d0e27967625b56e11f
SERVED_SHA=a77bdc410d97023f3b4c16d2c8ea736336f8fda09582f2d0e27967625b56e11f
PASS: served core matches disk

============================================================
6. context API verify
============================================================
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v10b_20260503_190609
CONTEXT_HTTP=200
CONTEXT_JSON=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10b_restart_server_review_readiness_20260503_190609/030_context.json
CONTEXT_RESULT=ok
CONTEXT_OWNER=00000000-0000-4000-8000-000000000001
CONTEXT_REVIEW_WAIT_ITEMS_COUNT=2
CONTEXT_TARGET_REVIEW_WAIT_ITEMS_COUNT=2
CONTEXT_PMLW_MAJOR_COUNT=38
CONTEXT_WORKER_WORK_UNITS_COUNT=3
HAS_AI_COMPANY_START=true
HAS_MANAGER_MAJOR=true
REVIEW_TITLES=
- 納品サマリー確認: AI企業業務開始導線の整備 作業
- 納品サマリー確認: Manager大項目台帳運用の整備 作業

============================================================
7. DB readonly review confirmation
============================================================
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10b_restart_server_review_readiness_20260503_190609/040_db_review_readonly.tsv
DB_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10b_restart_server_review_readiness_20260503_190609/041_db_review_readonly.err
---- DB_OUT ----
Pager usage is off.
Output format is unaligned.
Field separator is "	".
BEGIN
DB_HUMAN_REVIEW_PENDING_COUNT	2
DB_VIEW_WAIT_DISPLAY_COUNT	2
DB_VIEW_WAIT_TITLE	納品サマリー確認: AI企業業務開始導線の整備 作業	delivery_summary	delivery_package	urgent
DB_VIEW_WAIT_TITLE	納品サマリー確認: Manager大項目台帳運用の整備 作業	delivery_summary	delivery_package	urgent
ROLLBACK

============================================================
8. final / browser open
============================================================
FINAL_JUDGEMENT=SERVER_RESTARTED_REVIEW_DATA_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
CONTEXT_TARGET_REVIEW_COUNT=2
DB_HUMAN_REVIEW_PENDING_COUNT=2
DB_VIEW_WAIT_DISPLAY_COUNT=2
HAS_AI_COMPANY_START=true
HAS_MANAGER_MAJOR=true
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10b_20260503_190609
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10b_restart_server_review_readiness_20260503_190609/000_R8Z_V10B_RESTART_SERVER_REVIEW_READINESS_REPORT.md
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10b_restart_server_review_readiness_20260503_190609/010_server.log
CONTEXT_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10b_restart_server_review_readiness_20260503_190609/031_context_summary.txt
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10b_restart_server_review_readiness_20260503_190609/040_db_review_readonly.tsv
DB_WRITE=NO
API_POST=NO
PATCH=NO

BROWSER_CHECK:
1. 開いた画面で「レビュー・承認待ち一覧」を開く
2. 表示がまだ0件なら、画面上の debug 行をスクショまたは文面で貼る
3. context/API上は2件あるかをこのREPORTで確認済みにする
