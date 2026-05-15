const fs = require("fs");

const sqlPath = process.argv[2];
const outJsonPath = process.argv[3];

const src = fs.readFileSync(sqlPath, "utf8");
const values = new Set();

const patterns = [
  /'([^']+)'\s+as\s+"?package_code"?/gi,
  /"package_code"\s*\)\s*select[\s\S]*?'([^']+)'\s+as\s+"?package_code"?/gi
];

for (const pattern of patterns) {
  let m;
  while ((m = pattern.exec(src)) !== null) {
    if (m[1]) values.add(m[1]);
  }
}

fs.writeFileSync(outJsonPath, JSON.stringify({ package_codes: Array.from(values).sort() }, null, 2));
