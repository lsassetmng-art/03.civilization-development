const fs = require("fs");

const [,, corePath, verifyOut, patchExtractOut, focusExtractOut] = process.argv;

const beforeSrc = fs.readFileSync(corePath, "utf8");
let src = beforeSrc;

const marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2B_R3_SECTION_APPLY_CLEAR_AUTO_LEADER";
const d2Marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE";
const b3Marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE";
const actionSection = "r8z-mgr-major-card-route-apply-section";
const actionLeader = "r8z-mgr-major-card-route-apply-leader";
const targetNeedle = "route.leaderPlacementId = leaderPlacementId;";

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

function makeLineWindow(text, centerLine, before, after) {
  const lines = text.split(/\r?\n/);
  const start = Math.max(1, centerLine - before);
  const end = Math.min(lines.length, centerLine + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

if (count(src, marker) > 0) {
  throw new Error("C2F_D2B_R3_MARKER_ALREADY_EXISTS");
}

const hits = [];
let from = 0;
while (true) {
  const idx = src.indexOf(targetNeedle, from);
  if (idx < 0) break;
  hits.push({ idx, line: lineNoAtIndex(src, idx) });
  from = idx + targetNeedle.length;
}

const targetHits = hits.filter(h => h.line >= 6500 && h.line <= 6750);

if (targetHits.length !== 1) {
  throw new Error("TARGET_ROUTE_LEADER_PLACEMENT_ASSIGNMENT_COUNT_NOT_1_IN_RANGE: " + targetHits.map(h => h.line).join(","));
}

const target = targetHits[0];
const targetLine = target.line;
const lineStart = src.lastIndexOf("\n", target.idx) + 1;

const beforeWindow = makeLineWindow(src, targetLine, 18, 28);
const surrounding = beforeWindow.text;

if (!surrounding.includes("route.sectionId = sectionId;")) {
  throw new Error("SURROUNDING_SECTION_ASSIGNMENT_NOT_FOUND");
}
if (!surrounding.includes("route.departmentId = departmentId;")) {
  throw new Error("SURROUNDING_DEPARTMENT_ASSIGNMENT_NOT_FOUND");
}
if (!surrounding.includes("route.leaderLabel = leaderLabel;")) {
  throw new Error("SURROUNDING_LEADER_ASSIGNMENT_NOT_FOUND");
}

const lineText = src.split(/\r?\n/)[targetLine - 1] || "";
const indentMatch = lineText.match(/^(\s*)/);
const indent = indentMatch ? indentMatch[1] : "            ";

const clearBlock = [
  indent + "// " + marker + "_START",
  indent + "// Section apply must not auto-confirm Leader. Leader is confirmed only by the dedicated Leader apply action.",
  indent + "leaderPlacementId = \"\";",
  indent + "leaderLabel = \"\";",
  indent + "// " + marker + "_END"
].join("\n") + "\n";

const insertedNetworkCount =
  count(clearBlock, "fetch" + "(") +
  count(clearBlock, "XMLHttpRequest");

const insertedDebugUiCount =
  count(clearBlock, "<button") +
  count(clearBlock, "debug") +
  count(clearBlock, "Debug");

if (insertedNetworkCount !== 0) {
  throw new Error("NETWORK_PATTERN_IN_INSERTED_BLOCK");
}
if (insertedDebugUiCount !== 0) {
  throw new Error("DEBUG_UI_PATTERN_IN_INSERTED_BLOCK");
}

src = src.slice(0, lineStart) + clearBlock + src.slice(lineStart);
fs.writeFileSync(corePath, src);

const afterSrc = src;
const afterTargetLine = lineNoAtIndex(afterSrc, afterSrc.indexOf(targetNeedle));
const afterWindow = makeLineWindow(afterSrc, afterTargetLine, 24, 36);

if (count(afterSrc, marker) !== 2) {
  throw new Error("C2F_D2B_R3_MARKER_TOTAL_COUNT_NOT_2");
}
if (count(afterSrc, marker + "_START") !== 1) {
  throw new Error("C2F_D2B_R3_START_COUNT_NOT_1");
}
if (count(afterSrc, marker + "_END") !== 1) {
  throw new Error("C2F_D2B_R3_END_COUNT_NOT_1");
}
if (count(afterSrc, d2Marker) !== 2) {
  throw new Error("D2_EXECUTE_GATE_MARKER_COUNT_CHANGED");
}
if (count(afterSrc, b3Marker) !== 0) {
  throw new Error("B3_MARKER_RETURNED");
}
if (count(afterSrc, actionSection) !== count(beforeSrc, actionSection)) {
  throw new Error("SECTION_ACTION_COUNT_CHANGED");
}
if (count(afterSrc, actionLeader) !== count(beforeSrc, actionLeader)) {
  throw new Error("LEADER_ACTION_COUNT_CHANGED");
}

const verify = [];
verify.push("AICompanyManager V10L-C2F-D2B-R3 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("SERVER_PATCH=NO");
verify.push("CORE_PATCH=YES");
verify.push("");
verify.push("TARGET_NEEDLE=" + targetNeedle);
verify.push("TARGET_LINE_BEFORE_PATCH=" + targetLine);
verify.push("TARGET_LINE_AFTER_PATCH=" + afterTargetLine);
verify.push("C2F_D2B_R3_MARKER_TOTAL_COUNT=" + count(afterSrc, marker));
verify.push("C2F_D2B_R3_START_COUNT=" + count(afterSrc, marker + "_START"));
verify.push("C2F_D2B_R3_END_COUNT=" + count(afterSrc, marker + "_END"));
verify.push("C2F_D2_EXECUTE_GATE_MARKER_COUNT=" + count(afterSrc, d2Marker));
verify.push("C2F_B3_MARKER_COUNT=" + count(afterSrc, b3Marker));
verify.push("SECTION_ACTION_COUNT_BEFORE=" + count(beforeSrc, actionSection));
verify.push("SECTION_ACTION_COUNT_AFTER=" + count(afterSrc, actionSection));
verify.push("LEADER_ACTION_COUNT_BEFORE=" + count(beforeSrc, actionLeader));
verify.push("LEADER_ACTION_COUNT_AFTER=" + count(afterSrc, actionLeader));
verify.push("NETWORK_PATTERN_IN_INSERTED_BLOCK=" + insertedNetworkCount);
verify.push("DEBUG_UI_PATTERN_IN_INSERTED_BLOCK=" + insertedDebugUiCount);
verify.push("SECTION_APPLY_LABEL_COUNT=" + count(afterSrc, "課を適用"));
verify.push("LEADER_APPLY_LABEL_COUNT=" + count(afterSrc, "Leaderを適用"));
verify.push("CLEAR_LEADER_BEFORE_ROUTE_ASSIGNMENT_COUNT=" + count(afterSrc, "leaderPlacementId = \"\";"));
verify.push("CLEAR_LEADER_LABEL_BEFORE_ROUTE_ASSIGNMENT_COUNT=" + count(afterSrc, "leaderLabel = \"\";"));
verify.push("PATCH_EXTRACT=" + patchExtractOut);
verify.push("FOCUS_EXTRACT=" + focusExtractOut);
fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

fs.writeFileSync(patchExtractOut, [
  "AICompanyManager V10L-C2F-D2B-R3 patch extract",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=YES",
  "SERVER_PATCH=NO",
  "",
  "TARGET_LINE_BEFORE_PATCH=" + targetLine,
  "INSERTION_POLICY=insert clear block immediately before route.leaderPlacementId assignment",
  "",
  "INSERTED_BLOCK",
  "============================================================",
  clearBlock,
  ""
].join("\n"));

fs.writeFileSync(focusExtractOut, [
  "AICompanyManager V10L-C2F-D2B-R3 focus extract",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=YES",
  "SERVER_PATCH=NO",
  "",
  "BEFORE_WINDOW",
  "============================================================",
  beforeWindow.text,
  "",
  "AFTER_WINDOW",
  "============================================================",
  afterWindow.text,
  ""
].join("\n"));
