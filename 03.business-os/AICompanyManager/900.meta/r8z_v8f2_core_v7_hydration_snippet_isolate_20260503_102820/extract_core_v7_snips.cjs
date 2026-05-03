const fs = require('fs');

const corePath = process.argv[2];
const outV7 = process.argv[3];
const outRows = process.argv[4];

const src = fs.readFileSync(corePath, 'utf8');
const lines = src.split(/\r?\n/);

function writeWindowAround(patterns, out, before, after) {
  const hitSet = new Set();

  for (let i = 0; i < lines.length; i++) {
    if (patterns.some(p => p.test(lines[i]))) {
      for (let j = Math.max(0, i - before); j <= Math.min(lines.length - 1, i + after); j++) {
        hitSet.add(j);
      }
    }
  }

  const sorted = [...hitSet].sort((a,b) => a-b);
  const outLines = [];
  let prev = -99;

  for (const n of sorted) {
    if (prev !== -99 && n !== prev + 1) outLines.push('');
    outLines.push(String(n + 1).padStart(6, ' ') + ': ' + lines[n]);
    prev = n;
  }

  fs.writeFileSync(out, outLines.join('\n') + '\n');
}

writeWindowAround([
  /aicmR8zV7RenderReviewList/,
  /function hydrateIfNeeded/,
  /aicmR8zV7Hydrating/,
  /r8z_v7_/,
  /review_wait_items/,
  /rows\(appState\)/,
  /appState\.context/,
  /appState\.review_wait_items/,
  /aicmR8zV7HydrationError/,
  /window\.aicmRender/,
  /render\(\)/
], outV7, 28, 52);

writeWindowAround([
  /function aicmHumanReviewRows/,
  /function r8zV5dNormalizeContext/,
  /function rows\(/,
  /ctx\.review_wait_items/,
  /state\.review_wait_items/,
  /appState\.review_wait_items/,
  /human_review_wait_items/,
  /reviewWaitItems/,
  /review_wait_items/
], outRows, 18, 38);
