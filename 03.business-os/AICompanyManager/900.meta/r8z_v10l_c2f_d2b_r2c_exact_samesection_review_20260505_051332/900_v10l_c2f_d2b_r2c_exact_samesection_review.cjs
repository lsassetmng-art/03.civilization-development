const fs = require("fs");

const [
  ,
  ,
  corePath,
  verifyOut,
  decisionOut,
  windowOut,
  traceOut,
  patchPlanOut
] = process.argv;

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\r?\n/);

const d2Marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE";
const d2bMarker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2B";
const b3Marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE";
const action = "r8z-mgr-major-card-route-apply-section";

function count(needle) {
  let c = 0;
  let from = 0;
  while (true) {
    const idx = src.indexOf(needle, from);
    if (idx < 0) break;
    c += 1;
    from = idx + needle.length;
  }
  return c;
}

function lineWindow(startLine, endLine) {
  const start = Math.max(1, startLine);
  const end = Math.min(lines.length, endLine);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

function findLines(needle, fromLine, toLine) {
  const out = [];
  const start = Math.max(1, fromLine || 1);
  const end = Math.min(lines.length, toLine || lines.length);
  for (let i = start; i <= end; i += 1) {
    const text = lines[i - 1] || "";
    if (text.includes(needle)) out.push({ line: i, text });
  }
  return out;
}

const mainWindow = lineWindow(6560, 7060);

const needles = [
  "sameSection",
  "handoffBatchRoute",
  "leaderLabel",
  "leader_label",
  "leaderPlacementId",
  "leader_placement_id",
  "assigned_leader_label",
  "assigned_leader_placement_id",
  "placementId",
  "placement_id",
  "sectionId",
  "section_id",
  "sectionLabel",
  "section_label",
  "departmentId",
  "department_id",
  "effective",
  "Effective",
  action
];

const trace = [];
trace.push("AICompanyManager V10L-C2F-D2B-R2C sameSection trace");
trace.push("DB_WRITE=NO");
trace.push("API_POST=NO");
trace.push("CORE_PATCH=NO");
trace.push("SERVER_PATCH=NO");
trace.push("");

for (const needle of needles) {
  const hits = findLines(needle, 6560, 7060);
  trace.push("============================================================");
  trace.push("NEEDLE=" + needle + "; HIT_COUNT=" + hits.length);
  trace.push("============================================================");
  for (const h of hits) {
    trace.push(String(h.line).padStart(6, " ") + ": " + h.text);
  }
  trace.push("");
}

fs.writeFileSync(traceOut, trace.join("\n"));

fs.writeFileSync(windowOut, [
  "AICompanyManager V10L-C2F-D2B-R2C exact sameSection window",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=NO",
  "SERVER_PATCH=NO",
  "",
  "WINDOW=6560-7060",
  "============================================================",
  mainWindow.text,
  ""
].join("\n"));

const sameSectionLineHits = findLines("sameSection", 6560, 7060);
const leaderLineHits = []
  .concat(findLines("leaderLabel", 6560, 7060))
  .concat(findLines("leader_label", 6560, 7060))
  .concat(findLines("leaderPlacementId", 6560, 7060))
  .concat(findLines("leader_placement_id", 6560, 7060))
  .concat(findLines("assigned_leader_label", 6560, 7060))
  .concat(findLines("assigned_leader_placement_id", 6560, 7060))
  .concat(findLines("placementId", 6560, 7060))
  .concat(findLines("placement_id", 6560, 7060));

const sectionLineHits = []
  .concat(findLines("sectionId", 6560, 7060))
  .concat(findLines("section_id", 6560, 7060))
  .concat(findLines("sectionLabel", 6560, 7060))
  .concat(findLines("section_label", 6560, 7060));

const actionLineHits = findLines(action, 6560, 7060);

const likelyPatchable =
  sameSectionLineHits.length > 0 &&
  leaderLineHits.length > 0 &&
  sectionLineHits.length > 0;

const plan = [];
plan.push("AICompanyManager V10L-C2F-D2B-R2C C2F-D2B-R3 patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("REVIEW_RESULT");
plan.push("- sameSection hits in window: " + sameSectionLineHits.length);
plan.push("- Leader/placement hits in window: " + leaderLineHits.length);
plan.push("- Section hits in window: " + sectionLineHits.length);
plan.push("- section apply action hits in window: " + actionLineHits.length);
plan.push("- likely patchable in this window: " + (likelyPatchable ? "YES" : "NO"));
plan.push("");
plan.push("R3_POLICY");
plan.push("- Do not patch before reviewing 040 and 050 outputs.");
plan.push("- Patch only exact assignment/enrichment lines if clear.");
plan.push("- Do not touch D2 execute gate.");
plan.push("- Do not touch button render.");
plan.push("- No debug UI / no wrapper / no bridge.");
fs.writeFileSync(patchPlanOut, plan.join("\n"));

const verify = [];
verify.push("AICompanyManager V10L-C2F-D2B-R2C verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("C2F_D2_EXECUTE_GATE_MARKER_COUNT=" + count(d2Marker));
verify.push("C2F_D2B_ANY_MARKER_COUNT=" + count(d2bMarker));
verify.push("C2F_B3_MARKER_COUNT=" + count(b3Marker));
verify.push("WINDOW=6560-7060");
verify.push("SAMESECTION_HIT_COUNT=" + sameSectionLineHits.length);
verify.push("LEADER_OR_PLACEMENT_HIT_COUNT=" + leaderLineHits.length);
verify.push("SECTION_HIT_COUNT=" + sectionLineHits.length);
verify.push("SECTION_APPLY_ACTION_HIT_COUNT_IN_WINDOW=" + actionLineHits.length);
verify.push("LIKELY_PATCHABLE_IN_WINDOW=" + (likelyPatchable ? "YES" : "NO"));
verify.push("SECTION_APPLY_LABEL_COUNT=" + count("課を適用"));
verify.push("LEADER_APPLY_LABEL_COUNT=" + count("Leaderを適用"));
verify.push("WINDOW_OUT=" + windowOut);
verify.push("TRACE_OUT=" + traceOut);
verify.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(verifyOut, verify.join("\n"));

const decision = [];
decision.push("AICompanyManager V10L-C2F-D2B-R2C decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=SAMESECTION_EXACT_WINDOW_EXTRACTED_PATCH_NOT_APPLIED");
decision.push("LIKELY_PATCHABLE_IN_WINDOW=" + (likelyPatchable ? "YES" : "NO"));
decision.push("");
decision.push("NEXT_POLICY");
decision.push("- Review WINDOW_OUT and TRACE_OUT.");
decision.push("- If Leader autofill assignment is obvious, R3 patches only that exact assignment/enrichment line.");
decision.push("- Do not patch D2 execute gate.");
decision.push("- No debug UI / no wrapper / no bridge.");
decision.push("");
decision.push("NEXT=V10L-C2F-D2B-R3_EXACT_ASSIGNMENT_PATCH_AFTER_REVIEW");
decision.push("");
decision.push("FILES");
decision.push("WINDOW_OUT=" + windowOut);
decision.push("TRACE_OUT=" + traceOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(decisionOut, decision.join("\n"));
