import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;

let src = fs.readFileSync(corePath, 'utf8');

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), 'g')) || []).length;
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function findOpenBrace(text, fromIndex) {
  let state = 'normal';
  let escape = false;

  for (let i = fromIndex; i < text.length; i++) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }

    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i++;
      }
      continue;
    }

    if (state === 'single') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") state = 'normal';
      continue;
    }

    if (state === 'double') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') state = 'normal';
      continue;
    }

    if (state === 'template') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '`') state = 'normal';
      continue;
    }

    if (ch === '/' && nx === '/') {
      state = 'lineComment';
      i++;
      continue;
    }

    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i++;
      continue;
    }

    if (ch === "'") {
      state = 'single';
      continue;
    }

    if (ch === '"') {
      state = 'double';
      continue;
    }

    if (ch === '`') {
      state = 'template';
      continue;
    }

    if (ch === '{') return i;
  }

  return -1;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let state = 'normal';
  let escape = false;

  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }

    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i++;
      }
      continue;
    }

    if (state === 'single') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") state = 'normal';
      continue;
    }

    if (state === 'double') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') state = 'normal';
      continue;
    }

    if (state === 'template') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '`') state = 'normal';
      continue;
    }

    if (ch === '/' && nx === '/') {
      state = 'lineComment';
      i++;
      continue;
    }

    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i++;
      continue;
    }

    if (ch === "'") {
      state = 'single';
      continue;
    }

    if (ch === '"') {
      state = 'double';
      continue;
    }

    if (ch === '`') {
      state = 'template';
      continue;
    }

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function findFunctionRange(text, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + escRe(name) + '\\s*\\(', 'm');
  const m = re.exec(text);
  if (!m) throw new Error('FUNCTION_NOT_FOUND: ' + name);

  const start = m.index;
  const open = findOpenBrace(text, start);
  if (open < 0) throw new Error('OPEN_BRACE_NOT_FOUND: ' + name);

  const close = findMatchingBrace(text, open);
  if (close < 0) throw new Error('CLOSE_BRACE_NOT_FOUND: ' + name);

  return {
    name,
    start,
    open,
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1';
const helperStart = marker + '_HELPER_START';
const helperEnd = marker + '_HELPER_END';
const routeStart = marker + '_ACTION_ROUTE_START';
const routeEnd = marker + '_ACTION_ROUTE_END';
const rendererMarker = marker + '_RENDERER';

const actionNames = [
  'r8z-mgr-major-card-toggle',
  'r8z-mgr-major-card-select-all',
  'r8z-mgr-major-card-clear',
  'r8z-mgr-major-card-open-handoff-confirm',
  'r8z-mgr-major-card-open-delete-confirm',
  'r8z-mgr-major-card-confirm-yes',
  'r8z-mgr-major-card-confirm-no'
];

const helperBlock = `
  // ${helperStart}
  // Consolidated card-selection helpers for aicmRenderManagerMajorRows.
  // DB_WRITE=NO / API_POST=NO. These helpers only manage browser-side UI state.
  function aicmR8zMgrMajorCardState() {
    if (typeof state === "undefined" || !state) {
      return { selectedIds: {}, confirm: null };
    }

    if (!state.r8zMgrMajorCardSelection || typeof state.r8zMgrMajorCardSelection !== "object") {
      state.r8zMgrMajorCardSelection = { selectedIds: {}, confirm: null };
    }

    if (!state.r8zMgrMajorCardSelection.selectedIds || typeof state.r8zMgrMajorCardSelection.selectedIds !== "object") {
      state.r8zMgrMajorCardSelection.selectedIds = {};
    }

    return state.r8zMgrMajorCardSelection;
  }

  function aicmR8zMgrMajorCardRowId(row, index) {
    if (typeof aicmAxuR1MajorId === "function") {
      var existingId = aicmAxuR1MajorId(row);
      if (existingId) return String(existingId).trim();
    }

    return String(
      (row && (
        row.aicm_manager_major_work_item_id ||
        row.manager_major_work_item_id ||
        row.pmlw_major_item_id ||
        row.major_work_item_id ||
        row.major_item_id ||
        row.majorId ||
        row.major_id ||
        row.id
      )) ||
      ("row-" + String(typeof index === "number" ? index : 0))
    ).trim();
  }

  function aicmR8zMgrMajorCardTitle(row) {
    return String(
      (row && (
        row.major_item_name ||
        row.task_name ||
        row.deliverable_name ||
        row.title
      )) ||
      "Manager大項目"
    ).trim();
  }

  function aicmR8zMgrMajorCardIsSelectable(row) {
    if (typeof aicmIsPendingManagerMajorRowR8V6 === "function") {
      return !!aicmIsPendingManagerMajorRowR8V6(row);
    }

    var handoff = String((row && (row.handoff_status_code || row.handoff_status || row.leader_handoff_status_code)) || "").toLowerCase();
    var decomposition = String((row && (row.decomposition_status_code || row.work_status_code || row.status_code)) || "").toLowerCase();
    var deleted = String((row && (row.deleted_flag || row.is_deleted)) || "").toLowerCase();
    var archived = String((row && (row.archived_flag || row.is_archived)) || "").toLowerCase();

    if (deleted === "true" || deleted === "1") return false;
    if (archived === "true" || archived === "1") return false;

    var closed = {
      archived: true,
      deleted: true,
      cancelled: true,
      canceled: true,
      sent: true,
      handed_off: true,
      leader_handoff_done: true,
      submitted: true,
      delivered: true,
      completed: true,
      complete: true,
      done: true
    };

    if (closed[handoff]) return false;
    if (closed[decomposition]) return false;
    return true;
  }

  function aicmR8zMgrMajorCardIsSelected(id) {
    var bag = aicmR8zMgrMajorCardState();
    var selected = bag && bag.selectedIds && typeof bag.selectedIds === "object" ? bag.selectedIds : {};
    return !!(id && selected[id]);
  }

  function aicmR8zMgrMajorCardAllRows() {
    var ctx = state && state.context && typeof state.context === "object" ? state.context : {};
    var rows = [];

    function add(list) {
      if (Array.isArray(list)) rows = rows.concat(list);
    }

    add(ctx.pmlw_major_items);
    add(ctx.pmlwMajorItems);
    add(ctx.manager_major_items);
    add(ctx.managerMajorItems);
    add(ctx.major_items);
    add(ctx.majorItems);
    add(state && state.pmlw_major_items);
    add(state && state.pmlwMajorItems);
    add(state && state.manager_major_items);
    add(state && state.managerMajorItems);
    add(state && state.major_items);
    add(state && state.majorItems);

    var seen = {};
    var out = [];

    rows.forEach(function (row, index) {
      var id = aicmR8zMgrMajorCardRowId(row, index);
      if (!id || seen[id]) return;
      seen[id] = true;
      out.push(row);
    });

    return out;
  }

  function aicmR8zMgrMajorCardSelectedRows() {
    return aicmR8zMgrMajorCardAllRows().filter(function (row, index) {
      return aicmR8zMgrMajorCardIsSelected(aicmR8zMgrMajorCardRowId(row, index));
    });
  }

  function aicmR8zMgrMajorCardRenderCheckbox(row, index) {
    var id = aicmR8zMgrMajorCardRowId(row, index);
    var checked = aicmR8zMgrMajorCardIsSelected(id) ? " checked" : "";
    var disabled = aicmR8zMgrMajorCardIsSelectable(row) ? "" : " disabled";

    return [
      '<label class="aicm-selected-note" style="display:inline-flex;align-items:center;gap:8px;margin-top:12px;">',
      '<input type="checkbox" data-core-action="r8z-mgr-major-card-toggle" data-r8z-mgr-major-id="' + escapeHtml(id) + '"' + checked + disabled + '>',
      '選択',
      '</label>'
    ].join("");
  }

  function aicmR8zMgrMajorCardRenderConfirm() {
    var bag = aicmR8zMgrMajorCardState();
    var confirm = bag.confirm || null;

    if (!confirm || !Array.isArray(confirm.items) || !confirm.items.length) {
      return "";
    }

    return [
      '<div class="aicm-core-card" data-r8z-mgr-major-confirm="1" style="margin-top:12px;border:1px solid #f59e0b;">',
      '  <p class="aicm-eyebrow">確認</p>',
      '  <h3>' + escapeHtml(confirm.title || "確認") + '</h3>',
      '  <ul class="aicm-selected-note">' + confirm.items.map(function (item) {
        return '<li>' + escapeHtml(item.title || item.id || "Manager大項目") + '</li>';
      }).join("") + '</ul>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-mgr-major-card-confirm-yes">Yes</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-confirm-no">No</button>',
      '  </div>',
      '  <p class="aicm-selected-note">C1FではYes押下時もDB更新/API POSTは実行しません。</p>',
      '</div>'
    ].join("");
  }

  function aicmR8zMgrMajorCardRenderOperationPanel(rows) {
    rows = Array.isArray(rows) ? rows : [];

    var selectedCount = rows.filter(function (row, index) {
      return aicmR8zMgrMajorCardIsSelected(aicmR8zMgrMajorCardRowId(row, index));
    }).length;

    var eligibleCount = rows.filter(function (row) {
      return aicmR8zMgrMajorCardIsSelectable(row);
    }).length;

    return [
      '<div class="aicm-core-card" data-r8z-mgr-major-operation-panel="1" style="margin:12px 0;">',
      '  <p class="aicm-eyebrow">登録済み大項目 操作</p>',
      '  <h3>選択操作</h3>',
      '  <p class="aicm-selected-note">選択 ' + String(selectedCount) + ' / 未送信 ' + String(eligibleCount) + ' / 全件 ' + String(rows.length) + '</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-mgr-major-card-open-handoff-confirm">課長へ送る</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-open-delete-confirm">削除</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-select-all">全件選択</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-clear">解除</button>',
      '  </div>',
      aicmR8zMgrMajorCardRenderConfirm(),
      '</div>'
    ].join("");
  }

  function aicmR8zMgrMajorCardRerender(sourceLabel) {
    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4(sourceLabel || "r8z_mgr_major_card_selection_clean_v1");
      return;
    }

    if (typeof render === "function") {
      render();
    }
  }

  function aicmR8zMgrMajorCardOpenConfirm(kind) {
    var bag = aicmR8zMgrMajorCardState();
    var rows = aicmR8zMgrMajorCardSelectedRows();

    if (!rows.length) {
      bag.confirm = null;
      if (typeof setMessage === "function") {
        setMessage("error", "対象の大項目を選択してください。");
      }
      aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_empty");
      return;
    }

    bag.confirm = {
      kind: kind,
      title: kind === "delete" ? "削除確認" : "課長へ送る確認",
      items: rows.map(function (row, index) {
        return {
          id: aicmR8zMgrMajorCardRowId(row, index),
          title: aicmR8zMgrMajorCardTitle(row)
        };
      })
    };

    if (typeof setMessage === "function") {
      setMessage("ok", "確認画面を表示しました。");
    }

    aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_open");
  }

  function aicmR8zMgrMajorCardHandleAction(ev, target, action) {
    try {
      if (ev && typeof ev.preventDefault === "function") ev.preventDefault();

      target = target || null;

      if (!target && ev && ev.target && typeof ev.target.closest === "function") {
        target = ev.target.closest("[data-core-action]");
      }

      var bag = aicmR8zMgrMajorCardState();

      if (action === "r8z-mgr-major-card-toggle") {
        var id = "";

        if (target && target.getAttribute) {
          id = String(target.getAttribute("data-r8z-mgr-major-id") || "").trim();
        }

        if (!id && target && target.dataset) {
          id = String(target.dataset.r8zMgrMajorId || "").trim();
        }

        if (!id) {
          if (typeof setMessage === "function") setMessage("error", "選択対象の大項目IDを特定できません。");
          aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_toggle_missing_id");
          return;
        }

        if (target && target.checked) {
          bag.selectedIds[id] = true;
        } else {
          delete bag.selectedIds[id];
        }

        bag.confirm = null;
        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_toggle");
        return;
      }

      if (action === "r8z-mgr-major-card-select-all") {
        bag.selectedIds = {};

        aicmR8zMgrMajorCardAllRows().forEach(function (row, index) {
          if (!aicmR8zMgrMajorCardIsSelectable(row)) return;
          var id = aicmR8zMgrMajorCardRowId(row, index);
          if (id) bag.selectedIds[id] = true;
        });

        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage("ok", "未送信の大項目を全件選択しました。");
        }

        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_select_all");
        return;
      }

      if (action === "r8z-mgr-major-card-clear") {
        bag.selectedIds = {};
        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage("ok", "大項目の選択を解除しました。");
        }

        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_clear");
        return;
      }

      if (action === "r8z-mgr-major-card-open-handoff-confirm") {
        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-mgr-major-card-open-delete-confirm") {
        aicmR8zMgrMajorCardOpenConfirm("delete");
        return;
      }

      if (action === "r8z-mgr-major-card-confirm-no") {
        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage("ok", "操作をキャンセルしました。");
        }

        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_no");
        return;
      }

      if (action === "r8z-mgr-major-card-confirm-yes") {
        var kind = bag.confirm && bag.confirm.kind ? bag.confirm.kind : "";
        var count = bag.confirm && Array.isArray(bag.confirm.items) ? bag.confirm.items.length : 0;

        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage(
            "ok",
            (kind === "delete" ? "削除" : "課長へ送る") +
            "のYesを受け付けました。ただしC1FではDB更新/API POSTは実行していません。対象件数: " +
            String(count)
          );
        }

        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_yes_no_write");
        return;
      }
    } catch (error) {
      try {
        if (typeof setMessage === "function") {
          setMessage("error", error && error.message ? error.message : "大項目選択操作に失敗しました。");
        }
        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_action_error");
      } catch (_) {}
    }
  }
  // ${helperEnd}

`;

function insertHelper(text) {
  if (text.includes(helperStart)) return text;

  const fn = findFunctionRange(text, 'aicmRenderManagerMajorRows');
  return text.slice(0, fn.start) + helperBlock + text.slice(fn.start);
}

function insertActionRoute(text) {
  if (text.includes(routeStart)) return text;

  const ifRe = /(\n\s*)if\s*\(\s*([A-Za-z_$][\w$]*)\s*={2,3}\s*["']pmlw-major-leader-handoff["']\s*\)\s*\{/m;
  const ifMatch = ifRe.exec(text);

  if (ifMatch) {
    const indent = ifMatch[1];
    const actionVar = ifMatch[2];

    const routeBlock = [
      '',
      indent + '// ' + routeStart,
      indent + 'if ([' + actionNames.map(function (a) { return '"' + a + '"'; }).join(', ') + '].indexOf(' + actionVar + ') >= 0) {',
      indent + '  if (typeof aicmR8zMgrMajorCardHandleAction === "function") {',
      indent + '    aicmR8zMgrMajorCardHandleAction(',
      indent + '      (typeof ev !== "undefined" ? ev : (typeof event !== "undefined" ? event : null)),',
      indent + '      (typeof btn !== "undefined" ? btn : (typeof target !== "undefined" ? target : (typeof el !== "undefined" ? el : null))),',
      indent + '      ' + actionVar,
      indent + '    );',
      indent + '  }',
      indent + '  return;',
      indent + '}',
      indent + '// ' + routeEnd
    ].join('\n');

    return text.slice(0, ifMatch.index) + routeBlock + text.slice(ifMatch.index);
  }

  const caseRe = /(\n\s*)case\s+["']pmlw-major-leader-handoff["']\s*:/m;
  const caseMatch = caseRe.exec(text);

  if (caseMatch) {
    const indent = caseMatch[1];

    const routeBlock = [
      '',
      indent + '// ' + routeStart
    ]
      .concat(actionNames.map(function (a) {
        return [
          indent + 'case "' + a + '":',
          indent + '  if (typeof aicmR8zMgrMajorCardHandleAction === "function") {',
          indent + '    aicmR8zMgrMajorCardHandleAction(',
          indent + '      (typeof ev !== "undefined" ? ev : (typeof event !== "undefined" ? event : null)),',
          indent + '      (typeof btn !== "undefined" ? btn : (typeof target !== "undefined" ? target : (typeof el !== "undefined" ? el : null))),',
          indent + '      "' + a + '"',
          indent + '    );',
          indent + '  }',
          indent + '  return;'
        ].join('\n');
      }))
      .concat([
        indent + '// ' + routeEnd
      ])
      .join('\n');

    return text.slice(0, caseMatch.index) + routeBlock + text.slice(caseMatch.index);
  }

  throw new Error('ACTION_ROUTE_INSERT_POINT_NOT_FOUND');
}

function patchActiveCardRenderer(text) {
  const fn = findFunctionRange(text, 'aicmRenderManagerMajorRows');
  let body = fn.text;

  if (body.includes(rendererMarker)) return text;

  const originalBody = body;
  let lines = body.split(/\r?\n/);

  function findLineIndex(predicate, from = 0) {
    for (let i = from; i < lines.length; i += 1) {
      if (predicate(lines[i], i)) return i;
    }
    return -1;
  }

  const titleIdx = findLineIndex(function (line) {
    return line.includes('登録済み大項目');
  });

  if (titleIdx < 0) throw new Error('REGISTERED_MAJOR_TITLE_LINE_NOT_FOUND');

  const titleIndent = (lines[titleIdx].match(/^(\s*)/) || ['', ''])[1];

  lines.splice(
    titleIdx + 1,
    0,
    titleIndent + 'aicmR8zMgrMajorCardRenderOperationPanel(rows),',
    titleIndent + '\'<!-- ' + rendererMarker + '_PANEL -->\','
  );

  let mapIdx = -1;

  for (let i = titleIdx; i < lines.length; i += 1) {
    if (/\.map\s*\(\s*function\s*\(\s*row/.test(lines[i]) || /rows\s*\.\s*map\s*\(\s*function\s*\(\s*row/.test(lines[i])) {
      mapIdx = i;
      break;
    }
  }

  if (mapIdx < 0) throw new Error('CARD_ROWS_MAP_LINE_NOT_FOUND');

  const mapIndent = (lines[mapIdx].match(/^(\s*)/) || ['', ''])[1] + '  ';

  lines.splice(
    mapIdx + 1,
    0,
    mapIndent + '// ' + rendererMarker + '_ROW_START',
    mapIndent + 'var r8zMgrMajorCardIndex = typeof index === "number" ? index : 0;',
    mapIndent + 'var r8zMgrMajorCardCheckboxHtml = aicmR8zMgrMajorCardRenderCheckbox(row, r8zMgrMajorCardIndex);',
    mapIndent + '// ' + rendererMarker + '_ROW_END'
  );

  const removeStart = mapIdx + 1;
  const removeEnd = Math.min(lines.length, mapIdx + 230);
  const oldButtonIdxs = [];

  for (let i = removeStart; i < removeEnd; i += 1) {
    const line = lines[i];

    const oldHandoff = line.includes('data-core-action="pmlw-major-leader-handoff"') ||
      (line.includes('<button') && line.includes('課長へ送る'));

    const oldDelete = line.includes('managerMajorDeleteConfirm') ||
      line.includes('data-core-action="pmlw-major-delete"') ||
      line.includes('data-core-action="manager-major-delete"') ||
      line.includes('data-core-action="major-item-delete"') ||
      line.includes('data-core-action="manager-major-delete-open"') ||
      (line.includes('<button') && line.includes('削除'));

    if (oldHandoff || oldDelete) {
      oldButtonIdxs.push(i);
    }
  }

  if (!oldButtonIdxs.length) {
    throw new Error('OLD_CARD_BUTTON_LINES_NOT_FOUND');
  }

  const oldSet = new Set(oldButtonIdxs);
  const patchedLines = [];
  let insertedCheckbox = false;
  let removedOldButtonLines = 0;

  for (let i = 0; i < lines.length; i += 1) {
    if (oldSet.has(i)) {
      removedOldButtonLines += 1;

      if (!insertedCheckbox) {
        patchedLines.push(titleIndent + 'r8zMgrMajorCardCheckboxHtml,');
        patchedLines.push(titleIndent + '\'<!-- ' + rendererMarker + '_CHECKBOX -->\',');
        insertedCheckbox = true;
      }

      continue;
    }

    patchedLines.push(lines[i]);
  }

  lines = patchedLines;
  body = lines.join('\n');

  if (!insertedCheckbox) throw new Error('CHECKBOX_NOT_INSERTED');
  if (removedOldButtonLines < 1) throw new Error('OLD_BUTTON_LINES_NOT_REMOVED');
  if (body === originalBody) throw new Error('ACTIVE_CARD_RENDERER_UNCHANGED');
  if (body.includes('r8zCardIsSelectedMajorId')) throw new Error('OLD_REPAIR_HELPER_REFERENCE_REMAINS');

  return text.slice(0, fn.start) + body + text.slice(fn.close + 1);
}

src = insertHelper(src);
src = insertActionRoute(src);
src = patchActiveCardRenderer(src);

const fn = findFunctionRange(src, 'aicmRenderManagerMajorRows');

const verify = [];
verify.push('AICompanyManager V10L-C1F verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=NO');
verify.push('');
verify.push('TARGET_FUNCTION=aicmRenderManagerMajorRows');
verify.push('TARGET_FUNCTION_LINES=' + fn.startLine + '-' + fn.endLine);
verify.push('CLEAN_MARKER_COUNT=' + count(src, marker));
verify.push('HELPER_MARKER_COUNT=' + count(src, helperStart));
verify.push('ROUTE_MARKER_COUNT=' + count(src, routeStart));
verify.push('RENDERER_MARKER_COUNT=' + count(fn.text, rendererMarker));
verify.push('OLD_C1B_HELPER_COUNT=' + count(src, 'AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_HELPER_START'));
verify.push('OLD_C1B_ROUTE_COUNT=' + count(src, 'AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_ACTION_ROUTE_START'));
verify.push('OLD_C1E_PATCH_COUNT=' + count(src, 'AICM_R8Z_MANAGER_MAJOR_CARD_SELECTION_UI_PATCH'));
verify.push('OLD_REPAIR1_COUNT=' + count(src, 'AICM_R8Z_MANAGER_MAJOR_CARD_SELECTION_UI_REPAIR1_SAFE_SELECTED_IDS'));
verify.push('OLD_REPAIR2_COUNT=' + count(src, 'AICM_R8Z_MANAGER_MAJOR_CARD_SELECTION_UI_REPAIR2_INLINE_SAFE_LOOKUP'));
verify.push('OLD_UNDEFINED_HELPER_REFERENCE_COUNT=' + count(src, 'r8zCardIsSelectedMajorId'));
verify.push('OLD_HANDOFF_ACTION_IN_TARGET=' + count(fn.text, 'data-core-action="pmlw-major-leader-handoff"'));
verify.push('NEW_CHECKBOX_RENDER_CALL_COUNT=' + count(fn.text, 'aicmR8zMgrMajorCardRenderCheckbox'));
verify.push('NEW_OPERATION_PANEL_CALL_COUNT=' + count(fn.text, 'aicmR8zMgrMajorCardRenderOperationPanel'));
verify.push('NEW_TOGGLE_ACTION_COUNT=' + count(src, 'r8z-mgr-major-card-toggle'));
verify.push('NEW_SELECT_ALL_ACTION_COUNT=' + count(src, 'r8z-mgr-major-card-select-all'));
verify.push('NEW_HANDOFF_CONFIRM_ACTION_COUNT=' + count(src, 'r8z-mgr-major-card-open-handoff-confirm'));
verify.push('NEW_DELETE_CONFIRM_ACTION_COUNT=' + count(src, 'r8z-mgr-major-card-open-delete-confirm'));

if (count(src, helperStart) !== 1) throw new Error('HELPER_MARKER_COUNT_NOT_1');
if (count(src, routeStart) !== 1) throw new Error('ROUTE_MARKER_COUNT_NOT_1');
if (count(fn.text, rendererMarker) < 1) throw new Error('RENDERER_MARKER_MISSING');
if (count(src, 'AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_HELPER_START') !== 0) throw new Error('OLD_C1B_HELPER_REMAINS');
if (count(src, 'AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_ACTION_ROUTE_START') !== 0) throw new Error('OLD_C1B_ROUTE_REMAINS');
if (count(src, 'AICM_R8Z_MANAGER_MAJOR_CARD_SELECTION_UI_PATCH') !== 0) throw new Error('OLD_C1E_PATCH_REMAINS');
if (count(src, 'AICM_R8Z_MANAGER_MAJOR_CARD_SELECTION_UI_REPAIR1_SAFE_SELECTED_IDS') !== 0) throw new Error('OLD_REPAIR1_REMAINS');
if (count(src, 'AICM_R8Z_MANAGER_MAJOR_CARD_SELECTION_UI_REPAIR2_INLINE_SAFE_LOOKUP') !== 0) throw new Error('OLD_REPAIR2_REMAINS');
if (count(src, 'r8zCardIsSelectedMajorId') !== 0) throw new Error('OLD_UNDEFINED_HELPER_REFERENCE_REMAINS');
if (count(fn.text, 'data-core-action="pmlw-major-leader-handoff"') !== 0) throw new Error('OLD_HANDOFF_ACTION_STILL_IN_TARGET');
if (count(fn.text, 'aicmR8zMgrMajorCardRenderCheckbox') < 1) throw new Error('CHECKBOX_RENDER_CALL_MISSING');
if (count(fn.text, 'aicmR8zMgrMajorCardRenderOperationPanel') < 1) throw new Error('OPERATION_PANEL_CALL_MISSING');

fs.writeFileSync(extractOut, fn.text + '\n');
fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
fs.writeFileSync(corePath, src);
