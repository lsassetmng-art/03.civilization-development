const fs = require("fs");

const [
  ,
  ,
  corePath,
  serverPath,
  verifyOut,
  decisionOut,
  reviewFunctionOut,
  buttonActionOut,
  actionOccurrenceOut,
  handlerRankingOut,
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

const funcs = extractFunctions(core);
const reviewFn = funcs.find(f => f.name === "aicmR8zV7RenderReviewList");

if (!reviewFn) {
  throw new Error("REVIEW_FUNCTION_NOT_FOUND:aicmR8zV7RenderReviewList");
}

const reviewStart = reviewFn.startLine;
const reviewEnd = Math.min(reviewFn.endLine, reviewFn.startLine + 260);
const reviewText = reviewFn.text;
const reviewLinesWindow = lineWindow(coreLines, reviewStart, 0, reviewEnd - reviewStart);

fs.writeFileSync(reviewFunctionOut, [
  "AICompanyManager V10L-C2G-A3 actual review-list function",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=NO",
  "SERVER_PATCH=NO",
  "",
  "FUNCTION=aicmR8zV7RenderReviewList",
  "LINES=" + reviewFn.startLine + "-" + reviewFn.endLine,
  "EXTRACTED_WINDOW=" + reviewStart + "-" + reviewEnd,
  "============================================================",
  reviewLinesWindow.text,
  ""
].join("\n"));

const buttonHits = findLines(
  coreLines,
  /<button|data-core-action|onclick|承認|削除|approve|approval|delete|remove|review|handoff|課長|Yes|No/i,
  reviewStart,
  reviewEnd
);

const actionNameSet = new Set();
for (const h of buttonHits) {
  const text = h.text;
  const re = /data-core-action=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text)) !== null) actionNameSet.add(m[1]);
}
const actionNames = Array.from(actionNameSet).sort();

fs.writeFileSync(buttonActionOut, [
  "AICompanyManager V10L-C2G-A3 review button/action lines",
  "DB_WRITE=NO",
  "API_POST=NO",
  "CORE_PATCH=NO",
  "SERVER_PATCH=NO",
  "",
  "FUNCTION=aicmR8zV7RenderReviewList",
  "RANGE=" + reviewStart + "-" + reviewEnd,
  "BUTTON_ACTION_HIT_COUNT=" + buttonHits.length,
  "DATA_CORE_ACTION_COUNT=" + actionNames.length,
  "DATA_CORE_ACTIONS=" + (actionNames.length ? actionNames.join(",") : "NONE"),
  "",
  "============================================================",
  buttonHits.map(h => String(h.line).padStart(6, " ") + ": " + h.text).join("\n"),
  ""
].join("\n"));

const occurrenceOut = [];
occurrenceOut.push("AICompanyManager V10L-C2G-A3 action occurrence windows");
occurrenceOut.push("DB_WRITE=NO");
occurrenceOut.push("API_POST=NO");
occurrenceOut.push("CORE_PATCH=NO");
occurrenceOut.push("SERVER_PATCH=NO");
occurrenceOut.push("");

for (const actionName of actionNames) {
  const hits = findLines(coreLines, new RegExp(actionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), 1, coreLines.length);
  occurrenceOut.push("============================================================");
  occurrenceOut.push("ACTION=" + actionName + "; HIT_COUNT=" + hits.length);
  occurrenceOut.push("============================================================");
  for (const hit of hits) {
    const win = lineWindow(coreLines, hit.line, 10, 28);
    occurrenceOut.push("CENTER=" + hit.line);
    occurrenceOut.push(win.text);
    occurrenceOut.push("");
  }
}

if (actionNames.length === 0) {
  const fallbackHits = findLines(coreLines, /レビュー・承認待ち一覧|承認待ち|承認|削除|approve|delete|review-list|reviewList|approval/i, Math.max(1, reviewStart - 120), Math.min(coreLines.length, reviewEnd + 500));
  occurrenceOut.push("============================================================");
  occurrenceOut.push("FALLBACK_REVIEW_AREA_HITS=" + fallbackHits.length);
  occurrenceOut.push("============================================================");
  for (const hit of fallbackHits) {
    occurrenceOut.push(String(hit.line).padStart(6, " ") + ": " + hit.text);
  }
}
fs.writeFileSync(actionOccurrenceOut, occurrenceOut.join("\n"));

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

  for (const actionName of actionNames) {
    add(t.includes(actionName), 30, "HAS_ACTION_" + actionName);
  }

  add(/aicmR8zV7RenderReviewList/.test(fn.name), 18, "REVIEW_RENDER_FUNCTION");
  add(/レビュー・承認待ち一覧|承認待ち|review/i.test(t), 10, "REVIEW_TEXT");
  add(/承認|approve|approval|課長へ送る|leader-handoff|handoff/i.test(t), 10, "APPROVE_HANDOFF_TEXT");
  add(/削除|delete|remove/i.test(t), 10, "DELETE_TEXT");
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
handlerOut.push("AICompanyManager V10L-C2G-A3 handler ranking");
handlerOut.push("DB_WRITE=NO");
handlerOut.push("API_POST=NO");
handlerOut.push("CORE_PATCH=NO");
handlerOut.push("SERVER_PATCH=NO");
handlerOut.push("");
handlerOut.push("ACTION_NAMES=" + (actionNames.length ? actionNames.join(",") : "NONE"));
handlerOut.push("HANDLER_CANDIDATE_COUNT=" + ranked.length);
handlerOut.push("");

for (const item of ranked.slice(0, 25)) {
  const win = lineWindow(coreLines, item.startLine, 0, Math.min(220, item.endLine - item.startLine + 20));
  handlerOut.push("============================================================");
  handlerOut.push("FUNCTION=" + item.name + "; LINES=" + item.startLine + "-" + item.endLine + "; SCORE=" + item.score + "; REASONS=" + item.reasons.join(","));
  handlerOut.push("============================================================");
  handlerOut.push(win.text);
  handlerOut.push("");
}
fs.writeFileSync(handlerRankingOut, handlerOut.join("\n"));

const serverHits = findLines(
  serverLines,
  /review|approval|approve|handoff|leader|delete|remove|manager-major|major.*update|POST|DELETE|UPDATE|INSERT|DELETE FROM|UPDATE\s+/i,
  1,
  serverLines.length
);

const serverOut = [];
serverOut.push("AICompanyManager V10L-C2G-A3 server endpoint scan");
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

const topApprove = ranked.find(x => /承認|approve|approval|課長へ送る|leader-handoff|handoff/i.test(x.text) && !/削除|delete|remove/i.test(x.text)) || null;
const topDelete = ranked.find(x => /削除|delete|remove/i.test(x.text)) || null;
const topHandler = ranked.find(x => /ACTION_HANDLER/.test(x.reasons.join(","))) || ranked[0] || null;

const reviewHasApproveButton = /承認|課長へ送る|approve|approval|leader-handoff|handoff/i.test(buttonHits.map(x => x.text).join("\n"));
const reviewHasDeleteButton = /削除|delete|remove/i.test(buttonHits.map(x => x.text).join("\n"));
const reviewHasDataCoreAction = actionNames.length > 0;

const verify = [];
verify.push("AICompanyManager V10L-C2G-A3 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("REVIEW_FUNCTION_FOUND=YES");
verify.push("REVIEW_FUNCTION_LINES=" + reviewFn.startLine + "-" + reviewFn.endLine);
verify.push("REVIEW_EXTRACT_WINDOW=" + reviewStart + "-" + reviewEnd);
verify.push("BUTTON_ACTION_HIT_COUNT=" + buttonHits.length);
verify.push("DATA_CORE_ACTION_COUNT=" + actionNames.length);
verify.push("DATA_CORE_ACTIONS=" + (actionNames.length ? actionNames.join(",") : "NONE"));
verify.push("REVIEW_HAS_APPROVE_BUTTON_SIGNAL=" + (reviewHasApproveButton ? "YES" : "NO"));
verify.push("REVIEW_HAS_DELETE_BUTTON_SIGNAL=" + (reviewHasDeleteButton ? "YES" : "NO"));
verify.push("REVIEW_HAS_DATA_CORE_ACTION=" + (reviewHasDataCoreAction ? "YES" : "NO"));
verify.push("HANDLER_CANDIDATE_COUNT=" + ranked.length);
verify.push("SERVER_ENDPOINT_HIT_COUNT=" + serverHits.length);
verify.push("TOP_HANDLER_CANDIDATE=" + (topHandler ? topHandler.name : "NONE"));
verify.push("TOP_HANDLER_LINES=" + (topHandler ? `${topHandler.startLine}-${topHandler.endLine}` : "NONE"));
verify.push("TOP_APPROVE_CANDIDATE=" + (topApprove ? topApprove.name : "NONE"));
verify.push("TOP_APPROVE_LINES=" + (topApprove ? `${topApprove.startLine}-${topApprove.endLine}` : "NONE"));
verify.push("TOP_DELETE_CANDIDATE=" + (topDelete ? topDelete.name : "NONE"));
verify.push("TOP_DELETE_LINES=" + (topDelete ? `${topDelete.startLine}-${topDelete.endLine}` : "NONE"));
verify.push("CORE_APPROVE_TEXT_COUNT=" + count(core, "承認"));
verify.push("CORE_DELETE_TEXT_COUNT=" + count(core, "削除"));
verify.push("REVIEW_FUNCTION_OUT=" + reviewFunctionOut);
verify.push("BUTTON_ACTION_OUT=" + buttonActionOut);
verify.push("ACTION_OCCURRENCE_OUT=" + actionOccurrenceOut);
verify.push("HANDLER_RANKING_OUT=" + handlerRankingOut);
verify.push("SERVER_SCAN_OUT=" + serverScanOut);
fs.writeFileSync(verifyOut, verify.join("\n"));

const plan = [];
plan.push("AICompanyManager V10L-C2G-A3 C2G-B patch plan");
plan.push("DB_WRITE=NO");
plan.push("API_POST=NO");
plan.push("CORE_PATCH=NO");
plan.push("SERVER_PATCH=NO");
plan.push("");
plan.push("FINDING");
plan.push("- Review function lines: " + reviewFn.startLine + "-" + reviewFn.endLine);
plan.push("- Data core actions: " + (actionNames.length ? actionNames.join(",") : "NONE"));
plan.push("- Review approve signal: " + (reviewHasApproveButton ? "YES" : "NO"));
plan.push("- Review delete signal: " + (reviewHasDeleteButton ? "YES" : "NO"));
plan.push("");
plan.push("NEXT_POLICY");
if (actionNames.length > 0) {
  plan.push("- C2G-B can patch exact action handler/button actions into confirmation-only flow.");
} else {
  plan.push("- If no actions/buttons exist, C2G-B should add visible approve/delete buttons to review-list items, but still keep API_POST=NO.");
}
plan.push("- Approval confirmation and delete confirmation must be separate.");
plan.push("- Delete confirmation must be stronger than approval confirmation.");
plan.push("- Do not unlock DB/API in C2G-B.");
plan.push("- Server/API/DB route untouched until C2G-D and Sato DB review.");
fs.writeFileSync(patchPlanOut, plan.join("\n"));

const decision = [];
decision.push("AICompanyManager V10L-C2G-A3 decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=ACTUAL_REVIEW_LIST_EXACT_AUDITED_PATCH_NOT_APPLIED");
decision.push("REVIEW_FUNCTION_LINES=" + reviewFn.startLine + "-" + reviewFn.endLine);
decision.push("DATA_CORE_ACTIONS=" + (actionNames.length ? actionNames.join(",") : "NONE"));
decision.push("REVIEW_HAS_APPROVE_BUTTON_SIGNAL=" + (reviewHasApproveButton ? "YES" : "NO"));
decision.push("REVIEW_HAS_DELETE_BUTTON_SIGNAL=" + (reviewHasDeleteButton ? "YES" : "NO"));
decision.push("TOP_HANDLER_CANDIDATE=" + (topHandler ? `${topHandler.name}:${topHandler.startLine}-${topHandler.endLine}` : "NONE"));
decision.push("TOP_APPROVE_CANDIDATE=" + (topApprove ? `${topApprove.name}:${topApprove.startLine}-${topApprove.endLine}` : "NONE"));
decision.push("TOP_DELETE_CANDIDATE=" + (topDelete ? `${topDelete.name}:${topDelete.startLine}-${topDelete.endLine}` : "NONE"));
decision.push("");
if (actionNames.length > 0) {
  decision.push("NEXT=V10L-C2G-B_PATCH_EXISTING_REVIEW_ACTION_CONFIRM_UI_ONLY");
} else {
  decision.push("NEXT=V10L-C2G-B_ADD_REVIEW_APPROVE_DELETE_CONFIRM_UI_ONLY");
}
decision.push("");
decision.push("FILES");
decision.push("REVIEW_FUNCTION_OUT=" + reviewFunctionOut);
decision.push("BUTTON_ACTION_OUT=" + buttonActionOut);
decision.push("ACTION_OCCURRENCE_OUT=" + actionOccurrenceOut);
decision.push("HANDLER_RANKING_OUT=" + handlerRankingOut);
decision.push("SERVER_SCAN_OUT=" + serverScanOut);
decision.push("PATCH_PLAN_OUT=" + patchPlanOut);
fs.writeFileSync(decisionOut, decision.join("\n"));
