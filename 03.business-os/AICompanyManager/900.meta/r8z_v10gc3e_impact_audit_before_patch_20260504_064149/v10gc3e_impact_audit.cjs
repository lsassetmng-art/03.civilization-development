const fs = require("fs");

const corePath = process.argv[2];
const tempPath = process.argv[3];
const auditPath = process.argv[4];
const extractPath = process.argv[5];
const renderConfirmPath = process.argv[6];

let src = fs.readFileSync(corePath, "utf8");
const original = src;

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

function lineOf(source, index) {
  return source.slice(0, Math.max(0, index)).split(/\n/).length;
}

function scanBraceEnd(source, openIndex) {
  let depth = 0;
  let quote = "";
  let esc = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

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

function findFunctionContaining(source, label) {
  const labelIndex = source.indexOf(label);
  if (labelIndex < 0) return null;

  const prefix = source.slice(0, labelIndex);
  const patterns = [
    /(?:async\s+)?function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\([^)]*\)\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*function\s*\([^)]*\)\s*\{/g
  ];

  let best = null;

  for (const re of patterns) {
    let m;
    while ((m = re.exec(prefix))) {
      if (!best || m.index > best.index) {
        best = { index: m.index, header: m[0] };
      }
    }
  }

  if (!best) return null;

  const open = source.indexOf("{", best.index);
  const end = scanBraceEnd(source, open);

  if (open < 0 || end < 0 || labelIndex > end) return null;

  return {
    start: best.index,
    end,
    header: best.header,
    startLine: lineOf(source, best.index),
    endLine: lineOf(source, end),
    text: source.slice(best.index, end)
  };
}

function findAllFunctionHeaders(source) {
  const patterns = [
    /(?:async\s+)?function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\([^)]*\)\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*function\s*\([^)]*\)\s*\{/g
  ];

  const found = [];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(source))) {
      const open = source.indexOf("{", m.index);
      const end = scanBraceEnd(source, open);
      if (open >= 0 && end > open) {
        found.push({
          start: m.index,
          end,
          header: m[0],
          startLine: lineOf(source, m.index),
          endLine: lineOf(source, end),
          text: source.slice(m.index, end)
        });
      }
    }
  }

  return found.sort((a, b) => a.start - b.start);
}

function inferRowVar(fnText) {
  const excludes = new Set([
    "window", "document", "state", "app", "payload", "button", "event",
    "Math", "String", "Object", "Array", "Date", "JSON", "console"
  ]);

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

function countReturnRenderConfirm(fnText) {
  return (fnText.match(/return\s+renderConfirm\s*\(/g) || []).length;
}

function renderConfirmUsages(source) {
  const lines = source.split(/\n/);
  const out = [];

  lines.forEach((line, idx) => {
    if (line.includes("renderConfirm")) {
      out.push({
        line: idx + 1,
        text: line.trim()
      });
    }
  });

  return out;
}

const removeTargets = [
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
];

const removed = [];
for (const marker of removeTargets) {
  removed.push("REMOVED_" + marker + "=" + removeMarkedBlock(marker));
}

fs.writeFileSync(tempPath, src, "utf8");

const approveFn = findFunctionContaining(src, "承認前の最終確認");
const returnFn = findFunctionContaining(src, "差し戻し前の最終確認");
const sameFunction = !!approveFn && !!returnFn && approveFn.start === returnFn.start && approveFn.end === returnFn.end;

const targets = [];
if (approveFn) targets.push({ kind: "approve", fn: approveFn });
if (returnFn && !sameFunction) targets.push({ kind: "return", fn: returnFn });

const uniqueTargetFns = sameFunction && approveFn ? [{ kind: "both", fn: approveFn }] : targets;

const renderUsages = renderConfirmUsages(src);
const helperFns = findAllFunctionHeaders(src).filter(fn => fn.header.includes("renderConfirm") || /function\s+renderConfirm\b|(?:const|let|var)\s+renderConfirm\b/.test(fn.header));

let audit = "";
audit += removed.join("\n") + "\n";
audit += "ORIGINAL_V10GC2B_COUNT=" + count(original, "AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE") + "\n";
audit += "ORIGINAL_V10GC2J_COUNT=" + count(original, "AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX") + "\n";
audit += "TEMP_V10GC_PATCH_MARKER_COUNT=" + count(src, "AICM_R8Z_V10GC") + "\n";
audit += "TEMP_CONFIRM_APPROVE_TITLE_COUNT=" + count(src, "承認前の最終確認") + "\n";
audit += "TEMP_CONFIRM_RETURN_TITLE_COUNT=" + count(src, "差し戻し前の最終確認") + "\n";
audit += "TEMP_EXEC_APPROVE_LABEL_COUNT=" + count(src, "承認を実行") + "\n";
audit += "TEMP_EXEC_RETURN_LABEL_COUNT=" + count(src, "差し戻しを実行") + "\n";
audit += "TEMP_RENDERCONFIRM_USAGE_COUNT=" + renderUsages.length + "\n";
audit += "RENDERCONFIRM_HELPER_DEFINITION_COUNT=" + helperFns.length + "\n";
audit += "APPROVE_FN_FOUND=" + !!approveFn + "\n";
audit += "RETURN_FN_FOUND=" + !!returnFn + "\n";
audit += "SAME_CONFIRM_FUNCTION=" + sameFunction + "\n";
audit += "UNIQUE_TARGET_FUNCTION_COUNT=" + uniqueTargetFns.length + "\n";

uniqueTargetFns.forEach((item, index) => {
  const row = inferRowVar(item.fn.text);
  audit += "TARGET_" + index + "_KIND=" + item.kind + "\n";
  audit += "TARGET_" + index + "_HEADER=" + item.fn.header + "\n";
  audit += "TARGET_" + index + "_START_LINE=" + item.fn.startLine + "\n";
  audit += "TARGET_" + index + "_END_LINE=" + item.fn.endLine + "\n";
  audit += "TARGET_" + index + "_RETURN_RENDERCONFIRM_COUNT=" + countReturnRenderConfirm(item.fn.text) + "\n";
  audit += "TARGET_" + index + "_ROW_VAR_SELECTED=" + row.selected + "\n";
  audit += "TARGET_" + index + "_ROW_VAR_CANDIDATES=" + row.candidates + "\n";
  audit += "TARGET_" + index + "_HAS_REVIEW_ID=" + /aicm_human_review_item_id|review_item_id|review_id/.test(item.fn.text) + "\n";
  audit += "TARGET_" + index + "_HAS_OWNER=" + /owner_civilization_id|ownerCivilizationId|owner_id|ownerId/.test(item.fn.text) + "\n";
  audit += "TARGET_" + index + "_HAS_REVIEWER=" + /human_reviewer_label|humanReviewerLabel|reviewer_label|reviewerLabel/.test(item.fn.text) + "\n";
});

fs.writeFileSync(auditPath, audit, "utf8");

let extract = "";
uniqueTargetFns.forEach((item, index) => {
  extract += "\n============================================================\n";
  extract += "TARGET_" + index + "_" + item.kind + "\n";
  extract += "============================================================\n";
  extract += "HEADER=" + item.fn.header + "\n";
  extract += "START_LINE=" + item.fn.startLine + "\n";
  extract += "END_LINE=" + item.fn.endLine + "\n";
  extract += item.fn.text + "\n";
});
fs.writeFileSync(extractPath, extract || "NO_TARGET_FUNCTION\n", "utf8");

let renderScan = "";
renderScan += "RENDERCONFIRM_USAGE_COUNT=" + renderUsages.length + "\n";
renderScan += "RENDERCONFIRM_HELPER_DEFINITION_COUNT=" + helperFns.length + "\n";
renderScan += "\n---- renderConfirm usages ----\n";
renderUsages.forEach(u => {
  renderScan += String(u.line).padStart(6, " ") + ": " + u.text + "\n";
});
renderScan += "\n---- renderConfirm helper definitions ----\n";
helperFns.forEach(fn => {
  renderScan += "\nLINE=" + fn.startLine + " HEADER=" + fn.header + "\n";
  renderScan += fn.text.slice(0, 3000) + "\n";
});
fs.writeFileSync(renderConfirmPath, renderScan, "utf8");
