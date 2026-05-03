const fs = require("fs");

const serverPath = process.argv[2];
const outPath = process.argv[3];

const src = fs.readFileSync(serverPath, "utf8");
const lines = src.split(/\n/);
let out = "";

function lineNo(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function scanBraceEnd(openIndex) {
  let depth = 0;
  let quote = "";
  let esc = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

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

function extractFunction(name) {
  const re = new RegExp("(async\\s+)?function\\s+" + name + "\\s*\\(");
  const m = src.match(re);
  if (!m || typeof m.index !== "number") return null;

  const start = m.index;
  const open = src.indexOf("{", start);
  const end = scanBraceEnd(open);
  if (open < 0 || end < 0) return null;

  return {
    name,
    start,
    end,
    line: lineNo(start),
    text: src.slice(start, end)
  };
}

function routesNearCall(callName) {
  const hits = [];
  lines.forEach((line, idx) => {
    if (!line.includes(callName + "(")) return;

    const start = Math.max(0, idx - 30);
    const end = Math.min(lines.length, idx + 12);
    const snippet = lines.slice(start, end).join("\n");

    const routes = [];
    const patterns = [
      /route\s*===\s*["']([^"']+)["']/g,
      /pathname\s*===\s*["']([^"']+)["']/g,
      /url\.pathname\s*===\s*["']([^"']+)["']/g,
      /case\s*["']([^"']+)["']/g
    ];

    for (const re of patterns) {
      let mm;
      while ((mm = re.exec(snippet))) {
        if (mm[1] && mm[1].startsWith("/")) routes.push(mm[1]);
      }
    }

    hits.push({
      line: idx + 1,
      routes: Array.from(new Set(routes)),
      snippet
    });
  });

  return hits;
}

function bodyKeys(text) {
  const keys = new Set();

  const patterns = [
    /body\.([A-Za-z_$][A-Za-z0-9_$]*)/g,
    /body\[['"]([^'"]+)['"]\]/g,
    /requiredUuid\s*\(\s*body\.([A-Za-z_$][A-Za-z0-9_$]*)/g,
    /requiredText\s*\(\s*body\.([A-Za-z_$][A-Za-z0-9_$]*)/g
  ];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) {
      keys.add(m[1]);
    }
  }

  return Array.from(keys).sort();
}

const approveFn = extractFunction("approveHumanReviewItem");
const returnFn = extractFunction("returnHumanReviewItem");
const approveHits = routesNearCall("approveHumanReviewItem");
const returnHits = routesNearCall("returnHumanReviewItem");

out += "HAS_APPROVE_FUNCTION=" + !!approveFn + "\n";
out += "HAS_RETURN_FUNCTION=" + !!returnFn + "\n";
out += "APPROVE_FUNCTION_LINE=" + (approveFn ? approveFn.line : 0) + "\n";
out += "RETURN_FUNCTION_LINE=" + (returnFn ? returnFn.line : 0) + "\n";
out += "APPROVE_ROUTE_CANDIDATES=" + Array.from(new Set(approveHits.flatMap(h => h.routes))).join(",") + "\n";
out += "RETURN_ROUTE_CANDIDATES=" + Array.from(new Set(returnHits.flatMap(h => h.routes))).join(",") + "\n";

out += "APPROVE_BODY_KEYS=" + (approveFn ? bodyKeys(approveFn.text).join(",") : "") + "\n";
out += "RETURN_BODY_KEYS=" + (returnFn ? bodyKeys(returnFn.text).join(",") : "") + "\n";

out += "APPROVE_FUNCTION_HAS_HUMAN_TABLE=" + (approveFn ? approveFn.text.includes("business.aicm_human_review_item") : false) + "\n";
out += "RETURN_FUNCTION_HAS_HUMAN_TABLE=" + (returnFn ? returnFn.text.includes("business.aicm_human_review_item") : false) + "\n";
out += "APPROVE_FUNCTION_HAS_PENDING_GUARD=" + (approveFn ? approveFn.text.includes("human_review_status_code = 'pending'") || approveFn.text.includes('human_review_status_code = "pending"') : false) + "\n";
out += "RETURN_FUNCTION_HAS_PENDING_GUARD=" + (returnFn ? returnFn.text.includes("human_review_status_code = 'pending'") || returnFn.text.includes('human_review_status_code = "pending"') : false) + "\n";

out += "\n============================================================\n";
out += "APPROVE ROUTE HITS\n";
out += "============================================================\n";
approveHits.forEach((h) => {
  out += "LINE=" + h.line + " ROUTES=" + h.routes.join(",") + "\n";
  out += h.snippet + "\n\n";
});

out += "\n============================================================\n";
out += "RETURN ROUTE HITS\n";
out += "============================================================\n";
returnHits.forEach((h) => {
  out += "LINE=" + h.line + " ROUTES=" + h.routes.join(",") + "\n";
  out += h.snippet + "\n\n";
});

out += "\n============================================================\n";
out += "APPROVE FUNCTION EXTRACT\n";
out += "============================================================\n";
out += approveFn ? approveFn.text : "NOT_FOUND";
out += "\n\n============================================================\n";
out += "RETURN FUNCTION EXTRACT\n";
out += "============================================================\n";
out += returnFn ? returnFn.text : "NOT_FOUND";
out += "\n";

fs.writeFileSync(outPath, out, "utf8");
