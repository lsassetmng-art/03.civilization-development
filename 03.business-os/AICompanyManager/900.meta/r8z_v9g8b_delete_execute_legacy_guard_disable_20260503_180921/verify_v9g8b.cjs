const fs = require("fs");

const corePath = process.argv[2];
const outPath = process.argv[3];
const src = fs.readFileSync(corePath, "utf8");

function findSegment(text) {
  let start = text.indexOf("async function aicmR8zV9g5ExecuteDeleteConfirm");
  if (start < 0) start = text.indexOf("function aicmR8zV9g5ExecuteDeleteConfirm");
  if (start < 0) return "";

  let end = text.indexOf("\nfunction aicmR8zV9g5CancelDeleteConfirm", start);
  if (end > start) return text.slice(start, end);

  return text.slice(start, Math.min(text.length, start + 9000));
}

const fn = findSegment(src);

const out = [];
out.push("V9G8B_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE/g) || []).length));
out.push("HAS_V9G5_EXECUTE_SEGMENT=" + String(!!fn));
out.push("V9G5_SEGMENT_HAS_MANAGER_UPDATE=" + String(fn.includes("/api/aicm/v2/manager-major/update")));
out.push("V9G5_OLD1_DISABLED_GUARD=" + String(/if\s*\(\s*false\s*&&\s*typeof\s+aicmExecuteMajorItemDeleteConfirmR8P/.test(fn)));
out.push("V9G5_OLD2_DISABLED_GUARD=" + String(/if\s*\(\s*false\s*&&\s*typeof\s+aicmExecuteManagerMajorDeleteConfirmR8P/.test(fn)));
out.push("V9G5_OLD1_ACTIVE_GUARD=" + String(/if\s*\(\s*typeof\s+aicmExecuteMajorItemDeleteConfirmR8P\s*===\s*["']function["']\s*\)\s*\{/.test(fn)));
out.push("V9G5_OLD2_ACTIVE_GUARD=" + String(/if\s*\(\s*typeof\s+aicmExecuteManagerMajorDeleteConfirmR8P\s*===\s*["']function["']\s*\)\s*\{/.test(fn)));
out.push("OLD_EXECUTE_1_STILL_EXISTS=" + String(/function\s+aicmExecuteMajorItemDeleteConfirmR8P\s*\(/.test(src)));
out.push("OLD_EXECUTE_2_STILL_EXISTS=" + String(/function\s+aicmExecuteManagerMajorDeleteConfirmR8P\s*\(/.test(src)));
out.push("SERVER_PATCH_EXPECTED=NO");
fs.writeFileSync(outPath, out.join("\n") + "\n");
