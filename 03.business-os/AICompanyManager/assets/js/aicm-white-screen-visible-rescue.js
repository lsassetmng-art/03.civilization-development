(function () {
  "use strict";

  var MARK = "__AICM_WHITE_SCREEN_PASSIVE_RESCUE_AEC_AEF_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var startedAt = new Date().toISOString();
  var events = [];
  var panelVisible = false;

  function now() {
    return new Date().toISOString();
  }

  function push(type, detail) {
    events.push({
      at: now(),
      type: type,
      detail: detail || {}
    });
    if (events.length > 120) events.shift();
  }

  function s(value) {
    if (value === null || value === undefined) return "";
    return String(value);
  }

  function esc(value) {
    return s(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bodyText() {
    if (!document.body) return "";
    var panel = document.getElementById("aicm-white-screen-rescue-panel");
    var panelText = panel ? s(panel.innerText || panel.textContent || "") : "";
    var text = s(document.body.innerText || document.body.textContent || "");
    if (panelText) text = text.replace(panelText, "");
    return text.replace(/\s+/g, " ").trim();
  }

  function hasExpectedUiText(text) {
    return /AI企業|AICompanyManager|会社|ダッシュボード|部門|課|台帳|President|Manager|Leader|Worker|ウルフ|システム開発部/.test(text || "");
  }

  function appLooksVisible() {
    var text = bodyText();
    if (hasExpectedUiText(text)) return true;

    var root = document.getElementById("aicm-root");
    if (root) {
      var rootText = s(root.innerText || root.textContent || "").replace(/\s+/g, " ").trim();
      if (hasExpectedUiText(rootText)) return true;
      if (root.children && root.children.length > 0 && rootText.length > 80) return true;
    }

    return false;
  }

  function clearHardBlanking() {
    try {
      if (document.documentElement) {
        document.documentElement.hidden = false;
        document.documentElement.removeAttribute("hidden");
        document.documentElement.removeAttribute("aria-hidden");
        document.documentElement.style.display = "";
        document.documentElement.style.visibility = "";
        document.documentElement.style.opacity = "";
      }
      if (document.body) {
        document.body.hidden = false;
        document.body.removeAttribute("hidden");
        document.body.removeAttribute("aria-hidden");
        document.body.style.display = "";
        document.body.style.visibility = "";
        document.body.style.opacity = "";
      }
    } catch (err) {
      push("clearHardBlanking-error", { message: s(err && err.message || err) });
    }
  }

  function removePanel(reason) {
    var panel = document.getElementById("aicm-white-screen-rescue-panel");
    if (panel) panel.remove();
    panelVisible = false;
    push("panel-hidden", { reason: reason || "unknown" });
  }

  function eventText() {
    if (!events.length) return "No captured browser JS error yet.";
    return events.map(function (e, i) {
      return [
        "#" + (i + 1),
        "at: " + e.at,
        "type: " + e.type,
        "detail: " + JSON.stringify(e.detail, null, 2)
      ].join("\n");
    }).join("\n\n");
  }

  function scriptListText() {
    var nodes = Array.prototype.slice.call(document.scripts || []);
    return nodes.map(function (x, i) {
      return (i + 1) + ". " + (x.src || "[inline]");
    }).join("\n");
  }

  function buildPanel(reason, force) {
    clearHardBlanking();

    if (!force && appLooksVisible()) {
      removePanel("app-visible-skip-panel-" + reason);
      return;
    }

    if (!document.body) return;

    var old = document.getElementById("aicm-white-screen-rescue-panel");
    if (old) old.remove();

    var text = bodyText();
    var panel = document.createElement("div");
    panel.id = "aicm-white-screen-rescue-panel";
    panel.style.cssText = [
      "position:fixed",
      "left:8px",
      "right:8px",
      "top:8px",
      "z-index:2147483647",
      "background:#fff1f2",
      "color:#7f1d1d",
      "border:2px solid #ef4444",
      "border-radius:12px",
      "padding:12px",
      "font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      "font-size:13px",
      "line-height:1.45",
      "box-shadow:0 8px 24px rgba(0,0,0,.18)",
      "max-height:82vh",
      "overflow:auto"
    ].join(";");

    panel.innerHTML = [
      "<h1 style='font-size:18px;margin:0 0 8px;'>AICompanyManager 白画面レスキュー</h1>",
      "<p style='margin:0 0 8px;'>本当に白画面の場合だけ表示します。UIが見えている場合は閉じて操作を続けてください。</p>",
      "<p><b>reason:</b> " + esc(reason || "unknown") + "</p>",
      "<p><b>startedAt:</b> " + esc(startedAt) + "</p>",
      "<p><b>url:</b> " + esc(location.href) + "</p>",
      "<p><b>bodyTextLengthWithoutPanel:</b> " + esc(String(text.length)) + "</p>",
      "<div style='display:flex;gap:8px;flex-wrap:wrap;margin:8px 0;'>",
      "<button id='aicm-rescue-close' style='padding:8px;border-radius:8px;border:1px solid #7f1d1d;background:#fff;'>閉じる</button>",
      "<button id='aicm-rescue-show-ui' style='padding:8px;border-radius:8px;border:1px solid #7f1d1d;background:#fff;'>UI再表示</button>",
      "<button id='aicm-rescue-copy-text' style='padding:8px;border-radius:8px;border:1px solid #7f1d1d;background:#fff;'>診断を表示</button>",
      "</div>",
      "<details open><summary><b>Captured errors / events</b></summary>",
      "<pre style='white-space:pre-wrap;background:#fff;color:#111;padding:8px;border-radius:8px;max-height:220px;overflow:auto;'>" + esc(eventText()) + "</pre>",
      "</details>",
      "<details><summary><b>Loaded scripts</b></summary>",
      "<pre style='white-space:pre-wrap;background:#fff;color:#111;padding:8px;border-radius:8px;max-height:220px;overflow:auto;'>" + esc(scriptListText()) + "</pre>",
      "</details>",
      "<details><summary><b>Body text head without panel</b></summary>",
      "<pre style='white-space:pre-wrap;background:#fff;color:#111;padding:8px;border-radius:8px;max-height:180px;overflow:auto;'>" + esc(text.slice(0, 1600)) + "</pre>",
      "</details>"
    ].join("");

    document.body.appendChild(panel);
    panelVisible = true;

    var closeBtn = document.getElementById("aicm-rescue-close");
    if (closeBtn) closeBtn.onclick = function () { removePanel("manual-close"); };

    var showBtn = document.getElementById("aicm-rescue-show-ui");
    if (showBtn) {
      showBtn.onclick = function () {
        clearHardBlanking();
        if (window.AICMCompanySettingsSafeController && typeof window.AICMCompanySettingsSafeController.show === "function") {
          window.AICMCompanySettingsSafeController.show();
          push("safe-controller-show-called", {});
        } else {
          push("safe-controller-missing", {});
        }
        setTimeout(function () {
          if (appLooksVisible()) removePanel("manual-show-ui-visible");
          else buildPanel("manual-show-ui-still-blank", true);
        }, 250);
      };
    }

    var copyBtn = document.getElementById("aicm-rescue-copy-text");
    if (copyBtn) {
      copyBtn.onclick = function () {
        alert(
          "AICM Rescue Diagnostic\n\n" +
          "url=" + location.href + "\n" +
          "bodyTextLengthWithoutPanel=" + bodyText().length + "\n\n" +
          eventText().slice(0, 2500)
        );
      };
    }
  }

  function delayedBlankCheck(reason) {
    clearHardBlanking();
    if (appLooksVisible()) {
      if (panelVisible) removePanel("app-visible-" + reason);
      return;
    }

    var text = bodyText();
    if (text.length < 20) {
      buildPanel(reason || "delayed-blank-check", false);
    }
  }

  window.addEventListener("error", function (ev) {
    var target = ev.target;
    if (target && target !== window && (target.tagName === "SCRIPT" || target.tagName === "LINK" || target.tagName === "IMG")) {
      push("resource-error", {
        tag: target.tagName,
        src: target.src || target.href || "",
        outer: s(target.outerHTML).slice(0, 500)
      });
      setTimeout(function () { buildPanel("resource-error", true); }, 0);
      return;
    }

    push("window-error", {
      message: s(ev.message),
      filename: s(ev.filename),
      lineno: ev.lineno || 0,
      colno: ev.colno || 0,
      stack: s(ev.error && ev.error.stack).slice(0, 2000)
    });

    setTimeout(function () { buildPanel("window-error", true); }, 0);
  }, true);

  window.addEventListener("unhandledrejection", function (ev) {
    push("unhandledrejection", {
      reason: s(ev.reason && (ev.reason.stack || ev.reason.message) || ev.reason).slice(0, 2000)
    });
    setTimeout(function () { buildPanel("unhandledrejection", true); }, 0);
  });

  document.addEventListener("click", function (ev) {
    var target = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button'], [data-screen]") : null;
    if (!target) return;
    var label = s(target.innerText || target.textContent || target.value || target.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
    var ds = s(target.getAttribute("data-screen") || "");
    if (/AI企業設定|AI企業を表示|会社を変更|企業変更|会社削除/.test(label) || /company|dashboard/.test(ds)) {
      push("company-click", { label: label, dataScreen: ds, href: s(target.getAttribute("href") || "") });
      setTimeout(function () { delayedBlankCheck("after-company-click-700ms"); }, 700);
      setTimeout(function () { delayedBlankCheck("after-company-click-1800ms"); }, 1800);
    }
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    push("DOMContentLoaded", { readyState: document.readyState });
    setTimeout(function () { delayedBlankCheck("DOMContentLoaded-2500ms"); }, 2500);
    setTimeout(function () { delayedBlankCheck("DOMContentLoaded-5000ms"); }, 5000);
  });

  setTimeout(function () { delayedBlankCheck("startup-3000ms"); }, 3000);
  setTimeout(function () { delayedBlankCheck("startup-6000ms"); }, 6000);

  window.AICMWhiteScreenRescue = {
    events: function () { return events.slice(); },
    show: function () { buildPanel("manual-window-call", true); },
    hide: function () { removePanel("manual-window-hide"); },
    text: function () { return bodyText(); },
    visible: function () { return appLooksVisible(); }
  };

  push("passive-rescue-installed", { href: location.href });
})();
