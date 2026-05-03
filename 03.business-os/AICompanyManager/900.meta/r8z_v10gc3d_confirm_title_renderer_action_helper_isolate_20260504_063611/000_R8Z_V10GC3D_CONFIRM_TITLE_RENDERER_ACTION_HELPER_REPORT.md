============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し確認カード

現在位置:
- V10GC3Cで、V10GC2系ブロックを除外すると「承認を実行する」系文言は消える
- ただし「承認前の最終確認」「差し戻し前の最終確認」は残る
- つまり確認タイトルと実行ボタン生成元が分離している
- 次は確認タイトルrendererから、action/helper/state生成元を特定する

今回:
1. core/server syntax確認
2. core本体は変更せず、一時coreからV10GC系ブロックを除外
3. 「承認前の最終確認」「差し戻し前の最終確認」を含む関数を抽出
4. その関数内/周辺の action / button / disabled / data-core-action / render helper を抽出
5. 実行ボタン生成元が関数内か共通helperか分類する

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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3d_confirm_title_renderer_action_helper_isolate_20260504_063611
TEMP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3d_confirm_title_renderer_action_helper_isolate_20260504_063611/010_core_without_v10gc_patch_blocks.js
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. strip V10GC patch blocks into temp
============================================================
============================================================
4. title renderer scan
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

---- temp counts ----
TEMP_COUNT_承認前の最終確認=1
TEMP_COUNT_差し戻し前の最終確認=1
TEMP_COUNT_承認確認へ進む=3
TEMP_COUNT_差し戻し確認へ進む=3
TEMP_COUNT_承認を実行=0
TEMP_COUNT_差し戻しを実行=0
TEMP_COUNT_button=380
TEMP_COUNT_<button=114
TEMP_COUNT_disabled=5
TEMP_COUNT_data-core-action=132
TEMP_COUNT_review=546
TEMP_COUNT_confirm=69
TEMP_COUNT_action=342
TEMP_COUNT_owner_civilization_id=125
TEMP_COUNT_human_reviewer_label=2
TEMP_COUNT_aicm_human_review_item_id=11

============================================================
LABEL=承認前の最終確認
============================================================
FOUND=true
LABEL_LINE=12683
FUNCTION_HEADER=function renderConfirm(row, mode, id) {
FUNCTION_START_LINE=12681
FUNCTION_END_LINE=12715
FUNCTION_LENGTH=1806
FUNCTION_STATS_BEGIN
承認前の最終確認=1
差し戻し前の最終確認=1
承認確認へ進む=0
差し戻し確認へ進む=0
承認を実行=0
差し戻しを実行=0
button=6
<button=2
disabled=1
data-core-action=1
data-review=1
owner_civilization_id=0
human_reviewer_label=0
aicm_human_review_item_id=0
review=4
confirm=1
action=2
actions=0
render=1
join=1
map=0
FUNCTION_STATS_END
FUNCTION_CALLS=field,renderConfirm

---- function extract ----
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
LABEL=差し戻し前の最終確認
============================================================
FOUND=true
LABEL_LINE=12683
FUNCTION_HEADER=function renderConfirm(row, mode, id) {
FUNCTION_START_LINE=12681
FUNCTION_END_LINE=12715
FUNCTION_LENGTH=1806
FUNCTION_STATS_BEGIN
承認前の最終確認=1
差し戻し前の最終確認=1
承認確認へ進む=0
差し戻し確認へ進む=0
承認を実行=0
差し戻しを実行=0
button=6
<button=2
disabled=1
data-core-action=1
data-review=1
owner_civilization_id=0
human_reviewer_label=0
aicm_human_review_item_id=0
review=4
confirm=1
action=2
actions=0
render=1
join=1
map=0
FUNCTION_STATS_END
FUNCTION_CALLS=field,renderConfirm

---- function extract ----
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
5. helper scan
============================================================
FUNCTION_CALLS_FROM_CONFIRM_TITLES=field,renderConfirm
HELPER_CANDIDATES=renderConfirm

============================================================
HELPER=renderConfirm
============================================================
FOUND=true
FUNCTION_HEADER=function removeExistingConfirm() {
FUNCTION_START_LINE=12672
FUNCTION_END_LINE=12679
FUNCTION_STATS_BEGIN
承認前の最終確認=0
差し戻し前の最終確認=0
承認確認へ進む=0
差し戻し確認へ進む=0
承認を実行=0
差し戻しを実行=0
button=0
<button=0
disabled=0
data-core-action=0
data-review=0
owner_civilization_id=0
human_reviewer_label=0
aicm_human_review_item_id=0
review=0
confirm=1
action=0
actions=0
render=0
join=0
map=0
FUNCTION_STATS_END
---- helper extract ----
function removeExistingConfirm() {
      if (typeof document === "undefined") return;

      var nodes = document.querySelectorAll('[data-aicm-v10f-confirm="true"]');
      for (var i = 0; i < nodes.length; i += 1) {
        if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
      }
    }

============================================================
6. classification
============================================================
FINAL_JUDGEMENT=V10GC3D_CONFIRM_RENDERER_FOUND_HELPER_CANDIDATES_READY
NEXT_ACTION=PATCH_CONFIRM_RENDERER_AND_HELPER_CANONICALLY
TEMP_CONFIRM_APPROVE=1
TEMP_CONFIRM_RETURN=1
TEMP_EXEC_APPROVE=0
TEMP_EXEC_RETURN=0
TEMP_BUTTON_COUNT=114
TEMP_DISABLED_COUNT=5
FUNCTION_CALLS=field,renderConfirm
HELPER_CANDIDATES=renderConfirm
TEMP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3d_confirm_title_renderer_action_helper_isolate_20260504_063611/010_core_without_v10gc_patch_blocks.js
TITLE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3d_confirm_title_renderer_action_helper_isolate_20260504_063611/020_confirm_title_renderer_scan.txt
HELPER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3d_confirm_title_renderer_action_helper_isolate_20260504_063611/030_action_helper_scan.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3d_confirm_title_renderer_action_helper_isolate_20260504_063611/040_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3d_confirm_title_renderer_action_helper_isolate_20260504_063611/000_R8Z_V10GC3D_CONFIRM_TITLE_RENDERER_ACTION_HELPER_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
