============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- V10L-B1
- 部門別タスク台帳
- 課長へ送る複数/全件確認UI

現在位置:
- V10L-B0 audit PASS
- B1 patch 実行が code 2 で停止
- code 2 は patchスクリプトの安全停止の可能性が高い
- 予想原因: function renderTaskLedger が exact match できなかった

今回:
1. 最新V10L-B1 run directory を特定
2. report / patch log / patch analysis を表示
3. core/server syntax確認
4. current coreにB1 markerが入っているか確認
5. task-ledger renderer候補を抽出
6. 次の安全なpatch方針を分類

禁止:
- DB write
- API POST
- PATCH
- server restart

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
META=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_failed_patch_salvage_20260504_075635
LATEST_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455
LATEST_REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/000_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_REPORT.md
PATCH_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/010_patch.log
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/020_patch_analysis.txt
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/030_verify.txt
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/aicm-production-core.before_v10l_b1.js
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. latest report/log salvage
============================================================
---- latest report tail ----
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- Manager大項目
- 課長/Leaderへ送るUI

現在位置:
- レビュー・承認待ち一覧は完了
- V10L-B0 audit PASS
- runLeaderAutoDecomposition required payload:
  owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id
- Manager大項目 38件
- Leader中項目 4件
- Worker作業単位 4件
- 既にLeader中項目があるManager大項目は4件
- 標準送信対象は「未送信推定のみ」
- 重複作成を避けるため、全件送信は警告付き確認にする

今回:
1. core/server syntax確認
2. DB read-onlyで件数再確認
3. core backup
4. 部門別タスク台帳画面に課長送信パネルを追加
5. Manager大項目ごとにチェックボックスを出す
6. 選択した項目 / 未送信推定 / 全件 の確認カードを出す
7. この工程では実POSTしない
8. server再起動
9. ブラウザ起動

禁止:
- DB write
- API POST
- server patch
- runLeaderAutoDecomposition API変更
- 既存レビュー機能への変更
- 確認画面を飛ばす実行ボタン

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. DB readonly counts
============================================================
manager_major_count	38
leader_middle_count	4
worker_work_unit_count	4
major_with_existing_middle	4
middle_duplicate_groups	0
worker_duplicate_groups	0

============================================================
4. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/aicm-production-core.before_v10l_b1.js

============================================================
5. patch core
============================================================

---- patch log ----
REMOVED_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY=false

---- patch analysis ----
BEFORE_MARKER_COUNT=0
BEFORE_RENDER_TASK_LEDGER_FUNCTION_COUNT=5
BEFORE_LEADER_AUTO_ROUTE_COUNT=1
PATCH_DECISION=STOP_RENDER_TASK_LEDGER_FUNCTION_NOT_FOUND

---- verify if exists ----
VERIFY_NOT_FOUND

============================================================
3. syntax current
============================================================
CORE_SYNTAX_RESULT=OK

SERVER_SYNTAX_RESULT=OK

============================================================
4. current marker/static check
============================================================
V10L_B1_MARKER_COUNT=0
V10L_B1_PANEL_COUNT=0
V10L_B1_CHECKBOX_COUNT=0
RENDER_TASK_LEDGER_EXACT_COUNT=5
RENDER_TASK_LEDGER_TEXT_COUNT=15
TASK_LEDGER_SCREEN_TEXT_COUNT=56
TASK_LEDGER_JP_TEXT_COUNT=18

============================================================
5. grep task-ledger nearby
============================================================
---- function/render candidates nearby ----
452-      if (json.section && json.section.aicm_user_company_section_id) {
453-        state.selectedSectionId = json.section.aicm_user_company_section_id;
454-        writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
455-      }
456-      state.noticeMessage = "課を作成しました。";
457-      return loadContext();
458-    });
459-  }
460-
461-  function createPlacement(payload) {
462-    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
463-      throw new Error("先にv2のAI企業を作成・選択してください。");
464-    }
465-
466-    return requestJson(API.createPlacement, {
467-      owner_civilization_id: state.ownerCivilizationId,
468-      aicm_user_company_id: state.selectedCompanyId,
469-      aicm_user_company_department_id: payload.departmentId || "",
470-      aicm_user_company_section_id: payload.sectionId || "",
471-      target_level_code: payload.targetLevelCode,
472-      target_id: payload.targetId,
473-      role_code: payload.roleCode,
474-      robot_pool_id: payload.robotPoolId,
475-      aiworker_model_code: payload.aiworkerModelCode,
476-      internal_nickname: payload.internalNickname
477-    }).then(function () {
478-      state.noticeMessage = "Worker配置を作成しました。";
479-      return loadContext();
480-    });
481-  }
482-
483-  
484-function setMessage(kind, message) {
485-    if (kind === "ok") {
486-      state.noticeMessage = String(message || "");
487-      state.errorMessage = "";
488-      return;
489-    }
490-
491-    state.errorMessage = String(message || "");
492-    state.noticeMessage = "";
493-  }
494-
495-  function go(screen) {
496-    // AICM_TASK_LEDGER_FRESH_CONTEXT_NAV_CANONICAL_V1
497-    var nextScreen = String(screen || "dashboard");
498-
499-    state.screen = nextScreen;
500-    state.errorMessage = "";
501-
502:    if (nextScreen !== "task-ledger") {
503-      render();
504-      return;
505-    }
506-
507-    render();
508-
509-    if (state.__taskLedgerContextRefreshing) {
510-      return;
511-    }
512-
513-    if (typeof loadContext !== "function") {
514-      render();
515-      return;
516-    }
517-
518-    state.__taskLedgerContextRefreshing = true;
519-
520-    Promise.resolve()
521-      .then(function () {
522-        return loadContext();
523-      })
524-      .catch(function (error) {
525:        state.errorMessage = error && error.message ? error.message : "部門別タスク台帳の最新情報取得に失敗しました。";
526-      })
527-      .then(function () {
528-        state.__taskLedgerContextRefreshing = false;
529:        state.screen = "task-ledger";
530-        render();
531-      });
532-  }
533-
534-  function pageTitle() {
535-    if (state.screen === "company-new") return "AI企業新規追加";
536-    if (state.screen === "department-new") return "部門新規追加";
537-    if (state.screen === "section-new") return "課新規追加";
538-    if (state.screen === "placement-new") return "Worker配置";
539-    if (state.screen === "settings") return "AI企業設定";
540-    return "AI企業ダッシュボード";
541-  }
542-
543-  
544-// AICM_WORKER_RUNTIME_UI_NAV_AXT_R1_V1
545:function renderShell(content) {
546-    return [
547-      '<div class="aicm-core" data-core-mark="' + CORE_MARK + '">',
548-      '  <header class="aicm-core-header">',
549-      '    <h1>AI企業運営アプリ</h1>',
550-      '  </header>',
551-      '  <nav class="aicm-core-tabs" aria-label="AICompanyManager navigation">',
552-      '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
553:      '    <button type="button" data-core-action="task-ledger-open">部門別タスク台帳</button>',
554-      '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
555-      '  <button type="button" data-core-action="go" data-screen="worker-runtime-request">AI実行Workbench</button>',
556-      '  </nav>',
557-      renderMessages(),
558-      '  <main class="aicm-core-main">',
559-      content,
560-      '  </main>',
561-      '</div>'
562-    ].join("");
563-  }
564-
565-  function renderMessages() {
566-    var parts = [];
567-
568-    if (state.loading) {
569-      parts.push('<div class="aicm-core-message">読込中...</div>');
570-    }
571-
572-    if (state.noticeMessage) {
573-      parts.push('<div class="aicm-core-message aicm-core-message-ok">' + escapeHtml(state.noticeMessage) + '</div>');
574-    }
575-
576-    if (state.errorMessage) {
577-      parts.push('<div class="aicm-core-message aicm-core-message-error">' + escapeHtml(state.errorMessage) + '</div>');
578-    }
579-
580-    return parts.join("");
581-  }
582-
583-  function renderCompanySelect() {
584-    if (state.context.companies.length === 0) {
585-      return '<p class="aicm-core-empty">v2会社はまだありません。AI企業新規追加から作成してください。</p>';
586-    }
587-
588-    return [
589-      '<label>AI企業</label>',
590-      '<select data-core-field="selectedCompanyId">',
591-      state.context.companies.map(function (company) {
592-        var selected = company.aicm_user_company_id === state.selectedCompanyId ? " selected" : "";
593-        return '<option value="' + escapeHtml(company.aicm_user_company_id) + '"' + selected + '>' + escapeHtml(company.company_name) + '</option>';
594-      }).join(""),
595-      '</select>'
596-    ].join("");
597-  }
598-
599-  function renderDepartmentSelect() {
600-    var departments = companyDepartments(state.selectedCompanyId);
601-
602-    if (departments.length === 0) {
603-      return '<p class="aicm-core-empty">この会社のv2部門はまだありません。</p>';
604-    }
605-
606-    return [
607-      '<label>部門</label>',
608-      '<select data-core-field="selectedDepartmentId">',
609-      departments.map(function (department) {
610-        var selected = department.aicm_user_company_department_id === state.selectedDepartmentId ? " selected" : "";
611-        return '<option value="' + escapeHtml(department.aicm_user_company_department_id) + '"' + selected + '>' + escapeHtml(department.department_name) + '</option>';
612-      }).join(""),
613-      '</select>'
614-    ].join("");
615-  }
616-
617-  
618-
619-function renderDashboard() {
620-    var company = selectedCompany();
621-    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
622-    var sections = departments.reduce(function (acc, department) {
623-      return acc.concat(departmentSections(department.aicm_user_company_department_id));
624-    }, []);
625-    var placements = company ? companyPlacements(company.aicm_user_company_id) : [];
626-
627:    return renderShell([
628-      '<section class="aicm-dashboard-grid aicm-dashboard-main-grid">',
629-      '  <div class="aicm-core-card aicm-card-primary">',
630-      '    <div class="aicm-card-title-row">',
631-      '      <div>',
632-      '        <p class="aicm-eyebrow">AI企業</p>',
633-      '        <h2>AI企業選択</h2>',
634-      '      </div>',
635-      '      <button type="button" data-core-action="reload">AI企業を表示</button>',
636-      '    </div>',
637-      renderCompanySelect(),
638-      company ? '<p class="aicm-selected-note">選択中: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
639-      '  </div>',
640-
641-      '  <div class="aicm-core-card">',
642-      '    <p class="aicm-eyebrow">会社概要</p>',
643-      '    <h2>会社概要</h2>',
644-      company ? renderCompanyOverview(company, departments, sections, placements) : renderNoCompanyCard(),
645-      '  </div>',
646-      '</section>',
647-
648-      '<section class="aicm-core-card">',
649-      '  <p class="aicm-eyebrow">部門 / 課</p>',
650-      '  <h2>部門 / 課</h2>',
651-      renderTree(departments),
652-      '</section>'
653-    ].join(""));
654-  }
655-
656-  
657-function metricCard(label, value, caption) {
658-    return [
659-      '<div class="aicm-metric-card">',
660-      '  <p>' + escapeHtml(label) + '</p>',
661-      '  <strong>' + escapeHtml(value) + '</strong>',
662-      '  <span>' + escapeHtml(caption) + '</span>',
663-      '</div>'
664-    ].join("");
665-  }
666-
667-  
668-
669-// AICM_ORG_UPDATE_UI_ARU_ARX_V1
670-// Company / Department / Section update UI.
671-// No bridge, no diagnostic layer, no legacy localStorage owner.
672-
673-function aicmOrgCtx() {
674-    return state.context || state || {};
675-  }
676-
677-  function aicmOrgOwnerId() {
678-    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
679-    if (state && state.owner_civilization_id) return state.owner_civilization_id;
680-    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
681-    return "00000000-0000-4000-8000-000000000001";
682-  }
683-
684-  function aicmOrgCompanies() {
685-    var ctx = aicmOrgCtx();
686-    var rows = ctx.companies || state.companies || [];
687-    return Array.isArray(rows) ? rows : [];
688-  }
689-
690-  function aicmOrgDepartments() {
691-    var ctx = aicmOrgCtx();
692-    var rows = ctx.departments || state.departments || [];
693-    return Array.isArray(rows) ? rows : [];
694-  }
695-
696-  function aicmOrgSections() {
697-    var ctx = aicmOrgCtx();
698-    var rows = ctx.sections || state.sections || [];
699-    return Array.isArray(rows) ? rows : [];
700-  }
701-
702-  function aicmOrgSelectedCompany() {
703-    if (typeof selectedCompany === "function") {
704-      var c = selectedCompany();
705-      if (c) return c;
706-    }
707-
708-    return aicmOrgCompanies()[0] || null;
709-  }
710-
711-  function aicmOrgCompanyById(id) {
712-    return aicmOrgCompanies().find(function (row) {
713-      return row.aicm_user_company_id === id;
714-    }) || null;
715-  }
716-
717-  function aicmOrgDepartmentById(id) {
--
905-        '  <p class="aicm-eyebrow">課変更</p>',
906-        '  <h2>変更できる課がありません</h2>',
907-        '  <p class="aicm-core-empty">先に課新規追加で課を作成してください。</p>',
908-        '</section>'
909-      ].join("");
910-    }
911-
912-    return [
913-      '<section class="aicm-core-card">',
914-      '  <p class="aicm-eyebrow">課変更</p>',
915-      '  <h2>変更する課を選択</h2>',
916-      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || '') + '</strong></p>',
917-      rows.map(function (row) {
918-        var dept = aicmOrgDepartmentById(row.aicm_user_company_department_id) || {};
919-        return [
920-          '<article class="aicm-org-update-row">',
921-          '  <div>',
922-          '    <strong>' + escapeHtml(row.section_name || '課') + '</strong>',
923-          '    <p>' + escapeHtml(dept.department_name || '') + (row.purpose ? ' / ' + escapeHtml(row.purpose || '') : '') + '</p>',
924-          '  </div>',
925-          '  <button type="button" data-core-action="section-update-select" data-section-id="' + escapeHtml(row.aicm_user_company_section_id || '') + '">変更</button>',
926-          '</article>'
927-        ].join("");
928-      }).join(""),
929-      '</section>'
930-    ].join("");
931-  }
932-
933-  function renderSectionUpdateForm(section) {
934-    return [
935-      '<section class="aicm-core-card">',
936-      '  <p class="aicm-eyebrow">課変更</p>',
937-      '  <h2>課情報を変更</h2>',
938-      '  <input type="hidden" id="aicm-section-edit-id" value="' + escapeHtml(section.aicm_user_company_section_id || '') + '">',
939-      '  <label>課名<input id="aicm-section-edit-name" type="text" value="' + escapeHtml(section.section_name || '') + '"></label>',
940-      '  <label>目的<textarea id="aicm-section-edit-purpose" rows="4">' + escapeHtml(section.purpose || '') + '</textarea></label>',
941-      '  <label>状態<select id="aicm-section-edit-status">',
942-      '    <option value="active"' + ((section.section_status || 'active') === 'active' ? ' selected' : '') + '>active</option>',
943-      '    <option value="inactive"' + ((section.section_status || '') === 'inactive' ? ' selected' : '') + '>inactive</option>',
944-      '    <option value="archived"' + ((section.section_status || '') === 'archived' ? ' selected' : '') + '>archived</option>',
945-      '  </select></label>',
946-      '  <div class="aicm-dashboard-action-row">',
947-      '    <button type="button" data-core-action="section-update-save">変更を保存</button>',
948-      '    <button type="button" data-core-action="section-update-clear">一覧へ戻る</button>',
949-      '  </div>',
950-      '</section>'
951-    ].join("");
952-  }
953-
954-  function renderAicmCompanyUpdateScreen() {
955:    return renderShell(renderCompanyUpdateForm(aicmOrgSelectedCompany()));
956-  }
957-
958-  function renderAicmDepartmentUpdateScreen() {
959-    var company = aicmOrgSelectedCompany();
960-    var selectedId = state.editingDepartmentId || "";
961-    var selected = selectedId ? aicmOrgDepartmentById(selectedId) : null;
962-    var rows = company ? aicmOrgDepartmentsForCompany(company.aicm_user_company_id) : [];
963:    return renderShell(selected ? renderDepartmentUpdateForm(selected) : renderDepartmentUpdatePicker(company, rows));
964-  }
965-
966-  function renderAicmSectionUpdateScreen() {
967-    var company = aicmOrgSelectedCompany();
968-    var selectedId = state.editingSectionId || "";
969-    var selected = selectedId ? aicmOrgSectionById(selectedId) : null;
970-    var rows = company ? aicmOrgSectionsForCompany(company.aicm_user_company_id) : [];
971:    return renderShell(selected ? renderSectionUpdateForm(selected) : renderSectionUpdatePicker(company, rows));
972-  }
973-
974-// AICM_DB_WRITE_CONFIRMATION_REQUIRED_ARY_ASB_V1
975-// DB write operations must pass through a visible confirmation screen before POST.
976-
977-function aicmOrgUpdateLabel(kind) {
978-    if (kind === "company") return "企業変更";
979-    if (kind === "department") return "部門変更";
980-    if (kind === "section") return "課変更";
981-    return "変更";
982-  }
983-
984-  function aicmOrgUpdateBodyRows(body) {
985-    var keys = Object.keys(body || {}).filter(function (key) {
986-      return key !== "owner_civilization_id" &&
987-        key.indexOf("_id") === -1 &&
988-        key !== "aicm_user_company_id" &&
989-        key !== "aicm_user_company_department_id" &&
990-        key !== "aicm_user_company_section_id";
991-    });
992-
993-    if (!keys.length) return '<p class="aicm-core-empty">表示できる変更項目がありません。</p>';
994-
995-    return keys.map(function (key) {
996-      return [
997-        '<div class="aicm-confirm-row">',
998-        '  <strong>' + escapeHtml(key) + '</strong>',
999-        '  <p>' + escapeHtml(String(body[key] || "")) + '</p>',
1000-        '</div>'
1001-      ].join("");
1002-    }).join("");
1003-  }
1004-
1005-  
1006-function renderAicmOrgUpdateConfirmation(payload) {
1007-    payload = payload || {};
1008-
1009:    return renderShell([
1010-      '<section class="aicm-core-card">',
1011-      '  <p class="aicm-eyebrow">確認画面</p>',
1012-      '  <h2>' + escapeHtml(payload.title || "変更内容の確認") + '</h2>',
1013-      '  <p class="aicm-selected-note">この操作はDBへ保存されます。内容を確認してから確定してください。</p>',
1014-      '</section>',
1015-      aicmAvdSummaryHtml(payload),
1016-      '<section class="aicm-core-card aicm-operation-card">',
1017-      '  <p class="aicm-eyebrow">操作</p>',
1018-      '  <div class="aicm-dashboard-action-row">',
1019-      '    <button type="button" data-core-action="org-update-confirm-execute">確定して保存</button>',
1020-      '    <button type="button" data-core-action="org-update-confirm-cancel">戻る</button>',
1021-      '  </div>',
1022-      '</section>'
1023-    ].join(""));
1024-  }
1025-
1026-
1027-  function aicmOrgShowUpdateConfirm(payload) {
1028-    state.pendingOrgUpdate = payload || null;
1029-    var root = document.getElementById("aicm-root");
1030-    if (!root) {
1031-      setMessage("error", "確認画面を表示できません。");
1032-      return;
1033-    }
1034-
1035-    root.innerHTML = renderAicmOrgUpdateConfirmation(payload || {});
1036-  }
1037-
1038-  async function executeAicmOrgUpdateConfirm() {
1039-    var payload = state.pendingOrgUpdate || null;
1040-
1041-    if (!payload || !payload.endpoint || !payload.body) {
1042-      setMessage("error", "確認対象がありません。");
1043-      return;
1044-    }
1045-
1046-    try {
1047-      await aicmOrgPostJson(payload.endpoint, payload.body);
1048-            // AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE
1049-      await aicmAxcSyncRolePlacementsForPayload(payload);
1050-state.pendingOrgUpdate = null;
1051-      // AICM_PRESERVE_UNSAVED_WORKER_ADD_AXO_V1
1052-      if (typeof aicmAxoClearDraftAfterSuccessfulSave === "function") aicmAxoClearDraftAfterSuccessfulSave();
1053-
1054-      if (payload.kind === "department") state.editingDepartmentId = "";
1055-      if (payload.kind === "section") state.editingSectionId = "";
1056-
1057-      setMessage("ok", aicmOrgUpdateLabel(payload.kind) + "を保存しました。");
1058-      await aicmOrgReloadContext();
1059-    } catch (error) {
1060-      setMessage("error", error && error.message ? error.message : "保存に失敗しました。");
1061-      // AICM_CONFIRM_SAVE_ERROR_RENDER_AXM_V1
1062-      if (typeof render === "function") render();
1063-    }
1064-  }
1065-
1066-  function cancelAicmOrgUpdateConfirm() {
1067-    var payload = state.pendingOrgUpdate || {};
1068-    state.pendingOrgUpdate = null;
1069-
1070-    if (payload.returnScreen) {
1071-      state.screen = payload.returnScreen;
1072-    }
1073-
1074-    if (typeof render === "function") render();
1075-  }
1076-
1077-
1078-  
1079-
1080-// AICM_ROLE_SETTINGS_SYNC_AXC_V1
1081-// Role settings are saved through a dedicated placement sync endpoint after the main entity update succeeds.
1082-// Main company/department/section fields remain separate from robot placement truth.
1083-function aicmAxcUuidLike(value) {
1084-  return /^[0-9a-fA-F-]{36}$/.test(String(value || "").trim());
1085-}
1086-
1087-function aicmAxcFindElement(ids) {
1088-  for (var i = 0; i < ids.length; i += 1) {
1089-    var el = document.getElementById(ids[i]);
1090-    if (el) return el;
1091-  }
1092-  return null;
1093-}
1094-
1095-function aicmAxcCatalogRowByValue(value) {
1096-  var text = String(value || "").trim();
1097-  if (!text) return null;
1098-  var rows = typeof aicmRobotCatalogSafe === "function" ? aicmRobotCatalogSafe() : [];
1099-  for (var i = 0; i < rows.length; i += 1) {
--
2689-    }
2690-
2691-    return rows;
2692-  }
2693-
2694-function aicmAvdShowDbConfirm(payload) {
2695-    if (!payload || !payload.endpoint || !payload.body) {
2696-      setMessage("error", "確認画面を表示できません。");
2697-      return;
2698-    }
2699-
2700-    if (typeof aicmOrgShowUpdateConfirm === "function") {
2701-      aicmOrgShowUpdateConfirm(payload);
2702-      return;
2703-    }
2704-
2705-    if (typeof state !== "undefined") {
2706-      state.pendingOrgUpdate = payload;
2707-    }
2708-
2709-    var root = document.getElementById("aicm-root");
2710-    if (!root) return;
2711-
2712-    root.innerHTML = renderAicmOrgUpdateConfirmation(payload);
2713-  }
2714-
2715-function aicmAvdSummaryHtml(payload) {
2716-    var rows = payload && Array.isArray(payload.summary_rows) ? payload.summary_rows : [];
2717-
2718-    if (!rows.length) return "";
2719-
2720-    return [
2721-      '<section class="aicm-core-card">',
2722-      '  <p class="aicm-eyebrow">保存内容</p>',
2723-      '  <h2>確認対象</h2>',
2724-      '  <dl class="aicm-summary-list">',
2725-      rows.map(function (row) {
2726-        return '<div><dt>' + escapeHtml(row[0] || "") + '</dt><dd>' + escapeHtml(row[1] || "") + '</dd></div>';
2727-      }).join(""),
2728-      '  </dl>',
2729-      '</section>'
2730-    ].join("");
2731-  }
2732-
2733-
2734-  
2735-function renderCompanyEditPlaceholder() {
2736-    var company = aicmAvdCurrentCompany();
2737-
2738-    if (!company) {
2739:      return renderShell([
2740-        '<section class="aicm-core-card">',
2741-        '  <p class="aicm-eyebrow">企業変更</p>',
2742-        '  <h2>AI企業が選択されていません</h2>',
2743-        '  <p class="aicm-core-empty">AI企業ダッシュボードで企業を作成または選択してください。</p>',
2744-        '  <div class="aicm-dashboard-action-row">',
2745-        '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
2746-        '  </div>',
2747-        '</section>'
2748-      ].join(""));
2749-    }
2750-
2751:    return renderShell([
2752-      '<section class="aicm-core-card">',
2753-      '  <p class="aicm-eyebrow">企業変更</p>',
2754-      '  <h2>企業情報を変更</h2>',
2755-      '  <input id="aicm-company-edit-id" type="hidden" value="' + escapeHtml(company.aicm_user_company_id || "") + '">',
2756-      '  <label>企業名<input id="aicm-company-edit-name" type="text" value="' + escapeHtml(company.company_name || "") + '" placeholder="例: ウルフ"></label>',
2757-      '  <label>事業領域<textarea id="aicm-company-edit-domain" rows="3" placeholder="例: 開発 / 運営 / 管理">' + escapeHtml(company.business_domain || "") + '</textarea></label>',
2758-      '  <label>状態<select id="aicm-company-edit-status">',
2759-      '    <option value="active"' + ((company.company_status || "active") === "active" ? " selected" : "") + '>有効</option>',
2760-      '    <option value="inactive"' + ((company.company_status || "active") === "inactive" ? " selected" : "") + '>無効</option>',
2761-      '  </select></label>',
2762-      '</section>',
2763-      '<section class="aicm-core-card">',
2764-      '  <p class="aicm-eyebrow">社長設定</p>',
2765-      '  <h2>社長ロボット</h2>',
2766-      aicmAvdRoleSelect("aicm-company-president-robot", { code: "president", label: "社長", placeholder: "社長" }),
2767-      '</section>',
2768-      '<section class="aicm-core-card aicm-operation-card">',
2769-      '  <p class="aicm-eyebrow">操作</p>',
2770-      '  <div class="aicm-dashboard-action-row">',
2771-      '    <button type="button" data-core-action="company-update-save">変更を保存</button>',
2772-      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
2773-      '  </div>',
2774-      '</section>'
2775-    ].join(""));
2776-  }
2777-
2778-
2779-  function renderCompanyOverviewBaseAxuMaintR3() {
2780-    var company = null;
2781-
2782-    if (typeof selectedCompany === "function") {
2783-      company = selectedCompany();
2784-    }
2785-
2786-    if (!company && typeof aicmOrgSelectedCompany === "function") {
2787-      company = aicmOrgSelectedCompany();
2788-    }
2789-
2790-    if (!company) {
2791-      return [
2792-        '<div class="aicm-core-card">',
2793-        '  <p class="aicm-eyebrow">会社概要</p>',
2794-        '  <h2>会社概要</h2>',
2795-        '  <div class="aicm-empty-state">',
2796-        '    <strong>AI企業が未選択です</strong>',
2797-        '    <p>AI企業を選択すると、部門・課・Worker配置の概要を確認できます。</p>',
2798-        '    <div class="aicm-dashboard-action-row">',
2799-        '      <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
2800-        '    </div>',
2801-        '  </div>',
2802-        '</div>'
2803-      ].join("");
2804-    }
2805-
2806-    var companyId = company.aicm_user_company_id || "";
2807-    var departments = typeof aicmOrgDepartmentsForCompany === "function" ? aicmOrgDepartmentsForCompany(companyId) : [];
2808-    var sections = typeof aicmOrgSectionsForCompany === "function" ? aicmOrgSectionsForCompany(companyId) : [];
2809-    var ctx = typeof aicmOrgCtx === "function" ? aicmOrgCtx() : (state.context || state || {});
2810-    var placements = Array.isArray(ctx.placements) ? ctx.placements.filter(function (row) {
2811-      return row.aicm_user_company_id === companyId;
2812-    }) : [];
2813-
2814-    return [
2815-      '<div class="aicm-core-card">',
2816-      '  <p class="aicm-eyebrow">会社概要</p>',
2817-      '  <h2>' + escapeHtml(company.company_name || "AI企業") + '</h2>',
2818-      company.business_domain ? '  <p class="aicm-selected-note">' + escapeHtml(company.business_domain) + '</p>' : '',
2819-      '  <div class="aicm-company-overview-stats">',
2820-      '    <div class="aicm-company-overview-stat"><span>部門</span><strong>' + String(departments.length) + '件</strong></div>',
2821-      '    <div class="aicm-company-overview-stat"><span>課</span><strong>' + String(sections.length) + '件</strong></div>',
2822-      '    <div class="aicm-company-overview-stat"><span>Worker配置</span><strong>' + String(placements.length) + '件</strong></div>',
2823-      '  </div>',
2824-      '  <div class="aicm-dashboard-action-row">',
2825-      '    <button type="button" data-core-action="company-edit-open">AI企業変更</button>',
2826-      '    <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
2827-      '  </div>',
2828-      '</div>'
2829-    ].join("");
2830-  }
2831-
2832-function renderCompanyOverview() {
2833-    return renderCompanyOverviewBaseAxuMaintR3() + renderAicmBusinessStartDashboardCard();
2834-  }
2835-
2836-  function renderNoCompanyCard() {
2837-    return [
2838-      '<div class="aicm-empty-state">',
2839-      '  <strong>AI企業が未選択です</strong>',
2840-      '  <p>まずAI企業を作成すると、部門・課・Worker配置を登録できます。</p>',
2841-      '  <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加へ</button>',
--
2871-    if (departments.length === 0) {
2872-      return [
2873-        '<div class="aicm-empty-state">',
2874-        '  <strong>部門がまだありません</strong>',
2875-        '  <p>選択中のAI企業に部門を追加すると、ここに階層表示されます。</p>',
2876-        '  <div class="aicm-dashboard-action-row">',
2877-        '    <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
2878-        '  </div>',
2879-        '</div>'
2880-      ].join("");
2881-    }
2882-
2883-    return [
2884-      '<div class="aicm-tree-toolbar">',
2885-      '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
2886-      '  <button type="button" data-core-action="go" data-screen="section-new">課新規追加</button>',
2887-      '</div>',
2888-      '<div class="aicm-org-tree">',
2889-      departments.map(function (department) {
2890-        var sections = departmentSections(department.aicm_user_company_department_id);
2891-        return [
2892-          '<article class="aicm-org-node">',
2893-          '  <div class="aicm-org-node-head">',
2894-          '    <span class="aicm-node-badge">部門</span>',
2895-          '    <strong>' + escapeHtml(department.department_name) + '</strong>',
2896-          '    <button type="button" data-core-action="go" data-screen="department-edit">変更</button>',
2897-          '  </div>',
2898-          department.purpose ? '<p>' + escapeHtml(department.purpose) + '</p>' : '<p class="aicm-core-empty">目的未設定</p>',
2899-          sections.length === 0 ? '<div class="aicm-section-empty">課なし</div>' : [
2900-            '  <ul class="aicm-section-list">',
2901-            sections.map(function (section) {
2902-              return [
2903-                '<li>',
2904-                '  <span class="aicm-node-badge aicm-node-badge-section">課</span>',
2905-                '  <strong>' + escapeHtml(section.section_name) + '</strong>',
2906-                '  <button type="button" data-core-action="go" data-screen="section-edit">変更</button>',
2907-                section.purpose ? '<small>' + escapeHtml(section.purpose) + '</small>' : '',
2908-                '</li>'
2909-              ].join("");
2910-            }).join(""),
2911-            '  </ul>'
2912-          ].join(""),
2913-          '</article>'
2914-        ].join("");
2915-      }).join(""),
2916-      '</div>'
2917-    ].join("");
2918-  }
2919-
2920-  function renderCompanyNew() {
2921:    return renderShell([
2922-      '<form data-core-form="company-create" class="aicm-core-card">',
2923-      '  <label>会社名</label>',
2924-      '  <input name="companyName" autocomplete="off" required>',
2925-      '  <label>事業領域</label>',
2926-      '  <textarea name="businessDomain" rows="3"></textarea>',
2927-      '  <button type="submit">AI企業を作成</button>',
2928-      '</form>'
2929-    ].join(""));
2930-  }
2931-
2932-  function renderDepartmentNew() {
2933:    return renderShell([
2934-      '<section class="aicm-core-card">',
2935-      renderCompanySelect(),
2936-      '</section>',
2937-      '<form data-core-form="department-create" class="aicm-core-card">',
2938-      '  <label>部門名</label>',
2939-      '  <input name="departmentName" autocomplete="off" required>',
2940-      '  <label>目的</label>',
2941-      '  <textarea name="purpose" rows="3"></textarea>',
2942-      '  <button type="submit">部門を作成</button>',
2943-      '</form>'
2944-    ].join(""));
2945-  }
2946-
2947-  function renderSectionNew() {
2948:    return renderShell([
2949-      '<section class="aicm-core-card">',
2950-      renderCompanySelect(),
2951-      renderDepartmentSelect(),
2952-      '</section>',
2953-      '<form data-core-form="section-create" class="aicm-core-card">',
2954-      '  <label>課名</label>',
2955-      '  <input name="sectionName" autocomplete="off" required>',
2956-      '  <label>目的</label>',
2957-      '  <textarea name="purpose" rows="3"></textarea>',
2958-      '  <button type="submit">課を作成</button>',
2959-      '</form>'
2960-    ].join(""));
2961-  }
2962-
2963-  function renderPlacementNew() {
2964-    var company = selectedCompany();
2965-    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
2966-    var selectedDept = selectedDepartment();
2967-    var sections = selectedDept ? departmentSections(selectedDept.aicm_user_company_department_id) : [];
2968-    var robots = state.context.robotCatalog;
2969-
2970:    return renderShell([
2971-      '<form data-core-form="placement-create" class="aicm-core-card">',
2972-      renderCompanySelect(),
2973-      renderDepartmentSelect(),
2974-      '  <label>配置先</label>',
2975-      '  <select name="targetLevelCode">',
2976-      '    <option value="company">会社 / President</option>',
2977-      '    <option value="department">部門 / Manager</option>',
2978-      '    <option value="section">課 / Leader / Worker</option>',
2979-      '  </select>',
2980-      '  <label>Role</label>',
2981-      '  <select name="roleCode">',
2982-      '    <option value="President">President</option>',
2983-      '    <option value="Manager">Manager</option>',
2984-      '    <option value="Leader">Leader</option>',
2985-      '    <option value="Worker">Worker</option>',
2986-      '  </select>',
2987-      '  <label>課</label>',
2988-      '  <select name="sectionId">',
2989-      '    <option value="">未選択</option>',
2990-      sections.map(function (section) {
2991-        return '<option value="' + escapeHtml(section.aicm_user_company_section_id) + '">' + escapeHtml(section.section_name) + '</option>';
2992-      }).join(""),
2993-      '  </select>',
2994-      '  <label>Robot</label>',
2995-      '  <select name="robotPoolId">',
2996-      robots.map(function (robot) {
2997-        return '<option value="' + escapeHtml(robot.robot_pool_id || "") + '" data-model="' + escapeHtml(robot.aiworker_model_code || "") + '">' + escapeHtml(robot.selector_label || robot.display_name || robot.aiworker_model_code) + '</option>';
2998-      }).join(""),
2999-      '  </select>',
3000-      '  <label>社内通称</label>',
3001-      '  <input name="internalNickname" autocomplete="off">',
3002-      '  <button type="submit">Worker配置を作成</button>',
3003-      '</form>',
3004-      departments.length === 0 ? '<p class="aicm-core-empty">先に部門を作成してください。</p>' : ''
3005-    ].join(""));
3006-  }
3007-
3008-  function renderSettings() {
3009-    var company = selectedCompany();
3010-
3011:    return renderShell([
3012-      '<section class="aicm-core-card">',
3013-      renderCompanySelect(),
3014-      company ? [
3015-        '<p>会社名: ' + escapeHtml(company.company_name) + '</p>',
3016-        '<p>事業領域: ' + escapeHtml(company.business_domain || "") + '</p>',
3017-        '<p class="aicm-core-empty">編集/削除は未設定。作成系の確認後に実装します。</p>'
3018-      ].join("") : '<p class="aicm-core-empty">会社なし</p>',
3019-      '</section>'
3020-    ].join(""));
3021-  }
3022-
3023-  
3024-
3025:function taskLedgerRows(companyId) {
3026-    var rows = [];
3027-
3028-    if (state.context && Array.isArray(state.context.taskLedger)) {
3029-      rows = state.context.taskLedger;
3030-    } else if (state.context && Array.isArray(state.context.task_ledger)) {
3031-      rows = state.context.task_ledger;
3032-    }
3033-
3034-    if (!companyId) return rows;
3035-
3036-    return rows.filter(function (row) {
3037-      return String(row.aicm_user_company_id || "") === String(companyId || "");
3038-    });
3039-  }
3040-
3041-  function sectionsForDepartment(departmentId) {
3042-    return state.context.sections.filter(function (section) {
3043-      return String(section.aicm_user_company_department_id || "") === String(departmentId || "");
3044-    });
3045-  }
3046-
3047-  function firstDepartmentId(company) {
3048-    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
3049-    return departments.length ? departments[0].aicm_user_company_department_id : "";
3050-  }
3051-
3052:  function renderTaskLedgerRows(rows) {
3053-    if (!rows.length) {
3054-      return [
3055-        '<div class="aicm-empty-state">',
3056-        '  <strong>台帳行がまだありません</strong>',
3057-        '  <p>部門を選び、成果物名と作業名を入力して追加してください。</p>',
3058-        '</div>'
3059-      ].join("");
3060-    }
3061-
3062-    return [
3063-      '<div class="aicm-ledger-list">',
3064-      rows.map(function (row) {
3065-        return [
3066-          '<article class="aicm-ledger-row">',
3067-          '  <div class="aicm-ledger-row-head">',
3068-          '    <span class="aicm-node-badge">' + escapeHtml(row.priority_code || "normal") + '</span>',
3069-          '    <strong>' + escapeHtml(row.deliverable_name || "") + '</strong>',
3070-          '    <em>' + escapeHtml(row.task_status_code || "todo") + '</em>',
3071-          '  </div>',
3072-          '  <p>' + escapeHtml(row.task_name || "") + '</p>',
3073-          '  <dl class="aicm-ledger-meta">',
3074-          '    <div><dt>部門</dt><dd>' + escapeHtml(row.department_name || "-") + '</dd></div>',
3075-          '    <div><dt>課</dt><dd>' + escapeHtml(row.section_name || "-") + '</dd></div>',
3076-          '    <div><dt>作業種別</dt><dd>' + escapeHtml(row.work_type_code || "-") + '</dd></div>',
3077-          '    <div><dt>担当</dt><dd>' + escapeHtml(row.responsible_role_code || "-") + '</dd></div>',
3078-          '  </dl>',
3079-          row.note ? '<p class="aicm-ledger-note">' + escapeHtml(row.note) + '</p>' : '',
3080-          '</article>'
3081-        ].join("");
3082-      }).join(""),
3083-      '</div>'
3084-    ].join("");
3085-  }
3086-
3087:  function renderTaskLedgerCreateForm(company, departments) {
3088-    if (!company) {
3089-      return [
3090-        '<div class="aicm-empty-state">',
3091-        '  <strong>AI企業が未選択です</strong>',
3092-        '  <p>ダッシュボードでAI企業を選択してください。</p>',
3093-        '  <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボードへ</button>',
3094-        '</div>'
3095-      ].join("");
3096-    }
3097-
3098-    if (!departments.length) {
3099-      return [
3100-        '<div class="aicm-empty-state">',
3101-        '  <strong>部門がありません</strong>',
3102:        '  <p>部門別タスク台帳を作るには、先に部門が必要です。</p>',
3103-        '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加へ</button>',
3104-        '</div>'
3105-      ].join("");
3106-    }
3107-
3108-    var firstDepartment = departments[0];
3109-    var sections = sectionsForDepartment(firstDepartment.aicm_user_company_department_id);
3110-
3111-    return [
3112-      '<section class="aicm-core-card">',
3113-      '  <p class="aicm-eyebrow">台帳行追加</p>',
3114-      '  <h2>部門別タスクを追加</h2>',
3115-      '  <div class="aicm-form-grid">',
3116-      '    <label>部門<select id="aicm-ledger-department">',
3117-      departments.map(function (department) {
3118-        return '<option value="' + escapeHtml(department.aicm_user_company_department_id) + '">' + escapeHtml(department.department_name) + '</option>';
3119-      }).join(""),
3120-      '    </select></label>',
3121-      '    <label>課<select id="aicm-ledger-section">',
3122-      '      <option value="">部門直下</option>',
3123-      sections.map(function (section) {
3124-        return '<option value="' + escapeHtml(section.aicm_user_company_section_id) + '">' + escapeHtml(section.section_name) + '</option>';
3125-      }).join(""),
3126-      '    </select></label>',
3127:      '    <label>成果物名<input id="aicm-ledger-deliverable" type="text" placeholder="例: 部門別タスク台帳UI"></label>',
3128-      '    <label>作業名<input id="aicm-ledger-task" type="text" placeholder="例: 一覧と追加フォームを実装"></label>',
3129-      '    <label>作業種別<select id="aicm-ledger-work-type">',
3130-      '      <option value="design">設計</option>',
3131-      '      <option value="implementation">実装</option>',
3132-      '      <option value="test">テスト</option>',
3133-      '      <option value="review">レビュー</option>',
3134-      '      <option value="handoff">引き継ぎ</option>',
3135-      '    </select></label>',
3136-      '    <label>担当役割<select id="aicm-ledger-role">',
3137-      '      <option value="Manager">Manager</option>',
3138-      '      <option value="Leader">Leader</option>',
3139-      '      <option value="Worker">Worker</option>',
3140-      '      <option value="President">President</option>',
3141-      '    </select></label>',
3142-      '    <label>優先度<select id="aicm-ledger-priority">',
3143-      '      <option value="normal">通常</option>',
3144-      '      <option value="high">高</option>',
3145-      '      <option value="low">低</option>',
3146-      '    </select></label>',
3147-      '    <label>状態<select id="aicm-ledger-status">',
3148-      '      <option value="todo">未着手</option>',
3149-      '      <option value="in_progress">作業中</option>',
3150-      '      <option value="review_waiting">レビュー待ち</option>',
3151-      '      <option value="done">完了</option>',
3152-      '    </select></label>',
3153-      '  </div>',
3154-      '  <label>補足メモ<textarea id="aicm-ledger-note" rows="3" placeholder="短い補足だけ"></textarea></label>',
3155-      '  <div class="aicm-dashboard-action-row">',
3156:      '    <button type="button" data-core-action="task-ledger-create">台帳行を追加</button>',
3157-      '  </div>',
3158-      '</section>'
3159-    ].join("");
3160-  }
3161-
3162:  async function createTaskLedgerFromForm() {
3163-    var company = selectedCompany();
3164-    if (!company) {
3165-      setMessage("error", "先にAI企業を選択してください。");
3166-      render();
3167-      return;
3168-    }
3169-
3170-    var departmentEl = document.getElementById("aicm-ledger-department");
3171-    var sectionEl = document.getElementById("aicm-ledger-section");
3172-    var deliverableEl = document.getElementById("aicm-ledger-deliverable");
3173-    var taskEl = document.getElementById("aicm-ledger-task");
3174-
3175-    var deliverableName = deliverableEl ? deliverableEl.value.trim() : "";
3176-    var taskName = taskEl ? taskEl.value.trim() : "";
3177-
3178-    if (!departmentEl || !departmentEl.value) {
3179-      setMessage("error", "部門を選択してください。");
3180-      render();
3181-      return;
3182-    }
3183-
3184-    if (!deliverableName || !taskName) {
3185-      setMessage("error", "成果物名と作業名を入力してください。");
3186-      render();
3187-      return;
3188-    }
3189-
3190-    var payload = {
3191-      owner_civilization_id: ownerCivilizationId(),
3192-      aicm_user_company_id: company.aicm_user_company_id,
3193-      aicm_user_company_department_id: departmentEl.value,
3194-      aicm_user_company_section_id: sectionEl ? sectionEl.value : "",
3195-      deliverable_name: deliverableName,
3196-      task_name: taskName,
3197-      work_type_code: valueOf("aicm-ledger-work-type") || "design",
3198-      responsible_role_code: valueOf("aicm-ledger-role") || "Manager",
3199-      priority_code: valueOf("aicm-ledger-priority") || "normal",
3200-      task_status_code: valueOf("aicm-ledger-status") || "todo",
3201-      note: valueOf("aicm-ledger-note")
3202-    };
3203-
3204-    try {
3205:      var response = await fetch("/api/aicm/v2/task-ledger/create", {
3206-        method: "POST",
3207-        headers: { "content-type": "application/json" },
3208-        body: JSON.stringify(payload)
3209-      });
3210-
3211-      var json = await response.json();
3212-
3213-      if (!response.ok || !json || json.result !== "ok") {
3214-        throw new Error((json && json.error_message) || "台帳行追加に失敗しました。");
3215-      }
3216-
3217:      setMessage("ok", "部門別タスク台帳に追加しました。");
3218-
3219-      if (typeof loadContext === "function") {
3220-        await loadContext();
3221-      }
3222-
3223:      state.screen = "task-ledger";
3224-      render();
3225-    } catch (error) {
3226-      setMessage("error", error && error.message ? error.message : "台帳行追加に失敗しました。");
3227-      render();
3228-    }
3229-  }
3230-
3231-  function ownerCivilizationId() {
3232-    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
3233-    if (typeof OWNER_CIVILIZATION_ID !== "undefined") return OWNER_CIVILIZATION_ID;
3234-    return "00000000-0000-4000-8000-000000000001";
3235-  }
3236-
3237-  function valueOf(id) {
3238-    var el = document.getElementById(id);
3239-    return el ? String(el.value || "") : "";
3240-  }
3241-
3242-
3243-  
3244-
3245:function taskLedgerCsvColumns() {
3246-    return [
3247-      "department_name",
3248-      "section_name",
3249-      "deliverable_name",
3250-      "task_name",
3251-      "work_type_code",
3252-      "responsible_role_code",
3253-      "task_status_code",
3254-      "priority_code",
3255-      "due_date",
3256-      "reference_files_text",
3257-      "supplemental_materials_text",
3258-      "applicable_rules_text",
3259-      "note",
3260-      "handoff_link"
3261-    ];
3262-  }
3263-
3264:  function taskLedgerCsvTemplateText() {
3265-    return [
3266-      taskLedgerCsvColumns().join(","),
3267-      [
3268-        "開発部",
3269-        "UI課",
3270:        "部門別タスク台帳UI",
3271-        "CSV取り込み画面を実装",
3272-        "implementation",
3273-        "Leader",
3274-        "todo",
3275-        "normal",
3276-        "",
3277-        "",
3278-        "画面スクショ",
3279-        "会社共通ルール",
3280-        "CSV作成後に取り込み",
3281-        ""
3282-      ].join(",")
3283-    ].join("\n");
3284-  }
3285-
3286-
3287-
3288:function taskLedgerCsvPromptText() {
3289-    return aicmPmlwCsvPromptText();
3290-  }
3291-
3292-    function parseCsv(text) {
3293-    var rows = [];
3294-    var row = [];
3295-    var field = "";
3296-    var inQuote = false;
3297-
3298-    text = String(text || "").replace(/^\uFEFF/, "");
3299-
3300-    for (var i = 0; i < text.length; i++) {
3301-      var ch = text[i];
3302-      var next = text[i + 1];
3303-
3304-      if (inQuote) {
3305-        if (ch === '"' && next === '"') {
3306-          field += '"';
3307-          i++;
3308-        } else if (ch === '"') {
3309-          inQuote = false;
3310-        } else {
3311-          field += ch;
3312-        }
3313-        continue;
3314-      }
3315-
3316-      if (ch === '"') {
3317-        inQuote = true;
3318-        continue;
3319-      }
3320-
3321-      if (ch === ",") {
3322-        row.push(field);
3323-        field = "";
3324-        continue;
3325-      }
3326-
3327-      if (ch === "\n") {
3328-        row.push(field);
3329-        rows.push(row);
3330-        row = [];
3331-        field = "";
3332-        continue;
3333-      }
3334-
3335-      if (ch === "\r") {
3336-        continue;
3337-      }
3338-
3339-      field += ch;
3340-    }
3341-
3342-    row.push(field);
3343-    rows.push(row);
3344-
3345-    return rows.filter(function (items) {
3346-      return items.some(function (item) {
3347-        return String(item || "").trim() !== "";
3348-      });
3349-    });
3350-  }
3351-
3352-  function csvRowsToObjects(rows) {
3353-    if (!rows.length) return [];
3354-    var headers = rows[0].map(function (h) {
3355-      return String(h || "").trim();
3356-    });
3357-
3358-    return rows.slice(1).map(function (items, index) {
3359-      var obj = { row_number: index + 2 };
3360-      headers.forEach(function (header, i) {
3361-        obj[header] = String(items[i] || "").trim();
3362-      });
3363-      return obj;
3364-    });
3365-  }
3366-
3367-  function findDepartmentByName(company, name) {
3368-    var text = String(name || "").trim();
3369-    if (!company || !text) return null;
3370-
3371-    var departments = companyDepartments(company.aicm_user_company_id);
3372-    return departments.find(function (department) {
3373-      return String(department.department_name || "").trim() === text;
3374-    }) || null;
3375-  }
3376-
3377-  function findSectionByName(departmentId, name) {
3378-    var text = String(name || "").trim();
3379-    if (!text) return null;
3380-
3381-    return state.context.sections.find(function (section) {
3382-      return String(section.aicm_user_company_department_id || "") === String(departmentId || "")
3383-        && String(section.section_name || "").trim() === text;
3384-    }) || null;
3385-  }
3386-
3387-  
3388:function buildTaskLedgerCsvPreview() {
3389-    var company = selectedCompany();
3390-    var text = String(state.csvImportText || "");
3391-    var parsedRows = parseCsv(text);
3392-    var objects = csvRowsToObjects(parsedRows);
3393-    var requiredHeaders = taskLedgerCsvColumns();
3394-
3395-    if (!company) {
3396-      throw new Error("先にAI企業を選択してください。");
3397-    }
3398-
3399-    if (parsedRows.length < 2) {
3400-      throw new Error("CSVファイルを読み込んでください。");
3401-    }
3402-
3403-    var headers = parsedRows[0].map(function (h) {
3404-      return String(h || "").trim();
3405-    });
3406-
3407-    var missing = requiredHeaders.filter(function (header) {
3408-      return headers.indexOf(header) < 0;
3409-    });
3410-
3411-    if (missing.length) {
3412-      throw new Error("CSVカラム不足: " + missing.join(", "));
3413-    }
3414-
3415-    return objects.map(function (row) {
3416-      var errors = [];
3417-      var department = findDepartmentByName(company, row.department_name);
3418-      var section = null;
3419-
3420-      if (!department) {
3421-        errors.push("部門が見つかりません: " + (row.department_name || "(空欄)"));
3422-      } else if (row.section_name) {
3423-        section = findSectionByName(department.aicm_user_company_department_id, row.section_name);
3424-        if (!section) {
3425-          errors.push("課が見つかりません: " + row.section_name);
3426-        }
3427-      }
3428-
3429-      if (!row.deliverable_name) errors.push("成果物名が空欄です");
3430-      if (!row.task_name) errors.push("作業名が空欄です");
3431-
3432-      return {
3433-        row_number: row.row_number,
3434-        source: row,
3435-        valid: errors.length === 0,
3436-        errors: errors,
3437-        payload: {
3438-          owner_civilization_id: ownerCivilizationId(),
3439-          aicm_user_company_id: company.aicm_user_company_id,
3440-          aicm_user_company_department_id: department ? department.aicm_user_company_department_id : "",
3441-          aicm_user_company_section_id: section ? section.aicm_user_company_section_id : "",
3442-          deliverable_name: row.deliverable_name || "",
3443-          task_name: row.task_name || "",
3444-          work_type_code: row.work_type_code || "design",
3445-          responsible_role_code: row.responsible_role_code || "Manager",
3446-          task_status_code: row.task_status_code || "todo",
3447-          priority_code: row.priority_code || "normal",
3448-          due_date: row.due_date || "",
3449-          reference_files_text: row.reference_files_text || "",
3450-          supplemental_materials_text: row.supplemental_materials_text || "",
3451-          applicable_rules_text: row.applicable_rules_text || "",
3452-          note: row.note || "",
3453-          handoff_link: row.handoff_link || ""

============================================================
6. node renderer candidate extraction
============================================================
CANDIDATE_COUNT=84
TOP_CANDIDATES=aicmRenderTaskLedgerSafeR8V4@5151:score34,renderTaskLedgerPlaceholder@6080:score34,renderTaskLedgerCreateForm@3087:score30,createTaskLedgerFromForm@3162:score30,h@4265:score30,aicmOpenTaskLedgerScreenR8V3Clean@5197:score30,go@495:score26,taskLedgerCsvTemplateText@3264:score26,renderAicmBusinessStartScreen@8269:score24,v10cRenderReviewList@11344:score24

============================================================
name=aicmRenderTaskLedgerSafeR8V4
line=5151
score=34
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=true
hasTaskLedgerArray=false
---- snippet ----
function aicmRenderTaskLedgerSafeR8V4(sourceLabel) {
    state.screen = "task-ledger";

    try {
      if (!root) return;

      var html = renderTaskLedgerPlaceholder();
      root.innerHTML = html;

      return true;
    } catch (error) {
      var message = error && error.message ? error.message : String(error || "unknown error");
      var stack = error && error.stack ? String(error.stack) : "";

      if (typeof console !== "undefined" && console && console.error) {
        console.error("AICM task-ledger render failed", {
          sourceLabel: sourceLabel || "",
          message: message,
          stack: stack
        });
      }

      if (root) {
        root.innerHTML = renderShell([
          '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
          '  <p class="aicm-eyebrow">TASK LEDGER RENDER ERROR</p>',
          '  <h2>部門別タスク台帳の描画でエラーが発生しました</h2>',
          '  <p class="aicm-selected-note">クリック処理と画面遷移は動いています。以下はブラウザ側の描画エラーです。</p>',
          '  <dl class="aicm-core-detail-list">',
          '    <dt>source</dt><dd>' + escapeHtml(sourceLabel || "") + '</dd>',
          '    <dt>message</dt><dd>' + escapeHtml(message) + '</dd>',
          '  </dl>',
          stack ? '<pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + escapeHtml(stack) + '</pre>' : '',
          '  <div class="aicm-dashboard-action-row">',
          '    <button type="button" data-core-action="task-ledger-refresh">再読み込み</button>',
          '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
          '  </div>',
          '</section>'
        ].join(""));
      }

      return false;
    }
  }

============================================================
name=renderTaskLedgerPlaceholder
line=6080
score=34
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=true
hasTaskLedgerArray=false
---- snippet ----
function renderTaskLedgerPlaceholder() {
    // AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: screen
    var company = typeof selectedCompany === "function" ? selectedCompany() : null;
    var companyId = company && company.aicm_user_company_id ? company.aicm_user_company_id : "";
    var rows = aicmGetManagerMajorRowsForSelectedCompany(companyId);
    

    // AICM_R8V_REMOVE_LEADER_INBOX_UI_START
  // Leader受信箱 routine section removed.
  // Manager大項目サマリの Leader受信済み 件数/詳細を正面表示として使う。
// AICM_R8V_REMOVE_LEADER_INBOX_UI_END
return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
      '  <h2>部門別タスク台帳</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">未実行のManager大項目だけをDB/contextから表示します。CSV取り込みは部長/Manager分解済み大項目の新規追加です。</p>',
'  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="task-ledger-refresh">登録済み大項目をリロード</button>',
      '  </div>',
      '</section>',
      aicmRenderManagerMajorSummarySectionR8U(),
      aicmRenderLeaderAutoFlowStatusR8W(),
      renderCsvImportCard(company),
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Manager大項目</p>',
      '  <h2>登録済み大項目</h2>',
      aicmRenderManagerMajorRows(rows),
      '</section>'
    ].join(""));
  }

============================================================
name=renderTaskLedgerCreateForm
line=3087
score=30
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=false
hasTaskLedgerArray=false
---- snippet ----
function renderTaskLedgerCreateForm(company, departments) {
    if (!company) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>AI企業が未選択です</strong>',
        '  <p>ダッシュボードでAI企業を選択してください。</p>',
        '  <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボードへ</button>',
        '</div>'
      ].join("");
    }

    if (!departments.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>部門がありません</strong>',
        '  <p>部門別タスク台帳を作るには、先に部門が必要です。</p>',
        '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加へ</button>',
        '</div>'
      ].join("");
    }

    var firstDepartment = departments[0];
    var sections = sectionsForDepartment(firstDepartment.aicm_user_company_department_id);

    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">台帳行追加</p>',
      '  <h2>部門別タスクを追加</h2>',
      '  <div class="aicm-form-grid">',
      '    <label>部門<select id="aicm-ledger-department">',
      departments.map(function (department) {
        return '<option value="' + escapeHtml(department.aicm_user_company_department_id) + '">' + escapeHtml(department.department_name) + '</option>';
      }).join(""),
      '    </select></label>',
      '    <label>課<select id="aicm-ledger-section">',
      '      <option value="">部門直下</option>',
      sections.map(function (section) {
        return '<option value="' + escapeHtml(section.aicm_user_company_section_id) + '">' + escapeHtml(section.section_name) + '</option>';
      }).join(""),
      '    </select></label>',
      '    <label>成果物名<input id="aicm-ledger-deliverable" type="text" placeholder="例: 部門別タスク台帳UI"></label>',
      '    <label>作業名<input id="aicm-ledger-task" type="text" pl

============================================================
name=createTaskLedgerFromForm
line=3162
score=30
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=false
hasTaskLedgerArray=false
---- snippet ----
async function createTaskLedgerFromForm() {
    var company = selectedCompany();
    if (!company) {
      setMessage("error", "先にAI企業を選択してください。");
      render();
      return;
    }

    var departmentEl = document.getElementById("aicm-ledger-department");
    var sectionEl = document.getElementById("aicm-ledger-section");
    var deliverableEl = document.getElementById("aicm-ledger-deliverable");
    var taskEl = document.getElementById("aicm-ledger-task");

    var deliverableName = deliverableEl ? deliverableEl.value.trim() : "";
    var taskName = taskEl ? taskEl.value.trim() : "";

    if (!departmentEl || !departmentEl.value) {
      setMessage("error", "部門を選択してください。");
      render();
      return;
    }

    if (!deliverableName || !taskName) {
      setMessage("error", "成果物名と作業名を入力してください。");
      render();
      return;
    }

    var payload = {
      owner_civilization_id: ownerCivilizationId(),
      aicm_user_company_id: company.aicm_user_company_id,
      aicm_user_company_department_id: departmentEl.value,
      aicm_user_company_section_id: sectionEl ? sectionEl.value : "",
      deliverable_name: deliverableName,
      task_name: taskName,
      work_type_code: valueOf("aicm-ledger-work-type") || "design",
      responsible_role_code: valueOf("aicm-ledger-role") || "Manager",
      priority_code: valueOf("aicm-ledger-priority") || "normal",
      task_status_code: valueOf("aicm-ledger-status") || "todo",
      note: valueOf("aicm-ledger-note")
    };

    try {
      var response = await fetch("/api/aicm/v2/task-ledger/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      var json = await response.json();

      if (!response.ok || !json || json.result !== "o

============================================================
name=h
line=4265
score=30
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=true
hasTaskLedgerArray=true
---- snippet ----
function h(value) {
      if (typeof escapeHtml === "function") return escapeHtml(value);
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function value(row, keys, fallback) {
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (row && row[key] != null && String(row[key]) !== "") return row[key];
      }
      return fallback == null ? "" : fallback;
    }

    function rowId(row, index) {
      if (typeof aicmAxuR1MajorId === "function") {
        var id = aicmAxuR1MajorId(row);
        if (id) return id;
      }

      return String(
        value(row, [
          "aicm_manager_major_work_item_id",
          "manager_major_work_item_id",
          "pmlw_major_item_id",
          "major_item_id",
          "id"
        ], "row-" + String(index))
      );
    }

    var list = Array.isArray(rows) ? rows : [];

    if (!list.length && typeof selectedCompany === "function" && typeof pmlwMajorRowsForCompany === "function") {
      var company = selectedCompany();
      list = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];
    }

    if (!Array.isArray(list) || list.length === 0) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>President起点でAI企業業務を開始するか、CSVで部長/Manager分解済みの大項目を取り込むと、ここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-table-wrap">',
      '  <table class="aicm-table">',
      '    <thead>',
      '      <tr>',
      '        <th>大項目</th>',
      '        <th>部門</th>',
      '        <th>課</th>',
      '        <th>優先度</th>'

============================================================
name=aicmOpenTaskLedgerScreenR8V3Clean
line=5197
score=30
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=false
hasTaskLedgerArray=false
---- snippet ----
function aicmOpenTaskLedgerScreenR8V3Clean() {
    state.screen = "task-ledger";
    state.managerMajorDeleteConfirm = null;

    if (typeof setMessage === "function") {
      setMessage("ok", "部門別タスク台帳を表示します。");
    }

    aicmRenderTaskLedgerSafeR8V4("open:initial");

    Promise.resolve()
      .then(function () {
        if (typeof aicmReloadTaskLedgerContext === "function") {
          return aicmReloadTaskLedgerContext();
        }
        return null;
      })
      .then(function () {
        state.screen = "task-ledger";
        render();
      })
      .catch(function (error) {
        state.screen = "task-ledger";

        if (typeof setMessage === "function") {
          setMessage("error", error && error.message ? error.message : "部門別タスク台帳の読込に失敗しました。");
        }

        aicmRenderTaskLedgerSafeR8V4("open:error");
      });
  }

============================================================
name=go
line=495
score=26
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=false
hasTaskLedgerArray=true
---- snippet ----
function go(screen) {
    // AICM_TASK_LEDGER_FRESH_CONTEXT_NAV_CANONICAL_V1
    var nextScreen = String(screen || "dashboard");

    state.screen = nextScreen;
    state.errorMessage = "";

    if (nextScreen !== "task-ledger") {
      render();
      return;
    }

    render();

    if (state.__taskLedgerContextRefreshing) {
      return;
    }

    if (typeof loadContext !== "function") {
      render();
      return;
    }

    state.__taskLedgerContextRefreshing = true;

    Promise.resolve()
      .then(function () {
        return loadContext();
      })
      .catch(function (error) {
        state.errorMessage = error && error.message ? error.message : "部門別タスク台帳の最新情報取得に失敗しました。";
      })
      .then(function () {
        state.__taskLedgerContextRefreshing = false;
        state.screen = "task-ledger";
        render();
      });
  }

============================================================
name=taskLedgerCsvTemplateText
line=3264
score=26
hasTaskLedgerScreen=false
hasJapaneseTitle=true
hasRenderShell=false
hasTaskLedgerArray=true
---- snippet ----
function taskLedgerCsvTemplateText() {
    return [
      taskLedgerCsvColumns().join(","),
      [
        "開発部",
        "UI課",
        "部門別タスク台帳UI",
        "CSV取り込み画面を実装",
        "implementation",
        "Leader",
        "todo",
        "normal",
        "",
        "",
        "画面スクショ",
        "会社共通ルール",
        "CSV作成後に取り込み",
        ""
      ].join(",")
    ].join("\n");
  }

============================================================
name=renderAicmBusinessStartScreen
line=8269
score=24
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=true
hasTaskLedgerArray=false
---- snippet ----
function renderAicmBusinessStartScreen() {
    var company = null;
    if (typeof selectedCompany === "function") company = selectedCompany();
    if (!company && typeof aicmOrgSelectedCompany === "function") company = aicmOrgSelectedCompany();

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">AI企業業務開始</p>',
      '  <h2>President起点で業務を開始</h2>',
      company ? '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>' : '  <p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">Presidentが会社方針・事業方針から業務を送り、Manager/部長が大項目へ分解し、課長へ引き継ぎます。</p>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">正本ルート</p>',
      '  <h2>業務開始ルート</h2>',
      '  <div class="aicm-confirm-row"><strong>1. President</strong><p>会社方針・事業方針から業務を送ります。</p></div>',
      '  <div class="aicm-confirm-row"><strong>2. Manager/部長</strong><p>受け取った業務を大項目レベルへ分解します。</p></div>',
      '  <div class="aicm-confirm-row"><strong>3. 課長</strong><p>大項目を受け取り、中項目・作業単位へ分解します。</p></div>',
      '  <div class="aicm-confirm-row"><strong>4. Worker</strong><p>作業単位を実行し、成果物を作成します。</p></div>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">CSV代替ルート</p>',
      '  <h2>部長分解済み大項目の取り込み</h2>',
      '  <p class="aicm-selected-note">CSVは、Manager/部長による大項目分解結果を代替入力するルートです。CSV取り込み後、登録済み大項目から課長へ引き継ぎます。</p>',
      '</section>',
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">操作</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="task-ledger-open">部門別タスク台帳へ</button>',
      '    <button type="button" data-core-action="go" 

============================================================
name=v10cRenderReviewList
line=11344
score=24
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=true
hasTaskLedgerArray=false
---- snippet ----
function v10cRenderReviewList(appState) {
      appState = v10cState(appState);

      var beforeRows = v10cRows(appState);
      if (!beforeRows.length) {
        v10cSyncFetch(appState);
      }

      var rows = v10cRows(appState);
      var debug = [
        "V10C",
        "selectedCompanyId=" + v10cCompanyId(appState),
        "owner=" + v10cOwnerId(appState),
        "rows=" + String(rows.length),
        "payloadRows=" + String(appState.aicmR8zV10cPayloadRows !== undefined ? appState.aicmR8zV10cPayloadRows : "na"),
        "http=" + String(appState.aicmR8zV10cHttpStatus !== undefined ? appState.aicmR8zV10cHttpStatus : "na"),
        "status=" + v10cText(appState.aicmR8zV10cFetchStatus || "none"),
        appState.aicmR8zV10cError ? "error=" + v10cText(appState.aicmR8zV10cError) : ""
      ].filter(Boolean).join(" / ");

      var body = rows.length
        ? [
            '<section class="aicm-core-card">',
            '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
            '  <h2>レビュー・承認待ち: ' + v10cEsc(String(rows.length)) + '件</h2>',
            '  <p class="aicm-selected-note">' + v10cEsc(debug) + '</p>',
            '</section>',
            rows.map(v10cRenderRow).join("")
          ].join("")
        : [
            '<section class="aicm-core-card" style="border:1px solid #e5e7eb;">',
            '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
            '  <h2>レビュー・承認待ち: 0件</h2>',
            '  <p class="aicm-selected-note">' + v10cEsc(debug) + '</p>',
            '  <p class="aicm-core-message aicm-core-message-error">context APIからレビュー・承認待ちはありませんでした。</p>',
            '  <div class="aicm-dashboard-action-row">',
            '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
            '    <button type="button

============================================================
name=renderShell
line=545
score=21
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=true
hasTaskLedgerArray=false
---- snippet ----
function renderShell(content) {
    return [
      '<div class="aicm-core" data-core-mark="' + CORE_MARK + '">',
      '  <header class="aicm-core-header">',
      '    <h1>AI企業運営アプリ</h1>',
      '  </header>',
      '  <nav class="aicm-core-tabs" aria-label="AICompanyManager navigation">',
      '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
      '    <button type="button" data-core-action="task-ledger-open">部門別タスク台帳</button>',
      '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
      '  <button type="button" data-core-action="go" data-screen="worker-runtime-request">AI実行Workbench</button>',
      '  </nav>',
      renderMessages(),
      '  <main class="aicm-core-main">',
      content,
      '  </main>',
      '</div>'
    ].join("");
  }

============================================================
name=aicmRenderLeaderHandoffConfirmCardR8SV9F4B
line=7048
score=21
hasTaskLedgerScreen=true
hasJapaneseTitle=true
hasRenderShell=true
hasTaskLedgerArray=false
---- snippet ----
function aicmRenderLeaderHandoffConfirmCardR8SV9F4B() {
  var payload = state && state.managerMajorLeaderHandoffConfirm;
  if (!payload || typeof payload !== "object") return "";

  var esc = typeof escapeHtml === "function" ? escapeHtml : function(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  var majorId = String(
    payload.majorId ||
    payload.aicm_manager_major_work_item_id ||
    (payload.body && payload.body.aicm_manager_major_work_item_id) ||
    ""
  ).trim();

  var row = payload.row || {};
  var title = String(
    payload.major_item_name ||
    payload.targetTitle ||
    row.major_item_name ||
    row.task_name ||
    row.deliverable_name ||
    "Manager大項目"
  ).trim();

  var leader = String(
    payload.leaderLabel ||
    payload.leaderRaw ||
    payload.assigned_leader_label ||
    (payload.body && payload.body.assigned_leader_label) ||
    row.assigned_leader_label ||
    row.leader_robot_label ||
    "課長/Leader"
  ).trim();

  return [
    '<section class="aicm-core-card aicm-leader-handoff-confirm-r8s" style="border:2px solid #f59e0b;">',
    '  <p class="aicm-eyebrow">課長へ送る確認</p>',
    '  <h2>このManager大項目を課長へ送りますか？</h2>',
    '  <p class="aicm-selected-note">DB更新前の確認カードです。内容を確認してから確定してください。</p>',
    '  <dl class="aicm-core-detail-list">',
    '    <dt>対象</dt><dd>' + esc(title) + '</dd>',
    '    <dt>課長/Leader</dt><dd>' + esc(leader) + '</dd>',
    '    <dt>Manager大項目ID</dt><dd>' + esc(majorId || '-') + '</dd>',
    '  </dl>',
    '  <div class="aicm-dashboard-action-row">',
    '    <button type="button" data-core-action="r8z-v9f4b-leader-handoff-confirm-canc


============================================================
7. classification
============================================================
FINAL_JUDGEMENT=V10L_B1_STOPPED_RENDER_TASK_LEDGER_EXACT_NOT_FOUND
NEXT_ACTION=V10L_B1B_PATCH_USING_ACTUAL_RENDERER_CANDIDATE
CORE_SYNTAX_RESULT=OK
SERVER_SYNTAX_RESULT=OK
PATCH_DECISION=STOP_RENDER_TASK_LEDGER_FUNCTION_NOT_FOUND
TARGET_FUNCTION_FOUND=
V10L_B1_MARKER_COUNT=0
V10L_B1_PANEL_COUNT=0
V10L_B1_CHECKBOX_COUNT=0
RENDER_TASK_LEDGER_EXACT_COUNT=5
RENDER_TASK_LEDGER_TEXT_COUNT=15
TASK_LEDGER_SCREEN_TEXT_COUNT=56
TASK_LEDGER_JP_TEXT_COUNT=18
CANDIDATE_COUNT=84
TOP_CANDIDATES=aicmRenderTaskLedgerSafeR8V4@5151:score34,renderTaskLedgerPlaceholder@6080:score34,renderTaskLedgerCreateForm@3087:score30,createTaskLedgerFromForm@3162:score30,h@4265:score30,aicmOpenTaskLedgerScreenR8V3Clean@5197:score30,go@495:score26,taskLedgerCsvTemplateText@3264:score26,renderAicmBusinessStartScreen@8269:score24,v10cRenderReviewList@11344:score24
LATEST_REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/000_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_REPORT.md
PATCH_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/010_patch.log
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/020_patch_analysis.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_failed_patch_salvage_20260504_075635/030_core_task_ledger_renderer_scan.txt
CANDIDATES=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_failed_patch_salvage_20260504_075635/040_renderer_candidates.txt
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_ledger_multi_send_confirm_only_20260504_075455/aicm-production-core.before_v10l_b1.js
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_failed_patch_salvage_20260504_075635/050_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_b1_failed_patch_salvage_20260504_075635/000_R8Z_V10L_B1_FAILED_PATCH_SALVAGE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO
