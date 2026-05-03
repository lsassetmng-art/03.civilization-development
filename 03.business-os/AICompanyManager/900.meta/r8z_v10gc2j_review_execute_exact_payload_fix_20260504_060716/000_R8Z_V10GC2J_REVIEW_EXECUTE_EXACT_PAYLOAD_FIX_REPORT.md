============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し最終確認カード

現在位置:
- V10GC2I debugで原因確定
- review_id は取得できている
- owner_civilization_id が空
- 実行ボタンは disabled=true / disabled属性あり
- data-core-action なし
- data-review-item-id なし
- V10GC2H は NO POST debug のため撤去が必要

今回:
1. core/server syntax確認
2. core backup
3. V10GC2F/H/I のdebug/prime系を撤去
4. V10GC2Bは残す
5. V10GC2Jを追加
6. 確認画面上の実行ボタンを有効化
7. data-core-action を V10GC2J専用 action に固定
8. data-review-item-id を付与
9. server要求payloadに合わせてPOSTする
10. owner_civilization_id は state/DOM から取得し、最後のfallbackで開発ownerを使う
11. server patchなし
12. ブラウザ起動

禁止:
- スクリプト中のDB write
- スクリプト中のAPI POST
- server patch
- 確認画面なしPOST

注意:
- 画面で「承認を実行する」を押すと本当にDB更新します。
- まず1件だけ実行してください。

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2j_review_execute_exact_payload_fix_20260504_060716
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2j_review_execute_exact_payload_fix_20260504_060716/aicm-production-core.before_v10gc2j.js

============================================================
4. patch core
============================================================
REMOVED_AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME=true
REMOVED_AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST=true
REMOVED_AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK=true
PATCH_APPLIED: V10GC2J exact payload review executor appended

============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
6. verify
============================================================
V10GC2B_CORE_MARKER_COUNT=2
V10GC2F_MARKER_COUNT=0
V10GC2H_MARKER_COUNT=0
V10GC2I_MARKER_COUNT=0
V10GC2J_MARKER_COUNT=2
V10GC2J_APPROVE_ACTION_COUNT=3
V10GC2J_RETURN_ACTION_COUNT=3
V10GC2J_PAYLOAD_OWNER_COUNT=96
V10GC2J_PAYLOAD_REVIEWER_COUNT=5
V10GC2J_DEV_OWNER_FALLBACK_COUNT=23
V10GC_SERVER_MARKER_COUNT=0
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO

============================================================
7. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=4df3f0789474c79f6c710807a1767424467923a590646a9d665dde7b737bae06
SERVED_SHA=4df3f0789474c79f6c710807a1767424467923a590646a9d665dde7b737bae06
SERVED_V10GC2J_COUNT=2

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_READY_BROWSER_OPENED
V10GC2B_CORE_MARKER_COUNT=2
V10GC2F_MARKER_COUNT=0
V10GC2H_MARKER_COUNT=0
V10GC2I_MARKER_COUNT=0
V10GC2J_MARKER_COUNT=2
V10GC2J_APPROVE_ACTION_COUNT=3
V10GC2J_RETURN_ACTION_COUNT=3
V10GC2J_PAYLOAD_OWNER_COUNT=96
V10GC2J_PAYLOAD_REVIEWER_COUNT=5
V10GC2J_DEV_OWNER_FALLBACK_COUNT=23
V10GC_SERVER_MARKER_COUNT=0
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10GC2J_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc2j_20260504_060716
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2j_review_execute_exact_payload_fix_20260504_060716/000_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2j_review_execute_exact_payload_fix_20260504_060716/aicm-production-core.before_v10gc2j.js
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 成果物を確認
3. 承認確認へ進む
4. 「承認を実行する」が灰色解除されること
5. まず1件だけ承認を実行
6. 実行後、レビュー一覧が 2件 -> 1件 になればOK
7. 成功したら止めて結果を貼ってください

注意:
- ボタンを押すと本当にDB更新します。
- 1件だけ実行してください。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2j_review_execute_exact_payload_fix_20260504_060716/aicm-production-core.before_v10gc2j.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
