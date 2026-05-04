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

  for (let i = fromIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i += 1;
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
      i += 1;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i += 1;
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

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i += 1;
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
      i += 1;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i += 1;
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

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
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

function replaceFunction(text, name, replacement) {
  const fn = findFunctionRange(text, name);
  return text.slice(0, fn.start) + replacement + text.slice(fn.close + 1);
}

function replaceHandleC2Region(text, replacementBlock) {
  const fn = findFunctionRange(text, 'aicmR8zMgrMajorCardHandleAction');
  let body = fn.text;

  const markers = [
    'AICM_R8Z_MGR_MAJOR_CARD_C2C_BATCH_SECTION_LEADER_ROUTE_ACTION_ROUTE',
    'AICM_R8Z_MGR_MAJOR_CARD_C2C2_SECTION_LEADER_COMBOBOX_ACTION_ROUTE',
    'AICM_R8Z_MGR_MAJOR_CARD_C2C3_COMBOBOX_APPLY_FIX_ACTION_ROUTE',
    'AICM_R8Z_MGR_MAJOR_CARD_C2C4_ROUTE_STATE_PERSIST_FIX_ACTION_ROUTE'
  ];

  let first = -1;
  for (const marker of markers) {
    const idx = body.indexOf(marker);
    if (idx >= 0 && (first < 0 || idx < first)) first = idx;
  }

  if (first < 0) {
    const confirmIdxOnly = body.indexOf('if (action === "r8z-mgr-major-card-confirm-yes") {');
    if (confirmIdxOnly < 0) throw new Error('CONFIRM_YES_BRANCH_NOT_FOUND');
    body = body.slice(0, confirmIdxOnly) + replacementBlock + body.slice(confirmIdxOnly);
  } else {
    const lineStart = body.lastIndexOf('\n', first);
    const removeStart = lineStart >= 0 ? lineStart + 1 : first;
    const confirmIdx = body.indexOf('if (action === "r8z-mgr-major-card-confirm-yes") {', first);
    if (confirmIdx < 0) throw new Error('CONFIRM_YES_BRANCH_NOT_FOUND_AFTER_C2_MARKER');
    body = body.slice(0, removeStart) + replacementBlock + body.slice(confirmIdx);
  }

  return text.slice(0, fn.start) + body + text.slice(fn.close + 1);
}

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2D_ROUTE_SELECTION_CONSOLIDATED';

const required = [
  'aicmR8zMgrMajorCardState',
  'aicmR8zC2cBag',
  'aicmR8zC2cChoice',
  'aicmR8zC2cApplySectionChoice',
  'aicmR8zC2cApplyLeaderChoice',
  'aicmR8zC2cClearRouteChoice',
  'aicmR8zC2cEffectiveRoute',
  'aicmR8zC2cRenderRoutePicker',
  'aicmR8zC2cSectionCandidates',
  'aicmR8zC2cNormalizeSection',
  'aicmR8zMgrMajorCardRenderConfirm',
  'aicmR8zMgrMajorCardOpenConfirm',
  'aicmR8zMgrMajorCardHandleAction',
  'aicmR8zC2bValidateLeaderHandoffRows',
  'aicmR8zC2bBuildLeaderHandoffPayload'
];

for (const name of required) {
  findFunctionRange(src, name);
}

const bagReplacement = `
  function aicmR8zC2cBag() {
    var bag = null;

    if (typeof aicmR8zMgrMajorCardState === "function") {
      bag = aicmR8zMgrMajorCardState();
    }

    if (!bag || typeof bag !== "object") {
      if (state && typeof state === "object") {
        if (!state.r8zMgrMajorCardSelection || typeof state.r8zMgrMajorCardSelection !== "object") {
          state.r8zMgrMajorCardSelection = {};
        }
        bag = state.r8zMgrMajorCardSelection;
      } else {
        bag = {};
      }
    }

    if (state && typeof state === "object") {
      if (!state.r8zMgrMajorCardSelection || typeof state.r8zMgrMajorCardSelection !== "object") {
        state.r8zMgrMajorCardSelection = bag;
      }
      bag = state.r8zMgrMajorCardSelection;
    }

    if (!bag.handoffBatchRoute || typeof bag.handoffBatchRoute !== "object") {
      bag.handoffBatchRoute = {
        sectionId: "",
        sectionLabel: "",
        departmentId: "",
        departmentLabel: "",
        leaderPlacementId: "",
        leaderId: "",
        leaderLabel: "",
        routeApplied: false,
        routeSource: "c2d-canonical"
      };
    }

    return bag;
  }
`;

const choiceReplacement = `
  function aicmR8zC2cChoice() {
    return aicmR8zC2cBag().handoffBatchRoute;
  }
`;

const normalizeSectionReplacement = `
  function aicmR8zC2cNormalizeSection(row, index, parentDepartment) {
    row = row && typeof row === "object" ? row : {};
    parentDepartment = parentDepartment && typeof parentDepartment === "object" ? parentDepartment : null;

    var sectionId = aicmR8zC2cField(row, [
      "section_id",
      "aicm_section_id",
      "organization_id",
      "department_section_id",
      "id"
    ]);

    var sectionLabel = aicmR8zC2cField(row, [
      "section_name",
      "section_label",
      "organization_name",
      "organization_label",
      "name",
      "label"
    ]);

    var departmentId = aicmR8zC2cField(row, [
      "department_id",
      "aicm_department_id",
      "parent_department_id",
      "parent_organization_id"
    ]);

    var departmentLabel = aicmR8zC2cField(row, [
      "department_name",
      "department_label",
      "parent_department_name",
      "parent_organization_name"
    ]);

    if (parentDepartment) {
      if (!departmentId) {
        departmentId = aicmR8zC2cField(parentDepartment, [
          "department_id",
          "aicm_department_id",
          "organization_id",
          "id"
        ]);
      }

      if (!departmentLabel) {
        departmentLabel = aicmR8zC2cField(parentDepartment, [
          "department_name",
          "department_label",
          "organization_name",
          "name",
          "label"
        ]);
      }
    }

    sectionId = aicmR8zC2cText(sectionId);
    sectionLabel = aicmR8zC2cText(sectionLabel);
    departmentId = aicmR8zC2cText(departmentId);
    departmentLabel = aicmR8zC2cText(departmentLabel);

    if (!sectionId && sectionLabel) sectionId = "section-label-" + String(index);
    if (!sectionId || !sectionLabel) return null;

    if (sectionLabel === "課") return null;
    if (sectionLabel === "-") return null;

    var deptOnly = !!departmentLabel && !row.section_name && !row.section_label && !row.organization_name && !row.organization_label;
    if (deptOnly && !parentDepartment) return null;

    return {
      sectionId: sectionId,
      sectionLabel: sectionLabel,
      departmentId: departmentId,
      departmentLabel: departmentLabel
    };
  }
`;

const sectionCandidatesReplacement = `
  function aicmR8zC2cSectionCandidates() {
    var ctx = aicmR8zC2cContext();

    function asRows(value) {
      return Array.isArray(value) ? value : [];
    }

    function deptRows() {
      return []
        .concat(asRows(ctx.departments))
        .concat(asRows(ctx.department_list))
        .concat(asRows(ctx.aicm_departments));
    }

    function deptId(row) {
      return aicmR8zC2cField(row, [
        "department_id",
        "aicm_department_id",
        "organization_id",
        "id"
      ]);
    }

    function deptLabel(row) {
      return aicmR8zC2cField(row, [
        "department_name",
        "department_label",
        "organization_name",
        "name",
        "label"
      ]);
    }

    function enrich(section) {
      if (!section || section.departmentLabel) return section;

      var depts = deptRows();
      for (var i = 0; i < depts.length; i += 1) {
        var d = depts[i] || {};
        var id = deptId(d);
        if (id && section.departmentId && String(id) === String(section.departmentId)) {
          section.departmentLabel = deptLabel(d);
          return section;
        }
      }

      return section;
    }

    function nestedSectionsFromDepartment(dept) {
      var rows = []
        .concat(asRows(dept.sections))
        .concat(asRows(dept.section_list))
        .concat(asRows(dept.organizations))
        .concat(asRows(dept.children))
        .concat(asRows(dept.units));

      return rows.map(function (row, index) {
        return aicmR8zC2cNormalizeSection(row, index, dept);
      }).filter(Boolean);
    }

    var raw = [];

    raw = raw
      .concat(asRows(ctx.sections))
      .concat(asRows(ctx.section_list))
      .concat(asRows(ctx.aicm_sections));

    deptRows().forEach(function (dept) {
      raw = raw.concat(nestedSectionsFromDepartment(dept));
    });

    asRows(ctx.organizations)
      .concat(asRows(ctx.organization_list))
      .forEach(function (row, index) {
        row = row && typeof row === "object" ? row : {};
        var level = String(
          row.organization_level ||
          row.org_level ||
          row.level_code ||
          row.type_code ||
          row.organization_type ||
          ""
        ).toLowerCase();

        var sectionLike =
          level.indexOf("section") >= 0 ||
          level.indexOf("課") >= 0 ||
          !!row.section_name ||
          !!row.section_label ||
          !!row.parent_department_id ||
          !!row.parent_organization_id;

        var departmentLike =
          level.indexOf("department") >= 0 ||
          level.indexOf("部門") >= 0;

        if (sectionLike && !departmentLike) {
          raw.push(row);
        }
      });

    if (!raw.length && typeof aicmR8zMgrMajorCardSelectedRows === "function") {
      aicmR8zMgrMajorCardSelectedRows().forEach(function (row) {
        if (row && (row.section_name || row.section_label || row.section_id || row.aicm_section_id)) {
          raw.push(row);
        }
      });
    }

    var seen = {};
    var list = [];

    raw.forEach(function (row, index) {
      var section = row && row.sectionId && row.sectionLabel ? row : aicmR8zC2cNormalizeSection(row, index, null);
      section = enrich(section);
      if (!section) return;

      var key = section.sectionId || section.sectionLabel;
      if (!key || seen[key]) return;

      seen[key] = true;
      list.push(section);
    });

    list.sort(function (a, b) {
      var ak = String((a.departmentLabel || "") + " " + (a.sectionLabel || ""));
      var bk = String((b.departmentLabel || "") + " " + (b.sectionLabel || ""));
      return ak.localeCompare(bk, "ja");
    });

    return list;
  }
`;

const applySectionReplacement = `
  function aicmR8zC2cApplySectionChoice(sectionId, sectionSnapshot) {
    var bag = aicmR8zC2cBag();
    var section = sectionSnapshot && typeof sectionSnapshot === "object"
      ? sectionSnapshot
      : aicmR8zC2cFindSection(sectionId);

    if (!section) {
      return null;
    }

    bag.handoffBatchRoute = {
      sectionId: aicmR8zC2cText(section.sectionId || sectionId),
      sectionLabel: aicmR8zC2cText(section.sectionLabel || ""),
      departmentId: aicmR8zC2cText(section.departmentId || ""),
      departmentLabel: aicmR8zC2cText(section.departmentLabel || ""),
      leaderPlacementId: "",
      leaderId: "",
      leaderLabel: "",
      routeApplied: true,
      routeAppliedAt: Date.now(),
      routeSource: "c2d-canonical-section-select"
    };

    var leaders = aicmR8zC2cLeaderCandidatesForSection(bag.handoffBatchRoute.sectionId);
    if (leaders.length === 1) {
      bag.handoffBatchRoute.leaderPlacementId = leaders[0].leaderPlacementId;
      bag.handoffBatchRoute.leaderId = leaders[0].leaderId;
      bag.handoffBatchRoute.leaderLabel = leaders[0].leaderLabel;
    }

    return bag.handoffBatchRoute;
  }
`;

const applyLeaderReplacement = `
  function aicmR8zC2cApplyLeaderChoice(leaderPlacementId) {
    var bag = aicmR8zC2cBag();
    var choice = bag.handoffBatchRoute || {};
    var leader = aicmR8zC2cFindLeader(choice.sectionId, leaderPlacementId);

    if (leader) {
      choice.leaderPlacementId = leader.leaderPlacementId;
      choice.leaderId = leader.leaderId;
      choice.leaderLabel = leader.leaderLabel;
      choice.routeApplied = true;
      choice.routeAppliedAt = Date.now();
      choice.routeSource = "c2d-canonical-leader-select";
    }

    bag.handoffBatchRoute = choice;
    return choice;
  }
`;

const clearRouteReplacement = `
  function aicmR8zC2cClearRouteChoice() {
    var bag = aicmR8zC2cBag();
    bag.handoffBatchRoute = {
      sectionId: "",
      sectionLabel: "",
      departmentId: "",
      departmentLabel: "",
      leaderPlacementId: "",
      leaderId: "",
      leaderLabel: "",
      routeApplied: false,
      routeSource: "c2d-canonical-cleared"
    };
    return bag.handoffBatchRoute;
  }
`;

const effectiveRouteReplacement = `
  function aicmR8zC2cEffectiveRoute() {
    var choice = aicmR8zC2cChoice();

    var sectionId = aicmR8zC2cText(choice.sectionId || "");
    var sectionLabel = aicmR8zC2cText(choice.sectionLabel || "");
    var departmentId = aicmR8zC2cText(choice.departmentId || "");
    var departmentLabel = aicmR8zC2cText(choice.departmentLabel || "");

    if (sectionId && (!sectionLabel || !departmentLabel)) {
      var foundSection = aicmR8zC2cFindSection(sectionId);
      if (foundSection) {
        if (!sectionLabel) sectionLabel = aicmR8zC2cText(foundSection.sectionLabel || "");
        if (!departmentId) departmentId = aicmR8zC2cText(foundSection.departmentId || "");
        if (!departmentLabel) departmentLabel = aicmR8zC2cText(foundSection.departmentLabel || "");
      }
    }

    var leaders = sectionId ? aicmR8zC2cLeaderCandidatesForSection(sectionId) : [];
    var leaderPlacementId = aicmR8zC2cText(choice.leaderPlacementId || "");
    var leaderId = aicmR8zC2cText(choice.leaderId || "");
    var leaderLabel = aicmR8zC2cText(choice.leaderLabel || "");

    if (!leaderPlacementId && !leaderId && !leaderLabel && leaders.length === 1) {
      leaderPlacementId = leaders[0].leaderPlacementId;
      leaderId = leaders[0].leaderId;
      leaderLabel = leaders[0].leaderLabel;
    }

    return {
      clear: !!sectionId && !!(leaderPlacementId || leaderId || leaderLabel) && leaders.length > 0,
      sectionId: sectionId,
      sectionLabel: sectionLabel,
      departmentId: departmentId,
      departmentLabel: departmentLabel,
      leaderPlacementId: leaderPlacementId,
      leaderId: leaderId,
      leaderLabel: leaderLabel,
      leaderCount: leaders.length,
      displayDepartment: departmentLabel || departmentId || "-",
      displaySection: sectionLabel || sectionId || "-",
      displayLeader: leaderLabel || leaderPlacementId || leaderId || "-",
      routeApplied: !!choice.routeApplied,
      routeAppliedAt: choice.routeAppliedAt || null,
      routeSource: choice.routeSource || ""
    };
  }
`;

const routePickerReplacement = `
  function aicmR8zC2cRenderRoutePicker() {
    var sections = aicmR8zC2cSectionCandidates();
    var choice = aicmR8zC2cChoice();
    var selectedSectionId = aicmR8zC2cText(choice.sectionId || "");
    var leaders = selectedSectionId ? aicmR8zC2cLeaderCandidatesForSection(selectedSectionId) : [];

    var sectionOptions = ['<option value="">課を選択してください</option>'].concat(
      sections.map(function (section) {
        var selected = selectedSectionId && section.sectionId === selectedSectionId ? " selected" : "";
        var label = (section.departmentLabel ? section.departmentLabel + " / " : "") + section.sectionLabel;
        return [
          '<option',
          ' value="' + escapeHtml(section.sectionId) + '"',
          selected,
          ' data-section-id="' + escapeHtml(section.sectionId || "") + '"',
          ' data-section-label="' + escapeHtml(section.sectionLabel || "") + '"',
          ' data-department-id="' + escapeHtml(section.departmentId || "") + '"',
          ' data-department-label="' + escapeHtml(section.departmentLabel || "") + '"',
          '>',
          escapeHtml(label),
          '</option>'
        ].join("");
      })
    ).join("");

    var sectionSelectHtml = sections.length
      ? [
          '<div class="aicm-form-row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">',
          '  <label class="aicm-selected-note" for="aicm-r8z-c2d-section-select">課</label>',
          '  <select id="aicm-r8z-c2d-section-select" data-r8z-c2d-section-select="1" style="min-width:260px;max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;">' + sectionOptions + '</select>',
          '  <button type="button" data-core-action="r8z-c2d-apply-section-select">課を適用</button>',
          '</div>'
        ].join("")
      : '<p class="aicm-selected-note">選択できる課がありません。部門/課の設定またはcontext読込を確認してください。</p>';

    var leaderSelectHtml = "";

    if (!selectedSectionId) {
      leaderSelectHtml = '<p class="aicm-selected-note">先に課を選択してください。</p>';
    } else if (!leaders.length) {
      leaderSelectHtml = '<p class="aicm-selected-note">この課にLeaderが配置されていません。</p>';
    } else if (leaders.length === 1) {
      leaderSelectHtml = '<p class="aicm-selected-note">Leaderは1人のため自動確定: ' + escapeHtml(leaders[0].leaderLabel) + '</p>';
    } else {
      var selectedLeaderId = aicmR8zC2cText(choice.leaderPlacementId || "");
      var leaderOptions = ['<option value="">Leaderを選択してください</option>'].concat(
        leaders.map(function (leader) {
          var selected = selectedLeaderId && leader.leaderPlacementId === selectedLeaderId ? " selected" : "";
          return '<option value="' + escapeHtml(leader.leaderPlacementId) + '"' + selected + '>' + escapeHtml(leader.leaderLabel) + '</option>';
        })
      ).join("");

      leaderSelectHtml = [
        '<div class="aicm-form-row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">',
        '  <label class="aicm-selected-note" for="aicm-r8z-c2d-leader-select">Leader</label>',
        '  <select id="aicm-r8z-c2d-leader-select" data-r8z-c2d-leader-select="1" style="min-width:260px;max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;">' + leaderOptions + '</select>',
        '  <button type="button" data-core-action="r8z-c2d-apply-leader-select">Leaderを適用</button>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-core-card" data-r8z-c2d-route-picker="1" style="margin:12px 0;border:1px solid #c7d2fe;">',
      '  <p class="aicm-eyebrow">引き渡し先 一括選択</p>',
      '  <h4>選択済み大項目をまとめて送る課を選択</h4>',
      '  <p class="aicm-selected-note">大項目ごとの個別課選択は行いません。ここで選んだ課/Leaderを、選択済み大項目すべてに適用します。</p>',
      '  <p class="aicm-selected-note">割り当て先の部門は、選択した課の親部門です。</p>',
      sectionSelectHtml,
      '  <h4>Leader</h4>',
      leaderSelectHtml,
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-c2d-clear-route">引き渡し先を解除</button>',
      '  </div>',
      '</div>'
    ].join("");
  }
`;

const payloadReplacement = `
  function aicmR8zC2bBuildLeaderHandoffPayload(row, index) {
    row = row && typeof row === "object" ? row : {};

    var majorId = typeof aicmR8zMgrMajorCardRowId === "function"
      ? aicmR8zMgrMajorCardRowId(row, index)
      : "";

    var route = typeof aicmR8zC2cEffectiveRoute === "function"
      ? aicmR8zC2cEffectiveRoute()
      : { sectionId: "", leaderPlacementId: "", leaderId: "", displayLeader: "" };

    var payload = {
      owner_civilization_id: aicmR8zC2bOwnerId(row),
      aicm_manager_major_work_item_id: majorId,
      assigned_leader_label: route.displayLeader && route.displayLeader !== "-" ? route.displayLeader : "",
      decomposition_status_code: "assigned_to_leader",
      handoff_status_code: "handed_off",
      note: aicmR8zC2bText(row.note || "")
    };

    if (route.sectionId) payload.section_id = route.sectionId;
    if (route.leaderPlacementId) payload.leader_placement_id = route.leaderPlacementId;
    if (route.leaderId) payload.assigned_leader_id = route.leaderId;

    return payload;
  }
`;

const validateReplacement = `
  function aicmR8zC2bValidateLeaderHandoffRows(rows) {
    rows = Array.isArray(rows) ? rows : [];

    var errors = [];
    var items = [];
    var payloads = [];
    var route = typeof aicmR8zC2cEffectiveRoute === "function"
      ? aicmR8zC2cEffectiveRoute()
      : { clear: false, leaderCount: 0, displayLeader: "", displaySection: "", displayDepartment: "" };

    if (!rows.length) {
      errors.push("対象の大項目を選択してください。");
    }

    if (!route.sectionId) {
      errors.push("引き渡し先の課を一括選択してください。");
    } else if (route.leaderCount === 0) {
      errors.push("選択した課にLeaderが配置されていません。");
    } else if (route.leaderCount > 1 && !route.leaderPlacementId && !route.leaderId && (!route.leaderLabel || route.leaderLabel === "-")) {
      errors.push("選択した課にLeaderが複数います。Leaderを1人選択してください。");
    } else if (!route.clear) {
      errors.push("引き渡し先の課/Leaderが未確定です。");
    }

    rows.forEach(function (row, index) {
      var title = typeof aicmR8zMgrMajorCardTitle === "function"
        ? aicmR8zMgrMajorCardTitle(row)
        : "Manager大項目";

      var id = typeof aicmR8zMgrMajorCardRowId === "function"
        ? aicmR8zMgrMajorCardRowId(row, index)
        : "";

      var selectable = typeof aicmR8zMgrMajorCardIsSelectable === "function"
        ? aicmR8zMgrMajorCardIsSelectable(row)
        : true;

      if (!id) {
        errors.push(title + ": Manager大項目IDを特定できません。");
      }

      if (!selectable) {
        errors.push(title + ": すでに引渡し済み、完了、削除、または対象外です。");
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
      route: route,
      endpoint: "/api/aicm/v2/manager-major/update"
    };
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
          route: {},
          endpoint: ""
        };

    bag.confirm = {
      kind: kind,
      title: kind === "delete" ? "削除確認" : "課長へ送る確認",
      endpoint: validation.endpoint || "/api/aicm/v2/manager-major/update",
      ok: validation.ok,
      errors: validation.errors || [],
      items: validation.items || [],
      payloads: validation.payloads || [],
      route: validation.route || {}
    };

    if (typeof setMessage === "function") {
      if (validation.ok) {
        setMessage("ok", "確認画面を表示しました。");
      } else {
        setMessage("error", "引き渡し先の課/Leaderを選択してください。");
      }
    }

    aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_open_c2d");
  }
`;

const renderConfirmReplacement = `
  function aicmR8zMgrMajorCardRenderConfirm() {
    var bag = aicmR8zMgrMajorCardState();
    var confirm = bag.confirm || null;

    if (!confirm || !Array.isArray(confirm.items) || !confirm.items.length) {
      return "";
    }

    var liveValidation = confirm.kind === "leader-handoff" && typeof aicmR8zC2bValidateLeaderHandoffRows === "function"
      ? aicmR8zC2bValidateLeaderHandoffRows(aicmR8zMgrMajorCardSelectedRows())
      : null;

    if (liveValidation) {
      confirm.ok = liveValidation.ok;
      confirm.errors = liveValidation.errors || [];
      confirm.items = liveValidation.items || confirm.items;
      confirm.payloads = liveValidation.payloads || [];
      confirm.route = liveValidation.route || {};
      confirm.endpoint = liveValidation.endpoint || confirm.endpoint;
      bag.confirm = confirm;
    }

    var errors = Array.isArray(confirm.errors) ? confirm.errors : [];
    var payloads = Array.isArray(confirm.payloads) ? confirm.payloads : [];
    var hasErrors = errors.length > 0;
    var yesDisabled = hasErrors ? " disabled" : "";
    var yesStyle = hasErrors ? ' style="opacity:0.45;cursor:not-allowed;"' : "";

    var route = typeof aicmR8zC2cEffectiveRoute === "function"
      ? aicmR8zC2cEffectiveRoute()
      : (confirm.route || {});

    var routePickerHtml = typeof aicmR8zC2cRenderRoutePicker === "function"
      ? aicmR8zC2cRenderRoutePicker()
      : "";

    var summaryHtml = [
      '<div class="aicm-core-card" style="margin:12px 0;">',
      '<p class="aicm-eyebrow">一括引き渡し先</p>',
      '<div class="aicm-selected-note">部門: ' + escapeHtml(route.displayDepartment || "-") + '</div>',
      '<div class="aicm-selected-note">課: ' + escapeHtml(route.displaySection || "-") + '</div>',
      '<div class="aicm-selected-note">Leader: ' + escapeHtml(route.displayLeader || "-") + '</div>',
      route.routeApplied ? '<div class="aicm-selected-note">適用済み</div>' : '',
      '</div>'
    ].join("");

    var itemHtml = confirm.items.map(function (item) {
      return '<li><strong>' + escapeHtml(item.title || item.id || "Manager大項目") + '</strong></li>';
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
      routePickerHtml,
      summaryHtml,
      '  <p class="aicm-eyebrow">対象大項目</p>',
      '  <ul class="aicm-selected-note">' + itemHtml + '</ul>',
      errorHtml,
      payloadPreviewHtml,
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-mgr-major-card-confirm-yes"' + yesDisabled + yesStyle + '>Yes</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-confirm-no">No</button>',
      '  </div>',
      '  <p class="aicm-selected-note">この確認画面ではDB更新/API POSTは実行しません。</p>',
      '</div>'
    ].join("");
  }
`;

const canonicalActionBlock = `
      // ${marker}_ACTION_ROUTE
      if (action === "r8z-c2d-apply-section-select") {
        var c2dRouteRoot = target && target.closest ? target.closest("[data-r8z-c2d-route-picker]") : null;
        var c2dSectionSelect = c2dRouteRoot && c2dRouteRoot.querySelector
          ? c2dRouteRoot.querySelector("[data-r8z-c2d-section-select]")
          : (typeof document !== "undefined" ? document.getElementById("aicm-r8z-c2d-section-select") : null);

        var c2dOption = c2dSectionSelect && c2dSectionSelect.options
          ? c2dSectionSelect.options[c2dSectionSelect.selectedIndex]
          : null;

        var c2dSectionId = c2dSectionSelect ? String(c2dSectionSelect.value || "").trim() : "";

        if (!c2dSectionId || !c2dOption) {
          if (typeof setMessage === "function") setMessage("error", "課を選択してください。");
          aicmR8zMgrMajorCardRerender("r8z_c2d_section_select_empty");
          return;
        }

        var sectionSnapshot = {
          sectionId: String(c2dOption.getAttribute("data-section-id") || c2dSectionId || "").trim(),
          sectionLabel: String(c2dOption.getAttribute("data-section-label") || c2dOption.textContent || "").trim(),
          departmentId: String(c2dOption.getAttribute("data-department-id") || "").trim(),
          departmentLabel: String(c2dOption.getAttribute("data-department-label") || "").trim()
        };

        var appliedRoute = aicmR8zC2cApplySectionChoice(c2dSectionId, sectionSnapshot);

        if (!appliedRoute || !appliedRoute.sectionId) {
          if (typeof setMessage === "function") setMessage("error", "選択した課を適用できません。再読み込みしてください。");
          aicmR8zMgrMajorCardRerender("r8z_c2d_section_apply_failed");
          return;
        }

        if (typeof setMessage === "function") {
          setMessage("ok", "引き渡し先の課を適用しました: " + appliedRoute.sectionLabel);
        }

        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-c2d-apply-leader-select") {
        var c2dLeaderRoot = target && target.closest ? target.closest("[data-r8z-c2d-route-picker]") : null;
        var c2dLeaderSelect = c2dLeaderRoot && c2dLeaderRoot.querySelector
          ? c2dLeaderRoot.querySelector("[data-r8z-c2d-leader-select]")
          : (typeof document !== "undefined" ? document.getElementById("aicm-r8z-c2d-leader-select") : null);

        var c2dLeaderPlacementId = c2dLeaderSelect ? String(c2dLeaderSelect.value || "").trim() : "";

        if (!c2dLeaderPlacementId) {
          if (typeof setMessage === "function") setMessage("error", "Leaderを選択してください。");
          aicmR8zMgrMajorCardRerender("r8z_c2d_leader_select_empty");
          return;
        }

        aicmR8zC2cApplyLeaderChoice(c2dLeaderPlacementId);

        if (typeof setMessage === "function") {
          setMessage("ok", "Leaderを適用しました。");
        }

        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-c2d-clear-route") {
        aicmR8zC2cClearRouteChoice();
        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

`;

src = replaceFunction(src, 'aicmR8zC2cBag', bagReplacement);
src = replaceFunction(src, 'aicmR8zC2cChoice', choiceReplacement);
src = replaceFunction(src, 'aicmR8zC2cNormalizeSection', normalizeSectionReplacement);
src = replaceFunction(src, 'aicmR8zC2cSectionCandidates', sectionCandidatesReplacement);
src = replaceFunction(src, 'aicmR8zC2cApplySectionChoice', applySectionReplacement);
src = replaceFunction(src, 'aicmR8zC2cApplyLeaderChoice', applyLeaderReplacement);
src = replaceFunction(src, 'aicmR8zC2cClearRouteChoice', clearRouteReplacement);
src = replaceFunction(src, 'aicmR8zC2cEffectiveRoute', effectiveRouteReplacement);
src = replaceFunction(src, 'aicmR8zC2cRenderRoutePicker', routePickerReplacement);
src = replaceFunction(src, 'aicmR8zC2bBuildLeaderHandoffPayload', payloadReplacement);
src = replaceFunction(src, 'aicmR8zC2bValidateLeaderHandoffRows', validateReplacement);
src = replaceFunction(src, 'aicmR8zMgrMajorCardOpenConfirm', openConfirmReplacement);
src = replaceFunction(src, 'aicmR8zMgrMajorCardRenderConfirm', renderConfirmReplacement);
src = replaceHandleC2Region(src, canonicalActionBlock);

const names = [
  'aicmR8zC2cBag',
  'aicmR8zC2cChoice',
  'aicmR8zC2cNormalizeSection',
  'aicmR8zC2cSectionCandidates',
  'aicmR8zC2cApplySectionChoice',
  'aicmR8zC2cApplyLeaderChoice',
  'aicmR8zC2cClearRouteChoice',
  'aicmR8zC2cEffectiveRoute',
  'aicmR8zC2cRenderRoutePicker',
  'aicmR8zC2bBuildLeaderHandoffPayload',
  'aicmR8zC2bValidateLeaderHandoffRows',
  'aicmR8zMgrMajorCardOpenConfirm',
  'aicmR8zMgrMajorCardRenderConfirm',
  'aicmR8zMgrMajorCardHandleAction'
];

const extracts = [];
extracts.push('AICompanyManager V10L-C2D route selection consolidation extracts');
extracts.push('DB_WRITE=NO');
extracts.push('API_POST=NO');
extracts.push('SERVER_PATCH=NO');
extracts.push('');

for (const name of names) {
  const fn = findFunctionRange(src, name);
  extracts.push('============================================================');
  extracts.push('FUNCTION=' + name + ' L' + fn.startLine + '-L' + fn.endLine);
  extracts.push(fn.text);
  extracts.push('');
}

fs.writeFileSync(extractOut, extracts.join('\n') + '\n');

const handleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');
const pickerFn = findFunctionRange(src, 'aicmR8zC2cRenderRoutePicker');
const bagFn = findFunctionRange(src, 'aicmR8zC2cBag');
const confirmFn = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');
const payloadFn = findFunctionRange(src, 'aicmR8zC2bBuildLeaderHandoffPayload');
const validateFn = findFunctionRange(src, 'aicmR8zC2bValidateLeaderHandoffRows');

const oldApplyInHandle =
  count(handleFn.text, 'r8z-c2c-apply-section-select') +
  count(handleFn.text, 'r8z-c2c3-apply-section-select') +
  count(handleFn.text, 'r8z-c2c4-apply-section-select');

const oldPickerActions =
  count(pickerFn.text, 'r8z-c2c-select-section') +
  count(pickerFn.text, 'r8z-c2c-select-leader') +
  count(pickerFn.text, 'r8z-c2c-apply-section-select') +
  count(pickerFn.text, 'r8z-c2c3-apply-section-select') +
  count(pickerFn.text, 'r8z-c2c4-apply-section-select');

const scope = handleFn.text + '\n' + pickerFn.text + '\n' + bagFn.text + '\n' + confirmFn.text + '\n' + payloadFn.text + '\n' + validateFn.text;

const verify = [];
verify.push('AICompanyManager V10L-C2D verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=SERVER_AWARE');
verify.push('');
verify.push('C2D_ACTION_ROUTE_COUNT=' + count(handleFn.text, marker + '_ACTION_ROUTE'));
verify.push('C2D_APPLY_SECTION_ACTION_IN_HANDLE=' + count(handleFn.text, 'r8z-c2d-apply-section-select'));
verify.push('C2D_APPLY_LEADER_ACTION_IN_HANDLE=' + count(handleFn.text, 'r8z-c2d-apply-leader-select'));
verify.push('C2D_CLEAR_ROUTE_ACTION_IN_HANDLE=' + count(handleFn.text, 'r8z-c2d-clear-route'));
verify.push('OLD_SECTION_APPLY_ACTIONS_IN_HANDLE=' + oldApplyInHandle);
verify.push('OLD_PICKER_ACTIONS_IN_PICKER=' + oldPickerActions);
verify.push('PICKER_SECTION_SELECT_COUNT=' + count(pickerFn.text, 'data-r8z-c2d-section-select'));
verify.push('PICKER_LEADER_SELECT_COUNT=' + count(pickerFn.text, 'data-r8z-c2d-leader-select'));
verify.push('PICKER_OPTION_DEPARTMENT_LABEL_COUNT=' + count(pickerFn.text, 'data-department-label'));
verify.push('BAG_USES_STATE_R8Z_SELECTION=' + count(bagFn.text, 'state.r8zMgrMajorCardSelection'));
verify.push('CONFIRM_LIVE_VALIDATION_COUNT=' + count(confirmFn.text, 'liveValidation'));
verify.push('CONFIRM_EFFECTIVE_ROUTE_COUNT=' + count(confirmFn.text, 'aicmR8zC2cEffectiveRoute'));
verify.push('PAYLOAD_EFFECTIVE_ROUTE_COUNT=' + count(payloadFn.text, 'aicmR8zC2cEffectiveRoute'));
verify.push('VALIDATE_EFFECTIVE_ROUTE_COUNT=' + count(validateFn.text, 'aicmR8zC2cEffectiveRoute'));
verify.push('FETCH_COUNT_IN_C2D_SCOPE=' + count(scope, 'fetch('));

if (count(handleFn.text, marker + '_ACTION_ROUTE') !== 1) throw new Error('C2D_ACTION_ROUTE_COUNT_NOT_1');
if (count(handleFn.text, 'r8z-c2d-apply-section-select') !== 1) throw new Error('C2D_SECTION_APPLY_ACTION_NOT_1_IN_HANDLE');
if (count(handleFn.text, 'r8z-c2d-apply-leader-select') !== 1) throw new Error('C2D_LEADER_APPLY_ACTION_NOT_1_IN_HANDLE');
if (count(handleFn.text, 'r8z-c2d-clear-route') !== 1) throw new Error('C2D_CLEAR_ACTION_NOT_1_IN_HANDLE');
if (oldApplyInHandle !== 0) throw new Error('OLD_SECTION_APPLY_ACTIONS_STILL_IN_HANDLE');
if (oldPickerActions !== 0) throw new Error('OLD_PICKER_ACTIONS_STILL_IN_PICKER');
if (count(pickerFn.text, 'data-r8z-c2d-section-select') < 1) throw new Error('C2D_SECTION_SELECT_MISSING');
if (count(pickerFn.text, 'data-department-label') < 1) throw new Error('C2D_DEPARTMENT_OPTION_DATA_MISSING');
if (count(bagFn.text, 'state.r8zMgrMajorCardSelection') < 1) throw new Error('C2D_BAG_NOT_USING_STATE_SELECTION');
if (count(confirmFn.text, 'liveValidation') < 1) throw new Error('C2D_CONFIRM_NOT_REVALIDATING');
if (count(scope, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_C2D_SCOPE');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
fs.writeFileSync(corePath, src);
