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
  console.error('Could not safely locate handleApi block.');
  process.exit(1);
}

if (!src.includes('function updateSection') && !src.includes('const updateSection') && !src.includes('updateSection(')) {
  console.error('updateSection is not found. Refuse to add organization route without a known existing update target.');
  process.exit(1);
}

const prefix = src.slice(0, handleStart);
let block = src.slice(handleStart, safeStaticStart);
const suffix = src.slice(safeStaticStart);

const beforeBlock = block;

// ------------------------------------------------------------
// 1. Fix API fallthrough maintainably.
// sendJson followed by bare return; inside handleApi must return true;
// otherwise createServer falls through to serveStatic.
// ------------------------------------------------------------
block = block.replace(
  /(\n[ \t]*sendJson\(res,[^\n]*\);\n)([ \t]*)return;/g,
  '$1$2return true;'
);

// ------------------------------------------------------------
// 2. Add explicit organization/update route.
// 保守性:
// - aliasではなく明示ルートとして置く
// - 内部委譲先をコメントで固定
// - 将来sectionとorganizationの責務が分かれたら、このルートだけ差し替えればよい
// ------------------------------------------------------------
const marker = 'AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE';

if (!block.includes(marker)) {
  const sectionNeedles = [
    '    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {',
    "    if (route === '/api/aicm/v2/section/update' && req.method === 'POST') {",
    '  if (route === "/api/aicm/v2/section/update" && req.method === "POST") {',
    "  if (route === '/api/aicm/v2/section/update' && req.method === 'POST') {"
  ];

  let inserted = false;

  for (const needle of sectionNeedles) {
    const idx = block.indexOf(needle);
    if (idx >= 0) {
      const indent = needle.match(/^\s*/)?.[0] || '    ';
      const routeBlock =
`${indent}// ${marker}
${indent}// UI label "組織変更" is connected to the current section/k課 update responsibility.
${indent}// Keep this as an explicit compatibility route so future split can be handled here.
${indent}if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
${indent}  const body = await readBody(req);
${indent}  sendJson(res, 200, updateSection(body));
${indent}  return true;
${indent}}

`;
      block = block.slice(0, idx) + routeBlock + block.slice(idx);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    console.error('Could not find section/update route insertion point. Refuse broad patch.');
    process.exit(1);
  }
}

src = prefix + block + suffix;

fs.writeFileSync(serverFile, src, 'utf8');

const changed = before !== src;
const returnTrueFixCount =
  (beforeBlock.match(/\n[ \t]*sendJson\(res,[^\n]*\);\n[ \t]*return;/g) || []).length;

const remainingBareReturnCount =
  (block.match(/\n[ \t]*sendJson\(res,[^\n]*\);\n[ \t]*return;/g) || []).length;

const organizationRouteCount =
  (src.match(/\/api\/aicm\/v2\/organization\/update/g) || []).length;

const markerCount =
  (src.match(new RegExp(marker, 'g')) || []).length;

console.log(`changed=${changed}`);
console.log(`returnTrueFixCandidateCount=${returnTrueFixCount}`);
console.log(`remainingBareReturnCount=${remainingBareReturnCount}`);
console.log(`organizationRouteCount=${organizationRouteCount}`);
console.log(`markerCount=${markerCount}`);
