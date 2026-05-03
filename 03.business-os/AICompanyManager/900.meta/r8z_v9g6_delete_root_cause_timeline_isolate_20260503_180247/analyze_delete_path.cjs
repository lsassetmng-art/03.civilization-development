const fs = require("fs");
const path = require("path");

const corePath = process.argv[2];
const metaDir = process.argv[3];
const currentOut = process.argv[4];
const backupOut = process.argv[5];
const snipOut = process.argv[6];

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\r?\n/);

function countRe(text, re) {
  return (text.match(re) || []).length;
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function functionBlock(text, name) {
  const idx = text.indexOf("function " + name);
  if (idx < 0) return "";
  const brace = text.indexOf("{", idx);
  if (brace < 0) return "";
  let depth = 0;
  for (let i = brace; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(idx, i + 1);
    }
  }
  return "";
}

function allDeleteActions(text) {
  const actions = [];
  const re = /data-core-action=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) {
    if (/delete|削除|archive|major/i.test(m[1])) actions.push(m[1]);
  }
  return uniq(actions);
}

function handledActionCount(text, action) {
  const escaped = action.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return countRe(text, new RegExp(
    [
      "action\\s*={2,3}\\s*[\"']" + escaped + "[\"']",
      "case\\s+[\"']" + escaped + "[\"']",
      "includes\\(\\s*[\"']" + escaped + "[\"']\\s*\\)"
    ].join("|"),
    "g"
  ));
}

function functionNames(text) {
  const names = [];
  const re = /function\s+([A-Za-z0-9_]*Delete[A-Za-z0-9_]*|[A-Za-z0-9_]*delete[A-Za-z0-9_]*)\s*\(/g;
  let m;
  while ((m = re.exec(text))) names.push(m[1]);
  return uniq(names);
}

function nearby(patterns, radius = 22) {
  const out = [];
  const re = new RegExp(patterns.join("|"));
  lines.forEach((line, idx) => {
    if (re.test(line)) {
      out.push("---- line " + (idx + 1) + " ----");
      for (let i = Math.max(0, idx - radius); i <= Math.min(lines.length - 1, idx + radius); i++) {
        out.push(String(i + 1).padStart(6, " ") + ": " + lines[i]);
      }
    }
  });
  return out.join("\n");
}

const currentActions = allDeleteActions(src);
const deleteFns = functionNames(src);
const cardBlock = functionBlock(src, "aicmRenderMajorItemDeleteConfirmCardR8P");
const v9g5Block = functionBlock(src, "aicmR8zV9g5ExecuteDeleteConfirm");
const oldExecute1 = functionBlock(src, "aicmExecuteMajorItemDeleteConfirmR8P");
const oldExecute2 = functionBlock(src, "aicmExecuteManagerMajorDeleteConfirmR8P");

const actionRows = currentActions.map(a => ({
  action: a,
  buttonCount: countRe(src, new RegExp('data-core-action=["\\\']' + a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '["\\\']', "g")),
  handledCount: handledActionCount(src, a)
}));

const current = [];
current.push("CURRENT_DELETE_ANALYSIS");
current.push("HAS_CONFIRM_STATE=" + String(src.includes("managerMajorDeleteConfirm")));
current.push("HAS_CONFIRM_CARD_FUNCTION=" + String(!!cardBlock));
current.push("HAS_OLD_EXECUTE_1_aicmExecuteMajorItemDeleteConfirmR8P=" + String(!!oldExecute1));
current.push("HAS_OLD_EXECUTE_2_aicmExecuteManagerMajorDeleteConfirmR8P=" + String(!!oldExecute2));
current.push("HAS_V9G5_EXECUTE=" + String(!!v9g5Block));
current.push("HAS_V9G5_BRIDGE=" + String(src.includes("__aicmR8zV9g5DeleteConfirmExecuteBridgeInstalled")));
current.push("HAS_MANAGER_MAJOR_UPDATE_ENDPOINT=" + String(src.includes("/api/aicm/v2/manager-major/update")));
current.push("HAS_MANAGER_MAJOR_ARCHIVE_ENDPOINT=" + String(src.includes("/api/aicm/v2/manager-major/archive")));
current.push("DELETE_FUNCTION_NAMES=" + deleteFns.join(","));
current.push("");
current.push("DELETE_ACTION_TABLE");
current.push("action\tbuttonCount\thandledCount");
for (const r of actionRows) {
  current.push([r.action, r.buttonCount, r.handledCount].join("\t"));
}
current.push("");

const unhandled = actionRows.filter(r => r.buttonCount > 0 && r.handledCount === 0);
current.push("UNHANDLED_DELETE_ACTIONS=" + unhandled.map(r => r.action).join(","));

let judgement = "REVIEW_REQUIRED";
if (!cardBlock) judgement = "CONFIRM_CARD_RENDERER_MISSING";
else if (unhandled.length) judgement = "CONFIRM_CARD_BUTTON_ACTION_UNHANDLED";
else if (!oldExecute1 && !oldExecute2 && !v9g5Block) judgement = "DELETE_EXECUTE_FUNCTION_MISSING";
else if (!src.includes("__aicmR8zV9g5DeleteConfirmExecuteBridgeInstalled") && !oldExecute1 && !oldExecute2) judgement = "DELETE_EXECUTE_BRIDGE_MISSING";
else if (v9g5Block && !v9g5Block.includes("/api/aicm/v2/manager-major/update")) judgement = "V9G5_EXECUTE_EXISTS_BUT_ENDPOINT_MISSING";
else judgement = "STATIC_PATH_PRESENT_NEXT_COMPARE_WITH_WORKING_BACKUP_OR_RUNTIME_EVENT";

current.push("STATIC_JUDGEMENT=" + judgement);
current.push("");
current.push("CARD_BLOCK_HEAD");
current.push(cardBlock ? cardBlock.slice(0, 2500) : "NOT_FOUND");
current.push("");
current.push("OLD_EXECUTE_1_HEAD");
current.push(oldExecute1 ? oldExecute1.slice(0, 2500) : "NOT_FOUND");
current.push("");
current.push("OLD_EXECUTE_2_HEAD");
current.push(oldExecute2 ? oldExecute2.slice(0, 2500) : "NOT_FOUND");
current.push("");
current.push("V9G5_EXECUTE_HEAD");
current.push(v9g5Block ? v9g5Block.slice(0, 2500) : "NOT_FOUND");

fs.writeFileSync(currentOut, current.join("\n") + "\n");

fs.writeFileSync(snipOut, nearby([
  "managerMajorDeleteConfirm",
  "aicmRenderMajorItemDeleteConfirmCardR8P",
  "aicmExecuteMajorItemDeleteConfirmR8P",
  "aicmExecuteManagerMajorDeleteConfirmR8P",
  "aicmR8zV9g5ExecuteDeleteConfirm",
  "pmlw-major-delete",
  "delete-confirm",
  "削除を確定",
  "削除"
]) + "\n");

function listFiles(dir) {
  const out = [];
  function walk(d) {
    let entries = [];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (_) { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/aicm-production-core.*\.js$/.test(e.name)) out.push(p);
    }
  }
  walk(dir);
  return out;
}

function analyzeFile(file) {
  let text = "";
  try { text = fs.readFileSync(file, "utf8"); } catch (_) {}
  const actions = allDeleteActions(text);
  const unhandled = actions.filter(a => countRe(text, new RegExp('data-core-action=["\\\']' + a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '["\\\']', "g")) > 0 && handledActionCount(text, a) === 0);
  const fns = functionNames(text);
  let stat = {};
  try { stat = fs.statSync(file); } catch (_) { stat = { mtime: new Date(0) }; }

  const score =
    (text.includes("managerMajorDeleteConfirm") ? 1 : 0) +
    (text.includes("aicmRenderMajorItemDeleteConfirmCardR8P") ? 1 : 0) +
    (text.includes("aicmExecuteMajorItemDeleteConfirmR8P") ? 2 : 0) +
    (text.includes("aicmExecuteManagerMajorDeleteConfirmR8P") ? 2 : 0) +
    (text.includes("/api/aicm/v2/manager-major/update") ? 1 : 0) +
    (unhandled.length === 0 ? 1 : 0);

  return {
    file,
    mtime: stat.mtime.toISOString(),
    hasState: text.includes("managerMajorDeleteConfirm"),
    hasCard: text.includes("aicmRenderMajorItemDeleteConfirmCardR8P"),
    hasExec1: text.includes("aicmExecuteMajorItemDeleteConfirmR8P"),
    hasExec2: text.includes("aicmExecuteManagerMajorDeleteConfirmR8P"),
    hasV9G5: text.includes("AICM_R8Z_V9G5_RESTORE_DELETE_CONFIRM_EXECUTE_BRIDGE_ONLY"),
    hasEndpoint: text.includes("/api/aicm/v2/manager-major/update"),
    actionCount: actions.length,
    unhandled: unhandled.join(","),
    fnNames: fns.join(","),
    score
  };
}

const files = listFiles(metaDir).map(analyzeFile)
  .filter(x => x.hasState || x.hasCard || x.hasExec1 || x.hasExec2 || x.actionCount)
  .sort((a,b) => a.mtime.localeCompare(b.mtime));

const backup = [];
backup.push("mtime\tdeleteScore\thasState\thasCard\thasExec1\thasExec2\thasV9G5\thasEndpoint\tactionCount\tunhandledActions\tfnNames\tfile");
for (const x of files) {
  backup.push([
    x.mtime,
    x.score,
    x.hasState,
    x.hasCard,
    x.hasExec1,
    x.hasExec2,
    x.hasV9G5,
    x.hasEndpoint,
    x.actionCount,
    x.unhandled,
    x.fnNames,
    x.file
  ].join("\t"));
}

fs.writeFileSync(backupOut, backup.join("\n") + "\n");
