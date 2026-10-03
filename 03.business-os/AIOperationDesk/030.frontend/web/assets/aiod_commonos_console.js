(function (global) {
  "use strict";

  var ROOT_ID = "aiodCommonOsConsoleRoot";
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

  function chipGroup(rt, items) {
    return rt.inline(
      (items || []).map(function (item) {
        return rt.statusChip({
          label: item.label,
          kind: item.kind || "info"
        });
      }),
      "aiod-console-chip-group"
    );
  }

  function listTarget(rt, id) {
    return rt.el(
      "div",
      {
        id: id,
        className: "aiod-console-list-target"
      },
      []
    );
  }

  function debugTarget(rt, id) {
    return rt.el(
      "pre",
      {
        id: id,
        className: "aiod-console-debug",
        textContent: ""
      },
      []
    );
  }

  function metric(rt, title, id) {
    return rt.card({
      title: title,
      body: rt.el(
        "div",
        {
          id: id,
          className: "aiod-console-metric",
          textContent: "0"
        },
        []
      )
    });
  }

  function grid(rt, columns, children) {
    return rt.el(
      "div",
      {
        className:
          "aiod-console-grid aiod-console-grid--" +
          String(columns)
      },
      children
    );
  }

  function mainModel(rt) {
    return {
      title: "Main Console",
      subtitle: "PC-first heavy operation surface",
      navItems: [
        { label: "Home", href: "../index.html", current: false },
        { label: "Queue Board", href: "./queue_board.html", current: false },
        { label: "Review Inbox", href: "./review_inbox.html", current: false },
        { label: "Approval Inbox", href: "./approval_inbox.html", current: false },
        { label: "Failure Center", href: "./failure_retry_center.html", current: false },
        { label: "Summary Center", href: "./summary_center.html", current: false },
        { label: "Registry Manager", href: "./registry_manager.html", current: false },
        { label: "Notification Settings", href: "./notification_settings.html", current: false },
        { label: "Resident Monitor", href: "./resident_surface_monitor.html", current: false }
      ],
      sections: [
        {
          title: "Operation Status",
          body: grid(rt, 3, [
            metric(rt, "Review Pending", "reviewPendingCount"),
            metric(rt, "Approval Pending", "approvalPendingCount"),
            metric(rt, "Running Jobs", "runningJobsCount"),
            metric(rt, "Failed Jobs", "failedJobsCount"),
            metric(rt, "Summary Ready", "summaryReadyCount"),
            rt.card({
              title: "Status",
              body: chipGroup(rt, [
                { label: "stub live", kind: "success" },
                { label: "route split", kind: "info" }
              ])
            })
          ])
        },
        {
          title: "Current Data",
          body: grid(rt, 2, [
            rt.card({
              title: "Queue Snapshot",
              body: listTarget(rt, "queueBoardList")
            }),
            rt.card({
              title: "API Health",
              body: debugTarget(rt, "apiHealthBox")
            })
          ])
        }
      ]
    };
  }

  function queueModel(rt) {
    return {
      title: "Queue Board",
      subtitle: "waiting / ready / running / failed / summary buckets",
      navItems: [
        {
          label: "Main Console",
          href: "./main_console.html",
          current: false
        }
      ],
      sections: [
        {
          title: "Queue Buckets",
          body: chipGroup(rt, [
            { label: "waiting_trigger" },
            { label: "review_pending" },
            { label: "approval_pending" },
            { label: "ready" },
            { label: "running" },
            { label: "failed_retryable", kind: "danger" },
            { label: "failed_manual_attention", kind: "warning" },
            { label: "completed_recent", kind: "success" },
            { label: "summary_waiting" }
          ])
        },
        {
          title: "Items",
          body: rt.stack(
            [
              listTarget(rt, "queueBoardList"),
              debugTarget(rt, "queueDebugBox")
            ],
            "aiod-console-stack"
          )
        }
      ]
    };
  }

  function listModel(rt, options) {
    return {
      title: options.title,
      subtitle: options.subtitle,
      navItems: [
        {
          label: "Main Console",
          href: "./main_console.html",
          current: false
        }
      ],
      sections: [
        {
          title: options.sectionTitle,
          body: rt.stack(
            [
              listTarget(rt, options.listId),
              debugTarget(rt, options.debugId)
            ],
            "aiod-console-stack"
          )
        }
      ]
    };
  }

  function registryModel(rt) {
    return {
      title: "Supported App Registry Manager",
      subtitle: "onboarding / task types / QA scope / write surfaces",
      navItems: [
        {
          label: "Main Console",
          href: "./main_console.html",
          current: false
        }
      ],
      sections: [
        {
          title: "Registry",
          body: grid(rt, 2, [
            rt.card({
              title: "Seeded Apps",
              body: chipGroup(rt, [
                { label: "ERP" },
                { label: "CIVILIZATION_BUILDER" },
                { label: "PERSONA_BUILDER" },
                { label: "BUSINESS_BUILDER" },
                { label: "LIFE_BUILDER" },
                { label: "GAME_BUILDER" },
                { label: "STREAMING_BUILDER" },
                { label: "STATICART_BUILDER" }
              ])
            }),
            rt.card({
              title: "Managed Areas",
              body: chipGroup(rt, [
                { label: "task_types" },
                { label: "qa_scopes" },
                { label: "write_surfaces" },
                { label: "risk_notes" },
                { label: "operation_guides" },
                { label: "common_errors" }
              ])
            })
          ])
        }
      ]
    };
  }

  function notificationModel(rt) {
    return {
      title: "Notification Settings",
      subtitle: "LINE-like notification bridge preferences",
      navItems: [
        {
          label: "Main Console",
          href: "./main_console.html",
          current: false
        }
      ],
      sections: [
        {
          title: "Notification Events",
          body: chipGroup(rt, [
            { label: "review_pending" },
            { label: "approval_pending" },
            { label: "confirmation_required" },
            { label: "execution_failed", kind: "danger" },
            { label: "retry_scheduled" },
            { label: "completed_with_warning", kind: "warning" },
            { label: "completed_summary_available", kind: "success" }
          ])
        }
      ]
    };
  }

  function residentMonitorModel(rt) {
    return {
      title: "Resident Surface Monitor",
      subtitle: "ERP / Builder resident activity monitoring",
      navItems: [
        {
          label: "Main Console",
          href: "./main_console.html",
          current: false
        }
      ],
      sections: [
        {
          title: "Resident Monitoring",
          body: grid(rt, 2, [
            rt.card({
              title: "Resident Sources",
              body: chipGroup(rt, [
                { label: "erp_resident_surface" },
                { label: "builder_resident_surface" }
              ])
            }),
            rt.card({
              title: "Observed Signals",
              body: chipGroup(rt, [
                { label: "context_snapshot_count" },
                { label: "request_count" },
                { label: "error_help_count" },
                { label: "draft_request_count" }
              ])
            })
          ])
        }
      ]
    };
  }

  function surfaceModel(rt, surface) {
    switch (surface) {
      case "main":
        return mainModel(rt);
      case "queue":
        return queueModel(rt);
      case "review":
        return listModel(rt, {
          title: "Review Inbox",
          subtitle: "review reason driven decision surface",
          sectionTitle: "Review Items",
          listId: "reviewInboxList",
          debugId: "reviewDebugBox"
        });
      case "approval":
        return listModel(rt, {
          title: "Approval Inbox",
          subtitle: "approval reason and risk driven decision surface",
          sectionTitle: "Approval Items",
          listId: "approvalInboxList",
          debugId: "approvalDebugBox"
        });
      case "failure":
        return listModel(rt, {
          title: "Failure Retry Center",
          subtitle: "retry planning and failure inspection",
          sectionTitle: "Failure Items",
          listId: "failureList",
          debugId: "failureDebugBox"
        });
      case "summary":
        return listModel(rt, {
          title: "Summary Center",
          subtitle: "batch summary and digest surface",
          sectionTitle: "Summary Batches",
          listId: "summaryList",
          debugId: "summaryDebugBox"
        });
      case "registry":
        return registryModel(rt);
      case "notification":
        return notificationModel(rt);
      case "resident-monitor":
        return residentMonitorModel(rt);
      default:
        throw new Error(
          "Unsupported AI Operation Desk console surface: " +
          String(surface)
        );
    }
  }

  function surfaceCode() {
    return document.body
      ? document.body.getAttribute("data-aiod-console-surface") || ""
      : "";
  }

  function mount() {
    if (mounted) {
      return provider;
    }

    var root = document.getElementById(ROOT_ID);

    if (!root) {
      throw new Error(
        "AI Operation Desk CommonOS console root is missing"
      );
    }

    provider = requireProvider();
    applyTheme();

    var rt = provider.runtime;
    var surface = surfaceCode();
    var model = surfaceModel(rt, surface);

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
      "data-aiod-console-surface",
      surface
    );

    mounted = true;
    return provider;
  }

  function nodeById(id) {
    mount();
    return document.getElementById(id);
  }

  function setText(id, value) {
    var node = nodeById(id);

    if (node) {
      node.textContent = String(value);
    }
  }

  function setPre(id, value) {
    setText(id, value);
  }

  function renderList(id, items, mapper) {
    var target = nodeById(id);

    if (!target) {
      return;
    }

    var rt = mount().runtime;

    var renderedItems = (items || []).map(function (item) {
      return mapper(item);
    });

    target.replaceChildren(
      rt.list({
        items: renderedItems
      })
    );
  }

  global.AIODCommonOSConsole = {
    mount: mount,
    setText: setText,
    setPre: setPre,
    renderList: renderList
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
