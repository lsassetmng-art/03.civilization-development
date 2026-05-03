const fs = require("fs");

const corePath = process.argv[2];
const outPath = process.argv[3];
const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\r?\n/);

function lineNoToIndex(lineNo) {
  return Math.max(0, Math.min(lines.length - 1, lineNo - 1));
}

function hits(pattern) {
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  const out = [];
  lines.forEach((line, idx) => {
    if (re.test(line)) out.push(idx + 1);
  });
  return out;
}

function blockAround(lineNo, radius = 18) {
  const start = Math.max(1, lineNo - radius);
  const end = Math.min(lines.length, lineNo + radius);
  const out = [];
  for (let i = start; i <= end; i++) {
    out.push(String(i).padStart(6, " ") + ": " + lines[lineNoToIndex(i)]);
  }
  return out.join("\n");
}

function functionBlockByName(name) {
  const idx = src.indexOf("function " + name);
  if (idx < 0) return "";
  const braceStart = src.indexOf("{", idx);
  if (braceStart < 0) return "";
  let depth = 0;
  let end = -1;
  for (let i = braceStart; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  return end > 0 ? src.slice(idx, end) : src.slice(idx, idx + 2400);
}

const actionHits = hits(/pmlw-major-leader-handoff/);
const stateAssignHits = hits(/managerMajorLeaderHandoffConfirm\s*=/);
const stateReadHits = hits(/managerMajorLeaderHandoffConfirm/);
const confirmTitleHits = hits(/課長へ送る確認/);
const confirmRenderHits = hits(/LeaderHandoffConfirm|leaderHandoffConfirm|managerMajorLeaderHandoffConfirm|課長へ送る確認/);
const actionTargetHits = hits(/aicmActionTargetSafe|data-core-action|addEventListener|core-action/);

const functionNames = [
  "aicmLeaderHandoffTextR8S",
  "aicmLeaderHandoffOwnerIdR8S",
  "aicmLeaderHandoffActionTargetR8S",
  "aicmOpenLeaderHandoffConfirmR8S",
  "aicmExecuteLeaderHandoffConfirmR8S",
  "aicmBuildLeaderHandoffConfirmR8S",
  "aicmRenderLeaderHandoffConfirmCardR8S",
  "aicmRenderManagerMajorRows",
  "renderTaskLedgerPlaceholder",
];

const out = [];

out.push("COUNTS");
out.push("ACTION_HIT_COUNT=" + actionHits.length);
out.push("STATE_ASSIGN_HIT_COUNT=" + stateAssignHits.length);
out.push("STATE_READ_HIT_COUNT=" + stateReadHits.length);
out.push("CONFIRM_TITLE_HIT_COUNT=" + confirmTitleHits.length);
out.push("CONFIRM_RENDER_HIT_COUNT=" + confirmRenderHits.length);
out.push("ACTION_TARGET_HIT_COUNT=" + actionTargetHits.length);
out.push("");

out.push("ACTION_HITS");
for (const n of actionHits) {
  out.push("---- line " + n + " ----");
  out.push(blockAround(n, 14));
}
out.push("");

out.push("STATE_ASSIGN_HITS");
for (const n of stateAssignHits) {
  out.push("---- line " + n + " ----");
  out.push(blockAround(n, 20));
}
out.push("");

out.push("CONFIRM_TITLE_HITS");
for (const n of confirmTitleHits) {
  out.push("---- line " + n + " ----");
  out.push(blockAround(n, 16));
}
out.push("");

out.push("FUNCTION_BLOCKS");
for (const name of functionNames) {
  const block = functionBlockByName(name);
  out.push("============================================================");
  out.push("FUNCTION=" + name);
  out.push("FOUND=" + String(!!block));
  if (block) out.push(block);
}

const full = out.join("\n") + "\n";
fs.writeFileSync(outPath, full);

function includesInFunction(name, needle) {
  const block = functionBlockByName(name);
  return block.includes(needle);
}

const classification = [];
classification.push("ACTION_HIT_COUNT=" + actionHits.length);
classification.push("STATE_ASSIGN_HIT_COUNT=" + stateAssignHits.length);
classification.push("CONFIRM_TITLE_HIT_COUNT=" + confirmTitleHits.length);
classification.push("HAS_OPEN_CONFIRM_FUNCTION=" + String(!!functionBlockByName("aicmOpenLeaderHandoffConfirmR8S")));
classification.push("OPEN_CONFIRM_ASSIGNS_STATE=" + String(includesInFunction("aicmOpenLeaderHandoffConfirmR8S", "managerMajorLeaderHandoffConfirm")));
classification.push("OPEN_CONFIRM_CALLS_RENDER=" + String(includesInFunction("aicmOpenLeaderHandoffConfirmR8S", "render()")));
classification.push("HAS_CONFIRM_CARD_RENDERER=" + String(!!functionBlockByName("aicmRenderLeaderHandoffConfirmCardR8S")));
classification.push("TASK_LEDGER_CALLS_CONFIRM_CARD=" + String(functionBlockByName("renderTaskLedgerPlaceholder").includes("aicmRenderLeaderHandoffConfirmCardR8S")));
classification.push("MANAGER_ROWS_BUTTON_HAS_ACTION=" + String(functionBlockByName("aicmRenderManagerMajorRows").includes('data-core-action="pmlw-major-leader-handoff"')));
classification.push("MANAGER_ROWS_BUTTON_HAS_MAJOR_ID=" + String(functionBlockByName("aicmRenderManagerMajorRows").includes("data-major-id")));
classification.push("");
classification.push("SUGGESTED_NEXT=");
const hasOpen = !!functionBlockByName("aicmOpenLeaderHandoffConfirmR8S");
const openAssign = includesInFunction("aicmOpenLeaderHandoffConfirmR8S", "managerMajorLeaderHandoffConfirm");
const openRender = includesInFunction("aicmOpenLeaderHandoffConfirmR8S", "render()");
const hasCard = !!functionBlockByName("aicmRenderLeaderHandoffConfirmCardR8S");
const taskCallsCard = functionBlockByName("renderTaskLedgerPlaceholder").includes("aicmRenderLeaderHandoffConfirmCardR8S");
const btnAction = functionBlockByName("aicmRenderManagerMajorRows").includes('data-core-action="pmlw-major-leader-handoff"');
if (!btnAction) {
  classification.push("FIX_BUTTON_ACTION_MARKUP_ONLY");
} else if (!hasOpen) {
  classification.push("RESTORE_OPEN_CONFIRM_FUNCTION_ONLY");
} else if (!openAssign) {
  classification.push("FIX_OPEN_CONFIRM_STATE_ASSIGN_ONLY");
} else if (!openRender) {
  classification.push("FIX_OPEN_CONFIRM_RENDER_CALL_ONLY");
} else if (!hasCard) {
  classification.push("RESTORE_CONFIRM_CARD_RENDERER_ONLY");
} else if (!taskCallsCard) {
  classification.push("INSERT_CONFIRM_CARD_IN_TASK_LEDGER_ONLY");
} else {
  classification.push("STATIC_PATH_EXISTS_NEXT_EVENT_TARGET_OR_HANDLER_DISPATCH_FIX");
}

fs.writeFileSync(outPath.replace("020_exact_call_path_extract.txt", "030_classification.txt"), classification.join("\n") + "\n");
