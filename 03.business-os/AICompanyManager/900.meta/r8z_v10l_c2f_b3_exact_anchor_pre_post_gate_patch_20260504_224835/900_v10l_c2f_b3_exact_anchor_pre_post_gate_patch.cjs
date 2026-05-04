const fs = require("fs");

const [,, corePath, verifyOut, extractOut, anchorOut] = process.argv;
let src = fs.readFileSync(corePath, "utf8");

const marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE";
const declarationNeedle = "function aicmR8zMgrMajorCardRenderConfirm";
const anchorNeedle = "return [";

function count(text, needle) {
  let c = 0;
  let from = 0;
  while (true) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) break;
    c += 1;
    from = idx + needle.length;
  }
  return c;
}

function lineNoAtIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function makeLineWindow(lines, centerLine, before, after) {
  const start = Math.max(1, centerLine - before);
  const end = Math.min(lines.length, centerLine + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

if (count(src, marker) > 0) {
  throw new Error("C2F_B3_MARKER_ALREADY_EXISTS");
}

const lines = src.split(/\r?\n/);
const declLineIndex = lines.findIndex(line => line.includes(declarationNeedle));
if (declLineIndex < 0) {
  throw new Error("DECLARATION_LINE_NOT_FOUND");
}

const declLineNo = declLineIndex + 1;

let anchorLineIndex = -1;
for (let i = declLineIndex + 1; i < Math.min(lines.length, declLineIndex + 260); i += 1) {
  if (lines[i].includes(anchorNeedle)) {
    anchorLineIndex = i;
    break;
  }
}

if (anchorLineIndex < 0) {
  throw new Error("FIRST_RETURN_ARRAY_ANCHOR_NOT_FOUND_WITHIN_WINDOW");
}

const anchorLineNo = anchorLineIndex + 1;

if (anchorLineNo < declLineNo || anchorLineNo > declLineNo + 260) {
  throw new Error("ANCHOR_LINE_OUT_OF_EXPECTED_WINDOW");
}

const insertedBlock = [
"  // " + marker + "_START",
"  // Pre-POST validation gate inserted by exact line anchor before the first return-array.",
"  // This block does not enable POST and does not call fetch.",
"  // Missing state returns a locked panel. Complete state falls through to the existing renderer.",
"  try {",
"    function aicmC2fB3Text(value) {",
"      if (value === null || typeof value === \"undefined\") return \"\";",
"      return String(value).trim();",
"    }",
"",
"    function aicmC2fB3Escape(value) {",
"      return aicmC2fB3Text(value)",
"        .replace(/&/g, \"&amp;\")",
"        .replace(/</g, \"&lt;\")",
"        .replace(/>/g, \"&gt;\")",
"        .replace(/\\\"/g, \"&quot;\")",
"        .replace(/'/g, \"&#39;\");",
"    }",
"",
"    function aicmC2fB3Get(obj, keys) {",
"      if (!obj || typeof obj !== \"object\") return \"\";",
"      for (var aicmC2fB3I = 0; aicmC2fB3I < keys.length; aicmC2fB3I += 1) {",
"        var aicmC2fB3Key = keys[aicmC2fB3I];",
"        var aicmC2fB3Value = obj[aicmC2fB3Key];",
"        if (aicmC2fB3Value !== null && typeof aicmC2fB3Value !== \"undefined\" && String(aicmC2fB3Value).trim() !== \"\") {",
"          return String(aicmC2fB3Value).trim();",
"        }",
"      }",
"      return \"\";",
"    }",
"",
"    function aicmC2fB3StableRowId(row, fallbackIndex) {",
"      return aicmC2fB3Get(row, [",
"        \"manager_major_item_id\",",
"        \"managerMajorItemId\",",
"        \"pmlw_major_item_id\",",
"        \"major_item_id\",",
"        \"majorItemId\",",
"        \"id\",",
"        \"uuid\"",
"      ]) || \"\";",
"    }",
"",
"    function aicmC2fB3RowTitle(row, fallbackId, fallbackIndex) {",
"      return aicmC2fB3Get(row, [",
"        \"major_item_name\",",
"        \"manager_major_item_name\",",
"        \"title\",",
"        \"name\",",
"        \"task_name\"",
"      ]) || fallbackId || (\"対象大項目\" + String(fallbackIndex + 1));",
"    }",
"",
"    var aicmC2fB3SelectedRows = [];",
"    if (typeof aicmR8zMgrMajorCardSelectedRows === \"function\") {",
"      try {",
"        aicmC2fB3SelectedRows = aicmR8zMgrMajorCardSelectedRows() || [];",
"      } catch (_) {",
"        aicmC2fB3SelectedRows = [];",
"      }",
"    }",
"",
"    var aicmC2fB3SelectionState = null;",
"    if (typeof aicmR8zMgrMajorCardSelectionState === \"function\") {",
"      try {",
"        aicmC2fB3SelectionState = aicmR8zMgrMajorCardSelectionState();",
"      } catch (_) {",
"        aicmC2fB3SelectionState = null;",
"      }",
"    }",
"",
"    var aicmC2fB3GlobalState = typeof state !== \"undefined\" && state ? state : {};",
"    var aicmC2fB3FallbackSelection =",
"      aicmC2fB3GlobalState.r8zMgrMajorCardSelection && typeof aicmC2fB3GlobalState.r8zMgrMajorCardSelection === \"object\"",
"        ? aicmC2fB3GlobalState.r8zMgrMajorCardSelection",
"        : {};",
"",
"    var aicmC2fB3Route =",
"      (aicmC2fB3SelectionState && aicmC2fB3SelectionState.handoffBatchRoute) ||",
"      aicmC2fB3FallbackSelection.handoffBatchRoute ||",
"      {};",
"",
"    var aicmC2fB3Missing = [];",
"    var aicmC2fB3Ids = [];",
"    var aicmC2fB3Titles = [];",
"",
"    if (!Array.isArray(aicmC2fB3SelectedRows) || aicmC2fB3SelectedRows.length < 1) {",
"      aicmC2fB3Missing.push(\"対象大項目が選択されていません\");",
"    }",
"",
"    for (var aicmC2fB3RowIndex = 0; aicmC2fB3RowIndex < aicmC2fB3SelectedRows.length; aicmC2fB3RowIndex += 1) {",
"      var aicmC2fB3Row = aicmC2fB3SelectedRows[aicmC2fB3RowIndex] || {};",
"      var aicmC2fB3Id = aicmC2fB3StableRowId(aicmC2fB3Row, aicmC2fB3RowIndex);",
"      var aicmC2fB3Title = aicmC2fB3RowTitle(aicmC2fB3Row, aicmC2fB3Id, aicmC2fB3RowIndex);",
"      if (!aicmC2fB3Id) {",
"        aicmC2fB3Missing.push(\"対象大項目IDが安定していません: \" + aicmC2fB3Title);",
"      } else {",
"        aicmC2fB3Ids.push(aicmC2fB3Id);",
"      }",
"      aicmC2fB3Titles.push(aicmC2fB3Title);",
"    }",
"",
"    var aicmC2fB3RouteApplied =",
"      aicmC2fB3Route.applied === true ||",
"      aicmC2fB3Route.applied_flag === true ||",
"      aicmC2fB3Text(aicmC2fB3Route.appliedLabel || aicmC2fB3Route.applied_label) === \"適用済み\";",
"",
"    var aicmC2fB3DepartmentLabel = aicmC2fB3Text(",
"      aicmC2fB3Route.departmentLabel ||",
"      aicmC2fB3Route.department_label ||",
"      aicmC2fB3Route.departmentName ||",
"      aicmC2fB3Route.department_name",
"    );",
"",
"    var aicmC2fB3SectionLabel = aicmC2fB3Text(",
"      aicmC2fB3Route.sectionLabel ||",
"      aicmC2fB3Route.section_label ||",
"      aicmC2fB3Route.sectionName ||",
"      aicmC2fB3Route.section_name",
"    );",
"",
"    var aicmC2fB3LeaderLabel = aicmC2fB3Text(",
"      aicmC2fB3Route.leaderLabel ||",
"      aicmC2fB3Route.leader_label ||",
"      aicmC2fB3Route.assigned_leader_label",
"    );",
"",
"    var aicmC2fB3LeaderPlacementId = aicmC2fB3Text(",
"      aicmC2fB3Route.leaderPlacementId ||",
"      aicmC2fB3Route.leader_placement_id ||",
"      aicmC2fB3Route.assigned_leader_placement_id",
"    );",
"",
"    if (!aicmC2fB3RouteApplied) aicmC2fB3Missing.push(\"課・部門・Leaderの引き渡し先が未適用です\");",
"    if (!aicmC2fB3DepartmentLabel) aicmC2fB3Missing.push(\"部門が未設定です\");",
"    if (!aicmC2fB3SectionLabel) aicmC2fB3Missing.push(\"課が未設定です\");",
"    if (!aicmC2fB3LeaderLabel) aicmC2fB3Missing.push(\"Leaderが未設定です\");",
"    if (!aicmC2fB3LeaderPlacementId) aicmC2fB3Missing.push(\"Leader配置IDが未設定です\");",
"",
"    var aicmC2fB3PayloadPreview = {",
"      selected_manager_major_item_ids: aicmC2fB3Ids,",
"      selected_titles: aicmC2fB3Titles,",
"      route: {",
"        department_label: aicmC2fB3DepartmentLabel,",
"        section_label: aicmC2fB3SectionLabel,",
"        leader_label: aicmC2fB3LeaderLabel,",
"        leader_placement_id: aicmC2fB3LeaderPlacementId",
"      },",
"      api_post: \"LOCKED_BY_C2F_B3_PRE_POST_GATE\",",
"      db_write: \"NO\"",
"    };",
"",
"    if (aicmC2fB3Missing.length > 0) {",
"      return [",
"        '<section class=\"aicm-core-card aicm-r8z-c2f-b3-prepost-gate\">',",
"        '<div class=\"aicm-core-section-title\">課長へ送る前の実行前チェック</div>',",
"        '<p class=\"aicm-core-muted\">不足項目があるため、POST実行はロックされています。</p>',",
"        '<div class=\"aicm-core-alert aicm-core-alert-warning\">',",
"        '<strong>実行前チェックNG</strong>',",
"        '<ul>',",
"        aicmC2fB3Missing.map(function (item) {",
"          return '<li>' + aicmC2fB3Escape(item) + '</li>';",
"        }).join(''),",
"        '</ul>',",
"        '</div>',",
"        '<dl class=\"aicm-core-dl\">',",
"        '<dt>部門</dt><dd>' + aicmC2fB3Escape(aicmC2fB3DepartmentLabel || '-') + '</dd>',",
"        '<dt>課</dt><dd>' + aicmC2fB3Escape(aicmC2fB3SectionLabel || '-') + '</dd>',",
"        '<dt>Leader</dt><dd>' + aicmC2fB3Escape(aicmC2fB3LeaderLabel || '-') + '</dd>',",
"        '<dt>対象大項目数</dt><dd>' + String(Array.isArray(aicmC2fB3SelectedRows) ? aicmC2fB3SelectedRows.length : 0) + '</dd>',",
"        '</dl>',",
"        '<details class=\"aicm-core-details\">',",
"        '<summary>payload preview（POST未実行）</summary>',",
"        '<pre>' + aicmC2fB3Escape(JSON.stringify(aicmC2fB3PayloadPreview, null, 2)) + '</pre>',",
"        '</details>',",
"        '<div class=\"aicm-core-actions\">',",
"        '<button type=\"button\" class=\"aicm-core-btn\" data-core-action=\"r8z-mgr-major-card-close-handoff-confirm\">戻る</button>',",
"        '</div>',",
"        '</section>'",
"      ].join('');",
"    }",
"  } catch (aicmC2fB3Error) {",
"    return [",
"      '<section class=\"aicm-core-card aicm-r8z-c2f-b3-prepost-gate-error\">',",
"      '<div class=\"aicm-core-section-title\">課長へ送る前の実行前チェック</div>',",
"      '<p class=\"aicm-core-alert aicm-core-alert-warning\">確認状態を読み取れないため、POST実行はロックされています。</p>',",
"      '<pre>' + String(aicmC2fB3Error && aicmC2fB3Error.message ? aicmC2fB3Error.message : aicmC2fB3Error) + '</pre>',",
"      '<div class=\"aicm-core-actions\">',",
"      '<button type=\"button\" class=\"aicm-core-btn\" data-core-action=\"r8z-mgr-major-card-close-handoff-confirm\">戻る</button>',",
"      '</div>',",
"      '</section>'",
"    ].join('');",
"  }",
"  // " + marker + "_END",
""
].join("\n");

const beforeWindow = makeLineWindow(lines, anchorLineNo, 12, 18);

lines.splice(anchorLineIndex, 0, insertedBlock);

src = lines.join("\n");
fs.writeFileSync(corePath, src);

const afterLines = src.split(/\r?\n/);
const afterAnchorLineNo = anchorLineNo + insertedBlock.split(/\n/).length;
const afterWindow = makeLineWindow(afterLines, anchorLineNo, 10, 260);

const insertedFetchCount = count(insertedBlock, "fetch(");
const insertedXmlCount = count(insertedBlock, "XMLHttpRequest");
const insertedApiPostYesCount = count(insertedBlock, "API_POST=YES") + count(insertedBlock, 'api_post: "YES"');

const anchorReport = [];
anchorReport.push("AICompanyManager V10L-C2F-B3 anchor result");
anchorReport.push("DB_WRITE=NO");
anchorReport.push("API_POST=NO");
anchorReport.push("CORE_PATCH=YES");
anchorReport.push("SERVER_PATCH=NO");
anchorReport.push("");
anchorReport.push("DECLARATION_LINE=" + declLineNo);
anchorReport.push("ANCHOR_NEEDLE=" + anchorNeedle);
anchorReport.push("ANCHOR_LINE_BEFORE_PATCH=" + anchorLineNo);
anchorReport.push("RETURN_ARRAY_LINE_AFTER_PATCH=" + afterAnchorLineNo);
anchorReport.push("INSERTED_LINE_COUNT=" + insertedBlock.split(/\n/).length);
anchorReport.push("");
anchorReport.push("BEFORE_WINDOW");
anchorReport.push("============================================================");
anchorReport.push(beforeWindow.text);
anchorReport.push("");
anchorReport.push("AFTER_WINDOW");
anchorReport.push("============================================================");
anchorReport.push(afterWindow.text);
fs.writeFileSync(anchorOut, anchorReport.join("\n") + "\n");

const extract = [];
extract.push("AICompanyManager V10L-C2F-B3 patch extract");
extract.push("DB_WRITE=NO");
extract.push("API_POST=NO");
extract.push("CORE_PATCH=YES");
extract.push("SERVER_PATCH=NO");
extract.push("");
extract.push("INSERTED_BLOCK");
extract.push("============================================================");
extract.push(insertedBlock);
extract.push("");
extract.push("ANCHOR_OUT=" + anchorOut);
fs.writeFileSync(extractOut, extract.join("\n") + "\n");

const verify = [];
verify.push("AICompanyManager V10L-C2F-B3 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("SERVER_PATCH=NO");
verify.push("CORE_PATCH=YES");
verify.push("");
verify.push("DECLARATION_LINE=" + declLineNo);
verify.push("ANCHOR_LINE_BEFORE_PATCH=" + anchorLineNo);
verify.push("RETURN_ARRAY_LINE_AFTER_PATCH=" + afterAnchorLineNo);
verify.push("C2F_B3_MARKER_TOTAL_COUNT=" + count(src, marker));
verify.push("C2F_B3_START_COUNT=" + count(src, marker + "_START"));
verify.push("C2F_B3_END_COUNT=" + count(src, marker + "_END"));
verify.push("PRECHECK_NG_TEXT_COUNT=" + count(src, "実行前チェックNG"));
verify.push("POST_LOCK_TEXT_COUNT=" + count(src, "POST実行はロック"));
verify.push("PAYLOAD_PREVIEW_LOCK_COUNT=" + count(src, "payload preview（POST未実行）"));
verify.push("LOCKED_BY_C2F_B3_COUNT=" + count(src, "LOCKED_BY_C2F_B3_PRE_POST_GATE"));
verify.push("FETCH_IN_INSERTED_BLOCK=" + insertedFetchCount);
verify.push("XMLHTTP_IN_INSERTED_BLOCK=" + insertedXmlCount);
verify.push("API_POST_UNLOCK_TEXT_IN_INSERTED_BLOCK=" + insertedApiPostYesCount);
verify.push("WRAPPER_MARKER_COUNT=" + count(src, "C2E_R2B_SAFE_DEBUG_PANEL_DISPLAY_FILTER"));
verify.push("DEBUG_C2D5_LABEL_COUNT=" + count(src, "C2D5R2A 課を適用 debug"));
verify.push("DEBUG_C2D7_LABEL_COUNT=" + count(src, "C2D7 handler entry debug"));
verify.push("C2D12_MARKER_COUNT=" + count(src, "AICM_R8Z_MGR_MAJOR_CARD_C2D12_LEADER_GENERIC_OPTION_FILTER"));
verify.push("ANCHOR_OUT=" + anchorOut);
verify.push("EXTRACT_OUT=" + extractOut);

if (count(src, marker) !== 2) throw new Error("C2F_B3_MARKER_TOTAL_COUNT_NOT_2");
if (count(src, marker + "_START") !== 1) throw new Error("C2F_B3_START_COUNT_NOT_1");
if (count(src, marker + "_END") !== 1) throw new Error("C2F_B3_END_COUNT_NOT_1");
if (insertedFetchCount !== 0) throw new Error("FETCH_FOUND_IN_INSERTED_BLOCK");
if (insertedXmlCount !== 0) throw new Error("XMLHTTP_FOUND_IN_INSERTED_BLOCK");
if (insertedApiPostYesCount !== 0) throw new Error("API_POST_UNLOCK_TEXT_FOUND");
if (count(src, "実行前チェックNG") < 1) throw new Error("PRECHECK_NG_TEXT_MISSING");
if (count(src, "POST実行はロック") < 1) throw new Error("POST_LOCK_TEXT_MISSING");
if (count(src, "C2D5R2A 課を適用 debug") !== 0) throw new Error("C2D5_DEBUG_LABEL_RETURNED");
if (count(src, "C2D7 handler entry debug") !== 0) throw new Error("C2D7_DEBUG_LABEL_RETURNED");
if (count(src, "AICM_R8Z_MGR_MAJOR_CARD_C2D12_LEADER_GENERIC_OPTION_FILTER") < 1) throw new Error("C2D12_MARKER_MISSING");

fs.writeFileSync(verifyOut, verify.join("\n") + "\n");
