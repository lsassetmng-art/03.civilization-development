(function (global) {
  "use strict";

  var STATE_META = {
    offline: { label: "offline", kind: "warning", copy: "Device is offline. Local work continues." },
    pending: { label: "pending", kind: "info", copy: "Queued locally and waiting to sync." },
    processing: { label: "processing", kind: "info", copy: "Sync is currently in progress." },
    retry_wait: { label: "retry_wait", kind: "warning", copy: "Waiting before the next retry." },
    sent: { label: "sent", kind: "success", copy: "Latest payload was sent successfully." },
    failed: { label: "failed", kind: "danger", copy: "The last sync attempt failed." },
    conflict: { label: "conflict", kind: "danger", copy: "A conflict requires review before apply." }
  };

  function queueCard(options) {
    var opts = options || {};
    var rt = global.CommonOSRuntime;
    var meta = STATE_META[opts.state] || STATE_META.pending;
    var actions = [];

    if (opts.state === "retry_wait" || opts.state === "failed") {
      actions.push(rt.button({
        label: "Retry now",
        kind: "secondary",
        onClick: opts.onRetry || function () {}
      }));
    }

    if (opts.state === "conflict") {
      actions.push(rt.button({
        label: "Open conflict",
        kind: "danger",
        onClick: opts.onConflict || function () {}
      }));
    }

    return rt.card({
      title: opts.title || ("Queue state: " + meta.label),
      subtitle: opts.subtitle || "Reusable sync presentation",
      body: rt.stack([
        rt.el("div", { className: "cos-sync-state", dataset: { state: opts.state || "pending" } }, [
          rt.el("div", { className: "cos-sync-state__meta" }, [
            rt.statusChip({ label: meta.label, kind: meta.kind }),
            rt.el("strong", { textContent: String(opts.count || 0) + " item(s)" })
          ]),
          rt.el("div", { className: "cos-sync-state__copy", textContent: opts.copy || meta.copy }),
          rt.el("div", { className: "cos-sync-state__actions" }, actions.length ? actions : [
            rt.button({ label: "Details", kind: "ghost", onClick: function () {} })
          ])
        ])
      ])
    });
  }

  function queueGrid(states) {
    var rt = global.CommonOSRuntime;
    return rt.el("div", { className: "cos-sync-grid" }, (states || []).map(function (entry) {
      return queueCard(entry);
    }));
  }

  global.CommonOSSync = {
    STATES: ["offline", "pending", "processing", "retry_wait", "sent", "failed", "conflict"],
    queueCard: queueCard,
    queueGrid: queueGrid
  };
})(window);
