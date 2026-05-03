import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

function replaceFunction(source, functionName, replacement) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error("Opening brace not found: " + functionName);

  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(0, start) + replacement + source.slice(i + 1);
    }
  }

  throw new Error("Function end not found: " + functionName);
}

const helpers = `
function pmlwMajorRowsForCompany(companyId) {
    return (state.context.pmlw_major_items || []).filter(function (row) {
      return String(row.aicm_user_company_id || "") === String(companyId || "");
    });
  }

  function pmlwValue(value, fallback) {
    var text = String(value || "").trim();
    return text || fallback || "-";
  }

  function pmlwStatusLabel(value) {
    var map = {
      not_started: "未着手",
      assigned_to_leader: "Leader割当済",
      leader_decomposing: "Leader分解中",
      decomposed: "分解済",
      returned: "差戻し",
      archived: "削除済",
      draft: "下書き",
      ready_handoff: "引渡し準備",
      handed_off: "引渡し済",
      accepted: "受領済",
      completed: "完了",
      low: "低",
      normal: "通常",
      high: "高",
      urgent: "緊急"
    };

    return map[value] || pmlwValue(value, "-");
  }

  function renderPmlwMajorRows(rows) {
    if (!rows.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>Manager大項目はまだありません</strong>',
        '  <p>President方針またはユーザー依頼からManagerが大項目を作ると、ここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-table-wrap">',
      '  <table class="aicm-core-table">',
      '    <thead>',
      '      <tr>',
      '        <th>方針元</th>',
      '        <th>大項目</th>',
      '        <th>部門</th>',
      '        <th>課</th>',
      '        <th>Leader</th>',
      '        <th>分解状態</th>',
      '        <th>引渡し</th>',
      '        <th>優先度</th>',
      '        <th>期限</th>',
      '      </tr>',
      '    </thead>',
      '    <tbody>',
      rows.map(function (row) {
        return [
          '      <tr>',
          '        <td>' + escapeHtml(pmlwValue(row.policy_title, row.source_route_code || "-")) + '</td>',
          '        <td><strong>' + escapeHtml(pmlwValue(row.major_item_name, "-")) + '</strong><small>' + escapeHtml(pmlwValue(row.major_item_description, "")) + '</small></td>',
          '        <td>' + escapeHtml(pmlwValue(row.department_name, "未割当")) + '</td>',
          '        <td>' + escapeHtml(pmlwValue(row.section_name, "未割当")) + '</td>',
          '        <td>' + escapeHtml(pmlwValue(row.assigned_leader_label, "-")) + '</td>',
          '        <td>' + escapeHtml(pmlwStatusLabel(row.decomposition_status_code)) + '</td>',
          '        <td>' + escapeHtml(pmlwStatusLabel(row.handoff_status_code)) + '</td>',
          '        <td>' + escapeHtml(pmlwStatusLabel(row.priority_code)) + '</td>',
          '        <td>' + escapeHtml(pmlwValue(row.due_date, "-")) + '</td>',
          '      </tr>'
        ].join("");
      }).join(""),
      '    </tbody>',
      '  </table>',
      '</div>'
    ].join("");
  }
`;

if (!src.includes("function pmlwMajorRowsForCompany(")) {
  const pos = src.indexOf("function renderTaskLedgerPlaceholder(");
  if (pos < 0) throw new Error("renderTaskLedgerPlaceholder insertion point not found");
  src = src.slice(0, pos) + helpers + "\n\n  " + src.slice(pos);
}

const replacement = `
function renderTaskLedgerPlaceholder() {
    var company = selectedCompany();
    var rows = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
      '  <h2>Manager大項目台帳</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">P→M→L→W のうち、Managerが作る大項目を部門・課・Leaderへ引き渡すための一覧です。</p>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Manager大項目</p>',
      '  <h2>登録済み大項目</h2>',
      renderPmlwMajorRows(rows),
      '</section>'
    ].join(""));
  }`;

src = replaceFunction(src, "renderTaskLedgerPlaceholder", replacement);

if (!src.includes(".aicm-core-table small{")) {
  const cssAdditions = `
      ".aicm-table-wrap{overflow:auto;border:1px solid #edf2f7;border-radius:16px;background:#fff}",
      ".aicm-core-table{width:100%;border-collapse:collapse;min-width:980px}",
      ".aicm-core-table th,.aicm-core-table td{border-bottom:1px solid #edf2f7;padding:10px 12px;text-align:left;vertical-align:top;font-size:13px}",
      ".aicm-core-table th{background:#f8fafc;color:#334155;font-weight:900}",
      ".aicm-core-table small{display:block;color:#64748b;margin-top:4px;line-height:1.45}",
`;
  const marker = '      "@media(min-width:820px)';
  const pos = src.indexOf(marker);
  if (pos >= 0) {
    src = src.slice(0, pos) + cssAdditions + src.slice(pos);
  }
}

fs.writeFileSync(file, src);
console.log("PMLW Manager major ledger display patched");
