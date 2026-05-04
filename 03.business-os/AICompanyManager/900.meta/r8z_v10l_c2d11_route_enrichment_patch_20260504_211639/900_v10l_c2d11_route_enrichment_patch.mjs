import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2D11_ROUTE_ENRICHMENT_PATCH';
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
  throw new Error('C2D11_MARKER_ALREADY_EXISTS');
}

const handler = findFunctionRange(src, handlerName);
let handlerText = handler.text;

const enrichmentBlock = `
      // ${marker}_START
      // Canonical route enrichment for bulk Leader handoff.
      // Handles section apply inside the existing card action handler.
      // No DB write. No API POST. No fetch.
      try {
        var aicmC2d11Action = "";
        var aicmC2d11Event = null;
        var aicmC2d11Target = null;

        for (var aicmC2d11ArgIndex = 0; aicmC2d11ArgIndex < arguments.length; aicmC2d11ArgIndex += 1) {
          var aicmC2d11Arg = arguments[aicmC2d11ArgIndex];

          if (!aicmC2d11Event && aicmC2d11Arg && aicmC2d11Arg.preventDefault) {
            aicmC2d11Event = aicmC2d11Arg;
          }

          if (!aicmC2d11Action && typeof aicmC2d11Arg === "string") {
            aicmC2d11Action = String(aicmC2d11Arg || "").trim();
          }

          if (!aicmC2d11Target && aicmC2d11Arg && aicmC2d11Arg.getAttribute) {
            aicmC2d11Target = aicmC2d11Arg;
          }

          if (!aicmC2d11Target && aicmC2d11Arg && aicmC2d11Arg.target) {
            if (aicmC2d11Arg.target.closest) {
              aicmC2d11Target = aicmC2d11Arg.target.closest("[data-core-action]");
            } else if (aicmC2d11Arg.target.getAttribute) {
              aicmC2d11Target = aicmC2d11Arg.target;
            }
          }
        }

        if (!aicmC2d11Action && aicmC2d11Target && aicmC2d11Target.getAttribute) {
          aicmC2d11Action = String(aicmC2d11Target.getAttribute("data-core-action") || "").trim();
        }

        if (aicmC2d11Action === "${actionCode}") {
          if (aicmC2d11Event && aicmC2d11Event.preventDefault) aicmC2d11Event.preventDefault();
          if (aicmC2d11Event && aicmC2d11Event.stopPropagation) aicmC2d11Event.stopPropagation();

          var aicmC2d11Root = null;
          if (aicmC2d11Target && aicmC2d11Target.closest) {
            aicmC2d11Root =
              aicmC2d11Target.closest("[data-r8z-mgr-major-card-route-picker]") ||
              aicmC2d11Target.closest("[data-aicm-route-picker]") ||
              aicmC2d11Target.closest(".aicm-core-card") ||
              aicmC2d11Target.closest("section") ||
              aicmC2d11Target.closest("div");
          }

          var aicmC2d11Select = null;
          if (aicmC2d11Root && aicmC2d11Root.querySelector) {
            aicmC2d11Select =
              aicmC2d11Root.querySelector("select[data-r8z-c2d-route-section-select]") ||
              aicmC2d11Root.querySelector("select[data-section-select]") ||
              aicmC2d11Root.querySelector("select");
          }

          var aicmC2d11Option = null;
          if (aicmC2d11Select && aicmC2d11Select.options && aicmC2d11Select.selectedIndex >= 0) {
            aicmC2d11Option = aicmC2d11Select.options[aicmC2d11Select.selectedIndex];
          }

          function aicmC2d11Text(value) {
            if (value === null || typeof value === "undefined") return "";
            return String(value).trim();
          }

          function aicmC2d11Get(obj, keys) {
            if (!obj || typeof obj !== "object") return "";
            for (var aicmC2d11K = 0; aicmC2d11K < keys.length; aicmC2d11K += 1) {
              var aicmC2d11Key = keys[aicmC2d11K];
              if (obj[aicmC2d11Key] !== null && typeof obj[aicmC2d11Key] !== "undefined" && String(obj[aicmC2d11Key]).trim() !== "") {
                return String(obj[aicmC2d11Key]).trim();
              }
            }
            return "";
          }

          function aicmC2d11Attr(el, keys) {
            if (!el || !el.getAttribute) return "";
            for (var aicmC2d11A = 0; aicmC2d11A < keys.length; aicmC2d11A += 1) {
              var aicmC2d11Value = aicmC2d11Text(el.getAttribute(keys[aicmC2d11A]));
              if (aicmC2d11Value) return aicmC2d11Value;
            }
            return "";
          }

          function aicmC2d11Array(value) {
            return Array.isArray(value) ? value : [];
          }

          var aicmC2d11Ctx = state && state.context && typeof state.context === "object" ? state.context : {};
          var aicmC2d11SelectedRows = [];
          if (typeof aicmR8zMgrMajorCardSelectedRows === "function") {
            try {
              aicmC2d11SelectedRows = aicmR8zMgrMajorCardSelectedRows() || [];
            } catch (_) {
              aicmC2d11SelectedRows = [];
            }
          }

          var aicmC2d11SelectedRow = aicmC2d11SelectedRows && aicmC2d11SelectedRows.length ? (aicmC2d11SelectedRows[0] || {}) : {};

          var aicmC2d11SectionId =
            aicmC2d11Attr(aicmC2d11Option, ["data-section-id", "data-aicm-section-id", "value"]) ||
            aicmC2d11Text(aicmC2d11Select && aicmC2d11Select.value) ||
            aicmC2d11Get(aicmC2d11SelectedRow, ["section_id", "sectionId"]);

          var aicmC2d11SectionLabel =
            aicmC2d11Attr(aicmC2d11Option, ["data-section-label", "data-section-name", "data-label"]) ||
            aicmC2d11Text(aicmC2d11Option && (aicmC2d11Option.textContent || aicmC2d11Option.innerText)) ||
            aicmC2d11Get(aicmC2d11SelectedRow, ["section_name", "section_label", "sectionLabel"]);

          var aicmC2d11DepartmentId =
            aicmC2d11Attr(aicmC2d11Option, ["data-department-id", "data-aicm-department-id"]) ||
            aicmC2d11Get(aicmC2d11SelectedRow, ["department_id", "departmentId"]);

          var aicmC2d11DepartmentLabel =
            aicmC2d11Attr(aicmC2d11Option, ["data-department-label", "data-department-name"]) ||
            aicmC2d11Get(aicmC2d11SelectedRow, ["department_name", "department_label", "departmentLabel"]);

          var aicmC2d11LeaderLabel =
            aicmC2d11Attr(aicmC2d11Option, ["data-leader-label", "data-assigned-leader-label", "data-leader-name"]) ||
            aicmC2d11Get(aicmC2d11SelectedRow, ["assigned_leader_label", "leader_robot_label", "responsible_robot_label", "leaderLabel"]);

          var aicmC2d11LeaderPlacementId =
            aicmC2d11Attr(aicmC2d11Option, ["data-leader-placement-id", "data-placement-id"]) ||
            aicmC2d11Get(aicmC2d11SelectedRow, ["leader_placement_id", "leaderPlacementId", "assigned_leader_placement_id"]);

          var aicmC2d11Sections = []
            .concat(aicmC2d11Array(aicmC2d11Ctx.sections))
            .concat(aicmC2d11Array(aicmC2d11Ctx.organizations))
            .concat(aicmC2d11Array(aicmC2d11Ctx.department_sections));

          var aicmC2d11MatchedSection = null;
          for (var aicmC2d11S = 0; aicmC2d11S < aicmC2d11Sections.length; aicmC2d11S += 1) {
            var aicmC2d11Section = aicmC2d11Sections[aicmC2d11S] || {};
            var aicmC2d11Sid = aicmC2d11Get(aicmC2d11Section, [
              "aicm_user_company_section_id",
              "section_id",
              "organization_id",
              "id",
              "sectionId"
            ]);
            var aicmC2d11Slabel = aicmC2d11Get(aicmC2d11Section, [
              "section_name",
              "organization_name",
              "name",
              "section_label",
              "sectionLabel"
            ]);

            if ((aicmC2d11SectionId && aicmC2d11Sid === aicmC2d11SectionId) || (aicmC2d11SectionLabel && aicmC2d11Slabel === aicmC2d11SectionLabel)) {
              aicmC2d11MatchedSection = aicmC2d11Section;
              break;
            }
          }

          if (aicmC2d11MatchedSection) {
            if (!aicmC2d11SectionId) {
              aicmC2d11SectionId = aicmC2d11Get(aicmC2d11MatchedSection, [
                "aicm_user_company_section_id",
                "section_id",
                "organization_id",
                "id",
                "sectionId"
              ]);
            }

            if (!aicmC2d11SectionLabel) {
              aicmC2d11SectionLabel = aicmC2d11Get(aicmC2d11MatchedSection, [
                "section_name",
                "organization_name",
                "name",
                "section_label",
                "sectionLabel"
              ]);
            }

            if (!aicmC2d11DepartmentId) {
              aicmC2d11DepartmentId = aicmC2d11Get(aicmC2d11MatchedSection, [
                "department_id",
                "parent_department_id",
                "aicm_user_company_department_id",
                "departmentId"
              ]);
            }

            if (!aicmC2d11DepartmentLabel) {
              aicmC2d11DepartmentLabel = aicmC2d11Get(aicmC2d11MatchedSection, [
                "department_name",
                "parent_department_name",
                "department_label",
                "departmentLabel"
              ]);
            }

            if (!aicmC2d11LeaderLabel) {
              aicmC2d11LeaderLabel = aicmC2d11Get(aicmC2d11MatchedSection, [
                "assigned_leader_label",
                "leader_robot_label",
                "leader_label",
                "responsible_robot_label",
                "responsible_role_label",
                "leaderLabel"
              ]);
            }

            if (!aicmC2d11LeaderPlacementId) {
              aicmC2d11LeaderPlacementId = aicmC2d11Get(aicmC2d11MatchedSection, [
                "leader_placement_id",
                "leaderPlacementId",
                "assigned_leader_placement_id"
              ]);
            }
          }

          var aicmC2d11Departments = []
            .concat(aicmC2d11Array(aicmC2d11Ctx.departments))
            .concat(aicmC2d11Array(aicmC2d11Ctx.departmentList));

          if (aicmC2d11DepartmentId && !aicmC2d11DepartmentLabel) {
            for (var aicmC2d11D = 0; aicmC2d11D < aicmC2d11Departments.length; aicmC2d11D += 1) {
              var aicmC2d11Dept = aicmC2d11Departments[aicmC2d11D] || {};
              var aicmC2d11Did = aicmC2d11Get(aicmC2d11Dept, [
                "aicm_user_company_department_id",
                "department_id",
                "id",
                "departmentId"
              ]);
              if (aicmC2d11Did === aicmC2d11DepartmentId) {
                aicmC2d11DepartmentLabel = aicmC2d11Get(aicmC2d11Dept, [
                  "department_name",
                  "name",
                  "department_label",
                  "departmentLabel"
                ]);
                break;
              }
            }
          }

          var aicmC2d11Placements = []
            .concat(aicmC2d11Array(aicmC2d11Ctx.placements))
            .concat(aicmC2d11Array(aicmC2d11Ctx.robot_placements))
            .concat(aicmC2d11Array(aicmC2d11Ctx.organization_placements));

          if (!aicmC2d11LeaderLabel || !aicmC2d11LeaderPlacementId) {
            for (var aicmC2d11P = 0; aicmC2d11P < aicmC2d11Placements.length; aicmC2d11P += 1) {
              var aicmC2d11Placement = aicmC2d11Placements[aicmC2d11P] || {};
              var aicmC2d11PlacementSectionId = aicmC2d11Get(aicmC2d11Placement, [
                "section_id",
                "organization_id",
                "aicm_user_company_section_id",
                "sectionId"
              ]);
              var aicmC2d11PlacementSectionLabel = aicmC2d11Get(aicmC2d11Placement, [
                "section_name",
                "organization_name",
                "section_label",
                "sectionLabel"
              ]);
              var aicmC2d11Role = aicmC2d11Get(aicmC2d11Placement, [
                "role_code",
                "placement_role_code",
                "assigned_role_code",
                "roleCode"
              ]).toLowerCase();

              var aicmC2d11IsSameSection =
                (aicmC2d11SectionId && aicmC2d11PlacementSectionId === aicmC2d11SectionId) ||
                (aicmC2d11SectionLabel && aicmC2d11PlacementSectionLabel === aicmC2d11SectionLabel);

              var aicmC2d11IsLeader =
                aicmC2d11Role === "leader" ||
                aicmC2d11Role === "section_leader" ||
                aicmC2d11Role === "課長" ||
                aicmC2d11Get(aicmC2d11Placement, ["role_label", "placement_role_label"]).indexOf("Leader") >= 0 ||
                aicmC2d11Get(aicmC2d11Placement, ["role_label", "placement_role_label"]).indexOf("課長") >= 0;

              if (aicmC2d11IsSameSection && aicmC2d11IsLeader) {
                if (!aicmC2d11LeaderLabel) {
                  aicmC2d11LeaderLabel = aicmC2d11Get(aicmC2d11Placement, [
                    "internal_nickname",
                    "robot_internal_nickname",
                    "placement_label",
                    "robot_display_name",
                    "robot_name",
                    "display_name",
                    "name"
                  ]);
                }

                if (!aicmC2d11LeaderPlacementId) {
                  aicmC2d11LeaderPlacementId = aicmC2d11Get(aicmC2d11Placement, [
                    "placement_id",
                    "robot_placement_id",
                    "aicm_robot_placement_id",
                    "id"
                  ]);
                }

                break;
              }
            }
          }

          var aicmC2d11SelectionState = null;
          if (typeof aicmR8zMgrMajorCardSelectionState === "function") {
            aicmC2d11SelectionState = aicmR8zMgrMajorCardSelectionState();
          }

          if (!aicmC2d11SelectionState) {
            if (!state.r8zMgrMajorCardSelection || typeof state.r8zMgrMajorCardSelection !== "object") {
              state.r8zMgrMajorCardSelection = {};
            }
            aicmC2d11SelectionState = state.r8zMgrMajorCardSelection;
          }

          if (!aicmC2d11SelectionState.handoffBatchRoute || typeof aicmC2d11SelectionState.handoffBatchRoute !== "object") {
            aicmC2d11SelectionState.handoffBatchRoute = {};
          }

          var aicmC2d11Route = aicmC2d11SelectionState.handoffBatchRoute;

          aicmC2d11Route.applied = true;
          aicmC2d11Route.applied_flag = true;
          aicmC2d11Route.appliedLabel = "適用済み";
          aicmC2d11Route.applied_label = "適用済み";
          aicmC2d11Route.routeSource = "section-combobox";
          aicmC2d11Route.route_source = "section-combobox";

          aicmC2d11Route.sectionId = aicmC2d11SectionId;
          aicmC2d11Route.section_id = aicmC2d11SectionId;
          aicmC2d11Route.sectionLabel = aicmC2d11SectionLabel;
          aicmC2d11Route.section_label = aicmC2d11SectionLabel;
          aicmC2d11Route.sectionName = aicmC2d11SectionLabel;
          aicmC2d11Route.section_name = aicmC2d11SectionLabel;

          aicmC2d11Route.departmentId = aicmC2d11DepartmentId;
          aicmC2d11Route.department_id = aicmC2d11DepartmentId;
          aicmC2d11Route.departmentLabel = aicmC2d11DepartmentLabel;
          aicmC2d11Route.department_label = aicmC2d11DepartmentLabel;
          aicmC2d11Route.departmentName = aicmC2d11DepartmentLabel;
          aicmC2d11Route.department_name = aicmC2d11DepartmentLabel;

          aicmC2d11Route.leaderPlacementId = aicmC2d11LeaderPlacementId;
          aicmC2d11Route.leader_placement_id = aicmC2d11LeaderPlacementId;
          aicmC2d11Route.leaderLabel = aicmC2d11LeaderLabel;
          aicmC2d11Route.leader_label = aicmC2d11LeaderLabel;
          aicmC2d11Route.assigned_leader_label = aicmC2d11LeaderLabel;

          aicmC2d11Route.departmentMissing = !aicmC2d11DepartmentLabel;
          aicmC2d11Route.department_missing = !aicmC2d11DepartmentLabel;
          aicmC2d11Route.leaderMissing = !aicmC2d11LeaderLabel;
          aicmC2d11Route.leader_missing = !aicmC2d11LeaderLabel;
          aicmC2d11Route.lastAppliedAt = (new Date()).toISOString();

          state.r8zMgrMajorCardRouteEnrichmentDebug = {
            marker: "${marker}",
            at: aicmC2d11Route.lastAppliedAt,
            action: aicmC2d11Action,
            sectionId: aicmC2d11SectionId,
            sectionLabel: aicmC2d11SectionLabel,
            departmentId: aicmC2d11DepartmentId,
            departmentLabel: aicmC2d11DepartmentLabel,
            leaderPlacementId: aicmC2d11LeaderPlacementId,
            leaderLabel: aicmC2d11LeaderLabel,
            matchedSection: !!aicmC2d11MatchedSection,
            selectedRows: aicmC2d11SelectedRows.length
          };

          if (typeof setMessage === "function") {
            if (aicmC2d11DepartmentLabel && aicmC2d11LeaderLabel) {
              setMessage("ok", "課・部門・Leaderを一括引き渡し先へ適用しました。");
            } else if (aicmC2d11DepartmentLabel) {
              setMessage("ok", "課と部門を一括引き渡し先へ適用しました。Leaderは未設定です。");
            } else {
              setMessage("error", "課は適用しましたが、部門情報を特定できません。課設定または台帳行を確認してください。");
            }
          }

          if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
            aicmRenderTaskLedgerSafeR8V4("c2d11-route-enrichment");
            return;
          }

          if (typeof render === "function") {
            render();
            return;
          }

          return;
        }
      } catch (aicmC2d11Error) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("C2D11 route enrichment failed", aicmC2d11Error);
        }
      }
      // ${marker}_END

`;

handlerText = handlerText.slice(0, handler.open - handler.start + 1) + enrichmentBlock + handlerText.slice(handler.open - handler.start + 1);
src = replaceFunction(src, handler, handlerText);

fs.writeFileSync(corePath, src);

const patchedHandler = findFunctionRange(src, handlerName);
const insertedBlock = enrichmentBlock;

const extract = [];
extract.push('AICompanyManager V10L-C2D11 patched handler extract');
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

const verify = [];
verify.push('AICompanyManager V10L-C2D11 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('FUNCTION=' + handlerName);
verify.push('FUNCTION_LINES=' + patchedHandler.startLine + '-' + patchedHandler.endLine);
verify.push('C2D11_MARKER_COUNT=' + count(src, marker));
verify.push('C2D11_START_COUNT=' + count(src, marker + '_START'));
verify.push('C2D11_END_COUNT=' + count(src, marker + '_END'));
verify.push('ACTION_GATE_COUNT=' + count(patchedHandler.text, 'aicmC2d11Action === "' + actionCode + '"'));
verify.push('DEPARTMENT_ROUTE_WRITE_COUNT=' + count(patchedHandler.text, 'departmentLabel') + count(patchedHandler.text, 'department_label'));
verify.push('LEADER_ROUTE_WRITE_COUNT=' + count(patchedHandler.text, 'leaderLabel') + count(patchedHandler.text, 'leader_label'));
verify.push('SECTION_ROUTE_WRITE_COUNT=' + count(patchedHandler.text, 'sectionLabel') + count(patchedHandler.text, 'section_label'));
verify.push('FETCH_IN_INSERTED_BLOCK=' + count(insertedBlock, 'fetch('));
verify.push('XMLHTTP_IN_INSERTED_BLOCK=' + count(insertedBlock, 'XMLHttpRequest'));
verify.push('EXTRACT_OUT=' + extractOut);

if (count(src, marker) !== 2) throw new Error('C2D11_MARKER_COUNT_NOT_2');
if (count(src, marker + '_START') !== 1) throw new Error('C2D11_START_COUNT_NOT_1');
if (count(src, marker + '_END') !== 1) throw new Error('C2D11_END_COUNT_NOT_1');
if (count(patchedHandler.text, 'aicmC2d11Action === "' + actionCode + '"') !== 1) throw new Error('ACTION_GATE_COUNT_NOT_1');
if (count(insertedBlock, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_INSERTED_BLOCK');
if (count(insertedBlock, 'XMLHttpRequest') !== 0) throw new Error('XMLHTTP_FOUND_IN_INSERTED_BLOCK');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
