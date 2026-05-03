============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- V9F3で open-confirm 関数は復旧済み
- 前回V9F4は実行が崩れたか、wrapper挿入位置が早すぎた可能性あり
- 課長へ送る確認カードはまだ出ない
- レビュー待ち修正は停止中

今回:
1. core/server syntax確認
2. core backup
3. renderTaskLedgerPlaceholder 定義後に確認カードwrapperを追加
4. click bridgeも後段で追加
5. server再起動
6. 成功したら画面自動起動

禁止:
- DB write
- API POST
- server patch
- レビュー待ち側の追加変更

============================================================
1. ENV
============================================================
PHASE=R8Z-V9F4B confirm card post-render wrapper fix
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f4b_confirm_card_post_render_wrapper_20260503_112534
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f4b_confirm_card_post_render_wrapper_20260503_112534/aicm-production-core.before_r8z_v9f4b.js

============================================================
4. patch V9F4B after renderTaskLedgerPlaceholder exists
============================================================
PATCH_APPLIED: V9F4B post-render wrapper installed before // AICM_HUMAN_REVIEW_QUEUE_CORE_ARO_ART_V1

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. static verify
============================================================
V9F4B_MARKER_COUNT=1
HAS_CONFIRM_CARD_RENDERER_V9F4B=true
HAS_CONFIRM_INJECTOR_V9F4B=true
TASK_LEDGER_WRAPPED_V9F4B=true
CLICK_BRIDGE_INSTALLED_V9F4B=true
BRIDGE_HANDLES_MAIN_ACTION_V9F4B=true
HAS_OPEN_CONFIRM_FUNCTION=true
RENDER_TASK_LEDGER_LINE=6076
V9F4B_MARKER_LINE=6591
V9F4B_AFTER_RENDER_TASK_LEDGER=true

============================================================
7. snippet
============================================================
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f4b_confirm_card_post_render_wrapper_20260503_112534/030_core_v9f4b_snip.txt

============================================================
8. restart server
============================================================
ROOT_HTTP=200

============================================================
9. served core verify
============================================================
SERVED_HTTP=200
DISK_SHA=83b28f9d40f23e52b424850642ba603bf6b53d34cfb14c74bb62ef6ee7c3d78e
SERVED_SHA=83b28f9d40f23e52b424850642ba603bf6b53d34cfb14c74bb62ef6ee7c3d78e
SERVED_V9F4B_MARKER_COUNT=1

============================================================
10. final / browser open
============================================================
FINAL_JUDGEMENT=V9F4B_CONFIRM_CARD_POST_RENDER_WRAPPER_READY_BROWSER_OPENED
V9F4B_MARKER_COUNT=1
HAS_CONFIRM_CARD_RENDERER_V9F4B=true
HAS_CONFIRM_INJECTOR_V9F4B=true
TASK_LEDGER_WRAPPED_V9F4B=true
CLICK_BRIDGE_INSTALLED_V9F4B=true
BRIDGE_HANDLES_MAIN_ACTION_V9F4B=true
HAS_OPEN_CONFIRM_FUNCTION=true
V9F4B_AFTER_RENDER_TASK_LEDGER=true
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V9F4B_MARKER_COUNT=1
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9f4b_20260503_112534
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f4b_confirm_card_post_render_wrapper_20260503_112534/000_R8Z_V9F4B_CONFIRM_CARD_POST_RENDER_WRAPPER_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f4b_confirm_card_post_render_wrapper_20260503_112534/aicm-production-core.before_r8z_v9f4b.js
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. Manager大項目の「課長へ送る」を押す

期待:
- 「課長へ送る確認」カードが出る
- まだDB更新しない
- 出たら次に確認ボタンのrollback/safe確認へ進む

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f4b_confirm_card_post_render_wrapper_20260503_112534/aicm-production-core.before_r8z_v9f4b.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
