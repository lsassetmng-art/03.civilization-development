const fs = require("fs");

const corePath = process.argv[2];
const tempPath = process.argv[3];
const sourceOut = process.argv[4];
const renderOut = process.argv[5];

let src = fs.readFileSync(corePath, "utf8");

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), "g")) || []).length;
}

function removeMarkedBlock(marker) {
  const before = src.length;
  const re = new RegExp(
    "\\n\\s*//\\s*" + escRe(marker) + "_START[\\s\\S]*?//\\s*" + escRe(marker) + "_END\\s*\\n?",
    "g"
  );
  src = src.replace(re, "\n");
  return before !== src.length;
}

[
  "AICM_R8Z_V10GC_REVIEW_ITEM_DECISION_CORE",
  "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE",
  "AICM_R8Z_V10GC2C_REVIEW_CONFIRM_BUTTON_FORCE_ENABLE",
  "AICM_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME",
  "AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME",
  "AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST",
  "AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK",
  "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX",
  "AICM_R8Z_V10GC2L_DIRECT_CONFIRM_BUTTON_SOURCE_PATCH",
  "AICM_R8Z_V10GC3_REVIEW_DECISION_CANONICAL_HANDLER",
  "AICM_R8Z_V10GC3E_RENDERCONFIRM_REVIEW_DECISION_RECOVERY"
].forEach(removeMarkedBlock);

fs.writeFileSync(tempPath, src, "utf8");

function lineOf(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function scanBraceEnd(openIndex) {
  let depth = 0;
  let quote = "";
  let esc = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

function findFunctionContaining(label) {
  const labelIndex = src.indexOf(label);
  if (labelIndex < 0) return null;

  const prefix = src.slice(0, labelIndex);
  const patterns = [
    /(?:async\s+)?function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\([^)]*\)\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*function\s*\([^)]*\)\s*\{/g
  ];

  let best = null;

  for (const re of patterns) {
    let m;
    while ((m = re.exec(prefix))) {
      if (!best || m.index > best.index) best = { index: m.index, header: m[0] };
    }
  }

  if (!best) return null;

  const open = src.indexOf("{", best.index);
  const end = scanBraceEnd(open);

  if (open < 0 || end < 0 || labelIndex > end) return null;

  return {
    start: best.index,
    end,
    header: best.header,
    startLine: lineOf(best.index),
    endLine: lineOf(end),
    text: src.slice(best.index, end)
  };
}

function findRenderConfirmStatements(fnText) {
  const lines = fnText.split(/\n/);
  const out = [];

  lines.forEach((line, idx) => {
    if (line.includes("renderConfirm")) {
      out.push({
        localLine: idx + 1,
        text: line.trim()
      });
    }
  });

  return out;
}

function inferRowVar(fnText) {
  const excludes = new Set(["window","document","state","app","payload","button","event","Math","String","Object","Array","Date","JSON","console"]);
  const patterns = [
    /\b([A-Za-z_$][A-Za-z0-9_$]*)\.(?:aicm_human_review_item_id|review_item_id|review_id|review_title|delivery_summary_text|human_review_status_code|priority_code|requested_at|metadata_jsonb|artifact_kind_code|review_kind_code|owner_civilization_id|human_reviewer_label)\b/g,
    /\b([A-Za-z_$][A-Za-z0-9_$]*)\[['"](?:aicm_human_review_item_id|review_item_id|review_id|review_title|delivery_summary_text|human_review_status_code|priority_code|requested_at|metadata_jsonb|artifact_kind_code|review_kind_code|owner_civilization_id|human_reviewer_label)['"]\]/g
  ];

  const score = new Map();

  for (const re of patterns) {
    let m;
    while ((m = re.exec(fnText))) {
      const v = m[1];
      if (!v || excludes.has(v)) continue;
      score.set(v, (score.get(v) || 0) + 1);
    }
  }

  const sorted = Array.from(score.entries()).sort((a, b) => b[1] - a[1]);
  return {
    selected: sorted.length ? sorted[0][0] : "",
    candidates: sorted.map(([k, v]) => k + ":" + v).join(",")
  };
}

function findFunctionByName(name) {
  const patterns = [
    new RegExp("(?:async\\s+)?function\\s+" + escRe(name) + "\\s*\\([^)]*\\)\\s*\\{"),
    new RegExp("(?:const|let|var)\\s+" + escRe(name) + "\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{"),
    new RegExp("(?:const|let|var)\\s+" + escRe(name) + "\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{")
  ];

  for (const re of patterns) {
    const m = src.match(re);
    if (m && typeof m.index === "number") {
      const open = src.indexOf("{", m.index);
      const end = scanBraceEnd(open);
      if (open >= 0 && end > open) {
        return {
          header: m[0],
          startLine: lineOf(m.index),
          endLine: lineOf(end),
          text: src.slice(m.index, end)
        };
      }
    }
  }

  return null;
}

const approveFn = findFunctionContaining("承認前の最終確認");
const returnFn = findFunctionContaining("差し戻し前の最終確認");
const same = approveFn && returnFn && approveFn.start === returnFn.start && approveFn.end === returnFn.end;
const fn = same ? approveFn : approveFn || returnFn;
const row = fn ? inferRowVar(fn.text) : { selected: "", candidates: "" };
const renderStatements = fn ? findRenderConfirmStatements(fn.text) : [];
const renderConfirmFn = findFunctionByName("renderConfirm");

let sourceOutText = "";
sourceOutText += "APPROVE_FN_FOUND=" + !!approveFn + "\n";
sourceOutText += "RETURN_FN_FOUND=" + !!returnFn + "\n";
sourceOutText += "SAME_CONFIRM_FUNCTION=" + !!same + "\n";
sourceOutText += "TARGET_HEADER=" + (fn ? fn.header : "") + "\n";
sourceOutText += "TARGET_START_LINE=" + (fn ? fn.startLine : 0) + "\n";
sourceOutText += "TARGET_END_LINE=" + (fn ? fn.endLine : 0) + "\n";
sourceOutText += "ROW_VAR_SELECTED=" + row.selected + "\n";
sourceOutText += "ROW_VAR_CANDIDATES=" + row.candidates + "\n";
sourceOutText += "TARGET_HAS_OWNER_TEXT=" + (fn ? /owner_civilization_id|ownerCivilizationId|owner_id|ownerId/.test(fn.text) : false) + "\n";
sourceOutText += "TARGET_HAS_REVIEWER_TEXT=" + (fn ? /human_reviewer_label|humanReviewerLabel|reviewer_label|reviewerLabel/.test(fn.text) : false) + "\n";
sourceOutText += "TARGET_RENDERCONFIRM_STATEMENT_COUNT=" + renderStatements.length + "\n";
renderStatements.forEach((s, i) => {
  sourceOutText += "TARGET_RENDERCONFIRM_" + i + "_LOCAL_LINE=" + s.localLine + "\n";
  sourceOutText += "TARGET_RENDERCONFIRM_" + i + "_TEXT=" + s.text + "\n";
});
sourceOutText += "\n============================================================\n";
sourceOutText += "TARGET_FUNCTION_EXTRACT\n";
sourceOutText += "============================================================\n";
sourceOutText += fn ? fn.text : "NO_TARGET_FUNCTION";
sourceOutText += "\n";

fs.writeFileSync(sourceOut, sourceOutText, "utf8");

let renderOutText = "";
renderOutText += "RENDERCONFIRM_HELPER_FOUND=" + !!renderConfirmFn + "\n";
renderOutText += "RENDERCONFIRM_HELPER_HEADER=" + (renderConfirmFn ? renderConfirmFn.header : "") + "\n";
renderOutText += "RENDERCONFIRM_HELPER_START_LINE=" + (renderConfirmFn ? renderConfirmFn.startLine : 0) + "\n";
renderOutText += "RENDERCONFIRM_HELPER_END_LINE=" + (renderConfirmFn ? renderConfirmFn.endLine : 0) + "\n";
renderOutText += "RENDERCONFIRM_HELPER_HAS_BUTTON=" + (renderConfirmFn ? /button|<button|data-core-action|disabled/.test(renderConfirmFn.text) : false) + "\n";
renderOutText += "RENDERCONFIRM_HELPER_HAS_ACTIONS=" + (renderConfirmFn ? /actions|action|footer|buttons/.test(renderConfirmFn.text) : false) + "\n";
renderOutText += "\n============================================================\n";
renderOutText += "RENDERCONFIRM_HELPER_EXTRACT\n";
renderOutText += "============================================================\n";
renderOutText += renderConfirmFn ? renderConfirmFn.text : "NO_RENDERCONFIRM_HELPER";
renderOutText += "\n";

fs.writeFileSync(renderOut, renderOutText, "utf8");
