const fs = require("fs");

const corePath = process.argv[2];
const outPath = process.argv[3];
const extractPath = process.argv[4];

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\n/);

const patterns = [
  "承認前の最終確認",
  "差し戻し前の最終確認",
  "承認確認へ進む",
  "差し戻し確認へ進む",
  "承認を実行する（次工程）",
  "差し戻しを実行する（次工程）",
  "承認を実行する",
  "差し戻しを実行する",
  "review-v10gc2j-execute-approved",
  "review-v10gc2j-execute-returned",
  "review-decision-execute",
  "data-core-action",
  "data-review-item-id",
  "data-owner-civilization-id",
  "data-human-reviewer-label"
];

function count(needle) {
  return (src.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

let summary = "";
patterns.forEach((p) => {
  summary += p + "\t" + count(p) + "\n";
});
fs.writeFileSync(outPath, summary, "utf8");

function around(pattern, before = 50, after = 80) {
  const out = [];
  lines.forEach((line, idx) => {
    if (line.includes(pattern)) {
      const s = Math.max(0, idx - before);
      const e = Math.min(lines.length, idx + after);
      out.push("---- hit line " + (idx + 1) + " pattern=" + pattern + " ----\n" + lines.slice(s, e).join("\n"));
    }
  });
  return out.join("\n\n") || "NO_HIT";
}

let extract = "";
patterns.forEach((p) => {
  extract += "\n============================================================\n";
  extract += p + " around\n";
  extract += "============================================================\n";
  extract += around(p);
  extract += "\n";
});

fs.writeFileSync(extractPath, extract, "utf8");
