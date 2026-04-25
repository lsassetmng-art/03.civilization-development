window.AICM_COMMONOS_SYNC_PRESENTER = {
  mapStatus: function (queueStatus) {
    var table = {
      pending: {
        presentation: "waiting",
        label: "同期待ち",
        tone: "warn",
        action: "sync"
      },
      syncing: {
        presentation: "syncing",
        label: "同期中",
        tone: "warn",
        action: "wait"
      },
      synced: {
        presentation: "complete",
        label: "同期済み",
        tone: "ok",
        action: "none"
      },
      failed: {
        presentation: "retryable_error",
        label: "再試行可",
        tone: "danger",
        action: "retry"
      },
      conflict: {
        presentation: "needs_human_resolution",
        label: "競合対応",
        tone: "danger",
        action: "resolve"
      },
      cancelled: {
        presentation: "muted",
        label: "取消",
        tone: "muted",
        action: "none"
      }
    };

    return table[queueStatus] || {
      presentation: "unknown",
      label: "不明",
      tone: "warn",
      action: "inspect"
    };
  },

  summarize: function (items) {
    var summary = {
      total: items.length,
      pending: 0,
      synced: 0,
      failed: 0,
      conflict: 0,
      cancelled: 0
    };

    items.forEach(function (item) {
      if (summary[item.status] == null) {
        summary[item.status] = 0;
      }
      summary[item.status] += 1;
    });

    return summary;
  }
};
