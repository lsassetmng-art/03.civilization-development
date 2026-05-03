
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- DB/context API は正常
- exact V7 context URL は review_wait_items=2 を返す
- ブラウザ画面は rows=0 / hydrating=YES
- V8F2では:
  V7_HYDRATING_FALSE_COUNT=1
  V7_PAYLOAD_REVIEW_ASSIGN_COUNT=16
- つまり「finalizerなし」ではなく、scope違い / merge先違い / render再呼び出し不足 / route表示state違い の疑い

今回の作業:
1. core/server syntax確認
2. exact context URL再確認
3. hydrateIfNeeded関数を丸ごと抽出
4. V7 renderer関数を丸ごと抽出
5. rows/normalize関数を丸ごと抽出
6. 静的解析で以下を判定:
   - fetch then内でpayload.review_wait_itemsを読むか
   - appState.contextへ入れるか
   - appState.review_wait_itemsへ入れるか
   - appState.aicmR8zV7Hydrating=falseがthen/catch/finallyで必ず通るか
   - fetch完了後にrender再呼び出しがあるか
   - window.aicmRender依存で止まっていないか

禁止:
- DB write
- API POST
- server patch
- core patch

============================================================
1. ENV
============================================================
PHASE=R8Z-V8F3 V7 hydrate finalizer rerender exact isolate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f3_v7_hydrate_finalizer_rerender_isolate_20260503_102934
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS: core exists
PASS: server exists

============================================================
2. syntax / server check
============================================================
PASS: core syntax PASS
PASS: server syntax PASS
ROOT_HTTP=200
PASS: server reachable

============================================================
3. exact context URL verify
============================================================
EXACT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v8f3_20260503_102934
CONTEXT_HTTP=200
PASS: exact context URL returned 200
result=ok
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true
PASS: context has review_wait_items=2

============================================================
4. extract exact V7 blocks
============================================================
---- V7_ANALYSIS ----
hydrate_block_length=1948
render_block_length=4156
normalize_block_length=10841
hydrate_has_fetch=true
hydrate_has_then=true
hydrate_has_catch=true
hydrate_has_finally=true
hydrate_sets_true=true
hydrate_sets_false=true
hydrate_assigns_context_payload=false
hydrate_assigns_review_rows=false
hydrate_reads_payload_review=false
hydrate_calls_render_function=true
hydrate_uses_window_aicmRender_only=false
hydrate_has_hydrating_false_before_render=true
hydrate_has_return_after_loadContext=false
render_calls_hydrate_if_needed=true
render_computes_list_before_hydrate=true
render_recomputes_list_after_hydrate=false
normalize_writes_state_review=true
---- V7_BLOCK head/tail ----
===== hydrateIfNeeded L9496-L9542 =====
  9496: function hydrateIfNeeded(appState) {
  9497:     appState = appState || {};
  9498:     if (appState.aicmR8zV7Hydrating) return;
  9499:     if (rows(appState).length > 0) return;
  9500: 
  9501:     var owner = ownerId(appState);
  9502:     var company = companyId(appState);
  9503: 
  9504:     if (!owner || !company || typeof fetch !== "function") {
  9505:       appState.aicmR8zV7HydrationError = "missing owner/company owner=" + owner + " company=" + company;
  9506:       return;
  9507:     }
  9508: 
  9509:     appState.aicmR8zV7Hydrating = true;
  9510: 
  9511:     var params = new URLSearchParams();
  9512:     params.set("owner_civilization_id", owner);
  9513:     params.set("aicm_user_company_id", company);
  9514:     params.set("v", "r8z_v7_" + Date.now());
  9515: 
  9516:     fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
  9517:       .then(function (res) {
  9518:         return res.text().then(function (bodyText) {
  9519:           var payload = {};
  9520:           try {
  9521:             payload = bodyText ? JSON.parse(bodyText) : {};
  9522:           } catch (_error) {
  9523:             payload = {};
  9524:           }
  9525: 
  9526:           if (res.ok && payload && payload.result === "ok") {
  9527:             normalize(appState, payload);
  9528:           } else {
  9529:             appState.aicmR8zV7HydrationError = payload.error_message || ("context status " + String(res.status));
  9530:           }
  9531:         });
  9532:       })
  9533:       .catch(function (error) {
  9534:         appState.aicmR8zV7HydrationError = String(error && error.message ? error.message : error);
  9535:       })
  9536:       .finally(function () {
  9537:         appState.aicmR8zV7Hydrating = false;
  9538:         if (appState.screen === "review-list") rerender();
  9539:       });
  9540:   }
  9541: 
  9542:   
---- V7_BLOCK tail ----
===== hydrateIfNeeded L9496-L9542 =====
  9496: function hydrateIfNeeded(appState) {
  9497:     appState = appState || {};
  9498:     if (appState.aicmR8zV7Hydrating) return;
  9499:     if (rows(appState).length > 0) return;
  9500: 
  9501:     var owner = ownerId(appState);
  9502:     var company = companyId(appState);
  9503: 
  9504:     if (!owner || !company || typeof fetch !== "function") {
  9505:       appState.aicmR8zV7HydrationError = "missing owner/company owner=" + owner + " company=" + company;
  9506:       return;
  9507:     }
  9508: 
  9509:     appState.aicmR8zV7Hydrating = true;
  9510: 
  9511:     var params = new URLSearchParams();
  9512:     params.set("owner_civilization_id", owner);
  9513:     params.set("aicm_user_company_id", company);
  9514:     params.set("v", "r8z_v7_" + Date.now());
  9515: 
  9516:     fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
  9517:       .then(function (res) {
  9518:         return res.text().then(function (bodyText) {
  9519:           var payload = {};
  9520:           try {
  9521:             payload = bodyText ? JSON.parse(bodyText) : {};
  9522:           } catch (_error) {
  9523:             payload = {};
  9524:           }
  9525: 
  9526:           if (res.ok && payload && payload.result === "ok") {
  9527:             normalize(appState, payload);
  9528:           } else {
  9529:             appState.aicmR8zV7HydrationError = payload.error_message || ("context status " + String(res.status));
  9530:           }
  9531:         });
  9532:       })
  9533:       .catch(function (error) {
  9534:         appState.aicmR8zV7HydrationError = String(error && error.message ? error.message : error);
  9535:       })
  9536:       .finally(function () {
  9537:         appState.aicmR8zV7Hydrating = false;
  9538:         if (appState.screen === "review-list") rerender();
  9539:       });
  9540:   }
  9541: 
  9542:   
---- V7_RENDER_BLOCK ----
===== aicmR8zV7RenderReviewList L9551-L9633 =====
  9551: function aicmR8zV7RenderReviewList(appState) {
  9552:     appState = appState || {};
  9553:     var list = rows(appState);
  9554: 
  9555:     if (!list.length) hydrateIfNeeded(appState);
  9556: 
  9557:     var debug = [
  9558:       "selectedCompanyId=" + companyId(appState),
  9559:       "owner=" + ownerId(appState),
  9560:       "rows=" + String(list.length),
  9561:       appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
  9562:       appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : ""
  9563:     ].filter(Boolean).join(" / ");
  9564: 
  9565:     var html = [
  9566:       '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
  9567:       '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
  9568:       '  <h2>納品サマリー確認</h2>',
  9569:       '  <p class="aicm-selected-note">対象会社: <strong>' + esc(companyName(appState)) + '</strong></p>',
  9570:       '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + esc(String(list.length)) + '件</strong></p>',
  9571:       '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'
  9572:     ];
  9573: 
  9574:     if (!list.length) {
  9575:       html.push(
  9576:         '  <article class="aicm-core-card">',
  9577:         '    <strong>レビュー・承認待ちはありません</strong>',
  9578:         '    <p>context反映待ちです。数秒後に再描画されます。</p>',
  9579:         '  </article>',
  9580:         '</section>'
  9581:       );
  9582:       return html.join("");
  9583:     }
  9584: 
  9585:     list.forEach(function (row, index) {
  9586:       var id = first(row, ["aicm_human_review_item_id", "review_id", "id"], "");
  9587:       var title = first(row, ["review_title", "title"], "レビュー項目");
  9588:       var kind = first(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
  9589:       var artifact = first(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
  9590:       var priority = first(row, ["priority_label", "priority_code"], "-");
  9591:       var summary = first(row, [
  9592:         "delivery_summary_text",
  9593:         "delivery_summary_preview",
  9594:         "result_summary_text",
  9595:         "ai_review_result_text",
  9596:         "review_summary_text",
  9597:         "summary"
  9598:       ], "要約未設定");
  9599:       var requestId = first(row, ["source_request_id", "request_id"], "");
  9600:       var workerUnitId = first(row, ["related_worker_work_unit_id"], "");
  9601: 
  9602:       html.push(
  9603:         '  <article class="aicm-core-card aicm-review-card">',
  9604:         '    <div class="aicm-review-head">',
  9605:         '      <div>',
  9606:         '        <p class="aicm-eyebrow">レビュー #' + esc(String(index + 1)) + '</p>',
  9607:         '        <h3>' + esc(title) + '</h3>',
  9608:         '      </div>',
  9609:         '      <strong>' + esc(statusLabel(row)) + '</strong>',
  9610:         '    </div>',
  9611:         '    <div class="aicm-review-meta">',
  9612:         '      <span>種別: ' + esc(kind) + '</span>',
  9613:         '      <span>成果物: ' + esc(artifact) + '</span>',
  9614:         '      <span>優先度: ' + esc(priority) + '</span>',
  9615:         requestId ? '      <span>request_id: ' + esc(requestId) + '</span>' : '',
  9616:         workerUnitId ? '      <span>worker_unit: ' + esc(workerUnitId) + '</span>' : '',
  9617:         '    </div>',
  9618:         '    <section class="aicm-review-summary">',
  9619:         '      <h3>納品サマリー</h3>',
  9620:         '      <p>' + esc(summary) + '</p>',
  9621:         '    </section>',
  9622:         '    <div class="aicm-dashboard-action-row">',
  9623:         '      <button type="button" data-core-action="human-review-approve" data-review-id="' + esc(id) + '">承認</button>',
  9624:         '      <button type="button" data-core-action="human-review-return" data-review-id="' + esc(id) + '">差し戻し</button>',
  9625:         '    </div>',
  9626:         '  </article>'
  9627:       );
  9628:     });
  9629: 
  9630:     html.push('</section>');
  9631:     return html.join("");
  9632:   };
  9633: 
---- V7_NORMALIZE_BLOCK head/tail ----
===== normalize L1847-L1851 =====
  1847: function normalize(value) {
  1848:       return String(value || "").trim().toLowerCase();
  1849:     }
  1850: 
  1851:     

===== rows L9440-L9461 =====
  9440: function rows(appState) {
  9441:     appState = appState || {};
  9442:     var c = ctx(appState);
  9443:     var candidates = [
  9444:       c.review_wait_items,
  9445:       appState.review_wait_items,
  9446:       c.reviewWaitItems,
  9447:       c.human_review_wait_items,
  9448:       c.humanReviewWaitItems
  9449:     ];
  9450: 
  9451:     for (var i = 0; i < candidates.length; i += 1) {
  9452:       if (Array.isArray(candidates[i])) {
  9453:         return candidates[i].filter(function (row) {
  9454:           return row && typeof row === "object";
  9455:         });
  9456:       }
  9457:     }
  9458:     return [];
  9459:   }
  9460: 
  9461:   

===== ctx L9435-L9440 =====
  9435: function ctx(appState) {
  9436:     appState = appState || {};
  9437:     return normalize(appState, appState.context && typeof appState.context === "object" ? appState.context : {});
  9438:   }
  9439: 
  9440:   

  6461: 
  6462: 
  6463: 
  6464:   
  6465: // AICM_HUMAN_REVIEW_QUEUE_CORE_ARO_ART_V1
  6466: // Human review queue UI.
  6467: // Human review only shows delivery summaries / exception summaries.
  6468: // AI review remains internal; the UI displays ai_review_result_text summary only.
  6469: 
  6470: function aicmHumanReviewOwnerId() {
  6471:     if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
  6472:     if (state && state.owner_civilization_id) return state.owner_civilization_id;
  6473:     if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
  6474:     return "00000000-0000-4000-8000-000000000001";
  6475:   }
  6476: 
  6477:   function aicmHumanReviewRows() {
  6478:     var ctx = state.context || state || {};
  6479:     var rows = ctx.review_wait_items || state.review_wait_items || [];
  6480:     return Array.isArray(rows) ? rows : [];
  6481:   }
  6482: 
  6483:   function aicmHumanReviewRowsForCompany(companyId) {
  6484:     return aicmHumanReviewRows().filter(function (row) {
  6485:       return !companyId || row.aicm_user_company_id === companyId;
  6486:     });
  6487:   }
  6488: 
  6489:   async function aicmHumanReviewPostJson(path, body) {
  6490:     var response = await fetch(path, {
  6491:       method: "POST",
  6492:       headers: { "Content-Type": "application/json" },
  6493:       body: JSON.stringify(body || {})
  6494:     });
  6495: 
  6496:     var text = await response.text();
  6497:     var json = {};
  6498: 
  6499:     try {
  6500:       json = text ? JSON.parse(text) : {};
  6501:     } catch (_) {
  6502:       json = { result: "error", message: text || "Invalid server response" };
  6503:     }
  6504: 
  6505:     if (!response.ok || (json.result && json.result !== "ok")) {
  6506:       throw new Error(json.message || json.error || ("API failed: " + path));
  6507:     }

  6643:         '  </section>',
  6644:         '  <div class="aicm-dashboard-action-row">',
  6645:         '    <button type="button" data-core-action="human-review-approve" data-review-id="' + escapeHtml(id) + '">承認</button>',
  6646:         '    <button type="button" data-core-action="human-review-return" data-review-id="' + escapeHtml(id) + '">差し戻し</button>',
  6647:         '  </div>',
  6648:         '</article>'
  6649:       ].join("");
  6650:     }).join("");
  6651:   }
  6652: 
  6653: 
  6654:   
  6655: function renderReviewListPlaceholder() {
  6656: 
  6657:   // AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_START
  6658:   var ctx = state && state.context ? state.context : {};
  6659:   var rows = [];
  6660: 
  6661:   if (ctx && Array.isArray(ctx.review_wait_items)) {
  6662:     rows = ctx.review_wait_items;
  6663:   } else if (state && Array.isArray(state.review_wait_items)) {
  6664:     rows = state.review_wait_items;
  6665:   } else if (ctx && Array.isArray(ctx.human_review_items)) {
  6666:     rows = ctx.human_review_items;
  6667:   }
  6668: 
  6669:   function r8zV4bText(value, fallback) {
  6670:     if (value === null || typeof value === "undefined") return fallback || "";
  6671:     var text = String(value);
  6672:     return text.length ? text : (fallback || "");
  6673:   }
  6674: 
  6675:   function r8zV4bEsc(value) {
  6676:     if (typeof escapeHtml === "function") return escapeHtml(r8zV4bText(value));
  6677:     return r8zV4bText(value)
  6678:       .replace(/&/g, "&amp;")
  6679:       .replace(/</g, "&lt;")
  6680:       .replace(/>/g, "&gt;")
  6681:       .replace(/"/g, "&quot;")
  6682:       .replace(/'/g, "&#039;");
  6683:   }
  6684: 
  6685:   function r8zV4bCompanyName() {
  6686:     if (state && state.selectedCompanyName) return state.selectedCompanyName;
  6687:     if (ctx && Array.isArray(ctx.companies)) {
  6688:       for (var i = 0; i < ctx.companies.length; i += 1) {
  6689:         var c = ctx.companies[i] || {};
  6690:         var id = r8zV4bText(c.aicm_user_company_id || c.company_id || c.id);

  9120:   }
  9121: 
  9122:   function r8zV5dContext() {
  9123:     var state = r8zV5dState();
  9124:     if (!state.context || typeof state.context !== "object") {
  9125:       state.context = {};
  9126:     }
  9127:     return state.context;
  9128:   }
  9129: 
  9130:   function r8zV5dNormalizeContext(ctx) {
  9131:     var state = r8zV5dState();
  9132: 
  9133:     if (!ctx || typeof ctx !== "object") {
  9134:       ctx = {};
  9135:     }
  9136: 
  9137:     var rows = [];
  9138:     if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
  9139:     else if (Array.isArray(ctx.reviewWaitItems)) rows = ctx.reviewWaitItems;
  9140:     else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
  9141:     else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
  9142:     else if (Array.isArray(state.review_wait_items)) rows = state.review_wait_items;
  9143: 
---- V7_NORMALIZE_BLOCK tail ----
  9147: 
  9148:     if (ctx.owner_civilization_id) state.owner_civilization_id = ctx.owner_civilization_id;
  9149:     if (ctx.aicm_user_company_id) state.selectedCompanyId = ctx.aicm_user_company_id;
  9150: 
  9151:     return ctx;
  9152:   }
  9153: 
  9154:   function r8zV5dReviewRows() {
  9155:     var state = r8zV5dState();
  9156:     var ctx = r8zV5dNormalizeContext(r8zV5dContext());
  9157: 
  9158:     var candidates = [
  9159:       ctx.review_wait_items,
  9160:       state.review_wait_items,
  9161:       ctx.reviewWaitItems,
  9162:       ctx.human_review_wait_items,
  9163:       ctx.humanReviewWaitItems
  9164:     ];
  9165: 
  9166:     for (var i = 0; i < candidates.length; i += 1) {
  9167:       if (Array.isArray(candidates[i])) {
  9168:         return candidates[i].filter(function (row) {
  9169:           return row && typeof row === "object";
  9170:         });
  9171:       }
  9172:     }
  9173: 
  9174:     return [];
  9175:   }
  9176: 
  9177:   function r8zV5dOwnerId() {
  9178:     var state = r8zV5dState();
  9179:     var ctx = r8zV5dContext();
  9180:     return r8zV5dText(
  9181:       state.owner_civilization_id ||
  9182:       state.ownerCivilizationId ||
  9183:       ctx.owner_civilization_id ||
  9184:       ctx.ownerCivilizationId ||
  9185:       "00000000-0000-4000-8000-000000000001"
  9186:     );
  9187:   }
  9188: 
  9189:   function r8zV5dCompanyId() {
  9190:     var state = r8zV5dState();

  9401: 
  9402:   function first(row, keys, fallback) {
  9403:     row = row || {};
  9404:     for (var i = 0; i < keys.length; i += 1) {
  9405:       var key = keys[i];
  9406:       if (Object.prototype.hasOwnProperty.call(row, key)) {
  9407:         var value = t(row[key]);
  9408:         if (value) return value;
  9409:       }
  9410:     }
  9411:     return fallback || "";
  9412:   }
  9413: 
  9414:   function normalize(appState, ctx) {
  9415:     appState = appState || {};
  9416:     if (!ctx || typeof ctx !== "object") ctx = {};
  9417: 
  9418:     var rows = [];
  9419:     if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
  9420:     else if (Array.isArray(ctx.reviewWaitItems)) rows = ctx.reviewWaitItems;
  9421:     else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
  9422:     else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
  9423:     else if (Array.isArray(appState.review_wait_items)) rows = appState.review_wait_items;
  9424: 
  9425:     ctx.review_wait_items = rows;
  9426:     appState.context = ctx;
  9427:     appState.review_wait_items = rows;
  9428: 
  9429:     if (ctx.owner_civilization_id) appState.owner_civilization_id = ctx.owner_civilization_id;
  9430:     if (ctx.aicm_user_company_id) appState.selectedCompanyId = ctx.aicm_user_company_id;
  9431: 
  9432:     return ctx;
  9433:   }
  9434: 
  9435:   function ctx(appState) {
  9436:     appState = appState || {};
  9437:     return normalize(appState, appState.context && typeof appState.context === "object" ? appState.context : {});
  9438:   }
  9439: 
  9440:   function rows(appState) {
  9441:     appState = appState || {};
  9442:     var c = ctx(appState);
  9443:     var candidates = [
  9444:       c.review_wait_items,
  9445:       appState.review_wait_items,
  9446:       c.reviewWaitItems,
  9447:       c.human_review_wait_items,
  9448:       c.humanReviewWaitItems
  9449:     ];
  9450: 
  9451:     for (var i = 0; i < candidates.length; i += 1) {
  9452:       if (Array.isArray(candidates[i])) {
  9453:         return candidates[i].filter(function (row) {
  9454:           return row && typeof row === "object";
  9455:         });
  9456:       }
  9457:     }
  9458:     return [];
  9459:   }
  9460: 
  9461:   function ownerId(appState) {
  9462:     appState = appState || {};
  9463:     var c = appState.context || {};
  9464:     return t(appState.owner_civilization_id || appState.ownerCivilizationId || c.owner_civilization_id || c.ownerCivilizationId || "00000000-0000-4000-8000-000000000001");
  9465:   }
  9466: 
  9467:   function companyId(appState) {
  9468:     appState = appState || {};
  9469:     var c = appState.context || {};
  9470:     return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id);
  9471:   }
  9472: 
  9473:   function companyName(appState) {
  9474:     appState = appState || {};
  9475:     var c = appState.context || {};

============================================================
5. decide exact next patch type
============================================================
HYDRATE_HAS_FETCH=true
HYDRATE_SETS_FALSE=true
HYDRATE_ASSIGNS_CONTEXT=false
HYDRATE_ASSIGNS_REVIEW=false
HYDRATE_CALLS_RENDER=true
HYDRATE_FALSE_BEFORE_RENDER=true
RENDER_COMPUTES_BEFORE=true
RENDER_RECOMPUTES_AFTER=false

============================================================
6. FINAL
============================================================
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
HYDRATE_SETS_FALSE=true
HYDRATE_ASSIGNS_CONTEXT=false
HYDRATE_ASSIGNS_REVIEW=false
HYDRATE_CALLS_RENDER=true
HYDRATE_FALSE_BEFORE_RENDER=true
RENDER_COMPUTES_BEFORE=true
RENDER_RECOMPUTES_AFTER=false
PASS_COUNT=7
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=PATCH_V7_ADD_REVIEW_WAIT_ITEMS_MERGE
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f3_v7_hydrate_finalizer_rerender_isolate_20260503_102934/000_R8Z_V8F3_V7_HYDRATE_FINALIZER_RERENDER_ISOLATE_REPORT.md
V7_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f3_v7_hydrate_finalizer_rerender_isolate_20260503_102934/023_v7_static_analysis.txt
V7_BLOCK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f3_v7_hydrate_finalizer_rerender_isolate_20260503_102934/020_v7_hydrate_if_needed_block.txt
V7_RENDER_BLOCK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f3_v7_hydrate_finalizer_rerender_isolate_20260503_102934/021_v7_render_review_list_block.txt
V7_NORMALIZE_BLOCK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f3_v7_hydrate_finalizer_rerender_isolate_20260503_102934/022_v7_normalize_rows_block.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- PATCH_V7_ADD_REVIEW_WAIT_ITEMS_MERGE:
  fetch成功後に payload.review_wait_items を appState.context.review_wait_items / appState.review_wait_items へ入れるだけ。

- PATCH_V7_ADD_RERENDER_AFTER_HYDRATE:
  fetch成功後またはfinallyで hydrating=false 後に render/aicmRender を呼ぶだけ。

- PATCH_V7_RERENDER_OR_RECOMPUTE_LIST_AFTER_HYDRATE:
  初回renderのlistは0で固定されるため、hydrate完了後に再描画を保証する最小patch。

- SNIP_REVIEW_REQUIRED_SCOPE_OR_ROUTE_STATE_MISMATCH:
  V7_BLOCK/V7_RENDER_BLOCKを見て、state参照が別objectになっていないか確認。
