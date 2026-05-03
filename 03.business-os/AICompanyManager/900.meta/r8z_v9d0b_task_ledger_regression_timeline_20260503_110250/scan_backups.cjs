const fs = require("fs");
const path = require("path");

const listPath = process.argv[2];
const outPath = process.argv[3];

const files = fs.existsSync(listPath)
  ? fs.readFileSync(listPath, "utf8").split(/\r?\n/).filter(Boolean)
  : [];

const rows = [];

for (const file of files) {
  let text = "";
  try { text = fs.readFileSync(file, "utf8"); } catch (_) { continue; }

  const refCount = (text.match(/isPendingMajor/g) || []).length;
  const defCount = (text.match(/function\s+isPendingMajor\s*\(/g) || []).length;

  if (refCount > 0 || defCount > 0) {
    const stat = fs.statSync(file);
    const lines = text.split(/\r?\n/);
    const hitLines = [];
    lines.forEach((line, idx) => {
      if (line.includes("isPendingMajor")) hitLines.push(`${idx + 1}:${line.trim()}`);
    });

    rows.push({
      mtimeMs: stat.mtimeMs,
      mtime: stat.mtime.toISOString(),
      file,
      refCount,
      defCount,
      hitLines: hitLines.slice(0, 12)
    });
  }
}

rows.sort((a,b) => a.mtimeMs - b.mtimeMs);

const out = [];
out.push(`HIT_FILE_COUNT=${rows.length}`);

for (const r of rows) {
  out.push("");
  out.push(`FILE=${r.file}`);
  out.push(`MTIME=${r.mtime}`);
  out.push(`REF_COUNT=${r.refCount}`);
  out.push(`DEF_COUNT=${r.defCount}`);
  for (const h of r.hitLines) out.push(`  ${h}`);
}

fs.writeFileSync(outPath, out.join("\n") + "\n");
