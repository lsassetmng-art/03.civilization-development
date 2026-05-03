import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
if (!serverFile) {
  console.error('SERVER_FILE env missing');
  process.exit(1);
}

let src = fs.readFileSync(serverFile, 'utf8');
const before = src;

const handleStart = src.indexOf('async function handleApi');
const safeStaticStart = src.indexOf('function safeStaticPath');

if (handleStart < 0 || safeStaticStart < 0 || safeStaticStart <= handleStart) {
  console.error('Could not locate handleApi block safely.');
  process.exit(1);
}

const prefix = src.slice(0, handleStart);
let block = src.slice(handleStart, safeStaticStart);
const suffix = src.slice(safeStaticStart);

const beforeBlock = block;

// Only fix the maintainability issue inside handleApi:
// a sendJson() response followed by bare return; must return true;
// so createServer does not fall through to serveStatic().
block = block.replace(
  /(\n[ \t]*sendJson\(res,[^\n]*\);\n)([ \t]*)return;/g,
  '$1$2return true;'
);

src = prefix + block + suffix;

const changed = before !== src;
const changedBlock = beforeBlock !== block;

fs.writeFileSync(serverFile, src, 'utf8');

const replacementCount =
  (beforeBlock.match(/\n[ \t]*sendJson\(res,[^\n]*\);\n[ \t]*return;/g) || []).length;

const remainingBadCount =
  (block.match(/\n[ \t]*sendJson\(res,[^\n]*\);\n[ \t]*return;/g) || []).length;

console.log(`changed=${changed}`);
console.log(`changedBlock=${changedBlock}`);
console.log(`replacementCount=${replacementCount}`);
console.log(`remainingBadCount=${remainingBadCount}`);
