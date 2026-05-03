import fs from "fs";

const requestPath = process.env.REQUEST_JSON;
const outPath = process.env.PROBE_JSON;
const baseUrl = String(process.env.PERSONA_AIWORKEROS_BASE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
const token = String(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "").trim();

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch (_) {
    return { raw_text: text };
  }
}

function hasOutputLike(value) {
  const text = JSON.stringify(value || {}).toLowerCase();
  return [
    "output_title",
    "output_status_code",
    "output_result_code",
    "delivery_status_code",
    "delivery_result_code",
    "result_summary",
    "result_summary_text",
    "handoff_link",
    "delivery",
    "output"
  ].some((key) => text.includes(key));
}

async function getJson(pathname, params) {
  const url = baseUrl + pathname + "?" + params.toString();
  const headers = { accept: "application/json" };
  if (token) headers.authorization = "Bearer " + token;

  const item = { url, pathname, ok: false, status: 0, output_like: false };
  try {
    const res = await fetch(url, { method: "GET", headers });
    const bodyText = await res.text();
    const json = parseJson(bodyText);
    item.ok = res.ok;
    item.status = res.status;
    item.statusText = res.statusText;
    item.json = json;
    item.body_preview = bodyText.slice(0, 1500);
    item.output_like = hasOutputLike(json);
  } catch (error) {
    item.error_message = String(error && error.message ? error.message : error);
  }
  return item;
}

const requestData = parseJson(fs.readFileSync(requestPath, "utf8").trim());
const rows = Array.isArray(requestData.rows) ? requestData.rows : [];

const result = {
  result: "ok",
  aiworker_base_url: baseUrl,
  request_row_count: rows.length,
  probes: [],
  db_write: "NO",
  api_post: "NO"
};

result.health = await getJson("/health", new URLSearchParams());

for (const row of rows) {
  const params = new URLSearchParams();
  params.set("request_id", row.request_id || "");
  params.set("source_request_ref", row.source_request_ref || "");
  params.set("source_app_ref", "AICompanyManager");
  params.set("app_surface_code", "ai_company_manager");

  const probe = {
    aicm_worker_work_unit_id: row.aicm_worker_work_unit_id,
    work_unit_name: row.work_unit_name,
    work_status_code: row.work_status_code,
    review_status_code: row.review_status_code,
    request_id: row.request_id,
    source_request_ref: row.source_request_ref,
    aiworker_status_from_db: row.aiworker_status,
    endpoints: []
  };

  probe.endpoints.push(await getJson("/aiworker/v1/runtime-execution/app-read-payload", params));
  probe.endpoints.push(await getJson("/aiworker/v1/runtime-execution/pipeline-board", params));
  probe.endpoints.push(await getJson("/aiworker/v1/runtime-execution/delivery", params));
  probe.endpoints.push(await getJson("/aiworker/v1/runtime-execution/output", params));
  probe.endpoints.push(await getJson("/aiworker/v1/runtime-execution/result", params));

  probe.ok_count = probe.endpoints.filter((x) => x.ok).length;
  probe.output_like_count = probe.endpoints.filter((x) => x.output_like).length;
  probe.not_found_count = probe.endpoints.filter((x) => x.status === 404).length;
  probe.error_count = probe.endpoints.filter((x) => !x.ok && x.status !== 404).length;

  result.probes.push(probe);
}

result.aiworker_reachable = !!(result.health && result.health.ok);
result.output_like_probe_count = result.probes.reduce((sum, x) => sum + x.output_like_count, 0);
result.output_ready_count = result.probes.filter((x) => x.output_like_count > 0).length;
result.ok_get_count = result.probes.reduce((sum, x) => sum + x.ok_count, 0);

if (!result.aiworker_reachable) {
  result.final_judgement = "AIWORKEROS_NOT_REACHABLE";
} else if (rows.length === 0) {
  result.final_judgement = "NO_REQUEST_ROWS";
} else if (result.output_ready_count > 0) {
  result.final_judgement = "OUTPUT_OR_DELIVERY_VISIBLE_PROCEED_DB_COLLECTION";
} else {
  result.final_judgement = "REQUEST_ACCEPTED_BUT_OUTPUT_NOT_READY_OR_ENDPOINT_NOT_MAPPED";
}

fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify({
  result: result.result,
  aiworker_reachable: result.aiworker_reachable,
  request_row_count: result.request_row_count,
  ok_get_count: result.ok_get_count,
  output_like_probe_count: result.output_like_probe_count,
  output_ready_count: result.output_ready_count,
  final_judgement: result.final_judgement,
  probe_summary: result.probes.map((p) => ({
    work_unit_name: p.work_unit_name,
    request_id: p.request_id,
    ok_count: p.ok_count,
    output_like_count: p.output_like_count,
    not_found_count: p.not_found_count,
    error_count: p.error_count
  }))
}, null, 2));
