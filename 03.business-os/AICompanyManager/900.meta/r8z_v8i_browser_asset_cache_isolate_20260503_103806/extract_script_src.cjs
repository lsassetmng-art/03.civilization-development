const fs = require('fs');
const htmlPath = process.argv[2];
const outPath = process.argv[3];

const html = fs.readFileSync(htmlPath, 'utf8');
const out = [];

const re = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
let m;
while ((m = re.exec(html))) {
  out.push(m[1]);
}

fs.writeFileSync(outPath, out.join('\n') + (out.length ? '\n' : ''));
