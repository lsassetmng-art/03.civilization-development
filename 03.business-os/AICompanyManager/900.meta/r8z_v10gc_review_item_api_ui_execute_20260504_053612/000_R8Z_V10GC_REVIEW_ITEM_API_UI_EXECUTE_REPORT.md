============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- 成果物レビューの承認 / 差し戻し

現在位置:
- V10GB3 rollback smoke PASS
- 実テーブル: business.aicm_human_review_item
- 表示view: business.vw_aicm_human_review_wait_display
- pending件数: table/view ともに2件
- pending -> approved -> returned はROLLBACK内で確認済み

今回:
1. core/server syntax確認
2. core/server backup
3. DB実在relationとpending件数を再確認
4. serverに review decision API を追加
5. coreに最終確認カード専用の承認/差し戻し実行を追加
6. 実行後はstate上の対象レビューを除外し、レビュー一覧へ戻す
7. server再起動
8. invalid POST smokeでendpoint到達のみ確認
9. ブラウザ起動

重要:
- このスクリプト中は永続DB更新しない
- endpoint smokeは review_id 空の 400 確認のみ
- 本DB更新はユーザーが画面の最終確認ボタンを押した時だけ
- 確認画面なしPOSTは禁止

禁止:
- 台帳/課/従業員/削除への変更
- レビュー件数の偽装
- 確認画面を飛ばす承認/差し戻し

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc_review_item_api_ui_execute_20260504_053612
DB_WRITE=NO
API_POST=INVALID_SMOKE_ONLY
CORE_PATCH=YES
SERVER_PATCH=YES
DB_REVIEW=佐藤(DB担当)

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. DB precheck
============================================================
review_item_table	business.aicm_human_review_item
wait_display_view	business.vw_aicm_human_review_wait_display
pending_table	2
pending_view	2

============================================================
4. backup
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc_review_item_api_ui_execute_20260504_053612/aicm-production-core.before_v10gc.js
BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc_review_item_api_ui_execute_20260504_053612/aicm-local-ui-api-server.before_v10gc.mjs

============================================================
5. patch server/core
============================================================
