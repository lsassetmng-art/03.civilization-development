const fs = require("fs");

const corePath = process.argv[2];
const rendererOut = process.argv[3];
const routeOut = process.argv[4];

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

function windows(patterns, radius, maxHits) {
  const out = [];

  for (const pattern of patterns) {
    const re = new RegExp(pattern, "g");
    let m;
    let hit = 0;

    out.push("");
    out.push("============================================================");
    out.push("PATTERN: " + pattern);
    out.push("============================================================");

    while ((m = re.exec(src)) && hit < maxHits) {
      const line = lineNoAt(m.index);
      out.push("");
      out.push("---- hit " + (hit + 1) + " line " + line + " ----");
      out.push(printWindowByLine(line, radius));
      hit += 1;
    }

    if (hit === 0) out.push("NO_HIT");
  }

  return out.join("\n");
}

fs.writeFileSync(rendererOut, windows([
  "function\\s+renderPmlwMajorRows",
  "renderPmlwMajorRows\\(",
  "function\\s+renderPmlwMajorRowsBaseAxuR1B",
  "登録済み大項目",
  "pmlw-major-page-prev",
  "pmlw-major-page-next"
], 140, 20), "utf8");

fs.writeFileSync(routeOut, windows([
  "pmlw-major-leader-handoff",
  "pmlw-major-delete-open",
  "pmlw-major-delete-execute",
  "leader-auto-decomposition",
  "manager-major/archive",
  "document\\.addEventListener\\(\"click\"",
  "data-core-action"
], 90, 30), "utf8");
