============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 課新規追加で他課の従業員が表示される
- V10F2A: renderSectionNew 自体は selectedSection / placements を読んでいない
- V10F2B: worker renderer自動特定は候補なしで安全停止
- V10F2D: renderShell worker候補なしで安全停止
- 重要: SECTION_NEW_ROUTE_CALLS_RENDER_SECTION_NEW=false

今回:
1. render() の section-new 分岐を正確に抽出
2. renderSectionNew() の存在と中身を再確認
3. 課新規追加ボタン/action がどの screen をセットしているか確認
4. section-new 分岐が renderSectionNew() 以外を呼んでいないか確認
5. 次の最小パッチを分類

禁止:
- DB write
- API POST
- PATCH

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2e_section_new_route_exact_branch_20260503_221546
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. exact extracts
============================================================
RENDER_FOUND=true
RENDER_SECTION_NEW_FOUND=true
RENDER_SECTION_NEW_LINE=2943
SECTION_NEW_IN_RENDER=true
SECTION_NEW_BRANCH_CALLS_RENDER_SECTION_NEW=true
SECTION_NEW_BRANCH_CALLS_SECTION_EDIT=true
SECTION_NEW_BRANCH_CALLS_PLACEMENT=true
SECTION_NEW_BRANCH_SNIPPET="function render() {\n    if (!root) return;\n\n    var html = \"\";\n\n    if (state.screen === \"company-new\") {\n      html = renderCompanyNew();\n    } else if (state.screen === \"department-new\") {\n      html = renderDepartmentNew();\n    } else if (state.screen === \"section-new\") {\n      html = renderSectionNew();\n    } else if (state.screen === \"placement-new\") {\n      html = renderPlacementNew();\n    } else if (state.screen === \"worker-runtime-confirm\") {\n      // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1\n      html = renderWorkerRuntimeConfirm();\n    } else if (state.screen === \"worker-runtime-request\") {\n      html = renderWorkerRuntimeRequest();\n    } else if (state.screen === \"settings\") {\n      html = renderSettings();\n    } else if (state.screen === \"department-edit\") {\n      html = renderDepartmentEditPlaceholder();\n    } else if (state.screen === \"section-edit\") {\n      html = renderSect"

============================================================
4. focused output
============================================================
---- render route extract ----
============================================================
PATTERN=state.screen === "section-new"
LINE=537
------------------------------------------------------------
   527:       .then(function () {
   528:         state.__taskLedgerContextRefreshing = false;
   529:         state.screen = "task-ledger";
   530:         render();
   531:       });
   532:   }
   533: 
   534:   function pageTitle() {
   535:     if (state.screen === "company-new") return "AI企業新規追加";
   536:     if (state.screen === "department-new") return "部門新規追加";
   537:     if (state.screen === "section-new") return "課新規追加";
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
============================================================
PATTERN=state.screen === "section-edit"
LINE=8340
------------------------------------------------------------
  8330:       html = renderPlacementNew();
  8331:     } else if (state.screen === "worker-runtime-confirm") {
  8332:       // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1
  8333:       html = renderWorkerRuntimeConfirm();
  8334:     } else if (state.screen === "worker-runtime-request") {
  8335:       html = renderWorkerRuntimeRequest();
  8336:     } else if (state.screen === "settings") {
  8337:       html = renderSettings();
  8338:     } else if (state.screen === "department-edit") {
  8339:       html = renderDepartmentEditPlaceholder();
  8340:     } else if (state.screen === "section-edit") {
  8341:       html = renderSectionEditPlaceholder();
  8342:     } else if (state.screen === "ai-business-start") {
  8343:       html = renderAicmBusinessStartScreen();
  8344:     } else if (state.screen === "task-ledger") {
  8345:       html = renderTaskLedgerPlaceholder();
  8346:     } else if (state.screen === "review-list") {
  8347:       html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL
  8348:     } else {
  8349:       html = renderDashboard();
  8350:     }
  8351: 
  8352:     
  8353:     // AICM_COMPANY_EDIT_RENDER_ROUTE_ASS_ASV
  8354:     if (
  8355:       state &&
  8356:       (
  8357:         state.screen === "company-edit" ||
  8358:         state.screen === "company-change" ||
  8359:         state.screen === "company-update"
  8360:       )
  8361:     ) {
  8362:       if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
  8363:       html = renderCompanyEditPlaceholder();
  8364:     }
  8365: 
  8366: 
  8367:     // AICM_EDIT_SCREEN_RENDER_OVERRIDE_ATE_ATH
  8368:     if (state && state.screen === "company-edit") {
  8369:       if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
  8370:       html = renderCompanyEditPlaceholder();
  8371:     }
  8372: 
  8373:     if (state && state.screen === "department-edit") {
  8374:       if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
  8375:       html = renderDepartmentEditPlaceholder();
============================================================
PATTERN=state.screen === "placement-new"
LINE=538
------------------------------------------------------------
   528:         state.__taskLedgerContextRefreshing = false;
   529:         state.screen = "task-ledger";
   530:         render();
   531:       });
   532:   }
   533: 
   534:   function pageTitle() {
   535:     if (state.screen === "company-new") return "AI企業新規追加";
   536:     if (state.screen === "department-new") return "部門新規追加";
   537:     if (state.screen === "section-new") return "課新規追加";
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
============================================================
PATTERN=state.screen === "department-edit"
LINE=8338
------------------------------------------------------------
  8328:       html = renderSectionNew();
  8329:     } else if (state.screen === "placement-new") {
  8330:       html = renderPlacementNew();
  8331:     } else if (state.screen === "worker-runtime-confirm") {
  8332:       // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1
  8333:       html = renderWorkerRuntimeConfirm();
  8334:     } else if (state.screen === "worker-runtime-request") {
  8335:       html = renderWorkerRuntimeRequest();
  8336:     } else if (state.screen === "settings") {
  8337:       html = renderSettings();
  8338:     } else if (state.screen === "department-edit") {
  8339:       html = renderDepartmentEditPlaceholder();
  8340:     } else if (state.screen === "section-edit") {
  8341:       html = renderSectionEditPlaceholder();
  8342:     } else if (state.screen === "ai-business-start") {
  8343:       html = renderAicmBusinessStartScreen();
  8344:     } else if (state.screen === "task-ledger") {
  8345:       html = renderTaskLedgerPlaceholder();
  8346:     } else if (state.screen === "review-list") {
  8347:       html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL
  8348:     } else {
  8349:       html = renderDashboard();
  8350:     }
  8351: 
  8352:     
  8353:     // AICM_COMPANY_EDIT_RENDER_ROUTE_ASS_ASV

---- render section-new extract ----
RENDER_FOUND=true
RENDER_LINE=8318
SECTION_NEW_IN_RENDER=true
RENDER_CALLS_RENDER_SECTION_NEW=true

  8297:     ].join(""));
  8298:   }
  8299: 
  8300: function renderAicmBusinessStartDashboardCard() {
  8301:     var company = null;
  8302:     if (typeof selectedCompany === "function") company = selectedCompany();
  8303:     if (!company && typeof aicmOrgSelectedCompany === "function") company = aicmOrgSelectedCompany();
  8304: 
  8305:     return [
  8306:       '<section class="aicm-core-card aicm-operation-card">',
  8307:       '  <p class="aicm-eyebrow">AI企業業務開始</p>',
  8308:       '  <h2>President起点で業務を開始</h2>',
  8309:       company ? '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>' : '  <p class="aicm-core-empty">AI企業を選択してください。</p>',
  8310:       '  <p class="aicm-selected-note">Presidentが業務を送り、Manager/部長が大項目へ分解し、課長へ引き継ぐ正本ルートです。</p>',
  8311:       '  <div class="aicm-dashboard-action-row">',
  8312:       '    <button type="button" data-core-action="go" data-screen="ai-business-start">AI企業業務開始</button>',
  8313:       '  </div>',
  8314:       '</section>'
  8315:     ].join("");
  8316:   }
  8317: 
  8318: function render() {
  8319:     if (!root) return;
  8320: 
  8321:     var html = "";
  8322: 
  8323:     if (state.screen === "company-new") {
  8324:       html = renderCompanyNew();
  8325:     } else if (state.screen === "department-new") {
  8326:       html = renderDepartmentNew();
  8327:     } else if (state.screen === "section-new") {
  8328:       html = renderSectionNew();
  8329:     } else if (state.screen === "placement-new") {
  8330:       html = renderPlacementNew();
  8331:     } else if (state.screen === "worker-runtime-confirm") {
  8332:       // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1
  8333:       html = renderWorkerRuntimeConfirm();
  8334:     } else if (state.screen === "worker-runtime-request") {
  8335:       html = renderWorkerRuntimeRequest();
  8336:     } else if (state.screen === "settings") {
  8337:       html = renderSettings();
  8338:     } else if (state.screen === "department-edit") {
  8339:       html = renderDepartmentEditPlaceholder();
  8340:     } else if (state.screen === "section-edit") {
  8341:       html = renderSectionEditPlaceholder();
  8342:     } else if (state.screen === "ai-business-start") {
  8343:       html = renderAicmBusinessStartScreen();
  8344:     } else if (state.screen === "task-ledger") {
  8345:       html = renderTaskLedgerPlaceholder();
  8346:     } else if (state.screen === "review-list") {
  8347:       html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL
  8348:     } else {
  8349:       html = renderDashboard();
  8350:     }
  8351: 
  8352:     
  8353:     // AICM_COMPANY_EDIT_RENDER_ROUTE_ASS_ASV
  8354:     if (
  8355:       state &&
  8356:       (
  8357:         state.screen === "company-edit" ||
  8358:         state.screen === "company-change" ||
  8359:         state.screen === "company-update"
  8360:       )
  8361:     ) {
  8362:       if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
  8363:       html = renderCompanyEditPlaceholder();
  8364:     }
  8365: 
  8366: 
  8367:     // AICM_EDIT_SCREEN_RENDER_OVERRIDE_ATE_ATH
  8368:     if (state && state.screen === "company-edit") {
  8369:       if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
  8370:       html = renderCompanyEditPlaceholder();
  8371:     }
  8372: 
  8373:     if (state && state.screen === "department-edit") {
  8374:       if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
  8375:       html = renderDepartmentEditPlaceholder();
  8376:     }
  8377: 
  8378:     if (state && state.screen === "section-edit") {
  8379:       if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
  8380:       html = renderSectionEditPlaceholder();
  8381:     }
  8382: 
  8383: 
  8384:     // AICM_INLINE_ROLE_ADD_SCREEN_INJECTION_ATQ_ATT
  8385:     if (typeof aicmInjectInlineRoleSettingsForAddScreens === "function") {
  8386:       html = aicmInjectInlineRoleSettingsForAddScreens(html);
  8387:     }
  8388: 
  8389: root.innerHTML = html;
  8390:   }
  8391: 
  8392:   function fieldValue(form, name) {
  8393:     var field = form.elements[name];
  8394:     return field && typeof field.value === "string" ? field.value.trim() : "";
  8395:   }
  8396: 
  8397:   function submitForm(form) {
  8398:     var formName = form.getAttribute("data-core-form") || "";
  8399:     state.errorMessage = "";
  8400:     state.noticeMessage = "";
  8401: 
  8402:     var task;
  8403: 
  8404:     if (formName === "company-create") {
  8405:       task = createCompany({
  8406:         companyName: fieldValue(form, "companyName"),
  8407:         businessDomain: fieldValue(form, "businessDomain")
  8408:       });
  8409:     } else if (formName === "department-create") {
  8410:       task = createDepartment({
  8411:         departmentName: fieldValue(form, "departmentName"),
  8412:         purpose: fieldValue(form, "purpose")
  8413:       });
  8414:     } else if (formName === "section-create") {
  8415:       task = createSection({
  8416:         sectionName: fieldValue(form, "sectionName"),
  8417:         purpose: fieldValue(form, "purpose")
---- click/action scan ----
============================================================
PATTERN=data-screen="section-new"
LINE=2855
------------------------------------------------------------
  2843:     if (!company) {
  2844:       return [
  2845:         '<div class="aicm-action-list">',
  2846:         '  <button type="button" data-core-action="go" data-screen="company-new">AI企業を作成</button>',
  2847:         '</div>'
  2848:       ].join("");
  2849:     }
  2850: 
  2851:     return [
  2852:       '<div class="aicm-action-list">',
  2853:       '  <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
  2854:       '  <button type="button" data-core-action="go" data-screen="department-new">部門追加</button>',
  2855:       departments.length > 0 ? '  <button type="button" data-core-action="go" data-screen="section-new">課追加</button>' : '  <button type="button" data-core-action="go" data-screen="department-new">先に部門を追加</button>',
  2856:       '  <button type="button" data-core-action="go" data-screen="placement-new">Worker配置</button>',
  2857:       '</div>',
  2858:       '<p class="aicm-core-empty">編集・削除は次工程で追加します。</p>'
  2859:     ].join("");
  2860:   }
  2861: 
  2862: 
  2863:   
  2864: 
  2865: 
  2866: function renderTree(departments) {
  2867:     if (departments.length === 0) {
  2868:       return [
  2869:         '<div class="aicm-empty-state">',
  2870:         '  <strong>部門がまだありません</strong>',
  2871:         '  <p>選択中のAI企業に部門を追加すると、ここに階層表示されます。</p>',
  2872:         '  <div class="aicm-dashboard-action-row">',
  2873:         '    <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
  2874:         '  </div>',
  2875:         '</div>'
  2876:       ].join("");
  2877:     }
  2878: 
  2879:     return [
  2880:       '<div class="aicm-tree-toolbar">',
  2881:       '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
  2882:       '  <button type="button" data-core-action="go" data-screen="section-new">課新規追加</button>',
  2883:       '</div>',
  2884:       '<div class="aicm-org-tree">',
  2885:       departments.map(function (department) {
  2886:         var sections = departmentSections(department.aicm_user_company_department_id);
  2887:         return [
============================================================
PATTERN=data-screen="section-new"
LINE=2882
------------------------------------------------------------
  2870:         '  <strong>部門がまだありません</strong>',
  2871:         '  <p>選択中のAI企業に部門を追加すると、ここに階層表示されます。</p>',
  2872:         '  <div class="aicm-dashboard-action-row">',
  2873:         '    <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
  2874:         '  </div>',
  2875:         '</div>'
  2876:       ].join("");
  2877:     }
  2878: 
  2879:     return [
  2880:       '<div class="aicm-tree-toolbar">',
  2881:       '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
  2882:       '  <button type="button" data-core-action="go" data-screen="section-new">課新規追加</button>',
  2883:       '</div>',
  2884:       '<div class="aicm-org-tree">',
  2885:       departments.map(function (department) {
  2886:         var sections = departmentSections(department.aicm_user_company_department_id);
  2887:         return [
  2888:           '<article class="aicm-org-node">',
  2889:           '  <div class="aicm-org-node-head">',
  2890:           '    <span class="aicm-node-badge">部門</span>',
  2891:           '    <strong>' + escapeHtml(department.department_name) + '</strong>',
  2892:           '    <button type="button" data-core-action="go" data-screen="department-edit">変更</button>',
  2893:           '  </div>',
  2894:           department.purpose ? '<p>' + escapeHtml(department.purpose) + '</p>' : '<p class="aicm-core-empty">目的未設定</p>',
  2895:           sections.length === 0 ? '<div class="aicm-section-empty">課なし</div>' : [
  2896:             '  <ul class="aicm-section-list">',
  2897:             sections.map(function (section) {
  2898:               return [
  2899:                 '<li>',
  2900:                 '  <span class="aicm-node-badge aicm-node-badge-section">課</span>',
  2901:                 '  <strong>' + escapeHtml(section.section_name) + '</strong>',
  2902:                 '  <button type="button" data-core-action="go" data-screen="section-edit">変更</button>',
  2903:                 section.purpose ? '<small>' + escapeHtml(section.purpose) + '</small>' : '',
  2904:                 '</li>'
  2905:               ].join("");
  2906:             }).join(""),
  2907:             '  </ul>'
  2908:           ].join(""),
  2909:           '</article>'
  2910:         ].join("");
  2911:       }).join(""),
  2912:       '</div>'
  2913:     ].join("");
  2914:   }
============================================================
PATTERN=section-new
LINE=537
------------------------------------------------------------
   525:         state.errorMessage = error && error.message ? error.message : "部門別タスク台帳の最新情報取得に失敗しました。";
   526:       })
   527:       .then(function () {
   528:         state.__taskLedgerContextRefreshing = false;
   529:         state.screen = "task-ledger";
   530:         render();
   531:       });
   532:   }
   533: 
   534:   function pageTitle() {
   535:     if (state.screen === "company-new") return "AI企業新規追加";
   536:     if (state.screen === "department-new") return "部門新規追加";
   537:     if (state.screen === "section-new") return "課新規追加";
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
============================================================
PATTERN=section-new
LINE=1223
------------------------------------------------------------
  1211:     robot_pool_id: leader ? leader.robot_pool_id : "",
  1212:     aiworker_model_code: leader ? leader.aiworker_model_code : "",
  1213:     internal_nickname: aicmAxcInputValue("aicm-section-leader-robot-nickname")
  1214:   });
  1215:   if (leaderRow) rows.push(leaderRow);
  1216: 
  1217:   var index = 0;
  1218:   while (index < 30) {
  1219:     var robotEl = aicmAxcFindElement([
  1220:       "aicm-inline-worker-" + String(index) + "-robot",
  1221:       "aicm-role-worker-robot-" + String(index),
  1222:       "aicm-role-worker-section-robot-" + String(index),
  1223:       "aicm-role-worker-section-new-robot-" + String(index)
  1224:     ]);
  1225: 
  1226:     var nickEl = aicmAxcFindElement([
  1227:       "aicm-inline-worker-" + String(index) + "-nickname",
  1228:       "aicm-role-worker-nickname-" + String(index),
  1229:       "aicm-role-worker-section-nickname-" + String(index),
  1230:       "aicm-role-worker-section-new-nickname-" + String(index)
  1231:     ]);
  1232: 
  1233:     if (!robotEl && !nickEl) break;
  1234: 
  1235:     var worker = aicmAxcSelectedRobotMeta(robotEl);
  1236:     var workerRow = aicmAxcBuildRolePlacement({
  1237:       role_code: "Worker",
  1238:       target_level_code: "section",
  1239:       target_id: section.aicm_user_company_section_id,
  1240:       aicm_user_company_department_id: section.aicm_user_company_department_id,
  1241:       aicm_user_company_section_id: section.aicm_user_company_section_id,
  1242:       robot_pool_id: worker ? worker.robot_pool_id : "",
  1243:       aiworker_model_code: worker ? worker.aiworker_model_code : "",
  1244:       internal_nickname: nickEl ? String(nickEl.value || "").trim() : ""
  1245:     });
  1246:     if (workerRow) rows.push(workerRow);
  1247: 
  1248:     index += 1;
  1249:   }
  1250: 
  1251:   return rows;
  1252: }
  1253: 
  1254: async function aicmAxcSyncRolePlacementsForPayload(payload) {
  1255:   // AICM_ROLE_SYNC_REQUEST_BODY_AXH_R1_V1
============================================================
PATTERN=section-new
LINE=1230
------------------------------------------------------------
  1218:   while (index < 30) {
  1219:     var robotEl = aicmAxcFindElement([
  1220:       "aicm-inline-worker-" + String(index) + "-robot",
  1221:       "aicm-role-worker-robot-" + String(index),
  1222:       "aicm-role-worker-section-robot-" + String(index),
  1223:       "aicm-role-worker-section-new-robot-" + String(index)
  1224:     ]);
  1225: 
  1226:     var nickEl = aicmAxcFindElement([
  1227:       "aicm-inline-worker-" + String(index) + "-nickname",
  1228:       "aicm-role-worker-nickname-" + String(index),
  1229:       "aicm-role-worker-section-nickname-" + String(index),
  1230:       "aicm-role-worker-section-new-nickname-" + String(index)
  1231:     ]);
  1232: 
  1233:     if (!robotEl && !nickEl) break;
  1234: 
  1235:     var worker = aicmAxcSelectedRobotMeta(robotEl);
  1236:     var workerRow = aicmAxcBuildRolePlacement({
  1237:       role_code: "Worker",

============================================================
5. classification
============================================================
FINAL_JUDGEMENT=SECTION_NEW_ROUTE_OK_NEED_CLICK_STATE_OR_GLOBAL_INJECTION
RENDER_FOUND=true
RENDER_SECTION_NEW_FOUND=true
SECTION_NEW_BRANCH_CALLS_RENDER_SECTION_NEW=true
SECTION_NEW_BRANCH_CALLS_SECTION_EDIT=true
SECTION_NEW_BRANCH_CALLS_PLACEMENT=true
RENDER_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2e_section_new_route_exact_branch_20260503_221546/010_render_function_section_new_extract.txt
SECTION_NEW_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2e_section_new_route_exact_branch_20260503_221546/020_renderSectionNew_extract.txt
CLICK_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2e_section_new_route_exact_branch_20260503_221546/030_section_new_click_scan.txt
ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2e_section_new_route_exact_branch_20260503_221546/040_route_related_scan.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2e_section_new_route_exact_branch_20260503_221546/000_R8Z_V10F2E_SECTION_NEW_ROUTE_EXACT_BRANCH_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT_PATCH_POLICY:
- FIX_SECTION_NEW_ROUTE_CALL_RENDER_SECTION_NEW:
  render() の section-new 分岐だけを html = renderSectionNew(); に直す。
  これは保守性高い。原因分岐を正すだけ。

- SECTION_NEW_ROUTE_OK_NEED_CLICK_STATE_OR_GLOBAL_INJECTION:
  routeはOKなので、次はクリック時の state.screen / selectedSectionId 残留を調査する。
