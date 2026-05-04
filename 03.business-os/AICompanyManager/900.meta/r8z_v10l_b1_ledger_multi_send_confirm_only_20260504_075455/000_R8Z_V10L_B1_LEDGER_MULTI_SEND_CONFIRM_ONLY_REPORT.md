============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- Manager大項目
- 課長/Leaderへ送るUI

現在位置:
- レビュー・承認待ち一覧は完了
- V10L-B0 audit PASS
- runLeaderAutoDecomposition required payload:
  owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id
- Manager大項目 38件
- Leader中項目 4件
- Worker作業単位 4件
- 既にLeader中項目があるManager大項目は4件
- 標準送信対象は「未送信推定のみ」
- 重複作成を避けるため、全件送信は警告付き確認にする

今回:
1. core/server syntax確認
2. DB read-onlyで件数再確認
3. core backup
4. 部門別タスク台帳画面に課長送信パネルを追加
5. Manager大項目ごとにチェックボックスを出す
6. 選択した項目 / 未送信推定 / 全件 の確認カードを出す
7. この工程では実POSTしない
8. server再起動
9. ブラウザ起動

禁止:
- DB write
- API POST
- server patch
- runLeaderAutoDecomposition API変更
- 既存レビュー機能への変更
- 確認画面を飛ばす実行ボタン

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. DB readonly counts
============================================================
manager_major_count	38
leader_middle_count	4
worker_work_unit_count	4
major_with_existing_middle	4
middle_duplicate_groups	0
worker_duplicate_groups	0

============================================================
4. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/aicm-production-core.before_v10l_b1.js

============================================================
5. patch core
============================================================
