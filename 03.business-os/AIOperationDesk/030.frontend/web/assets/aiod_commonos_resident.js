(function (global) {
  "use strict";

  var ROOT_ID = "aiodCommonOsResidentRoot";
  var mounted = false;
  var provider = null;

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

  function residentSurfaceCode() {
    return document.body
      ? document.body.getAttribute("data-aiod-resident-surface") || ""
      : "";
  }

  function outputTarget(rt) {
    return rt.el(
      "pre",
      {
        id: "residentActionOutput",
        className: "aiod-resident-output",
        textContent: ""
      },
      []
    );
  }

  function actionButton(rt, label, action) {
    var node = rt.button({
      label: label,
      kind: "secondary"
    });

    node.setAttribute("data-stub-action", action);
    return node;
  }

  function actionGrid(rt, actions) {
    return rt.el(
      "div",
      {
        className: "aiod-resident-action-grid"
      },
      actions.map(function (item) {
        return actionButton(rt, item.label, item.action);
      })
    );
  }

  function chipGroup(rt, items) {
    return rt.inline(
      items.map(function (item) {
        return rt.statusChip({
          label: item.label,
          kind: item.kind || "info"
        });
      }),
      "aiod-resident-chip-group"
    );
  }

  function contextTable(rt, rows) {
    return rt.table({
      columns: ["Context", "Value"],
      rows: rows
    });
  }

  function setNodeId(node, id) {
    node.id = id;
    return node;
  }

  function requestForm(
    rt,
    surfaceType,
    supportedAppCode,
    defaultText
  ) {
    var surface = rt.selectField({
      id: "surfaceType",
      label: "surface_type",
      options: [
        {
          value: surfaceType,
          label: surfaceType,
          selected: true
        }
      ]
    });

    var app = rt.selectField({
      id: "supportedAppCode",
      label: "supported_app_code",
      options: [
        {
          value: supportedAppCode,
          label: supportedAppCode,
          selected: true
        }
      ]
    });

    var lane = rt.selectField({
      id: "laneType",
      label: "lane_type",
      options: [
        { value: "consult", label: "consult", selected: true },
        { value: "draft", label: "draft" },
        { value: "execution", label: "execution" }
      ]
    });

    var requestText = rt.textArea({
      id: "requestText",
      label: "request_text",
      value: defaultText
    });

    var submit = setNodeId(
      rt.button({
        label: "Compile Request via API",
        kind: "primary"
      }),
      "stubResidentSubmit"
    );

    return rt.stack(
      [
        rt.el(
          "div",
          { className: "aiod-resident-form-grid" },
          [surface, app, lane]
        ),
        requestText,
        rt.inline(
          [submit],
          "aiod-resident-submit-row"
        ),
        outputTarget(rt)
      ],
      "aiod-resident-form"
    );
  }

  function builderQuickModel(rt) {
    return {
      title: "Builder Quick Panel",
      subtitle: "quick actions inside Builder resident support",
      navItems: [
        {
          label: "Builder Resident",
          href: "./builder_resident.html",
          current: false
        }
      ],
      sections: [
        {
          title: "Quick Actions",
          body: actionGrid(rt, [
            {
              label: "Explain Builder Screen",
              action: "builder_screen_explain"
            },
            {
              label: "Explain Field",
              action: "builder_field_explain"
            },
            {
              label: "Builder Operation QA",
              action: "builder_operation_qa"
            },
            {
              label: "Draft Assist",
              action: "builder_draft_assist"
            },
            {
              label: "Execution Request",
              action: "builder_execution_request"
            }
          ])
        },
        {
          title: "Selection",
          body: outputTarget(rt)
        }
      ]
    };
  }

  function erpQuickModel(rt) {
    return {
      title: "ERP Quick Panel",
      subtitle: "quick actions inside ERP resident support",
      navItems: [
        {
          label: "ERP Resident",
          href: "./erp_resident.html",
          current: false
        }
      ],
      sections: [
        {
          title: "Quick Actions",
          body: actionGrid(rt, [
            {
              label: "Explain Screen",
              action: "explain_screen"
            },
            {
              label: "Explain Field",
              action: "explain_field"
            },
            {
              label: "Operation QA",
              action: "operation_qa"
            },
            {
              label: "Error Help",
              action: "error_help"
            },
            {
              label: "Provisional Voucher",
              action: "provisional_voucher"
            },
            {
              label: "Execution Request",
              action: "execution_request"
            }
          ])
        },
        {
          title: "Selection",
          body: outputTarget(rt)
        }
      ]
    };
  }

  function builderResidentModel(rt) {
    return {
      title: "Builder Resident Surface",
      subtitle: "Lightweight in-context support inside Builder families",
      navItems: [
        { label: "Home", href: "../index.html", current: false },
        {
          label: "Main Console",
          href: "../console/main_console.html",
          current: false
        },
        {
          label: "Quick Panel",
          href: "./builder_quick_panel.html",
          current: false
        }
      ],
      sections: [
        {
          title: "Quick Actions",
          body: chipGroup(rt, [
            { label: "explain builder screen" },
            { label: "explain field" },
            { label: "builder operation QA" },
            { label: "draft assist" },
            { label: "execution request" }
          ])
        },
        {
          title: "Context Snapshot",
          body: contextTable(rt, [
            ["surface", "builder_resident_surface"],
            ["screen", "BUILDER_ASSET_DETAIL"],
            ["module", "BUILDER_LAYOUT"],
            ["record", "asset_demo_001"],
            ["field", "asset_name"]
          ])
        },
        {
          title: "Resident Request Form",
          body: requestForm(
            rt,
            "builder_resident_surface",
            "BUSINESS_BUILDER",
            "このBuilder操作を教えて"
          )
        }
      ]
    };
  }

  function erpResidentModel(rt) {
    return {
      title: "ERP Resident Surface",
      subtitle: "Lightweight in-context support inside ERP",
      navItems: [
        { label: "Home", href: "../index.html", current: false },
        {
          label: "Main Console",
          href: "../console/main_console.html",
          current: false
        },
        {
          label: "Quick Panel",
          href: "./erp_quick_panel.html",
          current: false
        }
      ],
      sections: [
        {
          title: "Quick Actions",
          body: chipGroup(rt, [
            { label: "explain this screen" },
            { label: "explain this field" },
            { label: "operation QA" },
            { label: "error help", kind: "warning" },
            { label: "provisional voucher" },
            { label: "execution request" }
          ])
        },
        {
          title: "Context Snapshot",
          body: contextTable(rt, [
            ["surface", "erp_resident_surface"],
            ["screen", "ERP_VOUCHER_DETAIL"],
            ["module", "ERP_ACCOUNTING"],
            ["company", "demo_company"],
            ["latest error", "ERP_REQUIRED_FIELD_MISSING"]
          ])
        },
        {
          title: "Resident Request Form",
          body: requestForm(
            rt,
            "erp_resident_surface",
            "ERP",
            "この項目を説明して"
          )
        }
      ]
    };
  }

  function modelForSurface(rt, surface) {
    switch (surface) {
      case "builder-quick":
        return builderQuickModel(rt);
      case "builder-resident":
        return builderResidentModel(rt);
      case "erp-quick":
        return erpQuickModel(rt);
      case "erp-resident":
        return erpResidentModel(rt);
      default:
        throw new Error(
          "Unsupported AI Operation Desk resident surface: " +
          String(surface)
        );
    }
  }

  function mount() {
    if (mounted) {
      return provider;
    }

    var root = document.getElementById(ROOT_ID);

    if (!root) {
      throw new Error(
        "AI Operation Desk CommonOS resident root is missing"
      );
    }

    provider = requireProvider();
    applyTheme();

    var rt = provider.runtime;
    var surface = residentSurfaceCode();
    var model = modelForSurface(rt, surface);

    var shell = provider.shell.createShell({
      title: "AI Operation Desk",
      subtitle: "BusinessOS / CommonOS Provider",
      navItems: model.navItems,
      heroTitle: model.title,
      heroCopy: model.subtitle,
      sections: model.sections
    });

    root.replaceChildren(shell);

    root.setAttribute(
      "data-commonos-provider-connected",
      "true"
    );

    root.setAttribute(
      "data-aiod-resident-surface",
      surface
    );

    mounted = true;
    return provider;
  }

  function nodeById(id) {
    mount();
    return document.getElementById(id);
  }

  function value(id, fallback) {
    var node = nodeById(id);

    if (!node || node.value === undefined || node.value === null) {
      return fallback;
    }

    return node.value || fallback;
  }

  function setOutput(valueToRender) {
    var node = nodeById("residentActionOutput");

    if (node) {
      node.textContent = String(valueToRender);
    }
  }

  function onClick(id, handler) {
    var node = nodeById(id);

    if (!node) {
      return false;
    }

    node.addEventListener("click", handler);
    return true;
  }

  function bindStubActions(handler) {
    mount();

    var buttons = document.querySelectorAll(
      "[data-stub-action]"
    );

    buttons.forEach(function (buttonNode) {
      buttonNode.addEventListener("click", function () {
        var action =
          buttonNode.getAttribute("data-stub-action") ||
          "unknown";

        handler(action);
      });
    });
  }

  global.AIODCommonOSResident = {
    mount: mount,
    nodeById: nodeById,
    value: value,
    setOutput: setOutput,
    onClick: onClick,
    bindStubActions: bindStubActions
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      mount,
      { once: true }
    );
  } else {
    mount();
  }
})(window);
