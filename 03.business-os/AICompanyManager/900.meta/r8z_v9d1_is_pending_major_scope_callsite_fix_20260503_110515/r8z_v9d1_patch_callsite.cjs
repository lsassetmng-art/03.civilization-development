const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V9D1_IS_PENDING_MAJOR_SCOPE_CALLSITE_FIX";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!src.includes("function aicmIsPendingManagerMajorRowR8V6(row)")) {
  log.push("ERROR: existing canonical helper aicmIsPendingManagerMajorRowR8V6 not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

const fnNeedle = "function aicmRenderManagerMajorRows(rows) {";
const start = src.indexOf(fnNeedle);

if (start < 0) {
  log.push("ERROR: aicmRenderManagerMajorRows not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

const afterStart = src.indexOf("var confirmCard = aicmRenderMajorItemDeleteConfirmCardR8P();", start);
if (afterStart < 0) {
  log.push("ERROR: confirmCard anchor not found inside aicmRenderManagerMajorRows");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(4);
}

const segment = src.slice(start, afterStart);
const badCall = "      return isPendingMajor(row);";
const fixedCall = [
  "      // " + marker + ": use existing visible canonical helper, not the scope-local isPendingMajor",
  "      if (typeof aicmIsPendingManagerMajorRowR8V6 === \"function\") {",
  "        return aicmIsPendingManagerMajorRowR8V6(row);",
  "      }",
  "      return !!row;"
].join("\n");

if (!segment.includes(badCall)) {
  log.push("ERROR: target bad call not found inside aicmRenderManagerMajorRows");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(5);
}

const newSegment = segment.replace(badCall, fixedCall);
src = src.slice(0, start) + newSegment + src.slice(afterStart);

fs.writeFileSync(corePath, src, "utf8");
log.push("PATCH_APPLIED: aicmRenderManagerMajorRows callsite replaced only");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
