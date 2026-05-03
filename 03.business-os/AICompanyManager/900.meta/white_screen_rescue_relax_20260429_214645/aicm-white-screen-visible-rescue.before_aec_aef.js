(function () {
  "use strict";

  var MARK = "__AICM_WHITE_SCREEN_VISIBLE_RESCUE_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var startedAt = new Date().toISOString();
  var events = [];

  function now() {
    return new Date().toISOString();
  }

  function push(type, detail) {
    events.push({
      at: now(),
      type: type,
      detail: detail || {}
    });
    if (events.length > 80) events.shift();
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

  function getBodyText() {
    if (!document.body) return "";
    return s(document.body.innerText || document.body.textContent || "").replace(/\s+/g, " ").trim();
  }

  function hasExpectedUiText(text) {
    return /AI企業|AICompanyManager|会社|ダッシュボード|President|Manager|Leader|Worker|ウルフ/.test(text || "");
  }

  function bodyLooksBlank() {
    if (!document.body) return true;
    var text = getBodyText();
    if (text.length < 20) return true;
    if (!hasExpectedUiText(text) && text.length < 120) return true;
    return false;
  }

  function scriptListText() {
    var nodes = Array.prototype.slice.call(document.scripts || []);
    return nodes.map(function (x, i) {
      return (i + 1) + ". " + (x.src || "[inline]");
    }).join("\n");
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

  function ensureRoot() {
    if (!document.body) return null;
    var root = document.getElementById("aicm-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "aicm-root";
      document.body.appendChild(root);
      push("root-created", { id: "aicm-root" });
    }
    return root;
  }

  function clearHardBlanking() {
    if (!document.body) return;
    try {
      document.body.hidden = false;
      document.body.removeAttribute("hidden");
      document.body.removeAttribute("aria-hidden");
      document.body.style.display = "";
      document.body.style.visibility = "";
      document.body.style.opacity = "";
      document.documentElement.style.display = "";
      document.documentElement.style.visibility = "";
      document.documentElement.style.opacity = "";
    } catch (err) {
      push("clearHardBlanking-error", { message: s(err && err.message || err) });
    }
  }

  function buildPanel(reason) {
    clearHardBlanking();
    ensureRoot();

    var old = document.getElementById("aicm-white-screen-rescue-panel");
    if (old) old.remove();

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
      "overflow:auto",
      "white-space:normal"
    ].join(";");

    var bodyText = getBodyText();

    panel.innerHTML = [
      "<h1 style='font-size:18px;margin:0 0 8px;'>AICompanyManager 白画面レスキュー</h1>",
      "<p style='margin:0 0 8px;'>画面描画が空、またはJSが途中停止しています。下の診断情報を貼ってください。</p>",
      "<p style='margin:0 0 8px;'><b>reason:</b> " + esc(reason || "unknown") + "</p>",
      "<p style='margin:0 0 8px;'><b>startedAt:</b> " + esc(startedAt) + "</p>",
      "<p style='margin:0 0 8px;'><b>url:</b> " + esc(location.href) + "</p>",
      "<p style='margin:0 0 8px;'><b>bodyTextLength:</b> " + esc(String(bodyText.length)) + "</p>",
      "<div style='display:flex;gap:8px;flex-wrap:wrap;margin:8px 0;'>",
      "<button id='aicm-rescue-show' style='padding:8px;border-radius:8px;border:1px solid #7f1d1d;background:#fff;'>UI再表示</button>",
      "<button id='aicm-rescue-root' style='padding:8px;border-radius:8px;border:1px solid #7f1d1d;background:#fff;'>root復旧</button>",
      "<button id='aicm-rescue-hide' style='padding:8px;border-radius:8px;border:1px solid #7f1d1d;background:#fff;'>このパネルを閉じる</button>",
      "</div>",
      "<details open><summary><b>Captured errors / events</b></summary>",
      "<pre style='white-space:pre-wrap;background:#fff;color:#111;padding:8px;border-radius:8px;max-height:220px;overflow:auto;'>" + esc(eventText()) + "</pre>",
      "</details>",
      "<details><summary><b>Loaded scripts</b></summary>",
      "<pre style='white-space:pre-wrap;background:#fff;color:#111;padding:8px;border-radius:8px;max-height:220px;overflow:auto;'>" + esc(scriptListText()) + "</pre>",
      "</details>",
      "<details><summary><b>Body text head</b></summary>",
      "<pre style='white-space:pre-wrap;background:#fff;color:#111;padding:8px;border-radius:8px;max-height:160px;overflow:auto;'>" + esc(bodyText.slice(0, 1200)) + "</pre>",
      "</details>"
    ].join("");

    document.body.appendChild(panel);

    var showBtn = document.getElementById("aicm-rescue-show");
    if (showBtn) {
      showBtn.onclick = function () {
        clearHardBlanking();
        ensureRoot();
        if (window.AICMCompanySettingsSafeController && typeof window.AICMCompanySettingsSafeController.show === "function") {
          window.AICMCompanySettingsSafeController.show();
          push("manual-safe-controller-show", {});
        } else {
          push("manual-safe-controller-missing", {});
        }
        setTimeout(function () { buildPanel("manual-ui-show-after"); }, 100);
      };
    }

    var rootBtn = document.getElementById("aicm-rescue-root");
    if (rootBtn) {
      rootBtn.onclick = function () {
        clearHardBlanking();
        ensureRoot();
        push("manual-root-recovery", {});
        setTimeout(function () { buildPanel("manual-root-recovery-after"); }, 100);
      };
    }

    var hideBtn = document.getElementById("aicm-rescue-hide");
    if (hideBtn) {
      hideBtn.onclick = function () {
        var p = document.getElementById("aicm-white-screen-rescue-panel");
        if (p) p.remove();
      };
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
      setTimeout(function () { buildPanel("resource-error"); }, 0);
      return;
    }

    push("window-error", {
      message: s(ev.message),
      filename: s(ev.filename),
      lineno: ev.lineno || 0,
      colno: ev.colno || 0,
      stack: s(ev.error && ev.error.stack).slice(0, 2000)
    });

    setTimeout(function () { buildPanel("window-error"); }, 0);
  }, true);

  window.addEventListener("unhandledrejection", function (ev) {
    push("unhandledrejection", {
      reason: s(ev.reason && (ev.reason.stack || ev.reason.message) || ev.reason).slice(0, 2000)
    });
    setTimeout(function () { buildPanel("unhandledrejection"); }, 0);
  });

  function tick(reason) {
    clearHardBlanking();
    if (bodyLooksBlank()) {
      buildPanel(reason || "blank-detected");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    push("DOMContentLoaded", { readyState: document.readyState });
    setTimeout(function () { tick("DOMContentLoaded-100ms"); }, 100);
    setTimeout(function () { tick("DOMContentLoaded-800ms"); }, 800);
    setTimeout(function () { tick("DOMContentLoaded-2000ms"); }, 2000);
  });

  setTimeout(function () { tick("startup-300ms"); }, 300);
  setTimeout(function () { tick("startup-1500ms"); }, 1500);
  setTimeout(function () { tick("startup-3500ms"); }, 3500);

  var count = 0;
  var timer = setInterval(function () {
    count += 1;
    if (count > 20) {
      clearInterval(timer);
      return;
    }
    if (bodyLooksBlank()) buildPanel("interval-blank-check-" + count);
  }, 1000);

  window.AICMWhiteScreenRescue = {
    events: function () { return events.slice(); },
    show: function () { buildPanel("manual-window-call"); },
    text: function () { return getBodyText(); }
  };

  push("rescue-installed", { href: location.href });
})();
