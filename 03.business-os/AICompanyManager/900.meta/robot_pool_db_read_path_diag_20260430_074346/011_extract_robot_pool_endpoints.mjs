import fs from "node:fs";
import path from "node:path";

const appRoot = process.argv[2];
const out = process.argv[3];

const roots = [
  path.join(appRoot, "assets/js"),
  path.join(appRoot, "server"),
  path.resolve(appRoot, "../_aiworker/assets/js")
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "900.meta") continue;
      walk(p, files);
    } else if (/\.(js|mjs|html)$/i.test(ent.name)) {
      files.push(p);
    }
  }
  return files;
}

const endpointSet = new Set();
const hitLines = [];

for (const root of roots) {
  for (const file of walk(root)) {
    let src = "";
    try { src = fs.readFileSync(file, "utf8"); } catch { continue; }
    const rel = path.relative(appRoot, file);
    const lines = src.split(/\n/);

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      const apiMatches = line.match(/["'`]([^"'`]*\/api\/[^"'`]*)["'`]/g) || [];
      for (const raw of apiMatches) {
        const ep = raw.slice(1, -1);
        if (/robot|pool|selector|aiworker|company/i.test(ep)) {
          endpointSet.add(ep);
          hitLines.push(`${rel}:${i + 1}: ${line.trim()}`);
        }
      }

      const fetchMatch = line.match(/fetch\s*\(\s*["'`]([^"'`]+)["'`]/);
      if (fetchMatch && /robot|pool|selector|aiworker|company/i.test(fetchMatch[1])) {
        endpointSet.add(fetchMatch[1]);
        hitLines.push(`${rel}:${i + 1}: ${line.trim()}`);
      }
    }
  }
}

const fallback = [
  "/api/aicm/businessos/robot-pool",
  "/api/businessos/robot-pool",
  "/api/aicm/robot-pool",
  "/api/robot-pool",
  "/api/aicm/company-robot-selector-options",
  "/api/company-robot-selector-options",
  "/api/businessos/company-robot-selector-options",
  "/api/aicm/aiworker/robot-pool",
  "/api/aiworker/robot-pool"
];

for (const ep of fallback) endpointSet.add(ep);

const endpoints = Array.from(endpointSet).filter(Boolean).sort();

fs.writeFileSync(out, endpoints.join("\n") + "\n");
fs.writeFileSync(out.replace(/\.txt$/, "_hits.txt"), hitLines.join("\n") + "\n");
