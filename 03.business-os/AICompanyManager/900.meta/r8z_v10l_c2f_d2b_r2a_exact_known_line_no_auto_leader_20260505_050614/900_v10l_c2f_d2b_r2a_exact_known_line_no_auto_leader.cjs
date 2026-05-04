const fs = require("fs");

const [,, corePath, verifyOut, patchExtractOut, branchExtractOut] = process.argv;

const beforeSrc = fs.readFileSync(corePath, "utf8");
let src = beforeSrc;

const marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2B_R2A_SECTION_APPLY_NO_AUTO_LEADER";
const action = "r8z-mgr-major-card-route-apply-section";
const expectedLine = 6864;
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
      if (ch === "`") mode = "code";
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

function findOccurrences(text, needle) {
  const arr = text.split(/\r?\n/);
  const out = [];
  let from = 0;
  while (true) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) break;
    const line = lineNoAtIndex(text, idx);
    out.push({ idx, line, text: arr[line - 1] || "" });
    from = idx + needle.length;
  }
  return out;
}

if (count(src, marker) > 0) {
  throw new Error("D2B_R2A_MARKER_ALREADY_EXISTS");
}

const occurrences = findOccurrences(src, action);
if (occurrences.length !== 3) {
  throw new Error("UNEXPECTED_ACTION_OCCURRENCE_COUNT=" + occurrences.length);
}

let handlerHit = occurrences[0];
for (const hit of occurrences) {
  if (Math.abs(hit.line - expectedLine) < Math.abs(handlerHit.line - expectedLine)) {
    handlerHit = hit;
  }
}

if (Math.abs(handlerHit.line - expectedLine) > 40) {
  throw new Error("KNOWN_LINE_HANDLER_NOT_FOUND_CLOSE_TO_6864: " + handlerHit.line);
}

const beforeLines = beforeSrc.split(/\r?\n/);

let conditionLine = handlerHit.line;
for (let line = handlerHit.line; line >= Math.max(1, handlerHit.line - 25); line -= 1) {
  const textWindow = beforeLines.slice(line - 1, Math.min(beforeLines.length, line + 8)).join("\n");
  if (textWindow.includes(action) && /\b(?:if|else\s+if)\s*\(/.test(textWindow)) {
    conditionLine = line;
    break;
  }
}

const conditionStartIndex = indexAtLine(src, conditionLine);
const openBraceIndex = src.indexOf("{", conditionStartIndex);
if (openBraceIndex < 0 || openBraceIndex > handlerHit.idx + 1600) {
  throw new Error("HANDLER_BRANCH_OPEN_BRACE_NOT_FOUND_NEAR_KNOWN_LINE");
}

const closeBraceIndex = matchBrace(src, openBraceIndex);
if (closeBraceIndex < 0) {
  throw new Error("HANDLER_BRANCH_CLOSE_BRACE_NOT_FOUND");
}

const branchBefore = src.slice(conditionStartIndex, closeBraceIndex + 1);
const branchStartLine = lineNoAtIndex(src, conditionStartIndex);
const branchEndLine = lineNoAtIndex(src, closeBraceIndex);

if (!branchBefore.includes(action)) {
  throw new Error("BRANCH_DOES_NOT_INCLUDE_TARGET_ACTION");
}

const suspectedLeaderAutoFill =
  /leaderLabel\s*[:=]/.test(branchBefore) ||
  /leader_label\s*[:=]/.test(branchBefore) ||
  /assigned_leader_label\s*[:=]/.test(branchBefore) ||
  /leaderPlacementId\s*[:=]/.test(branchBefore) ||
  /leader_placement_id\s*[:=]/.test(branchBefore) ||
  /assigned_leader_placement_id\s*[:=]/.test(branchBefore) ||
  /placementId\s*[:=]/.test(branchBefore) ||
  /placement_id\s*[:=]/.test(branchBefore) ||
  /Leader/.test(branchBefore);

if (!suspectedLeaderAutoFill) {
  throw new Error("LEADER_AUTOFILL_NOT_FOUND_IN_KNOWN_HANDLER_BRANCH");
}

const branchLines = branchBefore.split(/\r?\n/);

let insertLine = -1;
for (let i = 0; i < branchLines.length; i += 1) {
  if (
    branchLines[i].includes("aicmR8zMgrMajorCardRerender") ||
    branchLines[i].includes("MgrMajorCardRerender") ||
    branchLines[i].includes("Rerender(")
  ) {
    insertLine = i;
    break;
  }
}

if (insertLine < 0) {
  for (let i = branchLines.length - 1; i >= 0; i -= 1) {
    if (/^\s*return\b/.test(branchLines[i])) {
      insertLine = i;
      break;
    }
  }
}

if (insertLine < 0) insertLine = Math.max(1, branchLines.length - 1);

const indentMatch = (branchLines[insertLine] || "").match(/^(\s*)/);
const indent = indentMatch ? indentMatch[1] : "    ";

const clearBlock = [
indent + "// " + marker + "_START",
indent + "// Section apply must not auto-confirm Leader. Leader is confirmed only by the dedicated Leader apply action.",
indent + "(function aicmC2fD2bR2aClearLeaderAfterSectionApply() {",
indent + "  var targets = [];",
indent + "  if (typeof aicmR8zMgrMajorCardSelectionState === \"function\") {",
indent + "    try {",
indent + "      var selectionState = aicmR8zMgrMajorCardSelectionState();",
indent + "      if (selectionState && typeof selectionState === \"object\") targets.push(selectionState);",
indent + "    } catch (_) {}",
indent + "  }",
indent + "  if (typeof state !== \"undefined\" && state && typeof state === \"object\") {",
indent + "    if (state.r8zMgrMajorCardSelection && typeof state.r8zMgrMajorCardSelection === \"object\") targets.push(state.r8zMgrMajorCardSelection);",
indent + "    if (state.r8zMgrMajorCardSelectionState && typeof state.r8zMgrMajorCardSelectionState === \"object\") targets.push(state.r8zMgrMajorCardSelectionState);",
indent + "  }",
indent + "  for (var i = 0; i < targets.length; i += 1) {",
indent + "    var target = targets[i];",
indent + "    if (!target || typeof target !== \"object\") continue;",
indent + "    var route = target.handoffBatchRoute;",
indent + "    if (!route || typeof route !== \"object\") continue;",
indent + "    route.leaderLabel = \"\";",
indent + "    route.leader_label = \"\";",
indent + "    route.assigned_leader_label = \"\";",
indent + "    route.leaderName = \"\";",
indent + "    route.leader_name = \"\";",
indent + "    route.leaderPlacementId = \"\";",
indent + "    route.leader_placement_id = \"\";",
indent + "    route.assigned_leader_placement_id = \"\";",
indent + "    route.placementId = \"\";",
indent + "    route.placement_id = \"\";",
indent + "    route.leader = null;",
indent + "    route.assignedLeader = null;",
indent + "    route.leaderApplied = false;",
indent + "    route.leader_applied = false;",
indent + "    route.applied = false;",
indent + "    route.applied_flag = false;",
indent + "    route.appliedLabel = \"未適用\";",
indent + "    route.applied_label = \"未適用\";",
indent + "  }",
indent + "}());",
indent + "// " + marker + "_END"
].join("\n");

branchLines.splice(insertLine, 0, clearBlock);
const branchAfter = branchLines.join("\n");

src = src.slice(0, conditionStartIndex) + branchAfter + src.slice(closeBraceIndex + 1);
fs.writeFileSync(corePath, src);

const afterSrc = src;

const insertedNetworkCount =
  count(clearBlock, "fetch" + "(") +
  count(clearBlock, "XMLHttpRequest");

const insertedDebugUiCount =
  count(clearBlock, "<button") +
  count(clearBlock, "debug") +
  count(clearBlock, "Debug");

const actionCountBefore = count(beforeSrc, action);
const actionCountAfter = count(afterSrc, action);

const verify = [];
verify.push("AICompanyManager V10L-C2F-D2B-R2A verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("SERVER_PATCH=NO");
verify.push("CORE_PATCH=YES");
verify.push("");
verify.push("TARGET_ACTION=" + action);
verify.push("KNOWN_HANDLER_OCCURRENCE_LINE=" + handlerHit.line);
verify.push("CONDITION_LINE=" + conditionLine);
verify.push("HANDLER_BRANCH_LINE_BEFORE_PATCH=" + branchStartLine);
verify.push("HANDLER_BRANCH_END_LINE_BEFORE_PATCH=" + branchEndLine);
verify.push("ACTION_COUNT_BEFORE=" + actionCountBefore);
verify.push("ACTION_COUNT_AFTER=" + actionCountAfter);
verify.push("C2F_D2B_R2A_MARKER_TOTAL_COUNT=" + count(afterSrc, marker));
verify.push("C2F_D2B_R2A_START_COUNT=" + count(afterSrc, marker + "_START"));
verify.push("C2F_D2B_R2A_END_COUNT=" + count(afterSrc, marker + "_END"));
verify.push("C2F_D2_EXECUTE_GATE_MARKER_COUNT=" + count(afterSrc, d2Marker));
verify.push("C2F_B3_MARKER_COUNT=" + count(afterSrc, b3Marker));
verify.push("NETWORK_PATTERN_IN_CLEAR_BLOCK=" + insertedNetworkCount);
verify.push("DEBUG_UI_PATTERN_IN_CLEAR_BLOCK=" + insertedDebugUiCount);
verify.push("SECTION_APPLY_LABEL_COUNT=" + count(afterSrc, "課を適用"));
verify.push("LEADER_APPLY_LABEL_COUNT=" + count(afterSrc, "Leaderを適用"));
verify.push("ROUTE_UI_LABEL_COUNT=" + count(afterSrc, "一括引き渡し先"));
verify.push("CLEAR_LEADER_ASSIGNMENT_COUNT=" + (
  count(clearBlock, "route.leaderLabel = \"\"") +
  count(clearBlock, "route.leader_placement_id = \"\"") +
  count(clearBlock, "route.appliedLabel = \"未適用\"")
));
verify.push("PATCH_EXTRACT=" + patchExtractOut);
verify.push("BRANCH_EXTRACT=" + branchExtractOut);

if (actionCountBefore !== actionCountAfter) throw new Error("ACTION_COUNT_CHANGED");
if (count(afterSrc, marker) !== 2) throw new Error("D2B_R2A_MARKER_TOTAL_COUNT_NOT_2");
if (count(afterSrc, marker + "_START") !== 1) throw new Error("D2B_R2A_START_COUNT_NOT_1");
if (count(afterSrc, marker + "_END") !== 1) throw new Error("D2B_R2A_END_COUNT_NOT_1");
if (count(afterSrc, d2Marker) !== 2) throw new Error("D2_EXECUTE_GATE_MARKER_COUNT_CHANGED");
if (count(afterSrc, b3Marker) !== 0) throw new Error("C2F_B3_MARKER_RETURNED");
if (insertedNetworkCount !== 0) throw new Error("NETWORK_PATTERN_FOUND_IN_CLEAR_BLOCK");
if (insertedDebugUiCount !== 0) throw new Error("DEBUG_UI_PATTERN_FOUND_IN_CLEAR_BLOCK");
if (count(afterSrc, "課を適用") < 1) throw new Error("SECTION_APPLY_UI_MISSING");
if (count(afterSrc, "Leaderを適用") < 1) throw new Error("LEADER_APPLY_UI_MISSING");

fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

const beforeWindow = makeLineWindow(beforeSrc, branchStartLine, 0, Math.min(240, branchEndLine - branchStartLine + 80));
const afterWindow = makeLineWindow(afterSrc, branchStartLine, 0, Math.min(320, branchEndLine - branchStartLine + 150));

fs.writeFileSync(branchExtractOut, [
  "AICompanyManager V10L-C2F-D2B-R2A handler branch extract",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=YES",
  "SERVER_PATCH=NO",
  "",
  "TARGET_ACTION=" + action,
  "KNOWN_HANDLER_OCCURRENCE_LINE=" + handlerHit.line,
  "HANDLER_BRANCH_LINE_BEFORE_PATCH=" + branchStartLine,
  "HANDLER_BRANCH_END_LINE_BEFORE_PATCH=" + branchEndLine,
  "",
  "BEFORE_BRANCH_WINDOW",
  "============================================================",
  beforeWindow.text,
  "",
  "AFTER_BRANCH_WINDOW",
  "============================================================",
  afterWindow.text,
  ""
].join("\n"));

fs.writeFileSync(patchExtractOut, [
  "AICompanyManager V10L-C2F-D2B-R2A patch extract",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=YES",
  "SERVER_PATCH=NO",
  "",
  "TARGET_ACTION=" + action,
  "KNOWN_HANDLER_OCCURRENCE_LINE=" + handlerHit.line,
  "INSERTION_POLICY=before existing rerender/return inside exact known handler branch only",
  "",
  "INSERTED_BLOCK",
  "============================================================",
  clearBlock,
  ""
].join("\n"));
