const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");
const before = src;
const log = [];
const analysis = [];

const markers = [
  "AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY",
  "AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER",
  "AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR",
  "AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL",
  "AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS",
  "AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP",
  "AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS",
  "AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS",
  "AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS",
  "AICM_R8Z_V10L_B1J_DOM_CARD_SELECTABLE_CONTROLS",
  "AICM_R8Z_V10L_C1_CANONICAL_RENDERER_REPAIR"
];

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), "g")) || []).length;
}

function removeMarkedBlock(mark) {
  const beforeCount = count(src, mark);
  const re = new RegExp(
    "\\n?\\s*//\\s*" + escRe(mark) + "_START[\\s\\S]*?//\\s*" + escRe(mark) + "_END\\s*\\n?",
    "g"
  );

  const old = src;
  src = src.replace(re, "\n");

  const afterCount = count(src, mark);
  log.push("REMOVED_" + mark + "=" + (old !== src));
  analysis.push("BEFORE_" + mark + "_COUNT=" + beforeCount);
  analysis.push("AFTER_" + mark + "_COUNT=" + afterCount);
}

markers.forEach(removeMarkedBlock);

analysis.push("PATCH_CHANGED=" + (src !== before));
analysis.push("PATCH_DECISION=" + (src !== before ? "CLEANUP_APPLIED" : "NO_B1_BLOCK_TO_REMOVE"));

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
