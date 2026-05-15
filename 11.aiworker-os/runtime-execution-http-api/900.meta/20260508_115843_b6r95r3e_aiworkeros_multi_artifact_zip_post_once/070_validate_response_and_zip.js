const fs = require("fs");
const path = require("path");

const responsePath = process.argv[2];
const zipDir = process.argv[3];
const outPath = process.argv[4];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function fileNameFromZipLink(link) {
  const text = String(link || "");
  const parts = text.split("/");
  return parts[parts.length - 1] || "";
}

function bufferIncludesUtf8(buffer, text) {
  return buffer.includes(Buffer.from(text, "utf8"));
}

const body = readJson(responsePath);
const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail: String(detail || "") });
}

check("result_completed_internal_draft", body.result === "completed_internal_draft", body.result);
check("status_worker_output_done", body.status === "WORKER_OUTPUT_DONE", body.status);
check("request_id_present", typeof body.request_id === "string" && body.request_id.length >= 20, body.request_id);
check("output_id_present", typeof body.output_id === "string" && body.output_id.length >= 20, body.output_id);
check("deliverable_body_markdown_present", typeof body?.deliverable?.body_markdown === "string" && body.deliverable.body_markdown.length > 100, String(body?.deliverable?.body_markdown?.length || 0));
check("summary_text_present", typeof body?.deliverable?.summary_text === "string" && body.deliverable.summary_text.length > 20, String(body?.deliverable?.summary_text?.length || 0));
check("generated_artifacts_present", Array.isArray(body.generated_artifacts) && body.generated_artifacts.length >= 1, String(body.generated_artifacts?.length || 0));
check("deliverable_generated_artifacts_present", Array.isArray(body?.deliverable?.generated_artifacts) && body.deliverable.generated_artifacts.length >= 1, String(body?.deliverable?.generated_artifacts?.length || 0));
check("requester_generated_artifacts_present", Array.isArray(body?.requester_delivery_payload?.generated_artifacts) && body.requester_delivery_payload.generated_artifacts.length >= 1, String(body?.requester_delivery_payload?.generated_artifacts?.length || 0));

const requesterSummary = body?.requester_delivery_payload?.summary_text;
const requesterLink = body?.requester_delivery_payload?.deliverable_link;
const topLink = body.deliverable_link;
const packageInfo = body.deliverable_package || body?.requester_delivery_payload?.deliverable_package;

check("requester_summary_present", typeof requesterSummary === "string" && requesterSummary.length > 20, String(requesterSummary?.length || 0));
check("requester_deliverable_link_zip", typeof requesterLink === "string" && requesterLink.includes("runtime-deliverable-zip") && requesterLink.endsWith(".zip"), requesterLink);
check("top_deliverable_link_zip", typeof topLink === "string" && topLink.includes("runtime-deliverable-zip") && topLink.endsWith(".zip"), topLink);
check("deliverable_package_present", packageInfo && packageInfo.package_kind === "deliverable_zip" && packageInfo.package_format === "zip", JSON.stringify(packageInfo || {}));

const fileName = fileNameFromZipLink(requesterLink || topLink || packageInfo?.zip_link || packageInfo?.file_name);
const zipPath = path.join(zipDir, fileName);

check("zip_file_name_present", fileName.endsWith(".zip"), fileName);
check("zip_file_exists", fs.existsSync(zipPath), zipPath);

let zipSize = 0;
let zipEntrySignals = {};
if (fs.existsSync(zipPath)) {
  const stat = fs.statSync(zipPath);
  zipSize = stat.size;
  const buffer = fs.readFileSync(zipPath);
  zipEntrySignals = {
    has_00_summary_md: bufferIncludesUtf8(buffer, "00_summary.md"),
    has_01_main_deliverable_md: bufferIncludesUtf8(buffer, "01_main_deliverable.md"),
    has_manifest_json: bufferIncludesUtf8(buffer, "manifest.json"),
    has_bundle_purpose: bufferIncludesUtf8(buffer, "bundle_generated_artifacts_for_single_download")
  };
  check("zip_size_positive", stat.size > 100, String(stat.size));
  check("zip_has_00_summary_md", zipEntrySignals.has_00_summary_md, "");
  check("zip_has_01_main_deliverable_md", zipEntrySignals.has_01_main_deliverable_md, "");
  check("zip_has_manifest_json", zipEntrySignals.has_manifest_json, "");
  check("zip_manifest_has_bundle_purpose", zipEntrySignals.has_bundle_purpose, "");
}

check("deliverable_ref_present", body?.deliverable_ref?.source === "aiworkeros" && body?.deliverable_ref?.table === "runtime_worker_output" && body?.deliverable_ref?.id === body.output_id, JSON.stringify(body.deliverable_ref || {}));
check("robot_context_present", body.robot_context && typeof body.robot_context === "object", JSON.stringify(body.robot_context || {}));
check("generation_basis_present", body.generation_basis && typeof body.generation_basis === "object", JSON.stringify(body.generation_basis || {}));
check("safety_flags_false", body?.safety?.external_execution_performed_flag === false && body?.safety?.pg_apply_performed_flag === false && body?.safety?.destructive_action_performed_flag === false, JSON.stringify(body.safety || {}));

const ok = checks.every((c) => c.ok);
const result = {
  ok,
  request_id: body.request_id || null,
  output_id: body.output_id || null,
  deliverable_link: topLink || null,
  requester_deliverable_link: requesterLink || null,
  zip_file_name: fileName || null,
  zip_path: zipPath,
  zip_size: zipSize,
  zip_entry_signals: zipEntrySignals,
  generated_artifacts_count: Array.isArray(body.generated_artifacts) ? body.generated_artifacts.length : 0,
  summary_text_head: String(body?.deliverable?.summary_text || "").slice(0, 240),
  checks
};

fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exit(ok ? 0 : 1);
