const fs = require("fs");

const responsePath = process.argv[2];
const outJsonPath = process.argv[3];

const raw = fs.readFileSync(responsePath, "utf8");
let body;
try {
  body = JSON.parse(raw);
} catch (e) {
  fs.writeFileSync(outJsonPath, JSON.stringify({
    ok: false,
    reason: "RESPONSE_NOT_JSON",
    error: String(e),
    rawHead: raw.slice(0, 1000)
  }, null, 2));
  process.exit(1);
}

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail: detail || "" });
}

check("result_completed_internal_draft", body.result === "completed_internal_draft", body.result);
check("status_worker_output_done", body.status === "WORKER_OUTPUT_DONE", body.status);
check("request_id_present", typeof body.request_id === "string" && body.request_id.length >= 20, body.request_id);
check("output_id_present", typeof body.output_id === "string" && body.output_id.length >= 20, body.output_id);
check("deliverable_present", body.deliverable && typeof body.deliverable === "object", "");
check("body_markdown_present", typeof body?.deliverable?.body_markdown === "string" && body.deliverable.body_markdown.length > 200, String(body?.deliverable?.body_markdown?.length || 0));
check("summary_text_present", typeof body?.deliverable?.summary_text === "string" && body.deliverable.summary_text.length > 40, String(body?.deliverable?.summary_text?.length || 0));
check("quality_notes_present", typeof body?.deliverable?.quality_notes === "string" && body.deliverable.quality_notes.length > 20, String(body?.deliverable?.quality_notes?.length || 0));
check("unresolved_issues_present", typeof body?.deliverable?.unresolved_issues === "string" && body.deliverable.unresolved_issues.length > 20, String(body?.deliverable?.unresolved_issues?.length || 0));
check("next_steps_present", typeof body?.deliverable?.next_steps === "string" && body.deliverable.next_steps.length > 20, String(body?.deliverable?.next_steps?.length || 0));
check("deliverable_ref_present", body.deliverable_ref && body.deliverable_ref.source === "aiworkeros" && body.deliverable_ref.table === "runtime_worker_output", JSON.stringify(body.deliverable_ref || {}));
check("deliverable_ref_matches_output", body.deliverable_ref && body.deliverable_ref.id === body.output_id, JSON.stringify({ output_id: body.output_id, ref: body.deliverable_ref }));
check("deliverable_link_present", typeof body.deliverable_link === "string" && body.deliverable_link.includes(body.output_id), body.deliverable_link);
check("requester_delivery_payload_present", body.requester_delivery_payload && typeof body.requester_delivery_payload === "object", "");
check("requester_delivery_summary_present", typeof body?.requester_delivery_payload?.summary_text === "string" && body.requester_delivery_payload.summary_text.length > 40, String(body?.requester_delivery_payload?.summary_text?.length || 0));
check("requester_delivery_link_present", typeof body?.requester_delivery_payload?.deliverable_link === "string" && body.requester_delivery_payload.deliverable_link.includes(body.output_id), body?.requester_delivery_payload?.deliverable_link || "");
check("robot_context_present", body.robot_context && typeof body.robot_context === "object" && typeof body.robot_context.model_code === "string", JSON.stringify(body.robot_context || {}));
check("generation_basis_present", body.generation_basis && typeof body.generation_basis === "object" && body.generation_basis.contract_version === "B6R95R3B-R3", JSON.stringify(body.generation_basis || {}));
check("safety_flags_false", body.safety && body.safety.external_execution_performed_flag === false && body.safety.pg_apply_performed_flag === false && body.safety.destructive_action_performed_flag === false, JSON.stringify(body.safety || {}));

const ok = checks.every((c) => c.ok);

const result = {
  ok,
  request_id: body.request_id || null,
  output_id: body.output_id || null,
  deliverable_link: body.deliverable_link || null,
  summary_text_head: String(body?.deliverable?.summary_text || "").slice(0, 220),
  body_markdown_len: String(body?.deliverable?.body_markdown || "").length,
  checks
};

fs.writeFileSync(outJsonPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

process.exit(ok ? 0 : 1);
