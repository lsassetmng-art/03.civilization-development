import fs from "fs";

const out = process.env.FETCH_JSON;
const baseUrl = String(process.env.PERSONA_AIWORKEROS_BASE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
const token = String(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "").trim();
const requestIds = [process.env.REQUEST_ID_1, process.env.REQUEST_ID_2].filter(Boolean);

async function get(pathname, params) {
  const url = baseUrl + pathname + "?" + params.toString();
  const headers = { accept: "application/json" };
  if (token) headers.authorization = "Bearer " + token;

  const row = { pathname, url, ok: false, status: 0 };
  try {
    const res = await fetch(url, { method: "GET", headers });
    const text = await res.text();
    row.ok = res.ok;
    row.status = res.status;
    row.statusText = res.statusText;
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

function deepSignals(value) {
  const result = {
    non_empty_output_values: [],
    status_values: [],
    null_output_keys: 0
  };

  function walk(v, path) {
    if (v === null || typeof v === "undefined") return;

    if (typeof v !== "object") {
      const key = path[path.length - 1] || "";
      const p = path.join(".");
      const s = String(v).trim();

      if (/output|delivery|result|summary|handoff/i.test(key)) {
        if (s) result.non_empty_output_values.push({ path: p, value: s.slice(0, 500) });
      }

      if (/status|result_code/i.test(key) && s) {
        result.status_values.push({ path: p, value: s });
      }

      return;
    }

    if (Array.isArray(v)) {
      v.forEach((x, i) => walk(x, path.concat(String(i))));
      return;
    }

    for (const [k, next] of Object.entries(v)) {
      if (next === null && /output|delivery|result|summary|handoff/i.test(k)) {
        result.null_output_keys += 1;
      }
      walk(next, path.concat(k));
    }
  }

  walk(value, []);
  return result;
}

const result = {
  result: "ok",
  baseUrl,
  requestIds,
  probes: []
};

for (const requestId of requestIds) {
  const params = new URLSearchParams();
  params.set("request_id", requestId);
  params.set("source_app_ref", "AICompanyManager");
  params.set("app_surface_code", "ai_company_manager");

  const endpoints = [
    "/aiworker/v1/runtime-execution/app-read-payload",
    "/aiworker/v1/runtime-execution/pipeline-board",
    "/aiworker/v1/runtime-execution/delivery",
    "/aiworker/v1/runtime-execution/output",
    "/aiworker/v1/runtime-execution/result"
  ];

  const probe = { request_id: requestId, endpoints: [] };

  for (const endpoint of endpoints) {
    const fetched = await get(endpoint, params);
    fetched.signals = deepSignals(fetched.json || {});
    probe.endpoints.push(fetched);
  }

  probe.ok_count = probe.endpoints.filter(x => x.ok).length;
  probe.non_empty_output_value_count = probe.endpoints.reduce((sum, x) => sum + x.signals.non_empty_output_values.length, 0);
  probe.status_value_count = probe.endpoints.reduce((sum, x) => sum + x.signals.status_values.length, 0);
  probe.null_output_key_count = probe.endpoints.reduce((sum, x) => sum + x.signals.null_output_keys, 0);

  result.probes.push(probe);
}

result.total_non_empty_output_value_count = result.probes.reduce((sum, x) => sum + x.non_empty_output_value_count, 0);
result.total_null_output_key_count = result.probes.reduce((sum, x) => sum + x.null_output_key_count, 0);
result.final_hint = result.total_non_empty_output_value_count > 0
  ? "OUTPUT_BODY_EXISTS"
  : "ONLY_STATUS_OR_NULL_OUTPUT_FIELDS";

fs.writeFileSync(out, JSON.stringify(result, null, 2));

console.log(JSON.stringify({
  result: result.result,
  final_hint: result.final_hint,
  total_non_empty_output_value_count: result.total_non_empty_output_value_count,
  total_null_output_key_count: result.total_null_output_key_count,
  probes: result.probes.map(p => ({
    request_id: p.request_id,
    ok_count: p.ok_count,
    non_empty_output_value_count: p.non_empty_output_value_count,
    status_value_count: p.status_value_count,
    null_output_key_count: p.null_output_key_count,
    endpoint_summary: p.endpoints.map(e => ({
      pathname: e.pathname,
      ok: e.ok,
      status: e.status,
      non_empty_output_value_count: e.signals.non_empty_output_values.length,
      status_value_count: e.signals.status_values.length,
      null_output_key_count: e.signals.null_output_keys
    }))
  }))
}, null, 2));
