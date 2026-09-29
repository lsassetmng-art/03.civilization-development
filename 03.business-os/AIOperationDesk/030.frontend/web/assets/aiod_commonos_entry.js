(function (global) {
  "use strict";

  var ROOT_ID = "aiodCommonOsRoot";

  function requireProvider() {
    var bridge = global.BusinessOSCommonOSProviderBridge;

    if (!bridge || typeof bridge.requireProvider !== "function") {
      throw new Error("BusinessOS CommonOS provider bridge is required");
    }

    return bridge.requireProvider();
  }

  function applyTheme() {
    var presenter = global.BusinessOSCommonOSShell;
    var theme = global.BusinessOSCommonOSThemeTokens;

    if (!presenter || typeof presenter.applyTheme !== "function") {
      throw new Error("BusinessOS CommonOS theme presenter is required");
    }

    presenter.applyTheme(theme || {});
  }

  function paragraph(rt, text) {
    return rt.el(
      "p",
      {
        className: "aiod-entry-copy",
        textContent: text
      },
      []
    );
  }

  function informationCard(rt, title, copy) {
    return rt.card({
      title: title,
      body: paragraph(rt, copy)
    });
  }

  function clearRoot(root) {
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
  }

  function renderEntry() {
    var root = document.getElementById(ROOT_ID);

    if (!root) {
      throw new Error("AI Operation Desk CommonOS root is missing");
    }

    var provider = requireProvider();
    var rt = provider.runtime;

    applyTheme();

    var body = rt.stack(
      [
        informationCard(
          rt,
          "Position",
          "Governed execution hub with resident support for ERP and Builder families."
        ),
        informationCard(
          rt,
          "Mode",
          "Supported-app-only explanation, operation QA, governed request routing."
        ),
        informationCard(
          rt,
          "Summary",
          "Batch summary here, realtime summary on PocketSecretary side."
        )
      ],
      "aiod-entry-grid"
    );

    var shell = provider.shell.createShell({
      title: "AI Operation Desk",
      subtitle: "Implementation stub entry",
      navItems: [
        {
          label: "Main Console",
          href: "./console/main_console.html",
          current: false
        },
        {
          label: "ERP Resident",
          href: "./resident/erp_resident.html",
          current: false
        },
        {
          label: "Builder Resident",
          href: "./resident/builder_resident.html",
          current: false
        }
      ],
      heroTitle: "AI Operation Desk",
      heroCopy:
        "Governed execution hub with resident support for ERP and Builder families.",
      sections: [
        {
          title: "Overview",
          body: body
        }
      ]
    });

    clearRoot(root);
    root.appendChild(shell);

    root.setAttribute(
      "data-commonos-provider-connected",
      "true"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderEntry, {
      once: true
    });
  } else {
    renderEntry();
  }
})(window);
