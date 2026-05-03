
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- DB/view/context API にはレビュー待ち2件が存在する想定
- 画面では R8Z-V7 marker は出るが rows=0 / hydrating=YES
- 原因候補は review_wait_items が描画stateへ投入されていないこと

今回の作業:
- 現在core/server/served core/context API/state投入経路をREAD ONLYで確認
- V8未適用か、V8適用済みだが効いていないかを切り分ける

禁止:
- DB write
- API POST
- core/server patch
- /tmp 使用

============================================================
1. ENV / TARGET
============================================================
PHASE=R8Z-V8/V9 review-list context hydration root cause check fixed
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8_v9_review_list_hydration_root_cause_fixed_20260503_071700
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS: core file exists
PASS: server file exists

============================================================
2. node --check
============================================================
PASS: node --check core PASS
PASS: node --check server PASS

============================================================
3. AICM server reachability
============================================================
GET / => HTTP 200
PASS: AICM server reachable

============================================================
4. served core vs disk core
============================================================
GET /assets/js/aicm-production-core.js => HTTP 200
PASS: served core fetched
disk_sha=95f3c3a42facd79574d98de816e8ed69a64e98ed03d15c7a5c56fa641f5d01cf
served_sha=95f3c3a42facd79574d98de816e8ed69a64e98ed03d15c7a5c56fa641f5d01cf
PASS: served core matches disk core

============================================================
5. marker scan
============================================================
disk_v7_marker_count=5
disk_v8_marker_count=0
PASS: V7 marker exists in disk core
PASS: V8/pre-hydration marker not found; likely V8 not applied yet
served_v7_marker_count=5
served_v8_marker_count=0

============================================================
6. review-list route / renderer call scan
============================================================
---- grep: review-list ----
554:      '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
6712:    '<section class="aicm-core-card aicm-review-list-card">',
6732:  html.push('<section class="aicm-core-card aicm-review-list-items">');
7606:    } else if (state.screen === "review-list") {
9283:        if (state.screen === "review-list") {
9306:      '<section class="aicm-core-card aicm-review-list-stable-r8z-v5d">',
9538:        if (appState.screen === "review-list") rerender();
9566:      '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',

---- grep: renderReviewListPlaceholder ----
6655:function renderReviewListPlaceholder() {
7607:      html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL
9298:  window.renderReviewListPlaceholder = function renderReviewListPlaceholderR8zV5d() {

---- grep: aicmR8zV7RenderReviewList ----
7607:      html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL
9551:  window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {

---- grep: review_wait_items ----
6479:    var rows = ctx.review_wait_items || state.review_wait_items || [];
6661:  if (ctx && Array.isArray(ctx.review_wait_items)) {
6662:    rows = ctx.review_wait_items;
6663:  } else if (state && Array.isArray(state.review_wait_items)) {
6664:    rows = state.review_wait_items;
9138:    if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
9140:    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
9142:    else if (Array.isArray(state.review_wait_items)) rows = state.review_wait_items;
9144:    ctx.review_wait_items = rows;
9146:    state.review_wait_items = rows;
9159:      ctx.review_wait_items,
9160:      state.review_wait_items,
9162:      ctx.human_review_wait_items,
9419:    if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
9421:    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
9423:    else if (Array.isArray(appState.review_wait_items)) rows = appState.review_wait_items;
9425:    ctx.review_wait_items = rows;
9427:    appState.review_wait_items = rows;
9444:      c.review_wait_items,
9445:      appState.review_wait_items,
9447:      c.human_review_wait_items,

---- grep: context hydrate/fetch candidates ----
37:    context: "/api/aicm/v2/context",
112:    return API.context + "?owner_civilization_id=" + encodeURIComponent(state.ownerCivilizationId);
256:  function loadContext() {
273:        writeStorage(STORAGE.contextCache, JSON.stringify(state.context));
291:    var current = state && state.context && typeof state.context === "object" ? state.context : {};
383:  if (typeof loadContext === "function" && !loadContext.__aicmR8ZF) {
384:    var aicmLoadContextBeforeR8ZF = loadContext;
386:    loadContext = async function loadContext() {
390:        aicmNormalizePmlwContextR8ZF(state.context, state.context);
396:    loadContext.__aicmR8ZF = true;
412:      return loadContext();
432:      return loadContext();
457:      return loadContext();
479:      return loadContext();
513:    if (typeof loadContext !== "function") {
522:        return loadContext();
674:    return state.context || state || {};
680:    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
780:  async function aicmOrgReloadContext() {
781:    if (typeof aicmPmlwReloadContext === "function") {
791:    if (typeof loadContext === "function") {
792:      await loadContext();
797:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
1058:      await aicmOrgReloadContext();
1700:    var ctx = typeof aicmCtxSafe === "function" ? aicmCtxSafe() : (state.context || state || {});
1757:      candidates.push(state.context && state.context.robot_catalog);
2056:    var companies = state && state.context && Array.isArray(state.context.companies) ? state.context.companies : [];
2139:    var ctx = state && state.context ? state.context : {};
2490:    if (typeof state !== "undefined" && state && state.context) return state.context;
2805:    var ctx = typeof aicmOrgCtx === "function" ? aicmOrgCtx() : (state.context || state || {});
3024:    if (state.context && Array.isArray(state.context.taskLedger)) {
3026:    } else if (state.context && Array.isArray(state.context.task_ledger)) {
3215:      if (typeof loadContext === "function") {
3216:        await loadContext();
3464:    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
3491:  async function aicmPmlwReloadContext() {
3492:    if (typeof loadContext === "function") {
3493:      await loadContext();
3503:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
3867:    if (typeof loadContext === "function") {
3868:      await loadContext();
3891:    var ctx = state && state.context ? state.context : {};
3992:    if (state && state.context && state.context.owner_civilization_id) return aicmAxuR1Text(state.context.owner_civilization_id);
4007:    var rows = state && state.context && Array.isArray(state.context.pmlw_major_items)
4050:    var rows = state && state.context && Array.isArray(state.context.placements)
4176:    var rows = state && state.context && Array.isArray(state.context.pmlw_major_items)
4367:    var ctx = state && state.context ? state.context : {};
4521:    if (state && state.context && state.context.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.context.owner_civilization_id);
4522:    if (state && state.context && state.context.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.context.ownerCivilizationId);
4566:    var ctx = state && state.context ? state.context : {};
5111:    if (typeof loadContext === "function") {
5112:      await loadContext();
5132:    var target = state && state.context && typeof state.context === "object" ? state.context : {};
5204:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner) + "&v=" + Date.now());
5232:    var ctx = state && state.context ? state.context : {};
5383:    var ctx = state && state.context ? state.context : {};
5646:    var ctx = state && state.context ? state.context : {};
5787:    if (state && state.context && state.context.owner_civilization_id) return aicmR8ZBText(state.context.owner_civilization_id);
5807:    if (state && state.context && state.context.selectedCompanyId) return aicmR8ZBText(state.context.selectedCompanyId);
5808:    if (state && state.context && state.context.aicm_user_company_id) return aicmR8ZBText(state.context.aicm_user_company_id);
6000:    var ctx = state && state.context && typeof state.context === "object" ? state.context : {};
6243:    var ctx = state && state.context ? state.context : {};
6473:    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
6478:    var ctx = state.context || state || {};
6513:    if (typeof aicmPmlwReloadContext === "function") {
6518:    if (typeof loadContext === "function") {
6519:      await loadContext();
6524:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
6658:  var ctx = state && state.context ? state.context : {};
6941:    return state && state.context && Array.isArray(state.context.companies) ? state.context.companies : [];
6976:    var ctx = state && state.context ? state.context : {};
7835:      if (typeof aicmPmlwReloadContext === "function") {
7837:      } else if (typeof loadContext === "function") {
7838:        await loadContext();
7992:      if (typeof aicmPmlwReloadContext === "function") {
7994:      } else if (typeof loadContext === "function") {
7995:        await loadContext();
8119:      if (typeof aicmPmlwReloadContext === "function") {
8121:      } else if (typeof loadContext === "function") {
8122:        await loadContext();
8482:      loadContext();
8599:    return state && state.context && typeof state.context === "object" ? state.context : {};
9073:    loadContext();
9124:    if (!state.context || typeof state.context !== "object") {
9261:    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
9496:  function hydrateIfNeeded(appState) {
9516:    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
9555:    if (!list.length) hydrateIfNeeded(appState);
core_route_direct_local_call_count=0
core_v7_call_count=1
core_review_wait_items_ref_count=21
core_context_route_ref_count=7
PASS: review-list route appears to call V7 renderer bridge
PASS: core references review_wait_items

============================================================
7. context API probe
============================================================
GET http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa => HTTP 500
GET http://127.0.0.1:8794/api/aicm/v2/context?ownerId=00000000-0000-4000-8000-000000000001&companyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa => HTTP 500
GET http://127.0.0.1:8794/api/aicm/v2/context?owner=00000000-0000-4000-8000-000000000001&company=8b9be487-7b74-4517-9b59-6c84a82ae6aa => HTTP 500
WARN: context API did not return HTTP 200 for tried URL patterns
WARN: context JSON missing; skip parse

============================================================
8. DECISION
============================================================
Decision branches:
A. V8 marker absent + context API has 2:
   NEXT=R8Z-V8 pre-hydration route fix

B. V8 marker present + context API has 2 + rows still 0:
   NEXT=V8 await/state merge line inspection

C. context API returns 0 or fails:
   NEXT=context param/shape/server route check

D. served core differs from disk core:
   NEXT=static asset/cache/server serving check

============================================================
9. FINAL JUDGEMENT
============================================================
PASS_COUNT=11
WARN_COUNT=2
FAIL_COUNT=0
FINAL_JUDGEMENT=CONTEXT_API_OR_RESPONSE_SHAPE_CHECK_REQUIRED
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8_v9_review_list_hydration_root_cause_fixed_20260503_071700/000_R8Z_V8_V9_REVIEW_LIST_HYDRATION_ROOT_CAUSE_REPORT.md
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8_v9_review_list_hydration_root_cause_fixed_20260503_071700/010_core_review_route_snippets.txt
CTX_JSON=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8_v9_review_list_hydration_root_cause_fixed_20260503_071700/020_context_response.json
CTX_PARSE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8_v9_review_list_hydration_root_cause_fixed_20260503_071700/021_context_parse.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO
