============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 課新規追加で他課の従業員が表示される
- renderSectionNew 自体は selectedSection / placements を読んでいない
- renderShell worker候補なし
- render route は renderSectionNew を呼んでいる
- よって本命は「section-new入場時のstate残留」または「render後のglobal injection」

今回:
1. core/server syntax確認
2. served core一致確認
3. data-core-action=go / section-new 遷移処理を抽出
4. selectedSectionId / selectedSection / currentSection / editingSectionId の代入箇所を抽出
5. placement/従業員UIのglobal injection箇所を抽出
6. section-new入場時に既存課stateをclearしているか判定
7. 次の最小修正点を分類

禁止:
- DB write
- API POST
- PATCH
- HTML後置換
- renderSectionNew wrap

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2f_section_new_entry_state_injection_20260503_221705
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. served core
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=c19688ee17ca581075e77c466ca94cd129c221c5d70866feb98b4e39236e2356
SERVED_SHA=c19688ee17ca581075e77c466ca94cd129c221c5d70866feb98b4e39236e2356

============================================================
4. extract state / injection paths
============================================================
HAS_GO_HANDLER=true
SECTION_NEW_BUTTON_HAS_DATA_SCREEN=true
GO_HANDLER_SETS_SCREEN=true
GO_HANDLER_CLEARS_SELECTED_SECTION=false
SECTION_NEW_BRANCH_CLEARS_SELECTED_SECTION=false
HAS_GLOBAL_PLACEMENT_INJECTION=true
FINAL_STATIC_JUDGEMENT=FIX_SECTION_NEW_GO_HANDLER_CLEAR_SELECTED_SECTION_STATE

============================================================
5. focused preview
============================================================
---- go handler scan first 180 lines ----
============================================================
PATTERN=data-core-action="go"
LINE=552
------------------------------------------------------------
   538:     if (state.screen === "placement-new") return "Worker配置";
   539:     if (state.screen === "settings") return "AI企業設定";
   540:     return "AI企業ダッシュボード";
   541:   }
   542: 
   543:   
   544: // AICM_WORKER_RUNTIME_UI_NAV_AXT_R1_V1
   545: function renderShell(content) {
   546:     return [
   547:       '<div class="aicm-core" data-core-mark="' + CORE_MARK + '">',
   548:       '  <header class="aicm-core-header">',
   549:       '    <h1>AI企業運営アプリ</h1>',
   550:       '  </header>',
   551:       '  <nav class="aicm-core-tabs" aria-label="AICompanyManager navigation">',
   552:       '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
   553:       '    <button type="button" data-core-action="task-ledger-open">部門別タスク台帳</button>',
   554:       '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
   555:       '  <button type="button" data-core-action="go" data-screen="worker-runtime-request">AI実行Workbench</button>',
   556:       '  </nav>',
   557:       renderMessages(),
   558:       '  <main class="aicm-core-main">',
   559:       content,
   560:       '  </main>',
   561:       '</div>'
   562:     ].join("");
   563:   }
   564: 
   565:   function renderMessages() {
   566:     var parts = [];
   567: 
   568:     if (state.loading) {
   569:       parts.push('<div class="aicm-core-message">読込中...</div>');
   570:     }
   571: 
   572:     if (state.noticeMessage) {
   573:       parts.push('<div class="aicm-core-message aicm-core-message-ok">' + escapeHtml(state.noticeMessage) + '</div>');
   574:     }
   575: 
   576:     if (state.errorMessage) {
   577:       parts.push('<div class="aicm-core-message aicm-core-message-error">' + escapeHtml(state.errorMessage) + '</div>');
   578:     }
   579: 
   580:     return parts.join("");
   581:   }
   582: 
   583:   function renderCompanySelect() {
   584:     if (state.context.companies.length === 0) {
   585:       return '<p class="aicm-core-empty">v2会社はまだありません。AI企業新規追加から作成してください。</p>';
   586:     }
============================================================
PATTERN=data-core-action="go"
LINE=554
------------------------------------------------------------
   540:     return "AI企業ダッシュボード";
   541:   }
   542: 
   543:   
   544: // AICM_WORKER_RUNTIME_UI_NAV_AXT_R1_V1
   545: function renderShell(content) {
   546:     return [
   547:       '<div class="aicm-core" data-core-mark="' + CORE_MARK + '">',
   548:       '  <header class="aicm-core-header">',
   549:       '    <h1>AI企業運営アプリ</h1>',
   550:       '  </header>',
   551:       '  <nav class="aicm-core-tabs" aria-label="AICompanyManager navigation">',
   552:       '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
   553:       '    <button type="button" data-core-action="task-ledger-open">部門別タスク台帳</button>',
   554:       '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
   555:       '  <button type="button" data-core-action="go" data-screen="worker-runtime-request">AI実行Workbench</button>',
   556:       '  </nav>',
   557:       renderMessages(),
   558:       '  <main class="aicm-core-main">',
   559:       content,
   560:       '  </main>',
   561:       '</div>'
   562:     ].join("");
   563:   }
   564: 
   565:   function renderMessages() {
   566:     var parts = [];
   567: 
   568:     if (state.loading) {
   569:       parts.push('<div class="aicm-core-message">読込中...</div>');
   570:     }
   571: 
   572:     if (state.noticeMessage) {
   573:       parts.push('<div class="aicm-core-message aicm-core-message-ok">' + escapeHtml(state.noticeMessage) + '</div>');
   574:     }
   575: 
   576:     if (state.errorMessage) {
   577:       parts.push('<div class="aicm-core-message aicm-core-message-error">' + escapeHtml(state.errorMessage) + '</div>');
   578:     }
   579: 
   580:     return parts.join("");
   581:   }
   582: 
   583:   function renderCompanySelect() {
   584:     if (state.context.companies.length === 0) {
   585:       return '<p class="aicm-core-empty">v2会社はまだありません。AI企業新規追加から作成してください。</p>';
   586:     }
   587: 
   588:     return [
============================================================
PATTERN=data-core-action="go"
LINE=555
------------------------------------------------------------
   541:   }
   542: 
   543:   
   544: // AICM_WORKER_RUNTIME_UI_NAV_AXT_R1_V1
   545: function renderShell(content) {
   546:     return [
   547:       '<div class="aicm-core" data-core-mark="' + CORE_MARK + '">',
   548:       '  <header class="aicm-core-header">',
   549:       '    <h1>AI企業運営アプリ</h1>',
   550:       '  </header>',
   551:       '  <nav class="aicm-core-tabs" aria-label="AICompanyManager navigation">',
   552:       '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
   553:       '    <button type="button" data-core-action="task-ledger-open">部門別タスク台帳</button>',
   554:       '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
   555:       '  <button type="button" data-core-action="go" data-screen="worker-runtime-request">AI実行Workbench</button>',
   556:       '  </nav>',
   557:       renderMessages(),
   558:       '  <main class="aicm-core-main">',
   559:       content,
   560:       '  </main>',
   561:       '</div>'
   562:     ].join("");
   563:   }
   564: 
   565:   function renderMessages() {
   566:     var parts = [];
   567: 
   568:     if (state.loading) {
   569:       parts.push('<div class="aicm-core-message">読込中...</div>');
   570:     }
   571: 
   572:     if (state.noticeMessage) {
   573:       parts.push('<div class="aicm-core-message aicm-core-message-ok">' + escapeHtml(state.noticeMessage) + '</div>');
   574:     }
   575: 
   576:     if (state.errorMessage) {
   577:       parts.push('<div class="aicm-core-message aicm-core-message-error">' + escapeHtml(state.errorMessage) + '</div>');
   578:     }
   579: 
   580:     return parts.join("");
   581:   }
   582: 
   583:   function renderCompanySelect() {
   584:     if (state.context.companies.length === 0) {
   585:       return '<p class="aicm-core-empty">v2会社はまだありません。AI企業新規追加から作成してください。</p>';
   586:     }
   587: 
   588:     return [
   589:       '<label>AI企業</label>',
============================================================
PATTERN=data-core-action="go"
LINE=835
------------------------------------------------------------
   821:       ].join("");
   822:     }
   823: 
   824:     return [
   825:       '<section class="aicm-core-card">',
   826:       '  <p class="aicm-eyebrow">企業変更</p>',
   827:       '  <h2>企業情報を変更</h2>',
   828:       '  <input type="hidden" id="aicm-company-edit-id" value="' + escapeHtml(company.aicm_user_company_id || '') + '">',
   829:       '  <label>企業名<input id="aicm-company-edit-name" type="text" value="' + escapeHtml(company.company_name || '') + '"></label>',
   830:       '  <label>事業領域<textarea id="aicm-company-edit-domain" rows="3">' + escapeHtml(company.business_domain || '') + '</textarea></label>',
   831:       '  <label>会社共通ルール<textarea id="aicm-company-edit-rules" rows="4">' + escapeHtml(company.company_common_rules_text || '') + '</textarea></label>',
   832:       '  <label>President方針指示<textarea id="aicm-company-edit-policy" rows="4">' + escapeHtml(company.president_policy_instruction_text || '') + '</textarea></label>',
   833:       '  <div class="aicm-dashboard-action-row">',
   834:       '    <button type="button" data-core-action="company-update-save">変更を保存</button>',
   835:       '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
   836:       '  </div>',
   837:       '</section>'

---- selected section scan first 180 lines ----
============================================================
PATTERN=selectedSectionId =
LINE=217
------------------------------------------------------------
   203: 
   204:   function setSelectedCompany(companyId) {
   205:     if (hasCompany(companyId)) {
   206:       state.selectedCompanyId = companyId;
   207:       writeStorage(STORAGE.selectedCompanyId, companyId);
   208: 
   209:       var departments = companyDepartments(companyId);
   210:       if (!hasDepartment(state.selectedDepartmentId)) {
   211:         state.selectedDepartmentId = departments[0] ? departments[0].aicm_user_company_department_id : "";
   212:         writeStorage(STORAGE.selectedDepartmentId, state.selectedDepartmentId);
   213:       }
   214:     } else {
   215:       state.selectedCompanyId = "";
   216:       state.selectedDepartmentId = "";
   217:       state.selectedSectionId = "";
   218:       writeStorage(STORAGE.selectedCompanyId, "");
   219:       writeStorage(STORAGE.selectedDepartmentId, "");
   220:       writeStorage(STORAGE.selectedSectionId, "");
   221:     }
   222:   }
   223: 
   224:   function setSelectedDepartment(departmentId) {
   225:     if (hasDepartment(departmentId)) {
   226:       state.selectedDepartmentId = departmentId;
   227:       writeStorage(STORAGE.selectedDepartmentId, departmentId);
   228: 
   229:       var sections = departmentSections(departmentId);
   230:       if (!getSection(state.selectedSectionId)) {
   231:         state.selectedSectionId = sections[0] ? sections[0].aicm_user_company_section_id : "";
   232:         writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
   233:       }
   234:     } else {
   235:       state.selectedDepartmentId = "";
   236:       state.selectedSectionId = "";
   237:       writeStorage(STORAGE.selectedDepartmentId, "");
   238:       writeStorage(STORAGE.selectedSectionId, "");
   239:     }
   240:   }
   241: 
   242:   function syncSelectionAfterContextLoad() {
   243:     if (hasCompany(state.selectedCompanyId)) {
   244:       setSelectedCompany(state.selectedCompanyId);
   245:       return;
   246:     }
   247: 
   248:     if (state.context.companies[0]) {
   249:       setSelectedCompany(state.context.companies[0].aicm_user_company_id);
   250:       return;
   251:     }
============================================================
PATTERN=selectedSectionId =
LINE=231
------------------------------------------------------------
   217:       state.selectedSectionId = "";
   218:       writeStorage(STORAGE.selectedCompanyId, "");
   219:       writeStorage(STORAGE.selectedDepartmentId, "");
   220:       writeStorage(STORAGE.selectedSectionId, "");
   221:     }
   222:   }
   223: 
   224:   function setSelectedDepartment(departmentId) {
   225:     if (hasDepartment(departmentId)) {
   226:       state.selectedDepartmentId = departmentId;
   227:       writeStorage(STORAGE.selectedDepartmentId, departmentId);
   228: 
   229:       var sections = departmentSections(departmentId);
   230:       if (!getSection(state.selectedSectionId)) {
   231:         state.selectedSectionId = sections[0] ? sections[0].aicm_user_company_section_id : "";
   232:         writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
   233:       }
   234:     } else {
   235:       state.selectedDepartmentId = "";
   236:       state.selectedSectionId = "";
   237:       writeStorage(STORAGE.selectedDepartmentId, "");
   238:       writeStorage(STORAGE.selectedSectionId, "");
   239:     }
   240:   }
   241: 
   242:   function syncSelectionAfterContextLoad() {
   243:     if (hasCompany(state.selectedCompanyId)) {
   244:       setSelectedCompany(state.selectedCompanyId);
   245:       return;
   246:     }
   247: 
   248:     if (state.context.companies[0]) {
   249:       setSelectedCompany(state.context.companies[0].aicm_user_company_id);
   250:       return;
   251:     }
   252: 
   253:     setSelectedCompany("");
   254:   }
   255: 
   256:   function loadContext() {
   257:     state.loading = true;
   258:     state.errorMessage = "";
   259:     render();
   260: 
   261:     return requestJson(endpointWithOwner())
   262:       .then(function (json) {
   263:         state.context = normalizeContext(json);
   264:     // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL
   265:     if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
============================================================
PATTERN=selectedSectionId =
LINE=236
------------------------------------------------------------
   222:   }
   223: 
   224:   function setSelectedDepartment(departmentId) {
   225:     if (hasDepartment(departmentId)) {
   226:       state.selectedDepartmentId = departmentId;
   227:       writeStorage(STORAGE.selectedDepartmentId, departmentId);
   228: 
   229:       var sections = departmentSections(departmentId);
   230:       if (!getSection(state.selectedSectionId)) {
   231:         state.selectedSectionId = sections[0] ? sections[0].aicm_user_company_section_id : "";
   232:         writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
   233:       }
   234:     } else {
   235:       state.selectedDepartmentId = "";
   236:       state.selectedSectionId = "";
   237:       writeStorage(STORAGE.selectedDepartmentId, "");
   238:       writeStorage(STORAGE.selectedSectionId, "");
   239:     }
   240:   }
   241: 
   242:   function syncSelectionAfterContextLoad() {
   243:     if (hasCompany(state.selectedCompanyId)) {
   244:       setSelectedCompany(state.selectedCompanyId);
   245:       return;
   246:     }
   247: 
   248:     if (state.context.companies[0]) {
   249:       setSelectedCompany(state.context.companies[0].aicm_user_company_id);
   250:       return;
   251:     }
   252: 
   253:     setSelectedCompany("");
   254:   }
   255: 
   256:   function loadContext() {
   257:     state.loading = true;
   258:     state.errorMessage = "";
   259:     render();
   260: 
   261:     return requestJson(endpointWithOwner())
   262:       .then(function (json) {
   263:         state.context = normalizeContext(json);
   264:     // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL
   265:     if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
   266:       aicmHydrateManagerMajorContextArraysR8M(
   267:         typeof json !== "undefined" ? json :
   268:         (typeof data !== "undefined" ? data :
   269:         (typeof contextJson !== "undefined" ? contextJson :
   270:         (typeof ctx !== "undefined" ? ctx : null)))
============================================================
PATTERN=selectedSectionId =
LINE=453
------------------------------------------------------------
   439:     }
   440: 
   441:     if (!state.selectedDepartmentId || !hasDepartment(state.selectedDepartmentId)) {
   442:       throw new Error("先にv2の部門を作成・選択してください。");
   443:     }
   444: 
   445:     return requestJson(API.createSection, {
   446:       owner_civilization_id: state.ownerCivilizationId,
   447:       aicm_user_company_id: state.selectedCompanyId,
   448:       aicm_user_company_department_id: state.selectedDepartmentId,
   449:       section_name: payload.sectionName,
   450:       purpose: payload.purpose
   451:     }).then(function (json) {
   452:       if (json.section && json.section.aicm_user_company_section_id) {
   453:         state.selectedSectionId = json.section.aicm_user_company_section_id;
   454:         writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
   455:       }

---- render branch scan ----
function render() {
    if (!root) return;

    var html = "";

    if (state.screen === "company-new") {
      html = renderCompanyNew();
    } else if (state.screen === "department-new") {
      html = renderDepartmentNew();
    } else if (state.screen === "section-new") {
      html = renderSectionNew();
    } else if (state.screen === "placement-new") {
      html = renderPlacementNew();
    } else if (state.screen === "worker-runtime-confirm") {
      // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1
      html = renderWorkerRuntimeConfirm();
    } else if (state.screen === "worker-runtime-request") {
      html = renderWorkerRuntimeRequest();
    } else if (state.screen === "settings") {
      html = renderSettings();
    } else if (state.screen === "department-edit") {
      html = renderDepartmentEditPlaceholder();
    } else if (state.screen === "section-edit") {
      html = renderSectionEditPlaceholder();
    } else if (state.screen === "ai-business-start") {
      html = renderAicmBusinessStartScreen();
    } else if (state.screen === "task-ledger") {
      html = renderTaskLedgerPlaceholder();
    } else if (state.screen === "review-list") {
      html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL
    } else {
      html = renderDashboard();
    }

    
    // AICM_COMPANY_EDIT_RENDER_ROUTE_ASS_ASV
    if (
      state &&
      (
        state.screen === "company-edit" ||
        state.screen === "company-change" ||
        state.screen === "company-update"
      )
    ) {
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      html = renderCompanyEditPlaceholder();
    }


    // AICM_EDIT_SCREEN_RENDER_OVERRIDE_ATE_ATH
    if (state && state.screen === "company-edit") {
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      html = renderCompanyEditPlaceholder();
    }

    if (state && state.screen === "department-edit") {
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      html = renderDepartmentEditPlaceholder();
    }

    if (state && state.screen === "section-edit") {
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      html = renderSectionEditPlaceholder();
    }


    // AICM_INLINE_ROLE_ADD_SCREEN_INJECTION_ATQ_ATT
    if (typeof aicmInjectInlineRoleSettingsForAddScreens === "function") {
      html = aicmInjectInlineRoleSettingsForAddScreens(html);
    }

root.innerHTML = html;
  }
============================================================
6. final
============================================================
FINAL_JUDGEMENT=FIX_SECTION_NEW_GO_HANDLER_CLEAR_SELECTED_SECTION_STATE
ROOT_HTTP=200
SERVED_HTTP=200
HAS_GO_HANDLER=true
SECTION_NEW_BUTTON_HAS_DATA_SCREEN=true
GO_HANDLER_SETS_SCREEN=true
GO_HANDLER_CLEARS_SELECTED_SECTION=false
SECTION_NEW_BRANCH_CLEARS_SELECTED_SECTION=false
HAS_GLOBAL_PLACEMENT_INJECTION=true
GO_HANDLER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2f_section_new_entry_state_injection_20260503_221705/020_go_handler_scan.txt
SECTION_NEW_CLICK_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2f_section_new_entry_state_injection_20260503_221705/030_section_new_click_scan.txt
SELECTED_SECTION_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2f_section_new_entry_state_injection_20260503_221705/040_selected_section_assignment_scan.txt
PLACEMENT_INJECTION_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2f_section_new_entry_state_injection_20260503_221705/050_placement_injection_scan.txt
RENDER_BRANCH_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2f_section_new_entry_state_injection_20260503_221705/060_render_branch_scan.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2f_section_new_entry_state_injection_20260503_221705/070_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2f_section_new_entry_state_injection_20260503_221705/000_R8Z_V10F2F_SECTION_NEW_ENTRY_STATE_INJECTION_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT_PATCH_POLICY:
- FIX_SECTION_NEW_GO_HANDLER_CLEAR_SELECTED_SECTION_STATE:
  data-screen="section-new" 遷移時だけ、selectedSectionId / selectedSection / currentSection / editingSectionId をクリアする。
  高保守。画面入口のstate hygiene修正。

- FIX_SECTION_NEW_RENDER_BRANCH_CLEAR_SELECTED_SECTION_STATE:
  render() の section-new 分岐直前に、既存課選択stateをクリアする。
  go handlerが複数ある場合はこちらが安全。

- FIX_GLOBAL_PLACEMENT_INJECTION_SKIP_SECTION_NEW:
  placement injection本体に state.screen !== "section-new" guard を入れる。
