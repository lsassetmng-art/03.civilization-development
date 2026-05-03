============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し最終確認カード

現在位置:
- V10GC2F後、承認確認へ進むでは止まらない
- ただし確認画面で承認/差し戻し実行ができない
- V10GC2Bで既存server route接続済み
- V10GC2Fでone-shot prime済み

今回:
1. DB pending itemをread-only確認
2. server既存route / approveHumanReviewItem / returnHumanReviewItem を抽出
3. core V10GC2B / V10GC2F / 確認画面生成部分を抽出
4. payload keyズレ、routeズレ、button actionズレ、review id取得ズレを分類
5. ファイル出力して次修正方針を決める

禁止:
- DB write
- API POST
- PATCH
- server再起動

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. DB readonly pending review items
============================================================
pending_count_table	2
pending_count_view	2
pending_item	bc553839-ebca-4610-81e3-31dc21476a48 | pending | 納品サマリー確認: AI企業業務開始導線の整備 作業
pending_item	bd30bc28-c6d8-4fee-aebc-1311db979988 | pending | 納品サマリー確認: Manager大項目台帳運用の整備 作業

============================================================
4. server scan
============================================================
HAS_APPROVE_FUNCTION=true
HAS_RETURN_FUNCTION=true
APPROVE_FUNCTION_LINE=572
RETURN_FUNCTION_LINE=598
APPROVE_ROUTE_CANDIDATES=/api/aicm/v2/leader-auto-decomposition/run,/api/aicm/v2/manager-major/archive,/api/aicm/v2/manager-major/import-csv,/api/aicm/v2/human-review/create,/api/aicm/v2/human-review/approve,/api/aicm/v2/human-review/return,/api/aicm/v2/company/update
RETURN_ROUTE_CANDIDATES=/api/aicm/v2/manager-major/archive,/api/aicm/v2/manager-major/import-csv,/api/aicm/v2/human-review/create,/api/aicm/v2/human-review/approve,/api/aicm/v2/human-review/return,/api/aicm/v2/company/update,/api/aicm/v2/department/update
APPROVE_BODY_KEYS=aicm_human_review_item_id,human_review_note,human_reviewer_label,owner_civilization_id
RETURN_BODY_KEYS=aicm_human_review_item_id,human_review_note,human_reviewer_label,owner_civilization_id
APPROVE_FUNCTION_HAS_HUMAN_TABLE=true
RETURN_FUNCTION_HAS_HUMAN_TABLE=true
APPROVE_FUNCTION_HAS_PENDING_GUARD=false
RETURN_FUNCTION_HAS_PENDING_GUARD=false

============================================================
APPROVE ROUTE HITS
============================================================
LINE=572 ROUTES=
    "    " + aicmHumanReviewOptionalUuidSql(body.related_worker_work_unit_id) + ",",
    "    " + sqlLiteral(aicmHumanReviewKind(body.review_kind_code)) + ",",
    "    " + sqlLiteral(aicmHumanReviewArtifactKind(body.artifact_kind_code)) + ",",
    "    " + sqlLiteral(title) + ",",
    "    " + aicmHumanReviewTextSql(body.delivery_summary_text) + ",",
    "    " + aicmHumanReviewTextSql(body.main_changes_text) + ",",
    "    " + aicmHumanReviewTextSql(body.ai_review_result_text) + ",",
    "    " + aicmHumanReviewTextSql(body.unresolved_issues_text) + ",",
    "    " + aicmHumanReviewTextSql(body.artifact_link) + ",",
    "    " + aicmHumanReviewTextSql(body.responsible_ai_label) + ",",
    "    " + aicmHumanReviewTextSql(body.requested_by_ai_label) + ",",
    "    'pending',",
    "    " + sqlLiteral(aicmHumanReviewPriority(body.priority_code)) + ",",
    "    " + aicmHumanReviewOptionalDateSql(body.due_date) + ",",
    "    COALESCE(NULLIF(" + sqlLiteral(String(body.display_order || "")) + ", '')::integer, 100),",
    "    '{}'::jsonb",
    "  )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'human_review_item', to_jsonb(inserted)",
    ")::text",
    "FROM inserted;"
  ].join("\n");

  return runPsqlJson(sql);
}

function approveHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'approved',",
    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
    "      reviewed_at = now(),",
    "      updated_at = now()",

LINE=2127 ROUTES=/api/aicm/v2/leader-auto-decomposition/run,/api/aicm/v2/manager-major/archive,/api/aicm/v2/manager-major/import-csv,/api/aicm/v2/human-review/create,/api/aicm/v2/human-review/approve,/api/aicm/v2/human-review/return,/api/aicm/v2/company/update
    }

    
    if (route === "/api/aicm/v2/leader-auto-decomposition/run" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, runLeaderAutoDecomposition(body));
      return true;
    }
if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, archiveManagerMajorItem(body));
      return true;
    }

// AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
    if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, importManagerMajorItemsCsv(body));
      return true;
    }


    if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, createHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, approveHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, returnHumanReviewItem(body));
      return true;
    }


    if (route === "/api/aicm/v2/company/update" && req.method === "POST") {


============================================================
RETURN ROUTE HITS
============================================================
LINE=598 ROUTES=

  return runPsqlJson(sql);
}

function approveHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'approved',",
    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
    "      reviewed_at = now(),",
    "      updated_at = now()",
    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

function returnHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'returned',",
    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
    "      reviewed_at = now(),",
    "      updated_at = now()",

LINE=2133 ROUTES=/api/aicm/v2/manager-major/archive,/api/aicm/v2/manager-major/import-csv,/api/aicm/v2/human-review/create,/api/aicm/v2/human-review/approve,/api/aicm/v2/human-review/return,/api/aicm/v2/company/update,/api/aicm/v2/department/update
      return true;
    }
if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, archiveManagerMajorItem(body));
      return true;
    }

// AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
    if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, importManagerMajorItemsCsv(body));
      return true;
    }


    if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, createHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, approveHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, returnHumanReviewItem(body));
      return true;
    }


    if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateCompany(body));
      return true;
    }

    if (route === "/api/aicm/v2/department/update" && req.method === "POST") {


============================================================
APPROVE FUNCTION EXTRACT
============================================================
function approveHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'approved',",
    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
    "      reviewed_at = now(),",
    "      updated_at = now()",
    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

============================================================
RETURN FUNCTION EXTRACT
============================================================
function returnHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'returned',",
    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
    "      reviewed_at = now(),",
    "      updated_at = now()",
    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

============================================================
5. core scan
============================================================
V10GC2B_BLOCK_EXISTS=true
V10GC2F_BLOCK_EXISTS=true
V10GC2C_BLOCK_EXISTS=false
V10GC2D_BLOCK_EXISTS=false
CORE_APPROVE_ROUTE_COUNT=2
CORE_RETURN_ROUTE_COUNT=2
CORE_APPROVE_ACTION_COUNT=4
CORE_RETURN_ACTION_COUNT=4
CORE_EXECUTE_FUNCTION_EXPORTED=1
CORE_UPGRADE_FUNCTION_EXPORTED=3
CORE_BUILD_PAYLOAD_KEYS=
CORE_CURRENT_REVIEW_ID_HAS_DOM_SCAN=true
CORE_CURRENT_REVIEW_ID_HAS_STATE_SCAN=true
CORE_CLICK_HANDLER_CAPTURE=true
CORE_STOP_IMMEDIATE_PROPAGATION=true

============================================================
V10GC2B BLOCK
============================================================
// AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_START
  // Final-confirm-only review decision executor using existing server routes.
  (function installAicmR8zV10gc2bReviewExistingRouteDecisionCore() {
    var APPROVE_ROUTE = "/api/aicm/v2/human-review/approve";
    var RETURN_ROUTE = "/api/aicm/v2/human-review/return";

    function app() {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
      return {};
    }

    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function isUuid(value) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text(value));
    }

    function message(kind, value) {
      try {
        if (typeof setMessage === "function") {
          setMessage(kind, value);
          return;
        }
      } catch (_) {}
      try {
        var s = app();
        s.messageKind = kind;
        s.messageText = value;
      } catch (_) {}
    }

    function deepFindReviewId(obj, depth) {
      if (!obj || depth > 5 || typeof obj !== "object") return "";

      var keys = [
        "aicm_human_review_item_id",
        "review_item_id",
        "review_id",
        "reviewId",
        "id"
      ];

      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (isUuid(obj[key])) return text(obj[key]);
      }

      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (!/review|item|confirm|selected|detail|id/i.test(k)) continue;

        var v = obj[k];
        if (isUuid(v)) return text(v);

        var nested = deepFindReviewId(v, depth + 1);
        if (nested) return nested;
      }

      return "";
    }

    function currentConfirmObject() {
      var s = app();
      return (
        s.aicmR8zV10fReviewConfirm ||
        s.reviewDecisionConfirm ||
        s.reviewConfirm ||
        s.aicmReviewConfirm ||
        s.selectedReview ||
        s.reviewDetail ||
        null
      );
    }

    function currentReviewId(button) {
      var fromButton = button ? text(
        button.getAttribute("data-review-item-id") ||
        button.getAttribute("data-review-id") ||
        button.getAttribute("data-aicm-human-review-item-id") ||
        ""
      ) : "";

      if (isUuid(fromButton)) return fromButton;

      var confirm = currentConfirmObject();
      var fromConfirm = deepFindReviewId(confirm, 0);
      if (fromConfirm) return fromConfirm;

      try {
        var node = document.querySelector("[data-review-item-id],[data-review-id],[data-aicm-human-review-item-id]");
        if (node) {
          var domId = text(
            node.getAttribute("data-review-item-id") ||
            node.getAttribute("data-review-id") ||
            node.getAttribute("data-aicm-human-review-item-id") ||
            ""
          );
          if (isUuid(domId)) return domId;
        }
      } catch (_) {}

      return deepFindReviewId(app(), 0);
    }

    function decisionFromAction(action) {
      if (action === "review-v10gc2b-execute-approved") return "approved";
      if (action === "review-v10gc2b-execute-returned") return "returned";
      return "";
    }

    function routeForDecision(decision) {
      return decision === "approved" ? APPROVE_ROUTE : RETURN_ROUTE;
    }

    function buildPayload(reviewItemId, decision, note) {
      return {
        aicm_human_review_item_id: reviewItemId,
        review_item_id: reviewItemId,
        review_id: reviewItemId,
        human_review_status_code: decision,
        decision: decision,
        note: note || "",
        human_review_note: note || ""
      };
    }

    async function postDecision(reviewItemId, decision, note) {
      var route = routeForDecision(decision);
      var response = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(reviewItemId, decision, note))
      });

      var json = null;
      try { json = await response.json(); } catch (_) { json = null; }

      if (!response.ok || !json || (json.result && json.result !== "ok")) {
        throw new Error(json && (json.error || json.message) ? (json.error || json.message) : "レビュー更新に失敗しました。");
      }

      return json;
    }

    function removeReviewFromState(reviewItemId) {
      var s = app();
      var id = text(reviewItemId);

      function same(row) {
        return text(row && (
          row.aicm_human_review_item_id ||
          row.review_item_id ||
          row.review_id ||
          row.id ||
          ""
        )) === id;
      }

      function filterRows(rows) {
        return Array.isArray(rows) ? rows.filter(function(row) { return !same(row); }) : rows;
      }

      try {
        s.review_wait_items = filterRows(s.review_wait_items);
        if (s.context && typeof s.context === "object") {
          s.context.review_wait_items = filterRows(s.context.review_wait_items);
        }
      } catch (_) {}
    }

    async function reloadReviewList(reviewItemId) {
      removeReviewFromState(reviewItemId);

      try {
        var s = app();
        s.screen = "review-list";
        s.aicmR8zV9Hydrated = false;
        s.aicmR8zV9Hydrating = false;
      } catch (_) {}

      try {
        if (typeof aicmR8zV9ReviewListScriptHydrate === "function") {
          aicmR8zV9ReviewListScriptHydrate(app());
        }
      } catch (_) {}

      try {
        if (typeof render === "function") render();
      } catch (_) {}
    }

    function noteValue() {
      try {
        var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
        return node ? text(node.value) : "";
      } catch (_) {
        return "";
      }
    }

    async function execute(button, action) {
      var decision = decisionFromAction(action);
      if (!decision) return false;

      var reviewItemId = currentReviewId(button);

      if (!reviewItemId) {
        message("error", "review item id が見つかりません。成果物詳細からやり直してください。");
        if (typeof render === "function") render();
        return true;
      }

      try {
        if (button) button.disabled = true;
        message("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

        await postDecision(reviewItemId, decision, noteValue());

        try {
          var s = app();
          s.aicmR8zV10fReviewConfirm = null;
          s.reviewDecisionConfirm = null;
          s.reviewConfirm = null;
        } catch (_) {}

        message("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await reloadReviewList(reviewItemId);
      } catch (error) {
        if (button) button.disabled = false;
        message("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "承認を実行する";
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "差し戻しを実行する";
          }
        });
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("[data-core-action]") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        execute(button, action);
      }, true);

      document.addEventListener("click", function() {
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 250);
        setTimeout(upgradeButtons, 700);
      }, true);
    }

    var originalRenderV10GC2B = typeof render === "function" ? render : null;
    if (originalRenderV10GC2B && !originalRenderV10GC2B.__aicmR8zV10gc2bWrapped) {
      var wrappedRenderV10GC2B = function() {
        var result = originalRenderV10GC2B.apply(this, arguments);
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 250);
        return result;
      };
      wrappedRenderV10GC2B.__aicmR8zV10gc2bWrapped = true;
      wrappedRenderV10GC2B.__aicmR8zV10gc2bOriginal = originalRenderV10GC2B;
      render = wrappedRenderV10GC2B;
    }

    setTimeout(upgradeButtons, 500);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2bExecuteReviewDecision = execute;
      window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END

============================================================
V10GC2F BLOCK
============================================================
// AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "差し戻しを実行する";
            changed += 1;
          }
        });

        if (typeof window !== "undefined") {
          window.aicmR8zV10gc2fLastPrime = {
            changed: changed,
            at: new Date().toISOString()
          };
        }

        return changed > 0;
      } catch (error) {
        try { console.warn("AICM V10GC2F one-shot prime failed", error); } catch (_) {}
        return false;
      }
    }

    function oneShotPrime() {
      setTimeout(enableFinalButtonsNow, 0);
      setTimeout(enableFinalButtonsNow, 80);
      setTimeout(enableFinalButtonsNow, 180);
      setTimeout(enableFinalButtonsNow, 350);
      setTimeout(enableFinalButtonsNow, 700);
      setTimeout(enableFinalButtonsNow, 1200);
      setTimeout(enableFinalButtonsNow, 2000);
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        if (!button) return;

        if (looksLikeConfirmOpenButton(button)) {
          // Do not stop propagation. Let existing app route open the confirm card.
          oneShotPrime();
        }
      }, true);
    }

    var originalRenderV10GC2F = typeof render === "function" ? render : null;
    if (originalRenderV10GC2F && !originalRenderV10GC2F.__aicmR8zV10gc2fWrapped) {
      var wrappedRenderV10GC2F = function() {
        var result = originalRenderV10GC2F.apply(this, arguments);
        oneShotPrime();
        return result;
      };
      wrappedRenderV10GC2F.__aicmR8zV10gc2fWrapped = true;
      wrappedRenderV10GC2F.__aicmR8zV10gc2fOriginal = originalRenderV10GC2F;
      render = wrappedRenderV10GC2F;
    }

    setTimeout(enableFinalButtonsNow, 300);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2fPrimeReviewConfirmButtons = oneShotPrime;
      window.aicmR8zV10gc2fEnableFinalButtonsNow = enableFinalButtonsNow;
    }
  })();
  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_END
============================================================
6. confirm screen scan
============================================================
---- 承認前の最終確認 around ----
---- hit line 12683 pattern=承認前の最終確認 ----
      return text(row && (
        row.aicm_human_review_item_id ||
        row.human_review_item_id ||
        row.review_id ||
        row.id ||
        ""
      ));
    }

    function findRowById(id) {
      id = text(id);
      var rows = fetchRows();

      for (var i = 0; i < rows.length; i += 1) {
        if (reviewId(rows[i]) === id) return rows[i];
      }

      return null;
    }

    function field(label, value) {
      return '<dt>' + esc(label) + '</dt><dd>' + esc(text(value) || "-") + '</dd>';
    }

    function removeExistingConfirm() {
      if (typeof document === "undefined") return;

      var nodes = document.querySelectorAll('[data-aicm-v10f-confirm="true"]');
      for (var i = 0; i < nodes.length; i += 1) {
        if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
      }
    }

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

    function findActionElement(target) {
      while (target && target !== document) {
        if (target.getAttribute && target.getAttribute("data-core-action")) return target;
        target = target.parentNode;
      }
      return null;
    }

    function findInsertHost(actionEl) {
      var host = actionEl;


---- hit line 13478 pattern=承認前の最終確認 ----
        if (typeof render === "function") render();
        return true;
      }

      try {
        if (button) button.disabled = true;
        message("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

        await postDecision(reviewItemId, decision, noteValue());

        try {
          var s = app();
          s.aicmR8zV10fReviewConfirm = null;
          s.reviewDecisionConfirm = null;
          s.reviewConfirm = null;
        } catch (_) {}

        message("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await reloadReviewList(reviewItemId);
      } catch (error) {
        if (button) button.disabled = false;
        message("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "承認を実行する";
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "差し戻しを実行する";
          }
        });
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("[data-core-action]") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}


---- hit line 13577 pattern=承認前の最終確認 ----
      wrappedRenderV10GC2B.__aicmR8zV10gc2bOriginal = originalRenderV10GC2B;
      render = wrappedRenderV10GC2B;
    }

    setTimeout(upgradeButtons, 500);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2bExecuteReviewDecision = execute;
      window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";

---- hit line 13585 pattern=承認前の最終確認 ----
      window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;

---- 差し戻し前の最終確認 around ----
---- hit line 12683 pattern=差し戻し前の最終確認 ----
      return text(row && (
        row.aicm_human_review_item_id ||
        row.human_review_item_id ||
        row.review_id ||
        row.id ||
        ""
      ));
    }

    function findRowById(id) {
      id = text(id);
      var rows = fetchRows();

      for (var i = 0; i < rows.length; i += 1) {
        if (reviewId(rows[i]) === id) return rows[i];
      }

      return null;
    }

    function field(label, value) {
      return '<dt>' + esc(label) + '</dt><dd>' + esc(text(value) || "-") + '</dd>';
    }

    function removeExistingConfirm() {
      if (typeof document === "undefined") return;

      var nodes = document.querySelectorAll('[data-aicm-v10f-confirm="true"]');
      for (var i = 0; i < nodes.length; i += 1) {
        if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
      }
    }

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

    function findActionElement(target) {
      while (target && target !== document) {
        if (target.getAttribute && target.getAttribute("data-core-action")) return target;
        target = target.parentNode;
      }
      return null;
    }

    function findInsertHost(actionEl) {
      var host = actionEl;


---- hit line 13479 pattern=差し戻し前の最終確認 ----
        return true;
      }

      try {
        if (button) button.disabled = true;
        message("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

        await postDecision(reviewItemId, decision, noteValue());

        try {
          var s = app();
          s.aicmR8zV10fReviewConfirm = null;
          s.reviewDecisionConfirm = null;
          s.reviewConfirm = null;
        } catch (_) {}

        message("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await reloadReviewList(reviewItemId);
      } catch (error) {
        if (button) button.disabled = false;
        message("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "承認を実行する";
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "差し戻しを実行する";
          }
        });
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("[data-core-action]") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        execute(button, action);

---- hit line 13578 pattern=差し戻し前の最終確認 ----
      render = wrappedRenderV10GC2B;
    }

    setTimeout(upgradeButtons, 500);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2bExecuteReviewDecision = execute;
      window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");

---- hit line 13586 pattern=差し戻し前の最終確認 ----
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");

---- 承認確認へ進む around ----
---- hit line 11695 pattern=承認確認へ進む ----
      var row = findSelectedRow(appState);
      if (!row) return "";

      var id = reviewId(row);
      var m = meta(row);
      var title = t(row.review_title || row.title || "レビュー項目");

      return [
        '<section class="aicm-core-card" style="border:2px solid #f59e0b;">',
        '  <p class="aicm-eyebrow">成果物確認</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">承認/差し戻しの前に、成果物内容を確認してください。ここではDB更新しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", id),
        renderField("レビュー種別", row.review_kind_label || row.review_kind_code),
        renderField("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        renderField("優先度", row.priority_code),
        renderField("依頼日時", row.requested_at || row.created_at),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        renderField("会社", row.company_name),
        renderField("部門", row.department_name),
        renderField("課", row.section_name),
        '  </dl>',
        renderArtifactLink(row),
        '</section>',
        renderTextSection("納品サマリー", row.delivery_summary_text),
        renderTextSection("主な変更点", row.main_changes_text),
        renderTextSection("AIレビュー結果", row.ai_review_result_text),
        renderTextSection("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">V10DではまだDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d-close-detail">一覧へ戻る</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3200)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreviewDecisionCard(appState) {
      appState = app(appState);
      var mode = t(appState.aicmR8zV10dDecisionPreviewMode || "");
      var row = findSelectedRow(appState);

      if (!mode || !row) return "";

      var title = mode === "approve" ? "承認確認プレビュー" : "差し戻し確認プレビュー";
      var note = mode === "approve"
        ? "次工程V10Eでrollback smoke後に承認DB更新を確認します。"
        : "次工程V10Eでrollback smoke後に差し戻しDB更新を確認します。";

      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">' + esc(note) + '</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", reviewId(row)),
        renderField("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d-clear-preview">プレビューを閉じる</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function renderListRow(row, index, currentId) {
      var id = reviewId(row);
      var title = t(row.review_title || row.title || "レビュー項目");
      var summary = t(row.delivery_summary_text || row.summary || row.description || "");

---- hit line 12164 pattern=承認確認へ進む ----
    function renderInlineDetail(row) {
      if (!row) return "";

      var id = reviewId(row);
      var m = meta(row);
      var title = t(row.review_title || row.title || "レビュー項目");

      return [
        '<section id="aicm-v10d2-detail-' + esc(id) + '" class="aicm-core-card" style="border:3px solid #f59e0b;background:#fffbeb;">',
        '  <p class="aicm-eyebrow">成果物確認 / 選択中</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">このカードは押したレビュー項目の直下に表示しています。承認/差し戻しの前に内容を確認してください。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", id),
        renderField("レビュー種別", row.review_kind_label || row.review_kind_code),
        renderField("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        renderField("優先度", row.priority_code),
        renderField("依頼日時", row.requested_at || row.created_at),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        renderField("会社", row.company_name),
        renderField("部門", row.department_name),
        renderField("課", row.section_name),
        '  </dl>',
        renderArtifactLink(row),
        '</section>',
        renderTextSection("納品サマリー", row.delivery_summary_text),
        renderTextSection("主な変更点", row.main_changes_text),
        renderTextSection("AIレビュー結果", row.ai_review_result_text),
        renderTextSection("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">ここではDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d2-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d2-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d2-close-detail">詳細を閉じる</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3200)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreview(appState, row) {
      appState = app(appState);
      var mode = t(appState.aicmR8zV10d2DecisionPreviewMode || "");
      if (!mode || !row) return "";

      var title = mode === "approve" ? "承認確認プレビュー" : "差し戻し確認プレビュー";

      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">これはプレビューです。DB更新はまだ実行しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", reviewId(row)),
        renderField("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d2-clear-preview">プレビューを閉じる</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function renderListRow(appState, row, index, currentId) {
      var id = reviewId(row);
      var title = t(row.review_title || row.title || "レビュー項目");
      var summary = t(row.delivery_summary_text || row.summary || row.description || "");
      var selected = id && id === currentId;

      return [
        '<article class="aicm-core-card" style="' + (selected ? 'border:2px solid #f59e0b;' : 'border:1px solid #dbeafe;') + '">',
        '  <p class="aicm-eyebrow">レビュー待ち #' + esc(String(index + 1)) + '</p>',

---- hit line 13031 pattern=承認確認へ進む ----
      return blocks.join("");
    }

    function renderDetail(row, id) {
      var m = meta(row);
      var title = text(row.review_title || row.title || "レビュー項目");

      return [
        '<section id="' + esc(detailId(id)) + '" class="aicm-core-card" style="border:3px solid #f59e0b;background:#fffbeb;">',
        '  <p class="aicm-eyebrow">成果物確認 / V10D4</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">この詳細カードはクリック互換bridgeで押した行の直下に挿入しています。承認/差し戻しの前に確認してください。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("review_id", id),
        field("レビュー種別", row.review_kind_label || row.review_kind_code),
        field("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        field("優先度", row.priority_code),
        field("依頼日時", row.requested_at || row.created_at),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        field("会社", row.company_name),
        field("部門", row.department_name),
        field("課", row.section_name),
        '  </dl>',
        artifactLink(row),
        '</section>',
        section("納品サマリー", row.delivery_summary_text),
        section("主な変更点", row.main_changes_text),
        section("AIレビュー結果", row.ai_review_result_text),
        section("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">ここではDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d4-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d4-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d4-close-detail" data-review-id="' + esc(id) + '">詳細を閉じる</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3400)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreview(row, mode, id) {
      var title = mode === "approve" ? "承認確認プレビュー / V10D4" : "差し戻し確認プレビュー / V10D4";
      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">これはプレビューです。DB更新はまだ実行しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("review_id", id),
        field("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '</section>'
      ].join("");
    }

    function removeExistingDetails() {
      if (typeof document === "undefined") return;
      var existing = document.querySelectorAll('[data-aicm-v10d4-detail="true"]');
      for (var i = 0; i < existing.length; i += 1) {
        if (existing[i] && existing[i].parentNode) existing[i].parentNode.removeChild(existing[i]);
      }
    }

    function findActionElement(target) {
      while (target && target !== document) {
        if (target.getAttribute && target.getAttribute("data-core-action")) return target;
        target = target.parentNode;
      }
      return null;
    }

    function setVisibleDebug(message) {

---- hit line 13575 pattern=承認確認へ進む ----
      };
      wrappedRenderV10GC2B.__aicmR8zV10gc2bWrapped = true;
      wrappedRenderV10GC2B.__aicmR8zV10gc2bOriginal = originalRenderV10GC2B;
      render = wrappedRenderV10GC2B;
    }

    setTimeout(upgradeButtons, 500);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2bExecuteReviewDecision = execute;
      window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");

---- 差し戻し確認へ進む around ----
---- hit line 11696 pattern=差し戻し確認へ進む ----
      if (!row) return "";

      var id = reviewId(row);
      var m = meta(row);
      var title = t(row.review_title || row.title || "レビュー項目");

      return [
        '<section class="aicm-core-card" style="border:2px solid #f59e0b;">',
        '  <p class="aicm-eyebrow">成果物確認</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">承認/差し戻しの前に、成果物内容を確認してください。ここではDB更新しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", id),
        renderField("レビュー種別", row.review_kind_label || row.review_kind_code),
        renderField("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        renderField("優先度", row.priority_code),
        renderField("依頼日時", row.requested_at || row.created_at),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        renderField("会社", row.company_name),
        renderField("部門", row.department_name),
        renderField("課", row.section_name),
        '  </dl>',
        renderArtifactLink(row),
        '</section>',
        renderTextSection("納品サマリー", row.delivery_summary_text),
        renderTextSection("主な変更点", row.main_changes_text),
        renderTextSection("AIレビュー結果", row.ai_review_result_text),
        renderTextSection("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">V10DではまだDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d-close-detail">一覧へ戻る</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3200)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreviewDecisionCard(appState) {
      appState = app(appState);
      var mode = t(appState.aicmR8zV10dDecisionPreviewMode || "");
      var row = findSelectedRow(appState);

      if (!mode || !row) return "";

      var title = mode === "approve" ? "承認確認プレビュー" : "差し戻し確認プレビュー";
      var note = mode === "approve"
        ? "次工程V10Eでrollback smoke後に承認DB更新を確認します。"
        : "次工程V10Eでrollback smoke後に差し戻しDB更新を確認します。";

      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">' + esc(note) + '</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", reviewId(row)),
        renderField("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d-clear-preview">プレビューを閉じる</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function renderListRow(row, index, currentId) {
      var id = reviewId(row);
      var title = t(row.review_title || row.title || "レビュー項目");
      var summary = t(row.delivery_summary_text || row.summary || row.description || "");
      var selected = id && id === currentId;

---- hit line 12165 pattern=差し戻し確認へ進む ----
      if (!row) return "";

      var id = reviewId(row);
      var m = meta(row);
      var title = t(row.review_title || row.title || "レビュー項目");

      return [
        '<section id="aicm-v10d2-detail-' + esc(id) + '" class="aicm-core-card" style="border:3px solid #f59e0b;background:#fffbeb;">',
        '  <p class="aicm-eyebrow">成果物確認 / 選択中</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">このカードは押したレビュー項目の直下に表示しています。承認/差し戻しの前に内容を確認してください。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", id),
        renderField("レビュー種別", row.review_kind_label || row.review_kind_code),
        renderField("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        renderField("優先度", row.priority_code),
        renderField("依頼日時", row.requested_at || row.created_at),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        renderField("会社", row.company_name),
        renderField("部門", row.department_name),
        renderField("課", row.section_name),
        '  </dl>',
        renderArtifactLink(row),
        '</section>',
        renderTextSection("納品サマリー", row.delivery_summary_text),
        renderTextSection("主な変更点", row.main_changes_text),
        renderTextSection("AIレビュー結果", row.ai_review_result_text),
        renderTextSection("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">ここではDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d2-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d2-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d2-close-detail">詳細を閉じる</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3200)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreview(appState, row) {
      appState = app(appState);
      var mode = t(appState.aicmR8zV10d2DecisionPreviewMode || "");
      if (!mode || !row) return "";

      var title = mode === "approve" ? "承認確認プレビュー" : "差し戻し確認プレビュー";

      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">これはプレビューです。DB更新はまだ実行しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", reviewId(row)),
        renderField("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d2-clear-preview">プレビューを閉じる</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function renderListRow(appState, row, index, currentId) {
      var id = reviewId(row);
      var title = t(row.review_title || row.title || "レビュー項目");
      var summary = t(row.delivery_summary_text || row.summary || row.description || "");
      var selected = id && id === currentId;

      return [
        '<article class="aicm-core-card" style="' + (selected ? 'border:2px solid #f59e0b;' : 'border:1px solid #dbeafe;') + '">',
        '  <p class="aicm-eyebrow">レビュー待ち #' + esc(String(index + 1)) + '</p>',
        '  <h3>' + esc(title) + '</h3>',

---- hit line 13032 pattern=差し戻し確認へ進む ----
    }

    function renderDetail(row, id) {
      var m = meta(row);
      var title = text(row.review_title || row.title || "レビュー項目");

      return [
        '<section id="' + esc(detailId(id)) + '" class="aicm-core-card" style="border:3px solid #f59e0b;background:#fffbeb;">',
        '  <p class="aicm-eyebrow">成果物確認 / V10D4</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">この詳細カードはクリック互換bridgeで押した行の直下に挿入しています。承認/差し戻しの前に確認してください。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("review_id", id),
        field("レビュー種別", row.review_kind_label || row.review_kind_code),
        field("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        field("優先度", row.priority_code),
        field("依頼日時", row.requested_at || row.created_at),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        field("会社", row.company_name),
        field("部門", row.department_name),
        field("課", row.section_name),
        '  </dl>',
        artifactLink(row),
        '</section>',
        section("納品サマリー", row.delivery_summary_text),
        section("主な変更点", row.main_changes_text),
        section("AIレビュー結果", row.ai_review_result_text),
        section("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">ここではDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d4-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d4-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d4-close-detail" data-review-id="' + esc(id) + '">詳細を閉じる</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3400)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreview(row, mode, id) {
      var title = mode === "approve" ? "承認確認プレビュー / V10D4" : "差し戻し確認プレビュー / V10D4";
      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">これはプレビューです。DB更新はまだ実行しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("review_id", id),
        field("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '</section>'
      ].join("");
    }

    function removeExistingDetails() {
      if (typeof document === "undefined") return;
      var existing = document.querySelectorAll('[data-aicm-v10d4-detail="true"]');
      for (var i = 0; i < existing.length; i += 1) {
        if (existing[i] && existing[i].parentNode) existing[i].parentNode.removeChild(existing[i]);
      }
    }

    function findActionElement(target) {
      while (target && target !== document) {
        if (target.getAttribute && target.getAttribute("data-core-action")) return target;
        target = target.parentNode;
      }
      return null;
    }

    function setVisibleDebug(message) {
      var s = app();

---- hit line 13576 pattern=差し戻し確認へ進む ----
      wrappedRenderV10GC2B.__aicmR8zV10gc2bWrapped = true;
      wrappedRenderV10GC2B.__aicmR8zV10gc2bOriginal = originalRenderV10GC2B;
      render = wrappedRenderV10GC2B;
    }

    setTimeout(upgradeButtons, 500);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2bExecuteReviewDecision = execute;
      window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";

---- 承認を実行 around ----
---- hit line 13449 pattern=承認を実行 ----

      try {
        if (typeof aicmR8zV9ReviewListScriptHydrate === "function") {
          aicmR8zV9ReviewListScriptHydrate(app());
        }
      } catch (_) {}

      try {
        if (typeof render === "function") render();
      } catch (_) {}
    }

    function noteValue() {
      try {
        var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
        return node ? text(node.value) : "";
      } catch (_) {
        return "";
      }
    }

    async function execute(button, action) {
      var decision = decisionFromAction(action);
      if (!decision) return false;

      var reviewItemId = currentReviewId(button);

      if (!reviewItemId) {
        message("error", "review item id が見つかりません。成果物詳細からやり直してください。");
        if (typeof render === "function") render();
        return true;
      }

      try {
        if (button) button.disabled = true;
        message("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

        await postDecision(reviewItemId, decision, noteValue());

        try {
          var s = app();
          s.aicmR8zV10fReviewConfirm = null;
          s.reviewDecisionConfirm = null;
          s.reviewConfirm = null;
        } catch (_) {}

        message("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await reloadReviewList(reviewItemId);
      } catch (error) {
        if (button) button.disabled = false;
        message("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");

---- hit line 13480 pattern=承認を実行 ----
      }

      try {
        if (button) button.disabled = true;
        message("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

        await postDecision(reviewItemId, decision, noteValue());

        try {
          var s = app();
          s.aicmR8zV10fReviewConfirm = null;
          s.reviewDecisionConfirm = null;
          s.reviewConfirm = null;
        } catch (_) {}

        message("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await reloadReviewList(reviewItemId);
      } catch (error) {
        if (button) button.disabled = false;
        message("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "承認を実行する";
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "差し戻しを実行する";
          }
        });
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("[data-core-action]") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        execute(button, action);
      }, true);

---- hit line 13491 pattern=承認を実行 ----
          s.reviewDecisionConfirm = null;
          s.reviewConfirm = null;
        } catch (_) {}

        message("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await reloadReviewList(reviewItemId);
      } catch (error) {
        if (button) button.disabled = false;
        message("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "承認を実行する";
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "差し戻しを実行する";
          }
        });
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("[data-core-action]") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        execute(button, action);
      }, true);

      document.addEventListener("click", function() {
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 250);
        setTimeout(upgradeButtons, 700);
      }, true);
    }

    var originalRenderV10GC2B = typeof render === "function" ? render : null;
    if (originalRenderV10GC2B && !originalRenderV10GC2B.__aicmR8zV10gc2bWrapped) {
      var wrappedRenderV10GC2B = function() {

---- hit line 13496 pattern=承認を実行 ----

        await reloadReviewList(reviewItemId);
      } catch (error) {
        if (button) button.disabled = false;
        message("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "承認を実行する";
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "差し戻しを実行する";
          }
        });
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("[data-core-action]") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        execute(button, action);
      }, true);

      document.addEventListener("click", function() {
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 250);
        setTimeout(upgradeButtons, 700);
      }, true);
    }

    var originalRenderV10GC2B = typeof render === "function" ? render : null;
    if (originalRenderV10GC2B && !originalRenderV10GC2B.__aicmR8zV10gc2bWrapped) {
      var wrappedRenderV10GC2B = function() {
        var result = originalRenderV10GC2B.apply(this, arguments);
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 250);
        return result;
      };

---- hit line 13587 pattern=承認を実行 ----
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");

---- hit line 13589 pattern=承認を実行 ----


  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";

---- hit line 13615 pattern=承認を実行 ----
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "差し戻しを実行する";
            changed += 1;
          }
        });

        if (typeof window !== "undefined") {
          window.aicmR8zV10gc2fLastPrime = {
            changed: changed,
            at: new Date().toISOString()
          };
        }

        return changed > 0;
      } catch (error) {
        try { console.warn("AICM V10GC2F one-shot prime failed", error); } catch (_) {}
        return false;
      }
    }

    function oneShotPrime() {
      setTimeout(enableFinalButtonsNow, 0);
      setTimeout(enableFinalButtonsNow, 80);
      setTimeout(enableFinalButtonsNow, 180);

---- hit line 13624 pattern=承認を実行 ----
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "差し戻しを実行する";
            changed += 1;
          }
        });

        if (typeof window !== "undefined") {
          window.aicmR8zV10gc2fLastPrime = {
            changed: changed,
            at: new Date().toISOString()
          };
        }

        return changed > 0;
      } catch (error) {
        try { console.warn("AICM V10GC2F one-shot prime failed", error); } catch (_) {}
        return false;
      }
    }

    function oneShotPrime() {
      setTimeout(enableFinalButtonsNow, 0);
      setTimeout(enableFinalButtonsNow, 80);
      setTimeout(enableFinalButtonsNow, 180);
      setTimeout(enableFinalButtonsNow, 350);
      setTimeout(enableFinalButtonsNow, 700);
      setTimeout(enableFinalButtonsNow, 1200);
      setTimeout(enableFinalButtonsNow, 2000);
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;

---- 差し戻しを実行 around ----
---- hit line 13449 pattern=差し戻しを実行 ----

      try {
        if (typeof aicmR8zV9ReviewListScriptHydrate === "function") {
          aicmR8zV9ReviewListScriptHydrate(app());
        }
      } catch (_) {}

      try {
        if (typeof render === "function") render();
      } catch (_) {}
    }

    function noteValue() {
      try {
        var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
        return node ? text(node.value) : "";
      } catch (_) {
        return "";
      }
    }

    async function execute(button, action) {
      var decision = decisionFromAction(action);
      if (!decision) return false;

      var reviewItemId = currentReviewId(button);

      if (!reviewItemId) {
        message("error", "review item id が見つかりません。成果物詳細からやり直してください。");
        if (typeof render === "function") render();
        return true;
      }

      try {
        if (button) button.disabled = true;
        message("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

        await postDecision(reviewItemId, decision, noteValue());

        try {
          var s = app();
          s.aicmR8zV10fReviewConfirm = null;
          s.reviewDecisionConfirm = null;
          s.reviewConfirm = null;
        } catch (_) {}

        message("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await reloadReviewList(reviewItemId);
      } catch (error) {
        if (button) button.disabled = false;
        message("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");

---- hit line 13481 pattern=差し戻しを実行 ----

      try {
        if (button) button.disabled = true;
        message("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

        await postDecision(reviewItemId, decision, noteValue());

        try {
          var s = app();
          s.aicmR8zV10fReviewConfirm = null;
          s.reviewDecisionConfirm = null;
          s.reviewConfirm = null;
        } catch (_) {}

        message("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await reloadReviewList(reviewItemId);
      } catch (error) {
        if (button) button.disabled = false;
        message("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "承認を実行する";
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "差し戻しを実行する";
          }
        });
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("[data-core-action]") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        execute(button, action);
      }, true);


---- hit line 13499 pattern=差し戻しを実行 ----
        if (button) button.disabled = false;
        message("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "承認を実行する";
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "差し戻しを実行する";
          }
        });
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("[data-core-action]") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        execute(button, action);
      }, true);

      document.addEventListener("click", function() {
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 250);
        setTimeout(upgradeButtons, 700);
      }, true);
    }

    var originalRenderV10GC2B = typeof render === "function" ? render : null;
    if (originalRenderV10GC2B && !originalRenderV10GC2B.__aicmR8zV10gc2bWrapped) {
      var wrappedRenderV10GC2B = function() {
        var result = originalRenderV10GC2B.apply(this, arguments);
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 250);
        return result;
      };
      wrappedRenderV10GC2B.__aicmR8zV10gc2bWrapped = true;
      wrappedRenderV10GC2B.__aicmR8zV10gc2bOriginal = originalRenderV10GC2B;
      render = wrappedRenderV10GC2B;

---- hit line 13504 pattern=差し戻しを実行 ----
      return true;
    }

    function upgradeButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return;

        var body = String(document.body.innerText || "");
        var onConfirm =
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0;

        if (!onConfirm) return;

        var reviewId = currentReviewId(null);
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "承認を実行する";
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "差し戻しを実行する";
          }
        });
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("[data-core-action]") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        execute(button, action);
      }, true);

      document.addEventListener("click", function() {
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 250);
        setTimeout(upgradeButtons, 700);
      }, true);
    }

    var originalRenderV10GC2B = typeof render === "function" ? render : null;
    if (originalRenderV10GC2B && !originalRenderV10GC2B.__aicmR8zV10gc2bWrapped) {
      var wrappedRenderV10GC2B = function() {
        var result = originalRenderV10GC2B.apply(this, arguments);
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 250);
        return result;
      };
      wrappedRenderV10GC2B.__aicmR8zV10gc2bWrapped = true;
      wrappedRenderV10GC2B.__aicmR8zV10gc2bOriginal = originalRenderV10GC2B;
      render = wrappedRenderV10GC2B;
    }

    setTimeout(upgradeButtons, 500);

    if (typeof window !== "undefined") {

---- hit line 13588 pattern=差し戻しを実行 ----
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");

---- hit line 13590 pattern=差し戻しを実行 ----

  // AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";

---- hit line 13628 pattern=差し戻しを実行 ----

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "差し戻しを実行する";
            changed += 1;
          }
        });

        if (typeof window !== "undefined") {
          window.aicmR8zV10gc2fLastPrime = {
            changed: changed,
            at: new Date().toISOString()
          };
        }

        return changed > 0;
      } catch (error) {
        try { console.warn("AICM V10GC2F one-shot prime failed", error); } catch (_) {}
        return false;
      }
    }

    function oneShotPrime() {
      setTimeout(enableFinalButtonsNow, 0);
      setTimeout(enableFinalButtonsNow, 80);
      setTimeout(enableFinalButtonsNow, 180);
      setTimeout(enableFinalButtonsNow, 350);
      setTimeout(enableFinalButtonsNow, 700);
      setTimeout(enableFinalButtonsNow, 1200);
      setTimeout(enableFinalButtonsNow, 2000);
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        if (!button) return;

        if (looksLikeConfirmOpenButton(button)) {

---- hit line 13637 pattern=差し戻しを実行 ----
    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "差し戻しを実行する";
            changed += 1;
          }
        });

        if (typeof window !== "undefined") {
          window.aicmR8zV10gc2fLastPrime = {
            changed: changed,
            at: new Date().toISOString()
          };
        }

        return changed > 0;
      } catch (error) {
        try { console.warn("AICM V10GC2F one-shot prime failed", error); } catch (_) {}
        return false;
      }
    }

    function oneShotPrime() {
      setTimeout(enableFinalButtonsNow, 0);
      setTimeout(enableFinalButtonsNow, 80);
      setTimeout(enableFinalButtonsNow, 180);
      setTimeout(enableFinalButtonsNow, 350);
      setTimeout(enableFinalButtonsNow, 700);
      setTimeout(enableFinalButtonsNow, 1200);
      setTimeout(enableFinalButtonsNow, 2000);
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        if (!button) return;

        if (looksLikeConfirmOpenButton(button)) {
          // Do not stop propagation. Let existing app route open the confirm card.
          oneShotPrime();
        }
      }, true);
    }

    var originalRenderV10GC2F = typeof render === "function" ? render : null;
    if (originalRenderV10GC2F && !originalRenderV10GC2F.__aicmR8zV10gc2fWrapped) {
      var wrappedRenderV10GC2F = function() {
============================================================
7. classification
============================================================
LIKELY_CAUSE=STATIC_OK_NEED_RUNTIME_CLICK_DEBUG
NEXT_ACTION=ADD_VISIBLE_CLICK_DEBUG_CARD_WITH_NO_POST
PENDING_TABLE=2
PENDING_VIEW=2
HAS_APPROVE_FUNCTION=true
HAS_RETURN_FUNCTION=true
APPROVE_ROUTES=/api/aicm/v2/leader-auto-decomposition/run,/api/aicm/v2/manager-major/archive,/api/aicm/v2/manager-major/import-csv,/api/aicm/v2/human-review/create,/api/aicm/v2/human-review/approve,/api/aicm/v2/human-review/return,/api/aicm/v2/company/update
RETURN_ROUTES=/api/aicm/v2/manager-major/archive,/api/aicm/v2/manager-major/import-csv,/api/aicm/v2/human-review/create,/api/aicm/v2/human-review/approve,/api/aicm/v2/human-review/return,/api/aicm/v2/company/update,/api/aicm/v2/department/update
APPROVE_BODY_KEYS=aicm_human_review_item_id,human_review_note,human_reviewer_label,owner_civilization_id
RETURN_BODY_KEYS=aicm_human_review_item_id,human_review_note,human_reviewer_label,owner_civilization_id
CORE_BUILD_PAYLOAD_KEYS=
V10GC2B_BLOCK_EXISTS=true
V10GC2F_BLOCK_EXISTS=true
V10GC2C_BLOCK_EXISTS=false
V10GC2D_BLOCK_EXISTS=false
CORE_APPROVE_ROUTE_COUNT=2
CORE_RETURN_ROUTE_COUNT=2
CORE_APPROVE_ACTION_COUNT=4
CORE_RETURN_ACTION_COUNT=4
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/010_db_review_pending_readonly.tsv
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/020_server_review_route_and_function_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/030_core_review_execute_scan.txt
CONFIRM_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/040_confirm_screen_scan.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/050_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/000_R8Z_V10GC2G_REVIEW_EXECUTE_ROOT_CAUSE_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10GC2G_REVIEW_EXECUTE_ROOT_CAUSE_ISOLATED
LIKELY_CAUSE=STATIC_OK_NEED_RUNTIME_CLICK_DEBUG
NEXT_ACTION=ADD_VISIBLE_CLICK_DEBUG_CARD_WITH_NO_POST
PENDING_TABLE=2
PENDING_VIEW=2
HAS_APPROVE_FUNCTION=true
HAS_RETURN_FUNCTION=true
APPROVE_ROUTES=/api/aicm/v2/leader-auto-decomposition/run,/api/aicm/v2/manager-major/archive,/api/aicm/v2/manager-major/import-csv,/api/aicm/v2/human-review/create,/api/aicm/v2/human-review/approve,/api/aicm/v2/human-review/return,/api/aicm/v2/company/update
RETURN_ROUTES=/api/aicm/v2/manager-major/archive,/api/aicm/v2/manager-major/import-csv,/api/aicm/v2/human-review/create,/api/aicm/v2/human-review/approve,/api/aicm/v2/human-review/return,/api/aicm/v2/company/update,/api/aicm/v2/department/update
APPROVE_BODY_KEYS=aicm_human_review_item_id,human_review_note,human_reviewer_label,owner_civilization_id
RETURN_BODY_KEYS=aicm_human_review_item_id,human_review_note,human_reviewer_label,owner_civilization_id
CORE_BUILD_PAYLOAD_KEYS=
V10GC2B_BLOCK_EXISTS=true
V10GC2F_BLOCK_EXISTS=true
V10GC2C_BLOCK_EXISTS=false
V10GC2D_BLOCK_EXISTS=false
CORE_APPROVE_ROUTE_COUNT=2
CORE_RETURN_ROUTE_COUNT=2
CORE_APPROVE_ACTION_COUNT=4
CORE_RETURN_ACTION_COUNT=4
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/010_db_review_pending_readonly.tsv
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/020_server_review_route_and_function_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/030_core_review_execute_scan.txt
CONFIRM_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/040_confirm_screen_scan.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/050_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2g_review_execute_root_cause_isolate_20260504_055827/000_R8Z_V10GC2G_REVIEW_EXECUTE_ROOT_CAUSE_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
