import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let core = fs.readFileSync(coreFile, 'utf8');
const beforeCore = core;

const marker = 'AICM_AXU_R1B_LEADER_HANDOFF_BUTTON_VISIBLE_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionStart(src, name) {
  const patterns = [
    'function ' + name + '(',
    'function ' + name + ' (',
    'async function ' + name + '(',
    'async function ' + name + ' ('
  ];
  let best = -1;
  for (const p of patterns) {
    const i = src.indexOf(p);
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

function insertBefore(anchor, text) {
  const idx = core.indexOf(anchor);
  if (idx < 0) {
    console.error('anchor not found: ' + anchor);
    process.exit(1);
  }
  core = core.slice(0, idx) + text + '\n\n' + core.slice(idx);
}

function replaceFunction(name, newText) {
  const range = findFunctionRange(core, name);
  if (!range) {
    console.error('function not found: ' + name);
    process.exit(1);
  }
  core = core.slice(0, range.start) + newText + core.slice(range.end);
}

/*
 * 1. Minimal helpers if AXU-R1 helper is absent.
 */
if (!core.includes('function aicmAxuR1OpenLeaderHandoffConfirm')) {
  const helper = `
// ${marker}
// Minimal Manager大項目 -> 課長/Leader handoff helper.
// This does not create Worker Runtime request.
function aicmAxuR1Text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

function aicmAxuR1OwnerId() {
    if (state && state.ownerCivilizationId) return aicmAxuR1Text(state.ownerCivilizationId);
    if (state && state.context && state.context.owner_civilization_id) return aicmAxuR1Text(state.context.owner_civilization_id);
    return "00000000-0000-4000-8000-000000000001";
  }

function aicmAxuR1MajorId(row) {
    row = row || {};
    return aicmAxuR1Text(row.aicm_manager_major_work_item_id || row.manager_major_work_item_id || row.major_work_item_id || row.id);
  }

function aicmAxuR1FindMajorById(majorId) {
    var rows = state && state.context && Array.isArray(state.context.pmlw_major_items) ? state.context.pmlw_major_items : [];
    var id = aicmAxuR1Text(majorId);
    for (var i = 0; i < rows.length; i += 1) {
      if (aicmAxuR1MajorId(rows[i]) === id) return rows[i];
    }
    return null;
  }

function aicmAxuR1LeaderLabel(row) {
    row = row || {};
    return aicmAxuR1Text(row.assigned_leader_label || row.leader_label || "Leader");
  }

function aicmAxuR1BuildLeaderHandoffPayload(row) {
    row = row || {};
    var majorId = aicmAxuR1MajorId(row);
    if (!majorId) throw new Error("Manager大項目IDを特定できません。");
    return {
      kind: "manager-major-leader-handoff",
      title: "課長へ送る確認",
      endpoint: "/api/aicm/v2/manager-major/update",
      backScreen: "task-ledger",
      body: {
        owner_civilization_id: aicmAxuR1OwnerId(),
        aicm_manager_major_work_item_id: majorId,
        assigned_leader_label: aicmAxuR1LeaderLabel(row),
        decomposition_status_code: "assigned_to_leader",
        handoff_status_code: "handed_off",
        note: aicmAxuR1Text(row.note)
      }
    };
  }

function aicmAxuR1ShowLeaderHandoffConfirm(payload) {
    if (typeof aicmAvdShowDbConfirm === "function") {
      aicmAvdShowDbConfirm(payload);
      return;
    }
    if (typeof aicmOrgShowUpdateConfirm === "function") {
      aicmOrgShowUpdateConfirm(payload);
      return;
    }
    state.pendingOrgUpdate = payload;
    if (typeof render === "function") render();
  }

function aicmAxuR1OpenLeaderHandoffConfirm(button) {
    try {
      var majorId = button && button.getAttribute ? button.getAttribute("data-pmlw-major-id") : "";
      var row = aicmAxuR1FindMajorById(majorId);
      if (!row) throw new Error("Manager大項目を特定できません。");
      aicmAxuR1ShowLeaderHandoffConfirm(aicmAxuR1BuildLeaderHandoffPayload(row));
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "課長への引渡し確認を表示できません。");
      if (typeof render === "function") render();
    }
  }
`;
  insertBefore('function renderPmlwMajorRows', helper);
}

/*
 * 2. Add standalone visible panel helper.
 * It appears only when the base table HTML does not already contain the handoff button.
 */
if (!core.includes('function aicmAxuR1BLeaderHandoffStandalonePanel')) {
  const panel = `
// ${marker}
// 保険表示: テーブル内ボタンが出ない場合でも、Manager大項目ごとの「課長へ送る」を出す。
function aicmAxuR1BLeaderHandoffStandalonePanel() {
    var rows = state && state.context && Array.isArray(state.context.pmlw_major_items)
      ? state.context.pmlw_major_items
      : [];

    if (!rows.length) return "";

    return [
      '<section class="aicm-core-card aicm-axu-r1b-leader-handoff-panel">',
      '  <p class="aicm-eyebrow">Manager大項目</p>',
      '  <h2>課長への引渡し</h2>',
      '  <p class="aicm-selected-note">Manager大項目を課長/Leaderへ送ります。Worker Runtime request はまだ作成しません。</p>',
      rows.map(function (row) {
        var majorId = typeof aicmAxuR1MajorId === "function" ? aicmAxuR1MajorId(row) : "";
        var title = row.major_item_name || row.deliverable_name || row.task_name || "Manager大項目";
        var leader = row.assigned_leader_label || row.leader_label || "Leader未設定";
        var status = row.decomposition_status_code || "-";
        var handoff = row.handoff_status_code || "-";

        return [
          '<article class="aicm-org-update-row">',
          '  <div>',
          '    <strong>' + escapeHtml(title) + '</strong>',
          '    <p>Leader: ' + escapeHtml(leader) + ' / 状態: ' + escapeHtml(status) + ' / 引渡し: ' + escapeHtml(handoff) + '</p>',
          '  </div>',
          '  <button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
          '</article>'
        ].join("");
      }).join(""),
      '</section>'
    ].join("");
  }
`;
  insertBefore('function renderPmlwMajorRows', panel);
}

/*
 * 3. Patch renderPmlwMajorRows table directly if possible.
 */
const range = findFunctionRange(core, 'renderPmlwMajorRows');
if (!range) {
  console.error('renderPmlwMajorRows not found');
  process.exit(1);
}

let fn = range.text;

if (!fn.includes('pmlw-major-leader-handoff')) {
  const headerNeedles = [
    "'        <th>期限</th>',",
    '"        <th>期限</th>",'
  ];

  let headerPatched = false;
  for (const needle of headerNeedles) {
    if (fn.includes(needle)) {
      fn = fn.replace(needle, needle + "\n      '        <th>操作</th>',");
      headerPatched = true;
      break;
    }
  }

  const cellNeedles = [
    "'        <td>' + escapeHtml(pmlwValue(row.due_date, \"-\")) + '</td>',",
    "'        <td>' + escapeHtml(pmlwValue(row.due_date, '-')) + '</td>',"
  ];

  let cellPatched = false;
  for (const needle of cellNeedles) {
    if (fn.includes(needle)) {
      fn = fn.replace(
        needle,
        needle + "\n          '        <td><button type=\"button\" data-core-action=\"pmlw-major-leader-handoff\" data-pmlw-major-id=\"' + escapeHtml(aicmAxuR1MajorId(row)) + '\">課長へ送る</button></td>',"
      );
      cellPatched = true;
      break;
    }
  }

  if (headerPatched || cellPatched) {
    core = core.slice(0, range.start) + fn + core.slice(range.end);
  }
}

/*
 * 4. Wrap renderPmlwMajorRows so standalone panel appears if table injection does not.
 */
if (!core.includes('function renderPmlwMajorRowsBaseAxuR1B')) {
  const r2 = findFunctionRange(core, 'renderPmlwMajorRows');
  if (!r2) {
    console.error('renderPmlwMajorRows not found for wrap');
    process.exit(1);
  }

  const original = r2.text.replace('function renderPmlwMajorRows', 'function renderPmlwMajorRowsBaseAxuR1B');
  const wrapper = `function renderPmlwMajorRows() {
    // ${marker}
    var html = renderPmlwMajorRowsBaseAxuR1B();

    if (String(html || "").indexOf("pmlw-major-leader-handoff") >= 0) {
      return html;
    }

    return String(html || "") + aicmAxuR1BLeaderHandoffStandalonePanel();
  }`;

  core = core.slice(0, r2.start) + original + '\n\n' + wrapper + core.slice(r2.end);
}

/*
 * 5. Ensure click handler branch exists.
 */
if (!core.includes('action === "pmlw-major-leader-handoff"')) {
  const actionNeedle = 'var action = button.getAttribute("data-core-action") || "";';
  const idx = core.indexOf(actionNeedle);
  if (idx < 0) {
    console.error('action variable anchor not found');
    process.exit(1);
  }

  const insertAt = idx + actionNeedle.length;
  core = core.slice(0, insertAt) + `

    // ${marker}
    if (action === "pmlw-major-leader-handoff") {
      aicmAxuR1OpenLeaderHandoffConfirm(button);
      return;
    }` + core.slice(insertAt);
}

fs.writeFileSync(coreFile, core, 'utf8');

console.log('coreChanged=' + String(core !== beforeCore));
console.log('markerCount=' + String(countText(core, marker)));
console.log('helperCount=' + String(countText(core, 'function aicmAxuR1OpenLeaderHandoffConfirm')));
console.log('standalonePanelCount=' + String(countText(core, 'function aicmAxuR1BLeaderHandoffStandalonePanel')));
console.log('renderWrapperCount=' + String(countText(core, 'function renderPmlwMajorRowsBaseAxuR1B')));
console.log('buttonActionCount=' + String(countText(core, 'pmlw-major-leader-handoff')));
console.log('buttonLabelCount=' + String(countText(core, '課長へ送る')));
console.log('managerMajorUpdateEndpointCount=' + String(countText(core, 'endpoint: "/api/aicm/v2/manager-major/update"')));
console.log('workerRuntimeDirectActionCount=' + String(countText(core, 'pmlw-major-runtime-request')));
console.log('badLiteralNewlineCount=' + String(
  countText(core, ",\\n      '") +
  countText(core, ",\\n        '") +
  countText(core, ",\\n          '") +
  countText(core, ",\\n            '")
));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
