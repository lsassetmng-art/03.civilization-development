============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- 成果物レビュー 承認 / 差し戻し

現在位置:
- V10GC3HでV10GC3Gのsyntax原因確定
- renderConfirm呼び出しではなく function renderConfirm 宣言部を誤置換していた
- 現coreはrollback済み / syntax OK / V10GC3G未適用
- V10GC2Jの後付けexecutorが残っている

今回:
1. core/server syntax確認
2. core backup
3. V10GC2系/V10GC3失敗系の後付けブロックを撤去
4. renderConfirm(row, mode, id) 本体内の disabled 実行ボタン行だけを直接修正
5. 「V10Gで有効化予定」ボタンを正規実行ボタンへ変更
6. data属性で review_id / owner_civilization_id / human_reviewer_label / decision を渡す
7. click handlerを1本だけ追加
8. server既存routeを利用
   - /api/aicm/v2/human-review/approve
   - /api/aicm/v2/human-review/return
9. hardcoded owner fallbackは使わない
10. server patchなし
11. ブラウザ起動

禁止:
- DB write during script
- API POST during script
- server patch
- MutationObserver / 常時interval
- DOM後補正ラッパー増殖
- hardcoded owner fallback

注意:
- 画面で「承認を実行する」を押すと本当にDB更新します。
- まず1件だけ実行してください。

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3i_renderconfirm_direct_button_canon_20260504_065246
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. DB readonly precheck
============================================================
pending_table	2
pending_view	2
pending_sample	bc553839-ebca-4610-81e3-31dc21476a48 | owner=00000000-0000-4000-8000-000000000001 | status=pending | title=納品サマリー確認: AI企業業務開始導線の整備 作業
pending_sample	bd30bc28-c6d8-4fee-aebc-1311db979988 | owner=00000000-0000-4000-8000-000000000001 | status=pending | title=納品サマリー確認: Manager大項目台帳運用の整備 作業

============================================================
4. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3i_renderconfirm_direct_button_canon_20260504_065246/aicm-production-core.before_v10gc3i.js

============================================================
5. patch core
============================================================
REMOVED_AICM_R8Z_V10GC_REVIEW_ITEM_DECISION_CORE=false
REMOVED_AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE=true
REMOVED_AICM_R8Z_V10GC2C_REVIEW_CONFIRM_BUTTON_FORCE_ENABLE=false
REMOVED_AICM_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME=false
REMOVED_AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME=false
REMOVED_AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST=false
REMOVED_AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK=false
REMOVED_AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX=true
REMOVED_AICM_R8Z_V10GC2L_DIRECT_CONFIRM_BUTTON_SOURCE_PATCH=false
REMOVED_AICM_R8Z_V10GC3_REVIEW_DECISION_CANONICAL_HANDLER=false
REMOVED_AICM_R8Z_V10GC3E_RENDERCONFIRM_REVIEW_DECISION_RECOVERY=false
REMOVED_AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH=false
REMOVED_AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON=false
NOTE_LINE_PATCHED=true
MAIN_NOTE_LINE_PATCHED=true
PATCH_APPLIED: V10GC3I renderConfirm direct button canon handler appended

BEFORE_V10GC2B_COUNT=2
BEFORE_V10GC2J_COUNT=2
BEFORE_V10GC3G_COUNT=0
BEFORE_V10GC3I_COUNT=0
BEFORE_DISABLED_NEXT_BUTTON_COUNT=1
BEFORE_NEXT_STEP_LABEL_COUNT=3
OLD_BUTTON_EXACT_COUNT=1
AFTER_V10GC2B_COUNT=0
AFTER_V10GC2J_COUNT=0
AFTER_V10GC3G_COUNT=0
AFTER_V10GC3I_COUNT=2
AFTER_DISABLED_NEXT_BUTTON_COUNT=0
AFTER_NEXT_STEP_LABEL_COUNT=0
AFTER_CANONICAL_ACTION_COUNT=2
AFTER_REVIEW_DECISION_ATTR_COUNT=2
AFTER_REVIEW_ITEM_ATTR_COUNT=2
AFTER_OWNER_ATTR_COUNT=2
AFTER_REVIEWER_ATTR_COUNT=2
AFTER_FIXED_OWNER_FALLBACK_COUNT_IN_V10GC3I_BLOCK=0
PATCH_DECISION=PATCH_APPLIED

============================================================
6. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
7. verify
============================================================
V10GC2B_MARKER_COUNT=0
V10GC2J_MARKER_COUNT=0
V10GC3G_MARKER_COUNT=0
V10GC3I_MARKER_COUNT=2
grep: warning: stray \ before "
grep: warning: stray \ before "
DISABLED_NEXT_BUTTON_COUNT=0
NEXT_STEP_LABEL_COUNT=0
grep: warning: stray \ before "
grep: warning: stray \ before "
CANONICAL_ACTION_COUNT=2
REVIEW_DECISION_ATTR_COUNT=2
REVIEW_ITEM_ATTR_COUNT=2
OWNER_ATTR_COUNT=2
REVIEWER_ATTR_COUNT=2
V10GC_SERVER_MARKER_COUNT=0
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO

============================================================
8. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=3cd2502951224c2c712b2c54ca424b67999548aada7be5731fb2f97e36babf87
SERVED_SHA=3cd2502951224c2c712b2c54ca424b67999548aada7be5731fb2f97e36babf87
SERVED_V10GC3I_COUNT=2
SERVED_DISABLED_NEXT_COUNT=0
SERVED_NEXT_STEP_LABEL_COUNT=0

============================================================
9. final
============================================================
FINAL_JUDGEMENT=V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON_READY_BROWSER_OPENED
V10GC2B_MARKER_COUNT=0
V10GC2J_MARKER_COUNT=0
V10GC3G_MARKER_COUNT=0
V10GC3I_MARKER_COUNT=2
DISABLED_NEXT_BUTTON_COUNT=0
NEXT_STEP_LABEL_COUNT=0
CANONICAL_ACTION_COUNT=2
REVIEW_DECISION_ATTR_COUNT=2
REVIEW_ITEM_ATTR_COUNT=2
OWNER_ATTR_COUNT=2
REVIEWER_ATTR_COUNT=2
V10GC_SERVER_MARKER_COUNT=0
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10GC3I_COUNT=2
SERVED_DISABLED_NEXT_COUNT=0
SERVED_NEXT_STEP_LABEL_COUNT=0
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc3i_20260504_065246
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3i_renderconfirm_direct_button_canon_20260504_065246/000_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3i_renderconfirm_direct_button_canon_20260504_065246/aicm-production-core.before_v10gc3i.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3i_renderconfirm_direct_button_canon_20260504_065246/020_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 成果物を確認
3. 承認確認へ進む
4. 「承認を実行する」ボタンが出ること
5. 「次工程」表記が消えていること
6. ボタンが押せること
7. まず1件だけ承認を実行
8. 実行後、レビュー一覧が 2件 -> 1件 になればOK
9. 成功したらそこで止めてください

注意:
- ボタンを押すと本当にDB更新します。
- まず1件だけです。
- 成功後にgit checkpointへ進みます。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3i_renderconfirm_direct_button_canon_20260504_065246/aicm-production-core.before_v10gc3i.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
