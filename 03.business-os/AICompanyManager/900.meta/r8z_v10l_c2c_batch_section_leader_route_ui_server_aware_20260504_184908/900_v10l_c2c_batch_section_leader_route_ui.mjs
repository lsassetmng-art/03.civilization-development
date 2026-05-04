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
    if (state === 'lineComment') { if (ch === '\n') state = 'normal'; continue; }
    if (state === 'blockComment') { if (ch === '*' && nx === '/') { state = 'normal'; i += 1; } continue; }
    if (state === 'single') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === "'") state = 'normal'; continue; }
    if (state === 'double') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === '"') state = 'normal'; continue; }
    if (state === 'template') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === '`') state = 'normal'; continue; }
    if (ch === '/' && nx === '/') { state = 'lineComment'; i += 1; continue; }
    if (ch === '/' && nx === '*') { state = 'blockComment'; i += 1; continue; }
    if (ch === "'") { state = 'single'; continue; }
    if (ch === '"') { state = 'double'; continue; }
    if (ch === '`') { state = 'template'; continue; }
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
    if (state === 'lineComment') { if (ch === '\n') state = 'normal'; continue; }
    if (state === 'blockComment') { if (ch === '*' && nx === '/') { state = 'normal'; i += 1; } continue; }
    if (state === 'single') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === "'") state = 'normal'; continue; }
    if (state === 'double') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === '"') state = 'normal'; continue; }
    if (state === 'template') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === '`') state = 'normal'; continue; }
    if (ch === '/' && nx === '/') { state = 'lineComment'; i += 1; continue; }
    if (ch === '/' && nx === '*') { state = 'blockComment'; i += 1; continue; }
    if (ch === "'") { state = 'single'; continue; }
    if (ch === '"') { state = 'double'; continue; }
    if (ch === '`') { state = 'template'; continue; }
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
  return { name, start, close, startLine: lineNoAt(text, start), endLine: lineNoAt(text, close), text: text.slice(start, close + 1) };
}

function replaceFunction(text, name, replacement) {
  const fn = findFunctionRange(text, name);
  return text.slice(0, fn.start) + replacement + text.slice(fn.close + 1);
}

function insertBeforeFunction(text, name, block, marker) {
  if (text.includes(marker)) return text;
  const fn = findFunctionRange(text, name);
  return text.slice(0, fn.start) + block + '\n' + text.slice(fn.start);
}

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2C_BATCH_SECTION_LEADER_ROUTE';

if (!src.includes('AICM_R8Z_MGR_MAJOR_CARD_C2B_PAYLOAD_VALIDATION_HELPERS_START')) {
  throw new Error('C2B_HELPERS_NOT_FOUND');
}
if (!src.includes('AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_HELPER_START')) {
  throw new Error('C1F_HELPERS_NOT_FOUND');
}

const helperBlock = `
  // ${marker}_HELPERS_START
  // C2C: selected major items share one batch section route. DB_WRITE=NO / API_POST=NO.
  function aicmR8zC2cAttr(target, name) {
    if (!target || !target.getAttribute) return "";
    return String(target.getAttribute(name) || "").trim();
  }

  function aicmR8zC2cText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8zC2cBag() {
    var bag = typeof aicmR8zMgrMajorCardState === "function" ? aicmR8zMgrMajorCardState() : {};
    if (!bag.handoffBatchRoute || typeof bag.handoffBatchRoute !== "object") {
      bag.handoffBatchRoute = {
        sectionId: "",
        sectionLabel: "",
        departmentId: "",
        departmentLabel: "",
        leaderPlacementId: "",
        leaderId: "",
        leaderLabel: ""
      };
    }
    return bag;
  }

  function aicmR8zC2cChoice() {
    return aicmR8zC2cBag().handoffBatchRoute;
  }

  function aicmR8zC2cAsArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function aicmR8zC2cContext() {
    return state && state.context && typeof state.context === "object" ? state.context : {};
  }

  function aicmR8zC2cField(row, keys) {
    row = row && typeof row === "object" ? row : {};
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (row[key] !== null && typeof row[key] !== "undefined" && String(row[key]).trim() !== "") {
        return String(row[key]).trim();
      }
    }
    return "";
  }

  function aicmR8zC2cNormalizeSection(row, index) {
    row = row && typeof row === "object" ? row : {};
    var sectionId = aicmR8zC2cField(row, ["section_id", "aicm_section_id", "organization_id", "department_section_id", "id"]);
    var sectionLabel = aicmR8zC2cField(row, ["section_name", "section_label", "organization_name", "organization_label", "name", "label"]);
    var departmentId = aicmR8zC2cField(row, ["department_id", "aicm_department_id", "parent_department_id"]);
    var departmentLabel = aicmR8zC2cField(row, ["department_name", "department_label", "parent_department_name"]);
    if (!sectionId && sectionLabel) sectionId = "section-label-" + String(index);
    return {
      sectionId: sectionId,
      sectionLabel: sectionLabel || sectionId || "課",
      departmentId: departmentId,
      departmentLabel: departmentLabel
    };
  }

  function aicmR8zC2cSectionCandidates() {
    var ctx = aicmR8zC2cContext();
    var source = []
      .concat(aicmR8zC2cAsArray(ctx.sections))
      .concat(aicmR8zC2cAsArray(ctx.section_list))
      .concat(aicmR8zC2cAsArray(ctx.organizations))
      .concat(aicmR8zC2cAsArray(ctx.organization_list));

    if (!source.length) {
      source = aicmR8zMgrMajorCardSelectedRows().map(function (row) {
        return row || {};
      });
    }

    var seen = {};
    var list = [];

    source.forEach(function (row, index) {
      var section = aicmR8zC2cNormalizeSection(row, index);
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

  function aicmR8zC2cPlacementRole(row) {
    return String(
      aicmR8zC2cField(row, [
        "placement_role_code",
        "role_code",
        "assigned_role_code",
        "worker_role_code",
        "aicm_role_code",
        "placement_role_code_1",
        "placement_role_code_2",
        "placement_role_code_3",
        "role_label"
      ])
    ).toLowerCase();
  }

  function aicmR8zC2cIsLeaderPlacement(row) {
    var role = aicmR8zC2cPlacementRole(row);
    var label = String(
      aicmR8zC2cField(row, [
        "placement_role_label",
        "role_label",
        "internal_nickname",
        "display_name",
        "robot_display_name",
        "robot_model_name"
      ])
    ).toLowerCase();

    return role.indexOf("leader") >= 0 ||
      role.indexOf("課長") >= 0 ||
      label.indexOf("leader") >= 0 ||
      label.indexOf("課長") >= 0;
  }

  function aicmR8zC2cPlacementSectionId(row) {
    return aicmR8zC2cField(row, [
      "section_id",
      "aicm_section_id",
      "organization_id",
      "department_section_id",
      "assigned_section_id"
    ]);
  }

  function aicmR8zC2cNormalizeLeader(row, index) {
    row = row && typeof row === "object" ? row : {};
    var leaderPlacementId = aicmR8zC2cField(row, [
      "placement_id",
      "robot_placement_id",
      "leader_placement_id",
      "aicm_robot_placement_id",
      "id"
    ]);

    var leaderId = aicmR8zC2cField(row, [
      "robot_id",
      "leader_id",
      "assigned_leader_id",
      "worker_robot_id",
      "aiworker_robot_id"
    ]);

    var leaderLabel = aicmR8zC2cField(row, [
      "internal_nickname",
      "placement_label",
      "robot_display_name",
      "robot_model_name",
      "display_name",
      "name",
      "leader_label"
    ]);

    var sectionId = aicmR8zC2cPlacementSectionId(row);

    if (!leaderPlacementId && leaderLabel) leaderPlacementId = "leader-label-" + String(index);

    return {
      leaderPlacementId: leaderPlacementId,
      leaderId: leaderId,
      leaderLabel: leaderLabel || leaderPlacementId || leaderId || "Leader",
      sectionId: sectionId
    };
  }

  function aicmR8zC2cLeaderCandidatesForSection(sectionId) {
    var ctx = aicmR8zC2cContext();
    var source = []
      .concat(aicmR8zC2cAsArray(ctx.placements))
      .concat(aicmR8zC2cAsArray(ctx.robotPlacements))
      .concat(aicmR8zC2cAsArray(ctx.robot_placements))
      .concat(aicmR8zC2cAsArray(ctx.organizationPlacements))
      .concat(aicmR8zC2cAsArray(ctx.section_placements));

    var list = [];
    var seen = {};

    source.forEach(function (row, index) {
      if (!aicmR8zC2cIsLeaderPlacement(row)) return;

      var placementSectionId = aicmR8zC2cPlacementSectionId(row);
      if (sectionId && placementSectionId && placementSectionId !== sectionId) return;

      var leader = aicmR8zC2cNormalizeLeader(row, index);
      var key = leader.leaderPlacementId || leader.leaderId || leader.leaderLabel;
      if (!key || seen[key]) return;

      seen[key] = true;
      list.push(leader);
    });

    list.sort(function (a, b) {
      return String(a.leaderLabel || "").localeCompare(String(b.leaderLabel || ""), "ja");
    });

    return list;
  }

  function aicmR8zC2cFindSection(sectionId) {
    var sections = aicmR8zC2cSectionCandidates();
    for (var i = 0; i < sections.length; i += 1) {
      if (String(sections[i].sectionId || "") === String(sectionId || "")) return sections[i];
    }
    return null;
  }

  function aicmR8zC2cFindLeader(sectionId, leaderPlacementId) {
    var leaders = aicmR8zC2cLeaderCandidatesForSection(sectionId);
    for (var i = 0; i < leaders.length; i += 1) {
      if (String(leaders[i].leaderPlacementId || "") === String(leaderPlacementId || "")) return leaders[i];
    }
    return null;
  }

  function aicmR8zC2cApplySectionChoice(sectionId) {
    var bag = aicmR8zC2cBag();
    var section = aicmR8zC2cFindSection(sectionId);

    bag.handoffBatchRoute = {
      sectionId: section ? section.sectionId : "",
      sectionLabel: section ? section.sectionLabel : "",
      departmentId: section ? section.departmentId : "",
      departmentLabel: section ? section.departmentLabel : "",
      leaderPlacementId: "",
      leaderId: "",
      leaderLabel: ""
    };

    var leaders = aicmR8zC2cLeaderCandidatesForSection(bag.handoffBatchRoute.sectionId);
    if (leaders.length === 1) {
      bag.handoffBatchRoute.leaderPlacementId = leaders[0].leaderPlacementId;
      bag.handoffBatchRoute.leaderId = leaders[0].leaderId;
      bag.handoffBatchRoute.leaderLabel = leaders[0].leaderLabel;
    }

    return bag.handoffBatchRoute;
  }

  function aicmR8zC2cApplyLeaderChoice(leaderPlacementId) {
    var bag = aicmR8zC2cBag();
    var choice = bag.handoffBatchRoute || {};
    var leader = aicmR8zC2cFindLeader(choice.sectionId, leaderPlacementId);

    if (leader) {
      choice.leaderPlacementId = leader.leaderPlacementId;
      choice.leaderId = leader.leaderId;
      choice.leaderLabel = leader.leaderLabel;
    }

    bag.handoffBatchRoute = choice;
    return choice;
  }

  function aicmR8zC2cClearRouteChoice() {
    var bag = aicmR8zC2cBag();
    bag.handoffBatchRoute = {
      sectionId: "",
      sectionLabel: "",
      departmentId: "",
      departmentLabel: "",
      leaderPlacementId: "",
      leaderId: "",
      leaderLabel: ""
    };
    return bag.handoffBatchRoute;
  }

  function aicmR8zC2cEffectiveRoute() {
    var choice = aicmR8zC2cChoice();
    var sectionId = aicmR8zC2cText(choice.sectionId || "");
    var leaders = sectionId ? aicmR8zC2cLeaderCandidatesForSection(sectionId) : [];

    var leaderPlacementId = aicmR8zC2cText(choice.leaderPlacementId || "");
    var leaderId = aicmR8zC2cText(choice.leaderId || "");
    var leaderLabel = aicmR8zC2cText(choice.leaderLabel || "");

    if (!leaderPlacementId && leaders.length === 1) {
      leaderPlacementId = leaders[0].leaderPlacementId;
      leaderId = leaders[0].leaderId;
      leaderLabel = leaders[0].leaderLabel;
    }

    return {
      clear: !!sectionId && !!(leaderPlacementId || leaderId || leaderLabel) && leaders.length > 0,
      sectionId: sectionId,
      sectionLabel: aicmR8zC2cText(choice.sectionLabel || ""),
      departmentId: aicmR8zC2cText(choice.departmentId || ""),
      departmentLabel: aicmR8zC2cText(choice.departmentLabel || ""),
      leaderPlacementId: leaderPlacementId,
      leaderId: leaderId,
      leaderLabel: leaderLabel,
      leaderCount: leaders.length,
      displayLeader: leaderLabel || leaderPlacementId || leaderId || "",
      displaySection: aicmR8zC2cText(choice.sectionLabel || sectionId || ""),
      displayDepartment: aicmR8zC2cText(choice.departmentLabel || choice.departmentId || "")
    };
  }

  function aicmR8zC2cRenderRoutePicker() {
    var sections = aicmR8zC2cSectionCandidates();
    var choice = aicmR8zC2cChoice();
    var selectedSectionId = aicmR8zC2cText(choice.sectionId || "");
    var leaders = selectedSectionId ? aicmR8zC2cLeaderCandidatesForSection(selectedSectionId) : [];

    var sectionButtons = sections.length
      ? sections.map(function (section) {
          var selected = selectedSectionId && section.sectionId === selectedSectionId;
          var style = selected ? ' style="border:2px solid #2563eb;background:#eff6ff;"' : "";
          return '<button type="button" data-core-action="r8z-c2c-select-section" data-r8z-c2c-section-id="' + escapeHtml(section.sectionId) + '"' + style + '>' + escapeHtml((section.departmentLabel ? section.departmentLabel + " / " : "") + section.sectionLabel) + '</button>';
        }).join("")
      : '<p class="aicm-selected-note">選択できる課がありません。部門/課の設定またはcontext読込を確認してください。</p>';

    var leaderButtons = "";

    if (!selectedSectionId) {
      leaderButtons = '<p class="aicm-selected-note">先に課を選択してください。</p>';
    } else if (!leaders.length) {
      leaderButtons = '<p class="aicm-selected-note">この課にLeaderが配置されていません。</p>';
    } else if (leaders.length === 1) {
      leaderButtons = '<p class="aicm-selected-note">Leaderは1人のため自動確定: ' + escapeHtml(leaders[0].leaderLabel) + '</p>';
    } else {
      leaderButtons = leaders.map(function (leader) {
        var selected = choice.leaderPlacementId && choice.leaderPlacementId === leader.leaderPlacementId;
        var style = selected ? ' style="border:2px solid #2563eb;background:#eff6ff;"' : "";
        return '<button type="button" data-core-action="r8z-c2c-select-leader" data-r8z-c2c-leader-placement-id="' + escapeHtml(leader.leaderPlacementId) + '"' + style + '>' + escapeHtml(leader.leaderLabel) + '</button>';
      }).join("");
    }

    return [
      '<div class="aicm-core-card" data-r8z-c2c-route-picker="1" style="margin:12px 0;border:1px solid #c7d2fe;">',
      '  <p class="aicm-eyebrow">引き渡し先 一括選択</p>',
      '  <h4>選択済み大項目をまとめて送る課を選択</h4>',
      '  <p class="aicm-selected-note">大項目ごとの個別課選択は行いません。ここで選んだ課/Leaderを、選択済み大項目すべてに適用します。</p>',
      '  <div class="aicm-dashboard-action-row" style="align-items:flex-start;">' + sectionButtons + '</div>',
      '  <h4>Leader</h4>',
      '  <div class="aicm-dashboard-action-row" style="align-items:flex-start;">' + leaderButtons + '</div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-c2c-clear-route">引き渡し先を解除</button>',
      '  </div>',
      '</div>'
    ].join("");
  }
  // ${marker}_HELPERS_END
`;

const payloadReplacement = `
  function aicmR8zC2bBuildLeaderHandoffPayload(row, index) {
    row = row && typeof row === "object" ? row : {};

    var majorId = typeof aicmR8zMgrMajorCardRowId === "function"
      ? aicmR8zMgrMajorCardRowId(row, index)
      : "";

    var route = typeof aicmR8zC2cEffectiveRoute === "function"
      ? aicmR8zC2cEffectiveRoute()
      : aicmR8zC2bLeaderRoute(row);

    var payload = {
      owner_civilization_id: aicmR8zC2bOwnerId(row),
      aicm_manager_major_work_item_id: majorId,
      assigned_leader_label: route.displayLeader || route.leaderLabel || "",
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
    } else if (route.leaderCount > 1 && !route.leaderPlacementId && !route.leaderId && !route.leaderLabel) {
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
    var yesStyle = hasErrors ? ' style="opacity:0.45;cursor:not-allowed;"' : "";
    var route = confirm.route || (typeof aicmR8zC2cEffectiveRoute === "function" ? aicmR8zC2cEffectiveRoute() : {});

    var routePickerHtml = typeof aicmR8zC2cRenderRoutePicker === "function"
      ? aicmR8zC2cRenderRoutePicker()
      : "";

    var summaryHtml = [
      '<div class="aicm-core-card" style="margin:12px 0;">',
      '<p class="aicm-eyebrow">一括引き渡し先</p>',
      '<div class="aicm-selected-note">部門: ' + escapeHtml(route.displayDepartment || "-") + '</div>',
      '<div class="aicm-selected-note">課: ' + escapeHtml(route.displaySection || "-") + '</div>',
      '<div class="aicm-selected-note">Leader: ' + escapeHtml(route.displayLeader || "-") + '</div>',
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

    aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_open_c2c");
  }
`;

src = insertBeforeFunction(src, 'aicmR8zC2bBuildLeaderHandoffPayload', helperBlock, marker + '_HELPERS_START');
src = replaceFunction(src, 'aicmR8zC2bBuildLeaderHandoffPayload', payloadReplacement);
src = replaceFunction(src, 'aicmR8zC2bValidateLeaderHandoffRows', validateReplacement);
src = replaceFunction(src, 'aicmR8zMgrMajorCardRenderConfirm', renderConfirmReplacement);
src = replaceFunction(src, 'aicmR8zMgrMajorCardOpenConfirm', openConfirmReplacement);

const handleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');
let handleText = handleFn.text;

if (!handleText.includes(marker + '_ACTION_ROUTE')) {
  const yesBranch = 'if (action === "r8z-mgr-major-card-confirm-yes") {';
  const idx = handleText.indexOf(yesBranch);
  if (idx < 0) throw new Error('CONFIRM_YES_BRANCH_NOT_FOUND_FOR_C2C_INSERT');

  const actionBlock = `
      // ${marker}_ACTION_ROUTE
      if (action === "r8z-c2c-select-section") {
        var c2cSectionId = aicmR8zC2cAttr(target, "data-r8z-c2c-section-id");
        aicmR8zC2cApplySectionChoice(c2cSectionId);
        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-c2c-select-leader") {
        var c2cLeaderPlacementId = aicmR8zC2cAttr(target, "data-r8z-c2c-leader-placement-id");
        aicmR8zC2cApplyLeaderChoice(c2cLeaderPlacementId);
        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-c2c-clear-route") {
        aicmR8zC2cClearRouteChoice();
        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

`;

  handleText = handleText.slice(0, idx) + actionBlock + handleText.slice(idx);
  src = src.slice(0, handleFn.start) + handleText + src.slice(handleFn.close + 1);
}

const helperStart = src.indexOf(marker + '_HELPERS_START');
const helperEnd = src.indexOf(marker + '_HELPERS_END');
const c2cExtract = helperStart >= 0 && helperEnd >= 0
  ? src.slice(helperStart, helperEnd + (marker + '_HELPERS_END').length)
  : '';

const renderConfirmFn = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');
const validateFn = findFunctionRange(src, 'aicmR8zC2bValidateLeaderHandoffRows');
const payloadFn = findFunctionRange(src, 'aicmR8zC2bBuildLeaderHandoffPayload');
const newHandleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');

const extract = [];
extract.push('AICompanyManager V10L-C2C helper extracts');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('============================================================');
extract.push('C2C_HELPERS');
extract.push(c2cExtract);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2bValidateLeaderHandoffRows');
extract.push(validateFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2bBuildLeaderHandoffPayload');
extract.push(payloadFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zMgrMajorCardRenderConfirm');
extract.push(renderConfirmFn.text);
extract.push('');
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const c2cText = c2cExtract + '\n' + validateFn.text + '\n' + payloadFn.text + '\n' + renderConfirmFn.text + '\n' + newHandleFn.text;

const verify = [];
verify.push('AICompanyManager V10L-C2C verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=SERVER_AWARE');
verify.push('');
verify.push('C2C_HELPER_MARKER_COUNT=' + count(src, marker + '_HELPERS_START'));
verify.push('C2C_ACTION_ROUTE_COUNT=' + count(newHandleFn.text, marker + '_ACTION_ROUTE'));
verify.push('C2C_ROUTE_PICKER_COUNT=' + count(src, 'function aicmR8zC2cRenderRoutePicker'));
verify.push('C2C_BATCH_COPY_COUNT=' + count(src, '大項目ごとの個別課選択は行いません'));
verify.push('C2C_SECTION_ACTION_COUNT=' + count(src, 'r8z-c2c-select-section'));
verify.push('C2C_LEADER_ACTION_COUNT=' + count(src, 'r8z-c2c-select-leader'));
verify.push('C2C_CLEAR_ROUTE_ACTION_COUNT=' + count(src, 'r8z-c2c-clear-route'));
verify.push('C2C_PAYLOAD_USES_EFFECTIVE_ROUTE=' + count(payloadFn.text, 'aicmR8zC2cEffectiveRoute'));
verify.push('C2C_VALIDATE_BATCH_SECTION_ERROR=' + count(validateFn.text, '引き渡し先の課を一括選択してください'));
verify.push('C2C_YES_DISABLED_STYLE_COUNT=' + count(renderConfirmFn.text, 'cursor:not-allowed'));
verify.push('FETCH_COUNT_IN_C2C_SCOPE=' + count(c2cText, 'fetch('));
verify.push('ENDPOINT_CANDIDATE_COUNT=' + count(src, '/api/aicm/v2/manager-major/update'));

if (count(src, marker + '_HELPERS_START') !== 1) throw new Error('C2C_HELPER_MARKER_COUNT_NOT_1');
if (count(newHandleFn.text, marker + '_ACTION_ROUTE') !== 1) throw new Error('C2C_ACTION_ROUTE_COUNT_NOT_1');
if (count(src, 'function aicmR8zC2cRenderRoutePicker') !== 1) throw new Error('C2C_ROUTE_PICKER_COUNT_NOT_1');
if (count(src, '大項目ごとの個別課選択は行いません') < 1) throw new Error('C2C_BATCH_COPY_MISSING');
if (count(payloadFn.text, 'aicmR8zC2cEffectiveRoute') < 1) throw new Error('C2C_PAYLOAD_NOT_USING_EFFECTIVE_ROUTE');
if (count(validateFn.text, '引き渡し先の課を一括選択してください') < 1) throw new Error('C2C_BATCH_SECTION_ERROR_MISSING');
if (count(c2cText, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_C2C_SCOPE');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
fs.writeFileSync(corePath, src);
