import fs from 'node:fs';

const file = process.argv[2];
const out = process.argv[3];
const src = fs.readFileSync(file, 'utf8');
const lines = src.split(/\r?\n/);

const patterns = [
  /\/api\/aicm\/v2\/context/,
  /api\/aicm\/v2\/context/,
  /v2\/context/,
  /review_wait_items/,
  /human_review/,
  /delivery_summary/,
  /pmlw_worker/,
  /selectedCompanyId/,
  /company_id/,
  /owner_id/
];

const hitLines = new Set();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (patterns.some(p => p.test(line))) {
    for (let j = Math.max(0, i - 35); j <= Math.min(lines.length - 1, i + 45); j++) {
      hitLines.add(j);
    }
  }
}

const sorted = [...hitLines].sort((a,b) => a-b);
const chunks = [];
let current = [];

for (const n of sorted) {
  if (current.length === 0 || n === current[current.length - 1] + 1) {
    current.push(n);
  } else {
    chunks.push(current);
    current = [n];
  }
}
if (current.length) chunks.push(current);

const outLines = [];

chunks.forEach((chunk, idx) => {
  outLines.push('');
  outLines.push(`===== SNIPPET ${idx + 1}: L${chunk[0] + 1}-L${chunk[chunk.length - 1] + 1} =====`);
  for (const n of chunk) {
    outLines.push(String(n + 1).padStart(6, ' ') + ': ' + lines[n]);
  }
});

fs.writeFileSync(out, outLines.join('\n') + '\n');
