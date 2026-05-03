============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー一覧は表示OK
- レビュー一覧の戻るボタンは「戻る」1個だけでダッシュボードへ戻す方針
- 課追加で従業員設定が出る問題は未解決
- V10F2I/J debugで、state/placementsではなくDOM本文に従業員設定ブロックが出ていることが確定

今回:
1. core/server syntax確認
2. core backup
3. レビュー一覧ナビを「戻る」1個だけに固定
4. 課追加/課新規追加画面だけ、従業員設定ブロックをDOMから除去
5. 除去前に該当ブロック内のselect/input値も空にする
6. 古いdebugカードを非表示化
7. server再起動
8. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- 台帳/レビュー件数/承認API/削除APIへの変更

補足:
- 今回は「新規課では従業員を配置しない」をUI保存対象からも外す画面ガード。
- 既存課詳細/課変更では従業員設定を残す。

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2k_section_add_worker_block_guard_20260503_224709
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2k_section_add_worker_block_guard_20260503_224709/aicm-production-core.before_v10f2k.js

============================================================
4. patch core
============================================================
PATCH_APPLIED: V10F3D review-list back single dashboard installed
PATCH_APPLIED: V10F2K section-add worker block guard installed

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. verify
============================================================
V10F2K_MARKER_COUNT=2
V10F2K_INFO_ID_COUNT=2
V10F2K_APPLY_COUNT=1
V10F2K_CLEAR_CONTROLS_COUNT=1
V10F2K_HIDE_DEBUG_STYLE_COUNT=2
V10F3D_MARKER_COUNT=2
V10F3D_ACTION_COUNT=2
V10F3D_SINGLE_LABEL_COUNT=16
V10F2K_NO_DB_WRITE=true
V10F2K_NO_API_POST=true

============================================================
7. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=8461eb499020550232cf964690816ca6ba83a172416e177ce206cfd14369c6bf
SERVED_SHA=8461eb499020550232cf964690816ca6ba83a172416e177ce206cfd14369c6bf
SERVED_V10F2K_COUNT=2
SERVED_V10F3D_COUNT=2

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10F2K_SECTION_ADD_WORKER_BLOCK_GUARD_READY_BROWSER_OPENED
V10F2K_MARKER_COUNT=2
V10F2K_INFO_ID_COUNT=2
V10F2K_APPLY_COUNT=1
V10F2K_CLEAR_CONTROLS_COUNT=1
V10F2K_HIDE_DEBUG_STYLE_COUNT=2
V10F3D_MARKER_COUNT=2
V10F3D_ACTION_COUNT=2
V10F3D_SINGLE_LABEL_COUNT=16
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10F2K_COUNT=2
SERVED_V10F3D_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10f2k_20260503_224709
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2k_section_add_worker_block_guard_20260503_224709/000_R8Z_V10F2K_SECTION_ADD_WORKER_BLOCK_GUARD_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2k_section_add_worker_block_guard_20260503_224709/aicm-production-core.before_v10f2k.js
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

BROWSER_CHECK:
A. レビュー一覧
- 上部ナビは「戻る」1個
- 押したらダッシュボードへ戻る

B. 課追加
- 赤枠/紫枠debugが消える
- 従業員設定ロボット 1/2/3 が表示されない
- 「従業員は未設定です」が表示される
- 既存課詳細/課変更では従業員設定が残る

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2k_section_add_worker_block_guard_20260503_224709/aicm-production-core.before_v10f2k.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
