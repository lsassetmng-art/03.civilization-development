const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];

let src = fs.readFileSync(corePath, "utf8");

const targets = [
  "AICM_R8Z_V10GC2C_REVIEW_CONFIRM_BUTTON_FORCE_ENABLE",
  "AICM_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME"
];

const log = [];

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

for (const marker of targets) {
  const before = src.length;
  const re = new RegExp(
    "\\n\\s*//\\s*" + esc(marker) + "_START[\\s\\S]*?//\\s*" + esc(marker) + "_END\\s*\\n?",
    "g"
  );

  src = src.replace(re, "\n");
  const removed = before !== src.length;

  log.push("REMOVED_" + marker + "=" + (removed ? "true" : "false"));
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
