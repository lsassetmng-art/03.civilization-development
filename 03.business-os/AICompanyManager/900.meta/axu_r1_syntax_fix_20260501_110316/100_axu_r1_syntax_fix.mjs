import fs from 'node:fs';

const file = process.env.CLEAN_CORE;
let core = fs.readFileSync(file, 'utf8');
const before = core;

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

// AXU-R1 patcher accidentally inserted literal "\n" outside JS strings
// in array item joins. Do not globally replace all "\\n"; only fix comma + literal-\n + quoted-array-item patterns.
const patterns = [
  [",\\n      '", ",\n      '"],
  [",\\n        '", ",\n        '"],
  [",\\n          '", ",\n          '"],
  [",\\n            '", ",\n            '"]
];

let replacements = 0;

for (const [from, to] of patterns) {
  const n = countText(core, from);
  if (n > 0) {
    replacements += n;
    core = core.split(from).join(to);
  }
}

// Also repair the exact known header and td cases if indentation differs.
const exactPairs = [
  [
    "'        <th>期限</th>',\\n      '        <th>操作</th>',",
    "'        <th>期限</th>',\n      '        <th>操作</th>',"
  ],
  [
    "'        <td>' + escapeHtml(pmlwValue(row.due_date, \"-\")) + '</td>',\\n          '        <td><button",
    "'        <td>' + escapeHtml(pmlwValue(row.due_date, \"-\")) + '</td>',\n          '        <td><button"
  ]
];

for (const [from, to] of exactPairs) {
  const n = countText(core, from);
  if (n > 0) {
    replacements += n;
    core = core.split(from).join(to);
  }
}

fs.writeFileSync(file, core, 'utf8');

console.log('coreChanged=' + String(core !== before));
console.log('replacementCount=' + String(replacements));
console.log('remainingCommaLiteralNewlineQuotedCount=' + String(
  countText(core, ",\\n      '") +
  countText(core, ",\\n        '") +
  countText(core, ",\\n          '") +
  countText(core, ",\\n            '")
));
console.log('axuR1MarkerCount=' + String(countText(core, 'AICM_AXU_R1_MANAGER_MAJOR_TO_LEADER_V1')));
console.log('leaderHandoffActionCount=' + String(countText(core, 'pmlw-major-leader-handoff')));
console.log('leaderHandoffLabelCount=' + String(countText(core, '課長へ送る')));
console.log('oldDirectRuntimeActionCount=' + String(countText(core, 'pmlw-major-runtime-request')));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
