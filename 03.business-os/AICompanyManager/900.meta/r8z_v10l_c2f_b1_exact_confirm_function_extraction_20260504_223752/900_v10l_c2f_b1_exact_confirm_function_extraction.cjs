const fs = require("fs");

const [
  ,
  ,
  corePath,
  verifyOut,
  decisionOut,
  anchorOut,
  contextOut
] = process.argv;

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\r?\n/);

function count(text, needle) {
  let c = 0;
  let from = 0;
  while (true) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) break;
    c++;
    from = idx + needle.length;
  }
  return c;
}

function lineNoAt(index) {
  return src.slice(0, index).split(/\r?\n/).length;
}

function lineText(lineNo) {
  return lines[lineNo - 1] || "";
}

function findAllNeedle(needle) {
  const out = [];
  let from = 0;
  while (true) {
    const idx = src.indexOf(needle, from);
    if (idx < 0) break;
    out.push({ needle, index: idx, line: lineNoAt(idx), text: lineText(lineNoAt(idx)) });
    from = idx + needle.length;
  }
  return out;
}

function contextWindow(lineNo, before, after) {
  const start = Math.max(1, lineNo - before);
  const end = Math.min(lines.length, lineNo + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

const functionNeedles = [
  "function aicmR8zMgrMajorCardRenderConfirm",
  "aicmR8zMgrMajorCardRenderConfirm",
  "function aicmR8zMgrMajorCardHandleAction",
  "function aicmExecuteLeaderHandoffConfirmR8S",
  "function aicmR8ZNHtml",
  "function aicmR8ZCHtml"
];

const anchorNeedles = [
  "実行前チェック",
  "payload preview",
  "Payload preview",
  "POST未実行",
  "POST実行",
  "POST実行はロック",
  "r8z-mgr-major-card-close-handoff-confirm",
  "r8z-mgr-major-card-open-handoff-confirm",
  "manager-major/update",
  "/api/aicm/v2/manager-major/update",
  "handoffBatchRoute",
  "leaderPlacementId",
  "leaderLabel",
  "departmentLabel",
  "sectionLabel",
  "aicmR8zMgrMajorCardSelectedRows"
];

const allHits = [];
for (const n of functionNeedles.concat(anchorNeedles)) {
  allHits.push(...findAllNeedle(n));
}

allHits.sort((a, b) => a.line - b.line || a.index - b.index);

const anchorLines = [];
anchorLines.push("AICompanyManager V10L-C2F-B1 anchor scan");
anchorLines.push("DB_WRITE=NO");
anchorLines.push("API_POST=NO");
anchorLines.push("CORE_PATCH=NO");
anchorLines.push("SERVER_PATCH=NO");
anchorLines.push("");

for (const h of allHits) {
  anchorLines.push(`line=${h.line}; needle=${h.needle}; text=${h.text.trim().slice(0, 240)}`);
}
fs.writeFileSync(anchorOut, anchorLines.join("\n") + "\n");

const primaryHits = findAllNeedle("function aicmR8zMgrMajorCardRenderConfirm")
  .concat(findAllNeedle("aicmR8zMgrMajorCardRenderConfirm"));

const interestingLines = new Set();

for (const h of allHits) {
  if (
    h.line >= 6100 && h.line <= 7050 ||
    h.needle.includes("aicmR8zMgrMajorCardRenderConfirm") ||
    h.needle.includes("実行前チェック") ||
    h.needle.includes("payload preview")
  ) {
    interestingLines.add(h.line);
  }
}

const contextLines = [];
contextLines.push("AICompanyManager V10L-C2F-B1 confirm context extract");
contextLines.push("DB_WRITE=NO");
contextLines.push("API_POST=NO");
contextLines.push("CORE_PATCH=NO");
contextLines.push("SERVER_PATCH=NO");
contextLines.push("");

const sortedInteresting = Array.from(interestingLines).sort((a, b) => a - b);
const emitted = [];

for (const line of sortedInteresting) {
  if (emitted.some(r => line >= r.start && line <= r.end)) continue;
  const win = contextWindow(line, 35, 55);
  emitted.push({ start: win.start, end: win.end });

  contextLines.push("============================================================");
  contextLines.push(`WINDOW=${win.start}-${win.end}; CENTER=${line}`);
  contextLines.push("============================================================");
  contextLines.push(win.text);
  contextLines.push("");
}

fs.writeFileSync(contextOut, contextLines.join("\n") + "\n");

const renderConfirmLines = findAllNeedle("aicmR8zMgrMajorCardRenderConfirm");
const likelyDeclaration = renderConfirmLines.find(h => h.text.includes("function aicmR8zMgrMajorCardRenderConfirm")) || null;
const likelyRenderWindow = likelyDeclaration ? contextWindow(likelyDeclaration.line, 0, 160) : null;

const verify = [];
verify.push("AICompanyManager V10L-C2F-B1 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("RENDER_CONFIRM_NAME_COUNT=" + count(src, "aicmR8zMgrMajorCardRenderConfirm"));
verify.push("RENDER_CONFIRM_DECLARATION_FOUND=" + (likelyDeclaration ? "YES" : "NO"));
verify.push("RENDER_CONFIRM_DECLARATION_LINE=" + (likelyDeclaration ? String(likelyDeclaration.line) : "NONE"));
verify.push("PRECHECK_TEXT_COUNT=" + count(src, "実行前チェック"));
verify.push("PAYLOAD_PREVIEW_COUNT=" + count(src, "payload preview") + count(src, "Payload preview") + count(src, "payloadPreview"));
verify.push("HANDOFF_ROUTE_STATE_COUNT=" + count(src, "handoffBatchRoute"));
verify.push("LEADER_PLACEMENT_ID_COUNT=" + count(src, "leaderPlacementId") + count(src, "leader_placement_id"));
verify.push("ENDPOINT_UPDATE_COUNT=" + count(src, "/api/aicm/v2/manager-major/update") + count(src, "manager-major/update"));
verify.push("ANCHOR_SCAN=" + anchorOut);
verify.push("CONTEXT_EXTRACT=" + contextOut);
fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

const decision = [];
decision.push("AICompanyManager V10L-C2F-B1 decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=CONFIRM_FUNCTION_ANCHORS_EXTRACTED_PATCH_NOT_APPLIED");
decision.push("RENDER_CONFIRM_DECLARATION_LINE=" + (likelyDeclaration ? String(likelyDeclaration.line) : "NONE"));
decision.push("");
decision.push("RECOMMENDED_NEXT");
decision.push("- Do not use generic brace parser for this function.");
decision.push("- Use exact anchor-based insertion near the first executable line after the declaration, or use a narrow string anchor inside the existing confirm HTML.");
decision.push("- Prefer C2F-B2 as read-only extraction of the first 180 lines from declaration.");
decision.push("- If patching, patch by exact line-window replacement validated against context extract, not whole function replacement.");
decision.push("- Do not enable API POST.");
decision.push("- Do not touch server/API/DB route.");
decision.push("");
decision.push("NEXT=V10L-C2F-B2_CONFIRM_RENDER_EXACT_WINDOW_PATCH_OR_AUDIT");
fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
