const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V9E2_LOCAL_RENDER_STATIC_GATE_CORRECTION";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (!src.includes("AICM_R8Z_V9E_REVIEW_LIST_LOCAL_RENDER_ONLY")) {
  log.push("ERROR: V9E marker not found. Apply V9E first.");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

if (src.includes(marker)) {
  log.push("SKIP: V9E2 marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

const before = `// Keep review-list hydration local. Do not call global render(), because it can re-enter
    // task-ledger/dashboard render paths and surface unrelated screen regressions.`;

const after = `// ${marker}
    // Keep review-list hydration local. Avoid the app-wide renderer because it can re-enter
    // task-ledger/dashboard paths and surface unrelated screen regressions.`;

if (!src.includes(before)) {
  log.push("WARN: exact V9E comment not found; inserting V9E2 marker after V9E marker");
  src = src.replace(
    "// AICM_R8Z_V9E_REVIEW_LIST_LOCAL_RENDER_ONLY",
    "// AICM_R8Z_V9E_REVIEW_LIST_LOCAL_RENDER_ONLY\n    // " + marker
  );
} else {
  src = src.replace(before, after);
  log.push("PATCH_APPLIED: removed render() text from comment false positive");
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
