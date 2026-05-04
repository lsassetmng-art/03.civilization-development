import fs from "node:fs";
import path from "node:path";

const gitRoot = process.argv[2];
const stagedListFile = process.argv[3];

if (!gitRoot || !stagedListFile) {
  throw new Error("usage: node fix.mjs <gitRoot> <stagedListFile>");
}

const staged = fs.readFileSync(stagedListFile, "utf8")
  .split(/\r?\n/)
  .map((v) => v.trim())
  .filter(Boolean)
  .filter((p) => p.startsWith("11.aiworker-os/"));

let scanned = 0;
let changed = 0;
let skippedMissing = 0;
let skippedBinary = 0;

function isBinary(buf) {
  const len = Math.min(buf.length, 4096);
  for (let i = 0; i < len; i += 1) {
    if (buf[i] === 0) return true;
  }
  return false;
}

for (const rel of staged) {
  const abs = path.join(gitRoot, rel);

  if (!fs.existsSync(abs)) {
    skippedMissing += 1;
    console.log(`SKIP_MISSING ${rel}`);
    continue;
  }

  const buf = fs.readFileSync(abs);
  if (isBinary(buf)) {
    skippedBinary += 1;
    console.log(`SKIP_BINARY ${rel}`);
    continue;
  }

  scanned += 1;

  const before = buf.toString("utf8");
  const after = before
    .split(/\n/)
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n");

  if (after !== before) {
    fs.writeFileSync(abs, after, "utf8");
    changed += 1;
    console.log(`FIXED_TRAILING_WHITESPACE ${rel}`);
  }
}

console.log("SUMMARY");
console.log(`SCANNED_TEXT_FILES=${scanned}`);
console.log(`CHANGED_FILES=${changed}`);
console.log(`SKIPPED_MISSING=${skippedMissing}`);
console.log(`SKIPPED_BINARY=${skippedBinary}`);
