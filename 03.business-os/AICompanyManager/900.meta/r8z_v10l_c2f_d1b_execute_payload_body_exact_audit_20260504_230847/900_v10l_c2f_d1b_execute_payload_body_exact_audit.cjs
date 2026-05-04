const fs = require("fs");

const [
  ,
  ,
  corePath,
  verifyOut,
  decisionOut,
  executeWindowOut,
  payloadTraceOut,
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

const decl = findLineIncludes("function " + targetFn)[0] || null;

if (!decl) {
  fs.writeFileSync(verifyOut, [
    "AICompanyManager V10L-C2F-D1B verify",
    "DB_WRITE=NO",
    "API_POST=NO",
    "CORE_PATCH=NO",
    "SERVER_PATCH=NO",
    "",
    "TARGET_FUNCTION_FOUND=NO"
  ].join("\n") + "\n");

  fs.writeFileSync(decisionOut, [
    "AICompanyManager V10L-C2F-D1B decision",
    "CONCLUSION=TARGET_FUNCTION_NOT_FOUND_PATCH_PROHIBITED"
  ].join("\n") + "\n");

  process.exit(2);
}

const declLine = decl.line;
const win = lineWindow(declLine, 0, 150);
const winLines = lines.slice(win.start - 1, win.end);

fs.writeFileSync(executeWindowOut, [
  "AICompanyManager V10L-C2F-D1B execute payload window",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=NO",
  "SERVER_PATCH=NO",
  "",
  "TARGET_FUNCTION=" + targetFn,
  "DECLARATION_LINE=" + declLine,
  "WINDOW=" + win.start + "-" + win.end,
  "============================================================",
  win.text,
  ""
].join("\n"));

const interesting = [];
const needles = [
  "const ",
  "let ",
  "var ",
  "body",
  "payload",
  "confirm",
  "Confirm",
  "state.",
  "managerMajorLeaderHandoffConfirm",
  "leaderHandoff",
  "fetch(",
  "JSON.stringify",
  "/api/aicm/v2/manager-major/update",
  "manager-major/update",
  "method:",
  "headers:",
  "selected",
  "leader",
  "department",
  "section",
  "route"
];

for (let line = win.start; line <= win.end; line += 1) {
  const text = lines[line - 1] || "";
  if (needles.some(n => text.includes(n))) {
    interesting.push({ line, text });
  }
}

let stringifyLine = null;
let stringifyText = "";
let stringifyExpr = "";

for (let line = win.start; line <= win.end; line += 1) {
  const text = lines[line - 1] || "";
  const idx = text.indexOf("JSON.stringify");
  if (idx >= 0) {
    stringifyLine = line;
    stringifyText = text;
    const m = text.match(/JSON\.stringify\(([^)]*)\)/);
    if (m) stringifyExpr = m[1].trim();
    break;
  }
}

let fetchLine = null;
for (let line = win.start; line <= win.end; line += 1) {
  if ((lines[line - 1] || "").includes("fetch(")) {
    fetchLine = line;
    break;
  }
}

let endpointLine = null;
for (let line = win.start; line <= win.end; line += 1) {
  const text = lines[line - 1] || "";
  if (text.includes("/api/aicm/v2/manager-major/update") || text.includes("manager-major/update")) {
    endpointLine = line;
    break;
  }
}

const varCandidates = [];
const declRe = /\b(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=/g;
for (let line = win.start; line <= win.end; line += 1) {
  const text = lines[line - 1] || "";
  let m;
  while ((m = declRe.exec(text)) !== null) {
    varCandidates.push({ name: m[1], line, text });
  }
}

const stringifyVar = stringifyExpr && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(stringifyExpr) ? stringifyExpr : "";
const stringifyVarDecl = stringifyVar
  ? varCandidates.find(v => v.name === stringifyVar) || null
  : null;

const trace = [];
trace.push("AICompanyManager V10L-C2F-D1B payload/body trace");
trace.push("DB_WRITE=NO");
trace.push("API_POST=NO");
trace.push("CORE_PATCH=NO");
trace.push("SERVER_PATCH=NO");
trace.push("");
trace.push("TARGET_FUNCTION=" + targetFn);
trace.push("DECLARATION_LINE=" + declLine);
trace.push("FETCH_LINE=" + (fetchLine || "NONE"));
trace.push("ENDPOINT_LINE=" + (endpointLine || "NONE"));
trace.push("JSON_STRINGIFY_LINE=" + (stringifyLine || "NONE"));
trace.push("JSON_STRINGIFY_TEXT=" + (stringifyText ? stringifyText.trim() : "NONE"));
trace.push("JSON_STRINGIFY_EXPR=" + (stringifyExpr || "NONE"));
trace.push("JSON_STRINGIFY_VAR=" + (stringifyVar || "NONE"));
trace.push("JSON_STRINGIFY_VAR_DECL_LINE=" + (stringifyVarDecl ? stringifyVarDecl.line : "NONE"));
trace.push("");
trace.push("VARIABLE_DECLARATIONS_IN_WINDOW");
for (const v of varCandidates) {
  trace.push("- line=" + v.line + "; name=" + v.name + "; text=" + v.text.trim().slice(0, 260));
}
trace.push("");
trace.push("INTERESTING_LINES");
for (const item of interesting) {
  trace.push(String(item.line).padStart(6, " ") + ": " + item.text);
}
fs.writeFileSync(payloadTraceOut, trace.join("\n") + "\n");

const plan = [];
plan.push("AICompanyManager V10L-C2F-D1B C2F-D2 exact payload gate plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("TARGET_FUNCTION=" + targetFn);
plan.push("DECLARATION_LINE=" + declLine);
plan.push("FETCH_LINE=" + (fetchLine || "NONE"));
plan.push("JSON_STRINGIFY_EXPR=" + (stringifyExpr || "NONE"));
plan.push("JSON_STRINGIFY_VAR=" + (stringifyVar || "NONE"));
plan.push("");
plan.push("RECOMMENDED_D2");
if (fetchLine && stringifyVar) {
  plan.push("- Patch immediately before fetch line " + fetchLine + ".");
  plan.push("- Validate the existing payload variable: " + stringifyVar + ".");
  plan.push("- Do not reconstruct payload from separate UI state.");
  plan.push("- If validation fails, stop before fetch and update existing confirm state/result if available.");
  plan.push("- Until explicit approval, complete validation should still keep API_POST locked, or D2 should be read-only lock only.");
} else if (fetchLine) {
  plan.push("- Patch before fetch line " + fetchLine + ", but JSON.stringify variable was not a simple identifier.");
  plan.push("- Inspect payload/body expression manually before patch.");
} else {
  plan.push("- fetch anchor not found. Do not patch.");
}
plan.push("");
plan.push("PATCH_CONSTRAINTS");
plan.push("- Do not patch display renderer.");
plan.push("- Do not create new route state model.");
plan.push("- Do not wrap function.");
plan.push("- Do not replace whole function.");
plan.push("- Do not touch server/API/DB route.");
plan.push("- API_POST remains NO until explicit approval.");
plan.push("- DB_WRITE remains NO.");
fs.writeFileSync(patchPlanOut, plan.join("\n") + "\n");

const verify = [];
verify.push("AICompanyManager V10L-C2F-D1B verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("TARGET_FUNCTION=" + targetFn);
verify.push("TARGET_FUNCTION_FOUND=YES");
verify.push("DECLARATION_LINE=" + declLine);
verify.push("FETCH_LINE=" + (fetchLine || "NONE"));
verify.push("ENDPOINT_LINE=" + (endpointLine || "NONE"));
verify.push("JSON_STRINGIFY_LINE=" + (stringifyLine || "NONE"));
verify.push("JSON_STRINGIFY_EXPR=" + (stringifyExpr || "NONE"));
verify.push("JSON_STRINGIFY_VAR=" + (stringifyVar || "NONE"));
verify.push("JSON_STRINGIFY_VAR_DECL_FOUND=" + (stringifyVarDecl ? "YES" : "NO"));
verify.push("JSON_STRINGIFY_VAR_DECL_LINE=" + (stringifyVarDecl ? stringifyVarDecl.line : "NONE"));
verify.push("VARIABLE_DECLARATION_COUNT_IN_WINDOW=" + varCandidates.length);
verify.push("PATCHABLE_BY_PAYLOAD_VAR_BEFORE_FETCH=" + (fetchLine && stringifyVar ? "YES" : "NO"));
verify.push("C2F_B3_MARKER_COUNT=" + count(src, "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE"));
verify.push("ROUTE_UI_LABEL_COUNT=" + count(src, "一括引き渡し先"));
verify.push("SECTION_APPLY_LABEL_COUNT=" + count(src, "課を適用"));
verify.push("LEADER_APPLY_LABEL_COUNT=" + count(src, "Leaderを適用"));
verify.push("EXECUTE_WINDOW_OUT=" + executeWindowOut);
verify.push("PAYLOAD_TRACE_OUT=" + payloadTraceOut);
verify.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

const decision = [];
decision.push("AICompanyManager V10L-C2F-D1B decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=EXECUTE_PAYLOAD_BODY_EXACT_AUDITED_PATCH_NOT_APPLIED");
decision.push("TARGET_FUNCTION=" + targetFn);
decision.push("FETCH_LINE=" + (fetchLine || "NONE"));
decision.push("JSON_STRINGIFY_VAR=" + (stringifyVar || "NONE"));
decision.push("PATCHABLE_BY_PAYLOAD_VAR_BEFORE_FETCH=" + (fetchLine && stringifyVar ? "YES" : "NO"));
decision.push("");
decision.push("NEXT_POLICY");
decision.push("- C2F-D2 should validate the existing JSON.stringify payload variable, not rebuild from display state.");
decision.push("- Patch immediately before fetch.");
decision.push("- Keep API_POST=NO until explicit approval.");
decision.push("- Do not touch server/API/DB route.");
decision.push("- No wrapper / no bridge / no whole-function replacement.");
decision.push("");
decision.push("NEXT=V10L-C2F-D2_EXECUTE_PATH_PAYLOAD_VAR_VALIDATION_GATE");
decision.push("");
decision.push("FILES");
decision.push("EXECUTE_WINDOW_OUT=" + executeWindowOut);
decision.push("PAYLOAD_TRACE_OUT=" + payloadTraceOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
