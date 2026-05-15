const fs = require("fs");

const [,, serverPath, outPath] = process.argv;
const src = fs.readFileSync(serverPath, "utf8");
const lines = src.split(/\r?\n/);

const pathRegex = /["'`](\/[A-Za-z0-9_./:?#=&{}$-]+)["'`]/g;
const candidates = [];

for (let i = 0; i < lines.length; i += 1) {
  let m;
  while ((m = pathRegex.exec(lines[i])) !== null) {
    const path = m[1];
    if (path === "/" || path.includes("node_modules")) continue;

    const start = Math.max(0, i - 12);
    const end = Math.min(lines.length, i + 18);
    const windowText = lines.slice(start, end).join("\n");

    let score = 0;
    if (/POST/i.test(windowText)) score += 20;
    if (/runtime/i.test(path + windowText)) score += 12;
    if (/request/i.test(path + windowText)) score += 12;
    if (/execution/i.test(path + windowText)) score += 8;
    if (/workflow/i.test(path + windowText)) score += 8;
    if (/live-aiworkeros-call/i.test(path + windowText)) score += 8;
    if (/fn_runtime_execution_create_request_with_route_v1/i.test(windowText)) score += 20;
    if (/task_instruction_ja|task_title|model_code/i.test(windowText)) score += 8;
    if (/health|ready|status/i.test(path)) score -= 20;

    candidates.push({
      path,
      line: i + 1,
      score,
      windowPreview: windowText.slice(0, 900)
    });
  }
}

const unique = new Map();
for (const c of candidates) {
  const prev = unique.get(c.path);
  if (!prev || c.score > prev.score) unique.set(c.path, c);
}

const sorted = Array.from(unique.values()).sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

const linesOut = [];
linesOut.push("# route inventory");
linesOut.push("");
for (const c of sorted) {
  linesOut.push("PATH=" + c.path);
  linesOut.push("LINE=" + c.line);
  linesOut.push("SCORE=" + c.score);
  linesOut.push("---");
}

fs.writeFileSync(outPath, linesOut.join("\n") + "\n");
console.log("ROUTE_COUNT=" + sorted.length);
console.log("TOP_PATH=" + (sorted[0] ? sorted[0].path : ""));
console.log("TOP_SCORE=" + (sorted[0] ? sorted[0].score : ""));
