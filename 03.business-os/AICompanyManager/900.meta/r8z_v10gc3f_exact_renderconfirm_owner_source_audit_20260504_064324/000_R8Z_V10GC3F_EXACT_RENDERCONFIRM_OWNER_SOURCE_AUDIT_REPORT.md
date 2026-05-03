============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し確認画面
- V10GC3E本パッチ前の追加audit

現在位置:
- V10GC3E impact audit は REVIEW_REQUIRED
- 理由1: TARGET_0_RETURN_RENDERCONFIRM_COUNT=0
- 理由2: TARGET_0_HAS_OWNER=false
- つまり V10GC3E案の「return renderConfirm(...)置換」は現coreの実構造とズレている
- owner_civilization_id の正規取得元も確認が必要

今回:
1. DB pending item の owner_civilization_id をread-only確認
2. V10GC patch block除外済みtemp coreを作る
3. 確認renderer全文から renderConfirm の実呼び出し形を抽出
4. renderConfirm helper定義と使用箇所を抽出
5. row変数に owner_civilization_id を含む可能性があるかDB/view側で確認
6. 次パッチが以下のどれか分類
   - renderConfirm assignment patch
   - renderConfirm helper patch
   - ownerをrowから使うだけでOK
   - ownerをcontext/companyから補う必要あり

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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3f_exact_renderconfirm_owner_source_audit_20260504_064324
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. DB readonly owner check
============================================================
pending_table_count	2
pending_view_count	2
pending_view_sample	bc553839-ebca-4610-81e3-31dc21476a48 | owner=00000000-0000-4000-8000-000000000001 | company=8b9be487-7b74-4517-9b59-6c84a82ae6aa | status=pending | title=納品サマリー確認: AI企業業務開始導線の整備 作業
pending_view_sample	bd30bc28-c6d8-4fee-aebc-1311db979988 | owner=00000000-0000-4000-8000-000000000001 | company=8b9be487-7b74-4517-9b59-6c84a82ae6aa | status=pending | title=納品サマリー確認: Manager大項目台帳運用の整備 作業
view_has_owner_column	1

============================================================
4. exact source audit
============================================================
============================================================
5. exact confirm renderer source
============================================================
APPROVE_FN_FOUND=true
RETURN_FN_FOUND=true
SAME_CONFIRM_FUNCTION=true
TARGET_HEADER=function renderConfirm(row, mode, id) {
TARGET_START_LINE=12681
TARGET_END_LINE=12715
ROW_VAR_SELECTED=row
ROW_VAR_CANDIDATES=row:4
TARGET_HAS_OWNER_TEXT=false
TARGET_HAS_REVIEWER_TEXT=false
TARGET_RENDERCONFIRM_STATEMENT_COUNT=1
TARGET_RENDERCONFIRM_0_LOCAL_LINE=1
TARGET_RENDERCONFIRM_0_TEXT=function renderConfirm(row, mode, id) {

============================================================
TARGET_FUNCTION_EXTRACT
============================================================
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
6. renderConfirm helper source
============================================================
RENDERCONFIRM_HELPER_FOUND=true
RENDERCONFIRM_HELPER_HEADER=function renderConfirm(row, mode, id) {
RENDERCONFIRM_HELPER_START_LINE=12681
RENDERCONFIRM_HELPER_END_LINE=12715
RENDERCONFIRM_HELPER_HAS_BUTTON=true
RENDERCONFIRM_HELPER_HAS_ACTIONS=true

============================================================
RENDERCONFIRM_HELPER_EXTRACT
============================================================
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
FINAL_JUDGEMENT=V10GC3F_PATCH_CAN_USE_ROW_OWNER_FROM_VIEW_EVEN_IF_NOT_CURRENTLY_REFERENCED
NEXT_ACTION=PATCH_RENDERCONFIRM_CALL_ASSIGNMENT_WITH_ROW_OWNER_ATTRS
WARN_COUNT=0
WARNINGS=
PENDING_TABLE=2
PENDING_VIEW=2
VIEW_HAS_OWNER_COLUMN=1
TARGET_RENDERCONFIRM_STATEMENT_COUNT=1
ROW_VAR_SELECTED=row
TARGET_HAS_OWNER_TEXT=false
RENDERCONFIRM_HELPER_HAS_BUTTON=true
RENDERCONFIRM_HELPER_HAS_ACTIONS=true
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3f_exact_renderconfirm_owner_source_audit_20260504_064324/020_db_pending_owner_readonly.tsv
SOURCE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3f_exact_renderconfirm_owner_source_audit_20260504_064324/030_exact_confirm_renderer_source.txt
RENDER_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3f_exact_renderconfirm_owner_source_audit_20260504_064324/040_renderconfirm_exact_usage.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3f_exact_renderconfirm_owner_source_audit_20260504_064324/050_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3f_exact_renderconfirm_owner_source_audit_20260504_064324/000_R8Z_V10GC3F_EXACT_RENDERCONFIRM_OWNER_SOURCE_AUDIT_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO
