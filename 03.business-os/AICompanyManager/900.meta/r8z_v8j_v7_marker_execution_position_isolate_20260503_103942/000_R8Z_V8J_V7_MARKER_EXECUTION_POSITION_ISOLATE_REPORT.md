
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- DB/server/context API は正常
- exact V7 context URL は review_wait_items=2
- ブラウザは最新coreを読めている
- それでも画面は rows=0 / hydrating=YES
- つまり cache問題ではなく、V8G/V8H marker の実行位置が実際のV7 hydrate経路とズレている疑い

今回の確認:
1. core/server syntax確認
2. context API review_wait_items=2維持確認
3. core内の hydrateIfNeeded 関数を全件抽出
4. aicmR8zV7RenderReviewList が参照する hydrateIfNeeded と、V8G/V8H marker の所属関数を比較
5. markerがactive V7 hydrate内にあるか判定
6. 次に「active V7 hydrateへ移植パッチ」か「別原因確認」か決める

禁止:
- DB write
- API POST
- server patch
- core patch

============================================================
1. ENV
============================================================
PHASE=R8Z-V8J V7 marker execution position isolate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8j_v7_marker_execution_position_isolate_20260503_103942
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS: core exists
PASS: server exists

============================================================
2. syntax / server / context check
============================================================
PASS: core syntax PASS
PASS: server syntax PASS
ROOT_HTTP=200
PASS: server reachable
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v8j_20260503_103942
CONTEXT_HTTP=200
result=ok
review_wait_items_count=2
title_1=納品サマリー確認: AI企業業務開始導線の整備 作業
title_2=納品サマリー確認: Manager大項目台帳運用の整備 作業
contains_ai_company_start=true
contains_manager_major=true
PASS: context review_wait_items=2

============================================================
3. static position analysis
============================================================
---- POSITION_REPORT ----
v7_render_block_count=2
hydrate_if_needed_count=1
v8g_marker_pos=326778
v8g_marker_line=9498
v8h_marker_pos=330328
v8h_marker_line=9588
v8g_parent_function=hydrateIfNeeded
v8g_parent_line=9496
v8h_parent_function=aicmR8zV8gMergeReviewWaitItemsFromPayload
v8h_parent_line=9499
active_hydrate_index=0
active_hydrate_start_line=9496
active_hydrate_end_line=9644
active_idx=0
active_startLine=9496
active_endLine=9644
active_hasV7Fetch=true
active_hasV8G=true
active_hasV8H=true
active_hasReviewMergeCall=true
active_hasSetFalse=true
active_hasRenderCall=true
active_firstLine=function hydrateIfNeeded(appState) {
hydrate_0_range=L9496-L9644
hydrate_0_hasV7Fetch=true
hydrate_0_hasV8G=true
hydrate_0_hasV8H=true
hydrate_0_hasReviewMergeCall=true
hydrate_0_hasSetFalse=true
hydrate_0_hasRenderCall=true
v8_markers_inside_active_hydrate=true
active_hydrate_has_review_merge=true
active_hydrate_has_render=true
---- V7_ACTIVE_BLOCK head/tail ----

===== V7_RENDER_BLOCK_0 =====
===== L9655-L9736 =====
  9655: function aicmR8zV7RenderReviewList(appState) {
  9656:     appState = appState || {};
  9657:     var list = rows(appState);
  9658: 
  9659:     if (!list.length) hydrateIfNeeded(appState);
  9660: 
  9661:     var debug = [
  9662:       "selectedCompanyId=" + companyId(appState),
  9663:       "owner=" + ownerId(appState),
  9664:       "rows=" + String(list.length),
  9665:       appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
  9666:       appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : ""
  9667:     ].filter(Boolean).join(" / ");
  9668: 
  9669:     var html = [
  9670:       '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
  9671:       '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
  9672:       '  <h2>納品サマリー確認</h2>',
  9673:       '  <p class="aicm-selected-note">対象会社: <strong>' + esc(companyName(appState)) + '</strong></p>',
  9674:       '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + esc(String(list.length)) + '件</strong></p>',
  9675:       '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'
  9676:     ];
  9677: 
  9678:     if (!list.length) {
  9679:       html.push(
  9680:         '  <article class="aicm-core-card">',
  9681:         '    <strong>レビュー・承認待ちはありません</strong>',
  9682:         '    <p>context反映待ちです。数秒後に再描画されます。</p>',
  9683:         '  </article>',
  9684:         '</section>'
  9685:       );
  9686:       return html.join("");
  9687:     }
  9688: 
  9689:     list.forEach(function (row, index) {
  9690:       var id = first(row, ["aicm_human_review_item_id", "review_id", "id"], "");
  9691:       var title = first(row, ["review_title", "title"], "レビュー項目");
  9692:       var kind = first(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
  9693:       var artifact = first(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
  9694:       var priority = first(row, ["priority_label", "priority_code"], "-");
  9695:       var summary = first(row, [
  9696:         "delivery_summary_text",
  9697:         "delivery_summary_preview",
  9698:         "result_summary_text",
  9699:         "ai_review_result_text",
  9700:         "review_summary_text",
  9701:         "summary"
  9702:       ], "要約未設定");
  9703:       var requestId = first(row, ["source_request_id", "request_id"], "");
  9704:       var workerUnitId = first(row, ["related_worker_work_unit_id"], "");
  9705: 
  9706:       html.push(
  9707:         '  <article class="aicm-core-card aicm-review-card">',
  9708:         '    <div class="aicm-review-head">',
  9709:         '      <div>',
  9710:         '        <p class="aicm-eyebrow">レビュー #' + esc(String(index + 1)) + '</p>',
  9711:         '        <h3>' + esc(title) + '</h3>',
  9712:         '      </div>',
  9713:         '      <strong>' + esc(statusLabel(row)) + '</strong>',
  9714:         '    </div>',
  9715:         '    <div class="aicm-review-meta">',
  9716:         '      <span>種別: ' + esc(kind) + '</span>',
  9717:         '      <span>成果物: ' + esc(artifact) + '</span>',
  9718:         '      <span>優先度: ' + esc(priority) + '</span>',
  9719:         requestId ? '      <span>request_id: ' + esc(requestId) + '</span>' : '',
  9720:         workerUnitId ? '      <span>worker_unit: ' + esc(workerUnitId) + '</span>' : '',
  9721:         '    </div>',
  9722:         '    <section class="aicm-review-summary">',
  9723:         '      <h3>納品サマリー</h3>',
  9724:         '      <p>' + esc(summary) + '</p>',
  9725:         '    </section>',
  9726:         '    <div class="aicm-dashboard-action-row">',
  9727:         '      <button type="button" data-core-action="human-review-approve" data-review-id="' + esc(id) + '">承認</button>',
  9728:         '      <button type="button" data-core-action="human-review-return" data-review-id="' + esc(id) + '">差し戻し</button>',
  9729:         '    </div>',
  9730:         '  </article>'
  9731:       );
  9732:     });
  9733: 
  9734:     html.push('</section>');
  9735:     return html.join("");
  9736:   }

===== V7_RENDER_BLOCK_1 =====
===== L9655-L9736 =====
  9655: window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
  9656:     appState = appState || {};
  9657:     var list = rows(appState);
  9658: 
  9659:     if (!list.length) hydrateIfNeeded(appState);
  9660: 
  9661:     var debug = [
  9662:       "selectedCompanyId=" + companyId(appState),
  9663:       "owner=" + ownerId(appState),
  9664:       "rows=" + String(list.length),
  9665:       appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
  9666:       appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : ""
  9667:     ].filter(Boolean).join(" / ");
  9668: 
  9669:     var html = [
  9670:       '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
  9671:       '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
  9672:       '  <h2>納品サマリー確認</h2>',
  9673:       '  <p class="aicm-selected-note">対象会社: <strong>' + esc(companyName(appState)) + '</strong></p>',
  9674:       '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + esc(String(list.length)) + '件</strong></p>',
  9675:       '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'
  9676:     ];
  9677: 
  9678:     if (!list.length) {
  9679:       html.push(
  9680:         '  <article class="aicm-core-card">',
  9681:         '    <strong>レビュー・承認待ちはありません</strong>',
  9682:         '    <p>context反映待ちです。数秒後に再描画されます。</p>',
  9683:         '  </article>',
  9684:         '</section>'
  9685:       );
  9686:       return html.join("");
  9687:     }
  9688: 
  9689:     list.forEach(function (row, index) {
  9690:       var id = first(row, ["aicm_human_review_item_id", "review_id", "id"], "");
  9691:       var title = first(row, ["review_title", "title"], "レビュー項目");
  9692:       var kind = first(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
  9693:       var artifact = first(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
  9694:       var priority = first(row, ["priority_label", "priority_code"], "-");
  9695:       var summary = first(row, [
  9696:         "delivery_summary_text",
  9697:         "delivery_summary_preview",
  9698:         "result_summary_text",
  9699:         "ai_review_result_text",
  9700:         "review_summary_text",
  9701:         "summary"
  9702:       ], "要約未設定");
  9703:       var requestId = first(row, ["source_request_id", "request_id"], "");
  9704:       var workerUnitId = first(row, ["related_worker_work_unit_id"], "");
  9705: 
  9706:       html.push(
  9707:         '  <article class="aicm-core-card aicm-review-card">',
  9708:         '    <div class="aicm-review-head">',
  9709:         '      <div>',
  9710:         '        <p class="aicm-eyebrow">レビュー #' + esc(String(index + 1)) + '</p>',
  9711:         '        <h3>' + esc(title) + '</h3>',
  9712:         '      </div>',
  9713:         '      <strong>' + esc(statusLabel(row)) + '</strong>',
  9714:         '    </div>',
  9715:         '    <div class="aicm-review-meta">',
  9716:         '      <span>種別: ' + esc(kind) + '</span>',
  9717:         '      <span>成果物: ' + esc(artifact) + '</span>',
  9718:         '      <span>優先度: ' + esc(priority) + '</span>',
  9719:         requestId ? '      <span>request_id: ' + esc(requestId) + '</span>' : '',
  9720:         workerUnitId ? '      <span>worker_unit: ' + esc(workerUnitId) + '</span>' : '',
  9721:         '    </div>',
  9722:         '    <section class="aicm-review-summary">',
  9723:         '      <h3>納品サマリー</h3>',
  9724:         '      <p>' + esc(summary) + '</p>',
  9725:         '    </section>',
  9726:         '    <div class="aicm-dashboard-action-row">',
  9727:         '      <button type="button" data-core-action="human-review-approve" data-review-id="' + esc(id) + '">承認</button>',
  9728:         '      <button type="button" data-core-action="human-review-return" data-review-id="' + esc(id) + '">差し戻し</button>',
  9729:         '    </div>',
  9730:         '  </article>'
  9731:       );
  9732:     });
  9733: 
  9734:     html.push('</section>');
  9735:     return html.join("");
  9736:   }

===== ACTIVE_HYDRATE_CANDIDATE =====
===== L9496-L9644 =====
  9496: function hydrateIfNeeded(appState) {
  9497: 
  9498:   // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper begin
  9499:   function aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload) {
  9500:     appState = appState || {};
  9501:     payload = payload && typeof payload === "object" ? payload : {};
  9502: 
  9503:     var payloadContext = payload.context && typeof payload.context === "object" ? payload.context : {};
  9504:     var payloadData = payload.data && typeof payload.data === "object" ? payload.data : {};
  9505: 
  9506:     var rows = [];
  9507:     if (Array.isArray(payload.review_wait_items)) rows = payload.review_wait_items;
  9508:     else if (Array.isArray(payloadContext.review_wait_items)) rows = payloadContext.review_wait_items;
  9509:     else if (Array.isArray(payloadData.review_wait_items)) rows = payloadData.review_wait_items;
  9510:     else if (Array.isArray(payload.human_review_wait_items)) rows = payload.human_review_wait_items;
  9511:     else if (Array.isArray(payload.reviewWaitItems)) rows = payload.reviewWaitItems;
  9512:     else if (Array.isArray(payload.humanReviewWaitItems)) rows = payload.humanReviewWaitItems;
  9513: 
  9514:     if (!Array.isArray(rows)) rows = [];
  9515: 
  9516:     if (!appState.context || typeof appState.context !== "object") {
  9517:       appState.context = {};
  9518:     }
  9519: 
  9520:     appState.context.review_wait_items = rows;
  9521:     appState.review_wait_items = rows;
  9522: 
  9523:     if (payload.owner_civilization_id) {
  9524:       appState.context.owner_civilization_id = payload.owner_civilization_id;
  9525:       appState.owner_civilization_id = payload.owner_civilization_id;
  9526:     }
  9527: 
  9528:     if (payload.aicm_user_company_id) {
  9529:       appState.context.aicm_user_company_id = payload.aicm_user_company_id;
  9530:       appState.selectedCompanyId = payload.aicm_user_company_id;
  9531:     }
  9532: 
  9533:     if (typeof state !== "undefined" && state && state !== appState) {
  9534:       if (!state.context || typeof state.context !== "object") {
  9535:         state.context = {};
  9536:       }
  9537:       state.context.review_wait_items = rows;
  9538:       state.review_wait_items = rows;
  9539: 
  9540:       if (payload.owner_civilization_id) {
  9541:         state.context.owner_civilization_id = payload.owner_civilization_id;
  9542:         state.owner_civilization_id = payload.owner_civilization_id;
---- V7_ACTIVE_BLOCK tail ----
  9729:         '    </div>',
  9730:         '  </article>'
  9731:       );
  9732:     });
  9733: 
  9734:     html.push('</section>');
  9735:     return html.join("");
  9736:   }

===== ACTIVE_HYDRATE_CANDIDATE =====
===== L9496-L9644 =====
  9496: function hydrateIfNeeded(appState) {
  9497: 
  9498:   // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper begin
  9499:   function aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload) {
  9500:     appState = appState || {};
  9501:     payload = payload && typeof payload === "object" ? payload : {};
  9502: 
  9503:     var payloadContext = payload.context && typeof payload.context === "object" ? payload.context : {};
  9504:     var payloadData = payload.data && typeof payload.data === "object" ? payload.data : {};
  9505: 
  9506:     var rows = [];
  9507:     if (Array.isArray(payload.review_wait_items)) rows = payload.review_wait_items;
  9508:     else if (Array.isArray(payloadContext.review_wait_items)) rows = payloadContext.review_wait_items;
  9509:     else if (Array.isArray(payloadData.review_wait_items)) rows = payloadData.review_wait_items;
  9510:     else if (Array.isArray(payload.human_review_wait_items)) rows = payload.human_review_wait_items;
  9511:     else if (Array.isArray(payload.reviewWaitItems)) rows = payload.reviewWaitItems;
  9512:     else if (Array.isArray(payload.humanReviewWaitItems)) rows = payload.humanReviewWaitItems;
  9513: 
  9514:     if (!Array.isArray(rows)) rows = [];
  9515: 
  9516:     if (!appState.context || typeof appState.context !== "object") {
  9517:       appState.context = {};
  9518:     }
  9519: 
  9520:     appState.context.review_wait_items = rows;
  9521:     appState.review_wait_items = rows;
  9522: 
  9523:     if (payload.owner_civilization_id) {
  9524:       appState.context.owner_civilization_id = payload.owner_civilization_id;
  9525:       appState.owner_civilization_id = payload.owner_civilization_id;
  9526:     }
  9527: 
  9528:     if (payload.aicm_user_company_id) {
  9529:       appState.context.aicm_user_company_id = payload.aicm_user_company_id;
  9530:       appState.selectedCompanyId = payload.aicm_user_company_id;
  9531:     }
  9532: 
  9533:     if (typeof state !== "undefined" && state && state !== appState) {
  9534:       if (!state.context || typeof state.context !== "object") {
  9535:         state.context = {};
  9536:       }
  9537:       state.context.review_wait_items = rows;
  9538:       state.review_wait_items = rows;
  9539: 
  9540:       if (payload.owner_civilization_id) {
  9541:         state.context.owner_civilization_id = payload.owner_civilization_id;
  9542:         state.owner_civilization_id = payload.owner_civilization_id;
  9543:       }
  9544: 
  9545:       if (payload.aicm_user_company_id) {
  9546:         state.context.aicm_user_company_id = payload.aicm_user_company_id;
  9547:         state.selectedCompanyId = payload.aicm_user_company_id;
  9548:       }
  9549:     }
  9550: 
  9551:     appState.aicmR8zV8gReviewWaitItemsMergedCount = rows.length;
  9552:     return rows;
  9553:   }
  9554:   // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper end
  9555: 
  9556:     appState = appState || {};
  9557:     if (appState.aicmR8zV7Hydrating) return;
  9558:     if (rows(appState).length > 0) return;
  9559: 
  9560:     var owner = ownerId(appState);
  9561:     var company = companyId(appState);
  9562: 
  9563:     if (!owner || !company || typeof fetch !== "function") {
  9564:       appState.aicmR8zV7HydrationError = "missing owner/company owner=" + owner + " company=" + company;
  9565:       return;
  9566:     }
  9567: 
  9568:     appState.aicmR8zV7Hydrating = true;
  9569: 
  9570:     var params = new URLSearchParams();
  9571:     params.set("owner_civilization_id", owner);
  9572:     params.set("aicm_user_company_id", company);
  9573:     params.set("v", "r8z_v7_" + Date.now());
  9574: 
  9575:     fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
  9576:       .then(function (res) {
  9577:         return res.text().then(function (bodyText) {
  9578:           var payload = {};
  9579:           try {
  9580:             payload = bodyText ? JSON.parse(bodyText) : {};
  9581:           } catch (_error) {
  9582:             payload = {};
  9583:           }
  9584: 
  9585:           // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: merge payload review_wait_items into appState/state
  9586:           aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
  9587: 
  9588:           // AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER: force finalizer and one-shot rerender after review_wait_items merge
  9589:           try {
  9590:             if (appState && typeof appState === "object") {
  9591:               appState.aicmR8zV7Hydrating = false;
  9592:               appState.aicmR8zV7HydrationError = "";
  9593:             }
  9594: 
  9595:             if (typeof state !== "undefined" && state && typeof state === "object") {
  9596:               state.aicmR8zV7Hydrating = false;
  9597:               state.aicmR8zV7HydrationError = "";
  9598: 
  9599:               if (appState && appState.review_wait_items && Array.isArray(appState.review_wait_items)) {
  9600:                 state.review_wait_items = appState.review_wait_items;
  9601:               }
  9602: 
  9603:               if (appState && appState.context && typeof appState.context === "object") {
  9604:                 if (!state.context || typeof state.context !== "object") state.context = {};
  9605:                 state.context.review_wait_items = appState.context.review_wait_items || appState.review_wait_items || [];
  9606:               }
  9607:             }
  9608:           } catch (_r8zV8hFinalizeError) {}
  9609: 
  9610:           try {
  9611:             setTimeout(function aicmR8zV8hReviewListRerender() {
  9612:               try {
  9613:                 if (typeof render === "function") {
  9614:                   render();
  9615:                   return;
  9616:                 }
  9617:               } catch (_r8zV8hRenderError) {}
  9618: 
  9619:               try {
  9620:                 if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
  9621:                   window.aicmRender();
  9622:                   return;
  9623:                 }
  9624:               } catch (_r8zV8hWindowRenderError) {}
  9625:             }, 0);
  9626:           } catch (_r8zV8hScheduleError) {}
  9627: 
  9628: 
  9629: 
  9630:           if (res.ok && payload && payload.result === "ok") {
  9631:             normalize(appState, payload);
  9632:           } else {
  9633:             appState.aicmR8zV7HydrationError = payload.error_message || ("context status " + String(res.status));
  9634:           }
  9635:         });
  9636:       })
  9637:       .catch(function (error) {
  9638:         appState.aicmR8zV7HydrationError = String(error && error.message ? error.message : error);
  9639:       })
  9640:       .finally(function () {
  9641:         appState.aicmR8zV7Hydrating = false;
  9642:         if (appState.screen === "review-list") rerender();
  9643:       });
  9644:   }
---- MARKER_BLOCK ----

===== V8G_MARKER_AROUND =====
===== around L9498, range L9453-L9563 =====
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
  9476:     var cid = companyId(appState);
  9477: 
  9478:     var direct = t(appState.selectedCompanyName || c.selectedCompanyName || c.company_name || c.aicm_user_company_name);
  9479:     if (direct) return direct;
  9480: 
  9481:     var companies = Array.isArray(c.companies) ? c.companies : [];
  9482:     for (var i = 0; i < companies.length; i += 1) {
  9483:       var row = companies[i] || {};
  9484:       var id = t(row.aicm_user_company_id || row.company_id || row.id);
  9485:       if (cid && id === cid) return t(row.company_name || row.name || row.display_name) || "選択中";
  9486:     }
  9487:     return "選択中";
  9488:   }
  9489: 
  9490:   function rerender() {
  9491:     if (typeof window.render === "function") return window.render();
  9492:     if (typeof window.renderApp === "function") return window.renderApp();
  9493:     if (typeof window.aicmRender === "function") return window.aicmRender();
  9494:   }
  9495: 
  9496:   function hydrateIfNeeded(appState) {
  9497: 
  9498:   // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper begin
  9499:   function aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload) {
  9500:     appState = appState || {};
  9501:     payload = payload && typeof payload === "object" ? payload : {};
  9502: 
  9503:     var payloadContext = payload.context && typeof payload.context === "object" ? payload.context : {};
  9504:     var payloadData = payload.data && typeof payload.data === "object" ? payload.data : {};
  9505: 
  9506:     var rows = [];
  9507:     if (Array.isArray(payload.review_wait_items)) rows = payload.review_wait_items;
  9508:     else if (Array.isArray(payloadContext.review_wait_items)) rows = payloadContext.review_wait_items;
  9509:     else if (Array.isArray(payloadData.review_wait_items)) rows = payloadData.review_wait_items;
  9510:     else if (Array.isArray(payload.human_review_wait_items)) rows = payload.human_review_wait_items;
  9511:     else if (Array.isArray(payload.reviewWaitItems)) rows = payload.reviewWaitItems;
  9512:     else if (Array.isArray(payload.humanReviewWaitItems)) rows = payload.humanReviewWaitItems;
  9513: 
  9514:     if (!Array.isArray(rows)) rows = [];
  9515: 
  9516:     if (!appState.context || typeof appState.context !== "object") {
  9517:       appState.context = {};
  9518:     }
  9519: 
  9520:     appState.context.review_wait_items = rows;
  9521:     appState.review_wait_items = rows;
  9522: 
  9523:     if (payload.owner_civilization_id) {
  9524:       appState.context.owner_civilization_id = payload.owner_civilization_id;
  9525:       appState.owner_civilization_id = payload.owner_civilization_id;
  9526:     }
  9527: 
  9528:     if (payload.aicm_user_company_id) {
  9529:       appState.context.aicm_user_company_id = payload.aicm_user_company_id;
  9530:       appState.selectedCompanyId = payload.aicm_user_company_id;
  9531:     }
  9532: 
  9533:     if (typeof state !== "undefined" && state && state !== appState) {
  9534:       if (!state.context || typeof state.context !== "object") {
  9535:         state.context = {};
  9536:       }
  9537:       state.context.review_wait_items = rows;
  9538:       state.review_wait_items = rows;
  9539: 
  9540:       if (payload.owner_civilization_id) {
  9541:         state.context.owner_civilization_id = payload.owner_civilization_id;
  9542:         state.owner_civilization_id = payload.owner_civilization_id;
  9543:       }
  9544: 
  9545:       if (payload.aicm_user_company_id) {
  9546:         state.context.aicm_user_company_id = payload.aicm_user_company_id;
  9547:         state.selectedCompanyId = payload.aicm_user_company_id;
  9548:       }
  9549:     }
  9550: 
  9551:     appState.aicmR8zV8gReviewWaitItemsMergedCount = rows.length;
  9552:     return rows;
  9553:   }
  9554:   // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper end
  9555: 
  9556:     appState = appState || {};
  9557:     if (appState.aicmR8zV7Hydrating) return;
  9558:     if (rows(appState).length > 0) return;
  9559: 
  9560:     var owner = ownerId(appState);
  9561:     var company = companyId(appState);
  9562: 
  9563:     if (!owner || !company || typeof fetch !== "function") {

===== V8H_MARKER_AROUND =====
===== around L9588, range L9543-L9653 =====
  9543:       }
  9544: 
  9545:       if (payload.aicm_user_company_id) {
  9546:         state.context.aicm_user_company_id = payload.aicm_user_company_id;
  9547:         state.selectedCompanyId = payload.aicm_user_company_id;
  9548:       }
  9549:     }
  9550: 
  9551:     appState.aicmR8zV8gReviewWaitItemsMergedCount = rows.length;
  9552:     return rows;
  9553:   }
  9554:   // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper end
  9555: 
  9556:     appState = appState || {};
  9557:     if (appState.aicmR8zV7Hydrating) return;
  9558:     if (rows(appState).length > 0) return;
  9559: 
  9560:     var owner = ownerId(appState);
  9561:     var company = companyId(appState);
  9562: 
  9563:     if (!owner || !company || typeof fetch !== "function") {
  9564:       appState.aicmR8zV7HydrationError = "missing owner/company owner=" + owner + " company=" + company;
  9565:       return;
  9566:     }
  9567: 
  9568:     appState.aicmR8zV7Hydrating = true;
  9569: 
  9570:     var params = new URLSearchParams();
  9571:     params.set("owner_civilization_id", owner);
  9572:     params.set("aicm_user_company_id", company);
  9573:     params.set("v", "r8z_v7_" + Date.now());
  9574: 
  9575:     fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
  9576:       .then(function (res) {
  9577:         return res.text().then(function (bodyText) {
  9578:           var payload = {};
  9579:           try {
  9580:             payload = bodyText ? JSON.parse(bodyText) : {};
  9581:           } catch (_error) {
  9582:             payload = {};
  9583:           }
  9584: 
  9585:           // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: merge payload review_wait_items into appState/state
  9586:           aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
  9587: 
  9588:           // AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER: force finalizer and one-shot rerender after review_wait_items merge
  9589:           try {
  9590:             if (appState && typeof appState === "object") {
  9591:               appState.aicmR8zV7Hydrating = false;
  9592:               appState.aicmR8zV7HydrationError = "";
  9593:             }
  9594: 
  9595:             if (typeof state !== "undefined" && state && typeof state === "object") {
  9596:               state.aicmR8zV7Hydrating = false;
  9597:               state.aicmR8zV7HydrationError = "";
  9598: 
  9599:               if (appState && appState.review_wait_items && Array.isArray(appState.review_wait_items)) {
  9600:                 state.review_wait_items = appState.review_wait_items;
  9601:               }
  9602: 
  9603:               if (appState && appState.context && typeof appState.context === "object") {
  9604:                 if (!state.context || typeof state.context !== "object") state.context = {};
  9605:                 state.context.review_wait_items = appState.context.review_wait_items || appState.review_wait_items || [];
  9606:               }
  9607:             }
  9608:           } catch (_r8zV8hFinalizeError) {}
  9609: 
  9610:           try {
  9611:             setTimeout(function aicmR8zV8hReviewListRerender() {
  9612:               try {
  9613:                 if (typeof render === "function") {
  9614:                   render();
  9615:                   return;
  9616:                 }
  9617:               } catch (_r8zV8hRenderError) {}
  9618: 
  9619:               try {
  9620:                 if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
  9621:                   window.aicmRender();
  9622:                   return;
  9623:                 }
  9624:               } catch (_r8zV8hWindowRenderError) {}
  9625:             }, 0);
  9626:           } catch (_r8zV8hScheduleError) {}
  9627: 
  9628: 
  9629: 
  9630:           if (res.ok && payload && payload.result === "ok") {
  9631:             normalize(appState, payload);
  9632:           } else {
  9633:             appState.aicmR8zV7HydrationError = payload.error_message || ("context status " + String(res.status));
  9634:           }
  9635:         });
  9636:       })
  9637:       .catch(function (error) {
  9638:         appState.aicmR8zV7HydrationError = String(error && error.message ? error.message : error);
  9639:       })
  9640:       .finally(function () {
  9641:         appState.aicmR8zV7Hydrating = false;
  9642:         if (appState.screen === "review-list") rerender();
  9643:       });
  9644:   }
  9645: 
  9646:   function statusLabel(row) {
  9647:     var status = first(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
  9648:     if (status === "pending") return "承認待ち";
  9649:     if (status === "approved") return "承認済み";
  9650:     if (status === "returned") return "差し戻し";
  9651:     if (status === "archived") return "アーカイブ";
  9652:     return status;
  9653:   }

============================================================
4. classification
============================================================
ACTIVE_HAS_V8_MARKERS=true
ACTIVE_HAS_REVIEW_MERGE=true
ACTIVE_HAS_RENDER=true
HYDRATE_COUNT=1
V7_RENDER_COUNT=2

============================================================
5. FINAL
============================================================
REVIEW_COUNT=2
ACTIVE_HAS_V8_MARKERS=true
ACTIVE_HAS_REVIEW_MERGE=true
ACTIVE_HAS_RENDER=true
HYDRATE_COUNT=1
V7_RENDER_COUNT=2
PASS_COUNT=6
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=ACTIVE_V7_HAS_MARKERS_NEXT_RUNTIME_DEBUG_FLAG
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8j_v7_marker_execution_position_isolate_20260503_103942/000_R8Z_V8J_V7_MARKER_EXECUTION_POSITION_ISOLATE_REPORT.md
POSITION_REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8j_v7_marker_execution_position_isolate_20260503_103942/020_position_report.txt
V7_ACTIVE_BLOCK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8j_v7_marker_execution_position_isolate_20260503_103942/021_v7_active_render_and_hydrate_block.txt
MARKER_BLOCK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8j_v7_marker_execution_position_isolate_20260503_103942/022_marker_block.txt
HYDRATE_BLOCKS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8j_v7_marker_execution_position_isolate_20260503_103942/023_all_hydrate_blocks.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- PATCH_V8K_MOVE_MERGE_FINALIZER_INTO_ACTIVE_V7_HYDRATE:
  V8G/V8Hは入っているが、active V7 hydrateではない。
  次は active hydrate block に merge/finalizer/rerender を1点追加する。

- PATCH_V8K_ADD_MERGE_TO_ACTIVE_V7_HYDRATE:
  active hydrateにmergeだけ追加。

- PATCH_V8K_ADD_RERENDER_TO_ACTIVE_V7_HYDRATE:
  active hydrateにrerenderだけ追加。

- ACTIVE_V7_HAS_MARKERS_NEXT_RUNTIME_DEBUG_FLAG:
  静的には入っている。次は画面debugにmerged_count/errorを出すだけ。
