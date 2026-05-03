import fs from "fs";

const corePath = process.env.CORE;
if (!corePath) throw new Error("CORE env is required");

let src = fs.readFileSync(corePath, "utf8");
const before = {
  marker: (src.match(/AICM_R8Z_O_PRODUCTION_SUMMARY_UI_START/g) || []).length,
  summaryFn: (src.match(/function\s+aicmRenderManagerMajorSummaryPanelR8U\s*\(/g) || []).length,
  leaderPanelTitle: (src.match(/課長以降は自動処理/g) || []).length,
  outputPanelTitle: (src.match(/成果物要件 \/ Worker作業単位/g) || []).length
};

const startMark = "// AICM_R8Z_O_PRODUCTION_SUMMARY_UI_START";
const endMark = "// AICM_R8Z_O_PRODUCTION_SUMMARY_UI_END";

const ownBlockRe = new RegExp(
  "\\n?" + startMark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?" + endMark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\n?",
  "g"
);
src = src.replace(ownBlockRe, "\n");

function functionSlices(text) {
  const re = /(^|\n)([ \t]*)function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  const matches = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push({ index: m.index + m[1].length, name: m[3] });
  }
  const out = [];
  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    out.push({ name: matches[i].name, body: text.slice(start, end) });
  }
  return out;
}

const slices = functionSlices(src);
const hideNames = [];
for (const fn of slices) {
  const body = fn.body || "";
  if (
    body.includes("課長以降は自動処理") ||
    body.includes("Leader以降自動処理") ||
    body.includes("成果物要件 / Worker作業単位") ||
    body.includes("Leader以降の出力")
  ) {
    if (!hideNames.includes(fn.name)) hideNames.push(fn.name);
  }
}

const overrideHiddenFns = hideNames.map((name) => {
  return [
    "  function " + name + "() {",
    "    return \"\";",
    "  }"
  ].join("\n");
}).join("\n\n");

const block = `
${startMark}
  function aicmR8ZOText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8ZOEscape(value) {
    var text = aicmR8ZOText(value);
    if (typeof escapeHtml === "function") return escapeHtml(text);
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function aicmR8ZOContext() {
    return state && state.context && typeof state.context === "object" ? state.context : {};
  }

  function aicmR8ZOArray() {
    var ctx = aicmR8ZOContext();
    for (var i = 0; i < arguments.length; i += 1) {
      var key = arguments[i];
      if (Array.isArray(ctx[key])) return ctx[key];
      if (state && Array.isArray(state[key])) return state[key];
    }
    return [];
  }

  function aicmR8ZOLower(value) {
    return aicmR8ZOText(value).toLowerCase();
  }

  function aicmR8ZOMajorStatus(row) {
    var handoff = aicmR8ZOLower(row && row.handoff_status_code);
    var decomposition = aicmR8ZOLower(row && row.decomposition_status_code);

    if (
      handoff === "archived" ||
      handoff === "deleted" ||
      decomposition === "archived" ||
      decomposition === "deleted"
    ) {
      return "archived";
    }

    if (
      handoff === "completed" ||
      decomposition === "decomposed" ||
      decomposition === "completed" ||
      decomposition === "complete" ||
      decomposition === "done"
    ) {
      return "manager_completed";
    }

    if (
      decomposition === "leader_decomposing" ||
      decomposition === "worker_assigned" ||
      decomposition === "in_progress"
    ) {
      return "auto_processing";
    }

    if (
      handoff === "handed_off" ||
      handoff === "sent" ||
      decomposition === "assigned_to_leader"
    ) {
      return "auto_waiting";
    }

    if (
      !handoff ||
      !decomposition ||
      handoff === "draft" ||
      handoff === "ready_handoff" ||
      decomposition === "not_started" ||
      decomposition === "draft"
    ) {
      return "unhandoff";
    }

    return "needs_check";
  }

  function aicmR8ZOWorkerStatus(row) {
    var work = aicmR8ZOLower(row && row.work_status_code);
    var review = aicmR8ZOLower(row && row.review_status_code);
    var meta = row && row.metadata_jsonb && typeof row.metadata_jsonb === "object" ? row.metadata_jsonb : {};
    var runtime = meta.runtime_result && typeof meta.runtime_result === "object" ? meta.runtime_result : {};

    if (
      work === "blocked" ||
      work === "returned" ||
      work === "error" ||
      work === "failed" ||
      runtime.result === "error"
    ) {
      return "worker_needs_check";
    }

    if (
      work === "review_waiting" ||
      review === "waiting" ||
      review === "pending"
    ) {
      return "review_waiting";
    }

    if (
      work === "done" ||
      work === "completed" ||
      review === "approved"
    ) {
      return "worker_completed";
    }

    if (
      work === "in_progress" ||
      work === "processing" ||
      work === "requested" ||
      meta.auto_execution === "worker_runtime_request"
    ) {
      return "worker_running";
    }

    if (work === "todo") return "worker_todo";

    return "worker_other";
  }

  function aicmR8ZOCountBy(rows, classifier) {
    var out = {};
    for (var i = 0; i < rows.length; i += 1) {
      var code = classifier(rows[i]);
      out[code] = (out[code] || 0) + 1;
    }
    return out;
  }

  function aicmR8ZOMajorRowsBy(code) {
    return aicmR8ZOArray("pmlw_major_items", "managerMajorItems", "manager_major_items").filter(function(row) {
      return aicmR8ZOMajorStatus(row) === code;
    });
  }

  function aicmR8ZOWorkerRowsBy(code) {
    return aicmR8ZOArray("pmlw_worker_work_units", "pmlwWorkerWorkUnits").filter(function(row) {
      return aicmR8ZOWorkerStatus(row) === code;
    });
  }

  function aicmR8ZOTitle(row) {
    return aicmR8ZOText(
      row && (
        row.major_item_name ||
        row.work_unit_name ||
        row.deliverable_name ||
        row.middle_item_name ||
        row.task_name ||
        row.title
      )
    ) || "項目";
  }

  function aicmR8ZODescription(row) {
    return aicmR8ZOText(
      row && (
        row.major_item_description ||
        row.work_unit_description ||
        row.deliverable_description ||
        row.middle_item_description ||
        row.note ||
        row.expected_output_text
      )
    );
  }

  function aicmR8ZOStatusText(row) {
    var work = aicmR8ZOText(row && row.work_status_code);
    var review = aicmR8ZOText(row && row.review_status_code);
    var handoff = aicmR8ZOText(row && row.handoff_status_code);
    var decomposition = aicmR8ZOText(row && row.decomposition_status_code);

    if (work || review) {
      if (work === "in_progress") return "実行依頼済み / 進行中";
      if (work === "todo") return "実行待ち";
      if (work === "review_waiting") return "レビュー待ち";
      if (work === "done") return "完了";
      return [work, review].filter(Boolean).join(" / ") || "-";
    }

    if (decomposition === "decomposed" || handoff === "completed") return "分解済み";
    if (decomposition === "assigned_to_leader" || handoff === "handed_off") return "自動処理待ち";
    if (decomposition === "not_started" || handoff === "draft") return "未引き継ぎ";
    if (decomposition === "archived" || handoff === "archived") return "削除済み";
    return [decomposition, handoff].filter(Boolean).join(" / ") || "-";
  }

  function aicmR8ZODetailRows(filter) {
    if (filter === "worker_running") return aicmR8ZOWorkerRowsBy("worker_running");
    if (filter === "review_waiting") return aicmR8ZOWorkerRowsBy("review_waiting");
    if (filter === "worker_completed") return aicmR8ZOWorkerRowsBy("worker_completed");
    if (filter === "worker_needs_check") return aicmR8ZOWorkerRowsBy("worker_needs_check");
    return aicmR8ZOMajorRowsBy(filter);
  }

  function aicmR8ZOFilterLabel(filter) {
    var labels = {
      unhandoff: "未引き継ぎ",
      auto_waiting: "自動処理待ち",
      auto_processing: "自動処理中",
      manager_completed: "分解済み",
      worker_running: "Worker実行中",
      review_waiting: "レビュー待ち",
      worker_completed: "Worker完了",
      needs_check: "要確認",
      worker_needs_check: "Worker要確認",
      archived: "削除済み"
    };
    return labels[filter] || "詳細";
  }

  function aicmR8ZOSummaryButton(code, label, count, note) {
    return [
      '<button type="button" data-core-action="manager-major-summary-filter" data-summary-filter="' + aicmR8ZOEscape(code) + '" style="text-align:left;display:block;">',
      '  <span class="aicm-eyebrow">' + aicmR8ZOEscape(label) + '</span>',
      '  <strong style="display:block;font-size:30px;margin:6px 0;">' + aicmR8ZOEscape(String(count || 0)) + '件</strong>',
      note ? '  <span style="display:block;color:#64748b;font-weight:800;">' + aicmR8ZOEscape(note) + '</span>' : '',
      '</button>'
    ].join("");
  }

  function aicmR8ZORenderDetail(filter) {
    if (!filter) return "";

    var rows = aicmR8ZODetailRows(filter);
    var label = aicmR8ZOFilterLabel(filter);

    var body = rows.length ? rows.slice(0, 20).map(function(row, index) {
      var title = aicmR8ZOTitle(row);
      var description = aicmR8ZODescription(row);
      var worker = aicmR8ZOText(row && (row.assigned_worker_label || row.assigned_leader_label || row.leader_robot_label || row.responsible_robot_label));
      var priority = aicmR8ZOText(row && row.priority_code) || "-";
      var due = aicmR8ZOText(row && row.due_date) || "-";
      var status = aicmR8ZOStatusText(row);

      return [
        '<article class="aicm-core-card" style="box-shadow:none;">',
        '  <p class="aicm-eyebrow">詳細 #' + aicmR8ZOEscape(String(index + 1)) + '</p>',
        '  <h3>' + aicmR8ZOEscape(title) + '</h3>',
        description ? '  <p class="aicm-selected-note">' + aicmR8ZOEscape(description) + '</p>' : '',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>状態</dt><dd>' + aicmR8ZOEscape(status) + '</dd>',
        '    <dt>担当</dt><dd>' + aicmR8ZOEscape(worker || "-") + '</dd>',
        '    <dt>優先度</dt><dd>' + aicmR8ZOEscape(priority) + '</dd>',
        '    <dt>期限</dt><dd>' + aicmR8ZOEscape(due) + '</dd>',
        '  </dl>',
        '</article>'
      ].join("");
    }).join("") : '<div class="aicm-empty-state"><strong>対象はありません</strong><p>この分類に該当する行はありません。</p></div>';

    return [
      '<section class="aicm-core-card" style="border:2px solid #c7d2fe;">',
      '  <p class="aicm-eyebrow">サマリ詳細</p>',
      '  <h2>' + aicmR8ZOEscape(label) + ' の詳細</h2>',
      '  <p class="aicm-selected-note">対象: <strong>' + aicmR8ZOEscape(String(rows.length)) + '件</strong></p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="manager-major-summary-filter-clear">詳細表示を閉じる</button>',
      '  </div>',
      body,
      '</section>'
    ].join("");
  }

  function aicmRenderManagerMajorSummaryPanelR8U() {
    var majorRows = aicmR8ZOArray("pmlw_major_items", "managerMajorItems", "manager_major_items");
    var workerRows = aicmR8ZOArray("pmlw_worker_work_units", "pmlwWorkerWorkUnits");
    var majorCounts = aicmR8ZOCountBy(majorRows, aicmR8ZOMajorStatus);
    var workerCounts = aicmR8ZOCountBy(workerRows, aicmR8ZOWorkerStatus);
    var filter = state && state.managerMajorSummaryFilter ? String(state.managerMajorSummaryFilter) : "";

    return [
      '<section class="aicm-core-card aicm-manager-major-summary-card">',
      '  <p class="aicm-eyebrow">本番サマリ</p>',
      '  <h2>部門別タスク台帳サマリ</h2>',
      '  <p class="aicm-selected-note">合計: <strong>' + aicmR8ZOEscape(String(majorRows.length)) + '件</strong> / Worker作業単位: <strong>' + aicmR8ZOEscape(String(workerRows.length)) + '件</strong></p>',
      '  <div class="aicm-dashboard-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">',
      aicmR8ZOSummaryButton("unhandoff", "未引き継ぎ", majorCounts.unhandoff || 0, "課長へ送る前"),
      aicmR8ZOSummaryButton("auto_waiting", "自動処理待ち", majorCounts.auto_waiting || 0, "Leader以降の開始待ち"),
      aicmR8ZOSummaryButton("manager_completed", "分解済み", majorCounts.manager_completed || 0, "Worker作業単位まで作成"),
      aicmR8ZOSummaryButton("worker_running", "Worker実行中", workerCounts.worker_running || 0, "AIWorkerOS受付済み"),
      aicmR8ZOSummaryButton("review_waiting", "レビュー待ち", workerCounts.review_waiting || 0, "承認待ちへ表示予定"),
      aicmR8ZOSummaryButton("archived", "削除済み", majorCounts.archived || 0, "非表示・保管扱い"),
      '  </div>',
      '  <p class="aicm-selected-note">件数カードを押すと、その分類の詳細だけ確認できます。request_id などの開発者情報は通常表示しません。</p>',
      aicmR8ZORenderDetail(filter),
      '</section>'
    ].join("");
  }

${overrideHiddenFns || "  // No development-only panels were detected for override."}
${endMark}
`;

let anchor = src.indexOf("\nfunction handleRootChange(event)");
if (anchor < 0) anchor = src.indexOf("\n  function handleRootChange(event)");
if (anchor < 0) {
  const lastClose = src.lastIndexOf("\n})();");
  anchor = lastClose >= 0 ? lastClose : src.length;
}

src = src.slice(0, anchor) + "\n" + block + "\n" + src.slice(anchor);

fs.writeFileSync(corePath, src, "utf8");

const after = {
  marker: (src.match(/AICM_R8Z_O_PRODUCTION_SUMMARY_UI_START/g) || []).length,
  summaryOverride: (src.match(/function\s+aicmRenderManagerMajorSummaryPanelR8U\s*\(/g) || []).length,
  hiddenFunctionOverrides: hideNames,
  hiddenFunctionOverrideCount: hideNames.length,
  db_write: "NO",
  api_post: "NO",
  persistent_db_write: "NO",
  physical_delete: "NO"
};

if (after.marker !== 1) throw new Error("R8Z-O marker count invalid: " + after.marker);
if (after.summaryOverride < 1) throw new Error("summary override missing");

console.log(JSON.stringify({ status: "PATCHED", before, after }, null, 2));
