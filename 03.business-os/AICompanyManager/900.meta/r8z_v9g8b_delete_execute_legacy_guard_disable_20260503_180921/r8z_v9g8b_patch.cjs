const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

function findSegment(text) {
  let start = text.indexOf("async function aicmR8zV9g5ExecuteDeleteConfirm");
  if (start < 0) start = text.indexOf("function aicmR8zV9g5ExecuteDeleteConfirm");
  if (start < 0) return null;

  let end = text.indexOf("\nfunction aicmR8zV9g5CancelDeleteConfirm", start);
  if (end > start) {
    return { start, end, text: text.slice(start, end) };
  }

  const brace = text.indexOf("{", start);
  if (brace < 0) return null;

  let depth = 0;
  let quote = "";
  let escape = false;

  for (let i = brace; i < text.length; i += 1) {
    const ch = text[i];

    if (quote) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === quote) {
        quote = "";
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return { start, end: i + 1, text: text.slice(start, i + 1) };
    }
  }

  return null;
}

const seg = findSegment(src);

if (!seg) {
  log.push("ERROR: aicmR8zV9g5ExecuteDeleteConfirm segment not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

let block = seg.text;

if (!block.includes("/api/aicm/v2/manager-major/update")) {
  log.push("ERROR: V9G5 fallback manager-major/update not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

const old1Re = /if\s*\(\s*typeof\s+aicmExecuteMajorItemDeleteConfirmR8P\s*===\s*["']function["']\s*\)\s*\{/;
const old2Re = /if\s*\(\s*typeof\s+aicmExecuteManagerMajorDeleteConfirmR8P\s*===\s*["']function["']\s*\)\s*\{/;

const old1Before = old1Re.test(block);
const old2Before = old2Re.test(block);

if (!old1Before && !old2Before) {
  log.push("ERROR: legacy execute guards not found in V9G5 segment");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(4);
}

block = block.replace(
  old1Re,
  'if (false && typeof aicmExecuteMajorItemDeleteConfirmR8P === "function") { // ' + marker + ': skip old1'
);

block = block.replace(
  old2Re,
  'if (false && typeof aicmExecuteManagerMajorDeleteConfirmR8P === "function") { // ' + marker + ': skip old2'
);

block = block.replace(
  /async function aicmR8zV9g5ExecuteDeleteConfirm\s*\(([^)]*)\)\s*\{/,
  'async function aicmR8zV9g5ExecuteDeleteConfirm($1) {\n  // ' + marker + ': V9G5 owns confirmed delete via manager-major/update fallback.'
);

src = src.slice(0, seg.start) + block + src.slice(seg.end);

fs.writeFileSync(corePath, src, "utf8");

log.push("PATCH_APPLIED: V9G5 legacy guards disabled only");
log.push("OLD1_GUARD_FOUND=" + String(old1Before));
log.push("OLD2_GUARD_FOUND=" + String(old2Before));
fs.writeFileSync(patchLog, log.join("\n") + "\n");
