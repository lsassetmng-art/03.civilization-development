const fs = require("fs");

const [
  ,
  ,
  corePath,
  verifyOut,
  decisionOut,
  actionAllContextOut,
  handlerBranchContextOut,
  leaderWriteNearBranchOut,
  patchPlanOut
] = process.argv;

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\r?\n/);

const action = "r8z-mgr-major-card-route-apply-section";
const d2Marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE";
const b3Marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE";

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

function findAllIndexes(needle) {
  const out = [];
  let from = 0;
  while (true) {
    const idx = src.indexOf(needle, from);
    if (idx < 0) break;
    const line = lineNoAtIndex(idx);
    out.push({ index: idx, line, text: lines[line - 1] || "" });
    from = idx + needle.length;
  }
  return out;
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

function classifyOccurrence(hit) {
  const text = hit.text || "";
  const win = lineWindow(hit.line, 12, 35).text;

  if (text.includes("<button") || text.includes("data-core-action")) return "RENDER_BUTTON";
  if (/action\s*={0,2}=/.test(win) || win.includes("case ") || win.includes("if (action") || win.includes("else if (action")) return "HANDLER_BRANCH";
  if (win.includes("closest") || win.includes("getAttribute")) return "DISPATCHER";
  return "UNKNOWN";
}

function emitWindows(title, hits, outPath, before, after) {
  const out = [];
  out.push(title);
  out.push("DB_WRITE=NO");
  out.push("API_POST=NO");
  out.push("CORE_PATCH=NO");
  out.push("SERVER_PATCH=NO");
  out.push("");

  const emitted = [];
  for (const hit of hits) {
    if (emitted.some(r => hit.line >= r.start && hit.line <= r.end)) continue;
    const win = lineWindow(hit.line, before, after);
    emitted.push({ start: win.start, end: win.end });
    out.push("============================================================");
    out.push("WINDOW=" + win.start + "-" + win.end + "; CENTER=" + hit.line + "; CLASS=" + (hit.kind || "NA"));
    out.push("HIT=" + (hit.text || "").trim().slice(0, 260));
    out.push("============================================================");
    out.push(win.text);
    out.push("");
  }

  fs.writeFileSync(outPath, out.join("\n") + "\n");
}

const occurrences = findAllIndexes(action).map(hit => ({
  ...hit,
  kind: classifyOccurrence(hit)
}));

emitWindows("AICompanyManager V10L-C2F-D2B-R1B all action occurrences", occurrences, actionAllContextOut, 20, 70);

const handlerBranchOccurrences = occurrences.filter(o => o.kind === "HANDLER_BRANCH");
const renderOccurrences = occurrences.filter(o => o.kind === "RENDER_BUTTON");
const dispatcherOccurrences = occurrences.filter(o => o.kind === "DISPATCHER");

let actualHandler = handlerBranchOccurrences[0] || null;

/*
  R1のようにbutton行しか取れない場合に備え、
  action文字列の周辺ではなく、handleAction関数内の action分岐群から再探索。
*/
if (!actualHandler) {
  const handleHits = findAllIndexes("function aicmR8zMgrMajorCardHandleAction")
    .concat(findAllIndexes("aicmR8zMgrMajorCardHandleAction"));

  for (const h of handleHits) {
    const start = Math.max(1, h.line - 10);
    const end = Math.min(lines.length, h.line + 520);
    for (let i = start; i <= end; i += 1) {
      const text = lines[i - 1] || "";
      const area = lineWindow(i, 3, 25).text;
      if (area.includes(action) && (/action\s*={0,2}=/.test(area) || area.includes("case ") || area.includes("if (action") || area.includes("else if (action"))) {
        actualHandler = { line: i, text, kind: "HANDLER_BRANCH_BY_HANDLE_WINDOW" };
        break;
      }
    }
    if (actualHandler) break;
  }
}

const branchWindow = actualHandler ? lineWindow(actualHandler.line, 40, 160) : null;

if (branchWindow) {
  fs.writeFileSync(handlerBranchContextOut, [
    "AICompanyManager V10L-C2F-D2B-R1B actual handler branch context",
    "DB_WRITE=NO",
    "API_POST=NO",
    "CORE_PATCH=NO",
    "SERVER_PATCH=NO",
    "",
    "ACTION=" + action,
    "HANDLER_BRANCH_LINE=" + actualHandler.line,
    "HANDLER_BRANCH_KIND=" + actualHandler.kind,
    "WINDOW=" + branchWindow.start + "-" + branchWindow.end,
    "============================================================",
    branchWindow.text,
    ""
  ].join("\n"));
} else {
  fs.writeFileSync(handlerBranchContextOut, [
    "AICompanyManager V10L-C2F-D2B-R1B actual handler branch context",
    "DB_WRITE=NO",
    "API_POST=NO",
    "CORE_PATCH=NO",
    "SERVER_PATCH=NO",
    "",
    "HANDLER_BRANCH_FOUND=NO",
    ""
  ].join("\n"));
}

const leaderNeedles = [
  "leaderLabel",
  "leader_label",
  "assigned_leader_label",
  "leaderPlacementId",
  "leader_placement_id",
  "assigned_leader_placement_id",
  "placementId",
  "placement_id",
  "Leader",
  "ガチ"
];

const leaderNear = [];
if (branchWindow) {
  for (let line = branchWindow.start; line <= branchWindow.end; line += 1) {
    const text = lines[line - 1] || "";
    if (leaderNeedles.some(n => text.includes(n))) {
      leaderNear.push({ line, text });
    }
  }
}

const leaderOut = [];
leaderOut.push("AICompanyManager V10L-C2F-D2B-R1B leader writes near handler branch");
leaderOut.push("DB_WRITE=NO");
leaderOut.push("API_POST=NO");
leaderOut.push("CORE_PATCH=NO");
leaderOut.push("SERVER_PATCH=NO");
leaderOut.push("");
leaderOut.push("HANDLER_BRANCH_FOUND=" + (actualHandler ? "YES" : "NO"));
leaderOut.push("HANDLER_BRANCH_LINE=" + (actualHandler ? actualHandler.line : "NONE"));
leaderOut.push("LEADER_NEAR_BRANCH_HIT_COUNT=" + leaderNear.length);
leaderOut.push("");
for (const item of leaderNear) {
  leaderOut.push(String(item.line).padStart(6, " ") + ": " + item.text);
}
fs.writeFileSync(leaderWriteNearBranchOut, leaderOut.join("\n") + "\n");

const branchText = branchWindow ? branchWindow.text : "";
const suspectedLeaderAutoFill =
  /leaderLabel\s*[:=]/.test(branchText) ||
  /leader_label\s*[:=]/.test(branchText) ||
  /assigned_leader_label\s*[:=]/.test(branchText) ||
  /leaderPlacementId\s*[:=]/.test(branchText) ||
  /leader_placement_id\s*[:=]/.test(branchText) ||
  /assigned_leader_placement_id\s*[:=]/.test(branchText) ||
  /placementId\s*[:=]/.test(branchText) ||
  /placement_id\s*[:=]/.test(branchText);

const plan = [];
plan.push("AICompanyManager V10L-C2F-D2B-R1B C2F-D2B-R2 exact handler patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("TARGET_ACTION=" + action);
plan.push("HANDLER_BRANCH_FOUND=" + (actualHandler ? "YES" : "NO"));
plan.push("HANDLER_BRANCH_LINE=" + (actualHandler ? actualHandler.line : "NONE"));
plan.push("SUSPECTED_LEADER_AUTOFILL_IN_HANDLER_BRANCH=" + (suspectedLeaderAutoFill ? "YES" : "NO"));
plan.push("");
plan.push("R2_PATCH_POLICY");
plan.push("- Patch only exact handler branch for " + action + ".");
plan.push("- Section apply must only set department/section.");
plan.push("- Section apply must clear Leader fields or leave them empty.");
plan.push("- Leader apply branch remains untouched.");
plan.push("- D2 execute gate remains untouched.");
plan.push("- No debug UI / no wrapper / no bridge.");
plan.push("- Keep marker START/END because this is a constrained behavior change.");
fs.writeFileSync(patchPlanOut, plan.join("\n") + "\n");

const verify = [];
verify.push("AICompanyManager V10L-C2F-D2B-R1B verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("TARGET_ACTION=" + action);
verify.push("ACTION_OCCURRENCE_COUNT=" + occurrences.length);
verify.push("RENDER_BUTTON_OCCURRENCE_COUNT=" + renderOccurrences.length);
verify.push("DISPATCHER_OCCURRENCE_COUNT=" + dispatcherOccurrences.length);
verify.push("HANDLER_BRANCH_OCCURRENCE_COUNT=" + handlerBranchOccurrences.length);
verify.push("ACTUAL_HANDLER_BRANCH_FOUND=" + (actualHandler ? "YES" : "NO"));
verify.push("ACTUAL_HANDLER_BRANCH_LINE=" + (actualHandler ? actualHandler.line : "NONE"));
verify.push("ACTUAL_HANDLER_BRANCH_KIND=" + (actualHandler ? actualHandler.kind : "NONE"));
verify.push("LEADER_NEAR_BRANCH_HIT_COUNT=" + leaderNear.length);
verify.push("SUSPECTED_LEADER_AUTOFILL_IN_HANDLER_BRANCH=" + (suspectedLeaderAutoFill ? "YES" : "NO"));
verify.push("C2F_D2_EXECUTE_GATE_MARKER_COUNT=" + count(d2Marker));
verify.push("C2F_B3_MARKER_COUNT=" + count(b3Marker));
verify.push("SECTION_APPLY_LABEL_COUNT=" + count("課を適用"));
verify.push("LEADER_APPLY_LABEL_COUNT=" + count("Leaderを適用"));
verify.push("ACTION_ALL_CONTEXT=" + actionAllContextOut);
verify.push("HANDLER_BRANCH_CONTEXT=" + handlerBranchContextOut);
verify.push("LEADER_WRITE_NEAR_BRANCH=" + leaderWriteNearBranchOut);
verify.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

const decision = [];
decision.push("AICompanyManager V10L-C2F-D2B-R1B decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=ACTUAL_HANDLER_BRANCH_AUDITED_PATCH_NOT_APPLIED");
decision.push("TARGET_ACTION=" + action);
decision.push("ACTUAL_HANDLER_BRANCH_FOUND=" + (actualHandler ? "YES" : "NO"));
decision.push("ACTUAL_HANDLER_BRANCH_LINE=" + (actualHandler ? actualHandler.line : "NONE"));
decision.push("SUSPECTED_LEADER_AUTOFILL_IN_HANDLER_BRANCH=" + (suspectedLeaderAutoFill ? "YES" : "NO"));
decision.push("");
if (actualHandler && suspectedLeaderAutoFill) {
  decision.push("NEXT=V10L-C2F-D2B-R2_PATCH_EXACT_HANDLER_BRANCH_NO_AUTO_LEADER");
} else if (actualHandler) {
  decision.push("NEXT=V10L-C2F-D2B-R2_PATCH_BRANCH_OUTPUT_ONLY_AFTER_MANUAL_REVIEW");
} else {
  decision.push("NEXT=STOP_PATCH_TARGET_NOT_CONFIRMED");
}
decision.push("");
decision.push("NEXT_POLICY");
decision.push("- Do not patch render button line 6022.");
decision.push("- Patch actual handler branch only.");
decision.push("- Do not touch D2 execute gate.");
decision.push("- No debug UI / no wrapper / no bridge.");
decision.push("");
decision.push("FILES");
decision.push("ACTION_ALL_CONTEXT=" + actionAllContextOut);
decision.push("HANDLER_BRANCH_CONTEXT=" + handlerBranchContextOut);
decision.push("LEADER_WRITE_NEAR_BRANCH=" + leaderWriteNearBranchOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
