const fs = require("fs");

const corePath = process.argv[2];
const tempPath = process.argv[3];
const titleScanPath = process.argv[4];
const helperScanPath = process.argv[5];

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

let removal = "";
for (const marker of removeTargets) {
  removal += "REMOVED_" + marker + "=" + removeMarkedBlock(marker) + "\n";
}

fs.writeFileSync(tempPath, src, "utf8");

function lineOf(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function scanFunctionBoundsAround(index) {
  const startSearch = src.slice(0, index);

  const functionPatterns = [
    /(?:async\s+)?function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\([^)]*\)\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*function\s*\([^)]*\)\s*\{/g
  ];

  let best = null;
  for (const re of functionPatterns) {
    let m;
    while ((m = re.exec(startSearch))) {
      if (!best || m.index > best.index) {
        best = { index: m.index, text: m[0] };
      }
    }
  }

  if (!best) return null;

  const open = src.indexOf("{", best.index);
  if (open < 0) return null;

  let depth = 0;
  let quote = "";
  let esc = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < src.length; i += 1) {
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
      if (depth === 0) {
        return {
          start: best.index,
          open,
          end: i + 1,
          header: best.text,
          startLine: lineOf(best.index),
          endLine: lineOf(i + 1),
          text: src.slice(best.index, i + 1)
        };
      }
    }
  }

  return null;
}

function numberedWindow(index, before, after) {
  const lines = src.split(/\n/);
  const center = lineOf(index);
  const start = Math.max(1, center - before);
  const end = Math.min(lines.length, center + after);
  const out = [];

  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }

  return out.join("\n");
}

function functionStats(fnText) {
  const needles = [
    "承認前の最終確認",
    "差し戻し前の最終確認",
    "承認確認へ進む",
    "差し戻し確認へ進む",
    "承認を実行",
    "差し戻しを実行",
    "button",
    "<button",
    "disabled",
    "data-core-action",
    "data-review",
    "owner_civilization_id",
    "human_reviewer_label",
    "aicm_human_review_item_id",
    "review",
    "confirm",
    "action",
    "actions",
    "render",
    "join",
    "map"
  ];

  return needles.map((n) => n + "=" + count(fnText, n)).join("\n");
}

function findCalls(fnText) {
  const calls = new Set();
  const re = /\b([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  let m;
  while ((m = re.exec(fnText))) {
    const name = m[1];
    if ([
      "if","for","while","switch","catch","function","return","String","Array","Object","Date","JSON",
      "text","esc","map","filter","join","push","setTimeout"
    ].includes(name)) continue;
    calls.add(name);
  }
  return Array.from(calls).sort();
}

function extractByLabel(label) {
  const idx = src.indexOf(label);
  if (idx < 0) {
    return {
      label,
      found: false,
      output: "LABEL=" + label + "\nFOUND=false\n"
    };
  }

  const fn = scanFunctionBoundsAround(idx);
  const out = [];

  out.push("============================================================");
  out.push("LABEL=" + label);
  out.push("============================================================");
  out.push("FOUND=true");
  out.push("LABEL_LINE=" + lineOf(idx));

  if (fn) {
    out.push("FUNCTION_HEADER=" + fn.header);
    out.push("FUNCTION_START_LINE=" + fn.startLine);
    out.push("FUNCTION_END_LINE=" + fn.endLine);
    out.push("FUNCTION_LENGTH=" + fn.text.length);
    out.push("FUNCTION_STATS_BEGIN");
    out.push(functionStats(fn.text));
    out.push("FUNCTION_STATS_END");
    out.push("FUNCTION_CALLS=" + findCalls(fn.text).join(","));
    out.push("");
    out.push("---- function extract ----");
    out.push(fn.text);
  } else {
    out.push("FUNCTION_FOUND=false");
    out.push("---- source window ----");
    out.push(numberedWindow(idx, 90, 120));
  }

  return {
    label,
    found: true,
    functionHeader: fn ? fn.header : "",
    functionText: fn ? fn.text : "",
    output: out.join("\n") + "\n"
  };
}

const approveTitle = extractByLabel("承認前の最終確認");
const returnTitle = extractByLabel("差し戻し前の最終確認");

let titleOut = "";
titleOut += removal;
titleOut += "\n---- temp counts ----\n";
[
  "承認前の最終確認",
  "差し戻し前の最終確認",
  "承認確認へ進む",
  "差し戻し確認へ進む",
  "承認を実行",
  "差し戻しを実行",
  "button",
  "<button",
  "disabled",
  "data-core-action",
  "review",
  "confirm",
  "action",
  "owner_civilization_id",
  "human_reviewer_label",
  "aicm_human_review_item_id"
].forEach((n) => {
  titleOut += "TEMP_COUNT_" + n + "=" + count(src, n) + "\n";
});

titleOut += "\n" + approveTitle.output + "\n" + returnTitle.output;
fs.writeFileSync(titleScanPath, titleOut, "utf8");

const combinedFnText = [approveTitle.functionText, returnTitle.functionText].join("\n");
const calls = findCalls(combinedFnText);

let helperOut = "";
helperOut += "FUNCTION_CALLS_FROM_CONFIRM_TITLES=" + calls.join(",") + "\n";

const helperNames = calls.filter((name) => /render|button|action|card|confirm|review|footer|toolbar|shell|message|html/i.test(name));

helperOut += "HELPER_CANDIDATES=" + helperNames.join(",") + "\n";

function extractFunctionByName(name) {
  const patterns = [
    new RegExp("(?:async\\s+)?function\\s+" + escRe(name) + "\\s*\\([^)]*\\)\\s*\\{"),
    new RegExp("(?:const|let|var)\\s+" + escRe(name) + "\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{"),
    new RegExp("(?:const|let|var)\\s+" + escRe(name) + "\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{")
  ];

  for (const re of patterns) {
    const m = src.match(re);
    if (m && typeof m.index === "number") {
      const fn = scanFunctionBoundsAround(m.index + 1);
      if (fn) return fn;
    }
  }
  return null;
}

for (const name of helperNames) {
  const fn = extractFunctionByName(name);
  helperOut += "\n============================================================\n";
  helperOut += "HELPER=" + name + "\n";
  helperOut += "============================================================\n";
  if (!fn) {
    helperOut += "FOUND=false\n";
    continue;
  }
  helperOut += "FOUND=true\n";
  helperOut += "FUNCTION_HEADER=" + fn.header + "\n";
  helperOut += "FUNCTION_START_LINE=" + fn.startLine + "\n";
  helperOut += "FUNCTION_END_LINE=" + fn.endLine + "\n";
  helperOut += "FUNCTION_STATS_BEGIN\n";
  helperOut += functionStats(fn.text) + "\n";
  helperOut += "FUNCTION_STATS_END\n";
  helperOut += "---- helper extract ----\n";
  helperOut += fn.text + "\n";
}

fs.writeFileSync(helperScanPath, helperOut, "utf8");
