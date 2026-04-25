window.AICM_QUEUE = {
  storageKey: "aicm.localQueue.v1",

  load: function () {
    try {
      var raw = window.localStorage.getItem(window.AICM_QUEUE.storageKey);
      if (!raw) {
        return JSON.parse(JSON.stringify(window.AICM_MOCK_DATA.queue || []));
      }
      return JSON.parse(raw);
    } catch (error) {
      return JSON.parse(JSON.stringify(window.AICM_MOCK_DATA.queue || []));
    }
  },

  save: function (items) {
    try {
      window.localStorage.setItem(window.AICM_QUEUE.storageKey, JSON.stringify(items));
    } catch (error) {
      return false;
    }
    return true;
  },

  createItem: function (type, payload, detail) {
    return {
      id: "queue-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
      type: type,
      status: "pending",
      detail: detail || type,
      payload: payload || {},
      retry_count: 0,
      error_code: null,
      conflict_code: null,
      created_at: new Date().toISOString(),
      synced_at: null,
      resolved_at: null
    };
  },

  add: function (state, type, payload, detail) {
    var item = window.AICM_QUEUE.createItem(type, payload, detail);
    var next = state.queue.slice();
    next.unshift(item);
    state.queue = next;
    window.AICM_QUEUE.save(state.queue);
    return item;
  },

  syncPending: function (state) {
    state.queue = state.queue.map(function (item) {
      if (item.status === "pending") {
        return Object.assign({}, item, {
          status: "synced",
          synced_at: new Date().toISOString()
        });
      }
      return item;
    });
    window.AICM_QUEUE.save(state.queue);
    return state.queue;
  },

  failPending: function (state) {
    var changed = false;
    state.queue = state.queue.map(function (item) {
      if (!changed && item.status === "pending") {
        changed = true;
        return Object.assign({}, item, {
          status: "failed",
          error_code: "aiworker_unavailable",
          retry_count: item.retry_count + 1,
          detail: item.detail + " / simulated failure"
        });
      }
      return item;
    });

    if (!changed) {
      state.queue.unshift({
        id: "queue-failed-" + Date.now(),
        type: "pipeline_snapshot_pull",
        status: "failed",
        detail: "同期失敗シミュレーション",
        payload: {},
        retry_count: 1,
        error_code: "aiworker_unavailable",
        conflict_code: null,
        created_at: new Date().toISOString(),
        synced_at: null,
        resolved_at: null
      });
    }

    window.AICM_QUEUE.save(state.queue);
    return state.queue;
  },

  retryFailed: function (state) {
    state.queue = state.queue.map(function (item) {
      if (item.status === "failed") {
        return Object.assign({}, item, {
          status: "synced",
          synced_at: new Date().toISOString(),
          detail: item.detail + " / retry success"
        });
      }
      return item;
    });
    window.AICM_QUEUE.save(state.queue);
    return state.queue;
  },

  createConflict: function (state) {
    state.queue.unshift({
      id: "queue-conflict-" + Date.now(),
      type: "human_approval_submit",
      status: "conflict",
      detail: "修正依頼後に承認が送られた競合シミュレーション",
      payload: {
        approval_id: "mock-approval-conflict",
        approval_status: "approved"
      },
      retry_count: 0,
      error_code: null,
      conflict_code: "approval_after_revision",
      created_at: new Date().toISOString(),
      synced_at: null,
      resolved_at: null
    });
    window.AICM_QUEUE.save(state.queue);
    return state.queue;
  },

  resolveConflict: function (state) {
    state.queue = state.queue.map(function (item) {
      if (item.status === "conflict") {
        return Object.assign({}, item, {
          status: "synced",
          resolved_at: new Date().toISOString(),
          detail: item.detail + " / human resolved"
        });
      }
      return item;
    });
    window.AICM_QUEUE.save(state.queue);
    return state.queue;
  },

  list: function (state) {
    return state.queue || [];
  }
};
