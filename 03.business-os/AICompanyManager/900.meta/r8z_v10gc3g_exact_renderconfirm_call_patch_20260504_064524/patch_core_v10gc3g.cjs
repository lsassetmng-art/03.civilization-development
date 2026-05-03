const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");
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

function lineOf(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function scanBraceEnd(openIndex) {
  let depth = 0;
  let quote = "";
  let esc = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

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

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

function findMatchingParenInText(text, openIndex) {
  let depth = 0;
  let quote = "";
  let esc = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

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

    if (ch === "(") depth += 1;
    if (ch === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function findFunctionContaining(label) {
  const labelIndex = src.indexOf(label);
  if (labelIndex < 0) return null;

  const prefix = src.slice(0, labelIndex);
  const patterns = [
    /(?:async\s+)?function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\([^)]*\)\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*function\s*\([^)]*\)\s*\{/g
  ];

  let best = null;

  for (const re of patterns) {
    let m;
    while ((m = re.exec(prefix))) {
      if (!best || m.index > best.index) {
        best = { index: m.index, header: m[0] };
      }
    }
  }

  if (!best) return null;

  const open = src.indexOf("{", best.index);
  const end = scanBraceEnd(open);

  if (open < 0 || end < 0 || labelIndex > end) return null;

  return {
    start: best.index,
    end,
    header: best.header,
    startLine: lineOf(best.index),
    endLine: lineOf(end),
    text: src.slice(best.index, end)
  };
}

function inferRowVar(fnText) {
  const excludes = new Set([
    "window", "document", "state", "app", "payload", "button", "event",
    "Math", "String", "Object", "Array", "Date", "JSON", "console"
  ]);

  const patterns = [
    /\b([A-Za-z_$][A-Za-z0-9_$]*)\.(?:aicm_human_review_item_id|review_item_id|review_id|review_title|delivery_summary_text|human_review_status_code|priority_code|requested_at|metadata_jsonb|artifact_kind_code|review_kind_code|owner_civilization_id|human_reviewer_label)\b/g,
    /\b([A-Za-z_$][A-Za-z0-9_$]*)\[['"](?:aicm_human_review_item_id|review_item_id|review_id|review_title|delivery_summary_text|human_review_status_code|priority_code|requested_at|metadata_jsonb|artifact_kind_code|review_kind_code|owner_civilization_id|human_reviewer_label)['"]\]/g
  ];

  const score = new Map();

  for (const re of patterns) {
    let m;
    while ((m = re.exec(fnText))) {
      const v = m[1];
      if (!v || excludes.has(v)) continue;
      score.set(v, (score.get(v) || 0) + 1);
    }
  }

  const sorted = Array.from(score.entries()).sort((a, b) => b[1] - a[1]);

  return {
    selected: sorted.length ? sorted[0][0] : "",
    candidates: sorted.map(([k, v]) => k + ":" + v).join(",")
  };
}

function patchSingleRenderConfirmCall(fn, rowVar) {
  const callMatches = [];
  const re = /\brenderConfirm\s*\(/g;
  let m;

  while ((m = re.exec(fn.text))) {
    callMatches.push(m.index);
  }

  analysis.push("RENDERCONFIRM_CALL_MATCH_COUNT=" + callMatches.length);

  if (callMatches.length !== 1) {
    return {
      patched: false,
      reason: "renderConfirm_call_count_not_one",
      count: callMatches.length
    };
  }

  const callStart = callMatches[0];
  const open = fn.text.indexOf("(", callStart);
  const close = findMatchingParenInText(fn.text, open);

  if (open < 0 || close < 0) {
    return {
      patched: false,
      reason: "renderConfirm_paren_not_matched",
      count: callMatches.length
    };
  }

  const originalCall = fn.text.slice(callStart, close + 1);
  const replacement = "aicmR8zV10gc3gInsertReviewDecisionAction(" + originalCall + ", " + rowVar + ")";

  const patchedFnText = fn.text.slice(0, callStart) + replacement + fn.text.slice(close + 1);
  src = src.slice(0, fn.start) + patchedFnText + src.slice(fn.end);

  analysis.push("ORIGINAL_RENDERCONFIRM_CALL=" + originalCall.replace(/\s+/g, " ").slice(0, 900));
  analysis.push("PATCHED_RENDERCONFIRM_CALL=" + replacement.replace(/\s+/g, " ").slice(0, 900));

  return {
    patched: true,
    reason: "patched",
    count: callMatches.length
  };
}

function addCanonicalHelperAndHandler() {
  const marker = "AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH";

  if (src.includes(marker)) {
    log.push("SKIP: V10GC3G marker already exists");
    return;
  }

  const block = `

// ${marker}_START
// Canonical review decision patch through the confirmed single renderConfirm(...) call.
// No MutationObserver, no interval, no hardcoded owner fallback.
function aicmR8zV10gc3gText(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function aicmR8zV10gc3gAttr(value) {
  return aicmR8zV10gc3gText(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function aicmR8zV10gc3gPick(row, keys) {
  if (!row || typeof row !== "object") return "";

  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    if (row[key] !== undefined && row[key] !== null && aicmR8zV10gc3gText(row[key]) !== "") {
      return aicmR8zV10gc3gText(row[key]);
    }
  }

  return "";
}

function aicmR8zV10gc3gDecisionFromHtml(html) {
  var s = String(html || "");

  if (s.indexOf("差し戻し前の最終確認") >= 0) return "returned";
  if (s.indexOf("承認前の最終確認") >= 0) return "approved";

  return "";
}

function aicmR8zV10gc3gReviewDecisionActionHtml(row, decision) {
  var reviewId = aicmR8zV10gc3gPick(row, [
    "aicm_human_review_item_id",
    "review_item_id",
    "review_id",
    "id"
  ]);

  var ownerId = aicmR8zV10gc3gPick(row, [
    "owner_civilization_id",
    "ownerCivilizationId",
    "owner_id",
    "ownerId"
  ]);

  var reviewerLabel = aicmR8zV10gc3gPick(row, [
    "human_reviewer_label",
    "humanReviewerLabel",
    "reviewer_label",
    "reviewerLabel"
  ]) || "user";

  var label = decision === "returned" ? "差し戻しを実行する" : "承認を実行する";

  return [
    '<section class="aicm-core-card" data-aicm-v10gc3g-review-decision-actions="true">',
    '  <p class="aicm-eyebrow">最終実行</p>',
    '  <p class="aicm-selected-note">このボタンを押すとレビュー状態を更新します。</p>',
    '  <button type="button" class="aicm-primary-button"',
    '    data-core-action="review-decision-execute"',
    '    data-review-decision="' + aicmR8zV10gc3gAttr(decision) + '"',
    '    data-review-item-id="' + aicmR8zV10gc3gAttr(reviewId) + '"',
    '    data-owner-civilization-id="' + aicmR8zV10gc3gAttr(ownerId) + '"',
    '    data-human-reviewer-label="' + aicmR8zV10gc3gAttr(reviewerLabel) + '">',
    '    ' + aicmR8zV10gc3gAttr(label),
    '  </button>',
    '</section>'
  ].join("");
}

function aicmR8zV10gc3gInsertReviewDecisionAction(html, row) {
  var s = String(html || "");

  if (s.indexOf('data-aicm-v10gc3g-review-decision-actions="true"') >= 0) return s;

  var decision = aicmR8zV10gc3gDecisionFromHtml(s);
  if (!decision) return s;

  return s + aicmR8zV10gc3gReviewDecisionActionHtml(row, decision);
}

function aicmR8zV10gc3gApp() {
  if (typeof state !== "undefined" && state && typeof state === "object") return state;
  if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
  return {};
}

function aicmR8zV10gc3gNoteValue() {
  try {
    var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
    return node ? aicmR8zV10gc3gText(node.value) : "";
  } catch (_) {
    return "";
  }
}

function aicmR8zV10gc3gSetMessage(kind, value) {
  try {
    if (typeof setMessage === "function") {
      setMessage(kind, value);
      return;
    }
  } catch (_) {}

  try {
    var s = aicmR8zV10gc3gApp();
    s.messageKind = kind;
    s.messageText = value;
  } catch (_) {}
}

function aicmR8zV10gc3gBuildPayload(button) {
  return {
    aicm_human_review_item_id: aicmR8zV10gc3gText(button.getAttribute("data-review-item-id") || ""),
    owner_civilization_id: aicmR8zV10gc3gText(button.getAttribute("data-owner-civilization-id") || ""),
    human_reviewer_label: aicmR8zV10gc3gText(button.getAttribute("data-human-reviewer-label") || "user") || "user",
    human_review_note: aicmR8zV10gc3gNoteValue()
  };
}

function aicmR8zV10gc3gMissingPayloadKeys(payload) {
  return ["aicm_human_review_item_id", "owner_civilization_id", "human_reviewer_label"].filter(function(key) {
    return !aicmR8zV10gc3gText(payload[key]);
  });
}

function aicmR8zV10gc3gRoute(decision) {
  return decision === "returned" ? "/api/aicm/v2/human-review/return" : "/api/aicm/v2/human-review/approve";
}

async function aicmR8zV10gc3gPostDecision(decision, payload) {
  var response = await fetch(aicmR8zV10gc3gRoute(decision), {
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

function aicmR8zV10gc3gRemoveReviewFromState(reviewId) {
  var s = aicmR8zV10gc3gApp();
  var id = aicmR8zV10gc3gText(reviewId);

  function same(row) {
    return aicmR8zV10gc3gText(row && (
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
    s.reviewWaitItems = filterRows(s.reviewWaitItems);
    s.reviewRows = filterRows(s.reviewRows);

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

async function aicmR8zV10gc3gRefreshReviewList(reviewId) {
  aicmR8zV10gc3gRemoveReviewFromState(reviewId);

  try {
    if (typeof aicmR8zV9ReviewListScriptHydrate === "function") {
      aicmR8zV9ReviewListScriptHydrate(aicmR8zV10gc3gApp());
    }
  } catch (_) {}

  try {
    if (typeof render === "function") render();
  } catch (_) {}
}

async function aicmR8zV10gc3gExecuteReviewDecision(button) {
  var decision = aicmR8zV10gc3gText(button.getAttribute("data-review-decision") || "");
  var payload = aicmR8zV10gc3gBuildPayload(button);
  var missing = aicmR8zV10gc3gMissingPayloadKeys(payload);

  if (decision !== "approved" && decision !== "returned") {
    aicmR8zV10gc3gSetMessage("error", "レビュー操作種別が不明です。");
    return;
  }

  if (missing.length > 0) {
    aicmR8zV10gc3gSetMessage("error", "レビュー更新に必要な値が不足しています: " + missing.join(", "));
    try {
      if (typeof window !== "undefined") {
        window.aicmR8zV10gc3gLastMissingPayload = payload;
      }
    } catch (_) {}
    if (typeof render === "function") render();
    return;
  }

  try {
    button.disabled = true;
    aicmR8zV10gc3gSetMessage("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

    await aicmR8zV10gc3gPostDecision(decision, payload);

    aicmR8zV10gc3gSetMessage("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

    await aicmR8zV10gc3gRefreshReviewList(payload.aicm_human_review_item_id);
  } catch (error) {
    button.disabled = false;
    aicmR8zV10gc3gSetMessage("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
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

    aicmR8zV10gc3gExecuteReviewDecision(button);
  }, true);
}

if (typeof window !== "undefined") {
  window.aicmR8zV10gc3gExecuteReviewDecision = aicmR8zV10gc3gExecuteReviewDecision;
}
// ${marker}_END
`;

  src += block;
  log.push("PATCH_APPLIED: V10GC3G helper and canonical handler appended");
}

analysis.push("BEFORE_V10GC2B_COUNT=" + count(src, "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE"));
analysis.push("BEFORE_V10GC2F_COUNT=" + count(src, "AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME"));
analysis.push("BEFORE_V10GC2H_COUNT=" + count(src, "AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST"));
analysis.push("BEFORE_V10GC2I_COUNT=" + count(src, "AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK"));
analysis.push("BEFORE_V10GC2J_COUNT=" + count(src, "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX"));
analysis.push("BEFORE_V10GC2L_COUNT=" + count(src, "AICM_R8Z_V10GC2L_DIRECT_CONFIRM_BUTTON_SOURCE_PATCH"));
analysis.push("BEFORE_V10GC3E_COUNT=" + count(src, "AICM_R8Z_V10GC3E_RENDERCONFIRM_REVIEW_DECISION_RECOVERY"));
analysis.push("BEFORE_V10GC3G_COUNT=" + count(src, "AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH"));

[
  "AICM_R8Z_V10GC_REVIEW_ITEM_DECISION_CORE",
  "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE",
  "AICM_R8Z_V10GC2C_REVIEW_CONFIRM_BUTTON_FORCE_ENABLE",
  "AICM_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME",
  "AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME",
  "AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST",
  "AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK",
  "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX",
  "AICM_R8Z_V10GC2L_DIRECT_CONFIRM_BUTTON_SOURCE_PATCH",
  "AICM_R8Z_V10GC3_REVIEW_DECISION_CANONICAL_HANDLER",
  "AICM_R8Z_V10GC3E_RENDERCONFIRM_REVIEW_DECISION_RECOVERY",
  "AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH"
].forEach(removeMarkedBlock);

const approveFn = findFunctionContaining("承認前の最終確認");
const returnFn = findFunctionContaining("差し戻し前の最終確認");

analysis.push("APPROVE_FN_FOUND=" + !!approveFn);
analysis.push("RETURN_FN_FOUND=" + !!returnFn);
analysis.push("APPROVE_FN_HEADER=" + (approveFn ? approveFn.header : ""));
analysis.push("RETURN_FN_HEADER=" + (returnFn ? returnFn.header : ""));

if (!approveFn || !returnFn) {
  analysis.push("PATCH_DECISION=STOP_CONFIRM_RENDERER_NOT_FOUND");
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(2);
}

const sameFunction = approveFn.start === returnFn.start && approveFn.end === returnFn.end;
analysis.push("SAME_CONFIRM_FUNCTION=" + sameFunction);

const targetFn = sameFunction ? approveFn : approveFn;
const row = inferRowVar(targetFn.text);

analysis.push("ROW_VAR_SELECTED=" + row.selected);
analysis.push("ROW_VAR_CANDIDATES=" + row.candidates);

if (!row.selected) {
  analysis.push("PATCH_DECISION=STOP_ROW_VAR_NOT_INFERRED");
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(3);
}

const result = patchSingleRenderConfirmCall(targetFn, row.selected);

analysis.push("PATCH_RESULT=" + result.patched);
analysis.push("PATCH_REASON=" + result.reason);

if (!result.patched) {
  analysis.push("PATCH_DECISION=STOP_RENDERCONFIRM_CALL_PATCH_FAILED");
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(4);
}

addCanonicalHelperAndHandler();

analysis.push("AFTER_V10GC2B_COUNT=" + count(src, "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE"));
analysis.push("AFTER_V10GC2F_COUNT=" + count(src, "AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME"));
analysis.push("AFTER_V10GC2H_COUNT=" + count(src, "AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST"));
analysis.push("AFTER_V10GC2I_COUNT=" + count(src, "AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK"));
analysis.push("AFTER_V10GC2J_COUNT=" + count(src, "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX"));
analysis.push("AFTER_V10GC2L_COUNT=" + count(src, "AICM_R8Z_V10GC2L_DIRECT_CONFIRM_BUTTON_SOURCE_PATCH"));
analysis.push("AFTER_V10GC3E_COUNT=" + count(src, "AICM_R8Z_V10GC3E_RENDERCONFIRM_REVIEW_DECISION_RECOVERY"));
analysis.push("AFTER_V10GC3G_COUNT=" + count(src, "AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH"));
analysis.push("AFTER_RENDERCONFIRM_WRAP_COUNT=" + count(src, "aicmR8zV10gc3gInsertReviewDecisionAction(renderConfirm"));
analysis.push("AFTER_CANONICAL_ACTION_COUNT=" + count(src, 'data-core-action="review-decision-execute"'));
analysis.push("AFTER_OWNER_ATTR_COUNT=" + count(src, "data-owner-civilization-id"));
analysis.push("AFTER_REVIEWER_ATTR_COUNT=" + count(src, "data-human-reviewer-label"));
analysis.push("AFTER_REVIEW_ITEM_ATTR_COUNT=" + count(src, "data-review-item-id"));
analysis.push("AFTER_FIXED_OWNER_FALLBACK_COUNT_IN_V10GC3G_BLOCK=" + (src.includes("AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH") && src.slice(src.indexOf("AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH")).includes("00000000-0000-4000-8000-000000000001") ? 1 : 0));
analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
