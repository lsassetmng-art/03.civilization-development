
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- git checkpoint/push済み
- 台帳 isPendingMajor scope callsite は復旧済み
- レビュー待ちは v9-script-start のまま
- V9系はcallback後に全体 render() を呼ぶ可能性があり、台帳など他画面を巻き込む懸念がある

今回の修正:
1. V9の再描画関数 aicmR8zV9RerenderReviewList だけを差し替える
2. 全体 render() / window.aicmRender() を呼ばない
3. state.screen が review-list の時だけ root.innerHTML をレビュー一覧HTMLで差し替える
4. DB/server/contextは触らない
5. 成功したら画面自動起動

禁止:
- DB write
- API POST
- server patch
- fallback追加
- render関数全体置換
- 台帳/CSV/Manager大項目側の追加変更

============================================================
1. ENV
============================================================
PHASE=R8Z-V9E review-list local render only fix
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e_review_list_local_render_only_20260503_111204
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES
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
PASS: core backup created: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e_review_list_local_render_only_20260503_111204/aicm-production-core.before_r8z_v9e.js

============================================================
4. patch core: V9 local review-list render only
============================================================
PATCH_APPLIED: aicmR8zV9RerenderReviewList replaced with local review-list renderer only
PASS: V9E local renderer patch applied

============================================================
5. postcheck syntax / rollback gate
============================================================
PASS: post-patch core syntax PASS
PASS: server unchanged syntax PASS

============================================================
6. static verify
============================================================
V9E_MARKER_COUNT=1
RERENDER_FUNC_HAS_GLOBAL_RENDER_CALL=true
RERENDER_FUNC_HAS_WINDOW_AICM_RENDER_CALL=false
RERENDER_FUNC_HAS_ROOT_INNERHTML=true
RERENDER_FUNC_HAS_REVIEW_RENDERER=true
RERENDER_FUNC_HAS_SCREEN_GUARD=true
PASS: V9E marker exists
FAIL: global render() still exists in V9 rerender
PASS: window.aicmRender() removed from V9 rerender
PASS: local root.innerHTML update exists
PASS: review renderer local call exists
PASS: review-list screen guard exists

============================================================
7. snippet
============================================================
9923-        state.context.owner_civilization_id = payload.owner_civilization_id;
9924-        state.owner_civilization_id = payload.owner_civilization_id;
9925-      }
9926-
9927-      if (payload.aicm_user_company_id) {
9928-        state.context.aicm_user_company_id = payload.aicm_user_company_id;
9929-        state.selectedCompanyId = payload.aicm_user_company_id;
9930-      }
9931-    }
9932-
9933-    appState.aicmR8zV7Hydrating = false;
9934-    appState.aicmR8zV7HydrationError = "";
9935-    appState.aicmR8zV9Hydrating = false;
9936-    appState.aicmR8zV9Hydrated = true;
9937-    appState.aicmR8zV9Rows = rows.length;
9938-
9939-    appState.aicmR8zV8kDebug = "v9-script-merged";
9940-    appState.aicmR8zV8kPayloadCount = rows.length;
9941-    appState.aicmR8zV8kMergedCount = rows.length;
9942-    appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
9943-    appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
9944-    appState.aicmR8zV8kMergedAt = new Date().toISOString();
9945-
9946-    if (typeof state !== "undefined" && state && state !== appState) {
9947-      state.aicmR8zV7Hydrating = false;
9948-      state.aicmR8zV7HydrationError = "";
9949-      state.aicmR8zV9Hydrating = false;
9950-      state.aicmR8zV9Hydrated = true;
9951-      state.aicmR8zV9Rows = rows.length;
9952-      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9953-      state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
9954-      state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
9955-      state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
9956-      state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
9957-      state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
9958-    }
9959-
9960-    return rows;
9961-  }
9962-
9963:  function aicmR8zV9RerenderReviewList() {
9964:    // AICM_R8Z_V9E_REVIEW_LIST_LOCAL_RENDER_ONLY
9965-    // Keep review-list hydration local. Do not call global render(), because it can re-enter
9966-    // task-ledger/dashboard render paths and surface unrelated screen regressions.
9967-    try {
9968-      var appState = (typeof state !== "undefined" && state) ? state : {};
9969-      var screen = String(appState.screen || "");
9970-
9971-      if (screen && screen !== "review-list") {
9972-        appState.aicmR8zV8kDebug = "v9-local-skip-non-review";
9973-        appState.aicmR8zV8kError = "screen=" + screen;
9974-        return;
9975-      }
9976-
9977-      if (typeof root === "undefined" || !root) {
9978-        appState.aicmR8zV8kDebug = "v9-local-root-missing";
9979-        appState.aicmR8zV8kError = "root is unavailable";
9980-        return;
9981-      }
9982-
9983-      if (typeof window === "undefined" || typeof window.aicmR8zV7RenderReviewList !== "function") {
9984:        appState.aicmR8zV8kDebug = "v9-local-renderer-missing";
9985-        appState.aicmR8zV8kError = "aicmR8zV7RenderReviewList is unavailable";
9986-        return;
9987-      }
9988-
9989-      appState.screen = "review-list";
9990:      appState.aicmR8zV8kDebug = "v9-local-render-start";
9991-
9992-      root.innerHTML = window.aicmR8zV7RenderReviewList(appState);
9993-
9994:      appState.aicmR8zV8kDebug = "v9-local-render-done";
9995-      appState.aicmR8zV8kError = "";
9996-    } catch (error) {
9997-      try {
9998-        if (typeof state !== "undefined" && state) {
9999:          state.aicmR8zV8kDebug = "v9-local-render-error";
10000-          state.aicmR8zV8kError = String(error && error.message ? error.message : error);
10001-        }
10002-      } catch (_) {}
10003-    }
10004-  }
10005-
10006-  function aicmR8zV9ReviewListScriptHydrate(appState) {
10007-    appState = appState || {};
10008-
10009-    var existingRows = [];
10010-    try {
10011-      existingRows = typeof rows === "function" ? rows(appState) : [];
10012-    } catch (_) {
10013-      existingRows = [];
10014-    }
10015-
10016-    if (Array.isArray(existingRows) && existingRows.length > 0) return;
10017-    if (appState.aicmR8zV9Hydrating) return;
10018-
10019-    var owner = "";
10020-    var company = "";
10021-
10022-    try {
10023-      owner = typeof ownerId === "function" ? ownerId(appState) : "";
10024-    } catch (_) {}
10025-
10026-    try {
10027-      company = typeof companyId === "function" ? companyId(appState) : "";
10028-    } catch (_) {}
10029-
10030-    if (!owner) {
10031-      owner = (appState.owner_civilization_id || appState.ownerCivilizationId || (appState.context && (appState.context.owner_civilization_id || appState.context.ownerCivilizationId)) || "00000000-0000-4000-8000-000000000001");
10032-    }
10033-
10034-    if (!company) {
10035-      company = (appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || (appState.context && (appState.context.aicm_user_company_id || appState.context.selectedCompanyId || appState.context.company_id)) || "");
10036-    }
10037-
10038-    if (typeof document === "undefined" || !document.body) {
10039-      appState.aicmR8zV8kDebug = "v9-document-unavailable";

============================================================
8. restart server
============================================================
PASS: no lsof pid on port
ROOT_HTTP=200
PASS: server reachable after restart

============================================================
9. context / context-script verify
============================================================
CONTEXT_HTTP=200
result=ok
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true
PASS: context review_wait_items=2
CONTEXT_SCRIPT_HTTP=200
PASS: context-script 200 with review_wait_items

============================================================
10. served core verify
============================================================
SERVED_HTTP=200
DISK_SHA=fda4d30aacda5bb93f905451b215465449b78bb9e53ce218a2b2e5085b7a5385
SERVED_SHA=fda4d30aacda5bb93f905451b215465449b78bb9e53ce218a2b2e5085b7a5385
SERVED_V9E_MARKER_COUNT=1
PASS: served core matches disk
PASS: served core contains V9E marker

============================================================
11. final / browser open
============================================================
REVIEW_COUNT=2
CONTEXT_SCRIPT_HTTP=200
V9E_MARKER_COUNT=1
HAS_GLOBAL_RENDER=true
HAS_WINDOW_RENDER=false
HAS_ROOT_INNERHTML=true
HAS_REVIEW_RENDERER=true
HAS_SCREEN_GUARD=true
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9e_20260503_111204
PASS_COUNT=19
WARN_COUNT=0
FAIL_COUNT=1
FINAL_JUDGEMENT=CHECK_FAILURES_OR_ROLLBACK
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e_review_list_local_render_only_20260503_111204/000_R8Z_V9E_REVIEW_LIST_LOCAL_RENDER_ONLY_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e_review_list_local_render_only_20260503_111204/aicm-production-core.before_r8z_v9e.js
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e_review_list_local_render_only_20260503_111204/070_core_v9e_snip.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e_review_list_local_render_only_20260503_111204/080_server.log
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
1. レビュー・承認待ち一覧:
   期待:
   - v8k=v9-local-render-done または v9-script-merged 後に2件表示
   - レビュー・承認待ち: 2件
   - 納品サマリー確認: AI企業業務開始導線の整備 作業
   - 納品サマリー確認: Manager大項目台帳運用の整備 作業
   - 承認/差し戻しボタン表示

2. 部門別タスク台帳:
   期待:
   - TASK LEDGER RENDER ERROR が出ない
   - 合計38件サマリが維持される

まだ v9-script-start の場合:
- callback未完了。次はcontext-script本文の実行形を確認。
- ただしこのV9Eで全体render副作用は止めた状態。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e_review_list_local_render_only_20260503_111204/aicm-production-core.before_r8z_v9e.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
