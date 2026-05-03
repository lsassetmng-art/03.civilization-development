import fs from 'node:fs';

const corePath = process.argv[2];
const serverPath = process.argv[3];
const outDir = process.argv[4];

const core = fs.readFileSync(corePath, 'utf8');
const server = fs.readFileSync(serverPath, 'utf8');

function unique(arr) {
  return Array.from(new Set(arr)).sort();
}

function lineOf(text, idx) {
  return text.slice(0, idx).split('\n').length;
}

function matches(text, re) {
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({
      line: lineOf(text, m.index),
      match: m[0]
    });
  }
  return out;
}

function snippet(text, idx, before = 8, after = 12) {
  const lines = text.split('\n');
  const line = lineOf(text, idx);
  const start = Math.max(1, line - before);
  const end = Math.min(lines.length, line + after);
  const body = [];
  for (let i = start; i <= end; i++) {
    body.push(String(i).padStart(6, ' ') + ': ' + lines[i - 1]);
  }
  return body.join('\n');
}

const actionValues = unique([
  ...Array.from(core.matchAll(/data-core-action=["']([^"']+)["']/g)).map(m => m[1]),
  ...Array.from(core.matchAll(/case\s+["']([^"']+)["']\s*:/g)).map(m => m[1]).filter(v => v.includes('task') || v.includes('major') || v.includes('delete') || v.includes('csv') || v.includes('ledger'))
]);

const functions = matches(core, /\bfunction\s+[A-Za-z0-9_$]+\s*\([^)]*\)\s*\{/g)
  .filter(x => /TaskLedger|Major|Csv|CSV|Prompt|Reload|Context|Delete|Confirm|Page|render/i.test(x.match));

const coreNeedles = [
  'function aicmRenderManagerMajorRows',
  'function renderTaskLedgerPlaceholder',
  'function aicmReloadTaskLedgerContext',
  'task-ledger-refresh',
  '登録済み大項目',
  'Manager大項目',
  'ChatGPT',
  'CSV作成',
  'プロンプト',
  'delete',
  '削除'
];

const coreSnippets = [];
for (const needle of coreNeedles) {
  let start = 0;
  let foundCount = 0;
  while (true) {
    const idx = core.indexOf(needle, start);
    if (idx < 0) break;
    foundCount++;
    if (foundCount <= 5) {
      coreSnippets.push('\n===== CORE SNIPPET: ' + needle + ' @ line ' + lineOf(core, idx) + ' =====\n' + snippet(core, idx));
    }
    start = idx + needle.length;
  }
}

const serverNeedles = [
  'pmlw_major',
  'manager_major',
  'major_items',
  'task-ledger',
  'csv',
  'delete',
  'DELETE',
  'POST',
  'url.pathname'
];

const serverSnippets = [];
for (const needle of serverNeedles) {
  let start = 0;
  let foundCount = 0;
  while (true) {
    const idx = server.indexOf(needle, start);
    if (idx < 0) break;
    foundCount++;
    if (foundCount <= 6) {
      serverSnippets.push('\n===== SERVER SNIPPET: ' + needle + ' @ line ' + lineOf(server, idx) + ' =====\n' + snippet(server, idx));
    }
    start = idx + needle.length;
  }
}

const promptSnippets = [];
for (const needle of ['ChatGPT', 'CSV作成', 'プロンプト', 'department_name', 'major_item_name', 'major_item_description']) {
  let start = 0;
  let foundCount = 0;
  while (true) {
    const idx = core.indexOf(needle, start);
    if (idx < 0) break;
    foundCount++;
    if (foundCount <= 8) {
      promptSnippets.push('\n===== PROMPT/Csv SNIPPET: ' + needle + ' @ line ' + lineOf(core, idx) + ' =====\n' + snippet(core, idx, 10, 18));
    }
    start = idx + needle.length;
  }
}

fs.writeFileSync(outDir + '/040_action_scan.txt',
  [
    '# data-core-action / relevant case values',
    '',
    ...actionValues.map(v => '- ' + v)
  ].join('\n'),
  'utf8'
);

fs.writeFileSync(outDir + '/060_function_scan.txt',
  [
    '# relevant functions',
    '',
    ...functions.map(x => '- L' + x.line + ': ' + x.match.replace(/\s+/g, ' '))
  ].join('\n'),
  'utf8'
);

fs.writeFileSync(outDir + '/070_core_snippets.txt', coreSnippets.join('\n'), 'utf8');
fs.writeFileSync(outDir + '/080_server_snippets.txt', serverSnippets.join('\n'), 'utf8');
fs.writeFileSync(outDir + '/090_prompt_snippets.txt', promptSnippets.join('\n'), 'utf8');

const summary = {
  actionCount: actionValues.length,
  relevantFunctionCount: functions.length,
  coreSnippetCount: coreSnippets.length,
  serverSnippetCount: serverSnippets.length,
  promptSnippetCount: promptSnippets.length,
  hasRenderManagerMajorRows: core.includes('aicmRenderManagerMajorRows'),
  hasTaskLedgerRefreshAction: core.includes('task-ledger-refresh'),
  hasR8MMarker: core.includes('AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  hasR8LMarker: core.includes('AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  hasVisibleDebugTitle: core.includes('表示診断ログ'),
  hasDebugCard: core.includes('aicm-debug-card'),
  hasDeleteCandidateInCore: /delete|削除/i.test(core),
  hasDeleteCandidateInServer: /delete|DELETE|削除/i.test(server),
  hasPromptCandidate: /ChatGPT|CSV作成|プロンプト/.test(core)
};

fs.writeFileSync(outDir + '/095_prescan_summary.json', JSON.stringify(summary, null, 2), 'utf8');

console.log(JSON.stringify(summary, null, 2));
