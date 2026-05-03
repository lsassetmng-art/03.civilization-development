import fs from 'node:fs';

const corePath = process.argv[2];
let text = fs.readFileSync(corePath, 'utf8');

function count(src, needle) {
  return src.split(needle).length - 1;
}

const markerStart = '// AICM_R8Z_N_WORKER_RUNTIME_STATUS_PANEL_START';
const markerEnd = '// AICM_R8Z_N_WORKER_RUNTIME_STATUS_PANEL_END';

const before = {
  startMarker: count(text, markerStart),
  endMarker: count(text, markerEnd),
  outputPanelEnd: count(text, '// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_END'),
  cPanelFunction: count(text, 'aicmRenderR8ZCOutputVisibilityPanel'),
  taskLedgerFunction: count(text, 'renderTaskLedgerPlaceholder')
};

if (before.startMarker > 0 || before.endMarker > 0) {
  console.log(JSON.stringify({
    status: 'ALREADY_PRESENT',
    before,
    after: before
  }, null, 2));
  process.exit(0);
}

const insertion = `
${markerStart}
  function aicmR8ZNText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8ZNHtml(value) {
    var text = aicmR8ZNText(value);
    if (typeof escapeHtml === "function") return escapeHtml(text);
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function aicmR8ZNMetadata(row) {
    var meta = row && (row.metadata_jsonb || row.metadata || row.meta) || {};
    if (typeof meta === "string") {
      try {
        meta = JSON.parse(meta);
      } catch (_) {
        meta = {};
      }
    }
    if (!meta || typeof meta !== "object") meta = {};
    return meta;
  }

  function aicmR8ZNDeepGet(source, path) {
    var cur = source;
    for (var i = 0; i < path.length; i += 1) {
      if (!cur || typeof cur !== "object") return "";
      cur = cur[path[i]];
    }
    return cur;
  }

  function aicmR8ZNRowsFromContext() {
    var ctx = state && state.context ? state.context : {};
    var keys = [
      "pmlw_worker_work_units",
      "pmlwWorkerWorkUnits",
      "worker_work_units",
      "workerWorkUnits"
    ];

    for (var i = 0; i < keys.length; i += 1) {
      var rows = ctx[keys[i]];
      if (Array.isArray(rows)) return rows.slice();
    }

    return [];
  }

  function aicmR8ZNRuntimeStatus(row) {
    var meta = aicmR8ZNMetadata(row);
    var runtimeResult = meta.runtime_result || {};
    var runtimeRequest = runtimeResult.runtime_request || {};
    var aiworkerResponse = runtimeResult.aiworker_response || {};

    return {
      requestId: aicmR8ZNText(
        runtimeRequest.request_id ||
        aiworkerResponse.request_id ||
        meta.request_id ||
        ""
      ),
      runtimeResult: aicmR8ZNText(runtimeResult.result || ""),
      aiworkerResult: aicmR8ZNText(aiworkerResponse.result || ""),
      aiworkerStatus: aicmR8ZNText(aiworkerResponse.status || ""),
      sourceRequestRef: aicmR8ZNText(
        runtimeRequest.source_request_ref ||
        meta.source_request_ref ||
        ""
      ),
      idempotencyKey: aicmR8ZNText(
        runtimeRequest.idempotency_key ||
        aiworkerResponse.idempotency_key ||
        ""
      ),
      modelCode: aicmR8ZNText(
        runtimeRequest.model_code ||
        row.worker_model_code ||
        row.model_code ||
        ""
      ),
      autoExecution: aicmR8ZNText(meta.auto_execution || ""),
      autoExecutionVersion: aicmR8ZNText(meta.auto_execution_version || ""),
      startedAt: aicmR8ZNText(meta.started_at || "")
    };
  }

  function aicmR8ZNStatusLabel(row) {
    var work = aicmR8ZNText(row && row.work_status_code);
    var review = aicmR8ZNText(row && row.review_status_code);
    var rt = aicmR8ZNRuntimeStatus(row);

    if (work === "in_progress" && rt.requestId) return "実行依頼済み / 進行中";
    if (work === "in_progress") return "進行中";
    if (work === "todo") return "実行待ち";
    if (work === "done" || work === "completed") return "完了";
    if (work === "review_waiting") return "レビュー待ち";
    if (work === "blocked") return "停止中";
    return work || review || "未設定";
  }

  function aicmR8ZNWorkerRuntimeSummary(rows) {
    var summary = {
      total: rows.length,
      todo: 0,
      inProgress: 0,
      done: 0,
      reviewWaiting: 0,
      autoExecution: 0,
      runtimeOk: 0,
      accepted: 0
    };

    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i] || {};
      var work = aicmR8ZNText(row.work_status_code);
      var rt = aicmR8ZNRuntimeStatus(row);

      if (work === "todo") summary.todo += 1;
      if (work === "in_progress") summary.inProgress += 1;
      if (work === "done" || work === "completed") summary.done += 1;
      if (work === "review_waiting") summary.reviewWaiting += 1;
      if (rt.autoExecution === "worker_runtime_request") summary.autoExecution += 1;
      if (rt.runtimeResult === "ok") summary.runtimeOk += 1;
      if (rt.aiworkerResult === "accepted" || rt.aiworkerStatus === "REQUESTED_INTERNAL_ONLY") summary.accepted += 1;
    }

    return summary;
  }

  function aicmR8ZNSortRows(rows) {
    return rows.slice().sort(function (a, b) {
      var au = aicmR8ZNText(a && a.updated_at);
      var bu = aicmR8ZNText(b && b.updated_at);
      if (au !== bu) return bu.localeCompare(au);

      var ad = Number(a && a.display_order || 0);
      var bd = Number(b && b.display_order || 0);
      return ad - bd;
    });
  }

  function aicmRenderR8ZNWorkerRuntimeStatusPanel() {
    var rows = aicmR8ZNSortRows(aicmR8ZNRowsFromContext());
    var summary = aicmR8ZNWorkerRuntimeSummary(rows);

    var cards = rows.slice(0, 10).map(function (row) {
      var rt = aicmR8ZNRuntimeStatus(row);
      var title = aicmR8ZNText(row && (row.work_unit_name || row.task_title || row.task_name)) || "Worker作業単位";
      var worker = aicmR8ZNText(row && (row.assigned_worker_label || row.worker_label)) || "未割当";
      var model = rt.modelCode || aicmR8ZNText(row && row.worker_model_code) || "-";
      var statusLabel = aicmR8ZNStatusLabel(row);
      var requestId = rt.requestId || "-";
      var accepted = rt.aiworkerStatus || rt.aiworkerResult || "-";
      var sourceRef = rt.sourceRequestRef || "-";
      var updatedAt = aicmR8ZNText(row && row.updated_at) || "-";

      return [
        '<article class="aicm-core-card" style="box-shadow:none;border-radius:16px;padding:14px;">',
        '  <div class="aicm-card-title-row">',
        '    <div>',
        '      <p class="aicm-eyebrow">Worker作業単位</p>',
        '      <h3 style="margin:0;font-size:18px;">' + aicmR8ZNHtml(title) + '</h3>',
        '    </div>',
        '    <strong>' + aicmR8ZNHtml(statusLabel) + '</strong>',
        '  </div>',
        '  <dl class="aicm-overview-list">',
        '    <div><dt>Worker</dt><dd>' + aicmR8ZNHtml(worker) + '</dd></div>',
        '    <div><dt>model</dt><dd>' + aicmR8ZNHtml(model) + '</dd></div>',
        '    <div><dt>request_id</dt><dd>' + aicmR8ZNHtml(requestId) + '</dd></div>',
        '    <div><dt>AIWorkerOS受付</dt><dd>' + aicmR8ZNHtml(accepted) + '</dd></div>',
        '    <div><dt>source_request_ref</dt><dd>' + aicmR8ZNHtml(sourceRef) + '</dd></div>',
        '    <div><dt>updated_at</dt><dd>' + aicmR8ZNHtml(updatedAt) + '</dd></div>',
        '  </dl>',
        '</article>'
      ].join("");
    }).join("");

    if (!rows.length) {
      cards = [
        '<div class="aicm-empty-state">',
        '  <strong>Worker作業単位はまだありません。</strong>',
        '  <p>課長へ送る後、Leader自動分解とWorker作業単位作成が完了するとここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<section id="aicm-r8z-n-worker-runtime-status" class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Worker実行状況</p>',
      '  <h2>AIWorkerOS実行受付状況</h2>',
      '  <p class="aicm-selected-note">Worker作業単位がAIWorkerOS runtimeへ依頼されたか、request_idと受付状態で確認します。ここは表示専用です。</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <span>合計: <strong>' + aicmR8ZNHtml(summary.total) + '</strong></span>',
      '    <span>実行待ち: <strong>' + aicmR8ZNHtml(summary.todo) + '</strong></span>',
      '    <span>進行中: <strong>' + aicmR8ZNHtml(summary.inProgress) + '</strong></span>',
      '    <span>自動実行依頼済み: <strong>' + aicmR8ZNHtml(summary.autoExecution) + '</strong></span>',
      '    <span>runtime ok: <strong>' + aicmR8ZNHtml(summary.runtimeOk) + '</strong></span>',
      '    <span>accepted: <strong>' + aicmR8ZNHtml(summary.accepted) + '</strong></span>',
      '  </div>',
      '  <div class="aicm-dashboard-grid" style="margin-top:14px;">',
      cards,
      '  </div>',
      '</section>'
    ].join("");
  }

  (function aicmInstallR8ZNWorkerRuntimeStatusPanel() {
    try {
      if (typeof aicmRenderR8ZCOutputVisibilityPanel === "function" && !aicmRenderR8ZCOutputVisibilityPanel.__r8znWrapped) {
        var originalR8ZCOutputPanel = aicmRenderR8ZCOutputVisibilityPanel;
        var wrappedR8ZCOutputPanel = function () {
          var baseHtml = "";
          try {
            baseHtml = originalR8ZCOutputPanel.apply(this, arguments) || "";
          } catch (error) {
            baseHtml = [
              '<section class="aicm-core-card">',
              '  <p class="aicm-eyebrow">Leader以降の出力</p>',
              '  <p class="aicm-core-message aicm-core-message-error">Leader以降の出力パネル描画に失敗しました。</p>',
              '</section>'
            ].join("");
          }

          return String(baseHtml || "") + aicmRenderR8ZNWorkerRuntimeStatusPanel();
        };

        wrappedR8ZCOutputPanel.__r8znWrapped = true;
        wrappedR8ZCOutputPanel.__r8znOriginal = originalR8ZCOutputPanel;
        aicmRenderR8ZCOutputVisibilityPanel = wrappedR8ZCOutputPanel;
        return;
      }

      if (typeof renderTaskLedgerPlaceholder === "function" && !renderTaskLedgerPlaceholder.__r8znWrapped) {
        var originalTaskLedgerPlaceholder = renderTaskLedgerPlaceholder;
        var wrappedTaskLedgerPlaceholder = function () {
          var base = originalTaskLedgerPlaceholder.apply(this, arguments);
          return String(base || "") + aicmRenderR8ZNWorkerRuntimeStatusPanel();
        };

        wrappedTaskLedgerPlaceholder.__r8znWrapped = true;
        wrappedTaskLedgerPlaceholder.__r8znOriginal = originalTaskLedgerPlaceholder;
        renderTaskLedgerPlaceholder = wrappedTaskLedgerPlaceholder;
      }
    } catch (error) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("AICM R8Z-N worker runtime status panel install skipped", error);
      }
    }
  })();
${markerEnd}
`;

if (text.includes('// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_END')) {
  text = text.replace(
    '// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_END',
    '// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_END\n\n' + insertion
  );
} else if (text.includes('// Human review queue UI.')) {
  text = text.replace('// Human review queue UI.', insertion + '\n\n// Human review queue UI.');
} else if (text.includes('function renderTaskLedgerPlaceholder')) {
  text = text.replace('function renderTaskLedgerPlaceholder', insertion + '\n\nfunction renderTaskLedgerPlaceholder');
} else {
  throw new Error('No safe insertion anchor found for R8Z-N worker runtime status panel');
}

const after = {
  startMarker: count(text, markerStart),
  endMarker: count(text, markerEnd),
  renderPanelFunction: count(text, 'function aicmRenderR8ZNWorkerRuntimeStatusPanel'),
  installFunction: count(text, 'aicmInstallR8ZNWorkerRuntimeStatusPanel'),
  cPanelFunction: count(text, 'aicmRenderR8ZCOutputVisibilityPanel'),
  taskLedgerFunction: count(text, 'renderTaskLedgerPlaceholder')
};

if (after.startMarker !== 1 || after.endMarker !== 1) {
  throw new Error('R8Z-N marker count invalid: ' + JSON.stringify(after));
}

if (after.renderPanelFunction !== 1) {
  throw new Error('R8Z-N panel function count invalid: ' + after.renderPanelFunction);
}

fs.writeFileSync(corePath, text, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  before,
  after,
  core_file_write: 'YES',
  server_file_write: 'NO',
  db_write: 'NO',
  api_post: 'NO'
}, null, 2));
