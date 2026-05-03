
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- V9Bで context-script route は200
- context review_wait_items=2
- ブラウザ画面は v8k=v9-script-start のまま
- つまり script load / callback 実行完了が未確認

今回の修正:
1. coreのみ修正
2. context-script callback名を window.__aicmR8zV9ReviewContextCallback に固定
3. globalThisにもcallbackを登録
4. script.onload後、callback未完了なら v9-script-loaded-no-callback を画面debugに出す
5. 成功したらブラウザを自動起動

禁止:
- DB write
- API POST
- server patch
- route追加
- render関数丸ごと置換

============================================================
1. ENV
============================================================
PHASE=R8Z-V9C window callback script hydrate fix
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9c_window_callback_script_hydrate_20260503_105736
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
PASS: core backup created: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9c_window_callback_script_hydrate_20260503_105736/aicm-production-core.before_r8z_v9c.js

============================================================
4. patch core V9C
============================================================
PATCH_APPLIED: V9C window callback + onload diagnostics inserted
PASS: V9C core patch applied

============================================================
5. postcheck syntax
============================================================
PASS: post-patch core syntax PASS
PASS: server unchanged syntax PASS

============================================================
6. marker/snippet
============================================================
CORE_V9C_MARKER_COUNT=3
9220-      var row = companies[i] || {};
9221-      var id = r8zV5dText(row.aicm_user_company_id || row.company_id || row.id);
9222-      if (cid && id === cid) {
9223-        return r8zV5dText(row.company_name || row.name || row.display_name) || "選択中";
9224-      }
9225-    }
9226-
9227-    return "選択中";
9228-  }
9229-
9230-  function r8zV5dRenderAgain() {
9231-    if (typeof window.render === "function") {
9232-      window.render();
9233-      return;
9234-    }
9235-    if (typeof window.renderApp === "function") {
9236-      window.renderApp();
9237-      return;
9238-    }
9239-    if (typeof window.aicmRender === "function") {
9240-      window.aicmRender();
9241-    }
9242-  }
9243-
9244-  function r8zV5dHydrateIfNeeded() {
9245-    var state = r8zV5dState();
9246-    if (state.aicmR8zV5dHydrating) return;
9247-    if (r8zV5dReviewRows().length > 0) return;
9248-
9249-    var owner = r8zV5dOwnerId();
9250-    var company = r8zV5dCompanyId();
9251-
9252-    if (!owner || !company || typeof fetch !== "function") return;
9253-
9254-    state.aicmR8zV5dHydrating = true;
9255-
9256:    // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE: expose callback on globalThis as well as window
9257-    try {
9258:      if (typeof globalThis !== "undefined" && typeof window !== "undefined" && window.__aicmR8zV9ReviewContextCallback) {
9259:        globalThis.__aicmR8zV9ReviewContextCallback = window.__aicmR8zV9ReviewContextCallback;
9260-      }
9261-    } catch (_r8zV9cGlobalBindError) {}
9262-
9263-    var params = new URLSearchParams();
9264-    params.set("owner_civilization_id", owner);
9265-    params.set("aicm_user_company_id", company);
9266-    params.set("v", "r8z_v5d_" + Date.now());
9267-
9268-    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
9269-      .then(function (res) {
9270-        return res.text().then(function (bodyText) {
9271-          var payload = {};
9272-          try {
9273-            payload = bodyText ? JSON.parse(bodyText) : {};
9274-          } catch (error) {
9275-            payload = {};
9276-          }
9277-
9278-          if (res.ok && payload && payload.result === "ok") {
9279-            r8zV5dNormalizeContext(payload);
9280-          } else {
9281-            state.aicmR8zV5dHydrationError = payload.error_message || ("context status " + String(res.status));
9282-          }
9283-        });
9284-      })
9285-      .catch(function (error) {
9286-        state.aicmR8zV5dHydrationError = String(error && error.message ? error.message : error);
9287-      })
9288-      .finally(function () {
9289-        state.aicmR8zV5dHydrating = false;
9290-        if (state.screen === "review-list") {
9291-          r8zV5dRenderAgain();
9292-        }
9293-      });
9294-  }
9295-
--
9999-      owner = (appState.owner_civilization_id || appState.ownerCivilizationId || (appState.context && (appState.context.owner_civilization_id || appState.context.ownerCivilizationId)) || "00000000-0000-4000-8000-000000000001");
10000-    }
10001-
10002-    if (!company) {
10003-      company = (appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || (appState.context && (appState.context.aicm_user_company_id || appState.context.selectedCompanyId || appState.context.company_id)) || "");
10004-    }
10005-
10006-    if (typeof document === "undefined" || !document.body) {
10007-      appState.aicmR8zV8kDebug = "v9-document-unavailable";
10008-      appState.aicmR8zV8kError = "document/body unavailable";
10009-      return;
10010-    }
10011-
10012-    appState.aicmR8zV9Hydrating = true;
10013-    appState.aicmR8zV7Hydrating = true;
10014-    appState.aicmR8zV8kDebug = "v9-script-start";
10015-    appState.aicmR8zV8kPayloadCount = -1;
10016-    appState.aicmR8zV8kMergedCount = -1;
10017-    appState.aicmR8zV8kError = "";
10018-    appState.aicmR8zV9StartedAt = new Date().toISOString();
10019-
10020-    if (typeof state !== "undefined" && state && state !== appState) {
10021-      state.aicmR8zV9Hydrating = true;
10022-      state.aicmR8zV7Hydrating = true;
10023-      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10024-      state.aicmR8zV8kPayloadCount = -1;
10025-      state.aicmR8zV8kMergedCount = -1;
10026-      state.aicmR8zV8kError = "";
10027-      state.aicmR8zV9StartedAt = appState.aicmR8zV9StartedAt;
10028-    }
10029-
10030-    try {
10031-      var oldScript = document.getElementById("aicm-r8z-v9-context-script");
10032-      if (oldScript && oldScript.parentNode) oldScript.parentNode.removeChild(oldScript);
10033-    } catch (_) {}
10034-
10035:    window.__aicmR8zV9ReviewContextCallback = function aicmR8zV9ReviewContextCallback(payload) {
10036-      try {
10037-        aicmR8zV9MergeReviewPayload(appState, payload);
10038-      } catch (error) {
10039-        appState.aicmR8zV8kDebug = "v9-merge-error";
10040-        appState.aicmR8zV8kError = String(error && error.message ? error.message : error);
10041-        appState.aicmR8zV9Hydrating = false;
10042-        appState.aicmR8zV7Hydrating = false;
10043-      }
10044-
10045-      try {
10046-        setTimeout(aicmR8zV9RerenderReviewList, 0);
10047-      } catch (_) {
10048-        aicmR8zV9RerenderReviewList();
10049-      }
10050-    };
10051-
10052-    var params = new URLSearchParams();
10053-    params.set("owner_civilization_id", owner);
10054-    if (company) params.set("aicm_user_company_id", company);
10055:    params.set("callback", "window.__aicmR8zV9ReviewContextCallback"); // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE
10056-    params.set("v", "r8z_v9_" + Date.now());
10057-
10058-    var script = document.createElement("script");
10059-    script.id = "aicm-r8z-v9-context-script";
10060-    script.async = true;
10061-    script.src = "/api/aicm/v2/context-script?" + params.toString();
10062-
10063-    script.onerror = function aicmR8zV9ScriptError() {
10064-      appState.aicmR8zV8kDebug = "v9-script-error";
10065-      appState.aicmR8zV8kError = "context-script load failed";
10066-      appState.aicmR8zV9Hydrating = false;
10067-      appState.aicmR8zV7Hydrating = false;
10068-
10069-      if (typeof state !== "undefined" && state && state !== appState) {
10070-        state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10071-        state.aicmR8zV8kError = appState.aicmR8zV8kError;
10072-        state.aicmR8zV9Hydrating = false;
10073-        state.aicmR8zV7Hydrating = false;
10074-      }
10075-
10076-      aicmR8zV9RerenderReviewList();
10077-    };
10078-
10079:    // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE: loaded-without-callback diagnostics
10080-    script.onload = function aicmR8zV9cScriptLoaded() {
10081-      try {
10082-        setTimeout(function aicmR8zV9cCheckCallbackCompletion() {
10083-          try {
10084-            var merged = Number(appState && appState.aicmR8zV8kMergedCount);
10085-            if (Number.isFinite(merged) && merged >= 0) return;
10086-            if (appState && appState.aicmR8zV9Hydrated) return;
10087-
10088:            appState.aicmR8zV8kDebug = "v9-script-loaded-no-callback";
10089-            appState.aicmR8zV8kError = String(
10090-              (typeof window !== "undefined" && window.__aicmR8zV9ReviewContextError)
10091-                ? window.__aicmR8zV9ReviewContextError
10092-                : "script loaded but callback did not merge"
10093-            );
10094-            appState.aicmR8zV9Hydrating = false;
10095-            appState.aicmR8zV7Hydrating = false;
10096-
10097-            if (typeof state !== "undefined" && state && state !== appState) {
10098-              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10099-              state.aicmR8zV8kError = appState.aicmR8zV8kError;
10100-              state.aicmR8zV9Hydrating = false;
10101-              state.aicmR8zV7Hydrating = false;
10102-            }
10103-
10104-            try {
10105-              if (typeof render === "function") {
10106-                render();
10107-                return;
10108-              }
10109-            } catch (_) {}
10110-
10111-            try {
10112-              if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
10113-                window.aicmRender();
10114-              }
10115-            } catch (_) {}
10116-          } catch (_) {}
10117-        }, 600);
10118-      } catch (_) {}
10119-    };
10120-
10121-    document.body.appendChild(script);
10122-  }
10123-  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper end
10124-
PASS: core V9C marker exists

============================================================
7. server/context verify
============================================================
ROOT_HTTP=200
PASS: server reachable
CONTEXT_HTTP=200
result=ok
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true
PASS: context review_wait_items=2
CONTEXT_SCRIPT_HTTP=200
CONTEXT_SCRIPT_URL=http://127.0.0.1:8794/api/aicm/v2/context-script?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&callback=window.__aicmR8zV9ReviewContextCallback&v=r8z_v9c_20260503_105736
---- context-script head ----
/* AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE */
try {
window.__aicmR8zV9ReviewContextCallback({"result":"ok","sections":[{"purpose":"","created_at":"2026-04-30T02:26:42.671938+00:00","updated_at":"2026-04-30T02:26:42.671938+00:00","section_name":"課","display_order":100,"metadata_jsonb":{},"section_status":"active","parent_section_id":null,"aicm_user_company_id":"5bb29236-1f03-44c3-8e57-f1301cadfdec","leader_robot_pool_id":null,"owner_civilization_id":"00000000-0000-4000-8000-000000000001","leader_internal_nickname":"","leader_aiworker_model_code":"","aicm_user_company_section_id":"793243ed-3915-44db-ad77-3415be330498","aicm_user_company_department_id":"f8331d5d-aa4d-4524-b946-b3128c6abbdd"},{"purpose":"ウワオーン？","created_at":"2026-04-30T10:57:52.711213+00:00","updated_at":"2026-04-30T21:56:48.261126+00:00","section_name":"遠吠え課？","display_order":100,"metadata_jsonb":{},"section_status":"active","parent_section_id":null,"aicm_user_company_id":"8b9be487-7b74-4517-9b59-6c84a82
PASS: context-script returns window callback JS with review_wait_items

============================================================
8. served core verify
============================================================
SERVED_HTTP=200
DISK_SHA=85ddc0a14c3cf1f78a367c2a848558fe950d9ffd37cddd4c1d3cdc15856d91f7
SERVED_SHA=85ddc0a14c3cf1f78a367c2a848558fe950d9ffd37cddd4c1d3cdc15856d91f7
SERVED_V9C_MARKER_COUNT=3
PASS: served core matches disk
PASS: served core contains V9C marker

============================================================
9. final and browser open
============================================================
REVIEW_COUNT=2
CONTEXT_SCRIPT_HTTP=200
CORE_V9C_MARKER_COUNT=3
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9c_20260503_105736
PASS_COUNT=14
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=V9C_WINDOW_CALLBACK_READY_BROWSER_OPENED
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9c_window_callback_script_hydrate_20260503_105736/000_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9c_window_callback_script_hydrate_20260503_105736/aicm-production-core.before_r8z_v9c.js
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9c_window_callback_script_hydrate_20260503_105736/060_core_v9c_snip.txt
CONTEXT_PARSE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9c_window_callback_script_hydrate_20260503_105736/031_context_parse.txt
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES
BROWSER_OPEN=termux-open-url

BROWSER_CHECK:
期待:
- v8k=v9-script-merged
- payload=2 / merged=2 / stRows=2 / ctxRows=2
- レビュー・承認待ち: 2件

もし:
- v8k=v9-script-loaded-no-callback:
  scriptは読めたがcallback未実行。画面の v8kError を見る。

- v8k=v9-script-error:
  script load自体が失敗。

- v9-script-merged なのに rows=0:
  rows(appState)の参照元だけ修正。
