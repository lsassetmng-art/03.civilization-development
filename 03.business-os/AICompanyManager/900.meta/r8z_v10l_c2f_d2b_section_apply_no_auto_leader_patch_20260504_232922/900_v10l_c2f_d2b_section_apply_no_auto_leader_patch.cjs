const fs = require("fs");

const [,, corePath, verifyOut, patchExtractOut, functionExtractOut] = process.argv;
let src = fs.readFileSync(corePath, "utf8");

const marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2B_SECTION_APPLY_NO_AUTO_LEADER";
const targetName = "aicmR8zC2cApplySectionRoute";

function count(text, needle) {
  let c = 0;
  let from = 0;
  while (true) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) break;
    c += 1;
    from = idx + needle.length;
  }
}

function count2(text, needle) {
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

function lineWindow(lines, centerLine, before, after) {
  const start = Math.max(1, centerLine - before);
  const end = Math.min(lines.length, centerLine + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

if (count2(src, marker) > 0) {
  throw new Error("C2F_D2B_MARKER_ALREADY_EXISTS");
}

const lines = src.split(/\r?\n/);
const declCandidates = [
  "function " + targetName,
  "const " + targetName + " =",
  "let " + targetName + " =",
  "var " + targetName + " =",
  targetName + " = function"
];

let declIndex = -1;
let declNeedle = "";

for (const needle of declCandidates) {
  const idx = src.indexOf(needle);
  if (idx >= 0 && (declIndex < 0 || idx < declIndex)) {
    declIndex = idx;
    declNeedle = needle;
  }
}

if (declIndex < 0) {
  throw new Error("TARGET_FUNCTION_DECLARATION_NOT_FOUND: " + targetName);
}

const declLine = lineNoAtIndex(src, declIndex);

/*
  保守性優先:
  - generic brace parserは使わない
  - 対象関数宣言行から、次の function/const関数宣言/主要関数宣言までの限定windowだけを対象
  - そのwindow内に section/department/leader があることを検証
*/
let nextIndex = src.length;
const after = src.slice(declIndex + declNeedle.length);
const nextPatterns = [
  /\nfunction\s+[A-Za-z0-9_$]+\s*\(/g,
  /\nconst\s+[A-Za-z0-9_$]+\s*=\s*(?:async\s*)?(?:function|\()/g,
  /\nlet\s+[A-Za-z0-9_$]+\s*=\s*(?:async\s*)?(?:function|\()/g,
  /\nvar\s+[A-Za-z0-9_$]+\s*=\s*(?:async\s*)?(?:function|\()/g
];

for (const re of nextPatterns) {
  const m = re.exec(after);
  if (m && m.index >= 0) {
    const candidate = declIndex + declNeedle.length + m.index;
    if (candidate > declIndex && candidate < nextIndex) nextIndex = candidate;
  }
}

let fnText = src.slice(declIndex, nextIndex);
const fnStartLine = declLine;
const fnEndLine = lineNoAtIndex(src, nextIndex);

if (fnText.length < 80) {
  throw new Error("TARGET_FUNCTION_WINDOW_TOO_SHORT");
}

if (!/section|課/i.test(fnText)) {
  throw new Error("TARGET_FUNCTION_DOES_NOT_LOOK_SECTION_RELATED");
}

if (!/leader|Leader/.test(fnText)) {
  throw new Error("TARGET_FUNCTION_HAS_NO_LEADER_LOGIC_TO_NEUTRALIZE");
}

const beforeFnText = fnText;

const leaderKeys = [
  "leaderLabel",
  "leader_label",
  "assigned_leader_label",
  "leaderName",
  "leader_name",
  "leaderPlacementId",
  "leader_placement_id",
  "assigned_leader_placement_id",
  "placementId",
  "placement_id"
];

let replacements = [];

/*
  方針:
  課適用関数内だけで、Leader系の値を「既存値から補完/自動設定」する行を無効化する。
  ただし関数全体置換はしない。
  具体的には、Leader系 key を持つ object literal property / assignment を
  空値へ寄せる。
*/
function replaceAndTrack(re, replacement, label) {
  const before = fnText;
  fnText = fnText.replace(re, (...args) => {
    const matched = args[0];
    replacements.push({ label, matched });
    return typeof replacement === "function" ? replacement(...args) : replacement;
  });
  return before !== fnText;
}

/*
  object literal property:
    leaderLabel: something,
    leader_placement_id: something,
*/
for (const key of leaderKeys) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  replaceAndTrack(
    new RegExp("(\\b" + escaped + "\\s*:\\s*)([^,}\\n]+)", "g"),
    "$1\"\"",
    "object_property_clear_" + key
  );

  /*
    assignment:
      route.leaderLabel = ...
      something["leaderLabel"] = ...
  */
  replaceAndTrack(
    new RegExp("((?:[A-Za-z0-9_$\\.\\]\\[\"']+\\.)?" + escaped + "\\s*=\\s*)([^;\\n]+)", "g"),
    "$1\"\"",
    "assignment_clear_" + key
  );

  replaceAndTrack(
    new RegExp("((?:[A-Za-z0-9_$\\.]+\\[[\"']" + escaped + "[\"']\\]\\s*=\\s*))([^;\\n]+)", "g"),
    "$1\"\"",
    "bracket_assignment_clear_" + key
  );
}

/*
  念押し:
  課適用が route.applied=true を立てていた場合、Leader未設定なのに適用済みになると混乱する。
  ただし section適用自体は「部門/課適用済み」として扱いたい既存UIがある可能性があるため、
  applied自体は触らない。
*/

/*
  追跡用markerを関数window内の直後にコメントだけ追加。
  debug UIではない。削除しやすい境界。
*/
const markerComment = [
  "",
  "  // " + marker + "_START",
  "  // Section apply must not auto-apply Leader.",
  "  // Leader is confirmed only by the dedicated Leader apply action.",
  "  // This marker documents the constrained D2B section-route change.",
  "  // " + marker + "_END"
].join("\n");

if (!fnText.includes(marker)) {
  const firstNewline = fnText.indexOf("\n");
  if (firstNewline < 0) throw new Error("FUNCTION_INSERT_ANCHOR_NOT_FOUND");
  fnText = fnText.slice(0, firstNewline + 1) + markerComment + "\n" + fnText.slice(firstNewline + 1);
}

if (replacements.length < 1) {
  throw new Error("NO_LEADER_ASSIGNMENT_REPLACED_IN_SECTION_APPLY_FUNCTION");
}

src = src.slice(0, declIndex) + fnText + src.slice(nextIndex);
fs.writeFileSync(corePath, src);

const afterLines = src.split(/\r?\n/);
const beforeWindow = lineWindow(lines, fnStartLine, 0, Math.min(220, fnEndLine - fnStartLine + 20));
const afterWindow = lineWindow(afterLines, fnStartLine, 0, Math.min(260, fnEndLine - fnStartLine + 70));

fs.writeFileSync(functionExtractOut, [
  "AICompanyManager V10L-C2F-D2B target function extract",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=YES",
  "SERVER_PATCH=NO",
  "",
  "TARGET_FUNCTION=" + targetName,
  "DECLARATION_LINE=" + fnStartLine,
  "WINDOW_END_LINE_BEFORE_PATCH=" + fnEndLine,
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

const extract = [];
extract.push("AICompanyManager V10L-C2F-D2B patch extract");
extract.push("DB_WRITE=NO");
extract.push("API_POST=NO");
extract.push("CORE_PATCH=YES");
extract.push("SERVER_PATCH=NO");
extract.push("");
extract.push("TARGET_FUNCTION=" + targetName);
extract.push("DECLARATION_LINE=" + fnStartLine);
extract.push("REPLACEMENT_COUNT=" + replacements.length);
extract.push("");
extract.push("REPLACEMENTS");
for (const r of replacements) {
  extract.push("- " + r.label + ": " + r.matched.slice(0, 260));
}
fs.writeFileSync(patchExtractOut, extract.join("\n") + "\n");

const afterFnLeaderAutoScore =
  count2(fnText, "leaderLabel: \"\"") +
  count2(fnText, "leader_placement_id: \"\"") +
  count2(fnText, "leaderPlacementId: \"\"") +
  count2(fnText, "assigned_leader_label: \"\"");

const insertedNetworkCount =
  count2(fnText, "fetch(") - count2(beforeFnText, "fetch(") +
  count2(fnText, "XMLHttpRequest") - count2(beforeFnText, "XMLHttpRequest");

const d2MarkerCount = count2(src, "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE");
const d2bMarkerCount = count2(src, marker);
const b3MarkerCount = count2(src, "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE");

const verify = [];
verify.push("AICompanyManager V10L-C2F-D2B verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("SERVER_PATCH=NO");
verify.push("CORE_PATCH=YES");
verify.push("");
verify.push("TARGET_FUNCTION=" + targetName);
verify.push("TARGET_FUNCTION_FOUND=YES");
verify.push("DECLARATION_LINE=" + fnStartLine);
verify.push("FUNCTION_WINDOW_END_LINE_BEFORE_PATCH=" + fnEndLine);
verify.push("REPLACEMENT_COUNT=" + replacements.length);
verify.push("C2F_D2B_MARKER_TOTAL_COUNT=" + d2bMarkerCount);
verify.push("C2F_D2B_START_COUNT=" + count2(src, marker + "_START"));
verify.push("C2F_D2B_END_COUNT=" + count2(src, marker + "_END"));
verify.push("SECTION_APPLY_LEADER_EMPTY_ASSIGNMENT_SCORE=" + afterFnLeaderAutoScore);
verify.push("NETWORK_PATTERN_DELTA_IN_TARGET_FUNCTION=" + insertedNetworkCount);
verify.push("C2F_D2_EXECUTE_GATE_MARKER_COUNT=" + d2MarkerCount);
verify.push("C2F_B3_MARKER_COUNT=" + b3MarkerCount);
verify.push("SECTION_APPLY_LABEL_COUNT=" + count2(src, "課を適用"));
verify.push("LEADER_APPLY_LABEL_COUNT=" + count2(src, "Leaderを適用"));
verify.push("ROUTE_UI_LABEL_COUNT=" + count2(src, "一括引き渡し先"));
verify.push("FUNCTION_EXTRACT=" + functionExtractOut);
verify.push("PATCH_EXTRACT=" + patchExtractOut);

if (d2bMarkerCount !== 2) throw new Error("C2F_D2B_MARKER_TOTAL_COUNT_NOT_2");
if (count2(src, marker + "_START") !== 1) throw new Error("C2F_D2B_START_COUNT_NOT_1");
if (count2(src, marker + "_END") !== 1) throw new Error("C2F_D2B_END_COUNT_NOT_1");
if (insertedNetworkCount !== 0) throw new Error("NETWORK_PATTERN_DELTA_DETECTED_IN_TARGET_FUNCTION");
if (d2MarkerCount !== 2) throw new Error("C2F_D2_EXECUTE_GATE_MARKER_COUNT_CHANGED");
if (b3MarkerCount !== 0) throw new Error("C2F_B3_MARKER_RETURNED");
if (count2(src, "課を適用") < 1) throw new Error("SECTION_APPLY_UI_MISSING");
if (count2(src, "Leaderを適用") < 1) throw new Error("LEADER_APPLY_UI_MISSING");

fs.writeFileSync(verifyOut, verify.join("\n") + "\n");
