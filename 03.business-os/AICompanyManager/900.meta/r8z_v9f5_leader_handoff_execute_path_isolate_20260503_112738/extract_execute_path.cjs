const fs = require("fs");

const corePath = process.argv[2];
const serverPath = process.argv[3];
const extractPath = process.argv[4];
const classifyPath = process.argv[5];
const serverRoutePath = process.argv[6];

const src = fs.readFileSync(corePath, "utf8");
const server = fs.readFileSync(serverPath, "utf8");
const lines = src.split(/\r?\n/);

function functionBlock(name) {
  const idx = src.indexOf("function " + name);
  if (idx < 0) return "";
  const brace = src.indexOf("{", idx);
  if (brace < 0) return "";
  let depth = 0;
  for (let i = brace; i < src.length; i++) {
    if (src[i] === "{") depth++;
    if (src[i] === "}") {
      depth--;
      if (depth === 0) return src.slice(idx, i + 1);
    }
  }
  return "";
}

function grepBlock(pattern, radius = 18) {
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  const out = [];
  lines.forEach((line, idx) => {
    if (re.test(line)) {
      const start = Math.max(0, idx - radius);
      const end = Math.min(lines.length - 1, idx + radius);
      out.push("---- line " + (idx + 1) + " ----");
      for (let i = start; i <= end; i++) {
        out.push(String(i + 1).padStart(6, " ") + ": " + lines[i]);
      }
    }
  });
  return out.join("\n");
}

const executeFn = functionBlock("aicmExecuteLeaderHandoffConfirmR8S");
const openFn = functionBlock("aicmOpenLeaderHandoffConfirmR8S");
const requestFn = functionBlock("requestJson");
const postFn = functionBlock("aicmHumanReviewPostJson");

const out = [];
out.push("COUNTS");
out.push("HAS_EXECUTE_FUNCTION=" + String(!!executeFn));
out.push("EXECUTE_USES_MANAGER_CONFIRM_STATE=" + String(executeFn.includes("managerMajorLeaderHandoffConfirm")));
out.push("EXECUTE_USES_PAYLOAD_MAJORID=" + String(executeFn.includes("payload.majorId")));
out.push("EXECUTE_USES_REQUEST_JSON=" + String(executeFn.includes("requestJson")));
out.push("EXECUTE_USES_FETCH=" + String(executeFn.includes("fetch(")));
out.push("EXECUTE_USES_ENDPOINT_UPDATE=" + String(executeFn.includes("/api/aicm/v2/manager-major/update")));
out.push("EXECUTE_CALLS_RELOAD=" + String(executeFn.includes("loadContext") || executeFn.includes("refreshContext") || executeFn.includes("aicmReloadTaskLedgerContext")));
out.push("EXECUTE_CALLS_RENDER=" + String(executeFn.includes("render()")));
out.push("HAS_V9F4B_EXECUTE_BUTTON=" + String(src.includes('data-core-action="r8z-v9f4b-leader-handoff-confirm-execute"')));
out.push("BRIDGE_HANDLES_V9F4B_EXECUTE=" + String(src.includes('action === "r8z-v9f4b-leader-handoff-confirm-execute"')));
out.push("BRIDGE_CALLS_EXECUTE_FUNCTION=" + String(src.includes("aicmExecuteLeaderHandoffConfirmR8S()")));
out.push("HAS_OPEN_CONFIRM_FUNCTION=" + String(!!openFn));
out.push("OPEN_CONFIRM_ASSIGNS_STATE=" + String(openFn.includes("state.managerMajorLeaderHandoffConfirm")));
out.push("OPEN_CONFIRM_BODY_HAS_OWNER=" + String(openFn.includes("owner_civilization_id")));
out.push("OPEN_CONFIRM_BODY_HAS_MAJOR_ID=" + String(openFn.includes("aicm_manager_major_work_item_id")));
out.push("");

out.push("EXECUTE_FUNCTION_BLOCK");
out.push(executeFn || "NOT_FOUND");
out.push("");
out.push("OPEN_CONFIRM_FUNCTION_BLOCK");
out.push(openFn || "NOT_FOUND");
out.push("");
out.push("V9F4B_ACTION_SNIPS");
out.push(grepBlock(/r8z-v9f4b-leader-handoff-confirm-execute|r8z-v9f4b-leader-handoff-confirm-cancel|pmlw-major-leader-handoff/, 16));
out.push("");
out.push("REQUEST_JSON_BLOCK");
out.push(requestFn || "NOT_FOUND");

fs.writeFileSync(extractPath, out.join("\n") + "\n");

const serverOut = [];
serverOut.push("SERVER_ROUTE_SCAN");
serverOut.push("HAS_MANAGER_MAJOR_UPDATE_ROUTE=" + String(server.includes('/api/aicm/v2/manager-major/update')));
serverOut.push("HAS_UPDATE_MANAGER_MAJOR_ITEM_FUNCTION=" + String(/function\s+updateManagerMajorItem\s*\(/.test(server)));
serverOut.push("");
serverOut.push("---- manager-major/update route ----");
server.split(/\r?\n/).forEach((line, idx) => {
  if (line.includes("/api/aicm/v2/manager-major/update")) {
    const start = Math.max(0, idx - 16);
    const end = Math.min(server.split(/\r?\n/).length - 1, idx + 22);
    const sLines = server.split(/\r?\n/);
    for (let i = start; i <= end; i++) {
      serverOut.push(String(i + 1).padStart(6, " ") + ": " + sLines[i]);
    }
  }
});
fs.writeFileSync(serverRoutePath, serverOut.join("\n") + "\n");

const cls = [];
const hasExecute = !!executeFn;
const executeHasState = executeFn.includes("managerMajorLeaderHandoffConfirm");
const executeHasUpdate = executeFn.includes("/api/aicm/v2/manager-major/update");
const hasButton = src.includes('data-core-action="r8z-v9f4b-leader-handoff-confirm-execute"');
const bridgeHandles = src.includes('action === "r8z-v9f4b-leader-handoff-confirm-execute"');
const bridgeCallsExecute = src.includes("aicmExecuteLeaderHandoffConfirmR8S()");
const serverHasRoute = server.includes('/api/aicm/v2/manager-major/update');

cls.push("HAS_EXECUTE_FUNCTION=" + String(hasExecute));
cls.push("EXECUTE_USES_MANAGER_CONFIRM_STATE=" + String(executeHasState));
cls.push("EXECUTE_USES_ENDPOINT_UPDATE=" + String(executeHasUpdate));
cls.push("HAS_V9F4B_EXECUTE_BUTTON=" + String(hasButton));
cls.push("BRIDGE_HANDLES_V9F4B_EXECUTE=" + String(bridgeHandles));
cls.push("BRIDGE_CALLS_EXECUTE_FUNCTION=" + String(bridgeCallsExecute));
cls.push("SERVER_HAS_MANAGER_MAJOR_UPDATE_ROUTE=" + String(serverHasRoute));

let next = "REVIEW_REQUIRED";
if (!hasButton) next = "FIX_CONFIRM_BUTTON_ACTION_MARKUP_ONLY";
else if (!bridgeHandles) next = "FIX_V9F4B_EXECUTE_BRIDGE_ACTION_ONLY";
else if (!bridgeCallsExecute) next = "FIX_V9F4B_EXECUTE_BRIDGE_CALL_ONLY";
else if (!hasExecute) next = "RESTORE_EXECUTE_FUNCTION_ONLY";
else if (!executeHasState) next = "FIX_EXECUTE_FUNCTION_STATE_SOURCE_ONLY";
else if (!executeHasUpdate) next = "FIX_EXECUTE_ENDPOINT_TO_MANAGER_MAJOR_UPDATE_ONLY";
else if (!serverHasRoute) next = "SERVER_ROUTE_MISSING_STOP";
else next = "STATIC_EXECUTE_PATH_EXISTS_NEXT_RUNTIME_ERROR_VISIBLE_DEBUG";

cls.push("SUGGESTED_NEXT=");
cls.push(next);
cls.push("EXTRACT_TXT=" + extractPath);
cls.push("SERVER_ROUTE_SCAN=" + serverRoutePath);
fs.writeFileSync(classifyPath, cls.join("\n") + "\n");
