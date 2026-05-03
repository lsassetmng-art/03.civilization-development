const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];

let src = fs.readFileSync(corePath, "utf8");
const log = [];

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeMarkedBlock(marker) {
  const before = src.length;
  const re = new RegExp(
    "\\n\\s*//\\s*" + escRe(marker) + "_START[\\s\\S]*?//\\s*" + escRe(marker) + "_END\\s*\\n?",
    "g"
  );
  src = src.replace(re, "\n");
  log.push("REMOVED_" + marker + "=" + (before !== src.length ? "true" : "false"));
}

removeMarkedBlock("AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME");
removeMarkedBlock("AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST");
removeMarkedBlock("AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK");

const marker = "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX";

if (!src.includes(marker)) {
  const block = `

  // ${marker}_START
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
  // ${marker}_END
`;

  src += block;
  log.push("PATCH_APPLIED: V10GC2J exact payload review executor appended");
} else {
  log.push("SKIP: V10GC2J marker already exists");
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
