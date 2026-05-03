============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し確認画面
- V10GC3E 本パッチ前 impact audit

現在位置:
- V10GC3Dで確認rendererが renderConfirm helper経由と判明
- V10GC3E案は「確認renderer内の return renderConfirm(...) だけ」を helper経由に差し替える方針
- ただし他機能影響を避けるため、先に対象範囲を audit する

今回:
1. core/server syntax確認
2. core本体は変更せず、一時coreをRUN_DIRに作成
3. 一時coreからV10GC系の後付けブロックを除外
4. 「承認前の最終確認」「差し戻し前の最終確認」を持つrenderer数を確認
5. そのrenderer内の return renderConfirm(...) 数を確認
6. row変数が一意に推定できるか確認
7. renderConfirm helper全体の利用箇所を確認
8. V10GC3E本パッチがレビュー確認画面だけに閉じるか分類

禁止:
- DB write
- API POST
- PATCH
- server restart
- core本体変更

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3e_impact_audit_before_patch_20260504_064149
TEMP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3e_impact_audit_before_patch_20260504_064149/010_core_without_v10gc_patch_blocks.js
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. impact audit
============================================================
============================================================
4. audit summary
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
ORIGINAL_V10GC2B_COUNT=2
ORIGINAL_V10GC2J_COUNT=2
TEMP_V10GC_PATCH_MARKER_COUNT=0
TEMP_CONFIRM_APPROVE_TITLE_COUNT=1
TEMP_CONFIRM_RETURN_TITLE_COUNT=1
TEMP_EXEC_APPROVE_LABEL_COUNT=0
TEMP_EXEC_RETURN_LABEL_COUNT=0
TEMP_RENDERCONFIRM_USAGE_COUNT=2
RENDERCONFIRM_HELPER_DEFINITION_COUNT=1
APPROVE_FN_FOUND=true
RETURN_FN_FOUND=true
SAME_CONFIRM_FUNCTION=true
UNIQUE_TARGET_FUNCTION_COUNT=1
TARGET_0_KIND=both
TARGET_0_HEADER=function renderConfirm(row, mode, id) {
TARGET_0_START_LINE=12681
TARGET_0_END_LINE=12715
TARGET_0_RETURN_RENDERCONFIRM_COUNT=0
TARGET_0_ROW_VAR_SELECTED=row
TARGET_0_ROW_VAR_CANDIDATES=row:4
TARGET_0_HAS_REVIEW_ID=true
TARGET_0_HAS_OWNER=false
TARGET_0_HAS_REVIEWER=false

============================================================
5. target renderer extract
============================================================

============================================================
TARGET_0_both
============================================================
HEADER=function renderConfirm(row, mode, id) {
START_LINE=12681
END_LINE=12715
function renderConfirm(row, mode, id) {
      var isApprove = mode === "approve";
      var title = isApprove ? "承認前の最終確認" : "差し戻し前の最終確認";
      var nextStatus = isApprove ? "approved" : "returned";
      var operation = isApprove ? "承認" : "差し戻し";
      var border = isApprove ? "#22c55e" : "#f97316";
      var bg = isApprove ? "#f0fdf4" : "#fff7ed";

      return [
        '<section class="aicm-core-card" style="border:3px solid ' + border + ';background:' + bg + ';">',
        '  <p class="aicm-eyebrow">V10F / DB更新前確認</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">まだDB更新は実行しません。次工程V10GでAPI rollback smokeを行ってから本実行します。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("操作予定", operation),
        field("status遷移予定", "pending → " + nextStatus),
        field("review_id", id),
        field("レビュー", row.review_title || row.title || "レビュー項目"),
        field("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        field("優先度", row.priority_code),
        field("依頼日時", row.requested_at || row.created_at),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        field("会社", row.company_name),
        '  </dl>',
        '  <div class="aicm-core-card" style="background:#ffffff;">',
        '    <p class="aicm-eyebrow">確認事項</p>',
        '    <p class="aicm-selected-note">成果物内容・AIレビュー・未解決事項を確認したうえで、次工程でDB更新を実行します。</p>',
        '  </div>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10f-cancel-confirm" data-review-id="' + esc(id) + '">確認を閉じる</button>',
        '    <button type="button" disabled title="V10Gで有効化予定">' + esc(operation) + 'を実行する（次工程）</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

============================================================
6. renderConfirm usage scan
============================================================
RENDERCONFIRM_USAGE_COUNT=2
RENDERCONFIRM_HELPER_DEFINITION_COUNT=1

---- renderConfirm usages ----
 12681: function renderConfirm(row, mode, id) {
 12787: wrap.innerHTML = renderConfirm(row, mode, id);

---- renderConfirm helper definitions ----

LINE=12681 HEADER=function renderConfirm(row, mode, id) {
function renderConfirm(row, mode, id) {
      var isApprove = mode === "approve";
      var title = isApprove ? "承認前の最終確認" : "差し戻し前の最終確認";
      var nextStatus = isApprove ? "approved" : "returned";
      var operation = isApprove ? "承認" : "差し戻し";
      var border = isApprove ? "#22c55e" : "#f97316";
      var bg = isApprove ? "#f0fdf4" : "#fff7ed";

      return [
        '<section class="aicm-core-card" style="border:3px solid ' + border + ';background:' + bg + ';">',
        '  <p class="aicm-eyebrow">V10F / DB更新前確認</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">まだDB更新は実行しません。次工程V10GでAPI rollback smokeを行ってから本実行します。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("操作予定", operation),
        field("status遷移予定", "pending → " + nextStatus),
        field("review_id", id),
        field("レビュー", row.review_title || row.title || "レビュー項目"),
        field("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        field("優先度", row.priority_code),
        field("依頼日時", row.requested_at || row.created_at),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        field("会社", row.company_name),
        '  </dl>',
        '  <div class="aicm-core-card" style="background:#ffffff;">',
        '    <p class="aicm-eyebrow">確認事項</p>',
        '    <p class="aicm-selected-note">成果物内容・AIレビュー・未解決事項を確認したうえで、次工程でDB更新を実行します。</p>',
        '  </div>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10f-cancel-confirm" data-review-id="' + esc(id) + '">確認を閉じる</button>',
        '    <button type="button" disabled title="V10Gで有効化予定">' + esc(operation) + 'を実行する（次工程）</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

============================================================
7. classification
============================================================
FINAL_JUDGEMENT=V10GC3E_IMPACT_AUDIT_REVIEW_REQUIRED
NEXT_ACTION=REVIEW_TARGET_EXTRACT_BEFORE_PATCH
WARN_COUNT=2
WARNINGS= RETURN_RENDERCONFIRM_COUNT_UNEXPECTED TARGET_HAS_NO_OWNER_REFERENCE
TEMP_V10GC_PATCH_MARKER_COUNT=0
APPROVE_FN_FOUND=true
RETURN_FN_FOUND=true
SAME_CONFIRM_FUNCTION=true
UNIQUE_TARGET_FUNCTION_COUNT=1
TARGET_0_RETURN_RENDERCONFIRM_COUNT=0
TARGET_0_ROW_VAR_SELECTED=row
TARGET_0_HAS_REVIEW_ID=true
TARGET_0_HAS_OWNER=false
TARGET_0_HAS_REVIEWER=false
TEMP_RENDERCONFIRM_USAGE_COUNT=2
RENDERCONFIRM_HELPER_DEFINITION_COUNT=1
AUDIT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3e_impact_audit_before_patch_20260504_064149/020_impact_audit_detail.txt
TARGET_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3e_impact_audit_before_patch_20260504_064149/030_target_confirm_renderer_extract.txt
RENDERCONFIRM_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3e_impact_audit_before_patch_20260504_064149/040_renderconfirm_usage_scan.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3e_impact_audit_before_patch_20260504_064149/050_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3e_impact_audit_before_patch_20260504_064149/000_R8Z_V10GC3E_IMPACT_AUDIT_BEFORE_PATCH_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO
