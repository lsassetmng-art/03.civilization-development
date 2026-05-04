const fs = require("fs");

const [
  ,
  ,
  corePath,
  serverPath,
  verifyOut,
  decisionOut,
  actionScanOut,
  postWindowOut,
  executeWindowOut,
  patchPlanOut
] = process.argv;

const src = fs.readFileSync(corePath, "utf8");
const server = fs.readFileSync(serverPath, "utf8");
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

function lineWindow(centerLine, before, after) {
  const start = Math.max(1, centerLine - before);
  const end = Math.min(lines.length, centerLine + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

function findAll(needle) {
  const out = [];
  let from = 0;
  while (true) {
    const idx = src.indexOf(needle, from);
    if (idx < 0) break;
    const line = lineNoAtIndex(idx);
    out.push({ needle, index: idx, line, text: lines[line - 1] || "" });
    from = idx + needle.length;
  }
  return out;
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

function extractActions(text) {
  const actions = new Map();
  const patterns = [
    /data-core-action=["']([^"']+)["']/g,
    /action\s*===\s*["']([^"']+)["']/g,
    /action\s*==\s*["']([^"']+)["']/g,
    /case\s+["']([^"']+)["']/g
  ];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) {
      const action = m[1];
      if (!actions.has(action)) actions.set(action, []);
      actions.get(action).push({
        line: lineNoAtIndex(m.index),
        raw: m[0]
      });
    }
  }

  return actions;
}

const functionDecls = [];
const fnRe = /(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g;
let fm;
while ((fm = fnRe.exec(src)) !== null) {
  functionDecls.push({
    name: fm[1],
    index: fm.index,
    line: lineNoAtIndex(fm.index),
    text: lines[lineNoAtIndex(fm.index) - 1] || ""
  });
}

function scoreWindow(decl) {
  const win = lineWindow(decl.line, 0, 240);
  const t = win.text;
  let score = 0;
  const reasons = [];

  if (/execute|Execute|実行/.test(decl.name)) {
    score += 100;
    reasons.push("FUNCTION_NAME_EXECUTE");
  }
  if (/Confirm|confirm|Handoff|handoff/.test(decl.name)) {
    score += 70;
    reasons.push("FUNCTION_NAME_CONFIRM_HANDOFF");
  }
  if (t.includes("fetch(")) {
    score += 120;
    reasons.push("WINDOW_HAS_FETCH");
  }
  if (t.includes("method: \"POST\"") || t.includes("method: 'POST'") || t.includes("method:\"POST\"") || t.includes("method:'POST'")) {
    score += 120;
    reasons.push("WINDOW_HAS_POST_METHOD");
  }
  if (t.includes("/api/aicm/v2/manager-major/update") || t.includes("manager-major/update")) {
    score += 130;
    reasons.push("WINDOW_HAS_MANAGER_MAJOR_UPDATE");
  }
  if (t.includes("Yes") || t.includes("はい") || t.includes("confirm")) {
    score += 40;
    reasons.push("WINDOW_HAS_YES_CONFIRM_TEXT");
  }
  if (t.includes("handoffBatchRoute") || t.includes("leaderPlacementId") || t.includes("leaderLabel") || t.includes("departmentLabel") || t.includes("sectionLabel")) {
    score += 80;
    reasons.push("WINDOW_USES_ROUTE_STATE");
  }
  if (t.includes("aicmR8zMgrMajorCardSelectedRows") || t.includes("selectedRows")) {
    score += 60;
    reasons.push("WINDOW_USES_SELECTED_ROWS");
  }
  if (t.includes("manager_major_item_id") || t.includes("managerMajorItemId") || t.includes("major_item_id")) {
    score += 50;
    reasons.push("WINDOW_USES_MAJOR_ID");
  }

  return { decl, win, score, reasons };
}

const ranked = functionDecls
  .map(scoreWindow)
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score);

const top = ranked.slice(0, 12);
const topCandidate = top[0] || null;

const actionMap = extractActions(src);
const actionLines = [];
actionLines.push("AICompanyManager V10L-C2F-C yes/execute action scan");
actionLines.push("DB_WRITE=NO");
actionLines.push("API_POST=NO");
actionLines.push("CORE_PATCH=NO");
actionLines.push("SERVER_PATCH=NO");
actionLines.push("");
actionLines.push("HANDOFF_OR_CONFIRM_ACTIONS");
for (const action of Array.from(actionMap.keys()).sort()) {
  if (/handoff|confirm|yes|execute|manager-major-card|leader/i.test(action)) {
    const list = actionMap.get(action);
    actionLines.push("- " + action + " count=" + list.length + " lines=" + list.slice(0, 10).map(x => x.line).join(","));
  }
}
fs.writeFileSync(actionScanOut, actionLines.join("\n") + "\n");

const postNeedles = [
  "fetch(",
  "method: \"POST\"",
  "method: 'POST'",
  "/api/aicm/v2/manager-major/update",
  "manager-major/update",
  "aicmExecuteLeaderHandoffConfirmR8S",
  "executeLeaderHandoff",
  "LeaderHandoffConfirm",
  "open-handoff-confirm",
  "handoff-confirm",
  "Yes",
  "No"
];

const postHits = [];
for (const n of postNeedles) {
  for (const h of findAll(n)) {
    postHits.push(h);
  }
}
postHits.sort((a, b) => a.line - b.line || a.index - b.index);

const postWindow = [];
postWindow.push("AICompanyManager V10L-C2F-C post candidate windows");
postWindow.push("DB_WRITE=NO");
postWindow.push("API_POST=NO");
postWindow.push("CORE_PATCH=NO");
postWindow.push("SERVER_PATCH=NO");
postWindow.push("");

const emitted = [];
for (const hit of postHits) {
  if (emitted.some(r => hit.line >= r.start && hit.line <= r.end)) continue;
  const win = lineWindow(hit.line, 12, 45);
  emitted.push({ start: win.start, end: win.end });
  postWindow.push("============================================================");
  postWindow.push("WINDOW=" + win.start + "-" + win.end + "; CENTER=" + hit.line + "; NEEDLE=" + hit.needle);
  postWindow.push("============================================================");
  postWindow.push(win.text);
  postWindow.push("");
}
fs.writeFileSync(postWindowOut, postWindow.join("\n") + "\n");

const execWindow = [];
execWindow.push("AICompanyManager V10L-C2F-C execute function windows");
execWindow.push("DB_WRITE=NO");
execWindow.push("API_POST=NO");
execWindow.push("CORE_PATCH=NO");
execWindow.push("SERVER_PATCH=NO");
execWindow.push("");

for (const item of top.slice(0, 8)) {
  execWindow.push("============================================================");
  execWindow.push("FUNCTION=" + item.decl.name);
  execWindow.push("LINES=" + item.win.start + "-" + item.win.end);
  execWindow.push("SCORE=" + item.score);
  execWindow.push("REASONS=" + item.reasons.join(","));
  execWindow.push("============================================================");
  execWindow.push(item.win.text);
  execWindow.push("");
}
fs.writeFileSync(executeWindowOut, execWindow.join("\n") + "\n");

const executeFn = functionDecls.find(f => f.name === "aicmExecuteLeaderHandoffConfirmR8S") || null;
const executeRank = ranked.find(x => x.decl.name === "aicmExecuteLeaderHandoffConfirmR8S") || null;

const plan = [];
plan.push("AICompanyManager V10L-C2F-C C2F-D patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("RECOMMENDED_TARGET=" + (executeFn ? "aicmExecuteLeaderHandoffConfirmR8S" : (topCandidate ? topCandidate.decl.name : "NONE")));
plan.push("RECOMMENDED_TARGET_LINE=" + (executeFn ? executeFn.line : (topCandidate ? topCandidate.decl.line : "NONE")));
plan.push("");
plan.push("PATCH_POLICY");
plan.push("- Do not patch display renderer.");
plan.push("- Patch execute/Yes/POST path only.");
plan.push("- C2F-D must still keep API_POST=NO unless explicitly approved.");
plan.push("- For now, patch should block before fetch/POST and show/record a visible validation failure.");
plan.push("- Do not touch server/API/DB route.");
plan.push("- Do not use wrapper/bridge.");
plan.push("- Use exact line anchor near execute function start or before fetch.");
plan.push("- If branch added, keep marker START/END and delete path.");
plan.push("");
plan.push("VALIDATION_REQUIRED");
plan.push("- selected rows non-empty");
plan.push("- stable manager major ids");
plan.push("- route applied");
plan.push("- department present");
plan.push("- section present");
plan.push("- leader present");
plan.push("- leader placement id present");
plan.push("- payload candidate matches route state");
fs.writeFileSync(patchPlanOut, plan.join("\n") + "\n");

const verify = [];
verify.push("AICompanyManager V10L-C2F-C verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("FUNCTION_DECL_COUNT=" + functionDecls.length);
verify.push("EXECUTE_RANKED_FUNCTION_COUNT=" + ranked.length);
verify.push("TOP_CANDIDATE=" + (topCandidate ? topCandidate.decl.name : "NONE"));
verify.push("TOP_CANDIDATE_LINE=" + (topCandidate ? topCandidate.decl.line : "NONE"));
verify.push("TOP_CANDIDATE_SCORE=" + (topCandidate ? topCandidate.score : "0"));
verify.push("AICM_EXECUTE_LEADER_HANDOFF_FOUND=" + (executeFn ? "YES" : "NO"));
verify.push("AICM_EXECUTE_LEADER_HANDOFF_LINE=" + (executeFn ? executeFn.line : "NONE"));
verify.push("AICM_EXECUTE_LEADER_HANDOFF_SCORE=" + (executeRank ? executeRank.score : "NONE"));
verify.push("CORE_FETCH_COUNT=" + count(src, "fetch("));
verify.push("CORE_POST_METHOD_COUNT=" + count(src, "method: \"POST\"") + count(src, "method: 'POST'"));
verify.push("CORE_MANAGER_MAJOR_UPDATE_COUNT=" + count(src, "/api/aicm/v2/manager-major/update") + count(src, "manager-major/update"));
verify.push("SERVER_MANAGER_MAJOR_UPDATE_COUNT=" + count(server, "/api/aicm/v2/manager-major/update") + count(server, "manager-major/update"));
verify.push("C2F_B3_MARKER_COUNT=" + count(src, "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE"));
verify.push("ROUTE_UI_LABEL_COUNT=" + count(src, "一括引き渡し先"));
verify.push("SECTION_APPLY_LABEL_COUNT=" + count(src, "課を適用"));
verify.push("LEADER_APPLY_LABEL_COUNT=" + count(src, "Leaderを適用"));
verify.push("ACTION_SCAN_OUT=" + actionScanOut);
verify.push("POST_WINDOW_OUT=" + postWindowOut);
verify.push("EXECUTE_WINDOW_OUT=" + executeWindowOut);
verify.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

const decision = [];
decision.push("AICompanyManager V10L-C2F-C decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=EXECUTE_POST_CANDIDATES_AUDITED_PATCH_NOT_APPLIED");
decision.push("RECOMMENDED_TARGET=" + (executeFn ? "aicmExecuteLeaderHandoffConfirmR8S" : (topCandidate ? topCandidate.decl.name : "NONE")));
decision.push("RECOMMENDED_TARGET_LINE=" + (executeFn ? executeFn.line : (topCandidate ? topCandidate.decl.line : "NONE")));
decision.push("");
decision.push("NEXT_POLICY");
decision.push("- C2F-D should patch execute/Yes/POST path, not display renderer.");
decision.push("- The patch must block before fetch/POST.");
decision.push("- API_POST remains NO until explicit approval.");
decision.push("- DB_WRITE remains NO.");
decision.push("- Do not touch server route.");
decision.push("- No wrapper / no bridge.");
decision.push("- Include removable marker if temporary.");
decision.push("");
decision.push("NEXT=V10L-C2F-D_EXECUTE_PATH_PRE_POST_GATE_PATCH_OR_READONLY_EXACT_ANCHOR");
decision.push("");
decision.push("FILES");
decision.push("ACTION_SCAN_OUT=" + actionScanOut);
decision.push("POST_WINDOW_OUT=" + postWindowOut);
decision.push("EXECUTE_WINDOW_OUT=" + executeWindowOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
