import fs from 'node:fs';

const file = process.argv[2];
const out = process.argv[3];
const src = fs.readFileSync(file, 'utf8');
const lines = src.split(/\r?\n/);

const writerPatterns = [
  /res\.json/,
  /response\.json/,
  /sendJson/,
  /jsonResponse/,
  /writeHead/,
  /\.end\(/,
  /JSON\.stringify/
];

const outLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!writerPatterns.some(p => p.test(line))) continue;

  const around = lines.slice(Math.max(0, i - 12), Math.min(lines.length, i + 13)).join('\n');
  if (!/context|review|human|delivery|pmlw|company|owner|selectedCompany/i.test(around)) continue;

  outLines.push('');
  outLines.push(`===== WRITER NEAR L${i + 1} =====`);
  for (let j = Math.max(0, i - 12); j < Math.min(lines.length, i + 13); j++) {
    outLines.push(String(j + 1).padStart(6, ' ') + ': ' + lines[j]);
  }
}

fs.writeFileSync(out, outLines.join('\n') + '\n');
