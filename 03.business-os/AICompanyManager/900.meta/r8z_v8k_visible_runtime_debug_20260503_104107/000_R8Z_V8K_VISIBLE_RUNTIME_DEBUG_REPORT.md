
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- DB/server/context API 正常
- context review_wait_items=2
- browser asset cache問題なし
- V8G/V8H marker は active V7 hydrate 内に存在
- それでも画面は rows=0 / hydrating=YES

今回の作業:
1. core/server syntax確認
2. core backup
3. V7 hydrateに runtime debug 値をセット
4. V7 render debug表示に runtime debug を追加
5. core node --check
6. context API review_wait_items=2 維持確認
7. served core一致確認
8. ブラウザで debug値を見る

禁止:
- DB write
- API POST
- server patch
- render関数丸ごと置換
- 既存DB/API変更

============================================================
1. ENV
============================================================
PHASE=R8Z-V8K visible runtime debug for active V7 hydrate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8k_visible_runtime_debug_20260503_104107
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
PASS: core exists
PASS: server exists

============================================================
2. precheck syntax
============================================================
PASS: precheck core syntax PASS
PASS: precheck server syntax PASS

============================================================
3. backup core
============================================================
PASS: core backup created: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8k_visible_runtime_debug_20260503_104107/aicm-production-core.before_r8z_v8k.js

============================================================
4. patch visible runtime debug
============================================================
WARN: catch hydration error needle not found; skip catch debug
PATCH_APPLIED: visible V8K runtime debug inserted
PASS: V8K visible debug patch applied

============================================================
5. post-patch syntax
============================================================
PASS: post-patch core syntax PASS
PASS: server unchanged syntax PASS

============================================================
6. marker/snippet
============================================================
V8K_MARKER_COUNT=4
9541-        state.context.owner_civilization_id = payload.owner_civilization_id;
9542-        state.owner_civilization_id = payload.owner_civilization_id;
9543-      }
9544-
9545-      if (payload.aicm_user_company_id) {
9546-        state.context.aicm_user_company_id = payload.aicm_user_company_id;
9547-        state.selectedCompanyId = payload.aicm_user_company_id;
9548-      }
9549-    }
9550-
9551-    appState.aicmR8zV8gReviewWaitItemsMergedCount = rows.length;
9552-    return rows;
9553-  }
9554-  // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper end
9555-
9556-    appState = appState || {};
9557-    if (appState.aicmR8zV7Hydrating) return;
9558-    if (rows(appState).length > 0) return;
9559-
9560-    var owner = ownerId(appState);
9561-    var company = companyId(appState);
9562-
9563-    if (!owner || !company || typeof fetch !== "function") {
9564-      appState.aicmR8zV7HydrationError = "missing owner/company owner=" + owner + " company=" + company;
9565-      return;
9566-    }
9567-
9568-    appState.aicmR8zV7Hydrating = true;
9569:    // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: runtime debug start
9570:    appState.aicmR8zV8kDebug = "fetch-start";
9571:    appState.aicmR8zV8kFetchStartedAt = new Date().toISOString();
9572:    appState.aicmR8zV8kOwner = owner;
9573:    appState.aicmR8zV8kCompany = company;
9574:    appState.aicmR8zV8kPayloadCount = -1;
9575:    appState.aicmR8zV8kMergedCount = -1;
9576:    appState.aicmR8zV8kError = "";
9577-    if (typeof state !== "undefined" && state && state !== appState) {
9578:      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9579:      state.aicmR8zV8kFetchStartedAt = appState.aicmR8zV8kFetchStartedAt;
9580:      state.aicmR8zV8kOwner = owner;
9581:      state.aicmR8zV8kCompany = company;
9582:      state.aicmR8zV8kPayloadCount = -1;
9583:      state.aicmR8zV8kMergedCount = -1;
9584:      state.aicmR8zV8kError = "";
9585-    }
9586:    // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: runtime debug end
9587-
9588-    var params = new URLSearchParams();
9589-    params.set("owner_civilization_id", owner);
9590-    params.set("aicm_user_company_id", company);
9591-    params.set("v", "r8z_v7_" + Date.now());
9592-
9593-    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
9594-      .then(function (res) {
9595-        return res.text().then(function (bodyText) {
9596-          var payload = {};
9597-          try {
9598-            payload = bodyText ? JSON.parse(bodyText) : {};
9599-          } catch (_error) {
9600-            payload = {};
9601-          }
9602-
9603-          // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: merge payload review_wait_items into appState/state
9604:          var aicmR8zV8kMergedRows = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
9605:          // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: payload/merge debug
9606-          try {
9607:            var aicmR8zV8kPayloadRows = [];
9608:            if (payload && Array.isArray(payload.review_wait_items)) aicmR8zV8kPayloadRows = payload.review_wait_items;
9609:            else if (payload && payload.context && Array.isArray(payload.context.review_wait_items)) aicmR8zV8kPayloadRows = payload.context.review_wait_items;
9610:            else if (payload && payload.data && Array.isArray(payload.data.review_wait_items)) aicmR8zV8kPayloadRows = payload.data.review_wait_items;
9611-
9612:            appState.aicmR8zV8kDebug = "payload-merged";
9613:            appState.aicmR8zV8kPayloadCount = aicmR8zV8kPayloadRows.length;
9614:            appState.aicmR8zV8kMergedCount = Array.isArray(aicmR8zV8kMergedRows) ? aicmR8zV8kMergedRows.length : -2;
9615:            appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
9616:            appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
9617:            appState.aicmR8zV8kMergedAt = new Date().toISOString();
9618-
9619-            if (typeof state !== "undefined" && state && state !== appState) {
9620:              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9621:              state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
9622:              state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
9623:              state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
9624:              state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
9625:              state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
9626-            }
9627-          } catch (_r8zV8kMergeDebugError) {}
9628-
9629-          // AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER: force finalizer and one-shot rerender after review_wait_items merge
9630-          try {
9631-            if (appState && typeof appState === "object") {
9632-              appState.aicmR8zV7Hydrating = false;
9633-              appState.aicmR8zV7HydrationError = "";
9634-            }
9635-
9636-            if (typeof state !== "undefined" && state && typeof state === "object") {
9637-              state.aicmR8zV7Hydrating = false;
9638-              state.aicmR8zV7HydrationError = "";
9639-
9640-              if (appState && appState.review_wait_items && Array.isArray(appState.review_wait_items)) {
9641-                state.review_wait_items = appState.review_wait_items;
9642-              }
9643-
9644-              if (appState && appState.context && typeof appState.context === "object") {
9645-                if (!state.context || typeof state.context !== "object") state.context = {};
9646-                state.context.review_wait_items = appState.context.review_wait_items || appState.review_wait_items || [];
9647-              }
9648-            }
9649-          } catch (_r8zV8hFinalizeError) {}
9650-
9651-          try {
9652-            setTimeout(function aicmR8zV8hReviewListRerender() {
9653-              try {
--
9680-      })
9681-      .finally(function () {
9682-        appState.aicmR8zV7Hydrating = false;
9683-        if (appState.screen === "review-list") rerender();
9684-      });
9685-  }
9686-
9687-  function statusLabel(row) {
9688-    var status = first(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
9689-    if (status === "pending") return "承認待ち";
9690-    if (status === "approved") return "承認済み";
9691-    if (status === "returned") return "差し戻し";
9692-    if (status === "archived") return "アーカイブ";
9693-    return status;
9694-  }
9695-
9696-  window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
9697-    appState = appState || {};
9698-    var list = rows(appState);
9699-
9700-    if (!list.length) hydrateIfNeeded(appState);
9701-
9702-    var debug = [
9703-      "selectedCompanyId=" + companyId(appState),
9704-      "owner=" + ownerId(appState),
9705-      "rows=" + String(list.length),
9706-      appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
9707-      appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : "",
9708:      // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: visible debug fields
9709:      "v8k=" + t(appState.aicmR8zV8kDebug || (typeof state !== "undefined" && state ? state.aicmR8zV8kDebug : "") || "none"),
9710:      "payload=" + String(appState.aicmR8zV8kPayloadCount !== undefined ? appState.aicmR8zV8kPayloadCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kPayloadCount !== undefined) ? state.aicmR8zV8kPayloadCount : "na")),
9711:      "merged=" + String(appState.aicmR8zV8kMergedCount !== undefined ? appState.aicmR8zV8kMergedCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kMergedCount !== undefined) ? state.aicmR8zV8kMergedCount : "na")),
9712:      "stRows=" + String(appState.aicmR8zV8kAfterMergeStateRows !== undefined ? appState.aicmR8zV8kAfterMergeStateRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeStateRows !== undefined) ? state.aicmR8zV8kAfterMergeStateRows : "na")),
9713:      "ctxRows=" + String(appState.aicmR8zV8kAfterMergeContextRows !== undefined ? appState.aicmR8zV8kAfterMergeContextRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeContextRows !== undefined) ? state.aicmR8zV8kAfterMergeContextRows : "na")),
9714:      appState.aicmR8zV8kError ? "v8kError=" + t(appState.aicmR8zV8kError) : ""
9715-    ].filter(Boolean).join(" / ");
9716-
9717-    var html = [
9718-      '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
9719-      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
9720-      '  <h2>納品サマリー確認</h2>',
9721-      '  <p class="aicm-selected-note">対象会社: <strong>' + esc(companyName(appState)) + '</strong></p>',
9722-      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + esc(String(list.length)) + '件</strong></p>',
9723-      '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'
9724-    ];
9725-
9726-    if (!list.length) {
9727-      html.push(
9728-        '  <article class="aicm-core-card">',
9729-        '    <strong>レビュー・承認待ちはありません</strong>',
9730-        '    <p>context反映待ちです。数秒後に再描画されます。</p>',
9731-        '  </article>',
9732-        '</section>'
9733-      );
9734-      return html.join("");
9735-    }
9736-
9737-    list.forEach(function (row, index) {
9738-      var id = first(row, ["aicm_human_review_item_id", "review_id", "id"], "");
9739-      var title = first(row, ["review_title", "title"], "レビュー項目");
9740-      var kind = first(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
9741-      var artifact = first(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
9742-      var priority = first(row, ["priority_label", "priority_code"], "-");
PASS: V8K marker exists

============================================================
7. context still OK
============================================================
CONTEXT_HTTP=200
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v8k_20260503_104107
result=ok
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true
PASS: context review_wait_items=2

============================================================
8. served core vs disk
============================================================
SERVED_HTTP=200
DISK_SHA=ef223c3e2a401eb19596a1f81963b1857a8b0e4b1c5778b7ad9361e5a3b2a5fb
SERVED_SHA=ef223c3e2a401eb19596a1f81963b1857a8b0e4b1c5778b7ad9361e5a3b2a5fb
PASS: served core matches disk

============================================================
9. FINAL
============================================================
REVIEW_COUNT=2
V8K_MARKER_COUNT=4
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v8k_20260503_104107
PASS_COUNT=11
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=VISIBLE_RUNTIME_DEBUG_READY_FOR_BROWSER_CHECK
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8k_visible_runtime_debug_20260503_104107/000_R8Z_V8K_VISIBLE_RUNTIME_DEBUG_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8k_visible_runtime_debug_20260503_104107/aicm-production-core.before_r8z_v8k.js
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8k_visible_runtime_debug_20260503_104107/050_core_v8k_debug_snip.txt
CONTEXT_PARSE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8k_visible_runtime_debug_20260503_104107/031_context_verify_parse.txt
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

BROWSER_CHECK:
1. 以下を開く:
   http://127.0.0.1:8794/?v=r8z_v8k_20260503_104107

2. 「レビュー・承認待ち一覧」を開く

追加で表示されるdebugを見る:
- v8k=fetch-start
  → fetch開始後に完了していない/thenへ入っていない

- v8k=payload-merged / payload=2 / merged=2 / stRows=2 / ctxRows=2
  → mergeは成功。rows()側または表示state側が別。

- v8k=fetch-error / v8kError=...
  → browser fetch error。

- v8k=none
  → V7 hydrateIfNeeded自体が実行されていない、または別rendererが表示している。

次分岐:
- payload=2 merged=2 なのに rows=0:
  rows(appState) の参照元/フィルタだけ修正。

- v8k=fetch-start のまま:
  fetch promiseが完了していない。URL/response/body処理のruntime問題を見る。

- v8k=none:
  表示中rendererが別。route bridge/renderer差し替えを再確認。
