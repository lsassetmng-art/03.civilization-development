const fs = require("fs");
const text = fs.readFileSync(process.argv[2], "utf8");
const outputId = process.argv[3];

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail: detail || "" });
}

check("request_row_present", text.includes("B6R95R3C 共通成果物返却契約テスト"), "task title");
check("output_id_present_in_db_output", text.includes(outputId), outputId);
check("contract_name_present", text.includes("aiworkeros_common_requester_deliverable_contract"), "contract_name");
check("contract_version_present", text.includes("B6R95R3B-R3"), "contract_version");
check("body_section_present", text.includes("## 4. 成果物本文"), "body section");
check("summary_section_present", text.includes("成果物サマリ"), "summary");
check("safety_false_present", text.includes(" f ") || text.includes("| f") || text.includes(" f |"), "false flags expected");
check("outputs_count_present", /outputs_count/.test(text), "app read payload query output");
check("artifacts_payload_present", /artifact_payload_head/.test(text), "artifact payload query output");

const ok = checks.every((c) => c.ok);
const result = { ok, checks };
fs.writeFileSync(process.argv[1], JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exit(ok ? 0 : 1);
