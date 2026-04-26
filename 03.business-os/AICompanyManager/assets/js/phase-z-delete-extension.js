(function () {
  "use strict";

  const STORAGE_KEY = "AICM_PHASE_Y_STATE";

  function readState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function writeState(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      return;
    }
  }

  function activeCompanyIdFromDom() {
    const active = document.querySelector(".aicm-company-button.active[data-company-id]");
    if (active) {
      return active.getAttribute("data-company-id");
    }

    const first = document.querySelector(".aicm-company-button[data-company-id]");
    if (first) {
      return first.getAttribute("data-company-id");
    }

    return "";
  }

  function injectCompanyDeletePanel() {
    const dashboard = document.querySelector(".aicm-dashboard");
    if (!dashboard) {
      return;
    }

    const firstCard = dashboard.querySelector(".aicm-card");
    if (!firstCard) {
      return;
    }

    if (document.getElementById("aicm-company-delete-panel")) {
      return;
    }

    const panel = document.createElement("details");
    panel.className = "aicm-collapse";
    panel.id = "aicm-company-delete-panel";
    panel.innerHTML = [
      "<summary>会社削除</summary>",
      "<p class=\"aicm-muted\">選択中の会社を削除します。local mockでは最後の1社は削除できません。</p>",
      "<div class=\"aicm-actions\">",
      "<button class=\"aicm-button danger\" data-action=\"delete-company-from-dashboard\">選択中の会社を削除</button>",
      "</div>",
      "<p id=\"aicm-company-delete-message\" class=\"aicm-muted\"></p>"
    ].join("");

    firstCard.appendChild(panel);
  }

  function injectOrganizationDeleteHint() {
    const dashboard = document.querySelector(".aicm-dashboard");
    if (!dashboard || document.getElementById("aicm-organization-delete-hint")) {
      return;
    }

    const cards = dashboard.querySelectorAll(".aicm-card");
    const orgCard = cards[2];
    if (!orgCard) {
      return;
    }

    const hint = document.createElement("details");
    hint.className = "aicm-collapse";
    hint.id = "aicm-organization-delete-hint";
    hint.innerHTML = [
      "<summary>組織削除</summary>",
      "<p class=\"aicm-muted\">組織変更パネル内で、組織ツリー削除と組織要員削除ができます。</p>",
      "<ul>",
      "<li>組織ツリー削除: data-delete-tree</li>",
      "<li>組織要員削除: data-delete-unit</li>",
      "</ul>"
    ].join("");

    orgCard.appendChild(hint);
  }

  function enhanceDeleteUi() {
    injectCompanyDeletePanel();
    injectOrganizationDeleteHint();
  }

  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!target || target.getAttribute("data-action") !== "delete-company-from-dashboard") {
      return;
    }

    const message = document.getElementById("aicm-company-delete-message");
    const data = readState();

    if (!data || !Array.isArray(data.companies)) {
      if (message) {
        message.textContent = "保存済み会社データが見つかりません。先に会社追加または変更を行ってください。";
      }
      return;
    }

    if (data.companies.length <= 1) {
      if (message) {
        message.textContent = "最後の1社は削除できません。先に別会社を追加してください。";
      }
      return;
    }

    const activeId = activeCompanyIdFromDom();
    const beforeCount = data.companies.length;
    data.companies = data.companies.filter(function (company) {
      return company.company_id !== activeId;
    });

    if (data.companies.length === beforeCount) {
      if (message) {
        message.textContent = "削除対象の会社を特定できませんでした。";
      }
      return;
    }

    writeState(data);
    window.location.reload();
  });

  const observer = new MutationObserver(function () {
    enhanceDeleteUi();
  });

  document.addEventListener("DOMContentLoaded", function () {
    enhanceDeleteUi();
    observer.observe(document.body, { childList: true, subtree: true });
  });

  window.AICM_PHASE_Z_DELETE_EXTENSION = {
    enhanceDeleteUi: enhanceDeleteUi
  };
})();
