const fs = require("fs");

const corePath = process.argv[2];
const tempPath = process.argv[3];
const scanPath = process.argv[4];

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
  "AICM_R8Z_V10GC3_REVIEW_DECISION_CANONICAL_HANDLER"
];

let out = "";
out += "---- removed patch blocks ----\n";
for (const marker of removeTargets) {
  out += "REMOVED_" + marker + "=" + removeMarkedBlock(marker) + "\n";
}

fs.writeFileSync(tempPath, src, "utf8");

const lines = src.split(/\n/);

function lineOf(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function around(pattern, before = 70, after = 100) {
  const chunks = [];
  lines.forEach((line, idx) => {
    if (line.includes(pattern)) {
      const s = Math.max(0, idx - before);
      const e = Math.min(lines.length, idx + after);
      const numbered = [];
      for (let i = s; i < e; i += 1) {
        numbered.push(String(i + 1).padStart(6, " ") + ": " + lines[i]);
      }
      chunks.push("---- hit line " + (idx + 1) + " pattern=" + pattern + " ----\n" + numbered.join("\n"));
    }
  });
  return chunks.join("\n\n") || "NO_HIT";
}

function nearestFunction(index) {
  const before = src.slice(0, index);
  const re = /(async\s+)?function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\(|(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
  let best = null;
  let m;
  while ((m = re.exec(before))) {
    best = {
      index: m.index,
      line: lineOf(m.index),
      text: before.slice(m.index, Math.min(before.length, m.index + 220)).split("\n")[0]
    };
  }
  return best;
}

function sourceShape(label) {
  const idx = src.indexOf(label);
  if (idx < 0) {
    return [
      "LABEL=" + label,
      "FOUND=false"
    ].join("\n");
  }

  const fn = nearestFunction(idx);
  const before = src.slice(Math.max(0, idx - 3000), idx);
  const after = src.slice(idx, Math.min(src.length, idx + 3000));

  return [
    "LABEL=" + label,
    "FOUND=true",
    "LINE=" + lineOf(idx),
    "NEAREST_FUNCTION_LINE=" + (fn ? fn.line : 0),
    "NEAREST_FUNCTION_TEXT=" + (fn ? fn.text : ""),
    "LAST_BUTTON_BEFORE=" + before.lastIndexOf("<button"),
    "NEXT_BUTTON_AFTER=" + after.indexOf("<button"),
    "LAST_DISABLED_BEFORE=" + before.lastIndexOf("disabled"),
    "NEXT_DISABLED_AFTER=" + after.indexOf("disabled"),
    "LAST_DATA_CORE_ACTION_BEFORE=" + before.lastIndexOf("data-core-action"),
    "NEXT_DATA_CORE_ACTION_AFTER=" + after.indexOf("data-core-action"),
    "LAST_RETURN_BEFORE=" + before.lastIndexOf("return"),
    "NEXT_RETURN_AFTER=" + after.indexOf("return"),
    "LAST_JOIN_BEFORE=" + before.lastIndexOf(".join"),
    "NEXT_JOIN_AFTER=" + after.indexOf(".join")
  ].join("\n");
}

const patterns = [
  "承認前の最終確認",
  "差し戻し前の最終確認",
  "承認確認へ進む",
  "差し戻し確認へ進む",
  "承認を実行する（次工程）",
  "差し戻しを実行する（次工程）",
  "承認を実行する",
  "差し戻しを実行する",
  "disabled",
  "data-core-action",
  "aicm_human_review_item_id",
  "owner_civilization_id",
  "human_reviewer_label",
  "review_title",
  "delivery_summary_text"
];

out += "\n---- original/current counts ----\n";
for (const p of patterns) {
  out += "ORIGINAL_COUNT_" + p + "=" + count(original, p) + "\n";
}

out += "\n---- temp/excluding patch blocks counts ----\n";
for (const p of patterns) {
  out += "TEMP_COUNT_" + p + "=" + count(src, p) + "\n";
}

out += "\n============================================================\n";
out += "source shape: 承認を実行する（次工程）\n";
out += "============================================================\n";
out += sourceShape("承認を実行する（次工程）") + "\n";

out += "\n============================================================\n";
out += "source shape: 差し戻しを実行する（次工程）\n";
out += "============================================================\n";
out += sourceShape("差し戻しを実行する（次工程）") + "\n";

out += "\n============================================================\n";
out += "source shape: 承認を実行する\n";
out += "============================================================\n";
out += sourceShape("承認を実行する") + "\n";

out += "\n============================================================\n";
out += "source shape: 差し戻しを実行する\n";
out += "============================================================\n";
out += sourceShape("差し戻しを実行する") + "\n";

for (const p of [
  "承認前の最終確認",
  "差し戻し前の最終確認",
  "承認確認へ進む",
  "差し戻し確認へ進む",
  "承認を実行",
  "差し戻しを実行"
]) {
  out += "\n============================================================\n";
  out += p + " around excluding patch blocks\n";
  out += "============================================================\n";
  out += around(p) + "\n";
}

fs.writeFileSync(scanPath, out, "utf8");
