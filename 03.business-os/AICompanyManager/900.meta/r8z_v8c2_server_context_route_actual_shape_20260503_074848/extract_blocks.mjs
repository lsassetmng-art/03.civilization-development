import fs from 'node:fs';

const file = process.argv[2];
const out = process.argv[3];
const src = fs.readFileSync(file, 'utf8');

const targets = [
  '/api/aicm/v2/context',
  'api/aicm/v2/context',
  'v2/context',
  'review_wait_items',
  'human_review',
  'delivery_summary'
];

function lineOf(pos) {
  return src.slice(0, pos).split(/\r?\n/).length;
}

function findBlockAround(pos) {
  let start = Math.max(0, pos - 4000);
  let end = Math.min(src.length, pos + 6000);

  const before = src.slice(start, pos);
  const candidates = [
    before.lastIndexOf('async function '),
    before.lastIndexOf('function '),
    before.lastIndexOf('app.get'),
    before.lastIndexOf('app.all'),
    before.lastIndexOf('if ('),
    before.lastIndexOf('if('),
    before.lastIndexOf('case '),
    before.lastIndexOf('switch'),
    before.lastIndexOf('createServer'),
  ].filter(x => x >= 0);

  if (candidates.length) {
    start = start + Math.max(...candidates);
  }

  const block = src.slice(start, end);
  return {
    start,
    end,
    startLine: lineOf(start),
    endLine: lineOf(end),
    block
  };
}

const blocks = [];
const seen = new Set();

for (const target of targets) {
  let pos = -1;
  while ((pos = src.indexOf(target, pos + 1)) >= 0) {
    const b = findBlockAround(pos);
    const key = `${b.start}:${b.end}`;
    if (seen.has(key)) continue;
    seen.add(key);
    blocks.push({ target, ...b });
  }
}

const outLines = [];

blocks.forEach((b, idx) => {
  outLines.push('');
  outLines.push(`===== BLOCK ${idx + 1}: target=${b.target} L${b.startLine}-L${b.endLine} =====`);
  const lines = b.block.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    outLines.push(String(b.startLine + i).padStart(6, ' ') + ': ' + lines[i]);
  }
});

fs.writeFileSync(out, outLines.join('\n') + '\n');
