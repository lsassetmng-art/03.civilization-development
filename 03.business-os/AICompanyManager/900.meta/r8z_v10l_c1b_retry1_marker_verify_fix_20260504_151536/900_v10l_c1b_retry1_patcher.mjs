import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;

let src = fs.readFileSync(corePath, 'utf8');
const original = src;

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), 'g')) || []).length;
}

const helperMarker = 'AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_HELPER_START';
const routeMarker = 'AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_ACTION_ROUTE_START';
const rendererMarker = 'AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_RENDERER';

const helperBlock = `
  // ${helperMarker}
  // Selection-only UI state for registered Manager major rows.
  // This block does not write DB and does not call API.
  function aicmV10lC1bMajorSelectionState() {
    if (!state.v10lC1bMajorSelection || typeof state.v10lC1bMajorSelection !== "object") {
      state.v10lC1bMajorSelection = { selectedIds: {}, confirm: null };
    }

    if (!state.v10lC1bMajorSelection.selectedIds || typeof state.v10lC1bMajorSelection.selectedIds !== "object") {
      state.v10lC1bMajorSelection.selectedIds = {};
    }

    return state.v10lC1bMajorSelection;
  }

  function aicmV10lC1bMajorId(row) {
    if (typeof aicmAxuR1MajorId === "function") {
      var viaExisting = aicmAxuR1MajorId(row);
      if (viaExisting) return String(viaExisting).trim();
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
      ""
    ).trim();
  }

  function aicmV10lC1bMajorTitle(row) {
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

  function aicmV10lC1bAllMajorRows() {
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

    rows.forEach(function (row) {
      var id = aicmV10lC1bMajorId(row);
      if (!id || seen[id]) return;
      seen[id] = true;
      out.push(row);
    });

    return out;
  }

  function aicmV10lC1bIsPendingMajorRow(row) {
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

  function aicmV10lC1bSelectedMajorRows() {
    var bag = aicmV10lC1bMajorSelectionState();
    var rows = aicmV10lC1bAllMajorRows();

    return rows.filter(function (row) {
      var id = aicmV10lC1bMajorId(row);
      return !!(id && bag.selectedIds[id]);
    });
  }

  function aicmV10lC1bRenderTaskLedger(sourceLabel) {
    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4(sourceLabel || "v10l_c1b_selection_ui");
      return;
    }

    if (typeof render === "function") {
      render();
    }
  }

  function aicmV10lC1bOpenConfirm(kind) {
    var bag = aicmV10lC1bMajorSelectionState();
    var rows = aicmV10lC1bSelectedMajorRows();

    if (!rows.length) {
      if (typeof setMessage === "function") {
        setMessage("error", "対象の大項目を選択してください。");
      }
      bag.confirm = null;
      aicmV10lC1bRenderTaskLedger("v10l_c1b_open_confirm_empty");
      return;
    }

    bag.confirm = {
      kind: kind,
      title: kind === "delete" ? "削除確認" : "課長へ送る確認",
      items: rows.map(function (row) {
        return {
          id: aicmV10lC1bMajorId(row),
          title: aicmV10lC1bMajorTitle(row)
        };
      })
    };

    if (typeof setMessage === "function") {
      setMessage("ok", "確認画面を表示しました。");
    }

    aicmV10lC1bRenderTaskLedger("v10l_c1b_open_confirm");
  }

  function aicmV10lC1bHandleMajorSelectionAction(ev, target, action) {
    try {
      if (ev && typeof ev.preventDefault === "function") ev.preventDefault();

      target = target || null;

      if (!target && ev && ev.target && typeof ev.target.closest === "function") {
        target = ev.target.closest("[data-core-action]");
      }

      var bag = aicmV10lC1bMajorSelectionState();

      if (action === "v10l-c1b-major-toggle") {
        var toggleId = "";
        if (target && target.getAttribute) {
          toggleId = String(target.getAttribute("data-pmlw-major-id") || target.getAttribute("data-major-id") || "").trim();
        }

        if (!toggleId && target && target.dataset) {
          toggleId = String(target.dataset.pmlwMajorId || target.dataset.majorId || "").trim();
        }

        if (!toggleId) {
          if (typeof setMessage === "function") setMessage("error", "選択対象の大項目IDを特定できません。");
          aicmV10lC1bRenderTaskLedger("v10l_c1b_toggle_missing_id");
          return;
        }

        if (target && target.checked) {
          bag.selectedIds[toggleId] = true;
        } else {
          delete bag.selectedIds[toggleId];
        }

        bag.confirm = null;
        aicmV10lC1bRenderTaskLedger("v10l_c1b_toggle");
        return;
      }

      if (action === "v10l-c1b-major-select-all") {
        bag.selectedIds = {};

        aicmV10lC1bAllMajorRows().forEach(function (row) {
          if (!aicmV10lC1bIsPendingMajorRow(row)) return;
          var id = aicmV10lC1bMajorId(row);
          if (id) bag.selectedIds[id] = true;
        });

        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage("ok", "未送信の大項目を全件選択しました。");
        }

        aicmV10lC1bRenderTaskLedger("v10l_c1b_select_all");
        return;
      }

      if (action === "v10l-c1b-major-clear") {
        bag.selectedIds = {};
        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage("ok", "大項目の選択を解除しました。");
        }

        aicmV10lC1bRenderTaskLedger("v10l_c1b_clear");
        return;
      }

      if (action === "v10l-c1b-major-open-handoff-confirm") {
        aicmV10lC1bOpenConfirm("leader-handoff");
        return;
      }

      if (action === "v10l-c1b-major-open-delete-confirm") {
        aicmV10lC1bOpenConfirm("delete");
        return;
      }

      if (action === "v10l-c1b-major-confirm-no") {
        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage("ok", "操作をキャンセルしました。");
        }

        aicmV10lC1bRenderTaskLedger("v10l_c1b_confirm_no");
        return;
      }

      if (action === "v10l-c1b-major-confirm-yes") {
        var kind = bag.confirm && bag.confirm.kind ? bag.confirm.kind : "";
        var count = bag.confirm && Array.isArray(bag.confirm.items) ? bag.confirm.items.length : 0;

        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage(
            "ok",
            (kind === "delete" ? "削除" : "課長へ送る") +
            "の確認Yesを受け付けました。ただしV10L-C1BではDB更新/API POSTは実行していません。対象件数: " +
            String(count)
          );
        }

        aicmV10lC1bRenderTaskLedger("v10l_c1b_confirm_yes_no_write");
        return;
      }
    } catch (error) {
      try {
        if (typeof setMessage === "function") {
          setMessage("error", error && error.message ? error.message : "大項目選択操作に失敗しました。");
        }
        aicmV10lC1bRenderTaskLedger("v10l_c1b_action_error");
      } catch (_) {}
    }
  }
  // AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_HELPER_END

`;

function insertHelper(text) {
  if (text.includes(helperMarker)) return text;

  const fn = findFunctionRange(text, 'renderPmlwMajorRowsBaseAxuR1B');
  return text.slice(0, fn.start) + helperBlock + text.slice(fn.start);
}

function insertActionRoute(text) {
  if (text.includes(routeMarker)) return text;

  const actionNames = [
    'v10l-c1b-major-toggle',
    'v10l-c1b-major-select-all',
    'v10l-c1b-major-clear',
    'v10l-c1b-major-open-handoff-confirm',
    'v10l-c1b-major-open-delete-confirm',
    'v10l-c1b-major-confirm-yes',
    'v10l-c1b-major-confirm-no'
  ];

  const ifRe = /(\n\s*)if\s*\(\s*([A-Za-z_$][\w$]*)\s*={2,3}\s*["']pmlw-major-leader-handoff["']\s*\)\s*\{/m;
  const ifMatch = ifRe.exec(text);

  if (ifMatch) {
    const indent = ifMatch[1];
    const actionVar = ifMatch[2];

    const routeBlock = [
      '',
      indent + '// ' + routeMarker,
      indent + 'if ([' + actionNames.map(function (a) { return '"' + a + '"'; }).join(', ') + '].indexOf(' + actionVar + ') >= 0) {',
      indent + '  if (typeof aicmV10lC1bHandleMajorSelectionAction === "function") {',
      indent + '    aicmV10lC1bHandleMajorSelectionAction(',
      indent + '      (typeof ev !== "undefined" ? ev : (typeof event !== "undefined" ? event : null)),',
      indent + '      (typeof btn !== "undefined" ? btn : (typeof target !== "undefined" ? target : (typeof el !== "undefined" ? el : null))),',
      indent + '      ' + actionVar,
      indent + '    );',
      indent + '  }',
      indent + '  return;',
      indent + '}',
      indent + '// AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_ACTION_ROUTE_END'
    ].join('\n');

    return text.slice(0, ifMatch.index) + routeBlock + text.slice(ifMatch.index);
  }

  const caseRe = /(\n\s*)case\s+["']pmlw-major-leader-handoff["']\s*:/m;
  const caseMatch = caseRe.exec(text);

  if (caseMatch) {
    const indent = caseMatch[1];
    const routeBlock = [
      '',
      indent + '// ' + routeMarker
    ]
      .concat(actionNames.map(function (a) {
        return [
          indent + 'case "' + a + '":',
          indent + '  if (typeof aicmV10lC1bHandleMajorSelectionAction === "function") {',
          indent + '    aicmV10lC1bHandleMajorSelectionAction(',
          indent + '      (typeof ev !== "undefined" ? ev : (typeof event !== "undefined" ? event : null)),',
          indent + '      (typeof btn !== "undefined" ? btn : (typeof target !== "undefined" ? target : (typeof el !== "undefined" ? el : null))),',
          indent + '      "' + a + '"',
          indent + '    );',
          indent + '  }',
          indent + '  return;'
        ].join('\n');
      }))
      .concat([
        indent + '// AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_ACTION_ROUTE_END'
      ])
      .join('\n');

    return text.slice(0, caseMatch.index) + routeBlock + text.slice(caseMatch.index);
  }

  throw new Error('ACTION_ROUTE_INSERT_POINT_NOT_FOUND: pmlw-major-leader-handoff route was not found in if/case form');
}

function patchRenderer(text) {
  const fn = findFunctionRange(text, 'renderPmlwMajorRowsBaseAxuR1B');
  let body = fn.text;

  if (body.includes(rendererMarker)) return text;

  const originalBody = body;

  const returnTableRe = /(\n\s*)return\s+\[\s*\n(\s*)'<div class="aicm-table-wrap">',/m;
  const returnMatch = returnTableRe.exec(body);
  if (!returnMatch) {
    throw new Error('RENDERER_TABLE_RETURN_POINT_NOT_FOUND');
  }

  const indent = returnMatch[1];
  const itemIndent = returnMatch[2];

  const beforeReturn = [
    indent + '// ' + rendererMarker,
    indent + 'var v10lC1bSelectionState = typeof aicmV10lC1bMajorSelectionState === "function"',
    indent + '  ? aicmV10lC1bMajorSelectionState()',
    indent + '  : { selectedIds: {}, confirm: null };',
    indent + 'var v10lC1bSelectedIds = v10lC1bSelectionState.selectedIds || {};',
    indent + 'var v10lC1bEligibleCount = rows.filter(function (row) {',
    indent + '  return typeof aicmV10lC1bIsPendingMajorRow === "function" ? aicmV10lC1bIsPendingMajorRow(row) : true;',
    indent + '}).length;',
    indent + 'var v10lC1bSelectedCount = rows.filter(function (row) {',
    indent + '  var id = typeof aicmV10lC1bMajorId === "function" ? aicmV10lC1bMajorId(row) : aicmAxuR1MajorId(row);',
    indent + '  return !!(id && v10lC1bSelectedIds[id]);',
    indent + '}).length;',
    indent + 'var v10lC1bConfirm = v10lC1bSelectionState.confirm || null;',
    indent + 'var v10lC1bConfirmHtml = "";',
    indent + 'if (v10lC1bConfirm && Array.isArray(v10lC1bConfirm.items) && v10lC1bConfirm.items.length) {',
    indent + '  v10lC1bConfirmHtml = [',
    indent + '    \'<div class="aicm-core-card" data-v10l-c1b-confirm="1" style="margin-top:12px;border:1px solid #f59e0b;">\',',
    indent + '    \'  <p class="aicm-eyebrow">確認</p>\',',
    indent + '    \'  <h3>\' + escapeHtml(v10lC1bConfirm.title || "確認") + \'</h3>\',',
    indent + '    \'  <ul class="aicm-selected-note">\' + v10lC1bConfirm.items.map(function (item) { return \'<li>\' + escapeHtml(item.title || item.id || "Manager大項目") + \'</li>\'; }).join("") + \'</ul>\',',
    indent + '    \'  <div class="aicm-dashboard-action-row">\',',
    indent + '    \'    <button type="button" data-core-action="v10l-c1b-major-confirm-yes">Yes</button>\',',
    indent + '    \'    <button type="button" data-core-action="v10l-c1b-major-confirm-no">No</button>\',',
    indent + '    \'  </div>\',',
    indent + '    \'  <p class="aicm-selected-note">V10L-C1BではYes押下時もDB更新/API POSTは実行しません。</p>\',',
    indent + '    \'</div>\'',
    indent + '  ].join("");',
    indent + '}',
    '',
    indent + 'return [',
    itemIndent + '\'<!-- AICM_V10L_C1B_MINIMAL_RENDERER_PATCH_RENDERER -->\',',
    itemIndent + '\'<div class="aicm-core-card" data-v10l-c1b-major-operation-panel="1" style="margin-bottom:12px;">\',',
    itemIndent + '\'  <p class="aicm-eyebrow">登録済み大項目 操作</p>\',',
    itemIndent + '\'  <h3>選択操作</h3>\',',
    itemIndent + '\'  <p class="aicm-selected-note">選択 \' + String(v10lC1bSelectedCount) + \' / 未送信 \' + String(v10lC1bEligibleCount) + \' / 全件 \' + String(rows.length) + \'</p>\',',
    itemIndent + '\'  <div class="aicm-dashboard-action-row">\',',
    itemIndent + '\'    <button type="button" data-core-action="v10l-c1b-major-open-handoff-confirm">課長へ送る</button>\',',
    itemIndent + '\'    <button type="button" data-core-action="v10l-c1b-major-open-delete-confirm">削除</button>\',',
    itemIndent + '\'    <button type="button" data-core-action="v10l-c1b-major-select-all">全件選択</button>\',',
    itemIndent + '\'    <button type="button" data-core-action="v10l-c1b-major-clear">解除</button>\',',
    itemIndent + '\'  </div>\',',
    itemIndent + 'v10lC1bConfirmHtml,',
    itemIndent + '\'</div>\',',
    itemIndent + '\'<div class="aicm-table-wrap">\','
  ].join('\n');

  body = body.replace(returnTableRe, beforeReturn);

  body = body.replace(
    /'        <th>操作<\/th>',/,
    '\'        <th>選択</th>\','
  );

  const rowsMapRe = /(\n\s*)rows\.map\(function \(row\) \{\s*\n(\s*)return \[/m;
  const rowsMapMatch = rowsMapRe.exec(body);
  if (!rowsMapMatch) {
    throw new Error('ROWS_MAP_INSERT_POINT_NOT_FOUND');
  }

  body = body.replace(rowsMapRe, [
    rowsMapMatch[1] + 'rows.map(function (row) {',
    rowsMapMatch[2] + 'var v10lC1bMajorId = typeof aicmV10lC1bMajorId === "function" ? aicmV10lC1bMajorId(row) : aicmAxuR1MajorId(row);',
    rowsMapMatch[2] + 'var v10lC1bSelectable = typeof aicmV10lC1bIsPendingMajorRow === "function" ? aicmV10lC1bIsPendingMajorRow(row) : true;',
    rowsMapMatch[2] + 'var v10lC1bCheckedAttr = v10lC1bMajorId && v10lC1bSelectedIds[v10lC1bMajorId] ? " checked" : "";',
    rowsMapMatch[2] + 'var v10lC1bDisabledAttr = v10lC1bSelectable ? "" : " disabled";',
    rowsMapMatch[2] + 'return ['
  ].join('\n'));

  const oldActionCellRe = /(\n\s*)'        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' \+ escapeHtml\(aicmAxuR1MajorId\(row\)\) \+ '">課長へ送る<\/button><\/td>',/m;
  const actionMatch = oldActionCellRe.exec(body);
  if (!actionMatch) {
    throw new Error('OLD_INDIVIDUAL_LEADER_HANDOFF_CELL_NOT_FOUND');
  }

  body = body.replace(
    oldActionCellRe,
    actionMatch[1] + '\'        <td><label class="aicm-selected-note"><input type="checkbox" data-core-action="v10l-c1b-major-toggle" data-pmlw-major-id="\' + escapeHtml(v10lC1bMajorId) + \'"\' + v10lC1bCheckedAttr + v10lC1bDisabledAttr + \'> 選択</label></td>\','
  );

  if (body === originalBody) {
    throw new Error('RENDERER_BODY_UNCHANGED');
  }

  return text.slice(0, fn.start) + body + text.slice(fn.close + 1);
}

src = insertHelper(src);
src = insertActionRoute(src);
src = patchRenderer(src);

const afterFn = findFunctionRange(src, 'renderPmlwMajorRowsBaseAxuR1B');
fs.writeFileSync(extractOut, afterFn.text + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C1B verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=NO');
verify.push('');
verify.push('HELPER_MARKER_COUNT=' + count(src, helperMarker));
verify.push('ROUTE_MARKER_COUNT=' + count(src, routeMarker));
verify.push('RENDERER_MARKER_COUNT=' + count(src, rendererMarker));
verify.push('B1I_MARKER_COUNT=' + count(src, 'AICM_V10L_B1I'));
verify.push('B1J_MARKER_COUNT=' + count(src, 'AICM_V10L_B1J'));
verify.push('C1_MARKER_COUNT=' + count(src, 'AICM_V10L_C1'));
verify.push('NEW_TOGGLE_ACTION_COUNT=' + count(src, 'v10l-c1b-major-toggle'));
verify.push('NEW_SELECT_ALL_ACTION_COUNT=' + count(src, 'v10l-c1b-major-select-all'));
verify.push('NEW_HANDOFF_CONFIRM_ACTION_COUNT=' + count(src, 'v10l-c1b-major-open-handoff-confirm'));
verify.push('NEW_DELETE_CONFIRM_ACTION_COUNT=' + count(src, 'v10l-c1b-major-open-delete-confirm'));
verify.push('TARGET_FUNCTION_LINES=' + afterFn.startLine + '-' + afterFn.endLine);
verify.push('TARGET_FUNCTION_OLD_INDIVIDUAL_BUTTON_COUNT=' + count(afterFn.text, 'data-core-action="pmlw-major-leader-handoff"'));
verify.push('TARGET_FUNCTION_CHECKBOX_COUNT=' + count(afterFn.text, 'type="checkbox"'));
verify.push('');

if (count(src, helperMarker) !== 1) throw new Error('HELPER_MARKER_COUNT_NOT_1');
if (count(src, routeMarker) !== 1) throw new Error('ROUTE_MARKER_COUNT_NOT_1');
if (count(src, rendererMarker) < 1) throw new Error('RENDERER_MARKER_COUNT_LESS_THAN_1');
if (count(afterFn.text, 'data-core-action="pmlw-major-leader-handoff"') !== 0) throw new Error('TARGET_FUNCTION_STILL_HAS_INDIVIDUAL_LEADER_HANDOFF_BUTTON');
if (count(afterFn.text, 'type="checkbox"') < 1) throw new Error('TARGET_FUNCTION_CHECKBOX_NOT_FOUND');

fs.writeFileSync(verifyOut, verify.join('\n'));

fs.writeFileSync(corePath, src);
