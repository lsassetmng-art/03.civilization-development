
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- DB/server/context API は正常
- exact V7 context URL は review_wait_items=2
- V7 fetch/render/finalizerは存在
- V8F3判定:
  FINAL_JUDGEMENT=PATCH_V7_ADD_REVIEW_WAIT_ITEMS_MERGE
  HYDRATE_ASSIGNS_REVIEW=false

今回の修正:
- coreのV7 hydrate成功後に payload.review_wait_items を
  appState.context.review_wait_items
  appState.review_wait_items
  state.context.review_wait_items
  state.review_wait_items
  へmergeする
- render/finalizerは既存を使う
- server/DB/API POSTは触らない

完了条件:
- core node --check PASS
- server node --check PASS
- served core と disk core が一致
- context APIは review_wait_items=2 のまま
- ブラウザ確認でレビュー待ち2件表示へ進める

禁止:
- DB write
- API POST
- server patch
- render関数丸ごと置換
- window override追加

============================================================
1. ENV
============================================================
PHASE=R8Z-V8G V7 review_wait_items merge minimal fix
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047
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
PASS: core backup created: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047/aicm-production-core.before_r8z_v8g.js

============================================================
4. patch V7 payload review_wait_items merge
============================================================
PATCH_APPLIED: helper added inside hydrateIfNeeded
PATCH_APPLIED: merge call added after payload JSON parse
PASS: V7 review_wait_items merge patch applied

============================================================
5. post-patch syntax and rollback gate
============================================================
PASS: post-patch core syntax PASS
PASS: server unchanged syntax PASS

============================================================
6. patch marker and snippet
============================================================
MARKER_COUNT=3
9470-    return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id);
9471-  }
9472-
9473-  function companyName(appState) {
9474-    appState = appState || {};
9475-    var c = appState.context || {};
9476-    var cid = companyId(appState);
9477-
9478-    var direct = t(appState.selectedCompanyName || c.selectedCompanyName || c.company_name || c.aicm_user_company_name);
9479-    if (direct) return direct;
9480-
9481-    var companies = Array.isArray(c.companies) ? c.companies : [];
9482-    for (var i = 0; i < companies.length; i += 1) {
9483-      var row = companies[i] || {};
9484-      var id = t(row.aicm_user_company_id || row.company_id || row.id);
9485-      if (cid && id === cid) return t(row.company_name || row.name || row.display_name) || "選択中";
9486-    }
9487-    return "選択中";
9488-  }
9489-
9490-  function rerender() {
9491-    if (typeof window.render === "function") return window.render();
9492-    if (typeof window.renderApp === "function") return window.renderApp();
9493-    if (typeof window.aicmRender === "function") return window.aicmRender();
9494-  }
9495-
9496-  function hydrateIfNeeded(appState) {
9497-
9498:  // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper begin
9499:  function aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload) {
9500-    appState = appState || {};
9501-    payload = payload && typeof payload === "object" ? payload : {};
9502-
9503-    var payloadContext = payload.context && typeof payload.context === "object" ? payload.context : {};
9504-    var payloadData = payload.data && typeof payload.data === "object" ? payload.data : {};
9505-
9506-    var rows = [];
9507-    if (Array.isArray(payload.review_wait_items)) rows = payload.review_wait_items;
9508-    else if (Array.isArray(payloadContext.review_wait_items)) rows = payloadContext.review_wait_items;
9509-    else if (Array.isArray(payloadData.review_wait_items)) rows = payloadData.review_wait_items;
9510-    else if (Array.isArray(payload.human_review_wait_items)) rows = payload.human_review_wait_items;
9511-    else if (Array.isArray(payload.reviewWaitItems)) rows = payload.reviewWaitItems;
9512-    else if (Array.isArray(payload.humanReviewWaitItems)) rows = payload.humanReviewWaitItems;
9513-
9514-    if (!Array.isArray(rows)) rows = [];
9515-
9516-    if (!appState.context || typeof appState.context !== "object") {
9517-      appState.context = {};
9518-    }
9519-
9520-    appState.context.review_wait_items = rows;
9521-    appState.review_wait_items = rows;
9522-
9523-    if (payload.owner_civilization_id) {
9524-      appState.context.owner_civilization_id = payload.owner_civilization_id;
9525-      appState.owner_civilization_id = payload.owner_civilization_id;
9526-    }
9527-
9528-    if (payload.aicm_user_company_id) {
9529-      appState.context.aicm_user_company_id = payload.aicm_user_company_id;
9530-      appState.selectedCompanyId = payload.aicm_user_company_id;
9531-    }
9532-
9533-    if (typeof state !== "undefined" && state && state !== appState) {
9534-      if (!state.context || typeof state.context !== "object") {
9535-        state.context = {};
9536-      }
9537-      state.context.review_wait_items = rows;
9538-      state.review_wait_items = rows;
9539-
9540-      if (payload.owner_civilization_id) {
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
9554:  // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper end
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
9569-
9570-    var params = new URLSearchParams();
9571-    params.set("owner_civilization_id", owner);
9572-    params.set("aicm_user_company_id", company);
9573-    params.set("v", "r8z_v7_" + Date.now());
9574-
9575-    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
9576-      .then(function (res) {
9577-        return res.text().then(function (bodyText) {
9578-          var payload = {};
9579-          try {
9580-            payload = bodyText ? JSON.parse(bodyText) : {};
9581-          } catch (_error) {
9582-            payload = {};
9583-          }
9584-
9585:          // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: merge payload review_wait_items into appState/state
9586:          aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
9587-
9588-
9589-          if (res.ok && payload && payload.result === "ok") {
9590-            normalize(appState, payload);
9591-          } else {
9592-            appState.aicmR8zV7HydrationError = payload.error_message || ("context status " + String(res.status));
9593-          }
9594-        });
9595-      })
9596-      .catch(function (error) {
9597-        appState.aicmR8zV7HydrationError = String(error && error.message ? error.message : error);
9598-      })
9599-      .finally(function () {
9600-        appState.aicmR8zV7Hydrating = false;
9601-        if (appState.screen === "review-list") rerender();
9602-      });
9603-  }
9604-
9605-  function statusLabel(row) {
9606-    var status = first(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
9607-    if (status === "pending") return "承認待ち";
9608-    if (status === "approved") return "承認済み";
9609-    if (status === "returned") return "差し戻し";
9610-    if (status === "archived") return "アーカイブ";
9611-    return status;
9612-  }
9613-
9614-  window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
PASS: V8G marker exists in core

============================================================
7. context API still OK
============================================================
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v8g_20260503_103047
CONTEXT_HTTP=200
result=ok
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true
PASS: context still exposes review_wait_items=2

============================================================
8. served core vs disk
============================================================
SERVED_HTTP=200
DISK_SHA=6161580704812d73afa5dab4f4672718c17868a11dbea661e45bed7bee09cd66
SERVED_SHA=6161580704812d73afa5dab4f4672718c17868a11dbea661e45bed7bee09cd66
PASS: served core matches disk core

============================================================
9. FINAL JUDGEMENT
============================================================
REVIEW_COUNT=2
MARKER_COUNT=3
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v8g_20260503_103047
PASS_COUNT=11
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=CORE_V7_REVIEW_WAIT_ITEMS_MERGE_PATCH_READY_FOR_BROWSER_CHECK
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047/000_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE_FIX_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047/aicm-production-core.before_r8z_v8g.js
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047/050_core_v8g_patch_snip.txt
CONTEXT_PARSE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047/031_context_verify_parse.txt
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

BROWSER_CHECK:
1. ブラウザで以下を開く:
   http://127.0.0.1:8794/?v=r8z_v8g_20260503_103047

2. AI企業で「ウルフ」を選択:
   company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa

3. 「レビュー・承認待ち一覧」を開く

期待表示:
- レビュー・承認待ち: 2件
- 納品サマリー確認: AI企業業務開始導線の整備 作業
- 納品サマリー確認: Manager大項目台帳運用の整備 作業
- 承認ボタン
- 差し戻しボタン

分岐:
- 2件表示された:
  次は承認/差し戻し rollback smoke。

- まだ rows=0 / hydrating=YES:
  V7 merge callが実行されていない可能性。
  次はfetch then内の実行位置か、browser console相当の画面debug追加だけ確認。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047/aicm-production-core.before_r8z_v8g.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
