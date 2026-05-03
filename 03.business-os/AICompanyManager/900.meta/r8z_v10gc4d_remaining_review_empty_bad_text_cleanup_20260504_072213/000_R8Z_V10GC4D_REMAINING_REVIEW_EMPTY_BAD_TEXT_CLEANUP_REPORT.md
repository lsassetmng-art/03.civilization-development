============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- pending 0件時の空表示

現在位置:
- V10GC4Bで pending only はOK
- V10GC4Cで空表示修正を入れたが、旧文言が1件残った
- BAD_EMPTY_TEXT_COUNT=1
- served側にも1件残っている

今回:
1. core/server syntax確認
2. core backup
3. 残っている「レビュー待ちが取得できません」の位置を抽出
4. 旧文言を「レビュー・承認待ちはありません」へ置換
5. 近傍の赤枠/エラー調 style があれば通常カード寄りへ修正
6. syntax確認
7. server再起動
8. served coreでも旧文言0を確認
9. ブラウザ起動

禁止:
- DB write
- API POST
- server patch
- 課長送信機能への混在修正

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4d_remaining_review_empty_bad_text_cleanup_20260504_072213
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4d_remaining_review_empty_bad_text_cleanup_20260504_072213/aicm-production-core.before_v10gc4d.js

============================================================
4. extract bad text before
============================================================
12232-      var currentId = selectedReviewId(appState);
12233-
12234-      var debug = [
12235-        "V10D2",
12236-        "selectedCompanyId=" + companyId(appState),
12237-        "owner=" + ownerId(appState),
12238-        "rows=" + String(r.length),
12239-        "payloadRows=" + String(appState.aicmR8zV10d2PayloadRows !== undefined ? appState.aicmR8zV10d2PayloadRows : "na"),
12240-        "http=" + String(appState.aicmR8zV10d2HttpStatus !== undefined ? appState.aicmR8zV10d2HttpStatus : "na"),
12241-        "status=" + t(appState.aicmR8zV10d2FetchStatus || "context"),
12242-        currentId ? "selectedReviewId=" + currentId : "",
12243-        appState.aicmR8zV10d2Error ? "error=" + t(appState.aicmR8zV10d2Error) : ""
12244-      ].filter(Boolean).join(" / ");
12245-
12246-      var body = [
12247-        '<section class="aicm-core-card">',
12248-        '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
12249-        '  <h2>レビュー・承認待ち: ' + esc(String(r.length)) + '件</h2>',
12250-        '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
12251-        '  <p class="aicm-selected-note">「成果物を確認」を押すと、その項目の直下に詳細カードを表示します。</p>',
12252-        '</section>',
12253-        r.length
12254-          ? r.map(function(row, index) { return renderListRow(appState, row, index, currentId); }).join("")
12255-          : [
12256-              '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
12257:              '  <h3>レビュー待ちが取得できません</h3>',
12258-              '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
12259-              '</section>'
12260-            ].join("")
12261-      ].join("");
12262-
12263-      if (typeof renderShell === "function") return renderShell(body);
12264-      return body;
12265-    }
12266-
12267-    function rerenderAndScroll(id) {
12268-      try {
12269-        if (typeof render === "function") render();
12270-        else if (typeof window !== "undefined" && typeof window.aicmRender === "function") window.aicmRender();
12271-      } catch (_) {}
12272-
12273-      if (!id || typeof document === "undefined") return;
12274-
12275-      setTimeout(function() {
12276-        try {
12277-          var el = document.getElementById("aicm-v10d2-detail-" + id);
12278-          if (el && typeof el.scrollIntoView === "function") {
12279-            el.scrollIntoView({ behavior: "smooth", block: "start" });
12280-          }
12281-        } catch (_) {}
12282-      }, 80);

============================================================
5. patch remaining bad text
============================================================
REMOVED_AICM_R8Z_V10GC4D_REMAINING_REVIEW_EMPTY_BAD_TEXT_CLEANUP=false

BEFORE_BAD_TEXT_COUNT=1
BEFORE_GOOD_TEXT_COUNT=5
BEFORE_V10GC4D_MARKER_COUNT=0
AFTER_BAD_TEXT_COUNT=0
AFTER_GOOD_TEXT_COUNT=7
AFTER_V10GC4D_MARKER_COUNT=2
PATCH_CHANGED=true
PATCH_DECISION=PATCH_APPLIED

============================================================
6. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
7. extract bad text after
============================================================

============================================================
8. verify
============================================================
BAD_EMPTY_TEXT_COUNT=0
GOOD_EMPTY_TEXT_COUNT=7
V10GC4D_MARKER_COUNT=2
V10GC4C_MARKER_COUNT=2
V10GC4B_MARKER_COUNT=3
V10GC3I_MARKER_COUNT=2
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
9. restart server
============================================================

============================================================
10. final
============================================================
FINAL_JUDGEMENT=V10GC4D_REMAINING_EMPTY_BAD_TEXT_CLEANUP_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
CONTEXT_HTTP=200
BAD_EMPTY_TEXT_COUNT=0
GOOD_EMPTY_TEXT_COUNT=7
V10GC4D_MARKER_COUNT=2
V10GC4C_MARKER_COUNT=2
V10GC4B_MARKER_COUNT=3
V10GC3I_MARKER_COUNT=2
SERVED_BAD_EMPTY_TEXT_COUNT=0
SERVED_GOOD_EMPTY_TEXT_COUNT=7
SERVED_V10GC4D_MARKER_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc4d_20260504_072213
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4d_remaining_review_empty_bad_text_cleanup_20260504_072213/000_R8Z_V10GC4D_REMAINING_REVIEW_EMPTY_BAD_TEXT_CLEANUP_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4d_remaining_review_empty_bad_text_cleanup_20260504_072213/aicm-production-core.before_v10gc4d.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4d_remaining_review_empty_bad_text_cleanup_20260504_072213/020_patch_analysis.txt
BAD_TEXT_EXTRACT_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4d_remaining_review_empty_bad_text_cleanup_20260504_072213/080_bad_text_extract_before.txt
BAD_TEXT_EXTRACT_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4d_remaining_review_empty_bad_text_cleanup_20260504_072213/090_bad_text_extract_after.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. レビュー・承認待ち: 0件
3. 「レビュー待ちが取得できません」が消えていること
4. 赤枠エラー調カードが消えていること
5. 空状態として自然な表示になっていること
6. OKなら git checkpoint

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4d_remaining_review_empty_bad_text_cleanup_20260504_072213/aicm-production-core.before_v10gc4d.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
