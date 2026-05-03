const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V9G8_DELETE_EXECUTE_FALLBACK_PRIMARY";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

function findFunctionBlock(text, name) {
  const start = text.indexOf("async function " + name) >= 0
    ? text.indexOf("async function " + name)
    : text.indexOf("function " + name);

  if (start < 0) return null;

  const brace = text.indexOf("{", start);
  if (brace < 0) return null;

  let depth = 0;
  for (let i = brace; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return {
          start,
          end: i + 1,
          bodyStart: brace + 1,
          text: text.slice(start, i + 1)
        };
      }
    }
  }

  return null;
}

const fn = findFunctionBlock(src, "aicmR8zV9g5ExecuteDeleteConfirm");

if (!fn) {
  log.push("ERROR: aicmR8zV9g5ExecuteDeleteConfirm not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

let block = fn.text;

if (!block.includes("/api/aicm/v2/manager-major/update")) {
  log.push("ERROR: V9G5 fallback manager-major/update not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

if (!block.includes("aicmExecuteMajorItemDeleteConfirmR8P")) {
  log.push("ERROR: old execute call not found in V9G5");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(4);
}

const oldBlock1 = /if\s*\(\s*typeof\s+aicmExecuteMajorItemDeleteConfirmR8P\s*===\s*"function"\s*\)\s*\{[\s\S]*?\n\s*\}\s*\n\s*\n\s*if\s*\(\s*typeof\s+aicmExecuteManagerMajorDeleteConfirmR8P\s*===\s*"function"\s*\)\s*\{[\s\S]*?\n\s*\}\s*\n/;

const oldBlock1Match = block.match(oldBlock1);

if (!oldBlock1Match) {
  log.push("ERROR: legacy execute priority block pattern not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(5);
}

const replacement = `
    /* ${marker}
     * Do not call legacy delete execute first.
     * Legacy execute may return before the V9G5 fallback reaches the canonical manager-major/update path.
     * Keep legacy functions in file, but make V9G5 own this confirmed delete operation.
     */
    var aicmR8zV9g8LegacyExecuteSkipped = true;
    if (typeof console !== "undefined" && console.info) {
      console.info("AICM R8Z-V9G8: legacy delete execute skipped; using manager-major/update fallback", {
        majorId: majorId,
        owner: owner,
        skipped: aicmR8zV9g8LegacyExecuteSkipped
      });
    }

`;

block = block.replace(oldBlock1, replacement);

src = src.slice(0, fn.start) + block + src.slice(fn.end);

fs.writeFileSync(corePath, src, "utf8");
log.push("PATCH_APPLIED: V9G5 legacy execute priority disabled");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
