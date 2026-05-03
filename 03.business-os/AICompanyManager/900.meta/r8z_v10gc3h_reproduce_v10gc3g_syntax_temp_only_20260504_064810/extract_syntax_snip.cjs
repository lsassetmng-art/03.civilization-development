const fs = require("fs");

const corePath = process.argv[2];
const syntaxPath = process.argv[3];
const outPath = process.argv[4];

const src = fs.readFileSync(corePath, "utf8");
const syntax = fs.existsSync(syntaxPath) ? fs.readFileSync(syntaxPath, "utf8") : "";
const lines = src.split(/\n/);

let lineNo = 0;

const m1 = syntax.match(/:(\d+)\s*$/m);
if (m1) lineNo = Number(m1[1]);

const m2 = syntax.match(/\.js:(\d+)/);
if (!lineNo && m2) lineNo = Number(m2[1]);

const m3 = syntax.match(/file:\/\/.*?:(\d+)/);
if (!lineNo && m3) lineNo = Number(m3[1]);

let out = "";
out += "SYNTAX_LINE=" + lineNo + "\n";

if (lineNo > 0) {
  const start = Math.max(1, lineNo - 35);
  const end = Math.min(lines.length, lineNo + 35);

  for (let i = start; i <= end; i += 1) {
    const mark = i === lineNo ? " >>> " : "     ";
    out += mark + String(i).padStart(6, " ") + ": " + lines[i - 1] + "\n";
  }
} else {
  out += "SYNTAX_LINE_NOT_PARSED\n";
}

out += "\n============================================================\n";
out += "renderConfirm wrap hits\n";
out += "============================================================\n";

lines.forEach((line, idx) => {
  if (
    line.includes("aicmR8zV10gc3gInsertReviewDecisionAction") ||
    line.includes("renderConfirm") ||
    line.includes("AICM_R8Z_V10GC3G")
  ) {
    out += String(idx + 1).padStart(6, " ") + ": " + line + "\n";
  }
});

fs.writeFileSync(outPath, out, "utf8");
