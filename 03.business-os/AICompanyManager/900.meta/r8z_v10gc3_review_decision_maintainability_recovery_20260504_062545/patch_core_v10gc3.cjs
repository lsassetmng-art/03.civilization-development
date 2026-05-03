const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

const original = fs.readFileSync(corePath, "utf8");
let src = original;

const log = [];
const analysis = [];

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), "g")) || []).length;
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

function parserQuoteAt(source, pos) {
  let quote = "";
  let esc = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = 0; i < pos; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
  }

  return quote;
}

function findButtonAroundLabel(source, label) {
  const labelIndex = source.indexOf(label);
  if (labelIndex < 0) return null;

  const buttonStart = source.lastIndexOf("<button", labelIndex);
  const buttonEnd = source.indexOf("</button>", labelIndex);

  if (buttonStart < 0 || buttonEnd < 0) return null;

  const end = buttonEnd + "</button>".length;
  return {
    labelIndex,
    start: buttonStart,
    end,
    text: source.slice(buttonStart, end),
    quote: parserQuoteAt(source, buttonStart)
  };
}

function inferRowVar(source, aroundIndex) {
  const start = Math.max(0, aroundIndex - 9000);
  const end = Math.min(source.length, aroundIndex + 3500);
  const win = source.slice(start, end);

  const excludes = new Set([
    "window", "document", "state", "app", "payload", "button", "event",
    "Math", "String", "Object", "Array", "Date", "JSON", "console"
  ]);

  const patterns = [
    /\b([A-Za-z_$][A-Za-z0-9_$]*)\.(?:aicm_human_review_item_id|review_title|delivery_summary_text|human_review_status_code|priority_code|requested_at|metadata_jsonb|artifact_kind_code|review_kind_code)\b/g,
    /\b([A-Za-z_$][A-Za-z0-9_$]*)\[['"](?:aicm_human_review_item_id|review_title|delivery_summary_text|human_review_status_code|priority_code|requested_at|metadata_jsonb|artifact_kind_code|review_kind_code)['"]\]/g
  ];

  const score = new Map();

  for (const re of patterns) {
    let m;
    while ((m = re.exec(win))) {
      const v = m[1];
      if (!v || excludes.has(v)) continue;
      score.set(v, (score.get(v) || 0) + 1);
    }
  }

  const sorted = Array.from(score.entries()).sort((a, b) => b[1] - a[1]);

  analysis.push("ROW_VAR_CANDIDATES=" + sorted.map(([k, v]) => k + ":" + v).join(","));

  return sorted.length ? sorted[0][0] : "";
}

function attrExpr(rowVar, propList, fallbackLiteral) {
  const chain = propList.map((p) => `${rowVar}.${p}`).join(" || ");
  const fallback = fallbackLiteral === undefined ? '""' : JSON.stringify(fallbackLiteral);
  return '${String((' + chain + ' || ' + fallback + '))}';
}

function patchDecisionButton(source, oldLabel, newLabel, decision, action, rowVar) {
  const found = findButtonAroundLabel(source, oldLabel);

  if (!found) {
    return {
      source,
      patched: false,
      reason: "button_not_found"
    };
  }

  analysis.push("BUTTON_FOUND_" + decision + "=true");
  analysis.push("BUTTON_QUOTE_" + decision + "=" + found.quote);
  analysis.push("OLD_BUTTON_" + decision + "=" + found.text.replace(/\s+/g, " ").slice(0, 700));

  if (found.quote !== "`") {
    return {
      source,
      patched: false,
      reason: "button_not_inside_template_literal"
    };
  }

  let button = found.text;
  const openEnd = button.indexOf(">");

  if (openEnd < 0) {
    return {
      source,
      patched: false,
      reason: "button_open_tag_not_found"
    };
  }

  let open = button.slice(0, openEnd + 1);
  let rest = button.slice(openEnd + 1);

  open = open
    .replace(/\sdisabled(?:=\{?true\}?|=["']disabled["']|=["']true["'])?/g, "")
    .replace(/\saria-disabled=["']true["']/g, "")
    .replace(/\sdata-core-action=["'][^"']*["']/g, "")
    .replace(/\sdata-review-decision=["'][^"']*["']/g, "")
    .replace(/\sdata-review-item-id=["'][^"']*["']/g, "")
    .replace(/\sdata-owner-civilization-id=["'][^"']*["']/g, "")
    .replace(/\sdata-human-reviewer-label=["'][^"']*["']/g, "")
    .replace(/\sdata-aicm-v10gc[0-9a-z-]*=["'][^"']*["']/g, "")
    .replace(/pointer-events\s*:\s*none\s*;?/g, "pointer-events:auto;")
    .replace(/opacity\s*:\s*0\.[0-9]+\s*;?/g, "opacity:1;");

  const reviewIdExpr = attrExpr(rowVar, [
    "aicm_human_review_item_id",
    "review_item_id",
    "review_id",
    "id"
  ], "");

  const ownerExpr = attrExpr(rowVar, [
    "owner_civilization_id",
    "ownerCivilizationId",
    "owner_id",
    "ownerId"
  ], "");

  const reviewerExpr = attrExpr(rowVar, [
    "human_reviewer_label",
    "humanReviewerLabel",
    "reviewer_label",
    "reviewerLabel"
  ], "user");

  if (open.endsWith(">")) {
    open = open.slice(0, -1) +
      ' type="button"' +
      ' data-core-action="review-decision-execute"' +
      ' data-review-decision="' + decision + '"' +
      ' data-review-item-id="' + reviewIdExpr + '"' +
      ' data-owner-civilization-id="' + ownerExpr + '"' +
      ' data-human-reviewer-label="' + reviewerExpr + '"' +
      ' data-aicm-v10gc3-source-patched="true"' +
      ">";
  }

  rest = rest.replace(oldLabel, newLabel);

  const patchedButton = open + rest;
  analysis.push("NEW_BUTTON_" + decision + "=" + patchedButton.replace(/\s+/g, " ").slice(0, 900));

  return {
    source: source.slice(0, found.start) + patchedButton + source.slice(found.end),
    patched: true,
    reason: "patched"
  };
}

function addCanonicalHandler(source) {
  const marker = "AICM_R8Z_V10GC3_REVIEW_DECISION_CANONICAL_HANDLER";

  if (source.includes(marker)) {
    log.push("SKIP: V10GC3 canonical handler already exists");
    return source;
  }

  const block = `

// ${marker}_START
// Canonical review decision handler.
// Source buttons provide required payload data by data-* attributes.
// SERVER_PATCH=NO. No wrapper / no observer / no interval.
(function installAicmR8zV10gc3ReviewDecisionCanonicalHandler() {
  var APPROVE_ROUTE = "/api/aicm/v2/human-review/approve";
  var RETURN_ROUTE = "/api/aicm/v2/human-review/return";

  function text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function app() {
    if (typeof state !== "undefined" && state && typeof state === "object") return state;
    if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
    return {};
  }

  function routeForDecision(decision) {
    return decision === "approved" ? APPROVE_ROUTE : RETURN_ROUTE;
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

  function buildPayloadFromButton(button) {
    return {
      aicm_human_review_item_id: text(button.getAttribute("data-review-item-id") || ""),
      owner_civilization_id: text(button.getAttribute("data-owner-civilization-id") || ""),
      human_reviewer_label: text(button.getAttribute("data-human-reviewer-label") || "user") || "user",
      human_review_note: noteValue()
    };
  }

  function missingPayloadKeys(payload) {
    return ["aicm_human_review_item_id", "owner_civilization_id", "human_reviewer_label"].filter(function(key) {
      return !text(payload[key]);
    });
  }

  async function postReviewDecision(decision, payload) {
    var route = routeForDecision(decision);

    var response = await fetch(route, {
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

      if (s.reviewWaitItems) s.reviewWaitItems = filterRows(s.reviewWaitItems);
      if (s.reviewRows) s.reviewRows = filterRows(s.reviewRows);

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

  async function executeReviewDecision(button) {
    var decision = text(button.getAttribute("data-review-decision") || "");
    var payload = buildPayloadFromButton(button);
    var missing = missingPayloadKeys(payload);

    if (decision !== "approved" && decision !== "returned") {
      setMessageSafe("error", "レビュー操作種別が不明です。");
      return;
    }

    if (missing.length > 0) {
      setMessageSafe("error", "レビュー更新に必要な値が不足しています: " + missing.join(", "));
      try {
        if (typeof window !== "undefined") {
          window.aicmR8zV10gc3LastMissingPayload = payload;
        }
      } catch (_) {}
      if (typeof render === "function") render();
      return;
    }

    try {
      button.disabled = true;
      setMessageSafe("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

      await postReviewDecision(decision, payload);

      setMessageSafe("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

      await refreshReviewList(payload.aicm_human_review_item_id);
    } catch (error) {
      button.disabled = false;
      setMessageSafe("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
      if (typeof render === "function") render();
    }
  }

  if (typeof document !== "undefined") {
    document.addEventListener("click", function(event) {
      var target = event && event.target;
      var button = target && target.closest ? target.closest('button[data-core-action="review-decision-execute"]') : null;
      if (!button) return;

      try { event.preventDefault(); } catch (_) {}
      try { event.stopPropagation(); } catch (_) {}
      try { event.stopImmediatePropagation(); } catch (_) {}

      executeReviewDecision(button);
    }, true);
  }

  if (typeof window !== "undefined") {
    window.aicmR8zV10gc3ExecuteReviewDecision = executeReviewDecision;
  }
})();
// ${marker}_END
`;

  log.push("PATCH_APPLIED: V10GC3 canonical handler appended");
  return source + block;
}

analysis.push("BEFORE_V10GC2B_COUNT=" + count(src, "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE"));
analysis.push("BEFORE_V10GC2F_COUNT=" + count(src, "AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME"));
analysis.push("BEFORE_V10GC2H_COUNT=" + count(src, "AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST"));
analysis.push("BEFORE_V10GC2I_COUNT=" + count(src, "AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK"));
analysis.push("BEFORE_V10GC2J_COUNT=" + count(src, "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX"));
analysis.push("BEFORE_V10GC2L_COUNT=" + count(src, "AICM_R8Z_V10GC2L_DIRECT_CONFIRM_BUTTON_SOURCE_PATCH"));
analysis.push("BEFORE_V10GC3_COUNT=" + count(src, "AICM_R8Z_V10GC3_REVIEW_DECISION_CANONICAL_HANDLER"));
analysis.push("BEFORE_HARD_APPROVE_COUNT=" + count(src, "承認を実行する（次工程）"));
analysis.push("BEFORE_HARD_RETURN_COUNT=" + count(src, "差し戻しを実行する（次工程）"));

const removeTargets = [
  "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE",
  "AICM_R8Z_V10GC2C_REVIEW_CONFIRM_BUTTON_FORCE_ENABLE",
  "AICM_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME",
  "AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME",
  "AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST",
  "AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK",
  "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX",
  "AICM_R8Z_V10GC2L_DIRECT_CONFIRM_BUTTON_SOURCE_PATCH",
  "AICM_R8Z_V10GC3_REVIEW_DECISION_CANONICAL_HANDLER"
];

removeTargets.forEach(removeMarkedBlock);

const approveFound = findButtonAroundLabel(src, "承認を実行する（次工程）");
const returnFound = findButtonAroundLabel(src, "差し戻しを実行する（次工程）");

if (!approveFound || !returnFound) {
  analysis.push("PATCH_DECISION=STOP_CONFIRM_BUTTONS_NOT_FOUND");
  analysis.push("APPROVE_FOUND=" + !!approveFound);
  analysis.push("RETURN_FOUND=" + !!returnFound);
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(2);
}

const rowVarApprove = inferRowVar(src, approveFound.labelIndex);
const rowVarReturn = inferRowVar(src, returnFound.labelIndex);
const rowVar = rowVarApprove || rowVarReturn;

analysis.push("ROW_VAR_APPROVE=" + rowVarApprove);
analysis.push("ROW_VAR_RETURN=" + rowVarReturn);
analysis.push("ROW_VAR_SELECTED=" + rowVar);

if (!rowVar) {
  analysis.push("PATCH_DECISION=STOP_ROW_VAR_NOT_INFERRED");
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(3);
}

let result = patchDecisionButton(
  src,
  "承認を実行する（次工程）",
  "承認を実行する",
  "approved",
  "review-decision-execute",
  rowVar
);
src = result.source;
log.push("APPROVE_SOURCE_PATCHED=" + result.patched);
log.push("APPROVE_PATCH_REASON=" + result.reason);

if (!result.patched) {
  analysis.push("PATCH_DECISION=STOP_APPROVE_PATCH_FAILED");
  analysis.push("APPROVE_REASON=" + result.reason);
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(4);
}

result = patchDecisionButton(
  src,
  "差し戻しを実行する（次工程）",
  "差し戻しを実行する",
  "returned",
  "review-decision-execute",
  rowVar
);
src = result.source;
log.push("RETURN_SOURCE_PATCHED=" + result.patched);
log.push("RETURN_PATCH_REASON=" + result.reason);

if (!result.patched) {
  analysis.push("PATCH_DECISION=STOP_RETURN_PATCH_FAILED");
  analysis.push("RETURN_REASON=" + result.reason);
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(5);
}

src = addCanonicalHandler(src);

analysis.push("AFTER_V10GC2B_COUNT=" + count(src, "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE"));
analysis.push("AFTER_V10GC2F_COUNT=" + count(src, "AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME"));
analysis.push("AFTER_V10GC2H_COUNT=" + count(src, "AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST"));
analysis.push("AFTER_V10GC2I_COUNT=" + count(src, "AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK"));
analysis.push("AFTER_V10GC2J_COUNT=" + count(src, "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX"));
analysis.push("AFTER_V10GC2L_COUNT=" + count(src, "AICM_R8Z_V10GC2L_DIRECT_CONFIRM_BUTTON_SOURCE_PATCH"));
analysis.push("AFTER_V10GC3_COUNT=" + count(src, "AICM_R8Z_V10GC3_REVIEW_DECISION_CANONICAL_HANDLER"));
analysis.push("AFTER_HARD_APPROVE_COUNT=" + count(src, "承認を実行する（次工程）"));
analysis.push("AFTER_HARD_RETURN_COUNT=" + count(src, "差し戻しを実行する（次工程）"));
analysis.push("AFTER_CANONICAL_ACTION_COUNT=" + count(src, 'data-core-action="review-decision-execute"'));
analysis.push("AFTER_REVIEW_DECISION_ATTR_COUNT=" + count(src, "data-review-decision="));
analysis.push("AFTER_REVIEW_ITEM_ID_ATTR_COUNT=" + count(src, "data-review-item-id="));
analysis.push("AFTER_OWNER_ATTR_COUNT=" + count(src, "data-owner-civilization-id="));
analysis.push("AFTER_REVIEWER_ATTR_COUNT=" + count(src, "data-human-reviewer-label="));
analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
