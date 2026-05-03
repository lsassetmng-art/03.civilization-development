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

analysis.push("BEFORE_V10GC2B_COUNT=" + count(src, "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE"));
analysis.push("BEFORE_V10GC2J_COUNT=" + count(src, "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX"));
analysis.push("BEFORE_V10GC3G_COUNT=" + count(src, "AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH"));
analysis.push("BEFORE_V10GC3I_COUNT=" + count(src, "AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON"));
analysis.push("BEFORE_DISABLED_NEXT_BUTTON_COUNT=" + count(src, 'disabled title="V10Gで有効化予定"'));
analysis.push("BEFORE_NEXT_STEP_LABEL_COUNT=" + count(src, "を実行する（次工程）"));

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
  "AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH",
  "AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON"
].forEach(removeMarkedBlock);

const oldButtonLine = `        '    <button type="button" disabled title="V10Gで有効化予定">' + esc(operation) + 'を実行する（次工程）</button>',`;

const newButtonLine = `        '    <button type="button" class="aicm-primary-button" data-core-action="review-decision-execute" data-review-decision="' + esc(nextStatus) + '" data-review-item-id="' + esc(id) + '" data-owner-civilization-id="' + esc(row.owner_civilization_id || row.ownerCivilizationId || row.owner_id || row.ownerId || "") + '" data-human-reviewer-label="' + esc(row.human_reviewer_label || row.humanReviewerLabel || row.reviewer_label || row.reviewerLabel || "user") + '">' + esc(operation) + 'を実行する</button>',`;

const oldNoteLine = `        '    <p class="aicm-selected-note">成果物内容・AIレビュー・未解決事項を確認したうえで、次工程でDB更新を実行します。</p>',`;
const newNoteLine = `        '    <p class="aicm-selected-note">成果物内容・AIレビュー・未解決事項を確認したうえで、下のボタンからDB更新を実行します。</p>',`;

const oldMainNoteLine = `        '  <p class="aicm-selected-note">まだDB更新は実行しません。次工程V10GでAPI rollback smokeを行ってから本実行します。</p>',`;
const newMainNoteLine = `        '  <p class="aicm-selected-note">この確認画面で内容を確認し、問題なければDB更新を実行します。</p>',`;

const oldButtonCount = count(src, oldButtonLine);
analysis.push("OLD_BUTTON_EXACT_COUNT=" + oldButtonCount);

if (oldButtonCount !== 1) {
  analysis.push("PATCH_DECISION=STOP_OLD_DISABLED_BUTTON_EXACT_COUNT_NOT_ONE");
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(2);
}

src = src.replace(oldButtonLine, newButtonLine);

if (src.includes(oldNoteLine)) {
  src = src.replace(oldNoteLine, newNoteLine);
  log.push("NOTE_LINE_PATCHED=true");
} else {
  log.push("NOTE_LINE_PATCHED=false");
}

if (src.includes(oldMainNoteLine)) {
  src = src.replace(oldMainNoteLine, newMainNoteLine);
  log.push("MAIN_NOTE_LINE_PATCHED=true");
} else {
  log.push("MAIN_NOTE_LINE_PATCHED=false");
}

function addHandler() {
  const marker = "AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON";

  if (src.includes(marker)) {
    log.push("SKIP: V10GC3I marker already exists");
    return;
  }

  const block = `

// ${marker}_START
// Canonical review decision handler for renderConfirm(row, mode, id).
// No DOM post-render normalization, no observer, no hardcoded owner fallback.
function aicmR8zV10gc3iText(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function aicmR8zV10gc3iApp() {
  if (typeof state !== "undefined" && state && typeof state === "object") return state;
  if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
  return {};
}

function aicmR8zV10gc3iNoteValue() {
  try {
    var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
    return node ? aicmR8zV10gc3iText(node.value) : "";
  } catch (_) {
    return "";
  }
}

function aicmR8zV10gc3iSetMessage(kind, value) {
  try {
    if (typeof setMessage === "function") {
      setMessage(kind, value);
      return;
    }
  } catch (_) {}

  try {
    var s = aicmR8zV10gc3iApp();
    s.messageKind = kind;
    s.messageText = value;
  } catch (_) {}
}

function aicmR8zV10gc3iBuildPayload(button) {
  return {
    aicm_human_review_item_id: aicmR8zV10gc3iText(button.getAttribute("data-review-item-id") || ""),
    owner_civilization_id: aicmR8zV10gc3iText(button.getAttribute("data-owner-civilization-id") || ""),
    human_reviewer_label: aicmR8zV10gc3iText(button.getAttribute("data-human-reviewer-label") || "user") || "user",
    human_review_note: aicmR8zV10gc3iNoteValue()
  };
}

function aicmR8zV10gc3iMissingPayloadKeys(payload) {
  return ["aicm_human_review_item_id", "owner_civilization_id", "human_reviewer_label"].filter(function(key) {
    return !aicmR8zV10gc3iText(payload[key]);
  });
}

function aicmR8zV10gc3iRoute(decision) {
  return decision === "returned" ? "/api/aicm/v2/human-review/return" : "/api/aicm/v2/human-review/approve";
}

async function aicmR8zV10gc3iPostDecision(decision, payload) {
  var response = await fetch(aicmR8zV10gc3iRoute(decision), {
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

function aicmR8zV10gc3iRemoveReviewFromState(reviewId) {
  var s = aicmR8zV10gc3iApp();
  var id = aicmR8zV10gc3iText(reviewId);

  function same(row) {
    return aicmR8zV10gc3iText(row && (
      row.aicm_human_review_item_id ||
      row.human_review_item_id ||
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
      Object.keys(s.context).forEach(function(key) {
        if (Array.isArray(s.context[key])) {
          s.context[key] = filterRows(s.context[key]);
        }
      });
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

async function aicmR8zV10gc3iRefreshReviewList(reviewId) {
  aicmR8zV10gc3iRemoveReviewFromState(reviewId);

  try {
    if (typeof aicmR8zV9ReviewListScriptHydrate === "function") {
      aicmR8zV9ReviewListScriptHydrate(aicmR8zV10gc3iApp());
    }
  } catch (_) {}

  try {
    if (typeof render === "function") render();
  } catch (_) {}
}

async function aicmR8zV10gc3iExecuteReviewDecision(button) {
  var decision = aicmR8zV10gc3iText(button.getAttribute("data-review-decision") || "");
  var payload = aicmR8zV10gc3iBuildPayload(button);
  var missing = aicmR8zV10gc3iMissingPayloadKeys(payload);

  if (decision !== "approved" && decision !== "returned") {
    aicmR8zV10gc3iSetMessage("error", "レビュー操作種別が不明です。");
    return;
  }

  if (missing.length > 0) {
    aicmR8zV10gc3iSetMessage("error", "レビュー更新に必要な値が不足しています: " + missing.join(", "));
    try {
      if (typeof window !== "undefined") {
        window.aicmR8zV10gc3iLastMissingPayload = payload;
      }
    } catch (_) {}
    if (typeof render === "function") render();
    return;
  }

  try {
    button.disabled = true;
    aicmR8zV10gc3iSetMessage("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

    await aicmR8zV10gc3iPostDecision(decision, payload);

    aicmR8zV10gc3iSetMessage("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

    await aicmR8zV10gc3iRefreshReviewList(payload.aicm_human_review_item_id);
  } catch (error) {
    button.disabled = false;
    aicmR8zV10gc3iSetMessage("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
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

    aicmR8zV10gc3iExecuteReviewDecision(button);
  }, true);
}

if (typeof window !== "undefined") {
  window.aicmR8zV10gc3iExecuteReviewDecision = aicmR8zV10gc3iExecuteReviewDecision;
}
// ${marker}_END
`;

  src += block;
  log.push("PATCH_APPLIED: V10GC3I renderConfirm direct button canon handler appended");
}

addHandler();

analysis.push("AFTER_V10GC2B_COUNT=" + count(src, "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE"));
analysis.push("AFTER_V10GC2J_COUNT=" + count(src, "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX"));
analysis.push("AFTER_V10GC3G_COUNT=" + count(src, "AICM_R8Z_V10GC3G_EXACT_RENDERCONFIRM_CALL_PATCH"));
analysis.push("AFTER_V10GC3I_COUNT=" + count(src, "AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON"));
analysis.push("AFTER_DISABLED_NEXT_BUTTON_COUNT=" + count(src, 'disabled title="V10Gで有効化予定"'));
analysis.push("AFTER_NEXT_STEP_LABEL_COUNT=" + count(src, "を実行する（次工程）"));
analysis.push("AFTER_CANONICAL_ACTION_COUNT=" + count(src, 'data-core-action="review-decision-execute"'));
analysis.push("AFTER_REVIEW_DECISION_ATTR_COUNT=" + count(src, "data-review-decision"));
analysis.push("AFTER_REVIEW_ITEM_ATTR_COUNT=" + count(src, "data-review-item-id"));
analysis.push("AFTER_OWNER_ATTR_COUNT=" + count(src, "data-owner-civilization-id"));
analysis.push("AFTER_REVIEWER_ATTR_COUNT=" + count(src, "data-human-reviewer-label"));
analysis.push("AFTER_FIXED_OWNER_FALLBACK_COUNT_IN_V10GC3I_BLOCK=" + (src.includes("AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON") && src.slice(src.indexOf("AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON")).includes("00000000-0000-4000-8000-000000000001") ? 1 : 0));
analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
