============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- 成果物レビュー 承認 / 差し戻し

現在位置:
- V10GC3F audit PASS
- row変数は row
- 確認renderer内の renderConfirm 実呼び出しは1箇所
- viewには owner_civilization_id column が存在
- target renderer内で ownerを現在参照していないだけで、row.owner_civilization_id は使える

今回:
1. core/server syntax確認
2. core backup
3. V10GC2系の後付け補正ブロックを撤去
4. 確認renderer内の renderConfirm(...) 実呼び出し1箇所だけを正本helper経由にする
5. helperで「承認前の最終確認 / 差し戻し前の最終確認」から decision を判定
6. helperで row から review_id / owner_civilization_id / reviewer_label を data属性へ渡す
7. click handlerを1本だけ追加
8. payloadはserver要求keyへ統一
   - aicm_human_review_item_id
   - owner_civilization_id
   - human_reviewer_label
   - human_review_note
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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/aicm-production-core.before_v10gc3g.js

============================================================
4. patch core
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
PATCH_APPLIED: V10GC3G helper and canonical handler appended

BEFORE_V10GC2B_COUNT=2
BEFORE_V10GC2F_COUNT=0
BEFORE_V10GC2H_COUNT=0
BEFORE_V10GC2I_COUNT=0
BEFORE_V10GC2J_COUNT=2
BEFORE_V10GC2L_COUNT=0
BEFORE_V10GC3E_COUNT=0
BEFORE_V10GC3G_COUNT=0
APPROVE_FN_FOUND=true
RETURN_FN_FOUND=true
APPROVE_FN_HEADER=function renderConfirm(row, mode, id) {
RETURN_FN_HEADER=function renderConfirm(row, mode, id) {
SAME_CONFIRM_FUNCTION=true
ROW_VAR_SELECTED=row
ROW_VAR_CANDIDATES=row:4
RENDERCONFIRM_CALL_MATCH_COUNT=1
ORIGINAL_RENDERCONFIRM_CALL=renderConfirm(row, mode, id)
PATCHED_RENDERCONFIRM_CALL=aicmR8zV10gc3gInsertReviewDecisionAction(renderConfirm(row, mode, id), row)
PATCH_RESULT=true
PATCH_REASON=patched
AFTER_V10GC2B_COUNT=0
AFTER_V10GC2F_COUNT=0
AFTER_V10GC2H_COUNT=0
AFTER_V10GC2I_COUNT=0
AFTER_V10GC2J_COUNT=0
AFTER_V10GC2L_COUNT=0
AFTER_V10GC3E_COUNT=0
AFTER_V10GC3G_COUNT=2
AFTER_RENDERCONFIRM_WRAP_COUNT=1
AFTER_CANONICAL_ACTION_COUNT=2
AFTER_OWNER_ATTR_COUNT=2
AFTER_REVIEWER_ATTR_COUNT=2
AFTER_REVIEW_ITEM_ATTR_COUNT=2
AFTER_FIXED_OWNER_FALLBACK_COUNT_IN_V10GC3G_BLOCK=0
PATCH_DECISION=PATCH_APPLIED

============================================================
5. syntax postcheck
============================================================
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js:12681
    function aicmR8zV10gc3gInsertReviewDecisionAction(renderConfirm(row, mode, id), row) {
                                                                   ^

SyntaxError: Unexpected token '('
    at wrapSafe (node:internal/modules/cjs/loader:1743:18)
    at checkSyntax (node:internal/main/check_syntax:76:3)

Node.js v24.14.1
FAIL: syntax failed; rollback core
FINAL_JUDGEMENT=V10GC3G_CORE_PATCH_SYNTAX_FAILED_ROLLED_BACK
logout
