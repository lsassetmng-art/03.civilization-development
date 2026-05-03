const fs = require("fs");

const corePath = process.argv[2];
const outPath = process.argv[3];
const confirmOutPath = process.argv[4];

const src = fs.readFileSync(corePath, "utf8");

function extractMarked(marker) {
  const startMarker = "// " + marker + "_START";
  const endMarker = "// " + marker + "_END";
  const start = src.indexOf(startMarker);
  const end = src.indexOf(endMarker);
  if (start < 0 || end < 0) return "";
  return src.slice(start, end + endMarker.length);
}

function around(pattern, before = 25, after = 25) {
  const lines = src.split(/\n/);
  const hits = [];
  lines.forEach((line, idx) => {
    if (line.includes(pattern)) {
      const s = Math.max(0, idx - before);
      const e = Math.min(lines.length, idx + after);
      hits.push("---- hit line " + (idx + 1) + " pattern=" + pattern + " ----\n" + lines.slice(s, e).join("\n"));
    }
  });
  return hits.join("\n\n");
}

function count(pattern) {
  return (src.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

const blockB = extractMarked("AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE");
const blockF = extractMarked("AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME");
const blockC = extractMarked("AICM_R8Z_V10GC2C_REVIEW_CONFIRM_BUTTON_FORCE_ENABLE");
const blockD = extractMarked("AICM_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME");

function payloadKeys(block) {
  const m = block.match(/return\s*\{([\s\S]*?)\};/);
  if (!m) return "";
  const keys = [];
  const re = /([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g;
  let hit;
  while ((hit = re.exec(m[1]))) keys.push(hit[1]);
  return Array.from(new Set(keys)).join(",");
}

let out = "";
out += "V10GC2B_BLOCK_EXISTS=" + !!blockB + "\n";
out += "V10GC2F_BLOCK_EXISTS=" + !!blockF + "\n";
out += "V10GC2C_BLOCK_EXISTS=" + !!blockC + "\n";
out += "V10GC2D_BLOCK_EXISTS=" + !!blockD + "\n";
out += "CORE_APPROVE_ROUTE_COUNT=" + count("/api/aicm/v2/human-review/approve") + "\n";
out += "CORE_RETURN_ROUTE_COUNT=" + count("/api/aicm/v2/human-review/return") + "\n";
out += "CORE_APPROVE_ACTION_COUNT=" + count("review-v10gc2b-execute-approved") + "\n";
out += "CORE_RETURN_ACTION_COUNT=" + count("review-v10gc2b-execute-returned") + "\n";
out += "CORE_EXECUTE_FUNCTION_EXPORTED=" + count("aicmR8zV10gc2bExecuteReviewDecision") + "\n";
out += "CORE_UPGRADE_FUNCTION_EXPORTED=" + count("aicmR8zV10gc2bUpgradeButtons") + "\n";
out += "CORE_BUILD_PAYLOAD_KEYS=" + payloadKeys(blockB) + "\n";
out += "CORE_CURRENT_REVIEW_ID_HAS_DOM_SCAN=" + (blockB.includes("document.querySelector") && blockB.includes("data-review")) + "\n";
out += "CORE_CURRENT_REVIEW_ID_HAS_STATE_SCAN=" + blockB.includes("deepFindReviewId(app()") + "\n";
out += "CORE_CLICK_HANDLER_CAPTURE=" + (blockB.includes("addEventListener(\"click\"") && blockB.includes("true")) + "\n";
out += "CORE_STOP_IMMEDIATE_PROPAGATION=" + blockB.includes("stopImmediatePropagation") + "\n";

out += "\n============================================================\n";
out += "V10GC2B BLOCK\n";
out += "============================================================\n";
out += blockB || "NOT_FOUND";
out += "\n\n============================================================\n";
out += "V10GC2F BLOCK\n";
out += "============================================================\n";
out += blockF || "NOT_FOUND";

fs.writeFileSync(outPath, out, "utf8");

let confirm = "";
confirm += "---- 承認前の最終確認 around ----\n";
confirm += around("承認前の最終確認", 35, 45);
confirm += "\n\n---- 差し戻し前の最終確認 around ----\n";
confirm += around("差し戻し前の最終確認", 35, 45);
confirm += "\n\n---- 承認確認へ進む around ----\n";
confirm += around("承認確認へ進む", 35, 45);
confirm += "\n\n---- 差し戻し確認へ進む around ----\n";
confirm += around("差し戻し確認へ進む", 35, 45);
confirm += "\n\n---- 承認を実行 around ----\n";
confirm += around("承認を実行", 35, 45);
confirm += "\n\n---- 差し戻しを実行 around ----\n";
confirm += around("差し戻しを実行", 35, 45);

fs.writeFileSync(confirmOutPath, confirm, "utf8");
