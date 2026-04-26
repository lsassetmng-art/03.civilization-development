(function () {
  "use strict";

  var originalMutationObserver = window.MutationObserver;
  var observerCallCount = 0;
  var MAX_OBSERVER_CALLS = 80;
  var lastError = "";

  function showBanner(message) {
    var id = "aicm-freeze-guard-banner";
    var old = document.getElementById(id);
    if (old) {
      old.textContent = message;
      return;
    }

    var banner = document.createElement("div");
    banner.id = id;
    banner.style.cssText = [
      "position:fixed",
      "left:8px",
      "right:8px",
      "bottom:8px",
      "z-index:99999",
      "background:#fff7ed",
      "color:#9a3412",
      "border:1px solid #fed7aa",
      "border-radius:12px",
      "padding:10px",
      "font:14px system-ui",
      "box-shadow:0 4px 16px rgba(0,0,0,.12)"
    ].join(";");
    banner.textContent = message;
    document.body.appendChild(banner);
  }

  window.onerror = function (message, source, lineno, colno) {
    lastError = String(message) + " @ " + String(source) + ":" + String(lineno) + ":" + String(colno);
    showBanner("HTMLエラー: " + lastError);
  };

  window.addEventListener("unhandledrejection", function (event) {
    lastError = event && event.reason ? String(event.reason) : "unknown rejection";
    showBanner("Promiseエラー: " + lastError);
  });

  if (originalMutationObserver) {
    window.MutationObserver = function (callback) {
      var scheduled = false;

      return new originalMutationObserver(function (mutations, observer) {
        if (observerCallCount > MAX_OBSERVER_CALLS) {
          try {
            observer.disconnect();
          } catch (error) {
            /* noop */
          }
          showBanner("HTML停止防止: MutationObserverの過剰発火を停止しました。");
          return;
        }

        if (scheduled) {
          return;
        }

        scheduled = true;

        window.setTimeout(function () {
          observerCallCount += 1;
          scheduled = false;
          callback(mutations, observer);
        }, 80);
      });
    };
  }

  window.AICM_HTML_FREEZE_GUARD = {
    getObserverCallCount: function () {
      return observerCallCount;
    },
    getLastError: function () {
      return lastError;
    },
    showBanner: showBanner
  };
})();
