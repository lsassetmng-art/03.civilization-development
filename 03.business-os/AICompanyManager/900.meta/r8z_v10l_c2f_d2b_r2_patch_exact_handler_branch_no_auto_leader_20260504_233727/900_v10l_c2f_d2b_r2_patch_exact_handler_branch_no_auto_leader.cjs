const fs = require("fs");

const [,, corePath, verifyOut, patchExtractOut, branchExtractOut] = process.argv;
let src = fs.readFileSync(corePath, "utf8");

const marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2B_R2_SECTION_APPLY_NO_AUTO_LEADER";
const action = "r8z-mgr-major-card-route-apply-section";
const d2Marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE";
const b3Marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE";

function count(text, needle) {
  let c = 0;
  let from = 0;
  while (true) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) break;
    c += 1;
    from = idx + needle.length;
  }
  return c;
}

function lineNoAtIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function indexAtLine(text, lineNo) {
  const arr = text.split(/\r?\n/);
  let idx = 0;
  for (let i = 1; i < lineNo; i += 1) {
    idx += arr[i - 1].length + 1;
  }
  return idx;
}

function makeLineWindow(text, centerLine, before, after) {
  const arr = text.split(/\r?\n/);
  const start = Math.max(1, centerLine - before);
  const end = Math.min(arr.length, centerLine + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + arr[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

function matchBrace(text, openIndex) {
  let depth = 0;
  let mode = "code";
  let quote = "";
  let escaped = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1] || "";

    if (mode === "line_comment") {
      if (ch === "\n") mode = "code";
      continue;
    }

    if (mode === "block_comment") {
      if (ch === "*" && next === "/") {
        mode = "code";
        i += 1;
      }
      continue;
    }

    if (mode === "string") {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        mode = "code";
        quote = "";
      }
      continue;
    }

    if (mode === "template") {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === "`") {
        mode = "code";
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      mode = "line_comment";
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      mode = "block_comment";
      i += 1;
      continue;
    }

    if (ch === "\"" || ch === "'") {
      mode = "string";
      quote = ch;
      continue;
    }

    if (ch === "`") {
      mode = "template";
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

if (count(src, marker) > 0) {
  throw new Error("D2B_R2_MARKER_ALREADY_EXISTS");
}

const lines = src.split(/\r?\n/);

const actionOccurrences = [];
let from = 0;
while (true) {
  const idx = src.indexOf(action, from);
  if (idx < 0) break;
  const line = lineNoAtIndex(src, idx);
  const text = lines[line - 1] || "";
  actionOccurrences.push({ idx, line, text });
  from = idx + action.length;
}

if (actionOccurrences.length < 1) {
  throw new Error("TARGET_ACTION_NOT_FOUND");
}

let handlerHit = null;

for (const hit of actionOccurrences) {
  const win = makeLineWindow(src, hit.line, 8, 35).text;
  const isButton = hit.text.includes("<button") || hit.text.includes("data-core-action=");
  const isDispatcher = win.includes("closest(\"[data-core-action]\")") || win.includes("getAttribute(\"data-core-action\")");
  const isHandler =
    /action\s*={0,2}=/.test(win) ||
    win.includes("if (action") ||
    win.includes("else if (action") ||
    win.includes("case ");

  if (!isButton && !isDispatcher && isHandler) {
    handlerHit = hit;
    break;
  }
}

if (!handlerHit) {
  throw new Error("ACTUAL_HANDLER_BRANCH_NOT_FOUND");
}

const expectedLine = 6864;
if (Math.abs(handlerHit.line - expectedLine) > 20) {
  throw new Error("HANDLER_BRANCH_LINE_OUT_OF_EXPECTED_RANGE: " + handlerHit.line);
}

const searchStart = Math.max(0, handlerHit.idx - 900);
const prefix = src.slice(searchStart, handlerHit.idx + action.length);
const condRe = /(if|else\s+if)\s*\([^)]*r8z-mgr-major-card-route-apply-section[^)]*\)\s*\{/g;
let condMatch = null;
let m;
while ((m = condRe.exec(prefix)) !== null) {
  condMatch = m;
}

if (!condMatch) {
  throw new Error("HANDLER_IF_CONDITION_NOT_FOUND");
}

const conditionStart = searchStart + condMatch.index;
const openBraceIndex = src.indexOf("{", conditionStart);
if (openBraceIndex < 0) {
  throw new Error("HANDLER_BRANCH_OPEN_BRACE_NOT_FOUND");
}

const closeBraceIndex = matchBrace(src, openBraceIndex);
if (closeBraceIndex < 0) {
  throw new Error("HANDLER_BRANCH_CLOSE_BRACE_NOT_FOUND");
}

const branchBefore = src.slice(conditionStart, closeBraceIndex + 1);
const branchStartLine = lineNoAtIndex(src, conditionStart);
const branchEndLine = lineNoAtIndex(src, closeBraceIndex);

const suspectedLeaderAutoFill =
  /leaderLabel\s*[:=]/.test(branchBefore) ||
  /leader_label\s*[:=]/.test(branchBefore) ||
  /assigned_leader_label\s*[:=]/.test(branchBefore) ||
  /leaderPlacementId\s*[:=]/.test(branchBefore) ||
  /leader_placement_id\s*[:=]/.test(branchBefore) ||
  /assigned_leader_placement_id\s*[:=]/.test(branchBefore) ||
  /placementId\s*[:=]/.test(branchBefore) ||
  /placement_id\s*[:=]/.test(branchBefore);

if (!suspectedLeaderAutoFill) {
  throw new Error("LEADER_AUTOFILL_NOT_FOUND_IN_HANDLER_BRANCH");
}

/*
  Insert immediately before the branch rerender, so the existing rerender reflects cleared Leader.
  If rerender is not found, insert before final return.
*/
const branchLines = branchBefore.split(/\r?\n/);
let insertLineInBranch = -1;

for (let i = 0; i < branchLines.length; i += 1) {
  if (branchLines[i].includes("aicmR8zMgrMajorCardRerender") || branchLines[i].includes("Rerender(")) {
    insertLineInBranch = i;
    break;
  }
}

if (insertLineInBranch < 0) {
  for (let i = branchLines.length - 1; i >= 0; i -= 1) {
    if (/^\s*return\b/.test(branchLines[i])) {
      insertLineInBranch = i;
      break;
    }
  }
}

if (insertLineInBranch < 0) {
  insertLineInBranch = branchLines.length - 1;
}

const indentMatch = (branchLines[insertLineInBranch] || "").match(/^(\s*)/);
const indent = indentMatch ? indentMatch[1] : "    ";

const clearBlock = [
indent + "// " + marker + "_START",
indent + "// Section apply must not auto-confirm Leader. Leader is confirmed only by the dedicated Leader apply action.",
indent + "(function aicmC2fD2bR2ClearLeaderAfterSectionApply() {",
indent + "  var aicmC2fD2bR2Targets = [];",
indent + "  if (typeof aicmR8zMgrMajorCardSelectionState === \"function\") {",
indent + "    try {",
indent + "      var aicmC2fD2bR2Selection = aicmR8zMgrMajorCardSelectionState();",
indent + "      if (aicmC2fD2bR2Selection && typeof aicmC2fD2bR2Selection === \"object\") aicmC2fD2bR2Targets.push(aicmC2fD2bR2Selection);",
indent + "    } catch (_) {}",
indent + "  }",
indent + "  if (typeof state !== \"undefined\" && state && typeof state === \"object\") {",
indent + "    if (state.r8zMgrMajorCardSelection && typeof state.r8zMgrMajorCardSelection === \"object\") aicmC2fD2bR2Targets.push(state.r8zMgrMajorCardSelection);",
indent + "    if (state.r8zMgrMajorCardSelectionState && typeof state.r8zMgrMajorCardSelectionState === \"object\") aicmC2fD2bR2Targets.push(state.r8zMgrMajorCardSelectionState);",
indent + "  }",
indent + "  for (var aicmC2fD2bR2I = 0; aicmC2fD2bR2I < aicmC2fD2bR2Targets.length; aicmC2fD2bR2I += 1) {",
indent + "    var aicmC2fD2bR2Target = aicmC2fD2bR2Targets[aicmC2fD2bR2I];",
indent + "    if (!aicmC2fD2bR2Target || typeof aicmC2fD2bR2Target !== \"object\") continue;",
indent + "    var aicmC2fD2bR2Route = aicmC2fD2bR2Target.handoffBatchRoute;",
indent + "    if (!aicmC2fD2bR2Route || typeof aicmC2fD2bR2Route !== \"object\") continue;",
indent + "    aicmC2fD2bR2Route.leaderLabel = \"\";",
indent + "    aicmC2fD2bR2Route.leader_label = \"\";",
indent + "    aicmC2fD2bR2Route.assigned_leader_label = \"\";",
indent + "    aicmC2fD2bR2Route.leaderName = \"\";",
indent + "    aicmC2fD2bR2Route.leader_name = \"\";",
indent + "    aicmC2fD2bR2Route.leaderPlacementId = \"\";",
indent + "    aicmC2fD2bR2Route.leader_placement_id = \"\";",
indent + "    aicmC2fD2bR2Route.assigned_leader_placement_id = \"\";",
indent + "    aicmC2fD2bR2Route.placementId = \"\";",
indent + "    aicmC2fD2bR2Route.placement_id = \"\";",
indent + "    aicmC2fD2bR2Route.leaderApplied = false;",
indent + "    aicmC2fD2bR2Route.leader_applied = false;",
indent + "    aicmC2fD2bR2Route.applied = false;",
indent + "    aicmC2fD2bR2Route.applied_flag = false;",
indent + "    aicmC2fD2bR2Route.appliedLabel = \"未適用\";",
indent + "    aicmC2fD2bR2Route.applied_label = \"未適用\";",
indent + "  }",
indent + "}());",
indent + "// " + marker + "_END"
].join("\n");

branchLines.splice(insertLineInBranch, 0, clearBlock);
const branchAfter = branchLines.join("\n");

src = src.slice(0, conditionStart) + branchAfter + src.slice(closeBraceIndex + 1);
fs.writeFileSync(corePath, src);

const branchStartAfterLine = lineNoAtIndex(src, conditionStart);
const beforeWindow = makeLineWindow(fs.readFileSync(corePath + ".not_exists", "utf8"), 1, 0, 0);
