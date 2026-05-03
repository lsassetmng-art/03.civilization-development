import fs from "fs";

const url = process.env.CONTEXT_URL;
const out = process.env.CONTEXT_JSON;

const res = await fetch(url, { method: "GET", headers: { accept: "application/json" } });
const text = await res.text();

let payload = {};
try {
  payload = text ? JSON.parse(text) : {};
} catch (_) {
  payload = { raw_text: text };
}

const reviewWait = Array.isArray(payload.review_wait_items) ? payload.review_wait_items : [];
const keys = payload && typeof payload === "object" ? Object.keys(payload).sort() : [];

const possibleReviewKeys = keys.filter((k) => /review/i.test(k));
const reviewKeyCounts = {};
for (const k of possibleReviewKeys) {
  const v = payload[k];
  reviewKeyCounts[k] = Array.isArray(v) ? v.length : (v && typeof v === "object" ? Object.keys(v).length : null);
}

const result = {
  result: res.ok ? "ok" : "error",
  http_status: res.status,
  url,
  payload_result: payload.result || null,
  error_message: payload.error_message || payload.message || null,
  keys,
  possible_review_keys: possibleReviewKeys,
  review_key_counts: reviewKeyCounts,
  review_wait_items_count: reviewWait.length,
  review_wait_items_sample: reviewWait.slice(0, 5).map((row) => ({
    aicm_human_review_item_id: row.aicm_human_review_item_id,
    related_worker_work_unit_id: row.related_worker_work_unit_id,
    review_title: row.review_title,
    human_review_status_code: row.human_review_status_code,
    review_kind_code: row.review_kind_code,
    artifact_kind_code: row.artifact_kind_code,
    priority_code: row.priority_code,
    delivery_summary_preview: String(row.delivery_summary_text || "").slice(0, 220),
    created_at: row.created_at,
    updated_at: row.updated_at
  }))
};

fs.writeFileSync(out, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
