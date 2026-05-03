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
      if (depth === 0) {
        return source.slice(0, start) + replacement + source.slice(i + 1);
      }
    }
  }

  throw new Error("Function end not found: " + functionName);
}

const newRenderTree = `
function renderTree(departments) {
    if (departments.length === 0) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>部門がまだありません</strong>',
        '  <p>選択中のAI企業に部門を追加すると、ここに階層表示されます。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
        '  </div>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-tree-toolbar">',
      '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
      '  <button type="button" data-core-action="go" data-screen="section-new">課新規追加</button>',
      '</div>',
      '<div class="aicm-org-tree">',
      departments.map(function (department) {
        var sections = departmentSections(department.aicm_user_company_department_id);
        return [
          '<article class="aicm-org-node">',
          '  <div class="aicm-org-node-head">',
          '    <span class="aicm-node-badge">部門</span>',
          '    <strong>' + escapeHtml(department.department_name) + '</strong>',
          '    <button type="button" data-core-action="go" data-screen="department-edit">変更</button>',
          '  </div>',
          department.purpose ? '<p>' + escapeHtml(department.purpose) + '</p>' : '<p class="aicm-core-empty">目的未設定</p>',
          sections.length === 0 ? '<div class="aicm-section-empty">課なし</div>' : [
            '  <ul class="aicm-section-list">',
            sections.map(function (section) {
              return [
                '<li>',
                '  <span class="aicm-node-badge aicm-node-badge-section">課</span>',
                '  <strong>' + escapeHtml(section.section_name) + '</strong>',
                '  <button type="button" data-core-action="go" data-screen="section-edit">変更</button>',
                section.purpose ? '<small>' + escapeHtml(section.purpose) + '</small>' : '',
                '</li>'
              ].join("");
            }).join(""),
            '  </ul>'
          ].join(""),
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }`;

src = replaceFunction(src, "renderTree", newRenderTree);

fs.writeFileSync(file, src);
console.log("renderTree toolbar fixed to add-only top buttons");
