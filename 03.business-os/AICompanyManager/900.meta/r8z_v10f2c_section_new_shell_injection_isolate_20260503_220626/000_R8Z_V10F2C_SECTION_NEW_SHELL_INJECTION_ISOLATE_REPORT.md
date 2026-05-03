============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 課新規追加で他課の従業員が表示される
- V10F2A: renderSectionNew は worker/placement を直接読んでいない
- V10F2B: worker renderer自動特定はNO_SAFE_CANDIDATEで安全停止
- renderSectionNew の直接呼び出しは renderShell / renderCompanySelect / renderDepartmentSelect のみ

今回:
1. core/server syntax確認
2. served core一致確認
3. renderShell の中身を抽出
4. render関数の section-new route を抽出
5. 「従業員設定」「従業員設定ロボット」「placement」「worker」リテラルの発生源を抽出
6. renderShell が worker/placement系関数を呼んでいるか確認
7. render後のglobal injection / wrapperが section-new に注入していないか確認
8. 課新規追加ボタンの遷移actionが正しく section-new だけに向いているか確認
9. 保守性の高い最小修正点を分類する

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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2c_section_new_shell_injection_isolate_20260503_220626
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. served core check
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=c19688ee17ca581075e77c466ca94cd129c221c5d70866feb98b4e39236e2356
SERVED_SHA=c19688ee17ca581075e77c466ca94cd129c221c5d70866feb98b4e39236e2356
PASS: served core matches disk

============================================================
4. extract shell / injection path
============================================================
RENDER_SHELL_FOUND=true
RENDER_SHELL_LINE=545
RENDER_SHELL_HAS_WORKER_TEXT=true
RENDER_SHELL_CALL_COUNT=3
RENDER_FUNC_FOUND=true
RENDER_FUNC_LINE=8318
RENDER_FUNC_HAS_SECTION_NEW=true
RENDER_FUNC_HAS_WORKER_TEXT=true
WORKER_LITERAL_COUNT=6
RENDER_SHELL_WORKER_CALL_COUNT=1
GLOBAL_INJECTION_HIT_COUNT=72
SECTION_NEW_ROUTE_CALLS_RENDER_SECTION_NEW=false
FINAL_STATIC_JUDGEMENT=FIX_RENDER_SHELL_EXCLUDE_WORKER_UI_FOR_SECTION_NEW

============================================================
5. focused preview
============================================================
---- renderShell head ----
FUNCTION=renderShell
LINE=545

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
---- shell call graph worker candidates ----
called_name	defined	line	worker_related	injection_related
renderShell	true	545	true	true

---- worker literal scan first 160 lines ----
============================================================
PATTERN=従業員設定ロボット
LINE=2399
------------------------------------------------------------
  2389:         : (typeof aicmAxnPlacementValue === "function" ? aicmAxnPlacementValue(existing) : "");
  2390: 
  2391:       var selectedLabel = typeof aicmAxnPlacementLabel === "function" ? aicmAxnPlacementLabel(existing) : "";
  2392: 
  2393:       var nickname = draftRow
  2394:         ? String(draftRow.internal_nickname || "")
  2395:         : (typeof aicmAxnPlacementNickname === "function" ? aicmAxnPlacementNickname(existing) : "");
  2396: 
  2397:       html.push([
  2398:         '<div class="aicm-worker-inline-row">',
  2399:         '  <label>従業員設定ロボット ' + String(i + 1) + '<select id="aicm-role-' + escapeHtml(safePrefix) + '-robot-' + String(i) + '" data-inline-role-code="worker" data-worker-slot-index="' + String(i) + '">',
  2400:         aicmInlineRobotOptions("worker", selectedValue, selectedLabel),
  2401:         '  </select></label>',
  2402:         '  <label>社内通称<input id="aicm-role-' + escapeHtml(safePrefix) + '-nickname-' + String(i) + '" type="text" value="' + escapeHtml(nickname) + '" placeholder="例: ウルフ@従業員' + String(i + 1) + '"></label>',
  2403:         '</div>'
  2404:       ].join(""));
  2405:     }
  2406: 
  2407:     return html.join("");
  2408:   }
  2409: 
  2410: function renderAicmInlineRoleSetting(roleCode, title, subtitle, fieldPrefix) {
  2411:     var safePrefix = fieldPrefix || roleCode;
  2412: 
  2413:     if (roleCode === "worker") {
  2414:       return [
  2415:         '<section class="aicm-core-card aicm-inline-role-setting-card" data-inline-role="' + escapeHtml(roleCode) + '">',
  2416:         '  <p class="aicm-eyebrow">役職設定</p>',
  2417:         '  <h2>' + escapeHtml(title) + '</h2>',
  2418:         subtitle ? '  <p class="aicm-selected-note">' + escapeHtml(subtitle) + '</p>' : '',
  2419:         renderAicmWorkerInlineRows(safePrefix),
  2420:         '  <button type="button" data-core-action="inline-worker-slot-add">従業員行を追加</button>',
  2421:         '  <p class="aicm-core-empty">従業員は複数設定できます。保存時は確認画面を通して登録します。</p>',
  2422:         '</section>'
  2423:       ].join("");
============================================================
PATTERN=従業員設定
LINE=2399
------------------------------------------------------------
  2389:         : (typeof aicmAxnPlacementValue === "function" ? aicmAxnPlacementValue(existing) : "");
  2390: 
  2391:       var selectedLabel = typeof aicmAxnPlacementLabel === "function" ? aicmAxnPlacementLabel(existing) : "";
  2392: 
  2393:       var nickname = draftRow
  2394:         ? String(draftRow.internal_nickname || "")
  2395:         : (typeof aicmAxnPlacementNickname === "function" ? aicmAxnPlacementNickname(existing) : "");
  2396: 
  2397:       html.push([
  2398:         '<div class="aicm-worker-inline-row">',
  2399:         '  <label>従業員設定ロボット ' + String(i + 1) + '<select id="aicm-role-' + escapeHtml(safePrefix) + '-robot-' + String(i) + '" data-inline-role-code="worker" data-worker-slot-index="' + String(i) + '">',
  2400:         aicmInlineRobotOptions("worker", selectedValue, selectedLabel),
  2401:         '  </select></label>',
  2402:         '  <label>社内通称<input id="aicm-role-' + escapeHtml(safePrefix) + '-nickname-' + String(i) + '" type="text" value="' + escapeHtml(nickname) + '" placeholder="例: ウルフ@従業員' + String(i + 1) + '"></label>',
  2403:         '</div>'
  2404:       ].join(""));
  2405:     }
  2406: 
  2407:     return html.join("");
  2408:   }
  2409: 
  2410: function renderAicmInlineRoleSetting(roleCode, title, subtitle, fieldPrefix) {
  2411:     var safePrefix = fieldPrefix || roleCode;
  2412: 
  2413:     if (roleCode === "worker") {
  2414:       return [
  2415:         '<section class="aicm-core-card aicm-inline-role-setting-card" data-inline-role="' + escapeHtml(roleCode) + '">',
  2416:         '  <p class="aicm-eyebrow">役職設定</p>',
  2417:         '  <h2>' + escapeHtml(title) + '</h2>',
  2418:         subtitle ? '  <p class="aicm-selected-note">' + escapeHtml(subtitle) + '</p>' : '',
  2419:         renderAicmWorkerInlineRows(safePrefix),
  2420:         '  <button type="button" data-core-action="inline-worker-slot-add">従業員行を追加</button>',
  2421:         '  <p class="aicm-core-empty">従業員は複数設定できます。保存時は確認画面を通して登録します。</p>',
  2422:         '</section>'
  2423:       ].join("");
============================================================
PATTERN=従業員設定
LINE=2467
------------------------------------------------------------
  2457:       extra = renderAicmInlineRoleSetting("president", "社長設定", "AI企業全体の方針を受けるPresidentを設定します。", "president-company-new");
  2458:     }
  2459: 
  2460:     if (state.screen === "department-new") {
  2461:       extra = renderAicmInlineRoleSetting("manager", "部長設定", "この部門を統括するManagerを設定します。", "manager-department-new");
  2462:     }
  2463: 
  2464:     if (state.screen === "section-new") {
  2465:       extra = [
  2466:         renderAicmInlineRoleSetting("leader", "課長設定", "この課を統括するLeaderを設定します。", "leader-section-new"),
  2467:         renderAicmInlineRoleSetting("worker", "従業員設定", "この課に配置するWorkerを設定します。", "worker-section-new")
  2468:       ].join("");
  2469:     }
  2470: 
  2471:     if (!extra) return html;
  2472:     if (html.indexOf("aicm-inline-role-setting-card") >= 0) return html;
  2473: 
  2474:     if (html.indexOf("</main></div>") >= 0) {
  2475:       return html.replace("</main></div>", extra + "</main></div>");
  2476:     }
  2477: 
  2478:     if (html.indexOf("</main>") >= 0) {
  2479:       return html.replace("</main>", extra + "</main>");
  2480:     }
  2481: 
  2482:     return html + extra;
  2483:   }
  2484: 
  2485: 
  2486:   
  2487: // AICM_EXPLICIT_EDIT_DB_CONNECT_AVA_AVD_REDO_V1
  2488: function aicmAvdCtx() {
  2489:     if (typeof ctx !== "undefined" && ctx) return ctx;
  2490:     if (typeof state !== "undefined" && state && state.context) return state.context;
  2491:     if (typeof state !== "undefined" && state && state.ctx) return state.ctx;
============================================================
PATTERN=従業員設定
LINE=2684
------------------------------------------------------------
  2674:         var robotLabel = selectedLabelFromElement(robotEl);
  2675:         var nickname = nickEl ? String(nickEl.value || "").trim() : "";
  2676: 
  2677:         if (robotLabel || nickname) {
  2678:           workerRows.push((robotLabel || "未設定") + (nickname ? " / " + nickname : ""));
  2679:         }
  2680: 
  2681:         index += 1;
  2682:       }
  2683: 
  2684:       rows.push(["従業員設定", workerRows.length ? workerRows.join("\n") : "未設定"]);
  2685:     }
  2686: 
  2687:     return rows;
  2688:   }
  2689: 
  2690: function aicmAvdShowDbConfirm(payload) {
  2691:     if (!payload || !payload.endpoint || !payload.body) {
  2692:       setMessage("error", "確認画面を表示できません。");
  2693:       return;
  2694:     }
  2695: 
  2696:     if (typeof aicmOrgShowUpdateConfirm === "function") {
  2697:       aicmOrgShowUpdateConfirm(payload);
  2698:       return;
  2699:     }
  2700: 
  2701:     if (typeof state !== "undefined") {
  2702:       state.pendingOrgUpdate = payload;
  2703:     }
  2704: 
  2705:     var root = document.getElementById("aicm-root");
  2706:     if (!root) return;
  2707: 
  2708:     root.innerHTML = renderAicmOrgUpdateConfirmation(payload);
============================================================
PATTERN=従業員設定
LINE=7640
------------------------------------------------------------

---- global injection scan first 220 lines ----
============================================================
PATTERN=renderShell =
LINE=11268
------------------------------------------------------------
 11260:             '  <p class="aicm-core-message aicm-core-message-error">context APIからレビュー待ちを取得できませんでした。</p>',
 11261:             '  <div class="aicm-dashboard-action-row">',
 11262:             '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
 11263:             '    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳へ</button>',
 11264:             '  </div>',
 11265:             '</section>'
 11266:           ].join("");
 11267: 
 11268:       if (typeof renderShell === "function") {
 11269:         return renderShell(body);
 11270:       }
 11271: 
 11272:       return body;
 11273:     }
 11274: 
 11275:     if (typeof window !== "undefined") {
 11276:       window.aicmR8zV10cRenderReviewList = v10cRenderReviewList;
 11277:       window.aicmR8zV7RenderReviewList = v10cRenderReviewList;
 11278:     }
 11279:   })();
 11280:   // AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER_END
 11281: 
 11282:   // AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD_START
 11283:   // Review artifact detail card. Scope: review-list only. No DB write / no API POST.
 11284:   (function installAicmR8zV10dReviewArtifactDetailCard() {
 11285:     function t(value) {
 11286:       return String(value === undefined || value === null ? "" : value).trim();
============================================================
PATTERN=renderShell =
LINE=11684
------------------------------------------------------------
 11676:           : [
 11677:               '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
 11678:               '  <h3>レビュー待ちが取得できません</h3>',
 11679:               '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
 11680:               '</section>'
 11681:             ].join("")
 11682:       ].join("");
 11683: 
 11684:       if (typeof renderShell === "function") return renderShell(body);
 11685:       return body;
 11686:     }
 11687: 
 11688:     function rerender() {
 11689:       try {
 11690:         if (typeof render === "function") {
 11691:           render();
 11692:           return;
 11693:         }
 11694:       } catch (_) {}
 11695: 
 11696:       try {
 11697:         if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
 11698:           window.aicmRender();
 11699:         }
 11700:       } catch (_) {}
 11701:     }
 11702: 
============================================================
PATTERN=renderShell =
LINE=12145
------------------------------------------------------------
 12137:           : [
 12138:               '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
 12139:               '  <h3>レビュー待ちが取得できません</h3>',
 12140:               '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
 12141:               '</section>'
 12142:             ].join("")
 12143:       ].join("");
 12144: 
 12145:       if (typeof renderShell === "function") return renderShell(body);
 12146:       return body;
 12147:     }
 12148: 
 12149:     function rerenderAndScroll(id) {
 12150:       try {
 12151:         if (typeof render === "function") render();
 12152:         else if (typeof window !== "undefined" && typeof window.aicmRender === "function") window.aicmRender();
 12153:       } catch (_) {}
 12154: 
 12155:       if (!id || typeof document === "undefined") return;
 12156: 
 12157:       setTimeout(function() {
 12158:         try {
 12159:           var el = document.getElementById("aicm-v10d2-detail-" + id);
 12160:           if (el && typeof el.scrollIntoView === "function") {
 12161:             el.scrollIntoView({ behavior: "smooth", block: "start" });
 12162:           }
 12163:         } catch (_) {}
============================================================
PATTERN=renderShell(
LINE=545
------------------------------------------------------------
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
============================================================
PATTERN=renderShell(
LINE=627
------------------------------------------------------------
   619: function renderDashboard() {
   620:     var company = selectedCompany();
   621:     var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
   622:     var sections = departments.reduce(function (acc, department) {
   623:       return acc.concat(departmentSections(department.aicm_user_company_department_id));
   624:     }, []);
   625:     var placements = company ? companyPlacements(company.aicm_user_company_id) : [];
   626: 
   627:     return renderShell([
   628:       '<section class="aicm-dashboard-grid aicm-dashboard-main-grid">',
   629:       '  <div class="aicm-core-card aicm-card-primary">',
   630:       '    <div class="aicm-card-title-row">',
   631:       '      <div>',
   632:       '        <p class="aicm-eyebrow">AI企業</p>',
   633:       '        <h2>AI企業選択</h2>',
   634:       '      </div>',
   635:       '      <button type="button" data-core-action="reload">AI企業を表示</button>',
   636:       '    </div>',
   637:       renderCompanySelect(),
   638:       company ? '<p class="aicm-selected-note">選択中: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
   639:       '  </div>',
   640: 
   641:       '  <div class="aicm-core-card">',
   642:       '    <p class="aicm-eyebrow">会社概要</p>',
   643:       '    <h2>会社概要</h2>',
   644:       company ? renderCompanyOverview(company, departments, sections, placements) : renderNoCompanyCard(),
   645:       '  </div>',
============================================================
PATTERN=renderShell(
LINE=955
------------------------------------------------------------
   947:       '    <button type="button" data-core-action="section-update-save">変更を保存</button>',
   948:       '    <button type="button" data-core-action="section-update-clear">一覧へ戻る</button>',
   949:       '  </div>',
   950:       '</section>'
   951:     ].join("");
   952:   }
   953: 
   954:   function renderAicmCompanyUpdateScreen() {
   955:     return renderShell(renderCompanyUpdateForm(aicmOrgSelectedCompany()));
   956:   }
   957: 
   958:   function renderAicmDepartmentUpdateScreen() {
   959:     var company = aicmOrgSelectedCompany();
   960:     var selectedId = state.editingDepartmentId || "";
   961:     var selected = selectedId ? aicmOrgDepartmentById(selectedId) : null;
   962:     var rows = company ? aicmOrgDepartmentsForCompany(company.aicm_user_company_id) : [];
   963:     return renderShell(selected ? renderDepartmentUpdateForm(selected) : renderDepartmentUpdatePicker(company, rows));
   964:   }
   965: 
   966:   function renderAicmSectionUpdateScreen() {
   967:     var company = aicmOrgSelectedCompany();
   968:     var selectedId = state.editingSectionId || "";
   969:     var selected = selectedId ? aicmOrgSectionById(selectedId) : null;
   970:     var rows = company ? aicmOrgSectionsForCompany(company.aicm_user_company_id) : [];
   971:     return renderShell(selected ? renderSectionUpdateForm(selected) : renderSectionUpdatePicker(company, rows));
   972:   }
   973: 
============================================================
PATTERN=renderShell(
LINE=963
------------------------------------------------------------
   955:     return renderShell(renderCompanyUpdateForm(aicmOrgSelectedCompany()));
   956:   }
   957: 
   958:   function renderAicmDepartmentUpdateScreen() {
   959:     var company = aicmOrgSelectedCompany();
   960:     var selectedId = state.editingDepartmentId || "";
   961:     var selected = selectedId ? aicmOrgDepartmentById(selectedId) : null;
   962:     var rows = company ? aicmOrgDepartmentsForCompany(company.aicm_user_company_id) : [];
   963:     return renderShell(selected ? renderDepartmentUpdateForm(selected) : renderDepartmentUpdatePicker(company, rows));
   964:   }
   965: 
   966:   function renderAicmSectionUpdateScreen() {
   967:     var company = aicmOrgSelectedCompany();
   968:     var selectedId = state.editingSectionId || "";
   969:     var selected = selectedId ? aicmOrgSectionById(selectedId) : null;
   970:     var rows = company ? aicmOrgSectionsForCompany(company.aicm_user_company_id) : [];
   971:     return renderShell(selected ? renderSectionUpdateForm(selected) : renderSectionUpdatePicker(company, rows));
   972:   }
   973: 
   974: // AICM_DB_WRITE_CONFIRMATION_REQUIRED_ARY_ASB_V1
   975: // DB write operations must pass through a visible confirmation screen before POST.
   976: 
   977: function aicmOrgUpdateLabel(kind) {
   978:     if (kind === "company") return "企業変更";
   979:     if (kind === "department") return "部門変更";
   980:     if (kind === "section") return "課変更";
   981:     return "変更";
============================================================
PATTERN=renderShell(
LINE=971

---- classification ----
FINAL_STATIC_JUDGEMENT=FIX_RENDER_SHELL_EXCLUDE_WORKER_UI_FOR_SECTION_NEW

Patch policy:
- If renderShell itself injects worker UI, add screen-aware guard to renderShell, not HTML post-replacement.
- If a global injection/wrapper appends worker UI, add if state.screen === 'section-new' return baseHtml.
- If route target is wrong, fix action target only.
- Do not wrap renderSectionNew.
- Do not string-replace rendered HTML.

============================================================
6. final
============================================================
FINAL_JUDGEMENT=FIX_RENDER_SHELL_EXCLUDE_WORKER_UI_FOR_SECTION_NEW
ROOT_HTTP=200
SERVED_HTTP=200
RENDER_SHELL_FOUND=true
RENDER_SHELL_LINE=545
RENDER_SHELL_HAS_WORKER_TEXT=true
RENDER_SHELL_CALL_COUNT=3
RENDER_FUNC_FOUND=true
RENDER_FUNC_HAS_SECTION_NEW=true
RENDER_FUNC_HAS_WORKER_TEXT=true
WORKER_LITERAL_COUNT=6
RENDER_SHELL_WORKER_CALL_COUNT=1
GLOBAL_INJECTION_HIT_COUNT=72
SECTION_NEW_ROUTE_CALLS_RENDER_SECTION_NEW=false
RENDER_SHELL_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2c_section_new_shell_injection_isolate_20260503_220626/extract/020_renderShell_extract.txt
RENDER_MAIN_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2c_section_new_shell_injection_isolate_20260503_220626/extract/030_render_function_extract.txt
WORKER_LITERAL_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2c_section_new_shell_injection_isolate_20260503_220626/extract/040_worker_literal_scan.txt
SECTION_NEW_ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2c_section_new_shell_injection_isolate_20260503_220626/extract/050_section_new_route_scan.txt
SHELL_CALL_GRAPH=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2c_section_new_shell_injection_isolate_20260503_220626/extract/060_renderShell_call_graph.tsv
GLOBAL_INJECTION_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2c_section_new_shell_injection_isolate_20260503_220626/extract/070_global_injection_scan.txt
CLICK_ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2c_section_new_shell_injection_isolate_20260503_220626/extract/080_section_new_click_route_scan.txt
CLASSIFY_TXT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2c_section_new_shell_injection_isolate_20260503_220626/extract/090_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2c_section_new_shell_injection_isolate_20260503_220626/000_R8Z_V10F2C_SECTION_NEW_SHELL_INJECTION_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT_PATCH_POLICY:
- FIX_RENDER_SHELL_EXCLUDE_WORKER_UI_FOR_SECTION_NEW:
  renderShellにscreen-aware guardを追加し、section-newではworker UIを出さない。

- FIX_GLOBAL_INJECTION_SKIP_SECTION_NEW:
  global injection/wrapperに state.screen === "section-new" のskip条件を追加する。

- FIX_SECTION_NEW_ROUTE_TARGET:
  課新規追加ボタンの遷移先/actionだけを修正する。

- WORKER_UI_SOURCE_OUTSIDE_SECTION_NEW_NEED_LITERAL_FUNCTION_TARGET:
  worker literal scanから対象関数を固定して、mode/screen guardを入れる。

保守性ルール:
- HTML後置換禁止
- renderSectionNew wrap禁止
- selectedSectionId退避復元禁止
- 原因関数にscreen/mode guardを入れる
