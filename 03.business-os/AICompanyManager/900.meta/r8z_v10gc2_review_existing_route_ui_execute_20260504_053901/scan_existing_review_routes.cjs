const fs = require("fs");

const serverPath = process.argv[2];
const outPath = process.argv[3];

const src = fs.readFileSync(serverPath, "utf8");
const lines = src.split(/\n/);

function windowAround(hit) {
  const start = Math.max(0, hit - 12);
  const end = Math.min(lines.length, hit + 8);
  return lines.slice(start, end).join("\n");
}

function extractRoute(snippet) {
  const patterns = [
    /route\s*===\s*["']([^"']+)["']/g,
    /route\s*!==\s*["']([^"']+)["']/g,
    /url\.pathname\s*===\s*["']([^"']+)["']/g,
    /pathname\s*===\s*["']([^"']+)["']/g,
    /case\s*["']([^"']+)["']/g
  ];

  const found = [];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(snippet))) {
      if (m[1] && m[1].startsWith("/")) found.push(m[1]);
    }
  }

  return Array.from(new Set(found));
}

let approve = [];
let ret = [];
let scan = [];

lines.forEach((line, idx) => {
  if (line.includes("approveHumanReviewItem(body)") || line.includes("approveHumanReviewItem(await readBody(req))")) {
    const snip = windowAround(idx);
    const routes = extractRoute(snip);
    approve.push(...routes);
    scan.push("---- approve hit line " + (idx + 1) + " ----\n" + snip);
  }

  if (line.includes("returnHumanReviewItem(body)") || line.includes("returnHumanReviewItem(await readBody(req))")) {
    const snip = windowAround(idx);
    const routes = extractRoute(snip);
    ret.push(...routes);
    scan.push("---- return hit line " + (idx + 1) + " ----\n" + snip);
  }
});

approve = Array.from(new Set(approve));
ret = Array.from(new Set(ret));

let text = "";
text += "APPROVE_ROUTES=" + approve.join(",") + "\n";
text += "RETURN_ROUTES=" + ret.join(",") + "\n";
text += "APPROVE_ROUTE_COUNT=" + approve.length + "\n";
text += "RETURN_ROUTE_COUNT=" + ret.length + "\n";
text += "\n" + scan.join("\n\n") + "\n";

fs.writeFileSync(outPath, text, "utf8");

if (approve.length < 1 || ret.length < 1) {
  process.exit(2);
}
