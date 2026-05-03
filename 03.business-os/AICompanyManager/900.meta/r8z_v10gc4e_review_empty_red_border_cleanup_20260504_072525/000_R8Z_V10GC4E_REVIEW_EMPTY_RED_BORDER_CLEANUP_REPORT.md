============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- pending 0件時の空状態カード

現在位置:
- レビュー一覧は pending 0件になった
- 旧文言「レビュー待ちが取得できません」は消えた
- ただし空状態カードに赤枠が残り、エラー表示に見える

今回:
1. core/server syntax確認
2. core backup
3. 空状態カード近傍だけを抽出
4. 「レビュー・承認待ちはありません」カード近傍の赤枠styleだけ通常枠へ修正
5. syntax確認
6. server再起動
7. ブラウザ起動

禁止:
- DB write
- API POST
- server patch
- 承認/差し戻しAPI変更
- 課長送信機能への混在修正
- 全画面の赤色style一括置換

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4e_review_empty_red_border_cleanup_20260504_072525
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4e_review_empty_red_border_cleanup_20260504_072525/aicm-production-core.before_v10gc4e.js

============================================================
4. extract empty-state before
============================================================
7292-    try {
7293-      await aicmHumanReviewPostJson("/api/aicm/v2/human-review/approve", {
7294-        owner_civilization_id: aicmHumanReviewOwnerId(),
7295-        aicm_human_review_item_id: reviewId,
7296-        human_reviewer_label: "user",
7297-        human_review_note: ""
7298-      });
7299-
7300-      setMessage("ok", "レビューを承認しました。");
7301-      await aicmHumanReviewReload();
7302-    } catch (error) {
7303-      setMessage("error", error && error.message ? error.message : "承認に失敗しました。");
7304-    }
7305-  }
7306-
7307-  async function returnHumanReviewFromAction(el) {
7308-    var reviewId = el && el.getAttribute ? el.getAttribute("data-review-id") : "";
7309-
7310-    if (!reviewId) {
7311-      setMessage("error", "レビュー項目を特定できません。");
7312-      return;
7313-    }
7314-
7315-    var note = "";
7316-
7317-    try {
7318-      if (typeof window !== "undefined" && window.prompt) {
7319-        note = window.prompt("差し戻し理由を入力してください。", "") || "";
7320-      }
7321-    } catch (_) {}
7322-
7323-    try {
7324-      await aicmHumanReviewPostJson("/api/aicm/v2/human-review/return", {
7325-        owner_civilization_id: aicmHumanReviewOwnerId(),
7326-        aicm_human_review_item_id: reviewId,
7327-        human_reviewer_label: "user",
7328-        human_review_note: note
7329-      });
7330-
7331-      setMessage("ok", "レビューを差し戻しました。");
7332-      await aicmHumanReviewReload();
7333-    } catch (error) {
7334-      setMessage("error", error && error.message ? error.message : "差し戻しに失敗しました。");
7335-    }
7336-  }
7337-
7338-  function renderHumanReviewRows(rows) {
7339-    if (!rows.length) {
7340-      return [
7341-        '<div class="aicm-empty-state">',
7342:        '  <strong>レビュー・承認待ちはありません</strong>',
7343-        '  <p>設計書と実装は、納品時にAIがまとめた要約だけがここに表示されます。</p>',
7344-        '  <p>AIレビューは内部工程で通常通り実施され、ここにはAIレビュー結果の要約だけが出ます。</p>',
7345-        '</div>'
7346-      ].join("");
7347-    }
7348-
7349-    return rows.map(function (row) {
7350-      var id = row.aicm_human_review_item_id || "";
7351-      var title = row.review_title || "レビュー項目";
7352-      var kind = row.review_kind_label || row.review_kind_code || "納品サマリー";
7353-      var artifact = row.artifact_kind_label || row.artifact_kind_code || "";
7354-      var status = row.human_review_status_label || row.human_review_status_code || "承認待ち";
7355-      var company = row.company_name || "";
7356-      var department = row.department_name || "";
7357-      var section = row.section_name || "";
7358-      var aiLabel = row.responsible_ai_label || row.requested_by_ai_label || "";
7359-      var summary = row.delivery_summary_text || "要約未設定";
7360-      var changes = row.main_changes_text || "";
7361-      var aiReview = row.ai_review_result_text || "";
7362-      var unresolved = row.unresolved_issues_text || "";
7363-      var link = row.artifact_link || "";
7364-
7365-      return [
7366-        '<article class="aicm-core-card aicm-review-card">',
7367-        '  <div class="aicm-review-head">',
7368-        '    <div>',
7369-        '      <p class="aicm-eyebrow">' + escapeHtml(kind) + (artifact ? ' / ' + escapeHtml(artifact) : '') + '</p>',
7370-        '      <h2>' + escapeHtml(title) + '</h2>',
7371-        '    </div>',
7372-        '    <span class="aicm-pill">' + escapeHtml(status) + '</span>',
7373-        '  </div>',
7374-        '  <div class="aicm-review-meta">',
7375-        company ? '<span>会社: ' + escapeHtml(company) + '</span>' : '',
7376-        department ? '<span>部門: ' + escapeHtml(department) + '</span>' : '',
7377-        section ? '<span>課: ' + escapeHtml(section) + '</span>' : '',
7378-        aiLabel ? '<span>担当AI: ' + escapeHtml(aiLabel) + '</span>' : '',
7379-        '  </div>',
7380-        '  <section class="aicm-review-summary">',
7381-        '    <h3>納品サマリー</h3>',
7382-        '    <p>' + escapeHtml(summary) + '</p>',
7383-        changes ? '    <h3>主な変更点</h3><p>' + escapeHtml(changes) + '</p>' : '',
7384-        aiReview ? '    <h3>AIレビュー結果</h3><p>' + escapeHtml(aiReview) + '</p>' : '',
7385-        unresolved ? '    <h3>注意点 / 未解決事項</h3><p>' + escapeHtml(unresolved) + '</p>' : '',
7386-        link ? '    <p><a href="' + escapeHtml(link) + '" target="_blank" rel="noopener">成果物を開く</a></p>' : '',
7387-        '  </section>',
7388-        '  <div class="aicm-dashboard-action-row">',
7389-        '    <button type="button" data-core-action="human-review-approve" data-review-id="' + escapeHtml(id) + '">承認</button>',
7390-        '    <button type="button" data-core-action="human-review-return" data-review-id="' + escapeHtml(id) + '">差し戻し</button>',
7391-        '  </div>',
7392-        '</article>'
7393-      ].join("");
7394-    }).join("");
7395-  }
7396-
7397-
7398-  
7399-function renderReviewListPlaceholder() {
7400-
7401-  // AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_START
7402-  var ctx = state && state.context ? state.context : {};
7403-  var rows = [];
7404-
7405-  if (ctx && Array.isArray(ctx.review_wait_items)) {
7406-    rows = ctx.review_wait_items;
7407-  } else if (state && Array.isArray(state.review_wait_items)) {
7408-    rows = state.review_wait_items;
7409-  } else if (ctx && Array.isArray(ctx.human_review_items)) {
7410-    rows = ctx.human_review_items;
7411-  }
7412-
--
7418-
7419-  function r8zV4bEsc(value) {
7420-    if (typeof escapeHtml === "function") return escapeHtml(r8zV4bText(value));
7421-    return r8zV4bText(value)
7422-      .replace(/&/g, "&amp;")
7423-      .replace(/</g, "&lt;")
7424-      .replace(/>/g, "&gt;")
7425-      .replace(/"/g, "&quot;")
7426-      .replace(/'/g, "&#039;");
7427-  }
7428-
7429-  function r8zV4bCompanyName() {
7430-    if (state && state.selectedCompanyName) return state.selectedCompanyName;
7431-    if (ctx && Array.isArray(ctx.companies)) {
7432-      for (var i = 0; i < ctx.companies.length; i += 1) {
7433-        var c = ctx.companies[i] || {};
7434-        var id = r8zV4bText(c.aicm_user_company_id || c.company_id || c.id);
7435-        if (id && id === r8zV4bText(state && state.selectedCompanyId)) {
7436-          return r8zV4bText(c.company_name || c.name || c.display_name, "選択中の会社");
7437-        }
7438-      }
7439-      if (ctx.companies[0]) return r8zV4bText(ctx.companies[0].company_name || ctx.companies[0].name, "選択中の会社");
7440-    }
7441-    return "選択中の会社";
7442-  }
7443-
7444-  function r8zV4bSummary(row) {
7445-    return r8zV4bText(
7446-      row.delivery_summary_text ||
7447-      row.delivery_summary_preview ||
7448-      row.result_summary_text ||
7449-      row.summary_text ||
7450-      row.note,
7451-      "要約未設定"
7452-    );
7453-  }
7454-
7455-  var html = [
7456-    '<section class="aicm-core-card aicm-review-list-card">',
7457-    '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
7458-    '  <h2>納品サマリー確認</h2>',
7459-    '  <div class="aicm-info-box">対象会社: <strong>' + r8zV4bEsc(r8zV4bCompanyName()) + '</strong></div>',
7460-    '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
7461-    '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + r8zV4bEsc(String(rows.length)) + '件</strong></p>',
7462-    '</section>'
7463-  ];
7464-
7465-  if (!rows.length) {
7466-    html.push(
7467-      '<section class="aicm-core-card aicm-empty-card">',
7468:      '  <strong>レビュー・承認待ちはありません</strong>',
7469-      '  <p>設計書と実装は、納品時にAIがまとめた要約だけがここに表示されます。</p>',
7470-      '  <p>AIレビューは内部工程で通常通り実施され、ここにはAIレビュー結果の要約だけが出ます。</p>',
7471-      '</section>'
7472-    );
7473-    return html.join("");
7474-  }
7475-
7476-  html.push('<section class="aicm-core-card aicm-review-list-items">');
7477-  html.push('  <h3>承認待ちサマリー</h3>');
7478-
7479-  rows.forEach(function(row, index) {
7480-    row = row || {};
7481-    var id = r8zV4bText(row.aicm_human_review_item_id || row.review_id || row.id);
7482-    var title = r8zV4bText(row.review_title || row.title, "レビュー項目");
7483-    var kind = r8zV4bText(row.review_kind_label || row.review_kind_code, "納品サマリー");
7484-    var artifact = r8zV4bText(row.artifact_kind_label || row.artifact_kind_code, "delivery_package");
7485-    var status = r8zV4bText(row.human_review_status_label || row.human_review_status_code, "pending");
7486-    var priority = r8zV4bText(row.priority_label || row.priority_code, "-");
7487-    var summary = r8zV4bSummary(row);
7488-    var aiReview = r8zV4bText(row.ai_review_result_text || row.ai_review_summary_text || "");
7489-
7490-    html.push(
7491-      '<article class="aicm-core-card aicm-review-card">',
7492-      '  <div class="aicm-review-head">',
7493-      '    <div>',
7494-      '      <p class="aicm-eyebrow">承認待ち #' + r8zV4bEsc(String(index + 1)) + '</p>',
7495-      '      <h3>' + r8zV4bEsc(title) + '</h3>',
7496-      '    </div>',
7497-      '    <strong>' + r8zV4bEsc(status) + '</strong>',
7498-      '  </div>',
7499-      '  <div class="aicm-review-meta">',
7500-      '    <span>' + r8zV4bEsc(kind) + '</span>',
7501-      '    <span>' + r8zV4bEsc(artifact) + '</span>',
7502-      '    <span>優先度: ' + r8zV4bEsc(priority) + '</span>',
7503-      '  </div>',
7504-      '  <section class="aicm-review-summary">',
7505-      '    <h3>納品サマリー</h3>',
7506-      '    <p>' + r8zV4bEsc(summary) + '</p>',
7507-      aiReview ? '    <h3>AIレビュー要約</h3><p>' + r8zV4bEsc(aiReview) + '</p>' : '',
7508-      '  </section>',
7509-      '  <div class="aicm-dashboard-action-row">',
7510-      '    <button type="button" data-core-action="human-review-approve" data-review-id="' + r8zV4bEsc(id) + '">承認</button>',
7511-      '    <button type="button" data-core-action="human-review-return" data-review-id="' + r8zV4bEsc(id) + '">差し戻し</button>',
7512-      '  </div>',
7513-      '</article>'
7514-    );
7515-  });
7516-
7517-  html.push('</section>');
7518-  return html.join("");
7519-  // AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_END
7520-
7521-}
7522-
7523-
7524-  
7525-
7526-
7527-
7528-// AICM_DEPT_SECTION_EDIT_FORM_WORKER_ROUTE_ASW_ASZ_V1
7529-
7530-
7531-
7532-
7533-
7534-function renderDepartmentEditPlaceholder() {
7535-    var company = aicmAvdCurrentCompany();
7536-    var department = aicmAvdCurrentDepartment(company && company.aicm_user_company_id);
7537-
7538-    if (!company) {
--
10134-          }
10135-
10136-          if (res.ok && payload && payload.result === "ok") {
10137-            r8zV5dNormalizeContext(payload);
10138-          } else {
10139-            state.aicmR8zV5dHydrationError = payload.error_message || ("context status " + String(res.status));
10140-          }
10141-        });
10142-      })
10143-      .catch(function (error) {
10144-        state.aicmR8zV5dHydrationError = String(error && error.message ? error.message : error);
10145-      })
10146-      .finally(function () {
10147-        state.aicmR8zV5dHydrating = false;
10148-        if (state.screen === "review-list") {
10149-          r8zV5dRenderAgain();
10150-        }
10151-      });
10152-  }
10153-
10154-  function r8zV5dStatusLabel(row) {
10155-    var status = r8zV5dFirst(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
10156-    if (status === "pending") return "承認待ち";
10157-    if (status === "approved") return "承認済み";
10158-    if (status === "returned") return "差し戻し";
10159-    if (status === "archived") return "アーカイブ";
10160-    return status;
10161-  }
10162-
10163-  window.renderReviewListPlaceholder = function renderReviewListPlaceholderR8zV5d() {
10164-    var rows = r8zV5dReviewRows();
10165-
10166-    if (!rows.length) {
10167-      r8zV5dHydrateIfNeeded();
10168-    }
10169-
10170-    var html = [
10171-      '<section class="aicm-core-card aicm-review-list-stable-r8z-v5d">',
10172-      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
10173-      '  <h2>納品サマリー確認</h2>',
10174-      '  <p class="aicm-selected-note">対象会社: <strong>' + r8zV5dEscape(r8zV5dCompanyName()) + '</strong></p>',
10175-      '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
10176-      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + r8zV5dEscape(String(rows.length)) + '件</strong></p>'
10177-    ];
10178-
10179-    if (!rows.length) {
10180-      var state = r8zV5dState();
10181-      var err = r8zV5dText(state.aicmR8zV5dHydrationError);
10182-      html.push(
10183-        '  <article class="aicm-core-card">',
10184:        '    <strong>レビュー・承認待ちはありません</strong>',
10185-        '    <p>context反映待ちです。数秒後に再描画されます。</p>',
10186-        err ? '    <p>context error: ' + r8zV5dEscape(err) + '</p>' : '',
10187-        '  </article>',
10188-        '</section>'
10189-      );
10190-      return html.join("");
10191-    }
10192-
10193-    rows.forEach(function (row, index) {
10194-      var id = r8zV5dFirst(row, ["aicm_human_review_item_id", "review_id", "id"], "");
10195-      var title = r8zV5dFirst(row, ["review_title", "title"], "レビュー項目");
10196-      var kind = r8zV5dFirst(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
10197-      var artifact = r8zV5dFirst(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
10198-      var priority = r8zV5dFirst(row, ["priority_label", "priority_code"], "-");
10199-      var summary = r8zV5dFirst(row, [
10200-        "delivery_summary_text",
10201-        "delivery_summary_preview",
10202-        "result_summary_text",
10203-        "ai_review_result_text",
10204-        "review_summary_text",
10205-        "summary"
10206-      ], "要約未設定");
10207-      var requestId = r8zV5dFirst(row, ["source_request_id", "request_id"], "");
10208-      var workerUnitId = r8zV5dFirst(row, ["related_worker_work_unit_id"], "");
10209-
10210-      html.push(
10211-        '  <article class="aicm-core-card aicm-review-card">',
10212-        '    <div class="aicm-review-head">',
10213-        '      <div>',
10214-        '        <p class="aicm-eyebrow">レビュー #' + r8zV5dEscape(String(index + 1)) + '</p>',
10215-        '        <h3>' + r8zV5dEscape(title) + '</h3>',
10216-        '      </div>',
10217-        '      <strong>' + r8zV5dEscape(r8zV5dStatusLabel(row)) + '</strong>',
10218-        '    </div>',
10219-        '    <div class="aicm-review-meta">',
10220-        '      <span>種別: ' + r8zV5dEscape(kind) + '</span>',
10221-        '      <span>成果物: ' + r8zV5dEscape(artifact) + '</span>',
10222-        '      <span>優先度: ' + r8zV5dEscape(priority) + '</span>',
10223-        requestId ? '      <span>request_id: ' + r8zV5dEscape(requestId) + '</span>' : '',
10224-        workerUnitId ? '      <span>worker_unit: ' + r8zV5dEscape(workerUnitId) + '</span>' : '',
10225-        '    </div>',
10226-        '    <section class="aicm-review-summary">',
10227-        '      <h3>納品サマリー</h3>',
10228-        '      <p>' + r8zV5dEscape(summary) + '</p>',
10229-        '    </section>',
10230-        '    <div class="aicm-dashboard-action-row">',
10231-        '      <button type="button" data-core-action="human-review-approve" data-review-id="' + r8zV5dEscape(id) + '">承認</button>',
10232-        '      <button type="button" data-core-action="human-review-return" data-review-id="' + r8zV5dEscape(id) + '">差し戻し</button>',
10233-        '    </div>',
10234-        '  </article>'
10235-      );
10236-    });
10237-
10238-    html.push('</section>');
10239-    return html.join("");
10240-  };
10241-
10242-  window.aicmR8zV5dReviewRows = r8zV5dReviewRows;
10243-  window.aicmR8zV5dHydrateReviewContext = r8zV5dHydrateIfNeeded;
10244-})();
10245-// AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_END
10246-
10247-// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START
10248-(function () {
10249-  "use strict";
10250-
10251-  function t(value) {
10252-    if (value === null || typeof value === "undefined") return "";
10253-    return String(value).trim();
10254-  }
--
10996-            } catch (_) {}
10997-
10998-            try {
10999-              if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
11000-                window.aicmRender();
11001-              }
11002-            } catch (_) {}
11003-          } catch (_) {}
11004-        }, 600);
11005-      } catch (_) {}
11006-    };
11007-
11008-    document.body.appendChild(script);
11009-  }
11010-  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper end
11011-
11012-window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
11013-    appState = appState || {};
11014-    var list = rows(appState);
11015-
11016-    if (!list.length && typeof aicmR8zV9ReviewListScriptHydrate === "function") aicmR8zV9ReviewListScriptHydrate(appState);
11017-    if (!list.length) hydrateIfNeeded(appState);
11018-
11019-    var debug = [
11020-      "selectedCompanyId=" + companyId(appState),
11021-      "owner=" + ownerId(appState),
11022-      "rows=" + String(list.length),
11023-      appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
11024-      appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : "",
11025-      // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: visible debug fields
11026-      "v8k=" + t(appState.aicmR8zV8kDebug || (typeof state !== "undefined" && state ? state.aicmR8zV8kDebug : "") || "none"),
11027-      "payload=" + String(appState.aicmR8zV8kPayloadCount !== undefined ? appState.aicmR8zV8kPayloadCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kPayloadCount !== undefined) ? state.aicmR8zV8kPayloadCount : "na")),
11028-      "merged=" + String(appState.aicmR8zV8kMergedCount !== undefined ? appState.aicmR8zV8kMergedCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kMergedCount !== undefined) ? state.aicmR8zV8kMergedCount : "na")),
11029-      "stRows=" + String(appState.aicmR8zV8kAfterMergeStateRows !== undefined ? appState.aicmR8zV8kAfterMergeStateRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeStateRows !== undefined) ? state.aicmR8zV8kAfterMergeStateRows : "na")),
11030-      "ctxRows=" + String(appState.aicmR8zV8kAfterMergeContextRows !== undefined ? appState.aicmR8zV8kAfterMergeContextRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeContextRows !== undefined) ? state.aicmR8zV8kAfterMergeContextRows : "na")),
11031-      appState.aicmR8zV8kError ? "v8kError=" + t(appState.aicmR8zV8kError) : ""
11032-    ].filter(Boolean).join(" / ");
11033-
11034-    var html = [
11035-      '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
11036-      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
11037-      '  <h2>納品サマリー確認</h2>',
11038-      '  <p class="aicm-selected-note">対象会社: <strong>' + esc(companyName(appState)) + '</strong></p>',
11039-      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + esc(String(list.length)) + '件</strong></p>',
11040-      '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'
11041-    ];
11042-
11043-    if (!list.length) {
11044-      html.push(
11045-        '  <article class="aicm-core-card">',
11046:        '    <strong>レビュー・承認待ちはありません</strong>',
11047-        '    <p>context反映待ちです。数秒後に再描画されます。</p>',
11048-        '  </article>',
11049-        '</section>'
11050-      );
11051-      return html.join("");
11052-    }
11053-
11054-    list.forEach(function (row, index) {
11055-      var id = first(row, ["aicm_human_review_item_id", "review_id", "id"], "");
11056-      var title = first(row, ["review_title", "title"], "レビュー項目");
11057-      var kind = first(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
11058-      var artifact = first(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
11059-      var priority = first(row, ["priority_label", "priority_code"], "-");
11060-      var summary = first(row, [
11061-        "delivery_summary_text",
11062-        "delivery_summary_preview",
11063-        "result_summary_text",
11064-        "ai_review_result_text",
11065-        "review_summary_text",
11066-        "summary"
11067-      ], "要約未設定");
11068-      var requestId = first(row, ["source_request_id", "request_id"], "");
11069-      var workerUnitId = first(row, ["related_worker_work_unit_id"], "");
11070-
11071-      html.push(
11072-        '  <article class="aicm-core-card aicm-review-card">',
11073-        '    <div class="aicm-review-head">',
11074-        '      <div>',
11075-        '        <p class="aicm-eyebrow">レビュー #' + esc(String(index + 1)) + '</p>',
11076-        '        <h3>' + esc(title) + '</h3>',
11077-        '      </div>',
11078-        '      <strong>' + esc(statusLabel(row)) + '</strong>',
11079-        '    </div>',
11080-        '    <div class="aicm-review-meta">',
11081-        '      <span>種別: ' + esc(kind) + '</span>',
11082-        '      <span>成果物: ' + esc(artifact) + '</span>',
11083-        '      <span>優先度: ' + esc(priority) + '</span>',
11084-        requestId ? '      <span>request_id: ' + esc(requestId) + '</span>' : '',
11085-        workerUnitId ? '      <span>worker_unit: ' + esc(workerUnitId) + '</span>' : '',
11086-        '    </div>',
11087-        '    <section class="aicm-review-summary">',
11088-        '      <h3>納品サマリー</h3>',
11089-        '      <p>' + esc(summary) + '</p>',
11090-        '    </section>',
11091-        '    <div class="aicm-dashboard-action-row">',
11092-        '      <button type="button" data-core-action="human-review-approve" data-review-id="' + esc(id) + '">承認</button>',
11093-        '      <button type="button" data-core-action="human-review-return" data-review-id="' + esc(id) + '">差し戻し</button>',
11094-        '    </div>',
11095-        '  </article>'
11096-      );
11097-    });
11098-
11099-    html.push('</section>');
11100-    return html.join("");
11101-  };
11102-})();
11103-
11104-
11105-  // AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER_START
11106-  // Final review-list renderer override. Scope is review-list display only.
11107-  // It does not touch task ledger / leader handoff / delete paths.
11108-  (function installAicmR8zV10cReviewListDirectContextRenderer() {
11109-    function v10cText(value) {
11110-      return String(value === undefined || value === null ? "" : value).trim();
11111-    }
11112-
11113-    function v10cEsc(value) {
11114-      var text = v10cText(value);
11115-      if (typeof escapeHtml === "function") return escapeHtml(text);
11116-      return text
--
11328-        '  <h3>' + v10cEsc(title) + '</h3>',
11329-        summary ? '  <p class="aicm-selected-note">' + v10cEsc(summary) + '</p>' : '',
11330-        aiReview ? '  <p class="aicm-selected-note"><strong>AIレビュー:</strong> ' + v10cEsc(aiReview) + '</p>' : '',
11331-        '  <dl class="aicm-core-detail-list">',
11332-        '    <dt>種別</dt><dd>' + v10cEsc(kind || "-") + '</dd>',
11333-        '    <dt>成果物</dt><dd>' + v10cEsc(artifact || "-") + '</dd>',
11334-        '    <dt>優先度</dt><dd>' + v10cEsc(priority || "-") + '</dd>',
11335-        '    <dt>依頼日時</dt><dd>' + v10cEsc(requested || "-") + '</dd>',
11336-        '    <dt>担当AI</dt><dd>' + v10cEsc(responsible || "-") + '</dd>',
11337-        '    <dt>review_id</dt><dd>' + v10cEsc(reviewId || "-") + '</dd>',
11338-        '  </dl>',
11339-        buttons,
11340-        '</article>'
11341-      ].join("");
11342-    }
11343-
11344-    function v10cRenderReviewList(appState) {
11345-      appState = v10cState(appState);
11346-
11347-      var beforeRows = v10cRows(appState);
11348-      if (!beforeRows.length) {
11349-        v10cSyncFetch(appState);
11350-      }
11351-
11352-      var rows = v10cRows(appState);
11353-      var debug = [
11354-        "V10C",
11355-        "selectedCompanyId=" + v10cCompanyId(appState),
11356-        "owner=" + v10cOwnerId(appState),
11357-        "rows=" + String(rows.length),
11358-        "payloadRows=" + String(appState.aicmR8zV10cPayloadRows !== undefined ? appState.aicmR8zV10cPayloadRows : "na"),
11359-        "http=" + String(appState.aicmR8zV10cHttpStatus !== undefined ? appState.aicmR8zV10cHttpStatus : "na"),
11360-        "status=" + v10cText(appState.aicmR8zV10cFetchStatus || "none"),
11361-        appState.aicmR8zV10cError ? "error=" + v10cText(appState.aicmR8zV10cError) : ""
11362-      ].filter(Boolean).join(" / ");
11363-
11364-      var body = rows.length
11365-        ? [
11366-            '<section class="aicm-core-card">',
11367-            '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
11368-            '  <h2>レビュー・承認待ち: ' + v10cEsc(String(rows.length)) + '件</h2>',
11369-            '  <p class="aicm-selected-note">' + v10cEsc(debug) + '</p>',
11370-            '</section>',
11371-            rows.map(v10cRenderRow).join("")
11372-          ].join("")
11373-        : [
11374-            '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
11375-            '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
11376-            '  <h2>レビュー・承認待ち: 0件</h2>',
11377-            '  <p class="aicm-selected-note">' + v10cEsc(debug) + '</p>',
11378:            '  <p class="aicm-core-message aicm-core-message-error">context APIからレビュー・承認待ちはありませんでした。</p>',
11379-            '  <div class="aicm-dashboard-action-row">',
11380-            '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
11381-            '    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳へ</button>',
11382-            '  </div>',
11383-            '</section>'
11384-          ].join("");
11385-
11386-      if (typeof renderShell === "function") {
11387-        return renderShell(body);
11388-      }
11389-
11390-      return body;
11391-    }
11392-
11393-    if (typeof window !== "undefined") {
11394-      window.aicmR8zV10cRenderReviewList = v10cRenderReviewList;
11395-      window.aicmR8zV7RenderReviewList = v10cRenderReviewList;
11396-    }
11397-  })();
11398-  // AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER_END
11399-
11400-  // AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD_START
11401-  // Review artifact detail card. Scope: review-list only. No DB write / no API POST.
11402-  (function installAicmR8zV10dReviewArtifactDetailCard() {
11403-    function t(value) {
11404-      return String(value === undefined || value === null ? "" : value).trim();
11405-    }
11406-
11407-    function esc(value) {
11408-      var text = t(value);
11409-      if (typeof escapeHtml === "function") return escapeHtml(text);
11410-      return text
11411-        .replace(/&/g, "&amp;")
11412-        .replace(/</g, "&lt;")
11413-        .replace(/>/g, "&gt;")
11414-        .replace(/"/g, "&quot;")
11415-        .replace(/'/g, "&#039;");
11416-    }
11417-
11418-    function app(appState) {
11419-      if (appState && typeof appState === "object") return appState;
11420-      if (typeof state !== "undefined" && state && typeof state === "object") return state;
11421-      return {};
11422-    }
11423-
11424-    function ctx(appState) {
11425-      appState = app(appState);
11426-      if (!appState.context || typeof appState.context !== "object") appState.context = {};
11427-      return appState.context;
11428-    }
11429-
11430-    function ownerId(appState) {
11431-      appState = app(appState);
11432-      var c = ctx(appState);
11433-      return t(appState.owner_civilization_id || appState.ownerCivilizationId || c.owner_civilization_id || c.ownerCivilizationId || "00000000-0000-4000-8000-000000000001");
11434-    }
11435-
11436-    function companyId(appState) {
11437-      appState = app(appState);
11438-      var c = ctx(appState);
11439-      return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id || "");
11440-    }
11441-
11442-    function rowsFromPayload(payload) {
11443-      payload = payload && typeof payload === "object" ? payload : {};
11444-      var candidates = [
11445-        payload.review_wait_items,
11446-        payload.human_review_wait_items,
11447-        payload.humanReviewWaitItems,
11448-        payload.context && payload.context.review_wait_items,
--
11746-        summary ? '  <p class="aicm-selected-note">' + esc(summary) + '</p>' : '',
11747-        '  <dl class="aicm-core-detail-list">',
11748-        renderField("種別", row.review_kind_label || row.review_kind_code),
11749-        renderField("成果物", row.artifact_kind_label || row.artifact_kind_code),
11750-        renderField("優先度", row.priority_code),
11751-        renderField("依頼日時", row.requested_at || row.created_at),
11752-        renderField("review_id", id),
11753-        '  </dl>',
11754-        '  <div class="aicm-dashboard-action-row">',
11755-        '    <button type="button" data-core-action="review-v10d-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
11756-        '  </div>',
11757-        '</article>'
11758-      ].join("");
11759-    }
11760-
11761-    function renderReviewList(appState) {
11762-      appState = app(appState);
11763-
11764-      if (!rows(appState).length) {
11765-        syncFetch(appState);
11766-      }
11767-
11768-      var r = rows(appState);
11769-      var currentId = selectedReviewId(appState);
11770-
11771-      var debug = [
11772-        "V10D",
11773-        "selectedCompanyId=" + companyId(appState),
11774-        "owner=" + ownerId(appState),
11775-        "rows=" + String(r.length),
11776-        "payloadRows=" + String(appState.aicmR8zV10dPayloadRows !== undefined ? appState.aicmR8zV10dPayloadRows : "na"),
11777-        "http=" + String(appState.aicmR8zV10dHttpStatus !== undefined ? appState.aicmR8zV10dHttpStatus : "na"),
11778-        "status=" + t(appState.aicmR8zV10dFetchStatus || "context"),
11779-        currentId ? "selectedReviewId=" + currentId : "",
11780-        appState.aicmR8zV10dError ? "error=" + t(appState.aicmR8zV10dError) : ""
11781-      ].filter(Boolean).join(" / ");
11782-
11783-      var body = [
11784-        '<section class="aicm-core-card">',
11785-        '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
11786-        '  <h2>レビュー・承認待ち: ' + esc(String(r.length)) + '件</h2>',
11787-        '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
11788-        '  <p class="aicm-selected-note">成果物を確認してから、次工程で承認/差し戻しを行います。</p>',
11789-        '</section>',
11790-        renderDetailCard(appState),
11791-        renderPreviewDecisionCard(appState),
11792-        r.length
11793-          ? r.map(function(row, index) { return renderListRow(row, index, currentId); }).join("")
11794-          : [
11795-              '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
11796:              '  <h3>レビュー・承認待ちはありません</h3>',
11797-              '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
11798-              '</section>'
11799-            ].join("")
11800-      ].join("");
11801-
11802-      if (typeof renderShell === "function") return renderShell(body);
11803-      return body;
11804-    }
11805-
11806-    function rerender() {
11807-      try {
11808-        if (typeof render === "function") {
11809-          render();
11810-          return;
11811-        }
11812-      } catch (_) {}
11813-
11814-      try {
11815-        if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
11816-          window.aicmRender();
11817-        }
11818-      } catch (_) {}
11819-    }
11820-
11821-    function setDetail(id) {
11822-      var s = app();
11823-      s.aicmR8zV10dSelectedReviewId = t(id);
11824-      s.aicmR8zV10dDecisionPreviewMode = "";
11825-      rerender();
11826-    }
11827-
11828-    function closeDetail() {
11829-      var s = app();
11830-      s.aicmR8zV10dSelectedReviewId = "";
11831-      s.aicmR8zV10dDecisionPreviewMode = "";
11832-      rerender();
11833-    }
11834-
11835-    function previewDecision(mode, id) {
11836-      var s = app();
11837-      s.aicmR8zV10dSelectedReviewId = t(id) || selectedReviewId(s);
11838-      s.aicmR8zV10dDecisionPreviewMode = mode;
11839-      rerender();
11840-    }
11841-
11842-    function clearPreview() {
11843-      var s = app();
11844-      s.aicmR8zV10dDecisionPreviewMode = "";
11845-      rerender();
11846-    }
11847-
11848-    function installClickBridge() {
11849-      if (typeof document === "undefined" || document.__aicmR8zV10dReviewDetailClickBridge) return;
11850-      document.__aicmR8zV10dReviewDetailClickBridge = true;
11851-
11852-      document.addEventListener("click", function(event) {
11853-        var target = event.target;
11854-        while (target && target !== document && !target.getAttribute("data-core-action")) {
11855-          target = target.parentNode;
11856-        }
11857-
11858-        if (!target || target === document) return;
11859-
11860-        var action = target.getAttribute("data-core-action");
11861-        if (!action || action.indexOf("review-v10d-") !== 0) return;
11862-
11863-        event.preventDefault();
11864-        event.stopPropagation();
11865-
11866-        var id = target.getAttribute("data-review-id") || target.getAttribute("data-human-review-id") || "";
--
12207-        '<article class="aicm-core-card" style="' + (selected ? 'border:2px solid #f59e0b;' : 'border:1px solid #dbeafe;') + '">',
12208-        '  <p class="aicm-eyebrow">レビュー待ち #' + esc(String(index + 1)) + '</p>',
12209-        '  <h3>' + esc(title) + '</h3>',
12210-        summary ? '  <p class="aicm-selected-note">' + esc(summary) + '</p>' : '',
12211-        '  <dl class="aicm-core-detail-list">',
12212-        renderField("種別", row.review_kind_label || row.review_kind_code),
12213-        renderField("成果物", row.artifact_kind_label || row.artifact_kind_code),
12214-        renderField("優先度", row.priority_code),
12215-        renderField("依頼日時", row.requested_at || row.created_at),
12216-        renderField("review_id", id),
12217-        '  </dl>',
12218-        '  <div class="aicm-dashboard-action-row">',
12219-        '    <button type="button" data-core-action="review-v10d2-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
12220-        '  </div>',
12221-        '</article>',
12222-        selected ? renderInlineDetail(row) + renderPreview(appState, row) : ''
12223-      ].join("");
12224-    }
12225-
12226-    function renderReviewList(appState) {
12227-      appState = app(appState);
12228-
12229-      if (!rows(appState).length) syncFetch(appState);
12230-
12231-      var r = rows(appState);
12232-      var currentId = selectedReviewId(appState);
12233-
12234-      var debug = [
12235-        "V10D2",
12236-        "selectedCompanyId=" + companyId(appState),
12237-        "owner=" + ownerId(appState),
12238-        "rows=" + String(r.length),
12239-        "payloadRows=" + String(appState.aicmR8zV10d2PayloadRows !== undefined ? appState.aicmR8zV10d2PayloadRows : "na"),
12240-        "http=" + String(appState.aicmR8zV10d2HttpStatus !== undefined ? appState.aicmR8zV10d2HttpStatus : "na"),
12241-        "status=" + t(appState.aicmR8zV10d2FetchStatus || "context"),
12242-        currentId ? "selectedReviewId=" + currentId : "",
12243-        appState.aicmR8zV10d2Error ? "error=" + t(appState.aicmR8zV10d2Error) : ""
12244-      ].filter(Boolean).join(" / ");
12245-
12246-      var body = [
12247-        '<section class="aicm-core-card">',
12248-        '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
12249-        '  <h2>レビュー・承認待ち: ' + esc(String(r.length)) + '件</h2>',
12250-        '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
12251-        '  <p class="aicm-selected-note">「成果物を確認」を押すと、その項目の直下に詳細カードを表示します。</p>',
12252-        '</section>',
12253-        r.length
12254-          ? r.map(function(row, index) { return renderListRow(appState, row, index, currentId); }).join("")
12255-          : [
12256-              '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
12257:              '  <h3>レビュー・承認待ちはありません</h3>',
12258-              '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
12259-              '</section>'
12260-            ].join("")
12261-      ].join("");
12262-
12263-      if (typeof renderShell === "function") return renderShell(body);
12264-      return body;
12265-    }
12266-
12267-    function rerenderAndScroll(id) {
12268-      try {
12269-        if (typeof render === "function") render();
12270-        else if (typeof window !== "undefined" && typeof window.aicmRender === "function") window.aicmRender();
12271-      } catch (_) {}
12272-
12273-      if (!id || typeof document === "undefined") return;
12274-
12275-      setTimeout(function() {
12276-        try {
12277-          var el = document.getElementById("aicm-v10d2-detail-" + id);
12278-          if (el && typeof el.scrollIntoView === "function") {
12279-            el.scrollIntoView({ behavior: "smooth", block: "start" });
12280-          }
12281-        } catch (_) {}
12282-      }, 80);
12283-    }
12284-
12285-    function setDetail(id) {
12286-      var s = app();
12287-      s.aicmR8zV10d2SelectedReviewId = t(id);
12288-      s.aicmR8zV10dSelectedReviewId = t(id);
12289-      s.aicmR8zV10d2DecisionPreviewMode = "";
12290-      rerenderAndScroll(t(id));
12291-    }
12292-
12293-    function closeDetail() {
12294-      var s = app();
12295-      s.aicmR8zV10d2SelectedReviewId = "";
12296-      s.aicmR8zV10dSelectedReviewId = "";
12297-      s.aicmR8zV10d2DecisionPreviewMode = "";
12298-      rerenderAndScroll("");
12299-    }
12300-
12301-    function preview(mode, id) {
12302-      var s = app();
12303-      s.aicmR8zV10d2SelectedReviewId = t(id) || selectedReviewId(s);
12304-      s.aicmR8zV10dSelectedReviewId = s.aicmR8zV10d2SelectedReviewId;
12305-      s.aicmR8zV10d2DecisionPreviewMode = mode;
12306-      rerenderAndScroll(s.aicmR8zV10d2SelectedReviewId);
12307-    }
12308-
12309-    function clearPreview() {
12310-      var s = app();
12311-      s.aicmR8zV10d2DecisionPreviewMode = "";
12312-      rerenderAndScroll(selectedReviewId(s));
12313-    }
12314-
12315-    function installClickBridge() {
12316-      if (typeof document === "undefined" || document.__aicmR8zV10d2InlineDetailClickBridge) return;
12317-      document.__aicmR8zV10d2InlineDetailClickBridge = true;
12318-
12319-      document.addEventListener("click", function(event) {
12320-        var target = event.target;
12321-        while (target && target !== document && !(target.getAttribute && target.getAttribute("data-core-action"))) {
12322-          target = target.parentNode;
12323-        }
12324-
12325-        if (!target || target === document || !(target.getAttribute)) return;
12326-
12327-        var action = target.getAttribute("data-core-action");

============================================================
5. patch empty-state red border only
============================================================
REMOVED_AICM_R8Z_V10GC4E_REVIEW_EMPTY_RED_BORDER_CLEANUP=false

BEFORE_V10GC4E_MARKER_COUNT=0
BEFORE_BAD_EMPTY_TEXT_COUNT=0
BEFORE_GOOD_EMPTY_TEXT_COUNT=7
BEFORE_RED_BORDER_EF_COUNT=00
BEFORE_RED_BORDER_DC_COUNT=00
PATCHED_WINDOWS=3
AFTER_V10GC4E_MARKER_COUNT=2
AFTER_BAD_EMPTY_TEXT_COUNT=0
AFTER_GOOD_EMPTY_TEXT_COUNT=7
AFTER_RED_BORDER_EF_COUNT=00
AFTER_RED_BORDER_DC_COUNT=00
PATCH_CHANGED=true
PATCH_DECISION=PATCH_APPLIED

============================================================
6. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
7. extract empty-state after
============================================================
7292-    try {
7293-      await aicmHumanReviewPostJson("/api/aicm/v2/human-review/approve", {
7294-        owner_civilization_id: aicmHumanReviewOwnerId(),
7295-        aicm_human_review_item_id: reviewId,
7296-        human_reviewer_label: "user",
7297-        human_review_note: ""
7298-      });
7299-
7300-      setMessage("ok", "レビューを承認しました。");
7301-      await aicmHumanReviewReload();
7302-    } catch (error) {
7303-      setMessage("error", error && error.message ? error.message : "承認に失敗しました。");
7304-    }
7305-  }
7306-
7307-  async function returnHumanReviewFromAction(el) {
7308-    var reviewId = el && el.getAttribute ? el.getAttribute("data-review-id") : "";
7309-
7310-    if (!reviewId) {
7311-      setMessage("error", "レビュー項目を特定できません。");
7312-      return;
7313-    }
7314-
7315-    var note = "";
7316-
7317-    try {
7318-      if (typeof window !== "undefined" && window.prompt) {
7319-        note = window.prompt("差し戻し理由を入力してください。", "") || "";
7320-      }
7321-    } catch (_) {}
7322-
7323-    try {
7324-      await aicmHumanReviewPostJson("/api/aicm/v2/human-review/return", {
7325-        owner_civilization_id: aicmHumanReviewOwnerId(),
7326-        aicm_human_review_item_id: reviewId,
7327-        human_reviewer_label: "user",
7328-        human_review_note: note
7329-      });
7330-
7331-      setMessage("ok", "レビューを差し戻しました。");
7332-      await aicmHumanReviewReload();
7333-    } catch (error) {
7334-      setMessage("error", error && error.message ? error.message : "差し戻しに失敗しました。");
7335-    }
7336-  }
7337-
7338-  function renderHumanReviewRows(rows) {
7339-    if (!rows.length) {
7340-      return [
7341-        '<div class="aicm-empty-state">',
7342:        '  <strong>レビュー・承認待ちはありません</strong>',
7343-        '  <p>設計書と実装は、納品時にAIがまとめた要約だけがここに表示されます。</p>',
7344-        '  <p>AIレビューは内部工程で通常通り実施され、ここにはAIレビュー結果の要約だけが出ます。</p>',
7345-        '</div>'
7346-      ].join("");
7347-    }
7348-
7349-    return rows.map(function (row) {
7350-      var id = row.aicm_human_review_item_id || "";
7351-      var title = row.review_title || "レビュー項目";
7352-      var kind = row.review_kind_label || row.review_kind_code || "納品サマリー";
7353-      var artifact = row.artifact_kind_label || row.artifact_kind_code || "";
7354-      var status = row.human_review_status_label || row.human_review_status_code || "承認待ち";
7355-      var company = row.company_name || "";
7356-      var department = row.department_name || "";
7357-      var section = row.section_name || "";
7358-      var aiLabel = row.responsible_ai_label || row.requested_by_ai_label || "";
7359-      var summary = row.delivery_summary_text || "要約未設定";
7360-      var changes = row.main_changes_text || "";
7361-      var aiReview = row.ai_review_result_text || "";
7362-      var unresolved = row.unresolved_issues_text || "";
7363-      var link = row.artifact_link || "";
7364-
7365-      return [
7366-        '<article class="aicm-core-card aicm-review-card">',
7367-        '  <div class="aicm-review-head">',
7368-        '    <div>',
7369-        '      <p class="aicm-eyebrow">' + escapeHtml(kind) + (artifact ? ' / ' + escapeHtml(artifact) : '') + '</p>',
7370-        '      <h2>' + escapeHtml(title) + '</h2>',
7371-        '    </div>',
7372-        '    <span class="aicm-pill">' + escapeHtml(status) + '</span>',
7373-        '  </div>',
7374-        '  <div class="aicm-review-meta">',
7375-        company ? '<span>会社: ' + escapeHtml(company) + '</span>' : '',
7376-        department ? '<span>部門: ' + escapeHtml(department) + '</span>' : '',
7377-        section ? '<span>課: ' + escapeHtml(section) + '</span>' : '',
7378-        aiLabel ? '<span>担当AI: ' + escapeHtml(aiLabel) + '</span>' : '',
7379-        '  </div>',
7380-        '  <section class="aicm-review-summary">',
7381-        '    <h3>納品サマリー</h3>',
7382-        '    <p>' + escapeHtml(summary) + '</p>',
7383-        changes ? '    <h3>主な変更点</h3><p>' + escapeHtml(changes) + '</p>' : '',
7384-        aiReview ? '    <h3>AIレビュー結果</h3><p>' + escapeHtml(aiReview) + '</p>' : '',
7385-        unresolved ? '    <h3>注意点 / 未解決事項</h3><p>' + escapeHtml(unresolved) + '</p>' : '',
7386-        link ? '    <p><a href="' + escapeHtml(link) + '" target="_blank" rel="noopener">成果物を開く</a></p>' : '',
7387-        '  </section>',
7388-        '  <div class="aicm-dashboard-action-row">',
7389-        '    <button type="button" data-core-action="human-review-approve" data-review-id="' + escapeHtml(id) + '">承認</button>',
7390-        '    <button type="button" data-core-action="human-review-return" data-review-id="' + escapeHtml(id) + '">差し戻し</button>',
7391-        '  </div>',
7392-        '</article>'
7393-      ].join("");
7394-    }).join("");
7395-  }
7396-
7397-
7398-  
7399-function renderReviewListPlaceholder() {
7400-
7401-  // AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_START
7402-  var ctx = state && state.context ? state.context : {};
7403-  var rows = [];
7404-
7405-  if (ctx && Array.isArray(ctx.review_wait_items)) {
7406-    rows = ctx.review_wait_items;
7407-  } else if (state && Array.isArray(state.review_wait_items)) {
7408-    rows = state.review_wait_items;
7409-  } else if (ctx && Array.isArray(ctx.human_review_items)) {
7410-    rows = ctx.human_review_items;
7411-  }
7412-
--
7418-
7419-  function r8zV4bEsc(value) {
7420-    if (typeof escapeHtml === "function") return escapeHtml(r8zV4bText(value));
7421-    return r8zV4bText(value)
7422-      .replace(/&/g, "&amp;")
7423-      .replace(/</g, "&lt;")
7424-      .replace(/>/g, "&gt;")
7425-      .replace(/"/g, "&quot;")
7426-      .replace(/'/g, "&#039;");
7427-  }
7428-
7429-  function r8zV4bCompanyName() {
7430-    if (state && state.selectedCompanyName) return state.selectedCompanyName;
7431-    if (ctx && Array.isArray(ctx.companies)) {
7432-      for (var i = 0; i < ctx.companies.length; i += 1) {
7433-        var c = ctx.companies[i] || {};
7434-        var id = r8zV4bText(c.aicm_user_company_id || c.company_id || c.id);
7435-        if (id && id === r8zV4bText(state && state.selectedCompanyId)) {
7436-          return r8zV4bText(c.company_name || c.name || c.display_name, "選択中の会社");
7437-        }
7438-      }
7439-      if (ctx.companies[0]) return r8zV4bText(ctx.companies[0].company_name || ctx.companies[0].name, "選択中の会社");
7440-    }
7441-    return "選択中の会社";
7442-  }
7443-
7444-  function r8zV4bSummary(row) {
7445-    return r8zV4bText(
7446-      row.delivery_summary_text ||
7447-      row.delivery_summary_preview ||
7448-      row.result_summary_text ||
7449-      row.summary_text ||
7450-      row.note,
7451-      "要約未設定"
7452-    );
7453-  }
7454-
7455-  var html = [
7456-    '<section class="aicm-core-card aicm-review-list-card">',
7457-    '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
7458-    '  <h2>納品サマリー確認</h2>',
7459-    '  <div class="aicm-info-box">対象会社: <strong>' + r8zV4bEsc(r8zV4bCompanyName()) + '</strong></div>',
7460-    '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
7461-    '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + r8zV4bEsc(String(rows.length)) + '件</strong></p>',
7462-    '</section>'
7463-  ];
7464-
7465-  if (!rows.length) {
7466-    html.push(
7467-      '<section class="aicm-core-card aicm-empty-card">',
7468:      '  <strong>レビュー・承認待ちはありません</strong>',
7469-      '  <p>設計書と実装は、納品時にAIがまとめた要約だけがここに表示されます。</p>',
7470-      '  <p>AIレビューは内部工程で通常通り実施され、ここにはAIレビュー結果の要約だけが出ます。</p>',
7471-      '</section>'
7472-    );
7473-    return html.join("");
7474-  }
7475-
7476-  html.push('<section class="aicm-core-card aicm-review-list-items">');
7477-  html.push('  <h3>承認待ちサマリー</h3>');
7478-
7479-  rows.forEach(function(row, index) {
7480-    row = row || {};
7481-    var id = r8zV4bText(row.aicm_human_review_item_id || row.review_id || row.id);
7482-    var title = r8zV4bText(row.review_title || row.title, "レビュー項目");
7483-    var kind = r8zV4bText(row.review_kind_label || row.review_kind_code, "納品サマリー");
7484-    var artifact = r8zV4bText(row.artifact_kind_label || row.artifact_kind_code, "delivery_package");
7485-    var status = r8zV4bText(row.human_review_status_label || row.human_review_status_code, "pending");
7486-    var priority = r8zV4bText(row.priority_label || row.priority_code, "-");
7487-    var summary = r8zV4bSummary(row);
7488-    var aiReview = r8zV4bText(row.ai_review_result_text || row.ai_review_summary_text || "");
7489-
7490-    html.push(
7491-      '<article class="aicm-core-card aicm-review-card">',
7492-      '  <div class="aicm-review-head">',
7493-      '    <div>',
7494-      '      <p class="aicm-eyebrow">承認待ち #' + r8zV4bEsc(String(index + 1)) + '</p>',
7495-      '      <h3>' + r8zV4bEsc(title) + '</h3>',
7496-      '    </div>',
7497-      '    <strong>' + r8zV4bEsc(status) + '</strong>',
7498-      '  </div>',
7499-      '  <div class="aicm-review-meta">',
7500-      '    <span>' + r8zV4bEsc(kind) + '</span>',
7501-      '    <span>' + r8zV4bEsc(artifact) + '</span>',
7502-      '    <span>優先度: ' + r8zV4bEsc(priority) + '</span>',
7503-      '  </div>',
7504-      '  <section class="aicm-review-summary">',
7505-      '    <h3>納品サマリー</h3>',
7506-      '    <p>' + r8zV4bEsc(summary) + '</p>',
7507-      aiReview ? '    <h3>AIレビュー要約</h3><p>' + r8zV4bEsc(aiReview) + '</p>' : '',
7508-      '  </section>',
7509-      '  <div class="aicm-dashboard-action-row">',
7510-      '    <button type="button" data-core-action="human-review-approve" data-review-id="' + r8zV4bEsc(id) + '">承認</button>',
7511-      '    <button type="button" data-core-action="human-review-return" data-review-id="' + r8zV4bEsc(id) + '">差し戻し</button>',
7512-      '  </div>',
7513-      '</article>'
7514-    );
7515-  });
7516-
7517-  html.push('</section>');
7518-  return html.join("");
7519-  // AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_END
7520-
7521-}
7522-
7523-
7524-  
7525-
7526-
7527-
7528-// AICM_DEPT_SECTION_EDIT_FORM_WORKER_ROUTE_ASW_ASZ_V1
7529-
7530-
7531-
7532-
7533-
7534-function renderDepartmentEditPlaceholder() {
7535-    var company = aicmAvdCurrentCompany();
7536-    var department = aicmAvdCurrentDepartment(company && company.aicm_user_company_id);
7537-
7538-    if (!company) {
--
10134-          }
10135-
10136-          if (res.ok && payload && payload.result === "ok") {
10137-            r8zV5dNormalizeContext(payload);
10138-          } else {
10139-            state.aicmR8zV5dHydrationError = payload.error_message || ("context status " + String(res.status));
10140-          }
10141-        });
10142-      })
10143-      .catch(function (error) {
10144-        state.aicmR8zV5dHydrationError = String(error && error.message ? error.message : error);
10145-      })
10146-      .finally(function () {
10147-        state.aicmR8zV5dHydrating = false;
10148-        if (state.screen === "review-list") {
10149-          r8zV5dRenderAgain();
10150-        }
10151-      });
10152-  }
10153-
10154-  function r8zV5dStatusLabel(row) {
10155-    var status = r8zV5dFirst(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
10156-    if (status === "pending") return "承認待ち";
10157-    if (status === "approved") return "承認済み";
10158-    if (status === "returned") return "差し戻し";
10159-    if (status === "archived") return "アーカイブ";
10160-    return status;
10161-  }
10162-
10163-  window.renderReviewListPlaceholder = function renderReviewListPlaceholderR8zV5d() {
10164-    var rows = r8zV5dReviewRows();
10165-
10166-    if (!rows.length) {
10167-      r8zV5dHydrateIfNeeded();
10168-    }
10169-
10170-    var html = [
10171-      '<section class="aicm-core-card aicm-review-list-stable-r8z-v5d">',
10172-      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
10173-      '  <h2>納品サマリー確認</h2>',
10174-      '  <p class="aicm-selected-note">対象会社: <strong>' + r8zV5dEscape(r8zV5dCompanyName()) + '</strong></p>',
10175-      '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
10176-      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + r8zV5dEscape(String(rows.length)) + '件</strong></p>'
10177-    ];
10178-
10179-    if (!rows.length) {
10180-      var state = r8zV5dState();
10181-      var err = r8zV5dText(state.aicmR8zV5dHydrationError);
10182-      html.push(
10183-        '  <article class="aicm-core-card">',
10184:        '    <strong>レビュー・承認待ちはありません</strong>',
10185-        '    <p>context反映待ちです。数秒後に再描画されます。</p>',
10186-        err ? '    <p>context error: ' + r8zV5dEscape(err) + '</p>' : '',
10187-        '  </article>',
10188-        '</section>'
10189-      );
10190-      return html.join("");
10191-    }
10192-
10193-    rows.forEach(function (row, index) {
10194-      var id = r8zV5dFirst(row, ["aicm_human_review_item_id", "review_id", "id"], "");
10195-      var title = r8zV5dFirst(row, ["review_title", "title"], "レビュー項目");
10196-      var kind = r8zV5dFirst(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
10197-      var artifact = r8zV5dFirst(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
10198-      var priority = r8zV5dFirst(row, ["priority_label", "priority_code"], "-");
10199-      var summary = r8zV5dFirst(row, [
10200-        "delivery_summary_text",
10201-        "delivery_summary_preview",
10202-        "result_summary_text",
10203-        "ai_review_result_text",
10204-        "review_summary_text",
10205-        "summary"
10206-      ], "要約未設定");
10207-      var requestId = r8zV5dFirst(row, ["source_request_id", "request_id"], "");
10208-      var workerUnitId = r8zV5dFirst(row, ["related_worker_work_unit_id"], "");
10209-
10210-      html.push(
10211-        '  <article class="aicm-core-card aicm-review-card">',
10212-        '    <div class="aicm-review-head">',
10213-        '      <div>',
10214-        '        <p class="aicm-eyebrow">レビュー #' + r8zV5dEscape(String(index + 1)) + '</p>',
10215-        '        <h3>' + r8zV5dEscape(title) + '</h3>',
10216-        '      </div>',
10217-        '      <strong>' + r8zV5dEscape(r8zV5dStatusLabel(row)) + '</strong>',
10218-        '    </div>',
10219-        '    <div class="aicm-review-meta">',
10220-        '      <span>種別: ' + r8zV5dEscape(kind) + '</span>',
10221-        '      <span>成果物: ' + r8zV5dEscape(artifact) + '</span>',
10222-        '      <span>優先度: ' + r8zV5dEscape(priority) + '</span>',
10223-        requestId ? '      <span>request_id: ' + r8zV5dEscape(requestId) + '</span>' : '',
10224-        workerUnitId ? '      <span>worker_unit: ' + r8zV5dEscape(workerUnitId) + '</span>' : '',
10225-        '    </div>',
10226-        '    <section class="aicm-review-summary">',
10227-        '      <h3>納品サマリー</h3>',
10228-        '      <p>' + r8zV5dEscape(summary) + '</p>',
10229-        '    </section>',
10230-        '    <div class="aicm-dashboard-action-row">',
10231-        '      <button type="button" data-core-action="human-review-approve" data-review-id="' + r8zV5dEscape(id) + '">承認</button>',
10232-        '      <button type="button" data-core-action="human-review-return" data-review-id="' + r8zV5dEscape(id) + '">差し戻し</button>',
10233-        '    </div>',
10234-        '  </article>'
10235-      );
10236-    });
10237-
10238-    html.push('</section>');
10239-    return html.join("");
10240-  };
10241-
10242-  window.aicmR8zV5dReviewRows = r8zV5dReviewRows;
10243-  window.aicmR8zV5dHydrateReviewContext = r8zV5dHydrateIfNeeded;
10244-})();
10245-// AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_END
10246-
10247-// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START
10248-(function () {
10249-  "use strict";
10250-
10251-  function t(value) {
10252-    if (value === null || typeof value === "undefined") return "";
10253-    return String(value).trim();
10254-  }
--
10996-            } catch (_) {}
10997-
10998-            try {
10999-              if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
11000-                window.aicmRender();
11001-              }
11002-            } catch (_) {}
11003-          } catch (_) {}
11004-        }, 600);
11005-      } catch (_) {}
11006-    };
11007-
11008-    document.body.appendChild(script);
11009-  }
11010-  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper end
11011-
11012-window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
11013-    appState = appState || {};
11014-    var list = rows(appState);
11015-
11016-    if (!list.length && typeof aicmR8zV9ReviewListScriptHydrate === "function") aicmR8zV9ReviewListScriptHydrate(appState);
11017-    if (!list.length) hydrateIfNeeded(appState);
11018-
11019-    var debug = [
11020-      "selectedCompanyId=" + companyId(appState),
11021-      "owner=" + ownerId(appState),
11022-      "rows=" + String(list.length),
11023-      appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
11024-      appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : "",
11025-      // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: visible debug fields
11026-      "v8k=" + t(appState.aicmR8zV8kDebug || (typeof state !== "undefined" && state ? state.aicmR8zV8kDebug : "") || "none"),
11027-      "payload=" + String(appState.aicmR8zV8kPayloadCount !== undefined ? appState.aicmR8zV8kPayloadCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kPayloadCount !== undefined) ? state.aicmR8zV8kPayloadCount : "na")),
11028-      "merged=" + String(appState.aicmR8zV8kMergedCount !== undefined ? appState.aicmR8zV8kMergedCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kMergedCount !== undefined) ? state.aicmR8zV8kMergedCount : "na")),
11029-      "stRows=" + String(appState.aicmR8zV8kAfterMergeStateRows !== undefined ? appState.aicmR8zV8kAfterMergeStateRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeStateRows !== undefined) ? state.aicmR8zV8kAfterMergeStateRows : "na")),
11030-      "ctxRows=" + String(appState.aicmR8zV8kAfterMergeContextRows !== undefined ? appState.aicmR8zV8kAfterMergeContextRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeContextRows !== undefined) ? state.aicmR8zV8kAfterMergeContextRows : "na")),
11031-      appState.aicmR8zV8kError ? "v8kError=" + t(appState.aicmR8zV8kError) : ""
11032-    ].filter(Boolean).join(" / ");
11033-
11034-    var html = [
11035-      '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
11036-      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
11037-      '  <h2>納品サマリー確認</h2>',
11038-      '  <p class="aicm-selected-note">対象会社: <strong>' + esc(companyName(appState)) + '</strong></p>',
11039-      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + esc(String(list.length)) + '件</strong></p>',
11040-      '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'
11041-    ];
11042-
11043-    if (!list.length) {
11044-      html.push(
11045-        '  <article class="aicm-core-card">',
11046:        '    <strong>レビュー・承認待ちはありません</strong>',
11047-        '    <p>context反映待ちです。数秒後に再描画されます。</p>',
11048-        '  </article>',
11049-        '</section>'
11050-      );
11051-      return html.join("");
11052-    }
11053-
11054-    list.forEach(function (row, index) {
11055-      var id = first(row, ["aicm_human_review_item_id", "review_id", "id"], "");
11056-      var title = first(row, ["review_title", "title"], "レビュー項目");
11057-      var kind = first(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
11058-      var artifact = first(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
11059-      var priority = first(row, ["priority_label", "priority_code"], "-");
11060-      var summary = first(row, [
11061-        "delivery_summary_text",
11062-        "delivery_summary_preview",
11063-        "result_summary_text",
11064-        "ai_review_result_text",
11065-        "review_summary_text",
11066-        "summary"
11067-      ], "要約未設定");
11068-      var requestId = first(row, ["source_request_id", "request_id"], "");
11069-      var workerUnitId = first(row, ["related_worker_work_unit_id"], "");
11070-
11071-      html.push(
11072-        '  <article class="aicm-core-card aicm-review-card">',
11073-        '    <div class="aicm-review-head">',
11074-        '      <div>',
11075-        '        <p class="aicm-eyebrow">レビュー #' + esc(String(index + 1)) + '</p>',
11076-        '        <h3>' + esc(title) + '</h3>',
11077-        '      </div>',
11078-        '      <strong>' + esc(statusLabel(row)) + '</strong>',
11079-        '    </div>',
11080-        '    <div class="aicm-review-meta">',
11081-        '      <span>種別: ' + esc(kind) + '</span>',
11082-        '      <span>成果物: ' + esc(artifact) + '</span>',
11083-        '      <span>優先度: ' + esc(priority) + '</span>',
11084-        requestId ? '      <span>request_id: ' + esc(requestId) + '</span>' : '',
11085-        workerUnitId ? '      <span>worker_unit: ' + esc(workerUnitId) + '</span>' : '',
11086-        '    </div>',
11087-        '    <section class="aicm-review-summary">',
11088-        '      <h3>納品サマリー</h3>',
11089-        '      <p>' + esc(summary) + '</p>',
11090-        '    </section>',
11091-        '    <div class="aicm-dashboard-action-row">',
11092-        '      <button type="button" data-core-action="human-review-approve" data-review-id="' + esc(id) + '">承認</button>',
11093-        '      <button type="button" data-core-action="human-review-return" data-review-id="' + esc(id) + '">差し戻し</button>',
11094-        '    </div>',
11095-        '  </article>'
11096-      );
11097-    });
11098-
11099-    html.push('</section>');
11100-    return html.join("");
11101-  };
11102-})();
11103-
11104-
11105-  // AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER_START
11106-  // Final review-list renderer override. Scope is review-list display only.
11107-  // It does not touch task ledger / leader handoff / delete paths.
11108-  (function installAicmR8zV10cReviewListDirectContextRenderer() {
11109-    function v10cText(value) {
11110-      return String(value === undefined || value === null ? "" : value).trim();
11111-    }
11112-
11113-    function v10cEsc(value) {
11114-      var text = v10cText(value);
11115-      if (typeof escapeHtml === "function") return escapeHtml(text);
11116-      return text
--
11328-        '  <h3>' + v10cEsc(title) + '</h3>',
11329-        summary ? '  <p class="aicm-selected-note">' + v10cEsc(summary) + '</p>' : '',
11330-        aiReview ? '  <p class="aicm-selected-note"><strong>AIレビュー:</strong> ' + v10cEsc(aiReview) + '</p>' : '',
11331-        '  <dl class="aicm-core-detail-list">',
11332-        '    <dt>種別</dt><dd>' + v10cEsc(kind || "-") + '</dd>',
11333-        '    <dt>成果物</dt><dd>' + v10cEsc(artifact || "-") + '</dd>',
11334-        '    <dt>優先度</dt><dd>' + v10cEsc(priority || "-") + '</dd>',
11335-        '    <dt>依頼日時</dt><dd>' + v10cEsc(requested || "-") + '</dd>',
11336-        '    <dt>担当AI</dt><dd>' + v10cEsc(responsible || "-") + '</dd>',
11337-        '    <dt>review_id</dt><dd>' + v10cEsc(reviewId || "-") + '</dd>',
11338-        '  </dl>',
11339-        buttons,
11340-        '</article>'
11341-      ].join("");
11342-    }
11343-
11344-    function v10cRenderReviewList(appState) {
11345-      appState = v10cState(appState);
11346-
11347-      var beforeRows = v10cRows(appState);
11348-      if (!beforeRows.length) {
11349-        v10cSyncFetch(appState);
11350-      }
11351-
11352-      var rows = v10cRows(appState);
11353-      var debug = [
11354-        "V10C",
11355-        "selectedCompanyId=" + v10cCompanyId(appState),
11356-        "owner=" + v10cOwnerId(appState),
11357-        "rows=" + String(rows.length),
11358-        "payloadRows=" + String(appState.aicmR8zV10cPayloadRows !== undefined ? appState.aicmR8zV10cPayloadRows : "na"),
11359-        "http=" + String(appState.aicmR8zV10cHttpStatus !== undefined ? appState.aicmR8zV10cHttpStatus : "na"),
11360-        "status=" + v10cText(appState.aicmR8zV10cFetchStatus || "none"),
11361-        appState.aicmR8zV10cError ? "error=" + v10cText(appState.aicmR8zV10cError) : ""
11362-      ].filter(Boolean).join(" / ");
11363-
11364-      var body = rows.length
11365-        ? [
11366-            '<section class="aicm-core-card">',
11367-            '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
11368-            '  <h2>レビュー・承認待ち: ' + v10cEsc(String(rows.length)) + '件</h2>',
11369-            '  <p class="aicm-selected-note">' + v10cEsc(debug) + '</p>',
11370-            '</section>',
11371-            rows.map(v10cRenderRow).join("")
11372-          ].join("")
11373-        : [
11374-            '<section class="aicm-core-card" style="border:1px solid #e5e7eb;">',
11375-            '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
11376-            '  <h2>レビュー・承認待ち: 0件</h2>',
11377-            '  <p class="aicm-selected-note">' + v10cEsc(debug) + '</p>',
11378:            '  <p class="aicm-core-message aicm-core-message-error">context APIからレビュー・承認待ちはありませんでした。</p>',
11379-            '  <div class="aicm-dashboard-action-row">',
11380-            '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
11381-            '    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳へ</button>',
11382-            '  </div>',
11383-            '</section>'
11384-          ].join("");
11385-
11386-      if (typeof renderShell === "function") {
11387-        return renderShell(body);
11388-      }
11389-
11390-      return body;
11391-    }
11392-
11393-    if (typeof window !== "undefined") {
11394-      window.aicmR8zV10cRenderReviewList = v10cRenderReviewList;
11395-      window.aicmR8zV7RenderReviewList = v10cRenderReviewList;
11396-    }
11397-  })();
11398-  // AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER_END
11399-
11400-  // AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD_START
11401-  // Review artifact detail card. Scope: review-list only. No DB write / no API POST.
11402-  (function installAicmR8zV10dReviewArtifactDetailCard() {
11403-    function t(value) {
11404-      return String(value === undefined || value === null ? "" : value).trim();
11405-    }
11406-
11407-    function esc(value) {
11408-      var text = t(value);
11409-      if (typeof escapeHtml === "function") return escapeHtml(text);
11410-      return text
11411-        .replace(/&/g, "&amp;")
11412-        .replace(/</g, "&lt;")
11413-        .replace(/>/g, "&gt;")
11414-        .replace(/"/g, "&quot;")
11415-        .replace(/'/g, "&#039;");
11416-    }
11417-
11418-    function app(appState) {
11419-      if (appState && typeof appState === "object") return appState;
11420-      if (typeof state !== "undefined" && state && typeof state === "object") return state;
11421-      return {};
11422-    }
11423-
11424-    function ctx(appState) {
11425-      appState = app(appState);
11426-      if (!appState.context || typeof appState.context !== "object") appState.context = {};
11427-      return appState.context;
11428-    }
11429-
11430-    function ownerId(appState) {
11431-      appState = app(appState);
11432-      var c = ctx(appState);
11433-      return t(appState.owner_civilization_id || appState.ownerCivilizationId || c.owner_civilization_id || c.ownerCivilizationId || "00000000-0000-4000-8000-000000000001");
11434-    }
11435-
11436-    function companyId(appState) {
11437-      appState = app(appState);
11438-      var c = ctx(appState);
11439-      return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id || "");
11440-    }
11441-
11442-    function rowsFromPayload(payload) {
11443-      payload = payload && typeof payload === "object" ? payload : {};
11444-      var candidates = [
11445-        payload.review_wait_items,
11446-        payload.human_review_wait_items,
11447-        payload.humanReviewWaitItems,
11448-        payload.context && payload.context.review_wait_items,
--
11746-        summary ? '  <p class="aicm-selected-note">' + esc(summary) + '</p>' : '',
11747-        '  <dl class="aicm-core-detail-list">',
11748-        renderField("種別", row.review_kind_label || row.review_kind_code),
11749-        renderField("成果物", row.artifact_kind_label || row.artifact_kind_code),
11750-        renderField("優先度", row.priority_code),
11751-        renderField("依頼日時", row.requested_at || row.created_at),
11752-        renderField("review_id", id),
11753-        '  </dl>',
11754-        '  <div class="aicm-dashboard-action-row">',
11755-        '    <button type="button" data-core-action="review-v10d-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
11756-        '  </div>',
11757-        '</article>'
11758-      ].join("");
11759-    }
11760-
11761-    function renderReviewList(appState) {
11762-      appState = app(appState);
11763-
11764-      if (!rows(appState).length) {
11765-        syncFetch(appState);
11766-      }
11767-
11768-      var r = rows(appState);
11769-      var currentId = selectedReviewId(appState);
11770-
11771-      var debug = [
11772-        "V10D",
11773-        "selectedCompanyId=" + companyId(appState),
11774-        "owner=" + ownerId(appState),
11775-        "rows=" + String(r.length),
11776-        "payloadRows=" + String(appState.aicmR8zV10dPayloadRows !== undefined ? appState.aicmR8zV10dPayloadRows : "na"),
11777-        "http=" + String(appState.aicmR8zV10dHttpStatus !== undefined ? appState.aicmR8zV10dHttpStatus : "na"),
11778-        "status=" + t(appState.aicmR8zV10dFetchStatus || "context"),
11779-        currentId ? "selectedReviewId=" + currentId : "",
11780-        appState.aicmR8zV10dError ? "error=" + t(appState.aicmR8zV10dError) : ""
11781-      ].filter(Boolean).join(" / ");
11782-
11783-      var body = [
11784-        '<section class="aicm-core-card">',
11785-        '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
11786-        '  <h2>レビュー・承認待ち: ' + esc(String(r.length)) + '件</h2>',
11787-        '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
11788-        '  <p class="aicm-selected-note">成果物を確認してから、次工程で承認/差し戻しを行います。</p>',
11789-        '</section>',
11790-        renderDetailCard(appState),
11791-        renderPreviewDecisionCard(appState),
11792-        r.length
11793-          ? r.map(function(row, index) { return renderListRow(row, index, currentId); }).join("")
11794-          : [
11795-              '<section class="aicm-core-card" style="border:1px solid #e5e7eb;">',
11796:              '  <h3>レビュー・承認待ちはありません</h3>',
11797-              '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
11798-              '</section>'
11799-            ].join("")
11800-      ].join("");
11801-
11802-      if (typeof renderShell === "function") return renderShell(body);
11803-      return body;
11804-    }
11805-
11806-    function rerender() {
11807-      try {
11808-        if (typeof render === "function") {
11809-          render();
11810-          return;
11811-        }
11812-      } catch (_) {}
11813-
11814-      try {
11815-        if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
11816-          window.aicmRender();
11817-        }
11818-      } catch (_) {}
11819-    }
11820-
11821-    function setDetail(id) {
11822-      var s = app();
11823-      s.aicmR8zV10dSelectedReviewId = t(id);
11824-      s.aicmR8zV10dDecisionPreviewMode = "";
11825-      rerender();
11826-    }
11827-
11828-    function closeDetail() {
11829-      var s = app();
11830-      s.aicmR8zV10dSelectedReviewId = "";
11831-      s.aicmR8zV10dDecisionPreviewMode = "";
11832-      rerender();
11833-    }
11834-
11835-    function previewDecision(mode, id) {
11836-      var s = app();
11837-      s.aicmR8zV10dSelectedReviewId = t(id) || selectedReviewId(s);
11838-      s.aicmR8zV10dDecisionPreviewMode = mode;
11839-      rerender();
11840-    }
11841-
11842-    function clearPreview() {
11843-      var s = app();
11844-      s.aicmR8zV10dDecisionPreviewMode = "";
11845-      rerender();
11846-    }
11847-
11848-    function installClickBridge() {
11849-      if (typeof document === "undefined" || document.__aicmR8zV10dReviewDetailClickBridge) return;
11850-      document.__aicmR8zV10dReviewDetailClickBridge = true;
11851-
11852-      document.addEventListener("click", function(event) {
11853-        var target = event.target;
11854-        while (target && target !== document && !target.getAttribute("data-core-action")) {
11855-          target = target.parentNode;
11856-        }
11857-
11858-        if (!target || target === document) return;
11859-
11860-        var action = target.getAttribute("data-core-action");
11861-        if (!action || action.indexOf("review-v10d-") !== 0) return;
11862-
11863-        event.preventDefault();
11864-        event.stopPropagation();
11865-
11866-        var id = target.getAttribute("data-review-id") || target.getAttribute("data-human-review-id") || "";
--
12207-        '<article class="aicm-core-card" style="' + (selected ? 'border:2px solid #f59e0b;' : 'border:1px solid #dbeafe;') + '">',
12208-        '  <p class="aicm-eyebrow">レビュー待ち #' + esc(String(index + 1)) + '</p>',
12209-        '  <h3>' + esc(title) + '</h3>',
12210-        summary ? '  <p class="aicm-selected-note">' + esc(summary) + '</p>' : '',
12211-        '  <dl class="aicm-core-detail-list">',
12212-        renderField("種別", row.review_kind_label || row.review_kind_code),
12213-        renderField("成果物", row.artifact_kind_label || row.artifact_kind_code),
12214-        renderField("優先度", row.priority_code),
12215-        renderField("依頼日時", row.requested_at || row.created_at),
12216-        renderField("review_id", id),
12217-        '  </dl>',
12218-        '  <div class="aicm-dashboard-action-row">',
12219-        '    <button type="button" data-core-action="review-v10d2-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
12220-        '  </div>',
12221-        '</article>',
12222-        selected ? renderInlineDetail(row) + renderPreview(appState, row) : ''
12223-      ].join("");
12224-    }
12225-
12226-    function renderReviewList(appState) {
12227-      appState = app(appState);
12228-
12229-      if (!rows(appState).length) syncFetch(appState);
12230-
12231-      var r = rows(appState);
12232-      var currentId = selectedReviewId(appState);
12233-
12234-      var debug = [
12235-        "V10D2",
12236-        "selectedCompanyId=" + companyId(appState),
12237-        "owner=" + ownerId(appState),
12238-        "rows=" + String(r.length),
12239-        "payloadRows=" + String(appState.aicmR8zV10d2PayloadRows !== undefined ? appState.aicmR8zV10d2PayloadRows : "na"),
12240-        "http=" + String(appState.aicmR8zV10d2HttpStatus !== undefined ? appState.aicmR8zV10d2HttpStatus : "na"),
12241-        "status=" + t(appState.aicmR8zV10d2FetchStatus || "context"),
12242-        currentId ? "selectedReviewId=" + currentId : "",
12243-        appState.aicmR8zV10d2Error ? "error=" + t(appState.aicmR8zV10d2Error) : ""
12244-      ].filter(Boolean).join(" / ");
12245-
12246-      var body = [
12247-        '<section class="aicm-core-card">',
12248-        '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
12249-        '  <h2>レビュー・承認待ち: ' + esc(String(r.length)) + '件</h2>',
12250-        '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
12251-        '  <p class="aicm-selected-note">「成果物を確認」を押すと、その項目の直下に詳細カードを表示します。</p>',
12252-        '</section>',
12253-        r.length
12254-          ? r.map(function(row, index) { return renderListRow(appState, row, index, currentId); }).join("")
12255-          : [
12256-              '<section class="aicm-core-card" style="border:1px solid #e5e7eb;">',
12257:              '  <h3>レビュー・承認待ちはありません</h3>',
12258-              '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
12259-              '</section>'
12260-            ].join("")
12261-      ].join("");
12262-
12263-      if (typeof renderShell === "function") return renderShell(body);
12264-      return body;
12265-    }
12266-
12267-    function rerenderAndScroll(id) {
12268-      try {
12269-        if (typeof render === "function") render();
12270-        else if (typeof window !== "undefined" && typeof window.aicmRender === "function") window.aicmRender();
12271-      } catch (_) {}
12272-
12273-      if (!id || typeof document === "undefined") return;
12274-
12275-      setTimeout(function() {
12276-        try {
12277-          var el = document.getElementById("aicm-v10d2-detail-" + id);
12278-          if (el && typeof el.scrollIntoView === "function") {
12279-            el.scrollIntoView({ behavior: "smooth", block: "start" });
12280-          }
12281-        } catch (_) {}
12282-      }, 80);
12283-    }
12284-
12285-    function setDetail(id) {
12286-      var s = app();
12287-      s.aicmR8zV10d2SelectedReviewId = t(id);
12288-      s.aicmR8zV10dSelectedReviewId = t(id);
12289-      s.aicmR8zV10d2DecisionPreviewMode = "";
12290-      rerenderAndScroll(t(id));
12291-    }
12292-
12293-    function closeDetail() {
12294-      var s = app();
12295-      s.aicmR8zV10d2SelectedReviewId = "";
12296-      s.aicmR8zV10dSelectedReviewId = "";
12297-      s.aicmR8zV10d2DecisionPreviewMode = "";
12298-      rerenderAndScroll("");
12299-    }
12300-
12301-    function preview(mode, id) {
12302-      var s = app();
12303-      s.aicmR8zV10d2SelectedReviewId = t(id) || selectedReviewId(s);
12304-      s.aicmR8zV10dSelectedReviewId = s.aicmR8zV10d2SelectedReviewId;
12305-      s.aicmR8zV10d2DecisionPreviewMode = mode;
12306-      rerenderAndScroll(s.aicmR8zV10d2SelectedReviewId);
12307-    }
12308-
12309-    function clearPreview() {
12310-      var s = app();
12311-      s.aicmR8zV10d2DecisionPreviewMode = "";
12312-      rerenderAndScroll(selectedReviewId(s));
12313-    }
12314-
12315-    function installClickBridge() {
12316-      if (typeof document === "undefined" || document.__aicmR8zV10d2InlineDetailClickBridge) return;
12317-      document.__aicmR8zV10d2InlineDetailClickBridge = true;
12318-
12319-      document.addEventListener("click", function(event) {
12320-        var target = event.target;
12321-        while (target && target !== document && !(target.getAttribute && target.getAttribute("data-core-action"))) {
12322-          target = target.parentNode;
12323-        }
12324-
12325-        if (!target || target === document || !(target.getAttribute)) return;
12326-
12327-        var action = target.getAttribute("data-core-action");

============================================================
8. verify
============================================================
BAD_EMPTY_TEXT_COUNT=0
GOOD_EMPTY_TEXT_COUNT=7
V10GC4E_MARKER_COUNT=2
V10GC4D_MARKER_COUNT=2
V10GC4B_MARKER_COUNT=3
V10GC3I_MARKER_COUNT=2
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
9. restart server
============================================================

============================================================
10. final
============================================================
FINAL_JUDGEMENT=V10GC4E_REVIEW_EMPTY_RED_BORDER_CLEANUP_READY_BROWSER_OPENED
ROOT_HTTP=200
SERVED_HTTP=200
BAD_EMPTY_TEXT_COUNT=0
GOOD_EMPTY_TEXT_COUNT=7
V10GC4E_MARKER_COUNT=2
V10GC4D_MARKER_COUNT=2
V10GC4B_MARKER_COUNT=3
V10GC3I_MARKER_COUNT=2
SERVED_BAD_EMPTY_TEXT_COUNT=0
SERVED_GOOD_EMPTY_TEXT_COUNT=7
SERVED_V10GC4E_MARKER_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc4e_20260504_072525
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4e_review_empty_red_border_cleanup_20260504_072525/000_R8Z_V10GC4E_REVIEW_EMPTY_RED_BORDER_CLEANUP_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4e_review_empty_red_border_cleanup_20260504_072525/aicm-production-core.before_v10gc4e.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4e_review_empty_red_border_cleanup_20260504_072525/020_patch_analysis.txt
EMPTY_EXTRACT_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4e_review_empty_red_border_cleanup_20260504_072525/070_empty_state_extract_before.txt
EMPTY_EXTRACT_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4e_review_empty_red_border_cleanup_20260504_072525/080_empty_state_extract_after.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. レビュー・承認待ち: 0件
3. 「レビュー・承認待ちはありません」表示
4. 赤枠エラー調カードが消えていること
5. OKなら git checkpoint

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc4e_review_empty_red_border_cleanup_20260504_072525/aicm-production-core.before_v10gc4e.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
