const fs = require("fs");

const [
  ,
  ,
  corePath,
  serverPath,
  verifyOut,
  decisionOut,
  reviewRenderOut,
  actionLinesOut,
  handlerWindowsOut,
  serverScanOut,
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

function findLines(lines, re, startLine, endLine) {
  const hits = [];
  const s = Math.max(1, startLine || 1);
  const e = Math.min(lines.length, endLine || lines.length);
  for (let i = s; i <= e; i += 1) {
    const text = lines[i - 1] || "";
    if (re.test(text)) hits.push({ line: i, text });
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

const reviewStartHits = findLines(coreLines, /function\s+aicmR8zV7RenderReviewList\b|aicmR8zV7RenderReviewList/, 1, coreLines.length);
const reviewStart = reviewStartHits.length ? reviewStartHits[0].line : 13355;
const reviewEnd = Math.min(coreLines.length, reviewStart + 180);

const reviewWin = [];
reviewWin.push("AICompanyManager V10L-C2G-A2 review render exact window");
reviewWin.push("DB_WRITE=NO");
reviewWin.push("API_POST=NO");
reviewWin.push("CORE_PATCH=NO");
reviewWin.push("SERVER_PATCH=NO");
reviewWin.push("");
reviewWin.push("REVIEW_RENDER_START=" + reviewStart);
reviewWin.push("REVIEW_RENDER_END=" + reviewEnd);
reviewWin.push("============================================================");
reviewWin.push(lineWindow(coreLines, reviewStart, 0, reviewEnd - reviewStart).text);
fs.writeFileSync(reviewRenderOut, reviewWin.join("\n"));

const reviewActionHits = findLines(
  coreLines,
  /data-core-action|coreAction|action ===|承認|削除|approve|delete|remove|review|approval/i,
  reviewStart,
  reviewEnd
);

const actionOut = [];
actionOut.push("AICompanyManager V10L-C2G-A2 review action lines");
actionOut.push("DB_WRITE=NO");
actionOut.push("API_POST=NO");
actionOut.push("CORE_PATCH=NO");
actionOut.push("SERVER_PATCH=NO");
actionOut.push("");
actionOut.push("RANGE=" + reviewStart + "-" + reviewEnd);
actionOut.push("HIT_COUNT=" + reviewActionHits.length);
actionOut.push("");

for (const h of reviewActionHits) {
  actionOut.push(String(h.line).padStart(6, " ") + ": " + h.text);
}
fs.writeFileSync(actionLinesOut, actionOut.join("\n"));

const funcs = extractFunctions(core);

function scoreHandler(fn) {
  const t = fn.text;
  let score = 0;
  const reasons = [];
  function add(cond, pts, reason) {
    if (cond) {
      score += pts;
      reasons.push(reason);
    }
  }
  add(/レビュー・承認待ち一覧|承認待ち|review/i.test(t), 10, "REVIEW");
  add(/承認|approve|approval|課長へ送る|leader-handoff|handoff/i.test(t), 10, "APPROVE_HANDOFF");
  add(/削除|delete|remove/i.test(t), 10, "DELETE");
  add(/data-core-action|action ===|coreAction/.test(t), 8, "ACTION_HANDLER");
  add(/fetch\s*\(/.test(t), 8, "FETCH");
  add(/method\s*:\s*["']POST["']/.test(t), 8, "POST");
  add(/method\s*:\s*["']DELETE["']/.test(t), 10, "DELETE_METHOD");
  add(/confirm|確認/.test(t), 6, "CONFIRM");
  add(/payload|postBody|body\s*:/.test(t), 5, "PAYLOAD");
  return { ...fn, score, reasons };
}

const ranked = funcs.map(scoreHandler).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.startLine - b.startLine);

const handlerOut = [];
handlerOut.push("AICompanyManager V10L-C2G-A2 action handler windows");
handlerOut.push("DB_WRITE=NO");
handlerOut.push("API_POST=NO");
handlerOut.push("CORE_PATCH=NO");
handlerOut.push("SERVER_PATCH=NO");
handlerOut.push("");

for (const item of ranked.slice(0, 20)) {
  const win = lineWindow(coreLines, item.startLine, 0, Math.min(220, item.endLine - item.startLine + 20));
  handlerOut.push("============================================================");
  handlerOut.push("FUNCTION=" + item.name + "; LINES=" + item.startLine + "-" + item.endLine + "; SCORE=" + item.score + "; REASONS=" + item.reasons.join(","));
  handlerOut.push("============================================================");
  handlerOut.push(win.text);
  handlerOut.push("");
}
fs.writeFileSync(handlerWindowsOut, handlerOut.join("\n"));

const serverHits = findLines(
  serverLines,
  /review|approval|approve|handoff|leader|delete|remove|manager-major|major.*update|POST|DELETE|UPDATE|INSERT|DELETE FROM|UPDATE\s+/i,
  1,
  serverLines.length
);

const serverOut = [];
serverOut.push("AICompanyManager V10L-C2G-A2 server write endpoint scan");
serverOut.push("DB_WRITE=NO");
serverOut.push("API_POST=NO");
serverOut.push("CORE_PATCH=NO");
serverOut.push("SERVER_PATCH=NO");
serverOut.push("");
serverOut.push("SERVER_HIT_COUNT=" + serverHits.length);
serverOut.push("");

for (const h of serverHits) {
  const win = lineWindow(serverLines, h.line, 8, 28);
  serverOut.push("============================================================");
  serverOut.push("CENTER=" + h.line);
  serverOut.push("HIT=" + h.text.trim().slice(0, 260));
  serverOut.push("============================================================");
  serverOut.push(win.text);
  serverOut.push("");
}
fs.writeFileSync(serverScanOut, serverOut.join("\n"));

const topReview = ranked.find(x => /aicmR8zV7RenderReviewList/.test(x.name)) || ranked.find(x => /review|承認待ち/i.test(x.text)) || null;
const topApprove = ranked.find(x => /承認|approve|approval|課長へ送る|leader-handoff|handoff/i.test(x.text) && !/削除|delete|remove/i.test(x.text)) || null;
const topDelete = ranked.find(x => /削除|delete|remove/i.test(x.text)) || null;

const reviewActionText = reviewActionHits.map(x => x.text).join("\n");
const reviewHasApproveButton = /承認|課長へ送る|approve|approval|leader-handoff|handoff/i.test(reviewActionText);
const reviewHasDeleteButton = /削除|delete|remove/i.test(reviewActionText);
const reviewHasDataCoreAction = /data-core-action/.test(reviewActionText);

const verify = [];
verify.push("AICompanyManager V10L-C2G-A2 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("REVIEW_RENDER_START=" + reviewStart);
verify.push("REVIEW_RENDER_END=" + reviewEnd);
verify.push("REVIEW_ACTION_HIT_COUNT=" + reviewActionHits.length);
verify.push("REVIEW_HAS_APPROVE_BUTTON_SIGNAL=" + (reviewHasApproveButton ? "YES" : "NO"));
verify.push("REVIEW_HAS_DELETE_BUTTON_SIGNAL=" + (reviewHasDeleteButton ? "YES" : "NO"));
verify.push("REVIEW_HAS_DATA_CORE_ACTION=" + (reviewHasDataCoreAction ? "YES" : "NO"));
verify.push("HANDLER_CANDIDATE_COUNT=" + ranked.length);
verify.push("SERVER_WRITE_ENDPOINT_HIT_COUNT=" + serverHits.length);
verify.push("TOP_REVIEW_CANDIDATE=" + (topReview ? topReview.name : "NONE"));
verify.push("TOP_REVIEW_LINES=" + (topReview ? `${topReview.startLine}-${topReview.endLine}` : "NONE"));
verify.push("TOP_APPROVE_CANDIDATE=" + (topApprove ? topApprove.name : "NONE"));
verify.push("TOP_APPROVE_LINES=" + (topApprove ? `${topApprove.startLine}-${topApprove.endLine}` : "NONE"));
verify.push("TOP_DELETE_CANDIDATE=" + (topDelete ? topDelete.name : "NONE"));
verify.push("TOP_DELETE_LINES=" + (topDelete ? `${topDelete.startLine}-${topDelete.endLine}` : "NONE"));
verify.push("CORE_APPROVE_TEXT_COUNT=" + count(core, "承認"));
verify.push("CORE_DELETE_TEXT_COUNT=" + count(core, "削除"));
verify.push("SERVER_APPROVE_TEXT_COUNT=" + count(server, "承認"));
verify.push("SERVER_DELETE_TEXT_COUNT=" + count(server, "削除"));
verify.push("REVIEW_RENDER_OUT=" + reviewRenderOut);
verify.push("ACTION_LINES_OUT=" + actionLinesOut);
verify.push("HANDLER_WINDOWS_OUT=" + handlerWindowsOut);
verify.push("SERVER_SCAN_OUT=" + serverScanOut);
fs.writeFileSync(verifyOut, verify.join("\n"));

const plan = [];
plan.push("AICompanyManager V10L-C2G-A2 C2G-B patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("FINDING");
plan.push("- Review render range: " + reviewStart + "-" + reviewEnd);
plan.push("- Review approve button signal: " + (reviewHasApproveButton ? "YES" : "NO"));
plan.push("- Review delete button signal: " + (reviewHasDeleteButton ? "YES" : "NO"));
plan.push("- Review data-core-action signal: " + (reviewHasDataCoreAction ? "YES" : "NO"));
plan.push("");
plan.push("NEXT_POLICY");
plan.push("- If review action lines show concrete button actions, C2G-B patches those UI actions into confirmation-only screens.");
plan.push("- Do not enable API POST.");
plan.push("- Delete must not execute without explicit confirmation.");
plan.push("- Server/API/DB route remains untouched until C2G-D/Sato review.");
plan.push("- No debug UI unless marked removable.");
plan.push("");
plan.push("TOP_REVIEW_CANDIDATE=" + (topReview ? `${topReview.name}:${topReview.startLine}-${topReview.endLine}` : "NONE"));
plan.push("TOP_APPROVE_CANDIDATE=" + (topApprove ? `${topApprove.name}:${topApprove.startLine}-${topApprove.endLine}` : "NONE"));
plan.push("TOP_DELETE_CANDIDATE=" + (topDelete ? `${topDelete.name}:${topDelete.startLine}-${topDelete.endLine}` : "NONE"));
fs.writeFileSync(patchPlanOut, plan.join("\n"));

const decision = [];
decision.push("AICompanyManager V10L-C2G-A2 decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=REVIEW_APPROVE_DELETE_EXACT_ACTIONS_AUDITED_PATCH_NOT_APPLIED");
decision.push("REVIEW_HAS_APPROVE_BUTTON_SIGNAL=" + (reviewHasApproveButton ? "YES" : "NO"));
decision.push("REVIEW_HAS_DELETE_BUTTON_SIGNAL=" + (reviewHasDeleteButton ? "YES" : "NO"));
decision.push("REVIEW_HAS_DATA_CORE_ACTION=" + (reviewHasDataCoreAction ? "YES" : "NO"));
decision.push("TOP_REVIEW_CANDIDATE=" + (topReview ? `${topReview.name}:${topReview.startLine}-${topReview.endLine}` : "NONE"));
decision.push("TOP_APPROVE_CANDIDATE=" + (topApprove ? `${topApprove.name}:${topApprove.startLine}-${topApprove.endLine}` : "NONE"));
decision.push("TOP_DELETE_CANDIDATE=" + (topDelete ? `${topDelete.name}:${topDelete.startLine}-${topDelete.endLine}` : "NONE"));
decision.push("");
decision.push("NEXT=V10L-C2G-B_CONFIRM_UI_PATCH_OR_C2G_A3_IF_ACTION_STILL_AMBIGUOUS");
decision.push("");
decision.push("FILES");
decision.push("REVIEW_RENDER_OUT=" + reviewRenderOut);
decision.push("ACTION_LINES_OUT=" + actionLinesOut);
decision.push("HANDLER_WINDOWS_OUT=" + handlerWindowsOut);
decision.push("SERVER_SCAN_OUT=" + serverScanOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(decisionOut, decision.join("\n"));
