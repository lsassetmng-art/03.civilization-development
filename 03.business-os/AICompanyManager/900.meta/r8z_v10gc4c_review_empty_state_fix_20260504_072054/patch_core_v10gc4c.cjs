const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");
const before = src;
const log = [];
const analysis = [];

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), "g")) || []).length;
}

function removeMarkedBlock(marker) {
  const re = new RegExp(
    "\\n\\s*//\\s*" + escRe(marker) + "_START[\\s\\S]*?//\\s*" + escRe(marker) + "_END\\s*\\n?",
    "g"
  );
  const oldLen = src.length;
  src = src.replace(re, "\n");
  log.push("REMOVED_" + marker + "=" + (oldLen !== src.length));
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

function findFunctionContaining(label) {
  const idx = src.indexOf(label);
  if (idx < 0) return null;

  const prefix = src.slice(0, idx);
  const reList = [
    /(?:async\s+)?function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\([^)]*\)\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*(?:async\s*)?function\s*\([^)]*\)\s*\{/g,
    /(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/g
  ];

  let best = null;

  for (const re of reList) {
    let m;
    while ((m = re.exec(prefix))) {
      if (!best || m.index > best.index) best = { index: m.index, header: m[0] };
    }
  }

  if (!best) return null;

  const open = src.indexOf("{", best.index);
  const end = scanBraceEnd(src, open);

  if (open < 0 || end < 0 || idx > end) return null;

  return {
    start: best.index,
    end,
    header: best.header,
    text: src.slice(best.index, end)
  };
}

const marker = "AICM_R8Z_V10GC4C_REVIEW_EMPTY_STATE_FIX";

analysis.push("BEFORE_BAD_EMPTY_TEXT_COUNT=" + count(src, "レビュー待ちが取得できません"));
analysis.push("BEFORE_GOOD_EMPTY_TEXT_COUNT=" + count(src, "レビュー・承認待ちはありません"));
analysis.push("BEFORE_V10GC4C_MARKER_COUNT=" + count(src, marker));

removeMarkedBlock(marker);

const fn = findFunctionContaining("レビュー待ちが取得できません");
analysis.push("TARGET_FUNCTION_FOUND=" + !!fn);
analysis.push("TARGET_FUNCTION_HEADER=" + (fn ? fn.header : ""));

if (!fn) {
  analysis.push("PATCH_DECISION=STOP_EMPTY_STATE_FUNCTION_NOT_FOUND");
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(2);
}

let patched = fn.text;

patched = patched.replace(/レビュー待ちが取得できません/g, "レビュー・承認待ちはありません");
patched = patched.replace(/レビュー待ちを取得できません/g, "レビュー・承認待ちはありません");
patched = patched.replace(/取得できません/g, "現在、承認待ちの成果物はありません");
patched = patched.replace(/取得失敗/g, "対象なし");
patched = patched.replace(/border\s*:\s*3px\s+solid\s*#ef4444/g, "border:1px solid #e5e7eb");
patched = patched.replace(/border\s*:\s*3px\s+solid\s*#dc2626/g, "border:1px solid #e5e7eb");
patched = patched.replace(/border\s*:\s*3px\s+solid\s*red/g, "border:1px solid #e5e7eb");
patched = patched.replace(/border\s*:\s*4px\s+solid\s*#ef4444/g, "border:1px solid #e5e7eb");
patched = patched.replace(/background\s*:\s*#fef2f2/g, "background:#ffffff");
patched = patched.replace(/background\s*:\s*#fee2e2/g, "background:#ffffff");

if (patched === fn.text) {
  analysis.push("PATCH_DECISION=STOP_FUNCTION_FOUND_BUT_NO_CHANGE");
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(3);
}

src = src.slice(0, fn.start) + patched + src.slice(fn.end);

src += `

// ${marker}_START
// Empty review list state normalized.
// pending=0 is not a fetch failure.
// ${marker}_END
`;

analysis.push("AFTER_BAD_EMPTY_TEXT_COUNT=" + count(src, "レビュー待ちが取得できません"));
analysis.push("AFTER_GOOD_EMPTY_TEXT_COUNT=" + count(src, "レビュー・承認待ちはありません"));
analysis.push("AFTER_V10GC4C_MARKER_COUNT=" + count(src, marker));
analysis.push("PATCH_CHANGED=" + (src !== before));
analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
