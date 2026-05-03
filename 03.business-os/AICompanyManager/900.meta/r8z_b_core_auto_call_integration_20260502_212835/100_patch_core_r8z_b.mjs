import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

let text = fs.readFileSync(corePath, 'utf8');

const MARK = 'AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE';
const START = '// ' + MARK + '_START';
const END = '// ' + MARK + '_END';
const CALL_START = '// ' + MARK + '_CALL_START';
const CALL_END = '// ' + MARK + '_CALL_END';

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function removeMarkedBlock(src, startMarker, endMarker) {
  const s = src.indexOf(startMarker);
  if (s < 0) return src;
  const e = src.indexOf(endMarker, s);
  if (e < 0) throw new Error('marked block end not found: ' + startMarker);
  return src.slice(0, s) + src.slice(e + endMarker.length);
}

function findFunctionRanges(src) {
  const re = /(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\([^)]*\)\s*\{/g;
  const ranges = [];
  let m;

  while ((m = re.exec(src))) {
    const name = m[1];
    const start = m.index;
    const open = src.indexOf('{', start);

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

      if (ch === '{') {
        depth += 1;
        continue;
      }

      if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          ranges.push({
            name,
            start,
            end: i + 1,
            oldText: src.slice(start, i + 1)
          });
          break;
        }
      }
    }
  }

  return ranges;
}

const before = {
  mark: count(text, MARK),
  helper: count(text, 'function aicmRunLeaderAutoDecompositionAfterHandoffR8ZB'),
  route: count(text, '/api/aicm/v2/leader-auto-decomposition/run'),
  managerUpdate: count(text, '/api/aicm/v2/manager-major/update')
};

text = removeMarkedBlock(text, START, END);
text = removeMarkedBlock(text, CALL_START, CALL_END);

if (count(text, 'function aicmRunLeaderAutoDecompositionAfterHandoffR8ZB') > 0) {
  throw new Error('unmarked R8Z-B helper already exists');
}

const helperBlock = String.raw`// AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_START
  function aicmR8ZBText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8ZBOwnerId() {
    if (state && state.ownerCivilizationId) return aicmR8ZBText(state.ownerCivilizationId);
    if (state && state.owner_civilization_id) return aicmR8ZBText(state.owner_civilization_id);
    if (state && state.context && state.context.owner_civilization_id) return aicmR8ZBText(state.context.owner_civilization_id);
    if (typeof aicmHumanReviewOwnerId === "function") {
      try {
        var ownerFromReview = aicmHumanReviewOwnerId();
        if (ownerFromReview) return aicmR8ZBText(ownerFromReview);
      } catch (_) {}
    }
    return "00000000-0000-4000-8000-000000000001";
  }

  function aicmR8ZBCompanyId() {
    if (state && state.selectedCompanyId) return aicmR8ZBText(state.selectedCompanyId);

    try {
      if (typeof selectedCompany === "function") {
        var company = selectedCompany();
        if (company && company.aicm_user_company_id) return aicmR8ZBText(company.aicm_user_company_id);
      }
    } catch (_) {}

    if (state && state.context && state.context.selectedCompanyId) return aicmR8ZBText(state.context.selectedCompanyId);
    if (state && state.context && state.context.aicm_user_company_id) return aicmR8ZBText(state.context.aicm_user_company_id);

    return "";
  }

  function aicmR8ZBAutoMessage(result) {
    var json = result && result.json ? result.json : {};
    var createdMiddle = Number(json.created_leader_middle_count || 0);
    var createdRequirement = Number(json.created_deliverable_requirement_count || 0);
    var createdWorker = Number(json.created_worker_work_unit_count || 0);
    var skipped = Number(json.skipped_count || 0);

    if (createdMiddle || createdRequirement || createdWorker) {
      return "課長へ送信し、Leader中項目/成果物要件/Worker作業単位を自動作成しました。";
    }

    if (skipped) {
      return "課長へ送信しました。Leader自動分解は既存データがあるためスキップしました。";
    }

    return "課長へ送信しました。Leader自動分解の対象はありませんでした。";
  }

  async function aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(majorId) {
    var safeMajorId = aicmR8ZBText(majorId);

    if (!safeMajorId && state && state.managerMajorLeaderHandoffConfirm) {
      safeMajorId = aicmR8ZBText(
        state.managerMajorLeaderHandoffConfirm.majorId ||
        state.managerMajorLeaderHandoffConfirm.aicm_manager_major_work_item_id ||
        state.managerMajorLeaderHandoffConfirm.manager_major_work_item_id
      );
    }

    var companyId = aicmR8ZBCompanyId();
    var ownerId = aicmR8ZBOwnerId();

    if (!safeMajorId) {
      return {
        ok: false,
        message: "Leader自動分解対象のManager大項目IDを特定できません。"
      };
    }

    if (!companyId) {
      return {
        ok: false,
        message: "Leader自動分解対象のAI企業IDを特定できません。"
      };
    }

    try {
      var response = await fetch("/api/aicm/v2/leader-auto-decomposition/run", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          owner_civilization_id: ownerId,
          aicm_user_company_id: companyId,
          aicm_manager_major_work_item_id: safeMajorId,
          mode: "single",
          source_app_ref: "AICompanyManager",
          auto_decomposition_version: "r8z_v1"
        })
      });

      var json = null;
      try {
        json = await response.json();
      } catch (_) {
        json = null;
      }

      if (!response.ok || !json || json.result !== "ok") {
        return {
          ok: false,
          json: json,
          message: json && (json.error_message || json.message || json.error)
            ? String(json.error_message || json.message || json.error)
            : "Leader自動分解APIに失敗しました。"
        };
      }

      return {
        ok: true,
        json: json,
        message: aicmR8ZBAutoMessage({ json: json })
      };
    } catch (error) {
      return {
        ok: false,
        message: error && error.message ? error.message : "Leader自動分解APIに失敗しました。"
      };
    }
  }
// AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_END
`;

const renderAnchor = 'function renderTaskLedgerPlaceholder()';
const renderIdx = text.indexOf(renderAnchor);
if (renderIdx < 0) {
  throw new Error('renderTaskLedgerPlaceholder anchor not found');
}
text = text.slice(0, renderIdx) + helperBlock + '\n\n' + text.slice(renderIdx);

const ranges = findFunctionRanges(text);
const executeRange = ranges.find((range) => {
  return range.oldText.includes('fetch("/api/aicm/v2/manager-major/update"') &&
    range.oldText.includes('decomposition_status_code') &&
    range.oldText.includes('handoff_status_code') &&
    range.oldText.includes('assigned_to_leader') &&
    range.oldText.includes('handed_off');
});

if (!executeRange) {
  throw new Error('leader handoff execute function not found');
}

let fn = executeRange.oldText;
if (!/async\s+function/.test(fn.slice(0, 80))) {
  throw new Error('leader handoff execute function is not async');
}

const reloadAnchor = 'await aicmReloadTaskLedgerContext();';
const reloadIdx = fn.indexOf(reloadAnchor);
if (reloadIdx < 0) {
  throw new Error('reload anchor not found in leader handoff execute function');
}

const callBlock = String.raw`
      // AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_CALL_START
      var aicmR8zBMajorIdForAuto = "";
      try {
        aicmR8zBMajorIdForAuto = aicmR8ZBText(
          (payload && (payload.majorId || payload.aicm_manager_major_work_item_id || payload.manager_major_work_item_id)) || ""
        );
      } catch (_) {
        aicmR8zBMajorIdForAuto = "";
      }

      var aicmR8zBAutoResult = await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmR8zBMajorIdForAuto);
      if (aicmR8zBAutoResult && aicmR8zBAutoResult.ok) {
        setMessage("ok", aicmR8zBAutoResult.message || "課長へ送信し、Leader自動分解を実行しました。");
      } else {
        setMessage(
          "error",
          "課長へ送信しましたが、Leader自動分解に失敗しました: " +
          (aicmR8zBAutoResult && aicmR8zBAutoResult.message ? aicmR8zBAutoResult.message : "原因不明")
        );
      }
      // AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_CALL_END

`;

fn = fn.slice(0, reloadIdx) + callBlock + fn.slice(reloadIdx);

text = text.slice(0, executeRange.start) + fn + text.slice(executeRange.end);

const oldConfirmText = "確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、登録済み大項目の未引き継ぎ一覧から外します。";
const newConfirmText = "確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、その後Leader中項目/成果物要件/Worker作業単位を自動作成します。";

if (text.includes(oldConfirmText)) {
  text = text.split(oldConfirmText).join(newConfirmText);
}

const after = {
  mark: count(text, MARK),
  helper: count(text, 'function aicmRunLeaderAutoDecompositionAfterHandoffR8ZB'),
  callStart: count(text, CALL_START),
  callEnd: count(text, CALL_END),
  route: count(text, '/api/aicm/v2/leader-auto-decomposition/run'),
  managerUpdate: count(text, '/api/aicm/v2/manager-major/update'),
  confirmTextUpdated: text.includes(newConfirmText)
};

if (after.mark < 4) throw new Error('R8Z-B markers missing: ' + JSON.stringify(after));
if (after.helper !== 1) throw new Error('R8Z-B helper count invalid: ' + after.helper);
if (after.callStart !== 1 || after.callEnd !== 1) throw new Error('R8Z-B call marker count invalid');
if (after.route < 1) throw new Error('leader-auto-decomposition route not referenced');
if (after.managerUpdate < 1) throw new Error('manager-major update route missing');

fs.writeFileSync(corePath, text, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  before,
  after,
  core_file_write: 'YES',
  server_file_write: 'NO',
  api_post: 'NO',
  db_write: 'NO',
  persistent_db_write: 'NO'
}, null, 2));
