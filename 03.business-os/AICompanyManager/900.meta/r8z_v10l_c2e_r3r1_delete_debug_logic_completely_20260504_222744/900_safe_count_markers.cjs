const fs = require("fs");
const [,, file, needle] = process.argv;
const text = fs.readFileSync(file, "utf8");
let count = 0;
let from = 0;
while (true) {
  const idx = text.indexOf(needle, from);
  if (idx < 0) break;
  count++;
  from = idx + needle.length;
}
process.stdout.write(String(count));
