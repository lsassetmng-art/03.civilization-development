const fs = require("fs");

const corePath = process.argv[2];
const serverPath = process.argv[3];
const renderOut = process.argv[4];
const contextOut = process.argv[5];
const eventOut = process.argv[6];
const serverOut = process.argv[7];
const classifyOut = process.argv[8];

const core = fs.readFileSync(corePath, "utf8");
const server = fs.readFileSync(serverPath, "utf8");

function lineNoAt(text, index) {
  return text.slice(0, index).split("\n").length;
}

function windowByIndex(text, index, radius) {
  const lines = text.split("\n");
  const line = lineNoAt(text, index);
  const start = Math.max(1, line - radius);
  const end = Math.min(lines.length, line + radius);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return out.join("\n");
}

function windowsForPatterns(text, patterns, radius, maxEach) {
  const chunks = [];
  for (const p of patterns) {
    let re = new RegExp(p, "g");
    let m;
    let n = 0;
    chunks.push("\n\n============================================================");
    chunks.push("PATTERN: " + p);
    chunks.push("============================================================");
    while ((m = re.exec(text)) && n < maxEach) {
      chunks.push("\n---- hit " + (n + 1) + " line " + lineNoAt(text, m.index) + " ----");
      chunks.push(windowByIndex(text, m.index, radius));
      n += 1;
    }
    if (n === 0) chunks.push("NO_HIT");
  }
  return chunks.join("\n");
}

fs.writeFileSync(renderOut, windowsForPatterns(core, [
  "登録済み大項目",
  "MANAGER大項目",
  "表示 1-20",
  "前ページ",
  "次ページ",
  "renderTaskLedger",
  "aicmRenderTaskLedger",
  "aicmOpenTaskLedger"
], 80, 12), "utf8");

fs.writeFileSync(contextOut, windowsForPatterns(core, [
  "function normalizeContext",
  "normalizeContext",
  "pmlw_major_items",
  "manager_major_items",
  "majorItems",
  "taskLedger",
  "aicmNormalizePmlwContext"
], 70, 16), "utf8");

fs.writeFileSync(eventOut, windowsForPatterns(core, [
  "addEventListener\\(\"click\"",
  "data-core-action",
  "leader-auto-decomposition",
  "manager-major/archive",
  "task-ledger-open",
  "createTaskLedgerFromForm",
  "archiveManagerMajor",
  "delete"
], 70, 20), "utf8");

fs.writeFileSync(serverOut, windowsForPatterns(server, [
  "function getContext",
  "review_wait_items",
  "pmlw_major_items",
  "vw_aicm_pmlw_major_work_display",
  "leader-auto-decomposition",
  "runLeaderAutoDecomposition",
  "manager-major/archive",
  "archiveManagerMajorItem"
], 75, 18), "utf8");

function count(text, s) {
  return (text.match(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

const classification = [];
classification.push("CORE_HAS_REGISTERED_MAJOR=" + (count(core, "登録済み大項目") > 0));
classification.push("CORE_HAS_MANAGER_MAJOR_CARD_LABEL=" + (count(core, "MANAGER大項目") > 0));
classification.push("CORE_PMLW_MAJOR_ITEMS_COUNT=" + count(core, "pmlw_major_items"));
classification.push("CORE_MANAGER_MAJOR_ITEMS_COUNT=" + count(core, "manager_major_items"));
classification.push("CORE_MAJOR_ITEMS_CAMEL_COUNT=" + count(core, "majorItems"));
classification.push("CORE_TASK_LEDGER_COUNT=" + count(core, "taskLedger"));
classification.push("CORE_HAS_CURRENT_B1I=" + (count(core, "AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS") > 0));
classification.push("SERVER_GETCONTEXT_HAS_PMLW_MAJOR=" + (count(server, "pmlw_major_items") > 0));
classification.push("SERVER_GETCONTEXT_HAS_VW_PMLW_MAJOR=" + (count(server, "vw_aicm_pmlw_major_work_display") > 0));
classification.push("SERVER_HAS_LEADER_AUTO_ROUTE=" + (count(server, "/api/aicm/v2/leader-auto-decomposition/run") > 0));
classification.push("SERVER_HAS_MANAGER_ARCHIVE_ROUTE=" + (count(server, "/api/aicm/v2/manager-major/archive") > 0));

let likely = "UNKNOWN_NEED_REVIEW_EXTRACTS";
if (count(core, "登録済み大項目") > 0 && count(core, "MANAGER大項目") > 0 && count(core, "pmlw_major_items") > 0) {
  likely = "LIKELY_RENDERER_DATA_SOURCE_MISMATCH_OR_PAGINATED_RENDERER_NOT_USING_B1_CONTEXT_KEYS";
}
if (count(core, "AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS") > 0 && count(core, "data-aicm-v10l-b1i-row-selector") > 0) {
  likely += "_PLUS_PREVIOUS_PATCH_PRESENT";
}

classification.push("LIKELY_CAUSE=" + likely);
classification.push("NEXT_ACTION=READ_EXTRACTS_THEN_PATCH_EXISTING_RENDERER_NOT_DOM_HACK");

fs.writeFileSync(classifyOut, classification.join("\n") + "\n", "utf8");
