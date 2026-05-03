import fs from "fs";

const bundlePath = process.env.BUNDLE_JSON;
const outJson = process.env.COLLECT_JSON;
const outCsv = process.env.COLLECT_CSV;

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return { result: "error", error_message: String(error && error.message ? error.message : error), raw_text: text };
  }
}

function csvEscape(value) {
  const text = value === null || typeof value === "undefined" ? "" : String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

function compact(value, max = 4000) {
  const text = value === null || typeof value === "undefined" ? "" : String(value)
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function walk(value, visitor, path = []) {
  if (value === null || typeof value === "undefined") return;
  if (typeof value !== "object") {
    visitor(path, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visitor, path.concat(String(index))));
    return;
  }
  Object.entries(value).forEach(([key, next]) => walk(next, visitor, path.concat(key)));
}

function isBadPrimitive(path, value) {
  const key = String(path[path.length - 1] || "").toLowerCase();
  const pathText = path.join(".").toLowerCase();
  const text = compact(value, 300).toLowerCase();

  if (!text) return true;

  if (
    key === "result" ||
    key === "ok" ||
    key === "status" ||
    key === "status_code" ||
    key === "request_status_code" ||
    key === "output_status_code" ||
    key === "delivery_status_code" ||
    key === "output_result_code" ||
    key === "delivery_result_code" ||
    key === "api_identifier" ||
    key === "request_id" ||
    key === "source_request_ref" ||
    key === "idempotency_key" ||
    key === "model_code" ||
    key === "app_surface_code" ||
    key === "task_domain_code" ||
    key.endsWith("_id") ||
    key.endsWith("_flag") ||
    key.endsWith("_at")
  ) return true;

  if (
    text === "ok" ||
    text === "error" ||
    text === "accepted" ||
    text === "requested_internal_only" ||
    text === "true" ||
    text === "false"
  ) return true;

  if (pathText.includes("business_worker.metadata_jsonb.runtime_result.request_body")) return true;
  if (pathText.includes("intake_payload_jsonb")) return true;

  return false;
}

function isOutputTextPath(path) {
  const key = String(path[path.length - 1] || "").toLowerCase();
  const pathText = path.join(".").toLowerCase();

  if (pathText.includes("handoff_payload_jsonb")) return true;
  if (pathText.includes("app_read_payload_jsonb")) return true;
  if (pathText.includes("delivery_payload_jsonb")) return true;
  if (pathText.includes("output_payload_jsonb")) return true;

  return (
    /output|delivery|handoff|artifact|deliverable|result_summary|summary|body|content|markdown|message|note|description|title/.test(key) ||
    /output|delivery|handoff|artifact|deliverable/.test(pathText)
  );
}

function findCandidates(source) {
  const rows = [];
  walk(source, (path, value) => {
    if (isBadPrimitive(path, value)) return;
    if (!isOutputTextPath(path)) return;

    const text = compact(value, 1200);
    if (!text) return;

    rows.push({
      path: path.join("."),
      value: text,
      score:
        path.join(".").toLowerCase().includes("handoff_payload_jsonb") ? 90 :
        path.join(".").toLowerCase().includes("app_read_payload_jsonb") ? 80 :
        path.join(".").toLowerCase().includes("delivery") ? 70 :
        /summary|body|content|markdown|message/.test(String(path[path.length - 1] || "").toLowerCase()) ? 60 :
        /description|title|note/.test(String(path[path.length - 1] || "").toLowerCase()) ? 40 :
        10
    });
  });

  rows.sort((a, b) => b.score - a.score || b.value.length - a.value.length || a.path.localeCompare(b.path));
  return rows;
}

function firstNonEmptyArray(obj, key) {
  return Array.isArray(obj[key]) ? obj[key] : [];
}

function buildCollection(row) {
  const worker = row.business_worker || {};
  const requestId = worker.request_id || "";
  const sourceRequestRef = worker.source_request_ref || "";

  const sources = {
    runtime_handoff_packet: firstNonEmptyArray(row, "aiworker_runtime_handoff_packet"),
    app_read_payload: firstNonEmptyArray(row, "aiworker_app_read_payload"),
    handoff_packet_board: firstNonEmptyArray(row, "aiworker_handoff_packet_board"),
    full_pipeline_board: firstNonEmptyArray(row, "aiworker_full_pipeline_board"),
    runtime_request: firstNonEmptyArray(row, "aiworker_runtime_request"),
    runtime_event_log: firstNonEmptyArray(row, "aiworker_runtime_event_log")
  };

  const sourceObject = {
    runtime_handoff_packet: sources.runtime_handoff_packet,
    app_read_payload: sources.app_read_payload,
    handoff_packet_board: sources.handoff_packet_board,
    full_pipeline_board: sources.full_pipeline_board
  };

  const candidates = findCandidates(sourceObject);
  const hasHandoffPacket = sources.runtime_handoff_packet.length > 0 || sources.handoff_packet_board.length > 0;
  const hasAppReadPayload = sources.app_read_payload.length > 0;
  const hasPipeline = sources.full_pipeline_board.length > 0;

  const best = candidates[0] || null;
  const collectable = !!best || hasHandoffPacket || hasAppReadPayload;

  const title = compact(worker.work_unit_name || "Worker作業単位", 200);
  const bestText = best ? best.value : "";
  const summaryText = bestText
    ? compact("AIWorkerOS成果物回収: " + title + " / " + bestText, 4000)
    : compact(
        "AIWorkerOS成果物パケット回収: " + title +
        " / request_id=" + requestId +
        " / source_request_ref=" + sourceRequestRef +
        " / handoff_packet=" + String(hasHandoffPacket) +
        " / app_read_payload=" + String(hasAppReadPayload) +
        " / pipeline=" + String(hasPipeline),
        4000
      );

  const handoffLinkCandidate = candidates.find((x) => /^https?:\/\//.test(x.value));
  const handoffLink = handoffLinkCandidate ? handoffLinkCandidate.value : "";

  return {
    aicm_worker_work_unit_id: worker.aicm_worker_work_unit_id,
    work_unit_name: worker.work_unit_name,
    request_id: requestId,
    source_request_ref: sourceRequestRef,
    current_work_status_code: worker.work_status_code,
    current_review_status_code: worker.review_status_code,
    collectable,
    collect_reason: best ? "DB_SOURCE_OUTPUT_TEXT_FOUND" : collectable ? "DB_SOURCE_HANDOFF_OR_APP_READ_PACKET_FOUND" : "NO_DB_SOURCE_PACKET",
    result_summary_text: summaryText,
    handoff_link: handoffLink,
    candidate_count: candidates.length,
    best_candidate: best,
    candidate_preview: candidates.slice(0, 12),
    source_counts: {
      runtime_handoff_packet: sources.runtime_handoff_packet.length,
      app_read_payload: sources.app_read_payload.length,
      handoff_packet_board: sources.handoff_packet_board.length,
      full_pipeline_board: sources.full_pipeline_board.length,
      runtime_request: sources.runtime_request.length,
      runtime_event_log: sources.runtime_event_log.length
    },
    collection_payload: {
      collection_version: "r8z_s",
      collected_at: new Date().toISOString(),
      source: "aiworker_db_source_bundle",
      request_id: requestId,
      source_request_ref: sourceRequestRef,
      source_counts: {
        runtime_handoff_packet: sources.runtime_handoff_packet.length,
        app_read_payload: sources.app_read_payload.length,
        handoff_packet_board: sources.handoff_packet_board.length,
        full_pipeline_board: sources.full_pipeline_board.length,
        runtime_request: sources.runtime_request.length,
        runtime_event_log: sources.runtime_event_log.length
      },
      best_candidate: best,
      candidate_preview: candidates.slice(0, 20),
      aiworker_runtime_handoff_packet: sources.runtime_handoff_packet,
      aiworker_app_read_payload: sources.app_read_payload,
      aiworker_handoff_packet_board: sources.handoff_packet_board,
      aiworker_full_pipeline_board: sources.full_pipeline_board
    }
  };
}

const bundle = parseJson(fs.readFileSync(bundlePath, "utf8").trim());
const rows = Array.isArray(bundle.rows) ? bundle.rows : [];
const collected = rows.map(buildCollection);

const result = {
  result: "ok",
  owner_civilization_id: bundle.owner_civilization_id,
  aicm_user_company_id: bundle.aicm_user_company_id,
  worker_row_count: rows.length,
  collectable_count: collected.filter((x) => x.collectable).length,
  not_ready_count: collected.filter((x) => !x.collectable).length,
  rows: collected
};

result.final_judgement = result.collectable_count > 0
  ? "DB_SOURCE_COLLECTABLE_OUTPUT_FOUND_ROLLBACK_READY"
  : "NO_DB_SOURCE_COLLECTABLE_OUTPUT";

fs.writeFileSync(outJson, JSON.stringify(result, null, 2));

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

fs.writeFileSync(outCsv, csvLines.join("\n") + "\n");

console.log(JSON.stringify({
  result: result.result,
  worker_row_count: result.worker_row_count,
  collectable_count: result.collectable_count,
  not_ready_count: result.not_ready_count,
  final_judgement: result.final_judgement,
  row_summary: result.rows.map((x) => ({
    aicm_worker_work_unit_id: x.aicm_worker_work_unit_id,
    work_unit_name: x.work_unit_name,
    request_id: x.request_id,
    collectable: x.collectable,
    collect_reason: x.collect_reason,
    candidate_count: x.candidate_count,
    source_counts: x.source_counts,
    best_candidate: x.best_candidate,
    result_summary_preview: String(x.result_summary_text || "").slice(0, 260)
  }))
}, null, 2));
