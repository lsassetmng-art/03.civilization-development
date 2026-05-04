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
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2B_PAYLOAD_VALIDATION';

if (!src.includes('AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_HELPER_START')) {
  throw new Error('C1F_HELPER_NOT_FOUND');
}

if (!src.includes('AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_ACTION_ROUTE_START')) {
  throw new Error('C1F_ACTION_ROUTE_NOT_FOUND');
}

function replaceFunction(text, name, replacement) {
  const fn = findFunctionRange(text, name);
  return text.slice(0, fn.start) + replacement + text.slice(fn.close + 1);
}

function insertBeforeFunction(text, name, block) {
  if (text.includes(marker + '_HELPERS_START')) return text;
  const fn = findFunctionRange(text, name);
  return text.slice(0, fn.start) + block + '\n' + text.slice(fn.start);
}

const helperBlock = `
  // ${marker}_HELPERS_START
  // C2B is validation/payload preview only. DB_WRITE=NO / API_POST=NO.
  function aicmR8zC2bText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8zC2bFirstText(row, keys) {
    row = row && typeof row === "object" ? row : {};
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (row[key] !== null && typeof row[key] !== "undefined" && String(row[key]).trim() !== "") {
        return String(row[key]).trim();
      }
    }
    return "";
  }

  function aicmR8zC2bOwnerId(row) {
    row = row && typeof row === "object" ? row : {};

    return aicmR8zC2bText(
      row.owner_civilization_id ||
      row.ownerCivilizationId ||
      (state && state.ownerCivilizationId) ||
      (state && state.owner_civilization_id) ||
      (state && state.context && state.context.owner_civilization_id) ||
      (state && state.context && state.context.ownerCivilizationId) ||
      "00000000-0000-4000-8000-000000000001"
    );
  }

  function aicmR8zC2bLeaderRoute(row) {
    row = row && typeof row === "object" ? row : {};

    var leaderPlacementId = aicmR8zC2bFirstText(row, [
      "leader_placement_id",
      "assigned_leader_placement_id",
      "leader_robot_placement_id",
      "responsible_leader_placement_id"
    ]);

    var leaderId = aicmR8zC2bFirstText(row, [
      "assigned_leader_id",
      "leader_id",
      "leader_robot_id",
      "responsible_leader_id"
    ]);

    var leaderLabel = aicmR8zC2bFirstText(row, [
      "assigned_leader_label",
      "leader_robot_label",
      "responsible_robot_label",
      "responsible_role_code",
      "leader_label"
    ]);

    var sectionId = aicmR8zC2bFirstText(row, [
      "section_id",
      "aicm_section_id",
      "organization_id",
      "department_section_id"
    ]);

    var sectionLabel = aicmR8zC2bFirstText(row, [
      "section_name",
      "section_label",
      "organization_name",
      "organization_label"
    ]);

    var departmentId = aicmR8zC2bFirstText(row, [
      "department_id",
      "aicm_department_id"
    ]);

    var departmentLabel = aicmR8zC2bFirstText(row, [
      "department_name",
      "department_label"
    ]);

    var clear = !!(leaderPlacementId || leaderId || leaderLabel) && !!(sectionId || sectionLabel);

    return {
      clear: clear,
      leaderPlacementId: leaderPlacementId,
      leaderId: leaderId,
      leaderLabel: leaderLabel,
      sectionId: sectionId,
      sectionLabel: sectionLabel,
      departmentId: departmentId,
      departmentLabel: departmentLabel,
      displayLeader: leaderLabel || leaderPlacementId || leaderId || "",
      displaySection: sectionLabel || sectionId || "",
      displayDepartment: departmentLabel || departmentId || ""
    };
  }

  function aicmR8zC2bBuildLeaderHandoffPayload(row, index) {
    row = row && typeof row === "object" ? row : {};

    var majorId = typeof aicmR8zMgrMajorCardRowId === "function"
      ? aicmR8zMgrMajorCardRowId(row, index)
      : "";

    var route = aicmR8zC2bLeaderRoute(row);

    var payload = {
      owner_civilization_id: aicmR8zC2bOwnerId(row),
      aicm_manager_major_work_item_id: majorId,
      assigned_leader_label: route.displayLeader,
      decomposition_status_code: "assigned_to_leader",
      handoff_status_code: "handed_off",
      note: aicmR8zC2bText(row.note || "")
    };

    if (route.sectionId) payload.section_id = route.sectionId;
    if (route.leaderPlacementId) payload.leader_placement_id = route.leaderPlacementId;
    if (route.leaderId) payload.assigned_leader_id = route.leaderId;

    return payload;
  }

  function aicmR8zC2bValidateLeaderHandoffRows(rows) {
    rows = Array.isArray(rows) ? rows : [];

    var errors = [];
    var items = [];
    var payloads = [];

    if (!rows.length) {
      errors.push("対象の大項目を選択してください。");
    }

    rows.forEach(function (row, index) {
      var title = typeof aicmR8zMgrMajorCardTitle === "function"
        ? aicmR8zMgrMajorCardTitle(row)
        : "Manager大項目";

      var id = typeof aicmR8zMgrMajorCardRowId === "function"
        ? aicmR8zMgrMajorCardRowId(row, index)
        : "";

      var route = aicmR8zC2bLeaderRoute(row);
      var selectable = typeof aicmR8zMgrMajorCardIsSelectable === "function"
        ? aicmR8zMgrMajorCardIsSelectable(row)
        : true;

      if (!id) {
        errors.push(title + ": Manager大項目IDを特定できません。");
      }

      if (!selectable) {
        errors.push(title + ": すでに引渡し済み、完了、削除、または対象外です。");
      }

      if (!route.clear) {
        errors.push(title + ": 引き渡し先の課/Leaderが未確定です。");
      }

      var payload = aicmR8zC2bBuildLeaderHandoffPayload(row, index);

      items.push({
        id: id,
        title: title,
        route: route,
        payload: payload
      });

      payloads.push(payload);
    });

    return {
      ok: errors.length === 0,
      errors: errors,
      items: items,
      payloads: payloads,
      endpoint: "/api/aicm/v2/manager-major/update"
    };
  }
  // ${marker}_HELPERS_END
`;

const renderConfirmReplacement = `
  function aicmR8zMgrMajorCardRenderConfirm() {
    var bag = aicmR8zMgrMajorCardState();
    var confirm = bag.confirm || null;

    if (!confirm || !Array.isArray(confirm.items) || !confirm.items.length) {
      return "";
    }

    var errors = Array.isArray(confirm.errors) ? confirm.errors : [];
    var payloads = Array.isArray(confirm.payloads) ? confirm.payloads : [];
    var hasErrors = errors.length > 0;
    var yesDisabled = hasErrors ? " disabled" : "";

    var routeHtml = confirm.items.map(function (item) {
      var route = item.route || {};
      return [
        '<li>',
        '<strong>' + escapeHtml(item.title || item.id || "Manager大項目") + '</strong>',
        '<div class="aicm-selected-note">部門: ' + escapeHtml(route.displayDepartment || "-") + '</div>',
        '<div class="aicm-selected-note">課: ' + escapeHtml(route.displaySection || "-") + '</div>',
        '<div class="aicm-selected-note">Leader: ' + escapeHtml(route.displayLeader || "-") + '</div>',
        '</li>'
      ].join("");
    }).join("");

    var errorHtml = hasErrors
      ? '<div class="aicm-core-card" style="border:1px solid #ef4444;background:#fff7f7;margin:12px 0;"><p class="aicm-eyebrow">実行前チェック</p><ul class="aicm-selected-note">' + errors.map(function (message) { return '<li>' + escapeHtml(message) + '</li>'; }).join("") + '</ul></div>'
      : '<p class="aicm-selected-note">実行前チェックOK。次工程でAPI POST解放前に佐藤(DB担当)レビューが必要です。</p>';

    var payloadPreviewHtml = payloads.length
      ? '<details class="aicm-selected-note" style="margin-top:12px;"><summary>payload preview（POST未実行）</summary><pre style="white-space:pre-wrap;max-height:240px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + escapeHtml(JSON.stringify(payloads, null, 2)) + '</pre></details>'
      : "";

    return [
      '<div class="aicm-core-card" data-r8z-mgr-major-confirm="1" style="margin-top:12px;border:1px solid #f59e0b;">',
      '  <p class="aicm-eyebrow">確認</p>',
      '  <h3>' + escapeHtml(confirm.title || "確認") + '</h3>',
      '  <p class="aicm-selected-note">endpoint: ' + escapeHtml(confirm.endpoint || "/api/aicm/v2/manager-major/update") + '</p>',
      '  <ul class="aicm-selected-note">' + routeHtml + '</ul>',
      errorHtml,
      payloadPreviewHtml,
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-mgr-major-card-confirm-yes"' + yesDisabled + '>Yes</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-confirm-no">No</button>',
      '  </div>',
      '  <p class="aicm-selected-note">この確認画面ではDB更新/API POSTは実行しません。</p>',
      '</div>'
    ].join("");
  }
`;

const openConfirmReplacement = `
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

    var validation = kind === "leader-handoff" && typeof aicmR8zC2bValidateLeaderHandoffRows === "function"
      ? aicmR8zC2bValidateLeaderHandoffRows(rows)
      : {
          ok: true,
          errors: [],
          items: rows.map(function (row, index) {
            return {
              id: aicmR8zMgrMajorCardRowId(row, index),
              title: aicmR8zMgrMajorCardTitle(row),
              route: {},
              payload: {}
            };
          }),
          payloads: [],
          endpoint: ""
        };

    bag.confirm = {
      kind: kind,
      title: kind === "delete" ? "削除確認" : "課長へ送る確認",
      endpoint: validation.endpoint || "/api/aicm/v2/manager-major/update",
      ok: validation.ok,
      errors: validation.errors || [],
      items: validation.items || [],
      payloads: validation.payloads || []
    };

    if (typeof setMessage === "function") {
      if (validation.ok) {
        setMessage("ok", "確認画面を表示しました。");
      } else {
        setMessage("error", "実行前チェックで確認が必要な項目があります。");
      }
    }

    aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_open_c2b");
  }
`;

src = insertBeforeFunction(src, 'aicmR8zMgrMajorCardRenderConfirm', helperBlock);
src = replaceFunction(src, 'aicmR8zMgrMajorCardRenderConfirm', renderConfirmReplacement);
src = replaceFunction(src, 'aicmR8zMgrMajorCardOpenConfirm', openConfirmReplacement);

const handleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');
let handleText = handleFn.text;

if (!handleText.includes(marker + '_CONFIRM_YES_VALIDATION_GUARD')) {
  const oldNeedle = 'if (action === "r8z-mgr-major-card-confirm-yes") {';
  const idx = handleText.indexOf(oldNeedle);

  if (idx < 0) {
    throw new Error('CONFIRM_YES_BRANCH_NOT_FOUND');
  }

  const insertPos = idx + oldNeedle.length;

  const guard = `
        // ${marker}_CONFIRM_YES_VALIDATION_GUARD
        if (bag.confirm && Array.isArray(bag.confirm.errors) && bag.confirm.errors.length) {
          if (typeof setMessage === "function") {
            setMessage("error", "実行前チェックが未解決のため、Yesは実行できません。");
          }
          aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_yes_blocked_c2b");
          return;
        }
`;

  handleText = handleText.slice(0, insertPos) + guard + handleText.slice(insertPos);
  src = src.slice(0, handleFn.start) + handleText + src.slice(handleFn.close + 1);
}

const renderConfirmFn = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');
const openConfirmFn = findFunctionRange(src, 'aicmR8zMgrMajorCardOpenConfirm');
const validateFn = findFunctionRange(src, 'aicmR8zC2bValidateLeaderHandoffRows');
const payloadFn = findFunctionRange(src, 'aicmR8zC2bBuildLeaderHandoffPayload');
const newHandleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');

const extract = [];
extract.push('AICompanyManager V10L-C2B helper extracts');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2bBuildLeaderHandoffPayload');
extract.push(payloadFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2bValidateLeaderHandoffRows');
extract.push(validateFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zMgrMajorCardRenderConfirm');
extract.push(renderConfirmFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zMgrMajorCardOpenConfirm');
extract.push(openConfirmFn.text);
extract.push('');
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2B verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=NO');
verify.push('');
verify.push('C2B_HELPER_MARKER_COUNT=' + count(src, marker + '_HELPERS_START'));
verify.push('C2B_VALIDATE_FUNCTION_COUNT=' + count(src, 'function aicmR8zC2bValidateLeaderHandoffRows'));
verify.push('C2B_PAYLOAD_FUNCTION_COUNT=' + count(src, 'function aicmR8zC2bBuildLeaderHandoffPayload'));
verify.push('C2B_RENDER_CONFIRM_ENDPOINT_COUNT=' + count(renderConfirmFn.text, 'endpoint:'));
verify.push('C2B_RENDER_CONFIRM_PAYLOAD_PREVIEW_COUNT=' + count(renderConfirmFn.text, 'payload preview'));
verify.push('C2B_CONFIRM_YES_GUARD_COUNT=' + count(newHandleFn.text, marker + '_CONFIRM_YES_VALIDATION_GUARD'));
verify.push('C2B_POST_NOT_UNLOCKED_COPY_COUNT=' + count(renderConfirmFn.text, 'DB更新/API POSTは実行しません'));
verify.push('FETCH_COUNT_IN_C2B_HELPERS=' + count(validateFn.text + payloadFn.text + openConfirmFn.text + renderConfirmFn.text, 'fetch('));
verify.push('ENDPOINT_CANDIDATE_COUNT=' + count(src, '/api/aicm/v2/manager-major/update'));

if (count(src, marker + '_HELPERS_START') !== 1) throw new Error('C2B_HELPER_MARKER_COUNT_NOT_1');
if (count(src, 'function aicmR8zC2bValidateLeaderHandoffRows') !== 1) throw new Error('VALIDATE_FUNCTION_COUNT_NOT_1');
if (count(src, 'function aicmR8zC2bBuildLeaderHandoffPayload') !== 1) throw new Error('PAYLOAD_FUNCTION_COUNT_NOT_1');
if (count(newHandleFn.text, marker + '_CONFIRM_YES_VALIDATION_GUARD') !== 1) throw new Error('CONFIRM_YES_GUARD_COUNT_NOT_1');
if (count(renderConfirmFn.text, 'payload preview') < 1) throw new Error('PAYLOAD_PREVIEW_MISSING');
if (count(renderConfirmFn.text, 'DB更新/API POSTは実行しません') < 1) throw new Error('NO_POST_COPY_MISSING');
if (count(validateFn.text + payloadFn.text + openConfirmFn.text + renderConfirmFn.text, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_C2B_HELPERS');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
fs.writeFileSync(corePath, src);
