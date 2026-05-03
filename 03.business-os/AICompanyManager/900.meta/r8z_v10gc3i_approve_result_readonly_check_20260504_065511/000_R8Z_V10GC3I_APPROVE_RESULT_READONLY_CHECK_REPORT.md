============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認実行後の結果確認

現在位置:
- 画面上は「承認を実行する」ボタン表示OK
- 押下後、ボタンがdisabledになった
- ただし画面だけでは承認成功か不明

今回:
1. DBをread-onlyで確認
2. 対象review_idのstatus確認
3. pending件数が 2 -> 1 になったか確認
4. server logにPOSTエラーが出ていないか確認

禁止:
- DB write
- API POST
- PATCH
- server restart

============================================================
1. ENV
============================================================
TARGET_REVIEW_ID=bc553839-ebca-4610-81e3-31dc21476a48
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3i_approve_result_readonly_check_20260504_065511
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. DB readonly check
============================================================
target_table_status	bc553839-ebca-4610-81e3-31dc21476a48	approved	2026-05-03 21:53:23.552614+00		2026-05-03 21:53:23.552614+00
target_view_visible	0
pending_table_count	1
pending_view_count	1
pending_view_ids	bd30bc28-c6d8-4fee-aebc-1311db979988:納品サマリー確認: Manager大項目台帳運用の整備 作業
recent_review_actions	

============================================================
3. latest server log tail
============================================================
LATEST_SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/040_server.log
AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794

============================================================
4. classification
============================================================
FINAL_JUDGEMENT=APPROVE_SUCCESS_DB_CONFIRMED
NEXT_ACTION=GIT_CHECKPOINT_AFTER_APPROVE_SUCCESS
TARGET_STATUS=approved
TARGET_VIEW_VISIBLE=0
PENDING_TABLE_COUNT=1
PENDING_VIEW_COUNT=1
RECENT_ACTIONS=
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3i_approve_result_readonly_check_20260504_065511/010_db_approve_result.tsv
SERVER_LOG_TAIL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3i_approve_result_readonly_check_20260504_065511/020_latest_server_log_tail.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3i_approve_result_readonly_check_20260504_065511/000_R8Z_V10GC3I_APPROVE_RESULT_READONLY_CHECK_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO
