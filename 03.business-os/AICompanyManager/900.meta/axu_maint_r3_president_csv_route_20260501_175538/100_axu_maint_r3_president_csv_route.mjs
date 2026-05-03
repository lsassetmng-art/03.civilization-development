import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let core = fs.readFileSync(coreFile, 'utf8');
const before = core;

const marker = 'AICM_AXU_MAINT_R3_PRESIDENT_CSV_ROUTE_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionStart(src, name) {
  const targets = [
    'function ' + name + '(',
    'function ' + name + ' (',
    'async function ' + name + '(',
    'async function ' + name + ' ('
  ];
  let best = -1;
  for (const t of targets) {
    const i = src.indexOf(t);
    if (i >= 0 && (best < 0 || i < best)) best = i;
  }
  return best;
}

function findFunctionRange(src, name) {
  const start = findFunctionStart(src, name);
  if (start < 0) return null;

  const open = src.indexOf('{', start);
  if (open < 0) return null;

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;

    if (depth === 0) {
      return { start, end: i + 1, text: src.slice(start, i + 1) };
    }
  }

  return null;
}

function insertBeforeFunction(name, text) {
  const range = findFunctionRange(core, name);
  if (!range) {
    console.error('function not found: ' + name);
    process.exit(1);
  }
  core = core.slice(0, range.start) + text + '\n\n' + core.slice(range.start);
}

function replaceFunction(name, replacement) {
  const range = findFunctionRange(core, name);
  if (!range) {
    console.error('function not found: ' + name);
    process.exit(1);
  }
  core = core.slice(0, range.start) + replacement + core.slice(range.end);
}

/*
 * 1. Add President-start route screen.
 * This screen is UI-only now. It documents the canonical route:
 * Dashboard -> President -> Manager/部長 -> 大項目 -> 課長 -> Worker.
 */
if (!core.includes('function renderAicmBusinessStartScreen()')) {
  insertBeforeFunction('render', [
    '// ' + marker,
    'function renderAicmBusinessStartScreen() {',
    '    var company = null;',
    '    if (typeof selectedCompany === "function") company = selectedCompany();',
    '    if (!company && typeof aicmOrgSelectedCompany === "function") company = aicmOrgSelectedCompany();',
    '',
    '    return renderShell([',
    '      \'<section class="aicm-core-card">\',',
    '      \'  <p class="aicm-eyebrow">AI企業業務開始</p>\',',
    '      \'  <h2>President起点で業務を開始</h2>\',',
    '      company ? \'  <p class="aicm-selected-note">対象会社: <strong>\' + escapeHtml(company.company_name || "") + \'</strong></p>\' : \'  <p class="aicm-core-empty">AI企業を選択してください。</p>\',',
    '      \'  <p class="aicm-selected-note">Presidentが会社方針・事業方針から業務を送り、Manager/部長が大項目へ分解し、課長へ引き継ぎます。</p>\',',
    '      \'</section>\',',
    '      \'<section class="aicm-core-card">\',',
    '      \'  <p class="aicm-eyebrow">正本ルート</p>\',',
    '      \'  <h2>業務開始ルート</h2>\',',
    '      \'  <div class="aicm-confirm-row"><strong>1. President</strong><p>会社方針・事業方針から業務を送ります。</p></div>\',',
    '      \'  <div class="aicm-confirm-row"><strong>2. Manager/部長</strong><p>受け取った業務を大項目レベルへ分解します。</p></div>\',',
    '      \'  <div class="aicm-confirm-row"><strong>3. 課長</strong><p>大項目を受け取り、中項目・作業単位へ分解します。</p></div>\',',
    '      \'  <div class="aicm-confirm-row"><strong>4. Worker</strong><p>作業単位を実行し、成果物を作成します。</p></div>\',',
    '      \'</section>\',',
    '      \'<section class="aicm-core-card">\',',
    '      \'  <p class="aicm-eyebrow">CSV代替ルート</p>\',',
    '      \'  <h2>部長分解済み大項目の取り込み</h2>\',',
    '      \'  <p class="aicm-selected-note">CSVは、Manager/部長による大項目分解結果を代替入力するルートです。CSV取り込み後、登録済み大項目から課長へ引き継ぎます。</p>\',',
    '      \'</section>\',',
    '      \'<section class="aicm-core-card aicm-operation-card">\',',
    '      \'  <p class="aicm-eyebrow">操作</p>\',',
    '      \'  <div class="aicm-dashboard-action-row">\',',
    '      \'    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳へ</button>\',',
    '      \'    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>\',',
    '      \'  </div>\',',
    '      \'</section>\'',
    '    ].join(""));',
    '  }',
    '',
    'function renderAicmBusinessStartDashboardCard() {',
    '    var company = null;',
    '    if (typeof selectedCompany === "function") company = selectedCompany();',
    '    if (!company && typeof aicmOrgSelectedCompany === "function") company = aicmOrgSelectedCompany();',
    '',
    '    return [',
    '      \'<section class="aicm-core-card aicm-operation-card">\',',
    '      \'  <p class="aicm-eyebrow">AI企業業務開始</p>\',',
    '      \'  <h2>President起点で業務を開始</h2>\',',
    '      company ? \'  <p class="aicm-selected-note">対象会社: <strong>\' + escapeHtml(company.company_name || "") + \'</strong></p>\' : \'  <p class="aicm-core-empty">AI企業を選択してください。</p>\',',
    '      \'  <p class="aicm-selected-note">Presidentが業務を送り、Manager/部長が大項目へ分解し、課長へ引き継ぐ正本ルートです。</p>\',',
    '      \'  <div class="aicm-dashboard-action-row">\',',
    '      \'    <button type="button" data-core-action="go" data-screen="ai-business-start">AI企業業務開始</button>\',',
    '      \'  </div>\',',
    '      \'</section>\'',
    '    ].join("");',
    '  }'
  ].join('\n'));
}

/*
 * 2. Add render route for ai-business-start.
 */
{
  const range = findFunctionRange(core, 'render');
  if (!range) {
    console.error('render function range not found');
    process.exit(1);
  }

  let fn = range.text;

  if (!fn.includes('state.screen === "ai-business-start"')) {
    const branch = [
      '    } else if (state.screen === "ai-business-start") {',
      '      html = renderAicmBusinessStartScreen();',
      ''
    ].join('\n');

    const anchors = [
      '    } else if (state.screen === "task-ledger") {',
      '  } else if (state.screen === "task-ledger") {',
      '    } else if (state.screen === "review-list") {',
      '  } else if (state.screen === "review-list") {',
      '    } else {',
      '  } else {'
    ];

    let patched = false;
    for (const anchor of anchors) {
      if (fn.includes(anchor)) {
        fn = fn.replace(anchor, branch + anchor);
        patched = true;
        break;
      }
    }

    if (!patched) {
      console.error('render branch anchor not found');
      process.exit(1);
    }

    core = core.slice(0, range.start) + fn + core.slice(range.end);
  }
}

/*
 * 3. Add dashboard card by wrapping renderCompanyOverview once.
 * This is a narrow wrapper around the company overview dashboard area.
 * It does not touch click routing and does not change business logic.
 */
if (!core.includes('function renderCompanyOverviewBaseAxuMaintR3()')) {
  const range = findFunctionRange(core, 'renderCompanyOverview');
  if (!range) {
    console.error('renderCompanyOverview not found');
    process.exit(1);
  }

  const baseText = range.text.replace(
    /function\s+renderCompanyOverview\s*\(\s*\)/,
    'function renderCompanyOverviewBaseAxuMaintR3()'
  );

  const wrapper = [
    baseText,
    '',
    'function renderCompanyOverview() {',
    '    return renderCompanyOverviewBaseAxuMaintR3() + renderAicmBusinessStartDashboardCard();',
    '  }'
  ].join('\n');

  core = core.slice(0, range.start) + wrapper + core.slice(range.end);
}

/*
 * 4. CSV wording: CSV is not a request to Manager.
 * It is a substitute input for Manager/部長 decomposed major rows.
 */
core = core.split('部門別タスク台帳の大項目CSVをChatGPTで作成します。')
  .join('部長/Managerが分解した大項目CSVをChatGPTで作成します。');

core = core.split('読み込んだCSVを部門別タスク台帳へ登録します。')
  .join('部長/Manager分解済みの大項目CSVを部門別タスク台帳へ登録します。');

core = core.split('以下のCSVカラムで、AICompanyManagerの部門別タスク台帳に取り込むManager大項目行を作成してください。')
  .join('以下のCSVカラムで、部長/Managerが大項目へ分解済みの行を作成してください。');

core = core.split('major_item_name はManagerがLeaderへ渡す大項目名')
  .join('major_item_name は部長/Managerが課長へ渡す大項目名');

/*
 * 5. Empty state wording.
 * Do not show 課長へ送る without rows.
 * Do not show Manager依頼.
 */
core = core.split('Manager大項目はまだありません')
  .join('登録済み大項目はまだありません');

core = core.split('President方針またはユーザー依頼からManagerが大項目を作ると、ここに表示されます。')
  .join('President起点でAI企業業務を開始するか、CSVで部長/Manager分解済みの大項目を取り込むと、ここに表示されます。');

/*
 * 6. Guard against wrong wording introduced by mistake.
 */
fs.writeFileSync(coreFile, core, 'utf8');

console.log('coreChanged=' + String(core !== before));
console.log('markerCount=' + String(countText(core, marker)));
console.log('businessStartScreenCount=' + String(countText(core, 'function renderAicmBusinessStartScreen()')));
console.log('businessStartCardCount=' + String(countText(core, 'function renderAicmBusinessStartDashboardCard()')));
console.log('businessStartRouteCount=' + String(countText(core, 'state.screen === "ai-business-start"')));
console.log('businessStartButtonCount=' + String(countText(core, 'AI企業業務開始')));
console.log('companyOverviewBaseCount=' + String(countText(core, 'function renderCompanyOverviewBaseAxuMaintR3()')));
console.log('companyOverviewWrapperCount=' + String(countText(core, 'function renderCompanyOverview()')));
console.log('csvSubstituteTextCount=' + String(countText(core, '部長/Manager分解済み')));
console.log('presidentRouteTextCount=' + String(countText(core, 'President起点')));
console.log('wrongManagerRequestTextCount=' + String(countText(core, 'Managerに大項目作成依頼') + countText(core, 'Managerに依頼') + countText(core, '部長に依頼')));
console.log('taskLedgerRouteCount=' + String(countText(core, 'state.screen === "task-ledger"')));
console.log('leaderHandoffButtonCount=' + String(countText(core, 'pmlw-major-leader-handoff')));
console.log('broadClickMarkerCount=' + String(countText(core, 'AICM_AXU_R1D_BROAD_CLICK_TARGET')));
console.log('textNavMarkerCount=' + String(countText(core, 'AICM_AXU_R1D_TASK_LEDGER_TEXT_NAV')));
console.log('badLiteralNewlineCount=' + String(
  countText(core, ",\\n      '") +
  countText(core, ",\\n        '") +
  countText(core, ",\\n          '") +
  countText(core, ",\\n            '")
));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
