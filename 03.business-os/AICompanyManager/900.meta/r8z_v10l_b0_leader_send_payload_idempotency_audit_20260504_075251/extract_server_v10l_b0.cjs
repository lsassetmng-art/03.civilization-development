const fs = require("fs");

const serverPath = process.argv[2];
const fnOut = process.argv[3];
const routeOut = process.argv[4];

const src = fs.readFileSync(serverPath, "utf8");

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

function findFunction(name) {
  const re = new RegExp("(?:async\\s+)?function\\s+" + name + "\\s*\\([^)]*\\)\\s*\\{");
  const m = src.match(re);
  if (!m || typeof m.index !== "number") return null;
  const open = src.indexOf("{", m.index);
  const end = scanBraceEnd(src, open);
  if (open < 0 || end < 0) return null;
  return {
    start: m.index,
    end,
    text: src.slice(m.index, end)
  };
}

function lineNo(index) {
  return src.slice(0, index).split(/\n/).length;
}

const fn = findFunction("runLeaderAutoDecomposition");
let fnText = "";
if (fn) {
  fnText += "FUNCTION_FOUND=true\n";
  fnText += "FUNCTION_START_LINE=" + lineNo(fn.start) + "\n";
  fnText += "FUNCTION_END_LINE=" + lineNo(fn.end) + "\n";
  fnText += "REQUIRED_UUID_KEYS=" + Array.from(fn.text.matchAll(/requiredUuid\(body\.([A-Za-z0-9_]+)/g)).map(m => m[1]).join(",") + "\n";
  fnText += "REQUIRED_TEXT_KEYS=" + Array.from(fn.text.matchAll(/requiredText\(body\.([A-Za-z0-9_]+)/g)).map(m => m[1]).join(",") + "\n";
  fnText += "BODY_KEY_REFERENCES=" + Array.from(new Set(Array.from(fn.text.matchAll(/body\.([A-Za-z0-9_]+)/g)).map(m => m[1]))).sort().join(",") + "\n";
  fnText += "\n---- function source ----\n";
  fnText += fn.text + "\n";
} else {
  fnText += "FUNCTION_FOUND=false\n";
}

fs.writeFileSync(fnOut, fnText, "utf8");

const routeNeedle = "/api/aicm/v2/leader-auto-decomposition/run";
const idx = src.indexOf(routeNeedle);
let routeText = "";
if (idx >= 0) {
  const start = Math.max(0, idx - 2500);
  const end = Math.min(src.length, idx + 2500);
  routeText += "ROUTE_FOUND=true\n";
  routeText += "ROUTE_LINE=" + lineNo(idx) + "\n";
  routeText += "\n---- route nearby ----\n";
  routeText += src.slice(start, end);
} else {
  routeText += "ROUTE_FOUND=false\n";
}

fs.writeFileSync(routeOut, routeText, "utf8");
