(function () {
  "use strict";

  var MARK = "__AICM_COMPANY_SETTINGS_UNIFIED_SAFE_CONTROLLER_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  window.__AICM_COMPANY_UI_SAFE_DIAG = window.__AICM_COMPANY_UI_SAFE_DIAG || [];

  function log(event, detail) {
    window.__AICM_COMPANY_UI_SAFE_DIAG.push({
      at: new Date().toISOString(),
      event: event,
      detail: detail || {}
    });
  }

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function textOf(el) {
    if (!el) return "";
    return String(el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || "").replace(/\s+/g, " ").trim();
  }

  function hasAny(text, words) {
    for (var i = 0; i < words.length; i += 1) {
      if (text.indexOf(words[i]) >= 0) return true;
    }
    return false;
  }

  function isElement(el) {
    return !!(el && el.nodeType === 1);
  }

  function clearHide(el) {
    if (!isElement(el)) return;
    try { el.hidden = false; } catch (_) {}
    try { el.removeAttribute("hidden"); } catch (_) {}
    try { el.removeAttribute("aria-hidden"); } catch (_) {}
    try {
      if (el.style) {
        if (el.style.display === "none") el.style.display = "";
        if (el.style.visibility === "hidden") el.style.visibility = "";
        if (el.style.opacity === "0") el.style.opacity = "";
      }
    } catch (_) {}
  }

  function liftVisible(el) {
    var cur = el;
    var guard = 0;
    while (isElement(cur) && cur !== document.documentElement && guard < 20) {
      clearHide(cur);
      if (cur === document.body) break;
      cur = cur.parentElement;
      guard += 1;
    }
  }

  function exactDebugOnlyText(t) {
    if (!t) return false;
    var isDebug = hasAny(t, [
      "BusinessOS DB会社バインド",
      "BusinessOS DB会社ID",
      "DB会社バインド",
      "DB会社ID"
    ]);
    if (!isDebug) return false;

    var isRealCompanyUi = hasAny(t, [
      "AI企業設定",
      "AI企業選択",
      "AI企業を表示",
      "会社概要",
      "会社名",
      "事業領域",
      "会社を変更",
      "企業変更",
      "会社削除"
    ]);

    return !isRealCompanyUi;
  }

  function hideDebugCardsSafely() {
    var nodes = toArray(document.querySelectorAll("section, article, form, div, aside"));
    nodes.forEach(function (node) {
      var t = textOf(node);
      if (!t) return;
      if (exactDebugOnlyText(t)) {
        try {
          node.style.display = "none";
          node.setAttribute("data-aicm-safe-hidden-debug", "true");
        } catch (_) {}
      }
    });
  }

  function removeGarbageOptionsSafely() {
    var selects = toArray(document.querySelectorAll("select"));
    selects.forEach(function (select) {
      var options = toArray(select.querySelectorAll("option"));
      options.forEach(function (opt) {
        var t = textOf(opt);
        var v = String(opt.value || "").trim();
        if ((t === "company" || t === "会社" || t === "BusinessOSなんちゃら") && !v) {
          try { opt.remove(); } catch (_) {}
        }
      });
    });
  }

  function ensureCompanyUiVisible(reason) {
    var body = document.body;
    if (!body) return;

    clearHide(body);

    var root = document.getElementById("aicm-root") || body;
    clearHide(root);

    var words = [
      "AI企業設定",
      "AI企業選択",
      "AI企業を表示",
      "会社概要",
      "会社名",
      "事業領域",
      "会社を追加",
      "会社を変更",
      "企業変更",
      "会社削除",
      "President",
      "Manager",
      "Leader",
      "Worker"
    ];

    var nodes = toArray(document.querySelectorAll("main, section, article, form, div, nav, header, button, a, select, input, label, h1, h2, h3, p, span"));
    var hitCount = 0;

    nodes.forEach(function (node) {
      var t = textOf(node);
      if (hasAny(t, words)) {
        liftVisible(node);
        hitCount += 1;
      }
    });

    hideDebugCardsSafely();
    removeGarbageOptionsSafely();

    log("ensureCompanyUiVisible", {
      reason: reason || "unknown",
      hitCount: hitCount,
      bodyTextLength: textOf(body).length
    });
  }

  function isCompanySettingsTarget(target) {
    if (!target) return false;
    var t = textOf(target);
    var ds = String(target.getAttribute && target.getAttribute("data-screen") || "");
    var href = String(target.getAttribute && target.getAttribute("href") || "");
    return (
      hasAny(t, ["AI企業設定", "AI企業を表示", "AI企業選択", "会社を変更", "企業変更"]) ||
      hasAny(ds, ["company", "company-settings", "company-operation", "dashboard"]) ||
      hasAny(href, ["company", "settings", "dashboard"])
    );
  }

  function isDeleteTarget(target) {
    if (!target) return false;
    var t = textOf(target);
    return hasAny(t, ["会社削除", "企業削除", "削除"]);
  }

  document.addEventListener("click", function (ev) {
    var target = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button'], [data-screen]") : null;
    if (!target) return;

    if (isDeleteTarget(target)) {
      ev.preventDefault();
      log("deleteBlocked", { text: textOf(target) });
      alert("会社削除は現在安全停止中です。次工程で soft delete / inactive 化として実装します。");
      ensureCompanyUiVisible("delete-blocked");
      return;
    }

    if (isCompanySettingsTarget(target)) {
      log("companyTargetClicked", {
        text: textOf(target),
        dataScreen: target.getAttribute("data-screen") || "",
        href: target.getAttribute("href") || ""
      });

      setTimeout(function () {
        ensureCompanyUiVisible("company-target-click-post");
      }, 0);

      setTimeout(function () {
        ensureCompanyUiVisible("company-target-click-post-100ms");
      }, 100);
    }
  }, false);

  document.addEventListener("DOMContentLoaded", function () {
    ensureCompanyUiVisible("DOMContentLoaded");
    setTimeout(function () { ensureCompanyUiVisible("DOMContentLoaded-100ms"); }, 100);
    setTimeout(function () { ensureCompanyUiVisible("DOMContentLoaded-500ms"); }, 500);
  });

  if (document.readyState === "interactive" || document.readyState === "complete") {
    setTimeout(function () { ensureCompanyUiVisible("readyState-" + document.readyState); }, 0);
  }

  window.AICMCompanySettingsSafeController = {
    show: function () { ensureCompanyUiVisible("manual-show"); },
    diag: function () { return window.__AICM_COMPANY_UI_SAFE_DIAG.slice(); }
  };

  log("installed", { version: "v1" });
})();
