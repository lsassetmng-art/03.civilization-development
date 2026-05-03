import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

let text = fs.readFileSync(corePath, 'utf8');

const MARK = 'AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL';
const START = '// ' + MARK + '_START';
const END = '// ' + MARK + '_END';

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

function findFunctionRange(src, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{', 'm');
  const m = re.exec(src);
  if (!m) throw new Error('function not found: ' + name);

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
        return {
          start,
          end: i + 1,
          oldText: src.slice(start, i + 1)
        };
      }
    }
  }

  throw new Error('closing brace not found: ' + name);
}

const before = {
  mark: count(text, MARK),
  outputPanel: count(text, 'aicmRenderPmlwAutoOutputsPanelR8ZC'),
  renderTaskLedger: count(text, 'function renderTaskLedgerPlaceholder')
};

text = removeMarkedBlock(text, START, END);

if (count(text, 'function aicmRenderPmlwAutoOutputsPanelR8ZC') > 0) {
  throw new Error('unmarked output panel helper already exists');
}

const range = findFunctionRange(text, 'renderTaskLedgerPlaceholder');

const helperBlock = String.raw`
// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_START
  function aicmR8ZCText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8ZCHtml(value) {
    if (typeof escapeHtml === "function") return escapeHtml(aicmR8ZCText(value));
    return aicmR8ZCText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function aicmR8ZCContextArray(names) {
    var ctx = state && state.context && typeof state.context === "object" ? state.context : {};
    for (var i = 0; i < names.length; i += 1) {
      var key = names[i];
      if (Array.isArray(ctx[key])) return ctx[key];
      if (Array.isArray(state && state[key])) return state[key];
    }
    return [];
  }

  function aicmR8ZCSelectedCompanyId() {
    if (state && state.selectedCompanyId) return aicmR8ZCText(state.selectedCompanyId);

    try {
      if (typeof selectedCompany === "function") {
        var company = selectedCompany();
        if (company && company.aicm_user_company_id) return aicmR8ZCText(company.aicm_user_company_id);
      }
    } catch (_) {}

    return "";
  }

  function aicmR8ZCCompanyRows(rows) {
    var companyId = aicmR8ZCSelectedCompanyId();
    var source = Array.isArray(rows) ? rows : [];

    if (!companyId) return source;

    return source.filter(function (row) {
      return aicmR8ZCText(row && row.aicm_user_company_id) === companyId;
    });
  }

  function aicmR8ZCOutputRows() {
    return {
      middles: aicmR8ZCCompanyRows(aicmR8ZCContextArray([
        "pmlw_middle_items",
        "pmlwMiddleItems",
        "leader_middle_items",
        "leaderMiddleItems"
      ])),
      requirements: aicmR8ZCCompanyRows(aicmR8ZCContextArray([
        "pmlw_deliverable_requirements",
        "pmlwDeliverableRequirements",
        "deliverable_requirements",
        "deliverableRequirements"
      ])),
      workers: aicmR8ZCCompanyRows(aicmR8ZCContextArray([
        "pmlw_worker_work_units",
        "pmlwWorkerWorkUnits",
        "worker_work_units",
        "workerWorkUnits"
      ]))
    };
  }

  function aicmR8ZCStatusText(row, names) {
    for (var i = 0; i < names.length; i += 1) {
      var value = aicmR8ZCText(row && row[names[i]]);
      if (value) return value;
    }
    return "-";
  }

  function aicmRenderPmlwRequirementRowsR8ZC(rows) {
    var list = Array.isArray(rows) ? rows.slice(0, 8) : [];

    if (!list.length) {
      return '<p class="aicm-core-empty">成果物要件はまだありません。課長へ送る確定後、Leader自動分解が成功するとここに出ます。</p>';
    }

    return [
      '<div class="aicm-ledger-list">',
      list.map(function (row) {
        var name = aicmR8ZCStatusText(row, ["deliverable_name", "requirement_name", "title"]);
        var type = aicmR8ZCStatusText(row, ["deliverable_type_code", "deliverable_type"]);
        var status = aicmR8ZCStatusText(row, ["requirement_status_code", "status_code"]);
        var priority = aicmR8ZCStatusText(row, ["priority_code"]);
        var due = aicmR8ZCStatusText(row, ["due_date"]);
        var desc = aicmR8ZCStatusText(row, ["deliverable_description", "description", "required_quality_text"]);

        return [
          '<article class="aicm-ledger-row">',
          '  <div class="aicm-ledger-row-head"><strong>' + aicmR8ZCHtml(name) + '</strong><em>' + aicmR8ZCHtml(status) + '</em></div>',
          '  <dl class="aicm-ledger-meta">',
          '    <div><dt>種類</dt><dd>' + aicmR8ZCHtml(type) + '</dd></div>',
          '    <div><dt>優先度</dt><dd>' + aicmR8ZCHtml(priority) + '</dd></div>',
          '    <div><dt>期限</dt><dd>' + aicmR8ZCHtml(due) + '</dd></div>',
          '    <div><dt>出力先</dt><dd>成果物要件</dd></div>',
          '  </dl>',
          desc && desc !== "-" ? '  <p class="aicm-ledger-note">' + aicmR8ZCHtml(desc) + '</p>' : '',
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }

  function aicmRenderPmlwWorkerRowsR8ZC(rows) {
    var list = Array.isArray(rows) ? rows.slice(0, 8) : [];

    if (!list.length) {
      return '<p class="aicm-core-empty">Worker作業単位はまだありません。成果物要件と同時に自動作成されます。</p>';
    }

    return [
      '<div class="aicm-ledger-list">',
      list.map(function (row) {
        var name = aicmR8ZCStatusText(row, ["work_unit_name", "task_name", "title"]);
        var worker = aicmR8ZCStatusText(row, ["assigned_worker_label", "worker_label"]);
        var model = aicmR8ZCStatusText(row, ["worker_model_code", "aiworker_model_code", "model_code"]);
        var status = aicmR8ZCStatusText(row, ["work_status_code", "status_code"]);
        var review = aicmR8ZCStatusText(row, ["review_status_code"]);
        var desc = aicmR8ZCStatusText(row, ["work_unit_description", "description", "expected_output_text"]);

        return [
          '<article class="aicm-ledger-row">',
          '  <div class="aicm-ledger-row-head"><strong>' + aicmR8ZCHtml(name) + '</strong><em>' + aicmR8ZCHtml(status) + '</em></div>',
          '  <dl class="aicm-ledger-meta">',
          '    <div><dt>Worker</dt><dd>' + aicmR8ZCHtml(worker) + '</dd></div>',
          '    <div><dt>モデル</dt><dd>' + aicmR8ZCHtml(model) + '</dd></div>',
          '    <div><dt>レビュー</dt><dd>' + aicmR8ZCHtml(review) + '</dd></div>',
          '    <div><dt>出力先</dt><dd>Worker作業単位</dd></div>',
          '  </dl>',
          desc && desc !== "-" ? '  <p class="aicm-ledger-note">' + aicmR8ZCHtml(desc) + '</p>' : '',
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }

  function aicmRenderPmlwAutoOutputsPanelR8ZC() {
    var rows = aicmR8ZCOutputRows();
    var middleCount = rows.middles.length;
    var reqCount = rows.requirements.length;
    var workerCount = rows.workers.length;

    return [
      '<section class="aicm-core-card aicm-r8z-output-panel">',
      '  <p class="aicm-eyebrow">Leader以降の出力</p>',
      '  <h2>成果物要件 / Worker作業単位</h2>',
      '  <p class="aicm-selected-note">実ファイルの成果物ではなく、まず成果物要件とWorker作業単位が自動作成されます。Worker実行後の実成果物はレビュー・承認待ち一覧やhandoff_link側に出す流れです。</p>',
      '  <dl class="aicm-overview-count-row">',
      '    <div><dt>Leader中項目</dt><dd>' + aicmR8ZCHtml(String(middleCount)) + '</dd></div>',
      '    <div><dt>成果物要件</dt><dd>' + aicmR8ZCHtml(String(reqCount)) + '</dd></div>',
      '    <div><dt>Worker作業単位</dt><dd>' + aicmR8ZCHtml(String(workerCount)) + '</dd></div>',
      '  </dl>',
      '  <section class="aicm-csv-template" open>',
      '    <h3>成果物要件</h3>',
      aicmRenderPmlwRequirementRowsR8ZC(rows.requirements),
      '  </section>',
      '  <section class="aicm-csv-template" open>',
      '    <h3>Worker作業単位</h3>',
      aicmRenderPmlwWorkerRowsR8ZC(rows.workers),
      '  </section>',
      '</section>'
    ].join("");
  }

  function aicmInjectPmlwAutoOutputsPanelR8ZC(html) {
    var panel = aicmRenderPmlwAutoOutputsPanelR8ZC();
    var source = String(html || "");

    if (source.indexOf('</main>') >= 0) {
      return source.replace('</main>', panel + '</main>');
    }

    return source + panel;
  }

  var aicmRenderTaskLedgerPlaceholderBeforeR8ZC = renderTaskLedgerPlaceholder;

  renderTaskLedgerPlaceholder = function renderTaskLedgerPlaceholder() {
    return aicmInjectPmlwAutoOutputsPanelR8ZC(
      aicmRenderTaskLedgerPlaceholderBeforeR8ZC()
    );
  };
// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_END
`;

text = text.slice(0, range.end) + helperBlock + text.slice(range.end);

const after = {
  mark: count(text, MARK),
  outputPanel: count(text, 'aicmRenderPmlwAutoOutputsPanelR8ZC'),
  injectPanel: count(text, 'aicmInjectPmlwAutoOutputsPanelR8ZC'),
  wrapper: count(text, 'aicmRenderTaskLedgerPlaceholderBeforeR8ZC'),
  renderTaskLedger: count(text, 'function renderTaskLedgerPlaceholder'),
  labels: count(text, '成果物要件 / Worker作業単位')
};

if (after.mark < 2) throw new Error('R8Z-C markers missing');
if (after.outputPanel < 2) throw new Error('output panel helper missing');
if (after.injectPanel < 2) throw new Error('inject panel helper missing');
if (after.wrapper !== 1) throw new Error('wrapper count invalid: ' + after.wrapper);
if (after.renderTaskLedger < 2) throw new Error('renderTaskLedger wrapper not present');
if (after.labels < 1) throw new Error('UI label missing');

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
