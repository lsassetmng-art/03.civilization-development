============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し確認カード

現在位置:
- V10GC3は code 2 で安全停止
- hardcoded next-step label は core に残っている
- ただし <button ...> 形式では検出できなかった
- つまり確認カード生成元の実体を特定する必要がある

今回:
1. syntax確認
2. 「承認を実行する（次工程）」「差し戻しを実行する（次工程）」の実ソース周辺を抽出
3. 直前の関数名 / return / template literal / 配列 / helper呼び出しを確認
4. 次の正本パッチ対象を分類

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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3b_actual_confirm_button_source_shape_20260504_063343
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. extract actual source shape
============================================================
============================================================
LABEL=承認を実行する（次工程）
============================================================
FOUND=true
LABEL_LINE=13593
NEAREST_FUNCTION_LINE=13586
NEAREST_FUNCTION_TEXT=function onFinalConfirmScreen() {
BEFORE_ANCHOR_LINE=13588
BEFORE_ANCHOR_PATTERN=return
BEFORE_ANCHOR_TEXT=return (
AFTER_ANCHOR_LINE=13599
AFTER_ANCHOR_PATTERN=return
AFTER_ANCHOR_TEXT=return "";
lastButtonBefore=-1
nextButtonAfter=-1
lastDisabledBefore=-1
nextDisabledAfter=-1
lastDataCoreBefore=256
nextDataCoreAfter=-1
lastBacktickBefore=-1
nextBacktickAfter=-1
lastReturnBefore=2818
nextReturnAfter=187
lastJoinBefore=-1
nextJoinAfter=-1

---- numbered source window ----
 13503:             if (reviewId) button.setAttribute("data-review-item-id", reviewId);
 13504:             button.textContent = "差し戻しを実行する";
 13505:           }
 13506:         });
 13507:       } catch (_) {}
 13508:     }
 13509: 
 13510:     if (typeof document !== "undefined") {
 13511:       document.addEventListener("click", function(event) {
 13512:         var target = event && event.target;
 13513:         var button = target && target.closest ? target.closest("[data-core-action]") : null;
 13514:         if (!button) return;
 13515: 
 13516:         var action = button.getAttribute("data-core-action") || "";
 13517:         if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;
 13518: 
 13519:         try { event.preventDefault(); } catch (_) {}
 13520:         try { event.stopPropagation(); } catch (_) {}
 13521:         try { event.stopImmediatePropagation(); } catch (_) {}
 13522: 
 13523:         execute(button, action);
 13524:       }, true);
 13525: 
 13526:       document.addEventListener("click", function() {
 13527:         setTimeout(upgradeButtons, 0);
 13528:         setTimeout(upgradeButtons, 250);
 13529:         setTimeout(upgradeButtons, 700);
 13530:       }, true);
 13531:     }
 13532: 
 13533:     var originalRenderV10GC2B = typeof render === "function" ? render : null;
 13534:     if (originalRenderV10GC2B && !originalRenderV10GC2B.__aicmR8zV10gc2bWrapped) {
 13535:       var wrappedRenderV10GC2B = function() {
 13536:         var result = originalRenderV10GC2B.apply(this, arguments);
 13537:         setTimeout(upgradeButtons, 0);
 13538:         setTimeout(upgradeButtons, 250);
 13539:         return result;
 13540:       };
 13541:       wrappedRenderV10GC2B.__aicmR8zV10gc2bWrapped = true;
 13542:       wrappedRenderV10GC2B.__aicmR8zV10gc2bOriginal = originalRenderV10GC2B;
 13543:       render = wrappedRenderV10GC2B;
 13544:     }
 13545: 
 13546:     setTimeout(upgradeButtons, 500);
 13547: 
 13548:     if (typeof window !== "undefined") {
 13549:       window.aicmR8zV10gc2bExecuteReviewDecision = execute;
 13550:       window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
 13551:     }
 13552:   })();
 13553:   // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END
 13554: 
 13555: 
 13556:   // AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_START
 13557:   // Exact final review decision executor.
 13558:   // Uses existing server routes. No server patch.
 13559:   (function installAicmR8zV10gc2jReviewExecuteExactPayloadFix() {
 13560:     var APPROVE_ROUTE = "/api/aicm/v2/human-review/approve";
 13561:     var RETURN_ROUTE = "/api/aicm/v2/human-review/return";
 13562:     var DEV_OWNER_FALLBACK = "00000000-0000-4000-8000-000000000001";
 13563: 
 13564:     function text(value) {
 13565:       return String(value === undefined || value === null ? "" : value).trim();
 13566:     }
 13567: 
 13568:     function isUuid(value) {
 13569:       return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text(value));
 13570:     }
 13571: 
 13572:     function app() {
 13573:       if (typeof state !== "undefined" && state && typeof state === "object") return state;
 13574:       if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
 13575:       return {};
 13576:     }
 13577: 
 13578:     function bodyText() {
 13579:       try {
 13580:         return String(document && document.body ? document.body.innerText || "" : "");
 13581:       } catch (_) {
 13582:         return "";
 13583:       }
 13584:     }
 13585: 
 13586:     function onFinalConfirmScreen() {
 13587:       var b = bodyText();
 13588:       return (
 13589:         b.indexOf("承認前の最終確認") >= 0 ||
 13590:         b.indexOf("差し戻し前の最終確認") >= 0 ||
 13591:         b.indexOf("承認を実行する") >= 0 ||
 13592:         b.indexOf("差し戻しを実行する") >= 0 ||
 13593:         b.indexOf("承認を実行する（次工程）") >= 0 ||
 13594:         b.indexOf("差し戻しを実行する（次工程）") >= 0
 13595:       );
 13596:     }
 13597: 
 13598:     function deepFind(obj, keyCandidates, depth) {
 13599:       if (!obj || typeof obj !== "object" || depth > 7) return "";
 13600: 
 13601:       for (var i = 0; i < keyCandidates.length; i += 1) {
 13602:         var key = keyCandidates[i];
 13603:         if (obj[key] !== undefined && obj[key] !== null && text(obj[key]) !== "") {
 13604:           return text(obj[key]);
 13605:         }
 13606:       }
 13607: 
 13608:       for (var k in obj) {
 13609:         if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
 13610:         if (!/review|item|confirm|selected|detail|owner|civilization|human|reviewer|label|context|state|id|rows|payload/i.test(k)) continue;
 13611: 
 13612:         var nested = deepFind(obj[k], keyCandidates, depth + 1);
 13613:         if (nested) return nested;
 13614:       }
 13615: 
 13616:       return "";
 13617:     }
 13618: 
 13619:     function findReviewId(button) {
 13620:       var fromButton = button ? text(
 13621:         button.getAttribute("data-review-item-id") ||
 13622:         button.getAttribute("data-review-id") ||
 13623:         button.getAttribute("data-aicm-human-review-item-id") ||
 13624:         ""
 13625:       ) : "";
 13626: 
 13627:       if (isUuid(fromButton)) return fromButton;
 13628: 
 13629:       try {
 13630:         var node = document.querySelector("[data-review-item-id],[data-review-id],[data-aicm-human-review-item-id]");
 13631:         if (node) {
 13632:           var fromDom = text(
 13633:             node.getAttribute("data-review-item-id") ||
 13634:             node.getAttribute("data-review-id") ||
 13635:             node.getAttribute("data-aicm-human-review-item-id") ||
 13636:             ""
 13637:           );
 13638:           if (isUuid(fromDom)) return fromDom;
 13639:         }
 13640:       } catch (_) {}
 13641: 
 13642:       var fromState = deepFind(app(), [
 13643:         "aicm_human_review_item_id",
 13644:         "review_item_id",
 13645:         "review_id",
 13646:         "reviewId",
 13647:         "id"
 13648:       ], 0);
 13649: 
 13650:       return isUuid(fromState) ? fromState : "";
 13651:     }
 13652: 
 13653:     function findOwnerCivilizationId() {
 13654:       try {
 13655:         var node = document.querySelector("[data-owner-civilization-id],[data-owner-id]");
 13656:         if (node) {
 13657:           var domOwner = text(node.getAttribute("data-owner-civilization-id") || node.getAttribute("data-owner-id") || "");
 13658:           if (isUuid(domOwner)) return domOwner;
 13659:         }
 13660:       } catch (_) {}
 13661: 
 13662:       var s = app();
 13663: 
 13664:       var fromState = deepFind(s, [
 13665:         "owner_civilization_id",
 13666:         "ownerCivilizationId",
 13667:         "owner_id",
 13668:         "ownerId"
 13669:       ], 0);
 13670: 
 13671:       if (isUuid(fromState)) return fromState;
 13672: 
 13673:       return DEV_OWNER_FALLBACK;
 13674:     }
 13675: 
 13676:     function findReviewerLabel() {
 13677:       try {
 13678:         var node = document.querySelector("[data-human-reviewer-label],[data-reviewer-label]");
 13679:         if (node) {
 13680:           var domReviewer = text(node.getAttribute("data-human-reviewer-label") || node.getAttribute("data-reviewer-label") || "");
 13681:           if (domReviewer) return domReviewer;
 13682:         }
 13683:       } catch (_) {}
 13684: 
 13685:       var fromState = deepFind(app(), [
 13686:         "human_reviewer_label",
 13687:         "humanReviewerLabel",
 13688:         "reviewer_label",
 13689:         "reviewerLabel"
 13690:       ], 0);
 13691: 
 13692:       return fromState || "user";
 13693:     }
 13694: 
 13695:     function noteValue() {
 13696:       try {
 13697:         var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
 13698:         return node ? text(node.value) : "";
 13699:       } catch (_) {
 13700:         return "";
 13701:       }
 13702:     }
 13703: 


============================================================
LABEL=差し戻しを実行する（次工程）
============================================================
FOUND=true
LABEL_LINE=13594
NEAREST_FUNCTION_LINE=13586
NEAREST_FUNCTION_TEXT=function onFinalConfirmScreen() {
BEFORE_ANCHOR_LINE=13588
BEFORE_ANCHOR_PATTERN=return
BEFORE_ANCHOR_TEXT=return (
AFTER_ANCHOR_LINE=13599
AFTER_ANCHOR_PATTERN=return
AFTER_ANCHOR_TEXT=return "";
lastButtonBefore=-1
nextButtonAfter=-1
lastDisabledBefore=-1
nextDisabledAfter=-1
lastDataCoreBefore=214
nextDataCoreAfter=-1
lastBacktickBefore=-1
nextBacktickAfter=-1
lastReturnBefore=2776
nextReturnAfter=145
lastJoinBefore=-1
nextJoinAfter=-1

---- numbered source window ----
 13504:             button.textContent = "差し戻しを実行する";
 13505:           }
 13506:         });
 13507:       } catch (_) {}
 13508:     }
 13509: 
 13510:     if (typeof document !== "undefined") {
 13511:       document.addEventListener("click", function(event) {
 13512:         var target = event && event.target;
 13513:         var button = target && target.closest ? target.closest("[data-core-action]") : null;
 13514:         if (!button) return;
 13515: 
 13516:         var action = button.getAttribute("data-core-action") || "";
 13517:         if (action !== "review-v10gc2b-execute-approved" && action !== "review-v10gc2b-execute-returned") return;
 13518: 
 13519:         try { event.preventDefault(); } catch (_) {}
 13520:         try { event.stopPropagation(); } catch (_) {}
 13521:         try { event.stopImmediatePropagation(); } catch (_) {}
 13522: 
 13523:         execute(button, action);
 13524:       }, true);
 13525: 
 13526:       document.addEventListener("click", function() {
 13527:         setTimeout(upgradeButtons, 0);
 13528:         setTimeout(upgradeButtons, 250);
 13529:         setTimeout(upgradeButtons, 700);
 13530:       }, true);
 13531:     }
 13532: 
 13533:     var originalRenderV10GC2B = typeof render === "function" ? render : null;
 13534:     if (originalRenderV10GC2B && !originalRenderV10GC2B.__aicmR8zV10gc2bWrapped) {
 13535:       var wrappedRenderV10GC2B = function() {
 13536:         var result = originalRenderV10GC2B.apply(this, arguments);
 13537:         setTimeout(upgradeButtons, 0);
 13538:         setTimeout(upgradeButtons, 250);
 13539:         return result;
 13540:       };
 13541:       wrappedRenderV10GC2B.__aicmR8zV10gc2bWrapped = true;
 13542:       wrappedRenderV10GC2B.__aicmR8zV10gc2bOriginal = originalRenderV10GC2B;
 13543:       render = wrappedRenderV10GC2B;
 13544:     }
 13545: 
 13546:     setTimeout(upgradeButtons, 500);
 13547: 
 13548:     if (typeof window !== "undefined") {
 13549:       window.aicmR8zV10gc2bExecuteReviewDecision = execute;
 13550:       window.aicmR8zV10gc2bUpgradeButtons = upgradeButtons;
 13551:     }
 13552:   })();
 13553:   // AICM_R8Z_V10GC2B_REVIEW_EXISTING_ROUTE_DECISION_CORE_END
 13554: 
 13555: 
 13556:   // AICM_R8Z_V10GC2J_REVIEW_EXECUTE_EXACT_PAYLOAD_FIX_START
 13557:   // Exact final review decision executor.
 13558:   // Uses existing server routes. No server patch.
 13559:   (function installAicmR8zV10gc2jReviewExecuteExactPayloadFix() {
 13560:     var APPROVE_ROUTE = "/api/aicm/v2/human-review/approve";
 13561:     var RETURN_ROUTE = "/api/aicm/v2/human-review/return";
 13562:     var DEV_OWNER_FALLBACK = "00000000-0000-4000-8000-000000000001";
 13563: 
 13564:     function text(value) {
 13565:       return String(value === undefined || value === null ? "" : value).trim();
 13566:     }
 13567: 
 13568:     function isUuid(value) {
 13569:       return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text(value));
 13570:     }
 13571: 
 13572:     function app() {
 13573:       if (typeof state !== "undefined" && state && typeof state === "object") return state;
 13574:       if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
 13575:       return {};
 13576:     }
 13577: 
 13578:     function bodyText() {
 13579:       try {
 13580:         return String(document && document.body ? document.body.innerText || "" : "");
 13581:       } catch (_) {
 13582:         return "";
 13583:       }
 13584:     }
 13585: 
 13586:     function onFinalConfirmScreen() {
 13587:       var b = bodyText();
 13588:       return (
 13589:         b.indexOf("承認前の最終確認") >= 0 ||
 13590:         b.indexOf("差し戻し前の最終確認") >= 0 ||
 13591:         b.indexOf("承認を実行する") >= 0 ||
 13592:         b.indexOf("差し戻しを実行する") >= 0 ||
 13593:         b.indexOf("承認を実行する（次工程）") >= 0 ||
 13594:         b.indexOf("差し戻しを実行する（次工程）") >= 0
 13595:       );
 13596:     }
 13597: 
 13598:     function deepFind(obj, keyCandidates, depth) {
 13599:       if (!obj || typeof obj !== "object" || depth > 7) return "";
 13600: 
 13601:       for (var i = 0; i < keyCandidates.length; i += 1) {
 13602:         var key = keyCandidates[i];
 13603:         if (obj[key] !== undefined && obj[key] !== null && text(obj[key]) !== "") {
 13604:           return text(obj[key]);
 13605:         }
 13606:       }
 13607: 
 13608:       for (var k in obj) {
 13609:         if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
 13610:         if (!/review|item|confirm|selected|detail|owner|civilization|human|reviewer|label|context|state|id|rows|payload/i.test(k)) continue;
 13611: 
 13612:         var nested = deepFind(obj[k], keyCandidates, depth + 1);
 13613:         if (nested) return nested;
 13614:       }
 13615: 
 13616:       return "";
 13617:     }
 13618: 
 13619:     function findReviewId(button) {
 13620:       var fromButton = button ? text(
 13621:         button.getAttribute("data-review-item-id") ||
 13622:         button.getAttribute("data-review-id") ||
 13623:         button.getAttribute("data-aicm-human-review-item-id") ||
 13624:         ""
 13625:       ) : "";
 13626: 
 13627:       if (isUuid(fromButton)) return fromButton;
 13628: 
 13629:       try {
 13630:         var node = document.querySelector("[data-review-item-id],[data-review-id],[data-aicm-human-review-item-id]");
 13631:         if (node) {
 13632:           var fromDom = text(
 13633:             node.getAttribute("data-review-item-id") ||
 13634:             node.getAttribute("data-review-id") ||
 13635:             node.getAttribute("data-aicm-human-review-item-id") ||
 13636:             ""
 13637:           );
 13638:           if (isUuid(fromDom)) return fromDom;
 13639:         }
 13640:       } catch (_) {}
 13641: 
 13642:       var fromState = deepFind(app(), [
 13643:         "aicm_human_review_item_id",
 13644:         "review_item_id",
 13645:         "review_id",
 13646:         "reviewId",
 13647:         "id"
 13648:       ], 0);
 13649: 
 13650:       return isUuid(fromState) ? fromState : "";
 13651:     }
 13652: 
 13653:     function findOwnerCivilizationId() {
 13654:       try {
 13655:         var node = document.querySelector("[data-owner-civilization-id],[data-owner-id]");
 13656:         if (node) {
 13657:           var domOwner = text(node.getAttribute("data-owner-civilization-id") || node.getAttribute("data-owner-id") || "");
 13658:           if (isUuid(domOwner)) return domOwner;
 13659:         }
 13660:       } catch (_) {}
 13661: 
 13662:       var s = app();
 13663: 
 13664:       var fromState = deepFind(s, [
 13665:         "owner_civilization_id",
 13666:         "ownerCivilizationId",
 13667:         "owner_id",
 13668:         "ownerId"
 13669:       ], 0);
 13670: 
 13671:       if (isUuid(fromState)) return fromState;
 13672: 
 13673:       return DEV_OWNER_FALLBACK;
 13674:     }
 13675: 
 13676:     function findReviewerLabel() {
 13677:       try {
 13678:         var node = document.querySelector("[data-human-reviewer-label],[data-reviewer-label]");
 13679:         if (node) {
 13680:           var domReviewer = text(node.getAttribute("data-human-reviewer-label") || node.getAttribute("data-reviewer-label") || "");
 13681:           if (domReviewer) return domReviewer;
 13682:         }
 13683:       } catch (_) {}
 13684: 
 13685:       var fromState = deepFind(app(), [
 13686:         "human_reviewer_label",
 13687:         "humanReviewerLabel",
 13688:         "reviewer_label",
 13689:         "reviewerLabel"
 13690:       ], 0);
 13691: 
 13692:       return fromState || "user";
 13693:     }
 13694: 
 13695:     function noteValue() {
 13696:       try {
 13697:         var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
 13698:         return node ? text(node.value) : "";
 13699:       } catch (_) {
 13700:         return "";
 13701:       }
 13702:     }
 13703: 
 13704:     function setMessageSafe(kind, value) {

============================================================
4. classification
============================================================
FINAL_JUDGEMENT=V10GC3B_LABELS_FOUND_NOT_HTML_BUTTON_NEED_HELPER_SOURCE_PATCH
APPROVE_LABEL_LINE=13593
RETURN_LABEL_LINE=13594
LAST_BUTTON_APPROVE=-1
NEXT_BUTTON_APPROVE=-1
NEAREST_FUNCTION_APPROVE=function onFinalConfirmScreen() {
SOURCE_SHAPE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3b_actual_confirm_button_source_shape_20260504_063343/010_actual_confirm_button_source_shape.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3b_actual_confirm_button_source_shape_20260504_063343/000_R8Z_V10GC3B_ACTUAL_CONFIRM_BUTTON_SOURCE_SHAPE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
