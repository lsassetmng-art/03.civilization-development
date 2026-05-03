import fs from "fs";

const out = process.env.CONTEXT_JSON;
const url = process.env.CONTEXT_URL;

const res = await fetch(url, { method: "GET", headers: { accept: "application/json" } });
const text = await res.text();

let payload = {};
try {
  payload = text ? JSON.parse(text) : {};
} catch (_) {
  payload = { raw_text: text };
}

const rows = Array.isArray(payload.review_wait_items) ? payload.review_wait_items : [];
const result = {
  result: res.ok ? "ok" : "error",
  http_status: res.status,
  review_wait_items_count: rows.length,
  sample_rows: rows.slice(0, 5).map((row) => ({
    aicm_human_review_item_id: row.aicm_human_review_item_id,
    review_title: row.review_title,
    human_review_status_code: row.human_review_status_code,
    review_kind_code: row.review_kind_code,
    artifact_kind_code: row.artifact_kind_code,
    priority_code: row.priority_code,
    delivery_summary_preview: String(row.delivery_summary_text || "").slice(0, 220)
  }))
};

result.final_judgement =
  result.review_wait_items_count >= 2
    ? "REVIEW_BRIDGE_CONTEXT_CONFIRMED"
    : "REVIEW_BRIDGE_CONTEXT_NEEDS_REVIEW";

fs.writeFileSync(out, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

if (!res.ok || result.review_wait_items_count < 2) process.exit(1);
