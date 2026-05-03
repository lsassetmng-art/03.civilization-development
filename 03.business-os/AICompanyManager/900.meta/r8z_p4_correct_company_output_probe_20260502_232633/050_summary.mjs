import fs from "fs";

const data = JSON.parse(fs.readFileSync(process.env.PROBE_JSON, "utf8"));

const summary = {
  aiworker_reachable: data.aiworker_reachable ? "YES" : "NO",
  request_row_count: data.request_row_count || 0,
  ok_get_count: data.ok_get_count || 0,
  output_like_probe_count: data.output_like_probe_count || 0,
  output_ready_count: data.output_ready_count || 0,
  final_judgement: data.final_judgement || "UNKNOWN",
  endpoints_by_request: data.probes.map((p) => ({
    request_id: p.request_id,
    work_unit_name: p.work_unit_name,
    endpoints: p.endpoints.map((e) => ({
      pathname: e.pathname,
      ok: e.ok,
      status: e.status,
      output_like: e.output_like,
      error_message: e.error_message || ""
    }))
  }))
};

console.log(JSON.stringify(summary, null, 2));
console.log("AIWORKER_REACHABLE=" + summary.aiworker_reachable);
console.log("REQUEST_ROW_COUNT=" + summary.request_row_count);
console.log("OK_GET_COUNT=" + summary.ok_get_count);
console.log("OUTPUT_LIKE_PROBE_COUNT=" + summary.output_like_probe_count);
console.log("OUTPUT_READY_COUNT=" + summary.output_ready_count);
console.log("FINAL_JUDGEMENT=" + summary.final_judgement);
