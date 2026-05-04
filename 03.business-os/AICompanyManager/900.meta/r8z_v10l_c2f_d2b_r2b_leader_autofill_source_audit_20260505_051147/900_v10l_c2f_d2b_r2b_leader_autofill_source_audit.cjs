const fs = require("fs");

const [
  ,
  ,
  corePath,
  verifyOut,
  decisionOut,
  actionBranchOut,
  functionRankingOut,
  suspectWindowsOut,
  patchPlanOut
] = process.argv;

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\r?\n/);

const action = "r8z-mgr-major-card-route-apply-section";
const d2Marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE";
const d2bMarker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2B";
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

function lineWindow(centerLine, before, after) {
  const start = Math.max(1, centerLine - before);
  const end = Math.min(lines.length, centerLine + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

function findLines(needle) {
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    if ((lines[i] || "").includes(needle)) out.push({ line: i + 1, text: lines[i] || "" });
  }
  return out;
}

function extractFunctions() {
  const declRe = /\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(|\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?(?:function|\()/g;
  const funcs = [];
  let m;
  while ((m = declRe.exec(src)) !== null) {
    const name = m[1] || m[2];
    const startIdx = m.index;
    const startLine = lineNoAtIndex(startIdx);
    const nextIdx = declRe.lastIndex;
    funcs.push({ name, startIdx, startLine, nextSearchStart: nextIdx });
  }

  for (let i = 0; i < funcs.length; i += 1) {
    const endIdx = i + 1 < funcs.length ? funcs[i + 1].startIdx : src.length;
    funcs[i].endIdx = endIdx;
    funcs[i].endLine = lineNoAtIndex(endIdx);
    funcs[i].text = src.slice(funcs[i].startIdx, endIdx);
  }

  return funcs;
}

const actionHits = findLines(action);
const actionWindows = actionHits.map(h => {
  const win = lineWindow(h.line, 25, 80);
  return "============================================================\n" +
    "CENTER=" + h.line + "\n" +
    "HIT=" + h.text.trim() + "\n" +
    "============================================================\n" +
    win.text;
}).join("\n\n");

fs.writeFileSync(actionBranchOut, [
  "AICompanyManager V10L-C2F-D2B-R2B section apply action occurrences",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=NO",
  "SERVER_PATCH=NO",
  "",
  "ACTION=" + action,
  "ACTION_HIT_COUNT=" + actionHits.length,
  "ACTION_HIT_LINES=" + actionHits.map(h => h.line).join(","),
  "",
  actionWindows,
  ""
].join("\n"));

const funcs = extractFunctions();

const functionScores = funcs.map(fn => {
  const t = fn.text;
  let score = 0;
  const reasons = [];

  function add(cond, points, reason) {
    if (cond) {
      score += points;
      reasons.push(reason);
    }
  }

  add(t.includes("handoffBatchRoute"), 10, "HANDOFF_BATCH_ROUTE");
  add(t.includes("leaderLabel") || t.includes("leader_label") || t.includes("assigned_leader_label"), 10, "LEADER_LABEL");
  add(t.includes("leaderPlacementId") || t.includes("leader_placement_id") || t.includes("assigned_leader_placement_id"), 10, "LEADER_PLACEMENT");
  add(t.includes("placementId") || t.includes("placement_id"), 5, "PLACEMENT_ID");
  add(t.includes("sectionId") || t.includes("section_id") || t.includes("sectionLabel") || t.includes("section_label"), 7, "SECTION");
  add(t.includes("departmentId") || t.includes("department_id") || t.includes("departmentLabel") || t.includes("department_label"), 5, "DEPARTMENT");
  add(t.includes("effective") || t.includes("Effective"), 8, "EFFECTIVE");
  add(t.includes("route") || t.includes("Route"), 4, "ROUTE");
  add(t.includes("placements") || t.includes("robotCatalog") || t.includes("Leaderを選択してください"), 4, "PLACEMENT_OR_LEADER_UI");
  add(t.includes(action), 8, "SECTION_APPLY_ACTION");

  return {
    name: fn.name,
    startLine: fn.startLine,
    endLine: fn.endLine,
    score,
    reasons,
    text: fn.text
  };
}).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.startLine - b.startLine);

const rankingLines = [];
rankingLines.push("AICompanyManager V10L-C2F-D2B-R2B leader autofill function ranking");
rankingLines.push("DB_WRITE=NO");
rankingLines.push("API_POST=NO");
rankingLines.push("CORE_PATCH=NO");
rankingLines.push("SERVER_PATCH=NO");
rankingLines.push("");
rankingLines.push("FUNCTION_CANDIDATE_COUNT=" + functionScores.length);
rankingLines.push("");

for (const item of functionScores.slice(0, 25)) {
  rankingLines.push("============================================================");
  rankingLines.push("FUNCTION=" + item.name + "; LINES=" + item.startLine + "-" + item.endLine + "; SCORE=" + item.score + "; REASONS=" + item.reasons.join(","));
  rankingLines.push("============================================================");
  const win = lineWindow(item.startLine, 0, Math.min(220, item.endLine - item.startLine + 20));
  rankingLines.push(win.text);
  rankingLines.push("");
}

fs.writeFileSync(functionRankingOut, rankingLines.join("\n"));

const suspectNeedles = [
  "handoffBatchRoute",
  "leaderLabel",
  "leader_label",
  "assigned_leader_label",
  "leaderPlacementId",
  "leader_placement_id",
  "assigned_leader_placement_id",
  "placementId",
  "placement_id",
  "sectionId",
  "section_id",
  "sectionLabel",
  "section_label",
  "effective",
  "Effective",
  "Leaderを選択してください"
];

const suspectHits = [];
for (let i = 0; i < lines.length; i += 1) {
  const text = lines[i] || "";
  if (suspectNeedles.some(n => text.includes(n))) {
    const win = lineWindow(i + 1, 18, 60);
    let score = 0;
    if (win.text.includes("handoffBatchRoute")) score += 10;
    if (win.text.includes("leaderLabel") || win.text.includes("leader_label")) score += 10;
    if (win.text.includes("leaderPlacementId") || win.text.includes("leader_placement_id")) score += 10;
    if (win.text.includes("sectionId") || win.text.includes("section_id") || win.text.includes("sectionLabel") || win.text.includes("section_label")) score += 7;
    if (win.text.includes("effective") || win.text.includes("Effective")) score += 8;
    if (win.text.includes("placementId") || win.text.includes("placement_id")) score += 5;
    if (score >= 20) suspectHits.push({ line: i + 1, text, score, win });
  }
}

const emitted = [];
const suspectLinesOut = [];
suspectLinesOut.push("AICompanyManager V10L-C2F-D2B-R2B leader autofill suspect windows");
suspectLinesOut.push("DB_WRITE=NO");
suspectLinesOut.push("API_POST=NO");
suspectLinesOut.push("CORE_PATCH=NO");
suspectLinesOut.push("SERVER_PATCH=NO");
suspectLinesOut.push("");

for (const hit of suspectHits.sort((a, b) => b.score - a.score || a.line - b.line)) {
  if (emitted.some(r => hit.line >= r.start && hit.line <= r.end)) continue;
  emitted.push({ start: hit.win.start, end: hit.win.end });
  suspectLinesOut.push("============================================================");
  suspectLinesOut.push("WINDOW=" + hit.win.start + "-" + hit.win.end + "; CENTER=" + hit.line + "; SCORE=" + hit.score);
  suspectLinesOut.push("HIT=" + hit.text.trim().slice(0, 260));
  suspectLinesOut.push("============================================================");
  suspectLinesOut.push(hit.win.text);
  suspectLinesOut.push("");
  if (emitted.length >= 20) break;
}

fs.writeFileSync(suspectWindowsOut, suspectLinesOut.join("\n"));

const top = functionScores[0] || null;
const top2 = functionScores[1] || null;
const top3 = functionScores[2] || null;

const patchPlan = [];
patchPlan.push("AICompanyManager V10L-C2F-D2B-R2B C2F-D2B-R3 patch plan");
patchPlan.push("DB_WRITE=NO");
patchPlan.push("API_POST=NO");
patchPlan.push("CORE_PATCH=NO");
patchPlan.push("SERVER_PATCH=NO");
patchPlan.push("");
patchPlan.push("FINDING");
patchPlan.push("- Failed D2B attempts are already recovered.");
patchPlan.push("- D2 execute gate remains active.");
patchPlan.push("- This audit ranks real effective/enrichment/route candidates.");
patchPlan.push("");
patchPlan.push("TOP_CANDIDATE=" + (top ? `${top.name}:${top.startLine}-${top.endLine}:score=${top.score}` : "NONE"));
patchPlan.push("SECOND_CANDIDATE=" + (top2 ? `${top2.name}:${top2.startLine}-${top2.endLine}:score=${top2.score}` : "NONE"));
patchPlan.push("THIRD_CANDIDATE=" + (top3 ? `${top3.name}:${top3.startLine}-${top3.endLine}:score=${top3.score}` : "NONE"));
patchPlan.push("");
patchPlan.push("NEXT_POLICY");
patchPlan.push("- Patch only the confirmed effective/enrichment function.");
patchPlan.push("- Do not patch button render line.");
patchPlan.push("- Do not patch D2 execute gate.");
patchPlan.push("- Section apply should preserve department/section and leave Leader empty.");
patchPlan.push("- Leader apply remains the only Leader-confirming action.");
patchPlan.push("- No debug UI / no wrapper / no bridge.");
fs.writeFileSync(patchPlanOut, patchPlan.join("\n"));

const verify = [];
verify.push("AICompanyManager V10L-C2F-D2B-R2B verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("C2F_D2_EXECUTE_GATE_MARKER_COUNT=" + count(d2Marker));
verify.push("C2F_D2B_ANY_MARKER_COUNT=" + count(d2bMarker));
verify.push("C2F_B3_MARKER_COUNT=" + count(b3Marker));
verify.push("ACTION_HIT_COUNT=" + actionHits.length);
verify.push("ACTION_HIT_LINES=" + actionHits.map(h => h.line).join(","));
verify.push("FUNCTION_CANDIDATE_COUNT=" + functionScores.length);
verify.push("SUSPECT_WINDOW_COUNT=" + emitted.length);
verify.push("TOP_CANDIDATE=" + (top ? top.name : "NONE"));
verify.push("TOP_CANDIDATE_LINES=" + (top ? `${top.startLine}-${top.endLine}` : "NONE"));
verify.push("TOP_CANDIDATE_SCORE=" + (top ? top.score : "NONE"));
verify.push("SECOND_CANDIDATE=" + (top2 ? top2.name : "NONE"));
verify.push("SECOND_CANDIDATE_LINES=" + (top2 ? `${top2.startLine}-${top2.endLine}` : "NONE"));
verify.push("THIRD_CANDIDATE=" + (top3 ? top3.name : "NONE"));
verify.push("THIRD_CANDIDATE_LINES=" + (top3 ? `${top3.startLine}-${top3.endLine}` : "NONE"));
verify.push("SECTION_APPLY_LABEL_COUNT=" + count("課を適用"));
verify.push("LEADER_APPLY_LABEL_COUNT=" + count("Leaderを適用"));
verify.push("ACTION_BRANCH_OUT=" + actionBranchOut);
verify.push("FUNCTION_RANKING_OUT=" + functionRankingOut);
verify.push("SUSPECT_WINDOWS_OUT=" + suspectWindowsOut);
verify.push("PATCH_PLAN_OUT=" + patchPlanOut);

fs.writeFileSync(verifyOut, verify.join("\n"));

const decision = [];
decision.push("AICompanyManager V10L-C2F-D2B-R2B decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=LEADER_AUTOFILL_SOURCE_RANKED_PATCH_NOT_APPLIED");
decision.push("TOP_CANDIDATE=" + (top ? `${top.name}:${top.startLine}-${top.endLine}:score=${top.score}` : "NONE"));
decision.push("SECOND_CANDIDATE=" + (top2 ? `${top2.name}:${top2.startLine}-${top2.endLine}:score=${top2.score}` : "NONE"));
decision.push("THIRD_CANDIDATE=" + (top3 ? `${top3.name}:${top3.startLine}-${top3.endLine}:score=${top3.score}` : "NONE"));
decision.push("");
decision.push("NEXT=REVIEW_TOP_CANDIDATE_THEN_C2F_D2B_R3_PATCH_EFFECTIVE_ROUTE_ONLY");
decision.push("");
decision.push("NEXT_POLICY");
decision.push("- Use FUNCTION_RANKING_OUT and SUSPECT_WINDOWS_OUT before patching.");
decision.push("- Do not patch the section apply button line.");
decision.push("- Do not patch D2 execute gate.");
decision.push("- No debug UI / no wrapper / no bridge.");
decision.push("");
decision.push("FILES");
decision.push("ACTION_BRANCH_OUT=" + actionBranchOut);
decision.push("FUNCTION_RANKING_OUT=" + functionRankingOut);
decision.push("SUSPECT_WINDOWS_OUT=" + suspectWindowsOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);

fs.writeFileSync(decisionOut, decision.join("\n"));
