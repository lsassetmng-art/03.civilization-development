import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2D11R1_ROUTE_ENRICHMENT_PATCH_RETRY';
const handlerName = 'aicmR8zMgrMajorCardHandleAction';
const actionCode = 'r8z-mgr-major-card-route-apply-section';

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
    open,
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

function replaceFunction(text, fn, nextText) {
  return text.slice(0, fn.start) + nextText + text.slice(fn.close + 1);
}

if (count(src, marker) > 0) {
  throw new Error('C2D11R1_MARKER_ALREADY_EXISTS');
}

const handler = findFunctionRange(src, handlerName);
let handlerText = handler.text;

const block = `
      // ${marker}_START
      // Route enrichment when section is applied.
      // No DB write. No API POST. No fetch.
      try {
        var c2d11r1Action = "";
        var c2d11r1Event = null;
        var c2d11r1Target = null;

        for (var c2d11r1I = 0; c2d11r1I < arguments.length; c2d11r1I += 1) {
          var c2d11r1Arg = arguments[c2d11r1I];

          if (!c2d11r1Event && c2d11r1Arg && c2d11r1Arg.preventDefault) c2d11r1Event = c2d11r1Arg;
          if (!c2d11r1Action && typeof c2d11r1Arg === "string") c2d11r1Action = String(c2d11r1Arg || "").trim();
          if (!c2d11r1Target && c2d11r1Arg && c2d11r1Arg.getAttribute) c2d11r1Target = c2d11r1Arg;

          if (!c2d11r1Target && c2d11r1Arg && c2d11r1Arg.target) {
            if (c2d11r1Arg.target.closest) {
              c2d11r1Target = c2d11r1Arg.target.closest("[data-core-action]");
            } else if (c2d11r1Arg.target.getAttribute) {
              c2d11r1Target = c2d11r1Arg.target;
            }
          }
        }

        if (!c2d11r1Action && c2d11r1Target && c2d11r1Target.getAttribute) {
          c2d11r1Action = String(c2d11r1Target.getAttribute("data-core-action") || "").trim();
        }

        if (c2d11r1Action === "${actionCode}") {
          if (c2d11r1Event && c2d11r1Event.preventDefault) c2d11r1Event.preventDefault();
          if (c2d11r1Event && c2d11r1Event.stopPropagation) c2d11r1Event.stopPropagation();

          function c2d11r1Text(v) {
            if (v === null || typeof v === "undefined") return "";
            return String(v).trim();
          }

          function c2d11r1Get(obj, keys) {
            if (!obj || typeof obj !== "object") return "";
            for (var gi = 0; gi < keys.length; gi += 1) {
              var k = keys[gi];
              if (obj[k] !== null && typeof obj[k] !== "undefined" && String(obj[k]).trim() !== "") {
                return String(obj[k]).trim();
              }
            }
            return "";
          }

          function c2d11r1Arr(v) {
            return Array.isArray(v) ? v : [];
          }

          function c2d11r1Attr(el, keys) {
            if (!el || !el.getAttribute) return "";
            for (var ai = 0; ai < keys.length; ai += 1) {
              var av = c2d11r1Text(el.getAttribute(keys[ai]));
              if (av) return av;
            }
            return "";
          }

          var c2d11r1Root = null;
          if (c2d11r1Target && c2d11r1Target.closest) {
            c2d11r1Root =
              c2d11r1Target.closest("[data-r8z-mgr-major-card-route-picker]") ||
              c2d11r1Target.closest("[data-aicm-route-picker]") ||
              c2d11r1Target.closest(".aicm-core-card") ||
              c2d11r1Target.closest("section") ||
              c2d11r1Target.closest("div");
          }

          var c2d11r1Select = null;
          if (c2d11r1Root && c2d11r1Root.querySelector) {
            c2d11r1Select =
              c2d11r1Root.querySelector("select[data-r8z-c2d-route-section-select]") ||
              c2d11r1Root.querySelector("select[data-section-select]") ||
              c2d11r1Root.querySelector("select");
          }

          var c2d11r1Option = null;
          if (c2d11r1Select && c2d11r1Select.options && c2d11r1Select.selectedIndex >= 0) {
            c2d11r1Option = c2d11r1Select.options[c2d11r1Select.selectedIndex];
          }

          var c2d11r1Ctx = state && state.context && typeof state.context === "object" ? state.context : {};

          var c2d11r1Rows = [];
          if (typeof aicmR8zMgrMajorCardSelectedRows === "function") {
            try {
              c2d11r1Rows = aicmR8zMgrMajorCardSelectedRows() || [];
            } catch (_) {
              c2d11r1Rows = [];
            }
          }
          var c2d11r1Row = c2d11r1Rows.length ? (c2d11r1Rows[0] || {}) : {};

          var sectionId =
            c2d11r1Attr(c2d11r1Option, ["data-section-id", "data-aicm-section-id", "value"]) ||
            c2d11r1Text(c2d11r1Select && c2d11r1Select.value) ||
            c2d11r1Get(c2d11r1Row, ["section_id", "sectionId"]);

          var sectionLabel =
            c2d11r1Attr(c2d11r1Option, ["data-section-label", "data-section-name", "data-label"]) ||
            c2d11r1Text(c2d11r1Option && (c2d11r1Option.textContent || c2d11r1Option.innerText)) ||
            c2d11r1Get(c2d11r1Row, ["section_name", "section_label", "sectionLabel"]);

          var departmentId =
            c2d11r1Attr(c2d11r1Option, ["data-department-id", "data-aicm-department-id"]) ||
            c2d11r1Get(c2d11r1Row, ["department_id", "departmentId"]);

          var departmentLabel =
            c2d11r1Attr(c2d11r1Option, ["data-department-label", "data-department-name"]) ||
            c2d11r1Get(c2d11r1Row, ["department_name", "department_label", "departmentLabel"]);

          var leaderLabel =
            c2d11r1Attr(c2d11r1Option, ["data-leader-label", "data-assigned-leader-label", "data-leader-name"]) ||
            c2d11r1Get(c2d11r1Row, ["assigned_leader_label", "leader_robot_label", "responsible_robot_label", "leaderLabel"]);

          var leaderPlacementId =
            c2d11r1Attr(c2d11r1Option, ["data-leader-placement-id", "data-placement-id"]) ||
            c2d11r1Get(c2d11r1Row, ["leader_placement_id", "leaderPlacementId", "assigned_leader_placement_id"]);

          var sections = []
            .concat(c2d11r1Arr(c2d11r1Ctx.sections))
            .concat(c2d11r1Arr(c2d11r1Ctx.organizations))
            .concat(c2d11r1Arr(c2d11r1Ctx.department_sections));

          var matchedSection = null;
          for (var si = 0; si < sections.length; si += 1) {
            var s = sections[si] || {};
            var sid = c2d11r1Get(s, ["aicm_user_company_section_id", "section_id", "organization_id", "id", "sectionId"]);
            var slabel = c2d11r1Get(s, ["section_name", "organization_name", "name", "section_label", "sectionLabel"]);

            if ((sectionId && sid === sectionId) || (sectionLabel && slabel === sectionLabel)) {
              matchedSection = s;
              break;
            }
          }

          if (matchedSection) {
            sectionId = sectionId || c2d11r1Get(matchedSection, ["aicm_user_company_section_id", "section_id", "organization_id", "id", "sectionId"]);
            sectionLabel = sectionLabel || c2d11r1Get(matchedSection, ["section_name", "organization_name", "name", "section_label", "sectionLabel"]);

            departmentId = departmentId || c2d11r1Get(matchedSection, [
              "department_id",
              "parent_department_id",
              "aicm_user_company_department_id",
              "departmentId"
            ]);

            departmentLabel = departmentLabel || c2d11r1Get(matchedSection, [
              "department_name",
              "parent_department_name",
              "department_label",
              "departmentLabel"
            ]);

            leaderLabel = leaderLabel || c2d11r1Get(matchedSection, [
              "assigned_leader_label",
              "leader_robot_label",
              "leader_label",
              "responsible_robot_label",
              "responsible_role_label",
              "leaderLabel"
            ]);

            leaderPlacementId = leaderPlacementId || c2d11r1Get(matchedSection, [
              "leader_placement_id",
              "leaderPlacementId",
              "assigned_leader_placement_id"
            ]);
          }

          var departments = []
            .concat(c2d11r1Arr(c2d11r1Ctx.departments))
            .concat(c2d11r1Arr(c2d11r1Ctx.departmentList));

          if (departmentId && !departmentLabel) {
            for (var di = 0; di < departments.length; di += 1) {
              var d = departments[di] || {};
              var did = c2d11r1Get(d, ["aicm_user_company_department_id", "department_id", "id", "departmentId"]);
              if (did === departmentId) {
                departmentLabel = c2d11r1Get(d, ["department_name", "name", "department_label", "departmentLabel"]);
                break;
              }
            }
          }

          var placements = []
            .concat(c2d11r1Arr(c2d11r1Ctx.placements))
            .concat(c2d11r1Arr(c2d11r1Ctx.robot_placements))
            .concat(c2d11r1Arr(c2d11r1Ctx.organization_placements));

          if (!leaderLabel || !leaderPlacementId) {
            for (var pi = 0; pi < placements.length; pi += 1) {
              var p = placements[pi] || {};
              var psid = c2d11r1Get(p, ["section_id", "organization_id", "aicm_user_company_section_id", "sectionId"]);
              var pslabel = c2d11r1Get(p, ["section_name", "organization_name", "section_label", "sectionLabel"]);
              var role = c2d11r1Get(p, ["role_code", "placement_role_code", "assigned_role_code", "roleCode"]).toLowerCase();
              var roleLabel = c2d11r1Get(p, ["role_label", "placement_role_label"]);

              var sameSection =
                (sectionId && psid === sectionId) ||
                (sectionLabel && pslabel === sectionLabel);

              var isLeader =
                role === "leader" ||
                role === "section_leader" ||
                role === "課長" ||
                roleLabel.indexOf("Leader") >= 0 ||
                roleLabel.indexOf("課長") >= 0;

              if (sameSection && isLeader) {
                leaderLabel = leaderLabel || c2d11r1Get(p, [
                  "internal_nickname",
                  "robot_internal_nickname",
                  "placement_label",
                  "robot_display_name",
                  "robot_name",
                  "display_name",
                  "name"
                ]);
                leaderPlacementId = leaderPlacementId || c2d11r1Get(p, [
                  "placement_id",
                  "robot_placement_id",
                  "aicm_robot_placement_id",
                  "id"
                ]);
                break;
              }
            }
          }

          var selectionState = null;
          if (typeof aicmR8zMgrMajorCardSelectionState === "function") {
            try {
              selectionState = aicmR8zMgrMajorCardSelectionState();
            } catch (_) {
              selectionState = null;
            }
          }

          if (!selectionState) {
            if (!state.r8zMgrMajorCardSelection || typeof state.r8zMgrMajorCardSelection !== "object") {
              state.r8zMgrMajorCardSelection = {};
            }
            selectionState = state.r8zMgrMajorCardSelection;
          }

          if (!selectionState.handoffBatchRoute || typeof selectionState.handoffBatchRoute !== "object") {
            selectionState.handoffBatchRoute = {};
          }

          var route = selectionState.handoffBatchRoute;

          route.applied = true;
          route.applied_flag = true;
          route.appliedLabel = "適用済み";
          route.applied_label = "適用済み";

          route.sectionId = sectionId;
          route.section_id = sectionId;
          route.sectionLabel = sectionLabel;
          route.section_label = sectionLabel;
          route.sectionName = sectionLabel;
          route.section_name = sectionLabel;

          route.departmentId = departmentId;
          route.department_id = departmentId;
          route.departmentLabel = departmentLabel;
          route.department_label = departmentLabel;
          route.departmentName = departmentLabel;
          route.department_name = departmentLabel;

          route.leaderPlacementId = leaderPlacementId;
          route.leader_placement_id = leaderPlacementId;
          route.leaderLabel = leaderLabel;
          route.leader_label = leaderLabel;
          route.assigned_leader_label = leaderLabel;

          route.departmentMissing = !departmentLabel;
          route.leaderMissing = !leaderLabel;
          route.lastAppliedAt = (new Date()).toISOString();

          state.r8zMgrMajorCardRouteEnrichmentDebug = {
            marker: "${marker}",
            at: route.lastAppliedAt,
            action: c2d11r1Action,
            sectionId: sectionId,
            sectionLabel: sectionLabel,
            departmentId: departmentId,
            departmentLabel: departmentLabel,
            leaderPlacementId: leaderPlacementId,
            leaderLabel: leaderLabel,
            matchedSection: !!matchedSection,
            selectedRows: c2d11r1Rows.length
          };

          if (typeof setMessage === "function") {
            if (departmentLabel && leaderLabel) {
              setMessage("ok", "課・部門・Leaderを一括引き渡し先へ適用しました。");
            } else if (departmentLabel) {
              setMessage("ok", "課と部門を一括引き渡し先へ適用しました。Leaderは未設定です。");
            } else {
              setMessage("error", "課は適用しましたが、部門情報を特定できません。課設定または台帳行を確認してください。");
            }
          }

          if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
            aicmRenderTaskLedgerSafeR8V4("c2d11r1-route-enrichment");
            return;
          }

          if (typeof render === "function") {
            render();
            return;
          }

          return;
        }
      } catch (c2d11r1Error) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("C2D11R1 route enrichment failed", c2d11r1Error);
        }
      }
      // ${marker}_END

`;

handlerText = handlerText.slice(0, handler.open - handler.start + 1) + block + handlerText.slice(handler.open - handler.start + 1);
src = replaceFunction(src, handler, handlerText);

fs.writeFileSync(corePath, src);

const patchedHandler = findFunctionRange(src, handlerName);

const extract = [];
extract.push('AICompanyManager V10L-C2D11R1 patched handler extract');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('CORE_PATCH=YES');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('FUNCTION=' + handlerName);
extract.push('FUNCTION_LINES=' + patchedHandler.startLine + '-' + patchedHandler.endLine);
extract.push('');
extract.push(patchedHandler.text);
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const markerTotal = count(src, marker);
const startCount = count(src, marker + '_START');
const endCount = count(src, marker + '_END');
const debugMarkerAssignmentCount = count(src, 'marker: "' + marker + '"');

const verify = [];
verify.push('AICompanyManager V10L-C2D11R1 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('FUNCTION=' + handlerName);
verify.push('FUNCTION_LINES=' + patchedHandler.startLine + '-' + patchedHandler.endLine);
verify.push('C2D11R1_MARKER_TOTAL_COUNT=' + markerTotal);
verify.push('C2D11R1_START_COUNT=' + startCount);
verify.push('C2D11R1_END_COUNT=' + endCount);
verify.push('C2D11R1_DEBUG_MARKER_ASSIGNMENT_COUNT=' + debugMarkerAssignmentCount);
verify.push('ACTION_GATE_COUNT=' + count(patchedHandler.text, 'c2d11r1Action === "' + actionCode + '"'));
verify.push('DEPARTMENT_ROUTE_WRITE_COUNT=' + (count(patchedHandler.text, 'departmentLabel') + count(patchedHandler.text, 'department_label')));
verify.push('LEADER_ROUTE_WRITE_COUNT=' + (count(patchedHandler.text, 'leaderLabel') + count(patchedHandler.text, 'leader_label')));
verify.push('SECTION_ROUTE_WRITE_COUNT=' + (count(patchedHandler.text, 'sectionLabel') + count(patchedHandler.text, 'section_label')));
verify.push('FETCH_IN_INSERTED_BLOCK=' + count(block, 'fetch('));
verify.push('XMLHTTP_IN_INSERTED_BLOCK=' + count(block, 'XMLHttpRequest'));
verify.push('EXTRACT_OUT=' + extractOut);

if (markerTotal !== 3) throw new Error('C2D11R1_MARKER_TOTAL_COUNT_NOT_3');
if (startCount !== 1) throw new Error('C2D11R1_START_COUNT_NOT_1');
if (endCount !== 1) throw new Error('C2D11R1_END_COUNT_NOT_1');
if (debugMarkerAssignmentCount !== 1) throw new Error('C2D11R1_DEBUG_MARKER_ASSIGNMENT_COUNT_NOT_1');
if (count(patchedHandler.text, 'c2d11r1Action === "' + actionCode + '"') !== 1) throw new Error('ACTION_GATE_COUNT_NOT_1');
if (count(block, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_INSERTED_BLOCK');
if (count(block, 'XMLHttpRequest') !== 0) throw new Error('XMLHTTP_FOUND_IN_INSERTED_BLOCK');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
