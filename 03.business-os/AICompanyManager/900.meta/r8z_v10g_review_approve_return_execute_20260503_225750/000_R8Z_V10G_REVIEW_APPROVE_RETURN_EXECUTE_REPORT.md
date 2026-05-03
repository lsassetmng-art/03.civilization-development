============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- 成果物レビューの承認/差し戻し

現在位置:
- レビュー一覧2件表示OK
- 成果物詳細表示OK
- 承認/差し戻し前の確認画面OK
- ただし本実行ボタンは未接続/無効

今回:
1. core/server syntax確認
2. DB rollback smokeで pending -> approved / returned 遷移を確認
3. serverにreview approve/return APIが無い場合だけ追加
4. coreに「最終確認カードからのみPOSTする実行関数」を追加
5. 実行後はレビュー一覧を再読込
6. server再起動
7. ブラウザ起動

重要:
- このスクリプト自体は永続DB更新しない
- rollback smokeのみ
- 本実行はユーザーが画面の最終確認ボタンを押した場合のみ
- 確認画面なしPOSTは禁止

禁止:
- DB persistent write during script
- 確認画面を飛ばした承認/差し戻し
- レビュー一覧件数の偽装
- 台帳/課/従業員/削除への変更

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10g_review_approve_return_execute_20260503_225750
DB_WRITE=ROLLBACK_ONLY
API_POST=ROLLBACK_SMOKE_ONLY
CORE_PATCH=YES
SERVER_PATCH=YES_IF_NEEDED

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10g_review_approve_return_execute_20260503_225750/aicm-production-core.before_v10g.js
BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10g_review_approve_return_execute_20260503_225750/aicm-local-ui-api-server.before_v10g.mjs

============================================================
4. DB rollback smoke
============================================================
ERROR:  relation "business.aicm_human_review_wait_view" does not exist
LINE 5:   FROM business.aicm_human_review_wait_view
               ^
