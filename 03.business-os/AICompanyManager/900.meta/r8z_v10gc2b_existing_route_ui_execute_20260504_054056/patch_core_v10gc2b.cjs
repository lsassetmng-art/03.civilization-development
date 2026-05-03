const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const approveRoute = process.argv[4];
const returnRoute = process.argv[5];

const marker = "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE";

let core = fs.readFileSync(corePath, "utf8");
const log = [];

if (!core.includes(marker)) {
  const block = `

  // ${marker}_START
  // Final-confirm-only review decision executor using existing server routes.
  (function installAicmR8zV10gc2bReviewExistingRouteDecisionCore() {
    var APPROVE_ROUTE = ${JSON.stringify(approveRoute)};
    var RETURN_ROUTE = ${JSON.stringify(returnRoute)};

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
  // ${marker}_END
`;

  core += block;
  fs.writeFileSync(corePath, core, "utf8");
  log.push("PATCH_APPLIED: core V10GC2B existing route review executor appended");
} else {
  log.push("SKIP: core V10GC2B marker already exists");
}

fs.writeFileSync(logPath, log.join("\n") + "\n");
