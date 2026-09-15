(function () {
  const appKey = "endoflifeplanner";
  const hero = document.getElementById("hero");
  const personaName = document.getElementById("personaName");
  const backgroundSelect = document.getElementById("backgroundSelect");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const statusLine = document.getElementById("statusLine");

  const backgrounds = {
    sunrise: "linear-gradient(135deg, #f59e0b, #ef4444)",
    forest: "linear-gradient(135deg, #10b981, #065f46)",
    night: "linear-gradient(135deg, #312e81, #0f172a)"
  };

  function load() {
    const raw = localStorage.getItem("lifeos_" + appKey);
    const state = raw ? JSON.parse(raw) : { personaName: "", background: "sunrise" };
    personaName.value = state.personaName || "";
    backgroundSelect.value = state.background || "sunrise";
    applyBackground();
    statusLine.textContent = state.personaName
      ? "Saved persona: " + state.personaName
      : "No persona saved yet";
  }

  function save() {
    const state = {
      personaName: personaName.value.trim(),
      background: backgroundSelect.value
    };
    localStorage.setItem("lifeos_" + appKey, JSON.stringify(state));
    applyBackground();
    statusLine.textContent = state.personaName
      ? "Saved persona: " + state.personaName
      : "Saved without persona name";
  }

  function reset() {
    localStorage.removeItem("lifeos_" + appKey);
    personaName.value = "";
    backgroundSelect.value = "sunrise";
    applyBackground();
    statusLine.textContent = "Reset completed";
  }

  function applyBackground() {
    hero.style.background = backgrounds[backgroundSelect.value] || backgrounds.sunrise;
  }

  saveBtn.addEventListener("click", save);
  resetBtn.addEventListener("click", reset);
  backgroundSelect.addEventListener("change", applyBackground);

  load();
})();

// FAMILY_LEGACY_AI_I3_UI_SHELL_START
(function familyLegacyAiI3UiShell() {
  "use strict";

  const FEATURE_ID = "family-legacy-ai";
  const MENU_ID = "family-legacy-ai-menu-entry";
  const SCREEN_ID = "family-legacy-ai-screen";

  const uiText = {
    menuLabel: "家族相談AI",
    title: "家族相談AI",
    subtitle: "登録者本人の記録・価値観・話し方をもとに、家族が将来相談できるAIを作成します。",
    disclosureA: "登録者本人の記録・価値観・話し方をもとにしたAIです。",
    disclosureB: "本人そのものではありません。",
    silentEmergency: "重大・緊急の相談では、登録された大人に安全確認の案内を送る場合があります。利用者本人に通知完了表示は出しません。",
    vaultSafety: "本人文脈vaultは暗号化して扱います。平文の第三者情報はサーバーに保存せず、復号キーはDBに保存しません。",
    cxBoundary: "CX22073JWは背景知識としてのみ参照します。登録者本人の記憶としては扱いません。"
  };

  const cards = [
    {
      title: "本人らしさ登録",
      body: "選択式・短答式アンケートで、話し方、励まし方、お金観、仕事観、家族観を登録します。"
    },
    {
      title: "知識領域登録",
      body: "詳しかった分野と深度を登録します。CX22073JWは背景知識としてのみ使います。"
    },
    {
      title: "本人文脈vault",
      body: "親戚、家族、友人、好きな芸能人、作品、趣味、場所などを本人文脈として登録します。"
    },
    {
      title: "未成年同意設定",
      body: "未成年は大人・保護者の同意なしに使用できません。"
    },
    {
      title: "緊急連絡先",
      body: "重大・緊急相談では、登録された大人へ安全確認の案内を送る場合があります。利用者には通知完了表示を出しません。"
    },
    {
      title: "バックアップ/復元",
      body: "端末内保存、暗号化DBバックアップ、Drive暗号化ファイル、復元キットを扱います。"
    },
    {
      title: "相談プレビュー",
      body: "実際の通知やAIWorkerOS API送信を行わず、返答の方向性を確認する入口です。"
    }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[ch];
    });
  }

  function findMainContainer() {
    return document.querySelector("main")
      || document.querySelector("#app")
      || document.querySelector(".app")
      || document.querySelector("[data-app]")
      || document.body;
  }

  function findNavigationContainer() {
    return document.querySelector("nav")
      || document.querySelector("[role='navigation']")
      || document.querySelector(".nav")
      || document.querySelector(".menu")
      || document.querySelector(".sidebar")
      || document.querySelector("header")
      || null;
  }

  function createMenuEntry() {
    if (document.getElementById(MENU_ID)) return;

    const button = document.createElement("button");
    button.id = MENU_ID;
    button.type = "button";
    button.className = "family-legacy-ai-menu-entry";
    button.setAttribute("data-family-legacy-ai-action", "open");
    button.textContent = uiText.menuLabel;

    button.addEventListener("click", function () {
      openFamilyLegacyAiScreen();
    });

    const nav = findNavigationContainer();
    if (nav) {
      nav.appendChild(button);
      return;
    }

    const main = findMainContainer();
    const fallback = document.createElement("div");
    fallback.className = "family-legacy-ai-menu-fallback";
    fallback.appendChild(button);
    main.insertBefore(fallback, main.firstChild);
  }

  function createScreen() {
    if (document.getElementById(SCREEN_ID)) return;

    const section = document.createElement("section");
    section.id = SCREEN_ID;
    section.className = "family-legacy-ai-screen";
    section.setAttribute("data-family-legacy-ai-screen", "home");
    section.setAttribute("aria-labelledby", "family-legacy-ai-title");

    const cardHtml = cards.map(function (card) {
      return [
        '<article class="family-legacy-ai-card">',
        '<h3>' + escapeHtml(card.title) + '</h3>',
        '<p>' + escapeHtml(card.body) + '</p>',
        '<button type="button" class="family-legacy-ai-card-button" disabled>設計済み・実装準備中</button>',
        '</article>'
      ].join("");
    }).join("");

    section.innerHTML = [
      '<div class="family-legacy-ai-hero">',
      '<div>',
      '<p class="family-legacy-ai-kicker">EndOfLifePlanner</p>',
      '<h2 id="family-legacy-ai-title">' + escapeHtml(uiText.title) + '</h2>',
      '<p class="family-legacy-ai-subtitle">' + escapeHtml(uiText.subtitle) + '</p>',
      '</div>',
      '<div class="family-legacy-ai-status">UIシェル</div>',
      '</div>',
      '<aside class="family-legacy-ai-disclosure" aria-label="FamilyLegacyAI disclosure">',
      '<strong>' + escapeHtml(uiText.disclosureA) + '</strong>',
      '<span>' + escapeHtml(uiText.disclosureB) + '</span>',
      '</aside>',
      '<div class="family-legacy-ai-grid">',
      cardHtml,
      '</div>',
      '<section class="family-legacy-ai-safety-panel">',
      '<h3>安全・プライバシー境界</h3>',
      '<ul>',
      '<li>' + escapeHtml(uiText.silentEmergency) + '</li>',
      '<li>' + escapeHtml(uiText.vaultSafety) + '</li>',
      '<li>' + escapeHtml(uiText.cxBoundary) + '</li>',
      '<li>DB保存、AIWorkerOS呼び出し、LINE送信、Drive連携、暗号化処理はこのUIシェルでは未実装です。</li>',
      '</ul>',
      '</section>'
    ].join("");

    const main = findMainContainer();
    main.appendChild(section);
  }

  function openFamilyLegacyAiScreen() {
    createScreen();
    const screen = document.getElementById(SCREEN_ID);
    if (screen) {
      screen.scrollIntoView({ behavior: "smooth", block: "start" });
      screen.setAttribute("tabindex", "-1");
      screen.focus({ preventScroll: true });
    }
  }

  function init() {
    if (!document.body) return;
    createMenuEntry();
    createScreen();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.FamilyLegacyAI_I3_UI_SHELL = {
    featureId: FEATURE_ID,
    open: openFamilyLegacyAiScreen
  };
})();
// FAMILY_LEGACY_AI_I3_UI_SHELL_END
