const fs = require("fs");

const [
  ,
  ,
  corePath,
  verifyOut,
  decisionOut,
  actionContextOut,
  handlerContextOut,
  leaderWriteContextOut,
  patchPlanOut
] = process.argv;

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\r?\n/);

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

function lineNoAtIndex(index) {
  return src.slice(0, index).split(/\r?\n/).length;
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
    if ((lines[i] || "").includes(needle)) out.push({ line: i + 1, text: lines[i] || "" });
  }
  return out;
}

function uniqueByLine(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (seen.has(item.line)) continue;
    seen.add(item.line);
    out.push(item);
  }
  return out.sort((a, b) => a.line - b.line);
}

function emitWindows(title, hits, outPath, before = 35, after = 90) {
  const out = [];
  out.push(title);
  out.push("DB_WRITE=NO");
  out.push("API_POST=NO");
  out.push("CORE_PATCH=NO");
  out.push("SERVER_PATCH=NO");
  out.push("");

  const emitted = [];
  for (const h of hits) {
    if (emitted.some(r => h.line >= r.start && h.line <= r.end)) continue;
    const win = lineWindow(h.line, before, after);
    emitted.push({ start: win.start, end: win.end });
    out.push("============================================================");
    out.push("WINDOW=" + win.start + "-" + win.end + "; CENTER=" + h.line + "; HIT=" + h.text.trim().slice(0, 260));
    out.push("============================================================");
    out.push(win.text);
    out.push("");
  }

  fs.writeFileSync(outPath, out.join("\n") + "\n");
}

const sectionApplyActionNeedles = [
  "r8z-mgr-major-card-route-apply-section",
  "route-apply-section",
  "課を適用",
  "sectionSelect",
  "section-select",
  "selectedSection",
  "optionSectionId",
  "optionSectionLabel",
  "optionDepartmentId",
  "optionDepartmentLabel"
];

const actionHits = uniqueByLine(sectionApplyActionNeedles.flatMap(findLineIncludes));

const handlerNeedles = [
  "aicmR8zMgrMajorCardHandleAction",
  "function aicmR8zMgrMajorCardHandleAction",
  "data-core-action",
  "closest(\"[data-core-action]\")",
  "r8z-mgr-major-card-route-apply-section"
];

const handlerHits = uniqueByLine(handlerNeedles.flatMap(findLineIncludes));

const leaderWriteNeedles = [
  "leaderLabel",
  "leader_label",
  "assigned_leader_label",
  "leaderPlacementId",
  "leader_placement_id",
  "assigned_leader_placement_id",
  "placementId",
  "placement_id",
  "ガチ"
];

const leaderHits = uniqueByLine(leaderWriteNeedles.flatMap(findLineIncludes))
  .filter(h => {
    const t = h.text;
    return t.includes("leader") || t.includes("Leader") || t.includes("placement") || t.includes("ガチ");
  });

emitWindows("AICompanyManager V10L-C2F-D2B-R1 section apply action context", actionHits, actionContextOut, 25, 120);
emitWindows("AICompanyManager V10L-C2F-D2B-R1 handler context", handlerHits, handlerContextOut, 35, 140);
emitWindows("AICompanyManager V10L-C2F-D2B-R1 leader write context", leaderHits, leaderWriteContextOut, 18, 60);

const actionLine = findLineIncludes("r8z-mgr-major-card-route-apply-section")[0] || null;

let targetBranchLine = null;
let targetBranchText = "";
if (actionLine) {
  const start = Math.max(1, actionLine.line - 80);
  const end = Math.min(lines.length, actionLine.line + 160);
  for (let i = start; i <= end; i += 1) {
    const text = lines[i - 1] || "";
    if (text.includes("r8z-mgr-major-card-route-apply-section")) {
      targetBranchLine = i;
      targetBranchText = text;
      break;
    }
  }
}

const sectionApplyContextText = actionHits.map(h => {
  const w = lineWindow(h.line, 8, 30);
  return w.text;
}).join("\n\n");

const suspectedLeaderAutoFill =
  /leaderLabel\s*[:=]/.test(sectionApplyContextText) ||
  /leader_label\s*[:=]/.test(sectionApplyContextText) ||
  /leaderPlacementId\s*[:=]/.test(sectionApplyContextText) ||
  /leader_placement_id\s*[:=]/.test(sectionApplyContextText) ||
  /placementId\s*[:=]/.test(sectionApplyContextText);

const exactFunctionNameCount = count("aicmR8zC2cApplySectionRoute");
const routeApplyActionCount = count("r8z-mgr-major-card-route-apply-section");
const sectionApplyLabelCount = count("課を適用");
const leaderApplyLabelCount = count("Leaderを適用");
const d2MarkerCount = count("AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE");
const d2bFailedNameCount = count("aicmR8zC2cApplySectionRoute");

const plan = [];
plan.push("AICompanyManager V10L-C2F-D2B-R1 C2F-D2B-R2 patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("FINDING");
plan.push("- aicmR8zC2cApplySectionRoute function name is not present.");
plan.push("- Actual target should be the existing action branch for r8z-mgr-major-card-route-apply-section.");
plan.push("");
plan.push("TARGET");
plan.push("- ACTION=r8z-mgr-major-card-route-apply-section");
plan.push("- ACTION_FIRST_LINE=" + (actionLine ? actionLine.line : "NONE"));
plan.push("- TARGET_BRANCH_LINE=" + (targetBranchLine || "NONE"));
plan.push("- SUSPECTED_LEADER_AUTOFILL_NEAR_SECTION_APPLY=" + (suspectedLeaderAutoFill ? "YES" : "NO"));
plan.push("");
plan.push("PATCH_POLICY");
plan.push("- Patch only the existing route-apply-section action branch.");
plan.push("- Do not touch D2 execute gate.");
plan.push("- Do not add debug UI.");
plan.push("- No wrapper / no bridge.");
plan.push("- Remove/neutralize leaderLabel / leaderPlacementId writes from section-apply branch only.");
plan.push("- Leader apply branch remains unchanged.");
plan.push("- node --check + HTTP 200 required.");
fs.writeFileSync(patchPlanOut, plan.join("\n") + "\n");

const verify = [];
verify.push("AICompanyManager V10L-C2F-D2B-R1 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("MISSING_TARGET_FUNCTION_NAME_COUNT=" + exactFunctionNameCount);
verify.push("ROUTE_APPLY_SECTION_ACTION_COUNT=" + routeApplyActionCount);
verify.push("SECTION_APPLY_LABEL_COUNT=" + sectionApplyLabelCount);
verify.push("LEADER_APPLY_LABEL_COUNT=" + leaderApplyLabelCount);
verify.push("ACTION_HIT_COUNT=" + actionHits.length);
verify.push("HANDLER_HIT_COUNT=" + handlerHits.length);
verify.push("LEADER_WRITE_HIT_COUNT=" + leaderHits.length);
verify.push("ACTION_FIRST_LINE=" + (actionLine ? actionLine.line : "NONE"));
verify.push("TARGET_BRANCH_LINE=" + (targetBranchLine || "NONE"));
verify.push("TARGET_BRANCH_TEXT=" + (targetBranchText ? targetBranchText.trim().slice(0, 220) : "NONE"));
verify.push("SUSPECTED_LEADER_AUTOFILL_NEAR_SECTION_APPLY=" + (suspectedLeaderAutoFill ? "YES" : "NO"));
verify.push("C2F_D2_EXECUTE_GATE_MARKER_COUNT=" + d2MarkerCount);
verify.push("C2F_B3_MARKER_COUNT=" + count("AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE"));
verify.push("ACTION_CONTEXT_OUT=" + actionContextOut);
verify.push("HANDLER_CONTEXT_OUT=" + handlerContextOut);
verify.push("LEADER_WRITE_CONTEXT_OUT=" + leaderWriteContextOut);
verify.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

const decision = [];
decision.push("AICompanyManager V10L-C2F-D2B-R1 decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=ACTUAL_SECTION_APPLY_TARGET_AUDITED_PATCH_NOT_APPLIED");
decision.push("WHY_D2B_FAILED=The assumed function name aicmR8zC2cApplySectionRoute is not present in current core.");
decision.push("ACTUAL_TARGET_ACTION=r8z-mgr-major-card-route-apply-section");
decision.push("ACTION_FIRST_LINE=" + (actionLine ? actionLine.line : "NONE"));
decision.push("TARGET_BRANCH_LINE=" + (targetBranchLine || "NONE"));
decision.push("");
decision.push("NEXT_POLICY");
decision.push("- D2B-R2 should patch the actual route-apply-section action branch, not a missing function name.");
decision.push("- Section apply must only set department/section.");
decision.push("- Section apply must clear or leave empty Leader fields.");
decision.push("- Leader fields are set only by Leader apply.");
decision.push("- Do not touch D2 execute gate.");
decision.push("- No debug UI / no wrapper / no bridge.");
decision.push("");
decision.push("NEXT=V10L-C2F-D2B-R2_PATCH_ACTUAL_ROUTE_APPLY_SECTION_BRANCH");
decision.push("");
decision.push("FILES");
decision.push("ACTION_CONTEXT_OUT=" + actionContextOut);
decision.push("HANDLER_CONTEXT_OUT=" + handlerContextOut);
decision.push("LEADER_WRITE_CONTEXT_OUT=" + leaderWriteContextOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
