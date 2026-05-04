const fs = require("fs");

const [
  ,
  ,
  corePath,
  verifyOut,
  decisionOut,
  clearContextOut,
  leaderContextOut,
  routeContextOut,
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

function emitWindows(title, hits, outPath) {
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
    const win = lineWindow(h.line, 20, 45);
    emitted.push({ start: win.start, end: win.end });
    out.push("============================================================");
    out.push("WINDOW=" + win.start + "-" + win.end + "; CENTER=" + h.line + "; TEXT=" + h.text.trim().slice(0, 220));
    out.push("============================================================");
    out.push(win.text);
    out.push("");
  }

  fs.writeFileSync(outPath, out.join("\n") + "\n");
}

const clearHits = [
  ...findLineIncludes("引き渡し先を解除"),
  ...findLineIncludes("clear"),
  ...findLineIncludes("解除"),
  ...findLineIncludes("handoffBatchRoute ="),
  ...findLineIncludes("handoffBatchRoute"),
].filter((h, idx, arr) => arr.findIndex(x => x.line === h.line) === idx);

const leaderHits = [
  ...findLineIncludes("Leaderを適用"),
  ...findLineIncludes("apply-leader"),
  ...findLineIncludes("leaderLabel"),
  ...findLineIncludes("leader_label"),
  ...findLineIncludes("leaderPlacementId"),
  ...findLineIncludes("leader_placement_id"),
  ...findLineIncludes("Leaderを選択してください"),
].filter((h, idx, arr) => arr.findIndex(x => x.line === h.line) === idx);

const routeHits = [
  ...findLineIncludes("handoffBatchRoute"),
  ...findLineIncludes("aicmR8zMgrMajorCardSelectionState"),
  ...findLineIncludes("r8zMgrMajorCardSelection"),
  ...findLineIncludes("aicmR8zC2cEffectiveHandoffRoute"),
  ...findLineIncludes("aicmR8zC2cApplySectionRoute"),
  ...findLineIncludes("aicmR8zC2cApplyLeaderRoute"),
].filter((h, idx, arr) => arr.findIndex(x => x.line === h.line) === idx);

emitWindows("AICompanyManager V10L-C2F-D2A clear action context", clearHits, clearContextOut);
emitWindows("AICompanyManager V10L-C2F-D2A leader apply context", leaderHits, leaderContextOut);
emitWindows("AICompanyManager V10L-C2F-D2A route state context", routeHits, routeContextOut);

const hasClearButton = count("引き渡し先を解除") > 0;
const clearActionHits = findLineIncludes("r8z-mgr-major-card").filter(h => /clear|reset|remove|解除|handoff/i.test(h.text));
const clearWritesEmptyRoute = /handoffBatchRoute\s*=\s*(null|undefined|\{\})/.test(src) || /delete\s+[^;]*handoffBatchRoute/.test(src);
const clearWritesLeaderEmpty =
  /leaderLabel\s*:\s*["']["']/.test(src) ||
  /leader_label\s*:\s*["']["']/.test(src) ||
  /leaderPlacementId\s*:\s*["']["']/.test(src) ||
  /leader_placement_id\s*:\s*["']["']/.test(src);

const leaderPlaceholderCount = count("Leaderを選択してください");
const leaderApplyCount = count("Leaderを適用");
const appliedLeaderGachiCount = count("ガチ");
const handoffBatchRouteCount = count("handoffBatchRoute");
const c2fD2MarkerCount = count("AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE");

const plan = [];
plan.push("AICompanyManager V10L-C2F-D2A C2F-D2B patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("OBSERVED");
plan.push("- UI can show Leader placeholder while applied route still has Leader.");
plan.push("- Abnormal test requires route state clear, not just combo placeholder.");
plan.push("");
plan.push("RECOMMENDED_NEXT");
plan.push("- First try existing 引き渡し先を解除 button manually.");
plan.push("- If summary still shows Leader after clearing, patch clear action only.");
plan.push("- Patch target should be existing clear/reset action branch, not D2 execute gate.");
plan.push("- Clear must remove department/section/leader/leaderPlacement/applied flag from the single canonical handoffBatchRoute object.");
plan.push("- Do not add debug UI.");
plan.push("- Do not add wrapper/bridge.");
plan.push("- DB_WRITE=NO / API_POST=NO.");
fs.writeFileSync(patchPlanOut, plan.join("\n") + "\n");

const verify = [];
verify.push("AICompanyManager V10L-C2F-D2A verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("CLEAR_BUTTON_LABEL_COUNT=" + count("引き渡し先を解除"));
verify.push("CLEAR_RELATED_ACTION_LINE_COUNT=" + clearActionHits.length);
verify.push("CLEAR_WRITES_EMPTY_ROUTE_STATIC=" + (clearWritesEmptyRoute ? "YES" : "NO"));
verify.push("CLEAR_WRITES_LEADER_EMPTY_STATIC=" + (clearWritesLeaderEmpty ? "YES" : "NO"));
verify.push("LEADER_PLACEHOLDER_COUNT=" + leaderPlaceholderCount);
verify.push("LEADER_APPLY_LABEL_COUNT=" + leaderApplyCount);
verify.push("GACHI_TEXT_COUNT=" + appliedLeaderGachiCount);
verify.push("HANDOFF_BATCH_ROUTE_COUNT=" + handoffBatchRouteCount);
verify.push("C2F_D2_MARKER_COUNT=" + c2fD2MarkerCount);
verify.push("C2F_B3_MARKER_COUNT=" + count("AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE"));
verify.push("CLEAR_CONTEXT_OUT=" + clearContextOut);
verify.push("LEADER_CONTEXT_OUT=" + leaderContextOut);
verify.push("ROUTE_CONTEXT_OUT=" + routeContextOut);
verify.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

const decision = [];
decision.push("AICompanyManager V10L-C2F-D2A decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=LEADER_ROUTE_CLEAR_AUTOFILL_AUDITED_PATCH_NOT_APPLIED");
decision.push("LIKELY_CAUSE=Leader select placeholder and applied handoffBatchRoute are separate states; applied route retains previous Leader.");
decision.push("");
decision.push("NEXT_MANUAL_CHECK");
decision.push("- Press 引き渡し先を解除.");
decision.push("- Confirm 一括引き渡し先 becomes 部門:- / 課:- / Leader:- / 未適用.");
decision.push("- Then execute to confirm abnormal validation.");
decision.push("");
decision.push("IF_CLEAR_DOES_NOT_RESET_SUMMARY");
decision.push("- NEXT=V10L-C2F-D2B_CLEAR_HANDOFF_BATCH_ROUTE_PATCH");
decision.push("- Patch only existing clear action branch.");
decision.push("- Do not touch execute gate.");
decision.push("- Do not add debug UI.");
fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
