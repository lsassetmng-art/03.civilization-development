import fs from "fs";

const dbJsonPath = process.env.DB_JSON;
const outPath = process.env.FETCH_RESULT;
const aicmBase = "http://127.0.0.1:" + String(process.env.AICM_PORT || "8794");
const aiworkerBase = String(process.env.PERSONA_AIWORKEROS_BASE_URL || process.env.AIWORKER_BASE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
const token = String(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "").trim();

function safeParse(text) {
  try { return text ? JSON.parse(text) : {}; } catch (_) { return { raw_text: text }; }
}

async function getJson(url, headers = {}) {
  const item = { url, method: "GET" };
  try {
    const response = await fetch(url, { method: "GET", headers });
    const text = await response.text();
    item.ok = response.ok;
    item.status = response.status;
    item.statusText = response.statusText;
    item.body_preview = text.slice(0, 1200);
    item.json = safeParse(text);
  } catch (error) {
    item.ok = false;
    item.status = 0;
    item.error_message = String(error && error.message ? error.message : error);
  }
  return item;
}

function deepText(value) {
  try { return JSON.stringify(value); } catch (_) { return String(value); }
}

function hasOutputLike(payload) {
  const text = deepText(payload).toLowerCase();
  return (
    text.includes("delivery_status_code") ||
    text.includes("output_status_code") ||
    text.includes("output_result_code") ||
    text.includes("result_summary") ||
    text.includes("output_title") ||
    text.includes("handoff_link") ||
    text.includes("delivery_result_code")
  );
}

const raw = fs.readFileSync(dbJsonPath, "utf8").trim();
const db = safeParse(raw);
const workerUnits = Array.isArray(db.worker_units) ? db.worker_units : [];

const result = {
  result: "ok",
  db_worker_unit_count: workerUnits.length,
  db_request_id_count: workerUnits.filter(x => x.request_id).length,
  aiworker_base_url: aiworkerBase,
  aicm_base_url: aicmBase,
  api_post: "NO",
  db_write: "NO",
  probes: []
};

const aiHeaders = { "accept": "application/json" };
if (token) aiHeaders.authorization = "Bearer " + token;

result.aiworker_health = await getJson(aiworkerBase + "/health", aiHeaders);
result.aicm_context_ping = await getJson(aicmBase + "/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(process.env.OWNER_ID || ""));

for (const unit of workerUnits) {
  const requestId = String(unit.request_id || "").trim();
  const sourceRequestRef = String(unit.source_request_ref || "").trim();
  const unitOut = {
    aicm_worker_work_unit_id: unit.aicm_worker_work_unit_id,
    work_unit_name: unit.work_unit_name,
    work_status_code: unit.work_status_code,
    review_status_code: unit.review_status_code,
    request_id: requestId,
    source_request_ref: sourceRequestRef,
    endpoints: []
  };

  const params = new URLSearchParams();
  if (requestId) params.set("request_id", requestId);
  if (sourceRequestRef) params.set("source_request_ref", sourceRequestRef);
  params.set("source_app_ref", "AICompanyManager");
  params.set("app_surface_code", "ai_company_manager");

  unitOut.endpoints.push(await getJson(aicmBase + "/api/aicm/v2/worker-runtime/app-read-payload?" + params.toString()));
  unitOut.endpoints.push(await getJson(aicmBase + "/api/aicm/v2/worker-runtime/pipeline-board?app_surface_code=ai_company_manager&source_app_ref=AICompanyManager"));
  unitOut.endpoints.push(await getJson(aiworkerBase + "/aiworker/v1/runtime-execution/app-read-payload?" + params.toString(), aiHeaders));
  unitOut.endpoints.push(await getJson(aiworkerBase + "/aiworker/v1/runtime-execution/pipeline-board?app_surface_code=ai_company_manager&source_app_ref=AICompanyManager", aiHeaders));
  unitOut.endpoints.push(await getJson(aiworkerBase + "/aiworker/v1/runtime-execution/delivery?" + params.toString(), aiHeaders));

  unitOut.ok_get_count = unitOut.endpoints.filter(x => x.ok).length;
  unitOut.output_like_count = unitOut.endpoints.filter(x => hasOutputLike(x.json)).length;
  unitOut.ready_hint = unitOut.output_like_count > 0 ? "OUTPUT_OR_DELIVERY_FIELDS_VISIBLE" : "NO_OUTPUT_FIELDS_VISIBLE_YET";
  result.probes.push(unitOut);
}

result.aiworker_reachable = !!(result.aiworker_health && result.aiworker_health.ok);
result.aicm_reachable = !!(result.aicm_context_ping && result.aicm_context_ping.ok);
result.output_like_probe_count = result.probes.reduce((sum, p) => sum + Number(p.output_like_count || 0), 0);
result.ready_worker_unit_count = result.probes.filter(p => p.output_like_count > 0).length;

if (!result.aiworker_reachable) {
  result.final_judgement = "AIWORKEROS_NOT_REACHABLE";
} else if (!result.aicm_reachable) {
  result.final_judgement = "AICM_NOT_REACHABLE";
} else if (result.db_request_id_count === 0) {
  result.final_judgement = "NO_RUNTIME_REQUEST_ID";
} else if (result.ready_worker_unit_count > 0) {
  result.final_judgement = "OUTPUT_COLLECTION_ENDPOINT_VISIBLE";
} else {
  result.final_judgement = "REQUEST_ACCEPTED_BUT_OUTPUT_NOT_READY_OR_ENDPOINT_NOT_MAPPED";
}

fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify({
  result: result.result,
  aiworker_reachable: result.aiworker_reachable,
  aicm_reachable: result.aicm_reachable,
  db_worker_unit_count: result.db_worker_unit_count,
  db_request_id_count: result.db_request_id_count,
  ready_worker_unit_count: result.ready_worker_unit_count,
  output_like_probe_count: result.output_like_probe_count,
  final_judgement: result.final_judgement,
  probe_summary: result.probes.map(p => ({
    aicm_worker_work_unit_id: p.aicm_worker_work_unit_id,
    request_id: p.request_id,
    ok_get_count: p.ok_get_count,
    output_like_count: p.output_like_count,
    ready_hint: p.ready_hint
  }))
}, null, 2));
