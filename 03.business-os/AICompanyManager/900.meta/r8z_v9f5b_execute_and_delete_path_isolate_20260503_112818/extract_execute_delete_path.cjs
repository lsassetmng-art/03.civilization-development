const fs = require("fs");

const corePath = process.argv[2];
const serverPath = process.argv[3];
const extractPath = process.argv[4];
const classifyPath = process.argv[5];
const serverRoutePath = process.argv[6];

const src = fs.readFileSync(corePath, "utf8");
const server = fs.readFileSync(serverPath, "utf8");
const lines = src.split(/\r?\n/);
const serverLines = server.split(/\r?\n/);

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

function grepBlockFromLines(srcLines, pattern, radius = 18) {
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  const out = [];
  srcLines.forEach((line, idx) => {
    if (re.test(line)) {
      const start = Math.max(0, idx - radius);
      const end = Math.min(srcLines.length - 1, idx + radius);
      out.push("---- line " + (idx + 1) + " ----");
      for (let i = start; i <= end; i++) {
        out.push(String(i + 1).padStart(6, " ") + ": " + srcLines[i]);
      }
    }
  });
  return out.join("\n");
}

function countLiteral(text) {
  return (src.match(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

const leaderExecuteFn = functionBlock("aicmExecuteLeaderHandoffConfirmR8S");
const leaderOpenFn = functionBlock("aicmOpenLeaderHandoffConfirmR8S");

const deleteCandidateNames = [
  "aicmRenderMajorItemDeleteConfirmCardR8P",
  "aicmOpenMajorItemDeleteConfirmR8P",
  "aicmOpenManagerMajorDeleteConfirmR8P",
  "aicmExecuteMajorItemDeleteConfirmR8P",
  "aicmExecuteManagerMajorDeleteConfirmR8P",
  "aicmCloseMajorItemDeleteConfirmR8P",
  "aicmCancelMajorItemDeleteConfirmR8P"
];

const deleteBlocks = deleteCandidateNames
  .map((name) => ({ name, block: functionBlock(name) }))
  .filter((x) => !!x.block);

const out = [];

out.push("COUNTS");
out.push("HAS_LEADER_EXECUTE_FUNCTION=" + String(!!leaderExecuteFn));
out.push("LEADER_EXECUTE_USES_CONFIRM_STATE=" + String(leaderExecuteFn.includes("managerMajorLeaderHandoffConfirm")));
out.push("LEADER_EXECUTE_USES_MANAGER_UPDATE_ENDPOINT=" + String(leaderExecuteFn.includes("/api/aicm/v2/manager-major/update")));
out.push("HAS_V9F4B_LEADER_EXECUTE_BUTTON=" + String(src.includes('data-core-action="r8z-v9f4b-leader-handoff-confirm-execute"')));
out.push("BRIDGE_HANDLES_V9F4B_LEADER_EXECUTE=" + String(src.includes('action === "r8z-v9f4b-leader-handoff-confirm-execute"')));
out.push("BRIDGE_CALLS_LEADER_EXECUTE_FUNCTION=" + String(src.includes("aicmExecuteLeaderHandoffConfirmR8S()")));
out.push("HAS_LEADER_OPEN_FUNCTION=" + String(!!leaderOpenFn));
out.push("LEADER_OPEN_ASSIGNS_STATE=" + String(leaderOpenFn.includes("state.managerMajorLeaderHandoffConfirm")));
out.push("");

out.push("DELETE_COUNTS");
out.push("DELETE_OPEN_BUTTON_COUNT=" + countLiteral('data-core-action="pmlw-major-delete-open"'));
out.push("DELETE_BUTTON_REF_COUNT=" + countLiteral("pmlw-major-delete"));
out.push("DELETE_CONFIRM_STATE_REF_COUNT=" + countLiteral("managerMajorDeleteConfirm"));
out.push("DELETE_CONFIRM_CARD_REF_COUNT=" + countLiteral("aicmRenderMajorItemDeleteConfirmCardR8P"));
out.push("DELETE_CONFIRM_TITLE_COUNT=" + countLiteral("削除"));
out.push("HAS_DELETE_CONFIRM_CARD_FUNCTION=" + String(/function\s+aicmRenderMajorItemDeleteConfirmCardR8P\s*\(/.test(src)));
out.push("HAS_DELETE_FUNCTION_BLOCKS=" + String(deleteBlocks.length));
out.push("DELETE_BLOCK_NAMES=" + deleteBlocks.map(x => x.name).join(","));
out.push("HAS_DELETE_OPEN_LIKE_FUNCTION=" + String(deleteBlocks.some(x => /Open|open/.test(x.name))));
out.push("HAS_DELETE_EXECUTE_LIKE_FUNCTION=" + String(deleteBlocks.some(x => /Execute|execute/.test(x.name))));
out.push("DELETE_USES_MANAGER_DELETE_CONFIRM_STATE=" + String(src.includes("managerMajorDeleteConfirm")));
out.push("DELETE_USES_MANAGER_MAJOR_UPDATE_OR_ARCHIVE_ENDPOINT=" + String(src.includes("/api/aicm/v2/manager-major/update") || src.includes("/api/aicm/v2/manager-major/archive") || src.includes("/api/aicm/v2/manager-major/delete")));
out.push("");

out.push("LEADER_EXECUTE_FUNCTION_BLOCK");
out.push(leaderExecuteFn || "NOT_FOUND");
out.push("");
out.push("LEADER_OPEN_FUNCTION_BLOCK");
out.push(leaderOpenFn || "NOT_FOUND");
out.push("");

out.push("DELETE_FUNCTION_BLOCKS");
for (const item of deleteBlocks) {
  out.push("============================================================");
  out.push("FUNCTION=" + item.name);
  out.push(item.block);
}
out.push("");

out.push("LEADER_ACTION_SNIPS");
out.push(grepBlockFromLines(lines, /r8z-v9f4b-leader-handoff-confirm-execute|r8z-v9f4b-leader-handoff-confirm-cancel|pmlw-major-leader-handoff/, 16));
out.push("");

out.push("DELETE_ACTION_SNIPS");
out.push(grepBlockFromLines(lines, /pmlw-major-delete|managerMajorDeleteConfirm|aicmRenderMajorItemDeleteConfirmCardR8P|削除/, 18));

fs.writeFileSync(extractPath, out.join("\n") + "\n");

const serverOut = [];
serverOut.push("SERVER_ROUTE_SCAN");
serverOut.push("HAS_MANAGER_MAJOR_UPDATE_ROUTE=" + String(server.includes('/api/aicm/v2/manager-major/update')));
serverOut.push("HAS_MANAGER_MAJOR_ARCHIVE_ROUTE=" + String(server.includes('/api/aicm/v2/manager-major/archive')));
serverOut.push("HAS_MANAGER_MAJOR_DELETE_ROUTE=" + String(server.includes('/api/aicm/v2/manager-major/delete')));
serverOut.push("HAS_UPDATE_MANAGER_MAJOR_ITEM_FUNCTION=" + String(/function\s+updateManagerMajorItem\s*\(/.test(server)));
serverOut.push("HAS_ARCHIVE_MANAGER_MAJOR_ITEM_FUNCTION=" + String(/function\s+archiveManagerMajorItem\s*\(/.test(server)));
serverOut.push("");
serverOut.push("---- manager-major route snippets ----");
serverOut.push(grepBlockFromLines(serverLines, /\/api\/aicm\/v2\/manager-major\/(update|archive|delete)|updateManagerMajorItem|archiveManagerMajorItem/, 18));
fs.writeFileSync(serverRoutePath, serverOut.join("\n") + "\n");

const hasLeaderExecute = !!leaderExecuteFn;
const leaderHasState = leaderExecuteFn.includes("managerMajorLeaderHandoffConfirm");
const leaderHasUpdateEndpoint = leaderExecuteFn.includes("/api/aicm/v2/manager-major/update");
const leaderHasButton = src.includes('data-core-action="r8z-v9f4b-leader-handoff-confirm-execute"');
const leaderBridgeHandles = src.includes('action === "r8z-v9f4b-leader-handoff-confirm-execute"');
const leaderBridgeCalls = src.includes("aicmExecuteLeaderHandoffConfirmR8S()");

const deleteHasButton = src.includes('data-core-action="pmlw-major-delete-open"');
const deleteHasCard = /function\s+aicmRenderMajorItemDeleteConfirmCardR8P\s*\(/.test(src);
const deleteHasState = src.includes("managerMajorDeleteConfirm");
const deleteHasOpenLike = deleteBlocks.some(x => /Open|open/.test(x.name));
const deleteHasExecuteLike = deleteBlocks.some(x => /Execute|execute/.test(x.name));
const serverHasUpdate = server.includes('/api/aicm/v2/manager-major/update');
const serverHasArchive = server.includes('/api/aicm/v2/manager-major/archive') || /function\s+archiveManagerMajorItem\s*\(/.test(server);

let leaderNext = "LEADER_REVIEW_REQUIRED";
if (!leaderHasButton) leaderNext = "FIX_LEADER_CONFIRM_BUTTON_ACTION_MARKUP_ONLY";
else if (!leaderBridgeHandles) leaderNext = "FIX_LEADER_V9F4B_EXECUTE_BRIDGE_ACTION_ONLY";
else if (!leaderBridgeCalls) leaderNext = "FIX_LEADER_V9F4B_EXECUTE_BRIDGE_CALL_ONLY";
else if (!hasLeaderExecute) leaderNext = "RESTORE_LEADER_EXECUTE_FUNCTION_ONLY";
else if (!leaderHasState) leaderNext = "FIX_LEADER_EXECUTE_STATE_SOURCE_ONLY";
else if (!leaderHasUpdateEndpoint) leaderNext = "FIX_LEADER_EXECUTE_ENDPOINT_ONLY";
else if (!serverHasUpdate) leaderNext = "SERVER_MANAGER_UPDATE_ROUTE_MISSING_STOP";
else leaderNext = "LEADER_STATIC_EXECUTE_PATH_EXISTS_NEXT_RUNTIME_DEBUG_OR_ROLLBACK_SMOKE";

let deleteNext = "DELETE_REVIEW_REQUIRED";
if (!deleteHasButton) deleteNext = "FIX_DELETE_BUTTON_ACTION_MARKUP_ONLY";
else if (!deleteHasState) deleteNext = "RESTORE_DELETE_CONFIRM_STATE_PATH_ONLY";
else if (!deleteHasCard) deleteNext = "RESTORE_DELETE_CONFIRM_CARD_RENDERER_ONLY";
else if (!deleteHasOpenLike) deleteNext = "RESTORE_DELETE_OPEN_CONFIRM_FUNCTION_ONLY";
else if (!deleteHasExecuteLike) deleteNext = "RESTORE_DELETE_EXECUTE_FUNCTION_ONLY";
else if (!serverHasArchive && !serverHasUpdate) deleteNext = "SERVER_DELETE_OR_ARCHIVE_ROUTE_MISSING_STOP";
else deleteNext = "DELETE_STATIC_PATH_EXISTS_NEXT_RUNTIME_DEBUG_OR_ROLLBACK_SMOKE";

const cls = [];
cls.push("HAS_LEADER_EXECUTE_FUNCTION=" + String(hasLeaderExecute));
cls.push("LEADER_EXECUTE_USES_CONFIRM_STATE=" + String(leaderHasState));
cls.push("LEADER_EXECUTE_USES_MANAGER_UPDATE_ENDPOINT=" + String(leaderHasUpdateEndpoint));
cls.push("HAS_V9F4B_LEADER_EXECUTE_BUTTON=" + String(leaderHasButton));
cls.push("BRIDGE_HANDLES_V9F4B_LEADER_EXECUTE=" + String(leaderBridgeHandles));
cls.push("BRIDGE_CALLS_LEADER_EXECUTE_FUNCTION=" + String(leaderBridgeCalls));
cls.push("SERVER_HAS_MANAGER_MAJOR_UPDATE_ROUTE=" + String(serverHasUpdate));
cls.push("LEADER_SUGGESTED_NEXT=");
cls.push(leaderNext);
cls.push("");
cls.push("DELETE_OPEN_BUTTON_COUNT=" + countLiteral('data-core-action="pmlw-major-delete-open"'));
cls.push("DELETE_CONFIRM_STATE_REF_COUNT=" + countLiteral("managerMajorDeleteConfirm"));
cls.push("HAS_DELETE_CONFIRM_CARD_FUNCTION=" + String(deleteHasCard));
cls.push("HAS_DELETE_OPEN_LIKE_FUNCTION=" + String(deleteHasOpenLike));
cls.push("HAS_DELETE_EXECUTE_LIKE_FUNCTION=" + String(deleteHasExecuteLike));
cls.push("SERVER_HAS_MANAGER_MAJOR_ARCHIVE_OR_UPDATE_ROUTE=" + String(serverHasArchive || serverHasUpdate));
cls.push("DELETE_SUGGESTED_NEXT=");
cls.push(deleteNext);
cls.push("");
cls.push("EXTRACT_TXT=" + extractPath);
cls.push("SERVER_ROUTE_SCAN=" + serverRoutePath);

fs.writeFileSync(classifyPath, cls.join("\n") + "\n");
