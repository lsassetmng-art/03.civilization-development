============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー待ち2件表示 OK
- 成果物を確認ボタンはある
- ただし詳細カードが表示されない
- 原因候補:
  1. V10D2 renderer が実際には使われていない
  2. ボタンactionが review-v10d-open-detail のままで、V10D2 bridge対象外
  3. click bridge が後段の既存handlerに潰されている
  4. stateには selectedReviewId が入るが render が別rendererに戻している
  5. ブラウザが古いasset/古いtabを見ている

今回:
1. server/core syntax確認
2. server到達確認
3. served core = disk core確認
4. V10C/V10D/V10D2 marker確認
5. review-list renderer上書き順を確認
6. ボタンaction名を確認
7. click bridge定義を確認
8. context API 2件確認
9. 次に必要な最小修正だけ判定

禁止:
- DB write
- API POST
- PATCH

============================================================
1. ENV
============================================================
PHASE=R8Z-V10D3 artifact detail runtime/click isolate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d3_artifact_detail_runtime_click_isolate_20260503_203727
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. server reachability
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=acd4f6a782dfaabe77c50ca8c07d91d0018363b666e2fd3a9431a1c005be134b
SERVED_SHA=acd4f6a782dfaabe77c50ca8c07d91d0018363b666e2fd3a9431a1c005be134b
PASS: served core matches disk

============================================================
4. context API
============================================================
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v10d3_20260503_203727

============================================================
5. marker / renderer / action scan
============================================================
---- marker counts ----
AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER=2
AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD=2
AICM_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_UNDER_ROW=2
AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE=3

---- served marker counts ----
SERVED_AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER=2
SERVED_AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD=2
SERVED_AICM_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_UNDER_ROW=2

---- renderer override lines ----
10894:window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
11277:      window.aicmR8zV7RenderReviewList = v10cRenderReviewList;
11762:      window.aicmR8zV7RenderReviewList = renderReviewList;
12229:      window.aicmR8zV7RenderReviewList = renderReviewList;

---- renderer function lines ----
11226:    function v10cRenderReviewList(appState) {
11643:    function renderReviewList(appState) {
12108:    function renderReviewList(appState) {

---- review route call ----
8340-    } else if (state.screen === "section-edit") {
8341-      html = renderSectionEditPlaceholder();
8342-    } else if (state.screen === "ai-business-start") {
8343-      html = renderAicmBusinessStartScreen();
8344-    } else if (state.screen === "task-ledger") {
8345-      html = renderTaskLedgerPlaceholder();
8346:    } else if (state.screen === "review-list") {
8347:      html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL
8348-    } else {
8349-      html = renderDashboard();
8350-    }
8351-
8352-    
8353-    // AICM_COMPANY_EDIT_RENDER_ROUTE_ASS_ASV
--
10024-      })
10025-      .catch(function (error) {
10026-        state.aicmR8zV5dHydrationError = String(error && error.message ? error.message : error);
10027-      })
10028-      .finally(function () {
10029-        state.aicmR8zV5dHydrating = false;
10030:        if (state.screen === "review-list") {
10031-          r8zV5dRenderAgain();
10032-        }
10033-      });
10034-  }
10035-
10036-  function r8zV5dStatusLabel(row) {
--
10714-      if (typeof root === "undefined" || !root) {
10715-        appState.aicmR8zV8kDebug = "v9-local-root-missing";
10716-        appState.aicmR8zV8kError = "root is unavailable";
10717-        return;
10718-      }
10719-
10720:      if (typeof window === "undefined" || typeof window.aicmR8zV7RenderReviewList !== "function") {
10721-        appState.aicmR8zV8kDebug = "v9-local-renderer-missing";
10722:        appState.aicmR8zV8kError = "aicmR8zV7RenderReviewList is unavailable";
10723-        return;
10724-      }
10725-
10726-      appState.screen = "review-list";
10727-      appState.aicmR8zV8kDebug = "v9-local-render-start";
10728-
10729:      root.innerHTML = window.aicmR8zV7RenderReviewList(appState);
10730-
10731-      appState.aicmR8zV8kDebug = "v9-local-render-done";
10732-      appState.aicmR8zV8kError = "";
10733-    } catch (error) {
10734-      try {
10735-        if (typeof state !== "undefined" && state) {
--
10888-    };
10889-
10890-    document.body.appendChild(script);
10891-  }
10892-  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper end
10893-
10894:window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
10895-    appState = appState || {};
10896-    var list = rows(appState);
10897-
10898-    if (!list.length && typeof aicmR8zV9ReviewListScriptHydrate === "function") aicmR8zV9ReviewListScriptHydrate(appState);
10899-    if (!list.length) hydrateIfNeeded(appState);
10900-
--
11271-
11272-      return body;
11273-    }
11274-
11275-    if (typeof window !== "undefined") {
11276-      window.aicmR8zV10cRenderReviewList = v10cRenderReviewList;
11277:      window.aicmR8zV7RenderReviewList = v10cRenderReviewList;
11278-    }
11279-  })();
11280-  // AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER_END
11281-
11282-  // AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD_START
11283-  // Review artifact detail card. Scope: review-list only. No DB write / no API POST.
--
11756-    }
11757-
11758-    installClickBridge();
11759-
11760-    if (typeof window !== "undefined") {
11761-      window.aicmR8zV10dRenderReviewList = renderReviewList;
11762:      window.aicmR8zV7RenderReviewList = renderReviewList;
11763-    }
11764-  })();
11765-  // AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD_END
11766-
11767-  // AICM_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_UNDER_ROW_START
11768-  // V10D2: show artifact detail inline directly under the clicked review row.
--
12223-    }
12224-
12225-    installClickBridge();
12226-
12227-    if (typeof window !== "undefined") {
12228-      window.aicmR8zV10d2RenderReviewList = renderReviewList;
12229:      window.aicmR8zV7RenderReviewList = renderReviewList;
12230-    }
12231-  })();
12232-  // AICM_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_UNDER_ROW_END
12233-
12234-
12235-

---- V10D/V10D2 button action lines ----
11637:        '    <button type="button" data-core-action="review-v10d-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
11670:        '  <p class="aicm-selected-note">成果物を確認してから、次工程で承認/差し戻しを行います。</p>',
11750:        if (action === "review-v10d-open-detail") return setDetail(id);
12101:        '    <button type="button" data-core-action="review-v10d2-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
12133:        '  <p class="aicm-selected-note">「成果物を確認」を押すと、その項目の直下に詳細カードを表示します。</p>',
12217:        if (action === "review-v10d2-open-detail") return setDetail(id);

---- served V10D/V10D2 button action lines ----
11637:        '    <button type="button" data-core-action="review-v10d-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
11670:        '  <p class="aicm-selected-note">成果物を確認してから、次工程で承認/差し戻しを行います。</p>',
11750:        if (action === "review-v10d-open-detail") return setDetail(id);
12101:        '    <button type="button" data-core-action="review-v10d2-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
12133:        '  <p class="aicm-selected-note">「成果物を確認」を押すと、その項目の直下に詳細カードを表示します。</p>',
12217:        if (action === "review-v10d2-open-detail") return setDetail(id);

---- click bridge lines ----
6781-}
6782-
6783-(function aicmInstallR8zV9g5DeleteConfirmExecuteBridge() {
6784-  try {
6785-    if (typeof document !== "undefined" && document.addEventListener && typeof window !== "undefined") {
6786-      if (!window.__aicmR8zV9g5DeleteConfirmExecuteBridgeInstalled) {
6787-        window.__aicmR8zV9g5DeleteConfirmExecuteBridgeInstalled = true;
6788-
6789:        document.addEventListener("click", function aicmR8zV9g5DeleteConfirmClickBridge(ev) {
6790-          try {
6791-            var target = ev && ev.target;
6792-            var btn = target && typeof target.closest === "function"
6793-              ? target.closest("[data-core-action], button")
6794-              : null;
6795-
6796-            if (!btn || !btn.getAttribute) return;
6797-
--
7137-      wrappedTaskLedgerPlaceholderR8zV9f4b.__r8zV9f4bOriginal = originalTaskLedgerPlaceholderR8zV9f4b;
7138-      renderTaskLedgerPlaceholder = wrappedTaskLedgerPlaceholderR8zV9f4b;
7139-    }
7140-
7141-    if (typeof document !== "undefined" && document.addEventListener && typeof window !== "undefined") {
7142-      if (!window.__aicmR8zV9f4bLeaderHandoffClickBridgeInstalled) {
7143-        window.__aicmR8zV9f4bLeaderHandoffClickBridgeInstalled = true;
7144-
7145:        document.addEventListener("click", function aicmR8zV9f4bLeaderHandoffClickBridge(ev) {
7146-          try {
7147-            var target = ev && ev.target;
7148-            var btn = target && typeof target.closest === "function"
7149-              ? target.closest("[data-core-action]")
7150-              : null;
7151-
7152-            if (!btn || !btn.getAttribute) return;
7153-
--
9798-    injectMinimalCss();
9799-
9800-      root.addEventListener("change", function (event) {
9801-    var target = event.target;
9802-    if (target && target.getAttribute && target.getAttribute("data-core-file") === "task-ledger-csv") {
9803-      readTaskLedgerCsvFile(target.files && target.files[0]);
9804-    }
9805-  });
9806:root.addEventListener("click", handleRootClick);
9807-    root.addEventListener("change", handleRootChange);
9808-    root.addEventListener("submit", handleRootSubmit);
9809-
9810-    writeStorage(STORAGE.ownerCivilizationId, state.ownerCivilizationId);
9811-
9812-    render();
9813-    loadContext();
9814-  }
--
11569-        renderTextSection("AIレビュー結果", row.ai_review_result_text),
11570-        renderTextSection("未解決事項", row.unresolved_issues_text),
11571-        nestedOutputs(row),
11572-        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
11573-        '  <p class="aicm-eyebrow">次工程</p>',
11574-        '  <h3>承認/差し戻しへ進む前の確認</h3>',
11575-        '  <p class="aicm-selected-note">V10DではまだDB更新しません。次のV10Eでrollback smokeを行います。</p>',
11576-        '  <div class="aicm-dashboard-action-row">',
11577:        '    <button type="button" data-core-action="review-v10d-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
11578:        '    <button type="button" data-core-action="review-v10d-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
11579:        '    <button type="button" data-core-action="review-v10d-close-detail">一覧へ戻る</button>',
11580-        '  </div>',
11581-        '</section>',
11582-        '<section class="aicm-core-card" style="background:#f8fafc;">',
11583-        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
11584-        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3200)) + '</pre>',
11585-        '</section>'
11586-      ].join("");
11587-    }
--
11604-        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
11605-        '  <p class="aicm-selected-note">' + esc(note) + '</p>',
11606-        '  <dl class="aicm-core-detail-list">',
11607-        renderField("review_id", reviewId(row)),
11608-        renderField("操作予定", mode === "approve" ? "承認" : "差し戻し"),
11609-        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
11610-        '  </dl>',
11611-        '  <div class="aicm-dashboard-action-row">',
11612:        '    <button type="button" data-core-action="review-v10d-clear-preview">プレビューを閉じる</button>',
11613-        '  </div>',
11614-        '</section>'
11615-      ].join("");
11616-    }
11617-
11618-    function renderListRow(row, index, currentId) {
11619-      var id = reviewId(row);
11620-      var title = t(row.review_title || row.title || "レビュー項目");
--
11629-        '  <dl class="aicm-core-detail-list">',
11630-        renderField("種別", row.review_kind_label || row.review_kind_code),
11631-        renderField("成果物", row.artifact_kind_label || row.artifact_kind_code),
11632-        renderField("優先度", row.priority_code),
11633-        renderField("依頼日時", row.requested_at || row.created_at),
11634-        renderField("review_id", id),
11635-        '  </dl>',
11636-        '  <div class="aicm-dashboard-action-row">',
11637:        '    <button type="button" data-core-action="review-v10d-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
11638-        '  </div>',
11639-        '</article>'
11640-      ].join("");
11641-    }
11642-
11643-    function renderReviewList(appState) {
11644-      appState = app(appState);
11645-
--
11723-
11724-    function clearPreview() {
11725-      var s = app();
11726-      s.aicmR8zV10dDecisionPreviewMode = "";
11727-      rerender();
11728-    }
11729-
11730-    function installClickBridge() {
11731:      if (typeof document === "undefined" || document.__aicmR8zV10dReviewDetailClickBridge) return;
11732:      document.__aicmR8zV10dReviewDetailClickBridge = true;
11733-
11734:      document.addEventListener("click", function(event) {
11735-        var target = event.target;
11736-        while (target && target !== document && !target.getAttribute("data-core-action")) {
11737-          target = target.parentNode;
11738-        }
11739-
11740-        if (!target || target === document) return;
11741-
11742-        var action = target.getAttribute("data-core-action");
11743:        if (!action || action.indexOf("review-v10d-") !== 0) return;
11744-
11745-        event.preventDefault();
11746-        event.stopPropagation();
11747-
11748-        var id = target.getAttribute("data-review-id") || target.getAttribute("data-human-review-id") || "";
11749-
11750:        if (action === "review-v10d-open-detail") return setDetail(id);
11751:        if (action === "review-v10d-close-detail") return closeDetail();
11752:        if (action === "review-v10d-preview-approve") return previewDecision("approve", id);
11753:        if (action === "review-v10d-preview-return") return previewDecision("return", id);
11754:        if (action === "review-v10d-clear-preview") return clearPreview();
11755-      }, true);
11756-    }
11757-
11758-    installClickBridge();
11759-
11760-    if (typeof window !== "undefined") {
11761-      window.aicmR8zV10dRenderReviewList = renderReviewList;
11762-      window.aicmR8zV7RenderReviewList = renderReviewList;
--
12190-
12191-    function clearPreview() {
12192-      var s = app();
12193-      s.aicmR8zV10d2DecisionPreviewMode = "";
12194-      rerenderAndScroll(selectedReviewId(s));
12195-    }
12196-
12197-    function installClickBridge() {
12198:      if (typeof document === "undefined" || document.__aicmR8zV10d2InlineDetailClickBridge) return;
12199:      document.__aicmR8zV10d2InlineDetailClickBridge = true;
12200-
12201:      document.addEventListener("click", function(event) {
12202-        var target = event.target;
12203-        while (target && target !== document && !(target.getAttribute && target.getAttribute("data-core-action"))) {
12204-          target = target.parentNode;
12205-        }
12206-
12207-        if (!target || target === document || !(target.getAttribute)) return;
12208-
12209-        var action = target.getAttribute("data-core-action");

---- selected state lines ----
11445:    function selectedReviewId(appState) {
11447:      return t(appState.aicmR8zV10dSelectedReviewId || "");
11451:      var id = selectedReviewId(appState);
11651:      var currentId = selectedReviewId(appState);
11661:        currentId ? "selectedReviewId=" + currentId : "",
11705:      s.aicmR8zV10dSelectedReviewId = t(id);
11712:      s.aicmR8zV10dSelectedReviewId = "";
11719:      s.aicmR8zV10dSelectedReviewId = t(id) || selectedReviewId(s);
11930:    function selectedReviewId(appState) {
11932:      return t(appState.aicmR8zV10d2SelectedReviewId || appState.aicmR8zV10dSelectedReviewId || "");
12114:      var currentId = selectedReviewId(appState);
12124:        currentId ? "selectedReviewId=" + currentId : "",
12169:      s.aicmR8zV10d2SelectedReviewId = t(id);
12170:      s.aicmR8zV10dSelectedReviewId = t(id);
12177:      s.aicmR8zV10d2SelectedReviewId = "";
12178:      s.aicmR8zV10dSelectedReviewId = "";
12185:      s.aicmR8zV10d2SelectedReviewId = t(id) || selectedReviewId(s);
12186:      s.aicmR8zV10dSelectedReviewId = s.aicmR8zV10d2SelectedReviewId;
12188:      rerenderAndScroll(s.aicmR8zV10d2SelectedReviewId);
12194:      rerenderAndScroll(selectedReviewId(s));

============================================================
6. classification
============================================================
FINAL_JUDGEMENT=STATIC_OK_NEED_VISIBLE_RUNTIME_DEBUG_OR_COMPAT_ACTION_PATCH
ROOT_HTTP=200
SERVED_HTTP=200
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
V10C_MARKER_COUNT=2
V10D_MARKER_COUNT=2
V10D2_MARKER_COUNT=2
SERVED_V10D2_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3
V7_OVERRIDE_COUNT=4
LAST_OVERRIDE_LINE=12229:      window.aicmR8zV7RenderReviewList = renderReviewList;
V10D_ACTION_COUNT=2
V10D2_ACTION_COUNT=2
SERVED_V10D_ACTION_COUNT=2
SERVED_V10D2_ACTION_COUNT=2
V10D_BRIDGE_COUNT=2
V10D2_BRIDGE_COUNT=2
SCROLL_COUNT=5
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d3_artifact_detail_runtime_click_isolate_20260503_203727/000_R8Z_V10D3_ARTIFACT_DETAIL_RUNTIME_CLICK_ISOLATE_REPORT.md
SCAN_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d3_artifact_detail_runtime_click_isolate_20260503_203727/040_core_scan.txt
SCAN_RENDERERS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d3_artifact_detail_runtime_click_isolate_20260503_203727/041_renderer_scan.txt
SCAN_ACTIONS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d3_artifact_detail_runtime_click_isolate_20260503_203727/042_action_scan.txt
SCAN_BRIDGES=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10d3_artifact_detail_runtime_click_isolate_20260503_203727/043_bridge_scan.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- V10D2_NOT_ACTIVE_APPLY_OR_RESTART:
  V10D2が効いていない。再起動/再適用が先。

- V10D2_RENDERER_NOT_EMITTING_V10D2_ACTION:
  V10D2 rendererではなくV10D rendererが表示されている。最後のrenderer override順を修正。

- STATIC_OK_NEED_VISIBLE_RUNTIME_DEBUG_OR_COMPAT_ACTION_PATCH:
  静的にはOK。ブラウザクリックが拾えてない可能性が高い。
  次は review-v10d-open-detail と review-v10d2-open-detail の両方を同じ処理で拾う互換クリックbridgeを1本だけ追加。
  さらに押下後に画面上へ「V10D3 clicked=...」を表示。
