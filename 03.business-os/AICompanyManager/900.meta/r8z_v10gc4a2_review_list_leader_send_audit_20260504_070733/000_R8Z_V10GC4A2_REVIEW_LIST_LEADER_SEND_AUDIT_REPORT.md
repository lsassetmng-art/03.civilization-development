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
