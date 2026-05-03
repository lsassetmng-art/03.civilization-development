const fs = require("fs");

const file = process.argv[2];
const src = fs.readFileSync(file, "utf8");

const lines = src.split(/\n/);
let removed = 0;

const next = lines.filter((line) => {
  if (/^\s*async\s*$/.test(line)) {
    removed++;
    return false;
  }
  return true;
}).join("\n");

fs.writeFileSync(file, next);

const after = (next.match(/^\s*async\s*$/gm) || []).length;

console.log(JSON.stringify({
  changed: removed > 0,
  removed,
  after
}));
