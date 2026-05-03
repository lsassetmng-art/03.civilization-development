
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- R8Z-V7 route bridgeは効いている
- 画面は rows=0 / hydrating=YES
- 直前確認では FINAL_JUDGEMENT=CONTEXT_API_OR_RESPONSE_SHAPE_CHECK_REQUIRED
- つまり、context APIが200でも、param名/response shape/key名/merge先のどこかがズレている疑い

今回の作業:
1. server側 context route のquery名とresponse shapeを読む
2. core側 context fetch / state merge / review-list renderer の参照keyを読む
3. context APIを複数param名でGETし、どのURL/shapeにレビュー2件が出るか確認
4. DB側にreview候補relationが存在するかREAD ONLYで確認
5. 次が「server context修正」か「core state merge修正」かを判定

禁止:
- DB write
- API POST
- core/server patch
- window override追加
- render関数丸ごと置換

============================================================
1. ENV / TARGET
============================================================
PHASE=R8Z-V8A context API response shape isolate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8a_context_shape_isolate_20260503_071948
DB_READ=YES
DB_WRITE=NO
API_GET=YES
API_POST=NO
PATCH=NO
REVIEW=佐藤(DB担当): READ ONLY確認のみ
PASS: core exists
PASS: server exists

============================================================
2. syntax check
============================================================
PASS: node --check core PASS
PASS: node --check server PASS

============================================================
3. server/core snippet scan
============================================================
---- SERVER: context route / review keys ----
239:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
246:    "    owner_civilization_id, aicm_user_company_id, source_route_code, policy_title, policy_text,",
252:    "    " + sqlLiteral(companyId) + "::uuid,",
283:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
289:    "    owner_civilization_id, aicm_user_company_id, aicm_president_policy_id,",
297:    "    " + sqlLiteral(companyId) + "::uuid,",
397:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
408:    ", " + sqlLiteral(companyId) + "::uuid",
421:    "WITH input_rows(row_order, owner_civilization_id, aicm_user_company_id, department_name, section_name, major_item_name, major_item_description, assigned_leader_label, priority_code, due_date, note) AS (",
429:    "      AND d.aicm_user_company_id = i.aicm_user_company_id",
441:    "      AND s.aicm_user_company_id = r.aicm_user_company_id",
451:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
455:    "  SELECT owner_civilization_id, aicm_user_company_id, department_id, section_id,",
498:  const text = String(value || "delivery_summary").trim();
500:    "design_delivery_summary",
501:    "implementation_delivery_summary",
503:    "final_delivery_summary",
504:    "delivery_summary"
505:  ].includes(text) ? text : "delivery_summary";
510:  return ["design_doc", "implementation", "exception", "delivery_package", "handoff"].includes(text) ? text : "design_doc";
520:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
525:    "  INSERT INTO business.aicm_human_review_item (",
526:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
530:    "    delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link,",
531:    "    responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date,",
535:    "    " + sqlLiteral(companyId) + "::uuid,",
546:    "    " + aicmHumanReviewTextSql(body.delivery_summary_text) + ",",
564:    "  'human_review_item', to_jsonb(inserted)",
574:  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
578:    "  UPDATE business.aicm_human_review_item",
579:    "  SET human_review_status_code = 'approved',",
580:    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
581:    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
584:    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
591:    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
600:  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
604:    "  UPDATE business.aicm_human_review_item",
605:    "  SET human_review_status_code = 'returned',",
606:    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
607:    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
610:    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
617:    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
646:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
657:    "  WHERE aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
796:    "  'review_wait_items', (",
798:    "    FROM business.vw_aicm_human_review_wait_display r",
842:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
848:    "  SELECT aicm_user_company_id",
851:    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
856:    "    owner_civilization_id, aicm_user_company_id, department_name, purpose, department_status",
860:    "    aicm_user_company_id,",
888:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
895:    "  SELECT aicm_user_company_id, aicm_user_company_department_id",
898:    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
904:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, section_name, purpose, section_status",
908:    "    aicm_user_company_id,",
938:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
956:    "  SELECT d.aicm_user_company_id, d.aicm_user_company_department_id",
959:    "    ON c.aicm_user_company_id = d.aicm_user_company_id",
961:    "    AND d.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
968:    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
975:    "    aicm_user_company_id,",
1016:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1034:    "  SELECT aicm_user_company_id",
1037:    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1042:    "    owner_civilization_id, aicm_user_company_id,",
1049:    "    aicm_user_company_id,",
1134:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1142:      (row.target_level_code === "company" ? companyId : "") ||
1212:    "    owner_civilization_id, aicm_user_company_id,",
1220:    "    c.aicm_user_company_id,",
1245:    "  SELECT aicm_user_company_id",
1248:    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1261:    "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1388:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1396:    "    p.aicm_user_company_id,",
1412:    "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1653:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1674:    "    " + sqlLiteral(companyId) + "::uuid AS aicm_user_company_id,",
1683:    "   AND r.aicm_user_company_id = m.aicm_user_company_id",
1692:    "        AND existing.aicm_user_company_id = m.aicm_user_company_id",
1705:    "   AND p.aicm_user_company_id = tm.aicm_user_company_id",
1719:    "    owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id,",
1726:    "    tm.owner_civilization_id, tm.aicm_user_company_id, tm.aicm_manager_major_work_item_id,",
1743:    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id,",
1749:    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id,",
1765:    "    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, aicm_leader_deliverable_requirement_id,",
1772:    "    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id,",
1807:    "  JOIN input_request r ON r.owner_civilization_id = m.owner_civilization_id AND r.aicm_user_company_id = m.aicm_user_company_id",
1863:  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1881:    "    AND w.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
1894:    "    p.aicm_user_company_id,",
1909:    "   AND p.aicm_user_company_id = u.aicm_user_company_id",
1959:    aicm_user_company_id: aicmR8ZIText(unit.aicm_user_company_id),
2165:if (route === "/api/aicm/v2/context" && req.method === "GET") {
---- CORE: review-list / context / state merge candidates ----
28:    selectedCompanyId: "AICM_V2_SELECTED_COMPANY_ID",
37:    context: "/api/aicm/v2/context",
53:    selectedCompanyId: readStorage(STORAGE.selectedCompanyId) || "",
148:  function getCompany(companyId) {
150:      return company.aicm_user_company_id === companyId;
166:  function companyDepartments(companyId) {
168:      return department.aicm_user_company_id === companyId;
178:  function companyPlacements(companyId) {
180:      return placement.aicm_user_company_id === companyId;
185:    return getCompany(state.selectedCompanyId);
196:  function hasCompany(companyId) {
197:    return !!getCompany(companyId);
204:  function setSelectedCompany(companyId) {
205:    if (hasCompany(companyId)) {
206:      state.selectedCompanyId = companyId;
207:      writeStorage(STORAGE.selectedCompanyId, companyId);
209:      var departments = companyDepartments(companyId);
215:      state.selectedCompanyId = "";
218:      writeStorage(STORAGE.selectedCompanyId, "");
243:    if (hasCompany(state.selectedCompanyId)) {
244:      setSelectedCompany(state.selectedCompanyId);
249:      setSelectedCompany(state.context.companies[0].aicm_user_company_id);
256:  function loadContext() {
383:  if (typeof loadContext === "function" && !loadContext.__aicmR8ZF) {
384:    var aicmLoadContextBeforeR8ZF = loadContext;
386:    loadContext = async function loadContext() {
396:    loadContext.__aicmR8ZF = true;
407:      if (json.company && json.company.aicm_user_company_id) {
408:        state.selectedCompanyId = json.company.aicm_user_company_id;
409:        writeStorage(STORAGE.selectedCompanyId, state.selectedCompanyId);
412:      return loadContext();
417:    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
423:      aicm_user_company_id: state.selectedCompanyId,
432:      return loadContext();
437:    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
447:      aicm_user_company_id: state.selectedCompanyId,
457:      return loadContext();
462:    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
468:      aicm_user_company_id: state.selectedCompanyId,
479:      return loadContext();
513:    if (typeof loadContext !== "function") {
522:        return loadContext();
554:      '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
590:      '<select data-core-field="selectedCompanyId">',
592:        var selected = company.aicm_user_company_id === state.selectedCompanyId ? " selected" : "";
593:        return '<option value="' + escapeHtml(company.aicm_user_company_id) + '"' + selected + '>' + escapeHtml(company.company_name) + '</option>';
600:    var departments = companyDepartments(state.selectedCompanyId);
621:    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
625:    var placements = company ? companyPlacements(company.aicm_user_company_id) : [];
713:      return row.aicm_user_company_id === id;
729:  function aicmOrgDepartmentsForCompany(companyId) {
731:      return !companyId || row.aicm_user_company_id === companyId;
735:  function aicmOrgSectionsForCompany(companyId) {
737:      return !companyId || row.aicm_user_company_id === companyId;
780:  async function aicmOrgReloadContext() {
781:    if (typeof aicmPmlwReloadContext === "function") {
791:    if (typeof loadContext === "function") {
792:      await loadContext();
797:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
828:      '  <input type="hidden" id="aicm-company-edit-id" value="' + escapeHtml(company.aicm_user_company_id || '') + '">',
962:    var rows = company ? aicmOrgDepartmentsForCompany(company.aicm_user_company_id) : [];
970:    var rows = company ? aicmOrgSectionsForCompany(company.aicm_user_company_id) : [];
988:        key !== "aicm_user_company_id" &&
1058:      await aicmOrgReloadContext();
1177:    target_id: company.aicm_user_company_id,
1263:  var companyId = body.aicm_user_company_id || "";
1265:  if (!companyId && state && state.selectedCompanyId) {
1266:    companyId = state.selectedCompanyId;
1276:    aicm_user_company_id: companyId,
1283:    var companyId = aicmAvdTextById("aicm-company-edit-id");
1285:    if (!companyId) {
1292:      aicm_user_company_id: companyId,
1312:        aicm_user_company_id: body.aicm_user_company_id
1321:    var companyId = aicmAvdTextById("aicm-department-edit-company-id");
1323:    if (!departmentId || !companyId) {
1330:      aicm_user_company_id: companyId,
1360:    var companyId = aicmAvdTextById("aicm-section-edit-company-id");
1363:    if (!sectionId || !companyId || !departmentId) {
1370:      aicm_user_company_id: companyId,
1533:      selectedIds.push(state.selectedCompanyId);
1534:      selectedIds.push(state.selected_company_id);
1536:      selectedIds.push(state.companyId);
1537:      selectedIds.push(state.aicm_user_company_id);
1545:        return row.aicm_user_company_id === id;
1556:      var cid = company.aicm_user_company_id || "";
1557:      state.selectedCompanyId = cid;
1558:      state.selected_company_id = cid;
1565:function aicmDepartmentsForCompanySafe(companyId) {
1566:    if (!companyId) return [];
1570:        var viaHelper = aicmOrgDepartmentsForCompany(companyId);
1577:      return row.aicm_user_company_id === companyId;
1581:function aicmSectionsForCompanySafe(companyId) {
1582:    if (!companyId) return [];
1586:        var viaHelper = aicmOrgSectionsForCompany(companyId);
1593:      return row.aicm_user_company_id === companyId;
1684:    if (scope.companyId && row.aicm_user_company_id && row.aicm_user_company_id !== scope.companyId) return false;
2057:    if (state && state.selectedCompanyId) {
2059:        if (companies[i] && companies[i].aicm_user_company_id === state.selectedCompanyId) return companies[i];
2068:    return company ? aicmAxnText(company.aicm_user_company_id) : "";
2115:    var companyId = aicmAxnCompanyId();
2119:    if (companyId && row.aicm_user_company_id && aicmAxnText(row.aicm_user_company_id) !== companyId) return false;
2122:      return aicmAxnLower(row.target_level_code) === "company" || aicmAxnText(row.target_id) === companyId;
2445:    else if (scope && scope.companyId) prefix = roleCode + "-company";
2516:    if (selected && selected.aicm_user_company_id) return selected;
2525:function aicmAvdCurrentDepartment(companyId) {
2528:    var id = companyId || (aicmAvdCurrentCompany() || {}).aicm_user_company_id;
2531:      if (rows[i] && rows[i].aicm_user_company_id === id) return rows[i];
2537:function aicmAvdCurrentSection(companyId, departmentId) {
2540:    var cid = companyId || (aicmAvdCurrentCompany() || {}).aicm_user_company_id;
2545:      if (rows[i].aicm_user_company_id === cid && rows[i].aicm_user_company_department_id === did) return rows[i];
2549:      if (rows[j] && rows[j].aicm_user_company_id === cid) return rows[j];
2751:      '  <input id="aicm-company-edit-id" type="hidden" value="' + escapeHtml(company.aicm_user_company_id || "") + '">',
2802:    var companyId = company.aicm_user_company_id || "";
2803:    var departments = typeof aicmOrgDepartmentsForCompany === "function" ? aicmOrgDepartmentsForCompany(companyId) : [];
2804:    var sections = typeof aicmOrgSectionsForCompany === "function" ? aicmOrgSectionsForCompany(companyId) : [];
2807:      return row.aicm_user_company_id === companyId;
2961:    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
3021:function taskLedgerRows(companyId) {
3030:    if (!companyId) return rows;
3033:      return String(row.aicm_user_company_id || "") === String(companyId || "");
3044:    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
3188:      aicm_user_company_id: company.aicm_user_company_id,
3215:      if (typeof loadContext === "function") {
3216:        await loadContext();
3367:    var departments = companyDepartments(company.aicm_user_company_id);
3435:          aicm_user_company_id: company.aicm_user_company_id,
3491:  async function aicmPmlwReloadContext() {
3492:    if (typeof loadContext === "function") {
3493:      await loadContext();
3503:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
3682:        aicm_user_company_id: company.aicm_user_company_id,
3867:    if (typeof loadContext === "function") {
3868:      await loadContext();
3889:function pmlwMajorRowsForCompany(companyId) {
3892:    var targetCompanyId = String(companyId || "");
3901:          row.aicm_user_company_id ||
3902:          row.company_id ||
3903:          row.user_company_id ||
3904:          row.companyId ||
4049:function aicmAxuR1LeaderPlacementsForCompany(companyId) {
4054:    var cid = aicmAxuR1Text(companyId);
4057:      return aicmAxuR1Text(row.aicm_user_company_id) === cid && aicmAxuR1IsActiveLeaderPlacement(row);
4064:    var companyId = aicmAxuR1Text(row.aicm_user_company_id || state.selectedCompanyId);
4067:    var leaders = aicmAxuR1LeaderPlacementsForCompany(companyId);
4300:      list = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];
4365:function aicmGetManagerMajorRowsForSelectedCompany(companyId) {
4368:    var selectedId = String(companyId || "");
4370:    if (!selectedId && state && state.selectedCompanyId) {
4371:      selectedId = String(state.selectedCompanyId || "");
4376:      if (company && company.aicm_user_company_id) {
4377:        selectedId = String(company.aicm_user_company_id || "");
4388:          row.aicm_user_company_id ||
4389:          row.company_id ||
4390:          row.user_company_id ||
4391:          row.companyId ||
5111:    if (typeof loadContext === "function") {
5112:      await loadContext();
5204:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner) + "&v=" + Date.now());
5259:    if (state && state.selectedCompanyId) return aicmLeaderInboxTextR8T(state.selectedCompanyId);
5262:      if (company && company.aicm_user_company_id) return aicmLeaderInboxTextR8T(company.aicm_user_company_id);
5272:    var companyId = aicmLeaderInboxSelectedCompanyIdR8T();
5273:    var rowCompanyId = aicmLeaderInboxTextR8T(row.aicm_user_company_id);
5275:    if (companyId && rowCompanyId && companyId !== rowCompanyId) return false;
5374:    if (state && state.selectedCompanyId) return aicmSummaryTextR8U(state.selectedCompanyId);
5377:      if (company && company.aicm_user_company_id) return aicmSummaryTextR8U(company.aicm_user_company_id);
5386:    var selectedCompanyId = aicmSummarySelectedCompanyIdR8U();
5394:        var rowCompanyId = aicmSummaryTextR8U(row.aicm_user_company_id);
5395:        if (selectedCompanyId && rowCompanyId && selectedCompanyId !== rowCompanyId) continue;
5637:    if (state && state.selectedCompanyId) return aicmLeaderAutoTextR8W(state.selectedCompanyId);
5640:      if (company && company.aicm_user_company_id) return aicmLeaderAutoTextR8W(company.aicm_user_company_id);
5649:    var selectedCompanyId = aicmLeaderAutoSelectedCompanyIdR8W();
5657:        var rowCompanyId = aicmLeaderAutoTextR8W(row.aicm_user_company_id);
5658:        if (selectedCompanyId && rowCompanyId && selectedCompanyId !== rowCompanyId) continue;
5798:    if (state && state.selectedCompanyId) return aicmR8ZBText(state.selectedCompanyId);
5803:        if (company && company.aicm_user_company_id) return aicmR8ZBText(company.aicm_user_company_id);
5807:    if (state && state.context && state.context.selectedCompanyId) return aicmR8ZBText(state.context.selectedCompanyId);
5808:    if (state && state.context && state.context.aicm_user_company_id) return aicmR8ZBText(state.context.aicm_user_company_id);
5842:    var companyId = aicmR8ZBCompanyId();
5843:    var ownerId = aicmR8ZBOwnerId();
5852:    if (!companyId) {
5866:          owner_civilization_id: ownerId,
5867:          aicm_user_company_id: companyId,
5910:      aicm_user_company_id: state && state.selectedCompanyId ? state.selectedCompanyId : "",
5955:    var companyId = company && company.aicm_user_company_id ? company.aicm_user_company_id : "";
5956:    var rows = aicmGetManagerMajorRowsForSelectedCompany(companyId);
6013:    if (state && state.selectedCompanyId) return aicmR8ZCText(state.selectedCompanyId);
6018:        if (company && company.aicm_user_company_id) return aicmR8ZCText(company.aicm_user_company_id);
6026:    var companyId = aicmR8ZCSelectedCompanyId();
6029:    if (!companyId) return source;
6032:      return aicmR8ZCText(row && row.aicm_user_company_id) === companyId;
6479:    var rows = ctx.review_wait_items || state.review_wait_items || [];
6483:  function aicmHumanReviewRowsForCompany(companyId) {
6485:      return !companyId || row.aicm_user_company_id === companyId;
6513:    if (typeof aicmPmlwReloadContext === "function") {
6518:    if (typeof loadContext === "function") {
6519:      await loadContext();
6524:    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
6551:        aicm_human_review_item_id: reviewId,
6552:        human_reviewer_label: "user",
6553:        human_review_note: ""
6582:        aicm_human_review_item_id: reviewId,
6583:        human_reviewer_label: "user",
6584:        human_review_note: note
6606:      var id = row.aicm_human_review_item_id || "";
6610:      var status = row.human_review_status_label || row.human_review_status_code || "承認待ち";
6655:function renderReviewListPlaceholder() {
6661:  if (ctx && Array.isArray(ctx.review_wait_items)) {
6662:    rows = ctx.review_wait_items;
6663:  } else if (state && Array.isArray(state.review_wait_items)) {
6664:    rows = state.review_wait_items;
6665:  } else if (ctx && Array.isArray(ctx.human_review_items)) {
6666:    rows = ctx.human_review_items;
6690:        var id = r8zV4bText(c.aicm_user_company_id || c.company_id || c.id);
6691:        if (id && id === r8zV4bText(state && state.selectedCompanyId)) {
6712:    '<section class="aicm-core-card aicm-review-list-card">',
6732:  html.push('<section class="aicm-core-card aicm-review-list-items">');
6737:    var id = r8zV4bText(row.aicm_human_review_item_id || row.review_id || row.id);
6741:    var status = r8zV4bText(row.human_review_status_label || row.human_review_status_code, "pending");
6792:    var department = aicmAvdCurrentDepartment(company && company.aicm_user_company_id);
6821:      '  <input id="aicm-department-edit-company-id" type="hidden" value="' + escapeHtml(company.aicm_user_company_id || "") + '">',
6854:    var department = aicmAvdCurrentDepartment(company && company.aicm_user_company_id);
6855:    var section = aicmAvdCurrentSection(company && company.aicm_user_company_id, department && department.aicm_user_company_department_id);
6885:      '  <input id="aicm-section-edit-company-id" type="hidden" value="' + escapeHtml(company.aicm_user_company_id || "") + '">',
6961:    if (state && state.selectedCompanyId) {
6963:        if (rows[i] && rows[i].aicm_user_company_id === state.selectedCompanyId) return rows[i];
6972:    return company ? aicmWrtText(company.aicm_user_company_id) : "";
6978:    var companyId = aicmWrtCompanyId();
6985:      if (companyId && row.aicm_user_company_id && aicmWrtText(row.aicm_user_company_id) !== companyId) return false;
7388:        aicm_user_company_id: aicmWrtText(company.aicm_user_company_id),
7606:    } else if (state.screen === "review-list") {
7607:      html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL
7684:      var targetId = state.selectedCompanyId;
7786:    if (!company || !company.aicm_user_company_id) {
7811:        aicm_user_company_id: company.aicm_user_company_id,
7835:      if (typeof aicmPmlwReloadContext === "function") {
7837:      } else if (typeof loadContext === "function") {
7838:        await loadContext();
7942:    if (!company || !company.aicm_user_company_id) {
7967:        aicm_user_company_id: company.aicm_user_company_id,
7992:      if (typeof aicmPmlwReloadContext === "function") {
7994:      } else if (typeof loadContext === "function") {
7995:        await loadContext();
8060:    if (!company || !company.aicm_user_company_id) {
8093:        aicm_user_company_id: company.aicm_user_company_id,
8119:      if (typeof aicmPmlwReloadContext === "function") {
8121:      } else if (typeof loadContext === "function") {
8122:        await loadContext();
8482:      loadContext();
8909:    if (fieldName === "selectedCompanyId") {
9073:    loadContext();
9138:    if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
9139:    else if (Array.isArray(ctx.reviewWaitItems)) rows = ctx.reviewWaitItems;
9140:    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
9141:    else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
9142:    else if (Array.isArray(state.review_wait_items)) rows = state.review_wait_items;
9144:    ctx.review_wait_items = rows;
9146:    state.review_wait_items = rows;
9149:    if (ctx.aicm_user_company_id) state.selectedCompanyId = ctx.aicm_user_company_id;
9159:      ctx.review_wait_items,
9160:      state.review_wait_items,
9161:      ctx.reviewWaitItems,
9162:      ctx.human_review_wait_items,
9163:      ctx.humanReviewWaitItems
9193:      state.selectedCompanyId ||
9194:      state.aicm_user_company_id ||
9195:      ctx.aicm_user_company_id ||
9196:      ctx.selectedCompanyId ||
9197:      ctx.company_id
9221:      var id = r8zV5dText(row.aicm_user_company_id || row.company_id || row.id);
9258:    params.set("aicm_user_company_id", company);
9261:    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
9283:        if (state.screen === "review-list") {
9290:    var status = r8zV5dFirst(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
9298:  window.renderReviewListPlaceholder = function renderReviewListPlaceholderR8zV5d() {
9306:      '<section class="aicm-core-card aicm-review-list-stable-r8z-v5d">',
9329:      var id = r8zV5dFirst(row, ["aicm_human_review_item_id", "review_id", "id"], "");
9419:    if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
9420:    else if (Array.isArray(ctx.reviewWaitItems)) rows = ctx.reviewWaitItems;
9421:    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
9422:    else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
9423:    else if (Array.isArray(appState.review_wait_items)) rows = appState.review_wait_items;
9425:    ctx.review_wait_items = rows;
9427:    appState.review_wait_items = rows;
9430:    if (ctx.aicm_user_company_id) appState.selectedCompanyId = ctx.aicm_user_company_id;
9444:      c.review_wait_items,
9445:      appState.review_wait_items,
9446:      c.reviewWaitItems,
9447:      c.human_review_wait_items,
9448:      c.humanReviewWaitItems
9461:  function ownerId(appState) {
9467:  function companyId(appState) {
9470:    return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id);
9476:    var cid = companyId(appState);
9484:      var id = t(row.aicm_user_company_id || row.company_id || row.id);
9496:  function hydrateIfNeeded(appState) {
9501:    var owner = ownerId(appState);
9502:    var company = companyId(appState);
9513:    params.set("aicm_user_company_id", company);
9516:    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
9538:        if (appState.screen === "review-list") rerender();
9543:    var status = first(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
9551:  window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
9555:    if (!list.length) hydrateIfNeeded(appState);
9558:      "selectedCompanyId=" + companyId(appState),
9559:      "owner=" + ownerId(appState),
9566:      '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
9586:      var id = first(row, ["aicm_human_review_item_id", "review_id", "id"], "");
PASS: server references snake_case review_wait_items
PASS: server does not reference camelCase reviewWaitItems
PASS: core references snake_case review_wait_items
WARN: core references camelCase reviewWaitItems

============================================================
4. AICM server reachability
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 2 ms: Could not connect to server
GET / => HTTP 000
WARN: AICM server not reachable; context API probe may fail

============================================================
5. context API multi-param response shape probe
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 0 ms: Could not connect to server

---- context try 1 ----
GET http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP 000
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server

---- context try 2 ----
GET http://127.0.0.1:8794/api/aicm/v2/context?ownerId=00000000-0000-4000-8000-000000000001&companyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP 000
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 2 ms: Could not connect to server

---- context try 3 ----
GET http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&companyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP 000
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server

---- context try 4 ----
GET http://127.0.0.1:8794/api/aicm/v2/context?ownerId=00000000-0000-4000-8000-000000000001&company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP 000
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 0 ms: Could not connect to server

---- context try 5 ----
GET http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&selectedCompanyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP 000
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 0 ms: Could not connect to server

---- context try 6 ----
GET http://127.0.0.1:8794/api/aicm/v2/context?ownerId=00000000-0000-4000-8000-000000000001&selectedCompanyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP 000
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 0 ms: Could not connect to server

---- context try 7 ----
GET http://127.0.0.1:8794/api/aicm/v2/context?owner=00000000-0000-4000-8000-000000000001&company=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP 000
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 0 ms: Could not connect to server

---- context try 8 ----
GET http://127.0.0.1:8794/api/aicm/v2/context?company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP 000
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 0 ms: Could not connect to server

---- context try 9 ----
GET http://127.0.0.1:8794/api/aicm/v2/context?companyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP 000
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 0 ms: Could not connect to server

---- context try 10 ----
GET http://127.0.0.1:8794/api/aicm/v2/context?selectedCompanyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa
HTTP 000

---- context summary ----
url	http	review_wait_items_max	reviewWaitItems_max	human_review_items_max	humanReviewItems_max	raw_contains_nouhin_summary	parse_file
http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa	000	-1	-1	-1	-1	false	-
http://127.0.0.1:8794/api/aicm/v2/context?ownerId=00000000-0000-4000-8000-000000000001&companyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa	000	-1	-1	-1	-1	false	-
http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&companyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa	000	-1	-1	-1	-1	false	-
http://127.0.0.1:8794/api/aicm/v2/context?ownerId=00000000-0000-4000-8000-000000000001&company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa	000	-1	-1	-1	-1	false	-
http://127.0.0.1:8794/api/aicm/v2/context?owner_id=00000000-0000-4000-8000-000000000001&selectedCompanyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa	000	-1	-1	-1	-1	false	-
http://127.0.0.1:8794/api/aicm/v2/context?ownerId=00000000-0000-4000-8000-000000000001&selectedCompanyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa	000	-1	-1	-1	-1	false	-
http://127.0.0.1:8794/api/aicm/v2/context?owner=00000000-0000-4000-8000-000000000001&company=8b9be487-7b74-4517-9b59-6c84a82ae6aa	000	-1	-1	-1	-1	false	-
http://127.0.0.1:8794/api/aicm/v2/context?company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa	000	-1	-1	-1	-1	false	-
http://127.0.0.1:8794/api/aicm/v2/context?companyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa	000	-1	-1	-1	-1	false	-
http://127.0.0.1:8794/api/aicm/v2/context?selectedCompanyId=8b9be487-7b74-4517-9b59-6c84a82ae6aa	000	-1	-1	-1	-1	false	-
BEST_CONTEXT_COUNT=0
BEST_CONTEXT_URL=
BEST_CONTEXT_PARSE=
WARN: no tried context API response exposed review items

============================================================
6. DB read-only relation scan
============================================================
--- review/human/delivery/wait relation candidates ---
 table_schema |                          table_name                           | table_type 
--------------+---------------------------------------------------------------+------------
 aiworker     | leader_mock_review                                            | BASE TABLE
 aiworker     | runtime_delivery_package                                      | BASE TABLE
 aiworker     | runtime_leader_review                                         | BASE TABLE
 aiworker     | runtime_president_approval                                    | BASE TABLE
 aiworker     | runtime_review_gate_log                                       | BASE TABLE
 aiworker     | vw_app_aiworker_runtime_delivery_board_v1                     | VIEW
 aiworker     | vw_app_aiworker_runtime_leader_review_board_v1                | VIEW
 aiworker     | vw_app_aiworker_runtime_president_approval_board_v1           | VIEW
 aiworker     | vw_leader_mock_review_board_v1                                | VIEW
 aiworker     | vw_president_manager_instruction_waiting_v1                   | VIEW
 business     | ai_company_manager_approval                                   | BASE TABLE
 business     | ai_company_manager_delivery                                   | BASE TABLE
 business     | ai_company_manager_review                                     | BASE TABLE
 business     | aicm_human_review_item                                        | BASE TABLE
 business     | aicm_review_action                                            | BASE TABLE
 business     | aicm_review_item                                              | BASE TABLE
 business     | approval_action                                               | BASE TABLE
 business     | approval_flow_definition                                      | BASE TABLE
 business     | approval_flow_step_definition                                 | BASE TABLE
 business     | approval_request                                              | BASE TABLE
 business     | approval_step_instance                                        | BASE TABLE
 business     | vw_aicm_human_review_wait_display                             | VIEW
 cx22073jw    | access_activation_review_decision_batch                       | BASE TABLE
 cx22073jw    | access_activation_review_decision_item                        | BASE TABLE
 cx22073jw    | access_activation_review_export_item                          | BASE TABLE
 cx22073jw    | access_activation_review_export_run                           | BASE TABLE
 cx22073jw    | access_human_review_action_log                                | BASE TABLE
 cx22073jw    | ai_employee_activation_review_decision_batch                  | VIEW
 cx22073jw    | ai_employee_activation_review_decision_item                   | VIEW
 cx22073jw    | ai_employee_activation_review_export_item                     | VIEW
 cx22073jw    | ai_employee_activation_review_export_run                      | VIEW
 cx22073jw    | ai_employee_human_review_action_log                           | VIEW
 cx22073jw    | review_case_area                                              | BASE TABLE
 cx22073jw    | source_review_registry                                        | BASE TABLE
 cx22073jw    | staticart_delivery_closeout_run                               | BASE TABLE
 cx22073jw    | v_access_activation_review_decision_latest_batch_summary      | VIEW
 cx22073jw    | v_access_activation_review_decision_latest_items              | VIEW
 cx22073jw    | v_access_activation_review_export_latest_items                | VIEW
 cx22073jw    | v_access_activation_review_export_latest_summary              | VIEW
 cx22073jw    | v_access_human_review_latest_action_log                       | VIEW
 cx22073jw    | v_ai_employee_activation_review_decision_latest_batch_summary | VIEW
 cx22073jw    | v_ai_employee_activation_review_decision_latest_items         | VIEW
 cx22073jw    | v_ai_employee_activation_review_export_latest_items           | VIEW
 cx22073jw    | v_ai_employee_activation_review_export_latest_summary         | VIEW
 cx22073jw    | v_ai_employee_human_review_latest_action_log                  | VIEW
 cx22073jw    | v_review_case_area_latest                                     | VIEW
 cx22073jw    | v_staticart_delivery_closeout_summary                         | VIEW
 cx22073jw    | v_staticart_delivery_master_status                            | VIEW
 cx22073jw    | vw_aiemp_approval_routing_context                             | VIEW
 cx22073jw    | vw_aiemp_review_package_context                               | VIEW
 cx22073jw    | vw_aiemp_senior_control_approval_request_context              | VIEW
(51 rows)

--- candidate columns ---
 table_schema |                          table_name                           |                                                                                                                                                                                                                                                                                                                                                                                                      columns                                                                                                                                                                                                                                                                                                                                                                                                       
--------------+---------------------------------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 aiworker     | leader_mock_review                                            | review_id, manager_plan_code, leader_task_code, worker_task_code, task_domain_code, review_result_code, review_summary, correction_note, risk_note, review_json, review_status_code, created_at, updated_at
 aiworker     | runtime_delivery_package                                      | delivery_id, request_id, delivery_code, delivery_status_code, delivery_result_code, delivery_title_ja, delivery_summary_ja, delivery_payload_jsonb, human_go_confirmed_flag, external_execution_performed_flag, pg_apply_performed_flag, destructive_action_performed_flag, created_at, updated_at
 aiworker     | runtime_leader_review                                         | leader_review_id, request_id, output_id, review_code, review_result_code, review_status_code, reviewer_role_layer_code, review_summary_ja, review_detail_jsonb, return_for_fix_flag, created_at, updated_at
 aiworker     | runtime_president_approval                                    | president_approval_id, request_id, approval_code, approval_result_code, approval_status_code, approval_summary_ja, approval_detail_jsonb, human_go_required_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, created_at, updated_at
 aiworker     | runtime_review_gate_log                                       | gate_id, request_id, gate_type_code, gate_status_code, gate_result_code, reviewer_role_layer_code, review_summary_ja, review_detail_jsonb, created_at, updated_at
 aiworker     | vw_app_aiworker_runtime_delivery_board_v1                     | delivery_id, request_id, request_code, app_surface_code, model_code, model_no, model_name_ja, task_domain_code, task_title, delivery_code, delivery_status_code, delivery_result_code, delivery_title_ja, delivery_summary_ja, human_go_confirmed_flag, external_execution_performed_flag, pg_apply_performed_flag, destructive_action_performed_flag, delivery_safe_internal_flag, created_at, updated_at
 aiworker     | vw_app_aiworker_runtime_leader_review_board_v1                | leader_review_id, request_id, request_code, app_surface_code, model_code, model_no, model_name_ja, task_domain_code, task_title, review_code, review_result_code, review_status_code, reviewer_role_layer_code, review_summary_ja, return_for_fix_flag, created_at, updated_at
 aiworker     | vw_app_aiworker_runtime_president_approval_board_v1           | president_approval_id, request_id, request_code, app_surface_code, model_code, model_no, model_name_ja, task_domain_code, task_title, approval_code, approval_result_code, approval_status_code, approval_summary_ja, human_go_required_flag, external_execution_allowed_flag, pg_apply_allowed_flag, destructive_action_allowed_flag, created_at, updated_at
 aiworker     | vw_leader_mock_review_board_v1                                | manager_plan_code, leader_task_code, worker_task_code, task_domain_code, review_result_code, review_status_code, review_summary, correction_note, risk_note, review_json
 aiworker     | vw_president_manager_instruction_waiting_v1                   | distribution_code, instruction_code, president_model_code, president_model_no, strategy_cycle_code, bridge_status_code, bridge_note, source_actor_type, source_authority_role_code, source_manager_level_no, target_authority_role_code, target_manager_level_no, target_actor_ref, task_domain_code, instruction_title, priority_code, human_confirmed_flag, hierarchy_authorized_flag, instruction_status_code, authority_decision_code, authority_decision_summary, manager_can_accept_flag
 business     | ai_company_manager_approval                                   | approval_id, project_id, pipeline_run_id, deliverable_id, approver_user_id, approval_status, approval_comment, approved_at, created_at, updated_at
 business     | ai_company_manager_delivery                                   | delivery_id, project_id, pipeline_run_id, approval_id, deliverable_id, delivery_status, delivery_format, delivery_ref, delivered_at, accepted_at, created_at, updated_at
 business     | ai_company_manager_review                                     | review_id, deliverable_id, pipeline_run_id, reviewer_role, reviewer_ref, review_status, review_comment, quality_score, reviewed_at, created_at, updated_at
 business     | aicm_human_review_item                                        | aicm_human_review_item_id, owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id, related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id, related_deliverable_requirement_id, related_worker_work_unit_id, review_kind_code, artifact_kind_code, review_title, delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link, responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date, human_reviewer_label, human_review_note, requested_at, reviewed_at, display_order, metadata_jsonb, created_at, updated_at
 business     | aicm_review_action                                            | review_action_id, review_item_id, company_id, action_type, action_status_after, actor_user_id, actor_role, idempotency_key, comment, created_at
 business     | aicm_review_item                                              | review_item_id, company_id, department_id, ledger_row_id, review_title, target_name, review_status, note, created_at, updated_at
 business     | approval_action                                               | action_id, request_id, step_order, actor_id, action, comment, meta, acted_at
 business     | approval_flow_definition                                      | flow_code, description, is_active, created_at
 business     | approval_flow_step_definition                                 | flow_code, step_order, role_code, sla_hours, is_required, created_at
 business     | approval_request                                              | request_id, request_type, flow_code, reference_schema, reference_table, reference_id, payload, status, current_step, created_by, created_at, updated_at, due_at
 business     | approval_step_instance                                        | request_id, step_order, role_code, status, due_at, escalated_count, last_escalated_at, decided_by, decided_at
 business     | vw_aicm_human_review_wait_display                             | aicm_human_review_item_id, owner_civilization_id, aicm_user_company_id, company_name, aicm_user_company_department_id, department_name, aicm_user_company_section_id, section_name, related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id, related_deliverable_requirement_id, related_worker_work_unit_id, review_kind_code, review_kind_label, artifact_kind_code, artifact_kind_label, review_title, delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link, responsible_ai_label, requested_by_ai_label, human_review_status_code, human_review_status_label, priority_code, due_date, human_reviewer_label, human_review_note, requested_at, reviewed_at, display_order, created_at, updated_at, metadata_jsonb
 cx22073jw    | access_activation_review_decision_batch                       | activation_review_decision_batch_id, batch_code, source_export_run_code, source_export_root_path, request_count, item_count, approved_candidate_count, gate_hold_count, scope_hold_count, rank_hold_count, rejected_hold_count, batch_status, actor_name, note_text, created_at, updated_at, ended_at
 cx22073jw    | access_activation_review_decision_item                        | activation_review_decision_item_id, activation_review_decision_batch_id, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, source_decision_status, source_action_hint, review_bucket, human_review_status, governed_apply_ready, review_note, created_at
 cx22073jw    | access_activation_review_export_item                          | activation_review_export_item_id, activation_review_export_run_id, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, decision_status, gate_needed, decision_action_hint, created_at
 cx22073jw    | access_activation_review_export_run                           | activation_review_export_run_id, run_code, export_root_path, manifest_md_path, request_summary_tsv_path, decision_matrix_tsv_path, apply_plan_sql_path, gate_rejected_tsv_path, export_summary_json_path, request_count, decision_count, allowed_count, gate_count, scope_count, rank_count, rejected_count, run_status, actor_name, note_text, created_at, updated_at, ended_at
 cx22073jw    | access_human_review_action_log                                | human_review_action_log_id, activation_review_decision_batch_id, request_code, actual_view_code, logical_view_name, previous_human_review_status, new_human_review_status, reviewer_name, review_note, created_at
 cx22073jw    | ai_employee_activation_review_decision_batch                  | activation_review_decision_batch_id, batch_code, source_export_run_code, source_export_root_path, request_count, item_count, approved_candidate_count, gate_hold_count, scope_hold_count, rank_hold_count, rejected_hold_count, batch_status, actor_name, note_text, created_at, updated_at, ended_at
 cx22073jw    | ai_employee_activation_review_decision_item                   | activation_review_decision_item_id, activation_review_decision_batch_id, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, source_decision_status, source_action_hint, review_bucket, human_review_status, governed_apply_ready, review_note, created_at
 cx22073jw    | ai_employee_activation_review_export_item                     | activation_review_export_item_id, activation_review_export_run_id, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, decision_status, gate_needed, decision_action_hint, created_at
 cx22073jw    | ai_employee_activation_review_export_run                      | activation_review_export_run_id, run_code, export_root_path, manifest_md_path, request_summary_tsv_path, decision_matrix_tsv_path, apply_plan_sql_path, gate_rejected_tsv_path, export_summary_json_path, request_count, decision_count, allowed_count, gate_count, scope_count, rank_count, rejected_count, run_status, actor_name, note_text, created_at, updated_at, ended_at
 cx22073jw    | ai_employee_human_review_action_log                           | human_review_action_log_id, activation_review_decision_batch_id, request_code, actual_view_code, logical_view_name, previous_human_review_status, new_human_review_status, reviewer_name, review_note, created_at
 cx22073jw    | review_case_area                                              | row_id, subject_key, source_system, source_app, canonical_owner_system, canonical_ref_key, lifecycle_status, projection_payload, policy_context_payload, meta, created_at, updated_at
 cx22073jw    | source_review_registry                                        | source_registry_code, source_type, source_title, review_status, trust_score, review_note, meta, created_at, updated_at
 cx22073jw    | staticart_delivery_closeout_run                               | delivery_closeout_run_id, run_code, overall_status, release_code, release_status, export_code, export_status, export_root_path, sample_run_status, readiness_gate_status, total_target_count, released_target_count, blocked_target_count, actor_name, note_text, created_at, updated_at
 cx22073jw    | v_access_activation_review_decision_latest_batch_summary      | batch_code, source_export_run_code, source_export_root_path, request_count, item_count, approved_candidate_count, gate_hold_count, scope_hold_count, rank_hold_count, rejected_hold_count, batch_status, note_text, created_at, ended_at
 cx22073jw    | v_access_activation_review_decision_latest_items              | batch_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, source_decision_status, source_action_hint, review_bucket, human_review_status, governed_apply_ready, review_note, created_at
 cx22073jw    | v_access_activation_review_export_latest_items                | run_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, decision_status, gate_needed, decision_action_hint
 cx22073jw    | v_access_activation_review_export_latest_summary              | run_code, export_root_path, request_count, decision_count, allowed_count, gate_count, scope_count, rank_count, rejected_count, run_status, note_text, created_at, ended_at
 cx22073jw    | v_access_human_review_latest_action_log                       | batch_code, request_code, actual_view_code, logical_view_name, previous_human_review_status, new_human_review_status, reviewer_name, review_note, created_at
 cx22073jw    | v_ai_employee_activation_review_decision_latest_batch_summary | batch_code, source_export_run_code, source_export_root_path, request_count, item_count, approved_candidate_count, gate_hold_count, scope_hold_count, rank_hold_count, rejected_hold_count, batch_status, note_text, created_at, ended_at
 cx22073jw    | v_ai_employee_activation_review_decision_latest_items         | batch_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, source_decision_status, source_action_hint, review_bucket, human_review_status, governed_apply_ready, review_note, created_at
 cx22073jw    | v_ai_employee_activation_review_export_latest_items           | run_code, request_code, target_domain_code, target_role_code, actual_view_code, logical_view_name, decision_status, gate_needed, decision_action_hint
 cx22073jw    | v_ai_employee_activation_review_export_latest_summary         | run_code, export_root_path, request_count, decision_count, allowed_count, gate_count, scope_count, rank_count, rejected_count, run_status, note_text, created_at, ended_at
 cx22073jw    | v_ai_employee_human_review_latest_action_log                  | batch_code, request_code, actual_view_code, logical_view_name, previous_human_review_status, new_human_review_status, reviewer_name, review_note, created_at
 cx22073jw    | v_review_case_area_latest                                     | row_id, subject_key, source_system, source_app, canonical_owner_system, canonical_ref_key, lifecycle_status, projection_payload, policy_context_payload, meta, created_at, updated_at
 cx22073jw    | v_staticart_delivery_closeout_summary                         | run_code, overall_status, release_code, release_status, export_code, export_status, export_root_path, sample_run_status, readiness_gate_status, total_target_count, released_target_count, blocked_target_count, note_text, created_at
 cx22073jw    | v_staticart_delivery_master_status                            | certificate_code, certificate_status, release_code, release_status, export_code, export_status, package_code, package_status, closeout_run_code, export_root_path, total_target_count, released_target_count, blocked_target_count, file_count, note_text, created_at
 cx22073jw    | vw_aiemp_approval_routing_context                             | actual_view_code, domain_code, view_family_code, logical_view_name, sensitivity_code, exposure_scope, gate_required, subject_key, summary_text, context_payload, policy_payload, audit_payload, masking_note, priority_rank, source_updated_at, purpose_text, stub_version
 cx22073jw    | vw_aiemp_review_package_context                               | actual_view_code, domain_code, view_family_code, logical_view_name, sensitivity_code, exposure_scope, gate_required, subject_key, summary_text, context_payload, policy_payload, audit_payload, masking_note, priority_rank, source_updated_at, purpose_text, stub_version
 cx22073jw    | vw_aiemp_senior_control_approval_request_context              | actual_view_code, domain_code, view_family_code, logical_view_name, sensitivity_code, exposure_scope, gate_required, subject_key, summary_text, context_payload, policy_payload, audit_payload, masking_note, priority_rank, source_updated_at, purpose_text, stub_version
(51 rows)

--- dynamic count for relations having company_id and owner_id ---
--- dynamic count for relations having company_id only ---
        relation_name        | target_count 
-----------------------------+--------------
 business.aicm_review_action |            0
(1 row)

       relation_name       | target_count 
---------------------------+--------------
 business.aicm_review_item |            0
(1 row)

WARN: DB read-only count scan did not clearly show target_count=2; inspect /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8a_context_shape_isolate_20260503_071948/041_db_review_count_scan.txt

============================================================
7. DECISION MATRIX
============================================================
判定基準:
- BEST_CONTEXT_COUNT=2:
  context APIのどこかには2件が出ている。
  次はcore側で、そのURL/shapeから state.context.review_wait_items へmergeする最小修正。

- BEST_CONTEXT_COUNT=0 かつ DBに2件候補あり:
  DB/viewにはあるがcontext APIに露出していない。
  次はserver context routeのresponse shapeまたはquery filter修正。
  UI rendererはまだ触らない。

- BEST_CONTEXT_COUNT=0 かつ DBにも2件が見えない:
  会社ID/ownerID/view/table名/DB接続先の前提確認。
  UI patch禁止。

- server/coreで snake_case と camelCase がズレ:
  片方に揃えるのではなく、受け側で両対応mergeを最小追加する。

============================================================
8. FINAL JUDGEMENT
============================================================
PASS_COUNT=7
WARN_COUNT=4
FAIL_COUNT=0
BEST_CONTEXT_COUNT=0
BEST_CONTEXT_URL=
BEST_CONTEXT_PARSE=
DB_HAS_TWO=NO
FINAL_JUDGEMENT=NO_CONTEXT_AND_DB_COUNT_UNCLEAR_CHECK_DB_VIEW_OR_IDS
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8a_context_shape_isolate_20260503_071948/000_R8Z_V8A_CONTEXT_SHAPE_ISOLATE_REPORT.md
SERVER_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8a_context_shape_isolate_20260503_071948/010_server_context_route_snippets.txt
CORE_SNIP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8a_context_shape_isolate_20260503_071948/020_core_context_and_review_snippets.txt
CONTEXT_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8a_context_shape_isolate_20260503_071948/030_context_url_probe_summary.tsv
DB_REL_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8a_context_shape_isolate_20260503_071948/040_db_review_relation_scan.txt
DB_COUNT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8a_context_shape_isolate_20260503_071948/041_db_review_count_scan.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO
