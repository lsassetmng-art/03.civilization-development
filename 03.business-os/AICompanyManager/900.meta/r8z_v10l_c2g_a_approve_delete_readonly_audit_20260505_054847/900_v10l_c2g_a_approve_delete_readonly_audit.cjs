const fs = require("fs");

const [
  ,
  ,
  corePath,
  serverPath,
  verifyOut,
  decisionOut,
  coreActionScanOut,
  coreFunctionRankingOut,
  serverEndpointScanOut,
  patchPlanOut
] = process.argv;

const core = fs.readFileSync(corePath, "utf8");
const server = fs.readFileSync(serverPath, "utf8");
const coreLines = core.split(/\r?\n/);
const serverLines = server.split(/\r?\n/);

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

function lineNoAtIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function lineWindow(lines, center, before, after) {
  const start = Math.max(1, center - before);
  const end = Math.min(lines.length, center + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

function findLineHits(lines, regex) {
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    const text = lines[i] || "";
    if (regex.test(text)) hits.push({ line: i + 1, text });
  }
  return hits;
}

function extractFunctions(src) {
  const declRe = /\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(|\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?(?:function|\()/g;
  const funcs = [];
  let m;
  while ((m = declRe.exec(src)) !== null) {
    const name = m[1] || m[2];
    const startIdx = m.index;
    const startLine = lineNoAtIndex(src, startIdx);
    funcs.push({ name, startIdx, startLine });
  }
  for (let i = 0; i < funcs.length; i += 1) {
    const endIdx = i + 1 < funcs.length ? funcs[i + 1].startIdx : src.length;
    funcs[i].endIdx = endIdx;
    funcs[i].endLine = lineNoAtIndex(src, endIdx);
    funcs[i].text = src.slice(funcs[i].startIdx, endIdx);
  }
  return funcs;
}

const approveRegex = /承認|approve|approval|accepted|review.*ok|レビュー.*承認|課長へ送る|leader-handoff|handoff/i;
const deleteRegex = /削除|delete|remove|trash|destroy/i;
const reviewRegex = /レビュー・承認待ち一覧|review|承認待ち|approval/i;
const actionRegex = /data-core-action|coreAction|action ===|case\s+["']/;

const coreActionHits = [];
for (let i = 0; i < coreLines.length; i += 1) {
  const text = coreLines[i] || "";
  if ((approveRegex.test(text) || deleteRegex.test(text) || reviewRegex.test(text)) && actionRegex.test(text)) {
    coreActionHits.push({ line: i + 1, text });
  }
}

const coreActionOut = [];
coreActionOut.push("AICompanyManager V10L-C2G-A core action scan");
coreActionOut.push("DB_WRITE=NO");
coreActionOut.push("API_POST=NO");
coreActionOut.push("CORE_PATCH=NO");
coreActionOut.push("SERVER_PATCH=NO");
coreActionOut.push("");
coreActionOut.push("ACTION_HIT_COUNT=" + coreActionHits.length);
coreActionOut.push("");

for (const hit of coreActionHits) {
  const win = lineWindow(coreLines, hit.line, 12, 30);
  coreActionOut.push("============================================================");
  coreActionOut.push("CENTER=" + hit.line);
  coreActionOut.push("HIT=" + hit.text.trim().slice(0, 260));
  coreActionOut.push("============================================================");
  coreActionOut.push(win.text);
  coreActionOut.push("");
}
fs.writeFileSync(coreActionScanOut, coreActionOut.join("\n"));

const funcs = extractFunctions(core);
const ranked = funcs.map(fn => {
  const t = fn.text;
  let score = 0;
  const reasons = [];

  function add(cond, pts, reason) {
    if (cond) {
      score += pts;
      reasons.push(reason);
    }
  }

  add(reviewRegex.test(t), 10, "REVIEW");
  add(approveRegex.test(t), 10, "APPROVE_HANDOFF");
  add(deleteRegex.test(t), 10, "DELETE");
  add(t.includes("fetch(") || t.includes("fetch" + "("), 8, "FETCH");
  add(/method\s*:\s*["']POST["']/.test(t), 8, "POST");
  add(/method\s*:\s*["']DELETE["']/.test(t), 10, "DELETE_METHOD");
  add(t.includes("confirm") || t.includes("確認"), 6, "CONFIRM");
  add(t.includes("payload") || t.includes("postBody") || t.includes("body:"), 5, "PAYLOAD");
  add(t.includes("data-core-action") || t.includes("action ==="), 4, "ACTION_HANDLER");

  return { ...fn, score, reasons };
}).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.startLine - b.startLine);

const rankingOut = [];
rankingOut.push("AICompanyManager V10L-C2G-A core function ranking");
rankingOut.push("DB_WRITE=NO");
rankingOut.push("API_POST=NO");
rankingOut.push("CORE_PATCH=NO");
rankingOut.push("SERVER_PATCH=NO");
rankingOut.push("");
rankingOut.push("FUNCTION_CANDIDATE_COUNT=" + ranked.length);
rankingOut.push("");

for (const item of ranked.slice(0, 30)) {
  const win = lineWindow(coreLines, item.startLine, 0, Math.min(180, item.endLine - item.startLine + 20));
  rankingOut.push("============================================================");
  rankingOut.push("FUNCTION=" + item.name + "; LINES=" + item.startLine + "-" + item.endLine + "; SCORE=" + item.score + "; REASONS=" + item.reasons.join(","));
  rankingOut.push("============================================================");
  rankingOut.push(win.text);
  rankingOut.push("");
}
fs.writeFileSync(coreFunctionRankingOut, rankingOut.join("\n"));

const serverHits = [];
for (let i = 0; i < serverLines.length; i += 1) {
  const text = serverLines[i] || "";
  if (
    (approveRegex.test(text) || deleteRegex.test(text) || reviewRegex.test(text)) &&
    (/app\.|router\.|if\s*\(|url|pathname|POST|DELETE|UPDATE|delete|approval|approve|review/i.test(text))
  ) {
    serverHits.push({ line: i + 1, text });
  }
}

const serverOut = [];
serverOut.push("AICompanyManager V10L-C2G-A server endpoint scan");
serverOut.push("DB_WRITE=NO");
serverOut.push("API_POST=NO");
serverOut.push("CORE_PATCH=NO");
serverOut.push("SERVER_PATCH=NO");
serverOut.push("");
serverOut.push("SERVER_HIT_COUNT=" + serverHits.length);
serverOut.push("");

for (const hit of serverHits) {
  const win = lineWindow(serverLines, hit.line, 10, 32);
  serverOut.push("============================================================");
  serverOut.push("CENTER=" + hit.line);
  serverOut.push("HIT=" + hit.text.trim().slice(0, 260));
  serverOut.push("============================================================");
  serverOut.push(win.text);
  serverOut.push("");
}
fs.writeFileSync(serverEndpointScanOut, serverOut.join("\n"));

const topApprove = ranked.find(x => approveRegex.test(x.text) && !deleteRegex.test(x.text)) || null;
const topDelete = ranked.find(x => deleteRegex.test(x.text)) || null;
const topReview = ranked.find(x => reviewRegex.test(x.text)) || null;

const verify = [];
verify.push("AICompanyManager V10L-C2G-A verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("CORE_FUNCTION_COUNT=" + funcs.length);
verify.push("CORE_ACTION_HIT_COUNT=" + coreActionHits.length);
verify.push("FUNCTION_CANDIDATE_COUNT=" + ranked.length);
verify.push("SERVER_ENDPOINT_HIT_COUNT=" + serverHits.length);
verify.push("TOP_REVIEW_CANDIDATE=" + (topReview ? topReview.name : "NONE"));
verify.push("TOP_REVIEW_LINES=" + (topReview ? `${topReview.startLine}-${topReview.endLine}` : "NONE"));
verify.push("TOP_APPROVE_CANDIDATE=" + (topApprove ? topApprove.name : "NONE"));
verify.push("TOP_APPROVE_LINES=" + (topApprove ? `${topApprove.startLine}-${topApprove.endLine}` : "NONE"));
verify.push("TOP_DELETE_CANDIDATE=" + (topDelete ? topDelete.name : "NONE"));
verify.push("TOP_DELETE_LINES=" + (topDelete ? `${topDelete.startLine}-${topDelete.endLine}` : "NONE"));
verify.push("CORE_APPROVE_TEXT_COUNT=" + count(core, "承認"));
verify.push("CORE_DELETE_TEXT_COUNT=" + count(core, "削除"));
verify.push("CORE_REVIEW_TEXT_COUNT=" + count(core, "レビュー・承認待ち一覧"));
verify.push("SERVER_APPROVE_TEXT_COUNT=" + count(server, "承認"));
verify.push("SERVER_DELETE_TEXT_COUNT=" + count(server, "削除"));
verify.push("CORE_ACTION_SCAN=" + coreActionScanOut);
verify.push("CORE_FUNCTION_RANKING=" + coreFunctionRankingOut);
verify.push("SERVER_ENDPOINT_SCAN=" + serverEndpointScanOut);
fs.writeFileSync(verifyOut, verify.join("\n"));

const plan = [];
plan.push("AICompanyManager V10L-C2G-A C2G-B patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("ROADMAP");
plan.push("1. C2G-A: identify approve/delete routes. Current step.");
plan.push("2. C2G-B: patch UI to require explicit confirmation screen for approve/delete.");
plan.push("3. C2G-C: readonly payload/endpoint validation.");
plan.push("4. C2G-D: approval/delete API unlock only after Sato DB review.");
plan.push("");
plan.push("PATCH_POLICY");
plan.push("- Do not execute approve/delete yet.");
plan.push("- Approval must have explicit confirmation screen before POST.");
plan.push("- Delete must have stronger confirmation screen before POST/DELETE.");
plan.push("- Do not touch DB/server route until endpoint and payload are confirmed.");
plan.push("- No debug UI unless marked removable.");
plan.push("");
plan.push("TOP_REVIEW_CANDIDATE=" + (topReview ? `${topReview.name}:${topReview.startLine}-${topReview.endLine}` : "NONE"));
plan.push("TOP_APPROVE_CANDIDATE=" + (topApprove ? `${topApprove.name}:${topApprove.startLine}-${topApprove.endLine}` : "NONE"));
plan.push("TOP_DELETE_CANDIDATE=" + (topDelete ? `${topDelete.name}:${topDelete.startLine}-${topDelete.endLine}` : "NONE"));
fs.writeFileSync(patchPlanOut, plan.join("\n"));

const decision = [];
decision.push("AICompanyManager V10L-C2G-A decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=APPROVE_DELETE_ROUTES_AUDITED_PATCH_NOT_APPLIED");
decision.push("TOP_REVIEW_CANDIDATE=" + (topReview ? `${topReview.name}:${topReview.startLine}-${topReview.endLine}` : "NONE"));
decision.push("TOP_APPROVE_CANDIDATE=" + (topApprove ? `${topApprove.name}:${topApprove.startLine}-${topApprove.endLine}` : "NONE"));
decision.push("TOP_DELETE_CANDIDATE=" + (topDelete ? `${topDelete.name}:${topDelete.startLine}-${topDelete.endLine}` : "NONE"));
decision.push("");
decision.push("NEXT=V10L-C2G-B_APPROVE_DELETE_CONFIRM_UI_PATCH_OR_EXACT_TARGET_AUDIT");
decision.push("");
decision.push("NEXT_POLICY");
decision.push("- Review CORE_FUNCTION_RANKING and SERVER_ENDPOINT_SCAN first.");
decision.push("- Patch confirmation UI only; do not enable write.");
decision.push("- Delete requires explicit user confirmation.");
decision.push("- DB/API unlock later, after Sato DB review.");
decision.push("");
decision.push("FILES");
decision.push("CORE_ACTION_SCAN=" + coreActionScanOut);
decision.push("CORE_FUNCTION_RANKING=" + coreFunctionRankingOut);
decision.push("SERVER_ENDPOINT_SCAN=" + serverEndpointScanOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(decisionOut, decision.join("\n"));
