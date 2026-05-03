import fs from "fs";

const out = process.env.CONTEXT_CHECK_JSON;
const port = process.env.AICM_PORT || "8794";
const owner = process.env.OWNER_ID;
const company = process.env.COMPANY_ID;
const stamp = process.env.RUN_TS || Date.now();

const base = "http://127.0.0.1:" + port + "/api/aicm/v2/context";

const candidates = [
  base + "?owner_civilization_id=" + encodeURIComponent(owner) + "&aicm_user_company_id=" + encodeURIComponent(company) + "&v=" + stamp,
  base + "?owner_civilization_id=" + encodeURIComponent(owner) + "&selectedCompanyId=" + encodeURIComponent(company) + "&v=" + stamp,
  base + "?owner_civilization_id=" + encodeURIComponent(owner) + "&company_id=" + encodeURIComponent(company) + "&v=" + stamp,
  base + "?ownerCivilizationId=" + encodeURIComponent(owner) + "&aicmUserCompanyId=" + encodeURIComponent(company) + "&v=" + stamp,
  base + "?owner_id=" + encodeURIComponent(owner) + "&aicm_user_company_id=" + encodeURIComponent(company) + "&v=" + stamp,
  base + "?owner_civilization_id=" + encodeURIComponent(owner) + "&v=" + stamp
];

async function fetchJson(url) {
  const row = { url, ok: false, status: 0, body_preview: "" };
  try {
    const res = await fetch(url, { method: "GET", headers: { accept: "application/json" } });
    const text = await res.text();
    row.ok = res.ok;
    row.status = res.status;
    row.statusText = res.statusText;
    row.body_preview = text.slice(0, 800);
    try {
      row.json = text ? JSON.parse(text) : {};
    } catch (_) {
      row.json = { raw_text: text };
    }
  } catch (error) {
    row.error_message = String(error && error.message ? error.message : error);
  }
  return row;
}

const attempts = [];
let selected = null;

for (const url of candidates) {
  const row = await fetchJson(url);
  attempts.push({
    url: row.url,
    ok: row.ok,
    status: row.status,
    statusText: row.statusText,
    error_message: row.error_message || "",
    body_preview: row.body_preview
  });

  if (row.ok && row.json && row.json.result !== "error") {
    selected = row;
    break;
  }
}

if (!selected) {
  const result = {
    result: "error",
    final_judgement: "NO_CONTEXT_URL_WORKED",
    attempts
  };
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}

const payload = selected.json;
const workerRows = Array.isArray(payload.pmlw_worker_work_units) ? payload.pmlw_worker_work_units : [];

const reviewWaitingRows = workerRows.filter((row) =>
  String(row.work_status_code || "") === "review_waiting" &&
  String(row.review_status_code || "") === "waiting"
);

const outputCollectedRows = workerRows.filter((row) =>
  row.metadata_jsonb &&
  row.metadata_jsonb.output_collection_persist_version === "r8z_t"
);

const summaryFilledRows = workerRows.filter((row) =>
  String(row.result_summary_text || "").trim().length > 0
);

const result = {
  result: "ok",
  selected_url: selected.url,
  attempts,
  counts: {
    pmlw_worker_work_units: workerRows.length,
    review_waiting_rows: reviewWaitingRows.length,
    output_collected_rows: outputCollectedRows.length,
    summary_filled_rows: summaryFilledRows.length
  },
  rows: outputCollectedRows.map((row) => ({
    aicm_worker_work_unit_id: row.aicm_worker_work_unit_id,
    work_unit_name: row.work_unit_name,
    assigned_worker_label: row.assigned_worker_label,
    worker_model_code: row.worker_model_code,
    work_status_code: row.work_status_code,
    review_status_code: row.review_status_code,
    result_summary_preview: String(row.result_summary_text || "").slice(0, 240),
    output_collection: row.metadata_jsonb ? row.metadata_jsonb.output_collection : "",
    output_collection_version: row.metadata_jsonb ? row.metadata_jsonb.output_collection_version : "",
    output_collection_persist_version: row.metadata_jsonb ? row.metadata_jsonb.output_collection_persist_version : ""
  }))
};

result.final_judgement =
  result.counts.review_waiting_rows >= 2 &&
  result.counts.output_collected_rows >= 2 &&
  result.counts.summary_filled_rows >= 2
    ? "CONTEXT_READY_FOR_SCREEN_CONFIRM"
    : "CONTEXT_NEEDS_REVIEW";

fs.writeFileSync(out, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
