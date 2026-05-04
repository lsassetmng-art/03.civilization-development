const fs = require("fs");

const [
  ,
  ,
  corePath,
  verifyOut,
  decisionOut,
  windowOut,
  anchorOut,
  planOut
] = process.argv;

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\r?\n/);

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

function lineNoAtIndex(index) {
  return src.slice(0, index).split(/\r?\n/).length;
}

function findAll(needle) {
  const out = [];
  let from = 0;
  while (true) {
    const idx = src.indexOf(needle, from);
    if (idx < 0) break;
    const line = lineNoAtIndex(idx);
    out.push({
      needle,
      index: idx,
      line,
      text: lines[line - 1] || ""
    });
    from = idx + needle.length;
  }
  return out;
}

function exactWindow(startLine, endLine) {
  const start = Math.max(1, startLine);
  const end = Math.min(lines.length, endLine);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

const declNeedle = "function aicmR8zMgrMajorCardRenderConfirm";
const declHits = findAll(declNeedle);
const decl = declHits[0] || null;

const verify = [];
const decision = [];
const anchors = [];
const plan = [];

if (!decl) {
  verify.push("AICompanyManager V10L-C2F-B2 verify");
  verify.push("DB_WRITE=NO");
  verify.push("API_POST=NO");
  verify.push("CORE_PATCH=NO");
  verify.push("SERVER_PATCH=NO");
  verify.push("");
  verify.push("RENDER_CONFIRM_DECLARATION_FOUND=NO");
  fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

  decision.push("AICompanyManager V10L-C2F-B2 decision");
  decision.push("CONCLUSION=DECLARATION_NOT_FOUND_PATCH_PROHIBITED");
  fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
  process.exit(2);
}

const declLine = decl.line;
const window = exactWindow(declLine, declLine + 220);

fs.writeFileSync(windowOut, [
  "AICompanyManager V10L-C2F-B2 exact confirm render window",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=NO",
  "SERVER_PATCH=NO",
  "",
  "DECLARATION_LINE=" + declLine,
  "WINDOW=" + window.start + "-" + window.end,
  "============================================================",
  window.text,
  ""
].join("\n"));

const anchorNeedles = [
  "function aicmR8zMgrMajorCardRenderConfirm",
  "実行前チェック",
  "payload preview",
  "Payload preview",
  "POST未実行",
  "POST実行",
  "POST実行はロック",
  "return [",
  "].join",
  "join('')",
  "join(\"\")",
  "r8z-mgr-major-card-close-handoff-confirm",
  "r8z-mgr-major-card-open-handoff-confirm",
  "handoffBatchRoute",
  "leaderPlacementId",
  "leader_placement_id",
  "leaderLabel",
  "departmentLabel",
  "sectionLabel",
  "aicmR8zMgrMajorCardSelectedRows",
  "manager_major_item_id",
  "managerMajorItemId"
];

const anchorHits = [];
for (const needle of anchorNeedles) {
  for (const hit of findAll(needle)) {
    if (hit.line >= declLine && hit.line <= declLine + 220) {
      anchorHits.push(hit);
    }
  }
}

anchorHits.sort((a, b) => a.line - b.line || a.index - b.index);

anchors.push("AICompanyManager V10L-C2F-B2 patch anchor candidates");
anchors.push("DB_WRITE=NO");
anchors.push("API_POST=NO");
anchors.push("CORE_PATCH=NO");
anchors.push("SERVER_PATCH=NO");
anchors.push("");
anchors.push("DECLARATION_LINE=" + declLine);
anchors.push("ANCHOR_WINDOW=" + declLine + "-" + (declLine + 220));
anchors.push("");

for (const hit of anchorHits) {
  anchors.push(`line=${hit.line}; needle=${hit.needle}; text=${hit.text.trim().slice(0, 260)}`);
}

fs.writeFileSync(anchorOut, anchors.join("\n") + "\n");

const windowText = window.text;

const firstReturnArray = anchorHits.find(h => h.needle === "return [") || null;
const firstPrecheck = anchorHits.find(h => h.needle === "実行前チェック") || null;
const firstPayload = anchorHits.find(h => h.needle === "payload preview" || h.needle === "Payload preview") || null;
const firstCloseAction = anchorHits.find(h => h.needle === "r8z-mgr-major-card-close-handoff-confirm") || null;
const firstSelectedRows = anchorHits.find(h => h.needle === "aicmR8zMgrMajorCardSelectedRows") || null;
const firstRouteState = anchorHits.find(h => h.needle === "handoffBatchRoute") || null;

const exactAnchorCandidates = [];

if (firstReturnArray) {
  exactAnchorCandidates.push({
    name: "BEFORE_FIRST_RETURN_ARRAY",
    line: firstReturnArray.line,
    reason: "confirm renderer likely returns HTML array from here"
  });
}

if (firstPrecheck) {
  exactAnchorCandidates.push({
    name: "AROUND_PRECHECK_TEXT",
    line: firstPrecheck.line,
    reason: "existing precheck UI text anchor"
  });
}

if (firstPayload) {
  exactAnchorCandidates.push({
    name: "AROUND_PAYLOAD_PREVIEW",
    line: firstPayload.line,
    reason: "existing payload preview anchor"
  });
}

if (firstCloseAction) {
  exactAnchorCandidates.push({
    name: "BEFORE_CLOSE_ACTION_BLOCK",
    line: firstCloseAction.line,
    reason: "safe locked panel can include only close/back action"
  });
}

plan.push("AICompanyManager V10L-C2F-B2 C2F-B3 patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("DECLARATION_LINE=" + declLine);
plan.push("");
plan.push("PATCH_CONSTRAINTS");
plan.push("- Do not parse whole function braces.");
plan.push("- Do not replace whole function.");
plan.push("- Do not wrap h or confirm renderer.");
plan.push("- Do not enable API POST.");
plan.push("- Do not touch server/API/DB route.");
plan.push("- Patch only by exact line/window anchor.");
plan.push("- Patch must restore backup on node --check failure.");
plan.push("");
plan.push("EXACT_ANCHOR_CANDIDATES");
for (const c of exactAnchorCandidates) {
  plan.push(`- ${c.name}: line=${c.line}; reason=${c.reason}`);
}
plan.push("");
plan.push("RECOMMENDED_C2F_B3");
if (firstReturnArray) {
  plan.push("- Insert a small early validation block immediately before the first return-array of aicmR8zMgrMajorCardRenderConfirm.");
  plan.push("- The inserted block may return locked HTML only when missing values exist.");
  plan.push("- When values are complete, it must fall through to existing confirm renderer.");
} else {
  plan.push("- First return-array anchor not found in window. Do not patch yet; inspect CONTEXT manually.");
}
plan.push("");
plan.push("FILES");
plan.push("- WINDOW_OUT=" + windowOut);
plan.push("- ANCHOR_OUT=" + anchorOut);

fs.writeFileSync(planOut, plan.join("\n") + "\n");

verify.push("AICompanyManager V10L-C2F-B2 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("RENDER_CONFIRM_DECLARATION_FOUND=YES");
verify.push("RENDER_CONFIRM_DECLARATION_LINE=" + declLine);
verify.push("EXACT_WINDOW_START=" + window.start);
verify.push("EXACT_WINDOW_END=" + window.end);
verify.push("ANCHOR_HIT_COUNT=" + anchorHits.length);
verify.push("FIRST_RETURN_ARRAY_LINE=" + (firstReturnArray ? String(firstReturnArray.line) : "NONE"));
verify.push("FIRST_PRECHECK_LINE=" + (firstPrecheck ? String(firstPrecheck.line) : "NONE"));
verify.push("FIRST_PAYLOAD_PREVIEW_LINE=" + (firstPayload ? String(firstPayload.line) : "NONE"));
verify.push("FIRST_CLOSE_ACTION_LINE=" + (firstCloseAction ? String(firstCloseAction.line) : "NONE"));
verify.push("FIRST_SELECTED_ROWS_LINE=" + (firstSelectedRows ? String(firstSelectedRows.line) : "NONE"));
verify.push("FIRST_ROUTE_STATE_LINE=" + (firstRouteState ? String(firstRouteState.line) : "NONE"));
verify.push("PATCHABLE_BY_EXACT_RETURN_ANCHOR=" + (firstReturnArray ? "YES" : "NO"));
verify.push("GENERIC_BRACE_PARSER_USED=NO");
verify.push("WINDOW_OUT=" + windowOut);
verify.push("ANCHOR_OUT=" + anchorOut);
verify.push("PLAN_OUT=" + planOut);

fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

decision.push("AICompanyManager V10L-C2F-B2 decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=CONFIRM_RENDER_EXACT_WINDOW_EXTRACTED_PATCH_NOT_APPLIED");
decision.push("RENDER_CONFIRM_DECLARATION_LINE=" + declLine);
decision.push("PATCHABLE_BY_EXACT_RETURN_ANCHOR=" + (firstReturnArray ? "YES" : "NO"));
decision.push("RECOMMENDED_PATCH_ANCHOR=" + (firstReturnArray ? `BEFORE_FIRST_RETURN_ARRAY_LINE_${firstReturnArray.line}` : "NONE"));
decision.push("");
decision.push("NEXT_POLICY");
decision.push("- C2F-B3 may patch only exact anchor line, not whole function.");
decision.push("- Insert early validation block before first return array.");
decision.push("- Missing state returns locked panel.");
decision.push("- Complete state falls through to existing renderer.");
decision.push("- API_POST remains NO.");
decision.push("- DB_WRITE remains NO.");
decision.push("- Server/API/DB route untouched.");
decision.push("- No wrapper / bridge.");
decision.push("");
decision.push("NEXT=V10L-C2F-B3_EXACT_ANCHOR_PRE_POST_GATE_PATCH");
decision.push("");
decision.push("FILES");
decision.push("WINDOW_OUT=" + windowOut);
decision.push("ANCHOR_OUT=" + anchorOut);
decision.push("PLAN_OUT=" + planOut);

fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
