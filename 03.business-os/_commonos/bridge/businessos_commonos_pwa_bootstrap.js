(function () {
  "use strict";

  if (window.__businessosCommonOSPwaBootstrapInstalled) return;
  window.__businessosCommonOSPwaBootstrapInstalled = true;

  var params = new URLSearchParams(window.location.search);

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function query(name) {
    return text(params.get(name));
  }

  function readStorage(name) {
    try {
      return text(window.localStorage.getItem(name));
    } catch (_) {
      return "";
    }
  }

  function normalizeLocale(value) {
    var locale = text(value).toLowerCase();

    if (locale === "en" || locale === "en-us") {
      return "en-us";
    }

    return "ja-jp";
  }

  function resolveAppCode() {
    var meta = document.querySelector('meta[name="businessos-app-code"]');
    return meta ? text(meta.getAttribute("content")) : "";
  }

  function standalone() {
    try {
      return Boolean(
        (window.matchMedia &&
          window.matchMedia("(display-mode: standalone)").matches) ||
        window.navigator.standalone === true
      );
    } catch (_) {
      return false;
    }
  }

  var locale = normalizeLocale(
    query("language_code") ||
    readStorage("portal.locale") ||
    document.documentElement.lang ||
    "ja-jp"
  );

  var context = Object.freeze({
    appCode: resolveAppCode(),
    locale: locale,
    civilizationId: query("civilization_id"),
    ownerCivilizationId: query("owner_civilization_id"),
    workspaceId: query("workspace_id"),
    returnTo: query("return_to"),
    launchTrigger: "app_launch",
    standalone: standalone()
  });

  document.documentElement.lang =
    locale === "en-us" ? "en" : "ja";

  window.BusinessOSCommonOSPwaContext = context;

  try {
    window.dispatchEvent(
      new CustomEvent("businessos:commonos-pwa-bootstrap", {
        detail: context
      })
    );
  } catch (_) {
    // No visible fallback is required.
  }

  var deferredInstallPrompt = null;

  window.BusinessOSPwaInstall = {
    canPrompt: function () {
      return Boolean(deferredInstallPrompt);
    },

    isStandalone: standalone,

    prompt: function () {
      var promptEvent = deferredInstallPrompt;

      if (!promptEvent) {
        return Promise.resolve({
          outcome: "unavailable",
          platform: ""
        });
      }

      deferredInstallPrompt = null;

      return Promise.resolve(promptEvent.prompt())
        .then(function () {
          return promptEvent.userChoice;
        })
        .then(function (choice) {
          return choice || {
            outcome: "unknown",
            platform: ""
          };
        });
    }
  };

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;

    try {
      window.dispatchEvent(
        new CustomEvent("businessos:pwa-install-available", {
          detail: {
            appCode: context.appCode
          }
        })
      );
    } catch (_) {}
  });

  window.addEventListener("appinstalled", function () {
    deferredInstallPrompt = null;

    try {
      window.dispatchEvent(
        new CustomEvent("businessos:pwa-installed", {
          detail: {
            appCode: context.appCode
          }
        })
      );
    } catch (_) {}
  });
})();
