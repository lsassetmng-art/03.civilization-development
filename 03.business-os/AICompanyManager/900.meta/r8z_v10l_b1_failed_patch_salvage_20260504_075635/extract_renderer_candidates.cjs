const fs = require("fs");

const corePath = process.argv[2];
const outPath = process.argv[3];

const src = fs.readFileSync(corePath, "utf8");

function scanBraceEnd(source, openIndex) {
  let depth = 0;
  let quote = "";
  let esc = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

function lineNo(index) {
  return src.slice(0, index).split(/\n/).length;
}

const patterns = [
  /(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\([^)]*\)\s*\{/g,
  /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?function\s*\([^)]*\)\s*\{/g,
  /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/g
];

const candidates = [];

for (const re of patterns) {
  let m;
  while ((m = re.exec(src))) {
    const name = m[1] || "";
    const open = src.indexOf("{", m.index);
    const end = scanBraceEnd(src, open);
    if (open < 0 || end < 0) continue;

    const body = src.slice(m.index, end);
    const score =
      (body.includes("task-ledger") ? 10 : 0) +
      (body.includes("部門別タスク台帳") ? 10 : 0) +
      (body.includes("taskLedger") ? 6 : 0) +
      (body.includes("renderShell") ? 4 : 0) +
      (body.includes("review-list") ? -3 : 0) +
      (name.toLowerCase().includes("task") ? 5 : 0) +
      (name.toLowerCase().includes("ledger") ? 5 : 0);

    if (score > 0) {
      candidates.push({
        name,
        line: lineNo(m.index),
        score,
        hasTaskLedgerScreen: body.includes("task-ledger"),
        hasJapaneseTitle: body.includes("部門別タスク台帳"),
        hasRenderShell: body.includes("renderShell"),
        hasTaskLedgerArray: body.includes("taskLedger"),
        snippet: body.slice(0, 1800)
      });
    }
  }
}

candidates.sort((a, b) => b.score - a.score || a.line - b.line);

let out = "";
out += "CANDIDATE_COUNT=" + candidates.length + "\n";
out += "TOP_CANDIDATES=" + candidates.slice(0, 10).map(c => c.name + "@" + c.line + ":score" + c.score).join(",") + "\n\n";

for (const c of candidates.slice(0, 12)) {
  out += "============================================================\n";
  out += "name=" + c.name + "\n";
  out += "line=" + c.line + "\n";
  out += "score=" + c.score + "\n";
  out += "hasTaskLedgerScreen=" + c.hasTaskLedgerScreen + "\n";
  out += "hasJapaneseTitle=" + c.hasJapaneseTitle + "\n";
  out += "hasRenderShell=" + c.hasRenderShell + "\n";
  out += "hasTaskLedgerArray=" + c.hasTaskLedgerArray + "\n";
  out += "---- snippet ----\n";
  out += c.snippet + "\n\n";
}

fs.writeFileSync(outPath, out, "utf8");
