const fs = require("fs");

const serverPath = process.argv[2];
const outPath = process.argv[3];

const src = fs.readFileSync(serverPath, "utf8");
const lines = src.split(/\n/);

function collectRoutesNear(index) {
  const routes = [];
  const start = Math.max(0, index - 25);
  const end = Math.min(lines.length, index + 8);
  const snippet = lines.slice(start, end).join("\n");

  const patterns = [
    /route\s*===\s*["']([^"']+)["']/g,
    /route\s*==\s*["']([^"']+)["']/g,
    /url\.pathname\s*===\s*["']([^"']+)["']/g,
    /pathname\s*===\s*["']([^"']+)["']/g,
    /case\s*["']([^"']+)["']/g
  ];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(snippet))) {
      if (m[1] && m[1].startsWith("/")) routes.push(m[1]);
    }
  }

  return {
    routes: Array.from(new Set(routes)),
    snippet
  };
}

const approveHits = [];
const returnHits = [];

lines.forEach((line, idx) => {
  if (line.includes("approveHumanReviewItem(")) {
    const near = collectRoutesNear(idx);
    approveHits.push({ line: idx + 1, routes: near.routes, snippet: near.snippet });
  }
  if (line.includes("returnHumanReviewItem(")) {
    const near = collectRoutesNear(idx);
    returnHits.push({ line: idx + 1, routes: near.routes, snippet: near.snippet });
  }
});

function chooseRoute(hits, preferWords) {
  const all = [];
  hits.forEach(hit => hit.routes.forEach(route => all.push(route)));
  const unique = Array.from(new Set(all));

  for (const word of preferWords) {
    const hit = unique.find(route => route.toLowerCase().includes(word));
    if (hit) return hit;
  }

  return unique[0] || "";
}

const approveRoute = chooseRoute(approveHits, ["approve", "approved"]);
const returnRoute = chooseRoute(returnHits, ["return", "returned"]);

let out = "";
out += "APPROVE_ROUTE=" + approveRoute + "\n";
out += "RETURN_ROUTE=" + returnRoute + "\n";
out += "APPROVE_HIT_COUNT=" + approveHits.length + "\n";
out += "RETURN_HIT_COUNT=" + returnHits.length + "\n";
out += "\n---- APPROVE HITS ----\n";
approveHits.forEach(hit => {
  out += "LINE=" + hit.line + " ROUTES=" + hit.routes.join(",") + "\n";
  out += hit.snippet + "\n\n";
});
out += "\n---- RETURN HITS ----\n";
returnHits.forEach(hit => {
  out += "LINE=" + hit.line + " ROUTES=" + hit.routes.join(",") + "\n";
  out += hit.snippet + "\n\n";
});

fs.writeFileSync(outPath, out, "utf8");

if (!approveRoute || !returnRoute) process.exit(2);
