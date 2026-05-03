
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- V9E patchは入った
- REVIEW_COUNT=2
- CONTEXT_SCRIPT_HTTP=200
- ただし静的チェックが HAS_GLOBAL_RENDER=true で失敗
- 原因候補:
  コメント中の render() を検知した誤判定

今回:
1. V9E関数内コメントの render() 文字だけ消す
2. 実コード部分だけを判定する静的検証に変更
3. global render/window.aicmRender を呼ばないことを確認
4. server再起動
5. context/context-script/served core確認
6. 成功したら画面自動起動

禁止:
- DB write
- API POST
- server patch
- fallback追加
- render関数全体の再置換

============================================================
1. ENV
============================================================
PHASE=R8Z-V9E2 local render static gate correction
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e2_local_render_static_gate_correction_20260503_111317
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES
PASS: core exists
PASS: server exists

============================================================
2. syntax precheck
============================================================
PASS: core syntax PASS before V9E2
PASS: server syntax PASS

============================================================
3. backup core
============================================================
PASS: core backup created: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e2_local_render_static_gate_correction_20260503_111317/aicm-production-core.before_r8z_v9e2.js

============================================================
4. patch comment-only false positive
============================================================
PATCH_APPLIED: removed render() text from comment false positive
PASS: V9E2 comment/static gate correction applied or already present

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after V9E2

============================================================
6. static verify real code only
============================================================
V9E_MARKER_COUNT=1
V9E2_MARKER_COUNT=1
RERENDER_FUNC_HAS_GLOBAL_RENDER_CALL_CODE_ONLY=false
RERENDER_FUNC_HAS_WINDOW_AICM_RENDER_CALL_CODE_ONLY=false
RERENDER_FUNC_HAS_ROOT_INNERHTML=true
RERENDER_FUNC_HAS_REVIEW_RENDERER=true
RERENDER_FUNC_HAS_SCREEN_GUARD=true
RERENDER_FUNC_HAS_LOCAL_DONE=true
PASS: V9E marker exists
PASS: V9E2 marker exists
PASS: no global render() call in V9 rerender code
PASS: no window.aicmRender() call in V9 rerender code
PASS: local root.innerHTML exists
PASS: local review renderer exists
PASS: review-list screen guard exists
PASS: local render done debug exists

============================================================
7. snippet
============================================================
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
9965:    // AICM_R8Z_V9E2_LOCAL_RENDER_STATIC_GATE_CORRECTION
9966-    // Keep review-list hydration local. Avoid the app-wide renderer because it can re-enter
9967-    // task-ledger/dashboard paths and surface unrelated screen regressions.
9968-    try {
9969-      var appState = (typeof state !== "undefined" && state) ? state : {};
9970-      var screen = String(appState.screen || "");
9971-
9972-      if (screen && screen !== "review-list") {
9973-        appState.aicmR8zV8kDebug = "v9-local-skip-non-review";
9974-        appState.aicmR8zV8kError = "screen=" + screen;
9975-        return;
9976-      }
9977-
9978-      if (typeof root === "undefined" || !root) {
9979-        appState.aicmR8zV8kDebug = "v9-local-root-missing";
9980-        appState.aicmR8zV8kError = "root is unavailable";
9981-        return;
9982-      }
9983-
9984-      if (typeof window === "undefined" || typeof window.aicmR8zV7RenderReviewList !== "function") {
9985:        appState.aicmR8zV8kDebug = "v9-local-renderer-missing";
9986-        appState.aicmR8zV8kError = "aicmR8zV7RenderReviewList is unavailable";
9987-        return;
9988-      }
9989-
9990-      appState.screen = "review-list";
9991:      appState.aicmR8zV8kDebug = "v9-local-render-start";
9992-
9993-      root.innerHTML = window.aicmR8zV7RenderReviewList(appState);
9994-
9995:      appState.aicmR8zV8kDebug = "v9-local-render-done";
9996-      appState.aicmR8zV8kError = "";
9997-    } catch (error) {
9998-      try {
9999-        if (typeof state !== "undefined" && state) {
10000:          state.aicmR8zV8kDebug = "v9-local-render-error";
10001-          state.aicmR8zV8kError = String(error && error.message ? error.message : error);
10002-        }
10003-      } catch (_) {}
10004-    }
10005-  }
10006-
10007-  function aicmR8zV9ReviewListScriptHydrate(appState) {
10008-    appState = appState || {};
10009-
10010-    var existingRows = [];
10011-    try {
10012-      existingRows = typeof rows === "function" ? rows(appState) : [];
10013-    } catch (_) {
10014-      existingRows = [];
10015-    }
10016-
10017-    if (Array.isArray(existingRows) && existingRows.length > 0) return;
10018-    if (appState.aicmR8zV9Hydrating) return;
10019-
10020-    var owner = "";
10021-    var company = "";
10022-
10023-    try {
10024-      owner = typeof ownerId === "function" ? ownerId(appState) : "";
10025-    } catch (_) {}
10026-
10027-    try {
10028-      company = typeof companyId === "function" ? companyId(appState) : "";
10029-    } catch (_) {}
10030-
10031-    if (!owner) {
10032-      owner = (appState.owner_civilization_id || appState.ownerCivilizationId || (appState.context && (appState.context.owner_civilization_id || appState.context.ownerCivilizationId)) || "00000000-0000-4000-8000-000000000001");
10033-    }
10034-
10035-    if (!company) {

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
DISK_SHA=64e6ba6bcdc72a001229916bdd848ea723f59f063ed8aa3deafd6285503f520a
SERVED_SHA=64e6ba6bcdc72a001229916bdd848ea723f59f063ed8aa3deafd6285503f520a
SERVED_V9E2_MARKER_COUNT=1
PASS: served core matches disk
PASS: served core contains V9E2 marker

============================================================
11. final / browser open
============================================================
REVIEW_COUNT=2
CONTEXT_SCRIPT_HTTP=200
V9E_MARKER_COUNT=1
V9E2_MARKER_COUNT=1
HAS_GLOBAL_RENDER=false
HAS_WINDOW_RENDER=false
HAS_ROOT_INNERHTML=true
HAS_REVIEW_RENDERER=true
HAS_SCREEN_GUARD=true
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9e2_20260503_111317
PASS_COUNT=21
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=V9E2_LOCAL_RENDER_STATIC_GATE_PASS_BROWSER_OPENED
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e2_local_render_static_gate_correction_20260503_111317/000_R8Z_V9E2_LOCAL_RENDER_STATIC_GATE_CORRECTION_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e2_local_render_static_gate_correction_20260503_111317/aicm-production-core.before_r8z_v9e2.js
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e2_local_render_static_gate_correction_20260503_111317/070_core_v9e2_snip.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e2_local_render_static_gate_correction_20260503_111317/080_server.log
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES
BROWSER_OPEN=termux-open-url

BROWSER_CHECK:
- レビュー・承認待ち一覧を開く
期待:
- v8k=v9-local-render-done もしくは v9-script-merged
- レビュー・承認待ち: 2件
- 承認/差し戻しボタン表示

まだ v9-script-start の場合:
- script callback自体が実行されていない。
- 次はcontext-scriptの実行方式を「callback名を素の関数名に戻し、window bridge関数を別途置く」方向で直す。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e2_local_render_static_gate_correction_20260503_111317/aicm-production-core.before_r8z_v9e2.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
