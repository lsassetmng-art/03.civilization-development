const fs = require("fs");

const corePath = process.argv[2];
const serverPath = process.argv[3];
const logPath = process.argv[4];
const analysisPath = process.argv[5];

const coreMarker = "AICM_R8Z_V10GC_REVIEW_ITEM_DECISION_CORE";
const serverMarker = "AICM_R8Z_V10GC_REVIEW_ITEM_DECISION_SERVER";

let core = fs.readFileSync(corePath, "utf8");
let server = fs.readFileSync(serverPath, "utf8");

const log = [];
const analysis = [];

function findPoolName(source) {
  const patterns = [
    /\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*new\s+Pool\s*\(/,
    /\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*new\s+pg\.Pool\s*\(/,
    /\b([A-Za-z_$][A-Za-z0-9_$]*)\.connect\s*\(/
  ];

  for (const re of patterns) {
    const m = source.match(re);
    if (m && m[1]) return m[1];
  }

  return "";
}

const poolName = findPoolName(server);
analysis.push("POOL_NAME=" + poolName);

if (!poolName) {
  analysis.push("SERVER_PATCH_DECISION=POOL_NAME_NOT_FOUND");
  fs.writeFileSync(logPath, "ERROR: pool name not found\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(3);
}

if (!server.includes(serverMarker)) {
  const helper = `

// ${serverMarker}_START
// Review approve/return API for business.aicm_human_review_item.
// Called only by final confirmation UI.
async function aicmV10gcReadJsonBody(req) {
  return await new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (_) { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}

function aicmV10gcSendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function aicmV10gcHandleReviewItemDecision(req, res, pool) {
  const body = await aicmV10gcReadJsonBody(req);

  const reviewItemId = String(
    body.aicm_human_review_item_id ||
    body.review_item_id ||
    body.review_id ||
    body.reviewId ||
    ""
  ).trim();

  const decision = String(body.decision || body.action || "").trim().toLowerCase();
  const note = String(body.note || body.reason || body.comment || "").trim();

  if (!reviewItemId) {
    return aicmV10gcSendJson(res, 400, {
      result: "error",
      error: "review_item_id is required"
    });
  }

  if (decision !== "approved" && decision !== "returned") {
    return aicmV10gcSendJson(res, 400, {
      result: "error",
      error: "decision must be approved or returned"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      \`
      UPDATE business.aicm_human_review_item
      SET
        human_review_status_code = $2,
        reviewed_at = now(),
        human_review_note = CASE
          WHEN $3::text = '' THEN human_review_note
          ELSE COALESCE(human_review_note, '') ||
               CASE WHEN COALESCE(human_review_note, '') = '' THEN '' ELSE E'\\\\n' END ||
               $3::text
        END,
        updated_at = now()
      WHERE aicm_human_review_item_id = $1::uuid
        AND human_review_status_code = 'pending'
      RETURNING
        aicm_human_review_item_id,
        human_review_status_code,
        review_title,
        reviewed_at,
        human_review_note,
        updated_at
      \`,
      [reviewItemId, decision, note]
    );

    if (updateResult.rowCount !== 1) {
      await client.query("ROLLBACK");
      return aicmV10gcSendJson(res, 409, {
        result: "error",
        error: "review item is not pending or was not found",
        review_item_id: reviewItemId
      });
    }

    await client.query("COMMIT");

    return aicmV10gcSendJson(res, 200, {
      result: "ok",
      review_item: updateResult.rows[0]
    });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (_) {}
    return aicmV10gcSendJson(res, 500, {
      result: "error",
      error: error && error.message ? error.message : String(error)
    });
  } finally {
    client.release();
  }
}
// ${serverMarker}_END
`;

  server += helper;
  log.push("PATCH_APPLIED: server helper appended");

  const hook = `
  // ${serverMarker}_ROUTE_HOOK
  if (
    req.method === "POST" &&
    (
      pathname === "/api/aicm/review-item/decision" ||
      pathname === "/api/aicm/review/decision" ||
      pathname === "/aicm/api/review-item/decision"
    )
  ) {
    return aicmV10gcHandleReviewItemDecision(req, res, ${poolName});
  }

`;

  if (!server.includes(serverMarker + "_ROUTE_HOOK")) {
    const pathDecl = server.match(/\b(?:const|let|var)\s+pathname\s*=[^\n;]+;?/);
    if (!pathDecl || typeof pathDecl.index !== "number") {
      analysis.push("SERVER_PATCH_DECISION=PATHNAME_DECL_NOT_FOUND");
      fs.writeFileSync(logPath, "ERROR: pathname declaration not found\n");
      fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
      process.exit(4);
    }

    const insertAt = server.indexOf("\n", pathDecl.index);
    server = server.slice(0, insertAt + 1) + hook + server.slice(insertAt + 1);
    log.push("PATCH_APPLIED: server route hook inserted");
    analysis.push("SERVER_ROUTE_HOOK_INSERTED=true");
  } else {
    log.push("SKIP: server route hook already exists");
    analysis.push("SERVER_ROUTE_HOOK_INSERTED=already");
  }

  fs.writeFileSync(serverPath, server, "utf8");
} else {
  log.push("SKIP: server marker already exists");
  analysis.push("SERVER_ROUTE_HOOK_INSERTED=already");
}

if (!core.includes(coreMarker)) {
  const block = `

  // ${coreMarker}_START
  // Final-confirm-only review decision executor.
  (function installAicmR8zV10gcReviewItemDecisionCore() {
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
      if (!obj || depth > 4) return "";
      if (typeof obj !== "object") return "";

      var preferred = [
        "aicm_human_review_item_id",
        "review_item_id",
        "review_id",
        "reviewId",
        "id"
      ];

      for (var i = 0; i < preferred.length; i += 1) {
        var key = preferred[i];
        if (obj[key] && isUuid(obj[key])) return text(obj[key]);
      }

      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (!/review|item|id|confirm/i.test(k)) continue;

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
        null
      );
    }

    function currentReviewId(button) {
      var fromButton = button ? text(
        button.getAttribute("data-review-id") ||
        button.getAttribute("data-review-item-id") ||
        button.getAttribute("data-aicm-human-review-item-id") ||
        ""
      ) : "";

      if (isUuid(fromButton)) return fromButton;

      var confirm = currentConfirmObject();
      var fromConfirm = deepFindReviewId(confirm, 0);
      if (fromConfirm) return fromConfirm;

      var s = app();
      var direct = deepFindReviewId(s, 0);
      if (direct) return direct;

      try {
        var node = document.querySelector("[data-review-id],[data-review-item-id],[data-aicm-human-review-item-id]");
        if (node) {
          var domId = text(
            node.getAttribute("data-review-id") ||
            node.getAttribute("data-review-item-id") ||
            node.getAttribute("data-aicm-human-review-item-id") ||
            ""
          );
          if (isUuid(domId)) return domId;
        }
      } catch (_) {}

      return "";
    }

    function decisionFromAction(action) {
      if (action === "review-v10gc-execute-approved") return "approved";
      if (action === "review-v10gc-execute-returned") return "returned";
      return "";
    }

    async function postDecision(reviewItemId, decision, note) {
      var response = await fetch("/api/aicm/review-item/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aicm_human_review_item_id: reviewItemId,
          decision: decision,
          note: note || ""
        })
      });

      var json = null;
      try { json = await response.json(); } catch (_) { json = null; }

      if (!response.ok || !json || json.result !== "ok") {
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
        s.aicmR8zV9Rows = Array.isArray(s.review_wait_items) ? s.review_wait_items.length : s.aicmR8zV9Rows;

        if (s.context && typeof s.context === "object") {
          s.context.review_wait_items = filterRows(s.context.review_wait_items);
        }
      } catch (_) {}
    }

    async function reloadOrRenderReviewList(reviewItemId) {
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

        await reloadOrRenderReviewList(reviewItemId);
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
            button.setAttribute("data-core-action", "review-v10gc-execute-approved");
            if (reviewId) button.setAttribute("data-review-item-id", reviewId);
            button.textContent = "承認を実行する";
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.setAttribute("data-core-action", "review-v10gc-execute-returned");
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
        if (action !== "review-v10gc-execute-approved" && action !== "review-v10gc-execute-returned") return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        execute(button, action);
      }, true);

      document.addEventListener("click", function() {
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 200);
        setTimeout(upgradeButtons, 700);
      }, true);
    }

    var originalRenderV10GC = typeof render === "function" ? render : null;
    if (originalRenderV10GC && !originalRenderV10GC.__aicmR8zV10gcWrapped) {
      var wrappedRenderV10GC = function() {
        var result = originalRenderV10GC.apply(this, arguments);
        setTimeout(upgradeButtons, 0);
        setTimeout(upgradeButtons, 200);
        return result;
      };
      wrappedRenderV10GC.__aicmR8zV10gcWrapped = true;
      wrappedRenderV10GC.__aicmR8zV10gcOriginal = originalRenderV10GC;
      render = wrappedRenderV10GC;
    }

    setTimeout(upgradeButtons, 500);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gcExecuteReviewDecision = execute;
      window.aicmR8zV10gcUpgradeButtons = upgradeButtons;
    }
  })();
  // ${coreMarker}_END
`;

  core += block;
  fs.writeFileSync(corePath, core, "utf8");
  log.push("PATCH_APPLIED: core V10GC review decision executor appended");
} else {
  log.push("SKIP: core marker already exists");
}

fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
