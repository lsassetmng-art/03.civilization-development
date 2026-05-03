============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し確認画面

現在位置:
- V10GC2B: 既存server routeへのUI接続は入っている
- V10GC2D後、「承認確認へ進む」を押すと止まる
- 原因候補:
  - V10GC2C / V10GC2D の MutationObserver / interval / pointer系補正が強すぎる
  - 確認画面へ進むクリック後の描画と競合している

今回:
1. core/server syntax確認
2. core backup
3. V10GC2C / V10GC2D の自動prime系ブロックだけ撤去
4. V10GC2B は残す
5. server patchなし
6. server再起動
7. ブラウザ起動

確認:
- 「承認確認へ進む」を押して止まらないかだけ確認
- この段階ではまだ承認実行しない

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2e_remove_auto_prime_freeze_patch_20260504_054911
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES_REMOVE_ONLY
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2e_remove_auto_prime_freeze_patch_20260504_054911/aicm-production-core.before_v10gc2e.js

============================================================
4. remove V10GC2C / V10GC2D blocks
============================================================
REMOVED_AICM_R8Z_V10GC2C_REVIEW_CONFIRM_BUTTON_FORCE_ENABLE=false
REMOVED_AICM_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME=true

============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after remove

============================================================
6. verify
============================================================
V10GC2B_CORE_MARKER_COUNT=2
V10GC2C_MARKER_COUNT=0
V10GC2D_MARKER_COUNT=0
V10GC_SERVER_MARKER_COUNT=0
V10F4A_MARKER_COUNT=3
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO

============================================================
7. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=a9191bff4b5bc15c1b76202551c225e9206a3180c68255d0606de25f3fa0ed34
SERVED_SHA=a9191bff4b5bc15c1b76202551c225e9206a3180c68255d0606de25f3fa0ed34
SERVED_V10GC2B_COUNT=2
SERVED_V10GC2C_COUNT=0
SERVED_V10GC2D_COUNT=0

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10GC2E_AUTO_PRIME_REMOVED_STABLE_BASE_READY_BROWSER_OPENED
V10GC2B_CORE_MARKER_COUNT=2
V10GC2C_MARKER_COUNT=0
V10GC2D_MARKER_COUNT=0
V10GC_SERVER_MARKER_COUNT=0
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10GC2B_COUNT=2
SERVED_V10GC2C_COUNT=0
SERVED_V10GC2D_COUNT=0
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc2e_20260504_054911
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2e_remove_auto_prime_freeze_patch_20260504_054911/000_R8Z_V10GC2E_REMOVE_AUTO_PRIME_FREEZE_PATCH_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2e_remove_auto_prime_freeze_patch_20260504_054911/aicm-production-core.before_v10gc2e.js
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES_REMOVE_ONLY
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 成果物を確認
3. 「承認確認へ進む」を押す
4. 画面が止まらず、承認前の最終確認カードへ進めばOK
5. まだ「承認を実行する」は押さない

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2e_remove_auto_prime_freeze_patch_20260504_054911/aicm-production-core.before_v10gc2e.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
