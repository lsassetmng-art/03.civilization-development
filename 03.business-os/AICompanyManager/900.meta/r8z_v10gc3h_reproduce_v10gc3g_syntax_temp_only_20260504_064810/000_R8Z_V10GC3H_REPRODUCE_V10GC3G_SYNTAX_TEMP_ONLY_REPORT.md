============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- V10GC3G syntax fail の原因追跡

現在位置:
- V10GC3G は patch生成後に syntax fail
- 自動rollback済み
- 現coreは syntax OK / V10GC3G未適用
- 次は本体coreを触らず、一時ファイル上で同じpatchを再現して syntax error位置を特定する

今回:
1. 最新V10GC3Gディレクトリを特定
2. backup core を temp にコピー
3. temp にだけ V10GC3G patch script を再実行
4. temp core を node --check
5. syntax error 行と前後を抽出
6. 次の正本修正方針を分類

禁止:
- DB write
- API POST
- core本体変更
- server restart

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
LATEST_V10GC3G_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524
PATCH_SCRIPT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/patch_core_v10gc3g.cjs
PATCH_ANALYSIS_OLD=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/020_patch_analysis.txt
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3g_exact_renderconfirm_call_patch_20260504_064524/aicm-production-core.before_v10gc3g.js
TEMP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3h_reproduce_v10gc3g_syntax_temp_only_20260504_064810/010_temp_core_repatch_v10gc3g.js
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3h_reproduce_v10gc3g_syntax_temp_only_20260504_064810
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. current core/server syntax
============================================================
CURRENT_CORE_SYNTAX=OK
SERVER_SYNTAX=OK

============================================================
3. copy backup to temp and reapply patch on temp only
============================================================
TEMP_PATCH_EXIT=0
---- temp patch log ----
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

---- temp patch analysis ----
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
4. temp syntax check
============================================================
TEMP_SYNTAX_EXIT=1
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3h_reproduce_v10gc3g_syntax_temp_only_20260504_064810/010_temp_core_repatch_v10gc3g.js:12681
    function aicmR8zV10gc3gInsertReviewDecisionAction(renderConfirm(row, mode, id), row) {
                                                                   ^

SyntaxError: Unexpected token '('
    at wrapSafe (node:internal/modules/cjs/loader:1743:18)
    at checkSyntax (node:internal/main/check_syntax:76:3)

Node.js v24.14.1

============================================================
5. syntax snippet
============================================================
SYNTAX_LINE=12681
      12646: 
      12647:     function reviewId(row) {
      12648:       return text(row && (
      12649:         row.aicm_human_review_item_id ||
      12650:         row.human_review_item_id ||
      12651:         row.review_id ||
      12652:         row.id ||
      12653:         ""
      12654:       ));
      12655:     }
      12656: 
      12657:     function findRowById(id) {
      12658:       id = text(id);
      12659:       var rows = fetchRows();
      12660: 
      12661:       for (var i = 0; i < rows.length; i += 1) {
      12662:         if (reviewId(rows[i]) === id) return rows[i];
      12663:       }
      12664: 
      12665:       return null;
      12666:     }
      12667: 
      12668:     function field(label, value) {
      12669:       return '<dt>' + esc(label) + '</dt><dd>' + esc(text(value) || "-") + '</dd>';
      12670:     }
      12671: 
      12672:     function removeExistingConfirm() {
      12673:       if (typeof document === "undefined") return;
      12674: 
      12675:       var nodes = document.querySelectorAll('[data-aicm-v10f-confirm="true"]');
      12676:       for (var i = 0; i < nodes.length; i += 1) {
      12677:         if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
      12678:       }
      12679:     }
      12680: 
 >>>  12681:     function aicmR8zV10gc3gInsertReviewDecisionAction(renderConfirm(row, mode, id), row) {
      12682:       var isApprove = mode === "approve";
      12683:       var title = isApprove ? "承認前の最終確認" : "差し戻し前の最終確認";
      12684:       var nextStatus = isApprove ? "approved" : "returned";
      12685:       var operation = isApprove ? "承認" : "差し戻し";
      12686:       var border = isApprove ? "#22c55e" : "#f97316";
      12687:       var bg = isApprove ? "#f0fdf4" : "#fff7ed";
      12688: 
      12689:       return [
      12690:         '<section class="aicm-core-card" style="border:3px solid ' + border + ';background:' + bg + ';">',
      12691:         '  <p class="aicm-eyebrow">V10F / DB更新前確認</p>',
      12692:         '  <h2>' + esc(title) + '</h2>',
      12693:         '  <p class="aicm-selected-note">まだDB更新は実行しません。次工程V10GでAPI rollback smokeを行ってから本実行します。</p>',
      12694:         '  <dl class="aicm-core-detail-list">',
      12695:         field("操作予定", operation),
      12696:         field("status遷移予定", "pending → " + nextStatus),
      12697:         field("review_id", id),
      12698:         field("レビュー", row.review_title || row.title || "レビュー項目"),
      12699:         field("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
      12700:         field("優先度", row.priority_code),
      12701:         field("依頼日時", row.requested_at || row.created_at),
      12702:         field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
      12703:         field("会社", row.company_name),
      12704:         '  </dl>',
      12705:         '  <div class="aicm-core-card" style="background:#ffffff;">',
      12706:         '    <p class="aicm-eyebrow">確認事項</p>',
      12707:         '    <p class="aicm-selected-note">成果物内容・AIレビュー・未解決事項を確認したうえで、次工程でDB更新を実行します。</p>',
      12708:         '  </div>',
      12709:         '  <div class="aicm-dashboard-action-row">',
      12710:         '    <button type="button" data-core-action="review-v10f-cancel-confirm" data-review-id="' + esc(id) + '">確認を閉じる</button>',
      12711:         '    <button type="button" disabled title="V10Gで有効化予定">' + esc(operation) + 'を実行する（次工程）</button>',
      12712:         '  </div>',
      12713:         '</section>'
      12714:       ].join("");
      12715:     }
      12716: 

============================================================
renderConfirm wrap hits
============================================================
 12681:     function aicmR8zV10gc3gInsertReviewDecisionAction(renderConfirm(row, mode, id), row) {
 12787:       wrap.innerHTML = renderConfirm(row, mode, id);
 13232: // AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH_START
 13233: // Canonical review decision patch through the confirmed single renderConfirm(...) call.
 13309: function aicmR8zV10gc3gInsertReviewDecisionAction(html, row) {
 13491: // AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH_END

============================================================
6. classification
============================================================
FINAL_JUDGEMENT=V10GC3H_SYNTAX_CAUSE_UNEXPECTED_TOKEN_IN_PATCHED_RENDERCONFIRM
NEXT_ACTION=PATCH_RENDERCONFIRM_ASSIGNMENT_SHAPE_NOT_RAW_CALL
TEMP_PATCH_EXIT=0
TEMP_SYNTAX_EXIT=1
PATCH_DECISION=PATCH_APPLIED
PATCH_REASON=patched
RENDERCONFIRM_CALL_MATCH_COUNT=1
ROW_VAR_SELECTED=row
SYNTAX_LINE=12681
TEMP_MARKER_COUNT=2
TEMP_WRAP_COUNT=1
CURRENT_V10GC3G_MARKER_COUNT=0
CURRENT_V10GC2J_MARKER_COUNT=2
TEMP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3h_reproduce_v10gc3g_syntax_temp_only_20260504_064810/010_temp_core_repatch_v10gc3g.js
TEMP_PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3h_reproduce_v10gc3g_syntax_temp_only_20260504_064810/030_temp_patch_analysis.txt
TEMP_SYNTAX_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3h_reproduce_v10gc3g_syntax_temp_only_20260504_064810/040_temp_syntax.out
TEMP_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3h_reproduce_v10gc3g_syntax_temp_only_20260504_064810/050_temp_syntax_snip.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3h_reproduce_v10gc3g_syntax_temp_only_20260504_064810/000_R8Z_V10GC3H_REPRODUCE_V10GC3G_SYNTAX_TEMP_ONLY_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO
