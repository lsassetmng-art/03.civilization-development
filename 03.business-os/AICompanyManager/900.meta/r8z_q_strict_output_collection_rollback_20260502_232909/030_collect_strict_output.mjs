import fs from "fs";

const requestJson = process.env.REQUEST_JSON;
const collectJson = process.env.COLLECT_JSON;
const collectCsv = process.env.COLLECT_CSV;
const baseUrl = String(process.env.PERSONA_AIWORKEROS_BASE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
const token = String(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "").trim();

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch (_) {
    return { raw_text: text };
  }
}

function csvEscape(value) {
  const text = value === null || typeof value === "undefined" ? "" : String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

function compactText(value, max = 4000) {
  const text = value === null || typeof value === "undefined" ? "" : String(value)
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max) + "..." : text;
}

async function getJson(pathname, params) {
  const url = baseUrl + pathname + "?" + params.toString();
  const headers = { accept: "application/json" };
  if (token) headers.authorization = "Bearer " + token;

  const item = { url, pathname, ok: false, status: 0 };
  try {
    const res = await fetch(url, { method: "GET", headers });
    const bodyText = await res.text();
    item.ok = res.ok;
    item.status = res.status;
    item.statusText = res.statusText;
    item.json = parseJson(bodyText);
    item.body_preview = bodyText.slice(0, 1800);
  } catch (error) {
    item.error_message = String(error && error.message ? error.message : error);
  }
  return item;
}

function walk(value, visitor, path = []) {
  if (value === null || typeof value === "undefined") return;
  if (typeof value !== "object") {
    visitor(path, value);
    return;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) walk(value[i], visitor, path.concat(String(i)));
    return;
  }
  for (const [key, next] of Object.entries(value)) {
    walk(next, visitor, path.concat(key));
  }
}

function collectSignals(payloads) {
  const textKeys = new Set([
    "result_summary_text",
    "result_summary",
    "delivery_summary_text",
    "delivery_summary",
    "output_summary_text",
    "output_summary",
    "output_text",
    "output_body_text",
    "output_content",
    "output_markdown",
    "result_text",
    "result_body_text",
    "answer_text",
    "body_text"
  ]);

  const titleKeys = new Set([
    "output_title_ja",
    "output_title",
    "delivery_title",
    "artifact_title",
    "result_title"
  ]);

  const linkKeys = new Set([
    "handoff_link",
    "delivery_link",
    "output_link",
    "artifact_link",
    "file_link",
    "url"
  ]);

  const statusKeys = new Set([
    "output_status_code",
    "output_result_code",
    "delivery_status_code",
    "delivery_result_code",
    "request_status_code"
  ]);

  const out = {
    text_candidates: [],
    title_candidates: [],
    link_candidates: [],
    status_candidates: []
  };

  for (const payload of payloads) {
    walk(payload, (path, value) => {
      const key = path[path.length - 1] || "";
      const text = compactText(value, 2000);
      if (!text) return;

      if (textKeys.has(key)) out.text_candidates.push({ path: path.join("."), value: text });
      if (titleKeys.has(key)) out.title_candidates.push({ path: path.join("."), value: text });
      if (linkKeys.has(key) && /^https?:\/\//.test(text)) out.link_candidates.push({ path: path.join("."), value: text });
      if (statusKeys.has(key)) out.status_candidates.push({ path: path.join("."), value: text });
    });
  }

  return out;
}

function statusLooksComplete(statuses) {
  const text = statuses.map((x) => x.value).join(" ").toLowerCase();
  return (
    text.includes("completed") ||
    text.includes("complete") ||
    text.includes("done") ||
    text.includes("delivered") ||
    text.includes("ready_for_review") ||
    text.includes("review_waiting") ||
    text.includes("success")
  );
}

function buildSummary(row, signals, endpoints) {
  const title = signals.title_candidates[0] ? signals.title_candidates[0].value : row.work_unit_name;
  const text = signals.text_candidates[0] ? signals.text_candidates[0].value : "";
  const status = signals.status_candidates.map((x) => x.value).filter(Boolean).join(" / ");
  const okEndpoints = endpoints.filter((x) => x.ok).map((x) => x.pathname).join(", ");

  if (text) {
    return compactText("AIWorkerOS成果物回収: " + title + " / " + text, 4000);
  }

  if (statusLooksComplete(signals.status_candidates)) {
    return compactText("AIWorkerOS成果物回収: " + title + " / status=" + status, 4000);
  }

  return compactText(
    "AIWorkerOS受付済み。成果物本文は未回収。request_id=" + row.request_id +
    " / status=" + (status || row.aiworker_status || "-") +
    " / checked=" + okEndpoints,
    4000
  );
}

const raw = fs.readFileSync(requestJson, "utf8").trim();
const data = parseJson(raw);
const rows = Array.isArray(data.rows) ? data.rows : [];

const result = {
  result: "ok",
  aiworker_base_url: baseUrl,
  request_row_count: rows.length,
  db_write: "NO",
  api_post: "NO",
  rows: []
};

for (const row of rows) {
  const params = new URLSearchParams();
  params.set("request_id", row.request_id || "");
  params.set("source_request_ref", row.source_request_ref || "");
  params.set("source_app_ref", "AICompanyManager");
  params.set("app_surface_code", "ai_company_manager");

  const endpoints = [];
  endpoints.push(await getJson("/aiworker/v1/runtime-execution/app-read-payload", params));
  endpoints.push(await getJson("/aiworker/v1/runtime-execution/pipeline-board", params));
  endpoints.push(await getJson("/aiworker/v1/runtime-execution/delivery", params));

  const okPayloads = endpoints.filter((x) => x.ok).map((x) => x.json);
  const signals = collectSignals(okPayloads);
  const hasText = signals.text_candidates.length > 0;
  const hasLink = signals.link_candidates.length > 0;
  const hasCompleteStatus = statusLooksComplete(signals.status_candidates);

  const collectable = hasText || hasLink || hasCompleteStatus;
  const resultSummaryText = buildSummary(row, signals, endpoints);
  const handoffLink = signals.link_candidates[0] ? signals.link_candidates[0].value : "";

  result.rows.push({
    aicm_worker_work_unit_id: row.aicm_worker_work_unit_id,
    work_unit_name: row.work_unit_name,
    request_id: row.request_id,
    source_request_ref: row.source_request_ref,
    current_work_status_code: row.work_status_code,
    current_review_status_code: row.review_status_code,
    collectable,
    collect_reason: collectable
      ? (hasText ? "NON_EMPTY_OUTPUT_TEXT" : hasLink ? "NON_EMPTY_HANDOFF_LINK" : "COMPLETE_STATUS")
      : "NO_NON_EMPTY_OUTPUT_BODY_YET",
    result_summary_text: resultSummaryText,
    handoff_link: handoffLink,
    signals,
    endpoint_summary: endpoints.map((x) => ({
      pathname: x.pathname,
      ok: x.ok,
      status: x.status,
      statusText: x.statusText || "",
      error_message: x.error_message || ""
    })),
    collection_payload: {
      collected_at: new Date().toISOString(),
      source: "AIWorkerOS runtime GET",
      request_id: row.request_id,
      source_request_ref: row.source_request_ref,
      endpoints: endpoints.map((x) => ({
        pathname: x.pathname,
        ok: x.ok,
        status: x.status,
        json: x.json
      }))
    }
  });
}

result.collectable_count = result.rows.filter((x) => x.collectable).length;
result.not_ready_count = result.rows.filter((x) => !x.collectable).length;
result.final_judgement = result.collectable_count > 0
  ? "COLLECTABLE_OUTPUT_FOUND_ROLLBACK_DB_UPDATE_READY"
  : "NO_COLLECTABLE_OUTPUT_YET";

fs.writeFileSync(collectJson, JSON.stringify(result, null, 2));

const csvLines = [
  [
    "aicm_worker_work_unit_id",
    "result_summary_text",
    "handoff_link",
    "collection_json"
  ].map(csvEscape).join(",")
];

for (const row of result.rows.filter((x) => x.collectable)) {
  csvLines.push([
    row.aicm_worker_work_unit_id,
    row.result_summary_text,
    row.handoff_link,
    JSON.stringify(row.collection_payload)
  ].map(csvEscape).join(","));
}

fs.writeFileSync(collectCsv, csvLines.join("\n") + "\n");

console.log(JSON.stringify({
  result: result.result,
  request_row_count: result.request_row_count,
  collectable_count: result.collectable_count,
  not_ready_count: result.not_ready_count,
  final_judgement: result.final_judgement,
  row_summary: result.rows.map((x) => ({
    aicm_worker_work_unit_id: x.aicm_worker_work_unit_id,
    work_unit_name: x.work_unit_name,
    request_id: x.request_id,
    collectable: x.collectable,
    collect_reason: x.collect_reason,
    endpoint_summary: x.endpoint_summary,
    text_candidate_count: x.signals.text_candidates.length,
    title_candidate_count: x.signals.title_candidates.length,
    link_candidate_count: x.signals.link_candidates.length,
    status_candidate_count: x.signals.status_candidates.length
  }))
}, null, 2));
