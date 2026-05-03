const fs = require("fs");

const path = process.argv[2];
const out = process.argv[3];

let raw = "";
try { raw = fs.readFileSync(path, "utf8"); } catch (_) { raw = ""; }

let json = null;
try { json = JSON.parse(raw); } catch (_) { json = null; }

const statuses = {};
let reviewRows = 0;

function isObj(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function statusOf(row) {
  if (!isObj(row)) return "";
  return String(row.human_review_status_code || row.review_status || row.status_code || row.status || "").trim();
}

function isReviewRow(row) {
  return isObj(row) && (
    Object.prototype.hasOwnProperty.call(row, "aicm_human_review_item_id") ||
    Object.prototype.hasOwnProperty.call(row, "human_review_status_code") ||
    Object.prototype.hasOwnProperty.call(row, "review_kind_code") ||
    Object.prototype.hasOwnProperty.call(row, "artifact_kind_code")
  );
}

function walk(v) {
  if (Array.isArray(v)) {
    for (const item of v) walk(item);
    return;
  }
  if (!isObj(v)) return;

  if (isReviewRow(v)) {
    reviewRows += 1;
    const s = statusOf(v) || "-";
    statuses[s] = (statuses[s] || 0) + 1;
  }

  for (const key of Object.keys(v)) {
    walk(v[key]);
  }
}

if (json) walk(json);

const statusText = Object.keys(statuses).sort().map(k => k + ":" + statuses[k]).join(" | ");

fs.writeFileSync(out, [
  "CONTEXT_PARSE_OK=" + !!json,
  "CONTEXT_REVIEW_ROW_COUNT=" + reviewRows,
  "CONTEXT_REVIEW_STATUS_COUNTS=" + statusText,
  "CONTEXT_PENDING_COUNT=" + (statuses.pending || 0),
  "CONTEXT_APPROVED_COUNT=" + (statuses.approved || 0),
  "CONTEXT_RETURNED_COUNT=" + (statuses.returned || 0)
].join("\n") + "\n", "utf8");
