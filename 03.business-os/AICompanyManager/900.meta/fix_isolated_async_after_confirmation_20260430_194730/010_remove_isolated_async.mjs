import fs from "node:fs";

const file = process.argv[2];
const before = fs.readFileSync(file, "utf8");

const lines = before.split(/\n/);
let removed = 0;
const kept = [];

for (const line of lines) {
  if (/^\s*async\s*$/.test(line)) {
    removed++;
    continue;
  }
  kept.push(line);
}

if (removed === 0) {
  console.log(JSON.stringify({ changed: false, removed }));
  process.exit(0);
}

const after = kept.join("\n");
fs.writeFileSync(file, after);

console.log(JSON.stringify({ changed: true, removed }));
