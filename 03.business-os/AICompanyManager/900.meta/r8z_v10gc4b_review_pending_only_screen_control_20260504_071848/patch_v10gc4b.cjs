const fs = require("fs");

const corePath = process.argv[2];
const serverPath = process.argv[3];
const logPath = process.argv[4];
const analysisPath = process.argv[5];

let core = fs.readFileSync(corePath, "utf8");
let server = fs.readFileSync(serverPath, "utf8");

const log = [];
const analysis = [];

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), "g")) || []).length;
}

function removeMarkedBlockFrom(text, marker) {
  const before = text.length;
  const re = new RegExp(
    "\\n\\s*//\\s*" + escRe(marker) + "_START[\\s\\S]*?//\\s*" + escRe(marker) + "_END\\s*\\n?",
    "g"
  );
  const next = text.replace(re, "\n");
  return { text: next, removed: before !== next.length };
}

function scanBraceEnd(source, openIndex) {
  let depth = 0;
  let quote = "";
  let esc = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < source.length; i += 1) {
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

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

function findFunction(source, name) {
  const patterns = [
    new RegExp("(?:async\\s+)?function\\s+" + escRe(name) + "\\s*\\([^)]*\\)\\s*\\{"),
    new RegExp("(?:const|let|var)\\s+" + escRe(name) + "\\s*=\\s*(?:async\\s*)?function\\s*\\([^)]*\\)\\s*\\{"),
    new RegExp("(?:const|let|var)\\s+" + escRe(name) + "\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{")
  ];

  for (const re of patterns) {
    const m = source.match(re);
    if (m && typeof m.index === "number") {
      const open = source.indexOf("{", m.index);
      const end = scanBraceEnd(source, open);
      if (open >= 0 && end > open) {
        return {
          start: m.index,
          end,
          open,
          text: source.slice(m.index, end),
          header: m[0]
        };
      }
    }
  }

  return null;
}

function patchFunctionInsertBeforeClose(source, name, markerLine, insertCode) {
  const fn = findFunction(source, name);
  if (!fn) return { source, patched: false, reason: "function_not_found" };

  if (fn.text.includes(markerLine)) {
    return { source, patched: false, reason: "already_has_marker" };
  }

  const patchedText = fn.text.slice(0, -1) + "\n" + insertCode + "\n}";
  return {
    source: source.slice(0, fn.start) + patchedText + source.slice(fn.end),
    patched: true,
    reason: "patched"
  };
}

analysis.push("BEFORE_CORE_V10GC4B_COUNT=" + count(core, "AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL"));
analysis.push("BEFORE_SERVER_V10GC4B_COUNT=" + count(server, "AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_CONTEXT_FILTER"));
analysis.push("BEFORE_SERVER_CONTEXT_CALL_COUNT=" + count(server, 'sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));'));
analysis.push("BEFORE_SERVER_REVIEW_VIEW_COUNT=" + count(server, "vw_aicm_human_review_wait_display"));
analysis.push("BEFORE_CORE_V10GC3I_COUNT=" + count(core, "AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON"));

for (const marker of [
  "AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL"
]) {
  const r = removeMarkedBlockFrom(core, marker);
  core = r.text;
  log.push("REMOVED_CORE_" + marker + "=" + r.removed);
}

for (const marker of [
  "AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_CONTEXT_FILTER"
]) {
  const r = removeMarkedBlockFrom(server, marker);
  server = r.text;
  log.push("REMOVED_SERVER_" + marker + "=" + r.removed);
}

/* -----------------------------
 * server patch
 * ----------------------------- */
const oldContextCall = 'sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));';
const newContextCall = 'sendJson(res, 200, aicmR8zV10gc4bFilterPendingReviewContext(getContext(url.searchParams.get("owner_civilization_id") || "")));';

const contextCallCount = count(server, oldContextCall);
analysis.push("SERVER_CONTEXT_CALL_EXACT_COUNT=" + contextCallCount);

if (contextCallCount !== 1) {
  analysis.push("SERVER_PATCH_DECISION=STOP_CONTEXT_CALL_COUNT_NOT_ONE");
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(2);
}

server = server.replace(oldContextCall, newContextCall);

const serverBlock = `

// AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_CONTEXT_FILTER_START
// Review wait context must expose pending items only.
// This is a presentation/context filter; it does not modify DB state.
function aicmR8zV10gc4bIsReviewWaitRow(row) {
  return !!(row && typeof row === "object" && (
    Object.prototype.hasOwnProperty.call(row, "aicm_human_review_item_id") ||
    Object.prototype.hasOwnProperty.call(row, "human_review_status_code") ||
    Object.prototype.hasOwnProperty.call(row, "review_kind_code") ||
    Object.prototype.hasOwnProperty.call(row, "artifact_kind_code")
  ));
}

function aicmR8zV10gc4bReviewStatus(row) {
  return String(
    row && (
      row.human_review_status_code ||
      row.review_status ||
      row.status_code ||
      row.status ||
      ""
    ) || ""
  ).trim();
}

function aicmR8zV10gc4bFilterReviewWaitArray(rows) {
  if (!Array.isArray(rows)) return rows;

  var hasReviewRows = rows.some(aicmR8zV10gc4bIsReviewWaitRow);
  if (!hasReviewRows) return rows;

  return rows.filter(function(row) {
    return aicmR8zV10gc4bReviewStatus(row) === "pending";
  });
}

function aicmR8zV10gc4bFilterPendingReviewContext(value) {
  if (!value || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return aicmR8zV10gc4bFilterReviewWaitArray(value).map(aicmR8zV10gc4bFilterPendingReviewContext);
  }

  Object.keys(value).forEach(function(key) {
    var child = value[key];

    if (Array.isArray(child)) {
      value[key] = aicmR8zV10gc4bFilterReviewWaitArray(child).map(aicmR8zV10gc4bFilterPendingReviewContext);
    } else if (child && typeof child === "object") {
      value[key] = aicmR8zV10gc4bFilterPendingReviewContext(child);
    }
  });

  return value;
}
// AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_CONTEXT_FILTER_END
`;

server += serverBlock;

/* -----------------------------
 * core patch
 * ----------------------------- */
const coreBlock = `

// AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL_START
// Review list screen-control guard.
// Shows pending review items only and clears stale confirm/detail/metadata state after review decisions.
function aicmR8zV10gc4bText(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function aicmR8zV10gc4bApp() {
  if (typeof state !== "undefined" && state && typeof state === "object") return state;
  if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
  return {};
}

function aicmR8zV10gc4bIsReviewRow(row) {
  return !!(row && typeof row === "object" && (
    Object.prototype.hasOwnProperty.call(row, "aicm_human_review_item_id") ||
    Object.prototype.hasOwnProperty.call(row, "human_review_status_code") ||
    Object.prototype.hasOwnProperty.call(row, "review_kind_code") ||
    Object.prototype.hasOwnProperty.call(row, "artifact_kind_code")
  ));
}

function aicmR8zV10gc4bStatus(row) {
  return aicmR8zV10gc4bText(row && (
    row.human_review_status_code ||
    row.review_status ||
    row.status_code ||
    row.status ||
    ""
  ));
}

function aicmR8zV10gc4bFilterReviewRows(rows) {
  if (!Array.isArray(rows)) return rows;

  var hasReviewRows = rows.some(aicmR8zV10gc4bIsReviewRow);
  if (!hasReviewRows) return rows;

  return rows.filter(function(row) {
    return aicmR8zV10gc4bStatus(row) === "pending";
  });
}

function aicmR8zV10gc4bFilterObjectReviewRows(obj) {
  if (!obj || typeof obj !== "object") return obj;

  Object.keys(obj).forEach(function(key) {
    var value = obj[key];

    if (Array.isArray(value)) {
      obj[key] = aicmR8zV10gc4bFilterReviewRows(value);
    } else if (value && typeof value === "object") {
      aicmR8zV10gc4bFilterObjectReviewRows(value);
    }
  });

  return obj;
}

function aicmR8zV10gc4bClearReviewConfirmAndDetailState() {
  var app = aicmR8zV10gc4bApp();

  try {
    app.aicmR8zV10fReviewConfirm = null;
    app.reviewDecisionConfirm = null;
    app.reviewConfirm = null;
    app.aicmReviewConfirm = null;
    app.selectedReview = null;
    app.reviewDetail = null;
    app.selectedReviewDetail = null;
    app.reviewMetadata = null;
    app.reviewArtifactDetail = null;
    app.aicmReviewArtifactDetail = null;
  } catch (_) {}
}

function aicmR8zV10gc4bScrubReviewListState() {
  var app = aicmR8zV10gc4bApp();

  try {
    aicmR8zV10gc4bFilterObjectReviewRows(app);

    if (app.context && typeof app.context === "object") {
      aicmR8zV10gc4bFilterObjectReviewRows(app.context);
    }
  } catch (_) {}

  return app;
}

function aicmR8zV10gc4bAfterReviewDecisionSuccess() {
  var app = aicmR8zV10gc4bScrubReviewListState();

  try {
    app.screen = "review-list";
  } catch (_) {}

  aicmR8zV10gc4bClearReviewConfirmAndDetailState();

  try {
    if (typeof window !== "undefined" && window.scrollTo) {
      window.scrollTo(0, 0);
    }
  } catch (_) {}
}

function aicmR8zV10gc4bInstallOneShotScrub() {
  try {
    setTimeout(function() {
      try {
        aicmR8zV10gc4bScrubReviewListState();
        if (typeof render === "function") render();
      } catch (_) {}
    }, 0);
  } catch (_) {}
}

if (typeof window !== "undefined") {
  window.aicmR8zV10gc4bScrubReviewListState = aicmR8zV10gc4bScrubReviewListState;
  window.aicmR8zV10gc4bAfterReviewDecisionSuccess = aicmR8zV10gc4bAfterReviewDecisionSuccess;
  aicmR8zV10gc4bInstallOneShotScrub();
}
// AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL_END
`;

core += coreBlock;

const insertCode = `
  // AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL_CALL
  try {
    if (typeof aicmR8zV10gc4bAfterReviewDecisionSuccess === "function") {
      aicmR8zV10gc4bAfterReviewDecisionSuccess();
    }
  } catch (_) {}
`;

const refreshPatch = patchFunctionInsertBeforeClose(
  core,
  "aicmR8zV10gc3iRefreshReviewList",
  "AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL_CALL",
  insertCode
);

core = refreshPatch.source;
analysis.push("CORE_REFRESH_PATCH_RESULT=" + refreshPatch.patched);
analysis.push("CORE_REFRESH_PATCH_REASON=" + refreshPatch.reason);

analysis.push("AFTER_CORE_V10GC4B_COUNT=" + count(core, "AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL"));
analysis.push("AFTER_SERVER_V10GC4B_COUNT=" + count(server, "AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_CONTEXT_FILTER"));
analysis.push("AFTER_SERVER_CONTEXT_FILTER_CALL_COUNT=" + count(server, "aicmR8zV10gc4bFilterPendingReviewContext(getContext"));
analysis.push("AFTER_CORE_PENDING_FILTER_FUNC_COUNT=" + count(core, "aicmR8zV10gc4bFilterReviewRows"));
analysis.push("AFTER_CORE_SUCCESS_TRANSITION_CALL_COUNT=" + count(core, "aicmR8zV10gc4bAfterReviewDecisionSuccess"));
analysis.push("AFTER_CORE_EMPTY_TEXT_COUNT=" + count(core, "レビュー・承認待ちはありません"));
analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, core, "utf8");
fs.writeFileSync(serverPath, server, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
