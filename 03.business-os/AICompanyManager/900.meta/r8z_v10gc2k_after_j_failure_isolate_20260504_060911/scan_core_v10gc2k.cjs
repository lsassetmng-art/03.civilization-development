const fs = require("fs");

const corePath = process.argv[2];
const coreScanPath = process.argv[3];
const confirmExtractPath = process.argv[4];

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\n/);

function count(s) {
  return (src.match(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

function hits(pattern, before = 30, after = 45) {
  const out = [];
  lines.forEach((line, idx) => {
    if (line.includes(pattern)) {
      const s = Math.max(0, idx - before);
      const e = Math.min(lines.length, idx + after);
      out.push("---- hit line " + (idx + 1) + " pattern=" + pattern + " ----\n" + lines.slice(s, e).join("\n"));
    }
  });
  return out.join("\n\n");
}

function extractMarked(marker) {
  const start = src.indexOf("// " + marker + "_START");
  const end = src.indexOf("// " + marker + "_END");
  if (start < 0 || end < 0) return "";
  return src.slice(start, end + marker.length + 10);
}

const scan = [];
scan.push("V10GC2B_MARKER_COUNT=" + count("AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE"));
scan.push("V10GC2F_MARKER_COUNT=" + count("AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME"));
scan.push("V10GC2H_MARKER_COUNT=" + count("AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST"));
scan.push("V10GC2I_MARKER_COUNT=" + count("AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK"));
scan.push("V10GC2J_MARKER_COUNT=" + count("AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX"));
scan.push("V10GC2J_APPROVE_ACTION_COUNT=" + count("review-v10gc2j-execute-approved"));
scan.push("V10GC2J_RETURN_ACTION_COUNT=" + count("review-v10gc2j-execute-returned"));
scan.push("V10GC2J_NORMALIZE_FUNCTION_COUNT=" + count("function normalizeFinalButtons"));
scan.push("V10GC2J_EXECUTE_FUNCTION_COUNT=" + count("async function executeDecision"));
scan.push("V10GC2J_OWNER_FALLBACK_COUNT=" + count("00000000-0000-4000-8000-000000000001"));
scan.push("V10GC2J_EXPORTED_NORMALIZE_COUNT=" + count("aicmR8zV10gc2jNormalizeFinalButtons"));
scan.push("HARD_DISABLED_APPROVE_LABEL_COUNT=" + count("承認を実行する（次工程）"));
scan.push("HARD_DISABLED_RETURN_LABEL_COUNT=" + count("差し戻しを実行する（次工程）"));
scan.push("APPROVE_EXECUTE_LABEL_COUNT=" + count("承認を実行"));
scan.push("RETURN_EXECUTE_LABEL_COUNT=" + count("差し戻しを実行"));
scan.push("DISABLED_LITERAL_COUNT=" + count("disabled"));
scan.push("DISABLED_ATTR_LITERAL_COUNT=" + count(" disabled"));
scan.push("DATA_CORE_ACTION_COUNT=" + count("data-core-action"));
scan.push("DATA_REVIEW_ITEM_ID_COUNT=" + count("data-review-item-id"));
scan.push("STOP_IMMEDIATE_COUNT=" + count("stopImmediatePropagation"));

fs.writeFileSync(coreScanPath, scan.join("\n") + "\n", "utf8");

let extract = "";
extract += "============================================================\n";
extract += "承認を実行する（次工程） around\n";
extract += "============================================================\n";
extract += hits("承認を実行する（次工程）", 45, 70) || "NO_HIT";
extract += "\n\n============================================================\n";
extract += "差し戻しを実行する（次工程） around\n";
extract += "============================================================\n";
extract += hits("差し戻しを実行する（次工程）", 45, 70) || "NO_HIT";
extract += "\n\n============================================================\n";
extract += "承認前の最終確認 around\n";
extract += "============================================================\n";
extract += hits("承認前の最終確認", 45, 70) || "NO_HIT";
extract += "\n\n============================================================\n";
extract += "差し戻し前の最終確認 around\n";
extract += "============================================================\n";
extract += hits("差し戻し前の最終確認", 45, 70) || "NO_HIT";
extract += "\n\n============================================================\n";
extract += "V10GC2J block\n";
extract += "============================================================\n";
extract += extractMarked("AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX") || "NO_V10GC2J_BLOCK";

fs.writeFileSync(confirmExtractPath, extract, "utf8");
