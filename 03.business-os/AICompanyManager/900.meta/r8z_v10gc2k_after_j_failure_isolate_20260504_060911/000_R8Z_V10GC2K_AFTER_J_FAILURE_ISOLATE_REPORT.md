============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し最終確認カード

現在位置:
- V10GC2I debugで以下は確認済み
  - review_id は取れている
  - owner_civilization_id が空
  - 実行ボタンは disabled=true
  - data-core-action なし
  - data-review-item-id なし
- V10GC2Jでdebug撤去 + payload補正 + ボタン補正を入れたが、まだダメ

今回:
1. DB pending件数をread-only確認
2. V10GC2J / 旧debug / 旧prime の残存確認
3. 確認カード生成元の hardcoded disabled / label を抽出
4. V10GC2Jのnormalize/executeが存在するか確認
5. server側 approve/return 関数の要求key再確認
6. 次が「生成元直接修正」か「POST response debug」か分類する

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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2k_after_j_failure_isolate_20260504_060911
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. DB readonly pending
============================================================
pending_table	2
pending_view	2
pending_item	bc553839-ebca-4610-81e3-31dc21476a48 | pending | 納品サマリー確認: AI企業業務開始導線の整備 作業
pending_item	bd30bc28-c6d8-4fee-aebc-1311db979988 | pending | 納品サマリー確認: Manager大項目台帳運用の整備 作業

============================================================
4. core scan
============================================================
V10GC2B_MARKER_COUNT=2
V10GC2F_MARKER_COUNT=0
V10GC2H_MARKER_COUNT=0
V10GC2I_MARKER_COUNT=0
V10GC2J_MARKER_COUNT=2
V10GC2J_APPROVE_ACTION_COUNT=3
V10GC2J_RETURN_ACTION_COUNT=3
V10GC2J_NORMALIZE_FUNCTION_COUNT=1
V10GC2J_EXECUTE_FUNCTION_COUNT=1
V10GC2J_OWNER_FALLBACK_COUNT=23
V10GC2J_EXPORTED_NORMALIZE_COUNT=1
HARD_DISABLED_APPROVE_LABEL_COUNT=1
HARD_DISABLED_RETURN_LABEL_COUNT=1
APPROVE_EXECUTE_LABEL_COUNT=9
RETURN_EXECUTE_LABEL_COUNT=9
DISABLED_LITERAL_COUNT=21
DISABLED_ATTR_LITERAL_COUNT=5
DATA_CORE_ACTION_COUNT=139
DATA_REVIEW_ITEM_ID_COUNT=10
STOP_IMMEDIATE_COUNT=6

============================================================
5. confirm source extract
============================================================
============================================================
承認を実行する（次工程） around
============================================================
---- hit line 13593 pattern=承認を実行する（次工程） ----
    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2bExecuteReviewDecision = execute;
      window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_START
  // Exact final review decision executor.
  // Uses existing server routes. No server patch.
  (function installAicmR8zV10gc2jReviewExecuteExactPayloadFix() {
    var APPROVE_ROUTE = "/api/aicm/v2/human-review/approve";
    var RETURN_ROUTE = "/api/aicm/v2/human-review/return";
    var DEV_OWNER_FALLBACK = "00000000-0000-4000-8000-000000000001";

    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function isUuid(value) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text(value));
    }

    function app() {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
      return {};
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
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

    function deepFind(obj, keyCandidates, depth) {
      if (!obj || typeof obj !== "object" || depth > 7) return "";

      for (var i = 0; i < keyCandidates.length; i += 1) {
        var key = keyCandidates[i];
        if (obj[key] !== undefined && obj[key] !== null && text(obj[key]) !== "") {
          return text(obj[key]);
        }
      }

      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (!/review|item|confirm|selected|detail|owner|civilization|human|reviewer|label|context|state|id|rows|payload/i.test(k)) continue;

        var nested = deepFind(obj[k], keyCandidates, depth + 1);
        if (nested) return nested;
      }

      return "";
    }

    function findReviewId(button) {
      var fromButton = button ? text(
        button.getAttribute("data-review-item-id") ||
        button.getAttribute("data-review-id") ||
        button.getAttribute("data-aicm-human-review-item-id") ||
        ""
      ) : "";

      if (isUuid(fromButton)) return fromButton;

      try {
        var node = document.querySelector("[data-review-item-id],[data-review-id],[data-aicm-human-review-item-id]");
        if (node) {
          var fromDom = text(
            node.getAttribute("data-review-item-id") ||
            node.getAttribute("data-review-id") ||
            node.getAttribute("data-aicm-human-review-item-id") ||
            ""
          );
          if (isUuid(fromDom)) return fromDom;
        }
      } catch (_) {}

      var fromState = deepFind(app(), [
        "aicm_human_review_item_id",
        "review_item_id",
        "review_id",
        "reviewId",
        "id"
      ], 0);

      return isUuid(fromState) ? fromState : "";
    }

    function findOwnerCivilizationId() {
      try {
        var node = document.querySelector("[data-owner-civilization-id],[data-owner-id]");
        if (node) {
          var domOwner = text(node.getAttribute("data-owner-civilization-id") || node.getAttribute("data-owner-id") || "");
          if (isUuid(domOwner)) return domOwner;
        }
      } catch (_) {}

      var s = app();

============================================================
差し戻しを実行する（次工程） around
============================================================
---- hit line 13594 pattern=差し戻しを実行する（次工程） ----
      window.aicmR8zV10gc2bExecuteReviewDecision = execute;
      window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_START
  // Exact final review decision executor.
  // Uses existing server routes. No server patch.
  (function installAicmR8zV10gc2jReviewExecuteExactPayloadFix() {
    var APPROVE_ROUTE = "/api/aicm/v2/human-review/approve";
    var RETURN_ROUTE = "/api/aicm/v2/human-review/return";
    var DEV_OWNER_FALLBACK = "00000000-0000-4000-8000-000000000001";

    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function isUuid(value) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text(value));
    }

    function app() {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
      return {};
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
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

    function deepFind(obj, keyCandidates, depth) {
      if (!obj || typeof obj !== "object" || depth > 7) return "";

      for (var i = 0; i < keyCandidates.length; i += 1) {
        var key = keyCandidates[i];
        if (obj[key] !== undefined && obj[key] !== null && text(obj[key]) !== "") {
          return text(obj[key]);
        }
      }

      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (!/review|item|confirm|selected|detail|owner|civilization|human|reviewer|label|context|state|id|rows|payload/i.test(k)) continue;

        var nested = deepFind(obj[k], keyCandidates, depth + 1);
        if (nested) return nested;
      }

      return "";
    }

    function findReviewId(button) {
      var fromButton = button ? text(
        button.getAttribute("data-review-item-id") ||
        button.getAttribute("data-review-id") ||
        button.getAttribute("data-aicm-human-review-item-id") ||
        ""
      ) : "";

      if (isUuid(fromButton)) return fromButton;

      try {
        var node = document.querySelector("[data-review-item-id],[data-review-id],[data-aicm-human-review-item-id]");
        if (node) {
          var fromDom = text(
            node.getAttribute("data-review-item-id") ||
            node.getAttribute("data-review-id") ||
            node.getAttribute("data-aicm-human-review-item-id") ||
            ""
          );
          if (isUuid(fromDom)) return fromDom;
        }
      } catch (_) {}

      var fromState = deepFind(app(), [
        "aicm_human_review_item_id",
        "review_item_id",
        "review_id",
        "reviewId",
        "id"
      ], 0);

      return isUuid(fromState) ? fromState : "";
    }

    function findOwnerCivilizationId() {
      try {
        var node = document.querySelector("[data-owner-civilization-id],[data-owner-id]");
        if (node) {
          var domOwner = text(node.getAttribute("data-owner-civilization-id") || node.getAttribute("data-owner-id") || "");
          if (isUuid(domOwner)) return domOwner;
        }
      } catch (_) {}

      var s = app();


============================================================
承認前の最終確認 around
============================================================
---- hit line 12683 pattern=承認前の最終確認 ----

        s.aicmR8zV10fRows = rows.length;
        return rows;
      } catch (error) {
        s.aicmR8zV10fError = text(error && error.message ? error.message : error);
        return [];
      }
    }

    function reviewId(row) {
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

      while (host && host !== document) {
        if (
          host.className &&
          String(host.className).indexOf("aicm-core-card") >= 0 &&
          host.innerHTML &&
          String(host.innerHTML).indexOf("次工程") >= 0
        ) {
          return host;
        }
        host = host.parentNode;
      }

      host = actionEl;
      while (host && host !== document) {
        if (host.className && String(host.className).indexOf("aicm-core-card") >= 0) return host;
        host = host.parentNode;
      }

      return null;
    }

    function visibleDebug(message) {
      try {
        var root = document.querySelector(".aicm-core-card");
        var node = document.getElementById("aicm-v10f-visible-debug");

---- hit line 13478 pattern=承認前の最終確認 ----
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


---- hit line 13589 pattern=承認前の最終確認 ----
    }

    setTimeout(upgradeButtons, 500);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2bExecuteReviewDecision = execute;
      window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_START
  // Exact final review decision executor.
  // Uses existing server routes. No server patch.
  (function installAicmR8zV10gc2jReviewExecuteExactPayloadFix() {
    var APPROVE_ROUTE = "/api/aicm/v2/human-review/approve";
    var RETURN_ROUTE = "/api/aicm/v2/human-review/return";
    var DEV_OWNER_FALLBACK = "00000000-0000-4000-8000-000000000001";

    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function isUuid(value) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text(value));
    }

    function app() {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
      return {};
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
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

    function deepFind(obj, keyCandidates, depth) {
      if (!obj || typeof obj !== "object" || depth > 7) return "";

      for (var i = 0; i < keyCandidates.length; i += 1) {
        var key = keyCandidates[i];
        if (obj[key] !== undefined && obj[key] !== null && text(obj[key]) !== "") {
          return text(obj[key]);
        }
      }

      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (!/review|item|confirm|selected|detail|owner|civilization|human|reviewer|label|context|state|id|rows|payload/i.test(k)) continue;

        var nested = deepFind(obj[k], keyCandidates, depth + 1);
        if (nested) return nested;
      }

      return "";
    }

    function findReviewId(button) {
      var fromButton = button ? text(
        button.getAttribute("data-review-item-id") ||
        button.getAttribute("data-review-id") ||
        button.getAttribute("data-aicm-human-review-item-id") ||
        ""
      ) : "";

      if (isUuid(fromButton)) return fromButton;

      try {
        var node = document.querySelector("[data-review-item-id],[data-review-id],[data-aicm-human-review-item-id]");
        if (node) {
          var fromDom = text(
            node.getAttribute("data-review-item-id") ||
            node.getAttribute("data-review-id") ||
            node.getAttribute("data-aicm-human-review-item-id") ||
            ""
          );
          if (isUuid(fromDom)) return fromDom;
        }
      } catch (_) {}

      var fromState = deepFind(app(), [
        "aicm_human_review_item_id",
        "review_item_id",
        "review_id",
        "reviewId",
        "id"
      ], 0);

      return isUuid(fromState) ? fromState : "";
    }

    function findOwnerCivilizationId() {
      try {
        var node = document.querySelector("[data-owner-civilization-id],[data-owner-id]");
        if (node) {
          var domOwner = text(node.getAttribute("data-owner-civilization-id") || node.getAttribute("data-owner-id") || "");
          if (isUuid(domOwner)) return domOwner;

---- hit line 13937 pattern=承認前の最終確認 ----
      }

      try {
        if (button) button.disabled = true;

        setMessageSafe("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

        await postDecision(decision, payload);

        setMessageSafe("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await refreshReviewList(reviewId);
      } catch (error) {
        if (button) button.disabled = false;
        setMessageSafe("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2j-execute-approved" && action !== "review-v10gc2j-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        executeDecision(button, action);
      }, true);

      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        var label = text(button && (button.innerText || button.textContent) || "");

        if (
          label.indexOf("承認確認へ進む") >= 0 ||
          label.indexOf("差し戻し確認へ進む") >= 0 ||
          label.indexOf("承認前の最終確認へ進む") >= 0 ||
          label.indexOf("差し戻し前の最終確認へ進む") >= 0
        ) {
          primeFinalButtons();
        }
      }, true);
    }

    var originalRenderV10GC2J = typeof render === "function" ? render : null;
    if (originalRenderV10GC2J && !originalRenderV10GC2J.__aicmR8zV10gc2jWrapped) {
      var wrappedRenderV10GC2J = function() {
        var result = originalRenderV10GC2J.apply(this, arguments);
        primeFinalButtons();
        return result;
      };
      wrappedRenderV10GC2J.__aicmR8zV10gc2jWrapped = true;
      wrappedRenderV10GC2J.__aicmR8zV10gc2jOriginal = originalRenderV10GC2J;
      render = wrappedRenderV10GC2J;
    }

    setTimeout(primeFinalButtons, 300);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2jNormalizeFinalButtons = normalizeFinalButtons;
      window.aicmR8zV10gc2jExecuteDecision = executeDecision;
    }
  })();
  // AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_END


============================================================
差し戻し前の最終確認 around
============================================================
---- hit line 12683 pattern=差し戻し前の最終確認 ----

        s.aicmR8zV10fRows = rows.length;
        return rows;
      } catch (error) {
        s.aicmR8zV10fError = text(error && error.message ? error.message : error);
        return [];
      }
    }

    function reviewId(row) {
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

      while (host && host !== document) {
        if (
          host.className &&
          String(host.className).indexOf("aicm-core-card") >= 0 &&
          host.innerHTML &&
          String(host.innerHTML).indexOf("次工程") >= 0
        ) {
          return host;
        }
        host = host.parentNode;
      }

      host = actionEl;
      while (host && host !== document) {
        if (host.className && String(host.className).indexOf("aicm-core-card") >= 0) return host;
        host = host.parentNode;
      }

      return null;
    }

    function visibleDebug(message) {
      try {
        var root = document.querySelector(".aicm-core-card");
        var node = document.getElementById("aicm-v10f-visible-debug");

---- hit line 13479 pattern=差し戻し前の最終確認 ----

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

---- hit line 13590 pattern=差し戻し前の最終確認 ----

    setTimeout(upgradeButtons, 500);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2bExecuteReviewDecision = execute;
      window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
    }
  })();
  // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END


  // AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_START
  // Exact final review decision executor.
  // Uses existing server routes. No server patch.
  (function installAicmR8zV10gc2jReviewExecuteExactPayloadFix() {
    var APPROVE_ROUTE = "/api/aicm/v2/human-review/approve";
    var RETURN_ROUTE = "/api/aicm/v2/human-review/return";
    var DEV_OWNER_FALLBACK = "00000000-0000-4000-8000-000000000001";

    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function isUuid(value) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text(value));
    }

    function app() {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
      return {};
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
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

    function deepFind(obj, keyCandidates, depth) {
      if (!obj || typeof obj !== "object" || depth > 7) return "";

      for (var i = 0; i < keyCandidates.length; i += 1) {
        var key = keyCandidates[i];
        if (obj[key] !== undefined && obj[key] !== null && text(obj[key]) !== "") {
          return text(obj[key]);
        }
      }

      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (!/review|item|confirm|selected|detail|owner|civilization|human|reviewer|label|context|state|id|rows|payload/i.test(k)) continue;

        var nested = deepFind(obj[k], keyCandidates, depth + 1);
        if (nested) return nested;
      }

      return "";
    }

    function findReviewId(button) {
      var fromButton = button ? text(
        button.getAttribute("data-review-item-id") ||
        button.getAttribute("data-review-id") ||
        button.getAttribute("data-aicm-human-review-item-id") ||
        ""
      ) : "";

      if (isUuid(fromButton)) return fromButton;

      try {
        var node = document.querySelector("[data-review-item-id],[data-review-id],[data-aicm-human-review-item-id]");
        if (node) {
          var fromDom = text(
            node.getAttribute("data-review-item-id") ||
            node.getAttribute("data-review-id") ||
            node.getAttribute("data-aicm-human-review-item-id") ||
            ""
          );
          if (isUuid(fromDom)) return fromDom;
        }
      } catch (_) {}

      var fromState = deepFind(app(), [
        "aicm_human_review_item_id",
        "review_item_id",
        "review_id",
        "reviewId",
        "id"
      ], 0);

      return isUuid(fromState) ? fromState : "";
    }

    function findOwnerCivilizationId() {
      try {
        var node = document.querySelector("[data-owner-civilization-id],[data-owner-id]");
        if (node) {
          var domOwner = text(node.getAttribute("data-owner-civilization-id") || node.getAttribute("data-owner-id") || "");
          if (isUuid(domOwner)) return domOwner;
        }

---- hit line 13938 pattern=差し戻し前の最終確認 ----

      try {
        if (button) button.disabled = true;

        setMessageSafe("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

        await postDecision(decision, payload);

        setMessageSafe("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await refreshReviewList(reviewId);
      } catch (error) {
        if (button) button.disabled = false;
        setMessageSafe("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2j-execute-approved" && action !== "review-v10gc2j-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        executeDecision(button, action);
      }, true);

      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        var label = text(button && (button.innerText || button.textContent) || "");

        if (
          label.indexOf("承認確認へ進む") >= 0 ||
          label.indexOf("差し戻し確認へ進む") >= 0 ||
          label.indexOf("承認前の最終確認へ進む") >= 0 ||
          label.indexOf("差し戻し前の最終確認へ進む") >= 0
        ) {
          primeFinalButtons();
        }
      }, true);
    }

    var originalRenderV10GC2J = typeof render === "function" ? render : null;
    if (originalRenderV10GC2J && !originalRenderV10GC2J.__aicmR8zV10gc2jWrapped) {
      var wrappedRenderV10GC2J = function() {
        var result = originalRenderV10GC2J.apply(this, arguments);
        primeFinalButtons();
        return result;
      };
      wrappedRenderV10GC2J.__aicmR8zV10gc2jWrapped = true;
      wrappedRenderV10GC2J.__aicmR8zV10gc2jOriginal = originalRenderV10GC2J;
      render = wrappedRenderV10GC2J;
    }

    setTimeout(primeFinalButtons, 300);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2jNormalizeFinalButtons = normalizeFinalButtons;
      window.aicmR8zV10gc2jExecuteDecision = executeDecision;
    }
  })();
  // AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_END


============================================================
V10GC2J block
============================================================
// AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_START
  // Exact final review decision executor.
  // Uses existing server routes. No server patch.
  (function installAicmR8zV10gc2jReviewExecuteExactPayloadFix() {
    var APPROVE_ROUTE = "/api/aicm/v2/human-review/approve";
    var RETURN_ROUTE = "/api/aicm/v2/human-review/return";
    var DEV_OWNER_FALLBACK = "00000000-0000-4000-8000-000000000001";

    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function isUuid(value) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text(value));
    }

    function app() {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
      return {};
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
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

    function deepFind(obj, keyCandidates, depth) {
      if (!obj || typeof obj !== "object" || depth > 7) return "";

      for (var i = 0; i < keyCandidates.length; i += 1) {
        var key = keyCandidates[i];
        if (obj[key] !== undefined && obj[key] !== null && text(obj[key]) !== "") {
          return text(obj[key]);
        }
      }

      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (!/review|item|confirm|selected|detail|owner|civilization|human|reviewer|label|context|state|id|rows|payload/i.test(k)) continue;

        var nested = deepFind(obj[k], keyCandidates, depth + 1);
        if (nested) return nested;
      }

      return "";
    }

    function findReviewId(button) {
      var fromButton = button ? text(
        button.getAttribute("data-review-item-id") ||
        button.getAttribute("data-review-id") ||
        button.getAttribute("data-aicm-human-review-item-id") ||
        ""
      ) : "";

      if (isUuid(fromButton)) return fromButton;

      try {
        var node = document.querySelector("[data-review-item-id],[data-review-id],[data-aicm-human-review-item-id]");
        if (node) {
          var fromDom = text(
            node.getAttribute("data-review-item-id") ||
            node.getAttribute("data-review-id") ||
            node.getAttribute("data-aicm-human-review-item-id") ||
            ""
          );
          if (isUuid(fromDom)) return fromDom;
        }
      } catch (_) {}

      var fromState = deepFind(app(), [
        "aicm_human_review_item_id",
        "review_item_id",
        "review_id",
        "reviewId",
        "id"
      ], 0);

      return isUuid(fromState) ? fromState : "";
    }

    function findOwnerCivilizationId() {
      try {
        var node = document.querySelector("[data-owner-civilization-id],[data-owner-id]");
        if (node) {
          var domOwner = text(node.getAttribute("data-owner-civilization-id") || node.getAttribute("data-owner-id") || "");
          if (isUuid(domOwner)) return domOwner;
        }
      } catch (_) {}

      var s = app();

      var fromState = deepFind(s, [
        "owner_civilization_id",
        "ownerCivilizationId",
        "owner_id",
        "ownerId"
      ], 0);

      if (isUuid(fromState)) return fromState;

      return DEV_OWNER_FALLBACK;
    }

    function findReviewerLabel() {
      try {
        var node = document.querySelector("[data-human-reviewer-label],[data-reviewer-label]");
        if (node) {
          var domReviewer = text(node.getAttribute("data-human-reviewer-label") || node.getAttribute("data-reviewer-label") || "");
          if (domReviewer) return domReviewer;
        }
      } catch (_) {}

      var fromState = deepFind(app(), [
        "human_reviewer_label",
        "humanReviewerLabel",
        "reviewer_label",
        "reviewerLabel"
      ], 0);

      return fromState || "user";
    }

    function noteValue() {
      try {
        var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
        return node ? text(node.value) : "";
      } catch (_) {
        return "";
      }
    }

    function setMessageSafe(kind, value) {
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

    function normalizeFinalButtons() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        var reviewId = findReviewId(null);
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
            button.textContent = "承認を実行する";
            button.setAttribute("data-core-action", "review-v10gc2j-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.setAttribute("data-aicm-v10gc2j-normalized", "true");
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.textContent = "差し戻しを実行する";
            button.setAttribute("data-core-action", "review-v10gc2j-execute-returned");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.setAttribute("data-aicm-v10gc2j-normalized", "true");
            changed += 1;
          }
        });

        if (typeof window !== "undefined") {
          window.aicmR8zV10gc2jLastNormalize = {
            changed: changed,
            reviewId: reviewId,
            at: new Date().toISOString()
          };
        }

        return changed > 0;
      } catch (error) {
        try { console.warn("V10GC2J normalize final buttons failed", error); } catch (_) {}
        return false;
      }
    }

    function primeFinalButtons() {
      setTimeout(normalizeFinalButtons, 0);
      setTimeout(normalizeFinalButtons, 80);
      setTimeout(normalizeFinalButtons, 180);
      setTimeout(normalizeFinalButtons, 400);
      setTimeout(normalizeFinalButtons, 900);
      setTimeout(normalizeFinalButtons, 1500);
    }

    function decisionFromAction(action) {
      if (action === "review-v10gc2j-execute-approved") return "approved";
      if (action === "review-v10gc2j-execute-returned") return "returned";
      return "";
    }

    function routeForDecision(decision) {
      return decision === "approved" ? APPROVE_ROUTE : RETURN_ROUTE;
    }

    function buildPayload(reviewId) {
      return {
        aicm_human_review_item_id: reviewId,
        owner_civilization_id: findOwnerCivilizationId(),
        human_reviewer_label: findReviewerLabel(),
        human_review_note: noteValue()
      };
    }

    function missingPayloadKeys(payload) {
      return ["aicm_human_review_item_id", "owner_civilization_id", "human_reviewer_label"].filter(function(key) {
        return !text(payload[key]);
      });
    }

    async function postDecision(decision, payload) {
      var response = await fetch(routeForDecision(decision), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      var json = null;
      try { json = await response.json(); } catch (_) { json = null; }

      if (!response.ok || (json && json.result === "error")) {
        throw new Error(json && (json.error || json.message) ? (json.error || json.message) : "レビュー更新に失敗しました。");
      }

      return json || { result: "ok" };
    }

    function removeReviewFromState(reviewId) {
      var s = app();
      var id = text(reviewId);

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

        s.aicmR8zV10fReviewConfirm = null;
        s.reviewDecisionConfirm = null;
        s.reviewConfirm = null;
        s.aicmReviewConfirm = null;
        s.selectedReview = null;
        s.reviewDetail = null;
        s.screen = "review-list";
      } catch (_) {}
    }

    async function refreshReviewList(reviewId) {
      removeReviewFromState(reviewId);

      try {
        if (typeof aicmR8zV9ReviewListScriptHydrate === "function") {
          aicmR8zV9ReviewListScriptHydrate(app());
        }
      } catch (_) {}

      try {
        if (typeof render === "function") render();
      } catch (_) {}
    }

    async function executeDecision(button, action) {
      var decision = decisionFromAction(action);
      if (!decision) return false;

      var reviewId = findReviewId(button);
      var payload = buildPayload(reviewId);
      var missing = missingPayloadKeys(payload);

      if (missing.length > 0) {
        setMessageSafe("error", "レビュー更新に必要な値が不足しています: " + missing.join(", "));
        try {
          if (typeof window !== "undefined") {
            window.aicmR8zV10gc2jLastErrorPayload = payload;
          }
        } catch (_) {}
        if (typeof render === "function") render();
        return true;
      }

      try {
        if (button) button.disabled = true;

        setMessageSafe("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

        await postDecision(decision, payload);

        setMessageSafe("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

        await refreshReviewList(reviewId);
      } catch (error) {
        if (button) button.disabled = false;
        setMessageSafe("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
        if (typeof render === "function") render();
      }

      return true;
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        if (action !== "review-v10gc2j-execute-approved" && action !== "review-v10gc2j-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        executeDecision(button, action);
      }, true);

      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        var label = text(button && (button.innerText || button.textContent) || "");

        if (
          label.indexOf("承認確認へ進む") >= 0 ||
          label.indexOf("差し戻し確認へ進む") >= 0 ||
          label.indexOf("承認前の最終確認へ進む") >= 0 ||
          label.indexOf("差し戻し前の最終確認へ進む") >= 0
        ) {
          primeFinalButtons();
        }
      }, true);
    }

    var originalRenderV10GC2J = typeof render === "function" ? render : null;
    if (originalRenderV10GC2J && !originalRenderV10GC2J.__aicmR8zV10gc2jWrapped) {
      var wrappedRenderV10GC2J = function() {
        var result = originalRenderV10GC2J.apply(this, arguments);
        primeFinalButtons();
        return result;
      };
      wrappedRenderV10GC2J.__aicmR8zV10gc2jWrapped = true;
      wrappedRenderV10GC2J.__aicmR8zV10gc2jOriginal = originalRenderV10GC2J;
      render = wrappedRenderV10GC2J;
    }

    setTimeout(primeFinalButtons, 300);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2jNormalizeFinalButtons = normalizeFinalButtons;
      window.aicmR8zV10gc2jExecuteDecision = executeDecision;
    }
  })();
  // AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_END

============================================================
6. server scan
============================================================
SERVER_APPROVE_FUNCTION_COUNT=1
SERVER_RETURN_FUNCTION_COUNT=1
SERVER_APPROVE_ROUTE_COUNT=1
SERVER_RETURN_ROUTE_COUNT=1
SERVER_REQUIRES_OWNER_COUNT=108
SERVER_REQUIRES_REVIEWER_COUNT=4
SERVER_REQUIRES_REVIEW_ITEM_ID_COUNT=6

============================================================
approveHumanReviewItem around
============================================================
---- hit line 572 pattern=function approveHumanReviewItem ----
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



// AICM_COMPANY_DEPT_SECTION_UPDATE_ARU_ARX_V1
// Company / Department / Section update functions.
// Uses existing SQL-array + runPsqlJson(sql) pattern only.
// No new Pool, no new DB helper, no new connection path.

function aicmOrgUpdateOptionalText(value) {
  return String(value || "").trim();
}

function aicmOrgUpdateTextSql(value) {
  return sqlLiteral(String(value || ""));
}

function aicmOrgUpdateStatus(value, allowed, fallback) {
  const text = String(value || fallback).trim();
  return allowed.includes(text) ? text : fallback;
}

function updateCompany(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const name = requiredText(body.company_name || body.companyName, "company_name");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_user_company",

============================================================
returnHumanReviewItem around
============================================================
---- hit line 598 pattern=function returnHumanReviewItem ----
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



// AICM_COMPANY_DEPT_SECTION_UPDATE_ARU_ARX_V1
// Company / Department / Section update functions.
// Uses existing SQL-array + runPsqlJson(sql) pattern only.
// No new Pool, no new DB helper, no new connection path.

function aicmOrgUpdateOptionalText(value) {
  return String(value || "").trim();
}

function aicmOrgUpdateTextSql(value) {
  return sqlLiteral(String(value || ""));
}

function aicmOrgUpdateStatus(value, allowed, fallback) {
  const text = String(value || fallback).trim();
  return allowed.includes(text) ? text : fallback;
}

function updateCompany(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const name = requiredText(body.company_name || body.companyName, "company_name");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_user_company",
    "  SET company_name = " + sqlLiteral(name) + ",",
    "      business_domain = " + aicmOrgUpdateTextSql(body.business_domain || body.businessDomain) + ",",
    "      company_common_rules_text = " + aicmOrgUpdateTextSql(body.company_common_rules_text || body.companyCommonRulesText) + ",",
    "      president_policy_instruction_text = " + aicmOrgUpdateTextSql(body.president_policy_instruction_text || body.presidentPolicyInstructionText) + ",",
    "      updated_at = now()",
    "  WHERE aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'company', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

function updateDepartment(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
  const name = requiredText(body.department_name || body.departmentName, "department_name");
  const status = aicmOrgUpdateStatus(body.department_status || body.department_status_code, ["active", "inactive", "archived"], "active");

  const sql = [

============================================================
routes around
============================================================
---- hit line 2125 pattern=/api/aicm/v2/human-review/approve ----
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
      const body = await readBody(req);
      sendJson(res, 200, updateDepartment(body));
      return true;
    }

    // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
    // UI label "組織変更" is connected to the current section/k課 update responsibility.
    // Keep this as an explicit compatibility route so future split can be handled here.
    if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateSection(body));
      return true;
    }

    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
============================================================
7. classification
============================================================
FINAL_JUDGEMENT=V10GC2K_AFTER_J_FAILURE_CAUSE_ISOLATED
LIKELY_CAUSE=CONFIRM_CARD_SOURCE_HARDCODES_DISABLED_NEXT_STEP_BUTTON
NEXT_ACTION=DIRECT_PATCH_CONFIRM_CARD_SOURCE_NOT_WRAPPER
PENDING_TABLE=2
PENDING_VIEW=2
V10GC2B_MARKER_COUNT=2
V10GC2F_MARKER_COUNT=0
V10GC2H_MARKER_COUNT=0
V10GC2I_MARKER_COUNT=0
V10GC2J_MARKER_COUNT=2
HARD_DISABLED_APPROVE_LABEL_COUNT=1
HARD_DISABLED_RETURN_LABEL_COUNT=1
V10GC2J_NORMALIZE_FUNCTION_COUNT=1
V10GC2J_EXECUTE_FUNCTION_COUNT=1
V10GC2J_OWNER_FALLBACK_COUNT=23
SERVER_APPROVE_FUNCTION_COUNT=1
SERVER_RETURN_FUNCTION_COUNT=1
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2k_after_j_failure_isolate_20260504_060911/010_db_pending_readonly.tsv
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2k_after_j_failure_isolate_20260504_060911/020_core_after_j_scan.txt
CONFIRM_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2k_after_j_failure_isolate_20260504_060911/030_confirm_card_source_extract.txt
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2k_after_j_failure_isolate_20260504_060911/040_server_review_function_scan.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2k_after_j_failure_isolate_20260504_060911/050_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2k_after_j_failure_isolate_20260504_060911/000_R8Z_V10GC2K_AFTER_J_FAILURE_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
