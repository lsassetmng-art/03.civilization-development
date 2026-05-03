const fs = require("fs");
const path = require("path");

const corePath = process.argv[2];
const metaDir = process.argv[3];
const extractOut = process.argv[4];
const compareOut = process.argv[5];

const src = fs.readFileSync(corePath, "utf8");

function block(text, name) {
  const idx = text.indexOf("function " + name);
  if (idx < 0) return "";
  const brace = text.indexOf("{", idx);
  if (brace < 0) return "";
  let depth = 0;
  for (let i = brace; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(idx, i + 1);
    }
  }
  return "";
}

function hasApiCall(text) {
  return /requestJson\s*\(|fetch\s*\(|XMLHttpRequest|manager-major\/update|manager-major\/archive/.test(text);
}

function hasAwait(text) {
  return /\bawait\b|\.then\s*\(/.test(text);
}

function hasReturnBeforeFallback(v9) {
  return /aicmExecuteMajorItemDeleteConfirmR8P[\s\S]{0,500}return\s*;/.test(v9);
}

function summarizeFn(name, fn) {
  const out = [];
  out.push("FUNCTION=" + name);
  out.push("EXISTS=" + String(!!fn));
  out.push("LENGTH=" + String(fn.length));
  out.push("USES_API_CALL=" + String(hasApiCall(fn)));
  out.push("USES_AWAIT_OR_THEN=" + String(hasAwait(fn)));
  out.push("USES_DELETE_STATE=" + String(fn.includes("managerMajorDeleteConfirm")));
  out.push("CLEARS_DELETE_STATE=" + String(/managerMajorDeleteConfirm\s*=\s*null/.test(fn)));
  out.push("USES_MANAGER_UPDATE_ENDPOINT=" + String(fn.includes("/api/aicm/v2/manager-major/update")));
  out.push("USES_MANAGER_ARCHIVE_ENDPOINT=" + String(fn.includes("/api/aicm/v2/manager-major/archive")));
  out.push("HAS_EARLY_RETURN=" + String(/\breturn\s*;/.test(fn)));
  out.push("HEAD=");
  out.push(fn ? fn.slice(0, 5000) : "NOT_FOUND");
  out.push("");
  return out.join("\n");
}

const old1 = block(src, "aicmExecuteMajorItemDeleteConfirmR8P");
const old2 = block(src, "aicmExecuteManagerMajorDeleteConfirmR8P");
const v9g5 = block(src, "aicmR8zV9g5ExecuteDeleteConfirm");

const extract = [];
extract.push("CURRENT_DELETE_EXECUTE_INNER_ANALYSIS");
extract.push("");
extract.push(summarizeFn("aicmExecuteMajorItemDeleteConfirmR8P", old1));
extract.push(summarizeFn("aicmExecuteManagerMajorDeleteConfirmR8P", old2));
extract.push(summarizeFn("aicmR8zV9g5ExecuteDeleteConfirm", v9g5));
extract.push("V9G5_CALLS_OLD1=" + String(v9g5.includes("aicmExecuteMajorItemDeleteConfirmR8P")));
extract.push("V9G5_RETURNS_AFTER_OLD1=" + String(hasReturnBeforeFallback(v9g5)));
extract.push("V9G5_HAS_FALLBACK_UPDATE=" + String(v9g5.includes("/api/aicm/v2/manager-major/update")));
extract.push("OLD1_API_EMPTY_BUT_EXISTS=" + String(!!old1 && !hasApiCall(old1)));
extract.push("LIKELY_CAUSE=" + (
  !!old1 && !hasApiCall(old1) && hasReturnBeforeFallback(v9g5)
    ? "OLD_EXECUTE_NO_API_BLOCKS_V9G5_FALLBACK"
    : (!!old1 && hasApiCall(old1)
      ? "OLD_EXECUTE_HAS_API_CHECK_RUNTIME_ERROR_OR_PAYLOAD"
      : "CHECK_BRIDGE_OR_ACTION")
));
fs.writeFileSync(extractOut, extract.join("\n") + "\n");

function listFiles(dir) {
  const out = [];
  function walk(d) {
    let entries = [];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (_) { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/aicm-production-core.*\.js$/.test(e.name)) out.push(p);
    }
  }
  walk(dir);
  return out;
}

function analyzeFile(file) {
  let text = "";
  try { text = fs.readFileSync(file, "utf8"); } catch (_) {}
  const b1 = block(text, "aicmExecuteMajorItemDeleteConfirmR8P");
  const b2 = block(text, "aicmExecuteManagerMajorDeleteConfirmR8P");
  const stat = fs.statSync(file);
  const best = b1 || b2;
  return {
    mtime: stat.mtime.toISOString(),
    file,
    hasOld1: !!b1,
    old1UsesApi: hasApiCall(b1),
    old1UsesUpdate: b1.includes("/api/aicm/v2/manager-major/update"),
    old1UsesArchive: b1.includes("/api/aicm/v2/manager-major/archive"),
    old1ClearsState: /managerMajorDeleteConfirm\s*=\s*null/.test(b1),
    hasOld2: !!b2,
    old2UsesApi: hasApiCall(b2),
    old2UsesUpdate: b2.includes("/api/aicm/v2/manager-major/update"),
    old2UsesArchive: b2.includes("/api/aicm/v2/manager-major/archive"),
    old2ClearsState: /managerMajorDeleteConfirm\s*=\s*null/.test(b2),
    anyUsesApi: hasApiCall(best),
    length: best.length
  };
}

const rows = listFiles(metaDir)
  .map(analyzeFile)
  .filter(r => r.hasOld1 || r.hasOld2)
  .sort((a,b) => a.mtime.localeCompare(b.mtime));

const compare = [];
compare.push("mtime\thasOld1\told1UsesApi\told1UsesUpdate\told1UsesArchive\told1ClearsState\thasOld2\told2UsesApi\told2UsesUpdate\told2UsesArchive\told2ClearsState\tanyUsesApi\tlength\tfile");
for (const r of rows) {
  compare.push([
    r.mtime,
    r.hasOld1,
    r.old1UsesApi,
    r.old1UsesUpdate,
    r.old1UsesArchive,
    r.old1ClearsState,
    r.hasOld2,
    r.old2UsesApi,
    r.old2UsesUpdate,
    r.old2UsesArchive,
    r.old2ClearsState,
    r.anyUsesApi,
    r.length,
    r.file
  ].join("\t"));
}
fs.writeFileSync(compareOut, compare.join("\n") + "\n");
