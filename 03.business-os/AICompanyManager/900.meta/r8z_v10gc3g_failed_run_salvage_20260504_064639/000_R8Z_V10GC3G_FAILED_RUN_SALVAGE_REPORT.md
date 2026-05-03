============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- V10GC3G 実行失敗の原因確認

現在位置:
- V10GC3F audit PASS
- V10GC3G 本パッチ実行で code 1
- ここでは追加patchせず、失敗点とcore現状態を確認する

今回:
1. 最新V10GC3G実行ディレクトリを特定
2. report / patch log / patch analysis / verify を回収
3. core/server syntaxを確認
4. 現coreのmarker残存を確認
5. rollback済みか、途中patch済みか、安全停止か分類

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
LATEST_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524
LATEST_REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/000_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH_REPORT.md
PATCH_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/010_patch_core.log
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/020_patch_analysis.txt
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/030_verify.txt
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/aicm-production-core.before_v10gc3g.js
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. syntax current
============================================================
CORE_SYNTAX=OK
SERVER_SYNTAX=OK

============================================================
3. latest report tail
============================================================
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

============================================================
4. patch log
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

============================================================
5. patch analysis
============================================================
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
6. verify if exists
============================================================
VERIFY_NOT_FOUND

============================================================
7. current core marker/state scan
============================================================
V10GC2B_MARKER_COUNT=2
V10GC2F_MARKER_COUNT=0
V10GC2H_MARKER_COUNT=0
V10GC2I_MARKER_COUNT=0
V10GC2J_MARKER_COUNT=2
V10GC2L_MARKER_COUNT=0
V10GC3E_MARKER_COUNT=0
V10GC3G_MARKER_COUNT=0
RENDERCONFIRM_WRAP_COUNT=0
grep: warning: stray \ before "
grep: warning: stray \ before "
CANONICAL_ACTION_COUNT=0
OWNER_ATTR_COUNT=2
REVIEWER_ATTR_COUNT=2
REVIEW_ITEM_ATTR_COUNT=10
FIXED_OWNER_FALLBACK_COUNT=23

============================================================
8. classification
============================================================
FINAL_JUDGEMENT=V10GC3G_FAILED_BEFORE_PATCH_CORE_UNCHANGED
NEXT_ACTION=REVIEW_PATCH_ANALYSIS
CORE_SYNTAX_RESULT=OK
PATCH_DECISION=PATCH_APPLIED
PATCH_RESULT=true
PATCH_REASON=patched
RENDERCONFIRM_CALL_MATCH_COUNT=1
ROW_VAR_SELECTED=row
V10GC3G_MARKER_COUNT=0
V10GC2J_MARKER_COUNT=2
RENDERCONFIRM_WRAP_COUNT=0
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_failed_run_salvage_20260504_064639/000_R8Z_V10GC3G_FAILED_RUN_SALVAGE_REPORT.md
LATEST_REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/000_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH_REPORT.md
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/020_patch_analysis.txt
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/aicm-production-core.before_v10gc3g.js
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO
