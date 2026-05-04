const fs = require("fs");

const [
  ,
  ,
  corePath,
  verifyOut,
  decisionOut,
  executeWindowOut,
  anchorOut,
  patchPlanOut
] = process.argv;

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\r?\n/);

const targetFn = "aicmExecuteLeaderHandoffConfirmR8S";

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

function lineWindow(centerLine, before, after) {
  const start = Math.max(1, centerLine - before);
  const end = Math.min(lines.length, centerLine + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

function findLineIncludes(needle) {
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    if ((lines[i] || "").includes(needle)) {
      out.push({ line: i + 1, text: lines[i] || "" });
    }
  }
  return out;
}

const declHits = findLineIncludes("function " + targetFn);
const decl = declHits[0] || null;

const verify = [];
const decision = [];

if (!decl) {
  verify.push("AICompanyManager V10L-C2F-D1 verify");
  verify.push("DB_WRITE=NO");
  verify.push("API_POST=NO");
  verify.push("CORE_PATCH=NO");
  verify.push("SERVER_PATCH=NO");
  verify.push("");
  verify.push("TARGET_FUNCTION_FOUND=NO");
  fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

  decision.push("AICompanyManager V10L-C2F-D1 decision");
  decision.push("CONCLUSION=TARGET_FUNCTION_NOT_FOUND_PATCH_PROHIBITED");
  fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
  process.exit(2);
}

const declLine = decl.line;
const window = lineWindow(declLine, 0, 260);
const windowLines = lines.slice(window.start - 1, window.end);

const anchorNeedles = [
  "function " + targetFn,
  "fetch(",
  "method: \"POST\"",
  "method: 'POST'",
  "method:\"POST\"",
  "method:'POST'",
  "/api/aicm/v2/manager-major/update",
  "manager-major/update",
  "handoffBatchRoute",
  "leaderPlacementId",
  "leader_placement_id",
  "leaderLabel",
  "leader_label",
  "departmentLabel",
  "department_label",
  "sectionLabel",
  "section_label",
  "aicmR8zMgrMajorCardSelectedRows",
  "selectedRows",
  "manager_major_item_id",
  "managerMajorItemId",
  "major_item_id",
  "body:",
  "JSON.stringify",
  "confirm",
  "Yes",
  "No"
];

const hits = [];

for (const needle of anchorNeedles) {
  for (let i = window.start; i <= window.end; i += 1) {
    const text = lines[i - 1] || "";
    if (text.includes(needle)) {
      hits.push({ needle, line: i, text });
    }
  }
}

hits.sort((a, b) => a.line - b.line || a.needle.localeCompare(b.needle));

const firstFetch = hits.find(h => h.needle === "fetch(") || null;
const firstPostMethod = hits.find(h => h.needle.includes("method")) || null;
const firstEndpoint = hits.find(h => h.needle.includes("manager-major/update")) || null;
const firstBody = hits.find(h => h.needle === "body:") || null;
const firstStringify = hits.find(h => h.needle === "JSON.stringify") || null;
const firstRoute = hits.find(h => h.needle === "handoffBatchRoute") || null;
const firstLeaderPlacement = hits.find(h => h.needle === "leaderPlacementId" || h.needle === "leader_placement_id") || null;
const firstSelectedRows = hits.find(h => h.needle === "aicmR8zMgrMajorCardSelectedRows" || h.needle === "selectedRows") || null;

fs.writeFileSync(executeWindowOut, [
  "AICompanyManager V10L-C2F-D1 execute exact window",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=NO",
  "SERVER_PATCH=NO",
  "",
  "TARGET_FUNCTION=" + targetFn,
  "DECLARATION_LINE=" + declLine,
  "WINDOW=" + window.start + "-" + window.end,
  "============================================================",
  window.text,
  ""
].join("\n"));

const anchorLines = [];
anchorLines.push("AICompanyManager V10L-C2F-D1 execute anchor candidates");
anchorLines.push("DB_WRITE=NO");
anchorLines.push("API_POST=NO");
anchorLines.push("CORE_PATCH=NO");
anchorLines.push("SERVER_PATCH=NO");
anchorLines.push("");
anchorLines.push("TARGET_FUNCTION=" + targetFn);
anchorLines.push("DECLARATION_LINE=" + declLine);
anchorLines.push("WINDOW=" + window.start + "-" + window.end);
anchorLines.push("");

for (const h of hits) {
  anchorLines.push("line=" + h.line + "; needle=" + h.needle + "; text=" + h.text.trim().slice(0, 260));
}

fs.writeFileSync(anchorOut, anchorLines.join("\n") + "\n");

const plan = [];
plan.push("AICompanyManager V10L-C2F-D1 C2F-D2 patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("TARGET_FUNCTION=" + targetFn);
plan.push("DECLARATION_LINE=" + declLine);
plan.push("FIRST_FETCH_LINE=" + (firstFetch ? firstFetch.line : "NONE"));
plan.push("FIRST_POST_METHOD_LINE=" + (firstPostMethod ? firstPostMethod.line : "NONE"));
plan.push("FIRST_ENDPOINT_LINE=" + (firstEndpoint ? firstEndpoint.line : "NONE"));
plan.push("");
plan.push("RECOMMENDED_C2F_D2_PATCH");
if (firstFetch) {
  plan.push("- Insert validation block immediately before FIRST_FETCH_LINE=" + firstFetch.line + ".");
  plan.push("- Missing state must return/stop before fetch.");
  plan.push("- Complete state falls through to existing fetch path.");
} else {
  plan.push("- fetch anchor not found in window; do not patch yet.");
}
plan.push("");
plan.push("PATCH_CONSTRAINTS");
plan.push("- Do not patch display renderer.");
plan.push("- Do not wrap the function.");
plan.push("- Do not replace whole function.");
plan.push("- Do not touch server/API/DB route.");
plan.push("- API_POST remains NO unless explicitly approved.");
plan.push("- DB_WRITE remains NO.");
plan.push("- Use exact line anchor only.");
plan.push("- Add marker START/END and deletion path.");
plan.push("- node --check required.");
plan.push("- HTTP 200 required.");
fs.writeFileSync(patchPlanOut, plan.join("\n") + "\n");

verify.push("AICompanyManager V10L-C2F-D1 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("TARGET_FUNCTION=" + targetFn);
verify.push("TARGET_FUNCTION_FOUND=YES");
verify.push("DECLARATION_LINE=" + declLine);
verify.push("WINDOW_START=" + window.start);
verify.push("WINDOW_END=" + window.end);
verify.push("ANCHOR_HIT_COUNT=" + hits.length);
verify.push("FIRST_FETCH_LINE=" + (firstFetch ? firstFetch.line : "NONE"));
verify.push("FIRST_POST_METHOD_LINE=" + (firstPostMethod ? firstPostMethod.line : "NONE"));
verify.push("FIRST_ENDPOINT_LINE=" + (firstEndpoint ? firstEndpoint.line : "NONE"));
verify.push("FIRST_BODY_LINE=" + (firstBody ? firstBody.line : "NONE"));
verify.push("FIRST_STRINGIFY_LINE=" + (firstStringify ? firstStringify.line : "NONE"));
verify.push("FIRST_ROUTE_STATE_LINE=" + (firstRoute ? firstRoute.line : "NONE"));
verify.push("FIRST_LEADER_PLACEMENT_LINE=" + (firstLeaderPlacement ? firstLeaderPlacement.line : "NONE"));
verify.push("FIRST_SELECTED_ROWS_LINE=" + (firstSelectedRows ? firstSelectedRows.line : "NONE"));
verify.push("PATCHABLE_BEFORE_FETCH=" + (firstFetch ? "YES" : "NO"));
verify.push("C2F_B3_MARKER_COUNT=" + count(src, "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE"));
verify.push("ROUTE_UI_LABEL_COUNT=" + count(src, "一括引き渡し先"));
verify.push("SECTION_APPLY_LABEL_COUNT=" + count(src, "課を適用"));
verify.push("LEADER_APPLY_LABEL_COUNT=" + count(src, "Leaderを適用"));
verify.push("EXECUTE_WINDOW_OUT=" + executeWindowOut);
verify.push("ANCHOR_OUT=" + anchorOut);
verify.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

decision.push("AICompanyManager V10L-C2F-D1 decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=EXECUTE_FUNCTION_EXACT_ANCHORS_EXTRACTED_PATCH_NOT_APPLIED");
decision.push("TARGET_FUNCTION=" + targetFn);
decision.push("DECLARATION_LINE=" + declLine);
decision.push("PATCHABLE_BEFORE_FETCH=" + (firstFetch ? "YES" : "NO"));
decision.push("RECOMMENDED_PATCH_ANCHOR=" + (firstFetch ? "BEFORE_FIRST_FETCH_LINE_" + firstFetch.line : "NONE"));
decision.push("");
decision.push("NEXT_POLICY");
decision.push("- C2F-D2 should patch immediately before fetch in the execute path.");
decision.push("- Do not patch display renderer.");
decision.push("- Missing validation must block before fetch.");
decision.push("- Complete validation must fall through.");
decision.push("- API_POST remains NO until explicit approval.");
decision.push("- DB_WRITE remains NO.");
decision.push("- No server/API/DB route changes.");
decision.push("- No wrapper / no bridge / no whole-function replacement.");
decision.push("");
decision.push("NEXT=V10L-C2F-D2_EXECUTE_PATH_PRE_FETCH_VALIDATION_GATE_PATCH");
decision.push("");
decision.push("FILES");
decision.push("EXECUTE_WINDOW_OUT=" + executeWindowOut);
decision.push("ANCHOR_OUT=" + anchorOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
