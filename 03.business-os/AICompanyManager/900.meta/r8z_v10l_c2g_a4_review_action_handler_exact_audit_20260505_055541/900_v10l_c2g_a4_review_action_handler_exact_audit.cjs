const fs = require("fs");

const [
  ,
  ,
  corePath,
  serverPath,
  verifyOut,
  decisionOut,
  actionOccurrenceOut,
  handlerCandidateOut,
  fetchPostOut,
  serverEndpointOut,
  patchPlanOut
] = process.argv;

const core = fs.readFileSync(corePath, "utf8");
const server = fs.readFileSync(serverPath, "utf8");
const coreLines = core.split(/\r?\n/);
const serverLines = server.split(/\r?\n/);

const targetActions = [
  "human-review-approve",
  "human-review-return",
  "human-review-delete",
  "human-review-remove",
  "human-review-trash"
];

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

function findLines(lines, needle) {
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    const text = lines[i] || "";
    if (text.includes(needle)) hits.push({ line: i + 1, text });
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

const funcs = extractFunctions(core);

function functionForLine(line) {
  return funcs.find(f => line >= f.startLine && line <= f.endLine) || null;
}

const occurrenceOut = [];
occurrenceOut.push("AICompanyManager V10L-C2G-A4 action occurrence windows");
occurrenceOut.push("DB_WRITE=NO");
occurrenceOut.push("API_POST=NO");
occurrenceOut.push("CORE_PATCH=NO");
occurrenceOut.push("SERVER_PATCH=NO");
occurrenceOut.push("");

const actionStats = [];

for (const action of targetActions) {
  const hits = findLines(coreLines, action);
  actionStats.push({ action, hits });

  occurrenceOut.push("============================================================");
  occurrenceOut.push("ACTION=" + action + "; HIT_COUNT=" + hits.length);
  occurrenceOut.push("============================================================");

  if (hits.length === 0) {
    occurrenceOut.push("NO_HIT");
    occurrenceOut.push("");
    continue;
  }

  for (const h of hits) {
    const fn = functionForLine(h.line);
    const win = lineWindow(coreLines, h.line, 12, 34);
    occurrenceOut.push("CENTER=" + h.line + "; FUNCTION=" + (fn ? fn.name + ":" + fn.startLine + "-" + fn.endLine : "NONE"));
    occurrenceOut.push(win.text);
    occurrenceOut.push("");
  }
}

fs.writeFileSync(actionOccurrenceOut, occurrenceOut.join("\n"));

function scoreFunctionForAction(fn, action) {
  const t = fn.text;
  let score = 0;
  const reasons = [];

  function add(cond, pts, reason) {
    if (cond) {
      score += pts;
      reasons.push(reason);
    }
  }

  add(t.includes(action), 30, "HAS_ACTION");
  add(new RegExp(`action\\s*={0,2}\\s*["']${action}["']`).test(t), 30, "ACTION_COMPARE");
  add(new RegExp(`case\\s+["']${action}["']`).test(t), 30, "ACTION_CASE");
  add(/data-core-action/.test(t), 6, "RENDER_ACTION");
  add(/fetch\s*\(/.test(t), 12, "FETCH");
  add(/method\s*:\s*["']POST["']/.test(t), 10, "POST");
  add(/method\s*:\s*["']DELETE["']/.test(t), 12, "DELETE_METHOD");
  add(/body\s*:|JSON\.stringify|postBody|payload/.test(t), 8, "PAYLOAD");
  add(/confirm|確認|Yes|No/.test(t), 5, "CONFIRM_TEXT");
  add(/承認|approve|approval/.test(t), 5, "APPROVE_TEXT");
  add(/差し戻|返却|return/.test(t), 5, "RETURN_TEXT");
  add(/削除|delete|remove|trash/.test(t), 5, "DELETE_TEXT");

  return { ...fn, action, score, reasons };
}

const handlerCandidates = [];
for (const action of targetActions) {
  for (const fn of funcs) {
    const r = scoreFunctionForAction(fn, action);
    if (r.score > 0) handlerCandidates.push(r);
  }
}
handlerCandidates.sort((a, b) => b.score - a.score || a.startLine - b.startLine);

const handlerOut = [];
handlerOut.push("AICompanyManager V10L-C2G-A4 handler candidate windows");
handlerOut.push("DB_WRITE=NO");
handlerOut.push("API_POST=NO");
handlerOut.push("CORE_PATCH=NO");
handlerOut.push("SERVER_PATCH=NO");
handlerOut.push("");

for (const item of handlerCandidates.slice(0, 35)) {
  const win = lineWindow(coreLines, item.startLine, 0, Math.min(240, item.endLine - item.startLine + 20));
  handlerOut.push("============================================================");
  handlerOut.push("ACTION=" + item.action + "; FUNCTION=" + item.name + "; LINES=" + item.startLine + "-" + item.endLine + "; SCORE=" + item.score + "; REASONS=" + item.reasons.join(","));
  handlerOut.push("============================================================");
  handlerOut.push(win.text);
  handlerOut.push("");
}

fs.writeFileSync(handlerCandidateOut, handlerOut.join("\n"));

const fetchCandidates = [];
for (const fn of funcs) {
  const hasAction = targetActions.some(a => fn.text.includes(a));
  const hasFetch = /fetch\s*\(/.test(fn.text);
  const hasPost = /method\s*:\s*["']POST["']/.test(fn.text);
  const hasDelete = /method\s*:\s*["']DELETE["']/.test(fn.text);
  if (hasAction || hasFetch || hasPost || hasDelete) {
    const score =
      (hasAction ? 50 : 0) +
      (hasFetch ? 20 : 0) +
      (hasPost ? 20 : 0) +
      (hasDelete ? 25 : 0) +
      (/manager-major|review|approval|approve|delete|return|handoff/i.test(fn.text) ? 10 : 0);
    if (score >= 40) {
      fetchCandidates.push({ ...fn, score, hasAction, hasFetch, hasPost, hasDelete });
    }
  }
}
fetchCandidates.sort((a, b) => b.score - a.score || a.startLine - b.startLine);

const fetchOut = [];
fetchOut.push("AICompanyManager V10L-C2G-A4 fetch/post windows");
fetchOut.push("DB_WRITE=NO");
fetchOut.push("API_POST=NO");
fetchOut.push("CORE_PATCH=NO");
fetchOut.push("SERVER_PATCH=NO");
fetchOut.push("");

for (const item of fetchCandidates.slice(0, 25)) {
  const win = lineWindow(coreLines, item.startLine, 0, Math.min(260, item.endLine - item.startLine + 30));
  fetchOut.push("============================================================");
  fetchOut.push("FUNCTION=" + item.name + "; LINES=" + item.startLine + "-" + item.endLine + "; SCORE=" + item.score + "; HAS_ACTION=" + item.hasAction + "; HAS_FETCH=" + item.hasFetch + "; HAS_POST=" + item.hasPost + "; HAS_DELETE=" + item.hasDelete);
  fetchOut.push("============================================================");
  fetchOut.push(win.text);
  fetchOut.push("");
}

fs.writeFileSync(fetchPostOut, fetchOut.join("\n"));

const serverOut = [];
serverOut.push("AICompanyManager V10L-C2G-A4 server endpoint windows");
serverOut.push("DB_WRITE=NO");
serverOut.push("API_POST=NO");
serverOut.push("CORE_PATCH=NO");
serverOut.push("SERVER_PATCH=NO");
serverOut.push("");

const serverNeedleRe = /review|approval|approve|return|delete|remove|trash|handoff|leader|manager-major|major.*update|POST|DELETE|UPDATE|INSERT|DELETE FROM|UPDATE\s+/i;
const serverHits = [];
for (let i = 0; i < serverLines.length; i += 1) {
  const text = serverLines[i] || "";
  if (serverNeedleRe.test(text)) serverHits.push({ line: i + 1, text });
}

serverOut.push("SERVER_HIT_COUNT=" + serverHits.length);
serverOut.push("");

const emitted = [];
for (const h of serverHits) {
  if (emitted.some(r => h.line >= r.start && h.line <= r.end)) continue;
  const win = lineWindow(serverLines, h.line, 10, 36);
  emitted.push({ start: win.start, end: win.end });
  serverOut.push("============================================================");
  serverOut.push("CENTER=" + h.line);
  serverOut.push("HIT=" + h.text.trim().slice(0, 260));
  serverOut.push("============================================================");
  serverOut.push(win.text);
  serverOut.push("");
}

fs.writeFileSync(serverEndpointOut, serverOut.join("\n"));

function topFor(action) {
  return handlerCandidates.find(x => x.action === action && (x.reasons.includes("ACTION_COMPARE") || x.reasons.includes("ACTION_CASE"))) ||
         handlerCandidates.find(x => x.action === action && x.reasons.includes("HAS_ACTION")) ||
         null;
}

const topApprove = topFor("human-review-approve");
const topReturn = topFor("human-review-return");
const topDelete =
  topFor("human-review-delete") ||
  topFor("human-review-remove") ||
  topFor("human-review-trash");

const approveHits = actionStats.find(x => x.action === "human-review-approve")?.hits.length || 0;
const returnHits = actionStats.find(x => x.action === "human-review-return")?.hits.length || 0;
const deleteHits =
  (actionStats.find(x => x.action === "human-review-delete")?.hits.length || 0) +
  (actionStats.find(x => x.action === "human-review-remove")?.hits.length || 0) +
  (actionStats.find(x => x.action === "human-review-trash")?.hits.length || 0);

const verify = [];
verify.push("AICompanyManager V10L-C2G-A4 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("CORE_FUNCTION_COUNT=" + funcs.length);
verify.push("APPROVE_ACTION_HIT_COUNT=" + approveHits);
verify.push("RETURN_ACTION_HIT_COUNT=" + returnHits);
verify.push("DELETE_ACTION_HIT_COUNT=" + deleteHits);
verify.push("HANDLER_CANDIDATE_COUNT=" + handlerCandidates.length);
verify.push("FETCH_POST_CANDIDATE_COUNT=" + fetchCandidates.length);
verify.push("SERVER_ENDPOINT_HIT_COUNT=" + serverHits.length);
verify.push("TOP_APPROVE_HANDLER=" + (topApprove ? `${topApprove.name}:${topApprove.startLine}-${topApprove.endLine}:score=${topApprove.score}` : "NONE"));
verify.push("TOP_RETURN_HANDLER=" + (topReturn ? `${topReturn.name}:${topReturn.startLine}-${topReturn.endLine}:score=${topReturn.score}` : "NONE"));
verify.push("TOP_DELETE_HANDLER=" + (topDelete ? `${topDelete.name}:${topDelete.startLine}-${topDelete.endLine}:score=${topDelete.score}` : "NONE"));
verify.push("ACTION_OCCURRENCE_OUT=" + actionOccurrenceOut);
verify.push("HANDLER_CANDIDATE_OUT=" + handlerCandidateOut);
verify.push("FETCH_POST_OUT=" + fetchPostOut);
verify.push("SERVER_ENDPOINT_OUT=" + serverEndpointOut);
fs.writeFileSync(verifyOut, verify.join("\n"));

const plan = [];
plan.push("AICompanyManager V10L-C2G-A4 C2G-B confirm-only patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("FINDING");
plan.push("- Approve action hits: " + approveHits);
plan.push("- Return action hits: " + returnHits);
plan.push("- Delete action hits: " + deleteHits);
plan.push("- Top approve handler: " + (topApprove ? `${topApprove.name}:${topApprove.startLine}-${topApprove.endLine}` : "NONE"));
plan.push("- Top return handler: " + (topReturn ? `${topReturn.name}:${topReturn.startLine}-${topReturn.endLine}` : "NONE"));
plan.push("- Top delete handler: " + (topDelete ? `${topDelete.name}:${topDelete.startLine}-${topDelete.endLine}` : "NONE"));
plan.push("");
plan.push("NEXT_POLICY");
plan.push("- C2G-B must patch only the exact handler branch for approve/return if identified.");
plan.push("- If delete action is absent, do not invent delete execution. Add delete later only after exact action design.");
plan.push("- Confirmation UI only; API_POST remains NO.");
plan.push("- Delete/return confirmation must be stronger than approve confirmation.");
plan.push("- No server/API/DB route changes until Sato DB review.");
fs.writeFileSync(patchPlanOut, plan.join("\n"));

const decision = [];
decision.push("AICompanyManager V10L-C2G-A4 decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=REVIEW_ACTION_HANDLER_EXACT_AUDITED_PATCH_NOT_APPLIED");
decision.push("APPROVE_ACTION_HIT_COUNT=" + approveHits);
decision.push("RETURN_ACTION_HIT_COUNT=" + returnHits);
decision.push("DELETE_ACTION_HIT_COUNT=" + deleteHits);
decision.push("TOP_APPROVE_HANDLER=" + (topApprove ? `${topApprove.name}:${topApprove.startLine}-${topApprove.endLine}:score=${topApprove.score}` : "NONE"));
decision.push("TOP_RETURN_HANDLER=" + (topReturn ? `${topReturn.name}:${topReturn.startLine}-${topReturn.endLine}:score=${topReturn.score}` : "NONE"));
decision.push("TOP_DELETE_HANDLER=" + (topDelete ? `${topDelete.name}:${topDelete.startLine}-${topDelete.endLine}:score=${topDelete.score}` : "NONE"));
decision.push("");
if (topApprove && topReturn) {
  decision.push("NEXT=V10L-C2G-B_PATCH_APPROVE_RETURN_CONFIRM_ONLY_EXACT_HANDLER");
} else {
  decision.push("NEXT=STOP_REVIEW_HANDLER_WINDOWS_BEFORE_PATCH");
}
decision.push("");
decision.push("FILES");
decision.push("ACTION_OCCURRENCE_OUT=" + actionOccurrenceOut);
decision.push("HANDLER_CANDIDATE_OUT=" + handlerCandidateOut);
decision.push("FETCH_POST_OUT=" + fetchPostOut);
decision.push("SERVER_ENDPOINT_OUT=" + serverEndpointOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(decisionOut, decision.join("\n"));
