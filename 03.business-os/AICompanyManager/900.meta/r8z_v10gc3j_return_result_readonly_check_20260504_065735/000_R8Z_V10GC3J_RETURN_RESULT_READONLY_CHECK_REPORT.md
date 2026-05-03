============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- 残り1件の差し戻し実行結果確認

現在位置:
- V10GC3I 承認側は成功済み
- git checkpoint 完了: ae5e770 / PUSH_OK
- pending は 1件
- 今回は、画面で差し戻し実行後のDB状態をread-only確認する

今回:
1. DB read-onlyで残りpending件数確認
2. returned件数確認
3. 直近returnedレビューを確認
4. server log tail確認
5. pending 1件 -> 0件 なら成功判定

禁止:
- DB write
- API POST
- PATCH
- server restart

============================================================
1. ENV
============================================================
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j_return_result_readonly_check_20260504_065735
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. DB readonly check
============================================================
pending_table_count	1
pending_view_count	1
returned_table_count	0
approved_table_count	1
remaining_pending_ids	bd30bc28-c6d8-4fee-aebc-1311db979988:納品サマリー確認: Manager大項目台帳運用の整備 作業

============================================================
3. latest server log tail
============================================================
LATEST_SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/040_server.log
AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794

============================================================
4. classification
============================================================
FINAL_JUDGEMENT=RETURN_NOT_DONE_STILL_PENDING
NEXT_ACTION=CHECK_BROWSER_RETURN_CLICK_OR_SERVER_ERROR
PENDING_TABLE_COUNT=1
PENDING_VIEW_COUNT=1
RETURNED_TABLE_COUNT=0
APPROVED_TABLE_COUNT=1
LATEST_RETURNED=
REMAINING_PENDING_IDS=bd30bc28-c6d8-4fee-aebc-1311db979988:納品サマリー確認: Manager大項目台帳運用の整備 作業
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j_return_result_readonly_check_20260504_065735/010_db_return_result.tsv
SERVER_LOG_TAIL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j_return_result_readonly_check_20260504_065735/020_latest_server_log_tail.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j_return_result_readonly_check_20260504_065735/000_R8Z_V10GC3J_RETURN_RESULT_READONLY_CHECK_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO
