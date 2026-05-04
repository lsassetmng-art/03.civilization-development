const fs = require("fs");
const corePath = process.argv[2];
const outPath = process.argv[3];

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split("\n");

function lineNoAt(index) {
  return src.slice(0, index).split("\n").length;
}

function printWindowByLine(line, radius) {
  const start = Math.max(1, line - radius);
  const end = Math.min(lines.length, line + radius);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return out.join("\n");
}

const re = /function\s+renderPmlwMajorRows\s*\(\s*rows\s*\)\s*\{/g;
let m;
const hits = [];

while ((m = re.exec(src))) {
  hits.push({
    index: m.index,
    line: lineNoAt(m.index)
  });
}

const out = [];
out.push("RENDER_FUNC_HITS=" + hits.length);

hits.forEach((hit, idx) => {
  out.push("");
  out.push("============================================================");
  out.push("HIT_" + idx + "_LINE=" + hit.line);
  out.push("============================================================");
  out.push(printWindowByLine(hit.line, 180));
});

fs.writeFileSync(outPath, out.join("\n") + "\n", "utf8");
