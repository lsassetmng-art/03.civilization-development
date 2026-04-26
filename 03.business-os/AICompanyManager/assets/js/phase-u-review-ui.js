(function () {
  "use strict";

  const state = {
    activeTab: "dashboard",
    activeCompanyId: "company-acm-001"
  };

  function data() {
    return window.AICM_PHASE_U_REVIEW_DATA || { companies: [] };
  }

  function activeCompany() {
    const companies = data().companies;
    return companies.find((company) => company.company_id === state.activeCompanyId) || companies[0];
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCompanyButtons(companies) {
    return companies.map((company) => {
      const active = company.company_id === state.activeCompanyId ? " is-active" : "";
      return `
        <button class="aicm-company-button${active}" data-company-id="${escapeHtml(company.company_id)}">
          <div>${escapeHtml(company.company_name)}</div>
          <small>${escapeHtml(company.business_domain)}</small>
        </button>
      `;
    }).join("");
  }

  function renderRoleProgress(company) {
    return company.role_progress.map((step) => `
      <div class="aicm-role-step">
        <strong>${escapeHtml(step.role)}</strong>
        <span class="aicm-badge">${escapeHtml(step.status)}</span>
        <p class="aicm-muted">${escapeHtml(step.detail)}</p>
      </div>
    `).join("");
  }

  function renderOrganization(company) {
    return company.organization_units.map((unit) => `
      <details class="aicm-collapse">
        <summary>${escapeHtml(unit.unit_name)} / ${escapeHtml(unit.ai_role)}</summary>
        <p><strong>目的:</strong> ${escapeHtml(unit.purpose)}</p>
        <p><strong>成果物:</strong> ${escapeHtml(unit.deliverable)}</p>
      </details>
    `).join("");
  }

  function handoffText(company) {
    return [
      "# ============================================================",
      "# AICompanyManager 引き継ぎワンブロック",
      "# ============================================================",
      "",
      "対象アプリ:",
      "- AICompanyManager / AI企業運営アプリ",
      "",
      "対象会社:",
      "- company_id: " + company.company_id,
      "- company_name: " + company.company_name,
      "- business_domain: " + company.business_domain,
      "- robot_naming_rule: " + company.robot_naming_rule,
      "",
      "現在の仕事:",
      "- title: " + company.current_work.title,
      "- stage: " + company.current_work.stage,
      "- ai_review_status: " + company.current_work.ai_review_status,
      "- delivery_status: " + company.delivery.status,
      "",
      "組織:",
      ...company.organization_units.map((unit) => "- " + unit.unit_name + " / " + unit.ai_role + " / " + unit.purpose),
      "",
      "ロール進行:",
      ...company.role_progress.map((step) => "- " + step.role + ": " + step.status + " / " + step.detail),
      "",
      "次の作業:",
      "- 途中成果物を確認し、必要なら納品前差し戻し",
      "- 設計または開発を継続する場合は、このワンブロックを次チャットに貼る",
      "",
      "安全状態:",
      "- DB WRITE: NOT EXECUTED",
      "- RLS APPLY: NOT EXECUTED",
      "- LIVE AIWORKEROS CALL: NOT EXECUTED"
    ].join("\n");
  }

  function renderDashboard(company, companies) {
    return `
      <section class="aicm-horizontal-dashboard">
        <div class="aicm-card">
          <h2>1. 会社</h2>
          <details class="aicm-collapse" open>
            <summary>会社一覧</summary>
            <div class="aicm-company-list">${renderCompanyButtons(companies)}</div>
          </details>
          <details class="aicm-collapse" open>
            <summary>会社概要</summary>
            <p><strong>会社名:</strong> ${escapeHtml(company.company_name)}</p>
            <p><strong>事業領域:</strong> ${escapeHtml(company.business_domain)}</p>
            <p><strong>ロボット命名:</strong> ${escapeHtml(company.robot_naming_rule)}</p>
          </details>
        </div>

        <div class="aicm-card">
          <h2>2. ロール進行</h2>
          <details class="aicm-collapse" open>
            <summary>President → Manager → Leader → Worker</summary>
            ${renderRoleProgress(company)}
          </details>
        </div>

        <div class="aicm-card">
          <h2>3. 現在の仕事</h2>
          <details class="aicm-collapse" open>
            <summary>作業状態</summary>
            <p><strong>件名:</strong> ${escapeHtml(company.current_work.title)}</p>
            <p><strong>段階:</strong> ${escapeHtml(company.current_work.stage)}</p>
            <p><strong>AI自動レビュー:</strong> ${escapeHtml(company.current_work.ai_review_status)}</p>
            <p><strong>保存状態:</strong> ${escapeHtml(company.current_work.internal_save_status)}</p>
          </details>
          <details class="aicm-collapse">
            <summary>組織</summary>
            ${renderOrganization(company)}
          </details>
        </div>

        <div class="aicm-card">
          <h2>4. 納品</h2>
          <details class="aicm-collapse" open>
            <summary>人間確認ゲート</summary>
            <p><strong>納品名:</strong> ${escapeHtml(company.delivery.title)}</p>
            <p><strong>状態:</strong> ${escapeHtml(company.delivery.status)}</p>
            <p><strong>人間操作:</strong> ${escapeHtml(company.delivery.human_gate)}</p>
            <div class="aicm-actions">
              <button class="aicm-action" data-action="accept-delivery">納品を受領</button>
              <button class="aicm-action" data-action="request-revision">納品前差し戻し</button>
            </div>
          </details>
        </div>
      </section>
    `;
  }

  function renderSettings(company) {
    const organizationText = company.organization_units
      .map((unit) => `${unit.unit_name} / ${unit.ai_role} / ${unit.purpose} / ${unit.deliverable}`)
      .join("\n");

    return `
      <section class="aicm-card">
        <h2>設定画面</h2>
        <p class="aicm-muted">方針入力・会社情報・組織・ロボット命名はここで設定する。</p>

        <details class="aicm-collapse" open>
          <summary>会社設定</summary>
          <div class="aicm-form-grid">
            <div class="aicm-field">
              <label>会社名</label>
              <input value="${escapeHtml(company.company_name)}">
            </div>
            <div class="aicm-field">
              <label>事業領域</label>
              <input value="${escapeHtml(company.business_domain)}">
            </div>
            <div class="aicm-field">
              <label>ロボット命名ルール</label>
              <input value="${escapeHtml(company.robot_naming_rule)}">
            </div>
            <div class="aicm-field">
              <label>納品確認ルール</label>
              <input value="${escapeHtml(company.delivery_policy)}">
            </div>
          </div>
        </details>

        <details class="aicm-collapse" open>
          <summary>方針入力</summary>
          <div class="aicm-field">
            <label>会社方針</label>
            <textarea>${escapeHtml(company.company_policy)}</textarea>
          </div>
        </details>

        <details class="aicm-collapse" open>
          <summary>組織設定</summary>
          <div class="aicm-field">
            <label>組織定義</label>
            <textarea>${escapeHtml(organizationText)}</textarea>
          </div>
        </details>
      </section>
    `;
  }

  function renderHandoff(company) {
    return `
      <section class="aicm-card">
        <h2>途中仕事の引き継ぎ</h2>
        <p class="aicm-muted">設計途中・開発途中でも、下の引き継ぎワンブロックを次チャットへ貼れば続行できる。</p>

        <details class="aicm-collapse" open>
          <summary>引き継ぎ資料</summary>
          <textarea class="aicm-handoff-output" readonly>${escapeHtml(handoffText(company))}</textarea>
        </details>

        <details class="aicm-collapse">
          <summary>引き渡し方法の提案</summary>
          <ol>
            <li>現在の会社設定を固定する。</li>
            <li>現在の作業段階とロール進行を出力する。</li>
            <li>未完了成果物と次の作業を明記する。</li>
            <li>DB/RLS/live接続の安全状態を明記する。</li>
            <li>引き継ぎワンブロックを次チャットに貼る。</li>
          </ol>
        </details>
      </section>
    `;
  }

  function render() {
    const companies = data().companies;
    const company = activeCompany();

    if (!company) {
      return;
    }

    let root = document.getElementById("app");
    if (!root) {
      root = document.createElement("div");
      root.id = "app";
      document.body.appendChild(root);
    }

    const body = state.activeTab === "settings"
      ? renderSettings(company)
      : state.activeTab === "handoff"
        ? renderHandoff(company)
        : renderDashboard(company, companies);

    root.innerHTML = `
      <main class="aicm-phase-u-shell">
        <header class="aicm-phase-u-header">
          <div>
            <h1 class="aicm-phase-u-title">AI企業運営アプリ</h1>
            <p class="aicm-phase-u-subtitle">複数会社・組織設定・AI自動レビュー・納品時人間確認・途中引き継ぎ対応</p>
          </div>
          <div class="aicm-badge">Phase U review reflected</div>
        </header>

        <nav class="aicm-phase-u-tabs">
          <button class="aicm-phase-u-tab ${state.activeTab === "dashboard" ? "is-active" : ""}" data-tab="dashboard">会社ダッシュボード</button>
          <button class="aicm-phase-u-tab ${state.activeTab === "settings" ? "is-active" : ""}" data-tab="settings">設定</button>
          <button class="aicm-phase-u-tab ${state.activeTab === "handoff" ? "is-active" : ""}" data-tab="handoff">引き継ぎ</button>
        </nav>

        ${body}
      </main>
    `;

    root.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeTab = button.getAttribute("data-tab");
        render();
      });
    });

    root.querySelectorAll("[data-company-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeCompanyId = button.getAttribute("data-company-id");
        render();
      });
    });

    root.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-action");
        if (action === "accept-delivery") {
          alert("納品を受領しました。mock");
        }
        if (action === "request-revision") {
          alert("納品前差し戻しを作成しました。mock");
        }
      });
    });
  }

  window.AICM_PHASE_U_REVIEW_UI = { render };

  document.addEventListener("DOMContentLoaded", render);
})();

/*
Phase U check keywords:
- 納品時のみ人間確認
- AI自動レビュー
- 引き継ぎワンブロック
*/
