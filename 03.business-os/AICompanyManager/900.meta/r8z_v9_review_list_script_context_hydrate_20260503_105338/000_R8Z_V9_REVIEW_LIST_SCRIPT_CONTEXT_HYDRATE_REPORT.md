
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- DB/server/context API は正常
- context review_wait_items=2
- browser asset cache問題なし
- V8G/V8H/V8K/V8L は診断・暫定層
- fetch/XHRがbrowser上で完了しないため、fallback追加を止める
- 保守性優先で V9 正本ルートへ切替

今回の修正:
1. serverに GET /api/aicm/v2/context-script を追加
   - getContext(owner_civilization_id) を使う read-only route
   - JavaScriptとして callback(payload) を返す
2. coreに review-list専用 V9 hydrate helper を追加
   - review-list表示時に script tag で context-script を読む
   - payload.review_wait_items を state/context にmerge
   - 既存rendererを再描画
3. 成功したら自動でブラウザ画面を開く

禁止:
- DB write
- API POST
- render関数丸ごと置換
- 既存API削除

============================================================
1. ENV
============================================================
PHASE=R8Z-V9 review-list script context hydrate canonical fix
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
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
3. backup
============================================================
PASS: core backup created: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/aicm-production-core.before_r8z_v9.js
PASS: server backup created: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/aicm-local-ui-api-server.before_r8z_v9.mjs

============================================================
4. patch server context-script route
============================================================
PATCH_APPLIED: context-script route inserted before context route
PASS: server context-script route patch applied

============================================================
5. patch core review-list V9 hydrate
============================================================
PATCH_APPLIED: V9 review-list script hydrate helper inserted
PATCH_APPLIED: V9 hydrate call inserted before legacy V7 hydrate
PASS: core V9 review-list script hydrate patch applied

============================================================
6. post-patch syntax and rollback gate
============================================================
PASS: post-patch core syntax PASS
PASS: post-patch server syntax PASS

============================================================
7. marker/snippet
============================================================
CORE_V9_MARKER_COUNT=2
SERVER_V9_MARKER_COUNT=2
9831-                  window.aicmRender();
9832-                  return;
9833-                }
9834-              } catch (_r8zV8hWindowRenderError) {}
9835-            }, 0);
9836-          } catch (_r8zV8hScheduleError) {}
9837-
9838-
9839-
9840-          if (res.ok && payload && payload.result === "ok") {
9841-            normalize(appState, payload);
9842-          } else {
9843-            appState.aicmR8zV7HydrationError = payload.error_message || ("context status " + String(res.status));
9844-          }
9845-        });
9846-      })
9847-      .catch(function (error) {
9848-        appState.aicmR8zV7HydrationError = String(error && error.message ? error.message : error);
9849-      })
9850-      .finally(function () {
9851-        appState.aicmR8zV7Hydrating = false;
9852-        if (appState.screen === "review-list") rerender();
9853-      });
9854-  }
9855-
9856-  function statusLabel(row) {
9857-    var status = first(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
9858-    if (status === "pending") return "承認待ち";
9859-    if (status === "approved") return "承認済み";
9860-    if (status === "returned") return "差し戻し";
9861-    if (status === "archived") return "アーカイブ";
9862-    return status;
9863-  }
9864-
9865-  
9866-
9867:  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper begin
9868-  function aicmR8zV9ReviewRowsFromPayload(payload) {
9869-    payload = payload && typeof payload === "object" ? payload : {};
9870-    if (Array.isArray(payload.review_wait_items)) return payload.review_wait_items;
9871-    if (payload.context && Array.isArray(payload.context.review_wait_items)) return payload.context.review_wait_items;
9872-    if (payload.data && Array.isArray(payload.data.review_wait_items)) return payload.data.review_wait_items;
9873-    if (Array.isArray(payload.human_review_wait_items)) return payload.human_review_wait_items;
9874-    if (Array.isArray(payload.reviewWaitItems)) return payload.reviewWaitItems;
9875-    if (Array.isArray(payload.humanReviewWaitItems)) return payload.humanReviewWaitItems;
9876-    return [];
9877-  }
9878-
9879-  function aicmR8zV9MergeReviewPayload(appState, payload) {
9880-    appState = appState || {};
9881-    payload = payload && typeof payload === "object" ? payload : {};
9882-
9883-    var rows = aicmR8zV9ReviewRowsFromPayload(payload);
9884-
9885-    if (typeof aicmR8zV8gMergeReviewWaitItemsFromPayload === "function") {
9886-      try {
9887-        var mergedByV8g = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
9888-        if (Array.isArray(mergedByV8g)) rows = mergedByV8g;
9889-      } catch (_) {}
9890-    }
9891-
9892-    if (!appState.context || typeof appState.context !== "object") appState.context = {};
9893-    appState.context.review_wait_items = rows;
9894-    appState.review_wait_items = rows;
9895-
9896-    if (payload.owner_civilization_id) {
9897-      appState.context.owner_civilization_id = payload.owner_civilization_id;
9898-      appState.owner_civilization_id = payload.owner_civilization_id;
9899-    }
9900-
9901-    if (payload.aicm_user_company_id) {
9902-      appState.context.aicm_user_company_id = payload.aicm_user_company_id;
9903-      appState.selectedCompanyId = payload.aicm_user_company_id;
--
9931-    appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
9932-    appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
9933-    appState.aicmR8zV8kMergedAt = new Date().toISOString();
9934-
9935-    if (typeof state !== "undefined" && state && state !== appState) {
9936-      state.aicmR8zV7Hydrating = false;
9937-      state.aicmR8zV7HydrationError = "";
9938-      state.aicmR8zV9Hydrating = false;
9939-      state.aicmR8zV9Hydrated = true;
9940-      state.aicmR8zV9Rows = rows.length;
9941-      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9942-      state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
9943-      state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
9944-      state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
9945-      state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
9946-      state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
9947-    }
9948-
9949-    return rows;
9950-  }
9951-
9952-  function aicmR8zV9RerenderReviewList() {
9953-    try {
9954-      if (typeof render === "function") {
9955-        render();
9956-        return;
9957-      }
9958-    } catch (_) {}
9959-
9960-    try {
9961-      if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
9962-        window.aicmRender();
9963-      }
9964-    } catch (_) {}
9965-  }
9966-
9967:  function aicmR8zV9ReviewListScriptHydrate(appState) {
9968-    appState = appState || {};
9969-
9970-    var existingRows = [];
9971-    try {
9972-      existingRows = typeof rows === "function" ? rows(appState) : [];
9973-    } catch (_) {
9974-      existingRows = [];
9975-    }
9976-
9977-    if (Array.isArray(existingRows) && existingRows.length > 0) return;
9978-    if (appState.aicmR8zV9Hydrating) return;
9979-
9980-    var owner = "";
9981-    var company = "";
9982-
9983-    try {
9984-      owner = typeof ownerId === "function" ? ownerId(appState) : "";
9985-    } catch (_) {}
9986-
9987-    try {
9988-      company = typeof companyId === "function" ? companyId(appState) : "";
9989-    } catch (_) {}
9990-
9991-    if (!owner) {
9992-      owner = (appState.owner_civilization_id || appState.ownerCivilizationId || (appState.context && (appState.context.owner_civilization_id || appState.context.ownerCivilizationId)) || "00000000-0000-4000-8000-000000000001");
9993-    }
9994-
9995-    if (!company) {
9996-      company = (appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || (appState.context && (appState.context.aicm_user_company_id || appState.context.selectedCompanyId || appState.context.company_id)) || "");
9997-    }
9998-
9999-    if (typeof document === "undefined" || !document.body) {
10000-      appState.aicmR8zV8kDebug = "v9-document-unavailable";
10001-      appState.aicmR8zV8kError = "document/body unavailable";
10002-      return;
10003-    }
10004-
10005-    appState.aicmR8zV9Hydrating = true;
10006-    appState.aicmR8zV7Hydrating = true;
10007-    appState.aicmR8zV8kDebug = "v9-script-start";
10008-    appState.aicmR8zV8kPayloadCount = -1;
10009-    appState.aicmR8zV8kMergedCount = -1;
10010-    appState.aicmR8zV8kError = "";
10011-    appState.aicmR8zV9StartedAt = new Date().toISOString();
10012-
10013-    if (typeof state !== "undefined" && state && state !== appState) {
10014-      state.aicmR8zV9Hydrating = true;
10015-      state.aicmR8zV7Hydrating = true;
10016-      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10017-      state.aicmR8zV8kPayloadCount = -1;
10018-      state.aicmR8zV8kMergedCount = -1;
10019-      state.aicmR8zV8kError = "";
10020-      state.aicmR8zV9StartedAt = appState.aicmR8zV9StartedAt;
10021-    }
10022-
10023-    try {
10024-      var oldScript = document.getElementById("aicm-r8z-v9-context-script");
10025-      if (oldScript && oldScript.parentNode) oldScript.parentNode.removeChild(oldScript);
10026-    } catch (_) {}
10027-
10028:    window.__aicmR8zV9ReviewContextCallback = function aicmR8zV9ReviewContextCallback(payload) {
10029-      try {
10030-        aicmR8zV9MergeReviewPayload(appState, payload);
10031-      } catch (error) {
10032-        appState.aicmR8zV8kDebug = "v9-merge-error";
10033-        appState.aicmR8zV8kError = String(error && error.message ? error.message : error);
10034-        appState.aicmR8zV9Hydrating = false;
10035-        appState.aicmR8zV7Hydrating = false;
10036-      }
10037-
10038-      try {
10039-        setTimeout(aicmR8zV9RerenderReviewList, 0);
10040-      } catch (_) {
10041-        aicmR8zV9RerenderReviewList();
10042-      }
10043-    };
10044-
10045-    var params = new URLSearchParams();
10046-    params.set("owner_civilization_id", owner);
10047-    if (company) params.set("aicm_user_company_id", company);
10048:    params.set("callback", "__aicmR8zV9ReviewContextCallback");
10049-    params.set("v", "r8z_v9_" + Date.now());
10050-
10051-    var script = document.createElement("script");
10052-    script.id = "aicm-r8z-v9-context-script";
10053-    script.async = true;
10054-    script.src = "/api/aicm/v2/context-script?" + params.toString();
10055-
10056-    script.onerror = function aicmR8zV9ScriptError() {
10057-      appState.aicmR8zV8kDebug = "v9-script-error";
10058-      appState.aicmR8zV8kError = "context-script load failed";
10059-      appState.aicmR8zV9Hydrating = false;
10060-      appState.aicmR8zV7Hydrating = false;
10061-
10062-      if (typeof state !== "undefined" && state && state !== appState) {
10063-        state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10064-        state.aicmR8zV8kError = appState.aicmR8zV8kError;
10065-        state.aicmR8zV9Hydrating = false;
10066-        state.aicmR8zV7Hydrating = false;
10067-      }
10068-
10069-      aicmR8zV9RerenderReviewList();
10070-    };
10071-
10072-    document.body.appendChild(script);
10073-  }
10074:  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper end
10075-
10076-window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
10077-    appState = appState || {};
10078-    var list = rows(appState);
10079-
10080:    if (!list.length && typeof aicmR8zV9ReviewListScriptHydrate === "function") aicmR8zV9ReviewListScriptHydrate(appState);
10081-    if (!list.length) hydrateIfNeeded(appState);
10082-
10083-    var debug = [
10084-      "selectedCompanyId=" + companyId(appState),
10085-      "owner=" + ownerId(appState),
10086-      "rows=" + String(list.length),
10087-      appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
10088-      appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : "",
10089-      // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: visible debug fields
10090-      "v8k=" + t(appState.aicmR8zV8kDebug || (typeof state !== "undefined" && state ? state.aicmR8zV8kDebug : "") || "none"),
10091-      "payload=" + String(appState.aicmR8zV8kPayloadCount !== undefined ? appState.aicmR8zV8kPayloadCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kPayloadCount !== undefined) ? state.aicmR8zV8kPayloadCount : "na")),
10092-      "merged=" + String(appState.aicmR8zV8kMergedCount !== undefined ? appState.aicmR8zV8kMergedCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kMergedCount !== undefined) ? state.aicmR8zV8kMergedCount : "na")),
10093-      "stRows=" + String(appState.aicmR8zV8kAfterMergeStateRows !== undefined ? appState.aicmR8zV8kAfterMergeStateRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeStateRows !== undefined) ? state.aicmR8zV8kAfterMergeStateRows : "na")),
10094-      "ctxRows=" + String(appState.aicmR8zV8kAfterMergeContextRows !== undefined ? appState.aicmR8zV8kAfterMergeContextRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeContextRows !== undefined) ? state.aicmR8zV8kAfterMergeContextRows : "na")),
10095-      appState.aicmR8zV8kError ? "v8kError=" + t(appState.aicmR8zV8kError) : ""
10096-    ].filter(Boolean).join(" / ");
10097-
10098-    var html = [
10099-      '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
10100-      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
10101-      '  <h2>納品サマリー確認</h2>',
10102-      '  <p class="aicm-selected-note">対象会社: <strong>' + esc(companyName(appState)) + '</strong></p>',
10103-      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + esc(String(list.length)) + '件</strong></p>',
10104-      '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'
10105-    ];
10106-
10107-    if (!list.length) {
10108-      html.push(
10109-        '  <article class="aicm-core-card">',
10110-        '    <strong>レビュー・承認待ちはありません</strong>',
10111-        '    <p>context反映待ちです。数秒後に再描画されます。</p>',
10112-        '  </article>',
10113-        '</section>'
10114-      );
10115-      return html.join("");
10116-    }
2136-
2137-
2138-    if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
2139-      const body = await readBody(req);
2140-      sendJson(res, 200, updateCompany(body));
2141-      return true;
2142-    }
2143-
2144-    if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
2145-      const body = await readBody(req);
2146-      sendJson(res, 200, updateDepartment(body));
2147-      return true;
2148-    }
2149-
2150-    // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
2151-    // UI label "組織変更" is connected to the current section/k課 update responsibility.
2152-    // Keep this as an explicit compatibility route so future split can be handled here.
2153-    if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
2154-      const body = await readBody(req);
2155-      sendJson(res, 200, updateSection(body));
2156-      return true;
2157-    }
2158-
2159-    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
2160-      const body = await readBody(req);
2161-      sendJson(res, 200, updateSection(body));
2162-      return true;
2163-    }
2164-
2165-
2166:    // AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE: review-list script transport for local browser hydration
2167:    if (route === "/api/aicm/v2/context-script" && req.method === "GET") {
2168-      const owner = url.searchParams.get("owner_civilization_id") || "";
2169-      const callbackRaw = url.searchParams.get("callback") || "__aicmR8zV9ReviewContextCallback";
2170-      const callback = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(callbackRaw)
2171-        ? callbackRaw
2172-        : "__aicmR8zV9ReviewContextCallback";
2173-      const payload = getContext(owner);
2174-      const js = [
2175:        "/* AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE */",
2176-        "try {",
2177-        callback + "(" + JSON.stringify(payload) + ");",
2178-        "} catch (error) {",
2179-        "  try { window.__aicmR8zV9ReviewContextError = String(error && error.message ? error.message : error); } catch (_) {}",
2180-        "}"
2181-      ].join("\n");
2182-
2183-      res.writeHead(200, {
2184-        "content-type": "application/javascript; charset=utf-8",
2185-        "access-control-allow-origin": "*",
2186-        "cache-control": "no-store"
2187-      });
2188-      res.end(js);
2189-      return true;
2190-    }
2191-
2192-if (route === "/api/aicm/v2/context" && req.method === "GET") {
2193-      sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
2194-      return true;
2195-    }
2196-
2197-    if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
2198-      sendJson(res, 200, createCompany(await readBody(req)));
2199-      return true;
2200-    }
2201-
2202-    if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
2203-      const payload = createDepartment(await readBody(req));
2204-      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2205-      return true;
PASS: core V9 marker exists
PASS: server V9 marker exists

============================================================
8. restart server
============================================================
PASS: no existing lsof process on port 8794
ROOT_HTTP=200
PASS: server reachable after restart

============================================================
9. verify context and context-script
============================================================
CONTEXT_HTTP=200
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v9_20260503_105338
result=ok
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true
PASS: context review_wait_items=2
CONTEXT_SCRIPT_HTTP=404
CONTEXT_SCRIPT_URL=http://127.0.0.1:8794/api/aicm/v2/context-script?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&callback=__aicmR8zV9ReviewContextCallback&v=r8z_v9_20260503_105338
WARN: context-script verification incomplete
{
  "result": "error",
  "api_identifier": "AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1",
  "error_message": "unknown v2 endpoint"
}

============================================================
10. served core vs disk
============================================================
SERVED_HTTP=200
DISK_SHA=dfeb18ed91a9ef9229ff241be33ea949b1d003abe193e1a35237b395042dac1d
SERVED_SHA=dfeb18ed91a9ef9229ff241be33ea949b1d003abe193e1a35237b395042dac1d
PASS: served core matches disk

============================================================
11. FINAL
============================================================
REVIEW_COUNT=2
CORE_V9_MARKER_COUNT=2
SERVER_V9_MARKER_COUNT=2
CONTEXT_SCRIPT_HTTP=404
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9_20260503_105338
PASS_COUNT=16
WARN_COUNT=1
FAIL_COUNT=0
FINAL_JUDGEMENT=V9_PATCH_APPLIED_BUT_VERIFY_INCOMPLETE
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/000_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/aicm-production-core.before_r8z_v9.js
BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/aicm-local-ui-api-server.before_r8z_v9.mjs
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/050_core_v9_patch_snip.txt
SERVER_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/051_server_v9_patch_snip.txt
CONTEXT_PARSE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/031_context_verify_parse.txt
CONTEXT_SCRIPT_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/032_context_script_verify.js
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/060_server.log
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

BROWSER_CHECK:
期待:
- v8k=v9-script-start から v9-script-merged へ変わる
- payload=2 / merged=2 / stRows=2 / ctxRows=2
- レビュー・承認待ち: 2件
- 納品サマリー確認: AI企業業務開始導線の整備 作業
- 納品サマリー確認: Manager大項目台帳運用の整備 作業
- 承認ボタン
- 差し戻しボタン

分岐:
- v9-script-merged なのに rows=0:
  rows(appState) 側の参照元/フィルタだけ修正。

- v9-script-error:
  context-script route / script load を確認。

- 2件表示:
  次は承認/差し戻し rollback smoke。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/aicm-production-core.before_r8z_v9.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/aicm-local-ui-api-server.before_r8z_v9.mjs" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs"
