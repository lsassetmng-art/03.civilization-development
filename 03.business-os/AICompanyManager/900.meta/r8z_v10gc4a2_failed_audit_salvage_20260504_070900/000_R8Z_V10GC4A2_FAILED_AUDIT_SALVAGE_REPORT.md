============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- V10GC4A2 review-list / leader-send route audit 失敗確認

現在位置:
- 承認/差し戻しDB機能は成功済み
- 画面制御と課長送信後の表示経路を確認中
- 直前のV10GC4A2 audit が code 3 で停止

今回:
1. 最新V10GC4A2実行ディレクトリを特定
2. report / DB_OUT / SERVER_SCAN / CORE_SCAN / CLASSIFY の有無を確認
3. core/server syntax確認
4. 可能な範囲で途中出力を表示
5. 失敗原因を分類
6. 次に安全なaudit修正版へ進めるか判断

禁止:
- DB write
- API POST
- PATCH
- server restart

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
LATEST_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733
LATEST_REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733/000_R8Z_V10GC4A2_REVIEW_LIST_LEADER_SEND_AUDIT_REPORT.md
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733/010_db_review_and_leader_send_readonly.tsv
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733/020_server_context_review_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733/030_core_review_and_leader_send_scan.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733/040_classification.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_failed_audit_salvage_20260504_070900
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. syntax current
============================================================
CORE_SYNTAX=OK
SERVER_SYNTAX=OK

============================================================
3. latest report tail
============================================================
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- 部門別タスク台帳
- 課長/Leaderへ送る導線

現在位置:
- 承認/差し戻しDB機能は成功済み
- approved=1 / returned=1 / pending=0
- しかし画面ではレビュー承認待ち1件が残っている
- その他2件を課長に送ったが画面に表示されない
- 台帳の全件/複数件をまとめて課長へ送る機能が必要

今回:
1. DB上の review status 分布確認
2. review wait view が全statusを返しているか確認
3. server context が review rows をどう取っているか確認
4. frontend が pending filter を持っているか確認
5. 台帳→課長/Leader送信系の既存テーブル/API/UIを確認
6. 次patchを分類する

禁止:
- DB write
- API POST
- PATCH
- server restart

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. DB readonly review / leader-send audit
============================================================
ERROR:  column "status_code" does not exist
LINE 5:   SELECT COALESCE(status_code, '-') AS status_code, count(*)...
                          ^

============================================================
4. db output if exists
============================================================
review_table_status_counts	approved:1 | returned:1
review_view_status_counts	returned:1
review_view_all_rows	bd30bc28-c6d8-4fee-aebc-1311db979988:returned:納品サマリー確認: Manager大項目台帳運用の整備 作業
review_view_pending_rows	

============================================================
5. server scan if exists
============================================================
SERVER_SCAN_NOT_FOUND

============================================================
6. core scan if exists
============================================================
CORE_SCAN_NOT_FOUND

============================================================
7. classify if exists
============================================================
CLASSIFY_NOT_FOUND

============================================================
8. quick static fallback scan
============================================================
REVIEW_VIEW_USAGE_SERVER=1
grep: Trailing backslash
pending.*human_review_status_code": command not found
SERVER_PENDING_FILTER_COUNT=
grep: Trailing backslash
pending.*human_review_status_code\: command not found
pending.*review_status": command not found
review_status.*pending\: command not found
CORE_PENDING_FILTER_COUNT=
CORE_REVIEW_EMPTY_TEXT_COUNT=4
CORE_REVIEW_NAV_COUNT=10
CORE_LEADER_SEND_COUNT=0
CORE_BULK_COUNT=0
V10GC3I_MARKER_COUNT=2

============================================================
9. classification
============================================================
FINAL_JUDGEMENT=V10GC4A2_FAILED_REPORT_HAS_ERROR
NEXT_ACTION=RERUN_SAFE_AUDIT_WITH_TABLE_EXISTS_GUARDS
CORE_SYNTAX_RESULT=OK
SERVER_SYNTAX_RESULT=OK
LATEST_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733
LATEST_REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733/000_R8Z_V10GC4A2_REVIEW_LIST_LEADER_SEND_AUDIT_REPORT.md
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733/010_db_review_and_leader_send_readonly.tsv
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733/020_server_context_review_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733/030_core_review_and_leader_send_scan.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_review_list_leader_send_audit_20260504_070733/040_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4a2_failed_audit_salvage_20260504_070900/000_R8Z_V10GC4A2_FAILED_AUDIT_SALVAGE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO
